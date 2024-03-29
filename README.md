# LOA Radiant

**Beta Pre-Release.** Lost Ark support overlay for tracking attack buffs, brand duration and selected skills duration using the [`meter-core`](https://github.com/lost-ark-dev/meter-core) packet parser.

![](./docs/loa-radiant-img.jpg)
![](./docs/loa-radiant-img-annotated.jpg)

## Features

1. Alerts are flashing if the attack buff is about to expire on a party member or the brand is about to expire on a boss
2. Remaining brand duration on the boss
3. Remaining attack buff duration on party members
4. Remaining duration on important skills\
&nbsp;&nbsp;&nbsp;&nbsp;4.1. Inactive skills are more opaque\
&nbsp;&nbsp;&nbsp;&nbsp;4.2. Active skills show remaining duration\
&nbsp;&nbsp;&nbsp;&nbsp;4.3. Casting skills rotate

**Settings**
- The attack buff and brand alert threshold can be changed in the settings.
- The duration required to fill the bar or circle can be changed in the settings.

## Demo

**Gargadeth Bard POV**

[![](./docs/demo-bard-gargadeth.jpg)](https://youtu.be/wYwDhsH4ALM)

**Sonavel Bard POV**

[![](./docs/demo-bard-sonavel.jpg)](https://youtu.be/wqt-OboX2aA)

## Development

```
git clone --recurse-submodules https://github.com/xenonchi/loa-radiant
```

**Install Dependencies**
- On Windows, you need [Npcap with WinPcap compatibilities](https://npcap.com/#download)
- In `pkt` and `ui`, run `npm i` to install packages
- In `ui/node_modules/.bin`, run `.\electron-rebuild.cmd --module-dir ../..` to rebuild broken packages

**Dev**
- In `pkt`, run `npm run build-dist`
- Copy `pkt/dist/api.js` to `ui/electron/pkt/api.cjs`
- In `ui`, run `npm run dev` to launch the Svelte app

**Build**
- In `pkt`, run `npm run build-dist`
- Copy `pkt/dist/api.js` to `ui/electron/pkt/api.cjs`
- In `ui`, run `npm run make` build the executable
- In `ui/out/LOA-Radiant-win32-x64`, run `LOA-Radiant.exe`
