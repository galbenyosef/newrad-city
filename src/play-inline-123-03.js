// play-inline-123 03 — math
// Lines 154-686 of readable/play-inline-123.pretty.js (statement-aligned).
  function build(rec) {
    const b = K.builder("rock_shell", { grime: 0.45 });
    const d = K.builder("rock_detail", { grime: 0.5 });
    const glows = K.glowSet("rock");
    const beacons = K.glowSet("rock_beacon");
    const P = K.parts;
    b.burn(84, 60, -310, 7, 0.5)
      .burn(52, 100, -320, 8, 0.5)
      .burn(100, 1, -340, 5, 0.5);

    // ---- 30 Rock: slim slab running east-west; the flat east face looks down on the plaza while the
    // north and south faces step back in a "wedding cake" of setbacks. Limestone piers are real geometry
    // fins (every 1.8 m, aligned with the façade texture), so the vertical striping reads from the street.
    const tiers = [
      [52, 84, -333, -307, 0, 20],
      [54, 84, -330, -310, 20, 52],
      [56, 84, -328, -312, 52, 86],
      [58, 83.5, -326.5, -313.5, 86, 118],
      [60, 83, -325, -315, 118, 140],
      [63, 80, -323.5, -316.5, 140, 147],
    ];
    const noFin = (x, z, y0) => x > 83.9 && z > -325.5 && z < -314.5 && y0 < 48; // entrance, relief and Covenant banner
    for (const t of tiers) {
      const [x0, x1, z0, z1, y0, y1] = t;
      b.boxMM("fac_30rock", x0, y0, z0, x1, y1, z1, { faces: "nsewt" });
      b.boxMM(
        "limestone",
        x0 - 0.3,
        y1 - 0.6,
        z0 - 0.3,
        x1 + 0.3,
        y1,
        z1 + 0.3,
        { faces: "nsewtb", grime: 0.45, tint: 0xd8ccb2 },
      );
      K.colBox(x0, y0, z0, x1, y1, z1);
      const fh = y1 - y0 - 0.6,
        fy = y0;
      const finX = (x, z) => {
        if (!noFin(x, z, fy))
          b.box("limestone", x, fy, z, 0.72, fh, 0.36, {
            grime: 0.4,
            tint: 0xd4c8ae,
          });
      };
      const finZ = (x, z) => {
        if (!noFin(x, z, fy))
          b.box("limestone", x, fy, z, 0.36, fh, 0.72, {
            grime: 0.4,
            tint: 0xd4c8ae,
          });
      };
      for (let k = 1; x0 + k * 1.8 < x1 - 0.5; k++)
        finX(x0 + k * 1.8, z1 + 0.18); // south face
      for (let k = 1; x1 - k * 1.8 > x0 + 0.5; k++)
        finX(x1 - k * 1.8, z0 - 0.18); // north face
      for (let k = 1; z1 - k * 1.8 > z0 + 0.5; k++)
        finZ(x1 + 0.18, z1 - k * 1.8); // east face
      for (let k = 1; z0 + k * 1.8 < z1 - 0.5; k++)
        finZ(x0 - 0.18, z0 + k * 1.8); // west face
      // dark recessed spandrel shadow at each setback roof edge
      b.boxMM(
        "concrete_dark",
        x0 + 0.2,
        y1,
        z0 + 0.2,
        x1 - 0.2,
        y1 + 1.1,
        z1 - 0.2,
        { faces: "nsewt", grime: 0.7 },
      );
    }
    // rooftop Covenant comms mast + lookout
    const mx = 69,
      mz = -320,
      MY = 148.1;
    for (let k = 0; k < 4; k++) {
      const a = (k * Math.PI) / 2 + 0.78;
      d.beam(
        "black_metal",
        mx + Math.cos(a) * 1.8,
        MY,
        mz + Math.sin(a) * 1.8,
        mx,
        MY + 16,
        mz,
        0.12,
      );
    }
    d.cyl("metal_dark", mx, MY, mz, 0.2, 0.08, 20, 6, {});
    beacons.add(mx, MY + 20, mz, 0xff2010, "l");
    // east-face entrance at plaza level with the Wisdom relief + Covenant banner
    b.boxMM("granite", 83.6, 0, -325, 84.2, PZ + 6, -315, {
      faces: "e",
      tint: 0x3a3830,
    });
    b.panel("glass_broken", 84.25, PZ + 2.6, -320, 6.5, 5.2, Math.PI / 2);
    for (let z = -323; z <= -317; z += 1.5)
      d.box("bronze", 84.3, PZ, z, 0.12, 5.2, 0.12, {});
    b.panel("atlas_paint", 84.25, PZ + 8.3, -320, 7.6, 5.7, Math.PI / 2, {
      rect: K.paint("wisdom", 512, 384),
    });
    b.panel("atlas_paint", 84.3, PZ + 5.6, -320, 7, 0.9, Math.PI / 2, {
      rect: K.paint("rock_sign", 1024, 128),
    });
    b.panel("atlas_paint", 84.45, 32, -320, 9, 27, Math.PI / 2, {
      rect: K.paint("covenant_banner", 256, 768),
    });
    d.beam("black_metal", 84.55, 45.6, -325, 84.55, 45.6, -315, 0.2);

    // ---- raised plaza (podium) around the sunken rink ----
    const podBox = (x0, z0, x1, z1) => {
      b.boxMM("granite", x0, 0, z0, x1, PZ, z1, {
        faces: "nsewt",
        tint: 0xa8a49a,
        grime: 0.55,
      });
      K.colBox(x0, 0, z0, x1, PZ, z1);
    };
    podBox(POD.x0, POD.z0, POD.x1, RINK.z0); // north
    podBox(POD.x0, RINK.z1, POD.x1, POD.z1); // south
    podBox(POD.x0, RINK.z0, RINK.x0, RINK.z1); // west
    podBox(RINK.x1, RINK.z0, POD.x1, -322); // east (north of stair)
    podBox(RINK.x1, -318, POD.x1, RINK.z1); // east (south of stair)
    b.boxMM("paving", POD.x0, PZ, POD.z0, POD.x1, PZ + 0.03, POD.z1, {
      faces: "t",
      grime: 0.5,
    });
    // rink floor (dry, cracked), rink walls
    b.boxMM("concrete", RINK.x0, -0.2, RINK.z0, RINK.x1, 0.06, RINK.z1, {
      faces: "t",
      tint: 0x9aaab0,
      grime: 0.6,
    });
    for (let k = 0; k < 6; k++) {
      const r = K.rng(310 + k);
      d.beam(
        "black_metal",
        RINK.x0 + 1 + r() * 9,
        0.07,
        RINK.z0 + 1 + r() * 12,
        RINK.x0 + 1 + r() * 9,
        0.07,
        RINK.z0 + 1 + r() * 12,
        0.04,
        { d: 0.01 },
      );
    }
    P.rubblePile(d, 98, -324.5, 1.2, 0.6, { seed: 311 });
    d.box("wood", 95, 0.06, -316, 2.4, 0.08, 1.2, { yaw: 0.4, grime: 0.7 });
    // rink stairs up to the east + Channel Gardens steps down to Fifth Avenue
    b.stairs("granite", RINK.x1, -320, 1, 0, 4, 3, 0, PZ, 5, {
      solid: true,
      tint: 0xa8a49a,
    });
    b.stairs("granite", 110, -320, -1, 0, 12, 6, 0, PZ, 5, {
      solid: true,
      tint: 0xa8a49a,
    });
    // planters of dead shrubs flanking the garden steps
    for (const pz of [-327.5, -312.5]) {
      b.boxMM("granite", 104.3, 0, pz - 1.3, 109.7, 0.8, pz + 1.3, {
        tint: 0x8a867c,
      });
      b.boxMM("dirt", 104.5, 0.8, pz - 1.1, 109.5, 0.85, pz + 1.1, {
        faces: "t",
      });
      for (let k = 0; k < 4; k++)
        P.deadTree(d, 105.2 + k * 1.3, pz, 1.8, {
          y: 0.8,
          depth: 1,
          collide: false,
          seed: k + pz * 3,
        });
      K.colBox(104.3, 0, pz - 1.3, 109.7, 0.8, pz + 1.3);
    }
    // north/south access stairs onto the podium
    b.stairs("granite", 96, -338.5, 0, 1, 4, 4.5, 0, PZ, 5, {
      solid: true,
      tint: 0xa8a49a,
    });
    b.stairs("granite", 96, -301.5, 0, -1, 4, 4.5, 0, PZ, 5, {
      solid: true,
      tint: 0xa8a49a,
    });
    // rink railing with gaps for the stairs
    const rail = (ax, az, bx, bz) => {
      d.beam("bronze", ax, PZ + 1.0, az, bx, PZ + 1.0, bz, 0.06);
      for (let t = 0; t <= 1.001; t += 0.1) {
        const x = ax + (bx - ax) * t,
          z = az + (bz - az) * t;
        d.beam("bronze", x, PZ, z, x, PZ + 1.0, z, 0.04);
      }
      K.colWall(ax, az, bx, bz, 0.12, PZ, PZ + 1.0, [], { walkable: false });
    };
    rail(RINK.x0, RINK.z0, RINK.x1, RINK.z0);
    rail(RINK.x0, RINK.z1, RINK.x1, RINK.z1);
    rail(RINK.x0, RINK.z0, RINK.x0, -323);
    rail(RINK.x0, -317, RINK.x0, RINK.z1);

    // ---- golden Prometheus with the zodiac ring, fountain basin below ----
    const px = RINK.x0 + 1.4,
      pz = -320;
    b.boxMM("granite", RINK.x0, 0, pz - 3.2, RINK.x0 + 2.8, 1.0, pz + 3.2, {
      tint: 0x6a665c,
    });
    b.geo("bronze", K.T.dodeca, {
      x: px,
      y: 1.2,
      z: pz,
      sx: 1.1,
      sy: 0.9,
      sz: 1.5,
      tint: 0x4a3a2a,
    });
    P.figure(b, "gold_bright", px + 0.2, 1.5, pz, Math.PI / 2, 1.9, "flying", {
      grime: 0.15,
    });
    b.geo("gold_bright", K.T.torus, {
      x: px - 0.3,
      y: 3.6,
      z: pz,
      ry: Math.PI / 2,
      s: 2.7,
    });
    for (let k = 0; k < 12; k++) {
      const a = (k * Math.PI) / 6;
      d.geo("gold", K.T.box, {
        x: px - 0.32,
        y: 3.6 + Math.sin(a) * 2.7,
        z: pz + Math.cos(a) * 2.7,
        rx: -a,
        sx: 0.12,
        sy: 0.5,
        sz: 0.3,
      });
    }
    glows.add(px + 1.2, 5.1, pz + 0.5, 0xffa040, "m"); // the stolen fire
    K.colBox(RINK.x0, 0, pz - 3.2, RINK.x0 + 2.8, 3.5, pz + 3.2);

    // ---- ring of flags around the rink ----
    const covF = K.flag("covenant", null),
      usF = K.flag("usa", null);
    let fi = 0;
    for (let x = RINK.x0 + 0.5; x <= RINK.x1 - 0.5; x += 2.2)
      for (const z of [RINK.z0 - 0.8, RINK.z1 + 0.8]) {
        P.flagpole(d, x, z, 7.5, fi++ % 3 === 1 ? usF : covF, Math.PI / 2, {
          y: PZ,
          w: 2.0,
          h: 1.0,
        });
      }
    // dead Christmas tree at the west end of the plaza (above Prometheus)
    const tx = 87,
      tz = -320;
    b.cyl("wood_dark", tx, PZ, tz, 0.5, 0.25, 14, 8, { top: false });
    for (let k = 0; k < 6; k++) {
      const y = PZ + 2.5 + k * 2,
        r = 3.4 - k * 0.5;
      for (let j = 0; j < 9; j++) {
        const a = j * 0.7 + k;
        d.beam(
          "wood_dark",
          tx,
          y + 0.5,
          tz,
          tx + Math.cos(a) * r,
          y - 0.6,
          tz + Math.sin(a) * r,
          0.12,
          { round: 6 },
        );
      }
    }
    const tb = [];
    for (let k = 0; k < 30; k++) {
      const a = k * 0.9,
        y = PZ + 2.2 + k * 0.36,
        r = 3.3 - (y - PZ) * 0.22;
      tb.push([tx + Math.cos(a) * r, y, tz + Math.sin(a) * r]);
    }
    P.bulbs(d, glows, tb, {
      spacing: 1.0,
      sag: 0.1,
      colors: [0xff4040, 0x40a0ff, 0xffd040, 0x40ff80],
      broken: 0.6,
      bulbMesh: true,
    });
    d.geo("gold", K.T.cone4, {
      x: tx,
      y: PZ + 15,
      z: tz,
      sx: 0.5,
      sy: 1.1,
      sz: 0.5,
    });
    K.colBox(tx - 0.6, PZ, tz - 0.6, tx + 0.6, PZ + 14, tz + 0.6);

    // ---- Atlas holding the heavens (Fifth Avenue side, south) ----
    const ax = 105.5,
      az = -293;
    b.boxMM("granite", ax - 2, 0, az - 2, ax + 2, 2.4, az + 2, {
      tint: 0x5a5850,
    });
    P.figure(b, "bronze", ax, 2.4, az, Math.PI / 2, 2.2, "atlas", {
      grime: 0.3,
    });
    const sy = 2.4 + 2.2 * 2.25;
    for (const rr of [
      [0, 0, 0],
      [Math.PI / 2, 0, 0],
      [0.41, 0, 0.3],
      [0, Math.PI / 2, 0],
    ])
      b.geo("bronze", K.T.torus, {
        x: ax + 0.2,
        y: sy,
        z: az,
        rx: rr[0],
        ry: rr[1],
        rz: rr[2],
        s: 2.1,
      });
    b.beam(
      "bronze",
      ax + 0.2 - 2.6,
      sy - 1.2,
      az,
      ax + 0.2 + 2.6,
      sy + 1.2,
      az,
      0.12,
      { round: 6 },
    );
    K.colBox(ax - 2, 0, az - 2, ax + 2, 2.4, az + 2);

    // ================= Iron Covenant outpost =================
    // helipad (north strip) with the parked Rotorcraft
    const vx = 80,
      vz = -346;
    b.boxMM("concrete", vx - 8, 0, vz - 8, vx + 8, 0.12, vz + 8, {
      faces: "nsewt",
      grime: 0.3,
    });
    b.quad(
      "atlas_paint",
      [vx - 7.5, 0.13, vz + 7.5],
      [vx + 7.5, 0.13, vz + 7.5],
      [vx + 7.5, 0.13, vz - 7.5],
      [vx - 7.5, 0.13, vz - 7.5],
      { rect: K.paint("helipad", 512, 512) },
    );
    for (let k = 0; k < 16; k++) {
      const a = (k * Math.PI) / 8;
      glows.add(
        vx + Math.cos(a) * 7.8,
        0.3,
        vz + Math.sin(a) * 7.8,
        k % 2 ? 0xffd040 : 0x40ff60,
        "s",
      );
      d.geo("lit_warm", K.T.sphereLo, {
        x: vx + Math.cos(a) * 7.8,
        y: 0.2,
        z: vz + Math.sin(a) * 7.8,
        s: 0.12,
      });
    }
    P.rotorcraft(d, vx, 0.12, vz, Math.PI / 2, { tint: 0x4a5040 });
    // sandbag perimeter + turrets + searchlight tower
    P.sandbags(d, 54, -356.5, 70, -356.5, 4, { seed: 61 });
    P.sandbags(d, 90, -356.5, 108, -356.5, 4, { seed: 62 });
    P.sandbags(d, 108.5, -356, 108.5, -337, 4, { seed: 63 });
    P.sandbags(d, 51.5, -356, 51.5, -337, 4, { seed: 64 });
    K.staticTurret(rec, "turret1", 55, 0, -353, -Math.PI / 4, {
      bodyMat: "paint_green",
    });
    K.staticTurret(rec, "turret2", 105, 0, -353, Math.PI / 4, {
      bodyMat: "paint_green",
    });
    const stx = 104,
      stz = -340,
      sth = 6;
    for (const o of [
      [-1.2, -1.2],
      [1.2, -1.2],
      [1.2, 1.2],
      [-1.2, 1.2],
    ])
      d.beam(
        "metal_dark",
        stx + o[0],
        0,
        stz + o[1],
        stx + o[0] * 0.7,
        sth,
        stz + o[1] * 0.7,
        0.14,
      );
    d.box("metal_dark", stx, sth, stz, 2.6, 0.18, 2.6, {});
    P.searchlight(d, glows, stx, sth + 0.18, stz, -Math.PI / 3, 0.35);
    K.colBox(stx - 1.3, 0, stz - 1.3, stx + 1.3, sth + 0.2, stz + 1.3);
    // tents, crates, Exo-rig gantry, workbench
    const tent = (x, z, yaw) => {
      const f = P.frame(x, 0, z, yaw);
      for (const sgn of [-1, 1]) {
        const p = f.p(sgn * 1.1, 0, 0);
        d.geo("fabric", K.T.box, {
          x: p[0],
          y: 1.05,
          z: p[2],
          ry: yaw,
          rz: sgn * 0.75,
          sx: 0.04,
          sy: 2.9,
          sz: 4.2,
          tint: 0x5a6040,
        });
      }
      const pp = f.p(0, 0, 2.1),
        pb = f.p(0, 0, -2.1);
      d.beam("wood", pp[0], 0, pp[2], pp[0], 2.1, pp[2], 0.08);
      d.beam("wood", pb[0], 0, pb[2], pb[0], 2.1, pb[2], 0.08);
      d.beam("wood", pp[0], 2.1, pp[2], pb[0], 2.1, pb[2], 0.07);
      K.colRot(x, z, 2.6, 4.2, 0, 2.0, yaw, { surface: "dirt" });
    };
    tent(60, -342, 0);
    tent(66, -342, 0);
    tent(64, -296, Math.PI / 2);
    tent(64, -289, Math.PI / 2);
    const cr = K.paint("covenant_crate", 256, 128);
    for (const c of [
      [98, -350, 0.2],
      [99.2, -350.3, 0.1],
      [98.6, -349.2, 1.4],
      [70, -300, 0.5],
      [71.3, -300.2, 0.1],
    ]) {
      d.box("paint_green", c[0], 0, c[1], 1.2, 0.7, 0.8, {
        yaw: c[2],
        tint: 0x6a7250,
      });
      d.panel(
        "atlas_paint",
        c[0] + Math.sin(c[2]) * 0.41,
        0.35,
        c[1] + Math.cos(c[2]) * 0.41,
        1.1,
        0.55,
        c[2],
        { rect: cr },
      );
      K.colRot(c[0], c[1], 1.2, 0.8, 0, 0.7, c[2], {});
    }
    // Exo-rig gantry (empty frame)
    const gx = 73,
      gz = -339.5;
    for (const sx of [-1, 1])
      d.beam("metal_dark", gx + sx * 1.1, 0, gz, gx + sx * 1.1, 3.2, gz, 0.2);
    d.beam("metal_dark", gx - 1.2, 3.2, gz, gx + 1.2, 3.2, gz, 0.2);
    d.beam("black_metal", gx, 3.2, gz, gx, 2.4, gz, 0.06);
    d.box("paint_yellow", gx, 0, gz, 2.6, 0.12, 1.6, { tint: 0xc8a030 });
    K.colBox(gx - 1.3, 0, gz - 0.3, gx + 1.3, 3.3, gz + 0.3);
    d.box("metal", 77, 0, -338.2, 2.2, 0.95, 0.9, { grime: 0.6 });
    d.box("rust", 77, 0.95, -338.2, 2.3, 0.08, 1.0, {});
    K.colBox(75.9, 0, -338.65, 78.1, 1.0, -337.75);
    // south checkpoint (facing the street) with gate + banners
    P.sandbags(d, 52, -284, 90, -284, 4, { seed: 65 });
    P.sandbags(d, 96, -284, 109, -284, 4, { seed: 66 });
    P.jersey(d, 93, -281.5, 0);
    K.staticTurret(rec, "turret3", 88, 0, -285.5, 0, {
      bodyMat: "paint_green",
    });
    for (const bx of [89.5, 96.5]) {
      d.beam("metal_dark", bx, 0, -284.5, bx, 5.5, -284.5, 0.15);
      d.face("flags_static", bx, 2.2, -284.4, 1, 0, 0, 0, 1, 0, 1.4, 3.2, {
        uv: "rect",
        rect: K.flag("covenant", null),
        su: 1,
        sv: 1,
      });
    }
    P.barrel(d, 58, 0, -288, "fire", { glows, collide: true });
    P.barrel(d, 86, 0, -352, "fire", { glows, collide: true });
    for (const lp of [
      [58, -334],
      [104, -334],
      [104, -306],
      [58, -306],
    ])
      P.lampPost(d, glows, lp[0], lp[1], 5, { color: 0xfff0d0 });
    P.car(d, 45, -300, 0.1, { seed: 71 });

    // ---- anchors ----
    rec.anchor("entrance", 93, 0, -279.5, Math.PI);
    rec.anchor("checkpoint", 93, 0, -286, Math.PI);
    rec.anchor("plaza", 96, PZ, -310, Math.PI);
    rec.anchor("rink", 95.5, 0, -320, -Math.PI / 2);
    rec.anchor("prometheus", 96, 0, -320, -Math.PI / 2);
    rec.anchor("atlas", 108, 0, -293, -Math.PI / 2);
    // door PLANE of the plaza doors (landmark_interiors adopts it: .w/.h, yaw = player yaw looking OUT) + the old standing spot
    {
      const v = rec.anchor("door", 84.3, PZ, -320, -Math.PI / 2);
      v.w = 4.0;
      v.h = 3.2;
    }
    rec.anchor("door_stand", 86, PZ, -320, -Math.PI / 2);
    rec.anchor("warden", 76, 0, -334.5, Math.PI);
    rec.anchor("archivist", 64.5, 0, -338.5, Math.PI);
    rec.anchor("commander", 86, PZ, -318, -Math.PI / 2);
    rec.anchor("rotorcraft", vx, 0, vz, Math.PI / 2);
    rec.anchor("pad", vx - 10, 0, vz, Math.PI / 2);
    rec.anchor("guard1", 91.5, 0, -286.2, Math.PI);
    rec.anchor("guard2", 94.5, 0, -286.2, Math.PI);
    rec.anchor("guard3", stx, sth + 0.18, stz, Math.PI / 2);
    rec.anchor("guard4", 96, PZ, -331.5, 0);
    rec.anchor("guard5", 101, PZ, -309, Math.PI);
    rec.anchor("turret1", 55, 0, -353, 0);
    rec.anchor("turret2", 105, 0, -353, 0);
    rec.anchor("turret3", 88, 0, -285.5, 0);
    rec.anchor("rig_gantry", gx, 0, gz + 1, Math.PI);
    rec.anchor("workbench", 77, 0, -337.2, Math.PI);
    rec.anchor("terminal", 76.2, 0.95, -338.2, Math.PI);
    rec.anchor("loot1", 99, 0, -349, 0);
    rec.anchor("loot2", 70.5, 0, -299, 0);
    rec.anchor("tree", tx + 2, PZ, tz, 0);

    b.finish(rec.root);
    d.finish(rec.root, { lod: 300 });
    glows.finish(rec.root, { dayOpacity: 0.35 });
    beacons.finish(rec.root, { dayOpacity: 0.5, beacon: true });
  }

