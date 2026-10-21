/**
 * @file SpaceScene.jsx
 * @description The space finale, drawn with React Three Fiber and loaded lazily near
 * the end of the journey.
 * - Phase 12: a copy of the map around the finale is laid flat exactly over the 2D map
 *   (same scale, same pan, same dusk tint), then curls into a mini planet (a plane whose
 *   vertices morph onto a sphere) as the view pulls back into a field of stars.
 * - Phase 13: the plane becomes a rocket (Lottie, an HTML layer over the canvas) that
 *   rides to the top of the mini planet, launches, and lands on a second planet, a
 *   recoloured district of the same map: the company the route could reach next.
 *
 * Driven by the scroll timeline through `spaceState` (`morph`: flat map â†’ planet,
 * `rocket`: plane â†’ rocket, `travel`: the flight to the second planet), read every
 * frame, so scrolling never re-renders React. Everything is placed from one screen-space
 * layout (`spaceLayout`) so the planets and the rocket always agree.
 */

import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import rocketUrl from '../../assets/experience/lottie/rocket.json?url';
import { gsap } from './gsapSetup.js';
import { LottieSprite } from './LottieSprite.jsx';
import styles from './FlightJourney.module.css';

const CAMERA_DISTANCE = 10;
/** Planet radius in scene units (the camera's fov sets how big that looks). */
const RADIUS = 1;
/** The copied map region is this much bigger than the stage, so no edge shows. */
const COPY_MARGIN = 1.1;
/** Spin speed once a planet has formed (radians per second). */
const SPIN = 0.18;
/** Second planet: map rows (from the flight line) it is cut from, and its hue shift. */
const COMPANY_ROWS = { from: -4, to: 12 };
const COMPANY_HUE_DEG = 165;
/** Rocket Lottie: width / height of its box, and where its nozzle sits (share of the height). */
const ROCKET_ASPECT = 0.74;
const ROCKET_BASE = 0.62;

const smoothstep = (edge0, edge1, x) => {
    const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
};
const lerp = (from, to, t) => from + (to - from) * t;
const lerpPoint = (a, b, t) => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });

/**
 * Where everything sits on screen (stage px), for a stage size and the flight's progress.
 * The formed mini planet starts centred in the space the card leaves free, then moves to
 * a corner as the second planet comes in; the card (top-left, or docked below) stays clear.
 */
function spaceLayout(width, height, cardReserve, travel) {
    const docked = cardReserve > 0;
    const free = height * (1 - cardReserve);
    const formed = { x: width / 2, y: free / 2, d: Math.min(0.36 * free, 0.7 * width) };
    const company = docked
        ? { x: 0.66 * width, y: 0.46 * free, d: Math.min(0.52 * free, 0.58 * width) }
        : { x: 0.68 * width, y: 0.5 * height, d: Math.min(0.46 * height, 0.4 * width) };
    const corner = docked
        ? { x: 0.22 * width, y: 0.9 * free, d: 0.42 * company.d }
        : { x: 0.2 * width, y: 0.78 * height, d: 0.42 * company.d };

    // The view swings: the mini planet drifts to its corner while the second one comes in.
    const swing = smoothstep(0, 0.6, travel);
    const mini = { ...lerpPoint(formed, corner, swing), d: lerp(formed.d, corner.d, swing) };
    const offstage = { x: width + company.d, y: docked ? -0.2 * free : 0.2 * height };
    const second = { ...lerpPoint(offstage, company, swing), d: company.d * lerp(0.6, 1, swing) };
    const rocketSize = Math.min(130, Math.max(56, 0.15 * Math.min(width, free)));
    return { formed, mini, second, rocketSize };
}

/** Rotates hues in place (the CSS hue-rotate matrix), so it works without canvas filters. */
function hueRotate(context, width, height, degrees) {
    const image = context.getImageData(0, 0, width, height);
    const a = THREE.MathUtils.degToRad(degrees);
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    const m = [
        0.213 + cos * 0.787 - sin * 0.213, 0.715 - cos * 0.715 - sin * 0.715, 0.072 - cos * 0.072 + sin * 0.928,
        0.213 - cos * 0.213 + sin * 0.143, 0.715 + cos * 0.285 + sin * 0.14, 0.072 - cos * 0.072 - sin * 0.283,
        0.213 - cos * 0.213 - sin * 0.787, 0.715 - cos * 0.715 + sin * 0.715, 0.072 + cos * 0.928 + sin * 0.072
    ];
    const px = image.data;
    for (let i = 0; i < px.length; i += 4) {
        const r = px[i];
        const g = px[i + 1];
        const b = px[i + 2];
        px[i] = m[0] * r + m[1] * g + m[2] * b;
        px[i + 1] = m[3] * r + m[4] * g + m[5] * b;
        px[i + 2] = m[6] * r + m[7] * g + m[8] * b;
    }
    context.putImageData(image, 0, 0);
}

/** Copies a 2:1 region of the map canvas (source px) into its own canvas. */
function copyRegion(map, centerX, centerY, minHeight) {
    const height = Math.min(map.height, Math.ceil(minHeight));
    const width = Math.min(map.width, height * 2);
    const sx = Math.round(Math.max(0, Math.min(map.width - width, centerX - width / 2)));
    const sy = Math.round(Math.max(0, Math.min(map.height - height, centerY - height / 2)));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    const draw = () => {
        context.imageSmoothingEnabled = false;
        context.clearRect(0, 0, width, height);
        context.drawImage(map, sx, sy, width, height, 0, 0, width, height);
    };
    draw();
    return { canvas, context, draw, sx, sy, width, height };
}

function pixelTexture(canvas) {
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.magFilter = THREE.NearestFilter;
    return texture;
}

/**
 * The mini planet's map: just big enough to cover the stage, centred on the view, with
 * the live tint painted over it (`paint`).
 */
function useMapCopy(mapCanvasRef, centerX, centerY, minHeight) {
    return useMemo(() => {
        const map = mapCanvasRef.current;
        if (!map) return null;
        const region = copyRegion(map, centerX, centerY, minHeight);
        const texture = pixelTexture(region.canvas);
        const paint = (tint) => {
            region.draw();
            if (tint) {
                region.context.fillStyle = tint;
                region.context.fillRect(0, 0, region.width, region.height);
            }
            texture.needsUpdate = true;
        };
        return { ...region, texture, paint };
    }, [mapCanvasRef, centerX, centerY, minHeight]);
}

/** The second planet's map: a district of the same world, recoloured. */
function useCompanyTexture(mapCanvasRef, districtX, baseRow) {
    return useMemo(() => {
        const map = mapCanvasRef.current;
        if (!map) return null;
        const { from, to } = COMPANY_ROWS;
        const region = copyRegion(map, districtX, (baseRow + (from + to) / 2) * 16, (to - from) * 16);
        hueRotate(region.context, region.width, region.height, COMPANY_HUE_DEG);
        return pixelTexture(region.canvas);
    }, [mapCanvasRef, districtX, baseRow]);
}

/**
 * Plane â†’ sphere geometry: a 2Ï€R Ã— Ï€R plane in front of the sphere's centre (z = R)
 * whose vertices morph to the sphere through their UVs, so the map's centre stays put
 * as it curls. With the morph at 1 it is a sphere with that map wrapped once around it.
 */
function useMorphGeometry() {
    return useMemo(() => {
        const height = Math.PI * RADIUS;
        const geometry = new THREE.PlaneGeometry(2 * height, height, 96, 48);
        geometry.translate(0, 0, RADIUS);

        const { uv } = geometry.attributes;
        const sphere = new Float32Array(uv.count * 3);
        for (let i = 0; i < uv.count; i++) {
            const lon = (uv.getX(i) - 0.5) * Math.PI * 2;
            const lat = (uv.getY(i) - 0.5) * Math.PI;
            sphere[i * 3] = RADIUS * Math.cos(lat) * Math.sin(lon);
            sphere[i * 3 + 1] = RADIUS * Math.sin(lat);
            sphere[i * 3 + 2] = RADIUS * Math.cos(lat) * Math.cos(lon);
        }
        geometry.morphAttributes.position = [new THREE.Float32BufferAttribute(sphere, 3)];
        return geometry;
    }, []);
}

function Planet({ groupRef, meshRef, glowRef, geometry, texture, glowColor, morph }) {
    return (
        <group ref={groupRef}>
            <mesh ref={meshRef} geometry={geometry} morphTargetInfluences={[morph]}>
                <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
            </mesh>
            {/* Atmosphere: a soft rim around the formed planet. */}
            <mesh ref={glowRef} scale={1.08}>
                <sphereGeometry args={[RADIUS, 48, 32]} />
                <meshBasicMaterial color={glowColor} transparent opacity={0} side={THREE.BackSide} depthWrite={false} />
            </mesh>
        </group>
    );
}

function SpaceDirector({
    mapCanvasRef, centerX, companyX, baseRow, spaceState, spin, frame, tileSize, originY,
    cameraRef, tintRef, planeRef, rocketRef, cardReserve
}) {
    const mini = { group: useRef(null), mesh: useRef(null), glow: useRef(null) };
    const company = { group: useRef(null), mesh: useRef(null), glow: useRef(null) };
    const spinAngle = useRef(0);
    const paintedTint = useRef(null);
    const geometry = useMorphGeometry();
    const camera = useThree((state) => state.camera);
    const size = useThree((state) => state.size);
    const canvasElement = useThree((state) => state.gl.domElement);
    // Screen px per map source px, as on the 2D map.
    const pxPerSource = frame.scale * (tileSize / 16);
    // Copy what's on screen (plus a margin), centred on the stage's middle.
    const centerY = ((size.height / 2 - frame.offsetY) / frame.scale - originY) * (16 / tileSize);
    const minHeight = (COPY_MARGIN * Math.max(size.height, size.width / 2)) / pxPerSource;
    const copy = useMapCopy(mapCanvasRef, centerX, centerY, minHeight);
    const companyTexture = useCompanyTexture(mapCanvasRef, companyX, baseRow);
    useEffect(() => () => { copy?.texture.dispose(); }, [copy]);
    useEffect(() => () => { companyTexture?.dispose(); }, [companyTexture]);
    useEffect(() => () => geometry.dispose(), [geometry]);

    // Pick the fov that shows the flat copy at exactly the 2D map's scale.
    useLayoutEffect(() => {
        if (!copy) return;
        const copyHeightPx = copy.height * pxPerSource;
        const tan = (Math.PI * RADIUS * size.height) / (2 * (CAMERA_DISTANCE - RADIUS) * copyHeightPx);
        camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(tan));
        camera.updateProjectionMatrix();
    }, [camera, copy, pxPerSource, size.height]);

    useFrame((_, delta) => {
        if (!copy) return;
        const { morph, rocket, travel } = spaceState;
        const { width, height } = size;

        // Keep the copy's colour in step with the live dusk tint while it can still be compared.
        const tint = tintRef.current?.style.backgroundColor ?? '';
        if (tint !== paintedTint.current && morph < 0.5) {
            paintedTint.current = tint;
            copy.paint(tint);
        }

        const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
        const unitsAtPlane = (2 * (CAMERA_DISTANCE - RADIUS) * tan) / height;
        const unitsAtCentre = (2 * CAMERA_DISTANCE * tan) / height;
        const toScene = (point) => [(point.x - width / 2) * unitsAtCentre, -(point.y - height / 2) * unitsAtCentre];
        const toScale = (diameter) => (diameter * unitsAtCentre) / (2 * RADIUS);
        const layout = spaceLayout(width, height, cardReserve, travel);

        // Where the copied region sits on the live map right now (screen px, stage-relative).
        const cameraX = Number(gsap.getProperty(cameraRef.current, 'x')) || 0;
        const left = (cameraX + copy.sx * (tileSize / 16)) * frame.scale;
        const top = frame.offsetY + (originY + copy.sy * (tileSize / 16)) * frame.scale;
        const flatX = (left + (copy.width * pxPerSource) / 2 - width / 2) * unitsAtPlane;
        const flatY = -(top + (copy.height * pxPerSource) / 2 - height / 2) * unitsAtPlane;

        const pull = smoothstep(0.3, 1, morph);
        const formed = smoothstep(0.6, 1, morph);
        if (spin && formed > 0) spinAngle.current += delta * SPIN;

        // Mini planet: flat over the map â†’ formed â†’ off to its corner.
        const [miniX, miniY] = toScene(layout.mini);
        mini.mesh.current.morphTargetInfluences[0] = morph;
        // Spin and tilt fade out again as the planet uncurls (scrolling back).
        mini.mesh.current.rotation.set(0.32 * formed, spinAngle.current * formed, 0);
        mini.group.current.position.set(lerp(flatX, miniX, pull), lerp(flatY, miniY, pull), 0);
        mini.group.current.scale.setScalar(lerp(1, toScale(layout.mini.d), pull));
        mini.glow.current.material.opacity = 0.22 * formed;

        // Second planet: swings in from the edge as the rocket sets off.
        const [secondX, secondY] = toScene(layout.second);
        company.group.current.visible = travel > 0;
        company.group.current.position.set(secondX, secondY, 0);
        company.group.current.scale.setScalar(toScale(layout.second.d));
        company.mesh.current.rotation.set(0.25, -spinAngle.current * 0.8, 0);
        company.glow.current.material.opacity = 0.3 * smoothstep(0.2, 0.7, travel);

        // Rocket: appears over the plane, rides to the top of the forming planet, then flies
        // an arc to the top of the second planet, nose along its path, upright to land.
        const rocketEl = rocketRef.current;
        if (!rocketEl) return;
        rocketEl.style.visibility = rocket > 0 ? 'visible' : 'hidden';
        if (rocket <= 0) return;
        const miniTop = { x: layout.mini.x, y: layout.mini.y - layout.mini.d / 2 };
        const secondTop = { x: layout.second.x, y: layout.second.y - layout.second.d / 2 };
        let base = miniTop;
        if (pull < 1) {
            const stage = canvasElement.getBoundingClientRect();
            const plane = planeRef.current?.getBoundingClientRect();
            const atPlane = plane
                ? { x: plane.left + plane.width / 2 - stage.left, y: plane.top + plane.height / 2 - stage.top }
                : miniTop;
            base = lerpPoint(atPlane, miniTop, pull);
        }
        const flight = smoothstep(0.2, 0.95, travel);
        let angle = 0;
        if (flight > 0) {
            // The arc's control point: well above both tops, but the rocket stays on the stage.
            const lift = {
                x: (miniTop.x + secondTop.x) / 2,
                y: Math.max(layout.rocketSize, Math.min(miniTop.y, secondTop.y) - 0.3 * height)
            };
            const u = 1 - flight;
            base = {
                x: u * u * miniTop.x + 2 * u * flight * lift.x + flight * flight * secondTop.x,
                y: u * u * miniTop.y + 2 * u * flight * lift.y + flight * flight * secondTop.y
            };
            const dx = 2 * u * (lift.x - miniTop.x) + 2 * flight * (secondTop.x - lift.x);
            const dy = 2 * u * (lift.y - miniTop.y) + 2 * flight * (secondTop.y - lift.y);
            angle = Math.atan2(dx, -dy) * Math.sin(Math.PI * flight);
        }
        const h = layout.rocketSize;
        const w = h * ROCKET_ASPECT;
        rocketEl.style.width = `${w}px`;
        rocketEl.style.height = `${h}px`;
        rocketEl.style.transform =
            `translate(${base.x - w / 2}px, ${base.y - h * ROCKET_BASE}px) rotate(${angle}rad) scale(${rocket})`;
    });

    if (!copy) return null;
    return (
        <>
            <Planet groupRef={mini.group} meshRef={mini.mesh} glowRef={mini.glow} geometry={geometry} texture={copy.texture} glowColor="#9fd8ff" morph={0} />
            <Planet groupRef={company.group} meshRef={company.mesh} glowRef={company.glow} geometry={geometry} texture={companyTexture} glowColor="#ffb3f0" morph={1} />
        </>
    );
}

/**
 * @param {Object} props
 * @param {import('react').RefObject<HTMLCanvasElement>} props.mapCanvasRef - The 2D map canvas.
 * @param {number} props.centerX - Map source x the mini planet is centred on (the view at the finale).
 * @param {number} props.companyX - Map source x of the district the second planet is made from.
 * @param {number} props.baseRow - Map row of the flight line.
 * @param {{ morph: number, rocket: number, travel: number }} props.spaceState - Animated by the scroll timeline.
 * @param {import('./useStageFrame.js').StageFrame} props.frame - How the 2D world is fitted to the stage.
 * @param {number} props.tileSize - World px per map tile.
 * @param {number} props.originY - World y of the map canvas's top edge.
 * @param {import('react').RefObject<HTMLElement>} props.cameraRef - The 2D camera (its x is the pan).
 * @param {import('react').RefObject<HTMLElement>} props.tintRef - The 2D map's dusk tint.
 * @param {import('react').RefObject<HTMLElement>} props.planeRef - The 2D plane's visible layer (the rocket starts there).
 * @param {number} props.cardReserve - Share of the stage height the docked card covers.
 * @param {boolean} props.active - Render frames (otherwise the scene is paused).
 * @param {boolean} props.reducedMotion
 * @param {'phone' | 'tablet' | 'desktop'} props.profile
 */
export function SpaceScene({ active, reducedMotion, profile, ...scene }) {
    const isPhone = profile === 'phone';
    const rocketRef = useRef(null);
    return (
        <>
            <Canvas
                camera={{ fov: 40, position: [0, 0, CAMERA_DISTANCE] }}
                dpr={[1, isPhone ? 1.25 : 1.5]}
                gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
                frameloop={active ? 'always' : 'never'}
            >
                <Stars radius={60} depth={40} count={isPhone ? 1500 : 4000} factor={3} saturation={0} fade speed={reducedMotion ? 0 : 0.6} />
                <SpaceDirector {...scene} rocketRef={rocketRef} spin={!reducedMotion} />
            </Canvas>
            <div className={styles.rocket} ref={rocketRef}>
                <LottieSprite src={rocketUrl} className={styles.lottieFill} />
            </div>
        </>
    );
}
