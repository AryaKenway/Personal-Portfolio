/**
 * @file AboutScene.jsx
 * @description A little pixel-art show in the empty space under the About text, on a loop:
 * 1. Michael Jackson fades in in the middle and moonwalks off the left edge of the screen.
 * 2. An orange portal opens on the right; Chell steps out of it and it closes behind her.
 * 3. She walks to the middle and fires her portal gun: a blue portal opens ahead of her.
 * 4. She walks into it, disappearing as she crosses its edge, and the portal closes.
 * 5. A R.E.P.O. robot sprints across from the right, arms flailing in the air, and off the
 *    left edge of the screen.
 * Then a pause, and it starts again.
 *
 * The sprites (sprites/*.js) are drawn into small canvases scaled up with crisp pixels; this
 * component moves them and runs the timeline. Animates only while on screen; with reduced
 * motion only Michael Jackson is shown, standing.
 */

import { useEffect, useRef } from 'react';
import { SPRITE_H, SPRITE_W } from './sprites/pixels.js';
import { MOONWALKER_STANDING, drawMoonwalker, moonwalkAt } from './sprites/moonwalker.js';
import { CHELL_BACK_COL, CHELL_FRONT_COL, CHELL_SPEED, GUN_TIP, chellStanding, chellWalkAt, drawChell } from './sprites/chell.js';
import { PORTAL_CENTER, PORTAL_COLORS, PORTAL_H, PORTAL_W, drawPortal } from './sprites/portal.js';
import { REPO_BACK_COL, REPO_SPEED, drawRepoBot, repoRunAt } from './sprites/repoBot.js';
import styles from './AboutScene.module.css';

/** Seconds: fading in before the moonwalk, and gone before Chell's portal opens. */
const MJ_ENTER = 1;
const MJ_GONE = 0.8;
/** Seconds for a portal to open or close. */
const PORTAL_SECONDS = 0.3;
/** Seconds: standing before firing, the shot's flight, and waiting once the portal is open. */
const AIM = 0.45;
const SHOT = 0.2;
const AFTER_OPEN = 0.4;
/** Seconds after Chell's portal closes before the robot runs in. */
const REPO_WAIT = 0.6;
/** Seconds of empty stage before Michael Jackson comes back. */
const PAUSE = 1.2;
/** How far in front of her (source px) Chell puts the blue portal. */
const PORTAL_AHEAD = 40;

/** Scale (screen px per source px) for the current viewport. */
const scaleFor = () => (window.innerWidth >= 768 ? 3 : 2);

// Chell is mirrored to face left: an unmirrored column c lands at SPRITE_W - 1 - c.
const CHELL_LEFT = SPRITE_W - 1 - CHELL_FRONT_COL;
const CHELL_RIGHT = SPRITE_W - CHELL_BACK_COL;
const GUN_TIP_COL = SPRITE_W - 1 - GUN_TIP.x;
// The robot is mirrored too: its back is the right edge of its figure on screen.
const REPO_RIGHT = SPRITE_W - REPO_BACK_COL;

export function AboutScene() {
    const stageRef = useRef(null);
    const mjRef = useRef(null);
    const chellRef = useRef(null);
    const repoRef = useRef(null);
    const blueRef = useRef(null);
    const orangeRef = useRef(null);
    const shotRef = useRef(null);

    useEffect(() => {
        const stage = stageRef.current;
        const mj = { el: mjRef.current, ctx: mjRef.current.querySelector('canvas').getContext('2d', { willReadFrequently: true }) };
        const chell = { el: chellRef.current, ctx: chellRef.current.querySelector('canvas').getContext('2d', { willReadFrequently: true }) };
        const repo = { el: repoRef.current, ctx: repoRef.current.querySelector('canvas').getContext('2d', { willReadFrequently: true }) };
        const portals = {
            blue: { el: blueRef.current, ctx: blueRef.current.getContext('2d'), colors: PORTAL_COLORS.blue, open: 0, target: 0, x: 0 },
            orange: { el: orangeRef.current, ctx: orangeRef.current.getContext('2d'), colors: PORTAL_COLORS.orange, open: 0, target: 0, x: 0 }
        };
        const shot = shotRef.current;
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Layout, in stage px (recomputed on resize).
        let scale = scaleFor();
        let mjStart = 0;
        let mjEnd = 0;
        let chellFrom = 0;
        let chellStop = 0;
        let repoFrom = 0;

        // Timeline.
        let phase = 'mjEnter';
        let elapsed = 0;
        let walkTime = 0;
        let walkFrom = 0;
        let drawn = '';
        let raf = 0;
        let lastTime = 0;
        let visible = false;
        let clock = 0;

        const place = (el, x) => { el.style.transform = `translate3d(${x}px, 0, 0)`; };
        const show = (el, on) => { el.style.visibility = on ? 'visible' : 'hidden'; };
        const toGrid = (px) => Math.round(px / scale) * scale;

        const measure = () => {
            scale = scaleFor();
            for (const actor of [mj, chell, repo]) {
                const canvas = actor.el.querySelector('canvas');
                canvas.style.width = `${SPRITE_W * scale}px`;
                canvas.style.height = `${SPRITE_H * scale}px`;
            }
            for (const portal of Object.values(portals)) {
                portal.el.style.width = `${PORTAL_W * scale}px`;
                portal.el.style.height = `${PORTAL_H * scale}px`;
                // The portal's floor row lines up with the sprites' floor (2 rows above their bottom).
                portal.el.style.bottom = `${2 * scale}px`;
            }
            shot.style.bottom = `${(SPRITE_H - GUN_TIP.y - 1) * scale}px`;
            shot.style.width = `${3 * scale}px`;
            shot.style.height = `${scale}px`;

            const rect = stage.getBoundingClientRect();
            mjStart = toGrid((rect.width - SPRITE_W * scale) / 2);
            // Fully past the left edge of the screen.
            mjEnd = -rect.left - SPRITE_W * scale;
            portals.orange.x = toGrid(rect.width - 14 * scale);
            // Chell starts with her front at the orange portal's centre line.
            chellFrom = portals.orange.x - CHELL_LEFT * scale;
            chellStop = mjStart;
            portals.blue.x = chellStop + (CHELL_LEFT - PORTAL_AHEAD) * scale;
            // The robot starts with its back at the stage's right edge.
            repoFrom = toGrid(rect.width - REPO_RIGHT * scale);
            for (const portal of Object.values(portals)) place(portal.el, portal.x - PORTAL_CENTER * scale);
            drawn = '';
            if (phase === 'mjEnter') place(mj.el, mjStart);
        };

        /** Chell's position while walking left from `walkFrom`. */
        const chellX = () => walkFrom - Math.round(CHELL_SPEED * walkTime) * scale;
        const drawChellPose = (pose, x) => {
            const key = `${x}|${pose.near.f}|${pose.near.lift}|${pose.far.f}|${pose.far.lift}|${pose.flash}`;
            if (key === drawn) return;
            drawn = key;
            drawChell(chell.ctx, pose);
            place(chell.el, x);
        };
        /** Shows only the part of Chell left of `right`, or right of `left` (stage px). */
        const clipChell = (x, { left = -Infinity, right = Infinity }) => {
            const width = SPRITE_W * scale;
            const fromLeft = Math.max(0, left - x);
            const fromRight = Math.max(0, x + width - right);
            chell.el.style.clipPath = fromLeft || fromRight ? `inset(0 ${fromRight}px 0 ${fromLeft}px)` : 'none';
        };
        const go = (next) => {
            phase = next;
            elapsed = 0;
        };

        const tick = (now) => {
            const dt = Math.min((now - lastTime) / 1000, 0.1);
            lastTime = now;
            elapsed += dt;
            clock += dt;

            // Portals ease towards open/closed, swirling while open.
            for (const portal of Object.values(portals)) {
                const step = dt / PORTAL_SECONDS;
                portal.open = portal.target > portal.open ? Math.min(portal.target, portal.open + step) : Math.max(portal.target, portal.open - step);
                if (portal.open > 0 || portal.drawnOpen) {
                    drawPortal(portal.ctx, portal.open, portal.colors, clock);
                    portal.drawnOpen = portal.open > 0;
                }
            }

            switch (phase) {
                case 'mjEnter':
                    if (elapsed >= MJ_ENTER) { go('mjWalk'); drawn = ''; }
                    break;
                case 'mjWalk': {
                    const { body, pose } = moonwalkAt(elapsed);
                    const key = `${body}|${pose.near.f}|${pose.far.f}|${pose.near.toe}|${pose.sparkle}`;
                    if (key !== drawn) {
                        drawn = key;
                        drawMoonwalker(mj.ctx, pose);
                        const x = mjStart + body * scale;
                        place(mj.el, x);
                        if (x <= mjEnd) {
                            mj.el.dataset.gone = '';
                            go('mjGone');
                        }
                    }
                    break;
                }
                case 'mjGone':
                    if (elapsed >= MJ_GONE) {
                        portals.orange.target = 1;
                        go('orangeOpen');
                    }
                    break;
                case 'orangeOpen':
                    if (portals.orange.open >= 1) {
                        walkFrom = chellFrom;
                        walkTime = 0;
                        drawn = '';
                        clipChell(chellFrom, { right: portals.orange.x });
                        show(chell.el, true);
                        go('chellOut');
                    }
                    break;
                case 'chellOut': {
                    walkTime += dt;
                    const x = Math.max(chellStop, chellX());
                    clipChell(x, { right: portals.orange.x });
                    // Fully out: the portal closes behind her.
                    if (x + CHELL_RIGHT * scale <= portals.orange.x) portals.orange.target = 0;
                    if (x <= chellStop) {
                        drawChellPose(chellStanding(), chellStop);
                        go('aim');
                    } else {
                        drawChellPose(chellWalkAt(walkTime), x);
                    }
                    break;
                }
                case 'aim':
                    if (elapsed >= AIM) {
                        drawChellPose(chellStanding(true), chellStop);
                        show(shot, true);
                        go('fire');
                    }
                    break;
                case 'fire': {
                    const from = chellStop + GUN_TIP_COL * scale;
                    const progress = Math.min(1, elapsed / SHOT);
                    place(shot, from + (portals.blue.x - from) * progress - 1.5 * scale);
                    if (elapsed > 0.08) drawChellPose(chellStanding(), chellStop);
                    if (progress >= 1) {
                        show(shot, false);
                        portals.blue.target = 1;
                        go('blueOpen');
                    }
                    break;
                }
                case 'blueOpen':
                    if (portals.blue.open >= 1 && elapsed >= PORTAL_SECONDS + AFTER_OPEN) {
                        walkFrom = chellStop;
                        walkTime = 0;
                        go('chellIn');
                    }
                    break;
                case 'chellIn': {
                    walkTime += dt;
                    const x = chellX();
                    drawChellPose(chellWalkAt(walkTime), x);
                    clipChell(x, { left: portals.blue.x });
                    // Fully through: she's gone, and the portal closes.
                    if (x + CHELL_RIGHT * scale <= portals.blue.x) {
                        show(chell.el, false);
                        chell.el.style.clipPath = 'none';
                        portals.blue.target = 0;
                        go('repoWait');
                    }
                    break;
                }
                case 'repoWait':
                    if (elapsed >= REPO_WAIT && portals.blue.open <= 0) {
                        walkTime = 0;
                        drawn = '';
                        drawRepoBot(repo.ctx, repoRunAt(0));
                        place(repo.el, repoFrom);
                        show(repo.el, true);
                        // Fades in as it starts running (see .actor[data-gone]).
                        delete repo.el.dataset.gone;
                        go('repoRun');
                    }
                    break;
                case 'repoRun': {
                    walkTime += dt;
                    const x = repoFrom - Math.round(REPO_SPEED * walkTime) * scale;
                    const pose = repoRunAt(walkTime);
                    const key = `${x}|${pose.near.f}|${pose.near.lift}|${pose.far.f}|${pose.far.lift}|${pose.bob}|${pose.wave}`;
                    if (key !== drawn) {
                        drawn = key;
                        drawRepoBot(repo.ctx, pose);
                        place(repo.el, x);
                    }
                    // Off the left edge of the screen.
                    if (x <= mjEnd) {
                        show(repo.el, false);
                        repo.el.dataset.gone = '';
                        go('pause');
                    }
                    break;
                }
                case 'pause':
                    if (elapsed >= PAUSE) {
                        drawMoonwalker(mj.ctx, MOONWALKER_STANDING);
                        place(mj.el, mjStart);
                        delete mj.el.dataset.gone;
                        go('mjEnter');
                    }
                    break;
                default:
                    break;
            }
            raf = requestAnimationFrame(tick);
        };
        const start = () => {
            if (raf || reducedMotion || !visible) return;
            lastTime = performance.now();
            raf = requestAnimationFrame(tick);
        };
        const stop = () => {
            cancelAnimationFrame(raf);
            raf = 0;
        };

        show(chell.el, false);
        show(repo.el, false);
        repo.el.dataset.gone = '';
        show(shot, false);
        measure();
        drawMoonwalker(mj.ctx, MOONWALKER_STANDING);
        const resizeObserver = new ResizeObserver(measure);
        resizeObserver.observe(stage);
        window.addEventListener('resize', measure);
        const visibilityObserver = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            if (visible) start();
            else stop();
        });
        visibilityObserver.observe(stage);

        return () => {
            stop();
            resizeObserver.disconnect();
            visibilityObserver.disconnect();
            window.removeEventListener('resize', measure);
        };
    }, []);

    return <div ref={stageRef} className={styles.stage} aria-hidden="true">
        <canvas ref={orangeRef} className={`${styles.portal} ${styles.portalOrange}`} width={PORTAL_W} height={PORTAL_H} />
        <canvas ref={blueRef} className={`${styles.portal} ${styles.portalBlue}`} width={PORTAL_W} height={PORTAL_H} />
        <div ref={mjRef} className={styles.actor}>
            <span className={styles.spot} />
            <canvas className={styles.sprite} width={SPRITE_W} height={SPRITE_H} />
        </div>
        <div ref={chellRef} className={styles.actor}>
            <span className={styles.spot} />
            <canvas className={`${styles.sprite} ${styles.mirrored}`} width={SPRITE_W} height={SPRITE_H} />
        </div>
        <div ref={repoRef} className={styles.actor}>
            <span className={styles.spot} />
            <canvas className={`${styles.sprite} ${styles.mirrored}`} width={SPRITE_W} height={SPRITE_H} />
        </div>
        <span ref={shotRef} className={styles.shot} />
    </div>;
}
