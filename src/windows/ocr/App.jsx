import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline';
import { light, dark } from '../themes';
import { get } from './main';

export default function App() {
  const theme = get('theme') ?? 'auto';
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  return (
    <ThemeProvider theme={theme == 'auto' ? (prefersDarkMode ? dark : light) : (theme == 'dark' ? dark : light)}>
      <CssBaseline />
      <div>Building...</div>
    </ThemeProvider>
  )
}
