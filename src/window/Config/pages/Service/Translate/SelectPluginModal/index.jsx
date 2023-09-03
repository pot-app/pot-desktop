import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@nextui-org/react';
import toast, { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { open } from '@tauri-apps/api/dialog';
import { invoke } from '@tauri-apps/api';
import { useAtomValue } from 'jotai';
import React from 'react';

import { useToastStyle } from '../../../../../../hooks';
import { pluginListAtom } from '..';

export default function SelectPluginModal(props) {
    const { isOpen, onOpenChange, setConfigName, onConfigOpen } = props;
    const pluginList = useAtomValue(pluginListAtom);
    const { t } = useTranslation();
    const toastStyle = useToastStyle();

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            scrollBehavior='inside'
        >
            <Toaster />
            <ModalContent className='max-h-[80vh]'>
                {(onClose) => (
                    <>
                        <ModalHeader>{t('config.service.add_service')}</ModalHeader>
                        <ModalBody>
                            {Object.keys(pluginList).map((x) => {
                                return (
                                    <div key={x}>
                                        <Button
                                            fullWidth
                                            onPress={() => {
                                                setConfigName(x);
                                                onConfigOpen();
                                            }}
                                        >
                                            <div className='w-full'>{pluginList[x].display}</div>
                                        </Button>
                                    </div>
                                );
                            })}
                            <div>
                                <Button
                                    fullWidth
                                    color='secondary'
                                    variant='flat'
                                    onPress={async () => {
                                        const selected = await open({
                                            multiple: true,
                                            directory: false,
                                            filters: [
                                                {
                                                    name: 'Plugin',
                                                    extensions: ['zip'],
                                                },
                                            ],
                                        });
                                        if (selected !== null) {
                                            invoke('install_plugin', {
                                                pathList: selected,
                                                pluginType: 'translate',
                                            }).then(
                                                (count) => {
                                                    toast.success('Installed ' + count + ' plugins', {
                                                        style: toastStyle,
                                                    });
                                                },
                                                (e) => {
                                                    toast.error(e.toString(), { style: toastStyle });
                                                }
                                            );
                                        }
                                    }}
                                >
                                    <div className='w-full'>{t('config.service.install_plugin')}</div>
                                </Button>
                            </div>
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
