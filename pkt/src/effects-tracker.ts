// @ts-ignore
import { MeterData } from "meter-core/data"
import { StatusEffectsTypes, statusEffectsByType } from "./helpers/constants"
import {
    TrimmedIdentityGaugeChangeNotify,
    TrimmedInitEnv,
    TrimmedPartyInfo,
    TrimmedStatusEffectAddNotify,
    TrimmedStatusEffectRemoveNotify,
    PartyMember,
    NPCInfo,
    TrimmedNpcData,
    PlayerInfo,
    TrimmedInitPC,
    TrimmedSkillCastNotify,
    TrimmedSkillStartNotify,
    TrimmedNpcSummon,
    TrimmedNewPC,
    PCInfo,
    TrimmedSkillCancelNotify,
} from "./helpers/pkt-trimmed"
import { SkillInstance, getSecondsNow } from "./helpers/tracked-skills"

import { getMeterDataPath } from "./helpers/meter-data-path"
const meterDataPath = getMeterDataPath()

const meterData = new MeterData()
meterData.loadDbs(`${meterDataPath}/databases`)

const padToDigits = (num: number, d: number = 2) =>
    num.toString().padStart(d, "0")

export function getTimeNow() {
    const date = new Date()
    return [
        padToDigits(date.getHours()),
        padToDigits(date.getMinutes()),
        padToDigits(date.getSeconds()),
        padToDigits(date.getMilliseconds(), 3),
    ].join(":")
}

//**********************************
/**************************************
 * CLASSES
 ***************************************/

class Effect {
    id: number
    statusEffectId: number
    endTime: number

    constructor(id: number, statusEffectId: number, endTime: number) {
        this.id = id // effectInstanceId
        this.statusEffectId = statusEffectId
        this.endTime = endTime
    }

    isOngoing(): boolean {
        /**
         * Checks if effect has ended.
         * Effects do not end on entity death.
         */

        return this.endTime > getSecondsNow()
    }

    remainingDuration(): number {
        return Math.round((this.endTime - getSecondsNow()) * 100) / 100
    }

    show() {
        const skillName =
            meterData.skillBuff.get(this.statusEffectId)?.name ||
            `ID${this.statusEffectId}`
        const remainingDuration = this.remainingDuration()
        return `${skillName}: ${remainingDuration}s`
    }
}

const defaultPlayerInfo: PlayerInfo = {
    playerId: -1,
    characterId: -1,
    characterClass: "N/A",
    classId: -1,
    gearLevel: -1,
    name: "N/A",
    statPairs: {
        swiftness: 1550,
    },
}

export class EffectsTracker {
    private playerInfo: PlayerInfo
    private identityGauge: number
    private bossInfo: NPCInfo[]
    private partyInfo: PartyMember[]
    private nearbyPC: Map<number, PCInfo>
    private summonsTracker: Map<number, number>
    private skillsTracker: Map<number, SkillInstance>
    private entityTracker: Map<number, Effect[]>
    private lastEffectTimeTracker: Map<number, number>
    private startTime: number
    private latestBuff: Effect | null

    constructor() {
        this.playerInfo = defaultPlayerInfo
        this.identityGauge = 0
        this.bossInfo = []
        this.partyInfo = []
        this.nearbyPC = new Map<number, PCInfo>()
        this.summonsTracker = new Map<number, number>()
        this.skillsTracker = new Map<number, SkillInstance>()
        this.entityTracker = new Map<number, Effect[]>()
        this.lastEffectTimeTracker = new Map<number, number>()
        this.startTime = getSecondsNow()
        this.latestBuff = null
    }

    resetStartTime(): void {
        this.startTime = getSecondsNow()
    }

    getElapsedTime(): number {
        return getSecondsNow() - this.startTime
    }

    resetTracker(): void {
        this.resetStartTime()
        this.bossInfo = []
        this.nearbyPC = new Map<number, PCInfo>()
        this.skillsTracker = new Map<number, SkillInstance>()
        this.removeExpiredEntities(300)
        this.latestBuff = null
    }

    //**********************************
    /**************************************
     * STATUS EFFECT PACKETS
     ***************************************/

    addEffectEntity(trimmedPKT: TrimmedStatusEffectAddNotify): void {
        /**
         * Add an effect.
         * All duplicate effects are removed beforehand.
         * Create a new key if it does not already exist.
         */

        if (this.isUntrackedEntity(trimmedPKT.objectId)) {
            // Target must be tracked
            return
        }

        if (this.isUntrackedEntity(trimmedPKT.sourceId)) {
            // Source must be player, party member or summon
            return
        }

        const effect = new Effect(
            trimmedPKT.effectInstanceId,
            trimmedPKT.statusEffectId,
            getSecondsNow() + trimmedPKT.totalTime,
        )

        this.updateLastEffectTimeTracker(trimmedPKT.objectId, effect)
        EffectsTracker.removeVals(this.entityTracker, trimmedPKT.objectId, [
            effect.id,
        ])
        EffectsTracker.handleAppendVal(
            this.entityTracker,
            trimmedPKT.objectId,
            effect,
        )
    }

    setLatestBuff(trimmedPKT: TrimmedStatusEffectAddNotify): void {
        const effect = new Effect(
            trimmedPKT.effectInstanceId,
            trimmedPKT.statusEffectId,
            getSecondsNow() + trimmedPKT.totalTime,
        )

        this.latestBuff = effect
    }

    removeEffectEntity(trimmedPKT: TrimmedStatusEffectRemoveNotify): void {
        /**
         * Remove an effect.
         */

        if (
            !this.entityTracker.has(trimmedPKT.objectId) ||
            this.isUntrackedEntity(trimmedPKT.objectId)
        ) {
            return
        } else {
            EffectsTracker.removeVals(
                this.entityTracker,
                trimmedPKT.objectId,
                trimmedPKT.statusEffectIds,
            )
        }
    }

    //**********************************
    /**************************************
     * STATUS EFFECT ENTITIES METHODS
     ***************************************/

    whichTrackedEntity(objectId: number): number {
        /**
         * 0: NONE, 1: SELF, 2: PARTY, 3: BOSS, 4: SUMMONS
         */
        if (this.playerInfo.playerId === objectId) {
            return 1
        } else if (
            this.partyInfo.map((p) => p.characterId).includes(objectId) ||
            this.partyInfo.map((p) => p.playerId).includes(objectId)
        ) {
            return 2
        } else if (this.bossInfo.map((b) => b.objectId).includes(objectId)) {
            return 3
        } else if (
            Array.from(this.summonsTracker.values()).includes(objectId)
        ) {
            return 4
        } else {
            return 0
        }
    }

    isUntrackedEntity(objectId: number): boolean {
        return this.whichTrackedEntity(objectId) === 0
    }

    addBossEntity(trimmedPKT: TrimmedNpcData): void {
        //this.bossInfo = [trimmedPKT as NPCInfo]
        this.bossInfo.push(trimmedPKT as NPCInfo)
    }

    addPartyEntities(trimmedPKT: TrimmedPartyInfo): void {
        /**
         * Information on party members.
         * Usually generated on when a new member joins.
         */

        this.partyInfo = trimmedPKT.partyInfo

        /**
         * When a status effect is applied on party members, their characterId is used,
         * but for the player, their objectId is used
         */
        for (const partyMember of this.partyInfo) {
            if (partyMember.characterId === this.playerInfo.characterId) {
                partyMember.characterId = this.playerInfo.playerId
            }

            this.syncPlayerIDFromPartyInfo(partyMember.characterId)
        }
    }

    syncPlayerIDFromPartyInfo(characterId: number): void {
        /**
         * When a new party member is added, check nearbyPC
         * to match the playerId
         */

        const pcInfo = this.nearbyPC.get(characterId)

        if (pcInfo !== undefined) {
            this.syncPartyMemberPlayerID(characterId, pcInfo)
        }
    }

    syncPartyMemberPlayerID(characterId: number, pcInfo: PCInfo): void {
        const partyMemberFilter = this.partyInfo.filter(
            (p) => p.characterId === characterId,
        )

        if (partyMemberFilter.length === 1) {
            const partyMember = partyMemberFilter[0]
            const editedPartyMember = {
                ...partyMember,
                playerId: pcInfo.playerId,
            }

            this.partyInfo = this.partyInfo
                .filter((p) => p.characterId !== characterId)
                .concat(editedPartyMember as PartyMember)
        }
    }

    syncPlayerIDFromNewPC(trimmedPKT: TrimmedNewPC): void {
        /**
         * When a new PC ia detected, if it is a party member, add
         * playerId to partyInfo
         */

        this.nearbyPC.set(trimmedPKT.characterId, trimmedPKT)

        if (
            this.partyInfo
                .map((p) => p.characterId)
                .includes(trimmedPKT.characterId)
        ) {
            this.syncPartyMemberPlayerID(
                trimmedPKT.characterId,
                trimmedPKT as PCInfo,
            )
        }
    }

    updateLastEffectTimeTracker(objectId: number, effect: Effect) {
        /**
         * Tracks the last time an entity was affected by an effect.
         */

        this.lastEffectTimeTracker.set(objectId, effect.endTime)
    }

    removeExpiredEntities(threshold: number): void {
        /**
         * Remove entities that have not been affected by an effect
         * within a set amount of time.
         *
         * threshold: time in seconds
         */

        const currentTime = getSecondsNow()

        for (const [id, t] of this.lastEffectTimeTracker.entries()) {
            if (t < currentTime - threshold) {
                this.lastEffectTimeTracker.delete(id)
                if (this.entityTracker.has(id)) {
                    this.entityTracker.delete(id)
                }
            }
        }
    }

    //**********************************
    /**************************************
     * SKILL TRACKER METHODS
     ***************************************/

    updateSkillCastNotify(trimmedPKT: TrimmedSkillCastNotify) {
        this.updateSkillStartNotify({
            ...trimmedPKT,
            skillOptionData: undefined,
        })
    }

    updateSkillStartNotify(trimmedPKT: TrimmedSkillStartNotify) {
        if (trimmedPKT.sourceId === this.playerInfo.playerId) {
            const skillInstance = new SkillInstance(
                this.playerInfo.statPairs.swiftness,
                meterData.skill.get(trimmedPKT.skillId)?.name ||
                    "SKILL_NOT_FOUND",
                meterData.skill.get(trimmedPKT.skillId)?.icon ||
                    "PATH_NOT_FOUND",
                trimmedPKT,
            )

            this.skillsTracker.set(trimmedPKT.skillId, skillInstance)
        }
    }

    updateSkillCancelNotify(trimmedPKT: TrimmedSkillCancelNotify) {
        if (trimmedPKT.sourceId === this.playerInfo.playerId) {
            const skillInstance = this.skillsTracker.get(trimmedPKT.skillId)

            if (skillInstance !== undefined) {
                skillInstance.cancelSkill()
            }
        }
    }

    //**********************************
    /**************************************
     * OTHER PACKETS MISC METHODS
     ***************************************/

    updateSummons(trimmedPKT: TrimmedNpcSummon): void {
        if (this.isUntrackedEntity(trimmedPKT.ownerId)) {
            return
        }

        this.summonsTracker.set(trimmedPKT.typeId, trimmedPKT.objectId)
    }

    updateIdentityGauge(trimmedPKT: TrimmedIdentityGaugeChangeNotify): void {
        this.identityGauge = trimmedPKT.identityGauge
    }

    updateInitEnv(trimmedPKT: TrimmedInitEnv): void {
        /**
         * Update the player's objectId.
         * Usually generated when a new map is loaded.
         */

        this.playerInfo.playerId = trimmedPKT.playerId
        this.resetTracker()
    }

    updateInitPC(trimmedPKT: TrimmedInitPC): void {
        this.playerInfo = trimmedPKT
    }

    //**********************************
    /**************************************
     * TESTING
     ***************************************/

    apiTestWIP() {
        return {
            t: getTimeNow(),
            elapsed: this.getElapsedTime(),
            identity: this.identityGauge,
            boss: this.guessLatestBoss()?.name ?? "No boss detected",
            latestBuff: this.apiLatestBuff(),
        }
    }

    apiLatestBuff(): string {
        if (this.latestBuff === null) {
            return "N/A"
        } else {
            const buffLevel = {
                211400: 1,
                211410: 2,
                211420: 3,
            }[this.latestBuff.statusEffectId]

            const timeDelta = this.latestBuff.endTime - getSecondsNow()
            if (timeDelta >= 0) {
                return `[Level ${buffLevel}] ${Math.abs(
                    Math.round(timeDelta),
                )}s remaining`
            } else {
                return `${Math.abs(Math.round(timeDelta))}s ago`
            }
        }
    }

    //**********************************
    /**************************************
     * EFFECTS TRACKER WEBSOCKET HELPER METHODS
     ***************************************/

    effectsTrackerWebSocket(): object {
        /**
         * Separate into buff and brand
         * Translate Id to text
         */

        return {
            boss: this.effectsTrackerWebSocketBossHelper(),
            party: this.effectsTrackerWebSocketPartyHelper(),
            player: this.effectsTrackerWebSocketPlayerHelper(),
            skills: Array.from(this.skillsTracker.values())
                .sort((a, b) => a.skillName.localeCompare(b.skillName))
                .map((s) => s.currentState()),
        }
    }

    guessLatestBoss(): NPCInfo | undefined {
        /**
         * Return the boss that has most recently been
         * affected by a status effect.
         *
         * If no bosses are found, default to the first index of
         * this.bossInfo
         *
         * If this.bossInfo is empty, return null
         */

        let mostRecentBoss: NPCInfo | undefined = undefined
        let mostRecentBossTime = -1

        for (let boss of this.bossInfo) {
            const lastEffectTime = this.lastEffectTimeTracker.get(boss.objectId)
            if (
                lastEffectTime !== undefined &&
                lastEffectTime > mostRecentBossTime
            ) {
                mostRecentBossTime = lastEffectTime
                mostRecentBoss = boss
            }
        }

        if (mostRecentBossTime > 0) {
            return mostRecentBoss
        } else if (this.bossInfo.length > 0) {
            return this.bossInfo[0]
        } else {
            return undefined
        }
    }

    effectsTrackerWebSocketBossHelper() {
        const b = this.guessLatestBoss()

        if (b === undefined) {
            return null
        }

        return {
            name: b.name,
            brand: this.entityTracker.has(b.objectId)
                ? this.maxEffectsDurationByType(
                      "brand",
                      this.entityTracker.get(b.objectId) ?? [],
                  )
                : 0,
        }
    }

    effectsTrackerWebSocketPartyHelper() {
        return this.partyInfo
            .map((p) => {
                return {
                    partyNumber: p.partyNumber,
                    gearLevel: p.gearLevel,
                    characterClass: p.characterClass,
                    classId: p.classId,
                    name: p.name,
                    atkBuff: this.entityTracker.has(p.characterId)
                        ? this.maxEffectsDurationByType(
                              "atkBuff",
                              this.entityTracker.get(p.characterId) ?? [],
                          )
                        : 0,
                }
            })
            .sort((a, b) => a.partyNumber - b.partyNumber)
    }

    effectsTrackerWebSocketPlayerHelper() {
        const p = this.playerInfo

        return {
            gearLevel: p.gearLevel,
            characterClass: p.characterClass,
            classId: p.classId,
            name: p.name,
            atkBuff: this.entityTracker.has(p.playerId)
                ? this.maxEffectsDurationByType(
                      "atkBuff",
                      this.entityTracker.get(p.playerId) ?? [],
                  )
                : 0,
        }
    }

    maxEffectsDurationByType(t: StatusEffectsTypes, effects: Effect[]): number {
        /**
         * Return empty if none are active
         */

        const filteredEffectsDuration = effects
            .filter((effect) =>
                statusEffectsByType[t].includes(effect.statusEffectId),
            )
            .filter((effect) => effect.isOngoing())
            .map((effect) => effect.remainingDuration())
        return filteredEffectsDuration.length > 0
            ? Math.max(...filteredEffectsDuration)
            : 0
    }

    //**********************************
    /**************************************
     * STATIC MAP HANDLING METHODS
     ***************************************/

    static appendVal(m: Map<number, Effect[]>, key: number, val: Effect): void {
        const effects = m.get(key) || []
        effects.push(val)
        m.set(key, effects)
    }

    static removeVals(
        m: Map<number, Effect[]>,
        key: number,
        vals: number[],
    ): void {
        /**
         * Remove all matching effects with selected ids.
         */
        const effects = m.get(key) || []
        m.set(
            key,
            effects.filter((effect) => vals.indexOf(effect.id) === -1),
        )
    }

    static handleAppendVal(
        m: Map<number, Effect[]>,
        key: number,
        val: Effect,
    ): void {
        /**
         * Append to the list of effects if the key already exists.
         * Otherwise, create a new key.
         */

        if (!m.has(key)) {
            m.set(key, [val])
        } else {
            EffectsTracker.appendVal(m, key, val)
        }
    }
}
