// play-inline-257 03 — grime
// Lines 334-615 of readable/play-inline-257.pretty.js (statement-aligned).
  function colonnades(b) {
    const cx = 231,
      cz = M.zc,
      a = 30,
      bb = 13;
    const th0 = Math.asin(5 / a),
      th1 = Math.asin(0.8),
      n = 11;
    for (const sgn of [-1, 1]) {
      const pts = [];
      for (let i = 0; i <= n; i++) {
        const th = th0 + ((th1 - th0) * i) / n;
        pts.push([cx - a * Math.sin(th), cz + sgn * bb * Math.cos(th)]);
      }
      // two rows of Tuscan columns (outer row offset outward) + entablature + balustrade
      const out = (p, q, k) => {
        const dx = q[0] - p[0],
          dz = q[1] - p[1],
          l = Math.hypot(dx, dz);
        return [p[0] + (dz / l) * k * sgn * -1, p[1] - (dx / l) * k * sgn * -1];
      };
      for (let i = 0; i <= n; i++) {
        const p = pts[i],
          q =
            pts[Math.min(n, i + 1)] === p
              ? pts[i - 1]
              : pts[Math.min(n, i + 1)];
        const o = i < n ? out(p, q, 2.4) : out(pts[i - 1], p, 2.4);
        for (const c of [p, o])
          K.column(b, "arch_stone", c[0], 0, c[1], 7.4, 0.42, { flutes: 12 });
      }
      for (let i = 0; i < n; i++) {
        const p = pts[i],
          q = pts[i + 1];
        const o1 = out(p, q, 2.4),
          o2 = out(p, q, 2.4);
        void o2;
        const mx = (p[0] + q[0]) / 2,
          mz = (p[1] + q[1]) / 2,
          len = Math.hypot(q[0] - p[0], q[1] - p[1]) + 0.2,
          ry = Math.atan2(-(q[1] - p[1]), q[0] - p[0]);
        const ox = (o1[0] - p[0]) / 2,
          oz = (o1[1] - p[1]) / 2;
        b.box("arch_stone", mx + ox, 7.4, mz + oz, len, 1.1, 3.6, {
          ry,
          seg: false,
          grime: 0.45,
        }); // entablature (both rows)
        b.box("arch_stone", mx + ox, 8.5, mz + oz, len + 0.1, 0.35, 4.0, {
          ry,
          seg: false,
          grime: 0.4,
        }); // cornice
        b.box("concrete_dark", mx + ox, 7.3, mz + oz, len, 0.1, 3.0, {
          ry,
          seg: false,
          grime: 0.7,
        }); // coffered ceiling
      }
      K.balustrade(
        b,
        "arch_stone",
        pts.map((p, i) =>
          i < n ? out(p, pts[i + 1], 1.2) : out(pts[i - 1], p, 1.2),
        ),
        8.85,
        0.9,
        {},
      );
      // ruin: one broken column and fallen drums at the end of the south arm
      if (sgn > 0) {
        const e = pts[n];
        b.cyl(
          "arch_stone",
          e[0] - 2.4,
          -0.18,
          e[1] + 2.8,
          0.42,
          0.42,
          1.2,
          12,
          { rz: HP, hSeg: 1 },
        );
        b.cyl(
          "arch_stone",
          e[0] - 3.8,
          -0.28,
          e[1] + 1.6,
          0.42,
          0.42,
          1.4,
          12,
          { rz: HP, ry: 0.8, hSeg: 1 },
        );
      }
    }
    // forecourt paving (granite setts), a dry fountain basin and lamp posts
    b.boxMM("granite_block", 198, -0.05, 561, 226, 0.03, 585, {
      grime: 0.8,
      segLen: 6,
    });
    PF.lampPost(b, 212, 0, 563.5, true);
    PF.lampPost(b, 212, 0, 582.5, false);
  }

  // =================================================================
  // Anchorages (twin cable housings + saddle under the roadway)
  // =================================================================
  function anchorage(b, A, west, anchors) {
    const d = M.deck,
      R = M.road;
    for (const [za, zb] of [
      [559.5, R.z0],
      [R.z1, 586.5],
    ]) {
      // rusticated mass, arcaded faces, sloped cable-entry top
      b.boxMM("granite_block", A.x0, 0, za, A.x1, 24, zb, {
        grime: 0.6,
        segLen: 4,
      });
      for (let y = 0; y < 3.2; y += 0.8)
        b.boxMM(
          "pier_stone",
          A.x0 - 0.3,
          y,
          za - 0.3,
          A.x1 + 0.3,
          y + 0.74,
          zb + 0.3,
          { seg: false, grime: 0.6 },
        );
      const slopeUp = west ? 1 : -1;
      const wedge = new THREE.Shape();
      const L = A.x1 - A.x0;
      if (west) {
        wedge.moveTo(0, 0);
        wedge.lineTo(L, 0);
        wedge.lineTo(L, 1.5);
        wedge.lineTo(4, 10);
        wedge.lineTo(0, 10);
        wedge.closePath();
      } else {
        wedge.moveTo(0, 0);
        wedge.lineTo(L, 0);
        wedge.lineTo(L, 10);
        wedge.lineTo(L - 4, 10);
        wedge.lineTo(0, 1.5);
        wedge.closePath();
      }
      void slopeUp;
      const wg = new THREE.ExtrudeGeometry(wedge, {
        depth: zb - za,
        bevelEnabled: false,
      });
      b.add("granite_block", wg, { m: PF.m4(A.x0, 24, za), grime: 0.6 });
      PF.colMM(A.x0 - 0.3, 0, za - 0.3, A.x1 + 0.3, 34, zb + 0.3, {
        walkable: false,
      });
      // big blind arches on the outer face + string course
      const face = za < M.zc ? za - 0.05 : zb + 0.05;
      for (let i = 0; i < 3; i++) {
        const acx = A.x0 + ((i + 0.5) * L) / 3;
        const s = new THREE.Shape();
        const w = L / 3 - 3.2;
        s.moveTo(-w / 2, 0);
        s.lineTo(w / 2, 0);
        s.lineTo(w / 2, 11);
        s.absarc(0, 11, w / 2, 0, PI, false);
        s.lineTo(-w / 2, 0);
        b.add("concrete_dark", PF.shapeGeo(s, 12), {
          m: PF.m4(
            acx,
            3.2,
            face + (za < M.zc ? -0.02 : 0.02),
            za < M.zc ? PI : 0,
          ),
          uv: "box",
          grime: 0.8,
        });
        for (let k = 0; k <= 10; k++) {
          const an = (k / 10) * PI;
          b.box(
            "arch_stone",
            acx + Math.cos(an) * (w / 2 + 0.5),
            3.2 + 11 + Math.sin(an) * (w / 2 + 0.5) - 0.5,
            face,
            0.8,
            1.0,
            0.5,
            { rz: an - HP, seg: false, grime: 0.5 },
          );
        }
      }
      b.boxMM(
        "arch_stone",
        A.x0 - 0.4,
        22.6,
        face - 0.4,
        A.x1 + 0.4,
        23.4,
        face + 0.4,
        { seg: false, grime: 0.5 },
      );
    }
    // saddle block under the roadway (east part of the Manhattan anchorage / west part of Brooklyn's)
    const sx0 = west ? A.saddle0 : A.x0,
      sx1 = west ? A.x1 : A.saddle1;
    b.boxMM("granite_block", sx0, 0, R.z0, sx1, d - 0.6, R.z1, { grime: 0.6 });
    PF.colMM(sx0, 0, R.z0, sx1, d - 0.6, R.z1, {});
    if (west) {
      // service door (south housing, street level) → the anchorage vaults
      const dx = 276,
        dz = 586.85;
      b.boxMM("rust", dx - 1.2, 0, dz, dx + 1.2, 2.8, dz + 0.2, {
        seg: false,
        grime: 0.8,
      });
      b.boxMM("iron", dx - 1.45, 2.8, dz, dx + 1.45, 3.1, dz + 0.3, {
        seg: false,
      });
      const sk = PF.texMat(
        "mb_door",
        PF.signTex(
          "mb_door",
          ["DEPT. OF PLANT & STRUCTURES", "ANCHORAGE — NO ADMITTANCE"],
          "enamel",
          512,
          160,
          { bg: "#2a3a52" },
        ),
        { rough: 0.8 },
      );
      b.quad(sk, dx, 3.6, dz + 0.02, 2.6, 0.8, { grime: 0.4 });
      const gr = PF.texMat(
        "mb_graf",
        PF.graffitiTex(
          "mb_graf",
          ["HUMIES KEEP OUT", "OR COME IN. WE HUNGRY"],
          512,
          256,
          { color: "#9aff40", tag: "skull" },
        ),
        { transparent: true, rough: 1 },
      );
      b.quad(gr, dx + 7, 5.2, dz + 0.03, 7, 3.5, { grime: 0.1 });
      anchors.anchorage_door = PF.anchor(dx, 0, dz + 1.8, PI);
      // deck-level hatch in the south housing's east face (reached from the vault stair inside)
      const hz = 583;
      b.boxMM("rust", A.x1 + 0.02, d, hz - 0.8, A.x1 + 0.2, d + 2.4, hz + 0.8, {
        seg: false,
        grime: 0.7,
      });
      b.boxMM(
        "mb_blue_dk",
        A.x1,
        d + 2.4,
        hz - 1.0,
        A.x1 + 0.35,
        d + 2.7,
        hz + 1.0,
        { seg: false },
      );
      const hs = PF.texMat(
        "mb_hatch",
        PF.signTex(
          "mb_hatch",
          ["ANCHORAGE", "SOUTH CABLE HOUSING"],
          "enamel",
          512,
          160,
          { bg: "#2a3a52" },
        ),
        { rough: 0.8 },
      );
      b.quad(hs, A.x1 + 0.25, d + 3.2, hz, 1.8, 0.56, { ry: HP });
      anchors.deck_hatch = PF.anchor(A.x1 + 1.8, d, hz, -HP);
    }
  }

  // =================================================================
  // Towers — blue steel legs, X-braced, arched crown, globe finials
  // =================================================================
