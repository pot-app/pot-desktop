import React, { useEffect, useState } from 'react';
import { checkUpdate, onUpdaterEvent, installUpdate } from '@tauri-apps/api/updater';
import { appWindow } from '@tauri-apps/api/window';
import ReactMarkdown from 'react-markdown';
import { Code, Card, CardBody, Button, Progress } from '@nextui-org/react';
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
        checkUpdate().then((update) => {
            if (update.shouldUpdate) {
                console.log(update);
                setBody(update.manifest.body);
                if (appWindow.label === 'updater') {
                    appWindow.show();
                }
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
                    marginTop: '20px',
                }}
            >
                <CardBody>
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
                    >
                        {body}
                    </ReactMarkdown>
                </CardBody>
                {/* <MDXRemote compiledSource={body} /> */}
            </Card>
            <div
                style={{
                    width: '80%',
                    margin: 'auto',
                    marginTop: '5px',
                }}
            >
                <Progress
                    aria-label='Loading...'
                    value={(downloaded / total) * 100}
                    color='success'
                    style={{
                        width: '100%',
                    }}
                />
            </div>

            <div style={{ margin: '10px', display: 'flex', justifyContent: 'space-around' }}>
                <Button
                    variant='flat'
                    color='primary'
                    onClick={() => {
                        installUpdate();
                    }}
                >
                    更新
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
