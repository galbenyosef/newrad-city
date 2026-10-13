/* src/ui_hud/45_levelup.js */
/* =====================================================================
 * NEW RAD CITY — UI_HUD : PROMOTION SCREEN (state 'levelup')
 * After a 'levelUp' event, once the player is out of combat and in normal
 * play, the world pauses and this readout opens:
 *   1. ATTRIBUTE  — every second level: +1 to one attribute (Brawn, Reflex,
 *                   Grit, Wits, Senses, Presence; max 10)
 *   2. TALENT     — every level: pick one talent (eligible first; the others
 *                   show what they need)
 * Skills grow by use, so there is nothing to distribute here.
 * Reads the progression module through H.RPG (31_gg_status.js):
 *   attrPoints() / spendAttr(id) / talentPoints() / talentList() / takeTalent(id, choice)
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const H = G.hud._;

  const LV = { pending: false, open: false, el: null, host: null, step: null };
  H.LV = LV;
  const R = () => (G.rpg && !G.rpg.__stub ? G.rpg : null);
  const RP = () => H.RPG;
  const attrPts = () => (RP() ? RP().attrPoints() : 0);
  const talentPts = () => (RP() ? RP().talentPoints() : 0);
  const anythingOwed = () => attrPts() > 0 || talentPts() > 0;

  function build() {
    const el = H.el("div", "menu-screen menu-levelup", H.uiRoot);
    el.innerHTML =
      '<div class="menu-pause-bg"></div><div class="menu-crt wide"><i class="c tl"></i><i class="c tr"></i><i class="c bl"></i><i class="c br"></i><div class="menu-lv-head"></div><div class="menu-crt-in"></div><div class="menu-crt-fx"></div></div>';
    el.style.display = "none";
    LV.el = el;
    LV.head = el.querySelector(".menu-lv-head");
    LV.host = H.menuHost(el.querySelector(".menu-crt-in"));
  }

  function open(force) {
    if (!R()) return;
    if (!anythingOwed() && !force) {
      LV.pending = false;
      return;
    }
    LV.open = true;
    LV.pending = false;
    LV.did = {};
    G.setState("levelup");
    LV.el.style.display = "";
    LV.el.classList.remove("in");
    void LV.el.offsetWidth;
    LV.el.classList.add("in");
    H.sfx("goggles_open", { volume: 0.6 });
    if (force && !anythingOwed()) talentStep();
    else next();
  }
  function next() {
    if (attrPts() > 0) attrStep();
    else if (talentPts() > 0) talentStep();
    else close();
  }
  LV.close = function () {
    close();
  };
  function close() {
    LV.open = false;
    LV.host.clear();
    LV.el.style.display = "none";
    if (G.state === "levelup") {
      G.setState("play");
      if (H.requestAutosave) H.requestAutosave("levelup", 1.0);
    }
  }
  function setHead(step) {
    const showAttr = attrPts() > 0 || (LV.did && LV.did.attr);
    LV.step = step;
    LV.head.innerHTML =
      '<div class="menu-lv-gl">' +
      H.glyph("level") +
      '</div><div><div class="menu-lv-title">PROMOTION</div><div class="menu-lv-sub">' +
      H.esc(H.up(H.heroName())) +
      " &middot; LEVEL " +
      H.level() +
      "</div></div>" +
      '<div class="menu-lv-steps">' +
      (showAttr
        ? '<span class="' +
          (step === "attr" ? "on" : LV.did.attr ? "done" : "") +
          '">ATTRIBUTE</span>'
        : "") +
      '<span class="' +
      (step === "talent" ? "on" : "") +
      '">TALENT</span></div>';
  }

  // ---- step 1: attribute point ----
  function meter(v, add) {
    let s = '<span class="menu-lv-meter">';
    for (let k = 1; k <= 10; k++)
      s +=
        '<i class="' + (k <= v ? "on" : k <= v + add ? "add" : "") + '"></i>';
    return s + "</span>";
  }
  function attrStep() {
    setHead("attr");
    LV.host.clear();
    const list = H.attrList ? H.attrList() : [];
    LV.host.push({
      cls: "menu-lv-attrs",
      header:
        '<div class="menu-tip">' +
        (attrPts() > 1
          ? attrPts() + " ATTRIBUTE POINTS"
          : "ONE ATTRIBUTE POINT") +
        " TO ASSIGN. ATTRIBUTES RUN FROM 1 TO 10.</div>",
      items: list.map((a) => {
        const v = RP().attr(a[0]);
        const maxed = typeof v === "number" && v >= 10;
        return {
          label: a[1],
          id: a[0],
          desc: a[2],
          cls: maxed ? "inelig" : "",
          right: () =>
            meter(Number(v) || 0, 0) +
            '<span class="menu-val">' +
            (v === null ? "--" : v) +
            "</span>",
          action: () => {
            if (maxed) {
              H.sfx("ui_error");
              return;
            }
            H.confirmPanel(
              LV.host,
              "Raise " + a[1] + " to " + ((Number(v) || 0) + 1) + "?",
              () => spend(a[0]),
              "Confirm",
              "Back",
            );
          },
        };
      }),
      side: (it) =>
        it
          ? '<div class="menu-side-gl">' +
            H.glyph("attr") +
            '</div><div class="menu-side-t">' +
            H.esc(H.up(it.label)) +
            '</div><div class="menu-side-s">' +
            H.esc(it.desc || "") +
            "</div>"
          : "",
      footer: () =>
        '<span class="menu-lv-pts">POINTS: <b class="pulse">' +
        attrPts() +
        "</b></span> &nbsp; <b>ENTER</b> ASSIGN",
      onBack: () => true,
    });
  }
  function spend(id) {
    const ok = RP().spendAttr(id);
    if (ok === false) {
      H.sfx("ui_error");
      return;
    }
    LV.did.attr = true;
    H.sfx("ui_select");
    G.events.emit("attributeChanged", id);
    next();
  }

  // ---- step 2: talent ----
  function talentEntries() {
    const nm = (t) =>
      (typeof t.name === "function" ? t.name() : t.name) || t.id;
    const ds = (t) => (typeof t.desc === "function" ? t.desc() : t.desc) || "";
    return RP()
      .talentList()
      .map((t) => ({
        id: t.id,
        name: nm(t),
        desc: ds(t),
        eligible: t.eligible !== false,
        reason: t.reason || t.requires || "",
        rank: t.rank || 0,
        ranks: t.ranks || 1,
        choice: t.choice,
        def: t,
      }))
      .sort(
        (a, b) =>
          b.eligible - a.eligible ||
          String(a.name).localeCompare(String(b.name)),
      );
  }
  function talentStep() {
    setHead("talent");
    LV.host.clear();
    const list = talentEntries();
    LV.host.push({
      cls: "menu-lv-talents",
      items: list.length
        ? list.map((p) => ({
            label: p.name,
            p,
            cls: p.eligible ? "" : "inelig",
            right: p.ranks > 1 ? (p.rank || 0) + "/" + p.ranks : "",
            action: () => {
              if (!p.eligible) {
                H.sfx("ui_error");
                return;
              }
              choose(p);
            },
          }))
        : [{ label: "No talents available.", disabled: true }],
      side: (it) => {
        if (!it || !it.p) return "";
        const p = it.p;
        return (
          '<div class="menu-side-gl">' +
          H.glyph("talent") +
          '</div><div class="menu-side-t">' +
          H.esc(H.up(p.name)) +
          (p.ranks > 1
            ? " <small>(RANK " +
              ((p.rank || 0) + 1) +
              " OF " +
              p.ranks +
              ")</small>"
            : "") +
          "</div>" +
          '<div class="menu-side-s">' +
          H.esc(p.desc) +
          "</div>" +
          (!p.eligible && p.reason
            ? '<div class="menu-side-req">' + H.esc(H.up(p.reason)) + "</div>"
            : "")
        );
      },
      footer:
        '<span class="menu-lv-pts">PICKS: <b class="pulse">' +
        talentPts() +
        '</b></span> &nbsp; <b>ENTER</b> SELECT TALENT &nbsp; <span class="menu-dim">DIMMED TALENTS ARE NOT YET AVAILABLE</span>',
      onBack: () => true,
      onKey(code) {
        if (!list.length && (code === "Enter" || code === "Escape")) {
          close();
          return true;
        }
        return false;
      },
    });
  }
  function choose(p) {
    if (
      p.choice === "attr" ||
      p.choice === "attribute" ||
      p.choice === "skill"
    ) {
      const isAttr = p.choice !== "skill";
      const opts = isAttr
        ? (H.attrList ? H.attrList() : []).map((a) => ({
            id: a[0],
            name: a[1],
          }))
        : (H.skillList ? H.skillList() : []).map((s) => ({
            id: s[0],
            name: s[1],
          }));
      LV.host.push({
        title: p.name + ": choose " + (isAttr ? "an attribute" : "a skill"),
        cls: "menu-lv-choice",
        items: opts.map((o) => ({
          label: o.name,
          right: String((isAttr ? RP().attr(o.id) : RP().skill(o.id)) ?? "--"),
          action: () => take(p, o.id),
        })),
      });
      return;
    }
    H.confirmPanel(
      LV.host,
      'Take the talent "' + p.name + '"?',
      () => take(p),
      "Take talent",
      "Back",
    );
  }
  function take(p, choice) {
    const ok = RP().takeTalent(p.id, choice);
    if (ok === false) {
      H.sfx("ui_error");
      return;
    }
    G.notify("Talent gained: " + p.name, { kind: "talent" });
    H.sfx("ui_select", { volume: 0.8 });
    next();
  }

  function onKey(code, e) {
    if (!LV.open || G.state !== "levelup") return;
    if (LV.host.onKey(code, e)) G.input.consume(code);
  }

  H.part({
    name: "levelup",
    order: 60,
    init() {
      build();
      G.events.on("keydown", onKey);
      G.events.on("levelUp", () => {
        if (R()) LV.pending = true;
      });
      G.events.on("reset", () => {
        LV.pending = false;
        if (LV.open) close();
      });
      G.events.on("state", (s) => {
        if (s !== "levelup" && LV.open) {
          // something else took over (cheat menu, death, quit): hide, and re-arm while picks remain
          LV.open = false;
          LV.host.clear();
          LV.el.style.display = "none";
          if (anythingOwed()) LV.pending = true;
        }
      });
      G.events.on("loaded", () => {
        LV.pending = false;
        LV.recheck = 2;
      });
    },
    update(dt, realDt) {
      // review hook (screenshots only): ?state=levelup opens the readout even with nothing owed
      if (G.SHOT && G.state === "levelup" && !LV.open && !LV.shotDone) {
        LV.shotDone = true;
        const to = Number(G.QS && G.QS.get("levelTo")) || 0; // &levelTo=N: a real promotion for the shot
        if (to > 1 && R() && typeof R().addXP === "function") {
          try {
            R().addXP(
              Math.max(0, R().xpForLevel(to) - (R().xp || 0)),
              "review",
            );
          } catch (e) {
            /* ignore */
          }
        }
        open(true);
      }
      if (LV.open) return;
      if (G.SMOKE) {
        LV.pending = false;
        return;
      } // the smoke playthrough never stops for menus
      // safety net: picks the progression module reports that no pending flag knows about (old save, lost screen)
      LV.recheck = (LV.recheck || 0) - (realDt || 0);
      if (!LV.pending && LV.recheck <= 0) {
        LV.recheck = 4;
        if (G.state === "play" && R() && anythingOwed()) LV.pending = true;
      }
      if (!LV.pending) return;
      if (
        G.state === "play" &&
        H.prevState === "play" &&
        H.stateAge > 1.2 &&
        !H.combatActive() &&
        G.player.alive
      )
        open();
    },
  });

  G.hud.openLevelUp = function () {
    if (R()) open();
  };
  G.hud.levelUpPending = () => LV.pending || (!!R() && anythingOwed());
})();
