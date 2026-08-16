# Együtt számít – projektállapot

Utolsó frissítés: 2026-08-17  
Aktív fejlesztési ág: `v0-prototype`

## Aktuális fejlesztési fázis

Első végigjárható, használható V1 prototípus. A cél most a termékélmény validálása, nem a mérőóraszintű pontosság.

## Jelenleg működő fő elemek

- Három aktív fő kategória: **Víz, Áram, Földgáz**.
- Hat kipróbálható mikrovállalás.
- Kategória → próba → egy rövid személyre szabó választás → vállalás → önbevallásos visszajelzés → becsült eredmény.
- Minden aktív próbánál számszerű, tartományos becslés.
- A bizonytalanabb modellek „alacsony pontosság” jelzést kapnak.
- 100 fős közösségi forgatókönyv, egyértelműen nem tényleges közösségi eredményként.
- `impactEvents` alapú LocalStorage hatásnapló.
- Dinamikus **Saját hatásom** nézet víz-, villamosenergia- és fűtésienergia-összesítéssel.
- Natív mobilos megosztás, illetve vágólapra másolás tartalék megoldásként.
- Regisztráció nélküli működés.
- Világos, Bootstrap-first vizuális rendszer és finom, lassan mozgó tenger-motívum a nyitóképernyőn.
- A korábbi `impact.html` útvonal átirányít a beépített Saját hatásom nézetre.

## Becslési státusz

- A zuhanyzási vízmodell a korábban dokumentált 7,6–9,5 l/perc tartományból indul.
- A többi V1 modell szándékosan széles prototípus-becslés.
- A felület mindenhol jelzi, hogy ezek nem mérőóra-adatok.
- A pontosítás külön kutatási és modellfinomítási munkacsomag marad.

## Technológiai alap

- HTML
- Bootstrap 5
- Bootstrap Icons
- célzott saját CSS: `app/assets/css/style.css`
- vanilla / moduláris JavaScript
- JSON konfiguráció: `app/data/mvp-config.json`
- LocalStorage hatásnapló

## Helyi fejlesztés

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

## Kötelező szabályforrások

Kanonikus szakmai forrás: a Google Drive `Csepp a tengerben` projektmappája.

- `00A – Kötelező munkakezdési iránytű`
- `01 – Projektállapot és következő feladatok`
- `03 – Számítási modellek`
- `04 – Kérdőív és felhasználói útvonal`
- `05 – MVP specifikáció`
- `06 – Technikai dokumentáció`
- `07 – Döntési napló`
- `09 – Vizuális rendszer és képi asset irányelvek`

## Következő ellenőrzési pont

Kézi mobilos és asztali végigjárás, majd a leginkább félreérthető becslések és szövegek finomítása valódi tesztfelhasználói visszajelzés alapján.
