import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@nextui-org/react';
import { removeDir, BaseDirectory } from '@tauri-apps/api/fs';
import toast, { Toaster } from 'react-hot-toast';
import { MdDeleteOutline } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { open } from '@tauri-apps/api/dialog';
import { invoke } from '@tauri-apps/api';
import React, { useState } from 'react';
import { useAtomValue } from 'jotai';

import { useToastStyle } from '../../../../../../hooks';
import { pluginListAtom } from '..';

export default function SelectPluginModal(props) {
    const { isOpen, onOpenChange, setConfigName, onConfigOpen, getPluginList } = props;
    const [installing, setInstalling] = useState(false);
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
                                    <div
                                        className='flex justify-between'
                                        key={x}
                                    >
                                        <Button
                                            fullWidth
                                            className='mr-[8px]'
                                            onPress={() => {
                                                setConfigName(x);
                                                onConfigOpen();
                                            }}
                                        >
                                            <div className='w-full'>{pluginList[x].display}</div>
                                        </Button>
                                        <Button
                                            isIconOnly
                                            color='danger'
                                            variant='flat'
                                            onPress={() => {
                                                removeDir(`plugins/recognize/${x}`, {
                                                    dir: BaseDirectory.AppConfig,
                                                    recursive: true,
                                                }).then(
                                                    (v) => {
                                                        toast.success(t('config.service.uninstall_success'), {
                                                            style: toastStyle,
                                                        });
                                                        getPluginList();
                                                    },
                                                    (e) => {
                                                        toast.error(e.toString(), { style: toastStyle });
                                                    }
                                                );
                                            }}
                                        >
                                            <MdDeleteOutline className='text-xl' />
                                        </Button>
                                    </div>
                                );
                            })}
                            <div>
                                <Button
                                    fullWidth
                                    isLoading={installing}
                                    color='secondary'
                                    variant='flat'
                                    onPress={async () => {
                                        setInstalling(true);
                                        const selected = await open({
                                            multiple: true,
                                            directory: false,
                                            filters: [
                                                {
                                                    name: '*.potext',
                                                    extensions: ['potext'],
                                                },
                                            ],
                                        });
                                        if (selected !== null) {
                                            invoke('install_plugin', {
                                                pathList: selected,
                                                pluginType: 'recognize',
                                            }).then(
                                                (count) => {
                                                    setInstalling(false);
                                                    toast.success('Installed ' + count + ' plugins', {
                                                        style: toastStyle,
                                                    });
                                                    getPluginList();
                                                },
                                                (e) => {
                                                    setInstalling(false);
                                                    toast.error(e.toString(), { style: toastStyle });
                                                }
                                            );
                                        } else {
                                            setInstalling(false);
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
