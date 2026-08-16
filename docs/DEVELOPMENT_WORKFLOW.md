# Kétgépes fejlesztési munkafolyamat

Ez a dokumentum az asztali gép ↔ laptop, ChatGPT ↔ Codex és localhost ↔ GitHub közötti napi munkamenetet írja le.

## Szerepek

- **Webes ChatGPT projekt:** tervezés, kutatás, UX, tartalom, döntés és implementációs brief.
- **GitHub `v0-prototype`:** közös szinkronpont és verziótörténet.
- **VS Code + Codex:** helyi implementáció.
- **localhost:** azonnali vizuális ellenőrzés.
- **Google Drive:** kanonikus szakmai, módszertani és vizuális projektforrások.

## Új gép egyszeri beállítása

### Ha a repository még nincs a gépen

Nyiss egy Terminal ablakot, és egyszer futtasd:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/parkapcsolatikartya/egyutt-szamit-webapp/v0-prototype/scripts/bootstrap-mac.sh)"
```

A `scripts/bootstrap-mac.sh` célja, hogy a lehető legkevesebb kézi lépéssel előkészítse a Macet: ellenőrzi a Git környezetet, szükség esetén Homebrew-val telepíti/frissíti a Node.js-t és a GitHub CLI-t, klónozza a repositoryt a `~/Documents/Git/egyutt-szamit-webapp` könyvtárba, beállítja a `v0-prototype` ágat, kezeli a GitHub CLI hitelesítési folyamatát, lefuttatja az `npm test` teszteket, elindítja a localhostot és – ha telepítve van – megnyitja a projektet VS Code-ban.

A felhasználói beavatkozás csak olyan pontokon marad kötelező, ahol a macOS rendszerengedélyt/jelszót kér, Homebrew első telepítése jóváhagyást igényel, vagy a GitHub böngészős fiókhitelesítést kér.

### Ha a repository már meg van nyitva VS Code-ban

A Codex chatben elég ezt írni:

```text
DEVICE_SETUP
```

A Codex az `AGENTS.md` protokollja alapján ellenőrzi és lehetőség szerint beállítja a Git, Node.js, npm és GitHub CLI környezetet, a GitHub-hitelesítést, a `v0-prototype` ágat, a teszteket és a localhost előnézetet. Csak a valóban elkerülhetetlen rendszer- vagy böngészős hitelesítési pontokon kér felhasználói beavatkozást.

## Napi munkakezdés bármelyik gépen

A kézi terminálparancsok helyett a Codex chatben elsőként használható:

```text
WORKSTART
```

Ez ellenőrzi a `v0-prototype` ágat és a munkafát, tiszta állapotban lehúzza a legfrissebb GitHub-verziót, ellenőrzi a helyi környezetet, és elindítja vagy ellenőrzi a localhostot.

Kézi tartalék eljárás:

```bash
git switch v0-prototype
git pull
npm run serve
```

Előnézet:

```text
http://localhost:8080
```

A Codexben a jóváhagyott implementációs feladat indítása:

```text
START
```

A Codex az `AGENTS.md` alapján beolvassa a szükséges szabályokat és a `.ai/CURRENT_TASK.md` fájlt.

## Gyors helyi iteráció

Munka közben nincs szükség GitHub pushra minden módosítás után.

```text
ChatGPT-ben döntés
→ CURRENT_TASK
→ Codex WORKSTART
→ Codex START
→ fájlmódosítás
→ localhost ellenőrzés
→ szükség esetén további helyi finomítás
```

A Codex a végén a `.ai/TASK_RESULT.md` fájlba írja a tényleges eredményt.

## Gépcsere

Mielőtt az egyik gépet abbahagyod, a Codexnek külön:

```text
SYNC
```

A `SYNC` tesztel, commitol és pusholja a `v0-prototype` ágat az `AGENTS.md` szabályai szerint.

A másik gépen elég a Codex chatben:

```text
WORKSTART
```

Kézi tartalék:

```bash
git switch v0-prototype
git pull
```

Ezután ugyanaz a kód, CURRENT_TASK, TASK_RESULT, PROJECT_STATE és szabályrendszer áll rendelkezésre.

## Mit nem szabad csinálni?

- Nem kell ChatGPT-beszélgetést kézzel Codex promptba másolni.
- Nem kell minden vizuális módosítás után pusholni.
- Nem kell ZIP-pel vagy Drive-on keresztül mozgatni a forráskódot a két gép között.
- A Codex nem bővítheti önállóan a CURRENT_TASK scope-ját.
- A `main` ágra nem kerül közvetlen fejlesztői push.
- A `WORKSTART` és `DEVICE_SETUP` nem módosíthat projekt-forráskódot.

## Feladat lezárása

A ChatGPT a push után GitHubról visszaellenőrzi a tényleges módosítást és a TASK_RESULT tartalmát. Ha a feladat elfogadott, frissíthető a `PROJECT_STATE.md`, és a `.ai/CURRENT_TASK.md` lecserélhető a következő feladatra.
