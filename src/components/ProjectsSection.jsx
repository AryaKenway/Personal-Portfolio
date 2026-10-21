import HTMLFlipBook from 'react-pageflip';
import { forwardRef, useEffect, useRef, useState } from 'react';
import { projects } from '../data/portfolio.js';
import ProjectCard from './ProjectCard.jsx';
import ProjectPopup from './ProjectPopup.jsx';
// Imported (not referenced by a string path) so Vite emits it with the GitHub Pages base prefix.
import pageFlipSound from '../assets/projects/page-flip.mp3';

// page-flip.mp3 opens with ~0.8s of silence; skip it so the rustle lands with the flip. Update if the file changes.
const PAGE_TURN_SOUND_START = 0.75;

// Rewinds rather than overlapping, so quick successive flips never stack up.
function playPageTurn(audio) {
    if (!audio) return;
    audio.currentTime = PAGE_TURN_SOUND_START;
    audio.play().catch(() => {});
}

const CoverPage = forwardRef(function CoverPage({ isBack = false }, ref) {
    return <div className={`project-flip-page project-cover ${isBack ? 'project-cover-back' : 'project-cover-front'}`} ref={ref}>
        <div className="project-cover-content">
            <span className="project-cover-label">{isBack ? 'THE END' : 'PORTFOLIO • SELECTED WORKS'}</span>
            <h3>{isBack ? 'Thanks for reading.' : 'Project Showcase'}</h3>
            <span className="project-cover-author">{isBack ? 'Arya Acharya' : 'Arya Acharya · 2026'}</span>
        </div>
    </div>;
});

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
        <button
            type="button"
            className="project-page-details"
            onClick={(event) => onOpen(event.currentTarget.closest('.project-flip-page'))}
            aria-label={`View details for ${project.title}`}
        >
            View details
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" /></svg>
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
    const pageTurnAudioRef = useRef(null);
    const backCoverIndex = projects.length + 1;

    useEffect(() => {
        const audio = new Audio(pageFlipSound);
        audio.preload = 'auto';
        audio.volume = 0.6;
        pageTurnAudioRef.current = audio;
        return () => {
            audio.pause();
            pageTurnAudioRef.current = null;
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
        const isPageMoving = isCurrentlyFlipping || event.data === 'user_fold';
        if (isPageMoving && !isPageMovingRef.current) playPageTurn(pageTurnAudioRef.current);
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
    return <section aria-label="Project showcase">
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
