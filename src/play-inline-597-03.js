// play-inline-597 03 — hud
// Lines 649-996 of readable/play-inline-597.pretty.js (statement-aligned).
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
