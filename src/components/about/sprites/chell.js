/**
 * @file chell.js
 * @description Chell from Portal 2: dark ponytail, white tank top, the orange jumpsuit's top
 * tied round her waist, Long Fall Boots (with the spring strut behind each heel) and the portal
 * gun worn on one forearm at the hip, its tip glowing blue. Drawn facing right (the scene
 * mirrors her).
 *
 * A plain walk: each foot swings forward lifted, then stays planted while the body passes over
 * it, so a planted foot moves back exactly as fast as she walks (CHELL_SPEED).
 */

import { GROUND, SPRITE_H, SPRITE_W, outline, paintRows, thickLine } from './pixels.js';

const HIP_Y = 37;
const KNEE_Y = 47;
const NEAR_HIP = 18;
const FAR_HIP = 15;
/** Each foot swings ±REACH source px around its hip over one WALK_CYCLE (two steps). */
const REACH = 5;
const WALK_CYCLE = 0.9;
/** Walking speed, source px per second (a planted foot covers 2 × REACH in half a cycle). */
export const CHELL_SPEED = (4 * REACH) / WALK_CYCLE;
/** Columns her figure spans in the (unmirrored) sprite: the gun's tip to her ponytail. */
export const CHELL_FRONT_COL = 37;
export const CHELL_BACK_COL = 8;
/** Where the gun's tip is (unmirrored source px), for the shot. */
export const GUN_TIP = { x: 36, y: 26 };

const PALETTE = {
    H: '#3b2417', // hair
    h: '#5b3a26', // hair highlight
    S: '#e3b48e', // skin
    s: '#c08a66', // skin in shadow
    W: '#ece9ef', // tank top
    w: '#c3bfcb', // tank top shade
    O: '#e8711f', // jumpsuit orange
    o: '#b4550f', // jumpsuit shade
    G: '#f3f3f6', // portal gun, white shell
    g: '#a7a9b8', // portal gun, grey
    k: '#1e1e26', // portal gun, black
    b: '#45a8ff', // portal gun, blue glow
    c: '#c7ecff' // portal gun, bright core
};
const LEG = {
    near: '#e8711f',
    far: '#a94d0d',
    boot: '#dfe1e8',
    bootShade: '#9a9dad',
    foot: '#4a4d5c',
    strut: '#c9ccd6'
};

/** Everything above the legs, back to front (see paintRows). */
const UPPER_BODY = [
    // Head (facing right): hair with a ponytail falling behind, a plain face at the front (no
    // features, kept low-key).
    [3, 14, 'HHHHH'],
    [4, 13, 'HHhhHHH'],
    [5, 12, 'HHHhhHHHH'],
    [6, 12, 'HHHHHHHHHS'],
    [7, 11, 'HHHHHHHSSSS'],
    [8, 10, 'HHHHHHHSSSSS'],
    [9, 10, 'HH.HHHHSSSSS'],
    [10, 9, 'HH...HHsSSSS'],
    [11, 9, 'HH....HsSSSS'],
    [12, 9, 'HH.....ssSS'],
    [13, 8, 'HH.......ss'],
    [14, 8, 'H........ss'],
    // Far arm behind her, bent up at the elbow (the forearm and hand tucked out of sight
    // behind her body, well clear of her waist).
    ...[18, 19, 20, 21, 22].map((y) => [y, 11, 'ss']),
    [23, 12, 's'],
    // Tank top, bare shoulders.
    [15, 14, 'WWWWWWW'],
    [16, 13, 'sWWWWWWWS'],
    [17, 12, 'ssWWWWWWWSS'],
    [18, 12, 'swWWWWWWWSS'],
    ...[19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30].map((y) => [y, 13, 'wWWWWWWW']),
    // Near arm: upper arm hanging at her side, elbow bent at the waist, forearm level and
    // straight into the back of the gun (her hand is inside it, as with the real thing).
    ...[18, 19, 20, 21, 22, 23, 24].map((y) => [y, 20, 'SS']),
    [25, 19, 'sSS'], [26, 19, 'sSSSS'], [27, 19, 'sssss'],
    // The jumpsuit's top tied round her waist: a smooth band, flush with her body front and
    // back, with a fold line through it.
    [31, 13, 'oOOOOOOOO'],
    [32, 13, 'oOOOOOOOO'],
    [33, 13, 'ooooooooo'],
    [34, 13, 'oOOOOOOOO'],
    [35, 14, 'oOOOOOOO'],
    [36, 14, 'oOOOOOO'],
    // The portal gun, worn on her forearm at the hip and pointing forward.
    [24, 26, 'gGGGG'],
    [25, 24, 'kgGGGGGGGkk'],
    [26, 24, 'kGGGGGGGGGkbb'],
    [27, 24, 'kGGGGGGGGkkbc'],
    [28, 24, 'kgGGGGGGgkk'],
    [29, 25, 'kkgggkk']
];
const MUZZLE_FLASH = [[25, 36, 'cb'], [26, 36, 'ccb'], [27, 36, 'ccb'], [28, 36, 'cb']];

/**
 * One leg: orange jumpsuit from the hip, then a Long Fall Boot (light brace up the shin, dark
 * foot, the curved spring strut behind the heel). A swinging foot is lifted `lift` px.
 * @param {number} f - Foot offset from the hip (whole source px, + is forward).
 */
function drawLeg(ctx, hipX, f, lift, suit) {
    const ankleX = hipX + f;
    const sole = GROUND - lift;
    const ankleY = sole - 3;
    const kneeX = Math.round((hipX + ankleX) / 2) + (lift > 0 ? 2 : 0);
    ctx.fillStyle = suit;
    thickLine(ctx, hipX, HIP_Y, kneeX, KNEE_Y - lift);
    thickLine(ctx, kneeX, KNEE_Y - lift, ankleX, ankleY - 5);
    // Boot brace up the shin.
    ctx.fillStyle = LEG.boot;
    ctx.fillRect(ankleX - 1, ankleY - 5, 3, 6);
    ctx.fillStyle = LEG.bootShade;
    ctx.fillRect(ankleX - 1, ankleY - 5, 1, 6);
    // Foot.
    ctx.fillStyle = LEG.foot;
    ctx.fillRect(ankleX - 1, sole - 2, 5, 1);
    ctx.fillRect(ankleX - 1, sole - 1, 6, 2);
    // The spring strut, curving down behind the heel.
    ctx.fillStyle = LEG.strut;
    ctx.fillRect(ankleX - 2, ankleY - 4, 1, 2);
    ctx.fillRect(ankleX - 3, ankleY - 2, 1, 3);
    ctx.fillRect(ankleX - 3, sole - 1, 2, 1);
    ctx.fillRect(ankleX - 2, sole, 2, 1);
}

/**
 * @typedef {{ near: { f: number, lift: number }, far: { f: number, lift: number }, flash: boolean }} ChellPose
 */

/** Draws Chell for one pose, outlined. */
export function drawChell(ctx, pose) {
    ctx.clearRect(0, 0, SPRITE_W, SPRITE_H);
    drawLeg(ctx, FAR_HIP, pose.far.f, pose.far.lift, LEG.far);
    drawLeg(ctx, NEAR_HIP, pose.near.f, pose.near.lift, LEG.near);
    paintRows(ctx, UPPER_BODY, PALETTE);
    if (pose.flash) paintRows(ctx, MUZZLE_FLASH, PALETTE);
    outline(ctx);
}

/** The walking pose `time` seconds into a walk. */
export function chellWalkAt(time) {
    const angle = (2 * Math.PI * time) / WALK_CYCLE;
    const swing = Math.cos(angle);
    // A foot moving forward (its offset growing) is in the air.
    const lifted = Math.sin(angle);
    return {
        near: { f: Math.round(REACH * swing), lift: lifted < 0 ? Math.round(-2 * lifted) : 0 },
        far: { f: Math.round(-REACH * swing), lift: lifted > 0 ? Math.round(2 * lifted) : 0 },
        flash: false
    };
}

/** @param {boolean} [flash] - The gun's muzzle flash, as she fires. */
export const chellStanding = (flash = false) => ({ near: { f: 2, lift: 0 }, far: { f: -2, lift: 0 }, flash });
