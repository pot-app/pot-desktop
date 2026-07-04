import { useEffect, useRef, useState } from 'react';
import { appWindow, currentMonitor } from '@tauri-apps/api/window';
import { listen } from '@tauri-apps/api/event';
import { info } from 'tauri-plugin-log-api';
import { store } from '../../utils/store';

/**
 * Manages the translate window lifecycle: blur-to-close, pin-to-top,
 * and auto-saving window position/size to the config store.
 */
export default function useTranslateWindow(closeOnBlur, alwaysOnTop, windowPosition, rememberWindowSize) {
    const blurTimeoutRef = useRef(null);
    const resizeTimeoutRef = useRef(null);
    const moveTimeoutRef = useRef(null);
    const [pinned, setPinned] = useState(false);

    // Toggle pin: alwaysOnTop + unlistenBlur / listenBlur
    const togglePin = () => {
        if (pinned) {
            // Unpin: re-enable blur close if configured
            if (closeOnBlur) {
                cleanupRef.current = registerBlurClose();
            }
            appWindow.setAlwaysOnTop(false);
        } else {
            // Pin: disable blur close, enable alwaysOnTop
            unregisterBlurClose();
            appWindow.setAlwaysOnTop(true);
        }
        setPinned(!pinned);
    };

    // ── Blur close ──────────────────────────────────────────────────────

    const registerBlurClose = () => {
        const unsub = listen('tauri://blur', () => {
            clearTimeout(blurTimeoutRef.current);
            blurTimeoutRef.current = setTimeout(async () => {
                info('Confirm Blur');
                await appWindow.close();
            }, 100);
        });
        const unsubFocus = listen('tauri://focus', () => {
            clearTimeout(blurTimeoutRef.current);
        });
        const unsubMove = listen('tauri://move', () => {
            clearTimeout(blurTimeoutRef.current);
        });
        return () => {
            unsub.then((f) => f());
            unsubFocus.then((f) => f());
            unsubMove.then((f) => f());
        };
    };

    const unregisterBlurClose = () => {
        cleanupRef.current?.();
        cleanupRef.current = null;
    };

    const cleanupRef = useRef(null);

    // Auto-init blur listener
    useEffect(() => {
        if (closeOnBlur) {
            cleanupRef.current = registerBlurClose();
        }
        return () => {
            unregisterBlurClose();
        };
    }, [closeOnBlur]);

    // ── Always-on-top ignores blur close ────────────────────────────────

    useEffect(() => {
        if (alwaysOnTop) {
            unregisterBlurClose();
            appWindow.setAlwaysOnTop(true);
            setPinned(true);
        }
    }, [alwaysOnTop]);

    // ── Auto-save window position ────────────────────────────────────────

    useEffect(() => {
        if (windowPosition !== 'pre_state') return;
        const unsub = listen('tauri://move', async () => {
            clearTimeout(moveTimeoutRef.current);
            moveTimeoutRef.current = setTimeout(async () => {
                const pos = await appWindow.outerPosition();
                const monitor = await currentMonitor();
                const logical = pos.toLogical(monitor.scaleFactor);
                await store.set('translate_window_position_x', parseInt(logical.x));
                await store.set('translate_window_position_y', parseInt(logical.y));
                await store.save();
            }, 100);
        });
        return () => { unsub.then((f) => f()); };
    }, [windowPosition]);

    // ── Auto-save window size ────────────────────────────────────────────

    useEffect(() => {
        if (!rememberWindowSize) return;
        const unsub = listen('tauri://resize', async () => {
            clearTimeout(resizeTimeoutRef.current);
            resizeTimeoutRef.current = setTimeout(async () => {
                const size = await appWindow.outerSize();
                const monitor = await currentMonitor();
                const logical = size.toLogical(monitor.scaleFactor);
                await store.set('translate_window_height', parseInt(logical.height));
                await store.set('translate_window_width', parseInt(logical.width));
                await store.save();
            }, 100);
        });
        return () => { unsub.then((f) => f()); };
    }, [rememberWindowSize]);

    return { pinned, togglePin };
}
