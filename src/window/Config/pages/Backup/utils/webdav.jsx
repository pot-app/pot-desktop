import { invoke } from '@tauri-apps/api';

export async function backup(url, username, password, name) {
    return await invoke('webdav', {
        operate: 'put',
        url,
        username,
        password,
        name,
    });
}

export async function list(url, username, password) {
    const backup_list_text = await invoke('webdav', {
        operate: 'list',
        url,
        username,
        password,
    });
    let backup_list = JSON.parse(backup_list_text);
    backup_list = backup_list.filter((item) => {
        return item.hasOwnProperty('File');
    });
    return backup_list.map((file) => {
        return file.File.href.split('/').slice(-1)[0];
    });
}

export async function get(url, username, password, name) {
    const _ = await invoke('webdav', {
        operate: 'get',
        url,
        username,
        password,
        name,
    });
}

export async function remove(url, username, password, name) {
    return await invoke('webdav', {
        operate: 'delete',
        url,
        username,
        password,
        name,
    });
}
