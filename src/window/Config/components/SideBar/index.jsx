import { useNavigate, useLocation } from 'react-router-dom';
import { BsInfoSquareFill } from 'react-icons/bs';
import { PiTranslateFill } from 'react-icons/pi';
import { AiFillAppstore } from 'react-icons/ai';
import { useTranslation } from 'react-i18next';
import { PiTextboxFill } from 'react-icons/pi';
import { MdKeyboardAlt } from 'react-icons/md';
import { MdExtension } from 'react-icons/md';
import { AiFillCloud } from 'react-icons/ai';
import { FaHistory } from 'react-icons/fa';
import { Button } from '@nextui-org/react';
import React from 'react';

export default function SideBar() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    function setStyle(pathname) {
        return location.pathname.includes(pathname) ? 'flat' : 'light';
    }

    return (
        <div className='mx-[12px] overflow-y-auto'>
            <Button
                fullWidth
                size='lg'
                variant={setStyle('/general')}
                className='mb-[5px]'
                onPress={() => {
                    navigate('/general');
                }}
                startContent={<AiFillAppstore className='text-[24px]' />}
            >
                <div className='w-full'>{t('config.general.label')}</div>
            </Button>
            <Button
                fullWidth
                size='lg'
                variant={setStyle('/translate')}
                className='mb-[5px]'
                onPress={() => {
                    navigate('/translate');
                }}
                startContent={<PiTranslateFill className='text-[24px]' />}
            >
                <div className='w-full'>{t('config.translate.label')}</div>
            </Button>
            <Button
                fullWidth
                size='lg'
                variant={setStyle('/recognize')}
                className='mb-[5px]'
                onPress={() => {
                    navigate('/recognize');
                }}
                startContent={<PiTextboxFill className='text-[24px]' />}
            >
                <div className='w-full'>{t('config.recognize.label')}</div>
            </Button>
            <Button
                fullWidth
                size='lg'
                variant={setStyle('/hotkey')}
                className='mb-[5px]'
                onPress={() => {
                    navigate('/hotkey');
                }}
                startContent={<MdKeyboardAlt className='text-[24px]' />}
            >
                <div className='w-full'>{t('config.hotkey.label')}</div>
            </Button>
            <Button
                fullWidth
                size='lg'
                variant={setStyle('/service')}
                className='mb-[5px]'
                onPress={() => {
                    navigate('/service');
                }}
                startContent={<MdExtension className='text-[24px]' />}
            >
                <div className='w-full'>{t('config.service.label')}</div>
            </Button>
            <Button
                fullWidth
                size='lg'
                variant={setStyle('/history')}
                className='mb-[5px]'
                onPress={() => {
                    navigate('/history');
                }}
                startContent={<FaHistory className='text-[24px]' />}
            >
                <div className='w-full'>{t('config.history.label')}</div>
            </Button>
            <Button
                fullWidth
                size='lg'
                variant={setStyle('/backup')}
                className='mb-[5px]'
                onPress={() => {
                    navigate('/backup');
                }}
                startContent={<AiFillCloud className='text-[24px]' />}
            >
                <div className='w-full'>{t('config.backup.label')}</div>
            </Button>
            <Button
                fullWidth
                size='lg'
                variant={setStyle('/about')}
                className='mb-[5px]'
                onPress={() => {
                    navigate('/about');
                }}
                startContent={<BsInfoSquareFill className='text-[24px]' />}
            >
                <div className='w-full'>{t('config.about.label')}</div>
            </Button>
        </div>
    );
}
