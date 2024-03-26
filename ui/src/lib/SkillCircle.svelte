<script lang="ts">
    import { type SkillInstance } from '../store/effectsTrackerStore'

    export let skl: SkillInstance
    export let skillMaxDuration = 10

    $: angle =
        skl.state === 'Active'
            ? (360 / skillMaxDuration) *
              (skl.t > skillMaxDuration ? skillMaxDuration : skl.t)
            : 0

    $: background = `radial-gradient(white 50%, transparent 51%),
    conic-gradient(transparent 0deg ${angle}deg, gainsboro ${angle}deg 360deg),
    conic-gradient(blue 0deg, blue);`

    $: cssVarStyles = `--background:${background}`
</script>

<main>
    <div
        id="progress-circle"
        class={`h-[3.5rem] w-[3.5rem] m-1 p-1 duration-200 relative ${skl.state === 'Expired' ? 'opacity-30' : ''}`}
        style={cssVarStyles}
    >
        <img
            class={`rounded-full ${skl.state === 'Casting' ? 'spin-element' : ''} `}
            src={`./skills/${skl.iconPath}`}
            alt={'skill'}
        />
        {#if skl.state !== 'Expired'}
            <div
                class="absolute inset-0 bg-black opacity-40 rounded-full m-1"
            ></div>
        {/if}
        {#if skl.state === 'Active'}
            <p
                class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-lg"
            >
                {skl.t.toFixed(1)}
            </p>
        {/if}
    </div>
</main>

<style>
    #progress-circle {
        background: var(--background);
        border-radius: 50%;
        transition: all 200ms ease-in;
        will-change: transform;
    }

    .spin-element {
        animation: spin 0.15s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
</style>
