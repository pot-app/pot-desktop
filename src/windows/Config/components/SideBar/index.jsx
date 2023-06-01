import PhonelinkRoundedIcon from '@mui/icons-material/PhonelinkRounded';
import ExtensionRoundedIcon from '@mui/icons-material/ExtensionRounded';
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';
import KeyboardRoundedIcon from '@mui/icons-material/KeyboardRounded';
import WidgetsRoundedIcon from '@mui/icons-material/WidgetsRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Button } from '@mui/material';
import React from 'react';
import './style.css';

export default function SideBar() {
    const navigate = useNavigate();
    const location = useLocation();

    const { t } = useTranslation();

    function setStyle(pathname) {
        return location.pathname.includes(pathname) ? 'contained' : 'text';
    }

    return (
        <Box className='side-bar'>
            <Button
                fullWidth
                size='large'
                variant={setStyle('/application')}
                startIcon={<WidgetsRoundedIcon />}
                onClick={() => {
                    navigate('/application');
                }}
            >
                <Box sx={{ width: '100%' }}>{t('config.app.label')}</Box>
            </Button>
            <Button
                fullWidth
                size='large'
                variant={setStyle('/translate')}
                startIcon={<TranslateRoundedIcon />}
                onClick={() => {
                    navigate('/translate');
                }}
            >
                <Box sx={{ width: '100%' }}>{t('config.translate.label')}</Box>
            </Button>
            <Button
                fullWidth
                size='large'
                variant={setStyle('/external')}
                startIcon={<PhonelinkRoundedIcon />}
                onClick={() => {
                    navigate('/external');
                }}
            >
                <Box sx={{ width: '100%' }}>{t('config.external.label')}</Box>
            </Button>
            <Button
                fullWidth
                size='large'
                variant={setStyle('/shortcut')}
                startIcon={<KeyboardRoundedIcon />}
                onClick={() => {
                    navigate('/shortcut');
                }}
            >
                <Box sx={{ width: '100%' }}>{t('config.shortcut.label')}</Box>
            </Button>
            <Button
                fullWidth
                size='large'
                variant={setStyle('/interface')}
                startIcon={<ExtensionRoundedIcon />}
                onClick={() => {
                    navigate('/interface');
                }}
            >
                <Box sx={{ width: '100%' }}>{t('config.interface.label')}</Box>
            </Button>
            <Button
                fullWidth
                size='large'
                variant={setStyle('/about')}
                startIcon={<InfoRoundedIcon />}
                onClick={() => {
                    navigate('/about');
                }}
            >
                <Box sx={{ width: '100%' }}>{t('config.about.label')}</Box>
            </Button>
        </Box>
    );
}
