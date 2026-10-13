// play-inline-131 12 — opts
// Lines 3183-3501 of readable/play-inline-131.pretty.js (statement-aligned).
  LB.registerLock = function (spec) {
    try {
      if (!G.isStub("locks") && G.locks.register) G.locks.register(spec);
    } catch (e) {
      /* locks absent */
    }
  };
  /** The player read / heard the code for lock `id` (logged in Goggles → NOTES → CODES). */
  LB.learnCode = function (id, src) {
    try {
      if (!G.isStub("locks") && G.locks.learn) G.locks.learn(id, src);
    } catch (e) {
      /* locks absent */
    }
  };
  /** Animated things: fn(t, dt, camPos). center/radius gate by distance. */
  LB.animate = function (center, radius, fn) {
    LB.animators.push({ c: center, r2: radius * radius, fn });
  };

  // -------------------------------------------------------------------
  // Reusable detail kits
  // -------------------------------------------------------------------
  /**
   * Row of windows on a wall plane. Wall plane is defined by origin (x,z) of the wall's left end,
   * direction ry (local +X runs along the wall; the window faces local +Z), with `out` offset.
   * opts: {count, spacing, y0, floors, floorH, w, h, frame: key, sillKey, brokenRatio, boardedRatio, litRatio, seed}
   */
  LB.windows = function (b, x, z, ry, opts) {
    const r = LB.rng(opts.seed || x * 7 + z * 3);
    const fk = opts.frame || "limestone";
    const c = Math.cos(ry),
      s = Math.sin(ry);
    for (let f = 0; f < opts.floors; f++) {
      const y = opts.y0 + f * opts.floorH;
      for (let i = 0; i < opts.count; i++) {
        const lx = opts.start + i * opts.spacing;
        const wx = x + lx * c + (opts.out || 0.02) * s,
          wz = z - lx * s + (opts.out || 0.02) * c;
        const roll = r();
        let key = "glass_dark";
        if (roll < (opts.brokenRatio === undefined ? 0.25 : opts.brokenRatio))
          key = "glass_broken";
        else if (
          roll <
          (opts.brokenRatio || 0.25) + (opts.boardedRatio || 0.06)
        )
          key = "planks";
        else if (opts.litRatio && roll > 1 - opts.litRatio) key = "window_lit";
        b.quad(key, wx, y + opts.h / 2, wz, opts.w, opts.h, {
          ry,
          uv: "box",
          grime: 0.1,
          noAO: true,
        });
        if (opts.sill !== false) {
          const sx = x + lx * c + 0.12 * s,
            sz = z - lx * s + 0.12 * c;
          b.box(fk, sx, y - 0.14, sz, opts.w + 0.3, 0.14, 0.26, {
            ry,
            seg: false,
            grime: 0.3,
          });
        }
        if (opts.lintel) {
          const sx = x + lx * c + 0.08 * s,
            sz = z - lx * s + 0.08 * c;
          b.box(fk, sx, y + opts.h, sz, opts.w + 0.3, 0.22, 0.18, {
            ry,
            seg: false,
            grime: 0.3,
          });
        }
      }
    }
  };
  /** Crenellated parapet along a segment. */
  LB.crenels = function (b, key, x0, z0, x1, z1, y, t, h, merlonW, gapW) {
    const len = Math.hypot(x1 - x0, z1 - z0),
      ry = Math.atan2(-(z1 - z0), x1 - x0);
    const step = merlonW + gapW;
    const n = Math.max(1, Math.floor(len / step));
    const pad = (len - n * step + gapW) / 2;
    b.box(key, (x0 + x1) / 2, y, (z0 + z1) / 2, len, h * 0.45, t, {
      ry,
      seg: false,
    });
    for (let i = 0; i < n; i++) {
      const lx = pad + i * step + merlonW / 2;
      const px = x0 + ((x1 - x0) * lx) / len,
        pz = z0 + ((z1 - z0) * lx) / len;
      b.box(key, px, y + h * 0.45, pz, merlonW, h * 0.55, t, {
        ry,
        seg: false,
      });
    }
  };
  /** Sandbag wall (stacked flattened capsules) along a segment. */
  LB.sandbags = function (b, x0, z0, x1, z1, rows, opts) {
    opts = opts || {};
    const len = Math.hypot(x1 - x0, z1 - z0),
      ry = Math.atan2(-(z1 - z0), x1 - x0);
    const y0 = opts.y || 0;
    const bagL = 0.75;
    const n = Math.max(1, Math.round(len / bagL));
    for (let rI = 0; rI < (rows || 3); rI++) {
      const off = rI % 2 ? 0.5 : 0;
      for (let i = 0; i < n - (off ? 1 : 0); i++) {
        const t = (i + 0.5 + off) / n;
        const px = x0 + (x1 - x0) * t,
          pz = z0 + (z1 - z0) * t;
        const g = new THREE.SphereGeometry(0.4, 6, 4);
        g.scale(1.0, 0.36, 0.62);
        b.add("sandbag", g, {
          m: LB.m4(
            px,
            y0 + 0.14 + rI * 0.27,
            pz,
            ry + (U.hash2(i, rI) - 0.5) * 0.2,
          ),
          grime: 0.5,
          c: 0xffffff,
        });
      }
    }
    if (!opts.noCollide)
      LB.col(
        (x0 + x1) / 2,
        (z0 + z1) / 2,
        len,
        0.8,
        y0,
        y0 + (rows || 3) * 0.27 + 0.1,
        ry,
        { surface: "dirt" },
      );
  };
  /** Rusty oil drum (optionally burning). */
  LB.barrel = function (b, x, y, z, opts) {
    opts = opts || {};
    b.cyl(opts.key || "rust", x, y, z, 0.3, 0.3, 0.9, 10, {
      hSeg: 1,
      grime: 0.4,
    });
    b.cyl("iron", x, y + 0.28, z, 0.315, 0.315, 0.05, 10, { hSeg: 1 });
    b.cyl("iron", x, y + 0.6, z, 0.315, 0.315, 0.05, 10, { hSeg: 1 });
    if (opts.fire) {
      b.cyl("fire", x, y + 0.82, z, 0.22, 0.26, 0.12, 8, {
        hSeg: 1,
        noAO: true,
        grime: 0,
      });
      LB.fires.push(new THREE.Vector3(x, y + 1.0, z));
    }
    if (!opts.noCollide)
      LB.col(x, z, 0.62, 0.62, y, y + 0.9, 0, { surface: "metal" });
  };
  LB.fires = LB.fires || [];
  LB.glows = LB.glows || []; // [{pos, color, size}] glow sprites registered at initDone
  /** Scrap-metal wall panel run (raider fortifications). */
  LB.scrapWall = function (b, x0, z0, x1, z1, h, opts) {
    opts = opts || {};
    const r = LB.rng(opts.seed || x0 * 3 + z1 * 5);
    const len = Math.hypot(x1 - x0, z1 - z0),
      ry = Math.atan2(-(z1 - z0), x1 - x0);
    const sn = Math.sin(ry),
      cs = Math.cos(ry);
    const y0 = opts.y || 0;
    const at = (tt, off) => [
      x0 + ((x1 - x0) * tt) / len + off * sn,
      z0 + ((z1 - z0) * tt) / len + off * cs,
    ];
    const TINTS = [
      undefined,
      0xc8b8a0,
      0x9aa890,
      0xb89478,
      0x8898a8,
      undefined,
    ];
    let t = 0,
      side = 1;
    while (t < len) {
      const pw = Math.min(len - t, 1.4 + r() * 1.8);
      const mid = t + pw / 2;
      const [px, pz] = at(mid, 0);
      const ph = h * (0.8 + r() * 0.35);
      const key = r.pick([
        "corrugated",
        "rust",
        "panel",
        "corrugated",
        "planks",
        "paint_red",
        "rust",
        "diamond",
        "paint_teal",
      ]);
      b.box(key, px, y0, pz, pw + 0.15, ph, 0.08, {
        ry,
        rz: (r() - 0.5) * 0.06,
        rx: (r() - 0.5) * 0.08,
        seg: false,
        grime: 0.7,
        c: r.pick(TINTS),
      });
      // patchwork: smaller sheets riveted over the joints, alternating faces
      if (r() < 0.55) {
        const pw2 = 0.6 + r() * 0.9,
          ph2 = 0.5 + r() * 1.0,
          tt = t + r() * pw;
        const [qx, qz] = at(tt, side * 0.07);
        b.box(
          r.pick([
            "rust",
            "corrugated",
            "paint_cream",
            "paint_orange",
            "steel",
          ]),
          qx,
          y0 + 0.3 + r() * (ph - ph2 - 0.3),
          qz,
          pw2,
          ph2,
          0.05,
          { ry, rz: (r() - 0.5) * 0.35, seg: false, grime: 0.8 },
        );
      }
      // a car door (painted shell + broken window) or a road sign bolted on
      if (r() < 0.16) {
        const [qx, qz] = at(mid, side * 0.1);
        b.box(
          r.pick(["paint_red", "paint_teal", "paint_cream", "rust"]),
          qx,
          y0 + 0.4,
          qz,
          1.1,
          1.05,
          0.1,
          { ry, rz: (r() - 0.5) * 0.2, seg: false, grime: 0.6 },
        );
        const [gx, gz] = at(mid, side * 0.16);
        b.quad("glass_broken", gx, y0 + 1.15, gz, 0.8, 0.36, {
          ry: ry + (side > 0 ? 0 : Math.PI),
          noAO: true,
        });
        b.box("chrome", qx, y0 + 0.95, qz, 0.2, 0.05, 0.16, { ry, seg: false });
      } else if (r() < 0.1) {
        const [qx, qz] = at(mid, side * 0.1);
        const sg = new THREE.CylinderGeometry(0.42, 0.42, 0.04, 8);
        sg.rotateX(Math.PI / 2);
        b.add("paint_red", sg, {
          m: LB.m4(qx, y0 + ph * 0.6, qz, ry, 0, Math.PI / 8),
          grime: 0.5,
        });
      }
      // horizontal batten
      if (r() < 0.35) {
        const [qx, qz] = at(mid, side * 0.08);
        b.box(
          "planks",
          qx,
          y0 + 0.6 + r() * (ph - 1.0),
          qz,
          pw + 0.3,
          0.16,
          0.05,
          { ry, rz: (r() - 0.5) * 0.1, seg: false },
        );
      }
      // rebar spikes / sharpened pipes along the top
      if (!opts.noSpikes && r() < 0.5)
        for (let k = 0; k < 3; k++) {
          const [qx, qz] = at(t + ((k + 0.5) * pw) / 3, 0);
          b.beam(
            "rust",
            new THREE.Vector3(qx, y0 + ph - 0.3, qz),
            new THREE.Vector3(
              qx + (r() - 0.5) * 0.2,
              y0 + ph + 0.35 + r() * 0.4,
              qz + (r() - 0.5) * 0.2,
            ),
            0.035,
            0.035,
            { noAO: true },
          );
        }
      // tyres stacked at the foot of the wall
      if (!opts.noClutter && r() < 0.12) {
        const [qx, qz] = at(mid, side * 0.55);
        for (let k = 0, n = 1 + ((r() * 3) | 0); k < n; k++) {
          const tg = new THREE.TorusGeometry(0.32, 0.12, 5, 10);
          tg.rotateX(Math.PI / 2);
          b.add("tire", tg, {
            m: LB.m4(qx + (r() - 0.5) * 0.08, y0 + 0.12 + k * 0.23, qz),
            noAO: true,
          });
        }
      }
      side = -side;
      t += pw;
    }
    // posts
    for (let p = 0; p <= len; p += 3) {
      const px = x0 + ((x1 - x0) * p) / len,
        pz = z0 + ((z1 - z0) * p) / len;
      b.box("rust", px, y0, pz, 0.14, h * 1.1, 0.14, { ry, seg: false });
    }
    if (!opts.noCollide)
      LB.colWall(x0, z0, x1, z1, 0.4, y0, y0 + h, {
        walkable: false,
        surface: "metal",
      });
  };
  /**
   * 1950s wrecked car shell (generic finned sedan). Built from a few boxes + rounded bits.
   * (x,y,z) centre bottom, ry heading. opts.color: paint key.
   */
