import React from 'react';
import { CardHeader, Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@nextui-org/react';
import { BiCollapseVertical, BiExpandVertical } from 'react-icons/bi';
import PulseLoader from 'react-spinners/PulseLoader';
import { semanticColors } from '@nextui-org/theme';
import { useTheme } from 'next-themes';
import { getDisplayInstanceName, getServiceName, INSTANCE_NAME_CONFIG_KEY, whetherPluginService } from '../../../../utils/service_instance';
import * as builtinServices from '../../../../services/translate';

function serviceIcon(instanceKey, pluginList) {
    const key = getServiceName(instanceKey);
    if (whetherPluginService(instanceKey)) return pluginList['translate']?.[key]?.icon;
    return builtinServices[key]?.info?.icon;
}

function serviceLabel(instanceKey, pluginList, serviceInstanceConfigMap, t) {
    const key = getServiceName(instanceKey);
    const nameFn = () => whetherPluginService(instanceKey)
        ? pluginList['translate']?.[key]?.display
        : t(`services.translate.${key}.title`);
    return getDisplayInstanceName(
        (serviceInstanceConfigMap[instanceKey] ?? {})[INSTANCE_NAME_CONFIG_KEY],
        nameFn,
    );
}

export default function ServiceSelector({
    currentKey, onChange,
    instanceList, pluginList, serviceInstanceConfigMap, t,
    isLoading,
    hide, onToggleHide, dragProps,
}) {
    const theme = useTheme();

    return (
        <div {...dragProps}>
            <CardHeader
                className={`flex justify-between py-1 px-0 bg-content2 h-[30px] ${
                    hide ? 'rounded-[10px]' : 'rounded-t-[10px]'
                }`}
            >
            <div className='flex'>
                <Dropdown>
                    <DropdownTrigger>
                        <Button size='sm' variant='solid' className='bg-transparent'
                            startContent={
                                <img src={serviceIcon(currentKey, pluginList)} className='h-[20px] my-auto' />
                            }
                        >
                            <div className='my-auto'>{serviceLabel(currentKey, pluginList, serviceInstanceConfigMap, t)}</div>
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                        aria-label='translate service'
                        className='max-h-[40vh] overflow-y-auto'
                        onAction={(key) => onChange(key)}
                    >
                        {instanceList.map((instanceKey) => (
                            <DropdownItem key={instanceKey}
                                startContent={
                                    <img src={serviceIcon(instanceKey, pluginList)} className='h-[20px] my-auto' />
                                }
                            >
                                {serviceLabel(instanceKey, pluginList, serviceInstanceConfigMap, t)}
                            </DropdownItem>
                        ))}
                    </DropdownMenu>
                </Dropdown>
                <PulseLoader
                    loading={isLoading}
                    color={theme.theme === 'dark' ? semanticColors.dark.default[500] : semanticColors.light.default[500]}
                    size={8}
                    cssOverride={{ display: 'inline-block', margin: 'auto', marginLeft: '20px' }}
                />
            </div>
            <Button size='sm' isIconOnly variant='light' className='h-[20px] w-[20px]'
                onPress={onToggleHide}
            >
                {hide ? <BiExpandVertical className='text-[16px]' /> : <BiCollapseVertical className='text-[16px]' />}
            </Button>
            </CardHeader>
        </div>
    );
}
