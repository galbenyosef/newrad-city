// play-inline-315 06 — ctx
// Lines 3326-3656 of readable/play-inline-315.pretty.js (statement-aligned).
  function coil(b, cx, cz, r) {
    b.cyl("bakelite", cx, 0, cz, 1.7, 1.6, 0.5, 18, {
      tint: [0.35, 0.22, 0.14],
    });
    b.cyl("black_iron", cx, 0.5, cz, 1.62, 1.62, 0.05, 18);
    for (let k = 0; k < 5; k++)
      b.cyl(
        "copper",
        cx,
        0.56 + k * 0.035,
        cz,
        0.7 + k * 0.18,
        0.7 + k * 0.18,
        0.03,
        20,
        { top: false, tint: [0.85, 0.55, 0.32] },
      );
    const h = COIL_TOP - 0.9;
    for (let k = 0; k < 28; k++)
      b.cyl("copper", cx, 0.6 + (k * h) / 28, cz, 0.42, 0.42, h / 28, 14, {
        top: false,
        tint: k % 2 ? [0.95, 0.62, 0.36] : [0.72, 0.44, 0.24],
      });
    b.cyl("steel", cx, COIL_TOP - 0.3, cz, 0.44, 0.2, 0.3, 12);
    b.geo("steel", new THREE.TorusGeometry(1.25, 0.4, 10, 28), {
      x: cx,
      y: COIL_TOP,
      z: cz,
      rx: HP,
      tint: [0.78, 0.8, 0.84],
    });
    b.col(cx - 1.7, 0, cz - 1.7, cx + 1.7, COIL_TOP + 0.4, cz + 1.7, {});
    void r;
  }

  // ---- the secret wardrobe (separate lit group so it can slide) ----
  function buildWardrobe(ctx) {
    const O = ctx.O;
    const b = K.builder({
      name: "ny_wardrobe",
      off: { x: 0, y: 0, z: 0 },
      lit: true,
      amb: [0.18, 0.16, 0.14],
      grime: 0.3,
    });
    b.boxMM("mahogany", -0.8, 0, -0.33, 0.8, 2.3, 0.33, {
      tint: [0.5, 0.3, 0.2],
    });
    b.boxMM("mahogany", -0.86, 2.3, -0.38, 0.86, 2.42, 0.38, {
      tint: [0.45, 0.28, 0.18],
    });
    b.boxMM("gold", -0.03, 0.2, 0.33, 0.03, 2.1, 0.35, {
      tint: [0.6, 0.45, 0.25],
    });
    for (const x of [-0.15, 0.15])
      b.cyl("brass", x, 1.15, 0.36, 0.025, 0.025, 0.08, 6);
    b.plate("glass", -0.4, 1.4, 0.34, 0, 1, 0.55, 1.2, null, {
      tint: [0.5, 0.52, 0.55],
    });
    const g = b.finish(null);
    g.position.set(O.x - 2, O.y, O.z + 70.45);
    ctx.intRoot.add(g);
    ctx.dyn.wardrobe = { obj: g, base: g.position.x, open: 0, target: 0 };
    ctx.dyn.wardrobeCol = G.world.addBox(
      O.x - 2.8,
      O.y,
      O.z + 70.1,
      O.x - 1.2,
      O.y + 2.4,
      O.z + 70.8,
      { tag: "ph_wardrobe" },
    );
    ctx.dyn.wardrobeInt = G.world.addInteractable({
      pos: new THREE.Vector3(O.x - 2, O.y + 1.3, O.z + 70.9),
      radius: 1.0,
      label: "Wardrobe",
      priority: 0.5,
      verb: () => (PH.flag("ny_wardrobe") ? "Examine" : "Search"),
      enabled: () => !PH.flag("ny_wardrobe") && ctx.inside,
      onInteract() {
        openWardrobe(ctx, false);
      },
    });
  }
  function openWardrobe(ctx, instant) {
    if (!PH.flag("ny_wardrobe")) {
      PH.setFlag("ny_wardrobe", true);
      K.notify(
        "The back of the wardrobe gives way. There is a room behind it — and it is humming.",
      );
      K.sfx("door_open", ctx.dyn.wardrobe.obj.position, { pitch: 0.6 });
      K.xp(40, "Found Tesla's laboratory");
      PH.nyQuestTo("lab");
    }
    const w = ctx.dyn.wardrobe;
    w.target = 1;
    if (instant) {
      w.open = 1;
      w.obj.position.x = w.base + 1.35;
    }
    if (ctx.dyn.wardrobeCol) {
      G.world.removeCollider(ctx.dyn.wardrobeCol);
      ctx.dyn.wardrobeCol = null;
    }
    const O = ctx.O;
    if (!ctx.dyn.wardrobeCol2)
      ctx.dyn.wardrobeCol2 = G.world.addBox(
        O.x - 1.45,
        O.y,
        O.z + 70.1,
        O.x + 0.15,
        O.y + 2.4,
        O.z + 70.8,
        { tag: "ph_wardrobe" },
      );
  }
  function closeWardrobe(ctx) {
    const w = ctx.dyn.wardrobe;
    if (!w) return;
    w.target = 0;
    w.open = 0;
    w.obj.position.x = w.base;
    const O = ctx.O;
    if (ctx.dyn.wardrobeCol2) {
      G.world.removeCollider(ctx.dyn.wardrobeCol2);
      ctx.dyn.wardrobeCol2 = null;
    }
    if (!ctx.dyn.wardrobeCol)
      ctx.dyn.wardrobeCol = G.world.addBox(
        O.x - 2.8,
        O.y,
        O.z + 70.1,
        O.x - 1.2,
        O.y + 2.4,
        O.z + 70.8,
        { tag: "ph_wardrobe" },
      );
  }
  // ---- the Faraday cage gate ----
  function buildCageGate(ctx) {
    const O = ctx.O;
    const b = K.builder({
      name: "ny_gate",
      lit: true,
      amb: [0.3, 0.32, 0.4],
      grime: 0.2,
    });
    for (let x = -0.95; x <= 0.96; x += 0.3)
      b.pipe("steel", x, 0, 0, x, 3.6, 0, 0.022, 4, {
        tint: [0.6, 0.62, 0.64],
      });
    for (const y of [0.05, 1.2, 2.4, 3.55])
      b.beam("steel", -1.0, y, 0, 1.0, y, 0, 0.06, 0.06, {
        tint: [0.6, 0.62, 0.64],
      });
    b.plate(
      "art",
      0,
      1.6,
      0.03,
      0,
      1,
      0.8,
      0.4,
      K.signCell("ny_cage_lock", "INTERLOCK — COILS LIVE", 256, 128, {
        bg: "#8a1a10",
        fg: "#f0e0c0",
        font: "Arial Black, sans-serif",
      }),
    );
    const g = b.finish(null);
    g.position.set(O.x, O.y, O.z + CAGE.z1);
    ctx.intRoot.add(g);
    ctx.dyn.gate = { obj: g, open: 0, target: 0 };
    ctx.dyn.gateCol = G.world.addBox(
      O.x - 1.0,
      O.y,
      O.z + CAGE.z1 - 0.06,
      O.x + 1.0,
      O.y + 3.7,
      O.z + CAGE.z1 + 0.06,
      { tag: "ph_gate", walkable: false },
    );
    G.world.addInteractable({
      pos: new THREE.Vector3(O.x, O.y + 1.4, O.z + CAGE.z1 + 0.2),
      radius: 0.9,
      label: "Faraday Cage",
      verb: "Open",
      priority: 0.4,
      enabled: () => ctx.inside && !PH.flag("ny_gate"),
      onInteract() {
        if (!PH.flag("ny_coils_off")) {
          const sci = K.skill("electronics");
          if (sci >= 70) {
            K.notify(
              "[Electronics 70] You bridge the interlock with a length of copper wire.",
            );
            setCoilsOff(ctx, true);
            openGate(ctx);
            return;
          }
          K.sfx("door_locked");
          K.notify(
            "The cage interlock won't release while the coils are live. (Control booth, or Electronics 70)",
          );
          return;
        }
        openGate(ctx);
      },
    });
  }
  function openGate(ctx) {
    PH.setFlag("ny_gate", true);
    ctx.dyn.gate.target = 1;
    if (ctx.dyn.gateCol) {
      G.world.removeCollider(ctx.dyn.gateCol);
      ctx.dyn.gateCol = null;
    }
    K.sfx("door_open", ctx.dyn.gate.obj.position, { pitch: 0.8 });
  }
  function closeGate(ctx) {
    const O = ctx.O;
    if (!ctx.dyn.gate) return;
    ctx.dyn.gate.target = 0;
    ctx.dyn.gate.open = 0;
    ctx.dyn.gate.obj.position.y = O.y;
    if (!ctx.dyn.gateCol)
      ctx.dyn.gateCol = G.world.addBox(
        O.x - 1.0,
        O.y,
        O.z + CAGE.z1 - 0.06,
        O.x + 1.0,
        O.y + 3.7,
        O.z + CAGE.z1 + 0.06,
        { tag: "ph_gate", walkable: false },
      );
  }

  // ==================================================================
  // TESLA ARCS (dynamic: two instanced meshes, core + halo)
  // ==================================================================
  const NB = 9,
    NS = 8; // bolts × segments
  function buildArcs(ctx) {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mCore = new THREE.MeshBasicMaterial({
      color: 0xd8ecff,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
      fog: false,
    });
    const mHalo = new THREE.MeshBasicMaterial({
      color: 0x4a6cff,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
      fog: false,
    });
    const core = new THREE.InstancedMesh(geo, mCore, NB * NS),
      halo = new THREE.InstancedMesh(geo, mHalo, NB * NS);
    core.frustumCulled = false;
    halo.frustumCulled = false;
    core.renderOrder = 4;
    halo.renderOrder = 4;
    core.name = "ph_arcs";
    halo.name = "ph_arcs_halo";
    const zero = new THREE.Matrix4().makeScale(0, 0, 0);
    for (let i = 0; i < NB * NS; i++) {
      core.setMatrixAt(i, zero);
      halo.setMatrixAt(i, zero);
    }
    ctx.intRoot.add(core);
    ctx.intRoot.add(halo);
    ctx.arcs = { core, halo, bolts: [], t: 0, flashT: 1, crackT: 0.5, zapT: 0 };
    for (let i = 0; i < NB; i++) ctx.arcs.bolts.push({ life: 0, pts: null });
  }
  const _m = new THREE.Matrix4(),
    _q = new THREE.Quaternion(),
    _s = new THREE.Vector3(),
    _p = new THREE.Vector3(),
    _d = new THREE.Vector3(),
    _up = new THREE.Vector3(0, 1, 0);
  function makeBolt(a, bpt, jag) {
    // midpoint displacement → NS+1 points
    const pts = [a.clone()];
    for (let i = 1; i < NS; i++) {
      const t = i / NS,
        p = a.clone().lerp(bpt, t);
      const amp = jag * Math.sin(t * PI);
      p.x += (Math.random() - 0.5) * amp;
      p.y += (Math.random() - 0.5) * amp * 0.8;
      p.z += (Math.random() - 0.5) * amp;
      pts.push(p);
    }
    pts.push(bpt.clone());
    return pts;
  }
  function writeBolt(ctx, i, pts, fade) {
    const A = ctx.arcs;
    for (let s = 0; s < NS; s++) {
      const idx = i * NS + s;
      if (!pts) {
        _m.makeScale(0, 0, 0);
        A.core.setMatrixAt(idx, _m);
        A.halo.setMatrixAt(idx, _m);
        continue;
      }
      const a = pts[s],
        c = pts[s + 1];
      _d.subVectors(c, a);
      const len = _d.length();
      if (len < 1e-4) continue;
      _d.divideScalar(len);
      _q.setFromUnitVectors(_up, _d);
      _p.addVectors(a, c).multiplyScalar(0.5);
      _s.set(0.045 * fade, len, 0.045 * fade);
      _m.compose(_p, _q, _s);
      A.core.setMatrixAt(idx, _m);
      _s.set(0.3 * fade, len, 0.3 * fade);
      _m.compose(_p, _q, _s);
      A.halo.setMatrixAt(idx, _m);
    }
  }
  function coilsLive() {
    return !PH.flag("ny_coils_off");
  }
