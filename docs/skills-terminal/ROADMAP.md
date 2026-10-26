# Skills Section — "Terminal Reveal" Roadmap

> **Superseded (owner, 2026-10-26):** the Skills section is now a 360° studio tour, not a terminal.
> `SkillsSection.jsx` renders `skills/SkillsTour.jsx`: the Poly Haven Studio panorama (CC0) on a skydome
> (`PanoramaScene.jsx`, three.js, lazy-loaded), glass tabs, drag to look around, and a one-pass autoplay
> on first view. Each skill group is painted onto one of the room's monitors (`screenTexture.js`), on a
> flat quad fitted to that screen's corners in the photo (`SCREEN_CORNERS` in `tourGeometry.js`, measured
> on the 4096 px image); choosing a group turns and zooms onto its screen. The glass skills card is only
> shown until the 3D scene is up or without WebGL; after that it's kept for screen readers only. The hard rules
> below ("terminal only", the npm command, no flying elements) no longer apply; data still comes from
> `skillGroups` only, and the section must still be accessible, never hijack scrolling, and work on
> GitHub Pages at every size. The terminal files (`TerminalAnimation.*`, `SkillsTerminal.*`,
> `skillTabs.js`, `pausableTimer.js`) are kept but unused, in case the owner wants it back.

The Skills section (between About and Experience) is an animated terminal modelled on Cult UI's
[Terminal Animation](https://www.cult-ui.com/docs/components/terminal-animation):

- the heading "Skills" sits above the terminal at every screen size
- a dark terminal window that slides up when it scrolls into view
- a row of tabs, one per skill group (`proficiencies`, `languages`, `tools`, `design`, `devops`)
- in each tab, a `$` prompt types `npm install @arya/<group>` with a block cursor, then the group's
  skills print in a clean, column-aligned list, followed by a summary line (`✓ added 6 packages`)
- **autoplay:** when the visitor scrolls to the section, the tabs play through all five groups once

Work **one phase at a time**, and only when the owner asks for that phase. When a phase is done,
run `npm run build`, check the section in the browser at desktop, tablet and ~375px phone
widths, tick its checklist here, and stop.

---

## 1. Hard rules (from the owner)

1. **Terminal only.** No chips, no separate skills grid, no flying elements. The terminal output *is*
   the skills list.
2. **Command:** `npm install @arya/<group>`.
3. **Always dark** (good contrast with the light paper page), whatever the site theme.
4. **Every group fits on one screen.** No scrolling inside the terminal and no cut-off lines at any
   size: skills flow into columns, and the window keeps one fixed height (the tallest group) so it
   never jumps between tabs.
5. **Autoplay through all groups** once when the section scrolls into view. Clicking a tab plays that group.
6. **Port Cult UI's component; don't install it.** Its source is shadcn/TypeScript/Tailwind with Radix
   dependencies. Rewrite it as plain JSX + CSS Modules with the same parts and timing model.
7. **No icon libraries.** Text glyphs only (`$`, `▌`, `+`, `✓`); the window dots are plain CSS circles.
8. **Accessible as real content.** Tabs are a real `tablist`, and each panel holds a real `<ul>` of skills.
   The typing and decorative glyphs are `aria-hidden`.
9. **Never blocks.** Don't pin the section or hijack scrolling.
10. **Data comes from `skillGroups` in `src/data/portfolio.js` only.**
11. **It must work on GitHub Pages and on every screen size** (base path `/Personal-Portfolio/`,
    test widths 360, 390, 768, 1024, 1440, 1920 and phone landscape).

## 2. Libraries

**No new packages.** The terminal is plain React (state, timers, IntersectionObserver) and CSS Modules.
Not used: `@radix-ui/*`, shadcn, `lucide-react`, GSAP.
Font: a system monospace stack, the `--mono` token in `styles.css`.

Credit: Cult UI is MIT-licensed (© Nolly Studio, github.com/nolly-studio/cult-ui; confirmed). The
header comment in `TerminalAnimation.jsx` says "Adapted from Cult UI Terminal Animation (MIT, © Nolly Studio)".

## 3. File architecture

```
src/
  components/
    SkillsSection.jsx              # Section shell + heading; renders SkillsTerminal
    skills/
      TerminalAnimation.jsx        # Port of Cult UI: Root (context), Window, TabList, TabTrigger,
                                   #   CommandBar, BlinkingCursor (Phase 2), Panel
      TerminalAnimation.module.css # Window chrome, tabs, prompt, cursor, dark colour tokens
      SkillsTerminal.jsx           # Composes the terminal from skillTabs; renders each group's output
      SkillsTerminal.module.css    # Column-aligned skill list + summary line
      skillTabs.js                 # Pure: skillGroups -> tabs [{ id, label, command, skills, summary }]
```

## 4. Phases

### Phase 0: Plan ✅
- [x] Roadmap (this file), following Cult UI's Terminal Animation
- [x] Owner decisions: `npm install @arya/<group>`, always dark, terminal only (no chips or grid),
      every group fits on one screen, autoplay through all groups on scroll into view

### Phase 1: Static terminal ✅
- [x] Data: each group has an `id` (the tab label and package name). `SQL` was in both Proficiencies and
      Programming Languages; it is kept in Programming Languages only.
- [x] `skillTabs.js`: groups → tabs with the command, skills and a summary line
- [x] `TerminalAnimation.jsx`: static parts of the port (Root with tab state, Window, TabList, TabTrigger,
      CommandBar, Panel). The tabs already switch instantly.
- [x] `SkillsTerminal.jsx`: each group prints as `+ skill` in auto-fitting columns, then `✓ added N <group>`
- [x] Fixed height: every panel is stacked in the same grid cell (inactive ones hidden), so the window is
      always as tall as the largest group and never jumps
- [x] The old `.skill-*` styles were removed from `styles.css`; `--mono` was added
- [x] Fit on one screen (tallest group, proficiencies, measured under `vite preview`):
  - desktop ≥ 1024px: heading left, terminal right, 2 columns, 450px tall
  - below 1024px: heading stacks above the terminal (`.skills-section`), so the terminal gets the full width
  - phones (< 608px): always 2 columns, long names wrap under their own `+`, and the tabs are one swipeable
    row (no second row). 470px at 360×640, 560px at 320×568.
  - short screens (< 480px tall): tighter chrome and narrower columns. 300px at 844×390, 355px at 667×375.
  - no horizontal page scroll at any size
- [x] Build passes. Checked at 1920×1080, 1440×900, 1024×768, 768×1024, 844×390, 667×375, 430×932,
      390×844, 360×640 and 320×568.

### Phase 2: Port the animation ✅
- [x] Root timers, as in Cult UI: a 300 ms start delay, typing at 25–60 ms per character, a 250 ms pause,
      then each output line after its own `delay` (`skillTabs.js`: 120 ms for the first skill, 70 ms per
      skill, 320 ms before the summary). Proficiencies takes about 3.4 s; tools about 2.2 s.
- [x] Blinking block cursor (CSS `steps(1)` blink) while the command types; it goes away when typing
      ends, as in Cult UI. (There's no trailing prompt, so no "hide 600 ms after the last line".)
- [x] Window slides up and fades in on first view (25% visible, `cubic-bezier(0.16, 1, 0.3, 1)`, 1 s).
      The offset is 4rem rather than Cult UI's 16rem, so it never paints over the Projects section.
- [x] Nothing types until the window is on screen (Cult UI starts on mount, so it would finish unseen)
- [x] Clicking a tab, including the active one, replays that group. Arrow keys, Home and End move and replay.
- [x] Hidden lines keep their space (opacity, not visibility), so nothing shifts and the window keeps its
      450px height (1440×900) through every state
- [x] Reduced motion (brought forward from Phase 4): each tab shows its full output at once, with no slide
      and no blink
- [x] Tested under `vite preview` (CDP-driven headless Edge): idle before scroll, typing progress over time,
      line reveal, completion, tab switch, re-click restart, ArrowRight, and reduced motion at 390×844

### Phase 3: Autoplay ✅
- [x] Starts when a quarter of the window is on screen (not on page load). Verified after the Experience
      wheel-skip (wheel outside the pinned map → glides to Skills → types) and on a `…/#skills` load.
- [x] After a group's summary line plus 1.2 s (`NEXT_TAB_DELAY`), the next tab plays. Runs once through all
      five (≈ 19.5 s in total; tabs switch at ≈ 4.8, 8.5, 12.3 and 16.2 s) and stops on `soft-skills`.
- [x] Clicking a tab (or arrow keys) stops autoplay for good. Verified: clicking `platforms` mid-run stays
      on it.
- [x] Pauses while the window is fully off screen or the browser tab is hidden, and resumes mid-step when it
      returns (`pausableTimer.js`: the animation is one timeout chain, so pausing keeps the remaining time).
      Verified: frozen at the same character for 4 s while scrolled away, then carried on.
- [x] Phones: the swipeable tab row scrolls itself (never the page) to keep the playing tab in view
- Reduced motion: no autoplay. Each tab shows complete, and the visitor switches tabs.

### Phase 4: Responsive, a11y, Pages check ✅
- [x] Layout sweep, all five tabs at 15 sizes (320×568, 360×640, 375×667, 390×844, 412×915, 430×932,
      667×375, 844×390, 768×1024, 1024×768, 1280×720, 1366×768, 1440×900, 1920×1080, 2560×1440):
      every group fits the screen, the window height is identical across tabs at each size,
      0 clipped lines, and no horizontal page scroll
- [x] `prefers-reduced-motion`: no slide-up, typing, blink or autoplay; each tab shows complete (Phase 2)
- [x] Keyboard: Tab goes heading → active tab → active panel → out (roving tabindex). Focus rings are visible
      (amber on dark). Arrow keys, Home and End switch and replay.
- [x] Fixed: autoplay could change the selected tab under a keyboard or screen-reader user. Any focus inside
      the terminal now stops autoplay; the playing tab finishes normally (autoplay is a ref, so stopping it
      doesn't restart the current tab). Verified: focusing a tab during proficiencies, still there 16 s later.
- [x] Screen readers: a labelled `tablist`; each `tabpanel` is labelled by its tab and holds a labelled `<ul>`
      of real skills. Inactive panels are `visibility: hidden` (out of the a11y tree). The prompt, the window
      title, the `+`/`✓` glyphs and the summary are `aria-hidden`.
- [x] `npm run build` + `vite preview` under `/Personal-Portfolio/`: no console errors or exceptions. The only
      404 is the site-wide `/favicon.ico` (the site has no favicon). Layout shift inside `#skills` during
      scroll-in and two tabs: 0.00003 (negligible).
- [x] Regression (at the time, when Skills was below Experience): at 1440×900 the Experience wheel-skip (wheel outside the pinned map) lands on `#skills`, and
      the terminal starts. Phones are unchanged: the map fills the screen there, so the wheel scrubs the map.

## 5. Later changes (owner)

- **New skill data:** five groups, replacing the old list: Proficiencies (9), Languages & Frameworks (9),
  Tools (6), Design (3), DevOps (4). Removed: Developer Platforms and Soft Skills. Tab ids: `proficiencies`,
  `languages`, `tools`, `design`, `devops`. The summary line is now npm's own `✓ added N packages`.
- **Section order:** About → Skills → Experience → Selected work (page and nav). The Experience
  wheel-skip now leaves downward to Selected work (`#work`). Verified: it lands at `#work` top = 0.
- **Heading:** "Skills" (was "Skills & tools"), always above the terminal; the terminal takes the full
  width at every size.
- Re-swept all 15 sizes × 5 tabs: everything fits (217–382px tall), 0 clipped lines, no sideways scroll,
  keyboard and a11y checks unchanged, no console errors.
