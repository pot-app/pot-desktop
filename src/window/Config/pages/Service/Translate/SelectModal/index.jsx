import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@nextui-org/react';
import { useTranslation } from 'react-i18next';
import * as buildinServices from '../../../../../../services/translate/index';

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
                        <ModalHeader>添加接口</ModalHeader>
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
                                            startContent={
                                                <img
                                                    src={buildinServices[x].info.icon}
                                                    className='h-[24px] w-[24px] my-auto'
                                                />
                                            }
                                        >
                                            <div className='w-full'>
                                                {t(`services.translate.${buildinServices[x].info.name}`)}
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
