import { useLocation, useRoutes } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { appWindow } from '@tauri-apps/api/window';
import { Card, Divider } from '@nextui-org/react';
import { useTranslation } from 'react-i18next';

import WindowControl from '../../components/WindowControl';
import SideBar from './components/SideBar';
import { osType } from '../../utils/env';
import { useConfig } from '../../hooks';
import routes from './routes';
import './style.css';

export default function Config() {
    const [transparent] = useConfig('transparent', true);
    const { t } = useTranslation();
    const location = useLocation();
    const page = useRoutes(routes);

    useEffect(() => {
        if (appWindow.label === 'config') {
            appWindow.show();
        }
    }, []);

    return (
        <>
            <Card
                shadow='none'
                className={`${
                    transparent ? 'bg-background/90' : 'bg-content1'
                } float-left w-[230px] h-screen rounded-none ${
                    osType === 'Linux' && 'rounded-l-[10px] border-1'
                } border-r-1 border-default-100 select-none cursor-default`}
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
                            src='icon.svg'
                            className='h-[60px] w-[60px] m-auto mb-[30px]'
                            draggable={false}
                        />
                    </div>
                </div>
                <SideBar />
            </Card>
            <div
                className={`bg-background ml-[230px] h-screen select-none cursor-default ${
                    osType === 'Linux' && 'rounded-r-[10px] border-1 border-l-0 border-default-100'
                }`}
            >
                <div
                    data-tauri-drag-region='true'
                    className='top-[5px] left-[235px] right-[5px] h-[30px] fixed'
                />
                <div className='h-[35px] flex justify-between'>
                    <div className='flex'>
                        <h2 className='m-auto ml-[10px]'>{t(`config.${location.pathname.slice(1)}.title`)}</h2>
                    </div>

                    <div className='flex'>{osType !== 'Darwin' && <WindowControl />}</div>
                </div>
                <Divider />
                <div
                    className={`p-[10px] overflow-y-auto ${
                        osType === 'Linux' ? 'h-[calc(100vh-38px)]' : 'h-[calc(100vh-36px)]'
                    }`}
                >
                    {page}
                </div>
            </div>
        </>
    );
}
