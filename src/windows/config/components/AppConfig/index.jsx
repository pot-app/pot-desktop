import { TextField, Select, MenuItem, Box, FormControlLabel, Checkbox } from '@mui/material';
import React, { useEffect } from 'react';
import { atom, useAtom } from 'jotai';
import { nanoid } from 'nanoid';
import * as interfaces from '../../../../interfaces';
import language from '../../../../global/language';
import ConfigList from '../ConfigList';
import ConfigItem from '../ConfigItem';
import { get } from '../../main';

export const autoStartAtom = atom(true);
export const autoCheckAtom = atom(true);
export const targetLanguageAtom = atom('zh-cn');
export const defaultInterfaceAtom = atom('deepl');
export const proxyAtom = atom('');
export const themeAtom = atom('auto');
export const windowWidthAtom = atom(400);
export const windowHeightAtom = atom(500);

export default function AppConfig() {
    const [autoStart, setAutoStart] = useAtom(autoStartAtom);
    const [autoCheck, setAutoCheck] = useAtom(autoCheckAtom);
    const [targetLanguage, setTargetLanguage] = useAtom(targetLanguageAtom);
    const [defaultInterface, setDefaultInterface] = useAtom(defaultInterfaceAtom);
    const [proxy, setProxy] = useAtom(proxyAtom);
    const [windowWidth, setWindowWidth] = useAtom(windowWidthAtom);
    const [windowHeight, setWindowHeight] = useAtom(windowHeightAtom);
    const [theme, setTheme] = useAtom(themeAtom);

    useEffect(() => {
        setAutoStart(get('auto_start') || true);
        setAutoCheck(get('auto_check') || true);
        setTargetLanguage(get('target_language') || 'zh-cn');
        setDefaultInterface(get('interface') || 'deepl');
        setProxy(get('proxy') || '');
        setWindowWidth(get('window_width') || 400);
        setWindowHeight(get('window_height') || 500);
        setTheme(get('theme') || 'auto');
    }, [])

    return (
        <ConfigList label="应用设置">
            <ConfigItem>
                <FormControlLabel
                    control={
                        <Checkbox checked={autoStart} onChange={(e) => { setAutoStart(e.target.checked) }} />
                    }
                    label="开机自启" />
                <FormControlLabel
                    control={
                        <Checkbox checked={autoCheck} onChange={(e) => { setAutoCheck(e.target.checked) }} />
                    }
                    label="启动时检查更新" />
            </ConfigItem>
            <ConfigItem label="目标语言">
                <Select
                    fullWidth
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                >
                    {
                        language.map(x => {
                            return <MenuItem value={x.value} key={nanoid()}>{x.label}</MenuItem>
                        })
                    }
                </Select>
            </ConfigItem>
            <ConfigItem label="默认接口">
                <Select
                    fullWidth
                    value={defaultInterface}
                    onChange={(e) => setDefaultInterface(e.target.value)}
                >
                    {
                        Object.keys(interfaces).map(
                            x => {
                                return <MenuItem value={x} key={nanoid()}>{interfaces[x]['info']['name']}</MenuItem>
                            }
                        )
                    }
                </Select>
            </ConfigItem>
            <ConfigItem label="网络代理">
                <TextField
                    fullWidth
                    value={proxy}
                    placeholder="eg:http://127.0.0.1:7890"
                    onChange={(e) => { setProxy(e.target.value) }}
                />
            </ConfigItem>
            <ConfigItem label="颜色主题">
                <Select
                    fullWidth
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                >
                    <MenuItem value='auto'>跟随系统</MenuItem>
                    <MenuItem value='light'>明亮</MenuItem>
                    <MenuItem value='dark'>黑暗</MenuItem>
                </Select>
            </ConfigItem>
            <ConfigItem label="翻译窗口默认大小">
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: "space-between"
                    }}
                >
                    <TextField
                        label="宽"
                        sx={{ width: "calc(50% - 8px)" }}
                        value={windowWidth}
                        onChange={(event) => {
                            setWindowWidth(Number(event.target.value));
                        }}
                    />
                    <TextField
                        label="高"
                        sx={{ width: "calc(50% - 8px)" }}
                        value={windowHeight}
                        onChange={(event) => {
                            setWindowHeight(Number(event.target.value));
                        }}
                    />
                </Box>
            </ConfigItem>
        </ConfigList>
    )
}
