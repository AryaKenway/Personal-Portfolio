/**
 * @file FlightPlane.jsx
 * @description The Lottie monoplane, built in layers the scroll engine animates:
 * - the plane element moves along the straight flight line and pitches (nose up on
 *   take-off, down on landing);
 * - its shadow stays on the ground, shrinking and fading as the plane climbs;
 * - the lift layer raises and slightly enlarges the plane between stops, since a
 *   top-down map shows altitude as distance from the shadow;
 * - the facing layer flips the plane when the visitor scrolls back.
 */

import planeUrl from '../../assets/experience/lottie/monoplane.json?url';
import { LottieSprite } from './LottieSprite.jsx';
import styles from './FlightJourney.module.css';

/**
 * @param {Object} props
 * @param {number} props.size - Lottie canvas size in world px (the plane fills ~40% of it).
 * @param {import('react').Ref<HTMLDivElement>} props.planeRef - Moved along the route; pitches.
 * @param {import('react').Ref<HTMLDivElement>} props.shadowRef - Ground shadow.
 * @param {import('react').Ref<HTMLDivElement>} props.liftRef - Raised and scaled with altitude.
 * @param {import('react').Ref<HTMLDivElement>} props.facingRef - Flipped for direction.
 */
export function FlightPlane({ size, planeRef, shadowRef, liftRef, facingRef }) {
    return (
        <div className={styles.plane} ref={planeRef} style={{ '--plane-size': `${size}px` }} aria-hidden="true">
            <div className={styles.planeShadow} ref={shadowRef} />
            <div className={styles.planeLift} ref={liftRef}>
                <div className={styles.planeFacing} ref={facingRef}>
                    <LottieSprite src={planeUrl} className={styles.planeLottie} />
                </div>
            </div>
        </div>
    );
}
