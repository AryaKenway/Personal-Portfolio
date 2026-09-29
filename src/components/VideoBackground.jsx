import { useEffect, useRef } from 'react';

export default function VideoBackground({ src }) {
    const leftVideo = useRef(null);
    const rightVideo = useRef(null);

    useEffect(() => {
        const videos = [leftVideo.current, rightVideo.current];
        const handleVisibilityChange = () => videos.forEach((video) => {
            if (!video) return;
            if (document.hidden) video.pause();
            else video.play().catch(() => {});
        });
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    return <>
        <video ref={leftVideo} autoPlay muted loop preload="none" id="side-video-left"><source src={src} type="video/mp4" /></video>
        <video ref={rightVideo} autoPlay muted loop preload="none" id="side-video-right"><source src={src} type="video/mp4" /></video>
    </>;
}