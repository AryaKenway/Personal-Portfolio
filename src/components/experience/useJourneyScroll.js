/**
 * @file useJourneyScroll.js
 * @description The scroll engine. One ScrollTrigger pins the journey and scrubs a
 * master timeline: the plane flies the route from stop to stop (then climbs to
 * the finale), the camera pans with it, and the route draws itself in behind it.
 * The plane turns to face the scroll direction. Scroll is the single source of
 * truth: selecting a stop just scrolls the page to that step.
 *
 * Proportional scrolling: the plane moves exactly as far as the visitor scrolls,
 * with no snapping and no settling. Each hop is eased, so the plane lingers near
 * the airports and moves faster between them.
 *
 * Wheel / trackpad while the journey is pinned (desktop, via Lenis):
 * - over the map: scrubs the journey;
 * - anywhere else on the page: leaves the journey (down → the next section,
 *   up → the top of the Experience section). The rest of that gesture is absorbed
 *   so momentum can't carry on scrolling.
 * Touch, keyboard and the scrollbar scrub natively.
 *
 * Steps: 0..n-1 are the stops, n is the open final destination.
 */

import { useCallback, useMemo, useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from './gsapSetup.js';
import { SKY_PARALLAX, SKY_TINTS } from './sceneryConfig.js';
import { cameraXFor } from './routeGeometry.js';

/**
 * Scroll distance per step, as a fraction of the viewport height (sets the plane's speed).
 * Stops are far apart (Phase 9), so a step is a little over one screen of scrolling.
 */
const STEP_SCROLL_VH = 1.2;

/** Duration of a flight to a selected stop (click or keyboard focus). */
const STOP_FLIGHT_SECONDS = 1.1;

/**
 * Leaving the journey with the wheel outside the map skips its animation: the map fades out
 * (`LEAVE_FADE_SECONDS`), the page jumps past the journey to `LEAVE_RUNUP_VH` of a screen
 * short of the destination, and glides the rest (`LEAVE_GLIDE_SECONDS`).
 */
const LEAVE_FADE_SECONDS = 0.18;
const LEAVE_GLIDE_SECONDS = 0.6;
const LEAVE_RUNUP_VH = 0.3;

/**
 * Flight profile of one hop, in fractions of the hop (each hop lasts 1 timeline unit and
 * its x movement eases in and out, so the plane rolls slowly on each runway):
 * lift off at `takeoffAt`, reach cruise `climb` later; start descending at `landAt` and
 * touch down `climb` later. Pitch in degrees (negative = nose up when flying right).
 */
const FLIGHT = Object.freeze({
    takeoffAt: 0.15,
    landAt: 0.55,
    climb: 0.3,
    cruiseScale: 1.12,
    pitchUp: -9,
    pitchDown: 7
});

/**
 * The last leg (last stop → finale) is `LAST_LEG` steps of scrolling long. Its timings, in
 * timeline units from its start ([start, duration]): the space layer fades in over `spaceIn`,
 * the 2D map fades out over `mapOut`, the plane shrinks away (`planeOut`) as the rocket
 * appears in its place (`rocketIn`), the map curls into a planet from `curlFrom` to
 * `curlTo`, and the rocket flies to the second planet over `travel`. The finale card shows
 * once the rest of the leg is within ARRIVE_WITHIN of the end, so `travel` ends just before.
 */
const LAST_LEG = 2;
const SPACE = Object.freeze({
    spaceIn: [0.3, 0.2],
    mapOut: [0.42, 0.13],
    planeOut: [0.4, 0.1],
    rocketIn: [0.44, 0.12],
    curlFrom: 0.5,
    curlTo: 1,
    travel: [1.1, 0.5]
});

/**
 * The last leg's position in steps doesn't follow time 1:1: its first half step does (so
 * leaving the last stop feels like any other hop), the rest is stretched over the remaining
 * time. These map timeline time ↔ journey position (steps).
 */
function legMapping(stepCount) {
    const stretchFrom = stepCount - 0.5;
    const stretch = (LAST_LEG - 0.5) / 0.5;
    return {
        totalTime: stepCount - 1 + LAST_LEG,
        toStep: (time) => (time <= stretchFrom ? time : stretchFrom + (time - stretchFrom) / stretch),
        toTime: (step) => (step <= stretchFrom ? step : stretchFrom + (step - stretchFrom) * stretch)
    };
}

/** Stage background: the map's grass, then deep space on the last leg. */
const GROUND_COLOR = '#a5c73f';
const SPACE_COLOR = '#070b1f';

/** Wheel events further apart than this start a new gesture. */
const WHEEL_GESTURE_GAP_MS = 200;

/** The plane counts as arrived within this distance (in steps) of a stop… */
const ARRIVE_WITHIN = 0.12;

/** …and stays arrived until it is this far away (hysteresis, so the card doesn't flicker). */
const STAY_WITHIN = 0.2;

/**
 * @param {Object} options
 * @param {import('react').RefObject<HTMLElement>} options.pinRef - Element to pin.
 * @param {import('react').RefObject<HTMLElement>} options.stageRef - The map; the wheel over it scrubs.
 * @param {import('react').RefObject<HTMLElement>} options.cameraRef - Element panned along x (world units).
 * @param {import('react').RefObject<SVGPathElement>} options.routeLineRef - Solid route (pathLength=1).
 * @param {import('react').RefObject<SVGPathElement>} options.finaleLineRef - Dashed finale climb.
 * @param {import('react').RefObject<HTMLElement>} options.planeRef - Moved along the route; pitches.
 * @param {import('react').RefObject<HTMLElement>} options.shadowRef - The plane's ground shadow.
 * @param {import('react').RefObject<HTMLElement>} options.liftRef - Raised and scaled with altitude.
 * @param {import('react').RefObject<HTMLElement>} options.facingRef - Flipped to face travel direction.
 * @param {import('react').RefObject<HTMLElement>} options.skyRef - Near layer, panned faster than the camera.
 * @param {import('react').RefObject<HTMLElement>} options.tintRef - Map tint, coloured morning → dusk.
 * @param {import('react').RefObject<HTMLElement>} options.scalerRef - The whole 2D map (fades out into space).
 * @param {import('react').RefObject<HTMLElement>} options.spaceRef - The 3D space layer (fades in).
 * @param {{ morph: number }} options.spaceState - Flat map (0) → mini planet (1), read by the 3D scene.
 * @param {import('react').RefObject<import('lenis').default | null>} options.lenisRef
 * @param {import('react').RefObject<import('./useSmoothScroll.js').WheelHandler | null>} options.wheelHandlerRef
 * @param {string} options.nextSectionId - Where the wheel outside the map leads (e.g. 'skills').
 * @param {import('./routeGeometry.js').FlightRouteGeometry} options.route
 * @param {import('./useStageFrame.js').StageFrame | null} options.frame
 * @param {boolean} options.reducedMotion
 * @param {(activeStep: number, arrivedStep: number | null) => void} options.onStepChange
 *   Called as the animation plays: the nearest step, and the step the plane is at (null
 *   between stops). Driven by the animation, not the raw scroll, so it follows the glide.
 * @returns {{ scrollToStep: (step: number) => void }}
 */
export function useJourneyScroll({
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
    nextSectionId,
    route,
    frame,
    reducedMotion,
    onStepChange
}) {
    const triggerRef = useRef(null);
    /** Last known scroll progress through the journey, and whether the page was inside it. */
    const lastScrollRef = useRef(null);
    /** Element inside the journey that last had focus (restored after a rebuild). */
    const lastFocusedRef = useRef(null);
    const stepCount = route.stops.length;
    const leg = useMemo(() => legMapping(stepCount), [stepCount]);

    const scrollToStep = useCallback((step) => {
        const trigger = triggerRef.current;
        if (!trigger) return;
        const top = trigger.start + (trigger.end - trigger.start) * (leg.toTime(step) / leg.totalTime);
        if (lenisRef.current) {
            // lock: wheel input can't disturb the flight; force: another stop can still redirect it.
            lenisRef.current.scrollTo(top, { duration: STOP_FLIGHT_SECONDS, easing: easeInOutCubic, lock: true, force: true });
        } else {
            window.scrollTo({ top, behavior: reducedMotion ? 'instant' : 'smooth' });
        }
    }, [lenisRef, reducedMotion, leg]);

    useGSAP(() => {
        if (!frame || stepCount === 0) return;

        const viewWidth = frame.width / frame.scale;
        const cameraXAt = (x) => cameraXFor(route.width, viewWidth, x);
        const points = [...route.stops, route.finale];
        const hopCount = Math.max(1, stepCount - 1);

        const plane = planeRef.current;
        const shadow = shadowRef.current;
        const lift = liftRef.current;
        const facing = facingRef.current;
        let facingDirection = 1;
        const faceDirection = (direction) => {
            if (direction === facingDirection) return;
            facingDirection = direction;
            gsap.to(facing, { scaleX: direction, duration: reducedMotion ? 0 : 0.35, ease: 'power2.out', overwrite: true });
        };

        gsap.set(cameraRef.current, { x: cameraXAt(points[0].x) });
        gsap.set(skyRef.current, { x: cameraXAt(points[0].x) * SKY_PARALLAX });
        gsap.set(tintRef.current, { backgroundColor: SKY_TINTS[0] });
        gsap.set(routeLineRef.current, { strokeDashoffset: 1 });
        gsap.set(finaleLineRef.current, { opacity: 0.2 });
        gsap.set(plane, { x: points[0].x, y: points[0].y, rotation: 0, scale: 1, transformOrigin: '50% 80%' });
        gsap.set(lift, { y: 0, scale: 1 });
        gsap.set(shadow, { scale: 1, opacity: 1 });
        gsap.set(facing, { scaleX: 1 });
        gsap.set(scalerRef.current, { opacity: 1 });
        gsap.set(spaceRef.current, { opacity: 0 });
        gsap.set(stageRef.current, { backgroundColor: GROUND_COLOR });
        gsap.set(spaceState, { morph: 0, rocket: 0, travel: 0 });

        // Rebuilt after a resize or rotation while inside the journey: the scroll distance per
        // step changed, so the same scrollY now means a different place. Once the new trigger
        // has measured itself (onRefresh), go back to the same point of the journey. Skipped on
        // the first build, so page load never moves the page.
        const previous = lastScrollRef.current;
        const isFirstBuild = previous === null;
        let restoreProgress = previous?.inside ? previous.progress : null;

        const rememberFocus = (event) => { lastFocusedRef.current = event.target; };
        const forgetFocus = (event) => {
            // Focus moving elsewhere on purpose (not a detach during a rebuild).
            if (event.relatedTarget) lastFocusedRef.current = null;
        };
        pinRef.current.addEventListener('focusin', rememberFocus);
        pinRef.current.addEventListener('focusout', forgetFocus);

        // Each hop lasts 1 time unit (the last one LAST_LEG); `leg.toStep` turns the timeline's
        // time() into the journey position in steps.
        let arrivedStep = null;
        // True while skipping past the journey: its timeline jumps to the end without telling
        // the page (nothing off-screen should react, e.g. load the space finale).
        let skipping = false;
        const reportPosition = (position) => {
            if (skipping) return;
            const nearest = Math.round(position);
            if (arrivedStep === null || Math.abs(position - arrivedStep) > STAY_WITHIN) {
                arrivedStep = Math.abs(position - nearest) <= ARRIVE_WITHIN ? nearest : null;
            }
            onStepChange(nearest, arrivedStep);
        };

        // Deep links (…/#skills): the browser tries the hash before React renders, and the pin
        // then adds several screens of height. Once the first pin is measured, go to the target.
        let pendingHashTarget = isFirstBuild && window.location.hash
            ? document.getElementById(decodeURIComponent(window.location.hash.slice(1)))
            : null;

        // Only remember real scrolling. While ScrollTrigger re-measures after a resize (refreshInit →
        // refresh), or while this trigger is being torn down, progress is computed against the new
        // viewport and would overwrite the position to restore.
        let measuring = false;
        const onMeasureStart = () => { measuring = true; };
        const onMeasureEnd = () => { measuring = false; };
        ScrollTrigger.addEventListener('refreshInit', onMeasureStart);
        ScrollTrigger.addEventListener('refresh', onMeasureEnd);
        const rememberScroll = (self) => {
            if (measuring || !self.enabled) return;
            lastScrollRef.current = { progress: self.progress, inside: self.isActive };
        };

        const onRefresh = (self) => {
            if (pendingHashTarget) {
                const target = pendingHashTarget;
                pendingHashTarget = null;
                requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
            }
            if (restoreProgress !== null) {
                const top = self.start + (self.end - self.start) * restoreProgress;
                restoreProgress = null;
                if (lenisRef.current) lenisRef.current.scrollTo(top, { immediate: true, force: true });
                else window.scrollTo({ top, behavior: 'instant' });
            }
            // A refresh renders the timeline silently (no onUpdate) and ignores scrolling done
            // inside it, so sync and report on the next frame, without a scrub glide.
            requestAnimationFrame(() => {
                ScrollTrigger.update();
                self.animation?.progress(self.progress);
                if (self.animation) reportPosition(leg.toStep(self.animation.time()));
                measuring = false;
                rememberScroll(self);
            });
        };

        const timeline = gsap.timeline({
            defaults: { duration: 1, ease: 'power2.inOut' },
            onUpdate() { reportPosition(leg.toStep(this.time())); },
            scrollTrigger: {
                trigger: pinRef.current,
                start: 'top top',
                end: () => `+=${window.innerHeight * STEP_SCROLL_VH * leg.totalTime}`,
                pin: true,
                // A short glide on top of Lenis's smoothing, so the plane eases to rest.
                scrub: reducedMotion ? true : 0.5,
                invalidateOnRefresh: true,
                onRefresh,
                onToggle: rememberScroll,
                onUpdate: (self) => {
                    faceDirection(self.direction);
                    rememberScroll(self);
                }
            }
        });

        // The day moves from morning to dusk across the whole journey.
        timeline.to(tintRef.current, {
            keyframes: SKY_TINTS.slice(1).map((color) => ({ backgroundColor: color, ease: 'none' })),
            ease: 'none',
            duration: stepCount
        }, 0);

        // Each hop: roll down the runway, take off nose-up, cruise, descend nose-down and touch
        // down on the next runway. The line is straight; altitude shows as the plane lifting off
        // its shadow. Played backwards (scrolling up) the same tweens climb and land in reverse.
        const { takeoffAt, climb, landAt, pitchUp, pitchDown } = FLIGHT;
        points.slice(1).forEach((point, index) => {
            const step = index + 1;
            // On the last leg the plane reaches the finale and the view settles as the map fades,
            // so its 3D copy curls in place.
            const pan = step < stepCount ? 1 : SPACE.mapOut[0] + SPACE.mapOut[1];
            timeline.to(cameraRef.current, { x: cameraXAt(point.x), duration: pan }, index);
            timeline.to(skyRef.current, { x: cameraXAt(point.x) * SKY_PARALLAX, duration: pan }, index);
            timeline.to(plane, { x: point.x, duration: pan }, index);

            timeline.to(lift, { y: -route.cruiseLift, scale: FLIGHT.cruiseScale, duration: climb, ease: 'sine.inOut' }, index + takeoffAt);
            timeline.to(shadow, { scale: 0.65, opacity: 0.45, duration: climb, ease: 'sine.inOut' }, index + takeoffAt);
            timeline.to(plane, { rotation: pitchUp, duration: climb / 2, ease: 'sine.out' }, index + takeoffAt);
            timeline.to(plane, { rotation: 0, duration: climb / 2, ease: 'sine.in' }, index + takeoffAt + climb / 2);

            if (step < stepCount) {
                timeline.to(lift, { y: 0, scale: 1, duration: climb, ease: 'sine.inOut' }, index + landAt);
                timeline.to(shadow, { scale: 1, opacity: 1, duration: climb, ease: 'sine.inOut' }, index + landAt);
                timeline.to(plane, { rotation: pitchDown, duration: climb / 2, ease: 'sine.out' }, index + landAt);
                timeline.to(plane, { rotation: 0, duration: climb / 2, ease: 'sine.in' }, index + landAt + climb / 2);
                // autoRound off: offsets are fractions of pathLength="1" and must not snap to whole px.
                timeline.to(routeLineRef.current, { strokeDashoffset: 1 - step / hopCount, autoRound: false }, index);
                return;
            }

            // The last leg leaves the map: no landing. Space fades in over the map, the 2D map
            // fades out beneath its 3D copy, the plane turns into a rocket, the copy curls into
            // a mini planet with the rocket on top, and the rocket flies to the second planet.
            const { spaceIn, mapOut, planeOut, rocketIn, curlFrom, curlTo, travel } = SPACE;
            timeline.to(finaleLineRef.current, { opacity: 0.85 }, index);
            timeline.to(spaceRef.current, { opacity: 1, duration: spaceIn[1], ease: 'none' }, index + spaceIn[0]);
            timeline.to(stageRef.current, { backgroundColor: SPACE_COLOR, duration: spaceIn[1], ease: 'none' }, index + spaceIn[0]);
            timeline.to(scalerRef.current, { opacity: 0, duration: mapOut[1], ease: 'none' }, index + mapOut[0]);
            timeline.to(plane, { scale: 0, duration: planeOut[1], ease: 'back.in(2)' }, index + planeOut[0]);
            timeline.to(spaceState, { rocket: 1, duration: rocketIn[1], ease: 'back.out(2.5)' }, index + rocketIn[0]);
            timeline.to(spaceState, { morph: 1, duration: curlTo - curlFrom, ease: 'power1.inOut' }, index + curlFrom);
            timeline.to(spaceState, { travel: 1, duration: travel[1], ease: 'power1.inOut' }, index + travel[0]);
        });
        // The finale rests a moment after landing: the timeline spans the whole scroll distance.
        timeline.set({}, {}, leg.totalTime);

        const trigger = timeline.scrollTrigger;
        triggerRef.current = trigger;
        if (isFirstBuild) rememberScroll(trigger);

        // Pinning (re-)wraps the pinned element, which drops keyboard focus. Give it back.
        const lastFocused = lastFocusedRef.current;
        if (lastFocused?.isConnected && document.activeElement === document.body) {
            lastFocused.focus({ preventScroll: true });
        }

        // Wheel outside the map while pinned: leave the journey without playing it (down → next
        // section, up → the top of the Experience section). The map fades out, the page jumps
        // past the pinned stretch with the timeline snapped to that end, then glides the last bit.
        const stage = stageRef.current;
        const leaveJourney = (direction) => {
            const target = direction > 0
                ? document.getElementById(nextSectionId)
                : pinRef.current.closest('section');
            const lenis = lenisRef.current;
            if (!target || !lenis) return;
            const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
            const top = target.getBoundingClientRect().top + window.scrollY - margin;
            const runUp = window.innerHeight * LEAVE_RUNUP_VH;
            const jumpTo = direction > 0
                ? Math.max(trigger.end + 1, top - runUp)
                : Math.min(trigger.start - 1, top + runUp);

            gsap.to(stage, {
                opacity: 0,
                duration: LEAVE_FADE_SECONDS,
                ease: 'power1.in',
                overwrite: true,
                onComplete() {
                    skipping = true;
                    lenis.scrollTo(jumpTo, { immediate: true, force: true });
                    ScrollTrigger.update();
                    trigger.getTween()?.progress(1);
                    skipping = false;
                    lenis.scrollTo(top, { duration: LEAVE_GLIDE_SECONDS, easing: easeOutCubic, lock: true, force: true });
                    // Going up, the journey's start is back on screen: fade it in during the glide.
                    // Going down it is already off screen.
                    gsap.to(stage, { opacity: 1, duration: direction > 0 ? 0 : LEAVE_GLIDE_SECONDS, ease: 'power1.out' });
                }
            });
        };

        // Wheel / trackpad, via Lenis. Returning false means "handled, Lenis: ignore it".
        let lastWheelAt = -Infinity;
        let gestureLeft = false;
        let leavingUntil = 0;
        wheelHandlerRef.current = ({ deltaY, event }) => {
            if (!event.type.includes('wheel') || deltaY === 0) return true;

            const now = performance.now();
            const isNewGesture = now - lastWheelAt > WHEEL_GESTURE_GAP_MS;
            lastWheelAt = now;
            if (isNewGesture) gestureLeft = false;
            const absorb = () => {
                if (event.cancelable) event.preventDefault();
                return false;
            };

            // The rest of a gesture that already left, or the glide out in progress.
            if (gestureLeft || now < leavingUntil) return absorb();
            // Not pinned (before or after the journey), or over the map: scroll normally.
            if (!trigger.isActive || stageRef.current?.contains(event.target)) return true;

            gestureLeft = true;
            leavingUntil = now + (LEAVE_FADE_SECONDS + LEAVE_GLIDE_SECONDS) * 1000;
            leaveJourney(Math.sign(deltaY));
            return absorb();
        };

        const pin = pinRef.current;
        return () => {
            // Freeze the remembered position before the trigger is killed (kill fires callbacks).
            measuring = true;
            ScrollTrigger.removeEventListener('refreshInit', onMeasureStart);
            ScrollTrigger.removeEventListener('refresh', onMeasureEnd);
            pin.removeEventListener('focusin', rememberFocus);
            pin.removeEventListener('focusout', forgetFocus);
            wheelHandlerRef.current = null;
            triggerRef.current = null;
        };
    }, { dependencies: [route, frame, reducedMotion, stepCount, scrollToStep, nextSectionId], revertOnUpdate: true });

    return { scrollToStep };
}

function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2;
}

function easeOutCubic(t) {
    return 1 - (1 - t) ** 3;
}
