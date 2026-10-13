/* src/poi_civic/31_stpatricks_interior.js */
/* =====================================================================
 * NEW RAD CITY — poi_civic / 31_stpatricks_interior.js
 * OLD ST. PATRICK'S CATHEDRAL — INTERIOR + CATACOMBS (cell
 * old_st_patricks, origin 9400,0,400) + street ↔ interior doors, props,
 * gates, interior NPCs.
 *
 * Layout (local metres, +z = south = the door out to Grand Street):
 *   NARTHEX (x −6..6, z 0..4)
 *   NAVE (x −10..10, z −40..0, 14 m walls + a pointed star-painted vault):
 *     box pews, side galleries and the organ loft (y 5.5) reached by a
 *     spiral stair in the SW corner; the raised SANCTUARY with the high
 *     altar and the gilded REREDOS; glowing stained-glass lancets; a
 *     collapsed bay of the vault
 *   BAPTISTRY (west, x −18..−10): stone font; the stair up from the
 *     catacombs comes out here (loop back)
 *   SACRISTY (east, x 10..18, y 0.6): vestment presses → stair DOWN
 *   CATACOMBS (y −5): landing → the LONG GALLERY (brick barrel vault,
 *     family vaults with marble plaques) → the BISHOPS' CRYPT (reward,
 *     iron grille; the silver bell reliquary) → the OLD TUNNEL south with
 *     wall niches → the OSSUARY (the Sexton, a Maniac Bruiser) → stair up
 *     into the baptistry.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE) return;
  const PC = G._pc;
  const K = PC.kit;
  const PI = Math.PI,
    HP = PI / 2;
  const NH = 14,
    VR = 19.5,
    LOFT = 5.5,
    SAN = 0.6,
    BY = -5;
  const CANDLE = [1, 0.62, 0.28],
    CRYPT = [0.55, 0.62, 0.7],
    RAD = [0.45, 1, 0.35];

  K.addCustom(
    "starvault",
    function (x, S, r) {
      // blue-painted vault with gilt stars
      x.fillStyle = "#243a5a";
      x.fillRect(0, 0, S, S);
      for (let i = 0; i < 40; i++) {
        const px = r() * S,
          py = r() * S,
          rad = 40 + r() * 100,
          g = x.createRadialGradient(px, py, 0, px, py, rad);
        g.addColorStop(0, "rgba(20,30,50,0.4)");
        g.addColorStop(1, "rgba(20,30,50,0)");
        x.fillStyle = g;
        x.fillRect(px - rad, py - rad, rad * 2, rad * 2);
      }
      x.fillStyle = "#d8b060";
      for (let j = 0; j < 6; j++)
        for (let i = 0; i < 6; i++) {
          const cx = ((i + (j % 2) * 0.5) * S) / 6 + S / 12,
            cy = (j * S) / 6 + S / 12;
          x.beginPath();
          for (let k = 0; k < 10; k++) {
            const a = -HP + (k * PI) / 5,
              rr = k % 2 ? 5 : 12;
            x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
          }
          x.closePath();
          x.fill();
        }
      // water damage: peeled plaster patches
      for (let i = 0; i < 10; i++) {
        const px = r() * S,
          py = r() * S,
          rad = 20 + r() * 60,
          g = x.createRadialGradient(px, py, rad * 0.5, px, py, rad);
        g.addColorStop(0, "rgba(170,160,140,0.85)");
        g.addColorStop(1, "rgba(170,160,140,0)");
        x.fillStyle = g;
        x.fillRect(px - rad, py - rad, rad * 2, rad * 2);
      }
      K.streaks(x, 0, 0, S, S, 40, 2001, 0.35);
    },
    { tile: [4, 4], rough: 0.8 },
  );

  const plaque = (i) => {
    i = ((i % 8) + 8) % 8;
    return K.signCell(
      "pc_sp_plq" + i,
      [
        "KIERNAN\nREQUIESCANT IN PACE",
        "BYRNE · 1831",
        "DOLAN FAMILY\nMDCCCXLII",
        "O'CONNELL\nPRAY FOR US",
        "McGRATH · 1867",
        "DELANEY\nIN CHRISTO",
        "THE SEXTON'S VAULT",
        "FLANAGAN · 1849",
      ][i],
      256,
      128,
      { bg: "#d8d2c0", fg: "#3a342a", font: "Georgia, serif" },
    );
  };
  const reredosArt = () =>
    K.paint("art", "pc_sp_reredos", 512, 512, function (x, X, Y, W, H) {
      x.fillStyle = "#6a4a20";
      x.fillRect(X, Y, W, H);
      const g = x.createLinearGradient(X, Y, X + W, Y + H);
      g.addColorStop(0, "#d8b060");
      g.addColorStop(0.5, "#a07830");
      g.addColorStop(1, "#d8b060");
      for (let i = 0; i < 5; i++) {
        const px = X + 12 + (i * (W - 24)) / 5,
          pw = (W - 24) / 5 - 10,
          top = Y + (i === 2 ? 20 : 80);
        x.fillStyle = g;
        x.beginPath();
        x.moveTo(px, Y + H - 20);
        x.lineTo(px, top + 60);
        x.lineTo(px + pw / 2, top);
        x.lineTo(px + pw, top + 60);
        x.lineTo(px + pw, Y + H - 20);
        x.fill();
        x.fillStyle = "#2a2a4a";
        x.beginPath();
        x.moveTo(px + 10, Y + H - 40);
        x.lineTo(px + 10, top + 70);
        x.lineTo(px + pw / 2, top + 22);
        x.lineTo(px + pw - 10, top + 70);
        x.lineTo(px + pw - 10, Y + H - 40);
        x.fill();
        x.fillStyle = "#e8dcc0";
        x.beginPath();
        x.ellipse(px + pw / 2, Y + H * 0.62, pw * 0.18, H * 0.2, 0, 0, PI * 2);
        x.fill();
        x.beginPath();
        x.arc(px + pw / 2, Y + H * 0.38, pw * 0.1, 0, PI * 2);
        x.fill();
        x.strokeStyle = "#f0d080";
        x.lineWidth = 3;
        x.beginPath();
        x.arc(px + pw / 2, Y + H * 0.38, pw * 0.16, 0, PI * 2);
        x.stroke();
      }
      K.stains(x, X, Y, W, H, 14, 2002, 0.45, [30, 20, 10]);
    });

  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  /** Brick barrel vaults (continuous UVs via K.vault). */
  function vaultZ(b, x0, x1, y, z0, z1, h, tint) {
    K.vault(b, {
      axis: "z",
      from: z0,
      to: z1,
      c: (x0 + x1) / 2,
      r: (x1 - x0) / 2 - 0.1,
      y,
      h,
      mat: "crypt_brick",
      tint,
      seg: 8,
    });
  }
  function vaultX(b, z0, z1, y, x0, x1, h, tint) {
    K.vault(b, {
      axis: "x",
      from: x0,
      to: x1,
      c: (z0 + z1) / 2,
      r: (z1 - z0) / 2 - 0.1,
      y,
      h,
      mat: "crypt_brick",
      tint,
      seg: 8,
    });
  }
  function vaultPt(x0, x1, y, yA, t, s) {
    const q = K.ptArc(t);
    return [(x0 + x1) / 2 + s * q[0] * (x1 - x0), y + (yA - y) * q[1]];
  }

  function interior(ctx) {
    const O = ctx.O;
    const b = K.builder({
      name: "sp_int",
      off: O,
      lit: true,
      amb: [0.13, 0.13, 0.15],
      floors: [0, SAN, LOFT, BY],
      grime: 0.55,
    });
    const r = K.rng("sp_int");
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

    // ================= NARTHEX =================
    const NB = [-6.1, -0.3, -0.1, 6.1, 4.3, 4.1];
    K.gap(ctx, 0, 0, 3.0, 0, 3.6);
    K.room(b, ctx, {
      x0: -6,
      z0: 0,
      x1: 6,
      z1: 4,
      y: 0,
      h: 4.2,
      floor: "marble",
      fc: [0.5, 0.46, 0.42],
      wall: "plaster",
      wc: [0.7, 0.66, 0.58],
      ceil: "wood",
      cc: [0.4, 0.3, 0.22],
    });
    K.doorway(b, 0, 0, 3.9, 0, -1, {
      w: 3.0,
      h: 2.7,
      transom: 0.4,
      mat: "wood_dark",
      tint: [0.95, 0.85, 0.72],
      kick: "black_iron",
      glass: false,
      frame: "wood_dark",
      frameTint: [0.7, 0.6, 0.5],
      glow: [0.85, 0.9, 1.0],
      glowI: 0.5,
      exit: "EXIT",
      exitY: 3.88,
      lightBox: NB,
    });
    for (const s of [-1, 1]) {
      b.cyl("marble", s * 2.6, 0, 0.5, 0.3, 0.25, 1.0, 10, {
        tint: [0.7, 0.68, 0.62],
      });
      b.cyl("marble", s * 2.6, 1.0, 0.5, 0.38, 0.2, 0.2, 10, {
        tint: [0.7, 0.68, 0.62],
      });
    } // holy water stoups
    b.plate(
      "art",
      4.5,
      2.2,
      3.85,
      0,
      -1,
      1.6,
      1.2,
      K.signCell(
        "pc_sp_mass",
        "MASS SCHEDULE\nSUN 7 · 9 · 11\n(SUSPENDED)",
        256,
        192,
        { bg: "#2a2620", fg: "#e8dcc0", font: "Georgia, serif" },
      ),
    );
    for (const lx of [-3.6, 3.6])
      K.lamp(b, lx, 3.2, 2, "lantern", CANDLE, 0.3, 5, {
        ceil: 4.2,
        size: 0.22,
        lightOpts: { box: NB },
      }); // (pair: keeps the EXIT sign over the doors clear)

    // ================= NAVE =================
    const NVB = [-10.1, -0.3, -40.1, 10.1, VR + 0.5, 0.1];
    K.gap(ctx, -10, -7, 2.2, 0, 3.4); // → baptistry
    K.gap(ctx, 10, -35, 1.6, SAN, 2.6); // → sacristy (from the sanctuary)
    K.room(b, ctx, {
      x0: -10,
      z0: -40,
      x1: 10,
      z1: 0,
      y: 0,
      h: NH,
      floor: "marble",
      fc: [0.46, 0.42, 0.38],
      wall: "plaster",
      wc: [0.78, 0.74, 0.66],
      wain: "oak_panel",
      wainC: [0.5, 0.36, 0.24],
      wainH: 1.3,
      noCeil: true,
      noFloor: true,
    });
    fl("marble", -10, -31, 10, 0, 0, [0.46, 0.42, 0.38]);
    K.vault(b, {
      axis: "z",
      from: -40,
      to: 0,
      c: 0,
      r: 9.9,
      y: NH,
      h: VR - NH,
      mat: "starvault",
      tint: [0.9, 0.9, 0.95],
      pointed: true,
      seg: 16,
    });
    b.geo("plaster", K.pointedGeo((VR - NH) / 19.8, 0), {
      x: 0,
      y: NH,
      z: -39.89,
      sx: 19.8,
      sy: 19.8,
      tint: [0.7, 0.66, 0.58],
    });
    b.geo("plaster", K.pointedGeo((VR - NH) / 19.8, 0), {
      x: 0,
      y: NH,
      z: -0.11,
      ry: PI,
      sx: 19.8,
      sy: 19.8,
      tint: [0.7, 0.66, 0.58],
    });
    // transverse ribs (pointed) every 6.6 m + clustered columns (on the gallery line)
    for (let z = -39.8; z <= -0.1; z += 6.6) {
      let prev = null;
      for (let i = 0; i <= 16; i++) {
        const s = i <= 8 ? -1 : 1,
          t = s < 0 ? i / 8 : (16 - i) / 8;
        const q = vaultPt(-9.9, 9.9, NH, VR - 0.1, t, s);
        const p = [q[0], q[1], z];
        if (prev)
          b.beam(
            "gold",
            prev[0],
            prev[1],
            prev[2],
            p[0],
            p[1],
            p[2],
            0.22,
            0.3,
            { tint: [0.55, 0.45, 0.28] },
          );
        prev = p;
      }
    }
    for (let z = -33.2; z <= -6; z += 6.6)
      for (const s of [-1, 1]) {
        const cx = s * 7.4;
        b.cyl("limestone", cx, 0, z, 0.42, 0.42, NH, 10, {
          tint: [0.78, 0.74, 0.66],
        });
        for (let k = 0; k < 4; k++) {
          const a = k * HP + PI / 4;
          b.cyl(
            "limestone",
            cx + Math.cos(a) * 0.38,
            0,
            z + Math.sin(a) * 0.38,
            0.13,
            0.13,
            NH,
            6,
            { tint: [0.72, 0.68, 0.6] },
          );
        }
        b.cyl("gold", cx, NH - 0.6, z, 0.55, 0.62, 0.6, 10, {
          tint: [0.6, 0.48, 0.28],
        });
        b.col(cx - 0.55, 0, z - 0.55, cx + 0.55, NH, z + 0.55, {
          tag: "column",
        });
      }
    // side galleries + organ loft (y 5.5)
    const loftFloor = (x0, z0, x1, z1) => {
      b.boxMM("wood_dark", x0, LOFT - 0.35, z0, x1, LOFT, z1, {
        tint: [0.4, 0.28, 0.18],
        faces: "nsewtb",
      });
      b.face(
        "wood",
        x0,
        LOFT + 0.002,
        z1,
        1,
        0,
        0,
        0,
        0,
        -1,
        x1 - x0,
        z1 - z0,
        { uv: "top", tint: [0.5, 0.36, 0.24] },
      );
      b.col(x0, LOFT - 0.35, z0, x1, LOFT, z1, {
        tag: "floor",
        surface: "wood",
      });
    };
    loftFloor(-10, -30, -7.4, -6);
    loftFloor(7.4, -30, 10, -6);
    loftFloor(-6, -6, 10, 0);
    loftFloor(-10, -6, -6, -4);
    for (const s of [-1, 1]) {
      K.balustrade(b, s * 7.4, -30, s * 7.4, -6, LOFT, {
        h: 1.0,
        mat: "wood_dark",
        tint: [0.42, 0.3, 0.2],
        step: 0.28,
        ped: 6.6,
      });
      K.balustrade(b, s * 7.4, -30, s * 10, -30, LOFT, {
        h: 1.0,
        mat: "wood_dark",
        tint: [0.42, 0.3, 0.2],
        step: 0.28,
      });
    }
    K.balustrade(b, -7.4, -6, 7.4, -6, LOFT, {
      h: 1.0,
      mat: "wood_dark",
      tint: [0.42, 0.3, 0.2],
      step: 0.28,
      ped: 3.7,
    });
    K.railing(b, -6, -3.4, -6, -0.1, LOFT, {
      mat: "black_iron",
      handMat: "wood_dark",
    });
    // the organ (Erben, 1868): case + ranks of pipes on the loft
    {
      b.boxMM("wood_dark", -4.8, LOFT, -1.4, 4.8, LOFT + 2.6, -0.2, {
        tint: [0.42, 0.28, 0.16],
      });
      b.col(-4.8, LOFT, -1.4, 4.8, LOFT + 2.6, -0.2, {});
      for (let k = 0; k < 29; k++) {
        const x = -4.4 + k * 0.315,
          hh =
            2.2 +
            Math.abs(Math.sin(((k - 14) / 29) * PI)) * 0.2 +
            (14 - Math.abs(k - 14)) * 0.22;
        if (r() < 0.08) continue;
        b.cyl("gold", x, LOFT + 2.6, -0.9, 0.12, 0.12, hh, 8, {
          tint: [0.72, 0.58, 0.34],
          top: false,
        });
        b.cyl(
          "paint_black",
          x,
          LOFT + 2.6 + hh * 0.18,
          -0.9 + 0.1,
          0.05,
          0.05,
          0.05,
          4,
        );
      }
      b.boxMM("wood_dark", -5.0, LOFT + 5.8, -1.6, 5.0, LOFT + 6.3, -0.1, {
        tint: [0.42, 0.28, 0.16],
      });
      b.boxMM("wood_dark", -1.1, LOFT, -2.8, 1.1, LOFT + 1.1, -1.6, {
        tint: [0.35, 0.22, 0.14],
      }); // console
      for (let k = 0; k < 3; k++)
        b.boxMM(
          "ceramic",
          -0.9,
          LOFT + 0.9 + k * 0.1,
          -2.85 + k * 0.08,
          0.9,
          LOFT + 0.95 + k * 0.1,
          -2.6 + k * 0.08,
          { tint: [0.85, 0.82, 0.72] },
        );
      K.chair(b, 0, LOFT, -3.4, PI, { mat: "wood_dark" });
      K.anchor(ctx, "organ", 0, LOFT, -3.2);
    }
    // spiral stair in the SW corner (nave floor → organ loft)
    // 24 treads over 0.92 of a turn, entered from the north at floor level; two landing treads + a
    // bridge carry the top out onto the NW loft. Colliders: a ring of iron-rail walls on the outer
    // edge (floor → rail height, so nobody steps off and falls 5 m), a radial rail closing the landing
    // above the entry, and a rail along the bridge's south edge over the well.
    {
      const sc = { x: -8, z: -2 },
        n = 24,
        R0 = 0.28,
        R1 = 1.85,
        TURN = PI * 2 * 0.92,
        RH = 1.0;
      const ang = (i) => -HP + ((i + 0.5) / n) * TURN;
      const chord = 2 * (R1 + 0.06) * Math.sin(TURN / n / 2) + 0.08;
      b.cyl("limestone", sc.x, 0, sc.z, 0.28, 0.28, LOFT + 1.2, 8, {
        tint: [0.7, 0.66, 0.58],
      });
      b.col(
        sc.x - 0.28,
        0,
        sc.z - 0.28,
        sc.x + 0.28,
        LOFT + 1.2,
        sc.z + 0.28,
        {},
      );
      const tread = (i, top, bot, colBot) => {
        const a = ang(i),
          rm = (R0 + R1) / 2,
          cx = sc.x + Math.cos(a) * rm,
          cz = sc.z + Math.sin(a) * rm,
          yaw = -a;
        b.box("limestone", cx, bot, cz, R1 - R0, top - bot, 0.52, {
          yaw,
          tint: [0.66, 0.62, 0.55],
          faces: "nsewtb",
        });
        b.ocol(cx, cz, R1 - R0, 0.5, colBot, top, yaw, {
          tag: "stairs",
          surface: "concrete",
        });
      };
      const railCol = (i, y0, y1) => {
        const a = ang(i),
          rr = R1 + 0.06;
        b.ocol(
          sc.x + Math.cos(a) * rr,
          sc.z + Math.sin(a) * rr,
          0.1,
          chord,
          y0,
          y1,
          -a,
          { tag: "rail", walkable: false },
        );
      };
      for (let i = 0; i < n; i++) {
        const top = (LOFT * (i + 1)) / n;
        tread(i, top, Math.max(0, top - 0.22), 0);
        const a = ang(i),
          ox = sc.x + Math.cos(a) * (R1 + 0.02),
          oz = sc.z + Math.sin(a) * (R1 + 0.02);
        // entry (treads 0–1) and exit (tread 23) stay open; everything between is railed
        if (i >= 2 && i <= n - 2) {
          b.beam("black_iron", ox, top, oz, ox, top + 0.95, oz, 0.03, 0.03);
          railCol(i, 0, top + RH);
        }
      }
      // two landing treads at loft height (thin: people walk under them at the entry)
      for (const i of [n, n + 1]) {
        tread(i, LOFT, LOFT - 0.22, LOFT - 0.25);
      }
      // bridge from the landing to the NW loft + the rail closing it off above the entry
      b.boxMM("wood_dark", -9.9, LOFT - 0.3, -4, -6, LOFT, -3.45, {
        tint: [0.4, 0.28, 0.18],
        faces: "nsewtb",
      });
      b.col(-9.9, LOFT - 0.3, -4, -6, LOFT, -3.45, {
        tag: "floor",
        surface: "wood",
      });
      const ea = ang(n + 1) + TURN / n / 2,
        e0 = [sc.x + Math.cos(ea) * 0.3, sc.z + Math.sin(ea) * 0.3],
        e1 = [
          sc.x + Math.cos(ea) * (R1 + 0.05),
          sc.z + Math.sin(ea) * (R1 + 0.05),
        ];
      K.railing(b, e0[0], e0[1], e1[0], e1[1], LOFT, {
        mat: "black_iron",
        handMat: "black_iron",
        step: 0.3,
        col: false,
      });
      b.ocol(
        (e0[0] + e1[0]) / 2,
        (e0[1] + e1[1]) / 2,
        Math.hypot(e1[0] - e0[0], e1[1] - e0[1]),
        0.1,
        LOFT - 0.25,
        LOFT + RH,
        Math.atan2(-(e1[1] - e0[1]), e1[0] - e0[0]),
        { tag: "rail", walkable: false },
      );
      K.railing(b, e1[0], -3.47, -6.05, -3.47, LOFT, {
        mat: "black_iron",
        handMat: "black_iron",
        step: 0.3,
        col: false,
      });
      b.col(e1[0], LOFT - 0.25, -3.52, -6.05, LOFT + RH, -3.42, {
        tag: "rail",
        walkable: false,
      });
      // handrail helix over the railed treads
      let prev = null;
      for (let i = 2; i <= n - 1; i++) {
        const a = -HP + (i / n) * TURN,
          p = [
            sc.x + Math.cos(a) * (R1 + 0.02),
            (LOFT * i) / n + 0.95,
            sc.z + Math.sin(a) * (R1 + 0.02),
          ];
        if (prev)
          b.beam(
            "black_iron",
            prev[0],
            prev[1],
            prev[2],
            p[0],
            p[1],
            p[2],
            0.05,
            0.04,
          );
        prev = p;
      }
      K.anchor(ctx, "spiral_top", -8.6, LOFT, -3.75);
      K.anchor(ctx, "spiral_foot", -8, 0, -4.6);
    }
    // pews (box pews, two blocks), some overturned
    for (let z = -29; z <= -8; z += 1.15)
      for (const [x0, x1] of [
        [-6.8, -1.2],
        [1.2, 6.8],
      ]) {
        if (r() < 0.12) {
          b.box("oak_panel", (x0 + x1) / 2, 0, z, x1 - x0, 0.1, 0.9, {
            yaw: (r() - 0.5) * 0.6,
            tint: [0.45, 0.32, 0.2],
          });
          continue;
        }
        const cx = (x0 + x1) / 2,
          w = x1 - x0;
        b.boxMM("oak_panel", x0, 0.42, z - 0.1, x1, 0.48, z + 0.35, {
          tint: [0.52, 0.38, 0.24],
        });
        b.boxMM("oak_panel", x0, 0, z + 0.35, x1, 1.0, z + 0.42, {
          tint: [0.5, 0.36, 0.22],
        });
        for (const e of [x0, x1])
          b.boxMM(
            "oak_panel",
            e - 0.04,
            0,
            z - 0.12,
            e + 0.04,
            1.05,
            z + 0.44,
            { tint: [0.46, 0.33, 0.2] },
          );
        b.col(x0, 0, z - 0.12, x1, 0.48, z + 0.44, {
          tag: "furniture",
          surface: "wood",
        });
        if (r() < 0.2)
          b.box(
            "cloth_red",
            cx + (r() - 0.5) * w * 0.6,
            0.48,
            z + 0.1,
            0.14,
            0.03,
            0.2,
            { tint: [0.5, 0.15, 0.1] },
          );
        void cx;
      }
    b.face("carpet", -1.2, 0.004, -8, 1, 0, 0, 0, 0, -1, 2.4, 23, {
      uv: "top",
      tint: [0.45, 0.18, 0.16],
    });
    // SANCTUARY (raised), altar, reredos, communion rail, candles
    fl("marble", -10, -40, 10, -31, SAN, [0.62, 0.58, 0.52]);
    for (let k = 0; k < 3; k++)
      b.boxMM(
        "marble",
        -6 + k * 0.0,
        0,
        -31 + k * 0.0,
        6,
        (SAN * (k + 1)) / 3,
        -30.2 + k * -0.3,
        { tint: [0.58, 0.55, 0.5] },
      );
    b.boxMM("marble", -10, 0, -31, 10, SAN, -30.2, {
      tint: [0.55, 0.52, 0.47],
      faces: "s",
    });
    b.col(-6, 0, -30.8, 6, 0.2, -30.2, { tag: "stairs" });
    b.col(-6, 0, -31.1, 6, 0.4, -30.8, { tag: "stairs" });
    K.balustrade(b, -9.6, -31.2, -1.2, -31.2, SAN, {
      h: 0.85,
      mat: "marble",
      tint: [0.72, 0.68, 0.62],
      step: 0.3,
    });
    K.balustrade(b, 1.2, -31.2, 9.6, -31.2, SAN, {
      h: 0.85,
      mat: "marble",
      tint: [0.72, 0.68, 0.62],
      step: 0.3,
    });
    b.boxMM("marble", -2.4, SAN, -37.6, 2.4, SAN + 1.05, -36.4, {
      tint: [0.78, 0.75, 0.68],
    });
    b.boxMM("marble", -2.5, SAN + 1.05, -37.7, 2.5, SAN + 1.15, -36.3, {
      tint: [0.82, 0.8, 0.74],
    });
    b.col(-2.5, SAN, -37.7, 2.5, SAN + 1.15, -36.3, {});
    b.boxMM("cloth_white", -2.3, SAN + 0.6, -36.32, 2.3, SAN + 1.16, -36.28, {
      tint: [0.75, 0.72, 0.62],
    });
    for (let k = 0; k < 6; k++) {
      const cx = -2 + k * 0.8;
      b.cyl(
        "brass",
        cx,
        SAN + 1.15,
        -37.2,
        0.07,
        0.04,
        0.35 + (k % 2) * 0.15,
        6,
        { tint: [0.6, 0.48, 0.28] },
      );
      b.cyl("wax", cx, SAN + 1.5 + (k % 2) * 0.15, -37.2, 0.03, 0.03, 0.12, 6);
      b.glow(cx, SAN + 1.7 + (k % 2) * 0.15, -37.2, [1, 0.6, 0.25], 0.4);
    }
    b.cyl("gold", 0, SAN + 1.15, -37.3, 0.1, 0.12, 0.5, 8, {
      tint: [0.7, 0.55, 0.3],
    });
    b.box("gold", 0, SAN + 1.65, -37.3, 0.06, 0.6, 0.06, {
      tint: [0.7, 0.55, 0.3],
    });
    b.box("gold", 0, SAN + 1.95, -37.3, 0.36, 0.06, 0.06, {
      tint: [0.7, 0.55, 0.3],
    });
    // gilded reredos (tall Gothic screen with five niches and pinnacles)
    b.boxMM("gold", -7, SAN, -39.95, 7, SAN + 1.6, -39.2, {
      tint: [0.55, 0.42, 0.22],
    });
    b.plate("art", 0, SAN + 6.2, -39.18, 0, 1, 12.6, 9.2, reredosArt(), {
      tint: [0.95, 0.9, 0.8],
    });
    for (let k = 0; k <= 5; k++) {
      const x = -6.3 + k * 2.52,
        h = k === 0 || k === 5 ? 9.5 : 11.5;
      b.boxMM("gold", x - 0.18, SAN + 1.6, -39.4, x + 0.18, SAN + h, -39.0, {
        tint: [0.62, 0.48, 0.26],
      });
      b.cyl("gold", x, SAN + h, -39.2, 0.28, 0.02, 1.6, 4, {
        tint: [0.66, 0.52, 0.28],
      });
    }
    b.cyl("gold", 0, SAN + 11.5, -39.2, 0.5, 0.02, 3.2, 4, {
      tint: [0.7, 0.55, 0.3],
    });
    b.light(0, SAN + 4, -35, [1, 0.72, 0.4], 1.0, 12, { box: NVB });
    b.light(0, SAN + 8, -37, [1, 0.8, 0.5], 0.5, 9, { box: NVB });
    // stained-glass lancets (glowing — additive), side walls above & below the galleries, apse trio
    for (const s of [-1, 1])
      for (let i = 0; i < 5; i++) {
        const z = -36.7 + i * 6.6,
          x = s * 9.9;
        const cell = K.stainedGlass(
          "neon",
          "in" + i + (s > 0 ? "e" : "w"),
          128,
          448,
          i * 3 + (s > 0 ? 1 : 0),
        );
        const broken = (i === 2 && s > 0) || (i === 4 && s < 0);
        if (broken)
          K.lancet(b, x, 7.4, z, -s, 0, 1.8, 5.4, {
            mat: "lamp",
            tint: [0.25, 0.28, 0.3],
            frameTint: [0.5, 0.46, 0.4],
          });
        else
          K.lancet(b, x, 7.4, z, -s, 0, 1.8, 5.4, {
            rect: cell,
            mat: "neon",
            tint: [0.85, 0.85, 0.85],
            frameTint: [0.5, 0.46, 0.4],
          });
        const col = [
          [0.8, 0.3, 0.25],
          [0.3, 0.4, 0.9],
          [0.85, 0.65, 0.25],
          [0.35, 0.7, 0.4],
          [0.6, 0.3, 0.7],
        ][(i + (s > 0 ? 2 : 0)) % 5];
        b.light(x - s * 1.5, 9, z, broken ? [0.6, 0.66, 0.75] : col, 0.55, 8, {
          box: NVB,
        });
        b.glow(x - s * 0.3, 9.8, z, broken ? [0.4, 0.45, 0.5] : col, 2.2);
        if (i < 4)
          K.lancet(b, x, 1.6, z + 3.3, -s, 0, 1.0, 2.6, {
            rect: K.stainedGlass("neon", "lo" + i + s, 96, 256, i + 20),
            mat: "neon",
            tint: [0.6, 0.6, 0.6],
            frameTint: [0.5, 0.46, 0.4],
          });
      }
    {
      const rr = K.roseWindow("neon");
      b.geo(K.atlasMat("neon", rr), new THREE.CircleGeometry(1.7, 20), {
        x: 0,
        y: 11.2,
        z: -0.12,
        ry: PI,
        uv: "rect",
        rect: rr,
        tint: [0.9, 0.9, 0.9],
      });
    }
    b.geo("limestone", new THREE.TorusGeometry(1.8, 0.14, 5, 20), {
      x: 0,
      y: 11.2,
      z: -0.15,
      tint: [0.6, 0.56, 0.5],
    });
    b.light(0, 11, -2.5, [0.7, 0.5, 0.8], 0.5, 8, { box: NVB });
    // chandeliers (iron rings with candles)
    for (const z of [-26, -16, -8]) {
      const cy = 9;
      b.pipe("black_iron", 0, cy, z, 0, VR - 0.5, z, 0.02, 3);
      b.geo("black_iron", new THREE.TorusGeometry(1.2, 0.04, 4, 16), {
        x: 0,
        y: cy,
        z,
        rx: HP,
      });
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * PI * 2;
        b.cyl(
          "wax",
          Math.cos(a) * 1.2,
          cy + 0.04,
          z + Math.sin(a) * 1.2,
          0.03,
          0.03,
          0.1,
          5,
        );
        if (k % 3)
          b.glow(
            Math.cos(a) * 1.2,
            cy + 0.22,
            z + Math.sin(a) * 1.2,
            CANDLE,
            0.35,
          );
      }
      b.light(0, cy - 0.3, z, CANDLE, 0.7, 9, { box: NVB });
    }
    // votive stand + Pietà niche on the east aisle
    b.boxMM("black_iron", 8.6, 0, -22.5, 9.6, 0.9, -20.5, {
      tint: [0.2, 0.19, 0.18],
    });
    for (let k = 0; k < 18; k++) {
      const cx = 8.75 + (k % 3) * 0.3,
        cz = -22.35 + Math.floor(k / 3) * 0.3;
      b.cyl("enamel_red", cx, 0.9, cz, 0.05, 0.05, 0.1, 6, {
        tint: [0.6, 0.12, 0.1],
      });
      if (k % 4 === 0) b.glow(cx, 1.05, cz, CANDLE, 0.3);
    }
    b.light(9, 1.4, -21.5, CANDLE, 0.45, 4, { box: NVB });
    b.col(8.6, 0, -22.5, 9.6, 0.9, -20.5, {});
    // collapsed bay (east, where the roof is holed): rubble, fallen rib, rain light
    K.rubble(b, 5.5, 0, -17, 2.6, 1.6, { seed: 2011 });
    K.rubble(b, 3.4, 0, -19.5, 1.6, 1.0, { seed: 2012 });
    b.beam("gold", 2, 0.3, -21, 7, 2.2, -15.6, 0.3, 0.3, {
      tint: [0.4, 0.32, 0.2],
    });
    b.light(5, 12, -18, [0.6, 0.66, 0.72], 0.6, 10, { box: NVB, wrap: 0.6 });
    for (let k = 0; k < 10; k++)
      b.hplate(
        "decal",
        -8 + r() * 16,
        0.012 + k * 0.001,
        -30 + r() * 28,
        1.2 + r() * 1.5,
        1.2 + r() * 1.5,
        r() * 6,
        K.decal(k % 4 ? "grime" : "blood", k + 130),
      );
    K.litter(b, -9.5, -30, 9.5, -0.5, 0, 24, 131);

    // ================= BAPTISTRY (west) =================
    const BPB = [-18.1, -0.3, -10.1, -9.9, 4.9, 0.1];
    K.room(b, ctx, {
      x0: -18,
      z0: -10,
      x1: -10,
      z1: 0,
      y: 0,
      h: 4.8,
      floor: "marble",
      fc: [0.46, 0.43, 0.4],
      wall: "plaster",
      wc: [0.72, 0.68, 0.6],
      ceil: "plaster",
      cc: [0.5, 0.48, 0.44],
      noFloor: true,
      cornice: true,
    });
    fl("marble", -14, -10, -10, 0, 0, [0.46, 0.43, 0.4]);
    fl("marble", -18, -2, -14, 0, 0, [0.46, 0.43, 0.4]);
    K.railing(b, -14, -10, -14, -2, 0, {
      mat: "black_iron",
      handMat: "black_iron",
    });
    b.cyl("marble", -12, 0, -6.5, 0.7, 0.45, 0.9, 8, {
      tint: [0.72, 0.7, 0.64],
    });
    b.cyl("marble", -12, 0.9, -6.5, 0.85, 0.8, 0.25, 8, {
      tint: [0.78, 0.76, 0.7],
    });
    b.col(-12.8, 0, -7.3, -11.2, 1.15, -5.7, {});
    b.cyl("glass", -12, 1.1, -6.5, 0.7, 0.7, 0.02, 12, {
      tint: [0.35, 0.8, 0.3],
    });
    b.glow(-12, 1.2, -6.5, [0.4, 1, 0.3], 0.8); // the font's water glows…
    b.light(-12, 1.6, -6.5, RAD, 0.5, 4, { box: BPB });
    b.plate(
      "art",
      -17.86,
      2.6,
      -5,
      1,
      0,
      1.6,
      1.0,
      K.signCell(
        "pc_sp_bapt",
        "BAPTISTRY\nCATACOMBS BELOW — CLOSED",
        256,
        160,
        { bg: "#2a2620", fg: "#d8c088", font: "Georgia, serif" },
      ),
    );
    K.lamp(b, -12, 3.6, -3, "lantern", CANDLE, 0.4, 5, {
      ceil: 4.8,
      size: 0.2,
      lightOpts: { box: BPB },
    });

    // ================= SACRISTY (east, y 0.6) + stair down =================
    const SCB = [9.9, SAN - 0.3, -46.1, 18.1, SAN + 4.1, -29.9];
    K.room(b, ctx, {
      x0: 10,
      z0: -46,
      x1: 18,
      z1: -30,
      y: SAN,
      h: 4.0,
      floor: "wood",
      fc: [0.45, 0.34, 0.24],
      wall: "oak_panel",
      wc: [0.62, 0.46, 0.3],
      ceil: "plaster",
      cc: [0.55, 0.52, 0.46],
      noFloor: true,
      surface: "wood",
    });
    fl("wood", 10, -46, 15, -30, SAN, [0.45, 0.34, 0.24], "wood");
    fl("wood", 15, -34, 18, -30, SAN, [0.45, 0.34, 0.24], "wood");
    fl("wood", 15, -46, 18, -44, SAN, [0.45, 0.34, 0.24], "wood");
    K.railing(b, 15, -44, 18, -44, SAN, {
      mat: "black_iron",
      handMat: "black_iron",
    });
    K.railing(b, 15, -34, 15, -44, SAN, {
      mat: "black_iron",
      handMat: "black_iron",
    });
    K.stairs(b, 15, -44, 18, -34, BY, SAN, "+z", {
      mat: "crypt_brick",
      tint: [0.6, 0.5, 0.42],
      nosing: "limestone",
    });
    K.segWall(b, 15, -44, 15, -34, BY, SAN, 1, {
      mat: "crypt_brick",
      tint: [0.55, 0.48, 0.4],
      trim: false,
    });
    K.segWall(b, 18, -34, 18, -44, BY, SAN, 1, {
      mat: "crypt_brick",
      tint: [0.55, 0.48, 0.4],
      trim: false,
    });
    // vestment wardrobes on the west wall — the second one used to stand across the sanctuary door (z −35.8..−34.2)
    for (const [wz0, wz1] of [
      [-44, -40.4],
      [-39.8, -36.6],
    ]) {
      b.boxMM("oak_panel", 10.2, SAN, wz0, 11, SAN + 2.4, wz1, {
        tint: [0.5, 0.36, 0.22],
      });
      b.col(10.2, SAN, wz0, 11, SAN + 2.4, wz1, {});
    }
    b.plate(
      "art",
      17.86,
      SAN + 2.2,
      -38,
      -1,
      0,
      1.6,
      0.4,
      K.signCell("pc_sp_crypt", "CRYPT ↓", 256, 64, {
        bg: "#2a2620",
        fg: "#d8c088",
        font: "Georgia, serif",
      }),
    );
    K.lamp(b, 13, SAN + 3, -36, "bulb", CANDLE, 0.45, 6, {
      ceil: SAN + 4,
      lightOpts: { box: SCB },
    });
    K.skel(ctx, 12.4, SAN, -32.2, 2.3, "curled");

    // ================= CATACOMBS (y −5) =================
    const CB = [-30, BY - 0.3, -60, 22, BY + 4.0, -1];
    const tunnel = (x0, z0, x1, z1, alongZ, o) => {
      o = o || {};
      const h = o.h || 2.6,
        vh = o.vh || 1.2; // round 2: 2.6 m to the springing (was 2.2) — room for tall Maniacs
      K.room(b, ctx, {
        x0,
        z0,
        x1,
        z1,
        y: BY,
        h,
        floor: "rubble",
        fc: [0.42, 0.38, 0.34],
        wall: "crypt_brick",
        wc: [0.8, 0.7, 0.62],
        noCeil: true,
        trim: false,
        open: o.open || {},
        surface: "rubble",
      });
      if (alongZ) vaultZ(b, x0, x1, BY + h, z0, z1, vh, [0.7, 0.62, 0.55]);
      else vaultX(b, z0, z1, BY + h, x0, x1, vh, [0.7, 0.62, 0.55]);
    };
    // landing under the sacristy stair
    K.gap(ctx, 16.5, -44, 3.0, BY, 2.6);
    K.gap(ctx, 12, -48, 3.6, BY, 2.4);
    tunnel(12, -50, 20, -44, false, { h: 2.6, vh: 1.2, open: {} });
    // the long gallery (x −18..12, z −50..−46)
    const gaps = [
      [-11, "n"],
      [-1, "n"],
      [8, "n"],
      [-6, "s"],
      [4, "s"],
    ];
    for (const [x, side] of gaps)
      K.gap(ctx, x, side === "n" ? -50 : -46, 1.4, BY, 2.0);
    K.gap(ctx, -16, -46, 3.6, BY, 2.4);
    tunnel(-18, -50, 12, -46, false, { open: { e: true } });
    // loculi (burial niches) along the long gallery's walls
    for (let x = -17; x < 11; x += 1.6)
      for (const [z, n] of [
        [-49.9, 1],
        [-46.1, -1],
      ]) {
        if (
          gaps.some(
            ([gx, sd]) =>
              Math.abs(gx - (x + 0.7)) < 1.5 && (sd === "n") === n > 0,
          )
        )
          continue;
        if (Math.abs(x + 0.7 + 16) < 2.6 && n < 0) continue;
        for (let row = 0; row < 2; row++) {
          const y = BY + 0.35 + row * 0.85;
          b.boxMM(
            "paint_black",
            x + 0.1,
            y,
            z + (n > 0 ? 0.01 : -0.02),
            x + 1.3,
            y + 0.62,
            z + (n > 0 ? 0.02 : -0.01),
            { tint: [0.05, 0.04, 0.04] },
          );
          if (r() < 0.6)
            b.plate(
              "art",
              x + 0.7,
              y + 0.31,
              z + n * 0.03,
              0,
              n,
              1.0,
              0.5,
              plaque((x * 3 + row) | 0),
              { tint: [0.62, 0.6, 0.54] },
            );
          else if (r() < 0.5)
            b.geo("bone", K.sphereGeo(), {
              x: x + 0.7,
              y: y + 0.12,
              z: z + n * 0.25,
              s: 0.1,
              tint: [0.8, 0.76, 0.64],
            });
        }
      }
    for (const x of [-15, -9, -3, 3, 9]) {
      b.cyl("wax", x, BY + 1.5, -49.7, 0.04, 0.04, 0.12, 5);
      b.box("black_iron", x, BY + 1.45, -49.8, 0.2, 0.05, 0.2);
      b.glow(x, BY + 1.7, -49.6, CANDLE, 0.45);
      b.light(x, BY + 1.8, -48, CANDLE, 0.55, 6, { box: CB });
    }
    // family vaults (north side): Kiernan (x −14..−8), Dolan (x 5..11); south side Byrne (x −9..−3), O'Connell (x 1..7)
    const vaultRoom = (x0, z0, x1, z1, name, seed) => {
      K.room(b, ctx, {
        x0,
        z0,
        x1,
        z1,
        y: BY,
        h: 2.4,
        floor: "marble",
        fc: [0.4, 0.38, 0.36],
        wall: "crypt_brick",
        wc: [0.72, 0.64, 0.56],
        ceil: "crypt_brick",
        cc: [0.5, 0.44, 0.4],
        trim: false,
      });
      const cx = (x0 + x1) / 2,
        cz = (z0 + z1) / 2;
      b.boxMM(
        "marble",
        cx - 1.08,
        BY,
        cz - 0.62,
        cx + 1.08,
        BY + 0.14,
        cz + 0.62,
        { tint: [0.3, 0.29, 0.27] },
      );
      b.boxMM(
        "marble",
        cx - 1.0,
        BY + 0.14,
        cz - 0.55,
        cx + 1.0,
        BY + 0.9,
        cz + 0.55,
        { tint: [0.58, 0.56, 0.52] },
      );
      for (const px of [cx - 1.0, cx + 1.0])
        for (const pz of [cz - 0.55, cz + 0.55])
          b.box("marble", px, BY + 0.14, pz, 0.14, 0.76, 0.14, {
            tint: [0.5, 0.48, 0.44],
          }); // corner colonnettes
      b.boxMM(
        "marble",
        cx - 1.1,
        BY + 0.9,
        cz - 0.62,
        cx + 1.1,
        BY + 1.0,
        cz + 0.62,
        { tint: [0.66, 0.64, 0.58] },
      );
      b.quadN(
        "marble",
        [cx - 1.0, BY + 1.0, cz - 0.52],
        [cx + 1.0, BY + 1.0, cz - 0.52],
        [cx + 0.9, BY + 1.22, cz],
        [cx - 0.9, BY + 1.22, cz],
        [0, 1, -1],
        { tint: [0.6, 0.58, 0.53] },
      ); // gabled lid
      b.quadN(
        "marble",
        [cx - 1.0, BY + 1.0, cz + 0.52],
        [cx + 1.0, BY + 1.0, cz + 0.52],
        [cx + 0.9, BY + 1.22, cz],
        [cx - 0.9, BY + 1.22, cz],
        [0, 1, 1],
        { tint: [0.64, 0.62, 0.56] },
      );
      b.quadN(
        "marble",
        [cx - 1.0, BY + 1.0, cz - 0.52],
        [cx - 1.0, BY + 1.0, cz + 0.52],
        [cx - 0.9, BY + 1.22, cz],
        [cx - 0.9, BY + 1.22, cz],
        [-1, 0, 0],
        { tint: [0.56, 0.54, 0.5] },
      );
      b.quadN(
        "marble",
        [cx + 1.0, BY + 1.0, cz - 0.52],
        [cx + 1.0, BY + 1.0, cz + 0.52],
        [cx + 0.9, BY + 1.22, cz],
        [cx + 0.9, BY + 1.22, cz],
        [1, 0, 0],
        { tint: [0.56, 0.54, 0.5] },
      );
      b.box("marble", cx, BY + 1.22, cz, 0.06, 0.18, 0.06, {
        tint: [0.6, 0.58, 0.52],
      });
      b.box("marble", cx, BY + 1.32, cz, 0.24, 0.05, 0.05, {
        tint: [0.6, 0.58, 0.52],
      }); // small cross
      b.col(cx - 1.1, BY, cz - 0.62, cx + 1.1, BY + 1.0, cz + 0.62, {});
      b.plate("art", cx, BY + 0.5, cz + 0.56, 0, 1, 1.4, 0.6, plaque(seed), {
        tint: [0.8, 0.78, 0.72],
      });
      for (let k = 0; k < 3; k++) {
        const px = x0 + 0.5 + (k * (x1 - x0 - 1)) / 2,
          pz = z0 + 0.35;
        b.box("wood_rotten", px, BY, pz, 0.6, 0.45, 1.8, {
          yaw: HP,
          tint: [0.45, 0.36, 0.28],
        });
      }
      b.light(cx, BY + 1.8, cz, CRYPT, 0.35, 4, {
        box: [x0, BY - 0.3, z0, x1, BY + 2.5, z1],
      });
      void name;
    };
    vaultRoom(-14, -55, -8, -50, "Kiernan", 0);
    vaultRoom(5, -55, 11, -50, "Dolan", 2);
    vaultRoom(-9, -46, -3, -41, "Byrne", 1);
    vaultRoom(1, -46, 7, -41, "OConnell", 3);
    K.skel(ctx, -11.8, BY, -52.2, 0.4, "curled");
    K.skel(ctx, 4, BY, -43, 2.1, "lying");
    // BISHOPS' CRYPT (reward room, north of the gallery, behind the grille) x −4..2, z −58..−50
    // Gothic Revival burial chapel: blind lancet arcade, two gisant tomb chests (Bishops Connolly & Dubois)
    // with mitred effigies, memorial tablets, floor ledger stones, a red sanctuary lamp over the reliquary altar.
    const BCB = [-4.1, BY - 0.3, -58.1, 2.1, BY + 3.1, -49.9];
    const STONE = [0.5, 0.47, 0.42],
      EFF = [0.66, 0.63, 0.57];
    K.room(b, ctx, {
      x0: -4,
      z0: -58,
      x1: 2,
      z1: -50,
      y: BY,
      h: 3.0,
      floor: "marble",
      fc: [0.42, 0.4, 0.37],
      wall: "limestone",
      wc: STONE,
      ceil: "coffer",
      cc: [0.36, 0.33, 0.3],
      trim: false,
      cornice: true,
    });
    // blind arcade down both long walls: pilasters + pointed blind lancets (recessed darker panels)
    for (const [wx, nx] of [
      [-4, 1],
      [2, -1],
    ]) {
      for (const z of [-57.2, -55.2, -53.2, -51.2])
        b.boxMM(
          "limestone",
          wx + nx * 0.1,
          BY,
          z - 0.15,
          wx + nx * 0.3,
          BY + 2.7,
          z + 0.15,
          { tint: [0.56, 0.53, 0.47] },
        );
      for (const z of [-56.2, -54.2, -52.2])
        K.lancet(b, wx + nx * 0.1, BY + 0.55, z, nx, 0, 1.3, 2.0, {
          mat: "limestone",
          tint: [0.3, 0.28, 0.25],
          frame: "limestone",
          frameTint: [0.58, 0.55, 0.49],
          sill: false,
        });
      b.boxMM(
        "limestone",
        wx + nx * 0.1,
        BY,
        -57.9,
        wx + nx * 0.34,
        BY + 0.4,
        -50.1,
        { tint: [0.4, 0.38, 0.34] },
      ); // plinth course
    }
    // memorial tablets inside the blind arches
    const tablet = (key, txt) =>
      K.signCell(key, txt, 256, 320, {
        bg: "#d6d0bc",
        fg: "#2e2a22",
        font: "Georgia, serif",
        border: "#8a806a",
        weight: "normal",
      });
    [
      [
        -4,
        1,
        -56.2,
        "pc_sp_tab1",
        "D.O.M.\n\nHIC IACET\nRMUS. JOANNES\nCONNOLLY O.P.\nEPISCOPUS II\nNOVI EBORACI\nOBIIT\nMDCCCXXV",
      ],
      [
        -4,
        1,
        -52.2,
        "pc_sp_tab2",
        "PRAY FOR\nTHE SOULS OF\nTHE FAITHFUL\nWHO SHELTERED\nIN THESE VAULTS\nMAR. V\nMCMLXVII",
      ],
      [
        2,
        -1,
        -56.2,
        "pc_sp_tab3",
        "D.O.M.\n\nHIC IACET\nRMUS. JOANNES\nDUBOIS S.S.\nEPISCOPUS III\nNOVI EBORACI\nOBIIT\nMDCCCXLII",
      ],
      [
        2,
        -1,
        -52.2,
        "pc_sp_tab4",
        "MEMENTO\nHOMO\nQUIA PULVIS ES\nET IN PULVEREM\nREVERTERIS",
      ],
    ].forEach(([wx, nx, z, key, txt]) => {
      b.plate(
        "art",
        wx + nx * 0.2,
        BY + 1.5,
        z,
        nx,
        0,
        0.72,
        0.9,
        tablet(key, txt),
        { tint: [0.78, 0.76, 0.7] },
      );
    });
    // tomb chest with a recumbent mitred bishop (head north, toward the altar)
    const quatrefoil = K.paint(
      "art",
      "pc_sp_quatre",
      128,
      104,
      function (x, X, Y, W, H) {
        x.fillStyle = "#b8b0a0";
        x.fillRect(X, Y, W, H);
        x.strokeStyle = "#6e665a";
        x.lineWidth = 5;
        x.strokeRect(X + 5, Y + 5, W - 10, H - 10);
        const cx = X + W / 2,
          cy = Y + H / 2,
          rr = H * 0.17;
        x.fillStyle = "#7a7266";
        for (const [dx, dy] of [
          [0, -1],
          [1, 0],
          [0, 1],
          [-1, 0],
        ]) {
          x.beginPath();
          x.arc(cx + dx * rr, cy + dy * rr, rr * 1.05, 0, 6.3);
          x.fill();
        }
        x.fillStyle = "#a49c8c";
        for (const [dx, dy] of [
          [0, -1],
          [1, 0],
          [0, 1],
          [-1, 0],
        ]) {
          x.beginPath();
          x.arc(cx + dx * rr, cy + dy * rr, rr * 0.7, 0, 6.3);
          x.fill();
        }
        x.fillStyle = "#8a8274";
        x.beginPath();
        x.arc(cx, cy, rr * 0.55, 0, 6.3);
        x.fill();
        x.fillStyle = "#c8c0ae";
        x.fillRect(cx - 2, cy - rr * 0.45, 4, rr * 0.9);
        x.fillRect(cx - rr * 0.3, cy - rr * 0.15, rr * 0.6, 4);
        K.stains(x, X, Y, W, H, 5, 7713, 0.35, [40, 34, 26]);
      },
    );
    const gisant = (x, z, name, seed) => {
      const Y = BY,
        rr = K.rng("gisant" + seed);
      b.boxMM("marble", x - 0.66, Y, z - 1.26, x + 0.66, Y + 0.16, z + 1.26, {
        tint: [0.28, 0.27, 0.25],
      }); // plinth
      b.boxMM(
        "marble",
        x - 0.52,
        Y + 0.16,
        z - 1.1,
        x + 0.52,
        Y + 0.84,
        z + 1.1,
        { tint: [0.56, 0.53, 0.48] },
      ); // chest
      b.boxMM(
        "marble",
        x - 0.56,
        Y + 0.16,
        z - 1.14,
        x + 0.56,
        Y + 0.26,
        z + 1.14,
        { tint: [0.44, 0.42, 0.38] },
      ); // base moulding
      for (const s of [-1, 1])
        for (let k = 0; k < 3; k++)
          b.plate(
            "art",
            x + s * 0.525,
            Y + 0.54,
            z - 0.7 + k * 0.7,
            s,
            0,
            0.56,
            0.46,
            quatrefoil,
            { tint: [0.72, 0.7, 0.64] },
          );
      b.plate(
        "art",
        x,
        Y + 0.54,
        z + 1.105,
        0,
        1,
        0.82,
        0.5,
        K.signCell("pc_sp_gis_" + seed, name, 256, 150, {
          bg: "#b8b0a0",
          fg: "#2e2a22",
          font: "Georgia, serif",
          weight: "normal",
        }),
        { tint: [0.74, 0.72, 0.66] },
      );
      b.plate("art", x, Y + 0.54, z - 1.105, 0, -1, 0.56, 0.46, quatrefoil, {
        tint: [0.72, 0.7, 0.64],
      });
      b.boxMM(
        "marble",
        x - 0.6,
        Y + 0.84,
        z - 1.18,
        x + 0.6,
        Y + 0.94,
        z + 1.18,
        { tint: [0.6, 0.57, 0.52] },
      ); // lid
      b.boxMM(
        "marble",
        x - 0.56,
        Y + 0.94,
        z - 1.14,
        x + 0.56,
        Y + 0.97,
        z + 1.14,
        { tint: [0.52, 0.5, 0.45] },
      ); // lid chamfer step
      const T = Y + 0.97;
      b.boxMM("marble", x - 0.27, T, z - 1.05, x + 0.27, T + 0.1, z - 0.7, {
        tint: [0.6, 0.57, 0.5],
      }); // cushion
      b.geo("marble", K.sphereGeo(), {
        x,
        y: T + 0.21,
        z: z - 0.84,
        sx: 0.13,
        sy: 0.14,
        sz: 0.15,
        tint: EFF,
      }); // head
      b.geo("marble", new THREE.TorusGeometry(0.13, 0.04, 5, 10), {
        x,
        y: T + 0.17,
        z: z - 0.68,
        rx: -0.3,
        sx: 1.3,
        tint: [0.72, 0.69, 0.62],
      }); // amice collar
      for (const s2 of [-1, 1])
        b.geo("marble", K.sphereGeo(), {
          x: x + s2 * 0.2,
          y: T + 0.14,
          z: z - 0.6,
          s: 0.1,
          sy: 0.08,
          tint: EFF,
        }); // shoulders
      b.geo("marble", new THREE.ConeGeometry(0.12, 0.3, 4, 1), {
        x,
        y: T + 0.22,
        z: z - 1.02,
        rx: -HP,
        ry: PI / 4,
        sz: 0.55,
        tint: EFF,
      }); // mitre
      b.geo("marble", new THREE.CylinderGeometry(0.23, 0.2, 1.5, 8, 1), {
        x,
        y: T + 0.12,
        z: z + 0.05,
        rx: HP,
        sx: 1,
        sz: 0.55,
        tint: EFF,
      }); // body under the chasuble
      b.geo("marble", new THREE.CylinderGeometry(0.26, 0.22, 0.8, 8, 1), {
        x,
        y: T + 0.17,
        z: z - 0.35,
        rx: HP,
        sz: 0.5,
        tint: [0.7, 0.67, 0.6],
      }); // chasuble over the chest
      b.box("marble", x, T + 0.3, z - 0.42, 0.09, 0.12, 0.08, { tint: EFF }); // hands joined in prayer
      for (const s of [-1, 1])
        b.box("marble", x + s * 0.08, T + 0.02, z + 0.88, 0.09, 0.2, 0.11, {
          tint: EFF,
        }); // feet
      b.boxMM("marble", x - 0.24, T, z + 0.94, x + 0.24, T + 0.14, z + 1.12, {
        tint: [0.5, 0.48, 0.43],
      }); // footrest (lion worn to a lump)
      // crozier along his left side, crook by the head
      b.pipe(
        "marble",
        x + 0.3,
        T + 0.1,
        z + 0.85,
        x + 0.3,
        T + 0.1,
        z - 0.9,
        0.022,
        5,
        { tint: EFF },
      );
      b.geo("marble", new THREE.TorusGeometry(0.07, 0.02, 4, 10, PI * 1.4), {
        x: x + 0.3,
        y: T + 0.1,
        z: z - 0.97,
        rx: -HP,
        tint: EFF,
      });
      // damage: a chipped nose, soot, a dropped candle stub
      if (rr() < 0.7)
        b.hplate(
          "decal",
          x + 0.4,
          Y + 0.012,
          z + 1.5,
          0.9,
          0.9,
          rr() * 6,
          K.decal("grime", seed + 40),
        );
      b.col(x - 0.66, Y, z - 1.26, x + 0.66, Y + 1.2, z + 1.26, {});
    };
    gisant(-2.75, -54.2, "JOANNES CONNOLLY\nEPISCOPVS", 1);
    gisant(0.75, -54.2, "JOANNES DVBOIS\nEPISCOPVS", 2);
    // floor ledger stones in the aisle
    [
      [-1, -52.2, "pc_sp_led1", "R.I.P.\nREV. P. KELLY\n1851"],
      [-1, -56.3, "pc_sp_led2", "ORATE\nPRO NOBIS"],
    ].forEach(([x, z, key, t]) =>
      b.hplate(
        "art",
        x,
        BY + 0.012,
        z,
        0.9,
        1.4,
        0,
        K.signCell(key, t, 160, 256, {
          bg: "#5a5650",
          fg: "#b8b2a2",
          font: "Georgia, serif",
          border: "#3a3632",
          weight: "normal",
        }),
        { tint: [0.8, 0.78, 0.72] },
      ),
    );
    // reliquary altar against the north wall: stepped, with a carved frontal and a gradine for candles
    b.boxMM("marble", -2.1, BY, -57.95, 0.9, BY + 0.15, -56.6, {
      tint: [0.3, 0.29, 0.27],
    });
    b.col(-2.1, BY, -57.95, 0.9, BY + 0.15, -56.6, {
      tag: "floor",
      surface: "concrete",
    });
    b.boxMM("marble", -1.6, BY + 0.15, -57.9, 0.4, BY + 1.1, -57, {
      tint: [0.64, 0.62, 0.56],
    });
    b.col(-1.6, BY, -57.9, 0.4, BY + 1.1, -57, {});
    b.plate(
      "art",
      -0.6,
      BY + 0.62,
      -56.985,
      0,
      1,
      1.1,
      0.72,
      K.signCell("pc_sp_frontal", "✠\nAGNUS DEI", 200, 130, {
        bg: "#b8b0a0",
        fg: "#5a4a2a",
        font: "Georgia, serif",
        border: "#8a7a5a",
      }),
      { tint: [0.8, 0.76, 0.66] },
    );
    b.boxMM("marble", -1.6, BY + 1.1, -57.95, 0.4, BY + 1.36, -57.6, {
      tint: [0.58, 0.56, 0.5],
    }); // gradine
    b.boxMM("cloth_red", -1.5, BY + 1.1, -57.6, 0.3, BY + 1.12, -57.1, {
      tint: [0.5, 0.12, 0.1],
    });
    b.plate(
      "art",
      -1,
      BY + 2.25,
      -57.88,
      0,
      1,
      2.2,
      0.62,
      K.signCell("pc_sp_bish", "HIC IACENT EPISCOPI\nNOVI EBORACI", 384, 110, {
        bg: "#d8d2c0",
        fg: "#3a342a",
        font: "Georgia, serif",
      }),
    );
    // brass altar crucifix + candlesticks on the gradine
    b.box("brass", -0.6, BY + 1.36, -57.78, 0.03, 0.62, 0.03, {
      tint: [0.6, 0.46, 0.24],
    });
    b.box("brass", -0.6, BY + 1.8, -57.78, 0.26, 0.03, 0.03, {
      tint: [0.6, 0.46, 0.24],
    });
    for (let k = 0; k < 4; k++) {
      const cx = -1.4 + k * 0.5 + (k > 1 ? 0.3 : 0);
      b.cyl("brass", cx, BY + 1.36, -57.78, 0.05, 0.02, 0.24, 6, {
        tint: [0.55, 0.42, 0.22],
      });
      b.cyl("wax", cx, BY + 1.6, -57.78, 0.025, 0.025, 0.1 + (k % 2) * 0.08, 5);
      b.glow(cx, BY + 1.78 + (k % 2) * 0.08, -57.78, CANDLE, 0.3);
    }
    b.burn(-0.6, BY + 2.9, -57.8, 1.4, 0.5);
    // sanctuary lamp: red glass on three brass chains over the aisle — still burning (glowing-one light, not oil)
    for (let k = 0; k < 3; k++) {
      const a = (k * PI * 2) / 3;
      b.beam(
        "brass",
        -1,
        BY + 3.0,
        -55.3,
        -1 + Math.cos(a) * 0.12,
        BY + 2.25,
        -55.3 + Math.sin(a) * 0.12,
        0.012,
        0.012,
        { tint: [0.5, 0.38, 0.2] },
      );
    }
    b.cyl("brass", -1, BY + 2.1, -55.3, 0.05, 0.14, 0.15, 10, {
      tint: [0.55, 0.42, 0.22],
    });
    b.geo("lamp", K.sphereGeo(), {
      x: -1,
      y: BY + 2.2,
      z: -55.3,
      sx: 0.1,
      sy: 0.08,
      sz: 0.1,
      tint: [1, 0.16, 0.1],
    });
    b.glow(-1, BY + 2.2, -55.3, [1, 0.18, 0.1], 1.1);
    b.light(-1, BY + 2.0, -55.3, [1, 0.3, 0.2], 0.45, 4.5, { box: BCB });
    b.light(-1, BY + 2.6, -53, [0.7, 0.74, 0.86], 0.32, 6, { box: BCB });
    b.light(-0.6, BY + 1.6, -57.1, CANDLE, 0.55, 3.2, { box: BCB });
    K.litter(b, -3.8, -57.8, 1.8, -50.4, BY, 8, 3317);
    K.gate(ctx, {
      id: "crypt",
      flag: "sp_crypt_open",
      label: "Bishops' Crypt Grille",
      x: -1,
      z: -50,
      w: 1.4,
      axis: "x",
      y0: BY,
      h: 2.0,
      lock: {
        id: "pc_lk_sp_crypt",
        key: "pc_sp_sexton_key",
        hint: "The Sexton — the big Maniac in the ossuary — still carries the crypt key.",
      },
      style: "grille",
    });
    // OLD TUNNEL south (x −18..−14, z −46..−12) with niches, a collapse, puddles
    K.gap(ctx, -18, -26, 1.6, BY, 2.3);
    tunnel(-18, -46, -14, -12, true, { open: { s: true } });
    for (let z = -44.5; z < -13; z += 1.6)
      for (const [x, n] of [
        [-17.9, 1],
        [-14.1, -1],
      ]) {
        if (Math.abs(z + 26) < 1.4 && n > 0) continue;
        const y = BY + 0.4 + (((z * 7) | 0) % 2) * 0.8;
        b.boxMM(
          "paint_black",
          x + (n > 0 ? 0.01 : -0.02),
          y,
          z + 0.1,
          x + (n > 0 ? 0.02 : -0.01),
          y + 0.6,
          z + 1.3,
          { tint: [0.05, 0.04, 0.04] },
        );
        if (r() < 0.45)
          b.geo("bone", K.sphereGeo(), {
            x: x + n * 0.25,
            y: y + 0.12,
            z: z + 0.7,
            s: 0.1,
            tint: [0.8, 0.76, 0.64],
          });
      }
    K.rubble(b, -15.2, BY, -33, 1.4, 1.2, { seed: 2021 });
    for (let k = 0; k < 6; k++)
      b.hplate(
        "decal",
        -17.5 + r() * 3,
        BY + 0.012 + k * 0.001,
        -45 + r() * 32,
        1.2,
        1.2,
        r() * 6,
        K.decal(k % 2 ? "puddle" : "grime", k + 140),
      );
    for (const z of [-42, -36, -30, -24, -18, -13]) {
      b.box("black_iron", -14.15, BY + 1.5, z, 0.08, 0.2, 0.2);
      b.glow(-14.3, BY + 1.75, z, CANDLE, 0.4);
      b.light(-15.5, BY + 1.7, z, CANDLE, 0.4, 5, { box: CB });
    }
    // OSSUARY (x −28..−18, z −31..−21): the Sexton's lair
    const OSB = [-28.1, BY - 0.3, -31.1, -17.9, BY + 3.7, -20.9];
    K.room(b, ctx, {
      x0: -28,
      z0: -31,
      x1: -18,
      z1: -21,
      y: BY,
      h: 2.6,
      floor: "rubble",
      fc: [0.36, 0.34, 0.3],
      wall: "crypt_brick",
      wc: [0.62, 0.56, 0.5],
      noCeil: true,
      trim: false,
      surface: "rubble",
    });
    vaultX(b, -31, -21, BY + 2.6, -28, -18, 1.1, [0.6, 0.54, 0.48]);
    for (let x = -27.5; x < -18.5; x += 0.5)
      for (const z of [-30.8, -21.2])
        for (let y = BY + 0.1; y < BY + 2.4; y += 0.28) {
          if (r() < 0.2) continue;
          b.geo("bone", K.sphereGeo(), {
            x: x + (r() - 0.5) * 0.1,
            y: y + 0.12,
            z: z + (z < -25 ? 0.12 : -0.12),
            sx: 0.13,
            sy: 0.12,
            sz: 0.12,
            tint: [0.78 + r() * 0.1, 0.74, 0.6],
          });
        }
    for (let z = -30; z < -21.5; z += 0.5)
      for (let y = BY + 0.1; y < BY + 2.3; y += 0.3) {
        if (r() < 0.35) continue;
        b.geo("bone", K.sphereGeo(), {
          x: -27.85,
          y: y + 0.12,
          z: z + (r() - 0.5) * 0.1,
          sx: 0.12,
          sy: 0.12,
          sz: 0.13,
          tint: [0.78, 0.74, 0.6],
        });
      }
    for (const [x, z] of [
      [-24, -26],
      [-21, -28.5],
    ])
      K.rubble(b, x, BY, z, 1.3, 0.8, {
        seed: (x * 7) | 0,
        mat: "bone",
        tint: [0.8, 0.75, 0.62],
        n: 5,
        col: false,
      });
    b.hplate("decal", -23, BY + 0.02, -25.5, 4.5, 4.5, 0.3, K.decal("rad", 3));
    b.light(-23, BY + 1.2, -25.5, RAD, 1.0, 8, { box: OSB });
    b.glow(-23, BY + 0.4, -25.5, [0.4, 1, 0.3], 2.4);
    b.plate(
      "decal",
      -27.86,
      BY + 1.4,
      -24,
      1,
      0,
      2.6,
      1.0,
      K.tag("RING THE BELL", "#80ff60", 512, 128, { font: "Georgia, serif" }),
    );
    // stair up into the baptistry (x −18..−14, z −12..−2)
    K.stairs(b, -18, -12, -14, -2, BY, 0, "+z", {
      mat: "crypt_brick",
      tint: [0.6, 0.5, 0.42],
      nosing: "limestone",
      rail: "r",
      railMat: "black_iron",
      handMat: "black_iron",
    });
    K.segWall(b, -14, -12, -14, -2, BY, 0, 1, {
      mat: "crypt_brick",
      tint: [0.55, 0.48, 0.4],
      trim: false,
    });
    K.segWall(b, -18, -2, -18, -12, BY, 0, 1, {
      mat: "crypt_brick",
      tint: [0.55, 0.48, 0.4],
      trim: false,
    });
    K.segWall(b, -18, -2, -14, -2, BY, 0, 1, {
      mat: "crypt_brick",
      tint: [0.55, 0.48, 0.4],
      trim: false,
    });
    b.face("crypt_brick", -18, -0.02, -12, 1, 0, 0, 0, 0, 1, 4, 2, {
      uv: "top",
      tint: [0.4, 0.35, 0.3],
    }); // ceiling over the stair foot

    ctx.intRoot = b.finish(null);
    ctx.intRoot.name = "poi_stpat_int";

    // ================= doors, anchors, loot =================
    const S = PC.STPAT;
    K.door(ctx, {
      id: "pc_sp_in",
      pos: V(S.MID, 1.4, S.CZF - 0.95),
      label: "Old St. Patrick's Cathedral",
      verb: "Enter",
      target: { x: O.x, y: O.y, z: O.z + 2.4, yaw: 0 },
      onEnter: () => K.safe("disc", () => G.discover("old_st_patricks")),
    });
    K.door(ctx, {
      id: "pc_sp_out",
      pos: V(O.x, O.y + 1.3, O.z + 3.8),
      label: "Grand Street",
      verb: "Leave",
      target: { x: S.MID, y: 0.12, z: S.CZF + 1.8, yaw: PI },
    });
    K.anchor(ctx, "entrance", 0, 0, 2.4);
    K.anchor(ctx, "altar", 0, SAN, -35);
    K.anchor(ctx, "crypt", -1, BY, -54);
    K.anchor(ctx, "reliquary", -0.6, BY + 1.12, -57.4);
    K.anchor(ctx, "boss", -23, BY, -25.5);
    K.anchor(ctx, "catacombs", 0, BY, -48);
    [
      [-4, 0, -20],
      [5, 0, -27],
      [-10, BY, -48],
      [6, BY, -48],
      [-16, BY, -36],
      [-16, BY, -20],
    ].forEach((p, i) => K.anchor(ctx, "spawn" + (i + 1), p[0], p[1], p[2]));
    K.loot(ctx, "footlocker", 17.2, SAN, -31, PI, {
      name: "Poor Box",
      items: [["old_dollars", 3]],
      loot: "cash_register",
    });
    K.loot(ctx, "locker", 17.4, SAN, -44, -HP, {
      name: "Vestment Press",
      loot: "dresser",
    });
    K.loot(ctx, "first_aid", 9.86, 1.5, -3.2, -HP, {
      wall: true,
      loot: "first_aid",
    }); // on the nave's east wall (was outside the building at x 11.9)
    K.loot(ctx, "footlocker", 9.6, LOFT, -28, -HP, {
      name: "Choir Chest",
      loot: "junk_household",
    });
    K.loot(ctx, "footlocker", -0.2, BY, -52.2, 0, {
      name: "Bishop's Coffer",
      items: [
        ["old_dollars", 5],
        ["rally_tonic_extra", 1],
        ["iodine_tabs", 2],
      ],
      loot: "junk_valuable",
    });
    K.loot(ctx, "duffle_bag", -26.8, BY, -29.8, 0.4, {
      name: "Dead Scavenger's Pack",
      loot: "duffle_bag",
    });
    K.skel(ctx, -25.5, BY, -23, 1.3, "reaching");
    // ---- traps (08_traps.js): the dead scavenger trapped the tunnels against the Maniacs ----
    K.trap(ctx, {
      id: "sp_bear1",
      kind: "beartrap",
      pos: [-16.3, BY, -39.2],
      yaw: 0.6,
    });
    K.trap(ctx, {
      id: "sp_bear2",
      kind: "beartrap",
      pos: [-15.7, BY, -17.6],
      yaw: 2.1,
    });
    K.trap(ctx, {
      id: "sp_trip",
      kind: "tripwire",
      a: [-13.2, BY + 0.22, -49.8],
      c: [-13.2, BY + 0.22, -46.2],
      bouquet: [-13.4, BY, -49.62],
    });
    K.note(ctx, "pc_sp_note_scav", -26.1, BY + 0.03, -29.1, {
      type: "note",
      name: "Scavenger's Map",
      title: "A hand-drawn map of the catacombs, on the back of a hymn sheet",
      text: '(a careful little map: CHURCH at the top, STAIRS, a long corridor marked BONES BONES BONES, a room marked "BISHOPS — LOCKED — silver??" and a tunnel running south to a circle marked "BIG ONE")\n\nTRAPS — so I don\'t forget:\n  * two bear traps in the south tunnel, middle and far end, by the candles\n  * wire + 3 frags across the long corridor, just before the tunnel turn-off\n  THE SCREAMERS WALK RIGHT OVER THE WIRE. THEY DON\'T EVEN LOOK DOWN. why doesn\'t it\n\nThe big one has a KEY on a string round his neck. It jingles. Tomorrow.',
    });
    K.note(ctx, "pc_sp_reliquary", -0.6, BY + 1.13, -57.4, {
      type: "misc",
      name: "Bell Reliquary of St. Patrick",
      title: "Silver reliquary (c. 1830)",
      value: 450,
      text: 'A silver casket the size of a cigar box, worked with Celtic knots and a tiny bell in relief. Inside, on faded green silk: a thumb-sized chip of dark iron. The engraved lid reads: "A PIECE OF THE BELL OF ST. PATRICK — GIVEN TO THE CATHEDRAL OF NEW YORK BY THE FAITHFUL OF ARMAGH, 1831." When you tilt it, something inside rings, very faintly.',
    });
    K.note(ctx, "pc_sp_note_sexton", -19.3, BY + 0.02, -22.4, {
      type: "note",
      name: "The Sexton's Ledger",
      title: "Sexton's ledger — last pages",
      text: "Mar 5. Sirens. Fr. Delaney took the Bell Reliquary down to the Bishops' Crypt \"for safekeeping\" and locked the grille. I keep the only key, as I have for thirty years.\n\nMar 7. The people who came down here to shelter are sick. So am I. Hair on the pillow, blood in the basin.\n\nNov ?. Fr. Delaney is gone. The others don't talk any more. They scream, and they walk the tunnels.\n\n?. I forget things now. Tonight I found myself howling at the Sanctuary lamp, and could not say why. Isn't that something.\n\n?. If anyone comes: the key is on me. Ring the bell for me. I would have liked to hear it once more.",
    });
    K.note(ctx, "pc_sp_reel_choir", 1.2, LOFT + 1.1, -2.6, {
      type: "tape",
      name: "Tape reel: Choir Practice",
      title: "Old St. Patrick's — choir practice, Mar. 4, 1967",
      text: "(an organ, a little out of tune; a choir of maybe eight voices, starting and stopping)\n\nCHOIRMASTER: No, no — again from the Gloria. Mrs. Flanagan, you are a full measure ahead of the organ, which is itself a full measure ahead of God.\n\n(laughter)\n\nCHOIRMASTER: Tomorrow at nine. Bring the good voices. If the Russians come, we'll sing louder.\n\n(the organ swells — then the tape runs out)",
    });
  }

  // ------------------------------------------------------------------ NPCs (interior)
  function spawn(ctx) {
    const A = ctx.anchors;
    const v = (a) => ({ x: a.x, y: a.y, z: a.z });
    PC.spawnActor(ctx, {
      id: "pc_sp_sexton",
      type: "maniac_bruiser",
      name: "The Sexton",
      faction: "maniacs",
      level: 9,
      hostile: true,
      pos: v(A.boss),
      yaw: 0,
      ai: "guard",
      home: "here",
      homeR: 6,
      loot: "maniac",
      inventory: [["pc_sp_sexton_key", 1]],
      noRespawn: true,
      barks: [
        "(a long, cracked howl, almost a hymn)",
        "(he slaps the bone wall and screams)",
      ],
    });
    const maniacs = [
      ["pc_sp_maniac1", A.catacombs, "Maniac Parishioner"],
      ["pc_sp_maniac2", A.spawn5, "Maniac Choirboy"],
      [
        "pc_sp_maniac3",
        { x: A.altar.x + 3, y: A.altar.y, z: A.altar.z + 3 },
        "Maniac Usher",
      ],
    ];
    for (const [id, p, name] of maniacs)
      PC.spawnActor(ctx, {
        id,
        type: "maniac",
        name,
        faction: "maniacs",
        level: 4,
        hostile: true,
        pos: v(p),
        yaw: r2(),
        ai: "wander",
        home: "here",
        homeR: 5,
        loot: "maniac",
      });
  }
  function r2() {
    return Math.random() * 6.28;
  }

  PC.part("old_st_patricks", { int: interior, spawn });
})();
