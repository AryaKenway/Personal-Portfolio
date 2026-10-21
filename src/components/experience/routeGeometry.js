/**
 * @file routeGeometry.js
 * @description Pure geometry for the flight journey. Places every stop on one
 * horizontal flight line and joins them with a straight route, which continues
 * straight on to the open "next destination" past the last stop.
 *
 * The map is seen from above, so the plane's altitude isn't part of the route:
 * the scroll engine lifts the plane off its shadow between stops (`cruiseLift`)
 * and sets it down on each stop's runway.
 *
 * Coordinates are world pixels; the world is wider than the viewport and is
 * panned by the scroll engine. No React or DOM access here.
 */

/** Map tiles between stops, and before the first stop, per profile (see worldLayout.js). */
const STOP_SPACING_TILES = Object.freeze({ phone: 28, tablet: 32, desktop: 32 });
const SIDE_PADDING_TILES = 16;

/**
 * Layout tuning per viewport profile. Spacing and padding are whole tiles so every
 * stop sits on a tile boundary of the map. The flight line (`baselineY`) sits high in
 * the world so the town, road and river fit below it.
 */
const PROFILE_LAYOUT = Object.freeze({
    phone: { tileSize: 32, height: 440, baselineY: 170, cruiseLift: 54, planeSize: 120 },
    tablet: { tileSize: 40, height: 540, baselineY: 250, cruiseLift: 70, planeSize: 145 },
    desktop: { tileSize: 40, height: 540, baselineY: 250, cruiseLift: 82, planeSize: 165 }
});

/**
 * @typedef {Object} RouteStopPoint
 * @property {Object} milestone - Milestone from careerRepository.
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef {Object} FlightRouteGeometry
 * @property {number} width - World width in px.
 * @property {number} height - World height in px.
 * @property {RouteStopPoint[]} stops - Stops in career order.
 * @property {string} routePath - SVG path from the first stop to the last (straight).
 * @property {string} finalePath - SVG path from the last stop to the finale point (straight).
 * @property {{ x: number, y: number }} finale - Open destination after the last stop.
 * @property {number} planeSize - Plane Lottie canvas size in world px.
 * @property {number} cruiseLift - How high the plane flies above its shadow between stops (world px).
 * @property {number} baselineY - y of every stop (the flight line the map is laid out from).
 * @property {number} tileSize - Map tile size in world px (a whole multiple of the 16px source tiles).
 */

/**
 * Camera x (world units) that centres world x on screen, clamped so the camera
 * never pans past either end of the world.
 * @param {number} worldWidth
 * @param {number} viewWidth - Visible width in world units (stage width / scale).
 * @param {number} x - World x to centre.
 */
export function cameraXFor(worldWidth, viewWidth, x) {
    const minCameraX = Math.min(0, viewWidth - worldWidth);
    return Math.min(0, Math.max(minCameraX, viewWidth / 2 - x));
}

/**
 * @param {readonly Object[]} milestones - Ordered milestones.
 * @param {'phone' | 'tablet' | 'desktop'} profile
 * @returns {FlightRouteGeometry}
 */
export function buildRoute(milestones, profile) {
    const key = PROFILE_LAYOUT[profile] ? profile : 'desktop';
    const { height, baselineY, cruiseLift, planeSize, tileSize } = PROFILE_LAYOUT[key];
    const stopSpacing = STOP_SPACING_TILES[key] * tileSize;
    const sidePadding = SIDE_PADDING_TILES * tileSize;

    const stops = milestones.map((milestone, index) => ({
        milestone,
        x: sidePadding + index * stopSpacing,
        y: baselineY
    }));

    const firstStop = stops[0] ?? { x: sidePadding, y: baselineY };
    const lastStop = stops[stops.length - 1] ?? firstStop;
    const finale = { x: lastStop.x + stopSpacing, y: baselineY };

    return {
        width: finale.x + sidePadding,
        height,
        stops,
        routePath: `M ${firstStop.x} ${baselineY} L ${lastStop.x} ${baselineY}`,
        finalePath: `M ${lastStop.x} ${baselineY} L ${finale.x} ${baselineY}`,
        finale,
        planeSize,
        cruiseLift,
        baselineY,
        tileSize
    };
}
