/* src/landmarks_b/30_downtown.js */
/* =====================================================================
 * LANDMARKS B — DOWNTOWN (exteriors): Flatiron (Trading Post), Woolworth
 * Building, City Hall (+ park), NYSE ("The Exchange" raider fort).
 * The walk-in interiors (Trading Post market lane, City Hall rotunda, NYSE
 * trading floor) are in 30_downtown_interior.js (LB.interiorPart).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._lb) return;
  const LB = G._lb;
  const TAU = Math.PI * 2;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);

  // Wall segment between two points with door gaps (t along the wall), visuals + colliders.
  function gappedWall(b, key, p, q, y0, y1, t, gaps, opts) {
    opts = opts || {};
    const dx = q[0] - p[0],
      dz = q[1] - p[1],
      len = Math.hypot(dx, dz),
      ux = dx / len,
      uz = dz / len;
    const ry = Math.atan2(-dz, dx);
    let cur = 0;
    const segs = [];
    (gaps || [])
      .slice()
      .sort((a, c) => a[0] - c[0])
      .forEach((g) => {
        segs.push([cur, g[0], y0, y1]);
        segs.push([g[0], g[1], y0 + (g[2] || 3), y1]);
        cur = g[1];
      });
    segs.push([cur, len, y0, y1]);
    for (const s of segs) {
      if (s[1] - s[0] < 0.05 || s[3] - s[2] < 0.05) continue;
      const m = (s[0] + s[1]) / 2,
        cx = p[0] + ux * m,
        cz = p[1] + uz * m;
      b.box(key, cx, s[2], cz, s[1] - s[0], s[3] - s[2], t, {
        ry,
        grime: opts.grime,
        segLen: 4,
      });
      LB.col(cx, cz, s[1] - s[0], t, s[2], s[3], ry, { walkable: false });
    }
  }
  LB.gappedWall = gappedWall;

  // City Hall elevation (Mangin & McComb, 1812): smooth marble; round-arched ground-floor windows in moulded
  // archivolts between Ionic pilasters, pedimented / corniced upper windows between Corinthian pilasters, a light
  // entablature between the storeys and the full one (architrave, frieze, modillions, corona) under the attic.
  // o = [x,z] start, u = unit along the wall, n = unit outward normal, L length, nb bays, levels from opt.FY.
  // opt.breach = [s0,s1]: shell hole through the upper storey and the roofline (members split, ragged edges, spill).
  function chElev(b, o, u, n, L, nb, opt) {
    const K = LB.kit,
      FY = opt.FY,
      r = LB.rng(opt.seed || 1),
      bw = L / nb,
      br = opt.breach;
    const ryB = Math.atan2(-u[1], u[0]),
      ryF = Math.atan2(n[0], n[1]);
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
        Object.assign({ ry: ryB, seg: false, grime: 0.35 }, ex || {}),
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
    const inBr = (s, pad) =>
      !!br && s > br[0] - (pad || 0) && s < br[1] + (pad || 0);
    // horizontal member along the wall; split (ragged) around the breach when it is above the storey line
    const band = (key, d, y, h, dep, ex, ext, cut) => {
      ext = ext === undefined ? 0.4 : ext;
      const spans =
        br && cut
          ? [
              [-ext, br[0] - r() * 0.5],
              [br[1] + r() * 0.5, L + ext],
            ]
          : [[-ext, L + ext]];
      for (const [s0, s1] of spans)
        if (s1 - s0 > 0.05) bx(key, (s0 + s1) / 2, d, y, s1 - s0, h, dep, ex);
    };
    const glass = (lower) => {
      const q = r();
      return q < 0.22
        ? "glass_broken"
        : q < (lower ? 0.45 : 0.3)
          ? "planks"
          : "glass_dark";
    };
    // water table
    band("marble", 0.18, FY, 0.75, 0.36, { grime: 0.75 });
    band("marble", 0.26, FY + 0.75, 0.14, 0.52, { grime: 0.5 });
    // storey entablature (architrave, frieze, cornice)
    band("marble", 0.2, FY + 5.3, 0.36, 0.4);
    band("marble", 0.14, FY + 5.66, 0.44, 0.28);
    band("marble", 0.3, FY + 6.1, 0.26, 0.6, { grime: 0.45 });
    // main entablature + modillioned cornice
    band("marble", 0.21, FY + 11.0, 0.42, 0.42, {}, 0.4, true);
    band("marble", 0.15, FY + 11.42, 0.5, 0.3, { grime: 0.3 }, 0.4, true);
    band("marble", 0.45, FY + 12.1, 0.3, 0.9, { grime: 0.4 }, 0.8, true);
    band("marble", 0.35, FY + 12.4, 0.1, 0.7, {}, 0.7, true);
    for (let s = 0.3; s < L; s += 0.7)
      if (!inBr(s, 0.4))
        bx("marble", s, 0.42, FY + 11.94, 0.16, 0.16, 0.54, { grime: 0.25 });
    // pilasters: Ionic below, Corinthian above (doubled width at the corners)
    for (let i = 0; i <= nb; i++) {
      const s = i * bw,
        pw = i === 0 || i === nb ? 0.9 : 0.62;
      bx("marble", s, 0.15, FY + 0.89, pw, 4.2, 0.3, { grime: 0.4 });
      bx("marble", s, 0.2, FY + 0.89, pw + 0.2, 0.28, 0.4);
      bx("marble", s, 0.2, FY + 5.02, pw + 0.24, 0.28, 0.42);
      if (!opt.plain)
        for (const sd of [-1, 1]) {
          const [x, z] = at(s + sd * (pw / 2 + 0.02), 0.3);
          b.cyl("marble", x, FY + 4.92, z, 0.11, 0.11, 0.4, 6, {
            hSeg: 1,
            ry: ryF,
            rx: Math.PI / 2,
            grime: 0.3,
          });
        }
      if (inBr(s, 0.3)) continue;
      bx("marble", s, 0.13, FY + 6.36, pw - 0.06, 4.3, 0.26, { grime: 0.35 });
      bx("marble", s, 0.18, FY + 6.36, pw + 0.14, 0.24, 0.36);
      {
        const [x, z] = at(s, 0.2);
        b.cyl(
          "marble",
          x,
          FY + 10.06,
          z,
          (pw + 0.3) / 2,
          (pw - 0.02) / 2,
          0.6,
          8,
          { hSeg: 1, sz: 0.55, ry: ryB, grime: 0.3 },
        );
      }
      bx("marble", s, 0.2, FY + 10.66, pw + 0.3, 0.34, 0.44);
    }
    for (let i = 0; i < nb; i++) {
      const s = (i + 0.5) * bw;
      // ground storey: round-arched window, jambs, archivolt, keystone, sill
      const w1 = Math.min(1.5, bw * 0.5),
        y1 = FY + 1.35,
        h1 = 2.5,
        ra = w1 / 2,
        g1 = glass(true);
      quad(g1, s, 0.02, y1 + h1 / 2, w1, h1);
      {
        const [x, z] = at(s, 0.02);
        b.add(g1, new THREE.CircleGeometry(ra, 10, 0, Math.PI), {
          m: LB.m4(x, y1 + h1, z, ryF),
          uv: "box",
          noAO: true,
          grime: 0.1,
        });
      }
      {
        const sh = new THREE.Shape();
        sh.absarc(0, 0, ra + 0.22, 0, Math.PI, false);
        sh.lineTo(-ra, 0);
        sh.absarc(0, 0, ra, Math.PI, 0, true);
        sh.lineTo(ra + 0.22, 0);
        const [x, z] = at(s, 0);
        b.add(
          "marble",
          new THREE.ExtrudeGeometry(sh, {
            depth: 0.16,
            bevelEnabled: false,
            curveSegments: 6,
          }),
          { m: LB.m4(x, y1 + h1, z, ryF), grime: 0.3 },
        );
      }
      bx("marble", s - ra - 0.11, 0.08, y1, 0.22, h1, 0.16);
      bx("marble", s + ra + 0.11, 0.08, y1, 0.22, h1, 0.16);
      bx("marble", s, 0.12, y1 + h1 + ra - 0.08, 0.34, 0.46, 0.26);
      bx("marble", s, 0.14, y1 - 0.18, w1 + 0.6, 0.18, 0.3);
      if (g1 !== "planks")
        quad("iron", s, 0.03, y1 + h1 / 2, 0.05, h1, { grime: 0 });
      // upper storey: tall window in an architrave, alternate pediment / cornice heads, soot from burnt rooms
      if (inBr(s, 0.9)) continue;
      const w2 = Math.min(1.4, bw * 0.48),
        y2 = FY + 7.0,
        h2 = 2.7,
        g2 = glass(false);
      quad(g2, s, 0.02, y2 + h2 / 2, w2, h2);
      if (g2 !== "planks") {
        quad("iron", s, 0.03, y2 + h2 / 2, 0.05, h2, { grime: 0 });
        quad("iron", s, 0.03, y2 + h2 * 0.62, w2, 0.05, { grime: 0 });
      }
      bx("marble", s - w2 / 2 - 0.1, 0.08, y2, 0.2, h2, 0.16);
      bx("marble", s + w2 / 2 + 0.1, 0.08, y2, 0.2, h2, 0.16);
      bx("marble", s, 0.08, y2 + h2, w2 + 0.4, 0.22, 0.16);
      bx("marble", s, 0.12, y2 - 0.2, w2 + 0.5, 0.2, 0.28);
      if (!opt.plain && i % 2 === 0) {
        const [x, z] = at(s, 0.2);
        K.pediment(
          b,
          "marble",
          x,
          y2 + h2 + 0.72,
          z,
          w2 + 0.5,
          0.45,
          0.3,
          ryF,
          {},
        );
      } else bx("marble", s, 0.2, y2 + h2 + 0.22, w2 + 0.6, 0.18, 0.4);
      if (r() < 0.22)
        quad("concrete_dark", s, 0.012, y2 + h2 + 0.95, w2 + 0.3, 1.5, {
          grime: 0.9,
          noAO: false,
        });
    }
    if (!br) return;
    // ---- the shell hole: scorch fan, dark void, ragged block edges, hanging rebar, fallen masonry
    const sm = (br[0] + br[1]) / 2,
      bwd = br[1] - br[0];
    quad("concrete_dark", sm, 0.025, FY + 9.4, bwd + 1.6, 6.0, {
      grime: 1,
      noAO: false,
    });
    quad("concrete_dark", sm, 0.035, FY + 9.9, bwd * 0.72, 4.4, {
      c: 0x16130f,
      grime: 0,
    });
    bx("planks", sm, 0.05, FY + 7.3, bwd * 0.8, 0.32, 0.5, {
      grime: 1,
      c: 0x3a3028,
    }); // charred floor joist ends
    for (let k = 0; k < 10; k++) {
      const side = k % 2 ? 1 : -1,
        yy = FY + 7.4 + r() * 5.0;
      bx(
        "marble",
        sm + side * (bwd * 0.36 + r() * 0.25),
        0.08 + r() * 0.25,
        yy,
        0.45 + r() * 0.6,
        0.3 + r() * 0.5,
        0.45,
        { rz: (r() - 0.5) * 0.8, grime: 0.8 },
      );
    }
    for (let k = 0; k < 6; k++) {
      const [x, z] = at(sm - bwd * 0.3 + k * bwd * 0.12, 0.15);
      b.beam(
        "rust",
        V(x, FY + 12.3, z),
        V(
          x + n[0] * 0.5 + (r() - 0.5) * 0.5,
          FY + 10.8 - r() * 1.2,
          z + n[1] * 0.5 + (r() - 0.5) * 0.3,
        ),
        0.035,
        0.035,
      );
    }
    for (let k = 0; k < 7; k++) {
      // charred rafters poking out of the burnt-out roof behind the hole
      const [x, z] = at(br[0] + 0.3 + (k * (bwd - 0.6)) / 6, -0.8 - r() * 2.2);
      b.beam(
        "planks",
        V(x, FY + 12.6, z),
        V(
          x + (r() - 0.5) * 1.2,
          FY + 13.7 + r() * 1.8,
          z + n[1] * (0.4 + r() * 0.8) + n[0] * (0.4 + r() * 0.8),
        ),
        0.16,
        0.22,
        { grime: 1, c: 0x3a3028 },
      );
    }
    for (let k = 0; k < 12; k++) {
      // spill of cornice blocks & rubble on the terrace in front
      const [x, z] = at(sm + (r() - 0.5) * bwd * 1.8, 0.7 + r() * 2.2);
      if (r() < 0.55)
        b.box(
          "marble",
          x,
          FY - 0.08,
          z,
          0.7 + r() * 0.9,
          0.35 + r() * 0.3,
          0.45 + r() * 0.35,
          { ry: r() * TAU, rz: (r() - 0.5) * 0.3, seg: false, grime: 0.85 },
        );
      else
        b.rock("granite", x, FY, z, 0.35 + r() * 0.4, {
          flat: 0.5,
          seed: k * 7 + 3,
        });
    }
  }

  // =====================================================================
  // FLATIRON exterior skin (round 2): Burnham's tripartite elevation instead of a punched prism —
  // a ROUNDED PROW (the famous 2 m "nose"), a rusticated limestone base with storefront bays between
  // proud piers and framed portals at every opening, three storeys of architrave-framed windows, the
  // terracotta shaft as a pier-and-spandrel grid (real reveals, not flat decals) with the bowed oriel bays,
  // an arcaded crown of round-arched windows between pilasters, and the massive modillioned cornice
  // over an attic storey. Everything merges into the landmark batch (no extra draw calls).
  // =====================================================================
  /** P with its chopped prow replaced by a circle of radius RP tangent to the Broadway face (P1→P2) and the
   *  Fifth Avenue face (P3→P4). Returns {Pr, c, a1, sw, shift0, sgn}; Pr edges 0/1/2 = Broadway / south / Fifth Ave,
   *  shift0 = how far Pr's Broadway edge starts before P's (P-edge door offsets + shift0 = Pr offsets). */
  function flatironProw(P, RP) {
    let A = 0;
    for (let i = 0; i < P.length; i++) {
      const p = P[i],
        q = P[(i + 1) % P.length];
      A += p[0] * q[1] - q[0] * p[1];
    }
    const sgn = A > 0 ? 1 : -1;
    const nrm = (p, q) => {
      const dx = q[0] - p[0],
        dz = q[1] - p[1],
        l = Math.hypot(dx, dz);
      return [(dz / l) * sgn, (-dx / l) * sgn];
    };
    const n1 = nrm(P[1], P[2]),
      n3 = nrm(P[3], P[4]);
    const k1 = n1[0] * P[1][0] + n1[1] * P[1][1] - RP,
      k3 = n3[0] * P[3][0] + n3[1] * P[3][1] - RP;
    const det = n1[0] * n3[1] - n1[1] * n3[0];
    const c = [
      (k1 * n3[1] - n1[1] * k3) / det,
      (n1[0] * k3 - k1 * n3[0]) / det,
    ];
    const T2 = [c[0] + n1[0] * RP, c[1] + n1[1] * RP],
      T1 = [c[0] + n3[0] * RP, c[1] + n3[1] * RP];
    const a1 = Math.atan2(T1[1] - c[1], T1[0] - c[0]),
      a2 = Math.atan2(T2[1] - c[1], T2[0] - c[0]);
    const pd = Math.atan2(P[0][1] - c[1], P[0][0] - c[0]); // the old prow tip: the arc must pass round it
    let sw = a2 - a1;
    while (sw <= 0) sw += TAU;
    if (Math.cos(a1 + sw / 2 - pd) < 0) sw -= TAU;
    const arc = [];
    for (let k = 1; k < 10; k++) {
      const a = a1 + (sw * k) / 10;
      arc.push([c[0] + Math.cos(a) * RP, c[1] + Math.sin(a) * RP]);
    }
    return {
      Pr: [T2, P[2], P[3], T1].concat(arc),
      c,
      a1,
      sw,
      RP,
      sgn,
      shift0: Math.hypot(P[1][0] - T2[0], P[1][1] - T2[1]),
    };
  }

  function flatironSkin(b, P, doors, H) {
    const { H_BASE, H_RUST, H_SHAFT, H_TOP } = H;
    const K = LB.kit,
      r = LB.rng("flatiron_skin_r2");
    const PR = flatironProw(P, 2.0),
      Pr = PR.Pr,
      sgn = PR.sgn,
      RP = PR.RP;
    const S = 2.2,
      M = 1.5,
      GF = 0.35; // window pitch, edge margin, ground-floor wall face (gappedWall is 0.7 thick, centred on P)
    const gapsOf = [
      (doors[1] || []).map((g) => [g[0] + PR.shift0, g[1] + PR.shift0, g[2]]),
      doors[2] || [],
      doors[3] || [],
    ];
    const edges = [0, 1, 2].map((i) => {
      const p = Pr[i],
        q = Pr[i + 1],
        dx = q[0] - p[0],
        dz = q[1] - p[1],
        len = Math.hypot(dx, dz);
      const u = [dx / len, dz / len],
        n = [u[1] * sgn, -u[0] * sgn];
      const nC = Math.floor((len - 2 * M) / S) + 1,
        st = (len - (nC - 1) * S) / 2,
        cols = [],
        bnd = [];
      for (let k = 0; k < nC; k++) cols.push(st + k * S);
      for (let j = 0; j <= nC; j++) bnd.push(st - S / 2 + j * S);
      return {
        i,
        p,
        u,
        n,
        len,
        cols,
        bnd,
        gaps: gapsOf[i],
        ryF: Math.atan2(n[0], n[1]),
        at: (t, d) => [p[0] + u[0] * t + n[0] * d, p[1] + u[1] * t + n[1] * d],
      };
    });
    const bx = (E, key, t, d, y, w, h, dep, ex) => {
      const [x, z] = E.at(t, d);
      return b.box(
        key,
        x,
        y,
        z,
        w,
        h,
        dep,
        Object.assign({ ry: E.ryF, seg: false, grime: 0.35 }, ex || {}),
      );
    };
    const qd = (E, key, t, d, yc, w, h, ex) => {
      const [x, z] = E.at(t, d);
      return b.quad(
        key,
        x,
        yc,
        z,
        w,
        h,
        Object.assign(
          { ry: E.ryF, uv: "box", noAO: true, grime: 0.12 },
          ex || {},
        ),
      );
    };
    const colE = (E, t, d, w, dep, y0, y1) => {
      const [x, z] = E.at(t, d);
      LB.col(x, z, w, dep, y0, y1, E.ryF, { walkable: false });
    };
    const glass = (boarded, lit) => {
      const v = r();
      return v < 0.24
        ? "glass_broken"
        : v < 0.24 + boarded
          ? "planks"
          : v > 1 - (lit || 0)
            ? "window_lit"
            : "glass_dark";
    };
    const inGap = (E, t, pad) =>
      E.gaps.some((g) => t > g[0] - pad && t < g[1] + pad);
    const arcDir = (a) => [Math.cos(a), Math.sin(a)];
    const PROW_A = PR.a1 + PR.sw / 2; // the nose: one window column on its crown line
    const prowQuad = (key, d, yc, w, h, ex) => {
      const [dx, dz] = arcDir(PROW_A);
      b.quad(
        key,
        PR.c[0] + dx * (RP + d),
        yc,
        PR.c[1] + dz * (RP + d),
        w,
        h,
        Object.assign(
          { ry: Math.atan2(dx, dz), uv: "box", noAO: true, grime: 0.12 },
          ex || {},
        ),
      );
    };

    // ---------------- masses on the rounded footprint ----------------
    K.prismBands(b, "limestone", Pr, H_BASE, H_RUST, 4.5, { grime: 0.6 });
    for (let y = H_BASE + 1.0; y < H_RUST - 0.9; y += 1.0)
      K.prism(b, "granite_dark", K.offsetPoly(Pr, 0.04), y, y + 0.07, {
        grime: 0.2,
        noAO: true,
      }); // channelled joints
    K.prism(
      b,
      "limestone",
      K.offsetPoly(Pr, 0.22),
      H_RUST - 0.75,
      H_RUST - 0.45,
      { grime: 0.4 },
    );
    K.prism(
      b,
      "limestone",
      K.offsetPoly(Pr, 0.42),
      H_RUST - 0.45,
      H_RUST + 0.35,
      { grime: 0.45 },
    ); // base cornice
    K.prismBands(b, "terracotta", Pr, H_RUST + 0.35, H_SHAFT, 7.5, {
      grime: 0.5,
    });
    const Y0S = H_RUST + 0.35,
      FH = 3.0,
      NS = Math.floor((H_SHAFT - Y0S - 0.4) / FH);
    for (const f of [4, 8]) {
      const y = Y0S + f * FH - 0.2;
      K.prism(b, "terracotta", K.offsetPoly(Pr, 0.26), y, y + 0.3, {
        grime: 0.35,
      });
    }
    K.prism(b, "limestone", K.offsetPoly(Pr, 0.32), H_SHAFT, H_SHAFT + 0.6, {
      grime: 0.4,
    });
    K.prism(b, "terracotta", Pr, H_SHAFT + 0.6, H_TOP, { grime: 0.4 });
    K.prism(b, "limestone", K.offsetPoly(Pr, 0.35), H_TOP, H_TOP + 0.8, {
      grime: 0.5,
    }); // frieze
    K.prism(b, "limestone", K.offsetPoly(Pr, 0.7), H_TOP + 0.8, H_TOP + 1.1, {
      grime: 0.45,
    }); // bed mould
    K.prism(b, "limestone", K.offsetPoly(Pr, 1.6), H_TOP + 1.1, H_TOP + 1.75, {
      grime: 0.45,
    }); // corona (the big overhang)
    K.prism(b, "limestone", K.offsetPoly(Pr, 1.4), H_TOP + 1.75, H_TOP + 2.0, {
      grime: 0.35,
    }); // cymatium
    K.prism(b, "terracotta", K.offsetPoly(Pr, -0.3), H_TOP + 2.0, H_TOP + 3.1, {
      grime: 0.5,
    }); // attic storey = roof deck level
    // parapet ring round the roof deck (a ring, so the deck stays at H_TOP + 3.1)
    {
      const ring = K.offsetPoly(Pr, -0.5);
      for (let i = 0; i < ring.length; i++) {
        const p = ring[i],
          q = ring[(i + 1) % ring.length],
          dx = q[0] - p[0],
          dz = q[1] - p[1],
          len = Math.hypot(dx, dz);
        if (len < 0.05) continue;
        b.box(
          "limestone",
          (p[0] + q[0]) / 2,
          H_TOP + 3.1,
          (p[1] + q[1]) / 2,
          len + 0.25,
          0.85,
          0.4,
          { ry: Math.atan2(-dz, dx), seg: false, grime: 0.55 },
        );
        LB.colWall(p[0], p[1], q[0], q[1], 0.4, H_TOP + 3.1, H_TOP + 4.0, {
          walkable: false,
        });
      }
    }

    // ---------------- ground floor: rounded nose, storefront bays, portals ----------------
    {
      const pie = [PR.c];
      for (let k = 0; k <= 12; k++) {
        const [dx, dz] = arcDir(PR.a1 + (PR.sw * k) / 12);
        pie.push([PR.c[0] + dx * (RP + GF), PR.c[1] + dz * (RP + GF)]);
      }
      K.prism(b, "limestone", pie, 0, H_BASE, { grime: 0.7 });
      K.prism(b, "granite_dark", K.offsetPoly(pie, 0.06), 0, 0.55, {
        grime: 0.8,
      });
      LB.fillPoly(pie, 0, 0, 0, 0, H_BASE, 0.5, { walkable: false });
      const E = edges[0]; // the Broadway wall's short return from the new tangent point to P1
      bx(E, "limestone", PR.shift0 / 2, 0, 0, PR.shift0 + 0.2, H_BASE, 0.7, {
        seg: true,
        grime: 0.65,
      });
      colE(E, PR.shift0 / 2, 0, PR.shift0 + 0.2, 0.7, 0, H_BASE);
      // the nose's own shop window (the old cigar store) + a lamp bracket
      prowQuad("planks", GF + 0.02, 2.0, 1.4, 2.4);
      prowQuad("iron", GF + 0.03, 3.45, 1.6, 0.12, { grime: 0 });
    }
    for (const E of edges) {
      // piers every second window column (+ both ends); none inside an opening
      const piers = [];
      for (let j = 0; j < E.bnd.length; j += 2) piers.push(E.bnd[j]);
      if ((E.bnd.length - 1) % 2) piers.push(E.bnd[E.bnd.length - 1]);
      const live = piers.filter((t) => !inGap(E, t, 0.7));
      for (const t of live) {
        bx(E, "limestone", t, GF + 0.15, 0, 0.8, H_BASE - 0.3, 0.3, {
          seg: true,
          grime: 0.7,
        });
        bx(E, "granite_dark", t, GF + 0.2, 0, 0.95, 0.5, 0.4, { grime: 0.8 }); // plinth
        bx(E, "limestone", t, GF + 0.22, H_BASE - 0.75, 0.95, 0.3, 0.44); // capital
        for (let y = 0.9; y < H_BASE - 0.9; y += 0.62)
          bx(E, "granite_dark", t, GF + 0.305, y, 0.82, 0.05, 0.02, {
            grime: 0.1,
          }); // rustication joints
        colE(E, t, GF + 0.2, 0.95, 0.4, 0, H_BASE - 0.3);
      }
      // storefronts in the bays between piers
      for (let k = 0; k < piers.length - 1; k++) {
        const ta = piers[k] + 0.4,
          tb = piers[k + 1] - 0.4,
          w = tb - ta,
          tc = (ta + tb) / 2;
        if (w < 1) continue;
        if (E.gaps.some((g) => g[1] > ta - 0.3 && g[0] < tb + 0.3)) continue;
        const g = glass(0.3, 0.02);
        bx(E, "granite_dark", tc, GF + 0.04, 0, w, 0.7, 0.08, { grime: 0.8 }); // stall riser
        qd(E, g, tc, GF + 0.02, 0.7 + 1.25, w, 2.5);
        if (g !== "planks") {
          qd(E, "iron", tc, GF + 0.03, 1.95, 0.07, 2.5, { grime: 0 });
          qd(E, "iron", tc, GF + 0.03, 1.95, w, 0.06, { grime: 0 });
        }
        bx(E, "iron", tc, GF + 0.04, 3.2, w, 0.14, 0.1, { grime: 0.3 }); // transom bar
        qd(E, glass(0.15), tc, GF + 0.02, 3.72, w, 0.9);
        bx(E, "limestone", tc, GF + 0.08, 0.64, w + 0.05, 0.08, 0.18); // sill
        if (r() < 0.3) {
          // a sagging awning frame / roll-down shutter half down
          if (r() < 0.5)
            bx(E, "rust", tc, GF + 0.06, 2.4 + r() * 0.6, w, 1.1, 0.06, {
              grime: 0.7,
            });
          else
            for (const s of [-1, 1]) {
              const [x0, z0] = E.at(tc + (s * w) / 2, GF + 0.05),
                [x1, z1] = E.at(tc + (s * w) / 2, GF + 1.1);
              b.beam(
                "rust",
                V(x0, 3.3, z0),
                V(x1, 3.0 - r() * 0.4, z1),
                0.04,
                0.04,
              );
            }
        }
      }
      // portals: flanking rusticated jambs, a lintel with keystone and a settlers' steel beam under it, caged lamp
      for (const gp of E.gaps) {
        const t0 = gp[0],
          t1 = gp[1],
          h = gp[2] || 3.4,
          w = t1 - t0,
          tc = (t0 + t1) / 2;
        for (const s of [t0 - 0.45, t1 + 0.45]) {
          bx(E, "limestone", s, GF + 0.2, 0, 0.9, h + 0.05, 0.4, {
            seg: true,
            grime: 0.65,
          });
          bx(E, "granite_dark", s, GF + 0.25, 0, 1.05, 0.55, 0.5, {
            grime: 0.85,
          });
          for (let y = 0.95; y < h - 0.3; y += 0.62)
            bx(E, "granite_dark", s, GF + 0.405, y, 0.92, 0.05, 0.02, {
              grime: 0.1,
            });
          colE(E, s, GF + 0.25, 1.05, 0.5, 0, h);
        }
        bx(E, "limestone", tc, GF + 0.2, h, w + 1.9, 0.62, 0.42, {
          grime: 0.55,
        }); // lintel
        bx(E, "limestone", tc, GF + 0.32, h - 0.08, 0.7, 0.85, 0.34, {
          grime: 0.45,
        }); // keystone
        bx(E, "limestone", tc, GF + 0.36, h + 0.62, w + 2.3, 0.18, 0.5, {
          grime: 0.4,
        }); // hood cornice
        bx(E, "rust", tc, GF + 0.07, h - 0.34, w + 0.5, 0.3, 0.14, {
          grime: 0.7,
        }); // settlers' I-beam
        for (const s of [t0 + 0.1, t1 - 0.1])
          bx(E, "rust", s, GF + 0.07, 0, 0.16, h - 0.34, 0.14, { grime: 0.7 }); // its props
        const [lx, lz] = E.at(tc, GF + 0.75);
        b.box("iron", lx, h + 0.95, lz, 0.28, 0.36, 0.28, { seg: false });
        if (w > 5)
          LB.glows.push({
            pos: V(lx, h + 1.05, lz),
            color: 0xffb060,
            size: 2.4,
          });
      }
      // continuous fascia + cornice over the ground floor (above every opening)
      const t0 = E.bnd[0] - 0.6,
        t1 = E.bnd[E.bnd.length - 1] + 0.6;
      bx(
        E,
        "limestone",
        (t0 + t1) / 2,
        GF + 0.12,
        H_BASE - 0.3,
        t1 - t0,
        0.5,
        0.26,
        { seg: true, grime: 0.5 },
      );
      bx(
        E,
        "limestone",
        (t0 + t1) / 2,
        GF + 0.25,
        H_BASE + 0.2,
        t1 - t0 + 0.4,
        0.22,
        0.52,
        { seg: true, grime: 0.45 },
      );
    }

    // ---------------- floors 2–4: architrave-framed windows in the rusticated base ----------------
    for (const E of edges) {
      for (let f = 0; f < 3; f++) {
        const y = H_BASE + 1.2 + f * 3.0,
          h = 1.9,
          w = 1.1;
        for (const t of E.cols) {
          const g = glass(0.12, 0.02);
          qd(E, g, t, 0.02, y + h / 2, w, h);
          if (g !== "planks") {
            qd(E, "iron", t, 0.03, y + h / 2, 0.05, h, { grime: 0 });
            qd(E, "iron", t, 0.03, y + h * 0.62, w, 0.05, { grime: 0 });
          }
          for (const s of [-1, 1])
            bx(
              E,
              "limestone",
              t + s * (w / 2 + 0.1),
              0.06,
              y - 0.05,
              0.2,
              h + 0.1,
              0.12,
            );
          bx(E, "limestone", t, 0.1, y - 0.2, w + 0.45, 0.16, 0.2);
          bx(E, "limestone", t, 0.09, y + h, w + 0.5, 0.26, 0.18);
          if (f === 1)
            bx(E, "limestone", t, 0.13, y + h - 0.06, 0.32, 0.44, 0.22);
        }
      }
    }
    for (let f = 0; f < 3; f++)
      prowQuad(glass(0.1), 0.02, H_BASE + 1.2 + f * 3.0 + 0.95, 0.9, 1.9);

    // ---------------- the shaft: pier-and-spandrel grid with deep reveals ----------------
    const ORIEL_W = 3 * S + 0.8,
      SAG = 0.85,
      OY0 = Y0S + FH - 0.25,
      OY1 = Y0S + (NS - 1) * FH - 0.1;
    const orielAt = [];
    for (const E of edges) {
      const span0 = E.bnd[0],
        span1 = E.bnd[E.bnd.length - 1],
        smid = (span0 + span1) / 2,
        span = span1 - span0;
      for (let j = 0; j < E.bnd.length; j++)
        bx(E, "terracotta", E.bnd[j], 0.08, Y0S, 1.1, H_SHAFT - Y0S, 0.16, {
          seg: true,
          segLen: 7,
          grime: 0.45,
        });
      for (let f = 0; f < NS; f++) {
        const y = Y0S + 0.6 + f * FH,
          h = 1.9;
        bx(E, "terracotta", smid, 0.04, y + h, span, FH - h, 0.08, {
          seg: true,
          segLen: 8,
          grime: 0.5,
          c: 0xb8a88c,
        }); // spandrel
        bx(E, "terracotta", smid, 0.13, y - 0.12, span, 0.1, 0.26, {
          seg: true,
          segLen: 8,
          grime: 0.4,
        }); // sill ledge
        for (const t of E.cols) {
          const g = glass(0.07, 0.03);
          qd(E, g, t, 0.02, y + h / 2, 1.0, h);
          if (g !== "planks")
            qd(E, "iron", t, 0.03, y + h / 2, 0.05, h, { grime: 0 });
          if (g === "glass_broken" && r() < 0.35)
            qd(E, "concrete_dark", t, 0.165, y + h + 0.9, 1.0, 1.6, {
              grime: 1,
              noAO: false,
            }); // soot from a burnt room
        }
      }
      // bowed oriels on Broadway (edge 0) and Fifth Avenue (edge 2), centred on window columns
      if (E.i === 1) continue;
      for (let k = 1; k <= 3; k++) {
        const tt = (E.len * k) / 4;
        let tc = E.cols[0];
        for (const t of E.cols)
          if (Math.abs(t - tt) < Math.abs(tc - tt)) tc = t;
        orielAt.push({ E, tc });
      }
    }
    const HW = ORIEL_W / 2,
      dOf = (s) => SAG * (1 - (s / HW) * (s / HW));
    for (const { E, tc } of orielAt) {
      const poly = [E.at(tc - HW, -0.1)];
      for (let k = 0; k <= 10; k++) {
        const s = -HW + (ORIEL_W * k) / 10;
        poly.push(E.at(tc + s, dOf(s)));
      }
      poly.push(E.at(tc + HW, -0.1));
      K.prismBands(b, "terracotta", poly, OY0, OY1, 7.5, { grime: 0.45 });
      K.prism(b, "terracotta", K.offsetPoly(poly, 0.14), OY0 - 0.45, OY0, {
        grime: 0.5,
      }); // corbel
      K.prism(b, "terracotta", K.offsetPoly(poly, 0.16), OY1, OY1 + 0.35, {
        grime: 0.4,
      }); // cap
      for (let f = 1; f < NS - 1; f++) {
        const y = Y0S + 0.6 + f * FH,
          h = 1.9;
        if (y < OY0 || y + h > OY1) continue;
        for (const s of [-S, 0, S]) {
          const d = dOf(s),
            slope = (-2 * SAG * s) / (HW * HW);
          let nx = E.n[0] - E.u[0] * slope,
            nz = E.n[1] - E.u[1] * slope;
          const nl = Math.hypot(nx, nz);
          nx /= nl;
          nz /= nl;
          const [x, z] = E.at(tc + s, d + 0.02),
            ry = Math.atan2(nx, nz),
            g = glass(0.06, 0.03);
          b.quad(g, x, y + h / 2, z, 1.0, h, {
            ry,
            uv: "box",
            noAO: true,
            grime: 0.1,
          });
          b.box(
            "terracotta",
            x + nx * 0.1,
            y - 0.12,
            z + nz * 0.1,
            1.35,
            0.1,
            0.22,
            { ry, seg: false, grime: 0.35 },
          );
          b.box(
            "terracotta",
            x + nx * 0.06,
            y + h,
            z + nz * 0.06,
            1.25,
            0.2,
            0.14,
            { ry, seg: false, grime: 0.35 },
          );
        }
        for (const s of [-1.5 * S, -S / 2, S / 2, 1.5 * S]) {
          // mullion piers on the bow
          const d = dOf(s),
            slope = (-2 * SAG * s) / (HW * HW);
          let nx = E.n[0] - E.u[0] * slope,
            nz = E.n[1] - E.u[1] * slope;
          const nl = Math.hypot(nx, nz);
          nx /= nl;
          nz /= nl;
          const [x, z] = E.at(tc + s, d + 0.05);
          if (f === 1)
            b.box("terracotta", x, OY0, z, 0.5, OY1 - OY0, 0.14, {
              ry: Math.atan2(nx, nz),
              segLen: 7,
              grime: 0.4,
            });
        }
      }
    }
    for (let f = 0; f < NS; f++)
      prowQuad(glass(0.08, 0.03), 0.02, Y0S + 0.6 + f * FH + 0.95, 0.9, 1.9);

    // ---------------- the crown: round-arched windows between pilasters ----------------
    const CY = H_SHAFT + 1.0,
      CH = 3.0,
      CW = 1.2,
      RA = CW / 2;
    const ring = (() => {
      const sh = new THREE.Shape();
      sh.absarc(0, 0, RA + 0.2, 0, Math.PI, false);
      sh.lineTo(-RA, 0);
      sh.absarc(0, 0, RA, Math.PI, 0, true);
      sh.lineTo(RA + 0.2, 0);
      return sh;
    })();
    for (const E of edges) {
      for (const t of E.bnd) {
        bx(
          E,
          "limestone",
          t,
          0.12,
          H_SHAFT + 0.6,
          0.7,
          H_TOP - H_SHAFT - 0.6,
          0.24,
          { seg: true, grime: 0.45 },
        );
        bx(E, "limestone", t, 0.18, H_TOP - 0.55, 0.9, 0.35, 0.36);
      }
      for (const t of E.cols) {
        const g = glass(0.1, 0.02);
        qd(E, g, t, 0.02, CY + CH / 2, CW, CH);
        {
          const [x, z] = E.at(t, 0.02);
          b.add(g, new THREE.CircleGeometry(RA, 10, 0, Math.PI), {
            m: LB.m4(x, CY + CH, z, E.ryF),
            uv: "box",
            noAO: true,
            grime: 0.1,
          });
        }
        {
          const [x, z] = E.at(t, 0);
          b.add(
            "limestone",
            new THREE.ExtrudeGeometry(ring, {
              depth: 0.16,
              bevelEnabled: false,
              curveSegments: 6,
            }),
            { m: LB.m4(x, CY + CH, z, E.ryF), grime: 0.3 },
          );
        }
        for (const s of [-1, 1])
          bx(E, "limestone", t + s * (RA + 0.1), 0.06, CY, 0.2, CH, 0.14);
        bx(E, "limestone", t, 0.13, CY + CH + RA - 0.05, 0.3, 0.42, 0.24); // keystone
        bx(E, "limestone", t, 0.12, CY - 0.2, CW + 0.5, 0.18, 0.26); // sill
        if (g !== "planks") {
          qd(E, "iron", t, 0.03, CY + CH / 2, 0.05, CH, { grime: 0 });
          qd(E, "iron", t, 0.03, CY + CH * 0.66, CW, 0.05, { grime: 0 });
        }
      }
      // modillions under the corona + attic windows
      const t0 = E.bnd[0] - 1.2,
        t1 = E.bnd[E.bnd.length - 1] + 1.2;
      for (let t = t0; t <= t1; t += 0.9)
        bx(E, "limestone", t, 1.15, H_TOP + 0.75, 0.22, 0.36, 0.9, {
          grime: 0.3,
        });
      for (const t of E.cols)
        qd(E, glass(0.2), t, -0.28, H_TOP + 2.55, 0.8, 0.6);
    }
    prowQuad(glass(0.1), 0.02, CY + CH / 2, 0.9, CH);
    for (let k = 0; k <= 4; k++) {
      // modillions round the nose
      const a = PR.a1 + (PR.sw * k) / 4,
        [dx, dz] = arcDir(a);
      b.box(
        "limestone",
        PR.c[0] + dx * (RP + 1.15),
        H_TOP + 0.75,
        PR.c[1] + dz * (RP + 1.15),
        0.22,
        0.36,
        0.9,
        { ry: Math.atan2(dx, dz), seg: false, grime: 0.3 },
      );
    }
    return PR;
  }

  // =====================================================================
  // FLATIRON — "Flatiron Trading Post"
  // =====================================================================
  LB.addBuilder(
    "flatiron",
    function (LB, site, root) {
      const K = LB.kit,
        D = LB.dress;
      const b = LB.batch("flatiron");
      b.ground = 0;
      b.aoH = 3.5;
      const anchors = {};
      // footprint: rounded prow at the north, base on the south street
      const P = [
        [133.4, 93.0],
        [135.2, 93.7],
        [174, 149],
        [131, 149],
        [131, 95.3],
        [131.9, 93.8],
      ];
      const inner = K.offsetPoly(P, -0.7);
      const H_BASE = 4.6,
        H_RUST = 13.6,
        H_SHAFT = 51,
        H_TOP = 57;
      // 21st Street (z≈126…134) runs straight through the footprint in the layout, so the Trading Post is a covered
      // market street: big openings on the west (Fifth Ave / Broadway) and on the diagonal east face line it up.
      const doors = {
        1: [[38.9, 49.6, 3.8]],
        2: [[18, 22, 3.4]],
        3: [
          [14.4, 23.6, 3.8],
          [45, 49.5, 3.6],
        ],
      }; // edge index → gaps (t0,t1,h)
      for (let i = 0; i < inner.length; i++) {
        const p = P[i],
          q = P[(i + 1) % P.length];
        gappedWall(b, "limestone", p, q, 0, H_BASE, 0.7, doors[i] || [], {
          grime: 0.6,
        });
      }
      // exterior skin (rounded prow, storefronts, portals, framed windows, shaft grid, oriels, crown, cornice)
      flatironSkin(b, P, doors, { H_BASE, H_RUST, H_SHAFT, H_TOP });
      LB.fillPoly(P, 0, 0, 0, H_BASE, H_TOP + 3, 2.0, { walkable: false });
      LB.fillPoly(inner, 0, 0, 0, -0.5, 0.05, 2.5, { surface: "concrete" });
      // ---- roof: water tower + billboard + settlers' lookout
      const wtx = 152,
        wtz = 136,
        RY = H_TOP + 3.1; // roof deck = top of the attic storey
      for (const [dx, dz] of [
        [-1.6, -1.6],
        [1.6, -1.6],
        [-1.6, 1.6],
        [1.6, 1.6],
      ])
        b.box("iron", wtx + dx, RY, wtz + dz, 0.2, 4.2, 0.2, { seg: false });
      b.box("iron", wtx, RY + 3.0, wtz, 3.6, 0.15, 3.6, { seg: false });
      b.cyl("rotten", wtx, RY + 4.2, wtz, 2.1, 2.2, 4.6, 16, {
        hSeg: 3,
        grime: 0.5,
      });
      for (let y = RY + 4.6; y < RY + 8.6; y += 1.0)
        b.add("iron", new THREE.TorusGeometry(2.18, 0.04, 3, 18), {
          m: LB.m4(wtx, y, wtz, 0, Math.PI / 2),
        });
      b.cyl("rust", wtx, RY + 8.8, wtz, 0.05, 2.35, 1.6, 16, { hSeg: 1 });
      const bbx = 150,
        bbz = 124;
      for (const dx of [-5, 5])
        b.box("rust", bbx + dx, RY, bbz, 0.3, 9, 0.3, { seg: false });
      b.box("rust", bbx, RY + 3.2, bbz, 12.6, 5.6, 0.25, {
        seg: false,
        grime: 0.6,
      });
      b.quad(
        LB.brandMat("prairie_root_beer"),
        bbx,
        RY + 6.0,
        bbz - 0.14,
        12,
        5.2,
        { ry: Math.PI, grime: 0.3 },
      );
      b.frame(null);
      LB.sandbags(b, 132.4, 97, 134.8, 96, 2, { y: RY, noCollide: true });
      const flag = LB.makeFlag ? LB.makeFlag(LB.flagTex(1), 3, 1.7) : null;
      b.cyl("iron", 133.8, RY, 97.6, 0.05, 0.07, 6, 6, { hSeg: 1 });
      if (flag) {
        flag.position.set(133.8, RY + 6, 97.6);
        flag.rotation.y = Math.PI / 2;
        root.add(flag);
      }
      // ---- entrance: neon sign, scrap barricade + gate, guard post (north door on Fifth Ave)
      const neonK = LB.texMat(
        "flatiron_neon",
        LB.signTex(
          "flatiron_neon",
          ["FLATIRON", "TRADING POST"],
          "neon",
          512,
          256,
          { fg: "#ff9a3a" },
        ),
        { emissive: 1.6, noShadow: true },
      );
      b.box("iron", 130.25, 5.05, 102, 0.3, 3.3, 7.2, { seg: false }); // sits on the ground-floor cornice (face x 130.14)
      b.quad(neonK, 130.07, 6.7, 102, 7, 3.3, {
        ry: -Math.PI / 2,
        grime: 0,
        noAO: true,
      });
      LB.glows.push({ pos: V(129.5, 6.7, 102), color: 0xff9040, size: 7 });
      const scripK = LB.texMat(
        "flatiron_scrip",
        LB.signTex(
          "flatiron_scrip",
          ["SCRIP ACCEPTED", "NO GUNS DRAWN"],
          "raider",
          512,
          192,
          { bg: "#50584a", fg: "#e8d8a0" },
        ),
      );
      b.quad(scripK, 130.28, 3.7, 111, 3.0, 1.1, { ry: -Math.PI / 2 });
      // settlers' forecourt barricade on the sidewalk (the Fifth Ave / Broadway roadway at x < 126 stays open)
      LB.scrapWall(b, 126.6, 96, 126.6, 100.5, 2.6, { seed: 21 });
      LB.scrapWall(b, 126.6, 108, 126.6, 113.6, 2.6, { seed: 22 });
      LB.scrapWall(b, 126.6, 113.6, 130.3, 113.6, 2.6, { seed: 23 });
      LB.scrapWall(b, 126.6, 96, 130.3, 94.8, 2.4, { seed: 24 });
      LB.sandbags(b, 127.6, 100.6, 127.6, 102.8, 3);
      LB.barrel(b, 128.2, 0, 107.5, { fire: true });
      anchors.guard1 = LB.anchor(127.9, 0, 104.4, Math.PI / 2);
      anchors.guard2 = LB.anchor(128.4, 0, 111.6, Math.PI / 2);
      anchors.entrance = LB.anchor(129.2, 0, 103.6, -Math.PI / 2);
      // market-street arch signs on both 21st Street openings
      const mkK = LB.texMat(
        "flatiron_market",
        LB.signTex(
          "flatiron_market",
          ["MARKET STREET", "CONVOYS WELCOME"],
          "enamel",
          512,
          160,
          { bg: "#3a2a1a", fg: "#f0c870" },
        ),
      );
      b.quad(mkK, 130.45, 2.9, 129.6, 3.6, 1.1, { ry: -Math.PI / 2 }); // hung under the portal's I-beam (2.35 m clear)
      {
        const t = 43.6,
          p = P[1],
          q = P[2],
          len = Math.hypot(q[0] - p[0], q[1] - p[1]),
          ux = (q[0] - p[0]) / len,
          uz = (q[1] - p[1]) / len;
        b.quad(
          mkK,
          p[0] + ux * t + uz * 0.45,
          2.9,
          p[1] + uz * t - ux * 0.45,
          3.6,
          1.1,
          { ry: Math.atan2(uz, -ux) },
        );
      }

      // INTERIOR: the Trading Post — the covered market lane on the ground floor (lit batch, stalls, bar, clinic,
      // workshop, merchant anchors) is built by 30_downtown_interior.js
      const ix = { root, anchors, P, inner, doors, H_BASE };
      LB.interiorPart("flatiron", "market", ix);
      anchors.rooftop = LB.anchor(152, RY, 128);
      const g = b.build(root);
      g.name = "flatiron";
      ix.g = g;
      LB.interiorPart("flatiron", "finish", ix); // market spawn anchors, the lit batch under the landmark, props at initDone
      LB.register("flatiron", g, anchors);
      b.box("bronze_patina", 130.3, 1.05, 107, 0.05, 0.62, 0.85, {
        seg: false,
        grime: 0.4,
      });
      LB.plaque(
        V(130.3, 1.4, 107),
        "Fuller Building Plaque",
        "\"Constructed 1902. Declared 'structurally optimistic' by the 1966 City Survey. The management is not responsible for drafts, falls, or triangular geometry.\"",
      );
    },
    30,
  );

  // =====================================================================
  // WOOLWORTH BUILDING — neo-gothic "Cathedral of Commerce"
  // =====================================================================
  LB.addBuilder(
    "woolworth",
    function (LB, site, root) {
      const K = LB.kit,
        D = LB.dress;
      const b = LB.batch("woolworth");
      b.ground = 0;
      b.aoH = 4;
      const anchors = {};
      // Round 1 refit: Broadway now runs along the EAST edge of the block (x≈32…48), so — as in NYC — the Cathedral of
      // Commerce fills the block and fronts Broadway (City Hall Park across the avenue), its tower rising sheer from the
      // Broadway front. The raiders hold a walled forecourt (x 22…30) between the portal and the Broadway sidewalk.
      const X0 = site.x0 + 1,
        X1 = site.x1 - 8,
        Z0 = site.z0 + 1,
        Z1 = site.z1 - 1;
      const ZC = (Z0 + Z1) / 2;
      const BASE_H = 40,
        GF = 6; // base block height, ground-floor (storefront) height
      const TW = 18,
        T = { x0: X1 - TW, x1: X1, z0: ZC - TW / 2, z1: ZC + TW / 2 },
        TCX = (T.x0 + T.x1) / 2,
        TCZ = ZC;
      const CZ0 = ZC - 5.5,
        CZ1 = ZC + 5.5; // light court (open to the west above the low rear range)
      // ---- base block: U round the light court, closed at the back by a lower rear range
      const basePoly = [
        [X0, Z0],
        [X1, Z0],
        [X1, Z1],
        [X0, Z1],
        [X0, CZ1],
        [T.x0, CZ1],
        [T.x0, CZ0],
        [X0, CZ0],
      ];
      const rearPoly = [
        [X0, CZ0],
        [X0 + 7, CZ0],
        [X0 + 7, CZ1],
        [X0, CZ1],
      ];
      // The storefront skin and the cornice band stand proud of the wall plane; both are NOTCHED at the Broadway portal
      // (edge 1, x = X1) so the boarded bronze doors, the pried gap (landmark_interiors, placed from anchors.door) and
      // the tympanum tracery read inside the arch instead of being papered over by limestone.
      const PORTAL_HW = 2.2;
      const notched = (d) => {
        const o = K.offsetPoly(basePoly, d);
        o.splice(
          2,
          0,
          [X1 + d, ZC - PORTAL_HW],
          [X1 - 0.3, ZC - PORTAL_HW],
          [X1 - 0.3, ZC + PORTAL_HW],
          [X1 + d, ZC + PORTAL_HW],
        );
        return o;
      };
      K.prism(b, "limestone", notched(0.12), 0, GF, { grime: 0.75 });
      K.prismBands(b, "terracotta", basePoly, GF, BASE_H, 8, { grime: 0.45 });
      K.prism(b, "limestone", notched(0.35), GF - 0.2, GF + 0.6, {});
      K.prism(b, "limestone", rearPoly, 0, GF, { grime: 0.75 });
      K.prismBands(b, "terracotta", rearPoly, GF, 24, 8, { grime: 0.5 });
      K.prism(b, "terracotta", K.offsetPoly(rearPoly, 0.3), 24, 24.9, {});
      const EB = 1; // basePoly edge 1 = the Broadway face (tower in its middle, handled separately)
      // Cass Gilbert's elevation: continuous terracotta piers every bay pair, recessed darker spandrels, a tracery storey
      // every 6 floors and at the top, belt courses stopping short of the piers (K.gothicFacade — all merged).
      const baseFac = {
        y0: GF + 0.6,
        y1: BASE_H - 0.6,
        floorH: 2.7,
        pair: 4.4,
        pierW: 0.7,
        pierD: 0.55,
        band: 6,
        margin: 1.0,
        broken: 0.28,
        boarded: 0.06,
        lit: 0.015,
      };
      const baseTops = K.gothicFacade(
        b,
        basePoly,
        Object.assign({}, baseFac, { seed: 11, skipEdge: (i) => i === EB }),
      );
      K.gothicFacade(
        b,
        rearPoly,
        Object.assign({}, baseFac, {
          y1: 23.6,
          seed: 12,
          margin: 0.8,
          skipEdge: (i) => i !== 1 && i !== 3,
        }),
      );
      // the two short Broadway stretches of the base either side of the tower
      for (const [za, zb] of [
        [Z0, T.z0],
        [T.z1, Z1],
      ]) {
        K.gothicFacade(
          b,
          [
            [X1, za],
            [X1, zb],
            [X1 - 1, zb],
            [X1 - 1, za],
          ],
          Object.assign({}, baseFac, {
            seed: 13 + za,
            margin: 0.5,
            skipEdge: (i) => i !== 0,
          }),
        );
      }
      // gothic arcade band (pointed lancets between the piers) + cornice + pinnacled parapet on the base roofline
      const lancetRow = (poly, y, w, h, spacing, skip, key) => {
        let A = 0;
        for (let i = 0; i < poly.length; i++) {
          const p = poly[i],
            q = poly[(i + 1) % poly.length];
          A += p[0] * q[1] - q[0] * p[1];
        }
        const sgn = A > 0 ? 1 : -1;
        for (let i = 0; i < poly.length; i++) {
          if (skip && skip(i)) continue;
          const p = poly[i],
            q = poly[(i + 1) % poly.length],
            dx = q[0] - p[0],
            dz = q[1] - p[1],
            len = Math.hypot(dx, dz);
          if (len < 3) continue;
          const ux = dx / len,
            uz = dz / len,
            nx = uz * sgn,
            nz = -ux * sgn,
            ry = Math.atan2(nx, nz);
          const n = Math.max(1, Math.floor((len - 2) / spacing)),
            st = (len - (n - 1) * spacing) / 2;
          for (let k = 0; k < n; k++) {
            const t = st + k * spacing;
            K.lancet(
              b,
              key || "glass_dark",
              "terracotta",
              p[0] + ux * t + nx * 0.06,
              y,
              p[1] + uz * t + nz * 0.06,
              w,
              h,
              ry,
            );
          }
        }
      };
      K.prism(
        b,
        "terracotta",
        K.offsetPoly(basePoly, 0.5),
        BASE_H - 0.6,
        BASE_H + 0.3,
        {},
      );
      K.prism(
        b,
        "terracotta",
        K.offsetPoly(basePoly, 0.2),
        BASE_H + 0.3,
        BASE_H + 1.2,
        {},
      );
      for (let i = 0; i < baseTops.length; i++) {
        // pinnacles crown every second pier head (every pier on the short faces)
        const t = baseTops[i];
        if (i % 2 && baseTops.length > 12) continue;
        if (t.x > T.x0 - 0.5 && t.z > T.z0 - 0.5 && t.z < T.z1 + 0.5) continue;
        K.pinnacle(
          b,
          "terracotta",
          t.x - t.nx * 0.3,
          BASE_H + 1.2,
          t.z - t.nz * 0.3,
          0.7,
          3.6,
          { spireKey: "copper_roof" },
        );
      }
      for (const [cx, cz] of [
        [X0, Z0],
        [X1, Z0],
        [X1, Z1],
        [X0, Z1],
      ])
        K.pinnacle(b, "terracotta", cx, BASE_H + 1.2, cz, 1.0, 5.0, {
          spireKey: "copper_roof",
        });
      LB.fillPoly(basePoly, 0, 0, 0, 0, BASE_H + 1.2, 2.0, { walkable: false });
      LB.colMM(X0, 0, CZ0, X0 + 7, 24.9, CZ1, { walkable: false });
      // ---- ground floor: pointed shop arches on every street face (glass / boarded / smashed)
      {
        const r = LB.rng("wool_gf");
        const faces = [
          [
            [X0, Z0],
            [X1, Z0],
          ],
          [
            [X1, Z1],
            [X0, Z1],
          ],
          [
            [X1, Z0],
            [X1, T.z0],
          ],
          [
            [X1, T.z1],
            [X1, Z1],
          ],
          [
            [X0, Z1],
            [X0, CZ1],
          ],
          [
            [X0, CZ0],
            [X0, Z0],
          ],
        ];
        for (const [p, q] of faces) {
          const dx = q[0] - p[0],
            dz = q[1] - p[1],
            len = Math.hypot(dx, dz),
            ux = dx / len,
            uz = dz / len;
          let A = 0;
          for (let i = 0; i < basePoly.length; i++) {
            const a = basePoly[i],
              c = basePoly[(i + 1) % basePoly.length];
            A += a[0] * c[1] - c[0] * a[1];
          }
          const sgn = A > 0 ? 1 : -1,
            nx = uz * sgn,
            nz = -ux * sgn,
            ry = Math.atan2(nx, nz);
          const n = Math.max(1, Math.floor((len - 1.6) / 4.4)),
            st = (len - (n - 1) * 4.4) / 2;
          for (let k = 0; k < n; k++) {
            const t = st + k * 4.4,
              x = p[0] + ux * t + nx * 0.16,
              z = p[1] + uz * t + nz * 0.16,
              roll = r();
            K.lancet(
              b,
              roll < 0.3
                ? "glass_broken"
                : roll < 0.6
                  ? "planks"
                  : "glass_dark",
              "limestone",
              x,
              0.5,
              z,
              3.0,
              4.6,
              ry,
            );
            b.box(
              "limestone",
              x - ux * 2.2 + nx * 0.2,
              0,
              z - uz * 2.2 + nz * 0.2,
              0.7,
              GF - 0.2,
              0.4,
              { ry, seg: false, grime: 0.6 },
            );
          }
        }
      }
      // ---- the tower (flush with Broadway, rising sheer from the sidewalk). Lower shaft 18 m square to the shoulder
      // setback at SH (≈2/3 of the shaft), upper shaft inset 1 m to TH1; corner turrets on both stages.
      const TH1 = 80,
        TH2 = 89,
        PY0 = 94,
        PY1 = 104,
        SH = 58;
      const towerPoly = [
        [T.x0, T.z0],
        [T.x1, T.z0],
        [T.x1, T.z1],
        [T.x0, T.z1],
      ];
      const uPoly = K.offsetPoly(towerPoly, -1.0);
      const TE = 1; // towerPoly edge 1 = Broadway face
      K.prism(b, "limestone", K.offsetPoly(towerPoly, 0.1), 0, GF, {
        grime: 0.75,
        noAO: false,
      });
      K.prismBands(b, "terracotta", towerPoly, GF, SH + 0.9, 9, { grime: 0.4 });
      K.prismBands(b, "terracotta", uPoly, SH + 0.9, TH1, 9, { grime: 0.35 });
      const towFac = {
        floorH: 2.7,
        pair: 4.0,
        pierW: 0.75,
        pierD: 0.65,
        band: 8,
        margin: 1.6,
        broken: 0.22,
        lit: 0.02,
      };
      // Broadway face: the outer piers run from the storefront cornice, the inner pair springs off the portal's apex
      K.gothicFacade(
        b,
        towerPoly,
        Object.assign({}, towFac, {
          y0: GF + 0.6,
          y1: SH,
          seed: 18,
          skipEdge: (i) => i !== TE,
          pierFrom: (i, k) => (k === 1 || k === 2 ? 10.9 : GF + 0.3),
          bayFrom: (i, k) => (k === 1 ? 11.4 : GF + 0.6),
        }),
      );
      K.gothicFacade(
        b,
        towerPoly,
        Object.assign({}, towFac, {
          y0: BASE_H + 1.8,
          y1: SH,
          seed: 17,
          skipEdge: (i) => i === TE,
        }),
      );
      const towTops = K.gothicFacade(
        b,
        uPoly,
        Object.assign({}, towFac, {
          y0: SH + 1.5,
          y1: TH1 - 0.2,
          margin: 1.4,
          seed: 19,
        }),
      );
      // shoulder: cornice + pinnacles on the lower shaft's pier heads
      K.prism(b, "terracotta", K.offsetPoly(towerPoly, 0.75), SH, SH + 0.5, {});
      K.prism(
        b,
        "terracotta",
        K.offsetPoly(towerPoly, 0.35),
        SH + 0.5,
        SH + 1.3,
        {},
      );
      for (let i = 0; i < 4; i++) {
        const p = towerPoly[i],
          q = towerPoly[(i + 1) % 4];
        for (let k = 1; k < 4; k++) {
          const t = k / 4;
          K.pinnacle(
            b,
            "terracotta",
            p[0] + (q[0] - p[0]) * t,
            SH + 1.3,
            p[1] + (q[1] - p[1]) * t,
            0.55,
            3.0,
            { spireKey: "copper_roof", finial: false },
          );
        }
      }
      // octagonal corner turrets: lower pair to the shoulder, upper pair to above the crown's parapet
      for (const [cx, cz] of towerPoly) {
        const ty0 = cx > T.x1 - 1 ? GF : BASE_H + 1.2;
        b.cyl("terracotta", cx, ty0, cz, 1.35, 1.5, SH + 2.5 - ty0, 8, {
          hSeg: 6,
          grime: 0.4,
        });
        for (let y = ty0 + 8; y < SH; y += 8)
          b.cyl("terracotta", cx, y, cz, 1.62, 1.62, 0.45, 8, { hSeg: 1 });
        K.pinnacle(b, "terracotta", cx, SH + 2.5, cz, 1.5, 6.0, {
          spireKey: "copper_roof",
        });
      }
      for (const [cx, cz] of uPoly) {
        b.cyl(
          "terracotta",
          cx,
          SH + 1.3,
          cz,
          1.2,
          1.35,
          TH1 + 4 - SH - 1.3,
          8,
          { hSeg: 5, grime: 0.35 },
        );
        for (let y = SH + 8; y < TH1; y += 8)
          b.cyl("terracotta", cx, y, cz, 1.45, 1.45, 0.4, 8, { hSeg: 1 });
        K.pinnacle(b, "terracotta", cx, TH1 + 4, cz, 1.5, 7.0, {
          spireKey: "copper_roof",
        });
      }
      K.prism(b, "terracotta", K.offsetPoly(uPoly, 0.75), TH1, TH1 + 1.4, {});
      for (const t of towTops)
        K.pinnacle(
          b,
          "terracotta",
          t.x - t.nx * 0.2,
          TH1 + 1.4,
          t.z - t.nz * 0.2,
          0.6,
          3.6,
          { spireKey: "copper_roof" },
        );
      // crown stage 1 (inset) with tall tracery windows and corner pinnacles, flying buttresses to the turrets
      const T2 = {
        x0: T.x0 + 2.4,
        x1: T.x1 - 2.4,
        z0: T.z0 + 2.4,
        z1: T.z1 - 2.4,
      };
      const t2Poly = [
        [T2.x0, T2.z0],
        [T2.x1, T2.z0],
        [T2.x1, T2.z1],
        [T2.x0, T2.z1],
      ];
      K.prism(b, "terracotta", t2Poly, TH1 + 1.4, TH2, { grime: 0.35 });
      lancetRow(t2Poly, TH1 + 2.4, 1.2, 5.0, 2.2, null);
      K.prism(b, "terracotta", K.offsetPoly(t2Poly, 0.4), TH2, TH2 + 0.8, {});
      for (let i = 0; i < 4; i++) {
        const [cx, cz] = uPoly[i],
          [ix, iz] = t2Poly[i];
        K.pinnacle(b, "terracotta", ix, TH2 + 0.8, iz, 1.1, 5.4, {
          spireKey: "copper_roof",
        });
        b.beam(
          "terracotta",
          V(cx, TH1 + 6.2, cz),
          V(ix, TH2 - 1, iz),
          0.4,
          0.5,
          { grime: 0.3 },
        );
      }
      // crown stage 2 (smaller) under the copper pyramid
      const T3 = {
        x0: T2.x0 + 1.6,
        x1: T2.x1 - 1.6,
        z0: T2.z0 + 1.6,
        z1: T2.z1 - 1.6,
      };
      const t3Poly = [
        [T3.x0, T3.z0],
        [T3.x1, T3.z0],
        [T3.x1, T3.z1],
        [T3.x0, T3.z1],
      ];
      K.prism(b, "terracotta", t3Poly, TH2 + 0.8, PY0, { grime: 0.35 });
      lancetRow(t3Poly, TH2 + 1.3, 0.9, 2.6, 1.8, null);
      for (const [cx, cz] of t3Poly)
        K.pinnacle(b, "terracotta", cx, PY0 - 1.5, cz, 0.9, 4.6, {
          spireKey: "copper_roof",
        });
      K.prism(
        b,
        "terracotta",
        K.offsetPoly(t3Poly, 0.35),
        PY0 - 0.2,
        PY0 + 0.4,
        {},
      );
      // copper pyramid roof with two tiers of dormers, lantern, spire and a still-blinking aircraft beacon
      const PH = (T3.x1 - T3.x0) / 2 + 0.3;
      const pyr = new THREE.ConeGeometry(Math.SQRT2 * PH, PY1 - PY0, 4, 4);
      pyr.rotateY(Math.PI / 4);
      b.add("copper_roof", pyr, {
        m: LB.m4(TCX, PY0 + 0.4 + (PY1 - PY0) / 2, TCZ),
        grime: 0.3,
        aoH: 1,
      });
      for (let f = 0; f < 4; f++) {
        const ry = (f * Math.PI) / 2,
          s = Math.sin(ry),
          c = Math.cos(ry);
        for (const dy of [1.6, 4.4]) {
          const off = PH - 0.2 - (dy * PH) / (PY1 - PY0);
          const dx = TCX + s * off,
            dz = TCZ + c * off,
            sc = dy > 2 ? 0.75 : 1;
          b.box("copper_roof", dx, PY0 + dy, dz, 1.3 * sc, 1.5 * sc, 1.1, {
            ry,
            seg: false,
          });
          const dp = new THREE.ConeGeometry(0.95 * sc, 1.0 * sc, 4, 1);
          dp.rotateY(Math.PI / 4);
          b.add("copper_roof", dp, {
            m: LB.m4(
              dx,
              PY0 + dy + 1.5 * sc + 0.5 * sc,
              dz,
              ry,
              0,
              0,
              1,
              1,
              0.8,
            ),
          });
          b.quad(
            "glass_dark",
            dx + s * 0.57,
            PY0 + dy + 0.75 * sc,
            dz + c * 0.57,
            0.6 * sc,
            0.95 * sc,
            { ry },
          );
        }
      }
      b.cyl("copper_roof", TCX, PY1 - 0.6, TCZ, 1.0, 1.3, 2.6, 8, { hSeg: 1 });
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU;
        b.cyl(
          "copper_roof",
          TCX + Math.cos(a) * 1.1,
          PY1 + 2.0,
          TCZ + Math.sin(a) * 1.1,
          0.08,
          0.08,
          1.6,
          4,
          { hSeg: 1 },
        );
      }
      b.cyl("copper_roof", TCX, PY1 + 3.6, TCZ, 0.05, 1.25, 4.2, 8, {
        hSeg: 2,
      });
      b.cyl("iron", TCX, PY1 + 7.6, TCZ, 0.03, 0.06, 3, 4, { hSeg: 1 });
      b.sphere("lamp_red", TCX, PY1 + 10.6, TCZ, 0.18, {
        noAO: true,
        grime: 0,
      });
      LB.glows.push({
        pos: V(TCX, PY1 + 10.6, TCZ),
        color: 0xff3020,
        size: 3,
        opts: { dayFactor: 0.2 },
      });
      LB.colMM(T.x0, BASE_H, T.z0, T.x1, SH + 1.3, T.z1, { walkable: false });
      LB.colMM(T.x0 + 1, SH + 1.3, T.z0 + 1, T.x1 - 1, TH1 + 1.4, T.z1 - 1, {
        walkable: false,
      });
      LB.colMM(T2.x0, TH1 + 1.4, T2.z0, T2.x1, PY1, T2.z1, { walkable: false });
      // ---- the Broadway portal: a three-storey pointed arch with tracery tympanum, the pried-open bronze doors
      const OW = 4.4,
        OH = 8.2,
        FW = 8.2,
        FH = 10.6,
        FD = 0.9;
      {
        const sh = new THREE.Shape();
        sh.moveTo(-FW / 2, 0);
        sh.lineTo(FW / 2, 0);
        sh.lineTo(FW / 2, FH - 1.6);
        sh.lineTo(0, FH);
        sh.lineTo(-FW / 2, FH - 1.6);
        sh.closePath();
        const spring = OH - OW * 0.8,
          hl = new THREE.Path();
        hl.moveTo(-OW / 2, 0);
        hl.lineTo(OW / 2, 0);
        hl.lineTo(OW / 2, spring);
        hl.quadraticCurveTo(OW / 2, OH - OW * 0.15, 0, OH);
        hl.quadraticCurveTo(-OW / 2, OH - OW * 0.15, -OW / 2, spring);
        hl.lineTo(-OW / 2, 0);
        sh.holes.push(hl);
        b.add(
          "limestone",
          new THREE.ExtrudeGeometry(sh, {
            depth: FD,
            bevelEnabled: false,
            curveSegments: 10,
          }),
          { m: LB.m4(X1, 0, ZC, Math.PI / 2), grime: 0.55, aoH: 3 },
        );
        // recessed archivolt rings
        for (let k = 1; k <= 3; k++) {
          const w = OW + k * 0.5,
            h = OH + k * 0.45;
          const ring = new THREE.Shape();
          const sp2 = h - w * 0.8;
          ring.moveTo(-w / 2, sp2);
          ring.quadraticCurveTo(-w / 2, h - w * 0.15, 0, h);
          ring.quadraticCurveTo(w / 2, h - w * 0.15, w / 2, sp2);
          ring.lineTo(w / 2 - 0.18, sp2);
          ring.quadraticCurveTo(w / 2 - 0.18, h - 0.18 - w * 0.15, 0, h - 0.18);
          ring.quadraticCurveTo(
            -w / 2 + 0.18,
            h - 0.18 - w * 0.15,
            -w / 2 + 0.18,
            sp2,
          );
          ring.closePath();
          b.add(
            "terracotta",
            new THREE.ExtrudeGeometry(ring, {
              depth: 0.14,
              bevelEnabled: false,
              curveSegments: 8,
            }),
            { m: LB.m4(X1 + FD, 0, ZC, Math.PI / 2), grime: 0.4 },
          );
        }
        for (const s of [-1, 1]) {
          // clustered colonnettes on the jambs + crocketed pinnacles on the frame shoulders
          for (let k = 0; k < 3; k++)
            b.cyl(
              "limestone",
              X1 + FD + 0.05,
              0,
              ZC + s * (OW / 2 + 0.25 + k * 0.28),
              0.12,
              0.14,
              OH - OW * 0.8,
              8,
              { hSeg: 2 },
            );
          K.pinnacle(
            b,
            "terracotta",
            X1 + FD / 2,
            FH - 1.6,
            ZC + s * (FW / 2 - 0.4),
            0.8,
            3.6,
            { spireKey: "copper_roof" },
          );
        }
        LB.colMM(X1, 0, ZC - FW / 2, X1 + FD, FH, ZC - OW / 2, {
          walkable: false,
        });
        LB.colMM(X1, 0, ZC + OW / 2, X1 + FD, FH, ZC + FW / 2, {
          walkable: false,
        });
        // tympanum: glass tracery above a transom, the doors below (boarded — the raiders pried a gap, see landmark_interiors)
        K.lancet(
          b,
          "glass_dark",
          null,
          X1 + 0.04,
          3.4,
          ZC,
          OW,
          OH - 3.4,
          Math.PI / 2,
        );
        b.box("bronze", X1 + 0.1, 3.2, ZC, 0.16, 0.25, OW, { seg: false });
        for (const dz of [-1.1, 0, 1.1])
          b.box(
            "bronze",
            X1 + 0.08,
            3.4,
            ZC + dz,
            0.08,
            OH - 3.6 - Math.abs(dz) * 0.8,
            0.09,
            { seg: false },
          );
        b.quad("planks", X1 + 0.03, 1.6, ZC, OW - 0.2, 3.2, {
          ry: Math.PI / 2,
          uv: "box",
        });
        const wwK = LB.texMat(
          "wool_name",
          LB.signTex(
            "wool_name",
            ["WOOLWORTH BUILDING"],
            "engraved",
            1024,
            96,
            { bg: "#d8ceb4", size: 60 },
          ),
        );
        b.quad(wwK, X1 + 0.08, GF - 0.45, ZC + 6.6, 3.8, 0.42, {
          ry: Math.PI / 2,
        });
        b.quad(wwK, X1 + 0.08, GF - 0.45, ZC - 6.6, 3.8, 0.42, {
          ry: Math.PI / 2,
        });
      }
      for (const s of [-1, 1]) {
        // shop arches either side of the portal on the tower's Broadway face
        K.lancet(
          b,
          s < 0 ? "glass_broken" : "planks",
          "limestone",
          X1 + 0.16,
          0.5,
          ZC + s * 6.6,
          3.0,
          4.6,
          Math.PI / 2,
        );
      }
      anchors.door = LB.anchor(X1 + 0.06, 0, ZC, -Math.PI / 2);
      anchors.door.w = OW - 0.4;
      anchors.door.h = 3.2;

      // ---- raider camp "Five & Dime of Death": a walled forecourt between the portal and the Broadway sidewalk ----
      const FX = site.x1 - 0.4; // outer wall line (just inside the lot, sidewalk stays clear)
      // The gate is opened wider than the portal frame and the wall either side drops to chest height, so from the
      // Broadway sidewalk (and City Hall Park) the three-storey arch — lit by the raiders' fire barrels — is the focal point.
      const GW = FW / 2 + 1.2; // gate half-width (> the arch frame's)
      LB.scrapWall(b, FX, Z0 + 0.6, FX, ZC - GW - 2.6, 2.8, { seed: 33 });
      LB.scrapWall(b, FX, ZC - GW - 2.6, FX, ZC - GW, 1.9, { seed: 38 });
      LB.scrapWall(b, FX, ZC + GW, FX, ZC + GW + 2.6, 1.9, { seed: 39 });
      LB.scrapWall(b, FX, ZC + GW + 2.6, FX, Z1 - 0.6, 2.8, { seed: 34 });
      LB.scrapWall(b, X1 + 0.3, Z0 + 0.6, FX, Z0 + 0.6, 2.8, { seed: 35 });
      LB.scrapWall(b, X1 + 0.3, Z1 - 0.6, FX, Z1 - 0.6, 2.8, { seed: 36 });
      // gate: two skull-topped posts (no crossbar — nothing crosses the arch in the approach view)
      for (const s of [-1, 1]) {
        b.box("rust", FX, 0, ZC + s * GW, 0.3, 3.6, 0.3, { seg: false });
        b.sphere("bone", FX, 3.75, ZC + s * GW, 0.16, {
          sx: 1,
          sy: 1.1,
          sz: 1.2,
        });
        for (let k = 0; k < 3; k++)
          b.rod(
            "iron",
            V(FX + 0.16, 3.3 - k * 0.5, ZC + s * GW),
            V(FX + 0.16, 2.9 - k * 0.5, ZC + s * GW + s * 0.08),
            0.02,
            4,
          );
      }
      // the raider sign rides the tall north stretch of the wall on its own posts, facing Broadway
      {
        const sz = (Z0 + 0.6 + ZC - GW - 2.6) / 2;
        for (const d of [-1.9, 1.9])
          b.box("rust", FX - 0.1, 0, sz + d, 0.16, 4.9, 0.16, { seg: false });
        const woolK = LB.texMat(
          "wool_raider",
          LB.signTex(
            "wool_raider",
            ["FIVE & DIME", "OF DEATH"],
            "raider",
            512,
            192,
          ),
        );
        b.quad(woolK, FX + 0.02, 3.9, sz, 4.4, 1.65, { ry: Math.PI / 2 });
        b.quad(woolK, FX - 0.22, 3.9, sz, 4.4, 1.65, { ry: -Math.PI / 2 });
      }
      LB.sandbags(b, FX - 1.2, ZC - GW - 2.4, FX - 1.2, ZC - GW - 0.4, 2);
      LB.sandbags(b, FX - 1.2, ZC + GW + 0.4, FX - 1.2, ZC + GW + 2.4, 2);
      // fire barrels flank the portal; their glow washes the tympanum
      LB.barrel(b, X1 + 2.0, 0, ZC - FW / 2 - 0.2, { fire: true });
      LB.barrel(b, X1 + 2.0, 0, ZC + FW / 2 + 0.2, { fire: true });
      LB.glows.push({ pos: V(X1 + 1.6, 5.6, ZC), color: 0xff9a50, size: 7.5 });
      LB.barrel(b, X1 + 2.2, 0, Z1 - 2.6, { fire: true });
      for (let i = 0; i < 3; i++)
        D.mattress(
          b,
          X1 + 1.4 + (i % 2) * 0.2,
          0,
          Z0 + 2.4 + i * 1.3,
          Math.PI / 2 + 0.15 * i,
          0xa89878,
        );
      // cage + skeleton, meat hooks on the portal
      {
        const cx = X1 + 4.2,
          cz = ZC + 6.6;
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * TAU;
          b.box(
            "iron",
            cx + Math.cos(a) * 0.9,
            0,
            cz + Math.sin(a) * 0.9,
            0.05,
            2.2,
            0.05,
            { seg: false },
          );
        }
        b.cyl("iron", cx, 2.2, cz, 1.0, 1.0, 0.08, 8, { hSeg: 1 });
        LB.col(cx, cz, 1.9, 1.9, 0, 2.3, 0, { walkable: false });
        LB.skeleton(b, cx, 0.05, cz - 0.1, 1.2);
      }
      for (const dz of [-1.6, -0.8, 0.9]) {
        b.rod(
          "iron",
          V(X1 + FD + 0.2, 6.2, ZC + dz),
          V(X1 + FD + 0.2, 5.2 - Math.abs(dz) * 0.3, ZC + dz),
          0.015,
          4,
        );
        b.add(
          "iron",
          new THREE.TorusGeometry(0.09, 0.015, 3, 8, Math.PI * 1.4),
          {
            m: LB.m4(
              X1 + FD + 0.2,
              5.1 - Math.abs(dz) * 0.3,
              ZC + dz,
              Math.PI / 2,
            ),
          },
        );
      }
      // lookout tower in the forecourt's south corner
      {
        const x = X1 + 4.4,
          z = Z1 - 3.4;
        for (const [dx, dz] of [
          [-1.3, -1.3],
          [1.3, -1.3],
          [-1.3, 1.3],
          [1.3, 1.3],
        ])
          b.box("rust", x + dx, 0, z + dz, 0.2, 6.5, 0.2, { seg: false });
        for (let y = 1.2; y < 6; y += 1.8) {
          b.beam(
            "rust",
            V(x - 1.3, y, z - 1.3),
            V(x + 1.3, y + 1.3, z - 1.3),
            0.08,
          );
          b.beam(
            "rust",
            V(x - 1.3, y, z + 1.3),
            V(x - 1.3, y + 1.3, z - 1.3),
            0.08,
          );
        }
        b.boxMM("planks", x - 1.7, 6.5, z - 1.7, x + 1.7, 6.7, z + 1.7, {
          seg: false,
        });
        LB.scrapWall(b, x + 1.7, z - 1.7, x + 1.7, z + 1.7, 1.2, {
          y: 6.7,
          noCollide: true,
          seed: 37,
        });
        b.box("corrugated", x, 8.4, z, 3.8, 0.12, 3.8, {
          seg: false,
          rx: -0.1,
        });
        LB.colMM(x - 1.7, 0, z - 1.7, x + 1.7, 6.7, z + 1.7, {
          surface: "wood",
        });
        anchors.lookout = LB.anchor(x, 6.7, z, -Math.PI / 2);
      }
      anchors.entrance = LB.anchor(FX + 2.2, 0, ZC, Math.PI / 2);
      anchors.boss = LB.anchor(X1 + 2.6, 0, ZC + 1.2, -Math.PI / 2);
      anchors.spawn1 = LB.anchor(X1 + 4.0, 0, ZC + 2.8);
      anchors.spawn2 = LB.anchor(X1 + 2.6, 0, ZC - 7.5);
      anchors.spawn3 = LB.anchor(FX - 2.2, 0, ZC - 2.4);
      anchors.spawn4 = LB.anchor(X1 + 1.8, 0, Z1 - 7);
      anchors.rooftop = LB.anchor(X0 + 12, BASE_H + 1.2, Z0 + 4);
      anchors.footlocker = LB.anchor(X1 + 1.0, 0, Z0 + 6.4, -Math.PI / 2);
      anchors.loot = anchors.footlocker.clone();
      const g = b.build(root);
      g.name = "woolworth";
      LB.register("woolworth", g, anchors);
      LB.plaque(
        V(X1 + 0.9, 1.4, ZC - FW / 2 - 0.8),
        "Woolworth Building Plaque",
        "\"The Cathedral of Commerce, 1913. Paid for entirely in nickels and dimes. Management regrets that the five-and-dime has been converted to a raider 'Five & Dime of Death'. Prices unchanged.\"",
      );
      LB.onReady.push(() => {
        LB.spawnProp("footlocker", {
          x: anchors.footlocker.x,
          y: 0,
          z: anchors.footlocker.z,
          yaw: -Math.PI / 2,
          loot: "raider_stash",
          owner: "raiders",
        });
      });
    },
    31,
  );

  // =====================================================================
  // CITY HALL + City Hall Park
  // =====================================================================
  LB.addBuilder(
    "city_hall",
    function (LB, site, root) {
      const K = LB.kit;
      const b = LB.batch("city_hall");
      b.ground = 0;
      b.aoH = 3;
      const anchors = {};
      const CX = 80,
        ZF = 612; // building centre x, south facade z
      const W0 = 56,
        W1 = 104,
        ZB = 592; // extents
      const H1 = 12.5; // two storeys
      // podium steps across the front
      for (let i = 0; i < 4; i++) {
        b.boxMM(
          "marble",
          W0 - 1 + i * 0.3,
          0,
          ZB - 1,
          W1 + 1 - i * 0.3,
          0.3 * (i + 1),
          ZF + 6 - i * 0.6,
          { grime: 0.5 },
        );
        LB.colMM(
          W0 - 1 + i * 0.3,
          0,
          ZB - 1,
          W1 + 1 - i * 0.3,
          0.3 * (i + 1),
          ZF + 6 - i * 0.6,
        );
      }
      const FY = 1.2;
      // ---- wings & end pavilions: solid marble masses (+ attic parapet); the elevations are modelled by chElev()
      const DMG0 = 98.4,
        DMG1 = 102.8; // shell burst through the east pavilion's upper storey & roofline
      const wing = (x0, x1, z1, gap) => {
        b.boxMM("marble", x0, FY, ZB, x1, FY + H1, z1, {
          grime: 0.45,
          segLen: 4,
        });
        LB.colMM(x0, FY, ZB, x1, FY + H1 + 0.6, z1, { walkable: false });
        const px0 = x0 - 0.35,
          px1 = x1 + 0.35,
          pz0 = ZB - 0.35,
          pz1 = z1 + 0.35,
          y0 = FY + H1,
          y1 = y0 + 0.6;
        if (!gap) {
          b.boxMM("marble", px0, y0, pz0, px1, y1, pz1, {
            seg: false,
            grime: 0.4,
          });
          return;
        }
        b.boxMM("marble", px0, y0, pz0, px1, y1, pz1 - 3.2, {
          seg: false,
          grime: 0.4,
        });
        b.boxMM("marble", px0, y0, pz1 - 3.2, gap[0], y1, pz1, {
          seg: false,
          grime: 0.5,
        });
        b.boxMM("marble", gap[1], y0, pz1 - 3.2, px1, y1, pz1, {
          seg: false,
          grime: 0.5,
        });
        b.boxMM(
          "concrete_dark",
          gap[0],
          y0 - 0.3,
          pz1 - 3.2,
          gap[1],
          y0 + 0.08,
          z1 - 0.2,
          { seg: false, grime: 1 },
        ); // burnt-out roof
      };
      wing(W0, 64, ZF + 1.5);
      wing(96, W1, ZF + 1.5, [DMG0, DMG1]); // end pavilions project 1.5 m
      wing(64, 72, ZF);
      wing(88, 96, ZF);
      // elevations: arched ground-floor windows between Ionic pilasters, pedimented upper windows between Corinthian
      // pilasters, two entablatures + modillioned cornice (front), same order without pediments on the sides & rear
      chElev(b, [W0, ZF + 1.5], [1, 0], [0, 1], 8, 3, { FY, seed: 11 });
      chElev(b, [64, ZF], [1, 0], [0, 1], 8, 3, { FY, seed: 12 });
      chElev(b, [88, ZF], [1, 0], [0, 1], 8, 3, { FY, seed: 13 });
      chElev(b, [96, ZF + 1.5], [1, 0], [0, 1], 8, 3, {
        FY,
        seed: 14,
        breach: [DMG0 - 96, DMG1 - 96],
      });
      chElev(b, [W0, ZF + 1.5], [0, -1], [-1, 0], ZF + 1.5 - ZB, 7, {
        FY,
        seed: 15,
      });
      chElev(b, [W1, ZB], [0, 1], [1, 0], ZF + 1.5 - ZB, 7, { FY, seed: 16 });
      chElev(b, [W1, ZB], [-1, 0], [0, -1], W1 - W0, 15, {
        FY,
        seed: 17,
        plain: true,
      });
      // balustrade + urns on the roofline (broken where the shell came through)
      const BY = FY + H1 + 0.6;
      K.balustrade(
        b,
        "marble",
        [
          [W0 - 0.3, ZF + 1.8],
          [64, ZF + 1.8],
          [64, ZF + 0.3],
          [96, ZF + 0.3],
          [96, ZF + 1.8],
          [DMG0 - 0.3, ZF + 1.8],
        ],
        BY,
        1.0,
        { urns: true },
      );
      K.balustrade(
        b,
        "marble",
        [
          [DMG1 + 0.4, ZF + 1.8],
          [W1 + 0.3, ZF + 1.8],
        ],
        BY,
        1.0,
        { urns: true },
      );
      K.balustrade(
        b,
        "marble",
        [
          [W0 - 0.3, ZB - 0.3],
          [W1 + 0.3, ZB - 0.3],
        ],
        BY,
        1.0,
        {},
      );
      K.balustrade(
        b,
        "marble",
        [
          [W0 - 0.3, ZB - 0.3],
          [W0 - 0.3, ZF + 1.8],
        ],
        BY,
        1.0,
        {},
      );
      K.balustrade(
        b,
        "marble",
        [
          [W1 + 0.3, ZB - 0.3],
          [W1 + 0.3, ZF + 1.8],
        ],
        BY,
        1.0,
        {},
      );
      // central pavilion: walk-in rotunda at ground level, portico, upper floor
      const CP0 = 72,
        CP1 = 88;
      K.room(
        b,
        "marble",
        CP0,
        ZB,
        CP1,
        ZF,
        FY,
        FY + 6.2,
        0.8,
        [{ side: "s", c: CX, w: 3.2, h: 4.2 }],
        { grime: 0.4 },
      );
      b.boxMM("marble", CP0, FY + 6.2, ZB, CP1, FY + H1 + 0.6, ZF, {
        grime: 0.4,
      });
      LB.colMM(CP0, FY + 6.2, ZB, CP1, FY + H1 + 0.6, ZF, { walkable: false });
      // ---- the walk-in rotunda (lit batch, the Mayor's desk, rotunda anchors): 30_downtown_interior.js
      const ix = { root, anchors, CX, FY, ZB, ZF, CP0, CP1 };
      LB.interiorPart("city_hall", "rotunda", ix);
      // portico: 8 columns across, entablature, pediment-less balustrade (City Hall has none), clock cupola
      K.colonnade(
        b,
        "marble",
        CP0 + 0.8,
        ZF + 3.2,
        CP1 - 0.8,
        ZF + 3.2,
        FY,
        5.8,
        8,
        0.32,
        {},
      );
      b.boxMM("marble", CP0, FY + 5.8, ZF, CP1, FY + 6.6, ZF + 4, {
        seg: false,
        grime: 0.35,
      });
      LB.colMM(CP0, FY + 5.8, ZF, CP1, FY + 6.6, ZF + 4);
      K.colonnade(
        b,
        "marble",
        CP0 + 0.8,
        ZF + 3.2,
        CP1 - 0.8,
        ZF + 3.2,
        FY + 6.6,
        5.4,
        8,
        0.28,
        { collide: false },
      );
      b.boxMM("marble", CP0, FY + 12.0, ZF, CP1, FY + 12.9, ZF + 4, {
        seg: false,
        grime: 0.35,
      });
      K.balustrade(
        b,
        "marble",
        [
          [CP0, ZF + 3.8],
          [CP1, ZF + 3.8],
        ],
        FY + 12.9,
        0.9,
        { urns: true },
      );
      // loggia back wall: the arched main door between two blind arches (lower), three arched windows (upper),
      // pilaster responds behind every column, a coffered soffit under the balcony slab
      {
        const arch = (x, ySpring, ra, depth) => {
          const sh = new THREE.Shape();
          sh.absarc(0, 0, ra + 0.26, 0, Math.PI, false);
          sh.lineTo(-ra, 0);
          sh.absarc(0, 0, ra, Math.PI, 0, true);
          sh.lineTo(ra + 0.26, 0);
          b.add(
            "marble",
            new THREE.ExtrudeGeometry(sh, {
              depth: depth || 0.18,
              bevelEnabled: false,
              curveSegments: 7,
            }),
            { m: LB.m4(x, ySpring, ZF), grime: 0.35 },
          );
          b.box("marble", x, ySpring + ra - 0.1, ZF + 0.12, 0.4, 0.52, 0.26, {
            seg: false,
            grime: 0.3,
          }); // keystone
        };
        b.add("glass_dark", new THREE.CircleGeometry(1.6, 12, 0, Math.PI), {
          m: LB.m4(CX, FY + 4.2, ZF + 0.02),
          uv: "box",
          noAO: true,
          grime: 0.1,
        });
        for (let k = -2; k <= 2; k++)
          b.box(
            "iron",
            CX + k * 0.4,
            FY + 4.2,
            ZF + 0.04,
            0.05,
            Math.sqrt(Math.max(0, 1.6 * 1.6 - k * 0.4 * (k * 0.4))),
            0.03,
            { seg: false, grime: 0 },
          );
        arch(CX, FY + 4.2, 1.6);
        for (const dx of [-5.2, 5.2]) {
          b.quad("planks", CX + dx, FY + 2.5, ZF + 0.02, 2.2, 3.4, {
            uv: "box",
            noAO: true,
          });
          b.add("glass_dark", new THREE.CircleGeometry(1.1, 10, 0, Math.PI), {
            m: LB.m4(CX + dx, FY + 4.2, ZF + 0.02),
            uv: "box",
            noAO: true,
            grime: 0.1,
          });
          for (const sd of [-1, 1])
            b.box(
              "marble",
              CX + dx + sd * 1.22,
              FY + 0.8,
              ZF + 0.08,
              0.24,
              3.4,
              0.16,
              { seg: false },
            );
          arch(CX + dx, FY + 4.2, 1.1);
        }
        for (const dx of [-5.2, 0, 5.2]) {
          const g2 = dx === 0 ? "glass_broken" : "glass_dark";
          b.quad(g2, CX + dx, FY + 8.6, ZF + 0.02, 1.9, 2.8, {
            uv: "box",
            noAO: true,
          });
          b.add(g2, new THREE.CircleGeometry(0.95, 10, 0, Math.PI), {
            m: LB.m4(CX + dx, FY + 10.0, ZF + 0.02),
            uv: "box",
            noAO: true,
            grime: 0.1,
          });
          arch(CX + dx, FY + 10.0, 0.95, 0.14);
          b.box("marble", CX + dx, FY + 7.0, ZF + 0.15, 2.6, 0.2, 0.3, {
            seg: false,
          });
        }
        for (let i = 0; i < 8; i++) {
          const x = CP0 + 0.8 + ((CP1 - CP0 - 1.6) * i) / 7;
          b.box("marble", x, FY, ZF + 0.12, 0.62, 5.8, 0.24, {
            seg: false,
            grime: 0.4,
          });
          b.box("marble", x, FY + 6.6, ZF + 0.1, 0.55, 5.4, 0.2, {
            seg: false,
            grime: 0.35,
          });
        }
        for (let i = 0; i < 7; i++)
          b.boxMM(
            "marble",
            CP0 + 1.0 + i * 2.05,
            FY + 5.62,
            ZF + 0.3,
            CP0 + 2.7 + i * 2.05,
            FY + 5.8,
            ZF + 3.7,
            { seg: false, grime: 0.6 },
          );
        // Mayoral Security loudhailers on the portico
        for (const sx of [-1, 1]) {
          b.box("iron", CX + sx * 7.2, FY + 5.0, ZF + 3.4, 0.1, 0.8, 0.1, {
            seg: false,
          });
          b.cyl(
            "paint_cream",
            CX + sx * 7.2,
            FY + 5.0,
            ZF + 3.75,
            0.32,
            0.08,
            0.7,
            8,
            { hSeg: 1, rx: Math.PI / 2, open: true },
          );
        }
      }
      // cupola (the 1812 design, the silhouette that reads across the park): square attic base with a balustrade,
      // clock stage with a pediment on every face, Corinthian peristyle round the drum, ribbed copper dome, lantern,
      // and Justice (weathered bronze, scales raised, sword lowered).
      const CY = FY + H1 + 0.6,
        CZ = 602;
      b.boxMM("marble", CX - 4.7, CY, CZ - 4.7, CX + 4.7, CY + 3.2, CZ + 4.7, {
        grime: 0.4,
      });
      for (const [sx, sz] of [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ])
        b.box("marble", CX + sx * 4.55, CY, CZ + sz * 4.55, 0.95, 3.2, 0.95, {
          seg: false,
          grime: 0.35,
        });
      b.boxMM(
        "marble",
        CX - 5.0,
        CY + 3.2,
        CZ - 5.0,
        CX + 5.0,
        CY + 3.55,
        CZ + 5.0,
        { seg: false, grime: 0.4 },
      );
      K.balustrade(
        b,
        "marble",
        [
          [CX - 4.75, CZ - 4.75],
          [CX + 4.75, CZ - 4.75],
          [CX + 4.75, CZ + 4.75],
          [CX - 4.75, CZ + 4.75],
          [CX - 4.75, CZ - 4.75],
        ],
        CY + 3.55,
        0.8,
        { urns: true },
      );
      const C2 = CY + 3.55; // clock stage
      b.boxMM("marble", CX - 3.5, C2, CZ - 3.5, CX + 3.5, C2 + 4.4, CZ + 3.5, {
        grime: 0.35,
      });
      for (const [sx, sz] of [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ])
        b.box("marble", CX + sx * 3.45, C2, CZ + sz * 3.45, 0.75, 4.4, 0.75, {
          seg: false,
          grime: 0.3,
        });
      b.boxMM(
        "marble",
        CX - 3.9,
        C2 + 4.4,
        CZ - 3.9,
        CX + 3.9,
        C2 + 4.75,
        CZ + 3.9,
        { seg: false, grime: 0.4 },
      );
      const clockK = LB.texMat(
        "cityhall_clock",
        LB.canvasTex("lb_clock", 256, 256, (ctx, w, h) => {
          ctx.fillStyle = "#d8d0b8";
          ctx.beginPath();
          ctx.arc(w / 2, h / 2, w / 2 - 4, 0, TAU);
          ctx.fill();
          ctx.strokeStyle = "#2a2418";
          ctx.lineWidth = 8;
          ctx.stroke();
          ctx.fillStyle = "#2a2418";
          ctx.font = "bold 26px Georgia";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const nums = [
            "XII",
            "I",
            "II",
            "III",
            "IIII",
            "V",
            "VI",
            "VII",
            "VIII",
            "IX",
            "X",
            "XI",
          ];
          nums.forEach((n, i) => {
            const a = (i / 12) * TAU - Math.PI / 2;
            ctx.fillText(n, w / 2 + Math.cos(a) * 96, h / 2 + Math.sin(a) * 96);
          });
          // hands frozen at 9:47 (the hour the bombs fell, give or take)
          ctx.lineWidth = 9;
          ctx.beginPath();
          ctx.moveTo(w / 2, h / 2);
          ctx.lineTo(
            w / 2 + Math.cos((9.78 / 12) * TAU - Math.PI / 2) * 60,
            h / 2 + Math.sin((9.78 / 12) * TAU - Math.PI / 2) * 60,
          );
          ctx.stroke();
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(w / 2, h / 2);
          ctx.lineTo(
            w / 2 + Math.cos((47 / 60) * TAU - Math.PI / 2) * 86,
            h / 2 + Math.sin((47 / 60) * TAU - Math.PI / 2) * 86,
          );
          ctx.stroke();
          ctx.fillStyle = "rgba(60,50,30,0.25)";
          ctx.fillRect(0, h * 0.55, w, h * 0.45);
        }),
        { transparent: true },
      );
      for (let f = 0; f < 4; f++) {
        const ry = (f * Math.PI) / 2,
          s = Math.sin(ry),
          c = Math.cos(ry);
        b.quad(clockK, CX + s * 3.53, C2 + 2.2, CZ + c * 3.53, 2.6, 2.6, {
          ry,
          grime: 0.1,
        });
        b.add("marble", new THREE.TorusGeometry(1.36, 0.12, 4, 20), {
          m: LB.m4(CX + s * 3.56, C2 + 2.2, CZ + c * 3.56, ry),
          grime: 0.3,
        });
        K.pediment(
          b,
          "marble",
          CX + s * 3.3,
          C2 + 5.25,
          CZ + c * 3.3,
          7.0,
          1.15,
          0.6,
          ry,
          {},
        );
      }
      const C3 = C2 + 4.75; // peristyle
      b.cyl("marble", CX, C3, CZ, 3.9, 4.0, 0.4, 24, { hSeg: 1 });
      b.cyl("marble", CX, C3 + 0.4, CZ, 2.6, 2.6, 3.9, 16, {
        hSeg: 1,
        grime: 0.5,
      });
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2 + Math.PI / 4;
        b.quad(
          "glass_dark",
          CX + Math.sin(a) * 2.62,
          C3 + 2.2,
          CZ + Math.cos(a) * 2.62,
          1.0,
          2.4,
          { ry: a, noAO: true },
        );
      }
      for (let i = 0; i < 12; i++) {
        const a = ((i + 0.5) / 12) * TAU;
        K.column(
          b,
          "marble",
          CX + Math.cos(a) * 3.4,
          C3 + 0.4,
          CZ + Math.sin(a) * 3.4,
          3.9,
          0.19,
          { collide: false },
        );
      }
      b.cyl("marble", CX, C3 + 4.3, CZ, 3.72, 3.62, 0.7, 24, {
        hSeg: 1,
        grime: 0.35,
      });
      b.cyl("marble", CX, C3 + 5.0, CZ, 3.95, 3.95, 0.25, 24, { hSeg: 1 });
      b.cyl("marble", CX, C3 + 5.25, CZ, 3.1, 3.3, 0.8, 24, {
        hSeg: 1,
        grime: 0.4,
      });
      const DY = C3 + 6.05,
        DR = 3.1; // ribbed copper dome
      b.sphere("copper_roof", CX, DY, CZ, DR, {
        phiLen: Math.PI / 2,
        ws: 24,
        hs: 8,
        sy: 0.95,
      });
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU;
        for (let k = 0; k < 4; k++) {
          const e0 = (((k / 4) * Math.PI) / 2) * 0.92,
            e1 = ((((k + 1) / 4) * Math.PI) / 2) * 0.92,
            R = DR + 0.04;
          b.beam(
            "copper_roof",
            V(
              CX + Math.cos(a) * R * Math.cos(e0),
              DY + R * 0.95 * Math.sin(e0),
              CZ + Math.sin(a) * R * Math.cos(e0),
            ),
            V(
              CX + Math.cos(a) * R * Math.cos(e1),
              DY + R * 0.95 * Math.sin(e1),
              CZ + Math.sin(a) * R * Math.cos(e1),
            ),
            0.16,
            0.12,
            { grime: 0.2 },
          );
        }
      }
      const LY = DY + DR * 0.95 - 0.25; // lantern
      b.cyl("marble", CX, LY, CZ, 1.05, 1.15, 0.3, 12, { hSeg: 1 });
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU;
        b.cyl(
          "marble",
          CX + Math.cos(a) * 0.82,
          LY + 0.3,
          CZ + Math.sin(a) * 0.82,
          0.09,
          0.1,
          1.3,
          6,
          { hSeg: 1 },
        );
      }
      b.cyl("glass_dark", CX, LY + 0.3, CZ, 0.66, 0.66, 1.3, 8, { hSeg: 1 });
      b.cyl("marble", CX, LY + 1.6, CZ, 1.08, 0.98, 0.25, 12, { hSeg: 1 });
      b.sphere("copper_roof", CX, LY + 1.85, CZ, 0.98, {
        phiLen: Math.PI / 2,
        ws: 12,
        hs: 4,
        sy: 0.9,
      });
      b.cyl("copper_roof", CX, LY + 2.6, CZ, 0.32, 0.5, 0.45, 8, { hSeg: 1 });
      // Justice (faces the park): robe, torso, head, scales raised in her left hand, sword lowered in her right
      const JY = LY + 3.05,
        jb = "bronze";
      b.lathe(
        jb,
        [
          [0.46, 0],
          [0.44, 0.25],
          [0.36, 0.9],
          [0.27, 1.4],
          [0.22, 1.58],
          [0.001, 1.6],
        ],
        10,
        CX,
        JY,
        CZ,
        { grime: 0.3 },
      );
      b.cyl(jb, CX, JY + 1.5, CZ, 0.2, 0.25, 0.62, 8, { hSeg: 1 });
      b.box(jb, CX, JY + 1.98, CZ, 0.62, 0.16, 0.26, { seg: false });
      b.cyl(jb, CX, JY + 2.1, CZ, 0.07, 0.08, 0.14, 6, { hSeg: 1 });
      b.sphere(jb, CX, JY + 2.34, CZ, 0.15, { ws: 8, hs: 6 });
      b.beam(
        jb,
        V(CX - 0.28, JY + 2.02, CZ),
        V(CX - 0.72, JY + 2.5, CZ + 0.08),
        0.09,
        0.09,
      );
      b.beam(
        jb,
        V(CX - 1.05, JY + 2.56, CZ + 0.08),
        V(CX - 0.4, JY + 2.56, CZ + 0.08),
        0.04,
        0.04,
      );
      for (const sx of [-1.02, -0.43]) {
        b.beam(
          jb,
          V(CX + sx, JY + 2.56, CZ + 0.08),
          V(CX + sx, JY + 2.2, CZ + 0.08),
          0.015,
          0.015,
        );
        b.cyl(jb, CX + sx, JY + 2.14, CZ + 0.08, 0.13, 0.05, 0.07, 8, {
          hSeg: 1,
        });
      }
      b.beam(
        jb,
        V(CX + 0.28, JY + 2.02, CZ),
        V(CX + 0.46, JY + 1.45, CZ + 0.12),
        0.09,
        0.09,
      );
      b.beam(
        jb,
        V(CX + 0.47, JY + 1.5, CZ + 0.14),
        V(CX + 0.52, JY + 0.55, CZ + 0.3),
        0.06,
        0.02,
      );
      b.beam(
        jb,
        V(CX + 0.36, JY + 1.46, CZ + 0.13),
        V(CX + 0.6, JY + 1.46, CZ + 0.13),
        0.04,
        0.04,
      ); // cross-guard
      LB.colMM(CX - 5, CY, CZ - 5, CX + 5, JY + 2.6, CZ + 5, {
        walkable: false,
      });
      // flagpoles in front of the steps (one tattered flag left; the other halyard slapping an empty pole)
      for (const [fx, hasFlag] of [
        [CX - 12, true],
        [CX + 12, false],
      ]) {
        const fz = ZF + 9;
        b.cyl("granite", fx, 0, fz, 0.55, 0.65, 0.6, 8, { hSeg: 1 });
        b.cyl("iron", fx, 0.6, fz, 0.07, 0.12, 12, 8, { hSeg: 2 });
        b.sphere("bronze", fx, 12.7, fz, 0.16, { ws: 8, hs: 6 });
        LB.col(fx, fz, 1.1, 1.1, 0, 12.6, 0, { walkable: false });
        if (hasFlag) {
          const fl = LB.makeFlag ? LB.makeFlag(LB.flagTex(1), 3.2, 1.8) : null;
          if (fl) {
            fl.position.set(fx, 12.4, fz);
            fl.rotation.y = 0;
            root.add(fl);
          }
        } else
          b.beam(
            "iron",
            V(fx + 0.1, 12.4, fz),
            V(fx + 0.3, 5.5, fz + 0.2),
            0.02,
            0.02,
          );
      }
      // ---- City Hall Park: paths, fountain, lawns, trees, lamps, benches
      b.boxMM("sidewalk", 51, 0, ZF + 2.4, 109, 0.06, site.z1 - 1, {
        grime: 0.5,
        noAO: true,
      });
      for (const [x0, z0, x1, z1] of [
        [52, 622, 72, 634],
        [88, 622, 108, 634],
        [52, 646, 72, 660],
        [88, 646, 108, 660],
      ])
        b.boxMM("grass", x0, 0.06, z0, x1, 0.12, z1, {
          grime: 0.4,
          noAO: true,
        });
      K.fountain(b, CX, 0.06, 640, 7.5, { key: "granite" });
      b.cyl("granite", CX, 0.06, 640, 1.0, 1.4, 2.0, 12, { hSeg: 1 });
      b.lathe(
        "granite",
        [
          [0.2, 0],
          [2.2, 0.3],
          [2.4, 0.55],
          [0.4, 0.6],
        ],
        16,
        CX,
        2.0,
        640,
        {},
      );
      b.cyl("goo", CX, 0.25, 640, 6.9, 6.9, 0.12, 24, { hSeg: 1 });
      LB.col(CX, 640, 2.8, 2.8, 0, 2.6, 0, { walkable: false });
      const r = LB.rng("cityhall_park");
      for (let i = 0; i < 10; i++) {
        const x = 53 + r() * 54,
          z = 622 + r() * 38;
        if (Math.abs(x - CX) < 11 && Math.abs(z - 640) < 11) continue;
        if (Math.abs(x - CX) < 4) continue;
        if (
          (x > 97 && z > 650) ||
          (Math.abs(Math.abs(x - CX) - 12) < 2.5 && z < 625)
        )
          continue; // billboard, flagpoles
        LB.deadTree(b, x, 0.1, z, 6 + r() * 4, i * 5 + 3);
      }
      for (const [x, z] of [
        [74, 626],
        [86, 626],
        [74, 654],
        [86, 654],
        [66, 640],
        [94, 640],
      ])
        LB.lampPost(b, x, 0.06, z, false);
      for (const [x, z, ry] of [
        [66, 628, 0],
        [94, 628, 0],
        [70, 652, Math.PI],
        [90, 652, Math.PI],
      ])
        LB.bench(b, x, 0.06, z, ry);
      // Patrolman robot charging pods flanking the portico (Mayoral Security)
      for (const x of [CP0 - 1.8, CP1 + 1.8]) {
        b.cyl("paint_cream", x, FY, ZF + 2.2, 0.9, 1.0, 0.3, 12, { hSeg: 1 });
        b.cyl("glass_dark", x, FY + 0.3, ZF + 2.2, 0.85, 0.85, 2.4, 12, {
          hSeg: 1,
          open: true,
          thetaStart: -Math.PI * 0.35,
          thetaLen: Math.PI * 1.3,
        });
        b.cyl("paint_cream", x, FY + 2.7, ZF + 2.2, 0.95, 0.9, 0.35, 12, {
          hSeg: 1,
        });
        b.sphere("lamp_red", x, FY + 3.15, ZF + 2.2, 0.15, {});
        LB.col(x, ZF + 2.2, 1.8, 1.8, FY, FY + 3, 0, {
          walkable: false,
          surface: "metal",
        });
      }
      const secK = LB.texMat(
        "cityhall_sec",
        LB.signTex(
          "cityhall_sec",
          ["MAYORAL SECURITY ZONE", "LOITERERS WILL BE PROTECTED"],
          "enamel",
          768,
          160,
          { bg: "#2d3b4a" },
        ),
      );
      b.quad(secK, CX, FY + 6.2, ZF + 4.04, 3.84, 0.8, { noAO: true }); // on the portico frieze, facing the park
      anchors.entrance = LB.anchor(CX, FY, ZF + 5, Math.PI);
      anchors.pod1 = LB.anchor(CP0 - 1.8, FY, ZF + 3.8, Math.PI);
      anchors.pod2 = LB.anchor(CP1 + 1.8, FY, ZF + 3.8, Math.PI); // the Patrolmen face the park
      LB.billboard(
        b,
        "burger_brigade",
        103.5,
        0.06,
        656.5,
        Math.PI * 0.25,
        10,
        4.6,
        4.5,
      ); // park SE corner, faces Centre St × Fulton (off the City Hall axis)
      anchors.fountain = V(CX, 0, 630);
      anchors.spawn3 = V(62, 0, 645);
      anchors.spawn4 = V(98, 0, 648);
      LB.interiorPart("city_hall", "finish", ix); // boss anchor in the rotunda, the Mayor's terminal at initDone
      const g = b.build(root);
      g.name = "city_hall";
      LB.register("city_hall", g, anchors);
      LB.plaque(
        V(CX - 3, 1.4, ZF + 3.8),
        "City Hall Plaque",
        '"Seat of municipal government since 1812. Office hours suspended the morning of the Bombing, 1967. Please take a number. Now serving: 000."',
      );
    },
    32,
  );

  // =====================================================================
  // NYSE — "The Exchange" raider fortress with a walk-in trading floor
  // =====================================================================
  LB.addBuilder(
    "nyse",
    function (LB, site, root) {
      const K = LB.kit,
        D = LB.dress;
      const b = LB.batch("nyse");
      b.ground = 0;
      b.aoH = 3;
      const anchors = {};
      // Round 1 refit: Broadway now runs along the EAST edge of the block (x≈32…48). The hall keeps its Wall Street
      // portico; the raider forecourt straddles the southern half of Wall Street (its north lane stays drivable) with its
      // side gate on the Broadway sidewalk, and the west half of the block (the old Broadway line) is the NYSE's 1922
      // annex, 11 Wall Street.
      const X0 = 2,
        X1 = 29,
        XC = (X0 + X1) / 2,
        ZF = 820,
        ZB = 843,
        H = 30;
      const PODIUM = 3.6;
      // ---- hall shell: walls with the north door gap, thin roof so the trading floor is tall
      K.room(
        b,
        "marble",
        X0,
        ZF,
        X1,
        ZB,
        0,
        H - 3,
        1.2,
        [{ side: "n", c: XC, w: 3.4, h: 3.0 }],
        { grime: 0.5 },
      );
      b.boxMM("marble", X0, H - 3, ZF, X1, H - 2.4, ZB, { grime: 0.4 });
      LB.colMM(X0, H - 4, ZF, X1, H - 2.4, ZB, { walkable: false });
      // facade podium with rusticated base (the door passage stays open)
      b.boxMM("marble", X0 - 1, 0, ZF - 3.8, XC - 1.7, PODIUM, ZF + 0.2, {
        grime: 0.6,
      });
      b.boxMM("marble", XC + 1.7, 0, ZF - 3.8, X1 + 1, PODIUM, ZF + 0.2, {
        grime: 0.6,
      });
      b.boxMM("marble", XC - 1.7, 3.0, ZF - 3.8, XC + 1.7, PODIUM, ZF + 0.2, {
        seg: false,
      });
      b.boxMM("granite_dark", XC - 1.7, 2.9, ZF - 3.8, XC + 1.7, 3.0, ZF, {
        seg: false,
      });
      for (let y = 0.9; y < PODIUM; y += 0.9) {
        b.boxMM(
          "granite_dark",
          X0 - 1.05,
          y,
          ZF - 3.86,
          XC - 1.7,
          y + 0.08,
          ZF - 3.78,
          { seg: false },
        );
        b.boxMM(
          "granite_dark",
          XC + 1.7,
          y,
          ZF - 3.86,
          X1 + 1.05,
          y + 0.08,
          ZF - 3.78,
          { seg: false },
        );
      }
      // six great Corinthian columns between the end piers, entablature, pediment with sculpture group, attic
      const colX = [-9, -5.4, -1.8, 1.8, 5.4, 9].map((d) => XC + d);
      for (const x of colX)
        K.column(b, "marble", x, PODIUM, ZF - 2.2, 16, 0.75, {
          collide: false,
        });
      for (const x of [X0 + 1.6, X1 - 1.6])
        b.boxMM(
          "marble",
          x - 2.1,
          PODIUM,
          ZF - 3,
          x + 2.1,
          PODIUM + 16,
          ZF + 0.2,
          { grime: 0.5 },
        );
      b.boxMM("marble", X0, PODIUM + 16, ZF - 3.4, X1, PODIUM + 18, ZF + 0.2, {
        grime: 0.4,
      });
      const nyseK = LB.texMat(
        "nyse_frieze",
        LB.signTex(
          "nyse_frieze",
          ["NEW YORK STOCK EXCHANGE"],
          "engraved",
          1024,
          64,
          { bg: "#cfc8b8", size: 44 },
        ),
      );
      b.quad(nyseK, XC, PODIUM + 16.9, ZF - 3.42, 22, 1.4, { ry: Math.PI });
      b.boxMM(
        "marble",
        X0 - 0.4,
        PODIUM + 18,
        ZF - 3.8,
        X1 + 0.4,
        PODIUM + 18.6,
        ZF + 0.2,
        { seg: false },
      );
      K.pediment(
        b,
        "marble",
        XC,
        PODIUM + 18.6,
        ZF - 1.8,
        X1 - X0 + 0.6,
        4.4,
        3,
        Math.PI,
        { relief: 9, reliefKey: "marble" },
      );
      b.boxMM("marble", X0, PODIUM + 18.6, ZF - 0.2, X1, H - 2.4, ZB, {
        grime: 0.4,
      });
      K.balustrade(
        b,
        "marble",
        [
          [X0, ZF - 0.1],
          [X1, ZF - 0.1],
          [X1, ZB],
          [X0, ZB],
          [X0, ZF - 0.1],
        ],
        H - 2.4,
        1.0,
        {},
      );
      // the famous glass curtain wall behind the columns
      for (let k = 0; k < 5; k++) {
        const x = XC - 7.2 + k * 3.6;
        b.quad("glass_dark", x, PODIUM + 8.2, ZF - 0.02, 3.0, 9.0, {
          ry: Math.PI,
          uv: "box",
          noAO: true,
        });
        for (let m = 1; m < 4; m++)
          b.box("iron", x, PODIUM + 3.7 + m * 2.25, ZF - 0.08, 3.0, 0.1, 0.1, {
            seg: false,
          });
        for (let m = -1; m <= 1; m++)
          b.box("iron", x + m, PODIUM + 3.7, ZF - 0.08, 0.1, 9, 0.1, {
            seg: false,
          });
      }
      K.polyWindows(
        b,
        [
          [X1, ZF],
          [X1, ZB],
          [X0, ZB],
          [X0, ZF],
        ],
        {
          y0: 5,
          floors: 4,
          floorH: 5.5,
          w: 1.6,
          h: 3.4,
          spacing: 3.6,
          inset: 0.05,
          broken: 0.5,
          seed: 41,
          frameKey: "marble",
          skipEdge: (i) => i !== 2,
        },
      );
      // ---- Broadway (east) and south elevations (round 1 revise): the giant order carried round the block — rusticated
      // base with channelled joints, marble pilasters with capitals rising to the front's entablature line, two tiers of
      // windows per bay (tall pedimented lower lights, square upper lights, darker spandrel panels), the entablature +
      // modillioned cornice returned from the Wall St front, and a BLIND-ARCADED attic. At the Broadway corner the first
      // two pilasters become engaged Corinthian columns — an echo of the famous screen, so the Exchange reads from both streets.
      const classicalFace = (p, q, seed, engaged) => {
        const r = LB.rng(seed),
          dx = q[0] - p[0],
          dz = q[1] - p[1],
          len = Math.hypot(dx, dz),
          ux = dx / len,
          uz = dz / len;
        let nx = uz,
          nz = -ux;
        if (
          ((p[0] + q[0]) / 2 - XC) * nx +
            ((p[1] + q[1]) / 2 - (ZF + ZB) / 2) * nz <
          0
        ) {
          nx = -nx;
          nz = -nz;
        }
        const ryB = Math.atan2(-uz, ux),
          ryF = Math.atan2(nx, nz);
        const at = (t, d) => [p[0] + ux * t + nx * d, p[1] + uz * t + nz * d];
        const bx = (key, t, d, y, w, h, dep, ex) => {
          const [x, z] = at(t, d);
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
        const qd = (key, t, d, y, w, h, ex) => {
          const [x, z] = at(t, d);
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
        const gk = () => {
          const v = r();
          return v < 0.35 ? "glass_broken" : v < 0.5 ? "planks" : "glass_dark";
        };
        const TOPO = PODIUM + 16,
          ATT = PODIUM + 18.6;
        bx("marble", len / 2, 0.2, 0, len + 0.4, PODIUM, 0.4, {
          seg: true,
          segLen: 3,
          grime: 0.75,
        }); // rusticated base
        for (let y = 0.9; y < PODIUM; y += 0.9)
          bx("granite_dark", len / 2, 0.405, y, len + 0.42, 0.08, 0.02, {
            grime: 0.2,
          });
        bx("marble", len / 2, 0.32, PODIUM, len + 0.6, 0.4, 0.64, {
          grime: 0.55,
        }); // water table
        const nb = Math.max(3, Math.round(len / 3.85)),
          bw = len / nb;
        for (let i = 0; i <= nb; i++) {
          const t = Math.min(len - 0.5, Math.max(0.5, i * bw));
          if (engaged && (i === 1 || i === 2)) {
            const [x, z] = at(t, 0.45);
            K.column(b, "marble", x, PODIUM + 0.4, z, 15.6, 0.66, {
              collide: false,
            });
            LB.col(x, z, 1.4, 1.4, 0, TOPO, 0, { walkable: false });
            continue;
          }
          bx("marble", t, 0.22, PODIUM + 0.4, 1.05, TOPO - PODIUM - 1.2, 0.44, {
            seg: true,
            segLen: 5,
            grime: 0.5,
          });
          bx("marble", t, 0.28, PODIUM + 0.4, 1.35, 0.5, 0.56, { grime: 0.5 }); // base
          bx("marble", t, 0.32, TOPO - 1.1, 1.45, 0.75, 0.64, { grime: 0.35 }); // capital block
          for (const sd of [-0.55, 0.55]) {
            const [x, z] = at(t + sd, 0.6);
            b.sphere("marble", x, TOPO - 0.72, z, 0.2, {
              ws: 6,
              hs: 4,
              grime: 0.3,
            });
          } // volutes
        }
        for (let i = 0; i < nb; i++) {
          const t = (i + 0.5) * bw,
            w1 = Math.min(2.0, bw - 1.6),
            h1 = 6.0,
            y1 = PODIUM + 1.3,
            h2 = 3.4,
            y2 = PODIUM + 10.6;
          const k1 = gk();
          qd(k1, t, 0.03, y1 + h1 / 2, w1, h1);
          bx("marble", t - w1 / 2 - 0.13, 0.1, y1, 0.26, h1, 0.22);
          bx("marble", t + w1 / 2 + 0.13, 0.1, y1, 0.26, h1, 0.22);
          bx("marble", t, 0.16, y1 - 0.24, w1 + 0.8, 0.24, 0.36); // sill
          {
            const ped = new THREE.Shape();
            ped.moveTo(-w1 / 2 - 0.45, 0);
            ped.lineTo(w1 / 2 + 0.45, 0);
            ped.lineTo(0, 0.75);
            ped.closePath();
            const [x, z] = at(t, 0.02);
            b.add(
              "marble",
              new THREE.ExtrudeGeometry(ped, {
                depth: 0.42,
                bevelEnabled: false,
              }),
              { m: LB.m4(x, y1 + h1 + 0.3, z, ryF), grime: 0.45 },
            );
          }
          bx("marble", t, 0.15, y1 + h1, w1 + 0.9, 0.3, 0.4);
          for (const d2 of [-w1 / 4, w1 / 4])
            qd("iron", t + d2, 0.05, y1 + h1 / 2, 0.05, h1, { grime: 0 });
          qd("iron", t, 0.05, y1 + h1 * 0.62, w1, 0.05, { grime: 0 });
          qd(
            "marble",
            t,
            0.025,
            (y1 + h1 + 1.1 + y2 - 0.2) / 2,
            w1 + 0.4,
            y2 - 0.2 - (y1 + h1 + 1.1),
            { c: 0x9c9688, grime: 0.6, uv: "box", noAO: false },
          ); // spandrel panel
          const k2 = gk();
          qd(k2, t, 0.03, y2 + h2 / 2, w1, h2);
          bx("marble", t, 0.14, y2 - 0.2, w1 + 0.5, 0.2, 0.3);
          bx("marble", t, 0.1, y2 + h2, w1 + 0.4, 0.22, 0.2);
          if (k1 === "glass_broken" && r() < 0.5)
            qd("concrete_dark", t, 0.015, y1 + h1 + 1.6, 1.6, 2.4, {
              grime: 0.8,
              noAO: false,
            }); // soot
        }
        // entablature returned from the front: architrave, frieze, modillioned cornice
        bx("marble", len / 2, 0.3, TOPO, len + 0.4, 0.8, 0.6, { grime: 0.4 });
        bx("marble", len / 2, 0.2, TOPO + 0.8, len + 0.3, 1.2, 0.4, {
          grime: 0.35,
        });
        bx("marble", len / 2, 0.55, TOPO + 2.0, len + 1.2, 0.6, 1.1, {
          grime: 0.4,
        });
        for (let t = 0.5; t < len; t += 0.9)
          bx("marble", t, 0.85, TOPO + 1.78, 0.22, 0.22, 0.6, { grime: 0.3 });
        // blind-arcaded attic: per bay a recessed dark panel under a round arch on imposts
        for (let i = 0; i < nb; i++) {
          const t = (i + 0.5) * bw,
            aw = bw - 1.3,
            ah = H - 2.4 - ATT - 1.2,
            rA = aw / 2;
          qd("marble", t, 0.02, ATT + 0.35 + (ah - rA) / 2, aw, ah - rA, {
            c: 0x8a857a,
            grime: 0.7,
            noAO: false,
          });
          {
            const [x, z] = at(t, 0.02);
            b.add("marble", new THREE.CircleGeometry(rA, 10, 0, Math.PI), {
              m: LB.m4(x, ATT + 0.35 + ah - rA, z, ryF),
              uv: "box",
              c: 0x8a857a,
              grime: 0.7,
            });
            const [xa, za] = at(t, 0.1);
            b.add(
              "marble",
              new THREE.RingGeometry(rA, rA + 0.3, 12, 1, 0, Math.PI),
              { m: LB.m4(xa, ATT + 0.35 + ah - rA, za, ryF), grime: 0.4 },
            );
          }
          bx("marble", t - aw / 2 - 0.15, 0.08, ATT + 0.35, 0.3, ah - rA, 0.18);
          bx("marble", t + aw / 2 + 0.15, 0.08, ATT + 0.35, 0.3, ah - rA, 0.18);
        }
        return { at, ryF, nx, nz, len };
      };
      const eastF = classicalFace([X1, ZF], [X1, ZB], "nyse_bway", true);
      classicalFace([X1, ZB], [X0, ZB], "nyse_south", false);
      const excK = LB.texMat(
        "nyse_exchange",
        LB.signTex(
          "nyse_exchange2",
          ["THE EXCHANGE", "EVERYTHING FOR SALE — INCLUDING YOU"],
          "raider",
          1024,
          256,
          { bg: "#7a7466", fg: "#f2d64a" },
        ),
        { emissive: 0.18 },
      );
      // Broadway dressing: a grimy iron flag bracket with a tattered flag, and the raiders' spray banner draped down the order
      {
        const [bx0, bz0] = eastF.at(14.0, 0.3),
          [bx1, bz1] = eastF.at(14.0, 3.4);
        b.rod(
          "iron",
          V(bx0, PODIUM + 12.6, bz0),
          V(bx1, PODIUM + 14.2, bz1),
          0.07,
          6,
          { grime: 0.6 },
        );
        b.rod(
          "iron",
          V(bx0, PODIUM + 11.2, bz0),
          V((bx0 + bx1) / 2, PODIUM + 13.4, (bz0 + bz1) / 2),
          0.04,
          4,
          { grime: 0.6 },
        );
        b.box("rust", bx0, PODIUM + 10.9, bz0, 0.5, 2.0, 0.5, { seg: false });
        const bf = LB.makeFlag ? LB.makeFlag(LB.flagTex(1), 2.9, 1.7) : null;
        if (bf) {
          bf.position.set(
            bx0 + (bx1 - bx0) * 0.12,
            PODIUM + 12.9,
            bz0 + (bz1 - bz0) * 0.12,
          );
          bf.rotation.y = Math.atan2(-(bz1 - bz0), bx1 - bx0);
          bf.rotation.z = 0.46;
          root.add(bf);
          LB.animate(bf.position, 180, (t) => bf.userData.wave(t));
        }
        const [gx, gz] = eastF.at(19.2, 0.62);
        b.quad(excK, gx, PODIUM + 9.5, gz, 3.4, 11.5, {
          ry: eastF.ryF,
          grime: 0.3,
          noAO: true,
          rz: Math.PI / 2,
        }); // spray banner (reuses the gate sign's texture — no extra draw call)
        b.box(
          "rust",
          gx - eastF.nx * 0.05,
          PODIUM + 15.3,
          gz - eastF.nz * 0.05,
          0.12,
          0.12,
          3.8,
          { ry: eastF.ryF + Math.PI / 2, seg: false },
        );
      }
      // ---- roof: parapet walk behind the balustrade, a glazed monitor skylight over the trading floor (smashed panes),
      // HVAC plant, ducts, a radio mast and a raider sniper nest
      {
        const RY = H - 2.4;
        const sx0 = XC - 6,
          sx1 = XC + 6,
          sz0 = ZF + 5,
          sz1 = ZB - 4;
        b.boxMM(
          "marble",
          sx0 - 0.5,
          RY,
          sz0 - 0.5,
          sx1 + 0.5,
          RY + 1.1,
          sz1 + 0.5,
          { grime: 0.6 },
        ); // skylight curb
        if (LB.glassHip)
          LB.glassHip(b, sx0, sx1, sz0, sz1, RY + 1.1, 2.4, {
            pane: 1.8,
            key: "glass_dark",
            missing: 0.18,
            seed: 5,
          }); // glass_dark: no extra material in this batch
        else
          b.boxMM("glass_dark", sx0, RY + 1.1, sz0, sx1, RY + 2.6, sz1, {
            seg: false,
          });
        const hv = LB.rng("nyse_roof");
        for (const [x, z, w, d, h] of [
          [X0 + 3, ZB - 3.5, 3.2, 2.4, 2.2],
          [X0 + 3, ZF + 6, 2.6, 2.0, 1.8],
          [X1 - 3.2, ZB - 3.2, 3.6, 2.2, 2.6],
          [X1 - 2.8, ZF + 9, 2.2, 2.2, 1.6],
        ]) {
          b.box("corrugated", x, RY, z, w, h, d, { seg: false, grime: 0.75 });
          b.cyl(
            "iron",
            x,
            RY + h,
            z,
            Math.min(w, d) * 0.36,
            Math.min(w, d) * 0.36,
            0.3,
            10,
            { hSeg: 1 },
          ); // fan shroud
          for (let k = 0; k < 3; k++)
            b.box(
              "iron",
              x,
              RY + h + 0.3,
              z,
              Math.min(w, d) * 0.7,
              0.04,
              0.06,
              { ry: k * 1.05, seg: false },
            );
          LB.colMM(x - w / 2, RY, z - d / 2, x + w / 2, RY + h, z + d / 2, {
            walkable: true,
            surface: "metal",
          });
        }
        b.rod(
          "corrugated",
          V(X0 + 3, RY + 1.2, ZB - 2.2),
          V(X0 + 3, RY + 1.2, ZF + 7),
          0.35,
          8,
          { grime: 0.6 },
        ); // duct run
        b.rod(
          "corrugated",
          V(X1 - 3.2, RY + 1.3, ZB - 2.1),
          V(sx1 + 0.5, RY + 1.3, ZB - 2.1),
          0.3,
          8,
          { grime: 0.6 },
        );
        b.cyl("iron", X0 + 2, RY, ZF + 1.5, 0.06, 0.12, 9, 6, { hSeg: 2 }); // radio mast
        for (const k of [0, 1, 2])
          b.rod(
            "iron",
            V(X0 + 2, RY + 8.5, ZF + 1.5),
            V(
              X0 + 2 + Math.cos(k * 2.1) * 3,
              RY,
              ZF + 1.5 + Math.sin(k * 2.1) * 3,
            ),
            0.012,
            3,
          );
        LB.sandbags(b, X1 - 5.5, ZF + 0.8, X1 - 1, ZF + 0.8, 2, {
          y: RY,
          noCollide: true,
        });
        b.box("planks", X1 - 3, RY, ZF + 2.4, 0.9, 0.7, 0.9, {
          seg: false,
          ry: hv(),
        });
        anchors.roof = LB.anchor(X1 - 3.2, RY, ZF + 1.8, 0);
      }
      // giant weathered flag hung BEHIND the colonnade (from the entablature soffit, in front of the glass wall), so the
      // six Corinthian columns read crisply against it — the Exchange's signature look. GPU-waved (no per-frame CPU).
      const flagMesh = LB.makeFlag
        ? LB.makeFlag(LB.flagTex(2), 15.2, 10.6, {
            hang: true,
            amp: 0.22,
            freq: 0.6,
            speed: 0.9,
          })
        : null;
      if (flagMesh) {
        flagMesh.position.set(XC + 7.6, PODIUM + 15.9, ZF - 0.75);
        flagMesh.rotation.y = Math.PI; // printed face toward Broad/Wall Street (north)
        root.add(flagMesh);
        b.box("iron", XC, PODIUM + 15.85, ZF - 0.75, 15.8, 0.14, 0.14, {
          seg: false,
        }); // hanging bar
      }
      // facade colliders with the door passage
      LB.colMM(X0 - 1, 0, ZF - 3.8, XC - 1.7, H + 1.5, ZF - 0.6, {
        walkable: false,
      });
      LB.colMM(XC + 1.7, 0, ZF - 3.8, X1 + 1, H + 1.5, ZF - 0.6, {
        walkable: false,
      });
      LB.colMM(XC - 1.7, 3.0, ZF - 3.8, XC + 1.7, H + 1.5, ZF - 0.6, {
        walkable: false,
      });

      // =================================================================
      // THE TRADING FLOOR (walk-in, lit batch, the Boss's throne, bell podium): 30_downtown_interior.js
      // =================================================================
      const ix = { root, anchors, X0, X1, XC, ZF, ZB, H };
      LB.interiorPart("nyse", "floor", ix);

      // =================================================================
      // THE FORECOURT FORT (scrap walls, bus gate, watchtowers) — inside x 1…30, z 809…816
      // =================================================================
      const FZ = 809.3,
        WX0 = 1.2,
        WX1 = 30; // front wall on the Wall St south sidewalk (the roadway stays clear)
      LB.scrapWall(b, WX0, FZ, 10, FZ, 4.2, { seed: 51 });
      LB.scrapWall(b, 21, FZ, WX1, FZ, 4.2, { seed: 52 });
      LB.scrapWall(b, WX1, FZ, WX1, 810.5, 4.2, { seed: 54 }); // east wall onto Broadway with an open side gate…
      LB.scrapWall(b, WX1, 815, WX1, ZF - 3.8, 4.2, { seed: 57 }); // …between z 810.5 and 815
      LB.scrapWall(b, WX0, FZ, WX0, ZF - 3.8, 4.2, { seed: 53 }); // west wall against the annex
      // gate: a school bus body pushed half across the main opening (passable gap at x 16.5…21)
      b.box("paint_orange", 13.2, 0.4, FZ + 1.4, 6.5, 3.0, 2.5, {
        seg: false,
        grime: 0.7,
      });
      for (let k = 0; k < 4; k++)
        b.quad("glass_broken", 10.9 + k * 1.3, 2.4, FZ + 0.12, 0.9, 0.8, {
          ry: Math.PI,
        });
      for (const x of [10.6, 15.8]) {
        const w = new THREE.CylinderGeometry(0.55, 0.55, 0.4, 10);
        w.rotateZ(Math.PI / 2);
        b.add("tire", w, { m: LB.m4(x, 0.55, FZ + 0.2, Math.PI / 2) });
      }
      LB.col(13.2, FZ + 1.4, 6.5, 2.5, 0, 3.4, 0, { surface: "metal" });
      b.box("rust", 15.5, 5.4, FZ, 12, 2.6, 0.2, { seg: false, grime: 0.6 });
      b.quad(excK, 15.5, 6.7, FZ - 0.12, 11.6, 2.4, { ry: Math.PI });
      for (const x of [9.6, 21.4])
        b.box("rust", x, 0, FZ, 0.3, 8.2, 0.3, { seg: false });
      const sideK = LB.texMat(
        "nyse_side",
        LB.signTex("nyse_side2", ["EXCHANGE", "OPEN ▸"], "raider", 512, 192, {
          bg: "#7a7466",
          fg: "#f2d64a",
        }),
        { emissive: 0.15 },
      );
      b.quad(sideK, WX1 + 0.12, 3.2, 812.75, 2.6, 1.0, { ry: Math.PI / 2 });
      for (const z of [810.3, 815.2]) {
        b.box("rust", WX1, 0, z, 0.3, 5.2, 0.3, { seg: false });
        b.sphere("lamp", WX1 + 0.2, 5.0, z, 0.16, { noAO: true, grime: 0 });
        LB.glows.push({
          pos: V(WX1 + 0.4, 5.0, z),
          color: 0xffc070,
          size: 2.2,
        });
      }
      for (const [x, z] of [
        [4.4, FZ + 3.2],
        [26.8, FZ + 3.2],
      ]) {
        for (const [dx, dz] of [
          [-1.4, -1.4],
          [1.4, -1.4],
          [-1.4, 1.4],
          [1.4, 1.4],
        ])
          b.box("rust", x + dx, 0, z + dz, 0.2, 7.5, 0.2, { seg: false });
        for (let y = 1.5; y < 7; y += 2) {
          b.beam(
            "rust",
            V(x - 1.4, y, z - 1.4),
            V(x + 1.4, y + 1.5, z - 1.4),
            0.08,
          );
          b.beam(
            "rust",
            V(x - 1.4, y, z + 1.4),
            V(x + 1.4, y + 1.5, z + 1.4),
            0.08,
          );
        }
        b.boxMM("planks", x - 1.8, 7.5, z - 1.8, x + 1.8, 7.7, z + 1.8, {
          seg: false,
        });
        LB.sandbags(b, x - 1.8, z - 1.8, x + 1.8, z - 1.8, 2, {
          y: 7.7,
          noCollide: true,
        });
        b.box("corrugated", x, 9.6, z, 4.0, 0.12, 4.0, {
          seg: false,
          rx: 0.08,
        });
        for (const [dx, dz] of [
          [-1.7, -1.7],
          [1.7, -1.7],
          [-1.7, 1.7],
          [1.7, 1.7],
        ])
          b.box("rust", x + dx, 7.7, z + dz, 0.1, 1.9, 0.1, { seg: false });
        LB.colMM(x - 1.8, 0, z - 1.8, x + 1.8, 7.7, z + 1.8, {
          walkable: true,
          surface: "wood",
        });
        anchors["tower_" + (x < XC ? "w" : "e")] = LB.anchor(x, 7.7, z, 0);
      }
      anchors.turret1 = LB.anchor(4.4, 7.7, FZ + 2.4, 0);
      anchors.turret2 = LB.anchor(26.8, 7.7, FZ + 2.4, 0); // facing Wall Street (north)
      // gate lighting: burning barrels either side of the bus, a string of bulbs under the sign, lanterns on the posts
      LB.barrel(b, 8.4, 0, FZ + 1.0, { fire: true });
      LB.barrel(b, 22.6, 0, FZ + 1.0, { fire: true });
      for (const x of [9.6, 21.4]) {
        b.sphere("lamp", x, 8.35, FZ - 0.1, 0.22, { noAO: true, grime: 0 });
        LB.glows.push({
          pos: V(x, 8.35, FZ - 0.35),
          color: 0xffc070,
          size: 3.2,
        });
      }
      for (let i = 0; i <= 8; i++) {
        const x = 10 + i * 1.4,
          y = 8.0 - Math.sin((i / 8) * Math.PI) * 0.7;
        b.sphere(i % 3 === 1 ? "lamp_red" : "lamp", x, y, FZ - 0.3, 0.09, {
          ws: 6,
          hs: 4,
          noAO: true,
          grime: 0,
        });
        if (i % 2 === 0)
          LB.glows.push({
            pos: V(x, y, FZ - 0.4),
            color: i % 3 === 1 ? 0xff5040 : 0xffd090,
            size: 1.1,
          });
      }
      // skull-on-spike 'price tags' along the top of the front wall
      for (const x of [3, 6.5, 24.5, 28]) {
        b.box("rust", x, 4.2, FZ, 0.07, 1.3, 0.07, { seg: false });
        b.sphere("bone", x, 5.55, FZ, 0.15, { sx: 1, sy: 1.1, sz: 1.2 });
      }
      // forecourt clutter (kept to the sides so the gate → door path stays clear)
      LB.barrel(b, 8.6, 0, 813.2, { fire: true });
      b.box("iron", 5.5, 0, 815.2, 4, 2.4, 0.15, { seg: false });
      for (let i = 0; i < 5; i++)
        b.box("iron", 4.0 + i * 0.75, 1.6, 815.3, 0.03, 0.8, 0.03, {
          seg: false,
        });
      LB.car(b, 22.4, 0, 812.9, 1.45, { seed: 7, flipped: true });
      // radioactive barrel dump by the Broadway side gate (Geiger crackle)
      for (let i = 0; i < 4; i++) {
        b.cyl(
          "paint_orange",
          26.6 + (i % 2) * 0.7,
          0,
          814.6 + Math.floor(i / 2) * 0.7,
          0.3,
          0.3,
          0.9,
          10,
          { hSeg: 1 },
        );
      }
      b.cyl("goo", 26.95, 0.02, 814.95, 1.3, 1.3, 0.03, 12, { hSeg: 1 });
      try {
        G.world.addRadSource({
          x: 26.95,
          y: 0.5,
          z: 814.95,
          radius: 4.5,
          strength: 2.2,
        });
      } catch (e) {
        /* core */
      }
      buildAnnex();
      anchors.gate = LB.anchor(18.8, 0, FZ - 2, 0);
      anchors.side_gate = LB.anchor(WX1 + 2, 0, 812.75, Math.PI / 2);
      anchors.entrance = LB.anchor(XC, 0, ZF - 5, 0);
      anchors.footlocker = LB.anchor(7.6, 0, 813.9, 0);
      // ---- 11 Wall Street (1922 annex): the west half of the block, a plain limestone slab with a rusticated base,
      //      boarded arcade, a blown-open corner and a raider billboard on its roof ----
      function buildAnnex() {
        const AX0 = site.x0 + 1,
          AX1 = -0.6,
          AZ0 = site.z0 + 1.2,
          AZ1 = site.z1 - 0.6,
          AH = 44,
          SB = 38;
        const ap = [
          [AX0, AZ0],
          [AX1, AZ0],
          [AX1, AZ1],
          [AX0, AZ1],
        ];
        K.prism(b, "granite_dark", K.offsetPoly(ap, 0.1), 0, 1.2, {
          grime: 0.7,
        });
        K.prismBands(b, "limestone", ap, 1.2, 9, 3, { grime: 0.7 });
        for (let y = 2.4; y < 9; y += 1.2)
          K.prism(b, "limestone", K.offsetPoly(ap, 0.06), y, y + 0.1, {
            grime: 0.5,
            noAO: true,
          }); // rustication
        K.prism(b, "limestone", K.offsetPoly(ap, 0.4), 8.8, 9.6, {
          grime: 0.5,
        });
        K.prismBands(b, "limestone", ap, 9.6, SB, 7, { grime: 0.5 });
        K.polyWindows(b, ap, {
          y0: 11,
          floors: 9,
          floorH: 3.0,
          w: 1.1,
          h: 1.9,
          spacing: 2.4,
          inset: 0.04,
          broken: 0.35,
          boarded: 0.08,
          lit: 0.01,
          seed: 71,
          frameKey: "limestone",
          margin: 1.4,
        });
        K.prism(b, "limestone", K.offsetPoly(ap, 0.55), SB, SB + 0.9, {
          grime: 0.4,
        });
        const tp = K.offsetPoly(ap, -2.2);
        K.prism(b, "limestone", tp, SB + 0.9, AH, { grime: 0.45 });
        K.polyWindows(b, tp, {
          y0: SB + 2,
          floors: 1,
          floorH: 3,
          w: 1.1,
          h: 2.2,
          spacing: 2.4,
          inset: 0.04,
          broken: 0.5,
          seed: 72,
          frameKey: "limestone",
          margin: 1.4,
        });
        K.prism(b, "limestone", K.offsetPoly(tp, 0.35), AH, AH + 0.7, {});
        // ground-floor arcade: tall arched openings, boarded or black
        {
          const r = LB.rng("annex_gf");
          for (const [p, q, ry] of [
            [[AX0, AZ0], [AX1, AZ0], Math.PI],
            [[AX0, AZ1], [AX1, AZ1], 0],
            [[AX0, AZ0], [AX0, AZ1], -Math.PI / 2],
          ]) {
            const len = Math.hypot(q[0] - p[0], q[1] - p[1]),
              ux = (q[0] - p[0]) / len,
              uz = (q[1] - p[1]) / len,
              nx = Math.sin(ry),
              nz = Math.cos(ry);
            for (let t = 3; t < len - 2; t += 4.2) {
              const x = p[0] + ux * t + nx * 0.12,
                z = p[1] + uz * t + nz * 0.12;
              b.quad(
                r() < 0.5 ? "planks" : "glass_broken",
                x,
                3.4,
                z,
                2.6,
                4.4,
                { ry, uv: "box", grime: 0.2, noAO: true },
              );
              b.add(
                "limestone",
                new THREE.RingGeometry(1.3, 1.75, 10, 1, 0, Math.PI),
                { m: LB.m4(x + nx * 0.02, 5.6, z + nz * 0.02, ry), grime: 0.4 },
              );
            }
          }
        }
        const n11 = LB.texMat(
          "nyse_11wall",
          LB.signTex(
            "nyse_11wall",
            ["ELEVEN WALL STREET"],
            "engraved",
            1024,
            96,
            { bg: "#cfc8b8", size: 56 },
          ),
        );
        b.quad(n11, (AX0 + AX1) / 2, 7.8, AZ0 - 0.14, 12, 0.8, { ry: Math.PI });
        LB.colMM(AX0, 0, AZ0, AX1, AH + 0.7, AZ1, { walkable: false });
        // the blown-open north-east corner: a ragged black cavity with slabs hanging out, rubble fan on the forecourt side
        const hx = AX1 - 3.2,
          hz = AZ0 + 0.02;
        b.quad("glass_broken", hx, 22, hz - 0.05, 7.0, 9.5, {
          ry: Math.PI,
          uv: "box",
          noAO: true,
          grime: 0.6,
        });
        for (let k = 0; k < 3; k++)
          b.box(
            "concrete_dark",
            hx - 1.6 + k * 1.4,
            18.5 + k * 3.1,
            hz - 0.9,
            3.4,
            0.35,
            2.2,
            { rx: 0.25 - k * 0.12, rz: (k - 1) * 0.15, seg: false, grime: 0.8 },
          );
        for (let k = 0; k < 6; k++)
          b.beam(
            "rust",
            V(hx - 3 + k * 1.1, 17.6 + (k % 3) * 2.8, hz),
            V(hx - 3.4 + k * 1.2, 16.4 + (k % 3) * 2.6, hz - 1.4 - (k % 2)),
            0.05,
            0.05,
          );
        D.rubble(b, hx, 0, hz - 3, 2.2, 10, 73);
        LB.billboard(
          b,
          "super_sergeant",
          (AX0 + AX1) / 2,
          AH + 0.7,
          AZ0 + 6,
          Math.PI,
          12,
          5.2,
          3.4,
        );
        // rooftop water tower
        const wx = AX0 + 6,
          wz = AZ1 - 6,
          ry = AH + 0.7;
        for (const [dx, dz] of [
          [-1.4, -1.4],
          [1.4, -1.4],
          [-1.4, 1.4],
          [1.4, 1.4],
        ])
          b.box("iron", wx + dx, ry, wz + dz, 0.2, 3.6, 0.2, { seg: false });
        b.box("iron", wx, ry + 2.6, wz, 3.2, 0.15, 3.2, { seg: false });
        b.cyl("rotten", wx, ry + 3.6, wz, 1.9, 2.0, 4.0, 14, {
          hSeg: 3,
          grime: 0.5,
        });
        b.cyl("rust", wx, ry + 7.6, wz, 0.05, 2.1, 1.4, 14, { hSeg: 1 });
      }
      const g = b.build(root);
      g.name = "nyse";
      ix.g = g;
      LB.interiorPart("nyse", "attach", ix); // the lit trading-floor batch under the landmark + its ticker animation
      LB.register("nyse", g, anchors, ["wall_street"]);
      LB.plaque(
        V(XC - 3.2, 1.4, ZF - 4),
        "Exchange Plaque",
        '"On this site in 1967 the market closed at an all-time high, followed shortly by an all-time low. Trading has since resumed in scrip, ammunition and people. Past performance is no guarantee of survival."',
      );
      LB.onReady.push(() => {
        LB.spawnProp("turret", {
          x: anchors.turret1.x,
          y: anchors.turret1.y,
          z: anchors.turret1.z,
          yaw: 0,
          faction: "raiders",
        });
        LB.spawnProp("turret", {
          x: anchors.turret2.x,
          y: anchors.turret2.y,
          z: anchors.turret2.z,
          yaw: 0,
          faction: "raiders",
        });
        LB.interiorPart("nyse", "props", ix); // the Boss's safe behind the throne
        LB.spawnProp("footlocker", {
          x: anchors.footlocker.x,
          y: 0,
          z: anchors.footlocker.z,
          yaw: 0,
          loot: "raider_stash",
          owner: "raiders",
        });
      });
    },
    33,
  );
})();
