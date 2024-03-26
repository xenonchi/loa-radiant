<script lang="ts">
    export let duration: number = 0
    export let barColor: string
    export let pb: string = 'pb-[78px]'
    export let variant: string = 'standard'
    export let barMaxDuration = 10

    let barHeight =
        variant === 'standard' ? 'h-6' : variant === 'small' ? 'h-4' : ''
    let barWidth =
        variant === 'standard'
            ? 'w-56'
            : variant === 'small'
              ? 'w-[10.5rem]'
              : ''
    let barWidthPerSecond =
        variant === 'standard' ? 224 / barMaxDuration : 168 / barMaxDuration
</script>

<main>
    <div class={`text-left ${barWidth} ${barHeight} relative ${pb}`}>
        <div
            class={`bg-slate-950 ${barHeight} w-full left-0 height-0 absolute opacity-40`}
        ></div>
        <div
            class={`${barColor} ${barHeight} w-full left-0 height-0 absolute opacity-30`}
        ></div>
        <div
            class={`${barColor} duration-200 ${barHeight} left-0 height-0 absolute`}
            style={`width: ${(duration > barMaxDuration ? barMaxDuration : duration) * barWidthPerSecond}px`}
        >
            {#if variant !== 'small'}
                <p class="text-xl ml-1">{duration.toFixed(1)}</p>
            {/if}
        </div>
        <div class="left-0 height-0 absolute overflow-hidden">
            <p
                class={`text-xs ${variant === 'small' ? 'ml-0 mt-0 text-right' : 'ml-14 mt-2'} overflow-hidden`}
            >
                <slot />
            </p>
        </div>
    </div>
</main>

<style>
    .blink-animation {
        animation: blink 0.7s ease-in-out infinite;
    }

    @keyframes blink {
        50% {
            opacity: 0.4;
        }
    }
</style>
