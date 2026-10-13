// play-inline-118 05 — yaw
// Lines 1015-1336 of readable/play-inline-118.pretty.js (statement-aligned).
  function shelf(r, x, z, f, w, h, o) {
    o = o || {};
    const b = r.b,
      rr = K.rng(o.seed || Math.round(x * 13 + z * 7));
    const c = Math.cos(f),
      s = Math.sin(f),
      W = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
    b.box(o.mat || "wood", x, 0, z, w, h, 0.45, {
      yaw: f,
      faces: "nsewt",
      grime: 0.5,
    });
    const levels = Math.max(2, Math.floor(h / 0.5));
    for (let k = 1; k <= levels; k++) {
      const y = (k * h) / (levels + 1);
      const p = W(0, 0.2);
      b.box(o.mat || "wood", p[0], y, p[1], w, 0.03, 0.06, { yaw: f });
      for (let i = 0; i < Math.floor(w / 0.22); i++) {
        if (rr() < 0.25) continue;
        const q = W(-w / 2 + 0.12 + i * 0.22 + rr() * 0.04, 0.12 + rr() * 0.06);
        const kind = o.goods || "mixed",
          t = [0x8a3a2a, 0x3a5a7a, 0xc8a040, 0x5a7a3a, 0xd8d0c0, 0x6a4a8a][
            Math.floor(rr() * 6)
          ];
        if (kind === "bottles" || (kind === "mixed" && rr() < 0.4))
          b.cyl(
            rr() < 0.3 ? "lit_warm" : "glass",
            q[0],
            y + 0.03,
            q[1],
            0.035,
            0.03,
            0.26,
            6,
            { tint: rr() < 0.3 ? 0x8a5a2a : t },
          );
        else if (kind === "radios") {
          b.box("wood_dark", q[0], y + 0.03, q[1], 0.2, 0.16, 0.12, { yaw: f });
          const dq = W(-w / 2 + 0.12 + i * 0.22, 0.2);
          b.geo("lit_warm", T.sphereLo, {
            x: dq[0],
            y: y + 0.11,
            z: dq[1],
            s: 0.025,
            tint: 0xffa040,
          });
        } else if (kind === "cans")
          b.cyl("metal", q[0], y + 0.03, q[1], 0.05, 0.05, 0.12, 6, {
            tint: t,
          });
        else
          b.box(
            rr() < 0.5 ? "fabric" : "metal",
            q[0],
            y + 0.03,
            q[1],
            0.14 + rr() * 0.08,
            0.1 + rr() * 0.18,
            0.14,
            { yaw: f + rr() * 0.4, tint: t, grime: 0.4 },
          );
      }
    }
    K.colRot(x, z, w, 0.45, 0, h, f, { surface: "wood" });
  }
  function cot(r, x, z, yaw, o) {
    o = o || {};
    const b = r.b,
      c = Math.cos(yaw),
      s = Math.sin(yaw),
      W = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
    b.box("metal_dark", x, 0.32, z, 0.9, 0.06, 1.95, { yaw });
    for (const q of [
      [-0.42, -0.92],
      [0.42, -0.92],
      [-0.42, 0.92],
      [0.42, 0.92],
    ]) {
      const p = W(q[0], q[1]);
      b.beam(
        "metal_dark",
        p[0],
        0,
        p[1],
        p[0],
        q[1] < 0 ? 0.75 : 0.5,
        p[1],
        0.035,
      );
    }
    b.box("fabric", x, 0.38, z, 0.84, 0.12, 1.86, {
      yaw,
      tint: o.tint || 0xb8a888,
      grime: 0.7,
    });
    const pl = W(0, -0.72);
    b.box("fabric", pl[0], 0.5, pl[1], 0.55, 0.1, 0.32, {
      yaw,
      tint: 0xd8d0c0,
      grime: 0.5,
    });
    const bl = W(0, 0.3);
    b.box("fabric", bl[0], 0.5, bl[1], 0.88, 0.05, 1.1, {
      yaw: yaw + 0.04,
      tint: o.blanket || 0x5a4a6a,
      grime: 0.5,
    });
    K.colRot(x, z, 0.9, 1.95, 0, 0.5, yaw, { surface: "carpet" });
  }
  function locker(r, x, z, f, n, o) {
    o = o || {};
    const b = r.b,
      c = Math.cos(f),
      s = Math.sin(f),
      W = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
    for (let i = 0; i < n; i++) {
      const p = W((i - (n - 1) / 2) * 0.46, 0);
      b.box(o.mat || "paint_green", p[0], 0, p[1], 0.44, 1.9, 0.45, {
        yaw: f,
        grime: 0.5,
        tint: o.tint,
      });
      const q = W((i - (n - 1) / 2) * 0.46, 0.23);
      for (let k = 0; k < 3; k++)
        b.box("black_metal", q[0], 1.5 + k * 0.08, q[1], 0.26, 0.02, 0.02, {
          yaw: f,
        });
      if (i % 3 === 1) {
        const dd = W((i - (n - 1) / 2) * 0.46 + 0.1, 0.4);
        b.box(o.mat || "paint_green", dd[0], 0.05, dd[1], 0.42, 1.8, 0.03, {
          yaw: f + 0.9,
          tint: o.tint,
        });
      }
    }
    K.colRot(x, z, n * 0.46, 0.45, 0, 1.9, f, { surface: "metal" });
  }
  function sofa(r, x, z, f, w, col) {
    const b = r.b,
      c = Math.cos(f),
      s = Math.sin(f),
      W = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
    b.box("fabric", x, 0, z, w, 0.45, 0.85, { yaw: f, tint: col, grime: 0.5 });
    const bk = W(0, -0.35);
    b.box("fabric", bk[0], 0.45, bk[1], w, 0.5, 0.2, {
      yaw: f,
      tint: col,
      grime: 0.5,
    });
    for (const sd of [-1, 1]) {
      const a = W(sd * (w / 2 - 0.1), 0);
      b.box("fabric", a[0], 0.45, a[1], 0.2, 0.22, 0.85, {
        yaw: f,
        tint: col,
        grime: 0.5,
      });
    }
    K.colRot(x, z, w, 0.85, 0, 0.45, f, { surface: "carpet" });
  }
  // lived-in floors: litter drifts, stains and scuffs in free floor spots (never on the way in / out), corner junk
  const CLUTTER = {
    clinic: 0.45,
    gallery: 1,
    robo: 1.2,
    pawn: 0.35,
    opry: 0.7,
    oracle: 0.3,
    mayor: 0.35,
    power: 1.3,
    depot: 1.3,
    bunk: 1.0,
    barracks: 0.6,
    club: 0.15,
    speak: 1.0,
  };
  function clutter(r) {
    const k = CLUTTER[r.key] !== undefined ? CLUTTER[r.key] : 0.6;
    if (!k || !K.dclGround) return;
    const Wd = G.world,
      rr = K.rng(r.key.length * 131 + Math.round(r.cx));
    const free = (x, z, rds) => {
      for (const c of Wd.query(
        x - rds - 0.5,
        z - rds - 0.5,
        x + rds + 0.5,
        z + rds + 0.5,
      ))
        if (c.maxY > 0.15 && c.minY < 2.0 && Wd.pointInCollider(c, x, z, rds))
          return false;
      return true;
    };
    const nearDoor = (x, z) => Math.hypot(x - r.doorX, z - (r.z1 - 1.2)) < 2.2;
    const area = (r.x1 - r.x0) * (r.z1 - r.z0),
      n = Math.round((area / 7) * k);
    let placed = 0;
    for (let i = 0; i < n * 4 && placed < n; i++) {
      const x = r.x0 + 0.5 + rr() * (r.x1 - r.x0 - 1),
        z = r.z0 + 0.5 + rr() * (r.z1 - r.z0 - 1);
      if (
        nearDoor(x, z) ||
        !free(x, z, 0.25) ||
        Wd.groundHeight(x, z, 0.4, 0) > 0.05
      )
        continue;
      const q = rr();
      if (q < 0.55)
        K.dclGround(
          r.b,
          rr() < 0.5 ? "litter1" : "litter2",
          x,
          z,
          0.6 + rr() * 0.6,
          0.6 + rr() * 0.6,
          rr() * 6.3,
          { y: 0.012 + (placed % 5) * 0.002 },
        );
      else
        K.dclGround(
          r.b,
          q < 0.8 ? "stain" : "crack",
          x,
          z,
          0.8 + rr() * 1.4,
          0.8 + rr() * 1.4,
          rr() * 6.3,
          { y: 0.01 + (placed % 5) * 0.002 },
        );
      placed++;
    }
    // junk in two corners: a squashed carton, a bottle, a scatter of paper
    for (const c of [
      [r.x0 + 0.45, r.z0 + 0.45],
      [r.x1 - 0.45, r.z0 + 0.45],
    ]) {
      if (rr() > k || !free(c[0], c[1], 0.3)) continue;
      r.b.box("wood", c[0], 0, c[1], 0.45, 0.28, 0.35, {
        yaw: rr() * 3,
        tint: 0xb89a70,
        grime: 0.7,
      });
      r.b.cyl("glass", c[0] + 0.3, 0, c[1] + 0.1, 0.04, 0.04, 0.24, 6, {
        tint: 0x5a7a3a,
      });
    }
  }
  function finish(r) {
    try {
      clutter(r);
    } catch (e) {
      G.reportError("landmarks_a:neon_clutter_" + r.key, e);
    }
    r.b.finish(r.grp, { cast: false });
    r.g.finish(r.grp, { interior: true, nightOpacity: 0.9, dayOpacity: 0.9 });
    r.sp.finish(r.grp, { interior: true, night: 1 });
    try {
      if (!G.isStub("atmos") && G.atmos && G.atmos.addFixtureLight)
        for (const f of r.fix)
          G.atmos.addFixtureLight(
            new THREE.Vector3(f[0], f[1], f[2]),
            f[3],
            f[4],
          );
    } catch (e) {
      G.reportError("landmarks_a:neon_fixtures", e);
    }
  }
  let P = null;

  // ------------------------------------------------------------------
  // Containers & story beats bound to OUR furniture.
  // props turns every loot* / safe / desk / locker / … anchor into a NEW container prop, which put a second safe, desk or
  // duffle bag inside the safes and desks these rooms already model. Those anchors are now registered NON-enumerable
  // (G.landmarks.getAnchor still finds them; props' anchor scan skips them) and the container is created on our own
  // geometry (model:false) once the rpg module is up. Terminals / notes / tape reels / keys / workbenches: same timing.
  //
  // LOCKS (G.locks; registered at build and again at initDone, the unlock is always in these rooms or on the street):
  //   lma_neon_clinic_chems     code 3186  — clinic intake terminal, "Inventory (restricted)"
  //   lma_neon_pawn_safe        code 7041  — bar napkin on a card table in the Speakeasy
  //   lma_neon_mayor_desk       key lma_neon_mayor_desk_key — on top of the Mayor's filing cabinets
  //   lma_neon_mayor_safe       code 1927  — Crowe's memo inside the Mayor's desk
  //   lma_neon_depot_strongbox  code 5509  — freight depot terminal, "Memo — Guard Escort Rates"
  //   lma_neon_armory_ammo      code 2618  — barracks terminal, "Standing Orders"
  //   lma_neon_speakeasy_gate   code 20142 — chalk scrawl beside the 42nd St gate (41_neon_town.js, Read)
  // ------------------------------------------------------------------
  const CONTAINERS = [],
    STORY = [],
    LOCKS = [];
  /** Declare a lock (audit + cheat menu); kept so it can be re-registered once the locks module is up. */
  function lock(spec) {
    LOCKS.push(spec);
    K.lockReg(spec);
    return spec;
  }
  /** A code / passcode the player has just read or heard. */
  const learn = (id) => K.lockLearn(id);
  function hiddenAnchor(rec, name, x, y, z, yaw) {
    const v = new THREE.Vector3(x, y, z);
    v.yaw = yaw || 0;
    Object.defineProperty(rec.anchors, name, {
      value: v,
      enumerable: false,
      configurable: true,
      writable: true,
    });
    return v;
  }
  /** o: {id, name, kind, loot, lock?:{G.locks spec}, items?, x, y (interaction height), z, anchor?:[name, yaw]} (world coords). */
  function addContainer(rec, o) {
    if (o.anchor) hiddenAnchor(rec, o.anchor[0], o.x, 0, o.z, o.anchor[1] || 0);
    if (o.lock) lock(o.lock);
    CONTAINERS.push(o);
  }
  /** Items that only live inside our containers (defined before the containers are filled). */
  const INNER_ITEMS = [];
  function defineItem(d) {
    try {
      if (!G.isStub("items") && G.items.define && !G.items.get(d.id))
        G.items.define(d);
    } catch (e) {
      G.reportError("landmarks_a:neon_item_" + d.id, e);
    }
  }
