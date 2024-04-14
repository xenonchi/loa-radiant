<script lang="ts">
    import {
        type UISettings,
        settings,
        loadLocalSettings,
        updateMiniOverlay,
    } from '../store/settingsStore'
    import {
        type EffectsTrackerInstance,
        effectsTrackerInstance,
    } from '../store/effectsTrackerStore'
    import { onDestroy } from 'svelte'
    import SkillInstances from '../lib/SkillInstances.svelte'
    import EffectsTrackerCircle from '../lib/EffectsTrackerCircle.svelte'
    import EffectsTrackerBar from '../lib/EffectsTrackerBar.svelte'
    import IconButton from '../lib/IconButton.svelte'
    import MaterialSymbolsKeyboardDoubleArrowLeftRounded from '../export/icons/MaterialSymbolsKeyboardDoubleArrowLeftRounded.svelte'

    let data: EffectsTrackerInstance = {
        boss: null,
        party: [],
        player: null,
        skills: [],
    }

    let uiSettings: UISettings = loadLocalSettings()

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

    $: getBuffIconPath = (): string => {
        let buffNum = 60

        if (data.player !== null) {
            const partyClasses = [
                data.player.classId,
                ...data.party.map((p) => p.classId),
            ]

            if (partyClasses.includes(204)) {
                buffNum = 60
            } else if (partyClasses.includes(105)) {
                buffNum = 67
            } else if (partyClasses.includes(602)) {
                buffNum = 498
            }
        }

        return `./skills/Buff_${buffNum}.png`
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
        <div class="flex flex-row w-screen h-18">
            <div class="bg-black bg-opacity-10 max-w-[10.5rem] overflow-hidden">
                <div>
                    <EffectsTrackerBar
                        duration={data.boss?.brand ?? 0}
                        barMaxDuration={uiSettings.effectsBarMaxDuration}
                        barColor="bg-red-700"
                        pb={'pb-0'}
                        variant={'small'}
                        ><p class="text-right w-[10rem]">
                            {truncateString(
                                data.boss?.name ?? 'No boss detected',
                                20,
                            )}
                        </p></EffectsTrackerBar
                    >
                </div>
                <div
                    class="flex flex-row overflow-hidden min-w-[10.5rem] h-20 py-3 px-3"
                >
                    <img
                        class={`h-14 mx-2 rounded-lg pulse-element ${computeBrandAlert(uiSettings.brandThreshold) ? '' : 'opacity-0'}`}
                        src={getBuffIconPath()}
                        alt={'buff'}
                    />

                    <img
                        class={`h-14 mx-2 rounded-lg pulse-element ${computeBuffAlert(uiSettings.atkBuffThreshold) ? '' : 'opacity-0'}`}
                        src={`./skills/Buff_15.png`}
                        alt={'brand'}
                    />
                </div>
                <div class="flex flex-row px-1 pb-1">
                    <EffectsTrackerCircle
                        duration={data.player?.atkBuff}
                        circleMaxDuration={uiSettings.atkBuffCircleMaxDuration}
                        disabled={data.player === null ||
                            data.player.gearLevel <= 0}
                        circleColor="orange"
                        classId={Number(data.player?.classId)}
                        gearLevel={uiSettings.hidePlayer
                            ? 0
                            : Number(data.player?.gearLevel)}
                    />
                    {#each data.party.slice(0, 4) as p}
                        {#if data.player !== null && data.player.name !== p.name}
                            <EffectsTrackerCircle
                                circleMaxDuration={uiSettings.atkBuffCircleMaxDuration}
                                duration={p.atkBuff}
                                disabled={false}
                                circleColor="green"
                                classId={Number(p.classId)}
                                gearLevel={p.gearLevel}
                            />
                        {/if}
                    {/each}
                </div>
            </div>
            <div
                class={`flex flex-row overflow-hidden my-auto py-1 px-2 ${uiSettings.collapseMini ? 'hidden' : ''}`}
            >
                <SkillInstances
                    skillMaxDuration={uiSettings.skillMaxDuration}
                    skills={data.skills}
                    numColumns={'grid-cols-3'}
                />
            </div>

            <div class="absolute h-full right-[-2px]">
                <div
                    class={`bounce-x-element ${uiSettings.collapseMini ? '' : 'bounce-x-element'}`}
                >
                    <IconButton
                        show={true}
                        onClick={() => {
                            updateMiniOverlay()
                        }}
                        tooltipText={uiSettings.collapseMini
                            ? 'Show skills'
                            : 'Hide skills'}
                    >
                        <MaterialSymbolsKeyboardDoubleArrowLeftRounded
                            class={`h-6 w-6 duration-300 text-gray-500 hover:drop-shadow-[0_0_0.3rem] ${uiSettings.collapseMini ? 'rotate-180' : ''}`}
                        />
                    </IconButton>
                </div>
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

    .bounce-x-element {
        animation: bounce 0.5s infinite ease-in-out;
    }

    @keyframes bounce {
        0%,
        100% {
            transform: translateX(-1px) translateY(0%);
        }
        50% {
            transform: translateX(1px) translateY(0%); /* Adjust the distance as needed */
        }
    }
</style>
