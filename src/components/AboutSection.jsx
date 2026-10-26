import { GameDeck } from './about/GameDeck.jsx';

export default function AboutSection() {
    return <section className="content-section about-section" id="about">
        <div className="section-heading">
            <h2 className="section-title">About me</h2>
        </div>
        <div className="about-body">
            <div className="about-copy">
                <p className="about-text">Welcome! I’m Arya Acharya, a B.Tech. graduate from Christ University, Bangalore. I was previously a UX Designer Intern at Walmart Global Tech, and I’m currently looking for full-time opportunities.</p>
                <p className="about-text">I’m an avid gamer who has played over 300 games, across Android and PC. In my free time, I love developing games, keeping up with emerging trends, and dancing.</p>
            </div>
            <GameDeck />
        </div>
    </section>;
}
