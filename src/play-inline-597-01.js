// play-inline-597 01 — hud
// Lines 23-369 of readable/play-inline-597.pretty.js (statement-aligned).
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
