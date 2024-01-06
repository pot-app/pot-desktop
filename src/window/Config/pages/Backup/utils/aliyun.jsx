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
    const res = await fetch('https://openapi.alipan.com/adrive/v1.0/user/getDriveInfo', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (res.ok) {
        const result = res.data;
        if (result['default_drive_id']) {
            const drive_id = result['default_drive_id'];
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
                    const parent_file_id = result['file_id'];
                    const res = await fetch('https://openapi.alipan.com/adrive/v1.0/openFile/create', {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        body: Body.json({
                            drive_id,
                            parent_file_id,
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
                        } else {
                            throw new Error(`Can not find file_id: ${JSON.stringify(result)}`);
                        }
                    } else {
                        throw new Error(`Create file Error: ${JSON.stringify(res)}`);
                    }
                } else {
                    throw new Error(`Can not find file_id: ${JSON.stringify(result)}`);
                }
            } else {
                throw new Error(`Create folder Error: ${JSON.stringify(res)}`);
            }
        } else {
            throw new Error(`Can not find default_drive_id: ${JSON.stringify(result)}`);
        }
    } else {
        throw new Error(`getDriveInfo Error: ${JSON.stringify(res)}`);
    }
}

export async function list(token) {
    const res = await fetch('https://openapi.alipan.com/adrive/v1.0/user/getDriveInfo', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (res.ok) {
        const result = res.data;
        if (result['default_drive_id']) {
            const drive_id = result['default_drive_id'];
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
                    const file_id = result['file_id'];
                    const res = await fetch('https://openapi.alipan.com/adrive/v1.0/openFile/list', {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        body: Body.json({
                            drive_id,
                            parent_file_id: file_id,
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
                        throw new Error(`Get File List Error: ${JSON.stringify(res)}`);
                    }
                } else {
                    throw new Error(`Can not find file_id: ${JSON.stringify(result)}`);
                }
            } else {
                throw new Error(`Create folder Error: ${JSON.stringify(res)}`);
            }
        } else {
            throw new Error(`Can not find default_drive_id: ${JSON.stringify(result)}`);
        }
    } else {
        throw new Error(`getDriveInfo Error: ${JSON.stringify(res)}`);
    }
}

export async function get(token, name) {
    const res = await fetch('https://openapi.alipan.com/adrive/v1.0/user/getDriveInfo', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (res.ok) {
        const result = res.data;
        if (result['default_drive_id']) {
            const drive_id = result['default_drive_id'];
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
                    const file_id = result['file_id'];
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
                            await invoke('aliyun', { operate: 'get', path: '', url: result['url'] });
                        } else {
                            throw new Error(`Get Download Url Error: ${JSON.stringify(result)}`);
                        }
                    } else {
                        throw new Error(`Get Download Url Error: ${JSON.stringify(res)}`);
                    }
                } else {
                    throw new Error(`Can not find file_id: ${JSON.stringify(result)}`);
                }
            } else {
                throw new Error(`Get file_id Error: ${JSON.stringify(res)}`);
            }
        } else {
            throw new Error(`Can not find default_drive_id: ${JSON.stringify(result)}`);
        }
    } else {
        throw new Error(`getDriveInfo Error: ${JSON.stringify(res)}`);
    }
}

export async function remove(token, name) {
    const res = await fetch('https://openapi.alipan.com/adrive/v1.0/user/getDriveInfo', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (res.ok) {
        const result = res.data;
        if (result['default_drive_id']) {
            const drive_id = result['default_drive_id'];
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
                    const file_id = result['file_id'];
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
                        throw new Error(`Delete file Error: ${JSON.stringify(res)}`);
                    }
                } else {
                    throw new Error(`Can not find file_id: ${JSON.stringify(result)}`);
                }
            } else {
                throw new Error(`Get file_id Error: ${JSON.stringify(res)}`);
            }
        } else {
            throw new Error(`Can not find default_drive_id: ${JSON.stringify(result)}`);
        }
    } else {
        throw new Error(`getDriveInfo Error: ${JSON.stringify(res)}`);
    }
}

export async function qrcode() {
    return await fetch('https://openapi.alipan.com/oauth/authorize/qrcode', {
        method: 'POST',
        body: Body.json({
            client_id: 'bf56dd2dc03a4d3489e3dda05dd6d466',
            scopes: ['user:base', 'file:all:read', 'file:all:write'],
        }),
    });
}

export async function status(sid) {
    return await fetch(`https://openapi.alipan.com/oauth/qrcode/${sid}/status`);
}

export async function userInfo(token) {
    return await fetch('https://openapi.alipan.com/oauth/users/info', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
}

export async function accessToken(code) {
    return await fetch('https://pot-app.com/api/ali_access_token', {
        method: 'POST',
        body: Body.json({
            code,
            refresh_token: '',
        }),
    });
}
