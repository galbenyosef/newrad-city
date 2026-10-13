// play-inline-191 05 — tint
// Lines 1186-2735 of readable/play-inline-191.pretty.js (statement-aligned).
  function interior(ctx) {
    const O = ctx.O;
    const b = K.builder({
      name: "chelsea_int",
      off: O,
      lit: true,
      amb: [0.07, 0.065, 0.06],
      floors: LV.concat([2.1, 6.3, 10.5]),
      grime: 0.45,
    });
    const r = K.rng("chelsea_int");
    const wallW = [0.78, 0.66, 0.56],
      wainC = [0.55, 0.36, 0.26];

    // ---------------- stair hall (x -4..4, z -21..-12, 0..16.8) ----------------
    const SH = { x0: -4, x1: 4, z0: -21, z1: -12 };
    K.room(b, ctx, {
      x0: -4,
      z0: -21,
      x1: 4,
      z1: -12,
      y: 0,
      h: 16.8,
      floor: "mosaic",
      fc: [0.8, 0.76, 0.7],
      wall: "plaster",
      wc: [0.72, 0.62, 0.5],
      open: { s: true },
      noCeil: true,
      trim: true,
    });
    // skylight ceiling
    b.face("plaster", -4, 16.8, -21, 1, 0, 0, 0, 0, 1, 8, 9, {
      uv: "top",
      tint: [0.6, 0.58, 0.55],
    });
    b.boxMM("lamp", -1.6, 16.75, -18, 1.6, 16.78, -14, {
      tint: [0.75, 0.82, 0.88],
    });
    for (let k = 0; k <= 4; k++)
      b.boxMM(
        "black_iron",
        -1.6 + k * 0.8 - 0.03,
        16.6,
        -18,
        -1.6 + k * 0.8 + 0.03,
        16.75,
        -14,
        {},
      );
    b.light(0, 16.2, -16, [0.75, 0.85, 1.0], 1.6, 18, {
      box: [-4.1, 0, -21.1, 4.1, 17, -11.9],
    });
    b.glow(0, 16.3, -16, [0.5, 0.6, 0.7], 6);
    for (let lv = 0; lv < 4; lv++) {
      const y = LV[lv];
      // south landing slab (upper levels) — z -14..-12
      if (lv > 0) {
        b.boxMM("marble", -4, y - 0.3, -14, 4, y, -12, {
          tint: [0.7, 0.66, 0.6],
          faces: "nsewtb",
        });
        b.col(-4, y - 0.3, -14, 4, y, -12, {
          tag: "floor",
          surface: "concrete",
        });
      }
      // slab edge band facing the well at z=-12 (between this level's ceiling and the next floor)
      if (lv < 3)
        b.quad(
          "plaster",
          [-4, LV[lv] + CH, -12.02],
          [4, LV[lv] + CH, -12.02],
          [4, LV[lv + 1], -12.02],
          [-4, LV[lv + 1], -12.02],
          { tint: [0.5, 0.45, 0.4] },
        );
      // well railing on the landing edge (lace)
      K.railing(b, -1.6, -14, 1.6, -14, y, { lace: true, h: 1.0 });
      if (lv === 3) {
        K.railing(b, -4, -14, -1.6, -14, y, { lace: true });
        K.railing(b, -1.6, -14, -1.6, -18, y, { lace: true });
      }
      // sconce by the landing
      for (const s of [-1, 1]) {
        b.boxMM(
          "brass",
          s * 3.85 - 0.06,
          y + 2.2,
          -12.9,
          s * 3.85 + 0.06,
          y + 2.5,
          -12.6,
          {},
        );
        K.lamp(
          b,
          s * 3.7,
          y + 2.55,
          -12.75,
          "globe",
          [1, 0.78, 0.5],
          0.9,
          5.5,
          {
            ceil: y + 2.6,
            size: 0.12,
            lightOpts: { box: [-4.1, y - 0.5, -21.1, 4.1, y + 4.3, -11.9] },
          },
        );
      }
      if (lv < 3) {
        const ym = y + 2.1;
        // west flight up (−z), east flight up (+z)
        K.stairs(b, -4, -18, -1.6, -14, y, ym, "-z", {
          mat: "marble",
          tint: [0.72, 0.68, 0.62],
          rail: "r",
          lace: true,
          surface: "concrete",
        });
        K.stairs(b, 1.6, -18, 4, -14, ym, LV[lv + 1], "+z", {
          mat: "marble",
          tint: [0.72, 0.68, 0.62],
          rail: "r",
          lace: true,
          surface: "concrete",
        });
        // mid landing
        b.boxMM("marble", -4, ym - 0.3, -21, 4, ym, -18, {
          tint: [0.7, 0.66, 0.6],
          faces: "nsewtb",
        });
        b.col(-4, ym - 0.3, -21, 4, ym, -18, {
          tag: "floor",
          surface: "concrete",
        });
        K.railing(b, -1.6, -18, 1.6, -18, ym, { lace: true });
        K.lamp(b, 0, ym + 2.6, -19.6, "bulb", [1, 0.8, 0.55], 0.9, 6, {
          ceil: ym + 3.6,
          lightOpts: { box: [-4.1, ym - 0.5, -21.1, 4.1, ym + 4, -17] },
        });
        // paintings above the mid landing (north wall) and along the flights
        K.salonWall(
          b,
          -3.9,
          3.9,
          ym + 0.9,
          ym + 3.9,
          -21 + 0.1,
          0,
          1,
          "sh_n" + lv,
          { density: 0.9 },
        );
        K.salonWall(b, -18, -12.5, y + 1.3, y + 3.9, -3.9, 1, 0, "sh_w" + lv, {
          density: 0.9,
        });
        K.salonWall(
          b,
          -20.8,
          -12.5,
          y + 1.3,
          y + 3.9,
          3.9,
          -1,
          0,
          "sh_e" + lv,
          { density: 0.9 },
        );
      }
    }
    // under the lowest flights / landing at L0: storage closet + bench nook
    b.boxMM("mahogany", 1.6, 0, -18, 4, 2.05, -14, { tint: [0.6, 0.45, 0.35] });
    b.col(1.6, 0, -18, 4, 2.05, -14, { tag: "wall" });
    b.plate("wood_dark", 1.58, 1.0, -16, -1, 0, 0.9, 1.9, null, {
      tint: [0.45, 0.32, 0.22],
    });
    b.boxMM("mahogany", -4, 0, -21, 4, 1.78, -18, { tint: [0.55, 0.42, 0.32] });
    b.col(-4, 0, -21, 4, 1.78, -18, { tag: "wall" });
    K.framed(b, 0, 1.0, -17.98, 0, 1, 1.4, 1.0, K.painting(7, 192, 144), {});
    // the junk mobile hanging down the well
    {
      b.pipe("black_iron", 0, 16.6, -16, 0, 6.0, -16, 0.012, 3);
      for (let k = 0; k < 9; k++) {
        const y = 15.5 - k * 1.1,
          a = k * 1.3,
          rds = 0.6 + (k % 3) * 0.35;
        b.pipe(
          "black_iron",
          -Math.cos(a) * rds,
          y,
          -16 - Math.sin(a) * rds,
          Math.cos(a) * rds,
          y,
          -16 + Math.sin(a) * rds,
          0.01,
          3,
        );
        for (const s of [-1, 1]) {
          const px = s * Math.cos(a) * rds,
            pz = -16 + s * Math.sin(a) * rds;
          b.pipe("black_iron", px, y, pz, px, y - 0.4, pz, 0.006, 3);
          const kind = (k + (s > 0 ? 1 : 0)) % 4;
          if (kind === 0)
            b.cyl("chrome", px, y - 0.45, pz, 0.22, 0.22, 0.04, 12, {
              bottom: true,
            }); // hubcap
          else if (kind === 1)
            b.cyl("glass", px, y - 0.7, pz, 0.05, 0.05, 0.28, 6, {
              tint: [0.6, 0.2, 0.15],
            }); // bottle
          else if (kind === 2)
            b.box("paint_red", px, y - 0.75, pz, 0.35, 0.35, 0.02, { yaw: a }); // tin sign
          else
            b.geo("gold", K.sphereGeo(), {
              x: px,
              y: y - 0.55,
              z: pz,
              s: 0.12,
            }); // christmas bauble
        }
      }
    }

    // ---------------- L0 lobby (x -8..8, z -12..0) ----------------
    K.gap(ctx, 0, 0, 2.4, 0, 3.0, { casing: true }); // street doors
    K.gap(ctx, 0, -12, 8, 0, CH, { casing: false }); // to the stair hall
    K.gap(ctx, -6, -12, 1.1, 0, 2.3); // manager's office
    const lobby = {
      x0: -8,
      z0: -12,
      x1: 8,
      z1: 0,
      y: 0,
      h: CH,
      floor: "terrazzo",
      fc: [0.85, 0.8, 0.72],
      wall: "wallpaper",
      wc: wallW,
      wain: "wood_dark",
      wainC,
      wainH: 1.1,
      ceil: "tin",
      cc: [0.75, 0.7, 0.58],
      cornice: true,
      corniceMat: "plaster",
    };
    K.room(b, ctx, lobby);
    b.hplate("carpet", -4.6, 0.012, -6, 5.4, 4.4, 0, null, {
      tint: [0.9, 0.8, 0.75],
    });
    b.hplate("carpet", 0, 0.012, -2.2, 2.2, 3.6, 0, null, {
      tint: [0.8, 0.7, 0.65],
    });
    // fireplace on the west wall
    {
      const fx = -7.9;
      b.boxMM("marble", fx, 0, -7.4, fx + 0.5, 1.45, -6.9, {
        tint: [0.8, 0.78, 0.72],
      });
      b.boxMM("marble", fx, 0, -5.1, fx + 0.5, 1.45, -4.6, {
        tint: [0.8, 0.78, 0.72],
      });
      b.boxMM("marble", fx, 1.1, -6.9, fx + 0.5, 1.45, -5.1, {
        tint: [0.8, 0.78, 0.72],
      });
      b.boxMM("marble", fx, 1.45, -7.7, fx + 0.7, 1.6, -4.3, {
        tint: [0.75, 0.72, 0.66],
      });
      b.boxMM("paint_black", fx - 0.02, 0, -6.9, fx + 0.3, 1.1, -5.1, {
        faces: "e",
        tint: [0.12, 0.1, 0.08],
      });
      b.boxMM("brick_brown", fx, 0, -6.9, fx + 0.48, 0.12, -5.1, {
        tint: [0.3, 0.25, 0.2],
      });
      for (let k = 0; k < 3; k++)
        b.pipe(
          "wood_dark",
          fx + 0.2,
          0.18 + k * 0.08,
          -6.6 + k * 0.1,
          fx + 0.35,
          0.18 + k * 0.06,
          -5.4 - k * 0.1,
          0.07,
          6,
          { tint: [0.35, 0.2, 0.12] },
        );
      b.light(fx + 0.8, 0.5, -6, [1.0, 0.5, 0.2], 2.2, 7.5, {
        box: [-8.1, -0.1, -12.1, 8.1, 4, 0.1],
      });
      b.glow(fx + 0.35, 0.45, -6, [1, 0.45, 0.15], 1.6);
      b.col(fx, 0, -7.7, fx + 0.7, 1.6, -4.3, { tag: "furniture" });
      K.framed(b, -7.9, 2.65, -6, 1, 0, 1.9, 1.3, K.painting(3, 240, 168), {
        frame: "gold",
        fw: 0.1,
      });
      // mantel clutter
      b.cyl("brass", fx + 0.4, 1.6, -7.2, 0.06, 0.04, 0.35, 6);
      b.cyl("brass", fx + 0.4, 1.6, -4.8, 0.06, 0.04, 0.35, 6);
      b.box("wood_dark", fx + 0.35, 1.6, -6, 0.25, 0.3, 0.45, {});
    }
    K.sofa(b, -3.6, 0, -6, 2.4, HP, {
      mat: "velvet",
      tint: [0.75, 0.35, 0.35],
    });
    K.sofa(b, -5.9, 0, -3.3, 1.0, 0, {
      mat: "velvet",
      tint: [0.4, 0.5, 0.4],
      len: 1,
    });
    K.sofa(b, -5.9, 0, -8.7, 1.0, PI, { mat: "velvet", tint: [0.4, 0.5, 0.4] });
    K.table(b, -5.6, 0, -6, 1.1, 0.7, { h: 0.45, mat: "mahogany" });
    // front desk & key cubbies (east)
    b.boxMM("mahogany", 4.6, 0, -10, 5.4, 1.1, -2.6, {
      tint: [0.7, 0.45, 0.35],
    });
    b.boxMM("marble", 4.5, 1.1, -10.1, 5.5, 1.16, -2.5, {
      tint: [0.6, 0.55, 0.5],
    });
    for (let z = -9.6; z < -2.8; z += 0.9)
      b.boxMM("wood_dark", 4.55, 0.15, z, 4.6, 0.95, z + 0.7, {
        tint: [0.5, 0.3, 0.22],
      }); // panels
    b.col(4.5, 0, -10.1, 5.5, 1.16, -2.5, { tag: "counter", surface: "wood" });
    b.boxMM("mahogany", 7.55, 0.9, -9.5, 7.95, 3.2, -3.5, {
      tint: [0.6, 0.4, 0.3],
    });
    for (let row = 0; row < 5; row++)
      for (let col = 0; col < 12; col++) {
        const z = -9.35 + col * 0.49,
          y = 1.05 + row * 0.42;
        b.boxMM("wood", 7.5, y, z, 7.56, y + 0.34, z + 0.4, {
          tint: [0.55, 0.4, 0.3],
          faces: "w",
        });
        b.boxMM("mahogany", 7.44, y - 0.04, z - 0.04, 7.55, y, z + 0.44, {});
        if (r() < 0.5)
          b.boxMM(
            "brass",
            7.45,
            y + 0.05,
            z + 0.15,
            7.5,
            y + 0.2,
            z + 0.25,
            {},
          );
      }
    b.col(7.5, 0, -9.6, 8, 3.2, -3.4, { tag: "furniture" });
    b.cyl("brass", 4.9, 1.16, -8.5, 0.07, 0.03, 0.08, 8); // desk bell
    b.box("leather", 4.95, 1.16, -5.2, 0.35, 0.06, 0.5, {}); // guest ledger
    K.lamp(b, 5.0, 1.55, -4.0, "pendant", [1, 0.85, 0.55], 0.9, 4.5, {
      ceil: 1.9,
      shade: "paint_green",
    });
    b.box("brass", 5.0, 1.16, -4.0, 0.2, 0.3, 0.2, {});
    // the elevator (east of the stair opening) — brass doors, OUT OF ORDER
    b.boxMM("brass", 5.1, 0, -11.95, 7.1, 2.5, -11.85, {
      tint: [0.7, 0.55, 0.3],
    });
    b.beam("paint_black", 6.1, 0, -11.83, 6.1, 2.5, -11.83, 0.02, 0.02);
    b.cyl("brass", 6.1, 2.75, -11.9, 0.35, 0.35, 0.05, 12, {
      tint: [0.6, 0.5, 0.3],
    });
    b.plate(
      "art",
      6.1,
      1.4,
      -11.82,
      0,
      1,
      0.7,
      0.25,
      K.signCell("ooo", "OUT OF ORDER", 256, 80, {
        bg: "#e8e0c8",
        fg: "#8a1a10",
        font: "Arial, sans-serif",
      }),
    );
    // hanging sculpture: the girl on the swing
    {
      const sx = 1.8,
        sz = -5.5,
        sy = 2.2;
      for (const s of [-1, 1])
        b.pipe(
          "fabric",
          sx + s * 0.45,
          sy,
          sz,
          sx + s * 0.45,
          CH,
          sz,
          0.012,
          3,
          { tint: [0.6, 0.55, 0.45] },
        );
      b.box("wood", sx, sy - 0.05, sz, 1.1, 0.05, 0.3, {
        tint: [0.6, 0.45, 0.3],
      });
      b.cyl("cloth_red", sx, sy, sz, 0.34, 0.1, 0.55, 10, {
        tint: [0.95, 0.5, 0.6],
        bottom: true,
      }); // dress
      b.geo("ceramic", K.sphereGeo(), {
        x: sx,
        y: sy + 0.72,
        z: sz,
        s: 0.13,
        tint: [0.95, 0.85, 0.75],
      });
      b.cyl("paint_yellow", sx, sy + 0.72, sz + 0.03, 0.15, 0.12, 0.12, 8, {
        tint: [0.9, 0.7, 0.3],
      }); // hair
      for (const s of [-1, 1]) {
        b.pipe(
          "ceramic",
          sx + s * 0.1,
          sy,
          sz - 0.1,
          sx + s * 0.14,
          sy - 0.45,
          sz - 0.35,
          0.04,
          5,
          { tint: [0.95, 0.85, 0.75] },
        );
        b.pipe(
          "ceramic",
          sx + s * 0.3,
          sy + 0.5,
          sz,
          sx + s * 0.45,
          sy + 0.9,
          sz,
          0.03,
          5,
          { tint: [0.95, 0.85, 0.75] },
        );
      }
    }
    // chandelier
    {
      const cx = -1.2,
        cz = -6.4,
        cy = 3.0;
      b.pipe("brass", cx, cy, cz, cx, CH, cz, 0.02, 4);
      b.cyl("brass", cx, cy - 0.05, cz, 0.7, 0.7, 0.05, 16, {
        top: false,
        bottom: true,
      });
      for (let k = 0; k < 8; k++) {
        const a = (k * PI) / 4;
        b.geo("lamp", K.sphereGeo(), {
          x: cx + Math.cos(a) * 0.7,
          y: cy + 0.08,
          z: cz + Math.sin(a) * 0.7,
          s: 0.07,
          tint: [1, 0.8, 0.55],
        });
      }
      b.light(cx, cy - 0.3, cz, [1, 0.78, 0.5], 1.5, 11, {
        box: [-8.1, -0.1, -12.1, 8.1, 4, 0.1],
      });
      b.glow(cx, cy, cz, [0.8, 0.6, 0.4], 3.2);
    }
    b.light(0, 2.6, -0.8, [0.7, 0.75, 0.85], 0.7, 6, {
      box: [-8.1, -0.1, -12.1, 8.1, 4, 0.1],
    }); // daylight through the transom
    b.light(6.5, 2.4, -7, [1, 0.8, 0.55], 0.6, 5, {
      box: [-8.1, -0.1, -12.1, 8.1, 4, 0.1],
    });
    // street doors (inside view)
    for (const s of [-1, 1]) {
      b.boxMM("brass", s * 0.6 - 0.55, 0, -0.12, s * 0.6 + 0.55, 2.95, -0.02, {
        tint: [0.5, 0.42, 0.28],
      });
      b.plate("lamp", s * 0.6, 1.7, -0.13, 0, -1, 0.8, 2.0, null, {
        tint: [0.55, 0.6, 0.62],
      });
    }
    // salon art: every wall
    K.salonWall(b, -7.8, -1.4, 1.3, 3.6, -0.12, 0, -1, "lob_s1");
    K.salonWall(b, 1.4, 7.8, 1.3, 3.6, -0.12, 0, -1, "lob_s2");
    K.salonWall(b, -11.8, -8, 1.3, 3.6, -7.88, 1, 0, "lob_w1");
    K.salonWall(b, -4.2, -0.2, 1.3, 3.6, -7.88, 1, 0, "lob_w2");
    K.salonWall(b, -3.9, -1.2, 1.3, 3.4, -11.88, 0, 1, "lob_n1", {
      density: 0.6,
    });
    K.salonWall(b, -2.4, -0.3, 3.3, 3.7, 7.88, -1, 0, "lob_e1", {
      density: 0.5,
    });
    // dead palms in brass pots, bench, litter
    for (const [px, pz] of [
      [-7.2, -0.8],
      [7.2, -0.8],
      [-3.6, -11.2],
      [3.6, -11.2],
    ]) {
      b.cyl("brass", px, 0, pz, 0.3, 0.24, 0.55, 10, {
        tint: [0.55, 0.45, 0.3],
      });
      for (let k = 0; k < 5; k++) {
        const a = k * 1.26;
        b.beam(
          "wood_rotten",
          px,
          0.55,
          pz,
          px + Math.cos(a) * 0.6,
          1.5 + r() * 0.5,
          pz + Math.sin(a) * 0.6,
          0.03,
          0.02,
          { tint: [0.45, 0.4, 0.25] },
        );
      }
      b.col(px - 0.3, 0, pz - 0.3, px + 0.3, 0.8, pz + 0.3, {
        tag: "furniture",
      });
    }
    K.litter(b, -7.5, -11.5, 7.5, -0.5, 0, 14, 5);

    // ---------------- L0 manager's office (x -8..-4, z -21..-12) ----------------
    K.room(b, ctx, {
      x0: -8,
      z0: -21,
      x1: -4,
      z1: -12,
      y: 0,
      h: CH,
      floor: "wood",
      fc: [0.62, 0.48, 0.36],
      wall: "wallpaper_green",
      wc: [0.7, 0.72, 0.6],
      wain: "wood_dark",
      wainC,
      ceil: "plaster",
      cc: [0.6, 0.58, 0.52],
      surface: "wood",
    });
    const deskTop = K.table(b, -6, 0, -18.6, 1.8, 0.9, { mat: "mahogany" });
    K.chair(b, -6, 0, -19.6, PI, { mat: "leather", seatMat: "leather" });
    K.lamp(b, -6.6, deskTop + 0.35, -18.7, "pendant", [1, 0.9, 0.6], 0.8, 5, {
      ceil: deskTop + 0.4,
      shade: "paint_green",
      lightOpts: { box: [-8.1, -0.1, -21.1, -3.9, 4, -11.9] },
    });
    b.box("leather", -6.6, deskTop, -18.7, 0.2, 0.35, 0.2, {});
    K.lamp(b, -6, 3.4, -15, "bulb", [1, 0.8, 0.55], 0.6, 6, {
      ceil: CH,
      lightOpts: { box: [-8.1, -0.1, -21.1, -3.9, 4, -11.9] },
    });
    K.shelf(b, -7.75, 0, -15.5, HP, 2.4, {
      mat: "wood_dark",
      items: ["book", "book", "box"],
      h: 2.2,
      seed: 3,
    });
    K.framed(b, -4.12, 2.2, -17.5, -1, 0, 0.9, 1.2, K.painting(2, 160, 208), {
      frame: "gold",
    });
    K.sofa(b, -4.7, 0, -14, 1.6, -HP, {
      mat: "leather",
      tint: [0.5, 0.35, 0.25],
    });
    K.terminal(
      ctx,
      "pv_term_chelsea_desk",
      -5.6,
      deskTop,
      -18.8,
      0,
      termDesk(),
      "bare",
    );
    K.loot(ctx, "safe", -7.85, 1.2, -19.8, HP, {
      wall: true,
      loot: "wall_safe",
      lock: LK.hotelSafe,
      name: "Hotel Safe",
      tag: "safe",
    });
    K.loot(ctx, "file_cabinet", -7.6, 0, -13, HP, { loot: "file_cabinet" });
    K.loot(ctx, "desk", -5.2, 0, -12.9, PI, {
      loot: "desk",
      name: "Clerk's Desk",
    });
    K.note(ctx, "pv_note_chelsea_rules", -6.4, deskTop + 0.01, -18.3, {
      name: "House Rules of the Hotel Chelsea",
      title: "HOUSE RULES (revised, 1988)",
      text: "HOTEL CHELSEA — RULES OF THE HOUSE\n\n1. Rent may be paid in scrip, canvases, or a decent song.\n2. No shooting in the stairwell. The paintings were here first.\n3. Maniacs are not \"performance art.\" Kill them in the street, please.\n4. Strangers are welcome if they wipe their boots.\n5. The penthouse is Mr. Moretz's. Mr. Moretz has been dead for twenty-two years. It is still Mr. Moretz's.\n6. Do not feed Johnny Nitro after midnight. Do not feed Johnny Nitro.\n\n— Stanley, Front Desk (since before the bombs)",
    });

    // ---------------- upper floors ----------------
    for (let lv = 1; lv < 4; lv++) {
      const y = LV[lv];
      const box = (x0, z0, x1, z1) => ({
        box: [x0 - 0.1, y - 0.2, z0 - 0.1, x1 + 0.1, y + CH + 0.2, z1 + 0.1],
      });
      // corridor
      K.gap(ctx, 0, -12, 8, y, CH, { casing: false });
      K.gap(ctx, -6, -12, 1.1, y, 2.3);
      if (lv < 3) {
        K.gap(ctx, -4, -9.6, 1.1, y, 2.3);
        K.gap(ctx, 4, -9.6, 1.1, y, 2.3);
      } else K.gap(ctx, 0, -9.6, 1.1, y, 2.3); // the locked penthouse door
      K.room(b, ctx, {
        x0: -8,
        z0: -12,
        x1: 8,
        z1: -9.6,
        y,
        h: CH,
        floor: "wood",
        fc: [0.55, 0.42, 0.32],
        wall: "wallpaper",
        wc: [0.62, 0.66, 0.55],
        wain: "wood_dark",
        wainC,
        ceil: "plaster",
        cc: [0.6, 0.58, 0.52],
        surface: "wood",
        open: { n: false },
      });
      b.hplate("carpet", 0, y + 0.012, -10.8, 15.4, 1.3, 0, null, {
        tint: [0.8, 0.7, 0.65],
      });
      for (const x of [-6, 0, 6])
        K.lamp(b, x, y + 2.3, -9.72, "cage", [1, 0.78, 0.5], 0.7, 4.5, {
          ceil: y + 2.4,
          lightOpts: box(-8, -12, 8, -9.6),
        });
      K.salonWall(b, -7.8, -4.8, y + 1.3, y + 3.5, -9.72, 0, -1, "cor_s" + lv, {
        density: 0.9,
      });
      K.salonWall(b, -3.2, 3.2, y + 1.3, y + 3.5, -9.72, 0, -1, "cor_s2" + lv, {
        density: 0.9,
      });
      // fake numbered doors at both corridor ends
      for (const s of [-1, 1]) {
        b.plate("wood_dark", s * 7.88, y + 1.1, -10.8, -s, 0, 1.0, 2.2, null, {
          tint: [0.45, 0.3, 0.22],
        });
        b.plate(
          "art",
          s * 7.86,
          y + 2.35,
          -10.8,
          -s,
          0,
          0.4,
          0.14,
          K.signCell(
            "rn" + lv + s,
            String(lv + 1) + (s < 0 ? "01" : "09"),
            128,
            48,
            { bg: "#2a2016", fg: "#d8b060" },
          ),
        );
      }
      // room number plates beside the studio doors
      if (lv < 3)
        b.plate(
          "art",
          -4.9,
          y + 1.6,
          -9.72,
          0,
          -1,
          0.34,
          0.12,
          K.signCell("rw" + lv, String(lv + 1) + "22", 128, 48, {
            bg: "#2a2016",
            fg: "#d8b060",
          }),
        );
      if (lv < 3)
        b.plate(
          "art",
          4.9,
          y + 1.6,
          -9.72,
          0,
          -1,
          0.34,
          0.12,
          K.signCell("re" + lv, String(lv + 1) + "24", 128, 48, {
            bg: "#2a2016",
            fg: "#d8b060",
          }),
        );
      // side room west (x -8..-4, z -21..-12)
      K.room(b, ctx, {
        x0: -8,
        z0: -21,
        x1: -4,
        z1: -12,
        y,
        h: CH,
        floor: lv === 1 ? "hextile" : "wood",
        fc: [0.72, 0.7, 0.66],
        wall: "plaster",
        wc: [0.72, 0.7, 0.62],
        ceil: "plaster",
        cc: [0.6, 0.58, 0.52],
        surface: lv === 1 ? "concrete" : "wood",
      });
      K.lamp(b, -6, y + 3.2, -16.5, "bulb", [1, 0.8, 0.55], 0.7, 6, {
        ceil: y + CH,
        lightOpts: box(-8, -21, -4, -12),
      });
      // elevator doors on the corridor east end of the north wall (shaft behind x 4..8)
      b.boxMM("brass", 5.1, y, -11.95, 7.1, y + 2.5, -11.85, {
        tint: lv === 2 ? [0.35, 0.3, 0.2] : [0.6, 0.5, 0.3],
      });
      if (lv === 2) {
        b.plate("paint_black", 6.1, y + 1.25, -11.84, 0, 1, 0.6, 2.4, null);
        b.pipe("rust", 6.0, y + 0.1, -11.9, 6.0, y + 2.4, -11.9, 0.02, 4);
      }
    }

    // ---- L1: Odile's studio (W), Leopold's gallery (E), commune kitchen (side W) ----
    {
      const y = LV[1];
      const bx = [-8.1, y - 0.2, -9.7, 0.1, y + 4, 0.1];
      K.room(b, ctx, {
        x0: -8,
        z0: -9.6,
        x1: 0,
        z1: 0,
        y,
        h: CH,
        floor: "wood",
        fc: [0.62, 0.5, 0.4],
        wall: "plaster",
        wc: [0.82, 0.78, 0.7],
        ceil: "plaster",
        cc: [0.7, 0.68, 0.62],
        surface: "wood",
      });
      studioWindows(b, -8, 0, y, bx);
      // paint everywhere
      for (let k = 0; k < 14; k++)
        b.hplate(
          "decal",
          -7.5 + r() * 7,
          y + 0.013 + k * 0.0004,
          -9 + r() * 8.5,
          0.6 + r() * 0.9,
          0.6 + r() * 0.9,
          r() * 6,
          K.decal("paint", k % 5),
          { tint: [1, 1, 1] },
        );
      easel(b, -4.2, y, -5.2, PI + 0.4, K.painting(12, 192, 240));
      easel(b, -6.4, y, -3.2, PI - 0.6, K.painting(25, 192, 240));
      easel(b, -2.0, y, -7.4, PI + 0.9, K.painting(31, 192, 240));
      K.framed(
        b,
        -4,
        y + 2.1,
        -9.48,
        0,
        1,
        3.2,
        2.2,
        K.painting(14, 256, 176),
        { frame: "wood_dark", fw: 0.08 },
      ); // big work in progress
      for (let k = 0; k < 6; k++) {
        // canvases leaning on the east wall
        const zz = -8.8 + k * 0.5,
          hh = 0.8 + r() * 0.8;
        b.quad(
          "art",
          [-0.14 - k * 0.02, y + 0.02, zz - 0.35],
          [-0.14 - k * 0.02, y + 0.02, zz + 0.35],
          [-0.4 - k * 0.02, y + hh, zz + 0.35],
          [-0.4 - k * 0.02, y + hh, zz - 0.35],
          { rect: K.painting(40 + k, 128, 160), grime: 0 },
        );
      }
      K.table(b, -7.1, y, -6.5, 0.8, 2.0, { mat: "wood" });
      for (let k = 0; k < 9; k++)
        b.cyl(
          "glass",
          -7.3 + (k % 3) * 0.2,
          y + 0.76,
          -7.3 + Math.floor(k / 3) * 0.6,
          0.05,
          0.05,
          0.14,
          6,
          { tint: [r(), r(), r()] },
        );
      K.bed(b, -1.6, y, -1.8, PI, {
        w: 1.1,
        l: 1.9,
        frame: "black_iron",
        tint: [0.7, 0.4, 0.35],
      });
      b.hplate("fabric", -4.5, y + 0.014, -5, 3, 2.4, 0.2, null, {
        tint: [0.75, 0.72, 0.62],
      }); // drop cloth
      K.lamp(b, -4, y + 3.1, -5, "bulb", [1, 0.85, 0.6], 0.8, 7, {
        ceil: y + CH,
        lightOpts: { box: bx },
      });
      K.anchor(ctx, "vivienne", -4.8, y, -4.0);
      K.loot(ctx, "footlocker", -7.5, y, -1.0, HP, {
        loot: "footlocker",
        name: "Paint Chest",
        owner: "settlers",
      });

      const gb = [-0.1, y - 0.2, -9.7, 8.1, y + 4, 0.1];
      K.room(b, ctx, {
        x0: 0,
        z0: -9.6,
        x1: 8,
        z1: 0,
        y,
        h: CH,
        floor: "wood",
        fc: [0.55, 0.42, 0.32],
        wall: "plaster",
        wc: [0.9, 0.88, 0.84],
        ceil: "plaster",
        cc: [0.75, 0.74, 0.7],
        surface: "wood",
      });
      studioWindows(b, 0, 8, y, gb);
      // spot-lit hang with price tags
      const gal = [
        [1.6, -9.48, 0, 1],
        [4.0, -9.48, 0, 1],
        [6.4, -9.48, 0, 1],
        [7.88, -7, -1, 0],
        [7.88, -4.4, -1, 0],
        [0.12, -7, 1, 0],
        [0.12, -4.2, 1, 0],
      ];
      gal.forEach(([gx, gz, nx, nz], k) => {
        const px = gx,
          pz = gz;
        K.framed(
          b,
          px,
          y + 1.8,
          pz,
          nx,
          nz,
          1.3,
          1.0,
          K.painting(50 + k, 192, 144),
          { frame: "black_iron" },
        );
        b.plate(
          "art",
          px + nz * 0.9,
          y + 1.1,
          pz - nx * 0.9,
          nx,
          nz,
          0.2,
          0.08,
          K.signCell("price" + k, 60 + k * 35 + " scrip", 96, 40, {
            bg: "#e8e4d8",
            fg: "#222",
            font: "Arial",
          }),
        );
        b.light(
          px + nx * 1.2,
          y + 3.4,
          pz + nz * 1.2,
          [1, 0.92, 0.8],
          0.7,
          3.2,
          { box: gb },
        );
        b.boxMM(
          "black_iron",
          px + nx * 0.8 - 0.06,
          y + CH - 0.25,
          pz + nz * 0.8 - 0.06,
          px + nx * 0.8 + 0.06,
          y + CH,
          pz + nz * 0.8 + 0.06,
          {},
        );
      });
      // plinth + bust, counter
      b.boxMM("paint_white", 3.6, y, -5.4, 4.4, y + 1.1, -4.6, {
        tint: [0.85, 0.85, 0.82],
      });
      b.geo("marble", K.sphereGeo(), {
        x: 4,
        y: y + 1.42,
        z: -5,
        s: 0.2,
        sy: 0.25,
      });
      b.cyl("marble", 4, y + 1.1, -5, 0.22, 0.16, 0.12, 10);
      b.col(3.6, y, -5.4, 4.4, y + 1.1, -4.6, { tag: "furniture" });
      b.boxMM("wood_dark", 4.6, y, -2.9, 7.6, y + 1.05, -2.2, {
        tint: [0.5, 0.35, 0.25],
      });
      b.col(4.6, y, -2.9, 7.6, y + 1.05, -2.2, {
        tag: "counter",
        surface: "wood",
      });
      K.shelf(b, 7.75, y, -1.1, -HP, 1.8, {
        mat: "wood_dark",
        items: ["jar", "paint", "bottle", "box"],
        h: 2.0,
        seed: 8,
      });
      K.lamp(b, 4, y + 3.2, -4.5, "globe", [1, 0.9, 0.75], 0.8, 8, {
        ceil: y + CH,
        size: 0.15,
        lightOpts: { box: gb },
      });
      K.anchor(ctx, "merchant", 6.1, y, -1.4);
      K.loot(ctx, "cash_register", 6.6, y + 1.05, -2.55, PI, {
        container: false,
      });

      const kb = [-8.1, y - 0.2, -21.1, -3.9, y + 4, -11.9];
      // kitchen: stove, sink, table
      b.boxMM("paint_white", -7.9, y, -20.9, -6.2, y + 0.92, -20.2, {
        tint: [0.85, 0.83, 0.78],
      });
      for (let k = 0; k < 4; k++)
        b.cyl(
          "black_iron",
          -7.6 + (k % 2) * 0.8,
          y + 0.92,
          -20.7 + Math.floor(k / 2) * 0.35,
          0.12,
          0.12,
          0.02,
          10,
        );
      b.boxMM("ceramic", -5.9, y + 0.8, -20.9, -4.6, y + 0.92, -20.3, {
        tint: [0.9, 0.9, 0.86],
      });
      b.col(-7.9, y, -20.9, -4.6, y + 0.92, -20.2, { tag: "counter" });
      K.shelf(b, -7.75, y, -17.5, HP, 2.0, {
        mat: "wood",
        items: ["can", "jar", "can", "bottle"],
        h: 1.8,
        seed: 21,
      });
      K.table(b, -6, y, -15, 1.2, 1.6, { mat: "wood" });
      for (const [cx, cz, cy] of [
        [-6.8, -15, -HP],
        [-5.2, -15, HP],
        [-6, -16.1, 0],
      ])
        K.chair(b, cx, y, cz, cy, { mat: "wood" });
      K.lamp(b, -6, y + 2.4, -15, "pendant", [1, 0.85, 0.6], 0.9, 5.5, {
        ceil: y + CH,
        shade: "paint_red",
        lightOpts: { box: kb },
      });
      K.loot(ctx, "fridge", -4.5, y, -20.5, 0, {
        loot: "fridge",
        owner: "settlers",
      });
      K.loot(ctx, "radio", -6.3, y + 0.77, -14.6, 0.3, { container: false });
    }

    // ---- L2: Room 822 (W), the Writer's room (E), laundry (side W) ----
    {
      const y = LV[2];
      const wb = [-8.1, y - 0.2, -9.7, 0.1, y + 4, 0.1];
      K.room(b, ctx, {
        x0: -8,
        z0: -9.6,
        x1: 0,
        z1: 0,
        y,
        h: CH,
        floor: "wood",
        fc: [0.45, 0.36, 0.3],
        wall: "plaster",
        wc: [0.5, 0.48, 0.46],
        ceil: "plaster",
        cc: [0.5, 0.48, 0.46],
        surface: "wood",
      });
      studioWindows(b, -8, 0, y, wb, true);
      b.hplate("fabric", -6.4, y + 0.02, -7.6, 1.6, 2.1, 0.1, null, {
        tint: [0.5, 0.45, 0.4],
      }); // mattress stain
      b.boxMM("fabric", -7.3, y, -8.7, -5.5, y + 0.22, -6.6, {
        tint: [0.55, 0.5, 0.42],
      });
      b.col(-7.3, y, -8.7, -5.5, y + 0.22, -6.6, {
        tag: "furniture",
        surface: "fabric",
      });
      const tags = [
        ["NITRO", "#e03030"],
        ["BURN IT DOWN", "#e0e0e0"],
        ["822", "#40c0ff"],
        ["NO GODS NO MASTERS NO RENT", "#f0d030"],
      ];
      tags.forEach(([t, c], k) =>
        b.plate(
          "decal",
          -7.88,
          y + 1.6 + (k % 2) * 1.0,
          -8.5 + k * 2.2,
          1,
          0,
          2.2,
          0.8,
          K.tag(t, c, 256, 96, { rot: k % 2 ? 0.08 : -0.06 }),
        ),
      );
      b.plate(
        "decal",
        -4,
        y + 2.2,
        -9.48,
        0,
        1,
        3.4,
        1.2,
        K.tag("CHELSEA NEVER SLEEPS", "#ff60c0", 384, 96),
      );
      // amp stack + guitar + drum
      b.boxMM("paint_black", -1.4, y, -9.4, -0.3, y + 1.4, -8.7, {
        tint: [0.2, 0.2, 0.2],
      });
      b.plate("fabric", -0.85, y + 0.8, -8.69, 0, 1, 0.9, 0.9, null, {
        tint: [0.35, 0.33, 0.3],
      });
      b.col(-1.4, y, -9.4, -0.3, y + 1.4, -8.7, { tag: "furniture" });
      b.box("paint_red", -2.0, y + 0.02, -8.8, 0.35, 0.9, 0.08, { yaw: 0.2 });
      b.cyl("paint_white", -3.2, y, -8.6, 0.3, 0.3, 0.35, 12, {
        tint: [0.8, 0.2, 0.2],
      });
      for (let k = 0; k < 16; k++)
        b.cyl("glass", -7 + r() * 6, y, -5 + r() * 4.5, 0.035, 0.035, 0.24, 6, {
          tint: r.pick([
            [0.3, 0.5, 0.3],
            [0.5, 0.3, 0.15],
          ]),
        });
      K.litter(b, -7.5, -9, -0.5, -0.5, y, 16, 22);
      K.lamp(b, -4, y + 3.0, -4.5, "bulb", [1, 0.4, 0.8], 0.9, 7, {
        ceil: y + CH,
        lightOpts: { box: wb },
      }); // pink bulb
      K.anchor(ctx, "johnny", -3.2, y, -5.5);
      K.loot(ctx, "footlocker", -0.6, y, -1, -HP, {
        loot: "chems",
        name: "Johnny's Stash",
        owner: "settlers",
      }); // never locked: Johnny lost the key years ago

      const eb = [-0.1, y - 0.2, -9.7, 8.1, y + 4, 0.1];
      K.room(b, ctx, {
        x0: 0,
        z0: -9.6,
        x1: 8,
        z1: 0,
        y,
        h: CH,
        floor: "carpet",
        fc: [0.6, 0.5, 0.45],
        wall: "wallpaper",
        wc: [0.6, 0.55, 0.5],
        wain: "wood_dark",
        wainC,
        ceil: "plaster",
        cc: [0.55, 0.52, 0.48],
        surface: "carpet",
      });
      studioWindows(b, 0, 8, y, eb, true);
      const dt = K.table(b, 5.6, y, -6.8, 1.6, 0.8, { mat: "mahogany" });
      K.chair(b, 5.6, y, -6.0, PI, { mat: "mahogany" });
      b.box("paint_black", 5.6, dt, -6.95, 0.5, 0.18, 0.4, {
        tint: [0.25, 0.25, 0.25],
      }); // typewriter
      b.box("cloth_white", 5.6, dt + 0.12, -7.1, 0.3, 0.3, 0.02, {
        yaw: 0.2,
        tint: [0.9, 0.88, 0.8],
      });
      K.shelf(b, 7.75, y, -4.5, -HP, 3.0, {
        mat: "wood_dark",
        items: ["book", "book", "book", "box"],
        h: 2.4,
        seed: 33,
      });
      K.shelf(b, 0.25, y, -4.5, HP, 3.0, {
        mat: "wood_dark",
        items: ["book", "book", "book"],
        h: 2.4,
        seed: 34,
      });
      for (let k = 0; k < 90; k++)
        b.hplate(
          "flat",
          1 + r() * 6.6,
          y + 0.013 + k * 0.0003,
          -9.2 + r() * 8.8,
          0.21,
          0.29,
          r() * 6.3,
          null,
          { tint: [0.86, 0.84, 0.76] },
        ); // pages everywhere
      for (let k = 0; k < 5; k++)
        b.box("flat", 1.2 + k * 0.35, y, -8.8, 0.25, 0.1 + k * 0.08, 0.32, {
          tint: [0.85, 0.82, 0.74],
        }); // manuscript stacks
      K.lamp(b, 5.0, dt + 0.35, -7.1, "pendant", [1, 0.85, 0.6], 0.9, 5, {
        ceil: dt + 0.45,
        shade: "paint_green",
        lightOpts: { box: eb },
      });
      b.box("brass", 5.0, dt, -7.1, 0.15, 0.4, 0.15, {});
      K.skel(ctx, 5.6, y, -6.05, PI, "seated");
      K.note(ctx, "pv_note_chelsea_manuscript", 5.9, dt + 0.01, -6.7, {
        name: "The Last Chapter (typescript)",
        title: "THE NEON AND THE DARK — Chapter 41",
        text: "The sirens started at 9:42 and I did not get up. I had eleven pages left and the light through the window was the best it has ever been, very white, whiter than a page.\n\nDown the hall Moretz is still painting. Nitro is screaming along to the radio. The desk clerk is telling everyone to stay calm and pay their rent.\n\nIf anyone reads this: the hotel will survive. It always does. Buildings like this are too stubborn to die and too interesting to be left alone. Somebody will move in. Somebody will hang a painting over the burn marks.\n\nI am going to finish the chapter now.\n\n(the rest of the page is blank)",
      });
      K.loot(ctx, "desk", 1.6, y, -1.0, 0, {
        loot: "desk",
        name: "Writing Desk",
      });
      K.loot(ctx, "footlocker", 7.3, y, -1.0, -HP, {
        loot: "books",
        name: "Trunk of Rejection Letters",
      });

      const lb = [-8.1, y - 0.2, -21.1, -3.9, y + 4, -11.9];
      for (let k = 0; k < 3; k++) {
        b.cyl("metal", -7.3, y, -20.2 + k * 1.1, 0.4, 0.38, 0.8, 10, {
          tint: [0.6, 0.62, 0.6],
        });
        b.col(-7.7, y, -20.6 + k * 1.1, -6.9, y + 0.8, -19.8 + k * 1.1, {
          tag: "furniture",
        });
      }
      b.pipe("black_iron", -7.6, y + 2.2, -13, -4.4, y + 2.2, -13, 0.01, 3);
      for (let k = 0; k < 4; k++)
        b.box("fabric", -7.2 + k * 0.8, y + 1.5, -13, 0.6, 0.7, 0.02, {
          tint: r.pick([
            [0.7, 0.6, 0.5],
            [0.4, 0.45, 0.6],
            [0.6, 0.3, 0.3],
          ]),
        });
      K.shelf(b, -4.25, y, -17, -HP, 2.4, {
        mat: "metal",
        items: ["box", "can", "jar"],
        seed: 44,
      });
      K.loot(ctx, "locker", -7.7, y, -15.5, HP, {
        loot: "locker",
        lock: LK.storage,
        name: "Storage Locker",
      });
      K.loot(ctx, "toolbox", -5.2, y, -20.6, 0, { loot: "toolbox" });
      K.note(ctx, "pv_note_chelsea_johnny", -6.8, y + 0.82, -20.2, {
        name: "Laundry Complaint",
        title: "To whoever keeps washing giant roach guts in Tub #2",
        learn: LK.storage.id,
        text: "It is Johnny. We all know it is Johnny.\n\nJohnny, the roaches are not \"a delicacy of the Lower East Side.\" Katz's never sold roach. Katz's sold PASTRAMI. The roaches are just what LIVES there now, in the basement, a whole kingdom of them around one enormous queen. Stop bringing them home.\n\n— Management (Stanley)\n\nP.S. To everyone else: the storage locker combination is 4-1-1-9. Stop knocking on my desk at night to ask.",
      });
    }

    // ---- L3: the Skylight Penthouse (locked) + roof access ----
    {
      const y = LV[3];
      const pb = [-8.1, y - 0.2, -9.7, 8.1, y + 4.6, 0.1];
      K.room(b, ctx, {
        x0: -8,
        z0: -9.6,
        x1: 8,
        z1: 0,
        y,
        h: 4.4,
        floor: "wood",
        fc: [0.65, 0.5, 0.38],
        wall: "plaster",
        wc: [0.85, 0.8, 0.72],
        ceil: "plaster",
        cc: [0.75, 0.72, 0.66],
        surface: "wood",
        noCeil: true,
      });
      // skylight roof: sloped glass
      b.quad(
        "plaster",
        [-8, y + 4.4, -9.6],
        [8, y + 4.4, -9.6],
        [8, y + 4.4, -6.6],
        [-8, y + 4.4, -6.6],
        { tint: [0.6, 0.58, 0.54] },
      );
      b.quad(
        "lamp",
        [-8, y + 4.4, -6.6],
        [8, y + 4.4, -6.6],
        [8, y + 3.6, 0],
        [-8, y + 3.6, 0],
        { tint: [0.36, 0.4, 0.42] },
      );
      for (let x = -8; x <= 8; x += 0.8)
        b.beam("black_iron", x, y + 4.38, -6.6, x, y + 3.58, 0, 0.05, 0.08);
      for (let t = 0; t <= 1.001; t += 0.25)
        b.beam(
          "black_iron",
          -8,
          y + 4.38 - 0.8 * t,
          -6.6 + 6.6 * t,
          8,
          y + 4.38 - 0.8 * t,
          -6.6 + 6.6 * t,
          0.05,
          0.06,
        );
      b.light(0, y + 3.8, -3, [0.8, 0.88, 1.0], 1.5, 12, { box: pb });
      b.glow(0, y + 3.9, -3, [0.35, 0.4, 0.45], 6);
      // the unfinished masterpiece
      K.framed(
        b,
        0,
        y + 2.2,
        -9.48,
        0,
        1,
        7.0,
        3.0,
        K.paint("art", "voss_panorama", 512, 220, function (x, X, Y, W, H) {
          const g = x.createLinearGradient(0, Y, 0, Y + H);
          g.addColorStop(0, "#e8b070");
          g.addColorStop(0.6, "#c05a40");
          g.addColorStop(1, "#3a2030");
          x.fillStyle = g;
          x.fillRect(X, Y, W, H);
          const rr = K.rng("voss");
          x.fillStyle = "#20141e";
          let px = X;
          while (px < X + W) {
            const w = 8 + rr() * 22,
              h = H * (0.2 + rr() * 0.6);
            x.fillRect(px, Y + H - h, w, h);
            px += w + 2;
          }
          x.fillStyle = "rgba(255,240,200,0.9)";
          x.beginPath();
          x.arc(X + W * 0.72, Y + H * 0.3, 26, 0, 6.3);
          x.fill();
          x.fillStyle = "#e8e0cc";
          x.fillRect(X + W * 0.78, Y, W * 0.22, H); // unpainted canvas
          x.strokeStyle = "rgba(40,30,20,0.4)";
          for (let k = 0; k < 12; k++) {
            x.beginPath();
            x.moveTo(X + W * 0.8, Y + rr() * H);
            x.lineTo(X + W * (0.8 + rr() * 0.2), Y + rr() * H);
            x.stroke();
          }
        }),
        { frame: false },
      );
      b.boxMM("wood", -3.6, y, -9.4, 3.6, y + 0.15, -8.8, {
        tint: [0.5, 0.4, 0.3],
      });
      K.sofa(b, 3.5, y, -3.5, 2.2, -HP + 0.3, {
        mat: "velvet",
        tint: [0.55, 0.3, 0.45],
      }); // chaise
      K.skel(ctx, 3.4, y + 0.45, -3.5, -HP, "lying");
      // a patron's life: rug, bookcases, canvases stacked ten deep, a wine table, a dead fig under the skylight
      b.hplate("carpet", 1.5, y + 0.012, -4.2, 6.5, 4.2, 0.05, null, {
        tint: [0.65, 0.35, 0.3],
      });
      K.shelf(b, 7.75, y, -4.6, -HP, 2.6, {
        mat: "wood_dark",
        items: ["book", "book", "paint", "book"],
        h: 2.6,
        seed: 66,
      });
      K.shelf(b, -7.75, y, -8.4, HP, 2.0, {
        mat: "wood_dark",
        items: ["book", "jar", "book"],
        h: 2.6,
        seed: 67,
      });
      for (let k = 0; k < 8; k++) {
        const zz = -2.8 + k * 0.28,
          hh = 1.0 + r() * 0.9,
          xx = -7.86 + k * 0.03;
        b.quad(
          "art",
          [xx, y + 0.02, zz - 0.45],
          [xx, y + 0.02, zz + 0.45],
          [xx + 0.25, y + hh, zz + 0.45],
          [xx + 0.25, y + hh, zz - 0.45],
          { rect: K.painting(90 + k, 128, 160), grime: 0.1 },
        );
      }
      K.roundTable(b, 1.4, y, -2.4, 0.5, { mat: "mahogany" });
      for (let k = 0; k < 4; k++)
        b.cyl(
          "glass",
          1.2 + k * 0.14,
          y + 0.76,
          -2.4 + (k % 2) * 0.12,
          0.04,
          0.035,
          0.3,
          6,
          { tint: [0.35, 0.15, 0.2] },
        );
      b.cyl("ceramic", -4.8, y, -1.2, 0.35, 0.28, 0.55, 12, {
        tint: [0.6, 0.35, 0.25],
      });
      for (let k = 0; k < 6; k++) {
        const a = k * 1.05;
        b.pipe(
          "wood_rotten",
          -4.8,
          y + 0.5,
          -1.2,
          -4.8 + Math.cos(a) * 0.6,
          y + 1.7 + r() * 0.5,
          -1.2 + Math.sin(a) * 0.6,
          0.03,
          4,
        );
      }
      b.col(-5.15, y, -1.55, -4.45, y + 0.55, -0.85, { tag: "furniture" });
      easel(b, -2, y, -4, PI + 0.2, K.painting(19, 192, 240));
      easel(b, -5, y, -2.2, PI - 0.5, K.painting(22, 192, 240));
      b.boxMM("mahogany", -7.6, y, -6.5, -6.6, y + 0.9, -5.2, {}); // gramophone table
      b.cyl("brass", -7.1, y + 0.95, -5.85, 0.05, 0.3, 0.45, 10, {
        top: false,
      });
      b.col(-7.6, y, -6.5, -6.6, y + 0.9, -5.2, { tag: "furniture" });
      for (const [px, pz] of [
        [6.5, -8.2],
        [6.5, -6.8],
      ]) {
        b.boxMM(
          "paint_white",
          px - 0.35,
          y,
          pz - 0.35,
          px + 0.35,
          y + 1.0,
          pz + 0.35,
          {},
        );
        b.geo("marble", K.sphereGeo(), {
          x: px,
          y: y + 1.25,
          z: pz,
          s: 0.18,
          sy: 0.24,
        });
        b.col(px - 0.35, y, pz - 0.35, px + 0.35, y + 1.0, pz + 0.35, {});
      }
      for (let k = 0; k < 10; k++)
        b.hplate(
          "decal",
          -6 + r() * 12,
          y + 0.013 + k * 0.0004,
          -8 + r() * 7,
          0.7,
          0.7,
          r() * 6,
          K.decal("paint", k % 5),
        );
      K.anchor(ctx, "penthouse", 0, y, -4);
      K.loot(ctx, "safe", 7.2, y, -1.0, -HP, {
        loot: "safe",
        lock: LK.strongbox,
        name: "Moretz's Strongbox",
      });
      K.note(ctx, "pv_note_voss", -1.6, y + 0.9, -3.6, {
        name: "Moretz's Sketchbook",
        title: "Sketchbook of Aurelio Moretz (last pages)",
        learn: LK.strongbox.id,
        text: "March. Sunday. The light is wrong today. Too white, from the north. Everyone downstairs is running.\n\nI will not go down to the shelter. They would put me in a grey suit and give me a number. I have had a name for seventy years and I intend to be buried in it.\n\nThe panorama is not finished. The right side is blank. That is where tomorrow goes.\n\nWhoever finds this: finish it. Not with paint. With living. And take the money in the strongbox; it opens to the day I was born, 3-11-1896, and I shan't be needing it.",
      });
      K.anchor(ctx, "beret", -1.3, y + 0.8, -3.4);

      // roof access (side W)
      const rb = [-8.1, y - 0.2, -21.1, -3.9, y + 4, -11.9];
      b.boxMM("black_iron", -6.4, y, -20.8, -5.6, y + CH, -20.7, {});
      for (let k = 0; k < 12; k++)
        b.beam(
          "black_iron",
          -6.4,
          y + 0.3 + k * 0.3,
          -20.7,
          -5.6,
          y + 0.3 + k * 0.3,
          -20.7,
          0.03,
          0.03,
        );
      b.plate("wood_dark", -6, y + 1.2, -20.88, 0, 1, 1.0, 2.2, null, {
        tint: [0.5, 0.35, 0.25],
      });
      b.plate(
        "art",
        -6,
        y + 2.6,
        -20.86,
        0,
        1,
        0.9,
        0.3,
        K.signCell("roofsign", "ROOF GARDEN", 256, 80, {
          bg: "#2a3a2a",
          fg: "#d8e8c0",
        }),
      );
      K.lamp(b, -6, y + 3.2, -16, "bulb", [0.9, 0.95, 1.0], 0.8, 6, {
        ceil: y + CH,
        lightOpts: { box: rb },
      });
      K.shelf(b, -4.25, y, -16, -HP, 2.0, {
        mat: "wood",
        items: ["paint", "jar", "box"],
        seed: 55,
      });
    }

    // ---- doors ----
    const OX = O.x,
      OY = O.y,
      OZ = O.z;
    // street ↔ lobby
    // (street side positions are authored like the façade, then flipped onto 23rd Street; the exit faces south)
    const dIn = fp(DOOR_X, Z0 - 0.3),
      dOut = fp(DOOR_X, Z0 - 2.2);
    K.door(ctx, {
      id: "pv_chelsea_in",
      pos: new THREE.Vector3(dIn.x, 1.4, dIn.z),
      label: "Hotel Chelsea",
      verb: "Enter",
      target: { x: OX, y: OY, z: OZ - 1.6, yaw: 0 },
      onEnter: () => K.safe("disc", () => G.discover("chelsea_hotel")),
    });
    K.door(ctx, {
      id: "pv_chelsea_out",
      pos: new THREE.Vector3(OX, OY + 1.4, OZ - 0.4),
      label: "West 23rd Street",
      verb: "Leave",
      target: { x: dOut.x, y: 0, z: dOut.z, yaw: PI },
    });
    // penthouse (locked: Moretz's key from Odile, or Stanley's spare)
    b.boxMM("mahogany", -0.55, LV[3], -9.66, 0.55, LV[3] + 2.3, -9.54, {
      tint: [0.6, 0.4, 0.3],
    });
    b.col(-0.55, LV[3], -9.7, 0.55, LV[3] + 2.3, -9.5, { tag: "door" });
    b.cyl("brass", 0.35, LV[3] + 1.0, -9.7, 0.04, 0.04, 0.05, 6);
    b.plate(
      "art",
      0,
      LV[3] + 2.55,
      -9.72,
      0,
      -1,
      0.6,
      0.18,
      K.signCell("pent", "PENTHOUSE", 256, 64, {
        bg: "#2a2016",
        fg: "#d8b060",
      }),
    );
    K.door(ctx, {
      id: "pv_chelsea_penthouse",
      pos: new THREE.Vector3(OX, OY + LV[3] + 1.3, OZ - 9.9),
      label: "Penthouse — A. Moretz",
      verb: "Open",
      lock: LK.penthouse,
      target: { x: OX, y: OY + LV[3], z: OZ - 8.6, yaw: PI },
    });
    K.door(ctx, {
      id: "pv_chelsea_penthouse_out",
      pos: new THREE.Vector3(OX, OY + LV[3] + 1.3, OZ - 9.3),
      label: "Corridor",
      verb: "Open",
      target: { x: OX, y: OY + LV[3], z: OZ - 10.9, yaw: 0 },
    });
    // roof garden
    const rOut = fp(ROOF.x, ROOF.z - 2.4),
      rIn = fp(ROOF.x, ROOF.z - 1.5);
    K.door(ctx, {
      id: "pv_chelsea_roof",
      pos: new THREE.Vector3(OX - 6, OY + LV[3] + 1.3, OZ - 20.6),
      label: "Roof Garden",
      verb: "Climb to",
      target: { x: rOut.x, y: TOP, z: rOut.z, yaw: PI },
    });
    K.door(ctx, {
      id: "pv_chelsea_roof_in",
      pos: new THREE.Vector3(rIn.x, TOP + 1.3, rIn.z),
      label: "Hotel Chelsea — Top Floor",
      verb: "Enter",
      target: { x: OX - 6, y: OY + LV[3], z: OZ - 19.2, yaw: PI },
    });

    // ---- anchors (combat / quests) ----
    K.anchor(ctx, "entrance", 0, 0, -1.6);
    K.anchor(ctx, "stanley", 6.6, 0, -6.2);
    K.anchor(ctx, "npc1", -4.2, 0, -8.6);
    K.anchor(ctx, "npc2", 0.5, 4.2, -10.8);
    K.anchor(ctx, "npc3", -6, 4.2, -15);
    const sp = [
      [-2, 0, -4],
      [2, 4.2, -10.8],
      [-2, 8.4, -10.8],
      [0, 6.3, -19.5],
      [2, 12.6, -10.8],
      [-6, 8.4, -16],
    ];
    sp.forEach((p, i) => K.anchor(ctx, "spawn" + (i + 1), p[0], p[1], p[2]));
    ["loot1", "loot2", "loot3"].forEach((n, i) =>
      K.anchor(ctx, n, [-7.2, 5.6, 7.2][i], LV[i + 1], -1),
    );

    // lobby / office / studio containers
    K.loot(ctx, "first_aid", -7.85, 1.3, -11.2, HP, { loot: "first_aid" });
    K.loot(ctx, "mailbox", -7.7, 0, -9.8, HP, {
      loot: "mail_sack",
      name: "Guest Mail",
    });
    ctx.intRoot = b.finish(null);
    ctx.intRoot.name = "poi_chelsea_int";
  }

  /** Two tall street windows (daylight) on the south wall z=0 of a studio x0..x1. */
