/**
 * @file LottieSprite.jsx
 * @description Thin wrapper over lottie-web's light SVG player, used for every animated
 * asset in the journey (plane, sky, rocket). Loops by default and pauses while
 * off-screen. With reduced motion it holds a still from the middle of the loop (many
 * loops start on an empty frame, e.g. clouds that drift in).
 *
 * Animations are plain Lottie JSON files imported with `?url` (so they stay out of the
 * JavaScript bundle and resolve under the GitHub Pages base path); each file is fetched
 * once and shared.
 */

import { useEffect, useRef } from 'react';
import lottie from 'lottie-web/build/player/lottie_light';
import { useReducedMotion } from './useReducedMotion.js';

/** Where in the loop the reduced-motion still is taken (0–1). */
const STILL_FRAME_AT = 0.5;

/** url → Promise of the parsed animation (fetched once per page). */
const animationCache = new Map();
function loadAnimation(url) {
    if (!animationCache.has(url)) {
        animationCache.set(url, fetch(url).then((response) => {
            if (!response.ok) throw new Error(`Lottie ${url}: ${response.status}`);
            return response.json();
        }));
    }
    return animationCache.get(url);
}

/**
 * @param {Object} props
 * @param {string} props.src - URL of a Lottie `.json` file (import it with `?url`).
 * @param {string} [props.className]
 * @param {number} [props.speed]
 */
export function LottieSprite({ src, className, speed = 1 }) {
    const containerRef = useRef(null);
    const reducedMotion = useReducedMotion();

    useEffect(() => {
        const container = containerRef.current;
        let animation = null;
        let visible = true;
        let cancelled = false;
        const playIfVisible = () => {
            if (!animation || reducedMotion) return;
            if (visible) animation.play();
            else animation.pause();
        };

        // lottie-web annotates the data it is given, so each player gets its own copy.
        loadAnimation(src).then((data) => {
            if (cancelled) return;
            animation = lottie.loadAnimation({
                container,
                renderer: 'svg',
                loop: true,
                autoplay: false,
                animationData: structuredClone(data),
                rendererSettings: { preserveAspectRatio: 'xMidYMid meet' }
            });
            animation.setSpeed(speed);
            if (reducedMotion) animation.goToAndStop(Math.floor(animation.totalFrames * STILL_FRAME_AT), true);
            playIfVisible();
        }).catch(() => { /* A missing animation just leaves its slot empty. */ });

        // Off-screen players stop drawing.
        const observer = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            playIfVisible();
        });
        observer.observe(container);

        return () => {
            cancelled = true;
            observer.disconnect();
            animation?.destroy();
        };
    }, [src, speed, reducedMotion]);

    return <div ref={containerRef} className={className} aria-hidden="true" />;
}
