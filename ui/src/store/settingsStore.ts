import { writable, Writable } from 'svelte/store'

export type UISettings = {
    hidePlayer: boolean
    tab: number
    collapseMini: boolean
    brandThreshold: number
    atkBuffThreshold: number
    effectsBarMaxDuration: number
    atkBuffCircleMaxDuration: number
    skillMaxDuration: number
}

export const defaultSettings: UISettings = {
    hidePlayer: false,
    tab: 1,
    collapseMini: false,
    brandThreshold: 0.75,
    atkBuffThreshold: 0.75,
    effectsBarMaxDuration: 10,
    atkBuffCircleMaxDuration: 10,
    skillMaxDuration: 10,
}

export const saveLocalSettings = (settings: UISettings): void => {
    localStorage.setItem('uiSettings', JSON.stringify(settings))
}

export const loadLocalSettings = (): UISettings => {
    const localSettings = JSON.parse(localStorage.getItem('uiSettings') ?? '{}')

    if (Object.keys(localSettings).length === 0) {
        saveLocalSettings(defaultSettings)
        return defaultSettings
    } else {
        return localSettings
    }
}

// Add new settings after update
const initiallyLoadedSettingKeys = Object.keys(loadLocalSettings())
Object.keys(defaultSettings)
    .filter((k) => !initiallyLoadedSettingKeys.includes(k))
    .map((k) =>
        saveLocalSettings({
            ...loadLocalSettings(),
            [k]: defaultSettings[k],
        }),
    )

export const settings: Writable<UISettings> = writable(loadLocalSettings())

export function updateSettings(
    setting: string,
    value: string | number | boolean,
) {
    settings.update((settings) => {
        const newSettings = { ...settings, [setting]: value }
        saveLocalSettings(newSettings)
        return newSettings
    })
}

const tabCodes: { [key: number]: string } = {
    0: 'Overlay',
    1: 'Minimized Overlay',
    100: 'Settings',
}

export function updateTab(windowCode: number) {
    settings.update((settings) => {
        const newSettings = { ...settings, tab: windowCode }
        saveLocalSettings(newSettings)

        // try-catch for testing on browser
        try {
            if ([0, 100].includes(windowCode)) {
                windowResize.normal()
            } else if ([1].includes(windowCode)) {
                resizeMiniOverlay(newSettings.collapseMini)
            }
        } catch (e) {
            console.log(e)
        }
        return newSettings
    })
}

export function updateMiniOverlay(b: boolean | undefined = undefined) {
    settings.update((settings) => {
        const newSettings = {
            ...settings,
            collapseMini: b ?? !settings.collapseMini,
        }
        saveLocalSettings(newSettings)
        resizeMiniOverlay(newSettings.collapseMini)

        return newSettings
    })
}

function resizeMiniOverlay(collapseMini: boolean) {
    try {
        if (collapseMini) {
            windowResize.minimizedHCollapse()
        } else {
            windowResize.minimizedH()
        }
    } catch (e) {
        console.log(e)
    }
}

// For handling resizing
const preloadSettings = loadLocalSettings()
updateTab(preloadSettings.tab)

if (preloadSettings.tab === 1) {
    resizeMiniOverlay(preloadSettings.collapseMini)
}
