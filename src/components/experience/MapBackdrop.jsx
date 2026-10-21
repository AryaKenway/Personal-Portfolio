/**
 * @file MapBackdrop.jsx
 * @description The Ninja Adventure world: ground tiles, ground decals and every
 * standing sprite (back to front) are drawn once onto a single canvas at the
 * sheets' native 16px, then scaled up with pixelated rendering. Children render
 * above the map; the tint layer above them is coloured by the scroll engine to
 * move the day from morning to dusk.
 */

import { useEffect, useRef } from 'react';
import { SOURCE_TILE, SPRITES } from './spriteAtlas.js';
import { spriteSource } from './buildWorld.js';
import { SHEET_URLS } from './sceneryAssets.js';
import styles from './FlightJourney.module.css';

/** Loads every sheet once; resolves to { key: HTMLImageElement }. */
function loadSheets() {
    return Promise.all(Object.entries(SHEET_URLS).map(([key, url]) => new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve([key, image]);
        image.onerror = reject;
        image.src = url;
    }))).then(Object.fromEntries);
}

/**
 * @param {Object} props
 * @param {import('./buildWorld.js').World} props.world
 * @param {import('react').Ref<HTMLDivElement>} props.tintRef
 * @param {import('react').ReactNode} [props.children] - Drawn between map and tint.
 * @param {import('react').RefObject<HTMLCanvasElement>} [props.canvasRef] - Shares the map canvas
 *   (the space finale textures its planet from it).
 */
export function MapBackdrop({ world, tintRef, children, canvasRef: sharedCanvasRef }) {
    const ownCanvasRef = useRef(null);
    const canvasRef = sharedCanvasRef ?? ownCanvasRef;
    const T = SOURCE_TILE;

    useEffect(() => {
        const context = canvasRef.current?.getContext('2d');
        if (!context) return undefined;

        let cancelled = false;
        loadSheets().then((sheets) => {
            if (cancelled) return;
            context.imageSmoothingEnabled = false;
            const drawSprite = ({ sprite, col, row }) => {
                const { sheet, slice, rect } = SPRITES[sprite];
                if (slice) {
                    // Stretched: top row, the middle row repeated, bottom row.
                    const [sx, sy, sw] = slice.map((v) => v * T);
                    const rows = rect[3];
                    for (let r = 0; r < rows; r++) {
                        const from = r === 0 ? 0 : r === rows - 1 ? 2 : 1;
                        context.drawImage(sheets[sheet], sx, sy + from * T, sw, T, col * T, (row + r) * T, sw, T);
                    }
                    return;
                }
                const [sx, sy, sw, sh] = spriteSource(sprite);
                context.drawImage(sheets[sheet], sx, sy, sw, sh, col * T, row * T, sw, sh);
            };

            for (let row = 0; row < world.rows; row++) {
                for (let col = 0; col < world.cols; col++) {
                    const [sheet, tx, ty] = world.ground[row * world.cols + col];
                    context.drawImage(sheets[sheet], tx * T, ty * T, T, T, col * T, row * T, T, T);
                }
            }
            for (const decal of world.decals) drawSprite(decal);
            for (const object of world.objects) drawSprite(object);
        }).catch(() => { /* The map stays plain grass colour if a sheet fails to load. */ });

        return () => { cancelled = true; };
    }, [world, T, canvasRef]);

    const bounds = {
        top: world.originY,
        width: world.cols * world.tileSize,
        height: world.rows * world.tileSize
    };

    return (
        <>
            <canvas
                ref={canvasRef}
                className={styles.mapCanvas}
                width={world.cols * T}
                height={world.rows * T}
                style={bounds}
                aria-hidden="true"
            />
            {children}
            <div ref={tintRef} className={styles.mapTint} style={bounds} aria-hidden="true" />
        </>
    );
}
