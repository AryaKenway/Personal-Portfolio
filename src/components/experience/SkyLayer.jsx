/**
 * @file SkyLayer.jsx
 * @description The near layer: clouds, sparrows and the hot-air balloon. It sits
 * above the map and is panned faster than the camera (SKY_PARALLAX) by the
 * scroll engine, which gives the map depth. Each sprite also drifts slowly on
 * its own.
 *
 * Positions: a sprite with journey fraction `at` crosses the centre of the
 * screen when the journey is at that fraction, given the parallax factor.
 */

import { useRef } from 'react';
import { SKY_PARALLAX, SKY_SPRITES } from './sceneryConfig.js';
import { LOTTIE_ASSETS } from './sceneryAssets.js';
import { LottieSprite } from './LottieSprite.jsx';
import { useAmbientMotion } from './useAmbientMotion.js';
import styles from './FlightJourney.module.css';

/**
 * @param {Object} props
 * @param {import('./routeGeometry.js').FlightRouteGeometry} props.route
 * @param {import('./useStageFrame.js').StageFrame} props.frame
 * @param {'phone' | 'tablet' | 'desktop'} props.profile
 * @param {boolean} props.reducedMotion
 * @param {import('react').Ref<HTMLDivElement>} props.skyRef - Panned by the scroll engine.
 * @param {import('react').RefObject<HTMLElement>} props.stageRef - Drift pauses while the stage is off-screen.
 */
export function SkyLayer({ route, frame, profile, reducedMotion, skyRef, stageRef }) {
    const driftRef = useRef(null);
    const size = route.tileSize;
    const viewWidth = frame.width / frame.scale;
    const travel = Math.max(0, route.width - viewWidth);

    const sprites = SKY_SPRITES
        .filter((sprite) => !sprite.profiles || sprite.profiles.includes(profile))
        .map((sprite, index) => {
            const w = sprite.w * size;
            const h = sprite.h * size;
            return {
                ...sprite,
                key: `${sprite.asset}-${index}`,
                w,
                h,
                x: viewWidth / 2 + SKY_PARALLAX * sprite.at * travel - w / 2,
                y: route.baselineY + sprite.dy * size - h / 2
            };
        });

    useAmbientMotion(driftRef, ({ gsap, select }) => select('[data-drift]').map((element) => {
        const drift = Number(element.dataset.drift);
        return gsap.to(element, {
            x: drift * (Math.random() < 0.5 ? -1 : 1),
            y: drift * 0.25,
            duration: gsap.utils.random(5, 9),
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1
        });
    }), { enabled: !reducedMotion, dependencies: [route, frame, profile], visibilityRef: stageRef });

    return (
        <div className={styles.skyLayer} ref={skyRef} aria-hidden="true">
            <div ref={driftRef}>
                {sprites.map((sprite) => (
                    <div
                        key={sprite.key}
                        className={styles.sceneryItem}
                        style={{ left: sprite.x, top: sprite.y, width: sprite.w, height: sprite.h }}
                        data-drift={sprite.drift}
                    >
                        <LottieSprite src={LOTTIE_ASSETS[sprite.asset]} className={styles.lottieFill} />
                    </div>
                ))}
            </div>
        </div>
    );
}
