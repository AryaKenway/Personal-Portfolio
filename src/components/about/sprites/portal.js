/**
 * @file portal.js
 * @description A portal standing on the floor, seen side-on: a tall pixel-art oval with a
 * bright rim, a darker swirling middle, opening from a slit (0) to full size (1).
 */

// A little taller than the characters, so walking through it reads clearly.
export const PORTAL_W = 22;
export const PORTAL_H = 72;
/** Column of the portal's centre line, and the floor row its bottom stands on. */
export const PORTAL_CENTER = 11;
const PORTAL_FLOOR = 71;
const FULL_HEIGHT = 70;
const FULL_WIDTH = 16;

export const PORTAL_COLORS = {
    blue: { rim: '#a6deff', edge: '#2f8fff', inner: '#0b2a5c', swirl: '#1d5fb3', glow: '#3b9bff' },
    orange: { rim: '#ffd59a', edge: '#ff8a1f', inner: '#5a2204', swirl: '#a8480c', glow: '#ff8a1f' }
};

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} open - 0 (closed) … 1 (fully open).
 * @param {typeof PORTAL_COLORS.blue} colors
 * @param {number} time - Seconds, for the swirl.
 */
export function drawPortal(ctx, open, colors, time) {
    ctx.clearRect(0, 0, PORTAL_W, PORTAL_H);
    if (open <= 0) return;
    const height = Math.max(2, Math.round(FULL_HEIGHT * open));
    // Opens as a slit first, then widens.
    const width = Math.max(2, Math.round(FULL_WIDTH * Math.min(1, open * 1.6)));
    const top = PORTAL_FLOOR - height + 1;
    const middle = top + (height - 1) / 2;
    const swirlShift = Math.floor(time * 12);
    for (let y = top; y <= PORTAL_FLOOR; y++) {
        const along = height > 1 ? (y - middle) / ((height - 1) / 2) : 0;
        const half = Math.max(0.5, (width / 2) * Math.sqrt(Math.max(0, 1 - along * along)));
        const left = Math.round(PORTAL_CENTER - half);
        const right = Math.round(PORTAL_CENTER + half) - 1;
        for (let x = left; x <= right; x++) {
            const fromEdge = Math.min(x - left, right - x);
            const atCap = y - top < 2 || PORTAL_FLOOR - y < 2;
            let color = colors.inner;
            if (fromEdge === 0 || (atCap && fromEdge < 2)) color = colors.rim;
            else if (fromEdge === 1) color = colors.edge;
            else if ((y + swirlShift + x * 2) % 7 < 2) color = colors.swirl;
            ctx.fillStyle = color;
            ctx.fillRect(x, y, 1, 1);
        }
    }
}
