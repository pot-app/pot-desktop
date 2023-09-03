import { appConfigDir, join } from '@tauri-apps/api/path';
import { RxDragHandleHorizontal } from 'react-icons/rx';
import { Spacer, Button } from '@nextui-org/react';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { MdDeleteOutline } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { BiSolidEdit } from 'react-icons/bi';
import React, { useState, useEffect } from 'react';
import { useAtomValue } from 'jotai';

import * as buildinServices from '../../../../../../services/tts';
import { pluginListAtom } from '..';

export default function ServiceItem(props) {
    const { name, deleteService, setConfigName, onConfigOpen, ...drag } = props;
    const [pluginImageUrl, setPluginImageUrl] = useState('');
    const pluginList = useAtomValue(pluginListAtom);
    const serviceType = name.startsWith('[plugin]') ? 'plugin' : 'buildin';
    const { t } = useTranslation();

    useEffect(() => {
        if (serviceType === 'buildin' || !pluginList) return;
        appConfigDir().then((appConfigDirPath) => {
            if (pluginList[name]) {
                join(appConfigDirPath, `/plugins/tts/${name}/${pluginList[name].icon}`).then((filePath) => {
                    setPluginImageUrl(convertFileSrc(filePath));
                });
            }
        });
    }, [pluginList]);

    return (
        <div className='bg-content2 rounded-md px-[10px] py-[20px] flex justify-between'>
            <div className='flex'>
                <div
                    {...drag}
                    className='text-2xl my-auto'
                >
                    <RxDragHandleHorizontal />
                </div>

                <Spacer x={2} />
                {serviceType === 'buildin' && (
                    <>
                        <img
                            src={`${buildinServices[name].info.icon}`}
                            className='h-[24px] w-[24px] my-auto'
                        />
                        <Spacer x={2} />
                        <h2 className='my-auto'>{t(`services.tts.${name}.title`)}</h2>
                    </>
                )}
                {serviceType === 'plugin' && name in pluginList && (
                    <>
                        <img
                            src={pluginImageUrl}
                            className='h-[24px] w-[24px] my-auto'
                        />
                        <Spacer x={2} />
                        <h2 className='my-auto'>{`${pluginList[name].display} [${t('common.plugin')}]`}</h2>
                    </>
                )}
            </div>
            <div className='flex'>
                <Button
                    isIconOnly
                    size='sm'
                    variant='light'
                    onPress={() => {
                        setConfigName(name);
                        onConfigOpen();
                    }}
                >
                    <BiSolidEdit className='text-2xl' />
                </Button>
                <Spacer x={2} />
                <Button
                    isIconOnly
                    size='sm'
                    variant='light'
                    color='danger'
                    onClick={() => {
                        deleteService(name);
                    }}
                >
                    <MdDeleteOutline className='text-2xl' />
                </Button>
            </div>
        </div>
    );
}
