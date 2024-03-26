<script lang="ts">
    import MaterialSymbolsSettingsRounded from '../export/icons/MaterialSymbolsSettingsRounded.svelte'
    import MdiViewCompact from '../export/icons/MdiViewCompact.svelte'
    import RiBarChartHorizontalFill from '../export/icons/RiBarChartHorizontalFill.svelte'
    import MdiGhostOutline from '../export/icons/MdiGhostOutline.svelte'

    import IconButton from './IconButton.svelte'
    import {
        type UISettings,
        settings,
        loadLocalSettings,
        updateTab,
    } from '../store/settingsStore'
    import { onDestroy } from 'svelte'

    $: uiSettings = loadLocalSettings()
    const settingsStoreSubscribe = settings.subscribe(
        (settings: UISettings) => {
            uiSettings = settings
        },
    )

    onDestroy(() => {
        settingsStoreSubscribe()
    })

    $: iconButtonClasses = (tab: number) =>
        `w-5 h-5 hover:drop-shadow-[0_0_0.55rem] duration-200 ${uiSettings.tab === tab ? 'drop-shadow-[0_0_0.55rem]' : ''}`
</script>

<main>
    <div class="flex flex-row mr-1 z-10">
        <div class="flex-1 draggable">
            <div class="flex flex-1">
                <img
                    class="h-6 my-0.5 mx-1"
                    src={'./icons/icon.png'}
                    alt={'icon'}
                />
                <div class="flex-col hidden mini:flex">
                    <p class="text-xs" style="font-family: 'Raleway'">
                        LOA Radiant
                    </p>
                    <p
                        class="text-[0.6rem] mt-[-2px] opacity-70 font-bold"
                        style="font-family: 'Raleway'"
                    >
                        v0.1.0 BETA
                    </p>
                </div>
            </div>
        </div>
        <IconButton
            show={false}
            onClick={() => {
                updateTab(0)
            }}
            tooltipText={'Full Overlay'}
        >
            <RiBarChartHorizontalFill class={iconButtonClasses(0)} />
        </IconButton>
        <IconButton
            show={false}
            onClick={() => {
                updateTab(100)
            }}
            tooltipText={'Clickthrough'}
        >
            <MdiGhostOutline class={iconButtonClasses(100)} />
        </IconButton>
        <IconButton
            show={true}
            onClick={() => {
                updateTab(1)
            }}
            tooltipText={'Mini Overlay'}
        >
            <MdiViewCompact class={iconButtonClasses(1)} />
        </IconButton>
        <IconButton
            show={true}
            onClick={() => {
                updateTab(100)
            }}
            tooltipText={'Settings'}
        >
            <MaterialSymbolsSettingsRounded class={iconButtonClasses(100)} />
        </IconButton>
    </div>
</main>
