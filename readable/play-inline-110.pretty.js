/* src/landmarks_a/10_empire_state.js */
/* =====================================================================
 * NEW RAD CITY — landmarks_a / 10_empire_state.js
 * EMPIRE STATE BUILDING — limestone setback tower with aluminium
 * spandrel strips, 86th-floor observation deck (walkable, reached by the
 * lobby's express elevator), stepped mooring mast + antenna with blinking
 * beacons, blast-torn corner with exposed girders, Brute stronghold
 * barricade on Fifth Avenue. The art-deco lobby interior
 * (INTERIORS.empire_lobby) and its doors live in 10_empire_state_interior.js.
 * Footprint (SITES.empire_state): x 50..110, z -93..-52; entrance faces
 * east onto Fifth Avenue (x = 108).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !THREE || !G.LMA) return;
  const K = G.LMA.kit;
  const U = G.util;

  const DECK_Y = 163;

  function textures() {
    K.facade("fac_esb", {
      bays: 8,
      floors: 8,
      bayW: 2.8,
      floorH: 3.6,
      wall: "#d2c8b0",
      spandrel: "#4a5054",
      glass: "#1e2624",
      frame: "#6a7074",
      win: { x0: 0.32, x1: 0.68, y0: 0.24, y1: 0.86 },
      broken: 0.2,
      boarded: 0.03,
      pierShade: 0.3,
      mullions: 1,
      seed: 1931,
      // aluminium spandrel strips: brushed-metal highlight + deco chevrons between the windows
      deco: (x, W, H, fy, y0, fh, bw) => {
        for (let bx = 0; bx < 8; bx++) {
          const sx0 = bx * bw + bw * 0.32,
            sw = bw * 0.36;
          const g = x.createLinearGradient(sx0, 0, sx0 + sw, 0);
          g.addColorStop(0, "rgba(210,218,224,0.55)");
          g.addColorStop(0.5, "rgba(120,128,134,0.1)");
          g.addColorStop(1, "rgba(20,24,26,0.45)");
          x.fillStyle = g;
          x.fillRect(sx0, y0, sw, fh * 0.12);
          x.fillRect(sx0, y0 + fh * 0.78, sw, fh * 0.22);
          x.strokeStyle = "rgba(200,206,210,0.5)";
          x.lineWidth = 1.5;
          x.beginPath();
          x.moveTo(sx0 + 2, y0 + fh * 0.96);
          x.lineTo(sx0 + sw / 2, y0 + fh * 0.82);
          x.lineTo(sx0 + sw - 2, y0 + fh * 0.96);
          x.stroke();
        }
      },
    });
    K.facade("fac_esb_low", {
      bays: 6,
      floors: 3,
      bayW: 3.2,
      floorH: 4.2,
      wall: "#bfb6a0",
      glass: "#2a3230",
      frame: "#4a4a44",
      win: { x0: 0.2, x1: 0.8, y0: 0.18, y1: 0.86 },
      broken: 0.4,
      boarded: 0.18,
      mullions: 2,
      sill: "#a89f8a",
      lintel: true,
      seed: 1930,
    });
    K.paint("esb_sign", 1024, 128, (x, W, H) => {
      const g = x.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#3a2e1c");
      g.addColorStop(1, "#1e170e");
      x.fillStyle = g;
      x.fillRect(0, 0, W, H);
      x.font = 'bold 84px Georgia, "Times New Roman", serif';
      x.textAlign = "center";
      x.textBaseline = "middle";
      try {
        x.letterSpacing = "18px";
      } catch (e) {
        /* ignore */
      }
      const tg = x.createLinearGradient(0, 20, 0, 110);
      tg.addColorStop(0, "#fff0b0");
      tg.addColorStop(0.5, "#d4a63c");
      tg.addColorStop(1, "#8a6420");
      x.fillStyle = tg;
      x.fillText("EMPIRE STATE", W / 2, H / 2 + 4);
      try {
        x.letterSpacing = "0px";
      } catch (e) {
        /* ignore */
      }
      K.stains(x, W, H, 6, 71, 0.4);
      K.streaks(x, W, H, 20, 72, 0.3);
    });
    K.paint("esb_sunburst", 256, 256, (x, W, H) => {
      x.save();
      x.translate(W / 2, H);
      for (let i = 0; i < 17; i++) {
        const a = Math.PI + (i * Math.PI) / 16;
        x.fillStyle = i % 2 ? "#e0b44a" : "#9a7424";
        x.beginPath();
        x.moveTo(0, 0);
        x.lineTo(Math.cos(a - 0.05) * 250, Math.sin(a - 0.05) * 250);
        x.lineTo(Math.cos(a + 0.05) * 250, Math.sin(a + 0.05) * 250);
        x.fill();
      }
      x.fillStyle = "#f0cc6a";
      x.beginPath();
      x.arc(0, 0, 60, Math.PI, 0);
      x.fill();
      x.restore();
    });
    K.interior("empire_state:paints"); // lobby paints (esb_relief, esb_ceiling) — see 10_empire_state_interior.js
    K.paint("elevator_door", 256, 320, (x, W, H) => {
      const g = x.createLinearGradient(0, 0, W, 0);
      g.addColorStop(0, "#6a4a26");
      g.addColorStop(0.5, "#a8804a");
      g.addColorStop(1, "#6a4a26");
      x.fillStyle = g;
      x.fillRect(0, 0, W, H);
      x.fillStyle = "#2a1a0c";
      x.fillRect(W / 2 - 2, 0, 4, H);
      x.strokeStyle = "#e0bc6a";
      x.lineWidth = 3;
      for (const sx of [W * 0.25, W * 0.75]) {
        x.beginPath();
        x.moveTo(sx, H * 0.15);
        x.lineTo(sx - 40, H * 0.45);
        x.lineTo(sx, H * 0.75);
        x.lineTo(sx + 40, H * 0.45);
        x.closePath();
        x.stroke();
        for (let k = 0; k < 5; k++) {
          x.beginPath();
          x.moveTo(sx, H * 0.45);
          x.lineTo(sx - 40 + k * 20, H * 0.9);
          x.stroke();
        }
      }
      K.stains(x, W, H, 5, 93, 0.4);
    });
    K.paint("brute_sign", 256, 128, (x, W, H) => {
      x.fillStyle = "#5a4a36";
      x.fillRect(0, 0, W, H);
      for (let i = 0; i < 4; i++) {
        x.fillStyle = "rgba(0,0,0,0.25)";
        x.fillRect(0, i * 32, W, 2);
      }
      x.fillStyle = "#8a1a10";
      x.font = 'bold 44px Impact, "Arial Black", sans-serif';
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.save();
      x.translate(W / 2, H / 2);
      x.rotate(-0.06);
      x.fillText("NO HUMANS", 0, 0);
      x.restore();
      x.fillStyle = "rgba(120,20,10,0.8)";
      for (let i = 0; i < 6; i++) x.fillRect(40 + i * 30, 80, 3, 20 + i * 4);
    });
    K.paint("observatory_sign", 512, 96, (x, W, H) =>
      K.signText(x, W, H, "86TH FLOOR OBSERVATORY", {
        bg: "#1c1c20",
        fg: "#d8c890",
        border: "#b8903a",
        size: 40,
        font: "Georgia, serif",
      }),
    );
  }

  // ------------------------------------------------------------------
  // Exterior
  // ------------------------------------------------------------------
  function exterior(rec) {
    const b = K.builder("esb_shell", { grime: 0.5 });
    const d = K.builder("esb_detail", { grime: 0.55 });
    const glows = K.glowSet("esb");
    const beacons = K.glowSet("esb_beacon");

    // blast damage soot
    b.burn(100, 104, -78, 16, 0.85)
      .burn(62, 60, -80, 8, 0.5)
      .burn(96, 22, -62, 7, 0.6)
      .burn(108, 3, -80, 6, 0.6);

    const tier = (mat, x0, x1, z0, z1, y0, y1, faces) => {
      b.boxMM(mat, x0, y0, z0, x1, y1, z1, { faces: faces || "nsewt" });
      K.colBox(x0, y0, z0, x1, y1, z1, { surface: "concrete" });
    };
    const cornice = (x0, x1, z0, z1, y, h, out) => {
      b.boxMM("limestone", x0 - out, y, z0 - out, x1 + out, y + h, z1 + out, {
        faces: "nsewtb",
        grime: 0.6,
      });
    };

    // --- A: podium (5 storeys), flush with the block's property line on all four pavements (block x 50..110, z -88..-57) ---
    const PX0 = 50.3,
      PX1 = 109.7,
      PZ0 = -87.7,
      PZ1 = -57.3,
      GX0 = PX0 - 0.3,
      GX1 = PX1 + 0.3,
      GZ0 = PZ0 - 0.3,
      GZ1 = PZ1 + 0.3;
    tier("fac_esb_low", PX0, PX1, PZ0, PZ1, 4.6, 18.5);
    b.boxMM("granite", GX0, 0, GZ0, GX1, 4.6, GZ1, {
      faces: "nsew",
      grime: 0.7,
    });
    K.colBox(GX0, 0, GZ0, GX1, 4.6, GZ1, { surface: "concrete" });
    cornice(PX0, PX1, PZ0, PZ1, 18.5, 0.7, 0.45);
    cornice(PX0, PX1, PZ0, PZ1, 17.2, 0.25, 0.2);
    cornice(GX0, GX1, GZ0, GZ1, 4.4, 0.35, 0.15);
    const espill = K.spillSet("esb");
    // Art-deco portal: granite surround, dark glazed recess, gold sunburst transom, lit EMPIRE STATE letters on the
    // lintel, a stepped aluminium canopy with a lit soffit. (cx,cz) on the granite face, (nx,nz) outward.
    const portal = (cx, cz, nx, nz, o) => {
      o = o || {};
      const face = Math.atan2(nx, nz),
        ux = -nz,
        uz = nx,
        P2 = (u, n, y) => [cx + ux * u + nx * n, y, cz + uz * u + nz * n];
      for (const s of [-1, 1]) {
        const q = P2(s * 3.5, 0.2, 0);
        d.box("granite", q[0], 0, q[2], 1.4, 9.5, 0.9, {
          yaw: face,
          grime: 0.6,
        });
      }
      {
        const q = P2(0, 0.2, 7.2);
        d.box("granite", q[0], 7.2, q[2], 8.4, 2.3, 0.9, {
          yaw: face,
          grime: 0.6,
        });
      }
      {
        const q = P2(0, 0.05, 0);
        d.panel("glass_broken", q[0], 3.6, q[2], 5.6, 7.2, face);
      }
      {
        const q = P2(0, 0.1, 0);
        d.panel("atlas_paint", q[0], 5.6, q[2], 5.2, 2.6, face, {
          rect: K.paint("esb_sunburst", 256, 256),
        });
      }
      {
        const q = P2(0, 0.67, 0);
        d.panel("atlas_paint_glow", q[0], 8.35, q[2], 8.0, 1.0, face, {
          rect: K.paint("esb_sign", 1024, 128),
        });
      }
      // aluminium mullions + transom bar
      for (const u of [-1.4, 0, 1.4]) {
        const q = P2(u, 0.12, 0);
        d.box("chrome", q[0], 0, q[2], 0.12, 7.2, 0.1, {
          yaw: face,
          grime: 0.3,
        });
      }
      {
        const q = P2(0, 0.12, 4.15);
        d.box("chrome", q[0], 4.1, q[2], 5.6, 0.14, 0.12, {
          yaw: face,
          grime: 0.3,
        });
      }
      if (o.sealed) {
        const q = P2(0, 0.15, 0);
        d.box("bronze", q[0], 0, q[2], 4.0, 3.9, 0.08, {
          yaw: face,
          grime: 0.6,
        });
        for (const u of [-1, 1]) {
          const r = P2(u, 0.22, 0);
          d.box("wood_rotten", r[0], 0.4, r[2], 1.8, 3.0, 0.06, {
            yaw: face + u * 0.03,
            grime: 0.7,
          });
        }
      }
      // stepped deco canopy (two tiers), chevron fascia, lit soffit + downlights, a warm pool on the pavement
      {
        const q = P2(0, 1.4, 0);
        d.box("chrome", q[0], 4.45, q[2], 7.6, 0.32, 2.8, {
          yaw: face,
          grime: 0.4,
        });
      }
      {
        const q = P2(0, 1.1, 0);
        d.box("chrome", q[0], 4.77, q[2], 6.2, 0.26, 2.2, {
          yaw: face,
          grime: 0.4,
        });
      }
      {
        const q = P2(0, 2.81, 0);
        d.box("gold", q[0], 4.5, q[2], 7.6, 0.08, 0.02, { yaw: face });
      }
      {
        const q = P2(0, 1.4, 0);
        d.box("lit_warm", q[0], 4.43, q[2], 6.8, 0.02, 2.2, {
          yaw: face,
          tint: 0xd8b070,
        });
      }
      for (const u of [-2.6, 0, 2.6]) {
        const q = P2(u, 2.0, 0);
        glows.add(q[0], 4.3, q[2], 0xffd8a0, "m");
      }
      for (const s of [-1, 1]) {
        const a2 = P2(s * 3.4, 0.4, 0),
          b2 = P2(s * 3.4, 2.6, 0);
        d.beam("chrome", a2[0], 6.6, a2[2], b2[0], 4.8, b2[2], 0.04);
      }
      {
        const q = P2(0, 3.0, 0);
        espill.add(q[0], q[2], 0xffc888, 4.2, {
          y: 0.14,
          i: 0.4,
          sx: 6,
          sz: 3.6,
          yaw: face,
        });
      }
    };
    // storefront band: granite piers between shop bays (boarded / smashed / a few lit), bronze sign bands, torn awnings,
    // rubble drifted against the base
    const SKIP = [];
    const shopfronts = (ax, az, bx, bz, nx, nz) => {
      const L = Math.hypot(bx - ax, bz - az),
        ux = (bx - ax) / L,
        uz = (bz - az) / L;
      const face = Math.atan2(nx, nz);
      for (let t = 3; t < L - 2; t += 5.2) {
        const cx = ax + ux * (t + 1.6) + nx * 0.02,
          cz = az + uz * (t + 1.6) + nz * 0.02;
        if (SKIP.some((q) => Math.hypot(q[0] - cx, q[1] - cz) < 6.2)) continue;
        const v = [3, 1, 4, 7, 5, 3, 1, 2, 4, 3][
          Math.floor(U.hash2(Math.round(cx * 3), Math.round(cz * 3)) * 10)
        ];
        b.panel("shopfront", cx, 2.2, cz, 3.4, 3.4, face, {
          rect: K.shopRect(v),
        });
        if (K.SHOP_LIT.indexOf(v) >= 0) {
          glows.add(cx + nx * 0.6, 2.4, cz + nz * 0.6, 0xffc070, "m");
          espill.add(cx + nx * 2.0, cz + nz * 2.0, 0xffc070, 2.8, {
            y: 0.14,
            i: 0.35,
          });
        }
        d.box("bronze", cx + nx * 0.06, 3.95, cz + nz * 0.06, 3.6, 0.3, 0.12, {
          yaw: face,
          grime: 0.5,
        });
        for (const s of [-1, 1])
          d.box(
            "granite",
            cx + ux * s * 2.2 + nx * 0.18,
            0,
            cz + uz * s * 2.2 + nz * 0.18,
            0.9,
            4.4,
            0.36,
            { yaw: face, grime: 0.6 },
          );
        if ((t * 7) % 3 < 1.5)
          d.geo("fabric", K.T.box, {
            x: cx + nx * 0.9,
            y: 4.0,
            z: cz + nz * 0.9,
            ry: face,
            rx: 0.45,
            sx: 3.2,
            sy: 0.03,
            sz: 1.8,
            tint: [0x7a2a22, 0x2a4a3a, 0x5a4a2a][Math.floor(t) % 3],
          });
        if (U.hash2(Math.round(cx), Math.round(cz) + 5) < 0.28)
          P.rubblePile(d, cx + nx * 0.9, cz + nz * 0.9, 1.1, 0.55, {
            seed: Math.round(cx * 7 + cz),
          });
      }
    };
    const P = K.parts;
    // 34th Street portal (north face) — sealed (chained bronze doors, plank-boarded): the way in is the Fifth Ave door
    SKIP.push([80, GZ0], [GX0, -72.5]);
    portal(80, GZ0, 0, -1, { sealed: true });
    // west face: the old observatory ticket entrance, sealed, under its marquee board
    {
      const q = [GX0, -72.5];
      d.boxMM("granite", GX0 - 0.5, 0, q[1] - 2.6, GX0, 5.2, q[1] - 1.8, {
        grime: 0.6,
      });
      d.boxMM("granite", GX0 - 0.5, 0, q[1] + 1.8, GX0, 5.2, q[1] + 2.6, {
        grime: 0.6,
      });
      d.panel("glass_broken", GX0 - 0.03, 1.8, q[1], 3.6, 3.6, -Math.PI / 2);
      d.box("bronze", GX0 - 0.12, 0, q[1], 0.08, 3.2, 3.2, { grime: 0.6 });
      d.box("chrome", GX0 - 1.1, 3.9, q[1], 2.2, 0.28, 5.6, { grime: 0.4 });
      d.box("lit_warm", GX0 - 1.1, 3.88, q[1], 1.9, 0.02, 5.0, {
        tint: 0xd8b070,
      });
      d.panel(
        "atlas_paint_glow",
        GX0 - 0.06,
        4.75,
        q[1],
        5.2,
        0.97,
        -Math.PI / 2,
        { rect: K.paint("observatory_sign", 512, 96) },
      );
      glows.add(GX0 - 1.4, 3.75, q[1], 0xffd8a0, "m");
      espill.add(GX0 - 2.2, q[1], 0xffc888, 3.4, { y: 0.14, i: 0.32 });
    }
    shopfronts(GX1, GZ0, GX0, GZ0, 0, -1); // north face (34th St)
    shopfronts(GX0, GZ1, GX1, GZ1, 0, 1); // south face (33rd St)
    shopfronts(GX0, GZ0, GX0, GZ1, -1, 0); // west face

    // --- B: lower tower ---
    // deep setback above the 5-storey podium (the tower steps well back from Fifth Avenue)
    tier("fac_esb", 58, 102, -83, -62, 19.2, 34);
    cornice(58, 102, -83, -62, 34, 0.5, 0.3);

    // --- C: main shaft with projecting central wings and a blast-torn NE corner ---
    const C = { x0: 60, x1: 100, z0: -80, z1: -65 };
    tier("fac_esb", C.x0, C.x1, C.z0, C.z1, 34.5, 95);
    // damaged band 95..112: L-shape leaving the NE corner (x 90..100, z -80..-72) open
    b.boxMM("fac_esb", C.x0, 95, C.z0, 90, 112, C.z1, { faces: "nswt" });
    b.boxMM("fac_esb", 90, 95, -72, C.x1, 112, C.z1, { faces: "sent" });
    K.colBox(C.x0, 95, C.z0, 90, 112, C.z1);
    K.colBox(90, 95, -72, C.x1, 112, C.z1);
    // exposed interior: floor slabs, broken columns, dangling girders
    for (let y = 95; y < 112; y += 3.6) {
      b.boxMM(
        "concrete_dark",
        90,
        y - 0.35,
        C.z0 + 1.5 + (y % 5),
        C.x1 - 1 - (y % 3),
        y,
        -72,
        { faces: "nsewtb", grime: 0.9 },
      );
      for (let k = 0; k < 3; k++)
        d.beam(
          "rust",
          91 + k * 3,
          y,
          C.z0 + 2,
          92 + k * 3.5,
          y - 1.2,
          C.z0 - 1.5 - k,
          0.18,
        );
    }
    for (let k = 0; k < 4; k++)
      b.beam(
        "rust",
        92 + k * 2.4,
        95,
        -73,
        92 + k * 2.4 + (k % 2) * 0.6,
        111.5 - k * 2,
        -73 - (k % 2),
        0.4,
      );
    b.boxMM("fac_esb", C.x0, 112, C.z0, C.x1, 140, C.z1, { faces: "nsewb" });
    K.colBox(C.x0, 112, C.z0, C.x1, 140, C.z1);
    b.boxMM("concrete", 90, 111.8, C.z0, C.x1, 112, -72, { faces: "b" });
    K.smoke(96, 104, -79, 1.4);
    // central wings (project 2 m on the long faces)
    tier("fac_esb", 69, 91, -82, -63, 34.5, 146);
    // corner piers for vertical articulation
    for (const px of [60, 69, 91, 100])
      for (const pz of [-80, -65]) {
        if (px === 100 && pz === -80) {
          b.boxMM(
            "limestone",
            px - 0.6,
            34.5,
            pz - 0.6,
            px + 0.6,
            95,
            pz + 0.6,
          );
          b.boxMM(
            "limestone",
            px - 0.6,
            112,
            pz - 0.6,
            px + 0.6,
            140.5,
            pz + 0.6,
          );
          continue;
        }
        b.boxMM(
          "limestone",
          px - 0.6,
          34.5,
          pz - 0.6,
          px + 0.6,
          px === 69 || px === 91 ? 146.5 : 140.5,
          pz + 0.6,
          { grime: 0.45 },
        );
      }
    cornice(C.x0, C.x1, C.z0, C.z1, 140, 0.6, 0.35);
    cornice(69, 91, -82, -63, 146, 0.7, 0.35);

    // --- D, E, F upper setbacks ---
    tier("fac_esb", 64, 96, -78, -67, 140.6, 151);
    cornice(64, 96, -78, -67, 151, 0.5, 0.3);
    tier("fac_esb", 66.5, 93.5, -77.5, -67.5, 151.5, 157);
    cornice(66.5, 93.5, -77.5, -67.5, 157, 0.5, 0.3);
    tier("fac_esb", 68, 92, -76.5, -68.5, 157.5, DECK_Y);
    // Observation deck floor
    b.boxMM("paving", 68, DECK_Y - 0.1, -76.5, 92, DECK_Y + 0.05, -68.5, {
      faces: "t",
      grime: 0.4,
    });
    // parapet + the famous inward-curving steel fence
    const para = [
      [68, -76.5, 92, -76.5],
      [92, -76.5, 92, -68.5],
      [92, -68.5, 68, -68.5],
      [68, -68.5, 68, -76.5],
    ];
    for (const p of para) {
      const L = Math.hypot(p[2] - p[0], p[3] - p[1]),
        ux = (p[2] - p[0]) / L,
        uz = (p[3] - p[1]) / L;
      const nx = -uz,
        nz = ux; // inward normal (polygon is clockwise in x/z)
      b.box(
        "limestone",
        (p[0] + p[2]) / 2 - nx * 0.2,
        DECK_Y,
        (p[1] + p[3]) / 2 - nz * 0.2,
        L + 0.4,
        1.15,
        0.4,
        { yaw: Math.atan2(ux, uz) + Math.PI / 2, faces: "nsewt", grime: 0.5 },
      );
      K.colRot(
        (p[0] + p[2]) / 2,
        (p[1] + p[3]) / 2,
        L + 0.4,
        0.5,
        DECK_Y,
        DECK_Y + 2.6,
        -Math.atan2(p[3] - p[1], p[2] - p[0]),
        { surface: "concrete" },
      );
      for (let t = 0.2; t < L; t += 0.42) {
        const x = p[0] + ux * t - nx * 0.2,
          z = p[1] + uz * t - nz * 0.2;
        const bent = Math.floor(t * 7.3) % 11 === 0;
        d.beam("black_metal", x, DECK_Y + 1.1, z, x, DECK_Y + 2.4, z, 0.035);
        d.beam(
          "black_metal",
          x,
          DECK_Y + 2.4,
          z,
          x + nx * (bent ? 0.2 : 0.55),
          DECK_Y + (bent ? 2.6 : 2.95),
          z + nz * (bent ? 0.2 : 0.55),
          0.03,
        );
      }
      d.beam(
        "black_metal",
        p[0] - nx * 0.2,
        DECK_Y + 1.8,
        p[1] - nz * 0.2,
        p[2] - nx * 0.2,
        DECK_Y + 1.8,
        p[3] - nz * 0.2,
        0.04,
      );
      d.beam(
        "black_metal",
        p[0] - nx * 0.2 + nx * 0.55,
        DECK_Y + 2.95,
        p[1] - nz * 0.2 + nz * 0.55,
        p[2] - nx * 0.2 + nx * 0.55,
        DECK_Y + 2.95,
        p[3] - nz * 0.2 + nz * 0.55,
        0.04,
      );
    }
    // 86th floor enclosure (core) with the elevator door on its east face
    tier("fac_esb", 74, 86, -74.5, -70.5, DECK_Y, 170);
    cornice(74, 86, -74.5, -70.5, 170, 0.5, 0.3);
    d.box("elevator_frame", 86.05, DECK_Y, -72.5, 0.1, 2.6, 1.8, {
      faces: "e",
      uv: "rect",
      rect: K.paint("elevator_door", 256, 320),
      grime: 0,
    });
    d.panel("atlas_paint", 86.06, DECK_Y + 3.2, -72.5, 2.6, 0.5, Math.PI / 2, {
      rect: K.paint("observatory_sign", 512, 96),
    });
    // coin-op binocular viewers
    for (const vp of [
      [70, -72.5, -Math.PI / 2],
      [90.5, -75, Math.PI / 2],
      [90.5, -70, Math.PI / 2],
      [80, -75.5, Math.PI],
    ]) {
      d.cyl("metal", vp[0], DECK_Y, vp[1], 0.12, 0.1, 1.1, 8);
      d.geo("paint_green", K.T.box, {
        x: vp[0],
        y: DECK_Y + 1.3,
        z: vp[1],
        ry: vp[2],
        sx: 0.45,
        sy: 0.35,
        sz: 0.5,
      });
      d.geo("black_metal", K.T.cyl8, {
        x: vp[0] + Math.sin(vp[2]) * 0.3,
        y: DECK_Y + 1.35,
        z: vp[1] + Math.cos(vp[2]) * 0.3,
        ry: vp[2],
        rx: Math.PI / 2,
        sx: 0.09,
        sy: 0.25,
        sz: 0.09,
      });
    }
    // KONG's telescope (main story, mq05): a brass ship's glass on a scrap tripod, trained on Grand Central to the north-east,
    // and his count chalked on a door propped beside it: candles going down a hole every night. "Kong good at counting."
    {
      const tx = 88.7,
        tz = -73.4,
        ty = DECK_Y + 1.5,
        dx = 160,
        dz = -148,
        L0 = Math.hypot(dx, dz),
        ux = dx / L0,
        uz = dz / L0;
      for (let k = 0; k < 3; k++) {
        const a = k * 2.094 + 0.3;
        d.beam(
          "rust",
          tx + Math.cos(a) * 0.55,
          DECK_Y,
          tz + Math.sin(a) * 0.55,
          tx,
          ty - 0.1,
          tz,
          0.035,
        );
      }
      d.beam(
        "brass",
        tx - ux * 0.55,
        ty - 0.06,
        tz - uz * 0.55,
        tx + ux * 0.75,
        ty + 0.08,
        tz + uz * 0.75,
        0.07,
      );
      d.beam(
        "brass",
        tx + ux * 0.75,
        ty + 0.08,
        tz + uz * 0.75,
        tx + ux * 0.95,
        ty + 0.1,
        tz + uz * 0.95,
        0.1,
      );
      const tally = K.storyPaint("esb_kong_count", 192, 256, (x, W, H) => {
        x.fillStyle = "#5a4630";
        x.fillRect(0, 0, W, H);
        x.strokeStyle = "rgba(236,230,214,0.9)";
        x.lineWidth = 4;
        x.lineCap = "round";
        x.fillStyle = "rgba(236,230,214,0.9)";
        x.font = "bold 26px Impact, sans-serif";
        x.textAlign = "center";
        x.fillText("KONG COUNT", W / 2, 30);
        for (let g = 0; g < 14; g++) {
          const gx = 18 + (g % 4) * 42,
            gy = 50 + Math.floor(g / 4) * 48;
          for (let k = 0; k < 4; k++) {
            x.beginPath();
            x.moveTo(gx + k * 7, gy);
            x.lineTo(gx + k * 7 + 2, gy + 34);
            x.stroke();
          }
          x.beginPath();
          x.moveTo(gx - 4, gy + 28);
          x.lineTo(gx + 28, gy + 6);
          x.stroke();
        }
        x.font = "bold 15px Impact, sans-serif";
        x.fillText("LITTLE FIRES GO IN HOLE", W / 2, H - 14);
        K.chalkify(x, W, H, 5);
      });
      d.box("wood_dark", 86.35, DECK_Y, -73.6, 0.06, 1.6, 0.9, { grime: 0.6 });
      d.panel("storyp", 86.4, DECK_Y + 0.85, -73.6, 0.8, 1.05, Math.PI / 2, {
        rect: tally,
      });
      rec.anchor(
        "kong_telescope",
        tx - ux * 1.0,
        DECK_Y,
        tz - uz * 1.0,
        Math.atan2(-ux, -uz),
      );
    }
    d.burn(71, DECK_Y, -69, 3, 0.6);
    K.parts.skeleton(d, 88, DECK_Y + 0.06, -69.6, 2.2);

    // --- Mooring mast ---
    const mx = 80,
      mz = -72.5;
    b.cyl("limestone", mx, 170, mz, 4.3, 4.0, 10, 16, { grime: 0.45 });
    for (let i = 0; i < 16; i++) {
      const a = (i * Math.PI) / 8;
      b.box(
        "steel",
        mx + Math.cos(a) * 4.25,
        170,
        mz - Math.sin(a) * 4.25,
        0.35,
        10.5,
        0.35,
        { yaw: a, grime: 0.3 },
      );
    }
    b.cyl("steel", mx, 180, mz, 4.4, 4.4, 0.6, 16, { grime: 0.3 });
    b.cyl("glass", mx, 180.6, mz, 3.3, 3.2, 4.2, 16, { grime: 0.2 });
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6;
      b.box(
        "steel",
        mx + Math.cos(a) * 3.3,
        180.6,
        mz - Math.sin(a) * 3.3,
        0.2,
        4.2,
        0.2,
        { yaw: a, grime: 0.2 },
      );
    }
    b.cyl("steel", mx, 184.8, mz, 3.6, 2.2, 1.6, 16, { grime: 0.3 });
    b.cyl("steel", mx, 186.4, mz, 2.2, 1.3, 2.6, 12, { grime: 0.3 });
    b.cyl("steel", mx, 189, mz, 0.75, 0.55, 5, 8, { grime: 0.2 });
    b.cyl("metal_dark", mx, 194, mz, 0.55, 0.3, 6, 8, { grime: 0.2 });
    b.cyl("metal_dark", mx, 200, mz, 0.22, 0.08, 5.5, 6, { grime: 0.1 });
    for (const y of [191.5, 196])
      b.cyl("metal_dark", mx, y, mz, 1.3, 1.3, 0.25, 12, {
        grime: 0.1,
        bottom: true,
      });
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2 + 0.4;
      d.beam(
        "metal_dark",
        mx + Math.cos(a) * 1.2,
        196.2,
        mz + Math.sin(a) * 1.2,
        mx + Math.cos(a) * 0.25,
        202,
        mz + Math.sin(a) * 0.25,
        0.06,
      );
    }
    K.colBox(mx - 3, 170, mz - 3, mx + 3, 189, mz + 3);
    // crown floodlights: a few salvaged lamps still wash the top setbacks at night (skyline landmark)
    const crown = K.glowSet("esb_crown");
    for (const tr of [
      [64, 96, -78, -67, 151.2],
      [66.5, 93.5, -77.5, -67.5, 157.2],
      [74, 86, -74.5, -70.5, 170.2],
    ]) {
      const [x0, x1, z0, z1, y] = tr;
      for (const p of [
        [x0, z0],
        [x1, z0],
        [x1, z1],
        [x0, z1],
      ])
        crown.add(p[0], y + 0.4, p[1], 0xfff2d8, "l");
      for (const p of [
        [(x0 + x1) / 2, z0 - 0.4],
        [(x0 + x1) / 2, z1 + 0.4],
        [x0 - 0.4, (z0 + z1) / 2],
        [x1 + 0.4, (z0 + z1) / 2],
      ])
        crown.add(p[0], y + 2.5, p[1], 0xffe0b0, "xl");
    }
    crown.add(mx, 184, mz - 4.6, 0xfff0d0, "xl");
    crown.add(mx, 184, mz + 4.6, 0xfff0d0, "xl");
    crown.finish(rec.root, {
      dayOpacity: 0.0,
      nightOpacity: 0.75,
      beacon: true,
      flicker: 0.05,
    });
    beacons.add(mx, 205.6, mz, 0xff2010, "xl");
    beacons.add(mx, 196.4, mz, 0xff2010, "l");
    for (const a of [0, 1.57, 3.14, 4.71])
      beacons.add(
        mx + Math.cos(a) * 4.4,
        181,
        mz - Math.sin(a) * 4.4,
        0xff3020,
        "l",
      );

    // ------------------------------------------------------------------
    // Fifth Avenue entrance (east face, x = 108)
    // ------------------------------------------------------------------
    const ex = GX1,
      ez = -72.5;
    portal(ex, ez, 1, 0, {});
    // bronze revolving-door drums set into the glazed recess (half inside the portal)
    for (const dz of [-1.6, 1.6]) {
      d.cyl("bronze", ex + 0.35, 0, ez + dz, 0.9, 0.9, 0.12, 12, {
        grime: 0.4,
      });
      d.cyl("bronze", ex + 0.35, 2.5, ez + dz, 0.95, 0.95, 0.3, 12, {
        grime: 0.4,
        bottom: true,
      });
      d.cyl("glass_broken", ex + 0.35, 0.12, ez + dz, 0.92, 0.92, 2.4, 12, {
        top: false,
        arc0: -1.3,
        arc: 2.6,
      });
      d.geo("bronze", K.T.box, {
        x: ex + 0.35,
        y: 1.3,
        z: ez + dz,
        ry: 0.6 + dz,
        sx: 1.75,
        sy: 2.4,
        sz: 0.05,
      });
    }
    d.box("bronze", ex + 0.12, 0, ez, 0.12, 3.0, 1.4, { grime: 0.3 });
    // Brute "improvements": a rusted gantry over the canopy hung with gore sacks
    d.beam("rust", ex + 0.5, 6.2, ez - 5, ex + 0.5, 6.2, ez + 5, 0.25);
    d.beam("rust", ex + 0.5, 6.2, ez - 5, ex + 4, 6.4, ez - 5, 0.2);
    d.beam("rust", ex + 0.5, 6.2, ez + 5, ex + 4, 6.4, ez + 5, 0.2);
    d.beam("rust", ex + 4, 6.4, ez - 5, ex + 4, 6.4, ez + 5, 0.2);
    for (const bz of [-3.8, -1.2, 2.1, 4.2])
      K.parts.meatBag(d, ex + 3.3 + (bz % 2) * 0.3, 6.3, ez + bz, {
        len: 0.8 + Math.abs(bz) * 0.15,
      });

    // ------------------------------------------------------------------
    // Brute stronghold: scrap barricade ring on Fifth Ave
    // ------------------------------------------------------------------
    P.scrapWall(d, 110, -86.5, 116.5, -83, 3.2, { seed: 11 });
    P.scrapWall(d, 116.5, -83, 120.5, -76.5, 3.4, { seed: 12 });
    P.scrapWall(d, 120.5, -68.5, 116.5, -62, 3.4, { seed: 13 });
    P.scrapWall(d, 116.5, -62, 110, -58.5, 3.2, { seed: 14 });
    // car hulks stacked as bulwarks
    P.car(d, 123.5, -81, 0.35, { seed: 3 });
    P.car(d, 123.8, -64, -0.2, { seed: 4 });
    P.car(d, 121.5, -86, 1.3, { seed: 5, collide: true });
    // spikes, skulls, gore
    for (const sp of [
      [119.5, -78],
      [121, -75.8],
      [121, -69.2],
      [119.4, -66.8],
      [113, -85],
      [113, -60],
    ])
      P.spike(d, sp[0], sp[1], 2.2 + (sp[0] % 1), { gore: sp[1] > -70 });
    P.cage(d, 112.6, -80.6, 1.8, 2.3, { hollow: true }); // Pete Ruiz (quests 'esb_pete') stands inside
    P.cage(d, 112.6, -64.2, 1.8, 2.3, { hollow: true });
    for (const fb of [
      [117.2, -74.5],
      [117.2, -70.4],
    ])
      P.barrel(d, fb[0], 0, fb[1], "fire", { glows, collide: true });
    for (const m of [
      [111.5, -77, 0.3],
      [111.5, -68, 1.9],
      [114.5, -61.5, 0.8],
    ])
      P.mattress(d, m[0], 0, m[1], m[2]);
    for (let k = 0; k < 8; k++) {
      const a = k * 0.8;
      d.geo("bone", K.T.cyl6, {
        x: 113 + Math.cos(a) * 2.5,
        y: 0.05,
        z: ez + Math.sin(a) * 6,
        rz: Math.PI / 2,
        ry: a,
        sx: 0.04,
        sy: 0.35,
        sz: 0.04,
      });
    }
    P.skeleton(d, 115, 0, -79, 0.8);
    P.signBoard(
      d,
      "atlas_paint",
      K.paint("brute_sign", 256, 128),
      120.6,
      2.2,
      -77.6,
      2.2,
      1.1,
      Math.PI / 2 + 0.5,
      {},
    );
    P.rubblePile(d, 104, -90, 3, 1.6, { seed: 8, collide: true });
    P.rubblePile(d, 96, -89.5, 2.2, 1.1, { seed: 9 });
    // debris from the torn corner lies on the podium roof
    P.rubblePile(d, 98, -83, 3.5, 2.0, { seed: 10 });
    d.box("concrete_dark", 104, 19.2, -84.5, 5, 0.6, 2.2, { yaw: 0.3 });

    // --- Anchors ---
    rec.anchor("entrance", ex + 2.5, 0, ez, -Math.PI / 2);
    rec.anchor("door", ex + 1.2, 0, ez, -Math.PI / 2);
    rec.anchor("boss", 125, 0, ez, -Math.PI / 2);
    rec.anchor("spawn1", 114, 0, -76, -Math.PI / 2);
    rec.anchor("spawn2", 114, 0, -69, -Math.PI / 2);
    rec.anchor("spawn3", 118, 0, -84.5, -Math.PI / 2);
    rec.anchor("spawn4", 118, 0, -60.5, -Math.PI / 2);
    rec.anchor("captive", 112.6, 0, -80.6, 0);
    rec.anchor("captive2", 112.6, 0, -64.2, 0);
    rec.anchor("observation_deck", 89, DECK_Y, -72.5, -Math.PI / 2);
    rec.anchor("rooftop", 80, DECK_Y, -75.4, Math.PI);
    rec.anchor("deck_elevator", 87.2, DECK_Y, -72.5, -Math.PI / 2);
    rec.anchor("mast", mx, 189, mz, 0);
    rec.anchor("loot1", 111.4, 0, -82.5, 0);
    rec.anchor("loot2", 111.4, 0, -62.5, 0);
    rec.anchor("loot_deck", 70, DECK_Y, -75.5, 0);

    b.finish(rec.root);
    d.finish(rec.root, { lod: 420 });
    glows.finish(rec.root, { dayOpacity: 0.4 });
    espill.finish(rec.root, { day: 0.04, night: 1 });
    const bg = beacons.finish(rec.root, {
      dayOpacity: 0.6,
      nightOpacity: 1,
      beacon: true,
    });
    // beacon blink
    const bmats = [];
    bg.traverse((o) => {
      if (o.material) bmats.push(o.material);
    });
    K.animate((dt, t, night) => {
      const on = t % 1.6 < 0.8;
      for (const m of bmats) m.opacity = on ? 0.5 + night * 0.5 : 0.05;
    });
  }

  K.defineSite("empire_state", 10, function () {
    textures();
    const rec = K.record("empire_state");
    // elevator frame material (bronze paint) uses the paint atlas
    K.defineMat("elevator_frame", {
      map: K.atlases.paint.tex,
      color: 0xffffff,
      rough: 0.5,
      metal: 0.3,
    });
    exterior(rec);
    K.interior("empire_state", { rec, DECK_Y }); // lobby cell + doors — 10_empire_state_interior.js
  });
})();
