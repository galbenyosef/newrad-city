/* src/landmarks_b/10_liberty_interior.js */
/* =====================================================================
 * LANDMARKS B — STATUE OF LIBERTY: pedestal INTERIOR.
 *
 * INTERIORS.liberty_pedestal: granite hall with Eiffel's iron pylon, the
 * original torch on display, the Continuity's forward command post, the
 * old gift shop,
 * stairs to the upper gallery → balcony door. Also the street <-> interior
 * doors (fort-top portal ↔ hall, balcony ↔ upper gallery) and the hall's
 * props. Called from the exterior builder (10_liberty.js) through
 * LB.interiorPart('statue_of_liberty', part, ctx).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._lb) return;
  const LB = G._lb;
  const TAU = Math.PI * 2;
  // command-post teletype: its pages are registered by src/quests under this id
  const CMD_TERMINAL = "liberty_command"; // registered by src/quests/60_finale.js

  LB.interiors.statue_of_liberty = {
    /** Street <-> interior doors. ctx: {W (island local → world), yawFacing, FORT_H, balY}. */
    doors(ctx) {
      const { W, yawFacing, FORT_H, balY } = ctx;
      const INT = G.LAYOUT.INTERIORS.liberty_pedestal.origin;
      // Pedestal door (exterior → interior)
      const [dx, dz] = W(0, 14.7);
      const [ox, oz] = W(0, 18.5);
      const outYaw = yawFacing(ox - dx, oz - dz);
      LB.libertyDoorOut = { x: ox, y: FORT_H + 0.05, z: oz, yaw: outYaw };
      G.world.addDoor({
        pos: new THREE.Vector3(dx, FORT_H + 1.6, dz),
        label: "Statue of Liberty — Pedestal",
        verb: "Enter",
        radius: 1.6,
        target: { x: INT.x, y: INT.y + 0.05, z: INT.z + 12, yaw: 0 },
        sound: "door_open",
      });
      // balcony (exterior, front) arrival point for the gallery door
      const [bx, bz] = W(0, 9.5);
      // face along the balcony (east): straight ahead is only ~0.8 m to the balustrade
      const [bfx, bfz] = W(3, 9.5);
      LB.libertyBalcony = {
        x: bx,
        y: balY + 0.05,
        z: bz,
        yaw: yawFacing(bfx - bx, bfz - bz),
      };
      const [bdx, bdz] = W(0, 7.4);
      G.world.addDoor({
        pos: new THREE.Vector3(bdx, balY + 1.6, bdz),
        label: "Pedestal — Upper Gallery",
        verb: "Enter",
        radius: 1.3,
        target: {
          x: INT.x + 0,
          y: INT.y + 7.05,
          z: INT.z - 14.2,
          yaw: Math.PI,
        },
        sound: "door_open",
      });
    },
    /** The pedestal hall; merges its anchors into the landmark's. ctx: {root, anchors}. */
    hall(ctx) {
      const { root, anchors } = ctx;
      const INT = G.LAYOUT.INTERIORS.liberty_pedestal.origin;
      const ia = buildInterior(LB, root, INT, anchors);
      Object.assign(anchors, ia);
      if (anchors.commander) anchors.commander.yaw = Math.PI; // interior: faces the entrance (south)
    },
    /** Hall props (run inside the landmark's initDone hook, after the fort turrets). ctx: {anchors}. */
    props(ctx) {
      const { anchors } = ctx;
      const fl = anchors.footlocker;
      if (fl)
        LB.spawnProp("footlocker", {
          x: fl.x,
          y: fl.y,
          z: fl.z,
          yaw: 0,
          loot: "continuity_crate",
          owner: "continuity",
          name: "Federal Footlocker",
        });
      const am = anchors.ammo_box;
      if (am)
        LB.spawnProp("ammo_box", {
          x: am.x,
          y: am.y,
          z: am.z,
          yaw: 0,
          loot: "ammo",
        });
      const te = anchors.terminal;
      if (te)
        LB.spawnProp("terminal", {
          x: te.x,
          y: te.y,
          z: te.z,
          yaw: Math.PI / 2,
          terminalId: CMD_TERMINAL,
        });
    },
  };

  // ====================================================================
  // Interior: granite pedestal hall (INTERIORS.liberty_pedestal)
  // ====================================================================
  function buildInterior(LB, root, O, extAnchors) {
    const b = LB.batch("liberty_interior");
    b.ground = O.y;
    b.aoH = 2.5;
    const ox = O.x,
      oy = O.y,
      oz = O.z;
    // baked lamp light (hanging work lights, plot-table & console glow, the torch display spotlight)
    b.setLights(
      [
        ...[
          [-8, 0],
          [8, 0],
          [0, 10],
          [0, -10],
          [-8, 10],
          [8, 10],
        ].map(([x, z]) => ({
          x: ox + x,
          y: oy + 5.6,
          z: oz + z,
          color: 0xffe2b0,
          r: 12,
          i: 0.55,
        })),
        { x: ox + 5, y: oy + 1.6, z: oz + 6, color: 0xffb050, r: 6, i: 0.6 },
        { x: ox + 15, y: oy + 2, z: oz + 6.2, color: 0xffb050, r: 6, i: 0.45 },
        { x: ox - 7, y: oy + 8, z: oz + 6, color: 0xfff0d0, r: 9, i: 0.6 },
        { x: ox, y: oy + 9.5, z: oz - 12, color: 0xffd8a0, r: 10, i: 0.4 },
      ],
      0xb8bcc0,
      0.12,
    );
    const HW = 16,
      H = 16,
      GAL = 7;
    const anchors = {};
    const P = (x, y, z) => new THREE.Vector3(ox + x, oy + y, oz + z);
    // floor (marble tiles), ceiling, walls
    b.boxMM("marble", ox - HW, oy - 0.5, oz - HW, ox + HW, oy, oz + HW, {
      grime: 0.5,
      segLen: 4,
    });
    b.boxMM(
      "granite_dark",
      ox - HW,
      oy + H,
      oz - HW,
      ox + HW,
      oy + H + 0.6,
      oz + HW,
      { grime: 0.2 },
    );
    LB.colMM(ox - HW, oy - 0.5, oz - HW, ox + HW, oy, oz + HW);
    const wall = (x0, z0, x1, z1) => {
      b.boxMM("granite", x0, oy, z0, x1, oy + H, z1, {
        grime: 0.45,
        segLen: 3,
      });
      LB.colMM(x0, oy, z0, x1, oy + H, z1, { walkable: false });
    };
    wall(ox - HW - 1, oz - HW - 1, ox + HW + 1, oz - HW);
    wall(ox - HW - 1, oz + HW, ox + HW + 1, oz + HW + 1);
    wall(ox - HW - 1, oz - HW, ox - HW, oz + HW);
    wall(ox + HW, oz - HW, ox + HW + 1, oz + HW);
    // pilasters & arches on the walls (rhythm)
    for (let i = -3; i <= 3; i++) {
      const s = i * 4.5;
      for (const side of [-1, 1]) {
        // (no pilaster at x = 0 on the north/south walls: the exit door and the gallery door are there)
        if (i !== 0)
          b.box(
            "granite_dark",
            ox + s,
            oy,
            oz + side * (HW - 0.25),
            1.0,
            H,
            0.5,
            { seg: false, grime: 0.3 },
          );
        b.box(
          "granite_dark",
          ox + side * (HW - 0.25),
          oy,
          oz + s,
          0.5,
          H,
          1.0,
          { seg: false, grime: 0.3 },
        );
      }
    }
    // coffered ceiling beams
    for (let i = -3; i <= 3; i++) {
      b.box("granite_dark", ox + i * 4.5, oy + H - 0.8, oz, 0.5, 0.8, HW * 2, {
        seg: false,
      });
      b.box("granite_dark", ox, oy + H - 0.8, oz + i * 4.5, HW * 2, 0.8, 0.5, {
        seg: false,
      });
    }
    // upper gallery (U-shaped mezzanine along W, N, E walls), 4 m deep
    const GD = 4;
    const galSlab = (x0, z0, x1, z1) => {
      b.boxMM("marble", x0, oy + GAL - 0.4, z0, x1, oy + GAL, z1, {
        grime: 0.4,
      });
      LB.colMM(x0, oy + GAL - 0.4, z0, x1, oy + GAL, z1, {
        surface: "concrete",
      });
    };
    galSlab(ox - HW, oz - HW, ox + HW, oz - HW + GD); // north
    galSlab(ox + HW - GD, oz - HW + GD, ox + HW, oz + 2); // east
    // gallery balustrade + supports
    LB.railing(
      b,
      [
        [ox - HW + 6.5, oz - HW + GD],
        [ox + HW - GD, oz - HW + GD],
        [ox + HW - GD, oz + 2],
      ],
      oy + GAL,
      1.05,
      "iron",
      { collide: true, postStep: 1.2 },
    );
    for (const [x, z] of [
      [-8, -HW + GD],
      [0, -HW + GD],
      [8, -HW + GD],
      [HW - GD, -4],
      [HW - GD, 2],
    ]) {
      b.box("granite", ox + x, oy, oz + z, 0.9, GAL - 0.4, 0.9, { seg: false });
      LB.col(ox + x, oz + z, 0.9, 0.9, oy, oy + GAL - 0.4, 0, {
        walkable: false,
      });
    }
    // stairs along the west wall: from south-west corner going north up to gallery level
    galSlab(ox - HW, oz - HW + GD, ox - HW + 3.4, oz - HW + GD + 2.2); // landing
    LB.stairs(
      b,
      "marble",
      ox - HW + 1.7,
      oz + 5,
      Math.PI,
      3.2,
      14.8,
      0 + oy,
      GAL + oy,
      { base: oy - 0.1 },
    );
    LB.railing(
      b,
      [
        [ox - HW + 3.45, oz + 5, oy],
        [ox - HW + 3.45, oz - HW + GD + 2.2, oy + GAL],
      ],
      0,
      1.0,
      "iron",
      { collide: false },
    );
    // Eiffel's iron pylon (4 columns + X-bracing) rising through the ceiling
    const PC = 2.6;
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) {
        b.box("rust", ox + sx * PC, oy, oz + sz * PC - 2, 0.45, H + 0.6, 0.45, {
          seg: false,
          grime: 0.5,
        });
        LB.col(ox + sx * PC, oz + sz * PC - 2, 0.5, 0.5, oy, oy + H, 0, {
          walkable: false,
          surface: "metal",
        });
      }
    for (let y = 1.5; y < H; y += 3.2) {
      for (const [a, c] of [
        [
          [-1, -1],
          [1, -1],
        ],
        [
          [1, -1],
          [1, 1],
        ],
        [
          [1, 1],
          [-1, 1],
        ],
        [
          [-1, 1],
          [-1, -1],
        ],
      ]) {
        const pa = P(a[0] * PC, y, a[1] * PC - 2),
          pc = P(c[0] * PC, y + 3.2, c[1] * PC - 2);
        const pa2 = P(c[0] * PC, y, c[1] * PC - 2),
          pc2 = P(a[0] * PC, y + 3.2, a[1] * PC - 2);
        b.beam("rust", pa, pc, 0.14, 0.14, { grime: 0.6 });
        b.beam("rust", pa2, pc2, 0.14, 0.14, { grime: 0.6 });
        b.beam(
          "rust",
          P(a[0] * PC, y, a[1] * PC - 2),
          P(c[0] * PC, y, c[1] * PC - 2),
          0.2,
          0.2,
          { grime: 0.6 },
        );
      }
    }
    // the original torch on display (1886) — scaled copy on a plinth
    b.box("granite", ox - 7, oy, oz + 6, 4, 1.2, 4, { seg: false });
    const tf = LB.m4(ox - 7, oy + 1.2, oz + 6, 0, 0, 0, 0.55, 0.55, 0.55);
    b.frame(tf);
    b.cyl("verdigris", 0, 0, 0, 0.55, 0.5, 4.0, 12, {});
    b.lathe(
      "verdigris",
      [
        [0.5, 0],
        [0.9, 0.35],
        [1.4, 0.9],
        [1.85, 1.6],
        [2.05, 2.0],
        [2.1, 2.2],
      ],
      18,
      0,
      4,
      0,
      {},
    );
    b.add("verdigris", new THREE.CylinderGeometry(2.65, 2.65, 0.18, 24, 1), {
      m: LB.m4(0, 6.3, 0),
    });
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * TAU;
      b.box(
        "verdigris",
        Math.sin(a) * 2.6,
        6.4,
        Math.cos(a) * 2.6,
        0.07,
        0.9,
        0.07,
        { seg: false },
      );
    }
    b.lathe(
      "gilt",
      [
        [1.3, 0],
        [1.55, 0.6],
        [1.5, 1.4],
        [1.15, 2.3],
        [0.65, 3.1],
        [0.3, 3.6],
        [0.02, 4.0],
      ],
      16,
      0,
      6.3,
      0,
      { grime: 0.3 },
    );
    b.frame(null);
    LB.col(ox - 7, oz + 6, 4, 4, oy, oy + 5, 0, { walkable: false });
    const tp = LB.texMat(
      "liberty_torch_placard",
      LB.signTex(
        "liberty_torch_placard",
        [
          "THE ORIGINAL TORCH",
          "1886 — 1967",
          "IN FEDERAL CUSTODY BY ORDER OF THE ACTING PRESIDENT",
        ],
        "bronze",
        512,
        256,
      ),
    );
    b.quad(tp, ox - 7, oy + 0.7, oz + 8.02, 1.6, 0.8, {});
    anchors.torch_display = P(-7, 0, 9);
    // the Continuity's forward command post: lit plot table, teletype consoles, cots, racks, cable runs
    b.box("gunmetal", ox + 5, oy, oz + 6, 4.2, 0.95, 2.6, { seg: false });
    // plot table: a paper city map under glass, lit from below in amber (uses the goggles' map image if the map module
    // provides one), grease-pencil grid and red objective marks
    const plotTex = LB.canvasTex("lb_plot_table", 512, 320, (ctx, w, h) => {
      ctx.fillStyle = "#120a02";
      ctx.fillRect(0, 0, w, h);
      let img = null;
      try {
        if (!G.isStub("map") && typeof G.map.getMapImage === "function")
          img = G.map.getMapImage();
      } catch (e) {
        img = null;
      }
      if (img && img.width) {
        ctx.globalAlpha = 0.85;
        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.drawImage(img, -h / 2, -w / 2, h, w);
        ctx.restore();
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "multiply";
        ctx.fillStyle = "#ffb347";
        ctx.fillRect(0, 0, w, h);
        ctx.globalCompositeOperation = "source-over";
      }
      ctx.strokeStyle = "rgba(255,190,90,0.35)";
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      ctx.fillStyle = "#ff4030";
      for (const [x, y] of [
        [120, 220],
        [300, 90],
        [420, 160],
      ]) {
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#ffd08a";
      ctx.font = "bold 18px monospace";
      ctx.fillText("PROJECT KNICKERBOCKER · SECRET", 12, 24);
      ctx.font = "bold 13px monospace";
      ctx.fillText("SITUATION AS OF DEC 1967", 12, h - 12);
    });
    const plotK = LB.texMat("plot_table", plotTex, {
      emissive: 0.9,
      noShadow: true,
    });
    b.quad(plotK, ox + 5, oy + 0.97, oz + 6, 3.8, 2.2, {
      rx: -Math.PI / 2,
      grime: 0,
      noAO: true,
    });
    LB.col(ox + 5, oz + 6, 4.2, 2.6, oy, oy + 1.0, 0, { walkable: false });
    anchors.commander = P(5, 0, 3.7); // behind the plot table, facing the doors
    anchors.map_table = P(5, 1, 6);
    for (let i = 0; i < 3; i++) {
      b.box("gunmetal", ox + HW - 1.0, oy, oz + 4 + i * 2.2, 1.2, 1.3, 1.8, {
        seg: false,
      });
      b.box(
        "gunmetal",
        ox + HW - 1.2,
        oy + 1.3,
        oz + 4 + i * 2.2,
        0.8,
        1.0,
        1.6,
        { seg: false },
      );
      b.quad(
        "lamp_amber",
        ox + HW - 1.61,
        oy + 1.8,
        oz + 4 + i * 2.2,
        1.2,
        0.7,
        { ry: -Math.PI / 2, noAO: true, grime: 0 },
      );
      LB.col(ox + HW - 1.0, oz + 4 + i * 2.2, 1.2, 1.8, oy, oy + 2.3, 0, {
        walkable: false,
      });
    }
    anchors.terminal = P(HW - 2.6, 0, 1.2);
    // the command post's wall signs: the office board above the consoles, and the wall calendar that never turns past 1967
    const fcK = LB.texMat(
      "liberty_fwd_command",
      LB.signTex(
        "liberty_fwd_command",
        ["FORWARD COMMAND · LIBERTY", "OFFICE OF THE ACTING PRESIDENT"],
        "enamel",
        768,
        192,
        { bg: "#1a2230", fg: "#e8dcb8" },
      ),
    );
    b.quad(fcK, ox + HW - 0.03, oy + 4.6, oz + 6.75, 3.0, 0.75, {
      ry: -Math.PI / 2,
      noAO: true,
    });
    const calK = LB.texMat(
      "liberty_calendar",
      LB.signTex(
        "liberty_calendar",
        ["DECEMBER", "1967", "THE EMERGENCY CONTINUES"],
        "enamel",
        256,
        320,
        { bg: "#e8e0c8", fg: "#8a2a24" },
      ),
    );
    b.quad(calK, ox + HW - 0.03, oy + 3.0, oz + 2.25, 0.9, 1.1, {
      ry: -Math.PI / 2,
      noAO: true,
    });
    for (let i = 0; i < 4; i++) {
      const x = -12 + i * 2.6;
      b.box("iron", ox + x, oy + 0.35, oz - 7, 0.9, 0.08, 2.1, { seg: false });
      b.box("tent", ox + x, oy + 0.43, oz - 7, 0.85, 0.14, 2.0, { seg: false });
      for (const dz of [-0.95, 0.95])
        b.box("iron", ox + x, oy, oz - 7 + dz, 0.85, 0.35, 0.05, {
          seg: false,
        });
    }
    anchors.footlocker = P(-12, 0, -5.4);
    anchors.ammo_box = P(9, 0, -9);
    b.box("gunmetal", ox + 9, oy, oz - 11, 3, 2.2, 0.6, { seg: false }); // weapon rack
    for (let i = 0; i < 6; i++)
      b.box("iron", ox + 7.8 + i * 0.45, oy + 0.4, oz - 10.6, 0.08, 1.5, 0.08, {
        rz: 0.1,
        seg: false,
      });
    // hanging work lights
    for (const [x, z] of [
      [-8, 0],
      [8, 0],
      [0, 10],
      [0, -10],
      [-8, 10],
      [8, 10],
    ]) {
      b.cyl("iron", ox + x, oy + 6.2, oz + z, 0.02, 0.02, H - 6.2, 4, {
        hSeg: 1,
      });
      b.cyl("lamp", ox + x, oy + 5.9, oz + z, 0.25, 0.4, 0.35, 8, {
        hSeg: 1,
        noAO: true,
        grime: 0,
      });
    }
    // the old gift shop (south-east corner): counter, souvenir shelves of foam crowns & tin torches, postcard racks
    {
      const D = LB.dress;
      b.boxMM(
        "rotten",
        ox + 8.5,
        oy,
        oz + 10.2,
        ox + 13.5,
        oy + 1.05,
        oz + 10.9,
        { seg: false, grime: 0.5 },
      );
      b.boxMM(
        "paint_cream",
        ox + 8.45,
        oy + 1.05,
        oz + 10.15,
        ox + 13.55,
        oy + 1.1,
        oz + 10.95,
        { seg: false },
      );
      LB.colMM(ox + 8.5, oy, oz + 10.2, ox + 13.5, oy + 1.1, oz + 10.9, {
        walkable: false,
      });
      for (let i = 0; i < 6; i++) {
        const x = ox + 9 + i * 0.8;
        b.cyl("verdigris", x, oy + 1.1, oz + 10.55, 0.05, 0.07, 0.3, 6, {
          hSeg: 1,
        });
        b.cyl("gold", x, oy + 1.4, oz + 10.55, 0.001, 0.07, 0.14, 6, {
          hSeg: 1,
          noAO: true,
          grime: 0,
        });
      }
      D.shelf(b, ox + 15.3, oy, oz + 12.5, -Math.PI / 2, 3.2, 3, 71);
      for (let k = 0; k < 3; k++)
        for (let i = 0; i < 5; i++) {
          const cz = oz + 11.2 + i * 0.6,
            cy = oy + 0.55 + k * 0.45;
          b.cyl("verdigris", ox + 15.0, cy, cz, 0.16, 0.19, 0.08, 7, {
            hSeg: 1,
          }); // foam crowns (the green ring)
          for (let r = 0; r < 5; r++) {
            const a = -0.9 + r * 0.45;
            b.beam(
              "verdigris",
              new THREE.Vector3(
                ox + 15.0 + Math.sin(a) * 0.15,
                cy + 0.08,
                cz + Math.cos(a) * 0.15,
              ),
              new THREE.Vector3(
                ox + 15.0 + Math.sin(a) * 0.3,
                cy + 0.2,
                cz + Math.cos(a) * 0.3,
              ),
              0.02,
            );
          }
        }
      for (const z of [oz + 13.8, oz + 15.0]) {
        b.cyl("iron", ox + 9.5, oy, z, 0.04, 0.04, 1.6, 5, { hSeg: 1 });
        for (let k = 0; k < 4; k++)
          b.box("paper", ox + 9.5, oy + 0.5 + k * 0.28, z, 0.35, 0.22, 0.02, {
            ry: k * 1.57,
            seg: false,
          });
      }
      const gsK = LB.texMat(
        "liberty_gift",
        LB.signTex(
          "liberty_gift",
          ["GIFT SHOP", "TAKE HOME A PIECE OF FREEDOM"],
          "enamel",
          512,
          160,
          { bg: "#2c5a4a", fg: "#f0e0b0" },
        ),
      );
      b.quad(gsK, ox + 11, oy + 3.6, oz + 15.9, 3.2, 1.0, { ry: Math.PI });
      anchors.gift_shop = P(11, 0, 12.4);
      anchors.gift_shop.yaw = 0;
      anchors.note1 = P(12.9, 1.12, 10.55); // the gift-shop counter (quests: the unsent postcard)
    }
    // museum placards + a fallen bust + rubble
    b.rock("rubble", ox + 5.5, oy, oz + 14, 1.0, { flat: 0.4 });
    b.rock("rubble", ox - 13, oy, oz - 13, 1.4, { flat: 0.4 });
    LB.skeleton(b, ox + 2, oy + 0.02, oz + 12.5, 0.7);
    // exit door (south wall) → exterior pedestal portal. Round 2: a framed, lit doorway that reads from across the
    // hall (it was a flat panel with a wall pilaster running through it): granite jamb piers + entablature, riveted
    // double iron leaves, a glowing red EXIT sign and a caged lamp, a worn threshold and an arrow on the floor.
    const doorway = (y0, zf, dir, w, h, lampI) => {
      // zf = wall face z (world), dir = +1 facing north (into the hall from the south wall)
      b.addLight(ox, y0 + h + 0.9, zf - dir * 0.8, 0xffd8a0, 6, lampI);
      for (const sx of [-1, 1]) {
        b.box(
          "granite",
          ox + sx * (w / 2 + 0.35),
          y0,
          zf - dir * 0.3,
          0.7,
          h + 0.1,
          0.6,
          { seg: false, grime: 0.45 },
        );
        b.box(
          "granite_dark",
          ox + sx * (w / 2 + 0.35),
          y0,
          zf - dir * 0.34,
          0.85,
          0.45,
          0.7,
          { seg: false, grime: 0.7 },
        );
        LB.col(
          ox + sx * (w / 2 + 0.35),
          zf - dir * 0.3,
          0.7,
          0.6,
          y0,
          y0 + h,
          0,
          { walkable: false },
        );
      }
      b.box("granite", ox, y0 + h, zf - dir * 0.35, w + 1.6, 0.7, 0.7, {
        seg: false,
        grime: 0.4,
      });
      b.box(
        "granite_dark",
        ox,
        y0 + h + 0.7,
        zf - dir * 0.45,
        w + 2.0,
        0.25,
        0.9,
        { seg: false, grime: 0.35 },
      );
      for (const sx of [-1, 1]) {
        const lw = w / 2 - 0.02,
          cx = ox + sx * (lw / 2 + 0.01),
          cz = zf - dir * 0.1;
        b.box("rust", cx, y0, cz, lw, h - 0.02, 0.15, {
          seg: false,
          grime: 0.6,
        });
        for (const py of [0.5, h * 0.55])
          b.box(
            "iron",
            cx,
            y0 + py,
            cz - dir * 0.09,
            lw - 0.3,
            h * 0.38,
            0.04,
            { seg: false, grime: 0.5 },
          );
        b.box("iron", cx, y0 + h * 0.46, cz - dir * 0.1, lw, 0.12, 0.05, {
          seg: false,
        });
        for (let k = 0; k < 6; k++)
          for (const py of [0.1, h - 0.14])
            b.box(
              "iron",
              cx - lw / 2 + 0.12 + (k * (lw - 0.24)) / 5,
              y0 + py,
              cz - dir * 0.09,
              0.06,
              0.06,
              0.04,
              { seg: false },
            );
        b.box(
          "chrome",
          ox + sx * 0.18,
          y0 + 1.15,
          cz - dir * 0.12,
          0.05,
          0.3,
          0.06,
          { seg: false },
        );
      }
      b.box("iron", ox, y0 + h + 1.1, zf - dir * 0.3, 0.34, 0.4, 0.34, {
        seg: false,
      });
      b.sphere("lamp", ox, y0 + h + 1.25, zf - dir * 0.34, 0.11, {
        ws: 6,
        hs: 4,
        noAO: true,
        grime: 0,
      });
      b.box("granite_dark", ox, y0, zf - dir * 0.9, w + 1.0, 0.03, 1.4, {
        seg: false,
        grime: 0.9,
      });
    };
    doorway(oy, oz + HW, 1, 3.0, 4.0, 0.9);
    const exitSign = LB.texMat(
      "liberty_exit_neon",
      LB.signTex(
        "liberty_exit_neon",
        ["EXIT", "LIBERTY ISLAND ▸"],
        "neon",
        512,
        192,
        { fg: "#ff4a3a" },
      ),
      { emissive: 1.4, noShadow: true },
    );
    b.quad(exitSign, ox, oy + 6.2, oz + HW - 0.03, 2.4, 0.9, {
      ry: Math.PI,
      grime: 0,
      noAO: true,
    });
    {
      const arrowK = LB.texMat(
        "liberty_exit_arrow",
        LB.signTex("liberty_exit_arrow", ["▲ EXIT ▲"], "enamel", 256, 96, {
          bg: "#2e2a1e",
          fg: "#e8c860",
        }),
        {},
      );
      const ag = new THREE.PlaneGeometry(1.6, 0.6);
      ag.rotateX(-Math.PI / 2);
      b.add(arrowK, ag, {
        m: LB.m4(ox, oy + 0.015, oz + HW - 3.2, Math.PI),
        uv: "keep",
        grime: 0.5,
        noAO: true,
      });
    }
    const out = LB.libertyDoorOut;
    if (out)
      G.world.addDoor({
        pos: P(0, 1.6, HW - 0.4),
        label: "Liberty Island",
        verb: "Exit",
        radius: 1.6,
        target: { x: out.x, y: out.y, z: out.z, yaw: out.yaw },
        sound: "door_open",
      });
    // gallery door (north wall at gallery level) → exterior balcony
    doorway(oy + GAL, oz - HW, -1, 2.4, 3.2, 0.7);
    const balSign = LB.texMat(
      "liberty_balc",
      LB.signTex("liberty_balc", ["OBSERVATION BALCONY"], "enamel", 512, 96, {
        bg: "#1b1d20",
      }),
    );
    b.quad(balSign, ox, oy + GAL + 4.55, oz - HW + 0.03, 3, 0.55, {});
    const bal = LB.libertyBalcony;
    if (bal)
      G.world.addDoor({
        pos: P(0, GAL + 1.6, -HW + 0.4),
        label: "Pedestal Balcony",
        verb: "Go to",
        radius: 1.4,
        target: { x: bal.x, y: bal.y, z: bal.z, yaw: bal.yaw },
        sound: "door_open",
      });
    // ==================================================================
    // MAIN STORY, Act IV (src/quests/60_finale.js runs mq06, mq25–mq28 here)
    // ==================================================================
    // ---- the Fort Wood casemates: two barred cells in the south-west corner (1811 brick vaults the Continuity uses as a
    // detention block). Cell A holds Director Calloway (anchor casemate_cell, at the bars of its door: the quests' "Casemate
    // cell door" spot); cell B holds Lys and Corbeau if the Bureau was reported (anchor cell2). Cell A's door swings open
    // and its collider goes when the quests set ms_casemate_open.
    {
      const CZF = 12.2,
        CZB = HW - 0.05,
        CH = 3.6;
      const cells = [
        { x0: -15.6, x1: -12.3 },
        { x0: -12.1, x1: -8.8 },
      ];
      // brick partitions + vault ceilings + a lintel beam over the bar fronts
      for (const xw of [-12.2, -8.7]) {
        b.boxMM(
          "brick",
          ox + xw - 0.1,
          oy,
          oz + CZF,
          ox + xw + 0.1,
          oy + CH + 0.4,
          oz + CZB,
          { grime: 0.6, segLen: 2 },
        );
        LB.colMM(
          ox + xw - 0.1,
          oy,
          oz + CZF,
          ox + xw + 0.1,
          oy + CH,
          oz + CZB,
          { walkable: false },
        );
      }
      for (const c of cells) {
        b.boxMM(
          "brick",
          ox + c.x0,
          oy + CH,
          oz + CZF,
          ox + c.x1,
          oy + CH + 0.4,
          oz + CZB,
          { grime: 0.6 },
        );
        for (let z = CZF + 0.6; z < CZB; z += 1.2)
          b.box(
            "granite_dark",
            ox + (c.x0 + c.x1) / 2,
            oy + CH - 0.22,
            oz + z,
            c.x1 - c.x0,
            0.22,
            0.3,
            { seg: false, grime: 0.6 },
          ); // vault ribs
      }
      b.box("granite_dark", ox - 12.2, oy + CH, oz + CZF, 7.0, 0.5, 0.45, {
        seg: false,
        grime: 0.5,
      });
      // bars: cell B fully barred (static); cell A barred either side of its door, the door itself a separate group
      const bar = (x, z0) =>
        b.cyl("iron", ox + x, oy, oz + z0, 0.025, 0.025, CH, 5, {
          hSeg: 1,
          grime: 0.4,
        });
      const doorA = { x0: -14.5, x1: -13.4 };
      for (let x = -15.5; x < -12.35; x += 0.16)
        if (x < doorA.x0 - 0.02 || x > doorA.x1 + 0.02) bar(x, CZF);
      for (let x = -12.0; x < -8.85; x += 0.16) bar(x, CZF);
      for (const y of [0.12, CH * 0.5, CH - 0.15]) {
        b.box("iron", ox - 13.95, oy + y, oz + CZF, 3.3, 0.06, 0.06, {
          seg: false,
        });
        b.box("iron", ox - 10.45, oy + y, oz + CZF, 3.3, 0.06, 0.06, {
          seg: false,
        });
      }
      LB.colMM(
        ox - 15.6,
        oy,
        oz + CZF - 0.1,
        ox + doorA.x0,
        oy + CH,
        oz + CZF + 0.1,
        { walkable: false, surface: "metal" },
      );
      LB.colMM(
        ox + doorA.x1,
        oy,
        oz + CZF - 0.1,
        ox - 12.3,
        oy + CH,
        oz + CZF + 0.1,
        { walkable: false, surface: "metal" },
      );
      LB.colMM(
        ox - 12.1,
        oy,
        oz + CZF - 0.1,
        ox - 8.8,
        oy + CH,
        oz + CZF + 0.1,
        { walkable: false, surface: "metal" },
      );
      // cell A's door: its own little group (hinged on the west post), shown shut / swung open
      const dm = LB.mat("iron"),
        doorG = new THREE.Group();
      doorG.position.set(ox + doorA.x0, oy, oz + CZF);
      for (let k = 0; k < 7; k++) {
        const m = new THREE.Mesh(
          new THREE.CylinderGeometry(0.025, 0.025, CH - 0.2, 5),
          dm,
        );
        m.position.set(0.08 + k * 0.155, (CH - 0.2) / 2 + 0.05, 0);
        doorG.add(m);
      }
      for (const y of [0.15, CH * 0.5, CH - 0.3]) {
        const m = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.07, 0.07), dm);
        m.position.set(0.55, y, 0);
        doorG.add(m);
      }
      {
        const lockBox = new THREE.Mesh(
          new THREE.BoxGeometry(0.16, 0.2, 0.12),
          LB.mat("rust"),
        );
        lockBox.position.set(1.02, 1.15, 0);
        doorG.add(lockBox);
      }
      root.add(doorG);
      let doorCol = LB.colMM(
        ox + doorA.x0,
        oy,
        oz + CZF - 0.1,
        ox + doorA.x1,
        oy + CH,
        oz + CZF + 0.1,
        { walkable: false, surface: "metal" },
      );
      const isOpen = () => {
        try {
          return !G.isStub("quests") && !!G.quests.flag("ms_casemate_open");
        } catch (e) {
          return false;
        }
      };
      LB.animate(P(-13.95, 1, CZF), 40, () => {
        const op = isOpen();
        doorG.rotation.y = op ? -1.75 : 0;
        if (op && doorCol) {
          try {
            G.world.removeCollider(doorCol);
          } catch (e) {
            /* */
          }
          doorCol = null;
        } else if (!op && !doorCol)
          doorCol = LB.colMM(
            ox + doorA.x0,
            oy,
            oz + CZF - 0.1,
            ox + doorA.x1,
            oy + CH,
            oz + CZF + 0.1,
            { walkable: false, surface: "metal" },
          );
      });
      // furnishings: cots, a bucket, a stool, an empty enamel mug (she asks for coffee), tally marks scratched into the brick
      const cot = (x, z) => {
        b.box("iron", ox + x, oy + 0.35, oz + z, 0.8, 0.07, 1.9, {
          seg: false,
        });
        b.box("tent", ox + x, oy + 0.42, oz + z, 0.75, 0.12, 1.8, {
          seg: false,
        });
        for (const dz of [-0.85, 0.85])
          b.box("iron", ox + x, oy, oz + z + dz, 0.75, 0.35, 0.05, {
            seg: false,
          });
        LB.col(ox + x, oz + z, 0.8, 1.9, oy, oy + 0.45, 0, {
          surface: "fabric",
        });
      };
      cot(-15.0, 14.6);
      cot(-11.6, 14.6);
      cot(-9.4, 14.6);
      b.cyl("iron", ox - 12.9, oy, oz + 15.3, 0.16, 0.14, 0.32, 8, { hSeg: 1 });
      b.cyl("planks", ox - 13.4, oy, oz + 13.4, 0.18, 0.18, 0.45, 8, {
        hSeg: 1,
      });
      b.cyl(
        "paint_cream",
        ox - 13.4,
        oy + 0.45,
        oz + 13.4,
        0.045,
        0.04,
        0.1,
        8,
        { hSeg: 1 },
      );
      const tally = LB.texMat(
        "lb_casemate_tally",
        LB.canvasTex("lb_casemate_tally", 256, 128, (ctx, w, h) => {
          ctx.clearRect(0, 0, w, h);
          ctx.strokeStyle = "rgba(230,220,200,0.75)";
          ctx.lineWidth = 3;
          for (let g = 0; g < 7; g++) {
            const x0 = 12 + g * 34;
            for (let k = 0; k < 4; k++) {
              ctx.beginPath();
              ctx.moveTo(x0 + k * 6, 30);
              ctx.lineTo(x0 + k * 6 + 2, 80);
              ctx.stroke();
            }
            ctx.beginPath();
            ctx.moveTo(x0 - 4, 70);
            ctx.lineTo(x0 + 24, 40);
            ctx.stroke();
          }
          ctx.fillStyle = "rgba(230,220,200,0.8)";
          ctx.font = "bold 15px monospace";
          ctx.fillText("R.C. — C-9 — 24 FEB", 14, 112);
        }),
        {},
      );
      b.quad(tally, ox - 15.58, oy + 1.5, oz + 14.0, 1.2, 0.6, {
        ry: Math.PI / 2,
        noAO: true,
      });
      const cs = LB.texMat(
        "lb_casemate_sign",
        LB.signTex(
          "lb_casemate_sign",
          [
            "FORT WOOD · CASEMATES · 1811",
            "DETENTION — CONTINUITY OF GOVERNMENT",
          ],
          "enamel",
          768,
          128,
          { bg: "#1a2230", fg: "#e8dcb8" },
        ),
      );
      b.quad(cs, ox - 12.2, oy + CH + 0.25, oz + CZF - 0.24, 3.2, 0.5, {
        ry: Math.PI,
        noAO: true,
      });
      b.addLight(ox - 12.2, oy + CH - 0.3, oz + CZF - 1.2, 0xffd8a0, 7, 0.55);
      b.cyl(
        "lamp",
        ox - 12.2,
        oy + CH - 0.25,
        oz + CZF - 0.6,
        0.18,
        0.25,
        0.25,
        8,
        { hSeg: 1, noAO: true, grime: 0 },
      );
      anchors.casemate_cell = P(-13.95, 0, CZF + 0.2);
      anchors.casemate_cell.yaw = 0; // at the bars of cell A's door
      anchors.cell2 = P(-10.45, 0, 13.3);
      anchors.cell2.yaw = 0;
      anchors.casemate = P(-13.95, 0, CZF - 1.0);
      anchors.casemate.yaw = Math.PI; // standing outside, facing the cell (south)
    }
    // ---- Colonel Crane's field desk (the duty log lands on it) at the command post, and the noticeboard by the exit with
    // the 1968 wanted poster (THE MATCH WOMAN) among the orders
    {
      b.box("gunmetal", ox + 5, oy, oz + 1.6, 2.0, 0.76, 0.9, { seg: false });
      b.box("paper", ox + 4.6, oy + 0.77, oz + 1.5, 0.6, 0.02, 0.4, {
        seg: false,
        ry: 0.2,
      });
      b.box("iron", ox + 5.7, oy + 0.77, oz + 1.55, 0.18, 0.22, 0.12, {
        seg: false,
      }); // field telephone
      LB.col(ox + 5, oz + 1.6, 2.0, 0.9, oy, oy + 0.78, 0, { walkable: false });
      anchors.command_post = P(4.4, 0.8, 1.2);
      anchors.command_post.yaw = Math.PI;
      const nb = LB.texMat(
        "lb_liberty_noticeboard",
        LB.canvasTex("lb_liberty_noticeboard", 512, 352, (ctx, w, h) => {
          ctx.fillStyle = "#8a6a44";
          ctx.fillRect(0, 0, w, h);
          ctx.strokeStyle = "#3a2a18";
          ctx.lineWidth = 14;
          ctx.strokeRect(0, 0, w, h);
          for (let i = 0; i < 400; i++) {
            ctx.fillStyle = "rgba(40,24,10," + Math.random() * 0.25 + ")";
            ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
          }
          const sheet = (x, y, sw, sh, rot, bg, draw) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rot);
            ctx.fillStyle = bg;
            ctx.fillRect(-sw / 2, -sh / 2, sw, sh);
            ctx.fillStyle = "#b02020";
            ctx.beginPath();
            ctx.arc(0, -sh / 2 + 6, 4, 0, 7);
            ctx.fill();
            ctx.fillStyle = "#1a1a1a";
            ctx.textAlign = "center";
            draw(sw, sh);
            ctx.restore();
          };
          // the wanted poster: yellowed, 1968, a pencil sketch of a young woman with her chin up
          sheet(150, 178, 190, 270, -0.04, "#d8c89a", (sw, sh) => {
            ctx.font = "bold 26px Georgia, serif";
            ctx.fillText("WANTED", 0, -sh / 2 + 34);
            ctx.font = "bold 15px Georgia, serif";
            ctx.fillText("THE MATCH WOMAN", 0, -sh / 2 + 56);
            ctx.strokeStyle = "rgba(40,36,30,0.85)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(0, -18, 34, 44, 0, 0, 7);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(-34, -30);
            ctx.quadraticCurveTo(-40, 40, -52, 60);
            ctx.moveTo(34, -30);
            ctx.quadraticCurveTo(40, 40, 52, 60);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(-10, -22);
            ctx.lineTo(-4, -22);
            ctx.moveTo(4, -22);
            ctx.lineTo(10, -22);
            ctx.moveTo(-8, 4);
            ctx.quadraticCurveTo(0, 10, 8, 4);
            ctx.stroke();
            ctx.font = 'bold 13px "Courier New", monospace';
            ctx.fillText("MEAD, N. — ARSON", 0, sh / 2 - 58);
            ctx.fillText("12 DEAD · 5 MARCH 1968", 0, sh / 2 - 42);
            ctx.font = "italic 12px Georgia, serif";
            ctx.fillStyle = "#4a3a2a";
            ctx.fillText("PRESUMED DEAD. FILE CLOSED.", 0, sh / 2 - 22);
            ctx.fillText("NOT BELIEVED. — A.C.", 0, sh / 2 - 8);
          });
          sheet(360, 92, 200, 120, 0.03, "#ece6d4", (sw, sh) => {
            ctx.font = 'bold 15px "Courier New", monospace';
            ctx.fillText("DIRECTIVE 7-A", 0, -30);
            ctx.font = '12px "Courier New", monospace';
            ctx.fillText("ENROLMENT CHECKS RESUME", 0, -8);
            ctx.fillText("AT NOON, SUNDAY. CARRY", 0, 10);
            ctx.fillText("YOUR 1967 CARD. — CRANE", 0, 28);
          });
          sheet(345, 250, 180, 120, -0.05, "#e4ead8", (sw, sh) => {
            ctx.font = 'bold 14px "Courier New", monospace';
            ctx.fillText("NO CONTACT WITH", 0, -24);
            ctx.fillText("THE SUN CULT.", 0, -6);
            ctx.font = '11px "Courier New", monospace';
            ctx.fillText("Report all candles, lanterns", 0, 16);
            ctx.fillText("and boats after dark.", 0, 32);
          });
          sheet(460, 300, 80, 70, 0.12, "#f0e0a0", () => {
            ctx.font = "bold 11px monospace";
            ctx.fillText("COFFEE", 0, -6);
            ctx.fillText("RATION", 0, 8);
            ctx.fillText("SUSPENDED", 0, 22);
          });
        }),
        {},
      );
      b.box("planks", ox - 6.75, oy + 1.15, oz + HW - 0.09, 2.0, 1.45, 0.12, {
        seg: false,
        grime: 0.5,
      });
      b.quad(nb, ox - 6.75, oy + 1.87, oz + HW - 0.16, 1.85, 1.27, {
        ry: Math.PI,
        noAO: true,
      });
      anchors.noticeboard = P(-6.75, 0, HW - 1.4);
      anchors.noticeboard.yaw = Math.PI;
    }
    // ---- the evidence cage: wire-mesh bay under the east gallery (the quests put Liberty Station's evidence locker in it)
    {
      const ex0 = 12.6,
        ex1 = 15.8,
        ez0 = -10.8,
        ez1 = -6.2,
        EH = 2.6;
      for (const z of [ez0, ez1]) {
        b.box(
          "iron",
          ox + (ex0 + ex1) / 2,
          oy + EH,
          oz + z,
          ex1 - ex0,
          0.06,
          0.06,
          { seg: false },
        );
        for (let x = ex0; x <= ex1 + 0.01; x += 0.4)
          b.box("iron", ox + x, oy, oz + z, 0.04, EH, 0.04, { seg: false });
      }
      for (const y of [0.6, 1.3, 2.0])
        for (const z of [ez0, ez1])
          b.box(
            "iron",
            ox + (ex0 + ex1) / 2,
            oy + y,
            oz + z,
            ex1 - ex0,
            0.03,
            0.03,
            { seg: false },
          );
      LB.colMM(
        ox + ex0,
        oy,
        oz + ez0 - 0.05,
        ox + ex1,
        oy + EH,
        oz + ez0 + 0.05,
        { walkable: false, surface: "metal" },
      );
      LB.colMM(
        ox + ex0,
        oy,
        oz + ez1 - 0.05,
        ox + ex1,
        oy + EH,
        oz + ez1 + 0.05,
        { walkable: false, surface: "metal" },
      );
      const evK = LB.texMat(
        "lb_liberty_evidence",
        LB.signTex(
          "lb_liberty_evidence",
          ["EVIDENCE", "AUTHORIZED PERSONNEL ONLY"],
          "enamel",
          512,
          128,
          { bg: "#e8e0c8", fg: "#8a2a24" },
        ),
      );
      b.quad(
        evK,
        ox + ex0 - 0.04,
        oy + EH - 0.4,
        oz + (ez0 + ez1) / 2,
        1.6,
        0.4,
        { ry: -Math.PI / 2, noAO: true },
      );
      anchors.armory = P(14.6, 0, -8.5);
      anchors.armory.yaw = Math.PI / 2;
    }
    anchors.interior_entrance = P(0, 0, 12);
    anchors.interior_gallery = P(0, GAL, -13.5);
    anchors.spawn_in1 = P(-4, 0, -2);
    anchors.spawn_in2 = P(10, 0, -4);
    anchors.spawn_in3 = P(10, GAL, -13);
    const g = b.build(root);
    g.name = "liberty_interior";
    void extAnchors;
    return anchors;
  }
})();
