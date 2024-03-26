const { contextBridge, ipcRenderer } = require('electron')

const api = {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
}

console.log(
    `Node version: ${api.node()} | Chrome version: ${api.chrome()} | Electron version: ${api.electron()}`,
)

contextBridge.exposeInMainWorld('windowResize', {
    normal: () =>
        ipcRenderer.send('window-size-change', { width: 304, height: 388 }),
    minimizedH: () =>
        ipcRenderer.send('window-size-change', { width: 372, height: 176 }),
    minimizedHCollapse: () =>
        ipcRenderer.send('window-size-change', { width: 196, height: 176 }),
})
