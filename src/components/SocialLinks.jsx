export default function SocialLinks({ links }) {
    return <div className="flex items-center space-x-4 mt-6 md:mt-0">
        {links.map(([label, href, className, path, external]) => <a key={label} href={href} className={className} aria-label={label} target={external || label === 'Resume' ? '_blank' : undefined} rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill={label === 'Email' || label === 'Resume' ? 'none' : 'currentColor'} stroke={label === 'Email' || label === 'Resume' ? 'currentColor' : 'none'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={path} /></svg>
        </a>)}
    </div>;
}