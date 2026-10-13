// play-inline-353 11 — opts
// Lines 2879-3088 of readable/play-inline-353.pretty.js (statement-aligned).
  function spawnRaw(type, opts) {
    try {
      if (G.isStub("props") || !G.props || typeof G.props.spawn !== "function")
        return null;
      return G.props.spawn(type, opts);
    } catch (e) {
      if (!PF._propWarned) {
        PF._propWarned = true;
        console.warn(
          "[poi_wallst] props.spawn failed for " +
            type +
            ": " +
            (e && e.message),
        );
      }
      return null;
    }
  }
  /** Re-create spawned props whose record was removed (by a reset elsewhere, or props rebuilding). Returns count. */
  PF.respawnMissing = function () {
    let n = 0;
    for (const rec of PF.spawned) {
      const h = rec.handle,
        r = h && h.record;
      const gone = h
        ? !!(r && r.removed)
        : !G.isStub("props") && G.props && typeof G.props.spawn === "function";
      if (!gone) continue;
      if (h && typeof h.remove === "function") {
        try {
          h.remove();
        } catch (e) {
          /* already gone */
        }
      }
      rec.handle = spawnRaw(rec.type, rec.opts);
      if (rec.onRespawn && rec.handle) {
        try {
          rec.onRespawn(rec.handle);
        } catch (e) {
          /* optional */
        }
      }
      n++;
    }
    return n;
  };
  /** Read-able plaque/interactable ('Read' → notify text). */
  PF.plaque = function (pos, title, text) {
    try {
      G.world.addInteractable({
        pos,
        radius: 0.7,
        label: title,
        verb: "Read",
        range: 2.5,
        onInteract() {
          G.notify(title + " — " + text, { duration: 9 });
          G.sfx.play("ui_click");
        },
      });
    } catch (e) {
      /* core missing */
    }
  };
  /** Animated things: fn(t, dt, camPos). center/radius gate by distance. */
  PF.animate = function (center, radius, fn) {
    PF.animators.push({ c: center, r2: radius * radius, fn });
  };

  // -------------------------------------------------------------------
  // Reusable detail kits
  // -------------------------------------------------------------------
  /**
   * Row of windows on a wall plane. Wall plane is defined by origin (x,z) of the wall's left end,
   * direction ry (local +X runs along the wall; the window faces local +Z), with `out` offset.
   * opts: {count, spacing, y0, floors, floorH, w, h, frame: key, sillKey, brokenRatio, boardedRatio, litRatio, seed}
   */
  PF.windows = function (b, x, z, ry, opts) {
    const r = PF.rng(opts.seed || x * 7 + z * 3);
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
  PF.crenels = function (b, key, x0, z0, x1, z1, y, t, h, merlonW, gapW) {
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
  PF.sandbags = function (b, x0, z0, x1, z1, rows, opts) {
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
          m: PF.m4(
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
      PF.col(
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
  PF.barrel = function (b, x, y, z, opts) {
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
      PF.fires.push(new THREE.Vector3(x, y + 1.0, z));
    }
    if (!opts.noCollide)
      PF.col(x, z, 0.62, 0.62, y, y + 0.9, 0, { surface: "metal" });
  };
  PF.fires = PF.fires || [];
  PF.glows = PF.glows || []; // [{pos, color, size}] glow sprites registered at initDone
  /** Scrap-metal wall panel run (raider fortifications). */
