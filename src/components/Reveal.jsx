import { useEffect, useRef } from 'react';

export default function Reveal({ children }) {
    const elementRef = useRef(null);

    useEffect(() => {
        const element = elementRef.current;
        if (!element || !('IntersectionObserver' in window)) return undefined;

        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        let observer;
        const reveal = () => {
            element.dataset.revealState = 'visible';
            observer?.disconnect();
        };
        const updateMotionPreference = () => {
            if (reducedMotion.matches) reveal();
        };

        if (reducedMotion.matches) {
            reveal();
        } else {
            element.dataset.revealState = 'pending';
            // Reveal once the element's top is 15% into the viewport. (A visible-area threshold
            // never fires for sections taller than ~6 screens, like the pinned Experience journey.)
            observer = new IntersectionObserver(([entry]) => {
                if (entry.isIntersecting) reveal();
            }, { threshold: 0, rootMargin: '0px 0px -15% 0px' });
            observer.observe(element);
            reducedMotion.addEventListener('change', updateMotionPreference);
        }

        return () => {
            observer?.disconnect();
            reducedMotion.removeEventListener('change', updateMotionPreference);
        };
    }, []);

    return <div ref={elementRef} className="scroll-reveal">{children}</div>;
}
