import { useState, useEffect } from 'react';

export const useTypewriter = (text: string, speed: number = 30, isEnabled: boolean = true) => {
    const [displayedText, setDisplayedText] = useState(isEnabled ? '' : text);
    const [isFinished, setIsFinished] = useState(!isEnabled);

    useEffect(() => {
        if (!isEnabled) {
            setDisplayedText(text);
            setIsFinished(true);
            return;
        }

        // If trying to type but text is empty, finish
        if (!text) {
            setDisplayedText('');
            setIsFinished(true);
            return;
        }

        let i = 0;
        setIsFinished(false);
        setDisplayedText('');

        const intervalId = setInterval(() => {
            i++;
            setDisplayedText(text.substring(0, i));

            if (i >= text.length) {
                clearInterval(intervalId);
                setIsFinished(true);
            }
        }, speed);

        return () => clearInterval(intervalId);
    }, [text, speed, isEnabled]);

    return { displayedText, isFinished };
};
