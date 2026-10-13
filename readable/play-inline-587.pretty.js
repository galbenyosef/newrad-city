/* src/lair/10_track61.js */
/* =====================================================================
 * NEW RAD CITY — lair / 10_track61.js
 * Cell 'lair_track61' (cell-local coordinates; the root group sits at the
 * cell origin). Everything the player walks through before the M42 door:
 *
 *   north  z -46 ┐ Rose's handcar spur (narrow tunnel, the handcar, ladder
 *               │  up to the Park Avenue hatch)
 *          z  -6 ┤ M-61 freight elevator (arrival from the Waldorf) at the
 *               │  north end of the platform
 *               │ TRACK 61: platform (east, x 0..10, top y 7.0) + track bed
 *               │  (west, x -10..0, top y 5.9) with the armoured railcar
 *               │  (z 12..34), the Glowkeepers' camp, sun banners
 *          z  42 ┤ east arch → HALL OF CANDLES (x 10..38, z 30..58)
 *               │  → the long stair down (x 40..50.5) → M42 antechamber
 *               │  (y 0, x 50.5..68) with the M42 door (east wall) and
 *               │  Brother Tinder's workshop (south)
 *          z 124 ┘ south tunnel → T-61 bulkhead (to the 42nd St tunnels)
 *
 * Floors above y 0 are solid collider slabs (interior terrain is a hard
 * floor at 0). Baked vertex light only; candle flames are glow points.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  const K = G.lair && G.lair._;
  if (!K) return;
  const HP = K.HP,
    PI = K.PI;

  // shared dimensions (exported for the content files)
  const D = (K.T61 = {
    YP: 7.0, // platform / hall floor top
    YT: 5.9, // track bed (ballast) top
    RAIL: 6.08, // rail head
    TRACK_X: -5, // track centre line
    CEIL: 13.6,
    HALL: { x0: 10, x1: 38, z0: 30, z1: 58 },
    ANTE: { x0: 50.5, x1: 68, z0: 38, z1: 54 },
    SHOP: { x0: 52, x1: 66, z0: 54, z1: 66 },
  });

  K.addBuild(10, function buildTrack61() {
    const O = K.O1();
    if (!O) return;
    const root = new THREE.Group();
    root.name = "lair_track61";
    root.position.set(O.x, 0, O.z);
    G.scene.add(root);
    K.roots = K.roots || {};
    K.roots.track61 = root;
    const b = K.builder("t61", {
      ambient: 0.13,
      grime: 0.55,
      maxLight: 2.0,
      seg: 1.8,
      gain: 1.0,
    });
    const glows = K.glowSet();
    const r = K.rng("track61");
    const { YP, YT, RAIL, TRACK_X: TX, CEIL } = D;
    // local collider helper (cell-local → world)
    const col = (x0, y0, z0, x1, y1, z1, o) =>
      K.col(O.x + x0, y0, O.z + z0, O.x + x1, y1, O.z + z1, o);
    const colR = (cx, cz, w, d, y0, y1, yaw, o) =>
      K.colRot(O.x + cx, O.z + cz, w, d, y0, y1, yaw, o);
    const anchor = (name, x, y, z, yaw) => K.anchor(name, K.w1(x, y, z), yaw);
    const flames = []; // flame positions → aggregate baked lights

    // ---------------------------------------------------------------
    // helpers
    // ---------------------------------------------------------------
    /** I-beam girder between two points at the same height (flanges + web). */
    function girder(ax, y, az, bx, bz, h, w, mat) {
      const dx = bx - ax,
        dz = bz - az,
        L = Math.hypot(dx, dz),
        yaw = Math.atan2(dx, dz);
      const cx = (ax + bx) / 2,
        cz = (az + bz) / 2;
      b.box(mat || "paint_green", cx, y - h, cz, w, 0.035, L, {
        yaw,
        grime: 0.6,
      });
      b.box(mat || "paint_green", cx, y - 0.035, cz, w, 0.035, L, {
        yaw,
        grime: 0.6,
      });
      b.box(mat || "paint_green", cx, y - h + 0.035, cz, 0.03, h - 0.07, L, {
        yaw,
        grime: 0.6,
      });
    }
    /** Riveted H-column from y0 to y1. */
    function column(x, z, y0, y1, mat) {
      b.box(mat || "paint_green", x, y0, z - 0.17, 0.36, y1 - y0, 0.035, {
        grime: 0.7,
      });
      b.box(mat || "paint_green", x, y0, z + 0.17, 0.36, y1 - y0, 0.035, {
        grime: 0.7,
      });
      b.box(mat || "paint_green", x, y0, z, 0.03, y1 - y0, 0.3, { grime: 0.7 });
      b.box("iron", x, y0, z, 0.55, 0.06, 0.55, { grime: 0.5 });
      b.box(mat || "paint_green", x, y1 - 0.5, z, 0.5, 0.5, 0.5, {
        grime: 0.5,
        faces: "nsewb",
      }); // capital bracket
      colR(x, z, 0.4, 0.4, y0, y1);
    }
    /** Track: sleepers + two rails along z from z0 to z1 at centre x. */
    function track(x, z0, z1, y, opts) {
      opts = opts || {};
      for (let z = z0 + 0.3; z < z1; z += 0.62) {
        if (opts.gaps && r() < opts.gaps) continue;
        b.box(
          "wood_dark",
          x + (r() - 0.5) * 0.06,
          y - 0.06,
          z,
          2.5,
          0.16,
          0.24,
          { yaw: (r() - 0.5) * 0.05, grime: 0.7 },
        );
      }
      for (const s of [-0.72, 0.72]) {
        b.box(
          opts.rust ? "rust_dark" : "steel",
          x + s,
          y + 0.1,
          (z0 + z1) / 2,
          0.07,
          0.08,
          z1 - z0,
          {
            faces: "nsewt",
            grime: 0.4,
            tint: opts.rust ? undefined : 0x8a8680,
          },
        );
        b.box("rust_dark", x + s, y, (z0 + z1) / 2, 0.14, 0.1, z1 - z0, {
          grime: 0.6,
        });
      }
    }
    /** A hanging cloth banner with the painted sun (decal on burlap). */
    function banner(x, ytop, z, w, h, face) {
      b.panel("decal", x, ytop - h / 2, z, w, h, face, {
        rect: K.decal("banner"),
        double: true,
      });
      b.beam(
        "wood_dark",
        x - Math.cos(face) * (w / 2 + 0.1),
        ytop + 0.05,
        z + Math.sin(face) * (w / 2 + 0.1),
        x + Math.cos(face) * (w / 2 + 0.1),
        ytop + 0.05,
        z - Math.sin(face) * (w / 2 + 0.1),
        0.05,
        { round: 6 },
      );
    }
    function lantern(x, y, z, warm) {
      b.cyl("iron", x, y, z, 0.11, 0.11, 0.04, 8, { grime: 0.3 });
      b.cyl("glass", x, y + 0.04, z, 0.09, 0.09, 0.22, 8, { grime: 0.2 });
      b.cyl("iron", x, y + 0.26, z, 0.12, 0.04, 0.08, 8, { grime: 0.3 });
      b.beam("iron", x, y + 0.34, z, x, y + 0.6, z, 0.012, { round: 6 });
      glows.add(x, y + 0.14, z, warm || 0xffb860, 0.5, 0.6);
    }
    function crate(x, y, z, s, yaw) {
      b.box("crate", x, y, z, s, s * 0.8, s, { yaw: yaw || 0, grime: 0.5 });
      colR(x, z, s, s, y, y + s * 0.8, yaw || 0, { surface: "wood" });
      return y + s * 0.8;
    }
    function mattress(x, y, z, yaw) {
      b.box("mattress", x, y, z, 0.9, 0.16, 1.9, { yaw, grime: 0.7 });
      b.box(
        "robe_grey",
        x + Math.sin(yaw) * 0.3,
        y + 0.16,
        z + Math.cos(yaw) * 0.3,
        0.88,
        0.06,
        1.0,
        { yaw, grime: 0.4 },
      );
    }

    // ===============================================================
    // TRACK BED + PLATFORM SLABS (z -6 .. 88), with the spur and south tunnel
    // ===============================================================
    // track bed: ballast top at YT from x -10..0 (z -46..124 overall)
    col(-10, 0, -46, 0, YT, 124, { surface: "dirt" });
    b.boxMM("gravel", -10, YT - 0.2, -6, 0, YT, 88, {
      faces: "t",
      grime: 0.4,
      seg: 1.5,
    });
    track(TX, -6, 88, YT);
    // platform: x 0..10 top YP (z -6..88)
    col(0, 0, -6, 10, YP, 88, { surface: "concrete" });
    b.boxMM("concrete_grey", 0, YP - 0.2, -6, 10, YP, 88, {
      faces: "t",
      grime: 0.7,
      seg: 1.5,
      tint: 0x8a867c,
    });
    b.boxMM("concrete_soot", 0, YT, -6, 0.0001, YP, 88, {
      faces: "w",
      grime: 0.7,
    }); // platform face
    b.box("granite", 0.3, YP - 0.06, 41, 0.6, 0.08, 94, { grime: 0.45 }); // coping
    b.box("paint_yellow", 0.48, YP + 0.022, 41, 0.12, 0.004, 94, {
      grime: 0.7,
      faces: "t",
    });
    // ---------------- walls ----------------
    // west wall (x -10): glazed tile to YP+2.2, soot brick above
    b.face("tile_cream", -10, YT, 88, 0, 0, -1, 0, 1, 0, 94, YP + 2.2 - YT, {
      grime: 0.65,
      seg: 1.8,
    });
    b.face(
      "brick_soot",
      -10,
      YP + 2.2,
      88,
      0,
      0,
      -1,
      0,
      1,
      0,
      94,
      CEIL - YP - 2.2,
      { grime: 0.6, seg: 1.8 },
    );
    b.box("tile_green", -9.98, YP + 2.0, 41, 0.04, 0.2, 94, {
      faces: "e",
      grime: 0.5,
    }); // tile cap band
    col(-10.6, 0, -6, -10, CEIL, 88);
    // east wall (x 10) with the arch to the Hall of Candles (z 40..48) — two segments + header
    const eastSeg = (z0, z1) => {
      b.face("tile_cream", 10, YP, z0, 0, 0, 1, 0, 1, 0, z1 - z0, 2.2, {
        grime: 0.6,
      });
      b.face(
        "brick_soot",
        10,
        YP + 2.2,
        z0,
        0,
        0,
        1,
        0,
        1,
        0,
        z1 - z0,
        CEIL - YP - 2.2,
        { grime: 0.6 },
      );
      col(10, YP, z0, 10.6, CEIL, z1);
    };
    eastSeg(-6, 40);
    eastSeg(48, 88);
    b.face(
      "brick_soot",
      10,
      YP + 4.4,
      40,
      0,
      0,
      1,
      0,
      1,
      0,
      8,
      CEIL - YP - 4.4,
      { grime: 0.6 },
    );
    // ceiling + girders
    b.face("concrete_soot", -10, CEIL, -6, 1, 0, 0, 0, 0, 1, 20, 94, {
      grime: 0.6,
      seg: 3,
      uv: "plane",
    });
    for (let z = -2; z < 88; z += 6) girder(-10, CEIL, z, 10, z, 0.55, 0.32);
    girder(1.2, CEIL - 0.55, -6, 1.2, 88, 0.5, 0.3);
    // platform columns along x 1.2, every 6 m (skipping the railcar door)
    for (let z = 1; z < 86; z += 6) column(1.2, z, YP, CEIL - 0.55);
    // a run of dead conduit pipes along the west wall
    for (let k = 0; k < 3; k++)
      b.beam(
        "rust",
        -9.75,
        YP + 3.4 + k * 0.22,
        -6,
        -9.75,
        YP + 3.4 + k * 0.22,
        88,
        0.12,
        { round: 8, grime: 0.6 },
      );
    for (let z = -4; z < 88; z += 4)
      b.box("iron", -9.8, YP + 3.2, z, 0.12, 0.85, 0.06, { grime: 0.6 });
    // enamel signs
    for (const z of [6, 58]) {
      b.box("paint_black", 9.9, YP + 2.9, z, 0.06, 0.7, 2.6, { grime: 0.3 });
      b.wallDecal("track61", 9.86, YP + 3.25, z, 2.4, 0.3, -HP);
    }
    for (const z of [20, 70])
      b.wallDecal("nyc_sys", -9.97, YP + 4.2, z, 6, 0.75, HP);
    b.wallDecal("creed", -9.96, YP + 5.6, 44, 9, 1.1, HP);
    b.wallDecal("sun_gold", -9.96, YP + 2.6, 44, 3.4, 3.4, HP);
    // soot plumes above the camp fires
    b.burn(6, YP + 4, 30, 5, 0.5);
    b.burn(6, CEIL, 30, 6, 0.6);

    // ===============================================================
    // NORTH END: M-61 freight elevator (arrival from the Waldorf)
    // ===============================================================
    // north wall of the platform end (z -6) with the elevator opening x 3..8
    b.face("concrete_soot", 0, YP, -6, 1, 0, 0, 0, 1, 0, 3, CEIL - YP, {
      grime: 0.7,
    });
    b.face("concrete_soot", 8, YP, -6, 1, 0, 0, 0, 1, 0, 2, CEIL - YP, {
      grime: 0.7,
    });
    b.face(
      "concrete_soot",
      3,
      YP + 3.6,
      -6,
      1,
      0,
      0,
      0,
      1,
      0,
      5,
      CEIL - YP - 3.6,
      { grime: 0.7 },
    );
    col(0, YP, -6.6, 3, CEIL, -6);
    col(8, YP, -6.6, 10, CEIL, -6);
    // the elevator car (open box behind the opening, z -6..-10)
    b.boxMM("plate", 3, YP - 0.05, -10, 8, YP, -6, { faces: "t", grime: 0.6 });
    col(3, 0, -10, 8, YP, -6);
    b.face("metal_panel", 3, YP, -10, 1, 0, 0, 0, 1, 0, 5, 3.6, {
      grime: 0.7,
      tint: 0x6a6a60,
    }); // back
    b.face("metal_panel", 3, YP, -6, 0, 0, -1, 0, 1, 0, 4, 3.6, {
      grime: 0.7,
      tint: 0x6a6a60,
    }); // west side (faces +x)
    b.face("metal_panel", 8, YP, -10, 0, 0, 1, 0, 1, 0, 4, 3.6, {
      grime: 0.7,
      tint: 0x6a6a60,
    }); // east side (faces -x)
    b.boxMM("metal_panel", 3, YP + 3.6, -10, 8, YP + 3.7, -6, {
      faces: "b",
      grime: 0.7,
      tint: 0x4a4a44,
    });
    col(2.6, YP, -10.4, 3, YP + 3.6, -6);
    col(8, YP, -10.4, 8.4, YP + 3.6, -6);
    col(3, YP, -10.6, 8, YP + 3.6, -10);
    // cage gate half cut away by a torch (welded once, opened from below this week)
    for (let x = 3.1; x < 8; x += 0.18) {
      const cut = x > 4.6 && x < 7.2;
      b.beam(
        "iron",
        x,
        cut ? YP + 2.9 : YP,
        -6.05,
        x + 0.02,
        YP + 3.55,
        -6.05,
        0.025,
        { round: 6 },
      );
    }
    b.beam("iron", 3, YP + 3.55, -6.05, 8, YP + 3.55, -6.05, 0.05);
    b.beam("iron", 3, YP + 0.05, -6.05, 4.6, YP + 0.05, -6.05, 0.05);
    b.beam("iron", 7.2, YP + 0.05, -6.05, 8, YP + 0.05, -6.05, 0.05);
    b.beam("iron", 4.6, YP + 2.9, -6.05, 7.2, YP + 2.9, -6.05, 0.04);
    b.box("rust_dark", 5.6, YP, -5.2, 1.6, 0.04, 0.9, { grime: 0.8 }); // cut gate bars lying on the platform
    for (let i = 0; i < 6; i++)
      b.beam(
        "iron",
        5 + r() * 1.4,
        YP + 0.03,
        -5.6 + r() * 0.6,
        5.2 + r() * 1.4,
        YP + 0.03,
        -4.8 - r() * 0.3,
        0.025,
        { round: 6 },
      );
    b.wallDecal("m61", 5.5, YP + 4.1, -5.97, 3.2, 0.42, 0);
    lantern(3.5, YP + 2.4, -9.6, 0xffc070);
    b.light(5.5, YP + 3.0, -8, 6, 0xffc070, 0.9);
    b.light(5.5, YP + 12, -8, 9, 0x8fa8c0, 0.35); // faint daylight far up the shaft
    anchor("waldorf_arrival", 5.5, YP, -8.4, PI);
    anchor("waldorf_exit", 5.5, YP + 1.3, -9.4, 0);

    // ===============================================================
    // THE ARMOURED RAILCAR (z 12..34 on the track)
    // ===============================================================
    {
      const z0 = 12,
        z1 = 34,
        x0 = TX - 1.6,
        x1 = TX + 1.6,
        yb = RAIL + 1.0,
        yt = RAIL + 4.15;
      // trucks (6-wheel bogies)
      for (const zc of [z0 + 3.2, z1 - 3.2]) {
        b.boxMM(
          "iron",
          x0 + 0.2,
          RAIL + 0.35,
          zc - 1.9,
          x1 - 0.2,
          RAIL + 0.85,
          zc + 1.9,
          { grime: 0.7 },
        );
        for (const dz of [-1.35, 0, 1.35])
          for (const s of [-0.72, 0.72]) {
            b.geo("iron", K.T.cyl16, {
              x: TX + s * 1.04,
              y: RAIL + 0.45,
              z: zc + dz,
              rz: HP,
              sx: 0.45,
              sy: 0.12,
              sz: 0.45,
              grime: 0.6,
            });
          }
        b.beam(
          "rust_dark",
          x0 + 0.1,
          RAIL + 0.5,
          zc - 2,
          x1 - 0.1,
          RAIL + 0.5,
          zc - 2,
          0.12,
        );
      }
      // underframe + armoured body (riveted olive plate)
      b.boxMM("iron", x0 + 0.1, RAIL + 0.85, z0 + 0.2, x1 - 0.1, yb, z1 - 0.2, {
        grime: 0.7,
      });
      b.boxMM("paint_olive", x0, yb, z0, x1, yt, z1, { grime: 0.65, seg: 1.4 });
      // roof: slight crown
      b.geo("paint_olive", K.T.cyl16, {
        x: TX,
        y: yt,
        z: (z0 + z1) / 2,
        rx: HP,
        sx: 1.62,
        sy: (z1 - z0) / 2,
        sz: 0.28,
        grime: 0.6,
      });
      // plate seams and rivet bands
      for (let z = z0 + 1.4; z < z1; z += 2.2)
        for (const sx of [x0 - 0.01, x1 + 0.01])
          b.box("iron", sx, yb + 0.05, z, 0.02, yt - yb - 0.1, 0.05, {
            grime: 0.4,
          });
      for (const yy of [yb + 0.2, yt - 0.25])
        for (const sx of [x0 - 0.012, x1 + 0.012])
          b.box("iron", sx, yy, (z0 + z1) / 2, 0.025, 0.05, z1 - z0, {
            grime: 0.4,
          });
      // gun-slit windows (thick green glass)
      for (let z = z0 + 2.4; z < z1 - 1.5; z += 3.1)
        for (const sx of [x0 - 0.02, x1 + 0.02]) {
          b.box("glass", sx, yb + 2.0, z, 0.03, 0.34, 0.9, { grime: 0.6 });
          b.box("iron", sx, yb + 1.95, z, 0.06, 0.06, 1.05);
        }
      // end platforms + diaphragms
      for (const ze of [z0, z1]) {
        const s = ze === z0 ? -1 : 1;
        b.boxMM(
          "iron",
          x0 + 0.3,
          RAIL + 0.9,
          Math.min(ze, ze + s * 0.9),
          x1 - 0.3,
          RAIL + 1.0,
          Math.max(ze, ze + s * 0.9),
          { grime: 0.7 },
        );
        b.box("rubber", TX, yb, ze + s * 0.12, 2.2, 2.6, 0.25, { grime: 0.8 });
        b.beam(
          "iron",
          x0 + 0.3,
          RAIL + 1.0,
          ze + s * 0.9,
          x0 + 0.3,
          RAIL + 2.0,
          ze + s * 0.9,
          0.04,
          { round: 6 },
        );
        b.beam(
          "iron",
          x1 - 0.3,
          RAIL + 1.0,
          ze + s * 0.9,
          x1 - 0.3,
          RAIL + 2.0,
          ze + s * 0.9,
          0.04,
          { round: 6 },
        );
      }
      // the platform-side door, slid half open (dark interior behind)
      b.box("shade", x1 + 0.005, yb + 0.2, 25.2, 0.02, 2.4, 1.3, {
        faces: "e",
      });
      b.box("paint_olive", x1 + 0.09, yb + 0.15, 26.3, 0.08, 2.55, 1.4, {
        grime: 0.6,
      });
      b.box("iron", x1 + 0.14, yb + 1.2, 26.9, 0.05, 0.25, 0.06);
      // stencils + the Glowkeepers' sun on the flank facing the platform
      b.wallDecal("armored", x1 + 0.02, yb + 2.85, 18.5, 4.6, 0.55, HP);
      b.wallDecal("sun_white", x1 + 0.02, yb + 1.6, 30.5, 2.2, 2.2, HP);
      b.wallDecal("sun_white", x0 - 0.02, yb + 1.6, 23, 2.4, 2.4, -HP);
      // candles along the car's footboard and roof edge; a shrine at the door
      for (let z = z0 + 0.4; z < z1 - 0.3; z += 0.55)
        if (r() < 0.55)
          flames.push([
            x1 + 0.25,
            K.candle(
              b,
              glows,
              x1 + 0.25 + (r() - 0.5) * 0.08,
              RAIL + 1.0,
              z,
              0.06 + r() * 0.14,
              0.025 + r() * 0.012,
            ),
            z,
          ]);
      b.box("wood_dark", x1 + 0.6, YT, 25.6, 1.0, 1.0, 0.8, { grime: 0.5 }); // shrine box on the ballast
      for (let i = 0; i < 9; i++)
        flames.push([
          x1 + 0.6,
          K.candle(
            b,
            glows,
            x1 + 0.3 + r() * 0.6,
            YT + 1.0,
            25.3 + r() * 0.6,
            0.05 + r() * 0.18,
            0.03,
          ),
          25.6,
        ]);
      col(x0, RAIL, z0 - 0.9, x1, yt + 0.3, z1 + 0.9, { surface: "metal" });
      anchor("railcar", x1 + 1.0, YT, 23, -HP);
    }
    // ===============================================================
    // THE GLOWKEEPERS' CAMP on the platform
    // ===============================================================
    {
      // bedrolls and tarps along the east wall
      for (let z = 4; z < 80; z += 3.3) {
        if (z > 38 && z < 50) continue;
        if (r() < 0.25) continue;
        mattress(8.4 + r() * 0.6, YP, z + r(), HP + (r() - 0.5) * 0.3);
      }
      for (let z = 8; z < 80; z += 12) {
        if (z > 36 && z < 52) continue;
        b.quad(
          "tarp",
          [6.5, YP, z],
          [6.5, YP, z + 5],
          [7.2, YP + 2.6, z + 5],
          [7.2, YP + 2.6, z],
          { double: true, grime: 0.6 },
        );
        b.beam("wood_dark", 7.2, YP, z, 7.2, YP + 2.7, z, 0.06, { round: 6 });
        b.beam("wood_dark", 7.2, YP, z + 5, 7.2, YP + 2.7, z + 5, 0.06, {
          round: 6,
        });
      }
      // oil-drum cook fires
      for (const [fx, fz] of [
        [5.5, 30],
        [5.0, 66],
      ]) {
        b.cyl("rust", fx, YP, fz, 0.32, 0.32, 0.88, 12, { grime: 0.6 });
        b.cyl("shade", fx, YP + 0.86, fz, 0.29, 0.29, 0.02, 12);
        for (let k = 0; k < 4; k++)
          b.beam(
            "iron",
            fx - 0.4,
            YP + 0.92,
            fz - 0.3 + k * 0.2,
            fx + 0.4,
            YP + 0.92,
            fz - 0.3 + k * 0.2,
            0.015,
            { round: 6 },
          );
        b.cyl("steel", fx + 0.1, YP + 0.94, fz, 0.16, 0.14, 0.2, 10, {
          grime: 0.7,
        }); // pot
        glows.add(fx, YP + 0.95, fz, 0xff7a2a, 0.9, 1);
        glows.add(fx - 0.08, YP + 1.05, fz + 0.05, 0xffa040, 0.6, 1);
        b.light(fx, YP + 1.4, fz, 11, 0xff8a40, 1.4);
        colR(fx, fz, 0.66, 0.66, YP, YP + 0.9);
        if (K.fires)
          K.fires.push({
            cell: "track61",
            x: O.x + fx,
            y: YP + 0.9,
            z: O.z + fz,
          });
      }
      // trestle table with tin cups and a ledger
      b.box("wood_dark", 4.5, YP + 0.74, 36, 1.0, 0.05, 2.4, { grime: 0.5 });
      for (const dz of [-1, 1])
        for (const dx of [-0.4, 0.4])
          b.box("wood_dark", 4.5 + dx, YP, 36 + dz, 0.06, 0.74, 0.06);
      for (let i = 0; i < 6; i++)
        b.cyl(
          "steel",
          4.2 + r() * 0.6,
          YP + 0.79,
          35.2 + r() * 1.6,
          0.04,
          0.035,
          0.09,
          8,
          { grime: 0.5 },
        );
      colR(4.5, 36, 1.0, 2.4, YP, YP + 0.8, 0, { surface: "wood" });
      crate(8.6, YP, 40.2, 1.0, 0.2);
      crate(8.4, YP + 0.8, 40.1, 0.7, -0.3);
      crate(8.5, YP, 51.5, 1.1, 0.1);
      // candles in jars along the platform edge
      for (let z = -4; z < 87; z += 1.3)
        if (r() < 0.6) {
          const x = 0.8 + r() * 0.3;
          b.cyl("glass", x, YP, z, 0.06, 0.055, 0.12, 8, { grime: 0.3 });
          flames.push([
            x,
            K.candle(b, glows, x, YP + 0.01, z, 0.06, 0.025, { noDrip: true }),
            z,
          ]);
        }
      // lanterns hung from every other column
      for (let z = 1; z < 86; z += 12) {
        lantern(1.2, YP + 3.2, z + 0.32, 0xffc070);
        b.light(1.2, YP + 3.4, z, 8.5, 0xffb060, 0.95);
      }
      // sun banners from the girders over the track and the platform
      for (const z of [10, 46, 76]) banner(-5, CEIL - 0.6, z, 2.4, 4.6, 0);
      for (const z of [22, 58]) banner(5, CEIL - 0.6, z, 2.0, 3.8, HP);
      // rubble + a fallen girder at the far south end of the platform
      for (let i = 0; i < 20; i++)
        b.geo(r() < 0.6 ? "concrete_soot" : "rubble", K.T.box, {
          x: 6 + r() * 3.5,
          y: YP + r() * 0.5,
          z: 82 + r() * 5,
          ry: r() * 6,
          rx: r() * 0.6,
          sx: 0.4 + r() * 1.1,
          sy: 0.25 + r() * 0.5,
          sz: 0.4 + r() * 1.1,
          grime: 0.6,
        });
      col(5.5, YP, 82, 10, YP + 0.9, 88, { surface: "rubble" });
      b.beam("paint_green", 9.6, YP + 0.3, 80, 2.2, YP + 4.6, 87, 0.42, {
        grime: 0.7,
      });
    }
    // platform end stair down to the track bed (z 80..83, from x 0 west to x -3.6)
    {
      const n = 6,
        step = 0.6,
        rise = (YP - YT) / n;
      for (let i = 0; i < n; i++) {
        const x = -(i + 0.5) * step,
          top = YP - rise * (i + 1);
        b.box(
          "concrete_grey",
          x,
          YT - 0.05,
          81.5,
          step + 0.02,
          top - YT + 0.05,
          3.0,
          { grime: 0.6 },
        );
        K.colRot(O.x + x, O.z + 81.5, step + 0.02, 3.0, YT - 0.05, top, 0, {
          surface: "concrete",
        });
      }
      for (const z of [80.05, 82.95])
        b.beam("iron", 0, YP + 0.9, z, -3.4, YT + 0.9, z, 0.04, { round: 6 });
    }
    // general warm fill along the platform (very low) + a cool fill down the track bed
    for (let z = 0; z < 88; z += 14) {
      b.light(2, YP + 6, z, 14, 0xb08060, 0.25);
      b.light(-5, YT + 5, z, 12, 0x6a7a8a, 0.12);
    }

    // ===============================================================
    // ROSE'S HANDCAR SPUR (north tunnel, z -6 .. -46)
    // ===============================================================
    {
      const zs = -46;
      // tunnel walls/ceiling (narrower, x -9..-1)
      b.face("brick_soot", -9, YT, -6, 0, 0, -1, 0, 1, 0, 40, 5.2, {
        grime: 0.75,
      });
      b.face("brick_soot", -1, YT, zs, 0, 0, 1, 0, 1, 0, 40, 5.2, {
        grime: 0.75,
      });
      b.vaultZ("brick_soot", -9, -1, zs, -6, YT + 5.2, 1.6, {
        segs: 10,
        grime: 0.7,
      });
      b.face("concrete_soot", -1, YT, -6, 1, 0, 0, 0, 1, 0, 1, CEIL - YT, {
        grime: 0.7,
      }); // stub between spur & platform face
      b.face(
        "brick_soot",
        -10,
        YT + 6.8,
        -6,
        1,
        0,
        0,
        0,
        1,
        0,
        9,
        CEIL - YT - 6.8,
        { grime: 0.7 },
      ); // wall above the tunnel mouth
      b.face("brick_soot", -10, YT, -6, 1, 0, 0, 0, 1, 0, 1, 6.8, {
        grime: 0.7,
      });
      col(-9.6, YT, zs, -9, CEIL, -6);
      col(-1, YT, zs, 0, CEIL, -6);
      b.boxMM("gravel", -9, YT - 0.2, zs, -1, YT, -6, {
        faces: "t",
        grime: 0.5,
      });
      track(TX, zs, -6, YT, { rust: true, gaps: 0.1 });
      // the handcar: deck, wheels, the see-saw pump
      const hz = -16;
      b.boxMM(
        "wood_dark",
        TX - 1.0,
        RAIL + 0.45,
        hz - 1.3,
        TX + 1.0,
        RAIL + 0.55,
        hz + 1.3,
        { grime: 0.6 },
      );
      for (const dz of [-0.9, 0.9])
        for (const s of [-0.72, 0.72])
          b.geo("iron", K.T.cyl12, {
            x: TX + s,
            y: RAIL + 0.3,
            z: hz + dz,
            rz: HP,
            sx: 0.32,
            sy: 0.08,
            sz: 0.32,
          });
      b.box("iron", TX, RAIL + 0.55, hz, 0.25, 0.9, 0.25);
      b.beam(
        "iron",
        TX,
        RAIL + 1.55,
        hz - 1.0,
        TX,
        RAIL + 1.35,
        hz + 1.0,
        0.06,
      );
      b.beam(
        "wood_dark",
        TX - 0.6,
        RAIL + 1.35,
        hz + 1.0,
        TX + 0.6,
        RAIL + 1.35,
        hz + 1.0,
        0.05,
        { round: 6 },
      );
      b.beam(
        "wood_dark",
        TX - 0.6,
        RAIL + 1.55,
        hz - 1.0,
        TX + 0.6,
        RAIL + 1.55,
        hz - 1.0,
        0.05,
        { round: 6 },
      );
      colR(TX, hz, 2.0, 2.6, YT, RAIL + 0.6, 0, { surface: "wood" });
      // Rose's chalk 'F' + spark every few metres (her route since she was sixteen)
      for (const z of [-12, -24, -36])
        b.wallDecal("roses_chalk", -1.03, YT + 1.6, z, 0.8, 0.4, -HP);
      b.wallDecal("handcar", -8.97, YT + 2.8, -10, 4.4, 0.5, HP);
      // the ladder up at the end + the dead-end wall
      b.face("concrete_soot", -9, YT, zs, 1, 0, 0, 0, 1, 0, 8, 6.8, {
        grime: 0.8,
      });
      col(-9, YT, zs - 0.6, -1, CEIL, zs);
      for (let y = YT + 0.3; y < YT + 5.6; y += 0.32)
        b.beam("iron", -6, y, zs + 0.18, -4.4, y, zs + 0.18, 0.035, {
          round: 6,
        });
      b.beam("iron", -6, YT, zs + 0.2, -6, YT + 6.0, zs + 0.2, 0.05);
      b.beam("iron", -4.4, YT, zs + 0.2, -4.4, YT + 6.0, zs + 0.2, 0.05);
      b.box("rust", -5.2, YT + 6.2, zs + 0.9, 1.6, 0.12, 1.6, { grime: 0.6 }); // hatch overhead
      b.light(-5.2, YT + 5.2, zs + 1.2, 5, 0x9ab0c8, 0.5); // grey daylight through the hatch slots
      b.light(TX, YT + 3.5, hz, 7, 0x8a5040, 0.35);
      glows.add(-1.2, YT + 3.2, -28, 0xff3020, 0.25, 0.1);
      b.box("lit", -1.12, YT + 3.1, -28, 0.08, 0.16, 0.12, { tint: 0xff3020 });
      anchor("spur_arrival", -5.2, YT, zs + 2.4, PI);
      anchor("spur_exit", -5.2, YT + 1.5, zs + 0.6, 0);
      anchor("handcar", TX, YT, hz, 0);
    }

    // ===============================================================
    // SOUTH TUNNEL → the T-61 bulkhead (z 88 .. 124)
    // ===============================================================
    {
      const z0 = 88,
        z1 = 124;
      b.face("brick_soot", -9, YT, z1, 0, 0, -1, 0, 1, 0, z1 - z0, 5.4, {
        grime: 0.75,
      });
      b.face("brick_soot", -1, YT, z0, 0, 0, 1, 0, 1, 0, z1 - z0, 5.4, {
        grime: 0.75,
      });
      b.vaultZ("brick_soot", -9, -1, z0, z1, YT + 5.4, 1.6, {
        segs: 10,
        grime: 0.7,
      });
      // end walls facing the platform (-z): above the tunnel mouth, either side of it, and the platform end
      b.face(
        "concrete_soot",
        -1,
        YT + 7,
        88,
        -1,
        0,
        0,
        0,
        1,
        0,
        8,
        CEIL - YT - 7,
        { grime: 0.7 },
      );
      b.face("concrete_soot", -9, YT, 88, -1, 0, 0, 0, 1, 0, 1, CEIL - YT, {
        grime: 0.7,
      });
      b.face("concrete_soot", 0, YT, 88, -1, 0, 0, 0, 1, 0, 1, CEIL - YT, {
        grime: 0.7,
      });
      b.face("concrete_soot", 10, YP, 88, -1, 0, 0, 0, 1, 0, 10, CEIL - YP, {
        grime: 0.7,
      });
      col(-1, YT, 88, 10, CEIL, 88.6);
      col(-10, YT, 88, -9, CEIL, 88.6);
      col(-9.6, YT, z0, -9, CEIL, z1);
      col(-1, YT, z0, -0.4, CEIL, z1);
      b.boxMM("gravel", -9, YT - 0.2, z0, -1, YT, z1, {
        faces: "t",
        grime: 0.5,
      });
      track(TX, z0, z1 - 1, YT, { rust: true });
      // buffer stop
      b.boxMM(
        "paint_red",
        TX - 1.2,
        YT,
        z1 - 2.2,
        TX + 1.2,
        YT + 1.1,
        z1 - 1.6,
        { grime: 0.7 },
      );
      col(TX - 1.2, YT, z1 - 2.2, TX + 1.2, YT + 1.1, z1 - 1.6);
      // the bulkhead (pressure hatch with locking dogs) in the south wall
      b.face("concrete_soot", -9, YT, z1, 1, 0, 0, 0, 1, 0, 8, 7, {
        grime: 0.8,
      });
      col(-9, YT, z1, -1, CEIL, z1 + 0.6);
      const hx = -5,
        hy = YT + 1.35;
      b.box("rust", hx, YT + 0.1, z1 - 0.08, 2.2, 2.6, 0.16, { grime: 0.6 });
      b.box("iron", hx, YT + 0.05, z1 - 0.2, 2.5, 0.12, 0.14);
      b.box("iron", hx, YT + 2.7, z1 - 0.2, 2.5, 0.12, 0.14);
      for (const sx of [-1.2, 1.2])
        b.box("iron", hx + sx, YT + 0.05, z1 - 0.2, 0.12, 2.75, 0.14);
      for (const [dx, dy] of [
        [-0.95, 0.4],
        [-0.95, 2.1],
        [0.95, 0.4],
        [0.95, 2.1],
      ])
        b.box("steel", hx + dx, YT + dy, z1 - 0.24, 0.3, 0.1, 0.1, {
          tint: 0x8a8680,
        });
      b.geo("steel", K.T.torus, {
        x: hx,
        y: hy,
        z: z1 - 0.32,
        s: 0.42,
        tint: 0x8a8680,
      });
      b.wallDecal("t61_hatch", hx, YT + 3.2, z1 - 0.03, 2.6, 0.33, PI);
      glows.add(hx + 1.6, YT + 2.9, z1 - 0.2, 0xff2a1a, 0.3, 0.05);
      b.box("lit", hx + 1.6, YT + 2.85, z1 - 0.12, 0.12, 0.12, 0.06, {
        tint: 0xff3020,
      });
      b.light(hx, YT + 3.0, z1 - 1.5, 6, 0xff5030, 0.6);
      b.light(TX, YT + 3.5, 104, 9, 0x705848, 0.3);
      anchor("bulkhead_arrival", hx, YT, z1 - 3.0, 0);
      anchor("bulkhead_exit", hx, hy, z1 - 0.5, PI);
    }

    // ===============================================================
    // HALL OF CANDLES (x 10..38, z 30..58, floor YP)
    // ===============================================================
    const H = D.HALL;
    {
      const zone = [H.x0 - 1, YP - 1, H.z0 - 1, H.x1 + 3, YP + 12, H.z1 + 1];
      b.zone = zone;
      col(H.x0, 0, H.z0, H.x1 + 2, YP, H.z1, { surface: "concrete" });
      b.boxMM("limestone", H.x0, YP - 0.2, H.z0, H.x1 + 2, YP, H.z1, {
        faces: "t",
        grime: 0.55,
        seg: 1.2,
        tint: 0x847c70,
      });
      // arch passage through the platform wall (x 10..11, z 40..48)
      b.face("brick_soot", 10, YP, 40, 1, 0, 0, 0, 1, 0, 1, 2.4, {
        grime: 0.6,
      });
      b.face("brick_soot", 11, YP, 48, -1, 0, 0, 0, 1, 0, 1, 2.4, {
        grime: 0.6,
      });
      b.vaultX("brick_soot", 40, 48, 10, 11, YP + 2.4, 2.0, { segs: 10 });
      // walls: south (z 30) and north (z 58), 4.5 m to the springing
      const WH = 4.5;
      b.face("brick", H.x0, YP, H.z0, 1, 0, 0, 0, 1, 0, H.x1 - H.x0, WH, {
        grime: 0.55,
        seg: 1.2,
      });
      b.face("brick", H.x1, YP, H.z1, -1, 0, 0, 0, 1, 0, H.x1 - H.x0, WH, {
        grime: 0.55,
        seg: 1.2,
      });
      col(H.x0, YP, H.z0 - 0.6, H.x1, YP + 10, H.z0);
      col(H.x0, YP, H.z1, H.x1, YP + 10, H.z1 + 0.6);
      // west end wall (x 10, with the arch) and east end wall (x 38, with the stair arch z 41..47)
      b.face("brick", H.x0 + 1, YP, H.z1, 0, 0, -1, 0, 1, 0, H.z1 - 48, WH, {
        grime: 0.55,
      });
      b.face("brick", H.x0 + 1, YP, 40, 0, 0, -1, 0, 1, 0, 40 - H.z0, WH, {
        grime: 0.55,
      });
      b.face("brick", H.x0 + 1, YP + 4.4, 48, 0, 0, -1, 0, 1, 0, 8, 0.1, {
        grime: 0.55,
      });
      b.face("brick", H.x1, YP, H.z0, 0, 0, 1, 0, 1, 0, 41.6 - H.z0, WH, {
        grime: 0.55,
      });
      b.face("brick", H.x1, YP, 46.4, 0, 0, 1, 0, 1, 0, H.z1 - 46.4, WH, {
        grime: 0.55,
      });
      b.face("brick", H.x1, YP + 3.6, 41.6, 0, 0, 1, 0, 1, 0, 4.8, WH - 3.6, {
        grime: 0.55,
      });
      b.box("iron", H.x1 - 0.05, YP + 3.5, 44, 0.12, 0.14, 5.2, { grime: 0.4 }); // lintel
      // the barrel vault over the hall (spanning z), and the lunettes at both ends
      b.vaultX("brick", H.z0, H.z1, H.x0 + 1, H.x1, YP + WH, 5.2, {
        segs: 20,
        grime: 0.5,
      });
      K.lunette(
        b,
        "brick",
        H.x0 + 1,
        YP + WH,
        (H.z0 + H.z1) / 2,
        (H.z1 - H.z0) / 2,
        5.2,
        HP,
        { grime: 0.5 },
      );
      K.lunette(
        b,
        "brick",
        H.x1,
        YP + WH,
        (H.z0 + H.z1) / 2,
        (H.z1 - H.z0) / 2,
        5.2,
        -HP,
        { grime: 0.5 },
      );
      col(H.x1, YP, H.z0, H.x1 + 0.6, YP + 10, 41.6);
      col(H.x1, YP, 46.4, H.x1 + 0.6, YP + 10, H.z1);
      // iron ribs across the vault every 4 m
      for (let x = H.x0 + 3; x < H.x1; x += 4)
        for (let i = 0; i < 12; i++) {
          const a0 = (PI * i) / 12,
            a1 = (PI * (i + 1)) / 12,
            hw = (H.z1 - H.z0) / 2,
            cz = (H.z0 + H.z1) / 2;
          b.beam(
            "iron",
            x,
            YP + WH + 5.0 * Math.sin(a0),
            cz + (hw - 0.1) * Math.cos(a0),
            x,
            YP + WH + 5.0 * Math.sin(a1),
            cz + (hw - 0.1) * Math.cos(a1),
            0.14,
            { d: 0.1, grime: 0.6 },
          );
        }
      // chalked names across both long walls
      for (let x = H.x0 + 3; x < H.x1 - 2; x += 5.6) {
        b.wallDecal("names", x + 1.4, YP + 3.15, H.z0 + 0.02, 5.4, 2.4, 0);
        b.wallDecal("names", x + 1.4, YP + 3.15, H.z1 - 0.02, 5.4, 2.4, PI);
      }
      b.wallDecal("creed", H.x0 + 1.03, YP + WH + 2.1, 44, 10, 1.2, HP);
      // candle shelves: three tiers along both long walls
      const shelfZ = [
        [H.z0 + 0.32, 1],
        [H.z1 - 0.32, -1],
      ];
      for (const [sz, dir] of shelfZ) {
        for (const ty of [0.85, 1.5, 2.15]) {
          b.box(
            "wood_dark",
            (H.x0 + H.x1) / 2 + 0.5,
            YP + ty - 0.05,
            sz,
            H.x1 - H.x0 - 3,
            0.05,
            0.5,
            { grime: 0.5 },
          );
          for (let x = H.x0 + 2.5; x < H.x1 - 1; x += 1.5)
            b.box("iron", x, YP + ty - 0.3, sz - dir * 0.2, 0.04, 0.25, 0.08);
          const pts = K.candleRow(
            b,
            glows,
            H.x0 + 2.2,
            YP + ty,
            sz + dir * 0.05,
            H.x1 - 1.2,
            sz + dir * 0.05,
            0.16,
            r,
            { hMin: 0.05, hMax: 0.26, gaps: 0.12, jitter: 0.12 },
          );
          for (const p of pts) flames.push(p);
          // wax curtains dripping over the shelf edge
          for (let x = H.x0 + 2.3; x < H.x1 - 1.2; x += 0.35)
            if (r() < 0.5)
              b.box(
                "wax",
                x,
                YP + ty - 0.05 - r() * 0.12,
                sz + dir * 0.24,
                0.05 + r() * 0.1,
                0.06 + r() * 0.16,
                0.02,
                { grime: 0, tint: 0xece2c6 },
              );
        }
        col(
          H.x0 + 1.5,
          YP,
          Math.min(sz, sz + dir * 0.4) - 0.25,
          H.x1 - 0.5,
          YP + 2.3,
          Math.max(sz, sz + dir * 0.4) + 0.25,
          { surface: "wood" },
        );
      }
      // aggregate light from the shelves (warm, strong near the walls)
      for (let x = H.x0 + 3; x < H.x1; x += 3)
        for (const sz of [H.z0 + 1.1, H.z1 - 1.1])
          b.light(x, YP + 1.6, sz, 4.8, 0xffa850, 0.75);
      // floor candles in loose drifts along the wall feet + wax pools
      for (let i = 0; i < 70; i++) {
        const x = H.x0 + 2 + r() * (H.x1 - H.x0 - 3),
          z = r() < 0.5 ? H.z0 + 0.8 + r() * 0.9 : H.z1 - 0.8 - r() * 0.9;
        flames.push([
          x,
          K.candle(b, glows, x, YP, z, 0.06 + r() * 0.28, 0.03 + r() * 0.025),
          z,
        ]);
      }
      for (let i = 0; i < 26; i++)
        b.floorDecal(
          "wax_pool",
          H.x0 + 2 + r() * (H.x1 - H.x0 - 3),
          YP + 0.005,
          H.z0 + 1 + r() * (H.z1 - H.z0 - 2),
          0.5 + r() * 0.9,
          0.5 + r() * 0.9,
          r() * 6,
        );
      // kneeling cushions in rows facing the stair arch (east)
      for (let row = 0; row < 4; row++)
        for (let k = 0; k < 6; k++)
          b.box(
            "robe_ochre",
            17 + row * 2.4,
            YP,
            37 + k * 2.4,
            0.55,
            0.1,
            0.55,
            { yaw: (r() - 0.5) * 0.3, grime: 0.6 },
          );
      // THE ELEVEN: near the door, apart from the rest, eleven small candles in a ring of jam jars, and the card
      {
        const ex = 14.6,
          ez = 51.6;
        for (let i = 0; i < 11; i++) {
          const a = (i / 11) * K.TAU,
            x = ex + Math.cos(a) * 0.55,
            z = ez + Math.sin(a) * 0.55;
          b.cyl("glass", x, YP, z, 0.055, 0.05, 0.13, 8, { grime: 0.2 });
          flames.push([
            x,
            K.candle(b, glows, x, YP + 0.01, z, 0.07, 0.022, {
              noDrip: true,
              size: 0.13,
            }),
            z,
          ]);
        }
        b.box("wood_dark", ex, YP, ez, 0.3, 0.32, 0.04, { grime: 0.3 });
        b.panel("decal", ex, YP + 0.42, ez + 0.03, 0.5, 0.25, 0, {
          rect: K.decal("eleven"),
        });
        b.light(ex, YP + 0.8, ez, 3.2, 0xffb060, 1.0);
        anchor("eleven", ex + 1.3, YP, ez - 1.0, HP * 0.6);
      }
      // THE 'R.' CANDLE: a niche in the east wall north of the stair arch, glass chimney, never allowed to go out
      {
        const nz = 52.5,
          nx = H.x1;
        b.boxMM(
          "brick_soot",
          nx - 0.45,
          YP + 1.0,
          nz - 0.6,
          nx,
          YP + 1.05,
          nz + 0.6,
          { grime: 0.4 },
        );
        b.face(
          "brick_soot",
          nx - 0.02,
          YP + 1.05,
          nz - 0.6,
          0,
          0,
          1,
          0,
          1,
          0,
          1.2,
          1.0,
          { grime: 0.4 },
        );
        b.vaultZ(
          "brick_soot",
          nx - 0.45,
          nx - 0.0,
          nz - 0.6,
          nz + 0.6,
          YP + 2.05,
          0.2,
          { segs: 6 },
        );
        b.cyl("glass", nx - 0.22, YP + 1.05, nz, 0.09, 0.07, 0.34, 12, {
          grime: 0.1,
        });
        flames.push([
          nx - 0.22,
          K.candle(b, glows, nx - 0.22, YP + 1.05, nz, 0.16, 0.035, {
            size: 0.3,
            flick: 0.5,
            color: 0xffc070,
          }),
          nz,
        ]);
        b.panel("decal", nx - 0.42, YP + 1.25, nz + 0.45, 0.26, 0.13, -HP, {
          rect: K.decal("r_label"),
        });
        b.light(nx - 0.6, YP + 1.4, nz, 3.6, 0xffc070, 1.4);
        anchor("r_candle", nx - 1.4, YP, nz, -HP);
      }
      // THE POD-7 CANDLE: mid-hall on an upturned crate, the stub of twenty-two years of candles, rings of wax like a tree;
      // pinned under the bottom ring a brown scrap of paper: "pod 7". The ring record stands on a board behind it.
      {
        const px = 30.5,
          pz = 44;
        b.box("crate", px, YP, pz, 0.7, 0.62, 0.7, { yaw: 0.2, grime: 0.5 });
        for (let k = 0; k < 22; k++)
          b.cyl(
            "wax",
            px,
            YP + 0.62 + k * 0.012,
            pz,
            0.2 - k * 0.0035,
            0.2 - k * 0.0035,
            0.012,
            14,
            { grime: 0, tint: k % 2 ? 0xefe2c4 : 0xe2d2ae, rows: 1 },
          );
        for (let i = 0; i < 9; i++) {
          const a = r() * K.TAU;
          b.cyl(
            "wax",
            px + Math.cos(a) * 0.2,
            YP + 0.36 + r() * 0.25,
            pz + Math.sin(a) * 0.2,
            0.03,
            0.018,
            0.2 + r() * 0.12,
            5,
            { grime: 0 },
          );
        }
        flames.push([
          px,
          K.candle(b, glows, px, YP + 0.88, pz, 0.06, 0.05, {
            size: 0.24,
            noDrip: true,
          }),
          pz,
        ]);
        b.panel("decal", px + 0.22, YP + 0.66, pz - 0.36, 0.2, 0.1, PI, {
          rect: K.decal("pod7"),
        });
        b.box("wood_dark", px + 0.55, YP, pz, 0.04, 1.3, 0.6, {
          yaw: -0.1,
          grime: 0.3,
        });
        b.panel("decal", px + 0.52, YP + 0.8, pz, 0.32, 0.7, -HP, {
          rect: K.decal("rings"),
        });
        colR(px, pz, 0.8, 0.8, YP, YP + 0.9);
        b.light(px - 0.4, YP + 1.4, pz, 3.4, 0xffb060, 1.1);
        anchor("pod7_candle", px - 1.2, YP, pz, -HP);
      }
      // THE RECORD PLAYER ALCOVE (north wall, x 18..20.4)
      {
        const ax0 = 18,
          ax1 = 20.4,
          az = H.z1;
        b.boxMM("brick_soot", ax0, YP, az, ax1, YP + 2.4, az + 1.1, {
          faces: "b",
          grime: 0.5,
        });
        b.face(
          "brick_soot",
          ax0,
          YP,
          az + 1.1,
          1,
          0,
          0,
          0,
          1,
          0,
          ax1 - ax0,
          2.4,
          { grime: 0.5 },
        );
        b.face("brick_soot", ax0, YP, az, 0, 0, 1, 0, 1, 0, 1.1, 2.4, {
          grime: 0.5,
        });
        b.face("brick_soot", ax1, YP, az + 1.1, 0, 0, -1, 0, 1, 0, 1.1, 2.4, {
          grime: 0.5,
        });
        b.box("crate", 19.2, YP, az + 0.55, 0.9, 0.7, 0.7, { grime: 0.4 });
        b.box("leather", 19.2, YP + 0.7, az + 0.55, 0.5, 0.12, 0.4, {
          grime: 0.2,
          tint: 0x6a2a1e,
        }); // the player's case
        b.box("leather", 19.2, YP + 0.82, az + 0.76, 0.5, 0.36, 0.03, {
          grime: 0.2,
          tint: 0x6a2a1e,
        }); // open lid
        b.panel("decal", 19.2, YP + 1.0, az + 0.74, 0.3, 0.15, PI, {
          rect: K.decal("record"),
        });
        b.box("paint_black", 19.2, YP + 0.82, az + 0.55, 0.36, 0.01, 0.32);
        flames.push([
          18.5,
          K.candle(b, glows, 18.5, YP + 0.7, az + 0.4, 0.1, 0.03),
          az + 0.4,
        ]);
        flames.push([
          19.9,
          K.candle(b, glows, 19.9, YP + 0.7, az + 0.45, 0.16, 0.03),
          az + 0.45,
        ]);
        b.light(19.2, YP + 1.3, az - 0.2, 3.2, 0xffb060, 0.8);
        K.recordPlayer1 = K.w1(19.2, YP + 0.84, az + 0.55);
        anchor("record_player", 19.2, YP, az - 1.2, 0);
        colR(19.2, az + 0.55, 0.9, 0.7, YP, YP + 0.9);
      }
      // a sun banner over the stair arch
      b.panel("decal", H.x1 - 0.06, YP + 7.6, 44, 3.2, 3.2, -HP, {
        rect: K.decal("sun_gold"),
      });
      // general fill: warm, from the vault (makes the names readable), and a cooler gleam down the stair arch
      for (let x = H.x0 + 4; x < H.x1; x += 7)
        b.light(x, YP + 4.5, 44, 12, 0xffa050, 0.38);
      b.light(H.x1 + 1, YP + 2, 44, 5, 0xffb060, 0.6);
      b.zone = null;
      anchor("hall_entry", 13, YP, 44, -HP);
      anchor("hall_centre", 22, YP, 44, -HP);
    }

    // ===============================================================
    // THE STAIR DOWN (landing x 38..40, flight x 40..50.5 from YP to 0)
    // ===============================================================
    {
      const zA = 41.6,
        zB = 46.4; // walls
      b.zone = [37, -1, 40, 52, YP + 8, 48];
      col(38, 0, zA, 40, YP, zB, { surface: "concrete" });
      b.boxMM("limestone", 38, YP - 0.2, zA, 40, YP, zB, {
        faces: "t",
        grime: 0.5,
      });
      // steps (local geometry; colliders world)
      const n = Math.ceil(YP / 0.2),
        run = 10.5,
        step = run / n,
        rise = YP / n;
      for (let i = 0; i < n; i++) {
        const x = 40 + i * step + step / 2,
          top = YP - rise * (i + 1);
        b.box(
          "limestone",
          x,
          -0.05,
          (zA + zB) / 2,
          step + 0.02,
          top + 0.05,
          zB - zA,
          { grime: 0.5, faces: "nsewt", tint: 0xb0a898 },
        );
        b.box(
          "iron",
          x - step / 2 + 0.03,
          top - 0.03,
          (zA + zB) / 2,
          0.06,
          0.05,
          zB - zA,
          { grime: 0.3 },
        );
        K.colRot(
          O.x + x,
          O.z + (zA + zB) / 2,
          step + 0.02,
          zB - zA,
          -0.05,
          top,
          0,
          { surface: "concrete" },
        );
        if (i % 2 === 0)
          for (const sz of [zA + 0.25, zB - 0.25])
            if (r() < 0.85)
              flames.push([
                x,
                K.candle(
                  b,
                  glows,
                  x + (r() - 0.5) * 0.1,
                  top,
                  sz + (r() - 0.5) * 0.08,
                  0.05 + r() * 0.2,
                  0.025 + r() * 0.015,
                ),
                sz,
              ]);
      }
      // sloped walls and ceiling following the flight
      const slope = (x) =>
        x <= 40 ? YP : x >= 50.5 ? 0 : YP - ((x - 40) / run) * YP;
      const wallH = 3.6;
      for (const [zz, nz] of [
        [zA, 1],
        [zB, -1],
      ]) {
        for (let x = 38; x < 52; x += 1) {
          const xa = x,
            xb2 = x + 1;
          const p =
            nz > 0
              ? [
                  [xa, slope(xa) - 0.2, zz],
                  [xb2, slope(xb2) - 0.2, zz],
                  [xb2, slope(xb2) + wallH, zz],
                  [xa, slope(xa) + wallH, zz],
                ]
              : [
                  [xb2, slope(xb2) - 0.2, zz],
                  [xa, slope(xa) - 0.2, zz],
                  [xa, slope(xa) + wallH, zz],
                  [xb2, slope(xb2) + wallH, zz],
                ];
          b.quad("brick_soot", p[0], p[1], p[2], p[3], { grime: 0.6 });
        }
        col(
          38,
          -0.1,
          nz > 0 ? zA - 0.6 : zB,
          52,
          YP + wallH,
          nz > 0 ? zA : zB + 0.6,
        );
      }
      for (let x = 38; x < 52; x += 1) {
        const ya = slope(x) + wallH,
          yb2 = slope(x + 1) + wallH;
        b.quad(
          "brick_soot",
          [x, ya, zA],
          [x + 1, yb2, zA],
          [x + 1, yb2, zB],
          [x, ya, zB],
          { grime: 0.6 },
        );
        if (x % 2 === 0)
          b.beam("iron", x, ya - 0.08, zA, x, ya - 0.08, zB, 0.12, { d: 0.12 });
      }
      // handrail
      for (let x = 40; x < 50.5; x += 1.5)
        b.beam(
          "iron",
          x,
          slope(x) + 0.05,
          zB - 0.12,
          x,
          slope(x) + 0.95,
          zB - 0.12,
          0.03,
          { round: 6 },
        );
      b.beam(
        "brass_dark",
        40,
        YP + 0.95,
        zB - 0.12,
        50.5,
        0.95,
        zB - 0.12,
        0.045,
        { round: 8 },
      );
      for (let x = 40; x < 51; x += 1.6)
        b.light(x, slope(x) + 0.8, 44, 3.4, 0xffa850, 0.7);
      b.zone = null;
      anchor("stair_top", 38.6, YP, 44, -HP);
      anchor("stair_bottom", 51.5, 0, 44, -HP);
    }

    // ===============================================================
    // M42 ANTECHAMBER (y 0) — the M42 door in the east wall
    // ===============================================================
    const A = D.ANTE;
    {
      b.zone = [A.x0 - 1, -1, A.z0 - 1, A.x1 + 1, 7, D.SHOP.z1 + 1];
      const AH = 5.6;
      b.boxMM("concrete_grey", A.x0, -0.2, A.z0, A.x1, 0.0, A.z1, {
        faces: "t",
        grime: 0.6,
        seg: 1.4,
      });
      b.face(
        "concrete_soot",
        A.x0,
        0,
        A.z1,
        0,
        0,
        -1,
        0,
        1,
        0,
        A.z1 - 46.4,
        AH,
        { grime: 0.7 },
      ); // west wall north of the stair
      b.face(
        "concrete_soot",
        A.x0,
        0,
        41.6,
        0,
        0,
        -1,
        0,
        1,
        0,
        41.6 - A.z0,
        AH,
        { grime: 0.7 },
      );
      b.face(
        "concrete_soot",
        A.x0,
        3.6,
        46.4,
        0,
        0,
        -1,
        0,
        1,
        0,
        4.8,
        AH - 3.6,
        { grime: 0.7 },
      );
      b.face(
        "concrete_soot",
        A.x0,
        0,
        A.z0,
        1,
        0,
        0,
        0,
        1,
        0,
        A.x1 - A.x0,
        AH,
        { grime: 0.7 },
      ); // south wall... (north side z0)
      // north wall (z0) faces +z
      // south wall (z1) with the opening to the workshop x 56..60
      b.face("concrete_soot", A.x1, 0, A.z1, -1, 0, 0, 0, 1, 0, A.x1 - 60, AH, {
        grime: 0.7,
      });
      b.face("concrete_soot", 56, 0, A.z1, -1, 0, 0, 0, 1, 0, 56 - A.x0, AH, {
        grime: 0.7,
      });
      b.face("concrete_soot", 60, 3.0, A.z1, -1, 0, 0, 0, 1, 0, 4, AH - 3.0, {
        grime: 0.7,
      });
      // east wall (x1) with the M42 door
      b.face(
        "concrete_soot",
        A.x1,
        0,
        A.z0,
        0,
        0,
        1,
        0,
        1,
        0,
        A.z1 - A.z0,
        AH,
        { grime: 0.7 },
      );
      b.face(
        "concrete_soot",
        A.x0,
        AH,
        A.z0,
        1,
        0,
        0,
        0,
        0,
        1,
        A.x1 - A.x0,
        A.z1 - A.z0,
        { grime: 0.6, uv: "plane" },
      );
      // tile wainscot
      b.box(
        "tile_dirty",
        (A.x0 + A.x1) / 2,
        0,
        A.z0 + 0.03,
        A.x1 - A.x0,
        1.4,
        0.04,
        { faces: "s", grime: 0.6 },
      );
      b.box(
        "tile_dirty",
        A.x1 - 0.03,
        0,
        (A.z0 + A.z1) / 2,
        0.04,
        1.4,
        A.z1 - A.z0,
        { faces: "w", grime: 0.6 },
      );
      col(A.x0 - 0.6, 0, A.z0, A.x0, AH + 2, 41.6);
      col(A.x0 - 0.6, 0, 46.4, A.x0, AH + 2, A.z1);
      col(A.x0, 0, A.z0 - 0.6, A.x1, AH + 2, A.z0);
      col(A.x0, 0, A.z1, 56, AH + 2, A.z1 + 0.6);
      col(60, 0, A.z1, A.x1, AH + 2, A.z1 + 0.6);
      col(A.x1, 0, A.z0, A.x1 + 0.6, AH + 2, A.z1);
      // THE M42 DOOR: two riveted sliding leaves, a painted sun across both
      const dz = 46,
        dw = 4.6,
        dh = 4.6,
        dx = A.x1 - 0.12;
      b.box("iron", dx - 0.05, 0, dz, 0.3, dh + 0.35, dw + 0.7, { grime: 0.6 });
      for (const s of [-1, 1])
        b.box(
          "rust",
          dx - 0.22,
          0.02,
          dz + (s * dw) / 4,
          0.12,
          dh,
          dw / 2 - 0.03,
          { grime: 0.55 },
        );
      for (let k = 0; k < 4; k++)
        b.box("iron", dx - 0.3, 0.4 + k * 1.15, dz, 0.04, 0.08, dw, {
          grime: 0.4,
        });
      b.box("steel", dx - 0.33, 1.9, dz - 0.25, 0.06, 0.6, 0.08, {
        tint: 0x8a8680,
      });
      b.box("steel", dx - 0.33, 1.9, dz + 0.25, 0.06, 0.6, 0.08, {
        tint: 0x8a8680,
      });
      b.panel("decal", dx - 0.3, 2.4, dz, 3.8, 3.8, -HP, {
        rect: K.decal("sun_gold"),
      });
      b.panel("decal", dx - 0.28, dh + 0.75, dz, 3.0, 0.6, -HP, {
        rect: K.decal("m42"),
      });
      b.panel("decal", dx - 0.28, 0.95, dz - 3.8, 4.4, 0.36, -HP, {
        rect: K.decal("authorized"),
      });
      b.panel("decal", dx - 0.28, 1.6, dz + 3.6, 3.4, 0.34, -HP, {
        rect: K.decal("danger"),
      });
      // candles banked at the foot of the door, offerings
      for (let i = 0; i < 40; i++) {
        const z = dz - 2.8 + r() * 5.6,
          x = dx - 0.6 - r() * 1.2;
        flames.push([
          x,
          K.candle(b, glows, x, 0, z, 0.05 + r() * 0.3, 0.03 + r() * 0.02),
          z,
        ]);
      }
      b.light(dx - 1.6, 1.0, dz, 7, 0xffa040, 1.25);
      b.light(dx - 3, 4.6, dz, 10, 0xffb060, 0.4);
      // allies hold the door: sandbags (theirs, put down this morning)
      for (let k = 0; k < 7; k++)
        b.box(
          "burlap",
          57 + k * 0.62,
          0,
          50.6 + (k % 2) * 0.1,
          0.6,
          0.32,
          0.38,
          { grime: 0.6, tint: 0x9a8a6a },
        );
      for (let k = 0; k < 6; k++)
        b.box("burlap", 57.3 + k * 0.62, 0.32, 50.65, 0.6, 0.3, 0.38, {
          grime: 0.6,
          tint: 0x8a7a5a,
        });
      col(56.8, 0, 50.3, 61.4, 0.62, 51.0, { surface: "dirt" });
      anchor("m42_door", dx - 1.6, 0, dz, -HP);
      anchor("m42_door_face", dx - 0.4, 1.4, dz, -HP);
      anchor("ally1", 55, 0, 41, HP * 0.5);
      anchor("ally2", 55.5, 0, 52, HP * 1.5);
      anchor("ally3", 62, 0, 40, 0);
      b.zone = null;
    }
    // ===============================================================
    // BROTHER TINDER'S WORKSHOP (south of the antechamber)
    // ===============================================================
    const S = D.SHOP;
    {
      b.zone = [S.x0 - 1, -1, S.z0 - 1, S.x1 + 1, 6, S.z1 + 1];
      const SH = 4.2;
      b.boxMM("concrete_grey", S.x0, -0.2, S.z0, S.x1, 0, S.z1, {
        faces: "t",
        grime: 0.75,
      });
      b.face(
        "concrete_soot",
        S.x0,
        0,
        S.z1,
        0,
        0,
        -1,
        0,
        1,
        0,
        S.z1 - S.z0,
        SH,
        { grime: 0.7 },
      );
      b.face(
        "concrete_soot",
        S.x1,
        0,
        S.z0,
        0,
        0,
        1,
        0,
        1,
        0,
        S.z1 - S.z0,
        SH,
        { grime: 0.7 },
      );
      b.face(
        "concrete_soot",
        S.x1,
        0,
        S.z1,
        -1,
        0,
        0,
        0,
        1,
        0,
        S.x1 - S.x0,
        SH,
        { grime: 0.7 },
      );
      b.face("concrete_soot", S.x0, 0, S.z0, 1, 0, 0, 0, 1, 0, 56 - S.x0, SH, {
        grime: 0.7,
      });
      b.face("concrete_soot", 60, 0, S.z0, 1, 0, 0, 0, 1, 0, S.x1 - 60, SH, {
        grime: 0.7,
      });
      b.face("concrete_soot", 56, 3.0, S.z0, 1, 0, 0, 0, 1, 0, 4, SH - 3.0, {
        grime: 0.7,
      });
      b.face(
        "concrete_soot",
        S.x0,
        SH,
        S.z0,
        1,
        0,
        0,
        0,
        0,
        1,
        S.x1 - S.x0,
        S.z1 - S.z0,
        { grime: 0.6, uv: "plane" },
      );
      col(S.x0 - 0.6, 0, S.z0, S.x0, SH + 1, S.z1);
      col(S.x1, 0, S.z0, S.x1 + 0.6, SH + 1, S.z1);
      col(S.x0, 0, S.z1, S.x1, SH + 1, S.z1 + 0.6);
      // drill press (column, head, table, the brass blank under the bit)
      const px = 55,
        pz = 60;
      b.box("iron", px, 0, pz, 0.7, 0.12, 0.6);
      b.cyl("paint_green", px, 0.12, pz - 0.15, 0.07, 0.07, 1.9, 10);
      b.box("paint_green", px, 1.5, pz, 0.36, 0.45, 0.6, { grime: 0.5 });
      b.cyl("steel", px, 1.2, pz + 0.15, 0.025, 0.012, 0.3, 8, {
        tint: 0x9a9a9a,
      });
      b.box("iron", px, 0.95, pz + 0.15, 0.5, 0.05, 0.45);
      b.cyl("brass", px, 1.0, pz + 0.15, 0.07, 0.07, 0.14, 12);
      for (let i = 0; i < 30; i++)
        b.box(
          "brass",
          px - 0.3 + r() * 0.6,
          0.002,
          pz - 0.2 + r() * 0.8,
          0.03,
          0.004,
          0.012,
          { yaw: r() * 6, grime: 0 },
        );
      colR(px, pz, 0.8, 0.8, 0, 2.0);
      // lathe
      b.box("paint_grey", 59.5, 0, 64.6, 2.4, 0.85, 0.6, { grime: 0.6 });
      b.box("iron", 59.5, 0.85, 64.6, 2.2, 0.1, 0.35);
      b.box("paint_grey", 58.5, 0.95, 64.6, 0.45, 0.4, 0.45);
      b.geo("steel", K.T.cyl12, {
        x: 59.4,
        y: 1.15,
        z: 64.6,
        rz: HP,
        sx: 0.05,
        sy: 1.0,
        sz: 0.05,
        tint: 0x8a8a84,
      });
      colR(59.5, 64.6, 2.4, 0.6, 0, 1.2);
      // workbench with keyway blanks, files, the schematic pinned above
      b.box("wood_dark", 63.8, 0.9, 59, 1.0, 0.07, 3.6, { grime: 0.5 });
      for (const dz2 of [-1.6, 1.6])
        for (const dx2 of [-0.4, 0.4])
          b.box("wood_dark", 63.8 + dx2, 0, 59 + dz2, 0.07, 0.9, 0.07);
      for (let i = 0; i < 8; i++)
        b.cyl(
          "brass",
          63.6 + r() * 0.4,
          0.97,
          57.8 + r() * 2.4,
          0.03,
          0.03,
          0.09,
          8,
        );
      for (let i = 0; i < 5; i++)
        b.box(
          "steel",
          63.6 + r() * 0.4,
          0.975,
          58 + r() * 2,
          0.25,
          0.01,
          0.025,
          { yaw: r(), tint: 0x9a9a9a },
        );
      b.panel("decal", S.x1 - 0.02, 1.9, 59, 0.9, 0.45, -HP, {
        rect: K.decal("schematic"),
      });
      b.panel("decal", S.x1 - 0.02, 1.9, 60.2, 0.9, 0.45, -HP, {
        rect: K.decal("ledger"),
      });
      colR(63.8, 59, 1.0, 3.6, 0, 1.0, 0, { surface: "wood" });
      // the generator that runs the press, exhaust pipe to the ceiling
      b.box("paint_red", 53.5, 0, 64.5, 1.1, 0.8, 0.7, { grime: 0.7 });
      b.cyl("iron", 53.2, 0.8, 64.5, 0.06, 0.06, SH - 0.8, 8);
      colR(53.5, 64.5, 1.1, 0.7, 0, 0.85);
      b.cable("rubber", 53.9, 0.4, 64.2, 55, 1.6, 60.3, 0.4, 0.03, 8);
      // work lights (bare bulbs on a cable, hot white) + a cot
      for (const [lx, lz] of [
        [55.5, 58],
        [60, 61],
        [63.5, 58.5],
      ]) {
        b.beam("rubber", lx, SH, lz, lx, SH - 0.7, lz, 0.015, { round: 6 });
        b.box("lit", lx, SH - 0.82, lz, 0.08, 0.12, 0.08, { tint: 0xfff2d0 });
        glows.add(lx, SH - 0.76, lz, 0xfff0c8, 0.5, 0.05);
        b.light(lx, SH - 0.9, lz, 6.5, 0xfff0d8, 1.25);
      }
      mattress(53.4, 0, 56.8, 0);
      anchor("drill", px + 1.0, 0, pz + 0.4, HP);
      anchor("workshop", 59, 0, 58.5, PI);
      anchor("tinder", 56.2, 0, 60.4, HP);
      anchor("crew1", 62.5, 0, 59.5, -HP);
      anchor("crew2", 58.8, 0, 63.4, PI);
      b.zone = null;
    }

    // ---------------------------------------------------------------
    // aggregate candle light: one baked light per ~2.5 m cluster of flames
    // ---------------------------------------------------------------
    const buckets = new Map();
    for (const f of flames) {
      const k =
        Math.round(f[0] / 2.5) +
        "," +
        Math.round(f[1] / 2) +
        "," +
        Math.round(f[2] / 2.5);
      const a = buckets.get(k);
      if (a) {
        a[0] += f[0];
        a[1] += f[1];
        a[2] += f[2];
        a[3]++;
      } else buckets.set(k, [f[0], f[1], f[2], 1]);
    }
    for (const a of buckets.values()) {
      const n = a[3];
      b.light(
        a[0] / n,
        a[1] / n + 0.25,
        a[2] / n,
        2.2 + Math.min(3.2, n * 0.35),
        0xffa850,
        Math.min(1.3, 0.35 + n * 0.08),
      );
    }

    // anchors used by the content files
    anchor("platform_mid", 4, YP, 30, PI);
    anchor("platform_south", 4, YP, 70, 0);
    anchor("track_mid", TX + 2.6, YT, 46, PI);
    for (let i = 1; i <= 6; i++)
      anchor("spawn" + i, 3 + (i % 2) * 3, YP, 8 + i * 11, PI);

    K.t61stats = {
      tris: b.tris(),
      flames: flames.length,
      lights: b.lights.length,
    };
    b.finish(root, { receive: true });
    glows.finish(root);
    root.visible = false;
  });
})();
