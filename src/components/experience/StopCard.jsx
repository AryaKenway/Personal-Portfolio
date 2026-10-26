/**
 * @file StopCard.jsx
 * @description Details for the stop the plane is parked at: organization (with
 * its logo), role, period, location, every highlight, and the skills picked up
 * here. Slides in on arrival; the parent's AnimatePresence slides it out when
 * the plane leaves. A card taller than its space scrolls on its own (see useOverflows).
 */

import { useEffect, useRef, useState } from 'react';
import { m } from 'motion/react';
import { CalendarDays, MapPin } from 'lucide-react';
import { PickedUpPasses } from './SkillPassengers.jsx';
import styles from './StopCard.module.css';

/**
 * Logos by milestone id: drop `<id>.png` (or .svg/.jpg/.webp) into
 * src/assets/experience/logos and it shows up. Stops without one show their initial.
 */
const LOGOS = Object.fromEntries(
    Object.entries(import.meta.glob('../../assets/experience/logos/*.{png,svg,jpg,jpeg,webp}', { eager: true, import: 'default' }))
        .map(([path, url]) => [path.split('/').pop().replace(/\.\w+$/, ''), url])
);

export const CARD_MOTION = Object.freeze({
    initial: { opacity: 0, y: 18, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 26 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.18 } }
});

/**
 * Whether the element's content is taller than the element (so it scrolls).
 * Only then does the card take wheel input away from the journey's smooth
 * scroll (`data-lenis-prevent`); a card that fits still flies the plane.
 */
function useOverflows(ref) {
    const [overflows, setOverflows] = useState(false);
    useEffect(() => {
        const element = ref.current;
        const measure = () => setOverflows(element.scrollHeight > element.clientHeight + 1);
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(element);
        for (const child of element.children) observer.observe(child);
        return () => observer.disconnect();
    }, [ref]);
    return overflows;
}

/**
 * @param {Object} props
 * @param {Object} props.milestone - Milestone from careerRepository.
 * @param {number} props.step - This stop's step.
 * @param {readonly number[]} [props.boardTimes] - When each skill's passenger boards (s after landing).
 */
export function StopCard({ milestone, step, boardTimes }) {
    const cardRef = useRef(null);
    const scrollable = useOverflows(cardRef);
    const logo = LOGOS[milestone.id];
    return (
        <m.article
            ref={cardRef}
            className={`${styles.card} ${styles.stopCard}`}
            data-lenis-prevent={scrollable || undefined}
            tabIndex={scrollable ? 0 : undefined}
            {...CARD_MOTION}
        >
            <header className={styles.cardHeader}>
                <div className={styles.cardTitles}>
                    <p className={styles.organization}>{milestone.organization}</p>
                    <h3 className={styles.role}>{milestone.title}</h3>
                </div>
                <span className={styles.logo} aria-hidden="true">
                    {logo ? <img src={logo} alt="" /> : milestone.shortName.charAt(0)}
                </span>
            </header>
            <p className={styles.meta}>
                <span><CalendarDays aria-hidden="true" size={14} />{milestone.period}</span>
                <span><MapPin aria-hidden="true" size={14} />{milestone.location}</span>
            </p>
            <ul className={styles.highlights}>
                {milestone.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
            </ul>
            <PickedUpPasses skills={milestone.skills} step={step} boardTimes={boardTimes} />
        </m.article>
    );
}
