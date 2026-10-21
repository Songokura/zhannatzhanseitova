/* Жаннат Жансеитова - Пространство радости. Ванильный JS: плиты, раскрытие пиона, меню, якоря, языки, форма. */
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

  /* ---------- WhatsApp: текст собирается в момент клика (фаза захвата на window, совместимо с LeadBot) ---------- */
  var HI = "Здравствуйте, Жаннат! Пишу с сайта. ";
  var WA = { ru: {
    "default": HI + "Хочу узнать подробнее о консультации.",
    hero: HI + "Хочу в круг «Пространство радости».",
    menu: HI + "Хочу узнать подробнее.",
    konsultaciya: HI + "Хочу записаться на индивидуальную консультацию.",
    klub: HI + "Хочу в круг. Расскажите о ближайшей встрече.",
    "ob-avtore": HI + "Хочу в круг «Пространство радости».",
    otzyvy: HI + "Хочу почитать отзывы участниц круга.",
    praktiki: HI + "Интересуют практики и медитации. Подскажите, с чего начать.",
    programmy: HI + "Интересует программа:",
    kontakty: HI + "Хочу узнать подробнее о консультации.",
    sticky: HI + "Хочу узнать подробнее.",
    start: HI + "Хочу начать. Подскажите, с чего лучше."
  } };
  W.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a[data-wa]") : null;
    if (!a) return;
    var key = a.getAttribute("data-wa") || "default";
    var d = WA[LANG] || WA.ru;
    var text = d[key] || WA.ru[key] || WA.ru["default"];
    if (key === "programmy") {
      var h = a.querySelector("h3");
      text += "\n" + (h ? h.textContent.trim() : "");
    }
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
  var FORM_L = { ru: { head: "Заявка с сайта. Хочу начать с:", name: "Имя", phone: "Телефон", msg: "Что волнует", opt: { k: "Консультация", c: "Женский круг", p: "Практики и медитации" } } };
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
      var opt = (form.querySelector('input[name="start"]:checked') || {}).value || "c";
      var lines = [L.head + " " + (L.opt[opt] || ""), L.name + ": " + name, L.phone + ": " + phone];
      if (f.message.value.trim()) lines.push(L.msg + ": " + f.message.value.trim());
      var url = "https://wa.me/" + WA_NUM + "?text=" + encodeURIComponent(lines.join("\n"));
      W.open(url, "_blank", "noopener");
      form.hidden = true;
      if (thanks) { thanks.hidden = false; try { thanks.focus({ preventScroll: true }); } catch (err) {} }
      form.reset();
    });
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
