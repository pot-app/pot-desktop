import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@nextui-org/react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@nextui-org/react';
import { readDir, BaseDirectory, readTextFile, exists } from '@tauri-apps/api/fs';
import { Textarea, Button, ButtonGroup } from '@nextui-org/react';
import { appConfigDir, join } from '@tauri-apps/api/path';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import React, { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Pagination } from '@nextui-org/react';
import { useTranslation } from 'react-i18next';
import Database from 'tauri-plugin-sql-api';

import * as builtinCollectionServices from '../../../../services/collection';
import { invoke_plugin } from '../../../../utils/invoke_plugin';
import * as builtinServices from '../../../../services/translate';
import { useConfig, useToastStyle } from '../../../../hooks';
import { LanguageFlag } from '../../../../utils/language';
import { store } from '../../../../utils/store';
import { osType } from '../../../../utils/env';
import {
    ServiceSourceType,
    ServiceType,
    getServiceName,
    getServiceSouceType,
    whetherAvailableService,
} from '../../../../utils/service_instance';

export default function Collection() {
    const [collectionServiceList] = useConfig('collection_service_list', []);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [pluginList, setPluginList] = useState(null);
    const [selectedItem, setSelectItem] = useState(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [items, setItems] = useState([]);
    const toastStyle = useToastStyle();
    const { t } = useTranslation();
    
    useEffect(() => {
        init();
        loadPluginList();
    }, []);

    useEffect(() => {
        getData();
    }, [total, page]);

    const init = async () => {
        const db = await Database.load('sqlite:collection.db');
        try {
            const result = await db.select('SELECT COUNT(*) FROM collection');
            if (result[0] && result[0]['COUNT(*)']) {
                setTotal(result[0]['COUNT(*)']);
            }
        } catch (error) {
            // 如果表不存在，创建表
            await db.execute(
                'CREATE TABLE IF NOT EXISTS collection(id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT NOT NULL, source TEXT NOT NULL, target TEXT NOT NULL, service TEXT NOT NULL, result TEXT NOT NULL, timestamp INTEGER NOT NULL)'
            );
            setTotal(0);
        }
    };

    const getData = async () => {
        const db = await Database.load('sqlite:collection.db');
        let result = await db.select('SELECT * FROM collection ORDER BY id DESC LIMIT 20 OFFSET $1', [20 * (page - 1)]);
        setItems(result);
    };

    const getSelectedData = async (id) => {
        const db = await Database.load('sqlite:collection.db');
        let result = await db.select('SELECT * FROM collection WHERE id=$1', [id]);
        setSelectItem(result[0]);
    };

    const clearData = async () => {
        const db = await Database.load('sqlite:collection.db');
        await db.execute('DROP TABLE collection');
        await db.execute('VACUUM');
        setItems([]);
        setTotal(0);
        setPage(1);
    };

    const updateData = async () => {
        const db = await Database.load('sqlite:collection.db');
        await db.execute('UPDATE collection SET text=$1, result=$2 WHERE id=$3', [
            selectedItem.text,
            selectedItem.result,
            selectedItem.id,
        ]);
        await getData();
    };

    const deleteData = async (id) => {
        const db = await Database.load('sqlite:collection.db');
        await db.execute('DELETE FROM collection WHERE id=$1', [id]);
        await getData();
        setTotal(total - 1);
    };

    const formatDate = (date) => {
        function padTo2Digits(num) {
            return num.toString().padStart(2, '0');
        }
        const year = date.getFullYear().toString().slice(2, 4);
        const month = padTo2Digits(date.getMonth() + 1);
        const day = padTo2Digits(date.getDate());
        const hour = padTo2Digits(date.getHours());
        const minute = padTo2Digits(date.getMinutes());
        const second = padTo2Digits(date.getSeconds());
        return `${year}/${month}/${day} ${hour}:${minute}:${second}`;
    };

    const loadPluginList = async () => {
        const serviceTypeList = ['translate', 'collection'];
        let temp = {};
        for (const serviceType of serviceTypeList) {
            temp[serviceType] = {};
            if (await exists(`plugins/${serviceType}`, { dir: BaseDirectory.AppConfig })) {
                const plugins = await readDir(`plugins/${serviceType}`, { dir: BaseDirectory.AppConfig });
                for (const plugin of plugins) {
                    const infoStr = await readTextFile(`plugins/${serviceType}/${plugin.name}/info.json`, {
                        dir: BaseDirectory.AppConfig,
                    });
                    let pluginInfo = JSON.parse(infoStr);
                    if ('icon' in pluginInfo) {
                        const appConfigDirPath = await appConfigDir();
                        const iconPath = await join(
                            appConfigDirPath,
                            `/plugins/${serviceType}/${plugin.name}/${pluginInfo.icon}`
                        );
                        pluginInfo.icon = convertFileSrc(iconPath);
                    }
                    temp[serviceType][plugin.name] = pluginInfo;
                }
            }
        }
        setPluginList({ ...temp });
    };

    return (
        pluginList !== null && (
            <>
                <Toaster />
                <Table
                    fullWidth
                    hideHeader
                    selectionMode='single'
                    selectionBehavior='toggle'
                    aria-label='Collection Table'
                    classNames={{
                        base: `${
                            osType === 'Linux' ? 'h-[calc(100vh-130px)]' : 'h-[calc(100vh-100px)]'
                        } overflow-y-auto`,
                        td: 'px-0',
                    }}
                    onRowAction={(id) => {
                        getSelectedData(id);
                        onOpen();
                    }}
                >
                    <TableHeader>
                        <TableColumn key='service' />
                        <TableColumn key='text' />
                        <TableColumn key='source' />
                        <TableColumn key='target' />
                        <TableColumn key='result' />
                        <TableColumn key='timestamp' />
                        <TableColumn key='action' />
                    </TableHeader>
                    <TableBody
                        emptyContent={'No Collection to display.'}
                        items={items}
                    >
                        {(item) =>
                            whetherAvailableService(item.service, {
                                [ServiceSourceType.BUILDIN]: builtinServices,
                                [ServiceSourceType.PLUGIN]: pluginList[ServiceType.TRANSLATE],
                            }) && (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        {getServiceSouceType(item.service) === ServiceSourceType.PLUGIN ? (
                                            <img
                                                src={pluginList['translate'][getServiceName(item.service)].icon}
                                                className='h-[18px] w-[18px] my-auto mr-[8px]'
                                                draggable={false}
                                            />
                                        ) : (
                                            <img
                                                src={`${builtinServices[getServiceName(item.service)].info.icon}`}
                                                className='h-[18px] w-[18px] my-auto mr-[8px]'
                                                draggable={false}
                                            />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <p
                                            className={`whitespace-nowrap ${
                                                osType === 'Linux'
                                                    ? 'w-[calc((100vw-287px-26px-60px-140px-30px)*0.5)]'
                                                    : 'w-[calc((100vw-287px-26px-60px-140px)*0.5)]'
                                            } text-ellipsis overflow-hidden`}
                                        >
                                            {item.text}
                                        </p>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`w-[30px] fi fi-${LanguageFlag[item.source]}`} />
                                    </TableCell>
                                    <TableCell>
                                        <span className={`w-[30px] fi fi-${LanguageFlag[item.target]}`} />
                                    </TableCell>
                                    <TableCell>
                                        <p
                                            className={`whitespace-nowrap ${
                                                osType === 'Linux'
                                                    ? 'w-[calc((100vw-287px-26px-60px-140px-30px)*0.5)]'
                                                    : 'w-[calc((100vw-287px-26px-60px-140px)*0.5)]'
                                            } text-ellipsis overflow-hidden`}
                                        >
                                            {item.result}
                                        </p>
                                    </TableCell>
                                    <TableCell>
                                        <p className='text-center whitespace-nowrap w-[140px]'>
                                            {formatDate(new Date(item.timestamp))}
                                        </p>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            size='sm'
                                            color='danger'
                                            variant='light'
                                            onPress={() => deleteData(item.id)}
                                        >
                                            {t('common.delete')}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )
                        }
                    </TableBody>
                </Table>
                <div className='mt-[8px] flex justify-around'>
                    <Pagination
                        showControls
                        isCompact
                        total={Math.ceil(total / 20)}
                        page={page}
                        onChange={setPage}
                    />
                    <Button
                        size='sm'
                        className='my-auto'
                        onPress={clearData}
                    >
                        {t('common.clear')}
                    </Button>
                </div>

                <Modal
                    isOpen={isOpen}
                    onOpenChange={onOpenChange}
                    scrollBehavior='inside'
                >
                    <ModalContent className='max-h-[80vh]'>
                        {(onClose) =>
                            selectedItem && (
                                <>
                                    <ModalHeader>
                                        <div className='flex justify-start'>
                                            {getServiceSouceType(selectedItem.service) === ServiceSourceType.PLUGIN ? (
                                                <img
                                                    src={
                                                        pluginList['translate'][getServiceName(selectedItem.service)]
                                                            .icon
                                                    }
                                                    className='h-[24px] w-[24px] my-auto'
                                                    draggable={false}
                                                />
                                            ) : (
                                                <img
                                                    src={`${builtinServices[getServiceName(selectedItem.service)].info.icon}`}
                                                    className='h-[24px] w-[24px] m-auto mr-[8px]'
                                                    draggable={false}
                                                />
                                            )}
                                        </div>
                                    </ModalHeader>
                                    <ModalBody>
                                        <Textarea
                                            value={selectedItem.text}
                                            onChange={(e) => {
                                                setSelectItem({ ...selectedItem, text: e.target.value });
                                            }}
                                        />
                                        <Textarea
                                            value={selectedItem.result}
                                            onChange={(e) => {
                                                setSelectItem({ ...selectedItem, result: e.target.value });
                                            }}
                                        />
                                    </ModalBody>
                                    <ModalFooter className='flex justify-between'>
                                        <Button
                                            color='primary'
                                            onPress={async () => {
                                                await updateData();
                                                onClose();
                                            }}
                                        >
                                            {t('common.save')}
                                        </Button>
                                        <Button
                                            color='danger'
                                            onPress={async () => {
                                                await deleteData(selectedItem.id);
                                                onClose();
                                            }}
                                        >
                                            {t('common.delete')}
                                        </Button>
                                    </ModalFooter>
                                </>
                            )
                        }
                    </ModalContent>
                </Modal>
            </>
        )
    );
}