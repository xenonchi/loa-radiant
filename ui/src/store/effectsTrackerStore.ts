import { writable, Writable } from 'svelte/store'

export type EffectsTrackerInstance = {
    boss: EffectsTrackerInstanceBoss | null
    party: EffectsTrackerInstanceParty[]
    player: EffectsTrackerInstancePlayer | null
    skills: SkillInstance[]
}

export type SkillInstance = {
    skillName: string
    iconPath: string
    state: string
    t: number
}

type EffectsTrackerInstanceBoss = {
    name: string
    brand: number
}

type EffectsTrackerInstanceParty = {
    partyNumber: number
    gearLevel: number
    characterClass: string
    classId: number
    name: string
    atkBuff: number
}

type EffectsTrackerInstancePlayer = {
    gearLevel: number
    characterClass: string
    classId: number
    name: string
    atkBuff: number
}

export const effectsTrackerInstance: Writable<EffectsTrackerInstance> =
    writable({
        boss: null,
        party: [],
        player: null,
        skills: [],
    })

const ws = new WebSocket('ws://localhost:8081')

ws.onmessage = function (event) {
    effectsTrackerInstance.set(JSON.parse(event.data))
}
