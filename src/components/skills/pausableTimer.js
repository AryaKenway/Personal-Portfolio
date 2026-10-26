/**
 * @file pausableTimer.js
 * @description A single pending timeout that can be paused and resumed with
 * its remaining time. The terminal animation is one chain of timeouts (type a
 * character, then the next …), so there is never more than one pending step.
 */

/**
 * @typedef {Object} PausableTimer
 * @property {(callback: () => void, ms: number) => void} later - Replaces any pending step.
 * @property {() => void} clear
 * @property {() => void} pause
 * @property {() => void} resume
 */

/** @returns {PausableTimer} */
export function createPausableTimer() {
    let timer = null;
    let callback = null;
    let due = 0;
    let remaining = null;
    let paused = false;

    const run = () => {
        timer = null;
        const next = callback;
        callback = null;
        next?.();
    };
    const start = (ms) => {
        due = performance.now() + ms;
        timer = setTimeout(run, ms);
    };

    return {
        later(nextCallback, ms) {
            clearTimeout(timer);
            timer = null;
            callback = nextCallback;
            if (paused) remaining = ms;
            else start(ms);
        },
        clear() {
            clearTimeout(timer);
            timer = null;
            callback = null;
            remaining = null;
        },
        pause() {
            if (paused) return;
            paused = true;
            if (timer === null) return;
            clearTimeout(timer);
            timer = null;
            remaining = Math.max(0, due - performance.now());
        },
        resume() {
            if (!paused) return;
            paused = false;
            if (callback && remaining !== null) start(remaining);
            remaining = null;
        }
    };
}
