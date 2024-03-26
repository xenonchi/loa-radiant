<script lang="ts">
    import {
        type UISettings,
        settings,
        loadLocalSettings,
    } from '../store/settingsStore'
    import EffectsTrackerBar from '../lib/EffectsTrackerBar.svelte'
    import {
        type EffectsTrackerInstance,
        effectsTrackerInstance,
    } from '../store/effectsTrackerStore'
    import { onDestroy } from 'svelte'
    import SkillInstances from '../lib/SkillInstances.svelte'

    let data: EffectsTrackerInstance = {
        boss: null,
        party: [],
        player: null,
        skills: [],
    }

    $: uiSettings = loadLocalSettings()

    // Subscribe to changes in the WebSocket store
    const effectsTrackerStoreSubscribe = effectsTrackerInstance.subscribe(
        (value: EffectsTrackerInstance) => {
            // console.log(value)
            data = value
        },
    )

    const settingsStoreSubscribe = settings.subscribe(
        (settings: UISettings) => {
            uiSettings = settings
        },
    )

    $: computeBrandAlert = (threshold: number): boolean => {
        return data.boss !== null && data.boss.brand < threshold
    }

    $: computeBuffAlert = (threshold: number): boolean => {
        return (
            data.party.length > 0 &&
            data.party.filter((p) => p.atkBuff < threshold).length > 0
        )
    }

    const truncateString = (str: string, maxLength: number): string => {
        return str.length > maxLength
            ? str.slice(0, maxLength - 3) + '...'
            : str
    }

    onDestroy(() => {
        effectsTrackerStoreSubscribe()
        settingsStoreSubscribe()
    })
</script>

<main class="overflow-hidden">
    <div class="flex flex-row">
        <div class="max-w-64">
            <div class="h-12 max-h-12 bg-white bg-opacity-60">
                <EffectsTrackerBar
                    duration={data.boss?.brand ?? 0}
                    barMaxDuration={uiSettings.effectsBarMaxDuration}
                    barColor="bg-red-700"
                    pb={'pb-0'}
                />
                <div class="pt-0">
                    <p class="text-lg text-right mr-1 text-black">
                        <b
                            >{truncateString(
                                data.boss?.name ?? 'No boss detected',
                                20,
                            )}</b
                        >
                    </p>
                </div>
            </div>
            {#if data.player !== null && data.player.gearLevel > 0}
                <EffectsTrackerBar
                    duration={data.player.atkBuff}
                    barMaxDuration={uiSettings.effectsBarMaxDuration}
                    barColor="bg-orange-700"
                >
                    {uiSettings.hidePlayer
                        ? 0
                        : Math.round(data.player.gearLevel)}
                    {data.player.characterClass}{#if !uiSettings.hidePlayer}:
                        <b>{data.player.name}</b>{/if}
                </EffectsTrackerBar>
                {#if uiSettings.hidePlayer}<div
                        class="h-6 w-28 mt-[-56px] mb-[32px] bg-black"
                    ></div>{/if}
            {/if}

            {#each data.party as p}
                {#if data.player !== null && data.player.name !== p.name}
                    <EffectsTrackerBar
                        duration={p.atkBuff}
                        barMaxDuration={uiSettings.effectsBarMaxDuration}
                        barColor="bg-green-700"
                    >
                        ({p.partyNumber + 1}) {p.gearLevel}
                        {p.characterClass}
                    </EffectsTrackerBar>
                {/if}
            {/each}
        </div>
        <div class="bg-black p-2 bg-opacity-10 h-[22.5rem] w-[5rem]">
            <div class="h-[12.5rem] overflow-hidden">
                <SkillInstances
                    skillMaxDuration={uiSettings.skillMaxDuration}
                    skills={data.skills}
                />
            </div>

            <div class="h-40 overflow-hidden">
                <img
                    class={`h-16 my-2 rounded-lg pulse-element ${computeBrandAlert(uiSettings.brandThreshold) ? '' : 'opacity-0'}`}
                    src={`./skills/Buff_60.png`}
                    alt={'brand'}
                />

                <img
                    class={`h-16 my-2 rounded-lg pulse-element ${computeBuffAlert(uiSettings.atkBuffThreshold) ? '' : 'opacity-0'}`}
                    src={`./skills/Buff_15.png`}
                    alt={'brand'}
                />
            </div>
        </div>
    </div>
</main>

<style>
    .pulse-element {
        animation: pulse 0.6s infinite ease-in-out;
    }

    @keyframes pulse {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(0.9);
        }
        100% {
            transform: scale(1);
        }
    }
</style>
