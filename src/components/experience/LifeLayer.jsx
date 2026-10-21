/**
 * @file LifeLayer.jsx
 * @description Ambient life on the map: fluttering flags, chimney smoke, water
 * ripples, turning water wheels, and townsfolk strolling the road and the lanes
 * (breathing and looking around whenever they stop).
 * Drawn between the map and the day tint. Loops pause while the stage is
 * off-screen; with reduced motion everything holds still (townsfolk stand at
 * their first spot).
 */

import { useMemo, useRef } from 'react';
import { buildAmbientLife } from './buildLife.js';
import { DIRECTION, LOOK_AROUND } from './lifeConfig.js';
import { LoopSprite, Walker } from './LifeSprites.jsx';
import { useAmbientMotion } from './useAmbientMotion.js';
import { useOnScreen } from './useOnScreen.js';
import styles from './LifeLayer.module.css';

/** Seconds between neighbours' breathing phases, so townsfolk don't bob in step. */
const IDLE_PHASE_STEP = 0.37;

/**
 * @param {Object} props
 * @param {import('./buildWorld.js').World} props.world
 * @param {'phone' | 'tablet' | 'desktop'} props.profile
 * @param {boolean} props.reducedMotion
 * @param {import('react').RefObject<HTMLElement>} props.stageRef - Loops pause while it is off-screen.
 */
export function LifeLayer({ world, profile, reducedMotion, stageRef }) {
    const layerRef = useRef(null);
    const life = useMemo(() => buildAmbientLife(world, profile), [world, profile]);
    const scale = world.tileSize / 16;
    const isOnScreen = useOnScreen(stageRef, 0);

    useAmbientMotion(layerRef, ({ gsap, select }) => select('[data-townsperson]').map((element) => {
        const person = life.townsfolk.find((p) => p.key === element.dataset.townsperson);
        const [start, ...stops] = person.route;
        const speed = person.tilesPerSecond * world.tileSize;
        // The wrapper moves; the walker inside it faces (--dir) and steps (data-walking).
        const walker = element.firstElementChild;
        const timeline = gsap.timeline({ repeat: -1, delay: start.pause ?? 0 });
        let from = start;
        gsap.set(element, { x: start.x, y: start.y });
        for (const point of stops) {
            timeline.set(walker, { '--dir': point.dir, attr: { 'data-walking': 'true' } });
            timeline.to(element, { x: point.x, y: point.y, duration: Math.hypot(point.x - from.x, point.y - from.y) / speed, ease: 'none' });
            timeline.set(walker, { attr: { 'data-walking': 'false' } });
            if (point.pause) {
                // Look around while standing: turn to face the street, then back.
                timeline.to({}, { duration: point.pause * LOOK_AROUND.turnAt });
                timeline.set(walker, { '--dir': DIRECTION.down });
                timeline.to({}, { duration: point.pause * (1 - LOOK_AROUND.turnAt) });
                timeline.set(walker, { '--dir': point.dir });
            }
            from = point;
        }
        return timeline;
    }), { enabled: !reducedMotion, dependencies: [life, world.tileSize], visibilityRef: stageRef });

    return (
        <div className={styles.layer} ref={layerRef} data-paused={!isOnScreen || undefined} aria-hidden="true">
            {life.loops.map((sprite) => <LoopSprite key={sprite.key} sprite={sprite} scale={scale} />)}
            {life.townsfolk.map((person, index) => (
                <div
                    key={person.key}
                    data-townsperson={person.key}
                    className={styles.mover}
                    // Static spot for reduced motion (GSAP sets x/y otherwise).
                    style={{ transform: `translate(${person.route[0].x}px, ${person.route[0].y}px)` }}
                >
                    <Walker
                        character={person.character}
                        scale={scale}
                        dir={person.route[1].dir}
                        idleDelay={-((index * IDLE_PHASE_STEP) % LOOK_AROUND.breatheSeconds)}
                    />
                </div>
            ))}
        </div>
    );
}
