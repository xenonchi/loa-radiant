// Modules to control application life and create native browser window
const { log } = require('console')
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

const cap = require('cap')
const { InitMeterData, InitLogger } = require('./pkt/api.cjs')

if (require('electron-squirrel-startup')) app.quit()

const isDevEnvironment = process.env.DEV_ENV === 'true'

// enable live reload for electron in dev mode
if (isDevEnvironment) {
    require('electron-reload')(__dirname, {
        electron: path.join(
            __dirname,
            '..',
            'node_modules',
            '.bin',
            'electron',
        ),
        hardResetMethod: 'exit',
    })
}

let mainWindow

const createWindow = () => {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 304,
        height: 384,
        x: 53,
        y: 266,
        transparent: true,
        resizable: true,
        frame: false,
        focusable: true,
        alwaysOnTop: true,
        closable: true,
        icon: __dirname + '/icon.png',

        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    })

    mainWindow.on('focus', () => {
        mainWindow.setIgnoreMouseEvents(false)
    })

    mainWindow.on('blur', () => {
        mainWindow.setIgnoreMouseEvents(true)
    })

    mainWindow.setIgnoreMouseEvents(true)

    // define how electron will load the app
    if (isDevEnvironment) {
        // if your vite app is running on a different port, change it here
        mainWindow.loadURL('http://localhost:5173/')

        log('Electron running in dev mode: 🧪')
    } else {
        // when not in dev mode, load the build file instead

        /**
         * Ignore mouse event
         */
        mainWindow.loadFile(path.join(__dirname, 'build', 'index.html'))

        log('Electron running in prod mode: 🚀')
    }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

ipcMain.on('window-size-change', (event, { width, height }) => {
    if (mainWindow) {
        mainWindow.setSize(width, height)
    }
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
// app.on('window-all-closed', () => {
//     if (process.platform !== 'darwin') app.quit()
// })

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
