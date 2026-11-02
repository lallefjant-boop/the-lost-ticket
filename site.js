// The Lost Ticket download page. No tracking, no network requests: this picks
// the right download for your computer, shows the matching install steps and
// runs the page's animations (intro, stars, scratch card, badges, gallery).
(function () {
  "use strict";

  // The release tool rewrites these links when a new version is published.
  var DOWNLOADS = {
    mac: { href: "https://github.com/lallefjant-boop/the-lost-ticket/releases/download/v1.5.3/TheLostTicket-mac.dmg", label: "Download for Mac", sub: "Free · 75 MB · macOS 11 or newer" },
    win: { href: "https://github.com/lallefjant-boop/the-lost-ticket/releases/download/v1.5.3/TheLostTicket-windows.exe", label: "Download for Windows", sub: "Free · 115 MB · Windows 10/11 64-bit" }
  };

  var root = document.documentElement;
  var REDUCE = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $(id) { return document.getElementById(id); }
  function all(sel, el) { return Array.prototype.slice.call((el || document).querySelectorAll(sel)); }
  function rnd(a, b) { return a + Math.random() * (b - a); }

  // ------------------------------------------------------------ downloads
  function detectOS() {
    var uaData = navigator.userAgentData;
    var platform = (uaData && uaData.platform) || navigator.platform || "";
    var ua = navigator.userAgent || "";
    var touchMac = /Mac/i.test(platform) && navigator.maxTouchPoints > 1; // iPadOS reports "MacIntel"
    if (/Android|iPhone|iPad|iPod/i.test(ua) || touchMac || (uaData && uaData.mobile)) return "mobile";
    if (/Win/i.test(platform) || /Windows/i.test(ua)) return "win";
    if (/Mac/i.test(platform) || /Mac OS X/i.test(ua)) return "mac";
    return "other";
  }

  function selectTab(os) {
    var mac = os !== "win";
    $("tab-mac").setAttribute("aria-selected", mac ? "true" : "false");
    $("tab-win").setAttribute("aria-selected", mac ? "false" : "true");
    $("steps-mac").hidden = !mac;
    $("steps-win").hidden = mac;
  }

  function started(os) {
    selectTab(os);
    var s = $("started");
    s.hidden = false;
    window.setTimeout(function () { s.scrollIntoView({ block: "start", behavior: REDUCE ? "auto" : "smooth" }); }, 150);
  }

  var os = detectOS();
  var main = $("dl-main");
  $("dl-mac").href = $("pf-mac").href = DOWNLOADS.mac.href;
  $("dl-win").href = $("pf-win").href = DOWNLOADS.win.href;

  // version text comes from the release link, so publishing keeps it right
  var vm = /\/download\/v([^/]+)\//.exec(DOWNLOADS.mac.href);
  if (vm) all(".js-version").forEach(function (el) { el.textContent = vm[1]; });

  if (os === "mac" || os === "win") {
    var d = DOWNLOADS[os];
    main.href = d.href;
    $("dl-main-label").textContent = d.label;
    $("dl-main-sub").textContent = d.sub;
    selectTab(os);
    $(os === "mac" ? "pf-mac" : "pf-win").classList.add("mine");
  } else if (os === "mobile") {
    main.hidden = true;
    $("mobile-note").hidden = false;
  } else {
    // Linux or unknown: offer both explicitly.
    main.href = DOWNLOADS.win.href;
    $("dl-main-label").textContent = "Download for Windows";
    $("dl-main-sub").textContent = "Mac link below · no Linux build yet";
  }

  main.addEventListener("click", function () { started(os === "win" ? "win" : "mac"); });
  $("dl-mac").addEventListener("click", function () { started("mac"); });
  $("dl-win").addEventListener("click", function () { started("win"); });
  $("pf-mac").addEventListener("click", function () { started("mac"); });
  $("pf-win").addEventListener("click", function () { started("win"); });
  $("tab-mac").addEventListener("click", function () { selectTab("mac"); });
  $("tab-win").addEventListener("click", function () { selectTab("win"); });

  // ------------------------------------------------------------ intro
  function go() {
    if (root.classList.contains("go")) return;
    root.classList.add("go");
    if (!REDUCE) window.setTimeout(burst, 520);
  }

  function runIntro() {
    var intro = $("intro");
    var text = "presents...";
    var out = $("intro-text");
    var timers = [];
    var done = false;
    function finish() {
      if (done) return;
      done = true;
      timers.forEach(window.clearTimeout);
      try { window.sessionStorage.setItem("lt-intro", "1"); } catch (e) { /* private mode */ }
      intro.classList.add("flash");
      window.setTimeout(function () {
        root.classList.remove("intro");
        go();
      }, 140);
      window.setTimeout(function () { intro.classList.add("gone"); }, 900);
    }
    for (var i = 0; i < text.length; i++) {
      (function (n) {
        timers.push(window.setTimeout(function () { out.textContent = text.slice(0, n + 1); }, 650 + n * 85));
      })(i);
    }
    timers.push(window.setTimeout(finish, 2300));
    ["click", "keydown", "wheel", "touchstart"].forEach(function (ev) {
      window.addEventListener(ev, function skip() { finish(); window.removeEventListener(ev, skip); }, { passive: true });
    });
  }

  if (root.classList.contains("intro")) runIntro(); else go();

  // confetti out of the logo when it lands
  function burst() {
    var hero = $("hero");
    var logo = document.querySelector(".logo");
    if (!logo) return;
    var r = logo.getBoundingClientRect();
    var hr = hero.getBoundingClientRect();
    var cx = r.left + r.width / 2 - hr.left;
    var cy = r.top + r.height / 2 - hr.top;
    var colors = ["c-gold", "c-coral", "c-sky", "c-green", "c-purple", "c-cream"];
    for (var i = 0; i < 46; i++) {
      var p = document.createElement("i");
      p.className = "confetti " + colors[i % colors.length];
      var a = rnd(0, Math.PI * 2);
      var dist = rnd(120, 420);
      p.style.left = cx + "px";
      p.style.top = cy + "px";
      p.style.setProperty("--dx", Math.cos(a) * dist + "px");
      p.style.setProperty("--dy", Math.sin(a) * dist * 0.7 + rnd(40, 160) + "px");
      p.style.setProperty("--rot", rnd(-540, 540) + "deg");
      p.style.animationDelay = rnd(0, 0.12) + "s";
      hero.appendChild(p);
      window.setTimeout(function (el) { return function () { el.remove(); }; }(p), 2200);
    }
  }

  // ------------------------------------------------------------ stars
  (function stars() {
    var sky = $("stars");
    var n = window.innerWidth < 700 ? 34 : 70;
    for (var i = 0; i < n; i++) {
      var s = document.createElement("i");
      s.className = "star" + (Math.random() < 0.18 ? " big" : "");
      s.style.left = rnd(0, 100) + "%";
      s.style.top = rnd(0, 58) + "%";
      s.style.animationDelay = rnd(0, 4) + "s";
      s.style.animationDuration = rnd(2.2, 5) + "s";
      sky.appendChild(s);
    }
  })();

  // ------------------------------------------------------------ header
  var top = $("top");
  function onScroll() { top.classList.toggle("solid", window.scrollY > 40); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ------------------------------------------------------------ scroll reveal + counters
  function countUp(el) {
    var to = parseInt(el.getAttribute("data-to"), 10) || 0;
    if (REDUCE || to < 2) { el.textContent = to.toLocaleString("en-US"); return; }
    var t0 = null;
    function step(t) {
      if (t0 === null) t0 = t;
      var k = Math.min(1, (t - t0) / 1400);
      var e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(to * e).toLocaleString("en-US");
      if (k < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }

  if ("IntersectionObserver" in window && !REDUCE) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("in");
        all(".count", en.target).forEach(countUp);
        io.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    all(".reveal").forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 70 + "ms";
      io.observe(el);
    });
  } else {
    all(".reveal").forEach(function (el) { el.classList.add("in"); });
  }

  // ------------------------------------------------------------ hover tilt
  if (!REDUCE && window.matchMedia("(hover: hover)").matches) {
    all(".tilt").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = "perspective(700px) rotateX(" + (-y * 9) + "deg) rotateY(" + (x * 11) + "deg) translateY(-4px)";
      });
      card.addEventListener("mouseleave", function () { card.style.transform = ""; });
    });
  }

  // ------------------------------------------------------------ badges filter
  all(".tt").forEach(function (b) {
    b.addEventListener("click", function () {
      var tier = b.getAttribute("data-tier");
      all(".tt").forEach(function (x) { x.classList.toggle("on", x === b); });
      all("#badges .badge").forEach(function (li) {
        li.hidden = tier !== "all" && li.getAttribute("data-tier") !== tier;
      });
    });
  });
  all("#badges .badge").forEach(function (li) {
    li.addEventListener("click", function () {
      var was = li.classList.contains("open");
      all("#badges .badge.open").forEach(function (x) { x.classList.remove("open"); });
      if (!was) li.classList.add("open");
    });
  });

  // ------------------------------------------------------------ lightbox
  var shots = all(".shot");
  var lb = $("lightbox");
  var lbImg = $("lb-img");
  var cur = 0;
  function show(i) {
    cur = (i + shots.length) % shots.length;
    var img = shots[cur].querySelector("img");
    lbImg.src = shots[cur].getAttribute("data-full");
    lbImg.alt = img.alt;
  }
  function closeLb() { lb.hidden = true; document.body.classList.remove("noscroll"); shots[cur].focus(); }
  shots.forEach(function (s, i) {
    s.addEventListener("click", function () { show(i); lb.hidden = false; document.body.classList.add("noscroll"); lb.querySelector(".lb-close").focus(); });
  });
  lb.querySelector(".lb-close").addEventListener("click", closeLb);
  lb.querySelector(".lb-prev").addEventListener("click", function (e) { e.stopPropagation(); show(cur - 1); });
  lb.querySelector(".lb-next").addEventListener("click", function (e) { e.stopPropagation(); show(cur + 1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
  window.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLb();
    else if (e.key === "ArrowLeft") show(cur - 1);
    else if (e.key === "ArrowRight") show(cur + 1);
  });

  // ------------------------------------------------------------ scratch card
  (function scratchCard() {
    var cv = $("scratch-canvas");
    if (!cv || !cv.getContext) return;
    var ctx = cv.getContext("2d");
    var S = 5;                       // canvas pixels per art pixel
    var PX = 3, PY = 14, PW = 90, PH = 38;   // the play panel of the Meridian ticket, in art pixels
    var base = document.createElement("canvas");
    var coat = document.createElement("canvas");
    base.width = coat.width = cv.width;
    base.height = coat.height = cv.height;
    var bctx = base.getContext("2d");
    var cctx = coat.getContext("2d");
    var cleared = [];
    var nClear = 0;
    var won = false;
    var last = null;
    var status = $("scratch-status");
    var win = $("scratch-win");
    var card = $("scratch-card");
    var ticket = new Image();
    var tile = new Image();
    var loaded = 0;
    ticket.onload = tile.onload = function () { if (++loaded === 2) init(); };
    ticket.src = "img/art/ticket_meridian.png";
    tile.src = "img/art/coat_silver.png";

    // a chunky pixel star, 11x11 art pixels
    var STAR = [".....o.....", "....oho....", "....oyo....", "...oyyyo...", "ooooyyyoooo", "ohhyyyyyyyo",
                ".ohyyyyyyo.", "..oyyyyyo..", "..oyyoyyo..", ".oyyo.oyyo.", ".ooo...ooo."];
    var COLORS = { o: "#1a1626", h: "#fbe38c", y: "#f2c14e" };
    function drawStar(c, ax, ay) {
      for (var y = 0; y < STAR.length; y++) for (var x = 0; x < STAR[y].length; x++) {
        var ch = STAR[y][x];
        if (ch === ".") continue;
        c.fillStyle = COLORS[ch];
        c.fillRect((ax + x) * S, (ay + y) * S, S, S);
      }
    }

    // the ticket with its prize: three stars and the jackpot
    function drawBase() {
      bctx.imageSmoothingEnabled = false;
      bctx.clearRect(0, 0, base.width, base.height);
      bctx.drawImage(ticket, 0, 0, cv.width, cv.height);
      for (var i = 0; i < 3; i++) drawStar(bctx, PX + 12 + i * 28, PY + 5);
      bctx.fillStyle = "#f2c14e";
      bctx.textAlign = "center";
      bctx.font = "bold 34px Pixelify, monospace";
      bctx.fillText("$1,000,000", cv.width / 2, (PY + 33) * S);
    }

    function init() {
      drawBase();
      reset();
      if (document.fonts && document.fonts.load) {
        document.fonts.load("bold 34px Pixelify").then(function () { drawBase(); reset(); });
      }
    }

    function reset() {
      won = false;
      nClear = 0;
      cleared = new Array(PW * PH);
      win.hidden = true;
      card.classList.remove("won");
      cctx.clearRect(0, 0, coat.width, coat.height);
      var t = document.createElement("canvas");
      t.width = t.height = 16 * S;
      var tctx = t.getContext("2d");
      tctx.imageSmoothingEnabled = false;
      tctx.drawImage(tile, 0, 0, t.width, t.height);
      cctx.fillStyle = cctx.createPattern(t, "repeat");
      cctx.fillRect(PX * S, PY * S, PW * S, PH * S);
      cctx.fillStyle = "rgba(26, 22, 38, 0.55)";
      cctx.textAlign = "center";
      cctx.font = "bold 30px Pixelify, monospace";
      cctx.fillText("SCRATCH HERE", cv.width / 2, (PY + PH / 2 + 2) * S);
      status.textContent = "0% scratched";
      paint();
    }

    function paint() {
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.drawImage(base, 0, 0);
      ctx.drawImage(coat, 0, 0);
    }

    function scratchAt(ax, ay) {
      var R = 2.8;
      for (var y = Math.floor(ay - R); y <= Math.ceil(ay + R); y++) {
        for (var x = Math.floor(ax - R); x <= Math.ceil(ax + R); x++) {
          if (x < PX || y < PY || x >= PX + PW || y >= PY + PH) continue;
          var dx = x + 0.5 - ax, dy = y + 0.5 - ay;
          if (dx * dx + dy * dy > R * R) continue;
          var k = (y - PY) * PW + (x - PX);
          if (cleared[k]) continue;
          cleared[k] = true;
          nClear++;
          cctx.clearRect(x * S, y * S, S, S);
        }
      }
    }

    function artPos(e) {
      var r = cv.getBoundingClientRect();
      return { x: (e.clientX - r.left) / r.width * (cv.width / S), y: (e.clientY - r.top) / r.height * (cv.height / S) };
    }

    function move(e) {
      if (won || loaded < 2) return;
      if (e.pointerType !== "mouse" && !(e.buttons & 1)) return;
      var p = artPos(e);
      if (last) {
        var d = Math.hypot(p.x - last.x, p.y - last.y);
        var steps = Math.max(1, Math.ceil(d));
        for (var i = 1; i <= steps; i++) scratchAt(last.x + (p.x - last.x) * i / steps, last.y + (p.y - last.y) * i / steps);
      } else {
        scratchAt(p.x, p.y);
      }
      last = p;
      paint();
      var pct = Math.round(nClear / (PW * PH) * 100);
      status.textContent = pct + "% scratched";
      if (pct >= 65) reveal();
    }

    function reveal() {
      won = true;
      status.textContent = "100% scratched. JACKPOT!";
      cctx.clearRect(0, 0, coat.width, coat.height);
      paint();
      card.classList.add("won");
      win.hidden = false;
      if (!REDUCE) {
        for (var i = 0; i < 30; i++) {
          var p = document.createElement("i");
          var colors = ["c-gold", "c-coral", "c-sky", "c-green", "c-purple"];
          p.className = "confetti " + colors[i % colors.length];
          var a = rnd(0, Math.PI * 2), dist = rnd(80, 260);
          p.style.left = "50%";
          p.style.top = "30%";
          p.style.setProperty("--dx", Math.cos(a) * dist + "px");
          p.style.setProperty("--dy", Math.sin(a) * dist * 0.7 + rnd(30, 120) + "px");
          p.style.setProperty("--rot", rnd(-540, 540) + "deg");
          card.appendChild(p);
          window.setTimeout(function (el) { return function () { el.remove(); }; }(p), 2200);
        }
      }
    }

    cv.addEventListener("pointermove", move);
    cv.addEventListener("pointerdown", function (e) { last = null; move(e); });
    cv.addEventListener("pointerleave", function () { last = null; });
    cv.addEventListener("pointerup", function () { last = null; });
    $("scratch-reset").addEventListener("click", function () { if (loaded === 2) reset(); });
  })();
})();
