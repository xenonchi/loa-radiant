var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/pkt-handler.ts
var import_fs3 = require("fs");
var import_data2 = require("meter-core/data");
var import_decompressor = require("meter-core/decompressor");
var import_pkt_capture = require("meter-core/pkt-capture");
var import_pkt_stream = require("meter-core/pkt-stream");
var import_logger = require("meter-core/logger/logger");
var import_parser = require("meter-core/logger/parser");

// src/helpers/meter-data-path.ts
var import_fs = __toESM(require("fs"));
var filePaths = [
  "./meter-data",
  "../meter-data",
  "./ui/meter-data",
  "../ui/meter-data",
  "../../ui/meter-data",
  "./resources/meter-data",
  "./resources/app/meter-data"
];
var getMeterDataPath = () => {
  let meterDataPath3 = ".";
  for (let p of filePaths) {
    if (import_fs.default.existsSync(p)) {
      meterDataPath3 = p;
      break;
    } else {
    }
  }
  return meterDataPath3;
};

// src/effects-tracker.ts
var import_data = require("meter-core/data");

// src/helpers/constants.ts
var statusEffects = {
  bard: {
    atkBuff: [211606, 211749],
    brand: [210230, 212610, 212906],
    identity: [211400, 211410, 211420]
  },
  paladin: {
    atkBuff: [362006, 361708],
    brand: [360506, 360804, 361004, 361207, 361505],
    identity: [500152, 500153]
  },
  artist: {
    atkBuff: [314004, 314181],
    brand: [312002, 314260, 314650],
    identity: [310501]
  }
};
var statusEffectsByType = {
  atkBuff: Object.values(statusEffects).flatMap((cls) => cls.atkBuff).flat(),
  brand: Object.values(statusEffects).flatMap((cls) => cls.brand).flat(),
  identity: Object.values(statusEffects).flatMap((cls) => cls.identity).flat()
};
var whitelistStatusEffects = Object.values(statusEffects).flatMap((cls) => Object.values(cls)).flat();
var triggerDungeonStartCode = [10, 11, 27];
var triggerDungeonEndCode = [
  57,
  58,
  59,
  60,
  61,
  62,
  63,
  64,
  74,
  75,
  76,
  77
];
var trackedSkillIDByClass = {
  bard: [21180, 21170, 21230, 21250],
  // Identity: 21140, 21141, 21142, 21143,
  paladin: [],
  artist: []
};
var trackedSkillID = Object.values(
  trackedSkillIDByClass
).flat();
var summonsByClass = {
  bard: [30050, 30051, 30052, 30053, 30054, 30055],
  paladin: [],
  artist: []
};
var summonsID = Object.values(summonsByClass).flat();
var encounterMap = {
  Valtan: {
    "Valtan G1": [
      "Dark Mountain Predator",
      "Destroyer Lucas",
      "Leader Lugaru"
    ],
    "Valtan G2": [
      "Demon Beast Commander Valtan",
      "Ravaged Tyrant of Beasts"
    ]
  },
  Vykas: {
    "Vykas G1": ["Incubus Morphe", "Nightmarish Morphe"],
    "Vykas G2": ["Covetous Devourer Vykas"],
    "Vykas G3": ["Covetous Legion Commander Vykas"]
  },
  Clown: {
    "Clown G1": ["Saydon"],
    "Clown G2": ["Kakul"],
    "Clown G3": ["Kakul-Saydon", "Encore-Desiring Kakul-Saydon"]
  },
  Brelshaza: {
    "Brelshaza G1": ["Gehenna Helkasirs"],
    "Brelshaza G2": ["Prokel", "Prokel's Spiritual Echo", "Ashtarot"],
    "Brelshaza G3": ["Primordial Nightmare"],
    "Brelshaza G4": ["Phantom Legion Commander Brelshaza"],
    "Brelshaza G5": [
      "Brelshaza, Monarch of Nightmares",
      "Imagined Primordial Nightmare",
      "Pseudospace Primordial Nightmare"
    ],
    "Brelshaza G6": ["Phantom Legion Commander Brelshaza"]
  },
  Kayangel: {
    "Kayangel G1": ["Tienis"],
    "Kayangel G2": ["Prunya"],
    "Kayangel G3": ["Lauriel"]
  },
  Akkan: {
    "Akkan G1": ["Griefbringer Maurug", "Evolved Maurug"],
    "Akkan G2": ["Lord of Degradation Akkan"],
    "Akkan G3": [
      "Plague Legion Commander Akkan",
      "Lord of Kartheon Akkan"
    ]
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
      "Brand of Subordination"
    ]
  }
};
var raidNames = Object.values(encounterMap).flatMap((encounter) => Object.values(encounter)).flat();
var guardianRaidNames = [
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
  "Vertus"
];

// src/helpers/tracked-skills.ts
function getSecondsNow() {
  return (/* @__PURE__ */ new Date()).getTime() / 1e3;
}
var SkillInstance = class {
  startTime;
  skillName;
  iconPath;
  pkt;
  skillDurations;
  constructor(skillName, iconPath, pkt) {
    this.startTime = getSecondsNow();
    this.skillName = skillName;
    this.iconPath = iconPath;
    this.pkt = pkt;
    this.skillDurations = getSkillDurations(pkt.skillId, pkt);
  }
  currentState() {
    const diff = getSecondsNow() - this.startTime;
    if (diff > this.skillDurations.durationTotal) {
      return {
        skillName: this.skillName,
        iconPath: this.iconPath,
        state: "Expired",
        t: diff - this.skillDurations.durationTotal
      };
    } else if (diff > this.skillDurations.castTime) {
      return {
        skillName: this.skillName,
        iconPath: this.iconPath,
        state: "Active",
        t: this.skillDurations.durationTotal - diff
      };
    } else {
      return {
        skillName: this.skillName,
        iconPath: this.iconPath,
        state: "Casting",
        t: this.skillDurations.castTime - diff
      };
    }
  }
};
var defaultSkillDurationsInfoComputed = {
  castTime: -1,
  duration: -1,
  durationTotal: -1
};
var getSkillDurations = (skillId, pkt) => {
  const skillDurationsFunc = trackedSkillDurations[skillId] ?? ((_2) => defaultSkillDurationsInfoComputed);
  return trackedSkillDurationsCompute(skillDurationsFunc(pkt));
};
var trackedSkillDurationsCompute = (skillDuration) => {
  const skillDurationComputed = {
    castTime: skillDuration.castTime,
    duration: skillDuration.duration,
    durationTotal: skillDuration.castTime + skillDuration.duration
  };
  return skillDurationComputed;
};
var trackedSkillDurations = {
  21180: (pkt) => {
    return {
      castTime: 0.6,
      duration: 10 + Number(pkt.skillOptionData?.tripodIndex?.first === 1) * (1.4 + 0.6 * (pkt.skillOptionData?.tripodLevel?.first ?? 1))
      // Harp of Rhythm duration tripod
    };
  },
  21170: (_2) => {
    return {
      castTime: 0.8,
      duration: 4
    };
  },
  21140: (_2) => {
    return {
      castTime: 0.7,
      duration: 8
    };
  },
  21141: (_2) => {
    return {
      castTime: 0.7,
      duration: 12
    };
  },
  21142: (_2) => {
    return {
      castTime: 0.7,
      duration: 16
    };
  },
  21143: (_2) => {
    return {
      castTime: 0.7,
      duration: 120
      // Guessing!!
    };
  },
  21230: (_2) => {
    return {
      castTime: 2.3,
      duration: 10
    };
  },
  21250: (pkt) => {
    return {
      castTime: 0.8,
      duration: (pkt.skillOptionData?.tripodIndex?.third ?? 2) * 4
      // Guardian's tune half duration tripod
    };
  }
};

// src/effects-tracker.ts
var meterDataPath = getMeterDataPath();
var meterData = new import_data.MeterData();
meterData.loadDbs(`${meterDataPath}/databases`);
var padToDigits = (num, d = 2) => num.toString().padStart(d, "0");
function getTimeNow() {
  const date = /* @__PURE__ */ new Date();
  return [
    padToDigits(date.getHours()),
    padToDigits(date.getMinutes()),
    padToDigits(date.getSeconds()),
    padToDigits(date.getMilliseconds(), 3)
  ].join(":");
}
var Effect = class {
  id;
  statusEffectId;
  endTime;
  constructor(id, statusEffectId, endTime) {
    this.id = id;
    this.statusEffectId = statusEffectId;
    this.endTime = endTime;
  }
  isOngoing() {
    return this.endTime > getSecondsNow();
  }
  remainingDuration() {
    return Math.round((this.endTime - getSecondsNow()) * 100) / 100;
  }
  show() {
    const skillName = meterData.skillBuff.get(this.statusEffectId)?.name || `ID${this.statusEffectId}`;
    const remainingDuration = this.remainingDuration();
    return `${skillName}: ${remainingDuration}s`;
  }
};
var defaultPlayerInfo = {
  playerId: -1,
  characterId: -1,
  characterClass: "N/A",
  classId: -1,
  gearLevel: -1,
  name: "N/A"
};
var EffectsTracker = class {
  playerInfo;
  identityGauge;
  bossInfo;
  partyInfo;
  nearbyPC;
  summonsTracker;
  skillsTracker;
  entityTracker;
  lastEffectTimeTracker;
  startTime;
  latestBuff;
  constructor() {
    this.playerInfo = defaultPlayerInfo;
    this.identityGauge = 0;
    this.bossInfo = [];
    this.partyInfo = [];
    this.nearbyPC = /* @__PURE__ */ new Map();
    this.summonsTracker = /* @__PURE__ */ new Map();
    this.skillsTracker = /* @__PURE__ */ new Map();
    this.entityTracker = /* @__PURE__ */ new Map();
    this.lastEffectTimeTracker = /* @__PURE__ */ new Map();
    this.startTime = getSecondsNow();
    this.latestBuff = null;
  }
  resetStartTime() {
    this.startTime = getSecondsNow();
  }
  getElapsedTime() {
    return getSecondsNow() - this.startTime;
  }
  resetTracker() {
    this.resetStartTime();
    this.bossInfo = [];
    this.nearbyPC = /* @__PURE__ */ new Map();
    this.skillsTracker = /* @__PURE__ */ new Map();
    this.removeExpiredEntities(300);
    this.latestBuff = null;
  }
  //**********************************
  /**************************************
   * STATUS EFFECT PACKETS
   ***************************************/
  addEffectEntity(trimmedPKT) {
    if (this.isUntrackedEntity(trimmedPKT.objectId)) {
      return;
    }
    if (this.isUntrackedEntity(trimmedPKT.sourceId)) {
      return;
    }
    const effect = new Effect(
      trimmedPKT.effectInstanceId,
      trimmedPKT.statusEffectId,
      getSecondsNow() + trimmedPKT.totalTime
    );
    this.updateLastEffectTimeTracker(trimmedPKT.objectId, effect);
    EffectsTracker.removeVals(this.entityTracker, trimmedPKT.objectId, [
      effect.id
    ]);
    EffectsTracker.handleAppendVal(
      this.entityTracker,
      trimmedPKT.objectId,
      effect
    );
  }
  setLatestBuff(trimmedPKT) {
    const effect = new Effect(
      trimmedPKT.effectInstanceId,
      trimmedPKT.statusEffectId,
      getSecondsNow() + trimmedPKT.totalTime
    );
    this.latestBuff = effect;
  }
  removeEffectEntity(trimmedPKT) {
    if (!this.entityTracker.has(trimmedPKT.objectId) || this.isUntrackedEntity(trimmedPKT.objectId)) {
      return;
    } else {
      EffectsTracker.removeVals(
        this.entityTracker,
        trimmedPKT.objectId,
        trimmedPKT.statusEffectIds
      );
    }
  }
  //**********************************
  /**************************************
   * STATUS EFFECT ENTITIES METHODS
   ***************************************/
  whichTrackedEntity(objectId) {
    if (this.playerInfo.playerId === objectId) {
      return 1;
    } else if (this.partyInfo.map((p) => p.characterId).includes(objectId) || this.partyInfo.map((p) => p.playerId).includes(objectId)) {
      return 2;
    } else if (this.bossInfo.map((b) => b.objectId).includes(objectId)) {
      return 3;
    } else if (Array.from(this.summonsTracker.values()).includes(objectId)) {
      return 4;
    } else {
      return 0;
    }
  }
  isUntrackedEntity(objectId) {
    return this.whichTrackedEntity(objectId) === 0;
  }
  addBossEntity(trimmedPKT) {
    this.bossInfo.push(trimmedPKT);
  }
  addPartyEntities(trimmedPKT) {
    this.partyInfo = trimmedPKT.partyInfo;
    for (const partyMember of this.partyInfo) {
      if (partyMember.characterId === this.playerInfo.characterId) {
        partyMember.characterId = this.playerInfo.playerId;
      }
      this.syncPlayerIDFromPartyInfo(partyMember.characterId);
    }
  }
  syncPlayerIDFromPartyInfo(characterId) {
    const pcInfo = this.nearbyPC.get(characterId);
    if (pcInfo !== void 0) {
      this.syncPartyMemberPlayerID(characterId, pcInfo);
      console.log(this.partyInfo);
    }
  }
  syncPartyMemberPlayerID(characterId, pcInfo) {
    const partyMemberFilter = this.partyInfo.filter((p) => p.characterId === characterId);
    if (partyMemberFilter.length === 1) {
      const partyMember = partyMemberFilter[0];
      const editedPartyMember = {
        ...partyMember,
        playerId: pcInfo.playerId
      };
      this.partyInfo = this.partyInfo.filter((p) => p.characterId !== characterId).concat(editedPartyMember);
    }
  }
  syncPlayerIDFromNewPC(trimmedPKT) {
    this.nearbyPC.set(
      trimmedPKT.characterId,
      trimmedPKT
    );
    if (this.partyInfo.map((p) => p.characterId).includes(trimmedPKT.characterId)) {
      this.syncPartyMemberPlayerID(trimmedPKT.characterId, trimmedPKT);
    }
  }
  updateLastEffectTimeTracker(objectId, effect) {
    this.lastEffectTimeTracker.set(objectId, effect.endTime);
  }
  removeExpiredEntities(threshold) {
    const currentTime = getSecondsNow();
    for (const [id, t] of this.lastEffectTimeTracker.entries()) {
      if (t < currentTime - threshold) {
        this.lastEffectTimeTracker.delete(id);
        if (this.entityTracker.has(id)) {
          this.entityTracker.delete(id);
        }
      }
    }
  }
  //**********************************
  /**************************************
   * SKILL TRACKER METHODS
   ***************************************/
  updateSkillCastNotify(trimmedPKT) {
    this.updateSkillStartNotify({
      ...trimmedPKT,
      skillOptionData: void 0
    });
  }
  updateSkillStartNotify(trimmedPKT) {
    if (trimmedPKT.sourceId === this.playerInfo.playerId) {
      const skillInstance = new SkillInstance(
        meterData.skill.get(trimmedPKT.skillId)?.name || "SKILL_NOT_FOUND",
        meterData.skill.get(trimmedPKT.skillId)?.icon || "PATH_NOT_FOUND",
        trimmedPKT
      );
      this.skillsTracker.set(trimmedPKT.skillId, skillInstance);
    }
  }
  //**********************************
  /**************************************
   * OTHER PACKETS MISC METHODS
   ***************************************/
  updateSummons(trimmedPKT) {
    if (this.isUntrackedEntity(trimmedPKT.ownerId)) {
      return;
    }
    this.summonsTracker.set(trimmedPKT.typeId, trimmedPKT.objectId);
  }
  updateIdentityGauge(trimmedPKT) {
    this.identityGauge = trimmedPKT.identityGauge;
  }
  updateInitEnv(trimmedPKT) {
    this.playerInfo.playerId = trimmedPKT.playerId;
    this.resetTracker();
  }
  updateInitPC(trimmedPKT) {
    this.playerInfo = trimmedPKT;
  }
  //**********************************
  /**************************************
   * TESTING
   ***************************************/
  show() {
    console.log(
      getTimeNow(),
      this.getElapsedTime(),
      "\n",
      this.playerInfo.playerId,
      this.identityGauge,
      this.partyInfo.map((partyMember) => partyMember.characterId),
      this.bossInfo.map((npc) => npc.name),
      this.showEntityTracker()
    );
  }
  apiTestWIP() {
    return {
      t: getTimeNow(),
      elapsed: this.getElapsedTime(),
      identity: this.identityGauge,
      boss: this.guessLatestBoss()?.name ?? "No boss detected",
      latestBuff: this.apiLatestBuff()
    };
  }
  apiLatestBuff() {
    if (this.latestBuff === null) {
      return "N/A";
    } else {
      const buffLevel = {
        211400: 1,
        211410: 2,
        211420: 3
      }[this.latestBuff.statusEffectId];
      const timeDelta = this.latestBuff.endTime - getSecondsNow();
      if (timeDelta >= 0) {
        return `[Level ${buffLevel}] ${Math.abs(
          Math.round(timeDelta)
        )}s remaining`;
      } else {
        return `${Math.abs(Math.round(timeDelta))}s ago`;
      }
    }
  }
  showEntityTracker() {
    const showEntityTracker = /* @__PURE__ */ new Map();
    for (const [id, effects] of this.entityTracker.entries()) {
      const validEffects = effects.filter((effect) => effect.isOngoing()).map((effect) => effect.show());
      if (validEffects.length > 0) {
        showEntityTracker.set(id, validEffects);
      }
    }
    return showEntityTracker;
  }
  //**********************************
  /**************************************
   * EFFECTS TRACKER WEBSOCKET HELPER METHODS
   ***************************************/
  effectsTrackerWebSocket() {
    return {
      boss: this.effectsTrackerWebSocketBossHelper(),
      party: this.effectsTrackerWebSocketPartyHelper(),
      player: this.effectsTrackerWebSocketPlayerHelper(),
      skills: Array.from(this.skillsTracker.values()).sort((a, b) => a.skillName.localeCompare(b.skillName)).map((s) => s.currentState())
    };
  }
  guessLatestBoss() {
    let mostRecentBoss = void 0;
    let mostRecentBossTime = -1;
    for (let boss of this.bossInfo) {
      const lastEffectTime = this.lastEffectTimeTracker.get(boss.objectId);
      if (lastEffectTime !== void 0 && lastEffectTime > mostRecentBossTime) {
        mostRecentBossTime = lastEffectTime;
        mostRecentBoss = boss;
      }
    }
    if (mostRecentBossTime > 0) {
      return mostRecentBoss;
    } else if (this.bossInfo.length > 0) {
      return this.bossInfo[0];
    } else {
      return void 0;
    }
  }
  effectsTrackerWebSocketBossHelper() {
    const b = this.guessLatestBoss();
    if (b === void 0) {
      return null;
    }
    return {
      name: b.name,
      brand: this.entityTracker.has(b.objectId) ? this.maxEffectsDurationByType(
        "brand",
        this.entityTracker.get(b.objectId) ?? []
      ) : 0
    };
  }
  effectsTrackerWebSocketPartyHelper() {
    return this.partyInfo.map((p) => {
      return {
        partyNumber: p.partyNumber,
        gearLevel: p.gearLevel,
        characterClass: p.characterClass,
        classId: p.classId,
        name: p.name,
        atkBuff: this.entityTracker.has(p.characterId) ? this.maxEffectsDurationByType(
          "atkBuff",
          this.entityTracker.get(p.characterId) ?? []
        ) : 0
      };
    }).sort((a, b) => a.partyNumber - b.partyNumber);
  }
  effectsTrackerWebSocketPlayerHelper() {
    const p = this.playerInfo;
    return {
      gearLevel: p.gearLevel,
      characterClass: p.characterClass,
      classId: p.classId,
      name: p.name,
      atkBuff: this.entityTracker.has(p.playerId) ? this.maxEffectsDurationByType(
        "atkBuff",
        this.entityTracker.get(p.playerId) ?? []
      ) : 0
    };
  }
  maxEffectsDurationByType(t, effects) {
    const filteredEffectsDuration = effects.filter(
      (effect) => statusEffectsByType[t].includes(effect.statusEffectId)
    ).filter((effect) => effect.isOngoing()).map((effect) => effect.remainingDuration());
    return filteredEffectsDuration.length > 0 ? Math.max(...filteredEffectsDuration) : 0;
  }
  //**********************************
  /**************************************
   * STATIC MAP HANDLING METHODS
   ***************************************/
  static appendVal(m, key, val) {
    const effects = m.get(key) || [];
    effects.push(val);
    m.set(key, effects);
  }
  static removeVals(m, key, vals) {
    const effects = m.get(key) || [];
    m.set(
      key,
      effects.filter((effect) => vals.indexOf(effect.id) === -1)
    );
  }
  static handleAppendVal(m, key, val) {
    if (!m.has(key)) {
      m.set(key, [val]);
    } else {
      EffectsTracker.appendVal(m, key, val);
    }
  }
};

// src/file-logger.ts
var import_fs2 = __toESM(require("fs"));
var logPath = "./logs";
function getCurrentTimestamp() {
  const now = /* @__PURE__ */ new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}
var FileLogger = class {
  logToConsole;
  filename;
  constructor(logToConsole = false) {
    this.logToConsole = logToConsole;
    this.filename = `${logPath}/${getCurrentTimestamp()}.txt`;
    this.writeLine("init");
  }
  writePKT(pktName, pkt) {
    if (this.logToConsole) {
      console.log(`${getTimeNow()}		${pktName}`);
      console.log(pkt);
    }
    this.writeLine(`${pktName}	${JSON.stringify(pkt)}`);
  }
  writeLine(line) {
    line = `${getTimeNow()}		${line}
`;
    import_fs2.default.appendFile(this.filename, line, (err) => {
      if (err) {
        console.error("Error writing to file:", err);
        return;
      }
    });
  }
};

// src/pkt-handler.ts
var meterDataPath2 = getMeterDataPath();
var FILE_LOGGER_LOG_TO_CONSOLE = false;
function handleNum(n, fallback) {
  return n ?? fallback;
}
function handleWhitelistNum(skillId) {
  return whitelistStatusEffects.indexOf(handleNum(skillId, -1)) !== -1;
}
function handleWhitelistSummons(typeId) {
  return summonsID.indexOf(handleNum(typeId, -1)) !== -1;
}
function handleSerenadeOfCourage(skillId) {
  return statusEffects["bard"]?.identity.indexOf(handleNum(skillId, -1)) !== -1;
}
function InitMeterData() {
  const meterData3 = new import_data2.MeterData();
  meterData3.loadDbs(`${meterDataPath2}/databases`);
  return meterData3;
}
function InitLogger(meterData3, useRawSocket, listenPort, clientId, options) {
  const oodle_state = (0, import_fs3.readFileSync)(`${meterDataPath2}/oodle_state.bin`);
  const xorTable = (0, import_fs3.readFileSync)(`${meterDataPath2}/xor.bin`);
  const compressor = new import_decompressor.Decompressor(oodle_state, xorTable);
  const stream = new import_pkt_stream.PKTStream(compressor);
  const logger = new import_logger.LiveLogger(stream, compressor);
  const parser = new import_parser.Parser(logger, meterData3, clientId, options);
  const effectsTracker2 = new EffectsTracker();
  const capture = new import_pkt_capture.PktCaptureAll(
    useRawSocket ? import_pkt_capture.PktCaptureMode.MODE_RAW_SOCKET : import_pkt_capture.PktCaptureMode.MODE_PCAP,
    listenPort
  );
  const fileLogger = new FileLogger(FILE_LOGGER_LOG_TO_CONSOLE);
  capture.on("packet", (buf) => {
    try {
      const badPkt = stream.read(buf);
    } catch (e) {
    }
  });
  capture.on("connect", (ip) => {
    parser.onConnect(ip);
  });
  stream.on("PKTSkillCastNotify", (pkt) => {
    if (trackedSkillID.includes(Number(pkt.parsed?.skillId))) {
      const trimmedPKT = {
        sourceId: Number(pkt.parsed?.caster),
        skillLevel: Number(pkt.parsed?.skillLevel),
        skillId: Number(pkt.parsed?.skillId)
      };
      fileLogger.writePKT("SKLCAS", trimmedPKT);
      effectsTracker2.updateSkillCastNotify(trimmedPKT);
    }
  }).on("PKTSkillStartNotify", (pkt) => {
    if (trackedSkillID.includes(Number(pkt.parsed?.skillId))) {
      const trimmedPKT = {
        sourceId: Number(pkt.parsed?.sourceId),
        skillLevel: Number(pkt.parsed?.skillLevel),
        skillOptionData: pkt.parsed?.skillOptionData,
        skillId: Number(pkt.parsed?.skillId)
      };
      fileLogger.writePKT("SKLSTR", trimmedPKT);
      effectsTracker2.updateSkillStartNotify(trimmedPKT);
    }
  }).on("PKTSkillStageNotify", (pkt) => {
    if (trackedSkillID.includes(Number(pkt.parsed?.skillId))) {
    }
  }).on("PKTStatusEffectAddNotify", (pkt) => {
    if (handleWhitelistNum(pkt.parsed?.statusEffectData.statusEffectId)) {
      const trimmedPKT = {
        sourceId: Number(pkt.parsed?.statusEffectData.sourceId),
        objectId: Number(pkt.parsed?.objectId),
        effectInstanceId: pkt.parsed?.statusEffectData.effectInstanceId || -1,
        statusEffectId: pkt.parsed?.statusEffectData.statusEffectId || -1,
        totalTime: Number(pkt.parsed?.statusEffectData.totalTime)
      };
      effectsTracker2.addEffectEntity(trimmedPKT);
      if (handleSerenadeOfCourage(
        pkt.parsed?.statusEffectData.statusEffectId
      )) {
        effectsTracker2.setLatestBuff(trimmedPKT);
      }
    }
  }).on("PKTIdentityGaugeChangeNotify", (pkt) => {
    const trimmedPKT = {
      identityGauge: handleNum(pkt.parsed?.identityGauge2, 0) + handleNum(pkt.parsed?.identityGauge1, 0) / 1e4
    };
    effectsTracker2.updateIdentityGauge(trimmedPKT);
  }).on("PKTStatusEffectRemoveNotify", (pkt) => {
    const trimmedPKT = {
      objectId: Number(pkt.parsed?.objectId),
      statusEffectIds: pkt.parsed?.statusEffectIds || []
    };
    effectsTracker2.removeEffectEntity(trimmedPKT);
  }).on("PKTPartyInfo", (pkt) => {
    if (pkt.parsed?.memberDatas !== void 0) {
      const trimmedPKT = {
        partyInfo: pkt.parsed?.memberDatas.map((member) => {
          return {
            partyNumber: member.partyMemberNumber,
            name: member.name,
            gearLevel: Math.round(member.gearLevel),
            characterClass: meterData3.getClassName(
              Number(member.classId)
            ),
            characterId: Number(member.characterId),
            classId: Number(member.classId),
            playerId: -1
          };
        })
      };
      for (let ptyInfo of trimmedPKT.partyInfo) {
        fileLogger.writePKT("PTYINF", ptyInfo);
      }
      effectsTracker2.addPartyEntities(trimmedPKT);
    }
  }).on("PKTPartyLeaveResult", (pkt) => {
    const trimmedPKT = {
      name: String(pkt.parsed?.name),
      partyInstanceId: Number(pkt.parsed?.partyInstanceId),
      partyLeaveType: Number(pkt.parsed?.partyLeaveType)
    };
    fileLogger.writePKT("PTYLVE", trimmedPKT);
  }).on("PKTPartyStatusEffectAddNotify", (pkt) => {
    if (pkt.parsed?.statusEffectDatas !== void 0) {
      for (const d of pkt.parsed?.statusEffectDatas) {
        if (handleWhitelistNum(d.statusEffectId)) {
          const trimmedPKT = {
            sourceId: Number(d.sourceId),
            objectId: Number(pkt.parsed?.characterId),
            effectInstanceId: d.effectInstanceId,
            statusEffectId: d.statusEffectId,
            totalTime: Number(d.totalTime)
          };
          effectsTracker2.addEffectEntity(trimmedPKT);
        }
      }
    }
  }).on("PKTPartyStatusEffectRemoveNotify", (pkt) => {
    const trimmedPKT = {
      objectId: Number(pkt.parsed?.characterId),
      statusEffectIds: pkt.parsed?.statusEffectIds || []
    };
    effectsTracker2.removeEffectEntity(trimmedPKT);
  }).on("PKTInitEnv", (pkt) => {
    const trimmedPKT = {
      playerId: Number(pkt.parsed?.playerId)
    };
    effectsTracker2.updateInitEnv(trimmedPKT);
    fileLogger.writePKT("INITEN", trimmedPKT);
  }).on("PKTInitPC", (pkt) => {
    console.log(pkt.parsed);
    console.log(pkt.parsed?.statPair);
    const trimmedPKT = {
      playerId: Number(pkt.parsed?.playerId),
      characterId: Number(pkt.parsed?.characterId),
      characterClass: meterData3.getClassName(
        Number(pkt.parsed?.classId)
      ),
      classId: Number(pkt.parsed?.classId),
      gearLevel: Number(pkt.parsed?.gearLevel),
      name: String(pkt.parsed?.name)
    };
    effectsTracker2.updateInitPC(trimmedPKT);
    fileLogger.writePKT("INITPC", trimmedPKT);
  }).on("PKTNewPC", (pkt) => {
    const trimmedPKT = {
      name: String(pkt.parsed?.pcStruct.name),
      avgItemLevel: Number(pkt.parsed?.pcStruct.avgItemLevel),
      characterClass: meterData3.getClassName(
        Number(pkt.parsed?.pcStruct.classId)
      ),
      classId: Number(pkt.parsed?.pcStruct.classId),
      worldId: Number(pkt.parsed?.pcStruct.worldId),
      guildName: String(pkt.parsed?.pcStruct.guildName),
      characterId: Number(pkt.parsed?.pcStruct.characterId),
      playerId: Number(pkt.parsed?.pcStruct.playerId)
    };
    effectsTracker2.syncPlayerIDFromNewPC(trimmedPKT);
    fileLogger.writePKT("NEWPC ", trimmedPKT);
  }).on("PKTNewNpcSummon", (pkt) => {
    if (handleWhitelistSummons(pkt.parsed?.npcData?.typeId)) {
      const trimmedPKT = {
        ownerId: Number(pkt.parsed?.ownerId),
        objectId: Number(pkt.parsed?.npcData?.objectId),
        typeId: Number(pkt.parsed?.npcData?.typeId)
      };
      effectsTracker2.updateSummons(trimmedPKT);
      fileLogger.writePKT("NEWSUM", trimmedPKT);
    }
  }).on("PKTRaidBegin", (pkt) => {
    const trimmedPKT = {
      raidResult: Number(pkt.parsed?.raidResult),
      bossKillDataList: pkt.parsed?.bossKillDataList ?? [],
      raidId: Number(pkt.parsed?.raidId)
    };
    fileLogger.writePKT("RAIDBG", trimmedPKT);
  }).on("PKTRaidBossKillNotify", (pkt) => {
    fileLogger.writePKT("RAIDBK", pkt.parsed);
  }).on("PKTRaidResult", (pkt) => {
    const trimmedPKT = {
      raidResult: Number(pkt.parsed?.raidResult)
    };
    fileLogger.writePKT("RAIDRE", trimmedPKT);
  }).on("PKTTriggerBossBattleStatus", (pkt) => {
    const trimmedPKT = {
      triggerId: Number(pkt.parsed?.triggerId),
      step: Number(pkt.parsed?.step)
    };
    fileLogger.writePKT("TRIGBO", trimmedPKT);
  }).on("PKTTriggerStartNotify", (pkt) => {
    const trimmedPKT = {
      triggerSignalType: Number(pkt.parsed?.triggerSignalType),
      triggerId: Number(pkt.parsed?.triggerId)
    };
    if (triggerDungeonEndCode.includes(trimmedPKT.triggerId) || triggerDungeonStartCode.includes(trimmedPKT.triggerId)) {
      fileLogger.writePKT("TRIGST", trimmedPKT);
    }
  }).on("PKTTriggerFinishNotify", (pkt) => {
    const trimmedPKT = {
      packetResultCode: Number(pkt.parsed?.packetResultCode),
      triggerId: Number(pkt.parsed?.triggerId)
      //involvedPC: pkt.parsed?.involvedPCs
    };
  }).on("PKTNewNpc", (pkt) => {
    const npcId = pkt.parsed?.npcStruct.typeId;
    const npcData = npcId ? meterData3.npc.get(npcId) ?? "" : "";
    if (npcData && ["boss", "raid", "epic_raid", "commander"].includes(
      npcData.grade
    ) && (raidNames.includes(npcData.name) || guardianRaidNames.includes(npcData.name))) {
      const trimmedPKT = {
        objectId: Number(pkt.parsed?.npcStruct.objectId),
        id: npcData.id,
        name: npcData.name,
        grade: npcData.grade
      };
      fileLogger.writePKT("NEWNPC", trimmedPKT);
      effectsTracker2.addBossEntity(trimmedPKT);
    }
  }).on("PKTZoneMemberLoadStatusNotify", (pkt) => {
    const trimmedPKT = {
      totalMembers: (pkt.parsed?.totalMembers ?? []).map(
        (m) => Number(m)
      ),
      zoneInstId: Number(pkt.parsed?.zoneInstId),
      loadComplete: pkt.parsed?.loadComplete,
      completeMembers: (pkt.parsed?.completeMembers ?? []).map(
        (m) => Number(m)
      ),
      zoneId: pkt.parsed?.zoneId,
      zoneLevel: pkt.parsed?.zoneLevel,
      firstPCEnterTick: Number(pkt.parsed?.firstPCEnterTick)
    };
    fileLogger.writePKT("ZNLOAD", trimmedPKT);
  });
  return [parser, effectsTracker2];
}

// api.ts
var import_ws = __toESM(require("ws"));
var meterData2 = InitMeterData();
var [_, effectsTracker] = InitLogger(meterData2, false, 6040, "", {});
var wsUI = new import_ws.default.Server({ port: 8081 });
wsUI.on("connection", (ws) => {
  console.log("Received connection to wsUI");
  const interval = setInterval(() => {
    ws.send(JSON.stringify(effectsTracker.effectsTrackerWebSocket()));
  }, 100);
  ws.on("message", (message) => {
    console.log(`Received: ${message}`);
    ws.send(`Echo: ${message}`);
  });
  ws.on("close", () => {
    console.log("Client disconnected");
    clearInterval(interval);
  });
});
console.log("WebSocket servers running on ports 8081");
process.on("exit", () => {
  wsUI.close(() => {
    console.log("WebSocket server closed.");
  });
});
//# sourceMappingURL=api.js.map