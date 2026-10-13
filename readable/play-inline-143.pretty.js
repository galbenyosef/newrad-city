/* src/landmarks_b/55_met_park_interior.js */
/* =====================================================================
 * LANDMARKS B — THE MET, CENTRAL PARK SIDE: the Temple of Dendur hall
 * (INTERIOR behind the north glass wing (a 1966 project, never finished)'s glass wall, entered through the
 * blown-in breach): baked light (grey daylight through the glass + the
 * looters' fire), marble floor, coffered ceiling, the scummed reflecting
 * pool (radiation source), the granite podium and the temple itself (pylon
 * gate, pronaos with papyrus-capital columns & screen walls, cella,
 * Egyptian cornices, sunk-relief canvas), the looters' camp, museum
 * furniture, the Dendur anchors and the looters' containers.
 * Called from LB.metParkSide (55_met_park.js) via
 * LB.interiorPart('met', 'dendur', ctx).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._lb) return;
  const LB = G._lb;
  const TAU = Math.PI * 2;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);

  // --------------------------------------------------------------------
  // Temple of Dendur relief texture: sunk-relief registers of offering
  // scenes, hieroglyph columns, the winged sun disc — and the 1820s graffiti.
  // --------------------------------------------------------------------
  function reliefTex() {
    return LB.canvasTex("lb_dendur_relief", 512, 512, (ctx, w, h) => {
      const r = G.util.rng(77);
      ctx.fillStyle = "#c3a57a";
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 900; i++) {
        ctx.fillStyle =
          "rgba(" +
          (r() < 0.5 ? "90,64,40," : "240,220,180,") +
          r() * 0.12 +
          ")";
        ctx.fillRect(r() * w, r() * h, 1 + r() * 3, 1 + r() * 3);
      }
      // coursed blocks
      ctx.strokeStyle = "rgba(92,70,46,0.55)";
      ctx.lineWidth = 2;
      for (let y = 0; y <= h; y += 64) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
        for (let x = (y / 64) % 2 ? 0 : 60; x < w; x += 120) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + 64);
          ctx.stroke();
        }
      }
      // register lines
      ctx.strokeStyle = "rgba(70,50,30,0.7)";
      ctx.lineWidth = 3;
      for (const y of [150, 330]) {
        ctx.beginPath();
        ctx.moveTo(10, y);
        ctx.lineTo(w - 10, y);
        ctx.stroke();
      }
      // winged sun disc on top
      ctx.fillStyle = "rgba(70,48,28,0.55)";
      ctx.beginPath();
      ctx.arc(w / 2, 60, 18, 0, TAU);
      ctx.fill();
      for (const sgn of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(w / 2 + sgn * 16, 52);
        ctx.quadraticCurveTo(w / 2 + sgn * 120, 20, w / 2 + sgn * 190, 58);
        ctx.lineTo(w / 2 + sgn * 18, 72);
        ctx.closePath();
        ctx.fill();
      }
      // figures in profile (sunk relief: dark outline + shaded fill)
      const figure = (x, yb, s, crown, facing) => {
        ctx.save();
        ctx.translate(x, yb);
        ctx.scale(facing * s, s);
        ctx.fillStyle = "rgba(110,80,50,0.45)";
        ctx.strokeStyle = "rgba(60,40,22,0.8)";
        ctx.lineWidth = 2.2 / s;
        ctx.beginPath();
        ctx.moveTo(-8, 0);
        ctx.lineTo(-6, -46);
        ctx.lineTo(-10, -60);
        ctx.lineTo(-9, -92);
        ctx.lineTo(-4, -100);
        ctx.lineTo(8, -100);
        ctx.lineTo(10, -90);
        ctx.lineTo(24, -76);
        ctx.lineTo(22, -72);
        ctx.lineTo(9, -80);
        ctx.lineTo(9, -60);
        ctx.lineTo(6, -46);
        ctx.lineTo(12, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(3, -110, 9, 11, 0, 0, TAU);
        ctx.fill();
        ctx.stroke();
        if (crown) {
          ctx.beginPath();
          ctx.moveTo(-5, -118);
          ctx.lineTo(0, -142);
          ctx.lineTo(9, -118);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
        ctx.restore();
      };
      figure(90, 318, 1.35, true, 1);
      figure(200, 318, 1.35, false, -1);
      figure(330, 318, 1.35, true, 1);
      figure(440, 318, 1.35, false, -1);
      figure(120, 500, 1.3, false, 1);
      figure(250, 500, 1.3, true, -1);
      figure(390, 500, 1.3, false, 1);
      // offering tables between the pairs
      ctx.fillStyle = "rgba(80,58,34,0.5)";
      for (const x of [145, 385]) {
        ctx.fillRect(x - 12, 262, 24, 6);
        ctx.fillRect(x - 3, 268, 6, 44);
        ctx.beginPath();
        ctx.arc(x, 256, 9, Math.PI, 0);
        ctx.fill();
      }
      // hieroglyph columns
      ctx.fillStyle = "rgba(62,42,24,0.7)";
      for (const cx of [40, 262, 480])
        for (let y = 170; y < 318; y += 16) {
          const k = Math.floor(r() * 4);
          if (k === 0) ctx.fillRect(cx - 5, y, 10, 3);
          else if (k === 1) {
            ctx.beginPath();
            ctx.arc(cx, y + 5, 5, 0, TAU);
            ctx.fill();
          } else if (k === 2) {
            ctx.beginPath();
            ctx.moveTo(cx - 6, y + 10);
            ctx.lineTo(cx, y);
            ctx.lineTo(cx + 6, y + 10);
            ctx.fill();
          } else ctx.fillRect(cx - 1.5, y, 3, 11);
        }
      // 19th-century traveller's graffiti, scratched in
      ctx.fillStyle = "rgba(245,232,205,0.55)";
      ctx.font = "italic 17px Georgia, serif";
      ctx.fillText("LEONARDO 1820", 300, 390);
      // weathering: salt bloom low down, a dark water line, chips
      const g = ctx.createLinearGradient(0, h * 0.8, 0, h);
      g.addColorStop(0, "rgba(255,250,235,0)");
      g.addColorStop(1, "rgba(255,250,235,0.28)");
      ctx.fillStyle = g;
      ctx.fillRect(0, h * 0.8, w, h * 0.2);
      for (let i = 0; i < 30; i++) {
        ctx.fillStyle = "rgba(70,50,30," + r() * 0.25 + ")";
        ctx.beginPath();
        ctx.arc(r() * w, r() * h, 2 + r() * 7, 0, TAU);
        ctx.fill();
      }
    });
  }

  const met = LB.interiors.met || (LB.interiors.met = {});
  /** ctx: {root, anchors, FY (hall floor), GX0, GX1 (foot / head x of the raking glass), SZ0, SZ1 (hall z range),
   *  RY (roof underside), DX1 (east wall x), zBr0 (breach start z), zBm (breach centre z)}. */
  met.dendur = function (ctx) {
    const K = LB.kit,
      D = LB.dress;
    const { root, anchors, FY, GX0, GX1, SZ0, SZ1, RY, DX1, zBr0, zBm } = ctx;
    // ---- hall interior (baked light: grey daylight through the glass + the looters' fire) ----
    const bt = LB.batch("met_dendur");
    bt.ground = FY;
    bt.aoH = 3;
    const PY = FY + 0.6; // temple platform top
    const FIRE = V(69.9, PY, -691.2);
    bt.setLights(
      [
        { x: 58.8, y: FY + 7, z: -698, color: 0xd6dfe8, r: 17, i: 0.32 },
        { x: 58.8, y: FY + 7, z: -688, color: 0xd6dfe8, r: 17, i: 0.32 },
        { x: 58.8, y: FY + 7, z: -678, color: 0xd6dfe8, r: 17, i: 0.32 },
        {
          x: FIRE.x,
          y: FIRE.y + 0.7,
          z: FIRE.z,
          color: 0xff9444,
          r: 10,
          i: 0.95,
        },
        { x: 68.5, y: PY + 2.2, z: -685.5, color: 0xffb070, r: 6, i: 0.45 }, // lantern in the cella
      ],
      0xb8c0c8,
      0.12,
    );
    const HX1 = DX1;
    bt.boxMM("marble_floor", GX0, FY - 0.02, SZ0, HX1, FY + 0.04, SZ1, {
      grime: 0.55,
      noAO: true,
    });
    bt.boxMM("stucco", HX1 - 0.3, FY, SZ0, HX1, RY, SZ1, {
      grime: 0.5,
      c: 0xd8d0c0,
    }); // east wall (inner face)
    for (const zw of [SZ0, SZ1])
      bt.boxMM("stucco", GX0, FY, zw - 0.02, HX1, RY, zw + 0.02, {
        grime: 0.5,
        c: 0xd8d0c0,
      });
    // coffered ceiling: plaster soffit with deep beams
    bt.boxMM("plaster", GX1 - 0.3, RY - 0.05, SZ0, HX1, RY, SZ1, {
      grime: 0.4,
    });
    for (let z = SZ0 + 2.5; z < SZ1; z += 3.7)
      bt.boxMM(
        "plaster",
        GX1 - 0.3,
        RY - 0.9,
        z - 0.25,
        HX1,
        RY - 0.05,
        z + 0.25,
        { seg: false, grime: 0.35 },
      );
    // reflecting pool along the glass (scummed), granite rim
    const PL = { x0: 57.0, x1: 62.8, z0: SZ0 + 1.0, z1: zBr0 - 2.4 };
    bt.boxMM("goo", PL.x0, FY, PL.z0, PL.x1, FY + 0.16, PL.z1, {
      seg: false,
      noAO: true,
    });
    for (const [x0, z0, x1, z1] of [
      [PL.x0 - 0.35, PL.z0 - 0.35, PL.x1 + 0.35, PL.z0],
      [PL.x0 - 0.35, PL.z1, PL.x1 + 0.35, PL.z1 + 0.35],
      [PL.x0 - 0.35, PL.z0, PL.x0, PL.z1],
      [PL.x1, PL.z0, PL.x1 + 0.35, PL.z1],
    ]) {
      bt.boxMM("granite", x0, FY, z0, x1, FY + 0.34, z1, {
        seg: false,
        grime: 0.5,
      });
      LB.colMM(x0, FY, z0, x1, FY + 0.34, z1);
    }
    try {
      G.world.addRadSource({
        x: (PL.x0 + PL.x1) / 2,
        y: FY + 0.2,
        z: (PL.z0 + PL.z1) / 2,
        radius: 4.5,
        strength: 1.0,
      });
    } catch (e) {
      /* core */
    }
    // temple podium (granite) with a step along its west side
    const TPx0 = 64.0,
      TPx1 = 74.2,
      TPz0 = SZ0 + 1.2,
      TPz1 = SZ1 - 1.4;
    bt.boxMM("granite", TPx0, FY, TPz0, TPx1, PY, TPz1, { grime: 0.5 });
    bt.boxMM("granite", TPx0 - 0.8, FY, TPz0 + 1, TPx0, FY + 0.3, TPz1 - 1, {
      seg: false,
      grime: 0.6,
    });
    LB.colMM(TPx0, FY, TPz0, TPx1, PY, TPz1);
    LB.colMM(TPx0 - 0.8, FY, TPz0 + 1, TPx0, FY + 0.3, TPz1 - 1);
    // --- the Temple of Dendur (Nubian sandstone): pylon gate, pronaos with two columns & screen walls, cella ---
    const S = "buffstone";
    const relK = LB.texMat("met_dendur_relief", reliefTex(), { rough: 0.9 });
    const TX0 = 65.6,
      TX1 = 71.4,
      TXC = (TX0 + TX1) / 2;
    const TF = -694.0,
      TB = -682.2,
      TW = 6.2; // front (north) / back z, wall height
    /** Egyptian cornice (torus roll + stepped cavetto flare) around a rectangle at height y. */
    const cornice = (x0, z0, x1, z1, y) => {
      bt.boxMM(S, x0 - 0.12, y, z0 - 0.12, x1 + 0.12, y + 0.22, z1 + 0.12, {
        seg: false,
        grime: 0.4,
      });
      bt.boxMM(S, x0 - 0.3, y + 0.22, z0 - 0.3, x1 + 0.3, y + 0.5, z1 + 0.3, {
        seg: false,
        grime: 0.35,
      });
      bt.boxMM(
        S,
        x0 - 0.55,
        y + 0.5,
        z0 - 0.55,
        x1 + 0.55,
        y + 0.78,
        z1 + 0.55,
        { seg: false, grime: 0.3 },
      );
      bt.boxMM(
        S,
        x0 - 0.62,
        y + 0.78,
        z0 - 0.62,
        x1 + 0.62,
        y + 0.95,
        z1 + 0.62,
        { seg: false, grime: 0.45 },
      );
    };
    // pylon gate in front of the temple
    const GZ0 = TF - 5.6,
      GZ1 = TF - 4.2;
    for (const [x0, x1] of [
      [TXC - 2.6, TXC - 0.8],
      [TXC + 0.8, TXC + 2.6],
    ]) {
      bt.boxMM(S, x0, PY, GZ0, x1, PY + 6.0, GZ1, { grime: 0.45 });
      LB.colMM(x0, PY, GZ0, x1, PY + 6.0, GZ1, { walkable: false });
      bt.quad(relK, (x0 + x1) / 2, PY + 3.0, GZ0 - 0.01, x1 - x0 - 0.1, 5.8, {
        ry: Math.PI,
        uvRect: [0.1, 0, 0.45, 1],
        grime: 0.2,
      });
    }
    bt.boxMM(S, TXC - 2.6, PY + 6.0, GZ0, TXC + 2.6, PY + 6.9, GZ1, {
      seg: false,
      grime: 0.4,
    });
    cornice(TXC - 2.6, GZ0, TXC + 2.6, GZ1, PY + 6.9);
    bt.quad(relK, TXC, PY + 6.45, GZ0 - 0.02, 5.1, 0.85, {
      ry: Math.PI,
      uvRect: [0.05, 0.84, 0.95, 1],
      grime: 0.1,
    }); // winged sun disc
    // pronaos: antae + two columns with composite papyrus capitals + screen walls
    for (const [x0, x1] of [
      [TX0, TX0 + 0.8],
      [TX1 - 0.8, TX1],
    ]) {
      bt.boxMM(S, x0, PY, TF, x1, PY + TW, TB, { grime: 0.45 });
      LB.colMM(x0, PY, TF, x1, PY + TW, TB, { walkable: false });
    }
    for (const x of [TXC - 1.1, TXC + 1.1]) {
      bt.cyl(S, x, PY, TF + 0.45, 0.4, 0.46, 4.7, 14, { hSeg: 3, grime: 0.45 });
      bt.lathe(
        S,
        [
          [0.4, 0],
          [0.55, 0.25],
          [0.85, 0.7],
          [0.95, 0.85],
          [0.9, 0.95],
        ],
        16,
        x,
        PY + 4.7,
        TF + 0.45,
        {
          grime: 0.35,
          deform: (v) => {
            const a = Math.atan2(v.x, v.z);
            const k = 1 + 0.07 * Math.sin(a * 8);
            v.x *= k;
            v.z *= k;
          },
        },
      );
      bt.box(S, x, PY + 5.65, TF + 0.45, 1.0, 0.55, 1.0, { seg: false });
      LB.col(x, TF + 0.45, 0.95, 0.95, PY, PY + TW, 0, { walkable: false });
    }
    for (const [x0, x1] of [
      [TX0 + 0.8, TXC - 1.5],
      [TXC + 1.5, TX1 - 0.8],
    ]) {
      bt.boxMM(S, x0, PY, TF + 0.25, x1, PY + 2.3, TF + 0.65, {
        seg: false,
        grime: 0.5,
      });
      bt.boxMM(
        S,
        x0 - 0.05,
        PY + 2.3,
        TF + 0.18,
        x1 + 0.05,
        PY + 2.55,
        TF + 0.72,
        { seg: false },
      );
      LB.colMM(x0, PY, TF + 0.25, x1, PY + 2.3, TF + 0.65, { walkable: false });
    }
    bt.boxMM(S, TX0, PY + TW - 0.8, TF, TX1, PY + TW, TF + 0.9, {
      seg: false,
      grime: 0.4,
    }); // architrave over the columns
    // cella: walls around the sanctuary, door from the pronaos
    const CZ0 = TF + 4.0;
    K.room(
      bt,
      S,
      TX0 + 0.8,
      CZ0,
      TX1 - 0.8,
      TB,
      PY,
      PY + TW,
      0.6,
      [{ side: "n", c: TXC, w: 1.5, h: 3.3 }],
      { grime: 0.45 },
    );
    bt.boxMM(S, TX0 + 0.8, PY + 3.3, CZ0, TX1 - 0.8, PY + TW, CZ0 + 0.6, {
      seg: false,
      grime: 0.4,
    });
    bt.boxMM(S, TX0 - 0.05, PY + TW, TF, TX1 + 0.05, PY + TW + 0.5, TB, {
      grime: 0.4,
    }); // roof slabs
    LB.colMM(TX0, PY + TW, TF, TX1, PY + TW + 0.5, TB);
    cornice(TX0, TF, TX1, TB, PY + TW + 0.3);
    // sunk reliefs on the outer walls & the pronaos back wall
    for (const [x, ry] of [
      [TX0 - 0.02, -Math.PI / 2],
      [TX1 + 0.02, Math.PI / 2],
    ]) {
      bt.quad(relK, x, PY + TW / 2, (CZ0 + TB) / 2, TB - CZ0 - 0.4, TW - 0.4, {
        ry,
        grime: 0.2,
      });
      bt.quad(relK, x, PY + TW / 2, (TF + CZ0) / 2, CZ0 - TF - 0.4, TW - 0.4, {
        ry,
        uvRect: [0, 0, 0.5, 1],
        grime: 0.2,
      });
    }
    bt.quad(relK, TXC - 1.9, PY + 2.2, CZ0 - 0.02, 1.6, 3.6, {
      ry: Math.PI,
      uvRect: [0.1, 0, 0.4, 0.6],
      grime: 0.2,
    });
    bt.quad(relK, TXC + 1.9, PY + 2.2, CZ0 - 0.02, 1.6, 3.6, {
      ry: Math.PI,
      uvRect: [0.6, 0, 0.9, 0.6],
      grime: 0.2,
    });
    // ---- looters' camp in the pronaos / cella (the robots never let them leave) ----
    D.mattress(bt, TXC - 0.95, PY + 0.02, CZ0 + 2.0, 0.25);
    D.mattress(bt, TXC + 0.9, PY + 0.02, CZ0 + 2.9, -0.2, 0x8a8a70);
    for (let k = 0; k < 7; k++) {
      const a = (k / 7) * TAU;
      bt.rock(
        "rubble",
        FIRE.x + Math.cos(a) * 0.55,
        PY,
        FIRE.z + Math.sin(a) * 0.55,
        0.18,
        { flat: 0.7, detail: 0, seed: k },
      );
    }
    bt.box("rotten", FIRE.x, PY + 0.02, FIRE.z, 0.7, 0.12, 0.12, {
      ry: 0.6,
      seg: false,
    });
    bt.box("rotten", FIRE.x, PY + 0.06, FIRE.z, 0.7, 0.12, 0.12, {
      ry: -0.5,
      seg: false,
    });
    LB.fires.push(V(FIRE.x, PY + 0.15, FIRE.z));
    LB.glows.push({
      pos: V(FIRE.x, PY + 0.6, FIRE.z),
      color: 0xff9040,
      size: 2.4,
    });
    bt.cyl("iron", TXC, PY + 2.0, CZ0 + 3.3, 0.12, 0.15, 0.35, 8, { hSeg: 1 }); // hanging lantern
    bt.sphere("lamp", TXC, PY + 2.2, CZ0 + 3.3, 0.14, { noAO: true, grime: 0 });
    bt.beam(
      "iron",
      V(TXC, PY + 2.35, CZ0 + 3.3),
      V(TXC, PY + TW, CZ0 + 3.3),
      0.03,
    );
    D.crates(bt, TX1 - 1.9, PY, TB - 1.4, 3, 71, true);
    LB.skeleton(bt, TXC + 0.4, PY + 0.05, TF - 1.4, 0.9);
    D.papers(bt, TXC, PY + 0.02, CZ0 + 1.5, 2.0, 9, 13);
    // museum furniture: stanchions & a label stand near the breach walkway, toppled bench
    for (let i = 0; i < 6; i++)
      bt.cyl(
        "chrome",
        PL.x1 + 0.9,
        FY,
        PL.z1 - 1.2 - i * 2.2,
        0.06,
        0.12,
        0.95,
        8,
        { hSeg: 1, rx: i === 3 ? 1.45 : 0 },
      );
    const labelK = LB.texMat(
      "met_dendur_label",
      LB.signTex(
        "met_dendur_label",
        [
          "THE TEMPLE OF DENDUR",
          "EGYPT, ROMAN PERIOD, CA. 10 B.C.",
          "GIFT OF THE ARAB REPUBLIC OF EGYPT",
        ],
        "enamel",
        512,
        192,
        { bg: "#20262a", fg: "#e0d6c0" },
      ),
    );
    bt.box("iron", 60.2, FY, zBr0 - 1.2, 0.08, 1.0, 0.08, { seg: false });
    bt.quad(labelK, 60.2, FY + 1.15, zBr0 - 1.2, 1.3, 0.5, {
      ry: -Math.PI / 2,
      rx: -0.4,
    });
    LB.plaque(
      V(60.2, FY + 1.15, zBr0 - 1.2),
      "Temple of Dendur",
      '"Built by Petronius, Roman governor of Egypt, c. 15 B.C., for the goddess Isis. Given to the United States in 1965 and re-erected here, ahead of schedule, over the winter of 1966–67, in a new glass wing that was never quite finished. Please do not climb on the temple. The automated docents are authorized to enforce this request."',
    );
    LB.bench(bt, 60.8, FY, -674.8, 0.2);
    D.rubble(bt, 59.5, FY + 0.04, zBm, 1.4, 10, 17);
    D.rubble(bt, 65.5, FY + 0.04, SZ1 - 0.9, 0.8, 5, 18);
    bt.build(root);

    // anchors (the Met's third Patrolman robot now patrols the Dendur hall; loot in the cella)
    anchors.dendur = LB.anchor(TXC, PY, TF - 2.5, 0);
    anchors.dendur_breach = LB.anchor(58.5, FY, zBm, -Math.PI / 2);
    anchors.spawn3 = LB.anchor(62.0, FY, zBm - 1.0, -Math.PI / 2);
    anchors.dendur_loot = LB.anchor(TXC - 0.7, PY, TB - 1.1, Math.PI);
    LB.onReady.push(() => {
      LB.spawnProp("footlocker", {
        x: TXC - 0.7,
        y: PY,
        z: TB - 1.1,
        yaw: Math.PI,
        loot: "footlocker",
        name: "Looter's Footlocker",
      });
      LB.spawnProp("ammo_box", {
        x: TXC - 0.9,
        y: PY,
        z: CZ0 + 4.4,
        yaw: 0.4,
        loot: "ammo_box",
      });
      LB.spawnProp("first_aid", {
        x: TX1 - 1.5,
        y: PY,
        z: CZ0 + 1.0,
        yaw: -Math.PI / 2,
        floor: true,
        loot: "first_aid",
      });
    });
  };
})();
