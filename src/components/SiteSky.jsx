/**
 * @file SiteSky.jsx
 * @description The night sky fixed behind every page. A static gradient sky
 * shows straight away (and is the whole sky without WebGL); the 3D sky
 * (three.js) loads on top of it and pushes in once it has mounted. A scrim
 * over both keeps the page's light text readable against the brightest dust.
 */

import { lazy, Suspense, useEffect, useState } from 'react';
import { useReducedMotion } from './experience/useReducedMotion.js';
import styles from './SiteSky.module.css';

const NightSky = lazy(() => import('./NightSky.jsx').then((m) => ({ default: m.NightSky })));

function supportsWebGL() {
    try {
        const canvas = document.createElement('canvas');
        return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
    } catch {
        return false;
    }
}

export default function SiteSky() {
    const reducedMotion = useReducedMotion();
    const [webgl, setWebgl] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        setWebgl(supportsWebGL());
        // One frame closed, then open, so the view eases in from wide on load.
        const frame = window.requestAnimationFrame(() => setOpen(true));
        return () => window.cancelAnimationFrame(frame);
    }, []);

    return <div className={styles.sky} aria-hidden="true">
        {webgl && <Suspense fallback={null}>
            <NightSky open={open || reducedMotion} reducedMotion={reducedMotion} />
        </Suspense>}
        <div className={styles.scrim} />
    </div>;
}
