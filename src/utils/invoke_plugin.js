import { readTextFile } from "@tauri-apps/api/fs";
import { appCacheDir, appConfigDir, join } from "@tauri-apps/api/path";
import { invoke } from "@tauri-apps/api/tauri";
import { fetch } from "@tauri-apps/api/http";
import CryptoJS from "crypto-js";
import { osType } from "./env";

export async function invoke_plugin(pluginType, pluginName) {
    let configDir = await appConfigDir();
    let cacheDir = await appCacheDir();
    let pluginDir = await join(configDir, "plugins", pluginType, pluginName);
    let entryFile = await join(pluginDir, "main.js");
    let script = await readTextFile(entryFile);
    async function run(cmdName, args) {
        return await invoke("run_binary", {
            pluginType,
            pluginName,
            cmdName,
            args
        });
    }
    const utils = {
        tauriFetch: fetch,
        CryptoJS,
        run,
        cacheDir,
        pluginDir,
        osType
    }
    return [eval(`${script} ${pluginType}`), utils];
}