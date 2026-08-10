# Vizuális szabályok – Codex operatív összefoglaló

Forrásállapot: 2026-08-10
Kanonikus forrás: Google Drive `09 – Vizuális rendszer és képi asset irányelvek`.

> Ez a fájl a Codex helyi munkájához készült tömör összefoglaló. Ha eltérés van, a Drive dokumentuma az elsődleges.

## Elsőrendű minőségi szabály

A vizuális minőség a funkcionalitással egyenrangú. Funkcionálisan helyes, de tipográfiailag, kompozíciósan vagy reszponzívan gyenge komponens nem tekinthető késznek.

Minden érintett képernyőn ellenőrizni kell:

- képek körüli levegő;
- margók és paddingek;
- arányok;
- betűméretek és sortávok;
- színharmónia és kontraszt;
- vizuális hierarchia;
- igazítások és ismétlődő ritmus;
- reszponzív egyensúly.

## Jóváhagyott vizuális karakter

- világos, levegős, barátságos, megbízható;
- fehér vagy nagyon világos, enyhén meleg/kékes háttér;
- finom világos kártyák és visszafogott árnyékok;
- elsődleges kék, türkiz és mentazöld akcentusok;
- narancs/sárga csak kisebb kiemelésként;
- nem sötét admin-dashboard;
- nem agresszív neon;
- nem túlzsúfolt dashboard.

## Bootstrap és grafika

1. Elrendezés/reszponzivitás: Bootstrap grid, container, utility.
2. Funkcionális UI: Bootstrap komponensek és Bootstrap Icons.
3. Márka- és szemléltető grafika: optimalizált 3D/isometric asset.
4. Saját CSS csak indokolt esetben.

A 3D grafika nem helyettesíthet funkcionális UI-elemet vagy HTML-ben szükséges szöveget.

## Illusztrációs stílus

Elsődleges nyelv:

- lightweight 3D vector;
- isometric vector;
- soft 3D UI illustration;
- lekerekített, egyszerűsített geometria;
- puha, rövid, világos árnyék;
- egységes fényirány;
- visszafogott térmélység;
- barátságos, nem fotórealisztikus karakterek;
- egységes perspektíva, paletta, részletesség és tárgyarány.

Eltérő illusztrációs családok keverése kerülendő.

## Assetformátum

Preferált sorrend:

- egyszerű ikon / vector: optimalizált SVG;
- összetett 3D vector: SVG, ha valóban kisebb és jól renderelhető;
- túl nagy/összetett SVG helyett WebP, szükség esetén AVIF;
- PNG csak dokumentált indokkal.

Tilos:

- nagy base64 kép HTML-ben/CSS-ben;
- ugyanazon grafika indokolatlan duplikálása;
- indokolatlan fizikai képméret;
- szerkesztői forrásfájl közvetlen produkciós használata;
- nem optimalizált SVG export.

## Irányadó fájlméretek

- egyszerű UI ikon: 1–8 KB;
- összetettebb saját ikon: 5–15 KB;
- kis 3D illusztráció: 20–70 KB;
- közepes tartalmi illusztráció: 50–120 KB;
- hero illusztráció: lehetőleg 80–180 KB.

A vizuális minőség nem áldozható fel mechanikusan a célméret kedvéért.

## HTML-képszabályok

- Hajtás alatti kép: `loading="lazy"`.
- Raster: `decoding="async"` javasolt.
- Képen legyen `width` és `height`.
- Több felbontásnál `srcset` és `sizes`.
- Dekoratív kép: üres `alt`, szükség esetén `aria-hidden`.
- Tartalmi kép: rövid, értelmes magyar `alt`.
- HTML-ben megjelenítendő szöveg ne legyen képre égetve.

## Assetútvonal és név

Javasolt helyek:

- `app/assets/icons/`
- `app/assets/illustrations/`
- `app/assets/images/`

Jelentésalapú, kisbetűs, kötőjeles név; lehetőség szerint `es-` előtag.

Ugyanazt az assetet ugyanarról az URL-ről kell újrahasználni a cache-hatékonyság miatt.
