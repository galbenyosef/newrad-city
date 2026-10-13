// play-inline-6 02 — code
// Lines 317-660 of readable/play-inline-6.pretty.js (statement-aligned).
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
