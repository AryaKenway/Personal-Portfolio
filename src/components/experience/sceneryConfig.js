/**
 * @file sceneryConfig.js
 * @description Data only: the sky over the map (clouds, birds, balloon), its
 * parallax, the time-of-day tint, and how far the map bleeds past the world.
 * The ground itself is described in `worldLayout.js`.
 */

/** How far the map extends above and below the world, so tall stages are never bare. */
export const MAP_BLEED_PX = 320;

/** Sky layer (nearer to the viewer, moves faster than the map). */
export const SKY_PARALLAX = 1.3;

/**
 * Airborne Lottie sprites. `at` is the journey fraction (0 = first stop,
 * 1 = finale) where the sprite crosses the centre of the screen; `dy` is the
 * sprite's centre row relative to the flight line (negative = above it). `w`/`h`
 * are the Lottie box in tiles. `drift` (px) adds a slow ambient sway on top of the
 * parallax. `profiles` limits where a sprite appears (phones get fewer players).
 */
export const SKY_SPRITES = Object.freeze([
    { asset: 'clouds', at: 0.04, dy: -4.5, w: 4, h: 4, drift: 40 },
    { asset: 'sparrow', at: 0.18, dy: -3.5, w: 5, h: 2.8, drift: 30 },
    { asset: 'clouds', at: 0.36, dy: -5, w: 3.4, h: 3.4, drift: 50, profiles: ['tablet', 'desktop'] },
    { asset: 'clouds', at: 0.56, dy: -4.2, w: 4.4, h: 4.4, drift: 35 },
    { asset: 'sparrow', at: 0.72, dy: -4.8, w: 4.4, h: 2.5, drift: 25, profiles: ['tablet', 'desktop'] },
    { asset: 'hotAirBalloon', at: 0.93, dy: -4.5, w: 2.2, h: 3.2, drift: 14 },
    { asset: 'clouds', at: 1.04, dy: -5.2, w: 3.6, h: 3.6, drift: 45, profiles: ['tablet', 'desktop'] }
]);

/** Map tint over the journey: morning → midday → golden hour → dusk. */
export const SKY_TINTS = Object.freeze([
    'rgba(255, 214, 140, 0.14)',
    'rgba(255, 255, 255, 0)',
    'rgba(255, 150, 70, 0.16)',
    'rgba(110, 72, 170, 0.2)'
]);
