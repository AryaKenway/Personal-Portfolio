export default function IntroOverlay({ onStart, fading, hidden }) {
    if (hidden) return null;
    return <div id="intro-overlay" className={fading ? 'is-fading' : ''} onClick={onStart}>
        <div className="take-that-text">TAKE THAT!</div>
        <p className="intro-instruction">Click anywhere to start</p>
    </div>;
}