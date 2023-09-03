import { RxDragHandleHorizontal } from 'react-icons/rx';
import { Spacer, Button } from '@nextui-org/react';
import { MdDeleteOutline } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { BiSolidEdit } from 'react-icons/bi';
import { useAtomValue } from 'jotai';
import React from 'react';

import { pluginListAtom } from '..';

export default function ServiceItem(props) {
    const { name, deleteService, setConfigName, onConfigOpen, ...drag } = props;
    const pluginList = useAtomValue(pluginListAtom);
    const serviceType = name.startsWith('[plugin]') ? 'plugin' : 'buildin';

    const { t } = useTranslation();

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
                {serviceType === 'buildin' && <h2 className='my-auto'>{t(`services.recognize.${name}.title`)}</h2>}
                {serviceType === 'plugin' && name in pluginList && (
                    <h2 className='my-auto'>{`${pluginList[name].display} [${t('common.plugin')}]`}</h2>
                )}
                <h2 className='my-auto'>{t(`services.recognize.${name}.title`)}</h2>
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
