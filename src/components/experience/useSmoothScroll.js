/**
 * @file useSmoothScroll.js
 * @description Lenis smooth scrolling for wheel and trackpad, driven by GSAP's
 * ticker so ScrollTrigger stays in sync. Touch keeps native scrolling (Lenis
 * leaves touch alone by default). Disabled when reduced motion is requested.
 *
 * `wheelHandlerRef` lets the journey steer wheel gestures: Lenis asks it about
 * every wheel event first, and skips its own handling when it returns `false`.
 */

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { gsap, ScrollTrigger } from './gsapSetup.js';

/**
 * @typedef {(data: { deltaX: number, deltaY: number, event: WheelEvent | TouchEvent }) => boolean} WheelHandler
 */

/**
 * @param {boolean} enabled
 * @returns {{
 *   lenisRef: import('react').RefObject<Lenis | null>,
 *   wheelHandlerRef: import('react').RefObject<WheelHandler | null>
 * }}
 */
export function useSmoothScroll(enabled) {
    const lenisRef = useRef(null);
    const wheelHandlerRef = useRef(null);

    useEffect(() => {
        if (!enabled) return undefined;

        const lenis = new Lenis({
            autoRaf: false,
            virtualScroll: (data) => wheelHandlerRef.current?.(data) ?? true
        });
        const tick = (time) => lenis.raf(time * 1000);

        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);
        lenisRef.current = lenis;

        return () => {
            gsap.ticker.remove(tick);
            gsap.ticker.lagSmoothing(500, 33);
            lenis.destroy();
            lenisRef.current = null;
        };
    }, [enabled]);

    return { lenisRef, wheelHandlerRef };
}
