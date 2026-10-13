/* src/poi_herald/30_diner.js */
/* =====================================================================
 * NEW RAD CITY — poi_herald / 30_diner.js
 * EMPIRE DINER (10th Avenue & 22nd Street) — friendly diner.
 *
 * EXTERIOR (site x −262..−218, z 47..78; front on 22nd St, facing south):
 *   a 1946 streamlined stainless railcar diner — black enamel & chrome
 *   stripes, ribbon windows with rounded ends, a barrel roof, the famous
 *   rooftop EMPIRE sign crowned by a miniature Empire State Building,
 *   glass-block vestibule; patio umbrellas & wrecked cars out front, a
 *   brick kitchen annex with a smokestack, the cellar bulkhead, and a
 *   fenced back yard with settler tents.
 * INTERIOR (cell empire_diner, origin 8600,0,1600):
 *   the CAR — long counter with chrome stools, back-bar (urns, pie case,
 *   grill), booths along the windows, a glowing jukebox (plays a tune) →
 *   KITCHEN ANNEX (grill line, walk-in, restroom) → cellar hatch →
 *   CELLAR (stores, butcher block, the BURROW RATS PENS — the secret of the
 *   Mystery Meat — Big Bertha) → back steps up to the yard (loop outside).
 * Quest "Mystery Meat" (Bernadette): find out what Spiro puts in the special.
 * NPCs: Spiro Papadakis (cook, old burn scar, food merchant), Bernadette Wisniewski
 *   (quest giver), Flo (patrolman waitress), a regular, a yard guard.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE) return;
  const PH = G._ph;
  const K = PH.kit;
  const PI = Math.PI,
    HP = PI / 2;

  // exterior car footprint (world)
  const DX0 = -254,
    DX1 = -232,
    DZ0 = 62.5,
    DZ1 = 71.5;
  const DCX = (DX0 + DX1) / 2,
    DCZ = (DZ0 + DZ1) / 2;
  const BY = -3.4; // cellar floor (local)
  const CAR = { x0: -11, x1: 11, z0: -4.5, z1: 4.5, h: 3.3 };

  // ==================================================================
  // ART
  // ==================================================================
  function nameBand() {
    return K.paint("art", "dn_band", 1024, 96, function (x, X, Y, W, H) {
      x.fillStyle = "#101010";
      x.fillRect(X, Y, W, H);
      x.fillStyle = "#e8e4d8";
      x.font = "italic bold 64px Georgia, serif";
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.fillText("Empire Diner", X + W / 2, Y + H / 2 + 4, W * 0.8);
      x.fillStyle = "#c8c8c8";
      for (const yy of [8, H - 12]) x.fillRect(X + 10, Y + yy, W - 20, 4);
      K.stains(x, X, Y, W, H, 10, 201, 0.3, [60, 60, 50]);
    });
  }
  function menuBoard() {
    return K.paint("art", "dn_menu", 512, 320, function (x, X, Y, W, H) {
      x.fillStyle = "#141414";
      x.fillRect(X, Y, W, H);
      x.fillStyle = "#f0f0e0";
      x.font = "bold 28px Arial, sans-serif";
      x.textAlign = "center";
      x.fillText("★ EMPIRE DINER ★", X + W / 2, Y + 36);
      const items = [
        ["MYSTERY MEAT PLATTER", "9"],
        ["BLUE PLATE SPECIAL", "11"],
        ["ROADKILL BURGER (NO ROAD)", "8"],
        ["SPUD HASH & EGGS", "6"],
        ["PIE (ASK)", "5"],
        ["COFFEE — BOTTOMLESS*", "3"],
      ];
      x.font = "20px Arial, sans-serif";
      items.forEach(([n, p], i) => {
        x.textAlign = "left";
        x.fillStyle = i === 0 ? "#ffd060" : "#e8e4d8";
        x.fillText(n, X + 18, Y + 80 + i * 36);
        x.textAlign = "right";
        x.fillText(p + " scrip", X + W - 18, Y + 80 + i * 36);
      });
      x.font = "italic 14px Arial";
      x.fillStyle = "#a0a090";
      x.textAlign = "center";
      x.fillText(
        "*bottom subject to availability · don't ask what's in the meat",
        X + W / 2,
        Y + H - 14,
      );
    });
  }
  function jukeCell() {
    return K.paint("neon", "dn_juke", 256, 384, function (x, X, Y, W, H) {
      x.fillStyle = "#000";
      x.fillRect(X, Y, W, H);
      const g = x.createLinearGradient(X, 0, X + W, 0);
      g.addColorStop(0, "#ff3060");
      g.addColorStop(0.3, "#ffb020");
      g.addColorStop(0.5, "#40d0ff");
      g.addColorStop(0.7, "#ffb020");
      g.addColorStop(1, "#ff3060");
      x.strokeStyle = g;
      x.lineWidth = 18;
      x.beginPath();
      x.moveTo(X + 20, Y + H - 10);
      x.lineTo(X + 20, Y + H * 0.32);
      x.arc(X + W / 2, Y + H * 0.32, W / 2 - 20, PI, 0);
      x.lineTo(X + W - 20, Y + H - 10);
      x.stroke();
      x.fillStyle = "rgba(255,200,120,0.55)";
      x.fillRect(X + 50, Y + H * 0.42, W - 100, H * 0.2);
      x.fillStyle = "rgba(80,200,255,0.35)";
      for (let k = 0; k < 6; k++)
        x.fillRect(X + 50, Y + H * 0.66 + k * 16, W - 100, 8);
    });
  }

  // ==================================================================
  // EXTERIOR
  // ==================================================================
  function exterior(ctx) {
    const b = K.builder({ name: "dn_ext", grime: 0.45, seg: 2 });
    const r = K.rng("dn_ext");
    const x0 = DX0,
      x1 = DX1,
      z0 = DZ0,
      z1 = DZ1,
      L = x1 - x0,
      D = z1 - z0;
    // concrete pad + patio
    b.boxMM("concrete", x0 - 3, 0, z0 - 2, x1 + 3, 0.12, 77.5, {
      tint: [0.62, 0.6, 0.56],
      faces: "nsewt",
    });
    b.col(x0 - 3, -0.3, z0 - 2, x1 + 3, 0.12, 77.5, { tag: "floor" });
    // plinth (brick skirt) under the car
    b.boxMM("brick_red", x0 + 0.6, 0.12, z0 + 0.1, x1 - 0.6, 0.55, z1 - 0.1, {
      tint: [0.55, 0.36, 0.3],
    });
    // the shell: straight sides + end walls with rounded corners (radius RC); bands of
    // fluted stainless skirt, black enamel, ribbon windows, fluted fascia with a black stripe
    const RC = 1.3;
    const BANDS = [
      ["steel_flute", 0.55, 1.35, [1, 1, 1], 0],
      ["paint_black", 1.35, 1.5, [0.12, 0.12, 0.12], 0.01],
      ["glass", 1.5, 2.6, [0.35, 0.4, 0.42], 0],
      ["steel_flute", 2.6, 3.4, [1, 1, 1], 0],
      ["paint_black", 2.75, 3.25, [0.1, 0.1, 0.1], 0.02],
    ];
    const wall = (ax, az, bx, bz, nx, nz, windows) => {
      for (const [mat, ya, yb, tint, off] of BANDS) {
        if (mat === "glass" && !windows) {
          b.quadN(
            "paint_black",
            [ax + nx * off, ya, az + nz * off],
            [bx + nx * off, ya, bz + nz * off],
            [bx + nx * off, yb, bz + nz * off],
            [ax + nx * off, yb, az + nz * off],
            [nx, 0, nz],
            { tint: [0.12, 0.12, 0.12] },
          );
          continue;
        }
        b.quadN(
          mat,
          [ax + nx * off, ya, az + nz * off],
          [bx + nx * off, ya, bz + nz * off],
          [bx + nx * off, yb, bz + nz * off],
          [ax + nx * off, yb, az + nz * off],
          [nx, 0, nz],
          { tint, grime: 0.3 },
        );
      }
      for (const y of [0.8, 1.05, 2.68, 3.32])
        b.beam(
          "chrome",
          ax + nx * 0.04,
          y,
          az + nz * 0.04,
          bx + nx * 0.04,
          y,
          bz + nz * 0.04,
          0.05,
          0.04,
          { tint: [0.9, 0.92, 0.94] },
        );
      if (windows) {
        const len = Math.hypot(bx - ax, bz - az),
          n = Math.max(1, Math.round(len / 1.9));
        for (let k = 0; k <= n; k++) {
          const t = k / n,
            px = ax + (bx - ax) * t,
            pz = az + (bz - az) * t;
          b.boxMM(
            "chrome",
            px - 0.05,
            1.5,
            pz - 0.05,
            px + 0.05,
            2.6,
            pz + 0.05,
            { tint: [0.85, 0.87, 0.9] },
          );
        }
        b.glow(
          (ax + bx) / 2 + nx * 0.4,
          2.0,
          (az + bz) / 2 + nz * 0.4,
          [0.9, 0.7, 0.4],
          4,
        );
      }
    };
    wall(x0 + RC, z1, x1 - RC, z1, 0, 1, true);
    wall(x1 - RC, z0, x0 + RC, z0, 0, -1, true);
    wall(x0, z0 + RC, x0, z1 - RC, -1, 0, true);
    wall(x1, z1 - RC, x1, z0 + RC, 1, 0, false);
    for (const [cx, cz, a0] of [
      [x0 + RC, z0 + RC, HP],
      [x1 - RC, z0 + RC, 0],
      [x1 - RC, z1 - RC, -HP],
      [x0 + RC, z1 - RC, PI],
    ]) {
      for (const [mat, ya, yb, tint, off] of BANDS)
        b.cyl(mat, cx, ya, cz, RC + off, RC + off, yb - ya, 8, {
          arc0: a0,
          arc: HP,
          top: false,
          tint:
            mat === "glass" ? tint : mat === "paint_black" ? tint : [1, 1, 1],
        });
      for (const y of [0.8, 1.05, 2.68, 3.32])
        b.cyl("chrome", cx, y - 0.02, cz, RC + 0.04, RC + 0.04, 0.04, 8, {
          arc0: a0,
          arc: HP,
          top: false,
          tint: [0.9, 0.92, 0.94],
        });
    }
    b.col(x0 + 0.4, 0, z0, x1 - 0.4, 3.4, z1, { tag: "building" });
    // barrel roof (monitor clerestory)
    const RW = D / 2 + 0.2,
      n = 10;
    for (let k = 0; k < n; k++) {
      const a0 = (PI * k) / n,
        a1 = (PI * (k + 1)) / n;
      const za = DCZ + Math.cos(a0) * RW,
        ya = 3.4 + Math.sin(a0) * 0.9,
        zb = DCZ + Math.cos(a1) * RW,
        yb = 3.4 + Math.sin(a1) * 0.9;
      b.quadN(
        "metal_dark",
        [x0 + 1.2, ya, za],
        [x1 - 1.2, ya, za],
        [x1 - 1.2, yb, zb],
        [x0 + 1.2, yb, zb],
        [0, Math.sin((a0 + a1) / 2), Math.cos((a0 + a1) / 2)],
        { tint: [0.35, 0.36, 0.38] },
      );
    }
    for (const xe of [x0 + 1.2, x1 - 1.2])
      for (let k = 0; k < n; k++) {
        const a0 = (PI * k) / n,
          a1 = (PI * (k + 1)) / n;
        b.quadN(
          "metal_dark",
          [xe, 3.4, DCZ],
          [xe, 3.4 + Math.sin(a0) * 0.9, DCZ + Math.cos(a0) * RW],
          [xe, 3.4 + Math.sin(a1) * 0.9, DCZ + Math.cos(a1) * RW],
          [xe, 3.4, DCZ],
          [xe < DCX ? -1 : 1, 0, 0],
          { tint: [0.3, 0.3, 0.32] },
        );
      }
    // name band on the fascia (both long sides)
    b.plate("art", DCX, 3.0, z1 + 0.06, 0, 1, 9, 0.5, nameBand());
    b.plate("art", DCX, 3.0, z0 - 0.06, 0, -1, 9, 0.5, nameBand());
    // glass-block vestibule (front centre)
    {
      const vx0 = DCX - 1.6,
        vx1 = DCX + 1.6,
        vz1 = z1 + 2.2;
      b.boxMM("glass", vx0, 0.12, z1, vx0 + 0.25, 2.8, vz1, {
        tint: [0.6, 0.7, 0.72],
      });
      b.boxMM("glass", vx1 - 0.25, 0.12, z1, vx1, 2.8, vz1, {
        tint: [0.6, 0.7, 0.72],
      });
      for (let y = 0.4; y < 2.8; y += 0.28) {
        b.beam("steel", vx0 - 0.01, y, z1, vx0 - 0.01, y, vz1, 0.02, 0.02);
        b.beam("steel", vx1 + 0.01, y, z1, vx1 + 0.01, y, vz1, 0.02, 0.02);
      }
      b.boxMM("stainless", vx0 - 0.1, 2.8, z1, vx1 + 0.1, 3.15, vz1 + 0.15, {
        tint: [0.85, 0.87, 0.9],
      });
      b.boxMM("stainless", vx0 + 0.25, 0.12, vz1 - 0.1, vx1 - 0.25, 2.5, vz1, {
        tint: [0.8, 0.82, 0.85],
      });
      b.plate("glass_dark", DCX, 1.45, vz1 + 0.01, 0, 1, 1.4, 2.0, null, {
        tint: [0.3, 0.33, 0.34],
      });
      b.beam(
        "chrome",
        DCX - 0.5,
        1.1,
        vz1 + 0.06,
        DCX + 0.5,
        1.1,
        vz1 + 0.06,
        0.04,
        0.04,
      );
      b.plate(
        "art",
        DCX,
        2.97,
        vz1 + 0.16,
        0,
        1,
        3.2,
        0.3,
        K.signCell("dn_open", "OPEN 24 HOURS · SINCE 1946", 512, 48, {
          bg: "#101010",
          fg: "#f0f0e0",
          font: "Arial, sans-serif",
        }),
      );
      for (const s of [0, 1])
        b.boxMM(
          "concrete",
          vx0,
          0.12,
          vz1 + s * 0.35,
          vx1,
          0.12 + (2 - s) * 0.18,
          vz1 + (s + 1) * 0.35,
          { tint: [0.6, 0.58, 0.55] },
        );
      b.col(vx0, 0, z1, vx0 + 0.25, 2.8, vz1, {});
      b.col(vx1 - 0.25, 0, z1, vx1, 2.8, vz1, {});
      b.col(vx0 + 0.25, 0, vz1 - 0.1, vx1 - 0.25, 2.5, vz1, {});
      K.anchor(ctx, "door", DCX, 0.12, vz1 + 0.9, false);
    }
    // ROOFTOP SIGN: "EMPIRE" cabinet + miniature Empire State Building
    {
      const sx = DCX,
        sz = DCZ,
        sy = 4.3;
      for (const dx of [-3.4, 3.4])
        b.beam("steel", sx + dx, 3.4, sz, sx + dx, sy + 0.2, sz, 0.18, 0.18);
      b.boxMM(
        "paint_black",
        sx - 4.2,
        sy,
        sz - 0.35,
        sx + 4.2,
        sy + 1.8,
        sz + 0.35,
        { tint: [0.08, 0.08, 0.08] },
      );
      b.boxMM("chrome", sx - 4.3, sy - 0.08, sz - 0.4, sx + 4.3, sy, sz + 0.4, {
        tint: [0.85, 0.87, 0.9],
      });
      b.boxMM(
        "chrome",
        sx - 4.3,
        sy + 1.8,
        sz - 0.4,
        sx + 4.3,
        sy + 1.88,
        sz + 0.4,
        { tint: [0.85, 0.87, 0.9] },
      );
      const em = K.neonCell("dn_empire", "EMPIRE", 768, 160, {
        color: "#f4f4ff",
        font: '"Arial Black", Impact, sans-serif',
        core: "#ffffff",
      });
      const emArt = K.signCell("dn_empire_day", "EMPIRE", 768, 160, {
        bg: "#0c0c0c",
        fg: "#e8e8e0",
        font: '"Arial Black", Impact, sans-serif',
        weather: true,
      });
      for (const nz of [-1, 1]) {
        b.plate("art", sx, sy + 0.9, sz + nz * 0.36, 0, nz, 8.2, 1.7, emArt);
        b.plate("neon", sx, sy + 0.9, sz + nz * 0.37, 0, nz, 8.0, 1.6, em, {
          tint: [0.8, 0.8, 0.85],
        });
        b.glow(sx, sy + 0.9, sz + nz * 1.4, [0.8, 0.85, 1.0], 6);
      }
      // the miniature Empire State Building on top of the sign
      const ey = sy + 1.88,
        ex = sx,
        ez = sz;
      const tiers = [
        [1.6, 1.0, 1.3],
        [1.2, 1.0, 1.0],
        [0.9, 0.9, 0.75],
        [0.62, 0.55, 0.5],
        [0.44, 0.4, 0.34],
      ];
      let y = ey;
      for (const [w, h, d] of tiers) {
        b.box("limestone", ex, y, ez, w, h, d, {
          tint: [0.92, 0.9, 0.86],
          grime: 0.2,
        });
        y += h;
      }
      b.cyl("chrome", ex, y, ez, 0.14, 0.1, 0.5, 8);
      b.cyl("chrome", ex, y + 0.5, ez, 0.06, 0.02, 0.9, 6);
      b.geo("lamp", K.sphereGeo(), {
        x: ex,
        y: y + 1.45,
        z: ez,
        s: 0.07,
        tint: [1, 0.2, 0.1],
      });
      b.glow(ex, y + 1.45, ez, [1, 0.2, 0.1], 1.4);
      for (let k = 0; k < 4; k++) {
        const yy = ey + 0.3 + k * 0.9;
        b.plate("lamp", ex, yy, ez + 0.66 - k * 0.06, 0, 1, 0.08, 0.5, null, {
          tint: [0.95, 0.85, 0.55],
        });
      }
      b.glow(ex, ey + 2.2, ez, [0.9, 0.8, 0.55], 2.5);
    }
    // KITCHEN ANNEX (brick, east end) + smokestack
    b.boxMM("brick_brown", x1 - 0.6, 0.12, z0 - 0.5, x1 + 5.5, 3.6, z1 - 1.5, {
      tint: [0.7, 0.55, 0.46],
    });
    b.col(x1 - 0.6, 0, z0 - 0.5, x1 + 5.5, 3.6, z1 - 1.5, {});
    b.boxMM("metal_dark", x1 - 0.8, 3.6, z0 - 0.7, x1 + 5.7, 3.8, z1 - 1.3, {
      tint: [0.3, 0.3, 0.3],
    });
    b.cyl("rust", x1 + 4, 3.8, z0 + 1.2, 0.35, 0.35, 3.2, 10);
    b.cyl("rust", x1 + 4, 7.0, z0 + 1.2, 0.5, 0.2, 0.4, 10);
    K.window(b, x1 + 5.5, 1.9, z0 + 3, 1, 0, 1.2, 1.2, {
      state: "boarded",
      surround: "brick_brown",
      surroundTint: [0.55, 0.42, 0.36],
    });
    b.boxMM("metal_dark", x1 + 1.5, 0.12, z1 - 1.52, x1 + 2.6, 2.3, z1 - 1.45, {
      tint: [0.4, 0.42, 0.4],
    }); // back door
    // the cellar bulkhead (slanted doors) by the annex — this is where the back steps come out
    b.quadN(
      "metal_dark",
      [x1 + 1, 0.12, z0 - 3.2],
      [x1 + 3.2, 0.12, z0 - 3.2],
      [x1 + 3.2, 0.9, z0 - 0.6],
      [x1 + 1, 0.9, z0 - 0.6],
      [0, 0.95, -0.3],
      { tint: [0.35, 0.3, 0.26] },
    );
    b.boxMM("concrete", x1 + 0.9, 0.12, z0 - 3.3, x1 + 1.0, 0.9, z0 - 0.5, {});
    b.boxMM("concrete", x1 + 3.2, 0.12, z0 - 3.3, x1 + 3.3, 0.9, z0 - 0.5, {});
    b.col(x1 + 0.9, 0, z0 - 3.3, x1 + 3.3, 0.9, z0 - 0.5, {});
    b.beam(
      "rust",
      x1 + 2.1,
      0.5,
      z0 - 3.1,
      x1 + 2.1,
      0.92,
      z0 - 0.8,
      0.04,
      0.04,
    );
    b.plate(
      "decal",
      x1 + 2.1,
      0.55,
      z0 - 1.9,
      0,
      1,
      1.2,
      0.6,
      K.tag("KEEP OUT - GUS", "#e8e040", 256, 96),
    );
    // tall pole sign with a clock at the corner
    {
      const px = x0 - 1.8,
        pz = 76.8;
      b.pipe("chrome", px, 0, pz, px, 7.2, pz, 0.12, 8);
      b.boxMM("paint_black", px - 1.6, 5.2, pz - 0.2, px + 1.6, 6.6, pz + 0.2, {
        tint: [0.1, 0.1, 0.1],
      });
      b.plate(
        "neon",
        px,
        5.9,
        pz + 0.21,
        0,
        1,
        3.0,
        1.2,
        K.neonCell("dn_eat", "EAT", 384, 160, {
          color: "#ff3a28",
          font: '"Arial Black", sans-serif',
        }),
      );
      b.plate(
        "neon",
        px,
        5.9,
        pz - 0.21,
        0,
        -1,
        3.0,
        1.2,
        K.neonCell("dn_eat", "EAT", 384, 160, {
          color: "#ff3a28",
          font: '"Arial Black", sans-serif',
        }),
      );
      b.glow(px, 5.9, pz + 0.8, [1, 0.25, 0.15], 3.6);
      b.cyl("chrome", px, 7.2, pz, 0.8, 0.8, 0.25, 16);
      b.plate(
        "art",
        px,
        7.6,
        pz + 0.14,
        0,
        1,
        1.2,
        1.2,
        K.paint("art", "dn_clock", 128, 128, (x, X, Y, W, H) => {
          x.clearRect(X, Y, W, H);
          x.fillStyle = "#f0ece0";
          x.beginPath();
          x.arc(X + W / 2, Y + H / 2, W * 0.46, 0, 6.3);
          x.fill();
          x.strokeStyle = "#111";
          x.lineWidth = 6;
          x.stroke();
          x.lineWidth = 4;
          x.beginPath();
          x.moveTo(X + W / 2, Y + H / 2);
          x.lineTo(X + W / 2 + 24, Y + H / 2 - 22);
          x.moveTo(X + W / 2, Y + H / 2);
          x.lineTo(X + W / 2 - 4, Y + H / 2 + 34);
          x.stroke();
          x.fillStyle = "#c81e1e";
          x.font = "bold 14px Arial";
          x.textAlign = "center";
          x.fillText("EMPIRE", X + W / 2, Y + H * 0.35);
        }),
        {},
      );
      b.col(px - 0.2, 0, pz - 0.2, px + 0.2, 7.2, pz + 0.2, {});
    }
    // patio: umbrella tables (one blown over), a Fizzo cooler
    for (const [tx, tz, fallen] of [
      [x0 + 1, 75, false],
      [x1 - 2, 75.2, false],
      [x1 + 3.5, 74.5, true],
    ]) {
      b.cyl("metal", tx, 0.12, tz, 0.6, 0.6, 0.04, 12, {
        tint: [0.4, 0.5, 0.45],
      });
      b.pipe("metal", tx, 0.12, tz, tx, 0.84, tz, 0.04, 6);
      b.cyl("metal", tx, 0.84, tz, 0.55, 0.55, 0.04, 12, {
        tint: [0.5, 0.6, 0.55],
      });
      if (!fallen) {
        b.pipe("steel", tx, 0.84, tz, tx, 2.5, tz, 0.025, 4);
        b.cyl("fabric", tx, 2.1, tz, 1.4, 0.05, 0.4, 8, {
          tint: r() < 0.5 ? [0.8, 0.3, 0.25] : [0.85, 0.82, 0.7],
        });
      } else {
        b.cyl("fabric", tx + 1.4, 0.12, tz + 0.4, 1.4, 0.05, 0.4, 8, {
          tint: [0.8, 0.3, 0.25],
        });
      }
      b.col(tx - 0.55, 0, tz - 0.55, tx + 0.55, 0.88, tz + 0.55, {
        tag: "furniture",
      });
    }
    // back yard: fence, tents, a Fizzo truck
    {
      const yz0 = 48,
        yz1 = z0 - 2.5;
      const fence = (ax, az, bx, bz) => {
        const len = Math.hypot(bx - ax, bz - az),
          n = Math.ceil(len / 1.4);
        for (let k = 0; k < n; k++) {
          const t0 = k / n,
            t1 = (k + 1) / n,
            h = 1.9 + r() * 0.5,
            mat = r() < 0.5 ? "corrugated" : "wood_rotten";
          const X0 = ax + (bx - ax) * t0,
            Z0 = az + (bz - az) * t0,
            X1 = ax + (bx - ax) * t1,
            Z1 = az + (bz - az) * t1;
          b.quadN(
            mat,
            [X0, 0, Z0],
            [X1, 0, Z1],
            [X1, h, Z1],
            [X0, h, Z0],
            [(bz - az) / len, 0, (ax - bx) / len],
            { tint: [0.7 + r() * 0.2, 0.66, 0.6] },
          );
          b.quadN(
            mat,
            [X0, 0, Z0],
            [X1, 0, Z1],
            [X1, h, Z1],
            [X0, h, Z0],
            [(az - bz) / len, 0, (bx - ax) / len],
            { tint: [0.6, 0.56, 0.5] },
          );
        }
        b.col(
          Math.min(ax, bx) - 0.1,
          0,
          Math.min(az, bz) - 0.1,
          Math.max(ax, bx) + 0.1,
          2.2,
          Math.max(az, bz) + 0.1,
          { tag: "fence" },
        );
      };
      fence(-261, yz0, -219, yz0);
      fence(-261, yz0, -261, yz1);
      fence(-219, yz0, -219, yz1 - 3);
      for (const [tx, tz, yaw] of [
        [-256, 52.5, 0.2],
        [-249, 51.8, -0.1],
      ]) {
        const c = Math.cos(yaw),
          s = Math.sin(yaw);
        const P = (lx, ly, lz) => [
          tx + lx * c + lz * s,
          ly,
          tz - lx * s + lz * c,
        ];
        b.quadN(
          "fabric",
          P(-1.4, 0, -1.2),
          P(-1.4, 0, 1.2),
          P(0, 1.6, 1.2),
          P(0, 1.6, -1.2),
          [-c, 0.8, s],
          { tint: [0.55, 0.52, 0.4] },
        );
        b.quadN(
          "fabric",
          P(1.4, 0, 1.2),
          P(1.4, 0, -1.2),
          P(0, 1.6, -1.2),
          P(0, 1.6, 1.2),
          [c, 0.8, -s],
          { tint: [0.5, 0.48, 0.36] },
        );
        b.ocol(tx, tz, 2.8, 2.4, 0, 1.6, yaw, { tag: "tent" });
      }
      b.cyl("rust", -252.5, 0, 55.5, 0.35, 0.35, 0.8, 10); // cook fire barrel
      b.glow(-252.5, 1.1, 55.5, [1, 0.5, 0.2], 1.4);
      K.anchor(ctx, "yard", -245, 0, 54, false);
    }
    b.burn(x0 + 3, 2, z1, 3, 0.5);
    b.burn(x1 - 5, 3.2, z0, 4, 0.4);
    ctx.extRoot = b.finish(null);
    ctx.extRoot.name = "poi_diner_ext";
    K.loot(ctx, "car", -226, 0, 75, 0.2, {
      world: true,
      kind: "sedan",
      wreck: true,
    });
    K.loot(ctx, "car", -255, 0, 58, 0.1, {
      world: true,
      kind: "fizzo_truck",
      stripped: true,
    });
    K.loot(ctx, "fizzo_machine", x0 + 2.5, 0.12, 73.2, PI, {
      world: true,
      loot: "fizzo_machine",
    });
    K.loot(ctx, "trash_can", x1 + 1.2, 0.12, 73.6, 0, {
      world: true,
      loot: "trash_can",
    });
    K.skel(ctx, x1 + 3.5, 0.12, 75.8, 1.2, "sitting", { world: true });
  }

  // ==================================================================
  // INTERIOR
  // ==================================================================
  function interior(ctx) {
    const O = ctx.O;
    const b = K.builder({
      name: "dn_int",
      off: O,
      lit: true,
      amb: [0.12, 0.11, 0.1],
      floors: [0, BY],
      grime: 0.35,
    });
    const r = K.rng("dn_int");
    const { x0, x1, z0, z1, h } = CAR;
    const CB = [x0 - 0.1, -0.3, z0 - 0.1, x1 + 0.1, h + 0.8, z1 + 0.1];
    // ---------------- THE CAR ----------------
    K.gap(ctx, x1, -2.8, 1.1, 0, 2.3); // car → kitchen annex
    K.room(b, ctx, {
      x0,
      z0,
      x1,
      z1,
      y: 0,
      h,
      floor: "checker",
      fc: [0.9, 0.88, 0.84],
      wall: "stainless",
      wc: [0.85, 0.87, 0.9],
      wain: "enamel_red",
      wainC: [0.12, 0.12, 0.12],
      wainH: 0.9,
      ceil: "enamel_cream",
      cc: [0.85, 0.8, 0.7],
      trim: false,
      surface: "concrete",
    });
    // barrel-vault ceiling coves
    for (const s of [-1, 1])
      b.quadN(
        "enamel_cream",
        [x0, h, s * 3.2],
        [x1, h, s * 3.2],
        [x1, h - 0.5, s * z1],
        [x0, h - 0.5, s * z1],
        [0, -0.7, -s * 0.7],
        { tint: [0.8, 0.76, 0.66] },
      );
    // ribbon windows (south & north walls) — night outside
    for (const [zw, nz] of [
      [z1, -1],
      [z0, 1],
    ]) {
      b.plate("paint_black", 0, 1.95, zw + nz * 0.11, 0, nz, 20, 1.0, null, {
        tint: [0.02, 0.03, 0.03],
        off: 0.004,
      });
      b.plate("glass", 0, 1.95, zw + nz * 0.12, 0, nz, 20, 1.0, null, {
        tint: [0.25, 0.3, 0.3],
        off: 0.005,
      });
      for (let x = -9.5; x <= 9.51; x += 1.9)
        b.boxMM(
          "chrome",
          x - 0.04,
          1.45,
          zw + nz * 0.08 - 0.03,
          x + 0.04,
          2.45,
          zw + nz * 0.08 + 0.03,
          { tint: [0.85, 0.87, 0.9] },
        );
    }
    // COUNTER along the north side: stools, back-bar
    b.boxMM("stainless", -8.5, 0, -1.3, 7.5, 1.0, -0.6, {
      tint: [0.85, 0.87, 0.9],
    });
    b.boxMM("formica", -8.6, 1.0, -1.35, 7.6, 1.07, -0.3, { tint: [1, 1, 1] });
    b.boxMM("chrome", -8.6, 1.0, -0.33, 7.6, 1.07, -0.28, {
      tint: [0.9, 0.92, 0.94],
    });
    b.boxMM("paint_black", -8.5, 0, -0.65, 7.5, 0.18, -0.55, {
      tint: [0.1, 0.1, 0.1],
    });
    b.col(-8.6, 0, -1.35, 7.6, 1.07, -0.28, { tag: "counter" });
    for (let x = -7.8; x <= 7; x += 1.0) {
      b.cyl("chrome", x, 0, 0.3, 0.22, 0.18, 0.05, 10);
      b.pipe("chrome", x, 0.05, 0.3, x, 0.7, 0.3, 0.04, 6);
      b.cyl("vinyl_red", x, 0.7, 0.3, 0.2, 0.2, 0.1, 12, {
        tint: [0.8, 0.15, 0.15],
      });
      b.cyl("chrome", x, 0.69, 0.3, 0.21, 0.21, 0.03, 12);
    }
    // back-bar: coffee urns, pie case, cake stand, grill, milkshake mixer, menu
    b.boxMM("stainless", -8.5, 0, -4.4, 7.5, 0.95, -3.6, {
      tint: [0.8, 0.82, 0.85],
    });
    b.boxMM("formica", -8.6, 0.95, -4.45, 7.6, 1.0, -3.5, { tint: [1, 1, 1] });
    b.col(-8.6, 0, -4.45, 7.6, 1.0, -3.5, { tag: "counter" });
    for (const x of [-7.5, -6.6]) {
      b.cyl("stainless", x, 1.0, -4.0, 0.3, 0.28, 0.75, 14, {
        tint: [0.9, 0.9, 0.92],
      });
      b.cyl("chrome", x, 1.75, -4.0, 0.28, 0.08, 0.15, 12);
      b.pipe("chrome", x, 1.2, -3.72, x, 1.1, -3.6, 0.02, 4);
    }
    b.boxMM("glass_clear", -4.8, 1.0, -4.3, -2.6, 1.7, -3.6, {
      tint: [0.75, 0.82, 0.82],
    });
    for (let k = 0; k < 3; k++) {
      b.cyl("flat", -4.2 + k * 0.7, 1.05, -3.95, 0.25, 0.25, 0.1, 12, {
        tint: [0.75, 0.5, 0.26],
      });
      b.cyl("flat", -4.2 + k * 0.7, 1.4, -3.95, 0.25, 0.25, 0.1, 12, {
        tint: [0.9, 0.85, 0.7],
      });
    }
    b.boxMM("steel", -1, 0.95, -4.4, 2.5, 1.02, -3.55, {
      tint: [0.25, 0.25, 0.25],
    }); // griddle
    b.glow(0.8, 1.1, -3.9, [1, 0.45, 0.2], 0.9);
    b.light(0.8, 1.4, -3.4, [1, 0.5, 0.25], 0.5, 3, { box: CB });
    b.boxMM("stainless", -1.2, 1.9, -4.45, 2.7, 2.3, -3.4, {
      tint: [0.7, 0.72, 0.75],
    }); // hood
    b.boxMM("enamel_cream", 3.5, 1.0, -4.1, 3.9, 1.5, -3.8, {
      tint: [0.4, 0.75, 0.7],
    });
    b.pipe("chrome", 3.7, 1.5, -3.95, 3.7, 1.25, -3.75, 0.015, 4); // milkshake mixer
    b.cyl("glass", 5.4, 1.0, -4.0, 0.25, 0.25, 0.02, 12);
    b.pipe("glass", 5.4, 1.02, -4.0, 5.4, 1.3, -4.0, 0.03, 6);
    b.geo("glass_clear", K.sphereGeo(), {
      x: 5.4,
      y: 1.45,
      z: -4.0,
      sx: 0.28,
      sy: 0.2,
      sz: 0.28,
      tint: [0.8, 0.85, 0.85],
    }); // cake dome
    b.plate("art", 0, 2.55, z0 + 0.12, 0, 1, 4.2, 1.2, menuBoard());
    b.plate(
      "art",
      -6.3,
      2.55,
      z0 + 0.12,
      0,
      1,
      2.2,
      0.5,
      K.signCell("dn_pie", "PIE · CAKE · COFFEE", 384, 80, {
        bg: "#101010",
        fg: "#f0f0e0",
        font: "Georgia, serif",
        italic: true,
      }),
    );
    b.plate(
      "art",
      5.8,
      2.55,
      z0 + 0.12,
      0,
      1,
      2.8,
      0.6,
      K.signCell(
        "dn_rules",
        "NO SHIRT · NO SHOES · NO SERVICE\nNO GUNS · NO MANIACS",
        512,
        120,
        { bg: "#e8e0c8", fg: "#8a1a10", font: "Arial, sans-serif" },
      ),
    );
    // BOOTHS along the south windows
    for (let k = 0; k < 5; k++) {
      const bx = -8 + k * 3.7;
      if (Math.abs(bx) < 1.6) continue; // the vestibule door in the middle
      K.table(b, bx, 0, 3.4, 0.8, 1.1, {
        mat: "formica",
        tint: [1, 1, 1],
        legMat: "chrome",
      });
      for (const s of [-1, 1])
        K.sofa(b, bx + s * 0.95, 0, 3.4, 1.2, s < 0 ? -HP : HP, {
          mat: "vinyl_red",
          d: 0.55,
          arms: false,
          backH: 0.65,
          tint: [0.75, 0.14, 0.14],
        });
      b.cyl("glass", bx - 0.2, 0.76, 3.1, 0.03, 0.03, 0.12, 6, {
        tint: [0.5, 0.5, 0.5],
      });
      b.cyl("glass", bx - 0.1, 0.76, 3.1, 0.03, 0.03, 0.12, 6, {
        tint: [0.8, 0.2, 0.15],
      }); // salt & ketchup
      b.box("chrome", bx + 0.1, 0.76, 4.2, 0.18, 0.2, 0.1, {}); // tabletop jukebox selector
      K.lamp(b, bx, 2.7, 3.2, "globe", [1, 0.85, 0.6], 0.55, 4, {
        ceil: h - 0.3,
        size: 0.16,
        lightOpts: { box: CB },
      });
    }
    // the JUKEBOX (west end)
    {
      const jx = -10.4,
        jz = 2.6;
      b.boxMM("wood_dark", jx - 0.4, 0, jz - 0.6, jx + 0.2, 1.3, jz + 0.6, {
        tint: [0.5, 0.3, 0.2],
      });
      b.cyl("wood_dark", jx - 0.1, 1.3, jz, 0.6, 0.6, 0.3, 16, {
        arc0: -HP,
        arc: PI,
        tint: [0.5, 0.3, 0.2],
      });
      b.plate("neon", jx + 0.22, 0.95, jz, 1, 0, 1.15, 1.75, jukeCell());
      b.plate("glass_clear", jx + 0.24, 1.0, jz, 1, 0, 0.7, 0.35, null, {
        tint: [0.9, 0.8, 0.6],
      });
      b.light(jx + 1.0, 1.1, jz, [1, 0.5, 0.6], 1.0, 4.5, { box: CB });
      b.glow(jx + 0.5, 1.1, jz, [0.9, 0.4, 0.5], 2);
      b.col(jx - 0.4, 0, jz - 0.6, jx + 0.2, 1.6, jz + 0.6, {});
      K.anchor(ctx, "jukebox", jx + 0.6, 0, jz);
    }
    // lights, clutter
    for (let x = -8; x <= 8; x += 4)
      K.lamp(b, x, 2.9, -2.0, "tube", [1, 0.95, 0.85], x === 4 ? 0 : 0.7, 5, {
        ceil: h + 0.5,
        len: 1.4,
        dead: x === 4,
        lightOpts: { box: CB },
      });
    b.light(0, 2.4, 0, [0.9, 0.8, 0.65], 0.4, 10, { box: CB });
    for (let k = 0; k < 5; k++)
      b.hplate(
        "decal",
        -9 + r() * 18,
        0.012 + k * 0.0004,
        -3 + r() * 6,
        0.8 + r(),
        0.8 + r(),
        r() * 6,
        K.decal(k % 2 ? "grime" : "puddle", k + 150),
      );
    K.litter(b, -10, 0.2, 9, 1.5, 0, 8, 151);
    // entrance: vestibule door (south wall centre) + exit
    b.boxMM("stainless", -0.8, 0, z1 - 0.12, 0.8, 2.4, z1 - 0.06, {
      tint: [0.8, 0.82, 0.85],
    });
    b.plate("glass_dark", 0, 1.5, z1 - 0.13, 0, -1, 1.1, 1.6, null, {
      tint: [0.3, 0.33, 0.34],
    });
    b.plate(
      "art",
      0,
      2.65,
      z1 - 0.12,
      0,
      -1,
      1.6,
      0.3,
      K.signCell("dn_thanks", "THANK YOU · CALL AGAIN", 384, 64, {
        bg: "#101010",
        fg: "#f0f0e0",
      }),
    );
    K.loot(ctx, "cash_register", -8.2, 1.07, -0.8, PI, {
      loot: "cash_register",
      name: "Diner Register",
      owner: "settlers",
    });
    // ---------------- KITCHEN ANNEX (x 11..17) ----------------
    const KB = [10.9, -0.3, -4.6, 17.1, 3.3, 4.6];
    K.gap(ctx, 14, -4.5, 1.1, 0, 2.2); // kitchen → walk-in (north)
    K.gap(ctx, 17, -3, 1.0, 0, 2.2); // kitchen → restroom (east)
    K.room(b, ctx, {
      x0: 11,
      z0: -4.5,
      x1: 17,
      z1: 4.5,
      y: 0,
      h: 3.0,
      floor: "checker",
      fc: [0.7, 0.68, 0.64],
      wall: "subway_tile",
      wc: [0.86, 0.86, 0.8],
      ceil: "plaster",
      cc: [0.55, 0.54, 0.5],
      noFloor: true,
      trim: false,
    });
    const kf = (a, bz0, c, bz1) => {
      b.face("checker", a, 0, bz1, 1, 0, 0, 0, 0, -1, c - a, bz1 - bz0, {
        uv: "top",
        tint: [0.7, 0.68, 0.64],
      });
      b.col(a, -0.3, bz0, c, 0, bz1, { tag: "floor" });
    };
    kf(11, -4.5, 17, -1.6);
    kf(11, -1.6, 14.4, 4.5);
    kf(14.4, 3.8, 17, 4.5); // hatch hole x 14.4..17, z −1.6..3.8
    // grill line along the west (car) side, prep table, sink
    b.boxMM("steel", 11.2, 0, 0.5, 12.2, 0.95, 4.3, {
      tint: [0.5, 0.52, 0.55],
    });
    b.col(11.2, 0, 0.5, 12.2, 0.95, 4.3, {});
    for (let k = 0; k < 3; k++) {
      b.cyl("black_iron", 11.7, 0.95, 1.2 + k * 1.2, 0.22, 0.22, 0.06, 10);
      b.glow(11.7, 1.05, 1.2 + k * 1.2, [1, 0.4, 0.15], 0.5);
    }
    b.boxMM("stainless", 11.1, 1.9, 0.4, 12.4, 2.3, 4.4, {
      tint: [0.7, 0.72, 0.75],
    });
    K.table(b, 13.0, 0, -1.5, 1.8, 0.9, {
      mat: "steel",
      tint: [0.65, 0.67, 0.7],
    });
    // the butcher's cleaver & a suspicious platter
    b.box("steel", 12.6, 0.76, -1.5, 0.35, 0.02, 0.12, { yaw: 0.3 });
    b.box("wood_dark", 12.85, 0.76, -1.55, 0.14, 0.03, 0.04, { yaw: 0.3 });
    b.cyl("ceramic", 13.4, 0.76, -1.4, 0.3, 0.26, 0.03, 12);
    b.geo("meat", K.sphereGeo(), {
      x: 13.4,
      y: 0.82,
      z: -1.4,
      sx: 0.2,
      sy: 0.07,
      sz: 0.14,
      tint: [0.55, 0.45, 0.3],
    });
    K.note(ctx, "ph_dn_note_order", 12.9, 0.77, -1.2, {
      name: "Order Pad (Kitchen)",
      title: "Spiro's order pad",
      text: 'TABLE 3 — 2x Mystery Meat, 1 hash, coffee\nTABLE 5 — Mystery Meat, "well done, VERY well done"\nCOUNTER — Earl (Bernadette) — Mystery Meat, double\n\nnote to self: feed the girls tonight. Bertha\'s getting BIG. Order more of the green stuff from the Glowkeeper kids. Do NOT let Flo in the cellar again, she tried to "tidy" the pens.\n\n(strongbox — 2-2-0-4, the address. stop asking, Flo.)',
      learn: "ph_dn_strongbox",
    });
    b.boxMM("stainless", 15.2, 0, -4.45, 16.4, 0.9, -3.8, {
      tint: [0.75, 0.78, 0.8],
    });
    b.col(15.2, 0, -4.45, 16.4, 0.9, -3.8, {}); // sink
    K.lamp(b, 14, 2.6, 0, "tube", [0.95, 1, 1], 0.9, 6, {
      ceil: 3.0,
      len: 1.2,
      lightOpts: { box: KB },
    });
    K.loot(ctx, "fridge", 11.6, 0, -3.6, -HP, {
      loot: "fridge",
      name: "Kitchen Fridge",
      owner: "settlers",
    });
    // cellar hatch in the floor (x 14.4..17, z 1.2..3.8): stairs down, trapdoor lifted
    K.railing(b, 14.4, -1.6, 14.4, 3.0, 0, {
      h: 0.9,
      mat: "rust",
      handMat: "rust",
    });
    b.quadN(
      "wood_rotten",
      [14.4, 0, -1.6],
      [17, 0, -1.6],
      [17, 1.7, -1.95],
      [14.4, 1.7, -1.95],
      [0, 0.2, 1],
      { tint: [0.55, 0.45, 0.35] },
    );
    b.col(14.4, 0, -1.95, 17, 1.7, -1.6, {});
    // walk-in (x 12.5..15.5, z −7.5..−4.5) — empty meat hooks, mostly
    K.room(b, ctx, {
      x0: 12.5,
      z0: -7.5,
      x1: 15.5,
      z1: -4.5,
      y: 0,
      h: 2.6,
      floor: "metal",
      fc: [0.7, 0.75, 0.78],
      wall: "metal",
      wc: [0.7, 0.78, 0.82],
      ceil: "metal",
      cc: [0.6, 0.65, 0.7],
      trim: false,
      surface: "metal",
    });
    for (let x = 13; x <= 15; x += 0.7) {
      b.pipe("steel", x, 2.2, -7.2, x, 2.2, -5, 0.02, 4);
      if (r() < 0.5)
        b.geo("meat", K.sphereGeo(), {
          x,
          y: 1.6,
          z: -6.2,
          sx: 0.2,
          sy: 0.4,
          sz: 0.16,
          tint: [0.6, 0.45, 0.4],
        });
    }
    b.light(14, 2.2, -6, [0.6, 0.8, 1.0], 0.8, 4, {
      box: [12.4, -0.3, -7.6, 15.6, 2.8, -4.4],
    });
    K.loot(ctx, "fridge", 15.1, 0, -6.8, HP, {
      loot: "food_oldworld",
      name: "Walk-in Shelf",
      owner: "settlers",
      items: [["ph_dn_mystery_meat", 2]],
    });
    // restroom (x 17..20, z 1..4.5)
    K.room(b, ctx, {
      x0: 17,
      z0: -4.5,
      x1: 20,
      z1: -1,
      y: 0,
      h: 2.8,
      floor: "hextile",
      fc: [0.8, 0.8, 0.76],
      wall: "subway_tile",
      wc: [0.8, 0.84, 0.8],
      ceil: "plaster",
      cc: [0.5, 0.5, 0.48],
    });
    b.boxMM("ceramic", 19.3, 0, -2.2, 19.9, 0.45, -1.3, {
      tint: [0.9, 0.9, 0.86],
    });
    b.boxMM("ceramic", 19.7, 0.45, -2.2, 19.95, 1.0, -1.3, {
      tint: [0.9, 0.9, 0.86],
    });
    b.boxMM("ceramic", 19.3, 0.75, -4.4, 19.9, 0.9, -3.7, {
      tint: [0.9, 0.9, 0.86],
    });
    b.plate("glass", 19.98, 1.6, -4.05, -1, 0, 0.5, 0.6, null, {
      tint: [0.5, 0.52, 0.55],
    });
    b.plate(
      "decal",
      18.5,
      1.6,
      -4.38,
      0,
      1,
      1.4,
      0.8,
      K.tag("GUS FEEDS US RATS", "#40d060", 256, 96),
    );
    K.skel(ctx, 19.5, 0.45, -1.8, -HP, "seated");
    K.lamp(b, 18.5, 2.4, -2.7, "bulb", [1, 0.8, 0.5], 0.5, 4, {
      ceil: 2.8,
      lightOpts: { box: [16.9, -0.3, -4.6, 20.1, 3.0, -0.9] },
    });
    K.loot(ctx, "first_aid", 18.5, 1.3, -1.12, PI, { loot: "first_aid" });
    // ---------------- stairs to the cellar (x 14.5..16.9, z 1.2..3.8 → heading north under the kitchen) ----------------
    K.stairs(b, 14.5, -4.2, 16.9, 3.8, BY, 0, "+z", {
      mat: "wood",
      tint: [0.5, 0.4, 0.3],
      rail: "l",
      railMat: "rust",
      handMat: "rust",
      solid: false,
      thick: 0.25,
      surface: "wood",
    });
    // ---------------- CELLAR (x −4..18, z −12..4, y −3.4) ----------------
    const LB = [-4.1, BY - 0.2, -12.1, 18.1, -0.1, 4.1];
    K.gap(ctx, -4, -9, 1.4, BY, 2.4); // cellar → back steps (west)
    K.room(b, ctx, {
      x0: -4,
      z0: -12,
      x1: 18,
      z1: 4,
      y: BY,
      h: 3.1,
      floor: "dirt",
      fc: [0.55, 0.5, 0.42],
      wall: "brick_brown",
      wc: [0.55, 0.45, 0.38],
      ceil: "wood",
      cc: [0.4, 0.34, 0.28],
      noCeil: true,
      trim: false,
      surface: "dirt",
    });
    const cc = (a, bz0, c, bz1) =>
      b.face("wood", a, -0.3, bz0, 1, 0, 0, 0, 0, 1, c - a, bz1 - bz0, {
        uv: "top",
        tint: [0.4, 0.34, 0.28],
      });
    cc(-4, -12, 14.5, 4);
    cc(14.5, -12, 18, -1.6);
    cc(17, -1.6, 18, 4);
    for (let x = -3; x <= 17; x += 2.5)
      b.beam("wood_dark", x, -0.45, -12, x, -0.45, 4, 0.2, 0.3, {
        tint: [0.4, 0.3, 0.22],
      });
    // stores
    for (let k = 0; k < 8; k++)
      b.cyl(
        "wood",
        -3.2 + (k % 4) * 0.75,
        BY,
        2.8 + Math.floor(k / 4) * 0.75,
        0.33,
        0.33,
        0.9,
        10,
        { tint: [0.55, 0.42, 0.3] },
      );
    b.col(-3.6, BY, 2.4, -0.4, BY + 0.9, 3.9, {});
    K.shelf(b, 3, BY, 3.7, PI, 3.6, {
      mat: "wood",
      items: ["can", "jar", "box"],
      seed: 181,
      h: 2.2,
    });
    // butcher block + hanging carcasses (burrow rat, unmistakably)
    K.table(b, 8, BY, -2, 2.4, 1.0, { mat: "wood", tint: [0.6, 0.45, 0.32] });
    b.hplate("decal", 8, BY + 0.77, -2, 2.2, 0.9, 0, K.decal("blood", 180));
    b.pipe("steel", 6, -0.8, -3.6, 10, -0.8, -3.6, 0.03, 4);
    for (let k = 0; k < 5; k++) {
      const x = 6.4 + k * 0.8;
      b.pipe("steel", x, -0.8, -3.6, x, -1.2, -3.6, 0.01, 3);
      b.geo("meat", K.sphereGeo(), {
        x,
        y: -1.7,
        z: -3.6,
        sx: 0.22,
        sy: 0.45,
        sz: 0.18,
        tint: [0.72, 0.5, 0.45],
      });
      b.pipe("meat", x, -2.1, -3.6, x + 0.05, -2.5, -3.6, 0.03, 4, {
        tint: [0.7, 0.5, 0.45],
      });
    }
    b.plate(
      "art",
      8,
      BY + 2.2,
      -3.95,
      0,
      1,
      2.2,
      0.4,
      K.signCell("dn_secret", "SECRET RECIPE — KEEP OUT", 384, 64, {
        bg: "#e8e0c8",
        fg: "#8a1a10",
      }),
    );
    // the BURROW RATS PENS (west): wire pens, troughs, sacks of glowing fungus feed
    for (let k = 0; k < 3; k++) {
      const px0 = -3.8 + k * 3.4,
        px1 = px0 + 3.1;
      for (let x = px0; x <= px1 + 0.01; x += 0.35)
        b.pipe("rust", x, BY, -6, x, BY + 1.3, -6, 0.015, 3);
      b.beam("rust", px0, BY + 1.3, -6, px1, BY + 1.3, -6, 0.04, 0.04);
      b.beam("rust", px0, BY + 0.6, -6, px1, BY + 0.6, -6, 0.03, 0.03);
      b.beam("rust", px1, BY, -11.8, px1, BY + 1.3, -6, 0.04, 0.04);
      b.boxMM(
        "wood_rotten",
        px0 + 0.3,
        BY,
        -11.6,
        px1 - 0.3,
        BY + 0.35,
        -11.1,
        { tint: [0.45, 0.4, 0.3] },
      );
      b.boxMM(
        "flat",
        px0 + 0.35,
        BY + 0.3,
        -11.55,
        px1 - 0.35,
        BY + 0.33,
        -11.15,
        { tint: [0.35, 0.8, 0.3] },
      ); // glowing mash
      b.glow((px0 + px1) / 2, BY + 0.5, -11.3, [0.3, 0.8, 0.25], 1.2);
      b.light((px0 + px1) / 2, BY + 0.6, -10.8, [0.35, 1.0, 0.3], 0.5, 3.5, {
        box: LB,
      });
      for (let j = 0; j < 12; j++)
        b.hplate(
          "decal",
          px0 + r() * 3,
          BY + 0.012 + j * 0.0004,
          -11.5 + r() * 5,
          0.8 + r(),
          0.8 + r(),
          r() * 6,
          K.decal(j % 3 ? "grime" : "blood", j + 190 + k * 20),
        );
    }
    // the gate of the middle pen is torn open (Bertha got out)
    b.beam("rust", 0.5, BY + 0.1, -6.2, 1.8, BY + 0.9, -4.9, 0.04, 1.2, {
      tint: [0.5, 0.35, 0.25],
    });
    b.col(-3.9, BY, -6.05, -0.6, BY + 1.3, -5.95, {});
    b.col(2.9, BY, -6.05, 6.3, BY + 1.3, -5.95, {});
    for (let k = 0; k < 6; k++)
      b.box(
        "fabric",
        7 + (k % 3) * 0.7,
        BY + Math.floor(k / 3) * 0.4,
        -11 + (k % 2) * 0.2,
        0.6,
        0.4,
        0.45,
        { yaw: r() * 0.4, tint: [0.6, 0.72, 0.45] },
      );
    b.plate(
      "art",
      7.7,
      BY + 1.3,
      -11.35,
      0,
      1,
      1.6,
      0.4,
      K.signCell("dn_feed", "GLOW-GRO FEED · CoA", 256, 64, {
        bg: "#2a4a20",
        fg: "#c8ff90",
      }),
    );
    b.light(7.7, BY + 0.8, -10, [0.35, 1.0, 0.3], 0.5, 4, { box: LB });
    b.glow(7.7, BY + 0.8, -10.8, [0.3, 0.8, 0.25], 1.4);
    b.hplate("decal", 1.5, BY + 0.02, -8.5, 3, 3, 0.2, K.decal("rad", 190));
    // the burrow Bertha dug (west wall) — rubble & dirt
    K.rubble(b, -3.2, BY, -1.5, 1.4, 1.1, { seed: 191, mat: "dirt" });
    b.boxMM("paint_black", -3.98, BY, -2.6, -3.93, BY + 1.3, -0.6, {
      tint: [0.03, 0.03, 0.03],
      faces: "e",
    });
    K.skel(ctx, 4.5, BY, -8.8, 2.4, "lying");
    // Spiro's feed ledger
    K.table(b, 16.2, BY, -9.5, 1.2, 0.7, { mat: "wood_dark" });
    K.anchor(ctx, "ledger", 16.2, BY + 0.78, -9.5);
    K.lamp(b, 16.2, BY + 1.9, -9.5, "bulb", [1, 0.8, 0.5], 0.7, 5, {
      ceil: -0.3,
      lightOpts: { box: LB },
    });
    for (const [x, z, i] of [
      [4, -2, 0.6],
      [10, 0, 0.5],
      [1, -9, 0.3],
    ])
      K.lamp(b, x, -1.2, z, "bulb", [1, 0.72, 0.4], i, 6, {
        ceil: -0.3,
        lightOpts: { box: LB },
      });
    K.loot(ctx, "footlocker", 17.3, BY, -11.2, -HP, {
      loot: "footlocker",
      name: "Spiro's Strongbox",
      locked: 0,
      lock: PH.LOCKS.dn_strongbox,
      owner: "settlers",
      items: [
        ["scrip", 90],
        ["ph_dn_mystery_meat", 3],
      ],
    });
    // back steps up to the yard (x −8..−4, z −10..−8)
    K.room(b, ctx, {
      x0: -8,
      z0: -10,
      x1: -4,
      z1: -8,
      y: BY,
      h: 3.3,
      floor: "concrete",
      fc: [0.5, 0.48, 0.45],
      wall: "brick_brown",
      wc: [0.5, 0.42, 0.36],
      ceil: "wood",
      cc: [0.4, 0.34, 0.28],
      trim: false,
    });
    K.stairs(b, -7.6, -9.8, -5.2, -8.2, BY, BY + 1.2, "-x", {
      mat: "concrete",
      tint: [0.5, 0.48, 0.45],
    });
    b.quad(
      "metal_dark",
      [-7.9, BY + 3.3, -9.9],
      [-7.9, BY + 3.3, -8.1],
      [-7.4, BY + 1.5, -8.1],
      [-7.4, BY + 1.5, -9.9],
      { tint: [0.35, 0.3, 0.26] },
    );
    b.light(-7, BY + 2.4, -9, [0.8, 0.8, 0.7], 0.5, 4, {
      box: [-8.1, BY - 0.2, -10.1, -3.9, -0.1, -7.9],
    });
    b.glow(-7.6, BY + 2.6, -9, [0.6, 0.6, 0.5], 1.2);

    // ---------------- doors & anchors ----------------
    const OX = O.x,
      OY = O.y,
      OZ = O.z;
    const W = (x, y, z) => new THREE.Vector3(OX + x, OY + y, OZ + z);
    K.door(ctx, {
      id: "ph_dn_in",
      pos: new THREE.Vector3(DCX, 1.3, DZ1 + 2.25),
      label: "Empire Diner",
      verb: "Enter",
      target: { x: OX, y: OY, z: OZ + 3.0, yaw: 0 },
      onEnter: () => K.safe("disc", () => G.discover("empire_diner")),
    });
    K.door(ctx, {
      id: "ph_dn_out",
      pos: W(0, 1.3, z1 - 0.3),
      label: "22nd Street",
      verb: "Leave",
      target: { x: DCX, y: 0.12, z: DZ1 + 3.4, yaw: PI },
    });
    // cellar bulkhead ⇄ back steps (locked from outside until opened from below)
    K.door(ctx, {
      id: "ph_dn_bulk_out",
      pos: W(-7.6, BY + 1.9, -9),
      label: "Bulkhead — Back Yard",
      verb: "Climb",
      target: { x: DX1 + 2.1, y: 0.12, z: DZ0 - 4.3, yaw: 0 },
      onEnter: () => {
        PH.setFlag("dn_bulk", true);
        if (ctx.bulkIn) ctx.bulkIn.unbar();
      },
    });
    // one-way: bolted from below until opened from the cellar side (not a lock)
    ctx.bulkIn = PH.barDoor(
      K.door(ctx, {
        id: "ph_dn_bulk_in",
        pos: new THREE.Vector3(DX1 + 2.1, 0.8, DZ0 - 2),
        label: "Cellar Bulkhead",
        verb: "Open",
        target: { x: OX - 5.6, y: OY + BY, z: OZ - 9, yaw: -HP },
      }),
      {
        lockText: "Bolted from below",
        message: "The bulkhead doors are bolted from below.",
      },
    );
    K.anchor(ctx, "entrance", 0, 0, 3.0);
    K.anchor(ctx, "gus", 0.8, 0, -2.6);
    K.anchor(ctx, "dolores", -3.8, 0, 0.35);
    K.anchor(ctx, "regular", 5.9, 0, 3.4);
    K.anchor(ctx, "flo", 2, 0, 1.4);
    K.anchor(ctx, "hatch", 15.7, 0, 2.5);
    K.anchor(ctx, "bertha", 1.5, BY, -9);
    K.anchor(ctx, "boss", 1.5, BY, -9);
    [
      [-2.2, BY, -9],
      [5, BY, -9.5],
      [-1, BY, -3],
    ].forEach((p, i) => K.anchor(ctx, "rat" + (i + 1), p[0], p[1], p[2]));
    [
      [-2, BY, -9],
      [5, BY, -9],
      [10, BY, -6],
      [2, BY, 0],
      [14, 0, -2],
      [8, 0, 1],
    ].forEach((p, i) => K.anchor(ctx, "spawn" + (i + 1), p[0], p[1], p[2]));
    K.anchor(ctx, "npc1", -3.8, 0, 0.35);
    K.anchor(ctx, "npc2", 5.9, 0, 3.4);
    K.anchor(ctx, "merchant", 0.8, 0, -2.6);
    K.anchor(ctx, "loot1", 17.3, BY, -11.2);
    K.anchor(ctx, "loot2", 15.1, 0, -6.8);
    ctx.intRoot = b.finish(null);
    ctx.intRoot.name = "poi_diner_int";
    // the jukebox
    const j = ctx.anchors.jukebox;
    G.world.addInteractable({
      pos: new THREE.Vector3(j.x - 0.4, j.y + 1.1, j.z),
      radius: 0.9,
      label: "Jukebox",
      verb: () => (JB.on ? "Stop" : "Play (1 scrip)"),
      priority: 0.4,
      enabled: () => ctx.inside,
      onInteract() {
        if (JB.on) {
          JB.on = false;
          return;
        }
        if (K.scripCount() < 1 && !G.isStub("inventory")) {
          K.notify("The jukebox wants a scrip.");
          return;
        }
        K.safe("pay", () => {
          if (!G.isStub("inventory")) G.inventory.addScrip(-1);
        });
        JB.on = true;
        JB.t = 0;
        JB.beat = 0;
        K.notify(
          'The jukebox clunks, a record drops... "Atomic Sweetheart (Instrumental)".',
        );
      },
    });
  }

  // ==================================================================
  // JUKEBOX — a tiny procedural swing tune (WebAudio, via the sound module's context)
  // ==================================================================
  const JB = { on: false, t: 0, beat: 0, next: 0, gain: null, ctx: null };
  const MEL = [
    67, 69, 71, 74, 76, 74, 71, 69, 67, 64, 67, 69, 71, -1, 69, 67, 72, 71, 69,
    67, 64, 62, 64, 67, 69, 67, 64, 62, 60, -1, -1, -1,
  ];
  const BASS = [48, 52, 55, 57, 53, 57, 60, 57, 48, 52, 55, 57, 55, 59, 62, 59];
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  function jbAudio() {
    const S = G._snd,
      ac = S && S.ctx;
    if (!ac || ac.state !== "running") return null;
    if (JB.ctx !== ac) {
      JB.ctx = ac;
      JB.gain = ac.createGain();
      JB.gain.gain.value = 0;
      const lp = ac.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 2600; // old speaker
      JB.gain.connect(lp);
      lp.connect(
        (S.bus && (S.bus.world || S.bus.sfx || S.bus.master)) || ac.destination,
      );
      JB.next = ac.currentTime + 0.1;
    }
    return ac;
  }
  function jbNote(ac, t, f, dur, type, vol) {
    const o = ac.createOscillator(),
      g = ac.createGain();
    o.type = type;
    o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(JB.gain);
    o.start(t);
    o.stop(t + dur + 0.05);
  }
  function jbUpdate(ctx) {
    const ac = jbAudio();
    if (!ac) return;
    const P = G.player.pos,
      j = ctx.anchors.jukebox;
    const d = Math.hypot(P.x - j.x, P.z - j.z);
    const target = JB.on && ctx.inside ? Math.max(0, 0.22 * (1 - d / 26)) : 0;
    JB.gain.gain.setTargetAtTime(target, ac.currentTime, 0.2);
    if (!JB.on || !ctx.inside) {
      JB.next = ac.currentTime + 0.1;
      return;
    }
    const spb = 60 / 132 / 2; // swung eighths at 132 bpm
    while (JB.next < ac.currentTime + 0.25) {
      const i = JB.beat,
        t = JB.next + (i % 2 ? spb * 0.18 : 0);
      const m = MEL[i % MEL.length];
      if (m > 0) jbNote(ac, t, mtof(m + 12), spb * 1.6, "square", 0.05);
      if (i % 2 === 0) {
        const bm = BASS[(i / 2) % BASS.length];
        jbNote(ac, t, mtof(bm - 12), spb * 1.8, "triangle", 0.14);
      }
      if (i % 4 === 2)
        jbNote(ac, t, 1800 + Math.random() * 400, 0.04, "square", 0.015); // brushed snare-ish tick
      JB.beat++;
      JB.next += spb;
      if (JB.beat >= MEL.length * 4) {
        JB.on = false;
        break;
      }
    }
  }

  // ==================================================================
  // DATA: items, quest, dialogue
  // ==================================================================
  function data() {
    K.defineItem({
      id: "ph_dn_mystery_meat",
      type: "aid",
      name: "Mystery Meat Platter",
      weight: 1,
      value: 15,
      tags: ["food"],
      mesh: "meat_stick",
      sound: "eat",
      effects: { hpOverTime: [45, 10], rads: 6 },
      desc: 'Grey-brown, generous, gravy on everything. Tastes like chicken, if the chicken had been somewhere. A faint green sheen on the gravy is "part of the recipe."',
    });
    K.defineItem({
      id: "ph_dn_blue_plate",
      type: "aid",
      name: "Blue Plate Special",
      weight: 1,
      value: 20,
      tags: ["food"],
      mesh: "meat_stick",
      sound: "eat",
      effects: { hpOverTime: [60, 12], attrs: { brawn: 1 }, duration: 300 },
      desc: "burrow rat pot roast, spud mash, gravy, served on a genuine blue plate. Clean-fed, rad-free, Spiro swears on his mother. +1 STR while it lasts.",
    });
    K.defineItem({
      id: "ph_dn_coffee",
      type: "aid",
      name: "Empire Diner Coffee",
      weight: 0.5,
      value: 5,
      tags: ["drink"],
      mesh: "bottle_milk",
      sound: "drink",
      effects: { stamina: 15, hp: 5 },
      desc: "Bottomless (subject to availability). Strong enough to strip chrome.",
    });
    K.defineItem({
      id: "ph_dn_ledger",
      type: "note",
      name: "Spiro's Feed Ledger",
      weight: 0,
      value: 0,
      title: 'Feed ledger — "the girls"',
      text: "BERTHA — 41 lbs (!!) — 3 scoops Glow-Gro\nMAUDE — 18 lbs — 2 scoops\nLIL' SUE — 12 lbs — 1 scoop (picky)\n\nGlow-Gro Feed, from the Glowkeepers at St. Pat's: 10 scrip a sack. The girls DOUBLE in size. Customers say the Mystery Meat \"has a kick.\" That's the Glow, baby.\n\nNB: Earl K. (counter) asked why his fingernails glow in the dark. Told him it's the coffee. Must cut back the scoops. Must NOT tell Bernadette.\nNB 2: Bertha bit through the pen again. She's smart. She's very, very big.",
    });
    K.defineItem({
      id: "ph_dn_recipe_card",
      type: "misc",
      name: "Spiro's Recipe Card",
      weight: 0,
      value: 40,
      desc: 'A grease-spotted index card: "MYSTERY MEAT — burrow rat, clean-fed, braised in Fizzo Cola, onion, a secret spice (it\'s salt)." Signed with a flourish: G. Papadakis, Empire Diner, est. 1946 (re-est. 1972).',
    });
    if (!G.isStub("quests") && G.quests.define) {
      G.quests.define({
        id: "ph_mystery_meat",
        name: "Mystery Meat",
        giver: "Bernadette Wisniewski",
        location: "Empire Diner",
        desc: "Bernadette Wisniewski's husband Earl eats the Mystery Meat Platter at the Empire Diner every single day. Now his fingernails glow in the dark. She wants to know what Spiro, the cook, is really putting in it.",
        stages: [
          {
            id: "ask",
            text: "Ask Spiro what's in the Mystery Meat.",
            markers: [{ npc: "ph_gus", label: "Spiro" }],
          },
          {
            id: "cellar",
            text: "Search the Empire Diner's cellar (hatch in the kitchen).",
            markers: [() => dnMarker("hatch", "Cellar Hatch")],
          },
          {
            id: "pens",
            text: "Find out what Spiro keeps in the cellar.",
            markers: [() => dnMarker("ledger", "Cellar")],
          },
          {
            id: "bertha",
            text: "(Optional) Put down Big Bertha, the escaped burrow rat.",
            sideObjective: true,
            optional: true,
            showIf: () => K.q.active("ph_mystery_meat"),
            doneIf: () => !!PH.flag("dn_bertha"),
          },
          {
            id: "decide",
            text: "Confront Spiro, or tell Bernadette what you found.",
            markers: [
              { npc: "ph_gus", label: "Spiro" },
              { npc: "ph_dolores", label: "Bernadette" },
            ],
          },
        ],
        rewards: { xp: 250 },
      });
    }
    if (G.isStub("dialogue") || !G.dialogue.register) return;
    G.dialogue.register("ph_dlg_gus", {
      start: () =>
        K.q.active("ph_mystery_meat") &&
        K.has("ph_dn_ledger") &&
        !PH.flag("dn_choice")
          ? "caught"
          : PH.flag("met_gus")
            ? "again"
            : "hello",
      nodes: {
        hello: {
          speaker: "Spiro Papadakis",
          onEnter: () => PH.setFlag("met_gus", true),
          text: "Siddown, siddown! Empire Diner, open twenty-four hours since nineteen forty-six — well, with one little break. I'm Spiro. What'll it be? Special today is the Mystery Meat Platter. Special every day is the Mystery Meat Platter.",
          responses: [
            { text: "Let me see the menu.", barter: true, end: true },
            { text: "What's in the Mystery Meat?", next: "meat" },
            { text: "Nice place. Still standing, even.", next: "place" },
            { text: "Goodbye.", end: true },
          ],
        },
        again: {
          speaker: "Spiro Papadakis",
          text: "Back for more! I knew it. Nobody leaves the Empire hungry. Some leave a little greener, ha ha. Kidding. Mostly.",
          responses: [
            { text: "Show me what you've got.", barter: true, end: true },
            {
              text: "Seriously, what's in the Mystery Meat?",
              next: "meat",
              cond: () => !PH.flag("dn_choice"),
            },
            {
              text: "How are the... girls?",
              next: "girls",
              cond: () =>
                PH.flag("dn_choice") === "truth" ||
                PH.flag("dn_choice") === "reform",
            },
            { text: "Goodbye.", end: true },
          ],
        },
        place: {
          speaker: "Spiro Papadakis",
          text: "Rode out the bombs in the walk-in. Came out with no eyebrows and a burn down one cheek — that's why the face. Stainless steel, kid. Built like a battleship on wheels. The Empire State lost its windows; my little Empire State on the roof didn't lose a thing.",
          responses: [
            { text: "What's in the Mystery Meat?", next: "meat" },
            { text: "Goodbye.", end: true },
          ],
        },
        meat: {
          speaker: "Spiro Papadakis",
          onEnter: () => {
            if (K.q.active("ph_mystery_meat"))
              K.q.set("ph_mystery_meat", "cellar");
          },
          text: "Now that's a family secret. My pop's recipe, and his pop's. Meat, gravy, love. And a secret spice. You want to know more than that, you gotta marry into the family, and I'm spoken for.",
          responses: [
            {
              text: "[Persuasion 45] Spiro. People are glowing.",
              check: { skill: "persuasion", value: 45 },
              next: "confess",
              failNext: "deflect",
            },
            { text: "Fine. Keep your secrets.", end: true },
          ],
        },
        deflect: {
          speaker: "Spiro Papadakis",
          text: "Glowing! That's the healthy glow of a well-fed customer. Next you'll be telling me my coffee is too strong. Kitchen's staff only, by the way. Totally unrelated.",
          responses: [{ text: "Uh-huh.", end: true }],
        },
        confess: {
          speaker: "Spiro Papadakis",
          onEnter: () => {
            PH.setFlag("dn_confessed", true);
            if (K.q.active("ph_mystery_meat"))
              K.q.set("ph_mystery_meat", "pens");
          },
          text: "(He glances at Bernadette and drops his voice.) ...burrow rat. It's burrow rat, okay? I raise 'em in the cellar. Clean, cheap, tender. Only — I buy this feed from the Glowkeeper kids, Glow-Gro, and it makes 'em grow like crazy, and maybe it makes the meat a little... hot. And Bertha, my biggest girl, she got out of the pen last night and now I can't go down there. Here — the hatch. Take a look. Just don't tell Bernadette. Please.",
          responses: [{ text: "I'll take a look.", end: true }],
        },
        caught: {
          speaker: "Spiro Papadakis",
          text: "(He sees the ledger in your hand and deflates like a soufflé.) Yeah. Yeah, okay. Glow-Gro. Forty-one pounds of Bertha. I know. So what happens now?",
          responses: [
            {
              text: "Switch to clean feed and tell your customers the truth.",
              next: "reform",
              standing: 15,
              action: () => decide("reform"),
            },
            {
              text: '[Persuasion 60] Switch the feed — and put "Clean-Fed Burrow Rat" on the menu. People will pay extra.',
              check: { skill: "persuasion", value: 60 },
              next: "reform_plus",
              failNext: "reform",
              action: () => decide("reform"),
            },
            {
              text: "Two hundred scrip and Bernadette never hears about it.",
              next: "blackmail",
              standing: -30,
              action: () => decide("blackmail"),
            },
            { text: "I'm telling Bernadette everything.", next: "truth_warn" },
          ],
        },
        reform: {
          speaker: "Spiro Papadakis",
          text: "Clean feed. Scraps, spuds, the odd giant roach. Slower, but nobody'll glow. And the Blue Plate Special goes back on the board. Here, kid — on the house, forever. Go tell Bernadette her Earl's gonna be fine.",
          responses: [{ text: "Deal.", end: true }],
        },
        reform_plus: {
          speaker: "Spiro Papadakis",
          onEnter: () => {
            if (!PH.flag("dn_card")) {
              PH.setFlag("dn_card", true);
              K.give("ph_dn_recipe_card", 1);
              K.scrip(75);
            }
          },
          text: '"Clean-Fed." Ha! Kid, you\'re a genius. Charge double for the same rat and call it health food. Take my recipe card — framed copy goes on the wall. And a cut of the first week.',
          responses: [{ text: "Pleasure doing business.", end: true }],
        },
        blackmail: {
          speaker: "Spiro Papadakis",
          onEnter: () => {
            if (!PH.flag("dn_paid")) {
              PH.setFlag("dn_paid", true);
              K.scrip(200);
            }
          },
          text: "(He counts out scrip with shaking grey fingers.) Two hundred. That's the whole register and my rainy-day jar. You're a real piece of work, you know that?",
          responses: [{ text: "Pleasure doing business.", end: true }],
        },
        truth_warn: {
          speaker: "Spiro Papadakis",
          text: "Go on, then. Tell her. She'll take her Earl and go, and so will everybody else, and the Empire goes dark for the first time since the bombs. ...Or I switch the feed. Your call, kid.",
          responses: [
            {
              text: "Switch the feed.",
              next: "reform",
              standing: 10,
              action: () => decide("reform"),
            },
            {
              text: "She deserves the truth.",
              end: true,
              action: () => PH.setFlag("dn_tell", true),
            },
          ],
        },
        girls: {
          speaker: "Spiro Papadakis",
          text: "Clean-fed and happy. Maude had babies. I named one after you. It bit me. Very fitting.",
          responses: [{ text: "Goodbye.", end: true }],
        },
      },
    });
    G.dialogue.register("ph_dlg_dolores", {
      start: () =>
        K.q.done("ph_mystery_meat")
          ? "after"
          : K.q.active("ph_mystery_meat") &&
              (PH.flag("dn_choice") ||
                PH.flag("dn_tell") ||
                K.has("ph_dn_ledger"))
            ? "report"
            : K.q.active("ph_mystery_meat")
              ? "waiting"
              : "hello",
      nodes: {
        hello: {
          speaker: "Bernadette Wisniewski",
          text: "You look like somebody who isn't afraid of a kitchen. Listen, hon. My Earl — he eats the Mystery Meat here every single day, God knows why. Last week his fingernails started glowing. In the DARK. Spiro says it's the coffee. It is not the coffee.",
          responses: [
            {
              text: "I'll find out what's in it.",
              next: "accept",
              action: () => K.q.start("ph_mystery_meat"),
            },
            { text: "Maybe Earl should order something else.", next: "earl" },
            { text: "Not my business.", end: true },
          ],
        },
        earl: {
          speaker: "Bernadette Wisniewski",
          text: "Earl has ordered the same thing every day for forty years. Before the bombs it was the meatloaf. When the meatloaf ran out he cried for a week. So no. Please, hon — just find out what Spiro is putting in there.",
          responses: [
            {
              text: "All right. I'll look into it.",
              next: "accept",
              action: () => K.q.start("ph_mystery_meat"),
            },
            { text: "No.", end: true },
          ],
        },
        accept: {
          speaker: "Bernadette Wisniewski",
          text: "Bless you. Spiro won't say a word — but he keeps going down through a hatch in the kitchen with buckets of something green. I'll be right here. Where else would I be?",
          responses: [{ text: "Back soon.", end: true }],
        },
        waiting: {
          speaker: "Bernadette Wisniewski",
          text: "Well? Anything? Earl read the newspaper in the dark last night. Without a lamp.",
          responses: [{ text: "Still looking.", end: true }],
        },
        report: {
          speaker: "Bernadette Wisniewski",
          text: "You're back. You look like you've seen something. Tell me straight, hon.",
          responses: [
            {
              text: "burrow rats, raised on radioactive feed. Spiro is switching to clean feed. Earl will be fine.",
              next: "relief",
              cond: () => PH.flag("dn_choice") === "reform",
              standing: 10,
              action: () => finishMeat("reform"),
            },
            {
              text: "burrow rats, fed on glowing fungus. Spiro knew. (Show her the ledger.)",
              next: "furious",
              cond: () => K.has("ph_dn_ledger"),
              action: () => finishMeat("truth"),
            },
            {
              text: "It's nothing. Just gravy. Earl's fine.",
              next: "lie",
              standing: -10,
              action: () => finishMeat("lie"),
            },
          ],
        },
        relief: {
          speaker: "Bernadette Wisniewski",
          text: "burrow rat! Well — I've eaten worse at my sister's. As long as it stops glowing. Here, hon, for your trouble. Earl saved these for a rainy day. It's always a rainy day now.",
          responses: [{ text: "Take care, Bernadette.", end: true }],
        },
        furious: {
          speaker: "Bernadette Wisniewski",
          text: "He KNEW? That grey-faced son of a — GUS! (She storms over to the counter; there is shouting; then, remarkably, a truce.) He says he'll change the feed. He also says I'm banned. We'll see about that. Thank you, hon. Take this.",
          responses: [{ text: "Glad to help.", end: true }],
        },
        lie: {
          speaker: "Bernadette Wisniewski",
          text: "Just gravy. Well... all right. If you say so. (She doesn't quite believe you, but she wants to.) Thank you for looking, anyway.",
          responses: [{ text: "Goodbye.", end: true }],
        },
        after: {
          speaker: "Bernadette Wisniewski",
          text: "Earl says hello. From the booth. He's eating the Blue Plate now. He doesn't glow anymore, but he does hum. We're working on it.",
          responses: [{ text: "Goodbye.", end: true }],
        },
      },
    });
    G.dialogue.register("ph_dlg_flo", {
      start: "hello",
      nodes: {
        hello: {
          speaker: "Flo",
          text: "WELCOME TO THE EMPIRE DINER. MY NAME IS FLO. I WILL BE YOUR SERVER. MAY I RECOMMEND THE MYSTERY MEAT. IT IS A MYSTERY. I HAVE NOT BEEN AUTHORISED TO SOLVE IT.",
          responses: [
            { text: "What's in the cellar, Flo?", next: "cellar" },
            { text: "Just coffee, thanks.", next: "coffee" },
            { text: "Goodbye.", end: true },
          ],
        },
        cellar: {
          speaker: "Flo",
          text: "CELLAR ACCESS IS RESTRICTED TO GUS. FLO ATTEMPTED TO TIDY THE CELLAR ON 14 OCCASIONS. THE CELLAR BIT FLO ON 14 OCCASIONS. FLO NO LONGER TIDIES THE CELLAR.",
          responses: [{ text: "Thanks, Flo.", end: true }],
        },
        coffee: {
          speaker: "Flo",
          onEnter: () => {
            if (!PH.flag("flo_coffee")) {
              PH.setFlag("flo_coffee", true);
              K.give("ph_dn_coffee", 1);
            }
          },
          text: "ONE COFFEE. BOTTOMLESS. PLEASE DO NOT TEST THIS CLAIM.",
          responses: [{ text: "Goodbye.", end: true }],
        },
      },
    });
  }
  function dnMarker(name, label) {
    const a = PH.anchor("empire_diner", name);
    return a ? { x: a.x, y: a.y, z: a.z, label } : null;
  }
  function decide(choice) {
    PH.setFlag("dn_choice", choice);
    if (K.q.active("ph_mystery_meat")) K.q.set("ph_mystery_meat", "decide");
    if (choice === "reform" && !PH.flag("dn_reform_gift")) {
      PH.setFlag("dn_reform_gift", true);
      K.give("ph_dn_blue_plate", 2);
    }
  }
  function finishMeat(how) {
    if (PH.flag("dn_done")) return;
    PH.setFlag("dn_done", how);
    if (how === "reform" || how === "truth") K.scrip(120);
    if (how === "truth") K.standing(10, "Told Bernadette the truth");
    K.q.complete("ph_mystery_meat");
  }

  // ==================================================================
  // SPAWN
  // ==================================================================
  function spawn(ctx) {
    const A = ctx.anchors;
    const menu = [
      ["ph_dn_mystery_meat", PH.flag("dn_choice") === "reform" ? 0 : 5],
      ["ph_dn_coffee", 6],
      ["ph_dn_blue_plate", PH.flag("dn_choice") === "reform" ? 4 : 1],
      ["fizzo_cola", 3],
      ["cinnamon_bun", 2],
      ["beer", 2],
    ].filter((e) => e[1] > 0);
    PH.spawnActor(ctx, {
      id: "ph_gus",
      type: "human",
      gender: "m",
      outfit: "survivor_layers",
      name: "Spiro Papadakis",
      burn: "R",
      faction: "settlers",
      level: 6,
      essential: true,
      pos: v(A.gus),
      yaw: PI,
      ai: "merchant",
      home: "here",
      homeR: 2.5,
      dialogue: "ph_dlg_gus",
      voice: "settler",
      merchant: {
        scrip: 280,
        stock: K.stock(menu, "merchant_food", 3),
        restock: 2,
      },
      barks: [
        "Order up!",
        "Mystery Meat, extra gravy, coming right up!",
        "Siddown, siddown!",
        "Nobody leaves the Empire hungry.",
      ],
    });
    PH.spawnActor(ctx, {
      id: "ph_dolores",
      type: "human",
      gender: "f",
      outfit: "settler",
      name: "Bernadette Wisniewski",
      faction: "settlers",
      level: 3,
      essential: true,
      pos: v(A.dolores),
      yaw: PI,
      ai: "sit",
      home: "here",
      homeR: 0.4,
      dialogue: "ph_dlg_dolores",
      barks: ["It is NOT the coffee.", "Forty years of the same order. Forty!"],
    });
    PH.spawnActor(ctx, {
      id: "ph_flo",
      type: "patrolman",
      variant: "medical",
      name: "Flo",
      faction: "settlers",
      level: 4,
      essential: true,
      hostile: false,
      pos: v(A.flo),
      yaw: 0,
      ai: "wander",
      home: "here",
      homeR: 4,
      dialogue: "ph_dlg_flo",
      voice: "robot",
      barks: [
        "MORE COFFEE?",
        "PLEASE WAIT TO BE SEATED. YOU HAVE WAITED. PLEASE SIT.",
        "THE SPECIAL IS SPECIAL.",
      ],
    });
    PH.spawnActor(ctx, {
      id: "ph_dn_regular",
      type: "human",
      gender: "m",
      outfit: "drifter",
      name: "Earl Wisniewski",
      faction: "settlers",
      level: 3,
      pos: v(A.regular),
      yaw: -HP,
      ai: "sit",
      home: "here",
      homeR: 0.4,
      barks: [
        "Best Mystery Meat in the five boroughs.",
        "My fingernails? Oh, that's the coffee.",
        "Hmmm-mmm-mm.",
      ],
    });
    const yard = PH.anchor("empire_diner", "yard");
    if (yard)
      PH.spawnActor(ctx, {
        id: "ph_dn_guard",
        type: "human",
        gender: "f",
        outfit: "combat_armor",
        name: "Diner Guard",
        faction: "settlers",
        level: 6,
        pos: v(yard),
        ai: "guard",
        home: "here",
        homeR: 4,
        weapon: K.itemExists("combat_shotgun") ? "combat_shotgun" : undefined,
        barks: ["Spiro says no fighting in the lot.", "You eat, you pay."],
      });
    if (!PH.flag("dn_bertha")) {
      const bert = PH.spawnActor(ctx, {
        id: "ph_dn_bertha",
        type: "burrow_rat",
        name: "Big Bertha",
        faction: "creatures",
        level: 6,
        hostile: true,
        pos: v(A.bertha),
        yaw: 1,
        ai: "guard",
        home: "here",
        homeR: 6,
        noRespawn: true,
        hp: 160,
        xp: 90,
        inventory: [["burrow_rat_meat", 3]],
        onDeath: () => {
          PH.setFlag("dn_bertha", true);
          K.notify("Big Bertha is dead. Forty-one pounds of her.");
        },
      });
      if (bert && bert.char && bert.char.root) {
        bert.char.root.scale.setScalar(2.2);
        bert.radius = Math.max(bert.radius || 0.4, 0.8);
      }
      for (let i = 1; i <= 3; i++)
        PH.spawnActor(ctx, {
          id: "ph_dn_rat" + i,
          type: "burrow_rat",
          name: ["Maude", "Lil' Sue", "Burrow Rat"][i - 1],
          faction: "creatures",
          level: 3,
          hostile: true,
          pos: v(A["rat" + i]),
          ai: "wander",
          home: "here",
          homeR: 4,
          noRespawn: true,
        });
    }
    if (!K.has("ph_dn_ledger") && !PH.flag("dn_ledger"))
      K.safe("ledger", () => {
        if (!G.isStub("items") && G.items.spawnPickup)
          G.items.spawnPickup("ph_dn_ledger", 1, v(A.ledger), {
            static: false,
            keepY: true,
            noSave: true,
          });
      });
    if (ctx.bulkIn && PH.flag("dn_bulk")) ctx.bulkIn.unbar(true);
  }
  function v(a) {
    return { x: a.x, y: a.y, z: a.z };
  }
  G.events.on("itemAdded", (id) => {
    if (id === "ph_dn_ledger") {
      PH.setFlag("dn_ledger", true);
      if (!K.q.started("ph_mystery_meat")) K.q.start("ph_mystery_meat");
      if (K.q.active("ph_mystery_meat")) K.q.set("ph_mystery_meat", "decide");
    }
  });

  function update(dt, realDt, ctx) {
    if (ctx.inside || JB.on) K.safe("jukebox", () => jbUpdate(ctx));
    if (!ctx.inside || !dt) return;
    const P = G.player.pos;
    if (
      P.y - ctx.O.y < -1.5 &&
      K.q.active("ph_mystery_meat") &&
      ["ask", "cellar"].indexOf(K.q.stage("ph_mystery_meat")) >= 0
    )
      K.q.set("ph_mystery_meat", "pens");
  }
  function reset(ctx) {
    JB.on = false;
    if (ctx.bulkIn) ctx.bulkIn.rebar();
  }

  PH.define({
    id: "empire_diner",
    lod: 480,
    name: "Empire Diner",
    interior: "empire_diner",
    order: 30,
    lift: 4, // lift: the cellar (y −3.4) must stay ≥ 0
    build(ctx) {
      PH.dnCtx = ctx;
      exterior(ctx);
      interior(ctx);
    },
    data,
    spawn,
    update,
    reset,
  });
})();
