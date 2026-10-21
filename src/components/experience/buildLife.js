/**
 * @file buildLife.js
 * @description Pure planner for everything that moves on the map (Phase 11):
 * - `buildAmbientLife`: flags, chimney smoke, water ripples, water wheels, and
 *   townsfolk strolling the road and the lanes;
 * - `planBoarding`: the walk of each skill passenger at one stop, straight from a
 *   district house round to the plane, with the moment each one boards (the stop
 *   card stamps passes at those moments).
 * Positions are world px (feet / top-left as noted). Seeded; no React or DOM here.
 */

import { GROUND, SPRITES } from './spriteAtlas.js';
import { ROWS } from './worldLayout.js';
import {
    AIRFIELD_FLAGS, BOARDING, BUILDINGS, CHARACTERS, DIRECTION, DISTRICT_FLAGS, LIFE_SEED, LOOPS,
    RIPPLE_SHARE, SMOKING, TOWNSFOLK, WATERMILL_OFFSET
} from './lifeConfig.js';

/** Boarding walks are planned on a grid of half tiles, within this many tiles of the stop. */
const WALK_CELL = 0.5;
const WALK_SPAN_TILES = 32;
/** Extra cost of a turn (in cells), so routes keep to a few straight legs. */
const TURN_COST = 0.6;
/** Low decor people can walk past (it would otherwise force long detours round flower beds). */
const WALK_THROUGH = new Set(['sunflower', 'sunflowerB', 'flowerRed', 'flowerWhite', 'bushA', 'bushB', 'bushC', 'bushD']);

/**
 * @typedef {Object} LoopSprite
 * @property {string} key - Unique React key.
 * @property {string} loop - LOOPS key.
 * @property {number} x - Left, world px.
 * @property {number} y - Top, world px.
 * @property {number} delay - Animation phase offset, s (negative = already running).
 */

/**
 * @typedef {Object} Waypoint
 * @property {number} x - Feet x, world px.
 * @property {number} y - Feet y, world px.
 * @property {number} [dir] - Facing while walking to this point (DIRECTION value).
 * @property {number} [pause] - Seconds to stand still on arrival.
 */

/**
 * @typedef {Object} Townsperson
 * @property {string} key
 * @property {string} character - CHARACTERS entry.
 * @property {Waypoint[]} route - Loops back to the start.
 * @property {number} tilesPerSecond
 */

/**
 * @param {import('./buildWorld.js').World} world
 * @param {'phone' | 'tablet' | 'desktop'} profile
 * @returns {{ loops: LoopSprite[], townsfolk: Townsperson[] }}
 */
export function buildAmbientLife(world, profile) {
    const random = seededRandom(LIFE_SEED);
    const { px, rowY } = projector(world);
    const T = world.tileSize;
    const scale = T / 16;
    const loops = [];
    const add = (loop, x, y, key) => loops.push({ key, loop, x, y, delay: -random() * LOOPS[loop].seconds });

    // Flags at every airfield and on some districts.
    for (const anchor of world.anchors.slice(0, -1)) {
        AIRFIELD_FLAGS.forEach((flag, i) => add(flag.loop, px(anchor.col + flag.x), rowY(flag.y), `flag-${anchor.id}-${i}`));
        (DISTRICT_FLAGS[anchor.id] ?? []).forEach((flag, i) => add(flag.loop, px(anchor.col + flag.x), rowY(flag.y), `dflag-${anchor.id}-${i}`));
    }

    // Chimney smoke above the roof, about 60 % across.
    for (const [i, object] of world.objects.entries()) {
        if (!(object.district || object.airfield) || !SMOKING.has(object.sprite)) continue;
        const [, , w] = SPRITES[object.sprite].rect;
        const puff = LOOPS.smoke.fw * scale;
        add('smoke', (object.col + w * 0.6) * T - puff / 2, world.originY + object.row * T - puff * 0.85, `smoke-${i}`);
    }

    // Ripples on open water (tiles that are water on all sides), never under a bridge: they
    // draw above the map, so they would show through it.
    const [cx, cy] = GROUND.water.patch[4];
    const bridges = world.objects.filter((o) => o.sprite === 'bridge').map((o) => {
        const [, , w, h] = SPRITES[o.sprite].rect;
        return [o.col, o.col + w, o.row, o.row + h];
    });
    world.ground.forEach((tile, i) => {
        if (tile[0] !== 'water' || tile[1] !== cx || tile[2] !== cy || random() >= RIPPLE_SHARE[profile]) return;
        const col = i % world.cols;
        const row = Math.floor(i / world.cols);
        if (bridges.some(([l, r, t, b]) => col + 1 > l && col < r && row + 1 > t && row < b)) return;
        add('ripples', col * T, world.originY + row * T, `ripple-${i}`);
    });

    // A water wheel beside each lane's bridge.
    for (const lane of world.lanes) {
        add('watermill', px(lane.col + WATERMILL_OFFSET.x), rowY(ROWS.riverTop + WATERMILL_OFFSET.y), `mill-${lane.col}`);
    }

    // Townsfolk: strolling the road near each stop, and walking each lane over its bridge.
    const townsfolk = [];
    const roadFeet = [ROWS.roadTop + 0.55, ROWS.roadTop + 1.45];
    const pause = () => TOWNSFOLK.pause[0] + random() * (TOWNSFOLK.pause[1] - TOWNSFOLK.pause[0]);
    for (const anchor of world.anchors.slice(0, -1)) {
        for (let i = 0; i < TOWNSFOLK.perDistrict[profile]; i++) {
            const side = i % 2 === 0 ? -1 : 1;
            const from = anchor.col + side * (2 + random() * 3);
            const to = anchor.col + side * (7 + random() * 4);
            const y = rowY(roadFeet[i % 2]);
            townsfolk.push({
                key: `walker-${anchor.id}-${i}`,
                character: CHARACTERS[Math.floor(random() * CHARACTERS.length)],
                tilesPerSecond: TOWNSFOLK.tilesPerSecond * (0.8 + random() * 0.4),
                route: [
                    { x: px(from), y, pause: pause() },
                    { x: px(to), y, dir: to > from ? DIRECTION.right : DIRECTION.left, pause: pause() },
                    { x: px(from), y, dir: to > from ? DIRECTION.left : DIRECTION.right }
                ]
            });
        }
    }
    if (TOWNSFOLK.laneWalkers[profile]) {
        for (const lane of world.lanes) {
            const x = px(lane.col + lane.width / 2);
            townsfolk.push({
                key: `lane-${lane.col}`,
                character: CHARACTERS[Math.floor(random() * CHARACTERS.length)],
                tilesPerSecond: TOWNSFOLK.tilesPerSecond,
                route: [
                    { x, y: world.originY + (lane.fromRow + 0.6) * T, pause: pause() },
                    { x, y: world.originY + (lane.toRow + 0.6) * T, dir: DIRECTION.down, pause: pause() },
                    { x, y: world.originY + (lane.fromRow + 0.6) * T, dir: DIRECTION.up }
                ]
            });
        }
    }

    return { loops, townsfolk };
}

/**
 * @typedef {Object} BoardingWalk
 * @property {string} skill
 * @property {string} character
 * @property {number} start - Seconds after landing when the passenger steps out.
 * @property {Waypoint[]} path - Door → (shortest clear walk) → the plane's door.
 * @property {number} boardAt - Seconds after landing when the passenger is aboard.
 */

/**
 * Each skill walks straight from a house to the plane: out of the door and the shortest
 * way to the plane's door that steps on no sprite (no roofs, trees or fences). Passengers
 * may pass the stop's sign: signs draw above them, so it is never covered.
 * @param {import('./buildWorld.js').World} world
 * @param {number} stopIndex
 * @param {readonly string[]} skills - The stop's skills, in order.
 * @returns {BoardingWalk[]}
 */
export function planBoarding(world, stopIndex, skills) {
    const anchor = world.anchors[stopIndex];
    if (!anchor) return [];
    const { px } = projector(world);
    const T = world.tileSize;
    const speed = BOARDING.tilesPerSecond * T;
    // Absolute map row of a row relative to the flight line.
    const absRow = (row) => world.baseRow + row;

    const houses = world.objects
        .filter((o) => o.district === anchor.id && BUILDINGS.has(o.sprite))
        .map((o) => {
            const [, , w, h] = SPRITES[o.sprite].rect;
            return { left: o.col, right: o.col + w, col: o.col + w / 2, row: o.row + h };
        })
        .sort((a, b) => Math.abs(a.col - anchor.col) - Math.abs(b.col - anchor.col));

    const grid = walkGrid(world, anchor.col, absRow(-0.5), absRow(ROWS.roadBottom + 0.9));

    const seconds = (points) => points.slice(1).reduce((sum, p, i) => sum + Math.hypot(p.x - points[i].x, p.y - points[i].y) / speed, 0);
    const facing = (from, to) => (Math.abs(to.x - from.x) > Math.abs(to.y - from.y)
        ? (to.x > from.x ? DIRECTION.right : DIRECTION.left)
        : (to.y > from.y ? DIRECTION.down : DIRECTION.up));
    const withFacing = (points) => points
        .filter((p, i) => i === 0 || Math.hypot(p.x - points[i - 1].x, p.y - points[i - 1].y) > 1)
        .map((p, i, kept) => (i === 0 ? p : { ...p, dir: facing(kept[i - 1], p) }));

    const lastStartFrom = new Map();
    return skills.map((skill, i) => {
        // Houses nearest the plane first; without houses, walk in along the runway from the side.
        const house = houses.length > 0 ? houses[i % houses.length] : null;
        const side = (house ? house.col : anchor.col + (i % 2 === 0 ? -8 : 8)) < anchor.col ? -1 : 1;
        // The shortest walk (few turns) from just outside the door to the plane's door that
        // steps on no sprite.
        const from = house
            ? { x: house.col, y: house.row + 0.45 }
            : { x: anchor.col + side * 12, y: absRow(ROWS.roadTop + 0.5) };
        const to = { x: anchor.col + side * 0.3, y: absRow(-0.15) };
        const walk = grid.route(from, to);
        const toPx = (p) => ({ x: px(p.x), y: world.originY + p.y * T });
        const path = withFacing([
            ...(house ? [{ x: px(house.col), y: world.originY + (house.row - 0.1) * T }] : []),
            ...walk.map(toPx),
            toPx(to)
        ]);

        // Set off in turn, and never closer than `followGapTiles` behind someone from the same door.
        const doorKey = house ? house.col : side;
        const follow = lastStartFrom.has(doorKey) ? lastStartFrom.get(doorKey) + BOARDING.followGapTiles / BOARDING.tilesPerSecond : 0;
        const start = Math.max(i * BOARDING.stagger, follow);
        lastStartFrom.set(doorKey, start);
        const boardAt = start + seconds(path) + BOARDING.boardSeconds;
        return { skill, character: CHARACTERS[hash(skill) % CHARACTERS.length], start, path, boardAt };
    });
}

/**
 * A walking grid (half tiles, absolute map tiles) around a stop. A cell is blocked when a
 * walker's feet there would stand on a sprite. `route` finds the cheapest 4-way walk (each
 * turn costs extra) from one point to another, also avoiding cells `avoid(x, y)` rejects,
 * and returns its corners. Falls back to a straight line if no route exists.
 */
function walkGrid(world, centerCol, topRow, bottomRow) {
    const x0 = Math.floor((centerCol - WALK_SPAN_TILES) / WALK_CELL);
    const y0 = Math.floor(topRow / WALK_CELL);
    const cols = Math.ceil((2 * WALK_SPAN_TILES) / WALK_CELL) + 1;
    const rows = Math.ceil((bottomRow - topRow) / WALK_CELL) + 1;
    const at = (i, j) => ({ x: (x0 + i) * WALK_CELL, y: (y0 + j) * WALK_CELL });

    const footprints = world.objects
        .filter((o) => !WALK_THROUGH.has(o.sprite))
        .map((o) => {
            const [, , w, h] = SPRITES[o.sprite].rect;
            return [o.col, o.col + w, o.row, o.row + h];
        })
        .filter(([left, right]) => right > x0 * WALK_CELL - 1 && left < (x0 + cols) * WALK_CELL + 1);
    const blocked = new Uint8Array(cols * rows);
    for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
            const { x, y } = at(i, j);
            blocked[j * cols + i] = footprints.some(([l, r, t, b]) => x + 0.3 > l && x - 0.3 < r && y > t && y - 0.35 < b) ? 1 : 0;
        }
    }
    const clamp = (v, max) => Math.min(max, Math.max(0, v));
    const cellOf = (p) => [clamp(Math.round(p.x / WALK_CELL) - x0, cols - 1), clamp(Math.round(p.y / WALK_CELL) - y0, rows - 1)];
    const STEPS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

    const route = (from, to, avoid = () => false) => {
        const [si, sj] = cellOf(from);
        const [gi, gj] = cellOf(to);
        const free = (i, j) => (i === si && j === sj) || (i === gi && j === gj)
            || (!blocked[j * cols + i] && !avoid(at(i, j).x, at(i, j).y));
        // A state is a cell plus the direction it was entered from (4 = the start).
        const cost = new Float64Array(cols * rows * 5).fill(Infinity);
        const prev = new Int32Array(cols * rows * 5).fill(-1);
        const done = new Uint8Array(cols * rows * 5);
        const heap = new MinHeap();
        const guess = (i, j) => Math.abs(i - gi) + Math.abs(j - gj);
        const start = (sj * cols + si) * 5 + 4;
        cost[start] = 0;
        heap.push(start, guess(si, sj));
        let goal = -1;
        while (heap.size > 0) {
            const state = heap.pop();
            if (done[state]) continue;
            done[state] = 1;
            const cell = Math.floor(state / 5);
            const dir = state % 5;
            const i = cell % cols;
            const j = Math.floor(cell / cols);
            if (i === gi && j === gj) { goal = state; break; }
            STEPS.forEach(([di, dj], next) => {
                const ni = i + di;
                const nj = j + dj;
                if (ni < 0 || nj < 0 || ni >= cols || nj >= rows || !free(ni, nj)) return;
                const nextState = (nj * cols + ni) * 5 + next;
                const nextCost = cost[state] + 1 + (dir !== 4 && dir !== next ? TURN_COST : 0);
                if (nextCost < cost[nextState]) {
                    cost[nextState] = nextCost;
                    prev[nextState] = state;
                    heap.push(nextState, nextCost + guess(ni, nj));
                }
            });
        }
        if (goal < 0) return [from];
        const cells = [];
        for (let state = goal; state >= 0; state = prev[state]) cells.push(Math.floor(state / 5));
        const points = cells.reverse().map((cell) => at(cell % cols, Math.floor(cell / cols)));
        // Keep the corners only.
        return points.filter((p, k) => k === 0 || k === points.length - 1
            || !((points[k - 1].x === p.x && p.x === points[k + 1].x) || (points[k - 1].y === p.y && p.y === points[k + 1].y)));
    };
    return { route };
}

/** Minimal binary min-heap of (item, priority). */
class MinHeap {
    constructor() { this.items = []; }

    get size() { return this.items.length; }

    push(item, priority) {
        const items = this.items;
        items.push([priority, item]);
        let k = items.length - 1;
        while (k > 0) {
            const parent = (k - 1) >> 1;
            if (items[parent][0] <= items[k][0]) break;
            [items[parent], items[k]] = [items[k], items[parent]];
            k = parent;
        }
    }

    pop() {
        const items = this.items;
        const top = items[0];
        const last = items.pop();
        if (items.length > 0) {
            items[0] = last;
            let k = 0;
            for (;;) {
                const left = 2 * k + 1;
                const right = left + 1;
                let smallest = k;
                if (left < items.length && items[left][0] < items[smallest][0]) smallest = left;
                if (right < items.length && items[right][0] < items[smallest][0]) smallest = right;
                if (smallest === k) break;
                [items[smallest], items[k]] = [items[k], items[smallest]];
                k = smallest;
            }
        }
        return top[1];
    }
}

/** Tile → world px helpers for a world. Rows passed to `rowY` are relative to the flight line. */
function projector(world) {
    const T = world.tileSize;
    return {
        px: (col) => col * T,
        rowY: (row) => world.originY + (world.baseRow + row) * T
    };
}

function hash(text) {
    let h = 0;
    for (const char of text) h = (h * 31 + char.charCodeAt(0)) >>> 0;
    return h;
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
