import { useLocation, useRoutes } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { appWindow } from '@tauri-apps/api/window';
import { Card, Divider } from '@nextui-org/react';
import { useTranslation } from 'react-i18next';

import WindowControl from '../../components/WindowControl';
import SideBar from './components/SideBar';
import { store } from '../../utils/store';
import { osType } from '../../utils/env';
import routes from './routes';
import './style.css';

export default function Config() {
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const page = useRoutes(routes);

    useEffect(() => {
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
                className={`bg-content1/90 float-left w-[230px] h-screen rounded-none ${
                    osType === 'Linux' && 'rounded-l-[10px]'
                }`}
            >
                <div className='h-[35px] p-[5px]'>
                    <div
                        className='w-full h-full'
                        data-tauri-drag-region='true'
                    />
                </div>
                <div className='p-[5px]'>
                    <div data-tauri-drag-region='true'>
                        <img
                            alt='pot logo'
                            src='icon.png'
                            className='h-[50px] w-[50px] m-auto mb-[35px]'
                            draggable={false}
                        />
                    </div>
                </div>
                <SideBar />
            </Card>
            <div className={`bg-background ml-[230px] h-screen ${osType === 'Linux' && 'rounded-r-[10px]'}`}>
                <div
                    data-tauri-drag-region='true'
                    style={{
                        top: '5px',
                        left: '235px',
                        right: '5px',
                        height: '30px',
                        position: 'fixed',
                    }}
                />
                <div style={{ height: '35px', display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex' }}>
                        <h2 style={{ margin: 'auto', marginLeft: '10px' }}>
                            {t(`config.${location.pathname.slice(1)}.title`)}
                        </h2>
                    </div>

                    <div style={{ display: 'flex' }}>{osType !== 'Darwin' && <WindowControl />}</div>
                </div>
                <Divider />
                <div style={{ padding: '10px', overflow: 'auto', height: 'calc(100vh - 36px)' }}>{page}</div>
            </div>
        </>
    );
}
