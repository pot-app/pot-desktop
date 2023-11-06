import { useNavigate, useLocation } from 'react-router-dom';
import {
    AiOutlineLayout,
    AiOutlineTranslation,
    AiOutlineHighlight,
    AiOutlineExpandAlt,
    AiOutlineTags,
    AiOutlineFontColors,
    AiOutlineQuestionCircle,
    AiOutlineCode,
    AiOutlineRollback,
    AiOutlineEdit,
    AiOutlineDelete,
    AiOutlineUserAdd,
    AiOutlinePlus,
} from 'react-icons/ai';
import { Card } from '@nextui-org/react';
import React, { useState, useEffect } from 'react';
import { useDisclosure } from '@nextui-org/react';

import { useConfig } from '../../../../hooks';

import { useTranslation } from 'react-i18next';
import ModalForm from './ModalForm';

export default function Preinput(props) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const messages = props.messages;
    const addPrompt = props.addPrompt;
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    // console.log(useConfig);

    const systemPreInputs = {
        Summarize: {
            name: 'Summarize',
            icon: <AiOutlineLayout />,
            prompt: 'Condense the text in its original language.',
        },
        Translate: {
            name: 'Translate',
            icon: <AiOutlineTranslation />,
            prompt: 'Translate this text to $[lang]',
        },
        Rewrite: {
            name: 'Rewrite',
            icon: <AiOutlineHighlight />,
            prompt: 'Rephrase this text.',
        },
        Expand: {
            name: 'Expand',
            icon: <AiOutlineExpandAlt />,
            prompt: 'Expands the text and view detailed...',
        },
        Explain: {
            name: 'Explain',
            icon: <AiOutlineTags />,
            prompt: 'Clarify this text and define any technical...',
        },
        Grammar: {
            name: 'Grammar',
            icon: <AiOutlineFontColors />,
            prompt: 'Proofread and correct this text.',
        },
        'Q&A': {
            name: 'Q&A',
            icon: <AiOutlineQuestionCircle />,
            prompt: 'Answer this question.',
        },
        'Explain Codes': {
            name: 'Explain Codes',
            icon: <AiOutlineCode />,
            prompt: 'Explain the following codes: ```$[text]```',
        },
    };
    let uSysPre = {};
    const systemPreInputsKeys = Object.keys(systemPreInputs);

    for (let key of systemPreInputsKeys) {
        uSysPre[key] = {
            name: systemPreInputs[key].name,
            prompt: systemPreInputs[key].prompt,
        };
    }
    // console.log(uSysPre);
    const [userPreInputs, setUserPreInputs] = useConfig('user_pre_inputs', JSON.stringify(uSysPre));
    let userPreInputsData = userPreInputs && JSON.parse(userPreInputs);
    const userPreInputsKeys = userPreInputsData && Object.keys(userPreInputsData);
    const [reset, setReset] = useState(true);
    useEffect(() => {
        if (messages.length === 0) {
            setReset(true);
        } else {
            setReset(false);
        }
    }, [messages]);

    const select = (prompt) => {
        setReset(false);
        addPrompt(prompt);
    };
    useEffect(() => {
        setReset(true);
    }, [props.reset]);

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
        console.log(timestamp);
        userPreInputsData[timestamp] = {
            name: name,
            prompt: prompt,
        };
        setUserPreInputs(JSON.stringify(userPreInputsData));
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
                                                onClick={() => select(prompt)}
                                                onMouseEnter={handleMouseEnter}
                                                onMouseLeave={handleMouseLeave}
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
                                            onClick={() => select(prompt)}
                                            onMouseEnter={handleMouseEnter}
                                            onMouseLeave={handleMouseLeave}
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
