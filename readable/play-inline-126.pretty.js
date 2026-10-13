/* src/landmarks_a/90_radio_city.js */
/* =====================================================================
 * NEW RAD CITY — landmarks_a / 90_radio_city.js
 * RADIO CITY MUSIC HALL → home of RADIO FREE MANHATTAN.
 * Limestone block with vertical window bands, the famous marquee that
 * wraps the Sixth Avenue corner (red neon + backlit letter board), the
 * tall vertical "RADIO CITY" blade sign, a rooftop broadcast lattice
 * mast with guy wires and beacons. The walk-in Grand Foyer (mezzanine,
 * grand staircase, chandeliers, mural, red carpet and the DJ booth where
 * the anchor 'radio_dj' stands) is interior: 90_radio_city_interior.js.
 * Footprint: x -30..30, z -359..-326; entrance faces east (x = 28).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !THREE || !G.LMA) return;
  const K = G.LMA.kit;

  const BLD = { x0: -28, x1: 28, z0: -356, z1: -328, h: 26 };
  const FOY = { x0: 2, x1: 27, z0: -354, z1: -330, h: 14 };
  const MEZ = { z0: -354, z1: -349.5, y: 5 };

  function textures() {
    K.facade("fac_radio", {
      bays: 8,
      floors: 8,
      bayW: 2.4,
      floorH: 3.2,
      wall: "#cbc1aa",
      spandrel: "#6a6254",
      glass: "#262c2c",
      frame: "#4a463c",
      win: { x0: 0.22, x1: 0.78, y0: 0.2, y1: 0.86 },
      broken: 0.22,
      boarded: 0.08,
      lit: 0.06,
      litColor: "#ffd090",
      mullions: 1,
      pierShade: 0.12,
      seed: 1932,
    });
    K.paint("rc_board", 1024, 192, (x, W, H) => {
      const g = x.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#f4ecd8");
      g.addColorStop(1, "#d8cfb8");
      x.fillStyle = g;
      x.fillRect(0, 0, W, H);
      x.fillStyle = "#1a1a1a";
      x.font = 'bold 58px "Arial Black", Impact, sans-serif';
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.fillText("RADIO FREE MANHATTAN", W / 2, H * 0.3);
      x.font = 'bold 46px "Arial Black", Impact, sans-serif';
      x.fillText("ON THE AIR · DAY & NIGHT", W / 2, H * 0.72);
      // missing letters / dead bulbs
      x.fillStyle = "rgba(120,110,90,0.8)";
      for (const px of [150, 610, 820]) x.fillRect(px, H * 0.55, 40, 60);
      K.stains(x, W, H, 8, 61, 0.3);
    });
    K.neon("rc_marquee", "RADIO CITY MUSIC HALL", 0xff3030, {
      font: 'bold 80px "Arial Black", Impact, sans-serif',
      h: 120,
    });
    K.interior("radio_city:neon"); // ON AIR, RADIO FREE MANHATTAN (booth) — 90_radio_city_interior.js
    K.neonDraw("rc_blade", 130, 90 * 10 + 40, (x, W, H) => {
      const text = "RADIO CITY",
        cc = "#ff3434";
      x.strokeStyle = cc;
      x.lineWidth = 6;
      x.shadowColor = cc;
      x.shadowBlur = 16;
      x.strokeRect(8, 8, W - 16, H - 16);
      x.font = 'bold 80px "Arial Black", Impact, sans-serif';
      x.textAlign = "center";
      x.textBaseline = "middle";
      for (let i = 0; i < text.length; i++) {
        if (text[i] === " ") continue;
        x.fillStyle = cc;
        x.shadowBlur = 22;
        x.fillText(text[i], W / 2, 62 + i * 90);
        x.shadowBlur = 0;
        x.fillStyle = "rgba(255,240,230,0.75)";
        x.fillText(text[i], W / 2, 62 + i * 90);
      }
    });
    K.interior("radio_city:paints"); // foyer mural + carpet
    K.paint("rc_roofsign", 1024, 256, (x, W, H) => {
      x.fillStyle = "#e8dcc0";
      x.fillRect(0, 0, W, H);
      x.fillStyle = "#b01a1a";
      x.font = 'bold 110px "Arial Black", Impact, sans-serif';
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.fillText("RADIO FREE", W / 2, H * 0.34);
      x.fillStyle = "#1a3a6a";
      x.fillText("MANHATTAN", W / 2, H * 0.76);
      x.strokeStyle = "#1a1a1a";
      x.lineWidth = 8;
      x.strokeRect(6, 6, W - 12, H - 12);
      K.stains(x, W, H, 14, 65, 0.4);
      K.streaks(x, W, H, 30, 66, 0.3);
    });
    K.interior("radio_city:records"); // DJ booth record crate
  }

  function build(rec) {
    const b = K.builder("rc_shell", { grime: 0.45 });
    const d = K.builder("rc_detail", { grime: 0.45 });
    const glows = K.glowSet("rc");
    const beacons = K.glowSet("rc_beacon");
    const flick2 = K.glowSet("rc_blade");
    const P = K.parts;
    b.burn(-20, 20, -328, 6, 0.5).burn(28, 3, -352, 5, 0.6);

    // ---- building shell (hollow foyer) with the famous rounded Sixth-Avenue corner ----
    const R = 4.5,
      CX = BLD.x1 - R,
      CZ = BLD.z1 - R; // corner radius / centre
    b.boxMM("fac_radio", BLD.x0, 0, BLD.z0, BLD.x1, BLD.h, BLD.z1, {
      faces: "nw",
    });
    b.boxMM("fac_radio", BLD.x0, 0, BLD.z1 - 0.01, CX, BLD.h, BLD.z1, {
      faces: "s",
    });
    b.cyl("fac_radio", CX, 0, CZ, R, R, BLD.h, 14, {
      arc0: -Math.PI / 2,
      arc: Math.PI / 2,
      top: false,
      rows: 4,
    });
    const outline = [
      [BLD.x0, BLD.z0],
      [BLD.x1, BLD.z0],
    ];
    for (let k = 0; k <= 8; k++) {
      const a = ((k / 8) * Math.PI) / 2;
      outline.push([CX + Math.cos(a) * R, CZ + Math.sin(a) * R]);
    }
    outline.push([BLD.x0, BLD.z1]);
    b.prism("fac_radio", outline, BLD.h - 0.01, BLD.h, {
      sides: false,
      grime: 0.4,
    });
    // east façade in pieces around the three foyer doors (z -343..-336)
    b.boxMM("fac_radio", BLD.x1 - 0.01, 0, BLD.z0, BLD.x1, BLD.h, -343, {
      faces: "e",
    });
    b.boxMM("fac_radio", BLD.x1 - 0.01, 0, -336, BLD.x1, BLD.h, CZ, {
      faces: "e",
    });
    b.boxMM("fac_radio", BLD.x1 - 0.01, 4.2, -343, BLD.x1, BLD.h, -336, {
      faces: "e",
    });
    // rear office slab
    b.boxMM("fac_radio", BLD.x0, BLD.h, BLD.z0, 0, 48, -341, {
      faces: "nsewt",
    });
    K.colBox(BLD.x0, BLD.h, BLD.z0, 0, 48, -341);
    b.boxMM("limestone", BLD.x0 - 0.3, 47.4, BLD.z0 - 0.3, 0.3, 48, -340.7, {
      faces: "nsewtb",
    });
    // roof cornice follows the curve
    const cornice = [
      [BLD.x0 - 0.3, BLD.z0 - 0.3],
      [BLD.x1 + 0.3, BLD.z0 - 0.3],
    ];
    for (let k = 0; k <= 8; k++) {
      const a = ((k / 8) * Math.PI) / 2;
      cornice.push([
        CX + Math.cos(a) * (R + 0.3),
        CZ + Math.sin(a) * (R + 0.3),
      ]);
    }
    cornice.push([BLD.x0 - 0.3, BLD.z1 + 0.3]);
    b.prism("limestone", cornice, BLD.h - 0.6, BLD.h, {
      bottom: true,
      grime: 0.5,
    });
    // a second limestone band just over the marquee ties the low block together
    const band = [
      [BLD.x0 - 0.2, BLD.z1 + 0.2],
      [CX, BLD.z1 + 0.2],
    ];
    for (let k = 0; k <= 8; k++) {
      const a = Math.PI / 2 - ((k / 8) * Math.PI) / 2;
      band.push([CX + Math.cos(a) * (R + 0.2), CZ + Math.sin(a) * (R + 0.2)]);
    }
    band.push([BLD.x1 + 0.2, BLD.z0 - 0.2]);
    /** Projecting strip along a polyline (outer face + soffit + top), depth = distance back to the wall. */
    const strip = (mat, poly, y0, h, depth, o) => {
      for (let i = 0; i < poly.length - 1; i++) {
        const a = poly[i],
          c = poly[i + 1];
        const L2 = Math.hypot(c[0] - a[0], c[1] - a[1]);
        if (L2 < 0.01) continue;
        const ux = (c[0] - a[0]) / L2,
          uz = (c[1] - a[1]) / L2,
          nx = -uz,
          nz = ux; // outward (south run travels +x → +z)
        const ia = [a[0] - nx * depth, a[1] - nz * depth],
          ic = [c[0] - nx * depth, c[1] - nz * depth];
        b.quad(
          mat,
          [a[0], y0, a[1]],
          [c[0], y0, c[1]],
          [c[0], y0 + h, c[1]],
          [a[0], y0 + h, a[1]],
          o,
        );
        b.quad(
          mat,
          [ia[0], y0, ia[1]],
          [ic[0], y0, ic[1]],
          [c[0], y0, c[1]],
          [a[0], y0, a[1]],
          o,
        );
        b.quad(
          mat,
          [a[0], y0 + h, a[1]],
          [c[0], y0 + h, c[1]],
          [ic[0], y0 + h, ic[1]],
          [ia[0], y0 + h, ia[1]],
          o,
        );
      }
    };
    strip("limestone_dark", band, 8.1, 0.55, 0.2, {
      grime: 0.5,
      rect: [0, 0, 1, 0.15],
    });
    // colliders around the foyer hollow
    K.colBox(BLD.x0, 0, BLD.z0, FOY.x0, BLD.h, BLD.z1);
    K.colBox(FOY.x0, 0, BLD.z0, BLD.x1, BLD.h, FOY.z0);
    K.colBox(FOY.x0, 0, FOY.z1, CX, BLD.h, BLD.z1);
    for (let k = 0; k < 4; k++) {
      const a = (((k + 0.5) / 4) * Math.PI) / 2;
      K.colRot(
        CX + Math.cos(a) * (R - 1.2),
        CZ + Math.sin(a) * (R - 1.2),
        2.4,
        2.4,
        0,
        BLD.h,
        -a,
      );
    }
    K.colBox(FOY.x0, FOY.h, FOY.z0, BLD.x1, BLD.h, FOY.z1);
    K.colBox(FOY.x1, 0, FOY.z0, BLD.x1, FOY.h, -343);
    K.colBox(FOY.x1, 0, -336, BLD.x1, FOY.h, FOY.z1);
    K.colBox(FOY.x1, 4.2, -343, BLD.x1, FOY.h, -336);
    // entrance recess + bronze doors
    b.boxMM("bronze", FOY.x1, 0, -343.05, BLD.x1, 4.2, -343, { faces: "s" });
    b.boxMM("bronze", FOY.x1, 0, -336, BLD.x1, 4.2, -335.95, { faces: "n" });
    b.boxMM("bronze", FOY.x1, 4.15, -343, BLD.x1, 4.2, -336, { faces: "b" });
    for (let z = -342.2; z < -336; z += 1.2)
      d.box("bronze", BLD.x1 - 0.2, 0, z, 0.1, 4.2, 0.1, {});

    // ---- ground floor: black-granite plinth, limestone piers + fascia, recessed bronze shopfronts ----
    K.shopfronts();
    const spill = K.spillSet("rc"),
      refl = K.reflSet("rc");
    const GY = 0.16;
    /** Shopfront run along a straight façade from A to B (outward normal n), bays of ~4.6 m. */
    const shopRun = (ax, az, bx, bz, nx, nz, variants) => {
      const L2 = Math.hypot(bx - ax, bz - az),
        dx = (bx - ax) / L2,
        dz = (bz - az) / L2,
        face = Math.atan2(nx, nz);
      const nb = Math.max(1, Math.round(L2 / 4.6)),
        bw = L2 / nb;
      const at = (t, o) => [ax + dx * t + nx * o, az + dz * t + nz * o];
      // plinth + fascia along the whole run
      let p = at(L2 / 2, 0.16);
      b.box("granite", p[0], 0, p[1], L2, 0.6, 0.32, {
        yaw: face,
        tint: 0x3a3836,
        grime: 0.3,
      });
      p = at(L2 / 2, 0.17);
      b.box("limestone", p[0], 4.0, p[1], L2, 0.85, 0.34, {
        yaw: face,
        grime: 0.45,
      });
      p = at(L2 / 2, 0.36);
      b.box("bronze", p[0], 4.0, p[1], L2, 0.08, 0.06, {
        yaw: face,
        grime: 0.2,
      });
      for (let i = 0; i <= nb; i++) {
        p = at(i * bw, 0.15);
        b.box("limestone", p[0], 0, p[1], 0.8, 4.0, 0.3, {
          yaw: face,
          grime: 0.45,
        });
      }
      p = at(L2 / 2, 0.17);
      K.colRot(p[0], p[1], L2, 0.34, 0, 4.85, face);
      for (let i = 0; i < nb; i++) {
        const v = variants[i % variants.length],
          c = at((i + 0.5) * bw, 0.03),
          w = bw - 0.8;
        d.panel("shopfront", c[0], 2.3, c[1], w, 3.4, face, {
          rect: K.shopRect(v),
        });
        const tr = at((i + 0.5) * bw, 0.06);
        d.box("bronze", tr[0], 0.6, tr[1], w, 0.08, 0.1, {
          yaw: face,
          grime: 0.2,
        });
        if (K.SHOP_LIT.indexOf(v) >= 0) {
          const q = at((i + 0.5) * bw, 2.2);
          spill.add(q[0], q[1], v === 6 ? 0x90ff90 : 0xffc070, 2.6, {
            y: GY,
            i: 0.4,
            sx: w * 0.55,
            sz: 2.2,
            yaw: face,
          });
          refl.add(
            c[0] + nx * 0.3,
            c[1] + nz * 0.3,
            2.2,
            v === 6 ? 0x90ff90 : 0xffc070,
            w * 0.7,
            { y: GY + 0.01, i: 0.45, len: 7 },
          );
        }
      }
    };
    shopRun(
      BLD.x0 + 0.5,
      BLD.z1,
      CX - 0.2,
      BLD.z1,
      0,
      1,
      [1, 0, 2, 4, 3, 5, 1, 7, 0, 4, 1],
    );
    shopRun(BLD.x1, BLD.z0 + 0.5, BLD.x1, -343.4, 1, 0, [4, 5, 1]);
    shopRun(BLD.x1, -335.6, BLD.x1, CZ - 0.2, 1, 0, [2]);
    // the corner itself: curved limestone pier band + plinth
    b.cyl("granite", CX, 0, CZ, R + 0.32, R + 0.32, 0.6, 12, {
      arc0: -Math.PI / 2,
      arc: Math.PI / 2,
      tint: 0x3a3836,
      grime: 0.3,
    });
    b.cyl("limestone", CX, 0.6, CZ, R + 0.3, R + 0.3, 4.25, 12, {
      arc0: -Math.PI / 2,
      arc: Math.PI / 2,
      grime: 0.45,
    });

    // ---- the marquee: a continuous lit band wrapping the rounded corner ----
    const my = 5.0,
      mh = 2.4,
      mo = 1.8; // bottom y, height, projection
    const board = K.paint("rc_board", 1024, 192);
    const neonR = K.atlases.neon.slots.rc_marquee.rect;
    const RM = R + mo; // marquee radius at the corner
    const ezA = -350.5,
      ezB = CZ; // east run (x = 28 + mo)
    const sxA = 4,
      sxB = CX; // south run (z = -328 + mo)
    // canopy boxes (fascia, top, soffit) along both runs + the curved corner
    b.boxMM(
      "metal_dark",
      BLD.x1,
      my - 0.25,
      ezA,
      BLD.x1 + mo,
      my + mh + 0.35,
      ezB,
      { faces: "ntbe", grime: 0.35 },
    );
    b.boxMM(
      "metal_dark",
      sxA,
      my - 0.25,
      BLD.z1,
      sxB,
      my + mh + 0.35,
      BLD.z1 + mo,
      { faces: "wtbs", grime: 0.35 },
    );
    b.cyl("metal_dark", CX, my - 0.25, CZ, RM, RM, mh + 0.6, 12, {
      arc0: -Math.PI / 2,
      arc: Math.PI / 2,
      grime: 0.35,
      top: false,
    });
    for (let k = 0; k < 12; k++) {
      const a0 = -Math.PI / 2 + ((k / 12) * Math.PI) / 2,
        a1 = -Math.PI / 2 + (((k + 1) / 12) * Math.PI) / 2;
      const Q = (a, rr, y) => [CX + Math.cos(a) * rr, y, CZ - Math.sin(a) * rr];
      b.quad(
        "metal_dark",
        Q(a0, R, my + mh + 0.35),
        Q(a0, RM, my + mh + 0.35),
        Q(a1, RM, my + mh + 0.35),
        Q(a1, R, my + mh + 0.35),
        { grime: 0.4 },
      );
      d.quad(
        "lit_warm",
        Q(a1, R + 0.3, my - 0.26),
        Q(a1, RM - 0.3, my - 0.26),
        Q(a0, RM - 0.3, my - 0.26),
        Q(a0, R + 0.3, my - 0.26),
        { tint: 0x9a8a6a },
      );
    }
    // lit letter boards on the runs + a curved lit board around the corner (sliced quads)
    const boards = (a, c, fixed, alongX) => {
      const n = Math.max(1, Math.round((c - a) / (mh * 0.6 * 5.3))),
        w = (c - a) / n;
      for (let i = 0; i < n; i++) {
        const m = a + w * (i + 0.5);
        if (alongX)
          d.panel(
            "atlas_paint_glow",
            m,
            my + mh * 0.36,
            fixed,
            w - 0.3,
            mh * 0.6,
            0,
            { rect: board },
          );
        else
          d.panel(
            "atlas_paint_glow",
            fixed,
            my + mh * 0.36,
            m,
            w - 0.3,
            mh * 0.6,
            Math.PI / 2,
            { rect: board },
          );
        if (i) {
          if (alongX)
            d.box(
              "metal_dark",
              a + w * i,
              my + 0.1,
              fixed - 0.05,
              0.25,
              mh * 0.6 + 0.1,
              0.1,
              {},
            );
          else
            d.box(
              "metal_dark",
              fixed - 0.05,
              my + 0.1,
              a + w * i,
              0.1,
              mh * 0.6 + 0.1,
              0.25,
              {},
            );
        }
      }
    };
    boards(ezA, ezB, BLD.x1 + mo + 0.02, false);
    boards(sxA, sxB, BLD.z1 + mo + 0.02, true);
    const cornerRect = K.paint("rc_corner", 512, 96, (x2, W, H2) => {
      const g2 = x2.createLinearGradient(0, 0, 0, H2);
      g2.addColorStop(0, "#f4ecd8");
      g2.addColorStop(1, "#d8cfb8");
      x2.fillStyle = g2;
      x2.fillRect(0, 0, W, H2);
      x2.fillStyle = "#b01a1a";
      x2.font = 'bold 50px "Arial Black", Impact, sans-serif';
      x2.textAlign = "center";
      x2.textBaseline = "middle";
      x2.fillText("★ 97.3 ★", W / 2, H2 / 2 + 2);
      K.stains(x2, W, H2, 4, 68, 0.3);
    });
    const SEG = 10;
    for (let k = 0; k < SEG; k++) {
      const a0 = -Math.PI / 2 + ((k / SEG) * Math.PI) / 2,
        a1 = -Math.PI / 2 + (((k + 1) / SEG) * Math.PI) / 2;
      // angle a → point (CX + cos a * r, CZ - sin a * r): a = -π/2 is due south (+z), a = 0 due east (+x)
      const P0 = (a, rr, y) => [
        CX + Math.cos(a) * rr,
        y,
        CZ - Math.sin(a) * rr,
      ];
      const u0 = cornerRect[0] + ((cornerRect[2] - cornerRect[0]) * k) / SEG,
        u1 = cornerRect[0] + ((cornerRect[2] - cornerRect[0]) * (k + 1)) / SEG;
      const r1 = RM + 0.02,
        yb = my + mh * 0.06,
        yt = my + mh * 0.66;
      d.quad(
        "atlas_paint_glow",
        P0(a0, r1, yb),
        P0(a1, r1, yb),
        P0(a1, r1, yt),
        P0(a0, r1, yt),
        { rect: [u0, cornerRect[1], u1, cornerRect[3]] },
      );
      // neon tube bands (top + bottom) and the red neon crown band follow the curve
      for (const yy of [my + 0.02, my + mh + 0.28])
        d.beam(
          "neon_tube",
          ...P0(a0, RM + 0.06, yy),
          ...P0(a1, RM + 0.06, yy),
          0.1,
          { tint: 0xffd060, grime: 0 },
        );
      d.beam(
        "neon_tube",
        ...P0(a0, RM + 0.06, my + mh * 0.84),
        ...P0(a1, RM + 0.06, my + mh * 0.84),
        0.14,
        { tint: 0xff3030, grime: 0 },
      );
    }
    const nsl = K.atlases.neon.slots.rc_marquee,
      nH = mh * 0.3,
      nW = Math.min(ezB - ezA - 1, (nH * nsl.w) / nsl.h);
    d.panel(
      "atlas_neon",
      BLD.x1 + mo + 0.05,
      my + mh * 0.84,
      (ezA + ezB) / 2,
      nW,
      nH,
      Math.PI / 2,
      { rect: neonR },
    );
    d.panel(
      "atlas_neon",
      (sxA + sxB) / 2,
      my + mh * 0.84,
      BLD.z1 + mo + 0.05,
      Math.min(sxB - sxA - 1, nW),
      nH,
      0,
      { rect: neonR },
    );
    for (const yy of [my + 0.02, my + mh + 0.28]) {
      d.beam(
        "neon_tube",
        BLD.x1 + mo + 0.06,
        yy,
        ezA,
        BLD.x1 + mo + 0.06,
        yy,
        ezB,
        0.1,
        { tint: 0xffd060, grime: 0 },
      );
      d.beam(
        "neon_tube",
        sxA,
        yy,
        BLD.z1 + mo + 0.06,
        sxB,
        yy,
        BLD.z1 + mo + 0.06,
        0.1,
        { tint: 0xffd060, grime: 0 },
      );
    }
    // warm-white lit soffit (the underside glows over the sidewalk) + chaser bulb rows top & bottom
    const chaseA = K.glowSet("rc_chaseA"),
      chaseB = K.glowSet("rc_chaseB");
    let bn = 0;
    const bulb = (x, y, z) => {
      const set = bn++ % 2 ? chaseA : chaseB;
      set.add(x, y, z, 0xffe0a0, "s");
      d.geo("lit_warm", K.T.sphereLo, { x, y, z, s: 0.075 });
    };
    d.boxMM(
      "lit_warm",
      BLD.x1 + 0.3,
      my - 0.27,
      ezA + 0.3,
      BLD.x1 + mo - 0.3,
      my - 0.26,
      ezB,
      { faces: "b", tint: 0x9a8a6a },
    );
    d.boxMM(
      "lit_warm",
      sxA + 0.3,
      my - 0.27,
      BLD.z1 + 0.3,
      sxB,
      my - 0.26,
      BLD.z1 + mo - 0.3,
      { faces: "b", tint: 0x9a8a6a },
    );
    // soffit cells: dark coffer grid over the lit underside
    for (let z = ezA + 1.2; z < ezB; z += 1.2)
      d.box(
        "metal_dark",
        BLD.x1 + mo / 2,
        my - 0.34,
        z,
        mo - 0.5,
        0.08,
        0.06,
        {},
      );
    for (let x = sxA + 1.2; x < sxB; x += 1.2)
      d.box(
        "metal_dark",
        x,
        my - 0.34,
        BLD.z1 + mo / 2,
        0.06,
        0.08,
        mo - 0.5,
        {},
      );
    for (let z = ezA + 0.4; z < ezB; z += 0.7) {
      bulb(BLD.x1 + mo - 0.18, my - 0.36, z);
      bulb(BLD.x1 + mo + 0.1, my + mh + 0.12, z);
    }
    for (let x = sxA + 0.4; x < sxB; x += 0.7) {
      bulb(x, my - 0.36, BLD.z1 + mo - 0.18);
      bulb(x, my + mh + 0.12, BLD.z1 + mo + 0.1);
    }
    for (let k = 0; k <= 12; k++) {
      const a = -Math.PI / 2 + ((k / 12) * Math.PI) / 2;
      bulb(
        CX + Math.cos(a) * (RM - 0.18),
        my - 0.36,
        CZ - Math.sin(a) * (RM - 0.18),
      );
      bulb(
        CX + Math.cos(a) * (RM + 0.1),
        my + mh + 0.12,
        CZ - Math.sin(a) * (RM + 0.1),
      );
    }
    // the marquee throws a long warm pool across the sidewalk (+ wet reflections of the band)
    for (let z = ezA + 2; z < ezB; z += 4) {
      spill.add(BLD.x1 + 1.6, z, 0xffd8a0, 3.4, { y: GY, i: 0.4 });
      refl.add(BLD.x1 + mo, z, my + mh * 0.5, 0xffe0b0, 3.2, {
        y: GY + 0.01,
        i: 0.35,
      });
    }
    for (let x = sxA + 2; x < sxB; x += 4) {
      spill.add(x, BLD.z1 + 1.6, 0xffd8a0, 3.4, { y: GY, i: 0.4 });
      refl.add(x, BLD.z1 + mo, my + mh * 0.5, 0xffe0b0, 3.2, {
        y: GY + 0.01,
        i: 0.35,
      });
    }
    spill.add(CX + (RM - 1) * 0.707, CZ + (RM - 1) * 0.707, 0xffd8a0, 4.2, {
      y: GY,
      i: 0.45,
    });

    // ---- the tall vertical RADIO CITY blade on the corner ----
    // it projects east over Sixth Avenue from the start of the curve, so it reads up and down the avenue
    const bh = 19,
      bw = (bh * 130) / 940,
      bdep = 1.1,
      BZ = CZ + 0.4,
      bOff = 0.3 + (bw + 0.35) / 2;
    const bx = BLD.x1 + bOff,
      bz = BZ,
      by0 = my + mh + 0.6;
    // box yaw π/4: local z (the long side, bw) runs out along the corner diagonal, local x (bdep) is the thickness
    d.box("metal_dark", bx, by0, bz, bdep, bh, bw + 0.35, {
      yaw: Math.PI / 2,
      grime: 0.3,
    });
    // stepped deco crown + base bracket back to the wall
    for (let k = 0; k < 3; k++)
      d.box(
        "metal_dark",
        bx,
        by0 + bh + k * 0.45,
        bz,
        bdep + 0.2 - k * 0.3,
        0.45,
        bw + 0.5 - k * 0.55,
        { yaw: Math.PI / 2, grime: 0.3 },
      );
    d.box("neon_tube", bx, by0 + bh + 1.35, bz, 0.12, 0.9, 0.12, {
      tint: 0xff3030,
      grime: 0,
    });
    for (const yy of [by0 + 1, by0 + bh * 0.5, by0 + bh - 1])
      d.beam("black_metal", BLD.x1, yy, BZ, BLD.x1 + 0.32, yy, BZ, 0.16);
    for (const sd of [1, -1]) {
      const nf = sd > 0 ? 0 : Math.PI; // faces look south / north along the avenue
      d.panel("atlas_neon", bx, by0 + bh / 2, bz, bw, bh - 0.2, nf, {
        rect: K.atlases.neon.slots.rc_blade.rect,
        off: bdep / 2 + 0.03,
      });
      const nx = Math.sin(nf),
        nz = Math.cos(nf);
      for (let y = by0 + 1.5; y < by0 + bh - 1; y += 2.6)
        flick2.add(bx + nx * 1.0, y, bz + nz * 1.0, 0xff4040, "m");
    }
    // bulb-studded leading edge (faces the street corner)
    for (let y = by0 + 0.3; y < by0 + bh - 0.2; y += 0.55) {
      const lx = bx + (bw + 0.35) / 2 + 0.06,
        lz = bz;
      const set = bn++ % 2 ? chaseA : chaseB;
      set.add(lx, y, lz, 0xffe0a0, "s");
      d.geo("lit_warm", K.T.sphereLo, { x: lx, y, z: lz, s: 0.08 });
    }
    spill.add(bx + 1.5, bz, 0xff4040, 6.5, { y: GY, i: 0.3 });
    refl.add(bx + 1.0, bz, by0 + bh * 0.5, 0xff4a4a, 1.8, {
      y: GY + 0.01,
      i: 0.55,
      len: 12,
    });

    // ---- rooftop broadcast mast + RFM sign ----
    const ax = 12,
      az = -344,
      ay = BLD.h,
      ah = 34;
    const legs = [0, 2.094, 4.189].map((a) => [Math.cos(a), Math.sin(a)]);
    for (const l of legs)
      d.beam(
        "paint_red",
        ax + l[0] * 2.4,
        ay,
        az + l[1] * 2.4,
        ax + l[0] * 0.35,
        ay + ah,
        az + l[1] * 0.35,
        0.16,
        { tint: 0xb03a2a },
      );
    for (let y = 2; y < ah; y += 2.2) {
      const s0 = 2.4 - (2.05 * y) / ah,
        s1 = 2.4 - (2.05 * (y + 2.2)) / ah;
      for (let k = 0; k < 3; k++) {
        const a = legs[k],
          c = legs[(k + 1) % 3];
        d.beam(
          y % 4.4 < 2.2 ? "paint_red" : "paint_white",
          ax + a[0] * s0,
          ay + y,
          az + a[1] * s0,
          ax + c[0] * s1,
          ay + y + 2.2,
          az + c[1] * s1,
          0.06,
          { tint: y % 4.4 < 2.2 ? 0xb03a2a : 0xe0dcd0 },
        );
      }
    }
    for (const l of legs) {
      d.cable(
        "black_metal",
        ax + l[0] * 0.8,
        ay + ah * 0.7,
        az + l[1] * 0.8,
        ax + l[0] * 11,
        ay + 0.2,
        az + l[1] * 11,
        0.6,
        0.03,
        8,
      );
    }
    d.geo("metal", K.T.sphere, {
      x: ax + 1.2,
      y: ay + 16,
      z: az + 1.2,
      sx: 1.4,
      sy: 0.5,
      sz: 1.4,
      rx: 1.1,
      ry: 0.8,
    });
    beacons.add(ax, ay + ah + 0.4, az, 0xff2010, "xl");
    beacons.add(ax, ay + ah * 0.55, az, 0xff2010, "l");
    K.colBox(ax - 2.5, ay, az - 2.5, ax + 2.5, ay + 4, az + 2.5);
    // sign on scaffold facing Sixth Avenue
    for (const z of [-352, -333])
      d.beam("rust", 22, ay, z, 22, ay + 7.5, z, 0.25);
    d.box("rust", 22, ay + 2, -342.5, 0.3, 0.2, 20, {});
    b.panel("atlas_paint", 22.2, ay + 5, -342.5, 18, 4.5, Math.PI / 2, {
      rect: K.paint("rc_roofsign", 1024, 256),
    });
    b.panel("atlas_paint", 21.8, ay + 5, -342.5, 18, 4.5, -Math.PI / 2, {
      rect: K.paint("rc_roofsign", 1024, 256),
    });
    // generator + cables from the roof down to the booth
    d.box("paint_yellow", 5, ay, -350, 3, 1.8, 1.8, { tint: 0xa88a30 });
    d.cyl("rust", 4.2, ay + 1.8, -350, 0.15, 0.15, 1.5, 6, {});
    K.smoke(4.2, ay + 3.5, -350, 0.4);

    // ---- Grand Foyer + DJ booth: 90_radio_city_interior.js ----
    K.interior("radio_city", { rec, b, d, glows, P, FOY, MEZ });

    // ---- street: settler checkpoint under the marquee ----
    P.sandbags(d, 30.5, -350, 30.5, -345, 4, { seed: 72 });
    P.sandbags(d, 30.5, -334, 30.5, -330, 4, { seed: 73 });
    P.barrel(d, 29.3, 0, -346.5, "fire", { glows, collide: true });
    for (const lp of [
      [29.4, -352],
      [29.4, -330.2],
    ])
      P.lampPost(d, glows, lp[0], lp[1], 4.2, {});

    // ---- anchors ----
    rec.anchor("entrance", 31.5, 0, -339.5, -Math.PI / 2);
    rec.anchor("door", 28.5, 0, -339.5, -Math.PI / 2);
    rec.anchor("guard1", 30, 0, -343.3, -Math.PI / 2);
    rec.anchor("guard2", 30, 0, -335.7, -Math.PI / 2);
    rec.anchor("antenna", ax, ay, az + 3, 0);
    rec.anchor("generator", 5, ay, -348.5, 0);
    rec.anchor("rooftop", 18, ay, -338, 0);

    b.finish(rec.root);
    d.finish(rec.root, { lod: 260 });
    glows.finish(rec.root, { dayOpacity: 0.55 });
    flick2.finish(rec.root, {
      dayOpacity: 0.1,
      nightOpacity: 0.85,
      flicker: 0.12,
    });
    spill.finish(rec.root, { day: 0.06, night: 1 });
    refl.finish(rec.root, { day: 0.04, night: 0.9 });
    const chase = [
      chaseA.finish(rec.root, { dayOpacity: 0.45, nightOpacity: 1 }),
      chaseB.finish(rec.root, { dayOpacity: 0.45, nightOpacity: 1 }),
    ];
    const cm = chase.map((g2) => {
      const a = [];
      g2.traverse((o) => {
        if (o.material) a.push(o.material);
      });
      return a;
    });
    // marquee chaser: the two bulb sets swap every 0.35 s (runs after K.updateGlows has set the base opacity)
    K.animate((dt, t) => {
      const ph = Math.floor(t / 0.35) % 2;
      cm[0].forEach((m) => {
        m.opacity *= ph ? 1 : 0.25;
      });
      cm[1].forEach((m) => {
        m.opacity *= ph ? 0.25 : 1;
      });
    });
    const bg = beacons.finish(rec.root, { dayOpacity: 0.6, beacon: true });
    const bm = [];
    bg.traverse((o) => {
      if (o.material) bm.push(o.material);
    });
    K.animate((dt, t, night) => {
      const on = t % 2 < 1;
      for (const m of bm) m.opacity = on ? 0.6 + 0.4 * night : 0.05;
    });
  }

  K.defineSite("radio_city", 90, function () {
    textures();
    build(K.record("radio_city"));
  });
})();
