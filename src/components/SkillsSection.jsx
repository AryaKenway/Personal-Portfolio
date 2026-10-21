import { skillGroups } from '../data/portfolio.js';

export default function SkillsSection() {
    return <section className="content-section" id="skills">
        <div className="section-heading">
            <p className="eyebrow">A practical toolkit</p>
            <h2 className="section-title">Skills &amp; tools</h2>
        </div>
        <div className="skill-groups">
            {skillGroups.map(({ title, skills }) => <section key={title} className="skill-group" aria-label={title}>
                <h3 className="section-subtitle">{title}</h3>
                <ul className="skill-list">
                    {skills.map((name, index) => <li key={`${name}-${index}`}>{name}</li>)}
                </ul>
            </section>)}
        </div>
    </section>;
}