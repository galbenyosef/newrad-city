/* src/core/cheats.js */
/* =====================================================================
 * NEW RAD CITY — CHEAT MENU (press P, any time after loading)
 * Owned by: CORE.
 *   [1] No Clip   — fly through walls (WASD + look, Space up, C down, Shift fast)
 *   [2] God Mode  — no damage, no radiation
 *   [3] Skip Intro & Leave Cryo Unit C-9 — starts a game if needed, puts you on Chambers Street
 *   [4] Max Everything — level cap, every attribute 10, every skill 100, every talent at full rank — applied automatically
 *   [5] Discover All Locations — every place on the goggles map (fast travel)
 *   [6] ENABLE ALL — everything below at once (+ god mode, no clip, max level & talents, all locations)
 *   [7] Reveal All Codes & Keys — every keypad code / passcode logged, every key in your pockets
 *   [9] Unlimited Ammo   [0] Unlimited Carry Weight
 *   [W] Add All Weapons (+ ammo for each)       — ENABLE ALL sits at the bottom of the list
 *   [B] REPORT A BUG — opens the bug reporter (src/core/bugreport.js) with a screenshot of the frame behind this menu
 *   WORLD panel: time of day presets, ±1 hour ([ / ]), freeze time (T), fast time ×20, weather (held until 'Auto')
 * State while open: 'cheats' (world paused, cursor free). P / Esc closes.
 * Look: the VIGIL goggle palette (cyan-white text, amber accents), never green.
 * ===================================================================== */
(function () {
  "use strict";
  const G = (window.G = window.G || {});

  const PRE_GAME_STATES = new Set(["title", "chargen", "dead"]);
  let el = null,
    badge = null,
    prevState = null;
  const S = { maxed: false, allFound: false, codes: false }; // per-game cheat flags (reset on new game)
  const TG = { ammo: false, carry: false }; // toggles (persist across new game / load, like god mode)

  const CSS = `
  #cheat-menu{position:fixed;inset:0;z-index:950;display:flex;align-items:center;justify-content:center;
    background:rgba(2,8,14,.74);font-family:'Share Tech Mono','Courier New',monospace;text-transform:uppercase;letter-spacing:1px;color:#cfeefa;
    text-shadow:0 0 6px rgba(150,220,240,.55)}
  #cheat-menu .cm-box{min-width:420px;border:2px solid #cfeefa;background:rgba(4,14,22,.92);padding:22px 28px 18px;
    box-shadow:0 0 24px rgba(150,220,240,.25), inset 0 0 40px rgba(150,220,240,.08)}
  #cheat-menu h2{margin:0 0 4px;font-size:34px;letter-spacing:4px;font-weight:normal}
  #cheat-menu .cm-sub{font-size:18px;opacity:.7;margin-bottom:16px}
  #cheat-menu button{display:flex;justify-content:space-between;width:100%;margin:6px 0;padding:8px 12px;cursor:pointer;
    font:inherit;font-size:24px;color:#cfeefa;background:transparent;border:1px solid rgba(150,220,240,.35);text-align:left;
    text-shadow:inherit}
  #cheat-menu button:hover,#cheat-menu button:focus{background:#cfeefa;color:#041019;text-shadow:none;outline:none}
  #cheat-menu .on{color:#fff}
  #cheat-menu .cm-foot{margin-top:14px;font-size:17px;opacity:.65}
  #cheat-menu .cm-wrap{display:flex;gap:18px;align-items:flex-start;justify-content:center;flex-wrap:wrap;max-height:94vh;overflow:auto}
  #cheat-menu .cm-world{min-width:330px}
  #cheat-menu .cm-sec{margin:12px 0 4px;font-size:19px;opacity:.8;letter-spacing:2px}
  #cheat-menu .cm-now{font-size:21px;margin-bottom:6px}
  #cheat-menu .cm-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px}
  #cheat-menu .cm-grid button{margin:0;font-size:20px;padding:6px 10px}
  #cheat-menu button.sel{background:rgba(150,220,240,.22)}
  #cheat-menu .cm-all{margin-top:14px;border-color:#cfeefa;font-size:26px}
  #cheat-menu .cm-contact{margin-top:12px;padding-top:10px;border-top:1px solid rgba(150,220,240,.3);font-size:18px;display:flex;flex-wrap:wrap;gap:4px 14px}
  #cheat-menu .cm-contact span{width:100%;opacity:.7;letter-spacing:2px}
  #cheat-menu .cm-contact a{color:#cfeefa;text-decoration:underline;text-underline-offset:3px}
  #cheat-menu .cm-contact a:hover{color:#fff}
  #cheat-badge{position:fixed;top:10px;right:14px;z-index:940;pointer-events:none;font:16px 'Share Tech Mono','Courier New',monospace;
    color:#ffb347;text-shadow:0 0 6px rgba(255,179,71,.6);letter-spacing:2px}`;

  function injectCss() {
    if (document.getElementById("cheat-css")) return;
    const s = document.createElement("style");
    s.id = "cheat-css";
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function inGame() {
    return !!G._gameStarted && !PRE_GAME_STATES.has(prevState);
  }

  function render() {
    if (!el) return;
    const P = G.player;
    const skipLabel = inGame()
      ? "Leave Cryo Unit C-9 (teleport outside)"
      : "Skip Intro &amp; Leave Cryo Unit C-9";
    const pre = inGame() ? "" : " <small>(starts game)</small>";
    el.innerHTML = `<div class="cm-wrap"><div class="cm-box">
      <h2>[ CHEATS ]</h2><div class="cm-sub">C-9 MAINTENANCE OVERRIDE</div>
      <button data-a="noclip"><span>[1] No Clip</span><span class="${P.noclip ? "on" : ""}">${P.noclip ? "ON" : "OFF"}</span></button>
      <button data-a="god"><span>[2] God Mode</span><span class="${P.godMode ? "on" : ""}">${P.godMode ? "ON" : "OFF"}</span></button>
      <button data-a="skip"><span>[3] ${skipLabel}</span><span>&gt;</span></button>
      <button data-a="maxlevel"><span>[4] Max Level, Attributes, Skills &amp; Talents${pre}</span><span class="${S.maxed ? "on" : ""}">${S.maxed ? "DONE" : "&gt;"}</span></button>
      <button data-a="discover"><span>[5] Discover All Locations${pre}</span><span class="${S.allFound ? "on" : ""}">${S.allFound ? "DONE" : "&gt;"}</span></button>
      <button data-a="codes"><span>[7] Reveal All Codes &amp; Keys${pre}</span><span class="${S.codes ? "on" : ""}">${S.codes ? "DONE" : "&gt;"}</span></button>
      <button data-a="ammo"><span>[9] Unlimited Ammo</span><span class="${TG.ammo ? "on" : ""}">${TG.ammo ? "ON" : "OFF"}</span></button>
      <button data-a="carry"><span>[0] Unlimited Carry Weight</span><span class="${TG.carry ? "on" : ""}">${TG.carry ? "ON" : "OFF"}</span></button>
      <button data-a="weapons"><span>[W] Add All Weapons (+ ammo)${pre}</span><span class="${S.armed ? "on" : ""}">${S.armed ? "DONE" : "&gt;"}</span></button>
      <button data-a="bug"><span>[B] Report a Bug (with screenshot)</span><span>&gt;</span></button>
      <button data-a="all" class="cm-all"><span>[6] ENABLE ALL CHEATS${pre}</span><span>&gt;&gt;</span></button>
      <div class="cm-foot">No Clip: WASD + mouse · Space up · C down · Shift fast<br>[P] / [Esc] close</div>
      <div class="cm-contact"><span>CONTACT THE DEVELOPER</span>
        <a href="mailto:its@chrisfirst.com">its@chrisfirst.com</a>
        <a href="https://x.com/chrisfirst" target="_blank" rel="noopener">X @chrisfirst</a>
        <a href="https://www.instagram.com/chrisfirstt/" target="_blank" rel="noopener">Instagram @chrisfirstt</a></div></div>
      ${worldPanel()}</div>`;
    el.querySelectorAll("button").forEach((b) => {
      b.onclick = () => act(b.dataset.a);
      b.onmouseenter = () => G.sfx.play("ui_hover");
    });
  }

  // ---------------- WORLD panel: time of day & weather ----------------
  const TIMES = [
    ["Dawn", 6],
    ["Morning", 9],
    ["Noon", 12],
    ["Afternoon", 15.5],
    ["Dusk", 19],
    ["Night", 22],
    ["Midnight", 0],
    ["Late Night", 3],
  ];
  const WEATHERS = [
    ["clear", "Clear"],
    ["overcast", "Overcast"],
    ["fog", "Fog"],
    ["rain", "Rain"],
    ["dust", "Dust Storm"],
    ["thunderstorm", "Thunderstorm"],
  ];
  const W = { frozen: false, fast: false, held: false, mps: null };
  function fmtHour(h) {
    h = ((h % 24) + 24) % 24;
    const hh = Math.floor(h),
      mm = Math.floor((h - hh) * 60);
    return (
      (hh % 12 || 12) +
      ":" +
      String(mm).padStart(2, "0") +
      (hh < 12 ? " AM" : " PM")
    );
  }
  function worldPanel() {
    const atm = !G.isStub("atmos"),
      wx = atm && G.atmos.getWeather ? G.atmos.getWeather() : "?";
    const hour = G.time.hour;
    return `<div class="cm-box cm-world"><h2>[ WORLD ]</h2><div class="cm-sub">TIME &amp; WEATHER CONTROL</div>
      <div class="cm-now">Time: ${fmtHour(hour)} · Day ${G.time.day || 1}<br>Weather: ${wx}${W.held ? " (held)" : " (auto)"}</div>
      <div class="cm-sec">TIME OF DAY</div>
      <div class="cm-grid">${TIMES.map(([n, h]) => `<button data-a="hour:${h}" class="${Math.abs(((hour - h + 36) % 24) - 12) > 11.4 ? "sel" : ""}"><span>${n}</span><span>${fmtHour(h).replace(":00", "")}</span></button>`).join("")}</div>
      <div class="cm-grid" style="margin-top:6px">
        <button data-a="hourstep:-1"><span>[ [ ] −1 hour</span></button><button data-a="hourstep:1"><span>[ ] ] +1 hour</span></button>
        <button data-a="freeze"><span>[T] Freeze Time</span><span class="${W.frozen ? "on" : ""}">${W.frozen ? "ON" : "OFF"}</span></button>
        <button data-a="fasttime"><span>Fast Time ×20</span><span class="${W.fast ? "on" : ""}">${W.fast ? "ON" : "OFF"}</span></button>
      </div>
      <div class="cm-sec">WEATHER</div>
      <div class="cm-grid">${WEATHERS.map(([id, n]) => `<button data-a="weather:${id}" class="${wx === id ? "sel" : ""}"><span>${n}</span></button>`).join("")}
        <button data-a="weather:auto" class="${W.held ? "" : "sel"}"><span>Auto (natural)</span></button></div>
      ${atm ? "" : '<div class="cm-foot">Atmosphere module not loaded.</div>'}</div>`;
  }
  function setTimeSpeed() {
    if (W.mps === null)
      W.mps =
        G.time.minutesPerSecond !== undefined ? G.time.minutesPerSecond : 0.5;
    G.time.minutesPerSecond = W.frozen ? 0 : W.fast ? W.mps * 20 : W.mps;
  }
  function worldAct(a) {
    const [k, v] = a.split(":");
    const atm = !G.isStub("atmos");
    if (k === "hour" || k === "hourstep") {
      const h = k === "hour" ? Number(v) : G.time.hour + Number(v);
      if (atm && G.atmos.setHour)
        G.atmos.setHour(h, { advanceDay: k === "hourstep" && Number(v) > 0 });
      else G.time.hour = ((h % 24) + 24) % 24;
      G.notify("Cheat: time set to " + fmtHour(G.time.hour) + ".");
    } else if (k === "freeze") {
      W.frozen = !W.frozen;
      if (W.frozen) W.fast = false;
      setTimeSpeed();
      G.notify("Time " + (W.frozen ? "frozen." : "running."));
    } else if (k === "fasttime") {
      W.fast = !W.fast;
      if (W.fast) W.frozen = false;
      setTimeSpeed();
      G.notify("Fast time " + (W.fast ? "on." : "off."));
    } else if (k === "weather") {
      if (!atm || !G.atmos.setWeather) return;
      if (v === "auto") {
        W.held = false;
        G.atmos.setWeather(G.atmos.getWeather(), { auto: true, silent: true });
        G.notify("Weather: natural cycle.");
      } else {
        W.held = true;
        G.atmos.setWeather(v, {
          instant: true,
          auto: false,
          silent: true,
          hold: 1e9,
        });
        G.notify("Cheat: weather set to " + v + ".");
      }
    }
    render();
    updateBadge();
  }

  function updateBadge() {
    const P = G.player,
      tags = [];
    if (P.noclip) tags.push("NOCLIP");
    if (P.godMode) tags.push("GOD");
    if (W.frozen) tags.push("TIME FROZEN");
    if (W.fast) tags.push("FAST TIME");
    if (W.held && !G.isStub("atmos"))
      tags.push("WX " + String(G.atmos.getWeather()).toUpperCase());
    if (TG.ammo) tags.push("AMMO");
    if (TG.carry) tags.push("CARRY");
    if (S.codes) tags.push("CODES");
    if (!badge) {
      badge = document.createElement("div");
      badge.id = "cheat-badge";
      document.body.appendChild(badge);
    }
    badge.textContent = tags.join(" · ");
    badge.style.display = tags.length && G.state !== "title" ? "block" : "none";
  }

  function open() {
    if (el || G.state === "loading" || G.state === "cheats") return;
    injectCss();
    prevState = G.state;
    if (G.bugReport) G.bugReport.prime(); // screenshot of the game as it was when P was pressed
    el = document.createElement("div");
    el.id = "cheat-menu";
    document.body.appendChild(el);
    render();
    G.sfx.play("goggles_open");
    G.setState("cheats", { from: prevState });
  }

  function close(nextState) {
    if (!el) return;
    el.remove();
    el = null;
    G.sfx.play("goggles_close");
    // Menus (goggles, dialogue, pause…) hide themselves when we open, so resume gameplay
    // rather than re-entering them; pre-game screens (title/chargen/dead) are restored as-is.
    const back = PRE_GAME_STATES.has(prevState) ? prevState : "play";
    G.setState(nextState || back);
    updateBadge();
  }

  function act(a) {
    const P = G.player;
    G.sfx.play("ui_select");
    if (a.indexOf(":") > 0 || a === "freeze" || a === "fasttime") {
      worldAct(a);
      return;
    }
    if (a === "bug") {
      if (G.bugReport) G.bugReport.openFromCheats();
      return;
    }
    if (a === "noclip") {
      P.noclip = !P.noclip;
      P.fly = P.noclip;
      if (!P.noclip) {
        // drop back onto the ground below
        P.pos.y = G.world.groundHeight(P.pos.x, P.pos.z, P.pos.y + 1, P.radius);
        P.vel.set(0, 0, 0);
      }
      G.notify("No Clip " + (P.noclip ? "enabled." : "disabled."));
      render();
      updateBadge();
    } else if (a === "god") {
      P.godMode = !P.godMode;
      if (P.godMode) {
        P.hp = P.maxHp;
        P.rads = 0;
      }
      G.notify("God Mode " + (P.godMode ? "enabled." : "disabled."));
      render();
      updateBadge();
    } else if (a === "skip") {
      skipToOutside();
    } else if (a === "ammo" || a === "carry") {
      setToggle(a, !TG[a]);
      render();
      updateBadge();
    } else if (
      a === "maxlevel" ||
      a === "discover" ||
      a === "all" ||
      a === "weapons" ||
      a === "codes"
    ) {
      if (!inGame()) {
        skipToOutside();
      } // unlocks need a running game
      if (a === "all") {
        if (!P.godMode) {
          P.godMode = true;
          P.hp = P.maxHp;
          P.rads = 0;
        }
        if (!P.noclip) {
          P.noclip = true;
          P.fly = true;
        }
        for (const k of Object.keys(TG)) if (!TG[k]) setToggle(k, true, true);
      }
      if (a === "maxlevel" || a === "all") maxEverything();
      if (a === "discover" || a === "all") discoverAll();
      if (a === "codes" || a === "all") revealCodesAndKeys();
      if (a === "weapons" || a === "all") addAllWeapons();
      if (a === "all") G.notify("Cheat: ALL cheats enabled.");
      if (el) {
        render();
      }
      updateBadge();
    }
  }

  /** Level cap, every attribute 10, every skill 100, every talent at full rank (choice talents rotate
   *  through attributes/skills) — everything applied automatically, nothing left to spend. */
  function maxEverything() {
    const R = G.rpg;
    if (G.isStub("rpg") || !R._state) {
      G.notify("Cheat unavailable: RPG system not loaded.");
      return;
    }
    const call = (fn, ...a) => {
      try {
        return typeof fn === "function" ? fn.apply(R, a) : undefined;
      } catch (e) {
        return undefined;
      }
    };
    const st = R._state(),
      cap = R.LEVEL_CAP || 30;
    if (st.level < cap) {
      st.level = cap;
      if (R.xpForLevel) st.xp = Math.max(st.xp || 0, R.xpForLevel(cap));
      if (R._dirty) R._dirty();
      G.events.emit("levelUp", cap); // one level-up (not 29 separate popups)
    }
    const attrs = (
      R.ATTRS || ["brawn", "reflex", "grit", "wits", "senses", "presence"]
    ).map((k) => (typeof k === "string" ? k : k.id));
    const skills = (R.SKILLS || []).map((k) =>
      typeof k === "string" ? k : k.id || k[0],
    );
    if (R.setAttrs) {
      const o = {};
      for (const k of attrs) o[k] = 10;
      call(R.setAttrs, o);
    }
    for (const sk of skills) {
      const cur = call(R.skill, sk) || 0;
      if (cur < 100) call(R.boostSkill, sk, 100 - cur, "silent");
    }
    let granted = 0;
    const talents =
      (typeof R.talents === "function" ? call(R.talents) : R.talents) || [];
    for (const def of talents) {
      if (!def || def.hidden) continue;
      let guard = 0;
      while (
        (call(R.talentRank, def.id) || 0) < (def.ranks || 1) &&
        guard++ < 20
      ) {
        const n = call(R.talentRank, def.id) || 0;
        const choice =
          def.choice === "attr"
            ? attrs[n % attrs.length]
            : def.choice === "skill"
              ? skills[n % Math.max(1, skills.length)]
              : undefined;
        if (!call(R.takeTalent, def.id, choice, { free: true })) break;
        granted++;
      }
    }
    st.talentPicks = 0;
    st.attrPoints = 0; // nothing left to pick or spend
    if (R._dirty) R._dirty();
    G.events.emit("skillsChanged");
    G.events.emit("attributesChanged");
    const P = G.player;
    if (R.maxHp) {
      P.maxHp = R.maxHp();
      P.hp = P.maxHp;
    }
    if (R.maxStamina) {
      P.maxStamina = R.maxStamina();
      P.stamina = P.maxStamina;
    }
    S.maxed = true;
    G.sfx.play("levelup");
    G.notify(
      "Cheat: level " +
        st.level +
        ", every attribute 10, every skill 100, " +
        granted +
        " talent ranks unlocked.",
    );
  }

  /** Every lock in the G.locks registry: codes & passcodes logged (Goggles → NOTES → CODES), keys added. */
  function revealCodesAndKeys() {
    const K = G.locks;
    if (!K || G.isStub("locks")) {
      G.notify("Cheat unavailable: lock registry not loaded.");
      return;
    }
    let codes = 0,
      keys = 0;
    try {
      if (typeof K.revealAll === "function") {
        K.revealAll({ keys: true });
        S.codes = true;
        G.sfx.play("ui_select");
        return;
      } // it notifies itself
      else {
        const all =
          (K.list && K.list()) ||
          (K.all && K.all()) ||
          (K.audit && K.audit()) ||
          [];
        for (const l of all) {
          const spec = (K.get && K.get(l.id)) || l;
          if (!spec || !spec.id) continue;
          if (spec.code || spec.passcode) {
            K.learn(spec.id);
            codes++;
          }
          if (
            spec.key &&
            !G.isStub("inventory") &&
            !(G.inventory.count(spec.key) > 0) &&
            (G.isStub("items") || G.items.get(spec.key))
          ) {
            G.inventory.add(spec.key, 1, { silent: true });
            keys++;
          }
        }
      }
    } catch (e) {
      G.reportError("cheats:codes", e);
    }
    S.codes = true;
    G.sfx.play("ui_select");
    G.notify(
      "Cheat: " +
        codes +
        " codes logged in your goggles, " +
        keys +
        " keys added.",
    );
  }

  /** Mark every map location discovered (fast travel everywhere) without 90 separate XP pop-ups. */
  function discoverAll() {
    let n = 0;
    for (const l of G.LAYOUT.LOCATIONS)
      if (!G.discovered.has(l.id)) {
        G.discovered.add(l.id);
        n++;
      }
    G.events.emit("cheatDiscoverAll", n);
    S.allFound = true;
    G.sfx.play("discover_location");
    G.notify("Cheat: " + n + " locations added to your goggles map.");
  }

  // ---------------- toggles: ammo / carry weight ----------------
  const TOGGLE_NAMES = {
    ammo: "Unlimited Ammo",
    carry: "Unlimited Carry Weight",
  };
  function setToggle(k, on, quiet) {
    TG[k] = on;
    if (k === "carry") applyCarry();
    if (k === "ammo") refillAmmo(true);
    if (!quiet) G.notify(TOGGLE_NAMES[k] + (on ? " enabled." : " disabled."));
  }
  /** Permanent buff through the RPG effect system (shows in the goggles; survives rpg recalcs). */
  function applyCarry() {
    const R = G.rpg;
    if (G.isStub("rpg") || !R.addEffect) return;
    if (TG.carry)
      R.addEffect({
        id: "cheat_carry",
        name: "Cheat: Unlimited Carry Weight",
        kind: "buff",
        duration: 1e9,
        mods: { carry: 1000000 },
        desc: "Carry as much as you like.",
      });
    else if (R.removeEffect) R.removeEffect("cheat_carry");
  }
  /** Keep the equipped weapon's magazine full (thrown weapons are topped up instead). */
  function refillAmmo(force) {
    if (!TG.ammo || G.isStub("weapons")) return;
    const st = G.weapons._ && G.weapons._.state,
      c = st && st.cur;
    if (!c || !c.def || !c.def.weapon || c.id === "unarmed") return;
    const w = c.def.weapon;
    if (w.reloadType === "throw") {
      if ((G.inventory.count(c.id) || 0) < 5)
        G.inventory.add(c.id, 5, { silent: true });
      return;
    }
    if (w.magSize && (c.mag < w.magSize || force)) {
      c.mag = w.magSize;
      if (st.mags) st.mags[c.id] = c.mag;
      G.events.emit("ammoChanged", G.weapons.current());
    }
  }
  /** Every weapon in the game + a stack of each ammo type. */
  function addAllWeapons() {
    if (G.isStub("items") || G.isStub("inventory")) {
      G.notify("Cheat unavailable: items not loaded.");
      return;
    }
    let w = 0,
      a = 0;
    for (const d of G.items.all()) {
      if (d.type === "weapon" && !(G.inventory.count(d.id) > 0)) {
        G.inventory.add(d.id, 1, { silent: true });
        w++;
      } else if (d.type === "ammo") {
        const big = /recoilless|missile|rocket|fuel|cannon|shell_(?!12)/i.test(
          d.id,
        )
          ? 20
          : 250;
        G.inventory.add(d.id, big, { silent: true });
        a++;
      }
    }
    S.armed = true;
    G.sfx.play("pickup_weapon");
    G.notify("Cheat: " + w + " weapons and " + a + " ammo types added.");
  }
  // tick: ammo (cheap), and re-apply carry after new game / load (rpg state is rebuilt)
  G.registerModule({
    name: "cheats",
    order: 99,
    update() {
      if (TG.ammo) refillAmmo(false);
    },
  });
  for (const ev of ["newGame", "loaded"])
    G.events.on(ev, () =>
      setTimeout(() => {
        if (TG.carry) applyCarry();
      }, 0),
    );

  /** Start a game if needed (skipping the intro) and put the hero on the street outside Cryo Unit C-9. */
  function skipToOutside() {
    if (el) {
      el.remove();
      el = null;
    }
    if (!inGame()) {
      const hero = (G.HERO && G.HERO.name) || G.player.name;
      G.newGame({
        name: hero,
        skipIntro: true,
        cheatSkipStart: true,
        appearance: G.HERO && G.HERO.appearance,
      });
    }
    const ex = G.LAYOUT.cryoExit;
    G.player.teleport(ex.x, ex.y || 0, ex.z, ex.yaw || 0);
    G.discover("cryo_c9");
    G.events.emit("cheatSkipStart");
    G.setState("play");
    G.notify("Cheat: skipped to the street outside Cryo Unit C-9.");
    updateBadge();
  }

  window.addEventListener(
    "keydown",
    (e) => {
      if (
        e.target &&
        (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
      )
        return;
      const k = (e.key || "").toLowerCase();
      if (
        (e.code === "KeyP" || k === "p") &&
        !e.repeat &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey
      ) {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (el) close();
        else open();
        return;
      }
      if (!el) return;
      if (e.code === "Escape" || k === "escape") {
        e.preventDefault();
        e.stopImmediatePropagation();
        close();
      } else if (e.code === "Digit1" || e.code === "Numpad1" || k === "1") {
        e.stopImmediatePropagation();
        act("noclip");
      } else if (e.code === "Digit2" || e.code === "Numpad2" || k === "2") {
        e.stopImmediatePropagation();
        act("god");
      } else if (e.code === "Digit3" || e.code === "Numpad3" || k === "3") {
        e.stopImmediatePropagation();
        act("skip");
      } else if (e.code === "Digit4" || e.code === "Numpad4" || k === "4") {
        e.stopImmediatePropagation();
        act("maxlevel");
      } else if (e.code === "Digit5" || e.code === "Numpad5" || k === "5") {
        e.stopImmediatePropagation();
        act("discover");
      } else if (e.code === "Digit6" || e.code === "Numpad6" || k === "6") {
        e.stopImmediatePropagation();
        act("all");
      } else if (e.code === "Digit7" || e.code === "Numpad7" || k === "7") {
        e.stopImmediatePropagation();
        act("codes");
      } else if (e.code === "Digit9" || e.code === "Numpad9" || k === "9") {
        e.stopImmediatePropagation();
        act("ammo");
      } else if (e.code === "Digit0" || e.code === "Numpad0" || k === "0") {
        e.stopImmediatePropagation();
        act("carry");
      } else if (e.code === "KeyW" || k === "w") {
        e.stopImmediatePropagation();
        act("weapons");
      } else if (e.code === "BracketLeft" || k === "[") {
        e.stopImmediatePropagation();
        act("hourstep:-1");
      } else if (e.code === "BracketRight" || k === "]") {
        e.stopImmediatePropagation();
        act("hourstep:1");
      } else if (e.code === "KeyT" || k === "t") {
        e.stopImmediatePropagation();
        act("freeze:1");
      } else if (e.code === "KeyB" || k === "b") {
        e.preventDefault();
        e.stopImmediatePropagation();
        act("bug");
      }
    },
    true,
  ); // capture phase: runs before the engine & UI modules see the key

  G.events.on("newGame", () => {
    G._gameStarted = true;
    S.maxed = false;
    S.allFound = false;
    S.armed = false;
    S.codes = false;
  });
  G.events.on("loaded", () => {
    G._gameStarted = true;
  });
  G.events.on("state", (s) => {
    if (s !== "cheats" && el) {
      el.remove();
      el = null;
    }
    updateBadge();
  });

  G.cheatMenu = {
    open,
    close,
    skipToOutside,
    _prevState: () => prevState,
    _detach() {
      if (el) {
        el.remove();
        el = null;
      }
    }, // bug reporter takes over the screen (state stays 'cheats')
  };
})();
