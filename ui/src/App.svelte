<script lang="ts">
    import { onDestroy } from 'svelte'
    import HeaderBar from './lib/HeaderBar.svelte'
    import EffectsTracker from './pages/EffectsTracker.svelte'
    import EffectsTrackerMinimized from './pages/EffectsTrackerMinimized.svelte'
    import {
        type UISettings,
        settings,
        loadLocalSettings,
    } from './store/settingsStore'
    import Settings from './pages/Settings.svelte'

    $: uiSettings = loadLocalSettings()
    const settingsStoreSubscribe = settings.subscribe(
        (settings: UISettings) => {
            uiSettings = settings
        },
    )

    onDestroy(() => {
        settingsStoreSubscribe()
    })
</script>

<main class="min-h-screen text-white flex flex-col select-none overflow-hidden">
    <!-- Middle Part -->

    <section class="mt-7">
        <div class="absolute z-10 overflow-hidden">
            {#if uiSettings.tab === 0}
                <EffectsTracker />
            {:else if uiSettings.tab === 1}
                <EffectsTrackerMinimized />
            {:else if uiSettings.tab === 100}
                <Settings />
            {/if}
        </div>
        <div
            class={`top-0 left-0 absolute w-screen h-screen z-0 bg-slate-950 ${uiSettings.tab > 99 ? 'opacity-40' : 'opacity-[0.04]'}`}
        ></div>
    </section>

    <!-- Header -->
    <footer class="bg-gray-950 bg-opacity-60 fixed h-7 top-0 left-0 w-full">
        <HeaderBar />
    </footer>
</main>
