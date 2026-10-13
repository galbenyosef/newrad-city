// play-inline-401 03 — tint
// Lines 68-2053 of readable/play-inline-401.pretty.js (statement-aligned).
  function interior(ctx) {
    const O = ctx.O;
    const b = K.builder({
      name: "ce_int",
      off: O,
      lit: true,
      amb: [0.06, 0.06, 0.07],
      floors: [0, VY, CR.y, LY],
      grime: 0.5,
    });
    const lens = K.builder({
      name: "ce_lens_lit",
      off: O,
      lit: false,
      grime: 0,
    });
    const r = K.rng("ce_int");
    const red = [1, 0.18, 0.12],
      cold = [0.7, 0.8, 0.95],
      amber = [1, 0.7, 0.35],
      day = [0.6, 0.66, 0.74];

    // ---------------------------------------------------------------- gaps
    K.gap(ctx, 0, 0, 2.4, 0, 3.4); // street portal
    K.gap(ctx, 0, -16, 3.0, 0, 3.4); // lobby → control
    K.gap(ctx, 10, -25.5, 1.4, 0, 2.4); // control → service stair
    K.gap(ctx, 10, -38, 1.6, VY, 2.6); // stair foot → transformer hall

    // ================================================================ LOBBY
    const LB = [-10.1, -0.3, -16.1, 10.1, 7.1, 0.1];
    K.room(b, ctx, {
      x0: -10,
      z0: -16,
      x1: 10,
      z1: 0,
      y: 0,
      h: 7,
      floor: "marble",
      fc: [0.8, 0.78, 0.74],
      wall: "marble",
      wc: [0.78, 0.74, 0.66],
      wain: "granite",
      wainC: [0.35, 0.3, 0.28],
      wainH: 1.3,
      ceil: "plaster",
      cc: [0.55, 0.52, 0.46],
      cornice: true,
      corniceMat: "limestone",
      trimMat: "bronze",
    });
    // coffered ceiling
    for (let x = -8; x <= 8; x += 4)
      b.beam("limestone", x, 6.7, -15.9, x, 6.7, -0.1, 0.35, 0.6, {
        tint: [0.7, 0.66, 0.58],
      });
    for (let z = -12; z <= -4; z += 4)
      b.beam("limestone", -9.9, 6.7, z, 9.9, 6.7, z, 0.35, 0.6, {
        tint: [0.7, 0.66, 0.58],
      });
    // bronze pilasters
    for (const x of [-9.85, 9.85])
      for (let z = -13; z <= -3; z += 5)
        b.box("bronze", x, 0, z, 0.3, 7, 0.6, { tint: [0.42, 0.34, 0.2] });
    // arched south windows either side of the portal (daylight)
    for (const x of [-6.5, 6.5]) {
      b.plate("lamp", x, 3.8, -0.12, 0, -1, 3.0, 4.6, null, {
        tint: [0.42, 0.44, 0.46],
      });
      for (let k = 1; k < 4; k++)
        b.beam(
          "bronze",
          x - 1.5 + k * 0.75,
          1.5,
          -0.15,
          x - 1.5 + k * 0.75,
          6.1,
          -0.15,
          0.06,
          0.06,
          { tint: [0.42, 0.34, 0.2] },
        );
      b.light(x, 3.5, -1.5, day, 0.8, 8, { box: LB });
      b.glow(x, 3.5, -0.3, [0.45, 0.48, 0.5], 3.4);
    }
    // bronze elevator bank (north wall): four doors, indicator dials
    for (const x of [-7.5, -4.5, 4.5, 7.5]) {
      b.boxMM("bronze", x - 0.75, 0, -15.95, x + 0.75, 2.6, -15.85, {
        tint: [0.46, 0.37, 0.22],
      });
      b.beam("paint_black", x, 0, -15.84, x, 2.6, -15.84, 0.03, 0.02);
      b.boxMM("bronze", x - 1.0, 2.6, -15.95, x + 1.0, 3.3, -15.8, {
        tint: [0.4, 0.32, 0.18],
      });
      b.cyl("bronze", x, 3.5, -15.85, 0.35, 0.35, 0.05, 12, {
        tint: [0.5, 0.4, 0.22],
      });
      b.geo("bronze", new THREE.CircleGeometry(0.3, 14, 0, PI), {
        x,
        y: 3.5,
        z: -15.78,
        tint: [0.8, 0.75, 0.6],
      });
    }
    // bronze lettering over the elevator bank + a warm wash so the bronze reads
    K.letters(b, 0, 4.4, -15.82, 0, 1, 7.5, 0.55, "FIVE  BOROUGHS  POWER", {
      fg: "#b89850",
      font: "Georgia, serif",
      off: 0.02,
    });
    K.letters(
      b,
      0,
      3.95,
      -15.82,
      0,
      1,
      4.6,
      0.26,
      "EVERY BOROUGH, EVERY BULB.",
      { fg: "#a88a48", font: "Georgia, serif", off: 0.02 },
    );
    b.light(0, 3.6, -13.2, amber, 0.55, 8, { box: LB });
    // inlaid marble floor medallion: a sunburst with the lightning bolt, cracked through the middle
    b.hplate(
      "decal",
      0,
      0.013,
      -11.2,
      4.2,
      4.2,
      0,
      K.paint("art", "ce_medallion", 256, 256, function (c, X, Y, W, H) {
        c.clearRect(X, Y, W, H);
        const cx = X + W / 2,
          cy = Y + H / 2;
        c.fillStyle = "#2a3a34";
        c.beginPath();
        c.arc(cx, cy, W * 0.48, 0, PI * 2);
        c.fill();
        c.fillStyle = "#b89850";
        c.beginPath();
        c.arc(cx, cy, W * 0.44, 0, PI * 2);
        c.fill();
        c.fillStyle = "#e8e0cc";
        c.beginPath();
        c.arc(cx, cy, W * 0.4, 0, PI * 2);
        c.fill();
        for (let k = 0; k < 24; k++) {
          const a0 = (k / 24) * PI * 2,
            a1 = ((k + 0.5) / 24) * PI * 2;
          c.fillStyle = k % 2 ? "#c8a860" : "#8a6a38";
          c.beginPath();
          c.moveTo(cx, cy);
          c.arc(cx, cy, W * 0.38, a0, a1);
          c.fill();
        }
        c.fillStyle = "#2a3a34";
        c.beginPath();
        c.arc(cx, cy, W * 0.16, 0, PI * 2);
        c.fill();
        c.fillStyle = "#e8c850";
        c.beginPath();
        c.moveTo(cx + 8, cy - 34);
        c.lineTo(cx - 14, cy + 4);
        c.lineTo(cx - 1, cy + 4);
        c.lineTo(cx - 9, cy + 34);
        c.lineTo(cx + 15, cy - 6);
        c.lineTo(cx + 2, cy - 6);
        c.closePath();
        c.fill();
        c.strokeStyle = "rgba(20,20,20,0.7)";
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(X + 20, Y + 60);
        c.lineTo(cx - 20, cy + 10);
        c.lineTo(cx + 30, cy + 40);
        c.lineTo(X + W - 30, Y + H - 20);
        c.stroke();
        K.stains(c, X, Y, W, H, 14, 81, 0.45, [30, 30, 20]);
      }),
    );
    b.plate(
      "art",
      4.5,
      1.6,
      -15.78,
      0,
      1,
      0.5,
      0.3,
      K.signCell("ce_exec", "EXECUTIVE\nTOWER", 128, 72, {
        bg: "#2a2014",
        fg: "#d8b060",
        font: "Georgia, serif",
      }),
    );
    b.boxMM("steel", 5.4, 1.2, -15.85, 5.6, 1.5, -15.75, {
      tint: [0.5, 0.5, 0.5],
    }); // card reader
    b.geo("lamp", K.sphereGeo(), {
      x: 5.5,
      y: 1.55,
      z: -15.72,
      s: 0.025,
      tint: [1, 0.2, 0.1],
    });
    // the linemen's memorial (west wall): bronze plaque + wreath
    const plaque = K.paint(
      "art",
      "ce_memorial",
      512,
      384,
      function (x, X, Y, W, H) {
        x.fillStyle = "#5a4424";
        x.fillRect(X, Y, W, H);
        x.strokeStyle = "#a88848";
        x.lineWidth = 10;
        x.strokeRect(X + 12, Y + 12, W - 24, H - 24);
        x.fillStyle = "#d8c080";
        x.textAlign = "center";
        x.textBaseline = "middle";
        x.font = "bold 30px Georgia, serif";
        x.fillText("THE TOWER OF LIGHT", X + W / 2, Y + 60);
        x.font = "italic 20px Georgia, serif";
        [
          "is lit each night in memory of",
          "the linemen, splicers and operators",
          "who kept New York shining through",
          "the Great Blackout of 1965.",
          "",
          '"THE LIGHTS STAY ON."',
        ].forEach((t, i) => x.fillText(t, X + W / 2, Y + 120 + i * 34));
        x.font = "14px Georgia, serif";
        x.fillText(
          "Five Boroughs Power Company · Dedicated 1966",
          X + W / 2,
          Y + H - 36,
        );
        K.stains(x, X, Y, W, H, 10, 44, 0.4, [20, 40, 20]);
      },
    );
    b.plate("art", -9.78, 3.6, -8, 1, 0, 3.4, 2.55, plaque, { off: 0.02 });
    b.geo("cloth_green", new THREE.TorusGeometry(0.5, 0.12, 5, 14), {
      x: -9.7,
      y: 1.7,
      z: -8,
      ry: HP,
      tint: [0.3, 0.26, 0.18],
    });
    // security desk (curved front) + a toppled patrolman shell
    for (let k = 0; k < 8; k++) {
      const a0 = PI + (PI * k) / 8,
        a1 = PI + (PI * (k + 1)) / 8;
      b.quadN(
        "granite",
        [Math.cos(a0) * 2.4, 0, -7 - Math.sin(a0) * 1.2],
        [Math.cos(a1) * 2.4, 0, -7 - Math.sin(a1) * 1.2],
        [Math.cos(a1) * 2.4, 1.1, -7 - Math.sin(a1) * 1.2],
        [Math.cos(a0) * 2.4, 1.1, -7 - Math.sin(a0) * 1.2],
        [Math.cos((a0 + a1) / 2), 0, -Math.sin((a0 + a1) / 2)],
        { tint: [0.4, 0.36, 0.34] },
      );
    }
    b.boxMM("bronze", -2.5, 1.1, -7.5, 2.5, 1.18, -6.6, {
      tint: [0.42, 0.34, 0.2],
    });
    b.col(-2.4, 0, -7.6, 2.4, 1.18, -5.8, { tag: "desk" });
    b.box("metal", -1, 1.18, -7.1, 0.5, 0.4, 0.4, { tint: [0.35, 0.38, 0.35] });
    b.plate("lamp", -1, 1.4, -6.89, 0, 1, 0.36, 0.26, null, {
      tint: [0.1, 0.35, 0.12],
    });
    b.cyl("metal_dark", 4.2, 0.35, -11, 0.45, 0.45, 1.6, 10, {
      tint: [0.4, 0.42, 0.38],
    }); // toppled shell, lying on its side
    b.geo("metal_dark", K.sphereGeo(), {
      x: 5.2,
      y: 0.4,
      z: -11.2,
      s: 0.35,
      tint: [0.4, 0.42, 0.38],
    });
    b.col(3.4, 0, -11.5, 5.5, 0.8, -10.5, { tag: "debris" });
    // the Volty poster
    const volty = K.paint(
      "art",
      "ce_volty",
      256,
      360,
      function (x, X, Y, W, H) {
        x.fillStyle = "#f0e0b0";
        x.fillRect(X, Y, W, H);
        x.fillStyle = "#d83020";
        x.beginPath();
        x.moveTo(X + W * 0.55, Y + 40);
        x.lineTo(X + W * 0.3, Y + 170);
        x.lineTo(X + W * 0.5, Y + 170);
        x.lineTo(X + W * 0.4, Y + 280);
        x.lineTo(X + W * 0.72, Y + 130);
        x.lineTo(X + W * 0.52, Y + 130);
        x.closePath();
        x.fill();
        x.fillStyle = "#fff";
        x.beginPath();
        x.arc(X + W * 0.5, Y + 110, 12, 0, PI * 2);
        x.fill();
        x.fillStyle = "#1a1a1a";
        x.beginPath();
        x.arc(X + W * 0.52, Y + 112, 5, 0, PI * 2);
        x.fill();
        x.fillStyle = "#1e3a6e";
        x.font = "bold 30px Arial Black, sans-serif";
        x.textAlign = "center";
        x.fillText("VOLTY SAYS:", X + W / 2, Y + 310);
        x.font = "bold 18px Arial, sans-serif";
        x.fillText("DON'T WASTE A WATT!", X + W / 2, Y + 338);
        K.stains(x, X, Y, W, H, 10, 12, 0.5, [60, 40, 20]);
        K.streaks(x, X, Y, W, H, 14, 13, 0.4);
      },
    );
    b.plate("art", 9.78, 2.4, -5, -1, 0, 1.2, 1.7, volty, { off: 0.02 });
    // emergency lighting: red beacons over the doors, most ceiling fittings dead
    for (const [x, z] of [
      [0, -15.6],
      [-8, -0.4],
      [8, -0.4],
    ]) {
      b.box("metal", x, 5.4, z, 0.3, 0.2, 0.2, {});
      b.geo("lamp", K.sphereGeo(), {
        x,
        y: 5.35,
        z: z + (z > -1 ? -0.12 : 0.12),
        s: 0.09,
        tint: red,
      });
      b.light(x, 5.0, z + (z > -1 ? -1 : 1), red, 0.9, 7, { box: LB });
      b.glow(x, 5.35, z + (z > -1 ? -0.15 : 0.15), [1, 0.15, 0.1], 1.4);
    }
    for (const [x, z, dead] of [
      [-4, -4, true],
      [4, -4, true],
      [-4, -12, false],
      [4, -12, true],
    ])
      K.lamp(b, x, 6.2, z, "globe", amber, dead ? 0 : 0.8, 7, {
        ceil: 6.7,
        size: 0.22,
        dead,
        lightOpts: { box: LB },
      });
    K.skel(ctx, -3.5, 0, -2.6, 0.6, "lying");
    K.skel(ctx, 1.4, 0, -8.4, 2.2, "sitting");
    for (let k = 0; k < 6; k++)
      b.hplate(
        "decal",
        -8 + r() * 16,
        0.012 + k * 0.0004,
        -15 + r() * 14,
        1.6,
        1.6,
        r() * 6,
        K.decal(
          k % 3 === 0 ? "blood" : k % 3 === 1 ? "scorch" : "grime",
          60 + k,
        ),
      );
    K.litter(b, -9, -15, 9, -1, 0, 18, 6101);

    // ================================================================ SYSTEM CONTROL ROOM
    const SC = [-10.1, -0.3, -34.1, 10.1, 6.1, -15.9];
    K.room(b, ctx, {
      x0: -10,
      z0: -34,
      x1: 10,
      z1: -16,
      y: 0,
      h: 6,
      floor: "terrazzo",
      fc: [0.6, 0.6, 0.58],
      wall: "plaster_stained",
      wc: [0.62, 0.66, 0.62],
      wain: "paint_green",
      wainC: [0.28, 0.38, 0.32],
      wainH: 1.2,
      ceil: "metal_dark",
      cc: [0.3, 0.32, 0.3],
    });
    // THE MIMIC BOARD: Manhattan's grid in lit lines
    const mimic = K.paint(
      "neon",
      "ce_mimic",
      1024,
      256,
      function (x, X, Y, W, H) {
        x.fillStyle = "#000";
        x.fillRect(X, Y, W, H);
        const rr = K.rng("mimic");
        x.strokeStyle = "#1c6a30";
        x.lineWidth = 3;
        x.shadowColor = "#30ff60";
        x.shadowBlur = 6;
        // island outline
        x.beginPath();
        x.moveTo(X + 60, Y + 200);
        x.lineTo(X + 200, Y + 40);
        x.lineTo(X + 900, Y + 20);
        x.lineTo(X + 980, Y + 60);
        x.lineTo(X + 900, Y + 230);
        x.lineTo(X + 120, Y + 238);
        x.closePath();
        x.stroke();
        x.strokeStyle = "#30c050";
        x.lineWidth = 2;
        for (let i = 0; i < 14; i++) {
          const px = X + 120 + i * 60;
          x.beginPath();
          x.moveTo(px, Y + 40);
          x.lineTo(px - 20, Y + 230);
          x.stroke();
        }
        for (let j = 0; j < 5; j++) {
          const py = Y + 60 + j * 36;
          x.beginPath();
          x.moveTo(X + 110, py);
          x.lineTo(X + 950, py - 10);
          x.stroke();
        }
        x.shadowBlur = 10;
        for (let k = 0; k < 60; k++) {
          const on = rr() < 0.35;
          x.fillStyle = on ? "#40ff70" : "#ff3020";
          x.shadowColor = x.fillStyle;
          x.beginPath();
          x.arc(
            X + 120 + rr() * 820,
            Y + 45 + rr() * 185,
            on ? 4 : 5,
            0,
            PI * 2,
          );
          x.fill();
        }
        x.shadowBlur = 0;
        x.fillStyle = "#e0c040";
        x.font = "bold 22px Arial, sans-serif";
        x.textAlign = "left";
        x.fillText(
          "MANHATTAN NETWORK — LOAD: 0.3%   STATUS: AWAITING RESTORATION (8,036 DAYS)",
          X + 40,
          Y + 18,
        );
      },
    );
    b.boxMM("metal_dark", -9.8, 0.9, -33.9, 9.8, 5.3, -33.6, {
      tint: [0.18, 0.2, 0.19],
    });
    b.plate("neon", 0, 3.1, -33.58, 0, 1, 19, 4.2, mimic, { off: 0.02 });
    b.light(0, 3, -31.5, [0.35, 0.9, 0.45], 1.1, 12, { box: SC });
    b.glow(0, 3.1, -33.2, [0.2, 0.6, 0.3], 8);
    // operator consoles in three curved-ish rows
    for (let row = 0; row < 3; row++) {
      const z = -30 + row * 3.4;
      for (let k = 0; k < 4; k++) {
        const x = -6.6 + k * 4.4;
        b.boxMM("metal", x - 1.8, 0, z - 0.45, x + 1.8, 0.8, z + 0.45, {
          tint: [0.52, 0.56, 0.5],
        });
        b.quadN(
          "metal",
          [x - 1.8, 0.8, z + 0.45],
          [x + 1.8, 0.8, z + 0.45],
          [x + 1.8, 1.25, z - 0.35],
          [x - 1.8, 1.25, z - 0.35],
          [0, 0.8, 0.6],
          { tint: [0.5, 0.54, 0.48] },
        );
        b.boxMM("metal", x - 1.8, 1.25, z - 0.45, x + 1.8, 1.9, z - 0.3, {
          tint: [0.45, 0.5, 0.45],
        });
        for (let i = 0; i < 10; i++) {
          const lit = r() < 0.4;
          b.geo("lamp", K.sphereGeo(), {
            x: x - 1.6 + i * 0.36,
            y: 1.05,
            z: z + 0.08,
            s: 0.03,
            tint: lit
              ? r() < 0.5
                ? [0.2, 1, 0.3]
                : [1, 0.2, 0.1]
              : [0.2, 0.2, 0.2],
          });
        }
        b.plate("lamp", x, 1.6, z - 0.29, 0, 1, 0.9, 0.45, null, {
          tint: r() < 0.5 ? [0.1, 0.35, 0.14] : [0.05, 0.06, 0.05],
        });
        b.col(x - 1.8, 0, z - 0.45, x + 1.8, 1.9, z + 0.45, {
          tag: "console",
          surface: "metal",
        });
        K.chair(b, x + (r() - 0.5), 0, z + 1.0, PI + (r() - 0.5) * 0.8, {
          mat: "metal",
          seatMat: "leather",
        });
      }
      b.light(0, 1.6, z + 0.6, [0.3, 0.8, 0.4], 0.35, 9, { box: SC });
    }
    K.skel(ctx, -2.2, 0, -25.6, PI, "sitting");
    // supervisor's station (raised, south-east)
    b.boxMM("terrazzo", 5, 0, -19.8, 9.9, 0.6, -16.1, {
      tint: [0.55, 0.55, 0.52],
      faces: "nsewt",
    });
    b.col(5, 0, -19.8, 9.9, 0.6, -16.1, { tag: "platform" });
    K.stairs(b, 3.8, -18.8, 5, -17.2, 0, 0.6, "+x", {
      mat: "terrazzo",
      tint: [0.55, 0.55, 0.52],
    });
    K.railing(b, 5, -19.8, 9.9, -19.8, 0.6, {
      h: 0.95,
      mat: "steel",
      handMat: "steel",
    });
    K.loot(ctx, "desk", 7.5, 0.6, -17.5, PI, {
      items: [
        ["pv3_fiveboro_key", 1],
        ["scrip", 40],
      ],
      name: "Supervisor's Desk",
    });
    K.terminal(
      ctx,
      "pv3_term_ce_grid",
      8.6,
      0.6,
      -18.8,
      -HP,
      termGrid(),
      "own_desk",
    );
    K.note(ctx, "pv3_note_ce_shift", 6.6, 1.38, -17.4, {
      name: "Shift Log, March 1967",
      title: "System Operator shift log",
      learn: LK.grid.id,
      text: "OPERATORS' WORD THIS MONTH: LAMPLIGHTER (Grid Control console — do NOT tell the day shift, they write it on the board).\n\n06:00 — Load normal. Tower lit overnight per memorial schedule.\n09:12 — Civil defence drill? Sirens uptown. Supervisor says ignore.\n09:44 — Frequency collapse across all feeders. Every breaker on the board goes red at once.\n09:47 — (handwriting changes) The board is all red. The robots are still doing their rounds. They say \"grid secure.\"\n\nIf anybody ever reads this: the arc regulators for the tower lantern are in the transformer hall, rack B. Put one in and she'll light. The linemen deserve that much.",
    });
    for (const [x, z] of [
      [-5, -20],
      [5, -26],
      [-5, -29],
    ])
      K.lamp(b, x, 5.4, z, "tube", cold, x === 5 ? 0 : 0.8, 7, {
        ceil: 6,
        len: 1.6,
        dead: x === 5,
        lightOpts: { box: SC },
      });
    // cable trench along the floor
    b.boxMM("paint_black", -9.5, 0.005, -32.4, 9.5, 0.012, -31.9, {
      tint: [0.05, 0.05, 0.05],
    });
    for (let x = -9; x < 9.5; x += 0.8)
      b.box("steel", x, 0.012, -32.15, 0.7, 0.03, 0.5, {
        tint: [0.4, 0.4, 0.4],
      });

    // ================================================================ SERVICE STAIR → TRANSFORMER HALL
    const SS = [9.9, VY - 0.3, -42.1, 14.1, 6.1, -23.9];
    K.room(b, ctx, {
      x0: 10,
      z0: -42,
      x1: 14,
      z1: -24,
      y: VY,
      h: 6 - VY,
      floor: "concrete",
      wall: "concrete",
      wc: [0.55, 0.56, 0.52],
      ceil: "concrete",
      cc: [0.4, 0.4, 0.38],
      trim: false,
      casing: false,
    });
    b.boxMM("concrete", 10, VY, -27, 14, 0, -24, {
      tint: [0.58, 0.58, 0.55],
      faces: "nsewt",
    });
    b.col(10, VY, -27, 14, 0, -24, { tag: "landing" });
    K.stairs(b, 10.4, -34.5, 13.6, -27, VY, 0, "+z", {
      mat: "concrete",
      tint: [0.58, 0.58, 0.55],
      rail: "both",
      nosing: "paint_yellow",
      railMat: "paint_yellow",
      handMat: "paint_yellow",
    });
    b.plate(
      "art",
      13.88,
      2.2,
      -25.4,
      -1,
      0,
      1.3,
      0.8,
      K.signCell("ce_hallsign", "TRANSFORMER\nHALL ↓\n13,000 V", 200, 120, {
        bg: "#e0c030",
        fg: "#1a1a1a",
        font: "Arial Black, sans-serif",
      }),
    );
    for (const [y, z] of [
      [4.6, -25.5],
      [VY + 3.2, -38],
    ])
      K.lamp(b, 12, y, z, "cage", [1, 0.85, 0.5], 0.8, 8, {
        ceil: y + 0.6,
        lightOpts: { box: SS },
      });

    // ================================================================ TRANSFORMER HALL
    const TV = [-10.1, VY - 0.3, -50.1, 10.1, VY + 5.7, -29.9];
    K.room(b, ctx, {
      x0: -10,
      z0: -50,
      x1: 10,
      z1: -30,
      y: VY,
      h: 5.6,
      floor: "concrete",
      fc: [0.45, 0.45, 0.42],
      wall: "concrete",
      wc: [0.5, 0.52, 0.5],
      ceil: "concrete",
      cc: [0.32, 0.33, 0.32],
      trim: false,
    });
    const transformer = (x, z) => {
      b.boxMM("paint_green", x - 2.2, VY, z - 1.6, x + 2.2, VY + 3.2, z + 1.6, {
        tint: [0.28, 0.36, 0.3],
      });
      for (let k = 0; k < 12; k++) {
        const fx = x - 2.0 + k * 0.36;
        for (const s of [-1, 1])
          b.boxMM(
            "paint_green",
            fx - 0.04,
            VY + 0.3,
            z + s * 1.6,
            fx + 0.04,
            VY + 2.9,
            z + s * 2.1,
            { tint: [0.26, 0.34, 0.28] },
          );
      }
      for (let k = 0; k < 3; k++) {
        const bx = x - 1.2 + k * 1.2;
        for (let i = 0; i < 5; i++)
          b.cyl("ceramic", bx, VY + 3.2 + i * 0.16, z, 0.16, 0.16, 0.1, 8, {
            tint: [0.6, 0.45, 0.35],
          });
        b.pipe("copper", bx, VY + 4.0, z, bx, VY + 5.5, z - 0.6, 0.05, 6);
      }
      b.col(x - 2.2, VY, z - 2.1, x + 2.2, VY + 3.3, z + 2.1, {
        tag: "transformer",
        surface: "metal",
      });
      b.plate(
        "art",
        x,
        VY + 2.3,
        z + 2.12,
        0,
        1,
        1.4,
        0.6,
        K.signCell(
          "ce_tx_" + x,
          "XFMR " + (x < 0 ? "A" : "B") + " · 138 kV / 13 kV",
          320,
          96,
          { bg: "#e0d8c0", fg: "#1a1a1a", font: "Arial, sans-serif" },
        ),
      );
    };
    transformer(-5, -44);
    transformer(4, -44);
    // chain-link cages round both transformers (painted alpha mesh on posts), hazard striping, DANGER plates
    const chain = K.paint(
      "art",
      "ce_chainlink",
      128,
      128,
      function (c, X, Y, W, H) {
        c.clearRect(X, Y, W, H);
        c.strokeStyle = "#9a9c96";
        c.lineWidth = 2.2;
        for (let k = -H; k < W + H; k += 16) {
          c.beginPath();
          c.moveTo(X + k, Y);
          c.lineTo(X + k + H, Y + H);
          c.stroke();
          c.beginPath();
          c.moveTo(X + k + H, Y);
          c.lineTo(X + k, Y + H);
          c.stroke();
        }
        c.strokeStyle = "rgba(120,70,40,0.8)";
        c.lineWidth = 1;
        for (let k = 0; k < 6; k++) {
          c.beginPath();
          c.moveTo(X + k * 23, Y);
          c.lineTo(X + k * 23 + 7, Y + H);
          c.stroke();
        } // rust runs
      },
    );
    const hazard = K.paint(
      "art",
      "ce_hazard",
      256,
      32,
      function (c, X, Y, W, H) {
        c.fillStyle = "#d8b020";
        c.fillRect(X, Y, W, H);
        c.fillStyle = "#141414";
        for (let k = -2; k < 20; k++) {
          c.beginPath();
          c.moveTo(X + k * 16, Y + H);
          c.lineTo(X + k * 16 + 8, Y + H);
          c.lineTo(X + k * 16 + 8 + H, Y);
          c.lineTo(X + k * 16 + H, Y);
          c.fill();
        }
        K.stains(c, X, Y, W, H, 8, 71, 0.6, [40, 30, 20]);
      },
    );
    for (const [cx, cz] of [
      [-5, -44],
      [4, -44],
    ]) {
      const x0 = cx - 3.1,
        x1 = cx + 3.1,
        z0 = cz - 3,
        z1 = cz + 3;
      for (const [ax, az, bx, bz] of [
        [x0, z1, x1, z1],
        [x1, z1, x1, z0],
        [x1, z0, x0, z0],
        [x0, z0, x0, z1],
      ]) {
        const L = Math.hypot(bx - ax, bz - az),
          nx = (bz - az) / L,
          nz = -(bx - ax) / L;
        const mx = (ax + bx) / 2,
          mz = (az + bz) / 2;
        const gateSide = az === z1 && bz === z1; // the south side has a padlocked gate gap
        if (gateSide) {
          for (const [ga, gb] of [
            [ax, mx - 0.7],
            [mx + 0.7, bx],
          ])
            for (const sg of [1, -1]) {
              b.plate(
                "art",
                (ga + gb) / 2,
                VY + 1.3,
                mz,
                nx * sg,
                nz * sg,
                Math.abs(gb - ga),
                2.6,
                chain,
                { off: 0, tint: [0.8, 0.8, 0.78] },
              );
            }
          for (const [ga, gb] of [
            [ax, mx - 0.7],
            [mx + 0.7, bx],
          ])
            b.col(
              Math.min(ga, gb),
              VY,
              mz - 0.05,
              Math.max(ga, gb),
              VY + 2.6,
              mz + 0.05,
              { tag: "fence", walkable: false, surface: "metal" },
            );
          for (const sg of [1, -1])
            b.plate(
              "art",
              mx + 1.4,
              VY + 1.3,
              mz + 0.35,
              0,
              sg,
              1.4,
              2.6,
              chain,
              { off: 0, tint: [0.8, 0.8, 0.78] },
            ); // gate slid open
          b.plate(
            "art",
            mx - 1.2,
            VY + 1.5,
            mz + 0.02,
            0,
            1,
            0.9,
            0.6,
            K.signCell(
              "ce_danger_in",
              "DANGER\n13,000 VOLTS\nKEEP OUT",
              180,
              120,
              {
                bg: "#e8e0d0",
                fg: "#b01810",
                font: "Arial Black, sans-serif",
                border: "#b01810",
              },
            ),
          );
        } else {
          b.plate("art", mx, VY + 1.3, mz, nx, nz, L, 2.6, chain, {
            off: 0,
            tint: [0.8, 0.8, 0.78],
          });
          b.plate("art", mx, VY + 1.3, mz, -nx, -nz, L, 2.6, chain, {
            off: 0,
            tint: [0.8, 0.8, 0.78],
          });
          b.col(
            Math.min(ax, bx) - 0.05,
            VY,
            Math.min(az, bz) - 0.05,
            Math.max(ax, bx) + 0.05,
            VY + 2.6,
            Math.max(az, bz) + 0.05,
            { tag: "fence", walkable: false, surface: "metal" },
          );
        }
        for (const t of [0, 0.5, 1])
          b.cyl(
            "steel",
            ax + (bx - ax) * t,
            VY,
            az + (bz - az) * t,
            0.05,
            0.05,
            2.7,
            6,
            { tint: [0.5, 0.5, 0.48] },
          );
        b.pipe("steel", ax, VY + 2.6, az, bx, VY + 2.6, bz, 0.03, 4, {
          tint: [0.5, 0.5, 0.48],
        });
        b.hplate(
          "art",
          mx - nx * 0.45,
          VY + 0.011,
          mz - nz * 0.45,
          L,
          0.4,
          Math.abs(bz - az) > 0.1 ? HP : 0,
          hazard,
        );
      }
    }
    // transformer B is still energised: its bushings glow blue and it hums (the arc regulator backfeed)
    for (let k = 0; k < 3; k++) {
      const bx = 4 - 1.2 + k * 1.2;
      b.geo("lamp", K.sphereGeo(), {
        x: bx,
        y: VY + 4.0,
        z: -44,
        s: 0.07,
        tint: [0.45, 0.75, 1],
      });
      b.glow(bx, VY + 4.0, -44, [0.35, 0.6, 1], 1.1);
    }
    b.light(4, VY + 4.2, -42.5, [0.4, 0.65, 1], 0.9, 6, { box: TV });
    b.plate("lamp", 4, VY + 2.9, -41.88, 0, 1, 0.5, 0.18, null, {
      tint: [0.2, 1, 0.35],
    });
    // busbars overhead + cable trays
    for (const x of [-6.2, -5, -3.8, 2.8, 4, 5.2])
      b.beam("copper", x, VY + 5.3, -49.5, x, VY + 5.3, -30.5, 0.1, 0.06, {
        tint: [0.6, 0.4, 0.25],
      });
    for (const x of [-9.3, 9.3]) {
      b.boxMM("steel", x - 0.4, VY + 4.4, -49.5, x + 0.4, VY + 4.5, -30.5, {
        tint: [0.4, 0.4, 0.38],
      });
      for (let k = 0; k < 5; k++)
        b.pipe(
          "rubber",
          x - 0.3 + k * 0.15,
          VY + 4.56,
          -49.5,
          x - 0.3 + k * 0.15,
          VY + 4.56,
          -30.5,
          0.04,
          4,
        );
    }
    // rack B with the ARC REGULATORS (one still whole)
    b.boxMM("steel", -9.7, VY, -36.4, -8.6, VY + 2.2, -33.2, {
      tint: [0.45, 0.46, 0.45],
    });
    for (let k = 0; k < 4; k++) {
      b.boxMM(
        "steel",
        -9.7,
        VY + 0.3 + k * 0.5,
        -36.3,
        -8.6,
        VY + 0.33 + k * 0.5,
        -33.3,
        { tint: [0.5, 0.5, 0.48] },
      );
      if (k !== 2)
        b.box(
          "rust",
          -9.1,
          VY + 0.33 + k * 0.5,
          -35 + (k % 2) * 0.8,
          0.5,
          0.3,
          0.6,
          { tint: [0.5, 0.35, 0.25] },
        );
    }
    b.plate(
      "art",
      -8.58,
      VY + 2.4,
      -34.8,
      1,
      0,
      1.2,
      0.35,
      K.signCell("ce_rackb", "RACK B · ARC REGULATORS", 320, 64, {
        bg: "#e0c030",
        fg: "#1a1a1a",
        font: "Arial, sans-serif",
      }),
    );
    b.col(-9.7, VY, -36.4, -8.6, VY + 2.2, -33.2, { tag: "rack" });
    const regB = K.builder({
      name: "ce_regulator",
      off: O,
      lit: true,
      amb: [0.3, 0.3, 0.3],
      grime: 0.2,
    });
    regB.cyl("copper", -9.1, VY + 1.35, -34.6, 0.22, 0.22, 0.34, 12, {
      tint: [0.8, 0.55, 0.3],
    });
    regB.geo("lamp", K.sphereGeo(), {
      x: -9.1,
      y: VY + 1.78,
      z: -34.6,
      s: 0.1,
      tint: [0.3, 0.8, 1],
    });
    regB.glow(-9.1, VY + 1.78, -34.6, [0.3, 0.7, 1], 1.2);
    ctx.regulatorGroup = regB.finish(null);
    ctx.regulatorPos = K.world(ctx, -9.1, VY + 1.4, -34.6);
    // arcing busbar (fx in update) + scorch
    ctx.arcPos = K.world(ctx, -3.8, VY + 5.2, -38);
    b.burn(-3.8, VY + 5.2, -38, 2.2, 0.8);
    b.hplate("decal", -3.8, VY + 0.012, -38, 2.2, 2.2, 0, K.decal("scorch", 9));
    b.hplate("decal", 2, VY + 0.013, -34, 3.0, 2.2, 0.4, K.decal("puddle", 13));
    for (const [x, z] of [
      [-6, -34],
      [6, -34],
      [0, -40],
      [-6, -48],
      [6, -48],
    ])
      K.lamp(
        b,
        x,
        VY + 4.9,
        z,
        "cage",
        (x + z) % 3 ? cold : amber,
        x === 0 ? 0 : 0.8,
        8,
        { ceil: VY + 5.6, dead: x === 0, lightOpts: { box: TV } },
      );
    b.light(-3.8, VY + 4.5, -38, [0.4, 0.7, 1], 0.9, 7, { box: TV });
    K.loot(ctx, "toolbox", 8.8, VY, -31.2, PI, {
      loot: "toolbox",
      name: "Lineman's Toolbox",
    });
    K.loot(ctx, "locker", 9.6, VY, -47, -HP, {
      items: [
        ["dry_cell", 2],
        ["conductor", 3],
        ["scrap_electronics", 2],
      ],
      name: "Spares Locker",
    }); // the padlock rusted through years ago
    K.loot(ctx, "ammo_box", -9, VY, -48.8, 0, { loot: "ammo_box" });
    K.skel(ctx, 1.5, VY, -47.5, 1.1, "lying");
    K.note(ctx, "pv3_reel_ce_lineman", 1.8, VY + 0.03, -47.1, {
      type: "tape",
      name: 'Tape Reel: "Last Splice"',
      title: "Lineman's recorder, March 1967",
      text: "[Hum of transformers. Heavy breathing.]\n\nLINEMAN: Board says every feeder's dead but B's still humming. I'm gonna try to backfeed the tower. Just the lantern. Just so people can see something up there tonight.\n\n[Metal clank.] Security bot says I'm not authorised. I told it I've been authorised since 1941, pal.\n\n[Pause.] It says \"grid secure.\" I think it means me. I think it's gonna keep me secure right here.\n\nWhoever finds this — rack B. Regulator. Put her in the lantern. Tell 'em the lights stay on.",
    });

    // ---- transformer hall dressing (round 2): switchgear line-up, feeder mimic, cable trench, spools — the room was a bare slab
    // switchgear along the east wall (clear of the stair gap at z −38.8..−37.2 and the spares locker)
    const swg = K.paint(
      "art",
      "ce_switchgear",
      128,
      256,
      function (c, X, Y, W, H) {
        c.fillStyle = "#6c716a";
        c.fillRect(X, Y, W, H);
        c.strokeStyle = "#3a3e3a";
        c.lineWidth = 3;
        c.strokeRect(X + 6, Y + 6, W - 12, H - 12);
        c.strokeRect(X + 6, Y + H * 0.52, W - 12, H * 0.44);
        for (let k = 0; k < 2; k++) {
          const cx = X + W * (0.3 + k * 0.4),
            cy = Y + H * 0.16;
          c.fillStyle = "#e8e4d4";
          c.beginPath();
          c.arc(cx, cy, 17, 0, Math.PI * 2);
          c.fill();
          c.strokeStyle = "#1a1a1a";
          c.lineWidth = 2;
          c.stroke();
          c.beginPath();
          c.moveTo(cx, cy);
          c.lineTo(
            cx + 12 * Math.cos(-2.2 + k * 1.3),
            cy + 12 * Math.sin(-2.2 + k * 1.3),
          );
          c.stroke();
        }
        c.fillStyle = "#1a1a1a";
        c.font = "bold 13px Arial";
        c.textAlign = "center";
        c.fillText("FEEDER", X + W / 2, Y + H * 0.3);
        c.fillText("7-" + (Y % 9), X + W / 2, Y + H * 0.36);
        c.fillStyle = "#2a2a2a";
        c.fillRect(X + W * 0.42, Y + H * 0.58, W * 0.16, H * 0.2); // handle well
        K.stains(c, X, Y, W, H, 14, 31, 0.5, [40, 34, 26]);
        K.streaks(c, X, Y, W, H, 10, 7, 0.35);
      },
    );
    for (let i = 0; i < 7; i++) {
      const z0 = -45.8 + i * 0.8,
        z1 = z0 + 0.78;
      b.boxMM("steel", 9.15, VY, z0, 10, VY + 2.3, z1, {
        tint: [0.46, 0.49, 0.46],
      });
      b.plate("art", 9.14, VY + 1.2, (z0 + z1) / 2, -1, 0, 0.74, 2.1, swg, {
        off: 0.004,
      });
      b.boxMM(
        "black_iron",
        9.0,
        VY + 0.95,
        (z0 + z1) / 2 - 0.03,
        9.14,
        VY + 1.35,
        (z0 + z1) / 2 + 0.03,
        {},
      ); // operating handle
      const on = i === 2 || i === 5;
      // dead indicators are plain coloured glass (every 'lamp' cluster in an interior gets an atmosphere glow sprite)
      b.geo(on ? "lamp" : "glass", K.sphereGeo(), {
        x: 9.12,
        y: VY + 1.95,
        z: z0 + 0.2,
        s: 0.035,
        tint: on ? [1, 0.2, 0.12] : [0.35, 0.1, 0.08],
      });
      b.geo(on ? "lamp" : "glass", K.sphereGeo(), {
        x: 9.12,
        y: VY + 1.95,
        z: z1 - 0.2,
        s: 0.035,
        tint: on ? [0.25, 1, 0.35] : [0.08, 0.25, 0.1],
      });
      if (on) b.glow(9.0, VY + 1.95, z1 - 0.2, [0.3, 1, 0.4], 0.35);
    }
    b.col(9.15, VY, -45.8, 10, VY + 2.3, -40.2, {
      tag: "switchgear",
      surface: "metal",
    });
    b.plate(
      "art",
      9.13,
      VY + 2.6,
      -43,
      -1,
      0,
      3.2,
      0.36,
      K.signCell("ce_swg", "MAIN SWITCHGEAR · 13 kV · FEEDERS 1–7", 512, 56, {
        bg: "#e0c030",
        fg: "#1a1a1a",
        font: "Arial, sans-serif",
      }),
    );
    // feeder mimic on the north wall: seven feeders, only 7 (the Village) still drawn in live green
    b.plate(
      "neon",
      0,
      VY + 3.3,
      -49.88,
      0,
      1,
      6.4,
      1.6,
      K.paint("neon", "ce_hall_mimic", 512, 128, function (c, X, Y, W, H) {
        c.fillStyle = "#0c120e";
        c.fillRect(X, Y, W, H);
        c.strokeStyle = "#a8a890";
        c.lineWidth = 3;
        c.strokeRect(X + 3, Y + 3, W - 6, H - 6);
        c.strokeStyle = "#c8c0a0";
        c.lineWidth = 4;
        c.beginPath();
        c.moveTo(X + 30, Y + 40);
        c.lineTo(X + W - 30, Y + 40);
        c.stroke();
        for (let k = 0; k < 7; k++) {
          const x = X + 50 + k * 66;
          c.strokeStyle = k === 6 ? "#60ff80" : "#6a6a5c";
          c.lineWidth = k === 6 ? 5 : 3;
          c.beginPath();
          c.moveTo(x, Y + 40);
          c.lineTo(x, Y + 96);
          c.stroke();
          c.fillStyle = k === 6 ? "#60ff80" : "#8a3020";
          c.fillRect(x - 7, Y + 60, 14, 14);
          c.fillStyle = "#d8d0b0";
          c.font = "bold 12px Arial";
          c.textAlign = "center";
          c.fillText(k === 6 ? "7 VILLAGE" : String(k + 1), x, Y + 114);
        }
        c.fillStyle = "#d8d0b0";
        c.font = "bold 15px Arial";
        c.textAlign = "left";
        c.fillText("XFMR A ✕      XFMR B ●", X + 30, Y + 28);
      }),
      { off: 0.01 },
    );
    b.glow(2.375, VY + 3.2, -49.6, [0.3, 1, 0.4], 0.5);
    // floor cable trench down the middle with chequer-plate covers (one lifted, cables spilling out)
    for (let k = 0; k < 9; k++) {
      const z = -31.2 - k * 1.05;
      if (k === 4) {
        b.boxMM(
          "metal_dark",
          -0.55,
          VY - 0.4,
          z - 0.5,
          0.55,
          VY - 0.38,
          z + 0.5,
          { tint: [0.15, 0.15, 0.14] },
        );
        for (let j = 0; j < 4; j++)
          b.pipe(
            "rubber",
            -0.35 + j * 0.22,
            VY - 0.3,
            z - 0.5,
            -0.4 + j * 0.25,
            VY + 0.08,
            z + 0.3,
            0.05,
            5,
            { tint: [0.1, 0.1, 0.1] },
          );
        b.box("steel", 1.1, VY + 0.02, z, 1.1, 0.03, 1.0, {
          yaw: 0.35,
          tint: [0.4, 0.42, 0.4],
        });
        continue;
      }
      b.boxMM("steel", -0.55, VY, z - 0.51, 0.55, VY + 0.02, z + 0.51, {
        tint: [0.4, 0.42, 0.4],
      });
    }
    for (const x of [-0.6, 0.6])
      b.boxMM(
        "paint_yellow",
        x - 0.05,
        VY,
        -40.6,
        x + 0.05,
        VY + 0.025,
        -30.6,
        {},
      );
    // cable drums, an oil drum and a hand truck by the entrance end
    for (const [x, z, r0] of [
      [-6.8, -32.2, 0.9],
      [-4.6, -31.4, 0.7],
    ]) {
      for (const fx of [x, x + 0.9])
        b.geo("wood", new THREE.CylinderGeometry(r0, r0, 0.12, 16), {
          x: fx,
          y: VY + r0,
          z,
          rz: HP,
          tint: [0.5, 0.38, 0.26],
        });
      b.geo(
        "rubber",
        new THREE.CylinderGeometry(r0 * 0.72, r0 * 0.72, 0.8, 14),
        { x: x + 0.45, y: VY + r0, z, rz: HP, tint: [0.12, 0.12, 0.11] },
      );
      b.col(x - 0.1, VY, z - r0, x + 1.0, VY + r0 * 2, z + r0, {
        tag: "spool",
      });
    }
    b.cyl("rust", 7.6, VY, -32.6, 0.3, 0.3, 0.9, 10, {
      tint: [0.45, 0.32, 0.2],
    });
    b.col(7.3, VY, -32.9, 7.9, VY + 0.9, -32.3, { tag: "barrel" });
    b.plate(
      "art",
      7.6,
      VY + 0.5,
      -32.29,
      0,
      1,
      0.4,
      0.3,
      K.signCell("ce_oil", "TRANSFORMER\nOIL · PCB", 96, 72, {
        bg: "#c8b890",
        fg: "#2a1a10",
        font: "Arial, sans-serif",
      }),
      { off: 0.005 },
    );
    // work light on the trench end, so the entrance half of the hall is not a black slab
    K.lamp(b, 0, VY + 4.9, -32.5, "cage", amber, 1.0, 8, {
      ceil: VY + 5.6,
      lightOpts: { box: TV },
    });
    for (const [x, z, c] of [
      [-8, -40.5, cold],
      [8, -38.5, amber],
    ])
      K.lamp(b, x, VY + 4.9, z, "cage", c, 0.85, 8, {
        ceil: VY + 5.6,
        lightOpts: { box: TV },
      });
    b.light(0, VY + 3.3, -48, [0.35, 0.9, 0.45], 0.5, 5, { box: TV }); // spill from the mimic board
    // ================================================================ CLOCK ROOM (executive elevator)
    const CRB = [
      CR.x - 6.1,
      CR.y - 0.3,
      CR.z - 6.1,
      CR.x + 6.1,
      CR.y + 7.1,
      CR.z + 6.1,
    ];
    K.room(b, ctx, {
      x0: CR.x - 6,
      z0: CR.z - 6,
      x1: CR.x + 6,
      z1: CR.z + 6,
      y: CR.y,
      h: 7,
      floor: "concrete",
      fc: [0.5, 0.5, 0.48],
      wall: "limestone",
      wc: [0.62, 0.6, 0.55],
      ceil: "concrete",
      cc: [0.4, 0.4, 0.38],
      trim: false,
      surface: "concrete",
    });
    for (const [nx, nz] of [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ]) {
      const cx = CR.x + nx * 5.88,
        cz = CR.z + nz * 5.88,
        y = CR.y + 3.6;
      b.geo("lamp", new THREE.CircleGeometry(2.7, 32), {
        x: cx,
        y,
        z: cz,
        ry: Math.atan2(-nx, -nz),
        tint: [0.78, 0.76, 0.68],
      });
      b.geo("black_iron", new THREE.TorusGeometry(2.72, 0.09, 5, 32), {
        x: cx - nx * 0.02,
        y,
        z: cz - nz * 0.02,
        ry: Math.atan2(-nx, -nz),
      });
      for (let k = 0; k < 12; k++) {
        const a = (k / 12) * PI * 2,
          rx = nz,
          rz = -nx;
        b.beam(
          "black_iron",
          cx - nx * 0.03,
          y,
          cz - nz * 0.03,
          cx - nx * 0.03 + rx * Math.cos(a) * 2.7,
          y + Math.sin(a) * 2.7,
          cz - nz * 0.03 + rz * Math.cos(a) * 2.7,
          0.03,
          0.03,
        );
      }
      const rx = -nz,
        rz = nx,
        ha = -((9 + 47 / 60) / 12) * PI * 2 + HP,
        ma = -(47 / 60) * PI * 2 + HP;
      b.beam(
        "paint_black",
        cx - nx * 0.06,
        y,
        cz - nz * 0.06,
        cx - nx * 0.06 - rx * Math.cos(ha) * 1.4,
        y + Math.sin(ha) * 1.4,
        cz - nz * 0.06 - rz * Math.cos(ha) * 1.4,
        0.14,
        0.04,
      );
      b.beam(
        "paint_black",
        cx - nx * 0.06,
        y,
        cz - nz * 0.06,
        cx - nx * 0.06 - rx * Math.cos(ma) * 2.1,
        y + Math.sin(ma) * 2.1,
        cz - nz * 0.06 - rz * Math.cos(ma) * 2.1,
        0.09,
        0.04,
      );
      b.light(cx - nx * 2, y, cz - nz * 2, [0.85, 0.82, 0.7], 0.9, 8, {
        box: CRB,
      });
      b.glow(cx - nx * 0.3, y, cz - nz * 0.3, [0.6, 0.58, 0.5], 6);
      b.pipe(
        "steel",
        CR.x,
        y,
        CR.z,
        cx - nx * 0.15,
        y,
        cz - nz * 0.15,
        0.04,
        6,
      );
    }
    // synchronous clock drive in the middle
    b.boxMM(
      "paint_green",
      CR.x - 0.9,
      CR.y,
      CR.z - 0.9,
      CR.x + 0.9,
      CR.y + 1.2,
      CR.z + 0.9,
      { tint: [0.28, 0.36, 0.3] },
    );
    b.cyl("paint_green", CR.x, CR.y + 1.2, CR.z, 0.6, 0.6, 1.2, 12, {
      tint: [0.3, 0.38, 0.32],
    });
    b.cyl("steel", CR.x, CR.y + 2.4, CR.z, 0.12, 0.12, 1.3, 8);
    b.boxMM(
      "steel",
      CR.x - 0.4,
      CR.y + 3.4,
      CR.z - 0.4,
      CR.x + 0.4,
      CR.y + 3.8,
      CR.z + 0.4,
      { tint: [0.5, 0.5, 0.48] },
    );
    b.col(CR.x - 0.9, CR.y, CR.z - 0.9, CR.x + 0.9, CR.y + 2.4, CR.z + 0.9, {
      tag: "machine",
      surface: "metal",
    });
    b.plate(
      "art",
      CR.x,
      CR.y + 0.7,
      CR.z + 0.92,
      0,
      1,
      1.2,
      0.35,
      K.signCell("ce_drive", "WARREN TELECHRON · 60 Hz", 256, 64, {
        bg: "#1e2a1e",
        fg: "#d8c070",
        font: "Arial, sans-serif",
      }),
    );
    // cover crates (the boss fight needs cover)
    for (const [x, z] of [
      [CR.x - 3.5, CR.z - 2.5],
      [CR.x + 3.2, CR.z + 2.8],
      [CR.x + 1.1, CR.z - 4.5],
    ]) {
      b.box("wood", x, CR.y, z, 1.2, 1.1, 1.2, {
        yaw: r(),
        tint: [0.5, 0.4, 0.3],
      });
      b.col(x - 0.6, CR.y, z - 0.6, x + 0.6, CR.y + 1.1, z + 0.6, {
        tag: "crate",
      });
    }
    b.boxMM(
      "bronze",
      CR.x - 1.0,
      CR.y,
      CR.z + 5.9,
      CR.x + 1.0,
      CR.y + 2.6,
      CR.z + 5.95,
      { tint: [0.46, 0.37, 0.22] },
    ); // elevator doors
    b.beam(
      "paint_black",
      CR.x,
      CR.y,
      CR.z + 5.88,
      CR.x,
      CR.y + 2.6,
      CR.z + 5.88,
      0.03,
      0.02,
    );
    for (const s of [-0.22, 0.22])
      b.beam(
        "rust",
        CR.x + 5.3 + s,
        CR.y,
        CR.z - 5.2,
        CR.x + 5.3 + s,
        CR.y + 7,
        CR.z - 5.2,
        0.05,
        0.05,
      );
    for (let y = CR.y + 0.3; y < CR.y + 7; y += 0.3)
      b.beam(
        "rust",
        CR.x + 5.08,
        y,
        CR.z - 5.2,
        CR.x + 5.52,
        y,
        CR.z - 5.2,
        0.03,
        0.03,
      );
    for (const [x, z] of [
      [CR.x - 3, CR.z],
      [CR.x + 3, CR.z],
    ])
      K.lamp(b, x, CR.y + 6.2, z, "cage", red, 0.6, 7, {
        ceil: CR.y + 7,
        lightOpts: { box: CRB },
      });
    K.loot(ctx, "safe", CR.x - 5.6, CR.y, CR.z - 4.5, HP, {
      loot: "safe",
      lock: LK.safe,
      name: "Tower Maintenance Safe",
    });

    // ================================================================ LANTERN ROOM
    const LR = [
      CR.x - 4.1,
      LY - 0.3,
      CR.z - 4.1,
      CR.x + 4.1,
      LY + 5.1,
      CR.z + 4.1,
    ];
    K.room(b, ctx, {
      x0: CR.x - 4,
      z0: CR.z - 4,
      x1: CR.x + 4,
      z1: CR.z + 4,
      y: LY,
      h: 5,
      floor: "metal_dark",
      fc: [0.4, 0.42, 0.4],
      wall: "bronze",
      wc: [0.3, 0.38, 0.32],
      ceil: "bronze",
      cc: [0.25, 0.32, 0.27],
      trim: false,
      surface: "metal",
    });
    // tall windows all round: a painted panorama of the ruined skyline behind dark glass (additive neon over a
    // black backing, so the silhouettes stay black and the green night sky glows), iron glazing bars in front
    const views = { n: "uptown", s: "harbor", e: "river", w: "hudson" };
    const skyline = (key, seed) =>
      K.paint("neon", "ce_view_" + key, 480, 360, function (x, X, Y, W, H) {
        const rr = K.rng("view" + seed);
        const g = x.createLinearGradient(0, Y, 0, Y + H);
        g.addColorStop(0, "#0a1410");
        g.addColorStop(0.45, "#26402c");
        g.addColorStop(0.72, "#6a8250");
        g.addColorStop(0.8, "#8a9258");
        g.addColorStop(1, "#2a2e1e");
        x.fillStyle = g;
        x.fillRect(X, Y, W, H);
        for (let k = 0; k < 60; k++) {
          x.fillStyle = "rgba(220,230,210," + (0.2 + rr() * 0.5) + ")";
          x.fillRect(X + rr() * W, Y + rr() * H * 0.45, 1.5, 1.5);
        }
        // three depth layers of towers, the nearest darkest; a few are snapped off
        [
          [0.66, "#1e2a1c", 26, 0.3],
          [0.74, "#0a100a", 18, 0.45],
          [0.84, "#000000", 12, 0.6],
        ].forEach(([base, col, n, hmax]) => {
          x.fillStyle = col;
          let px = X - 10;
          for (let i = 0; i < n && px < X + W; i++) {
            const w = 14 + rr() * 40,
              h = H * (0.08 + rr() * hmax);
            const top = Y + H * base - h;
            x.fillRect(px, top, w, Y + H - top);
            if (rr() < 0.3) {
              x.beginPath();
              x.moveTo(px, top);
              x.lineTo(px + w * 0.5, top - 20 - rr() * 30);
              x.lineTo(px + w, top);
              x.fill();
            } // spire / broken jag
            if (col === "#000000" && rr() < 0.4)
              for (let k = 0; k < 3; k++) {
                x.fillStyle = "rgba(255,190,90,0.7)";
                x.fillRect(px + rr() * w, top + 10 + rr() * h * 0.6, 2, 2);
                x.fillStyle = col;
              } // settlement fires
            px += w + rr() * 6;
          }
        });
        if (key === "uptown") {
          // the Empire State, still standing, far off
          x.fillStyle = "#020403";
          const cx = X + W * 0.62,
            b0 = Y + H * 0.7;
          x.fillRect(cx - 22, b0 - 150, 44, 150);
          x.fillRect(cx - 14, b0 - 190, 28, 40);
          x.fillRect(cx - 6, b0 - 222, 12, 32);
          x.fillRect(cx - 1.5, b0 - 262, 3, 40);
        }
        x.fillStyle = "rgba(0,0,0,0.35)";
        for (let k = 0; k < 14; k++)
          x.fillRect(X + rr() * W, Y + rr() * H, 20 + rr() * 60, 2); // grime streaks on the glass
      });
    for (const [nx, nz, dir] of [
      [0, 1, "s"],
      [0, -1, "n"],
      [1, 0, "e"],
      [-1, 0, "w"],
    ]) {
      const cell = skyline(views[dir], dir);
      const rx = nz,
        rz = -nx;
      [-1.9, 0, 1.9].forEach((s, i) => {
        const px = CR.x + nx * 3.9 + rx * s,
          pz = CR.z + nz * 3.9 + rz * s;
        // pane i shows the matching third of the panorama; the pane's right edge is at +r̂ of -n facing … keep the order consistent
        const u0 = cell[0] + (cell[2] - cell[0]) * (i / 3),
          u1 = cell[0] + (cell[2] - cell[0]) * ((i + 1) / 3);
        const sub = [u0, cell[1], u1, cell[3]];
        sub.atlas = cell.atlas;
        b.plate("paint_black", px, LY + 2.5, pz, -nx, -nz, 1.5, 3.5, null, {
          off: 0.0,
          tint: [0.01, 0.01, 0.012],
        });
        b.plate("neon", px, LY + 2.5, pz, -nx, -nz, 1.5, 3.5, sub, {
          off: 0.01,
        });
        b.plate("glass_clear", px, LY + 2.5, pz, -nx, -nz, 1.5, 3.5, null, {
          off: 0.03,
          tint: [0.35, 0.4, 0.38],
        });
        // iron glazing bars
        for (const v of [0.9, 2.1, 3.3])
          b.beam(
            "black_iron",
            px - nx * 0.05 - rx * 0.75,
            LY + v + 0.2,
            pz - nz * 0.05 - rz * 0.75,
            px - nx * 0.05 + rx * 0.75,
            LY + v + 0.2,
            pz - nz * 0.05 + rz * 0.75,
            0.05,
            0.05,
          );
        b.beam(
          "black_iron",
          px - nx * 0.05,
          LY + 0.75,
          pz - nz * 0.05,
          px - nx * 0.05,
          LY + 4.25,
          pz - nz * 0.05,
          0.05,
          0.05,
        );
      });
      // bronze mullion posts between panes and the sill
      for (const s of [-2.85, -0.95, 0.95, 2.85])
        b.box(
          "bronze",
          CR.x + nx * 3.85 + rx * s,
          LY,
          CR.z + nz * 3.85 + rz * s,
          0.22,
          5,
          0.22,
          { tint: [0.3, 0.4, 0.33] },
        );
      b.beam(
        "bronze",
        CR.x + nx * 3.8 - rx * 3.9,
        LY + 0.72,
        CR.z + nz * 3.8 - rz * 3.9,
        CR.x + nx * 3.8 + rx * 3.9,
        LY + 0.72,
        CR.z + nz * 3.8 + rz * 3.9,
        0.3,
        0.1,
        { tint: [0.34, 0.44, 0.36] },
      );
    }
    // grated catwalk floor round the lens pedestal, cable runs to the regulator socket
    for (let k = -3; k <= 3; k++)
      b.beam(
        "steel",
        CR.x - 3.9,
        LY + 0.02,
        CR.z + k * 1.1,
        CR.x + 3.9,
        LY + 0.02,
        CR.z + k * 1.1,
        0.06,
        0.03,
        { tint: [0.3, 0.3, 0.3] },
      );
    for (let k = 0; k < 3; k++)
      b.pipe(
        "rubber",
        CR.x + 1.2 + k * 0.12,
        LY + 0.05,
        CR.z - 0.2,
        CR.x + 2.6 + k * 0.12,
        LY + 0.05,
        CR.z - 2.2,
        0.04,
        4,
      );
    // THE BEACON: a Fresnel "beehive" lens — prism rings above and below a central refracting belt — on a
    // clockwork rotation pedestal; the carbon-arc lamp inside has been dark since 1967
    b.cyl("bronze", CR.x, LY, CR.z, 1.25, 1.45, 0.9, 16, {
      tint: [0.3, 0.38, 0.32],
    });
    b.cyl("cast_iron", CR.x, LY + 0.9, CR.z, 1.05, 1.05, 0.25, 16, {
      tint: [0.25, 0.26, 0.24],
    });
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * PI * 2;
      b.geo("brass", new THREE.CylinderGeometry(0.06, 0.06, 0.05, 6), {
        x: CR.x + Math.cos(a) * 1.2,
        y: LY + 0.6,
        z: CR.z + Math.sin(a) * 1.2,
        rz: HP,
        ry: -a,
      });
    } // bolts
    b.cyl("glass", CR.x, LY + 1.15, CR.z, 1.0, 1.0, 2.4, 20, {
      tint: [0.5, 0.58, 0.56],
      top: false,
    });
    for (let k = 0; k < 11; k++) {
      const y = LY + 1.25 + k * 0.22,
        belt = k >= 4 && k <= 6;
      const rr = belt ? 1.12 : 1.02 + Math.sin((k / 10) * PI) * 0.1;
      b.geo("glass", new THREE.TorusGeometry(rr, belt ? 0.08 : 0.05, 4, 24), {
        x: CR.x,
        y,
        z: CR.z,
        rx: HP,
        tint: belt ? [0.7, 0.78, 0.74] : [0.55, 0.64, 0.6],
      });
    }
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * PI * 2;
      b.beam(
        "brass",
        CR.x + Math.cos(a) * 1.1,
        LY + 1.15,
        CR.z + Math.sin(a) * 1.1,
        CR.x + Math.cos(a) * 1.1,
        LY + 3.55,
        CR.z + Math.sin(a) * 1.1,
        0.05,
        0.05,
        { tint: [0.6, 0.48, 0.26] },
      );
    }
    b.cyl("brass", CR.x, LY + 3.55, CR.z, 1.12, 0.6, 0.5, 16, {
      tint: [0.55, 0.44, 0.24],
    });
    b.cyl("brass", CR.x, LY + 4.05, CR.z, 0.2, 0.2, 0.95, 8, {
      tint: [0.55, 0.44, 0.24],
    }); // vent stack
    b.cyl("cast_iron", CR.x, LY + 1.2, CR.z, 0.22, 0.22, 1.0, 8, {
      tint: [0.2, 0.2, 0.2],
    }); // arc-lamp column
    b.geo("glass", K.sphereGeo(), {
      x: CR.x,
      y: LY + 2.4,
      z: CR.z,
      s: 0.3,
      tint: [0.4, 0.4, 0.38],
    });
    b.col(CR.x - 1.3, LY, CR.z - 1.3, CR.x + 1.3, LY + 4.5, CR.z + 1.3, {
      tag: "lens",
      surface: "metal",
    });
    // regulator socket (open panel on the pedestal: empty until the quest fills it)
    b.boxMM(
      "steel",
      CR.x + 1.0,
      LY + 0.2,
      CR.z - 0.9,
      CR.x + 1.5,
      LY + 0.8,
      CR.z - 0.3,
      { tint: [0.45, 0.46, 0.45] },
    );
    b.plate(
      "art",
      CR.x + 1.51,
      LY + 0.5,
      CR.z - 0.6,
      1,
      0,
      0.45,
      0.3,
      K.signCell("ce_socket", "ARC REG.\nSOCKET", 96, 64, {
        bg: "#e0c030",
        fg: "#1a1a1a",
        font: "Arial, sans-serif",
      }),
    );
    lens.geo("lamp", K.sphereGeo(), {
      x: CR.x,
      y: LY + 2.4,
      z: CR.z,
      s: 0.55,
      tint: [1, 0.95, 0.8],
    });
    lens.geo("lamp", new THREE.CylinderGeometry(1.03, 1.03, 2.3, 20, 1, true), {
      x: CR.x,
      y: LY + 2.35,
      z: CR.z,
      tint: [0.9, 0.82, 0.62],
    });
    lens.glow(CR.x, LY + 2.4, CR.z, [1, 0.9, 0.7], 6);
    lens.glow(CR.x, LY + 2.4, CR.z, [1, 0.8, 0.55], 3);
    ctx.lensGroup = lens.finish(null);
    ctx.lensGroup.visible = false;
    // lamplighter's corner: stool, logbook shelf, spare carbon rods, a thermos that never got finished
    K.chair(b, CR.x - 2.6, LY, CR.z - 2.4, PI * 0.25, {
      mat: "metal",
      seatMat: "leather",
    });
    b.boxMM(
      "wood_dark",
      CR.x - 3.9,
      LY + 1.2,
      CR.z - 3.4,
      CR.x - 3.5,
      LY + 1.25,
      CR.z - 1.6,
      { tint: [0.32, 0.22, 0.14] },
    );
    for (let k = 0; k < 5; k++)
      b.box(
        "flat",
        CR.x - 3.7,
        LY + 1.25,
        CR.z - 3.2 + k * 0.3,
        0.22,
        0.26,
        0.05,
        {
          tint: [
            [0.3, 0.2, 0.15],
            [0.2, 0.25, 0.35],
            [0.45, 0.4, 0.3],
          ][k % 3],
        },
      );
    for (let k = 0; k < 6; k++)
      b.pipe(
        "cast_iron",
        CR.x - 3.6 + k * 0.08,
        LY + 0.05,
        CR.z + 0.4,
        CR.x - 3.6 + k * 0.08,
        LY + 0.05,
        CR.z + 1.6,
        0.025,
        4,
        { tint: [0.15, 0.15, 0.15] },
      );
    b.cyl("steel", CR.x - 2.1, LY, CR.z - 3.2, 0.07, 0.07, 0.3, 8, {
      tint: [0.4, 0.5, 0.45],
    });
    b.light(CR.x, LY + 3.2, CR.z, [0.45, 0.58, 0.48], 0.95, 7.5, { box: LR });
    for (const [nx, nz] of [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ])
      b.light(
        CR.x + nx * 2.8,
        LY + 2.6,
        CR.z + nz * 2.8,
        [0.4, 0.55, 0.42],
        0.4,
        4,
        { box: LR },
      ); // skyglow through the panes
    b.plate(
      "art",
      CR.x,
      LY + 4.62,
      CR.z - 3.7,
      0,
      1,
      3.2,
      0.5,
      K.signCell("ce_lightstay", "THE LIGHTS STAY ON", 512, 80, {
        bg: "#2a3a30",
        fg: "#e0c890",
        font: "Georgia, serif",
      }),
    );
    K.terminal(
      ctx,
      "pv3_term_ce_beacon",
      CR.x + 2.8,
      LY,
      CR.z - 2.6,
      -HP * 0.5,
      termBeacon(),
      "own_desk",
    );
    K.lamp(b, CR.x - 2.8, LY + 4.3, CR.z + 2.8, "cage", red, 0.6, 6, {
      ceil: LY + 5,
      lightOpts: { box: LR },
    });
    K.loot(ctx, "footlocker", CR.x - 3.2, LY, CR.z + 2.4, HP, {
      items: [
        ["pv3_linemans_pin", 1],
        ["rally_tonic", 2],
      ],
      name: "Lamplighter's Kit",
    });

    // ================================================================ doors & anchors
    const OX = O.x,
      OY = O.y,
      OZ = O.z;
    const D = PV.CE_DOOR;
    // bronze-and-glass street doors with a lettered transom and an EXIT sign
    K.exitDoor(b, 0, 0, 0, 0, -1, 2.4, 3.4, {
      leaves: 2,
      glass: true,
      transom: "15TH STREET",
      sign: "EXIT",
      mat: "bronze",
      tint: [0.42, 0.33, 0.2],
      day: [0.82, 0.84, 0.8],
      lightBox: LB,
    });
    K.door(ctx, {
      id: "pv3_ce_in",
      pos: new THREE.Vector3(D.x, 1.6, D.z + 1.0),
      label: "Five Boroughs Power Building",
      verb: "Enter",
      radius: 1.8,
      target: { x: OX, y: OY, z: OZ - 1.5, yaw: 0 },
      onEnter: () => {
        K.safe("disc", () => G.discover("five_boro_tower"));
        PV.onEnter && PV.onEnter("five_boro_tower");
      },
    });
    K.door(ctx, {
      id: "pv3_ce_out",
      pos: new THREE.Vector3(OX, OY + 1.5, OZ - 0.3),
      label: "15th Street",
      verb: "Leave",
      radius: 1.6,
      target: { x: D.x, y: 0, z: D.z + 2.6, yaw: PI },
    });
    K.door(ctx, {
      id: "pv3_ce_elev_up",
      pos: new THREE.Vector3(OX + 4.5, OY + 1.3, OZ - 15.5),
      label: "Executive Elevator (Tower)",
      verb: "Ride",
      lock: LK.elevator,
      sound: "door_open",
      target: { x: OX + CR.x, y: OY + CR.y, z: OZ + CR.z + 4.4, yaw: 0 },
      onEnter: () => PV.onEnter && PV.onEnter("five_boro_crown"),
    });
    K.door(ctx, {
      id: "pv3_ce_elev_down",
      pos: new THREE.Vector3(OX + CR.x, OY + CR.y + 1.3, OZ + CR.z + 5.6),
      label: "Executive Elevator (Lobby)",
      verb: "Ride",
      target: { x: OX + 4.5, y: OY, z: OZ - 14.2, yaw: PI },
    });
    K.door(ctx, {
      id: "pv3_ce_lantern_up",
      pos: new THREE.Vector3(OX + CR.x + 5.3, OY + CR.y + 1.6, OZ + CR.z - 4.9),
      label: "Lantern Ladder",
      verb: "Climb",
      sound: "footstep_metal",
      target: {
        x: OX + CR.x + 2.2,
        y: OY + LY,
        z: OZ + CR.z + 2.2,
        yaw: PI * 0.75,
      },
    });
    K.door(ctx, {
      id: "pv3_ce_lantern_down",
      pos: new THREE.Vector3(OX + CR.x + 3.4, OY + LY + 1.0, OZ + CR.z + 3.4),
      label: "Lantern Ladder (down)",
      verb: "Descend",
      sound: "footstep_metal",
      target: { x: OX + CR.x + 4.4, y: OY + CR.y, z: OZ + CR.z - 3.6, yaw: HP },
    });

    K.anchor(ctx, "entrance", 0, 0, -1.5);
    K.anchor(ctx, "boss", CR.x, CR.y, CR.z - 3.2);
    ctx.combatBoss = K.world(ctx, CR.x, CR.y, CR.z - 3.2);
    K.anchor(ctx, "regulator", -9.1, VY, -34.6);
    K.anchor(ctx, "beacon", CR.x, LY, CR.z);
    [
      [-5, 0, -10],
      [5, 0, -4],
      [-4, 0, -22],
      [6, 0, -28],
      [-2, VY, -36],
      [7, VY, -40],
    ].forEach((p, i) => K.anchor(ctx, "spawn" + (i + 1), p[0], p[1], p[2]));
    K.anchor(ctx, "loot1", 7.5, 0.6, -17.5);
    K.anchor(ctx, "loot2", 9.6, VY, -47);
    K.anchor(ctx, "loot3", CR.x - 5.6, CR.y, CR.z - 4.5);
    K.anchor(ctx, "loot4", CR.x - 3.2, LY, CR.z + 2.4);
    ctx.intRoot = b.finish(null);
    ctx.intRoot.name = "poi_five_boro_tower_int";
    ctx.intRoot.add(ctx.regulatorGroup);
    ctx.intRoot.add(ctx.lensGroup);
  }

