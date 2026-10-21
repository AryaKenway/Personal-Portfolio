# Experience Section — "Mini Metro" Flight Journey Roadmap

The Experience section is a scroll-driven, Mini Metro–style route map. Career
stops sit on one horizontal line across a cute, animated fictional map. As the
visitor scrolls down, the section pins and a **plane** flies to the next stop.
Scrolling up flies it back. After the last stop, the plane takes off toward an
open destination: *"Next stop: could be your company!"*

Work **one phase at a time**, and only when the owner asks for that phase. When a phase is done,
run `npm run build`, check the section in the browser at desktop, tablet and ~375px phone
widths, tick its checklist here, and stop.

---

## 1. Hard rules (from the owner)

1. **No legends, no extra panels, no extra controls.** That means no compass, no zoom buttons, no
   "stop 2 / 5" counter, no line key, no minimap, no progress bar and no sound toggle.
   The screen shows the map, the route, the stops, the plane and one stop card.
2. **Use libraries and ready-made assets. Don't hand-draw art.** Don't recreate trees,
   clouds, buildings, the plane, stop markers, tiles or a pixel map in SVG/CSS/canvas.
   Use free assets (Lottie, Kenney CC0) and animate them with libraries.
   The only drawn shapes allowed are the route line itself and the pulsing stop dot.
3. **Stops sit on one horizontal line.** Gentle Mini Metro–style 45° jogs between stops are fine,
   but the overall route reads left to right.
4. **One stop per scroll.** Each wheel or trackpad gesture or touch swipe settles the plane on
   exactly the next or previous stop (pinned + scrubbed + snapped).
5. **Plane only.** Don't add a train, and don't add a vehicle switcher.
6. **Stop markers** are either a pulsing dot or a downloaded marker asset (e.g. a Lottie
   location pin or airport/helipad tile). Don't use Mini Metro geometric shapes.
7. **No confetti.**
8. **Split the code into several files.** Don't put the section in one big component.
9. **Make it lively.** Ambient motion runs everywhere, but it must never make the stop text hard to read.
10. **It must work on GitHub Pages and on every screen size**, from small phones to wide desktops (see section 5).

## 2. Libraries (all free)

| Package | Why | License |
| --- | --- | --- |
| `gsap` + `@gsap/react` | `ScrollTrigger` (pin, scrub, snap) and `MotionPathPlugin` (plane follows the SVG route and auto-rotates to its heading). All GSAP plugins are free since v3.13. | GSAP standard "no charge" license |
| `lottie-web` (light SVG player) | Plays the plane, sky (clouds, birds, balloon) and rocket from Lottie `.json` files. Replaced `@lottiefiles/dotlottie-react` in Phase 14 (its WASM renderer was 505 kB gzip). | MIT |
| `lenis` | Smooth wheel/trackpad scrolling, hooked into GSAP's ticker. Desktop only; touch keeps native scrolling. | MIT |
| `motion` (already installed) | Stop-card enter/exit (`AnimatePresence`), skill-chip "boarding" springs, station hover/tap | MIT |
| `lucide-react` | Small icons inside the stop card (calendar, map pin) | ISC |
| `three` + `@react-three/fiber` + `@react-three/drei` | Space finale: starfield (`<Stars>`) and the map curling into a mini planet. Lazy chunk, loaded near the end. | MIT |

### Assets

| Asset | Source | License |
| --- | --- | --- |
| Plane animation (side or top-down view, propeller or jet) | lottiefiles.com free animations (`.lottie`) | Lottie Simple License: free, commercial use OK |
| Takeoff / contrail puff | lottiefiles.com | Lottie Simple License |
| Trees, clouds, birds, river shimmer | lottiefiles.com | Lottie Simple License |
| Stop marker (if not using the plain pulsing dot) | lottiefiles.com location-pin animation, or a Kenney tile | Lottie Simple License / CC0 |
| Cute top-down map tiles (grass, roads, water, buildings) | kenney.nl: *Tiny Town* (plus *Tiny Battle* / *Pixel Shmup* if needed) | CC0 (public domain) |

Store downloaded files under `src/assets/experience/` and list every one in
`src/assets/experience/CREDITS.md` with its source URL and license.

## 3. File architecture

```
src/
  components/
    ExperienceSection.jsx            # Section shell + heading; lazy-loads the journey
    ExperienceSection.module.css
    experience/
      FlightJourney.jsx              # Orchestrator: pinned stage, composes layers
      FlightJourney.module.css
      useJourneyScroll.js            # GSAP ScrollTrigger pin/scrub/snap -> progress + activeIndex
      useSmoothScroll.js             # Lenis setup (desktop only), synced with gsap.ticker
      useReducedMotion.js            # prefers-reduced-motion hook
      useStageFrame.js               # Measures the pinned stage; scale + offset to fit the world
      gsapSetup.js                   # Registers GSAP plugins once; import gsap from here
      useViewportProfile.js          # 'phone' | 'tablet' | 'desktop' via matchMedia
      routeGeometry.js               # Stop x/y positions + SVG path "d" (pure, per viewport profile)
      spriteAtlas.js                 # Data: Ninja Adventure sprite rects + ground autotile sets
      worldLayout.js                 # Data: row bands, districts, lanes, ponds, countryside zones
      buildWorld.js                  # Pure, seeded world builder (autotiles, overlap checks, scatter)
      MapBackdrop.jsx                # Draws ground, decals and sprites onto one pixelated canvas + day tint
      SkyLayer.jsx                   # Near parallax layer: Lottie clouds, sparrows, balloon
      lifeConfig.js                  # Data: animated sheets, smoking buildings, flags, townsfolk, boarding
      buildLife.js                   # Pure: ambient life placement + per-stop boarding walks and times
      LifeLayer.jsx                  # Flags, smoke, ripples, water wheels, strolling townsfolk
      LifeSprites.jsx                # LoopSprite (stepped sheet) + Walker (walk-sheet character)
      LifeLayer.module.css           # Sprite frame/walk animations, pause + reduced-motion rules
      sceneryAssets.js               # Vite-imported asset URLs (sprite sheets, sky Lottie)
      useAmbientMotion.js            # Looping GSAP tweens that pause off-screen
      LottieSprite.jsx               # Thin wrapper over DotLottieReact (lazy, pause offscreen)
      FlightRoute.jsx                # Thick rounded Mini Metro line; draws in with scroll
      RouteStop.jsx                  # Pulsing dot / marker asset + label (focusable button)
      StopSign.jsx                   # Stop name: airport sign; departure board with split-flap when active
      FlightPlane.jsx                # Lottie plane in layers: move+pitch, ground shadow, lift, facing
      SkillPassengers.jsx            # BoardingWalkers (map) + PickedUpPasses (card)
      passengers.js                  # Pure: which skills are aboard after a stop
      FinalDestination.jsx           # FinaleMarker (map) + FinaleCard: "Next stop: could be your company!"
      SpaceScene.jsx                 # Lazy R3F scene: stars, mini planet (curled map), rocket, second planet
      StopCard.jsx                   # Details of the stop the plane is parked at
      StopCard.module.css            # Card, panel placement, chips, finale styles
      useOnScreen.js                 # Gates first-stop card/boarding until the journey is visible
      sceneryConfig.js               # Which Lottie/tile goes where (data only, no JSX)
  assets/experience/
    lottie/*.json
    tiles/*.png
    CREDITS.md
  data/careerRepository.js           # Single source of truth for milestones (reuse)
```

Responsibilities:
- **Data**: `careerRepository.js` only. Stops come from `getAllMilestones()` in order.
- **Geometry**: `routeGeometry.js` is pure functions with no React. Every layer reads
  positions from it, so the route, stops, scenery and plane stay aligned.
- **Scroll**: `useJourneyScroll.js` owns the GSAP timeline. Components get
  `progress` / `activeIndex`; they don't create their own ScrollTriggers.

## 4. Scroll model

- The section's height is roughly `100svh × (stopCount + 1)`. The extra step is for the
  final destination. ScrollTrigger pins the stage with `scrub`. Snapping is custom, not GSAP `snap`:
  - **Wheel/trackpad (Lenis):** the first event of a gesture flies to the next stop, and the rest
    of that gesture is absorbed (via Lenis's `virtualScroll` hook) so momentum can't skip a stop.
  - **Touch, keyboard, scrollbar:** on `scrollEnd`, fly one stop from where the gesture started.
- One master timeline: the camera pans the world horizontally (`x`), the plane follows the
  route path (`motionPath`, `autoRotate`), and the route stroke draws in behind the plane.
- Scrolling up plays the timeline in reverse, so the plane flies back along the same route
  and flips to face the direction it's travelling.
- Clicking or keyboard-activating a stop scrolls the page to that stop's scroll offset
  (`lenis.scrollTo` / `window.scrollTo`), so scroll stays the only source of truth.
- Never trap the page. The only wheel input that gets absorbed is the rest of a gesture
  that has already flown a stop, and only inside the journey. At either end, the wheel scrolls
  the page normally. Never call `preventDefault()` on touch events.

## 5. GitHub Pages & every device size

- `vite.config.js` already has `base: '/Personal-Portfolio/'`. **Every asset must be imported
  through Vite** (`import planeUrl from '../../assets/experience/lottie/monoplane.json?url'`).
  Never write absolute paths like `/assets/...`, because they 404 under the repo sub-path.
- Lottie animations are plain JSON played by `lottie-web`'s light SVG player (Phase 14); nothing
  loads from a third-party CDN.
- Viewport profiles (`useViewportProfile`):
  - **phone** (< 640px): the route is wider than the screen and the camera follows the plane.
    Assets are smaller, there are fewer scenery sprites, and the stop card is docked
    below the map. Tap targets are at least 44px.
  - **tablet** (640–1023px): medium scale, and the card overlays the top-left of the map.
  - **desktop** (≥ 1024px): full scenery, and the card overlays the map.
- Touch: native scrolling (no Lenis `syncTouch`). Use `ScrollTrigger.config({ ignoreMobileResize: true })`
  and `svh` units so the mobile address bar doesn't make the pin jump.
- Rebuild the geometry and timeline on resize or orientation change (`invalidateOnRefresh`).
- Test widths: 360, 390, 768, 1024, 1440 and 1920px, plus phone landscape.

## 6. Final design (approved ideas)

1. **Plane flight across a cute map.** The plane flies a thick, rounded, Mini Metro–coloured
   route over a Kenney tile map, with Lottie trees swaying, clouds drifting, birds and river shimmer.
2. **Stops** are pulsing dots (or a downloaded animated marker) that ripple when the plane arrives.
3. **One stop per scroll**, and scrolling up reverses the plane along the same route.
4. **The route draws itself** behind the plane as it flies.
5. **A small district at each stop**, made only from Kenney tiles and Lottie sprites:
   - campus trees for Christ University
   - a tech park for Hitachi
   - an arcade quarter for Red Panda Games
   - a lab for Stipe
   - a downtown headquarters for Walmart
6. **Skills come aboard as passengers.** On arrival, that stop's skills pop up as small chips and
   hop into the plane. The stop card shows "Picked up here" for the current stop, plus a compact
   "On board" row of everything collected so far, which grows over the journey and shrinks
   when you scroll back.
7. **Day turns to dusk.** The sky gradient shifts slowly from the first stop to the last.
8. **Parallax depth.** Far hills, the map and near clouds move at different speeds.
9. **Arrival moments.** The plane eases in, banks slightly and hovers; the stop pulses.
10. **Clicking or tapping a stop** flies the plane there.
11. **Finale.** One scroll past Walmart, the plane climbs off the end of the route toward an
    open, dashed destination marker: *"Next stop: could be your company!"* It links to the
    contact section.

**Rejected:** Mini Metro geometric station shapes, a train, confetti, a sound toggle,
legends, counters and progress bars.

## 7. Phases

### Phase 0: Plan & docs ✅
- [x] Roadmap (this file), with final ideas agreed with the owner
- [x] AI instruction file (`.github/instructions/mini-metro-experience.instructions.md`, linked from `CLAUDE.md`)

### Phase 1: Clean slate & foundation ✅
- [x] Delete the old implementation: everything previously in `src/components/experience/`,
      plus `src/components/CareerAtlasMap.jsx`, `src/data/careerMap.js` and the unused CSS
      in `ExperienceSection.module.css`
- [x] `npm i gsap @gsap/react @lottiefiles/dotlottie-react lenis lucide-react`
- [x] Create the Phase 1 files (`FlightJourney`, `FlightRoute`, `RouteStop`, `useViewportProfile`,
      `routeGeometry`). Each later file is created in the phase that needs it, so there are no empty stubs.
- [x] `useViewportProfile.js` and `routeGeometry.js`: stop positions and the route path per profile
- [x] Static render: plain background, route line, pulsing stop dots and labels in one row
- [x] Added a `shortName` to each milestone in `careerRepository.js` for map labels
- [x] `npm run build` passes. Checked under `vite preview` at 360, 390, 768, 1024, 1440, 1920
      and 844×390: all stops render, the page never scrolls sideways, and nothing in the app 404s.
- Note: the map currently scrolls sideways inside its own frame. Phase 2 replaces that with the pinned camera.

### Phase 2: Scroll engine ✅
- [x] `useSmoothScroll` (Lenis + gsap.ticker; wheel/trackpad only, since Lenis leaves touch native; off for reduced motion)
- [x] `useJourneyScroll`: pin, scrub, one-stop snap (`directional`, `inertia: false`, so a fast
      flick still moves only one stop), camera pan, active step (`n` = the finale)
- [x] The route draws itself in as you progress (`pathLength="1"` + dashoffset), over a faint "planned" line
- [x] Clicking a stop or pressing Enter on it scrolls the page to that stop (scroll stays the only source of truth)
- [x] The section un-pins cleanly after the finale and in reverse
- [x] The pinned stage fits one screen (`100svh`); `useStageFrame` scales the world to fit (844×390 now fits)
- [x] `Reveal` pin conflict fixed: its visible state now ends at `transform: none` (`styles.css`)
- [x] Verified with real wheel input at 1440×900 and native scrolling at 390×844 and 844×390: every
      stop is reached exactly once going down and again going up.
- Added files: `gsapSetup.js` (registers plugins once), `useStageFrame.js` (fits the world into the stage)

### Phase 3: The plane ✅
- [x] Plane: "Loading 51, Monoplane" by Jeffrey Christopher (chosen by the owner), stored at
      `src/assets/experience/lottie/monoplane.lottie` and credited in `CREDITS.md`
- [x] The dotLottie WASM is self-hosted (`lottieSetup.js`, with `@lottiefiles/dotlottie-web` pinned to the
      React wrapper's version). Verified: no runtime request leaves the site.
- [x] `LottieSprite.jsx`: shared wrapper (loops, freezes off-screen, still frame for reduced motion)
- [x] `FlightPlane` follows the route with `MotionPathPlugin` and auto-rotates on the jogs
- [x] Route reshaped: a flat apron at each stop so the plane parks level, and rounded corners so it banks smoothly
- [x] It faces the direction of travel (flips when scrolling up). The Lottie's own bob and spinning
      propeller provide the hover while parked.
- [x] Fixed: GSAP was rounding the route-draw offsets to whole px, so the line only appeared at the last stop
- [x] Scroll engine reworked: GSAP snap fought Lenis and could snap backwards. Wheel gestures now
      launch the flight immediately (`virtualScroll` hook in `useSmoothScroll`). Touch, keyboard and
      scrollbar snap on `scrollEnd`. Tested: one notch, a 60-event trackpad gesture, leaving past
      either end, reduced motion, and touch at 390×844 and 844×390.
- Skipped: separate contrail Lottie. The plane animation already includes small passing clouds.
  Add one in Phase 4 if the owner picks an asset.

### Phase 4: The cute map ✅
- [x] Kenney Tiny Town map (CC0): `tileMap.js` builds a seeded tile grid. `MapBackdrop` draws it once
      onto one canvas at 16px and scales it up with `image-rendering: pixelated`. The map bleeds
      320px above and below the world so tall stages are never bare. A corridor around the route
      stays clear so labels and the plane always read cleanly.
- [x] A district for each stop (`DISTRICTS` in `sceneryConfig.js`):
  - campus hall (Christ University)
  - stone tech park with wind turbines (Hitachi)
  - cottage with archery targets and autumn trees (Red Panda Games)
  - lab with a well and fence (Stipe)
  - two-building downtown block (Walmart)
  - empty dirt plot with a sign at the finale, ready for "could be your company"
- [x] `SceneryLayer`: Lottie windmills and wind turbines, plus Kenney tall trees that sway (GSAP skew)
- [x] `SkyLayer`: Lottie clouds, sparrows and the hot-air balloon on a near layer panned at 1.3× the
      camera (parallax), each drifting slowly on its own
- [x] Day tint: morning → midday → golden hour → dusk across the journey (`SKY_TINTS`)
- [x] Loops pause off-screen (`useAmbientMotion` + dotLottie `freezeOnOffscreen`). Phones get
      7 Lottie players instead of 12. With reduced motion: no loops, and Lottie holds a mid-loop still.
- Changed from the plan: there's no river (Tiny Town has no water tiles and no Lottie river matched
  the style), and no swaying Lottie trees (the candidates clashed with the pixel art). Kenney trees
  sway instead. There are two depths (map and sky) rather than three: a top-down map has no hills.
- Assets: 5 Lottie files (2–11 kB each) and one 5 kB tile sheet, all credited in `CREDITS.md`

### Phase 5: Stops, passengers & stop card ✅
- [x] "Arrived" is driven by the animation's own time (not the raw scroll), so the card and the
      boarding wait until the plane has actually landed. Both hide while it flies.
- [x] Stop arrival ripple: a one-off ring burst from the pulsing dot (`RouteStop`)
- [x] `StopCard`: organization, role, period, location and up to 3 highlights (2 on phones and shorter
      laptops, 1 under 720px tall, none on short landscape screens); spring slide-in via `motion`
- [x] Card placement:
  - tablet/desktop: floats top-left, and flips to top-right when the parked plane is on the left
    (e.g. the first stop at 1366×768)
  - phones: docked in a bottom band (42%) that `useStageFrame` keeps free, so the map sits above it
  - verified with no overlap of the plane or any visible label at every stop on 7 sizes
    (1280×720 to 1920×1080, 768×1024, 390×844, 360×640)
- [x] `SkillPassengers`:
  - on landing, the stop's skills queue under the stop and hop into the plane one by one
  - the card lists "Picked up here" (skills already aboard are greyed) and a one-line "On board"
    row, newest first, where new passengers appear as their own hop lands
  - a skill boards once (e.g. C#, Unity), giving 28 by the finale
- [x] `FinalDestination`: the open, dashed destination ring glows when the plane parks there, and the card
      reads "Next stop: Could be your company!" with Email and LinkedIn buttons (44px targets).
      The site has no contact section, so these use the same links as the header.
- [x] Screen readers: a polite live region announces each arrival ("Arrived at …")
- [x] Reduced motion: no boarding hop, passengers appear at once, card has no slide
- New files: `StopCard.jsx`, `StopCard.module.css`, `SkillPassengers.jsx`, `FinalDestination.jsx`,
  `passengers.js` (pure), `useOnScreen.js` (the first stop's card and boarding wait until the journey is on screen)
- Note: the journey chunk grew from 112 to 161 kB gzip because `motion` is now used. Review in Phase 6.

### Phase 6: Responsive, a11y, performance, Pages check ✅
- [x] Layout sweep at 13 sizes, checking every stop:
  - phones 320×568, 360×640, 375×667, 390×844, 412×915, 430×932
  - landscape 667×375, 844×390
  - tablets 768×1024, 1024×768
  - desktops 1280×720, 1366×768, 1440×900, 1920×1080, 2560×1440
  - result: the card is never clipped and never covers the plane or a visible label, and the page never scrolls sideways
  - fixes: on phones "Picked up here" is one fading line; short phones (< 700px tall) keep one highlight
    and drop that row (the boarding still shows on the map); ≤ 360px wide uses tighter spacing
- [x] Tap targets ≥ 44px at any map scale (`--world-scale`); before this, stops shrank to 32px on short screens
- [x] `prefers-reduced-motion`: no Lenis, no loops, Lottie stills, no boarding hop, passengers appear at once
- [x] Keyboard:
  - Tab goes through every stop, then the finale (now a real button), then the finale's Email and LinkedIn
    links, then out
  - keyboard focus flies the plane to the focused stop, and focus rings are visible
  - PageDown and the arrow keys move one stop
- [x] Fixed: rotating a phone (or resizing) mid-journey jumped to a different stop. The step is now
      restored after the rebuild, and the reported stop is re-synced (ScrollTrigger refreshes silently).
- [x] Fixed: a 1px stage-height jitter at pin time rebuilt the timeline and dropped keyboard focus.
      `useStageFrame` ignores changes ≤ 2px, and focus is restored after any real rebuild.
- [x] Fixed: deep links (`…/#skills`, `#work`, `#experience`) loaded at the top of the page. After the
      first pin is measured, the journey scrolls to the hash target. A plain load never moves the page.
- [x] Bundle: `motion` switched to `LazyMotion` + `m` (161 → 147 kB gzip). Removed the unused metro
      data from `careerRepository.js` (transit lines, station codes and numbers, coordinates, 7 getters).
- [x] Final check with `npm run build` + `vite preview` under `/Personal-Portfolio/`: all behaviour tests
      pass, and the only 404 is the site-wide `/favicon.ico` (the site has no favicon).
- Open decision (owner): the dotLottie WASM renderer is 505 kB gzip, the heaviest download on the
  page. Switching to `lottie-web`'s light SVG player (~45 kB gzip, no WASM) would save about 0.5 MB
  per visit, but it means replacing the Lottie library and converting the `.lottie` files to `.json`.
- Not verifiable here: real-device feel (iOS Safari momentum, Android Chrome). Check on a phone after deploying.

## 8. Round 2: owner feedback and plan (Phases 7–14)

Phases 1–6 are done. This round reworks the look and feel. Work one phase at a time, only when the
owner asks, with the same build + browser checks as before. Several phases are blocked on the
**open decisions** at the end of this section.

### Decisions so far (owner, after Phase 6)
- **Look:** a rich, cohesive 16-bit top-down RPG town, like the owner's reference images: a
  Pokémon-style pastel village (pond, paths, palms, colourful roofs) and a cosy night town
  (lantern-lit streets, detailed roofs, characters). Many assets, complete sprites, nothing
  overlapping, and one consistent style.
- **A real journey:** lots of space between stops. The countryside between stops (forests, fields,
  ponds, roads, bridges) should feel like travelling a distance.
- **Stops are airports:** a small airfield (runway, terminal or hangar, tower) instead of the plain dot.
- **Name on arrival:** skip it, unless it can be a genuinely complex animation (parked idea).
- **Stop names:** restyle into something attractive, e.g. an airport sign or gate board, not the plain pill.
- **Flight path:** a straight, level line.
- **Stop card:** remove the "On board" row and its chips. Keep "Picked up here".
- **Skills boarding:** slower, and better-looking skill shapes (e.g. little boarding passes or tickets).
  Make it natural: the skills come out of the district's buildings, walk from house to house or
  along the path to the airport, then board (owner: "visit one house to another… look natural").
- **Speed:** no more "one scroll = one stop". The plane moves in proportion to how far you scroll.
- **Space finale:** after Walmart, the whole map curls into a **mini planet**. The plane transforms
  into a **rocket** and launches through space to **another planet**, where the "Could be your
  company!" card pops up. Use a React space/galaxy library for the stars and planets.

### Phase 7: Card and label polish ✅
- [x] Removed the "On board" row (label + chips + CSS) from the stop card and the finale card.
      `passengers.js` stays: it marks skills already aboard and holds the per-stop pass colours.
- [x] Stop names are airport signs (`StopSign.jsx`): a yellow wayfinding sign with a landing icon on a short
      post. The active stop becomes a dark departure board whose letters flip in like a split-flap display.
- [x] Skills are boarding passes: a coloured ticket per stop (`passColorFor`, all AA with white text), a
      plane-icon stub split off by a dashed perforation with notches. Skills already aboard are grey with ✓.
- [x] Slower, synced boarding: the queue takes about 4 s (was 1.4 s), and each pass stamps into the card
      as its twin on the map reaches the plane. Reduced motion: passes show at once, no hop.
- [x] Phones and short screens keep "Picked up here" as one fading line (it was hidden before).
- [x] Card-fit sweep (13 sizes, every stop): no clipping and nothing covering the plane or a sign.
      Regression: scroll, gestures, reduced motion, keyboard, resize/rotate all pass.
- Note: the boarding passes on the map are interim; Phase 11 replaces them with walking characters.

### Phase 8: Scroll model ✅
- [x] One-stop snapping removed (both the wheel stepping and the `scrollEnd` snap). The plane moves
      exactly as far as the visitor scrolls and stays where scrolling stops (no settling).
- [x] Speed: 0.65 viewport heights of scrolling per stop (`STEP_SCROLL_VH`, was 1). A mouse notch ≈ 0.17
      stop, a phone swipe ≈ 0.22. Lenis smoothing plus a 0.5 s scrub glide ease the plane to rest.
      Each hop keeps its ease-in-out, so the plane lingers near airports and speeds up between them.
- [x] Card and boarding appear within 0.12 of a stop and stay until 0.2 away (hysteresis, no flicker).
- [x] Wheel while pinned: **over the map** scrubs; **anywhere else** glides out of the journey
      (down → `#skills`, up → the top of `#experience`). The rest of that gesture is absorbed, so a long
      trackpad swipe still lands exactly on Skills. Not pinned → normal scrolling everywhere.
- [x] Touch, keyboard (PageDown/arrows) and the scrollbar scrub proportionally (native). Phones leave
      by scrolling past the finale. With reduced motion (no Lenis) every wheel scrubs natively.
- [x] Resize/rotation now restores the exact position, not a rounded stop. Fixed while testing: during
      ScrollTrigger's re-measure (refreshInit → refresh) progress uses the new viewport and was
      overwriting the saved position, so those updates are now ignored.
- [x] Tested: notches, trackpad gesture, no snap after 1.5 s, outside-map down/up and trackpad, normal
      scrolling above the journey, stop click, resize (1.5 → 1.5), phone swipes, rotation (2.6 → 2.58),
      card fit (8 sizes), keyboard path, deep links, reduced motion.

### Phase 9: New tileset and world layout (D2 decided: AI picks a neat, licensed pack)
- [x] Ninja Adventure (CC0) sheets copied to `src/assets/experience/ninja/` (six sheets, ~174 kB, plus
      licence and readme) and credited. Kenney Tiny Town and the Lottie windmill and turbines are removed.
- [x] `spriteAtlas.js` (data): about 80 named sprites, each verified by rendering its crop, plus the
      ground autotile sets (dirt and water: 3×3 patch, strips, dot, inner corners).
- [x] `worldLayout.js` (data): row bands (meadow, route corridor, buildings, road, river, farmland),
      a themed district per stop, lanes with bridges, ponds, and seeded countryside zones.
      `buildWorld.js` (pure) replaces `tileMap.js`: it autotiles ground from neighbours, places
      authored sprites with **strict overlap checks** (any conflict is logged in development; there
      are 0 conflicts on every profile), then scatters countryside and street lamps only where free.
- [x] Stops are spread out: 32 tiles apart (28 on phones), with 16 tiles before the first. The world is
      ≈ 3× longer, and scrolling per stop rose to 1.2 screens (`STEP_SCROLL_VH`) so the pace holds.
- [x] The flight line moved up the world (baseline 250, or 170 on phones) and tiles are 40px
      (32 on phones), so the town, road and river are visible under the route.
- [x] Districts: campus (timber hall, torii, blossoms), tech park (red and lantern halls, lamps,
      supplies), games street (shop, stalls, banners), AR lab (round lab, dome hut, crystals, ore
      rocks), downtown (row of halls, shed, log cart), and the finale plot (fences, sign, washing
      line). About 410 sprites and 185 ground details per world.
- [x] Fixed while testing: `Reveal` used a 15%-visible threshold, which a ~6-screen pinned section can
      never reach on a phone, so the journey stayed invisible and its transform broke the pin. It now
      reveals when the element's top enters the viewport (`rootMargin`).
- [x] Portrait tablets now dock the card like phones (`.panelDocked`, `useIsPortrait`). The higher
      flight line had put the signs under the floating card on 768×1024.
- [x] Card fit: 15 sizes × 6 steps clear. Regression: scroll model, keyboard, deep links, reduced
      motion, rotation all pass. Performance: 8 Lottie players on desktop (was 12), no dropped frames.
- Each stop's airport site (columns −3 … +2, rows +1 … +5) is left empty for Phase 10.

### Phase 10: Straight route and airports ✅
- [x] Straight, level flight line: `routeGeometry.js` now joins the stops (and the finale) with straight
      lines. The hop shapes, corner rounding and MotionPathPlugin are removed (≈ 8 kB gzip smaller).
- [x] D3 resolved: the owner's `Airport Game Sprites.zip` is the Konig pack (interior only, no licence),
      so per the owner's fallback each stop gets a **rustic airfield** from Ninja Adventure (`AIRFIELD`
      in `worldLayout.js`): a 12×3 dirt runway centred on the flight line (the route is its centre
      marking), a barn hangar, a wooden watchtower as control tower (new `towers.png` sheet), fuel
      barrels and crates, a banner windsock, and a wooden terminal under the stop sign. Free and on-style;
      it reads as a countryside airstrip rather than a modern airport.
- [x] Take-off and landing with a top-down altitude: `FlightPlane` has layers for plane (x + pitch),
      ground shadow, lift (rise + scale) and facing (flip). Each hop rolls on the runway (eased x), lifts
      off at 15 % with the nose up, cruises at `cruiseLift` above its shadow, descends nose-down from 55 %
      and touches down about 40 px before the stop, still on the runway. Played backwards it climbs and
      lands mirrored (`FLIGHT` in `useJourneyScroll.js`).
- [x] The stop dot and focus ring sit on each runway's centre line; the signs hang below the runway.
- [x] 0 layout conflicts on all profiles. Regression: scroll model, card fit (10 sizes), keyboard,
      deep links, reduced motion, rotation and performance all pass.

### Phase 11: Life on the map ✅
- [x] Skills are passengers: on landing, each skill steps out of one of the district's buildings
      (nearest doors first, in turn) as a Ninja Adventure villager holding its boarding pass. It
      walks to the road, along it to the airfield, in through the terminal door, out at its side,
      around the stop sign, across the runway and aboard (`planBoarding` in `buildLife.js`). A stop
      boards in about 7–8 s; the card stamps each pass exactly when its villager boards.
- [x] Ambient life (`buildAmbientLife`, `LifeLayer.jsx`): fluttering flags on every control tower and
      hangar (plus the games street and downtown), chimney smoke on 12 houses, ripples on open water
      (the river widened to 3 rows so it has open water), a water wheel beside each bridge, and
      townsfolk strolling the road near each stop and walking the lanes over the bridges.
- [x] Sprites animate with CSS `steps()` (frames) + GSAP (walking), and pause off-screen. No frame-rate
      cost measured. Phones get 1 townsperson per stop (not 2), no lane walkers, and half the ripples.
- [x] Reduced motion: townsfolk stand still, no boarding walk, passes appear at once, loops hold one frame.
- [x] Fixed while testing: passengers covered the stop sign, first when walking over it and then when
      coming out of the terminal's roof side. They now leave at the terminal's side and keep ≥ 190 world
      px clear; a sampling test confirms no overlap at any moment on desktop, phone and tablet.
- Note: walk sheets and animation strips are < 4 kB each, so Vite inlines them in the journey chunk
  (+12 kB gzip, 16 fewer requests).

### Phase 12: Space finale, part 1 ✅ (D5: React Three Fiber + Drei)
- [x] `three` 0.186, `@react-three/fiber` 9, `@react-three/drei` 10 (`<Stars>` only). `SpaceScene.jsx`
      is a lazy chunk (≈ 245 kB gzip) that downloads only once the plane reaches the last stop; the
      first load is unchanged. Without WebGL the leg still fades to dark space, with no planet.
- [x] The last leg (Walmart → finale), in fractions of the hop (`SPACE` in `useJourneyScroll.js`):
      the plane takes off and reaches the finale marker by 0.55 while the view settles on it; the space
      layer (stars) and the dark stage fade in from 0.3, the 2D map fades out from 0.42, and from 0.5
      the map curls into a spinning mini planet with a soft atmosphere as the view pulls back.
- [x] Seamless swap: the 3D copy is the live map canvas (cropped to what's on screen, with the live
      dusk tint painted on), and the camera's fov and the copy's offset are derived each frame from
      the stage frame and the 2D camera pan, so it sits pixel-for-pixel on the 2D map during the cross-fade.
      The plane morphs onto a sphere (morph target via UVs), then eases to the centre of the space the
      card leaves free.
- [x] Scrubbed both ways: scrolling back uncurls the planet and fades the map back in.
- [x] Only renders 3D frames on the last leg (paused while parked at Walmart or off-screen); phones
      draw fewer stars at a lower pixel ratio. Reduced motion: no spin or star drift.
- [x] Regression: scroll model, card fit (7 sizes), deep links, reduced motion, rotation, life and
      performance all pass. Known noise: three's "THREE.Clock deprecated" console warning (from R3F).
- Note: the wheel-outside-the-map glide to Skills passes the finale, so it also loads the space chunk.
- Note: the planet shows the meadow around the finale; Phase 13 can dress that district if it looks too plain.

### Phase 13: Space finale, part 2 ✅
- [x] The last leg is now 2 steps of scrolling (`LAST_LEG`; `legMapping` turns timeline time into the
      journey position, so stop arrival, deep links and `scrollToStep` stay correct).
- [x] Plane → rocket: as the map fades, the plane shrinks away (`back.in`) and a Lottie rocket
      ("rocket launch", Camila Masetti, Lottie Simple License) pops out in its place (`back.out`). It rides
      to the top of the mini planet while the map curls, idles there, then launches along an arc
      (nose along its path) and lands upright on the second planet.
- [x] Second planet: the second stop's town from the same map, hue-rotated into an icy lavender world
      with a pink atmosphere, so it matches the pixel style. It swings in from the edge while the mini
      planet drifts to a corner. One screen-space layout (`spaceLayout` in `SpaceScene.jsx`) places both
      planets and the rocket; docked layouts keep everything above the card and the arc inside the stage.
- [x] The "Could be your company!" card appears as the rocket lands (Email / LinkedIn kept), on the left
      on desktop (the planet is on the right) and docked on phones and portrait tablets.
- [x] Keyboard: Tab from the last stop reaches the finale marker, which flies to the end; the next Tabs
      reach Email and LinkedIn. The live region still announces "Next stop: could be your company."
- [x] Regression: scroll model, card fit (7 sizes), deep links, reduced motion, rotation, life and
      performance all pass. The space chunk grew by ≈ 1.5 kB gzip (the rocket is a 13 kB `.lottie`).
- Note: without WebGL the plane still shrinks away and the card appears on dark space (no planets or rocket).

### Phase 14: Performance and regression pass ✅
- [x] WASM decision: switched from dotLottie to `lottie-web`'s light SVG player (`LottieSprite.jsx`;
      plays, pauses off-screen, reduced-motion still frame). The five animations were unpacked from
      `.lottie` to plain JSON (no expressions or images; fetched once via `?url`). The journey now
      downloads ≈ 500 kB gzip less: the 505 kB WASM is gone, the player adds ≈ 6 kB to the journey
      chunk (155 kB gzip) and the JSON files total ≈ 34 kB gzip. `lottieSetup.js` was removed.
- [x] Owner changes:
  - **Wheel outside the map skips the journey** instead of playing it through at speed: the map
    fades out (0.18 s), the page jumps past the pinned stretch with the timeline snapped to that
    end (`trigger.getTween().progress(1)`, step reports muted so nothing off-screen reacts, e.g.
    the space finale doesn't load), then glides the last 0.3 screen to Skills (or up to the
    Experience heading, fading the map back in). Tested: the plane jumps straight from its stop
    to the end, with no frames in between.
  - **Passengers walk straight from their house to the plane** (no road trek, no terminal). The
    route is found on a half-tile grid (`walkGrid` in `buildLife.js`, A* with a turn penalty) that
    avoids every sprite's footprint and a no-go box around the sign sized from the sign's and the
    pass's text (`signClearance`). Slower walk (3 tiles/s) and a follow gap from the same door, and
    walkers lower on the map draw in front, so passes don't cover other walkers.
  - **Characters:** the Ninja Adventure characters are 16×16 chibis that read as a head with the
    body cut off (verified pixel for pixel against the sheets), so all walkers now use 12 full-bodied
    townsfolk from **PIPOYA FREE RPG Character Sprites 32x32** (free for commercial use, no
    redistribution of the raw files; credited). RPG Maker layout (3 frames × 4 facings), drawn at
    0.8 of the map's pixel size (about 1.6 tiles tall); the sign no-go box uses the new height.
  - **Terminal hut roof:** `hutWood` was cropped one row low, cutting off its roof at every stop;
    fixed (all 77 sprite crops re-checked against the sheets; that was the only bad one).
  - **Bridges:** the sheet's bridge is shorter than the 3-row river, and its crop included a stray
    plank piece. It is now a stretched sprite (`slice` in `spriteAtlas.js`: top row, repeated middle,
    bottom row) spanning bank to bank, centred on its lane. Water ripples are no longer placed
    under bridges (they draw above the map and showed through).
  - **Townsfolk were never moving:** `useAmbientMotion` waited for the stage ref, which isn't attached
    yet when the life layer mounts, so their loops never started. It now falls back to watching its
    own layer. Townsfolk also breathe (CSS) and turn to face the street while they pause.
  - **Faster boarding:** 4.2 tiles/s and a 0.6 s stagger.
  - **Shorter boarding routes:** the sign no-go box (and its text-width estimates) was replaced by
    stacking stops above passengers, who now simply pass behind the sign; low flowers and bushes are
    walkable. Longest walk at any stop went from 32–35 tiles (Christ University; Walmart's
    "Heuristic Evaluation") to 12–17, and every stop boards in 6.6–8 s.
  - **Passes** no longer show the plane/tick icon (map and card); they are plain tickets with
    notched ends.
- [x] Full test sweep: scroll model and wheel-out (new `leave` test), card fit (7 sizes), sign cover
      (3 sizes, all stops sampled), paths through sprites (none, all stops/profiles), keyboard to
      the finale's links, reduced motion, resize/rotate, deep links, space finale, performance.
      The production build is served under `/Personal-Portfolio/` in every test.
- Known: `npm audit` reports a high-severity advisory in Vite 8.2's dev server (`launch-editor`,
  dev only, not in the built site); fixed in Vite 8.3.5. Upgrade when convenient.
- Known: three.js logs a "THREE.Clock deprecated" warning from React Three Fiber (harmless).

### Decisions (owner answers)
- **D1 ✅ (scroll):** the wheel **over the map** moves the plane; the wheel **anywhere else** on the
  page skips past the journey on to Skills & tools. **No settling:** the plane stays exactly where
  scrolling stops.
  - Touch and phones: the map fills the screen, so a swipe on the map moves the plane. Confirm in
    Phase 8 how a phone visitor leaves (e.g. swiping on the heading or the margin, or reaching the end).
  - Keyboard: PageDown and the arrows count as "over the map" while the journey is pinned (to confirm in Phase 8).
- **D2 ✅ (asset pack):** the owner's images are only a mood reference. The AI picks a similar pack that
  looks neat and cohesive and is licensed for a public site, and credits it. First candidate: Ninja
  Adventure (CC0). Compare it against 1–2 alternatives with a rendered sample before committing.
- **D3 (airport sprites):** owner rule: use (c) animated airport Lottie if viable, otherwise (a) an
  airport tile pack. It must look like a **real airport**, not a few pieces the visitor has to
  imagine into one.
  - **(c) checked and rejected:** 9 LottieFiles airport animations rendered. All are side-view or
    isometric flat vector, with their own sky and planes (best: "Airport" by Murat Avcı). None is
    top-down, so on the pixel map they would look pasted in.
  - **(a) candidates** (itch.io, checked for price and licence):
    - Cute SCKR, "Modern Airport Top-Down Pixel Art Tileset" (≈ $4–5): top-down exterior, the best
      visual fit. Licence: "commercial use allowed **in game projects**", no redistribution, credit
      optional. A portfolio site isn't a game, so get written OK from the creator before using it.
    - Cute SCKR, "Modern Airport Pixel Art Tileset Pack" (≈ $4–5): mostly interiors, same licence.
    - Konig Games, "FREE Airport Sprite Pack" (free): top-down, RPG Maker style. No terms on the
      page; read the licence in the download before using it.
    - Rejected: Kokoro Reflections "KR Transportation Station" ($19.99, "Games only. No exceptions!").
      Pixels On Ultra "Airport Terminal" ($6.99, indoor only; licence lists games, trailers and store pages).
  - **Konig pack reviewed and rejected** (the owner downloaded it into `asset-inbox/`, which git ignores):
    it is an airport **interior** only (gate desk, walkways, vending machines, duty free, security ropes,
    a pizza stand) with no runway, tower, apron or terminal exterior, and it has **no licence** in the
    files or on the page.
  - ⏳ **Still open:** the only real top-down exterior airport found is Cute SCKR's pack (≈ $4–5, licence
    says "game projects": ask the creator about website use). Other options: the owner finds a pack,
    or the airport is built from Ninja Adventure pieces (a paved plaza and roads as runway and apron, plus
    tower-like buildings). The second option looks less like a real airport, which the owner wants to avoid.
- **D2 settled: Ninja Adventure** (Pixel-boy & AAA, **CC0**, README confirms), downloaded into `asset-inbox/`.
  Complete houses and shops, many tree types, water and floor autotiles, fences, statues and
  stalls, all in a bright 16-bit style that matches the owner's references. Copy only the sprites
  the site uses into `src/assets/experience/` and credit them.
- **D4 ✅ (who walks):** little **characters carrying their skill** (a sign or banner with the skill
  name) walk from the buildings, house to house, to the airport and board.
- **D5 ✅ (space):** **`@react-three/fiber` + `@react-three/drei`**: `<Stars>`, 3D planets, and the map
  canvas wrapped onto a sphere for a true mini planet. Lazy-load the 3D chunk only when the visitor
  nears the end of the journey, and provide a reduced-motion / no-WebGL fallback.
