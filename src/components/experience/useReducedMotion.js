/**
 * @file useReducedMotion.js
 * @description Tracks the visitor's `prefers-reduced-motion` setting.
 */

import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange) {
    const query = window.matchMedia(QUERY);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
}

/** @returns {boolean} */
export function useReducedMotion() {
    return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);
}
