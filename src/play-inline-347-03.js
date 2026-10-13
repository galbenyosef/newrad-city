// play-inline-347 03 — gal
// Lines 198-2558 of readable/play-inline-347.pretty.js (statement-aligned).
  function interior(ctx) {
    const O = ctx.O;
    const b = K.builder({
      name: "mb_int",
      off: O,
      lit: true,
      amb: [0.14, 0.13, 0.13],
      floors: [0, GAL],
      grime: 0.5,
    });
    const r = K.rng("mb_int");
    const fl = (mat, x0, z0, x1, z1, y, tint, surface) => {
      b.face(mat, x0, y, z1, 1, 0, 0, 0, 0, -1, x1 - x0, z1 - z0, {
        uv: "top",
        tint,
      });
      b.col(x0, y - 0.3, z0, x1, y, z1, {
        tag: "floor",
        surface: surface || "concrete",
      });
    };

    // ================= LOBBY =================
    const LB = [-12.1, -0.3, -14.1, 12.1, 8.5, 0.1];
    K.gap(ctx, 0, -14, 3.2, 0, 4.2); // → hall of records
    K.gap(ctx, -12, -7, 2.0, 0, 3.0); // → chapel
    K.gap(ctx, 12, -6, 2.0, 0, 3.0); // → service corridor
    K.gap(ctx, 12, -2.9, 0.72, 0, 2.6, { casing: false }); // jammed elevator door → the empty shaft
    K.room(b, ctx, {
      x0: -12,
      z0: -14,
      x1: 12,
      z1: 0,
      y: 0,
      h: 5.2,
      floor: "marble",
      fc: [0.66, 0.63, 0.58],
      wall: "marble",
      wc: [0.62, 0.58, 0.52],
      ceil: "plaster",
      noCeil: true,
      trimMat: "bronze",
    });
    barrelX(
      b,
      -11.9,
      11.9,
      -7,
      6.9,
      5.2,
      3.2,
      "guastavino",
      [0.85, 0.72, 0.6],
      12,
    );
    for (const x of [-12, 12]) {
      const n = x < 0 ? 1 : -1;
      for (let i = 0; i < 12; i++) {
        const a0 = (i / 12) * PI,
          a1 = ((i + 1) / 12) * PI;
        const p = (a, y0) => [
          x,
          y0 === undefined ? 5.2 + Math.sin(a) * 3.2 : y0,
          -7 + Math.cos(a) * 7,
        ];
        b.quadN("marble", p(a0, 5.2), p(a1, 5.2), p(a1), p(a0), [n, 0, 0], {
          tint: [0.6, 0.56, 0.5],
        });
      }
    }
    for (const x of [-6, 0, 6]) {
      let prev = null;
      for (let i = 0; i <= 12; i++) {
        const a = (i / 12) * PI,
          p = [x, 5.2 + Math.sin(a) * 3.1, -7 + Math.cos(a) * 6.9];
        if (prev)
          b.beam(
            "guastavino",
            prev[0],
            prev[1],
            prev[2],
            p[0],
            p[1],
            p[2],
            0.4,
            0.2,
            { tint: [0.6, 0.45, 0.35] },
          );
        prev = p;
      }
    }
    // elevator bank (east wall) — four bronze doors with dial indicators
    for (let k = 0; k < 4; k++) {
      const ez = -12 + k * 2.6 + 1.3;
      if (Math.abs(ez + 6) < 1.4) continue;
      if (k === 3) {
        // pried half open by someone who wanted to go up — the car is forty storeys of nothing below
        b.boxMM("bronze", 11.82, 0, ez - 0.78, 11.95, 2.6, ez - 0.36, {
          tint: [0.4, 0.32, 0.22],
        });
        b.boxMM("bronze", 11.82, 0, ez + 0.36, 11.95, 2.6, ez + 0.78, {
          tint: [0.4, 0.32, 0.22],
        });
      } else {
        b.boxMM("bronze", 11.82, 0, ez - 0.7, 11.95, 2.6, ez + 0.7, {
          tint: [0.4, 0.32, 0.22],
        });
        b.boxMM("paint_black", 11.8, 0, ez - 0.02, 11.83, 2.6, ez + 0.02, {
          tint: [0.05, 0.05, 0.05],
        });
      }
      b.geo("brass", new THREE.CircleGeometry(0.3, 14, 0, PI), {
        x: 11.8,
        y: 2.8,
        z: ez,
        ry: -HP,
        tint: [0.6, 0.48, 0.28],
      });
      b.beam(
        "paint_black",
        11.78,
        2.8,
        ez,
        11.78,
        3.0,
        ez + (r() - 0.5) * 0.5,
        0.02,
        0.02,
      );
    }
    b.plate(
      "art",
      11.86,
      3.6,
      -9.5,
      -1,
      0,
      2.2,
      0.4,
      K.signCell("pc_mb_elev", "ELEVATORS · OUT OF ORDER", 384, 64, {
        bg: "#1a1a1a",
        fg: "#e8e0c8",
      }),
    );
    // directory, info booth, flags, barricade of desks
    b.plate("art", -11.86, 2.6, -11.2, 1, 0, 1.6, 2.1, directory());
    b.boxMM("marble", -2.4, 0, -8.4, 2.4, 1.1, -6.6, {
      tint: [0.45, 0.4, 0.36],
    });
    b.boxMM("marble", -2.5, 1.1, -8.5, 2.5, 1.18, -6.5, {
      tint: [0.7, 0.66, 0.6],
    });
    b.col(-2.5, 0, -8.5, 2.5, 1.18, -6.5, { tag: "counter" });
    // info booth dressing: bronze kick plate & ribs, the INFORMATION sign on bronze stanchions, and a
    // four-faced opal clock on a brass column — stopped at 9:47, March 5th.
    b.boxMM("bronze", -2.46, 0, -8.46, 2.46, 0.16, -6.54, {
      tint: [0.3, 0.24, 0.16],
    });
    for (let k = -3; k <= 3; k++) {
      b.box("bronze", k * 0.72, 0.16, -6.55, 0.06, 0.94, 0.04, {
        tint: [0.42, 0.33, 0.2],
      });
      b.box("bronze", k * 0.72, 0.16, -8.45, 0.06, 0.94, 0.04, {
        tint: [0.42, 0.33, 0.2],
      });
    }
    for (const sx of [-1.05, 1.05])
      b.pipe("bronze", sx, 1.18, -6.62, sx, 1.84, -6.62, 0.025, 6, {
        tint: [0.45, 0.35, 0.2],
      });
    b.boxMM("bronze", -1.15, 1.4, -6.66, 1.15, 1.8, -6.58, {
      tint: [0.3, 0.24, 0.16],
    });
    b.plate(
      "art",
      0,
      1.6,
      -6.55,
      0,
      1,
      2.2,
      0.36,
      K.signCell("pc_mb_info", "INFORMATION", 256, 44, {
        bg: "#1a1a1a",
        fg: "#d8c088",
        font: "Georgia, serif",
      }),
    );
    {
      const clock = K.paint(
        "art",
        "pc_mb_clock",
        128,
        128,
        function (x, X, Y, W, H) {
          x.clearRect(X, Y, W, H);
          const cx = X + W / 2,
            cy = Y + H / 2,
            R0 = W * 0.48;
          x.fillStyle = "#6a5228";
          x.beginPath();
          x.arc(cx, cy, R0, 0, 6.3);
          x.fill();
          const g = x.createRadialGradient(cx, cy, 0, cx, cy, R0 * 0.9);
          g.addColorStop(0, "#f4ecd8");
          g.addColorStop(1, "#c8bca0");
          x.fillStyle = g;
          x.beginPath();
          x.arc(cx, cy, R0 * 0.88, 0, 6.3);
          x.fill();
          x.fillStyle = "#1a1612";
          for (let k = 0; k < 60; k++) {
            const a = (k / 60) * PI * 2,
              l = k % 5 ? 0.06 : 0.14;
            x.save();
            x.translate(cx, cy);
            x.rotate(a);
            x.fillRect(
              -(k % 5 ? 0.6 : 1.4),
              -R0 * 0.84,
              k % 5 ? 1.2 : 2.8,
              R0 * l,
            );
            x.restore();
          }
          const hand = (a, len, wd) => {
            x.save();
            x.translate(cx, cy);
            x.rotate(a);
            x.fillRect(-wd / 2, -R0 * len, wd, R0 * len);
            x.restore();
          };
          hand(((9 + 47 / 60) / 12) * PI * 2, 0.5, 4);
          hand((47 / 60) * PI * 2, 0.74, 2.6);
          x.beginPath();
          x.arc(cx, cy, 3, 0, 6.3);
          x.fill();
          K.stains(
            x,
            X + W * 0.15,
            Y + H * 0.15,
            W * 0.7,
            H * 0.7,
            4,
            947,
            0.3,
            [80, 60, 30],
          );
        },
      );
      const CX = 0,
        CZ = -7.5,
        CY = 2.95;
      b.cyl("brass", CX, 1.18, CZ, 0.16, 0.12, 0.2, 10, {
        tint: [0.6, 0.46, 0.24],
      });
      b.cyl("brass", CX, 1.38, CZ, 0.06, 0.05, CY - 1.7, 8, {
        tint: [0.6, 0.46, 0.24],
      });
      b.geo("brass", K.sphereGeo(), {
        x: CX,
        y: CY,
        z: CZ,
        s: 0.33,
        tint: [0.5, 0.4, 0.22],
      }); // opal globe (dim)
      for (let k = 0; k < 4; k++) {
        const a = k * HP,
          nx = Math.sin(a),
          nz = Math.cos(a);
        b.plate(
          "art",
          CX + nx * 0.3,
          CY,
          CZ + nz * 0.3,
          nx,
          nz,
          0.46,
          0.46,
          clock,
          { tint: [0.95, 0.92, 0.84], off: 0.05 },
        );
      }
      b.cyl("brass", CX, CY + 0.3, CZ, 0.05, 0.02, 0.26, 8, {
        tint: [0.6, 0.46, 0.24],
      });
      b.geo("brass", K.sphereGeo(), {
        x: CX,
        y: CY + 0.6,
        z: CZ,
        s: 0.06,
        tint: [0.62, 0.48, 0.26],
      });
      b.cyl("brass", CX, CY - 0.38, CZ, 0.12, 0.2, 0.08, 10, {
        tint: [0.6, 0.46, 0.24],
      });
    }
    for (const [x, z, yaw] of [
      [-7.5, -11.6, 0.3],
      [-5.3, -11.3, -0.2],
      [6.2, -11.8, 0.1],
      [8.4, -11.4, -0.4],
    ]) {
      K.table(b, x, 0, z, 1.8, 0.8, {
        mat: "wood_dark",
        yaw,
        h: 0.76,
        col: true,
      });
      b.box("wood_dark", x, 0.76, z + 0.4, 1.8, 0.5, 0.06, {
        yaw,
        tint: [0.4, 0.28, 0.18],
      });
    }
    for (let x = -9; x < 9.5; x += 0.8)
      if (Math.abs(x) > 1.8)
        b.beam(
          "rust",
          x,
          0,
          -12.2,
          x + 0.1,
          1.6 + r() * 0.8,
          -12.5,
          0.05,
          0.05,
        );
    b.plate(
      "decal",
      -6.5,
      3.0,
      -13.88,
      0,
      1,
      4,
      1.2,
      K.tag("HALL OF MEAT", "#e03030", 512, 128),
    );
    b.plate("art", 0, 4.6, -13.86, 0, 1, 6.2, 1.1, deedSign());
    K.lamp(b, 0, 6.6, -7, "globe", WARM, 0.9, 12, {
      ceil: 8.4,
      size: 0.4,
      lightOpts: { box: LB },
    });
    for (const x of [-8, 8])
      K.lamp(b, x, 5.4, -7, "globe", WARM, x > 0 ? 0 : 0.45, 7, {
        ceil: 7.2,
        size: 0.28,
        dead: x > 0,
        lightOpts: { box: LB },
      });
    b.light(0, 2, -1.5, COOL, 0.35, 6, { box: LB });
    for (let k = 0; k < 6; k++)
      b.hplate(
        "decal",
        -10 + r() * 20,
        0.012 + k * 0.001,
        -13 + r() * 12,
        1 + r(),
        1 + r(),
        r() * 6,
        K.decal(k % 3 ? "grime" : "blood", k + 90),
      );
    K.litter(b, -11.5, -13.5, 11.5, -0.5, 0, 26, 91);
    // the exit (bronze doors to the arch)
    K.doorway(b, 0, 0, -0.1, 0, -1, {
      w: 3.2,
      h: 3.4,
      transom: 0.7,
      mat: "bronze",
      frame: "marble",
      frameTint: [0.6, 0.56, 0.5],
      glow: [0.85, 0.9, 1.0],
      glowI: 0.6,
      exit: "EXIT",
      lightBox: LB,
    });

    // ================= MARRIAGE LICENSE BUREAU (chapel) =================
    const CHB = [-22.1, -0.3, -12.1, -11.9, 4.6, -1.9];
    K.room(b, ctx, {
      x0: -22,
      z0: -12,
      x1: -12,
      z1: -2,
      y: 0,
      h: 4.4,
      floor: "carpet",
      fc: [0.5, 0.35, 0.4],
      wall: "plaster",
      wc: [0.82, 0.78, 0.7],
      wain: "oak_panel",
      wainC: [0.62, 0.46, 0.3],
      wainH: 1.0,
      ceil: "plaster",
      cc: [0.7, 0.66, 0.6],
      cornice: true,
      surface: "carpet",
    });
    b.plate(
      "art",
      -12.12,
      3.4,
      -7,
      -1,
      0,
      2.4,
      0.4,
      K.signCell("pc_mb_marriage", "MARRIAGE LICENSE BUREAU", 384, 60, {
        bg: "#e8e0cc",
        fg: "#6a3a2a",
        font: "Georgia, serif",
      }),
    );
    // wedding arch at the west end + the couple
    for (const s of [-1, 1])
      b.pipe(
        "paint_white",
        -20.6,
        0,
        -7 + s * 1.2,
        -20.6,
        2.4,
        -7 + s * 1.2,
        0.05,
        6,
        { tint: [0.85, 0.82, 0.75] },
      );
    for (let k = 0; k <= 10; k++) {
      const a = (k / 10) * PI;
      b.geo("flat", K.sphereGeo(), {
        x: -20.6,
        y: 2.4 + Math.sin(a) * 1.2,
        z: -7 + Math.cos(a) * 1.2,
        s: 0.16,
        tint: r.pick([
          [0.45, 0.32, 0.28],
          [0.55, 0.5, 0.4],
          [0.35, 0.3, 0.22],
        ]),
      });
    }
    b.boxMM("oak_panel", -21.8, 0, -7.8, -21.0, 1.1, -6.2, {
      tint: [0.55, 0.4, 0.26],
    });
    b.col(-21.8, 0, -7.8, -21.0, 1.1, -6.2, {});
    K.skel(ctx, -19.6, 0, -7.6, HP, "lying", { name: "The Bride" });
    K.skel(ctx, -19.4, 0, -6.4, HP - 0.3, "lying", { name: "The Groom" });
    b.geo("cloth_white", K.sphereGeo(), {
      x: -19.2,
      y: 0.12,
      z: -7.8,
      sx: 0.8,
      sy: 0.12,
      sz: 0.5,
      tint: [0.8, 0.78, 0.72],
    }); // the veil & train
    b.hplate("decal", -19.8, 0.015, -7, 1.2, 1.2, 0.4, K.decal("scorch", 12));
    for (let row = 0; row < 3; row++)
      for (const s of [-1, 1]) {
        const cz = -7 + s * 2.4,
          cx = -16.5 + row * 1.6;
        b.box("oak_panel", cx, 0, cz, 0.5, 0.45, 2.6, {
          tint: [0.55, 0.4, 0.26],
        });
        b.box("oak_panel", cx + 0.22, 0.45, cz, 0.06, 0.5, 2.6, {
          tint: [0.55, 0.4, 0.26],
        });
        b.col(cx - 0.25, 0, cz - 1.3, cx + 0.25, 0.45, cz + 1.3, {
          tag: "furniture",
        });
      }
    b.plate(
      "art",
      -21.86,
      2.6,
      -4,
      1,
      0,
      1.4,
      1.0,
      K.signCell("pc_mb_just", "JUST MARRIED\n3 · 5 · 67", 256, 180, {
        bg: "#e8e0cc",
        fg: "#8a2a2a",
        font: "Georgia, serif",
        italic: true,
      }),
    );
    K.lamp(b, -17, 3.4, -7, "pendant", [1, 0.8, 0.55], 0.55, 7, {
      ceil: 4.4,
      shade: "paint_cream",
      lightOpts: { box: CHB },
    });
    b.light(-20.6, 1.2, -7, [1, 0.62, 0.35], 0.35, 3, { box: CHB });
    K.note(ctx, "pc_mb_note_license", -21.4, 1.12, -7, {
      type: "note",
      name: "Marriage License No. 67-03-05-0412",
      title: "City of New York — Certificate & Record of Marriage",
      text: "CERTIFICATE AND RECORD OF MARRIAGE\nNo. 67-03-05-0412\n\nGROOM: Walter J. Szymanski, 34, pipe fitter\nBRIDE: Rosalind Nnamdi, 31, Civil Defense receptionist\nDATE: Sunday, March 5, 1967 · 9:41 A.M. (servicemen's Sunday hours)\nOFFICIANT: Deputy Clerk H. Abernathy\n\nWITNESSES: \"the Clerk's Patrolman\" (signed with a thumbprint of motor oil) and \"everybody running past in the hall.\"\n\nCLERK'S NOTE, in a shaking hand: They wouldn't leave. I told them the sirens were real. Rosalind said she'd waited six years for Walter to ask and she wasn't waiting for a war. I stamped it. It's the last thing I ever stamped. Good luck, you two.",
    });

    // ================= HALL OF RECORDS =================
    const HX0 = -16,
      HX1 = 16,
      HZ0 = -46,
      HZ1 = -14,
      HH = 14;
    const HB = [HX0 - 0.1, -0.3, HZ0 - 0.1, HX1 + 0.1, HH + 0.5, HZ1 + 0.1];
    K.gap(ctx, HX1, -30, 1.6, GAL, 2.5); // east gallery → offices
    K.room(b, ctx, {
      x0: HX0,
      z0: HZ0,
      x1: HX1,
      z1: HZ1,
      y: 0,
      h: HH,
      floor: "terrazzo",
      fc: [0.6, 0.58, 0.54],
      wall: "files",
      wc: [0.9, 0.92, 0.86],
      wain: "oak_panel",
      wainC: [0.55, 0.4, 0.26],
      wainH: 1.0,
      ceil: "coffer",
      cc: [0.55, 0.52, 0.46],
      cornice: true,
      trimMat: "bronze",
    });
    // laylight (glass ceiling panels) with cold daylight
    for (let i = -2; i <= 2; i++)
      for (let j = 0; j < 4; j++) {
        const cx = i * 4.8,
          cz = -38 + j * 5;
        K.ngonFloor(
          b,
          cx,
          HH - 0.05,
          cz,
          1.8,
          4,
          PI / 4,
          "lamp",
          (i + j) % 3 ? [0.42, 0.46, 0.48] : [0.08, 0.08, 0.08],
          false,
        );
      }
    b.light(0, HH - 1, -30, COOL, 1.1, 24, { box: HB, wrap: 0.6 });
    // gallery (y 5) on W / N / E sides, iron posts, railings, rolling ladders
    const GW = 2.4;
    const galleries = [
      {
        x0: HX0,
        z0: HZ0,
        x1: HX0 + GW,
        z1: HZ1,
        rail: [[HX0 + GW, HZ0 + GW, HX0 + GW, HZ1 - 2.1]],
      },
      {
        x0: HX0 + GW,
        z0: HZ0,
        x1: HX1 - GW,
        z1: HZ0 + GW,
        rail: [[HX0 + GW, HZ0 + GW, HX1 - GW, HZ0 + GW]],
      },
      {
        x0: HX1 - GW,
        z0: HZ0,
        x1: HX1,
        z1: HZ1,
        rail: [
          [HX1 - GW, HZ0 + GW, HX1 - GW, HZ1],
          [HX1 - GW, HZ1 - 0.1, HX1, HZ1 - 0.1],
        ],
      },
    ];
    for (const g of galleries) {
      b.boxMM("metal_dark", g.x0, GAL - 0.25, g.z0, g.x1, GAL, g.z1, {
        tint: [0.35, 0.33, 0.3],
        faces: "nsewtb",
      });
      b.face(
        "lino",
        g.x0,
        GAL + 0.002,
        g.z1,
        1,
        0,
        0,
        0,
        0,
        -1,
        g.x1 - g.x0,
        g.z1 - g.z0,
        { uv: "top", tint: [0.5, 0.52, 0.46] },
      );
      b.col(g.x0, GAL - 0.25, g.z0, g.x1, GAL, g.z1, {
        tag: "floor",
        surface: "metal",
      });
      for (const rl of g.rail)
        K.railing(b, rl[0], rl[1], rl[2], rl[3], GAL, {
          h: 1.0,
          mat: "black_iron",
          handMat: "black_iron",
          step: 0.4,
        });
    }
    for (let z = HZ0 + GW; z <= HZ1 - 2; z += 4)
      for (const x of [HX0 + GW, HX1 - GW]) {
        b.cyl("black_iron", x, 0, z, 0.1, 0.1, GAL - 0.25, 6, {
          tint: [0.3, 0.29, 0.27],
        });
        b.col(x - 0.12, 0, z - 0.12, x + 0.12, GAL, z + 0.12, {});
      }
    for (let x = HX0 + GW + 4; x < HX1 - GW; x += 4) {
      b.cyl("black_iron", x, 0, HZ0 + GW, 0.1, 0.1, GAL - 0.25, 6, {
        tint: [0.3, 0.29, 0.27],
      });
      b.col(x - 0.12, 0, HZ0 + GW - 0.12, x + 0.12, GAL, HZ0 + GW + 0.12, {});
    }
    for (const [x, z, y0] of [
      [HX0 + 0.5, -24, 0],
      [HX1 - 0.5, -38, GAL],
      [HX0 + 0.5, -40, GAL],
    ]) {
      b.beam(
        "wood",
        x + (x < 0 ? 0.3 : -0.3),
        y0,
        z - 0.25,
        x,
        y0 + 4.2,
        z - 0.25,
        0.06,
        0.06,
        { tint: [0.5, 0.4, 0.28] },
      );
      b.beam(
        "wood",
        x + (x < 0 ? 0.3 : -0.3),
        y0,
        z + 0.25,
        x,
        y0 + 4.2,
        z + 0.25,
        0.06,
        0.06,
        { tint: [0.5, 0.4, 0.28] },
      );
      for (let k = 1; k < 10; k++) {
        const t = k / 10;
        b.beam(
          "wood",
          x + (x < 0 ? 0.3 : -0.3) * (1 - t),
          y0 + 4.2 * t,
          z - 0.25,
          x + (x < 0 ? 0.3 : -0.3) * (1 - t),
          y0 + 4.2 * t,
          z + 0.25,
          0.04,
          0.04,
        );
      }
    }
    // stair up the south wall (bottom at x −3, top at the west gallery)
    K.stairs(b, HX0 + GW, HZ1 - 2.0, -3, HZ1 - 0.1, 0, GAL, "-x", {
      mat: "metal_dark",
      tint: [0.4, 0.38, 0.35],
      solid: false,
      thick: 0.18,
      rail: "r",
      /* the open (hall) side — was on the wall side */ railMat: "black_iron",
      handMat: "black_iron",
      surface: "metal",
    });
    // record stacks (rows along x), leaving a centre aisle & the camp plaza
    for (const z of [-22, -26, -35, -39])
      for (const [x0, x1] of [
        [-12.6, -3.2],
        [3.2, 12.6],
      ]) {
        const cx = (x0 + x1) / 2;
        K.shelf(b, cx, 0, z, 0, x1 - x0, {
          mat: "metal",
          items: ["box", "box", "book", "box"],
          seed: (z * 7 + x0 * 3) | 0,
          h: 3.6,
          d: 0.9,
          levels: 5,
          tint: [0.42, 0.45, 0.4],
        });
        b.plate(
          "art",
          x0 + 0.2,
          3.3,
          z + 0.46,
          0,
          1,
          1.4,
          0.3,
          K.signCell(
            "pc_mb_stack" + z + (x0 < 0 ? "w" : "e"),
            (x0 < 0 ? "DEEDS " : "BIRTHS ") +
              (1800 + ((-z * 7) | 0)) +
              "–" +
              (1850 + ((-z * 5) | 0)),
            256,
            48,
            { bg: "#e0d8c0", fg: "#2a2a20" },
          ),
        );
      }
    // toppled stack spilling paper
    b.box("metal", 8, 0, -30.5, 7.5, 0.9, 1.2, {
      yaw: 0.25,
      tint: [0.4, 0.43, 0.38],
    });
    b.ocol(8, -30.5, 7.5, 1.2, 0, 0.9, 0.25, { tag: "furniture" });
    for (let k = 0; k < 60; k++)
      b.hplate(
        "flat",
        -12 + r() * 24,
        0.01 + k * 0.0003,
        -44 + r() * 28,
        0.25,
        0.32,
        r() * 6,
        null,
        { tint: [0.8 - r() * 0.2, 0.76 - r() * 0.2, 0.62 - r() * 0.15] },
      );
    // the brute camp: bonfire of deeds, meat hooks, bone piles, mattresses
    const BF = { x: 0, z: -30.5 };
    b.cyl("rubble", BF.x, 0, BF.z, 1.2, 1.0, 0.25, 10, {
      tint: [0.35, 0.33, 0.3],
    });
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * PI * 2;
      b.beam(
        "wood_dark",
        BF.x + Math.cos(a) * 0.9,
        0.2,
        BF.z + Math.sin(a) * 0.9,
        BF.x,
        1.2,
        BF.z,
        0.12,
        0.12,
        { tint: [0.2, 0.15, 0.1] },
      );
    }
    for (let k = 0; k < 12; k++) {
      const a = r() * 6.28,
        d = r() * 0.8;
      b.box(
        "flat",
        BF.x + Math.cos(a) * d,
        0.25 + r() * 0.5,
        BF.z + Math.sin(a) * d,
        0.3,
        0.02,
        0.4,
        { yaw: r() * 3, tint: [0.3, 0.25, 0.18] },
      );
    }
    b.col(BF.x - 1, 0, BF.z - 1, BF.x + 1, 0.6, BF.z + 1, { tag: "fire" });
    b.light(BF.x, 1.4, BF.z, FIRE, 1.6, 13, { box: HB });
    b.glow(BF.x, 1.0, BF.z, [1, 0.45, 0.15], 3.5);
    b.glow(BF.x, 0.6, BF.z, [1, 0.6, 0.2], 1.6);
    b.pipe("black_iron", BF.x - 1.4, 0, BF.z, BF.x - 1.4, 1.8, BF.z, 0.04, 4);
    b.pipe("black_iron", BF.x + 1.4, 0, BF.z, BF.x + 1.4, 1.8, BF.z, 0.04, 4);
    b.pipe("black_iron", BF.x - 1.5, 1.8, BF.z, BF.x + 1.5, 1.8, BF.z, 0.03, 4);
    b.geo("meat", K.sphereGeo(), {
      x: BF.x,
      y: 1.5,
      z: BF.z,
      sx: 0.5,
      sy: 0.25,
      sz: 0.25,
      tint: [0.4, 0.2, 0.12],
    });
    for (const [x, z] of [
      [-2.2, -27.6],
      [2.6, -33.4],
      [-2.8, -33.8],
      [3, -27.4],
    ]) {
      b.pipe("black_iron", x, HH, z, x, 3.0, z, 0.012, 3);
      b.geo("meat", K.sphereGeo(), {
        x,
        y: 2.5,
        z,
        sx: 0.32,
        sy: 0.6,
        sz: 0.28,
        tint: [0.45, 0.18, 0.14],
      });
    }
    for (const [x, z] of [
      [4.8, -29],
      [-4.6, -32.2],
      [1.4, -41.5],
    ]) {
      K.rubble(b, x, 0, z, 0.9, 0.5, {
        seed: (x * 13) | 0,
        mat: "bone",
        tint: [0.8, 0.75, 0.62],
        n: 4,
        col: false,
      });
    }
    for (const [x, z, yaw] of [
      [5.4, -32.6, 0.3],
      [-5.2, -28.4, -0.4],
    ]) {
      b.box("fabric", x, 0, z, 2.2, 0.25, 3.2, {
        yaw,
        tint: [0.45, 0.38, 0.28],
      });
    }
    for (let k = 0; k < 8; k++)
      b.hplate(
        "decal",
        -5 + r() * 10,
        0.013 + k * 0.001,
        -36 + r() * 12,
        1.2 + r() * 1.5,
        1.2 + r() * 1.5,
        r() * 6,
        K.decal(k % 2 ? "blood" : "scorch", k + 100),
      );
    b.burn(0, 3, -30.5, 6, 0.4);
    // BIG LEDGER's throne of filing cabinets (north end)
    const TH = { x: 0, z: -42 };
    for (let k = 0; k < 7; k++) {
      const a = -0.5 + (k * 0.17 * PI) / 3.2,
        x = TH.x + Math.sin(a * 2.2) * 2.4,
        z = TH.z - 0.6 - Math.cos(a) * 0.4;
      for (let h = 0; h < 2 + (k % 3); h++)
        b.box("metal", x, h * 1.3, z, 0.9, 1.28, 0.7, {
          yaw: a,
          tint: r.pick([
            [0.42, 0.46, 0.4],
            [0.5, 0.5, 0.46],
            [0.36, 0.4, 0.44],
          ]),
        });
    }
    b.boxMM("metal", TH.x - 1.2, 0, TH.z - 0.9, TH.x + 1.2, 0.8, TH.z + 0.6, {
      tint: [0.45, 0.46, 0.42],
    });
    b.col(TH.x - 3, 0, TH.z - 1.4, TH.x + 3, 0.8, TH.z + 0.6, {
      tag: "furniture",
    });
    b.plate(
      "art",
      TH.x,
      4.4,
      HZ0 + 0.14,
      0,
      1,
      4.2,
      1.2,
      K.tag("BIG LEDGER", "#e03030", 512, 144),
    );
    b.plate(
      "decal",
      TH.x - 5,
      2.4,
      HZ0 + 2.55,
      0,
      1,
      3.4,
      1.1,
      K.tag("ALL HUMANS FILED", "#e8d040", 512, 128),
    );
    b.light(TH.x, 2.8, TH.z + 2, [0.9, 0.45, 0.25], 0.6, 7, { box: HB });
    // work lights strung by the brutes
    for (const [x, z] of [
      [-9, -24],
      [9, -37],
      [-9, -37],
      [9, -24],
    ]) {
      K.lamp(b, x, 4.2, z, "bulb", WARM, (x + z) % 3 ? 0.55 : 0, 7, {
        ceil: GAL - 0.25,
        dead: !((x + z) % 3),
        lightOpts: { box: HB },
      });
    }
    for (const [x, z] of [
      [-14.8, -30],
      [14.8, -22],
      [0, -44.8],
      [-14.8, -42],
    ])
      K.lamp(b, x, GAL + 2.4, z, "cage", WARM, 0.45, 6, {
        ceil: GAL + 3,
        lightOpts: { box: HB },
      });
    // the captive's cage (west of the plaza) — three barred sides + the gate
    const CG = { x: -7.2, z: -30.5 };
    for (const [ax, az, bx, bz] of [
      [CG.x - 1, CG.z - 1, CG.x - 1, CG.z + 1],
      [CG.x - 1, CG.z - 1, CG.x + 1, CG.z - 1],
      [CG.x - 1, CG.z + 1, CG.x + 1, CG.z + 1],
    ]) {
      const n = Math.round(Math.hypot(bx - ax, bz - az) / 0.14);
      for (let k = 0; k <= n; k++) {
        const t = k / n;
        b.cyl(
          "black_iron",
          ax + (bx - ax) * t,
          0,
          az + (bz - az) * t,
          0.018,
          0.018,
          2.3,
          5,
          { top: false, tint: [0.3, 0.29, 0.27] },
        );
      }
      b.col(
        Math.min(ax, bx) - 0.05,
        0,
        Math.min(az, bz) - 0.05,
        Math.max(ax, bx) + 0.05,
        2.4,
        Math.max(az, bz) + 0.05,
        { tag: "bars", walkable: false },
      );
    }
    b.boxMM(
      "black_iron",
      CG.x - 1.05,
      2.3,
      CG.z - 1.05,
      CG.x + 1.05,
      2.4,
      CG.z + 1.05,
      { tint: [0.3, 0.29, 0.27] },
    );
    b.boxMM(
      "fabric",
      CG.x - 0.9,
      0.01,
      CG.z - 0.2,
      CG.x - 0.1,
      0.08,
      CG.z + 0.8,
      { tint: [0.4, 0.34, 0.26] },
    );
    K.gate(ctx, {
      id: "wren",
      flag: "mb_wren_free",
      label: "Captive's Cage",
      x: CG.x + 1,
      z: CG.z,
      w: 2.0,
      axis: "z",
      y0: 0,
      h: 2.3,
      lock: {
        id: "pc_lk_mb_cage",
        key: "pc_mb_cage_key",
        hint: "Big Ledger keeps the cage key in his hoard by the throne of filing cabinets.",
      },
      style: "bars",
      onOpen: () => {
        if (PC.mb && PC.mb.wrenFreed) PC.mb.wrenFreed();
      },
    });
    // the shelterers nailed the Hall of Records doors shut behind them (solid barricade, opens from either side):
    // it keeps the brutes in the Hall and off the lobby → street route a sleeper takes coming up from Sub-basement C-9
    K.gate(ctx, {
      id: "hall_barricade",
      flag: "mb_hall_open",
      label: "Hall of Records (barricaded doors)",
      x: 0,
      z: -14.05,
      w: 3.2,
      axis: "x",
      y0: 0,
      h: 3.4,
      style: "barricade",
      slide: 3.3,
    });
    K.anchor(ctx, "wren", CG.x - 0.3, 0, CG.z + 0.2);
    // Wren's Register on the brutes' paper pile beside the cook-fire (Paper Trail / mq11), and Wren's desk by the
    // barricaded doors, where he works once he is free (the main story's Register beat looks up these anchors)
    const RG = { x: BF.x + 1.9, z: BF.z + 1.3 };
    for (let k = 0; k < 9; k++)
      b.box(
        "flat",
        RG.x + (r() - 0.5) * 0.9,
        0.02 + k * 0.03,
        RG.z + (r() - 0.5) * 0.7,
        0.32,
        0.03,
        0.42,
        {
          yaw: r() * 3,
          tint: [0.78 - r() * 0.2, 0.72 - r() * 0.2, 0.58 - r() * 0.15],
        },
      );
    K.anchor(ctx, "register_fire", RG.x, 0.3, RG.z);
    K.note(
      ctx,
      "pc_mb_register",
      RG.x,
      0.3,
      RG.z,
      Object.assign(
        { type: "note", name: "The Register (T. Wren, 1967–1989)" },
        PC.REGISTER_DEF || {},
      ),
    );
    const WD = { x: -6.5, z: -17.6 };
    K.loot(ctx, "desk", WD.x, 0, WD.z, PI, {
      loot: "desk",
      name: "Wren's Desk (the Last Clerk)",
    });
    K.anchor(ctx, "records_desk", WD.x, 0, WD.z);
    K.anchor(ctx, "register", WD.x + 0.35, 0.82, WD.z);
    K.anchor(ctx, "records_desk_stand", WD.x, 0, WD.z - 1.3);

    // ================= BUREAU OF VITAL STATISTICS (y 5, east wing) =================
    const OB = [15.9, GAL - 0.3, -40.1, 40.1, GAL + 4.3, -19.9];
    K.gap(ctx, 38, -20, 3.6, GAL, 3.4);
    K.gap(ctx, 40, -22, 1.6, GAL, 2.6); // → Stair B (collapsed above the 2nd floor)
    K.room(b, ctx, {
      x0: 16,
      z0: -40,
      x1: 40,
      z1: -20,
      y: GAL,
      h: 4.0,
      floor: "lino",
      fc: [0.62, 0.64, 0.58],
      wall: "plaster",
      wc: [0.74, 0.74, 0.66],
      wain: "oak_panel",
      wainC: [0.55, 0.4, 0.26],
      wainH: 1.0,
      ceil: "tin",
      cc: [0.6, 0.58, 0.52],
    });
    b.plate(
      "art",
      17.2,
      GAL + 2.8,
      -39.86,
      0,
      1,
      3.6,
      0.5,
      K.signCell("pc_mb_vital", "BUREAU OF VITAL STATISTICS", 512, 64, {
        bg: "#2a2620",
        fg: "#d8c088",
        font: "Georgia, serif",
      }),
    );
    // counter with glass wickets near the entrance, cubicle rows beyond
    b.boxMM("oak_panel", 19, GAL, -36, 19.8, GAL + 1.1, -24, {
      tint: [0.55, 0.4, 0.26],
    });
    b.col(19, GAL, -36, 19.8, GAL + 1.1, -24, { tag: "counter" });
    for (let z = -35.5; z < -24; z += 2.2) {
      b.plate("glass_clear", 19.4, GAL + 1.8, z + 1.1, 1, 0, 2.1, 1.3, null, {
        tint: [0.7, 0.8, 0.8],
      });
      b.beam("bronze", 19.4, GAL + 1.1, z, 19.4, GAL + 2.5, z, 0.05, 0.05);
    }
    b.col(19.35, GAL + 1.1, -36, 19.45, GAL + 2.5, -24, {
      tag: "glass",
      walkable: false,
    });
    for (let row = 0; row < 3; row++)
      for (let k = 0; k < 3; k++) {
        const cx = 23 + k * 3.2,
          cz = -37.5 + row * 5.5;
        if (cx > 30.5 && cz < -30) continue; // strongroom corner
        b.boxMM(
          "oak_panel",
          cx - 1.4,
          GAL,
          cz - 1.5,
          cx + 1.4,
          GAL + 1.5,
          cz - 1.42,
          { tint: [0.5, 0.36, 0.22] },
        );
        b.boxMM(
          "oak_panel",
          cx + 1.4,
          GAL,
          cz - 1.5,
          cx + 1.48,
          GAL + 1.5,
          cz + 1.2,
          { tint: [0.5, 0.36, 0.22] },
        );
        b.col(cx - 1.4, GAL, cz - 1.52, cx + 1.48, GAL + 1.5, cz - 1.4, {});
        b.col(cx + 1.4, GAL, cz - 1.5, cx + 1.5, GAL + 1.5, cz + 1.2, {});
        K.table(b, cx, GAL, cz - 0.6, 1.5, 0.7, {
          mat: "metal",
          tint: [0.42, 0.45, 0.4],
        });
        b.box("metal_dark", cx - 0.2, GAL + 0.76, cz - 0.6, 0.48, 0.18, 0.38, {
          tint: [0.2, 0.2, 0.2],
        });
        K.chair(b, cx, GAL, cz + 0.2, 0, {
          mat: "metal",
          tint: [0.35, 0.38, 0.34],
          fallen: r() < 0.3,
        });
        for (let p = 0; p < 4; p++)
          b.hplate(
            "flat",
            cx + (r() - 0.5) * 1.2,
            GAL + 0.765 + p * 0.002,
            cz - 0.6 + (r() - 0.5) * 0.4,
            0.22,
            0.3,
            r() * 3,
            null,
            { tint: [0.85, 0.82, 0.72] },
          );
      }
    for (let k = 0; k < 5; k++)
      K.shelf(b, 21 + k * 2.2, GAL, -20.4, PI, 2.0, {
        mat: "metal",
        items: ["box", "book", "box"],
        seed: 1810 + k,
        h: 2.2,
        d: 0.5,
      });
    for (let k = 0; k < 40; k++)
      b.hplate(
        "flat",
        20 + r() * 19,
        GAL + 0.01 + k * 0.0004,
        -39 + r() * 18,
        0.25,
        0.32,
        r() * 6,
        null,
        { tint: [0.8, 0.76, 0.62] },
      );
    for (const [x, z, d] of [
      [24, -34, false],
      [30, -26, true],
      [24, -24, false],
      [35, -26, false],
    ])
      K.lamp(b, x, GAL + 3.4, z, "tube", TUBE, d ? 0 : 0.5, 7, {
        ceil: GAL + 4,
        len: 1.4,
        dead: d,
        lightOpts: { box: OB },
      });
    K.skel(ctx, 27.3, GAL, -31.8, 0.9, "sitting");
    b.hplate("decal", 27, GAL + 0.012, -29, 1.8, 1.8, 0, K.decal("blood", 18));
    // SURROGATE'S STRONGROOM (x 32..40, z −40..−30) behind the steel door
    const VB = [32, GAL - 0.3, -40.1, 40.1, GAL + 4.1, -29.9];
    K.segWall(b, 32, -40, 32, -30, GAL, GAL + 4, 1, {
      mat: "metal_dark",
      tint: [0.45, 0.47, 0.48],
      both: true,
      trim: false,
      gaps: [{ t: 5, w: 1.8, y0: GAL, y1: GAL + 2.6 }],
    });
    K.segWall(b, 32, -30, 40, -30, GAL, GAL + 4, 1, {
      mat: "metal_dark",
      tint: [0.45, 0.47, 0.48],
      both: true,
      trim: false,
    });
    b.boxMM("steel", 31.7, GAL, -36.4, 32.3, GAL + 2.9, -33.6, {
      tint: [0.55, 0.56, 0.56],
      faces: "nsewt",
    });
    b.plate(
      "art",
      31.66,
      GAL + 3.3,
      -35,
      -1,
      0,
      2.2,
      0.4,
      K.signCell("pc_mb_surr", "SURROGATE'S STRONGROOM", 384, 64, {
        bg: "#1a1a1a",
        fg: "#d8c088",
        font: "Georgia, serif",
      }),
    );
    K.gate(ctx, {
      id: "strongroom",
      flag: "mb_vault_open",
      label: "Surrogate's Strongroom Door",
      x: 32,
      z: -35,
      w: 1.8,
      axis: "z",
      y0: GAL,
      h: 2.6,
      lock: {
        id: "pc_lk_mb_strongroom",
        key: "pc_mb_vault_key",
        hint: "Big Ledger carries the strongroom key; the Registrar's desk has another, and the Bureau terminal can release the door.",
      },
      style: "strongroom",
      slide: -1.9,
    });
    // the strongroom proper: walls of numbered safe-deposit boxes (some drilled and pulled), a steel counting table
    {
      const vr = K.rng("mb_vault");
      const depo = K.paint(
        "art",
        "pc_mb_depo",
        256,
        192,
        function (x, X, Y, W, H) {
          x.fillStyle = "#1c1e1e";
          x.fillRect(X, Y, W, H);
          const cw = W / 4,
            ch = H / 4,
            rr = K.rng("depo");
          for (let j = 0; j < 4; j++)
            for (let i = 0; i < 4; i++) {
              const dx = X + i * cw + 2,
                dy = Y + j * ch + 2,
                dw = cw - 4,
                dh = ch - 4;
              const g = x.createLinearGradient(dx, dy, dx + dw, dy + dh);
              g.addColorStop(0, "#9aa0a0");
              g.addColorStop(1, "#5e6464");
              x.fillStyle = g;
              x.fillRect(dx, dy, dw, dh);
              x.strokeStyle = "#2a2c2c";
              x.lineWidth = 2;
              x.strokeRect(dx + 3, dy + 3, dw - 6, dh - 6);
              x.fillStyle = "#b8923c";
              x.fillRect(dx + dw * 0.36, dy + dh * 0.14, dw * 0.28, dh * 0.2);
              x.fillStyle = "#2a2010";
              x.font = "bold " + Math.round(dh * 0.16) + "px Arial";
              x.textAlign = "center";
              x.textBaseline = "middle";
              x.fillText(
                String(1100 + (j * 4 + i) * 7 + ((rr() * 5) | 0)),
                dx + dw / 2,
                dy + dh * 0.245,
              );
              for (const kx of [0.35, 0.65]) {
                x.fillStyle = "#d0b060";
                x.beginPath();
                x.arc(dx + dw * kx, dy + dh * 0.62, dh * 0.08, 0, 6.3);
                x.fill();
                x.fillStyle = "#111";
                x.fillRect(dx + dw * kx - 1, dy + dh * 0.58, 2, dh * 0.1);
              }
            }
          K.stains(x, X, Y, W, H, 8, 5519, 0.35, [40, 30, 20]);
          K.streaks(x, X, Y, W, H, 8, 5520, 0.3);
        },
      );
      const hole = K.paint(
        "art",
        "pc_mb_depo_hole",
        64,
        48,
        function (x, X, Y, W, H) {
          x.fillStyle = "#070707";
          x.fillRect(X, Y, W, H);
          x.fillStyle = "#2a2a2a";
          x.fillRect(X, Y, W, 4);
          x.fillRect(X, Y, 4, H);
        },
      );
      // wall run from (ax,az) → (bx,bz), boxes facing (nx,nz); backing 0.28 m deep
      const depoWall = (ax, az, bx, bz, nx, nz, seed) => {
        const L = Math.hypot(bx - ax, bz - az),
          ux = (bx - ax) / L,
          uz = (bz - az) / L,
          D = 0.28;
        b.boxMM(
          "metal_dark",
          Math.min(ax, bx + nx * D, ax + nx * D, bx),
          GAL,
          Math.min(az, bz + nz * D, az + nz * D, bz),
          Math.max(ax, bx + nx * D, ax + nx * D, bx),
          GAL + 2.9,
          Math.max(az, bz + nz * D, az + nz * D, bz),
          { tint: [0.4, 0.42, 0.42] },
        );
        const cols = Math.floor(L / 1.2),
          pw = L / cols;
        for (let c = 0; c < cols; c++)
          for (let rw = 0; rw < 3; rw++) {
            const t = (c + 0.5) * pw,
              px = ax + ux * t + nx * D,
              pz = az + uz * t + nz * D,
              py = GAL + 0.15 + rw * 0.9 + 0.45;
            b.plate("art", px, py, pz, nx, nz, pw - 0.04, 0.86, depo, {
              tint: [0.9, 0.9, 0.88],
            });
            // a few boxes drilled out: black hole + the drawer dumped on the floor / hanging out
            if (vr() < 0.35) {
              const hx = (vr() - 0.5) * pw * 0.5,
                hy = (vr() - 0.5) * 0.4,
                qx = px + ux * hx,
                qz = pz + uz * hx;
              b.plate(
                "art",
                qx,
                py + hy,
                qz,
                nx,
                nz,
                pw / 4 - 0.02,
                0.2,
                hole,
                { off: 0.02 },
              );
              if (vr() < 0.5)
                b.box(
                  "steel",
                  qx + nx * 0.18,
                  py + hy - 0.09,
                  qz + nz * 0.18,
                  Math.abs(nx) > 0.5 ? 0.36 : pw / 4 - 0.05,
                  0.16,
                  Math.abs(nz) > 0.5 ? 0.36 : pw / 4 - 0.05,
                  { tint: [0.5, 0.52, 0.52] },
                );
              else {
                const fx = qx + nx * (0.6 + vr() * 0.8),
                  fz = qz + nz * (0.6 + vr() * 0.8);
                b.box("steel", fx, GAL, fz, 0.3, 0.14, 0.5, {
                  yaw: vr() * 3,
                  tint: [0.45, 0.47, 0.47],
                });
              }
            }
          }
        b.box(
          "brass",
          ax + (ux * L) / 2 + nx * (D + 0.02),
          GAL + 2.82,
          az + (uz * L) / 2 + nz * (D + 0.02),
          Math.abs(ux) * L + 0.05,
          0.05,
          Math.abs(uz) * L + 0.05,
          { tint: [0.55, 0.42, 0.22] },
        );
      };
      depoWall(34.0, -40, 39.7, -40, 0, 1, 1); // north
      depoWall(40, -39.7, 40, -33.4, -1, 0, 2); // east (the safe stands at z −32)
      depoWall(33.6, -30, 39.7, -30, 0, -1, 3); // south
      b.col(34.0, GAL, -40.1, 39.7, GAL + 2.9, -39.72, {});
      b.col(39.72, GAL, -39.7, 40.1, GAL + 2.9, -33.4, {});
      b.col(33.6, GAL, -30.28, 39.7, GAL + 2.9, -29.9, {});
      // steel counting table (the Deed Ledger lies on it) + a rolling cart of strongboxes
      b.boxMM("steel", 34.4, GAL + 0.94, -37.1, 37.1, GAL + 1.0, -35.4, {
        tint: [0.55, 0.57, 0.57],
      });
      for (const [lx, lz] of [
        [34.5, -37],
        [37, -37],
        [34.5, -35.5],
        [37, -35.5],
      ])
        b.box("steel", lx, GAL, lz, 0.05, 0.94, 0.05, {
          tint: [0.4, 0.42, 0.42],
        });
      b.boxMM("steel", 34.5, GAL + 0.18, -37, 37, GAL + 0.2, -35.5, {
        tint: [0.35, 0.37, 0.37],
      });
      b.col(34.4, GAL, -37.1, 37.1, GAL + 1.0, -35.4, { tag: "furniture" });
      b.box("leather", 36.5, GAL + 1.0, -36.6, 0.36, 0.08, 0.28, {
        yaw: 0.3,
        tint: [0.25, 0.14, 0.08],
      });
      for (let k = 0; k < 7; k++)
        b.hplate(
          "flat",
          34.6 + vr() * 2.3,
          GAL + 1.002 + k * 0.0006,
          -37 + vr() * 1.5,
          0.2,
          0.28,
          vr() * 6,
          null,
          { tint: [0.82, 0.8, 0.68] },
        );
      b.box("metal_dark", 38.6, GAL, -37.6, 0.7, 0.9, 0.5, {
        yaw: 0.2,
        tint: [0.35, 0.36, 0.36],
      });
      b.col(38.2, GAL, -37.9, 39.0, GAL + 0.9, -37.3, { tag: "furniture" });
      for (let k = 0; k < 3; k++)
        b.box("steel", 38.6, GAL + 0.9 + k * 0.17, -37.6, 0.34, 0.16, 0.44, {
          yaw: 0.2 + k * 0.15,
          tint: [0.5, 0.52, 0.52],
        });
      // bonds and share certificates drifted across the floor
      for (let k = 0; k < 24; k++)
        b.hplate(
          "flat",
          33 + vr() * 6.5,
          GAL + 0.01 + k * 0.0004,
          -39.5 + vr() * 9,
          0.22,
          0.3,
          vr() * 6,
          null,
          { tint: vr() < 0.5 ? [0.78, 0.82, 0.7] : [0.86, 0.8, 0.64] },
        );
      b.face("steel", 32, GAL + 3.98, -40, 1, 0, 0, 0, 0, 1, 8, 10, {
        uv: "top",
        tint: [0.3, 0.32, 0.32],
      });
    }
    K.lamp(b, 36, GAL + 3.2, -35, "pendant", [1, 0.85, 0.55], 0.7, 6, {
      ceil: GAL + 4,
      shade: "paint_green",
      lightOpts: { box: VB },
    });
    K.note(ctx, "pc_mb_ledger", 35.7, GAL + 1.01, -36.2, {
      type: "misc",
      name: "Deed Ledger, Vol. MCMLXVII",
      title: "Deed Ledger — Borough of Manhattan, 1957–1967",
      text: 'A leather-bound register of every deed, lien and transfer recorded in Manhattan in the last decade before the bombs. The final entry, in green ink: "Parcel 0001 (Manhattan Island, all of it, with all sub-surface rights): transferred to the UNITED STATES OFFICE OF CIVIL DEFENSE, consideration $1.00 and other valuable considerations. Recorded 03/04/1967. Purpose: classified." Nobody ever filed an objection.',
    });
    // ================= SERVICE STAIR & CORRIDOR (loop back to the lobby) =================
    const SB = [35.9, -0.3, -20.1, 40.1, GAL + 4.1, -7.9];
    K.stairs(b, 36, -20, 40, -8, 0, GAL, "-z", {
      mat: "concrete",
      tint: [0.55, 0.55, 0.52],
      nosing: "steel",
      rail: "l",
      railMat: "steel",
      handMat: "steel",
    });
    K.segWall(b, 36, -20, 36, -8, 0, GAL + 4, 1, {
      mat: "concrete",
      tint: [0.55, 0.55, 0.52],
      trim: false,
    });
    K.segWall(b, 40, -8, 40, -20, 0, GAL + 4, 1, {
      mat: "concrete",
      tint: [0.55, 0.55, 0.52],
      trim: false,
    });
    b.face("concrete", 36, GAL + 4, -20, 1, 0, 0, 0, 0, 1, 4, 12, {
      uv: "top",
      tint: [0.42, 0.42, 0.4],
    });
    K.lamp(b, 38, GAL + 1, -14, "cage", TUBE, 0.5, 7, {
      ceil: GAL + 4,
      lightOpts: { box: SB },
    });
    const CB = [11.9, -0.3, -8.1, 40.1, 3.5, -3.9];
    K.gap(ctx, 38, -8, 3.6, 0, 3.4);
    K.room(b, ctx, {
      x0: 12,
      z0: -8,
      x1: 40,
      z1: -4,
      y: 0,
      h: 3.4,
      floor: "concrete",
      fc: [0.5, 0.5, 0.47],
      wall: "plaster",
      wc: [0.62, 0.62, 0.56],
      wain: "celltile",
      wainC: [0.6, 0.66, 0.58],
      wainH: 1.2,
      ceil: "concrete",
      cc: [0.45, 0.45, 0.42],
      trim: false,
    });
    for (const x of [18, 28])
      K.lamp(b, x, 2.9, -6, "cage", TUBE, x === 28 ? 0 : 0.5, 7, {
        ceil: 3.4,
        dead: x === 28,
        lightOpts: { box: CB },
      });
    b.plate(
      "art",
      12.14,
      2.2,
      -5,
      1,
      0,
      1.2,
      0.8,
      K.signCell("pc_mb_shelter", "CIVIL DEFENSE\nSHELTER", 192, 128, {
        bg: "#e8d040",
        fg: "#1a1a1a",
      }),
    );
    for (let k = 0; k < 6; k++)
      b.box("fabric", 30 + k * 1.3, 0, -7.4, 1.0, 0.4 + (k % 3) * 0.3, 0.7, {
        yaw: r() * 0.4,
        tint: [0.55, 0.5, 0.36],
      });
    b.col(29.4, 0, -7.9, 38, 1.0, -7.0, {});
    K.litter(b, 12.5, -7.6, 35, -4.4, 0, 12, 92);
    // ---- SUB-BASEMENT C-9: the Office of Civil Defense service stair down to the Project Long Winter cryo facility ----
    // A grey steel blast door in the corridor's north wall (x 21..23), stencilled and hazard-striped, with a dead keypad.
    // It is the way UP for the sleeper who wakes in Cryo Unit C-9; the door itself is wired in cryoLink() below.
    {
      const DX0 = 21,
        DX1 = 23,
        DZ = -7.98,
        DH = 2.3;
      b.boxMM("steel", DX0 - 0.22, 0, DZ, DX0, DH + 0.22, DZ + 0.16, {
        tint: [0.4, 0.42, 0.42],
        faces: "nsewt",
      }); // frame
      b.boxMM("steel", DX1, 0, DZ, DX1 + 0.22, DH + 0.22, DZ + 0.16, {
        tint: [0.4, 0.42, 0.42],
        faces: "nsewt",
      });
      b.boxMM("steel", DX0, DH, DZ, DX1, DH + 0.22, DZ + 0.16, {
        tint: [0.4, 0.42, 0.42],
        faces: "nsewb",
      });
      b.boxMM("metal_dark", DX0, 0, DZ, DX1, DH, DZ + 0.1, {
        tint: [0.5, 0.52, 0.52],
        faces: "nsewt",
      }); // the leaf
      for (const y of [0.45, 1.15, 1.85])
        b.boxMM(
          "steel",
          DX0 + 0.15,
          y,
          DZ + 0.1,
          DX1 - 0.15,
          y + 0.08,
          DZ + 0.14,
          { tint: [0.6, 0.6, 0.58] },
        ); // braces
      b.cyl("steel", DX1 - 0.35, 1.05, DZ + 0.16, 0.12, 0.12, 0.06, 10); // hand wheel hub
      b.beam(
        "steel",
        DX1 - 0.6,
        1.05,
        DZ + 0.19,
        DX1 - 0.1,
        1.05,
        DZ + 0.19,
        0.03,
        0.03,
      );
      for (let k = 0; k < 6; k++)
        b.beam(
          k % 2 ? "paint_black" : "paint_yellow",
          DX0 - 0.2 + k * 0.4,
          0.02,
          DZ + 0.17,
          DX0 + k * 0.4,
          0.02,
          DZ + 0.17,
          0.2,
          0.03,
          { tint: k % 2 ? [0.05, 0.05, 0.05] : [0.85, 0.7, 0.15] },
        ); // sill stripes
      b.plate(
        "art",
        22,
        DH - 0.55,
        DZ + 0.12,
        0,
        1,
        1.5,
        0.62,
        K.signCell(
          "pc_mb_c9",
          "SUB-BASEMENT C-9\nAUTHORIZED PERSONNEL ONLY",
          384,
          160,
          {
            bg: "#e0dccc",
            fg: "#1a1a1a",
            font: '"Arial Black", sans-serif',
            border: "#d05030",
          },
        ),
      );
      b.plate(
        "art",
        22,
        DH + 0.55,
        DZ + 0.02,
        0,
        1,
        2.2,
        0.42,
        K.signCell(
          "pc_mb_c9_ocd",
          "OFFICE OF CIVIL DEFENSE · FACILITY C-9",
          512,
          96,
          { bg: "#22324a", fg: "#e8e0c8", font: "Arial, sans-serif" },
        ),
      );
      b.boxMM("metal", DX1 + 0.3, 1.15, DZ, DX1 + 0.56, 1.55, DZ + 0.08, {
        tint: [0.35, 0.36, 0.36],
      }); // keypad box
      for (let k = 0; k < 9; k++)
        b.boxMM(
          "steel",
          DX1 + 0.33 + (k % 3) * 0.075,
          1.2 + ((k / 3) | 0) * 0.075,
          DZ + 0.08,
          DX1 + 0.38 + (k % 3) * 0.075,
          1.25 + ((k / 3) | 0) * 0.075,
          DZ + 0.095,
          { tint: [0.7, 0.7, 0.66] },
        );
      b.glow(DX1 + 0.43, 1.5, DZ + 0.1, [1, 0.25, 0.12], 0.12); // dead-red status lamp
      b.plate(
        "decal",
        18.6,
        1.6,
        DZ + 0.02,
        0,
        1,
        1.6,
        0.6,
        K.tag("WHO KNOCKS DOWN HERE?", "#e8e0c8", 384, 128),
      );
      K.anchor(ctx, "cryo_access", 22, 0, -7.7); // the door (Municipal side)
      K.anchor(ctx, "cryo_arrive", 22, 0, -6.1); // where the sleeper stands after coming up (facing south, into the corridor)
      ctx._cryo = { x: 22, y: 1.25, z: -7.55 };
      // Twenty-two candle stubs along the wall west of the door: one left every twentieth of February since 1968
      // (mq01's optional "examine the candle stubs" beat; the oldest are wax puddles, the newest is days old)
      for (let k = 0; k < 22; k++) {
        const age = k / 21,
          x = DX0 - 0.35 - k * 0.075 - (k % 2) * 0.02,
          z = DZ + 0.2 + (k % 3) * 0.06;
        const h = 0.02 + (1 - age) * 0.11,
          rr = 0.022 + age * 0.012;
        b.cyl("paint_white", x, 0, z, rr * 1.9, rr * 2.3, 0.012, 8, {
          tint: [0.78 - age * 0.25, 0.74 - age * 0.25, 0.62 - age * 0.22],
        }); // wax pool
        b.cyl("paint_white", x, 0.01, z, rr, rr * 1.05, h, 8, {
          tint: [0.9 - age * 0.3, 0.86 - age * 0.3, 0.74 - age * 0.28],
        }); // stub
        b.cyl("paint_black", x, 0.01 + h, z, 0.003, 0.003, 0.012, 3, {
          tint: [0.05, 0.05, 0.05],
        }); // wick
      }
      ctx._candles = { x: DX0 - 1.2, y: 0.4, z: DZ + 0.45 };
      K.anchor(ctx, "cryo_candles", DX0 - 1.2, 0, DZ + 0.4);
    }

    // ================= WHY THERE IS NO WAY UP (the slab is 40 storeys; this cell is two) =================
    // (a) ELEVATOR 4: doors pried apart, the shaft behind is empty — the car fell to the sub-basement,
    //     the cables hang slack from forty floors up, and daylight leaks down from a hole near the top.
    {
      const SX0 = 12,
        SX1 = 14.6,
        SZ0 = -3.95,
        SZ1 = -1.85,
        SY0 = -4.5,
        SH = 16;
      const SHB = [
        SX0 - 0.3,
        SY0 - 0.3,
        SZ0 - 0.1,
        SX1 + 0.1,
        SY0 + SH,
        SZ1 + 0.1,
      ];
      K.room(b, ctx, {
        x0: SX0,
        z0: SZ0,
        x1: SX1,
        z1: SZ1,
        y: SY0,
        h: SH,
        floor: "concrete",
        fc: [0.3, 0.3, 0.28],
        wall: "concrete",
        wc: [0.22, 0.22, 0.21],
        noCeil: true,
        trim: false,
        casing: false,
        surface: "metal",
      });
      // the wrecked car at the bottom (crumpled roof, bent frame)
      b.boxMM(
        "bronze",
        SX0 + 0.3,
        SY0,
        SZ0 + 0.2,
        SX1 - 0.25,
        SY0 + 1.1,
        SZ1 - 0.15,
        { tint: [0.3, 0.25, 0.18], faces: "nsewt" },
      );
      b.quadN(
        "metal_dark",
        [SX0 + 0.3, SY0 + 1.12, SZ0 + 0.2],
        [SX1 - 0.25, SY0 + 1.5, SZ0 + 0.2],
        [SX1 - 0.25, SY0 + 1.3, SZ1 - 0.15],
        [SX0 + 0.3, SY0 + 1.2, SZ1 - 0.15],
        [0, 1, 0],
        { tint: [0.3, 0.29, 0.27] },
      );
      K.rubble(b, SX1 - 0.8, SY0 + 1.1, SZ0 + 0.9, 0.6, 0.5, {
        seed: 1841,
        col: false,
      });
      // guide rails & slack cables
      for (const z of [SZ0 + 0.12, SZ1 - 0.12])
        b.boxMM(
          "steel",
          SX1 - 0.18,
          SY0,
          z - 0.05,
          SX1 - 0.06,
          SY0 + SH,
          z + 0.05,
          { tint: [0.22, 0.2, 0.18] },
        );
      for (let k = 0; k < 4; k++) {
        const cz = SZ0 + 0.7 + k * 0.22;
        b.pipe(
          "black_iron",
          SX0 + 1.3 + (k % 2) * 0.12,
          SY0 + SH,
          cz,
          SX0 + 1.1 + k * 0.1,
          SY0 + 1.4,
          cz + (k - 1.5) * 0.15,
          0.022,
          3,
        );
      }
      b.face(
        "paint_black",
        SX0,
        SY0 + SH - 0.01,
        SZ0,
        1,
        0,
        0,
        0,
        0,
        1,
        SX1 - SX0,
        SZ1 - SZ0,
        { uv: "top", tint: [0.02, 0.02, 0.02] },
      );
      b.light(SX0 + 1.3, SY0 + SH - 1, -2.9, COOL, 0.45, 13, {
        box: SHB,
        wrap: 0.5,
      });
      b.light(SX0 + 1.3, SY0 + 1.6, -2.9, [1, 0.25, 0.15], 0.5, 4, {
        box: SHB,
      });
      b.glow(SX0 + 0.4, SY0 + 1.6, SZ1 - 0.3, [1, 0.2, 0.1], 0.5);
      // hazard barrier across the pried doors
      for (const zz of [-3.3, -2.5])
        b.beam("wood", 11.72, 0, zz, 11.72, 1.05, zz, 0.06, 0.06, {
          tint: [0.5, 0.42, 0.3],
        });
      b.beam("paint_yellow", 11.7, 1.0, -3.4, 11.7, 1.0, -2.4, 0.08, 0.18, {
        tint: [0.85, 0.7, 0.15],
      });
      b.beam("paint_yellow", 11.7, 0.55, -3.4, 11.7, 0.55, -2.4, 0.06, 0.14, {
        tint: [0.85, 0.7, 0.15],
      });
      b.col(11.55, 0, -3.35, 12.05, 2.6, -2.45, {
        tag: "barrier",
        walkable: false,
      });
      b.plate(
        "art",
        11.66,
        1.55,
        -2.9,
        -1,
        0,
        0.8,
        0.5,
        K.signCell("pc_mb_shaft", "DANGER\nNO CAR", 192, 120, {
          bg: "#e8d040",
          fg: "#1a1a1a",
          font: '"Arial Black", sans-serif',
          border: "#1a1a1a",
        }),
      );
      ctx._mbShaft = { x: 11.7, y: 1.4, z: -2.9 };
    }
    b.plate(
      "art",
      11.86,
      3.55,
      -2.9,
      -1,
      0,
      1.4,
      0.3,
      K.signCell("pc_mb_elev4", "▲ 40  ·  ▼ B", 256, 48, {
        bg: "#1a1a1a",
        fg: "#d05030",
      }),
    );
    b.plate(
      "art",
      -11.86,
      3.9,
      -4.2,
      1,
      0,
      2.4,
      0.9,
      K.signCell(
        "pc_mb_floors",
        "FLOORS 3 – 40 CLOSED\nBY ORDER OF CIVIL DEFENSE",
        384,
        144,
        {
          bg: "#e8e0c8",
          fg: "#8a1a1a",
          font: '"Arial Black", sans-serif',
          border: "#8a1a1a",
        },
      ),
    );

    // (b) STAIR B (off the Bureau of Vital Statistics): one flight up to the half landing, then the
    //     next flight lies on the floor under the fourth floor, which came down on top of it.
    {
      const X0 = 40,
        X1 = 46,
        Z0 = -31,
        Z1 = -21,
        LY = GAL + 3.4,
        SBH = 10;
      const SBB = [
        X0 - 0.1,
        GAL - 0.3,
        Z0 - 0.1,
        X1 + 0.1,
        GAL + SBH,
        Z1 + 0.1,
      ];
      K.room(b, ctx, {
        x0: X0,
        z0: Z0,
        x1: X1,
        z1: Z1,
        y: GAL,
        h: SBH,
        floor: "concrete",
        fc: [0.48, 0.48, 0.45],
        wall: "concrete",
        wc: [0.56, 0.56, 0.52],
        wain: "celltile",
        wainC: [0.55, 0.6, 0.52],
        wainH: 1.2,
        noCeil: true,
        trim: false,
      });
      K.stairs(b, 43.4, -29, 45.9, -22.4, GAL, LY, "-z", {
        mat: "concrete",
        tint: [0.55, 0.55, 0.52],
        nosing: "steel",
        rail: "l",
        railMat: "steel",
        handMat: "steel",
      });
      b.boxMM("concrete", X0 + 0.1, LY - 0.3, Z0 + 0.1, X1 - 0.1, LY, -29, {
        tint: [0.52, 0.52, 0.5],
        faces: "nsewtb",
      });
      b.col(X0 + 0.1, LY - 0.3, Z0 + 0.1, X1 - 0.1, LY, -29, {
        tag: "floor",
        surface: "concrete",
      });
      K.railing(b, X0 + 0.15, -29.05, 43.35, -29.05, LY, {
        mat: "steel",
        handMat: "steel",
        step: 0.4,
      });
      // the fallen upper flight: a tilted slab of stairs from the landing down onto the floor, rubble on top
      const slab = (x0, x1, yA, zA, yB, zB, t) => {
        b.quadN(
          "concrete",
          [x0, yA, zA],
          [x1, yA, zA],
          [x1, yB, zB],
          [x0, yB, zB],
          [0, 1, 0.3],
          { tint: [0.5, 0.5, 0.47] },
        );
        b.quadN(
          "concrete",
          [x0, yA - t, zA],
          [x1, yA - t, zA],
          [x1, yB - t, zB],
          [x0, yB - t, zB],
          [0, -1, -0.3],
          { tint: [0.35, 0.35, 0.33] },
        );
        for (const x of [x0, x1])
          b.quadN(
            "concrete",
            [x, yA - t, zA],
            [x, yA, zA],
            [x, yB, zB],
            [x, yB - t, zB],
            [x === x0 ? -1 : 1, 0, 0],
            { tint: [0.4, 0.4, 0.38] },
          );
      };
      slab(40.3, 43.0, LY - 0.35, -28.7, GAL + 0.25, -23.2, 0.3);
      for (let k = 0; k < 11; k++) {
        const t = k / 11,
          y = LY - 0.35 + (GAL + 0.25 - (LY - 0.35)) * t,
          z = -28.7 + 5.5 * t;
        b.boxMM("concrete", 40.4, y, z, 42.9, y + 0.12, z + 0.22, {
          tint: [0.58, 0.58, 0.55],
        });
      } // its treads
      b.col(X0 + 0.1, GAL, -28.9, 43.2, GAL + 1.5, -22.6, {
        tag: "rubble",
        surface: "rubble",
      });
      K.rubble(b, 41.6, GAL, -24.4, 1.3, 1.0, { seed: 1851 });
      K.rubble(b, 41.2, LY, -30.1, 1.0, 1.6, { seed: 1852 });
      K.rubble(b, 42.6, GAL, -26.2, 0.7, 0.5, { seed: 1853, col: false });
      for (let k = 0; k < 6; k++)
        b.pipe(
          "rust",
          40.6 + k * 0.4,
          LY + 5.6,
          -29.8 + (k % 2) * 0.3,
          40.8 + k * 0.35,
          LY + 2.4 + (k % 3) * 0.6,
          -28.6,
          0.018,
          3,
        ); // rebar hanging from the torn slab
      // the torn 3rd-floor landing hanging off the north wall, its buried door, the jammed slabs above
      b.boxMM("concrete", X0 + 0.1, LY + 3.2, Z0 + 0.1, 42.6, LY + 3.5, -29.4, {
        tint: [0.48, 0.48, 0.45],
        faces: "nsewtb",
      });
      b.face(
        "paint_black",
        X0 + 1.5,
        LY + 3.5,
        Z0 + 0.12,
        1,
        0,
        0,
        0,
        1,
        0,
        1.2,
        2.2,
        { tint: [0.04, 0.04, 0.04] },
      );
      b.plate(
        "art",
        X0 + 3.4,
        LY + 4.6,
        Z0 + 0.12,
        0,
        1,
        1.0,
        1.0,
        K.signCell("pc_mb_fl3", "3", 128, 128, {
          bg: "#5a5a54",
          fg: "#e8e0c8",
          font: '"Arial Black", sans-serif',
        }),
      );
      b.face(
        "concrete",
        X0,
        GAL + SBH,
        Z0,
        1,
        0,
        0,
        0,
        0,
        1,
        X1 - X0,
        Z1 - Z0,
        { uv: "top", tint: [0.3, 0.3, 0.28] },
      );
      for (let k = 0; k < 5; k++)
        b.box(
          "concrete",
          41 + ((k * 1.1) % 4.2),
          GAL + SBH - 1.4 - (k % 2) * 0.6,
          -27 + k * 1.2,
          1.6,
          1.2,
          1.2,
          { yaw: k * 0.7, tint: [0.45, 0.45, 0.42] },
        );
      // signs: the Civil Defense closure notice, the stair ident, and the brutes' opinion
      b.plate(
        "art",
        45.88,
        GAL + 2.2,
        -24.2,
        -1,
        0,
        1.6,
        1.2,
        K.signCell(
          "pc_mb_condemned",
          "CONDEMNED\nFLOORS 3–40\nDO NOT ASCEND\nCIVIL DEFENSE · 03/06/67",
          320,
          240,
          {
            bg: "#e8e0c8",
            fg: "#8a1a1a",
            font: '"Arial Black", sans-serif',
            border: "#8a1a1a",
          },
        ),
      );
      b.plate(
        "art",
        39.86,
        GAL + 2.95,
        -22,
        -1,
        0,
        1.4,
        0.45,
        K.signCell("pc_mb_stairb", "STAIR B · 2 – 40", 256, 72, {
          bg: "#1a1a1a",
          fg: "#e8e0c8",
        }),
      );
      b.plate(
        "decal",
        40.14,
        GAL + 2.2,
        -25.6,
        1,
        0,
        1.8,
        0.7,
        K.tag("UP IS NO", "#e03030", 256, 96),
      );
      K.lamp(b, 44.6, GAL + 2.9, -26, "cage", TUBE, 0.35, 6, {
        ceil: GAL + 3.2,
        lightOpts: { box: SBB },
      });
      b.light(42, GAL + SBH - 2, -26, COOL, 0.7, 12, { box: SBB, wrap: 0.7 }); // daylight through the torn floors above
      b.glow(42, GAL + SBH - 1, -26.5, [0.75, 0.82, 0.9], 3);
      // what's left of the Civil Defense warden who closed the stair
      K.skel(ctx, 44.2, LY, -30.2, 0.4, "sitting");
      K.loot(ctx, "first_aid", 45.86, LY + 1.4, -30, -HP, {
        loot: "first_aid",
        wall: true,
      });
      K.note(ctx, "pc_mb_note_warden", 44.6, LY + 0.02, -29.6, {
        type: "note",
        name: "Civil Defense Survey, Municipal Bldg.",
        title: "Civil Defense — Structural Survey, 03/06/1967",
        text: "MUNICIPAL BUILDING, 1 CENTRE ST. — AIR-RAID WARDEN'S SURVEY (Sunday 5 March, post-attack, +18 hrs)\n\nFLOORS 1–2: sound. Hall of Records intact. Shelter (service corridor) stocked.\nELEVATORS 1–4: cables severed, cars at sub-basement. DO NOT ENTER SHAFTS.\nSTAIR A: blocked at 2 by the Records annex fire doors (fused).\nSTAIR B: flight 2½–3 down (ceiling plaster and a fallen fire door). Impassable.\nFLOORS 3–40: every window on the north (uptown) face blown in by the blast wave. Fires on 22–25, burned out by morning. Nothing up there but wind and paper. CONDEMNED.\n\nI heard somebody knocking up there last night. Three knocks, then nothing. There is no way up. God forgive me, I stopped listening.\n\n— R. Castellano, Air-Raid Warden, Post 1-C",
      });
      ctx._mbStair = { x: 41.8, y: LY + 0.9, z: -29.4 };
    }

    ctx.intRoot = b.finish(null);
    ctx.intRoot.name = "poi_municipal_int";

    // ================= doors, anchors, loot, terminals =================
    const M = PC.MUNI;
    K.door(ctx, {
      id: "pc_mb_in",
      pos: V(M.AX1 - 0.55, 1.3, 603),
      label: "Municipal Building — Lobby",
      verb: "Enter",
      target: { x: O.x, y: O.y, z: O.z - 2.2, yaw: 0 },
      onEnter: () => K.safe("disc", () => G.discover("municipal_building")),
    });
    K.door(ctx, {
      id: "pc_mb_out",
      pos: V(O.x, O.y + 1.3, O.z - 0.3),
      label: "The Arch (Chambers Street)",
      verb: "Leave",
      target: { x: M.AX1 - 1.6, y: 0.06, z: 603, yaw: HP },
    });
    K.anchor(ctx, "entrance", 0, 0, -2.2);
    if (ctx._cryo) {
      PC.cryo = PC.cryo || {};
      PC.cryo.ctx = ctx;
      PC.cryo.pos = K.world(ctx, ctx._cryo.x, ctx._cryo.y, ctx._cryo.z);
      cryoLink();
    }
    // examine points explaining the missing upper floors
    const look = (p, label, text) =>
      K.safe("interact " + label, () => {
        if (G.world.addInteractable)
          ctx.interactables.push(
            G.world.addInteractable({
              pos: K.world(ctx, p.x, p.y, p.z),
              radius: 1.1,
              label,
              verb: "Examine",
              onInteract() {
                K.notify(text);
              },
            }),
          );
      });
    if (ctx._mbShaft)
      look(
        ctx._mbShaft,
        "Elevator 4 (pried open)",
        "Empty shaft. The car lies crumpled at the bottom; the cables hang slack from forty floors up. No way up here.",
      );
    if (ctx._candles)
      K.safe("candles", () => {
        if (G.world.addInteractable)
          ctx.interactables.push(
            G.world.addInteractable({
              pos: K.world(ctx, ctx._candles.x, ctx._candles.y, ctx._candles.z),
              radius: 1.0,
              label: "Candle Stubs",
              verb: "Examine",
              onInteract() {
                K.notify(
                  "Twenty-two candle stubs in a crooked row along the wall beside the C-9 door. The ones at the far end have melted down to grey puddles; the nearest is still white, its wick black and short. Days old, not years. Someone has been coming here for a long time, one candle at a time.",
                );
                if (!PC.flag("mb_candles_seen")) {
                  PC.setFlag("mb_candles_seen", true);
                  K.xp(15, "The candle vigil");
                }
                K.setQFlag("ms_candles_seen", true);
                K.safe("candles evt", () =>
                  G.events.emit("msBeat", {
                    id: "candles_seen",
                    where: "municipal_building",
                  }),
                );
              },
            }),
          );
      });
    if (ctx._mbStair)
      look(
        ctx._mbStair,
        "Stair B (collapsed)",
        "The flight to the 3rd floor lies at your feet with the 4th floor on top of it. Floors 3-40 are sealed.",
      );
    K.anchor(ctx, "hall", 0, 0, -22);
    K.anchor(ctx, "boss", TH.x, 0.8, TH.z);
    K.anchor(ctx, "strongroom", 36, GAL, -34);
    K.anchor(ctx, "offices", 24, GAL, -30);
    [
      [-6, 0, -24],
      [6, 0, -37],
      [-14.8, GAL, -30],
      [5, GAL, -44.8],
      [26, GAL, -29],
      [14, 0, -30],
    ].forEach((p, i) => K.anchor(ctx, "spawn" + (i + 1), p[0], p[1], p[2]));
    K.loot(ctx, "file_cabinet", -11.4, 0, -13.4, 0, {
      loot: "file_cabinet",
      name: "Information Desk Files",
    });
    K.loot(ctx, "desk", 0, 0, -9.2, PI, {
      loot: "desk",
      name: "Information Desk",
    });
    K.loot(ctx, "first_aid", 11.86, 1.4, -2.2, -HP, {
      loot: "first_aid",
      wall: true,
    });
    K.loot(ctx, "footlocker", -21.4, 0, -10.8, HP, {
      name: "Wedding Gifts",
      items: [
        ["old_dollars", 2],
        ["fizzo_cola", 2],
        ["teddy_bear", 1],
      ],
    });
    K.loot(ctx, "duffle_bag", 4.2, 0, -33.4, 0.5, {
      name: "Brute Stash",
      loot: "brute",
    });
    K.loot(ctx, "footlocker", TH.x + 1.6, 0, TH.z + 0.8, 0, {
      name: "Big Ledger's Hoard",
      loot: "raider_stash",
      items: [
        ["pc_mb_cage_key", 1],
        ["rally_tonic", 2],
      ],
    });
    K.loot(ctx, "file_cabinet", HX0 + 0.6, GAL, -36, HP, {
      loot: "file_cabinet",
    });
    K.loot(ctx, "file_cabinet", HX1 - 0.6, GAL, -42, -HP, {
      loot: "file_cabinet",
    });
    K.loot(ctx, "desk", 32.6, GAL, -21.6, PI, {
      loot: "desk",
      name: "Registrar's Desk",
      items: [["pc_mb_vault_key", 1]],
      lock: K.regLock({
        id: "pc_lk_mb_desk",
        label: "Registrar's Desk",
        kind: "container",
        code: "1811",
        hint: "The Records index terminal keeps the Registrar's drawer combination on file.",
      }),
    });
    // the Registrar's desk calendar: the Bureau terminal passcode, circled in red
    K.scrawlAt(
      K.world(ctx, 33.4, GAL + 1.0, -21.4),
      "Registrar's Desk Calendar",
      'March 1967. Circled in red on the 2nd: "NEW BUREAU PASSCODE — LEDGER (do NOT tell Abernathy, he tells everyone)".',
      "pc_lk_mb_term_vital",
    );
    K.loot(ctx, "safe", 39.4, GAL, -32, -HP, {
      loot: "safe",
      name: "Surrogate's Safe",
      lock: K.regLock({
        id: "pc_lk_mb_surrogate_safe",
        label: "Surrogate's Safe",
        kind: "safe",
        code: "4417",
        hint: "The Deputy Clerk's dictation reel in the Bureau mentions the Surrogate's combination.",
      }),
      items: [
        ["pc_mb_key_city", 1],
        ["pc_mb_eminent_domain", 1],
        ["ammo_44", 18],
        ["old_dollars", 6],
      ],
    });
    K.loot(ctx, "footlocker", 33.4, GAL, -39.2, 0, {
      name: "Estate Chest",
      loot: "junk_valuable",
    });
    K.loot(ctx, "ammo_box", 13.6, 0, -4.6, 0, { loot: "ammo_box" });
    K.loot(ctx, "first_aid", 39.86, 1.4, -6, -HP, {
      loot: "first_aid",
      wall: true,
    });
    K.skel(ctx, 8.2, 0, -10.6, 2.5, "reaching");
    K.skel(ctx, -9.8, 0, -18.6, 0.6, "lying");
    // ---- traps (08_traps.js) ----
    // the shelterers' tripwire across the service corridor (they wired the stair against the brutes)
    K.trap(ctx, {
      id: "mb_trip",
      kind: "tripwire",
      a: [34.4, 0.22, -6.94],
      c: [34.4, 0.22, -4.1],
      bouquet: [34.62, 0, -4.32],
    });
    K.skel(ctx, 31.2, 0, -5.2, 1.9, "lying");
    K.note(ctx, "pc_mb_note_shelter", 31.8, 0.03, -4.8, {
      type: "note",
      name: "Shelter Roster",
      title: "Municipal Building civil-defense shelter — roster, day 9",
      text: "SHELTER, SERVICE CORRIDOR — 14 persons (was 31).\n\nRULES\n1. Nobody goes up the service stair. The big grey ones are in the Hall.\n2. The wire across the corridor is LIVE. Step OVER it. Mr. Feld, this means you.\n3. Rations at 9 and 5. Water from the tank, not the toilet, Mr. Feld.\n\nDay 3: we knocked on the steel door at the end of the corridor (CIVIL DEFENSE — AUTHORIZED PERSONNEL ONLY). A woman answered through the grille. She said protocol forbade her to open it, and she was sorry. Then she pushed a carton of ration bars out through the hatch. Every day since, a carton.\nDay 9: the wire got one of them last night. Blew its leg off. It kept coming.\nDay 10: going to try for Brooklyn. God bless the City of New York.",
    });
    // Big Ledger's "catching trap" in front of the captive's cage
    K.trap(ctx, {
      id: "mb_bear",
      kind: "beartrap",
      pos: [-4.7, 0, -29.4],
      yaw: 0.3,
    });
    K.note(ctx, "pc_mb_reel_abernathy", 17.8, GAL + 0.8, -26.2, {
      type: "tape",
      name: "Tape reel: Deputy Clerk Abernathy",
      learn: "pc_lk_mb_surrogate_safe",
      title: "Deputy City Clerk H. Abernathy — dictation, 03/05/1967",
      text: "(dictation machine click)\n\nMemo to the Commissioner of Records. Re: continuity of government.\n\nThe Department of Records will remain open during the present emergency. Every birth, every death, every marriage must be recorded. That is what a city IS, sir — a list of people who were here.\n\nI have married eleven couples since the sirens started. Twelve. Here comes another.\n\n(muffled) ...No, ma'am, you do NOT need Form 27-B for a nuclear war, just sign here — and here — congratulations —\n\nAnd a postscript, for the Surrogate, who has phoned three times: YES, sir, I wrote your safe combination down for you. Four-four-one-seven. Please stop calling the marriage bureau during a war.\n\n(the tape runs out)",
    });
    const mb = () => PC.mb || {};
    K.terminal(
      ctx,
      "pc_mb_term_records",
      -9.6,
      GAL,
      -44.9,
      PI,
      {
        title: "DEPT. OF RECORDS — INDEX TERMINAL",
        header: "CITY OF NEW YORK · MUNICIPAL RECORDS NETWORK · PUBLIC ACCESS",
        entries: [
          {
            title: 'Search: "Civil Defense"',
            text: '4,412 results. Most recent: DEED TRANSFER, Parcel 0001 (Manhattan Island, entire, incl. sub-surface), recorded 03/04/1967. Original ledger held in the SURROGATE\'S STRONGROOM, Bureau of Vital Statistics (gallery level, east).\n\nRelated: 1 result RESTRICTED — "LONG WINTER / SUB-BASEMENT C-9". Clearance required.',
          },
          {
            title: 'Search: "brute"',
            text: '0 results.\n\n(Someone has typed below, very slowly, with one enormous finger: "WE ARE NOT IN FILE. WE FIX. ALL HUMANS GO IN FILE.")',
          },
          {
            title: "Surrogate's Strongroom — access",
            text: "Strongroom key issued to: Registrar (desk, Bureau of Vital Statistics). Emergency override: Bureau terminal.\nRegistrar's desk drawer combination on file: 1-8-1-1 (the year of the Commissioners' Plan; she says it is easy to remember).",
            learn: "pc_lk_mb_desk",
          },
        ],
      },
      "own_desk",
    );
    K.terminal(
      ctx,
      "pc_mb_term_vital",
      26,
      GAL,
      -22.4,
      0,
      {
        title: "BUREAU OF VITAL STATISTICS",
        header: "KESTREL TELETYPE · RECORDS SYSTEM v4.1",
        lock: {
          id: "pc_lk_mb_term_vital",
          passcode: "LEDGER",
          hint: "The Registrar's desk calendar has the Bureau passcode.",
        },
        entries: [
          { title: "Births registered, 03/05/1967", text: "3" },
          {
            title: "Marriages registered, 03/05/1967",
            text: "12 (Deputy Clerk Abernathy, all of them)",
          },
          {
            title: "Deaths registered, 03/05/1967",
            text: "ERROR: FIELD OVERFLOW",
          },
          {
            title: ">> Release Surrogate's Strongroom",
            cond: () => !PC.flag("mb_vault_open"),
            text: "Strongroom door released. Please mind the gap.",
            action: () => K.gateOpen(ctx, "strongroom"),
          },
        ],
      },
      "own_desk",
    );
  }

  // ------------------------------------------------------------------ Sub-basement C-9 link
  // The cryo module (src/map/50_cryo_interior.js) links this door by calling
  //   G.pois.setCryoAccessTarget({x, y, z, yaw})   (any time; stored and applied when this interior exists).
  // Until then the C-9 door is a sealed placeholder. Anchors: 'cryo_access' (door) and 'cryo_arrive' (arrival spot,
  // facing south into the service corridor) in G.pois.municipal_building.anchors / G.pois.getAnchor.
