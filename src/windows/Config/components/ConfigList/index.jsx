import React from 'react';
import { Card } from '@mui/material';
import './style.css';

export default function ConfigList(props) {
    const { label, children } = props;
    return (
        <Card className='configlist'>
            <h2 className='list-title'>{label}</h2>
            <div children={children} />
        </Card>
    );
}
