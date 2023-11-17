import { useTranslation } from 'react-i18next';
import { Card } from '@nextui-org/react';
import React, { useEffect, useRef, useState } from 'react';
import SendBar from './SendBar';
import MessageItem from './MessageItem';
import { languageList } from '../../../../utils/language';
import { useConfig } from '../../../../hooks';
import { useChatGPT } from './useChatGPT';
import { systemPreInputs, uSysPre } from '../Preinput/SysPreInputs';
import './index.css';
import 'highlight.js/styles/atom-one-dark.css';

export default function Chat(props) {
    const key = props.key_ || null;
    const userInput = props.userInput || null;
    const { loading, disabled, messages, currentMessage, onSend, onClear, onStop, setMessages } = useChatGPT();
    const messageRef = useRef();
    const [recognizeLanguage, setRecognizeLanguage] = useConfig('recognize_language', 'auto');
    const [deleteNewline, setDeleteNewline] = useConfig('recognize_delete_newline', false);
    const [autoCopy, setAutoCopy] = useConfig('recognize_auto_copy', false);
    const [hideWindow, setHideWindow] = useConfig('recognize_hide_window', false);
    const [closeOnBlur, setCloseOnBlur] = useConfig('recognize_close_on_blur', false);
    const { t } = useTranslation();
    // const [update, forceUpdate] = useState();
    const [initState, setInitState] = useState(false);
    let init = initState;
    const [myMessages, setMyMessages] = useState({});
    const [userPreInputs, setUserPreInputs] = useConfig('user_pre_inputs', JSON.stringify(uSysPre));
    let userPreInputsData = userPreInputs && JSON.parse(userPreInputs);

    const addPrompt = (prompt) => {
        console.log('aaaaa', init, messages);
        // 完成清空聊天记录功能
        if (init && messages.length == 0) {
            setMessages([
                {
                    role: 'system',
                    content: prompt,
                },
            ]);
            return;
        }
        // 防止输入不显示
        if (messages.length > 0 && messages[0].content == prompt && !userInput) {
            console.log('same');
            init = true;
            return;
        }
        // 初始化
        if (userInput) {
            if (messages.length > 1) return;
            console.log("useruseruser", messages)
            setMessages([
                {
                    role: 'system',
                    content: prompt,
                },
            ]);
            messages.length == 1 && onSend({
                role: 'user',
                content: userInput,
            });
           
        } else {
            if (!(key in myMessages)) {
                setMessages([
                    {
                        role: 'system',
                        content: prompt,
                    },
                ]);
            } else {
                setMessages(myMessages[key]);
            }
        }
        init = true;
        setInitState(true);
        // if (out) forceUpdate({});
    };
    useEffect(() => {
        console.log('init', init, messages);
        if (init) {
            if (messages.length > 0) {
                setMyMessages({
                    ...myMessages,
                    [key]: messages,
                });
            } else {
                let msg = myMessages;
                delete msg[key];
                setMessages(msg);
            }

            console.log(myMessages);
        }
    }, [messages]);

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
    // console.log(key);
    if (key) {
        const prompt = userPreInputsData && userPreInputsData[key].prompt;
        // console.log(prompt);
        prompt && addPrompt(prompt);
    }

    return (
        <>{console.log('111111111111',messages)}
            <div
                style={mainStyle}
                id='chatBody'
                className='chat-wrapper'
            >
                <div style={bodyStyle}>
                    <Card style={bodyCardStyle}>
                        <div
                            ref={messageRef}
                            style={messageStyle}
                        >
                            {messages &&
                                messages.map((message, index) => (
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
