import { RxDragHandleHorizontal } from 'react-icons/rx';
import { Spacer, Button } from '@nextui-org/react';
import { MdDeleteOutline } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { BiSolidEdit } from 'react-icons/bi';
import React from 'react';

import * as builtinServices from '../../../../../../services/tts';

export default function ServiceItem(props) {
    const { name, deleteService, setConfigName, onConfigOpen, pluginList, ...drag } = props;
    const serviceType = name.startsWith('plugin') ? 'plugin' : 'builtin';
    const { t } = useTranslation();

    return serviceType === 'plugin' && !(name in pluginList) ? (
        <></>
    ) : (
        <div className='bg-content2 rounded-md px-[10px] py-[20px] flex justify-between'>
            <div className='flex'>
                <div
                    {...drag}
                    className='text-2xl my-auto'
                >
                    <RxDragHandleHorizontal />
                </div>

                <Spacer x={2} />
                {serviceType === 'builtin' && (
                    <>
                        <img
                            src={`${builtinServices[name].info.icon}`}
                            className='h-[24px] w-[24px] my-auto'
                            draggable={false}
                        />
                        <Spacer x={2} />
                        <h2 className='my-auto'>{t(`services.tts.${name}.title`)}</h2>
                    </>
                )}
                {serviceType === 'plugin' && (
                    <>
                        <img
                            src={pluginList[name].icon}
                            className='h-[24px] w-[24px] my-auto'
                            draggable={false}
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
                    onPress={() => {
                        deleteService(name);
                    }}
                >
                    <MdDeleteOutline className='text-2xl' />
                </Button>
            </div>
        </div>
    );
}
