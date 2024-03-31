import { SkillInstanceInfo } from "./pkt-trimmed"

export function getSecondsNow() {
    return new Date().getTime() / 1000
}

export class SkillInstance {
    startTime: number
    skillName: string
    iconPath: string
    pkt: SkillInstanceInfo
    skillDurations: SkillDurationsInfoComputed

    constructor(skillName: string, iconPath: string, pkt: SkillInstanceInfo) {
        this.startTime = getSecondsNow()
        this.skillName = skillName
        this.iconPath = iconPath
        this.pkt = pkt
        this.skillDurations = getSkillDurations(pkt.skillId, pkt)
    }

    cancelSkill() {
        this.skillDurations = trackedSkillDurationsCompute({
            castTime: 0.01,
            duration: 0.01
        })
    }

    currentState(): {
        skillName: string
        iconPath: string
        state: string
        t: number
    } {
        /**
         * Returns whether a skill is casting or active
         * and returns the remaining duration for that state
         */

        const diff = getSecondsNow() - this.startTime

        if (diff > this.skillDurations.durationTotal) {
            return {
                skillName: this.skillName,
                iconPath: this.iconPath,
                state: "Expired",
                t: diff - this.skillDurations.durationTotal,
            }
        } else if (diff > this.skillDurations.castTime) {
            return {
                skillName: this.skillName,
                iconPath: this.iconPath,
                state: "Active",
                t: this.skillDurations.durationTotal - diff,
            }
        } else {
            return {
                skillName: this.skillName,
                iconPath: this.iconPath,
                state: "Casting",
                t: this.skillDurations.castTime - diff,
            }
        }
    }
}

type SkillDurations = (pkt: SkillInstanceInfo) => SkillDurationsInfo
type SkillDurationsInfo = {
    castTime: number
    duration: number
}

type SkillDurationsInfoComputed = {
    castTime: number
    duration: number
    durationTotal: number
}

const defaultSkillDurationsInfoComputed: SkillDurationsInfoComputed = {
    castTime: -1,
    duration: -1,
    durationTotal: -1,
}

const getSkillDurations = (
    skillId: number,
    pkt: SkillInstanceInfo,
): SkillDurationsInfoComputed => {
    const skillDurationsFunc: SkillDurations =
        trackedSkillDurations[skillId] ??
        ((_) => defaultSkillDurationsInfoComputed)

    return trackedSkillDurationsCompute(skillDurationsFunc(pkt))
}

const trackedSkillDurationsCompute = (
    skillDuration: SkillDurationsInfo,
): SkillDurationsInfoComputed => {
    const skillDurationComputed: SkillDurationsInfoComputed = {
        castTime: skillDuration.castTime,
        duration: skillDuration.duration,
        durationTotal: skillDuration.castTime + skillDuration.duration,
    }

    return skillDurationComputed
}

const trackedSkillDurations: { [key: number]: SkillDurations } = {
    21180: (pkt) => {
        return {
            castTime: 0.6,
            duration:
                10 +
                Number(pkt.skillOptionData?.tripodIndex?.first === 1) *
                    (1.4 +
                        0.6 * (pkt.skillOptionData?.tripodLevel?.first ?? 1)),
            // Harp of Rhythm duration tripod
        }
    },
    21170: (_) => {
        return {
            castTime: 0.8,
            duration: 4,
        }
    },
    21140: (_) => {
        return {
            castTime: 0.7,
            duration: 8,
        }
    },
    21141: (_) => {
        return {
            castTime: 0.7,
            duration: 12,
        }
    },
    21142: (_) => {
        return {
            castTime: 0.7,
            duration: 16,
        }
    },
    21143: (_) => {
        return {
            castTime: 0.7,
            duration: 120, // Guessing!!
        }
    },
    21230: (_) => {
        return {
            castTime: 2.3,
            duration: 10,
        }
    },
    21250: (pkt) => {
        return {
            castTime: 0.8,
            duration: (pkt.skillOptionData?.tripodIndex?.third ?? 2) * 4,
            // Guardian's tune half duration tripod
        }
    },
}
