---
description: "Use when working on the portfolio Experience section: the Mini Metro flight journey, route, stops, plane animation, skill passengers, scenery, or scroll behavior."
name: "Mini Metro Experience"
applyTo:
  - "src/components/ExperienceSection.jsx"
  - "src/components/ExperienceSection.module.css"
  - "src/components/experience/**"
  - "src/assets/experience/**"
  - "src/data/careerRepository.js"
  - "src/data/portfolio.js"
---

# Mini Metro Experience: AI Instructions

Read `docs/experience-metro/ROADMAP.md` before you change anything. It holds the hard
rules, the final approved design, library choices, file architecture, scroll model,
GitHub Pages/responsive requirements and the phase checklist.

> **Round 2 (Phases 7–14) overrides earlier rules where they conflict.** See "Round 2" in the roadmap:
> proportional scroll instead of one-stop-per-scroll, airport stops instead of pulsing dots, a straight
> flight line, no "On board" row, a new tileset, and a space finale built with a React space library.
> Phases blocked on an open decision (D1–D5) must not start until the owner answers it.

## How to work
- Do **one phase at a time**, and only when the owner asks for it. Don't start the next phase
  on your own.
- When a phase is done: run `npm run build`, check the section in the browser at phone (~375px),
  tablet and desktop widths, tick the phase's checklist in the roadmap, then stop and report.
- Only build what the roadmap's "Final design" section describes. Ask before adding new ideas.

## Non-negotiables
- **The vehicle is a plane.** Don't add a train or a vehicle switcher.
- **No legends, compasses, zoom buttons, counters, minimaps, progress bars, sound toggles,
  confetti or extra panels.** The section shows only the map, the route, the stops, the plane,
  the skill passengers and one stop card.
- **Stop markers** are a pulsing dot or a downloaded marker asset. Don't use Mini Metro geometric shapes.
- **Don't hand-draw art.** No SVG/CSS/canvas trees, clouds, buildings, planes or pixel maps.
  Use Lottie JSON files (played by `LottieSprite`, lottie-web light) and the Ninja Adventure CC0 sheets stored in
  `src/assets/experience/`, and record each one in `src/assets/experience/CREDITS.md`.
  The canvas in `MapBackdrop` only *draws sprites from those sheets*. Animating real assets with
  GSAP (drifting Lottie clouds, sprite animation) is fine.
- **Change the world through data.** Sprite rectangles live in `spriteAtlas.js` (verify every new
  crop by rendering it). Districts, lanes, ponds and countryside zones live in `worldLayout.js`, in
  tile units relative to each stop and the flight line. `buildWorld.js` stays generic.
  **Authored sprites must never overlap** each other, the road or water: `buildWorld` reports
  conflicts (logged in development), and the count must be 0. Keep the route corridor clear.
  Every stop has the same `AIRFIELD` (runway centred on the flight line, hangar, tower, terminal hut).
- **Life on the map (Phase 11)** is data in `lifeConfig.js`, placed by `buildLife.js` (pure). Boarding
  times come from `planBoarding` and drive both the walkers and the card's pass stamps, so change
  them there, not in two places. Passengers walk straight from their house to the plane on a route
  found by `walkGrid` (A* on half tiles): never through a sprite's footprint (low flowers and bushes
  in `WALK_THROUGH` excepted), shortest first. Passengers (and their passes) must never cover a stop
  sign: stops are stacked above the boarding layer (`.stop` z-index 2, `.boarding` 1, plane 3), so a
  passenger walking past goes behind the sign. Keep that order; don't reintroduce long detours
  around the sign. Characters
  are full-bodied Pipoya townsfolk (`assets/experience/pipoya`, RPG Maker layout: 3 frames ×
  4 facing rows; size via `WALK.size`). Don't go back to the Ninja Adventure characters: they are
  16×16 chibis that read as heads with no body.
- **Keep stops on one straight, level flight line**, left to right in career order from
  `getAllMilestones()`. Altitude is shown top-down style (plane lifts off its shadow and pitches),
  not by bending the route; tune it in `FLIGHT` (`useJourneyScroll.js`).
- **Proportional scrolling (Phase 8).** The plane moves exactly as far as the visitor scrolls, with no
  snapping and no settling. Don't add GSAP `snap` or any settle-to-stop logic. While pinned, the wheel
  over the map scrubs, and the wheel anywhere else leaves the journey **without playing it** (down →
  Selected work `#work`, the next section since Skills moved above Experience; up → Experience top): fade the map, jump past the pinned stretch with the scrub tween
  finished and step reports muted, then glide the last bit (`leaveJourney`). Never glide through the
  pinned stretch, which would replay the whole animation at speed. Only the rest of that one gesture
  may be absorbed. Never trap the page, and never `preventDefault()` touch events.
- **Space finale (Phase 12+)** lives in `SpaceScene.jsx` (React Three Fiber, lazy chunk; keep three.js
  out of the main and journey chunks). Its timing is `SPACE` in `useJourneyScroll.js`; the timeline
  only tweens `spaceState.morph` and opacities, and the scene reads them in `useFrame` (no React
  re-renders while scrolling). The flat 3D copy must stay pixel-aligned with the 2D map during the
  cross-fade: it derives fov and offset from the stage frame and the 2D camera pan, so if you change
  the stage frame, the camera pan or the map canvas, recheck the 4.4–4.5 frames for a double image.
  Only render 3D frames while the last leg is on screen, and keep the no-WebGL fallback (dark space).
  The last leg is `LAST_LEG` steps long: always convert between timeline time and stops with
  `legMapping` (never assume time = step). The rocket and both planets are placed from one
  screen-space layout (`spaceLayout`); change positions there, keep them clear of the card, and keep
  the rocket's arc inside the stage.
- **GitHub Pages:** import every asset through Vite (`?url`), never use absolute `/...` paths,
  and load nothing from third-party CDNs. The site is served from `/Personal-Portfolio/`.
- **Download budget:** no WASM renderers. Lottie stays on lottie-web light (no expressions, so
  check new animations for `"x":` expressions and embedded images before adding them).
- **Every device size** must work, from 360px phones to wide desktops, in portrait and landscape.
- **Keep it split across files** as laid out in the roadmap. Geometry lives in `routeGeometry.js`
  (pure). Scroll logic lives in `useJourneyScroll.js`. World data lives in `spriteAtlas.js` and
  `worldLayout.js`; the sky (clouds, birds, balloon, tints) lives in `sceneryConfig.js` (data only).
- **Career data comes only from `careerRepository.js`.** Never invent roles, dates, skills or highlights.
- **The stop card must never cover the plane or a visible stop label.** It flips sides on landscape
  tablets and desktops, and docks in the reserved bottom band on phones and portrait tablets.
  Recheck at every stop on short laptops (1366×768), portrait tablets (768×1024) and small phones
  (360×640) after changing card content or sizes.

## Libraries
`gsap` + `@gsap/react` (ScrollTrigger), `lenis` (desktop only),
`lottie-web` (light SVG player), `motion` (already installed), `lucide-react`, and `three` +
`@react-three/fiber` + `@react-three/drei` for the space finale only. Add others only
when a roadmap item needs them, and add them to the roadmap's library table.

## Quality bar
- Register GSAP plugins once and use `useGSAP()` so everything is cleaned up on unmount.
- Pause Lottie players when the section is off-screen; render fewer sprites on phones.
- Respect `prefers-reduced-motion`: no smooth scrolling, no looping ambience, and the plane
  jumps straight to stops.
- Stops (and the finale ring) are keyboard-focusable buttons with accessible names, a visible focus
  ring, and tap targets that stay ≥ 44px on screen at any map scale (`--world-scale`).
- Don't rebuild the scroll timeline casually: every rebuild re-wraps the pinned element.
  `useStageFrame` ignores ≤ 2px changes; rebuilds restore the current stop, keyboard focus and
  (on first load) the URL hash target. Keep those behaviours when changing `useJourneyScroll.js`.
- Use `m.*` components (inside `LazyMotion`), not `motion.*`. The journey runs in strict LazyMotion mode.
- Match the existing code style: JSDoc file headers, CSS Modules, named exports for subcomponents.
