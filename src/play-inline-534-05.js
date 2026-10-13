// play-inline-534 05 — math
// Lines 994-1321 of readable/play-inline-534.pretty.js (statement-aligned).
  X.benchSpot = function (ax, ay, az, rMin, rMax, face, pin, eye) {
    const ex = eye ? eye.x : ax,
      ez = eye ? eye.z : az; // line-of-sight origin (a stall's customer spot)
    // never in front of the merchant's counter (the customers' corridor, 3.4 m wide, 6 m deep)
    const blocks = (x, z) => {
      if (!face) return false;
      const dx = x - ax,
        dz = z - az,
        fwd = dx * face[0] + dz * face[1],
        lat = Math.abs(dx * face[1] - dz * face[0]);
      return fwd > -0.5 && fwd < 6 && lat < 3.4;
    };
    const interior = ax > 4000 || az > 4000;
    const ground = (x, z) => {
      const gy = X.groundAt(
        x,
        z,
        1.2,
        ay !== null ? ay + 2.2 : undefined,
        interior,
      );
      return gy === null || (ay !== null && Math.abs(gy - ay) > 0.8)
        ? null
        : gy;
    };
    const rays = (x, y, z) => AX.map(([dx, dz]) => rayDist(x, y, z, dx, dz, 6));
    // indoors/outdoors must match the anchor's (a street-side anchor never puts the bench inside a hollow shell)
    const _upv = new THREE.Vector3(0, 1, 0);
    const roofed = (x, y, z) => {
      try {
        return !!G.world.raycast(_o.set(x, y + 2.4, z), _upv, 70, {
          ignoreTags: ["actor", "foliage"],
        });
      } catch (e) {
        return false;
      }
    };
    const anchorRoofed = roofed(
      ax,
      ay !== null ? ay : X.groundAt(ax, az) || 0,
      az,
    );
    /** Full check of a final spot: returns a scored candidate or null. */
    const why = (m) => {
      if (pin) X.pinWhy = m;
      return null;
    };
    const judge = (x, z, k, r) => {
      if (blocks(x, z) || Math.hypot(x - ax, z - az) < 1.8)
        return why("blocks");
      const y = ground(x, z);
      if (y === null) return why("ground");
      if (!interior && roofed(x, y, z) !== anchorRoofed) return why("roof");
      // in sight of the anchor: the floor in front of the bench is reachable/visible from the merchant's spot
      // (rejects spots behind a wall, e.g. inside a hollow building shell next to the street)
      if (!pin) {
        const [fx, fz] = AX[YAW_DIRS[k][0]];
        const tx = x + fx * 1.3 - ex,
          tz = z + fz * 1.3 - ez,
          tl = Math.hypot(tx, tz);
        const ay0 = (ay !== null ? ay : y) + 1.2;
        let h = null;
        try {
          h = G.world.raycast(
            _o.set(ex, ay0, ez),
            new THREE.Vector3(tx / tl, 0, tz / tl),
            tl,
            { ignoreTags: ["actor", "foliage"] },
          );
        } catch (e) {
          h = null;
        }
        if (h && h.dist < tl - 0.2) return why("no line of sight");
      }
      // the crate end (local +X) must be on the same floor too
      const [rx, rz] = AX[YAW_DIRS[k][2]];
      if (ground(x + rx * 1.3, z + rz * 1.3) === null)
        return why("crate ground");
      const D = rays(x, y, z);
      const [f, bk, rt, lf] = YAW_DIRS[k].map((j) => D[j]);
      if (bk < 0.42 || f < 2.4 || rt < 1.7 || lf < 1.0)
        return why(
          "rays " + [f, bk, rt, lf].map((v) => v.toFixed(2)).join("/"),
        );
      // backed by a real wall (hits behind both ends of the bench), not a post or a stall corner
      const [bx, bz] = AX[YAW_DIRS[k][1]];
      // the whole footprint must be free: back and front rays from both ends of the bench (and the crate)
      const b1 = rayDist(x + rx * 0.82, y, z + rz * 0.82, bx, bz, 2),
        b2 = rayDist(x - rx * 0.82, y, z - rz * 0.82, bx, bz, 2);
      const b3 = rayDist(x + rx * 1.55, y, z + rz * 1.55, bx, bz, 2);
      if (Math.min(b1, b2) < 0.42 || b3 < 0.3)
        return why(
          "back ends " + [b1, b2, b3].map((v) => v.toFixed(2)).join("/"),
        );
      const f1 = rayDist(x + rx * 0.82, y, z + rz * 0.82, -bx, -bz, 1.6),
        f2 = rayDist(x - rx * 0.82, y, z - rz * 0.82, -bx, -bz, 1.6);
      const f3 = rayDist(x + rx * 1.55, y, z + rz * 1.55, -bx, -bz, 1);
      if (Math.min(f1, f2) < 1.2 || f3 < 0.4)
        return why(
          "front ends " + [f1, f2, f3].map((v) => v.toFixed(2)).join("/"),
        );
      // ...and tall (a wall, not a table or a stall counter): both ends still hit at 2.2 m
      const wide =
        bk <= 1.2 &&
        b1 < bk + 0.35 &&
        b2 < bk + 0.35 &&
        rayDist(x + rx * 0.82, y, z + rz * 0.82, bx, bz, 2, [2.2]) <
          bk + 0.45 &&
        rayDist(x - rx * 0.82, y, z - rz * 0.82, bx, bz, 2, [2.2]) < bk + 0.45;
      const score =
        (bk <= 1.2 ? 2 : 0) +
        (wide ? 5 : 0) +
        Math.min(f, 6) * 0.45 +
        Math.min(rt - 1.7, 1.5) * 0.4 +
        Math.min(lf - 1.0, 1.5) * 0.4 -
        Math.max(0, r - rMin) * 0.18;
      return { x, y, z, yaw: (k * Math.PI) / 2, score, back: bk, wide };
    };
    if (pin) {
      const c = judge(pin.x, pin.z, pin.k, rMin);
      if (c) {
        c.pinned = true;
        return c;
      }
    }
    pin = null;
    let best = null;
    const seen = new Set();
    for (let r = rMin; r <= rMax + 0.01; r += 1.5) {
      const n = Math.max(8, Math.ceil((Math.PI * 2 * r) / 1.4));
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + r * 0.37;
        let px = ax + Math.cos(a) * r,
          pz = az + Math.sin(a) * r;
        if (blocks(px, pz)) continue;
        const gy = ground(px, pz);
        if (gy === null) continue;
        const D = rays(px, gy, pz);
        for (let k = 0; k < 4; k++) {
          const [f, bk, rt, lf] = YAW_DIRS[k].map((j) => D[j]);
          if (f < 2.4 || bk < 0.42 || rt + lf < 2.85) continue;
          const [rx, rz] = AX[YAW_DIRS[k][2]],
            [bx, bz] = AX[YAW_DIRS[k][1]];
          // centre in a gap (crate side needs 0.7 m more), then back up to a wall ~12 cm off it
          let x = px,
            z = pz;
          if (rt < 3 || lf < 3) {
            const sl = Math.max(-1.6, Math.min(1.6, (rt - lf - 0.7) / 2));
            x += rx * sl;
            z += rz * sl;
          }
          if (bk <= 2.4) {
            const sh = bk - 0.78;
            x += bx * sh;
            z += bz * sh;
          } // ~40 cm off the collider (visible walls, wainscots and facade relief sit in front of it)
          const key = Math.round(x * 4) + "," + Math.round(z * 4) + "," + k;
          if (seen.has(key)) continue;
          seen.add(key);
          const c = judge(x, z, k, r);
          if (c && (!best || c.score > best.score)) best = c;
        }
      }
    }
    return best;
  };
  X.spawnReloadBenches = function () {
    if (
      X.reloadBenches.length ||
      !G.scene ||
      !G.world ||
      !G.world.addInteractable
    )
      return;
    X.defineSupplyLoot();
    X.RELOAD_BENCHES.forEach(([site, names, fb, rMin, rMax, note, pin], i) => {
      try {
        const an = anchorOf(site, names);
        const ax = an ? an.x : fb.x,
          az = an ? an.z : fb.z,
          ay = an ? an.y : null;
        let s = X.benchSpot(
          ax,
          ay,
          az,
          rMin,
          rMax,
          an ? an.face : null,
          pin,
          an ? an.eye : null,
        );
        if (!s && an) s = X.benchSpot(fb.x, null, fb.z, 0, rMax);
        if (!s) {
          if (G.warnings)
            G.warnings.push(
              "crafting: no spot for reloading bench (" + note + ")",
            );
          return;
        }
        const rec = placeBench(
          s.x,
          s.y,
          s.z,
          s.yaw,
          note,
          i,
          an ? an.name : "fallback",
        );
        rec.fit = {
          score: +s.score.toFixed(2),
          back: +s.back.toFixed(2),
          wide: s.wide,
          pinned: !!s.pinned,
          pinWhy: pin && !s.pinned ? X.pinWhy : undefined,
        };
        X.reloadBenches.push(rec);
      } catch (e) {
        G.reportError("crafting:reloadBench", e);
      }
    });
  };
  const _up = new THREE.Vector3(0, 1, 0);
  const local = (x, y, z, lx, ly, lz, yaw) =>
    new THREE.Vector3(lx, ly, lz)
      .applyAxisAngle(_up, yaw)
      .add(new THREE.Vector3(x, y, z));
  function placeBench(x, y, z, yaw, note, idx, anchor) {
    const M = buildModel(),
      mt = mats();
    const grp = new THREE.Group();
    grp.name = "cr_reloading_bench";
    let indoor = false;
    try {
      indoor = !!G.world.raycast(new THREE.Vector3(x, y + 2.4, z), _up, 70, {
        ignoreTags: ["actor", "foliage"],
      });
    } catch (e) {
      indoor = false;
    }
    const a = new THREE.Mesh(M.wood, mt.wood),
      b = new THREE.Mesh(M.metal, mt.metal),
      c = new THREE.Mesh(M.glass, indoor ? mt.glassIn : mt.glass);
    for (const m of [a, b, c]) {
      m.castShadow = m !== c;
      m.receiveShadow = true;
      m.matrixAutoUpdate = false;
      grp.add(m);
    }
    grp.position.set(x, y, z);
    grp.rotation.y = yaw;
    grp.updateMatrixWorld(true);
    G.scene.add(grp);
    if (G.world.addLOD) G.world.addLOD(grp, 85);
    try {
      G.world.addCollider(x, z, 1.78, 0.8, y, y + 0.9, yaw, {
        tag: "prop",
        surface: "wood",
      });
    } catch (e) {
      /* ignore */
    }
    const cp = local(x, y, z, M.crate.x, 0, M.crate.z, yaw);
    try {
      G.world.addCollider(
        cp.x,
        cp.z,
        M.crate.w,
        M.crate.d,
        y,
        y + M.crate.h,
        yaw,
        { tag: "prop", surface: "wood" },
      );
    } catch (e) {
      /* ignore */
    }
    // interact point: bench top, front edge (local (0, 1.0, -0.2))
    const ip = local(x, y, z, 0, 1.0, -0.2, yaw);
    const it = G.world.addInteractable({
      pos: ip,
      radius: 0.8,
      range: 2.6,
      priority: 0.5,
      label: "Reloading Bench",
      verb: "Use",
      onInteract: () => {
        C.open("reloading");
      },
    });
    // the crate beside it: a restocking "Reloading Supplies" container (rpg containers)
    let box = null;
    try {
      if (
        !G.isStub("containers") &&
        G.containers &&
        typeof G.containers.create === "function" &&
        G.items.hasLootTable &&
        G.items.hasLootTable("cr_reloading_supplies")
      ) {
        const bp = local(x, y, z, M.crate.x, 0.05, M.crate.z - 0.12, yaw);
        box = G.containers.create({
          id: "cr_rsupply_" + idx,
          pos: { x: bp.x, y: bp.y, z: bp.z },
          model: false,
          name: "Reloading Supplies",
          kind: "ammo_box",
          loot: "cr_reloading_supplies",
          respawn: true,
          level: 1,
          radius: 0.45,
        });
      }
    } catch (e) {
      G.reportError("crafting:supplyCrate", e);
      box = null;
    }
    return {
      x,
      y,
      z,
      yaw,
      note,
      anchor,
      obj: grp,
      interactable: it,
      container: box,
    };
  }
