/* src/ui_hud/20_hud.js */
/* =====================================================================
 * NEW RAD CITY — UI_HUD : IN-GAME HUD (the goggles' passive overlay)
 *
 * Style 01 "Blue first, red for alerts": VIGIL blue readouts (no screen
 * corner brackets); red only for warnings and the objective:
 *   top-left     : ring minimap (heading-up, compass ring, objective,
 *                  hostiles, places) — replaces any compass strip
 *   top-centre   : notifications that type out line by line; below them
 *                  bracketed banners (quest added / completed, discovered,
 *                  location cleared, promotion)
 *   top-right    : objective tracker with distance + bearing
 *   bottom-left  : segmented health bar, radiation tick-gauge, XP ticker
 *   bottom-right : ammo in large digits, weapon name, condition ticks
 *   centre       : ring crosshair (red centre dot), hit marker,
 *                  interaction prompt, stealth state, damage arcs
 *   bottom-centre: target name + health
 * Warnings red.  No action-point bar.  Everything (incl. the typed
 * notification layer) lives in #hud-layer (H.root) — one container
 * for a later screen-wide (lens) effect.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const H = G.hud._;

  const HUD = {}; // DOM refs + runtime state
  H.HUD = HUD;
  const HP_SEGS = 16,
    RAD_TICKS = 20;

  // ------------------------------------------------------------------
  // DOM construction
  // ------------------------------------------------------------------
  function build() {
    const root = H.el("div", "hud-root passthrough", H.root);
    HUD.root = root;

    // screen-space effects (lowest)
    HUD.vignette = H.el("div", "hud-vignette", root);
    HUD.dmgFlash = H.el("div", "hud-dmgflash", root);
    HUD.radGlow = H.el("div", "hud-radglow", root);

    // centre cluster
    const c = H.el("div", "hud-center", root);
    HUD.cross = H.el(
      "div",
      "hud-cross",
      c,
      '<i class="ring"></i><i class="dot"></i>',
    );
    HUD.hit = H.el("div", "hud-hitmark", c, "<i></i><i></i><i></i><i></i>");
    HUD.dmgDir = H.el("div", "hud-dmgdir", c);
    HUD.sneak = H.el("div", "hud-sneak", c);
    HUD.prompt = H.el("div", "hud-prompt", c);

    // target (bottom centre)
    HUD.enemy = H.el(
      "div",
      "hud-enemy",
      root,
      '<div class="hud-enemy-name"></div><div class="hud-enemy-bar"><div class="hud-lag"></div><div class="hud-fill"></div></div>',
    );
    HUD.enemyName = HUD.enemy.querySelector(".hud-enemy-name");
    HUD.enemyFill = HUD.enemy.querySelector(".hud-fill");
    HUD.enemyLag = HUD.enemy.querySelector(".hud-lag");

    // bottom-left: XP ticker, health, radiation
    const bl = H.el("div", "hud-bl", root);
    HUD.bl = bl;
    HUD.xp = H.el("div", "hud-xp", bl);
    let segs = "";
    for (let i = 0; i < HP_SEGS; i++) segs += "<i></i>";
    HUD.hpRow = H.el(
      "div",
      "hud-hp",
      bl,
      '<div class="hud-cap"><span class="hud-lbl">VITALS</span><span class="hud-hpnum"></span></div><div class="hud-segs">' +
        segs +
        "</div>",
    );
    HUD.hpSegs = Array.from(HUD.hpRow.querySelectorAll(".hud-segs i"));
    HUD.hpNum = HUD.hpRow.querySelector(".hud-hpnum");
    let ticks = "";
    for (let i = 0; i < RAD_TICKS; i++) ticks += "<i></i>";
    HUD.radRow = H.el(
      "div",
      "hud-dose",
      bl,
      '<div class="hud-cap"><span class="hud-lbl">RAD</span><span class="hud-radnum"></span><span class="hud-radplus">+RAD</span></div><div class="hud-ticks">' +
        ticks +
        "</div>",
    );
    HUD.radTicks = Array.from(HUD.radRow.querySelectorAll(".hud-ticks i"));
    HUD.radNum = HUD.radRow.querySelector(".hud-radnum");
    HUD.radPlus = HUD.radRow.querySelector(".hud-radplus");
    HUD.status = H.el("div", "hud-statusline", bl);

    // bottom-right: weapon + ammo
    const br = H.el("div", "hud-br", root);
    HUD.br = br;
    HUD.wpnName = H.el("div", "hud-wpnname", br);
    HUD.ammo = H.el(
      "div",
      "hud-ammo",
      br,
      '<span class="hud-mag">--</span><span class="hud-res"></span>',
    );
    HUD.mag = HUD.ammo.querySelector(".hud-mag");
    HUD.res = HUD.ammo.querySelector(".hud-res");
    let ct = "";
    for (let i = 0; i < 10; i++) ct += "<i></i>";
    HUD.cnd = H.el(
      "div",
      "hud-cnd",
      br,
      '<span class="hud-lbl">COND</span><span class="hud-cticks">' +
        ct +
        "</span>",
    );
    HUD.cndTicks = Array.from(HUD.cnd.querySelectorAll(".hud-cticks i"));

    // top-left: ring minimap
    const tl = H.el("div", "hud-tl", root);
    HUD.mm = H.el("canvas", "hud-minimap", tl);
    HUD.mmCtx = HUD.mm.getContext("2d");
    HUD.mmHead = H.el("div", "hud-mmhead", tl);

    // top-right: objective tracker
    HUD.obj = H.el(
      "div",
      "hud-obj",
      root,
      '<div class="hud-obj-h">OBJECTIVE &middot; <span class="hud-obj-q"></span></div><div class="hud-obj-t"></div>' +
        '<div class="hud-obj-d"><span class="hud-obj-arrow">&#9650;</span><span class="hud-obj-m"></span><span class="hud-obj-dir"></span></div>',
    );
    HUD.objQ = HUD.obj.querySelector(".hud-obj-q");
    HUD.objT = HUD.obj.querySelector(".hud-obj-t");
    HUD.objArrow = HUD.obj.querySelector(".hud-obj-arrow");
    HUD.objM = HUD.obj.querySelector(".hud-obj-m");
    HUD.objDir = HUD.obj.querySelector(".hud-obj-dir");

    // top-centre: typed notifications live on their own layer (shown in 'play' only); it stays inside
    // #hud-layer so the whole HUD stays in one container
    HUD.top = H.el("div", "hud-root hud-top passthrough", H.root);
    HUD.notify = H.el("div", "hud-notify", HUD.top);
    HUD.banner = H.el("div", "hud-banner", root);
    HUD.locName = H.el("div", "hud-locname", root);
    HUD.lockHint = H.el("div", "hud-lockhint", root, "[ CLICK TO RESUME ]");
    HUD.overenc = H.el("div", "hud-overenc", root, "OVERLOADED");

    resizeMinimap();
    G.events.on("resize", resizeMinimap);
  }

  // ------------------------------------------------------------------
  // Notifications (top centre) — strict FIFO, typed out
  //   * at most 2 lines on screen (1 while a banner is up), ~3 s each,
  //     entries staggered 0.6 s apart; each line types in at ~70 chars/s
  //   * only live in 'play': any menu / overlay state hides the layer,
  //     freezes the visible lines and queues new ones; the queue flushes
  //     (coalesced) once play resumes
  //   * tutorial hints wait while a banner is showing; everything waits
  //     while the PROMOTION banner plays
  //   * "+N XP" lines go to the XP ticker (bottom-left)
  //   * messages raised *inside* the goggles show in a small message box
  //     on the readout instead
  // ------------------------------------------------------------------
  const queue = []; // pending {text, opts, count}
  const active = []; // on screen {el, t, life, text, leaving}
  const MAX_VISIBLE = 2;
  const STAGGER = 0.6;
  const TYPE_CPS = 70;
  let noteGap = 0; // seconds until the next line may enter
  let resumeT = 0; // grace after returning to play
  const XP_RE = /^\+\s*(\d+)\s*XP\b[.!]?\s*(.*)$/i;
  const ITEM_RE = /^(.*?)(?: \((\d+)\))? added\.$/;
  const SKILL_RE = /^(.*?) increased to (\d+)\.$/;
  const ICON_BY_KIND = {
    item: "item",
    item_removed: "item",
    radiation: "radiation",
    addiction: "warn",
    limb: "heal",
    crime: "sneak",
    effect: "effect",
    standing: "standing",
    quest: "quest",
    autosave: "save",
    xp: "level",
    code: "code",
    key: "key",
    skill: "skill",
    talent: "talent",
  };
  const NEED_ICON = {
    hunger: "food",
    food: "food",
    thirst: "drink",
    water: "drink",
    dehydration: "drink",
    sleep: "sleep",
    fatigue: "sleep",
  };
  function noteIcon(text, opts) {
    if (opts.icon || opts.glyph || opts.pose)
      return opts.icon || opts.glyph || opts.pose;
    const k = opts.kind;
    if (k === "need") return NEED_ICON[opts.need] || "warn";
    if (k && ICON_BY_KIND[k]) return ICON_BY_KIND[k];
    if (opts.hint || opts.tutorial) return "hint";
    if (opts.sub) return "quest"; // quest objective lines carry the quest name as sub
    if (isWarn(text, opts)) return "warn";
    if (/\b(saved|repaired|unlocked|acquired|joined|opened)\b/i.test(text))
      return "check";
    return "info";
  }
  function isWarn(text, opts) {
    return (
      opts.color === "red" ||
      /\b(can't|cannot|can not|don't have|caught|failed|is locked|it's locked|broke|no longer|too heavy|overloaded)\b/i.test(
        text,
      )
    );
  }
  const isHint = (n) => !!(n.opts.hint || n.opts.tutorial);
  function itemLine(n) {
    return (
      n.itemName + (n.itemCount > 1 ? " (" + n.itemCount + ")" : "") + " added."
    );
  }

  function pushNotify(text, opts) {
    if (!text) return;
    opts = opts || {};
    text = String(text);
    const xm = XP_RE.exec(text);
    if (xm) {
      onXP(Number(xm[1]), xm[2] || opts.sub || "");
      return;
    }
    if (HUD.autosaving && /^Game saved\.?$/i.test(text)) return; // the autosave has its own line
    // inside the goggles: a message box on the readout (never over the tabs)
    if (G.state === "goggles" && ggMsg(text, opts)) return;
    // "X added." for the same item merges into one line with a running count
    const im = opts.kind === "item" ? ITEM_RE.exec(text) : null;
    if (im) {
      const cnt = Number(im[2]) || Number(opts.count) || 1;
      const key = opts.id || im[1];
      const hit =
        active.find((a) => a.itemKey === key && !a.leaving) ||
        queue.find((q) => q.itemKey === key);
      if (hit) {
        hit.itemCount += cnt;
        hit.text = itemLine(hit);
        if (hit.el) {
          hit.t = Math.min(hit.t, 0.6);
          hit.typed = hit.text.length;
          renderNote(hit);
        }
        return;
      }
      const n = {
        text,
        opts,
        count: 1,
        itemKey: key,
        itemName: im[1],
        itemCount: cnt,
      };
      n.text = itemLine(n);
      queue.push(n);
      return;
    }
    const same =
      active.find((a) => a.text === text && !a.leaving) ||
      queue.find((q) => q.text === text);
    if (same) {
      same.count = (same.count || 1) + 1;
      if (same.el) {
        same.t = Math.min(same.t, 0.6);
        renderNote(same);
      }
      return;
    }
    queue.push({ text, opts, count: 1 });
  }

  /** After a menu the backlog can hold many "X added." / "Skill increased" lines: fold them into one. */
  function coalesce(n) {
    if (n.itemKey) {
      const more = queue.filter((q) => q.itemKey);
      if (more.length < 2) return n;
      for (const q of more) queue.splice(queue.indexOf(q), 1);
      const all = [n].concat(more);
      const names = all.map(
        (q) => q.itemName + (q.itemCount > 1 ? " (" + q.itemCount + ")" : ""),
      );
      const shown = names.slice(0, 2).join(", ");
      const text =
        names.length <= 3
          ? names.join(", ") + " added."
          : shown + " and " + (names.length - 2) + " other items added.";
      return {
        text,
        opts: {
          kind: "item",
          sub:
            names.length > 3
              ? names.slice(2, 6).join(" · ") + (names.length > 6 ? " …" : "")
              : "",
        },
        count: 1,
      };
    }
    if (n.opts.kind === "skill") {
      const more = queue.filter((q) => q.opts.kind === "skill");
      if (more.length < 2) return n;
      for (const q of more) queue.splice(queue.indexOf(q), 1);
      const parts = [n].concat(more).map((q) => {
        const m = SKILL_RE.exec(q.text);
        return m ? m[1] + " " + m[2] : q.text.replace(/\.$/, "");
      });
      return {
        text: "Skills increased.",
        opts: { kind: "skill", sub: parts.join(" · ") },
        count: 1,
      };
    }
    return n;
  }

  function renderNote(n) {
    const cnt = n.count > 1 ? " (" + n.count + ")" : "";
    if (!n.built) {
      n.built = true;
      n.el.innerHTML =
        '<span class="hud-nicon">' +
        H.glyph(noteIcon(n.text, n.opts)) +
        '</span><span class="hud-nbody"><span class="hud-ntext"></span><span class="hud-ncur">&#9608;</span>' +
        (n.opts.sub ? '<span class="hud-nsub"></span>' : "") +
        "</span>";
      n.tEl = n.el.querySelector(".hud-ntext");
      n.sEl = n.el.querySelector(".hud-nsub");
    }
    const full = H.up(n.text) + cnt;
    H.setText(n.tEl, full.slice(0, Math.floor(n.typed)));
    if (n.sEl) H.setText(n.sEl, n.typed >= full.length ? H.up(n.opts.sub) : "");
    H.toggle(n.el, "typing", n.typed < full.length);
  }
  function showNote(n) {
    n.el = H.el(
      "div",
      "hud-note" +
        (isWarn(n.text, n.opts) ? " warn" : "") +
        (isHint(n) ? " hint" : ""),
      HUD.notify,
    );
    n.t = 0;
    n.typed = 0;
    const len = n.text.length + (n.opts.sub ? n.opts.sub.length * 0.5 : 0);
    n.life =
      n.opts.duration ||
      (isHint(n) ? 6.5 : 3.2 + Math.min(3.2, Math.max(0, len - 36) / 30));
    renderNote(n);
    requestAnimationFrame(() => n.el && n.el.classList.add("in"));
    active.push(n);
    H.sfx(n.opts.sound || "ui_type", { volume: n.opts.sound ? 0.7 : 0.35 });
  }
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
  function wire() {
    const on = G.events.on;
    on("notify", (text, opts) => pushNotify(text, opts));
    on("xpGained", (n, reason) => onXP(n, reason));
    on("questStarted", (q) => {
      pushBanner({
        kind: "quest",
        title: "Quest added",
        sub: questName(q),
        sound: "quest_start",
      });
      const t = stageText(q);
      if (t) pushNotify(t, { kind: "quest", sub: questName(q) });
    });
    on("questUpdated", (q, stage) => {
      const t = stageText(q, stage);
      if (t) pushNotify(t, { kind: "quest", sub: questName(q) });
    });
    on("questCompleted", (q) => {
      const r = q && q.rewards;
      let extra = "";
      if (r) {
        const parts = [];
        if (r.xp) parts.push("+" + r.xp + " XP");
        const m = r.scrip || r.money;
        if (m) parts.push(m + " Scrip");
        extra = parts.join("   ");
      }
      pushBanner({
        kind: "quest done",
        title: "Quest completed",
        sub: questName(q),
        extra,
        life: 5,
        sound: "quest_complete",
      });
    });
    on("questFailed", (q) =>
      pushBanner({
        kind: "quest fail",
        title: "Quest failed",
        sub: questName(q),
        sound: "ui_error",
      }),
    );
    on("locationDiscovered", (l) => {
      // no banners for discoveries fired during load / title flyover / new game / save restore
      if (
        G.state === "title" ||
        G.state === "loading" ||
        G.state === "chargen" ||
        G.state === "intro" ||
        HUD.restoreT > 0
      ) {
        HUD.lastLoc = l && l.id;
        return;
      }
      pushBanner({
        kind: "disc",
        title: "Location discovered",
        sub: (l && l.name) || "Unknown location",
        sound: "discover_location",
        life: 3.8,
      });
      HUD.lastLoc = l && l.id;
      HUD.locSuppress = 5;
    });
    // combat: every hostile of a location's group is dead (re-armed when it respawns)
    on("locationCleared", (l) => {
      if (
        !l ||
        HUD.restoreT > 0 ||
        G.state === "title" ||
        G.state === "loading"
      )
        return;
      pushBanner({
        kind: "disc cleared",
        title: "Location cleared",
        sub: l.name || "Unknown location",
        sound: "quest_update",
        life: 3.4,
      });
    });
    // codes learned: the locks module raises its own 'Code logged' line (kind 'code' → code glyph)
    on("levelUp", (level) => {
      showLevelNote(level);
    });
    on("playerDamaged", onDamaged);
    on("actorDamaged", (actor, amt, info) => {
      if (isPlayerSource(info)) {
        hitMark(false);
        if (info && info.part === "head") H.stats.headshots++;
        if (info && info.crit) H.stats.crits++;
      }
    });
    on("actorKilled", (actor, killer) => {
      if (
        killer === "player" ||
        killer === G.player ||
        (killer && killer.isPlayer)
      )
        hitMark(true);
    });
    on("weaponFired", () => {
      HUD.bloom = Math.min(1, (HUD.bloom || 0) + 0.45);
    });
    on("doorTransition", (def) => {
      HUD.locSuppress = 0.8;
      const p = def && def.target;
      if (p && G.LAYOUT.isInterior(p.x))
        setTimeout(() => showLocationName(H.placeName()), 700);
      else
        setTimeout(() => {
          HUD.lastLoc = null;
        }, 700);
      HUD.mmInterior = null;
    });
    on("reset", () => {
      clearNotify();
      banners.length = 0;
      bannerCur = null;
      HUD.banner.classList.remove("in");
      HUD.locName.classList.remove("in");
      locT = 0;
      locHeld = null;
      xpT = 0;
      xpAcc = 0;
      HUD.xp.classList.remove("in");
      ggQ.length = 0;
      ggCur = null;
      HUD.dirs.length = 0;
      HUD.dmgDir.innerHTML = "";
    });
    on("newGame", () => {
      HUD.lastLoc = null;
      HUD.locSuppress = 3;
      HUD.restoreT = 1.0;
    });
    on("playerDied", () => {
      HUD.deathT = 0;
      clearNotify();
      banners.length = 0;
      bannerCur = null;
      HUD.banner.classList.remove("in");
      HUD.locName.classList.remove("in");
      locT = 0;
      xpT = 0;
      HUD.xp.classList.remove("in");
    });
    on("loaded", () => {
      HUD.lastLoc = null;
      HUD.locSuppress = 3;
      HUD.restoreT = 1.0;
    });
  }
  function isPlayerSource(info) {
    if (!info) return false;
    const s =
      info.source !== undefined
        ? info.source
        : info.from !== undefined
          ? info.from
          : info.attacker;
    return s === "player" || s === G.player || (s && s.isPlayer === true);
  }

  // Damage direction arcs + flash
  HUD.dirs = [];
  function onDamaged(amount, info) {
    info = info || {};
    // the atmosphere post-FX already renders a red edge flash on damage; ours is the fallback
    if (!postFxOwnsScreenFx()) {
      const flash = H.clamp(0.25 + amount / 40, 0.25, 0.85);
      HUD.dmgFlash.style.transition = "none";
      HUD.dmgFlash.style.opacity = String(flash);
      requestAnimationFrame(() => {
        HUD.dmgFlash.style.transition = "opacity 0.6s ease-out";
        HUD.dmgFlash.style.opacity = "0";
      });
    }
    const src = info.source || info.from || info.attacker || null;
    let p = null;
    if (src && src.pos) p = src.pos;
    else if (src && src.x !== undefined) p = src;
    else if (info.origin) p = info.origin;
    else if (info.pos) p = info.pos;
    if (
      !p ||
      src === "player" ||
      info.type === "fall" ||
      info.type === "radiation"
    )
      return;
    const el = H.el("div", "hud-dir", HUD.dmgDir, "<i></i>");
    HUD.dirs.push({ el, p: { x: p.x, z: p.z }, t: 0, life: 1.6, amt: amount });
    if (HUD.dirs.length > 6) {
      const o = HUD.dirs.shift();
      o.el.remove();
    }
  }
  function updateDirs(realDt) {
    const P = G.player;
    for (let i = HUD.dirs.length - 1; i >= 0; i--) {
      const d = HUD.dirs[i];
      d.t += realDt;
      if (d.t > d.life) {
        d.el.remove();
        HUD.dirs.splice(i, 1);
        continue;
      }
      const yawTo = Math.atan2(-(d.p.x - P.pos.x), -(d.p.z - P.pos.z));
      const rel = G.util.wrapAngle(yawTo - P.yaw);
      d.el.style.transform = "rotate(" + (-rel * 57.2958).toFixed(1) + "deg)";
      d.el.style.opacity = String(H.clamp((1 - d.t / d.life) * 1.4, 0, 1));
    }
  }

  // Hit marker
  let hitT = 0;
  function hitMark(kill) {
    hitT = kill ? 0.35 : 0.14;
    HUD.hit.classList.toggle("kill", !!kill);
    HUD.hit.classList.add("on");
  }

  // ------------------------------------------------------------------
  // Per-frame readouts
  // ------------------------------------------------------------------
  function updateBars() {
    const P = G.player;
    const hp = H.pct(P.hp, P.maxHp);
    const on = Math.ceil(hp * HP_SEGS - 0.001);
    if (HUD.hpOn !== on) {
      HUD.hpOn = on;
      HUD.hpSegs.forEach((s, i) => s.classList.toggle("on", i < on));
    }
    H.setText(
      HUD.hpNum,
      Math.max(0, Math.round(P.hp)) + " / " + Math.round(P.maxHp),
    );
    H.toggle(HUD.hpRow, "low", hp < 0.5);
    H.toggle(HUD.hpRow, "crit", hp < 0.25);

    // radiation dose: thin segmented bar 0..1000, filled red, brighter past 600
    const dose = H.radsOf(),
      rate = P.radRate || 0;
    const ton = Math.min(
      RAD_TICKS,
      Math.ceil(H.clamp(dose / 1000, 0, 1) * RAD_TICKS - 0.001),
    );
    if (HUD.radOn !== ton) {
      HUD.radOn = ton;
      HUD.radTicks.forEach((t, i) => {
        t.classList.toggle("on", i < ton);
        t.classList.toggle("hot", i < ton && i >= RAD_TICKS * 0.6);
      });
    }
    H.setText(HUD.radNum, String(Math.round(dose)));
    H.toggle(HUD.radRow, "active", rate > 0.01);
    H.toggle(HUD.radPlus, "on", rate > 0.01);
    H.toggle(HUD.radRow, "dim", dose < 0.5 && rate <= 0.01);
    const fxOwned = postFxOwnsScreenFx();
    H.setStyle(
      HUD.radGlow,
      "opacity",
      fxOwned ? "0" : String(H.clamp(rate / 8, 0, 0.5).toFixed(2)),
    );

    // low-health vignette (the atmosphere post-FX, when on, owns the main effect)
    let low = P.alive ? H.clamp((0.4 - hp) / 0.4, 0, 1) : 0.8;
    if (fxOwned) low *= 0.3;
    H.setStyle(HUD.vignette, "opacity", low.toFixed(2));
    H.toggle(HUD.vignette, "on", low > 0.01);
    H.toggle(HUD.vignette, "crit", hp < 0.15);

    // weapon: ammo + condition
    const cur = H.call("weapons", "current", [], null);
    const holstered = H.call("weapons", "isHolstered", [], false);
    let showAmmo = false,
      showCnd = false,
      wname = "";
    if (cur && cur.id && !holstered) {
      const def = cur.def || H.call("items", "get", [cur.id], null) || {};
      wname = def.name || H.itemName(cur.id);
      const w = cur.weapon || def.weapon || {};
      const usesAmmo = !!w.ammo && (w.magSize || 0) > 0;
      if (usesAmmo) {
        showAmmo = true;
        const mag =
          cur.ammoInMag !== undefined
            ? cur.ammoInMag
            : H.call("weapons", "ammoInMag", [], 0);
        const reserve = H.call("inventory", "count", [w.ammo], 0);
        H.setText(HUD.mag, String(mag));
        H.setText(HUD.res, "/" + reserve);
        H.toggle(HUD.ammo, "empty", mag <= 0);
        H.toggle(
          HUD.ammo,
          "low",
          mag > 0 && w.magSize > 2 && mag <= Math.ceil(w.magSize * 0.25),
        );
      } else if (/grenade|mine/.test(String(cur.id))) {
        showAmmo = true;
        H.setText(HUD.mag, String(H.call("inventory", "count", [cur.id], 0)));
        H.setText(HUD.res, "");
        H.toggle(HUD.ammo, "empty", false);
        H.toggle(HUD.ammo, "low", false);
      }
      let cnd = cur.condition;
      if (cnd === undefined && def.hasCondition !== false && !def.noCondition)
        cnd = H.call("inventory", "condition", [cur.id], undefined);
      if (typeof cnd === "number" && !/unarmed|fists?$/.test(String(cur.id))) {
        showCnd = true;
        if (cnd > 1.001) cnd /= 100;
        const n = Math.ceil(H.clamp(cnd, 0, 1) * 10 - 0.001);
        if (HUD.cndOn !== n) {
          HUD.cndOn = n;
          HUD.cndTicks.forEach((t, i) => t.classList.toggle("on", i < n));
        }
        H.toggle(HUD.cnd, "low", cnd < 0.25);
      }
    }
    H.setText(HUD.wpnName, H.up(wname));
    H.show(HUD.ammo, showAmmo);
    H.show(HUD.cnd, showCnd);
    H.toggle(HUD.br, "off", !wname);

    // status line: lamp, stealth, overloaded
    const over = !!(G.player.isOverencumbered && G.player.isOverencumbered());
    H.toggle(HUD.overenc, "on", over);
    const bits = [];
    if (G.player.lightOn) bits.push("LAMP");
    if (P.sneaking) bits.push("CROUCHED");
    H.setText(HUD.status, bits.join("  ·  "));
  }

  /** True when the atmosphere module's post-processing pass draws the hurt/damage/radiation screen effects. */
  let fxOwnPoll = 0,
    fxOwnV = false;
  function postFxOwnsScreenFx() {
    if (fxOwnPoll-- > 0) return fxOwnV;
    fxOwnPoll = 30;
    fxOwnV = !G.isStub("atmos") && !!H.call("atmos", "isPostFX", [], false);
    return fxOwnV;
  }

  // Crosshair, prompt, target bar, stealth
  let targetPoll = 0,
    lastTarget = null,
    enemyLagV = 1,
    enemyShowT = 0;
  function updateCenter(realDt) {
    const I = G.input;
    const f = G.world.getFocusLabel ? G.world.getFocusLabel() : null;
    // build the prompt markup only when the focus changes
    const fkey = f
      ? (f.label || "") +
        "|" +
        (f.verb || "") +
        "|" +
        (f.locked || "") +
        "|" +
        !!(G.world.focus && (G.world.focus.owned || G.world.focus.steal))
      : "";
    if (fkey !== HUD.promptKey) {
      HUD.promptKey = fkey;
      let promptHTML = "";
      if (f) {
        const label = f.label ? String(f.label) : "";
        const verb = f.verb || "Activate";
        const steal =
          /^steal/i.test(verb) ||
          (G.world.focus && (G.world.focus.owned || G.world.focus.steal));
        let lock = "";
        if (f.locked)
          lock = typeof f.locked === "number" ? "Locked" : String(f.locked);
        promptHTML =
          (label
            ? '<div class="hud-pr-label">' + H.esc(H.up(label)) + "</div>"
            : "") +
          '<div class="hud-pr-verb' +
          (steal ? " steal" : "") +
          '"><span class="hud-key">E</span>' +
          H.esc(H.up(verb)) +
          "</div>" +
          (lock
            ? '<div class="hud-pr-lock">' +
              H.glyph("lock") +
              " " +
              H.esc(H.up(lock)) +
              "</div>"
            : "");
      }
      H.setHTML(HUD.prompt, promptHTML);
      H.toggle(HUD.prompt, "on", !!f);
    }

    // target under the crosshair (throttled)
    targetPoll -= realDt;
    if (targetPoll <= 0) {
      targetPoll = 0.08;
      const t = H.call("combat", "targetUnderCrosshair", [], null);
      const a = t && t.actor;
      if (a && !a.dead && a.hp > 0) {
        lastTarget = a;
        enemyShowT = 1.2;
      } else if (lastTarget && lastTarget.dead) {
        enemyShowT = Math.min(enemyShowT, 0.5);
      }
    }
    enemyShowT -= realDt;
    const a = lastTarget;
    const showEnemy = !!(a && enemyShowT > 0);
    if (showEnemy) {
      const frac = H.pct(Math.max(0, a.hp), a.maxHp || 100);
      let hostile = false;
      try {
        hostile = typeof a.hostile === "function" ? a.hostile() : !!a.hostile;
      } catch (e) {
        hostile = false;
      }
      H.setText(
        HUD.enemyName,
        H.up((a.name || a.type || "Unknown").toString().replace(/_/g, " ")),
      );
      H.setStyle(HUD.enemyFill, "width", (frac * 100).toFixed(1) + "%");
      if (HUD._enemyRef !== a) {
        HUD._enemyRef = a;
        enemyLagV = frac;
      }
      enemyLagV =
        frac > enemyLagV
          ? frac
          : H.lerp(enemyLagV, frac, 1 - Math.exp(-3 * realDt));
      H.setStyle(HUD.enemyLag, "width", (enemyLagV * 100).toFixed(1) + "%");
      H.toggle(HUD.enemy, "hostile", hostile);
      H.toggle(HUD.cross, "enemy", hostile && enemyShowT > 1.0);
    } else H.toggle(HUD.cross, "enemy", false);
    H.toggle(HUD.enemy, "on", showEnemy);

    // crosshair spread
    const P = G.player;
    const aiming =
      I.action("aim") && !H.call("weapons", "isHolstered", [], false);
    HUD.bloom = Math.max(0, (HUD.bloom || 0) - realDt * 2.2);
    const spread =
      H.clamp(P.moveSpeed / 7, 0, 1) * 9 +
      (P.onGround ? 0 : 8) +
      HUD.bloom * 12 -
      (P.sneaking ? 2 : 0);
    H.setStyle(HUD.cross, "--gap", (6 + spread).toFixed(1) + "px");
    H.toggle(HUD.cross, "interact", !!f);
    H.toggle(HUD.cross, "hidden", !H.settings.crosshair || (aiming && !f));

    if (hitT > 0) {
      hitT -= realDt;
      if (hitT <= 0) HUD.hit.classList.remove("on");
    }

    // stealth state
    if (P.sneaking) {
      let det = H.call("combat", "detection", [], "hidden");
      det = String(det || "hidden").toLowerCase();
      H.setText(HUD.sneak, "[ " + det.toUpperCase() + " ]");
      HUD.sneak.className = "hud-sneak on " + det;
    } else if (HUD.sneak.className !== "hud-sneak")
      HUD.sneak.className = "hud-sneak";
  }

  // ------------------------------------------------------------------
  // Ring minimap (heading-up)
  // ------------------------------------------------------------------
  const MM = { css: 190, zoom: 0.68 }; // css px; px per metre
  function resizeMinimap() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const s = window.innerWidth < 700 ? 132 : MM.css;
    HUD.mm.width = s * dpr;
    HUD.mm.height = s * dpr;
    HUD.mm.style.width = s + "px";
    HUD.mm.style.height = s + "px";
    HUD.mmS = s;
    HUD.mmDpr = dpr;
    HUD.mmDirty = true;
    // resizing clears the canvas: redraw right away (review shots resize after the frame loop has stopped)
    if (G.player && G.state === "play") {
      try {
        drawMinimap();
      } catch (e) {
        /* first frame */
      }
    }
  }
  let markerPoll = 0,
    markerCache = [];
  function collectMarkers() {
    const P = G.player,
      L = G.LAYOUT;
    const out = [];
    const inside = L.isInterior(P.pos.x);
    const qm = H.call("quests", "activeMarkers", [], []) || [];
    const tracked = H.call("quests", "tracked", [], null);
    const trackedId = tracked && (tracked.id || tracked);
    for (const m of qm) {
      if (!m || m.x === undefined) continue;
      if (inside !== L.isInterior(m.x)) continue; // quests resolve door-aware markers themselves
      out.push({
        kind: "quest",
        x: m.x,
        z: m.z,
        tracked: !trackedId || m.questId === trackedId,
        label: m.label,
      });
    }
    if (!inside && H.settings.minimapLocations) {
      for (const l of L.LOCATIONS) {
        if (l.interior) continue;
        const d = Math.hypot(l.x - P.pos.x, l.z - P.pos.z);
        if (d > 260 || d < 6) continue;
        out.push({
          kind: "loc",
          x: l.x,
          z: l.z,
          icon: H.locIconKind ? H.locIconKind(l) : null,
          disc: !!(G.discovered && G.discovered.has(l.id)),
          d,
        });
      }
    }
    // Hostiles: Senses sets how far they register (unaware ones only inside 55 % of that range)
    if (H.has("actors", "list")) {
      const sen = H.clamp(Number(H.RPG ? H.RPG.attr("senses") : 5) || 5, 1, 10);
      const range = 20 + sen * 10;
      HUD.enemyRange = range;
      const list = H.call("actors", "list", [], []) || [];
      for (const a of list) {
        if (!a || a.dead || !a.pos || a.inScene === false || a.burrowed)
          continue;
        const d = Math.hypot(a.pos.x - P.pos.x, a.pos.z - P.pos.z);
        if (d > range) continue;
        let hostile = false;
        try {
          hostile = typeof a.hostile === "function" ? a.hostile() : !!a.hostile;
        } catch (e) {
          /* ignore */
        }
        if (hostile) {
          const st = String(a.aiState || a.state || a.mode || "");
          const alerted =
            /combat|attack|alert|search|chase/.test(st) ||
            a.inCombat ||
            a.alerted ||
            a.detectedPlayer ||
            (a.awareness || 0) > 0.2;
          if (alerted || d < range * 0.55)
            out.push({
              kind: "enemy",
              x: a.pos.x,
              z: a.pos.z,
              d,
              alerted: !!alerted,
            });
        } else if (
          d < 40 &&
          (a.following === "player" || a.companion || (a.td && a.td.human))
        )
          out.push({ kind: "friend", x: a.pos.x, z: a.pos.z, d });
      }
    }
    out.sort((a, b) => (a.kind === "quest") - (b.kind === "quest"));
    return out;
  }
  function rgba(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return (
      "rgba(" +
      ((n >> 16) & 255) +
      "," +
      ((n >> 8) & 255) +
      "," +
      (n & 255) +
      "," +
      a +
      ")"
    );
  }
  function drawMinimap() {
    const cv = HUD.mm,
      g = HUD.mmCtx,
      dpr = HUD.mmDpr,
      S = HUD.mmS;
    const P = G.player,
      col = H.tint().c;
    const W = S * dpr,
      c = W / 2,
      R = W / 2 - 13 * dpr,
      Rin = R - 1.5 * dpr;
    const zoom = MM.zoom * (S / MM.css) * dpr; // device px per metre
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, W, W);
    const inside = G.LAYOUT.isInterior(P.pos.x);
    // map disc
    g.save();
    g.beginPath();
    g.arc(c, c, Rin, 0, Math.PI * 2);
    g.clip();
    g.fillStyle = "rgba(3,8,12,0.62)";
    g.fillRect(0, 0, W, W);
    if (!inside && H.ggMapRaster) {
      const src = H.ggMapRaster(),
        ms = H.MAP_S,
        wd = G.LAYOUT.WORLD;
      const k = zoom / ms; // device px per raster px
      const rr = Rin / k + 4; // raster px radius needed
      const px = (P.pos.x - wd.minX) * ms,
        pz = (P.pos.z - wd.minZ) * ms;
      const sx = Math.max(0, px - rr),
        sy = Math.max(0, pz - rr),
        ex = Math.min(src.width, px + rr),
        ey = Math.min(src.height, pz + rr);
      g.translate(c, c);
      g.rotate(P.yaw);
      g.scale(k, k);
      g.globalAlpha = 0.95;
      if (ex > sx && ey > sy) {
        try {
          g.drawImage(
            src,
            sx,
            sy,
            ex - sx,
            ey - sy,
            sx - px,
            sy - pz,
            ex - sx,
            ey - sy,
          );
        } catch (e) {
          /* ignore */
        }
      }
      g.globalAlpha = 1;
    } else if (inside && H.ggDrawInterior) {
      // indoors: blueprint of the cell (refreshed a few times a second, blitted heading-up)
      if (!HUD.mmInterior) {
        HUD.mmInterior = document.createElement("canvas");
        HUD.mmInteriorT = 0;
      }
      const ic = HUD.mmInterior,
        isz = Math.ceil(Rin * 2.9);
      if (ic.width !== isz) {
        ic.width = ic.height = isz;
        HUD.mmInteriorT = 0;
      }
      if (HUD.mmInteriorT <= 0) {
        HUD.mmInteriorT = 0.25;
        ic._dpr = 1;
        try {
          H.ggDrawInterior(
            ic,
            { cx: P.pos.x, cz: P.pos.z, zoom: zoom * 2.2 },
            { minimal: true },
          );
        } catch (e) {
          H.warnOnce("minimap.interior", e);
        }
        HUD.mmIntPos = { x: P.pos.x, z: P.pos.z };
      }
      const z2 = zoom * 2.2,
        dx = (HUD.mmIntPos.x - P.pos.x) * z2,
        dz = (HUD.mmIntPos.z - P.pos.z) * z2;
      g.translate(c, c);
      g.rotate(P.yaw);
      g.drawImage(ic, -isz / 2 + dx, -isz / 2 + dz);
    }
    g.restore();
    // faint scan cross (no inner ring: it distracted from the map)
    g.lineWidth = 1 * dpr;
    g.strokeStyle = rgba(col, 0.1);
    g.beginPath();
    g.moveTo(c - Rin, c);
    g.lineTo(c + Rin, c);
    g.moveTo(c, c - Rin);
    g.lineTo(c, c + Rin);
    g.stroke();
    // markers (map space → heading-up screen)
    const zIn = inside ? zoom * 2.2 : zoom;
    const toScr = (x, z) => {
      const dx = (x - P.pos.x) * zIn,
        dz = (z - P.pos.z) * zIn;
      const cs = Math.cos(P.yaw),
        sn = Math.sin(P.yaw);
      return [c + dx * cs - dz * sn, c + dx * sn + dz * cs];
    };
    for (const m of markerCache) {
      let p = toScr(m.x, m.z);
      const dd = Math.hypot(p[0] - c, p[1] - c);
      const out = dd > Rin - 6 * dpr;
      if (out && m.kind !== "quest") continue;
      if (out) {
        const f = (Rin - 6 * dpr) / dd;
        p = [c + (p[0] - c) * f, c + (p[1] - c) * f];
      }
      if (m.kind === "enemy") {
        g.fillStyle = H.RED;
        g.globalAlpha = m.alerted ? 1 : 0.7;
        g.shadowColor = H.RED;
        g.shadowBlur = 5 * dpr;
        g.beginPath();
        g.arc(p[0], p[1], 2.6 * dpr, 0, Math.PI * 2);
        g.fill();
        g.shadowBlur = 0;
        g.globalAlpha = 1;
      } else if (m.kind === "friend") {
        g.strokeStyle = col;
        g.globalAlpha = 0.7;
        g.lineWidth = 1.2 * dpr;
        g.beginPath();
        g.arc(p[0], p[1], 2.4 * dpr, 0, Math.PI * 2);
        g.stroke();
        g.globalAlpha = 1;
      } else if (m.kind === "loc") {
        g.globalAlpha = m.disc ? 0.95 : 0.6;
        if (H.drawMapIcon)
          H.drawMapIcon(
            g,
            m.icon || "marker",
            p[0],
            p[1],
            0.72 * dpr,
            m.disc,
            col,
            "rgba(3,8,12,0.9)",
          );
        g.globalAlpha = 1;
      } else if (m.kind === "quest" && H.drawObjective) {
        H.drawObjective(
          g,
          p[0],
          p[1] - (out ? 0 : 5 * dpr),
          dpr * 0.85,
          m.tracked,
        );
      }
    }
    // player chevron (always pointing up)
    g.save();
    g.translate(c, c);
    g.shadowColor = col;
    g.shadowBlur = 6 * dpr;
    g.fillStyle = col;
    g.beginPath();
    g.moveTo(0, -7 * dpr);
    g.lineTo(5 * dpr, 6 * dpr);
    g.lineTo(0, 3 * dpr);
    g.lineTo(-5 * dpr, 6 * dpr);
    g.closePath();
    g.fill();
    g.restore();
    // compass ring: ticks every 10°, N/E/S/W on the rim
    g.save();
    g.translate(c, c);
    g.strokeStyle = col;
    g.fillStyle = col;
    g.shadowColor = rgba(col, 0.8);
    g.shadowBlur = 8 * dpr;
    g.lineWidth = 2 * dpr;
    g.beginPath();
    g.arc(0, 0, R, 0, Math.PI * 2);
    g.stroke();
    g.shadowBlur = 3 * dpr;
    g.shadowColor = col;
    g.lineWidth = 1.2 * dpr;
    g.font = "600 " + 10 * dpr + 'px "Share Tech Mono", monospace';
    g.textAlign = "center";
    g.textBaseline = "middle";
    const cs = Math.cos(P.yaw),
      sn = Math.sin(P.yaw);
    for (let deg = 0; deg < 360; deg += 10) {
      // compass heading (0 = N, 90 = E) → world direction (sin, -cos) → heading-up screen direction
      const d = (deg * Math.PI) / 180,
        wx = Math.sin(d),
        wz = -Math.cos(d);
      const ux = wx * cs - wz * sn,
        uy = wx * sn + wz * cs;
      if (deg % 90 === 0) {
        g.globalAlpha = deg === 0 ? 1 : 0.75;
        g.fillStyle = col;
        g.fillText(
          { 0: "N", 90: "E", 180: "S", 270: "W" }[deg],
          ux * (R + 7.5 * dpr),
          uy * (R + 7.5 * dpr),
        );
        g.fillStyle = col;
      } else {
        const len = (deg % 30 === 0 ? 5 : 3) * dpr;
        g.globalAlpha = deg % 30 === 0 ? 0.8 : 0.4;
        g.beginPath();
        g.moveTo(ux * R, uy * R);
        g.lineTo(ux * (R - len), uy * (R - len));
        g.stroke();
      }
    }
    g.globalAlpha = 1;
    // heading caret at 12 o'clock
    g.beginPath();
    g.moveTo(-4 * dpr, -R + 1);
    g.lineTo(0, -R + 6 * dpr);
    g.lineTo(4 * dpr, -R + 1);
    g.stroke();
    g.restore();
    const hdg = Math.round(((((-P.yaw * 180) / Math.PI) % 360) + 360) % 360);
    H.setText(HUD.mmHead, String(hdg).padStart(3, "0") + "°");
  }
  let mmYaw = 1e9,
    mmX = 1e9,
    mmZ = 1e9;
  function updateMinimap(realDt) {
    markerPoll -= realDt;
    if (HUD.mmInteriorT > 0) HUD.mmInteriorT -= realDt;
    let dirty = HUD.mmDirty;
    if (markerPoll <= 0) {
      markerPoll = 0.12;
      markerCache = collectMarkers();
      dirty = true;
    }
    const P = G.player;
    if (
      Math.abs(P.yaw - mmYaw) > 0.002 ||
      Math.abs(P.pos.x - mmX) > 0.05 ||
      Math.abs(P.pos.z - mmZ) > 0.05
    )
      dirty = true;
    if (dirty) {
      mmYaw = P.yaw;
      mmX = P.pos.x;
      mmZ = P.pos.z;
      HUD.mmDirty = false;
      drawMinimap();
    }
  }

  // ------------------------------------------------------------------
  // Objective tracker (top right)
  // ------------------------------------------------------------------
  let objPoll = 0;
  function updateObjective(realDt) {
    objPoll -= realDt;
    if (objPoll > 0) return;
    objPoll = 0.15;
    const P = G.player,
      L = G.LAYOUT;
    let trackedId = H.call("quests", "tracked", [], null);
    let q = trackedId ? H.call("quests", "get", [trackedId], null) : null;
    if (!q || !(q.active || q.status === "active")) {
      // nothing tracked: follow the newest active main quest (the quest log lists main first)
      q =
        (H.call("quests", "list", [], []) || []).find(
          (x) => x && (x.active || x.status === "active") && x.main,
        ) || null;
      trackedId = q && q.id;
    }
    if (!q) {
      H.toggle(HUD.obj, "on", false);
      return;
    }
    const cur = (q.objectives || []).filter((o) => o.current && !o.done);
    const text = cur.length ? cur[0].text : q.stageText || stageText(q);
    H.setText(HUD.objQ, H.up(q.name));
    H.setText(HUD.objT, text || "");
    const inside = L.isInterior(P.pos.x);
    let best = null,
      bd = 1e9;
    for (const m of H.call("quests", "activeMarkers", [], []) || []) {
      if (
        !m ||
        m.x === undefined ||
        (m.questId && m.questId !== trackedId) ||
        inside !== L.isInterior(m.x)
      )
        continue;
      const d = Math.hypot(m.x - P.pos.x, m.z - P.pos.z);
      if (d < bd) {
        bd = d;
        best = m;
      }
    }
    if (best) {
      const yawTo = Math.atan2(-(best.x - P.pos.x), -(best.z - P.pos.z));
      const rel = G.util.wrapAngle(yawTo - P.yaw);
      HUD.objArrow.style.transform =
        "rotate(" + (-rel * 57.2958).toFixed(1) + "deg)";
      H.setText(
        HUD.objM,
        bd < 1000 ? Math.round(bd) + " M" : (bd / 1000).toFixed(1) + " KM",
      );
      const hdgTo = ((((-yawTo * 180) / Math.PI) % 360) + 360) % 360;
      H.setText(
        HUD.objDir,
        ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][
          Math.round(hdgTo / 45) % 8
        ],
      );
      H.toggle(HUD.obj, "near", bd < 8);
    } else H.setText(HUD.objM, "—");
    H.toggle(HUD.obj, "nodist", !best);
    H.toggle(HUD.obj, "on", true);
  }

  // Location name when walking into a named location
  let locPoll = 0;
  function updateLocationName(realDt) {
    if (HUD.locSuppress > 0) HUD.locSuppress -= realDt;
    if (HUD.restoreT > 0) HUD.restoreT -= realDt;
    if (locT > 0) {
      locT -= realDt;
      if (locT <= 0) HUD.locName.classList.remove("in");
    }
    if (locHeld) {
      locHeld.age += realDt;
      if (locHeld.age > 12) locHeld = null;
      else if (!bannerBusy()) {
        const h = locHeld;
        locHeld = null;
        showLocationName(h.name, h.sub);
      }
    }
    locPoll -= realDt;
    if (locPoll > 0) return;
    locPoll = 0.5;
    const P = G.player,
      L = G.LAYOUT;
    if (L.isInterior(P.pos.x)) return;
    const l = L.locationAt(P.pos.x, P.pos.z);
    const id = l ? l.id : null;
    if (id !== HUD.lastLoc) {
      if (
        l &&
        HUD.lastLoc !== undefined &&
        !(HUD.locSuppress > 0) &&
        G.discovered &&
        G.discovered.has(l.id)
      ) {
        const dn = H.DISTRICT_NAMES[L.districtAt(l.x, l.z)] || "";
        const cleared =
          l.hostile && H.call("combat", "isLocationCleared", [l.id], false);
        showLocationName(
          l.name,
          cleared ? (dn ? dn + "  ·  CLEARED" : "CLEARED") : dn,
        );
      }
      HUD.lastLoc = id;
    }
  }

  // ------------------------------------------------------------------
  // Visibility per state
  // ------------------------------------------------------------------
  function updateVisibility() {
    const s = G.state;
    const inGame = s === "play";
    const hidden = H.hudForcedHidden;
    H.toggle(
      HUD.root,
      "off",
      !(
        inGame ||
        s === "container" ||
        s === "barter" ||
        s === "dialogue" ||
        s === "terminal" ||
        s === "keypad" ||
        s === "cutscene"
      ) || hidden,
    );
    H.toggle(HUD.root, "mode-menu", !inGame);
    H.toggle(HUD.root, "mode-dead", s === "dead" || !G.player.alive);
    const topOn = !hidden && s === "play" && G.player.alive;
    H.toggle(HUD.top, "off", !topOn);
    const lockHint =
      s === "play" &&
      !G.input.locked &&
      !G.SMOKE &&
      !G.SHOT &&
      H.stateAge > 0.4;
    H.toggle(HUD.lockHint, "on", lockHint);
  }

  /** Screenshot review hook (?hudDemo=1|level|low): fills the HUD with representative content. */
  function hudDemo(kind) {
    const P = G.player;
    if (G.state === "goggles") {
      pushNotify("You can't fast travel while enemies are nearby.");
      return;
    } // message box
    if (kind === "level") {
      showLevelNote(2);
    } else {
      pushBanner({
        kind: "quest",
        title: "Quest added",
        sub: "Below the Municipal Building",
      });
      const D = { duration: 600 }; // review shots simulate many seconds before capture: keep the demo notes up
      pushNotify(
        "Rally Tonic added.",
        Object.assign({ kind: "item", id: "rally_tonic" }, D),
      );
      pushNotify("Find the facility exit before the reactor fails.", {
        sub: "Below the Municipal Building",
        duration: 600,
      });
      onXP(25, "Quest objective");
    }
    if (kind === "low") {
      P.hp = P.maxHp * 0.12;
      P.radRate = 4;
      P.sneaking = true;
    }
    const yawBack = P.yaw + Math.PI * 0.6;
    onDamaged(18, {
      pos: {
        x: P.pos.x - Math.sin(yawBack) * 10,
        z: P.pos.z - Math.cos(yawBack) * 10,
      },
    });
  }

  // ------------------------------------------------------------------
  // Part registration
  // ------------------------------------------------------------------
  H.part({
    name: "hud",
    order: 10,
    init() {
      build();
      wire();
    },
    update(dt, realDt) {
      if (
        G.SHOT &&
        !HUD.demoDone &&
        G.QS &&
        G.QS.get("hudDemo") &&
        G.player &&
        G.player.alive &&
        (G.state !== "goggles" || (H.GG && H.GG.open && H.stateAge > 0.3))
      ) {
        HUD.demoDone = true;
        hudDemo(G.QS.get("hudDemo"));
      }
      updateVisibility();
      const s = G.state;
      updateNotify(realDt);
      updateGgMsg(realDt);
      updateBanners(realDt, s !== "play" || !!H.hudForcedHidden);
      updateXP(realDt);
      if (s !== "play" && s !== "dead") return;
      updateBars(realDt);
      updateDirs(realDt);
      if (s === "play") {
        updateCenter(realDt);
        updateMinimap(realDt);
        updateObjective(realDt);
        updateLocationName(realDt);
      }
    },
  });

  // ------------------------------------------------------------------
  // Public API
  // ------------------------------------------------------------------
  Object.assign(G.hud, {
    /** Queue a top-centre message. opts: {icon|glyph: glyph name (25_icons.js), sub, sound, color:'red', kind, hint, duration} */
    notify(text, opts) {
      pushNotify(text, opts);
    },
    /** Bracketed banner. {title, sub, glyph?, sound?, extra?, life?} */
    banner(b) {
      pushBanner(Object.assign({}, b));
    },
    showLocationName,
    hitMarker(kill) {
      hitMark(!!kill);
    },
    damageFrom(pos, amount) {
      onDamaged(amount || 10, { pos });
    },
    xp: onXP,
  });
})();
