/**
 * @file TerminalAnimation.jsx
 * @description Composable animated terminal with one tab per scenario: the
 * prompt types the tab's command, then its output lines appear one by one.
 * Adapted from Cult UI Terminal Animation (MIT, © Nolly Studio,
 * https://github.com/nolly-studio/cult-ui), ported to plain JSX + CSS Modules
 * without its Radix dependencies.
 *
 * Changes from Cult UI: nothing plays until the window is on screen, then the
 * tabs autoplay once in order (a click stops that); the animation pauses while
 * the window is off screen; clicking the active tab replays it; and reduced
 * motion shows each tab complete.
 */

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../experience/useReducedMotion.js';
import { createPausableTimer } from './pausableTimer.js';
import styles from './TerminalAnimation.module.css';

/** Typing and pacing (ms), as in Cult UI. */
const START_DELAY = 300;
const TYPE_MIN = 25;
const TYPE_JITTER = 35;
const AFTER_COMMAND = 250;
/** Autoplay: how long a finished tab stays up before the next one starts. */
const NEXT_TAB_DELAY = 1200;
/** Share of the window that must be visible before it slides in and starts. */
const ENTER_RATIO = 0.25;

const TerminalAnimationContext = createContext(null);

function useTerminalAnimationContext() {
    const context = useContext(TerminalAnimationContext);
    if (!context) throw new Error('TerminalAnimation parts must be used within TerminalAnimationRoot');
    return context;
}

/**
 * Holds the active tab and runs its animation as one chain of timeouts: type
 * the command, pause, reveal each line after its `delay`, then (while
 * autoplaying) move on to the next tab.
 * @param {Object} props
 * @param {readonly { id: string, command: string, lines: { delay?: number }[] }[]} props.tabs
 * @param {number} [props.defaultActiveTab]
 * @param {string} [props.className]
 * @param {import('react').ReactNode} props.children
 */
export function TerminalAnimationRoot({ tabs, defaultActiveTab = 0, className = '', children }) {
    const reducedMotion = useReducedMotion();
    const [activeTab, setActiveTab] = useState(defaultActiveTab);
    // Bumped on every tab change, so clicking the active tab replays it.
    const [runId, setRunId] = useState(0);
    // A ref, not state: stopping autoplay must not restart the tab that is playing.
    const autoplayRef = useRef(true);
    const [hasEntered, setHasEntered] = useState(false);
    const [isOnScreen, setIsOnScreen] = useState(false);
    const [commandTyped, setCommandTyped] = useState('');
    const [isTypingCommand, setIsTypingCommand] = useState(true);
    const [visibleLines, setVisibleLines] = useState(0);
    const timerRef = useRef(null);
    timerRef.current ??= createPausableTimer();

    const currentTab = tabs[activeTab] ?? tabs[0];

    const playTab = useCallback((index) => {
        setActiveTab(index);
        setRunId((id) => id + 1);
    }, []);

    /** A visitor picked a tab: play it, and stop autoplay for good. */
    const selectTab = useCallback((index) => {
        autoplayRef.current = false;
        playTab(index);
    }, [playTab]);

    // Focus inside the terminal (keyboard or screen reader) also stops autoplay, so the selected
    // tab never changes under the visitor. The playing tab finishes normally.
    const stopAutoplay = () => { autoplayRef.current = false; };

    const markEntered = useCallback(() => setHasEntered(true), []);

    useEffect(() => {
        const timer = timerRef.current;
        const { command, lines } = currentTab;

        timer.clear();
        if (reducedMotion) {
            setCommandTyped(command);
            setIsTypingCommand(false);
            setVisibleLines(lines.length);
            return timer.clear;
        }

        setCommandTyped('');
        setIsTypingCommand(true);
        setVisibleLines(0);
        if (!hasEntered) return timer.clear;

        const showLines = (count) => {
            setVisibleLines(count);
            if (count < lines.length) {
                timer.later(() => showLines(count + 1), lines[count].delay ?? 100);
            } else if (autoplayRef.current && activeTab < tabs.length - 1) {
                timer.later(() => playTab(activeTab + 1), NEXT_TAB_DELAY);
            }
        };
        const typeCommand = (length) => {
            setCommandTyped(command.slice(0, length));
            if (length < command.length) {
                timer.later(() => typeCommand(length + 1), TYPE_MIN + Math.random() * TYPE_JITTER);
            } else {
                timer.later(() => {
                    setIsTypingCommand(false);
                    showLines(0);
                }, AFTER_COMMAND);
            }
        };
        timer.later(() => typeCommand(0), START_DELAY);
        return timer.clear;
    }, [tabs, activeTab, currentTab, runId, hasEntered, reducedMotion, playTab]);

    // Freeze mid-step while the window is off screen or the browser tab is hidden, then carry on.
    useEffect(() => {
        const timer = timerRef.current;
        const update = () => (isOnScreen && !document.hidden ? timer.resume() : timer.pause());
        update();
        document.addEventListener('visibilitychange', update);
        return () => document.removeEventListener('visibilitychange', update);
    }, [isOnScreen]);

    const value = {
        tabs,
        activeTab,
        selectTab,
        currentTab,
        commandTyped,
        isTypingCommand,
        visibleLines,
        reducedMotion,
        markEntered,
        setIsOnScreen
    };

    return <TerminalAnimationContext.Provider value={value}>
        <div className={`${styles.root} ${className}`} onFocus={stopAutoplay}>{children}</div>
    </TerminalAnimationContext.Provider>;
}

/**
 * Window chrome: three dots and a title, then the window body. Slides up the
 * first time it scrolls into view, and that is also when the animation starts.
 * Keeps reporting whether it is on screen, so the animation can pause.
 */
export function TerminalAnimationWindow({ title, children }) {
    const { markEntered, setIsOnScreen, reducedMotion } = useTerminalAnimationContext();
    const windowRef = useRef(null);
    const [hasEntered, setHasEntered] = useState(false);

    useEffect(() => {
        const element = windowRef.current;
        if (!element) return undefined;
        const observer = new IntersectionObserver(([entry]) => {
            if (!entry) return;
            setIsOnScreen(entry.isIntersecting);
            if (entry.intersectionRatio >= ENTER_RATIO) {
                setHasEntered(true);
                markEntered();
            }
        }, { threshold: [0, ENTER_RATIO] });
        observer.observe(element);
        return () => observer.disconnect();
    }, [markEntered, setIsOnScreen]);

    const slideClass = reducedMotion ? '' : hasEntered ? styles.windowEntered : styles.windowWaiting;

    return <div ref={windowRef} className={`${styles.window} ${slideClass}`}>
        <div className={styles.titleBar}>
            <span className={styles.dots} aria-hidden="true"><span /><span /><span /></span>
            <span className={styles.title} aria-hidden="true">{title}</span>
        </div>
        {children}
    </div>;
}

/**
 * Tabs follow the WAI-ARIA tabs pattern: arrow keys, Home and End move between them.
 * When the row overflows (phones), it scrolls sideways to keep the active tab in view.
 */
export function TerminalAnimationTabList({ label, children }) {
    const { tabs, activeTab, selectTab, reducedMotion } = useTerminalAnimationContext();
    const listRef = useRef(null);

    useEffect(() => {
        const list = listRef.current;
        const tab = list?.querySelectorAll('[role="tab"]')[activeTab];
        if (!tab || list.scrollWidth <= list.clientWidth) return;
        // Scroll the row itself, never the page.
        list.scrollTo({
            left: tab.offsetLeft - (list.clientWidth - tab.offsetWidth) / 2,
            behavior: reducedMotion ? 'auto' : 'smooth'
        });
    }, [activeTab, reducedMotion]);

    const handleKeyDown = (event) => {
        const moves = { ArrowRight: 1, ArrowLeft: -1, Home: -activeTab, End: tabs.length - 1 - activeTab };
        if (!(event.key in moves)) return;
        event.preventDefault();
        const next = (activeTab + moves[event.key] + tabs.length) % tabs.length;
        selectTab(next);
        listRef.current?.querySelectorAll('[role="tab"]')[next]?.focus();
    };

    return <div ref={listRef} className={styles.tabList} role="tablist" aria-label={label} onKeyDown={handleKeyDown}>
        {children}
    </div>;
}

/** @param {{ index: number, children: import('react').ReactNode }} props */
export function TerminalAnimationTabTrigger({ index, children }) {
    const { tabs, activeTab, selectTab } = useTerminalAnimationContext();
    const isActive = index === activeTab;

    return <button
        type="button"
        role="tab"
        id={`terminal-tab-${tabs[index].id}`}
        aria-selected={isActive}
        aria-controls={`terminal-panel-${tabs[index].id}`}
        tabIndex={isActive ? 0 : -1}
        className={styles.tab}
        onClick={() => selectTab(index)}
    >
        {children}
    </button>;
}

/** Blinking block cursor. */
export function TerminalAnimationBlinkingCursor() {
    return <span className={styles.cursor} aria-hidden="true" />;
}

/** The prompt line: the command as typed so far, with the cursor while typing. */
export function TerminalAnimationCommandBar() {
    const { commandTyped, isTypingCommand } = useTerminalAnimationContext();

    return <div className={styles.commandBar} aria-hidden="true">
        <span className={styles.prompt}>$</span>
        <span>
            {commandTyped}
            {isTypingCommand && <TerminalAnimationBlinkingCursor />}
        </span>
    </div>;
}

/**
 * Output area. Every tab's panel is stacked in one grid cell (inactive ones
 * hidden), so the window is always as tall as the largest output and never jumps.
 * @param {{ renderPanel: (tab: Object, visibleLines: number) => import('react').ReactNode }} props
 */
export function TerminalAnimationOutput({ renderPanel }) {
    const { tabs, activeTab, isTypingCommand, visibleLines } = useTerminalAnimationContext();

    return <div className={styles.output}>
        {tabs.map((tab, index) => {
            const isActive = index === activeTab;
            return <div
                key={tab.id}
                role="tabpanel"
                id={`terminal-panel-${tab.id}`}
                aria-labelledby={`terminal-tab-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                className={`${styles.panel} ${isActive ? styles.panelActive : ''}`}
            >
                {renderPanel(tab, isActive && isTypingCommand ? 0 : isActive ? visibleLines : tab.lines.length)}
            </div>;
        })}
    </div>;
}

/**
 * One output line. Hidden lines keep their space, so nothing shifts as they appear.
 * @param {{ visible: boolean, as?: string, className?: string, children: import('react').ReactNode }} props
 */
export function TerminalAnimationOutputLine({ visible, as: Tag = 'div', className = '', children }) {
    return <Tag className={`${styles.line} ${visible ? styles.lineVisible : ''} ${className}`}>{children}</Tag>;
}

/** The terminal body: prompt, then output. */
export function TerminalAnimationContent({ children }) {
    return <div className={styles.content}>{children}</div>;
}
