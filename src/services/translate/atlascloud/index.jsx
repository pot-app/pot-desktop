import { translate as translateOpenAI } from '../openai';
import {
    ATLASCLOUD_DEFAULT_MODEL,
    ATLASCLOUD_DEFAULT_REQUEST_PATH,
    defaultPromptList,
    defaultRequestArguments,
} from './defaults';

function normalizeAtlasCloudRequestPath(requestPath) {
    const url = new URL(/https?:\/\/.+/.test(requestPath) ? requestPath : `https://${requestPath}`);

    if (!url.pathname.endsWith('/chat/completions')) {
        const path = url.pathname.replace(/\/+$/, '');
        url.pathname = path === '' || path === '/v1' ? '/v1/chat/completions' : `${path}/chat/completions`;
    }

    return url.href;
}

export async function translate(text, from, to, options) {
    const config = options.config ?? {};
    return translateOpenAI(text, from, to, {
        ...options,
        config: {
            ...config,
            service: 'openai',
            requestPath: normalizeAtlasCloudRequestPath(config.requestPath || ATLASCLOUD_DEFAULT_REQUEST_PATH),
            model: config.model || ATLASCLOUD_DEFAULT_MODEL,
            promptList: config.promptList || defaultPromptList,
            requestArguments: config.requestArguments || defaultRequestArguments,
        },
    });
}

export * from './Config';
export * from './info';
