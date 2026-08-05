# AGENTS.md

Ez a fájl a repositoryban dolgozó minden fejlesztőre és automatizált kódügynökre kötelező szabályokat tartalmazza.

## 1. Kötelező projektindítás

Minden fejlesztési feladat előtt el kell olvasni a projekt Google Drive-mappájában található `00A – Kötelező munkakezdési iránytű` dokumentumot.

Ha a dokumentum nem érhető el, ezt egyértelműen jelezni kell. Nem szabad úgy tenni, mintha el lett volna olvasva.

## 2. Bootstrap-first megjelenési szabály

A webalkalmazás felületét kötelezően Bootstrap-alapokon kell felépíteni.

Ez a szabály a teljes projektre vonatkozik: minden jelenlegi és későbbi oldalra, komponensre, prototípusra, staging és éles környezetre, valamint minden frontend forrásfájlra. Eltérés csak a projektgazda kifejezett jóváhagyásával és a Döntési naplóban rögzített indoklással engedélyezett.

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
- Látványtervben szereplő szám, partnerlogó vagy együttműködés nem kerülhet a működő felületre külön tartalmi ellenőrzés nélkül.

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

## 8. Kötelező vizuális irány

A további frontend-fejlesztés elsődleges vizuális rendszere világos, levegős és barátságos. A korábbi sötét admin-dashboard vagy „személyes hatásközpont” megjelenés történeti prototípus, nem aktuális irány.

- Fehér vagy nagyon világos háttér használata.
- Elsődleges akcentusok: kék, türkiz, mentazöld.
- Meleg narancs vagy sárga csak kisebb kiemelésként.
- Az illusztrációk stílusa: könnyű 3D vector, isometric vector vagy soft 3D UI illustration.
- Egységes perspektíva, fényirány, árnyék, részletesség, karakterarány és színpaletta szükséges.
- Eltérő illusztrációs családok keverése kerülendő.
- A 3D grafika csak szemléltető és márkaelem; nem helyettesíti a szemantikus HTML-t, a Bootstrap komponenst vagy a funkcionális feliratot.
- Funkcionális ikonhoz elsőként Bootstrap Icons használatos.

A részletes irányt a Drive-források között található `09 – Vizuális rendszer és képi asset irányelvek` dokumentum rögzíti.

## 9. Képi assetek és teljesítmény

- Egyszerű ikonhoz és egyszerű vector elemhez elsőként optimalizált SVG használatos.
- Összetett 3D illusztrációnál a ténylegesen kisebb és megfelelő minőségű SVG, WebP vagy AVIF választandó; az SVG nem automatikusan a legkisebb.
- PNG csak dokumentált technikai indokkal használható.
- Nagy kép base64 formában nem ágyazható HTML-be vagy CSS-be.
- Ugyanazt az ikont vagy illusztrációt ugyanazon fájlútvonalról és URL-ről kell újrahasználni.
- Azonos asset több külön fájlnéven történő duplikálása tilos.
- Hajtás alatti képen `loading="lazy"` használatos.
- Minden képen legyen `width` és `height` attribútum.
- Raster képnél szükség szerint `srcset`, `sizes` és `decoding="async"` használatos.
- A hajtás felett egyszerre legfeljebb egy nagy, eager betöltésű hero illusztráció legyen.
- Verziózott vagy tartalomhash-alapú statikus asset hosszú cache-élettartammal szolgálható ki; változáskor új fájlnév szükséges.

Irányadó célméretek:

- egyszerű UI-ikon: 1–8 KB;
- összetettebb saját ikon: 5–15 KB;
- kis 3D illusztráció: 20–70 KB;
- közepes illusztráció: 50–120 KB;
- hero illusztráció: lehetőleg 80–180 KB.

A célméret nem írhatja felül az olvashatóságot és a vizuális minőséget. A végleges formátumot valós fájlméret- és böngészős ellenőrzés alapján kell kiválasztani.
