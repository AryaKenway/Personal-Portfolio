/**
 * @file FlightJourney.jsx
 * @description Orchestrates the Mini Metro flight journey: builds route geometry
 * and the Tiny Town map for the current viewport, fits them into the pinned
 * stage, hands the layers to the scroll engine, and shows the stop card and
 * skill passengers once the plane lands.
 *
 * Layer stack: pin frame > stage (clips) > scaler (fit) > camera (GSAP pan) > world,
 * with the sky layer beside the camera inside the scaler (panned faster, for depth),
 * and the card panel above everything.
 * World, bottom to top: map, ground scenery, day tint, route, stops, boarding chips,
 * finale marker, plane.
 */

import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation } from 'motion/react';
import { buildRoute, cameraXFor } from './routeGeometry.js';
import { buildWorld } from './buildWorld.js';
import { useIsPortrait, useViewportProfile } from './useViewportProfile.js';
import { useReducedMotion } from './useReducedMotion.js';
import { useSmoothScroll } from './useSmoothScroll.js';
import { useStageFrame } from './useStageFrame.js';
import { useJourneyScroll } from './useJourneyScroll.js';
import { useOnScreen } from './useOnScreen.js';
import { MapBackdrop } from './MapBackdrop.jsx';
import { SkyLayer } from './SkyLayer.jsx';
import { FlightRoute } from './FlightRoute.jsx';
import { RouteStop } from './RouteStop.jsx';
import { FlightPlane } from './FlightPlane.jsx';
import { BoardingWalkers } from './SkillPassengers.jsx';
import { LifeLayer } from './LifeLayer.jsx';
import { planBoarding } from './buildLife.js';
import { StopCard } from './StopCard.jsx';
import { FinaleCard, FinaleMarker } from './FinalDestination.jsx';
import styles from './FlightJourney.module.css';
import cardStyles from './StopCard.module.css';

/** The 3D space finale (three.js) only downloads once the plane reaches the last stop. */
const SpaceScene = lazy(() => import('./SpaceScene.jsx').then((m) => ({ default: m.SpaceScene })));

/** WebGL available? Without it the finale fades to dark space with no 3D planet. */
function supportsWebGL() {
    try {
        const canvas = document.createElement('canvas');
        return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
    } catch {
        return false;
    }
}

/** Where the wheel outside the map leads while the journey is pinned. */
const NEXT_SECTION_ID = 'work';

/** Share of the stage height kept for the docked stop card (phones, portrait tablets). */
const DOCKED_CARD_RESERVE = 0.42;

/** If the parked plane sits left of this share of the screen, the overlay card moves right. */
const CARD_FLIP_BELOW = 0.45;

/**
 * @param {Object} props
 * @param {readonly Object[]} props.milestones - Ordered career milestones.
 */
export function FlightJourney({ milestones }) {
    const profile = useViewportProfile();
    const reducedMotion = useReducedMotion();
    const route = useMemo(() => buildRoute(milestones, profile), [milestones, profile]);
    const world = useMemo(() => {
        const built = buildWorld(route);
        // Authored sprites must never overlap each other, the road or water.
        if (import.meta.env.DEV && built.conflicts.length > 0) console.warn('World layout overlaps:', built.conflicts);
        return built;
    }, [route]);
    const finaleStep = route.stops.length;

    const pinRef = useRef(null);
    const stageRef = useRef(null);
    const cameraRef = useRef(null);
    const skyRef = useRef(null);
    const tintRef = useRef(null);
    const routeLineRef = useRef(null);
    const finaleLineRef = useRef(null);
    const planeRef = useRef(null);
    const shadowRef = useRef(null);
    const liftRef = useRef(null);
    const facingRef = useRef(null);
    const scalerRef = useRef(null);
    const spaceRef = useRef(null);
    const mapCanvasRef = useRef(null);
    /**
     * Animated by the scroll timeline, read by the 3D scene each frame (all 0 → 1): `morph` flat
     * map → planet, `rocket` plane → rocket, `travel` the flight to the second planet.
     */
    const spaceState = useRef({ morph: 0, rocket: 0, travel: 0 }).current;
    const [activeStep, setActiveStep] = useState(0);
    const [arrivedStep, setArrivedStep] = useState(0);
    const onStepChange = useCallback((active, arrived) => {
        setActiveStep(active);
        setArrivedStep(arrived);
    }, []);

    // Load the space finale once the plane reaches the last stop, and keep it loaded.
    const webGL = useMemo(supportsWebGL, []);
    const [spaceLoaded, setSpaceLoaded] = useState(false);
    useEffect(() => {
        if (webGL && activeStep >= finaleStep - 1) setSpaceLoaded(true);
    }, [webGL, activeStep, finaleStep]);

    // Tall screens dock the card in a bottom band and fit the map above it; wide screens
    // float it over the map.
    const isPortrait = useIsPortrait();
    const cardDocked = profile === 'phone' || (profile === 'tablet' && isPortrait);
    const cardReserve = cardDocked ? DOCKED_CARD_RESERVE : 0;
    const isOnScreen = useOnScreen(stageRef);
    const { lenisRef, wheelHandlerRef } = useSmoothScroll(!reducedMotion);
    const frame = useStageFrame(stageRef, route.height, cardReserve);
    const { scrollToStep } = useJourneyScroll({
        pinRef,
        stageRef,
        cameraRef,
        routeLineRef,
        finaleLineRef,
        planeRef,
        shadowRef,
        liftRef,
        facingRef,
        skyRef,
        tintRef,
        scalerRef,
        spaceRef,
        spaceState,
        lenisRef,
        wheelHandlerRef,
        nextSectionId: NEXT_SECTION_ID,
        route,
        frame,
        reducedMotion,
        onStepChange
    });

    const landedStop = arrivedStep !== null && arrivedStep < finaleStep ? route.stops[arrivedStep] : null;
    const showCard = isOnScreen && arrivedStep !== null;
    // Who walks to the plane at this stop, and when each boards (shared with the card's passes).
    const boardingPlan = useMemo(
        () => (landedStop ? planBoarding(world, arrivedStep, landedStop.milestone.skills) : []),
        [world, arrivedStep, landedStop]
    );

    // Floating card: sit on the side away from the parked plane.
    const parkedX = landedStop ? landedStop.x : route.finale.x;
    const viewWidth = frame ? frame.width / frame.scale : route.width;
    const parkedScreenShare = (parkedX + cameraXFor(route.width, viewWidth, parkedX)) / viewWidth;
    // At the finale the second planet sits on the right, so the card stays left.
    const cardOnRight = !cardDocked && landedStop !== null && parkedScreenShare < CARD_FLIP_BELOW;

    // The planet is made from the map on screen when it starts to curl (the view has settled
    // on the finale by then), so it curls in place. Map source px.
    const planetCenterX = (viewWidth / 2 - cameraXFor(route.width, viewWidth, route.finale.x)) * (16 / world.tileSize);
    // The second planet is a recoloured district (the second stop's town).
    const companyX = world.anchors[Math.min(1, finaleStep - 1)].col * 16;
    // Render 3D frames only on the final leg (not while parked at the last stop or off-screen).
    const spaceActive = isOnScreen && activeStep >= finaleStep - 1 && arrivedStep !== finaleStep - 1;

    return (
        <div className={styles.pinFrame} ref={pinRef}>
            {/* LazyMotion + `m.*` components: only the DOM-animation features are bundled. */}
            <LazyMotion features={domAnimation} strict>
            <MotionConfig reducedMotion="user">
                <div className={styles.stage} ref={stageRef} style={{ '--card-reserve': `${cardReserve * 100}%` }}>
                    <div
                        className={styles.scaler}
                        ref={scalerRef}
                        style={frame ? {
                            transform: `translateY(${frame.offsetY}px) scale(${frame.scale})`,
                            // Lets tap targets grow in world units so they stay ≥ 44px on screen.
                            '--world-scale': frame.scale
                        } : undefined}
                    >
                        <div className={styles.camera} ref={cameraRef}>
                            <div
                                className={styles.world}
                                style={{ width: route.width, height: route.height }}
                                role="group"
                                aria-label="Career journey route"
                            >
                                <MapBackdrop world={world} tintRef={tintRef} canvasRef={mapCanvasRef}>
                                    <LifeLayer world={world} profile={profile} reducedMotion={reducedMotion} stageRef={stageRef} />
                                </MapBackdrop>
                                <FlightRoute route={route} routeLineRef={routeLineRef} finaleLineRef={finaleLineRef} />
                                {route.stops.map((stop, index) => (
                                    <RouteStop
                                        key={stop.milestone.id}
                                        stop={stop}
                                        isActive={index === activeStep}
                                        isArrived={isOnScreen && index === arrivedStep}
                                        onSelect={() => scrollToStep(index)}
                                    />
                                ))}
                                {landedStop && isOnScreen && !reducedMotion && (
                                    <BoardingWalkers
                                        key={landedStop.milestone.id}
                                        plan={boardingPlan}
                                        step={arrivedStep}
                                        scale={world.tileSize / 16}
                                        tileSize={world.tileSize}
                                    />
                                )}
                                <FinaleMarker
                                    finale={route.finale}
                                    isArrived={arrivedStep === finaleStep}
                                    onSelect={() => scrollToStep(finaleStep)}
                                />
                                <FlightPlane
                                    size={route.planeSize}
                                    planeRef={planeRef}
                                    shadowRef={shadowRef}
                                    liftRef={liftRef}
                                    facingRef={facingRef}
                                />
                            </div>
                        </div>
                        {frame && (
                            <SkyLayer
                                route={route}
                                frame={frame}
                                profile={profile}
                                reducedMotion={reducedMotion}
                                skyRef={skyRef}
                                stageRef={stageRef}
                            />
                        )}
                    </div>

                    {/* Space finale: fades in over the map on the last leg (the scroll engine sets opacity). */}
                    <div className={styles.space} ref={spaceRef} aria-hidden="true">
                        {spaceLoaded && frame && (
                            <Suspense fallback={null}>
                                <SpaceScene
                                    mapCanvasRef={mapCanvasRef}
                                    centerX={planetCenterX}
                                    companyX={companyX}
                                    baseRow={world.baseRow}
                                    planeRef={liftRef}
                                    spaceState={spaceState}
                                    frame={frame}
                                    tileSize={world.tileSize}
                                    originY={world.originY}
                                    cameraRef={cameraRef}
                                    tintRef={tintRef}
                                    cardReserve={cardReserve}
                                    active={spaceActive}
                                    reducedMotion={reducedMotion}
                                    profile={profile}
                                />
                            </Suspense>
                        )}
                    </div>

                    <div
                        className={`${cardStyles.panel} ${cardDocked ? cardStyles.panelDocked : ''} ${cardOnRight ? cardStyles.panelRight : ''}`}
                    >
                        <AnimatePresence mode="wait">
                            {showCard && (landedStop ? (
                                <StopCard
                                    key={landedStop.milestone.id}
                                    milestone={landedStop.milestone}
                                    step={arrivedStep}
                                    boardTimes={reducedMotion ? undefined : boardingPlan.map((walk) => walk.boardAt)}
                                />
                            ) : (
                                <FinaleCard key="finale" />
                            ))}
                        </AnimatePresence>
                    </div>
                    <p className={styles.srOnly} aria-live="polite">
                        {showCard && (landedStop
                            ? `Arrived at ${landedStop.milestone.organization}: ${landedStop.milestone.title}, ${landedStop.milestone.period}.`
                            : 'Next stop: could be your company.')}
                    </p>
                </div>
            </MotionConfig>
            </LazyMotion>
        </div>
    );
}
