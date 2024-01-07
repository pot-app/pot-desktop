import { readTextFile, BaseDirectory } from '@tauri-apps/api/fs';
import { DropdownTrigger } from '@nextui-org/react';
import { useDisclosure } from '@nextui-org/react';
import toast, { Toaster } from 'react-hot-toast';
import { DropdownMenu } from '@nextui-org/react';
import { DropdownItem } from '@nextui-org/react';
import { useTranslation } from 'react-i18next';
import { CardBody } from '@nextui-org/react';
import { Dropdown } from '@nextui-org/react';
import { warn } from 'tauri-plugin-log-api';
import { Button } from '@nextui-org/react';
import { Input } from '@nextui-org/react';
import { Card } from '@nextui-org/react';
import { Avatar, Tooltip } from '@nextui-org/react';
import React, { useEffect, useState } from 'react';

import { useConfig, useToastStyle } from '../../../../hooks';
import { osType } from '../../../../utils/env';
import * as webdav from './utils/webdav';
import WebDavModal from './WebDavModal';
import AliyunModal from './AliyunModal';
import * as local from './utils/local';
import * as aliyun from './utils/aliyun';

let refreshTimer = null;

export default function Backup() {
    const [backupType, setBackupType] = useConfig('backup_type', 'webdav');
    const [davUserName, setDavUserName] = useConfig('webdav_username', '');
    const [davPassword, setDavPassword] = useConfig('webdav_password', '');
    const [davUrl, setDavUrl] = useConfig('webdav_url', '');
    const [aliyunQrCodeUrl, setAliyunQrCodeUrl] = useState('');
    const [aliyunUserInfo, setAliyunUserInfo] = useState(null);
    const [aliyunAccessToken, setAliyunAccessToken] = useConfig('aliyun_access_token', '');
    // const [aliyunRefreshToken, setAliyunRefreshToken] = useConfig('aliyun_refresh_token', '');
    const {
        isOpen: isWebDavListOpen,
        onOpen: onWebDavListOpen,
        onOpenChange: onWebDavListOpenChange,
    } = useDisclosure();
    const {
        isOpen: isAliyunListOpen,
        onOpen: onAliyunListOpen,
        onOpenChange: onAliyunListOpenChange,
    } = useDisclosure();
    const [uploading, setUploading] = useState(false);
    const toastStyle = useToastStyle();
    const { t } = useTranslation();

    const onBackup = async () => {
        setUploading(true);
        const time = new Date();
        const fileName = `${osType}-${time.getFullYear()}-${
            time.getMonth() + 1
        }-${time.getDate()}-${time.getHours()}-${time.getMinutes()}-${time.getSeconds()}`;

        let result;
        switch (backupType) {
            case 'webdav':
                result = webdav.backup(davUrl, davUserName, davPassword, fileName + '.zip');
                break;
            case 'local':
                result = local.backup(fileName);
                break;
            case 'aliyun':
                if (aliyunAccessToken === '') {
                    toast.error(t('config.backup.aliyun_login_first'), { style: toastStyle });
                    setUploading(false);
                } else {
                    result = aliyun.backup(aliyunAccessToken, fileName + '.zip');
                }
                break;
            default:
                warn('Unknown backup type');
                return;
        }
        result.then(
            () => {
                toast.success(t('config.backup.backup_success'), { style: toastStyle });
                setUploading(false);
            },
            (e) => {
                toast.error(e.toString(), { style: toastStyle });
                setUploading(false);
            }
        );
    };

    const onBackupListOpen = () => {
        switch (backupType) {
            case 'webdav':
                onWebDavListOpen();
                break;
            case 'local':
                local.get().then(
                    () => {
                        toast.success(t('config.backup.load_success'), { style: toastStyle });
                    },
                    (e) => {
                        toast.error(e.toString(), { style: toastStyle });
                    }
                );
                break;
            case 'aliyun':
                if (aliyunAccessToken === '') {
                    toast.error(t('config.backup.aliyun_login_first'), { style: toastStyle });
                } else {
                    onAliyunListOpen();
                }

                break;
            default:
                warn('Unknown backup type');
        }
    };

    const pollingStatus = async (sid) => {
        refreshTimer = setInterval(async () => {
            try {
                const { status, code } = await aliyun.status(sid);
                switch (status) {
                    case 'QRCodeExpired': {
                        refreshQrCode();
                        break;
                    }
                    case 'LoginSuccess': {
                        clearInterval(refreshTimer);
                        toast.success(t('config.backup.login_success'), { style: toastStyle });
                        const token = await aliyun.accessToken(code);
                        setAliyunAccessToken(token);
                        await refreshUserInfo(token);
                        break;
                    }
                }
            } catch (e) {
                toast.error(e.toString(), { style: toastStyle });
                refreshQrCode();
            }
        }, 2000);
    };

    const refreshQrCode = async () => {
        try {
            const { url, sid } = await aliyun.qrcode();
            setAliyunQrCodeUrl(url);
            if (refreshTimer) {
                clearInterval(refreshTimer);
            }
            pollingStatus(sid);
        } catch (e) {
            setAliyunQrCodeUrl('');
            toast.error(e.toString(), { style: toastStyle });
        }
    };

    const refreshUserInfo = async (token) => {
        try {
            const info = await aliyun.userInfo(token);
            setAliyunQrCodeUrl('');
            setAliyunUserInfo(info);
        } catch (e) {
            toast.error(e.toString(), { style: toastStyle });
            setAliyunAccessToken('');
            refreshQrCode();
        }
    };

    useEffect(() => {
        if (backupType === null || backupType !== 'aliyun') return;
        if (aliyunAccessToken === '') {
            refreshQrCode();
        } else {
            refreshUserInfo(aliyunAccessToken);
        }

        return () => {
            clearInterval(refreshTimer);
        };
    }, [backupType]);

    return (
        <Card className='mb-[10px]'>
            <Toaster />
            <CardBody>
                <div className='config-item'>
                    <h3 className='my-auto'>{t('config.backup.type')}</h3>
                    {backupType !== null && (
                        <Dropdown>
                            <DropdownTrigger>
                                <Button variant='bordered'>{t(`config.backup.${backupType}`)}</Button>
                            </DropdownTrigger>
                            <DropdownMenu
                                aria-label='backup type'
                                onAction={(key) => {
                                    setBackupType(key);
                                }}
                            >
                                <DropdownItem key='webdav'>{t('config.backup.webdav')}</DropdownItem>
                                <DropdownItem key='aliyun'>{t('config.backup.aliyun')}</DropdownItem>
                                <DropdownItem key='local'>{t('config.backup.local')}</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    )}
                </div>
                <div className={backupType !== 'webdav' ? 'hidden' : ''}>
                    <div className='config-item'>
                        <h3 className='my-auto'>{t('config.backup.webdav_url')}</h3>
                        {davUrl !== null && (
                            <Input
                                variant='bordered'
                                value={davUrl}
                                label={t('config.backup.webdav_url')}
                                onValueChange={(v) => {
                                    setDavUrl(v);
                                }}
                                className='max-w-[300px]'
                            />
                        )}
                    </div>
                    <div className='config-item'>
                        <h3 className='my-auto'>{t('config.backup.username')}</h3>
                        {davUserName !== null && (
                            <Input
                                variant='bordered'
                                value={davUserName}
                                label={t('config.backup.username')}
                                onValueChange={(v) => {
                                    setDavUserName(v);
                                }}
                                className='max-w-[300px]'
                            />
                        )}
                    </div>
                    <div className='config-item'>
                        <h3 className='my-auto'>{t('config.backup.password')}</h3>
                        {davPassword !== null && (
                            <Input
                                type='password'
                                variant='bordered'
                                value={davPassword}
                                label={t('config.backup.password')}
                                onValueChange={(v) => {
                                    setDavPassword(v);
                                }}
                                className='max-w-[300px]'
                            />
                        )}
                    </div>
                </div>
                <div className={`flex justify-center ${backupType !== 'aliyun' ? 'hidden' : ''}`}>
                    <img
                        src={aliyunQrCodeUrl}
                        className={`h-[200px] mb-2 ${aliyunQrCodeUrl === '' ? 'hidden' : ''}`}
                    />
                </div>
                <div className={`config-item ${backupType !== 'aliyun' ? 'hidden' : ''}`}>
                    {aliyunUserInfo !== null && (
                        <>
                            <h3 className='my-auto'>{t('config.backup.username')}</h3>

                            <Tooltip
                                content={t('config.backup.logout')}
                                placement='bottom-end'
                            >
                                <Button
                                    variant='light'
                                    onClick={() => {
                                        setAliyunAccessToken('');
                                        // setAliyunRefreshToken('');
                                        setAliyunUserInfo(null);
                                        refreshQrCode();
                                    }}
                                >
                                    <Avatar
                                        src={aliyunUserInfo.avatar}
                                        size='sm'
                                    />
                                    <h3 className='my-auto'>{aliyunUserInfo.name}</h3>
                                </Button>
                            </Tooltip>
                        </>
                    )}
                </div>
                <div className='flex justify-around'>
                    <Button
                        color='success'
                        variant='flat'
                        isLoading={uploading}
                        onPress={onBackup}
                    >
                        {t('config.backup.backup')}
                    </Button>
                    <Button
                        color='secondary'
                        variant='flat'
                        onPress={onBackupListOpen}
                    >
                        {t('config.backup.restore')}
                    </Button>
                </div>
            </CardBody>
            <WebDavModal
                isOpen={isWebDavListOpen}
                onOpenChange={onWebDavListOpenChange}
                url={davUrl}
                username={davUserName}
                password={davPassword}
            />
            <AliyunModal
                isOpen={isAliyunListOpen}
                onOpenChange={onAliyunListOpenChange}
                accessToken={aliyunAccessToken}
                // refreshToken={aliyunRefreshToken}
            />
        </Card>
    );
}
