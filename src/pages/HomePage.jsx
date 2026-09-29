import { useEffect } from 'react';
import Header from '../components/Header.jsx';
import AboutSection from '../components/AboutSection.jsx';
import SkillsSection from '../components/SkillsSection.jsx';
import ExperienceSection from '../components/ExperienceSection.jsx';
import ProjectsSection from '../components/ProjectsSection.jsx';
import VideoBackground from '../components/VideoBackground.jsx';
import sideVideo from '../../sidevideo.mp4';
import universityLogo from '../../christ-logo.png';

export default function HomePage() {
    useEffect(() => { document.title = 'Arya Acharya - Portfolio'; }, []);

    return <>
        <VideoBackground src={sideVideo} />
        <main className="main-wrapper max-w-4xl mx-auto p-6 md:p-10 bg-black bg-opacity-70 backdrop-blur-xl shadow-2xl rounded-2xl my-10 relative z-10">
            <Header universityLogo={universityLogo} />
            <AboutSection />
            <SkillsSection />
            <ExperienceSection />
            <ProjectsSection />
        </main>
        <div className="flex justify-center mt-12"><a href="more.html" className="cyber-button">DLC Content</a></div>
        <footer className="text-center py-6 relative z-10"><p className="text-gray-200 text-sm">&copy; 2026 Arya Acharya.</p></footer>
    </>;
}