import React from 'react'
import { Card } from '@mui/material';
import './style.css'

export default function ConfigList(props) {
    const { label, children } = props;
    return (
        <Card className="configlist">
            <h2 style={{ color: '#1677ff', textAlign: 'center' }}>{label}</h2>
            <div children={children} />
        </Card>

    )
}
