import { useEffect } from 'react';
import Header from '../components/Header.jsx';
import AboutSection from '../components/AboutSection.jsx';
import SkillsSection from '../components/SkillsSection.jsx';
import ExperienceSection from '../components/ExperienceSection.jsx';
import ProjectsSection from '../components/ProjectsSection.jsx';
import CanvasCursor from '../components/CanvasCursor.jsx';
import SiteSky from '../components/SiteSky.jsx';
import Reveal from '../components/Reveal.jsx';

export default function HomePage() {
    useEffect(() => { document.title = 'Arya Acharya - Portfolio'; }, []);

    return <>
        <SiteSky />
        <CanvasCursor />
        <main className="site-main">
            <Reveal><Header /></Reveal>
            <Reveal><AboutSection /></Reveal>
            <Reveal><SkillsSection /></Reveal>
            <Reveal><ExperienceSection /></Reveal>
            <div className="project-zone" id="work">
                <ProjectsSection />
            </div>
        </main>
    </>;
}