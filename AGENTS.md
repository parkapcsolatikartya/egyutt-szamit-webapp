# AGENTS.md

Ez a fájl a repositoryban dolgozó minden fejlesztőre és automatizált kódügynökre kötelező szabályokat tartalmazza.

## 1. Kötelező projektindítás

A projekt szakmai és módszertani elsődleges forrása a Google Drive `Csepp a tengerben` projektmappája. A ChatGPT projektfeladat előtt köteles megnyitni a `00A – Kötelező munkakezdési iránytű` dokumentumot.

A Codex helyi fejlesztéskor a repositoryban található, ellenőrzött fejlesztői összefoglalókat használja:

- `docs/guidelines/PROJECT_RULES.md`
- `docs/guidelines/VISUAL_RULES.md`
- isometric vagy képi asset feladatnál: `docs/guidelines/ISOMETRIC_RULES.md`

A Drive dokumentumai az elsődleges források; a repositorybeli fájlok Codex számára készített operatív összefoglalók. Ha a kettő között eltérés ismert, a Drive szabálya az irányadó, és a repository összefoglalóját frissíteni kell.

## 2. ChatGPT → Codex handoff protokoll

A fejlesztési döntések, UX-egyeztetés, kutatás és feladatspecifikáció elsődlegesen a webes ChatGPT projektben történik. Codexet elsősorban konkrét implementációra használjuk.

A ChatGPT által jóváhagyott aktuális implementációs feladat helye:

`/.ai/CURRENT_TASK.md`

A Codex által készített végrehajtási összefoglaló helye:

`/.ai/TASK_RESULT.md`

A projekt rövid, gépek között hordozható állapotképe:

`/PROJECT_STATE.md`

### `START` parancs

Ha a felhasználó a Codexnek azt írja, hogy `START`, akkor a Codex:

1. ellenőrizze, hogy a jelenlegi ág `v0-prototype`;
2. olvassa el ezt az `AGENTS.md` fájlt;
3. olvassa el a `PROJECT_STATE.md` fájlt;
4. olvassa el a `docs/guidelines/PROJECT_RULES.md` és `docs/guidelines/VISUAL_RULES.md` fájlokat;
5. képi/isometric feladatnál olvassa el a `docs/guidelines/ISOMETRIC_RULES.md` fájlt is;
6. olvassa el a `.ai/CURRENT_TASK.md` fájlt;
7. kizárólag a CURRENT_TASK hatókörében dolgozzon;
8. felhasználói felületet érintő módosítás előtt azonosítsa a tényleges renderelési forrást: ne feltételezze, hogy a statikus `index.html` marad a böngészőben látható DOM; keressen olyan JavaScriptet vagy sablont, amely betöltéskor átírhatja az érintett elemet;
9. a változtatást helyben hajtsa végre, és a szükséges ellenőrzéseket futtassa le;
10. vizuális feladatnál ne tekintse elégségesnek pusztán a kiszolgált HTML forrásának (`curl`, grep) ellenőrzését, ha JavaScript módosíthatja a DOM-ot; a ténylegesen renderelt felületet is ellenőrizze, és jelezze, ha erre a környezetből nincs megbízható lehetősége;
11. a munka végén írja felül a `.ai/TASK_RESULT.md` fájlt a tényleges eredménnyel;
12. ne commitoljon és ne pusholjon, hacsak a felhasználó erre külön nem utasítja.

Ha a feladat, a fájl vagy valamely kötelező szabály nem érthető, a Codex ne találjon ki új scope-ot. A hiányt a `TASK_RESULT.md` fájlban jelezze, illetve kérdezzen vissza csak akkor, ha a biztonságos implementáció másként nem lehetséges.

### `SYNC` parancs

Ha a felhasználó külön azt írja, hogy `SYNC`, akkor a Codex:

1. ellenőrizze a `git status` eredményét;
2. futtassa a feladathoz tartozó teszteket;
3. csak a jelenlegi munkamenethez tartozó módosításokat stage-elje;
4. készítsen rövid, értelmes commitot;
5. pusholja a `v0-prototype` ágat;
6. a `.ai/TASK_RESULT.md` fájlban rögzítse a commit azonosítóját, ha elérhető.

A `main` ágba közvetlen push nem megengedett.

### `DEVICE_SETUP` parancs — egyszeri gépbeállítás

Ha a felhasználó egy már megnyitott helyi repositoryban azt írja a Codexnek, hogy `DEVICE_SETUP`, akkor a Codex önállóan készítse elő az adott Macet a projekt fejlesztésére, és csak olyan ponton kérjen felhasználói beavatkozást, ahol operációs rendszer-, böngészős vagy fiókhitelesítés ténylegesen szükséges.

A Codex:

1. ellenőrizze, hogy a repository az `parkapcsolatikartya/egyutt-szamit-webapp` tároló helyi klónja;
2. ellenőrizze a Git, Node.js, npm és GitHub CLI (`gh`) elérhetőségét;
3. Node.js esetén legalább a `package.json` `engines` követelményét teljesítő verzió szükséges;
4. hiányzó fejlesztői eszközt macOS-en lehetőleg Homebrew segítségével telepítsen; rendszerjelszó, Homebrew első telepítés vagy más rendszer-szintű engedély esetén kérje a felhasználó jóváhagyását, és ne kerülje meg az operációs rendszer védelmét;
5. ellenőrizze a `gh auth status` eredményét; ha nincs érvényes GitHub-hitelesítés, indítsa el a GitHub CLI böngészős hitelesítését, és csak a böngészőben szükséges felhasználói jóváhagyásra várjon;
6. sikeres GitHub-hitelesítés után futtassa a `gh auth setup-git` beállítást;
7. váltson a `v0-prototype` ágra, ellenőrizze a munkafát, majd biztonságos állapotban húzza le a legfrissebb `origin/v0-prototype` állapotot;
8. ellenőrizze a projekt futtatási környezetét, szükség esetén telepítse a projekt függőségeit;
9. futtassa az `npm test` tesztcsomagot;
10. indítsa el vagy készítse elő a helyi előnézetet `http://localhost:8080` címen;
11. a végén röviden jelentse: eszközök verziói, GitHub-auth státusz, ág, teszteredmény, localhost státusz és minden olyan pont, amely még kézi beavatkozást igényel.

A `DEVICE_SETUP` alatt forráskódot, projekt-tartalmat, CURRENT_TASK-ot vagy PROJECT_STATE-et módosítani tilos. Commit és push nem készülhet. A cél kizárólag az adott gép fejlesztői környezetének beállítása.

### `WORKSTART` parancs — napi munkakezdés

Ha a felhasználó azt írja a Codexnek, hogy `WORKSTART`, akkor a Codex a napi technikai indítást végezze el helyette:

1. ellenőrizze, hogy a repositoryban van és az ág `v0-prototype`;
2. futtassa a `git status` ellenőrzést;
3. ha a munkafa nem tiszta, ne pulloljon és ne írjon felül semmit; röviden jelentse, mi maradt helyben;
4. tiszta munkafánál húzza le a legfrissebb `origin/v0-prototype` állapotot;
5. ellenőrizze, hogy a szükséges Node/npm környezet elérhető;
6. indítsa el a helyi szervert, ha a 8080-as porton még nem fut a projekt;
7. ellenőrizze, hogy `http://localhost:8080` válaszol;
8. röviden jelentse, hogy a gép készen áll-e a munkára, és van-e aktív `.ai/CURRENT_TASK.md` feladat.

A `WORKSTART` nem implementációs parancs: nem módosíthat forráskódot, nem commitolhat és nem pusholhat. Ha van aktív jóváhagyott feladat, annak végrehajtása továbbra is külön `START` paranccsal indul.

## 3. Bootstrap-first megjelenési szabály

A webalkalmazás felületét kötelezően Bootstrap-alapokon kell felépíteni.

- A Bootstrap 5 a projekt elsődleges mobile-first CSS frameworkje.
- Elrendezéshez elsőként a Bootstrap gridet, containereket, flex- és spacing utilityket kell használni.
- Tipográfiához, gombokhoz, űrlapokhoz, navigációhoz, kártyákhoz, visszajelzésekhez és reszponzív viselkedéshez elsőként Bootstrap komponenseket és utility osztályokat kell választani.
- Új saját CSS csak akkor írható, ha a kívánt megjelenés Bootstrap osztályokkal nem oldható meg ésszerűen, vagy valóban egyedi vizuális elem szükséges.
- Tilos saját CSS-ben újraimplementálni olyan általános szabályt, amelyet a Bootstrap már biztosít.
- A saját stílusokat az `app/assets/css/style.css` fájlban kell tartani.
- Inline `style` attribútum és indokolatlan `!important` kerülendő.
- A döntési sorrend: Bootstrap komponens → Bootstrap utility → Bootstrap dokumentált testreszabás → célzott saját CSS.

Eltérés csak a projektgazda kifejezett jóváhagyásával és a Döntési naplóban rögzített indoklással engedélyezett.

## 4. Mobile-first és hozzáférhetőség

- A legkisebb mobilos nézet az alapértelmezett.
- Nagyobb képernyőkhöz Bootstrap breakpointokkal kell fokozatosan bővíteni a megjelenést.
- A felületet legalább keskeny mobil, nagy mobil, tablet és asztali nézetben ellenőrizni kell, ha a változtatás vizuális vagy layoutot érint.
- Érintési célok, olvashatóság, űrlapkezelés, szemantika és billentyűzetes használat nem romolhat vizuális finomítás miatt.

## 5. Technikai alap

- Szemantikus HTML.
- Bootstrap 5.
- Moduláris, keretrendszer nélküli JavaScript.
- A kérdések, ajánlások, feltételezések és források külön, verziózott JSON-fájlokban legyenek.
- A számítások első körben kliensoldalon fussanak.
- A helyi állapot LocalStorage-ban tárolható.
- A V0 regisztráció és központi felhasználói adatbázis nélkül működik.

## 6. Hitelességi szabályok

- A felhasználó által megadott adatot, mért adatot, becslést, feltételezést és közösségi forgatókönyvet külön kell kezelni.
- Ellenőrizetlen fogyasztási érték, tarifa, kibocsátási tényező vagy képlet nem kerülhet kész tényként a kódba.
- Bizonytalan értéket tartományként kell kezelni; hamis pontosság tilos.
- A felület nem kelthet bűntudatot, és nem javasolhat egészséget vagy alapvető higiéniát veszélyeztető változtatást.
- Látványtervben szereplő szám, partnerlogó vagy együttműködés nem kerülhet a működő felületre külön tartalmi ellenőrzés nélkül.

## 7. Kötelező vizuális irány

A frontend elsődleges vizuális rendszere világos, levegős, barátságos és magas esztétikai minőségű. A funkcionálisan helyes, de vizuálisan kidolgozatlan komponens nem tekinthető késznek.

- Fehér vagy nagyon világos háttér.
- Elsődleges akcentusok: kék, türkiz, mentazöld.
- Meleg narancs vagy sárga csak kisebb kiemelésként.
- Illusztrációs stílus: lightweight 3D vector, isometric vector vagy soft 3D UI illustration.
- Egységes perspektíva, fényirány, árnyék, részletesség, karakterarány és színpaletta.
- Eltérő illusztrációs családok keverése kerülendő.
- A 3D grafika nem helyettesíti a szemantikus HTML-t, Bootstrap komponenst vagy funkcionális feliratot.
- Funkcionális ikonhoz elsőként Bootstrap Icons használatos.

## 8. Képi assetek és teljesítmény

- Egyszerű ikonhoz és egyszerű vector elemhez elsőként optimalizált SVG használatos.
- Összetett 3D illusztrációnál a ténylegesen kisebb és megfelelő minőségű SVG, WebP vagy AVIF választandó.
- PNG csak dokumentált technikai indokkal használható.
- Nagy kép base64 formában nem ágyazható HTML-be vagy CSS-be.
- Ugyanazt az assetet ugyanazon fájlútvonalról és URL-ről kell újrahasználni; indokolatlan duplikáció tilos.
- Hajtás alatti képen `loading="lazy"` használatos.
- Minden képen legyen `width` és `height` attribútum.
- Raster képnél szükség szerint `srcset`, `sizes` és `decoding="async"` használatos.
- A hajtás felett egyszerre legfeljebb egy nagy, eager betöltésű hero illusztráció legyen.

Irányadó célméretek: egyszerű UI-ikon 1–8 KB; összetettebb saját ikon 5–15 KB; kis 3D illusztráció 20–70 KB; közepes illusztráció 50–120 KB; hero illusztráció lehetőleg 80–180 KB. A célméret nem írhatja felül a vizuális minőséget.

## 9. Fejlesztési ág és ellenőrzés

- Aktív fejlesztési ág: `v0-prototype`.
- A `main` ágba csak ellenőrzött változtatás kerülhet pull requesten keresztül.
- Minden módosításhoz világos commitüzenet tartozzon.
- Új funkcióhoz vagy számítási modellhez megfelelő ellenőrzés vagy teszteset szükséges.
- Helyi futtatás: `npm run serve`, majd `http://localhost:8080`.
- Alap tesztcsomag: `npm test`.
