/**
 * @file SkillPassengers.jsx
 * @description Skills ride along as passengers.
 * - `BoardingWalkers` (on the map): when the plane lands, each skill steps out of one of
 *   the district's houses as a villager holding its boarding pass and walks straight round
 *   to the plane, keeping clear of the stop's sign, then climbs aboard (see `planBoarding`).
 * - `PickedUpPasses` (in the stop card): this stop's skills as boarding passes, each
 *   stamped in the moment its villager boards, in the stop's colour.
 */

import { useRef } from 'react';
import { m } from 'motion/react';
import { gsap, useGSAP } from './gsapSetup.js';
import { BOARDING } from './lifeConfig.js';
import { passColorFor } from './passengers.js';
import { Walker } from './LifeSprites.jsx';
import { useReducedMotion } from './useReducedMotion.js';
import styles from './StopCard.module.css';

/**
 * @param {Object} props
 * @param {readonly import('./buildLife.js').BoardingWalk[]} props.plan
 * @param {number} props.step - The stop's index (for its pass colour).
 * @param {number} props.scale - World px per source px.
 * @param {number} props.tileSize - World px per tile (walking speed).
 */
export function BoardingWalkers({ plan, step, scale, tileSize }) {
    const layerRef = useRef(null);

    useGSAP(() => {
        const speed = BOARDING.tilesPerSecond * tileSize;
        gsap.utils.toArray('[data-passenger]', layerRef.current).forEach((element, i) => {
            const walk = plan[i];
            const walker = element.firstElementChild;
            const timeline = gsap.timeline({ delay: walk.start });
            const legs = (points) => {
                let from = points[0];
                for (const point of points.slice(1)) {
                    timeline.set(walker, { '--dir': point.dir, attr: { 'data-walking': 'true' } });
                    timeline.to(element, { x: point.x, y: point.y, duration: Math.hypot(point.x - from.x, point.y - from.y) / speed, ease: 'none' });
                    from = point;
                }
            };
            const [door] = walk.path;
            // Nearer the bottom of the map draws in front (and its pass over whoever is behind).
            const layerByDepth = () => { element.style.zIndex = Math.round(gsap.getProperty(element, 'y')); };
            gsap.set(element, { x: door.x, y: door.y, opacity: 0 });
            layerByDepth();
            timeline.eventCallback('onUpdate', layerByDepth);
            timeline.to(element, { opacity: 1, duration: 0.2 });
            legs(walk.path);
            // Climb aboard.
            timeline.set(walker, { attr: { 'data-walking': 'false' } });
            timeline.to(element, { opacity: 0, scale: 0.6, duration: BOARDING.boardSeconds, ease: 'power1.in' });
        });
    }, { scope: layerRef, dependencies: [plan, tileSize] });

    return (
        <div className={styles.boarding} ref={layerRef} aria-hidden="true">
            {plan.map((walk) => (
                <div key={walk.skill} data-passenger className={styles.passenger} style={{ opacity: 0 }}>
                    <Walker character={walk.character} scale={scale} dir={walk.path[1]?.dir ?? 0}>
                        <span className={`${styles.pass} ${styles.passOnMap}`} style={{ '--pass-color': passColorFor(step) }}>
                            {walk.skill}
                        </span>
                    </Walker>
                </div>
            ))}
        </div>
    );
}

/**
 * @param {Object} props
 * @param {readonly string[]} props.skills - This stop's skills, in the stop's own order.
 * @param {number} props.step - This stop's index.
 * @param {readonly number[]} [props.boardTimes] - Seconds after landing when each skill boards.
 */
export function PickedUpPasses({ skills, step, boardTimes = [] }) {
    const reducedMotion = useReducedMotion();
    if (skills.length === 0) return null;

    return (
        <div className={styles.manifest}>
            <p className={styles.manifestLabel}>Picked up here</p>
            <ul className={styles.passes}>
                {skills.map((skill, index) => (
                    <m.li
                        key={skill}
                        className={styles.pass}
                        style={{ '--pass-color': passColorFor(step) }}
                        // Stamped in as its villager on the map boards the plane.
                        initial={reducedMotion ? false : { opacity: 0, scale: 1.3, rotate: -8 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 420, damping: 18, delay: boardTimes[index] ?? 0 }}
                    >
                        {skill}
                    </m.li>
                ))}
            </ul>
        </div>
    );
}
