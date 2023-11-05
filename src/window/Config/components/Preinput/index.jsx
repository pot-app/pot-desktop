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
    AiOutlineUserAdd,
} from 'react-icons/ai';
import { Card } from '@nextui-org/react';

import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';

export default function Preinput(props) {
    const messages = props.messages;
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const addPrompt = props.addPrompt;
    const systemPreInputs = [
        {
            name: 'Summarize',
            icon: <AiOutlineLayout />,
            prompt: 'Condense the text in its original language.',
        },
        {
            name: 'Translate',
            icon: <AiOutlineTranslation />,
            prompt: 'Translate this text to $[lang]',
        },
        {
            name: 'Rewrite',
            icon: <AiOutlineHighlight />,
            prompt: 'Rephrase this text.',
        },
        {
            name: 'Expand',
            icon: <AiOutlineExpandAlt />,
            prompt: 'Expands the text and view detailed...',
        },
        {
            name: 'Explain',
            icon: <AiOutlineTags />,
            prompt: 'Clarify this text and define any technical...',
        },
        {
            name: 'Grammar',
            icon: <AiOutlineFontColors />,
            prompt: 'Proofread and correct this text.',
        },
        {
            name: 'Q&A',
            icon: <AiOutlineQuestionCircle />,
            prompt: 'Answer this question.',
        },
        {
            name: 'Explain Codes',
            icon: <AiOutlineCode />,
            prompt: 'Explain the following codes: ```$[text]```',
        },
    ];
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

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
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

    const itemHeadStyle = {
        display: 'flex',
        alignItems: 'center',
        padding: '1% 2%',
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
    return (
        <>
            <div>
                {reset && (
                    <div style={boxStyle}>
                        {systemPreInputs.map((item, index) => (
                            <div
                                style={preInputStyle}
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                                key={index}
                            >
                                <Card style={cardStyle}>
                                    <div onClick={() => select(item.prompt)}>
                                        <div style={itemHeadStyle}>
                                            <div>{item.icon}</div>
                                            <div style={nameStyle}>{item.name}</div>
                                        </div>

                                        <div style={promptStyle}>{item.prompt}</div>
                                    </div>
                                </Card>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
