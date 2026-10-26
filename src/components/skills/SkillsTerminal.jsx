/**
 * @file SkillsTerminal.jsx
 * @description The Skills terminal: one tab per skill group. Each tab
 * "runs" `npm install @arya/<group>` and prints the group's skills in aligned
 * columns, then a summary line.
 */

import { skillGroups } from '../../data/portfolio.js';
import { buildSkillTabs } from './skillTabs.js';
import {
    TerminalAnimationCommandBar,
    TerminalAnimationContent,
    TerminalAnimationOutput,
    TerminalAnimationOutputLine,
    TerminalAnimationRoot,
    TerminalAnimationTabList,
    TerminalAnimationTabTrigger,
    TerminalAnimationWindow
} from './TerminalAnimation.jsx';
import styles from './SkillsTerminal.module.css';

const SKILL_TABS = buildSkillTabs(skillGroups);

/**
 * @param {{ tab: import('./skillTabs.js').SkillTab, visibleLines: number }} props
 */
function SkillOutput({ tab, visibleLines }) {
    const skills = tab.lines.filter((line) => line.kind === 'skill');
    const summary = tab.lines.at(-1);

    return <>
        <ul className={styles.skillList} aria-label={tab.title}>
            {skills.map((line, index) => <TerminalAnimationOutputLine
                key={line.text}
                as="li"
                visible={index < visibleLines}
                className={styles.skill}
            >
                <span className={styles.added} aria-hidden="true">+</span>
                <span>{line.text}</span>
            </TerminalAnimationOutputLine>)}
        </ul>
        <TerminalAnimationOutputLine as="p" visible={visibleLines >= tab.lines.length} className={styles.summary}>
            <span aria-hidden="true"><span className={styles.added}>✓</span> {summary.text}</span>
        </TerminalAnimationOutputLine>
    </>;
}

export function SkillsTerminal() {
    return <TerminalAnimationRoot tabs={SKILL_TABS}>
        <TerminalAnimationWindow title="arya@portfolio: ~/skills">
            <TerminalAnimationTabList label="Skill groups">
                {SKILL_TABS.map((tab, index) => <TerminalAnimationTabTrigger key={tab.id} index={index}>
                    {tab.id}
                </TerminalAnimationTabTrigger>)}
            </TerminalAnimationTabList>
            <TerminalAnimationContent>
                <TerminalAnimationCommandBar />
                <TerminalAnimationOutput renderPanel={(tab, visibleLines) => <SkillOutput tab={tab} visibleLines={visibleLines} />} />
            </TerminalAnimationContent>
        </TerminalAnimationWindow>
    </TerminalAnimationRoot>;
}
