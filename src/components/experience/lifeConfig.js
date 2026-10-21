/**
 * @file lifeConfig.js
 * @description Data only: what moves on the map (Phase 11). `buildLife.js`
 * places these; `LifeLayer.jsx` and the boarding walkers render them.
 * Loop sheets are Ninja Adventure (CC0), characters are Pipoya; positions are tiles,
 * like worldLayout.js.
 */

/**
 * Looping sprite sheets: frames laid out left to right.
 * `fw`/`fh` frame size in source px, `frames`, and `seconds` per loop.
 */
export const LOOPS = Object.freeze({
    smoke: { fw: 32, fh: 32, frames: 6, seconds: 1.6 },
    flagRed: { fw: 16, fh: 16, frames: 4, seconds: 0.6 },
    flagYellow: { fw: 16, fh: 16, frames: 4, seconds: 0.6 },
    flagBlue: { fw: 16, fh: 16, frames: 4, seconds: 0.6 },
    ripples: { fw: 16, fh: 16, frames: 4, seconds: 1.2 },
    watermill: { fw: 34, fh: 36, frames: 3, seconds: 0.75 }
});

/**
 * Character walk sheets (Pipoya, RPG Maker layout): 3 frames left to right (step, stand,
 * step) × 4 rows, one per facing (DIRECTION), 32px frames. A walk cycle plays the frames
 * step, stand, step, stand. `size` draws them at that share of the map's pixel size, so a
 * full-bodied person stands a little over 1.5 tiles tall next to 3-tile houses.
 */
export const WALK = Object.freeze({ fw: 32, fh: 32, standFrame: 1, size: 0.8, seconds: 0.6 });
export const DIRECTION = Object.freeze({ down: 0, left: 1, right: 2, up: 3 });

/** Characters available as passengers and townsfolk (file names in assets/experience/pipoya). */
export const CHARACTERS = Object.freeze([
    'f02-1', 'f03-4', 'f17-3', 'f18-2', 'f20-4', 'f22-1', 'm08-4', 'm10-1', 'm11-3', 'm13-2', 'm14-1', 'm16-2'
]);

/** Buildings people come out of (their door is the middle of the bottom edge). */
export const BUILDINGS = Object.freeze(new Set([
    'houseOrange', 'houseBeige', 'houseOrangeB', 'houseRed', 'shopSign', 'shopLantern', 'houseRound',
    'houseCorner', 'houseTimber', 'domeHut', 'shed', 'hutStraw'
]));

/** Buildings with a smoking chimney. The puff starts above the roof, ~60% across. */
export const SMOKING = Object.freeze(new Set([
    'houseTimber', 'houseRed', 'houseOrangeB', 'shopLantern', 'houseRound', 'domeHut', 'barn'
]));

/** Flags at every airfield, relative to the stop (x) and the flight line (y), in tiles. */
export const AIRFIELD_FLAGS = Object.freeze([
    { loop: 'flagRed', x: 3.3, y: -4.9 },
    { loop: 'flagYellow', x: -4.6, y: -8 }
]);

/** Extra flags per district (same units). */
export const DISTRICT_FLAGS = Object.freeze({
    'red-panda': [{ loop: 'flagBlue', x: 9.6, y: 3.1 }, { loop: 'flagYellow', x: 11.4, y: 3.1 }],
    walmart: [{ loop: 'flagBlue', x: 5.4, y: 1.2 }]
});

/** A water wheel beside each lane's bridge, relative to the lane (x) and the river top (y). */
export const WATERMILL_OFFSET = Object.freeze({ x: 4, y: -0.8 });

/** Share of open-water tiles that get a drifting ripple. */
export const RIPPLE_SHARE = Object.freeze({ phone: 0.12, tablet: 0.22, desktop: 0.22 });

/** Townsfolk strolling the road near each stop, and down each lane (not on phones). */
export const TOWNSFOLK = Object.freeze({
    perDistrict: { phone: 1, tablet: 2, desktop: 2 },
    laneWalkers: { phone: false, tablet: true, desktop: true },
    tilesPerSecond: 1.5,
    pause: [0.8, 1.8]
});

/**
 * Townsfolk standing still: they "breathe" (a CSS loop of `breatheSeconds`, kept in sync with
 * LifeLayer.module.css) and turn to face the street `turnAt` of the way through each pause.
 */
export const LOOK_AROUND = Object.freeze({ breatheSeconds: 2.4, turnAt: 0.45 });

/**
 * Boarding passengers: walking speed, how far apart they set off, the gap (tiles) kept behind
 * someone leaving from the same door (so a pass never covers the walker ahead), and the climb aboard.
 */
export const BOARDING = Object.freeze({
    tilesPerSecond: 4.2,
    stagger: 0.6,
    followGapTiles: 3.5,
    boardSeconds: 0.35
});

export const LIFE_SEED = 1107;
