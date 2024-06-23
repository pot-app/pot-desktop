import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@nextui-org/react';
import { removeDir, BaseDirectory } from '@tauri-apps/api/fs';
import { open as openInBrowser } from '@tauri-apps/api/shell';
import toast, { Toaster } from 'react-hot-toast';
import { MdDeleteOutline } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { open } from '@tauri-apps/api/dialog';
import { invoke } from '@tauri-apps/api';
import React, { useState } from 'react';

import { createServiceInstanceKey } from '../../../../../utils/service_instance';
import { useToastStyle } from '../../../../../hooks';
import { emit } from '@tauri-apps/api/event';

export default function SelectPluginModal(props) {
    const { isOpen, onOpenChange, setCurrentConfigKey, onConfigOpen, pluginType, pluginList, deleteService } = props;
    const [installing, setInstalling] = useState(false);
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
                            {Object.keys(pluginList).length === 0 && (
                                <Button
                                    fullWidth
                                    variant='flat'
                                    onPress={() => {
                                        openInBrowser('http://pot-app.com/plugin.html');
                                    }}
                                >
                                    <div className='w-full'>{t('config.service.view_plugin_list')}</div>
                                </Button>
                            )}

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
                                                setCurrentConfigKey(createServiceInstanceKey(x));
                                                onConfigOpen();
                                            }}
                                            startContent={
                                                <img
                                                    src={pluginList[x].icon}
                                                    className='h-[24px] w-[24px] my-auto'
                                                />
                                            }
                                        >
                                            <div className='w-full'>{pluginList[x].display}</div>
                                        </Button>
                                        <Button
                                            isIconOnly
                                            color='danger'
                                            variant='flat'
                                            onPress={() => {
                                                removeDir(`plugins/${pluginType}/${x}`, {
                                                    dir: BaseDirectory.AppConfig,
                                                    recursive: true,
                                                }).then(
                                                    (v) => {
                                                        toast.success(t('config.service.uninstall_success'), {
                                                            style: toastStyle,
                                                        });
                                                        deleteService(x);
                                                        emit('reload_plugin_list');
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
                                            }).then(
                                                (count) => {
                                                    setInstalling(false);
                                                    toast.success('Installed ' + count + ' plugins', {
                                                        style: toastStyle,
                                                    });
                                                    emit('reload_plugin_list');
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
                                onPress={onClose}
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
