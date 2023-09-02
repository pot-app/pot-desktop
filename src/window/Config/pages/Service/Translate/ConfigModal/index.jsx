import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Spacer } from '@nextui-org/react';
import { appConfigDir, join } from '@tauri-apps/api/path';
import React, { useEffect, useState } from 'react';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';

import * as buildinServices from '../../../../../../services/translate';
import { PluginConfig } from '../PluginConfig';
import { pluginListAtom } from '..';

export default function ConfigModal(props) {
    const { isOpen, onOpenChange, name, updateServiceList } = props;
    const [pluginImageUrl, setPluginImageUrl] = useState('');
    const serviceType = name.startsWith('[plugin]') ? 'plugin' : 'buildin';
    const pluginList = useAtomValue(pluginListAtom);
    const { t } = useTranslation();
    const ConfigComponent = name.startsWith('[plugin]') ? PluginConfig : buildinServices[name].Config;

    useEffect(() => {
        if (serviceType === 'buildin' || !pluginList) return;
        appConfigDir().then((appConfigDirPath) => {
            join(appConfigDirPath, `/plugins/translate/${name}/${pluginList[name].icon}`).then((filePath) => {
                setPluginImageUrl(convertFileSrc(filePath));
            });
        });
    }, [pluginList]);

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            scrollBehavior='inside'
        >
            <ModalContent className='max-h-[75vh]'>
                {(onClose) => (
                    <>
                        <ModalHeader>
                            {serviceType === 'buildin' && (
                                <>
                                    <img
                                        src={buildinServices[name].info.icon}
                                        className='h-[24px] w-[24px] my-auto'
                                    />
                                    <Spacer x={2} />
                                    {t(`services.translate.${name}.title`)}
                                </>
                            )}
                            {serviceType === 'plugin' && (
                                <>
                                    {pluginImageUrl !== '' && (
                                        <img
                                            src={pluginImageUrl}
                                            className='h-[24px] w-[24px] my-auto'
                                        />
                                    )}

                                    <Spacer x={2} />
                                    {`${pluginList[name].display} [${t('common.plugin')}]`}
                                </>
                            )}
                        </ModalHeader>
                        <ModalBody>
                            <ConfigComponent
                                name={name}
                                updateServiceList={updateServiceList}
                                onClose={onClose}
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                color='danger'
                                variant='light'
                                onClick={onClose}
                            >
                                {t('common.cancel')}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
