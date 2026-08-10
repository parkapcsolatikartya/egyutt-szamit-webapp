# Kétgépes fejlesztési munkafolyamat

Ez a dokumentum az asztali gép ↔ laptop, ChatGPT ↔ Codex és localhost ↔ GitHub közötti napi munkamenetet írja le.

## Szerepek

- **Webes ChatGPT projekt:** tervezés, kutatás, UX, tartalom, döntés és implementációs brief.
- **GitHub `v0-prototype`:** közös szinkronpont és verziótörténet.
- **VS Code + Codex:** helyi implementáció.
- **localhost:** azonnali vizuális ellenőrzés.
- **Google Drive:** kanonikus szakmai, módszertani és vizuális projektforrások.

## Munkakezdés bármelyik gépen

A repository helyi példányában:

```bash
git switch v0-prototype
git pull
npm run serve
```

Előnézet:

```text
http://localhost:8080
```

A Codexben a jóváhagyott feladat indítása:

```text
START
```

A Codex az `AGENTS.md` alapján beolvassa a szükséges szabályokat és a `.ai/CURRENT_TASK.md` fájlt.

## Gyors helyi iteráció

Munka közben nincs szükség GitHub pushra minden módosítás után.

```text
ChatGPT-ben döntés
→ CURRENT_TASK
→ helyi pull
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

A másik gépen:

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

## Feladat lezárása

A ChatGPT a push után GitHubról visszaellenőrzi a tényleges módosítást és a TASK_RESULT tartalmát. Ha a feladat elfogadott, frissíthető a `PROJECT_STATE.md`, és a `.ai/CURRENT_TASK.md` lecserélhető a következő feladatra.
