import React, { useEffect, useState } from 'react';
import { checkUpdate, installUpdate } from '@tauri-apps/api/updater';
import { appWindow } from '@tauri-apps/api/window';
import ReactMarkdown from 'react-markdown';
import { Code, Card, CardBody, Button, Progress, Skeleton } from '@nextui-org/react';
import { useTranslation } from 'react-i18next';
import { store } from '../../utils/store';
import { listen } from '@tauri-apps/api/event';

let unlisten = 0;
let eventId = 0;

export default function Updater() {
    const [downloaded, setDownloaded] = useState(0);
    const [total, setTotal] = useState(0);
    const [body, setBody] = useState('');
    const { t, i18n } = useTranslation();

    useEffect(() => {
        store.get('app_language').then((l) => {
            if (l) {
                i18n.changeLanguage(l);
            }
        });
        if (appWindow.label === 'updater') {
            appWindow.show();
        }
        checkUpdate().then((update) => {
            if (update.shouldUpdate) {
                setBody(update.manifest.body);
            } else {
                setBody(t('updater.latest'));
            }
        });
        if (unlisten === 0) {
            unlisten = listen('tauri://update-download-progress', (e) => {
                if (eventId === 0) {
                    eventId = e.id;
                }
                if (e.id === eventId) {
                    console.log(e);
                    setTotal(e.payload.contentLength);
                    setDownloaded((a) => {
                        return a + e.payload.chunkLength;
                    });
                }
            });
        }
    }, []);
    return (
        <div>
            <div style={{ padding: '5px', height: '35px', width: '100%' }}>
                <div
                    data-tauri-drag-region='true'
                    style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'left' }}
                >
                    <img
                        src='icon.png'
                        height={25}
                        style={{ height: '25px', marginRight: '10px' }}
                        draggable={false}
                    />
                    <h2>{t('updater.title')}</h2>
                </div>
            </div>
            <Card
                style={{
                    width: '80%',
                    height: 'calc(100vh - 150px)',
                    overflow: 'auto',
                    margin: 'auto',
                    marginTop: '10px',
                }}
            >
                <CardBody>
                    {body === '' ? (
                        <div className='space-y-3'>
                            <Skeleton className='w-3/5 rounded-lg'>
                                <div className='h-3 w-3/5 rounded-lg bg-default-200'></div>
                            </Skeleton>
                            <Skeleton className='w-4/5 rounded-lg'>
                                <div className='h-3 w-4/5 rounded-lg bg-default-200'></div>
                            </Skeleton>
                            <Skeleton className='w-2/5 rounded-lg'>
                                <div className='h-3 w-2/5 rounded-lg bg-default-300'></div>
                            </Skeleton>
                        </div>
                    ) : (
                        <ReactMarkdown
                            className='markdown-body'
                            components={{
                                code: ({ node, ...props }) => {
                                    const { children } = props;
                                    return <Code size='sm'>{children}</Code>;
                                },
                                h2: ({ node, ...props }) => (
                                    <b>
                                        <h2
                                            style={{ fontSize: '24px' }}
                                            {...props}
                                        />
                                        <hr />
                                        <br />
                                    </b>
                                ),
                                h3: ({ node, ...props }) => (
                                    <b>
                                        <br />
                                        <h3
                                            style={{ fontSize: '18px' }}
                                            {...props}
                                        />
                                        <br />
                                    </b>
                                ),
                                li: ({ node, ...props }) => {
                                    const { children } = props;
                                    return (
                                        <li
                                            style={{ listStylePosition: 'inside', listStyleType: 'disc' }}
                                            children={children}
                                        />
                                    );
                                },
                            }}
                            style={{ userSelect: 'text' }}
                        >
                            {body}
                        </ReactMarkdown>
                    )}
                </CardBody>
            </Card>
            <div
                style={{
                    width: '80%',
                    margin: 'auto',
                    marginTop: '5px',
                }}
            >
                {downloaded !== 0 && (
                    <Progress
                        aria-label='Downloading...'
                        label={t('updater.progress')}
                        value={(downloaded / total) * 100}
                        classNames={{
                            track: 'drop-shadow-md border border-default',
                            indicator: 'bg-gradient-to-r from-pink-500 to-yellow-500',
                            label: 'tracking-wider font-medium text-default-600',
                            value: 'text-foreground/60',
                        }}
                        showValueLabel
                        size='sm'
                        style={{
                            width: '100%',
                        }}
                    />
                )}
            </div>

            <div style={{ margin: '10px', display: 'flex', justifyContent: 'space-around' }}>
                <Button
                    variant='flat'
                    isLoading={downloaded !== 0}
                    isDisabled={downloaded !== 0}
                    color='primary'
                    onClick={() => {
                        installUpdate();
                    }}
                >
                    {downloaded !== 0
                        ? downloaded > total
                            ? t('updater.installing')
                            : t('updater.downloading')
                        : t('updater.update')}
                </Button>
                <Button
                    variant='flat'
                    color='danger'
                    onClick={() => {
                        appWindow.close();
                    }}
                >
                    取消
                </Button>
            </div>
        </div>
    );
}
