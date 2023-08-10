import { type, arch as archFn, version } from '@tauri-apps/api/os';

export let osType = '';
export let arch = '';
export let osVersion = '';

export async function initOsType() {
    osType = await type();
}
export async function initArch() {
    arch = await archFn();
}
export async function initOsVersion() {
    osVersion = await version();
}