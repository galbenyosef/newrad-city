// play-inline-540 04 — pal
// Lines 944-1211 of readable/play-inline-540.pretty.js (statement-aligned).
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
