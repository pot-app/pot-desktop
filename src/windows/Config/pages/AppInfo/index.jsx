import { checkUpdate, installUpdate } from '@tauri-apps/api/updater';
import { writeText } from '@tauri-apps/api/clipboard';
import PulseLoader from 'react-spinners/PulseLoader';
import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useTheme } from '@mui/material/styles';
import { ask } from '@tauri-apps/api/dialog';
import { Button, Box } from '@mui/material';
import { app } from '@tauri-apps/api';
import ConfigList from '../../components/ConfigList';
import './style.css';

export default function AppInfo() {
    const [version, setVersion] = useState('');
    const [tauriVersion, setTauriVersion] = useState('');
    const [checking, setChecking] = useState(false);
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
            toast.success('已写入剪切板', {
                style: {
                    background: theme.palette.background.default,
                    color: theme.palette.text.primary,
                },
            });
        });
    }

    function checkUpdateHandler() {
        setChecking(true);
        checkUpdate().then(
            (update) => {
                if (update.shouldUpdate) {
                    ask(update.manifest.body, { title: '新版本可用,是否更新？', type: 'info' }).then((install) => {
                        if (install) {
                            toast.loading('正在下载更新，请耐心等待', {
                                style: {
                                    background: theme.palette.background.default,
                                    color: theme.palette.text.primary,
                                },
                            });
                            installUpdate().then(
                                (_) => {},
                                (e) => {
                                    toast.error('更新出错\n' + e, {
                                        style: {
                                            background: theme.palette.background.default,
                                            color: theme.palette.text.primary,
                                        },
                                    });
                                }
                            );
                        }
                    });
                } else {
                    toast.success('已经是最新版本', {
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
                toast.error(`检查更新失败，请检查网络设置\n${e}`, {
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
            <h3>应用简介</h3>
            <ul>
                <li>应用名称:&nbsp;&nbsp;pot</li>
                <li>
                    作者:&nbsp;&nbsp;
                    <a
                        href='https://github.com/Pylogmon'
                        target='_blank'
                    >
                        @Pylogmon
                    </a>
                </li>
                <li>
                    开源协议:&nbsp;&nbsp;
                    <a
                        href='https://github.com/pot-app/pot-desktop/blob/master/LICENSE'
                        target='_blank'
                    >
                        GPL-3.0
                    </a>
                </li>
                <li>描述:&nbsp;&nbsp;pot是一款跨平台的划词翻译软件</li>
            </ul>
            <h3>应用版本</h3>
            <ul>
                <li>Pot:&nbsp;&nbsp;{version}</li>
                <li>Tauri:&nbsp;&nbsp;{tauriVersion}</li>
                <li>
                    <Button
                        size='small'
                        onClick={() => copy(`pot:${version}  Tauri:${tauriVersion}`)}
                    >
                        一键复制
                    </Button>
                </li>
            </ul>
            <Button
                onClick={checkUpdateHandler}
                variant='outlined'
                disabled={checking}
                size='small'
            >
                检查更新
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
                href='https://pot.pylogmon.com/download'
                target='_blank'
            >
                <Button
                    variant='outlined'
                    size='small'
                >
                    前往下载
                </Button>
            </a>
            <h3>相关站点</h3>
            <ul>
                <li>
                    官网&文档:&nbsp;&nbsp;
                    <a
                        href='https://pot.pylogmon.com'
                        target='_blank'
                    >
                        https://pot.pylogmon.com
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
            <h3>使用反馈</h3>
            <ul>
                <li>
                    提交Bug:&nbsp;&nbsp;
                    <a
                        href='https://github.com/pot-app/pot-desktop/issues'
                        target='_blank'
                    >
                        提交Issue
                    </a>
                </li>
                <li>
                    需求建议:&nbsp;&nbsp;
                    <a
                        href='https://github.com/pot-app/pot-desktop/issues'
                        target='_blank'
                    >
                        提交Issue
                    </a>
                </li>
                <li>
                    联系作者:&nbsp;&nbsp;
                    <a
                        href='mailto:pylogmon@outlook.com'
                        target='_blank'
                    >
                        pylogmon@outlook.com
                    </a>
                    <br />
                </li>
            </ul>
            <h3>社区交流</h3>
            <ul>
                <li>QQ群:&nbsp;&nbsp;767701966</li>
                <li>
                    Telegram群组:&nbsp;&nbsp;
                    <a
                        href='https://t.me/Pot_Pylogmon'
                        target='_blank'
                    >
                        t.me/pot_app
                    </a>
                </li>
            </ul>
        </ConfigList>
    );
}
