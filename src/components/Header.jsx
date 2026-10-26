import { profile } from '../data/portfolio.js';
import MsdfName from './MsdfName.jsx';
import SocialLinks from './SocialLinks.jsx';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { LuFileUser, LuMail } from 'react-icons/lu';
import { SiLeetcode } from 'react-icons/si';

const socialLinks = [
    { label: 'Email', href: `mailto:${profile.email}`, icon: LuMail },
    { label: 'GitHub', href: profile.github, external: true, icon: FaGithub },
    { label: 'LinkedIn', href: profile.linkedin, external: true, icon: FaLinkedin },
    { label: 'LeetCode', href: profile.leetcode, external: true, icon: SiLeetcode },
    { label: 'Resume', href: profile.resume, external: true, icon: LuFileUser }
];

/** The top of the home page: the name, with the contact links on the same line. */
export default function Header() {
    return <header className="profile-header">
        <div className="profile-intro">
            <MsdfName className="profile-name" text={profile.name} />
        </div>
        <SocialLinks links={socialLinks} />
    </header>;
}
