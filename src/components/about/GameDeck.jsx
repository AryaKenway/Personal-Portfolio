/**
 * @file GameDeck.jsx
 * @description A fanned stack of favourite-game covers. Swipe (or drag) the top
 * card either way, tap it, or press Enter / arrow keys: it slides out to that
 * side, then tucks in behind the stack, so the games loop forever. Plain pointer
 * events + CSS transitions; vertical swipes still scroll the page.
 */

import { useEffect, useRef, useState } from 'react';
import { favouriteGames } from '../../data/portfolio.js';
import { useReducedMotion } from '../experience/useReducedMotion.js';
import styles from './GameDeck.module.css';

/** Drag distance (px) or release speed (px/ms) that throws the card. */
const THROW_DISTANCE = 70;
const THROW_SPEED = 0.5;
/** Movement (px) below which a press counts as a tap. */
const TAP_SLOP = 6;
/** Slide-out time; must match the `.flying` transition in GameDeck.module.css. After it,
 * the card drops to the back and its normal transition carries it in behind the stack. */
const FLY_MS = 240;
/** How many cards show in the fan; the rest wait hidden behind the last one. */
const FAN_DEPTH = 4;

export function GameDeck() {
    const reducedMotion = useReducedMotion();
    // Deck order as indexes into favouriteGames; order[0] is the top card.
    const [order, setOrder] = useState(() => favouriteGames.map((_, index) => index));
    const [drag, setDrag] = useState(null);
    const [flying, setFlying] = useState(null);
    const [announcement, setAnnouncement] = useState('');
    const pressRef = useRef(null);
    const suppressClickRef = useRef(false);
    const stackRef = useRef(null);
    const refocusRef = useRef(false);

    const top = order[0];

    // Keyboard users keep focus on the deck: the new top card takes it over.
    useEffect(() => {
        if (!refocusRef.current) return;
        refocusRef.current = false;
        stackRef.current?.querySelector('[data-top]')?.focus();
    }, [order]);

    /** Throw the top card off in `direction` (1 = right, -1 = left), then move it to the back. */
    const advance = (direction) => {
        if (flying) return;
        setDrag(null);
        setFlying({ index: top, direction });
        window.setTimeout(() => {
            refocusRef.current = stackRef.current?.contains(document.activeElement) ?? false;
            setOrder((current) => [...current.slice(1), current[0]]);
            setFlying(null);
            setAnnouncement(`Now showing ${favouriteGames[order[1]].title}`);
        }, reducedMotion ? 0 : FLY_MS);
    };

    const handlePointerDown = (event) => {
        if (flying || (event.pointerType === 'mouse' && event.button !== 0)) return;
        pressRef.current = { x: event.clientX, y: event.clientY, time: performance.now(), horizontal: null };
        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event) => {
        const press = pressRef.current;
        if (!press) return;
        const dx = event.clientX - press.x;
        const dy = event.clientY - press.y;
        // Decide once per gesture: mostly vertical means the visitor is scrolling the page.
        if (press.horizontal === null && Math.hypot(dx, dy) > TAP_SLOP) press.horizontal = Math.abs(dx) > Math.abs(dy);
        if (press.horizontal) setDrag(dx);
    };

    const handlePointerEnd = (event) => {
        const press = pressRef.current;
        pressRef.current = null;
        if (!press || press.horizontal === null) return;
        suppressClickRef.current = true;
        const dx = event.clientX - press.x;
        const speed = Math.abs(dx) / Math.max(1, performance.now() - press.time);
        if (press.horizontal && (Math.abs(dx) > THROW_DISTANCE || speed > THROW_SPEED)) advance(Math.sign(dx) || 1);
        else setDrag(null);
    };

    // Taps, Enter and Space arrive as clicks; a click that ends a drag is ignored.
    const handleClick = () => {
        if (suppressClickRef.current) {
            suppressClickRef.current = false;
            return;
        }
        advance(1);
    };

    const handleKeyDown = (event) => {
        if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
        event.preventDefault();
        advance(event.key === 'ArrowRight' ? 1 : -1);
    };

    return <div className={styles.deck} role="group" aria-roledescription="card deck" aria-labelledby="favourite-games-heading">
        <h3 id="favourite-games-heading" className={styles.heading}>Favourite Games</h3>
        <div ref={stackRef} className={styles.stack}>
            {favouriteGames.map((game, index) => {
                const depth = order.indexOf(index);
                const isTop = depth === 0;
                const isFlying = flying?.index === index;
                const style = { zIndex: favouriteGames.length - depth };
                if (isFlying) style['--fly'] = flying.direction;
                else if (isTop && drag !== null) style['--drag'] = drag;

                const className = [
                    styles.card,
                    styles[`depth${Math.min(depth, FAN_DEPTH)}`],
                    isTop && drag !== null ? styles.dragging : '',
                    isFlying ? styles.flying : ''
                ].join(' ');

                const cover = <>
                    {game.fit === 'contain' && <img className={styles.backdrop} src={game.cover} alt="" aria-hidden="true" draggable="false" />}
                    <img
                        className={game.fit === 'contain' ? styles.coverContain : styles.cover}
                        src={game.cover}
                        alt=""
                        width="360"
                        height="540"
                        draggable="false"
                        decoding="async"
                    />
                </>;

                // Every card is the same element, so the top one can change without remounting;
                // cards below the top are inert (not focusable, hidden from screen readers).
                const handlers = isTop ? {
                    onPointerDown: handlePointerDown,
                    onPointerMove: handlePointerMove,
                    onPointerUp: handlePointerEnd,
                    onPointerCancel: handlePointerEnd,
                    onClick: handleClick,
                    onKeyDown: handleKeyDown
                } : {};

                return <button
                    key={game.title}
                    type="button"
                    className={className}
                    style={style}
                    inert={!isTop}
                    data-top={isTop ? '' : undefined}
                    aria-label={`${game.title}. Show the next game`}
                    {...handlers}
                >{cover}</button>;
            })}
        </div>
        <p className={styles.hint} aria-hidden="true">Swipe or tap for the next game</p>
        <p className={styles.srOnly} aria-live="polite">{announcement}</p>
    </div>;
}
