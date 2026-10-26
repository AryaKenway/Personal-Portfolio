/**
 * @file NightSky.jsx
 * @description The 3D sky behind the whole site: a skydome (an inside-out
 * sphere) painted with a procedural nebula whose colour slowly cycles, plus the
 * same drei starfield as the space finale. The view turns as the page scrolls
 * and tilts a little toward the cursor, like looking out of a window.
 *
 * The nebula's noise is expensive, so it's computed once on load into an
 * equirectangular "mask" texture; each frame the dome only samples it and
 * colours it with the current palette.
 */

import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

const DOME_RADIUS = 100;
const CLOSED_FOV = 85;
const OPEN_FOV = 58;

const bakeVertex = /* glsl */ `
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

/* Writes, per direction: R = the dust band's glow, G = the haze, B = the raw
   dust (which picks between the glow's deep and bright tones). */
const bakeFragment = /* glsl */ `
varying vec2 vUv;
const float PI = 3.14159265;

float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
        mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
        mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y),
        f.z
    );
}

float fbm(vec3 p) {
    float sum = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 5; i++) {
        sum += amp * noise(p);
        p *= 2.03;
        amp *= 0.5;
    }
    return sum;
}

void main() {
    // The texel's direction on the sphere. Noise is sampled by direction, so it has no seam.
    float lon = (vUv.x - 0.5) * 2.0 * PI;
    float lat = (vUv.y - 0.5) * PI;
    vec3 dir = vec3(cos(lat) * sin(lon), sin(lat), cos(lat) * cos(lon));

    // A tilted band of dust across the sky, like the Milky Way.
    float band = exp(-pow(dir.y * 2.4 + sin(dir.x * 2.1 + dir.z) * 0.45, 2.0));
    float dust = fbm(dir * 2.4);
    float glow = smoothstep(0.38, 0.85, dust) * band;
    float haze = smoothstep(0.42, 0.9, fbm(dir * 3.6 + 7.0)) * band;
    gl_FragColor = vec4(glow, haze, dust, 1.0);
}
`;

const domeVertex = /* glsl */ `
varying vec3 vDirection;

void main() {
    vDirection = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const domeFragment = /* glsl */ `
uniform sampler2D uMasks;
uniform vec3 uGlow;
uniform vec3 uHaze;
varying vec3 vDirection;
const float PI = 3.14159265;

void main() {
    vec3 dir = normalize(vDirection);
    // The inverse of the bake's mapping. Without mipmaps, the wrap at u = 0/1 shows no seam.
    vec2 uv = vec2(atan(dir.x, dir.z) / (2.0 * PI) + 0.5, asin(clamp(dir.y, -1.0, 1.0)) / PI + 0.5);
    vec3 masks = texture2D(uMasks, uv).rgb;

    // Near-black, darker overhead, with a faint wash of the current colour.
    vec3 color = mix(vec3(0.06, 0.055, 0.05), vec3(0.03, 0.03, 0.04), smoothstep(-0.2, 0.9, dir.y));
    color += uHaze * 0.05;
    color += masks.r * mix(uGlow, mix(uGlow, vec3(1.0), 0.35), masks.b) * 0.55;
    color += masks.g * uHaze * 0.5;
    gl_FragColor = vec4(color, 1.0);
}
`;

/*
 * The colours the nebula drifts through, in order, then back to the start:
 * [dust glow, blue-ish haze]. Each one eases into the next over
 * SECONDS_PER_COLOR, so a full loop takes three and a half minutes.
 */
const SKY_PALETTE = [
    ['#4a5fc1', '#2a2f6e'], // midnight blue
    ['#8a4fc4', '#3a2a6e'], // violet
    ['#c2457f', '#4a2350'], // magenta
    ['#b8342c', '#4d1f2a'], // crimson
    ['#e0702e', '#5a2a1a'], // ember orange
    ['#d8a03a', '#4a3a1c'], // amber
    ['#2fa39a', '#183f4a'], // teal
].map(([glow, haze]) => [new THREE.Color(glow), new THREE.Color(haze)]);
const SECONDS_PER_COLOR = 30;

/** Writes the palette colour for the current moment into `glow` and `haze`.
 * Uses the wall clock, so every page (and a reload) shows the same colour. */
function paletteAt(seconds, glow, haze) {
    const position = (seconds / SECONDS_PER_COLOR) % SKY_PALETTE.length;
    const index = Math.floor(position);
    const [glowFrom, hazeFrom] = SKY_PALETTE[index];
    const [glowTo, hazeTo] = SKY_PALETTE[(index + 1) % SKY_PALETTE.length];
    const t = THREE.MathUtils.smootherstep(position - index, 0, 1);
    glow.lerpColors(glowFrom, glowTo, t);
    haze.lerpColors(hazeFrom, hazeTo, t);
}

/** Renders the nebula masks once into an equirectangular texture (2:1, longitude across). */
function bakeMasks(gl, width) {
    const target = new THREE.WebGLRenderTarget(width, width / 2, {
        depthBuffer: false,
        generateMipmaps: false,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        wrapS: THREE.RepeatWrapping,
        wrapT: THREE.ClampToEdgeWrapping
    });
    const quad = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 2),
        new THREE.ShaderMaterial({ vertexShader: bakeVertex, fragmentShader: bakeFragment, depthTest: false, depthWrite: false })
    );
    const scene = new THREE.Scene();
    scene.add(quad);
    const previous = gl.getRenderTarget();
    gl.setRenderTarget(target);
    gl.render(scene, new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1));
    gl.setRenderTarget(previous);
    quad.geometry.dispose();
    quad.material.dispose();
    return target;
}

function Skydome({ spin, maskWidth }) {
    const gl = useThree((state) => state.gl);
    const invalidate = useThree((state) => state.invalidate);
    const uniforms = useMemo(() => {
        const glow = new THREE.Color();
        const haze = new THREE.Color();
        paletteAt(Date.now() / 1000, glow, haze);
        return { uMasks: { value: null }, uGlow: { value: glow }, uHaze: { value: haze } };
    }, []);
    // Baked and disposed in one effect, so a remount (e.g. StrictMode) never samples a disposed texture.
    useEffect(() => {
        const masks = bakeMasks(gl, maskWidth);
        uniforms.uMasks.value = masks.texture;
        invalidate();
        return () => {
            uniforms.uMasks.value = null;
            masks.dispose();
        };
    }, [gl, maskWidth, uniforms, invalidate]);
    useFrame(() => {
        if (spin) paletteAt(Date.now() / 1000, uniforms.uGlow.value, uniforms.uHaze.value);
    });
    return <mesh>
        <sphereGeometry args={[DOME_RADIUS, 48, 24]} />
        <shaderMaterial vertexShader={domeVertex} fragmentShader={domeFragment} uniforms={uniforms} side={THREE.BackSide} depthWrite={false} />
    </mesh>;
}

/** Turns the camera with the page's scroll progress and the cursor, and
 * pushes in (narrows the field of view) once the sky opens. */
function LookAround({ open, reducedMotion }) {
    const pointer = useRef({ x: 0, y: 0 });
    const look = useRef(null);
    const scrollable = useRef(0);

    // Reading scrollHeight can force a layout, so measure only when the page or window resizes.
    useEffect(() => {
        const measure = () => {
            scrollable.current = document.documentElement.scrollHeight - window.innerHeight;
        };
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(document.body);
        window.addEventListener('resize', measure);
        return () => {
            observer.disconnect();
            window.removeEventListener('resize', measure);
        };
    }, []);

    useEffect(() => {
        if (reducedMotion) return undefined;
        const onPointerMove = (event) => {
            pointer.current.x = event.clientX / window.innerWidth * 2 - 1;
            pointer.current.y = event.clientY / window.innerHeight * 2 - 1;
        };
        window.addEventListener('pointermove', onPointerMove, { passive: true });
        return () => window.removeEventListener('pointermove', onPointerMove);
    }, [reducedMotion]);

    useFrame(({ camera, clock }, delta) => {
        // 0 at the top of the page, 1 at the bottom.
        const progress = scrollable.current > 0 ? THREE.MathUtils.clamp(window.scrollY / scrollable.current, 0, 1) : 0;
        const motion = reducedMotion ? 0 : 1;
        const yaw = -0.55 + progress * 1.6 * motion + clock.elapsedTime * 0.006 * motion - pointer.current.x * 0.12;
        const pitch = 0.32 - progress * 0.45 * motion - pointer.current.y * 0.08;
        if (!look.current) look.current = { yaw, pitch };
        look.current.yaw = THREE.MathUtils.damp(look.current.yaw, yaw, 4, delta);
        look.current.pitch = THREE.MathUtils.damp(look.current.pitch, pitch, 4, delta);
        camera.rotation.set(look.current.pitch, look.current.yaw, 0, 'YXZ');
        const fov = open ? OPEN_FOV : CLOSED_FOV;
        camera.fov = reducedMotion ? fov : THREE.MathUtils.damp(camera.fov, fov, 1.6, delta);
        camera.updateProjectionMatrix();
    });
    return null;
}

/**
 * @param {object} props
 * @param {boolean} props.open - The sky has opened (push the view in).
 * @param {boolean} props.reducedMotion
 */
export function NightSky({ open, reducedMotion }) {
    const isPhone = typeof window !== 'undefined' && window.matchMedia('(max-width: 47.99rem)').matches;
    // Full-screen, so a lower pixel ratio than the old panel: the nebula is soft anyway.
    return <Canvas
        camera={{ fov: open || reducedMotion ? OPEN_FOV : CLOSED_FOV, position: [0, 0, 0], near: 0.1, far: 400 }}
        dpr={[1, 1.25]}
        gl={{ antialias: false, powerPreference: 'low-power' }}
        frameloop={reducedMotion ? 'demand' : 'always'}
    >
        <Skydome spin={!reducedMotion} maskWidth={isPhone ? 1024 : 2048} />
        <Stars radius={50} depth={35} count={isPhone ? 1200 : 2500} factor={3.6} saturation={0} fade speed={reducedMotion ? 0 : 0.5} />
        <LookAround open={open} reducedMotion={reducedMotion} />
    </Canvas>;
}
