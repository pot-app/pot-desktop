import React from 'react';
import { useTranslation } from 'react-i18next';
import { Input, Button } from '@nextui-org/react';
export function Config(props) {
    const { updateServiceList, onClose } = props;
    const { t } = useTranslation();

    return (
        <>
            <div className='config-item'>
                <h3 className='my-auto'>Auth Key</h3>
                <Input
                    variant='bordered'
                    className='max-w-[100px]'
                />
            </div>
            <div className='config-item'>
                <h3 className='my-auto'>Custom URL</h3>
                <Input
                    variant='bordered'
                    className='max-w-[100px]'
                />
            </div>
            <Button
                fullWidth
                onPress={() => {
                    updateServiceList('deepl');
                    onClose();
                }}
            >
                {t('common.save')}
            </Button>
        </>
    );
}
