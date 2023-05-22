import { TextField, Select, MenuItem, Box, InputAdornment, Button, Switch } from '@mui/material';
import { enable, isEnabled, disable } from 'tauri-plugin-autostart-api';
import toast, { Toaster } from 'react-hot-toast';
import { useTheme } from '@mui/material/styles';
import 'flag-icons/css/flag-icons.min.css';
import { useAtom } from 'jotai';
import React from 'react';
import ConfigList from '../../components/ConfigList';
import ConfigItem from '../../components/ConfigItem';
import { set } from '../../../../global/config';
import {
    autoStartAtom,
    autoCheckAtom,
    defaultPinedAtom,
    proxyAtom,
    defaultWindowAtom,
    windowHeightAtom,
    windowWidthAtom,
    themeAtom,
    hideSourceAtom,
    hideLanguageAtom,
    rememberWindowSizeAtom,
} from '../..';
import { invoke } from '@tauri-apps/api/tauri';

export default function AppConfig() {
    const [autoStart, setAutoStart] = useAtom(autoStartAtom);
    const [autoCheck, setAutoCheck] = useAtom(autoCheckAtom);
    const [defaultPined, setDefaultPined] = useAtom(defaultPinedAtom);
    const [proxy, setProxy] = useAtom(proxyAtom);
    const [defaultWindow, setDefaultWindow] = useAtom(defaultWindowAtom);
    const [windowWidth, setWindowWidth] = useAtom(windowWidthAtom);
    const [windowHeight, setWindowHeight] = useAtom(windowHeightAtom);
    const [hideSource, setHideSource] = useAtom(hideSourceAtom);
    const [hideLanguage, setHideLanguage] = useAtom(hideLanguageAtom);
    const [rememberWindowSize, setRememberWindowSize] = useAtom(rememberWindowSizeAtom);
    const [theme, setTheme] = useAtom(themeAtom);
    const muitheme = useTheme();

    return (
        <>
            <Toaster />
            <ConfigList label='应用设置'>
                <ConfigItem label='开机启动'>
                    <Switch
                        checked={autoStart}
                        onChange={(e) => {
                            setAutoStart(e.target.checked);
                            if (e.target.checked) {
                                isEnabled().then((v) => {
                                    if (!v) {
                                        enable().then((_) => {
                                            toast.success('已设置开机启动', {
                                                style: {
                                                    background: muitheme.palette.background.default,
                                                    color: muitheme.palette.text.primary,
                                                },
                                            });
                                        });
                                    }
                                });
                            } else {
                                isEnabled().then((v) => {
                                    if (v) {
                                        disable().then((_) => {
                                            toast.success('已取消开机启动', {
                                                style: {
                                                    background: muitheme.palette.background.default,
                                                    color: muitheme.palette.text.primary,
                                                },
                                            });
                                        });
                                    }
                                });
                            }
                            set('auto_start', e.target.checked);
                        }}
                    />
                </ConfigItem>
                <ConfigItem label='启动时检查更新'>
                    <Switch
                        checked={autoCheck}
                        onChange={(e) => {
                            setAutoCheck(e.target.checked);
                            set('auto_check', e.target.checked);
                        }}
                    />
                </ConfigItem>
                <ConfigItem label='独立翻译窗口默认置顶'>
                    <Switch
                        checked={defaultPined}
                        onChange={(e) => {
                            setDefaultPined(e.target.checked);
                            set('default_pined', e.target.checked);
                        }}
                    />
                </ConfigItem>
                <ConfigItem label='隐藏原文本'>
                    <Switch
                        checked={hideSource}
                        onChange={(e) => {
                            setHideSource(e.target.checked);
                            set('hide_source', e.target.checked);
                        }}
                    />
                </ConfigItem>
                <ConfigItem label='隐藏语言栏'>
                    <Switch
                        checked={hideLanguage}
                        onChange={(e) => {
                            setHideLanguage(e.target.checked);
                            set('hide_language', e.target.checked);
                        }}
                    />
                </ConfigItem>
                <ConfigItem label='记住翻译窗口大小'>
                    <Switch
                        checked={rememberWindowSize}
                        onChange={(e) => {
                            setRememberWindowSize(e.target.checked);
                            set('remember_window_size', e.target.checked);
                        }}
                    />
                </ConfigItem>
                <ConfigItem label='网络代理'>
                    <TextField
                        // fullWidth
                        size='small'
                        value={proxy}
                        sx={{ width: '300px' }}
                        placeholder='eg:http://127.0.0.1:7890'
                        onChange={(e) => {
                            setProxy(e.target.value);
                            set('proxy', e.target.value);
                        }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position='end'>
                                    <Button
                                        size='small'
                                        variant='outlined'
                                        onClick={async () => {
                                            await invoke('set_proxy', { proxy });
                                        }}
                                    >
                                        应用
                                    </Button>
                                </InputAdornment>
                            ),
                        }}
                    />
                </ConfigItem>
                <ConfigItem label='托盘单击事件'>
                    <Select
                        // fullWidth
                        size='small'
                        value={defaultWindow}
                        sx={{ width: '300px' }}
                        onChange={(e) => {
                            setDefaultWindow(e.target.value);
                            set('default_window', e.target.value);
                        }}
                    >
                        <MenuItem value='none'>None</MenuItem>
                        <MenuItem value='config'>设置</MenuItem>
                        <MenuItem value='persistent'>翻译</MenuItem>
                    </Select>
                </ConfigItem>
                <ConfigItem label='颜色主题'>
                    <Select
                        // fullWidth
                        sx={{ width: '300px' }}
                        size='small'
                        value={theme}
                        onChange={(e) => {
                            setTheme(e.target.value);
                            set('theme', e.target.value);
                        }}
                    >
                        <MenuItem value='auto'>跟随系统</MenuItem>
                        <MenuItem value='light'>明亮</MenuItem>
                        <MenuItem value='dark'>黑暗</MenuItem>
                    </Select>
                </ConfigItem>
                <ConfigItem label='翻译窗口默认大小'>
                    <Box>
                        <TextField
                            label='宽'
                            size='small'
                            sx={{ width: '142px' }}
                            value={windowWidth}
                            onChange={(event) => {
                                setWindowWidth(Number(event.target.value));
                                set('window_width', Number(event.target.value));
                            }}
                        />
                        <TextField
                            label='高'
                            size='small'
                            sx={{ width: '142px', marginLeft: '16px' }}
                            value={windowHeight}
                            onChange={(event) => {
                                setWindowHeight(Number(event.target.value));
                                set('window_height', Number(event.target.value));
                            }}
                        />
                    </Box>
                </ConfigItem>
            </ConfigList>
        </>
    );
}
