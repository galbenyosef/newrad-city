/* src/poi_uptown/60_threats_interior.js */
/* =====================================================================
 * NEW RAD CITY — POI UPTOWN · 60 dungeon threats — interior
 *
 * The three hostile uptown dungeons (AMNH, The Dakota, Tiffany & Co.) get
 * the things that make a hostile building a dungeon:
 *
 *  TRAPS (P.trap)  tripwire + grenade bouquet, rigged shotgun on a chair,
 *                  bear trap, frag mine (beeps, then blows — still
 *                  disarmable while it beeps), tin-can alarm (wakes the
 *                  house). Walking through a wire trips it, jumping over
 *                  it does not. Every trap can be disarmed (E): bouquet →
 *                  frag grenades, mine → frag mine, rigged shotgun →
 *                  sawed-off + shells, and a fired shotgun can still be
 *                  taken. A good Perception / Explosives spots them first.
 *                  State saved (G.save 'poi_uptown' → threats).
 *  GARRISONS       authored enemy placements on top of combat's generic
 *                  location spawns (which only put 3-5 enemies in each
 *                  multi-floor building): the Pell dinner guests who play
 *                  dead until you lean over the table, Maniacs in the
 *                  basement corridor, shellbacks in the flooded Hall of
 *                  Ocean Life, giant roaches in Collections Storage, the
 *                  Tiffany raiders' fire-drum guards, a patrol on the
 *                  Silver floor, an attack dog, a vault-door guard and a
 *                  rifle lookout on the collapsed building next door.
 *                  Stable actor ids → combat's own save keeps who is dead.
 *                  Spawned lazily the first time the player gets near.
 *  VIGNETTES       the dead scavenger who mined the ripjaw nest (+note),
 *                  manuals where a sly level designer would hide them.
 *
 * Every placement is validated against the real colliders (floor under it,
 * nothing solid in it) and nudged to the nearest free spot, or skipped.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._pu) return;
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
  function buildTrapMeshes(t, root) {
    const mk = () => {
      const b = new P.Batch("trap_" + t.id, { grime: 0.4, ao: 0.2 });
      b.ground = t.floorY;
      b.aoH = 0.6;
      return b;
    };
    const armed = mk();
    const a = t.a,
      c = t.c,
      V = (x, y, z) => new THREE.Vector3(x, y, z);
    if (t.kind === "tripwire" || t.kind === "shotgun" || t.kind === "chime") {
      armed.rod("chrome", [a.x, a.y, a.z], [c.x, c.y, c.z], 0.009, 3, {
        noAO: true,
        grime: 0,
      });
      for (const p of [a, c])
        armed.cyl(
          "rust",
          p.x,
          t.floorY,
          p.z,
          0.012,
          0.02,
          p.y - t.floorY + 0.07,
          4,
        ); // stakes / eye screws
      if (t.kind === "tripwire") {
        const q = t.bouquet;
        for (let k = 0; k < 3; k++) {
          // three frags taped to the stake
          const gx = q.x + Math.cos(k * 2.1) * 0.075,
            gz = q.z + Math.sin(k * 2.1) * 0.075;
          armed.sphere("paint_green", gx, q.y + 0.06, gz, 0.05, {
            ws: 7,
            hs: 5,
            sy: 1.25,
            noAO: true,
          });
          armed.cyl("steel", gx, q.y + 0.12, gz, 0.014, 0.014, 0.035, 5);
          armed.torus("steel", gx + 0.02, q.y + 0.15, gz, 0.018, 0.004, TAU, {
            ts: 8,
            rs: 3,
          });
        }
        armed.cyl("rubber", q.x, q.y + 0.03, q.z, 0.1, 0.1, 0.05, 8, {
          open: true,
        }); // tape
      } else if (t.kind === "chime") {
        const n = 7;
        for (let k = 1; k < n; k++) {
          const p = a.clone().lerp(c, k / n);
          p.y -= 0.1 + Math.sin((k / n) * PI) * 0.04;
          armed.cyl(
            k % 2 ? "rust" : "chrome",
            p.x,
            p.y - 0.05,
            p.z,
            0.035,
            0.035,
            0.1,
            7,
            { rz: ((k % 3) - 1) * 0.25 },
          );
          armed.rod(
            "steel",
            [p.x, p.y + 0.05, p.z],
            [p.x, p.y + 0.1, p.z],
            0.003,
            3,
            { noAO: true },
          );
        }
      }
    } else if (t.kind === "beartrap") {
      const p = t.pos;
      const jaws = (bb, open) => {
        bb.cyl("rust", p.x, t.floorY + 0.005, p.z, 0.22, 0.22, 0.02, 12);
        bb.cyl("iron", p.x, t.floorY + 0.02, p.z, 0.05, 0.05, 0.03, 8);
        for (const sg of [-1, 1]) {
          if (open)
            bb.torus(
              "rust",
              p.x,
              t.floorY + 0.02,
              p.z + sg * 0.01,
              0.22,
              0.013,
              PI,
              { rx: -HP, ry: sg > 0 ? 0 : PI, ts: 12, rs: 4 },
            );
          else
            bb.torus("rust", p.x, t.floorY + 0.02, p.z, 0.2, 0.013, PI, {
              rx: sg * 0.25,
              ts: 12,
              rs: 4,
            });
          for (let k = 1; k < 8; k++) {
            const aa = (k / 8) * PI,
              lx = Math.cos(aa) * 0.21;
            if (open)
              bb.cyl(
                "rust",
                p.x + lx,
                t.floorY + 0.02,
                p.z + sg * (0.02 + Math.sin(aa) * 0.21),
                0.001,
                0.012,
                0.05,
                3,
                { rx: sg * HP },
              );
            else
              bb.cyl(
                "rust",
                p.x + lx,
                t.floorY + 0.02 + Math.sin(aa) * 0.19,
                p.z + sg * 0.03,
                0.001,
                0.012,
                0.05,
                3,
                { rx: -sg * 0.3 },
              );
          }
        }
        bb.rod(
          "iron",
          [p.x + 0.22, t.floorY + 0.01, p.z],
          [p.x + 0.6, t.floorY + 0.01, p.z + 0.25],
          0.007,
          3,
          { noAO: true },
        ); // chain
        bb.cyl("iron", p.x + 0.6, t.floorY, p.z + 0.25, 0.02, 0.03, 0.12, 5); // stake
      };
      jaws(armed, true);
      const sprung = mk();
      jaws(sprung, false);
      t.gSprung = sprung.build(root);
    } else if (t.kind === "mine") {
      const p = t.pos;
      armed.cyl("paint_green", p.x, t.floorY, p.z, 0.16, 0.18, 0.07, 14);
      armed.cyl("steel", p.x, t.floorY + 0.07, p.z, 0.07, 0.09, 0.03, 10);
      armed.cyl("rubber", p.x, t.floorY + 0.1, p.z, 0.02, 0.02, 0.025, 6);
      for (let k = 0; k < 6; k++) {
        const aa = (k / 6) * TAU;
        armed.box(
          "steel",
          p.x + Math.cos(aa) * 0.17 - 0.012,
          t.floorY + 0.01,
          p.z + Math.sin(aa) * 0.17 - 0.012,
          p.x + Math.cos(aa) * 0.17 + 0.012,
          t.floorY + 0.055,
          p.z + Math.sin(aa) * 0.17 + 0.012,
          { seg: false },
        );
      }
      // blinking arming light (own unlit mesh so it can blink)
      const led = new THREE.Mesh(
        new THREE.SphereGeometry(0.018, 6, 4),
        new THREE.MeshBasicMaterial({ color: 0xff2a1a }),
      );
      led.position.set(p.x + 0.045, t.floorY + 0.1, p.z);
      led.name = "pu_mine_led";
      root.add(led);
      t.led = led;
    }
    t.gArmed = armed.build(root);
    if (t.kind === "shotgun") {
      // the gun: a kitchen chair with a sawed-off lashed to its back, string to the trigger
      const gb = mk(),
        g = t.gun,
        d = t.gunDir,
        yaw = Math.atan2(d.x, d.z);
      const R = (lx, ly, lz) => {
        const s = Math.sin(yaw),
          co = Math.cos(yaw);
        return [g.x + lx * co + lz * s, ly, g.z - lx * s + lz * co];
      };
      const bx = (key, cx, y0, cz, w, h, dd) => {
        const q = R(cx, 0, cz);
        gb.boxC(key, q[0], y0, q[2], w, h, dd, { ry: yaw, seg: false });
      };
      const y0 = t.floorY;
      for (const [lx, lz] of [
        [-0.2, -0.2],
        [0.2, -0.2],
        [-0.2, 0.2],
        [0.2, 0.2],
      ])
        bx("wood_dark", lx, y0, lz, 0.04, 0.45, 0.04);
      bx("wood_dark", 0, y0 + 0.45, 0, 0.46, 0.04, 0.46);
      bx("wood_dark", 0, y0 + 0.49, -0.21, 0.44, 0.45, 0.04); // back rest
      const m0 = R(-0.028, 0, -0.2),
        m1 = R(-0.028, 0, 0.55),
        s0 = R(0.028, 0, -0.2),
        s1 = R(0.028, 0, 0.55);
      gb.rod(
        "paint_black",
        [m0[0], y0 + 0.72, m0[2]],
        [m1[0], y0 + 0.72, m1[2]],
        0.024,
        7,
      ); // twin barrels
      gb.rod(
        "paint_black",
        [s0[0], y0 + 0.72, s0[2]],
        [s1[0], y0 + 0.72, s1[2]],
        0.024,
        7,
      );
      bx("wood", 0, y0 + 0.66, 0.3, 0.1, 0.06, 0.3); // fore-end
      bx("wood", 0, y0 + 0.62, -0.32, 0.07, 0.12, 0.26); // cut-down stock
      bx("rubber", 0, y0 + 0.55, -0.2, 0.47, 0.06, 0.05); // lashing
      const tr = R(0, 0, -0.14);
      gb.rod(
        "steel",
        [tr[0], y0 + 0.64, tr[2]],
        [t.mid.x, t.floorY + 0.12, t.mid.z],
        0.003,
        3,
        { noAO: true },
      ); // trigger string
      t.gGun = gb.build(root);
    }
  }

  /**
   * def: {id, cell, kind, a/c (local wire ends, y = local floor), pos (local point kinds), bouquet (local), gun (local) + gunAt (local aim point), dmg, spot}
   * Built at initDone (colliders exist → validated).
   */
  const TRAP_DEFS = [
    // ---- Tiffany & Co. (raiders) ----
    {
      id: "tif_chime_gate",
      cell: "tiffany",
      kind: "chime",
      a: [-0.85, 0, 23.5],
      c: [1.95, 0, 23.5],
      h: 0.35,
      spot: 30,
    },
    {
      id: "tif_bouquet_stairs",
      cell: "tiffany",
      kind: "tripwire",
      a: [12.6, 6.8, 11.1],
      c: [15.4, 6.8, 11.1],
      h: 0.22,
      bouquet: [15.55, 6.8, 11.4],
      dmg: 60,
      spot: 45,
    },
    {
      id: "tif_bear_stock",
      cell: "tiffany",
      kind: "beartrap",
      pos: [-10.3, 0, -10],
      spot: 35,
    },
    {
      id: "tif_shotgun_vault",
      cell: "tiffany",
      kind: "shotgun",
      a: [-3.5, -5, -15.9],
      c: [-3.5, -5, -14.1],
      h: 0.25,
      gun: [1.8, -5, -15],
      gunAt: [-4.5, -5, -15],
      dmg: 45,
      spot: 50,
    },
    {
      id: "tif_mine_tunnel1",
      cell: "tiffany",
      kind: "mine",
      pos: [11.8, -5, -10.6],
      dmg: 65,
      spot: 40,
    },
    {
      id: "tif_mine_tunnel2",
      cell: "tiffany",
      kind: "mine",
      pos: [17.6, -5, -11.0],
      dmg: 65,
      spot: 40,
    },
    // ---- The Dakota: Mr. Ruiz the superintendent barricaded his office in March '67 ----
    {
      id: "dak_shotgun_super",
      cell: "dakota",
      kind: "shotgun",
      a: [-11.95, -4.5, 2.6],
      c: [-10.55, -4.5, 2.6],
      h: 0.25,
      gun: [-11.2, -4.5, -1.6],
      gunAt: [-11.2, -4.5, 3.8],
      dmg: 40,
      spot: 45,
    },
    {
      id: "dak_bear_boiler",
      cell: "dakota",
      kind: "beartrap",
      pos: [-14.2, -4.5, 7.7],
      spot: 35,
    },
    {
      id: "dak_chime_nest",
      cell: "dakota",
      kind: "chime",
      a: [-15, 4.5, -3.3],
      c: [-15, 4.5, -5.2],
      h: 0.35,
      spot: 30,
    },
    // ---- AMNH: the Pinkerton crew mined the matriarch's nest before she ate them ----
    // (the hall's door is the hole at x -30..-26 in the south wall z -4; the nest is past the "ripjaw fossil" plinth x -24..-16 z -12..-6)
    {
      id: "amnh_bouquet_dino",
      cell: "amnh",
      kind: "tripwire",
      a: [-33, 6, -7.2],
      c: [-24.15, 6, -7.2],
      h: 0.22,
      bouquet: [-24.4, 6, -6.9],
      dmg: 60,
      spot: 45,
    },
    {
      id: "amnh_mine_nest1",
      cell: "amnh",
      kind: "mine",
      pos: [-26.5, 6, -14.5],
      dmg: 70,
      spot: 40,
    },
    {
      id: "amnh_mine_nest2",
      cell: "amnh",
      kind: "mine",
      pos: [-21, 6, -13.4],
      dmg: 70,
      spot: 40,
    },
    {
      id: "amnh_bear_storage",
      cell: "amnh",
      kind: "beartrap",
      pos: [-30.5, 0, -21.5],
      spot: 35,
    },
  ];

  function makeTrap(def) {
    const key = def.cell;
    const it = P.interiors.find((i) => i.key === key);
    if (!it) return null;
    const t = {
      id: def.id,
      cell: key,
      kind: def.kind,
      dmg: def.dmg || 50,
      spotDC: def.spot || 40,
      fuse: -1,
      beep: 0,
    };
    if (def.pos) {
      const w = W(key, def.pos[0], def.pos[1], def.pos[2]);
      const s = snap(w, 0.3, 1.6);
      if (!s) return null;
      t.pos = s;
      t.floorY = s.y;
      t.mid = s.clone();
    } else {
      const wa = W(key, def.a[0], def.a[1], def.a[2]),
        wc = W(key, def.c[0], def.c[1], def.c[2]);
      const fa = floorOk(wa.x, wa.y, wa.z),
        fc = floorOk(wc.x, wc.y, wc.z);
      if (fa === null || fc === null) return null;
      t.floorY = Math.max(fa, fc);
      t.a = new THREE.Vector3(wa.x, t.floorY + (def.h || 0.25), wa.z);
      t.c = new THREE.Vector3(wc.x, t.floorY + (def.h || 0.25), wc.z);
      t.mid = t.a.clone().lerp(t.c, 0.5);
      if (def.bouquet) {
        const q = W(key, def.bouquet[0], def.bouquet[1], def.bouquet[2]);
        const fq = floorOk(q.x, q.y, q.z);
        t.bouquet = new THREE.Vector3(q.x, fq === null ? t.floorY : fq, q.z);
      }
      if (def.gun) {
        const g = W(key, def.gun[0], def.gun[1], def.gun[2]);
        const s = snap(g, 0.3, 1.2);
        if (!s) return null;
        t.gun = s;
        const at = W(key, def.gunAt[0], def.gunAt[1], def.gunAt[2]);
        t.gunDir = new THREE.Vector3(at.x - s.x, 0, at.z - s.z).normalize();
      }
    }
    buildTrapMeshes(t, it.root);
    // disarm / take interactable
    G.world.addInteractable({
      pos:
        t.kind === "shotgun"
          ? t.gun.clone().setY(t.gun.y + 0.7)
          : t.mid.clone().setY(Math.max(t.mid.y, t.floorY + 0.25)),
      radius: t.kind === "shotgun" ? 0.7 : 0.55,
      range: 2.6,
      priority: 3,
      label: () => (t.kind === "shotgun" ? "Rigged Shotgun" : LABEL[t.kind]),
      verb: () =>
        t.kind === "shotgun" && stateOf(t) === "tripped" ? "Take" : "Disarm",
      enabled: () =>
        stateOf(t) === "armed" ||
        (t.kind === "shotgun" && stateOf(t) === "tripped"),
      onInteract() {
        disarm(t);
      },
    });
    // a second focus point on the wire itself for the shotgun (you meet the wire before the gun)
    if (t.kind === "shotgun")
      G.world.addInteractable({
        pos: t.mid.clone(),
        radius: 0.5,
        range: 2.4,
        priority: 3,
        label: "Tripwire",
        verb: "Disarm",
        enabled: () => stateOf(t) === "armed",
        onInteract() {
          disarm(t);
        },
      });
    traps.push(t);
    return t;
  }

  function disarm(t) {
    const st = stateOf(t);
    if (t.kind === "shotgun" && st === "tripped") {
      TS[t.id] = "taken";
      give("sawed_off_shotgun", 1);
      refresh(t);
      sfx("pickup_weapon", t.gun);
      return;
    }
    if (st !== "armed") return;
    // a beeping mine can still be disarmed — FO3 rules — but it is a close thing with low Explosives
    TS[t.id] = "disarmed";
    t.fuse = -1;
    t.beep = 0;
    sfx("ui_select", t.mid);
    if (t.kind === "tripwire") {
      give("frag_grenade", 3);
      G.notify("You cut the wire and pocket the grenade bouquet.");
    } else if (t.kind === "shotgun") {
      give("sawed_off_shotgun", 1);
      give("ammo_12ga", 4);
      G.notify("You untie the trigger string and take the shotgun.");
    } else if (t.kind === "mine") {
      give("frag_mine", 1);
      G.notify("Frag mine disarmed.");
    } else if (t.kind === "beartrap") {
      sfx("melee_hit", t.pos, { volume: 0.5 });
      G.notify("You spring the bear trap with the butt of your weapon.");
    } else G.notify("You unhook the cans without a sound.");
    refresh(t);
  }

  function refresh(t) {
    const st = stateOf(t);
    if (t.gArmed) t.gArmed.visible = st === "armed";
    if (t.gSprung) t.gSprung.visible = st === "tripped";
    if (t.gGun) t.gGun.visible = st !== "taken" && st !== "disarmed";
    if (t.led) t.led.visible = st === "armed";
  }
  function refreshAll() {
    for (const t of traps) refresh(t);
  }

  function trip(t) {
    TS[t.id] = "tripped";
    const pp = G.player.pos;
    if (t.kind === "tripwire") {
      sfx("empty_click", t.bouquet, { volume: 1 });
      G.notify("*click*");
      t.fuse = 1.1;
      t.boomAt = t.bouquet.clone().setY(t.bouquet.y + 0.2);
    } else if (t.kind === "mine") {
      TS[t.id] = "armed"; // still disarmable while it beeps; becomes 'tripped' when it blows
      t.fuse = 1.25;
      t.beep = 0;
      t.boomAt = t.pos.clone().setY(t.pos.y + 0.15);
      return;
    } else if (t.kind === "beartrap") {
      sfx("melee_hit", t.pos, { volume: 1, pitch: 0.7 });
      try {
        G.player.damage(t.dmg ? Math.min(t.dmg, 22) : 20, {
          type: "melee",
          part: "leftLeg",
          source: null,
        });
      } catch (e) {
        /* */
      }
      try {
        if (live("rpg") && typeof G.rpg.damageLimb === "function")
          G.rpg.damageLimb("leftLeg", 55);
      } catch (e) {
        /* */
      }
      try {
        G.player.shake(0.4, 0.3);
      } catch (e) {
        /* */
      }
      G.notify("SNAP! A bear trap bites into your leg.");
    } else if (t.kind === "shotgun") {
      sfx("empty_click", t.mid);
      const g = t.gun.clone().setY(t.gun.y + 0.7),
        d = t.gunDir;
      setTimeout(() => {
        if (G.state === "title") return;
        sfx("gun_shotgun", g, { volume: 1.2 });
        try {
          if (G.fx && G.fx.muzzleFlash)
            G.fx.muzzleFlash(
              g.clone().addScaledVector(d, 0.45),
              d.clone(),
              "shotgun",
            );
        } catch (e) {
          /* */
        }
        try {
          if (G.fx && G.fx.flash) G.fx.flash(g, 0xffc070, 2.5, 0.08);
        } catch (e) {
          /* */
        }
        const p = G.player.pos,
          to = new THREE.Vector3(p.x - g.x, 0, p.z - g.z),
          dist = to.length();
        to.normalize();
        const inCone =
          dist < 11 && to.dot(d) > 0.9 && Math.abs(p.y - t.floorY) < 1.2;
        let los = true;
        try {
          los =
            !G.world.lineOfSight ||
            G.world.lineOfSight(g, new THREE.Vector3(p.x, p.y + 1.0, p.z));
        } catch (e) {
          los = true;
        }
        if (inCone && los && G.player.alive) {
          const dmg = Math.round(t.dmg * (dist < 4 ? 1 : 0.7));
          try {
            G.player.damage(dmg, {
              type: "ballistic",
              part: Math.random() < 0.5 ? "leftLeg" : "rightLeg",
              source: null,
            });
          } catch (e) {
            /* */
          }
        }
      }, 180);
    } else if (t.kind === "chime") {
      sfx("ricochet", t.mid, { volume: 1, pitch: 1.6 });
      setTimeout(
        () => sfx("ricochet", t.mid, { volume: 0.8, pitch: 1.9 }),
        140,
      );
      G.notify("Tin cans clatter along the wire!");
      alertHouse(t.mid, 32);
    }
    refresh(t);
  }
  /** Everyone hostile within r hears the cans. Uses combat's hearing when it is there, else walks them over. */
  function alertHouse(pos, r) {
    const C = G.__cmb;
    if (C && typeof C.noise === "function") {
      try {
        C.noise(pos, r, "player", "gun");
        return;
      } catch (e) {
        /* fall back */
      }
    }
    if (!live("actors") || typeof G.actors.inRadius !== "function") return;
    for (const a of G.actors.inRadius(pos, r)) {
      if (!a || a.dead || !a.hostile || !a.hostile()) continue;
      try {
        a.moveTo(
          pos.x + (Math.random() - 0.5) * 3,
          pos.z + (Math.random() - 0.5) * 3,
        );
      } catch (e) {
        /* */
      }
    }
  }
  function boom(t) {
    TS[t.id] = "tripped";
    refresh(t);
    const q = t.boomAt || t.mid;
    try {
      if (live("combat") && typeof G.combat.explode === "function")
        G.combat.explode(q.clone(), 3.6, t.dmg, {
          source: null,
          kind: "normal",
        });
      else {
        const d = G.player.pos.distanceTo(q);
        if (d < 3.6)
          G.player.damage(t.dmg * (1 - d / 3.6), { type: "explosive" });
        if (G.fx && G.fx.explosion) G.fx.explosion(q.clone(), 3);
      }
    } catch (e) {
      G.reportError("poi_uptown:trap boom", e);
    }
  }

  let blinkT = 0;
  function tickTraps(dt) {
    const p = G.player && G.player.pos;
    if (!p || !G.player.alive) return;
    blinkT += dt;
    const sneaking = !!G.player.sneaking;
    const onGround = G.player.onGround !== false;
    for (const t of traps) {
      if (!P.inCell(t.cell)) continue;
      // fuses (grenade bouquets, beeping mines)
      if (t.fuse > 0) {
        t.fuse -= dt;
        if (t.kind === "mine") {
          if (stateOf(t) !== "armed") {
            t.fuse = -1;
            continue;
          } // disarmed in time
          t.beep -= dt;
          if (t.beep <= 0) {
            t.beep = t.fuse > 0.6 ? 0.22 : 0.1;
            sfx("robot_beep", t.pos, { volume: 0.7, pitch: 2.2 });
          }
          if (t.led) t.led.visible = Math.floor(blinkT * 12) % 2 === 0;
        }
        if (t.fuse <= 0) {
          t.fuse = -1;
          boom(t);
        }
        continue;
      }
      if (stateOf(t) !== "armed") continue;
      if (t.led) t.led.visible = blinkT % 1.6 < 0.12;
      const dx = p.x - t.mid.x,
        dz = p.z - t.mid.z,
        d2 = dx * dx + dz * dz;
      if (d2 > 144) continue;
      // Perception / Explosives: spot it before stepping on it
      if (!spotted[t.id] && d2 < 36 && Math.abs(p.y - t.floorY) < 2.5) {
        spotted[t.id] = true;
        const score = attr("senses", 5) * 8 + skill("explosives", 15) * 0.5;
        if (score >= t.spotDC)
          G.notify("[Senses] You spot " + SPOT[t.kind] + ".");
      }
      const dy = p.y - t.floorY;
      if (dy < -0.3 || dy > 0.9) continue;
      if (t.kind === "mine") {
        const r = sneaking ? 1.3 : 2.2;
        if (d2 < r * r) {
          trip(t);
          sfx("robot_beep", t.pos, { volume: 0.9, pitch: 2.2 });
        }
      } else if (t.kind === "beartrap") {
        if (Math.hypot(p.x - t.pos.x, p.z - t.pos.z) < 0.42 && dy < 0.3)
          trip(t);
      } else {
        // wires: walking through trips them, jumping over does not
        if (onGround && dy < 0.3 && segDist2(p, t.a, t.c) < 0.3 * 0.3) trip(t);
      }
    }
  }

  // ==================================================================
  // GARRISONS (authored enemy placements, stable ids)
  // ==================================================================
  // at: local cell coords; opts: ai, patrol (local pts), dormant (play dead, wake radius), weapon, name, holdPos, level offset
  const GARRISON = {
    tiffany: [
      {
        id: "pu_g_tif_drum1",
        type: "raider",
        at: [-7.6, 0, 19.2],
        yaw: PI * 0.8,
        ai: "guard",
        name: "Raider",
        barks: ["Who's at the door?", "Your turn to watch the cans."],
      },
      {
        id: "pu_g_tif_drum2",
        type: "raider",
        at: [-4.4, 0, 21.4],
        yaw: -PI * 0.7,
        ai: "guard",
        weapon: "lead_pipe",
      },
      {
        id: "pu_g_tif_patrol",
        type: "raider",
        at: [-10, 6.8, 8.5],
        ai: "patrol",
        patrol: [
          [-10, 6.8, 8.5],
          [8, 6.8, 8.5],
          [8, 6.8, 20],
          [-9, 6.8, 20],
        ],
        weapon: "bolt_rifle_32",
      },
      {
        id: "pu_g_tif_dog",
        type: "dog",
        at: [-6.2, 0, -2.2],
        ai: "guard",
        faction: "raiders",
        name: "Raider Attack Dog",
      },
      {
        id: "pu_g_tif_vault",
        type: "raider",
        at: [5.6, -5, -12.4],
        yaw: PI,
        ai: "guard",
        name: "Raider Safecracker",
        weapon: "sawed_off_shotgun",
        barks: ["Forty-one... forty-two... damn it."],
      },
      {
        id: "pu_g_tif_lookout",
        type: "raider",
        exterior: "lookout",
        ai: "guard",
        holdPos: true,
        name: "Raider Lookout",
        weapon: "hunting_rifle",
        lvl: 1,
      },
    ],
    dakota: [
      // the Pell dinner party: guests slumped by the table, playing dead until you lean in
      {
        id: "pu_g_dak_guest1",
        type: "maniac",
        at: [12.6, 4.5, 10.6],
        dormant: 5,
        name: "Dinner Guest",
      },
      {
        id: "pu_g_dak_guest2",
        type: "maniac",
        at: [20.6, 4.5, 16.6],
        dormant: 5,
        name: "Dinner Guest",
      },
      {
        id: "pu_g_dak_guest3",
        type: "maniac",
        at: [21.8, 4.5, 10.4],
        dormant: 6,
        name: "Dinner Guest",
      },
      {
        id: "pu_g_dak_lounge",
        type: "maniac",
        at: [-21.5, 0, 9.6],
        dormant: 5,
      },
      { id: "pu_g_dak_base1", type: "maniac", at: [12, -4.5, 5], ai: "wander" },
      { id: "pu_g_dak_base2", type: "maniac", at: [22, -4.5, 5], ai: "wander" },
      {
        id: "pu_g_dak_hall2",
        type: "maniac",
        at: [-20, 4.5, 5],
        ai: "wander",
        name: "Maniac Doorman",
      },
      // outside: one slumped in the carriage passage, one wandering the courtyard (world coords)
      {
        id: "pu_g_dak_arch",
        type: "maniac",
        world: [-139.5, 0, -616.6],
        dormant: 6,
      },
      {
        id: "pu_g_dak_court",
        type: "maniac",
        world: [-160, 0, -619],
        ai: "wander",
      },
    ],
    amnh: [
      {
        id: "pu_g_amnh_lurk1",
        type: "shellback",
        at: [8, -4.5, -40],
        ai: "wander",
      },
      {
        id: "pu_g_amnh_lurk2",
        type: "shellback",
        at: [34, -4.5, -20],
        ai: "wander",
      },
      {
        id: "pu_g_amnh_roach1",
        type: "giant_roach",
        at: [-44, 0, -33],
        ai: "wander",
      },
      {
        id: "pu_g_amnh_roach2",
        type: "giant_roach",
        at: [-43, 0, -31.5],
        ai: "wander",
      },
      {
        id: "pu_g_amnh_roach3",
        type: "giant_roach",
        at: [-26, 0, -14],
        ai: "wander",
      },
      {
        id: "pu_g_amnh_rat1",
        type: "burrow_rat",
        at: [-48, 0, 8],
        ai: "wander",
      },
      {
        id: "pu_g_amnh_rat2",
        type: "burrow_rat",
        at: [-22, 0, 27],
        ai: "wander",
      },
      // outside: burrow rats burrowed into the Roosevelt terrace lawns on Central Park West (world coords)
      {
        id: "pu_g_amnh_out1",
        type: "burrow_rat",
        world: [-129.5, 0, -739],
        ai: "wander",
      },
      {
        id: "pu_g_amnh_out2",
        type: "burrow_rat",
        world: [-129.5, 0, -703],
        ai: "wander",
      },
    ],
  };
  const spawnedCell = {};
  function locLevel(key) {
    try {
      const l = G.LAYOUT.getLocation
        ? G.LAYOUT.getLocation(key)
        : (G.LAYOUT.LOCATIONS || []).find((x) => x.id === key);
      return (l && l.level) || 5;
    } catch (e) {
      return 5;
    }
  }
  function locFaction(key) {
    try {
      const l = G.LAYOUT.getLocation ? G.LAYOUT.getLocation(key) : null;
      return (l && l.faction) || null;
    } catch (e) {
      return null;
    }
  }
  function extAnchor(siteId, name) {
    const S = P.sites.find((s) => s.id === siteId);
    return S && S.anchors[name] ? S.anchors[name].clone() : null;
  }
  function spawnGarrison(key) {
    if (!live("actors") || typeof G.actors.spawn !== "function") return;
    spawnedCell[key] = true;
    const lvl = locLevel(key),
      fac = locFaction(key);
    for (const g of GARRISON[key]) {
      const ex = G.actors.get && G.actors.get(g.id);
      if (ex && !ex.removed) continue;
      let pos;
      if (g.exterior) {
        const a = extAnchor(key + "_ext", g.exterior);
        if (!a) continue;
        pos = a;
      } else if (g.world)
        pos = snap(
          new THREE.Vector3(g.world[0], g.world[1], g.world[2]),
          0.45,
          3,
        );
      else pos = snap(W(key, g.at[0], g.at[1], g.at[2]), 0.45, 2.8);
      if (!pos) {
        P.threatStats.garrisonSkipped.push(g.id);
        continue;
      }
      let wid = g.weapon;
      try {
        if (wid && live("items") && !G.items.get(wid)) wid = undefined;
      } catch (e) {
        wid = undefined;
      }
      const def = {
        id: g.id,
        type: g.type,
        level: Math.max(
          1,
          lvl + (g.lvl || 0) + (g.id.charCodeAt(g.id.length - 1) % 3) - 1,
        ),
        pos: { x: pos.x, y: pos.y, z: pos.z },
        yaw: typeof g.yaw === "number" ? g.yaw : Math.random() * TAU,
        ai: g.dormant ? "guard" : g.ai || "wander",
        noRespawn: true,
        home: { x: pos.x, z: pos.z, r: g.ai === "guard" || g.holdPos ? 2 : 8 },
      };
      const faction =
        g.faction ||
        (g.type === "raider"
          ? "raiders"
          : g.type === "maniac"
            ? "maniacs"
            : null) ||
        (fac === "raiders" ? "raiders" : null);
      if (faction) def.faction = faction;
      if (g.name) def.name = g.name;
      if (wid) def.weapon = wid;
      if (g.barks) def.barks = g.barks;
      if (g.holdPos) def.holdPos = true;
      if (g.patrol)
        def.patrol = g.patrol.map((q) => {
          const w = W(key, q[0], q[1], q[2]);
          return { x: w.x, z: w.z };
        });
      const a = P.safe("garrison:" + g.id, () => G.actors.spawn(def));
      if (!a) continue;
      P.threatStats.garrison++;
      if (g.sight)
        try {
          a.sight = Math.max(a.sight || 0, g.sight);
        } catch (e) {
          /* */
        }
      if (g.dormant && !a.dead)
        P.safe("dormant", () => {
          if (typeof a.setState === "function") {
            a.setState("dormant");
            a.denWake = g.dormant;
            if (typeof a.anim === "function") a.anim("dead");
          }
        });
    }
  }
  function tickGarrisons() {
    const pp = G.player && G.player.pos;
    if (!pp) return;
    for (const key in GARRISON) {
      if (spawnedCell[key]) continue;
      if (P.inCell(key)) {
        spawnGarrison(key);
        continue;
      }
      // the street-side members (Tiffany lookout, Dakota arch, AMNH lawn) must be in place before you walk up
      const s = G.LAYOUT.getSite ? G.LAYOUT.getSite(key) : null;
      if (
        s &&
        Math.abs(pp.x - (s.x0 + s.x1) / 2) < 260 &&
        Math.abs(pp.z - (s.z0 + s.z1) / 2) < 260
      )
        spawnGarrison(key);
    }
  }

  // ==================================================================
  // VIGNETTES & MANUALS (queued into the interior sites → spawned by 90_main at initDone)
  // ==================================================================
  function defineItems() {
    if (!live("items") || typeof G.items.define !== "function") return;
    const d = (def) =>
      P.safe("item:" + def.id, () => {
        if (!G.items.get(def.id)) G.items.define(def);
      });
    d({
      id: "pu_note_pinkerton",
      type: "note",
      name: "Pinkerton's Field Notes",
      title: "Scav crew — egg job, AMNH",
      weight: 0,
      value: 0,
      tags: ["note"],
      text:
        "Day 1. Buyer at the Plaza says a chef will pay two thousand scrip for one egg. ONE EGG. Dex says that's suspicious. Dex says everything is suspicious.\n\n" +
        "Day 2. Found the nest past the big lizard skeletons. Mother's out hunting. Laid two mines on the approach and a bouquet on the side aisle so nothing " +
        'sneaks up on us while we work. Dex took the bear traps down to the storage rooms "for the rats."\n\n' +
        "Day 3. She came back through the WALL. Not the door. The wall. Mines didn't even slow her down. If you're reading this, the mines are still there. " +
        "So is Dex, mostly.\n\n— P.",
    });
    d({
      id: "pu_note_ruiz",
      type: "note",
      name: "Note Pinned to a Chair",
      title: "To whoever",
      weight: 0,
      value: 0,
      tags: ["note"],
      text:
        "TO WHOEVER COMES DOWN HERE — the tenants on 2 are not tenants anymore. Mrs. Pell is still setting the table. I have locked myself in and rigged " +
        "the door, God forgive me. Do NOT come through the office door without cutting the string first. It is the shotgun from the Van Rensselaer gun " +
        "room, and it is loaded with both barrels.\n\n— M. Ruiz, Superintendent",
    });
  }
  const BOOKS = [
    { site: "amnh_int", id: "book_popular_circuits", at: [-55.2, 0, -9.6] }, // curator's office, by the desk
    { site: "amnh_int", id: "pu_note_pinkerton", at: [-27.2, 6, -18.6] }, // the dead scavenger in the Dinosaur Hall
    { site: "dakota_int", id: "book_art_of_the_pitch", at: [13.4, 4.5, -5.2] }, // the Pell study (senator's widow)
    { site: "dakota_int", id: "pu_note_ruiz", at: [-11.9, -4.5, -1.1] }, // on the rigged chair
    { site: "tiffany_int", id: "book_handyman", at: [-7.0, 0, -2.8] }, // the dead guard's reading
    {
      site: "tiffany_int",
      id: "book_riflemans_companion",
      at: [12.4, 6.8, 23.2],
    }, // raider bunks, by the workbench
  ];
  const PROPS = [
    {
      site: "amnh_int",
      type: "skeleton",
      at: [-27.6, 6, -19.6],
      yaw: 2.2,
      opts: { pose: "lying" },
    },
    {
      site: "amnh_int",
      type: "duffle_bag",
      at: [-26.7, 6, -20.7],
      yaw: 0.6,
      opts: {
        loot: "duffle_bag",
        items: [
          ["frag_mine", 1],
          ["rally_tonic", 1],
          ["scrip", 22],
        ],
      },
    },
  ];
  P.onBuilt.push(() => {
    for (const bk of BOOKS) {
      const S = P.sites.find((s) => s.id === bk.site);
      if (S) {
        S.pickup(bk.id, 1, bk.at[0], bk.at[1] + 0.02, bk.at[2]);
        P.threatStats.books++;
      }
    }
    for (const pr of PROPS) {
      const S = P.sites.find((s) => s.id === pr.site);
      if (S) S.prop(pr.type, pr.at[0], pr.at[1], pr.at[2], pr.yaw, pr.opts);
    }
  });

  // ==================================================================
  // lifecycle
  // ==================================================================
  P.onPreReady.push(defineItems);
  // CONTRACT anchor names every POI publishes: friendly settlements `merchant`, hostile ones `loot1..n` (aliases of existing spots)
  const ALIAS = {
    plaza_hotel: { merchant: "bartender" },
    carnegie_hall: { merchant: "vendor" },
    dakota: { loot1: "super_office", loot2: "storage", loot3: "parlour" },
    tiffany: { loot1: "security", loot2: "silver_floor", loot3: "vault" },
  };
  P.onInitDone.push(() => {
    for (const id in ALIAS) {
      const p = G.pois && G.pois[id];
      if (!p || !p.anchors) continue;
      for (const n in ALIAS[id])
        if (!p.anchors[n] && p.anchors[ALIAS[id][n]]) {
          const v = p.anchors[ALIAS[id][n]].clone();
          v.yaw = p.anchors[ALIAS[id][n]].yaw || 0;
          p.anchors[n] = v;
        }
    }
    for (const def of TRAP_DEFS) {
      const t = P.safe("trap:" + def.id, () => makeTrap(def));
      if (t) P.threatStats.traps++;
      else P.threatStats.trapsSkipped.push(def.id);
    }
    refreshAll();
  });
  P.onReset.push(() => {
    TS = {};
    spotted = {};
    for (const k in spawnedCell) delete spawnedCell[k];
    for (const t of traps) {
      t.fuse = -1;
      t.beep = 0;
    }
    refreshAll();
  });
  P.onNewGame.push(() => {
    refreshAll();
  });
  P.onLoaded.push(() => {
    for (const k in spawnedCell) delete spawnedCell[k];
    refreshAll();
  });
  let slowT = 0;
  P.tick.push((dt, realDt) => {
    if (dt > 0) tickTraps(Math.min(dt, 0.1));
    slowT -= realDt;
    if (slowT > 0) return;
    slowT = 0.5;
    tickGarrisons();
  });
  P.threats = { traps, TS: () => TS, trip, disarm, spawnGarrison, GARRISON };
})();
