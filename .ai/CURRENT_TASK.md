# CURRENT TASK

Status: READY_FOR_CODEX
Task ID: HANDOFF-TEST-002
Prepared by: ChatGPT
Date: 2026-08-10

## Cél

A ChatGPT → GitHub → Codex → localhost → TASK_RESULT → SYNC munkafolyamat második, javított próbája. Ezúttal olyan szöveget módosítunk, amelyet a futó JavaScript ténylegesen renderel a böngészőben.

## Feladat

Az `app/js/home-layout.js` kezdőképernyő hero főcímében változtasd meg az írásjelet.

Jelenlegi szöveg:

`Egy kis változás is számít.`

Új szöveg:

`Egy kis változás is számít!`

## Hatókör

A felhasználói felület módosításához kizárólag az `app/js/home-layout.js` fájl szükséges.

A `.ai/TASK_RESULT.md` fájlt a START protokoll szerint természetesen frissítsd.

Ne módosíts `app/index.html` fájlt, CSS-t, más JavaScriptet, JSON-adatot, assetet vagy más felhasználói szöveget.

## Kötelező munkamenet

1. Kövesd az `AGENTS.md` `START` protokollját.
2. Ellenőrizd, hogy a `v0-prototype` ágon dolgozol.
3. Ellenőrizd, hogy a főoldal hero tartalmát ténylegesen a `home-layout.js` rendereli.
4. Végezd el az egyetlen írásjel-módosítást.
5. Futtasd az `npm test` parancsot.
6. Használd a futó helyi előnézetet (`http://localhost:8080`).
7. A ténylegesen renderelt kezdőképernyőn ellenőrizd, hogy a főcím végén felkiáltójel látható. Ha a környezetedből nem tudsz valódi böngésző-DOM ellenőrzést végezni, ezt egyértelműen írd le, és ne állíts vizuális ellenőrzést pusztán `curl` alapján.
8. Írd felül a `.ai/TASK_RESULT.md` fájlt a tényleges eredménnyel.
9. Ne commitolj és ne pusholj. Várd meg a felhasználó vizuális jóváhagyását és külön `SYNC` parancsát.

## Elfogadási kritériumok

- A böngészőben megjelenő főcím pontosan `Egy kis változás is számít!`.
- Más látható szöveg nem változik.
- `app/index.html` nem módosul.
- Nem készül új CSS.
- `npm test` sikeresen lefut.
- A helyi oldal működik `http://localhost:8080` alatt.

## Miért ezt teszteljük?

Az első teszt megmutatta, hogy a statikus `index.html` hero tartalmát a `home-layout.js` betöltéskor felülírja. Ez a második próba azt ellenőrzi, hogy a handoff-rendszer már a tényleges renderelési forrást célozza, és a vizuális jóváhagyás valóban a futó felületre épül.
