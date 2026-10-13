// play-inline-513 03 — loc
// Lines 686-1020 of readable/play-inline-513.pretty.js (statement-aligned).
  C.memberRestore = function (m, groupId) {
    const a = G.actors.spawn({
      type: m.t,
      level: m.l,
      faction: m.f,
      name: m.n,
      voice: m.v,
      seed: m.s,
      outfit: m.o,
      gender: m.g,
      burn: m.bu,
      pos: { x: m.x, y: m.y, z: m.z },
      yaw: m.yaw || 0,
      ai: m.ai,
      holdPos: !!m.hold,
      weapon: m.w || "none",
      home: m.home,
      patrol: m.pat,
      merchant: m.merch,
      hp: m.mhp,
      noLoot: true,
      noRespawn: !!m.nr,
      _group: groupId,
      _roaming: !!m.roam,
      _dormantOk: !m.wd,
      hat: m.hat,
      hatColor: m.hatc,
      evil: !!m.evil,
    });
    if (!a) return null;
    if (m.wd) a.warden = m.wd;
    if (m.den) a.denWake = m.den;
    if (m.dorm && !m.dead) makeDormant(a, m.den);
    else if (!m.dorm && a.state === "dormant" && !m.dead) {
      a.setState("idle");
      a.anim("idle");
    }
    a.maxHp = m.mhp || a.maxHp;
    if (typeof m.dr === "number") a.dr = m.dr;
    if (typeof m.acc === "number") a.accuracy = m.acc;
    if (typeof m.xp === "number") a.xp = m.xp;
    if (typeof m.sight === "number") a.sight = m.sight;
    if (m.boss) a.isBoss = true;
    if (m.host !== undefined)
      a.hostOverride = m.host === null ? undefined : m.host;
    if (Array.isArray(m.inv)) a.inventory = m.inv.map((e) => [e[0], e[1]]);
    if (m.dead) {
      a.hp = 0;
      C.killActor(a, { silent: true, restore: true });
    } else
      a.hp = C.clamp(typeof m.hp === "number" ? m.hp : a.maxHp, 1, a.maxHp);
    return a;
  };
  function restoreGroup(g) {
    const list = g.restore;
    g.restore = null;
    for (const m of list) {
      try {
        const a = C.memberRestore(m, g.id);
        if (a) g.actors.push(a);
      } catch (e) {
        G.reportError("combat:restore " + g.id, e);
      }
    }
    if (g.state === "pending") g.state = "active";
    // everyone was already dead when saved: cleared quietly (locationCleared was emitted back then)
    if (
      g.state === "active" &&
      g.kind === "location" &&
      g.actors.length &&
      g.actors.every((a) => a.dead)
    ) {
      g.state = "cleared";
      g.clearedDay = g.clearedDay || gameDay();
    }
  }

  // characters' round-1 creatures in fixed homes: giant ants in the 42nd Street tunnels,
  // stingers in the Navy Yard. (Central Park ash bears / scorpions come from C.ENCOUNTERS.)
  const EXTRA_SPAWNS = { subway: ["giant_ant"], dumbo: ["stinger"] };
  (function addCreatureHomes() {
    try {
      for (const id in EXTRA_SPAWNS) {
        const loc = G.LAYOUT.getLocation(id);
        if (!loc || !Array.isArray(loc.spawns) || loc._cmbExtra) continue;
        loc._cmbExtra = true;
        for (const t of EXTRA_SPAWNS[id]) if (C.TYPES[t]) loc.spawns.push(t);
      }
    } catch (e) {
      /* layout optional */
    }
  })();

  function spawnLocationGroup(g) {
    const loc = g.data;
    const interior = loc.interior ? G.LAYOUT.INTERIORS[loc.interior] : null;
    const used = new Set();
    // Composition: listed spawns, plus extras for high-level spots; only true swarm creatures
    // (giant roach, burrow rat, gasfly) come in clusters; capped types (sky-eyes) never exceed their cap.
    const list = loc.spawns.slice();
    const extra = Math.floor((loc.level || 1) / 5);
    const capOk = (t) => {
      const cap = C.typeDef(t).maxPerGroup;
      return !cap || list.filter((x) => x === t).length < cap;
    };
    for (let i = 0; i < extra; i++) {
      let t = C.pick(loc.spawns);
      // a capped type (sky-eyes) that is already at its cap gives its slot to a regular member
      if (!capOk(t))
        t = loc.spawns.find((x) => capOk(x) && !C.typeDef(x).boss) || null;
      if (t && !C.typeDef(t).boss) list.push(t);
    }
    const den = loc.id === DEN_ID;
    g.deferred = 0;
    if (den && !denOpen()) {
      g.deferred = Math.max(0, list.length - 1);
      list.length = Math.min(list.length, 1);
    }
    const warden =
      C.WARDEN_ZONES[loc.id] && wardenRulesActive(loc.id) ? loc.id : null;
    const lvlBase = scaledLevel(loc);
    const typeCount = {};
    let idx = 0;
    for (const type of list) {
      const td = C.typeDef(type);
      const cluster = td.swarm ? C.randInt(2, 3) : 1;
      const base = interior
        ? mapAnchorSpawn(loc, idx, used) ||
          poiAnchorSpawn(loc, idx, used) ||
          interiorSpawnPoint(loc, interior)
        : locationSpawnPoint(loc, idx, type, used);
      if (!base) continue;
      for (let c = 0; c < cluster; c++) {
        if (td.maxPerGroup && (typeCount[type] || 0) >= td.maxPerGroup) break;
        typeCount[type] = (typeCount[type] || 0) + 1;
        const L = lvlBase !== null ? lvlBase : loc.level || 1;
        const lvl = Math.max(1, L + C.randInt(-1, 1));
        const pos =
          c === 0
            ? base
            : interior
              ? jitterFree(base, 1.6, 0.35)
              : {
                  x: base.x + (Math.random() - 0.5) * 3,
                  y: base.y,
                  z: base.z + (Math.random() - 0.5) * 3,
                };
        const a = G.actors.spawn({
          type,
          level: td.boss
            ? lvlBase !== null
              ? Math.max(lvlBase, 1)
              : loc.level
            : lvl,
          pos,
          yaw:
            c === 0 && typeof base.yaw === "number"
              ? base.yaw
              : Math.random() * Math.PI * 2,
          ai: warden ? "guard" : "wander",
          faction:
            td.faction === "creatures" ||
            td.faction === "robots" ||
            type === "sky_eye"
              ? td.faction
              : loc.faction || td.faction,
          home: warden
            ? { x: pos.x, z: pos.z, r: 12 }
            : {
                x: interior ? pos.x : loc.x,
                z: interior ? pos.z : loc.z,
                r: interior ? 12 : Math.max(10, loc.r * 0.7),
              },
          _group: g.id,
          _dormantOk: true,
        });
        if (a) {
          if (warden) a.warden = warden;
          if (den && type === "ripjaw") makeDormant(a, 13);
          g.actors.push(a);
        }
      }
      idx++;
    }
    g.relevelT = now() + 10;
    // Raider gangs with some standing get a boss: tougher, better armed, better loot
    const gang = g.actors.filter((a) => a.type === "raider");
    if (gang.length >= 3 && (loc.level || 1) >= 5) {
      const b = gang[0];
      const ba = interior
        ? poiAnchor(loc, "boss")
        : anchor(C.siteFor(loc), "boss") || anchor(C.siteFor(loc), "toll_boss");
      if (ba) {
        b.pos.set(
          ba.x,
          G.world.groundHeight(ba.x, ba.z, (ba.y || 0) + 0.6, 0.3),
          ba.z,
        );
        b.home = { x: ba.x, z: ba.z, r: 4 };
        b.aiMode = "guard";
      }
      b.name = "Raider Boss";
      b.maxHp = Math.round(b.maxHp * 1.7);
      b.hp = b.maxHp;
      b.dr += 10;
      b.accuracy = 1.25;
      b.xp = Math.round(b.xp * 2.5);
      b.voice = "raider";
      b.isBoss = true;
      const wid = C.pickWeapon("raider", (loc.level || 5) + 4);
      if (wid) {
        b.equipWeapon(wid);
        b.inventory.push([wid, 1]);
      }
      try {
        if (!G.isStub("items") && G.items.rollLoot) {
          const r = G.items.rollLoot("raider_boss", b.level);
          if (Array.isArray(r))
            for (const e of r) b.inventory.push([e[0], e[1]]);
        }
      } catch (e) {
        /* ignore */
      }
    }
    // Rooftop / ledge snipers where the landmark provides a nest (Chrysler's gargoyle platform)
    const sa = !interior && anchor(C.siteFor(loc), "sniper");
    if (
      sa &&
      (loc.faction === "raiders" ||
        loc.faction === "continuity" ||
        loc.faction === "brutes")
    ) {
      const stype = loc.faction === "raiders" ? "raider" : loc.spawns[0];
      const wid =
        loc.faction === "continuity"
          ? null
          : C.FALLBACK_WEAPONS.sniper_rifle ||
              (!G.isStub("weapons") && G.weapons.getDef("sniper_rifle"))
            ? "sniper_rifle"
            : null;
      const s = G.actors.spawn({
        type: stype,
        level: (lvlBase !== null ? lvlBase : loc.level || 5) + 1,
        pos: { x: sa.x, y: sa.y || 0, z: sa.z },
        yaw: typeof sa.yaw === "number" ? sa.yaw : 0,
        ai: "guard",
        holdPos: true,
        weapon: wid || undefined,
        faction: loc.faction,
        name: loc.faction === "raiders" ? "Raider Marksman" : undefined,
        home: { x: sa.x, z: sa.z, r: 0.8 },
        _group: g.id,
      });
      if (s) {
        s.sight = Math.max(s.sight || 0, 150);
        s.accuracy = Math.max(s.accuracy || 1, 1.5);
        g.actors.push(s);
        if (wid && s.inventory && !s.inventory.some((e) => e[0] === wid))
          s.inventory.push([wid, 1]);
        if (warden) s.warden = warden;
      }
    }
    g.state = "active";
  }
  /** Interior spawn from the map's named anchors (the subway: spawn1..spawn6). */
  function mapAnchorSpawn(loc, idx, used) {
    if (G.isStub("map") || typeof G.map.getAnchor !== "function") return null;
    const area = loc.interior;
    for (let k = 0; k < 6; k++) {
      const n = "spawn" + (((idx + k) % 6) + 1);
      if (used.has(n)) continue;
      let v = null;
      try {
        v = G.map.getAnchor(area, n);
      } catch (e) {
        v = null;
      }
      if (v && typeof v.x === "number") {
        used.add(n);
        return { x: v.x, y: v.y || 0, z: v.z };
      }
    }
    return null;
  }
  /**
   * POI interiors (CONTRACT: every POI / landmark_interiors cell publishes spawn1..spawn6 and often `boss`
   * through the shared `G.pois.getAnchor(idOrInteriorKey, name)`). Looked up by interior key, then by location
   * id. Once every authored spot is taken, extra members share a random one (validated jitter), never the void.
   */
  function poiAnchor(loc, name) {
    if (!G.pois || G.pois.__stub || typeof G.pois.getAnchor !== "function")
      return null;
    for (const key of [loc.interior, loc.id, C.siteFor(loc)]) {
      if (!key) continue;
      let v = null;
      try {
        v = G.pois.getAnchor(key, name);
      } catch (e) {
        v = null;
      }
      if (v && isFinite(v.x) && isFinite(v.z)) {
        const y0 = isFinite(v.y) ? v.y : 0;
        const y = G.world.groundHeight(v.x, v.z, y0 + 0.6, 0.3);
        return {
          x: v.x,
          y: isFinite(y) && Math.abs(y - y0) < 1.5 ? y : y0,
          z: v.z,
          yaw: v.yaw,
        };
      }
    }
    return null;
  }
  function poiAnchorSpawn(loc, idx, used) {
    const found = [];
    for (let k = 1; k <= 12; k++) {
      const n = "spawn" + k;
      const v = poiAnchor(loc, n);
      if (!v) {
        if (k > 6) break;
        continue;
      }
      found.push([n, v]);
    }
    if (!found.length) return null;
    for (let k = 0; k < found.length; k++) {
      const e = found[(idx + k) % found.length];
      if (!used.has("poi:" + e[0])) {
        used.add("poi:" + e[0]);
        return e[1];
      }
    }
    return jitterFree(C.pick(found)[1], 2.2, 0.4);
  }
  /** A free standing spot within r of p on the same floor (falls back to p itself). */
