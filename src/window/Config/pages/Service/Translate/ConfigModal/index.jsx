import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Spacer } from '@nextui-org/react';
import { useTranslation } from 'react-i18next';
import React from 'react';

import * as buildinServices from '../../../../../../services/translate/index';

export default function ConfigModal(props) {
    const { isOpen, onOpenChange, name, updateServiceList } = props;
    const { t } = useTranslation();

    const ConfigComponent = buildinServices[name].Config;
    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            scrollBehavior='inside'
        >
            <ModalContent className='max-h-[75vh]'>
                {(onClose) => (
                    <>
                        <ModalHeader>
                            <img
                                src={buildinServices[name].info.icon}
                                className='h-[24px] w-[24px] my-auto'
                            />
                            <Spacer x={2} />
                            {t(`services.translate.${name}.title`)}
                        </ModalHeader>
                        <ModalBody>
                            <ConfigComponent
                                updateServiceList={updateServiceList}
                                onClose={onClose}
                            />
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
