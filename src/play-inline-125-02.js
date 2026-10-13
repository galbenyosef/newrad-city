// play-inline-125 02 — nave
// Lines 19-267 of readable/play-inline-125.pretty.js (statement-aligned).
  const K = G.LMA.kit;

  K.defineInterior("st_patricks:nave", function (ctx) {
    const { b, d, M, MT, ZC, NAVE, AISLE, TRAN, apR, apx } = ctx;
    // ---- floor ----
    b.boxMM("marble", 132, -0.2, AISLE.z0, 186, 0.04, AISLE.z1, {
      faces: "t",
      tint: 0xb8b0a0,
      grime: 0.5,
    });
    b.boxMM("marble", TRAN.x0, -0.2, TRAN.z0, TRAN.x1, 0.04, TRAN.z1, {
      faces: "t",
      tint: 0xb8b0a0,
      grime: 0.5,
    });
    // centre aisle runner (tattered carpet)
    d.boxMM("carpet", 136, 0.04, ZC - 1.1, 170, 0.07, ZC + 1.1, {
      faces: "t",
      tint: 0x6a2a24,
      grime: 0.7,
    });
    // aisle ceilings (under the lean-to roofs)
    for (const s of [
      [AISLE.z0, NAVE.z0],
      [AISLE.z1, NAVE.z1],
    ]) {
      const zOut = s[0],
        zIn = s[1];
      for (const seg of [
        [NAVE.x0, TRAN.x0],
        [TRAN.x1, NAVE.x1],
      ]) {
        b.boxMM(
          "plaster",
          seg[0],
          AISLE.h - 1,
          Math.min(zOut, zIn),
          seg[1],
          AISLE.h - 0.9,
          Math.max(zOut, zIn),
          { faces: "b", tint: 0xb8b0a0 },
        );
      }
    }
    // arcades of clustered piers under the clerestory walls
    for (const z of [NAVE.z0, NAVE.z1]) {
      for (let x = NAVE.x0 + 2.5; x < NAVE.x1; x += 4.6) {
        if (x > TRAN.x0 - 0.5 && x < TRAN.x1 + 0.5) continue;
        for (const o of [
          [0, 0, 0.45],
          [0.45, 0, 0.2],
          [-0.45, 0, 0.2],
          [0, 0.45, 0.2],
          [0, -0.45, 0.2],
        ])
          b.cyl(M, x + o[0], 0, z + o[1], o[2], o[2], AISLE.h - 1, 8, {
            tint: MT,
            grime: 0.4,
            top: false,
          });
        K.colBox(x - 0.6, 0, z - 0.6, x + 0.6, AISLE.h - 1, z + 0.6);
        // pointed arcade arch between piers (two leaning beams)
        b.beam(M, x, AISLE.h - 1.6, z, x + 2.3, AISLE.h - 0.4, z, 0.35, {
          d: 0.5,
          tint: MT,
        });
        b.beam(M, x + 2.3, AISLE.h - 0.4, z, x + 4.6, AISLE.h - 1.6, z, 0.35, {
          d: 0.5,
          tint: MT,
        });
      }
    }
    // nave + transept ceilings with ribs
    b.boxMM(
      "plaster",
      NAVE.x0,
      NAVE.h - 1,
      NAVE.z0,
      NAVE.x1,
      NAVE.h - 0.9,
      NAVE.z1,
      { faces: "b", tint: 0xa8a090 },
    );
    b.boxMM(
      "plaster",
      TRAN.x0,
      NAVE.h - 1,
      TRAN.z0,
      TRAN.x1,
      NAVE.h - 0.9,
      TRAN.z1,
      { faces: "b", tint: 0xa8a090 },
    );
    for (let x = NAVE.x0 + 2.5; x < NAVE.x1; x += 4.6) {
      d.beam(M, x, NAVE.h - 1, NAVE.z0, x + 4.6, NAVE.h - 1, NAVE.z1, 0.25, {
        tint: 0xd8d0c0,
      });
      d.beam(M, x + 4.6, NAVE.h - 1, NAVE.z0, x, NAVE.h - 1, NAVE.z1, 0.25, {
        tint: 0xd8d0c0,
      });
    }
    // apse ceiling
    b.boxMM("plaster", apx - 0.5, 15.9, ZC - apR, apx + apR, 16, ZC + apR, {
      faces: "b",
      tint: 0x8a8070,
    });
  });

  K.defineInterior("st_patricks", function (ctx) {
    const { rec, b, d, glows, green, P, M, MT, ZC, NAVE, AISLE, TRAN } = ctx;
    // narthex (between towers) ceiling
    b.boxMM("plaster", 133, 12, -347.5, 141, 12.1, -335.5, {
      faces: "b",
      tint: 0xa8a090,
    });
    b.boxMM(M, 133, 12.1, -347.5, 141, NAVE.h, -335.5, {
      faces: "e",
      tint: MT,
    });

    // ---- interior: pews, altar, the Sacrament ----
    for (let x = 144; x < 158.5; x += 1.25)
      for (const side of [-1, 1]) {
        const zc = ZC + side * 2.9;
        d.box("wood_dark", x, 0, zc, 0.45, 0.46, 3.2, { grime: 0.5 });
        d.box("wood_dark", x + 0.22, 0.46, zc, 0.07, 0.55, 3.2, { grime: 0.5 });
        K.colBox(x - 0.25, 0, zc - 1.6, x + 0.3, 0.9, zc + 1.6, {
          surface: "wood",
          tag: "cover",
        });
      }
    // sanctuary platform + altar
    b.boxMM(M, 168.5, 0, ZC - 5, 177.5, 1.0, ZC + 5, { tint: 0xd8d0c0 });
    K.colBox(168.5, 0, ZC - 5, 177.5, 1.0, ZC + 5);
    b.stairs(M, 166.5, ZC, 1, 0, 6, 2, 0, 1.0, 2, {
      solid: true,
      tint: 0xd8d0c0,
    });
    b.boxMM(M, 172.8, 1.0, ZC - 2.2, 174.6, 2.1, ZC + 2.2, { tint: 0xe8e2d4 });
    K.colBox(172.8, 1.0, ZC - 2.2, 174.6, 2.1, ZC + 2.2);
    // "the Sacrament": a hollow Civil Defense practice casing on a cradle, an isotope reliquary glowing inside it (the
    // public relic of the Keeper's church; the real weapon, the Second Sun, is under Grand Central, M42 — src/lair)
    const bx = 173.7,
      by = 2.1;
    d.beam("rust", bx - 0.8, by, ZC - 1.4, bx - 0.8, by + 0.8, ZC - 1.4, 0.15);
    d.beam("rust", bx + 0.8, by, ZC - 1.4, bx + 0.8, by + 0.8, ZC - 1.4, 0.15);
    d.beam("rust", bx - 0.8, by, ZC + 1.4, bx - 0.8, by + 0.8, ZC + 1.4, 0.15);
    d.beam("rust", bx + 0.8, by, ZC + 1.4, bx + 0.8, by + 0.8, ZC + 1.4, 0.15);
    d.geo("paint_green", K.T.sphere, {
      x: bx,
      y: by + 1.35,
      z: ZC,
      sx: 0.95,
      sy: 0.95,
      sz: 2.4,
      tint: 0x5a7a5a,
      grime: 0.6,
    });
    d.cyl("paint_yellow", bx, by + 1.35, ZC + 2.1, 0.5, 0.5, 0.1, 10, {});
    for (let k = 0; k < 4; k++) {
      const a = (k * Math.PI) / 2;
      d.geo("metal", K.T.box, {
        x: bx + Math.cos(a) * 0.6,
        y: by + 1.35 + Math.sin(a) * 0.6,
        z: ZC - 2.2,
        rz: a,
        sx: 0.08,
        sy: 1.1,
        sz: 0.9,
      });
    }
    d.box("lit_warm", bx, by + 1.3, ZC, 1.95, 0.06, 0.1, { tint: 0xffb040 });
    green.add(bx, by + 1.4, ZC, 0xffb040, "xl");
    green.add(bx, by + 0.3, ZC, 0xffa030, "l");
    G.world.addRadSource({ x: bx, y: by + 1, z: ZC, radius: 7, strength: 1.2 });
    // candles, hanging sun discs, glowing puddle
    for (let k = 0; k < 18; k++) {
      const r = K.rng(1600 + k);
      const cx = 170 + r() * 6.5,
        cz = ZC - 4.2 + r() * 8.4;
      if (Math.abs(cz - ZC) < 2.4 && cx > 172.5) continue;
      const ch = 0.2 + r() * 0.35;
      d.cyl("paint_white", cx, 1.0, cz, 0.04, 0.04, ch, 6, { tint: 0xe8e0c0 });
      glows.add(cx, 1.08 + ch, cz, 0xffc060, "s");
    }
    for (const a of [
      [150, 13, ZC],
      [158, 13, ZC],
      [164, 14, ZC],
    ]) {
      d.beam("rust", a[0], NAVE.h - 1, a[2], a[0], a[1] + 1.4, a[2], 0.03);
      P.sunDisc(d, a[0], a[1], a[2], 1.1, (Math.PI / 2) * (a[0] % 2), {
        glows: green,
      });
    }
    d.cyl("lit_warm", 170.2, 0.05, ZC + 3.2, 1.2, 1.2, 0.02, 14, {
      tint: 0xff9a30,
    });
    green.add(170.2, 0.4, ZC + 3.2, 0xff9a30, "l");
    G.world.addRadSource({
      x: 170.2,
      y: 0.5,
      z: ZC + 3.2,
      radius: 2.5,
      strength: 0.6,
    });
    // the keeper's desk in the north transept (terminal anchor)
    P.table(d, 165.5, 0, -355.3, 0, { w: 1.6, d: 0.8, mat: "wood_dark" });
    K.colBox(164.7, 0, -355.7, 166.3, 0.75, -354.9, { surface: "wood" });
    // graffiti, bedrolls of the faithful, lectern
    for (const m of [
      [149, -349.5, 0],
      [153.6, -349.5, 0.1],
      [148, -333.5, 0],
      [175, -349.8, 1.57],
    ])
      P.mattress(d, m[0], 0.05, m[1], m[2]);
    d.box("wood_dark", 169.3, 1.0, ZC - 3.4, 0.6, 1.2, 0.5, { grime: 0.4 });
    d.panel("atlas_paint", 150, 4.5, AISLE.z0 + 1.02, 4, 2, 0, {
      rect: K.paint("glowkeeper_graffiti", 512, 256),
    });
    for (const s of [
      [156, -349.4],
      [145.5, -333.8],
    ])
      P.skeleton(d, s[0], 0.05, s[1], 0.6);
    for (let x = NAVE.x0 + 4; x < NAVE.x1 - 4; x += 9.2)
      for (const z of [AISLE.z0 + 1.1, AISLE.z1 - 1.1]) {
        if (x > TRAN.x0 - 1 && x < TRAN.x1 + 1) continue;
        d.cyl("rust", x, 0, z, 0.08, 0.1, 1.6, 6, {});
        glows.add(x, 1.75, z, 0xffb050, "s");
      }

    // ---- interior anchors ----
    rec.anchor("preacher", 171, 1.0, ZC - 1.2, -Math.PI / 2);
    rec.anchor("bomb", bx, by, ZC, -Math.PI / 2);
    rec.anchor("altar", 170, 1.0, ZC, -Math.PI / 2);
    rec.anchor("congregation1", 147, 0, ZC - 2.4, -Math.PI / 2);
    rec.anchor("congregation2", 150.5, 0, ZC + 3.2, -Math.PI / 2);
    rec.anchor("congregation3", 154, 0, ZC - 3.5, -Math.PI / 2);
    rec.anchor("congregation4", 157.5, 0, ZC + 2.2, -Math.PI / 2);
    rec.anchor("confessor", 163, 0, -353.5, 0);
    rec.anchor("merchant", 164, 0, -330, Math.PI);
    rec.anchor("crossing", 164, 0, ZC, -Math.PI / 2);
    rec.anchor("terminal", 165.5, 0, -354.6, 0);
    rec.anchor("pulpit", 169.3, 1.0, ZC - 3.4, -Math.PI / 2);
    rec.anchor("loot1", 175.5, 0, -349.5, 0);
    rec.anchor("loot2", 162, 0, -355, 0);
  });
