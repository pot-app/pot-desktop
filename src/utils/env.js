import { type, arch as archFn, version } from '@tauri-apps/api/os';
import { getVersion } from '@tauri-apps/api/app';

export let osType = '';
export let arch = '';
export let osVersion = '';
export let appVersion = '';

export async function initOsType() {
    osType = await type();
}
export async function initArch() {
    arch = await archFn();
}
export async function initOsVersion() {
    osVersion = await version();
}
export async function initAppVersion() {
    appVersion = await getVersion();
}