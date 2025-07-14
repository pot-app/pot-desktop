import { Language } from './info';
import { fetch, Body } from '@tauri-apps/api/http';

export async function recognize(base64, language, options) {
    const { config = {}, setResult } = options || {};

    const {
        baseUrl = '',
        apiKey = '',
        model = '',
        enableStream = false
    } = config;

    if (!baseUrl) {
        throw new Error("缺少必要的配置项: baseUrl.");
    }

    if (!apiKey) {
        throw new Error("缺少必要的配置项: apiKey.");
    }

    // 构建URL
    let requestUrl = baseUrl;
    if (!/https?:\/\/.+/.test(requestUrl)) {
        requestUrl = `https://${requestUrl}`;
    }

    requestUrl = requestUrl.replace(/\/$/, ''); // 移除末尾斜杠

    if (!requestUrl.includes('/chat/completions')) {
        requestUrl += requestUrl.endsWith('/v1') ? '/chat/completions' : '/v1/chat/completions';
    }

    const systemPrompt = '**Objective:** Perform a precise Optical Character Recognition (OCR) on the provided image.\n\n**Instructions:**\n\n1. **Transcribe Verbatim:** Accurately transcribe all text, numbers, and symbols exactly as they appear in the image.\n2. **Preserve Layout:** Maintain the original structure, including paragraphs, line breaks, lists, and indentation, using Markdown formatting.\n3. **Mathematical Formulas:** All mathematical equations and formulas must be enclosed in LaTeX format. Use `$` for inline equations and `$$` for block - level equations.\n4. **Fidelity is Key:** Do not correct spelling or grammar. Do not infer or add any information not present in the image. If a section is unreadable, mark it as `[ILLEGIBLE]`.\n5. **Clean Output:** Provide only the transcribed content. Do not include any introductory phrases, summaries, or explanations.';

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
    };

    const body = {
        model,
        messages: [
            {
                role: "system",
                content: systemPrompt,
            },
            {
                role: "user",
                content: [
                    {
                        type: "image_url",
                        image_url: {
                            url: `data:image/png;base64,${base64}`,
                            detail: "high"
                        },
                    },
                ],
            }
        ],
        stream: enableStream,
    };

    // 处理流式响应的通用函数
    const processStreamContent = (content, isComplete = false) => {
        if (!setResult) return content;

        if (isComplete) {
            setResult(content.trim());
        } else {
            setResult(content + '_');
        }
        return content;
    };

    // 流式传输处理
    if (enableStream) {
        const res = await window.fetch(requestUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body),
        });

        if (res.ok) {
            let target = '';
            const reader = res.body.getReader();
            const decoder = new TextDecoder();

            try {
                let buffer = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        return processStreamContent(target, true);
                    }

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || ''; // 保留不完整的行

                    for (const line of lines) {
                        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                            try {
                                const data = line.slice(6); // 移除 'data: '
                                if (data.trim()) {
                                    const result = JSON.parse(data);
                                    const content = result.choices?.[0]?.delta?.content;
                                    if (content) {
                                        target += content;
                                        processStreamContent(target);
                                    }
                                }
                            } catch (e) {
                                // 忽略解析错误，继续处理下一行
                            }
                        }
                    }
                }
            } finally {
                reader.releaseLock();
            }
        } else {
            throw `Http Request Error\nHttp Status: ${res.status}\n${await res.text()}`;
        }
    } else {
        // 非流式传输处理
        const res = await fetch(requestUrl, {
            method: 'POST',
            headers: headers,
            body: Body.json(body),
        });

        if (res.ok) {
            const result = res.data;
            const content = result.choices?.[0]?.message?.content;

            if (content) {
                // 清理引号
                return content.trim().replace(/^"(.*)"$/, '$1');
            } else {
                throw new Error('No content in response: ' + JSON.stringify(result));
            }
        } else {
            throw new Error(`Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`);
        }
    }
}

export * from './Config';
export * from './info';
