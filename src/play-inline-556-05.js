// play-inline-556 05 — def
// Lines 1425-1663 of readable/play-inline-556.pretty.js (statement-aligned).
  const ROSTER = roster();
  const BY_ID = {};
  for (const r of ROSTER) BY_ID[r.id] = r;

  // ------------------------------------------------------------------
  // Spawning (newGame / load)
  // ------------------------------------------------------------------
  const town = { recs: new Map(), bunks: [], spawned: false };
  function spawnAll() {
    town.recs.clear();
    town.bunks = series("bunk_", 16);
    town.bunkUsed = new Set();
    town.skipped = [];
    for (const def of ROSTER) {
      try {
        // an NPC who IS a place's service (Annie's gallery, Dottie's beds) only exists once that place is built
        if (def.needsPlace && !placeOf(def.place)) {
          town.skipped.push(def.id + " (no " + def.place + ")");
          continue;
        }
        const w = def.where || [[], null];
        const s = spot(w[0], w[1], {
          requireAnchor: !!def.requireAnchor || !w[1],
          maxR: def.maxR,
        });
        if (!s) {
          town.skipped.push(def.id + " (no anchor)");
          continue;
        }
        const d = Object.assign({}, def);
        for (const k of [
          "role",
          "where",
          "routine",
          "guard",
          "sniper",
          "gate",
          "requireAnchor",
          "maxR",
          "homeR",
          "place",
          "needsPlace",
        ])
          delete d[k];
        d.pos = { x: s.x, y: s.y, z: s.z };
        d.yaw = s.yaw || 0;
        d.lookYaw = s.yaw || 0;
        d.home = {
          x: s.x,
          z: s.z,
          r:
            def.homeR ||
            (def.ai === "wander" ? 6 : def.ai === "patrol" ? 3 : 1.5),
        };
        if (def.ai === "patrol") d.patrol = patrolRoute(def.id === "neon_pat2");
        if (def.sniper) {
          d.holdPos = true;
          d.aggroRange = 150;
        }
        const a = L.spawnNPC(d);
        if (!a) continue;
        if (def.guard) {
          a.safeGuard = "times_square";
          a.neonGuard = true;
        }
        if (def.sniper) a.accuracy = 1.4;
        // crowd LOD budget: the square shows ~30 people at once; step down to the light body mesh beyond 12 m
        // (characters' default is ~34 m; faces keep their close-up LOD within 10 m either way)
        if (a.char && typeof a.char.lodDist === "number")
          a.char.lodDist = Math.min(a.char.lodDist, def.sniper ? 40 : 12);
        const rec = {
          id: def.id,
          def,
          a,
          post: s,
          act: null,
          dest: null,
          leg: null,
          door: null,
          moveT: 0,
          lastX: s.x,
          lastZ: s.z,
          greetT: 0,
          hawkT: 0,
          pickT: 0,
        };
        const sm = /^market_stall_(\d+)(?:→|$)/.exec(s.name || "");
        if (sm && def.role === "merchant") rec.stall = Number(sm[1]);
        town.recs.set(def.id, rec);
      } catch (e) {
        G.reportError("quests:neon spawn " + def.id, e);
      }
    }
    town.spawned = true;
  }
  function patrolRoute(reverse) {
    const pts = series("crowd_", 20).map((a) => ({ x: a.x, z: a.z }));
    let out =
      pts.length >= 4
        ? reverse
          ? pts.filter((p, i) => i % 2)
          : pts.filter((p, i) => !(i % 2))
        : [];
    if (out.length < 3) {
      // fallback loop through the bow-tie plazas and past each gate (validated, off geometry)
      const raw = [
        ["plaza", -2, 0],
        ["center", 0, 12],
        ["entrance_south", 3, -4],
        ["center", 14, 0],
        ["center", 0, -20],
        ["entrance", 4, 6],
        ["plaza", -6, -10],
      ];
      out = [];
      for (const [n, dx, dz] of raw) {
        const s = spot([], { near: [n], dx, dz });
        if (s) out.push({ x: s.x, z: s.z });
      }
      if (reverse) out.reverse();
    }
    return out.length
      ? out
      : [
          { x: TS.x - 8, z: TS.z },
          { x: TS.x + 8, z: TS.z },
        ];
  }

  // ------------------------------------------------------------------
  // Destinations per activity
  // ------------------------------------------------------------------
  function freeBunk(rec) {
    if (rec.bunk && !rec.bunk.gone) return rec.bunk;
    for (let i = 0; i < town.bunks.length; i++)
      if (!town.bunkUsed.has(i)) {
        town.bunkUsed.add(i);
        const b = town.bunks[i];
        rec.bunk = { x: b.x, y: b.y, z: b.z, yaw: b.yaw, i, real: true };
        return rec.bunk;
      }
    // every cot taken: a bedroll on the Bunkhouse floor between the cots (never out in the street)
    if (town.bunks.length) {
      for (let k = 0; k < 4; k++) {
        const b = pick(town.bunks);
        const s = L.freeSpot(
          b.x + (Math.random() - 0.5) * 2.4,
          b.z + (Math.random() - 0.5) * 2.4,
          b.y,
          { maxR: 2.5 },
        );
        if (s && !s.forced) {
          rec.bunk = {
            x: s.x,
            y: s.y,
            z: s.z,
            yaw: Math.random() * 6.28,
            real: false,
            floor: true,
          };
          return rec.bunk;
        }
      }
    }
    // no bunk anchors (yet): sleep in a quiet corner of the bunkhouse / the NW shacks
    const s = spot([], {
      near: ["bunk_door", "settler6", "entrance"],
      dx: (Math.random() - 0.5) * 10,
      dz: 4 + Math.random() * 6,
    });
    rec.bunk = s
      ? { x: s.x, y: s.y, z: s.z, yaw: Math.random() * 6.28, real: false }
      : null;
    return rec.bunk;
  }
  function randomOf(names, fb) {
    const pool = [];
    for (const n of names) {
      const a = rawAnchor(n);
      if (a) pool.push(a);
    }
    const a = pool.length ? pick(pool) : null;
    if (a) {
      const s = L.freeSpot(a.x, a.z, a.y, { maxR: 3 });
      if (s && !s.forced)
        return { x: s.x, y: s.y, z: s.z, yaw: a.yaw, real: true };
    }
    if (!fb) return null;
    const s = spot([], {
      near: fb.near,
      dx: fb.dx + (Math.random() - 0.5) * (fb.spread || 8),
      dz: fb.dz + (Math.random() - 0.5) * (fb.spread || 8),
    });
    return s
      ? { x: s.x, y: s.y, z: s.z, yaw: Math.random() * 6.28, real: false }
      : null;
  }
  const nums = (b, n) => {
    const o = [];
    for (let i = 1; i <= n; i++) o.push(b + i);
    return o;
  };
  /** Which stall number each market merchant keeps (filled at spawn) — customers queue at stalls that are open. */
  const FOOD_STALLS = [5, 6, 12];
  /**
   * Customer spot in front of stall n: the exterior's `market_stall_<n>_customer` anchor when it exists,
   * else ~2 m in front of the merchant's spot (actor yaw faces (-sin, -cos)). Faces the counter.
   */
  function customerSpot(n, openOnly) {
    const m = rawAnchor("market_stall_" + n);
    if (!m) return null;
    if (openOnly) {
      const keeper = Array.from(town.recs.values()).find((r) => r.stall === n);
      if (keeper && !(keeper.act === "work" && keeper.leg === "at"))
        return null;
    }
    const c = rawAnchor("market_stall_" + n + "_customer");
    const jit = (Math.random() - 0.5) * 1.4;
    const bx = c ? c.x : m.x - Math.sin(m.yaw) * 2.1 + Math.cos(m.yaw) * jit,
      bz = c ? c.z : m.z - Math.cos(m.yaw) * 2.1 - Math.sin(m.yaw) * jit;
    const s = L.freeSpot(bx, bz, m.y || 0, { maxR: 1.6 });
    if (!s || s.forced) return null;
    return {
      x: s.x,
      y: s.y,
      z: s.z,
      yaw: Math.atan2(-(m.x - s.x), -(m.z - s.z)),
      real: true,
      stall: n,
    };
  }
  function stallVisit(list, openOnly) {
    const order = list.slice().sort(() => Math.random() - 0.5);
    for (const n of order) {
      const s = customerSpot(n, openOnly);
      if (s) return s;
    }
    return null;
  }
