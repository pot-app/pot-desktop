import { AiFillAppstore } from 'react-icons/ai';
import { PiTranslateFill } from 'react-icons/pi';
import { PiTextboxFill } from 'react-icons/pi';
import { MdKeyboardAlt } from 'react-icons/md';
import { MdExtension } from 'react-icons/md';
import { BsInfoSquareFill } from 'react-icons/bs';
import { FaExternalLinkSquareAlt } from 'react-icons/fa';
import { FaHistory } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
        <div style={{ margin: '0 12px', overflow: 'auto' }}>
            <Button
                fullWidth
                size='lg'
                variant={setStyle('/general')}
                style={{ marginBottom: '5px' }}
                onClick={() => {
                    navigate('/general');
                }}
                startContent={<AiFillAppstore style={{ fontSize: '24px' }} />}
            >
                <div style={{ width: '100%' }}>{t('config.general.label')}</div>
            </Button>
            <Button
                fullWidth
                size='lg'
                variant={setStyle('/translate')}
                style={{ marginBottom: '5px' }}
                onClick={() => {
                    navigate('/translate');
                }}
                startContent={<PiTranslateFill style={{ fontSize: '24px' }} />}
            >
                <div style={{ width: '100%' }}>{t('config.translate.label')}</div>
            </Button>
            <Button
                fullWidth
                size='lg'
                variant={setStyle('/recognize')}
                style={{ marginBottom: '5px' }}
                onClick={() => {
                    navigate('/recognize');
                }}
                startContent={<PiTextboxFill style={{ fontSize: '24px' }} />}
            >
                <div style={{ width: '100%' }}>{t('config.recognize.label')}</div>
            </Button>
            <Button
                fullWidth
                size='lg'
                variant={setStyle('/hotkey')}
                style={{ marginBottom: '5px' }}
                onClick={() => {
                    navigate('/hotkey');
                }}
                startContent={<MdKeyboardAlt style={{ fontSize: '24px' }} />}
            >
                <div style={{ width: '100%' }}>{t('config.hotkey.label')}</div>
            </Button>
            <Button
                fullWidth
                size='lg'
                variant={setStyle('/external')}
                style={{ marginBottom: '5px' }}
                onClick={() => {
                    navigate('/external');
                }}
                startContent={<FaExternalLinkSquareAlt style={{ fontSize: '24px' }} />}
            >
                <div style={{ width: '100%' }}>{t('config.external.label')}</div>
            </Button>
            <Button
                fullWidth
                size='lg'
                variant={setStyle('/service')}
                style={{ marginBottom: '5px' }}
                onClick={() => {
                    navigate('/service');
                }}
                startContent={<MdExtension style={{ fontSize: '24px' }} />}
            >
                <div style={{ width: '100%' }}>{t('config.service.label')}</div>
            </Button>
            <Button
                fullWidth
                size='lg'
                variant={setStyle('/history')}
                style={{ marginBottom: '5px' }}
                onClick={() => {
                    navigate('/history');
                }}
                startContent={<FaHistory style={{ fontSize: '24px' }} />}
            >
                <div style={{ width: '100%' }}>{t('config.history.label')}</div>
            </Button>
            <Button
                fullWidth
                size='lg'
                variant={setStyle('/about')}
                style={{ marginBottom: '5px' }}
                onClick={() => {
                    navigate('/about');
                }}
                startContent={<BsInfoSquareFill style={{ fontSize: '24px' }} />}
            >
                <div style={{ width: '100%' }}>{t('config.about.label')}</div>
            </Button>
        </div>
    );
}
