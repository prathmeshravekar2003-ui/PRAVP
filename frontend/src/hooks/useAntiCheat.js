import { useEffect, useState } from 'react';
import api from '../services/api';

export const useAntiCheat = (examId, isAttempting) => {
    const [warnings, setWarnings] = useState(0);

    const logEvent = async (eventType, severity = 'MEDIUM', details = '') => {
        try {
            await api.post('/monitor/log', {
                examId,
                eventType,
                severity,
                details: details || `Browser: ${navigator.userAgent}`
            });
            console.warn(`Anti-cheat event: ${eventType}`);
        } catch (error) {
            console.error('Failed to log anti-cheat event', error);
        }
    };

    useEffect(() => {
        if (!isAttempting) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setWarnings(prev => prev + 1);
                logEvent('TAB_SWITCH', 'HIGH');
            }
        };

        const handleBlur = () => {
            setWarnings(prev => prev + 1);
            logEvent('WINDOW_BLUR', 'MEDIUM');
        };

        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                setWarnings(prev => prev + 1);
                logEvent('FULLSCREEN_EXIT', 'HIGH');
            }
        };

        const handleCopyPaste = (e) => {
            e.preventDefault();
            logEvent('COPY_PASTE_ATTEMPT', 'LOW');
            alert('Copy-pasting is disabled during the exam.');
        };

        const handleContextMenu = (e) => {
            e.preventDefault();
            logEvent('RIGHT_CLICK_ATTEMPT', 'LOW');
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('copy', handleCopyPaste);
        document.addEventListener('paste', handleCopyPaste);
        document.addEventListener('contextmenu', handleContextMenu);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('copy', handleCopyPaste);
            document.removeEventListener('paste', handleCopyPaste);
            document.removeEventListener('contextmenu', handleContextMenu);
        };
    }, [examId, isAttempting]);

    return { warnings };
};
