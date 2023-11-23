import { useNavigate, useLocation } from 'react-router-dom';
import { AiOutlineRollback, AiOutlineEdit, AiOutlineDelete, AiOutlineUserAdd, AiOutlinePlus } from 'react-icons/ai';
import { Card } from '@nextui-org/react';
import React, { useState, useEffect } from 'react';
import { useDisclosure } from '@nextui-org/react';
import { systemPreInputs, uSysPre } from './SysPreInputs';
import { useConfig } from '../../../../hooks';
import { uBarDataPre } from './SysPreInputs';
import { useTranslation } from 'react-i18next';
import ModalForm from './ModalForm';

export default function Preinput(props) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    // const messages = props.messages;
    // const addPrompt = props.addPrompt;
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    // console.log(uSysPre);
    const [userPreInputs, setUserPreInputs] = useConfig('user_pre_inputs', JSON.stringify(uSysPre));
    let userPreInputsData = userPreInputs && JSON.parse(userPreInputs);
    const userPreInputsKeys = userPreInputsData && Object.keys(userPreInputsData);

    const [uBarData, setUBarData] = useConfig('user_bar_data', JSON.stringify(uBarDataPre));
    const userBarData = uBarData && JSON.parse(uBarData);
    const [uSelectBarData, setUSelectBarData] = useState(userBarData);
    useEffect(() => {
        if (userBarData && uSelectBarData == null) {
            setUSelectBarData(userBarData);
        }
    }, [userBarData]);
    useEffect(() => {
        if (uSelectBarData) {
            setUBarData(JSON.stringify(uSelectBarData))
        }
    }, [uSelectBarData])



    const [reset, setReset] = useState(true);
    // useEffect(() => {
    //     if (messages.length === 0) {
    //         setReset(true);
    //     } else {
    //         setReset(false);
    //     }
    // }, [messages]);

    // const select = (prompt) => {
    //     setReset(false);
    //     addPrompt(prompt);
    // };
    // useEffect(() => {
    //     setReset(true);
    // }, [props.reset]);

    const [isHovered, setIsHovered] = useState(false);
    const [key, setKey] = useState('');
    const [isEdit, setIsEdit] = useState(false);

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    const handleEdit = (key) => {
        // console.log(key);
        setKey(key);
        setIsEdit(true);
        onOpen();
    };
    const handleAdd = () => {
        console.log('add');
        setKey('');
        setIsEdit(false);
        onOpen();
    };

    const handleReset = (key) => {
        userPreInputsData[key].name = systemPreInputs[key].name;
        userPreInputsData[key].prompt = systemPreInputs[key].prompt;
        setUserPreInputs(JSON.stringify(userPreInputsData));
    };

    const handleDelete = (key) => {
        delete userPreInputsData[key];
        // console.log(userPreInputsData);
        let i = 0;
        for (; i < uSelectBarData.length; i++) {
            if (uSelectBarData[i].key == key) break;
        }
        console.log(key)
        console.log(i)
        if (i >= 0 && i < uSelectBarData.length) {
            let updatedArray = [...uSelectBarData];
            updatedArray.splice(i, 1); // 删除指定索引的元素
            setUSelectBarData(updatedArray);
          }
        setUserPreInputs(JSON.stringify(userPreInputsData));
    };

    const editMethod = (key, name, prompt) => {
        // console.log(key, name, prompt);
        userPreInputsData[key].name = name;
        userPreInputsData[key].prompt = prompt;
        setUserPreInputs(JSON.stringify(userPreInputsData));
    };
    const addMethod = (name, prompt) => {
        const timestamp = new Date().getTime();
        // console.log(timestamp);
        const key_ = 'User' + timestamp
        userPreInputsData[key_] = {
            name: name,
            prompt: prompt,
        };
        setUserPreInputs(JSON.stringify(userPreInputsData));
        const newItem = {
            key: key_,
            selected: false
        };
        const updatedArray = [...uSelectBarData, newItem];
        setUSelectBarData(updatedArray);
        // console.log(userPreInputs);
    };

    const boxStyle = {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        cursor: isHovered ? 'pointer' : 'auto',
    };
    const preInputStyle = {
        width: 'calc(50% - 10px)',
        margin: '5px',
        padding: '1px 6px',
        height: '80px',
        // border: '1px solid #ccc',
    };
    const cardStyle = {
        height: '100%',
    };
    const headStyle = {
        display: 'flex',
        justifyContent: 'space-between',
    };

    const itemHeadStyle = {
        display: 'flex',
        alignItems: 'center',
        padding: '1% 2%',
        whiteSpace: 'nowrap',
    };

    const nameStyle = {
        paddingLeft: '2%',
        fontSize: '20px',
        fontWeight: 'bold',
    };

    const promptStyle = {
        fontSize: '13px',
        paddingLeft: '2%',
    };
    const addStyle = {
        padding: '12px',
    };
    const addIconStyle = {
        fontSize: '32px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    };
    const addWordStyle = {
        fontSize: '16px',
        color: 'gray',
        textAlign: 'center',
    };
    const resetButton = (key) => (
        <AiOutlineRollback
            onClick={() => {
                handleReset(key);
            }}
        ></AiOutlineRollback>
    );
    const editButton = (key) => (
        <AiOutlineEdit
            onClick={() => {
                handleEdit(key);
            }}
        ></AiOutlineEdit>
    );
    const deleteButton = (key) => (
        <AiOutlineDelete
            onClick={() => {
                handleDelete(key);
            }}
        ></AiOutlineDelete>
    );
    const addPromptCard = () => (
        <Card style={cardStyle}>
            <div
                style={addStyle}
                onClick={handleAdd}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <div style={addIconStyle}>
                    <AiOutlinePlus />
                </div>
                <div style={addWordStyle}>Add New Action</div>
            </div>
        </Card>
    );

    const preInputs = () => {
        // console.log(userPreInputsData);
        // console.log(userPreInputsKeys);
        return (
            userPreInputsData && (
                <div style={boxStyle}>
                    {userPreInputsKeys.map((key, index) => {
                        const item = userPreInputsData[key];
                        const isSystem = key in systemPreInputs;
                        const icon = isSystem ? systemPreInputs[key].icon : <AiOutlineUserAdd />;
                        const name = item.name;
                        const prompt = item.prompt;
                        // console.log(prompt);
                        return (
                            <div
                                style={preInputStyle}
                                key={index}
                            >
                                <Card style={cardStyle}>
                                    <div>
                                        <div style={headStyle}>
                                            <div
                                                style={itemHeadStyle}
                                                // onClick={() => select(prompt)}
                                                // onMouseEnter={handleMouseEnter}
                                                // onMouseLeave={handleMouseLeave}
                                            >
                                                <div>{icon}</div>
                                                <div style={nameStyle}>{name}</div>
                                            </div>
                                            <div style={itemHeadStyle}>
                                                <div
                                                    onMouseEnter={handleMouseEnter}
                                                    onMouseLeave={handleMouseLeave}
                                                >
                                                    {isSystem ? resetButton(key) : deleteButton(key)}
                                                </div>
                                                <div
                                                    onMouseEnter={handleMouseEnter}
                                                    onMouseLeave={handleMouseLeave}
                                                >
                                                    {editButton(key)}
                                                </div>
                                            </div>
                                        </div>

                                        <div
                                            style={promptStyle}
                                            // onClick={() => select(prompt)}
                                            // onMouseEnter={handleMouseEnter}
                                            // onMouseLeave={handleMouseLeave}
                                        >
                                            {prompt}
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        );
                    })}
                    <div style={preInputStyle}>{addPromptCard()}</div>
                </div>
            )
        );
    };
    return (
        <>
            <ModalForm
                isOpen={isOpen}
                onOpen={onOpen}
                onOpenChange={onOpenChange}
                key_={key}
                userPreInputsData={userPreInputsData}
                editMethod={editMethod}
                addMethod={addMethod}
                isEdit={isEdit}
            />
            <div>{reset && preInputs()}</div>
        </>
    );
}
