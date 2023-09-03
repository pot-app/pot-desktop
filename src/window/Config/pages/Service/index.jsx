import { useTranslation } from 'react-i18next';
import { Tabs, Tab } from '@nextui-org/react';
import React from 'react';

import Collection from './Collection';
import Recognize from './Recognize';
import Translate from './Translate';
import Tts from './Tts';

export default function Service() {
    const { t } = useTranslation();

    return (
        <Tabs
            disabledKeys={['collection']}
            className='flex justify-center max-h-[calc(100%-40px)] overflow-y-auto'
        >
            <Tab
                key='translate'
                title={t('config.service.translate')}
            >
                <Translate />
            </Tab>
            <Tab
                key='tts'
                title={t('config.service.tts')}
            >
                <Tts />
            </Tab>
            <Tab
                key='recognize'
                title={t('config.service.recognize')}
            >
                <Recognize />
            </Tab>
            <Tab
                key='collection'
                title={t('config.service.collection')}
            >
                <Collection />
            </Tab>
        </Tabs>
    );
}
