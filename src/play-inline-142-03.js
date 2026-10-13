// play-inline-142 03 — grime
// Lines 275-449 of readable/play-inline-142.pretty.js (statement-aligned).
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
