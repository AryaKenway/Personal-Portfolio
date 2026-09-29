import { useEffect, useState } from 'react';

const greetings = ['Hello', 'नमस्ते', 'こんにちは'];

export function useTypingGreeting() {
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        let wordIndex = 0;
        let characterIndex = 0;
        let deleting = false;
        let typingTimer;
        let pauseTimer;

        const typeNextCharacter = () => {
            const word = greetings[wordIndex];
            if (!deleting && characterIndex <= word.length) setGreeting(word.slice(0, characterIndex++));
            else if (deleting && characterIndex >= 0) setGreeting(word.slice(0, characterIndex--));

            if (characterIndex === word.length + 1) pauseTimer = window.setTimeout(() => { deleting = true; }, 800);
            else if (deleting && characterIndex === -1) {
                deleting = false;
                wordIndex = (wordIndex + 1) % greetings.length;
                characterIndex = 0;
            }
            typingTimer = window.setTimeout(typeNextCharacter, deleting ? 60 : 100);
        };

        typeNextCharacter();
        return () => {
            window.clearTimeout(typingTimer);
            window.clearTimeout(pauseTimer);
        };
    }, []);

    return greeting;
}