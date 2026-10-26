/**
 * @file passengers.js
 * @description The boarding-pass colour for each stop, for the "skills ride
 * along as passengers" idea.
 */

/**
 * Boarding-pass colour per stop, in career order (wraps if there are more stops).
 * All pass WCAG AA contrast with white text at the passes' small size.
 */
const PASS_COLORS = Object.freeze(['#2457c5', '#0b7a5c', '#c2410c', '#7c3aed', '#be185d']);

/** @param {number} step - Stop index. */
export function passColorFor(step) {
    return PASS_COLORS[step % PASS_COLORS.length];
}
