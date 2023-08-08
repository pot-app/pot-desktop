import { useLocation, useRoutes } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { appWindow } from '@tauri-apps/api/window';
import { Card, Divider } from '@nextui-org/react';
import { useTranslation } from 'react-i18next';
import { type } from '@tauri-apps/api/os';
import WindowControl from '../../components/WindowControl';
import SideBar from './components/sidebar';
import { store } from '../../utils/store';
import routes from './routes';

export default function Config() {
    const [osType, setOsTyoe] = useState('Darwin');
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const page = useRoutes(routes);

    useEffect(() => {
        type().then((t) => {
            setOsTyoe(t);
        });
        store.get('app_language').then((l) => {
            if (l) {
                i18n.changeLanguage(l);
            }
        });

        if (appWindow.label === 'config') {
            appWindow.show();
        }
    }, []);

    return (
        <>
            <Card
                style={{
                    width: '230px',
                    height: '100vh',
                    float: 'left',
                    borderRadius: 0,
                }}
            >
                <div
                    data-tauri-drag-region='true'
                    style={{ height: '35px' }}
                />
                <div data-tauri-drag-region='true'>
                    <img
                        alt='pot logo'
                        height={50}
                        width={50}
                        src='icon.png'
                        style={{ margin: 'auto', marginBottom: '35px' }}
                        draggable={false}
                    />
                </div>
                <SideBar />
            </Card>
            <div style={{ marginLeft: '230px', height: '100vh' }}>
                <div
                    data-tauri-drag-region='true'
                    style={{ height: '35px', display: 'flex', justifyContent: 'space-between' }}
                >
                    <div style={{ display: 'flex' }}>
                        <h2 style={{ margin: 'auto', marginLeft: '10px' }}>
                            {t(`config.${location.pathname.slice(1)}.title`)}
                        </h2>
                    </div>

                    <div style={{ display: 'flex' }}>{osType !== 'Darwin' && <WindowControl />}</div>
                </div>
                <Divider />
                <div style={{ padding: '10px' }}>{page}</div>
            </div>
        </>
    );
}
