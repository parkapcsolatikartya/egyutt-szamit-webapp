# Együtt számít – webapp

Személyes víz- és energiahasználati hatásmérő webalkalmazás.

## Online tesztverzió

Az aktuális `v0-prototype` ág közvetlen fejlesztői előnézete:

https://raw.githack.com/parkapcsolatikartya/egyutt-szamit-webapp/v0-prototype/app/index.html

A GitHub Pages automatikus közzététele is elő van készítve ezen a címen:

https://parkapcsolatikartya.github.io/egyutt-szamit-webapp/

A GitHub Pages első repositoryszintű aktiválása külön GitHub-beállítást igényelhet. Addig a közvetlen fejlesztői előnézet használható.

## Állapot

A `v0-prototype` ág tartalmazza az első megnyitható függőleges prototípust:

- kétkérdéses, mérés nélküli gyors felmérés;
- személyre szabott egynapos zuhanykihívás;
- önbevallásos visszajelzés;
- becsült vízeredmény tartományban;
- ivóvíz-minőségű vezetékesvíz-értelmezés;
- ember-nap ivóvíz-egyenérték;
- mobilos megosztás vagy linkmásolás;
- háromnapos folytatás felajánlása;
- LocalStorage-alapú állapotmentés;
- módszertani és adatvédelmi oldal.

Az első szelet jelenleg a vízhatást számolja. A vízmelegítési energia becslése a következő fejlesztési lépés.

A jelenlegi sötét frontend történeti prototípus. A következő vizuális fejlesztés jóváhagyott iránya világos, levegős, Bootstrap-first felület kis fájlméretű 3D vector / isometric illusztrációkkal.

## Helyi futtatás

A repository gyökerében:

```bash
npm run serve
```

Ezután nyisd meg:

```text
http://localhost:8080
```

A JSON-adatfájlok betöltése miatt az `app/index.html` fájlt ne közvetlenül `file://` útvonalról nyisd meg.

## Ellenőrzés

```bash
npm test
```

A GitHub Actions ezen felül ellenőrzi:

- a JavaScript-fájlok szintaxisát;
- a számítási egységteszteket;
- a JSON-adatfájlok érvényességét.

## Frontend technológiai és vizuális alap

- Mobile-first, reszponzív webalkalmazás.
- Bootstrap 5 a teljes projekt elsődleges CSS frameworkje.
- A megjelenést elsőként Bootstrap komponensekkel, griddel és utility osztályokkal kell megoldani.
- Saját CSS csak indokolt, valóban egyedi esetben kerülhet az `app/assets/css/style.css` fájlba.
- Nem implementálunk újra saját CSS-ben olyan általános szabályt, amelyet a Bootstrap már biztosít.
- A jóváhagyott vizuális rendszer világos, levegős, kék–türkiz–menta karakterű.
- A szemléltető képek stílusa könnyű 3D vector / isometric vector / soft 3D UI illustration.
- Funkcionális ikonokhoz elsőként Bootstrap Icons használatos.
- Az asseteknél kis fájlméret, újrahasználhatóság és cache-hatékonyság kötelező.
- Ugyanazt az ikont vagy illusztrációt lehetőség szerint ugyanazon URL-ről több helyen használjuk.

A teljes fejlesztési szabályrendszert az [`AGENTS.md`](AGENTS.md) tartalmazza.
