/**
 * @file skillTabs.js
 * @description Pure: turns `skillGroups` into terminal tabs. Each group becomes
 * one `npm install @arya/<group>` run that prints its skills and a summary line.
 */

/** Pause (ms) before each output line, as in Cult UI's `TerminalLine.delay`. */
const FIRST_LINE_DELAY = 120;
const SKILL_DELAY = 70;
const SUMMARY_DELAY = 320;

/**
 * @typedef {Object} TerminalLine
 * @property {'skill' | 'summary'} kind
 * @property {string} text
 * @property {number} delay - Wait (ms) before this line appears.
 */

/**
 * @typedef {Object} SkillTab
 * @property {string} id - Tab label and package name, e.g. `tools`.
 * @property {string} title - Human-readable group name.
 * @property {string} command - Typed after the prompt.
 * @property {TerminalLine[]} lines - The skills in data order, then the summary.
 */

/**
 * @param {readonly { id: string, title: string, skills: string[] }[]} groups
 * @returns {SkillTab[]}
 */
export function buildSkillTabs(groups) {
    return groups.map(({ id, title, skills }) => ({
        id,
        title,
        command: `npm install @arya/${id}`,
        lines: [
            ...skills.map((skill, index) => ({
                kind: 'skill',
                text: skill,
                delay: index === 0 ? FIRST_LINE_DELAY : SKILL_DELAY
            })),
            // npm's own wording, so it reads the same for every group.
            { kind: 'summary', text: `added ${skills.length} packages`, delay: SUMMARY_DELAY }
        ]
    }));
}
