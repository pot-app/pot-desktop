import { useEffect, useReducer, useRef, useState } from 'react';
import ClipboardJS from 'clipboard';
import { throttle } from 'lodash-es';
import { createParser } from 'eventsource-parser';
import OpenAI from 'openai';
//import { OPENAI_API_KEY } from './key';

const OPENAI_API_BASE_URL = '';
const AZURE_OPENAI_API_BASE_URL = '';
const AZURE_OPENAI_DEPLOYMENT = '';
const AZURE_OPENAI_API_KEY = '';
const OPENAI_API_KEY = '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';

const openai = new OpenAI({ apiKey: OPENAI_API_KEY, dangerouslyAllowBrowser: true });
const scrollDown = throttle(
    () => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    },
    300,
    {
        leading: true,
        trailing: false,
    }
);

const requestMessage = async (messages) => {
    const response = await handler({ messages });

    if (!response.ok) {
        throw new Error(response.statusText);
    }
    const data = response.body;
    if (!data) {
        throw new Error('No data');
    }

    return data.getReader();
};

export const useChatGPT = () => {
    // const { fetchPath } = props;
    const [, forceUpdate] = useReducer((x) => !x, false);
    const [messages, setMessages] = useState([]);
    const [disabled] = useState(false);
    const [loading, setLoading] = useState(false);

    const controller = useRef(null);
    const currentMessage = useRef('');
    const archiveCurrentMessage = () => {
        const content = currentMessage.current;
        currentMessage.current = '';
        setLoading(false);
        if (content) {
            setMessages((messages) => {
                return [
                    ...messages,
                    {
                        content,
                        role: 'assistant',
                    },
                ];
            });
            // scrollDown();
        }
    };

    const fetchMessage = async (messages) => {
        try {
            currentMessage.current = '';
            controller.current = new AbortController();
            setLoading(true);

            const reader = await requestMessage(messages);
            const decoder = new TextDecoder('utf-8');
            let done = false;

            while (!done) {
                const { value, done: readerDone } = await reader.read();
                if (value) {
                    const char = decoder.decode(value);
                    if (char === '\n' && currentMessage.current.endsWith('\n')) {
                        continue;
                    }
                    if (char) {
                        currentMessage.current += char;
                        forceUpdate();
                    }
                    // scrollDown();
                }
                done = readerDone;
            }

            archiveCurrentMessage();
        } catch (e) {
            // console.error(e);
            setLoading(false);
            return;
        }
    };

    const onStop = () => {
        if (controller.current) {
            controller.current.abort();
            archiveCurrentMessage();
        }
    };

    const onSend = (message) => {
        const newMessages = [...messages, message];
        setMessages(newMessages);
        fetchMessage(newMessages);
    };

    const onClear = () => {
        setMessages([]);
    };

    useEffect(() => {
        new ClipboardJS('.chat-wrapper .copy-btn', {
            text: function (trigger) {
                // 获取包含在按钮内的原始未转义文本
                const originalText = trigger.getAttribute('data-clipboard-text');
                // 恢复转义到内容
                const res = decodeURIComponent(originalText);
                console.log(res);
                return res;
            },
        });
    }, []);

    return {
        loading,
        disabled,
        messages,
        currentMessage,
        onSend,
        onClear,
        onStop,
        setMessages,
    };
};

const handler = async (req) => {
    try {
        const { messages } = req;

        const charLimit = 12000;
        let charCount = 0;
        let messagesToSend = [];

        for (let i = 0; i < messages.length; i++) {
            const message = messages[i];
            if (charCount + message.content.length > charLimit) {
                break;
            }
            charCount += message.content.length;
            messagesToSend.push(message);
        }

        const useAzureOpenAI = AZURE_OPENAI_API_BASE_URL && AZURE_OPENAI_API_BASE_URL.length > 0;

        let apiUrl;
        let apiKey;
        let model;
        if (useAzureOpenAI) {
            let apiBaseUrl = AZURE_OPENAI_API_BASE_URL;
            const version = '2023-05-15';
            const deployment = AZURE_OPENAI_DEPLOYMENT || '';
            if (apiBaseUrl && apiBaseUrl.endsWith('/')) {
                apiBaseUrl = apiBaseUrl.slice(0, -1);
            }
            apiUrl = `${apiBaseUrl}/openai/deployments/${deployment}/chat/completions?api-version=${version}`;
            apiKey = AZURE_OPENAI_API_KEY || '';
            model = ''; // Azure Open AI always ignores the model and decides based on the deployment name passed through.
        } else {
            let apiBaseUrl = OPENAI_API_BASE_URL || 'https://api.openai.com';
            if (apiBaseUrl && apiBaseUrl.endsWith('/')) {
                apiBaseUrl = apiBaseUrl.slice(0, -1);
            }
            apiUrl = `${apiBaseUrl}/v1/chat/completions`;
            apiKey = OPENAI_API_KEY || '';
            model = 'gpt-3.5-turbo'; // todo: allow this to be passed through from client and support gpt-4
        }
        const stream = await OpenAIStream(apiUrl, apiKey, model, messagesToSend);
        return new Response(stream);
    } catch (error) {
        console.error(error);
        return new Response('Error', { status: 500 });
    }
};

const OpenAIStream = async (apiUrl, apiKey, model, messages) => {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    // const res = await fetch(apiUrl, {
    //     headers: {
    //         'Content-Type': 'application/json',
    //         Authorization: `Bearer ${apiKey}`,
    //         'api-key': `${apiKey}`,
    //     },
    //     method: 'POST',
    //     body: JSON.stringify({
    //         model: model,
    //         frequency_penalty: 0,
    //         max_tokens: 4000,
    //         messages: [
    //             {
    //                 role: 'system',
    //                 content: `You are an AI assistant that helps people find information.`,
    //             },
    //             ...messages,
    //         ],
    //         presence_penalty: 0,
    //         stream: true,
    //         temperature: 0.7,
    //         top_p: 0.95,
    //     }),
    // });
    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: 'system',
                content: `You are an AI assistant that helps people find information.`,
            },
            ...messages,
        ],
        model: 'gpt-3.5-turbo',
    });
    const answer = completion.choices[0]['message']['content'];
    // console.log(answer);

    // if (res.status !== 200) {
    //     const statusText = res.statusText;
    //     throw new Error(
    //         `The OpenAI API has encountered an error with a status code of ${res.status} and message ${statusText}`
    //     );
    // }
    // console.log(res.status);
    // const text = await res.text();
    // console.log(text);

    // const text = await res.text();
    // const json = JSON.parse(text);
    // const answer = json['choices'][0]['message']['content'];

    // 使用 TextEncoder 将文本转化为 Uint8Array
    const textEncoder = new TextEncoder();
    const textUint8Array = textEncoder.encode(answer);

    // 创建一个 ReadableStream
    const textStream = new ReadableStream({
        start(controller) {
            // 将 Uint8Array 写入到控制器
            controller.enqueue(textUint8Array);
            // 关闭流
            controller.close();
        },
    });

    return textStream;
    // return new ReadableStream({
    //     async start(controller) {
    //         const onParse = (event) => {
    //             if (event.type === 'event') {
    //                 const data = event.data;

    //                 if (data === '[DONE]') {
    //                     controller.close();
    //                     return;
    //                 }

    //                 try {
    //                     const json = JSON.parse(data);
    //                     const text = json.choices[0].delta.content;
    //                     console.log(',,,,', text);
    //                     const queue = encoder.encode(text);
    //                     controller.enqueue(queue);
    //                 } catch (e) {
    //                     controller.error(e);
    //                 }
    //             }
    //         };

    //         const parser = createParser(onParse);

    //         for await (const chunk of res.body) {
    //             const str = decoder.decode(chunk).replace('[DONE]\n', '[DONE]\n\n');
    //             parser.feed(str);
    //         }
    //     },
    // });
};
