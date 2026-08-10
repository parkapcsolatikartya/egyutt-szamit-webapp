# CURRENT TASK

Status: READY_FOR_CODEX
Task ID: HANDOFF-TEST-001
Prepared by: ChatGPT
Date: 2026-08-10

## Cél

A ChatGPT → GitHub → Codex → localhost → TASK_RESULT → SYNC munkafolyamat első, szándékosan kicsi és könnyen visszaellenőrizhető próbája.

## Feladat

Az `app/index.html` kezdőképernyő hero kártyájában lévő badge szövegét módosítsd.

Jelenlegi szöveg:

`Első egynapos próba`

Új szöveg:

`Egynapos próba`

## Hatókör

Csak az `app/index.html` fájl szükséges ehhez a módosításhoz.

Ne változtass CSS-t, JavaScriptet, JSON-adatot, assetet vagy más felhasználói szöveget.

## Kötelező munkamenet

1. Kövesd az `AGENTS.md` `START` protokollját.
2. Ellenőrizd, hogy a `v0-prototype` ágon dolgozol.
3. Végezd el az egyetlen szövegmódosítást.
4. Futtasd az `npm test` parancsot.
5. Indítsd vagy használd a helyi előnézetet (`npm run serve`, `http://localhost:8080`).
6. Ellenőrizd a kezdőképernyőn, hogy a badge új szövege látható.
7. Írd felül a `.ai/TASK_RESULT.md` fájlt a tényleges eredménnyel.
8. Ne commitolj és ne pusholj. Várd meg a felhasználó vizuális jóváhagyását és külön `SYNC` parancsát.

## Elfogadási kritériumok

- A kezdőképernyő badge szövege pontosan `Egynapos próba`.
- Más látható szöveg nem változik.
- Nem készül új CSS.
- `npm test` sikeresen lefut.
- A helyi oldal betöltődik `http://localhost:8080` alatt.

## Miért ezt teszteljük?

Ez a változtatás technikailag minimális, ezért ha az átadás, branchelés, localhost vagy eredményjelentés hibás, azt a valódi fejlesztési feladatok kockáztatása nélkül észre tudjuk venni.
