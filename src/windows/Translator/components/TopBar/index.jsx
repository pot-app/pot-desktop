import PodcastsRoundedIcon from '@mui/icons-material/PodcastsRounded';
import PushPinRoundedIcon from '@mui/icons-material/PushPinRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { Box, IconButton, Tooltip } from '@mui/material';
import { listen, emit } from '@tauri-apps/api/event';
import { readText } from '@tauri-apps/api/clipboard';
import React, { useState, useEffect } from 'react';
import { appWindow } from '@tauri-apps/api/window';
import { toast, Toaster } from 'react-hot-toast';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { invoke } from '@tauri-apps/api/tauri';
import { atom, useAtom } from 'jotai';
import { set } from '../../../../global/config';
import { get } from '../../../main';
import './style.css';

let blurTimeout = null;

// 监听 blur 事件，如果窗口失去焦点，关闭窗口
const listenBlur = () =>
    listen('tauri://blur', () => {
        if (appWindow.label === 'translator' || appWindow.label === 'popclip') {
            if (blurTimeout) {
                clearTimeout(blurTimeout);
            }
            // 50ms后关闭窗口，因为在 windows 下拖动窗口时会先切换成 blur 再立即切换成 focus
            // 如果直接关闭将导致窗口无法拖动
            blurTimeout = setTimeout(async () => {
                await appWindow.close();
            }, 50);
        }
    });

// 监听 focus 事件取消 blurTimeout 时间之内的关闭窗口
void listen('tauri://focus', () => {
    if (blurTimeout) {
        clearTimeout(blurTimeout);
    }
});

// 取消 blur 监听
const unlistenBlur = () => {
    unlisten.then((f) => {
        f();
    });
};

let unlisten = listenBlur();

let resizeTimeout = null;

listen('tauri://resize', async () => {
    if (get('remember_window_size') ?? false) {
        if (resizeTimeout) {
            clearTimeout(resizeTimeout);
        }
        resizeTimeout = setTimeout(async () => {
            if (appWindow.label === 'translator' || appWindow.label === 'popclip' || appWindow.label === 'persistent') {
                const psize = await appWindow.innerSize();
                const factor = await appWindow.scaleFactor();
                const lsize = psize.toLogical(factor);
                await set('window_height', parseInt(lsize.height));
                await set('window_width', parseInt(lsize.width));
            }
            消抖;
        }, 1000);
    }
});

let currentClipboard = '';

export const listenCopyAtom = atom(false);

export default function TopBar() {
    const [pined, setPined] = useState(get('default_pined') ?? true);
    const [listenCopy, setListenCopy] = useAtom(listenCopyAtom);
    const [isMacos, setIsMacos] = useState(false);
    const [int, setInt] = useState();

    const { t } = useTranslation();
    const theme = useTheme();

    useEffect(() => {
        invoke('is_macos').then((v) => {
            setIsMacos(v);
        });
        if (appWindow.label === 'persistent') {
            void appWindow.setAlwaysOnTop(pined);
        } else {
            // 使划词翻译窗口置顶，但是pined图标显示为false
            // 这样一来pin在划词翻译窗口的作用相当于控制是否在失去焦点的时候关闭
            // 而且对于划词翻译窗口确实需要使其一直处于置顶状态
            void appWindow.setAlwaysOnTop(true);
            setPined(false);
        }
    }, []);

    return (
        <Box className={isMacos ? 'topbar-macos' : 'topbar'}>
            <Toaster />
            <Box>
                <IconButton
                    className='topbar-button'
                    onClick={() => {
                        appWindow.setAlwaysOnTop(!pined).then((_) => {
                            if (!pined) {
                                unlistenBlur();
                            } else {
                                unlisten = listenBlur();
                            }
                            setPined(!pined);
                        });
                    }}
                >
                    <PushPinRoundedIcon color={pined ? 'primary' : ''} />
                </IconButton>
                <IconButton
                    className='topbar-button'
                    style={{ marginLeft: 8 }}
                    onClick={() => {
                        if (!listenCopy) {
                            if (!pined) {
                                appWindow.setAlwaysOnTop(true).then((_) => {
                                    unlistenBlur();
                                });
                                setPined(true);
                            }
                            setListenCopy(true);
                            setInt(
                                setInterval(async () => {
                                    let text = await readText();
                                    if (text && text !== currentClipboard) {
                                        currentClipboard = text;
                                        if (get('delete_newline') ?? false) {
                                            // /s匹配空格和换行符 /g表示全局匹配
                                            text = text.replace(/\s+/g, ' ');
                                        }
                                        await emit('new_selection', text);
                                    }
                                }, 200)
                            );
                            toast.success(t('translator.topbar.start'), {
                                style: {
                                    background: theme.palette.background.default,
                                    color: theme.palette.text.primary,
                                },
                            });
                        } else {
                            setListenCopy(false);
                            clearInterval(int);
                            toast.success(t('translator.topbar.stop'), {
                                style: {
                                    background: theme.palette.background.default,
                                    color: theme.palette.text.primary,
                                },
                            });
                        }
                    }}
                >
                    <Tooltip title={t('translator.topbar.clipboardlistenmode')}>
                        <PodcastsRoundedIcon color={listenCopy ? 'primary' : ''} />
                    </Tooltip>
                </IconButton>
            </Box>
            {isMacos ? (
                <></>
            ) : (
                <IconButton
                    className='topbar-button'
                    onClick={async () => {
                        await appWindow.close();
                    }}
                >
                    <CancelRoundedIcon />
                </IconButton>
            )}
        </Box>
    );
}
