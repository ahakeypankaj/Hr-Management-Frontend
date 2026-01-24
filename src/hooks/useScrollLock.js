import { useEffect } from 'react';

/**
 * Hook to lock body scroll when a modal is open.
 * @param {boolean} isLocked - Whether the scroll should be locked.
 */
export function useScrollLock(isLocked) {
    useEffect(() => {
        if (isLocked) {
            // Calculate scrollbar width to prevent layout shift
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = `${scrollbarWidth}px`;
        } else {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }

        return () => {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        };
    }, [isLocked]);
}
