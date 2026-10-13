// play-inline-137 02 — grime
// Lines 13-340 of readable/play-inline-137.pretty.js (statement-aligned).
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
