import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@nextui-org/react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { Card, Spacer, Button } from '@nextui-org/react';
import { useConfig } from '../../../../../hooks';
import InterfaceItem from './InterfaceItem';

export default function Translate() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [translateInterfaceList, setTranslateInterfaceList] = useConfig('translate_interface_list', [
        'deepl',
        'bing',
    ]);
    const reorder = (list, startIndex, endIndex) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return result;
    };
    const onDragEnd = async (result) => {
        console.log(result);
        if (!result.destination) return;
        const items = reorder(translateInterfaceList, result.source.index, result.destination.index);
        setTranslateInterfaceList(items);
    };

    function deleteInterface(name) {
        if (translateInterfaceList.length === 1) {
            alert('至少需要一个翻译接口');
            return;
        } else {
            setTranslateInterfaceList(translateInterfaceList.filter((x) => x !== name));
        }
    }
    return (
        <>
            <Card className='h-[calc(100vh-120px)] overflow-y-auto p-5 flex justify-between'>
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable
                        droppableId='droppable'
                        direction='vertical'
                    >
                        {(provided) => (
                            <div
                                className='overflow-y-auto h-full'
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                            >
                                {translateInterfaceList.map((x, i) => {
                                    return (
                                        <Draggable
                                            key={x}
                                            draggableId={x}
                                            index={i}
                                        >
                                            {(provided) => {
                                                return (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                    >
                                                        <InterfaceItem
                                                            {...provided.dragHandleProps}
                                                            name={x}
                                                            key={x}
                                                            deleteInterface={deleteInterface}
                                                        />
                                                        <Spacer y={2} />
                                                    </div>
                                                );
                                            }}
                                        </Draggable>
                                    );
                                })}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
                <Spacer y={2} />
                <div className='flex'>
                    <Button
                        fullWidth
                        onPress={onOpen}
                    >
                        添加内置接口
                    </Button>
                    <Spacer x={2} />
                    <Button
                        fullWidth
                        onPress={onOpen}
                    >
                        添加外部插件
                    </Button>
                </div>
            </Card>
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
                                <div>
                                    <Button fullWidth>hello</Button>
                                </div>
                                <div>
                                    <Button fullWidth>hello</Button>
                                </div>
                                <div>
                                    <Button fullWidth>hello</Button>
                                </div>
                                <div>
                                    <Button fullWidth>hello</Button>
                                </div>
                                <div>
                                    <Button fullWidth>hello</Button>
                                </div>
                                <div>
                                    <Button fullWidth>hello</Button>
                                </div>
                                <div>
                                    <Button fullWidth>hello</Button>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    color='danger'
                                    variant='light'
                                    onClick={onClose}
                                >
                                    Close
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}
