/* src/ui_hud/50_ending.js */
/* =====================================================================
 * NEW RAD CITY — UI_HUD : ENDING SLIDESHOW ('ending' event)
 * slides: [{title, text, scene?, glyph?}] from G.quests.playEnding().
 * Each slide: a sepia "photograph" (procedural SVG silhouette scene chosen
 * from the slide title — skyline, Liberty, cryo unit, The Neon, cathedral,
 * Empire State, bridge, radio mast, park), slow push-in, film grain, the
 * narration typed out underneath (text only).
 * Final card: an original closing line → Continue Exploring / Main Menu.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const H = G.hud._;

  const E = { on: false, slides: [], i: 0, el: null, typing: null, wait: 0 };
  H.END = E;

  // ------------------------------------------------------------------
  // Procedural sepia scenes (SVG, 1600 x 900)
  // ------------------------------------------------------------------
  function skylineLayer(seed, baseY, minH, maxH, fill, opacity, windows) {
    const r = G.util.rng(seed);
    let s = '<g fill="' + fill + '" opacity="' + opacity + '">';
    let x = -20;
    let win = "";
    while (x < 1640) {
      const w = 30 + r() * 70,
        h = minH + r() * (maxH - minH);
      const y = baseY - h;
      s +=
        '<rect x="' +
        x.toFixed(0) +
        '" y="' +
        y.toFixed(0) +
        '" width="' +
        w.toFixed(0) +
        '" height="' +
        (h + 400).toFixed(0) +
        '"/>';
      if (r() < 0.35) {
        const sw = w * 0.6;
        s +=
          '<rect x="' +
          (x + (w - sw) / 2).toFixed(0) +
          '" y="' +
          (y - h * 0.18).toFixed(0) +
          '" width="' +
          sw.toFixed(0) +
          '" height="' +
          (h * 0.2).toFixed(0) +
          '"/>';
      }
      if (r() < 0.12)
        s +=
          '<rect x="' +
          (x + w / 2 - 1.5).toFixed(0) +
          '" y="' +
          (y - h * 0.45).toFixed(0) +
          '" width="3" height="' +
          (h * 0.3).toFixed(0) +
          '"/>';
      if (r() < 0.25)
        s +=
          '<path d="M' +
          (x + w * 0.2).toFixed(0) +
          " " +
          y.toFixed(0) +
          " l" +
          (w * 0.15).toFixed(0) +
          " -14 l" +
          (w * 0.2).toFixed(0) +
          " 10 l" +
          (w * 0.2).toFixed(0) +
          " -8 l" +
          (w * 0.2).toFixed(0) +
          ' 12 z"/>'; // broken top
      if (windows)
        for (let wy = y + 10; wy < baseY - 6; wy += 14)
          for (let wx = x + 6; wx < x + w - 8; wx += 11)
            if (r() < 0.12)
              win +=
                '<rect x="' +
                wx.toFixed(0) +
                '" y="' +
                wy.toFixed(0) +
                '" width="4" height="6"/>';
      x += w + r() * 8;
    }
    s += "</g>";
    if (win) s += '<g fill="#e8c98a" opacity="0.18">' + win + "</g>";
    return s;
  }
  const EMPIRE = (x, base, sc, fill) =>
    '<g transform="translate(' +
    x +
    " " +
    base +
    ") scale(" +
    sc +
    ')" fill="' +
    fill +
    '"><rect x="-60" y="-300" width="120" height="300"/><rect x="-46" y="-380" width="92" height="90"/><rect x="-34" y="-440" width="68" height="70"/><rect x="-24" y="-480" width="48" height="50"/><rect x="-14" y="-520" width="28" height="50"/><rect x="-8" y="-560" width="16" height="50"/><rect x="-3" y="-640" width="6" height="90"/></g>';
  const CHRYSLER = (x, base, sc, fill) =>
    '<g transform="translate(' +
    x +
    " " +
    base +
    ") scale(" +
    sc +
    ')" fill="' +
    fill +
    '"><rect x="-40" y="-300" width="80" height="300"/><rect x="-30" y="-340" width="60" height="50"/>' +
    '<path d="M-30 -338 Q-30 -372 0 -382 Q30 -372 30 -338 Z"/><path d="M-23 -370 Q-23 -400 0 -410 Q23 -400 23 -370 Z"/><path d="M-16 -400 Q-16 -426 0 -434 Q16 -426 16 -400 Z"/><path d="M-9 -428 Q-9 -448 0 -455 Q9 -448 9 -428 Z"/><rect x="-1.5" y="-540" width="3" height="95"/>' +
    '<g fill="#e8c98a" opacity=".35"><path d="M-20 -350 l5 -12 l5 12 z M-5 -354 l5 -14 l5 14 z M10 -350 l5 -12 l5 12 z M-12 -384 l4 -10 l4 10 z M4 -384 l4 -10 l4 10 z M-4 -414 l4 -10 l4 10 z"/></g></g>';
  const WATER = (y, fill) =>
    '<rect x="0" y="' +
    y +
    '" width="1600" height="' +
    (900 - y) +
    '" fill="' +
    fill +
    '" opacity=".55"/>' +
    Array.from(
      { length: 14 },
      (_, i) =>
        '<rect x="' +
        ((i * 137) % 1500) +
        '" y="' +
        (y + 10 + i * 13) +
        '" width="' +
        (60 + ((i * 53) % 140)) +
        '" height="2" fill="#f1dcae" opacity=".25"/>',
    ).join("");
  const SCENES = {
    skyline: () =>
      skylineLayer(3, 700, 60, 220, "#8a6e48", 0.55, false) +
      skylineLayer(7, 760, 90, 330, "#4a3620", 0.85, true) +
      EMPIRE(640, 760, 1, "#2a1c0e") +
      CHRYSLER(980, 760, 0.85, "#2a1c0e") +
      WATER(760, "#3c2a16"),
    liberty: () =>
      skylineLayer(11, 640, 40, 150, "#8a6e48", 0.45, false) +
      WATER(640, "#4a3620") +
      '<g fill="#2a1c0e"><path d="M520 900 L560 760 L1040 760 L1080 900 Z"/><path d="M700 760 L720 600 L880 600 L900 760 Z"/><rect x="690" y="585" width="220" height="20"/>' +
      '<path d="M760 585 L770 420 Q765 380 790 360 L800 330 Q800 300 815 290 Q830 300 832 330 L840 360 Q862 380 858 420 L866 585 Z"/>' +
      '<path d="M840 370 L870 250 L880 200 L890 205 L884 256 L856 380 Z"/><path d="M872 205 Q870 180 885 170 Q900 180 897 205 Z"/>' +
      '<path d="M795 300 L785 285 M805 292 L800 272 M815 288 L815 268 M825 292 L830 272 M835 300 L845 285" stroke="#2a1c0e" stroke-width="5"/>' +
      '<path d="M770 450 L740 470 L748 480 L772 468 Z"/></g>',
    cryo: () =>
      '<rect x="0" y="0" width="1600" height="900" fill="#4a3620" opacity=".55"/>' +
      '<path d="M0 900 L300 560 H1300 L1600 900 Z" fill="#2a1c0e" opacity=".55"/>' +
      [
        [260, 1],
        [560, 1.15],
        [1040, 1.15],
        [1340, 1],
      ]
        .map(
          (p) =>
            '<g transform="translate(' +
            p[0] +
            " 640) scale(" +
            p[1] +
            ')" fill="#2a1c0e"><rect x="-70" y="-330" width="140" height="330" rx="60"/>' +
            '<rect x="-48" y="-290" width="96" height="190" rx="40" fill="#8a6e48" opacity=".45"/><rect x="-80" y="-10" width="160" height="22"/><rect x="-10" y="-370" width="20" height="44"/></g>',
        )
        .join("") +
      '<g transform="translate(800 470)" fill="none" stroke="#f1dcae" stroke-opacity=".5" stroke-width="5"><path d="M0 -70 V70 M-61 -35 L61 35 M-61 35 L61 -35"/><circle r="22"/></g>' +
      '<rect x="0" y="840" width="1600" height="60" fill="#1c1208"/>',
    neon: () =>
      skylineLayer(21, 820, 300, 700, "#3a2814", 0.9, true) +
      [
        [180, 260, "FIZZO COLA"],
        [1180, 220, "HI-OCTANE"],
        [520, 420, "THE NEON"],
        [900, 330, "FOREVER FRANKS"],
      ]
        .map(
          (b) =>
            '<g transform="translate(' +
            b[0] +
            " " +
            b[1] +
            ')"><rect x="-10" y="-10" width="' +
            (b[2].length * 34 + 40) +
            '" height="90" fill="#1c1208" stroke="#e8c98a" stroke-opacity=".35" stroke-width="4"/><text x="10" y="55" font-family="Oswald" font-weight="700" font-size="54" fill="#f1dcae" opacity=".55">' +
            b[2] +
            "</text></g>",
        )
        .join("") +
      '<rect x="0" y="820" width="1600" height="80" fill="#1c1208"/>',
    cathedral: () =>
      skylineLayer(31, 760, 100, 300, "#6a5234", 0.6, false) +
      '<g fill="#2a1c0e"><rect x="560" y="420" width="480" height="480"/><path d="M560 420 L620 160 L680 420 Z M920 420 L980 160 L1040 420 Z"/><rect x="600" y="330" width="40" height="90"/><rect x="960" y="330" width="40" height="90"/>' +
      '<path d="M700 900 L700 560 Q800 460 900 560 L900 900 Z" fill="#5a4428" opacity=".6"/><circle cx="800" cy="480" r="46" fill="#5a4428" opacity=".6"/></g>' +
      '<g transform="translate(800 480)" stroke="#f1dcae" stroke-opacity=".5" fill="none" stroke-width="4"><circle r="20"/>' +
      Array.from(
        { length: 12 },
        (_, i) => '<path d="M0 -28 V-44" transform="rotate(' + i * 30 + ')"/>',
      ).join("") +
      "</g>",
    empire: () =>
      skylineLayer(41, 820, 80, 250, "#5a4428", 0.7, true) +
      EMPIRE(800, 900, 1.45, "#2a1c0e") +
      '<path d="M790 -30 L790 60 L850 70 L790 80" stroke="#2a1c0e" stroke-width="6" fill="#2a1c0e"/>',
    bridge: () =>
      skylineLayer(51, 640, 60, 240, "#8a6e48", 0.5, false) +
      WATER(640, "#3c2a16") +
      '<g fill="#2a1c0e"><path d="M300 900 L300 330 L420 330 L420 900 Z M330 560 Q360 480 390 560 L390 700 L330 700 Z" fill-rule="evenodd"/><path d="M1180 900 L1180 330 L1300 330 L1300 900 Z"/>' +
      '<rect x="0" y="600" width="1600" height="30"/></g><g stroke="#2a1c0e" stroke-width="4" fill="none"><path d="M-40 560 Q160 610 300 340"/><path d="M420 340 Q800 640 1180 340"/><path d="M1300 340 Q1450 600 1650 560"/>' +
      Array.from({ length: 30 }, (_, i) => {
        const x = 440 + i * 25;
        const y = 340 + Math.sin(((x - 420) / 760) * Math.PI) * 260;
        return '<path d="M' + x + " " + y.toFixed(0) + " L" + x + ' 600"/>';
      }).join("") +
      "</g>",
    radio: () =>
      skylineLayer(61, 780, 80, 260, "#6a5234", 0.6, true) +
      '<g fill="#2a1c0e"><rect x="560" y="520" width="480" height="380"/><rect x="620" y="460" width="360" height="70"/><path d="M790 460 L800 120 L810 460 Z"/><rect x="760" y="240" width="80" height="6"/><rect x="770" y="320" width="60" height="6"/></g>' +
      '<g fill="none" stroke="#f1dcae" stroke-opacity=".45" stroke-width="5">' +
      [60, 110, 160]
        .map(
          (r) =>
            '<path d="M' +
            (800 - r) +
            " " +
            120 +
            " A" +
            r +
            " " +
            r +
            " 0 0 1 " +
            (800 + r) +
            ' 120"/>',
        )
        .join("") +
      "</g>" +
      '<text x="800" y="620" text-anchor="middle" font-family="Oswald" font-size="64" font-weight="700" fill="#f1dcae" opacity=".4">RADIO FREE MANHATTAN</text>',
    park: () =>
      skylineLayer(71, 560, 100, 260, "#8a6e48", 0.45, false) +
      '<rect x="0" y="720" width="1600" height="180" fill="#3a2814"/>' +
      [
        [260, 1.2],
        [520, 0.9],
        [1150, 1.3],
        [1380, 0.8],
      ]
        .map(
          (t) =>
            '<g transform="translate(' +
            t[0] +
            " 730) scale(" +
            t[1] +
            ')" stroke="#2a1c0e" stroke-width="12" fill="none" stroke-linecap="round"><path d="M0 0 L0 -220 M0 -120 L-60 -200 M0 -160 L50 -240 M-30 -170 L-50 -230 M20 -200 L70 -210"/></g>',
        )
        .join("") +
      '<g fill="#2a1c0e" transform="translate(800 720)"><path d="M-70 0 L-60 -40 Q-40 -60 20 -58 L40 -80 L60 -84 L70 -70 L60 -60 L50 -30 L50 0 L40 0 L36 -26 L-40 -26 L-50 0 Z"/></g>',
  };
  function sceneFor(slide) {
    if (slide.scene && SCENES[slide.scene]) return slide.scene;
    const t = ((slide.title || "") + " " + (slide.scene || "")).toUpperCase();
    if (/LIBERTY|TORCH|CONTINUITY|MARSH|HARBOR|HARBOUR/.test(t))
      return "liberty";
    if (/CRYO|LONG WINTER|DIRECTOR|SLEEPER|MUNICIPAL/.test(t)) return "cryo";
    if (/NEON|TIMES/.test(t)) return "neon";
    if (/GLOWKEEP|CATHEDRAL|PATRICK/.test(t)) return "cathedral";
    if (/EMPIRE|BRUTE|COLOSSUS/.test(t)) return "empire";
    if (/BRIDGE|BROOKLYN|TOLL/.test(t)) return "bridge";
    if (/RADIO|DELGADO|ROCKY|BROADCAST/.test(t)) return "radio";
    if (/BOROUGH|BISCUIT|DOG|PARK/.test(t)) return "park";
    return "skyline";
  }

  // ------------------------------------------------------------------
  function build() {
    const el = H.el("div", "end-screen", H.uiRoot);
    el.innerHTML =
      '<div class="end-photo"><div class="end-scene"></div><div class="end-grain"></div><div class="end-vig"></div></div>' +
      '<div class="end-text"><div class="end-title"></div><div class="end-body"></div></div>' +
      '<div class="end-final"><div class="end-war">The city keeps its scars.<br>And so do you.</div><div class="end-menu"></div></div>' +
      '<div class="end-hint">SPACE CONTINUE &middot; ESC SKIP</div>';
    el.style.display = "none";
    E.el = el;
    E.scene = el.querySelector(".end-scene");
    E.title = el.querySelector(".end-title");
    E.body = el.querySelector(".end-body");
    E.final = el.querySelector(".end-final");
    E.host = H.menuHost(el.querySelector(".end-menu"));
    el.addEventListener("click", () => {
      if (E.on && !E.done) next();
    });
  }
  function start(slides) {
    if (!E.el) return;
    E.slides = (slides || []).filter(Boolean);
    if (!E.slides.length) E.slides = [{ title: "THE END", text: "" }];
    E.on = true;
    E.done = false;
    E.i = -1;
    E.bounces = 0;
    E.prevTimeScale = G.timeScale;
    G.timeScale = 0;
    H.hudForcedHidden = true;
    if (G.state !== "cutscene") G.setState("cutscene");
    E.el.style.display = "";
    E.el.classList.remove("final");
    try {
      if (G.music && G.music.play) G.music.play("ending");
    } catch (e) {
      /* ignore */
    }
    next();
  }
  function next() {
    if (E.typing && E.typing.i < E.typing.text.length) {
      E.typing.i = E.typing.text.length;
      return;
    } // first press completes the text
    E.i++;
    if (E.i >= E.slides.length) {
      finale();
      return;
    }
    const s = E.slides[E.i];
    const sc = sceneFor(s);
    E.scene.classList.remove("kb");
    void E.scene.offsetWidth;
    E.scene.innerHTML =
      '<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice"><defs><radialGradient id="endsun" cx="0.5" cy="0.35" r="0.7"><stop offset="0" stop-color="#f6e6bf"/><stop offset="0.45" stop-color="#cfb27c"/><stop offset="1" stop-color="#6e5433"/></radialGradient></defs><rect width="1600" height="900" fill="url(#endsun)"/><circle cx="' +
      (500 + ((E.i * 311) % 700)) +
      '" cy="250" r="90" fill="#fff3d0" opacity=".45"/>' +
      SCENES[sc]() +
      "</svg>";
    E.scene.classList.add("kb");
    E.el.classList.remove("show");
    void E.el.offsetWidth;
    E.el.classList.add("show");
    E.title.textContent = s.title || "";
    E.typing = { text: String(s.text || ""), i: 0 };
    E.body.textContent = "";
    E.wait = 0;
  }
  function finale() {
    E.done = true;
    E.el.classList.add("final");
    E.host.clear();
    E.host.push({
      cls: "end-choices",
      items: [
        { label: "Continue Exploring", action: finish },
        {
          label: "Main Menu",
          action: () => {
            finish(true);
          },
        },
      ],
      onBack: () => true,
    });
  }
  /** Single place that undoes everything start() changed (time scale, HUD, overlay). */
  function cleanup() {
    const was = E.on;
    E.on = false;
    E.done = false;
    E.typing = null;
    if (E.el) E.el.style.display = "none";
    if (E.host) E.host.clear();
    if (was) G.timeScale = E.prevTimeScale || 1;
    if (G.timeScale === 0) G.timeScale = 1;
    H.hudForcedHidden = false;
  }
  E.cleanup = cleanup;
  function finish(toTitle) {
    cleanup();
    if (toTitle && H.quitToTitle) H.quitToTitle();
    else G.setState("play");
  }
  /** State guard: the slideshow owns the 'cutscene' state while it runs. */
  function onState(s) {
    if (!E.on) return;
    if (s === "cutscene" || s === "cheats") return; // ours / dev menu overlay (returns to 'play')
    if (s === "play") {
      // Something bounced us to play mid-slideshow.  Never re-enter the state
      // machine from inside its own 'state' event (listener re-entrancy /
      // ping-pong): defer the correction, and give up after a few bounces —
      // the overlay keeps covering the screen and G.timeScale stays 0 anyway.
      E.bounces = (E.bounces || 0) + 1;
      if (E.bounces <= 3 && !E.fixPending) {
        E.fixPending = true;
        setTimeout(() => {
          E.fixPending = false;
          if (E.on && G.state === "play") G.setState("cutscene");
        }, 0);
      }
      G.timeScale = 0;
      return;
    }
    cleanup(); // title / dead / loading / anything else: bail out cleanly
  }

  function onKey(code) {
    if (!E.on) return;
    if (E.done) {
      if (E.host.onKey(code)) G.input.consume(code);
      return;
    }
    if (
      code === "Space" ||
      code === "Enter" ||
      code === "KeyE" ||
      code === "ArrowRight" ||
      code === "KeyD"
    )
      next();
    else if (code === "Escape") {
      E.typing = null;
      E.i = E.slides.length;
      finale();
    }
    G.input.consume(code);
  }

  H.part({
    name: "ending",
    order: 70,
    init() {
      build();
      G.events.on("ending", (slides) => start(slides));
      G.events.on("keydown", onKey);
      G.events.on("reset", () => {
        if (E.on) cleanup();
      });
      G.events.on("state", onState);
    },
    update(dt, realDt) {
      if (!E.on || E.done) return;
      const t = E.typing;
      if (t && t.i < t.text.length) {
        t.i = Math.min(
          t.text.length,
          t.i + Math.max(1, Math.round(realDt * 38)),
        );
        E.body.textContent = t.text.slice(0, t.i);
      } else if (t) {
        E.body.textContent = t.text;
        E.wait += realDt;
        if (E.wait > 5 + t.text.length / 60 && !G.SHOT) next();
      }
    },
  });
  G.hud.playEnding = (slides) => start(slides);
})();
