import { profile } from '../data/portfolio.js';
import SocialLinks from './SocialLinks.jsx';

const socialLinks = [
    ['Email', `mailto:${profile.email}`, 'icon-mail', 'M3 5h18v14H3z M3 6l9 7 9-7', false],
    ['GitHub', profile.github, 'icon-github', 'M12 .297a12 12 0 0 0-3.794 23.39c.6.111.82-.258.82-.577v-2.257c-3.338.725-4.043-1.416-4.043-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.082-.73.082-.73 1.205.084 1.839 1.236 1.839 1.236 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.303-5.467-1.332-5.467-5.93 0-1.31.469-2.381 1.236-3.221-.124-.303-.536-1.523.117-3.176 0 0 1.008-.322 3.301 1.23a11.49 11.49 0 0 1 6.008 0c2.293-1.552 3.3-1.23 3.3-1.23.654 1.653.242 2.873.118 3.176.77.84 1.236 1.911 1.236 3.221 0 4.609-2.807 5.624-5.479 5.921.43.37.814 1.102.814 2.222v3.293c0 .322.218.694.825.576A12.002 12.002 0 0 0 12 .297', true],
    ['LinkedIn', profile.linkedin, 'icon-linkedin', 'M20.447 20.452H16.89v-5.569c0-1.328-.026-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.345V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.37-1.85 3.604 0 4.269 2.372 4.269 5.455v6.286zM5.337 7.433a2.063 2.063 0 1 1 0-4.126 2.063 2.063 0 0 1 0 4.126zM7.119 20.452H3.555V9h3.564v11.452', true],
    ['LeetCode', profile.leetcode, 'icon-leetcode', 'M13.483 0a1.374 1.374 0 0 0-.961.396L.396 12.522a1.374 1.374 0 0 0 0 1.942l12.126 12.127a1.374 1.374 0 1 0 1.942-1.942L3.31 13.493 14.464 2.338A1.374 1.374 0 0 0 13.483 0Zm4.09 6.252a1.374 1.374 0 0 0-.972.401l-6.845 6.846a1.374 1.374 0 0 0 0 1.942l6.845 6.845a1.374 1.374 0 1 0 1.942-1.942l-5.874-5.874 5.874-5.875a1.374 1.374 0 0 0-.97-2.343Zm-1.06 5.061a1.374 1.374 0 1 0 0 2.748h7.113a1.374 1.374 0 1 0 0-2.748Z', true],
    ['Resume', profile.resume, 'icon-resume', 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M8 13h8 M8 17h8', false]
];

export default function Header({ universityLogo }) {
    return <header className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-gray-300 pb-6">
        <div>
            <h1 className="glow-name text-4xl md:text-5xl font-bold">{profile.name}</h1>
            <div className="flex items-center mt-3"><img src={universityLogo} alt="Christ University Logo" className="h-10 w-10 mr-3 object-contain" /><p className="glow-subtitle">{profile.university}</p></div>
        </div>
        <SocialLinks links={socialLinks} />
    </header>;
}