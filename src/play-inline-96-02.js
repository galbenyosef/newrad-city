// play-inline-96 02 — box
// Lines 354-689 of readable/play-inline-96.pretty.js (statement-aligned).
  function slideDoor(cx, cz, w, h, alongX, y0) {
    const g = new M.GeoBuf();
    const T = 0.14;
    const sx = alongX ? w : T,
      sz = alongX ? T : w;
    M.box(g, -sx / 2, 0, -sz / 2, sx / 2, h, sz / 2, {
      s: 1.5,
      c: [0.55, 0.58, 0.6],
      skip: 0,
    });
    M.box(
      g,
      -sx / 2 - 0.01,
      h * 0.48,
      -sz / 2 - 0.01,
      sx / 2 + 0.01,
      h * 0.54,
      sz / 2 + 0.01,
      { s: 1, c: [0.95, 0.45, 0.18] },
    );
    const geo = g.toGeometry();
    const mat = new THREE.MeshStandardMaterial({
      map: M.mat("metal_painted").map || null,
      vertexColors: true,
      roughness: 0.55,
      metalness: 0.35,
    });
    mat.userData.shared = true;
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(O.x + cx, (O.y || 0) + (y0 || 0), O.z + cz);
    mesh.castShadow = false;
    mesh.receiveShadow = true;
    M.roots.cryoDyn = M.roots.cryoDyn || new THREE.Group();
    M.roots.cryoDyn.add(mesh);
    const d = {
      mesh,
      cx: O.x + cx,
      cz: O.z + cz,
      w,
      h,
      alongX,
      open: 0,
      target: 0,
      col: null,
      y0: (O.y || 0) + (y0 || 0),
    };
    d.addCol = () => {
      if (!d.col)
        d.col = G.world.addBox(
          d.cx - (alongX ? w / 2 : 0.1),
          d.y0,
          d.cz - (alongX ? 0.1 : w / 2),
          d.cx + (alongX ? w / 2 : 0.1),
          d.y0 + h,
          d.cz + (alongX ? 0.1 : w / 2),
          { tag: "door", surface: "metal" },
        );
    };
    d.remCol = () => {
      if (d.col) {
        G.world.removeCollider(d.col);
        d.col = null;
      }
    };
    d.addCol();
    slideDoors.push(d);
    return d;
  }
  let actorScan = 0,
    actorPts = [];
  M.updateSlideDoors = function (dt) {
    const p = G.player.pos;
    if (Math.abs(p.x - O.x) > 220 || Math.abs(p.z - O.z) > 220) return;
    actorScan -= dt;
    if (actorScan <= 0) {
      actorScan = 0.25;
      actorPts = [];
      try {
        if (!G.isStub("actors") && G.actors.list)
          for (const a of G.actors.list()) {
            if (!a || a.dead || !a.pos) continue;
            if (Math.abs(a.pos.x - O.x) < 200 && Math.abs(a.pos.z - O.z) < 200)
              actorPts.push(a.pos);
          }
      } catch (e) {
        actorPts = [];
      }
    }
    for (const d of slideDoors) {
      const dist = Math.hypot(p.x - d.cx, p.z - d.cz);
      let near = dist < 3.0 && Math.abs(p.y - d.y0) < 2;
      let nearA = false;
      for (const q of actorPts)
        if (Math.hypot(q.x - d.cx, q.z - d.cz) < 2.4) {
          nearA = true;
          break;
        }
      near = near || nearA;
      if (near && d.target === 0) {
        d.target = 1;
        d.remCol();
        try {
          G.sfx.play("door_open", {
            pos: d.mesh.position,
            volume: 0.45,
            pitch: 1.25,
          });
        } catch (e) {
          /* ignore */
        }
      }
      if (!near && d.target === 1 && dist > 3.4 && !nearA) d.target = 0;
      const before = d.open;
      d.open = M.clamp(d.open + (d.target ? 1 : -1) * dt * 2.4, 0, 1);
      if (d.open !== before) {
        const off = d.open * (d.w - 0.1);
        if (d.alongX) d.mesh.position.x = d.cx + off;
        else d.mesh.position.z = d.cz + off;
      }
      if (d.open <= 0.001 && d.target === 0) d.addCol();
    }
  };

  // -------------------------------------------------------------------
  // Furniture kit (local coords)
  // -------------------------------------------------------------------
  /** Box footprint collider for something rotated by yaw (w along local x, d along local z). */
  function footCB(x, z, yaw, w, d, h, y, opts) {
    const c = Math.abs(Math.cos(yaw)),
      s = Math.abs(Math.sin(yaw));
    const hw = (c * w) / 2 + (s * d) / 2,
      hd = (s * w) / 2 + (c * d) / 2;
    CB(x - hw, y || 0, z - hd, x + hw, (y || 0) + h, z + hd, opts);
  }
  function locker(x, z, yaw, n, y, tint) {
    y = y || 0;
    M.pushXF(M.mtx(x, y, z, yaw));
    const lb = b("metal_painted");
    for (let i = 0; i < (n || 1); i++) {
      const ox = (i - ((n || 1) - 1) / 2) * 0.62;
      M.box(lb, ox - 0.3, 0, -0.28, ox + 0.3, 1.95, 0.28, {
        s: 1,
        c: tint || [0.7, 0.72, 0.72],
      });
      for (let k = 0; k < 4; k++)
        M.box(
          lb,
          ox - 0.18,
          1.55 + k * 0.06,
          0.281,
          ox + 0.18,
          1.58 + k * 0.06,
          0.29,
          { s: 1, c: C_DARK },
        ); // vents
      M.box(lb, ox + 0.18, 0.9, 0.281, ox + 0.22, 1.1, 0.3, {
        s: 1,
        c: C_STEEL,
      });
      M.box(lb, ox - 0.12, 1.25, 0.281, ox + 0.12, 1.36, 0.292, {
        s: 1,
        c: [0.95, 0.93, 0.85],
      }); // name card
    }
    M.popXF();
    footCB(x, z, yaw, 0.62 * (n || 1), 0.56, 1.95, y);
  }
  function table(x, z, w, d, h, yaw) {
    M.pushXF(M.mtx(x, 0, z, yaw || 0));
    const tb = b("metal_painted");
    M.box(tb, -w / 2, h - 0.05, -d / 2, w / 2, h, d / 2, {
      s: 1,
      c: [0.8, 0.8, 0.76],
    });
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        M.box(
          tb,
          sx * (w / 2 - 0.06) - 0.03,
          0,
          sz * (d / 2 - 0.06) - 0.03,
          sx * (w / 2 - 0.06) + 0.03,
          h - 0.05,
          sz * (d / 2 - 0.06) + 0.03,
          { s: 1, c: C_STEEL },
        );
    M.popXF();
    footCB(x, z, yaw || 0, w, d, h);
  }
  function chair(x, z, yaw, y, c) {
    const bb = b("metal_painted");
    M.pushXF(M.mtx(x, y || 0, z, yaw));
    M.box(bb, -0.22, 0.42, -0.22, 0.22, 0.47, 0.22, {
      s: 1,
      c: c || [0.55, 0.32, 0.2],
    });
    M.box(bb, -0.22, 0.47, 0.18, 0.22, 0.92, 0.23, {
      s: 1,
      c: c || [0.55, 0.32, 0.2],
    });
    for (const sx of [-0.18, 0.18])
      for (const sz of [-0.18, 0.18])
        M.box(bb, sx - 0.02, 0, sz - 0.02, sx + 0.02, 0.42, sz + 0.02, {
          s: 1,
          c: C_STEEL,
        });
    M.popXF();
  }
  function desk(x, z, yaw, w, y) {
    w = w || 1.6;
    y = y || 0;
    M.pushXF(M.mtx(x, y, z, yaw));
    const db = b("wood_planks");
    M.box(db, -w / 2, 0.72, -0.4, w / 2, 0.78, 0.4, {
      s: 1,
      c: [0.62, 0.48, 0.34],
    });
    M.box(b("metal_painted"), -w / 2, 0, -0.38, -w / 2 + 0.45, 0.72, 0.38, {
      s: 1,
      c: [0.55, 0.6, 0.58],
    });
    M.box(b("metal_painted"), w / 2 - 0.45, 0, -0.38, w / 2, 0.72, 0.38, {
      s: 1,
      c: [0.55, 0.6, 0.58],
    });
    M.popXF();
    footCB(x, z, yaw, w, 0.8, 0.8, y, { surface: "wood" });
  }
  function fileCabinet(x, z, yaw, n) {
    M.pushXF(M.mtx(x, 0, z, yaw));
    const fb = b("metal_painted");
    for (let i = 0; i < (n || 1); i++) {
      const ox = (i - ((n || 1) - 1) / 2) * 0.52;
      M.box(fb, ox - 0.25, 0, -0.32, ox + 0.25, 1.35, 0.32, {
        s: 1,
        c: [0.5, 0.55, 0.5],
      });
      for (let k = 0; k < 4; k++)
        M.box(
          fb,
          ox - 0.08,
          0.2 + k * 0.32,
          0.321,
          ox + 0.08,
          0.24 + k * 0.32,
          0.335,
          { s: 1, c: C_STEEL },
        );
    }
    M.popXF();
    footCB(x, z, yaw, 0.52 * (n || 1), 0.64, 1.35);
  }
  function crateStack(x, z, n) {
    const cb = b("wood_planks");
    for (let i = 0; i < n; i++)
      M.box(
        cb,
        x - 0.45 + (i % 2) * 0.1,
        i * 0.7,
        z - 0.45,
        x + 0.45 + (i % 2) * 0.1,
        i * 0.7 + 0.7,
        z + 0.45,
        { s: 1, c: [0.68, 0.6, 0.46] },
      );
    CB(x - 0.5, 0, z - 0.5, x + 0.6, n * 0.7, z + 0.5, { surface: "wood" });
  }
  function bed(x, z, yaw) {
    M.pushXF(M.mtx(x, 0, z, yaw));
    const fb = b("metal_painted"),
      mb = b("fabric");
    M.box(fb, -0.45, 0.45, -1.0, 0.45, 0.55, 1.0, { s: 1, c: C_STEEL });
    M.box(mb, -0.42, 0.55, -0.95, 0.42, 0.68, 0.95, {
      s: 1,
      c: [0.82, 0.82, 0.78],
    });
    M.box(mb, -0.32, 0.68, -0.9, 0.32, 0.78, -0.58, {
      s: 1,
      c: [0.92, 0.92, 0.88],
    });
    for (const sx of [-0.42, 0.42])
      for (const sz of [-0.95, 0.95])
        M.box(fb, sx - 0.03, 0, sz - 0.03, sx + 0.03, 0.55, sz + 0.03, {
          s: 1,
          c: C_STEEL,
        });
    M.popXF();
    footCB(x, z, yaw, 0.95, 2.05, 0.75);
  }
  /** Coolant puddle with a frost rim (floor decal-ish quads). */
  function puddle(x, z, r, y) {
    const n = 10,
      yy = (y || 0) + 0.012;
    const pb = b("glass_dirty@window");
    const rr = M.rng("pud" + x + z);
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2,
        k = r * rr.range(0.7, 1.15);
      pts.push([x + Math.cos(a) * k, z + Math.sin(a) * k]);
    }
    for (let i = 0; i < n; i++) {
      const p = pts[i],
        q = pts[(i + 1) % n];
      M.tri(
        pb,
        [x, yy, z],
        [p[0], yy, p[1]],
        [q[0], yy, q[1]],
        [0, 1, 0],
        [0.5, 0.5, 0, 0, 1, 0],
        [0.6, 0.75, 0.85],
      );
    }
  }
  /** Frost crust on a floor patch (pale, slightly raised). */
  function frost(x, z, w, d, y) {
    M.box(
      b("concrete"),
      x - w / 2,
      y || 0,
      z - d / 2,
      x + w / 2,
      (y || 0) + 0.015,
      z + d / 2,
      { s: 2, c: C_FROST, skip: 8 + 1 + 2 + 16 + 32 },
    );
  }

  // -------------------------------------------------------------------
  // A Long Winter pod: upright capsule on a plinth, steel back shell,
  // frosted glass front, orange collar ring, coolant lines to the ceiling,
  // status lamp. Front faces +z of the local frame (rotated by yaw).
  // opts: open (front door swung aside), empty, dead (red lamp, dark frost),
  // cracked (leaking: puddle + broken glass), ceilY
  // -------------------------------------------------------------------
