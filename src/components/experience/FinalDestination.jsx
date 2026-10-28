/**
 * @file FinalDestination.jsx
 * @description The open-ended last stop, one scroll past the final role.
 * - `FinaleMarker` (on the map): an open, dashed destination ring at the end of
 *   the dashed climb, where the plane parks.
 * - `FinaleCard` (overlay): "Next stop: could be your organization!" with the contact links.
 */

import { m } from 'motion/react';
import { Mail } from 'lucide-react';
import { profile } from '../../data/portfolio.js';
import { CARD_MOTION } from './StopCard.jsx';
import styles from './StopCard.module.css';

/**
 * A focusable stop like the others, so keyboard users can reach the finale card's links.
 * @param {Object} props
 * @param {{ x: number, y: number }} props.finale - World position of the open destination.
 * @param {boolean} props.isArrived - The plane is parked here.
 * @param {() => void} props.onSelect
 */
export function FinaleMarker({ finale, isArrived, onSelect }) {
    return (
        <button
            type="button"
            className={`${styles.finaleMarker} ${isArrived ? styles.finaleMarkerArrived : ''}`}
            style={{ left: finale.x, top: finale.y }}
            onClick={onSelect}
            onFocus={(event) => { if (event.currentTarget.matches(':focus-visible')) onSelect(); }}
            aria-current={isArrived ? 'step' : undefined}
            aria-label="Next stop: could be your organization"
        >
            <span className={styles.finaleRing} aria-hidden="true" />
        </button>
    );
}

export function FinaleCard() {
    return (
        <m.article className={`${styles.card} ${styles.finaleCard}`} {...CARD_MOTION}>
            <p className={styles.organization}>Next stop</p>
            <h3 className={styles.role}>Could be your organization!</h3>
            <p className={styles.finaleText}>This journey has been about learning. Along the way I&apos;ve made an impact, and I&apos;m ready to make the next one with your team.</p>
            <p className={styles.finaleLinks}>
                <a href={`mailto:${profile.email}`}><Mail aria-hidden="true" size={15} />Email me</a>
                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn <span aria-hidden="true">↗</span></a>
            </p>
        </m.article>
    );
}
