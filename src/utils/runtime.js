export const isTauri = () => Boolean(window.__TAURI_IPC__);

export const getWebWindowLabel = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('window') || params.get('label') || 'translate';
};
