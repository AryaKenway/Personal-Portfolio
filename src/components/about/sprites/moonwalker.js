/**
 * @file moonwalker.js
 * @description The moonwalker in the Billie Jean look: head bowed under the fedora, one hand on
 * its crown, a white glove on the other, sequinned jacket, high-water trousers, white socks and
 * loafers. Drawn facing right.
 *
 * The moonwalk is the real mechanics: one foot stands on its toe, fixed to the floor, while the
 * body glides back over it and the other foot slides back flat; then they swap. The glide is
 * continuous (one source pixel at a time), with the planted foot pinned to a whole floor pixel so
 * it never jitters.
 */

import { GROUND, SPRITE_H, SPRITE_W, outline, paintRows, thickLine } from './pixels.js';

const HIP_Y = 36;
const KNEE_Y = 47;
/** Hip x of each leg (the near leg is drawn over the far one). */
const NEAR_HIP = 19;
const FAR_HIP = 16;
/** Horizontal reach of a step (source px): each foot travels ±STRIDE/2 around its hip. */
const STRIDE = 14;
const STEP_SECONDS = 0.36;
/** How often the jacket's sequins change which ones catch the light. */
const SPARKLES_PER_SECOND = 6;

const PALETTE = {
    H: '#1a1820', // hat
    h: '#2f2c3b', // hat highlight
    B: '#d4d0e4', // hat band
    K: '#100e13', // hair
    S: '#8d5a3c', // skin
    s: '#6a402a', // skin in shadow
    e: '#24150f', // closed eye
    J: '#24222f', // jacket
    j: '#191721', // jacket, back edge
    L: '#3b3752', // lapel
    W: '#dcd8e8', // shirt
    A: '#302d41', // near sleeve
    a: '#211f2d', // near sleeve shade
    F: '#1b1924', // far sleeve
    G: '#ffffff', // glove
    g: '#c8c5d6', // glove shade
    P: '#2b2938' // trousers at the waist
};
const LEG = {
    near: '#2b2938',
    far: '#131118',
    sock: '#ffffff',
    sockShade: '#cfcbe0',
    // Charcoal rather than black: pure black loafers vanish into the night sky.
    shoe: '#2a2733',
    shine: '#77718f'
};
const SEQUIN = '#f1eefb';

/** Everything above the legs, back to front (see paintRows). */
const UPPER_BODY = [
    // Far arm hanging at his back, white glove at the end.
    ...[17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30].map((y) => [y, 9, 'FFF']),
    [31, 8, 'GGGg'], [32, 8, 'GGGG'], [33, 8, 'gGGg'], [34, 9, 'gg'],
    // Trousers at the waist.
    [35, 13, 'PPPPPPPPPPP'], [36, 14, 'PPPPPPPPP'],
    // Jacket (back edge darker), the shirt and lapel at the front, flaring a little at the hem.
    [16, 15, 'JJJJJJJJ'],
    [17, 13, 'jJJJJJJJJJ'],
    [18, 12, 'jJJJJJJJJJJWW'],
    [19, 12, 'jJJJJJJJJJLWW'],
    [20, 12, 'jJJJJJJJJJLW'],
    ...[21, 22, 23, 24, 25].map((y) => [y, 12, 'jJJJJJJJJJLJ']),
    ...[26, 27, 28, 29, 30, 31].map((y) => [y, 12, 'jJJJJJJJJJJJ']),
    [32, 12, 'jJJJJJJJJJJJJ'],
    [33, 11, 'jjJJJJJJJJJJJJ'],
    [34, 11, 'jjjJJJJJJJJJJ'],
    // Head bowed: hair and curls at the back; under the brim's shadow only the jaw and chin
    // show, tucked down towards the chest.
    [9, 12, 'KKKKKKKK'],
    [10, 12, 'KKKKKsssss'],
    [11, 12, 'KKKKKsssSSs'],
    [12, 12, 'KKKKsSSSSSs'],
    [13, 12, 'KKKKKsSSSS'],
    [14, 12, 'KK.KK.sSSs'],
    [15, 11, 'KK.K...ss'],
    [16, 11, 'K.KK'],
    // Fedora, the brim dipping at the front over his face.
    [1, 16, 'HHHHH'],
    [2, 15, 'HhhHHH'],
    [3, 14, 'HhhhHHH'],
    [4, 14, 'HhhHHHH'],
    [5, 14, 'HHHHHHH'],
    [6, 14, 'HHHHHHHHHHHH'],
    [7, 14, 'BBBBBBBBBBBB'],
    [8, 10, 'HHHHHHHHHHHHHHHHHH'],
    [9, 20, 'HHHHHHHHHH'],
    [10, 26, 'HHHH'],
    // Near arm raised, elbow out in front, hand gripping the crown.
    [6, 25, 'AAA'], [7, 26, 'AAA'], [8, 27, 'AAA'], [9, 28, 'AAA'], [10, 29, 'AAa'],
    [11, 29, 'AAAa'], [12, 28, 'AAAAa'], [13, 27, 'aAAAa'], [14, 26, 'aAAA'],
    [15, 25, 'aAAA'], [16, 24, 'aAAA'], [17, 23, 'aAA'],
    // Fingers over the crown, knuckles picked out in shade.
    [1, 21, 'SSsS'], [2, 20, 'SSsSsS'], [3, 20, 'sSSsSs'], [4, 21, 'sSSSs'], [5, 22, 'sSs']
];

/** Jacket pixels the sequins can sparkle on (inside the front panel). */
const SEQUIN_SPOTS = [];
for (let y = 19; y <= 32; y++) for (let x = 14; x <= 21; x++) SEQUIN_SPOTS.push([x, y]);

/**
 * One leg: trousers from the hip ending above the ankle, a white sock, and a loafer, either
 * flat on the floor or up on its toe (heel raised, knee bent forward).
 * @param {number} f - Foot offset from the hip (whole source px, + is forward / right).
 */
function drawLeg(ctx, hipX, f, onToe, pants) {
    const ankleX = hipX + f;
    const ankleY = onToe ? 53 : 56;
    const kneeX = Math.round((hipX + ankleX) / 2) + (onToe ? 3 : 0);
    ctx.fillStyle = pants;
    thickLine(ctx, hipX, HIP_Y, kneeX, KNEE_Y);
    thickLine(ctx, kneeX, KNEE_Y, ankleX, ankleY - 3);
    ctx.fillStyle = LEG.sock;
    ctx.fillRect(ankleX - 1, ankleY - 2, 3, 3);
    ctx.fillStyle = LEG.sockShade;
    ctx.fillRect(ankleX - 1, ankleY - 2, 1, 3);
    ctx.fillStyle = LEG.shoe;
    if (onToe) {
        ctx.fillRect(ankleX - 2, 54, 4, 1);
        ctx.fillRect(ankleX - 1, 55, 5, 1);
        ctx.fillRect(ankleX + 1, 56, 4, 1);
        ctx.fillRect(ankleX + 2, 57, 4, 1);
        ctx.fillRect(ankleX + 3, 58, 4, 1);
        ctx.fillRect(ankleX + 4, GROUND, 3, 1);
        ctx.fillStyle = LEG.shine;
        ctx.fillRect(ankleX + 1, 55, 2, 1);
    } else {
        ctx.fillRect(ankleX - 2, 57, 6, 1);
        ctx.fillRect(ankleX - 2, 58, 8, 1);
        ctx.fillRect(ankleX - 2, GROUND, 8, 1);
        ctx.fillStyle = LEG.shine;
        ctx.fillRect(ankleX + 1, 57, 2, 1);
    }
}

/**
 * @typedef {{ near: { f: number, toe: boolean }, far: { f: number, toe: boolean }, sparkle: number }} MoonwalkPose
 */

/** Draws the whole figure for one pose, outlined. */
export function drawMoonwalker(ctx, pose) {
    ctx.clearRect(0, 0, SPRITE_W, SPRITE_H);
    drawLeg(ctx, FAR_HIP, pose.far.f, pose.far.toe, LEG.far);
    drawLeg(ctx, NEAR_HIP, pose.near.f, pose.near.toe, LEG.near);
    paintRows(ctx, UPPER_BODY, PALETTE);

    // Sequins: three jacket pixels catch the light, changing a few times a second.
    ctx.fillStyle = SEQUIN;
    for (let i = 0; i < 3; i++) {
        const [x, y] = SEQUIN_SPOTS[(pose.sparkle * 31 + i * 47) % SEQUIN_SPOTS.length];
        ctx.fillRect(x, y, 1, 1);
    }
    outline(ctx);
}

/**
 * Where the body is (whole source px, negative = moved left) and the pose, `time` seconds into
 * the moonwalk.
 * @returns {{ body: number, pose: MoonwalkPose }}
 */
export function moonwalkAt(time) {
    const speed = STRIDE / STEP_SECONDS;
    const body = Math.round(-speed * time);
    const step = Math.floor(time / STEP_SECONDS);
    const progress = time / STEP_SECONDS - step;
    const stepStart = -STRIDE * step;
    // The toe foot is fixed to the floor where the step began (half a stride behind the hip);
    // the flat foot slides from half a stride in front to half a stride behind the next hip.
    const planted = { f: stepStart - STRIDE / 2 - body, toe: true };
    const sliding = { f: Math.round(stepStart + STRIDE / 2 - 2 * STRIDE * progress) - body, toe: false };
    const sparkle = Math.floor(time * SPARKLES_PER_SECOND);
    return {
        body,
        pose: step % 2 === 0 ? { near: sliding, far: planted, sparkle } : { near: planted, far: sliding, sparkle }
    };
}

/** @type {MoonwalkPose} */
export const MOONWALKER_STANDING = { near: { f: 3, toe: false }, far: { f: -3, toe: false }, sparkle: 0 };
