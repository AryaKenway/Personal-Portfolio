/**
 * @file useAmbientMotion.js
 * @description Runs looping decorative GSAP tweens (swaying trees, drifting
 * clouds) scoped to an element. The loops pause while that element is
 * off-screen and are skipped entirely when reduced motion is requested.
 */

import { gsap, useGSAP } from './gsapSetup.js';

/**
 * @param {import('react').RefObject<HTMLElement>} scopeRef - Element the tweens' targets are selected within.
 * @param {(utils: { gsap: typeof gsap, select: (selector: string) => Element[] }) => gsap.core.Tween[]} build
 *   Creates the looping tweens and returns them.
 * @param {{
 *   enabled: boolean,
 *   dependencies: unknown[],
 *   visibilityRef?: import('react').RefObject<HTMLElement>
 * }} options - `visibilityRef` (default: the scope) is the element whose visibility gates the loops.
 */
export function useAmbientMotion(scopeRef, build, { enabled, dependencies, visibilityRef = scopeRef }) {
    useGSAP(() => {
        const scope = scopeRef.current;
        // A parent's ref (e.g. the stage) isn't attached yet when a child mounts with it, so
        // fall back to watching the scope rather than never starting.
        const watched = visibilityRef.current ?? scope;
        if (!enabled || !scope) return undefined;

        const tweens = build({ gsap, select: (selector) => gsap.utils.toArray(selector, scope) });
        const observer = new IntersectionObserver(([entry]) => {
            tweens.forEach((tween) => (entry.isIntersecting ? tween.resume() : tween.pause()));
        });
        observer.observe(watched);
        return () => observer.disconnect();
    }, { scope: scopeRef, dependencies: [enabled, ...dependencies], revertOnUpdate: true });
}
