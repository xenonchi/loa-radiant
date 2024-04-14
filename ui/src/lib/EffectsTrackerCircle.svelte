<script lang="ts">
    export let duration: number = 0
    export let disabled: boolean = false
    export let circleColor: string
    export let classId: number
    export let gearLevel: number
    export let circleMaxDuration = 10

    if (isNaN(classId)) {
        classId = -1
    }

    $: angle =
        (360 / circleMaxDuration) *
        (duration > circleMaxDuration ? circleMaxDuration : duration)

    $: background = `radial-gradient(white 50%, transparent 51%),
conic-gradient(transparent 0deg ${angle}deg, gainsboro ${angle}deg 360deg),
conic-gradient(${circleColor} 0deg, ${circleColor});`

    $: cssVarStyles = `--background:${background}`
</script>

<main>
    <div
        id="progress-circle"
        class={`h-8 w-8 p-[0.2rem] duration-200 relative mx-1`}
        style={cssVarStyles}
    >
        <div
            class="bg-slate-900 h-full w-full rounded-full duration-300 overflow-hidden"
        >
            <img
                class={`rounded-full ${disabled ? 'scale-95 mt-[1px]' : 'scale-105'}`}
                src={`./classes/${classId}.png`}
                alt={'skill'}
            />
        </div>
    </div>
    <p class={`text-center text-[0.65rem]`}>
        {disabled ? 'N/A' : Math.round(gearLevel)}
    </p>
</main>

<style>
    #progress-circle {
        background: var(--background);
        border-radius: 50%;
        transition: all 200ms ease-in;
        will-change: transform;
    }
</style>
