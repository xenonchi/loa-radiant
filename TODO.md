
**System**
- Security update
- `.exe` setup release
    - Fix: Cannot locate meter-data when setup, but it's fine afterwards
- `electron-updater` for auto-update
- Remove WS and use IPC for Electron-Frontend communication
- WebSocket: Attempt to reconnect
- Conversion of `bigint` based on required precision

**Packets**

- Improve detection of `playerId` on zone load: See [`meter-core`](https://github.com/lost-ark-dev/meter-core/blob/569139173931ca72e3dc74fc3e9c6d14d26b68c1/src/logger/entityTracker.ts)
    - Detection playerId from partyInfo if the overlay is started after selecting character
    - Fix when there are more than 5 player effects tracker icon
- Tracked skills
    - Add for Paladin and Artist
    - Scale skill casting time based on swiftness (Atk. speed)
- Stop tracking dead party members for buff
- Detect raid start & end
    - One-stage raids with `PKTRaid`: bossKillDataList
    - Multi-stage raids with `TriggerNotify`: [encounterMap](https://github.com/snoww/loa-logs/blob/3e67b4746b1a74ac28c52239a1043e99afe8310b/src/lib/constants/encounters.ts#L4)
    - Periodically clear `bossInfo` array based on `lastEffectTimeTracker`

**UI**
- Use ai to re-generate program icon
- Find better tooltip library
- Icon for focus & unfocus