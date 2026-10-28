/**
 * @file repoBot.js
 * @description A R.E.P.O. semibot in a panic: an orange capsule head with two big round eyes on
 * a small dark neck joint, a rounded cylinder body with a groove ring near its base, thin
 * tapering cone arms flailing in the air and short tapering cone legs. Drawn three-quarter,
 * facing right (the scene mirrors it to run left).
 */

import { GROUND, SPRITE_H, SPRITE_W, outline } from './pixels.js';

/** Each foot swings ±REACH source px around its hip over one RUN_CYCLE (two strides). */
const REACH = 4;
const RUN_CYCLE = 0.34;
/** Running speed, source px per second (a planted foot covers 2 × REACH in half a cycle). */
export const REPO_SPEED = (4 * REACH) / RUN_CYCLE;
/** Columns the figure spans in the (unmirrored) sprite, back to front. */
export const REPO_BACK_COL = 9;
export const REPO_FRONT_COL = 31;

const COLORS = {
    body: '#e8792f',
    shade: '#b8561c',
    deep: '#8f3f12',
    shine: '#f7a466',
    joint: '#3a2a22',
    eye: '#ffffff',
    eyeShade: '#d9d6d2',
    pupil: '#141414'
};

/** Head: a capsule with a round top (centre x, top-circle centre y, radius, bottom row). */
const HEAD = { cx: 20.5, cy: 18, r: 6.5, bottom: 25 };
/** Body: a rounded cylinder a little wider than the head (rows top…bottom, half-width), with
 * the groove ring near its base. */
const BODY = { cx: 20.5, top: 28, bottom: 48, half: 8, ring: 44 };
const HIP_Y = 49;

/** Fills every pixel `inside` accepts, coloured by `shade(x, y)`. */
function fillShape(ctx, x0, y0, x1, y1, inside, shade) {
    for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
            if (!inside(x + 0.5, y + 0.5)) continue;
            ctx.fillStyle = shade(x + 0.5, y + 0.5);
            ctx.fillRect(x, y, 1, 1);
        }
    }
}

/** A cone from (x0, y0), `w0` px wide, tapering to `w1` px at (x1, y1). */
function cone(ctx, x0, y0, x1, y1, w0, w1, color) {
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1;
    ctx.fillStyle = color;
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const w = Math.max(1, Math.round(w0 + (w1 - w0) * t));
        const x = x0 + (x1 - x0) * t;
        const y = Math.round(y0 + (y1 - y0) * t);
        ctx.fillRect(Math.round(x - (w - 1) / 2), y, w, 1);
    }
}

/** A round pixel disc. */
function disc(ctx, cx, cy, r, color) {
    fillShape(ctx, Math.floor(cx - r), Math.floor(cy - r), Math.ceil(cx + r), Math.ceil(cy + r),
        (x, y) => (x - cx) ** 2 + (y - cy) ** 2 <= r * r, () => color);
}

/** Lit from the front (right) and above: back edge in shade, a small highlight up top. */
function litFrom(cx, half, topY, shineRows) {
    return (x, y) => {
        const across = (x - cx) / half; // -1 back … +1 front
        if (across < -0.6) return across < -0.85 ? COLORS.deep : COLORS.shade;
        if (across > 0.15 && across < 0.6 && y < topY + shineRows) return COLORS.shine;
        return COLORS.body;
    };
}

/** One short leg: a dark hip joint and an orange cone tapering to a pointed foot. */
function drawLeg(ctx, hipX, f, lift, color) {
    ctx.fillStyle = COLORS.joint;
    ctx.fillRect(hipX - 1, HIP_Y - 1, 3, 2);
    cone(ctx, hipX, HIP_Y, hipX + f, GROUND - lift, 3, 1, color);
}

/**
 * @typedef {{ near: { f: number, lift: number }, far: { f: number, lift: number }, bob: number, wave: number }} RepoPose
 */

/** Draws the semibot for one pose, outlined. */
export function drawRepoBot(ctx, pose) {
    ctx.clearRect(0, 0, SPRITE_W, SPRITE_H);
    const b = pose.bob;

    // Legs: the far one in shade.
    drawLeg(ctx, 18, pose.far.f, pose.far.lift, COLORS.shade);
    drawLeg(ctx, 23, pose.near.f, pose.near.lift, COLORS.body);

    // Far arm, raised behind the body.
    cone(ctx, 15, 34 + b, 10, 9 - pose.wave + b, 3, 1, COLORS.shade);

    // Body: a rounded cylinder, its top and base corners rounded off, with a groove ring.
    const { cx, top, bottom, half, ring } = BODY;
    // Shoulders and base rounded off a little.
    const shoulderInset = [1];
    const baseInset = [2, 1];
    fillShape(ctx, Math.floor(cx - half), top + b, Math.ceil(cx + half), bottom + b, (x, y) => {
        const across = Math.abs(x - cx);
        const fromTop = Math.floor(y - (top + b));
        const fromBottom = Math.floor(bottom + b + 1 - y);
        const inset = shoulderInset[fromTop] ?? baseInset[fromBottom] ?? 0;
        return across <= half - inset;
    }, (x, y) => (Math.floor(y - b) === ring ? COLORS.deep : litFrom(cx, half, top + b, 0)(x, y)));

    // Mouth, closed: the head sits right down on the body; the join is a single soft mid-shade
    // seam. No gap, notch or dark band under the eyes.
    ctx.fillStyle = COLORS.body;
    ctx.fillRect(14, 26 + b, 14, 2);
    ctx.fillStyle = COLORS.shade;
    ctx.fillRect(14, 27 + b, 14, 1);

    // Head: a capsule with a round top.
    const head = HEAD;
    fillShape(ctx, Math.floor(head.cx - head.r), Math.floor(head.cy - head.r) + b, Math.ceil(head.cx + head.r), head.bottom + b, (x, y) => {
        const yy = y - b;
        if (yy <= head.cy) return (x - head.cx) ** 2 + (yy - head.cy) ** 2 <= head.r * head.r;
        // Straight sides below, down onto the body.
        return Math.abs(x - head.cx) <= head.r;
    }, (x, y) => litFrom(head.cx, head.r, head.cy - head.r + b, 4)(x, y));

    // Big round eyes, three-quarter: the far one a little smaller, the near one bulging past
    // the face, both wide open.
    for (const [ex, ey, r] of [[18.8, 17, 2.5], [25, 17, 2.9]]) {
        disc(ctx, ex, ey + b, r, COLORS.eye);
        ctx.fillStyle = COLORS.eyeShade;
        ctx.fillRect(Math.round(ex - r + 1), Math.round(ey + r - 1) + b, Math.max(1, Math.round(r * 2 - 2)), 1);
        ctx.fillStyle = COLORS.pupil;
        ctx.fillRect(Math.round(ex), Math.round(ey - 1) + b, 2, 2);
    }

    // Near arm, raised in front, flailing the other way.
    cone(ctx, 26, 34 + b, 30, 8 + pose.wave + b, 3, 1, COLORS.body);
    outline(ctx);
}

/** The running pose `time` seconds into the run. */
export function repoRunAt(time) {
    const angle = (2 * Math.PI * time) / RUN_CYCLE;
    const swing = Math.cos(angle);
    const lifted = Math.sin(angle);
    return {
        near: { f: Math.round(REACH * swing), lift: lifted < 0 ? Math.round(-3 * lifted) : 0 },
        far: { f: Math.round(-REACH * swing), lift: lifted > 0 ? Math.round(3 * lifted) : 0 },
        // Up a pixel as the legs pass each other; the arms flap twice per stride.
        bob: Math.abs(swing) < 0.5 ? -1 : 0,
        wave: Math.round(2 * Math.sin(angle * 2))
    };
}
