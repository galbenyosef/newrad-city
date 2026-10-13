// play-inline-129 02 — rec
// Lines 19-265 of readable/play-inline-129.pretty.js (statement-aligned).
  const K = G.LMA.kit;

  K.defineInterior("sterlings:paints", function () {
    // (slot key 'sterlings_blackfri' kept: it is the Spring Preview banner now)
    K.paint("sterlings_sale", 256, 128, (x, W, H) => {
      x.fillStyle = "#e8e0cc";
      x.fillRect(0, 0, W, H);
      x.fillStyle = "#c0161e";
      x.font = 'bold 60px "Arial Black", Impact, sans-serif';
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.fillText("SALE", W / 2, H * 0.42);
      x.font = "bold 24px Georgia, serif";
      x.fillText("EVERYTHING MUST GO", W / 2, H * 0.82);
      K.stains(x, W, H, 6, 71, 0.4);
    });
    K.paint("sterlings_blackfri", 512, 128, (x, W, H) => {
      x.fillStyle = "#141414";
      x.fillRect(0, 0, W, H);
      x.fillStyle = "#f0e0b0";
      x.font = 'bold 54px "Arial Black", sans-serif';
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.fillText("SPRING PREVIEW", W / 2, H * 0.4);
      x.font = "bold 24px monospace";
      x.fillStyle = "#d0161e";
      x.fillText("SUN. MAR. 5, 1967 — DOORS AT 4 A.M.", W / 2, H * 0.8);
      K.stains(x, W, H, 6, 72, 0.4);
    });
  });

  K.defineInterior("sterlings", function (ctx) {
    const { rec, b, d, glows, green, P, LIME, mannequin, Z, R, PI, BLD, FL } =
      ctx;
    // ---- sales floor ----
    b.boxMM("marble", FL.x0, -0.2, FL.z0, FL.x1, 0.04, FL.z1, {
      faces: "t",
      tint: 0xb8ae98,
      grime: 0.6,
    });
    b.boxMM("plaster", FL.x0, 0, FL.z1 - 0.02, FL.x1, FL.h, FL.z1, {
      faces: "n",
      tint: 0xc8b8a0,
      grime: 0.6,
    });
    b.boxMM("plaster", FL.x0, 0, FL.z0, FL.x0 + 0.02, FL.h, FL.z1, {
      faces: "e",
      tint: 0xc8b8a0,
      grime: 0.6,
    });
    b.boxMM("plaster", FL.x1 - 0.02, 0, FL.z0, FL.x1, FL.h, FL.z1, {
      faces: "w",
      tint: 0xc8b8a0,
      grime: 0.6,
    });
    b.boxMM("plaster", FL.x0, FL.h - 0.1, BLD.z0, FL.x1, FL.h, FL.z1, {
      faces: "b",
      tint: 0xb8b0a0,
      grime: 0.5,
    });
    // column grid with capitals
    for (let x = FL.x0 + 6; x < FL.x1 - 2; x += 8)
      for (let z = FL.z0 + 5.5; z < FL.z1 - 2; z += 6) {
        b.box("plaster", x, 0, z, 0.8, FL.h, 0.8, { tint: LIME, grime: 0.5 });
        b.box("wood_dark", x, FL.h - 0.6, z, 1.3, 0.5, 1.3, {});
        K.colBox(x - 0.4, 0, z - 0.4, x + 0.4, FL.h, z + 0.4);
      }
    // dead fluorescent strips (a few flicker)
    for (let x = FL.x0 + 2; x < FL.x1; x += 8)
      for (let z = FL.z0 + 3; z < FL.z1; z += 6) {
        const on = (Math.round(x) + Math.round(z)) % 3 === 0;
        d.box("lit_white", x, FL.h - 0.15, z, 2.4, 0.06, 0.25, {
          tint: on ? 0xffffff : 0x555555,
        });
        if (on) glows.add(x, FL.h - 0.4, z, 0xe8f0ff, "m");
      }
    // glass display counters (perfume/jewellery)
    for (const c of [
      [-14, -70, 0],
      [-6, -70, 0],
      [6, -76, 1.57],
      [10, -66, 0],
    ]) {
      const cz = Z(c[1]),
        yw = R(c[2]);
      d.box("wood_dark", c[0], 0, cz, 3.4, 0.9, 1.0, { yaw: yw, grime: 0.4 });
      d.box("glass", c[0], 0.9, cz, 3.3, 0.25, 0.9, { yaw: yw });
      K.colRot(c[0], cz, 3.4, 1.0, 0, 1.15, yw, {
        surface: "wood",
        tag: "cover",
      });
    }
    // clothing racks
    const cols = [0x8a2a2a, 0x2a4a7a, 0x6a6a3a, 0x3a3a3a, 0xa87a4a, 0x5a2a5a];
    for (const rk of [
      [-20, -80, 0],
      [-20, -75, 0],
      [-12, -80, 0],
      [12, -80, 1.57],
      [16, -75, 1.57],
      [-21, -66, 0.2],
      [2, -66, 2.8],
    ]) {
      const f = P.frame(rk[0], 0, Z(rk[1]), R(rk[2]));
      for (const s of [-1, 1]) {
        const p = f.p(s * 1.1, 0, 0);
        d.beam("chrome", p[0], 0, p[2], p[0], 1.5, p[2], 0.04);
      }
      const a = f.p(-1.1, 0, 0),
        c = f.p(1.1, 0, 0);
      d.beam("chrome", a[0], 1.5, a[2], c[0], 1.5, c[2], 0.03);
      for (let k = 0; k < 7; k++) {
        const p = f.p(-0.9 + k * 0.3, 0, 0);
        d.box("fabric", p[0], 0.55, p[2], 0.08, 0.9, 0.55, {
          yaw: R(rk[2]) + (k % 2) * 0.15,
          tint: cols[(k + Math.round(rk[0])) % cols.length],
          grime: 0.6,
        });
      }
      K.colRot(rk[0], Z(rk[1]), 2.3, 0.6, 0, 1.5, R(rk[2]), {});
    }
    // mannequins everywhere (some toppled)
    for (const m of [
      [-9, -76, 0.4, 0],
      [-3, -80, 2.1, 1],
      [3, -72, 1.1, 0],
      [8, -70, 3.0, 1],
      [-16, -64, 0.2, 0],
      [14, -63, 4.0, 0],
      [-23, -72, 1.6, 1],
    ])
      mannequin(d, m[0], 0.04, Z(m[1]), R(m[2]), !!m[3]);
    // wooden escalators (up into the dark, blocked), rising toward the back (south)
    for (const ex of [-3.5, 0.5]) {
      const ez = Z(-80);
      d.geo("wood_dark", K.T.box, {
        x: ex,
        y: 3.0,
        z: ez,
        rx: -0.62,
        sx: 1.6,
        sy: 0.25,
        sz: 9.5,
      });
      d.geo("wood", K.T.box, {
        x: ex,
        y: 3.2,
        z: ez,
        rx: -0.62,
        sx: 1.2,
        sy: 0.08,
        sz: 9.3,
      });
      for (const s of [-0.85, 0.85])
        d.geo("wood_dark", K.T.box, {
          x: ex + s,
          y: 3.6,
          z: ez,
          rx: -0.62,
          sx: 0.12,
          sy: 1.0,
          sz: 9.5,
        });
      K.colRot(ex, ez, 1.8, 8, 0, 6, 0, {});
    }
    P.rubblePile(d, -1.5, Z(-84.5), 2.4, 1.6, { seed: 95 });
    // cashier island + the manager's safe (now in the back corner by the Herald Square wall)
    d.box("wood_dark", -1, 0, Z(-66), 4.2, 1.0, 2.4, { grime: 0.4 });
    K.colBox(-3.1, 0, Z(-66) - 1.2, 1.1, 1.0, Z(-66) + 1.2, {
      surface: "wood",
    });
    for (const rx of [-2.3, 0.3])
      d.box("metal", rx, 1.0, Z(-66), 0.6, 0.35, 0.5, { tint: 0x8a8a7a });
    const SAFE = [16.9, Z(-82.5)];
    d.box("metal_dark", SAFE[0], 0, SAFE[1], 1.0, 1.2, 1.0, { tint: 0x3a4a3a });
    // "Black Friday" chaos: carts, shoe boxes, bags, skeletons, SALE signs
    for (let k = 0; k < 30; k++) {
      const r = K.rng(950 + k);
      d.box(
        ["paint_red", "fabric", "wood", "paint_white"][k % 4],
        FL.x0 + 2 + r() * (FL.x1 - FL.x0 - 4),
        0.05,
        FL.z0 + 2 + r() * (FL.z1 - FL.z0 - 4),
        0.35,
        0.18,
        0.25,
        { yaw: r() * 3, tint: 0xc8b8a0, grime: 0.6 },
      );
    }
    for (const s of [
      [-12, -73, 0.4],
      [5, -79, 2.2],
      [15, -70, 1.1],
      [-18, -84, 0.2],
    ])
      P.skeleton(d, s[0], 0.05, Z(s[1]), R(s[2]));
    const sale = K.paint("sterlings_sale", 256, 128);
    for (const s of [
      [-14, -69.2],
      [10, -65.2],
      [-20, -83.8],
    ])
      d.panel("atlas_paint", s[0], 2.6, Z(s[1]), 1.4, 0.7, PI, {
        rect: sale,
        both: true,
      });
    d.panel("atlas_paint", -10, 4.2, FL.z1 - 0.05, 4.4, 1.1, PI, {
      rect: K.paint("sterlings_blackfri", 512, 128),
    });
    // the Maniac Bruiser's nest (back corner): a hot puddle from a burst main, bones, Maniac bedding
    const nx = 14.5,
      nz = Z(-80);
    d.cyl("lit_green", nx, 0.05, nz, 2.2, 2.2, 0.02, 16, { tint: 0x3aff5a });
    green.add(nx, 0.5, nz, 0x50ff60, "xl");
    green.add(nx - 1, 0.3, nz - 1, 0x50ff60, "l");
    G.world.addRadSource({ x: nx, y: 0.5, z: nz, radius: 5, strength: 1.5 });
    for (let k = 0; k < 10; k++) {
      const a = k * 0.63;
      d.geo("bone", K.T.cyl6, {
        x: nx + Math.cos(a) * 2.6,
        y: 0.06,
        z: nz + Math.sin(a) * 2.6,
        rz: PI / 2,
        ry: a * 2,
        sx: 0.04,
        sy: 0.35,
        sz: 0.04,
      });
    }
    P.mattress(d, nx - 3, 0.05, nz - 2.5, 0.8);
    P.mattress(d, nx + 1.5, 0.05, nz - 3.2, 2.1);

    // ---- sales-floor anchors ----
    rec.anchor("boss", nx, 0, nz - 1.5, PI);
    rec.anchor("maniac_bruiser", nx, 0, nz - 1.5, PI);
    rec.anchor("spawn1", -10, 0, Z(-73), PI);
    rec.anchor("spawn2", 4, 0, Z(-69), 0);
    rec.anchor("spawn3", -18, 0, Z(-78), PI);
    rec.anchor("spawn4", 12, 0, Z(-72), PI);
    rec.anchor("escalator", -1.5, 0, Z(-74), 0);
    rec.anchor("safe", SAFE[0] - 1.1, 0, SAFE[1], -PI / 2);
    rec.anchor("cashier", -1, 0, Z(-63.9), PI);
    rec.anchor("loot1", 16.8, 0, Z(-62.2), 0);
    rec.anchor("loot2", -6, 0.95, Z(-70), PI);
    rec.anchor("mannequin", -9, 0, Z(-74.8), PI);
    rec.anchor("office", SAFE[0] - 1.1, 0, SAFE[1], -PI / 2);
  });
