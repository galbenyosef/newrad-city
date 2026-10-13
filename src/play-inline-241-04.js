// play-inline-241 04 — opts
// Lines 651-901 of readable/play-inline-241.pretty.js (statement-aligned).
  PR.gate = function (opts) {
    const g = new THREE.Group();
    g.name = "pr_gate_" + opts.flag;
    const b = PR.batch("gate_" + opts.flag);
    const c = Math.cos(opts.ry || 0),
      s = Math.sin(opts.ry || 0);
    const key = opts.key || "iron";
    if (opts.bars !== false) {
      const n = Math.max(3, Math.round(opts.w / 0.14));
      for (let i = 0; i <= n; i++) {
        const lx = -opts.w / 2 + (i * opts.w) / n;
        b.box(
          key,
          opts.x + lx * c,
          opts.y,
          opts.z - lx * s,
          0.035,
          opts.h,
          0.035,
          { seg: false, grime: 0.3 },
        );
      }
      for (const yy of [0.12, opts.h * 0.5, opts.h - 0.1])
        b.box(key, opts.x, opts.y + yy, opts.z, opts.w, 0.06, 0.06, {
          ry: opts.ry,
          seg: false,
        });
      if (opts.chain) {
        for (let k = 0; k < 7; k++)
          b.add("chrome", new THREE.TorusGeometry(0.05, 0.012, 3, 8), {
            m: PR.m4(
              opts.x + (k - 3) * 0.08 * c,
              opts.y + opts.h * 0.5 + Math.sin(k) * 0.03,
              opts.z - (k - 3) * 0.08 * s + 0.04 * c,
              opts.ry + ((k % 2) * Math.PI) / 2,
            ),
            noAO: true,
          });
        b.box(
          "iron",
          opts.x + 0.04 * s,
          opts.y + opts.h * 0.5 - 0.22,
          opts.z + 0.06 * c,
          0.12,
          0.16,
          0.06,
          { ry: opts.ry, seg: false },
        );
      }
    } else {
      b.box(key, opts.x, opts.y, opts.z, opts.w, opts.h, 0.12, {
        ry: opts.ry,
        seg: false,
        grime: 0.6,
      });
    }
    b.build(g, { noLOD: true });
    (opts.parent || G.scene).add(g);
    const rec = { g, col: null, open: false, opts };
    const L =
      opts.lock && typeof opts.lock === "object"
        ? PR.lockReg(
            Object.assign({ kind: "door", label: opts.label }, opts.lock),
          )
        : null;
    const isLocked = () =>
      !!L &&
      !PR.flag(opts.flag + "_picked") &&
      !(PR.locksLive() && G.locks.isOpen && G.locks.isOpen(L.id));
    const close = () => {
      if (!rec.col)
        rec.col = PR.col(
          opts.x,
          opts.z,
          opts.w,
          0.3,
          opts.y,
          opts.y + opts.h,
          opts.ry || 0,
          { walkable: false, surface: "metal" },
        );
      g.visible = true;
      rec.open = false;
    };
    const open = () => {
      if (rec.col) {
        try {
          G.world.removeCollider(rec.col);
        } catch (e) {
          /* ignore */
        }
        rec.col = null;
      }
      g.visible = false;
      rec.open = true;
    };
    rec.setOpen = (v) => {
      if (v) open();
      else close();
    };
    close();
    PR.flagDefaults[opts.flag] = false;
    PR.flagWatch.push((k, v) => {
      if (k === "*" || k === opts.flag) rec.setOpen(!!PR.flag(opts.flag));
    });
    PR.onReset.push(() => rec.setOpen(false));
    PR.use({
      pos: V3(opts.x, opts.y + 1.2, opts.z),
      radius: Math.max(0.9, opts.w * 0.4),
      range: 2.8,
      label: opts.label || "Gate",
      verb: () => (rec.open ? "Close" : opts.verbOpen || "Open"),
      locked: () => (rec.open || !isLocked() ? null : "Locked"),
      onInteract() {
        if (rec.open) {
          PR.setFlag(opts.flag, false);
          PR.sfx("door_open", V3(opts.x, opts.y + 1, opts.z));
          return;
        }
        if (opts.canUse && !opts.canUse(G.player.pos)) {
          G.notify(opts.denyText || "It won't open from this side.");
          PR.sfx("door_locked");
          return;
        }
        const doOpen = () => {
          PR.setFlag(opts.flag + "_picked", true);
          PR.setFlag(opts.flag, true);
          PR.sfx("door_open", V3(opts.x, opts.y + 1, opts.z));
          if (opts.onOpen) PR.safe("gate", opts.onOpen);
        };
        if (isLocked()) {
          if (!PR.locksLive() && !(L.key && PR.inv.count(L.key) > 0)) {
            G.notify(opts.lockedText || "Locked.");
            PR.sfx("door_locked");
            return;
          }
          PR.lockOpen(L, doOpen);
          return;
        }
        doOpen();
      },
    });
    return rec;
  };

  /**
   * Small wooden rowing skiff (bow toward local -Z). (x,y,z) = waterline centre.
   */
  PR.skiff = function (b, x, y, z, ry, opts) {
    opts = opts || {};
    const M = PR.m4(x, y, z, ry);
    const add = (key, geo, m, o) =>
      b.add(
        key,
        geo,
        Object.assign(
          { m: new THREE.Matrix4().multiplyMatrices(M, m), grime: 0.6 },
          o || {},
        ),
      );
    const hull = new THREE.SphereGeometry(
      1,
      14,
      7,
      0,
      TAU,
      Math.PI / 2,
      Math.PI / 2,
    );
    // pointed bow: pinch the front half
    const p = hull.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const zz = p.getZ(i);
      if (zz < 0) p.setX(i, p.getX(i) * (1 + zz * 0.55));
    }
    hull.computeVertexNormals();
    add(
      opts.paint || "paint_teal",
      hull,
      PR.m4(0, 0.25, 0, 0, 0, 0, 0.75, 0.55, 2.1),
    );
    const rim = new THREE.TorusGeometry(1, 0.05, 4, 20);
    rim.rotateX(Math.PI / 2);
    add("rotten", rim, PR.m4(0, 0.25, 0, 0, 0, 0, 0.72, 1, 2.05));
    for (const zz of [-0.8, 0.1, 0.9])
      add(
        "rotten",
        new THREE.BoxGeometry(1.2 - Math.abs(zz) * 0.35, 0.05, 0.28),
        PR.m4(0, 0.12, zz),
      );
    add(
      "rotten",
      new THREE.BoxGeometry(0.06, 0.06, 2.6),
      PR.m4(0.35, 0.3, 0.2, 0.2, 0, 0.3),
    ); // oar
    add(
      "rotten",
      new THREE.BoxGeometry(0.2, 0.02, 0.5),
      PR.m4(0.62, 0.34, 1.35, 0.2, 0, 0.3),
    );
    if (opts.water)
      add(
        "dirty_water_k",
        new THREE.BoxGeometry(1.0, 0.02, 2.6),
        PR.m4(0, -0.05, 0),
      );
  };
  PR.MAT_DEFS.dirty_water_k = {
    color: 0x3a3a24,
    rough: 0.2,
    metal: 0.2,
    uv: 2,
    plain: true,
  };

  /**
   * Straight flight of thin treads (open riser stair) with matching thin colliders.
   * Starts at (x,z) at y0 and climbs toward local +Z (rotated by ry) to y1 over `run` metres.
   * opts: {maxRise (0.25), thick (0.12), surface, noCollide, c}
   */
  PR.treads = function (b, key, x, z, ry, width, run, y0, y1, opts) {
    opts = opts || {};
    const n = Math.max(
      1,
      Math.ceil(Math.abs(y1 - y0) / (opts.maxRise || 0.25)),
    );
    const sr = run / n,
      sh = (y1 - y0) / n,
      th = opts.thick || 0.12;
    for (let i = 0; i < n; i++) {
      const top = y0 + sh * (i + 1);
      const [wx, wz] = PR.rot(x, z, ry, 0, sr * (i + 0.5));
      b.box(key, wx, top - th, wz, width, th, sr + 0.04, {
        ry,
        seg: false,
        grime: opts.grime === undefined ? 0.4 : opts.grime,
        c: opts.c,
      });
      if (!opts.noCollide)
        PR.col(wx, wz, width, sr + 0.06, top - Math.max(th, 0.3), top, ry, {
          surface: opts.surface || "concrete",
        });
    }
    return n;
  };
  /**
   * Helical (spiral) stair: wedge treads between radius rIn..rOut around (cx,cz), starting at angle a0
   * (radians, measured like atan2(dz, dx)) and y0, climbing `rise` per full turn for `turns` turns, `perTurn`
   * treads per turn. dir +1 = counter-clockwise seen from above (increasing angle). Returns {n, endAngle, endY}.
   * opts: {thick, surface, underside key, noCollide, rail: key (inner rail), railH}
   */
