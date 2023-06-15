import { fetch } from '@tauri-apps/api/http';
import { get } from '../windows/main';

export async function addToEudic(text) {
    let token = get('eudic_token') ?? '';
    if (token === '') {
        throw 'Please configure Token';
    }
    let categoryId = await checkCategory(token);
    return await addWordToCategory(categoryId, text, token);
}

async function checkCategory(token) {
    let name = get('eudic_category_name') ?? 'pot';
    if (name === '') {
        name = 'pot';
    }

    let res = await fetch('https://api.frdic.com/api/open/v1/studylist/category', {
        method: 'GET',
        query: {
            language: 'en',
        },
        headers: {
            'Content-Type': 'application/json',
            Authorization: token,
        },
    });

    let result = res.data;
    if (result.data) {
        for (let i of result.data) {
            if (i.name === name) {
                return i.id;
            }
        }
        // 创建生词本
        let res1 = await fetch('https://api.frdic.com/api/open/v1/studylist/category', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: token,
            },
            body: {
                type: 'Json',
                payload: {
                    language: 'en',
                    name: name,
                },
            },
        });
        let result1 = res1.data;
        if (result1.data) {
            return result1.data.id;
        } else {
            throw '创建生词本失败';
        }
    } else {
        throw '查询生词本失败';
    }
}

async function addWordToCategory(id, word, token) {
    let res = await fetch('https://api.frdic.com/api/open/v1/studylist/words', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: token,
        },
        body: {
            type: 'Json',
            payload: {
                id: id,
                language: 'en',
                words: [word],
            },
        },
    });
    let result = res.data;
    return result.message;
}
