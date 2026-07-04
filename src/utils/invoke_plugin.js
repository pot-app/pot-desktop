import { appCacheDir, appConfigDir, join } from '@tauri-apps/api/path';
import { readBinaryFile, readTextFile } from '@tauri-apps/api/fs';
import { invoke } from '@tauri-apps/api/tauri';
import { http } from '@tauri-apps/api';
import Database from 'tauri-plugin-sql-api';
import CryptoJS from 'crypto-js';
import { osType } from './env';

const ALLOWED_GLOBALS = new Set([
    'Array', 'Object', 'String', 'Number', 'Boolean',
    'Promise', 'JSON', 'Math', 'RegExp', 'Map', 'Set',
    'Error', 'TypeError', 'RangeError', 'SyntaxError', 'ReferenceError',
    'parseInt', 'parseFloat', 'isNaN', 'isFinite',
    'encodeURI', 'encodeURIComponent',
    'decodeURI', 'decodeURIComponent',
    'undefined', 'NaN', 'Infinity',
    'console',
    'Date',
    'BigInt', 'Symbol',
    'WeakMap', 'WeakSet',
    'ArrayBuffer', 'DataView', 'Uint8Array', 'Int8Array',
    'Uint16Array', 'Int16Array', 'Uint32Array', 'Int32Array',
    'Float32Array', 'Float64Array',
    'atob', 'btoa',
]);

// APIs that could leak Tauri or browser capabilities
const DENIED_GLOBALS = new Set([
    'fetch', 'XMLHttpRequest', 'WebSocket',
    'Worker', 'SharedWorker',
    'eval', 'Function',
    'window', 'document', 'globalThis', 'self', 'top', 'parent',
    'frames', 'opener',
    '__TAURI__', '__TAURI_INTERNALS__',
    'localStorage', 'sessionStorage', 'indexedDB', 'openDatabase',
    'setTimeout', 'setInterval', 'requestAnimationFrame',
    'crypto', 'subtle', 'crypto.subtle',
    'TextEncoder', 'TextDecoder',
    'Blob', 'File', 'FileReader',
    'URL', 'URLSearchParams',
    'Performance', 'performance',
    'Navigator', 'navigator',
    'Location', 'location',
    'History', 'history',
    'postMessage', 'onmessage',
]);

function createSandbox() {
    // Reify all globals once so the Proxy can return them
    const globals = {};
    for (const name of ALLOWED_GLOBALS) {
        try { globals[name] = globalThis[name]; } catch { /* skip */ }
    }
    return new Proxy(globals, {
        has() { return true }, // pretend everything exists → with() won't fall through to global
        get(_, prop) {
            if (prop === Symbol.unscopables) return undefined;
            if (prop in globals) return globals[prop];
            return undefined; // deny by default
        },
        set() { return true }, // silently ignore writes to global
    });
}

/** Cache: "pluginType/pluginName" → { fn, utils } */
const pluginCache = new Map();

export async function invoke_plugin(pluginType, pluginName) {
    const key = `${pluginType}/${pluginName}`;
    let cached = pluginCache.get(key);
    if (!cached) {
        cached = await compilePlugin(pluginType, pluginName);
        pluginCache.set(key, cached);
    }
    return [cached.fn, cached.utils];
}

async function compilePlugin(pluginType, pluginName) {
    const configDir = await appConfigDir();
    const cacheDir = await appCacheDir();
    const pluginDir = await join(configDir, 'plugins', pluginType, pluginName);
    const script = await readTextFile(await join(pluginDir, 'main.js'));

    const run = (cmdName, args) =>
        invoke('run_binary', { pluginType, pluginName, cmdName, args });

    const utils = {
        fetch: http.fetch,
        readBinaryFile,
        readTextFile,
        Database,
        CryptoJS,
        run,
        cacheDir,
        pluginDir,
        osType,
    };

    const sandbox = createSandbox();
    const wrapper = `with (__sandbox__) { ${script};\nreturn ${pluginType}; }`;
    const factory = new Function('utils', '__sandbox__', wrapper);
    const fn = factory(utils, sandbox);
    if (typeof fn !== 'function') {
        throw new Error(`Plugin entry "${pluginType}" is not a function`);
    }

    return { fn, utils };
}
