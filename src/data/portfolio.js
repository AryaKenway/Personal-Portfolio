import postureImage from '../../Bioshockimage.jpg';
import resumePdf from '../../Arya_Acharya.pdf';
import fortniteGdd from '../../FortniteGDD.pdf';

export const profile = {
    name: 'Arya Acharya',
    university: 'Christ University, Bangalore',
    email: 'aryaacharya2500@gmail.com',
    github: 'https://github.com/AryaKenway',
    linkedin: 'https://www.linkedin.com/in/arya-acharya',
    leetcode: 'https://leetcode.com/u/bxH9OUO7qp',
    resume: resumePdf
};

export const skillGroups = [
    {
        title: 'Proficiencies',
        skills: [
            'Game Development', 'Game Design', 'Software Design Patterns', 'Product Design',
            'Database Management', 'Microcontroller Programming', 'Generative AI', 'Agentic AI',
            'AI Task Automation', 'AI-Based Workflow', 'UX Design', 'UX Research',
            'Interaction Design', 'Wireframing', 'Level Design', 'Particle Effects',
            'Shader Graphs', 'Data Structures', 'SQL', 'Software Testing'
        ]
    },
    {
        title: 'Tools',
        skills: ['Figma', 'Unity', 'Blender', 'Arduino IDE', 'Autodesk Tinkercad', '.NET Framework', 'Selenium', 'Git']
    },
    {
        title: 'Developer Platforms',
        skills: ['GitHub', 'Jenkins', 'Docker', 'CI/CD Pipelines', 'DevOps Automation']
    },
    {
        title: 'Programming Languages',
        skills: ['C#', 'Java', 'JavaScript', 'C', 'React', 'HTML5', 'CSS', 'SQL']
    },
    {
        title: 'Soft Skills',
        skills: ['Problem Solving', 'Documentation', 'Collaboration', 'Attention to Detail']
    }
];

export const experience = [
    {
        id: 'walmart',
        title: 'UX Designer Intern',
        organization: 'Walmart Global Tech India',
        period: 'March 2026 – Present',
        startDate: '2026-03',
        endDate: null,
        highlights: [
            'Designed interactive prototypes for an analytics dashboard for site merchants, enabling data driven decisions to improve sales, customer experience, and product visibility, extensively leveraging LLMs',
            'Designed an AI powered Item Intelligence dashboard, providing merchants with a comprehensive 360-degree view of every product across the catalog',
            'Interpreted Figma designs to responsive web pages using React, Tailwind CSS, and AI-assisted Figma-to-code MCP workflows',
            'Conducted heuristic evaluations and UX research to identify usability issues and recommend design improvements that enhanced the overall user experience',
            'Led the planning and execution of neurodiversity and accessibility awareness events for Walmart'
        ]
    },
    {
        id: 'stipe',
        title: 'AR Research Intern',
        organization: 'Stipe Solutions Pvt. Ltd.',
        period: 'April 2025 – June 2025',
        startDate: '2025-04',
        endDate: '2025-06',
        highlights: [
            'Researched AR integration for a real-time video-based web system.',
            'Integrated photos, videos, and AR overlays with captions using Microsoft Clipchamp.'
        ]
    },
    {
        id: 'red-panda',
        title: 'Game Development Intern',
        organization: 'Red Panda Games Studio',
        period: 'Nov 2024 – June 2025',
        startDate: '2024-11',
        endDate: '2025-06',
        highlights: [
            'Manipulated shader graphs and particle effects to enhance visual elements',
            'Refined the game’s UI to ensure a clean, intuitive, and user-friendly interface layout',
            'Led GDD-based case studies to extract and document adaptable game mechanics',
            'QA and Regression testing to report bugs and enhance user experience',
            'Balanced troop and building interactions by tuning HP, counters, and damage values'
        ]
    },
    {
        id: 'hitachi',
        title: 'Software Engineer Intern',
        organization: 'Hitachi India Pvt. Ltd.',
        period: 'April 2024 – June 2024',
        startDate: '2024-04',
        endDate: '2024-06',
        highlights: [
            'Visual stack & queue data structure implementation in Unity',
            'Visual Weather App using Api in Unity',
            'Integrated and tested Blender models'
        ]
    }
];

// `details` feeds the project popup; any field left out is simply not shown.
export const projects = [
    {
        title: 'Bioshock III - Posture Monitoring',
        description: 'Real-time posture monitoring using IMU + live dashboard.',
        image: postureImage,
        href: 'https://github.com/AryaKenway/Bioshock-III-Smart-Posture-Monitor',
        details: {
            category: 'Wearable · Health tech',
            role: 'Role placeholder',
            timeline: 'Timeline placeholder',
            overview: [
                'A wearable that tracks posture in real time with an IMU sensor and streams the readings to a live dashboard.',
                'Overview placeholder: the problem, your approach, and the outcome.'
            ],
            highlights: ['Real-time posture tracking from IMU readings', 'Live dashboard for monitoring posture', 'Highlight placeholder'],
            tech: ['IMU sensor', 'Tech placeholder']
        }
    },
    {
        title: 'JoPolik - The Super Experience',
        description: 'Educational multiplayer game with Photon PUN.',
        videoPlaceholder: true,
        href: 'https://github.com/AryaKenway/JoPolik-The-Super-Experience',
        details: {
            category: 'Multiplayer game · Education',
            role: 'Role placeholder',
            timeline: 'Timeline placeholder',
            overview: [
                'An educational multiplayer game built on Photon PUN.',
                'Overview placeholder: the learning goal, the core loop, and how players interact.'
            ],
            highlights: ['Online multiplayer with Photon PUN', 'Highlight placeholder'],
            tech: ['Unity', 'C#', 'Photon PUN']
        }
    },
    { title: 'Project 03 - Title Placeholder', description: 'Project description placeholder.', videoPlaceholder: true },
    { title: 'Project 04 - Title Placeholder', description: 'Project description placeholder.', videoPlaceholder: true }
];

export const fortniteGddUrl = fortniteGdd;