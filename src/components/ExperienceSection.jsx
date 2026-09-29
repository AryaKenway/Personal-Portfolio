import { experience } from '../data/portfolio.js';

export default function ExperienceSection() {
    return <section className="mt-10">
        <h2 className="section-title">Work Experience</h2>
        <div className="space-y-6">
            {experience.map(({ title, duration, highlights }) => <article key={title} className="timeline-border">
                <h3 className="job-title">{title}</h3>
                <p className="job-duration">{duration}</p>
                <ul className="job-list">{highlights.map((item) => <li key={item}>{item}</li>)}</ul>
            </article>)}
        </div>
    </section>;
}