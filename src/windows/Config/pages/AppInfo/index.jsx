import { checkUpdate, installUpdate } from '@tauri-apps/api/updater';
import { writeText } from '@tauri-apps/api/clipboard';
import PulseLoader from 'react-spinners/PulseLoader';
import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { ask } from '@tauri-apps/api/dialog';
import { Button, Box } from '@mui/material';
import { app } from '@tauri-apps/api';
import { useAtomValue } from 'jotai';
import ConfigList from '../../components/ConfigList';
import { get, configAtom } from '../../../main';
import './style.css';

export default function AppInfo() {
    const configList = useAtomValue(configAtom);
    const [version, setVersion] = useState('');
    const [tauriVersion, setTauriVersion] = useState('');
    const [checking, setChecking] = useState(false);

    const { t } = useTranslation();
    const theme = useTheme();

    useEffect(() => {
        app.getVersion().then((v) => {
            setVersion(v);
        });
        app.getTauriVersion().then((v) => {
            setTauriVersion(v);
        });
    }, []);

    // 复制内容
    function copy(who) {
        writeText(who).then((_) => {
            toast.success(t('info.writeclipboard'), {
                duration: 500,
                style: {
                    background: theme.palette.background.default,
                    color: theme.palette.text.primary,
                },
            });
        });
    }
    function copyConfig() {
        let config_str = '';
        for (let key of Object.keys(configList)) {
            config_str += `${key} = ${JSON.stringify(configList[key])}\n`;
        }
        copy(config_str);
    }
    function checkUpdateHandler() {
        setChecking(true);
        checkUpdate().then(
            (update) => {
                if (update.shouldUpdate) {
                    ask(update.manifest.body, { title: t('config.about.update'), type: 'info' }).then((install) => {
                        if (install) {
                            toast.promise(
                                installUpdate(),
                                {
                                    loading: t('config.about.downloading'),
                                    error: (err) => t('config.about.updateerror') + `\n${err.toString()}`,
                                    success: t('config.about.updatesuccess'),
                                },
                                {
                                    style: {
                                        background: theme.palette.background.default,
                                        color: theme.palette.text.primary,
                                    },
                                }
                            );
                        }
                    });
                } else {
                    toast.success(t('config.about.latest'), {
                        style: {
                            background: theme.palette.background.default,
                            color: theme.palette.text.primary,
                        },
                    });
                }
                setChecking(false);
            },
            (e) => {
                setChecking(false);
                toast.error(`${t('config.about.checkerror')}\n${e}`, {
                    style: {
                        background: theme.palette.background.default,
                        color: theme.palette.text.primary,
                    },
                });
            }
        );
    }

    return (
        <ConfigList>
            <Toaster />
            <Box className='logo'>
                <img
                    src='icon.png'
                    className='logo'
                    alt='logo'
                />
            </Box>
            <h3>{t('config.about.introduction')}</h3>
            <ul>
                <li>{t('config.about.name')}:&nbsp;&nbsp;pot</li>
                <li>
                    {t('config.about.license')}:&nbsp;&nbsp;
                    <a
                        href='https://github.com/pot-app/pot-desktop/blob/master/LICENSE'
                        target='_blank'
                    >
                        GPL-3.0
                    </a>
                </li>
                <li>
                    {t('config.about.discription')}:&nbsp;&nbsp;{t('config.about.longdiscription')}
                </li>
            </ul>
            <h3>{t('config.about.version')}</h3>
            <ul>
                <li>Pot:&nbsp;&nbsp;{version}</li>
                <li>Tauri:&nbsp;&nbsp;{tauriVersion}</li>
                <li>
                    <Button
                        size='small'
                        onClick={() => copy(`pot:${version}  Tauri:${tauriVersion}`)}
                    >
                        {t('config.about.copy')}
                    </Button>
                </li>
            </ul>
            <Button
                onClick={checkUpdateHandler}
                variant='outlined'
                disabled={checking}
                size='small'
            >
                {t('config.about.checkupdate')}
            </Button>
            <PulseLoader
                loading={checking}
                color={theme.palette.text.primary}
                size={5}
                cssOverride={{
                    display: 'inline-block',
                    margin: 'auto',
                    marginLeft: '8px',
                }}
            />
            &nbsp;
            <a
                href='https://pot-app.com/download'
                target='_blank'
            >
                <Button
                    variant='outlined'
                    size='small'
                >
                    {t('config.about.download')}
                </Button>
            </a>
            &nbsp;
            <Button
                onClick={copyConfig}
                variant='outlined'
                size='small'
            >
                {t('config.about.copyconfig')}
            </Button>
            <h3>{t('config.about.website')}</h3>
            <ul>
                <li>
                    {t('config.about.doc')}:&nbsp;&nbsp;
                    <a
                        href='https://pot-app.com'
                        target='_blank'
                    >
                        https://pot-app.com
                    </a>
                </li>
                <li>
                    Github:&nbsp;&nbsp;
                    <a
                        href='https://github.com/pot-app/pot-desktop'
                        target='_blank'
                    >
                        https://github.com/pot-app/pot-desktop
                    </a>
                </li>
            </ul>
            <h3>{t('config.about.feedback')}</h3>
            <ul>
                <li>
                    {t('config.about.bug')}:&nbsp;&nbsp;
                    <a
                        href='https://github.com/pot-app/pot-desktop/issues'
                        target='_blank'
                    >
                        {t('config.about.issue')}
                    </a>
                </li>
                <li>
                    {t('config.about.feature')}:&nbsp;&nbsp;
                    <a
                        href='https://github.com/pot-app/pot-desktop/issues'
                        target='_blank'
                    >
                        {t('config.about.issue')}
                    </a>
                </li>
                <li>
                    {t('config.about.contact')}:&nbsp;&nbsp;
                    <a
                        href='mailto:support@pot-app.com'
                        target='_blank'
                    >
                        support@pot-app.com
                    </a>
                    <br />
                </li>
            </ul>
            <h3>{t('config.about.community')}</h3>
            <ul>
                <li>
                    {t('config.about.qqchannel')}:&nbsp;&nbsp;
                    <a
                        href='https://pd.qq.com/s/akns94e1r'
                        target='_blank'
                    >
                        pd.qq.com/s/akns94e1r
                    </a>
                </li>
                <li>
                    {t('config.about.qqgroup')}:&nbsp;&nbsp;
                    <a
                        href='https://pot-app.com/img/qq_group.png'
                        target='_blank'
                    >
                        767701966
                    </a>
                </li>
                <li>
                    Telegram:&nbsp;&nbsp;
                    <a
                        href='https://t.me/pot_app'
                        target='_blank'
                    >
                        t.me/pot_app
                    </a>
                </li>
            </ul>
        </ConfigList>
    );
}
