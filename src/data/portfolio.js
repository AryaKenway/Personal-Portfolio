import postureImage from '../../Bioshockimage.jpg';
import resumePdf from '../../Arya_Acharya.pdf';
import miniplayerGif from '../assets/projects/MiniplayerDiscord.gif';
import discordExtendedGif from '../assets/projects/DiscordExtended.gif';
import yakuzaKiwami2Cover from '../assets/about/games/yakuza-kiwami-2.jpg';
import kingdomComeCover from '../assets/about/games/kingdom-come-deliverance.jpg';
import portal2Cover from '../assets/about/games/portal-2.jpg';
import inscryptionCover from '../assets/about/games/inscryption.jpg';
import dishonoredCover from '../assets/about/games/dishonored.jpg';
import aceAttorneyCover from '../assets/about/games/ace-attorney-trilogy.jpg';
import pokemonRedChapterCover from '../assets/about/games/pokemon-adventures-red-chapter.jpg';
import assassinsCreed3Cover from '../assets/about/games/assassins-creed-3.jpg';
import undertaleCover from '../assets/about/games/undertale.jpg';

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
        id: 'proficiencies',
        title: 'Proficiencies',
        skills: [
            'Agentic AI', 'Microcontroller Programming', 'RAG', 'Software Design Patterns', 'Technical Art',
            'UX Research', 'Agile Methodology', 'Software Testing', 'Low-Level Design'
        ]
    },
    {
        id: 'languages',
        title: 'Languages & Frameworks',
        skills: ['C#', 'GDScript', 'Python', 'HTML5', 'Java', 'MySQL', 'React.js', 'Tailwind CSS', 'UE Blueprints']
    },
    {
        id: 'tools',
        title: 'Tools',
        skills: ['Aseprite', 'Arduino IDE', 'Figma', 'Selenium', 'Tinkercad', 'Unity Engine']
    },
    {
        id: 'design',
        title: 'Design',
        skills: ['UI/UX Design', 'Web Design', 'Level Design', 'Narrative & Story Design']
    },
    {
        id: 'devops',
        title: 'DevOps',
        skills: ['Docker', 'Git', 'GitHub', 'Jira']
    }
];

/**
 * Favourite games for the About section's card deck, in deck order. Covers are portrait box
 * art (Steam library art), except the fan-made Red Chapter, which only has a landscape title
 * screen (`fit: 'contain'`, pixel art). Cover art belongs to each game's publisher.
 */
export const favouriteGames = [
    { title: 'Yakuza Kiwami 2', cover: yakuzaKiwami2Cover },
    { title: 'Kingdom Come: Deliverance', cover: kingdomComeCover },
    { title: 'Portal 2', cover: portal2Cover },
    { title: 'Inscryption', cover: inscryptionCover },
    { title: 'Dishonored', cover: dishonoredCover },
    { title: 'Phoenix Wright: Ace Attorney Trilogy', cover: aceAttorneyCover },
    { title: 'Pokémon Adventure: Red Chapter', cover: pokemonRedChapterCover, fit: 'contain' },
    { title: "Assassin's Creed III", cover: assassinsCreed3Cover },
    { title: 'Undertale', cover: undertaleCover }
];

export const experience = [
    {
        id: 'walmart',
        title: 'UX Designer Intern',
        organization: 'Walmart Global Tech India',
        period: 'March 2026 – September 2026',
        startDate: '2026-03',
        endDate: '2026-09',
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
        title: 'Augmented Reality Researcher Intern',
        organization: 'Stipe Solutions Private Limited',
        period: 'April 2025 – June 2025',
        startDate: '2025-04',
        endDate: '2025-06',
        highlights: [
            'Researched AR development using Meta Quest and Unity, focusing on real-time interaction and user experiences',
            'Implemented a simple integration where user inputs from a phone were enhanced with hand gestures and overlay elements using Microsoft Clipchamp'
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
        organization: 'Hitachi India Private Limited',
        period: 'April 2024 – June 2024',
        startDate: '2024-04',
        endDate: '2024-06',
        highlights: [
            'Implemented stack and queue data structures in Unity',
            'Made a live weather forecast project using a weather API',
            'Exported and tested models in Unity and Blender'
        ]
    }
];

// `details` feeds the project popup; any field left out is simply not shown. `details.gallery`
// replaces the popup's single image with several, side by side (width/height set their proportions).
// `youtube` (a video id) shows the video's thumbnail on the page and plays it in the popup.
// `details.kicker: false` hides the "Project 0N · category" line; `details.extraLinks` adds buttons
// after View on GitHub.
export const projects = [
    {
        title: 'YouTube Music Discord Presence',
        description: 'Shows the song playing on YouTube Music as a live Discord status.',
        image: miniplayerGif,
        imagePosition: 'center 85%',
        href: 'https://github.com/AryaKenway/Discord-Rich-Presence-YTMusic',
        details: {
            kicker: false,
            extraLinks: [
                { label: 'Get the extension on Firefox', href: 'https://addons.mozilla.org/en-US/firefox/addon/ytmdiscordbridge/', icon: 'firefox' }
            ],
            overview: [
                'Discord has no built-in status for YouTube Music, so this project adds one. Whatever is playing shows up on your Discord profile as "Listening to YouTube Music", with the song, artist, album art and a live progress bar.',
                'A Firefox extension reads what is playing on YouTube Music and sends it to a small local Node.js server, which updates your Discord Rich Presence. A Windows installer sets the server up in one step.'
            ],
            highlights: [
                'Song title, artist, album and cover art in your Discord status',
                'A live playback progress bar with elapsed and total time',
                'Shows on both the profile pop-out and the full profile',
                'One-click Windows installer, plus the Firefox add-on'
            ],
            gallery: [
                { src: miniplayerGif, alt: 'Discord profile pop-out showing "Listening to YouTube Music" with the song and progress bar', width: 438, height: 488 },
                { src: discordExtendedGif, alt: 'Full Discord profile with the YouTube Music activity under Current activity', width: 1342, height: 910 }
            ]
        }
    },
    {
        title: 'JoPolik - The Super Experience',
        description: 'A hybrid 2D-3D educational Unity game with DSA challenges and online multiplayer.',
        youtube: '-iHyOAHc6VM',
        href: 'https://github.com/AryaKenway/JoPolik-The-Super-Experience',
        details: {
            category: 'Educational game · Unity',
            overview: [
                'This project is a hybrid 2D-3D educational game built in Unity, combining platforming, exploration, and problem-solving.',
                'The first level features a 2D platformer with animations, surface effectors, and NPC interactions, ending with a DSA challenge that unlocks progression. The second level shifts into a 3D apartment environment, surrounded by procedurally generated worlds, where players solve another DSA question to earn rewards. Multiplayer functionality is powered by Photon PUN, enabling seamless real-time interaction and cooperative play.'
            ],
            highlights: [
                'A 2D platformer level with animations, surface effectors and NPC interactions',
                'A 3D apartment level surrounded by procedurally generated worlds',
                'DSA challenges that unlock progression and earn rewards',
                'Real-time cooperative multiplayer with Photon PUN'
            ]
        }
    },
    { title: 'Project 03 - Title Placeholder', description: 'Project description placeholder.', videoPlaceholder: true },
    {
        title: 'Bioshock III - Posture Monitoring',
        description: 'Real-time posture monitoring using IMU + live dashboard.',
        image: postureImage,
        href: 'https://github.com/AryaKenway/Bioshock-III-Smart-Posture-Monitor',
        details: {
            category: 'Wearable · Health tech',
            overview: [
                'A wearable that tracks posture in real time with an IMU sensor and streams the readings to a live dashboard.',
                'Overview placeholder: the problem, your approach, and the outcome.'
            ],
            highlights: ['Real-time posture tracking from IMU readings', 'Live dashboard for monitoring posture', 'Highlight placeholder']
        }
    }
];