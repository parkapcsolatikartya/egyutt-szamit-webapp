# Projekt szabályok – Codex operatív összefoglaló

Forrásállapot: 2026-08-10
Kanonikus források: Google Drive `00A – Kötelező munkakezdési iránytű` és `06 – Technikai dokumentáció`.

> Ez a fájl a Codex helyi munkájához készült tömör, végrehajtható összefoglaló. Ha a Drive és ez a fájl eltér, a Drive az elsődleges, és ezt az összefoglalót frissíteni kell.

## Projektcél

Személyes víz- és energiahasználati hatásmérő webalkalmazás, amely hétköznapi fogyasztási szokásokat mér fel, reálisan vállalható változtatásokat ajánl, majd érthetően mutatja ezek becsült személyes és közösségi hatását.

A cél a szükségtelen pazarlás csökkentése, nem a szükséges fogyasztás tiltása.

## V0 technikai irány

- Mobile-first, reszponzív webalkalmazás.
- HTML + Bootstrap 5 + célzott saját CSS + moduláris JavaScript.
- Kérdések, ajánlások, feltételezések és források külön JSON-adatállományokban.
- Számítások első körben kliensoldalon.
- Regisztráció nélküli működés.
- LocalStorage-alapú helyi mentés.

## Hitelesség

- A felhasználói adatot, mért adatot, becslést, feltételezést és közösségi forgatókönyvet külön kell kezelni.
- Bizonytalan eredményt tartományként kell közölni.
- Hamis pontosság tilos.
- Ellenőrizetlen tarifa, fogyasztási érték, kibocsátási tényező vagy képlet nem kerülhet tényként a felületre.
- Az alkalmazás nem kelthet bűntudatot.
- Egészséget vagy alapvető higiéniát veszélyeztető ajánlás tilos.

## Frontend – Bootstrap-first

Megvalósítási sorrend:

1. Bootstrap komponens.
2. Bootstrap grid / utility.
3. Bootstrap dokumentált testreszabás.
4. Csak ezután célzott saját CSS.

Saját CSS kizárólag az `app/assets/css/style.css` fájlban legyen. Inline style és indokolatlan `!important` kerülendő.

## Tesztelés

- Számítási modellhez normál, szélső, nulla és hiányzó érték tesztelendő.
- Mértékegység-átváltás és kerekítés ellenőrzendő.
- Kérdőív-elágazás, mentés és visszatöltés integrációsan ellenőrzendő.
- Vizuális változtatásnál keskeny mobil, nagy mobil, tablet és desktop nézet ellenőrzendő.
- Alap projekt-teszt: `npm test`.

## Adatvédelem

- A lehető legkevesebb személyes adat kezelendő.
- Pontos lakcím ne legyen bekérve.
- A helyi mentést a felhasználó törölhesse.
- Közösségi összesítéshez csak anonimizált, aggregált adat használható.

## Verziókezelés

- Aktív fejlesztési ág: `v0-prototype`.
- `main` csak ellenőrzött változtatást kap PR-on keresztül.
- Commit legyen kicsi, értelmes és feladathoz kötött.
- Gyors helyi iteráció alatt nem szükséges push.
- Gépcsere előtt `SYNC`, a másik gépen munka előtt pull.
