import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Spacer } from '@nextui-org/react';
import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';

import * as buildinServices from '../../../../../../services/recognize';
import { PluginConfig } from '../PluginConfig';
import { pluginListAtom } from '..';

export default function ConfigModal(props) {
    const { isOpen, onOpenChange, name, updateServiceList } = props;
    const serviceType = name.startsWith('[plugin]') ? 'plugin' : 'buildin';
    const pluginList = useAtomValue(pluginListAtom);
    const { t } = useTranslation();
    const ConfigComponent = name.startsWith('[plugin]') ? PluginConfig : buildinServices[name].Config;

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
                            {serviceType === 'buildin'
                                ? t(`services.recognize.${name}.title`)
                                : `${pluginList[name].display} [${t('common.plugin')}]`}
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
