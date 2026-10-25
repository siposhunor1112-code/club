/*
 * DAISEY'S — interactions
 * Everything degrades gracefully: without GSAP the content still reveals,
 * without JS the page is fully readable (Hungarian).
 */
(function () {
  "use strict";

  var DATA = window.DAISEYS || { events: [], weekly: [], packages: [], contact: {} };
  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var $ = function (s, ctx) { return (ctx || document).querySelector(s); };
  var $$ = function (s, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(s)); };

  var UI = {
    hu: {
      doors: "Kapunyitás", lineup: "Line-up", choose: "Ezt választom", minSpend: "Minimum fogyasztás",
      mostPopular: "Legnépszerűbb", every: "Minden", weekly: "Heti est", tickets: "Foglalás",
      sent: "Köszönjük! Megnyílt a leveleződ — küldd el az üzenetet, és hamarosan visszaigazoljuk a foglalást.",
      missing: "Kérjük, töltsd ki a kötelező mezőket.", newsOk: "Köszönjük! Megnyílt a leveleződ a feliratkozáshoz.",
      newsBad: "Adj meg egy érvényes e-mail címet.", view: "Részletek"
    },
    en: {
      doors: "Doors", lineup: "Line-up", choose: "Choose this", minSpend: "Minimum spend",
      mostPopular: "Most popular", every: "Every", weekly: "Weekly night", tickets: "Book",
      sent: "Thank you! Your mail app has opened — send the message and we'll confirm your table shortly.",
      missing: "Please fill in the required fields.", newsOk: "Thank you! Your mail app has opened to subscribe.",
      newsBad: "Please enter a valid e-mail address.", view: "Details"
    }
  };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function pick(v, lang) { return v && typeof v === "object" ? (v[lang] || v.hu) : v; }
  function parseDate(s) { var p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }

  /* ------------------------------------------------------------------ i18n */
  var lang = "hu";
  try { lang = localStorage.getItem("daiseys-lang") || ""; } catch (e) { lang = ""; }
  if (lang !== "hu" && lang !== "en") lang = "hu";

  function applyLang(next) {
    lang = next;
    root.lang = next;
    $$("[data-en]").forEach(function (el) {
      if (!el.hasAttribute("data-hu")) el.setAttribute("data-hu", el.innerHTML.trim());
      el.innerHTML = next === "en" ? el.getAttribute("data-en") : el.getAttribute("data-hu");
    });
    try { localStorage.setItem("daiseys-lang", next); } catch (e) { /* storage unavailable */ }
    renderEvents();
    renderPackages();
    splitManifesto();
  }

  $(".lang").addEventListener("click", function () { applyLang(lang === "hu" ? "en" : "hu"); });

  /* ---------------------------------------------------------------- events */
  function renderEvents() {
    var list = $("[data-events]");
    if (!list) return;
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var locale = lang === "hu" ? "hu-HU" : "en-GB";
    var t = UI[lang];
    var upcoming = (DATA.events || [])
      .filter(function (e) { return parseDate(e.date) >= today; })
      .sort(function (a, b) { return parseDate(a.date) - parseDate(b.date); });

    var html;
    if (upcoming.length) {
      html = upcoming.map(function (e) {
        var d = parseDate(e.date);
        var mon = new Intl.DateTimeFormat(locale, { month: "short" }).format(d).replace(".", "");
        var wd = new Intl.DateTimeFormat(locale, { weekday: "long" }).format(d);
        var tag = e.tag ? '<span class="event__tag">' + esc(pick(e.tag, lang)) + "</span>" : "";
        return '<li class="event' + (e.featured ? " event--featured" : "") + '">' +
          '<a class="event__link" href="' + esc(e.ticketUrl || "#foglalas") + '" data-preview="' + esc(e.title) + '">' +
            '<span class="event__date"><span class="event__day">' + String(d.getDate()).padStart(2, "0") + '</span>' +
              '<span class="event__mon"><span>' + esc(mon) + '</span><span>' + esc(wd) + "</span></span></span>" +
            '<span class="event__main"><h3 class="event__title">' + esc(e.title) + '</h3>' +
              '<span class="event__genre">' + esc(pick(e.genre, lang)) + "</span>" + tag + "</span>" +
            '<span class="event__info"><span><b>' + t.lineup + ":</b> " + esc(e.lineup) + '</span>' +
              "<span><b>" + t.doors + ":</b> " + esc(e.doors) + "</span></span>" +
            '<span class="event__go" aria-hidden="true">→</span>' +
          "</a></li>";
      }).join("");
    } else {
      html = (DATA.weekly || []).map(function (w, i) {
        return '<li class="event"><a class="event__link" href="#foglalas" data-preview="' + esc(w.title) + '">' +
          '<span class="event__date"><span class="event__day">0' + (i + 1) + '</span>' +
            '<span class="event__mon"><span>' + t.every + '</span><span>' + esc(pick(w.day, lang)) + "</span></span></span>" +
          '<span class="event__main"><h3 class="event__title">' + esc(w.title) + '</h3>' +
            '<span class="event__genre">' + esc(pick(w.genre, lang)) + "</span></span>" +
          '<span class="event__info"><span><b>' + t.doors + ":</b> 23:00</span><span>" + t.weekly + "</span></span>" +
          '<span class="event__go" aria-hidden="true">→</span></a></li>';
      }).join("");
    }
    list.innerHTML = html;
    bindEventPreview();
    observeReveals($$(".event", list));
  }

  /* -------------------------------------------------------------- packages */
  function renderPackages() {
    var wrap = $("[data-packages]");
    var select = $("[data-package-select]");
    if (!wrap) return;
    var t = UI[lang];
    var current = select ? select.value : "";
    wrap.innerHTML = (DATA.packages || []).map(function (p) {
      return '<article class="pkg reveal' + (p.featured ? " pkg--featured" : "") + '">' +
        '<span class="pkg__ribbon">' + t.mostPopular + "</span>" +
        '<h3 class="pkg__name">' + esc(p.name) + "</h3>" +
        '<div class="pkg__guests">' + esc(pick(p.guests, lang)) + "</div>" +
        '<div class="pkg__price"><small>' + t.minSpend + "</small><b>" + esc(p.minSpend) + "</b></div>" +
        "<ul>" + pick(p.perks, lang).map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>" +
        '<button type="button" class="btn ' + (p.featured ? "btn--gold" : "btn--line") + '" data-choose="' + esc(p.id) + '">' + t.choose + "</button>" +
      "</article>";
    }).join("");

    if (select) {
      select.innerHTML = (DATA.packages || []).map(function (p) {
        return '<option value="' + esc(p.id) + '">' + esc(p.name) + " — " + esc(pick(p.guests, lang)) + " · " + esc(p.minSpend) + "</option>";
      }).join("");
      var featured = (DATA.packages || []).filter(function (p) { return p.featured; })[0];
      select.value = current || (featured ? featured.id : "");
    }

    $$(".pkg", wrap).forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
    $$("[data-choose]", wrap).forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (select) select.value = btn.getAttribute("data-choose");
        var form = $(".booking");
        form.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
        setTimeout(function () { var n = $("input[name=name]", form); if (n) n.focus({ preventScroll: true }); }, 700);
      });
    });
    observeReveals($$(".pkg", wrap));
  }

  /* ------------------------------------------------------------- contacts */
  function applyContacts() {
    var c = DATA.contact || {};
    $$("[data-email]").forEach(function (a) { if (c.email) { a.href = "mailto:" + c.email; a.textContent = c.email; } });
    $$("[data-phone]").forEach(function (a) { if (c.phone) { a.href = "tel:" + c.phone.replace(/\s/g, ""); a.textContent = c.phone; } });
    $$("[data-maps]").forEach(function (a) { if (c.mapsUrl) a.href = c.mapsUrl; });
    $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  }

  /* ----------------------------------------------------------------- forms */
  function bindForms() {
    var c = DATA.contact || {};
    var form = $(".booking");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var ok = true;
        $$("input[required]", form).forEach(function (inp) {
          var bad = !inp.value.trim();
          inp.closest(".field").classList.toggle("is-invalid", bad);
          if (bad) ok = false;
        });
        var status = $(".booking__status", form);
        if (!ok) { status.textContent = UI[lang].missing; return; }
        var f = form.elements;
        var sel = f["package"];
        var body = [
          "Név / Name: " + f.name.value,
          "Telefon / Phone: " + f.phone.value,
          "Dátum / Date: " + f.date.value,
          "Létszám / Guests: " + f.guests.value,
          "Csomag / Package: " + (sel.options[sel.selectedIndex] ? sel.options[sel.selectedIndex].text : ""),
          "Megjegyzés / Notes: " + f.notes.value
        ].join("\n");
        window.location.href = "mailto:" + (c.email || "") +
          "?subject=" + encodeURIComponent("VIP asztalfoglalás — " + f.date.value) +
          "&body=" + encodeURIComponent(body);
        status.textContent = UI[lang].sent;
      });
      $$("input", form).forEach(function (inp) {
        inp.addEventListener("input", function () { inp.closest(".field").classList.remove("is-invalid"); });
      });
      var date = form.elements.date;
      if (date) date.min = new Date().toISOString().slice(0, 10);
    }

    var news = $(".footer__news");
    if (news) {
      news.addEventListener("submit", function (e) {
        e.preventDefault();
        var inp = news.elements.email;
        var status = $(".news__status", news);
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value.trim())) { status.textContent = UI[lang].newsBad; return; }
        window.location.href = "mailto:" + (c.email || "") + "?subject=" + encodeURIComponent("Guest list") +
          "&body=" + encodeURIComponent(inp.value.trim());
        status.textContent = UI[lang].newsOk;
        inp.value = "";
      });
    }
  }

  /* ---------------------------------------------------------------- reveal */
  var revealObserver = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target;
      var siblings = el.parentElement ? $$(":scope > .reveal, :scope > .event", el.parentElement) : [];
      var idx = Math.max(0, siblings.indexOf(el));
      el.style.transitionDelay = Math.min(idx, 6) * 90 + "ms";
      el.classList.add("is-in");
      revealObserver.unobserve(el);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: .08 }) : null;

  function observeReveals(els) {
    els.forEach(function (el) {
      if (!el.classList.contains("reveal") && !el.classList.contains("reveal-lines")) el.classList.add("reveal");
      if (revealObserver && !reduceMotion) revealObserver.observe(el);
      else el.classList.add("is-in");
    });
  }

  /* ------------------------------------------------------------- manifesto */
  var manifesto = $("[data-split]");
  var GOLD_WORDS = /^(arany|gold|basszus|bass|emlékszik|remembers|éjszaka,?|night)/i;
  function splitManifesto() {
    if (!manifesto) return;
    var words = manifesto.textContent.trim().split(/\s+/);
    manifesto.innerHTML = words.map(function (w) {
      return '<span class="w' + (GOLD_WORDS.test(w) ? " is-gold" : "") + '">' + esc(w) + "</span>";
    }).join(" ");
    updateManifesto();
  }
  function updateManifesto() {
    if (!manifesto) return;
    var words = manifesto.querySelectorAll(".w");
    var r = manifesto.getBoundingClientRect();
    var vh = window.innerHeight;
    var p = Math.min(1, Math.max(0, (vh * .85 - r.top) / (r.height + vh * .35)));
    var lit = reduceMotion ? words.length : Math.round(p * words.length);
    for (var i = 0; i < words.length; i++) words[i].classList.toggle("is-lit", i < lit);
  }

  /* ------------------------------------------------------------------- nav */
  var nav = $(".nav");
  var lastY = 0;
  function onScroll() {
    var y = window.scrollY;
    nav.classList.toggle("is-scrolled", y > 40);
    nav.classList.toggle("is-hidden", y > lastY && y > 600 && !root.classList.contains("menu-open"));
    lastY = y;
    updateManifesto();
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  if ("IntersectionObserver" in window) {
    var links = $$(".nav__links a");
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle("is-active", a.getAttribute("href") === "#" + en.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    links.forEach(function (a) { var s = $(a.getAttribute("href")); if (s) spy.observe(s); });
  }

  var burger = $(".burger");
  var menu = $(".menu");
  function setMenu(open) {
    root.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", open);
    menu.setAttribute("aria-hidden", !open);
    document.body.style.overflow = open ? "hidden" : "";
  }
  burger.addEventListener("click", function () { setMenu(!root.classList.contains("menu-open")); });
  $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });

  /* ---------------------------------------------------------------- cursor */
  var cursor = $(".cursor");
  var cursorLabel = $(".cursor__label");
  var preview = $(".events__preview");
  var pos = { x: -100, y: -100 }, cur = { x: -100, y: -100 }, prev = { x: -100, y: -100 };
  if (finePointer) {
    window.addEventListener("pointermove", function (e) { pos.x = e.clientX; pos.y = e.clientY; }, { passive: true });
    (function loop() {
      cur.x += (pos.x - cur.x) * .22; cur.y += (pos.y - cur.y) * .22;
      prev.x += (pos.x - prev.x) * .1; prev.y += (pos.y - prev.y) * .1;
      cursor.style.transform = "translate3d(" + cur.x + "px," + cur.y + "px,0)";
      if (preview) preview.style.left = prev.x + "px", preview.style.top = prev.y + "px";
      requestAnimationFrame(loop);
    })();
    document.addEventListener("pointerover", function (e) {
      var hit = e.target.closest("a, button, summary, input, select, textarea");
      cursor.classList.toggle("is-hover", !!hit && !e.target.closest(".event"));
    });
  }

  function bindEventPreview() {
    if (!finePointer || !preview) return;
    var label = preview.querySelector("span");
    $$(".event__link").forEach(function (a) {
      a.addEventListener("pointerenter", function () {
        label.textContent = a.getAttribute("data-preview");
        preview.classList.add("is-on");
        cursor.classList.add("is-label");
        cursorLabel.textContent = UI[lang].tickets;
      });
      a.addEventListener("pointerleave", function () {
        preview.classList.remove("is-on");
        cursor.classList.remove("is-label");
      });
    });
  }

  /* --------------------------------------------------------------- counters */
  function bindCounters() {
    var els = $$("[data-count]");
    if (!("IntersectionObserver" in window) || reduceMotion) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, end = +el.getAttribute("data-count"), k = el.getAttribute("data-format") === "k";
        var from = k ? 0 : Math.max(0, end - 120), t0 = performance.now(), dur = 1800;
        (function tick(now) {
          var p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 4);
          var v = from + (end - from) * e;
          el.textContent = k ? (v / 1000).toFixed(1) + "K" : Math.round(v);
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
        io.unobserve(el);
      });
    }, { threshold: .6 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------------------ GSAP */
  function initMotion() {
    var gsap = window.gsap, ST = window.ScrollTrigger;
    if (!gsap || !ST || reduceMotion) return;
    gsap.registerPlugin(ST);

    // Hero letters drift apart and fade as you scroll away
    gsap.to(".hero__word > span", {
      yPercent: function (i) { return (i % 2 ? -1 : 1) * (12 + i * 3); },
      opacity: .15, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
    });
    gsap.to(".hero__tag, .hero__cta", {
      y: -80, opacity: 0, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "60% top", scrub: true }
    });

    // Parallax photo
    gsap.fromTo(".frame img", { yPercent: -8 }, {
      yPercent: 4, ease: "none",
      scrollTrigger: { trigger: ".experience__media", start: "top bottom", end: "bottom top", scrub: true }
    });

    // Footer wordmark rises
    gsap.from(".footer__word", {
      yPercent: 40, opacity: 0, ease: "power3.out",
      scrollTrigger: { trigger: ".footer", start: "top 90%", end: "top 30%", scrub: true }
    });

    // Heritage: horizontal pinned scroll on large screens
    ST.matchMedia({
      "(min-width: 1024px)": function () {
        var section = $(".heritage");
        var track = $(".heritage__track");
        section.classList.add("is-horizontal");
        ST.refresh();
        var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth + track.getBoundingClientRect().left); };
        var tween = gsap.to(track, {
          x: function () { return -dist(); }, ease: "none",
          scrollTrigger: {
            trigger: section, pin: ".heritage__pin", start: "top top",
            end: function () { return "+=" + dist(); }, scrub: 1, invalidateOnRefresh: true,
            onUpdate: function (self) { gsap.set(".heritage__progress i", { scaleX: self.progress }); }
          }
        });
        return function () { tween.kill(); section.classList.remove("is-horizontal"); gsap.set(track, { clearProps: "x" }); };
      }
    });
  }

  /* ---------------------------------------------------------------- intro */
  function intro() {
    var loader = $(".loader");
    var gsap = window.gsap;
    document.body.classList.remove("is-loading");
    loader.classList.add("is-done");
    if (gsap && !reduceMotion) {
      gsap.from(".hero__word > span", { yPercent: 110, opacity: 0, filter: "blur(12px)", duration: 1.6, ease: "expo.out", stagger: .07, delay: .35 });
      gsap.from(".hero__tag, .hero__cta, .hero__meta, .hero__scroll", { y: 30, opacity: 0, duration: 1.4, ease: "expo.out", stagger: .1, delay: 1 });
    }
  }

  /* ------------------------------------------------------------------ boot */
  document.body.classList.add("is-loading");
  applyContacts();
  applyLang(lang);
  bindForms();
  bindCounters();
  observeReveals($$(".reveal, .reveal-lines"));
  onScroll();

  var started = false;
  function start() {
    if (started) return;
    started = true;
    initMotion();
    intro();
  }
  var minShow = reduceMotion ? 0 : 1700;
  var t0 = performance.now();
  window.addEventListener("load", function () { setTimeout(start, Math.max(0, minShow - (performance.now() - t0))); });
  setTimeout(start, 4000); // never let a slow asset hold the loader
})();
