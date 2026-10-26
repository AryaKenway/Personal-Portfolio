/**
 * @file PanoramaScene.jsx
 * @description The 3D half of the skills tour: the studio photo on a skydome
 * (an inside-out sphere) with the camera at its centre, and each skill group
 * painted onto one of the room's monitors. The camera eases toward the tour's
 * target yaw and pitch and zooms onto the chosen screen, and each frame the
 * hotspot labels (plain DOM buttons owned by SkillsTour) are moved onto their
 * spots in the room.
 */

import { Suspense, useEffect, useLayoutEffect, useMemo } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CAMERA_FOV, shortestTurn } from './tourGeometry.js';
import { paintScreen } from './screenTexture.js';

const DOME_RADIUS = 50;
/** Narrowest the camera zooms (degrees), so the photo never blurs too far. Only phones get this close. */
const MIN_FOV = 13;
/** Turn (radians) still to go at which the camera is fully zoomed out, so turns read as a look round the room. */
const ZOOM_OUT_TURN = 0.6;

function Dome({ src, onReady }) {
    const texture = useLoader(THREE.TextureLoader, src);
    texture.colorSpace = THREE.SRGBColorSpace;
    // Mirrored so the photo reads the right way round from inside the sphere.
    const geometry = useMemo(() => new THREE.SphereGeometry(DOME_RADIUS, 64, 32).scale(-1, 1, 1), []);
    useLayoutEffect(() => onReady(), [onReady]);
    return <mesh geometry={geometry}>
        <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>;
}

/** One group's skills on its monitor: a flat quad that lines up with the screen in the photo. */
function Screen({ hotspot }) {
    const gl = useThree((state) => state.gl);
    const { geometry, texture } = useMemo(() => {
        const quad = new THREE.BufferGeometry();
        quad.setAttribute('position', new THREE.Float32BufferAttribute(hotspot.screen.corners.flat(), 3));
        quad.setAttribute('uv', new THREE.Float32BufferAttribute([0, 1, 1, 1, 1, 0, 0, 0], 2));
        quad.setIndex([0, 3, 1, 1, 3, 2]);
        const canvasTexture = new THREE.CanvasTexture(paintScreen(hotspot, hotspot.screen.aspect));
        canvasTexture.colorSpace = THREE.SRGBColorSpace;
        canvasTexture.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
        return { geometry: quad, texture: canvasTexture };
    }, [hotspot, gl]);
    useEffect(() => () => {
        geometry.dispose();
        texture.dispose();
    }, [geometry, texture]);
    return <mesh geometry={geometry}>
        <meshBasicMaterial map={texture} side={THREE.DoubleSide} toneMapped={false} />
    </mesh>;
}

/** Vertical field of view (degrees) that frames a screen comfortably in a view of this aspect. */
function zoomedFov(screen, aspect) {
    const wide = aspect >= 1.6;
    const horizontal = screen.size.width / (wide ? 0.42 : 0.78);
    const fromWidth = 2 * Math.atan(Math.tan(horizontal / 2) / aspect);
    const fromHeight = screen.size.height / (wide ? 0.48 : 0.62);
    return THREE.MathUtils.clamp(THREE.MathUtils.radToDeg(Math.max(fromWidth, fromHeight)), MIN_FOV, CAMERA_FOV);
}

function Rig({ lookRef, hotspots, hotspotRefs, reducedMotion }) {
    const point = useMemo(() => new THREE.Vector3(), []);
    const forward = useMemo(() => new THREE.Vector3(), []);

    useFrame(({ camera, size }, delta) => {
        const look = lookRef.current;
        const ease = reducedMotion ? 1 : 1 - Math.exp(-delta * 4.5);
        const screen = hotspots[look.screen]?.screen;
        let fov = CAMERA_FOV;
        if (look.zoom && screen) {
            // Zoomed out while there's still far to turn, in on the screen as the turn settles.
            const away = reducedMotion ? 0 : Math.min(1, Math.abs(shortestTurn(look.yaw, look.targetYaw)) / ZOOM_OUT_TURN);
            fov = THREE.MathUtils.lerp(zoomedFov(screen, size.width / size.height), CAMERA_FOV, away);
        }
        look.yaw += (look.targetYaw - look.yaw) * ease;
        look.pitch += (look.targetPitch - look.pitch) * ease;
        look.fov += (fov - look.fov) * ease;
        if (Math.abs(camera.fov - look.fov) > 0.001) {
            camera.fov = look.fov;
            camera.updateProjectionMatrix();
        }
        camera.rotation.set(look.pitch, look.yaw, 0, 'YXZ');
        camera.updateMatrixWorld();
        camera.getWorldDirection(forward);

        hotspots.forEach((hotspot, index) => {
            const element = hotspotRefs.current[index];
            if (!element) return;
            point.fromArray(hotspot.direction);
            // Only spots well inside the forward half; behind the camera they'd project mirrored.
            const facing = point.dot(forward) > 0.25;
            point.multiplyScalar(DOME_RADIUS * 0.9).project(camera);
            const x = (point.x + 1) / 2 * size.width;
            const y = (1 - point.y) / 2 * size.height;
            // Fade out toward the sides, so labels never sit cut off at an edge.
            const opacity = facing ? THREE.MathUtils.clamp((0.9 - Math.abs(point.x)) / 0.25, 0, 1) : 0;
            element.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
            element.style.opacity = opacity.toFixed(2);
            element.style.visibility = opacity > 0.05 ? 'visible' : 'hidden';
        });
    });
    return null;
}

/**
 * @param {object} props
 * @param {string} props.src - Equirectangular panorama URL.
 * @param {import('react').RefObject<{ yaw: number, pitch: number, targetYaw: number, targetPitch: number, fov: number, zoom: boolean, screen: number }>} props.lookRef
 * @param {ReturnType<typeof import('./tourGeometry.js').buildHotspots>} props.hotspots
 * @param {import('react').RefObject<HTMLElement[]>} props.hotspotRefs
 * @param {boolean} props.active - Render frames (otherwise the scene is paused).
 * @param {boolean} props.reducedMotion
 * @param {() => void} props.onReady - Called once the panorama has loaded.
 */
export function PanoramaScene({ src, lookRef, hotspots, hotspotRefs, active, reducedMotion, onReady }) {
    return <Canvas
        camera={{ fov: CAMERA_FOV, near: 0.1, far: 200, position: [0, 0, 0] }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, powerPreference: 'low-power' }}
        frameloop={active ? 'always' : 'demand'}
    >
        <Suspense fallback={null}>
            <Dome src={src} onReady={onReady} />
            {hotspots.filter((hotspot) => hotspot.screen).map((hotspot) => <Screen key={hotspot.id} hotspot={hotspot} />)}
        </Suspense>
        <Rig lookRef={lookRef} hotspots={hotspots} hotspotRefs={hotspotRefs} reducedMotion={reducedMotion} />
    </Canvas>;
}
