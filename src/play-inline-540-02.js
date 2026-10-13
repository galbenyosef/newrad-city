// play-inline-540 02 — esc
// Lines 344-672 of readable/play-inline-540.pretty.js (statement-aligned).
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
