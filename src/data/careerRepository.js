/**
 * @file careerRepository.js
 * @description Single source of truth for the career milestones shown in the
 * Experience journey: education plus every role from `portfolio.js`, enriched
 * with skills, highlights and display names, in chronological order.
 * Contains no UI logic.
 */

import { experience, profile } from './portfolio.js';

/**
 * @typedef {Object} Milestone
 * @property {string} id - Unique milestone identifier.
 * @property {'education' | 'work'} type - Milestone category.
 * @property {string} title - Role title or degree.
 * @property {string} organization - University or company name.
 * @property {string} shortName - Compact organization name for map labels.
 * @property {string} location - City / office.
 * @property {string} period - Human-readable time period.
 * @property {string} startDate - Sortable date (YYYY-MM).
 * @property {string | null} endDate - Sortable date, or null if ongoing.
 * @property {string[]} skills - Skills picked up at this milestone.
 * @property {string[]} highlights - Key accomplishments.
 */

/**
 * Per-milestone details that `portfolio.js` does not carry. `highlights` here
 * replaces the entry's own; leave it out to show the `portfolio.js` wording.
 */
const MILESTONE_DETAILS = {
    education: {
        shortName: 'Christ University',
        location: 'Bangalore, India',
        skills: [
            'Software Design Patterns', 'Java', 'SQL', 'Database Management', 'Gen AI', 'Selenium', 'Docker',
            'Software Testing', 'Jenkins', 'C', 'Hardware Programming', 'Tinkercad', 'Algorithms'
        ]
    },
    hitachi: {
        shortName: 'Hitachi',
        location: 'Bangalore, India',
        skills: ['Unity Engine', 'C#', 'Blender', 'Data Structures', 'Version Control']
    },
    'red-panda': {
        shortName: 'Red Panda Games',
        location: 'Remote / Bangalore',
        skills: [
            'Game Design', 'Unity Engine', 'C# Scripting', 'Level Design', 'Narrative Design', 'Shader Graphs',
            'Regression Testing', 'Functional Testing'
        ],
        highlights: [
            'Programmed custom shader graphs and dynamic particle systems to enhance real-time visual fidelity.',
            'Overhauled the game interface layout, engineering clean, intuitive, and high-performance UI components.',
            'Extracted adaptable game mechanics from in-depth Game Design Document (GDD) case studies.',
            'Balanced troop/building dynamics through statistical tuning of HP, attack counters, and damage curves.'
        ]
    },
    stipe: {
        shortName: 'Stipe Solutions',
        location: 'Bangalore, India',
        skills: ['AR Research', 'Prototyping', 'Video Editing', 'Spatial Overlays']
    },
    walmart: {
        shortName: 'Walmart',
        location: 'Walmart Global Tech, Bangalore',
        skills: [
            'UX Design', 'User Research', 'Figma', 'React', 'Tailwind', 'Gen AI Prototyping', 'Version Control',
            'Accessibility Testing'
        ]
    }
};

/**
 * The order the plane visits the stops. Not strictly by start date: Stipe comes before
 * Red Panda on purpose. Any id missing here goes last, by start date.
 */
const STOP_ORDER = ['education', 'hitachi', 'stipe', 'red-panda', 'walmart'];

function stopRank(entry) {
    const rank = STOP_ORDER.indexOf(entry.id);
    return rank === -1 ? STOP_ORDER.length : rank;
}

/** @returns {Milestone[]} In STOP_ORDER, education first. */
function buildMilestones() {
    const education = {
        id: 'education',
        type: 'education',
        title: 'B.Tech. in Computer Science',
        organization: profile.university || 'Christ University, Bangalore',
        period: '2022 – 2026',
        startDate: '2022-06',
        endDate: '2026-05',
        highlights: [
            'Graduated with a CGPA of 8.8, earning a merit scholarship in my third year',
            'Presented VSS, a research paper on visualizing search and sort algorithms, at the FED Global Conference',
            'Won first place at Battle of Brains, hosted by the Department of CSE',
            'Finalist in Gen AI Hack Fest 2025 organized by CMR Institute of Technology',
            'Led teams on two major projects built around SOLID design principles and DevOps practices'
        ]
    };

    const entries = [education, ...experience].sort(
        (a, b) => stopRank(a) - stopRank(b) || a.startDate.localeCompare(b.startDate)
    );

    return entries.map((raw) => {
        const details = MILESTONE_DETAILS[raw.id] ?? {
            shortName: raw.organization,
            location: 'Bangalore, India',
            skills: []
        };

        return Object.freeze({
            id: raw.id,
            type: raw.type || 'work',
            title: raw.title,
            organization: raw.organization,
            shortName: details.shortName,
            location: details.location,
            period: raw.period,
            startDate: raw.startDate,
            endDate: raw.endDate || null,
            skills: details.skills,
            highlights: details.highlights ?? raw.highlights ?? []
        });
    });
}

const MILESTONES = Object.freeze(buildMilestones());

/**
 * All career milestones in chronological order.
 * @returns {readonly Milestone[]}
 */
export function getAllMilestones() {
    return MILESTONES;
}
