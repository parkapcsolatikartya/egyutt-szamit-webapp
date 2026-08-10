# Együtt számít – projektállapot

Utolsó frissítés: 2026-08-10
Aktív fejlesztési ág: `v0-prototype`

## Aktuális fejlesztési fázis

A V0 kategóriaalapú, végigjárható prototípus fejlesztése és vizuális finomítása.

## Jelenleg működő fő elemek

- Víz kategória – aktív.
- Áram kategória – aktív.
- Földgáz kategória – látható, előkészítés alatt.
- Kategória → próba → rövid személyre szabás → egynapos vállalás → visszajelzés → eredmény → megosztás → háromnapos folytatás útvonal.
- LocalStorage-alapú helyi állapotmentés.
- Hash-alapú kategória- és próbaútvonalak.
- Mobilos megosztás vagy linkmásolás.
- Zuhanyzási próbához tartományos vízbecslési modell.

## Technológiai alap

- HTML
- Bootstrap 5
- Bootstrap Icons
- célzott saját CSS: `app/assets/css/style.css`
- vanilla / moduláris JavaScript
- JSON adatfájlok
- Node-alapú tesztek

## Helyi fejlesztés

A repository gyökerében:

```bash
npm run serve
```

Előnézet:

```text
http://localhost:8080
```

Teszt:

```bash
npm test
```

## ChatGPT ↔ Codex munkafolyamat

- Tervezés, kutatás, UX és specifikáció: webes ChatGPT projekt.
- Jóváhagyott aktuális feladat: `.ai/CURRENT_TASK.md`.
- Implementáció: Codex a helyi VS Code repositoryban.
- Codex eredményjelentése: `.ai/TASK_RESULT.md`.
- Gyors ellenőrzés: localhost, GitHub push nélkül.
- Gépek közötti átadás: commit + push a `v0-prototype` ágra, majd a másik gépen pull.
- `main` csak ellenőrzött változtatást kap pull requesten keresztül.

## Kötelező szabályforrások

Kanonikus szakmai forrás: a Google Drive `Csepp a tengerben` projektmappája.

Codex számára helyben olvasható operatív összefoglalók:

- `AGENTS.md`
- `docs/guidelines/PROJECT_RULES.md`
- `docs/guidelines/VISUAL_RULES.md`
- képi/isometric feladatnál `docs/guidelines/ISOMETRIC_RULES.md`

## Következő ellenőrzési pont

A ChatGPT → CURRENT_TASK → Codex `START` → localhost → TASK_RESULT → `SYNC` → ChatGPT visszaellenőrzés teljes körének próbaüzeme.
