import { readTextFile } from "@tauri-apps/api/fs";
import { appConfigDir, join } from "@tauri-apps/api/path";
import { invoke } from "@tauri-apps/api/tauri";
import { fetch } from "@tauri-apps/api/http";
import CryptoJS from "crypto-js";

export async function invoke_plugin(plugin_type, name) {
    let config_dir = await appConfigDir();
    let plugin_dir = await join(config_dir, "plugins", plugin_type, name);
    let entry_file = await join(plugin_dir, "main.js");
    let script = await readTextFile(entry_file);
    async function run(exe_name, args) {
        return await invoke("run_binary", {
            plugin_type,
            plugin_name: name,
            exe_name,
            args
        });
    }
    const utils = {
        tauriFetch: fetch,
        crypto: CryptoJS,
        run: run
    }
    return [eval(`${script} ${plugin_type}`), utils];
}