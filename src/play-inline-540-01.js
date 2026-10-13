// play-inline-540 01 — mouse
// Lines 21-343 of readable/play-inline-540.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const AR = G.arcade._;
  const W = 640,
    H = 480;

  const TABS = [
    { id: "minis", label: "SOUVENIRS" },
    { id: "keys", label: "KEYS TO THE CITY" },
    { id: "arcade", label: "ARCADE" },
  ];
  const FONTS = {
    s: '17px VT323, "Share Tech Mono", monospace',
    m: '22px VT323, "Share Tech Mono", monospace',
    l: '34px VT323, "Share Tech Mono", monospace',
    xl: '58px VT323, "Share Tech Mono", monospace',
  };
  const CONFIRM = { Enter: 1, NumpadEnter: 1, Space: 1 };
  const BACK = { Escape: 1, Backspace: 1 };

  const UI = {
    built: false,
    visible: false,
    mode: "ledger",
    tab: "minis",
    sel: { minis: 0, keys: 0, arcade: 0 },
    returnTo: "play",
    session: null,
    cabinet: null,
    t: 0,
  };
  AR.ui = UI;

  let cabRoot, cabEl, marqCanvas, monitor, canvas, cx, legendEl, creditEl;
  let ledRoot, tabsEl, metaEl, body, foot;
  let scene, sctx, bloom, bctx; // offscreen scene + quarter-res bloom buffer
  let miniCanvas = null,
    bmapCanvas = null,
    artCanvas = null;
  let canvasRect = null;

  // ------------------------------------------------------------------
  // Mouse (canvas space) — shared object, updated in place each frame
  // ------------------------------------------------------------------
  const MOUSE = {
    x: W / 2,
    y: H / 2,
    inside: false,
    down: false,
    pressed: false,
    moved: false,
    _lx: -1,
    _ly: -1,
  };
  const NOMOUSE = {
    x: W / 2,
    y: H / 2,
    inside: false,
    down: false,
    pressed: false,
    moved: false,
  };
  function updateMouse() {
    const m = G.input.mouse;
    MOUSE.pressed = false;
    MOUSE.moved = false;
    if (!canvasRect || !canvasRect.width) {
      MOUSE.inside = false;
      return;
    }
    const x = ((m.x - canvasRect.left) / canvasRect.width) * W,
      y = ((m.y - canvasRect.top) / canvasRect.height) * H;
    MOUSE.inside = x >= 0 && y >= 0 && x <= W && y <= H;
    if (m.x !== MOUSE._lx || m.y !== MOUSE._ly) {
      MOUSE.moved = MOUSE._lx >= 0 && MOUSE.inside;
      MOUSE._lx = m.x;
      MOUSE._ly = m.y;
    }
    MOUSE.x = x;
    MOUSE.y = y;
    MOUSE.down = MOUSE.inside && G.input.down("Mouse0");
    MOUSE.pressed = MOUSE.inside && G.input.justPressed("Mouse0");
  }
  const held = (code) => G.input.down(code);
  const noHeld = () => false;
  const SILENT = {
    beep() {},
    noise() {},
    seq() {},
    N: (s) => 440 * Math.pow(2, s / 12),
    uiMove() {},
    uiSelect() {},
    uiBack() {},
    coin() {},
    powerOn() {},
    start() {},
    gameOver() {},
    highScore() {},
    houseRecord() {},
    victory() {},
  };

  function makeApi(gameId, demo) {
    return {
      W,
      H,
      demo: !!demo,
      pal: AR.palette(gameId),
      audio: demo ? SILENT : AR.audio,
      held: demo ? noHeld : held,
      mouse: demo ? NOMOUSE : MOUSE,
      fonts: FONTS,
      rnd: Math.random,
    };
  }

  // ------------------------------------------------------------------
  // DOM
  // ------------------------------------------------------------------
  function esc(s) {
    return String(s == null ? "" : s).replace(
      /[&<>"]/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
    );
  }
  function build() {
    if (UI.built) return;
    UI.built = true;
    const host = document.getElementById("ui-root") || document.body;
    // --- cabinet front
    cabRoot = document.createElement("div");
    cabRoot.className = "arc-cabview arc-hidden";
    cabRoot.innerHTML =
      '<div class="arc-cab">' +
      '<div class="arc-marquee"><canvas width="640" height="120"></canvas></div>' +
      '<div class="arc-bezel"><div class="arc-monitor"><canvas width="' +
      W +
      '" height="' +
      H +
      '"></canvas>' +
      '<div class="arc-scan"></div><div class="arc-glass"></div></div></div>' +
      '<div class="arc-cpanel"><div class="arc-stick"><i></i></div><div class="arc-btns"><i class="b1"></i><i class="b2"></i><i class="b3"></i></div>' +
      '<div class="arc-legend"></div></div>' +
      '<div class="arc-coin"><span class="arc-slot">25&cent;</span><span class="arc-credit"></span><span class="arc-slot">25&cent;</span></div>' +
      "</div>";
    host.appendChild(cabRoot);
    cabEl = cabRoot.querySelector(".arc-cab");
    marqCanvas = cabRoot.querySelector(".arc-marquee canvas");
    monitor = cabRoot.querySelector(".arc-monitor");
    canvas = monitor.querySelector("canvas");
    cx = canvas.getContext("2d");
    legendEl = cabRoot.querySelector(".arc-legend");
    creditEl = cabRoot.querySelector(".arc-credit");
    // --- ledger (goggles look)
    ledRoot = document.createElement("div");
    ledRoot.className = "arc-ledger arc-hidden";
    ledRoot.innerHTML =
      '<div class="arc-frame"><div class="arc-corner tl"></div><div class="arc-corner tr"></div><div class="arc-corner bl"></div><div class="arc-corner br"></div>' +
      '<div class="arc-head"><div class="arc-title">[ COLLECTIONS ]</div><div class="arc-tabs"></div><div class="arc-meta"></div></div>' +
      '<div class="arc-body"></div>' +
      '<div class="arc-foot"></div><div class="arc-sweep"></div>' +
      "</div>";
    host.appendChild(ledRoot);
    tabsEl = ledRoot.querySelector(".arc-tabs");
    metaEl = ledRoot.querySelector(".arc-meta");
    body = ledRoot.querySelector(".arc-body");
    foot = ledRoot.querySelector(".arc-foot");
    scene = document.createElement("canvas");
    scene.width = W;
    scene.height = H;
    sctx = scene.getContext("2d");
    bloom = document.createElement("canvas");
    bloom.width = W / 4;
    bloom.height = H / 4;
    bctx = bloom.getContext("2d");
    sctx.imageSmoothingEnabled = false;
    tabsEl.innerHTML = TABS.map(
      (t) =>
        '<div class="arc-tab" data-tab="' + t.id + '">' + t.label + "</div>",
    ).join("");
    tabsEl.addEventListener("click", (e) => {
      const t = e.target.closest(".arc-tab");
      if (t) setTab(t.dataset.tab);
    });
    body.addEventListener("click", onBodyClick);
    G.events.on("resize", layout);
  }

  function setTab(id) {
    if (!TABS.some((t) => t.id === id) || UI.tab === id) {
      render();
      return;
    }
    UI.tab = id;
    try {
      G.sfx.play("ui_click", { volume: 0.4 });
    } catch (e) {
      /* stub */
    }
    render();
  }

  function layout() {
    if (!UI.built || !UI.visible) return;
    if (UI.mode === "cabinet") {
      const bw = monitor.clientWidth,
        bh = monitor.clientHeight;
      if (bw > 0 && bh > 0) {
        const w = Math.min(bw, (bh * 4) / 3),
          h = (w * 3) / 4;
        canvas.style.width = Math.floor(w) + "px";
        canvas.style.height = Math.floor(h) + "px";
      }
      canvasRect = canvas.getBoundingClientRect();
    } else canvasRect = null;
  }

  // ------------------------------------------------------------------
  // Render (DOM side)
  // ------------------------------------------------------------------
  function render() {
    if (!UI.built) return;
    const cab = UI.mode === "cabinet";
    cabRoot.classList.toggle("arc-hidden", !(UI.visible && cab));
    ledRoot.classList.toggle("arc-hidden", !(UI.visible && !cab));
    if (cab) {
      renderCabinet();
      layout();
      return;
    }
    for (const el of tabsEl.children)
      el.classList.toggle("on", el.dataset.tab === UI.tab);
    const c = G.arcade.collectibles();
    metaEl.innerHTML =
      "MINIATURES " +
      c.minis.found +
      "/" +
      c.minis.total +
      " &middot; KEYS " +
      c.keys.found +
      "/" +
      c.keys.total +
      " &middot; CABINETS " +
      c.cabinets.found +
      "/" +
      c.cabinets.total;
    miniCanvas = null;
    bmapCanvas = null;
    artCanvas = null;
    if (UI.tab === "minis") renderMinis();
    else if (UI.tab === "keys") renderKeys();
    else renderArcade();
    updateLedger(0);
    foot.innerHTML =
      "<span>Q/E) TAB</span>" +
      "<span>W/S) SELECT</span>" +
      "<span>K / ESC) CLOSE</span>";
  }
  UI.render = render;

  function renderCabinet() {
    const S = UI.session;
    if (!S) return;
    const style = (UI.cabinet && UI.cabinet.style) || S.def.style || "wood";
    cabEl.className = "arc-cab arc-style-" + style;
    const mc = marqCanvas.getContext("2d");
    AR.drawMarquee(mc, marqCanvas.width, marqCanvas.height, S.def);
    legendEl.innerHTML =
      (S.impl.controls || [])
        .map((k) => "<span>" + esc(k) + "</span>")
        .join("") + "<span>ESC) PAUSE / STEP AWAY</span>";
    creditEl.textContent = "FREE PLAY";
  }

  function list(items, tab) {
    const sel = (UI.sel[tab] = Math.max(
      0,
      Math.min(items.length - 1, UI.sel[tab]),
    ));
    return (
      '<div class="arc-list">' +
      items
        .map(
          (it, i) =>
            '<div class="arc-item' +
            (i === sel ? " sel" : "") +
            (it.off ? " off" : "") +
            '" data-i="' +
            i +
            '">' +
            '<span class="arc-mark">' +
            (it.mark || "") +
            '</span><span class="arc-lbl">' +
            esc(it.label) +
            "</span>" +
            (it.right != null
              ? '<span class="arc-right">' + esc(it.right) + "</span>"
              : "") +
            "</div>",
        )
        .join("") +
      "</div>"
    );
  }
  function rewardRows(kind, unit) {
    const S = AR.STATE;
    return AR.REWARDS[kind]
      .map(
        (r) =>
          '<div class="arc-rw' +
          (S.rewards.has(r.id) ? " got" : "") +
          '">' +
          (S.rewards.has(r.id) ? "[X] " : "[ ] ") +
          r.n +
          " " +
          unit +
          " &mdash; " +
          esc(r.text) +
          "</div>",
      )
      .join("");
  }

