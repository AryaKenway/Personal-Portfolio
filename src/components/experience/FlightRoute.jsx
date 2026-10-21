/**
 * @file FlightRoute.jsx
 * @description The thick, rounded Mini Metro-style route. A faint "planned" line
 * shows the whole journey; the solid line on top is drawn in by the scroll
 * engine (via `pathLength="1"` + `stroke-dashoffset`). The dashed climb leads
 * to the open final destination.
 */

import styles from './FlightJourney.module.css';

/**
 * @param {Object} props
 * @param {import('./routeGeometry.js').FlightRouteGeometry} props.route
 * @param {import('react').Ref<SVGPathElement>} props.routeLineRef
 * @param {import('react').Ref<SVGPathElement>} props.finaleLineRef
 */
export function FlightRoute({ route, routeLineRef, finaleLineRef }) {
    return (
        <svg
            className={styles.routeSvg}
            width={route.width}
            height={route.height}
            viewBox={`0 0 ${route.width} ${route.height}`}
            aria-hidden="true"
        >
            <path className={styles.routeCasing} d={route.routePath} />
            <path className={styles.routePlanned} d={route.routePath} />
            <path ref={routeLineRef} className={styles.routeLine} d={route.routePath} pathLength="1" />
            <path ref={finaleLineRef} className={styles.finaleLine} d={route.finalePath} />
        </svg>
    );
}
