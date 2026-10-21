/**
 * @file worldLayout.js
 * @description Data only: the hand-authored world under the flight path.
 * `buildWorld.js` turns this into tiles and placed sprites, and reports any overlap.
 *
 * Units are tiles. `x` is the column offset of a sprite's LEFT edge from its district's
 * stop, and `y` is the row offset of its TOP edge from the flight line (the stops' baseline row).
 *
 * Bands, top to bottom (rows from the flight line):
 *   upper countryside … -6
 *   meadow             -5 … -3   (low scenery the plane flies over)
 *   route corridor     ROWS.corridorTop … ROWS.corridorBottom   (route + stop signs; decals only)
 *   district buildings ROWS.buildingsTop … ROWS.buildingsBottom (doors face the road)
 *   main road          ROWS.roadTop … ROWS.roadBottom           (runs the whole world)
 *   river              ROWS.riverTop … ROWS.riverBottom         (crossed by lane bridges)
 *   farmland           ROWS.farmTop …
 */

export const ROWS = Object.freeze({
    corridorTop: -2,
    corridorBottom: 1,
    buildingsTop: 2,
    buildingsBottom: 5,
    roadTop: 6,
    roadBottom: 7,
    riverTop: 9,
    riverBottom: 11,
    farmTop: 13
});

/**
 * The rustic airfield at every stop (Phase 10), relative to the stop like a district:
 * a dirt runway along the flight line (the route is its centre marking), a barn hangar
 * and watchtower on the far side, fuel barrels, a banner as windsock, and a little
 * wooden terminal under the stop's sign.
 */
export const AIRFIELD = Object.freeze({
    // Rows -1 … +1: centred on the flight line, which becomes the runway's centre marking.
    runway: { x: -6, y: -1, w: 12, h: 3 },
    objects: [
        { sprite: 'barn', x: -6, y: -7 },
        { sprite: 'crate', x: -1, y: -3 },
        { sprite: 'barrel', x: 0, y: -3 },
        { sprite: 'controlTower', x: 2, y: -4 },
        { sprite: 'bannerRed', x: 5, y: -4 },
        // The terminal, under the stop's sign (scenery: passengers walk straight to the plane).
        { sprite: 'hutWood', x: -1.5, y: 2 }
    ]
});

/**
 * One district per stop, keyed by milestone id, plus the finale. Each may have:
 * - `objects`: `{ sprite, x, y }` sprites (see spriteAtlas.js);
 * - `lane`: `{ x }` a 2-wide dirt lane from the road down to the farmland, crossing the
 *   river on a bridge. One lane per gap between stops (always on the stop's right), so
 *   bridges never end up side by side;
 * - `ponds`: `{ x, y, w, h }` water patches (≥ 2×2).
 */
export const DISTRICTS = Object.freeze({
    // Christ University: a campus. Timber hall and lecture house, torii gate, blossoms.
    education: {
        objects: [
            { sprite: 'bench', x: -13, y: 5 },
            { sprite: 'houseTimber', x: -9, y: 2 },
            { sprite: 'torii', x: -5, y: 4 },
            { sprite: 'houseBeige', x: 4, y: 3 },
            { sprite: 'sunflower', x: 8, y: 5 },
            { sprite: 'blossomPink', x: 9, y: 3 },
            { sprite: 'flowerRed', x: -10, y: 5 },
            { sprite: 'blossomGreen', x: -9, y: -9 },
            { sprite: 'blossomPink', x: 3, y: -9 },
            { sprite: 'hayField', x: -9, y: 13 },
            { sprite: 'scarecrow', x: -5, y: 14 }
        ],
        lane: { x: 14 },
        ponds: [{ x: -14, y: -9, w: 5, h: 3 }]
    },
    // Hitachi: a tech park. Red-roofed offices, a lantern-lit hall, lamps and supplies.
    hitachi: {
        objects: [
            { sprite: 'lampSign', x: -12, y: 4 },
            { sprite: 'houseRed', x: -11, y: 3 },
            { sprite: 'houseCorner', x: -7, y: 3 },
            { sprite: 'shopLantern', x: 4, y: 3 },
            { sprite: 'barrel', x: 8, y: 5 },
            { sprite: 'lampSign', x: 9, y: 4 },
            { sprite: 'crate', x: 10, y: 5 },
            { sprite: 'barrel', x: 11, y: 5 },
            { sprite: 'rocksGrey', x: -12, y: -9 },
            { sprite: 'groveBig', x: 5, y: -10 }
        ],
        lane: { x: 14 }
    },
    // Red Panda Games: a games studio on a market street, with stalls and bright banners.
    'red-panda': {
        objects: [
            { sprite: 'stallA', x: -11, y: 4 },
            { sprite: 'shopSign', x: -7, y: 3 },
            { sprite: 'barrel', x: -4, y: 5 },
            { sprite: 'bannerRed', x: 4, y: 4 },
            { sprite: 'bannerGreen', x: 5, y: 4 },
            { sprite: 'bannerPurple', x: 6, y: 4 },
            { sprite: 'bannerYellow', x: 7, y: 4 },
            { sprite: 'crate', x: 8, y: 5 },
            { sprite: 'stallB', x: 9, y: 4 },
            { sprite: 'blossomOrange', x: -1, y: -9 },
            { sprite: 'treeYellow', x: 5, y: -8 },
            { sprite: 'hayField', x: 4, y: 13 },
            { sprite: 'hayField', x: 7, y: 13 }
        ],
        lane: { x: 14 },
        ponds: [{ x: 15, y: -10, w: 4, h: 3 }]
    },
    // Stipe Solutions: an AR lab. Round stone lab, dome hut, crystals and ore rocks.
    stipe: {
        objects: [
            { sprite: 'domeHut', x: -11, y: 2 },
            { sprite: 'houseRound', x: -7, y: 3 },
            { sprite: 'crystalBlue', x: 4, y: 5 },
            { sprite: 'crystalPink', x: 5, y: 5 },
            { sprite: 'crystalOrange', x: 6, y: 5 },
            { sprite: 'crystalGreen', x: 7, y: 5 },
            { sprite: 'lampSign', x: 8, y: 4 },
            { sprite: 'hutStraw', x: 9, y: 4 },
            { sprite: 'oreRockA', x: 4, y: 2 },
            { sprite: 'oreRockB', x: 6, y: 2 },
            { sprite: 'rocksBrown', x: 4, y: -9 }
        ],
        lane: { x: 14 }
    },
    // Walmart: downtown HQ. A row of big buildings, a timber hall, a shed and a log cart.
    walmart: {
        objects: [
            { sprite: 'barrel', x: -13, y: 5 },
            { sprite: 'houseOrangeB', x: -12, y: 3 },
            { sprite: 'houseOrange', x: -8, y: 3 },
            { sprite: 'crate', x: -4, y: 5 },
            { sprite: 'houseTimber', x: 4, y: 2 },
            { sprite: 'potRed', x: 8, y: 5 },
            { sprite: 'shed', x: 9, y: 3 },
            { sprite: 'cartLogs', x: 12, y: 4 },
            { sprite: 'grovePink', x: -8, y: -10 }
        ],
        lane: { x: 14 }
    },
    // The open plot past the last stop, waiting for "your company".
    finale: {
        objects: [
            { sprite: 'ropeFence', x: -4, y: 4 },
            { sprite: 'signBoard', x: 0, y: 4 },
            { sprite: 'ropeFence', x: 2, y: 4 },
            { sprite: 'laundry', x: 6, y: 4 }
        ]
    }
});

/**
 * Countryside filled in around the authored parts, seeded and collision-checked.
 * Each zone: rows `[from, to]` (inclusive, from the flight line), a placement grid `step`
 * (tiles), the `chance` of trying a cell, and a weighted sprite pool.
 * `gap` keeps scattered sprites this many tiles clear of everything else.
 */
export const SCATTER = Object.freeze({
    seed: 4021,
    gap: 0.5,
    decalChance: 0.05,
    tuftChance: 0.12,
    decals: ['decalFlowers', 'decalPetals', 'decalTuft', 'decalTuftB', 'decalFlowerBush', 'decalPebbles'],
    /** Street lamps along the roadside: tried every `every` columns at row `y`, where free. */
    lamps: { sprite: 'lampSign', every: 8, y: 4 },
    zones: [
        {
            name: 'meadow',
            rows: [-5, -3],
            step: 2,
            chance: 0.4,
            pool: {
                bushA: 3, bushB: 3, bushC: 2, bushD: 2, sunflower: 2, flowerRed: 2, flowerWhite: 2,
                treeSmall: 1, rockGreySmall: 1, rockBrownSmall: 1, hayField: 1
            }
        },
        {
            name: 'upper',
            rows: [-18, -6],
            step: 2.5,
            chance: 0.55,
            pool: {
                groveGreen: 3, grovePine: 3, groveBig: 2, treeRound: 4, treePine: 4, treeOak: 3,
                treeRoundB: 2, rockGrey: 1, rocksGrey: 1, bushA: 2, bushB: 2, sunflower: 1
            }
        },
        {
            name: 'verge',
            rows: [2, 5],
            step: 2,
            chance: 0.5,
            pool: {
                treeRound: 3, treeSmall: 3, treePine: 2, bushA: 3, bushB: 3, bushC: 2, bushD: 2,
                sunflower: 2, sunflowerB: 1, flowerRed: 2, flowerWhite: 1, stump: 1, rockBrownSmall: 1
            }
        },
        {
            name: 'farmland',
            rows: [13, 22],
            step: 2.5,
            chance: 0.55,
            pool: {
                treeRound: 3, treeOak: 3, groveGreen: 2, treeRoundB: 2, bushA: 2, bushD: 2,
                sunflower: 2, rockBrown: 1, stump: 1, treePink: 1
            }
        }
    ]
});
