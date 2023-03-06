import { createTheme } from '@mui/material/styles';

export const light = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1976d2'
        },
        background: {
            default: '#ffffff',
            paper: '#eeeeee'
        },
        text: {
            primary: '#656769',
            icon: '#656769',
        },
        action: {
            active: '#656769'
        }
    },
    shape: {
        borderRadius: 10
    }
});

export const dark = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#3faaf2'
        },
        background: {
            default: '#232323',
            paper: '#232323'
        },
        text: {
            primary: '#bab9ba',
            icon: '#bab9ba',
        },
        action: {
            active: '#bab9ba'
        }
    },
    shape: {
        borderRadius: 10
    }
});