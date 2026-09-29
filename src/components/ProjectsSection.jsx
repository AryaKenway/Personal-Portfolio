import { projects } from '../data/portfolio.js';
import ProjectCard from './ProjectCard.jsx';

export default function ProjectsSection() {
    return <section className="mt-10">
        <h2 className="section-title">Project Showcase</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">{projects.map((project) => <ProjectCard key={project.title} {...project} />)}</div>
    </section>;
}