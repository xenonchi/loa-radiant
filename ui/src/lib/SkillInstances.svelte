<script lang="ts">
    import { type SkillInstance } from '../store/effectsTrackerStore'
    import SkillCircle from './SkillCircle.svelte'
    export let skills: SkillInstance[] = []
    export let numColumns: string = 'grid-cols-1'
    export let skillMaxDuration: number
</script>

<main class={`grid ${numColumns}`}>
    {#each skills as s}
        <SkillCircle {skillMaxDuration} skl={s} />
    {/each}
</main>
