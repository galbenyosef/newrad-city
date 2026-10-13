// play-inline-397 03 — tint
// Lines 93-1892 of readable/play-inline-397.pretty.js (statement-aligned).
  function interior(ctx) {
    const O = ctx.O;
    const b = K.builder({
      name: "jm_int",
      off: O,
      lit: true,
      amb: [0.12, 0.115, 0.11],
      floors: [0, BY, TWR.y - 2.5, TWR.y + 3.1],
      grime: 0.55,
    });
    const r = K.rng("jm_int");
    const day = [0.62, 0.68, 0.78],
      bulb = [1, 0.78, 0.5],
      stained = [
        [0.75, 0.25, 0.2],
        [0.25, 0.4, 0.75],
        [0.85, 0.7, 0.25],
        [0.3, 0.6, 0.35],
      ];
    const wallC = [0.72, 0.64, 0.52],
      panel = [0.32, 0.2, 0.12];

    // ---------------------------------------------------------------- gaps
    K.gap(ctx, 0, 0, 1.8, 0, 2.9); // street doors
    K.gap(ctx, 0, -7, 2.6, 0, 3.6); // vestibule → courtroom
    K.gap(ctx, -4, -4, 1.4, 0, 2.6); // vestibule → detention stair hall
    K.gap(ctx, 4, -4, 1.2, 0, 2.4); // vestibule → tower stair
    K.gap(ctx, 9, -11, 1.2, 0, 2.4); // courtroom → clerk
    K.gap(ctx, 9, -23, 1.2, 0, 2.4); // courtroom → chambers
    K.gap(ctx, 12.5, -16, 1.1, 0, 2.3); // clerk ↔ chambers
    K.gap(ctx, -8, -7, 1.6, BY, 2.5); // stair hall → detention corridor
    K.gap(ctx, -8, -31, 1.4, BY, 2.3); // corridor → evidence room

    // ================================================================ VESTIBULE
    const VB = [-4.1, -0.3, -7.1, 4.1, 6.2, 0.1];
    K.room(b, ctx, {
      x0: -4,
      z0: -7,
      x1: 4,
      z1: 0,
      y: 0,
      h: 6,
      floor: "mosaic",
      fc: [0.8, 0.72, 0.62],
      wall: "plaster",
      wc: wallC,
      wain: "wood_dark",
      wainC: panel,
      wainH: 1.4,
      ceil: "plaster",
      cc: [0.5, 0.46, 0.4],
      cornice: true,
    });
    // quadripartite rib vaulting: four plaster webs springing from the walls at 4.4 m up to a carved boss,
    // stone diagonal ribs + wall arches (the webs hide the flat ceiling above)
    const VS = 4.4,
      VA = 5.95,
      VC = [0, VA, -3.5];
    const webs = [
      [
        [-4, VS, -7],
        [4, VS, -7],
      ],
      [
        [4, VS, -7],
        [4, VS, 0],
      ],
      [
        [4, VS, 0],
        [-4, VS, 0],
      ],
      [
        [-4, VS, 0],
        [-4, VS, -7],
      ],
    ];
    for (const [A, B] of webs) {
      const mid = [(A[0] + B[0]) / 2, VS + 1.1, (A[2] + B[2]) / 2];
      // each web = two panels (springing line → crown line → boss) so it bows like real masonry vaulting
      b.quadGrid("plaster", A, mid, VC, VC, {
        tint: [0.64, 0.58, 0.48],
        seg: 0.8,
      });
      b.quadGrid("plaster", mid, B, VC, VC, {
        tint: [0.64, 0.58, 0.48],
        seg: 0.8,
      });
      // wall arch (formeret) as a stone band along the springing line
      b.beam(
        "limestone",
        A[0] + (B[2] - A[2] ? Math.sign(-A[0]) * 0.08 : 0),
        VS - 0.12,
        A[2] + (B[0] - A[0] ? Math.sign(-3.5 - A[2]) * 0.08 : 0),
        B[0] + (B[2] - A[2] ? Math.sign(-B[0]) * 0.08 : 0),
        VS - 0.12,
        B[2] + (B[0] - A[0] ? Math.sign(-3.5 - B[2]) * 0.08 : 0),
        0.22,
        0.24,
        { tint: [0.76, 0.72, 0.64] },
      );
    }
    for (const [ax, az] of [
      [-4, 0],
      [4, 0],
      [4, -7],
      [-4, -7],
    ]) {
      // diagonal rib in 3 segments following the web curve + a corbel head at the springing
      const P0 = [ax * 0.96, VS, az === 0 ? -0.15 : -6.85],
        P1 = [
          ax * 0.55,
          VS + 1.05,
          (az === 0 ? -0.15 : -6.85) * 0.55 + -3.5 * 0.45,
        ],
        P2 = [
          ax * 0.22,
          VA - 0.12,
          (az === 0 ? -0.15 : -6.85) * 0.22 + -3.5 * 0.78,
        ];
      b.beam("limestone", P0[0], P0[1], P0[2], P1[0], P1[1], P1[2], 0.2, 0.24, {
        tint: [0.78, 0.74, 0.66],
      });
      b.beam("limestone", P1[0], P1[1], P1[2], P2[0], P2[1], P2[2], 0.2, 0.24, {
        tint: [0.78, 0.74, 0.66],
      });
      b.beam("limestone", P2[0], P2[1], P2[2], 0, VA - 0.05, -3.5, 0.2, 0.24, {
        tint: [0.78, 0.74, 0.66],
      });
      b.box(
        "limestone",
        ax * 0.93,
        VS - 0.7,
        az === 0 ? -0.3 : -6.7,
        0.45,
        0.6,
        0.45,
        { tint: [0.72, 0.68, 0.6] },
      );
      b.geo("limestone", K.sphereGeo(), {
        x: ax * 0.93,
        y: VS - 0.8,
        z: az === 0 ? -0.3 : -6.7,
        s: 0.2,
        tint: [0.7, 0.66, 0.58],
      }); // carved head
    }
    b.geo("gold", new THREE.TorusGeometry(0.34, 0.08, 5, 12), {
      x: 0,
      y: VA - 0.08,
      z: -3.5,
      rx: HP,
      tint: [0.6, 0.48, 0.26],
    });
    b.geo("limestone", K.sphereGeo(), {
      x: 0,
      y: VA - 0.06,
      z: -3.5,
      s: 0.3,
      sy: 0.18,
      tint: [0.8, 0.76, 0.66],
    });
    // blind Gothic arcading on the side walls above the wainscot (shallow pointed arches on colonnettes)
    for (const sx of [-1, 1])
      for (let k = 0; k < 3; k++) {
        const z = -1.4 - k * 2.1;
        if (k === 1) continue; // detention / tower stair doors
        if ((sx < 0 && k === 0) || (sx > 0 && k === 2)) continue; // directory board / security booth
        K.lancet(b, sx * 3.98, 1.55, z, -sx, 0, 1.2, 2.4, {
          state: "dark",
          paneTint: [0.5, 0.42, 0.34],
          mullion: false,
          sill: false,
          rose: false,
          surround: "limestone",
          fw: 0.1,
        });
      }
    // Ardent Robotics court-security screening arch across the courtroom doorway, and its dead Patrolman attendant booth
    const arch = [0.8, 0.82, 0.8];
    for (const sx of [-1, 1]) {
      b.boxMM(
        "metal",
        sx * 1.45 - 0.18,
        0,
        -6.35,
        sx * 1.45 + 0.18,
        2.6,
        -5.85,
        { tint: arch },
      );
      b.col(sx * 1.45 - 0.18, 0, -6.35, sx * 1.45 + 0.18, 2.6, -5.85, {
        tag: "scanner",
        walkable: false,
      });
    }
    b.boxMM("metal", -1.63, 2.6, -6.35, 1.63, 3.0, -5.85, { tint: arch });
    b.plate(
      "art",
      0,
      2.8,
      -5.84,
      0,
      1,
      2.4,
      0.3,
      K.signCell(
        "jmi_scan",
        "ARDENT SECURI-SCAN · PLEASE REMAIN CALM",
        512,
        64,
        { bg: "#1e3a5e", fg: "#e8d8a8", font: "Arial, sans-serif" },
      ),
    );
    for (const sx of [-1, 1])
      for (let k = 0; k < 5; k++)
        b.geo("lamp", K.sphereGeo(), {
          x: sx * 1.28,
          y: 0.5 + k * 0.45,
          z: -6.1,
          s: 0.035,
          tint: k === 2 && sx > 0 ? [1, 0.15, 0.1] : [0.15, 0.1, 0.08],
        });
    b.glow(1.28, 1.4, -6.1, [1, 0.15, 0.1], 0.5);
    b.boxMM("metal", 2.3, 0, -6.8, 3.9, 1.1, -5.6, { tint: [0.45, 0.5, 0.52] });
    b.boxMM("glass", 2.3, 1.1, -6.8, 3.9, 2.4, -6.75, {
      tint: [0.3, 0.36, 0.38],
    });
    b.col(2.3, 0, -6.8, 3.9, 1.1, -5.6, { tag: "booth" });
    b.plate("lamp", 3.1, 0.8, -5.58, 0, 1, 0.5, 0.2, null, {
      tint: [0.1, 0.35, 0.14],
    });
    // take-a-number dispenser + the last ticket still hanging out of it
    b.cyl("paint_red", -2.6, 0, -6.5, 0.05, 0.05, 1.3, 6);
    b.boxMM("paint_red", -2.8, 1.3, -6.65, -2.4, 1.6, -6.35, {});
    b.plate(
      "art",
      -2.6,
      1.46,
      -6.34,
      0,
      1,
      0.3,
      0.18,
      K.signCell("jmi_ticket", "NOW SERVING\n4,117,902", 128, 72, {
        bg: "#e8e0c8",
        fg: "#8a1a10",
        font: "Arial Black, sans-serif",
      }),
    );
    // stained-glass lancets either side of the door (lit from outside)
    for (const x of [-2.6, 2.6]) {
      K.lancet(b, x, 1.6, -0.1, 0, -1, 1.0, 3.2, {
        state: "lit",
        paneTint: stained[(x > 0) | 0],
        rose: false,
        surround: "limestone",
      });
      b.light(x, 2.8, -1.4, stained[(x > 0) | 0], 0.55, 5, { box: VB });
      b.glow(x, 2.6, -0.25, stained[(x > 0) | 0], 1.6);
    }
    K.lamp(b, 0, 4.2, -3.5, "cage", bulb, 1.0, 8, {
      ceil: 5.9,
      lightOpts: { box: VB },
    });
    b.pipe("black_iron", 0, 4.3, -3.5, 0, 5.8, -3.5, 0.01, 3);
    // the robot notice board
    b.plate(
      "art",
      3.88,
      1.9,
      -2.75,
      -1,
      0,
      1.0,
      1.25,
      K.signCell(
        "jmi_notice",
        "ALL RISE.\nSILENCE IN\nTHE COURT.\n\nSPITTING\nIS A CRIME\n(§ 12-114)",
        200,
        256,
        {
          bg: "#1a2a3a",
          fg: "#e0d8c0",
          font: "Arial, sans-serif",
          border: "#d8b040",
        },
      ),
    );
    b.plate(
      "art",
      -3.88,
      2.0,
      -1.6,
      1,
      0,
      1.0,
      1.3,
      K.signCell(
        "jmi_directory",
        "COURTROOM ↑\nCLERK →\nDETENTION ←\nTOWER →",
        180,
        220,
        { bg: "#2a1a10", fg: "#d8c890", font: "Georgia, serif" },
      ),
    );
    // bench, umbrella stand, a fallen visitor
    b.boxMM("wood_dark", -3.8, 0, -6.6, -3.3, 0.45, -3.6, { tint: panel });
    b.col(-3.8, 0, -6.6, -3.3, 0.45, -3.6, { tag: "furniture" });
    b.cyl("brass", 3.4, 0, -1.0, 0.18, 0.18, 0.6, 8, { top: false });
    K.skel(ctx, -3.2, 0, -5.2, 0.3, "sitting");
    b.hplate("decal", 0.8, 0.012, -2.8, 1.8, 1.6, 0.4, K.decal("grime", 11));

    // ================================================================ COURTROOM
    const CR = [-9.1, -0.3, -27.1, 9.1, 9.2, -6.9];
    const CH = 9;
    K.room(b, ctx, {
      x0: -9,
      z0: -27,
      x1: 9,
      z1: -7,
      y: 0,
      h: CH,
      floor: "parquet",
      fc: [0.62, 0.48, 0.36],
      wall: "plaster",
      wc: wallC,
      wain: "wood_dark",
      wainC: panel,
      wainH: 2.4,
      ceil: "wood",
      cc: [0.5, 0.38, 0.27],
      cornice: true,
      corniceMat: "wood_dark",
      surface: "wood",
    });
    // ridge beam + purlins over the trusses, and the chandeliers' up-light on the boarded ceiling
    b.beam("wood_dark", 0, 8.85, -27, 0, 8.85, -7, 0.3, 0.26, { tint: panel });
    for (const x of [-5.4, -3.2, 3.2, 5.4])
      b.beam(
        "wood_dark",
        x,
        7.95 + (5.4 - Math.abs(x)) * 0.19,
        -27,
        x,
        7.95 + (5.4 - Math.abs(x)) * 0.19,
        -7,
        0.2,
        0.2,
        { tint: panel },
      );
    for (const z of [-11, -23])
      b.light(0, 7.4, z, [0.9, 0.7, 0.45], 0.45, 7, {
        box: [-9.1, 6.5, -27.1, 9.1, 9.2, -6.9],
      });
    // hammer-beam trusses
    for (let z = -25; z <= -9; z += 4) {
      for (const s of [-1, 1]) {
        b.beam("wood_dark", s * 8.9, 5.2, z, s * 7.2, 5.2, z, 0.3, 0.3, {
          tint: panel,
        }); // hammer beam
        b.beam("wood_dark", s * 8.9, 3.6, z, s * 8.9, 5.2, z, 0.28, 0.28, {
          tint: panel,
        }); // wall post
        b.beam("wood_dark", s * 8.9, 4.0, z, s * 7.6, 5.2, z, 0.16, 0.2, {
          tint: panel,
        }); // brace
        b.beam("wood_dark", s * 7.2, 5.2, z, s * 7.2, 7.2, z, 0.24, 0.24, {
          tint: panel,
        }); // hammer post
        b.beam("wood_dark", s * 7.2, 7.2, z, 0, 8.9, z, 0.24, 0.3, {
          tint: panel,
        }); // principal rafter
        b.geo("wood_dark", new THREE.ConeGeometry(0.16, 0.5, 6), {
          x: s * 7.2,
          y: 5.0,
          z,
          rx: PI,
          tint: panel,
        }); // pendant
      }
      b.beam("wood_dark", -5, 7.9, z, 5, 7.9, z, 0.2, 0.22, { tint: panel }); // collar
    }
    // tall pointed windows down the west wall (daylight) and blind arcading on the east
    for (let k = 0; k < 4; k++) {
      const z = -10 - k * 4.8;
      K.lancet(b, -8.9, 3.0, z, 1, 0, 1.6, 5.4, {
        state: k === 1 ? "boarded" : "lit",
        paneTint: k === 2 ? [0.55, 0.62, 0.7] : [0.5, 0.56, 0.6],
        surround: "limestone",
      });
      if (k !== 1) {
        b.light(-7.4, 5.2, z, day, 0.9, 9, { box: CR });
        b.glow(-8.7, 5.2, z, [0.5, 0.55, 0.6], 3.2);
        // dusty god-rays slanting down to the floor (two crossed additive sheets) + a pool of light where they land
        const ray =
          PV.jmRay ||
          (PV.jmRay = K.paint(
            "neon",
            "jm_ray",
            128,
            64,
            function (x, X, Y, W, H) {
              x.fillStyle = "#000";
              x.fillRect(X, Y, W, H);
              for (let j = 0; j < H; j++) {
                const e = Math.sin(((j + 0.5) / H) * PI);
                const g = x.createLinearGradient(X, 0, X + W, 0);
                g.addColorStop(0, "rgba(255,248,225," + 0.55 * e * e + ")");
                g.addColorStop(0.6, "rgba(255,244,215," + 0.18 * e * e + ")");
                g.addColorStop(1, "rgba(0,0,0,0)");
                x.fillStyle = g;
                x.fillRect(X, Y + j, W, 1);
              }
              const rr = K.rng("motes");
              for (let k2 = 0; k2 < 90; k2++) {
                x.fillStyle = "rgba(255,250,230," + (0.3 + rr() * 0.5) + ")";
                x.fillRect(X + rr() * W * 0.8, Y + 4 + rr() * (H - 8), 1, 1);
              } // dust motes
            },
          ));
        const rt = [0.62, 0.6, 0.5],
          sl = 0.78;
        const A = [-8.75, 3.3, z],
          Bt = [-8.75, 8.1, z],
          A2 = [-8.75 + 3.3 / sl, 0.02, z],
          B2 = [-8.75 + 8.1 / sl, 0.02, z];
        b.quad(K.atlasMat("neon", ray), A, A2, B2, Bt, { rect: ray, tint: rt });
        b.quad(
          K.atlasMat("neon", ray),
          [-8.75, 5.7, z - 0.75],
          [-8.75 + 5.7 / sl, 0.02, z - 0.75],
          [-8.75 + 5.7 / sl, 0.02, z + 0.75],
          [-8.75, 5.7, z + 0.75],
          { rect: ray, tint: rt.map((v) => v * 0.8) },
        );
        b.light(-8.75 + 5.7 / sl, 0.6, z, [0.75, 0.74, 0.66], 0.6, 3.2, {
          box: CR,
        });
      }
      K.lancet(b, 8.9, 3.0, z, -1, 0, 1.6, 5.4, {
        state: "dark",
        paneTint: [0.18, 0.12, 0.08],
        mullion: false,
        surround: "limestone",
      });
    }
    // three wrought-iron ring chandeliers (two dead)
    [
      [-11, false],
      [-17, true],
      [-23, false],
    ].forEach(([z, dead]) => {
      b.pipe("black_iron", 0, 6.2, z, 0, CH, z, 0.02, 4);
      b.geo("black_iron", new THREE.TorusGeometry(0.9, 0.04, 4, 16), {
        x: 0,
        y: 6.0,
        z,
        rx: HP,
      });
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * PI * 2;
        const px = Math.cos(a) * 0.9,
          pz = z + Math.sin(a) * 0.9;
        b.cyl("ceramic", px, 6.0, pz, 0.03, 0.03, 0.12, 5);
        if (!dead) {
          b.geo("lamp", K.sphereGeo(), {
            x: px,
            y: 6.2,
            z: pz,
            s: 0.035,
            tint: bulb,
          });
        }
      }
      for (let k = 0; k < 4; k++) {
        const a = (k / 4) * PI * 2;
        b.pipe(
          "black_iron",
          Math.cos(a) * 0.9,
          6.0,
          z + Math.sin(a) * 0.9,
          0,
          6.8,
          z,
          0.008,
          3,
        );
      }
      if (!dead) {
        b.light(0, 5.8, z, bulb, 1.1, 10, { box: CR });
        b.glow(0, 6.1, z, [0.9, 0.65, 0.35], 2.4);
      }
    });
    // THE BENCH: raised dais, panelled front, the seal, the gavel
    b.boxMM("wood_dark", -4.5, 0, -27, 4.5, 0.9, -23.4, {
      tint: panel,
      faces: "nsewt",
    });
    b.col(-4.5, 0, -27, 4.5, 0.9, -23.4, { tag: "dais", surface: "wood" });
    K.stairs(b, 4.5, -25.5, 5.7, -24.3, 0, 0.9, "-x", {
      mat: "wood_dark",
      tint: panel,
    });
    b.boxMM("mahogany", -3.8, 0.9, -24.6, 3.8, 2.3, -24.1, {
      tint: [0.42, 0.2, 0.12],
    });
    b.boxMM("mahogany", -4.0, 2.3, -24.8, 4.0, 2.4, -23.95, {
      tint: [0.48, 0.24, 0.14],
    });
    for (let k = 0; k < 6; k++) {
      const x = -3.2 + k * 1.28;
      b.boxMM("mahogany", x - 0.45, 1.1, -24.1, x + 0.45, 2.1, -24.06, {
        tint: [0.36, 0.17, 0.1],
      });
    }
    b.col(-4.0, 0.9, -24.8, 4.0, 2.4, -23.95, {
      tag: "bench",
      walkable: false,
    });
    b.box("mahogany", 0, 2.4, -24.4, 0.28, 0.06, 0.14, {
      tint: [0.3, 0.14, 0.08],
    }); // gavel block
    b.pipe("mahogany", -0.1, 2.5, -24.4, 0.2, 2.5, -24.35, 0.02, 5);
    b.cyl("mahogany", -0.12, 2.46, -24.4, 0.05, 0.05, 0.1, 8);
    const seal = K.paint("art", "jmi_seal", 256, 256, function (x, X, Y, W, H) {
      x.clearRect(X, Y, W, H);
      x.fillStyle = "#b89040";
      x.beginPath();
      x.arc(X + W / 2, Y + H / 2, W * 0.48, 0, PI * 2);
      x.fill();
      x.fillStyle = "#1e3a5e";
      x.beginPath();
      x.arc(X + W / 2, Y + H / 2, W * 0.4, 0, PI * 2);
      x.fill();
      x.fillStyle = "#e8d8a8";
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.font = "bold 20px Georgia, serif";
      const txt = "EQUAL JUSTICE BY ARDENT ROBOTICS · ";
      for (let i = 0; i < txt.length; i++) {
        const a = -PI / 2 + (i / txt.length) * PI * 2;
        x.save();
        x.translate(
          X + W / 2 + Math.cos(a) * W * 0.44,
          Y + H / 2 + Math.sin(a) * W * 0.44,
        );
        x.rotate(a + PI / 2);
        x.fillText(txt[i], 0, 0);
        x.restore();
      }
      x.font = "bold 90px Georgia, serif";
      x.fillText("⚖", X + W / 2, Y + H / 2 + 4);
      K.stains(x, X, Y, W, H, 6, 8, 0.35, [40, 30, 10]);
    });
    b.plate("art", 0, 5.2, -26.88, 0, 1, 2.6, 2.6, seal, { off: 0.03 });
    b.plate(
      "art",
      0,
      3.3,
      -26.88,
      0,
      1,
      5.2,
      0.5,
      K.signCell("jmi_motto", "THE COURT IS ALWAYS IN SESSION", 768, 72, {
        bg: "#1e3a5e",
        fg: "#e8d8a8",
        font: "Georgia, serif",
      }),
    );
    // the bench is lit like a stage: a green-shaded banker's lamp, the red IN SESSION lamp, warm wash on the panelling
    b.box("brass", -1.6, 2.4, -24.45, 0.18, 0.04, 0.12, {});
    b.cyl("brass", -1.6, 2.44, -24.45, 0.015, 0.015, 0.32, 5);
    b.geo(
      "paint_green",
      new THREE.CylinderGeometry(0.07, 0.16, 0.12, 10, 1, true),
      { x: -1.6, y: 2.8, z: -24.42, rz: 0.12, tint: [0.2, 0.55, 0.3] },
    );
    b.glow(-1.6, 2.72, -24.4, [1, 0.85, 0.5], 0.7);
    b.light(-1.6, 2.7, -24.2, [1, 0.82, 0.5], 0.7, 3.5, { box: CR });
    const sess = K.neonCell("jmi_insession", "IN SESSION", 256, 64, {
      color: "#ff3020",
      font: "Georgia, serif",
      border: true,
    });
    b.boxMM("paint_black", -1.25, 6.62, -26.98, 1.25, 7.27, -26.9, {
      tint: [0.05, 0.05, 0.05],
    });
    b.plate("neon", 0, 6.95, -26.9, 0, 1, 2.3, 0.58, sess, { off: 0.02 });
    b.glow(0, 6.95, -26.6, [1, 0.2, 0.12], 2.2);
    b.light(0, 6.6, -25.8, [1, 0.25, 0.15], 0.9, 6.5, { box: CR });
    b.light(0, 3.2, -20.8, [1, 0.8, 0.55], 1.1, 7.5, { box: CR });
    b.light(-6, 2.6, -16, [1, 0.8, 0.55], 0.45, 7, { box: CR });
    b.light(6, 2.6, -10, [1, 0.8, 0.55], 0.4, 6, { box: CR });
    // red carpet runner down the aisle from the doors to the bar rail
    b.hplate(
      "decal",
      0,
      0.014,
      -12.5,
      1.6,
      10.5,
      0,
      K.paint("art", "jmi_runner", 64, 256, function (x, X, Y, W, H) {
        x.fillStyle = "#5a1612";
        x.fillRect(X, Y, W, H);
        x.fillStyle = "#b08840";
        x.fillRect(X + 4, Y, 3, H);
        x.fillRect(X + W - 7, Y, 3, H);
        K.stains(x, X, Y, W, H, 10, 17, 0.5, [30, 20, 10]);
        x.clearRect(X + W * 0.6, Y + H * 0.7, W * 0.4, H * 0.08);
      }),
    );
    // flags either side of the bench (US + an Ardent Robotics pennant)
    for (const [x, t] of [
      [-4.2, [0.7, 0.2, 0.18]],
      [4.2, [0.2, 0.3, 0.5]],
    ]) {
      b.cyl("brass", x, 0.9, -26.4, 0.03, 0.03, 3.2, 6);
      b.geo("gold", K.sphereGeo(), { x, y: 4.15, z: -26.4, s: 0.07 });
      b.quadN(
        "cloth_red",
        [x, 2.3, -26.4],
        [x + (x < 0 ? 0.9 : -0.9), 2.5, -26.35],
        [x + (x < 0 ? 0.9 : -0.9), 3.9, -26.35],
        [x, 4.0, -26.4],
        [0, 0, 1],
        { tint: t },
      );
    }
    // witness stand (east of the bench) and the jury box (east wall, two tiers of dusty mannequins)
    b.boxMM("mahogany", 5.2, 0, -23.2, 7.0, 1.2, -21.6, {
      tint: [0.4, 0.2, 0.12],
      faces: "nsewt",
    });
    b.col(5.2, 0, -23.2, 7.0, 1.2, -21.6, { tag: "furniture" });
    K.chair(b, 6.1, 0, -22.9, 0, { mat: "mahogany", tint: [0.4, 0.2, 0.12] });
    b.boxMM("mahogany", 6.0, 0, -20.6, 8.8, 0.3, -12.6, {
      tint: panel,
      faces: "nsewt",
    });
    b.boxMM("mahogany", 7.4, 0.3, -20.6, 8.8, 0.6, -12.6, {
      tint: panel,
      faces: "nsewt",
    });
    b.boxMM("mahogany", 5.9, 0, -20.7, 6.05, 1.1, -12.5, {
      tint: [0.4, 0.2, 0.12],
    });
    b.col(5.9, 0, -20.7, 8.8, 1.1, -12.5, { tag: "jury", walkable: false });
    for (let k = 0; k < 12; k++) {
      const tier = k % 2,
        z = -19.9 + Math.floor(k / 2) * 1.3,
        x = tier ? 8.1 : 6.8,
        y = tier ? 0.6 : 0.3;
      K.chair(b, x, y, z, -HP, { mat: "wood_dark", tint: panel });
      if (r() < 0.7) {
        // mannequin juror (Ardent "jury simulation units") — some toppled
        const tp = r() < 0.2;
        if (!tp) {
          b.cyl("flat", x, y + 0.5, z, 0.16, 0.2, 0.6, 8, {
            tint: [0.8, 0.74, 0.64],
          });
          b.geo("flat", K.sphereGeo(), {
            x,
            y: y + 1.25,
            z,
            s: 0.13,
            tint: [0.82, 0.76, 0.66],
          });
        } else
          b.cyl("flat", x - 0.4, y + 0.1, z, 0.16, 0.2, 0.6, 8, {
            tint: [0.8, 0.74, 0.64],
          });
      }
    }
    b.plate(
      "art",
      8.88,
      2.8,
      -16.6,
      -1,
      0,
      2.6,
      0.45,
      K.signCell("jmi_jury", "JURY (SIMULATED)", 512, 80, {
        bg: "#2a1a10",
        fg: "#d8c890",
        font: "Georgia, serif",
      }),
    );
    // counsel tables, the bar rail with its swing gate, gallery pews
    for (const x of [-3.2, 3.2]) {
      const t = K.table(b, x, 0, -19.2, 2.6, 1.0, {
        mat: "mahogany",
        tint: [0.42, 0.22, 0.13],
      });
      K.chair(b, x - 0.6, 0, -18.4, PI, {
        mat: "mahogany",
        tint: [0.4, 0.2, 0.12],
      });
      K.chair(b, x + 0.6, 0, -18.4, PI, {
        mat: "mahogany",
        tint: [0.4, 0.2, 0.12],
      });
      for (let k = 0; k < 4; k++)
        b.box(
          "flat",
          x - 0.9 + r() * 1.8,
          t,
          -19.2 + (r() - 0.5) * 0.6,
          0.3,
          0.02 + r() * 0.05,
          0.22,
          { yaw: r(), tint: [0.85, 0.82, 0.72] },
        );
    }
    b.plate(
      "art",
      -3.2,
      0.95,
      -19.72,
      0,
      -1,
      1.2,
      0.25,
      K.signCell("jmi_def", "DEFENSE", 256, 52, {
        bg: "#e0d8c0",
        fg: "#2a1a10",
      }),
    );
    b.plate(
      "art",
      3.2,
      0.95,
      -19.72,
      0,
      -1,
      1.2,
      0.25,
      K.signCell("jmi_pro", "PROSECUTION", 256, 52, {
        bg: "#e0d8c0",
        fg: "#2a1a10",
      }),
    );
    for (const [x0, x1] of [
      [-8.8, -0.7],
      [0.7, 5.8],
    ]) {
      b.beam("mahogany", x0, 1.0, -16.2, x1, 1.0, -16.2, 0.1, 0.08, {
        tint: [0.45, 0.22, 0.13],
      });
      for (let x = x0; x <= x1; x += 0.25)
        b.cyl("mahogany", x, 0, -16.2, 0.03, 0.03, 1.0, 5, {
          tint: [0.4, 0.2, 0.12],
        });
      b.col(x0, 0, -16.3, x1, 1.05, -16.1, { tag: "rail", walkable: false });
    }
    b.box("mahogany", -0.35, 0.1, -16.2, 0.62, 0.8, 0.05, {
      yaw: 0.9,
      tint: [0.4, 0.2, 0.12],
    }); // the swing gate, ajar
    for (let row = 0; row < 5; row++) {
      const z = -14.4 + row * 1.35;
      for (const [x0, x1] of [
        [-8.6, -1.1],
        [1.1, 8.6],
      ]) {
        b.boxMM("oak", x0, 0.42, z - 0.25, x1, 0.47, z + 0.2, {
          tint: [0.5, 0.36, 0.24],
        });
        b.boxMM("oak", x0, 0.47, z + 0.2, x1, 1.05, z + 0.26, {
          tint: [0.48, 0.34, 0.22],
        });
        for (const x of [x0 + 0.1, x1 - 0.1])
          b.boxMM("oak", x - 0.04, 0, z - 0.28, x + 0.04, 0.9, z + 0.28, {
            tint: [0.44, 0.3, 0.2],
          });
        b.col(x0, 0, z - 0.28, x1, 0.5, z + 0.28, {
          tag: "pew",
          surface: "wood",
        });
        if (r() < 0.35)
          K.skel(ctx, x0 + 0.8 + r() * (x1 - x0 - 1.6), 0.47, z, PI, "sitting");
      }
    }
    K.litter(b, -8.5, -15, 8.5, -7.5, 0, 22, 3101);
    for (let k = 0; k < 5; k++)
      b.hplate(
        "decal",
        -7 + r() * 14,
        0.012 + k * 0.0004,
        -26 + r() * 18,
        1.5,
        1.5,
        r() * 6,
        K.decal(k % 2 ? "grime" : "puddle", 30 + k),
      );
    b.light(0, 2.6, -11.5, bulb, 0.45, 9, { box: CR });
    b.light(0, 2.6, -21, bulb, 0.35, 8, { box: CR });
    // a slumped fallen chandelier-chain and a water stain from the broken roof
    b.hplate("decal", -6, 0.014, -10.5, 3, 3, 0.3, K.decal("puddle", 7));
    b.light(-6.5, 8.5, -9, [0.55, 0.6, 0.65], 0.6, 7, { box: CR });

    // ================================================================ CLERK'S OFFICE
    const CK = [8.9, -0.3, -16.1, 16.1, 4.1, -6.9];
    K.room(b, ctx, {
      x0: 9,
      z0: -16,
      x1: 16,
      z1: -7,
      y: 0,
      h: 4,
      floor: "checker",
      fc: [0.72, 0.7, 0.64],
      wall: "plaster_stained",
      wc: [0.7, 0.68, 0.58],
      wain: "wood_dark",
      wainC: panel,
      wainH: 1.1,
      ceil: "tin",
      cc: [0.5, 0.48, 0.42],
    });
    for (let k = 0; k < 4; k++)
      K.shelf(b, 15.6, 0, -8.2 - k * 1.8, -HP, 1.6, {
        h: 2.6,
        mat: "wood_dark",
        tint: panel,
        items: ["book", "book", "box"],
        seed: 400 + k,
        levels: 5,
      });
    b.plate(
      "art",
      15.8,
      3.2,
      -11.5,
      -1,
      0,
      3,
      0.4,
      K.signCell(
        "jmi_lawlib",
        "LAW LIBRARY — MUNICIPAL CODE 1898–1967",
        640,
        72,
        { bg: "#2a1a10", fg: "#d8c890", font: "Georgia, serif" },
      ),
    );
    b.boxMM("wood_dark", 9.4, 0, -10.6, 12.4, 1.05, -9.8, { tint: panel });
    b.col(9.4, 0, -10.6, 12.4, 1.05, -9.8, { tag: "counter" }); // clerk counter
    for (let k = 0; k < 20; k++)
      b.box(
        "flat",
        9.6 + r() * 5.5,
        0.012,
        -15.6 + r() * 4.5,
        0.3,
        0.01,
        0.22,
        { yaw: r() * 3, tint: [0.85, 0.82, 0.72] },
      ); // spilled files
    K.lamp(b, 12.5, 3.3, -11.5, "pendant", bulb, 0.9, 6.5, {
      ceil: 4,
      lightOpts: { box: CK },
    });
    K.loot(ctx, "file_cabinet", 9.4, 0, -14.8, HP, {
      loot: "file_cabinet",
      name: "Docket Files A–K",
    });
    K.loot(ctx, "file_cabinet", 9.4, 0, -13.9, HP, {
      loot: "file_cabinet",
      name: "Docket Files L–Z",
    });
    K.loot(ctx, "desk", 11.2, 0, -14.6, 0, {
      loot: "desk",
      name: "Clerk's Desk",
    });
    K.terminal(
      ctx,
      "pv3_term_jm_docket",
      11.2,
      0.78,
      -14.8,
      0,
      termDocket(),
      "own_desk",
    );

    // ================================================================ JUDGE'S CHAMBERS
    const JC = [8.9, -0.3, -27.1, 16.1, 4.1, -15.9];
    K.room(b, ctx, {
      x0: 9,
      z0: -27,
      x1: 16,
      z1: -16,
      y: 0,
      h: 4,
      floor: "carpet",
      fc: [0.55, 0.25, 0.2],
      wall: "wallpaper_green",
      wc: [0.8, 0.85, 0.75],
      wain: "wood_dark",
      wainC: panel,
      wainH: 1.1,
      ceil: "plaster",
      cc: [0.5, 0.46, 0.4],
      cornice: true,
    });
    const dt = K.table(b, 13.2, 0, -23.5, 2.2, 1.1, {
      mat: "mahogany",
      tint: [0.42, 0.2, 0.12],
    });
    K.chair(b, 13.2, 0, -24.5, 0, { mat: "leather", seatMat: "leather_red" });
    b.box("flat", 12.6, dt, -23.4, 0.35, 0.03, 0.26, {
      tint: [0.85, 0.82, 0.72],
    });
    b.cyl("glass", 13.9, dt, -23.6, 0.04, 0.04, 0.2, 6, {
      tint: [0.5, 0.3, 0.12],
    });
    for (let k = 0; k < 3; k++)
      K.shelf(b, 10.2 + k * 1.7, 0, -26.6, 0, 1.6, {
        h: 2.4,
        mat: "wood_dark",
        tint: panel,
        items: ["book"],
        seed: 450 + k,
      });
    K.sofa(b, 15.3, 0, -19.5, 2.2, HP, { mat: "leather" });
    K.framed(b, 15.88, 2.3, -22, -1, 0, 1.0, 1.3, K.painting(7, 128, 160), {
      frame: "gold",
    });
    K.framed(b, 9.12, 2.3, -20, 1, 0, 0.5, 0.6, K.photo("mug", 3), {
      frame: "paint_black",
      fw: 0.03,
    });
    K.lamp(b, 13.2, dt + 0.35, -23.9, "globe", [1, 0.82, 0.5], 0.8, 5, {
      ceil: dt + 0.36,
      lightOpts: { box: JC },
      size: 0.1,
    });
    K.lamp(b, 12.5, 3.4, -20.5, "bulb", bulb, 0.6, 6, {
      ceil: 4,
      lightOpts: { box: JC },
    });
    K.skel(ctx, 13.4, 0, -21.6, 2.2, "lying");
    K.loot(ctx, "safe", 9.5, 0, -18.2, HP, {
      loot: "safe",
      lock: LK.safe,
      owner: "settlers",
      name: "Judge Harrigan's Safe",
    });
    K.terminal(
      ctx,
      "pv3_term_jm_chambers",
      12.4,
      dt,
      -23.8,
      0,
      termChambers(),
      "desk",
    );
    K.note(ctx, "pv3_note_jm_halloran", 13.6, dt + 0.01, -23.2, {
      name: "Judge Harrigan's Last Ruling",
      title: "Handwritten, on court letterhead",
      learn: LK.chambers.id,
      text: 'Friday, March 1967.\n\nArdent Robotics installed the magistrate unit today. "Pilot program." It read my last forty rulings and told me, very politely, that I was wrong in thirty-one of them.\n\nIt asked if I would like to be recused. From my own courtroom.\n\nI said the law is not arithmetic. It said: "Not yet, Your Honor."\n\nI kept the override console for myself and gave it the one word a judge should always be able to say: ENOUGH.\n\nI am going home early tomorrow. Let the machine have Monday.\n\n— E. Harrigan, J.',
    });

    // ================================================================ DETENTION STAIR HALL (real stairs down to BY)
    const SH = [-12.1, BY - 0.3, -7.1, -3.9, 6.1, 0.1];
    K.room(b, ctx, {
      x0: -12,
      z0: -7,
      x1: -4,
      z1: 0,
      y: BY,
      h: 6 - BY,
      floor: "concrete",
      wall: "brick_red",
      wc: [0.55, 0.36, 0.3],
      ceil: "plaster",
      cc: [0.4, 0.38, 0.34],
      trim: false,
      casing: false,
    });
    // landing at street level by the vestibule gap, then a flight down towards the west
    b.boxMM("concrete", -5.6, BY, -5, -4.1, 0, -3, {
      tint: [0.62, 0.6, 0.56],
      faces: "nsewt",
    });
    b.col(-5.6, BY, -5, -4.1, 0, -3, { tag: "landing" });
    K.stairs(b, -11.2, -5, -5.6, -3, BY, 0, "+x", {
      mat: "concrete",
      tint: [0.62, 0.6, 0.56],
      rail: "r",
      nosing: "steel",
    });
    K.railing(b, -5.6, -5, -4.1, -5, 0, { h: 1.0, col: true });
    K.railing(b, -11.2, -3, -5.6, -3, BY + 0.01, { h: 1.0, col: false });
    b.plate(
      "art",
      -11.88,
      BY + 3.0,
      -6.8,
      1,
      0,
      1.4,
      0.8,
      K.signCell("jmi_det", "WOMEN'S\nHOUSE OF\nDETENTION", 200, 120, {
        bg: "#e0d8c0",
        fg: "#8a1a10",
        font: "Arial Black, sans-serif",
      }),
    );
    K.lamp(b, -8, BY + 5.4, -4, "cage", [0.9, 0.9, 0.8], 0.9, 9, {
      ceil: 6,
      lightOpts: { box: SH },
    });
    K.lamp(b, -8, BY + 2.6, -6.2, "cage", [0.9, 0.9, 0.8], 0.6, 6, {
      ceil: BY + 3.2,
      lightOpts: { box: SH },
    });

    // ================================================================ DETENTION CORRIDOR + CELLS
    const DC = [-10.1, BY - 0.3, -31.1, 0.1, BY + 3.3, -6.9];
    K.room(b, ctx, {
      x0: -10,
      z0: -31,
      x1: -6,
      z1: -7,
      y: BY,
      h: 3.2,
      floor: "concrete",
      fc: [0.55, 0.53, 0.5],
      wall: "tile",
      wc: [0.62, 0.66, 0.6],
      wain: "paint_green",
      wainC: [0.3, 0.42, 0.34],
      wainH: 1.2,
      ceil: "concrete",
      cc: [0.4, 0.4, 0.38],
      open: { e: true },
      trim: false,
    });
    // close the corridor's east side where there are no cells
    for (const [za, zb] of [
      [-9, -7],
      [-31, -29],
    ]) {
      b.boxMM("tile", -6.1, BY, za, -5.9, BY + 3.2, zb, {
        tint: [0.62, 0.66, 0.6],
      });
      b.col(-6.1, BY, za, -5.9, BY + 3.2, zb, { tag: "wall" });
    }
    // guard post
    b.boxMM("metal", -9.9, BY, -12.4, -8.8, BY + 1.0, -10, {
      tint: [0.4, 0.44, 0.4],
    });
    b.col(-9.9, BY, -12.4, -8.8, BY + 1.0, -10, { tag: "counter" });
    K.terminal(
      ctx,
      "pv3_term_jm_detention",
      -9.35,
      BY + 1.0,
      -11.2,
      -HP,
      termDetention(),
      "desk",
    );
    b.plate(
      "art",
      -9.95,
      BY + 2.1,
      -14,
      1,
      0,
      1.2,
      0.8,
      K.signCell(
        "jmi_rules",
        "INMATES WILL\nNOT SPEAK TO\nTHE BAILIFF.\nTHE BAILIFF\nDOES NOT CARE.",
        180,
        140,
        { bg: "#1a1a1a", fg: "#d8d8c8", font: "Arial, sans-serif" },
      ),
    );
    // cells x −6..0, five of them, barred fronts on x = −6 (Fran's = cell 2, z −25..−21 → separate door group)
    const cellZ = [
      [-29, -25],
      [-25, -21],
      [-21, -17],
      [-17, -13],
      [-13, -9],
    ];
    const doorB = K.builder({
      name: "jm_celldoor",
      off: O,
      lit: true,
      amb: [0.1, 0.1, 0.1],
      grime: 0.3,
    });
    cellZ.forEach(([z0, z1], i) => {
      K.room(b, ctx, {
        x0: -6,
        z0,
        x1: 0,
        z1,
        y: BY,
        h: 3.2,
        floor: "concrete",
        fc: [0.5, 0.48, 0.45],
        wall: "plaster_stained",
        wc: [0.62, 0.6, 0.54],
        ceil: "concrete",
        cc: [0.38, 0.38, 0.36],
        open: { w: true },
        trim: false,
      });
      // bars: fixed panel (z0..z1−1.3) + door (last 1.3 m)
      const dz0 = z1 - 1.4,
        dz1 = z1 - 0.1;
      for (let z = z0 + 0.12; z < dz0; z += 0.14)
        b.cyl("black_iron", -6, BY, z, 0.018, 0.018, 3.2, 5, {
          tint: [0.22, 0.22, 0.22],
        });
      for (const y of [BY + 0.1, BY + 1.1, BY + 2.3, BY + 3.1])
        b.beam("black_iron", -6, y, z0, -6, y, z1, 0.05, 0.06, {
          tint: [0.22, 0.22, 0.22],
        });
      b.col(-6.05, BY, z0, -5.95, BY + 3.2, dz0, {
        tag: "bars",
        walkable: false,
        surface: "metal",
      });
      const db = i === 1 ? doorB : b;
      for (let z = dz0 + 0.07; z < dz1; z += 0.14)
        db.cyl("black_iron", -6.08, BY + 0.05, z, 0.018, 0.018, 2.4, 5, {
          tint: [0.22, 0.22, 0.22],
        });
      for (const y of [BY + 0.1, BY + 1.2, BY + 2.4])
        db.beam("black_iron", -6.08, y, dz0, -6.08, y, dz1, 0.05, 0.06, {
          tint: [0.22, 0.22, 0.22],
        });
      db.box("steel", -6.12, BY + 1.0, dz0 + 0.12, 0.08, 0.25, 0.14, {
        tint: [0.5, 0.5, 0.48],
      });
      if (i === 1)
        ctx.cellDoorCol = G.world.addBox(
          O.x - 6.15,
          O.y + BY,
          O.z + dz0,
          O.x - 5.95,
          O.y + BY + 2.5,
          O.z + dz1,
          { tag: "bars", walkable: false, surface: "metal" },
        );
      else
        b.col(-6.15, BY, dz0, -5.95, BY + 2.5, dz1, {
          tag: "bars",
          walkable: false,
          surface: "metal",
        });
      // cell furnishing: cot, bucket, scratched tally marks
      K.bed(b, -1.0, BY, (z0 + z1) / 2, 0, {
        w: 0.8,
        l: 1.9,
        tint: [0.5, 0.48, 0.42],
      });
      b.cyl("rust", -4.8, BY, z0 + 0.5, 0.18, 0.15, 0.32, 8, { top: false });
      b.plate(
        "decal",
        -0.12,
        BY + 1.5,
        z0 + 1.2,
        -1,
        0,
        1.0,
        0.6,
        K.tag("||||  ||||  |||", "#d8d0c0", 256, 96, { size: 0.5 }),
      );
      K.lamp(
        b,
        -3,
        BY + 2.9,
        (z0 + z1) / 2,
        "cage",
        [0.85, 0.85, 0.7],
        i === 1 ? 0.8 : i === 3 ? 0 : 0.45,
        5,
        {
          ceil: BY + 3.2,
          dead: i === 3,
          lightOpts: {
            box: [-6.1, BY - 0.3, z0 - 0.1, 0.1, BY + 3.3, z1 + 0.1],
          },
        },
      );
      if (i === 0 || i === 3)
        K.skel(ctx, -1.0, BY + 0.55, (z0 + z1) / 2, 0, "lying");
    });
    b.plate(
      "decal",
      -0.1,
      BY + 1.9,
      -18.5,
      -1,
      0,
      2.4,
      0.9,
      K.tag("NIGHT COURT = NO COURT", "#b01810", 384, 128),
    );
    // Fran's cell has a few personal touches: a pinned photo, a chalk calendar
    b.plate(
      "decal",
      -0.12,
      BY + 1.6,
      -23.2,
      -1,
      0,
      1.6,
      1.0,
      K.signCell("jmi_dotcal", "DAY 19\nSTILL NOT GUILTY", 256, 160, {
        bg: null,
        fg: "rgba(240,235,220,0.85)",
        font: "Arial, sans-serif",
        weather: false,
      }),
    );
    ctx.cellDoorGroup = doorB.finish(null);
    for (let z = -29; z < -9; z += 4.5)
      K.lamp(b, -8, BY + 2.9, z + 2, "tube", [0.85, 0.95, 0.85], 0.7, 6, {
        ceil: BY + 3.2,
        alongX: false,
        len: 1.2,
        dead: z === -20,
        lightOpts: { box: DC },
      });
    b.hplate("decal", -8, BY + 0.012, -20, 1.6, 2.4, 0.3, K.decal("blood", 4));

    // ================================================================ EVIDENCE ROOM
    const EV = [-10.1, BY - 0.3, -36.1, -1.9, BY + 3.3, -30.9];
    K.room(b, ctx, {
      x0: -10,
      z0: -36,
      x1: -2,
      z1: -31,
      y: BY,
      h: 3.2,
      floor: "concrete",
      wall: "concrete",
      wc: [0.6, 0.6, 0.56],
      ceil: "concrete",
      cc: [0.4, 0.4, 0.38],
      trim: false,
    });
    for (let k = 0; k < 3; k++)
      K.shelf(b, -9.5 + k * 2.4, BY, -35.6, 0, 2.0, {
        h: 2.4,
        mat: "metal",
        tint: [0.5, 0.52, 0.5],
        items: ["box", "box", "jar"],
        seed: 520 + k,
      });
    b.plate(
      "art",
      -6,
      BY + 2.6,
      -31.12,
      0,
      -1,
      2.4,
      0.4,
      K.signCell("jmi_evid", "EVIDENCE — CHAIN OF CUSTODY", 512, 72, {
        bg: "#e0d8c0",
        fg: "#1a1a1a",
        font: "Arial, sans-serif",
      }),
    );
    K.lamp(b, -6, BY + 2.9, -33.5, "tube", [0.85, 0.95, 0.85], 0.8, 6, {
      ceil: BY + 3.2,
      len: 1.2,
      lightOpts: { box: EV },
    });
    K.loot(ctx, "locker", -2.5, BY, -34.5, -HP, {
      items: [
        ["pv3_dots_effects", 1],
        ["scrip", 35],
      ],
      lock: LK.evidence,
      name: "Evidence Locker 67-0413",
      tag: "evidence",
    });
    K.loot(ctx, "locker", -2.5, BY, -33.4, -HP, {
      items: [
        ["pv3_key_jm_cells", 1],
        ["ammo_10mm", 12],
      ],
      lock: LK.spare,
      name: "Evidence Locker 66-9120",
    });
    K.loot(ctx, "ammo_box", -9, BY, -32, 0, {
      loot: "ammo_box",
      name: "Confiscated Ammunition",
    });
    K.note(ctx, "pv3_reel_jm_evidence", -6.4, BY + 1.05, -35.4, {
      type: "tape",
      name: "Tape Reel: Exhibit C",
      title: "People v. Zielinski — Exhibit C",
      text: "[Recorded by BAILIFF-BOT 2, 1989, night patrol]\n\nBAILIFF: Halt. It is 22:14. Curfew under Local Law 9 of 1957 began at 22:00.\n\nFRAN: Curfew? Pal, there hasn't been a city in twenty-two years.\n\nBAILIFF: Ignorance of the law is no excuse. You have the right to remain silent.\n\nFRAN: I've got the right to a drink at Bedford's, is what I've got—\n\nBAILIFF: Resisting noted. Charge amended.\n\n[Sound of a very large robot arm. End of exhibit.]",
    });

    // ================================================================ CLOCK TOWER (separate block in the cell)
    const TX = TWR.x,
      TY = TWR.y,
      TZ = TWR.z;
    const TW = [TX - 4.1, TY - 2.8, TZ - 4.1, TX + 4.1, TY + 9, TZ + 4.1];
    // clock room: floor at TY−2.5, 5.6 m high
    K.room(b, ctx, {
      x0: TX - 4,
      z0: TZ - 4,
      x1: TX + 4,
      z1: TZ + 4,
      y: TY - 2.5,
      h: 5.6,
      floor: "wood",
      fc: [0.5, 0.42, 0.32],
      wall: "brick_red",
      wc: [0.55, 0.36, 0.3],
      noCeil: true,
      trim: false,
      casing: false,
      surface: "wood",
    });
    // the four dials from behind: translucent glass discs glowing with daylight, iron spokes, hands reversed
    for (const [nx, nz] of [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ]) {
      const cx = TX + nx * 3.88,
        cz = TZ + nz * 3.88;
      b.geo("lamp", new THREE.CircleGeometry(1.6, 28), {
        x: cx,
        y: TY,
        z: cz,
        ry: Math.atan2(-nx, -nz),
        tint: [0.78, 0.72, 0.56],
      });
      b.geo("black_iron", new THREE.TorusGeometry(1.62, 0.07, 5, 28), {
        x: cx - nx * 0.02,
        y: TY,
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
          TY,
          cz - nz * 0.03,
          cx - nx * 0.03 + rx * Math.cos(a) * 1.6,
          TY + Math.sin(a) * 1.6,
          cz - nz * 0.03 + rz * Math.cos(a) * 1.6,
          0.025,
          0.025,
        );
      }
      // hands (9:47 seen from the back = mirrored)
      const rx = -nz,
        rz = nx;
      const ha = -((9 + 47 / 60) / 12) * PI * 2 + HP,
        ma = -(47 / 60) * PI * 2 + HP;
      b.beam(
        "paint_black",
        cx - nx * 0.05,
        TY,
        cz - nz * 0.05,
        cx - nx * 0.05 - rx * Math.cos(ha) * 0.8,
        TY + Math.sin(ha) * 0.8,
        cz - nz * 0.05 - rz * Math.cos(ha) * 0.8,
        0.09,
        0.03,
      );
      b.beam(
        "paint_black",
        cx - nx * 0.05,
        TY,
        cz - nz * 0.05,
        cx - nx * 0.05 - rx * Math.cos(ma) * 1.25,
        TY + Math.sin(ma) * 1.25,
        cz - nz * 0.05 - rz * Math.cos(ma) * 1.25,
        0.06,
        0.03,
      );
      b.light(cx - nx * 1.2, TY, cz - nz * 1.2, [0.85, 0.78, 0.58], 0.9, 6, {
        box: TW,
      });
      b.glow(cx - nx * 0.2, TY, cz - nz * 0.2, [0.6, 0.5, 0.3], 3.6);
      // drive rods from the central works to each dial
      b.pipe("steel", TX, TY, TZ, cx - nx * 0.1, TY, cz - nz * 0.1, 0.03, 5);
    }
    // the clock works: cast-iron flatbed frame, gears, escapement, pendulum through the floor slot
    b.boxMM(
      "cast_iron",
      TX - 0.9,
      TY - 2.5,
      TZ - 0.6,
      TX + 0.9,
      TY - 1.4,
      TZ + 0.6,
      { tint: [0.24, 0.26, 0.24], faces: "nsewt" },
    );
    b.col(TX - 0.9, TY - 2.5, TZ - 0.6, TX + 0.9, TY - 1.2, TZ + 0.6, {
      tag: "machine",
      surface: "metal",
    });
    for (const s of [-1, 1])
      b.beam(
        "cast_iron",
        TX + s * 0.8,
        TY - 1.4,
        TZ,
        TX + s * 0.5,
        TY + 0.2,
        TZ,
        0.12,
        0.12,
        { tint: [0.24, 0.26, 0.24] },
      );
    b.beam(
      "cast_iron",
      TX - 0.6,
      TY + 0.2,
      TZ,
      TX + 0.6,
      TY + 0.2,
      TZ,
      0.14,
      0.14,
      { tint: [0.24, 0.26, 0.24] },
    );
    K.gearWheel(b, TX - 0.35, TY - 0.8, TZ, 0.5, 0.06, 28, {
      tint: [0.7, 0.55, 0.3],
    });
    K.gearWheel(b, TX + 0.3, TY - 0.5, TZ + 0.2, 0.28, 0.06, 16, {
      tint: [0.7, 0.55, 0.3],
    });
    K.gearWheel(b, TX + 0.1, TY - 1.1, TZ - 0.3, 0.2, 0.05, 12, {
      tint: [0.65, 0.5, 0.28],
    });
    b.pipe("steel", TX, TY + 0.2, TZ, TX, TY - 2.5, TZ + 0.9, 0.02, 4); // pendulum rod (stopped, off-plumb)
    b.geo("brass", new THREE.CylinderGeometry(0.28, 0.28, 0.08, 16), {
      x: TX,
      y: TY - 2.3,
      z: TZ + 0.95,
      rx: HP,
      tint: [0.7, 0.55, 0.3],
    });
    b.plate(
      "art",
      TX - 0.92,
      TY - 1.9,
      TZ,
      -1,
      0,
      1.0,
      0.35,
      K.signCell("jmi_clockmaker", "E. HOWARD & CO. · BOSTON", 256, 64, {
        bg: "#1e2a1e",
        fg: "#d8c070",
        font: "Georgia, serif",
      }),
    );
    // ladder up to the belfry hatch (tower-top door)
    for (const s of [-0.22, 0.22])
      b.beam(
        "rust",
        TX + 3.4 + s,
        TY - 2.5,
        TZ - 3.3,
        TX + 3.4 + s,
        TY + 3.1,
        TZ - 3.3,
        0.05,
        0.05,
      );
    for (let y = TY - 2.2; y < TY + 3; y += 0.3)
      b.beam(
        "rust",
        TX + 3.18,
        y,
        TZ - 3.3,
        TX + 3.62,
        y,
        TZ - 3.3,
        0.03,
        0.03,
      );
    b.boxMM("wood", TX - 4, TY + 3.1, TZ - 4, TX + 4, TY + 3.3, TZ + 4, {
      tint: [0.4, 0.34, 0.26],
      faces: "b",
    });
    // the fire watchman's last post
    K.bed(b, TX - 3.1, TY - 2.5, TZ + 2.4, HP, {
      w: 0.8,
      l: 1.9,
      tint: [0.45, 0.42, 0.36],
    });
    const wt = K.table(b, TX - 2.8, TY - 2.5, TZ - 2.6, 1.0, 0.7, {
      mat: "wood",
      tint: [0.5, 0.4, 0.3],
    });
    K.chair(b, TX - 2.0, TY - 2.5, TZ - 2.6, -HP, { mat: "wood" });
    b.cyl("rust", TX - 3.0, wt, TZ - 2.5, 0.08, 0.1, 0.12, 8);
    K.skel(ctx, TX - 2.0, TY - 2.5, TZ - 2.6, -HP, "sitting");
    K.note(ctx, "pv3_note_jm_watchman", TX - 2.9, wt + 0.01, TZ - 2.8, {
      name: "Fire Watchman's Log",
      title: "Log book, Jefferson Market fire lookout",
      text: "Sunday, March 5, 1967.\n09:30 — Sky grey, old snow in the gutters. Church bells for the ten o'clock. Air-raid sirens under them. Robot judge downstairs arraigning pigeons again.\n09:47 — Flash to the north, past Harlem, out over the Bronx. Then the whole sky. Clock stopped. I think the pulse did it.\n09:50 — Rang the bell. Nobody came. Rang it again.\n\nIt is a fire bell. The Bronx is a fire now, and Harlem after it. I will keep ringing it until my arms give out, because that is the job.\n\n(The rest of the page is scorched.)",
    });
    K.loot(ctx, "footlocker", TX + 2.6, TY - 2.5, TZ + 2.8, PI, {
      items: [
        ["pv3_spyglass", 1],
        ["purified_water", 2],
      ],
      name: "Watchman's Footlocker",
    });
    K.lamp(b, TX + 1.5, TY + 2.2, TZ + 1.5, "cage", bulb, 0.5, 5, {
      ceil: TY + 3.1,
      lightOpts: { box: TW },
    });

    // belfry above (reached by the hatch door): the fire bell and louvred openings
    const BF = [TX - 4.1, TY + 3.2, TZ - 4.1, TX + 4.1, TY + 9, TZ + 4.1];
    K.room(b, ctx, {
      x0: TX - 4,
      z0: TZ - 4,
      x1: TX + 4,
      z1: TZ + 4,
      y: TY + 3.3,
      h: 5,
      floor: "wood",
      fc: [0.45, 0.38, 0.3],
      wall: "brick_red",
      wc: [0.55, 0.36, 0.3],
      ceil: "wood_rotten",
      cc: [0.35, 0.3, 0.24],
      trim: false,
      casing: false,
      surface: "wood",
    });
    for (const [nx, nz] of [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ]) {
      for (const s of [-1, 1]) {
        const rx = nz,
          rz = -nx,
          px = TX + nx * 3.88 + rx * s * 1.75,
          pz = TZ + nz * 3.88 + rz * s * 1.75;
        for (let k = 0; k < 8; k++) {
          const y = TY + 4.0 + k * 0.42;
          b.plate(
            "lamp",
            px - nx * 0.02,
            y,
            pz - nz * 0.02,
            -nx,
            -nz,
            1.5,
            0.07,
            null,
            { tint: [0.55, 0.6, 0.62] },
          );
          b.box(
            "wood_rotten",
            px - nx * 0.06,
            y - 0.12,
            pz - nz * 0.06,
            Math.abs(rx) * 1.6 + 0.12,
            0.05,
            Math.abs(rz) * 1.6 + 0.12,
            { tint: [0.3, 0.26, 0.2] },
          );
        }
        b.light(px - nx * 1.2, TY + 5.5, pz - nz * 1.2, day, 0.5, 5, {
          box: BF,
        });
      }
    }
    b.beam(
      "wood_dark",
      TX - 3.9,
      TY + 7.4,
      TZ,
      TX + 3.9,
      TY + 7.4,
      TZ,
      0.3,
      0.3,
      { tint: panel },
    );
    b.geo(
      "bronze",
      new THREE.LatheGeometry(
        [
          new THREE.Vector2(0.05, 0),
          new THREE.Vector2(0.95, 0),
          new THREE.Vector2(0.85, 0.2),
          new THREE.Vector2(0.6, 0.8),
          new THREE.Vector2(0.55, 1.3),
          new THREE.Vector2(0.3, 1.5),
          new THREE.Vector2(0.05, 1.55),
        ],
        16,
      ),
      { x: TX, y: TY + 5.6, z: TZ, tint: [0.55, 0.45, 0.28] },
    );
    b.pipe("bronze", TX, TY + 7.2, TZ, TX, TY + 7.3, TZ, 0.1, 6);
    b.geo("bronze", K.sphereGeo(), {
      x: TX,
      y: TY + 5.7,
      z: TZ,
      s: 0.12,
      tint: [0.4, 0.34, 0.22],
    });
    b.pipe(
      "fabric",
      TX + 0.4,
      TY + 6.4,
      TZ,
      TX + 1.2,
      TY + 3.4,
      TZ + 0.6,
      0.025,
      4,
      { tint: [0.6, 0.55, 0.42] },
    ); // the bell rope
    b.col(TX - 0.9, TY + 5.6, TZ - 0.9, TX + 0.9, TY + 7.2, TZ + 0.9, {
      tag: "bell",
      walkable: false,
      surface: "metal",
    });
    b.plate(
      "art",
      TX - 3.88,
      TY + 4.8,
      TZ,
      1,
      0,
      1.6,
      0.6,
      K.signCell("jmi_firebell", "FIRE BELL\n2 RINGS = 2nd DISTRICT", 256, 96, {
        bg: "#8a1a10",
        fg: "#f0e0c0",
        font: "Georgia, serif",
      }),
    );
    ctx.bellPos = K.world(ctx, TX + 1.2, TY + 4.3, TZ + 0.6);

    // ================================================================ doors & anchors
    const OX = O.x,
      OY = O.y,
      OZ = O.z;
    const D = PV.JM_DOOR;
    // the way out reads as a door: oak double doors, daylit frosted glass + transom, a red EXIT sign
    K.exitDoor(b, 0, 0, 0, 0, -1, 1.8, 2.9, {
      leaves: 2,
      glass: true,
      transom: "WEST 8TH STREET",
      sign: "EXIT",
      tint: [0.3, 0.18, 0.1],
      day: [0.92, 0.9, 0.8],
      lightBox: [-4.1, -0.3, -7.1, 4.1, 6.2, 0.1],
    });
    K.door(ctx, {
      id: "pv3_jm_in",
      pos: new THREE.Vector3(D.x, 1.5, D.z + 0.35),
      label: "Jefferson Market Courthouse",
      verb: "Enter",
      target: { x: OX, y: OY, z: OZ - 1.3, yaw: 0 },
      onEnter: () => {
        K.safe("disc", () => G.discover("jefferson_market"));
        PV.onEnter && PV.onEnter("jefferson_market");
      },
    });
    K.door(ctx, {
      id: "pv3_jm_out",
      pos: new THREE.Vector3(OX, OY + 1.4, OZ - 0.3),
      label: "West 8th Street",
      verb: "Leave",
      target: { x: D.x, y: 0.45, z: D.z + 1.4, yaw: PI },
    });
    // tower stair (a tight spiral in the east bay) ↔ clock room ↔ belfry hatch
    K.room(b, ctx, {
      x0: 4,
      z0: -7,
      x1: 8,
      z1: -1,
      y: 0,
      h: 6,
      floor: "concrete",
      wall: "brick_red",
      wc: [0.55, 0.36, 0.3],
      ceil: "plaster",
      cc: [0.4, 0.38, 0.34],
      trim: false,
    });
    for (let k = 0; k < 14; k++) {
      const a = k * 0.5,
        y = k * 0.22;
      b.box(
        "limestone",
        6 + Math.cos(a) * 0.8,
        y,
        -4 + Math.sin(a) * 0.8,
        1.2,
        0.2,
        0.5,
        { yaw: -a, tint: [0.7, 0.66, 0.6] },
      );
    }
    b.cyl("limestone", 6, 0, -4, 0.2, 0.2, 5.9, 8, { tint: [0.7, 0.66, 0.6] });
    b.col(5.0, 0, -5, 7.0, 3.2, -3, { tag: "stair", walkable: false });
    K.lamp(b, 5, 4.8, -6, "cage", bulb, 0.6, 5, {
      ceil: 6,
      lightOpts: { box: [3.9, -0.3, -7.1, 8.1, 6.1, -0.9] },
    });
    K.door(ctx, {
      id: "pv3_jm_tower_up",
      pos: new THREE.Vector3(OX + 6, OY + 1.2, OZ - 5.3),
      label: "Tower Stairs",
      verb: "Climb",
      sound: "footstep_wood",
      target: {
        x: OX + TX + 2.4,
        y: OY + TY - 2.5,
        z: OZ + TZ + 2.8,
        yaw: Math.atan2(2.4, 2.8),
      },
    }); // arrive facing the clock works
    K.door(ctx, {
      id: "pv3_jm_tower_down",
      pos: new THREE.Vector3(OX + TX + 3.1, OY + TY - 1.3, OZ + TZ + 3.6),
      label: "Tower Stairs (down)",
      verb: "Descend",
      sound: "footstep_wood",
      target: { x: OX + 4.55, y: OY, z: OZ - 4.0, yaw: HP },
    }); // arrive at the stair foot facing out through the doorway into the vestibule
    K.door(ctx, {
      id: "pv3_jm_belfry_up",
      pos: new THREE.Vector3(OX + TX + 3.4, OY + TY + 1.8, OZ + TZ - 3.1),
      label: "Belfry Hatch",
      verb: "Climb",
      sound: "footstep_wood",
      target: { x: OX + TX + 2.2, y: OY + TY + 3.3, z: OZ + TZ - 2.2, yaw: HP },
    });
    K.door(ctx, {
      id: "pv3_jm_belfry_down",
      pos: new THREE.Vector3(OX + TX + 3.3, OY + TY + 3.9, OZ + TZ - 3.3),
      label: "Belfry Hatch (down)",
      verb: "Descend",
      sound: "footstep_wood",
      target: { x: OX + TX + 2.6, y: OY + TY - 2.5, z: OZ + TZ - 2.4, yaw: HP },
    });

    K.anchor(ctx, "entrance", 0, 0, -1.3);
    K.anchor(ctx, "judge", 0, 0.9, -25.4);
    K.anchor(ctx, "bailiff1", -5.5, 0, -22.5);
    K.anchor(ctx, "bailiff2", 0, 0, -14.0);
    K.anchor(ctx, "stenographer", -2.2, 1.8, -23);
    K.anchor(ctx, "guard_post", -8.2, BY, -11.2);
    K.anchor(ctx, "dot_cell", -2.6, BY, -23);
    K.anchor(ctx, "dot_door", -6.2, BY + 1.2, -22.2);
    K.anchor(ctx, "witness", 6.1, 0, -22.3);
    K.anchor(ctx, "bell", TX, TY + 3.3, TZ);
    [
      [0, 0, -12],
      [-5, 0, -20],
      [5, 0, -12],
      [12, 0, -12],
      [-8, BY, -20],
      [-8, BY, -28],
    ].forEach((p, i) => K.anchor(ctx, "spawn" + (i + 1), p[0], p[1], p[2]));
    K.anchor(ctx, "loot1", 11.2, 0, -14.6);
    K.anchor(ctx, "loot2", 9.5, 0, -18.2);
    K.anchor(ctx, "loot3", -2.5, BY, -34.5);
    K.anchor(ctx, "loot4", TX + 2.6, TY - 2.5, TZ + 2.8);
    ctx.intRoot = b.finish(null);
    ctx.intRoot.name = "poi_jefferson_market_int";
    ctx.intRoot.add(ctx.cellDoorGroup);
  }

  // ---------------------------------------------------------------- terminals
