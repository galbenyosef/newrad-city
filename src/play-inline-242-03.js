// play-inline-242 03 — math
// Lines 370-651 of readable/play-inline-242.pretty.js (statement-aligned).
  function buildGreenery(b, avoid) {
    const r = PR.rng("pr_trees");
    let n = 0;
    for (let k = 0; k < 400 && n < 34; k++) {
      const x = I.x0 + 6 + r() * (I.x1 - I.x0 - 12),
        z = I.z0 + 16 + r() * (I.z1 - I.z0 - 24);
      if (avoid.some((a) => x > a[0] && x < a[1] && z > a[2] && z < a[3]))
        continue;
      if (Math.abs(x - 406) < 3 && z > -640) continue; // spine path
      const h = 5 + r() * 5;
      PR.deadTree(b, x, 0, z, h, 911 + k);
      PR.col(x, z, 0.55, 0.55, 0, h * 0.5, 0, {
        walkable: false,
        surface: "wood",
      });
      // leaf litter / root flare
      const c = new THREE.CircleGeometry(1.4 + r(), 10);
      c.rotateX(-HP);
      b.add("leaf_dead", c, { m: PR.m4(x, 0.02, z), grime: 0.4 });
      n++;
    }
    // dead-grass tufts, weeds and stones scattered over the lawns
    const tr = PR.rng("pr_tufts");
    for (let k = 0; k < 420; k++) {
      const x = I.x0 + 5 + tr() * (I.x1 - I.x0 - 10),
        z = I.z0 + 6 + tr() * (I.z1 - I.z0 - 12);
      if (avoid.some((a) => x > a[0] && x < a[1] && z > a[2] && z < a[3]))
        continue;
      if (tr() < 0.8) {
        const h = 0.25 + tr() * 0.45,
          n = 3 + ((tr() * 3) | 0);
        for (let q = 0; q < n; q++) {
          const a = tr() * TAU;
          b.add(
            tr() < 0.5 ? "straw" : "leaf_dead",
            new THREE.ConeGeometry(0.035, h * (0.6 + tr() * 0.6), 3),
            {
              m: PR.m4(
                x + Math.cos(a) * 0.12,
                h * 0.3,
                z + Math.sin(a) * 0.12,
                a,
                (tr() - 0.5) * 0.7,
                (tr() - 0.5) * 0.7,
              ),
              grime: 0.2,
              noAO: true,
            },
          );
        }
      } else
        b.rock("rock", x, -0.05, z, 0.12 + tr() * 0.25, {
          flat: 0.6,
          detail: 0,
          seed: k,
        });
    }
    // lamp posts along the west promenade (Victorian cast iron), benches between
    let li = 0;
    for (let z = I.z0 + 22; z < I.z1 - 10; z += 28) {
      const lit = li % 4 === 1;
      PR.lampPost(b, I.x0 + 3.7, 0.03, z, lit);
      PR.col(I.x0 + 3.7, z, 0.35, 0.35, 0, 4, 0, {
        walkable: false,
        surface: "metal",
      });
      if (Math.abs(z - DOCK.z) > 8) PR.bench(b, I.x0 + 3.2, 0.03, z + 12, -HP);
      li++;
    }
    for (let z = I.z0 + 36; z < I.z1 - 10; z += 34) {
      PR.lampPost(b, I.x1 - 3.7, 0.03, z, false);
      PR.col(I.x1 - 3.7, z, 0.35, 0.35, 0, 4, 0, { walkable: false });
    }
  }

  // ===================================================================
  // LIGHTHOUSE + KEEPER'S CAMP
  // ===================================================================
  function buildLighthouse(b, anchors) {
    const x = LH.x,
      z = LH.z;
    // rock plinth
    b.rock("rock", x, -0.6, z, 4.2, { flat: 0.35, seed: 71, grime: 0.6 });
    b.cyl("gneiss_dk", x, 0, z, 3.0, 3.3, 0.9, 8, {
      hSeg: 1,
      thetaStart: PI / 8,
    });
    // octagonal tapering shaft of rough-cut gneiss
    for (let y = 0.9, i = 0; y < 13.2; y += 2.05, i++) {
      const t0 = (y - 0.9) / 12.3,
        t1 = Math.min(1, (y + 2.05 - 0.9) / 12.3);
      const r0 = 2.55 - t0 * 0.75,
        r1 = 2.55 - t1 * 0.75;
      b.cyl("gneiss", x, y, z, r1, r0, Math.min(2.05, 13.2 - y), 8, {
        hSeg: 1,
        thetaStart: PI / 8,
        grime: 0.55,
      });
    }
    // corner quoins (lighter dressed stone)
    for (let k = 0; k < 8; k++) {
      const a = PI / 8 + (k * PI) / 4;
      for (let y = 1.0, j = 0; y < 13; y += 0.55, j++) {
        const rr = 2.55 - ((y - 0.9) / 12.3) * 0.75 + 0.02;
        b.box(
          "limestone",
          x + Math.cos(a) * rr,
          y,
          z + Math.sin(a) * rr,
          j % 2 ? 0.55 : 0.35,
          0.5,
          0.3,
          { ry: -a + HP, seg: false, grime: 0.4 },
        );
      }
    }
    // Gothic doorway (south) with a pointed hood and lancet slits up the shaft
    const dz = z + 2.42;
    PR.lancetWindow(b, x, 0.9, dz + 0.02, 0, 1.1, 2.4, {
      glass: "glass_broken",
      frame: "limestone",
      frameW: 0.2,
      sill: false,
    });
    b.box("oak", x + 0.3, 0.9, dz - 0.3, 0.08, 2.0, 0.9, {
      ry: 0.9,
      seg: false,
    }); // door hanging open
    for (let i = 0; i < 4; i++) {
      const a = [HP, -HP, 0, PI][i] + (i % 2) * 0.4,
        y = 3.4 + i * 2.3;
      const rr = (2.55 - ((y - 0.9) / 12.3) * 0.75) * 0.924;
      const wx = x + Math.sin(a) * (rr + 0.03),
        wz = z + Math.cos(a) * (rr + 0.03);
      PR.lancetWindow(b, wx, y, wz, a, 0.35, 1.0, {
        glass: "glass_broken",
        frame: "limestone",
        frameW: 0.1,
        sill: false,
      });
    }
    // corbelled gallery
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * TAU;
      b.box(
        "limestone",
        x + Math.cos(a) * 1.9,
        12.6,
        z + Math.sin(a) * 1.9,
        0.3,
        0.6,
        0.55,
        { ry: -a + HP, seg: false },
      );
    }
    b.cyl("granite", x, 13.2, z, 2.45, 2.2, 0.3, 8, {
      hSeg: 1,
      thetaStart: PI / 8,
    });
    const rail = [];
    for (let k = 0; k <= 8; k++) {
      const a = PI / 8 + (k * PI) / 4;
      rail.push([x + Math.cos(a) * 2.3, z + Math.sin(a) * 2.3]);
    }
    PR.railing(b, rail, 13.5, 0.95, "iron", { postStep: 0.6 });
    // lantern room: 8 iron mullions, cracked glazing, the lamp, domed cap + ventilator ball
    b.cyl("iron", x, 13.5, z, 1.45, 1.45, 0.6, 8, {
      hSeg: 1,
      thetaStart: PI / 8,
    });
    b.cyl("glass_dark", x, 14.1, z, 1.35, 1.35, 1.9, 8, {
      hSeg: 1,
      thetaStart: PI / 8,
      open: true,
    });
    for (let k = 0; k < 8; k++) {
      const a = PI / 8 + (k * PI) / 4;
      b.box(
        "iron",
        x + Math.cos(a) * 1.4,
        14.1,
        z + Math.sin(a) * 1.4,
        0.08,
        1.9,
        0.08,
        { ry: -a, seg: false },
      );
    }
    b.cyl("brass", x, 14.1, z, 0.35, 0.45, 0.5, 8, { hSeg: 1 });
    b.sphere("beacon", x, 14.95, z, 0.42, { ws: 10, hs: 8 });
    b.lathe(
      "iron",
      [
        [1.6, 0],
        [1.5, 0.35],
        [1.1, 0.9],
        [0.5, 1.3],
        [0.2, 1.45],
        [0.01, 1.5],
      ],
      8,
      x,
      16.0,
      z,
      { phiStart: PI / 8 },
    );
    b.sphere("iron", x, 17.6, z, 0.22, {});
    b.beam("iron", V3(x, 17.7, z), V3(x, 18.8, z), 0.04, 0.04);
    b.box("iron", x, 18.5, z, 0.7, 0.06, 0.04, { ry: 0.6, seg: false }); // weather vane
    PR.col(x, z, 5.2, 5.2, 0, 13.4, 0, { walkable: false });
    // inscription tablet
    const tabK = PR.texMat(
      "pr_lh_tab",
      PR.signTex(
        "pr_lh_tab",
        [
          "BLACKWELL ISLAND LIGHT",
          "ERECTED 1872",
          "RAISED FROM THE BOTTOM TO THE TOP",
          "BY ONE WHO WAS NOT WELL",
        ],
        "engraved",
        512,
        256,
      ),
      { rough: 0.9 },
    );
    b.box("gneiss_dk", x - 2.6, 0, z + 3.9, 1.5, 1.1, 0.4, {
      seg: false,
      ry: 0.3,
    });
    PR.col(x - 2.6, z + 3.9, 1.5, 0.4, 0, 1.1, 0.3, { walkable: false });
    b.quad(
      tabK,
      x - 2.6 + Math.sin(0.3) * 0.21,
      0.62,
      z + 3.9 + Math.cos(0.3) * 0.21,
      1.3,
      0.65,
      { ry: 0.3, rx: -0.15 },
    );
    PR.readable(
      V3(x - 2.6, 0.9, z + 4.2),
      "Weathered Tablet",
      'The tablet says a patient of the asylum, John McCarthy, raised this light "from the bottom to the top" and asks all who pass to pray for his soul. Someone has scratched underneath: "STILL HERE. — MAC"',
    );
    // rotating beam at night (additive) — animated in update
    const beamGroup = new THREE.Group();
    beamGroup.position.set(x, 14.95, z);
    const bm = new THREE.MeshBasicMaterial({
      color: 0xfff2c0,
      transparent: true,
      opacity: 0.1,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
      fog: true,
    });
    for (const sgn of [1, -1]) {
      const cone = new THREE.CylinderGeometry(0.3, 5.5, 70, 12, 1, true);
      cone.rotateZ(sgn * HP);
      cone.translate(sgn * 35, 0, 0);
      const m = new THREE.Mesh(cone, bm);
      m.renderOrder = 6;
      beamGroup.add(m);
    }
    beamGroup.visible = false;
    PR.root.add(beamGroup);
    PR.animate(V3(x, 15, z), 1400, (t) => {
      const night = PR.isNight();
      beamGroup.visible = night && !!PR.flag("beacon_lit");
      if (beamGroup.visible) beamGroup.rotation.y = t * 0.6;
    });
    PR.flagDefaults.beacon_lit = true;
    anchors.lighthouse = PR.anchor(x, 0, z + 3.2, 0);
    anchors.lighthouse_top = PR.anchor(x, 13.5, z, 0);
    PR.glow(V3(x, 14.95, z), 0xfff0b0, 3.4, null, {
      intensity: 1.3,
      flicker: 0.05,
    });
  }

