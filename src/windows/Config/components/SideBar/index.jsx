import { useNavigate, useLocation } from 'react-router-dom';
import ExtensionRoundedIcon from '@mui/icons-material/ExtensionRounded';
import KeyboardRoundedIcon from '@mui/icons-material/KeyboardRounded';
import WidgetsRoundedIcon from '@mui/icons-material/WidgetsRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import { Box, Button } from '@mui/material';
import React from 'react';
import './style.css';

export default function SideBar() {
    const navigate = useNavigate();
    const location = useLocation();

    function setStyle(pathname) {
        return location.pathname.includes(pathname) ? "contained" : "text"
    }

    return (
        <Box className="side-bar">
            <Button
                fullWidth
                size='large'
                variant={setStyle("/application")}
                startIcon={<WidgetsRoundedIcon />}
                onClick={() => { navigate('/application') }}
            >应用设置</Button>
            <Button
                fullWidth
                size='large'
                variant={setStyle("/shortcut")}
                startIcon={<KeyboardRoundedIcon />}
                onClick={() => { navigate('/shortcut') }}
            >热键设置</Button>
            <Button
                fullWidth
                size='large'
                variant={setStyle("/interface")}
                startIcon={<ExtensionRoundedIcon />}
                onClick={() => { navigate('/interface') }}
            >接口设置</Button>
            <Button
                fullWidth
                size='large'
                variant={setStyle("/about")}
                startIcon={<InfoRoundedIcon />}
                onClick={() => { navigate('/about') }}
            >关于应用</Button>
        </Box >
    )
}
