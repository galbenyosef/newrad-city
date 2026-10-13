// play-inline-424 05 — tint
// Lines 1103-1449 of readable/play-inline-424.pretty.js (statement-aligned).
  function fireboat(ctx, root, b) {
    const B = PA.BOAT,
      fb = K.builder({ name: "pa_boat", grime: 0.45 });
    const L = B.len,
      hb = B.beam / 2,
      DK = B.deck;
    K.hull(fb, "hull_dark", {
      cx: 0,
      cz: 0,
      len: L,
      beam: B.beam,
      deck: DK,
      keel: -2.4,
      sheer: 0.7,
      kind: "bow",
      nu: 12,
      nv: 22,
      boot: -0.2,
      bootTint: [0.55, 0.16, 0.12],
      deckMat: "deck",
      rub: "rubber",
      tint: [0.7, 0.68, 0.64],
    });
    // red sheer strake + white boot line
    for (const s of [-1, 1])
      fb.box(
        "hull_red",
        s * (hb - 0.05),
        DK - 0.45,
        -1.5,
        0.1,
        0.45,
        L * 0.72,
        { tint: [1, 0.9, 0.85] },
      );
    // bulwark rail
    for (const s of [-1, 1])
      for (let k = 0; k < 10; k++) {
        const z = -L / 2 + 1 + k * 2.2;
        fb.pipe(
          "rust",
          s * (hb - 0.25),
          DK,
          z,
          s * (hb - 0.25),
          DK + 0.9,
          z,
          0.035,
          5,
        );
      }
    for (const s of [-1, 1])
      fb.pipe(
        "fdny_red",
        s * (hb - 0.25),
        DK + 0.9,
        -L / 2 + 1,
        s * (hb - 0.25),
        DK + 0.9,
        L / 2 - 4,
        0.045,
        6,
      );
    // wheelhouse (forward) with windows all round, deckhouse aft of it
    const WZ0 = 3.2,
      WZ1 = 7.0;
    fb.boxMM("hull_red", -2.1, DK, WZ0, 2.1, DK + 2.5, WZ1, {
      tint: [0.95, 0.9, 0.85],
    });
    for (const s of [-1, 1])
      for (let k = 0; k < 3; k++)
        fb.quadN(
          k === 1 && s > 0 ? "paint_black" : "glass",
          [s * 2.12, DK + 1.35, WZ0 + 0.4 + k * 1.15],
          [s * 2.12, DK + 1.35, WZ0 + 1.3 + k * 1.15],
          [s * 2.12, DK + 2.2, WZ0 + 1.3 + k * 1.15],
          [s * 2.12, DK + 2.2, WZ0 + 0.4 + k * 1.15],
          [s, 0, 0],
          { tint: [0.28, 0.34, 0.34] },
        );
    for (let k = 0; k < 4; k++)
      fb.quadN(
        "glass",
        [-1.9 + k * 0.95, DK + 1.35, WZ1 + 0.02],
        [-1.1 + k * 0.95, DK + 1.35, WZ1 + 0.02],
        [-1.1 + k * 0.95, DK + 2.25, WZ1 + 0.02],
        [-1.9 + k * 0.95, DK + 2.25, WZ1 + 0.02],
        [0, 0, 1],
        { tint: [0.28, 0.34, 0.34] },
      );
    fb.quadN(
      "paint_black",
      [1.95, DK, WZ0 + 0.5],
      [1.95, DK, WZ0 + 1.4],
      [1.95, DK + 2.0, WZ0 + 1.4],
      [1.95, DK + 2.0, WZ0 + 0.5],
      [1, 0, 0],
      { tint: [0.03, 0.03, 0.03] },
    ); // open door (starboard)
    fb.boxMM(
      "cream_paint",
      -2.4,
      DK + 2.5,
      WZ0 - 0.2,
      2.4,
      DK + 2.7,
      WZ1 + 0.4,
      { tint: [0.85, 0.82, 0.74], faces: "nsewtb" },
    );
    fb.cyl("chrome", 0.9, DK + 2.7, WZ1 - 0.3, 0.2, 0.2, 0.35, 8);
    fb.pipe(
      "brass_old",
      -0.9,
      DK + 2.7,
      WZ1 - 0.5,
      -0.9,
      DK + 3.6,
      WZ1 - 0.5,
      0.05,
      5,
    ); // searchlight, horn
    fb.boxMM("hull_red", -1.8, DK, -4.5, 1.8, DK + 2.0, 0.5, {
      tint: [0.95, 0.9, 0.85],
    });
    for (const s of [-1, 1])
      for (let k = 0; k < 3; k++)
        fb.geo("glass", K.unitCyl(10), {
          x: s * 1.81,
          y: DK + 1.3,
          z: -3.8 + k * 1.7,
          sx: 0.22,
          sy: 0.04,
          sz: 0.22,
          rz: HP,
          tint: [0.3, 0.34, 0.34],
        }); // portholes
    // water-cannon monitor tower (lattice) + nozzles, the forward deck monitor
    K.lattice(fb, 0, -2.2, 1.2, 1.2, DK + 2.0, 5.2, {
      mat: "fdny_red",
      tint: [0.9, 0.35, 0.28],
      col: false,
      bay: 1.3,
      t: 0.1,
    });
    fb.boxMM("fdny_red", -0.9, DK + 7.2, -3.1, 0.9, DK + 7.35, -1.3, {
      tint: [0.9, 0.35, 0.28],
    });
    for (const [x, a] of [
      [-0.5, 0.4],
      [0.5, -0.3],
    ]) {
      fb.cyl("brass_old", x, DK + 7.35, -2.2, 0.12, 0.12, 0.4, 8);
      fb.pipe(
        "brass_old",
        x,
        DK + 7.65,
        -2.2,
        x + Math.sin(a) * 1.4,
        DK + 8.1,
        -2.2 + Math.cos(a) * 1.4,
        0.08,
        8,
      );
    }
    fb.cyl("brass_old", 0, DK, 9.2, 0.2, 0.2, 0.7, 8);
    fb.pipe("brass_old", 0, DK + 0.7, 9.2, 0, DK + 1.2, 10.4, 0.1, 8);
    // mast + radar + ensign
    fb.pipe("rust", 0, DK + 2.7, 5.2, 0, DK + 9.4, 5.2, 0.08, 6);
    fb.beam("rust", -1.1, DK + 7.6, 5.2, 1.1, DK + 7.6, 5.2, 0.06, 0.06);
    // stern (under water): hatch coaming, bollards
    fb.boxMM("rust", -1.1, DK, -9.5, 1.1, DK + 0.4, -7.5, {
      tint: [0.6, 0.45, 0.35],
    });
    for (const s of [-1, 1]) {
      K.bollard(fb, s * 2.2, DK, 8.8);
      K.bollard(fb, s * 2.2, DK, -10.2);
    }
    // name on the bows
    const nm = K.paint("art", "ph2_name_duggan", 1024, 96, (x, X, Y, W, Hh) => {
      x.clearRect(X, Y, W, Hh);
      x.fillStyle = "#e8e2d0";
      x.font = "bold 70px Georgia, serif";
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.fillText("PATRICK DUGGAN", X + W / 2, Y + Hh / 2 + 3);
      for (let k = 0; k < 300; k++)
        x.clearRect(X + Math.random() * W, Y + Math.random() * Hh, 3, 2);
    });
    for (const s of [-1, 1])
      fb.quadN(
        "art",
        [s * (hb * 0.72), DK - 0.25, 6.0 - s * 3.6],
        [s * (hb * 0.72), DK - 0.25, 6.0 + s * 3.6],
        [s * (hb * 0.72), DK + 0.35, 6.0 + s * 3.6],
        [s * (hb * 0.72), DK + 0.35, 6.0 - s * 3.6],
        [s, 0, 0],
        { rect: nm, grime: 0 },
      );
    // weed & algae hanging off the submerged stern
    for (let k = 0; k < 12; k++) {
      const r = K.rng("weed" + k);
      fb.quadN(
        "slime",
        [(r() - 0.5) * 5, DK - 0.2, -8 - r() * 3],
        [(r() - 0.5) * 5 + 0.3, DK - 0.2, -8 - r() * 3],
        [(r() - 0.5) * 5 + 0.2, DK - 1.4, -8 - r() * 3],
        [(r() - 0.5) * 5, DK - 1.4, -8 - r() * 3],
        [0, 0, 1],
        { tint: [0.5, 0.6, 0.4] },
      );
    }
    const g = fb.finish(null);
    // placement: outer = position + yaw (bow → east), inner = pitch (stern down) + roll (list to port/north)
    const outer = new THREE.Group();
    outer.name = "ph2_fireboat";
    outer.position.set(B.x, B.y, B.z);
    outer.rotation.y = HP;
    const inner = new THREE.Group();
    inner.rotation.set(B.pitch, 0, B.roll);
    inner.add(g);
    outer.add(inner);
    root.add(outer);
    outer.updateMatrixWorld(true);
    // walkable deck colliders: stepped boxes along the length where the deck is above water
    const P = new THREE.Vector3();
    const toWorld = (lx, ly, lz) => {
      P.set(lx, ly, lz);
      return inner.localToWorld(P.clone());
    };
    PA.boatDeck = [];
    for (let z = -6; z < 10.5; z += 1.1) {
      const w = z > 8 ? 3.2 : 5.4;
      const c = toWorld(
        0,
        DK + (z > 6 ? 0.7 * Math.pow((z - 6) / 6, 2) : 0),
        z + 0.55,
      );
      if (c.y < -0.9) continue;
      // blocks under the wheelhouse / deckhouse become walls
      const zc = z + 0.55,
        house = (zc > -4.5 && zc < 0.5) || (zc > WZ0 && zc < WZ1);
      b.col(c.x - 0.55, c.y - 1.2, c.z - w / 2, c.x + 0.55, c.y, c.z + w / 2, {
        tag: "deck",
        surface: "metal",
      });
      if (house)
        b.col(
          c.x - 0.56,
          c.y,
          c.z - (zc < WZ0 ? 1.8 : 2.1),
          c.x + 0.56,
          c.y + 2.6,
          c.z + (zc < WZ0 ? 1.8 : 2.1),
          { tag: "ship", surface: "metal", walkable: false },
        );
      PA.boatDeck.push(c);
    }
    // gangplank from the pier's north edge onto the boat, starboard side amidships-forward
    const gp0 = new THREE.Vector3(-230.6, PA.PY, PA.DZ0 + 0.2),
      gp1 = toWorld(-(hb - 0.6), DK, 1.6);
    b.beam(
      "wood_rotten",
      gp0.x,
      gp0.y + 0.05,
      gp0.z,
      gp1.x,
      gp1.y + 0.05,
      gp1.z,
      0.9,
      0.08,
      { tint: [0.6, 0.52, 0.42] },
    );
    for (const e of [-0.45, 0.45])
      b.pipe(
        "rope",
        gp0.x + e,
        gp0.y + 0.9,
        gp0.z,
        gp1.x + e,
        gp1.y + 0.9,
        gp1.z,
        0.02,
        4,
      );
    const n = 5;
    for (let k = 0; k < n; k++) {
      const t = (k + 0.5) / n,
        x = gp0.x + (gp1.x - gp0.x) * t,
        y = gp0.y + (gp1.y - gp0.y) * t,
        z = gp0.z + (gp1.z - gp0.z) * t;
      b.col(x - 0.5, y - 0.3, z - 0.45, x + 0.5, y + 0.02, z + 0.45, {
        tag: "deck",
        surface: "wood",
      });
    }
    // hull side (non-walkable) so swimmers bump into it rather than into air
    b.col(
      B.x - L / 2 + 1,
      -4,
      B.z - hb + 0.4,
      B.x + L / 2 - 1.5,
      -0.9,
      B.z + hb - 0.4,
      { tag: "ship", surface: "metal", walkable: false },
    );
    // anchors for gameplay: engine hatch (quest), wheelhouse locker, captain
    ctx.anchors.hatch = toWorld(0.7, DK + 0.4, 1.9);
    ctx.anchors.locker = toWorld(-2.4, DK, 2.75);
    ctx.anchors.boat = toWorld(0, DK, 0);
    ctx.anchors.ambush1 = new THREE.Vector3(B.x - 13, -1.4, B.z - 3.5);
    ctx.anchors.ambush2 = new THREE.Vector3(B.x - 9, -1.4, B.z - 6.5);
    // the hatch itself (lifted cover) drawn in world coords on the main builder
    const hc = ctx.anchors.hatch;
    b.boxMM(
      "rust",
      hc.x - 0.6,
      hc.y - 0.42,
      hc.z - 0.5,
      hc.x + 0.6,
      hc.y - 0.3,
      hc.z + 0.5,
      { tint: [0.55, 0.42, 0.34] },
    );
    b.boxMM(
      "paint_black",
      hc.x - 0.45,
      hc.y - 0.3,
      hc.z - 0.38,
      hc.x + 0.45,
      hc.y - 0.29,
      hc.z + 0.38,
      { tint: [0.02, 0.03, 0.03] },
    );
    b.quadN(
      "rust",
      [hc.x - 0.6, hc.y - 0.3, hc.z + 0.5],
      [hc.x + 0.6, hc.y - 0.3, hc.z + 0.5],
      [hc.x + 0.6, hc.y + 0.7, hc.z + 0.75],
      [hc.x - 0.6, hc.y + 0.7, hc.z + 0.75],
      [0, 0.25, -1],
      { tint: [0.5, 0.4, 0.32] },
    );
  }

  // ==================================================================
  // DATA
  // ==================================================================
