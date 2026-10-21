/**
 * @file useOnScreen.js
 * @description True while most of an element is in the viewport. Used so the
 * first stop's card and boarding play when the visitor reaches the journey,
 * not while it is still off-screen.
 */

import { useEffect, useState } from 'react';

/**
 * @param {import('react').RefObject<HTMLElement>} ref
 * @param {number} [threshold=0.6] - Visible fraction that counts as on screen.
 * @returns {boolean}
 */
export function useOnScreen(ref, threshold = 0.6) {
    const [isOnScreen, setIsOnScreen] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return undefined;
        const observer = new IntersectionObserver(([entry]) => setIsOnScreen(entry.isIntersecting), { threshold });
        observer.observe(element);
        return () => observer.disconnect();
    }, [ref, threshold]);

    return isOnScreen;
}
