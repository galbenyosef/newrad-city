// play-inline-253 02 — opts
// Lines 21-302 of readable/play-inline-253.pretty.js (statement-aligned).
  const PF = G._pbr;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const BK = (PF.bk = {});

  /**
   * Run fn() with geometry of batch b in a translated frame (ox,oy,oz) and every PF.col offset the same way,
   * so interiors can be authored in cell-local coordinates. Lib glows queued meanwhile are offset too.
   */
  BK.inFrame = function (b, ox, oy, oz, fn) {
    const prevM = b.M,
      prevOff = PF._off,
      g0 = PF.glows.length;
    b.frame(new THREE.Matrix4().makeTranslation(ox, oy, oz));
    PF._off = { x: ox, y: oy, z: oz };
    try {
      fn();
    } finally {
      b.frame(prevM);
      PF._off = prevOff;
      for (let i = g0; i < PF.glows.length; i++)
        PF.glows[i].pos.add(new THREE.Vector3(ox, oy, oz));
    }
  };

  /**
   * Built-up laced member between points a→c: two flange bars offset ±w/2 along `side`
   * (unit vector perpendicular to the member), depth d, with zig-zag lacing on both faces.
   * opts: {flange: thickness (0.22), lace: spacing (≈w), laceKey, noLace}
   */
  BK.laced = function (b, key, a, c, w, d, side, opts) {
    opts = opts || {};
    const ft = opts.flange || Math.max(0.16, w * 0.16);
    const dir = new THREE.Vector3().subVectors(c, a);
    const len = dir.length();
    if (len < 0.05) return;
    dir.normalize();
    const s = side.clone().normalize();
    const n = new THREE.Vector3().crossVectors(dir, s).normalize(); // face normal (depth direction)
    const off = (k) => s.clone().multiplyScalar(k);
    // flanges
    for (const sg of [-1, 1]) {
      const oa = a.clone().add(off(sg * (w / 2 - ft / 2))),
        oc = c.clone().add(off(sg * (w / 2 - ft / 2)));
      beamOriented(b, key, oa, oc, ft, d, s, 0.5);
    }
    if (opts.noLace || w < 0.35) return;
    const lk = opts.laceKey || key;
    const step = opts.lace || Math.max(0.6, w * 1.1);
    const nSeg = Math.max(1, Math.round(len / step));
    for (const face of [-1, 1]) {
      const fo = n.clone().multiplyScalar(face * (d / 2 - 0.03));
      let prev = null;
      for (let i = 0; i <= nSeg; i++) {
        const t = i / nSeg;
        const p = a
          .clone()
          .lerp(c, t)
          .add(off((i % 2 ? 1 : -1) * (w / 2 - ft)))
          .add(fo);
        if (prev) b.beam(lk, prev, p, 0.07, 0.07, { noAO: true, grime: 0.4 });
        prev = p;
      }
    }
  };
  // -------------------------------------------------------------------
  // Guastavino-style vaults (inward-facing parametric surfaces, tile UVs)
  // -------------------------------------------------------------------
  /**
   * Barrel vault along X (x0..x1) centred on zc, radius R (half-span), springing at ys, rise = R*sy.
   * Faces point down/inward. tile: metres per texture repeat.
   */
  BK.barrelX = function (b, key, x0, x1, zc, R, ys, sy, opts) {
    opts = opts || {};
    const tile = opts.tile || 2.4,
      len = x1 - x0,
      arc = Math.PI * R * (0.5 + 0.5 * (sy || 1));
    const g = PF.surface(
      (u, v, out) => {
        const a = u * Math.PI;
        out.set(
          x0 + v * len,
          ys + Math.sin(a) * R * (sy || 1),
          zc + Math.cos(a) * R,
        );
      },
      opts.nu || 14,
      Math.max(1, Math.round(len / 3)),
      {
        us: Math.max(1, Math.round(arc / tile)),
        vs: Math.max(1, Math.round(len / tile)),
      },
    );
    b.add(key, g, {
      uv: "keep",
      grime: opts.grime === undefined ? 0.25 : opts.grime,
      noAO: true,
    });
  };
  /** Barrel vault along Z (z0..z1) centred on xc. */
  BK.barrelZ = function (b, key, z0, z1, xc, R, ys, sy, opts) {
    opts = opts || {};
    const tile = opts.tile || 2.4,
      len = z1 - z0,
      arc = Math.PI * R * (0.5 + 0.5 * (sy || 1));
    const g = PF.surface(
      (u, v, out) => {
        const a = u * Math.PI;
        out.set(
          xc - Math.cos(a) * R,
          ys + Math.sin(a) * R * (sy || 1),
          z0 + v * len,
        );
      },
      opts.nu || 14,
      Math.max(1, Math.round(len / 3)),
      {
        us: Math.max(1, Math.round(arc / tile)),
        vs: Math.max(1, Math.round(len / tile)),
      },
    );
    b.add(key, g, {
      uv: "keep",
      grime: opts.grime === undefined ? 0.25 : opts.grime,
      noAO: true,
    });
  };
  /**
   * Groin vault over a rectangular bay (cx, cz, half sizes hx, hz): intersection of two barrels springing at ys,
   * crown at ys + rise. The diagonal groins read clearly with the herringbone tile.
   */
  BK.groin = function (b, key, cx, cz, hx, hz, ys, rise, opts) {
    opts = opts || {};
    const tile = opts.tile || 2.4,
      n = opts.n || 14;
    const g = PF.surface(
      (u, v, out) => {
        const a = 2 * u - 1,
          c = 2 * v - 1;
        const h = Math.max(
          Math.sqrt(Math.max(0, 1 - a * a)),
          Math.sqrt(Math.max(0, 1 - c * c)),
        );
        out.set(cx + a * hx, ys + rise * h, cz + c * hz);
      },
      n,
      n,
      {
        us: Math.max(1, Math.round((2 * hx) / tile)),
        vs: Math.max(1, Math.round((2 * hz) / tile)),
      },
    );
    b.add(key, g, {
      uv: "keep",
      grime: opts.grime === undefined ? 0.25 : opts.grime,
      noAO: true,
    });
  };
  /** Column with a flared tile capital (the Bridgemarket "mushroom" piers). */
  BK.vaultPier = function (b, key, capKey, x, z, ys, r, opts) {
    opts = opts || {};
    b.box(opts.baseKey || "granite_block", x, 0, z, r * 2.6, 0.6, r * 2.6, {
      seg: false,
      grime: 0.6,
    });
    b.cyl(key, x, 0.6, z, r, r * 1.08, ys - 1.8, 12, { hSeg: 2, grime: 0.5 });
    b.lathe(
      capKey,
      [
        [r, 0],
        [r * 1.25, 0.35],
        [r * 1.9, 0.9],
        [r * 2.6, 1.2],
      ],
      12,
      x,
      ys - 1.2,
      z,
      { grime: 0.3 },
    );
    if (opts.collide !== false)
      PF.col(x, z, r * 2.2, r * 2.2, 0, ys, 0, { walkable: false });
  };

  /** Box beam from a→c whose local X is aligned with `side` (w along side, d along side×dir). */
  const _q1 = new THREE.Quaternion(),
    _m = new THREE.Matrix4(),
    _bx = new THREE.Vector3(),
    _by = new THREE.Vector3(),
    _bz = new THREE.Vector3();
  function beamOriented(b, key, a, c, w, d, side, grime) {
    const dir = new THREE.Vector3().subVectors(c, a);
    const len = dir.length();
    if (len < 1e-4) return;
    _by.copy(dir).normalize();
    _bx.copy(side).addScaledVector(_by, -side.dot(_by)).normalize();
    _bz.crossVectors(_bx, _by).normalize();
    _m.makeBasis(_bx, _by, _bz);
    _q1.setFromRotationMatrix(_m);
    const geo = new THREE.BoxGeometry(w, len, d);
    geo.translate(0, len / 2, 0);
    const m = new THREE.Matrix4().compose(a, _q1, new THREE.Vector3(1, 1, 1));
    b.add(key, geo, { m, grime: grime === undefined ? 0.5 : grime });
  }
  BK.beamOriented = beamOriented;

  /** Eyebar chain a→c in the XY-ish plane: n parallel flat bars (height h, thickness t) spread along z by gap. */
  BK.eyebars = function (b, key, a, c, n, h, t, gap, zAxis) {
    const za = zAxis || V3(0, 0, 1);
    for (let i = 0; i < n; i++) {
      const o = (i - (n - 1) / 2) * gap;
      const oa = a.clone().addScaledVector(za, o),
        oc = c.clone().addScaledVector(za, o);
      beamOriented(b, key, oa, oc, h, t, perpUp(a, c, za), 0.45);
    }
  };
  /** In-plane "up" perpendicular for a member a→c lying in the plane normal to za. */
  function perpUp(a, c, za) {
    const d = new THREE.Vector3().subVectors(c, a).normalize();
    return new THREE.Vector3().crossVectors(za, d).normalize();
  }
  BK.perpUp = perpUp;

  /** Pin (short cylinder along z) at a panel point. */
  BK.pin = function (b, key, x, y, z, len, r) {
    b.cyl(
      key,
      x,
      y - (len || 1.6) / 2 + 0,
      z,
      r || 0.3,
      r || 0.3,
      len || 1.6,
      8,
      { hSeg: 1, rx: Math.PI / 2, m: null, grime: 0.4 },
    );
  };

  /**
   * Deck slab along X: x0..x1, z0..z1, top y. Asphalt top, concrete edge fascia, optional lane paint.
   * opts: {thick, lanes: [z...] dashed centre lines, collide (true), surface, fascia key}
   */
  BK.deckSlab = function (b, x0, x1, z0, z1, y, opts) {
    opts = opts || {};
    const th = opts.thick || 0.6;
    b.boxMM(opts.key || "asphalt", x0, y - th, z0, x1, y, z1, {
      grime: 0.6,
      segLen: 6,
    });
    if (opts.fascia !== false)
      for (const zz of [z0, z1])
        b.boxMM(
          opts.fascia || "concrete_dark",
          x0,
          y - th - 0.25,
          zz - 0.15,
          x1,
          y - th + 0.05,
          zz + 0.15,
          { grime: 0.7, segLen: 8 },
        );
    for (const lz of opts.lanes || []) {
      for (let x = x0 + 1; x < x1 - 3; x += 9)
        b.boxMM("stripe_cream", x, y, lz - 0.08, x + 3, y + 0.012, lz + 0.08, {
          grime: 0.7,
          noAO: true,
          seg: false,
        });
    }
    if (opts.collide !== false) {
      // split long slabs so the collider grid stays tidy
      const n = Math.max(1, Math.ceil((x1 - x0) / 40));
      for (let i = 0; i < n; i++) {
        const a = x0 + ((x1 - x0) * i) / n,
          c = x0 + ((x1 - x0) * (i + 1)) / n;
        PF.colMM(a, y - th, z0, c, y, z1, {
          surface: opts.surface || "concrete",
        });
      }
    }
  };

  /** Parapet railing between world points [[x,z,y],...] (y = walking surface): posts + two rails + collider. */
