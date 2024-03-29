import { readFileSync } from "fs"
// @ts-ignore
import { MeterData } from "meter-core/data"
// @ts-ignore
import { Decompressor } from "meter-core/decompressor"
// @ts-ignore
import { PktCaptureAll, PktCaptureMode } from "meter-core/pkt-capture"
// @ts-ignore
import type { GameTrackerOptions } from "meter-core/logger/data"
// @ts-ignore
import { PKTStream } from "meter-core/pkt-stream"
// @ts-ignore
import { LiveLogger } from "meter-core/logger/logger"
// @ts-ignore
import { Parser } from "meter-core/logger/parser"

import { getMeterDataPath } from "./helpers/meter-data-path"
const meterDataPath = getMeterDataPath()

import { EffectsTracker } from "./effects-tracker"
import {
    TrimmedIdentityGaugeChangeNotify,
    TrimmedInitEnv,
    TrimmedInitPC,
    TrimmedNpcData,
    TrimmedNpcSummon,
    TrimmedNewPC,
    TrimmedPartyInfo,
    TrimmedPartyLeaveResult,
    TrimmedRaidBegin,
    TrimmedRaidResult,
    TrimmedSkillCastNotify,
    TrimmedSkillStartNotify,
    TrimmedStatusEffectAddNotify,
    TrimmedStatusEffectRemoveNotify,
    TrimmedTriggerBossBattleStatus,
    TrimmedTriggerFinishNotify,
    TrimmedTriggerStartNotify,
} from "./helpers/pkt-trimmed"
import { FileLogger } from "./file-logger"
import {
    statusEffects,
    statusEffectsByType,
    whitelistStatusEffects,
    triggerDungeonStartCode,
    triggerDungeonEndCode,
    trackedSkillID,
    raidNames,
    guardianRaidNames,
    summonsID,
} from "./helpers/constants"

/**
 *
 *
 * HELPERS
 */

const FILE_LOGGER_LOG_TO_CONSOLE = false

function handleNum(n: number | undefined, fallback: number): number {
    return n ?? fallback
}

function handleWhitelistNum(skillId: number | undefined): boolean {
    return whitelistStatusEffects.indexOf(handleNum(skillId, -1)) !== -1
}

function handleWhitelistSummons(typeId: number | undefined): boolean {
    return summonsID.indexOf(handleNum(typeId, -1)) !== -1
}

function handleSerenadeOfCourage(skillId: number | undefined): boolean {
    return (
        statusEffects["bard"]?.identity.indexOf(handleNum(skillId, -1)) !== -1
    )
}

/**
 *
 *
 * PACKETS
 */

export function InitMeterData() {
    // create MeterData and read data
    const meterData = new MeterData()
    meterData.loadDbs(`${meterDataPath}/databases`) // cwd is from main.ts

    return meterData
}

export function InitLogger(
    meterData: MeterData,
    useRawSocket: boolean,
    listenPort: number,
    clientId: string,
    options: Partial<GameTrackerOptions>,
): [Parser, EffectsTracker] {
    // create Decompressor
    const oodle_state = readFileSync(`${meterDataPath}/oodle_state.bin`) // This path is from main.ts
    const xorTable = readFileSync(`${meterDataPath}/xor.bin`)
    const compressor = new Decompressor(oodle_state, xorTable)

    // create Decompressor & LegacyLogger
    const stream = new PKTStream(compressor)

    const logger = new LiveLogger(stream, compressor)
    const parser = new Parser(logger, meterData, clientId, options)

    const effectsTracker = new EffectsTracker()

    // finaly create packet capture
    const capture = new PktCaptureAll(
        useRawSocket
            ? PktCaptureMode.MODE_RAW_SOCKET
            : PktCaptureMode.MODE_PCAP,
        listenPort,
    )

    const fileLogger = new FileLogger(FILE_LOGGER_LOG_TO_CONSOLE)

    capture.on("packet", (buf) => {
        try {
            const badPkt = stream.read(buf)
        } catch (e) {}
    })
    capture.on("connect", (ip) => {
        parser.onConnect(ip)
    })

    stream
        .on("PKTSkillCastNotify", (pkt) => {
            if (trackedSkillID.includes(Number(pkt.parsed?.skillId))) {
                // sourceId is the player
                const trimmedPKT: TrimmedSkillCastNotify = {
                    sourceId: Number(pkt.parsed?.caster),
                    skillLevel: Number(pkt.parsed?.skillLevel),
                    skillId: Number(pkt.parsed?.skillId),
                }
                fileLogger.writePKT("SKLCAS", trimmedPKT)
                effectsTracker.updateSkillCastNotify(trimmedPKT)
            }
        })
        .on("PKTSkillStartNotify", (pkt) => {
            if (trackedSkillID.includes(Number(pkt.parsed?.skillId))) {
                const trimmedPKT: TrimmedSkillStartNotify = {
                    sourceId: Number(pkt.parsed?.sourceId),
                    skillLevel: Number(pkt.parsed?.skillLevel),
                    skillOptionData: pkt.parsed?.skillOptionData,
                    skillId: Number(pkt.parsed?.skillId),
                }
                fileLogger.writePKT("SKLSTR", trimmedPKT)
                effectsTracker.updateSkillStartNotify(trimmedPKT)
            }
        })
        .on("PKTSkillStageNotify", (pkt) => {
            if (trackedSkillID.includes(Number(pkt.parsed?.skillId))) {
                // fileLogger.writePKT("SKLSTA", pkt.parsed)
            }
        })
        .on("PKTStatusEffectAddNotify", (pkt) => {
            if (
                handleWhitelistNum(pkt.parsed?.statusEffectData.statusEffectId)
            ) {
                const trimmedPKT: TrimmedStatusEffectAddNotify = {
                    sourceId: Number(pkt.parsed?.statusEffectData.sourceId),
                    objectId: Number(pkt.parsed?.objectId),
                    effectInstanceId:
                        pkt.parsed?.statusEffectData.effectInstanceId || -1,
                    statusEffectId:
                        pkt.parsed?.statusEffectData.statusEffectId || -1,
                    totalTime: Number(pkt.parsed?.statusEffectData.totalTime),
                }
                effectsTracker.addEffectEntity(trimmedPKT)
                if (
                    handleSerenadeOfCourage(
                        pkt.parsed?.statusEffectData.statusEffectId,
                    )
                ) {
                    effectsTracker.setLatestBuff(trimmedPKT)
                }
            }
        })
        .on("PKTIdentityGaugeChangeNotify", (pkt) => {
            const trimmedPKT: TrimmedIdentityGaugeChangeNotify = {
                identityGauge:
                    handleNum(pkt.parsed?.identityGauge2, 0) +
                    handleNum(pkt.parsed?.identityGauge1, 0) / 10000,
            }
            effectsTracker.updateIdentityGauge(trimmedPKT)
        })
        .on("PKTStatusEffectRemoveNotify", (pkt) => {
            const trimmedPKT: TrimmedStatusEffectRemoveNotify = {
                objectId: Number(pkt.parsed?.objectId),
                statusEffectIds: pkt.parsed?.statusEffectIds || [],
            }

            effectsTracker.removeEffectEntity(trimmedPKT)
            // effectsTracker.show();
        })
        .on("PKTPartyInfo", (pkt) => {
            if (pkt.parsed?.memberDatas !== undefined) {
                const trimmedPKT: TrimmedPartyInfo = {
                    partyInfo: pkt.parsed?.memberDatas.map((member) => {
                        return {
                            partyNumber: member.partyMemberNumber,
                            name: member.name,
                            gearLevel: Math.round(member.gearLevel),
                            characterClass: meterData.getClassName(
                                Number(member.classId),
                            ),
                            characterId: Number(member.characterId),
                            classId: Number(member.classId),
                            playerId: -1,
                        }
                    }),
                }

                for (let ptyInfo of trimmedPKT.partyInfo) {
                    fileLogger.writePKT("PTYINF", ptyInfo)
                }
                effectsTracker.addPartyEntities(trimmedPKT)
            }
        })
        .on("PKTPartyLeaveResult", (pkt) => {
            const trimmedPKT: TrimmedPartyLeaveResult = {
                name: String(pkt.parsed?.name),
                partyInstanceId: Number(pkt.parsed?.partyInstanceId),
                partyLeaveType: Number(pkt.parsed?.partyLeaveType),
            }

            fileLogger.writePKT("PTYLVE", trimmedPKT)
        })
        .on("PKTPartyStatusEffectAddNotify", (pkt) => {
            if (pkt.parsed?.statusEffectDatas !== undefined) {
                for (const d of pkt.parsed?.statusEffectDatas) {
                    if (handleWhitelistNum(d.statusEffectId)) {
                        const trimmedPKT: TrimmedStatusEffectAddNotify = {
                            sourceId: Number(d.sourceId),
                            objectId: Number(pkt.parsed?.characterId),
                            effectInstanceId: d.effectInstanceId,
                            statusEffectId: d.statusEffectId,
                            totalTime: Number(d.totalTime),
                        }

                        effectsTracker.addEffectEntity(trimmedPKT)
                    }
                }
            }
        })
        .on("PKTPartyStatusEffectRemoveNotify", (pkt) => {
            const trimmedPKT: TrimmedStatusEffectRemoveNotify = {
                objectId: Number(pkt.parsed?.characterId),
                statusEffectIds: pkt.parsed?.statusEffectIds || [],
            }

            effectsTracker.removeEffectEntity(trimmedPKT)
        })
        .on("PKTInitEnv", (pkt) => {
            const trimmedPKT: TrimmedInitEnv = {
                playerId: Number(pkt.parsed?.playerId),
            }

            effectsTracker.updateInitEnv(trimmedPKT)
            fileLogger.writePKT("INITEN", trimmedPKT)

            // effectsTracker.show()
        })
        .on("PKTInitPC", (pkt) => {
            console.log(pkt.parsed)
            console.log(pkt.parsed?.statPair)
            const trimmedPKT: TrimmedInitPC = {
                playerId: Number(pkt.parsed?.playerId),
                characterId: Number(pkt.parsed?.characterId),
                characterClass: meterData.getClassName(
                    Number(pkt.parsed?.classId),
                ),
                classId: Number(pkt.parsed?.classId),
                gearLevel: Number(pkt.parsed?.gearLevel),
                name: String(pkt.parsed?.name),
            }

            effectsTracker.updateInitPC(trimmedPKT)
            fileLogger.writePKT("INITPC", trimmedPKT)
        })
        .on("PKTNewPC", (pkt) => {
            const trimmedPKT: TrimmedNewPC = {
                name: String(pkt.parsed?.pcStruct.name),
                avgItemLevel: Number(pkt.parsed?.pcStruct.avgItemLevel),
                characterClass: meterData.getClassName(
                    Number(pkt.parsed?.pcStruct.classId),
                ),
                classId: Number(pkt.parsed?.pcStruct.classId),
                worldId: Number(pkt.parsed?.pcStruct.worldId),
                guildName: String(pkt.parsed?.pcStruct.guildName),
                characterId: Number(pkt.parsed?.pcStruct.characterId),
                playerId: Number(pkt.parsed?.pcStruct.playerId),
            }

            effectsTracker.syncPlayerIDFromNewPC(trimmedPKT)
            fileLogger.writePKT("NEWPC ", trimmedPKT)
        })
        .on("PKTNewNpcSummon", (pkt) => {
            if (handleWhitelistSummons(pkt.parsed?.npcData?.typeId)) {
                const trimmedPKT: TrimmedNpcSummon = {
                    ownerId: Number(pkt.parsed?.ownerId),
                    objectId: Number(pkt.parsed?.npcData?.objectId),
                    typeId: Number(pkt.parsed?.npcData?.typeId),
                }

                effectsTracker.updateSummons(trimmedPKT)
                fileLogger.writePKT("NEWSUM", trimmedPKT)
            }
        })
        .on("PKTRaidBegin", (pkt) => {
            const trimmedPKT: TrimmedRaidBegin = {
                raidResult: Number(pkt.parsed?.raidResult),
                bossKillDataList: pkt.parsed?.bossKillDataList ?? [],
                raidId: Number(pkt.parsed?.raidId),
            }

            fileLogger.writePKT("RAIDBG", trimmedPKT)
        })
        .on("PKTRaidBossKillNotify", (pkt) => {
            // pkt only contains useless buffer
            fileLogger.writePKT("RAIDBK", pkt.parsed)
        })
        .on("PKTRaidResult", (pkt) => {
            const trimmedPKT: TrimmedRaidResult = {
                raidResult: Number(pkt.parsed?.raidResult),
            }

            fileLogger.writePKT("RAIDRE", trimmedPKT)
        })
        .on("PKTTriggerBossBattleStatus", (pkt) => {
            const trimmedPKT: TrimmedTriggerBossBattleStatus = {
                triggerId: Number(pkt.parsed?.triggerId),
                step: Number(pkt.parsed?.step),
            }

            fileLogger.writePKT("TRIGBO", trimmedPKT)
        })
        .on("PKTTriggerStartNotify", (pkt) => {
            const trimmedPKT: TrimmedTriggerStartNotify = {
                triggerSignalType: Number(pkt.parsed?.triggerSignalType),
                triggerId: Number(pkt.parsed?.triggerId),
            }

            if (
                triggerDungeonEndCode.includes(trimmedPKT.triggerId) ||
                triggerDungeonStartCode.includes(trimmedPKT.triggerId)
            ) {
                fileLogger.writePKT("TRIGST", trimmedPKT)
            }
        })
        .on("PKTTriggerFinishNotify", (pkt) => {
            const trimmedPKT: TrimmedTriggerFinishNotify = {
                packetResultCode: Number(pkt.parsed?.packetResultCode),
                triggerId: Number(pkt.parsed?.triggerId),
                //involvedPC: pkt.parsed?.involvedPCs
            }
            // fileLogger.writePKT("TRIGFI", trimmedPKT)
        })
        .on("PKTNewNpc", (pkt) => {
            const npcId = pkt.parsed?.npcStruct.typeId
            const npcData = npcId ? meterData.npc.get(npcId) ?? "" : ""

            if (
                npcData &&
                ["boss", "raid", "epic_raid", "commander"].includes(
                    npcData.grade,
                ) &&
                (raidNames.includes(npcData.name) ||
                    guardianRaidNames.includes(npcData.name))
            ) {
                const trimmedPKT: TrimmedNpcData = {
                    objectId: Number(pkt.parsed?.npcStruct.objectId),
                    id: npcData.id,
                    name: npcData.name,
                    grade: npcData.grade,
                }

                fileLogger.writePKT("NEWNPC", trimmedPKT)
                effectsTracker.addBossEntity(trimmedPKT)
            }
        })
        .on("PKTZoneMemberLoadStatusNotify", (pkt) => {
            const trimmedPKT = {
                totalMembers: (pkt.parsed?.totalMembers ?? []).map((m) =>
                    Number(m),
                ),
                zoneInstId: Number(pkt.parsed?.zoneInstId),
                loadComplete: pkt.parsed?.loadComplete,
                completeMembers: (pkt.parsed?.completeMembers ?? []).map((m) =>
                    Number(m),
                ),
                zoneId: pkt.parsed?.zoneId,
                zoneLevel: pkt.parsed?.zoneLevel,
                firstPCEnterTick: Number(pkt.parsed?.firstPCEnterTick),
            }

            fileLogger.writePKT("ZNLOAD", trimmedPKT)
        })

    return [parser, effectsTracker]
}
