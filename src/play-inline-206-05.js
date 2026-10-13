// play-inline-206 05 — flag
// Lines 3044-3374 of readable/play-inline-206.pretty.js (statement-aligned).
  function tripAlarm() {
    if (PF.flag("fed_alarm")) return;
    PF.setFlag("fed_alarm", true);
    PF.sfx("cryo_alarm", null, { volume: 0.8 });
    PF.sfx("alarm", null, { volume: 0.5 });
    G.notify("ALARM! Vault security has been alerted.");
    try {
      const c = PF.cells.federal_reserve;
      for (const a of G.actors.list())
        if (
          !a.dead &&
          a.faction === "robots" &&
          Math.abs(a.pos.x - c.origin.x) < 170 &&
          Math.abs(a.pos.z - c.origin.z) < 170
        ) {
          if (a.setHostile) a.setHostile(true);
        }
    } catch (e) {
      /* ignore */
    }
    try {
      if (!PF.flag("fed_turrets_off") && PF.live("props"))
        G.props.setTurrets("pf_fed_vault", "hostile");
    } catch (e) {
      /* optional */
    }
  }
  PF.fedTripAlarm = tripAlarm;

  /** Bar gate (checkpoint) bound to a flag; opens from the security terminal or with its keypad code (opts.lock). */
  function barGate(root, x, y, z, w, h, flag, ry, opts) {
    const grp = new THREE.Group();
    const gb = PF.batch("fed_bargate_" + flag);
    const n = Math.round(w / 0.2);
    for (let i = 0; i <= n; i++)
      gb.box("iron", -w / 2 + (i * w) / n, 0, 0, 0.05, h, 0.05, {
        seg: false,
        grime: 0.2,
      });
    for (const yy of [0.15, h * 0.5, h - 0.1])
      gb.box("iron", 0, yy, 0, w, 0.08, 0.08, { seg: false });
    gb.build(grp);
    grp.position.set(x, y, z);
    grp.rotation.y = ry || 0;
    root.add(grp);
    const col = { c: null };
    const apply = () => {
      const open = !!PF.flag(flag);
      grp.position.y = y + (open ? h - 0.3 : 0);
      if (!open && !col.c)
        col.c = PF.col(x, z, w, 0.3, y, y + h, ry || 0, { walkable: false });
      if (open && col.c) {
        G.world.removeCollider(col.c);
        col.c = null;
      }
    };
    apply();
    PF.flagWatch.push((k) => {
      if (k === "*" || k === flag) apply();
    });
    PF.onReset.push(() => {
      if (col.c) {
        G.world.removeCollider(col.c);
        col.c = null;
      }
      grp.position.y = y;
      apply();
    });
    PF.use({
      pos: V3(x, y + 1.3, z),
      radius: 1.2,
      range: 2.6,
      label: opts.label,
      verb: () => (PF.flag(flag) ? "Examine" : "Open"),
      locked: () => (PF.flag(flag) ? null : "Keypad"),
      onInteract() {
        if (PF.flag(flag)) {
          G.notify("The gate is raised.");
          return;
        }
        const ok = () => {
          PF.setFlag(flag, true);
          PF.sfx("door_open", V3(x, y + 1, z));
        };
        PF.lockOpen(opts.lock, ok);
      },
    });
    return grp;
  }
  /** Simple lockable door slab (a gap with a closed leaf); stays open once unlocked. lock: G.locks spec. */
  function doorBlock(root, x, y, z, w, h, lock, label, flag) {
    PF.flagDefaults[flag] = false;
    const leaf = PF.mesh("mahogany", new THREE.BoxGeometry(w, h, 0.12));
    leaf.position.set(x, y + h / 2, z);
    root.add(leaf);
    const col = { c: null };
    const apply = () => {
      const open = !!PF.flag(flag);
      leaf.rotation.y = open ? 1.4 : 0;
      leaf.position.x = x + (open ? -w * 0.45 : 0);
      leaf.position.z = z + (open ? w * 0.45 : 0);
      if (!open && !col.c)
        col.c = PF.col(x, z, w, 0.3, y, y + h, 0, { walkable: false });
      if (open && col.c) {
        G.world.removeCollider(col.c);
        col.c = null;
      }
    };
    apply();
    PF.flagWatch.push((k) => {
      if (k === "*" || k === flag) apply();
    });
    PF.onReset.push(() => {
      if (col.c) {
        G.world.removeCollider(col.c);
        col.c = null;
      }
      apply();
    });
    PF.use({
      pos: V3(x, y + 1.2, z),
      radius: 0.9,
      range: 2.4,
      label,
      verb: () => (PF.flag(flag) ? "Close" : "Open"),
      locked: () => (PF.flag(flag) ? null : "Keypad"),
      onInteract() {
        if (PF.flag(flag)) return;
        const ok = () => {
          PF.setFlag(flag, true);
          PF.sfx("door_open", V3(x, y + 1, z));
        };
        PF.lockOpen(lock, ok);
      },
    });
  }
  /** The egress door at the top of the stairwell: bolted from the stair side. */
  function boltDoor(root, x, y, z) {
    const leaf = PF.mesh("vault_steel", new THREE.BoxGeometry(0.12, 2.5, 1.4));
    leaf.position.set(x, y + 1.25, z);
    root.add(leaf);
    const col = { c: null };
    const apply = () => {
      const open = !!PF.flag("fed_egress");
      leaf.rotation.y = open ? 1.5 : 0;
      leaf.position.x = x - (open ? 0.7 : 0);
      leaf.position.z = z + (open ? 0.7 : 0);
      if (!open && !col.c)
        col.c = PF.col(x, z, 0.3, 1.4, y, y + 2.5, 0, { walkable: false });
      if (open && col.c) {
        G.world.removeCollider(col.c);
        col.c = null;
      }
    };
    apply();
    PF.flagWatch.push((k) => {
      if (k === "*" || k === "fed_egress") apply();
    });
    PF.onReset.push(() => {
      if (col.c) {
        G.world.removeCollider(col.c);
        col.c = null;
      }
      apply();
    });
    PF.use({
      pos: V3(x, y + 1.3, z),
      radius: 0.9,
      range: 2.6,
      label: "Emergency Egress Door",
      verb: () =>
        PF.flag("fed_egress")
          ? "Examine"
          : G.player.pos.x > x
            ? "Unbolt"
            : "Open",
      locked: () =>
        !PF.flag("fed_egress") && G.player.pos.x <= x
          ? "Barred from the other side"
          : null,
      onInteract() {
        if (PF.flag("fed_egress")) {
          G.notify("The egress door is propped open. A quick way back down.");
          return;
        }
        if (G.player.pos.x > x) {
          PF.setFlag("fed_egress", true);
          PF.sfx("door_open", V3(x, y + 1, z));
          G.notify(
            "You knock the crash bar free. Daylight — well, lobby light — beyond.",
          );
        } else {
          PF.sfx("door_locked");
          G.notify("The door is barred from the stairwell side.");
        }
      },
    });
  }
  /** Elevator doors: brass art-deco frame, sliding doors, floor dial. */
  function elevatorFront(b, x, y, z, ry, label) {
    const c = Math.cos(ry),
      s = Math.sin(ry);
    const P = (lx, ly, lz) =>
      V3(x + lx * c + lz * s, y + ly, z - lx * s + lz * c);
    for (const sg of [-1, 1]) {
      const p = P(sg * 1.05, 0, 0.05);
      b.box("brass", p.x, y, p.z, 0.25, 3.0, 0.2, { ry, seg: false });
    }
    const t = P(0, 0, 0.05);
    b.box("brass", t.x, y + 2.8, t.z, 2.4, 0.35, 0.2, { ry, seg: false });
    for (const sg of [-1, 1]) {
      const p = P(sg * 0.45, 0, 0.0);
      b.box("bronze", p.x, y, p.z, 0.88, 2.78, 0.06, {
        ry,
        seg: false,
        grime: 0.4,
      });
    }
    const d = P(0, 0, 0.08);
    b.cyl("brass", d.x, y + 3.45, d.z, 0.4, 0.4, 0.06, 16, {
      hSeg: 1,
      thetaLen: PI,
      rx: HP,
      ry: ry + HP,
    });
    const pk = P(1.45, 0, 0.1);
    b.box("brass", pk.x, y + 1.2, pk.z, 0.2, 0.4, 0.06, { ry, seg: false });
    b.sphere("lamp_warm", pk.x, y + 1.3, pk.z, 0.04, { ws: 5, hs: 4 });
    void label;
  }

  // ===================================================================
  // Gold bars: instanced brick-pattern stacks in most compartments
  // ===================================================================
  function goldBars(root, comps, X, Z, y0, anchors) {
    const r = PF.rng("goldbars");
    const geo = new THREE.BoxGeometry(0.26, 0.085, 0.13);
    // trapezoid-ish bar: pinch the top face
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++)
      if (p.getY(i) > 0) {
        p.setX(i, p.getX(i) * 0.86);
        p.setZ(i, p.getZ(i) * 0.8);
      }
    geo.computeVertexNormals();
    // no env map in interiors → keep metalness moderate and push a warm emissive so the gold reads as GOLD
    const mat = new THREE.MeshStandardMaterial({
      color: 0xf0c050,
      metalness: 0.55,
      roughness: 0.32,
      emissive: 0x9a6410,
      emissiveIntensity: 0.75,
    });
    mat.userData.shared = true;
    const mats = [];
    const m4 = new THREE.Matrix4(),
      q = new THREE.Quaternion(),
      e = new THREE.Euler(),
      sc = new THREE.Vector3(1, 1, 1),
      pos = new THREE.Vector3();
    const empty = new Set([3, 9, 14, 22, 27, 35, 40, 44]);
    PF.fedEmpty = empty;
    for (const c of comps) {
      if (empty.has(c.num)) continue;
      const stacks = 1 + (r() < 0.6 ? 1 : 0);
      for (let s = 0; s < stacks; s++) {
        const cx = (c.xa + c.xb) / 2 + (c.dir > 0 ? -0.5 : 0.5) * 0.6,
          cz = c.zc + (stacks === 2 ? (s ? 0.75 : -0.75) : 0);
        const layers = 4 + Math.floor(r() * 5);
        for (let L = 0; L < layers; L++) {
          const alongZ = L % 2 === 1;
          const nx = alongZ ? 7 : 4,
            nz = alongZ ? 4 : 8;
          for (let i = 0; i < nx; i++)
            for (let k = 0; k < nz; k++) {
              if (L === layers - 1 && r() < 0.35) continue;
              pos.set(
                X(cx + (i - (nx - 1) / 2) * (alongZ ? 0.14 : 0.27)),
                y0 + 0.2 + L * 0.086 + 0.0425,
                Z(cz + (k - (nz - 1) / 2) * (alongZ ? 0.27 : 0.14)),
              );
              e.set(0, alongZ ? HP : 0, 0);
              q.setFromEuler(e);
              mats.push(new THREE.Matrix4().compose(pos, q, sc));
            }
        }
        // pallet under the stack
      }
    }
    // loose bars on the carts, the scales and the counting table
    for (const [x, z, n] of [
      [8, -65.6, 20],
      [4.5, -66, 14],
    ])
      for (let i = 0; i < n; i++) {
        pos.set(
          X(x + ((i % 5) - 2) * 0.28),
          y0 + 0.45 + Math.floor(i / 10) * 0.086,
          Z(z + ((Math.floor(i / 5) % 2) - 0.5) * 0.15),
        );
        e.set(0, 0, 0);
        q.setFromEuler(e);
        mats.push(new THREE.Matrix4().compose(pos, q, sc));
      }
    const im = new THREE.InstancedMesh(geo, mat, mats.length);
    for (let i = 0; i < mats.length; i++) im.setMatrixAt(i, mats[i]);
    im.instanceMatrix.needsUpdate = true;
    im.castShadow = false;
    im.receiveShadow = true;
    im.computeBoundingSphere && im.computeBoundingSphere();
    im.frustumCulled = false;
    im.name = "pf_fed_goldbars";
    root.add(im);
    // pallets (one merged batch)
    const pb = PF.batch("fed_pallets");
    for (const c of comps) {
      if (empty.has(c.num)) continue;
      const cx = (c.xa + c.xb) / 2 + (c.dir > 0 ? -0.3 : 0.3);
      pb.box("oak", X(cx), y0, Z(c.zc), 1.4, 0.2, 2.8, {
        seg: false,
        grime: 0.5,
      });
    }
    pb.build(root, { noLOD: true });
    PF.fedBarCount = mats.length;
    void anchors;
  }

  // ===================================================================
  // The 90-ton rotating cylinder door
  // ===================================================================
