// play-inline-597 02 — bannercur
// Lines 370-648 of readable/play-inline-597.pretty.js (statement-aligned).
  function notesLive() {
    return (
      G.state === "play" && !H.hudForcedHidden && !!G.player && G.player.alive
    );
  }
  function bannerBusy() {
    return !!bannerCur || banners.length > 0 || HUD.bannerGap > 0;
  }
  function updateNotify(realDt) {
    if (!notesLive()) {
      resumeT = 0.45;
      return;
    } // frozen (layer hidden by updateVisibility)
    if (resumeT > 0) {
      resumeT -= realDt;
      return;
    }
    if (noteGap > 0) noteGap -= realDt;
    for (let i = active.length - 1; i >= 0; i--) {
      const n = active[i];
      n.t += realDt;
      const full = n.text.length + (n.count > 1 ? 4 : 0);
      if (n.typed < full + 2) {
        n.typed = Math.min(full + 2, n.typed + realDt * TYPE_CPS);
        renderNote(n);
      }
      if (n.t > n.life - 0.4 && !n.leaving) {
        n.leaving = true;
        n.el.classList.remove("in");
        n.el.classList.add("out");
      }
      if (n.t > n.life) {
        n.el.remove();
        active.splice(i, 1);
      }
    }
    if (!queue.length || noteGap > 0) return;
    if (bannerCur && bannerCur.kind === "level") return; // the PROMOTION banner plays alone
    const bUp = bannerBusy();
    let live = 0;
    for (const a of active) if (!a.leaving) live++;
    if (live >= (bUp ? 1 : MAX_VISIBLE)) return;
    const idx = queue.findIndex((q) => !(bUp && isHint(q))); // hints wait for the banner; others keep FIFO order
    if (idx < 0) return;
    const n = coalesce(queue.splice(idx, 1)[0]);
    showNote(n);
    noteGap = STAGGER;
  }
  function clearNotify() {
    queue.length = 0;
    for (const n of active) n.el.remove();
    active.length = 0;
    noteGap = 0;
  }

  // Message box on the goggles readout ("You can't drop that.", fast travel refusals…)
  const ggQ = [];
  let ggCur = null,
    ggGap = 0;
  function ggMsg(text, opts) {
    const GG = H.GG;
    if (!GG || !GG.open || !GG.el || !GG.el.screen) return false;
    if (!HUD.ggMsg || HUD.ggMsg.parentNode !== GG.el.screen)
      HUD.ggMsg = H.el("div", "hud-ggmsg", GG.el.screen);
    if (ggCur && ggCur.text === text) {
      ggCur.t = Math.min(ggCur.t, 0.3);
      return true;
    }
    if (ggQ.some((q) => q.text === text)) return true;
    if (ggQ.length >= 3) ggQ.shift();
    ggQ.push({ text, opts: opts || {} });
    return true;
  }
  function updateGgMsg(realDt) {
    if (G.state !== "goggles") {
      if (ggCur || ggQ.length) {
        ggQ.length = 0;
        ggCur = null;
        if (HUD.ggMsg) HUD.ggMsg.classList.remove("in");
      }
      return;
    }
    if (ggCur) {
      ggCur.t += realDt;
      if (ggCur.t > ggCur.life) {
        HUD.ggMsg.classList.remove("in");
        ggCur = null;
        ggGap = 0.22;
      }
      return;
    }
    if (ggGap > 0) {
      ggGap -= realDt;
      return;
    }
    if (!ggQ.length || !HUD.ggMsg) return;
    ggCur = ggQ.shift();
    ggCur.t = 0;
    ggCur.life = 2.0 + Math.min(2.4, ggCur.text.length / 38);
    HUD.ggMsg.innerHTML =
      H.glyph(noteIcon(ggCur.text, ggCur.opts)) +
      "<div>" +
      H.esc(H.up(ggCur.text)) +
      "</div>";
    HUD.ggMsg.classList.remove("in");
    void HUD.ggMsg.offsetWidth;
    HUD.ggMsg.classList.add("in");
    H.sfx("ui_error", { volume: 0.4 });
  }

  // XP ticker ("+25 XP  QUEST OBJECTIVE") — bottom-left above the vitals; bursts accumulate
  let xpAcc = 0,
    xpT = 0;
  function onXP(n, reason) {
    n = Math.round(Number(n) || 0);
    if (n <= 0) return;
    xpAcc = xpT > 0 ? xpAcc + n : n;
    xpT = 3.0;
    HUD.xp.innerHTML =
      '<span class="hud-xpnum">+' +
      xpAcc +
      " XP</span>" +
      (reason
        ? '<span class="hud-xpwhy">' + H.esc(H.up(reason)) + "</span>"
        : "");
    HUD.xp.classList.remove("pop");
    void HUD.xp.offsetWidth;
    HUD.xp.classList.add("pop", "in");
  }
  function updateXP(realDt) {
    if (xpT <= 0 || G.state !== "play") return;
    xpT -= realDt;
    if (xpT <= 0) HUD.xp.classList.remove("in");
  }

  // ------------------------------------------------------------------
  // Banners (top centre): quest added/completed/failed, discovered, cleared, promotion
  // ------------------------------------------------------------------
  const banners = [];
  let bannerCur = null;
  function pushBanner(b) {
    banners.push(b);
  }
  const BANNER_GLYPH = {
    quest: "quest",
    "quest done": "check",
    "quest fail": "fail",
    disc: "radar",
    "disc cleared": "check",
    level: "level",
  };
  function updateBanners(realDt, paused) {
    if (bannerCur) {
      if (!paused) {
        bannerCur.t += realDt;
        if (bannerCur.typed < bannerCur.title.length) {
          bannerCur.typed = Math.min(
            bannerCur.title.length,
            bannerCur.typed + realDt * 40,
          );
          H.setText(
            HUD.bnTitle,
            bannerCur.title.slice(0, Math.ceil(bannerCur.typed)),
          );
        }
      }
      if (bannerCur.t > bannerCur.life) {
        HUD.banner.classList.remove("in");
        bannerCur = null;
        HUD.bannerGap = 0.45;
      }
      return;
    }
    if (HUD.bannerGap > 0) {
      HUD.bannerGap -= realDt;
      return;
    }
    if (paused || !banners.length) return;
    bannerCur = banners.shift();
    bannerCur.t = 0;
    bannerCur.life = bannerCur.life || 4.2;
    bannerCur.title = H.up(bannerCur.title);
    bannerCur.typed = G.SHOT ? bannerCur.title.length : 0;
    HUD.banner.className = "hud-banner " + (bannerCur.kind || "");
    const gl =
      bannerCur.glyph ||
      bannerCur.icon ||
      BANNER_GLYPH[bannerCur.kind] ||
      "info";
    HUD.banner.innerHTML =
      '<div class="hud-bn-icon">' +
      H.glyph(gl) +
      "</div>" +
      '<div class="hud-bn-body"><div class="hud-bn-title"></div>' +
      '<div class="hud-bn-sub">' +
      H.esc(H.up(bannerCur.sub || "")) +
      "</div>" +
      (bannerCur.extra
        ? '<div class="hud-bn-extra">' + H.esc(H.up(bannerCur.extra)) + "</div>"
        : "") +
      "</div>";
    HUD.bnTitle = HUD.banner.querySelector(".hud-bn-title");
    H.setText(
      HUD.bnTitle,
      bannerCur.title.slice(0, Math.ceil(bannerCur.typed)),
    );
    void HUD.banner.offsetWidth;
    HUD.banner.classList.add("in");
    H.sfx(bannerCur.sound || "ui_type", {
      volume: bannerCur.sound ? 0.8 : 0.4,
    });
  }

  // Location name (upper centre)
  let locT = 0;
  let locHeld = null; // a location name waiting for the banner above it to finish
  function showLocationName(name, sub) {
    if (!name) return;
    if (bannerBusy()) {
      locHeld = { name, sub, age: 0 };
      return;
    }
    locHeld = null;
    HUD.locName.innerHTML =
      '<div class="hud-ln-main">' +
      H.esc(H.up(name)) +
      "</div>" +
      (sub ? '<div class="hud-ln-sub">' + H.esc(H.up(sub)) + "</div>" : "");
    HUD.locName.classList.remove("in");
    void HUD.locName.offsetWidth;
    HUD.locName.classList.add("in");
    locT = 3.6;
  }

  // Promotion notice (level up)
  function showLevelNote(level) {
    const lv = Number(level) || H.level();
    banners.unshift({
      kind: "level",
      title: "PROMOTION",
      sub: "Level " + lv + " reached",
      sound: "levelup",
      extra: G.SMOKE ? "" : "New talent available",
      life: 4.8,
    });
  }

  // ------------------------------------------------------------------
  // Quest helpers (adapting to whatever shape the quests module uses)
  // ------------------------------------------------------------------
  function questName(q) {
    if (!q) return "";
    if (typeof q === "string") {
      const d = H.call("quests", "get", [q], null);
      return (d && d.name) || q;
    }
    return q.name || q.title || q.id || "";
  }
  function stageText(q, stage) {
    if (stage && typeof stage === "object" && stage.text)
      return typeof stage.text === "function"
        ? String(stage.text())
        : stage.text;
    if (q && q.stageText && (!stage || stage === q.stage)) return q.stageText;
    if (!stage && q) stage = q.stage || q.currentStage;
    if (stage && typeof stage === "object")
      return stage.text || stage.desc || "";
    if (q && q.stages && stage !== undefined) {
      const s = q.stages.find((x) => x.id === stage);
      if (s) return typeof s.text === "function" ? s.text() : s.text;
    }
    return "";
  }
  H.questName = questName;
  H.stageText = stageText;

  // ------------------------------------------------------------------
  // Event wiring
  // ------------------------------------------------------------------
