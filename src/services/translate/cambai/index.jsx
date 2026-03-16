import { fetch, Body } from '@tauri-apps/api/http';

export async function translate(text, from, to, options = {}) {
    const { config } = options;
    const { apiKey } = config;

    if (!apiKey) {
        throw 'Please configure your CAMB AI API key';
    }

    const url = 'https://client.camb.ai/apis/translate';

    // Submit translation task
    let res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
        },
        body: Body.json({
            source_language: parseInt(from === 'auto' ? '1' : from),
            target_language: parseInt(to),
            texts: [text],
        }),
    });

    if (!res.ok) {
        throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
    }

    const taskId = res.data.task_id;
    if (!taskId) {
        throw `Failed to create translation task: ${JSON.stringify(res.data)}`;
    }

    // Poll for task completion
    const statusUrl = `https://client.camb.ai/apis/translate/${taskId}`;
    let attempts = 0;
    const maxAttempts = 40;

    while (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        attempts++;

        let statusRes = await fetch(statusUrl, {
            method: 'GET',
            headers: {
                'x-api-key': apiKey,
            },
        });

        if (!statusRes.ok) {
            continue;
        }

        const statusData = statusRes.data;
        if (statusData.status === 'SUCCESS') {
            const runId = statusData.run_id;
            if (!runId) {
                throw `Missing run_id in response: ${JSON.stringify(statusData)}`;
            }

            // Fetch the actual translation result
            let resultRes = await fetch(`https://client.camb.ai/apis/translation-result/${runId}`, {
                method: 'GET',
                headers: {
                    'x-api-key': apiKey,
                },
            });

            if (!resultRes.ok) {
                throw `Failed to fetch translation result\nHttp Status: ${resultRes.status}\n${JSON.stringify(resultRes.data)}`;
            }

            const resultData = resultRes.data;
            if (resultData.texts && resultData.texts.length > 0) {
                return resultData.texts[0];
            } else if (resultData.translated_text) {
                return resultData.translated_text;
            }
            throw `Unexpected result format: ${JSON.stringify(resultData)}`;
        } else if (statusData.status === 'FAILED' || statusData.status === 'ERROR') {
            throw `Translation failed: ${JSON.stringify(statusData)}`;
        }
    }

    throw 'Translation timed out';
}

export * from './Config';
export * from './info';
