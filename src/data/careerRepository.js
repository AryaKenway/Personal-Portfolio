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

/** Per-milestone details that `portfolio.js` does not carry. */
const MILESTONE_DETAILS = {
    education: {
        shortName: 'Christ University',
        location: 'Bangalore, India',
        skills: ['Computer Science', 'Data Structures', 'C#', 'Java', 'Algorithms', 'Software Design Patterns'],
        highlights: [
            'Pursuing degree with rigorous focus on Software Engineering, Data Structures, and Applied Computer Science.',
            'Built foundational expertise in Object-Oriented Programming, C#, Java, Database Management, and UI/UX fundamentals.'
        ]
    },
    hitachi: {
        shortName: 'Hitachi',
        location: 'Bangalore, India',
        skills: ['Unity', 'C#', 'Visual Data Structures', 'Blender', 'REST APIs', 'Software Testing'],
        highlights: [
            'Engineered visual stack and queue data structure simulations in Unity for educational comprehension.',
            'Built an interactive visual weather application integrating real-time third-party REST APIs.',
            'Integrated and validated 3D Blender assets with automated asset testing pipelines.'
        ]
    },
    'red-panda': {
        shortName: 'Red Panda Games',
        location: 'Remote / Bangalore',
        skills: ['Unity', 'Shader Graphs', 'Particle Systems', 'Game Design Docs', 'QA & Regression Testing', 'Game Balancing'],
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
        skills: ['Augmented Reality', 'Video Systems', 'Spatial Overlays', 'Interaction Design', 'Research'],
        highlights: [
            'Conducted applied research on integrating real-time augmented reality into web-based video systems.',
            'Implemented interactive multimedia pipelines combining videos, dynamic captions, and real-time AR overlays.'
        ]
    },
    walmart: {
        shortName: 'Walmart',
        location: 'Walmart Global Tech, Bangalore',
        skills: ['UX Design', 'Generative AI', 'React', 'Tailwind CSS', 'Figma-to-Code MCP', 'Heuristic Evaluation', 'Accessibility'],
        highlights: [
            'Designed high-fidelity interactive prototypes for site merchant analytics dashboards powered by LLMs.',
            'Architected the AI-driven Item Intelligence dashboard delivering 360-degree catalog insights.',
            'Transformed complex Figma designs into responsive production-grade web interfaces using React & Tailwind.',
            'Conducted heuristic usability evaluations and user research sessions, significantly streamlining merchant workflows.',
            'Championed accessibility and neurodiversity awareness initiatives across the global enterprise tech organization.'
        ]
    }
};

/** @returns {Milestone[]} Chronological, education first. */
function buildMilestones() {
    const education = {
        id: 'education',
        type: 'education',
        title: 'BCA / Computer Science',
        organization: profile.university || 'Christ University, Bangalore',
        period: '2023 – 2026',
        startDate: '2023-06',
        endDate: '2026-05'
    };

    const entries = [education, ...experience.slice().sort((a, b) => a.startDate.localeCompare(b.startDate))];

    return entries.map((raw) => {
        const details = MILESTONE_DETAILS[raw.id] ?? {
            shortName: raw.organization,
            location: 'Bangalore, India',
            skills: [],
            highlights: []
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
            highlights: details.highlights.length > 0 ? details.highlights : (raw.highlights || [])
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
