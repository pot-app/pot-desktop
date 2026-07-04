import { type, arch as archFn, version } from '@tauri-apps/api/os';
import { getVersion } from '@tauri-apps/api/app';

/** Initialized by initEnv() before React renders. @see main.jsx */
export let osType = '';
export let arch = '';
export let osVersion = '';
export let appVersion = '';

export async function initEnv() {
    if (osType) return; // idempotent
    osType = await type();
    arch = await archFn();
    osVersion = await version();
    appVersion = await getVersion();
}
