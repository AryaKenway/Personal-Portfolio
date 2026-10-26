/**
 * @file MsdfName.jsx
 * @description The hero name drawn as MSDF glyphs with OGL. Each glyph swells
 * in like ink on load, and glyphs near the cursor lean away and blush with the
 * accent colour. The real heading text stays in the DOM for layout, screen
 * readers and the no-WebGL fallback; it turns transparent once the canvas draws.
 */

import { useEffect, useRef, useState } from 'react';
import { Camera, Color, Geometry, Mesh, Program, Renderer, Text, Texture, Transform } from 'ogl';
import font from '../assets/fonts/eb-garamond-msdf.json';
import atlasUrl from '../assets/fonts/eb-garamond-msdf.png';
import { useReducedMotion } from './experience/useReducedMotion.js';

const GLYPH_STAGGER = 0.08;
const GLYPH_DURATION = 0.9;

const vertex = /* glsl */ `
attribute vec3 position;
attribute vec2 uv;
attribute float id;
attribute vec2 center;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float uTime;
uniform float uSize;
uniform vec2 uPointer;
uniform float uHover;

varying vec2 vUv;
varying float vReveal;
varying float vPull;

void main() {
    float t = clamp((uTime - id * ${GLYPH_STAGGER.toFixed(2)}) / ${GLYPH_DURATION.toFixed(2)}, 0.0, 1.0);
    vReveal = 1.0 - pow(1.0 - t, 3.0);

    vec2 away = center - uPointer;
    float dist = length(away) / uSize;
    vPull = exp(-dist * dist * 2.5) * uHover;

    vec3 pos = position;
    pos.y -= (1.0 - vReveal) * 0.18 * uSize;
    pos.xy += normalize(away + vec2(0.0001)) * vPull * 0.12 * uSize;
    pos.y += vPull * 0.06 * uSize;

    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const fragment = /* glsl */ `
precision highp float;

uniform sampler2D tMap;
uniform float uPxRange;
uniform vec3 uInk;
uniform vec3 uAccent;

varying vec2 vUv;
varying float vReveal;
varying float vPull;

float median(float r, float g, float b) {
    return max(min(r, g), min(max(r, g), b));
}

void main() {
    vec3 msdf = texture2D(tMap, vUv).rgb;
    // Signed distance to the glyph edge in screen pixels, positive inside.
    float dist = (median(msdf.r, msdf.g, msdf.b) - 0.5) * uPxRange;
    // While revealing, the edge sits inside the glyph and is blurred, so strokes
    // swell from thin, soft ink to their full crisp weight.
    float edge = (1.0 - vReveal) * uPxRange * 0.45;
    float soft = mix(4.0, 1.0, vReveal);
    float alpha = clamp((dist - edge) / soft + 0.5, 0.0, 1.0) * smoothstep(0.0, 0.35, vReveal);
    if (alpha < 0.001) discard;
    gl_FragColor = vec4(mix(uInk, uAccent, vPull) * alpha, alpha);
}
`;

/** Text buffers plus a per-vertex glyph centre, so a glyph moves as one piece. */
function buildGeometry(gl, buffers) {
    const glyphCount = buffers.id.length / 4;
    const center = new Float32Array(glyphCount * 8);
    for (let i = 0; i < glyphCount; i++) {
        const p = buffers.position.subarray(i * 12, i * 12 + 12);
        const x = (p[0] + p[3] + p[6] + p[9]) / 4;
        const y = (p[1] + p[4] + p[7] + p[10]) / 4;
        center.set([x, y, x, y, x, y, x, y], i * 8);
    }
    return new Geometry(gl, {
        position: { size: 3, data: buffers.position },
        uv: { size: 2, data: buffers.uv },
        id: { size: 1, data: buffers.id },
        center: { size: 2, data: center },
        index: { data: buffers.index }
    });
}

/**
 * @param {object} props
 * @param {string} props.text
 * @param {string} [props.className]
 */
export default function MsdfName({ text, className = '' }) {
    const headingRef = useRef(null);
    const baselineRef = useRef(null);
    const reducedMotion = useReducedMotion();
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const heading = headingRef.current;
        let renderer;
        try {
            renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio || 1, 2), alpha: true, premultipliedAlpha: true });
        } catch {
            return undefined;
        }
        const { gl } = renderer;
        if (!gl) return undefined;
        gl.clearColor(0, 0, 0, 0);
        const canvas = gl.canvas;
        canvas.setAttribute('aria-hidden', 'true');
        heading.appendChild(canvas);

        const styles = getComputedStyle(heading);
        const camera = new Camera(gl, { left: 0, right: 1, top: 0, bottom: -1 });
        camera.position.z = 1;
        const scene = new Transform();
        const texture = new Texture(gl, { generateMipmaps: false });
        const program = new Program(gl, {
            vertex,
            fragment,
            transparent: true,
            cullFace: false,
            depthTest: false,
            uniforms: {
                tMap: { value: texture },
                uTime: { value: 0 },
                uSize: { value: 1 },
                uPxRange: { value: 1 },
                uPointer: { value: [0, 0] },
                uHover: { value: 0 },
                uInk: { value: new Color(styles.getPropertyValue('--ink').trim() || '#25231f') },
                uAccent: { value: new Color(styles.getPropertyValue('--accent').trim() || '#a44332') }
            }
        });
        let mesh = null;
        let glyphCount = 0;
        const uniforms = program.uniforms;

        // Lay the glyphs out with the heading's own size, tracking and line
        // height, with the first baseline on the DOM text's first baseline.
        function layout() {
            const computed = getComputedStyle(heading);
            const fontSize = parseFloat(computed.fontSize);
            const size = fontSize * font.common.base / font.info.size;
            const letterSpacing = parseFloat(computed.letterSpacing) || 0;
            const lineHeight = parseFloat(computed.lineHeight) || fontSize * 1.2;
            const layoutText = new Text({ font, text, width: heading.clientWidth, size, letterSpacing: letterSpacing / size, lineHeight: lineHeight / size });

            const pad = Math.ceil(fontSize * 0.4);
            const width = heading.clientWidth + pad * 2;
            const height = heading.clientHeight + pad * 2;
            renderer.setSize(width, height);
            canvas.style.left = `${-pad}px`;
            canvas.style.top = `${-pad}px`;
            camera.orthographic({ left: 0, right: width, top: 0, bottom: -height });

            if (mesh) {
                mesh.geometry.remove();
                mesh.setParent(null);
            }
            mesh = new Mesh(gl, { geometry: buildGeometry(gl, layoutText.buffers), program });
            mesh.setParent(scene);
            glyphCount = layoutText.buffers.id.length / 4;

            // Text puts the first baseline at y = 0.07 * size - size in mesh space.
            const baseline = baselineRef.current.getBoundingClientRect().bottom - heading.getBoundingClientRect().top;
            mesh.position.set(pad, -(pad + baseline) - (0.07 * size - size), 0);

            uniforms.uSize.value = size;
            uniforms.uPxRange.value = font.distanceField.distanceRange * (fontSize / font.info.size) * renderer.dpr;
        }

        const revealEnd = () => Math.max(glyphCount - 1, 0) * GLYPH_STAGGER + GLYPH_DURATION;
        const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, hover: 0, targetHover: 0 };
        let loaded = false;
        let visible = false;
        let frame = 0;
        let lastTime = 0;

        function draw() {
            renderer.render({ scene, camera });
        }

        function settled() {
            return uniforms.uTime.value >= revealEnd()
                && Math.abs(pointer.hover - pointer.targetHover) < 0.001
                && Math.abs(pointer.x - pointer.targetX) + Math.abs(pointer.y - pointer.targetY) < 0.1;
        }

        function tick(now) {
            const dt = Math.min((now - lastTime) / 1000, 0.05);
            lastTime = now;
            uniforms.uTime.value += dt;
            const ease = 1 - Math.exp(-dt * 10);
            pointer.x += (pointer.targetX - pointer.x) * ease;
            pointer.y += (pointer.targetY - pointer.y) * ease;
            pointer.hover += (pointer.targetHover - pointer.hover) * ease;
            uniforms.uPointer.value = [pointer.x, pointer.y];
            uniforms.uHover.value = pointer.hover;
            draw();
            frame = settled() ? 0 : requestAnimationFrame(tick);
        }

        function start() {
            if (frame || !loaded || !visible || reducedMotion || settled()) return;
            lastTime = performance.now();
            frame = requestAnimationFrame(tick);
        }

        function onPointerMove(event) {
            if (!mesh) return;
            const rect = canvas.getBoundingClientRect();
            const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
            pointer.targetHover = inside ? 1 : 0;
            if (inside) {
                pointer.targetX = event.clientX - rect.left - mesh.position.x;
                pointer.targetY = -(event.clientY - rect.top) - mesh.position.y;
                if (pointer.hover < 0.001) {
                    pointer.x = pointer.targetX;
                    pointer.y = pointer.targetY;
                }
            }
            start();
        }

        layout();
        if (reducedMotion) uniforms.uTime.value = revealEnd();

        const image = new Image();
        image.onload = () => {
            texture.image = image;
            loaded = true;
            draw();
            setReady(true);
            start();
        };
        image.src = atlasUrl;

        const resizeObserver = new ResizeObserver(() => {
            layout();
            if (loaded) draw();
        });
        resizeObserver.observe(heading);
        const intersectionObserver = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            if (visible) start();
        });
        intersectionObserver.observe(heading);
        if (!reducedMotion) window.addEventListener('pointermove', onPointerMove, { passive: true });

        return () => {
            cancelAnimationFrame(frame);
            image.onload = null;
            resizeObserver.disconnect();
            intersectionObserver.disconnect();
            window.removeEventListener('pointermove', onPointerMove);
            canvas.remove();
            gl.getExtension('WEBGL_lose_context')?.loseContext();
            setReady(false);
        };
    }, [text, reducedMotion]);

    return <h1 ref={headingRef} className={`${className} msdf-name${ready ? ' msdf-name--ready' : ''}`}>
        <span ref={baselineRef} className="msdf-name__baseline" aria-hidden="true" />{text}
    </h1>;
}
