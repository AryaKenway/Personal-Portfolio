/**
 * @file LifeSprites.jsx
 * @description The two kinds of moving sprite on the map, both pixel-crisp CSS
 * sprite animations (frames stepped with `steps()`):
 * - `LoopSprite`: a looping sheet (flag, smoke, ripples, water wheel) at a fixed spot;
 * - `Walker`: a character from a walk sheet (row = facing, columns = frames). GSAP moves
 *   the outer element (its origin is the character's feet) and sets `--dir` (facing) and
 *   `data-walking`; an optional child (e.g. a skill sign) rides above the head.
 */

import { forwardRef } from 'react';
import { LOOPS, WALK } from './lifeConfig.js';
import { CHARACTER_URLS, LOOP_URLS } from './sceneryAssets.js';
import styles from './LifeLayer.module.css';

/**
 * @param {Object} props
 * @param {import('./buildLife.js').LoopSprite} props.sprite
 * @param {number} props.scale - World px per source px.
 */
export function LoopSprite({ sprite, scale }) {
    const { fw, fh, frames, seconds } = LOOPS[sprite.loop];
    return (
        <div
            className={`${styles.loop} ${sprite.loop === 'smoke' ? styles.smoke : ''}`}
            style={{
                left: sprite.x,
                top: sprite.y,
                '--img': `url(${LOOP_URLS[sprite.loop]})`,
                '--fw': `${fw * scale}px`,
                '--fh': `${fh * scale}px`,
                '--frames': frames,
                '--dur': `${seconds}s`,
                '--delay': `${sprite.delay}s`
            }}
        />
    );
}

/**
 * @param {Object} props
 * @param {string} props.character - CHARACTERS entry.
 * @param {number} props.scale - World px per source px.
 * @param {number} [props.dir] - Initial facing (DIRECTION value).
 * @param {number} [props.idleDelay] - Phase of the standing "breathing" loop, s (negative = already running).
 * @param {import('react').ReactNode} [props.children] - Rides above the head.
 */
export const Walker = forwardRef(function Walker({ character, scale, dir = 0, idleDelay = 0, children }, ref) {
    return (
        <div
            ref={ref}
            className={styles.walker}
            data-walking="false"
            style={{
                '--img': `url(${CHARACTER_URLS[character]})`,
                '--fw': `${WALK.fw * WALK.size * scale}px`,
                '--fh': `${WALK.fh * WALK.size * scale}px`,
                '--stand': WALK.standFrame,
                '--dur': `${WALK.seconds}s`,
                '--dir': dir,
                '--idle-delay': `${idleDelay}s`
            }}
        >
            <div className={styles.walkerSprite} />
            {children && <div className={styles.walkerSign}>{children}</div>}
        </div>
    );
});
