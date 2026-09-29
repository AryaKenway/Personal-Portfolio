import { useEffect, useRef, useState } from 'react';
import IntroOverlay from '../components/IntroOverlay.jsx';
import { fortniteGddUrl } from '../data/portfolio.js';
import backgroundVideo from '../../nightcity.mp4';
import introAudio from '../../IntroMusic.mp3';

export default function MorePage() {
    const videoRef = useRef(null);
    const audioRef = useRef(null);
    const started = useRef(false);
    const [fading, setFading] = useState(false);
    const [hidden, setHidden] = useState(false);

    useEffect(() => {
        const playVideo = () => videoRef.current?.play().catch(() => {});
        if (document.readyState === 'complete') playVideo();
        else window.addEventListener('load', playVideo, { once: true });
        document.title = 'More - Arya Acharya';
        return () => window.removeEventListener('load', playVideo);
    }, []);

    const startExperience = () => {
        if (started.current) return;
        started.current = true;
        videoRef.current?.play().catch((error) => console.log('Video wait:', error));
        audioRef.current?.play().catch((error) => console.log('Audio wait:', error));
        window.setTimeout(() => {
            setFading(true);
            window.setTimeout(() => setHidden(true), 1000);
        }, 1800);
    };

    return <>
        <video ref={videoRef} id="bg-video" loop muted playsInline><source src={backgroundVideo} type="video/mp4" /></video>
        <audio ref={audioRef} id="intro-audio" src={introAudio} />
        <IntroOverlay onStart={startExperience} fading={fading} hidden={hidden} />
        <div className="page-wrapper">
            <main className="content-box">
                <h1>DLC / Add-Ons</h1>
                <div className="nav-container"><a href="index.html" className="back-link">« Back</a></div>
                <section className="section-container">
                    <h2 className="section-title">Game Design Documents</h2>
                    <div className="button-wrapper"><a href={fortniteGddUrl} target="_blank" rel="noopener noreferrer" className="neon-button" data-text="Fortnite: A better experience">Fortnite: A better experience</a></div>
                </section>
                <section className="section-container">
                    <h2 className="section-title">Research Publications</h2>
                    <div className="status-wrapper"><p className="coming-soon-text">Coming Soon</p></div>
                </section>
            </main>
        </div>
    </>;
}