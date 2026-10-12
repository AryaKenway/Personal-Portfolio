export default function ProjectCard({ title, description, image, href }) {
    return <article className="project-card project-flip-content">
        {image && <img src={image} alt={title} className="project-img" />}
        {!image && <div className="project-video-placeholder" role="img" aria-label={`${title} video placeholder`}><span>Video placeholder</span></div>}
        <div className="p-5">
            <h3 className="project-title">{title}</h3>
            <p className="project-desc">{description}</p>
            {href && <a href={href} target="_blank" rel="noopener noreferrer" className="project-link">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2" aria-hidden="true"><path d="M12 .297a12 12 0 0 0-3.794 23.39c.6.111.82-.258.82-.577v-2.257c-3.338.725-4.043-1.416-4.043-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.082-.73.082-.73 1.205.084 1.839 1.236 1.839 1.236 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.303-5.467-1.332-5.467-5.93 0-1.31.469-2.381 1.236-3.221-.124-.303-.536-1.523.117-3.176 0 0 1.008-.322 3.301 1.23a11.49 11.49 0 0 1 6.008 0c2.293-1.552 3.3-1.23 3.3-1.23.654 1.653.242 2.873.118 3.176.77.84 1.236 1.911 1.236 3.221 0 4.609-2.807 5.624-5.479 5.921.43.37.814 1.102.814 2.222v3.293c0 .322.218.694.825.576A12.002 12.002 0 0 0 12 .297" /></svg>
                View on GitHub
            </a>}
        </div>
    </article>;
}