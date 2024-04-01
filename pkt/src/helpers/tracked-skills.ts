import { SkillInstanceInfo } from "./pkt-trimmed"

export function getSecondsNow() {
    return new Date().getTime() / 1000
}

export class SkillInstance {
    startTime: number
    skillName: string
    iconPath: string
    pkt: SkillInstanceInfo
    swiftness: number
    skillDurations: SkillDurationsInfoComputed

    constructor(
        swiftness: number,
        skillName: string,
        iconPath: string,
        pkt: SkillInstanceInfo,
    ) {
        this.startTime = getSecondsNow()
        this.skillName = skillName
        this.iconPath = iconPath
        this.pkt = pkt
        this.swiftness = swiftness
        this.skillDurations = getSkillDurations(
            this.computeAtkSpeed(),
            pkt.skillId,
            pkt,
        )
    }

    computeAtkSpeed() {
        /**
         * 1. Apply 10% pet bonus
         * 2. 100 Swiftness = 1.717% Atk Speed
         */

        return 1 + this.swiftness * 1.1 * 0.0001717
    }

    cancelSkill() {
        this.skillDurations = trackedSkillDurationsCompute(this.swiftness, {
            castTime: 0.01,
            duration: 0.01,
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
    atkSpeed: number,
    skillId: number,
    pkt: SkillInstanceInfo,
): SkillDurationsInfoComputed => {
    const skillDurationsFunc: SkillDurations =
        trackedSkillDurations[skillId] ??
        ((_) => defaultSkillDurationsInfoComputed)

    return trackedSkillDurationsCompute(atkSpeed, skillDurationsFunc(pkt))
}

const trackedSkillDurationsCompute = (
    atkSpeed: number,
    skillDuration: SkillDurationsInfo,
): SkillDurationsInfoComputed => {
    const adjCastTime = skillDuration.castTime / atkSpeed
    const skillDurationComputed: SkillDurationsInfoComputed = {
        castTime: adjCastTime,
        duration: skillDuration.duration,
        durationTotal: adjCastTime + skillDuration.duration,
    }

    return skillDurationComputed
}

const trackedSkillDurations: { [key: number]: SkillDurations } = {
    // BARD
    21180: (pkt) => {
        return {
            castTime: 0.8,
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
            castTime: 1,
            duration: 4,
        }
    },
    21140: (_) => {
        return {
            castTime: 1,
            duration: 8,
        }
    },
    21141: (_) => {
        return {
            castTime: 1,
            duration: 12,
        }
    },
    21142: (_) => {
        return {
            castTime: 1,
            duration: 16,
        }
    },
    21143: (_) => {
        return {
            castTime: 1,
            duration: 120, // Guessing!!
        }
    },
    21230: (_) => {
        return {
            castTime: 3,
            duration: 10,
        }
    },
    21250: (pkt) => {
        return {
            castTime: 1,
            duration: (pkt.skillOptionData?.tripodIndex?.third ?? 2) * 4,
            // Guardian's tune half duration tripod
        }
    },
    // PALADIN
    36210: (_) => {
        return {
            castTime: 3,
            duration: 10,
        }
    },
    36120: (_) => {
        return {
            castTime: 1.3,
            duration: 5,
        }
    },
    36140: (_) => {
        return {
            castTime: 0.4,
            duration: 6,
        }
    },
    // ARTIST
    31910: (_) => {
        return {
            castTime: 3.4,
            duration: 12,
        }
    },
    31410: (_) => {
        return {
            castTime: 0.8,
            duration: 3.5,
        }
    },
    31420: (_) => {
        return {
            castTime: 1,
            duration: 3,
        }
    },
}
