/**
 * @file passengers.js
 * @description Pure helpers for the "skills ride along as passengers" idea:
 * which skills are on board after a given stop (a skill boards once, at the
 * first stop that lists it), and the boarding-pass colour for each stop.
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

/**
 * @typedef {Object} Passenger
 * @property {string} skill
 * @property {number} boardedAt - Step (stop index) where the skill first boarded.
 */

/**
 * @param {readonly Object[]} milestones - Ordered milestones with `skills`.
 * @param {number} upToStep - Last stop reached (inclusive). Past the last stop, everyone is aboard.
 * @returns {Passenger[]} In boarding order (earliest first).
 */
export function passengersAfter(milestones, upToStep) {
    const boarded = new Map();
    milestones.slice(0, upToStep + 1).forEach((milestone, step) => {
        for (const skill of milestone.skills) {
            if (!boarded.has(skill)) boarded.set(skill, step);
        }
    });
    return [...boarded].map(([skill, boardedAt]) => ({ skill, boardedAt }));
}
