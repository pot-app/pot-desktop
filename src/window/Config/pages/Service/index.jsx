import React from 'react';
import { Tabs, Tab } from '@nextui-org/react';

import Collection from './Collection';
import Recognize from './Recognize';
import Translate from './Translate';
import Tts from './Tts';

export default function Service() {
    return (
        <Tabs className='flex justify-center max-h-[calc(100%-40px)] overflow-y-auto'>
            <Tab
                key='translate'
                title='翻译'
            >
                <Translate />
            </Tab>
            <Tab
                key='tts'
                title='语音合成'
            >
                <Tts />
            </Tab>
            <Tab
                key='recognize'
                title='文字识别'
            >
                <Recognize />
            </Tab>
            <Tab
                key='collection'
                title='生词本'
            >
                <Collection />
            </Tab>
        </Tabs>
    );
}
