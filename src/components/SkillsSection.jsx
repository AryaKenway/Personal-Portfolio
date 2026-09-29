import { skillGroups } from '../data/portfolio.js';

export default function SkillsSection() {
    return <section className="mt-10 space-y-8">
        {skillGroups.map(({ title, skills }) => <div key={title}>
            <h3 className="section-subtitle">{title}</h3>
            <div className="flex flex-wrap gap-4">
                {skills.map(([name, tagClass], index) => <span key={`${name}-${index}`} className={`${tagClass} skill-tag`}>{name}</span>)}
            </div>
        </div>)}
    </section>;
}