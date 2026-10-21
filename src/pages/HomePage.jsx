import { useEffect } from 'react';
import Header from '../components/Header.jsx';
import AboutSection from '../components/AboutSection.jsx';
import SkillsSection from '../components/SkillsSection.jsx';
import ExperienceSection from '../components/ExperienceSection.jsx';
import ProjectsSection from '../components/ProjectsSection.jsx';
import SiteNavigation from '../components/SiteNavigation.jsx';
import CursorDot from '../components/CursorDot.jsx';
import Reveal from '../components/Reveal.jsx';
import universityLogo from '../../christ-logo.png';

export default function HomePage() {
    useEffect(() => { document.title = 'Arya Acharya - Portfolio'; }, []);

    return <>
        <SiteNavigation />
        <CursorDot />
        <main className="site-main">
            <Reveal><Header universityLogo={universityLogo} /></Reveal>
            <Reveal><AboutSection /></Reveal>
            <Reveal><ExperienceSection /></Reveal>
            <Reveal><SkillsSection /></Reveal>
            <div className="project-zone" id="work">
                <ProjectsSection />
            </div>
            <Reveal>
                <div className="more-page-link">
                    <a href="more.html">More / add-ons <span aria-hidden="true">↗</span></a>
                </div>
            </Reveal>
        </main>
        <footer className="site-footer">
            <p>© 2026 Arya Acharya</p>
            <p>Bangalore, India</p>
        </footer>
    </>;
}