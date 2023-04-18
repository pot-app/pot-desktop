import React, { useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline';
import { appWindow } from "@tauri-apps/api/window";
import TopBar from './components/TopBar';
import SourceArea from './components/SourceArea';
import LanguageSelector from './components/LanguageSelector';
import TargetArea from './components/TargetArea';
import { light, dark } from '../themes';
import { get } from './main';

export default function App() {
  const theme = get('theme') ?? 'auto';
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  useEffect(() => {
    document.addEventListener('contextmenu', (e) => { e.preventDefault() });
    document.addEventListener('keydown', (e) => {
      let allowKeys = ['c', 'v', 'x', 'a'];
      if (e.ctrlKey && !allowKeys.includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
      if (e.key.startsWith("F")) {
        e.preventDefault();
      }
      if (e.key === 'Escape') {
        appWindow.close();
      }
    })
  }, [])

  return (
    <ThemeProvider theme={theme == 'auto' ? (prefersDarkMode ? dark : light) : (theme == 'dark' ? dark : light)}>
      <CssBaseline />
      <TopBar />
      <SourceArea />
      <LanguageSelector />
      <TargetArea />
    </ThemeProvider>
  )
}
