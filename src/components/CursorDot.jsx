import { useEffect, useRef } from 'react';

export default function CursorDot() {
    const cursorRef = useRef(null);
    const frameRef = useRef(0);
    const positionRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const finePointer = window.matchMedia('(pointer: fine)');
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const cursor = cursorRef.current;
        let stopTracking;

        const moveCursor = (event) => {
            positionRef.current = { x: event.clientX + 9, y: event.clientY + 9 };
            if (frameRef.current) return;
            frameRef.current = window.requestAnimationFrame(() => {
                cursor.style.transform = `translate3d(${positionRef.current.x}px, ${positionRef.current.y}px, 0)`;
                cursor.dataset.visible = 'true';
                frameRef.current = 0;
            });
        };
        const hideCursor = () => {
            cursor.dataset.visible = 'false';
            cursor.dataset.hover = 'false';
        };
        const updateHoverState = (event) => {
            const target = event.target instanceof Element ? event.target : null;
            cursor.dataset.hover = String(Boolean(target?.closest('a, button, [role="button"]')));
        };
        const synchronizePreferences = () => {
            const shouldTrack = finePointer.matches && !reducedMotion.matches;
            if (shouldTrack && !stopTracking) {
                cursor.dataset.enabled = 'true';
                document.addEventListener('pointermove', moveCursor, { passive: true });
                document.addEventListener('pointerover', updateHoverState, { passive: true });
                document.addEventListener('pointerout', updateHoverState, { passive: true });
                document.addEventListener('pointerleave', hideCursor);
                window.addEventListener('blur', hideCursor);
                stopTracking = () => {
                    document.removeEventListener('pointermove', moveCursor);
                    document.removeEventListener('pointerover', updateHoverState);
                    document.removeEventListener('pointerout', updateHoverState);
                    document.removeEventListener('pointerleave', hideCursor);
                    window.removeEventListener('blur', hideCursor);
                    cursor.dataset.visible = 'false';
                    cursor.dataset.enabled = 'false';
                    if (frameRef.current) {
                        window.cancelAnimationFrame(frameRef.current);
                        frameRef.current = 0;
                    }
                    stopTracking = undefined;
                };
            } else if (!shouldTrack && stopTracking) {
                stopTracking();
            }
        };

        synchronizePreferences();
        finePointer.addEventListener('change', synchronizePreferences);
        reducedMotion.addEventListener('change', synchronizePreferences);

        return () => {
            finePointer.removeEventListener('change', synchronizePreferences);
            reducedMotion.removeEventListener('change', synchronizePreferences);
            if (stopTracking) stopTracking();
        };
    }, []);

    return <span ref={cursorRef} className="cursor-dot" aria-hidden="true" data-enabled="false" data-visible="false" data-hover="false" />;
}
