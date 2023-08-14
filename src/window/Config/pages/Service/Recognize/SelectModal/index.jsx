import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@nextui-org/react';
import { useTranslation } from 'react-i18next';
import * as buildinServices from '../../../../../../services/recognize/index';

export default function SelectModal(props) {
    const { isOpen, onOpenChange, setConfigName, onConfigOpen } = props;
    const { t } = useTranslation();

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            scrollBehavior='inside'
        >
            <ModalContent className='max-h-[80vh]'>
                {(onClose) => (
                    <>
                        <ModalHeader>{t('config.service.add_service')}</ModalHeader>
                        <ModalBody>
                            {Object.keys(buildinServices).map((x) => {
                                return (
                                    <div key={x}>
                                        <Button
                                            fullWidth
                                            onPress={() => {
                                                setConfigName(x);
                                                onConfigOpen();
                                            }}
                                        >
                                            <div className='w-full'>
                                                {t(`services.recognize.${buildinServices[x].info.name}.title`)}
                                            </div>
                                        </Button>
                                    </div>
                                );
                            })}
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                color='danger'
                                variant='light'
                                onClick={onClose}
                            >
                                {t('common.cancel')}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
