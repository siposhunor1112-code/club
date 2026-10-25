# DAISEY'S — Budapest

Luxus weboldal a Daisey's tánc- és éjszakai klubnak (Dohány utca 22–24, 1074 Budapest).

Statikus oldal, nincs build lépés: bármilyen tárhelyre feltölthető (Netlify, Vercel, GitHub Pages, Cloudflare Pages, sima FTP).

```bash
# helyi előnézet
python3 -m http.server 8000
# majd: http://localhost:8000
```

## Mi van az oldalon

| Szekció | Tartalom |
| --- | --- |
| **Hero** | Valós idejű, egérre reagáló arany „színpadi füst” (WebGL), arany DAISEY'S felirat, foglalás gomb |
| **Programok** | Közelgő események listája; asztali gépen az egér alatt arany plakát-előnézet úszik. A már elmúlt események maguktól eltűnnek |
| **Élmény** | Hang, fény, színpad, kiszolgálás, az Instagram fellépés-fotóval, számlálós statisztikákkal |
| **Történet** | Az épület valós története vízszintes görgetéssel: 1908 Árkád Bazár (Vágó testvérek, Zsolnay) → 1966 Metro Klub (Zorán, Metro együttes) → 1969 *Extázis 7-től 10-ig* → ma Daisey's |
| **VIP** | Három asztalcsomag (Lounge / Gold / Black) és foglalási űrlap |
| **Házirend** | Dress code, korhatár, nyitvatartás, jegyek, privát rendezvények |
| **Helyszín** | Sötét, arany tónusú térkép, megközelítés (M2 Astoria, Blaha) |
| **Instagram + lábléc** | @daiseysbudapest, hírlevél, elérhetőségek |

További részletek: magyar/angol nyelvváltó (a választást megjegyzi), preloader, egyedi kurzor, filmszemcse-effekt, mobilmenü, SEO meta + `NightClub` schema.org adat, `prefers-reduced-motion` támogatás. JavaScript nélkül is olvasható az oldal.

## Tartalom szerkesztése

**Minden, ami hétről hétre változik, egy fájlban van: [`assets/js/content.js`](assets/js/content.js).**

- `events`: események (dátum, név, műfaj, line-up, kapunyitás, jegylink)
- `weekly`: heti állandó estek (akkor látszanak, ha nincs közelgő esemény)
- `packages`: VIP csomagok, árak, tartalom
- `contact`: e-mail, telefon, Instagram, térkép link

A fix szövegek az `index.html`-ben vannak: a magyar szöveg az elemben, az angol a `data-en` attribútumban.

## Teendő élesítés előtt

Ezek **helykitöltő adatok**, cserélni kell őket a valódiakra:

- [ ] E-mail és telefonszám (`content.js` → `contact`)
- [ ] Események, line-upok, jegylinkek (`content.js` → `events`)
- [ ] VIP csomagok árai és tartalma (`content.js` → `packages`)
- [ ] Nyitvatartás (jelenleg: Csüt–Szo 23:00–05:00), a hero oldalsávjában, a házirendben és a láblécben
- [ ] Több saját fotó/videó: a hero mögé egy rövid, hang nélküli klubvideó még erősebb lenne
- [ ] Az asztalfoglaló és a hírlevél űrlap most a látogató levelezőjét nyitja meg előre kitöltött levéllel. Éles oldalon érdemes valódi foglalási rendszerre vagy űrlap-szolgáltatásra kötni (pl. Formspree, Tablein, SevenRooms)
- [ ] Domain (pl. `daiseys.hu`) és a `og:image` abszolút URL-je

## Felépítés

```
index.html             oldal szerkezet + magyar/angol szövegek
assets/css/style.css   teljes dizájn (arany/fekete design tokenek a :root-ban)
assets/js/content.js   szerkeszthető tartalom
assets/js/main.js      interakciók, nyelvváltó, renderelés, animációk (GSAP + ScrollTrigger CDN-ről)
assets/js/smoke.js     WebGL arany füst a hero mögött
assets/img/            fotó, favicon, megosztási kép
```
