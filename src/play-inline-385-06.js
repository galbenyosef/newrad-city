// play-inline-385 06 — tint
// Lines 1105-1406 of readable/play-inline-385.pretty.js (statement-aligned).
  function buildHinged(ctx, b, o) {
    const O = ctx.O,
      w = o.w || 1.1,
      h = o.h || 2.2,
      y = o.y || 0,
      th = 0.06;
    const db = K.builder({
      name: "door_" + o.id,
      off: O,
      lit: b.lit,
      amb: b.amb,
      floors: [y],
      grime: 0.35,
    });
    db.lights = b.lights.slice();
    const alongX = o.axis !== "z";
    // hinge point (local)
    const hx = alongX ? o.x + ((o.hinge || -1) * w) / 2 : o.x,
      hz = alongX ? o.z : o.z + ((o.hinge || -1) * w) / 2;
    const cx = o.x,
      cz = o.z;
    const mat = o.mat || "wood_dark",
      tint = o.tint || [0.55, 0.4, 0.28];
    if (alongX) {
      db.boxMM(
        mat,
        cx - w / 2 + 0.01,
        y + 0.01,
        cz - th / 2,
        cx + w / 2 - 0.01,
        y + h,
        cz + th / 2,
        { tint, faces: "nsewtb" },
      );
      for (const s of [-1, 1]) {
        db.boxMM(
          mat,
          cx - w / 2 + 0.12,
          y + 0.2,
          cz + s * (th / 2 + 0.012) - 0.012,
          cx + w / 2 - 0.12,
          y + h * 0.42,
          cz + s * (th / 2 + 0.012) + 0.012,
          { tint: tint.map((v) => v * 0.85) },
        );
        if (o.glass)
          db.boxMM(
            "glass",
            cx - w / 2 + 0.14,
            y + h * 0.52,
            cz + s * 0.001,
            cx + w / 2 - 0.14,
            y + h - 0.14,
            cz + s * 0.001 + 0.004,
            { tint: [0.45, 0.5, 0.48] },
          );
        else
          db.boxMM(
            mat,
            cx - w / 2 + 0.12,
            y + h * 0.5,
            cz + s * (th / 2 + 0.012) - 0.012,
            cx + w / 2 - 0.12,
            y + h - 0.14,
            cz + s * (th / 2 + 0.012) + 0.012,
            { tint: tint.map((v) => v * 0.85) },
          );
        const kx = cx - (o.hinge || -1) * (w / 2 - 0.1);
        db.geo("brass", K.sphereGeo(), {
          x: kx,
          y: y + 1.0,
          z: cz + s * 0.07,
          s: 0.04,
        });
        if (o.sign)
          db.plate(
            "art",
            cx,
            y + h * 0.7,
            cz + s * (th / 2 + 0.03),
            0,
            s,
            Math.min(0.8, w - 0.3),
            0.3,
            o.sign,
            { off: 0 },
          );
      }
    } else {
      db.boxMM(
        mat,
        cx - th / 2,
        y + 0.01,
        cz - w / 2 + 0.01,
        cx + th / 2,
        y + h,
        cz + w / 2 - 0.01,
        { tint, faces: "nsewtb" },
      );
      for (const s of [-1, 1]) {
        db.boxMM(
          mat,
          cx + s * (th / 2 + 0.012) - 0.012,
          y + 0.2,
          cz - w / 2 + 0.12,
          cx + s * (th / 2 + 0.012) + 0.012,
          y + h * 0.42,
          cz + w / 2 - 0.12,
          { tint: tint.map((v) => v * 0.85) },
        );
        if (o.glass)
          db.boxMM(
            "glass",
            cx + s * 0.001,
            y + h * 0.52,
            cz - w / 2 + 0.14,
            cx + s * 0.001 + 0.004,
            y + h - 0.14,
            cz + w / 2 - 0.14,
            { tint: [0.45, 0.5, 0.48] },
          );
        else
          db.boxMM(
            mat,
            cx + s * (th / 2 + 0.012) - 0.012,
            y + h * 0.5,
            cz - w / 2 + 0.12,
            cx + s * (th / 2 + 0.012) + 0.012,
            y + h - 0.14,
            cz + w / 2 - 0.12,
            { tint: tint.map((v) => v * 0.85) },
          );
        const kz = cz - (o.hinge || -1) * (w / 2 - 0.1);
        db.geo("brass", K.sphereGeo(), {
          x: cx + s * 0.07,
          y: y + 1.0,
          z: kz,
          s: 0.04,
        });
        if (o.sign)
          db.plate(
            "art",
            cx + s * (th / 2 + 0.03),
            y + h * 0.7,
            cz,
            s,
            0,
            Math.min(0.8, w - 0.3),
            0.3,
            o.sign,
            { off: 0 },
          );
      }
    }
    const g = db.finish(null);
    // re-pivot on the hinge
    const wx = hx + O.x,
      wy = y + O.y,
      wz = hz + O.z;
    g.traverse((m) => {
      if (m.isMesh && m.geometry) {
        m.geometry.translate(-wx, -wy, -wz);
        m.geometry.computeBoundingSphere();
      }
    });
    g.position.set(wx, wy, wz);
    (ctx.intRoot || ctx.extRoot).add(g);
    const D = {
      id: o.id,
      g,
      open: 0,
      target: 0,
      swing: (o.swing || 1) * (o.hinge || -1) * (alongX ? 1 : -1),
      col: null,
      o,
    };
    const addCol = () => {
      if (D.col) return;
      D.col = alongX
        ? G.world.addBox(
            cx - w / 2 + O.x,
            y + O.y,
            cz - 0.08 + O.z,
            cx + w / 2 + O.x,
            y + h + O.y,
            cz + 0.08 + O.z,
            { tag: "door", surface: "wood" },
          )
        : G.world.addBox(
            cx - 0.08 + O.x,
            y + O.y,
            cz - w / 2 + O.z,
            cx + 0.08 + O.x,
            y + h + O.y,
            cz + w / 2 + O.z,
            { tag: "door", surface: "wood" },
          );
    };
    const remCol = () => {
      if (D.col) {
        K.safe("door col", () => G.world.removeCollider(D.col));
        D.col = null;
      }
    };
    addCol();
    const fk = "door_" + o.id;
    if (o.lock) PV.lockReg(o.lock);
    const locked = () =>
      o.lock &&
      !PV.flag(fk + "_unlocked") &&
      !(PV.locksLive() && G.locks.isOpen && G.locks.isOpen(o.lock.id))
        ? 1
        : 0;
    const setOpen = (v) => {
      D.target = v ? 1 : 0;
      if (v) remCol();
      else addCol();
      K.sfx(v ? "door_open" : "container_close", K.world(ctx, cx, y + 1, cz), {
        volume: 0.7,
      });
    };
    D.setOpen = setOpen;
    D.reset = () => {
      D.target = 0;
      D.open = 0;
      D.g.rotation.y = 0;
      addCol();
    };
    D.locked = locked;
    ctx.interactables.push(
      G.world.addInteractable({
        pos: K.world(ctx, cx, y + 1.1, cz),
        radius: 0.8,
        priority: 1,
        label: () => o.label || "Door",
        verb: () => (D.target ? "Close" : "Open"),
        locked: () => (locked() ? "Locked" : null),
        onInteract: () => {
          if (locked()) {
            if (!PV.locksLive() && !(o.lock.key && K.has(o.lock.key))) {
              K.sfx("door_locked", null);
              K.notify("This door is locked.");
              return;
            }
            PV.lockOpen(o.lock, () => {
              PV.setFlag(fk + "_unlocked", true);
              setOpen(true);
            });
            return;
          }
          setOpen(!D.target);
        },
      }),
    );
    (ctx.swingDoors = ctx.swingDoors || []).push(D);
    return D;
  }
  /** Animate swing doors (called from the POI update). */
  K.updateDoors = function (ctx, dt) {
    for (const D of ctx.swingDoors || []) {
      if (Math.abs(D.open - D.target) < 1e-3) continue;
      D.open +=
        Math.sign(D.target - D.open) *
        Math.min(Math.abs(D.target - D.open), dt * 2.2);
      D.g.rotation.y = D.swing * D.open * PI * 0.5;
    }
  };

  /** Unlit backdrop plane (skyline beyond a blown-out wall): {rect, pos:[x,y,z] local, n:[nx,nz], w, h, tint}. */
  K.backdrop = function (ctx, bd) {
    const rc = bd.rect,
      base = K.mat(K.atlasMat("pics", rc), true);
    const m = new THREE.MeshBasicMaterial({
      map: base.map,
      color: new THREE.Color(bd.tint || 1, bd.tint || 1, bd.tint || 1),
      fog: false,
      toneMapped: true,
    });
    const geo = new THREE.PlaneGeometry(bd.w, bd.h);
    const uv = geo.attributes.uv;
    for (let i = 0; i < uv.count; i++)
      uv.setXY(
        i,
        rc[0] + (rc[2] - rc[0]) * uv.getX(i),
        rc[1] + (rc[3] - rc[1]) * uv.getY(i),
      );
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.set(
      bd.pos[0] + ctx.O.x,
      bd.pos[1] + ctx.O.y,
      bd.pos[2] + ctx.O.z,
    );
    mesh.rotation.y = Math.atan2(bd.n[0], bd.n[1]);
    mesh.name = "ppn_backdrop";
    (ctx.intRoot || ctx.extRoot).add(mesh);
    return mesh;
  };

  // ------------------------------------------------------------------
  // Atlas painters
  // ------------------------------------------------------------------
  /** Bald eagle roundel (postal seal / hotel crest style), transparent corners. */
