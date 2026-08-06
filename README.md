# Együtt számít – webapp

Személyes víz- és energiahasználati hatásmérő webalkalmazás.

## Online tesztverzió

Az aktuális `v0-prototype` ág közvetlen fejlesztői előnézete:

https://raw.githack.com/parkapcsolatikartya/egyutt-szamit-webapp/v0-prototype/app/index.html

A GitHub Pages automatikus közzététele is elő van készítve ezen a címen:

https://parkapcsolatikartya.github.io/egyutt-szamit-webapp/

A GitHub Pages első repositoryszintű aktiválása külön GitHub-beállítást igényelhet. Addig a közvetlen fejlesztői előnézet használható.

## Állapot

A `v0-prototype` ág kategóriaalapú, végigjárható fejlesztési prototípust tartalmaz.

### Fő kategóriák

- **Víz** – aktív
- **Áram** – aktív
- **Földgáz** – látható, de egyelőre előkészítés alatt

### Első választható próbák

**Víz:**

- rövidebb zuhanyzás;
- mosogatás kevesebb folyóvízzel;
- mosás jól kihasznált töltettel.

**Áram:**

- célzott világítás;
- kíméletesebb hűtés és légkondicionálás.

A felhasználói út:

```text
kategória → próba → rövid személyre szabás → egynapos vállalás
→ önbevallásos visszajelzés → eredmény → megosztás → háromnapos folytatás
```

A zuhanyzási próbához ellenőrzött, tartományt adó vízbecslési modell tartozik. A többi próba jelenleg önbevallásos teljesítési eredményt mutat; liter- vagy kWh-értéket csak külön forrásolt és tesztelt számítási modell elkészülte után jelenítünk meg.

További működő elemek:

- hash-alapú, közvetlenül megnyitható kategória- és próbaútvonalak;
- LocalStorage-alapú állapotmentés;
- mobilos megosztás vagy linkmásolás;
- háromnapos folytatás felajánlása;
- módszertani és adatvédelmi oldal.

## Vizuális rendszer és képi assetek

A prototípus világos, levegős, Bootstrap-first felületet használ törtfehér, kék–türkiz, menta és visszafogott meleg akcentusokkal.

A kategória- és kihívásképek egységes 3D isometric stílusúak. A nyolc eredeti, több megabájtos PNG helyett két optimalizált, újrahasznosítható WebP sprite kerül betöltésre:

- egy közös kategória-sprite;
- egy közös kihívás-sprite.

Így ugyanazt a képfájlt a böngésző több kártyán és képernyőn is a gyorsítótárból használhatja.

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

A GitHub Actions ellenőrzi:

- a JavaScript-fájlok szintaxisát;
- a számítási egységteszteket;
- a kategória- és kihíváskatalógus konzisztenciáját;
- a JSON-adatfájlok érvényességét.

## Frontend technológiai alap

- Mobile-first, reszponzív webalkalmazás.
- Bootstrap 5 a teljes projekt elsődleges CSS frameworkje.
- A megjelenést elsőként Bootstrap komponensekkel, griddel és utility osztályokkal kell megoldani.
- Saját CSS csak indokolt, valóban egyedi esetben kerülhet az `app/assets/css/style.css` fájlba.
- Funkcionális ikonokhoz elsőként Bootstrap Icons használatos.
- A kategóriák és próbák külön JSON-adatállományokból épülnek fel.
- Az asseteknél kis fájlméret, újrahasználhatóság és cache-hatékonyság kötelező.

A teljes fejlesztési szabályrendszert az [`AGENTS.md`](AGENTS.md) tartalmazza.
