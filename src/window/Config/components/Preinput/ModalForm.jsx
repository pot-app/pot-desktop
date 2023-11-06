import { useNavigate, useLocation } from 'react-router-dom';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Checkbox,
    Input,
    Link,
} from '@nextui-org/react';
import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';

export default function ModalForm(props) {
    const { t } = useTranslation();
    const isOpen = props.isOpen;
    const onOpen = props.onOpen;
    const onOpenChange = props.onOpenChange;
    const isEdit = props.isEdit;
    const key = props.key_ || '';
    const userPreInputsData = props.userPreInputsData;
    // console.log(props);
    const name = userPreInputsData && (isEdit ? userPreInputsData[key].name : '');
    const prompt = userPreInputsData && (isEdit ? userPreInputsData[key].prompt : '');
    const editMethod = props.editMethod;
    const addMethod = props.addMethod;
    const [newName, setNewName] = useState(name);
    const [newPrompt, setNewPrompt] = useState(prompt);
    useEffect(() => {
        setNewName(name);
        setNewPrompt(prompt);
    }, [isOpen]);

    return (
        <>
            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                placement='top-center'
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className='flex flex-col gap-1'>
                                {isEdit ? t('config.qsearch.edit') : t('config.qsearch.add')}
                            </ModalHeader>
                            <ModalBody>
                                <Input
                                    autoFocus
                                    label={t('config.qsearch.action')}
                                    variant='bordered'
                                    value={newName}
                                    onChange={(event) => {
                                        setNewName(event.target.value);
                                    }}
                                />
                                <Input
                                    label={t('config.qsearch.prompt')}
                                    variant='bordered'
                                    value={newPrompt}
                                    onChange={(event) => {
                                        setNewPrompt(event.target.value);
                                    }}
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    color='danger'
                                    variant='flat'
                                    onPress={onClose}
                                >
                                    {t('config.qsearch.cancel')}
                                </Button>
                                <Button
                                    color='primary'
                                    onPress={() => {
                                        console.log(isEdit);
                                        isEdit ? editMethod(key, newName, newPrompt) : addMethod(newName, newPrompt);
                                        onClose();
                                    }}
                                >
                                    {t('config.qsearch.save')}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}
