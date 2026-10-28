import HTMLFlipBook from 'react-pageflip';
import { forwardRef, useEffect, useRef, useState } from 'react';
import { projects } from '../data/portfolio.js';
import ProjectCard from './ProjectCard.jsx';
import ProjectPopup from './ProjectPopup.jsx';
// Imported (not referenced by a string path) so Vite emits it with the GitHub Pages base prefix.
import pageFlipSound from '../assets/projects/page-flip.mp3';

// page-flip.mp3 opens with ~0.8s of silence; skip it so the rustle lands with the flip. Update if the file changes.
const PAGE_TURN_SOUND_START = 0.75;
const PAGE_TURN_VOLUME = 0.3;
// A page let go before it turns cuts its sound off with this short fade, not a hard click.
const PAGE_TURN_FADE_MS = 120;
// Holding a page plays only this share of the rustle; letting go plays the rest.
const PAGE_TURN_HOLD_SHARE = 3 / 8;

// Rewinds rather than overlapping, so quick successive flips never stack up.
function playPageTurn(audio) {
    if (!audio) return;
    cancelAnimationFrame(audio.fadeFrame);
    clearTimeout(audio.holdTimer);
    audio.volume = PAGE_TURN_VOLUME;
    audio.currentTime = PAGE_TURN_SOUND_START;
    audio.play().catch(() => {});
}

// Call right after playPageTurn: pauses once the held share has played.
function holdPageTurn(audio) {
    if (!audio) return;
    const length = audio.duration - PAGE_TURN_SOUND_START;
    if (!Number.isFinite(length)) return;
    audio.holdTimer = setTimeout(() => audio.pause(), length * PAGE_TURN_HOLD_SHARE * 1000);
}

// Plays the rest of a held sound (or lets it run on, if the hold hadn't been reached yet).
function releasePageTurn(audio) {
    if (!audio) return;
    clearTimeout(audio.holdTimer);
    if (audio.paused && !audio.ended) audio.play().catch(() => {});
}

function stopPageTurn(audio) {
    if (!audio) return;
    clearTimeout(audio.holdTimer);
    if (audio.paused) return;
    const start = performance.now();
    const fade = (now) => {
        const progress = Math.min((now - start) / PAGE_TURN_FADE_MS, 1);
        audio.volume = PAGE_TURN_VOLUME * (1 - progress);
        if (progress < 1) {
            audio.fadeFrame = requestAnimationFrame(fade);
            return;
        }
        audio.pause();
        audio.volume = PAGE_TURN_VOLUME;
    };
    cancelAnimationFrame(audio.fadeFrame);
    audio.fadeFrame = requestAnimationFrame(fade);
}

const CoverPage = forwardRef(function CoverPage({ isBack = false }, ref) {
    return <div className={`project-flip-page project-cover ${isBack ? 'project-cover-back' : 'project-cover-front'}`} ref={ref}>
        <div className="project-cover-content">
            <h3>{isBack ? 'Thanks for reading.' : 'Project Showcases'}</h3>
        </div>
    </div>;
});

// Two corner arrows pointing outward (lucide "maximize-2").
const EXPAND_ICON = 'M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7';

// Clicking anywhere on the page opens its details; the button is the visible, keyboard-reachable way in.
const ProjectPage = forwardRef(function ProjectPage({ project, number, onPointerDown, onOpen }, ref) {
    return <div
        className="project-flip-page"
        ref={ref}
        onPointerDown={onPointerDown}
        onClick={(event) => {
            if (event.target.closest('a, button')) return;
            onOpen(event.currentTarget, event);
        }}
    >
        <ProjectCard {...project} />
        {/* A chip on the picture: the whole page opens, not just the button. */}
        <span className="project-page-hint" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d={EXPAND_ICON} /></svg>
        </span>
        <button
            type="button"
            className="project-page-details"
            onClick={(event) => onOpen(event.currentTarget.closest('.project-flip-page'))}
            aria-label={`Open full details for ${project.title}`}
        >
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d={EXPAND_ICON} /></svg>
            Open full view
        </button>
        <span className="project-page-number">{String(number).padStart(2, '0')}</span>
    </div>;
});

// A press that travels further than this is a page drag, not a click.
const CLICK_SLOP = 6;

export default function ProjectsSection() {
    const bookRef = useRef(null);
    const pageIndexRef = useRef(0);
    const isPortraitRef = useRef(false);
    const flippingTimeRef = useRef(850);
    const pendingSlideRef = useRef(false);
    const [projectIndex, setProjectIndex] = useState(0);
    const [bookPositionIndex, setBookPositionIndex] = useState(0);
    const [isFlipping, setIsFlipping] = useState(false);
    const [isSliding, setIsSliding] = useState(false);
    const [isPortrait, setIsPortrait] = useState(false);
    const [flippingTime, setFlippingTime] = useState(850);
    const [openPage, setOpenPage] = useState(null);
    const pointerStartRef = useRef(null);
    const isFlippingRef = useRef(false);
    const isPageMovingRef = useRef(false);
    const isPageHeldRef = useRef(false);
    // Whether the page in motion actually turned (a drag can be let go and fall back).
    const didTurnRef = useRef(false);
    const pageTurnAudioRef = useRef(null);
    const backCoverIndex = projects.length + 1;

    useEffect(() => {
        const audio = new Audio(pageFlipSound);
        audio.preload = 'auto';
        audio.volume = PAGE_TURN_VOLUME;
        pageTurnAudioRef.current = audio;
        return () => {
            cancelAnimationFrame(audio.fadeFrame);
            clearTimeout(audio.holdTimer);
            audio.pause();
            pageTurnAudioRef.current = null;
        };
    }, []);

    // A dragged page stays 'user_fold' after it's let go (it never reports 'flipping'), so the
    // release is caught here, as the library itself does, from the pointer coming up anywhere.
    useEffect(() => {
        const handleRelease = () => {
            if (!isPageHeldRef.current) return;
            isPageHeldRef.current = false;
            releasePageTurn(pageTurnAudioRef.current);
        };
        window.addEventListener('pointerup', handleRelease);
        window.addEventListener('pointercancel', handleRelease);
        return () => {
            window.removeEventListener('pointerup', handleRelease);
            window.removeEventListener('pointercancel', handleRelease);
        };
    }, []);

    useEffect(() => {
        const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
        const updateFlippingTime = () => {
            const time = motionPreference.matches ? 1 : 850;
            flippingTimeRef.current = time;
            setFlippingTime(time);
        };
        updateFlippingTime();
        motionPreference.addEventListener('change', updateFlippingTime);
        return () => motionPreference.removeEventListener('change', updateFlippingTime);
    }, []);

    const handleFlip = (event) => {
        const previousPage = pageIndexRef.current;
        const currentPage = event.data;
        const wasOnCover = previousPage === 0 || previousPage >= backCoverIndex;
        const isOnCover = currentPage === 0 || currentPage >= backCoverIndex;
        pageIndexRef.current = currentPage;
        didTurnRef.current = true;
        setProjectIndex(event.data);
        if (wasOnCover === isOnCover) return;
        if (isPortraitRef.current || flippingTimeRef.current === 1) {
            setBookPositionIndex(currentPage);
            requestAnimationFrame(() => bookRef.current?.pageFlip()?.update());
            return;
        }
        pendingSlideRef.current = true;
    };
    const handleFlipState = (event) => {
        const isCurrentlyFlipping = event.data === 'flipping';
        // Buttons, corner clicks and swipes report 'flipping'; dragging a page reports 'user_fold' and never 'flipping'.
        const isHeld = event.data === 'user_fold';
        const isPageMoving = isCurrentlyFlipping || isHeld;
        const audio = pageTurnAudioRef.current;
        if (isPageMoving && !isPageMovingRef.current) {
            didTurnRef.current = false;
            playPageTurn(audio);
            // A grabbed page plays part of the sound and waits; a button or corner click plays it all.
            if (isHeld) holdPageTurn(audio);
        }
        isPageHeldRef.current = isHeld;
        // A page dragged partway and let go falls back without turning, so its sound stops there.
        // Checked a frame later, in case the library reports 'read' before the flip itself.
        if (!isPageMoving && isPageMovingRef.current) {
            requestAnimationFrame(() => {
                if (!didTurnRef.current && !isPageMovingRef.current) stopPageTurn(audio);
            });
        }
        isPageMovingRef.current = isPageMoving;
        isFlippingRef.current = isCurrentlyFlipping;
        setIsFlipping(isCurrentlyFlipping);
        if (!isCurrentlyFlipping && pendingSlideRef.current) {
            pendingSlideRef.current = false;
            setBookPositionIndex(pageIndexRef.current);
            setIsSliding(true);
        }
    };
    const handleInit = (event) => {
        // In one-page (portrait) mode the library turns back by "clicking" a point that isn't on a
        // page corner, so `disableFlipByClick` makes it ignore its own request: the Previous button
        // and a swipe right both did nothing. Lift the setting just for that call.
        const pageFlip = bookRef.current?.pageFlip();
        if (pageFlip && !pageFlip.flipPrevPatched) {
            const flipPrev = pageFlip.flipPrev.bind(pageFlip);
            const settings = pageFlip.getSettings();
            pageFlip.flipPrev = (...args) => {
                const disableFlipByClick = settings.disableFlipByClick;
                settings.disableFlipByClick = false;
                try {
                    flipPrev(...args);
                } finally {
                    settings.disableFlipByClick = disableFlipByClick;
                }
            };
            pageFlip.flipPrevPatched = true;
        }
        pageIndexRef.current = event.data.page;
        isPortraitRef.current = event.data.mode === 'portrait';
        setProjectIndex(event.data.page);
        setBookPositionIndex(event.data.page);
        setIsPortrait(isPortraitRef.current);
    };
    const handleOrientationChange = (event) => {
        isPortraitRef.current = event.data === 'portrait';
        setIsPortrait(isPortraitRef.current);
    };
    const handleBookPositionChange = (event) => {
        if (event.target !== event.currentTarget || event.propertyName !== 'transform') return;
        bookRef.current?.pageFlip()?.update();
        setIsSliding(false);
    };
    const turnPage = (direction) => {
        const pageFlip = bookRef.current?.pageFlip();
        if (!pageFlip || isFlipping || isSliding) return;
        if (direction === 'next') pageFlip.flipNext();
        else pageFlip.flipPrev();
    };
    const handlePagePointerDown = (event) => {
        pointerStartRef.current = { x: event.clientX, y: event.clientY };
    };
    // `pageClick` is only passed for clicks on the page itself, which may be the end of a drag or a corner flip.
    const openProject = (project, number) => (pageElement, pageClick) => {
        if (openPage || isSliding || isFlippingRef.current) return;
        if (pageClick) {
            const start = pointerStartRef.current;
            const wasDrag = start && Math.hypot(pageClick.clientX - start.x, pageClick.clientY - start.y) > CLICK_SLOP;
            // Corner clicks and drags still turn the page; only a plain click on a resting book opens it.
            if (wasDrag || bookRef.current?.pageFlip()?.getState() !== 'read') return;
        }
        pageElement.classList.add('project-flip-page--lifted');
        setOpenPage({ project, number, pageElement, returnFocus: pageClick ? null : document.activeElement });
    };
    const closeProject = () => {
        openPage.pageElement.classList.remove('project-flip-page--lifted');
        openPage.returnFocus?.focus({ preventScroll: true });
        setOpenPage(null);
    };
    return <section aria-label="Project showcases">
        <div
            className={`project-book ${!isPortrait && bookPositionIndex === 0 ? 'project-book--front-cover' : ''} ${!isPortrait && bookPositionIndex >= backCoverIndex ? 'project-book--back-cover' : ''} ${isSliding ? 'project-book--sliding' : ''}`}
            aria-label="Project book"
            aria-busy={isSliding}
            onTransitionEnd={handleBookPositionChange}
            onTransitionCancel={handleBookPositionChange}
        >
            <HTMLFlipBook
                ref={bookRef}
                className="project-flipbook"
                width={400}
                height={520}
                size="stretch"
                minWidth={280}
                maxWidth={420}
                minHeight={360}
                maxHeight={560}
                flippingTime={flippingTime}
                usePortrait
                showCover
                drawShadow
                maxShadowOpacity={0.35}
                swipeDistance={30}
                clickEventForward
                disableFlipByClick
                onFlip={handleFlip}
                onChangeState={handleFlipState}
                onInit={handleInit}
                onChangeOrientation={handleOrientationChange}
            >
                <CoverPage key="front-cover" />
                {projects.map((project, index) => <ProjectPage key={project.title} project={project} number={index + 1} onPointerDown={handlePagePointerDown} onOpen={openProject(project, index + 1)} />)}
                <CoverPage key="back-cover" isBack />
            </HTMLFlipBook>
        </div>
        <nav className="project-book-controls" aria-label="Project book pages">
            <button type="button" className="project-book-button" onClick={() => turnPage('previous')} disabled={projectIndex === 0 || isFlipping || isSliding} aria-label="Previous page">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
            </button>
            <button type="button" className="project-book-button" onClick={() => turnPage('next')} disabled={projectIndex >= backCoverIndex || isFlipping || isSliding} aria-label="Next page">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
            </button>
        </nav>
        {openPage && <ProjectPopup
            project={openPage.project}
            number={openPage.number}
            sourceElement={openPage.pageElement}
            onClosed={closeProject}
        />}
    </section>;
}
