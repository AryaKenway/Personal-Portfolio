/** Icon-only contact links; each label is kept for screen readers and as a hover tooltip. */
export default function SocialLinks({ links }) {
    return <nav className="social-links" aria-label="Contact and social links">
        {links.map(({ label, href, external, icon: Icon }) => <a
            key={label}
            href={href}
            aria-label={external ? `${label} (opens in a new tab)` : label}
            title={label}
            target={external ? '_blank' : undefined}
            rel={external ? 'noopener noreferrer' : undefined}
        >
            <Icon aria-hidden="true" focusable="false" />
        </a>)}
    </nav>;
}
