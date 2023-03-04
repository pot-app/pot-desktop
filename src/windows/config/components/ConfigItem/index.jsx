import React from 'react'
import './style.css'

export default function ConfigItem(props) {
    const { label, children } = props;
    return (
        <>
            <h3 className='item-label'>{label}</h3>
            {children}
        </>
    )
}
