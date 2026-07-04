import { useCallback } from 'react';
import { writeText } from '@tauri-apps/api/clipboard';
import { sendNotification } from '@tauri-apps/api/notification';

/**
 * Consolidated auto-copy logic for all three modes:
 *   'source'       — copy source text before translate
 *   'target'       — copy result after translate
 *   'source_target' — copy both after translate
 */
export default function useAutoCopy({ autoCopy, hideWindow, clipboardMonitor, t }) {
    const autoCopySource = useCallback((sourceText) => {
        if (autoCopy !== 'source' || clipboardMonitor) return;
        writeText(sourceText).then(() => {
            if (hideWindow) {
                sendNotification({ title: t('common.write_clipboard'), body: sourceText });
            }
        });
    }, [autoCopy, hideWindow, clipboardMonitor, t]);

    const autoCopyResult = useCallback((sourceText, result) => {
        if (clipboardMonitor) return;
        if (autoCopy === 'target') {
            writeText(result).then(() => {
                if (hideWindow) {
                    sendNotification({ title: t('common.write_clipboard'), body: result });
                }
            });
        } else if (autoCopy === 'source_target') {
            const payload = sourceText.trim() + '\n\n' + result;
            writeText(payload).then(() => {
                if (hideWindow) {
                    sendNotification({ title: t('common.write_clipboard'), body: payload });
                }
            });
        }
    }, [autoCopy, hideWindow, clipboardMonitor, t]);

    return { autoCopySource, autoCopyResult };
}
