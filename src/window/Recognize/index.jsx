import React from 'react';

import WindowControl from '../../components/WindowControl';
import { osType } from '../../utils/env';
import ControlArea from './ControlArea';
import ImageArea from './ImageArea';
import TextArea from './TextArea';

export default function Recognize() {
    return (
        <div className={`bg-background h-screen ${osType === 'Linux' && 'rounded-[10px]'}`}>
            <div
                data-tauri-drag-region='true'
                style={{
                    top: '5px',
                    left: '5px',
                    right: '5px',
                    height: '30px',
                    position: 'fixed',
                }}
            />
            <div className='h-[35px] flex justify-end'>{osType !== 'Darwin' && <WindowControl />}</div>
            <div className='h-[calc(100vh-85px)] grid grid-cols-2'>
                <ImageArea />
                <TextArea />
            </div>
            <div className='h-[50px]'>
                <ControlArea />
            </div>
        </div>
    );
}
