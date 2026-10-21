/**
 * @file useViewportProfile.js
 * @description Reports the current layout profile ('phone' | 'tablet' | 'desktop')
 * so route geometry and scenery density can adapt to the screen.
 */

import { useSyncExternalStore } from 'react';

const TABLET_QUERY = '(min-width: 640px)';
const DESKTOP_QUERY = '(min-width: 1024px)';

/** @typedef {'phone' | 'tablet' | 'desktop'} ViewportProfile */

/** @returns {ViewportProfile} */
function getProfile() {
    if (window.matchMedia(DESKTOP_QUERY).matches) return 'desktop';
    if (window.matchMedia(TABLET_QUERY).matches) return 'tablet';
    return 'phone';
}

function subscribe(onChange) {
    const queries = [TABLET_QUERY, DESKTOP_QUERY].map((query) => window.matchMedia(query));
    queries.forEach((query) => query.addEventListener('change', onChange));
    return () => queries.forEach((query) => query.removeEventListener('change', onChange));
}

/** @returns {ViewportProfile} */
export function useViewportProfile() {
    return useSyncExternalStore(subscribe, getProfile, () => 'desktop');
}

const PORTRAIT_QUERY = '(orientation: portrait)';

function subscribePortrait(onChange) {
    const query = window.matchMedia(PORTRAIT_QUERY);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
}

/** @returns {boolean} The viewport is taller than it is wide. */
export function useIsPortrait() {
    return useSyncExternalStore(subscribePortrait, () => window.matchMedia(PORTRAIT_QUERY).matches, () => false);
}
