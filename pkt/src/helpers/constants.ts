//**********************************************************************
/**************************************************************************
 **
 *          OTHER PACKETS MISC METHODS
 **
 ***************************************************************************/

type AllowedStatusEffects = {
    atkBuff: number[]
    brand: number[]
    identity: number[]
}

export type StatusEffectsTypes = "atkBuff" | "brand" | "identity"

export const statusEffects: { [key: string]: AllowedStatusEffects } = {
    bard: {
        atkBuff: [211606, 211749],
        brand: [210230, 212610, 212906],
        identity: [211400, 211410, 211420],
    },
    paladin: {
        atkBuff: [362006, 361708],
        brand: [360506, 360804, 361004, 361207, 361505],
        identity: [500152, 500153],
    },
    artist: {
        atkBuff: [314004, 314181],
        brand: [312002, 314260, 314650],
        identity: [310501],
    },
}

export const statusEffectsByType: AllowedStatusEffects = {
    atkBuff: Object.values(statusEffects)
        .flatMap((cls) => cls.atkBuff)
        .flat(),
    brand: Object.values(statusEffects)
        .flatMap((cls) => cls.brand)
        .flat(),
    identity: Object.values(statusEffects)
        .flatMap((cls) => cls.identity)
        .flat(),
}

export const whitelistStatusEffects: number[] = Object.values(statusEffects)
    .flatMap((cls) => Object.values(cls))
    .flat()

//**********************************************************************
/**************************************************************************
 **
 *          TRIGGER CODES
 **
 ***************************************************************************/

export const triggerDungeonStartCode: number[] = [10, 11, 27]
export const triggerDungeonEndCode: number[] = [
    57, 58, 59, 60, 61, 62, 63, 64, 74, 75, 76, 77,
]

//**********************************************************************
/**************************************************************************
 **
 *          SKILLS
 **
 ***************************************************************************/

/**
 * Bard: Awakening, Harp, Guardian's Tune, Sonic Vibration
 * Paladin: Awakening, Holy Protection, Holy Area
 * Artist: Awakening, Drawing Orchids, Sun Well
 */

export const trackedSkillIDByClass: { [key: string]: number[] } = {
    bard: [21180, 21170, 21230, 21250], // Identity: 21140, 21141, 21142, 21143,
    paladin: [36210, 36140, 36120],
    artist: [31910, 31410, 31420],
}

export const trackedSkillID: number[] = Object.values(
    trackedSkillIDByClass,
).flat()

export const summonsByClass: { [key: string]: number[] } = {
    bard: [30050, 30051, 30052, 30053, 30054, 30055],
    paladin: [],
    artist: [],
}

export const summonsID: number[] = Object.values(summonsByClass).flat()

//**********************************************************************
/**************************************************************************
 **
 *          RAID IDS
 *          Copy from loa-logs/src/lib/constants/bosses.ts
 *                    loa-logs/src/lib/constants/encounters.ts
 **
 ***************************************************************************/

export const encounterMap: { [key: string]: { [key: string]: Array<string> } } =
    {
        Valtan: {
            "Valtan G1": [
                "Dark Mountain Predator",
                "Destroyer Lucas",
                "Leader Lugaru",
            ],
            "Valtan G2": [
                "Demon Beast Commander Valtan",
                "Ravaged Tyrant of Beasts",
            ],
        },
        Vykas: {
            "Vykas G1": ["Incubus Morphe", "Nightmarish Morphe"],
            "Vykas G2": ["Covetous Devourer Vykas"],
            "Vykas G3": ["Covetous Legion Commander Vykas"],
        },
        Clown: {
            "Clown G1": ["Saydon"],
            "Clown G2": ["Kakul"],
            "Clown G3": ["Kakul-Saydon", "Encore-Desiring Kakul-Saydon"],
        },
        Brelshaza: {
            "Brelshaza G1": ["Gehenna Helkasirs"],
            "Brelshaza G2": ["Prokel", "Prokel's Spiritual Echo", "Ashtarot"],
            "Brelshaza G3": ["Primordial Nightmare"],
            "Brelshaza G4": ["Phantom Legion Commander Brelshaza"],
            "Brelshaza G5": [
                "Brelshaza, Monarch of Nightmares",
                "Imagined Primordial Nightmare",
                "Pseudospace Primordial Nightmare",
            ],
            "Brelshaza G6": ["Phantom Legion Commander Brelshaza"],
        },
        Kayangel: {
            "Kayangel G1": ["Tienis"],
            "Kayangel G2": ["Prunya"],
            "Kayangel G3": ["Lauriel"],
        },
        Akkan: {
            "Akkan G1": ["Griefbringer Maurug", "Evolved Maurug"],
            "Akkan G2": ["Lord of Degradation Akkan"],
            "Akkan G3": [
                "Plague Legion Commander Akkan",
                "Lord of Kartheon Akkan",
            ],
        },
        Ivory: {
            "Ivory Tower G1": ["Kaltaya, the Blooming Chaos"],
            "Ivory Tower G2": ["Rakathus, the Lurking Arrogance"],
            "Ivory Tower G3": ["Firehorn, Trampler of Earth"],
            "Ivory Tower G4": [
                "Lazaram, the Trailblazer",
                "Subordinated Vertus",
                "Subordinated Calventus",
                "Subordinated Legoros",
                "Brand of Subordination",
            ],
        },
        Thaemine: {
            "Thaemine G1": ["Killineza the Dark Worshipper"],
            "Thaemine G2": ["Valinak, Knight of Darkness", "Valinak, Taboo Usurper", "Valinak, Herald of the End"],
            "Thaemine G3": ["Thaemine the Lightqueller", "Darkness Sword", "Giant Darkness Sword"],
            "Thaemine G4": ["Darkness Legion Commander Thaemine", "Thaemine, Conqueror of Stars"]
        }
    }

export const raidNames: string[] = Object.values(encounterMap)
    .flatMap((encounter) => Object.values(encounter))
    .flat()

export const guardianRaidNames: string[] = [
    "Veskal",
    "Gargadeth",
    "Sonavel",
    "Hanumatan",
    "Kungelanium",
    "Deskaluda",
    "Achates",
    "Alberhastic",
    "Armored Nacrasena",
    "Calventus",
    "Chromanium",
    "Dark Legoros",
    "Flame Fox Yoho",
    "Frost Helgaia",
    "Helgaia",
    "Icy Legoros",
    "Igrexion",
    "Lava Chromanium",
    "Levanos",
    "Lumerus",
    "Nacrasena",
    "Night Fox Yoho",
    "Tytalos",
    "Ur'nil",
    "Velganos",
    "Vertus",
]
