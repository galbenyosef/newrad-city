// play-inline-160 02 — dflt
// Lines 39-184 of readable/play-inline-160.pretty.js (statement-aligned).
  const P = G._pu;
  const PI = P.PI,
    HP = P.HP,
    TAU = P.TAU;
  P.onPreReady = P.onPreReady || [];
  P.onBuilt = P.onBuilt || [];
  P.onInitDone = P.onInitDone || [];
  P.tick = P.tick || [];

  const FLOOR = { amnh: 5, dakota: 5, tiffany: 5 }; // the cells' FLOOR_Y lift (see NN_<poi>_interior.js)
  /** Local cell coordinates (as written in the interior files) → world. */
  const W = (key, x, y, z) => {
    const o = P.I(key);
    return new THREE.Vector3(o.x + x, o.y + (FLOOR[key] || 0) + y, o.z + z);
  };
  const live = (ns) => !G.isStub(ns) && !!G[ns];
  const sfx = (name, pos, o) => {
    try {
      G.sfx.play(name, Object.assign({ pos, volume: 0.8 }, o || {}));
    } catch (e) {
      /* sound optional */
    }
  };
  const give = (id, n) => {
    try {
      if (live("inventory") && (!live("items") || G.items.get(id)))
        G.inventory.add(id, n || 1);
    } catch (e) {
      /* */
    }
  };
  const skill = (id, dflt) => {
    try {
      return live("rpg") && G.rpg.skill ? G.rpg.skill(id) : dflt;
    } catch (e) {
      return dflt;
    }
  };
  const attr = (k, dflt) => {
    try {
      return live("rpg") && typeof G.rpg.attr === "function"
        ? G.rpg.attr(k) || dflt
        : dflt;
    } catch (e) {
      return dflt;
    }
  };

  // ------------------------------------------------------------------
  // placement validation against the real colliders
  // ------------------------------------------------------------------
  const Wd = () => G.world;
  function floorOk(x, y, z) {
    const h = Wd().groundHeight(x, z, y + 0.45, 0.05);
    return Math.abs(h - y) < 0.4 ? h : null;
  }
  function blocked(x, y, z, r) {
    const w = Wd();
    if (
      typeof w.query !== "function" ||
      typeof w.pointInCollider !== "function"
    )
      return false;
    for (const c of w.query(x - r, z - r, x + r, z + r)) {
      if (c.maxY <= y + 0.35 || c.minY >= y + 1.7) continue;
      if (c.tag === "poi_guard" && c.maxY - c.minY < 0.2) continue;
      if (w.pointInCollider(c, x, z, r)) return true;
    }
    return false;
  }
  /** Nearest valid spot to p (world) within maxR: floor within 0.4 m of p.y, r m of free space. Returns Vector3 or null. */
  function snap(p, r, maxR) {
    r = r || 0.35;
    maxR = maxR === undefined ? 2.5 : maxR;
    const test = (x, z) => {
      const h = floorOk(x, p.y, z);
      if (h === null || blocked(x, h, z, r)) return null;
      return new THREE.Vector3(x, h, z);
    };
    let v = test(p.x, p.z);
    if (v) return v;
    for (let rr = 0.4; rr <= maxR + 1e-6; rr += 0.4) {
      const n = Math.max(8, Math.round(rr * 10));
      for (let k = 0; k < n; k++) {
        const a = (k / n) * TAU;
        v = test(p.x + Math.cos(a) * rr, p.z + Math.sin(a) * rr);
        if (v) return v;
      }
    }
    return null;
  }
  const segDist2 = (p, a, c) => {
    const dx = c.x - a.x,
      dz = c.z - a.z,
      L = dx * dx + dz * dz || 1e-6;
    const t = Math.max(
      0,
      Math.min(1, ((p.x - a.x) * dx + (p.z - a.z) * dz) / L),
    );
    const qx = a.x + dx * t - p.x,
      qz = a.z + dz * t - p.z;
    return qx * qx + qz * qz;
  };
  P.threatStats = {
    traps: 0,
    trapsSkipped: [],
    garrison: 0,
    garrisonSkipped: [],
    books: 0,
  };

  // ==================================================================
  // TRAPS
  // ==================================================================
  const traps = [];
  let TS = {}; // id → 'armed' | 'tripped' | 'disarmed' | 'taken'
  let spotted = {}; // id → true (this session: spotted message shown)
  const stateOf = (t) => TS[t.id] || "armed";
  const LABEL = {
    tripwire: "Tripwire",
    shotgun: "Tripwire",
    beartrap: "Bear Trap",
    mine: "Frag Mine",
    chime: "Tin Can Alarm",
  };
  const SPOT = {
    tripwire: "a tripwire rigged to a grenade bouquet",
    shotgun: "a tripwire running to a rigged shotgun",
    beartrap: "a bear trap",
    mine: "a frag mine",
    chime: "a tin-can alarm strung across the gap",
  };
  P.saveHooks.threats = {
    save: () => ({ traps: Object.assign({}, TS) }),
    load: (d) => {
      TS = Object.assign({}, (d && d.traps) || {});
      spotted = {};
      for (const t of traps) {
        t.fuse = -1;
        t.beep = 0;
      }
      refreshAll();
    },
  };

  /** Visual of one trap (non-lit batch, parented to the interior root → hidden outside the cell). */
