<script lang="ts">
    import { Tooltip, Button } from 'flowbite-svelte'

    export let onClick: () => void = () => {}
    export let show: boolean = true
    export let tooltipText: string = ''
</script>

<main class={`${show ? '' : 'hidden'}`}>
    <Button class="rounded-full p-1 focus:outline-8" on:click={onClick}>
        <slot />
    </Button>
    {#if tooltipText}
        <Tooltip
            ><div class="bg-black bg-opacity-50 rounded-lg p-1.5">
                <p class="text-xs">{tooltipText}</p>
            </div></Tooltip
        >
    {/if}
</main>
