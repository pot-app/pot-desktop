import { RxDragHandleHorizontal } from 'react-icons/rx';
import { Spacer, Button, Switch } from '@nextui-org/react';
import { MdDeleteOutline } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { BiSolidEdit } from 'react-icons/bi';
import React from 'react';

import * as buildinServices from '../../../../../../services/translate';
import { useConfig } from '../../../../../../hooks';

export default function ServiceItem(props) {
    const { name, deleteService, setConfigName, onConfigOpen, pluginList, ...drag } = props;
    const serviceType = name.startsWith('[plugin]') ? 'plugin' : 'buildin';
    const { t } = useTranslation();
    const [serviceConfig, setServiceConfig] = useConfig(name, {});

    return serviceType === 'plugin' && !(name in pluginList) ? (
        <></>
    ) : (
        serviceConfig !== null && (
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
                                draggable={false}
                            />
                            <Spacer x={2} />
                            <h2 className='my-auto'>{t(`services.translate.${name}.title`)}</h2>
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
                    <Switch
                        size='sm'
                        isSelected={serviceConfig['enable'] ?? true}
                        onValueChange={(v) => {
                            setServiceConfig({ ...serviceConfig, enable: v });
                        }}
                    />
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
        )
    );
}
