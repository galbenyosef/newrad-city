// play-inline-513 04 — math
// Lines 1021-1366 of readable/play-inline-513.pretty.js (statement-aligned).
  function jitterFree(p, r, rad) {
    for (let k = 0; k < 8; k++) {
      const x = p.x + (Math.random() - 0.5) * 2 * r,
        z = p.z + (Math.random() - 0.5) * 2 * r;
      const y = C.freeSpot(x, z, rad, p.y, true);
      if (y === null || Math.abs(y - p.y) > 0.8) continue;
      if (
        !G.world.lineOfSight(
          new THREE.Vector3(p.x, p.y + 1, p.z),
          new THREE.Vector3(x, y + 1, z),
        )
      )
        continue;
      return { x, y, z };
    }
    return { x: p.x, y: p.y, z: p.z };
  }
  C.poiAnchor = poiAnchor;
  /** Interior spawn: relative to where the player arrived (door target) with LOS down the corridor. */
  function interiorSpawnPoint(loc, interior) {
    const P = G.player;
    const o = interior.origin;
    const base = Math.hypot(P.pos.x - o.x, P.pos.z - o.z) < 170 ? P.pos : o;
    for (let k = 0; k < 50; k++) {
      const ang = Math.random() * Math.PI * 2,
        rr = 14 + Math.random() * 32;
      const x = base.x + Math.sin(ang) * rr,
        z = base.z + Math.cos(ang) * rr;
      if (Math.abs(x - o.x) > 148 || Math.abs(z - o.z) > 148) continue;
      const y = C.freeSpot(x, z, 0.4, base.y, true);
      if (y === null || Math.abs(y - base.y) > 3) continue;
      if (
        !G.world.lineOfSight(
          new THREE.Vector3(base.x, base.y + 1.2, base.z),
          new THREE.Vector3(x, y + 1.2, z),
        ) &&
        k < 40
      )
        continue;
      // Must have a real floor or ceiling nearby (inside the built cell, not the void)
      const cs = G.world.query(x - 6, z - 6, x + 6, z + 6);
      if (!cs.length && k < 45) continue;
      return { x, y, z };
    }
    return null;
  }
  function spawnSettlementGroup(g) {
    const loc = g.data;
    let spec = C.SETTLEMENT_POP[loc.id] || [];
    // The Neon is populated in full by the quests module (47_neon_people): generics only as a fallback
    if (C.SETTLEMENT_QUEST_OWNED[loc.id] && !G.isStub("quests")) spec = [];
    const used = new Set();
    let n = 0;
    for (const s of spec) {
      for (let i = 0; i < s.count; i++) {
        n++;
        let p = null;
        for (const nm of [
          (s.ai === "guard" ? "guard" : "npc") + (i + 1),
          "settler" + n,
        ]) {
          if (used.has(nm)) continue;
          const a = anchor(loc.id, nm);
          if (a) {
            used.add(nm);
            p = { x: a.x, y: a.y || 0, z: a.z };
            break;
          }
        }
        if (!p) {
          for (let k = 0; k < 30 && !p; k++) {
            const ang = Math.random() * Math.PI * 2,
              rr = loc.r * (0.2 + Math.random() * 0.6);
            const x = loc.x + Math.sin(ang) * rr,
              z = loc.z + Math.cos(ang) * rr;
            const y = C.freeSpot(x, z, 0.4, 0, false);
            if (y !== null && Math.abs(y) < 2.5) p = { x, y, z };
          }
        }
        if (!p) continue;
        const wid = s.pool ? C.pickWeapon(s.pool, loc.level || 2) : "none";
        const a = G.actors.spawn({
          type: s.type,
          outfit: s.outfit,
          burn: s.burn,
          faction: s.faction || loc.faction || "settlers",
          name: s.name,
          voice: s.voice,
          level: Math.max(2, (loc.level || 1) + 2),
          pos: p,
          yaw: Math.random() * Math.PI * 2,
          ai: s.ai,
          weapon: wid || "none",
          noRespawn: true,
          home: {
            x: p.x,
            z: p.z,
            r: s.ai === "guard" ? 1.5 : Math.max(8, loc.r * 0.5),
          },
          _group: g.id,
          gender: Math.random() < 0.5 ? "m" : "f",
        });
        if (a) g.actors.push(a);
      }
    }
    g.state = "active";
  }

  // ------------------------------------------------------------------
  // Roaming encounters
  // ------------------------------------------------------------------
  C.roam = { nextT: 30, groups: [], n: 0 };
  function roamSpawnPoint(needWater) {
    const P = G.player;
    for (let k = 0; k < 30; k++) {
      const ang = Math.random() * Math.PI * 2,
        rr = 75 + Math.random() * 45;
      const x = P.pos.x + Math.sin(ang) * rr,
        z = P.pos.z + Math.cos(ang) * rr;
      if (!G.LAYOUT.isLand(x, z) || G.LAYOUT.isInterior(x)) continue;
      const loc = G.LAYOUT.locationAt(x, z);
      if (loc && !loc.hostile) continue; // never inside a friendly settlement
      if (C.inSafeZone && C.inSafeZone(x, z, 45)) continue; // …nor at the gates of a guarded town (45_safezone)
      if (needWater && !nearWater(x, z, 20)) continue;
      if (
        !needWater &&
        k < 20 &&
        !G.LAYOUT.isRoad(x, z) &&
        !G.LAYOUT.inPark(x, z)
      )
        continue;
      const y = C.freeSpot(x, z, 0.5, 0, false);
      if (y === null || Math.abs(y) > 1.5) continue;
      // Prefer spots the player can't currently see
      if (
        k < 22 &&
        G.world.lineOfSight(P.eye, new THREE.Vector3(x, y + 1.2, z))
      ) {
        const fx = P.forward.x,
          fz = P.forward.z;
        const dx = x - P.pos.x,
          dz = z - P.pos.z;
        if ((dx * fx + dz * fz) / rr > 0.3) continue;
      }
      return { x, y, z };
    }
    return null;
  }
  const WAGON_STOCK = [
    ["rally_tonic", 4],
    ["prussian_blue", 2],
    ["iodine_tabs", 2],
    ["purified_water", 5],
    ["fizzo_cola", 4],
    ["ammo_10mm", 80],
    ["ammo_308", 20],
    ["ammo_12ga", 24],
    ["ammo_556", 60],
    ["ammo_gyrojet", 18],
    ["frag_grenade", 3],
    ["leather_armor", 1],
    ["pistol_10mm", 1],
    ["hunting_rifle", 1],
    ["scrap_metal", 6],
    ["golden_plain_jerky", 3],
    ["franks_and_beans", 3],
  ];
  function spawnRoamGroup() {
    const P = G.player;
    // Guarded towns (The Neon): no roaming encounters while the player is inside or at the gates
    if (C.inSafeZone && C.inSafeZone(P.pos.x, P.pos.z, 70)) return;
    const district = G.LAYOUT.districtAt(P.pos.x, P.pos.z);
    const table = C.ENCOUNTERS[district];
    if (!table) return;
    const pl = C.playerLevel();
    const choices = table
      .filter((e) => !e[1].minLevel || pl >= e[1].minLevel)
      .map((e) => [e[1], e[0]]);
    if (!choices.length) return;
    const spec = C.weighted(choices);
    const water = !!(
      spec.types && spec.types.some((t) => C.typeDef(t[0]).amphibious)
    );
    const p = roamSpawnPoint(water);
    if (!p) return;
    const id = "roam_" + ++C.roam.n;
    const g = {
      id,
      kind: "roam",
      actors: [],
      state: "active",
      spawnT: G.time.elapsed,
    };
    const lvl = () => C.clamp(pl + C.randInt(-1, 2), 1, 30);
    const jitter = () => ({
      x: p.x + (Math.random() - 0.5) * 5,
      y: p.y,
      z: p.z + (Math.random() - 0.5) * 5,
    });
    // Wander toward the player's neighbourhood
    const home = { x: (p.x + P.pos.x) / 2, z: (p.z + P.pos.z) / 2, r: 30 };
    const patrolPts = [
      { x: p.x, z: p.z },
      {
        x: P.pos.x + (Math.random() - 0.5) * 40,
        z: P.pos.z + (Math.random() - 0.5) * 40,
      },
      { x: 2 * P.pos.x - p.x, z: 2 * P.pos.z - p.z },
    ];
    // roamers never plan a route through a guarded town (they still get shot if they chase you in)
    if (C.clampOutOfSafe) {
      for (const q of patrolPts) C.clampOutOfSafe(q, 12);
      C.clampOutOfSafe(home, 12);
    }
    if (spec.patrol === "covenant") {
      const n = C.randInt(2, 3);
      for (let i = 0; i < n; i++) {
        const a = G.actors.spawn({
          type: "covenant_warden",
          faction: "covenant",
          name: i === 0 ? "Covenant Warden" : "Covenant Lancer",
          voice: "covenant",
          level: Math.max(6, lvl()),
          pos: jitter(),
          ai: "patrol",
          patrol: patrolPts,
          weapon: C.pickWeapon("covenant_warden", 8),
          _group: id,
          _roaming: true,
          noRespawn: true,
        });
        if (a) g.actors.push(a);
      }
    } else if (spec.wagon) {
      const stock = WAGON_STOCK.filter(
        (s) =>
          G.isStub("items") ||
          typeof G.items.get !== "function" ||
          G.items.get(s[0]),
      );
      const m = G.actors.spawn({
        type: "human",
        outfit: "merchant",
        faction: "settlers",
        name: "Wagon Trader",
        voice: "merchant",
        level: 5,
        pos: jitter(),
        ai: "patrol",
        patrol: patrolPts,
        weapon: "pistol_10mm",
        merchant: { scrip: 350 + C.randInt(0, 300), stock, restock: 3 },
        _group: id,
        _roaming: true,
        noRespawn: true,
      });
      if (m) g.actors.push(m);
      for (let i = 0; i < 2; i++) {
        const a = G.actors.spawn({
          type: "human",
          outfit: "combat_armor",
          faction: "settlers",
          name: "Wagon Guard",
          voice: "guard",
          level: 6,
          pos: jitter(),
          ai: "patrol",
          patrol: patrolPts,
          weapon: C.pickWeapon("merchant_guard", 6),
          _group: id,
          _roaming: true,
          noRespawn: true,
        });
        if (a) g.actors.push(a);
      }
      if (Math.random() < 0.5) {
        const d = G.actors.spawn({
          type: "dog",
          faction: "settlers",
          name: "Wagon Dog",
          level: 4,
          pos: jitter(),
          ai: "patrol",
          patrol: patrolPts,
          _group: id,
          _roaming: true,
          noRespawn: true,
        });
        if (d) g.actors.push(d);
      }
    } else {
      for (const [type, count] of spec.types) {
        const td = C.typeDef(type);
        const n = td.small
          ? C.randInt(Math.max(2, count - 2), count)
          : C.randInt(Math.max(1, count - 1), count);
        for (let i = 0; i < n; i++) {
          const a = G.actors.spawn({
            type,
            level: lvl(),
            pos: jitter(),
            yaw: Math.random() * 6.28,
            ai: td.human ? "patrol" : "wander",
            patrol: patrolPts,
            home,
            name: undefined,
            _group: id,
            _roaming: true,
            noRespawn: true,
          });
          if (a) g.actors.push(a);
        }
      }
    }
    if (g.actors.length) C.roam.groups.push(g);
  }
  // ------------------------------------------------------------------
  // World reactions: Standing hit squads, a grateful stranger, faction patrols
  // (rate-limited to about one per two game-days)
  // ------------------------------------------------------------------
  C.roam.lastSpecialDay = -99;
  function ensureNote(id) {
    if (G.isStub("items") || typeof G.items.get !== "function") return false;
    try {
      if (G.items.get(id)) return true;
      const n = C.NOTES[id];
      if (!n || typeof G.items.define !== "function") return false;
      G.items.define({
        id,
        name: n.name,
        type: "note",
        title: n.title,
        text: n.text,
        weight: 0,
        value: n.value || 0,
        desc: n.title,
      });
      return !!G.items.get(id);
    } catch (e) {
      return false;
    }
  }
  /** Define the hit-squad notes up front (a saved game may carry them). */
  C.defineNotes = function () {
    for (const id in C.NOTES) ensureNote(id);
  };
