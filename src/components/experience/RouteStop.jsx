/**
 * @file RouteStop.jsx
 * @description One career stop on the route: a pulsing dot with its label,
 * rendered as a focusable button centred on the stop's world position. When the
 * plane lands here, a one-off ripple bursts out of the dot.
 */

import { StopSign } from './StopSign.jsx';
import styles from './FlightJourney.module.css';

/**
 * @param {Object} props
 * @param {import('./routeGeometry.js').RouteStopPoint} props.stop
 * @param {boolean} props.isActive - Nearest stop to the plane.
 * @param {boolean} props.isArrived - The plane is parked here.
 * @param {() => void} props.onSelect
 */
export function RouteStop({ stop, isActive, isArrived, onSelect }) {
    const { milestone } = stop;

    return (
        <button
            type="button"
            className={`${styles.stop} ${isActive ? styles.stopActive : ''}`}
            style={{ left: stop.x, top: stop.y }}
            onClick={onSelect}
            // Keyboard focus flies the plane there, so tabbing never lands on an off-camera stop.
            onFocus={(event) => { if (event.currentTarget.matches(':focus-visible')) onSelect(); }}
            aria-current={isActive ? 'step' : undefined}
            aria-label={`${milestone.organization}: ${milestone.title}, ${milestone.period}`}
        >
            {isArrived && <span className={styles.arrivalRipple} aria-hidden="true" />}
            <span className={styles.stopDot} aria-hidden="true" />
            <StopSign name={milestone.shortName} isActive={isActive} />
        </button>
    );
}
