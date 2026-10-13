// play-inline-514 02 — pos
// Lines 362-538 of readable/play-inline-514.pretty.js (statement-aligned).
  function calmDown(s) {
    if (!s.aggroT) return;
    const t = G.time.elapsed,
      P = G.player && G.player.pos;
    if (s.grudge) return;
    const lastShot = Math.max(s.aggroT, s.fireT);
    const away = P && !zoneAt(P.x, P.z, s.margin + 40);
    if (!(t - lastShot > 30 || (away && t - lastShot > 8))) return;
    s.aggroT = 0;
    let said = false;
    for (const g of C.list) {
      if (g._zoneAggro !== s.id || g.dead) continue;
      g._zoneAggro = null;
      if (g.target === "player" && !g.hostile()) C.leaveCombat(g, "idle");
      if (
        !said &&
        P &&
        g.inScene &&
        Math.hypot(g.pos.x - P.x, g.pos.z - P.z) < 40
      ) {
        g.say(C.pick(CALM), 3.5);
        said = true;
      }
    }
    G.events.emit("safeZoneWarning", s.id, "calm", null, 0);
  }
  function onGuardHurt(a, amt, info) {
    if (!a || !a.safeGuard || !info) return;
    const src = info.source || info.from;
    if (src !== "player") return;
    const s = C.SAFE_ZONES.find((z) => z.id === a.safeGuard);
    if (!s) return;
    // shots at the guards themselves: no cooling off (normal faction response is handled by 30_combat)
    if (s.aggroT) s.grudge = true;
  }

  // ------------------------------------------------------------------
  // Caught stealing / pickpocketing inside the walls: the witness shouts, the nearest guards come
  // for you. Same cool-off as gunfire, just longer: run, hide, or
  // leave the Neon and they let it go; hit a guard and it becomes a real grudge (onGuardHurt).
  // ------------------------------------------------------------------
  const THIEF = [
    "Thief! Stop right there!",
    "Guards! We got a thief!",
    "Drop it, sticky fingers! NOW!",
    "Sticky fingers at the stalls! Get 'em!",
  ];
  function onCrime(c) {
    if (!c || (c.type !== "theft" && c.type !== "pickpocket") || !c.witness)
      return;
    const P = G.player && G.player.pos;
    if (!P) return;
    const w = c.witness;
    const s = zoneAt(P.x, P.z, 0) || (w.pos && zoneAt(w.pos.x, w.pos.z, 0));
    if (!s || QUIET.has(s.id)) return;
    const t = G.time.elapsed;
    let n = 0;
    for (const g of C.list) {
      if (
        g.safeGuard !== s.id ||
        g.dead ||
        g.removed ||
        !g.inScene ||
        g.knockedOut ||
        g.talking
      )
        continue;
      const d = Math.hypot(g.pos.x - P.x, g.pos.z - P.z);
      if (d > (g.holdPos ? 120 : 45) || n >= 4) continue;
      g._zoneAggro = s.id;
      C.enterCombat(g, "player", 0.6 + n * 0.3);
      if (!n) g.say(C.pick(THIEF), 3);
      n++;
    }
    if (!n) return;
    s.aggroT = t + 45; // (calmDown counts from here: ~75 s, or ~50 s once you're out of the zone)
    G.events.emit("safeZoneWarning", s.id, "crime", w, 4);
  }

  // ------------------------------------------------------------------
  // Built-in zones & wiring
  // ------------------------------------------------------------------
  function builtIns() {
    const site =
      G.LAYOUT && G.LAYOUT.getSite && G.LAYOUT.getSite("times_square");
    if (site && !C.SAFE_ZONES.some((z) => z.id === "times_square")) {
      addSafeZone({
        id: "times_square",
        name: "The Neon",
        x0: site.x0,
        z0: site.z0,
        x1: site.x1,
        z1: site.z1,
        margin: 30,
        faction: "settlers",
      });
    }
  }
  builtIns();

  Object.assign(G.combat, {
    addSafeZone,
    removeSafeZone,
    safeZones: () =>
      C.SAFE_ZONES.map((z) => ({
        id: z.id,
        name: z.name,
        x0: z.x0,
        z0: z.z0,
        x1: z.x1,
        z1: z.z1,
        margin: z.margin,
        faction: z.faction,
      })),
    isSafeZone: (x, z, pad) => !!zoneAt(x, z, pad),
    safeZoneAt: (x, z, pad) => {
      const s = zoneAt(x, z, pad);
      return s ? s.id : null;
    },
    setSafeZoneQuiet(id, on) {
      if (on) QUIET.add(id);
      else QUIET.delete(id);
    },
    safeZoneGuards: (id) => C.list.filter((a) => a.safeGuard === id && !a.dead),
  });

  C.updateSafeZones = function (dt) {
    if (!C.SAFE_ZONES.length || dt <= 0) return;
    try {
      scanIntruders(dt);
    } catch (e) {
      G.reportError("combat:safezone", e);
    }
    try {
      weaponWarnings(dt);
    } catch (e) {
      G.reportError("combat:safezone.warn", e);
    }
    try {
      for (const s of C.SAFE_ZONES) calmDown(s);
    } catch (e) {
      G.reportError("combat:safezone.calm", e);
    }
  };
  G.events.on("weaponFired", () => {
    try {
      onFired();
    } catch (e) {
      G.reportError("combat:safezone.fire", e);
    }
  });
  G.events.on("crime", (c) => {
    try {
      onCrime(c);
    } catch (e) {
      G.reportError("combat:safezone.crime", e);
    }
  });
  G.events.on("actorDamaged", (a, amt, info) => {
    try {
      onGuardHurt(a, amt, info);
    } catch (e) {
      G.reportError("combat:safezone.hurt", e);
    }
  });
  G.events.on("reset", () => {
    QUIET.clear();
    for (const s of C.SAFE_ZONES) {
      s.warnT = 0;
      s.fireN = 0;
      s.fireT = -99;
      s.alertT = -99;
      s.aggroT = 0;
      s.grudge = false;
    }
  });
  void THREE;
