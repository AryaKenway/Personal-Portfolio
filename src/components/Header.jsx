import { profile } from '../data/portfolio.js';
import SocialLinks from './SocialLinks.jsx';

const socialLinks = [
    { label: 'Email', href: `mailto:${profile.email}` },
    { label: 'GitHub', href: profile.github, external: true },
    { label: 'LinkedIn', href: profile.linkedin, external: true },
    { label: 'LeetCode', href: profile.leetcode, external: true },
    { label: 'Resume', href: profile.resume, external: true }
];

export default function Header({ universityLogo }) {
    return <header className="profile-header">
        <div className="profile-intro">
            <p className="eyebrow">UX designer · Bangalore, India</p>
            <h1 className="profile-name">{profile.name}</h1>
            <p className="profile-lede">My work spans UX design, software, and game development.</p>
            <div className="profile-affiliation"><img src={universityLogo} alt="" className="profile-logo" /><p className="profile-meta">{profile.university}</p></div>
        </div>
        <SocialLinks links={socialLinks} />
    </header>;
}