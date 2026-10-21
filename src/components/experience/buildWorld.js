/**
 * @file buildWorld.js
 * @description Pure builder for the Ninja Adventure world under the flight path.
 * From the route and `worldLayout.js` it produces:
 * - ground: one tile per cell (grass with tufts, autotiled dirt road and lanes,
 *   autotiled river and ponds);
 * - objects: every sprite with its position, sorted back to front;
 * - decals: flat ground details;
 * - conflicts: authored sprites that overlap each other, the road or water (should be
 *   empty; the journey logs them in development).
 * Seeded, so the world is identical on every visit. No React or DOM access here.
 *
 * Grid: columns start at world x = 0; row `baseRow` is centred on the flight line, and
 * the grid bleeds MAP_BLEED_PX above and below the world so tall stages are never bare.
 * Positions are in tiles (half tiles allowed); the canvas uses 16px source tiles.
 */

import { MAP_BLEED_PX } from './sceneryConfig.js';
import { GROUND, SOURCE_TILE, SPRITES } from './spriteAtlas.js';
import { AIRFIELD, DISTRICTS, ROWS, SCATTER } from './worldLayout.js';

/** Occupancy is tracked on a half-tile grid. */
const SUB = 2;

/** Lanes are 2 tiles wide and run from below the road to the bottom of the farmland. */
const LANE_WIDTH = 2;
const LANE_LENGTH = 9;

/**
 * @typedef {Object} PlacedSprite
 * @property {string} sprite - SPRITES key.
 * @property {number} col - Left edge, in tiles from world x = 0.
 * @property {number} row - Top edge, in grid rows.
 * @property {string} [district] - Milestone id, for a district's authored sprites.
 * @property {string} [airfield] - Stop id, for an airfield's sprites.
 */

/**
 * @typedef {Object} World
 * @property {number} cols
 * @property {number} rows
 * @property {number} tileSize - World px per tile.
 * @property {number} originY - World y of row 0 (negative: the map bleeds above the world).
 * @property {number} baseRow - Row centred on the flight line.
 * @property {Array<[string, number, number] | null>} ground - Per cell: [sheet, tileX, tileY].
 * @property {PlacedSprite[]} decals - Flat details, drawn on the ground.
 * @property {PlacedSprite[]} objects - Standing sprites, sorted back to front. Authored ones carry
 *   `district` (milestone id) or `airfield` (stop id) so the life layer can find doors.
 * @property {{ id: string, col: number }[]} anchors - Stops (by milestone id) and the finale.
 * @property {{ col: number, width: number, fromRow: number, toRow: number }[]} lanes - Dirt lanes.
 * @property {string[]} conflicts - Authored overlaps (should be empty).
 */

/**
 * @param {import('./routeGeometry.js').FlightRouteGeometry} route
 * @returns {World}
 */
export function buildWorld(route) {
    const size = route.tileSize;
    const baseRow = Math.ceil((route.baselineY + MAP_BLEED_PX) / size);
    const originY = route.baselineY - size / 2 - baseRow * size;
    const rows = baseRow + Math.ceil((route.height - route.baselineY + MAP_BLEED_PX) / size) + 1;
    const cols = Math.ceil(route.width / size) + 1;
    const random = seededRandom(SCATTER.seed);

    const anchors = [
        ...route.stops.map((stop) => ({ id: stop.milestone.id, col: Math.round(stop.x / size) })),
        { id: 'finale', col: Math.round(route.finale.x / size) }
    ];

    // ---- Ground masks ------------------------------------------------------------------
    const cell = (col, row) => row * cols + col;
    const inGrid = (col, row) => col >= 0 && col < cols && row >= 0 && row < rows;
    const dirt = new Uint8Array(cols * rows);
    const water = new Uint8Array(cols * rows);
    const fill = (mask, col, row, w, h) => {
        for (let r = row; r < row + h; r++) for (let c = col; c < col + w; c++) if (inGrid(c, r)) mask[cell(c, r)] = 1;
    };

    fill(dirt, 0, baseRow + ROWS.roadTop, cols, ROWS.roadBottom - ROWS.roadTop + 1);
    fill(water, 0, baseRow + ROWS.riverTop, cols, ROWS.riverBottom - ROWS.riverTop + 1);

    /** @type {PlacedSprite[]} */
    const authored = [];
    /** @type {{ col: number, width: number, fromRow: number, toRow: number }[]} */
    const lanes = [];

    // An airfield at every stop (not the finale): runway along the flight line + buildings.
    for (const anchor of anchors.slice(0, -1)) {
        const { runway } = AIRFIELD;
        fill(dirt, anchor.col + runway.x, baseRow + runway.y, runway.w, runway.h);
        for (const item of AIRFIELD.objects) {
            authored.push({ sprite: item.sprite, col: anchor.col + item.x, row: baseRow + item.y, airfield: anchor.id });
        }
    }

    for (const anchor of anchors) {
        const district = DISTRICTS[anchor.id];
        if (!district) continue;
        for (const pond of district.ponds ?? []) fill(water, anchor.col + pond.x, baseRow + pond.y, pond.w, pond.h);
        if (district.lane) {
            const laneCol = anchor.col + district.lane.x;
            fill(dirt, laneCol, baseRow + ROWS.roadBottom + 1, LANE_WIDTH, LANE_LENGTH);
            lanes.push({ col: laneCol, width: LANE_WIDTH, fromRow: baseRow + ROWS.roadBottom + 1, toRow: baseRow + ROWS.roadBottom + LANE_LENGTH });
            // The bridge spans the river where the lane crosses it (it may sit on its own lane).
            // Centred on the lane, from the bank above the river to the bank below.
            authored.push({ sprite: 'bridge', col: laneCol + LANE_WIDTH / 2 - 1.5, row: baseRow + ROWS.riverTop - 1, onGround: true });
        }
        for (const item of district.objects ?? []) {
            authored.push({ sprite: item.sprite, col: anchor.col + item.x, row: baseRow + item.y, district: anchor.id });
        }
    }
    // Water wins over dirt (the bridge carries lanes across).
    for (let i = 0; i < dirt.length; i++) if (water[i]) dirt[i] = 0;

    // ---- Occupancy and conflicts ------------------------------------------------------
    const occCols = cols * SUB;
    const occupied = new Uint8Array(occCols * rows * SUB);
    const rectOf = (sprite, col, row) => {
        const [, , w, h] = SPRITES[sprite].rect;
        return { col, row, w, h };
    };
    const forEachSub = ({ col, row, w, h }, pad, visit) => {
        const c0 = Math.floor((col - pad) * SUB);
        const c1 = Math.ceil((col + w + pad) * SUB);
        const r0 = Math.floor((row - pad) * SUB);
        const r1 = Math.ceil((row + h + pad) * SUB);
        for (let r = r0; r < r1; r++) for (let c = c0; c < c1; c++) {
            if (c >= 0 && c < occCols && r >= 0 && r < rows * SUB && visit(r * occCols + c, c, r) === false) return false;
        }
        return true;
    };
    const blockedByGround = ({ col, row, w, h }) => {
        for (let r = Math.floor(row); r < Math.ceil(row + h); r++) {
            for (let c = Math.floor(col); c < Math.ceil(col + w); c++) {
                if (inGrid(c, r) && (dirt[cell(c, r)] || water[cell(c, r)])) return true;
            }
        }
        return false;
    };

    // Reserve the route corridor (route, runways and stop signs; nothing stands there).
    forEachSub({ col: 0, row: baseRow + ROWS.corridorTop, w: cols, h: ROWS.corridorBottom - ROWS.corridorTop + 1 }, 0, (i) => { occupied[i] = 1; });

    const conflicts = [];
    /** @type {PlacedSprite[]} */
    const objects = [];
    for (const item of authored) {
        const rect = rectOf(item.sprite, item.col, item.row);
        const free = forEachSub(rect, 0, (i) => !occupied[i]);
        if (!free || (!item.onGround && blockedByGround(rect))) {
            conflicts.push(`${item.sprite} at col ${item.col}, row ${item.row - baseRow} (from the flight line)`);
        }
        forEachSub(rect, 0, (i) => { occupied[i] = 1; });
        objects.push({ sprite: item.sprite, col: item.col, row: item.row, district: item.district, airfield: item.airfield });
    }

    // ---- Countryside scatter (collision-checked, never overlaps) -----------------------
    const tryPlace = (sprite, col, row) => {
        const [, , w, h] = SPRITES[sprite].rect;
        const rect = { col, row, w, h };
        if (col < 0 || col + w > cols || blockedByGround(rect)) return false;
        if (!forEachSub(rect, SCATTER.gap, (i) => !occupied[i])) return false;
        forEachSub(rect, 0, (i) => { occupied[i] = 1; });
        objects.push({ sprite, col, row });
        return true;
    };

    // Street lamps first, so they keep a regular rhythm along the road.
    const { lamps } = SCATTER;
    for (let col = 2; col < cols; col += lamps.every) tryPlace(lamps.sprite, col, baseRow + lamps.y);

    for (const zone of SCATTER.zones) {
        const names = Object.keys(zone.pool);
        const total = names.reduce((sum, name) => sum + zone.pool[name], 0);
        const pick = () => {
            let roll = random() * total;
            for (const name of names) { roll -= zone.pool[name]; if (roll < 0) return name; }
            return names[names.length - 1];
        };
        for (let r = zone.rows[0]; r <= zone.rows[1]; r += zone.step) {
            for (let c = 0; c < cols; c += zone.step) {
                if (random() >= zone.chance) continue;
                const sprite = pick();
                const h = SPRITES[sprite].rect[3];
                const col = Math.round((c + random() * zone.step * 0.6) * SUB) / SUB;
                // Keep the sprite inside the zone's rows.
                const row = baseRow + Math.min(zone.rows[1] + 1 - h, Math.round((r + random() * zone.step * 0.6) * SUB) / SUB);
                if (row < baseRow + zone.rows[0]) continue;
                tryPlace(sprite, col, row);
            }
        }
    }
    objects.sort((a, b) => (a.row + SPRITES[a.sprite].rect[3]) - (b.row + SPRITES[b.sprite].rect[3]));

    // ---- Ground tiles and decals --------------------------------------------------------
    const ground = new Array(cols * rows);
    /** @type {PlacedSprite[]} */
    const decals = [];
    const { grass } = GROUND;
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const i = cell(col, row);
            if (water[i]) {
                ground[i] = autotile(GROUND.water, water, col, row, cols, rows);
            } else if (dirt[i]) {
                ground[i] = autotile(GROUND.dirt, dirt, col, row, cols, rows);
            } else {
                const tuft = random() < SCATTER.tuftChance;
                const [tx, ty] = tuft ? grass.tufts[Math.floor(random() * grass.tufts.length)] : grass.plain;
                ground[i] = [grass.sheet, tx, ty];
                const sub = (row * SUB) * occCols + col * SUB;
                if (!occupied[sub] && random() < SCATTER.decalChance) {
                    decals.push({ sprite: SCATTER.decals[Math.floor(random() * SCATTER.decals.length)], col, row });
                }
            }
        }
    }

    return { cols, rows, tileSize: size, originY, baseRow, ground, decals, objects, anchors, lanes, conflicts };
}

/**
 * Picks the autotile for one cell of a mask from its four neighbours (outside the grid
 * counts as "same", so the road and river run off both edges) and, for interior cells,
 * its diagonals (inner corners).
 */
function autotile(set, mask, col, row, cols, rows) {
    const at = (c, r) => (c < 0 || c >= cols || r < 0 || r >= rows ? 1 : mask[r * cols + c]);
    const n = at(col, row - 1);
    const e = at(col + 1, row);
    const s = at(col, row + 1);
    const w = at(col - 1, row);
    const [TL, T, TR, L, C, R, BL, B, BR] = set.patch;
    let tile;
    if (n && e && s && w) {
        if (!at(col + 1, row - 1)) tile = set.inner.ne;
        else if (!at(col - 1, row - 1)) tile = set.inner.nw;
        else if (!at(col + 1, row + 1)) tile = set.inner.se;
        else if (!at(col - 1, row + 1)) tile = set.inner.sw;
        else tile = C;
    } else if (e && s && w) tile = T;
    else if (n && e && w) tile = B;
    else if (n && e && s) tile = L;
    else if (n && s && w) tile = R;
    else if (e && s) tile = TL;
    else if (s && w) tile = TR;
    else if (n && e) tile = BL;
    else if (n && w) tile = BR;
    else if (n && s) tile = set.vStrip[1];
    else if (s) tile = set.vStrip[0];
    else if (n) tile = set.vStrip[2];
    else if (e && w) tile = set.hStrip[1];
    else if (e) tile = set.hStrip[0];
    else if (w) tile = set.hStrip[2];
    else tile = set.dot;
    return [set.sheet, tile[0], tile[1]];
}

/** Small, fast, seedable PRNG (mulberry32). */
function seededRandom(seed) {
    let state = seed >>> 0;
    return () => {
        state = (state + 0x6d2b79f5) >>> 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/** Source-pixel rectangle of a sprite on its sheet: [sx, sy, sw, sh]. */
export function spriteSource(sprite) {
    return SPRITES[sprite].rect.map((v) => v * SOURCE_TILE);
}
