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
    { title: 'Proficiencies', skills: [
        ['Game Development', 'tag-game'], ['Game Design', 'tag-game'], ['Software Design Patterns', 'tag-software'], ['Product Design', 'tag-software'], ['Database Management', 'tag-database'], ['Microcontroller Programming', 'tag-hardware'], ['Generative AI', 'tag-ai'], ['Agentic AI', 'tag-ai'], ['AI Task Automation', 'tag-ai'], ['AI-Based Workflow', 'tag-ai'], ['UX Design', 'tag-ux'], ['UX Research', 'tag-ux'], ['Interaction Design', 'tag-ux'], ['Wireframing', 'tag-ux'], ['Level Design', 'tag-ux'], ['Particle Effects', 'tag-vfx'], ['Shader Graphs', 'tag-vfx'], ['Data Structures', 'tag-core'], ['SQL', 'tag-database'], ['Software Testing', 'tag-testing']
    ] },
    { title: 'Tools', skills: [
        ['Figma', 'tag-design'], ['Unity', 'tag-unity'], ['Blender', 'tag-unity'], ['Arduino IDE', 'tag-hardware'], ['Autodesk Tinkercad', 'tag-hardware'], ['.NET Framework', 'tag-backend'], ['Selenium', 'tag-testing'], ['Git', 'tag-core']
    ] },
    { title: 'Developer Platforms', skills: [
        ['GitHub', 'tag-git'], ['Jenkins', 'tag-devops'], ['Docker', 'tag-devops'], ['CI/CD Pipelines', 'tag-devops'], ['DevOps Automation', 'tag-devops']
    ] },
    { title: 'Programming Languages', skills: [
        ['C#', 'tag-core'], ['Java', 'tag-core'], ['JavaScript', 'tag-core'], ['C', 'tag-core'], ['React', 'tag-web'], ['HTML5', 'tag-web'], ['CSS', 'tag-web'], ['SQL', 'tag-database']
    ] },
    { title: 'Soft Skills', skills: [
        ['Problem Solving', 'tag-soft'], ['Documentation', 'tag-soft'], ['Collaboration', 'tag-soft'], ['Attention to Detail', 'tag-soft']
    ] }
];

export const experience = [
    { title: 'UX Designer Intern', duration: 'Walmart Global Tech India • March 2026 – Present', highlights: [
        'Designed interactive prototypes for an analytics dashboard for site merchants, enabling data driven decisions to improve sales, customer experience, and product visibility, extensively leveraging LLMs',
        'Designed an AI powered Item Intelligence dashboard, providing merchants with a comprehensive 360-degree view of every product across the catalog',
        'Interpreted Figma designs to responsive web pages using React, Tailwind CSS, and AI-assisted Figma-to-code MCP workflows',
        'Conducted heuristic evaluations and UX research to identify usability issues and recommend design improvements that enhanced the overall user experience',
        'Led the planning and execution of neurodiversity and accessibility awareness events for Walmart'
    ] },
    { title: 'Game Development Intern', duration: 'Red Panda Games Studio • Nov 2024 – June 2025', highlights: [
        'Manipulated shader graphs and particle effects to enhance visual elements', 'Refined the game’s UI to ensure a clean, intuitive, and user-friendly interface layout', 'Led GDD-based case studies to extract and document adaptable game mechanics', 'QA and Regression testing to report bugs and enhance user experience', 'Balanced troop and building interactions by tuning HP, counters, and damage values'
    ] },
    { title: 'AR Research Intern', duration: 'Stipe Solutions Pvt. Ltd. • April 2025 – June 2025', highlights: [
        'Researched AR integration for a real-time video-based web system.', 'Integrated photos, videos, and AR overlays with captions using Microsoft Clipchamp.'
    ] },
    { title: 'Software Engineer Intern', duration: 'Hitachi India Pvt. Ltd. • April 2024 – June 2024', highlights: [
        'Visual stack & queue data structure implementation in Unity', 'Visual Weather App using Api in Unity', 'Integrated and tested Blender models'
    ] }
];

export const projects = [
    { title: 'Bioshock III - Posture Monitoring', description: 'Real-time posture monitoring using IMU + live dashboard.', image: postureImage, href: 'https://github.com/AryaKenway/Bioshock-III-Smart-Posture-Monitor' },
    { title: 'JoPolik - The Super Experience', description: 'Educational multiplayer game with Photon PUN.', videoPlaceholder: true, href: 'https://github.com/AryaKenway/JoPolik-The-Super-Experience' },
    { title: 'Project 03 - Title Placeholder', description: 'Project description placeholder.', videoPlaceholder: true },
    { title: 'Project 04 - Title Placeholder', description: 'Project description placeholder.', videoPlaceholder: true },
    { title: 'Project 05 - Title Placeholder', description: 'Project description placeholder.', videoPlaceholder: true },
    { title: 'Project 06 - Title Placeholder', description: 'Project description placeholder.', videoPlaceholder: true }
];

export const fortniteGddUrl = fortniteGdd;