/**
 * @file useStageFrame.js
 * @description Measures the pinned stage and works out how to fit the route's
 * world into it: a uniform scale so the world height fits (short screens such
 * as phone landscape shrink it), and a vertical offset to centre it.
 */

import { useLayoutEffect, useMemo, useState } from 'react';

/** Never enlarge the world past this, so tall screens don't get oversized dots. */
const MAX_SCALE = 1.15;

/**
 * Size changes this small (px) are ignored. Pinning can shift the stage by a sub-pixel
 * rounding step, and every reported change rebuilds the scroll timeline (which re-wraps
 * the pinned element and drops keyboard focus).
 */
const RESIZE_TOLERANCE = 2;

/**
 * @typedef {Object} StageFrame
 * @property {number} width - Stage width in px.
 * @property {number} height - Stage height in px.
 * @property {number} scale - World-to-screen scale.
 * @property {number} offsetY - Vertical offset (screen px) that centres the world.
 */

/**
 * @param {import('react').RefObject<HTMLElement>} stageRef
 * @param {number} worldHeight
 * @param {number} [bottomReserve=0] - Fraction of the stage height kept free at the bottom
 *   (phones dock the stop card there); the world is fitted into the space above it.
 * @returns {StageFrame | null} `null` until the stage has been measured.
 */
export function useStageFrame(stageRef, worldHeight, bottomReserve = 0) {
    const [size, setSize] = useState(null);

    useLayoutEffect(() => {
        const stage = stageRef.current;
        if (!stage) return undefined;

        const measure = () => {
            const { width, height } = stage.getBoundingClientRect();
            setSize((current) => (
                current
                && Math.abs(current.width - width) <= RESIZE_TOLERANCE
                && Math.abs(current.height - height) <= RESIZE_TOLERANCE
                    ? current
                    : { width, height }
            ));
        };

        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(stage);
        return () => observer.disconnect();
    }, [stageRef]);

    // Memoized: the scroll timeline is rebuilt whenever this object changes.
    return useMemo(() => {
        if (!size) return null;
        const available = size.height * (1 - bottomReserve);
        const scale = Math.min(MAX_SCALE, available / worldHeight);
        return {
            width: size.width,
            height: size.height,
            scale,
            offsetY: (available - worldHeight * scale) / 2
        };
    }, [size, worldHeight, bottomReserve]);
}
