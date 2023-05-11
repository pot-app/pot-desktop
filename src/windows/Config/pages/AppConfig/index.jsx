import { TextField, Select, MenuItem, Box, FormControlLabel, Checkbox } from '@mui/material';
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
} from '../..';

export default function AppConfig() {
    const [autoStart, setAutoStart] = useAtom(autoStartAtom);
    const [autoCheck, setAutoCheck] = useAtom(autoCheckAtom);
    const [defaultPined, setDefaultPined] = useAtom(defaultPinedAtom);
    const [proxy, setProxy] = useAtom(proxyAtom);
    const [defaultWindow, setDefaultWindow] = useAtom(defaultWindowAtom);
    const [windowWidth, setWindowWidth] = useAtom(windowWidthAtom);
    const [windowHeight, setWindowHeight] = useAtom(windowHeightAtom);
    const [theme, setTheme] = useAtom(themeAtom);
    const muitheme = useTheme();

    return (
        <>
            <Toaster />
            <ConfigList label='应用设置'>
                <ConfigItem>
                    <FormControlLabel
                        control={
                            <Checkbox
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
                        }
                        label='开机自启'
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={autoCheck}
                                onChange={(e) => {
                                    setAutoCheck(e.target.checked);
                                    set('auto_check', e.target.checked);
                                }}
                            />
                        }
                        label='启动时检查更新'
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={defaultPined}
                                onChange={(e) => {
                                    setDefaultPined(e.target.checked);
                                    set('default_pined', e.target.checked);
                                }}
                            />
                        }
                        label='独立翻译窗口默认置顶'
                    />
                </ConfigItem>
                <ConfigItem label='网络代理'>
                    <TextField
                        fullWidth
                        value={proxy}
                        placeholder='eg:http://127.0.0.1:7890'
                        onChange={(e) => {
                            setProxy(e.target.value);
                            set('proxy', e.target.value);
                        }}
                    />
                </ConfigItem>
                <ConfigItem label='托盘单击事件'>
                    <Select
                        fullWidth
                        value={defaultWindow}
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
                        fullWidth
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
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                        }}
                    >
                        <TextField
                            label='宽'
                            sx={{ width: 'calc(50% - 8px)' }}
                            value={windowWidth}
                            onChange={(event) => {
                                setWindowWidth(Number(event.target.value));
                                set('window_width', Number(event.target.value));
                            }}
                        />
                        <TextField
                            label='高'
                            sx={{ width: 'calc(50% - 8px)' }}
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
