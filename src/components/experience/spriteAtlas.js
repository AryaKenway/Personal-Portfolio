/**
 * @file spriteAtlas.js
 * @description Data only: where each Ninja Adventure sprite sits on its sheet.
 * Rectangles are in 16px tiles `[x, y, w, h]` (half tiles allowed) and are
 * converted to source pixels by the world builder. Names are what
 * `worldLayout.js` refers to. See `src/assets/experience/CREDITS.md`.
 *
 * Ground autotiles (`GROUND`) follow the pack's layout: a 3×3 patch, 1-wide
 * strips, a single dot, and an inner-corner set around a 2×2 hole.
 */

/** Size of one tile on the source sheets, in px. */
export const SOURCE_TILE = 16;

/**
 * Sprites: name → { sheet, rect: [x, y, w, h] in tiles }. `rect` is the size on the map; a
 * sprite with `slice` (a 3-row source rect) is stretched to that height by drawing the top
 * row, repeating the middle row, then the bottom row.
 */
export const SPRITES = Object.freeze({
    // ---- Buildings (house sheet) -------------------------------------------------------
    houseOrange: { sheet: 'house', rect: [0, 0, 4, 3] },
    houseBeige: { sheet: 'house', rect: [4, 0, 4, 3] },
    houseOrangeB: { sheet: 'house', rect: [8, 0, 4, 3] },
    houseRed: { sheet: 'house', rect: [12, 0, 4, 3] },
    shopSign: { sheet: 'house', rect: [16, 0, 3, 3] },
    shopLantern: { sheet: 'house', rect: [19, 0, 4, 3] },
    houseRound: { sheet: 'house', rect: [23, 0, 3, 3] },
    houseCorner: { sheet: 'house', rect: [26, 0, 3, 3] },
    houseTimber: { sheet: 'house', rect: [29, 0, 4, 4] },
    domeHut: { sheet: 'house', rect: [29, 4, 3, 4] },
    barn: { sheet: 'house', rect: [25, 14, 4, 5] },
    shed: { sheet: 'house', rect: [19, 19, 3, 3] },
    // The roof starts halfway down row 7.
    hutWood: { sheet: 'house', rect: [0, 7, 3, 3] },
    hutStraw: { sheet: 'house', rect: [3, 8, 3, 2] },
    torii: { sheet: 'house', rect: [0.5, 5, 2, 2] },
    stallA: { sheet: 'house', rect: [16, 16, 3, 2] },
    stallB: { sheet: 'house', rect: [19, 16, 3, 2] },
    bannerRed: { sheet: 'house', rect: [23, 20, 1, 2] },
    bannerGreen: { sheet: 'house', rect: [25, 20, 1, 2] },
    bannerPurple: { sheet: 'house', rect: [27, 20, 1, 2] },
    bannerYellow: { sheet: 'house', rect: [28, 20, 1, 2] },
    // A bridge long enough for the 3-row river: drawn from the 3-row sheet bridge (`slice`),
    // its middle row repeated (see MapBackdrop).
    bridge: { sheet: 'house', rect: [10, 15, 3, 5], slice: [10, 15, 3, 3] },

    // ---- Airfield (house + towers sheets) ----------------------------------------------
    controlTower: { sheet: 'towers', rect: [0, 0, 2, 2] },
    controlTowerStone: { sheet: 'towers', rect: [12, 0, 2, 2] },

    // ---- Trees, groves, rocks, plants (nature sheet) -----------------------------------
    treeRound: { sheet: 'nature', rect: [0, 0, 2, 2] },
    treePine: { sheet: 'nature', rect: [2, 0, 2, 2] },
    treeOak: { sheet: 'nature', rect: [6, 0, 2, 2] },
    treePink: { sheet: 'nature', rect: [14, 0, 2, 2] },
    treeRoundB: { sheet: 'nature', rect: [16, 0, 2, 2] },
    treeYellow: { sheet: 'nature', rect: [18, 0, 2, 2] },
    treeSmall: { sheet: 'nature', rect: [6, 8, 2, 2] },
    grovePine: { sheet: 'nature', rect: [0, 2, 4, 3] },
    groveGreen: { sheet: 'nature', rect: [4, 2, 4, 3] },
    grovePink: { sheet: 'nature', rect: [12, 2, 4, 3] },
    groveBig: { sheet: 'nature', rect: [16, 2, 4, 3] },
    blossomPink: { sheet: 'nature', rect: [0, 18, 3, 3] },
    blossomGreen: { sheet: 'nature', rect: [3, 18, 3, 3] },
    blossomOrange: { sheet: 'nature', rect: [9, 18, 3, 3] },
    rocksBrown: { sheet: 'nature', rect: [12, 5, 4, 3] },
    rocksGrey: { sheet: 'nature', rect: [16, 5, 4, 3] },
    rockBrown: { sheet: 'nature', rect: [13, 8, 2, 2] },
    rockGrey: { sheet: 'nature', rect: [16, 8, 2, 2] },
    rockBrownSmall: { sheet: 'nature', rect: [15, 9, 1, 1] },
    rockGreySmall: { sheet: 'nature', rect: [18, 9, 1, 1] },
    stump: { sheet: 'nature', rect: [2, 8, 2, 2] },
    bushA: { sheet: 'nature', rect: [0, 10, 1, 1] },
    bushB: { sheet: 'nature', rect: [1, 10, 1, 1] },
    bushC: { sheet: 'nature', rect: [6, 10, 1, 1] },
    bushD: { sheet: 'nature', rect: [10, 10, 1, 1] },
    sunflower: { sheet: 'nature', rect: [0, 11, 1, 1] },
    sunflowerB: { sheet: 'nature', rect: [1, 11, 1, 1] },
    flowerRed: { sheet: 'nature', rect: [3, 11, 1, 1] },
    flowerWhite: { sheet: 'nature', rect: [6, 11, 1, 1] },
    oreRockA: { sheet: 'nature', rect: [7, 14, 2, 2] },
    oreRockB: { sheet: 'nature', rect: [9, 14, 2, 2] },
    oreRockC: { sheet: 'nature', rect: [9, 16, 2, 2] },
    crystalOrange: { sheet: 'nature', rect: [0, 14, 1, 1] },
    crystalBlue: { sheet: 'nature', rect: [1, 14, 1, 1] },
    crystalPink: { sheet: 'nature', rect: [2, 14, 1, 1] },
    crystalGreen: { sheet: 'nature', rect: [3, 14, 1, 1] },

    // ---- Village props (element sheet) -------------------------------------------------
    hayField: { sheet: 'element', rect: [13, 4, 3, 3] },
    cartLogs: { sheet: 'element', rect: [0, 3, 2, 2] },
    ropeFence: { sheet: 'element', rect: [11, 2.5, 3, 1.5] },
    laundry: { sheet: 'element', rect: [14, 2.5, 2, 1.5] },
    scarecrow: { sheet: 'element', rect: [15, 0, 1, 1] },
    lampSign: { sheet: 'element', rect: [6, 3, 1, 2] },
    signBoard: { sheet: 'element', rect: [0, 2, 1, 1] },
    crate: { sheet: 'element', rect: [0, 0, 1, 1] },
    barrel: { sheet: 'element', rect: [1, 0, 1, 1] },
    potRed: { sheet: 'element', rect: [3, 0, 1, 1] },
    bench: { sheet: 'element', rect: [11, 1, 3, 1] },

    // ---- Ground decals (floor-detail sheet): drawn flat, never block ------------------
    decalFlowers: { sheet: 'floorDetail', rect: [2, 0, 1, 1] },
    decalPetals: { sheet: 'floorDetail', rect: [3, 0, 1, 1] },
    decalTuft: { sheet: 'floorDetail', rect: [0, 2, 1, 1] },
    decalTuftB: { sheet: 'floorDetail', rect: [3, 2, 1, 1] },
    decalFlowerBush: { sheet: 'floorDetail', rect: [5, 2, 1, 1] },
    decalPebbles: { sheet: 'floorDetail', rect: [0, 1, 1, 1] }
});

/**
 * Ground autotiles (all `[x, y]` tile positions on their sheet). Each set: `patch` is a
 * 3×3 nine-slice [TL, T, TR, L, C, R, BL, B, BR]; `vStrip` [top, mid, bottom];
 * `hStrip` [left, mid, right]; `dot`; `inner` corners named by where grass shows.
 */
export const GROUND = Object.freeze({
    grass: { sheet: 'floor', plain: [0, 12], tufts: [[1, 12], [2, 12], [3, 12], [4, 12]] },
    dirt: {
        sheet: 'floor',
        patch: [[0, 7], [1, 7], [2, 7], [0, 8], [1, 8], [2, 8], [0, 9], [1, 9], [2, 9]],
        vStrip: [[3, 7], [3, 8], [3, 9]],
        hStrip: [[0, 10], [1, 10], [2, 10]],
        dot: [3, 10],
        inner: { se: [5, 8], sw: [6, 8], ne: [5, 9], nw: [6, 9] }
    },
    water: {
        sheet: 'water',
        patch: [[0, 6], [1, 6], [2, 6], [0, 7], [1, 7], [2, 7], [0, 8], [1, 8], [2, 8]],
        vStrip: [[3, 6], [3, 7], [3, 8]],
        hStrip: [[0, 9], [1, 9], [2, 9]],
        dot: [3, 9],
        inner: { se: [5, 7], sw: [6, 7], ne: [5, 8], nw: [6, 8] }
    }
});
