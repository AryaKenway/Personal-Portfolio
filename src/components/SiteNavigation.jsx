export default function SiteNavigation({ page = 'home' }) {
    const homePath = page === 'home' ? '' : 'index.html';

    return <header className="site-header">
        <a className="site-brand" href="index.html">Arya Acharya</a>
        <nav className="site-nav" aria-label="Main navigation">
            <a href={`${homePath}#about`}>About</a>
            <a href={`${homePath}#experience`}>Experience</a>
            <a href={`${homePath}#skills`}>Skills</a>
            <a href={`${homePath}#work`}>Selected work</a>
            <a href="more.html" aria-current={page === 'more' ? 'page' : undefined}>More</a>
        </nav>
    </header>;
}
