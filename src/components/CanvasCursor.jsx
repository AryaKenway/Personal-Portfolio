import { useEffect, useRef } from 'react';
import styles from './CanvasCursor.module.css';

/*
 * Replaces the native pointer with a small orbit (a planet with a circling
 * moon) trailed by a bundle of springy, colour-cycling lines (after Cursify's
 * "Canvas Cursor"). Only runs for a fine pointer without reduced motion;
 * everyone else keeps the system cursor. The interactive sections (and the
 * project popup, which is portalled out of its section) get the system cursor
 * back, with no orbit or trails.
 */

const INTERACTIVE = 'a, button, [role="button"], input, select, textarea, label, summary';
const NATIVE_CURSOR_ZONES = '#skills, #experience, #work, .project-popup';
/** The pointer's three orbits, atom-style: each ring's tilt around the screen axis
 * (deg), one lap (s), a head start so the moons don't line up (s), and its moon. */
const ORBITS = [
    { tilt: 0, period: 3.6, phase: 0, color: '#f08a6c' },
    { tilt: 60, period: 4.8, phase: -1.6, color: '#9cc3ff' },
    { tilt: 120, period: 6, phase: -4, color: '#f4f0e8' },
];

const SETTINGS = {
    trails: 20,
    size: 50,
    friction: 0.5,
    dampening: 0.25,
    tension: 0.98,
    lineWidth: 1,
    alpha: 0.2,
};
/** Below these (px, px per frame) the trails count as at rest, and the loop sleeps. */
const SETTLE_DISTANCE = 0.5;
const SETTLE_SPEED = 0.02;

/** A slow sine wave used to drift the trail hue over time. */
class Oscillator {
    constructor({ phase = 0, offset = 0, frequency = 0.001, amplitude = 1 }) {
        this.phase = phase;
        this.offset = offset;
        this.frequency = frequency;
        this.amplitude = amplitude;
    }

    update() {
        this.phase += this.frequency;
        return this.offset + Math.sin(this.phase) * this.amplitude;
    }
}

/** One trail: a chain of nodes, each pulled toward the one ahead of it. */
class Trail {
    constructor(spring, position) {
        this.spring = spring + 0.1 * Math.random() - 0.02;
        this.friction = SETTINGS.friction + 0.01 * Math.random() - 0.002;
        this.nodes = Array.from({ length: SETTINGS.size }, () => ({ x: position.x, y: position.y, vx: 0, vy: 0 }));
    }

    update(position) {
        let spring = this.spring;
        const head = this.nodes[0];
        head.vx += (position.x - head.x) * spring;
        head.vy += (position.y - head.y) * spring;

        for (let i = 0; i < this.nodes.length; i++) {
            const node = this.nodes[i];
            if (i > 0) {
                const previous = this.nodes[i - 1];
                node.vx += (previous.x - node.x) * spring + previous.vx * SETTINGS.dampening;
                node.vy += (previous.y - node.y) * spring + previous.vy * SETTINGS.dampening;
            }
            node.vx *= this.friction;
            node.vy *= this.friction;
            node.x += node.vx;
            node.y += node.vy;
            spring *= SETTINGS.tension;
        }
    }

    /** True once every node has come to rest on the pointer: nothing left to animate. */
    isSettled(position) {
        const head = this.nodes[0];
        if (Math.abs(head.x - position.x) + Math.abs(head.y - position.y) > SETTLE_DISTANCE) return false;
        return this.nodes.every((node) => Math.abs(node.vx) + Math.abs(node.vy) < SETTLE_SPEED);
    }

    draw(context) {
        const nodes = this.nodes;
        context.beginPath();
        context.moveTo(nodes[0].x, nodes[0].y);
        let i = 1;
        for (; i < nodes.length - 2; i++) {
            const current = nodes[i];
            const next = nodes[i + 1];
            context.quadraticCurveTo(current.x, current.y, (current.x + next.x) / 2, (current.y + next.y) / 2);
        }
        context.quadraticCurveTo(nodes[i].x, nodes[i].y, nodes[i + 1].x, nodes[i + 1].y);
        context.stroke();
    }
}

export default function CanvasCursor() {
    const canvasRef = useRef(null);
    const pointerRef = useRef(null);

    useEffect(() => {
        const finePointer = window.matchMedia('(pointer: fine)');
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const canvas = canvasRef.current;
        const pointer = pointerRef.current;
        const context = canvas.getContext('2d');
        let stopEffect;

        const startEffect = () => {
            const position = { x: 0, y: 0 };
            const hue = new Oscillator({ phase: Math.random() * 2 * Math.PI, amplitude: 85, frequency: 0.0015, offset: 285 });
            let trails = [];
            let frame = 0;
            let native = false;

            const resize = () => {
                const ratio = window.devicePixelRatio || 1;
                canvas.width = window.innerWidth * ratio;
                canvas.height = window.innerHeight * ratio;
                context.setTransform(ratio, 0, 0, ratio, 0, 0);
            };
            const render = () => {
                context.globalCompositeOperation = 'source-over';
                context.clearRect(0, 0, window.innerWidth, window.innerHeight);
                context.globalCompositeOperation = 'lighter';
                context.strokeStyle = `hsla(${Math.round(hue.update())}, 50%, 50%, ${SETTINGS.alpha})`;
                context.lineWidth = SETTINGS.lineWidth;
                // In a native-cursor zone the trails keep following unseen, so they're in place on the way out.
                let settled = true;
                for (const trail of trails) {
                    trail.update(position);
                    if (!native) trail.draw(context);
                    if (settled && !trail.isSettled(position)) settled = false;
                }
                if (settled) {
                    // At rest the trails are a dot hidden under the planet: clear it and sleep until the pointer moves.
                    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
                    frame = 0;
                    return;
                }
                frame = window.requestAnimationFrame(render);
            };
            const wake = () => {
                if (!frame) frame = window.requestAnimationFrame(render);
            };
            const movePointer = (event) => {
                position.x = event.clientX;
                position.y = event.clientY;
                // The orbit moves on the event itself, not the render loop, so it never lags the real pointer.
                pointer.style.transform = `translate3d(${position.x}px, ${position.y}px, 0)`;
                pointer.dataset.visible = 'true';
                if (!trails.length) {
                    trails = Array.from({ length: SETTINGS.trails }, (_, i) => new Trail(0.45 + (i / SETTINGS.trails) * 0.025, position));
                }
                wake();
            };
            const updateTarget = (target) => {
                native = Boolean(target?.closest(NATIVE_CURSOR_ZONES));
                document.documentElement.dataset.canvasCursor = native ? 'off' : 'on';
                pointer.dataset.native = String(native);
                pointer.dataset.hover = String(Boolean(target?.closest(INTERACTIVE)));
            };
            const updateHoverState = (event) => {
                updateTarget(event.target instanceof Element ? event.target : null);
            };
            // Scrolling moves the page under a still pointer without any pointer events.
            const updateAfterScroll = () => {
                if (trails.length) updateTarget(document.elementFromPoint(position.x, position.y));
            };
            const press = () => { pointer.dataset.pressed = 'true'; };
            const release = () => { pointer.dataset.pressed = 'false'; };
            const hidePointer = () => {
                pointer.dataset.visible = 'false';
                pointer.dataset.hover = 'false';
            };

            resize();
            document.documentElement.dataset.canvasCursor = 'on';
            document.addEventListener('pointermove', movePointer, { passive: true });
            document.addEventListener('pointerover', updateHoverState, { passive: true });
            document.addEventListener('pointerdown', press, { passive: true });
            document.addEventListener('pointerup', release, { passive: true });
            document.documentElement.addEventListener('pointerleave', hidePointer);
            window.addEventListener('blur', hidePointer);
            window.addEventListener('resize', resize);
            window.addEventListener('scroll', updateAfterScroll, { passive: true });
            // No loop yet: the first pointer move creates the trails and wakes it.

            return () => {
                document.removeEventListener('pointermove', movePointer);
                document.removeEventListener('pointerover', updateHoverState);
                document.removeEventListener('pointerdown', press);
                document.removeEventListener('pointerup', release);
                document.documentElement.removeEventListener('pointerleave', hidePointer);
                window.removeEventListener('blur', hidePointer);
                window.removeEventListener('resize', resize);
                window.removeEventListener('scroll', updateAfterScroll);
                window.cancelAnimationFrame(frame);
                delete document.documentElement.dataset.canvasCursor;
                hidePointer();
                context.clearRect(0, 0, canvas.width, canvas.height);
            };
        };
        const synchronizePreferences = () => {
            const shouldRun = finePointer.matches && !reducedMotion.matches;
            if (shouldRun && !stopEffect) {
                stopEffect = startEffect();
            } else if (!shouldRun && stopEffect) {
                stopEffect();
                stopEffect = undefined;
            }
        };

        synchronizePreferences();
        finePointer.addEventListener('change', synchronizePreferences);
        reducedMotion.addEventListener('change', synchronizePreferences);

        return () => {
            finePointer.removeEventListener('change', synchronizePreferences);
            reducedMotion.removeEventListener('change', synchronizePreferences);
            if (stopEffect) stopEffect();
        };
    }, []);

    return <>
        <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
        <span ref={pointerRef} className={styles.pointer} aria-hidden="true" data-visible="false" data-hover="false" data-pressed="false" data-native="false">
            <span className={styles.system}>
                {ORBITS.map((orbit) => <span key={orbit.tilt} className={styles.orbit} style={{ '--tilt': `${orbit.tilt}deg`, '--period': `${orbit.period}s`, '--phase': `${orbit.phase}s`, '--moon': orbit.color }}>
                    <span className={styles.spin}>
                        <span className={styles.boost}>
                            <span className={styles.moonBoost}>
                                <span className={styles.moon} />
                            </span>
                        </span>
                    </span>
                </span>)}
                <span className={styles.planet} />
            </span>
        </span>
    </>;
}
