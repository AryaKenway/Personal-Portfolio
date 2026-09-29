import { useTypingGreeting } from '../hooks/useTypingGreeting.js';

export default function AboutSection() {
    const greeting = useTypingGreeting();
    return <section className="mt-8">
        <h2 className="section-title">About Me</h2>
        <p className="about-text"><span id="typed-greeting" className="greet-neon">{greeting}</span>{' '}My name is Arya Acharya. I am based in Bangalore, India.</p>
        <p className="about-text">I'm a B.Tech. graduate from Christ University, Bangalore (CGPA: 8.76), currently interning as a UX Designer at Walmart Global Tech India, with a strong interest in emerging technologies.</p>
    </section>;
}