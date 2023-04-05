import React from 'react';
import { Grid, Box, Card } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import OcrController from './components/OcrController';
import ImageArea from './components/ImageArea';
import TextArea from './components/TextArea';
import { light, dark } from '../themes';
import { get } from './main';
import './style.css';

export default function App() {
  const theme = get('theme') ?? 'auto';
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  return (
    <ThemeProvider theme={theme == 'auto' ? (prefersDarkMode ? dark : light) : (theme == 'dark' ? dark : light)}>
      <CssBaseline />
      <Grid container className='display-area'>
        <Grid item xs={6}>
          <Card className='image-area' >
            <ImageArea />
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card className='text-area' >
            <TextArea />
          </Card>
        </Grid>
      </Grid>
      <Box className='control-area'>
        <OcrController />
      </Box>
    </ThemeProvider>
  )
}
