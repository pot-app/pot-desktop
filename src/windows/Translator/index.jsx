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
import { get } from '../main';

document.addEventListener('DOMContentLoaded', () => {
  if (appWindow.label == 'translator' || appWindow.label == 'popclip' || appWindow.label == 'persistent') {
    appWindow.show();
    appWindow.setFocus();
  }
})

export default function App() {
  const theme = get('theme') ?? 'auto';
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  return (
    <ThemeProvider theme={theme == 'auto' ? (prefersDarkMode ? dark : light) : (theme == 'dark' ? dark : light)}>
      <CssBaseline />
      <div data-tauri-drag-region className="titlebar" />
      <TopBar />
      <SourceArea />
      <LanguageSelector />
      <TargetArea />
    </ThemeProvider>
  )
}
