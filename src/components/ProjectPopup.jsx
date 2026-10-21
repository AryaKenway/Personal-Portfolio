import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const ZOOM_TIME = 480;
const CONTENT_FADE_TIME = 180;
const ZOOM_EASING = 'cubic-bezier(0.22, 0.61, 0.36, 1)';
const MAX_PANEL_WIDTH = 980;
const MAX_PANEL_HEIGHT = 760;

function getPanelFrame() {
    const gutter = window.innerWidth < 640 ? 8 : 24;
    const width = Math.min(MAX_PANEL_WIDTH, window.innerWidth - gutter * 2);
    const height = Math.min(MAX_PANEL_HEIGHT, window.innerHeight - gutter * 2);
    return { left: (window.innerWidth - width) / 2, top: (window.innerHeight - height) / 2, width, height };
}

// The transform that squeezes the full panel back onto the page it came from.
function getPageTransform(sourceElement, frame) {
    const page = sourceElement.getBoundingClientRect();
    return `translate(${page.left - frame.left}px, ${page.top - frame.top}px) scale(${page.width / frame.width}, ${page.height / frame.height})`;
}

// The panel shell zooms between the book page and its full size; the details fade in once it has grown,
// so the non-uniform scale never distorts readable content.
export default function ProjectPopup({ project, number, sourceElement, onClosed }) {
    const titleId = useId();
    const backdropRef = useRef(null);
    const panelRef = useRef(null);
    const contentRef = useRef(null);
    const closeButtonRef = useRef(null);
    const isClosingRef = useRef(false);
    const [frame, setFrame] = useState(getPanelFrame);
    const zoomTime = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : ZOOM_TIME;
    const { title, description, image, href, details = {} } = project;
    const { category, role, timeline, overview = [], highlights = [], tech = [], demo } = details;

    useLayoutEffect(() => {
        const startFrame = getPanelFrame();
        panelRef.current.animate(
            [{ transform: getPageTransform(sourceElement, startFrame) }, { transform: 'none' }],
            { duration: zoomTime, easing: ZOOM_EASING },
        );
        contentRef.current.animate([{ opacity: 0 }, { opacity: 1 }], { duration: CONTENT_FADE_TIME, delay: zoomTime * 0.7, fill: 'backwards' });
        backdropRef.current.animate([{ opacity: 0 }, { opacity: 1 }], { duration: zoomTime, easing: 'ease-out' });
        closeButtonRef.current.focus({ preventScroll: true });
    }, []);

    const close = () => {
        if (isClosingRef.current) return;
        isClosingRef.current = true;
        const fadeTime = zoomTime === 1 ? 1 : CONTENT_FADE_TIME;
        contentRef.current.animate([{ opacity: 1 }, { opacity: 0 }], { duration: fadeTime, fill: 'forwards' });
        const shrink = panelRef.current.animate(
            [{ transform: 'none' }, { transform: getPageTransform(sourceElement, getPanelFrame()) }],
            { duration: zoomTime, delay: fadeTime * 0.6, easing: ZOOM_EASING, fill: 'forwards' },
        );
        backdropRef.current.animate([{ opacity: 1 }, { opacity: 0 }], { duration: zoomTime, delay: fadeTime * 0.6, easing: 'ease-in', fill: 'forwards' });
        shrink.onfinish = onClosed;
    };

    useEffect(() => {
        const backdrop = backdropRef.current;
        const root = document.documentElement;
        const previousOverflow = root.style.overflow;
        const blockScroll = (event) => event.preventDefault();
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') close();
        };
        const handleResize = () => setFrame(getPanelFrame());
        root.style.overflow = 'hidden';
        backdrop.addEventListener('wheel', blockScroll, { passive: false });
        backdrop.addEventListener('touchmove', blockScroll, { passive: false });
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('resize', handleResize);
        return () => {
            root.style.overflow = previousOverflow;
            backdrop.removeEventListener('wheel', blockScroll);
            backdrop.removeEventListener('touchmove', blockScroll);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return createPortal(<div className="project-popup" role="dialog" aria-modal="true" aria-labelledby={titleId} data-lenis-prevent>
        <div ref={backdropRef} className="project-popup-backdrop" onClick={close} />
        <div ref={panelRef} className="project-popup-panel" style={frame}>
            <div ref={contentRef} className="project-detail">
                <button ref={closeButtonRef} type="button" className="project-popup-close" onClick={close} aria-label="Close project details">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
                </button>
                <div className="project-detail-scroll">
                    <div className="project-detail-media">
                        {image
                            ? <img src={image} alt={title} />
                            : <div className="project-video-placeholder" role="img" aria-label={`${title} video placeholder`}><span>Video placeholder</span></div>}
                    </div>
                    <div className="project-detail-body">
                        <div className="project-detail-main">
                            <span className="project-detail-kicker">
                                Project {String(number).padStart(2, '0')}{category && ` · ${category}`}
                            </span>
                            <h2 id={titleId} className="project-detail-title">{title}</h2>
                            <p className="project-detail-lede">{description}</p>
                            {overview.map((paragraph) => <p key={paragraph} className="project-detail-text">{paragraph}</p>)}
                            {highlights.length > 0 && <>
                                <h3 className="project-detail-heading">Highlights</h3>
                                <ul className="project-detail-highlights">
                                    {highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
                                </ul>
                            </>}
                        </div>
                        <aside className="project-detail-meta">
                            {(role || timeline) && <dl className="project-detail-facts">
                                {role && <div><dt>Role</dt><dd>{role}</dd></div>}
                                {timeline && <div><dt>Timeline</dt><dd>{timeline}</dd></div>}
                            </dl>}
                            {tech.length > 0 && <div>
                                <h3 className="project-detail-heading">Built with</h3>
                                <ul className="project-detail-tech">
                                    {tech.map((item) => <li key={item}>{item}</li>)}
                                </ul>
                            </div>}
                            {(href || demo) && <div className="project-detail-links">
                                {href && <a href={href} target="_blank" rel="noopener noreferrer" className="project-detail-link">
                                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .297a12 12 0 0 0-3.794 23.39c.6.111.82-.258.82-.577v-2.257c-3.338.725-4.043-1.416-4.043-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.082-.73.082-.73 1.205.084 1.839 1.236 1.839 1.236 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.303-5.467-1.332-5.467-5.93 0-1.31.469-2.381 1.236-3.221-.124-.303-.536-1.523.117-3.176 0 0 1.008-.322 3.301 1.23a11.49 11.49 0 0 1 6.008 0c2.293-1.552 3.3-1.23 3.3-1.23.654 1.653.242 2.873.118 3.176.77.84 1.236 1.911 1.236 3.221 0 4.609-2.807 5.624-5.479 5.921.43.37.814 1.102.814 2.222v3.293c0 .322.218.694.825.576A12.002 12.002 0 0 0 12 .297" /></svg>
                                    View on GitHub
                                </a>}
                                {demo && <a href={demo} target="_blank" rel="noopener noreferrer" className="project-detail-link project-detail-link--secondary">Live demo</a>}
                            </div>}
                        </aside>
                    </div>
                </div>
            </div>
        </div>
    </div>, document.body);
}
