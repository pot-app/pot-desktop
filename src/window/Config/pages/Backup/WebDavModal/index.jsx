import { Modal, ModalContent, ModalHeader, ModalBody, Button } from '@nextui-org/react';
import { writeTextFile, BaseDirectory } from '@tauri-apps/api/fs';
import React, { useEffect, useState } from 'react';
import { MdDeleteOutline } from 'react-icons/md';
import toast, { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { invoke } from '@tauri-apps/api';

import { useToastStyle } from '../../../../../hooks';
import { store } from '../../../../../utils/store';

export default function WebDavModal(props) {
    const { isOpen, onOpenChange, url, username, password } = props;
    const [webdavList, setWebdavList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState([]);

    const { t } = useTranslation();
    const toastStyle = useToastStyle();

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            invoke('backup_list', {
                url,
                username,
                password,
            }).then(
                (v) => {
                    let backup_list = JSON.parse(v);
                    backup_list = backup_list.filter((item) => {
                        return item.hasOwnProperty('File');
                    });
                    setWebdavList(backup_list);
                    setDownloading(
                        backup_list.map(() => {
                            return false;
                        })
                    );
                    setLoading(false);
                },
                (e) => {
                    toast.error(e.toString(), { style: toastStyle });
                    setLoading(false);
                }
            );
        }
    }, [isOpen]);

    const getBackup = async (name, onClose) => {
        invoke('get_backup', {
            url,
            username,
            password,
            name,
        }).then(
            async (v) => {
                setDownloading(false);
                await writeTextFile('config.json', v, { dir: BaseDirectory.AppConfig });
                await store.load();
                toast.success(t('config.backup.load_success'), { style: toastStyle });
                onClose();
            },
            (e) => {
                setDownloading(
                    downloading.map(() => {
                        return false;
                    })
                );
                toast.error(e.toString(), { style: toastStyle });
                onClose();
            }
        );
    };
    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            scrollBehavior='inside'
        >
            <Toaster />
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader />
                        <ModalBody>
                            {loading ? (
                                <h2>Loading</h2>
                            ) : webdavList.length === 0 ? (
                                <h2>Empty</h2>
                            ) : (
                                <div>
                                    {webdavList.map((file, index) => {
                                        return (
                                            <div className='flex justify-between'>
                                                <Button
                                                    fullWidth
                                                    variant='flat'
                                                    className='mb-[8px] mr-[8px]'
                                                    isLoading={downloading[index]}
                                                    key={file.File.href}
                                                    onPress={async () => {
                                                        setDownloading(
                                                            downloading.map((v, i) => {
                                                                if (i === index) {
                                                                    return true;
                                                                } else {
                                                                    return false;
                                                                }
                                                            })
                                                        );
                                                        await getBackup(
                                                            file.File.href.split('/').slice(-1)[0],
                                                            onClose
                                                        );
                                                    }}
                                                >
                                                    {file.File.href.split('/').slice(-1)[0]}
                                                </Button>
                                                <Button
                                                    isIconOnly
                                                    color='danger'
                                                    variant='flat'
                                                    onPress={() => {
                                                        invoke('delete_backup', {
                                                            url,
                                                            username,
                                                            password,
                                                            name: file.File.href.split('/').slice(-1)[0],
                                                        }).then(
                                                            () => {
                                                                setWebdavList(
                                                                    webdavList.filter((v, i) => {
                                                                        return i !== index;
                                                                    })
                                                                );
                                                            },
                                                            (e) => {
                                                                toast.error(e.toString(), { style: toastStyle });
                                                            }
                                                        );
                                                    }}
                                                >
                                                    <MdDeleteOutline />
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
