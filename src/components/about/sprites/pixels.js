/**
 * @file pixels.js
 * @description Shared helpers for the About scene's pixel-art sprites. Every character is drawn
 * into a SPRITE_W × SPRITE_H canvas (source pixels) standing on row GROUND, then scaled up with
 * crisp pixels by the scene.
 */

export const SPRITE_W = 40;
export const SPRITE_H = 62;
export const GROUND = 59;

/** A pale rim round each figure, so dark clothes read on the night sky. */
const OUTLINE = [118, 111, 146, 255];

/** A 3 px wide line between two source points (a leg). */
export function thickLine(ctx, x0, y0, x1, y1) {
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1;
    for (let i = 0; i <= steps; i++) {
        const x = Math.round(x0 + ((x1 - x0) * i) / steps);
        const y = Math.round(y0 + ((y1 - y0) * i) / steps);
        ctx.fillRect(x - 1, y, 3, 1);
    }
}

/**
 * Pixel rows in drawing order (back to front): [row, first column, pixels], one character per
 * pixel looked up in `palette` ('.' or any unknown character is left empty).
 */
export function paintRows(ctx, rows, palette) {
    for (const [y, x0, pixels] of rows) {
        for (let i = 0; i < pixels.length; i++) {
            const color = palette[pixels[i]];
            if (!color) continue;
            ctx.fillStyle = color;
            ctx.fillRect(x0 + i, y, 1, 1);
        }
    }
}

/** Paints a 1 px outline round everything drawn so far (collected first, so it doesn't grow). */
export function outline(ctx) {
    const image = ctx.getImageData(0, 0, SPRITE_W, SPRITE_H);
    const { data } = image;
    const filled = (x, y) => x >= 0 && y >= 0 && x < SPRITE_W && y < SPRITE_H && data[(y * SPRITE_W + x) * 4 + 3] > 0;
    const rim = [];
    for (let y = 0; y < SPRITE_H; y++) {
        for (let x = 0; x < SPRITE_W; x++) {
            if (filled(x, y)) continue;
            if (filled(x - 1, y) || filled(x + 1, y) || filled(x, y - 1) || filled(x, y + 1)) rim.push((y * SPRITE_W + x) * 4);
        }
    }
    for (const i of rim) data.set(OUTLINE, i);
    ctx.putImageData(image, 0, 0);
}
