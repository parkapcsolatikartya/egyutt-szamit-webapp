# AGENTS.md

Ez a fájl a repositoryban dolgozó minden fejlesztőre és automatizált kódügynökre kötelező szabályokat tartalmazza.

## 1. Kötelező projektindítás

Minden fejlesztési feladat előtt el kell olvasni a projekt Google Drive-mappájában található `00A – Kötelező munkakezdési iránytű` dokumentumot.

Ha a dokumentum nem érhető el, ezt egyértelműen jelezni kell. Nem szabad úgy tenni, mintha el lett volna olvasva.

## 2. Bootstrap-first megjelenési szabály

A webalkalmazás felületét kötelezően Bootstrap-alapokon kell felépíteni.

- A Bootstrap a projekt elsődleges mobile-first CSS frameworkje.
- Elrendezéshez elsőként a Bootstrap gridet, containereket, flex- és spacing utilityket kell használni.
- Tipográfiához, gombokhoz, űrlapokhoz, navigációhoz, kártyákhoz, visszajelzésekhez és reszponzív viselkedéshez elsőként a Bootstrap meglévő komponenseit és utility osztályait kell választani.
- Új saját CSS-szabály csak akkor írható, ha a kívánt megjelenés Bootstrap osztályokkal nem oldható meg ésszerűen, vagy valóban egyedi vizuális elem szükséges.
- Tilos saját CSS-ben újraimplementálni olyan általános szabályt, amelyet a Bootstrap már biztosít.
- A saját stílusokat az `app/assets/css/style.css` fájlban kell tartani.
- Az inline `style` attribútum használata kerülendő. Kivétel csak dokumentált, technikailag indokolt eset lehet.
- A saját CSS legyen rövid, célzott és komponensspecifikus. Globális felülírás csak indokolt esetben használható.
- A Bootstrap osztályokat nem szabad indokolatlanul `!important` szabályokkal felülírni.

## 3. Mobile-first követelmény

- A legkisebb mobilos nézet az alapértelmezett.
- Nagyobb képernyőkhöz Bootstrap breakpointokkal kell fokozatosan bővíteni a megjelenést.
- A felületet legalább keskeny mobil, nagy mobil, tablet és asztali nézetben ellenőrizni kell.
- Érintési célok, olvashatóság, űrlapkezelés és billentyűzetes használat nem romolhat a vizuális finomítás miatt.

## 4. Technikai alap

- Szemantikus HTML.
- Bootstrap 5.
- Moduláris, keretrendszer nélküli JavaScript.
- A kérdések, ajánlások, feltételezések és források külön, verziózott JSON-fájlokban legyenek.
- A számítások első körben kliensoldalon fussanak.
- A helyi állapot LocalStorage-ban tárolható.
- A V0 regisztráció és központi felhasználói adatbázis nélkül működik.

## 5. Hitelességi szabályok

- A felhasználó által megadott adatot, a mért adatot, a becslést, a feltételezést és a közösségi forgatókönyvet külön kell kezelni.
- Ellenőrizetlen fogyasztási érték, tarifa, kibocsátási tényező vagy képlet nem kerülhet kész tényként a kódba.
- Bizonytalan értéket tartományként kell kezelni; hamis pontosság tilos.
- A felület nem kelthet bűntudatot, és nem javasolhat egészséget vagy alapvető higiéniát veszélyeztető változtatást.

## 6. Fejlesztési munkafolyamat

- Fejlesztés külön ágon történjen, jelenleg: `v0-prototype`.
- A `main` ágba csak ellenőrzött változtatás kerülhet pull requesten keresztül.
- Minden módosításhoz világos commitüzenet tartozzon.
- Új funkcióhoz vagy számítási modellhez megfelelő ellenőrzés vagy teszteset szükséges.

## 7. Döntési sorrend felületi megoldásoknál

Felületi probléma esetén ezt a sorrendet kell követni:

1. Megoldható Bootstrap komponenssel?
2. Megoldható Bootstrap utility osztályok kombinációjával?
3. Megoldható Bootstrap CSS-változó vagy dokumentált testreszabás használatával?
4. Csak ezután készülhet célzott saját szabály a `style.css` fájlban.

Ha saját CSS készül, rövid megjegyzésben vagy a commit leírásában indokolni kell, miért nem volt elegendő a Bootstrap.