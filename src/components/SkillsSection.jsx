import { SkillsTour } from './skills/SkillsTour.jsx';

export default function SkillsSection() {
    return <section className="content-section skills-section" id="skills">
        <div className="section-heading">
            <h2 className="section-title">Skills</h2>
        </div>
        <SkillsTour />
    </section>;
}
