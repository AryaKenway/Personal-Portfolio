import HTMLFlipBook from 'react-pageflip';
import { forwardRef, useEffect, useRef, useState } from 'react';
import { projects } from '../data/portfolio.js';
import ProjectCard from './ProjectCard.jsx';

const CoverPage = forwardRef(function CoverPage({ isBack = false }, ref) {
    return <div className={`project-flip-page project-cover ${isBack ? 'project-cover-back' : 'project-cover-front'}`} ref={ref}>
        <div className="project-cover-content">
            <span className="project-cover-label">{isBack ? 'THE END' : 'PORTFOLIO • SELECTED WORKS'}</span>
            <h3>{isBack ? 'Thanks for reading.' : 'Project Showcase'}</h3>
            <span className="project-cover-author">{isBack ? 'Arya Acharya' : 'Arya Acharya · 2026'}</span>
        </div>
    </div>;
});

const ProjectPage = forwardRef(function ProjectPage({ project, number }, ref) {
    return <div className="project-flip-page" ref={ref}>
        <ProjectCard {...project} />
        <span className="project-page-number">{String(number).padStart(2, '0')}</span>
    </div>;
});

export default function ProjectsSection() {
    const bookRef = useRef(null);
    const [projectIndex, setProjectIndex] = useState(0);
    const [isFlipping, setIsFlipping] = useState(false);
    const [isPortrait, setIsPortrait] = useState(false);
    const [flippingTime, setFlippingTime] = useState(850);
    const backCoverIndex = projects.length + 1;

    useEffect(() => {
        const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
        const updateFlippingTime = () => setFlippingTime(motionPreference.matches ? 1 : 850);
        updateFlippingTime();
        motionPreference.addEventListener('change', updateFlippingTime);
        return () => motionPreference.removeEventListener('change', updateFlippingTime);
    }, []);

    const handleFlip = (event) => setProjectIndex(event.data);
    const handleFlipState = (event) => setIsFlipping(event.data === 'flipping');
    const handleInit = (event) => {
        setProjectIndex(event.data.page);
        setIsPortrait(event.data.mode === 'portrait');
    };
    const handleOrientationChange = (event) => setIsPortrait(event.data === 'portrait');
    const turnPage = (direction) => {
        const pageFlip = bookRef.current?.pageFlip();
        if (!pageFlip || isFlipping) return;
        if (direction === 'next') pageFlip.flipNext();
        else pageFlip.flipPrev();
    };
    const getPageLabel = () => {
        if (projectIndex === 0) return 'Front cover';
        if (projectIndex >= backCoverIndex) return 'Back cover';
        if (isPortrait) return `Project ${projectIndex} of ${projects.length}`;
        return `Projects ${projectIndex}–${Math.min(projectIndex + 1, projects.length)}`;
    };

    return <section className="mt-10">
        <h2 className="section-title">Project Showcase</h2>
        <div className="project-book" aria-label={`Project book: ${getPageLabel()}`}>
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
                onFlip={handleFlip}
                onChangeState={handleFlipState}
                onInit={handleInit}
                onChangeOrientation={handleOrientationChange}
            >
                <CoverPage key="front-cover" />
                {projects.map((project, index) => <ProjectPage key={project.title} project={project} number={index + 1} />)}
                <CoverPage key="back-cover" isBack />
            </HTMLFlipBook>
        </div>
        <nav className="project-book-controls" aria-label="Project book pages">
            <button type="button" className="project-book-button" onClick={() => turnPage('previous')} disabled={projectIndex === 0 || isFlipping} aria-label="Previous page">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
            </button>
            <span className="project-book-count" aria-live="polite">{getPageLabel()}</span>
            <button type="button" className="project-book-button" onClick={() => turnPage('next')} disabled={projectIndex >= backCoverIndex || isFlipping} aria-label="Next page">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18-6-6 6-6" /></svg>
            </button>
        </nav>
    </section>;
}
