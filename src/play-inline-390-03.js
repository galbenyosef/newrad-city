// play-inline-390 03 — tint
// Lines 38-2391 of readable/play-inline-390.pretty.js (statement-aligned).
  PV.hoInterior = function (ctx) {
    const O = ctx.O,
      HO = PV.ho;
    ctx.intRoot = new THREE.Group();
    ctx.intRoot.name = "poi_hotelpenn_int";
    const b = K.builder({
      name: "ho_int",
      off: O,
      lit: true,
      amb: [0.11, 0.112, 0.104],
      floors: [0, GY, 0.9],
      grime: 0.55,
    }); // round 2: ambient ×1.75 (dark mahogany / velvet read)
    const r = K.rng("ho_int");
    const warm = [1, 0.78, 0.5],
      dim = [0.9, 0.7, 0.45],
      day = [0.62, 0.7, 0.62],
      green = [0.35, 1, 0.3],
      amber = [1, 0.62, 0.22];
    const marble = [0.8, 0.76, 0.68];
    const LB = [-15.2, -1, -26.2, 15.2, 11.5, 0.2];
    const CR = [-43.2, -1, -28.2, -14.8, 10.5, 0.2];

    // ------------------------------------------------ gaps
    K.gap(ctx, -15, -13, 3.2, 0, 3.6); // lobby ↔ Café Rouge
    K.gap(ctx, 15, -8, 1.1, 0, 2.3); // lobby ↔ switchboard
    K.gap(ctx, 15, -20, 1.1, 0, 2.3); // lobby ↔ manager's office
    K.gap(ctx, -22, -28, 1.4, 0, 2.4); // Café Rouge ↔ kitchen
    // floor 15: open rooms on the corridor
    const CZN = -90.25,
      CZS = -87.75;
    const OPEN = {
      1503: [-18, -12, "n"],
      1506: [-12, -6, "s"],
      1509: [0, 6, "n"],
      1512: [6, 12, "s"],
      1515: [18, 24, "n"],
      1516: [18, 24, "s"],
    };
    for (const k in OPEN) {
      const [x0, x1, s] = OPEN[k];
      K.gap(
        ctx,
        (x0 + x1) / 2 + (s === "n" ? -1.4 : 1.4),
        s === "n" ? CZN : CZS,
        1.0,
        0,
        2.2,
      );
    }

    // ================================================= GRAND LOBBY
    K.room(b, ctx, {
      x0: -15,
      z0: -26,
      x1: 15,
      z1: 0,
      y: 0,
      h: 11,
      floor: "checker",
      fc: [0.72, 0.7, 0.66],
      wall: "marble",
      wc: marble,
      ceil: "coffer",
      cc: [0.52, 0.48, 0.42],
      wain: "marble_green",
      wainC: [0.6, 0.66, 0.6],
      wainH: 1.3,
      cornice: true,
      corniceMat: "gilt",
      trimMat: "marble_black",
    });
    // south wall: the entrance (revolving door from inside) + three tall windows full of grey daylight
    b.cyl("brass", 0, 0, -0.9, 1.1, 1.1, 0.12, 16, {
      tint: [0.55, 0.45, 0.28],
    });
    b.cyl("brass", 0, 2.5, -0.9, 1.15, 1.15, 0.3, 16, {
      tint: [0.55, 0.45, 0.28],
    });
    for (let k = 0; k < 4; k++) {
      const a = PI / 4 + k * HP;
      b.box(
        "glass",
        Math.cos(a) * 0.52,
        0.12,
        -0.9 - Math.sin(a) * 0.52,
        1.02,
        2.3,
        0.05,
        { yaw: a, tint: [0.4, 0.44, 0.42] },
      );
    }
    b.pipe("brass", 0, 0, -0.9, 0, 2.5, -0.9, 0.05, 6);
    b.col(-1.2, 0, -2.05, 1.2, 2.8, -0.05, { tag: "door" });
    for (const wx of [-9, 0, 9]) {
      b.plate("lamp", wx, 7.2, -0.11, 0, -1, 3.2, 5.2, null, {
        tint: [0.46, 0.5, 0.44],
        off: 0,
      });
      for (let q = 0; q <= 4; q++)
        b.beam(
          "bronze",
          wx - 1.6 + q * 0.8,
          4.6,
          -0.14,
          wx - 1.6 + q * 0.8,
          9.8,
          -0.14,
          0.06,
          0.06,
          { tint: [0.3, 0.3, 0.26] },
        );
      for (let q = 0; q < 4; q++)
        b.beam(
          "bronze",
          wx - 1.6,
          4.6 + q * 1.73,
          -0.14,
          wx + 1.6,
          4.6 + q * 1.73,
          -0.14,
          0.05,
          0.05,
          { tint: [0.3, 0.3, 0.26] },
        );
      b.light(wx, 7, -2, day, 0.6, 12, { box: LB, wrap: 0.6 });
      K.shaft(
        b,
        wx,
        7.3,
        -0.3,
        wx + 0.9,
        0.02,
        -8.2,
        3.0,
        4.2,
        [0.075, 0.085, 0.075],
      ); // dusty daylight falling across the lobby
    }
    // galleries (y 5): west, east and north, carried on giant-order columns
    const GAL = [
      [-15, -26, -9, 0],
      [9, -26, 15, 0],
      [-9, -26, 9, -21],
    ];
    for (const [x0, z0, x1, z1] of GAL) {
      b.face("marble", x0, GY, z1, 1, 0, 0, 0, 0, -1, x1 - x0, z1 - z0, {
        uv: "top",
        tint: [0.7, 0.66, 0.6],
      });
      b.face("coffer", x0, GY - 0.45, z0, 1, 0, 0, 0, 0, 1, x1 - x0, z1 - z0, {
        uv: "top",
        tint: [0.5, 0.46, 0.4],
      });
      b.col(x0, GY - 0.45, z0, x1, GY, z1, {
        tag: "floor",
        surface: "concrete",
      });
    }
    for (const gx of [-9, 9]) {
      b.boxMM("gilt", gx - 0.25, GY - 0.5, -21, gx + 0.25, GY + 0.05, 0, {
        tint: [0.6, 0.48, 0.28],
      });
      K.railing(b, gx, -21, gx, -0.3, GY, {
        mat: "brass",
        handMat: "mahogany",
        step: 0.3,
        h: 1.0,
      });
    }
    b.boxMM("gilt", -9, GY - 0.5, -21.25, 9, GY + 0.05, -20.75, {
      tint: [0.6, 0.48, 0.28],
    });
    K.railing(b, -9, -21, -2.6, -21, GY, {
      mat: "brass",
      handMat: "mahogany",
      step: 0.3,
      h: 1.0,
    });
    K.railing(b, 2.6, -21, 9, -21, GY, {
      mat: "brass",
      handMat: "mahogany",
      step: 0.3,
      h: 1.0,
    });
    for (const gx of [-9, 9])
      for (const cz of [-4, -9, -14, -21]) {
        K.column(b, gx, 0, cz, 0.42, GY - 0.5, {
          kind: "doric",
          mat: "marble",
          tint: [0.86, 0.82, 0.76],
          flutes: false,
        });
        K.column(b, gx, GY + 1.05, cz, 0.36, 11 - GY - 1.05, {
          kind: "ionic",
          mat: "marble",
          tint: [0.86, 0.82, 0.76],
          flutes: true,
        });
        b.col(gx - 0.45, 0, cz - 0.45, gx + 0.45, 11, cz + 0.45, {
          tag: "column",
          walkable: false,
        });
      }
    // the grand stair (centre, up to the north gallery) with brass rails, red runner
    K.stairs(b, -2.5, -21, 2.5, -9.2, 0, GY, "-z", {
      mat: "marble",
      tint: [0.82, 0.78, 0.72],
      rail: "both",
      railMat: "brass",
      handMat: "mahogany",
    });
    K.stairRunner(b, -2.5, -21, 2.5, -9.2, 0, GY, "-z", 2.2, {
      mat: "carpet",
      tint: [0.95, 0.9, 0.88],
      rods: true,
    });
    b.cyl("brass", -2.55, 0, -9.0, 0.16, 0.12, 1.2, 8, {
      tint: [0.6, 0.48, 0.28],
    });
    b.cyl("brass", 2.55, 0, -9.0, 0.16, 0.12, 1.2, 8, {
      tint: [0.6, 0.48, 0.28],
    });
    for (const s of [-1, 1]) {
      b.geo("lamp", K.sphereGeo(), {
        x: s * 2.55,
        y: 1.45,
        z: -9.0,
        s: 0.2,
        tint: s < 0 ? [0.9, 0.72, 0.45] : [0.3, 0.3, 0.28],
      });
    }
    b.glow(-2.55, 1.45, -9.0, [0.6, 0.45, 0.25], 1.4);
    b.light(-2.55, 1.6, -8.5, warm, 0.5, 5, { box: LB });
    // coffered ceiling chandeliers: one dim, one dead, one gone (hook + chain)
    K.chandelier(b, 0, 8.6, -6, 11, {
      r: 1.3,
      arms: 10,
      intensity: 0.9,
      radius: 11,
      color: dim,
      lightOpts: { box: LB },
    });
    K.chandelier(b, 0, 8.6, -16, 11, { r: 1.3, arms: 10, dead: true });
    b.light(0, 3.0, -12, warm, 0.25, 18, { box: LB, wrap: 0.7 });
    b.light(0, 2.6, -3.2, day, 0.32, 9, { box: LB, wrap: 0.85 }); // grey daylight spilling in round the revolving door
    for (const lx of [-6, 6])
      b.light(lx, 1.6, -12, dim, 0.2, 8, { box: LB, wrap: 0.9 }); // low bounce so furniture fronts read
    // north wall: elevator bank (ground floor) + the gallery stair door
    K.elevatorDoor(b, -12, 0, -25.9, 0, 1, { floor: "15" });
    K.elevatorDoor(b, -6, 0, -25.9, 0, 1, { floor: "L" });
    K.elevatorDoor(b, 6, 0, -25.9, 0, 1, { floor: "8" });
    K.elevatorDoor(b, 12, 0, -25.9, 0, 1, { floor: "22", open: 1.1 });
    b.plate(
      "art",
      -9,
      3.6,
      -25.88,
      0,
      1,
      3.4,
      0.4,
      K.signCell("ppn_ho_elev", "ELEVATORS — ALL FLOORS", 384, 44, {
        bg: "#1c1a14",
        fg: "#d8b860",
        font: "Georgia, serif",
      }),
      { off: 0 },
    );
    b.plate(
      "art",
      12,
      1.5,
      -25.84,
      0,
      1,
      1.2,
      0.35,
      K.signCell("ppn_ho_ooo", "OUT OF ORDER", 200, 56, {
        bg: "#e0d8c0",
        fg: "#8e2a22",
        font: "Arial Black, sans-serif",
      }),
      { off: 0 },
    );
    b.boxMM("paint_black", 11.4, -1.5, -27.5, 12.6, 2.4, -26.05, {
      tint: [0.03, 0.03, 0.03],
      faces: "s",
    });
    K.door(ctx, {
      pos: K.world(ctx, -12, 1.3, -25.4),
      label: "Elevator — Floor 15",
      verb: "Ride",
      sound: "door_open",
      target: { x: O.x - 27.8, y: O.y + 0.05, z: O.z - 89, yaw: -HP },
    });
    {
      const sx = 0;
      b.boxMM("mahogany", sx - 0.7, GY, -26, sx + 0.7, GY + 2.3, -25.85, {
        tint: [0.45, 0.28, 0.2],
      });
      b.plate(
        "art",
        sx,
        GY + 2.7,
        -25.84,
        0,
        1,
        2.4,
        0.35,
        K.signCell("ppn_ho_stair", "STAIRS — GUEST FLOORS", 320, 44, {
          bg: "#1c1a14",
          fg: "#d8b860",
          font: "Georgia, serif",
        }),
        { off: 0 },
      );
      K.door(ctx, {
        pos: K.world(ctx, sx, GY + 1.3, -25.5),
        label: "Stairwell — Floor 15",
        verb: "Climb",
        sound: "door_open",
        target: { x: O.x + 22.6, y: O.y + 0.05, z: O.z - 89, yaw: HP },
      });
    }
    // the front desk (under the east gallery): mahogany counter, bell, register, key cubbies, the neon
    {
      const dx = 11.2;
      b.boxMM("mahogany", dx - 0.5, 0, -17.5, dx + 0.5, 1.12, -3.5, {
        tint: [0.45, 0.26, 0.18],
        faces: "nsewt",
      });
      b.boxMM("marble_black", dx - 0.62, 1.12, -17.6, dx + 0.55, 1.18, -3.4, {
        tint: [0.4, 0.38, 0.36],
        faces: "nsewtb",
      });
      for (let k = 0; k < 7; k++)
        b.boxMM(
          "gilt",
          dx - 0.52,
          0.2,
          -16.8 + k * 2,
          dx - 0.5,
          0.95,
          -15.6 + k * 2,
          { tint: [0.55, 0.45, 0.26] },
        );
      b.col(dx - 0.5, 0, -17.5, dx + 0.5, 1.18, -3.5, {
        tag: "furniture",
        surface: "wood",
      });
      b.cyl("brass", dx - 0.2, 1.18, -11, 0.07, 0.03, 0.07, 10);
      b.pipe("brass", dx - 0.2, 1.25, -11, dx - 0.2, 1.29, -11, 0.01, 3);
      b.box("leather", dx - 0.1, 1.18, -9.4, 0.5, 0.06, 0.36, {
        tint: [0.3, 0.14, 0.1],
      });
      b.box("flat", dx - 0.1, 1.241, -9.4, 0.46, 0.004, 0.32, {
        tint: [0.86, 0.84, 0.74],
      });
      b.plate("art", 14.88, 2.5, -13.5, -1, 0, 6.0, 2.6, K.cubbyCell(), {
        off: 0,
      });
      b.plate("art", 14.88, 2.5, -3.9, -1, 0, 3.4, 2.6, K.cubbyCell(), {
        off: 0,
      });
      b.plate(
        "art",
        14.88,
        4.2,
        -8,
        -1,
        0,
        2.2,
        0.35,
        K.signCell("ppn_ho_switch", "SWITCHBOARD", 256, 40, {
          bg: "#1c1a14",
          fg: "#d8b860",
          font: "Georgia, serif",
        }),
        { off: 0 },
      );
      b.plate(
        "art",
        14.88,
        3.0,
        -20,
        -1,
        0,
        1.6,
        0.32,
        K.signCell("ppn_ho_mgr", "MANAGER", 200, 40, {
          bg: "#1c1a14",
          fg: "#d8b860",
          font: "Georgia, serif",
        }),
        { off: 0 },
      );
      // the neon slogan, on its own mesh so it can flicker
      ctx.neonDesk = {
        rect: K.neonCell("ppn_ho_desk", "PEnnsylvania 6-5000", 768, 128, {
          color: "#ff4020",
          font: "Georgia, serif",
          italic: true,
        }),
        pos: [14.8, 4.4, -13.5],
        n: [-1, 0],
        w: 5.2,
        h: 0.9,
      };
      b.light(13.6, 4.4, -13.5, [1, 0.3, 0.15], 0.5, 6, { box: LB });
      K.lamp(b, dx, 3.8, -6, "pendant", warm, 0.55, 6, {
        ceil: GY - 0.45,
        lightOpts: { box: LB },
      });
      K.lamp(b, dx, 3.8, -15, "pendant", warm, 0, 6, {
        ceil: GY - 0.45,
        dead: true,
      });
    }
    K.hingedDoor(ctx, b, {
      id: "ho_switch",
      x: 15,
      z: -8,
      y: 0,
      w: 1.1,
      h: 2.3,
      axis: "z",
      hinge: -1,
      swing: 1,
      mat: "mahogany",
      tint: [0.45, 0.28, 0.2],
      glass: true,
      label: "Switchboard — Staff Only",
      sign: K.signCell("ppn_door_switch", "OPERATORS", 200, 60, {
        bg: "#e0d8c0",
        fg: "#1c1a14",
        font: "Georgia, serif",
        weather: false,
      }),
    });
    K.hingedDoor(ctx, b, {
      id: "ho_mgr",
      x: 15,
      z: -20,
      y: 0,
      w: 1.1,
      h: 2.3,
      axis: "z",
      hinge: 1,
      swing: 1,
      mat: "mahogany",
      tint: [0.45, 0.28, 0.2],
      lock: PV.LOCKS.hotel_mgr,
      label: "Manager's Office",
      sign: K.signCell("ppn_door_mgr", "MANAGER — PRIVATE", 256, 60, {
        bg: "#e0d8c0",
        fg: "#1c1a14",
        font: "Georgia, serif",
        weather: false,
      }),
    });
    // lobby furniture: sofa groups, dead palms, luggage carts, newsstand, clock pillar, the barricade
    for (const [sx, sz, yaw] of [
      [-5.5, -4.5, 0.2],
      [5.5, -5.0, -0.25],
      [-5.6, -15.5, PI - 0.1],
      [6.0, -16.2, PI + 0.3],
    ]) {
      K.sofa(b, sx, 0, sz, 2.6, yaw, {
        mat: "hotel_red",
        tint: [0.5, 0.16, 0.14],
      });
      K.roundTable(
        b,
        sx + Math.sin(yaw) * -1.5,
        0,
        sz + Math.cos(yaw) * -1.5,
        0.45,
        { mat: "mahogany", h: 0.5 },
      );
    }
    b.hplate("carpet", 0, 0.006, -5.5, 8, 5, 0, null, {
      tint: [0.45, 0.14, 0.12],
      grime: 0.6,
    });
    for (const [px, pz] of [
      [-13.5, -1.5],
      [13.5, -1.5],
      [-7.5, -24.5],
      [7.5, -24.5],
    ]) {
      b.cyl("ceramic", px, 0, pz, 0.45, 0.35, 0.8, 10, {
        tint: [0.6, 0.5, 0.35],
      });
      for (let k = 0; k < 7; k++) {
        const a = (k / 7) * PI * 2;
        b.beam(
          "wood_rotten",
          px,
          0.8,
          pz,
          px + Math.cos(a) * 0.9,
          1.8 + r() * 0.8,
          pz + Math.sin(a) * 0.9,
          0.05,
          0.02,
          { tint: [0.4, 0.32, 0.2] },
        );
      }
      b.pipe("wood_rotten", px, 0.8, pz, px + 0.1, 2.4, pz, 0.06, 5, {
        tint: [0.45, 0.35, 0.25],
      });
      b.col(px - 0.45, 0, pz - 0.45, px + 0.45, 0.8, pz + 0.45, {
        tag: "furniture",
      });
    }
    const luggage = (lx, lz, yaw) => {
      const Lc = K.L(lx, lz, yaw);
      b.box("brass", lx, 0.1, lz, 0.9, 0.05, 1.5, {
        yaw,
        tint: [0.55, 0.45, 0.26],
      });
      for (const [u, v] of [
        [-0.42, -0.72],
        [0.42, -0.72],
        [-0.42, 0.72],
        [0.42, 0.72],
      ]) {
        const p = Lc(u, v);
        b.cyl("rubber", p[0], 0, p[1], 0.06, 0.06, 0.1, 6);
      }
      for (const u of [-0.42, 0.42]) {
        const p = Lc(u, 0.72);
        b.pipe("brass", p[0], 0.15, p[1], p[0], 1.9, p[1], 0.02, 4, {
          tint: [0.55, 0.45, 0.26],
        });
      }
      const t0 = Lc(-0.42, 0.72),
        t1 = Lc(0.42, 0.72);
      b.beam("brass", t0[0], 1.9, t0[1], t1[0], 1.9, t1[1], 0.04, 0.04, {
        tint: [0.55, 0.45, 0.26],
      });
      for (let k = 0; k < 3; k++) {
        const p = Lc((r() - 0.5) * 0.2, -0.45 + k * 0.45);
        K.suitcase(b, p[0], 0.13, p[1], yaw + HP + (r() - 0.5) * 0.2, {
          stand: k === 1,
          w: 0.66,
          d: 0.42,
          h: 0.2,
        });
      }
      b.ocol(lx, lz, 0.9, 1.5, 0, 1.0, yaw, { tag: "furniture" });
    };
    luggage(-12.5, -8.5, 0.4);
    luggage(12.8, -21.5, -0.3 + PI / 2);
    // the guests' last barricade: luggage, a sofa on its end, a desk, the bodies behind it
    for (let k = 0; k < 10; k++) {
      const bx = (k < 5 ? -5.2 : 1.5) + (k % 5) * 0.8 + (r() - 0.5) * 0.2;
      const lay = k % 3 === 2;
      K.suitcase(
        b,
        bx,
        lay ? 0.22 : 0,
        -7.4 + (r() - 0.5) * 0.3,
        (r() - 0.5) * 0.6,
        { stand: !lay, w: 0.72, d: 0.5, h: 0.22 },
      );
    }
    K.trunk(b, -4.9, 0, -7.1, 0.25, { tint: [0.4, 0.46, 0.4] });
    K.trunk(b, 2.6, 0, -7.2, -0.2, {});
    K.suitcase(b, -2.9, 0.62, -7.2, 0.4, { w: 0.8, d: 0.5, h: 0.24 });
    // a sofa stood on its end to plug the gap
    {
      const sL = K.L(5.3, -7.5, 0.3);
      b.box("hotel_red", 5.3, 0, -7.5, 0.72, 2.3, 0.85, {
        yaw: 0.3,
        tint: [0.62, 0.3, 0.26],
      });
      const q = sL(0, -0.52);
      b.box("mahogany", q[0], 0, q[1], 0.8, 2.4, 0.18, { yaw: 0.3 });
    }
    b.col(-5.6, 0, -7.7, -1.3, 0.8, -7.1, { tag: "rubble" });
    b.col(1.1, 0, -7.7, 5.7, 0.8, -7.1, { tag: "rubble" });
    K.skel(ctx, -3.2, 0, -8.4, 2.8, "curled");
    K.skel(ctx, 3.4, 0, -8.6, 0.4, "lying");
    for (let k = 0; k < 6; k++)
      b.hplate(
        "decal",
        -10 + r() * 20,
        0.012 + k * 0.0004,
        -22 + r() * 18,
        1.8,
        1.6,
        r() * 6,
        K.decal(k % 2 ? "blood" : "grime", 30 + k),
      );
    // newsstand kiosk (SW), clock pillar
    {
      const nx = -12.8,
        nz = -3.4;
      b.boxMM("mahogany", nx - 1.3, 0, nz - 0.8, nx + 1.3, 1.0, nz + 0.8, {
        tint: [0.4, 0.24, 0.16],
      });
      b.boxMM("mahogany", nx - 1.4, 2.4, nz - 0.9, nx + 1.4, 2.6, nz + 0.9, {
        tint: [0.4, 0.24, 0.16],
        faces: "nsewtb",
      });
      for (const s of [-1, 1])
        b.boxMM(
          "mahogany",
          nx + s * 1.3 - 0.06,
          1.0,
          nz - 0.06,
          nx + s * 1.3 + 0.06,
          2.4,
          nz + 0.06,
          { tint: [0.4, 0.24, 0.16] },
        );
      for (let k = 0; k < 10; k++)
        b.box(
          "flat",
          nx - 1.1 + k * 0.22,
          1.0,
          nz - 0.5 + (k % 2) * 0.3,
          0.2,
          0.02 + (k % 3) * 0.01,
          0.3,
          {
            yaw: (r() - 0.5) * 0.3,
            tint: r.pick([
              [0.86, 0.84, 0.76],
              [0.8, 0.3, 0.2],
              [0.3, 0.4, 0.6],
            ]),
          },
        );
      b.plate(
        "art",
        nx,
        2.5,
        nz + 0.91,
        0,
        1,
        2.4,
        0.2,
        K.signCell("ppn_ho_news", "NEWS · SILVER TORCH · FIZZO COLA", 320, 28, {
          bg: "#8e2a22",
          fg: "#f0e0c0",
          font: "Arial Black, sans-serif",
        }),
        { off: 0 },
      );
      b.col(nx - 1.3, 0, nz - 0.8, nx + 1.3, 1.0, nz + 0.8, {
        tag: "furniture",
      });
    }
    b.plate(
      "art",
      9.45,
      2.8,
      -9,
      1,
      0,
      0.7,
      0.7,
      K.paint("art", "ppn_clock947", 128, 128, function (x, X, Y, W, H) {
        x.clearRect(X, Y, W, H);
        const cx = X + W / 2,
          cy = Y + H / 2;
        x.fillStyle = "#b8924a";
        x.beginPath();
        x.arc(cx, cy, 62, 0, 6.3);
        x.fill();
        x.fillStyle = "#e8e0c8";
        x.beginPath();
        x.arc(cx, cy, 54, 0, 6.3);
        x.fill();
        x.fillStyle = "#1a1208";
        for (let k = 0; k < 12; k++) {
          const a = (k / 12) * PI * 2;
          x.fillRect(
            cx + Math.cos(a) * 46 - 2,
            cy + Math.sin(a) * 46 - 2,
            4,
            4,
          );
        }
        x.strokeStyle = "#1a1208";
        x.lineWidth = 4;
        const ha = ((9 + 47 / 60) / 12) * PI * 2 - PI / 2,
          ma = (47 / 60) * PI * 2 - PI / 2;
        x.beginPath();
        x.moveTo(cx, cy);
        x.lineTo(cx + Math.cos(ha) * 28, cy + Math.sin(ha) * 28);
        x.stroke();
        x.lineWidth = 2.5;
        x.beginPath();
        x.moveTo(cx, cy);
        x.lineTo(cx + Math.cos(ma) * 42, cy + Math.sin(ma) * 42);
        x.stroke();
        x.strokeStyle = "rgba(40,30,20,0.6)";
        x.lineWidth = 1;
        x.beginPath();
        x.moveTo(cx - 40, cy - 20);
        x.lineTo(cx + 10, cy + 40);
        x.stroke();
      }),
      { off: 0.45 },
    );
    K.clutter(b, -14.5, -25.5, 14.5, -0.5, 0, {
      n: 30,
      seed: 1301,
      kinds: ["paper", "glass", "debris", "can", "chair", "panel"],
      avoid: [
        [-2.7, -21.2, 2.7, -8.8],
        [10.4, -18, 12, -3],
        [-5.8, -7.9, 5.9, -6.9],
        [-1.5, -3.4, 1.5, 0],
      ],
    });
    // gallery dressing: the writing room (west) & a lounge (east), a Maniac nest
    for (let k = 0; k < 3; k++) {
      K.table(b, -12.5, GY, -4 - k * 5, 1.4, 0.8, {
        mat: "mahogany",
        tint: [0.45, 0.28, 0.2],
      });
      K.chair(b, -12.5, GY, -3.3 - k * 5, PI, {
        mat: "mahogany",
        fallen: k === 1,
      });
    }
    K.skel(ctx, -12.6, GY, -12.6, 1.2, "sitting");
    K.sofa(b, 13.6, GY, -8, 3.0, -HP, {
      mat: "hotel_red",
      tint: [0.5, 0.16, 0.14],
    });
    for (let k = 0; k < 3; k++)
      b.box(
        "mattress",
        11 + r() * 2,
        GY + k * 0.12,
        -16 + r() * 2,
        1.4,
        0.12,
        1.9,
        { yaw: r() * 3, tint: [0.55, 0.48, 0.36] },
      );
    for (let k = 0; k < 6; k++)
      b.pipe(
        "bone",
        11 + r() * 3,
        GY + 0.05,
        -17 + r() * 3,
        11 + r() * 3,
        GY + 0.08,
        -17 + r() * 3,
        0.03,
        4,
      );
    b.hplate("decal", 12, GY + 0.012, -15.5, 3, 3, 0.4, K.decal("blood", 41));
    for (const [lx, lz] of [
      [-12, -6],
      [-12, -18],
      [12, -4],
      [12, -20],
      [-6, -23.5],
      [6, -23.5],
    ])
      K.lamp(b, lx, GY + 3.4, lz, "globe", dim, (lx + lz) % 3 ? 0 : 0.35, 5, {
        ceil: 11,
        dead: !((lx + lz) % 3 === 0),
        lightOpts: { box: LB },
      });
    b.light(-12, GY + 2, -12, day, 0.2, 9, { box: LB });

    // ================================================= SWITCHBOARD ROOM (Mabel's exchange)
    {
      const SB = [14.8, -1, -12.2, 24.2, 4, -3.8];
      K.room(b, ctx, {
        x0: 15,
        z0: -12,
        x1: 24,
        z1: -4,
        y: 0,
        h: 3.6,
        floor: "parquet",
        fc: [0.5, 0.4, 0.3],
        wall: "wallpaper",
        wc: [0.78, 0.72, 0.6],
        ceil: "tin",
        cc: [0.55, 0.5, 0.42],
        wain: "oak",
        wainC: [0.45, 0.33, 0.22],
        wainH: 1.0,
      });
      for (const [sz, live] of [
        [-10.3, false],
        [-8.0, true],
        [-5.7, false],
      ])
        K.switchboard(b, 23.2, 0, sz, HP, 2.2, { live });
      b.light(22.3, 1.6, -8.0, amber, 0.8, 4.5, { box: SB });
      K.lamp(b, 19.5, 2.9, -8, "pendant", warm, 0.7, 7, {
        ceil: 3.6,
        lightOpts: { box: SB },
      });
      // Mabel's chair (she sits at position 2) + the others
      for (const [cz, taken] of [
        [-10.3, false],
        [-8.0, true],
        [-5.7, false],
      ]) {
        if (!taken)
          K.chair(b, 22.0, 0, cz, -HP, { mat: "oak", tint: [0.5, 0.36, 0.24] });
      }
      K.chair(b, 22.1, 0, -8.0, -HP, { mat: "oak", tint: [0.5, 0.36, 0.24] });
      // her corner: cot, blanket, hot plate, the coffee can, a radio, photo of Walt, the calendar, slips everywhere
      K.bed(b, 16.2, 0, -10.5, HP, { w: 0.8, l: 1.9, tint: [0.55, 0.5, 0.42] });
      K.table(b, 16.0, 0, -5.2, 1.2, 0.7, {
        mat: "oak",
        tint: [0.5, 0.36, 0.24],
      });
      b.cyl("metal", 15.8, 0.76, -5.2, 0.14, 0.14, 0.05, 10, {
        tint: [0.4, 0.4, 0.38],
      });
      b.cyl("rust", 16.3, 0.76, -5.1, 0.08, 0.08, 0.18, 8, {
        tint: [0.6, 0.45, 0.3],
      });
      b.plate(
        "art",
        15.12,
        2.0,
        -6.6,
        1,
        0,
        0.5,
        0.65,
        K.photo("mug", 3, 128, 160),
        { off: 0.01 },
      );
      b.plate(
        "art",
        15.12,
        2.0,
        -9.0,
        1,
        0,
        0.8,
        1.0,
        K.paint("art", "ppn_calendar", 128, 160, function (x, X, Y, W, H) {
          x.fillStyle = "#e8e0c8";
          x.fillRect(X, Y, W, H);
          x.fillStyle = "#8e2a22";
          x.fillRect(X, Y, W, 34);
          x.fillStyle = "#f0e8d0";
          x.font = "bold 15px Georgia";
          x.textAlign = "center";
          x.fillText("MARCH 1967", X + W / 2, Y + 22);
          x.fillStyle = "#2a2418";
          x.font = "9px Arial";
          for (let d = 1; d <= 31; d++) {
            const c = (d + 4) % 7,
              rr = Math.floor((d + 4) / 7);
            x.fillText(String(d), X + 10 + c * 17, Y + 50 + rr * 20);
          }
          const c23 = (23 + 4) % 7,
            r23 = Math.floor(27 / 7);
          x.strokeStyle = "#c02020";
          x.lineWidth = 2;
          x.beginPath();
          x.arc(X + 10 + c23 * 17, Y + 47 + r23 * 20, 9, 0, 6.3);
          x.stroke();
          x.fillStyle = "#c02020";
          x.font = "italic 9px Georgia";
          x.fillText("Walt calls 8!", X + W / 2, Y + H - 6);
          K.grain(x, X, Y, W, H, 30, 1311);
        }),
        { off: 0.01 },
      );
      const slips = K.paint(
        "art",
        "ppn_slips",
        256,
        128,
        function (x, X, Y, W, H) {
          x.clearRect(X, Y, W, H);
          const rr = K.rng("slips");
          for (let k = 0; k < 16; k++) {
            const px = X + rr() * (W - 44),
              py = Y + rr() * (H - 30);
            x.save();
            x.translate(px + 20, py + 14);
            x.rotate((rr() - 0.5) * 0.5);
            x.fillStyle = rr() < 0.7 ? "#f0b8c0" : "#f0e8b0";
            x.fillRect(-20, -14, 40, 28);
            x.fillStyle = "#8e2a22";
            x.font = "bold 5px Arial";
            x.fillText("WHILE YOU WERE OUT", -18, -8);
            x.fillStyle = "#2a2a3a";
            x.font = "italic 6px Georgia";
            x.fillText(
              rr.pick([
                "Walt? — no",
                "line 12 rang",
                "not him",
                "wrong #",
                "static",
                "call back 8?",
              ]),
              -16,
              4,
            );
            x.restore();
          }
        },
      );
      b.plate("art", 15.12, 2.2, -11.2, 1, 0, 1.4, 0.7, slips, { off: 0.012 });
      b.plate("art", 19.5, 2.3, -11.88, 0, 1, 2.8, 1.4, slips, { off: 0.012 });
      b.plate("art", 19.5, 2.4, -4.12, 0, -1, 1.2, 1.2, K.posterCell("band"), {
        off: 0.01,
      });
      K.loot(ctx, "radio", 16.4, 0.76, -5.3, -HP, {});
      K.loot(ctx, "footlocker", 17.8, 0, -11.3, PI, {
        name: "Mabel's Footlocker",
        owner: "settlers",
        loot: "dresser",
      });
      K.anchor(ctx, "dottie", 22.25, 0, -8.0);
      K.note(ctx, "ppn_note_dottie_log", 23.0, 0.78, -9.3, {
        name: "Operator's Log, Line 12",
        title: "Operator's Log — Line 12",
        text: "LINE 12 (reserved: D.K., personal)\n\n03/05  20:00  no call\n03/06  20:00  no call\n03/07  20:00  no call\n...\n[The same line, in the same careful hand, fills this book and the six under the desk. Near the end the dates stop and it just says:]\n\n20:00  no call\n20:00  no call\n20:00  no call",
      });
    }

    // ================================================= MANAGER'S OFFICE (locked 75 / passkey)
    {
      const MB = [14.8, -1, -24.2, 24.2, 4, -15.8];
      K.room(b, ctx, {
        x0: 15,
        z0: -24,
        x1: 24,
        z1: -16,
        y: 0,
        h: 3.6,
        floor: "carpet",
        fc: [0.36, 0.14, 0.12],
        wall: "wallpaper_green",
        wc: [0.7, 0.72, 0.64],
        ceil: "coffer",
        cc: [0.5, 0.48, 0.44],
        wain: "mahogany",
        wainC: [0.4, 0.24, 0.16],
        wainH: 1.1,
      });
      K.lamp(b, 19.5, 2.8, -20, "globe", dim, 0.7, 7, {
        ceil: 3.6,
        lightOpts: { box: MB },
      });
      K.table(b, 21, 0, -20, 2.2, 1.0, {
        mat: "mahogany",
        tint: [0.45, 0.26, 0.18],
      });
      b.box("mahogany", 21, 0, -20, 2.1, 0.7, 0.9, {
        tint: [0.38, 0.22, 0.15],
      });
      K.chair(b, 22.2, 0, -20, HP, { mat: "leather", tint: [0.3, 0.16, 0.1] });
      K.terminal(
        ctx,
        "ppn_term_hotelmgr",
        20.8,
        0.76,
        -20.3,
        -HP,
        {
          title: "HOTEL PENNSYLVANIA — MANAGER",
          header: "MERIDIAN TELETYPE CO. — TELELINK — STATLER-PENN HOTELS",
          entries: [
            {
              title: "Hotel safe",
              learn: "ppn_hotel_safe",
              text: "Office safe: 1-9-1-9, the year we opened. Change it? We have been meaning to since 1919.",
            },
            {
              title: "Night log 03/04/1967",
              text: "Full house again. Iceland leave men and their girls, and every one of them wants a room with a view of Penn Station so they can watch the trains come in. I told them the view is of a railroad station. They said that is the point.\n\nThe Café Rouge is sold out for tomorrow's broadcast. Johnny Starr wants a second piano. Johnny Starr can want.",
            },
            {
              title: "Night log 03/05/1967",
              text: 'Sirens during the breakfast service. Half the guests ran for the Penn Station shelters. The other half would not leave the Café Rouge — Starr told the band to keep playing "so nobody panics." Nobody panicked. Nobody left.\n\nI have locked the office. The switchboard girl is still at her post. I told her to go down to the station. She said she is waiting on a call.',
            },
            {
              title: "Maintenance: Café Rouge",
              text: 'Guest reports of "a green glow" from the ballroom. Engineering: it is not the lighting. Engineering will not go back in there.\n\nRecommend we close the Café Rouge "for refurbishment" and brick up the door. — (unsigned)',
            },
            {
              title: "Staff notice",
              text: "The passkey is to be kept by the night operator at ALL TIMES. Housekeeping may borrow it for Floor 15 only. The scavenger who has moved into 1515 is NOT housekeeping.",
            },
          ],
        },
        "bare",
      );
      K.loot(ctx, "safe", 23.6, 0, -17.2, HP, {
        loot: "safe",
        name: "Hotel Safe",
        locked: 0,
        lock: PV.LOCKS.hotel_safe,
        items: [
          ["scrip", 120],
          ["old_dollars", 4],
        ],
      });
      K.loot(ctx, "file_cabinet", 15.5, 0, -23.4, -HP, {
        loot: "file_cabinet",
        name: "Guest Ledgers",
      });
      K.framed(b, 19.5, 2.0, -23.88, 0, 1, 1.2, 0.9, K.painting(5, 240, 192), {
        frame: "gold",
      });
      b.plate(
        "art",
        23.88,
        2.0,
        -22.5,
        -1,
        0,
        0.9,
        1.2,
        K.posterCell("rooms"),
        { off: 0.01 },
      );
      K.skel(ctx, 18.2, 0, -17.2, 2.0, "lying");
      b.hplate(
        "decal",
        18.3,
        0.012,
        -17.4,
        1.4,
        1.2,
        1.1,
        K.decal("blood", 51),
      );
      K.clutter(b, 15.5, -23.5, 23.5, -16.5, 0, {
        n: 10,
        seed: 1401,
        kinds: ["paper", "books", "glass"],
        avoid: [[19.7, -21, 22.6, -19]],
      });
    }

    // ================================================= CAFÉ ROUGE
    {
      K.room(b, ctx, {
        x0: -43,
        z0: -28,
        x1: -15,
        z1: 0,
        y: 0,
        h: 10,
        floor: "carpet",
        fc: [0.42, 0.14, 0.12],
        wall: "rouge_wall",
        wc: [0.72, 0.36, 0.3],
        ceil: "coffer",
        cc: [0.52, 0.34, 0.26],
        wain: "mahogany",
        wainC: [0.42, 0.22, 0.15],
        wainH: 1.3,
        cornice: true,
        corniceMat: "gilt",
        trimMat: "gilt",
      });
      // parquet dance floor + the gilt border
      b.face("parquet", -35, 0.008, -7, 1, 0, 0, 0, 0, -1, 14, 14, {
        uv: "top",
        tint: [0.62, 0.48, 0.32],
        grime: 0.6,
      });
      b.boxMM("gilt", -35.1, 0, -21.1, -20.9, 0.02, -6.9, {
        tint: [0.5, 0.4, 0.24],
        faces: "t",
      });
      // gilt pilasters + mirror panels along the walls
      for (let k = 0; k < 8; k++) {
        const z = -26 + k * 3.5;
        K.pilaster(b, -15.1, 0, z, -1, 0, 0.5, 9.6, {
          mat: "gilt",
          tint: [0.6, 0.48, 0.28],
          depth: 0.12,
        });
        if (k < 7 && Math.abs(z + 1.75 + 13) > 2)
          b.plate("glass", -15.12, 4.2, z + 1.75, -1, 0, 1.9, 3.6, null, {
            tint: [0.34, 0.26, 0.24],
            off: 0.01,
          });
      }
      for (let k = 0; k < 8; k++) {
        const x = -40 + k * 3.5;
        K.pilaster(b, x, 0, -27.9, 0, 1, 0.5, 9.6, {
          mat: "gilt",
          tint: [0.6, 0.48, 0.28],
          depth: 0.12,
        });
        K.pilaster(b, x, 0, -0.1, 0, -1, 0.5, 9.6, {
          mat: "gilt",
          tint: [0.6, 0.48, 0.28],
          depth: 0.12,
        });
      }
      for (let k = 0; k < 7; k++) {
        const x = -38.25 + k * 3.5;
        if (Math.abs(x + 22) < 1.5) continue;
        b.plate("glass", x, 4.2, -27.88, 0, 1, 1.9, 3.6, null, {
          tint: [0.34, 0.26, 0.24],
          off: 0.01,
        });
        b.plate("glass", x, 4.2, -0.12, 0, -1, 1.9, 3.6, null, {
          tint: [0.34, 0.26, 0.24],
          off: 0.01,
        });
      }
      b.plate(
        "art",
        -15.12,
        5.1,
        -13,
        -1,
        0,
        3.8,
        0.6,
        K.signCell("ppn_rouge_sign", "CAFÉ ROUGE", 384, 60, {
          bg: "#5a1410",
          fg: "#e8c060",
          font: "Georgia, serif",
        }),
        { off: 0 },
      );
      b.plate(
        "art",
        -14.9,
        4.8,
        -13,
        1,
        0,
        3.4,
        0.6,
        K.signCell(
          "ppn_rouge_sign2",
          "CAFÉ ROUGE — DINING · DANCING",
          384,
          60,
          { bg: "#1c1a14", fg: "#d8b860", font: "Georgia, serif" },
        ),
        { off: 0.02 },
      );
      // the bandstand (west end): raised stage, two tiers of risers, the sunburst shell, the Stardust Orchestra's things
      const SX0 = -43,
        SX1 = -35.5,
        SZ0 = -22,
        SZ1 = -6,
        SY = 0.9;
      b.boxMM("mahogany", SX0, 0, SZ0, SX1, SY, SZ1, {
        tint: [0.42, 0.24, 0.16],
        faces: "ent",
      });
      b.face(
        "parquet",
        SX0,
        SY + 0.005,
        SZ1,
        1,
        0,
        0,
        0,
        0,
        -1,
        SX1 - SX0,
        SZ1 - SZ0,
        { uv: "top", tint: [0.5, 0.36, 0.24] },
      );
      b.col(SX0, 0, SZ0, SX1, SY, SZ1, { tag: "floor", surface: "wood" });
      K.stairs(b, SX1, -16, SX1 + 1.2, -12, 0, SY, "-x", {
        mat: "mahogany",
        tint: [0.42, 0.24, 0.16],
      });
      b.boxMM("mahogany", SX0, SY, SZ0, SX0 + 2.6, SY + 0.45, SZ1, {
        tint: [0.4, 0.22, 0.15],
        faces: "et",
      });
      b.col(SX0, SY, SZ0, SX0 + 2.6, SY + 0.45, SZ1, {
        tag: "floor",
        surface: "wood",
      });
      b.boxMM("gilt", SX1 - 0.05, 0.05, SZ0, SX1 + 0.02, SY - 0.05, SZ1, {
        tint: [0.55, 0.42, 0.24],
        faces: "e",
      });
      // sunburst shell behind the band
      b.plate(
        "art",
        -42.85,
        5.2,
        -14,
        1,
        0,
        13,
        8.4,
        K.paint("art", "ppn_sunburst", 512, 330, function (x, X, Y, W, H) {
          const g = x.createLinearGradient(0, Y, 0, Y + H);
          g.addColorStop(0, "#2a0a0a");
          g.addColorStop(1, "#5a1410");
          x.fillStyle = g;
          x.fillRect(X, Y, W, H);
          const cx = X + W / 2,
            cy = Y + H * 0.98;
          for (let k = 0; k < 24; k++) {
            const a0 = PI + (k / 24) * PI,
              a1 = a0 + PI / 48;
            x.fillStyle = k % 2 ? "#c89a44" : "#8a5a24";
            x.beginPath();
            x.moveTo(cx, cy);
            x.arc(cx, cy, H * 0.95, a0, a1);
            x.fill();
          }
          x.fillStyle = "#2a0a0a";
          x.beginPath();
          x.arc(cx, cy, H * 0.42, PI, 0);
          x.fill();
          x.fillStyle = "#e8c060";
          x.font = "bold italic 44px Georgia";
          x.textAlign = "center";
          x.fillText("Stardust", cx, cy - H * 0.18);
          x.font = "bold 16px Georgia";
          x.fillText("JOHNNY STARR & HIS ORCHESTRA", cx, cy - H * 0.06);
          for (let k = 0; k < 40; k++) {
            x.fillStyle = "rgba(255,240,200,0.8)";
            x.beginPath();
            x.arc(
              X + Math.random() * W,
              Y + Math.random() * H * 0.6,
              1.5,
              0,
              6.3,
            );
            x.fill();
          }
          K.stains(x, X, Y, W, H, 14, 1501, 0.5, [20, 10, 5]);
          K.streaks(x, X, Y, W, H, 20, 1502, 0.3);
        }),
        { off: 0.01 },
      );
      // music stands with the SO monogram, chairs with the band still in them, piano, drums, the microphone
      for (let k = 0; k < 6; k++) {
        const tz = -20 + k * 2.6,
          tx = SX0 + 1.3,
          ty = SY + 0.45;
        b.box("gilt", tx + 0.8, ty, tz, 0.08, 0.95, 0.9, {
          tint: [0.55, 0.42, 0.24],
        });
        b.plate(
          "art",
          tx + 0.85,
          ty + 0.55,
          tz,
          1,
          0,
          0.8,
          0.8,
          K.signCell("ppn_so", "S", 96, 96, {
            bg: "#5a1410",
            fg: "#e8c060",
            font: "Georgia, serif",
            italic: true,
            border: "#e8c060",
          }),
          { off: 0.0 },
        );
        K.chair(b, tx, ty, tz, HP + PI, {
          mat: "gilt",
          tint: [0.5, 0.4, 0.24],
        });
        if (k % 2 === 0) K.skel(ctx, tx, ty + 0.45, tz, -HP, "seated");
      }
      for (let k = 0; k < 5; k++) {
        const tz = -19 + k * 3.2,
          tx = SX0 + 3.6;
        b.pipe("chrome", tx, SY, tz, tx, SY + 1.1, tz, 0.012, 3);
        b.box("chrome", tx, SY + 1.05, tz, 0.05, 0.35, 0.45, {
          yaw: 0,
          tint: [0.4, 0.4, 0.4],
        });
      }
      K.piano(b, -40.5, SY, -8.6, -HP + 0.3, {});
      K.drums(
        b,
        -40.8,
        SY + 0.45,
        -18.8,
        -HP,
        K.signCell("ppn_drumhead", "J★S", 128, 128, {
          bg: "#e8e0c8",
          fg: "#8e2a22",
          font: "Georgia, serif",
          italic: true,
          border: "#8e2a22",
        }),
      );
      {
        const mx = SX1 - 0.9,
          mz = -14;
        b.cyl("chrome", mx, SY, mz, 0.18, 0.14, 0.05, 10);
        b.pipe("chrome", mx, SY, mz, mx, SY + 1.55, mz, 0.015, 4);
        b.geo("chrome", K.sphereGeo(), {
          x: mx,
          y: SY + 1.62,
          z: mz,
          sx: 0.07,
          sy: 0.1,
          sz: 0.06,
          tint: [0.7, 0.7, 0.7],
        });
      }
      K.pickup(ctx, "ppn_baton", 1, SX1 - 1.4, SY + 0.02, -13.2, 0.8);
      // the green glow: radiation puddles, sick green light washing the bandstand, a rad source
      for (let k = 0; k < 5; k++)
        b.hplate(
          "decal",
          -40 + r() * 5,
          SY + 0.012 + k * 0.001,
          -18 + r() * 8,
          1.6 + r(),
          1.4 + r(),
          r() * 6,
          K.decal("rad", k),
        );
      for (let k = 0; k < 3; k++)
        b.hplate(
          "decal",
          -33 + r() * 6,
          0.013 + k * 0.001,
          -17 + r() * 6,
          1.5,
          1.3,
          r() * 6,
          K.decal("rad", 5 + k),
        );
      b.light(-39, 2.2, -14, green, 1.2, 11, { box: CR, wrap: 0.5 });
      b.light(-30, 0.6, -14, green, 0.4, 7, { box: CR });
      for (let k = 0; k < 5; k++)
        b.glow(
          -39.5 + r() * 3,
          1.4 + r() * 2,
          -17 + r() * 6,
          [0.12, 0.4, 0.1],
          2.4,
        );
      // chandeliers: one dead, one crashed onto the dance floor (chain + ceiling rose left), one dimly alight
      K.chandelier(b, -36, 7.4, -14, 10, { r: 1.5, arms: 12, dead: true });
      K.chandelier(b, -21.5, 7.4, -14, 10, {
        r: 1.5,
        arms: 12,
        intensity: 0.8,
        radius: 10,
        color: dim,
        lightOpts: { box: CR },
      });
      {
        const fx = -28.5,
          fz = -13.2;
        b.cyl("gilt", fx, 9.85, -14, 0.6, 0.4, 0.15, 12, {
          tint: [0.55, 0.42, 0.24],
        });
        for (let k = 0; k < 6; k++)
          b.beam(
            "brass",
            fx + 0.02 * k,
            9.8 - k * 0.35,
            -14,
            fx + 0.02 * k + 0.05,
            9.5 - k * 0.35,
            -14.03,
            0.05,
            0.05,
            { tint: [0.5, 0.4, 0.24] },
          );
        b.cyl("brass", fx, 0, fz, 1.6, 1.4, 0.35, 14, {
          tint: [0.45, 0.36, 0.22],
        });
        for (let k = 0; k < 14; k++) {
          const a = r() * 6.3,
            d = 0.4 + r() * 1.8;
          b.beam(
            "brass",
            fx + Math.cos(a) * d * 0.3,
            0.3,
            fz + Math.sin(a) * d * 0.3,
            fx + Math.cos(a) * d,
            0.05 + r() * 0.5,
            fz + Math.sin(a) * d,
            0.03,
            0.03,
            { tint: [0.5, 0.4, 0.24] },
          );
        }
        for (let k = 0; k < 60; k++) {
          const a = r() * 6.3,
            d = r() * 3.4;
          b.geo("crystal", K.sphereGeo(), {
            x: fx + Math.cos(a) * d,
            y: 0.03,
            z: fz + Math.sin(a) * d,
            sx: 0.03,
            sy: 0.02,
            sz: 0.05,
            ry: r() * 6,
            tint: [0.5, 0.48, 0.42],
          });
        }
        b.col(fx - 1.2, 0, fz - 1.2, fx + 1.2, 0.5, fz + 1.2, {
          tag: "rubble",
        });
        b.hplate("decal", fx, 0.014, fz, 4.4, 4.4, 0.3, K.decal("crack", 3));
      }
      // the tables, still laid: red cloths, candles, champagne buckets, the diners where they sat
      const tables = [
        [-32, -24.5],
        [-26, -24.5],
        [-20, -24.5],
        [-32, -3.5],
        [-26, -3.5],
        [-20, -3.5],
        [-18, -9.5],
        [-18, -18.5],
        [-33, -10.5],
        [-24, -20.5],
      ];
      tables.forEach(([tx, tz], i) => {
        if (i === 9) {
          b.cyl("wood_dark", tx, 0.45, tz, 0.9, 0.9, 0.05, 12, {
            tint: [0.4, 0.26, 0.18],
          });
          b.box("cloth_red", tx + 0.6, 0, tz + 0.2, 1.6, 0.02, 1.2, {
            yaw: 0.6,
            tint: [0.55, 0.14, 0.12],
          });
          return;
        } // overturned
        K.roundTable(b, tx, 0, tz, 0.9, {
          mat: "wood_dark",
          cloth: [0.62, 0.16, 0.14],
        });
        b.cyl("ceramic", tx + 0.3, 0.77, tz, 0.12, 0.12, 0.01, 10);
        b.cyl("ceramic", tx - 0.3, 0.77, tz + 0.2, 0.12, 0.12, 0.01, 10);
        b.cyl("lamp", tx, 0.77, tz - 0.1, 0.025, 0.025, 0.12, 6, {
          tint: [0.6, 0.55, 0.45],
        });
        if (i % 3 === 0) {
          b.cyl("silver", tx - 0.2, 0.77, tz - 0.35, 0.1, 0.12, 0.22, 10);
          b.cyl("glass_dark", tx - 0.2, 0.9, tz - 0.35, 0.035, 0.035, 0.25, 6);
        }
        for (let c = 0; c < 4; c++) {
          const a = c * HP + i * 0.3,
            cx = tx + Math.cos(a) * 1.25,
            cz = tz + Math.sin(a) * 1.25;
          K.chair(b, cx, 0, cz, -a - HP + PI, {
            mat: "gilt",
            tint: [0.5, 0.4, 0.24],
            seatMat: "hotel_red",
            fallen: (i + c) % 5 === 0,
          });
          if ((i + c) % 4 === 1) K.skel(ctx, cx, 0.45, cz, -a + HP, "seated");
        }
      });
      K.skel(ctx, -27, 0.01, -9.5, 0.4, "lying");
      K.skel(ctx, -24, 0.01, -16.5, 2.2, "curled");
      K.clutter(b, -42.5, -27.5, -15.5, -0.5, 0, {
        n: 26,
        seed: 1601,
        kinds: ["glass", "paper", "can", "debris", "chair"],
        avoid: [
          [-43, -22, -35, -6],
          [-30.5, -15.4, -26.5, -11],
        ],
      });
      // wall sconces (mostly dead, two flicker on)
      for (let k = 0; k < 6; k++) {
        const z = -24 + k * 4.5,
          lit = k === 1 || k === 4;
        b.cyl("gilt", -15.2, 3.0, z, 0.08, 0.12, 0.3, 6);
        if (lit) {
          b.geo("lamp", K.sphereGeo(), {
            x: -15.35,
            y: 3.4,
            z,
            s: 0.09,
            tint: [1, 0.7, 0.45],
          });
          b.glow(-15.4, 3.4, z, [0.5, 0.32, 0.18], 0.9);
          b.light(-15.6, 3.3, z, warm, 0.4, 4, { box: CR });
        }
      }
      b.light(-29, 5, -2, [0.8, 0.5, 0.4], 0.18, 16, { box: CR, wrap: 0.8 });
      // round 2: low warm bounce off the red walls so the laid tables, chairs and diners read in the gloom
      for (const [lx, lz] of [
        [-34, -24],
        [-24, -24],
        [-34, -4],
        [-24, -4],
        [-18, -14],
        [-30, -14],
      ])
        b.light(lx, 2.2, lz, [0.8, 0.46, 0.34], 0.7, 11, {
          box: CR,
          wrap: 0.9,
        });
      ctx.radSrc = {
        x: O.x - 39.5,
        y: O.y + 1.4,
        z: O.z - 14,
        radius: 7.5,
        strength: 2.2,
      };
    }

    // ================================================= KITCHEN (north of the ballroom)
    {
      const KB = [-43.2, -1, -38.2, -14.8, 4.4, -27.8];
      K.room(b, ctx, {
        x0: -43,
        z0: -38,
        x1: -15,
        z1: -28,
        y: 0,
        h: 4,
        floor: "hextile",
        fc: [0.62, 0.6, 0.55],
        wall: "subway",
        wc: [0.72, 0.74, 0.68],
        ceil: "plaster",
        cc: [0.5, 0.5, 0.46],
        wain: "subway",
        wainC: [0.55, 0.58, 0.52],
        wainH: 1.2,
        trimMat: "metal_dark",
      });
      for (let k = 0; k < 5; k++)
        K.lamp(
          b,
          -39 + k * 5.6,
          3.5,
          -33,
          "tube",
          [0.85, 0.95, 0.85],
          k === 2 ? 0 : 0.5,
          6,
          { ceil: 4, dead: k === 2, alongX: true, lightOpts: { box: KB } },
        );
      // range line along the north wall under a steel hood; prep island; dish station; walk-in freezer door
      for (let k = 0; k < 5; k++) {
        const sx = -40 + k * 2.2;
        b.boxMM("steel", sx - 1.0, 0, -37.9, sx + 1.0, 0.9, -37.0, {
          tint: [0.55, 0.56, 0.55],
          faces: "nsewt",
        });
        for (const [u, v] of [
          [-0.45, -0.25],
          [0.45, -0.25],
          [-0.45, 0.25],
          [0.45, 0.25],
        ])
          b.cyl("cast_iron", sx + u, 0.9, -37.45 + v, 0.18, 0.18, 0.03, 8);
        if (k % 2)
          b.cyl("steel", sx + 0.45, 0.93, -37.2, 0.22, 0.22, 0.3, 10, {
            tint: [0.5, 0.5, 0.48],
          });
        b.boxMM("black_iron", sx - 0.9, 0.2, -37.02, sx + 0.9, 0.7, -36.98, {
          tint: [0.2, 0.2, 0.2],
        });
      }
      b.col(-41.1, 0, -37.9, -29.9, 0.9, -37.0, {
        tag: "furniture",
        surface: "metal",
      });
      b.boxMM("steel", -41.5, 2.3, -38, -29.5, 3.0, -36.6, {
        tint: [0.5, 0.52, 0.5],
        faces: "nsewtb",
      });
      b.burn(-35, 2.5, -37.5, 3, 0.5);
      b.boxMM("steel", -36, 0, -33.8, -26, 0.92, -32.2, {
        tint: [0.56, 0.57, 0.56],
        faces: "nsewt",
      });
      b.col(-36, 0, -33.8, -26, 0.92, -32.2, {
        tag: "furniture",
        surface: "metal",
      });
      for (let k = 0; k < 10; k++)
        b.cyl(
          r() < 0.5 ? "steel" : "copper",
          -35.3 + k * 0.95,
          0.92,
          -33 + (r() - 0.5) * 0.8,
          0.12 + r() * 0.1,
          0.12 + r() * 0.1,
          0.12 + r() * 0.15,
          10,
          { tint: [0.6, 0.55, 0.5] },
        );
      for (let k = 0; k < 6; k++)
        b.pipe(
          "steel",
          -35 + k * 1.6,
          2.4,
          -33,
          -35 + k * 1.6,
          4,
          -33,
          0.01,
          3,
        );
      b.beam("steel", -35.5, 2.4, -33, -26.5, 2.4, -33, 0.05, 0.05);
      for (let k = 0; k < 8; k++)
        b.cyl("copper", -35 + k * 1.1, 2.1, -33, 0.14, 0.12, 0.2, 8, {
          tint: [0.6, 0.38, 0.24],
        });
      K.shelf(b, -16.0, 0, -35.5, -HP, 2.6, {
        seed: 1701,
        items: ["can", "jar", "box", "bottle"],
      });
      b.boxMM("steel", -23, 0, -37.9, -18, 0.95, -37.1, {
        tint: [0.55, 0.56, 0.55],
        faces: "nsewt",
      });
      b.col(-23, 0, -37.9, -18, 0.95, -37.1, {
        tag: "furniture",
        surface: "metal",
      });
      for (let k = 0; k < 12; k++)
        b.cyl(
          "ceramic",
          -22.6 + (k % 6) * 0.8,
          0.95 + Math.floor(k / 6) * 0.03,
          -37.5,
          0.12,
          0.12,
          0.02 + (k % 3) * 0.02,
          10,
          { tint: [0.8, 0.78, 0.72] },
        );
      b.boxMM("steel", -42.9, 0, -32.5, -42.8, 2.4, -30.5, {
        tint: [0.6, 0.62, 0.6],
      });
      b.plate(
        "art",
        -42.78,
        2.7,
        -31.5,
        1,
        0,
        1.4,
        0.3,
        K.signCell("ppn_freezer", "WALK-IN — KEEP SHUT", 256, 52, {
          bg: "#e0d8c0",
          fg: "#24385e",
          font: "Arial Black, sans-serif",
        }),
        { off: 0 },
      );
      K.loot(ctx, "fridge", -16, 0, -29.2, HP, { loot: "fridge" });
      K.loot(ctx, "fizzo_machine", -42.4, 0, -35.5, -HP, {
        loot: "fizzo_machine",
      });
      K.loot(ctx, "first_aid", -30.5, 1.4, -28.2, 0, { loot: "first_aid" });
      K.clutter(b, -42.5, -37.5, -15.5, -28.5, 0, {
        n: 18,
        seed: 1702,
        kinds: ["can", "glass", "paper", "debris"],
        avoid: [
          [-36.2, -34, -25.8, -32],
          [-41, -38, -30, -36.9],
        ],
      });
      b.hplate("decal", -24, 0.012, -31, 2.4, 2.0, 0.3, K.decal("blood", 61));
    }

    // ================================================= FLOOR 15 (detached block)
    {
      const FB = [-30.2, -1, -98.2, 24.2, 3.5, -79.8];
      // corridor + elevator lobby
      K.room(b, ctx, {
        x0: -24,
        z0: CZN,
        x1: 24,
        z1: CZS,
        y: 0,
        h: 3.0,
        floor: "carpet",
        fc: [0.4, 0.16, 0.12],
        wall: "wallpaper",
        wc: [0.72, 0.64, 0.52],
        ceil: "plaster",
        cc: [0.6, 0.58, 0.52],
        wain: "oak",
        wainC: [0.42, 0.3, 0.2],
        wainH: 0.9,
        open: { w: true },
      });
      K.room(b, ctx, {
        x0: -30,
        z0: -93,
        x1: -24,
        z1: -85,
        y: 0,
        h: 3.0,
        floor: "carpet",
        fc: [0.4, 0.16, 0.12],
        wall: "wallpaper",
        wc: [0.72, 0.64, 0.52],
        ceil: "plaster",
        cc: [0.6, 0.58, 0.52],
        wain: "oak",
        wainC: [0.42, 0.3, 0.2],
        wainH: 0.9,
        open: { e: true },
      });
      // the elevator lobby's east side meets the narrower corridor: fill the wall stubs
      for (const [za, zb] of [
        [-93, CZN],
        [CZS, -85],
      ])
        K.segWall(b, -24, za, -24, zb, 0, 3.0, za < -90 ? -1 : -1, {
          mat: "wallpaper",
          tint: [0.72, 0.64, 0.52],
          both: true,
        });
      b.hplate("art", 0, 0.007, -89, 1.9, 47, HP, K.runnerCell(), {
        tint: [0.9, 0.9, 0.9],
      });
      K.elevatorDoor(b, -29.9, 0, -89, 1, 0, { floor: "14" });
      b.plate(
        "art",
        -29.88,
        2.8,
        -91.5,
        1,
        0,
        1.2,
        0.5,
        K.signCell("ppn_f15", "15", 128, 64, {
          bg: "#1c1a14",
          fg: "#d8b860",
          font: "Georgia, serif",
        }),
        { off: 0 },
      );
      K.door(ctx, {
        pos: K.world(ctx, -29.4, 1.3, -89),
        label: "Elevator — Lobby",
        verb: "Ride",
        sound: "door_open",
        target: { x: O.x - 12, y: O.y + 0.05, z: O.z - 24.4, yaw: PI },
      });
      // stairwell door at the east end → the lobby gallery
      b.boxMM("mahogany", 23.85, 0, -89.6, 24, 2.2, -88.4, {
        tint: [0.45, 0.28, 0.2],
      });
      b.plate(
        "art",
        23.83,
        2.5,
        -89,
        -1,
        0,
        0.9,
        0.3,
        K.signCell("ppn_exit", "EXIT", 128, 42, {
          bg: "#1a1a1a",
          fg: "#ff4030",
          font: "Arial Black, sans-serif",
        }),
        { off: 0 },
      );
      b.glow(23.7, 2.5, -89, [0.5, 0.1, 0.06], 0.7);
      K.door(ctx, {
        pos: K.world(ctx, 23.5, 1.3, -89),
        label: "Stairwell — Lobby Gallery",
        verb: "Descend",
        sound: "door_open",
        target: { x: O.x, y: O.y + GY + 0.05, z: O.z - 23.8, yaw: PI },
      });
      // sconces along the corridor (every other one dead) + a fire hose cabinet + room-service trays
      for (let k = 0; k < 12; k++) {
        const x = -22 + k * 4,
          s = k % 2 ? 1 : -1,
          z = s < 0 ? CZN + 0.12 : CZS - 0.12,
          lit = k % 3 === 0;
        b.cyl("gilt", x, 2.0, z, 0.06, 0.1, 0.25, 6);
        if (lit) {
          b.geo("lamp", K.sphereGeo(), {
            x,
            y: 2.35,
            z: z + s * -0.02,
            s: 0.08,
            tint: [1, 0.75, 0.48],
          });
          b.glow(x, 2.35, z, [0.45, 0.3, 0.16], 0.8);
          b.light(x, 2.2, z + (s < 0 ? 0.4 : -0.4), warm, 0.55, 5, { box: FB });
        }
      }
      b.light(-27, 2.2, -89, dim, 0.4, 6, { box: FB });
      b.boxMM("usps_red", 3, 0.9, CZN + 0.1, 4, 2.1, CZN + 0.28, {
        tint: [0.7, 0.2, 0.15],
      });
      b.plate(
        "art",
        3.5,
        1.5,
        CZN + 0.29,
        0,
        1,
        0.8,
        1.0,
        K.signCell("ppn_hose", "FIRE\nHOSE", 96, 120, {
          bg: "#8e2a22",
          fg: "#f0e0c0",
          font: "Arial Black, sans-serif",
        }),
        { off: 0.0 },
      );
      for (const [tx, tz] of [
        [-7, -88.4],
        [14, -89.6],
      ]) {
        b.cyl("silver", tx, 0, tz, 0.3, 0.3, 0.03, 12);
        K.cloche(b, tx, 0.03, tz, 1);
      }
      K.clutter(b, -23.5, CZN + 0.3, 23.5, CZS - 0.3, 0, {
        n: 14,
        seed: 1801,
        kinds: ["paper", "glass", "can", "panel"],
      });
      // closed room doors (numbered), open ones get a real room
      for (let k = 0; k < 8; k++)
        for (const s of ["n", "s"]) {
          const x0 = -24 + k * 6,
            num = 1500 + k * 2 + (s === "n" ? 1 : 2);
          const dx = x0 + 3 + (s === "n" ? -1.4 : 1.4),
            dz = s === "n" ? CZN + 0.1 : CZS - 0.1,
            nz = s === "n" ? 1 : -1;
          b.plate(
            "art",
            dx + 0.9,
            1.7,
            dz + nz * 0.02,
            0,
            nz,
            0.3,
            0.14,
            K.signCell("ppn_room" + num, String(num), 96, 44, {
              bg: "#b8924a",
              fg: "#1a1208",
              font: "Georgia, serif",
              weather: false,
            }),
            { off: 0 },
          );
          if (OPEN[num]) continue;
          b.boxMM(
            "mahogany",
            dx - 0.5,
            0,
            dz - 0.03,
            dx + 0.5,
            2.2,
            dz + 0.03,
            { tint: [0.42, 0.26, 0.18], faces: s === "n" ? "s" : "n" },
          );
          b.geo("brass", K.sphereGeo(), {
            x: dx + 0.38,
            y: 1.0,
            z: dz + nz * 0.05,
            s: 0.04,
          });
          if (r() < 0.3)
            b.plate(
              "art",
              dx,
              1.3,
              dz + nz * 0.04,
              0,
              nz,
              0.3,
              0.2,
              K.signCell("ppn_dnd", "DO NOT\nDISTURB", 96, 64, {
                bg: "#e0d8c0",
                fg: "#8e2a22",
                font: "Arial, sans-serif",
              }),
              { off: 0 },
            );
        }
      // ---- the open rooms ----
      const guestRoom = (num, fn) => {
        const [x0, x1, s] = OPEN[num];
        const z0 = s === "n" ? -97.5 : CZS,
          z1 = s === "n" ? CZN : -80.5;
        const RB = [x0 - 0.2, -1, z0 - 0.2, x1 + 0.2, 3.3, z1 + 0.2];
        K.room(b, ctx, {
          x0,
          z0,
          x1,
          z1,
          y: 0,
          h: 3.0,
          floor: "carpet",
          fc: [0.46, 0.34, 0.26],
          wall: "wallpaper",
          wc: [0.74, 0.68, 0.56],
          ceil: "plaster",
          cc: [0.62, 0.6, 0.55],
          wain: "oak",
          wainC: [0.45, 0.33, 0.22],
          wainH: 0.9,
          cornice: true,
          open: fn.open || {},
        });
        const back = s === "n" ? z0 : z1,
          nz = s === "n" ? 1 : -1,
          cx = (x0 + x1) / 2;
        fn(x0, x1, z0, z1, back, nz, cx, RB);
      };
      // 1503 — the honeymooners
      guestRoom(1503, (x0, x1, z0, z1, back, nz, cx, RB) => {
        K.bed(b, cx + 0.5, 0, back + nz * 1.2, nz > 0 ? PI : 0, {
          w: 1.7,
          l: 2.1,
          tint: [0.62, 0.55, 0.5],
        });
        K.skel(ctx, cx + 0.1, 0.55, back + nz * 1.3, 0, "lying");
        K.skel(ctx, cx + 0.9, 0.55, back + nz * 1.4, PI, "curled");
        b.cyl("brass", x0 + 0.5, 0, back + nz * 0.5, 0.2, 0.2, 0.6, 8);
        b.cyl("lamp", x0 + 0.5, 0.6, back + nz * 0.5, 0.15, 0.2, 0.3, 8, {
          tint: [0.9, 0.7, 0.5],
        });
        b.light(x0 + 0.5, 0.9, back + nz * 0.8, dim, 0.7, 5, { box: RB });
        b.glow(x0 + 0.5, 0.75, back + nz * 0.5, [0.4, 0.28, 0.16], 0.8);
        b.box("flat", cx + 2.2, 0.62, back + nz * 1.0, 0.3, 0.004, 0.3, {
          tint: [0.9, 0.9, 0.85],
        });
        b.cyl("glass", cx + 2.1, 0, back + nz * 2.6, 0.1, 0.1, 0.35, 8, {
          tint: [0.3, 0.5, 0.3],
        });
        b.cyl("silver", cx + 2.5, 0, back + nz * 2.8, 0.13, 0.15, 0.3, 10);
        b.plate(
          "art",
          cx,
          1.8,
          back + nz * 0.02,
          0,
          nz,
          1.2,
          0.7,
          K.painting(7, 240, 160),
          { off: 0.01 },
        );
        K.note(ctx, "ppn_reel_honeymoon", x0 + 0.5, 0.62, back + nz * 0.4, {
          type: "tape",
          name: 'Tape reel: "Mr. & Mrs."',
          title: '"Mr. & Mrs." (tape reel)',
          text: "[A man, laughing:] Is it on? It's on. Okay. Mrs. Rosalind Brandt, how does it feel to be married to the luckiest man in the First Infantry?\n[A woman:] Put that away, Eddie, we've got the room till Monday.\n[Eddie:] I want a record. Twenty years from now I'm gonna play this for the kids. \"Kids, this is the night your mother said yes—\"\n[A siren, far off. Then closer. Then everywhere.]\n[Rosalind:] ...Eddie?\n[Eddie, quietly:] Come here. Come on. Don't look at the window. Look at me.\n[The recording runs on, silent, for eleven minutes before it stops.]",
        });
        K.loot(
          ctx,
          "dresser",
          x1 - 0.5,
          0,
          back + nz * 3.0,
          nz > 0 ? HP : -HP,
          { loot: "luggage", name: "Suitcase" },
        );
      });
      // 1506 — Maniac nest
      guestRoom(1506, (x0, x1, z0, z1, back, nz, cx, RB) => {
        for (let k = 0; k < 4; k++)
          b.box(
            "mattress",
            cx - 1.5 + r() * 3,
            k * 0.12,
            back + nz * (1.5 + r() * 3),
            1.4,
            0.12,
            1.9,
            { yaw: r() * 3, tint: [0.5, 0.42, 0.3] },
          );
        for (let k = 0; k < 16; k++)
          b.pipe(
            "bone",
            cx - 2 + r() * 4,
            0.05,
            back + nz * (1 + r() * 5),
            cx - 2 + r() * 4,
            0.08,
            back + nz * (1 + r() * 5),
            0.03,
            4,
          );
        for (let k = 0; k < 4; k++)
          b.hplate(
            "decal",
            cx - 1.5 + r() * 3,
            0.012 + k * 0.001,
            back + nz * (1.5 + r() * 4),
            1.6,
            1.4,
            r() * 6,
            K.decal("blood", 70 + k),
          );
        b.box("black_iron", cx + 1.8, 0, back + nz * 1.0, 1.5, 0.35, 2.0, {
          yaw: 0.4,
          tint: [0.3, 0.28, 0.26],
        });
        b.light(cx, 2.4, (z0 + z1) / 2, [0.55, 0.6, 0.5], 0.3, 6, { box: RB });
        b.plate(
          "paint_black",
          cx,
          1.6,
          back + nz * 0.02,
          0,
          nz,
          1.4,
          1.4,
          null,
          { tint: [0.08, 0.08, 0.07] },
        );
      });
      // 1509 — the Fizzo bath
      guestRoom(1509, (x0, x1, z0, z1, back, nz, cx, RB) => {
        K.bed(b, cx - 1.0, 0, back + nz * 1.2, PI, {
          w: 1.4,
          l: 2.0,
          tint: [0.62, 0.55, 0.5],
        });
        // tiled bathroom corner
        b.face(
          "hextile",
          x1 - 2.6,
          0.005,
          back + 2.6,
          1,
          0,
          0,
          0,
          0,
          -1,
          2.6,
          2.6,
          { uv: "top", tint: [0.7, 0.72, 0.7] },
        );
        K.bathtub(b, x1 - 1.1, 0, back + nz * 1.3, 0, {
          fill: "glass",
          fillTint: [0.35, 0.12, 0.08],
        });
        for (let k = 0; k < 18; k++)
          b.cyl(
            "glass",
            x1 - 1.1 + (r() - 0.5) * 0.5,
            0.5 + r() * 0.2,
            back + nz * (1.3 + (r() - 0.5) * 1.3),
            0.03,
            0.035,
            0.2,
            6,
            { tint: r() < 0.2 ? [0.4, 0.8, 1.0] : [0.4, 0.18, 0.12] },
          );
        for (let k = 0; k < 30; k++)
          b.cyl(
            "glass",
            x0 + 0.4 + r() * 2.5,
            0,
            back + nz * (3 + r() * 3.5),
            0.03,
            0.035,
            0.2,
            6,
            { tint: [0.4, 0.18, 0.12] },
          );
        b.plate(
          "art",
          x1 - 1.2,
          1.9,
          back + nz * 0.02,
          0,
          nz,
          1.0,
          1.0,
          K.signCell("ppn_fizzo_shrine", "FIZZO\nFOREVER", 128, 128, {
            bg: "#8e2a22",
            fg: "#f0e0c0",
            font: "Arial Black, sans-serif",
          }),
          { off: 0.01 },
        );
        b.light(x1 - 1.1, 1.2, back + nz * 1.3, [0.5, 0.8, 1], 0.5, 3.5, {
          box: RB,
        });
        b.glow(x1 - 1.1, 0.8, back + nz * 1.3, [0.1, 0.25, 0.35], 1.2);
        b.light(cx, 2.4, (z0 + z1) / 2, dim, 0.35, 6, { box: RB });
        K.loot(ctx, "fizzo_blue", x1 - 1.05, 0.72, back + nz * 1.1, 0, {});
      });
      // 1512 — the shell hole (outer wall gone: the skyline beyond)
      guestRoom(
        1512,
        Object.assign(
          (x0, x1, z0, z1, back, nz, cx, RB) => {
            // broken wall stubs + the view
            for (const s of [-1, 1])
              b.boxMM(
                "hotelbrick2",
                s < 0 ? x0 : x1 - 1.1,
                0,
                z1 - 0.3,
                s < 0 ? x0 + 1.1 : x1,
                3.0,
                z1,
                { tint: [0.7, 0.6, 0.55] },
              );
            b.boxMM("hotelbrick2", x0, 2.4, z1 - 0.3, x1, 3.0, z1, {
              tint: [0.7, 0.6, 0.55],
              faces: "nb",
            });
            b.col(x0, 0, z1 - 0.3, x0 + 1.1, 3, z1, { tag: "wall" });
            b.col(x1 - 1.1, 0, z1 - 0.3, x1, 3, z1, { tag: "wall" });
            b.col(x0 + 1.1, 0, z1 - 0.3, x1 - 1.1, 3, z1 + 0.2, {
              tag: "wall",
            }); // don't walk out into the sky
            (ctx.backdrops = ctx.backdrops || []).push({
              rect: K.skyline(3, 1024, 512),
              pos: [cx, 2.5, z1 + 16],
              n: [0, -1],
              w: 52,
              h: 26,
              tint: 0.9,
            });
            b.light(cx, 1.5, z1 + 1.5, day, 1.2, 9, { box: RB, wrap: 0.6 });
            K.rubble(b, cx - 0.5, 0, z1 - 1.3, 1.6, 0.6, {
              seed: 1901,
              tint: [0.7, 0.55, 0.5],
            });
            b.box("black_iron", cx + 1.2, 0, z0 + 2.2, 1.4, 0.35, 2.0, {
              yaw: 0.8,
              tint: [0.3, 0.28, 0.26],
            });
            for (let k = 0; k < 4; k++)
              b.pipe(
                "rust",
                x0 + 1.4 + k * 0.9,
                3.0,
                z1 - 0.2,
                x0 + 1.5 + k * 0.9,
                2.2 - r() * 0.5,
                z1 + 0.1,
                0.015,
                3,
              );
            b.burn(cx, 1.5, z1, 4, 0.6);
          },
          { open: { s: true } },
        ),
      );
      // 1515 — the scavenger's room (locked 50 / passkey)
      guestRoom(1515, (x0, x1, z0, z1, back, nz, cx, RB) => {
        K.bed(b, cx + 1.3, 0, back + nz * 1.2, PI, {
          w: 1.2,
          l: 2.0,
          tint: [0.5, 0.46, 0.38],
        });
        K.table(b, cx - 1.2, 0, (z0 + z1) / 2, 1.6, 0.8, { mat: "oak" });
        b.plate(
          "art",
          cx - 1.2,
          1.6,
          back + nz * 0.02,
          0,
          nz,
          2.0,
          1.2,
          K.paint("art", "ppn_scav_map", 256, 160, function (x, X, Y, W, H) {
            x.fillStyle = "#d8ccaa";
            x.fillRect(X, Y, W, H);
            x.strokeStyle = "#6a5a40";
            for (let i = 0; i < 10; i++) {
              x.beginPath();
              x.moveTo(X + i * 26, Y);
              x.lineTo(X + i * 26, Y + H);
              x.stroke();
              x.beginPath();
              x.moveTo(X, Y + i * 17);
              x.lineTo(X + W, Y + i * 17);
              x.stroke();
            }
            x.fillStyle = "#c02020";
            x.font = "bold 12px Arial";
            x.fillText("X", X + 60, Y + 60);
            x.fillText("X", X + 170, Y + 110);
            x.font = "italic 9px Georgia";
            x.fillStyle = "#2a2418";
            x.fillText("post office — tin men, stay out", X + 70, Y + 64);
            x.fillText("ballroom — DON'T", X + 150, Y + 124);
            K.grain(x, X, Y, W, H, 30, 1951);
          }),
          { off: 0.01 },
        );
        b.light(cx, 2.2, (z0 + z1) / 2, dim, 0.5, 6, { box: RB });
        K.loot(ctx, "ammo_box", x0 + 0.5, 0, back + nz * 3.2, 0, {
          loot: "ammo_box",
          large: true,
        });
        K.loot(ctx, "footlocker", cx + 1.3, 0, back + nz * 2.6, 0, {
          loot: "raider_stash",
          name: "Scavenger's Stash",
          locked: 0,
        });
        K.skel(ctx, x1 - 0.8, 0, z1 - 1.2, 2.3, "sitting");
        K.note(ctx, "ppn_note_scav", cx - 1.4, 0.78, (z0 + z1) / 2, {
          name: "Scavenger's Note",
          title: "Scrawled note",
          text: "Day 9. Hotel's good pickings if you keep quiet. Maniacs don't come up past 12 much. Found the switchboard lady — barricaded in behind a steel door, sweet as pie, gave me a coffee. Real coffee. Old-world.\n\nDay 14. Went down to the ballroom. Shouldn't have. The band leader's still up there, huge, in what's left of his tux, and he turned around when I came in like I was LATE.\n\nDay 15. Rads bad. Taking the last of the Prussian Blue. If you find this, the post office across the avenue has a clerk robot that talks. Don't go past the counter unless he likes you.",
        });
      });
      // housekeeping closet (1516)
      guestRoom(1516, (x0, x1, z0, z1, back, nz, cx, RB) => {
        K.shelf(b, cx, 0, back + nz * 0.3, nz > 0 ? PI : 0, 4.5, {
          seed: 1961,
          items: ["box", "box", "can", "bottle"],
        });
        {
          const hx = cx - 1.2,
            hz = (z0 + z1) / 2;
          b.box("metal", hx, 0.15, hz, 0.7, 0.9, 1.3, {
            tint: [0.5, 0.52, 0.5],
          });
          b.box("cloth_white", hx, 1.05, hz, 0.6, 0.3, 1.2, {
            tint: [0.78, 0.76, 0.7],
          });
          for (const [u, v] of [
            [-0.3, -0.55],
            [0.3, -0.55],
            [-0.3, 0.55],
            [0.3, 0.55],
          ])
            b.cyl("rubber", hx + u, 0, hz + v, 0.07, 0.07, 0.15, 6);
          b.col(hx - 0.35, 0, hz - 0.65, hx + 0.35, 1.3, hz + 0.65, {
            tag: "furniture",
          });
        }
        b.light(cx, 2.4, (z0 + z1) / 2, [0.8, 0.9, 0.8], 0.4, 5, { box: RB });
        K.loot(ctx, "first_aid", x1 - 0.2, 1.3, (z0 + z1) / 2, HP, {
          loot: "first_aid",
        });
        K.loot(ctx, "locker", x0 + 0.4, 0, (z0 + z1) / 2, -HP, {
          loot: "locker",
          name: "Housekeeping Locker",
        });
      });
      K.hingedDoor(ctx, b, {
        id: "ho_1515",
        x: 21 - 1.4,
        z: CZN,
        y: 0,
        w: 1.0,
        h: 2.2,
        axis: "x",
        hinge: -1,
        swing: -1,
        mat: "mahogany",
        tint: [0.42, 0.26, 0.18],
        lock: PV.LOCKS.hotel_1515,
        label: "Room 1515",
      });
    }

    // ------------------------------------------------ anchors, doors
    K.anchor(ctx, "entrance", 0, 0, -2.7);
    K.anchor(ctx, "spawn1", -6.5, 0, -18.5); // back of the lobby, beside the grand stair (not on top of the load door)
    K.anchor(ctx, "spawn2", 11.5, GY, -12);
    K.anchor(ctx, "spawn3", -9, 0, -84); // Floor 15, the Maniac nest
    K.anchor(ctx, "spawn4", -38.8, 0.9, -14); // the bandleader (Maniac Bruiser) on the bandstand
    K.anchor(ctx, "spawn5", -26, 0, -18);
    K.anchor(ctx, "spawn6", -30, 0, -30.5); // kitchen
    K.anchor(ctx, "boss", -38.8, 0.9, -14);
    K.anchor(ctx, "loot1", 23.6, 0, -17.2);
    K.anchor(ctx, "loot2", 19, 0, -95);
    K.anchor(ctx, "loot3", -16, 0, -29.2);
    // street door (portico revolving door) ↔ lobby
    K.door(ctx, {
      pos: HO.door.clone(),
      label: "Hotel Pennsylvania",
      verb: "Enter",
      sound: "door_open",
      target: { x: O.x, y: O.y + 0.05, z: O.z - 2.7, yaw: 0 },
    });
    // exit → the portico, 3.2 m in front of the revolving drum (between it and the central column gap), facing the avenue
    let aveName =
      K.safe(
        "ave",
        () => G.LAYOUT.avenueNameAt && G.LAYOUT.avenueNameAt(HO.X0 - 11, -119),
      ) || "6th Avenue";
    if (aveName === "Broadway") aveName = "Broadway — Herald Square";
    K.door(ctx, {
      pos: K.world(ctx, 0, 1.3, -2.25),
      label: aveName,
      verb: "Exit",
      sound: "door_open",
      target: { x: HO.PX - 3.2, y: HO.PY + 0.05, z: -119, yaw: HP },
    });

    K.buildDoors(ctx);
    const g = b.finish(ctx.intRoot);
    g.name = "poi_hotelpenn_int_mesh";
    // the flickering front-desk neon (own mesh + own material instance)
    if (ctx.neonDesk) {
      const N = ctx.neonDesk,
        rc = N.rect;
      const base = K.mat(K.atlasMat("neon", rc), true);
      const m = base.clone();
      m.userData = {};
      m.transparent = true;
      const geo = new THREE.PlaneGeometry(N.w, N.h);
      const uv = geo.attributes.uv;
      for (let i = 0; i < uv.count; i++) {
        uv.setXY(
          i,
          rc[0] + (rc[2] - rc[0]) * uv.getX(i),
          rc[1] + (rc[3] - rc[1]) * uv.getY(i),
        );
      }
      const cols = new Float32Array(uv.count * 3).fill(1);
      geo.setAttribute("color", new THREE.BufferAttribute(cols, 3));
      const mesh = new THREE.Mesh(geo, m);
      mesh.position.set(N.pos[0] + O.x, N.pos[1] + O.y, N.pos[2] + O.z);
      mesh.rotation.y = Math.atan2(N.n[0], N.n[1]);
      mesh.renderOrder = 3;
      ctx.intRoot.add(mesh);
      ctx.neonMesh = mesh;
    }
    for (const bd of ctx.backdrops || []) K.backdrop(ctx, bd);
    if (ctx.radSrc && G.world.addRadSource)
      K.safe("rad", () => G.world.addRadSource(ctx.radSrc));
  };

  // ------------------------------------------------------------------
  // Update: the neon flickers (buzz), the bandstand hums with rads
  // ------------------------------------------------------------------
