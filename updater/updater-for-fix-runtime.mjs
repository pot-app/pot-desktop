import fetch from 'node-fetch';
import fs from 'fs';

async function resolveUpdater() {
    if (process.env.GITHUB_TOKEN === undefined) {
        throw new Error('GITHUB_TOKEN is required');
    }

    const TOKEN = process.env.GITHUB_TOKEN;
    let version = await getVersion(TOKEN);
    let changelog = await getChangeLog(TOKEN);

    const windows_x86_64 = `https://dl.pot-app.com/https://github.com/pot-app/pot-desktop/releases/download/${version}/pot_${version}_x64_fix_webview2_runtime-setup.nsis.zip`;
    const windows_x86_64_sig = await getSignature(`https://github.com/pot-app/pot-desktop/releases/download/${version}/pot_${version}_x64_fix_webview2_runtime-setup.nsis.zip.sig`);
    const windows_i686 = `https://dl.pot-app.com/https://github.com/pot-app/pot-desktop/releases/download/${version}/pot_${version}_x86_fix_webview2_runtime-setup.nsis.zip`;
    const windows_i686_sig = await getSignature(`https://github.com/pot-app/pot-desktop/releases/download/${version}/pot_${version}_x86_fix_webview2_runtime-setup.nsis.zip.sig`);
    const windows_aarch64 = `https://dl.pot-app.com/https://github.com/pot-app/pot-desktop/releases/download/${version}/pot_${version}_arm64_fix_webview2_runtime-setup.nsis.zip`;
    const windows_aarch64_sig = await getSignature(`https://github.com/pot-app/pot-desktop/releases/download/${version}/pot_${version}_arm64_fix_webview2_runtime-setup.nsis.zip.sig`);

    let updateData = {
        name: version,
        notes: changelog,
        pub_date: new Date().toISOString(),
        platforms: {
            'windows-x86_64': { signature: windows_x86_64_sig, url: windows_x86_64 },
            'windows-i686': { signature: windows_i686_sig, url: windows_i686 },
            'windows-aarch64': { signature: windows_aarch64_sig, url: windows_aarch64 }
        },
    };
    fs.writeFile('./update-fix-runtime.json', JSON.stringify(updateData), (e) => {
        console.log(e);
    });
}

async function getVersion(token) {
    const res = await fetch('https://api.github.com/repos/pot-app/pot-desktop/releases/latest', {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (res.ok) {
        let data = await res.json();
        if (data['tag_name']) {
            return data['tag_name'];
        }
    }
}

async function getChangeLog(token) {
    const res = await fetch('https://api.github.com/repos/pot-app/pot-desktop/releases/latest', {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (res.ok) {
        let data = await res.json();
        if (data['body']) {
            let changelog_md = data['body'];

            return changelog_md;
        }
    }
}

async function getSignature(url) {
    const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/octet-stream' },
    });
    if (response.ok) {
        return response.text();
    } else {
        return '';
    }
}

resolveUpdater().catch(console.error);
