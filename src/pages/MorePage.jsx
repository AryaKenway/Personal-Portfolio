import { useEffect } from 'react';
import SiteNavigation from '../components/SiteNavigation.jsx';
import { fortniteGddUrl } from '../data/portfolio.js';

export default function MorePage() {
    useEffect(() => {
        document.title = 'More - Arya Acharya';
    }, []);

    return <>
        <SiteNavigation page="more" />
        <main className="more-main">
            <header className="more-hero">
                <p className="more-eyebrow">The extra pages</p>
                <h1>Beyond the portfolio<span aria-hidden="true">.</span></h1>
                <p className="more-intro">A small collection of game design work and research, gathered outside the main project showcase.</p>
            </header>
            <section className="more-section" aria-labelledby="documents-title">
                <div className="more-section-heading">
                    <p className="more-index">01</p>
                    <div>
                        <p className="more-eyebrow">Game design</p>
                        <h2 id="documents-title">Design documents</h2>
                    </div>
                </div>
                <a className="document-link" href={fortniteGddUrl} target="_blank" rel="noopener noreferrer">
                    <span>
                        <span className="document-title">Fortnite: A Better Experience</span>
                        <span className="document-meta">Game design document · PDF</span>
                    </span>
                    <span className="document-arrow" aria-hidden="true">↗</span>
                </a>
            </section>
            <section className="more-section" aria-labelledby="research-title">
                <div className="more-section-heading">
                    <p className="more-index">02</p>
                    <div>
                        <p className="more-eyebrow">In progress</p>
                        <h2 id="research-title">Research publications</h2>
                    </div>
                </div>
                <p className="research-note">Nothing to share here just yet.</p>
            </section>
        </main>
        <footer className="more-footer">
            <a href="index.html">← Back to the portfolio</a>
            <p>© 2026 Arya Acharya</p>
        </footer>
    </>;
}