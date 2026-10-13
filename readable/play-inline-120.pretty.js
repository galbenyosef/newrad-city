/* src/landmarks_a/50_un_hq.js */
/* =====================================================================
 * NEW RAD CITY — landmarks_a / 50_un_hq.js
 * UNITED NATIONS HEADQUARTERS → a Continuity forward outpost.
 * The Secretariat slab (blue-green glass curtain walls, white marble
 * ends, dark mechanical bands), the concave General Assembly hall with
 * its shallow dome, the low conference wing on the river, the long row
 * of flag poles (old-world member flags, several replaced by Continuity
 * colours), the knotted-revolver sculpture, a dry fountain — and the
 * Continuity's occupation: a giant banner down the slab, prefab huts,
 * black barrier walls with a humming force-field gate, turrets,
 * searchlights and a rooftop comms array with blinking beacons.
 * Footprint: x 292..334, z -361..-279.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !THREE || !G.LMA) return;
  const K = G.LMA.kit;

  const SEC = { x0: 314, x1: 325, z0: -352, z1: -320, h: 80 };

  function textures() {
    K.facade("fac_un_glass", {
      bays: 12,
      floors: 12,
      bayW: 1.6,
      floorH: 3.3,
      wall: "#9aa4a2",
      glass: "#4a8480",
      frame: "#b8c2c0",
      blocks: false,
      win: { x0: 0.07, x1: 0.93, y0: 0.08, y1: 0.95 },
      broken: 0.2,
      boarded: 0.0,
      mullions: 0,
      transom: false,
      seed: 1952,
      deco: (x, W, H, fy, y0, fh) => {
        x.fillStyle = "rgba(40,70,70,0.35)";
        x.fillRect(0, y0 + fh * 0.9, W, fh * 0.1);
      },
    });
    K.paint("continuity_banner", 256, 768, (x, W, H) => {
      x.fillStyle = "#16181c";
      x.fillRect(0, 0, W, H);
      x.fillStyle = "#a01c26";
      x.fillRect(0, 0, W, 26);
      x.fillRect(0, H - 26, W, 26);
      // the Continuity's seal: a gold ring round a single white star, the motto, and the year they still live in
      x.strokeStyle = "#d8b040";
      x.lineWidth = 10;
      x.beginPath();
      x.arc(W / 2, H * 0.3, 92, 0, 7);
      x.stroke();
      x.lineWidth = 3;
      x.beginPath();
      x.arc(W / 2, H * 0.3, 76, 0, 7);
      x.stroke();
      K.star(x, W / 2, H * 0.3, 56, 22, "#e8e4d8");
      x.fillStyle = "#e8e4d8";
      x.font = "bold 30px Georgia, serif";
      x.textAlign = "center";
      x.fillText("ORDER", W / 2, H * 0.5);
      x.fillText("ENDURES", W / 2, H * 0.55);
      x.fillStyle = "#d8b040";
      x.font = "bold 64px Georgia, serif";
      x.fillText("1967", W / 2, H * 0.66);
      for (let i = 0; i < 3; i++) {
        x.fillStyle = i % 2 ? "#e8e4d8" : "#a01c26";
        x.fillRect(30, H * 0.72 + i * 34, W - 60, 24);
      }
      K.streaks(x, W, H, 20, 5, 0.2);
    });
    K.paint("un_sign", 1024, 128, (x, W, H) =>
      K.signText(x, W, H, "UNITED NATIONS", {
        bg: "#dfe4e6",
        fg: "#3a6a9a",
        size: 80,
        spacing: 12,
        font: "Georgia, serif",
      }),
    );
    K.paint("continuity_warn", 512, 128, (x, W, H) => {
      K.signText(x, W, H, "RESTRICTED — CONTINUITY", {
        bg: "#16181c",
        fg: "#e8e4d8",
        size: 50,
        border: "#a01c26",
      });
    });
    // force-field (additive animated)
    const c = K.canvas(128, 256),
      x = c.getContext("2d");
    const g = x.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, "rgba(90,170,255,0.1)");
    g.addColorStop(0.5, "rgba(90,170,255,0.45)");
    g.addColorStop(1, "rgba(90,170,255,0.1)");
    x.fillStyle = g;
    x.fillRect(0, 0, 128, 256);
    x.strokeStyle = "rgba(160,220,255,0.6)";
    x.lineWidth = 1.5;
    for (let i = 0; i < 256; i += 8) {
      x.beginPath();
      x.moveTo(0, i);
      x.lineTo(128, i + 16);
      x.stroke();
    }
    const t = K.texFromCanvas(c);
    K.ffTex = t;
    K.defineMat("force_field", {
      basic: true,
      map: t,
      color: 0x7ab8ff,
      transparent: true,
      additive: true,
      side: THREE.DoubleSide,
      toneMapped: false,
      noShadow: true,
    });
  }

  function build(rec) {
    const b = K.builder("un_shell", { grime: 0.4 });
    const d = K.builder("un_detail", { grime: 0.45 });
    const glows = K.glowSet("un");
    const beacons = K.glowSet("un_beacon");
    const P = K.parts;
    b.burn(318, 70, -320, 8, 0.6)
      .burn(325, 30, -345, 6, 0.5)
      .burn(300, 2, -300, 5, 0.5);

    // plaza paving
    b.boxMM("paving", 292, -0.2, -358, 334, 0.05, -282, {
      faces: "t",
      grime: 0.45,
      tint: 0xd8d4c8,
    });

    // ---- Secretariat slab ----
    b.boxMM("fac_un_glass", SEC.x0, 4, SEC.z0, SEC.x1, SEC.h, SEC.z1, {
      faces: "ew",
    });
    b.boxMM(
      "marble",
      SEC.x0 - 0.3,
      0,
      SEC.z0 - 0.3,
      SEC.x1 + 0.3,
      SEC.h + 1.5,
      SEC.z0 + 0.4,
      { faces: "nsewt", tint: 0xe8e6e0, grime: 0.55 },
    );
    b.boxMM(
      "marble",
      SEC.x0 - 0.3,
      0,
      SEC.z1 - 0.4,
      SEC.x1 + 0.3,
      SEC.h + 1.5,
      SEC.z1 + 0.3,
      { faces: "nsewt", tint: 0xe8e6e0, grime: 0.55 },
    );
    b.boxMM("concrete", SEC.x0, SEC.h, SEC.z0, SEC.x1, SEC.h + 0.6, SEC.z1, {
      faces: "t",
    });
    K.colBox(
      SEC.x0 - 0.3,
      0,
      SEC.z0 - 0.3,
      SEC.x1 + 0.3,
      SEC.h + 1.5,
      SEC.z1 + 0.3,
    );
    // mechanical bands (dark louvres)
    for (const y of [26, 52, 76])
      b.boxMM(
        "black_metal",
        SEC.x0 - 0.15,
        y,
        SEC.z0 + 0.4,
        SEC.x1 + 0.15,
        y + (y === 76 ? 4 : 2.2),
        SEC.z1 - 0.4,
        { faces: "ew", grime: 0.3 },
      );
    // recessed ground-floor lobby with pilotis
    b.boxMM(
      "glass",
      SEC.x0 + 1.5,
      0,
      SEC.z0 + 0.4,
      SEC.x0 + 1.51,
      4,
      SEC.z1 - 0.4,
      { faces: "w" },
    );
    b.boxMM(
      "glass",
      SEC.x1 - 1.51,
      0,
      SEC.z0 + 0.4,
      SEC.x1 - 1.5,
      4,
      SEC.z1 - 0.4,
      { faces: "e" },
    );
    b.boxMM("concrete", SEC.x0, 3.9, SEC.z0, SEC.x1, 4.05, SEC.z1, {
      faces: "b",
    });
    for (let z = SEC.z0 + 3; z < SEC.z1 - 1; z += 4)
      for (const x of [SEC.x0 + 0.5, SEC.x1 - 0.5])
        b.box("concrete", x, 0, z, 0.7, 4, 0.7, { grime: 0.5 });
    b.panel(
      "atlas_paint",
      SEC.x0 + 1.52,
      3.2,
      (SEC.z0 + SEC.z1) / 2,
      10,
      1.25,
      -Math.PI / 2,
      { rect: K.paint("un_sign", 1024, 128) },
    );
    // blast damage: missing glass patch + girders on the west face
    b.boxMM("concrete_dark", SEC.x0 - 0.02, 58, -335, SEC.x0, 66, -328, {
      faces: "w",
      tint: 0x333333,
    });
    for (let k = 0; k < 5; k++)
      d.beam(
        "rust",
        SEC.x0,
        58 + k * 1.8,
        -334 + k,
        SEC.x0 - 2.5 - k * 0.3,
        57 + k * 1.6,
        -333 + k * 1.3,
        0.2,
      );
    K.smoke(SEC.x0 - 1, 64, -331, 1.0);
    // Continuity banner down the west glass face
    b.panel("atlas_paint", SEC.x0 - 0.35, 56, -343, 9, 27, -Math.PI / 2, {
      rect: K.paint("continuity_banner", 256, 768),
    });
    d.beam(
      "black_metal",
      SEC.x0 - 0.4,
      69.7,
      -348,
      SEC.x0 - 0.4,
      69.7,
      -338,
      0.2,
    );
    // rooftop comms array
    const rx = (SEC.x0 + SEC.x1) / 2,
      rz = -336;
    for (let k = 0; k < 3; k++) {
      const a = k * 2.094;
      d.beam(
        "black_metal",
        rx + Math.cos(a) * 2,
        SEC.h + 0.6,
        rz + Math.sin(a) * 2,
        rx,
        SEC.h + 22,
        rz,
        0.18,
      );
    }
    for (let y = SEC.h + 3; y < SEC.h + 20; y += 3) {
      const s = 2 * (1 - (y - SEC.h) / 22);
      for (let k = 0; k < 3; k++) {
        const a = k * 2.094,
          a2 = a + 2.094;
        d.beam(
          "black_metal",
          rx + Math.cos(a) * s,
          y,
          rz + Math.sin(a) * s,
          rx + Math.cos(a2) * s,
          y,
          rz + Math.sin(a2) * s,
          0.07,
        );
      }
    }
    d.geo("metal", K.T.sphere, {
      x: rx + 2,
      y: SEC.h + 3.2,
      z: -326,
      sx: 2.2,
      sy: 1.0,
      sz: 2.2,
      ry: 0.4,
      rx: -0.6,
    });
    d.beam(
      "metal_dark",
      rx + 2,
      SEC.h + 0.6,
      -326,
      rx + 2,
      SEC.h + 3,
      -326,
      0.3,
    );
    beacons.add(rx, SEC.h + 22.3, rz, 0xff2010, "xl");
    beacons.add(rx, SEC.h + 12, rz, 0xff2010, "l");
    beacons.add(SEC.x0, SEC.h + 1.8, SEC.z0, 0xff2010, "l");
    beacons.add(SEC.x1, SEC.h + 1.8, SEC.z1, 0xff2010, "l");

    // ---- conference wing (river side) ----
    b.boxMM("fac_un_glass", SEC.x1 + 0.3, 0, -350, 334, 8, -322, {
      faces: "nset",
    });
    b.boxMM("concrete", SEC.x1 + 0.3, 8, -350.2, 334.2, 8.6, -321.8, {
      faces: "nsewt",
    });
    K.colBox(SEC.x1, 0, -350, 334, 8.6, -322);

    // ---- General Assembly (concave sides, shallow dome) ----
    const ga = [];
    const n = 10;
    for (let i = 0; i <= n; i++) {
      const t = i / n,
        z = -312 + 26 * t;
      ga.push([299 + 3.2 * Math.sin(Math.PI * t) - (1 - t) * 1.5, z]);
    }
    for (let i = n; i >= 0; i--) {
      const t = i / n,
        z = -312 + 26 * t;
      ga.push([329 - 3.2 * Math.sin(Math.PI * t) + (1 - t) * 1.5, z]);
    }
    b.prism("marble", ga, 0, 12, { tint: 0xe4e2dc, grime: 0.55, top: false });
    // swooping roof: rises from 12 m (south) to 21 m (north entrance); side walls follow the curve
    {
      const nS = ga.length / 2;
      for (let i = 0; i < nS - 1; i++) {
        const w0 = ga[i],
          w1 = ga[i + 1],
          e0 = ga[ga.length - 1 - i],
          e1 = ga[ga.length - 2 - i];
        const h0 = 12 + 9 * Math.pow((-286 - w0[1]) / 26, 1.6),
          h1 = 12 + 9 * Math.pow((-286 - w1[1]) / 26, 1.6);
        // roof strip
        b.quad(
          "concrete",
          [w0[0] - 0.4, h0, w0[1]],
          [e0[0] + 0.4, h0, e0[1]],
          [e1[0] + 0.4, h1, e1[1]],
          [w1[0] - 0.4, h1, w1[1]],
          { rect: [0, 0, 3, 1], grime: 0.5 },
        );
        b.quad(
          "concrete",
          [w1[0] - 0.4, h1, w1[1]],
          [e1[0] + 0.4, h1, e1[1]],
          [e0[0] + 0.4, h0, e0[1]],
          [w0[0] - 0.4, h0, w0[1]],
          { rect: [0, 0, 3, 1], grime: 0.5 },
        );
        // upper side walls (marble) between 12 m and the roof line
        b.quad(
          "marble",
          [w1[0], 12, w1[1]],
          [w0[0], 12, w0[1]],
          [w0[0], h0, w0[1]],
          [w1[0], h1, w1[1]],
          {
            rect: [0, 0, 2, (h0 - 12) / 3],
            tint: 0xe4e2dc,
            grime: 0.4,
            double: true,
          },
        );
        b.quad(
          "marble",
          [e0[0], 12, e0[1]],
          [e1[0], 12, e1[1]],
          [e1[0], h1, e1[1]],
          [e0[0], h0, e0[1]],
          {
            rect: [0, 0, 2, (h0 - 12) / 3],
            tint: 0xe4e2dc,
            grime: 0.4,
            double: true,
          },
        );
      }
    }
    b.boxMM("marble", 299.5, 12, -287, 328.5, 12.05, -286, {
      faces: "t",
      tint: 0xe4e2dc,
    });
    // curtain-glass entrance on the north end
    b.boxMM("glass", 301.5, 0, -312.3, 326.5, 20.5, -312.2, { faces: "n" });
    b.boxMM("marble", 297.3, 12, -312.35, 301.5, 21, -312.25, {
      faces: "n",
      tint: 0xe4e2dc,
    });
    b.boxMM("marble", 326.5, 12, -312.35, 330.7, 21, -312.25, {
      faces: "n",
      tint: 0xe4e2dc,
    });
    b.boxMM("marble", 297.3, 20.5, -312.4, 330.7, 21.2, -312.2, {
      faces: "nt",
      tint: 0xe4e2dc,
    });
    for (let x = 302; x <= 326; x += 2.2)
      d.box("metal", x, 0, -312.45, 0.15, 20.5, 0.15, {});
    for (let y = 3; y < 20.5; y += 3)
      d.boxMM("metal", 301.5, y, -312.55, 326.5, y + 0.15, -312.4, {});
    b.cyl("concrete", 314, 14.2, -298, 6.2, 5.8, 3.2, 20, {
      top: false,
      grime: 0.5,
    });
    b.geo(
      "verdigris",
      new THREE.SphereGeometry(6.4, 20, 6, 0, Math.PI * 2, 0, Math.PI * 0.32),
      { x: 314, y: 14.6, z: -298, sy: 0.9, grime: 0.4 },
    );
    // GA colliders (per-edge walls)
    for (let i = 0; i < ga.length; i++) {
      const a = ga[i],
        c = ga[(i + 1) % ga.length];
      K.colWall(a[0], a[1], c[0], c[1], 1.0, 0, 21, []);
    }
    K.colBox(303, 0, -310, 325, 16, -288);

    // ---- flag row along First Avenue ----
    const nations = [];
    for (let i = 0; i < 10; i++) nations.push(K.flag("nation" + i, null));
    const encl = K.flag("continuity", null),
      unf = K.flag("un", null);
    let fi = 0;
    for (let z = -355; z <= -284; z += 3.4) {
      const rect =
        fi % 4 === 1
          ? encl
          : fi === 10
            ? unf
            : (fi * 7) % 5 === 0
              ? null
              : nations[fi % 10];
      P.flagpole(d, 294.3, z, 9.5, rect, Math.PI, { w: 2.6, h: 1.3 });
      fi++;
    }

    // ---- the knotted revolver sculpture on its plinth ----
    const kx = 304,
      kz = -317.5;
    d.box("granite", kx, 0, kz, 3.4, 1.2, 1.8, { tint: 0x5a5a5a });
    d.box("bronze", kx - 0.7, 1.2, kz, 1.6, 1.3, 0.55, { grime: 0.3 }); // frame / cylinder block
    d.cyl("bronze", kx - 0.7, 1.35, kz, 0.5, 0.5, 0.5, 12, { grime: 0.2 });
    d.geo("bronze", K.T.box, {
      x: kx - 1.6,
      y: 1.5,
      z: kz,
      rz: -0.5,
      sx: 0.5,
      sy: 1.4,
      sz: 0.5,
    }); // grip
    d.geo("bronze", K.T.cyl12, {
      x: kx + 0.4,
      y: 2.15,
      z: kz,
      rz: Math.PI / 2,
      sx: 0.28,
      sy: 1.2,
      sz: 0.28,
    });
    d.geo("bronze", new THREE.TorusKnotGeometry(0.5, 0.2, 48, 8, 2, 3), {
      x: kx + 1.45,
      y: 2.2,
      z: kz,
      ry: Math.PI / 2,
      s: 1.0,
    });
    d.geo("bronze", K.T.cyl12, {
      x: kx + 2.3,
      y: 2.35,
      z: kz,
      rz: Math.PI / 2 - 0.3,
      sx: 0.26,
      sy: 0.7,
      sz: 0.26,
    });
    K.colBox(kx - 1.7, 0, kz - 0.9, kx + 1.7, 1.2, kz + 0.9);

    // ---- dry fountain in front of the Secretariat ----
    const fx = 304.5,
      fz = -337;
    d.cyl("granite", fx, 0, fz, 6, 6, 0.7, 24, { top: false, tint: 0x8a8a88 });
    d.cyl("granite", fx, 0, fz, 5.6, 5.6, 0.25, 24, { tint: 0x5a564e });
    d.cyl("granite", fx, 0, fz, 0.8, 0.6, 2.2, 10, {});
    d.geo("bronze", K.T.sphere, { x: fx, y: 3.2, z: fz, s: 1.1 });
    d.geo("bronze", K.T.torus, { x: fx, y: 3.2, z: fz, rx: 0.7, s: 1.5 });
    for (let k = 0; k < 12; k++) {
      const a = (k * Math.PI) / 6,
        a2 = a + Math.PI / 6;
      K.colWall(
        fx + Math.cos(a) * 6,
        fz + Math.sin(a) * 6,
        fx + Math.cos(a2) * 6,
        fz + Math.sin(a2) * 6,
        0.4,
        0,
        0.7,
        [],
      );
    }
    P.skeleton(d, fx + 2, 0.26, fz + 1, 1.2);

    // ================= Continuity occupation =================
    // barrier walls (black panels, red stripe) with a force-field gate on the south approach
    const barrier = (ax, az, bx, bz) => {
      const L = Math.hypot(bx - ax, bz - az),
        dx = (bx - ax) / L,
        dz = (bz - az) / L,
        yaw = Math.atan2(dx, dz) + Math.PI / 2;
      for (let t = 0; t < L - 0.2; t += 2.2) {
        const w = Math.min(2.1, L - t),
          cx = ax + dx * (t + w / 2),
          cz = az + dz * (t + w / 2);
        d.box("black_metal", cx, 0, cz, w, 3.2, 0.5, { yaw, grime: 0.3 });
        d.box("paint_red", cx, 2.6, cz, w + 0.01, 0.2, 0.52, {
          yaw,
          tint: 0xa01c26,
          grime: 0.2,
        });
        d.box("lit_red", cx, 3.05, cz, 0.12, 0.12, 0.54, { yaw });
      }
      K.colRot(
        (ax + bx) / 2,
        (az + bz) / 2,
        L,
        0.5,
        0,
        3.2,
        -Math.atan2(bz - az, bx - ax),
        { surface: "metal", tag: "cover" },
      );
    };
    barrier(292.5, -283, 305.5, -283);
    barrier(310.5, -283, 333.5, -283);
    // gate pylons + force field
    for (const gx of [305.8, 310.2]) {
      d.box("black_metal", gx, 0, -283, 0.8, 4.2, 0.8, { grime: 0.3 });
      d.geo("lit_red", K.T.sphereLo, { x: gx, y: 4.4, z: -283, s: 0.2 });
      beacons.add(gx, 4.4, -283, 0xff3020, "m");
    }
    d.panel("force_field", 308, 1.9, -283, 3.6, 3.8, 0, {
      double: true,
      rect: [0, 0, 1, 1],
    });
    K.colBox(306.2, 0, -283.3, 309.8, 3.8, -282.7, {
      surface: "metal",
      tag: "forcefield",
    });
    rec.forceField = { x: 308, z: -283 };
    d.panel("atlas_paint", 300, 2.2, -282.7, 3.6, 0.9, 0, {
      rect: K.paint("continuity_warn", 512, 128),
    });
    // prefab huts (half-cylinder quonsets)
    const hut = new THREE.CylinderGeometry(
      2.4,
      2.4,
      6,
      12,
      1,
      false,
      0,
      Math.PI,
    );
    for (const h of [
      [299, -355, 0],
      [306, -355, 0],
      [331, -355, Math.PI / 2],
    ]) {
      d.geo("black_metal", hut, {
        x: h[0],
        y: 0,
        z: h[1],
        rz: Math.PI / 2,
        ry: h[2] + Math.PI / 2,
        grime: 0.4,
      });
      const ex = h[0] + Math.sin(h[2]) * 3.02,
        ez = h[1] + Math.cos(h[2]) * 3.02;
      d.box("paint_red", ex, 0, ez, 1.4, 2.0, 0.08, {
        yaw: h[2],
        tint: 0x6a1a20,
      });
      d.box("lit_red", ex, 2.1, ez, 0.3, 0.12, 0.1, { yaw: h[2] });
      K.colRot(h[0], h[1], 4.8, 6, 0, 2.4, h[2], { surface: "metal" });
    }
    hut.dispose();
    // turrets, searchlights, crates, the Sky-Eye drone dock
    K.staticTurret(rec, "turret1", 303, 0, -286, 0, { bodyMat: "black_metal" });
    K.staticTurret(rec, "turret2", 330, 0, -286, 0, { bodyMat: "black_metal" });
    P.searchlight(d, glows, 296, 0, -287, 0.6, 0.4);
    P.searchlight(d, glows, 332, 8.6, -324, -0.6, 0.3);
    for (const c of [
      [298, -330],
      [298.8, -331.1],
      [309, -350],
      [310, -349.2],
      [322, -284.5],
    ]) {
      d.box("black_metal", c[0], 0, c[1], 1.2, 0.8, 0.9, {
        yaw: c[0],
        tint: 0x3a3e40,
      });
      d.box("paint_red", c[0], 0.8, c[1], 1.22, 0.06, 0.2, {
        yaw: c[0],
        tint: 0xa01c26,
      });
    }
    d.cyl("black_metal", 327, 0, -300, 0.6, 0.8, 1.6, 10, {});
    d.geo("chrome", K.T.sphere, { x: 327, y: 2.4, z: -300, s: 0.6 });
    for (const lp of [
      [297, -305],
      [297, -330],
      [311, -318],
      [331, -318],
    ])
      P.lampPost(d, glows, lp[0], lp[1], 5.5, { color: 0xd8e8ff });
    P.car(d, 288, -300, 0.1, { seed: 51, tint: 0x2a2a2a });
    P.car(d, 286, -344, 2.9, { seed: 52 });
    P.rubblePile(d, 318, -318, 2.5, 1.3, { seed: 53 });
    // ---- ruin detail: the curtain wall that fell out of the blast patch, a collapsed loggia bay, dead planters, executions ----
    {
      const r = K.rng(5401);
      for (let k = 0; k < 7; k++)
        d.geo("concrete_dark", K.T.box, {
          x: 309 + r() * 4.2,
          y: 0.25,
          z: -330 + r() * 8,
          ry: r() * 3,
          rz: (r() - 0.5) * 0.5,
          rx: (r() - 0.5) * 0.3,
          sx: 1.2 + r() * 2.2,
          sy: 0.35,
          sz: 0.8 + r() * 1.4,
          grime: 0.8,
        });
      for (let k = 0; k < 6; k++) {
        const x = 308.5 + r() * 5,
          z = -331 + r() * 9,
          a = r() * 3;
        d.beam(
          "chrome",
          x,
          0.12,
          z,
          x + Math.cos(a) * (2 + r() * 3),
          0.1 + r() * 0.8,
          z + Math.sin(a) * (2 + r() * 3),
          0.1,
          { grime: 0.6 },
        );
      }
      for (let k = 0; k < 40; k++)
        d.box(
          k % 3 ? "glass" : "glass_broken",
          307.5 + r() * 6.5,
          0.02,
          -332 + r() * 11,
          0.2 + r() * 0.5,
          0.02,
          0.15 + r() * 0.4,
          { yaw: r() * 3 },
        );
      for (let k = 0; k < 3; k++) {
        const q = [
          [309.5, -327.5],
          [312.2, -323.4],
          [310.6, -330.2],
        ][k];
        d.geo("glass", K.T.box, {
          x: q[0],
          y: 0.9,
          z: q[1],
          ry: r() * 3,
          rx: 0.9 + r() * 0.4,
          sx: 1.4,
          sy: 2.2,
          sz: 0.06,
        });
        d.geo("black_metal", K.T.box, {
          x: q[0],
          y: 0.9,
          z: q[1],
          ry: r() * 3,
          rx: 1.0,
          sx: 1.5,
          sy: 0.08,
          sz: 0.1,
        });
      }
      P.rubblePile(d, 311.2, -326.0, 2.2, 1.1, { seed: 54, collide: true });
      P.rubblePile(d, 309.0, -321.8, 1.4, 0.7, { seed: 55 });
      // a loggia bay has come down: the ceiling slab hangs from the last column to the ground, a column lies broken
      d.geo("concrete", K.T.box, {
        x: SEC.x0 + 1.6,
        y: 2.0,
        z: -346.0,
        rz: 0.55,
        sx: 4.2,
        sy: 0.35,
        sz: 3.8,
        grime: 0.8,
      });
      d.geo("concrete", K.T.cyl8 || K.T.box, {
        x: SEC.x0 - 1.4,
        y: 0.35,
        z: -343.0,
        rz: Math.PI / 2,
        ry: 0.4,
        sx: 0.35,
        sy: 3.4,
        sz: 0.35,
        grime: 0.8,
      });
      P.rubblePile(d, SEC.x0 + 0.6, -345.0, 1.6, 0.9, {
        seed: 56,
        collide: true,
      });
      d.beam(
        "rust",
        SEC.x0 + 0.4,
        3.9,
        -347.4,
        SEC.x0 - 1.2,
        0.2,
        -348.6,
        0.12,
      );
      // dead plane trees in granite planters along the flag walk, weeds breaking through the plaza
      for (const t of [
        [301.0, -297.0],
        [301.0, -310.5],
        [300.5, -343.5],
        [324.5, -296.0],
      ]) {
        d.box("granite", t[0], 0, t[1], 2.4, 0.6, 2.4, {
          tint: 0x7a7a76,
          grime: 0.7,
        });
        d.box("concrete_dark", t[0], 0.6, t[1], 2.1, 0.02, 2.1, {
          tint: 0x5a4a38,
          grime: 0.4,
        });
        K.colBox(t[0] - 1.2, 0, t[1] - 1.2, t[0] + 1.2, 0.6, t[1] + 1.2, {
          surface: "concrete",
        });
        P.deadTree(d, t[0], t[1], 6 + (t[1] % 3), {
          y: 0.6,
          seed: Math.round(-t[1]),
        });
      }
      for (let k = 0; k < 26; k++) {
        const x = 296 + r() * 32,
          z = -356 + r() * 70;
        if (x > SEC.x0 - 1 && x < SEC.x1 + 1 && z < SEC.z1 + 1) continue;
        d.geo("paint_green", K.T.cone8, {
          x,
          y: 0,
          z,
          sx: 0.2 + r() * 0.25,
          sy: 0.3 + r() * 0.4,
          sz: 0.2 + r() * 0.25,
          tint: 0x8a9a4a,
          grime: 0.3,
        });
      }
      // the Continuity's justice: two bodies against the barrier under a stencilled warning
      P.skeleton(d, 318.5, 0.02, -284.2, 0.2);
      P.skeleton(d, 320.2, 0.02, -284.4, -0.3);
      d.panel("atlas_paint", 319.4, 2.0, -283.28, 3.6, 0.9, Math.PI, {
        rect: K.paint("continuity_warn", 512, 128),
      });
    }

    // ---- anchors ----
    rec.anchor("entrance", 308, 0, -279.5, Math.PI);
    // door PLANE on the General Assembly's north glass wall (landmark_interiors builds the doors + surround from it)
    {
      const v = rec.anchor("door", 314, 0, -312.3, 0);
      v.w = 4.0;
      v.h = 3.2;
    }
    rec.anchor("door_stand", 314, 0, -314.2, 0);
    rec.anchor("gate", 308, 0, -284.5, Math.PI);
    rec.anchor("commander", 312, 0, -318.5, Math.PI);
    rec.anchor("terminal", 299, 0, -350.6, Math.PI);
    rec.anchor("radio", rx, SEC.h + 0.6, rz + 2, 0);
    rec.anchor("turret1", 303, 0, -286, 0);
    rec.anchor("turret2", 330, 0, -286, 0);
    rec.anchor("spawn1", 300, 0, -292, Math.PI);
    rec.anchor("spawn2", 322, 0, -290, Math.PI);
    rec.anchor("spawn3", 306, 0, -326, Math.PI);
    rec.anchor("spawn4", 312, 0, -345, Math.PI / 2);
    rec.anchor("spawn5", 330, 0, -315, Math.PI);
    rec.anchor("spawn6", 296, 0, -318, Math.PI / 2);
    rec.anchor("drone_dock", 327, 2.4, -300, 0);
    rec.anchor("flags", 294.3, 0, -320, -Math.PI / 2);
    rec.anchor("sculpture", kx, 0, kz + 2, Math.PI);
    rec.anchor("loot1", 309.5, 0, -349.5, 0);
    rec.anchor("loot2", 298.4, 0, -331.5, 0);

    b.finish(rec.root);
    d.finish(rec.root, { lod: 300 });
    glows.finish(rec.root, { dayOpacity: 0.4 });
    const bg = beacons.finish(rec.root, { dayOpacity: 0.6, beacon: true });
    const bm = [];
    bg.traverse((o) => {
      if (o.material) bm.push(o.material);
    });
    const ff = K.mat("force_field");
    K.animate((dt, t, night) => {
      const on = t % 1.2 < 0.5;
      for (const m of bm) m.opacity = on ? 0.7 + night * 0.3 : 0.08;
      K.ffTex.offset.y = (t * 0.35) % 1;
      ff.color
        .setRGB(0.45, 0.7, 1)
        .multiplyScalar(0.6 + 0.25 * Math.sin(t * 7) + 0.15 * Math.sin(t * 23));
    });
  }

  K.defineSite("un_hq", 50, function () {
    textures();
    const rec = K.record("un_hq");
    build(rec);
  });
})();
