// play-inline-324 06 — ctx
// Lines 1368-1768 of readable/play-inline-324.pretty.js (statement-aligned).
  function buildHeadhouse(b, anchors) {
    const x0 = -314,
      x1 = -296,
      z0 = HL.HZ0,
      z1 = HL.HZ1,
      top = 17.5,
      DY = HL.DY;
    const xc = (x0 + x1) / 2;
    // shell walls with openings: north face has the track portal; south face has dock doors + personnel door
    const W = PF.wall;
    const T = 0.6;
    // north wall (z0): portal for the two tracks (x -310.5..-300.5 at deck level)
    W(b, "brick_nab", "x", x0, x1, z0, z0 + T, 0, top, [
      { c: -305.5, w: 10.2, y0: DY - 0.6, h: 6.2 },
      { c: -299, w: 1.4, y0: DY + 7.6, h: 1.8 },
      { c: -312, w: 1.4, y0: DY + 7.6, h: 1.8 },
    ]);
    // south wall (z1): two truck doors + personnel door, windows above
    W(b, "brick_nab", "x", x0, x1, z1 - T, z1, 0, top, [
      { c: -310.2, w: 4, y0: 1.2, h: 3.2 },
      { c: -299.8, w: 4, y0: 1.2, h: 3.2 },
      { c: -305, w: 1.6, y0: 1.2, h: 2.5 },
      { c: -310.2, w: 2.2, y0: 6.2, h: 2.6 },
      { c: -305, w: 2.2, y0: 6.2, h: 2.6 },
      { c: -299.8, w: 2.2, y0: 6.2, h: 2.6 },
      { c: -310.2, w: 2.2, y0: 10.6, h: 2.6 },
      { c: -305, w: 2.2, y0: 10.6, h: 2.6 },
      { c: -299.8, w: 2.2, y0: 10.6, h: 2.6 },
    ]);
    W(b, "brick_nab", "z", z0, z1, x0, x0 + T, 0, top, [
      { c: 281.5, w: 2.4, y0: 6.2, h: 2.6 },
      { c: 281.5, w: 2.4, y0: 10.6, h: 2.6 },
      { c: 281.5, w: 2.4, y0: 14.2, h: 2.0 },
    ]);
    W(b, "brick_nab", "z", z0, z1, x1 - T, x1, 0, top, [
      { c: 277.5, w: 2.4, y0: 6.2, h: 2.6 },
      { c: 285.5, w: 2.4, y0: 6.2, h: 2.6 },
      { c: 277.5, w: 2.4, y0: 10.6, h: 2.6 },
      { c: 285.5, w: 2.4, y0: 10.6, h: 2.6 },
      { c: 281.5, w: 2.4, y0: 14.2, h: 2.0 },
    ]);
    // interior blockers (the real interior is in its own cell): dark back planes behind openings
    b.boxMM(
      "concrete_dark",
      x0 + T,
      0,
      z0 + T + 1.5,
      x1 - T,
      top - 0.5,
      z0 + T + 1.7,
      { segLen: 8 },
    );
    b.boxMM(
      "concrete_dark",
      x0 + T,
      0,
      z1 - T - 1.7,
      x1 - T,
      top - 0.5,
      z1 - T - 1.5,
      { segLen: 8 },
    );
    for (const x of [x0 + T + 0.2, x1 - T - 0.4])
      b.boxMM("concrete_dark", x, 0, z0 + T, x + 0.2, top - 0.5, z1 - T, {
        segLen: 8,
      });
    // roof + parapet with stepped Deco crown and coping
    b.boxMM("tar", x0, top - 0.4, z0, x1, top, z1, { segLen: 8 });
    PF.colMM(x0, top - 0.4, z0, x1, top, z1, { surface: "concrete" });
    for (const [a, c, zz] of [
      [x0, x1, z0],
      [x0, x1, z1 - 0.5],
    ])
      b.boxMM("limestone", a, top, zz, c, top + 1.1, zz + 0.5, { seg: false });
    for (const xx of [x0, x1 - 0.5])
      b.boxMM("limestone", xx, top, z0, xx + 0.5, top + 1.1, z1, {
        seg: false,
      });
    b.boxMM(
      "limestone",
      xc - 4,
      top + 1.1,
      z1 - 0.55,
      xc + 4,
      top + 2.4,
      z1 + 0.05,
      { seg: false },
    );
    b.boxMM(
      "limestone",
      xc - 2.2,
      top + 2.4,
      z1 - 0.55,
      xc + 2.2,
      top + 3.4,
      z1 + 0.05,
      { seg: false },
    );
    b.boxMM(
      "limestone",
      xc - 4,
      top + 1.1,
      z0 - 0.05,
      xc + 4,
      top + 2.4,
      z0 + 0.55,
      { seg: false },
    );
    // limestone string courses, base and pilasters (Deco vertical ribs)
    for (const y of [DY - 0.9, DY + 6.1, 13.6]) {
      b.boxMM(
        "limestone",
        x0 - 0.15,
        y,
        z0 - 0.15,
        x1 + 0.15,
        y + 0.4,
        z0 + 0.1,
        { seg: false },
      );
      b.boxMM(
        "limestone",
        x0 - 0.15,
        y,
        z1 - 0.1,
        x1 + 0.15,
        y + 0.4,
        z1 + 0.15,
        { seg: false },
      );
      b.boxMM("limestone", x0 - 0.15, y, z0, x0 + 0.1, y + 0.4, z1, {
        seg: false,
      });
      b.boxMM("limestone", x1 - 0.1, y, z0, x1 + 0.15, y + 0.4, z1, {
        seg: false,
      });
    }
    b.boxMM("granite_dark", x0 - 0.2, 0, z1 - 0.1, x1 + 0.2, 1.0, z1 + 0.25, {
      seg: false,
    });
    for (const x of [x0 + 0.1, -307.6, -302.4, x1 - 0.5])
      b.boxMM("limestone", x, DY + 6.5, z1 - 0.05, x + 0.4, top, z1 + 0.25, {
        seg: false,
      });
    // name band + clock on the south face, railroad name over the north portal
    const nameKey = PF.texMat(
      "hh_name",
      PF.signTex(
        "hh_name",
        ["ST. JOHN'S PARK FREIGHT TERMINAL"],
        "engraved",
        1024,
        96,
      ),
      { rough: 0.9 },
    );
    b.quad(nameKey, xc, 14.6, z1 + 0.27, 16, 1.4, { ry: 0, grime: 0.3 });
    const nycKey = PF.texMat(
      "hh_nyc",
      PF.signTex(
        "hh_nyc",
        ["NEW YORK CENTRAL RAILROAD", "WEST SIDE IMPROVEMENT — 1934"],
        "engraved",
        1024,
        160,
      ),
      { rough: 0.9 },
    );
    b.quad(nycKey, -305.5, DY + 6.95, z0 - 0.17, 12.5, 1.9, {
      ry: PI,
      grime: 0.3,
    });
    // clock (stopped) on the north face above the portal
    {
      const cz = z0 - 0.2,
        cy = 15.0;
      b.cyl("limestone", -305.5, cy - 0.1, cz, 1.35, 1.35, 0.2, 20, {
        rx: HP,
        hSeg: 1,
      });
      const ck = PF.texMat(
        "hh_clock",
        PF.canvasTex(
          "pch_clock",
          256,
          256,
          (ctx, w, h) => {
            ctx.fillStyle = "#d8d0b8";
            ctx.beginPath();
            ctx.arc(w / 2, h / 2, w / 2 - 4, 0, TAU);
            ctx.fill();
            ctx.strokeStyle = "#2a2420";
            ctx.lineWidth = 6;
            ctx.stroke();
            ctx.fillStyle = "#2a2420";
            for (let i = 0; i < 12; i++) {
              const a = (i / 12) * TAU;
              ctx.fillRect(
                w / 2 + Math.cos(a) * 100 - 4,
                h / 2 + Math.sin(a) * 100 - 4,
                8,
                8,
              );
            }
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.moveTo(w / 2, h / 2);
            ctx.lineTo(
              w / 2 + Math.cos(-HP + (9.78 / 12) * TAU) * 60,
              h / 2 + Math.sin(-HP + (9.78 / 12) * TAU) * 60,
            );
            ctx.stroke();
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(w / 2, h / 2);
            ctx.lineTo(
              w / 2 + Math.cos(-HP + (47 / 60) * TAU) * 92,
              h / 2 + Math.sin(-HP + (47 / 60) * TAU) * 92,
            );
            ctx.stroke();
            ctx.fillStyle = "rgba(60,40,20,0.35)";
            ctx.beginPath();
            ctx.arc(w * 0.62, h * 0.4, 50, 0, TAU);
            ctx.fill();
          },
          { clamp: true },
        ),
        { rough: 0.6 },
      );
      b.quad(ck, -305.5, cy, cz - 0.12, 2.3, 2.3, { ry: PI, grime: 0.2 });
    }
    // industrial steel windows (dark panes + mullions) in the openings
    const winPane = (x, y, z, ry, w, h) => {
      b.quad(
        Math.random() < 0.35 ? "glass_broken" : "glass_dark",
        x,
        y + h / 2,
        z,
        w,
        h,
        { ry, noAO: true, grime: 0.1, uv: "box" },
      );
      const c = Math.cos(ry),
        s = Math.sin(ry);
      for (let k = 1; k < 4; k++) {
        const lx = -w / 2 + (k * w) / 4;
        b.box(
          "steel_win",
          x + lx * c + s * 0.03,
          y,
          z - lx * s + c * 0.03,
          0.05,
          h,
          0.05,
          { ry, seg: false },
        );
      }
      for (let k = 1; k < 4; k++)
        b.box(
          "steel_win",
          x + s * 0.03,
          y + (k * h) / 4,
          z + c * 0.03,
          w,
          0.05,
          0.05,
          { ry, seg: false },
        );
    };
    for (const y of [6.2, 10.6])
      for (const x of [-310.2, -305, -299.8])
        winPane(x, y, z1 + 0.02, 0, 2.2, 2.6);
    for (const y of [6.2, 10.6]) winPane(x0 - 0.02, y, 281.5, -HP, 2.4, 2.6);
    for (const y of [6.2, 10.6])
      for (const z of [277.5, 285.5]) winPane(x1 + 0.02, y, z, HP, 2.4, 2.6);
    // track portal: steel roll-up door half open, dark void, bumper lights
    b.boxMM(
      "concrete_dark",
      -310.6,
      DY - 0.6,
      z0 + T,
      -300.4,
      DY + 5.6,
      z0 + T + 0.2,
      { seg: false },
    );
    b.boxMM(
      "corrugated",
      -310.5,
      DY + 2.9,
      z0 + 0.05,
      -300.5,
      DY + 5.6,
      z0 + 0.25,
      { seg: false, grime: 0.8 },
    );
    b.boxMM("rust", -310.8, DY + 5.5, z0 - 0.3, -300.2, DY + 6.0, z0 + 0.3, {
      seg: false,
    });
    b.quad("glass_broken", -305.5, DY + 1.4, z0 + 0.62, 10, 2.8, {
      ry: PI,
      noAO: true,
      grime: 0,
    });
    PF.colMM(-310.6, DY - 0.6, z0 - 0.05, -300.4, DY + 5.6, z0 + T + 0.2, {
      walkable: false,
      surface: "metal",
    });
    // scrap barricade across the portal leaving a man-door gap (raiders' front door)
    PF.scrapWall(b, -310.4, z0 - 0.8, -306.4, z0 - 0.8, 2.4, {
      y: DY,
      seed: 91,
      noSpikes: false,
    });
    PF.scrapWall(b, -304.6, z0 - 0.8, -300.6, z0 - 0.8, 2.4, {
      y: DY,
      seed: 92,
    });
    const keepOut = PF.texMat(
      "hh_keep",
      PF.signTex(
        "hh_keep",
        ["CONDUCTORS ONLY", "TICKETS PLEASE"],
        "raider",
        512,
        192,
        { fg: "#e8d040" },
      ),
      {},
    );
    b.quad(keepOut, -308.4, DY + 1.8, z0 - 0.95, 2.4, 0.9, {
      ry: PI,
      grime: 0.3,
    });
    // street level: truck dock with canopy, roll doors (one jammed half-open), personnel door
    for (const x of [-310.2, -299.8]) {
      b.boxMM(
        "corrugated",
        x - 2,
        x < -305 ? 2.6 : 1.2,
        z1 - 0.2,
        x + 2,
        4.4,
        z1 - 0.05,
        { seg: false, grime: 0.8 },
      );
      b.boxMM("concrete_dark", x - 2, 1.2, z1 - T - 0.1, x + 2, 4.4, z1 - T, {
        seg: false,
      });
      PF.colMM(x - 2, 1.2, z1 - T, x + 2, 4.4, z1 + 0.05, {
        walkable: false,
        surface: "metal",
      });
    }
    b.boxMM("concrete", x0 - 0.2, 0, z1, x1 + 0.2, 1.2, z1 + 2.2, {
      seg: false,
      grime: 0.7,
    });
    PF.colMM(x0 - 0.2, 0, z1, x1 + 0.2, 1.2, z1 + 2.2, { surface: "concrete" });
    // steps up to the dock at the personnel door
    PF.stairs(b, "concrete", -305, z1 + 3.4, PI, 2.2, 1.2, 0, 1.2, {});
    b.boxMM("rust", x0 - 0.3, 4.5, z1, x1 + 0.3, 4.7, z1 + 3.2, { seg: false });
    for (const x of [x0 + 1, xc, x1 - 1])
      b.beam(
        "iron",
        V3(x, 4.6, z1 + 3.1),
        V3(x, 6.4, z1 + 0.1),
        0.05,
        0.05,
        {},
      );
    b.boxMM("panel", -305.8, 1.2, z1 + 0.02, -304.2, 3.6, z1 + 0.14, {
      seg: false,
      grime: 0.8,
    }); // steel door
    const dockKey = PF.texMat(
      "hh_dock",
      PF.signTex("hh_dock", ["RECEIVING — DOCK 3"], "enamel", 512, 96, {
        bg: "#6a2a20",
      }),
      {},
    );
    b.quad(dockKey, -305, 4.0, z1 + 0.16, 2.8, 0.52, { ry: 0, grime: 0.3 });
    PF.lampPost(b, -313, 1.2, z1 + 1.6, false);
    PF.skeleton(b, -301.5, 1.22, z1 + 1.2, 2.4);
    // colliders: shell (outer walls are already solid); the building volume is not walkable inside
    PF.colMM(x0, 0, z0, x1, DY - 0.6, z1, { walkable: false }); // below the portal: solid base
    PF.colMM(x0, DY - 0.6, z0 + T + 1.5, x1, top - 0.4, z1 - T, {
      walkable: false,
    });
    PF.colMM(x0, DY - 0.6, z0 + T, x1, DY, z0 + T + 1.6, {
      surface: "concrete",
    }); // portal floor
    const ext = {
      portal: V3(-305.5, DY, z0 - 0.4),
      dock: V3(-305, 1.2, z1 + 0.6),
    };
    anchors.entrance = PF.anchor(-305.5, DY, z0 - 2.5, 0);
    anchors.street_door = PF.anchor(-305, 1.2, z1 + 1.2, PI);
    return ext;
  }
