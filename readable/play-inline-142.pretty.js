/* src/landmarks_b/55_met_park.js */
/* =====================================================================
 * LANDMARKS B — THE MET, CENTRAL PARK SIDE (west elevation)
 *
 * The park front of the Met is the museum's 1970s–80s glass layer laid
 * against the Beaux-Arts stone:
 *  • north glass wing (a 1966 project, never finished) (north): a raking glass curtain wall between stone end
 *    piers, broken panes, a blown-in breach with a rubble spill, and the
 *    walk-in hall behind it (the Temple of Dendur hall is built by
 *    55_met_park_interior.js).
 *  • centre pavilion (also unfinished in 1967) (centre): a low stone pavilion under a hipped glass
 *    pyramid, with the red-brick Victorian-Gothic 1880 façade exposed
 *    behind it (lancets, polychrome bands, rose-window gable, pinnacles).
 *  • South wing: classical elevation — rusticated base, water table,
 *    pilasters per bay, two window tiers (square-headed / arched) with
 *    architraves, sills & keystones, string course, modillioned cornice,
 *    balustrade — and a north-light sawtooth skylight roof.
 *  • North wing roof: glazed lantern skylight.
 * Called from the Met builder (50_uptown.js) with its frame constants.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._lb) return;
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
  function facade(b, o, u, n, L, y0, H, yG, opt) {
    opt = opt || {};
    const K = LB.kit;
    const r = LB.rng(opt.seed || Math.round(o[0] * 7 + o[1] * 3));
    const ryB = Math.atan2(-u[1], u[0]); // box local X along the wall, local Z along ±n
    const ryF = Math.atan2(n[0], n[1]); // quads facing outward
    const at = (s, d) => [
      o[0] + u[0] * s + n[0] * d,
      o[1] + u[1] * s + n[1] * d,
    ];
    const bx = (key, s, d, y, w, h, dep, ex) => {
      const [x, z] = at(s, d);
      b.box(
        key,
        x,
        y,
        z,
        w,
        h,
        dep,
        Object.assign({ ry: ryB, seg: false }, ex || {}),
      );
    };
    const quad = (key, s, d, y, w, h, ex) => {
      const [x, z] = at(s, d);
      b.quad(
        key,
        x,
        y,
        z,
        w,
        h,
        Object.assign(
          { ry: ryF, uv: "box", noAO: true, grime: 0.12 },
          ex || {},
        ),
      );
    };
    const glassKey = () => {
      const q = r();
      return q < 0.2 ? "glass_broken" : q < 0.3 ? "planks" : "glass_dark";
    };
    // rusticated base with channelled joints, water table
    const baseTop = y0 + 3.0;
    bx("met_ashlar", L / 2, 0.2, yG, L + 0.4, baseTop - yG, 0.4, {
      seg: true,
      segLen: 3,
      grime: 0.75,
      aoH: 2.5,
    });
    for (let y = yG + 0.75; y < baseTop - 0.2; y += 0.75)
      bx("concrete_dark", L / 2, 0.405, y - 0.04, L + 0.38, 0.08, 0.02, {
        grime: 0.2,
      });
    bx("limestone", L / 2, 0.32, baseTop, L + 0.6, 0.35, 0.64, { grime: 0.5 });
    // bays & pilasters
    const nb = Math.max(1, Math.round(L / (opt.bay || 6.2))),
      bw = L / nb;
    const capY = y0 + H - 2.4;
    for (let i = 0; i <= nb; i++) {
      const s = i * bw;
      if (opt.skip && opt.skip(s)) continue;
      bx(
        "met_ashlar",
        s,
        0.2,
        baseTop + 0.35,
        1.0,
        capY - baseTop - 0.35,
        0.4,
        { grime: 0.45, seg: true, segLen: 4 },
      );
      bx("limestone", s, 0.26, baseTop + 0.35, 1.3, 0.5, 0.52, { grime: 0.5 }); // pilaster base
      bx("limestone", s, 0.3, capY - 0.6, 1.36, 0.6, 0.6, { grime: 0.4 }); // capital block
      bx("limestone", s, 0.42, capY - 0.95, 1.1, 0.3, 0.2, { grime: 0.3 }); // necking
    }
    // string course between the tiers
    bx("limestone", L / 2, 0.2, y0 + 8.1, L, 0.38, 0.4, { grime: 0.5 });
    for (let i = 0; i < nb; i++) {
      const s = (i + 0.5) * bw;
      if (opt.skipBay && opt.skipBay(s, i)) continue;
      // lower tier: square-headed window with architrave, sill and a small cornice head
      const w1 = 2.1,
        h1 = 3.2,
        yb1 = y0 + 4.2;
      quad(glassKey(), s, 0.02, yb1 + h1 / 2, w1, h1);
      bx("limestone", s - w1 / 2 - 0.12, 0.1, yb1, 0.24, h1, 0.2);
      bx("limestone", s + w1 / 2 + 0.12, 0.1, yb1, 0.24, h1, 0.2);
      bx("limestone", s, 0.1, yb1 + h1, w1 + 0.48, 0.26, 0.2);
      bx("limestone", s, 0.16, yb1 + h1 + 0.26, w1 + 0.9, 0.22, 0.32);
      bx("limestone", s, 0.16, yb1 - 0.2, w1 + 0.7, 0.2, 0.34);
      for (const dx of [-0.75, 0, 0.75])
        quad("iron", s + dx, 0.035, yb1 + h1 / 2, 0.05, h1, { grime: 0 }); // glazing bars
      // upper tier: tall arched window, moulded archivolt, keystone
      const w2 = 2.3,
        h2 = 3.1,
        yb2 = y0 + 9.0,
        rA = w2 / 2;
      const k2 = glassKey();
      quad(k2, s, 0.02, yb2 + h2 / 2, w2, h2);
      {
        const [x, z] = at(s, 0.02);
        b.add(k2, new THREE.CircleGeometry(rA, 12, 0, Math.PI), {
          m: LB.m4(x, yb2 + h2, z, ryF),
          uv: "box",
          noAO: true,
          grime: 0.1,
        });
        const [xa, za] = at(s, 0.08);
        b.add(
          "limestone",
          new THREE.RingGeometry(rA, rA + 0.34, 14, 1, 0, Math.PI),
          { m: LB.m4(xa, yb2 + h2, za, ryF), grime: 0.35 },
        );
      }
      bx("limestone", s - w2 / 2 - 0.17, 0.1, yb2, 0.34, h2, 0.2);
      bx("limestone", s + w2 / 2 + 0.17, 0.1, yb2, 0.34, h2, 0.2);
      bx("limestone", s, 0.18, yb2 + h2 + rA - 0.05, 0.42, 0.6, 0.36); // keystone
      bx("limestone", s, 0.18, yb2 - 0.22, w2 + 0.8, 0.22, 0.4); // sill
      quad("iron", s, 0.035, yb2 + h2 / 2, 0.05, h2, { grime: 0 });
      quad("iron", s, 0.035, yb2 + h2 * 0.55, w2, 0.05, { grime: 0 });
      // soot above the odd burnt-out window
      if (r() < 0.18)
        quad("concrete_dark", s, 0.015, yb2 + h2 + 0.9, 1.6, 2.2, {
          grime: 0.8,
          noAO: false,
        });
    }
    // entablature: architrave, frieze, modillioned cornice, blocking course
    bx("limestone", L / 2, 0.22, capY, L + 0.2, 0.62, 0.44, { grime: 0.45 });
    bx("met_ashlar", L / 2, 0.14, capY + 0.62, L + 0.1, 0.78, 0.28, {
      grime: 0.4,
    });
    for (let s = 0.4; s < L; s += 0.9)
      bx("limestone", s, 0.62, capY + 1.18, 0.22, 0.24, 0.62, { grime: 0.3 });
    bx("limestone", L / 2, 0.5, capY + 1.42, L + 0.9, 0.42, 1.0, {
      grime: 0.35,
    });
    bx("limestone", L / 2, 0.36, capY + 1.84, L + 0.6, 0.22, 0.72, {
      grime: 0.5,
    });
    if (opt.balustrade !== false)
      K.balustrade(
        b,
        "limestone",
        [at(0.3, -0.35), at(L - 0.3, -0.35)],
        y0 + H,
        1.0,
        {},
      );
    // fallen cornice blocks & rubble at the foot
    for (let i = 0; i < Math.round(L / 9); i++) {
      const s = 2 + r() * (L - 4),
        [x, z] = at(s, 1.4 + r() * 1.8);
      if (r() < 0.5)
        b.box(
          "limestone",
          x,
          yG - 0.05,
          z,
          1.1 + r() * 0.8,
          0.45,
          0.6 + r() * 0.3,
          { ry: r() * TAU, rz: (r() - 0.5) * 0.4, seg: false, grime: 0.8 },
        );
      else
        b.rock("rubble", x, yG, z, 0.5 + r() * 0.6, { flat: 0.5, seed: i + s });
    }
  }
  LB.stoneFacade = facade;

  // --------------------------------------------------------------------
  // The park side itself.
  // P: {XB, XW, Z0, Z1, PZ0, PZ1, FY, t0, wingH, DX1, anchors}
  // --------------------------------------------------------------------
  LB.metParkSide = function (b, root, P) {
    const K = LB.kit;
    const { XB, XW, Z0, Z1, PZ0, PZ1, FY, t0, wingH, DX1, anchors } = P;
    const ZM = (PZ0 + PZ1) / 2;
    let tWmin = t0;
    for (let z = Z0; z <= Z1; z += 7)
      for (const x of [51, 54, 57]) tWmin = Math.min(tWmin, LB.terrain(x, z));
    const yLow = tWmin - 1.2;
    const XG = 55.6; // west face of the glass wings' podium (site edge x 55)

    // ---- podium extension under the north glass wing & the centre pavilion (rusticated, walkable ledge at FY) ----
    b.boxMM("met_ashlar", XG, yLow, Z0, XB, FY, PZ1, {
      grime: 0.75,
      segLen: 3,
      aoH: 2.5,
    });
    LB.colMM(XG, yLow, Z0, XB, FY, PZ1);
    for (let y = yLow + 1.95; y < FY - 0.2; y += 0.75)
      b.boxMM("concrete_dark", XG - 0.02, y - 0.04, Z0, XG, y + 0.04, PZ1, {
        seg: false,
        grime: 0.2,
      });
    b.boxMM("limestone", XG - 0.25, FY - 0.3, Z0, XG + 0.2, FY, PZ1, {
      seg: false,
      grime: 0.5,
    });

    // =================================================================
    // NORTH GLASS WING (1966 project, unfinished) — raking glass wall + the Temple of Dendur hall
    // =================================================================
    const SZ0 = Z0 + 1.2,
      SZ1 = PZ0 - 1.2; // glass between the stone end walls
    const GX0 = 56.0,
      GX1 = 61.4,
      GH = 15.4; // foot / head of the raking glass
    const RY = FY + GH; // hall roof (underside)
    // stone end walls (pier + wall back to the wing) with a coped top following the rake
    for (const [za, zb] of [
      [Z0, SZ0],
      [SZ1, PZ0],
    ]) {
      b.boxMM("met_ashlar", XG, FY, za, DX1, FY + wingH, zb, {
        grime: 0.55,
        segLen: 4,
      });
      LB.colMM(XG, FY, za, DX1, FY + wingH, zb, { walkable: false });
      b.boxMM(
        "limestone",
        XG - 0.3,
        FY + wingH - 0.7,
        za - 0.2,
        DX1,
        FY + wingH,
        zb + 0.2,
        { seg: false, grime: 0.4 },
      );
      b.boxMM(
        "limestone",
        XG - 0.2,
        FY,
        za - 0.1,
        XG + 0.6,
        FY + 1.2,
        zb + 0.1,
        { seg: false, grime: 0.7 },
      );
    }
    // hall roof slab + fascia over the glass head; roof edge steel
    b.boxMM("met_ashlar", GX1 - 0.3, RY, SZ0, DX1, FY + wingH - 0.2, SZ1, {
      grime: 0.45,
    });
    b.boxMM("limestone", GX1 - 0.9, RY - 0.2, SZ0, GX1 + 0.6, RY + 0.8, SZ1, {
      seg: false,
      grime: 0.5,
    });
    LB.colMM(GX1 - 0.3, RY, SZ0, DX1, FY + wingH, SZ1, { walkable: false });
    // the raking curtain wall: 14 × 8 panes, a blown-in breach low down near the south end
    const NU = 14,
      NV = 8,
      cw = (SZ1 - SZ0) / NU;
    const BR = { u0: 9, u1: 11 };
    const hole = (iu, iv) =>
      (iu >= BR.u0 &&
        iu <= BR.u1 &&
        iv <= (iu === 10 ? 3 : iu === 9 ? 1 : 2)) ||
      (iu === 8 && iv === 0);
    glazing(
      b,
      V(GX0, FY + 0.35, SZ0),
      V(GX0, FY + 0.35, SZ1),
      V(GX1, RY, SZ0),
      V(GX1, RY, SZ1),
      V(-1, 0.35, 0),
      {
        nu: NU,
        nv: NV,
        hole,
        broken: 0.22,
        missing: 0.1,
        mullion: 0.13,
        seed: 41,
      },
    );
    // granite curb at the glass foot (broken through at the breach)
    const zBr0 = SZ0 + BR.u0 * cw,
      zBr1 = SZ0 + (BR.u1 + 1) * cw;
    for (const [za, zb] of [
      [SZ0, zBr0 - cw],
      [zBr1, SZ1],
    ]) {
      b.boxMM("granite", GX0 - 0.35, FY - 0.05, za, GX0 + 0.35, FY + 0.4, zb, {
        seg: false,
        grime: 0.6,
      });
      LB.colMM(GX0 - 0.5, FY - 0.5, za, GX0 + 0.5, FY + 4.5, zb, {
        walkable: false,
      });
    }
    // snapped, bent mullions hanging into the breach
    {
      const rb = LB.rng("met_breach");
      for (let k = 0; k < 7; k++) {
        const z = zBr0 + rb() * (zBr1 - zBr0),
          v = 0.3 + rb() * 0.35,
          y = FY + 0.35 + GH * v,
          x = GX0 + (GX1 - GX0) * v;
        b.beam(
          "iron",
          V(x, y, z),
          V(x - 0.4 - rb() * 1.1, y - 1.2 - rb() * 1.8, z + (rb() - 0.5) * 1.6),
          0.12,
          0.2,
          { grime: 0.3 },
        );
      }
    }
    // rubble spill out of the breach: walkable heap from the lawn up to the hall floor
    const zBm = (zBr0 + zBr1) / 2,
      tB = LB.terrain(51, zBm);
    anchors.breach = LB.anchor(50.5, tB, zBm, -Math.PI / 2);
    if (FY - tB > 0.25)
      LB.stairs(
        b,
        "rubble",
        50.4,
        zBm,
        Math.PI / 2,
        5.2,
        GX0 - 50.4 - 0.1,
        tB,
        FY,
        { base: tB - 0.4, grime: 0.9, noCollide: false },
      );
    {
      const rr = LB.rng("met_spill");
      for (let k = 0; k < 16; k++) {
        const x = 49 + rr() * 9.5,
          z = zBm + (rr() - 0.5) * 8.5,
          s = 0.3 + rr() * 0.7;
        const y =
          x > GX0
            ? FY
            : tB + (FY - tB) * Math.max(0, (x - 50.4) / (GX0 - 50.4));
        if (rr() < 0.45)
          b.box(
            rr() < 0.5 ? "met_ashlar" : "limestone",
            x,
            y - 0.15,
            z,
            s * 2.2,
            s * 0.6,
            s * 1.4,
            {
              ry: rr() * TAU,
              rz: (rr() - 0.5) * 0.5,
              rx: (rr() - 0.5) * 0.3,
              seg: false,
              grime: 0.8,
            },
          );
        else b.rock("rubble", x, y - 0.1, z, s, { flat: 0.55, seed: 300 + k });
      }
      // big broken masonry heaped along both flanks of the spill so it reads as a debris cone, not a stair
      for (let k = 0; k < 12; k++) {
        const x = 50.2 + (k % 6) * 1.0 + rr() * 0.5,
          side = k < 6 ? -1 : 1,
          z = zBm + side * (2.3 + rr() * 1.0);
        const y =
          tB + (FY - tB) * Math.max(0, Math.min(1, (x - 50.4) / (GX0 - 50.4)));
        b.rock("rubble", x, y - 0.35, z, 0.75 + rr() * 0.55, {
          flat: 0.55,
          seed: 500 + k,
          grime: 0.6,
        });
      }
      for (let k = 0; k < 6; k++)
        b.rock(
          "rubble",
          50.9 + k * 0.85,
          tB + ((FY - tB) * (k + 0.5)) / 6.5 - 0.1,
          zBm + (rr() - 0.5) * 3.4,
          0.35 + rr() * 0.3,
          { flat: 0.5, seed: 520 + k, grime: 0.6 },
        );
      // glass shards glittering on the lawn and the hall floor
      for (let k = 0; k < 40; k++) {
        const x = 50 + rr() * 12,
          z = zBm + (rr() - 0.5) * 11,
          y = x > GX0 ? FY + 0.05 : LB.terrain(x, z) + 0.04;
        b.quad("glass_dark", x, y, z, 0.2 + rr() * 0.5, 0.15 + rr() * 0.4, {
          rx: -Math.PI / 2,
          rz: rr() * TAU,
          noAO: true,
          grime: 0,
        });
      }
      // a fallen glazing panel lying on the grass (mullion frame + a few panes)
      glazing(
        b,
        V(47.2, tB + 0.12, zBm - 4.5),
        V(47.2, tB + 0.12, zBm - 0.3),
        V(50.3, tB + 0.35, zBm - 4.5),
        V(50.3, tB + 0.35, zBm - 0.3),
        V(0, 1, 0),
        { nu: 2, nv: 2, broken: 0.5, missing: 0.4, mullion: 0.12, seed: 9 },
      );
      LB.skeleton(b, 52.2, LB.terrain(52.2, zBm + 3.6) + 0.06, zBm + 3.6, 2.1);
    }

    // ---- the Temple of Dendur hall behind the glass (walk-in, baked light, temple, reflecting pool, looters' camp,
    //      hall anchors & props): 55_met_park_interior.js
    LB.interiorPart("met", "dendur", {
      root,
      anchors,
      FY,
      GX0,
      GX1,
      SZ0,
      SZ1,
      RY,
      DX1,
      zBr0,
      zBm,
    });

    // =================================================================
    // CENTRE PAVILION (unfinished in 1967) — low stone pavilion under a glass pyramid, with the
    // 1880 red-brick Victorian-Gothic façade exposed behind it
    // =================================================================
    const LX0 = 56.0,
      LX1 = 68.0,
      LZ0 = PZ0 + 0.5,
      LZ1 = PZ1 - 0.5,
      LH = 8.0;
    b.boxMM("met_ashlar", LX0, FY, LZ0, LX1, FY + LH, LZ1, {
      grime: 0.55,
      segLen: 3,
    });
    LB.colMM(LX0, FY, LZ0, LX1, FY + LH, LZ1, { walkable: false });
    // plinth, slit windows, a deep cornice band
    b.boxMM(
      "limestone",
      LX0 - 0.3,
      FY,
      LZ0 - 0.3,
      LX0 + 0.2,
      FY + 0.9,
      LZ1 + 0.3,
      { seg: false, grime: 0.7 },
    );
    for (let z = LZ0 + 2.2; z < LZ1 - 1.5; z += 3.1) {
      b.quad(
        Math.abs(z - ZM) < 1.6 ? "glass_broken" : "glass_dark",
        LX0 - 0.02,
        FY + 4.0,
        z,
        0.7,
        4.8,
        { ry: -Math.PI / 2, uv: "box", noAO: true },
      );
      b.box("limestone", LX0 - 0.1, FY + 1.5, z, 0.2, 0.2, 1.2, { seg: false });
    }
    b.boxMM(
      "limestone",
      LX0 - 0.5,
      FY + LH - 0.9,
      LZ0 - 0.5,
      LX1,
      FY + LH,
      LZ1 + 0.5,
      { seg: false, grime: 0.45 },
    );
    glassHip(b, LX0 + 0.5, LX1 - 0.3, LZ0 + 0.5, LZ1 - 0.5, FY + LH, 6.2, {
      seed: 57,
      broken: 0.24,
      missing: 0.05,
      pane: 1.9,
    });
    // the old museum: brick block with polychrome granite bands, lancets, a rose-window gable and pinnacles
    const BX = 68.0,
      BH = 21;
    b.boxMM("brick", BX, FY, PZ0, 80, FY + BH, PZ1, { grime: 0.55, segLen: 4 });
    LB.colMM(BX, FY, PZ0, 80, FY + BH, PZ1, { walkable: false });
    for (const y of [FY + LH + 1.2, FY + LH + 7.8, FY + BH - 1.1])
      b.boxMM("granite", BX - 0.18, y, PZ0, BX, y + 0.45, PZ1, {
        seg: false,
        grime: 0.4,
      });
    for (let i = 0; i < 7; i++) {
      const z = ZM + (i - 3) * 4.2,
        y = FY + LH + 2.2,
        w = 1.5,
        h = 4.9;
      K.lancet(
        b,
        i === 3 ? "glass_broken" : i % 3 === 1 ? "glass_broken" : "glass_dark",
        "granite",
        BX - 0.03,
        y,
        z,
        w,
        h,
        -Math.PI / 2,
      );
      // pointed hood moulding in granite + a sill
      const spring = h - w * 0.8;
      for (const sg of [-1, 1])
        b.beam(
          "granite",
          V(BX - 0.1, y + spring, z + sg * (w / 2 + 0.2)),
          V(BX - 0.1, y + h + 0.3, z),
          0.24,
          0.2,
          { grime: 0.3 },
        );
      b.box("granite", BX - 0.15, y - 0.2, z, 0.3, 0.2, w + 0.5, {
        seg: false,
      });
    }
    // gable with the rose window
    K.pediment(b, "brick", BX + 0.5, FY + BH, ZM, 15, 5.2, 1.0, Math.PI / 2, {
      corniceKey: "granite",
    });
    b.add("glass_dark", new THREE.CircleGeometry(1.5, 20), {
      m: LB.m4(BX - 0.02, FY + BH + 2.1, ZM, -Math.PI / 2),
      uv: "box",
      noAO: true,
    });
    b.add("granite", new THREE.RingGeometry(1.5, 1.95, 24, 1), {
      m: LB.m4(BX - 0.04, FY + BH + 2.1, ZM, -Math.PI / 2),
      grime: 0.3,
    });
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * TAU;
      b.beam(
        "granite",
        V(BX - 0.05, FY + BH + 2.1, ZM),
        V(BX - 0.05, FY + BH + 2.1 + Math.cos(a) * 1.5, ZM + Math.sin(a) * 1.5),
        0.1,
        0.08,
      );
    }
    for (const z of [PZ0 + 0.8, PZ1 - 0.8])
      K.pinnacle(b, "granite", BX + 0.4, FY + BH, z, 1.0, 4.6, {});

    // =================================================================
    // SOUTH WING — classical park elevation + north-light sawtooth roof
    // =================================================================
    facade(b, [XB, PZ1], [0, 1], [-1, 0], Z1 - PZ1, FY, wingH, yLow, {
      seed: 11,
    });
    facade(
      b,
      [XB, Z1],
      [1, 0],
      [0, 1],
      XW - XB - 0.6,
      FY,
      wingH,
      Math.min(yLow, t0 - 1),
      { seed: 12, balustrade: true },
    );
    // north end elevation of the north wing (Dendur hall wall + the wing behind it)
    facade(
      b,
      [XW - 0.6, Z0],
      [-1, 0],
      [0, -1],
      XW - 0.6 - XG,
      FY,
      wingH,
      Math.min(yLow, t0 - 1),
      { seed: 13 },
    );
    // sawtooth skylights: vertical north-facing glazing + copper-clad slopes
    const RT = FY + wingH;
    for (let z = PZ1 + 2.2; z < Z1 - 3.4; z += 3.6) {
      glazing(
        b,
        V(61, RT, z),
        V(96, RT, z),
        V(61, RT + 1.7, z),
        V(96, RT + 1.7, z),
        V(0, 0, -1),
        {
          nu: 18,
          nv: 1,
          broken: 0.28,
          missing: 0.08,
          mullion: 0.08,
          seed: Math.round(z),
        },
      );
      const g = new THREE.BufferGeometry();
      const A = [61, RT + 1.7, z],
        Bq = [96, RT + 1.7, z],
        Cq = [96, RT, z + 3.4],
        Dq = [61, RT, z + 3.4];
      g.setAttribute(
        "position",
        new THREE.BufferAttribute(
          new Float32Array([...A, ...Cq, ...Bq, ...A, ...Dq, ...Cq]),
          3,
        ),
      );
      g.computeVertexNormals();
      b.add("copper_roof", g, { grime: 0.5 });
      for (const x of [61, 96]) {
        const tg = new THREE.BufferGeometry();
        tg.setAttribute(
          "position",
          new THREE.BufferAttribute(
            new Float32Array([x, RT, z, x, RT + 1.7, z, x, RT, z + 3.4]),
            3,
          ),
        );
        tg.computeVertexNormals();
        b.add("copper_roof", tg, { grime: 0.5 });
        const tg2 = new THREE.BufferGeometry();
        tg2.setAttribute(
          "position",
          new THREE.BufferAttribute(
            new Float32Array([x, RT, z, x, RT, z + 3.4, x, RT + 1.7, z]),
            3,
          ),
        );
        tg2.computeVertexNormals();
        b.add("copper_roof", tg2, { grime: 0.5 });
      }
    }
    // north wing: glazed lantern skylight over the galleries
    {
      const x0 = 80,
        x1 = 95,
        z0 = Z0 + 5,
        z1 = PZ0 - 5,
        h = 1.6;
      b.boxMM(
        "met_ashlar",
        x0 - 0.4,
        RT,
        z0 - 0.4,
        x1 + 0.4,
        RT + 0.5,
        z1 + 0.4,
        { seg: false, grime: 0.5 },
      );
      const yb = RT + 0.5;
      glazing(
        b,
        V(x0, yb, z0),
        V(x0, yb, z1),
        V(x0, yb + h, z0),
        V(x0, yb + h, z1),
        V(-1, 0, 0),
        { nu: 12, nv: 1, broken: 0.25, mullion: 0.07, seed: 61 },
      );
      glazing(
        b,
        V(x1, yb, z1),
        V(x1, yb, z0),
        V(x1, yb + h, z1),
        V(x1, yb + h, z0),
        V(1, 0, 0),
        { nu: 12, nv: 1, broken: 0.25, mullion: 0.07, seed: 62 },
      );
      glazing(
        b,
        V(x1, yb, z0),
        V(x0, yb, z0),
        V(x1, yb + h, z0),
        V(x0, yb + h, z0),
        V(0, 0, -1),
        { nu: 8, nv: 1, broken: 0.25, mullion: 0.07, seed: 63 },
      );
      glazing(
        b,
        V(x0, yb, z1),
        V(x1, yb, z1),
        V(x0, yb + h, z1),
        V(x1, yb + h, z1),
        V(0, 0, 1),
        { nu: 8, nv: 1, broken: 0.25, mullion: 0.07, seed: 64 },
      );
      glassHip(b, x0, x1, z0, z1, yb + h, 3.2, {
        seed: 65,
        broken: 0.3,
        missing: 0.04,
        pane: 1.9,
      });
    }
  };
})();
