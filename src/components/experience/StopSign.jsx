/**
 * @file StopSign.jsx
 * @description A stop's name as an airport sign on a little post: yellow
 * wayfinding sign normally, and a dark departure board when the plane is at this
 * stop, its letters flipping in one by one like a split-flap display.
 */

import { m } from 'motion/react';
import { PlaneLanding } from 'lucide-react';
import styles from './FlightJourney.module.css';

/** Seconds between letters flipping in. */
const FLAP_STAGGER = 0.035;

/**
 * @param {Object} props
 * @param {string} props.name - Short stop name.
 * @param {boolean} props.isActive - The plane is at (or nearest to) this stop.
 */
export function StopSign({ name, isActive }) {
    return (
        <span className={`${styles.stopSign} ${isActive ? styles.stopSignActive : ''}`} aria-hidden="true">
            <PlaneLanding className={styles.stopSignIcon} size={13} strokeWidth={2.5} />
            {isActive ? (
                // Re-mounted on activation (key) so the split-flap plays every arrival.
                <span key="board" className={styles.flaps}>
                    {[...name].map((char, index) => (
                        <m.span
                            // Index keys are stable here: the name never changes while mounted.
                            key={index}
                            className={char === ' ' ? styles.flapGap : styles.flap}
                            initial={{ rotateX: -90, opacity: 0 }}
                            animate={{ rotateX: 0, opacity: 1 }}
                            transition={{ delay: index * FLAP_STAGGER, duration: 0.22, ease: 'easeOut' }}
                        >
                            {char}
                        </m.span>
                    ))}
                </span>
            ) : (
                <span key="sign">{name}</span>
            )}
        </span>
    );
}
