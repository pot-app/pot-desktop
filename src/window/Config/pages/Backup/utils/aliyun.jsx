import { invoke } from '@tauri-apps/api';
import { Body, fetch } from '@tauri-apps/api/http';
import { appConfigDir, join } from '@tauri-apps/api/path';

export async function backup(token, name) {
    const appConfigDirPath = await appConfigDir();
    const filePath = await join(appConfigDirPath, name);
    await invoke('local', {
        operate: 'put',
        path: filePath,
    });
    const drive_id = await driveId(token);
    const dir_id = await createDir(token, drive_id);
    const { file_id, upload_id, upload_url } = await createFile(token, drive_id, dir_id, name);
    await invoke('aliyun', { operate: 'put', path: filePath, url: upload_url });
    await fetch('https://openapi.alipan.com/adrive/v1.0/openFile/complete', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: Body.json({
            drive_id,
            file_id,
            upload_id,
        }),
    });
}

export async function list(token) {
    const drive_id = await driveId(token);
    const dir_id = await createDir(token, drive_id);
    const res = await fetch('https://openapi.alipan.com/adrive/v1.0/openFile/list', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: Body.json({
            drive_id,
            parent_file_id: dir_id,
            type: 'file',
            order_by: 'name',
        }),
    });
    if (res.ok) {
        const result = res.data;
        if (result['items']) {
            return result['items'].map((item) => {
                return item['name'];
            });
        } else {
            throw new Error(`Get File List Error: ${JSON.stringify(result)}`);
        }
    } else {
        const result = res.data;
        if (result['message']) {
            throw new Error(result['message']);
        } else {
            throw new Error(`Get accessToken Error: ${JSON.stringify(result)}`);
        }
    }
}

export async function get(token, name) {
    const drive_id = await driveId(token);
    const file_id = await getFileByPath(token, drive_id, name);
    const url = await getDownloadUrl(token, drive_id, file_id);
    await invoke('aliyun', { operate: 'get', path: '', url });
}

export async function remove(token, name) {
    const drive_id = await driveId(token);
    const file_id = await getFileByPath(token, drive_id, name);
    const res = await fetch('https://openapi.alipan.com/adrive/v1.0/openFile/delete', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: Body.json({
            drive_id,
            file_id,
        }),
    });
    if (res.ok) {
        return;
    } else {
        const result = res.data;
        if (result['message']) {
            throw new Error(result['message']);
        } else {
            throw new Error(`Get accessToken Error: ${JSON.stringify(result)}`);
        }
    }
}

export async function qrcode() {
    const res = await fetch('https://openapi.alipan.com/oauth/authorize/qrcode', {
        method: 'POST',
        body: Body.json({
            client_id: 'bf56dd2dc03a4d3489e3dda05dd6d466',
            scopes: ['user:base', 'file:all:read', 'file:all:write'],
        }),
    });
    if (res.ok) {
        const result = res.data;
        if (result['qrCodeUrl'] && result['sid']) {
            return { url: result['qrCodeUrl'], sid: result['sid'] };
        } else {
            throw new Error(`Can not find qrCodeUrl: ${JSON.stringify(result)}`);
        }
    } else {
        const result = res.data;
        if (result['message']) {
            throw new Error(result['message']);
        } else {
            throw new Error(`Get QrCode Error: ${JSON.stringify(result)}`);
        }
    }
}

export async function status(sid) {
    const res = await fetch(`https://openapi.alipan.com/oauth/qrcode/${sid}/status`);

    if (res.ok) {
        const result = res.data;
        if (result['status']) {
            return { status: result['status'], code: result['authCode'] };
        } else {
            throw new Error(`Can not find status: ${JSON.stringify(result)}`);
        }
    } else {
        const result = res.data;
        if (result['message']) {
            throw new Error(result['message']);
        } else {
            throw new Error(`Get Status Error: ${JSON.stringify(result)}`);
        }
    }
}

export async function userInfo(token) {
    const res = await fetch('https://openapi.alipan.com/oauth/users/info', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (res.ok) {
        const result = res.data;
        if (result.hasOwnProperty('avatar') && result.hasOwnProperty('name')) {
            return { avatar: result['avatar'], name: result['name'] };
        } else {
            throw new Error(`Can not find avatar or name: ${JSON.stringify(result)}`);
        }
    } else {
        const result = res.data;
        if (result['message']) {
            throw new Error(result['message']);
        } else {
            throw new Error(`Get UserInfo Error: ${JSON.stringify(result)}`);
        }
    }
}

export async function accessToken(code) {
    const res = await fetch('https://pot-app.com/api/ali_access_token', {
        method: 'POST',
        body: Body.json({
            code,
            refresh_token: '',
        }),
    });
    if (res.ok) {
        const result = res.data;
        if (result['access_token']) {
            return result['access_token'];
        } else {
            throw new Error(`Can not find access_token: ${JSON.stringify(result)}`);
        }
    } else {
        const result = res.data;
        if (result['message']) {
            throw new Error(result['message']);
        } else {
            throw new Error(`Get accessToken Error: ${JSON.stringify(result)}`);
        }
    }
}

async function driveId(token) {
    const res = await fetch('https://openapi.alipan.com/adrive/v1.0/user/getDriveInfo', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (res.ok) {
        const result = res.data;
        if (result['default_drive_id']) {
            return result['default_drive_id'];
        } else {
            throw new Error(`Can not find default_drive_id: ${JSON.stringify(result)}`);
        }
    } else {
        const result = res.data;
        if (result['message']) {
            throw new Error(result['message']);
        } else {
            throw new Error(`Get accessToken Error: ${JSON.stringify(result)}`);
        }
    }
}

async function createDir(token, drive_id) {
    const res = await fetch('https://openapi.alipan.com/adrive/v1.0/openFile/create', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: Body.json({
            drive_id,
            parent_file_id: 'root',
            name: 'pot-app',
            type: 'folder',
            check_name_mode: 'refuse',
        }),
    });
    if (res.ok) {
        const result = res.data;
        if (result['file_id']) {
            return result['file_id'];
        } else {
            throw new Error(`Can not find file_id: ${JSON.stringify(result)}`);
        }
    } else {
        const result = res.data;
        if (result['message']) {
            throw new Error(result['message']);
        } else {
            throw new Error(`Get accessToken Error: ${JSON.stringify(result)}`);
        }
    }
}

async function createFile(token, drive_id, dir_id, name) {
    const res = await fetch('https://openapi.alipan.com/adrive/v1.0/openFile/create', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: Body.json({
            drive_id,
            parent_file_id: dir_id,
            name: name,
            type: 'file',
            check_name_mode: 'refuse',
        }),
    });
    if (res.ok) {
        const result = res.data;
        if (result['file_id']) {
            const file_id = result['file_id'];
            const upload_id = result['upload_id'];
            const upload_url = result['part_info_list'][0]['upload_url'];
            return { file_id, upload_id, upload_url };
        } else {
            throw new Error(`Get file_id Error: ${JSON.stringify(result)}`);
        }
    } else {
        const result = res.data;
        if (result['message']) {
            throw new Error(result['message']);
        } else {
            throw new Error(`Get accessToken Error: ${JSON.stringify(result)}`);
        }
    }
}

async function getFileByPath(token, drive_id, name) {
    const res = await fetch('https://openapi.alipan.com/adrive/v1.0/openFile/get_by_path', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: Body.json({
            drive_id,
            file_path: `/pot-app/${name}`,
        }),
    });
    if (res.ok) {
        const result = res.data;
        if (result['file_id']) {
            return result['file_id'];
        } else {
            throw new Error(`Can not find file_id: ${JSON.stringify(result)}`);
        }
    } else {
        const result = res.data;
        if (result['message']) {
            throw new Error(result['message']);
        } else {
            throw new Error(`Get accessToken Error: ${JSON.stringify(result)}`);
        }
    }
}

async function getDownloadUrl(token, drive_id, file_id) {
    const res = await fetch('https://openapi.alipan.com/adrive/v1.0/openFile/getDownloadUrl', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: Body.json({
            drive_id,
            file_id,
        }),
    });
    if (res.ok) {
        const result = res.data;
        if (result['url']) {
            return result['url'];
        } else {
            throw new Error(`Can not find url: ${JSON.stringify(result)}`);
        }
    } else {
        const result = res.data;
        if (result['message']) {
            throw new Error(result['message']);
        } else {
            throw new Error(`Get accessToken Error: ${JSON.stringify(result)}`);
        }
    }
}
