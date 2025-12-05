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
import { open } from '@tauri-apps/api/dialog'; // 添加导入对话框

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

    // 添加导入收藏功能（移到组件内部）
    const importFromFolder = async () => {
        try {
            console.log('开始导入收藏...'); // 添加调试日志
            // 打开文件夹选择对话框
            const selectedFolder = await open({
                directory: true,
                multiple: false,
                title: t('collection.select_folder') === 'collection.select_folder' ? '选择包含收藏文件的文件夹' : t('collection.select_folder')
            });

            console.log('选择的文件夹:', selectedFolder); // 调试日志

            if (!selectedFolder) {
                console.log('用户取消选择'); // 调试日志
                return; // 用户取消选择
            }

            // 读取文件夹中的所有文件
            const files = await readDir(selectedFolder);
            
            console.log('文件夹中的文件:', files); // 调试日志

            let importedCount = 0;
            const db = await Database.load('sqlite:collection.db');

            // 处理每个文件
            for (const file of files) {
                if (file.name.endsWith('.txt') || file.name.endsWith('.json')) {
                    try {
                        const filePath = await join(selectedFolder, file.name);
                        const content = await readTextFile(filePath);
                        
                        console.log(`处理文件: ${file.name}`); // 调试日志
                        
                        // 解析文件内容
                        const collections = parseCollectionFile(content, file.name);
                        
                        console.log(`解析到 ${collections.length} 条记录`); // 调试日志
                        
                        // 导入到数据库
                        for (const collection of collections) {
                            await db.execute(
                                'INSERT INTO collection (text, source, target, service, result, timestamp) VALUES ($1, $2, $3, $4, $5, $6)',
                                [collection.text, collection.source, collection.target, collection.service, collection.result, collection.timestamp]
                            );
                            importedCount++;
                        }
                    } catch (error) {
                        console.warn(`Failed to import file ${file.name}:`, error);
                    }
                }
            }

            // 更新界面
            await getData();
            setTotal(total + importedCount);
            
            // 显示导入结果
            if (importedCount > 0) {
                toast.success(
                    `${t('collection.import_success') === 'collection.import_success' ? '导入成功' : t('collection.import_success')} ${importedCount} ${t('collection.items') === 'collection.items' ? '条记录' : t('collection.items')}`, 
                    toastStyle
                );
            } else {
                toast.info(
                    t('collection.no_collections_found') === 'collection.no_collections_found' ? '未找到可导入的收藏记录' : t('collection.no_collections_found'), 
                    toastStyle
                );
            }
            
            console.log(`导入完成，共导入 ${importedCount} 条记录`); // 调试日志
        } catch (error) {
            console.error('Import failed:', error);
            toast.error(t('collection.import_failed') === 'collection.import_failed' ? '导入失败' : t('collection.import_failed'), 
                toastStyle
            );
        }
    };

    // 解析收藏文件内容（移到组件内部）
    const parseCollectionFile = (content, fileName) => {
        const collections = [];
        
        try {
            // 首先将内容分割为行
            const lines = content.split('\n').filter(line => line.trim());
            
            // 尝试解析为JSON格式
            if (fileName.endsWith('.json')) {
                const data = JSON.parse(content);
                if (Array.isArray(data)) {
                    return data.map(item => ({
                        text: item.text || item.original || '',
                        source: item.source || item.from || 'auto',
                        target: item.target || item.to || 'zh_cn',
                        service: item.service || 'unknown',
                        result: item.result || item.translation || '',
                        timestamp: item.timestamp || item.time || Date.now()
                    }));
                }
            }
            
            // 检查是否为键值对格式（包含"原文："、"译文："等标识符）
            const isKeyValueFormat = lines.some(line => 
                line.startsWith('原文：') || line.startsWith('译文：') || 
                line.startsWith('时间：') || line.startsWith('服务：')
            );
            
            if (isKeyValueFormat) {
                // 解析键值对格式
                let currentRecord = {};
                
                for (const line of lines) {
                    if (line.startsWith('原文：')) {
                        currentRecord.text = line.replace('原文：', '').trim();
                    } else if (line.startsWith('译文：')) {
                        currentRecord.result = line.replace('译文：', '').trim();
                    } else if (line.startsWith('时间：')) {
                        const timeStr = line.replace('时间：', '').trim();
                        // 解析时间格式：25/12/05 18:15:33
                        const timeMatch = timeStr.match(/(\d{2})\/(\d{2})\/(\d{2})\s+(\d{2}):(\d{2}):(\d{2})/);
                        if (timeMatch) {
                            const [_, day, month, year, hour, minute, second] = timeMatch;
                            // 将YY/MM/DD格式转换为Date对象
                            const fullYear = 2000 + parseInt(year); // 假设是20XX年
                            const date = new Date(fullYear, parseInt(month) - 1, parseInt(day), 
                                                    parseInt(hour), parseInt(minute), parseInt(second));
                            currentRecord.timestamp = date.getTime();
                        } else {
                            currentRecord.timestamp = Date.now();
                        }
                    } else if (line.startsWith('服务：')) {
                        currentRecord.service = line.replace('服务：', '').trim();
                    } else if (line.trim() === '') {
                        // 空行表示一条记录结束
                        if (currentRecord.text && currentRecord.result) {
                            collections.push({
                                text: currentRecord.text,
                                source: currentRecord.source || 'auto',
                                target: currentRecord.target || 'zh_cn',
                                service: currentRecord.service || 'unknown',
                                result: currentRecord.result,
                                timestamp: currentRecord.timestamp || Date.now()
                            });
                            currentRecord = {};
                        }
                    }
                }
                
                // 处理最后一条记录
                if (currentRecord.text && currentRecord.result) {
                    collections.push({
                        text: currentRecord.text,
                        source: currentRecord.source || 'auto',
                        target: currentRecord.target || 'zh_cn',
                        service: currentRecord.service || 'unknown',
                        result: currentRecord.result,
                        timestamp: currentRecord.timestamp || Date.now()
                    });
                }
            } else {
                // 解析为管道符分隔格式
                for (const line of lines) {
                    const parts = line.split('|').map(part => part.trim());
                    if (parts.length >= 2) {
                        // 基本格式：原文|译文
                        // 扩展格式：原文|源语言|目标语言|服务|译文|时间戳
                        collections.push({
                            text: parts[0],
                            source: parts.length > 2 ? parts[1] : 'auto',
                            target: parts.length > 3 ? parts[2] : 'zh_cn',
                            service: parts.length > 4 ? parts[3] : 'unknown',
                            result: parts.length >= 2 ? parts[parts.length > 4 ? 4 : 1] : '',
                            timestamp: parts.length > 5 ? parseInt(parts[5]) || Date.now() : Date.now()
                        });
                    }
                }
            }
        } catch (error) {
            console.warn('Failed to parse file:', error);
        }
        
        return collections;
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
                                                item.text.length > 20 ? 'truncate' : ''
                                            }`}
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
                                        <ButtonGroup>
                                            <Button
                                                size='sm'
                                                onPress={() => {
                                                    getSelectedData(item.id);
                                                    onOpen();
                                                }}
                                            >
                                                {t('common.view') === 'common.view' ? '查看' : t('common.view')}
                                            </Button>
                                            <Button
                                                size='sm'
                                                color='danger'
                                                onPress={() => {
                                                    deleteData(item.id);
                                                }}
                                            >
                                                {t('common.delete') === 'common.delete' ? '删除' : t('common.delete')}
                                            </Button>
                                        </ButtonGroup>
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
                    <div className='flex gap-2'>
                        <Button
                            size='sm'
                            className='my-auto'
                            onPress={importFromFolder}
                        >
                            {t('collection.import') === 'collection.import' ? '导入收藏' : t('collection.import')}
                        </Button>
                        <Button
                            size='sm'
                            className='my-auto'
                            onPress={clearData}
                        >
                            {t('common.clear') === 'common.clear' ? '清空' : t('common.clear')}
                        </Button>
                    </div>
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
                                            {t('common.save') === 'common.save' ? '保存' : t('common.save')}
                                        </Button>
                                        <Button
                                            color='danger'
                                            onPress={async () => {
                                                await deleteData(selectedItem.id);
                                                onClose();
                                            }}
                                        >
                                            {t('common.delete') === 'common.delete' ? '删除' : t('common.delete')}
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