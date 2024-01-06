import { Modal, ModalContent, ModalHeader, ModalBody, Button, Skeleton } from '@nextui-org/react';
import React, { useEffect, useState } from 'react';
import { MdDeleteOutline } from 'react-icons/md';
import toast, { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { useToastStyle } from '../../../../../hooks';
import * as aliyun from '../utils/aliyun';

export default function AliyunModal(props) {
    const { isOpen, onOpenChange, accessToken, refreshToken } = props;
    const [fileList, setFileList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState([]);

    const { t } = useTranslation();
    const toastStyle = useToastStyle();

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            aliyun.list(accessToken).then(
                (v) => {
                    setFileList(v);
                    setDownloading(
                        v.map(() => {
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
        aliyun.get(accessToken, name).then(
            () => {
                setDownloading(
                    downloading.map(() => {
                        return false;
                    })
                );
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
            <ModalContent className='max-h-[80vh]'>
                {(onClose) => (
                    <>
                        <ModalHeader>{t('config.backup.list')}</ModalHeader>
                        <ModalBody>
                            {loading ? (
                                <div className='space-y-3'>
                                    <Skeleton className='w-4/5 rounded-lg'>
                                        <div className='h-3 w-4/5 rounded-lg bg-default-200'></div>
                                    </Skeleton>
                                    <Skeleton className='w-3/5 rounded-lg'>
                                        <div className='h-3 w-3/5 rounded-lg bg-default-200'></div>
                                    </Skeleton>
                                </div>
                            ) : fileList.length === 0 ? (
                                <h2>{t('config.backup.empty')}</h2>
                            ) : (
                                <div>
                                    {fileList.map((file, index) => {
                                        return (
                                            <div
                                                className='flex justify-between'
                                                key={file}
                                            >
                                                <Button
                                                    fullWidth
                                                    variant='flat'
                                                    className='mb-[8px] mr-[8px]'
                                                    isLoading={downloading[index]}
                                                    onPress={async () => {
                                                        setDownloading(
                                                            downloading.map((_, i) => {
                                                                return i === index;
                                                            })
                                                        );
                                                        await getBackup(file, onClose);
                                                    }}
                                                >
                                                    {file}
                                                </Button>
                                                <Button
                                                    isIconOnly
                                                    color='danger'
                                                    variant='flat'
                                                    onPress={() => {
                                                        aliyun.remove(accessToken, file).then(
                                                            () => {
                                                                setFileList(
                                                                    fileList.filter((_, i) => {
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
                                                    <MdDeleteOutline className='text-xl' />
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
