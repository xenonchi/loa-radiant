<script lang="ts">
    import { onDestroy } from 'svelte'
    import {
        type UISettings,
        settings,
        loadLocalSettings,
        updateSettings,
    } from '../store/settingsStore'
    import { Checkbox } from 'flowbite-svelte'
    $: uiSettings = loadLocalSettings()
    const settingsStoreSubscribe = settings.subscribe(
        (settings: UISettings) => {
            uiSettings = settings
        },
    )

    const updateNumericSetting = (setting: string, e: Event | null) => {
        if (e !== null && e.target !== null) {
            const val = e.target.value

            // Only allow valid numbers
            if (val == String(Number(val))) {
                updateSettings(setting, Number(val))
            }
        }
    }

    onDestroy(() => {
        settingsStoreSubscribe()
    })
</script>

<main class="overflow-hidden mt-2">
    <Checkbox
        checked={uiSettings.hidePlayer}
        spacing="mx-2"
        on:click={() => {
            updateSettings('hidePlayer', !uiSettings.hidePlayer)
        }}><p class="text-md my-auto text-white">Hide Player Info</p></Checkbox
    >

    <div class="ml-2">
        <p class="text-xs mt-2">Brand Alert Threshold (s)</p>
        <input
            class="w-12 text-black"
            value={uiSettings.brandThreshold}
            on:input={(e) => {
                updateNumericSetting('brandThreshold', e)
            }}
        />
    </div>
    <div class="ml-2">
        <p class="text-xs mt-2">Attack Buff Alert Threshold (s)</p>
        <input
            class="w-12 text-black"
            value={uiSettings.atkBuffThreshold}
            on:input={(e) => {
                updateNumericSetting('atkBuffThreshold', e)
            }}
        />
    </div>
    <div class="ml-2">
        <p class="text-xs mt-2">Effects Bar Max Duration (s)</p>
        <input
            class="w-12 text-black"
            value={uiSettings.effectsBarMaxDuration}
            on:input={(e) => {
                updateNumericSetting('effectsBarMaxDuration', e)
            }}
        />
    </div>
    <div class="ml-2">
        <p class="text-xs mt-2">Attack Buff Circle Max Duration (s)</p>
        <input
            class="w-12 text-black"
            value={uiSettings.atkBuffCircleMaxDuration}
            on:input={(e) => {
                updateNumericSetting('atkBuffCircleMaxDuration', e)
            }}
        />
    </div>
    <div class="ml-2">
        <p class="text-xs mt-2">Skill Circle Max Duration (s)</p>
        <input
            class="w-12 text-black"
            value={uiSettings.skillMaxDuration}
            on:input={(e) => {
                updateNumericSetting('skillMaxDuration', e)
            }}
        />
    </div>
</main>
