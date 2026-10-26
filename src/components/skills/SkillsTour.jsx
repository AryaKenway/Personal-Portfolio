/**
 * @file SkillsTour.jsx
 * @description The Skills section as a 360° studio tour. A photo panorama on a
 * skydome can be dragged to look around, and each skill group is a hotspot in
 * the room, its skills shown on one of the room's monitors. Choosing a group
 * (its label or its tab) turns the view toward its screen and zooms in. When
 * the tour scrolls into view it keeps cycling through the groups. The visitor
 * takes over with a tab, a hotspot, or a drag; after IDLE_RESUME of no
 * interaction, the cycling starts again.
 *
 * The tabs and panels are the real, accessible content; the labels are a
 * pointer shortcut. The 3D scene (three.js) only downloads near the viewport
 * and with WebGL. Once it's showing, the panels are kept for screen readers
 * only; until then (or without WebGL) they're a glass card over the flat
 * photo, which pans to the chosen group.
 */

import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { skillGroups } from '../../data/portfolio.js';
import panoramaLarge from '../../assets/skills/poly-haven-studio-4096.jpg';
import panoramaSmall from '../../assets/skills/poly-haven-studio-2048.jpg';
import { useOnScreen } from '../experience/useOnScreen.js';
import { useReducedMotion } from '../experience/useReducedMotion.js';
import { buildHotspots, CAMERA_FOV, shortestTurn } from './tourGeometry.js';
import styles from './SkillsTour.module.css';

const PanoramaScene = lazy(() => import('./PanoramaScene.jsx').then((m) => ({ default: m.PanoramaScene })));

const HOTSPOTS = buildHotspots(skillGroups);
/** Time (ms) on each group while the tour plays itself. */
const AUTOPLAY_STEP = 4200;
/** Time (ms) without interaction after which the tour starts playing itself again. */
const IDLE_RESUME = 7000;
/** Movement (px) below which a press counts as a click, not a drag. */
const DRAG_SLOP = 5;
const PITCH_LIMIT = 0.45;

function supportsWebGL() {
    try {
        const canvas = document.createElement('canvas');
        return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
    } catch {
        return false;
    }
}

/** The hotspot nearest the middle of the view, by yaw. */
function nearestHotspot(yaw) {
    let best = 0;
    HOTSPOTS.forEach((hotspot, index) => {
        if (Math.abs(shortestTurn(yaw, hotspot.yaw)) < Math.abs(shortestTurn(yaw, HOTSPOTS[best].yaw))) best = index;
    });
    return best;
}

export function SkillsTour() {
    const tourRef = useRef(null);
    const viewportRef = useRef(null);
    const tabRefs = useRef([]);
    const hotspotRefs = useRef([]);
    const dragRef = useRef(null);
    const draggedClickRef = useRef(false);
    const lookRef = useRef({
        yaw: HOTSPOTS[0].yaw,
        pitch: HOTSPOTS[0].pitch,
        targetYaw: HOTSPOTS[0].yaw,
        targetPitch: HOTSPOTS[0].pitch,
        fov: CAMERA_FOV,
        zoom: true,
        screen: 0
    });
    const reducedMotion = useReducedMotion();
    const onScreen = useOnScreen(tourRef, 0);
    const [active, setActive] = useState(0);
    const [near, setNear] = useState(false);
    const [ready, setReady] = useState(false);
    const [autoplay, setAutoplay] = useState(false);
    const [dragged, setDragged] = useState(false);
    // Bumped on every interaction, so the idle timer below starts over.
    const [interactions, setInteractions] = useState(0);

    const select = useCallback((index) => {
        const look = lookRef.current;
        const hotspot = HOTSPOTS[index];
        look.targetYaw += shortestTurn(look.targetYaw, hotspot.yaw);
        look.targetPitch = hotspot.pitch;
        look.screen = index;
        look.zoom = true;
        setActive(index);
    }, []);

    const takeOver = useCallback(() => {
        setAutoplay(false);
        setInteractions((count) => count + 1);
    }, []);
    const onReady = useCallback(() => setReady(true), []);

    // Load the scene a little before it's reached; start the walk-through once a third is on screen.
    useEffect(() => {
        const element = tourRef.current;
        const webgl = supportsWebGL();
        const nearObserver = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) return;
            if (webgl) setNear(true);
            nearObserver.disconnect();
        }, { rootMargin: '400px 0px' });
        const startObserver = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) return;
            if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) setAutoplay(true);
            startObserver.disconnect();
        }, { threshold: 0.35 });
        nearObserver.observe(element);
        startObserver.observe(element);
        return () => {
            nearObserver.disconnect();
            startObserver.disconnect();
        };
    }, []);

    // Autoplay: loops through every group until the visitor takes over, paused while off screen.
    useEffect(() => {
        if (!autoplay || !onScreen) return undefined;
        const timer = setTimeout(() => select((active + 1) % HOTSPOTS.length), AUTOPLAY_STEP);
        return () => clearTimeout(timer);
    }, [autoplay, onScreen, active, select]);

    // Left alone for IDLE_RESUME after taking over: move on to the next group and play again.
    // Still mid-drag counts as interacting, so the timer just starts over.
    useEffect(() => {
        if (autoplay || interactions === 0 || !onScreen || reducedMotion) return undefined;
        const timer = setTimeout(() => {
            if (dragRef.current) {
                setInteractions((count) => count + 1);
                return;
            }
            select((active + 1) % HOTSPOTS.length);
            setAutoplay(true);
        }, IDLE_RESUME);
        return () => clearTimeout(timer);
    }, [autoplay, interactions, onScreen, reducedMotion, active, select]);

    function onPointerDown(event) {
        if (event.button !== 0 || !ready) return;
        const look = lookRef.current;
        dragRef.current = { x: event.clientX, y: event.clientY, yaw: look.targetYaw, pitch: look.targetPitch, moved: false };
    }

    function onPointerMove(event) {
        const drag = dragRef.current;
        if (!drag) return;
        const dx = event.clientX - drag.x;
        const dy = event.clientY - drag.y;
        if (!drag.moved && Math.hypot(dx, dy) < DRAG_SLOP) return;
        const look = lookRef.current;
        if (!drag.moved) {
            drag.moved = true;
            viewportRef.current.setPointerCapture(event.pointerId);
            takeOver();
            setDragged(true);
            // Zoom out to look round the room while dragging.
            look.zoom = false;
        }
        // One viewport width of drag turns the view by its horizontal field of view.
        const rect = viewportRef.current.getBoundingClientRect();
        const verticalFov = look.fov * Math.PI / 180;
        const radiansPerPixel = 2 * Math.atan(Math.tan(verticalFov / 2) * rect.width / rect.height) / rect.width;
        look.targetYaw = drag.yaw + dx * radiansPerPixel;
        look.targetPitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, drag.pitch + dy * radiansPerPixel));
    }

    // After a drag, the view settles and zooms onto the nearest group, which becomes the chosen one.
    function onPointerUp() {
        const drag = dragRef.current;
        dragRef.current = null;
        draggedClickRef.current = Boolean(drag?.moved);
        if (drag?.moved) select(nearestHotspot(lookRef.current.targetYaw));
    }

    function onHotspotClick(index) {
        // A drag that ends on a hotspot isn't a click on it.
        if (draggedClickRef.current) return;
        takeOver();
        select(index);
    }

    function onTabKeyDown(event, index) {
        const last = HOTSPOTS.length - 1;
        const next = { ArrowRight: index === last ? 0 : index + 1, ArrowLeft: index === 0 ? last : index - 1, Home: 0, End: last }[event.key];
        if (next === undefined) return;
        event.preventDefault();
        takeOver();
        select(next);
        tabRefs.current[next]?.focus();
    }

    const flatPosition = `${(HOTSPOTS[active].spot.u * 100).toFixed(1)}% ${(HOTSPOTS[active].spot.v * 100).toFixed(1)}%`;

    return <div ref={tourRef} className={styles.tour} onFocus={takeOver}>
        <div className={styles.tabs} role="tablist" aria-label="Skill groups">
            {HOTSPOTS.map((hotspot, index) => <button
                key={hotspot.id}
                ref={(element) => { tabRefs.current[index] = element; }}
                id={`skills-tab-${hotspot.id}`}
                type="button"
                role="tab"
                aria-selected={index === active}
                aria-controls={`skills-panel-${hotspot.id}`}
                tabIndex={index === active ? 0 : -1}
                className={styles.tab}
                onClick={() => {
                    takeOver();
                    select(index);
                }}
                onKeyDown={(event) => onTabKeyDown(event, index)}
            >
                {hotspot.id}
            </button>)}
        </div>

        <div
            ref={viewportRef}
            className={`${styles.viewport}${ready ? ` ${styles.viewportReady}` : ''}`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={() => { dragRef.current = null; }}
        >
            <div className={styles.flat} style={{ backgroundImage: `url(${panoramaSmall})`, backgroundPosition: flatPosition }} aria-hidden="true" />
            {near && <div className={styles.scene} aria-hidden="true">
                <Suspense fallback={null}>
                    <PanoramaScene
                        src={panoramaLarge}
                        lookRef={lookRef}
                        hotspots={HOTSPOTS}
                        hotspotRefs={hotspotRefs}
                        active={onScreen}
                        reducedMotion={reducedMotion}
                        onReady={onReady}
                    />
                </Suspense>
            </div>}
            {ready && HOTSPOTS.map((hotspot, index) => <button
                key={hotspot.id}
                ref={(element) => { hotspotRefs.current[index] = element; }}
                type="button"
                tabIndex={-1}
                aria-hidden="true"
                className={`${styles.hotspot}${index === active ? ` ${styles.hotspotActive}` : ''}`}
                onClick={() => onHotspotClick(index)}
            >
                <span className={styles.tag}>{hotspot.id}</span>
            </button>)}
            {ready && <p className={`${styles.hint}${dragged ? ` ${styles.hintGone}` : ''}`} aria-hidden="true">⟷ drag to look around</p>}
        </div>

        <div className={`${styles.card}${ready ? ` ${styles.cardOnScreens}` : ''}`}>
            {HOTSPOTS.map((hotspot, index) => <section
                key={hotspot.id}
                id={`skills-panel-${hotspot.id}`}
                role="tabpanel"
                aria-labelledby={`skills-tab-${hotspot.id}`}
                className={`${styles.panel}${index === active ? ` ${styles.panelActive}` : ''}`}
            >
                <h3 className={styles.panelTitle}>{hotspot.title}</h3>
                <ul className={styles.skillList} aria-label={hotspot.title}>
                    {hotspot.skills.map((skill) => <li key={skill}>{skill}</li>)}
                </ul>
            </section>)}
        </div>
    </div>;
}
