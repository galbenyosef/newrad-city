// play-inline-514 01 — def
// Lines 30-361 of readable/play-inline-514.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const C = G.__cmb;

  C.SAFE_ZONES = [];
  const QUIET = new Set();

  function zoneRect(z, pad) {
    const p = pad || 0;
    return [z.x0 - p, z.z0 - p, z.x1 + p, z.z1 + p];
  }
  function addSafeZone(def) {
    if (!def || !def.id) return null;
    removeSafeZone(def.id);
    const z = {
      id: def.id,
      name: def.name || def.id,
      x0: Math.min(def.x0, def.x1),
      x1: Math.max(def.x0, def.x1),
      z0: Math.min(def.z0, def.z1),
      z1: Math.max(def.z0, def.z1),
      margin: def.margin === undefined ? 30 : def.margin,
      faction: def.faction || "settlers",
      warnT: 0,
      fireN: 0,
      fireT: -99,
      alertT: -99,
    };
    C.SAFE_ZONES.push(z);
    return z;
  }
  function removeSafeZone(id) {
    const i = C.SAFE_ZONES.findIndex((z) => z.id === id);
    if (i >= 0) C.SAFE_ZONES.splice(i, 1);
  }
  /** Zone containing (x,z) expanded by pad (metres), or null. Exterior only. */
  function zoneAt(x, z, pad) {
    if (!isFinite(x) || !isFinite(z)) return null;
    if (G.LAYOUT && G.LAYOUT.isInterior(x)) return null;
    for (const s of C.SAFE_ZONES) {
      const r = zoneRect(s, pad);
      if (x >= r[0] && x <= r[2] && z >= r[1] && z <= r[3]) return s;
    }
    return null;
  }
  C.safeZoneAt = zoneAt;
  C.inSafeZone = (x, z, pad) => !!zoneAt(x, z, pad);
  /** Push a point out of every zone (+pad) through the nearest edge (roaming patrol points). */
  C.clampOutOfSafe = function (p, pad) {
    if (!p) return p;
    const s = zoneAt(p.x, p.z, pad);
    if (!s) return p;
    const r = zoneRect(s, pad);
    const d = [p.x - r[0], r[2] - p.x, p.z - r[1], r[3] - p.z];
    const k = d.indexOf(Math.min.apply(null, d));
    if (k === 0) p.x = r[0] - 2;
    else if (k === 1) p.x = r[2] + 2;
    else if (k === 2) p.z = r[1] - 2;
    else p.z = r[3] + 2;
    return p;
  };
  /**
   * Is `other` an intruder the zone guard `guard` must engage? Player-hostile, not a follower,
   * not the guard's own faction, inside the guard's zone + margin.
   */
  C.safeIntruder = function (guard, other) {
    if (!guard || !other || other.dead || other.removed) return false;
    if (
      other.faction === guard.faction ||
      other.safeGuard ||
      other.following === "player" ||
      other.questTruce
    )
      return false;
    if (!other.hostile || !other.hostile()) return false;
    const s = C.SAFE_ZONES.find((z) => z.id === guard.safeGuard);
    if (!s) return false;
    const r = zoneRect(s, s.margin);
    const p = other.pos;
    return p.x >= r[0] && p.x <= r[2] && p.z >= r[1] && p.z <= r[3];
  };

  // ------------------------------------------------------------------
  // Guards: engage intruders (4 Hz)
  // ------------------------------------------------------------------
  const ALERT = [
    "Contact at the gate!",
    "Hostiles! Light 'em up!",
    "Something's coming in — guards, on me!",
    "Not in my town. Open fire!",
    "Wall up! We got company!",
  ];
  const COWER = [
    "Don't shoot! Don't shoot!",
    "Oh no, not again…",
    "Everybody down!",
    "Get inside! Get inside!",
    "I've only got the one face left!",
  ];
  let scanT = 0;
  function guardsOf(s) {
    return C.list.filter((a) => a.safeGuard === s.id && !a.dead && !a.removed);
  }
  function scanIntruders(dt) {
    scanT -= dt;
    if (scanT > 0) return;
    scanT = 0.25;
    for (const s of C.SAFE_ZONES) {
      let guards = null;
      const r = zoneRect(s, s.margin);
      for (const o of C.list) {
        if (
          o.dead ||
          !o.inScene ||
          o.safeGuard ||
          o.following === "player" ||
          o.faction === s.faction
        )
          continue;
        const p = o.pos;
        if (p.x < r[0] || p.x > r[2] || p.z < r[1] || p.z > r[3]) continue;
        if (!o.hostile() || o.questTruce || o.state === "dormant" || o.burrowed)
          continue;
        guards = guards || guardsOf(s);
        // nearest three idle guards (or guards fighting something farther away) go for it
        const cand = [];
        for (const g of guards) {
          if (!g.inScene || g.knockedOut) continue;
          const d = Math.hypot(g.pos.x - p.x, g.pos.z - p.z);
          if (d > (g.holdPos ? 160 : 85)) continue;
          if (
            g.inCombat &&
            g.target &&
            g.target !== "player" &&
            !g.target.dead &&
            g.distTo(g.target.pos) < d
          )
            continue;
          if (g.inCombat && g.target === o) continue;
          if (g.inCombat && g.target === "player") continue;
          cand.push([g, d]);
        }
        cand.sort((a, b) => a[1] - b[1]);
        for (let i = 0; i < Math.min(3, cand.length); i++)
          C.enterCombat(cand[i][0], o, 0.25 + i * 0.3);
        // the intruder answers the nearest shooter
        if (cand.length && (!o.inCombat || !o.target) && o.isEnemy(cand[0][0]))
          C.enterCombat(o, cand[0][0], 0.6);
        const t = G.time.elapsed;
        if (cand.length && t - s.alertT > 20) {
          s.alertT = t;
          cand[0][0].say(C.pick(ALERT), 3);
        }
        // townsfolk near the fight take cover
        if (Math.random() < 0.3)
          for (const c of C.list) {
            if (
              c.dead ||
              !c.inScene ||
              c.safeGuard ||
              c.faction !== s.faction ||
              c.inCombat ||
              c.essential ||
              c.following
            )
              continue;
            if (
              Math.hypot(c.pos.x - p.x, c.pos.z - p.z) > 22 ||
              c.state === "cower"
            )
              continue;
            if (!c.weapon || c.weaponId === "none") {
              c.setState("cower");
              if (Math.random() < 0.25) c.say(C.pick(COWER), 2.5);
            }
          }
      }
    }
  }

  // ------------------------------------------------------------------
  // "Put that away" — drawn weapons & gunfire inside a zone
  // ------------------------------------------------------------------
  const PUT_AWAY = [
    "Put that thing away before you hurt somebody.",
    "Holster it, topsider. Nobody draws in the Neon.",
    "Easy. Put the iron away and we stay friends.",
    "You planning on using that? No? Then put it away.",
    "Weapons stay holstered inside the gates. House rules.",
    "Hey. Hey! Put that away, pal.",
  ];
  const FIRE_WARN = [
    ["Whoa! Holster that!", "Who's shooting? Knock it off!"],
    [
      "No shooting in the Neon! You hear me?",
      "Hey! That's your last free one!",
    ],
    [
      "Last warning, topsider. Next one, we answer.",
      "I said NO SHOOTING. Try me.",
    ],
  ];
  function weaponDrawn() {
    if (G.isStub("weapons") || typeof G.weapons.current !== "function")
      return false;
    try {
      if (G.weapons.isHolstered && G.weapons.isHolstered()) return false;
      const c = G.weapons.current();
      if (!c || !c.id || c.holstered) return false;
      if (c.id === "unarmed" || (c.weapon && c.weapon.kind === "unarmed"))
        return false;
      return true;
    } catch (e) {
      return false;
    }
  }
  function nearestGuard(s, p, maxD, needSee) {
    let best = null,
      bd = maxD;
    for (const g of C.list) {
      if (
        g.safeGuard !== s.id ||
        g.dead ||
        !g.inScene ||
        g.inCombat ||
        g.talking ||
        g.knockedOut
      )
        continue;
      const d = Math.hypot(g.pos.x - p.x, g.pos.z - p.z);
      if (d >= bd || Math.abs(g.pos.y - p.y) > 4) continue;
      if (needSee && d > 3 && !g.seesPlayer) continue;
      best = g;
      bd = d;
    }
    return best;
  }
  let warnT = 0;
  function weaponWarnings(dt) {
    warnT -= dt;
    if (warnT > 0) return;
    warnT = 0.5;
    if (G.state !== "play" || !G.player || !G.player.alive) return;
    const P = G.player.pos;
    const s = zoneAt(P.x, P.z, 0);
    if (!s || QUIET.has(s.id) || C.anyCombat) return;
    const t = G.time.elapsed;
    if (t < s.warnT || !weaponDrawn()) return;
    const g = nearestGuard(s, P, 6, true);
    if (!g) return;
    s.warnT = t + 28;
    g.faceTowards(P.x, P.z);
    g.say(C.pick(PUT_AWAY), 4);
    G.events.emit("safeZoneWarning", s.id, "weapon", g);
  }
  function onFired() {
    const P = G.player && G.player.pos;
    if (!P) return;
    const s = zoneAt(P.x, P.z, 0);
    if (!s || QUIET.has(s.id) || C.anyCombat) return;
    const t = G.time.elapsed;
    if (t - s.fireT < 1.2) return; // one warning per burst
    s.fireN = t - s.fireT > 90 ? 1 : Math.min(4, s.fireN + 1);
    s.fireT = t;
    if (s.fireN >= 4) {
      answerFire(s, P);
      return;
    }
    const g = nearestGuard(s, P, 45, false);
    if (g) {
      g.faceTowards(P.x, P.z);
      g.say(C.pick(FIRE_WARN[s.fireN - 1]), 3.5);
    }
    for (const c of C.list) {
      if (
        c.dead ||
        !c.inScene ||
        c.safeGuard ||
        c.faction !== s.faction ||
        c.inCombat ||
        c.essential ||
        c.following ||
        c.talking
      )
        continue;
      if (Math.hypot(c.pos.x - P.x, c.pos.z - P.z) > 14 || c.state === "cower")
        continue;
      c.setState("cower");
      if (Math.random() < 0.3) c.say(C.pick(COWER), 2.5);
    }
    G.events.emit("safeZoneWarning", s.id, "gunfire", g, s.fireN);
  }

  // ------------------------------------------------------------------
  // "Next one, we answer": the fourth shot after three warnings turns the town's guards on the player.
  // They cool off once the player stops shooting / leaves, unless a guard was
  // hurt or killed by the player, then the grudge stands until the guards are dealt with.
  // ------------------------------------------------------------------
  const ANSWER = [
    "That's it! Light 'em up!",
    "You were warned, pal!",
    "Guards! Put this one down!",
  ];
  const CALM = [
    "Alright. Cool it. We're done here.",
    "Stand down, stand down. Holster it and walk.",
    "You got lucky. Don't try it again.",
  ];
  function answerFire(s, P) {
    const t = G.time.elapsed;
    let n = 0;
    for (const g of C.list) {
      if (
        g.safeGuard !== s.id ||
        g.dead ||
        g.removed ||
        !g.inScene ||
        g.knockedOut
      )
        continue;
      const d = Math.hypot(g.pos.x - P.x, g.pos.z - P.z);
      if (d > (g.holdPos ? 160 : 70)) continue;
      g._zoneAggro = s.id; // Actor.hostile() honours it; not saved, so a reload forgives
      C.enterCombat(g, "player", 0.2 + n * 0.15);
      if (!n) g.say(C.pick(ANSWER), 3);
      n++;
    }
    s.aggroT = t;
    s.fireN = 0;
    G.events.emit("safeZoneWarning", s.id, "hostile", null, 4);
  }
