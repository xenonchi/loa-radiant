import { SkillOptionData } from "meter-core/src/packets/common/SkillOptionData"
import { BossKillData } from "meter-core/src/packets/generated/structures/BossKillData"

export type TrimmedSkillCastNotify = {
    sourceId: number
    skillLevel: number
    skillId: number
}

export type TrimmedSkillStartNotify = {
    sourceId: number
    skillLevel: number
    skillOptionData: SkillOptionData | undefined
    skillId: number
}

export type TrimmedSkillCancelNotify = {
    sourceId: number
    skillId: number
}

export type SkillInstanceInfo = TrimmedSkillStartNotify

export type TrimmedStatusEffectAddNotify = {
    sourceId: number
    objectId: number
    effectInstanceId: number
    statusEffectId: number
    totalTime: number
}

export type TrimmedStatusEffectRemoveNotify = {
    objectId: number
    statusEffectIds: number[]
}

export type TrimmedIdentityGaugeChangeNotify = {
    identityGauge: number
}

export type PartyMember = {
    partyNumber: number
    name: string
    gearLevel: number
    characterClass: string
    characterId: number
    classId: number
    playerId: number
}

export type TrimmedPartyInfo = {
    partyInfo: PartyMember[]
}

export type TrimmedPartyLeaveResult = {
    name: string
    partyInstanceId: number
    partyLeaveType: number
}

export type TrimmedInitEnv = {
    playerId: number
}

export type TrimmedInitPC = {
    playerId: number
    characterId: number
    characterClass: string
    classId: number
    gearLevel: number
    name: string
    statPairs: StatPairs
}

export type StatPairs = {
    swiftness: number
}

export type PlayerInfo = TrimmedInitPC

export type NpcData = {
    id: number
    name: string
    grade: string
    type: string
}

export type NPCInfo = {
    objectId: number
    id: number
    name: string
    grade: string
}

export type TrimmedNpcData = {
    objectId: number
    id: number
    name: string
    grade: string
}

export type TrimmedNpcSummon = {
    ownerId: number
    objectId: number
    typeId: number
}

export type TrimmedNewPC = {
    name: string
    avgItemLevel: number
    characterClass: string
    classId: number
    guildName: string
    worldId: number
    characterId: number
    playerId: number
}

export type PCInfo = TrimmedNewPC

export type TrimmedRaidResult = {
    raidResult: number
}

export type TrimmedRaidBegin = {
    raidResult: number
    bossKillDataList: BossKillData[]
    raidId: number
}

export type TrimmedTriggerBossBattleStatus = {
    triggerId: number
    step: number
}

export type TrimmedTriggerStartNotify = {
    triggerId: number
    triggerSignalType: number
}

export type TrimmedTriggerFinishNotify = {
    triggerId: number
    packetResultCode: number
}
