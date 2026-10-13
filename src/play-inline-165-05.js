// play-inline-165 05 — math
// Lines 689-1223 of readable/play-inline-165.pretty.js (statement-aligned).
  const EMIT = {
    pile(E, p) {
      const r = E.rnd,
        R = 0.45 + r() * 0.85,
        n = 7 + ((r() * 8 + R * 10) | 0);
      const ox = p.x + Math.sin(p.wa) * Math.max(0, p.wd - R * 0.8),
        oz = p.z + Math.cos(p.wa) * Math.max(0, p.wd - R * 0.8);
      for (let i = 0; i < n; i++) {
        const a = r() * TAU,
          d = Math.sqrt(r()) * R,
          s = 0.12 + r() * 0.34 * (1 - (d / R) * 0.5);
        E.put(
          ROCK_ROLES[(r() * 4) | 0],
          rockGeo((r() * 5) | 0),
          M(
            ox + Math.cos(a) * d,
            p.y + s * 0.18 + (1 - d / R) * R * 0.3,
            oz + Math.sin(a) * d,
            r() * 3,
            r() * 6,
            r() * 3,
            s,
            s * (0.5 + r() * 0.4),
            s,
          ),
        );
      }
      if (r() < 0.5) EMIT.slab(E, { x: ox, y: p.y, z: oz, wa: p.wa, wd: 0 });
      E.decal(
        "drift",
        ox - Math.sin(p.wa) * 0.2,
        p.y,
        oz - Math.cos(p.wa) * 0.2,
        p.wa,
        R * 2.8,
        R * 2.2,
        0.8,
      );
    },
    bricks(E, p) {
      const r = E.rnd,
        n = 4 + ((r() * 7) | 0);
      for (let i = 0; i < n; i++) {
        const a = r() * TAU,
          d = r() * 0.5;
        E.put(
          "brick",
          box(),
          M(
            p.x + Math.cos(a) * d,
            p.y + 0.035 + (i > 4 ? 0.07 : 0),
            p.z + Math.sin(a) * d,
            r() < 0.3 ? r() * 0.6 : 0,
            r() * 6,
            0,
            0.21,
            0.065,
            0.1,
          ),
        );
      }
    },
    slab(E, p) {
      const r = E.rnd,
        w = 0.5 + r() * 1.0,
        d = 0.4 + r() * 0.7,
        t = 0.05 + r() * 0.07,
        tilt = 0.12 + r() * 0.5;
      E.put(
        r() < 0.5 ? "plaster" : "concrete",
        box(),
        M(
          p.x,
          p.y + Math.sin(tilt) * d * 0.5 + t * 0.5,
          p.z,
          tilt,
          p.wa + (r() - 0.5) * 1.2,
          (r() - 0.5) * 0.2,
          w,
          t,
          d,
        ),
      );
    },
    plank(E, p) {
      const r = E.rnd,
        L = 0.8 + r() * 1.6,
        tilt = r() < 0.4 ? 0.15 + r() * 0.35 : 0.02;
      E.put(
        "wood",
        box(),
        M(
          p.x,
          p.y + 0.03 + Math.sin(tilt) * L * 0.5,
          p.z,
          0,
          r() * TAU,
          tilt,
          L,
          0.03,
          0.12 + r() * 0.08,
        ),
      );
      if (r() < 0.5)
        E.put(
          "wood",
          box(),
          M(
            p.x + (r() - 0.5) * 0.6,
            p.y + 0.045,
            p.z + (r() - 0.5) * 0.6,
            0,
            r() * TAU,
            0,
            0.6 + r() * 0.8,
            0.03,
            0.1,
          ),
        );
    },
    papers(E, p) {
      const r = E.rnd,
        n = 3 + ((r() * 8) | 0);
      for (let i = 0; i < n; i++) {
        const a = r() * TAU,
          d = r() * 0.8;
        E.put(
          "paper",
          plane(),
          M(
            p.x + Math.cos(a) * d,
            p.y + 0.006 + i * 0.002,
            p.z + Math.sin(a) * d,
            (r() - 0.5) * 0.1,
            r() * TAU,
            (r() - 0.5) * 0.1,
            r() < 0.2 ? 0.42 : 0.22,
            1,
            r() < 0.2 ? 0.58 : 0.29,
          ),
        );
      }
      if (r() < 0.5)
        E.decal("scraps", p.x, p.y, p.z, r() * TAU, 1.2 + r() * 0.8);
    },
    binder(E, p) {
      const r = E.rnd;
      for (let i = 0; i < 1 + ((r() * 3) | 0); i++)
        E.put(
          "dark",
          box(),
          M(
            p.x + (r() - 0.5) * 0.5,
            p.y + 0.02 + i * 0.04,
            p.z + (r() - 0.5) * 0.5,
            0,
            r() * TAU,
            0,
            0.3,
            0.04,
            0.24,
          ),
        );
      EMIT.papers(E, p);
    },
    tiles(E, p) {
      const r = E.rnd,
        n = 2 + ((r() * 4) | 0);
      for (let i = 0; i < n; i++) {
        const tilt = r() < 0.4 ? 0.2 + r() * 0.4 : 0.03;
        E.put(
          "tile",
          box(),
          M(
            p.x + (r() - 0.5) * 1.4,
            p.y + 0.015 + i * 0.02 + Math.sin(tilt) * 0.3,
            p.z + (r() - 0.5) * 1.4,
            tilt,
            r() * TAU,
            (r() - 0.5) * 0.1,
            0.6 - r() * 0.2,
            0.02,
            0.6 - r() * 0.25,
          ),
        );
      }
    },
    can(E, p) {
      const r = E.rnd,
        n = 1 + ((r() * 4) | 0);
      for (let i = 0; i < n; i++) {
        const lying = r() < 0.7;
        E.put(
          "metal",
          cyl(),
          M(
            p.x + (r() - 0.5) * 0.7,
            p.y + (lying ? 0.034 : 0.06),
            p.z + (r() - 0.5) * 0.7,
            lying ? Math.PI / 2 : 0,
            r() * TAU,
            0,
            0.068,
            0.12,
            0.068,
          ),
        );
      }
    },
    bottle(E, p) {
      const r = E.rnd,
        n = 1 + ((r() * 3) | 0);
      for (let i = 0; i < n; i++) {
        const lying = r() < 0.6;
        E.put(
          "glass",
          bottle(),
          M(
            p.x + (r() - 0.5) * 0.6,
            p.y + (lying ? 0.035 : 0),
            p.z + (r() - 0.5) * 0.6,
            lying ? Math.PI / 2 : 0,
            r() * TAU,
            0,
            0.07,
            0.27,
            0.07,
          ),
        );
      }
    },
    rag(E, p) {
      const r = E.rnd;
      E.put(
        "fabric",
        rockGeo((r() * 5) | 0),
        M(
          p.x,
          p.y + 0.03,
          p.z,
          0,
          r() * TAU,
          0,
          0.5 + r() * 0.4,
          0.07,
          0.4 + r() * 0.3,
        ),
      );
    },
    field(E, p) {
      // a loose spray of debris in the open floor: chunks, a plank or two, papers, a stain under it
      const r = E.rnd,
        R = 1.2 + r() * 1.4,
        n = 6 + ((r() * 10) | 0);
      for (let i = 0; i < n; i++) {
        const a = r() * TAU,
          d = Math.sqrt(r()) * R,
          s = 0.06 + r() * 0.2;
        E.put(
          ROCK_ROLES[(r() * 4) | 0],
          rockGeo((r() * 5) | 0),
          M(
            p.x + Math.cos(a) * d,
            p.y + s * 0.2,
            p.z + Math.sin(a) * d,
            r() * 3,
            r() * 6,
            r() * 3,
            s,
            s * 0.6,
            s,
          ),
        );
      }
      if (r() < 0.6) EMIT.plank(E, p);
      if (r() < 0.6)
        EMIT.papers(E, {
          x: p.x + (r() - 0.5) * R,
          y: p.y,
          z: p.z + (r() - 0.5) * R,
        });
      E.decal(
        r() < 0.5 ? "stain" : "crack",
        p.x,
        p.y,
        p.z,
        r() * TAU,
        R * 2,
        R * 1.7,
        0.8,
      );
    },
    scrap(E, p) {
      // a sheet of corrugated scrap / sign panel, lying or propped against the wall
      const r = E.rnd,
        w = 0.9 + r() * 0.7,
        L = 1.4 + r() * 1.0;
      if (p.wd <= 0.9 && r() < 0.6) {
        const lean = 0.25 + r() * 0.25,
          bx = p.x + Math.sin(p.wa) * (p.wd - L * Math.sin(lean) * 0.5 - 0.05),
          bz = p.z + Math.cos(p.wa) * (p.wd - L * Math.sin(lean) * 0.5 - 0.05);
        E.put(
          "sheet",
          box(),
          M(
            bx,
            p.y + Math.cos(lean) * L * 0.5,
            bz,
            -lean,
            p.wa,
            0,
            w,
            L,
            0.025,
          ),
        );
      } else
        E.put(
          "sheet",
          box(),
          M(
            p.x,
            p.y + 0.03,
            p.z,
            (r() - 0.5) * 0.12,
            r() * TAU,
            (r() - 0.5) * 0.12,
            w,
            0.02,
            L,
          ),
        );
    },
    barrel(E, p) {
      const r = E.rnd,
        tip = r() < 0.35;
      E.put(
        "metal",
        cyl(),
        M(
          p.x,
          p.y + (tip ? 0.29 : 0.45),
          p.z,
          tip ? Math.PI / 2 : 0,
          r() * TAU,
          0,
          0.58,
          0.9,
          0.58,
        ),
      );
      if (!tip && r() < 0.4)
        E.put(
          "dark",
          cyl(),
          M(p.x, p.y + 0.905, p.z, 0, 0, 0, 0.54, 0.01, 0.54),
        );
    },
    mattress(E, p) {
      const r = E.rnd,
        yaw = p.wa + Math.PI / 2 + (r() - 0.5) * 0.3;
      E.put(
        "fabric",
        box(),
        M(p.x, p.y + 0.09, p.z, (r() - 0.5) * 0.04, yaw, 0, 1.9, 0.18, 0.9),
      );
      if (r() < 0.6)
        E.put(
          "fabric",
          rockGeo((r() * 5) | 0),
          M(
            p.x + (r() - 0.5) * 0.6,
            p.y + 0.22,
            p.z + (r() - 0.5) * 0.3,
            0,
            r() * TAU,
            0,
            0.9,
            0.12,
            0.6,
          ),
        );
      if (r() < 0.5)
        EMIT.can(E, {
          x: p.x + Math.sin(p.wa + Math.PI) * 0.8,
          y: p.y,
          z: p.z + Math.cos(p.wa + Math.PI) * 0.8,
        });
    },
    desk(E, p) {
      // office desk shoved over on its back / side, drawers spilled
      const r = E.rnd,
        yaw = p.wa + (r() - 0.5) * 0.6;
      const T = new THREE.Matrix4().compose(
        _p.set(p.x, p.y, p.z),
        _q.setFromEuler(_e.set(0, yaw, 0, "YXZ")),
        _s.set(1, 1, 1),
      );
      const put = (role, lx, ly, lz, sw, sh, sd) =>
        E.put(
          role,
          box(),
          T.clone().multiply(M(lx, ly, lz, 0, 0, 0, sw, sh, sd)),
        );
      put("wood", 0, 0.38, 0, 1.4, 0.76, 0.05);
      put("wood", -0.62, 0.38, 0.35, 0.05, 0.76, 0.7);
      put("wood", 0.62, 0.38, 0.35, 0.05, 0.76, 0.7);
      put("wood", 0.3, 0.02, -0.5, 0.4, 0.04, 0.5);
      EMIT.papers(E, {
        x: p.x + Math.sin(yaw + Math.PI) * 0.9,
        y: p.y,
        z: p.z + Math.cos(yaw + Math.PI) * 0.9,
      });
    },
    tire(E, p) {
      const r = E.rnd;
      const g =
        GEO.tire || (GEO.tire = new THREE.TorusGeometry(0.3, 0.1, 6, 12));
      E.put(
        "dark",
        g,
        M(
          p.x,
          p.y + 0.1,
          p.z,
          Math.PI / 2 + (r() - 0.5) * 0.2,
          r() * TAU,
          0,
          1,
        ),
      );
    },
    crate(E, p) {
      const r = E.rnd,
        s = 0.4 + r() * 0.25;
      E.put(
        "wood",
        box(),
        M(p.x, p.y + s / 2, p.z, 0, p.wa + (r() - 0.5) * 0.4, 0, s, s, s),
      );
      if (r() < 0.4)
        E.put(
          "wood",
          box(),
          M(
            p.x + (r() - 0.5) * 0.1,
            p.y + s + s * 0.4,
            p.z,
            0,
            r() * TAU,
            0,
            s * 0.8,
            s * 0.8,
            s * 0.8,
          ),
        );
    },
    casings(E, p) {
      const r = E.rnd,
        n = 6 + ((r() * 14) | 0);
      for (let i = 0; i < n; i++)
        E.put(
          "brass",
          cyl(),
          M(
            p.x + (r() - 0.5) * 1.2,
            p.y + 0.006,
            p.z + (r() - 0.5) * 1.2,
            Math.PI / 2,
            r() * TAU,
            0,
            0.012,
            0.03,
            0.012,
          ),
        );
    },
    chair(E, p) {
      // knocked-over wooden chair: seat, back, 4 legs (one snapped off)
      const r = E.rnd,
        yaw = r() * TAU,
        lie = r() < 0.7;
      const T = new THREE.Matrix4().compose(
        _p.set(p.x, p.y, p.z),
        _q.setFromEuler(_e.set(0, yaw, 0, "YXZ")),
        _s.set(1, 1, 1),
      );
      if (lie)
        T.multiply(new THREE.Matrix4().makeRotationX(-Math.PI / 2)).multiply(
          new THREE.Matrix4().makeTranslation(0, 0.02, -0.02),
        );
      const put = (lx, ly, lz, w, h, d, rx) =>
        E.put(
          "wood",
          box(),
          T.clone().multiply(M(lx, ly, lz, rx || 0, 0, 0, w, h, d)),
        );
      put(0, 0.45, 0, 0.44, 0.04, 0.42);
      put(0, 0.72, 0.2, 0.44, 0.5, 0.03, -0.08);
      const skip = (r() * 5) | 0;
      [
        [-0.19, -0.18],
        [0.19, -0.18],
        [-0.19, 0.18],
        [0.19, 0.18],
      ].forEach((q, i) => {
        if (i !== skip) put(q[0], 0.22, q[1], 0.035, 0.45, 0.035);
      });
    },
    table(E, p) {
      // overturned table on its side, top facing the room (only in corners/near walls)
      const r = E.rnd,
        yaw = p.wa + Math.PI + (r() - 0.5) * 0.5,
        w = 1.0 + r() * 0.5;
      const T = new THREE.Matrix4().compose(
        _p.set(p.x, p.y, p.z),
        _q.setFromEuler(_e.set(0, yaw, 0, "YXZ")),
        _s.set(1, 1, 1),
      );
      const put = (lx, ly, lz, sw, sh, sd) =>
        E.put(
          "wood",
          box(),
          T.clone().multiply(M(lx, ly, lz, 0, 0, 0, sw, sh, sd)),
        );
      put(0, 0.4, 0, w, 0.8, 0.05);
      for (const sx of [-1, 1])
        for (const sy of [0.12, 0.68])
          put(sx * (w / 2 - 0.08), sy, 0.36, 0.05, 0.05, 0.7);
    },
  };

  // ------------------------------------------------------------------
  // collapsed ceiling
  // ------------------------------------------------------------------
