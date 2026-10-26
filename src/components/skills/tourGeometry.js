/**
 * @file tourGeometry.js
 * @description Pure: which monitor in the 360° studio panorama shows each skill
 * group, the flat quad that lines up with that monitor from the centre of the
 * dome, and the angles that turn the view toward it.
 */

/** Vertical field of view (degrees) of the tour camera when it isn't zoomed on a screen. */
export const CAMERA_FOV = 62;

/** Size (px) of the panorama the screen corners were measured on. */
const PANORAMA_WIDTH = 4096;
const PANORAMA_HEIGHT = 2048;

/**
 * Each group's monitor as the four corners of its screen on the 4096 × 2048
 * panorama, clockwise from top-left. In data order the tour turns one way round
 * the room.
 */
export const SCREEN_CORNERS = {
    proficiencies: [[448.5, 977.5], [641, 979], [641, 1086.5], [448.5, 1088.5]],  // the big monitor on the left desks
    languages: [[279.5, 981], [444, 983], [444, 1089], [279.5, 1090]],            // the monitor beside it
    tools: [[842.7, 994.3], [951.7, 999.3], [948.3, 1073.3], [842.7, 1079.3]],    // the desk by the garden window
    design: [[2999.3, 964], [3115, 968.3], [3115, 1059.3], [2999.3, 1063.3]],     // the desk with the microphone
    devops: [[3119, 936.7], [3200.7, 936.7], [3200.7, 1013.3], [3119, 1013.3]]    // the tall screen beside it, above the chair
};

/**
 * Unit direction from the centre of the dome to a point on the panorama. Matches
 * a `SphereGeometry` mirrored with `scale(-1, 1, 1)` so the photo reads the right
 * way round from inside.
 * @param {{ u: number, v: number }} spot
 * @returns {[number, number, number]}
 */
export function directionFor({ u, v }) {
    const phi = u * Math.PI * 2;
    const theta = v * Math.PI;
    return [Math.cos(phi) * Math.sin(theta), Math.cos(theta), Math.sin(phi) * Math.sin(theta)];
}

/**
 * Camera yaw and pitch (rotation order YXZ) that look along a direction.
 * @param {[number, number, number]} direction
 * @returns {{ yaw: number, pitch: number }}
 */
export function anglesFor([x, y, z]) {
    return { yaw: Math.atan2(-x, -z), pitch: Math.asin(y) };
}

/**
 * The signed turn (radians, -π to π) from one yaw to another the short way round.
 * @param {number} from
 * @param {number} to
 */
export function shortestTurn(from, to) {
    const turn = (to - from) % (Math.PI * 2);
    if (turn > Math.PI) return turn - Math.PI * 2;
    if (turn < -Math.PI) return turn + Math.PI * 2;
    return turn;
}

const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const det = (a, b, c) => dot(a, cross(b, c));
const scale = (a, s) => a.map((n) => n * s);
const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/**
 * A flat quad, seen from the centre, that covers the screen between four rays.
 * The depth along each ray is chosen so the corners form a parallelogram: a flat
 * surface that a texture maps onto with true perspective, like the real screen.
 * @param {[number, number, number][]} rays - Unit directions, clockwise from top-left.
 * @param {number} radius - Distance of the farthest corner from the centre.
 */
export function screenQuad(rays, radius) {
    const [r0, r1, r2, r3] = rays;
    // r0 + d2·r2 = d1·r1 + d3·r3, solved for the depths by Cramer's rule.
    const minusR2 = scale(r2, -1);
    const d = det(r1, minusR2, r3);
    const depths = [1, det(r0, minusR2, r3) / d, det(r1, r0, r3) / d, det(r1, minusR2, r0) / d];
    const points = rays.map((ray, index) => scale(ray, depths[index]));
    const fit = radius / Math.max(...points.map((point) => Math.hypot(...point)));
    const corners = points.map((point) => scale(point, fit));
    const centre = scale(corners.reduce((sum, point) => sum.map((n, i) => n + point[i])), 1 / 4);
    const width = (distance(corners[0], corners[1]) + distance(corners[3], corners[2])) / 2;
    const height = (distance(corners[0], corners[3]) + distance(corners[1], corners[2])) / 2;
    const reach = Math.hypot(...centre);
    return {
        corners,
        aspect: width / height,
        // Angular size of the screen, used to zoom the camera onto it.
        size: { width: 2 * Math.atan(width / 2 / reach), height: 2 * Math.atan(height / 2 / reach) }
    };
}

/**
 * The groups as hotspots: their screen, where their label sits (just above the
 * screen), and the look angles that centre the screen. A group without a placed
 * screen is spread evenly round the room with a label only.
 * @param {readonly { id: string, title: string, skills: string[] }[]} groups
 * @param {number} radius - Distance of the screens from the centre of the dome.
 */
export function buildHotspots(groups, radius = 40) {
    return groups.map((group, index) => {
        const pixels = SCREEN_CORNERS[group.id];
        if (!pixels) {
            const spot = { u: index / groups.length, v: 0.5 };
            const direction = directionFor(spot);
            return { ...group, spot, direction, screen: null, ...anglesFor(direction) };
        }
        const corners = pixels.map(([x, y]) => ({ u: x / PANORAMA_WIDTH, v: y / PANORAMA_HEIGHT }));
        const spot = { u: corners.reduce((sum, c) => sum + c.u, 0) / 4, v: corners.reduce((sum, c) => sum + c.v, 0) / 4 };
        const label = { u: (corners[0].u + corners[1].u) / 2, v: Math.min(corners[0].v, corners[1].v) - 0.004 };
        return {
            ...group,
            spot,
            direction: directionFor(label),
            screen: screenQuad(corners.map(directionFor), radius),
            ...anglesFor(directionFor(spot))
        };
    });
}
