// play-inline-446 03 — color
// Lines 686-1002 of readable/play-inline-446.pretty.js (statement-aligned).
  D("army_checkpoint", (k, r, v) => {
    v = v % 2;
    const OL = pick(r, OLIVES);
    const ol = { color: OL, rust: 0.45, grime: 0.4 };
    const mp = {
      color: pick(r, [0xcfc8b2, 0xc4bea8, 0xd6cfb8]),
      rust: 0.4,
      grime: 0.45,
    }; // MP white upper works
    const dark = { color: 0x22231e, rust: 0.5, grime: 0.3 };
    // booth: olive corrugated lower walls, white-painted window band & header, overhanging roof
    const W = 1.7,
      H = 2.5;
    k.box("concrete", W + 0.3, 0.15, W + 0.3, 0, 0.075, 0, {
      color: 0x9a968a,
      grime: 0.45,
    });
    for (const [x, z, ry] of [
      [0, -W / 2, 0],
      [0, W / 2, PI],
      [-W / 2, 0, PI / 2],
      [W / 2, 0, -PI / 2],
    ]) {
      const s = new X.Kit(47);
      s.box(
        "metal",
        W,
        1.0,
        0.05,
        0,
        0.65,
        0,
        Object.assign({ segs: [8, 1, 1] }, ol),
      ); // lower panel
      for (let i = 0; i < 9; i++)
        s.box("metal", 0.035, 1.0, 0.07, -W / 2 + 0.1 + i * 0.19, 0.65, 0, ol); // corrugation ribs
      s.box("metal", W, 0.35, 0.05, 0, H - 0.25, 0, mp); // header
      s.box("metal", W, 0.06, 0.08, 0, 1.17, 0, mp); // sill
      const broken = ry === PI / 2 && v === 1;
      if (ry !== PI)
        s.box(broken ? "plain" : "glass", W - 0.2, 0.9, 0.02, 0, 1.62, 0, {
          color: broken ? 0x0c0b0a : 0x2a3432,
          ao: [1, 1],
        });
      else s.box("metal", W, 0.9, 0.05, 0, 1.62, 0, mp);
      for (const e of [-1, 1])
        s.box(
          "metal",
          0.07,
          H - 0.1,
          0.07,
          e * (W / 2 - 0.03),
          (H - 0.1) / 2 + 0.15,
          0,
          mp,
        );
      k.include(s, { x, z, ry });
    }
    k.box(
      "metal",
      W + 0.5,
      0.08,
      W + 0.5,
      0,
      H + 0.04,
      0,
      Object.assign({ rz: 0.02 }, mp),
    ); // roof
    k.box("metal", W + 0.52, 0.1, 0.04, 0, H - 0.01, -W / 2 - 0.25, {
      color: 0xa82418,
      rust: 0.35,
      grime: 0.4,
    }); // red fascia
    k.box("plain", W - 0.1, 0.02, W - 0.1, 0, 0.16, 0, {
      color: 0x121110,
      ao: [1, 1],
    }); // dark floor
    k.box("wood", 1.2, 0.05, 0.4, 0, 1.05, -0.55, {
      color: 0x4a3e30,
      grime: 0.5,
    }); // counter inside
    // CHECKPOINT board over the window, facing the traffic; a stencilled plate on the side
    k.quad("checkpoint_sign", 1.5, 0.75, 0, H + 0.48, -W / 2 - 0.06, {
      ry: PI,
      grime: 0.3,
    });
    k.box("metal", 1.56, 0.8, 0.04, 0, H + 0.48, -W / 2 - 0.02, dark);
    k.quad("army_door", 1.2, 0.3, W / 2 + 0.03, 0.8, 0, {
      mat: "trim",
      ry: PI / 2,
      grime: 0.35,
    });
    // roof searchlight
    k.cyl("metal", 0.05, 0.05, 0.3, -0.5, H + 0.23, 0.4, {
      seg: 6,
      color: 0x2a2a26,
    });
    k.cyl("metal", 0.2, 0.2, 0.34, -0.5, H + 0.46, 0.4, {
      rx: PI / 2 - 0.35,
      ry: 0.6,
      seg: 10,
      color: OL,
      rust: 0.5,
    });
    k.cyl("glass", 0.17, 0.17, 0.02, -0.5 - 0.1, H + 0.53, 0.25, {
      rx: PI / 2 - 0.35,
      ry: 0.6,
      seg: 10,
      color: 0x8a948c,
    });
    // sandbag skirt along the traffic side
    for (let row = 0; row < 2; row++)
      for (let i = 0; i < 4; i++)
        sandbag(
          k,
          r,
          -0.8 + i * 0.52 + (row % 2) * 0.26,
          row * 0.18,
          -W / 2 - 0.45,
          0,
          false,
        );
    // boom barrier: pedestal with counterweight, striped arm over the lane
    const px = W / 2 + 0.55,
      py = 1.0,
      AL = 3.8;
    k.box("metal", 0.34, 1.0, 0.34, px, 0.5, -0.2, {
      color: 0xc8b048,
      rust: 0.5,
      grime: 0.4,
    });
    k.box("concrete", 0.6, 0.12, 0.6, px, 0.06, -0.2, { color: 0x9a968a });
    const armStripes = (s, len, o) => {
      const n = Math.round(len / 0.5);
      for (let i = 0; i < n; i++)
        s.box(
          "metal",
          len / n,
          0.1,
          0.08,
          -len / 2 + ((i + 0.5) * len) / n,
          0,
          0,
          Object.assign(
            { color: i % 2 ? 0xd8d0c0 : 0xa82418, rust: 0.3, grime: 0.35 },
            o || {},
          ),
        );
    };
    const cw = new X.Kit(49);
    if (v === 0) {
      k.box("metal", 0.5, 0.26, 0.2, px - 0.45, py, -0.2, dark); // counterweight
      armStripes(cw, AL, {});
      cw.box("metal", 0.08, 0.06, 0.1, AL / 2, -0.05, 0, dark);
      k.include(cw, { x: px + AL / 2 - 0.2, y: py, z: -0.2, rz: -0.02 });
      // the rest post the arm drops onto
      k.box("metal", 0.1, 0.9, 0.1, px + AL - 0.1, 0.45, -0.2, {
        color: 0xc8b048,
        rust: 0.5,
      });
    } else {
      // snapped: the stub still up at 70°, the arm lying across the lane
      const stub = new X.Kit(51);
      armStripes(stub, 1.3, {});
      stub.box("metal", 0.5, 0.26, 0.2, -0.9, 0, 0, dark);
      k.include(stub, { x: px + 0.22, y: py + 0.62, z: -0.2, rz: 1.2 });
      const arm = new X.Kit(53);
      armStripes(arm, AL - 1.4, {});
      k.include(arm, {
        x: px + 2.4,
        y: 0.06,
        z: -0.5 + (r() - 0.5) * 0.4,
        ry: 0.25,
        rx: 0.02,
      });
    }
    k.meta.collider = { w: W + 0.3, d: W + 0.3, h: H + 0.1 };
    k.meta.surface = "metal";
    k.meta.tier = "medium";
    k.meta.container = { name: "Checkpoint Footlocker", loot: "ammo_box" };
    k.meta.interactY = 1.1;
    k.meta.interactZ = -W / 2 - 0.2; // searched through the front window, over the counter
    k.meta.glows = [];
  });

  // ------------------------------------------------------------------
  // MACHINE-GUN NEST: horseshoe of sandbags opening toward +Z (behind),
  // the gun on its tripod over the parapet facing -Z.
  // ------------------------------------------------------------------
  D("mg_nest", (k, r, v) => {
    v = v % 2;
    const R = 1.45;
    for (let row = 0; row < 3; row++) {
      const n = 7;
      for (let i = 0; i < n; i++) {
        const a = -PI * 0.62 + ((i + (row % 2) * 0.5) / (n - 1)) * PI * 1.24;
        if (v === 1 && row === 2 && i === 2) continue; // shot-out gap
        sandbag(k, r, Math.sin(a) * R, row * 0.17, -Math.cos(a) * R, -a, false);
      }
    }
    // tripod + gun over the front parapet
    const g = { color: 0x2a2a28, rust: 0.5, grime: 0.3 };
    for (const a of [0, 2.1, -2.1])
      k.seg(
        "metal",
        [0, 0.72, -0.6],
        [Math.sin(a) * 0.55, 0.02, -0.6 + Math.cos(a) * 0.5],
        0.02,
        g,
      );
    if (v === 0) heavyMG(k, 0, 0.82, -0.75, (r() - 0.5) * 0.5, -0.06, false);
    else heavyMG(k, 0.3, 0.12, 0.2, 1.4, 0, false); // knocked off its mount
    // ammo cans, spent brass, a helmet
    for (let i = 0; i < 3; i++)
      k.box(
        "metal",
        0.28,
        0.18,
        0.14,
        -0.6 + i * 0.32,
        0.09,
        0.35 + (r() - 0.5) * 0.2,
        { ry: (r() - 0.5) * 0.6, color: 0x3a4028, rust: 0.45 },
      );
    for (let i = 0; i < 14; i++)
      k.cyl(
        "chrome",
        0.012,
        0.012,
        0.1,
        (r() - 0.5) * 1.4,
        0.015,
        (r() - 0.3) * 1.2,
        { rz: PI / 2, ry: r() * 6, seg: 4, color: 0x9a7a3a },
      );
    k.sphere("metal", 0.15, 0.55, 0.05, 0.1, {
      phiLength: PI / 2,
      wseg: 8,
      hseg: 4,
      color: 0x3e4430,
      rust: 0.4,
      rx: 0.3 + PI,
    });
    k.meta.colliders = [
      { w: 1.2, d: 0.6, h: 0.55, cz: -R + 0.2 },
      { w: 0.6, d: 1.4, h: 0.55, cx: -R + 0.25, cz: -0.3 },
      { w: 0.6, d: 1.4, h: 0.55, cx: R - 0.25, cz: -0.3 },
    ];
    k.meta.surface = "dirt";
    k.meta.tier = "medium";
    k.meta.container = { name: "Ammo Can", loot: "ammo_box" };
    k.meta.interactY = 0.2;
  });

  // ------------------------------------------------------------------
  // SEARCHLIGHT on a tripod (v0 standing, aimed skyward; v1 knocked over).
  // ------------------------------------------------------------------
  D("searchlight", (k, r, v) => {
    v = v % 2;
    const OL = pick(r, OLIVES);
    const s = new X.Kit(55);
    const g = { color: 0x2a2a26, rust: 0.55, grime: 0.3 };
    for (const a of [0, 2.1, -2.1])
      s.seg(
        "metal",
        [0, 1.3, 0],
        [Math.sin(a) * 0.7, 0, Math.cos(a) * 0.7],
        0.03,
        g,
      );
    s.cyl("metal", 0.06, 0.06, 0.3, 0, 1.42, 0, { seg: 8, color: 0x2a2a26 });
    s.torus("metal", 0.4, 0.03, 0, 1.9, 0, {
      arc: PI,
      rseg: 4,
      tseg: 8,
      color: 0x2a2a26,
      rz: PI,
    }); // yoke
    const lamp = new X.Kit(57);
    lamp.cyl("metal", 0.36, 0.3, 0.6, 0, 0, 0, {
      rx: PI / 2,
      seg: 14,
      color: OL,
      rust: 0.45,
      grime: 0.35,
    });
    lamp.cyl("metal", 0.38, 0.38, 0.06, 0, 0, -0.3, {
      rx: PI / 2,
      seg: 14,
      color: 0x2a2a26,
    });
    lamp.cyl(v === 1 ? "plain" : "glass", 0.33, 0.33, 0.02, 0, 0, -0.33, {
      rx: PI / 2,
      seg: 14,
      color: v === 1 ? 0x0c0b0a : 0x9aa8a8,
    });
    lamp.box("metal", 0.3, 0.14, 0.12, 0, 0.3, 0.1, g);
    s.include(lamp, { y: 1.9, rx: 0.55 });
    if (v === 0) k.include(s);
    else {
      k.include(s, { y: 0.3, rz: PI / 2 - 0.15, x: 1.1 });
      for (let i = 0; i < 6; i++)
        k.box(
          "glass",
          0.08 + r() * 0.1,
          0.01,
          0.06 + r() * 0.08,
          2.4 + (r() - 0.5) * 0.8,
          0.01,
          (r() - 0.5) * 0.8,
          { ry: r() * 3, color: 0x9aa8a8 },
        );
    }
    k.meta.collider = v === 0 ? { w: 0.8, d: 0.8, h: 2.1 } : null;
    k.meta.surface = "metal";
    k.meta.tier = "medium";
  });
