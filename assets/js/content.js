/*
 * DAISEY'S — szerkeszthető tartalom
 * ---------------------------------
 * Ebben a fájlban van minden, ami hétről hétre változik: események,
 * heti állandó estek, VIP csomagok és elérhetőségek. A HTML-hez nem kell
 * hozzányúlni, elég itt átírni az adatokat.
 *
 * Dátum formátum: "ÉÉÉÉ-HH-NN". A már elmúlt események automatikusan
 * eltűnnek az oldalról; ha nincs közelgő esemény, a heti estek látszanak.
 */
window.DAISEYS = {
  contact: {
    email: "info@daiseys.hu",            // TODO: valós e-mail cím
    phone: "+36 30 000 0000",            // TODO: valós telefonszám
    instagram: "https://www.instagram.com/daiseysbudapest/",
    instagramHandle: "@daiseysbudapest",
    address: "Dohány utca 22–24, 1074 Budapest",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Doh%C3%A1ny+utca+22-24+Budapest+1074"
  },

  // Közelgő események — TODO: valós line-up és jegylinkek
  events: [
    {
      date: "2026-10-30",
      title: "Gold Rush",
      genre: { hu: "Hip-hop · Trap · R'n'B", en: "Hip-hop · Trap · R'n'B" },
      lineup: "Resident DJs · Special live act",
      doors: "23:00",
      ticketUrl: "#foglalas",
      tag: { hu: "Élő fellépés", en: "Live act" }
    },
    {
      date: "2026-10-31",
      title: "Masquerade",
      genre: { hu: "Halloween · Álarcos bál", en: "Halloween · Masked ball" },
      lineup: "Daisey's Residents b2b Guest",
      doors: "22:00",
      ticketUrl: "#foglalas",
      tag: { hu: "Kötelező álarc", en: "Masks required" },
      featured: true
    },
    {
      date: "2026-11-06",
      title: "Velvet",
      genre: { hu: "R'n'B · Afrobeats · Throwbacks", en: "R'n'B · Afrobeats · Throwbacks" },
      lineup: "Resident DJs",
      doors: "23:00",
      ticketUrl: "#foglalas"
    },
    {
      date: "2026-11-07",
      title: "Noir",
      genre: { hu: "House · Tech House", en: "House · Tech House" },
      lineup: "Guest DJ · Resident warm-up",
      doors: "23:00",
      ticketUrl: "#foglalas"
    },
    {
      date: "2026-11-13",
      title: "Gold Rush",
      genre: { hu: "Hip-hop · Trap", en: "Hip-hop · Trap" },
      lineup: "Resident DJs · Live act",
      doors: "23:00",
      ticketUrl: "#foglalas",
      tag: { hu: "Élő fellépés", en: "Live act" }
    },
    {
      date: "2026-11-14",
      title: "Daisey's Saturday",
      genre: { hu: "Commercial · House · Club classics", en: "Commercial · House · Club classics" },
      lineup: "Resident DJs",
      doors: "23:00",
      ticketUrl: "#foglalas"
    }
  ],

  // Heti állandó estek — akkor látszanak, ha nincs közelgő esemény
  weekly: [
    { day: { hu: "Csütörtök", en: "Thursday" }, title: "Velvet", genre: { hu: "R'n'B · Afrobeats", en: "R'n'B · Afrobeats" } },
    { day: { hu: "Péntek", en: "Friday" }, title: "Gold Rush", genre: { hu: "Hip-hop · Trap", en: "Hip-hop · Trap" } },
    { day: { hu: "Szombat", en: "Saturday" }, title: "Daisey's Saturday", genre: { hu: "House · Commercial", en: "House · Commercial" } }
  ],

  // VIP asztalcsomagok — TODO: valós árak és tartalom
  packages: [
    {
      id: "lounge",
      name: "Lounge",
      guests: { hu: "max. 4 fő", en: "up to 4 guests" },
      minSpend: "120 000 Ft",
      perks: {
        hu: ["Garantált belépés, sorban állás nélkül", "Saját asztal a lounge-ban", "Dedikált host"],
        en: ["Guaranteed entry, no queue", "Private table in the lounge", "Dedicated host"]
      }
    },
    {
      id: "gold",
      name: "Gold",
      guests: { hu: "max. 6 fő", en: "up to 6 guests" },
      minSpend: "250 000 Ft",
      featured: true,
      perks: {
        hu: ["Asztal a táncparkett mellett", "Sparkler bottle service", "Saját pincér egész éjjel", "Ruhatár benne az árban"],
        en: ["Table by the dance floor", "Sparkler bottle service", "Personal waiter all night", "Cloakroom included"]
      }
    },
    {
      id: "black",
      name: "Black",
      guests: { hu: "max. 10 fő", en: "up to 10 guests" },
      minSpend: "500 000 Ft",
      perks: {
        hu: ["A legjobb asztal a DJ pult előtt", "Privát bejárat és host", "Prémium pezsgő érkezéskor", "Egyedi bottle show"],
        en: ["The best table in front of the booth", "Private entrance and host", "Premium champagne on arrival", "Custom bottle show"]
      }
    }
  ]
};
