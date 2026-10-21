/**
 * @file StopCard.jsx
 * @description Details for the stop the plane is parked at: organization, role,
 * period, location, up to three highlights, and the skills picked up here. Slides in
 * on arrival; the parent's AnimatePresence slides it out when the plane leaves.
 */

import { m } from 'motion/react';
import { CalendarDays, MapPin } from 'lucide-react';
import { PickedUpPasses } from './SkillPassengers.jsx';
import styles from './StopCard.module.css';

const MAX_HIGHLIGHTS = 3;

export const CARD_MOTION = Object.freeze({
    initial: { opacity: 0, y: 18, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 26 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.18 } }
});

/**
 * @param {Object} props
 * @param {Object} props.milestone - Milestone from careerRepository.
 * @param {number} props.step - This stop's step.
 * @param {readonly import('./passengers.js').Passenger[]} props.passengers - Aboard after this stop.
 * @param {readonly number[]} [props.boardTimes] - When each skill's passenger boards (s after landing).
 */
export function StopCard({ milestone, step, passengers, boardTimes }) {
    return (
        <m.article className={styles.card} {...CARD_MOTION}>
            <p className={styles.organization}>{milestone.organization}</p>
            <h3 className={styles.role}>{milestone.title}</h3>
            <p className={styles.meta}>
                <span><CalendarDays aria-hidden="true" size={14} />{milestone.period}</span>
                <span><MapPin aria-hidden="true" size={14} />{milestone.location}</span>
            </p>
            <ul className={styles.highlights}>
                {milestone.highlights.slice(0, MAX_HIGHLIGHTS).map((highlight) => <li key={highlight}>{highlight}</li>)}
            </ul>
            <PickedUpPasses
                skills={milestone.skills}
                step={step}
                boardedAt={new Map(passengers.map((p) => [p.skill, p.boardedAt]))}
                boardTimes={boardTimes}
            />
        </m.article>
    );
}
