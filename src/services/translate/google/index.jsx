import { fetch } from '@tauri-apps/api/http';

export async function translate(text, from, to) {
    let res = await fetch(
        `https://google.pot-app.com/translate_a/single?dt=at&dt=bd&dt=ex&dt=ld&dt=md&dt=qca&dt=rw&dt=rm&dt=ss&dt=t`,
        {
            method: 'GET',
            headers: { 'content-type': 'application/json' },
            query: {
                client: 'gtx',
                sl: from,
                tl: to,
                hl: to,
                ie: 'UTF-8',
                oe: 'UTF-8',
                otf: '1',
                ssel: '0',
                tsel: '0',
                kc: '7',
                q: text,
            },
        }
    );
    if (res.ok) {
        let result = res.data;
        let target = '';

        // 词典模式
        if (result[1]) {
            for (let i of result[1]) {
                // 词性
                target = target + '【词性】' + i[0] + '\n【释义】';
                for (let r of i[1]) {
                    target = target + r + ', ';
                }
                target = target + '\n【联想】\n';
                for (let r of i[2]) {
                    target = target + '  ' + r[0] + ':  ';
                    for (let j of r[1]) {
                        target = target + j + ', ';
                    }
                    target += '\n';
                }
                target += '\n';
            }
            return target.trim();
        } else {
            // 翻译模式
            for (let r of result[0]) {
                if (r[0]) {
                    target = target + r[0];
                }
            }
            return target.trim();
        }
    } else {
        throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
    }
}

export * from './Config';
export * from './info';
