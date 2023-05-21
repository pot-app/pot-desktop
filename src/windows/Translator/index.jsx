import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { appWindow } from '@tauri-apps/api/window';
import { useMediaQuery, Grid } from '@mui/material';
import React, { useEffect } from 'react';
import LanguageSelector from './components/LanguageSelector';
import TargetArea from './components/TargetArea';
import SourceArea from './components/SourceArea';
import TopBar from './components/TopBar';
import { light, dark } from '../themes';
import { get } from '../main';

export default function Translator() {
    const theme = get('theme') ?? 'auto';
    const interfaceList = get('default_interface_list') ?? ['deepl', 'bing'];

    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    useEffect(() => {
        if (appWindow.label != 'util') {
            appWindow.show();
            appWindow.setFocus();
        }
    }, []);
    return (
        <ThemeProvider theme={theme == 'auto' ? (prefersDarkMode ? dark : light) : theme == 'dark' ? dark : light}>
            <CssBaseline />
            <div
                data-tauri-drag-region
                className='titlebar'
            />
            <TopBar />
            <Grid
                container
                direction='column'
                height='calc(100vh - 50px)'
                style={{ overflow: 'hidden' }}
            >
                <Grid
                    style={{
                        width: '100%',
                        display: appWindow.label != 'persistent' && (get('hide_source') ?? false) ? 'none' : '',
                    }}
                >
                    <SourceArea />
                </Grid>
                <Grid
                    style={{
                        width: '100%',
                        display: appWindow.label != 'persistent' && (get('hide_source') ?? false) ? 'none' : '',
                    }}
                >
                    <LanguageSelector />
                </Grid>
                <Grid
                    item
                    style={{
                        width: '100%',
                        overflow: 'auto',
                        marginTop: '8px',
                    }}
                    xs
                >
                    {interfaceList.map((x, index) => {
                        return (
                            <TargetArea
                                i={x}
                                q={index}
                                key={x}
                            />
                        );
                    })}
                </Grid>
            </Grid>
        </ThemeProvider>
    );
}
