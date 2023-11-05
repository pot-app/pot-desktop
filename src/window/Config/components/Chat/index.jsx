import { useTranslation } from 'react-i18next';
import { Card } from '@nextui-org/react';
import React, { useEffect, useRef, useState } from 'react';
import SendBar from './SendBar';
import MessageItem from './MessageItem';
import Preinput from '../Preinput';
import { languageList } from '../../../../utils/language';
import { useConfig } from '../../../../hooks';
import { useChatGPT } from './useChatGPT';
import './index1.css';
import 'highlight.js/styles/atom-one-dark.css';

export default function Chat(props) {
    const showQSearch = props.QSearch;
    const { loading, disabled, messages, currentMessage, onSend, onClear, onStop } = useChatGPT();
    const messageRef = useRef();
    const [recognizeLanguage, setRecognizeLanguage] = useConfig('recognize_language', 'auto');
    const [deleteNewline, setDeleteNewline] = useConfig('recognize_delete_newline', false);
    const [autoCopy, setAutoCopy] = useConfig('recognize_auto_copy', false);
    const [hideWindow, setHideWindow] = useConfig('recognize_hide_window', false);
    const [closeOnBlur, setCloseOnBlur] = useConfig('recognize_close_on_blur', false);
    const { t } = useTranslation();
    const [update, forceUpdate] = useState();
    const addPrompt = (prompt) => {
        messages.push({
            role: 'system',
            content: prompt,
        });
        forceUpdate({});
    };

    const mainStyle = {
        margin: 0,
        padding: 0,
        height: '100%',
        // overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        // minHeight: '100%',
    };

    const bodyStyle = {
        // flex: 1,
        height: '100vh',
        overflow: 'auto',
        // backgroundColor: 'green',
    };
    const bodyCardStyle = {
        maxHeight: '100%',
        overflow: 'hidden',
    };
    const messageStyle = {
        overflow: 'auto',
    };
    const senderStyle = {
        position: 'sticky',
        bottom: 0,
        padding: '20px',
    };
    const scrollToBottom = () => {
        const content = messageRef.current;
        // console.log(content);
        content.scrollTop = content.scrollHeight;
        // console.log(content.scrollHeight, content.scrollTop);
    };
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <>
            <div
                style={mainStyle}
                id='chatBody'
                className='chat-wrapper'
            >
                <div style={bodyStyle}>
                    {showQSearch && (
                        <Preinput
                            messages={messages}
                            addPrompt={addPrompt}
                        />
                    )}
                    <Card style={bodyCardStyle}>
                        <div
                            ref={messageRef}
                            style={messageStyle}
                        >
                            {messages.map((message, index) => (
                                <MessageItem
                                    key={index}
                                    message={message}
                                />
                            ))}
                            {currentMessage.current && (
                                <MessageItem message={{ content: currentMessage.current, role: 'assistant' }} />
                            )}
                        </div>
                    </Card>
                </div>
                <div style={senderStyle}>
                    <Card>
                        <div>
                            <SendBar
                                loading={loading}
                                disabled={disabled}
                                onSend={onSend}
                                onClear={onClear}
                                onStop={onStop}
                            />
                        </div>
                    </Card>
                </div>
            </div>
        </>
    );
}
