import { type, arch as archFn, version } from '@tauri-apps/api/os';
import { getVersion } from '@tauri-apps/api/app';
import { isTauri } from './runtime';

export let osType = '';
export let arch = '';
export let osVersion = '';
export let appVersion = '';

export async function initEnv() {
    if (!isTauri()) {
        osType = 'Web';
        arch = 'browser';
        osVersion = navigator.userAgent;
        appVersion = import.meta.env.PACKAGE_VERSION || '';
        return;
    }

    osType = await type();
    arch = await archFn();
    osVersion = await version();
    appVersion = await getVersion();
}
