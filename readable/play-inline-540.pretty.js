/* src/arcade/20_crt.js */
/* =====================================================================
 * arcade — 20_crt.js
 * Two overlays, both in state 'arcade':
 *   · CABINET  — you stand at an arcade cabinet (40_world.js → Play): the
 *     lit marquee on top, the monitor in a dark bezel (full-colour raster,
 *     cheap bloom, mild scanlines, curved-glass reflection), the control
 *     panel with stick + buttons below. Power-on / title + attract demo /
 *     pause / game-over / high-score handling shared by every game.
 *   · LEDGER   — the collections ledger (key K), in the goggles' look:
 *     SOUVENIRS (landmark miniatures), KEYS TO THE CITY (the Mayor's register),
 *     ARCADE (cabinet boards, house records, where the cabinets are).
 *     The ledger never launches a game: games are played at cabinets only.
 *
 * Game implementations register in AR.games[id] = {
 *   controls: [strings], create(api) → instance }
 * instance: { update(dt), draw(ctx, t), key?(code, repeat), score, over, won?, champion? }
 * api: { W, H, pal, audio, held(code), mouse{x,y,inside,down,pressed,moved}, demo, fonts, rnd }
 * ===================================================================== */
(function () {
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

  function renderMinis() {
    const S = AR.STATE;
    const items = AR.MINIS.map((g) => ({
      label: S.minis.has(g.id) ? g.name : "— NOT FOUND —",
      off: !S.minis.has(g.id),
      mark: S.minis.has(g.id) ? "&#9679;" : "&#9675;",
    }));
    const g =
      AR.MINIS[Math.max(0, Math.min(AR.MINIS.length - 1, UI.sel.minis))];
    const found = S.minis.has(g.id);
    const site = G.LAYOUT && G.LAYOUT.getSite ? G.LAYOUT.getSite(g.site) : null;
    body.innerHTML =
      '<div class="arc-cols"><div class="arc-left">' +
      list(items, "minis") +
      '<div class="arc-count">COLLECTED ' +
      S.minis.size +
      " / " +
      AR.MINIS.length +
      "</div></div>" +
      '<div class="arc-rightcol"><div class="arc-miniwrap"><canvas class="arc-mini" width="260" height="260"></canvas></div>' +
      '<div class="arc-gtitle">' +
      (found ? esc(g.name).toUpperCase() : "UNKNOWN MINIATURE") +
      "</div>" +
      '<div class="arc-text">' +
      (found
        ? esc(g.desc)
        : "A die-cast souvenir from an old-world street cart. Collectors in the city pay well for a complete set of eight.") +
      "</div>" +
      (found
        ? ""
        : '<div class="arc-hint">RUMOR: last seen near ' +
          esc(site ? site.name : g.name) +
          ".</div>") +
      '<div class="arc-sect">[ COLLECTOR REWARDS ]</div>' +
      rewardRows("minis", "MINIATURES") +
      questLine("minis") +
      "</div></div>";
    miniCanvas = body.querySelector("canvas.arc-mini");
    Mini.kind = found ? g.id : null;
  }

  /** KEYS TO THE CITY: the Mayor's register (all sixteen recipients), the selected key, the register map. */
  function renderKeys() {
    const S = AR.STATE;
    const items = AR.KEYS.map((q) => ({
      label: "No. " + q.no + " · " + q.year + " · " + q.who,
      off: !S.keys.has(q.id),
      mark: S.keys.has(q.id) ? "&#9679;" : "&#9675;",
      right: S.keys.has(q.id) ? "FOUND" : "",
    }));
    const q = AR.KEYS[Math.max(0, Math.min(AR.KEYS.length - 1, UI.sel.keys))];
    const found = S.keys.has(q.id),
      vault = AR.vaultOpen();
    let det;
    if (vault) det = "THE MAYOR'S VAULT STANDS OPEN";
    else if (S.keys.size >= AR.KEYS.length)
      det = "ALL SIXTEEN FOUND · THE VAULT IS UNDER GRACIE MANSION";
    else {
      const n =
        AR.world && AR.world.nearestUnfound
          ? AR.world.nearestUnfound("key")
          : null;
      det = n
        ? "NEAREST: KEY No. " +
          n.def.no +
          " · " +
          Math.round(n.dist) +
          " M " +
          n.dir +
          " · " +
          String(n.area || "").toUpperCase()
        : "NEAREST: NO FIX";
    }
    const card =
      '<div class="arc-kcard' +
      (found ? " lit" : "") +
      '">' +
      AR.keySVG +
      '<div class="arc-gtitle">KEY No. ' +
      q.no +
      " &middot; " +
      q.year +
      "</div>" +
      '<div class="arc-text"><b>Presented to</b> ' +
      esc(q.who) +
      ", " +
      esc(q.title) +
      ".</div>" +
      '<div class="arc-text"><b>Last known</b> ' +
      esc(q.kept) +
      "</div>" +
      '<div class="arc-goal' +
      (found ? " done" : "") +
      '">' +
      (found
        ? "[X] RECOVERED"
        : "[ ] MISSING &middot; " + esc(q.area).toUpperCase()) +
      "</div></div>";
    body.innerHTML =
      '<div class="arc-qwrap"><div class="arc-qhead"><span>KEYS TO THE CITY &middot; THE MAYOR\'S REGISTER, 1954&ndash;1967</span><span>FOUND ' +
      S.keys.size +
      " / " +
      AR.KEYS.length +
      '</span></div><div class="arc-det">' +
      esc(det) +
      "</div>" +
      '<div class="arc-qrow"><div class="arc-qleft arc-kleft">' +
      list(items, "keys") +
      "</div>" +
      '<div class="arc-kright">' +
      card +
      '<div class="arc-qmapwrap arc-kmap"><canvas class="arc-bmap" width="340" height="280"></canvas><div class="arc-prevlbl">REGISTER MAP</div></div>' +
      '<div class="arc-sect">[ THE VAULT ]</div>' +
      rewardRows("keys", "KEYS") +
      '<div class="arc-rw' +
      (vault ? " got" : "") +
      '">' +
      (vault ? "[X] " : "[ ] ") +
      "The Mayor's vault under Gracie Mansion opened</div>" +
      questLine("keys") +
      "</div></div></div>";
    bmapCanvas = body.querySelector("canvas.arc-bmap");
    BMap.prepare();
  }

  function renderArcade() {
    const S = AR.STATE,
      defs = AR.GAME_DEFS;
    const items = defs.map((g) => {
      const dsc = AR.discovered(g.id);
      return {
        label: dsc ? g.title : "— CABINET NOT FOUND —",
        right: dsc ? (AR.best(g.id) ? String(AR.best(g.id)) : "—") : "",
        off: !dsc,
        mark: S.records.has(g.id) ? "&#9733;" : dsc ? "&#9632;" : "&#9633;",
      };
    });
    const g = defs[Math.max(0, Math.min(defs.length - 1, UI.sel.arcade))];
    const dsc = AR.discovered(g.id);
    const where = AR.CABINETS.filter((c) => c.game === g.id).map((c) => c.area);
    const uniq = [];
    for (const w of where) if (uniq.indexOf(w) < 0) uniq.push(w);
    let right =
      '<div class="arc-artwrap"><canvas class="arc-art" width="480" height="90"></canvas></div>';
    if (dsc) {
      const rows = AR.board(g.id)
        .map(
          (r, i) =>
            '<tr class="' +
            (r.mine ? "mine" : "") +
            '"><td>' +
            (i + 1) +
            ".</td><td>" +
            esc(r.name) +
            '</td><td class="r">' +
            r.score +
            "</td></tr>",
        )
        .join("");
      const plays = S.plays[g.id] || 0;
      right +=
        '<div class="arc-gsub">' +
        esc(g.sub) +
        '</div><div class="arc-maker">' +
        esc(g.maker) +
        "</div>" +
        '<table class="arc-scores"><tr><th colspan="3">CABINET BOARD</th></tr>' +
        rows +
        "</table>" +
        '<div class="arc-goal' +
        (S.records.has(g.id) ? " done" : "") +
        '">' +
        (S.records.has(g.id) ? "[X] " : "[ ] ") +
        "HOUSE RECORD " +
        AR.houseRecord(g.id) +
        " &middot; YOUR BEST " +
        AR.best(g.id) +
        "</div>" +
        '<div class="arc-goal' +
        (S.champion.has(g.id) ? " done" : "") +
        '">' +
        (S.champion.has(g.id) ? "[X] " : "[ ] ") +
        "CHALLENGE: " +
        esc(g.goal).toUpperCase() +
        " &middot; +" +
        AR.XP_CHAMPION +
        " XP</div>" +
        '<div class="arc-hint">PLAYED ' +
        plays +
        (plays === 1 ? " TIME" : " TIMES") +
        "</div>" +
        '<div class="arc-text">' +
        esc(g.blurb) +
        "</div>";
    } else {
      right +=
        '<div class="arc-text">An arcade cabinet from before the bombs. A few still light up, in the bars that kept their generators ' +
        "and on street corners where somebody wired one to a car battery.</div>";
    }
    right +=
      '<div class="arc-sect">[ CABINETS ]</div><div class="arc-rw got">' +
      uniq.map(esc).join(" &middot; ") +
      "</div>" +
      questLine("arcade") +
      '<div class="arc-hint">GAMES ARE PLAYED AT THE CABINETS THEMSELVES.</div>';
    body.innerHTML =
      '<div class="arc-cols"><div class="arc-left">' +
      list(items, "arcade") +
      '<div class="arc-count">RECORDS ' +
      S.records.size +
      " / " +
      defs.length +
      '</div></div><div class="arc-rightcol">' +
      right +
      "</div></div>";
    artCanvas = body.querySelector("canvas.arc-art");
    if (artCanvas)
      AR.drawMarquee(
        artCanvas.getContext("2d"),
        artCanvas.width,
        artCanvas.height,
        g,
      );
  }

  function questLine(kind) {
    const st = AR.quests && AR.quests.status ? AR.quests.status(kind) : null;
    const name = AR.quests && AR.quests.name ? AR.quests.name(kind) : "";
    return st
      ? '<div class="arc-quest"><b>QUEST</b> ' +
          esc(name).toUpperCase() +
          " &mdash; " +
          st +
          "</div>"
      : "";
  }

  function onBodyClick(e) {
    const it = e.target.closest(".arc-item");
    if (!it) return;
    UI.sel[UI.tab] = +it.dataset.i;
    try {
      G.sfx.play("ui_hover", { volume: 0.4 });
    } catch (er) {
      /* stub */
    }
    render();
  }

  // ------------------------------------------------------------------
  // Open / close / state
  // ------------------------------------------------------------------
  /** The collections ledger. */
  function open(tab) {
    build();
    if (tab) UI.tab = TABS.some((t) => t.id === tab) ? tab : UI.tab;
    if (G.state === "arcade") {
      if (UI.mode === "cabinet") pauseSession();
      UI.mode = "ledger";
      render();
      return true;
    }
    if (G.state !== "play" && G.state !== "goggles") return false;
    if (G.player && G.player.alive === false) return false;
    UI.mode = "ledger";
    G.setState("arcade");
    return true;
  }
  function close() {
    if (G.state !== "arcade") {
      hide();
      return true;
    }
    if (UI.mode === "cabinet") AR.audio.uiBack();
    else {
      try {
        G.sfx.play("ui_back", { volume: 0.4 });
      } catch (e) {
        /* stub */
      }
    }
    G.setState("play");
    return true;
  }
  function show() {
    build();
    UI.visible = true;
    render();
    requestAnimationFrame(layout);
  }
  function pauseSession() {
    const S = UI.session;
    if (S && S.phase === "play") S.phase = "paused";
  }
  function hide() {
    if (!UI.built) return;
    UI.visible = false;
    cabRoot.classList.add("arc-hidden");
    ledRoot.classList.add("arc-hidden");
    pauseSession();
    canvasRect = null;
  }
  UI.open = open;
  UI.close = close;
  UI.isOpen = () => UI.visible;
  UI.show = show;
  UI.hide = hide;

  G.events.on("state", (s, prev) => {
    if (s === "arcade") {
      if (prev && prev !== "arcade" && prev !== "cheats" && prev !== "paused")
        UI.returnTo = prev;
      show();
    } else if (UI.visible) hide();
  });
  G.events.on("reset", () => {
    UI.session = null;
    UI.cabinet = null;
    UI.mode = "ledger";
    UI.sel = { minis: 0, keys: 0, arcade: 0 };
  });

  // ------------------------------------------------------------------
  // Cabinet sessions
  // ------------------------------------------------------------------
  /**
   * Stand at a cabinet and play. opts.cabinet: the world entry (style / id); opts.force: from tests / screenshots.
   * The same cabinet game left paused resumes; another game starts a fresh power-on.
   */
  function play(id, opts) {
    opts = opts || {};
    const impl = AR.games[id],
      def = AR.gameDef(id);
    if (!impl || !def) return false;
    build();
    if (G.state !== "arcade") {
      const ok = G.state === "play" || opts.force;
      if (!ok || (G.player && G.player.alive === false && !opts.force))
        return false;
    }
    UI.cabinet = opts.cabinet || null;
    let S = UI.session;
    if (!S || S.id !== id) {
      S = UI.session = {
        id,
        impl,
        def,
        phase: "boot",
        t: 0,
        bootT: 0,
        inst: null,
        demoH: null,
        rank: -1,
        overT: 0,
        champT: 0,
        recordT: 0,
      };
      AR.audio.coin();
    } else if (S.phase === "over") {
      S.phase = "title";
      S.inst = null;
    }
    UI.mode = "cabinet";
    if (G.state !== "arcade") G.setState("arcade");
    else render();
    requestAnimationFrame(layout);
    return true;
  }
  UI.play = play;

  /** Start a real run (opts.demo: attract-mode AI drives it — screenshots / tests). */
  function startRun(opts) {
    const S = UI.session;
    if (!S) return;
    try {
      S.inst = S.impl.create(makeApi(S.id, !!(opts && opts.demo)));
    } catch (e) {
      G.reportError("arcade:create:" + S.id, e);
      S.inst = null;
      return;
    }
    S.phase = "play";
    S.t = 0;
    S.rank = -1;
    S.overT = 0;
    S.champT = 0;
    S.champDone = false;
    S.recordT = 0;
    AR.audio.start();
  }
  UI.startRun = startRun;
  function finishRun() {
    const S = UI.session;
    S.phase = "over";
    S.overT = 0;
    const hadRecord = AR.STATE.records.has(S.id);
    S.rank = AR.recordScore(S.id, S.inst.score);
    S.newRecord = !hadRecord && AR.STATE.records.has(S.id);
    if (S.newRecord) AR.audio.houseRecord();
    else if (S.inst.won) AR.audio.victory();
    else if (S.rank === 0) AR.audio.highScore();
    else AR.audio.gameOver();
  }
  function quitRun() {
    const S = UI.session;
    if (S && S.inst && S.inst.score > 0) AR.recordScore(S.id, S.inst.score);
    if (S) {
      S.phase = "title";
      S.inst = null;
    }
    AR.audio.uiBack();
  }
  /** Leave the cabinet (title / game over: the session ends; mid-run it stays paused for this game). */
  function stepAway() {
    const S = UI.session;
    if (S && (S.phase === "title" || S.phase === "over" || S.phase === "boot"))
      UI.session = null;
    close();
  }
  UI.stepAway = stepAway;

  // ------------------------------------------------------------------
  // Input
  // ------------------------------------------------------------------
  function onKey(code, e) {
    if (G.state !== "arcade" || !UI.visible) return;
    const rep = !!(e && e.repeat);
    G.input.consume(code);
    if (UI.mode === "cabinet" && UI.session) {
      if (code === "Tab" && !rep) {
        pauseSession();
        close();
        return;
      }
      gameKey(code, rep);
      return;
    }
    if (code === "Tab" || code === AR.KEY) {
      if (!rep) close();
      return;
    }
    ledgerKey(code, rep);
  }
  G.events.on("keydown", onKey);

  function ledgerKey(code, rep) {
    if (BACK[code]) {
      if (!rep) close();
      return;
    }
    const ti = TABS.findIndex((t) => t.id === UI.tab);
    if (code === "KeyQ" || code === "KeyA" || code === "ArrowLeft") {
      setTab(TABS[(ti + TABS.length - 1) % TABS.length].id);
      return;
    }
    if (code === "KeyE" || code === "KeyD" || code === "ArrowRight") {
      setTab(TABS[(ti + 1) % TABS.length].id);
      return;
    }
    if (code === "Digit1" || code === "Digit2" || code === "Digit3") {
      setTab(TABS[+code.slice(5) - 1].id);
      return;
    }
    const n =
      UI.tab === "minis"
        ? AR.MINIS.length
        : UI.tab === "arcade"
          ? AR.GAME_DEFS.length
          : UI.tab === "keys"
            ? AR.KEYS.length
            : 0;
    if (n && (code === "KeyW" || code === "ArrowUp")) {
      UI.sel[UI.tab] = (UI.sel[UI.tab] + n - 1) % n;
      render();
      return;
    }
    if (n && (code === "KeyS" || code === "ArrowDown")) {
      UI.sel[UI.tab] = (UI.sel[UI.tab] + 1) % n;
      render();
    }
  }

  function gameKey(code, rep) {
    const S = UI.session;
    if (S.phase === "boot" || S.phase === "title") {
      // power-on / title: START begins a run, ESC steps away
      if (CONFIRM[code] && !rep) startRun();
      else if (BACK[code] && !rep) stepAway();
      return;
    }
    if (S.phase === "play") {
      if (code === "Escape" && !rep) {
        S.phase = "paused";
        AR.audio.uiBack();
        return;
      }
      if (S.inst && S.inst.key) {
        try {
          S.inst.key(code, rep);
        } catch (e) {
          G.reportError("arcade:key:" + S.id, e);
        }
      }
      return;
    }
    if (S.phase === "paused") {
      if (CONFIRM[code] && !rep) {
        S.phase = "play";
        AR.audio.uiSelect();
      } else if (BACK[code] && !rep) quitRun();
      return;
    }
    if (S.phase === "over") {
      if (CONFIRM[code] && !rep && S.overT > 0.8) startRun();
      else if (BACK[code] && !rep) {
        S.phase = "title";
        S.inst = null;
        AR.audio.uiBack();
      }
    }
  }

  // ------------------------------------------------------------------
  // Per-frame
  // ------------------------------------------------------------------
  UI.update = function (dt) {
    if (!UI.visible) return;
    UI.t += dt;
    dt = Math.min(dt, 0.05);
    if (UI.mode === "cabinet" && UI.session) updateGame(dt);
    else updateLedger(dt);
  };

  function tickDemo(holder, id, dt) {
    const impl = AR.games[id];
    if (!impl) return null;
    if (!holder.inst || (holder.inst.over && holder.t > 2.5)) {
      try {
        holder.inst = impl.create(makeApi(id, true));
      } catch (e) {
        G.reportError("arcade:demo:" + id, e);
        return null;
      }
      holder.t = 0;
    }
    if (holder.inst.over) holder.t += dt;
    else {
      try {
        holder.inst.update(dt);
      } catch (e) {
        G.reportError("arcade:demoUpdate:" + id, e);
        holder.inst.over = true;
      }
    }
    return holder.inst;
  }

  AR.tickDemo = tickDemo;

  // Attract mode for the 3D cabinets' monitors (40_world.js): own scratch canvas, no bloom.
  let attractScratch = null,
    attractCtx = null;
  /** Advance a demo held in `holder` and paint it (with a title band) into ctx (w×h). */
  AR.renderAttract = function (holder, id, dt, ctx, w, h) {
    if (!attractScratch) {
      attractScratch = document.createElement("canvas");
      attractScratch.width = W;
      attractScratch.height = H;
      attractCtx = attractScratch.getContext("2d");
    }
    const inst = tickDemo(holder, id, Math.min(dt, 0.1));
    const c = attractCtx,
      pal = AR.palette(id),
      def = AR.gameDef(id);
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalAlpha = 1;
    c.globalCompositeOperation = "source-over";
    c.fillStyle = pal.bg;
    c.fillRect(0, 0, W, H);
    if (inst) {
      try {
        inst.draw(c, (holder.clock = (holder.clock || 0) + dt));
      } catch (e) {
        G.reportError("arcade:attractDraw:" + id, e);
      }
    }
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalAlpha = 1;
    if (def && ((holder.clock * 0.5) | 0) % 2 === 0) {
      c.fillStyle = "rgba(0,0,0,0.55)";
      c.fillRect(0, H - 70, W, 50);
      c.font = FONTS.l;
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillStyle = pal.yellow;
      c.fillText("PRESS START  ·  FREE PLAY", W / 2, H - 45);
    }
    ctx.drawImage(attractScratch, 0, 0, w, h);
  };

  function updateGame(dt) {
    const S = UI.session;
    S.t += dt;
    if (!canvasRect) layout();
    updateMouse();
    const pal = AR.palette(S.id);
    let inst = null;
    if (S.phase === "boot") {
      if (S.bootT === 0) AR.audio.powerOn();
      S.bootT += dt;
      if (S.bootT > BOOT_LEN) {
        S.phase = "title";
        S.t = 0;
      }
    } else if (S.phase === "title") {
      if (!S.demoH) S.demoH = { inst: null, t: 0 };
      inst = tickDemo(S.demoH, S.id, dt);
      if (MOUSE.pressed) startRun();
    } else if (S.inst) {
      inst = S.inst;
      if (S.phase === "play") {
        try {
          inst.update(dt);
        } catch (e) {
          G.reportError("arcade:update:" + S.id, e);
          inst.over = true;
        }
        if (inst.champion && !S.champDone) {
          S.champDone = true;
          if (AR.champion(S.id)) S.champT = 3.5;
        }
        if (
          !S.recordShown &&
          inst.score > AR.houseRecord(S.id) &&
          !AR.STATE.records.has(S.id)
        ) {
          S.recordShown = true;
          S.recordT = 3;
        }
        if (inst.over) finishRun();
      } else if (S.phase === "over") {
        S.overT += dt;
        try {
          inst.update(dt);
        } catch (e) {
          /* frozen */
        }
      }
      if (S.champT > 0) S.champT -= dt;
      if (S.recordT > 0) S.recordT -= dt;
    }
    // --- draw
    const c = sctx;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalAlpha = 1;
    c.globalCompositeOperation = "source-over";
    c.fillStyle = pal.bg;
    c.fillRect(0, 0, W, H);
    if (inst) {
      try {
        inst.draw(c, S.t);
      } catch (e) {
        G.reportError("arcade:draw:" + S.id, e);
      }
    }
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalAlpha = 1;
    c.globalCompositeOperation = "source-over";
    if (S.phase === "boot") drawBoot(c, S, pal);
    else if (S.phase === "title") drawTitle(c, S, pal);
    else if (S.phase === "paused")
      drawBox(c, pal, ["PAUSED"], ["ENTER) RESUME", "ESC) QUIT TO TITLE"]);
    else if (S.phase === "over" && S.overT > 0.5) drawOver(c, S, pal);
    if (S.phase === "play") {
      c.font = FONTS.m;
      c.textAlign = "center";
      c.textBaseline = "middle";
      if (S.champT > 0) {
        c.fillStyle = ((S.t * 4) | 0) % 2 ? pal.yellow : pal.white;
        c.fillText(
          "CHALLENGE COMPLETE!  +" + AR.XP_CHAMPION + " XP",
          W / 2,
          60,
        );
      } else if (S.recordT > 0) {
        c.fillStyle = ((S.t * 4) | 0) % 2 ? pal.magenta : pal.cyan;
        c.fillText("YOU BEAT THE HOUSE RECORD!", W / 2, 60);
      }
    }
    composite(canvas, cx, W, H);
  }

  function composite(dst, dctx, w, h) {
    dctx.globalCompositeOperation = "source-over";
    dctx.globalAlpha = 1;
    dctx.drawImage(scene, 0, 0, w, h);
    bctx.globalCompositeOperation = "source-over";
    bctx.drawImage(scene, 0, 0, W / 4, H / 4);
    dctx.globalCompositeOperation = "lighter";
    dctx.globalAlpha = 0.35;
    dctx.drawImage(bloom, 0, 0, w, h);
    dctx.globalCompositeOperation = "source-over";
    dctx.globalAlpha = 1;
  }

  // Cabinet power-on: the tube warms up (a bright line opens into the raster), RAM check, the maker's card.
  const BOOT_LEN = 2.1;
  function drawBoot(c, S, pal) {
    const t = S.bootT;
    c.fillStyle = "#000";
    c.fillRect(0, 0, W, H);
    if (t < 0.45) {
      const k = t / 0.45,
        hh = Math.max(2, H * k * k);
      c.fillStyle = "rgba(255,255,255," + (1 - k * 0.6) + ")";
      c.fillRect(0, H / 2 - hh / 2, W, hh);
      return;
    }
    // colour bars test pattern
    const bars = [
      pal.white,
      pal.yellow,
      pal.cyan,
      pal.teal,
      pal.magenta,
      pal.red,
      pal.blue,
    ];
    if (t < 0.9) {
      for (let i = 0; i < bars.length; i++) {
        c.fillStyle = bars[i];
        c.fillRect((i * W) / bars.length, 0, W / bars.length + 1, H * 0.7);
      }
    }
    c.textAlign = "left";
    c.textBaseline = "top";
    c.font = FONTS.m;
    const lines = [
      "RAM OK   ROM OK   SOUND OK",
      "COIN MECH ........ JAMMED",
      "SET TO FREE PLAY",
      "",
      S.def.maker.toUpperCase(),
      "PRESENTS",
    ];
    const chars = Math.floor(Math.max(0, t - 0.9) * 120);
    let used = 0,
      y = 300;
    if (t >= 0.9) {
      c.fillStyle = "#000";
      c.fillRect(0, 0, W, H);
      y = 120;
    }
    for (let i = 0; i < lines.length; i++) {
      const L = lines[i],
        n = Math.max(0, Math.min(L.length, chars - used));
      used += L.length + 3;
      c.fillStyle = i >= 4 ? pal.yellow : i === 1 ? pal.orange : pal.cyan;
      if (n > 0) c.fillText(L.slice(0, n), 60, y);
      y += 30;
      if (n < L.length) break;
    }
    c.fillStyle = pal.al[6];
    c.font = FONTS.s;
    c.fillText("ENTER) START   ESC) STEP AWAY", 60, 440);
  }
  function drawTitle(c, S, pal) {
    c.fillStyle = "rgba(0,0,0,0.62)";
    c.fillRect(0, 0, W, H);
    c.textAlign = "center";
    c.textBaseline = "middle";
    const A = S.def.art;
    c.font = FONTS.xl;
    c.fillStyle = "#000";
    c.fillText(S.def.title, W / 2 + 3, 95);
    c.fillStyle = A.a;
    c.fillText(S.def.title, W / 2, 92);
    c.fillStyle = A.c;
    c.font = FONTS.m;
    c.fillText(S.def.sub, W / 2, 136);
    c.fillStyle = pal.al[6];
    c.font = FONTS.s;
    c.fillText(S.def.maker.toUpperCase(), W / 2, 162);
    // the cabinet board
    const sc = AR.board(S.id);
    c.fillStyle = pal.cyan;
    c.font = FONTS.m;
    c.fillText("- HIGH SCORES -", W / 2, 206);
    for (let i = 0; i < 5; i++) {
      const s = sc[i],
        y = 234 + i * 24;
      c.fillStyle =
        s && s.mine ? pal.magenta : i === 0 ? pal.yellow : pal.white;
      c.textAlign = "left";
      c.fillText(i + 1 + ". " + (s ? s.name : "---"), W / 2 - 150, y);
      c.textAlign = "right";
      c.fillText(String(s ? s.score : 0).padStart(6, "0"), W / 2 + 150, y);
    }
    c.textAlign = "center";
    if (((S.t * 2) | 0) % 2 === 0) {
      c.fillStyle = pal.yellow;
      c.font = FONTS.l;
      c.fillText("PRESS START  -  FREE PLAY", W / 2, 386);
    }
    c.fillStyle = pal.al[7];
    c.font = FONTS.s;
    c.fillText(
      "CHALLENGE: " +
        S.def.goal.toUpperCase() +
        (AR.STATE.champion.has(S.id) ? "  [COMPLETE]" : ""),
      W / 2,
      424,
    );
    c.fillText("ENTER) START   ESC) STEP AWAY", W / 2, 450);
  }
  function drawBox(c, pal, big, small) {
    const bw = 380,
      bh = 80 + big.length * 40 + small.length * 24;
    const x = (W - bw) / 2,
      y = (H - bh) / 2;
    c.fillStyle = "rgba(0,0,0,0.82)";
    c.fillRect(x, y, bw, bh);
    c.strokeStyle = pal.cyan;
    c.lineWidth = 2;
    c.strokeRect(x + 0.5, y + 0.5, bw - 1, bh - 1);
    c.strokeStyle = pal.magenta;
    c.strokeRect(x + 5.5, y + 5.5, bw - 11, bh - 11);
    c.textAlign = "center";
    c.textBaseline = "middle";
    let yy = y + 44;
    c.font = FONTS.l;
    c.fillStyle = pal.yellow;
    for (const s of big) {
      c.fillText(s, W / 2, yy);
      yy += 40;
    }
    c.font = FONTS.m;
    c.fillStyle = pal.white;
    yy += 8;
    for (const s of small) {
      c.fillText(s, W / 2, yy);
      yy += 24;
    }
  }
  function drawOver(c, S, pal) {
    const big = [
      S.inst && S.inst.won ? "VICTORY!" : "GAME OVER",
      "SCORE " + (S.inst ? S.inst.score : 0),
    ];
    const small = [];
    if (S.newRecord) small.push(((S.t * 3) | 0) % 2 ? "NEW HOUSE RECORD!" : "");
    else if (S.rank === 0)
      small.push(((S.t * 3) | 0) % 2 ? "NEW HIGH SCORE!" : "");
    else if (S.rank > 0) small.push("#" + (S.rank + 1) + " ON THE BOARD");
    if (S.overT > 0.8) small.push("ENTER) PLAY AGAIN   ESC) TITLE");
    drawBox(c, pal, big, small);
  }

  // ------------------------------------------------------------------
  // Ledger animation: miniature viewer + beacon map
  // ------------------------------------------------------------------
  function updateLedger(dt) {
    if (UI.tab === "minis" && miniCanvas) Mini.draw(miniCanvas, dt);
    else if (UI.tab === "keys" && bmapCanvas) BMap.draw(bmapCanvas, dt);
  }

  // Register map: the world map cropped to the sixteen keys' sites, found keys lit,
  // the selected key ringed, a pulsing ring on the nearest missing key, the player's arrow.
  const BMap = {
    base: null,
    crop: null,
    t: 0,
    w2m(x, z) {
      try {
        if (!G.isStub("map") && G.map.worldToMap && G.map.mapSize) {
          const m = G.map.worldToMap(x, z);
          return {
            x: m.u * G.map.mapSize.width,
            y: m.v * G.map.mapSize.height,
          };
        }
      } catch (e) {
        /* stub */
      }
      return { x: x + 1200, y: z + 1400 }; // fallback: raw world metres
    },
    prepare() {
      if (!bmapCanvas) return;
      const cw = bmapCanvas.width,
        ch = bmapCanvas.height,
        pal = AR.ledgerPal;
      let x0 = 1e9,
        y0 = 1e9,
        x1 = -1e9,
        y1 = -1e9;
      const pts = AR.KEYS.map((q) => AR.keyHint(q));
      try {
        const gl = G.LAYOUT.getLocation
          ? G.LAYOUT.getLocation("gracie_mansion")
          : null;
        if (gl) pts.push({ x: gl.x, z: gl.z });
      } catch (e) {
        /* layout */
      }
      for (const h of pts) {
        const m = this.w2m(h.x, h.z);
        x0 = Math.min(x0, m.x);
        y0 = Math.min(y0, m.y);
        x1 = Math.max(x1, m.x);
        y1 = Math.max(y1, m.y);
      }
      const pad = Math.max(x1 - x0, y1 - y0) * 0.08 + 8;
      x0 -= pad;
      y0 -= pad;
      x1 += pad;
      y1 += pad;
      const k = cw / ch,
        bw = x1 - x0,
        bh = y1 - y0;
      if (bw / bh > k) {
        const nh = bw / k;
        y0 -= (nh - bh) / 2;
        y1 = y0 + nh;
      } else {
        const nw = bh * k;
        x0 -= (nw - bw) / 2;
        x1 = x0 + nw;
      }
      this.crop = { x0, y0, s: cw / (x1 - x0) };
      const b = this.base || (this.base = document.createElement("canvas"));
      b.width = cw;
      b.height = ch;
      const c = b.getContext("2d");
      c.fillStyle = pal.bg;
      c.fillRect(0, 0, cw, ch);
      let img = null;
      try {
        if (!G.isStub("map") && G.map.getMapImage) img = G.map.getMapImage();
      } catch (e) {
        img = null;
      }
      if (img && img.width) {
        c.globalAlpha = 0.8;
        c.imageSmoothingEnabled = true;
        c.drawImage(img, x0, y0, x1 - x0, y1 - y0, 0, 0, cw, ch);
        c.globalAlpha = 1;
      } else {
        c.strokeStyle = pal.al[2];
        c.lineWidth = 1;
        for (let i = 0; i < cw; i += 20) {
          c.beginPath();
          c.moveTo(i + 0.5, 0);
          c.lineTo(i + 0.5, ch);
          c.stroke();
        }
        for (let i = 0; i < ch; i += 20) {
          c.beginPath();
          c.moveTo(0, i + 0.5);
          c.lineTo(cw, i + 0.5);
          c.stroke();
        }
      }
      // keys: found = a little key glyph, missing = faint dot; Gracie Mansion (the vault) = an amber square
      const S = AR.STATE;
      for (const q of AR.KEYS) {
        const h = AR.keyHint(q),
          p = this.px(h.x, h.z);
        if (S.keys.has(q.id)) {
          c.strokeStyle = pal.hi;
          c.lineWidth = 1.5;
          c.beginPath();
          c.arc(p.x - 4, p.y, 2.6, 0, Math.PI * 2);
          c.moveTo(p.x - 1.4, p.y);
          c.lineTo(p.x + 6, p.y);
          c.moveTo(p.x + 4, p.y);
          c.lineTo(p.x + 4, p.y + 3);
          c.moveTo(p.x + 6, p.y);
          c.lineTo(p.x + 6, p.y + 3);
          c.stroke();
        } else {
          c.fillStyle = pal.al[4];
          c.fillRect(p.x - 1.5, p.y - 1.5, 3, 3);
        }
      }
      try {
        const gs = G.LAYOUT.getLocation
          ? G.LAYOUT.getLocation("gracie_mansion")
          : null;
        if (gs) {
          const p = this.px(gs.x, gs.z);
          c.strokeStyle = "#ffb347";
          c.lineWidth = 1.5;
          c.strokeRect(p.x - 4, p.y - 4, 8, 8);
        }
      } catch (e) {
        /* layout */
      }
      c.strokeStyle = pal.al[4];
      c.lineWidth = 2;
      c.strokeRect(1, 1, cw - 2, ch - 2);
    },
    px(x, z) {
      const m = this.w2m(x, z),
        C = this.crop;
      return { x: (m.x - C.x0) * C.s, y: (m.y - C.y0) * C.s };
    },
    draw(cv, dt) {
      if (!this.base || !this.crop) return;
      this.t += dt;
      const c = cv.getContext("2d"),
        pal = AR.ledgerPal;
      c.drawImage(this.base, 0, 0);
      const sel =
        AR.KEYS[Math.max(0, Math.min(AR.KEYS.length - 1, UI.sel.keys))];
      if (sel) {
        const h = AR.keyHint(sel),
          p = this.px(h.x, h.z);
        c.strokeStyle = pal.hi;
        c.lineWidth = 1;
        c.beginPath();
        c.arc(p.x, p.y, 7, 0, Math.PI * 2);
        c.stroke();
      }
      if (AR.world && AR.world.entries && AR.world.nearestUnfound) {
        const n = AR.world.nearestUnfound("key");
        if (n) {
          const h = AR.keyHint(n.def),
            p = this.px(h.x, h.z);
          for (let i = 0; i < 2; i++) {
            const k = (this.t * 0.8 + i * 0.5) % 1;
            c.strokeStyle = "rgba(255,179,71," + (1 - k).toFixed(2) + ")";
            c.lineWidth = 2;
            c.beginPath();
            c.arc(p.x, p.y, 4 + k * 22, 0, Math.PI * 2);
            c.stroke();
          }
          c.fillStyle = "#ffb347";
          c.fillRect(p.x - 2, p.y - 2, 4, 4);
        }
      }
      const P = G.player && G.player.pos;
      if (P && G.LAYOUT && P.x < G.LAYOUT.INTERIOR_X_MIN) {
        const p = this.px(P.x, P.z),
          yaw = G.player.yaw || 0;
        const f = this.px(P.x - Math.sin(yaw) * 40, P.z - Math.cos(yaw) * 40);
        const a = Math.atan2(f.y - p.y, f.x - p.x);
        if (
          p.x > -10 &&
          p.y > -10 &&
          p.x < cv.width + 10 &&
          p.y < cv.height + 10
        ) {
          c.save();
          c.translate(p.x, p.y);
          c.rotate(a);
          c.fillStyle = pal.hi;
          c.strokeStyle = pal.bg;
          c.lineWidth = 1.5;
          c.beginPath();
          c.moveTo(9, 0);
          c.lineTo(-6, -6);
          c.lineTo(-3, 0);
          c.lineTo(-6, 6);
          c.closePath();
          c.fill();
          c.stroke();
          c.restore();
        }
      }
    },
  };

  // Miniature viewer (2D vector): turntable plinth, the landmark silhouette, a sweeping highlight
  const Mini = {
    kind: null,
    t: 0,
    draw(cv, dt) {
      this.t += dt;
      const c = cv.getContext("2d"),
        w = cv.width,
        h = cv.height,
        pal = AR.ledgerPal;
      const gx = w / 2,
        base = h * 0.78;
      c.clearRect(0, 0, w, h);
      // plinth (ellipse top + front band)
      c.strokeStyle = pal.c;
      c.fillStyle = pal.al[1];
      c.lineWidth = 2;
      c.beginPath();
      c.ellipse(gx, base + 18, w * 0.36, 12, 0, 0, Math.PI);
      c.lineTo(gx - w * 0.36, base);
      c.ellipse(gx, base, w * 0.36, 12, 0, Math.PI, 0, true);
      c.closePath();
      c.fill();
      c.stroke();
      c.beginPath();
      c.ellipse(gx, base, w * 0.36, 12, 0, 0, Math.PI * 2);
      c.stroke();
      // rotating ring marks on the plinth top
      c.strokeStyle = pal.al[4];
      c.lineWidth = 1;
      for (let i = 0; i < 12; i++) {
        const a = this.t * 0.6 + (i * Math.PI) / 6,
          ex = Math.cos(a) * w * 0.3,
          ey = Math.sin(a) * 10;
        if (ey < 0) continue;
        c.beginPath();
        c.moveTo(gx + ex, base + ey - 2);
        c.lineTo(gx + ex, base + ey + 2);
        c.stroke();
      }
      if (this.kind) {
        const lk = this.kind;
        const tall =
          lk === "empire" || lk === "chrysler"
            ? 3.4
            : lk === "liberty"
              ? 2.2
              : lk === "times_square"
                ? 1.9
                : lk === "bridge"
                  ? 1.7
                  : 1.5;
        const s = Math.min((h * 0.62) / tall, w * 0.3);
        AR.drawLandmark(c, lk, gx, base, s, pal.al[2], pal.c, {
          detail: pal.dim,
          lw: 2,
          seed: 3,
        });
        // sweeping glint
        const gxx = gx + Math.sin(this.t * 0.9) * w * 0.25;
        const g = c.createLinearGradient(gxx - 30, 0, gxx + 30, 0);
        g.addColorStop(0, "rgba(207,238,250,0)");
        g.addColorStop(0.5, "rgba(207,238,250,0.16)");
        g.addColorStop(1, "rgba(207,238,250,0)");
        c.fillStyle = g;
        c.fillRect(gxx - 30, base - h * 0.7, 60, h * 0.7);
      } else {
        c.fillStyle = pal.dim;
        c.font = "64px VT323, monospace";
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillText("?", gx, base - h * 0.3);
      }
    },
  };
  AR.Mini = Mini;
})();
