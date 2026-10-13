// play-inline-142 02 — opts
// Lines 26-274 of readable/play-inline-142.pretty.js (statement-aligned).
  const LB = G._lb;
  const TAU = Math.PI * 2;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);

  // --------------------------------------------------------------------
  // Glazing: a bilinear patch of panes with mullions (works for quads and
  // — with the two top corners equal — triangles). Panes face `out`.
  // opts: {nu, nv, hole(iu,iv) → true to leave the cell open, broken, missing, mullion, seed, key}
  // --------------------------------------------------------------------
  function glazing(b, P00, P10, P01, P11, out, opts) {
    const nu = opts.nu,
      nv = opts.nv,
      r = LB.rng(opts.seed || 1);
    const at = (u, v) => {
      const a = P00.clone().lerp(P10, u),
        c = P01.clone().lerp(P11, u);
      return a.lerp(c, v);
    };
    const hole = opts.hole || (() => false);
    const mw = opts.mullion === undefined ? 0.1 : opts.mullion;
    // one triangle with per-pane uvs (ua..: [u,v] of each corner inside its pane)
    const tri = (key, a, c, d, ua, uc, ud) => {
      const n = new THREE.Vector3()
        .subVectors(c, a)
        .cross(new THREE.Vector3().subVectors(d, a));
      if (n.dot(out) < 0) {
        let t = c;
        c = d;
        d = t;
        t = uc;
        uc = ud;
        ud = t;
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute(
        "position",
        new THREE.BufferAttribute(
          new Float32Array([a.x, a.y, a.z, c.x, c.y, c.z, d.x, d.y, d.z]),
          3,
        ),
      );
      g.setAttribute(
        "uv",
        new THREE.BufferAttribute(
          new Float32Array([ua[0], ua[1], uc[0], uc[1], ud[0], ud[1]]),
          2,
        ),
      );
      g.computeVertexNormals();
      b.add(key, g, { uv: "keep", noAO: true, grime: 0.12 });
    };
    for (let iu = 0; iu < nu; iu++)
      for (let iv = 0; iv < nv; iv++) {
        if (hole(iu, iv)) continue;
        const roll = r();
        if (roll < (opts.missing || 0)) continue; // pane gone: the hall shows through
        const br =
          roll <
          (opts.missing || 0) + (opts.broken === undefined ? 0.2 : opts.broken);
        const key =
          opts.key ||
          (br ? (r() < 0.3 ? "glass_broken" : "pane_cracked") : "pane");
        const u0 = iu / nu,
          u1 = (iu + 1) / nu,
          v0 = iv / nv,
          v1 = (iv + 1) / nv;
        const A = at(u0, v0),
          B = at(u1, v0),
          C = at(u1, v1),
          D = at(u0, v1);
        const fl = r() < 0.5; // mirror some panes so the sheen / cracks vary
        const U0 = fl ? 1 : 0,
          U1 = fl ? 0 : 1;
        tri(key, A, B, C, [U0, 0], [U1, 0], [U1, 1]);
        if (C.distanceToSquared(D) > 1e-6)
          tri(key, A, C, D, [U0, 0], [U1, 1], [U0, 1]);
      }
    if (mw <= 0) return;
    const bm = (p, q) => {
      if (p.distanceToSquared(q) > 1e-4)
        b.beam(opts.frame || "iron", p, q, mw, mw * 1.6, {
          grime: 0.15,
          noAO: true,
        });
    };
    // mullions drawn per cell edge, skipped where every cell touching that edge is open (a breach leaves them snapped off)
    const open = (iu, iv) =>
      iu < 0 || iu >= nu || iv < 0 || iv >= nv || hole(iu, iv);
    for (let iu = 0; iu <= nu; iu++)
      for (let iv = 0; iv < nv; iv++) {
        if (open(iu - 1, iv) && open(iu, iv)) continue;
        bm(at(iu / nu, iv / nv), at(iu / nu, (iv + 1) / nv));
      }
    for (let iv = 0; iv <= nv; iv++)
      for (let iu = 0; iu < nu; iu++) {
        if (open(iu, iv - 1) && open(iu, iv)) continue;
        bm(at(iu / nu, iv / nv), at((iu + 1) / nu, iv / nv));
      }
  }
  LB.glazing = glazing;

  /** Hipped glass roof over [x0,x1]×[z0,z1] from y0, rising `rise`, ridge along the longer axis. */
  function glassHip(b, x0, x1, z0, z1, y0, rise, opts) {
    opts = opts || {};
    const xc = (x0 + x1) / 2,
      zc = (z0 + z1) / 2,
      alongZ = z1 - z0 >= x1 - x0;
    const half = alongZ ? (x1 - x0) / 2 : (z1 - z0) / 2;
    const top = y0 + rise;
    const R0 = alongZ ? V(xc, top, z0 + half) : V(x0 + half, top, zc),
      R1 = alongZ ? V(xc, top, z1 - half) : V(x1 - half, top, zc);
    const c00 = V(x0, y0, z0),
      c10 = V(x1, y0, z0),
      c01 = V(x0, y0, z1),
      c11 = V(x1, y0, z1);
    const base = Object.assign({ mullion: 0.09 }, opts);
    const du = opts.pane || 1.8;
    const nvS = Math.max(2, Math.round(Math.hypot(half, rise) / du));
    if (alongZ) {
      const nuL = Math.max(1, Math.round((z1 - z0) / du)),
        nuE = Math.max(1, Math.round((x1 - x0) / du));
      glazing(
        b,
        c00,
        c01,
        R0,
        R1,
        V(-1, 1, 0),
        Object.assign({}, base, {
          nu: nuL,
          nv: nvS,
          seed: (opts.seed || 1) + 1,
        }),
      );
      glazing(
        b,
        c11,
        c10,
        R1,
        R0,
        V(1, 1, 0),
        Object.assign({}, base, {
          nu: nuL,
          nv: nvS,
          seed: (opts.seed || 1) + 2,
        }),
      );
      glazing(
        b,
        c10,
        c00,
        R0,
        R0,
        V(0, 1, -1),
        Object.assign({}, base, {
          nu: nuE,
          nv: nvS,
          seed: (opts.seed || 1) + 3,
        }),
      );
      glazing(
        b,
        c01,
        c11,
        R1,
        R1,
        V(0, 1, 1),
        Object.assign({}, base, {
          nu: nuE,
          nv: nvS,
          seed: (opts.seed || 1) + 4,
        }),
      );
    } else {
      const nuL = Math.max(1, Math.round((x1 - x0) / du)),
        nuE = Math.max(1, Math.round((z1 - z0) / du));
      glazing(
        b,
        c10,
        c00,
        R1,
        R0,
        V(0, 1, -1),
        Object.assign({}, base, {
          nu: nuL,
          nv: nvS,
          seed: (opts.seed || 1) + 1,
        }),
      );
      glazing(
        b,
        c01,
        c11,
        R0,
        R1,
        V(0, 1, 1),
        Object.assign({}, base, {
          nu: nuL,
          nv: nvS,
          seed: (opts.seed || 1) + 2,
        }),
      );
      glazing(
        b,
        c00,
        c01,
        R0,
        R0,
        V(-1, 1, 0),
        Object.assign({}, base, {
          nu: nuE,
          nv: nvS,
          seed: (opts.seed || 1) + 3,
        }),
      );
      glazing(
        b,
        c11,
        c10,
        R1,
        R1,
        V(1, 1, 0),
        Object.assign({}, base, {
          nu: nuE,
          nv: nvS,
          seed: (opts.seed || 1) + 4,
        }),
      );
    }
    // ridge & hip rafters (heavier steel)
    b.beam("iron", R0, R1, 0.2, 0.3, { grime: 0.2 });
    for (const [c, R] of [
      [c00, R0],
      [c10, alongZ ? R0 : R1],
      [c01, alongZ ? R1 : R0],
      [c11, R1],
    ])
      b.beam("iron", c, R, 0.2, 0.3, { grime: 0.2 });
    b.boxMM("iron", x0 - 0.15, y0 - 0.25, z0 - 0.15, x1 + 0.15, y0, z1 + 0.15, {
      seg: false,
      grime: 0.3,
    }); // curb
  }
  LB.glassHip = glassHip;

  // --------------------------------------------------------------------
  // Classical stone elevation along a wall line.
  //   o = [x,z] start, u = unit along the wall, n = unit outward normal, L length, y0 floor, H height, yG ground.
  // --------------------------------------------------------------------
