import React from 'react';
import { Button, ButtonGroup, Tooltip } from '@nextui-org/react';
import { HiOutlineVolumeUp } from 'react-icons/hi';
import { MdContentCopy } from 'react-icons/md';
import { TbTransformFilled } from 'react-icons/tb';
import { GiCycle } from 'react-icons/gi';
import toast, { Toaster } from 'react-hot-toast';
import { getServiceName, getServiceSouceType, ServiceSourceType } from '../../../../utils/service_instance';
import { invoke_plugin } from '../../../../utils/invoke_plugin';
import * as builtinCollectionServices from '../../../../services/collection';

export default function TranslateActions({
    result, error, t,
    handleSpeak, writeText, translateBack,
    currentTranslateServiceInstanceKey,
    clearError, setResult, translate,
    collectionServiceList, sourceText, serviceInstanceConfigMap, pluginList,
    toastStyle,
}) {
    const isString = typeof result === 'string';
    const hasResult = isString && result !== '';

    return (
        <>
            <Toaster />
            <ButtonGroup>
                <Tooltip content={t('translate.speak')}>
                    <Button isIconOnly variant='light' size='sm'
                        isDisabled={!hasResult}
                        onPress={() => handleSpeak().catch((e) => toast.error(e.toString(), { style: toastStyle }))}
                    >
                        <HiOutlineVolumeUp className='text-[16px]' />
                    </Button>
                </Tooltip>
                <Tooltip content={t('translate.copy')}>
                    <Button isIconOnly variant='light' size='sm'
                        isDisabled={!hasResult}
                        onPress={() => writeText(result)}
                    >
                        <MdContentCopy className='text-[16px]' />
                    </Button>
                </Tooltip>
                <Tooltip content={t('translate.translate_back')}>
                    <Button isIconOnly variant='light' size='sm'
                        isDisabled={!hasResult}
                        onPress={() => translateBack(result, currentTranslateServiceInstanceKey)}
                    >
                        <TbTransformFilled className='text-[16px]' />
                    </Button>
                </Tooltip>
                <Tooltip content={t('translate.retry')}>
                    <Button isIconOnly variant='light' size='sm'
                        className={`${error === '' && 'hidden'}`}
                        onPress={() => { clearError(); setResult(''); translate(currentTranslateServiceInstanceKey); }}
                    >
                        <GiCycle className='text-[16px]' />
                    </Button>
                </Tooltip>
                {collectionServiceList?.map((instanceKey) => {
                    const src = getServiceName(instanceKey);
                    return (
                        <Button key={instanceKey} isIconOnly variant='light' size='sm'
                            onPress={async () => {
                                try {
                                    if (getServiceSouceType(instanceKey) === ServiceSourceType.PLUGIN) {
                                        const [func, utils] = await invoke_plugin('collection', src);
                                        await func(sourceText.trim(), result.toString(), {
                                            config: serviceInstanceConfigMap[instanceKey], utils,
                                        });
                                    } else {
                                        await builtinCollectionServices[src].collection(
                                            sourceText, result,
                                            { config: serviceInstanceConfigMap[instanceKey] },
                                        );
                                    }
                                    toast.success(t('translate.add_collection_success'), { style: toastStyle });
                                } catch (e) {
                                    toast.error(e.toString(), { style: toastStyle });
                                }
                            }}
                        >
                            <img
                                src={
                                    getServiceSouceType(instanceKey) === ServiceSourceType.PLUGIN
                                        ? pluginList['collection']?.[src]?.icon
                                        : builtinCollectionServices[src]?.info?.icon
                                }
                                className='h-[16px] w-[16px]'
                            />
                        </Button>
                    );
                })}
            </ButtonGroup>
        </>
    );
}
