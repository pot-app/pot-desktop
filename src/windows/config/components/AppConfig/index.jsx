import { TextField, Select, MenuItem, Box, FormControlLabel, Checkbox } from '@mui/material';
import React, { useEffect } from 'react';
import { atom, useAtom } from 'jotai';
import { nanoid } from 'nanoid';
import * as interfaces from '../../../../interfaces';
import language from '../../../../global/language';
import "flag-icons/css/flag-icons.min.css";
import ConfigList from '../ConfigList';
import ConfigItem from '../ConfigItem';
import { get } from '../../main';

export const autoStartAtom = atom(true);
export const autoCheckAtom = atom(true);
export const dynamicTranslateAtom = atom(false);
export const autoCopyAtom = atom(4);
export const targetLanguageAtom = atom('zh-cn');
export const defaultInterfaceAtom = atom('deepl');
export const proxyAtom = atom('');
export const themeAtom = atom('auto');
export const windowWidthAtom = atom(400);
export const windowHeightAtom = atom(500);

export default function AppConfig() {
    const [autoStart, setAutoStart] = useAtom(autoStartAtom);
    const [autoCheck, setAutoCheck] = useAtom(autoCheckAtom);
    const [dynamicTranslate, setDynamicTranslate] = useAtom(dynamicTranslateAtom);
    const [autoCopy, setAutoCopy] = useAtom(autoCopyAtom);
    const [targetLanguage, setTargetLanguage] = useAtom(targetLanguageAtom);
    const [defaultInterface, setDefaultInterface] = useAtom(defaultInterfaceAtom);
    const [proxy, setProxy] = useAtom(proxyAtom);
    const [windowWidth, setWindowWidth] = useAtom(windowWidthAtom);
    const [windowHeight, setWindowHeight] = useAtom(windowHeightAtom);
    const [theme, setTheme] = useAtom(themeAtom);

    useEffect(() => {
        setAutoStart(get('auto_start') ?? false);
        setAutoCheck(get('auto_check') ?? false);
        setDynamicTranslate(get('dynamic_translate') ?? false);
        setAutoCopy(get('auto_copy') ?? 4);
        setTargetLanguage(get('target_language') ?? 'zh-cn');
        setDefaultInterface(get('interface') ?? 'deepl');
        setProxy(get('proxy') ?? '');
        setWindowWidth(get('window_width') ?? 400);
        setWindowHeight(get('window_height') ?? 500);
        setTheme(get('theme') ?? 'auto');
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
                <FormControlLabel
                    control={
                        <Checkbox checked={dynamicTranslate} onChange={(e) => { setDynamicTranslate(e.target.checked) }} />
                    }
                    label="动态翻译" />
            </ConfigItem>
            <ConfigItem label="目标语言">
                <Select
                    fullWidth
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                >
                    {
                        language.map(x => {
                            return <MenuItem value={x.value} key={nanoid()}>
                                <span className={`fi fi-${x.code}`} /><span>{x.label}</span>
                            </MenuItem>
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
            <ConfigItem label="翻译后自动复制">
                <Select
                    fullWidth
                    value={autoCopy}
                    onChange={(e) => setAutoCopy(e.target.value)}
                >
                    <MenuItem value={1} >原文</MenuItem>
                    <MenuItem value={2} >译文</MenuItem>
                    <MenuItem value={3} >原文+译文</MenuItem>
                    <MenuItem value={4} >关闭</MenuItem>
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
