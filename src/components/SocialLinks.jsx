export default function SocialLinks({ links }) {
    return <nav className="social-links" aria-label="Contact and social links">
        {links.map(({ label, href, external }) => <a key={label} href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>
            {label}{external && <span aria-hidden="true"> ↗</span>}
        </a>)}
    </nav>;
}