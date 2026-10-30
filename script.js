/* Жаннат Жансеитова - Пространство радости. Ванильный JS: плиты, раскрытие пиона, меню, якоря, языки, тест, форма. */
(function () {
  "use strict";
  var doc = document, root = doc.documentElement, W = window;
  root.classList.add("js");
  var ASSET_V = ((doc.currentScript && doc.currentScript.src.match(/[?&]v=([^&]+)/)) || [])[1] || "";
  var REDUCED = W.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var TOUCH = W.matchMedia("(pointer:coarse)").matches;
  var clamp = function (v, a, b) { return Math.max(a === undefined ? 0 : a, Math.min(b === undefined ? 1 : b, v)); };
  var smooth = function (x) { x = clamp(x); return x * x * (3 - 2 * x); };
  var easeOut = function (x) { x = clamp(x); return 1 - Math.pow(1 - x, 3); };
  var VW = W.innerWidth, VH = W.innerHeight;
  var MOB = function () { return VW <= 900; };
  var LANG = "ru";
  var WA_NUM = "77074858494";

  /* ---------- Конверсии Google Ads: звонок, WhatsApp и почта, отправка формы ---------- */
  function conv(key) {
    var id = (W.ZH_CONV || {})[key];
    if (!id || typeof W.gtag !== "function") return;
    W.gtag("event", "conversion", { send_to: id, value: 1.0, currency: "USD", transport_type: "beacon" });
  }
  W.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
    if (!a) return;
    var h = a.getAttribute("href") || "";
    if (h.indexOf("tel:") === 0) conv("phone");
    else if (h.indexOf("wa.me") > -1 || h.indexOf("mailto:") === 0) conv("contact");
  }, true);

  /* ---------- WhatsApp: текст собирается в момент клика (фаза захвата на window, совместимо с LeadBot) ---------- */
  var HI = "Здравствуйте, Жаннат! Пишу с сайта. ";
  var WA = { ru: {
    "default": HI + "Хочу узнать подробнее.",
    hero: HI + "Хочу в круг «Пространство радости».",
    menu: HI + "Хочу узнать подробнее.",
    "pr-krug": "Хочу в круг за 6000 тг",
    "pr-razbor": "Хочу на разбор за 15000 тг",
    "pr-film": "Хочу фильм Деньги за 11000 тг",
    ceny: HI + "Не знаю, с чего начать. Меня волнует: ",
    znakomo: HI + "Хочу в круг «Пространство радости».",
    "pyat-programm": HI + "Хочу в круг. Подскажите, с какой программы начать.",
    vstrechi: "Хочу в круг за 6000 тг",
    "ob-avtore": HI + "Хочу в круг «Пространство радости».",
    otzyvy: HI + "Меня волнует: ",
    kontakty: HI + "Хочу узнать подробнее.",
    sticky: HI + "Хочу узнать подробнее.",
    start: HI + "Хочу начать. Подскажите, с чего лучше."
  } };
  W.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a[data-wa]") : null;
    if (!a) return;
    var key = a.getAttribute("data-wa") || "default";
    var d = WA[LANG] || WA.ru;
    var text = d[key] || WA.ru[key] || WA.ru["default"];
    if (key.indexOf("test-") === 0 && quiz) text = quiz.wa(key.slice(5));
    a.setAttribute("href", "https://wa.me/" + WA_NUM + "?text=" + encodeURIComponent(text));
  }, true);

  /* ---------- Пион: геометрия лепестков ---------- */
  var SVGNS = "http://www.w3.org/2000/svg";
  var PETAL = "M0 0C26-18 44-62 0-100C-44-62-26-18 0 0Z";
  var N_OUT = 9, N_IN = 7, IN_SCALE = 0.74, COVER_R = 54;
  function mk(tag, attrs) { var el = doc.createElementNS(SVGNS, tag); for (var k in attrs) el.setAttribute(k, attrs[k]); return el; }
  /* clipPath: только path напрямую (группы внутри clipPath не работают) */
  function buildClip(cp) {
    var paths = [];
    for (var i = 0; i < N_OUT; i++) paths.push(cp.appendChild(mk("path", { d: PETAL })));
    for (var j = 0; j < N_IN; j++) paths.push(cp.appendChild(mk("path", { d: PETAL })));
    var c = cp.appendChild(mk("circle", { r: 46 }));
    return { paths: paths, core: c };
  }
  /* линия поверх кадра: группы */
  function buildLine(g) {
    var outer = g.appendChild(mk("g", { "class": "outer" }));
    var inner = g.appendChild(mk("g", { "class": "inner" }));
    for (var i = 0; i < N_OUT; i++) outer.appendChild(mk("path", { d: PETAL, transform: "rotate(" + (i * 360 / N_OUT) + ")" }));
    for (var j = 0; j < N_IN; j++) inner.appendChild(mk("path", { d: PETAL, transform: "rotate(" + (j * 360 / N_IN) + ")" }));
    return { outer: outer, inner: inner };
  }
  /* тихий фон: контур пиона в viewBox -120..120 */
  [].forEach.call(doc.querySelectorAll(".bg-bloom .bgb"), function (g) {
    var b = buildLine(g);
    b.inner.setAttribute("transform", "rotate(20) scale(.74)");
    [].forEach.call(g.querySelectorAll("path"), function (p) { p.setAttribute("fill", "none"); p.setAttribute("stroke", "currentColor"); p.setAttribute("stroke-width", "1.1"); p.setAttribute("vector-effect", "non-scaling-stroke"); });
  });
  function Bloom(clipId, lineSvg) {
    this.clip = buildClip(doc.getElementById(clipId));
    this.line = lineSvg ? buildLine(lineSvg.querySelector(".blg")) : null;
    this.last = "";
  }
  Bloom.prototype.set = function (cx, cy, s, a) {
    var key = [cx | 0, cy | 0, s.toFixed(3), a.toFixed(1)].join("|");
    if (key === this.last) return;
    this.last = key;
    var base = "translate(" + cx.toFixed(1) + " " + cy.toFixed(1) + ")";
    var so = s, si = s * IN_SCALE, ai = -a * 0.6 + 20;
    var p = this.clip.paths, i;
    for (i = 0; i < N_OUT; i++) p[i].setAttribute("transform", base + " rotate(" + (a + i * 360 / N_OUT).toFixed(2) + ") scale(" + so.toFixed(4) + ")");
    for (i = 0; i < N_IN; i++) p[N_OUT + i].setAttribute("transform", base + " rotate(" + (ai + i * 360 / N_IN).toFixed(2) + ") scale(" + si.toFixed(4) + ")");
    this.clip.core.setAttribute("transform", base + " scale(" + so.toFixed(4) + ")");
    if (this.line) {
      var sl = s * 1.035;
      this.line.outer.setAttribute("transform", base + " rotate(" + a.toFixed(2) + ") scale(" + sl.toFixed(4) + ")");
      this.line.inner.setAttribute("transform", base + " rotate(" + ai.toFixed(2) + ") scale(" + (sl * IN_SCALE).toFixed(4) + ")");
    }
  };

  /* ---------- fitText для заголовка героя: ни одно слово не шире контейнера ---------- */
  var h1 = doc.getElementById("h1");
  function fitText() {
    if (!h1) return;
    h1.style.removeProperty("font-size");
    var avail = h1.clientWidth; if (!avail) return;
    var fs = parseFloat(getComputedStyle(h1).fontSize), guard = 0;
    var words = h1.textContent.split(/\s+/).sort(function (x, y) { return y.length - x.length; })[0] || "";
    var probe = doc.createElement("span"); probe.style.cssText = "position:absolute;visibility:hidden;white-space:nowrap;font:inherit";
    probe.textContent = words; h1.appendChild(probe);
    while (guard++ < 30 && probe.getBoundingClientRect().width > avail && fs > 22) { fs *= 0.95; h1.style.fontSize = fs + "px"; }
    h1.removeChild(probe);
  }

  /* ---------- Меню ---------- */
  var burger = doc.querySelector(".burger"), menu = doc.getElementById("menu");
  var behind = [doc.getElementById("main"), doc.getElementById("sticky")];
  function setMenu(open, returnFocus) {
    if (!menu || !burger) return;
    var was = doc.body.classList.contains("menu-open");
    if (open === was) return;
    doc.body.classList.toggle("menu-open", open);
    behind.forEach(function (el) { if (el) { if (open) el.setAttribute("inert", ""); else el.removeAttribute("inert"); } });
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(function () { requestAnimationFrame(function () { menu.classList.add("open"); }); });
      setTimeout(function () { try { menu.focus({ preventScroll: true }); } catch (e) {} }, 60);
    } else {
      menu.classList.remove("open");
      setTimeout(function () { if (!doc.body.classList.contains("menu-open")) menu.hidden = true; }, 380);
      if (returnFocus) burger.focus({ preventScroll: true });
    }
  }
  if (burger) burger.addEventListener("click", function () { var o = doc.body.classList.contains("menu-open"); setMenu(!o, o); });
  doc.addEventListener("keydown", function (e) { if (e.key === "Escape" && doc.body.classList.contains("menu-open")) setMenu(false, true); });

  /* ---------- Якоря ---------- */
  var HDR = function () { return parseFloat(getComputedStyle(root).getPropertyValue("--hdr")) || 72; };
  function isSticky(el) { return el.classList.contains("pw") && getComputedStyle(el.firstElementChild).position === "sticky"; }
  function targetTop(el) {
    var r = el.getBoundingClientRect().top + W.pageYOffset;
    if (el.id === "top") return 0;
    if (isSticky(el)) return r;
    if (el.classList.contains("sec") || el.classList.contains("pw")) return r - HDR() + 1;
    return r - HDR() - 14;
  }
  function goTo(id, instant) {
    var el = doc.getElementById(id);
    if (!el) return false;
    setMenu(false);
    var top = Math.max(0, targetTop(el));
    if (instant || REDUCED) { root.style.scrollBehavior = "auto"; W.scrollTo(0, top); root.style.scrollBehavior = ""; }
    else W.scrollTo({ top: top, behavior: "smooth" });
    return true;
  }
  doc.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    var id = a.getAttribute("href").slice(1);
    if (!id) return;
    if (goTo(id)) {
      e.preventDefault();
      try { history.pushState(null, "", "#" + id); } catch (err) {}
    }
  });

  /* ---------- Плиты и пион ---------- */
  var pws = [].slice.call(doc.querySelectorAll(".pw"));
  var sticky = doc.getElementById("sticky"), kont = doc.getElementById("kontakty");
  var hdr = doc.getElementById("hdr");
  var heroPw = doc.getElementById("top"), hero = heroPw ? heroPw.firstElementChild : null, heroPh = doc.getElementById("hero-ph");
  var heroBloom = heroPh ? new Bloom("bl-hero", doc.getElementById("bl-line-hero")) : null;
  var INTRO = (location.hash.length > 1 || W.pageYOffset > 80 || REDUCED) ? 1 : 0;
  var introStart = 0, ticking = false;
  var st = pws.map(function (pw) {
    var ph = pw.querySelector(".ph[data-bl]");
    return { out: {}, txts: pw.querySelectorAll(".txt"), on: null, ph: ph, img: ph ? ph.querySelector("img") : null,
      bloom: ph ? new Bloom(ph.getAttribute("data-bl"), ph.querySelector(".bl-line")) : null, clipOn: null };
  });
  /* блок автора вне плит: своё раскрытие по появлению */
  var auPh = doc.querySelector(".ph-a[data-bl]");
  var auBloom = auPh ? { ph: auPh, img: auPh.querySelector("img"), bloom: new Bloom(auPh.getAttribute("data-bl"), auPh.querySelector(".bl-line")), open: REDUCED ? 1 : 0, clipOn: null } : null;
  function put(el, s, k, v) { if (s.out[k] !== v) { s.out[k] = v; el.style.setProperty(k, v); } }
  function setPhBloom(o, open) {
    var r = o.ph.getBoundingClientRect(), w = r.width, h = r.height;
    if (!w || !h) return;
    var cx = w / 2, cy = h / 2;
    var rmax = Math.hypot(w / 2, h / 2) * 1.06;
    var s0 = 0.16, sFull = rmax / COVER_R;
    var ap = easeOut(open);
    var s = s0 + (sFull - s0) * Math.pow(ap, 1.6);
    var a = -42 * (1 - ap);
    o.bloom.set(cx, cy, s, a);
    o.ph.style.setProperty("--open", open.toFixed(4));
    var clipOn = open < 0.985;
    if (o.clipOn !== clipOn) { o.clipOn = clipOn; o.img.style.clipPath = clipOn ? "url(#" + o.ph.getAttribute("data-bl") + ")" : "none"; }
  }
  var heroCache = {};
  function setHeroBloom(intro, stay) {
    if (!heroBloom || !hero) return;
    var r = heroPh.getBoundingClientRect(), w = r.width, h = r.height;
    if (!w || !h) return;
    /* пион раскрывается на интро до полного кадра: фото героя видно целиком */
    var mob = MOB();
    var cx = 0.5 * w, cy = (mob ? 0.42 : 0.46) * h;
    var rmax = Math.max(Math.hypot(cx, cy), Math.hypot(w - cx, cy), Math.hypot(cx, h - cy), Math.hypot(w - cx, h - cy)) * 1.05;
    var sFull = rmax / COVER_R;
    var ip = easeOut(intro);
    var s = sFull * Math.pow(ip, 1.6), a = -60 * (1 - ip);
    heroBloom.set(cx, cy, s, a);
    var clipOn = ip < 0.995;
    if (heroCache.clipOn !== clipOn) { heroCache.clipOn = clipOn; heroPh.style.clipPath = clipOn ? "url(#bl-hero)" : "none"; }
  }
  function update() {
    ticking = false;
    var H = VH, pageY = W.pageYOffset, i;
    var kontTop = kont ? kont.getBoundingClientRect().top : null;
    var rects = [], nxt = [];
    for (i = 0; i < pws.length; i++) {
      rects.push(pws[i].getBoundingClientRect());
      var nx = pws[i].nextElementSibling;
      nxt.push(nx ? nx.getBoundingClientRect().top : null);
    }
    for (i = 0; i < pws.length; i++) {
      var pw = pws[i], r = rects[i], s = st[i];
      var near = r.bottom > -H * 0.3 && r.top < H * 1.3;
      var isHero = pw === heroPw;
      if (!near && s.wasFar) continue;
      s.wasFar = !near;
      var enter = clamp(1 - r.top / H);
      var stay = r.height > H * 1.1 ? clamp(-r.top / (r.height - H)) : clamp(-r.top / (r.height * 0.7));
      var exit = nxt[i] !== null ? clamp(1 - nxt[i] / H) : 0;
      if (MOB()) exit = 0;
      put(pw, s, "--enter", enter.toFixed(4));
      put(pw, s, "--stay", stay.toFixed(4));
      put(pw, s, "--exit", exit.toFixed(4));
      if (isHero) {
        put(pw, s, "--intro", (REDUCED ? 1 : easeOut(INTRO)).toFixed(4));
        setHeroBloom(REDUCED ? 1 : INTRO, MOB() ? 0 : stay);
      } else if (s.ph && near) {
        var open = REDUCED ? 1 : smooth((enter - 0.28) / 0.6);
        setPhBloom(s, open);
      }
      var plate = pw.firstElementChild;
      if (plate) plate.classList.toggle("gone", exit >= 1);
      var on = isHero ? INTRO > 0.3 : enter > (MOB() ? 0.35 : 0.6);
      if (s.on !== on) { s.on = on; for (var t = 0; t < s.txts.length; t++) s.txts[t].classList.toggle("on", on); }
    }
    if (auBloom) {
      var ar = auBloom.ph.getBoundingClientRect();
      if (ar.bottom > 0 && ar.top < H * 1.2) {
        var aopen = REDUCED ? 1 : smooth((1 - ar.top / H - 0.2) / 0.55);
        if (aopen > auBloom.open || auBloom.clipOn === null) { auBloom.open = Math.max(auBloom.open, aopen); setPhBloom(auBloom, auBloom.open); }
      }
    }
    if (sticky) {
      var show = pageY > H * 0.55;
      if (kontTop !== null && kontTop < H * 0.6) show = false;
      sticky.classList.toggle("show", show);
    }
    if (hdr) hdr.classList.toggle("scrolled", pageY > 12);
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  W.addEventListener("scroll", onScroll, { passive: true });
  W.addEventListener("resize", function () {
    if (W.innerWidth !== VW) { VW = W.innerWidth; VH = W.innerHeight; fitText(); st.forEach(function (s) { s.clipOn = null; }); heroCache = {}; }
    else if (!TOUCH) VH = W.innerHeight;
    onScroll();
  });
  function runIntro(ts) {
    if (!introStart) introStart = ts;
    INTRO = clamp((ts - introStart - 200) / 1350);
    update();
    if (INTRO < 1) requestAnimationFrame(runIntro);
  }

  /* ---------- Бегущая лента: копии, шаг цикла - одна копия ---------- */
  [].forEach.call(doc.querySelectorAll(".ribbon-track"), function (tr) {
    var n = tr.children.length;
    for (var k = 0; k < n; k++) tr.appendChild(tr.children[k].cloneNode(true));
  });

  /* ---------- Язык: RU в разметке, KZ и EN подгружаются отдельными файлами ---------- */
  var I18N = { ru: {} };
  var RU = I18N.ru;
  var iEls = function () { return [].slice.call(doc.querySelectorAll("[data-i]")); };
  var phEls = [].slice.call(doc.querySelectorAll("[data-i-ph]"));
  var ariaEls = [].slice.call(doc.querySelectorAll("[data-i-aria]"));
  var altEls = [].slice.call(doc.querySelectorAll("[data-i-alt]"));
  var metaDesc = doc.querySelector('meta[name="description"]');
  iEls().forEach(function (el) { if (RU[el.getAttribute("data-i")] == null) RU[el.getAttribute("data-i")] = el.textContent; });
  phEls.forEach(function (el) { RU[el.getAttribute("data-i-ph")] = el.getAttribute("placeholder"); });
  ariaEls.forEach(function (el) { RU[el.getAttribute("data-i-aria")] = el.getAttribute("aria-label"); });
  altEls.forEach(function (el) { RU[el.getAttribute("data-i-alt")] = el.getAttribute("alt"); });
  RU["meta.title"] = doc.title;
  RU["meta.desc"] = metaDesc ? metaDesc.getAttribute("content") : "";
  var FORM_L = { ru: { head: "Заявка с сайта. Хочу начать с:", name: "Имя", phone: "Телефон", msg: "Что волнует", opt: { r: "Персональный разбор (15 000 тг)", c: "Женский круг (6 000 тг в месяц)", f: "Фильм «Деньги» (11 000 тг)" } } };
  function t(key) { var d = I18N[LANG] || RU; return d[key] != null ? d[key] : RU[key]; }
  function applyLang(lang) {
    if (!I18N[lang]) lang = "ru";
    LANG = lang;
    iEls().forEach(function (el) { var v = t(el.getAttribute("data-i")); if (v != null) el.textContent = v; });
    phEls.forEach(function (el) { var v = t(el.getAttribute("data-i-ph")); if (v != null) el.setAttribute("placeholder", v); });
    ariaEls.forEach(function (el) { var v = t(el.getAttribute("data-i-aria")); if (v != null) el.setAttribute("aria-label", v); });
    altEls.forEach(function (el) { var v = t(el.getAttribute("data-i-alt")); if (v != null) el.setAttribute("alt", v); });
    doc.title = t("meta.title");
    if (metaDesc) metaDesc.setAttribute("content", t("meta.desc"));
    root.setAttribute("lang", lang);
    [].forEach.call(doc.querySelectorAll(".lang button"), function (b) {
      var on = b.getAttribute("data-lang") === lang;
      b.classList.toggle("is-active", on); b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    try { localStorage.setItem("zh-lang", lang); } catch (e) {}
    fitText();
    if (quiz) quiz.render();
  }
  function loadLang(lang, done) {
    if (I18N[lang] || (lang !== "kk" && lang !== "en")) return done();
    var s = doc.createElement("script");
    s.src = "assets/lang/" + lang + ".js" + (ASSET_V ? "?v=" + ASSET_V : "");
    s.onload = function () {
      var key = lang.toUpperCase();
      if (W["SITE_" + key]) {
        I18N[lang] = W["SITE_" + key];
        if (W["SITE_" + key + "_WA"]) WA[lang] = W["SITE_" + key + "_WA"];
        if (W["SITE_" + key + "_FORM"]) FORM_L[lang] = W["SITE_" + key + "_FORM"];
        if (W["SITE_" + key + "_QZ"]) QZ[lang] = W["SITE_" + key + "_QZ"];
      }
      done();
    };
    s.onerror = function () { done(); };
    doc.head.appendChild(s);
  }
  function setLang(lang) { loadLang(lang, function () { applyLang(lang); }); }
  [].forEach.call(doc.querySelectorAll(".lang button"), function (b) {
    b.addEventListener("click", function () { setLang(b.getAttribute("data-lang")); });
  });
  (function initLang() {
    var forced = (location.search.match(/[?&]lang=(ru|kk|en)/) || [])[1];
    var saved = null; try { saved = localStorage.getItem("zh-lang"); } catch (e) {}
    var lang = forced || saved || "ru";
    if (lang !== "ru") setLang(lang);
  })();

  /* ---------- Проявление секций ---------- */
  var rv = [].slice.call(doc.querySelectorAll(".rv"));
  if ("IntersectionObserver" in W && !REDUCED) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
    rv.forEach(function (el) { io.observe(el); });
    setTimeout(function () { rv.forEach(function (el) { if (!el.classList.contains("in") && el.getBoundingClientRect().top < W.innerHeight) el.classList.add("in"); }); }, 1500);
  } else rv.forEach(function (el) { el.classList.add("in"); });

  /* ---------- Тест «Где теряется энергия» (по макету клиентки): ответы уходят Жаннат в WhatsApp ---------- */
  /* Код ответа: заглавная буква - программа (T тело, M мысли, R род, D деньги, O отношения), строчная - запрос (k консультация, c круг, t инструмент) */
  var QZ = { ru: {
    ui: {
      how: [["Один вопрос - один экран", "Только то, что откликается сейчас"], ["7 честных ответов", "Правильных вариантов нет, выбирайте сердцем"], ["Ваша карта программы", "Что это, почему так и с чего начать"]],
      start: "Начать тест", note: "2 минуты · ответы видите только вы", num: "Вопрос {n} из {m}", back: "Назад",
      hint: "Выбирайте не правильно, а честно",
      lbl: "Ваша программа сейчас", feel: "Как это чувствуется", begin: "С чего начать бережно",
      k: { h: "Разобрать вашу карту один на один", p: "Персональный разбор: диагностика 5 программ, находим 1 ключевую установку, которая держит, и даю практику на 10 минут в день.", m: "15 000 ₸ · онлайн · план на руках", b: "Хочу на разбор - 15 000 ₸", alt: "Или начать мягко в кругу" },
      c: { h: "Начать мягко в кругу", p: "Тема под ваш запрос: «{c}». 90 минут онлайн, практика и чат после встречи.", pt: "На круге дам инструмент: {p}. Сможете делать дома сама.", b: "Хочу в круг", alt: "Или разобрать карту один на один" },
      sent: "Ваши ответы уйдут в сообщении - Жаннат прочитает их и ответит лично.", again: "Пройти тест заново"
    },
    wa: { hi: "Здравствуйте, Жаннат! Прошла тест на сайте. Моя программа - {p}.", k: "Хочу на персональный разбор за 15000 тг.", c: "Хочу в круг. Тема: «{c}».", ans: "Мои ответы:" },
    q: [
      { t: "Что чаще всего звучит в голове утром?", s: "Утром в голове", o: [["Опять надо быть сильной", "T"], ["Тревожно, много мыслей", "M"], ["Я как мама", "R"], ["Денег вечно не хватает", "D"], ["Меня не ценят", "O"]] },
      { t: "Где вы чувствуете напряжение в теле?", h: "Отмечайте то, что откликается сейчас", s: "Напряжение в теле", o: [["Плечи, шея - несу всё на себе", "T"], ["Голова, бессонница, туман", "M"], ["Живот, грудь - сжимается внутри", "R"], ["Сжатые челюсти, напряжение", "D"], ["Ком в горле, хочется плакать", "O"]] },
      { t: "Какая фраза про вас сейчас?", s: "Фраза про меня", o: [["Я потеряла себя", "M"], ["Устала быть сильной", "T"], ["Повторяю мамину судьбу", "R"], ["Деньги уходят сквозь пальцы", "D"], ["Как полюбить себя?", "O"]] },
      { t: "Чего бы вам хотелось больше всего?", s: "Хочется", o: [["Выдохнуть и почувствовать тело", "T"], ["Тишины в голове", "M"], ["Отпустить обиды", "R"], ["Разрешить себе иметь", "D"], ["Быть в центре своей жизни", "O"]] },
      { t: "Что вас останавливает?", s: "Останавливает", o: [["Нет сил", "T"], ["Страхи и тревога", "M"], ["Чувство вины и долга", "R"], ["Стыдно брать деньги", "D"], ["Боюсь остаться одна", "O"]] },
      { t: "Сколько вам сейчас лет душой?", h: "Шуточный, но очень честный вопрос", s: "Лет душой", o: [["20 - хочется сбежать и начать заново", ""], ["35 - ищу, кто я на самом деле", ""], ["45 - хочу тишины и правды", ""], ["60+ - устала, хочу на ручки", ""]] },
      { t: "Что вы хотите получить сейчас?", h: "Выберите то, к чему тянет сильнее", s: "Хочу получить", o: [["Просто выговориться и быть услышанной", "k"], ["Быть в кругу женщин, где тихо и безопасно", "c"], ["Инструмент, который могу делать дома сама", "t"]] }
    ],
    p: {
      T: { n: "Тело", d: "Вы долго были сильной. Тело устало держать всё.", b: "Это не лень и не возраст. Это сигнал: пора вернуть себе мягкость и право чувствовать. Когда вы всё время напряжены, тело становится сейфом для чужих ожиданий. Оно просит выдоха.", f: "Плечи, бессонница, ощущение «я как камень», нет сил даже на радость.", r: "Начните с тела - мысли успокоятся сами. Мягкое заземление, дыхание 4-7-8, тёплые руки на живот.", c: "Возвращение в тело. Мягкость вместо силы", t: "практику «5 минут выдоха» и аудио-заземление" },
      M: { n: "Мысли", d: "В голове шумно. Вы потеряли себя в чужих ожиданиях.", b: "Вы привыкли всё анализировать и контролировать. Но тишина внутри не приходит от ещё одного совета - ей нужно место. Сейчас ваша энергия утекает в бесконечный внутренний диалог.", f: "Тревожные круги, не могу уснуть, постоянно прокручиваю разговоры.", r: "Нужна выгрузка, а не мотивация. Дневник тишины и практика «пустая чашка».", c: "Тишина в голове. Как перестать себя накручивать", t: "ритуал утренних страниц и карточку стоп-мыслей" },
      R: { n: "Род", d: "Вы несёте чужую судьбу. Мамины сценарии держат вас.", b: "Чувство вины, долга, невозможность простить - это не ваш характер, это родовая программа. Будто живёте не свою жизнь, а повторяете то, что видели в детстве.", f: "Повторяю судьбу мамы, не могу отпустить обиду, чувствую вину, если выбираю себя.", r: "Нужен мягкий развод с чужим сценарием. Письмо маме, ритуал благодарности и отпускания.", c: "Род. Как выйти из маминого сценария без вины", t: "практику «Я и моя мама - две разные женщины»" },
      D: { n: "Деньги", d: "Вы умеете отдавать, но разучились брать.", b: "Деньги уходят, потому что внутри запрет на «иметь». Стыдно просить, стыдно брать много, страшно быть корыстной. Вы сильная, но деньги любят не силу, а разрешение.", f: "Работаю много - денег мало. Стыдно назвать цену. Отдаю последнее.", r: "Разрешение иметь. Практика «можно» и перепрошивка фразы «мне нельзя».", c: "Деньги и разрешение. Почему мне можно иметь больше", t: "чек-лист денежных запретов и практику «открытые ладони»" },
      O: { n: "Отношения", d: "Вы ставите в центр всех, кроме себя.", b: "Вас не ценят, потому что вы сами ушли из центра своей жизни. Любовь не нужно доказывать - вы её заслуживаете. Пора вернуть себя, и люди вокруг перестроятся.", f: "Обидно, одиноко в семье, хочу тепла, но боюсь просить.", r: "Границы без крика. Практика «я в центре» и разговор из взрослой части.", c: "Я в центре своей жизни. Отношения без потери себя", t: "практику «три центра» и фразу для границ" }
    }
  } };
  var QZ_ICO = { T: "ic-body", M: "ic-mind", R: "ic-rod", D: "ic-money", O: "ic-heart" };
  var quiz = (function () {
    var box = doc.getElementById("qz");
    if (!box) return null;
    var step = -1, ans = [], busy = false;
    function Q() { return QZ[LANG] || QZ.ru; }
    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
    function code(i) { return QZ.ru.q[i].o[ans[i]][1]; }
    /* программа: больше всего совпадений, при равенстве - та, что выбрана последней */
    function prog() {
      var cnt = {}, order = [], max = 0;
      ans.forEach(function (a, i) { var c = code(i); if (/^[A-Z]$/.test(c)) { cnt[c] = (cnt[c] || 0) + 1; order.push(c); if (cnt[c] > max) max = cnt[c]; } });
      for (var j = order.length - 1; j >= 0; j--) if (cnt[order[j]] === max) return order[j];
      return "T";
    }
    function intent() { for (var i = ans.length - 1; i >= 0; i--) { var c = code(i); if (/^[a-z]$/.test(c)) return c; } return "k"; }
    function waBtn(kind, label) {
      return '<a class="btn btn-gold" href="https://wa.me/' + WA_NUM + '" data-wa="test-' + kind + '" target="_blank" rel="noopener"><svg width="18" height="18" aria-hidden="true"><use href="#ic-wa"/></svg><span>' + esc(label) + "</span></a>";
    }
    function waLnk(kind, label) {
      return '<a class="lnk" href="https://wa.me/' + WA_NUM + '" data-wa="test-' + kind + '" target="_blank" rel="noopener"><span>' + esc(label) + '</span><svg width="16" height="16" aria-hidden="true"><use href="#ic-arr"/></svg></a>';
    }
    function render(focus) {
      var d = Q(), u = d.ui, h = "";
      if (step < 0) {
        h = '<ul class="qz-how">' + u.how.map(function (x) { return "<li><b>" + esc(x[0]) + "</b><span>" + esc(x[1]) + "</span></li>"; }).join("") + "</ul>";
        h += '<ul class="qz-chips">' + ["T", "M", "R", "D", "O"].map(function (k) { return '<li><svg width="18" height="18" aria-hidden="true"><use href="#' + QZ_ICO[k] + '"/></svg>' + esc(d.p[k].n) + "</li>"; }).join("") + "</ul>";
        h += '<div class="qz-go"><button class="btn btn-gold" type="button" data-qz="start">' + esc(u.start) + '<svg width="18" height="18" aria-hidden="true"><use href="#ic-arr"/></svg></button><p class="qz-note">' + esc(u.note) + "</p></div>";
      } else if (step < d.q.length) {
        var q = d.q[step];
        h = '<div class="qz-top"><p class="qz-num">' + esc(u.num.replace("{n}", step + 1).replace("{m}", d.q.length)) + '</p><button class="qz-back" type="button" data-qz="back"' + (step ? "" : " hidden") + '><svg width="16" height="16" aria-hidden="true"><use href="#ic-arr"/></svg>' + esc(u.back) + "</button></div>";
        h += '<div class="qz-bar" aria-hidden="true"><i style="transform:scaleX(' + ((step + 1) / d.q.length).toFixed(3) + ')"></i></div>';
        h += '<h3 class="qz-q" tabindex="-1">' + esc(q.t) + '</h3><p class="qz-h">' + esc(q.h || u.hint) + "</p>";
        h += '<div class="qz-opts">' + q.o.map(function (o, i) { var on = ans[step] === i; return '<button class="qz-o' + (on ? " is-on" : "") + '" type="button" data-qz="o" data-n="' + i + '" aria-pressed="' + on + '">' + esc(o[0]) + "</button>"; }).join("") + "</div>";
      } else {
        var k = prog(), p = d.p[k], it = intent(), consult = it === "k";
        h = '<p class="qz-lbl">' + esc(u.lbl) + '</p><h3 class="qz-pn" tabindex="-1">' + esc(p.n) + '</h3><p class="qz-d">' + esc(p.d) + '</p><p class="qz-b">' + esc(p.b) + "</p>";
        h += '<div class="qz-two"><div><b>' + esc(u.feel) + "</b><p>" + esc(p.f) + "</p></div><div><b>" + esc(u.begin) + "</b><p>" + esc(p.r) + "</p></div></div>";
        if (consult) {
          h += '<div class="qz-off"><h4>' + esc(u.k.h) + "</h4><p>" + esc(u.k.p) + '</p><p class="qz-meta">' + esc(u.k.m) + '</p><div class="qz-cta">' + waBtn("k", u.k.b) + waLnk("c", u.k.alt) + "</div></div>";
        } else {
          var txt = it === "t" ? u.c.pt.replace("{p}", p.t) : u.c.p.replace("{c}", p.c);
          h += '<div class="qz-off"><h4>' + esc(u.c.h) + "</h4><p>" + esc(txt) + '</p><div class="qz-cta">' + waBtn("c", u.c.b) + waLnk("k", u.c.alt) + "</div></div>";
        }
        h += '<p class="qz-note" style="margin-top:14px">' + esc(u.sent) + '</p><button class="qz-again" type="button" data-qz="again">' + esc(u.again) + "</button>";
      }
      box.innerHTML = '<div class="qz-step">' + h + "</div>";
      if (focus) {
        var hd = box.querySelector("[tabindex='-1']");
        /* карточку - под шапку, чтобы варианты не уходили под липкую панель */
        var top = box.getBoundingClientRect().top, off = (doc.getElementById("hdr") || { offsetHeight: 72 }).offsetHeight + 16;
        if (Math.abs(top - off) > 40) W.scrollTo({ top: W.pageYOffset + top - off, behavior: REDUCED ? "auto" : "smooth" });
        if (hd) try { hd.focus({ preventScroll: true }); } catch (e) {}
      }
    }
    box.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest("[data-qz]") : null;
      if (!b || busy) return;
      var a = b.getAttribute("data-qz");
      if (a === "start") { step = 0; ans = []; render(true); }
      else if (a === "back") { if (step > 0) { step--; render(true); } }
      else if (a === "again") { step = -1; ans = []; render(true); }
      else if (a === "o") {
        ans[step] = +b.getAttribute("data-n");
        ans.length = step + 1;
        [].forEach.call(box.querySelectorAll(".qz-o"), function (x) { var on = x === b; x.classList.toggle("is-on", on); x.setAttribute("aria-pressed", on); });
        busy = true;
        setTimeout(function () { busy = false; step++; render(true); }, REDUCED ? 60 : 280);
      }
    });
    render(false);
    return {
      render: function () { render(false); },
      wa: function (kind) {
        var d = Q(), p = d.p[prog()];
        var lines = [d.wa.hi.replace("{p}", p.n) + " " + (kind === "k" ? d.wa.k : d.wa.c.replace("{c}", p.c)), "", d.wa.ans];
        ans.forEach(function (a, i) { lines.push((i + 1) + ". " + d.q[i].s + ": " + d.q[i].o[a][0]); });
        return lines.join("\n");
      }
    };
  })();

  /* ---------- Форма -> WhatsApp ---------- */
  var form = doc.getElementById("form"), thanks = doc.getElementById("thanks"), ferr = doc.getElementById("ferr");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = form.elements;
      if (f.website && f.website.value) { form.hidden = true; if (thanks) thanks.hidden = false; return; }
      var name = f.name.value.trim(), phone = f.phone.value.trim();
      var badName = !name, badPhone = phone.replace(/\D/g, "").length < 10;
      f.name.classList.toggle("bad", badName); f.phone.classList.toggle("bad", badPhone);
      f.name.setAttribute("aria-invalid", badName ? "true" : "false"); f.phone.setAttribute("aria-invalid", badPhone ? "true" : "false");
      if (badName || badPhone) { if (ferr) ferr.hidden = false; (badName ? f.name : f.phone).focus(); return; }
      if (ferr) ferr.hidden = true;
      var L = FORM_L[LANG] || FORM_L.ru;
      var opt = (form.querySelector('input[name="start"]:checked') || {}).value || "r";
      var lines = [L.head + " " + (L.opt[opt] || ""), L.name + ": " + name, L.phone + ": " + phone];
      if (f.message.value.trim()) lines.push(L.msg + ": " + f.message.value.trim());
      var url = "https://wa.me/" + WA_NUM + "?text=" + encodeURIComponent(lines.join("\n"));
      conv("lead");
      W.open(url, "_blank", "noopener");
      form.hidden = true;
      if (thanks) { thanks.hidden = false; try { thanks.focus({ preventScroll: true }); } catch (err) {} }
      form.reset();
    });
  }

  /* ---------- Ленты со стрелками: шаг в одну карточку, крайняя кнопка гаснет, обе прячутся, если всё влезло ---------- */
  [].forEach.call(doc.querySelectorAll("[data-car]"), function (car) {
    var tr = car.querySelector(".car-track"), prev = car.querySelector("[data-car-prev]"), next = car.querySelector("[data-car-next]"), nav = car.querySelector(".car-nav");
    if (!tr) return;
    function stepW() { var li = tr.firstElementChild; return li ? li.getBoundingClientRect().width + (parseFloat(getComputedStyle(tr).columnGap) || 16) : tr.clientWidth; }
    function sync() {
      var max = tr.scrollWidth - tr.clientWidth;
      nav.hidden = max < 4;
      prev.disabled = tr.scrollLeft < 4;
      next.disabled = tr.scrollLeft > max - 4;
    }
    prev.addEventListener("click", function () { tr.scrollBy({ left: -stepW(), behavior: REDUCED ? "auto" : "smooth" }); });
    next.addEventListener("click", function () { tr.scrollBy({ left: stepW(), behavior: REDUCED ? "auto" : "smooth" }); });
    tr.addEventListener("scroll", sync, { passive: true });
    W.addEventListener("resize", sync);
    W.addEventListener("load", sync);
    sync();
  });

  /* ---------- Видео-отзывы: ролик грузится только по клику ---------- */
  [].forEach.call(doc.querySelectorAll(".otz-vid"), function (b) {
    b.addEventListener("click", function () {
      [].forEach.call(doc.querySelectorAll(".otz-vid video"), function (v) { v.pause(); });
      var box = doc.createElement("div"), v = doc.createElement("video");
      box.className = "otz-vid is-on";
      v.src = b.getAttribute("data-video"); v.controls = true; v.playsInline = true; v.setAttribute("playsinline", "");
      v.poster = b.querySelector("img").getAttribute("src");
      v.setAttribute("aria-label", b.querySelector(".otz-vcap").textContent);
      box.appendChild(v); b.parentNode.replaceChild(box, b);
      try { v.focus({ preventScroll: true }); } catch (e) {}
      var pr = v.play(); if (pr && pr.catch) pr.catch(function () {});
    });
  });

  /* ---------- Просмотр скринов и сертификата ---------- */
  var zoom = doc.getElementById("zoom");
  if (zoom && zoom.showModal) {
    var zImg = zoom.querySelector("img");
    doc.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("a[data-zoom]");
      if (!a) return;
      e.preventDefault();
      var im = a.querySelector("img");
      zImg.src = a.getAttribute("href"); zImg.alt = im ? im.alt : "";
      zoom.showModal();
    });
    zoom.addEventListener("click", function (e) { if (e.target !== zImg) zoom.close(); });
  }

  var year = doc.getElementById("year"); if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Старт ---------- */
  function start() {
    fitText();
    if (location.hash.length > 1) {
      var id = location.hash.slice(1);
      goTo(id, true);
      setTimeout(function () { goTo(id, true); update(); }, 80);
      setTimeout(function () { goTo(id, true); update(); }, 600);
    }
    update();
    if (INTRO < 1) requestAnimationFrame(runIntro);
  }
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(function () { fitText(); update(); });
  if (doc.readyState === "complete") start(); else W.addEventListener("load", start);
  update();
})();
