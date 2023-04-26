import request from '../interfaces/utils/request';

export async function ankiConnect(action, version, params = {}) {
    return await request('http://127.0.0.1:8765', {
        method: 'POST',
        body: JSON.stringify({ action, version, params }),
    });
}
