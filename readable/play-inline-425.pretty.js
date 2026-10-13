/* src/poi_harbor2/21_pier_a_interior.js */
/* =====================================================================
 * NEW RAD CITY — poi_harbor2 / 21_pier_a_interior.js
 * PIER A — interior cell 'pier_a' (origin 10200,0,2000; lifted +6).
 * Same orientation as the pier outside: the land end (head house) east,
 * the clock tower west.
 *
 *  WATCH ROOM (head house, x 8..20): alarm-telegraph desk with the last
 *   watchman still at it, turnout gear on hooks, lockers, the brass pole,
 *   the harbour chart, dispatch terminal; stair up to
 *  UPPER FLOOR (y 4.4): the dormitory (bunks, footlockers, stove) and the
 *   HARBOR MASTER's office (desk, log terminal → "Nine Forty-Seven", wall
 *   safe with the clock key).
 *  BOATHOUSE (x −16..8): double-height shed around the flooded slip — side
 *   walkways with hose racks and reels, a davit over the sunken fire launch,
 *   shellback nests and egg clutches glowing in the shallows, a daylight shaft
 *   through the roof hole — and at the west end, on the landing before the
 *   tower, OLD BARNACLE's clutch (named shellback boss).
 *  TOWER BASE (x −22..−16): stair to the landing, ladder to the CLOCK ROOM
 *   (y 13.8): four back-lit dials, the iron movement, the winding crank.
 *   The tower's street door is barred from inside (one-way shortcut out).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE) return;
  const PV = G._ph2;
  const K = PV.kit;
  const PI = Math.PI,
    HP = PI / 2;

  PV.paInterior = function (ctx) {
    const O = ctx.O,
      PA = PV.pa;
    const b = K.builder({
      name: "pa_int",
      off: O,
      lit: true,
      amb: [0.12, 0.125, 0.125],
      floors: [0, 4.4, -1.4, 13.8],
      grime: 0.6,
    });
    const r = K.rng("pa_int");
    const A = (name, x, y, z, yaw) => {
      const v = K.anchor(ctx, name, x, y, z);
      v.yaw = yaw || 0;
      return v;
    };
    const cream = [0.86, 0.82, 0.7],
      green = [0.56, 0.72, 0.6];
    const WATCH = [7.8, -0.5, -6.2, 20.2, 4.3, 6.2],
      UP = [7.8, 4.3, -6.2, 20.2, 8.5, 6.2],
      SHED = [-16.2, -2, -6.2, 8.2, 8, 6.2],
      TWR = [-22.2, -0.5, -3.2, -15.8, 9.5, 3.2],
      CLK = [-22.2, 13.6, -3.2, -15.8, 17.6, 3.2];

    // ================================================= WATCH ROOM (x 8..20, z −6..6)
    K.gap(ctx, 20, 0, 2.0, 0, 2.9); // street door
    K.gap(ctx, 8, 0, 2.6, 0, 3.3, { casing: false }); // to the boathouse
    K.room(b, ctx, {
      x0: 8,
      z0: -6,
      x1: 20,
      z1: 6,
      y: 0,
      h: 4.2,
      floor: "planks_iron",
      fc: [0.62, 0.56, 0.48],
      wall: "clapboard",
      wc: [0.72, 0.7, 0.62],
      wain: "wood",
      wainC: [0.5, 0.36, 0.26],
      wainH: 1.1,
      noCeil: true,
      trimMat: "ferry_green",
    });
    // ceiling (= upper floor underside) with the stairwell + pole holes; upper floor slab
    const slab = (x0, z0, x1, z1) => {
      b.face("tin", x0, 4.2, z0, 1, 0, 0, 0, 0, 1, x1 - x0, z1 - z0, {
        uv: "top",
        tint: [0.62, 0.6, 0.54],
        grime: 0.4,
      });
      b.face("planks_iron", x0, 4.4, z1, 1, 0, 0, 0, 0, -1, x1 - x0, z1 - z0, {
        uv: "top",
        tint: [0.6, 0.54, 0.46],
      });
      b.col(x0, 4.2, z0, x1, 4.4, z1, { tag: "floor", surface: "wood" });
    };
    slab(8, -4.5, 20, 6);
    slab(14.2, -6, 20, -4.5);
    // stair along the north wall: x 8.2 → 14.2 rising east
    K.stairs(b, 8.2, -5.9, 14.2, -4.6, 0, 4.4, "+x", {
      mat: "wood",
      tint: [0.55, 0.44, 0.32],
      rail: "r",
      railMat: "ferry_green",
      nosing: "brass_old",
    });
    K.railing(b, 8.1, -4.5, 14.2, -4.5, 4.4, {
      mat: "ferry_green",
      handMat: "mahogany",
      h: 1.0,
    });
    // windows (daylight): east wall either side of the door, south wall
    // real two-over-two sash windows (frame, muntins, sill, reveal); the SE one is half covered by a torn blind
    for (const z of [-3.6, 3.6])
      K.intWindow(b, 19.995, 1.25, z, -1, 0, 1.2, 2.0, {
        cols: 2,
        rows: 2,
        frame: "ferry_green",
        frameTint: green,
        sky: z > 0 ? [0.4, 0.42, 0.4] : [0.6, 0.64, 0.64],
        blind: z > 0 ? 0.55 : 0,
        revealMat: "wood",
        revealTint: [0.5, 0.42, 0.34],
        light: 0.8,
        lightR: 7,
        box: WATCH,
      });
    for (const x of [11, 16.5])
      K.intWindow(b, x, 1.25, 5.995, 0, -1, 1.2, 2.0, {
        cols: 2,
        rows: 2,
        frame: "ferry_green",
        frameTint: green,
        sky: x > 12 ? [0.58, 0.62, 0.62] : [0.34, 0.34, 0.32],
        blind: x > 12 ? 0 : 0.8,
        revealMat: "wood",
        revealTint: [0.5, 0.42, 0.34],
        light: x > 12 ? 0.7 : 0.25,
        lightR: 6,
        box: WATCH,
      });
    // emergency lamp (red) still burning over the door
    b.box("fdny_red", 19.8, 3.3, 0, 0.16, 0.2, 0.3);
    b.geo("lamp", K.sphereGeo(), {
      x: 19.7,
      y: 3.2,
      z: 0,
      s: 0.09,
      tint: [1, 0.2, 0.12],
    });
    b.light(18.8, 3.0, 0, [1, 0.25, 0.15], 0.9, 6, { box: WATCH });
    b.glow(19.6, 3.2, 0, [0.9, 0.15, 0.08], 0.9);
    // the watch desk: alarm telegraph, register, bells; the last watchman at it
    K.table(b, 12.5, 0, 2.6, 2.6, 0.9, {
      mat: "mahogany",
      tint: [0.5, 0.32, 0.2],
    });
    b.boxMM("mahogany", 11.4, 0.76, 3.0, 13.6, 1.25, 3.05, {
      tint: [0.46, 0.3, 0.2],
    });
    for (let k = 0; k < 5; k++) {
      b.cyl("brass", 11.7 + k * 0.45, 1.3, 3.0, 0.1, 0.1, 0.04, 10);
      b.geo("brass", K.sphereGeo(), {
        x: 11.7 + k * 0.45,
        y: 1.42,
        z: 3.0,
        s: 0.09,
        sy: 0.07,
      });
    }
    b.box("brass_old", 12.9, 0.76, 2.4, 0.5, 0.25, 0.3);
    b.pipe("flat", 12.9, 1.01, 2.25, 12.6, 0.77, 1.9, 0.012, 3, {
      tint: [0.9, 0.88, 0.8],
    }); // ticker tape register + tape
    for (let k = 0; k < 7; k++)
      b.box(
        "flat",
        12.2 + r() * 1.6,
        0.005,
        1.4 + r() * 1.2,
        0.03,
        0.002,
        0.6 + r(),
        { yaw: r() * 3, tint: [0.9, 0.88, 0.8] },
      ); // tape on the floor
    K.chair(b, 12.4, 0, 1.8, PI, { mat: "wood_dark" });
    b.plate(
      "art",
      12.5,
      2.4,
      5.88,
      0,
      -1,
      2.2,
      0.5,
      K.signCell("pa_alarmboard", "BOX ALARM TELEGRAPH — MARINE 1", 384, 64, {
        bg: "#1e2a22",
        fg: "#e8d8a8",
        font: "Georgia, serif",
      }),
      { off: 0.02 },
    );
    K.lamp(b, 12.5, 3.2, 2.6, "pendant", [1, 0.8, 0.55], 0, 0, {
      ceil: 4.2,
      dead: true,
    });
    // harbour chart (north wall, above the stair)
    const chart = K.paint("art", "ph2_pa_chart", 512, 320, (x, X, Y, W, Hh) => {
      x.fillStyle = "#d8ccaa";
      x.fillRect(X, Y, W, Hh);
      x.fillStyle = "#b8c8c0";
      x.fillRect(X, Y, W, Hh);
      x.fillStyle = "#d8cca8";
      x.beginPath();
      x.moveTo(X + 180, Y);
      x.lineTo(X + 330, Y);
      x.lineTo(X + 300, Y + 180);
      x.lineTo(X + 240, Y + 230);
      x.lineTo(X + 200, Y + 170);
      x.closePath();
      x.fill();
      x.beginPath();
      x.moveTo(X + 380, Y + 120);
      x.lineTo(X + W, Y + 60);
      x.lineTo(X + W, Y + Hh);
      x.lineTo(X + 400, Y + Hh);
      x.closePath();
      x.fill();
      x.beginPath();
      x.ellipse(X + 110, Y + 270, 22, 16, 0, 0, 6.3);
      x.fill();
      x.strokeStyle = "rgba(40,60,80,0.5)";
      x.lineWidth = 1;
      for (let k = 0; k < 20; k++) {
        x.beginPath();
        x.moveTo(X + ((k * 37) % W), Y);
        x.lineTo(X + ((k * 53) % W), Y + Hh);
        x.stroke();
      }
      x.fillStyle = "#6a1a14";
      x.font = "bold 16px Georgia, serif";
      x.fillText("UPPER NEW YORK BAY", X + 150, Y + 290);
      x.fillText("PIER A ✚", X + 150, Y + 222);
      x.fillText("GOVERNORS IS.", X + 330, Y + 250);
      x.strokeStyle = "#8a1a14";
      x.lineWidth = 3;
      x.beginPath();
      x.arc(X + 190, Y + 215, 14, 0, 6.3);
      x.stroke();
      K.stains(x, X, Y, W, Hh, 14, 5101, 0.4, [60, 45, 25]);
    });
    K.framed(b, 17.2, 2.6, -5.88, 0, 1, 2.6, 1.6, chart, {
      frame: "wood_dark",
    });
    // turnout gear on hooks (south wall): coats, helmets, boots below
    for (let k = 0; k < 6; k++) {
      const x = 9.2 + k * 0.72;
      b.box("black_iron", x, 1.95, 5.86, 0.05, 0.05, 0.12);
      if (k === 3) continue;
      b.box("canvas_tarp", x, 0.95, 5.72, 0.5, 1.0, 0.22, {
        tint: [0.34, 0.3, 0.24],
      });
      b.box("flat", x, 1.05, 5.6, 0.5, 0.05, 0.02, { tint: [0.9, 0.85, 0.3] }); // reflective stripe
      b.geo("leather", K.sphereGeo(), {
        x,
        y: 2.1,
        z: 5.72,
        sx: 0.2,
        sy: 0.12,
        sz: 0.24,
        tint: [0.3, 0.22, 0.14],
      });
      b.box("rubber", x, 0, 5.6, 0.3, 0.35, 0.18, { tint: [0.1, 0.1, 0.1] });
    }
    // brass sliding pole (from the dormitory above) + its floor hole
    b.cyl("brass", 16.5, 0, 3.2, 0.05, 0.05, 4.4, 8);
    b.cyl("rubber", 16.5, 0, 3.2, 0.5, 0.5, 0.06, 12, {
      tint: [0.2, 0.2, 0.2],
    });
    b.col(16.4, 0, 3.1, 16.6, 4.4, 3.3, { tag: "pole", walkable: false });
    // extinguishers, lockers are props
    for (const z of [-2.2, -1.6]) {
      b.cyl("fdny_red", 19.7, 0, z, 0.13, 0.13, 0.62, 10, {
        tint: [0.9, 0.25, 0.18],
      });
      b.cyl("black_iron", 19.7, 0.62, z, 0.04, 0.04, 0.12, 6);
    }
    K.framed(
      b,
      8.12,
      2.5,
      -2.8,
      1,
      0,
      1.0,
      1.0,
      K.paint("art", "ph2_pa_crest", 256, 256, (x, X, Y, W, Hh) => {
        x.fillStyle = "#1e2a22";
        x.fillRect(X, Y, W, Hh);
        x.fillStyle = "#b8342a";
        x.beginPath();
        for (let k = 0; k < 8; k++) {
          const a = (k * Math.PI) / 4,
            rr = k % 2 ? W * 0.18 : W * 0.44;
          x.lineTo(X + W / 2 + Math.cos(a) * rr, Y + Hh / 2 + Math.sin(a) * rr);
        }
        x.fill();
        x.fillStyle = "#e8d890";
        x.font = "bold 40px Georgia, serif";
        x.textAlign = "center";
        x.fillText("M1", X + W / 2, Y + Hh / 2 + 14);
        x.font = "bold 18px Georgia, serif";
        x.fillText("F.D.N.Y.", X + W / 2, Y + Hh - 20);
        K.stains(x, X, Y, W, Hh, 8, 5111, 0.4, [60, 45, 25]);
      }),
      { frame: "gold" },
    );
    K.clutter(b, 9, -4.2, 19.5, 5.5, 0, {
      n: 12,
      seed: 511,
      kinds: ["paper", "chair", "can", "debris"],
      avoid: [
        [11, 1.8, 14, 3.3],
        [15.8, 2.6, 17.2, 3.8],
      ],
    });
    b.hplate("decal", 14, 0.013, 0, 6, 5, 0.3, K.decal("puddle", 31));

    // ================================================= UPPER FLOOR (y 4.4): dormitory + harbour master
    const UY = 4.4;
    K.room(b, ctx, {
      x0: 8,
      z0: -6,
      x1: 20,
      z1: 6,
      y: UY,
      h: 3.8,
      noFloor: true,
      floor: "planks_iron",
      wall: "wallpaper_green",
      wc: [0.62, 0.62, 0.52],
      wain: "wood",
      wainC: [0.46, 0.34, 0.24],
      wainH: 1.0,
      ceil: "tin",
      cc: [0.58, 0.56, 0.5],
      trimMat: "wood_dark",
    });
    K.segWall(b, 14, -6, 14, 6, UY, UY + 3.8, 1, {
      mat: "wallpaper_green",
      tint: [0.62, 0.62, 0.52],
      both: true,
      gaps: [{ t: 3.2, w: 1.1, y1: UY + 2.2 }],
      wain: "wood",
      wainC: [0.46, 0.34, 0.24],
      wainH: 1.0,
    });
    // dormitory (x 8..14): six bunks, footlockers, a pot-belly stove, the pole hole
    for (let k = 0; k < 3; k++) {
      K.bed(b, 9.3, UY, 3.9 - k * 2.3 + 0.8, -HP, {
        w: 0.9,
        l: 1.9,
        tint: r.pick([
          [0.6, 0.56, 0.48],
          [0.5, 0.48, 0.42],
        ]),
      });
      K.bed(b, 12.6, UY, 3.9 - k * 2.3 + 0.8, HP, {
        w: 0.9,
        l: 1.9,
        tint: [0.58, 0.54, 0.46],
      });
    }
    b.cyl("cast_iron", 11, UY, -2.9, 0.35, 0.3, 0.9, 10, {
      tint: [0.25, 0.24, 0.22],
    });
    b.pipe("cast_iron", 11, UY + 0.9, -2.9, 11, UY + 3.8, -2.9, 0.08, 6);
    b.cyl("rubber", 16.5, UY + 0.005, 3.2, 0.42, 0.42, 0.01, 12, {
      tint: [0.02, 0.02, 0.02],
    }); // pole hole (dark)
    K.railing(b, 15.9, 2.6, 17.1, 2.6, UY, {
      h: 0.9,
      mat: "brass",
      handMat: "brass",
    });
    for (const z of [5.88])
      for (const x of [10, 12.2]) {
        b.quadN(
          "lamp",
          [x - 0.55, UY + 1.0, z],
          [x + 0.55, UY + 1.0, z],
          [x + 0.55, UY + 2.8, z],
          [x - 0.55, UY + 2.8, z],
          [0, 0, -1],
          { tint: [0.5, 0.54, 0.54] },
        );
        b.light(x, UY + 2, 4.9, [0.68, 0.72, 0.74], 0.55, 5, { box: UP });
      }
    K.framed(b, 8.12, UY + 1.9, 1.5, 1, 0, 0.7, 0.9, K.painting(21, 128, 160), {
      frame: "wood_dark",
    });
    // harbour master's office (x 14..20)
    K.table(b, 18.2, UY, 1.2, 1.8, 0.9, {
      mat: "mahogany",
      tint: [0.5, 0.32, 0.2],
    });
    K.chair(b, 18.9, UY, 1.2, -HP, { mat: "leather" });
    K.shelf(b, 19.7, UY, -3.5, -HP, 2.6, {
      h: 2.3,
      d: 0.35,
      levels: 5,
      items: ["book", "book", "box"],
      col: true,
      mat: "wood_dark",
      seed: 521,
    });
    b.box("brass_old", 17.8, UY + 0.76, 0.8, 0.22, 0.28, 0.22, {
      tint: [0.7, 0.6, 0.4],
    });
    b.geo("lamp", K.sphereGeo(), {
      x: 17.8,
      y: UY + 1.12,
      z: 0.8,
      s: 0.08,
      tint: [1, 0.8, 0.5],
    });
    b.light(17.9, UY + 1.4, 1.0, [1, 0.8, 0.5], 0.9, 5, { box: UP });
    b.glow(17.8, UY + 1.12, 0.8, [0.8, 0.55, 0.25], 0.8);
    for (const z of [-3.6, 3.6]) {
      b.quadN(
        "lamp",
        [19.88, UY + 1.0, z - 0.55],
        [19.88, UY + 1.0, z + 0.55],
        [19.88, UY + 2.8, z + 0.55],
        [19.88, UY + 2.8, z - 0.55],
        [-1, 0, 0],
        { tint: [0.5, 0.54, 0.54] },
      );
      b.light(18.8, UY + 2, z, [0.68, 0.72, 0.74], 0.5, 5, { box: UP });
    }
    K.framed(
      b,
      16.8,
      UY + 2.0,
      5.88,
      0,
      -1,
      1.2,
      0.9,
      K.photo("family", 3, 128, 96),
      { frame: "wood_dark" },
    );
    K.framed(b, 14.12, UY + 2.1, 3.5, 1, 0, 1.0, 1.2, K.painting(5, 128, 160), {
      frame: "gold",
    });
    A("keysafe", 19.85, UY + 1.3, -0.8, -HP);

    // ================================================= BOATHOUSE (x −16..8)
    const SL = { x0: -12, x1: 6, z0: -2.6, z1: 2.6, fy: -1.4, wy: -0.55 };
    // outer shell (walls, no floor — floors built piecewise; tall roof with trusses)
    K.gap(ctx, -16, 0, 1.8, 0, 2.6, { casing: false });
    K.room(b, ctx, {
      x0: -16,
      z0: -6,
      x1: 8,
      z1: 6,
      y: 0,
      h: 7.5,
      noFloor: true,
      noCeil: true,
      wall: "clapboard",
      wc: [0.6, 0.6, 0.54],
      wain: "planks_iron",
      wainC: [0.5, 0.44, 0.36],
      wainH: 1.2,
      trimMat: "ferry_green",
      open: { e: true },
    });
    // walkways (z −6..−2.6 and 2.6..6) + the west landing (x −16..−12)
    const floorAt = (x0, z0, x1, z1, y, mat, tint) => {
      b.face(mat, x0, y, z1, 1, 0, 0, 0, 0, -1, x1 - x0, z1 - z0, {
        uv: "top",
        tint,
      });
      b.col(x0, y - 0.3, z0, x1, y, z1, { tag: "floor", surface: "wood" });
    };
    floorAt(-16, -6, 8, SL.z0, 0, "deck", [0.6, 0.58, 0.52]);
    floorAt(-16, SL.z1, 8, 6, 0, "deck", [0.6, 0.58, 0.52]);
    floorAt(-16, SL.z0, SL.x0, SL.z1, 0, "deck", [0.58, 0.56, 0.5]);
    floorAt(SL.x1, SL.z0, 8, SL.z1, 0, "deck", [0.58, 0.56, 0.5]);
    // the slip: muddy bottom, stone/timber sides, flood water
    floorAt(SL.x0, SL.z0, SL.x1, SL.z1, SL.fy, "slime", [0.7, 0.72, 0.62]);
    for (const [z, nz] of [
      [SL.z0, 1],
      [SL.z1, -1],
    ])
      b.quadN(
        "wood_rotten",
        [SL.x0, SL.fy, z],
        [SL.x1, SL.fy, z],
        [SL.x1, 0, z],
        [SL.x0, 0, z],
        [0, 0, nz],
        { tint: [0.4, 0.4, 0.34] },
      );
    for (const [x, nx] of [
      [SL.x0, 1],
      [SL.x1, -1],
    ])
      b.quadN(
        "wood_rotten",
        [x, SL.fy, SL.z0],
        [x, SL.fy, SL.z1],
        [x, 0, SL.z1],
        [x, 0, SL.z0],
        [nx, 0, 0],
        { tint: [0.4, 0.4, 0.34] },
      );
    K.waterPlate(b, SL.x0, SL.z0, SL.x1, SL.z1, SL.wy);
    // ramp/steps down into the slip at the east end so you can wade in and back out
    for (let k = 0; k < 4; k++) {
      const x1s = SL.x1 - k * 0.55,
        y = -0.3 - k * 0.3;
      b.boxMM("planks_iron", x1s - 0.55, y - 0.1, -1.0, x1s, y, 1.0, {
        tint: [0.5, 0.46, 0.4],
        faces: "nsewt",
      });
      b.col(x1s - 0.55, SL.fy, -1.0, x1s, y, 1.0, {
        tag: "stairs",
        surface: "wood",
      });
    }
    // walkway edge rails (gaps at the slip steps), cleats, bollards
    K.railing(b, SL.x0, SL.z0 - 0.1, SL.x1, SL.z0 - 0.1, 0, {
      mat: "rust",
      handMat: "rust",
      h: 0.95,
    });
    K.railing(b, SL.x0, SL.z1 + 0.1, SL.x1, SL.z1 + 0.1, 0, {
      mat: "rust",
      handMat: "rust",
      h: 0.95,
    });
    for (let x = -10; x < 6; x += 4) {
      K.cleat(b, x, 0, SL.z0 - 0.35, 0);
      K.cleat(b, x + 2, 0, SL.z1 + 0.35, 0);
    }
    // roof: underside planks + trusses, the collapsed hole with a daylight shaft
    const RY = 7.5;
    for (const [z0, z1, s] of [
      [-6.4, 0, -1],
      [0, 6.4, 1],
    ])
      b.quadN(
        "wood_rotten",
        [-16, RY, s < 0 ? z0 : z1],
        [8, RY, s < 0 ? z0 : z1],
        [8, RY + 2.6, 0],
        [-16, RY + 2.6, 0],
        [0, -1, -s * 0.6],
        { tint: [0.4, 0.36, 0.3] },
      );
    for (let x = -14; x <= 6; x += 3) {
      b.beam("wood_dark", x, RY - 0.2, -6, x, RY - 0.2, 6, 0.2, 0.3, {
        tint: [0.45, 0.36, 0.28],
      });
      for (const s of [-1, 1])
        b.beam("wood_dark", x, RY - 0.1, s * 6, x, RY + 2.5, 0, 0.18, 0.22, {
          tint: [0.45, 0.36, 0.28],
        });
      b.beam("wood_dark", x, RY - 0.2, 0, x, RY + 2.5, 0, 0.12, 0.12);
    }
    for (const [x, nx] of [
      [-15.9, 1],
      [7.9, -1],
    ])
      K.tri(
        b,
        "clapboard",
        [x, RY, -6],
        [x, RY, 6],
        [x, RY + 2.6, 0],
        [nx, 0, 0],
        { tint: [0.52, 0.52, 0.46] },
      );
    b.quadN(
      "lamp",
      [-4, RY + 0.9, -4.9],
      [0.6, RY + 0.9, -4.9],
      [0.6, RY + 1.8, -3.3],
      [-4, RY + 1.8, -3.3],
      [0, -1, 0.5],
      { tint: [0.7, 0.74, 0.74] },
    );
    b.light(-1.7, 4, -3.5, [0.78, 0.82, 0.84], 1.5, 9, { box: SHED });
    b.light(-1.7, 0.6, -3.8, [0.7, 0.74, 0.76], 0.8, 4.5, { box: SHED });
    K.rubble(b, -2.2, 0, -4.4, 1.3, 0.7, {
      seed: 531,
      tint: [0.62, 0.56, 0.48],
    });
    for (let k = 0; k < 4; k++)
      b.beam(
        "wood_rotten",
        -4 + k * 1.2,
        0.2 + r() * 0.3,
        -5.2,
        -3.4 + k * 1.1,
        RY - 1.2,
        -3.2 + r(),
        0.15,
        0.2,
        { tint: [0.4, 0.34, 0.28] },
      );
    // high windows (dim daylight) along both long walls
    for (let x = -13; x <= 5; x += 4.5)
      for (const [z, nz] of [
        [-5.995, 1],
        [5.995, -1],
      ]) {
        const dim = (x + z) % 3 < 1;
        K.intWindow(b, x, 4.2, z, 0, nz, 1.0, 1.6, {
          cols: 2,
          rows: 2,
          frame: "ferry_green",
          frameTint: green,
          sky: dim ? [0.26, 0.27, 0.25] : [0.5, 0.55, 0.55],
          revealMat: "wood",
          revealTint: [0.44, 0.4, 0.34],
          light: dim ? 0.2 : 0.55,
          lightR: 7,
          box: SHED,
        });
      }
    // hanging work lamps along the walkways (battery-fed, a couple still burning) so the shed reads in the dark
    for (const [x, z, on] of [
      [-9, -4.4, 1],
      [-1.5, 4.4, 1],
      [4.5, -4.4, 0],
    ])
      K.lamp(b, x, 3.2, z, "cage", [1, 0.78, 0.5], on ? 0.9 : 0, 7, {
        ceil: 7.3,
        dead: !on,
        lightOpts: { box: SHED },
      });
    // hose racks & reels on the walls, the davit and the sunken fire launch
    for (let x = -10; x <= 4; x += 7) {
      b.box("ferry_green", x, 1.6, -5.82, 1.6, 0.08, 0.24, { tint: green });
      for (let k = 0; k < 5; k++)
        b.geo("canvas_tarp", K.unitCyl(8), {
          x: x - 0.6 + k * 0.3,
          y: 1.2,
          z: -5.7,
          sx: 0.09,
          sy: 0.8,
          sz: 0.09,
          tint: [0.72, 0.66, 0.5],
        });
      b.geo("fdny_red", K.torusGeo(), {
        x: x + 0.5,
        y: 0.75,
        z: 5.5,
        s: 0.55,
        sz: 1.1,
        ry: 0,
        tint: [0.75, 0.25, 0.2],
      });
    }
    b.pipe("rust", -6, 0, 3.2, -6, 5.2, 3.2, 0.12, 8);
    b.beam("rust", -6, 5.1, 3.2, -6, 5.6, 0, 0.14, 0.14);
    b.pipe("rust", -6, 5.5, 0.1, -6, 1.2, 0.1, 0.02, 4);
    b.cyl("rust", -6, 0.6, 3.8, 0.25, 0.25, 0.5, 10);
    K.hull(b, "hull_red", {
      cx: -4.5,
      cz: 0.3,
      len: 3.6,
      beam: 1.6,
      deck: -0.35,
      keel: -1.35,
      sheer: 0.3,
      kind: "bow",
      nu: 8,
      nv: 10,
      boot: -0.9,
      deckMat: "wood_rotten",
      rub: "rubber",
    });
    b.col(-5.4, SL.fy, -1.6, -3.6, -0.3, 2.1, {
      tag: "boat",
      surface: "metal",
    });
    // nests & egg clutches: in the shallows, on the walkways, and Old Barnacle's clutch on the west landing
    K.nest(b, -8.5, SL.fy + 0.1, 1.2, 1.1, 8, { seed: 541 });
    K.nest(b, 2.5, 0, 4.6, 0.9, 6, { seed: 542 });
    K.nest(b, -10.5, 0, -4.5, 1.0, 7, { seed: 543 });
    K.nest(b, -14.2, 0, 1.6, 1.4, 12, { seed: 544 });
    K.nest(b, -14.6, 0, -1.9, 1.1, 8, { seed: 545 });
    for (let k = 0; k < 14; k++) {
      const x = -15 + r() * 22,
        z = r() < 0.5 ? -5.5 + r() * 2.5 : 3 + r() * 2.5;
      b.box("shell", x, 0, z, 0.4 + r() * 0.5, 0.07, 0.3, {
        yaw: r() * 3,
        tint: [0.55, 0.38, 0.26],
      });
    }
    b.light(-14.3, 1.0, 0, [0.55, 0.85, 0.35], 1.1, 6.5, { box: SHED });
    b.light(-8.5, 0.2, 1.2, [0.5, 0.8, 0.35], 0.7, 4.5, { box: SHED });
    b.hplate("decal", -13.8, 0.013, 0, 4, 6, 0.2, K.decal("blood", 3));
    // dead harbour-patrol officer's flashlight still glowing (weak) by the launch
    b.cyl("black_iron", -3.1, 0.02, -3.4, 0.04, 0.04, 0.25, 6);
    b.glow(-3.1, 0.12, -3.3, [0.8, 0.75, 0.5], 0.5);
    K.clutter(b, -15.5, 3, 7.5, 5.9, 0, {
      n: 10,
      seed: 551,
      kinds: ["box", "can", "debris", "panel"],
      panelMat: "wood_rotten",
    });
    // Capt. Van Wyck, the harbor master ("I have to go down and see to the —"): drowned in the slip beside the launch,
    // his spare clock key still on his belt — the no-skill way to finish "Nine Forty-Seven" (safe needs Mechanics 50).
    K.loot(ctx, "skeleton", -2.4, SL.fy + 0.02, -1.7, 1.2, {
      pose: "lying",
      container: true,
      loot: "skeleton",
      name: "Harbor Master Van Wyck",
      items: [
        ["ph2_clock_key", 1],
        ["scrip", 12],
      ],
    });
    b.cyl("brass_old", -2.0, SL.fy + 0.05, -1.35, 0.09, 0.09, 0.03, 10, {
      tint: [0.9, 0.75, 0.4],
    }); // his cap badge in the mud
    b.light(-2.4, SL.wy + 0.3, -1.7, [0.62, 0.72, 0.66], 0.35, 3, {
      box: SHED,
    });
    A("boss", -13.4, 0, 0, -HP);
    A("spawn1", -9, 0, -4.4, -HP);
    A("spawn2", -3, 0, 4.3, HP);
    A("spawn3", 2, 0, -4.3, -HP);
    A("spawn4", -7, SL.fy, 0, 0);
    A("spawn5", 0, SL.fy, -1, PI);
    A("spawn6", -12, 0, 4.5, -HP);

    // ================================================= TOWER BASE (x −22..−16, z −3..3) + clock room
    K.gap(ctx, -22, 0, 1.4, 0, 2.3, { casing: false });
    K.room(b, ctx, {
      x0: -22,
      z0: -3,
      x1: -16,
      z1: 3,
      y: 0,
      h: 9.2,
      floor: "planks_iron",
      fc: [0.58, 0.54, 0.48],
      wall: "clapboard",
      wc: [0.62, 0.62, 0.56],
      wain: "planks_iron",
      wainC: [0.46, 0.42, 0.36],
      wainH: 1.2,
      ceil: "wood_rotten",
      cc: [0.4, 0.36, 0.3],
      trimMat: "ferry_green",
    });
    K.stairs(b, -21.9, 1.6, -16.4, 2.9, 0, 4.6, "-x", {
      mat: "wood",
      tint: [0.52, 0.42, 0.32],
      solid: false,
    });
    b.beam(
      "mahogany",
      -16.4,
      0.95,
      1.62,
      -20.6,
      4.6 * (4.2 / 5.5) + 0.95,
      1.62,
      0.06,
      0.06,
    ); // hand rope/rail (visual)
    b.boxMM("wood", -22, 4.3, -3, -20.6, 4.6, 1.6, {
      tint: [0.52, 0.42, 0.32],
      faces: "nsewtb",
    });
    b.col(-22, 4.3, -3, -20.6, 4.6, 1.6, { tag: "floor", surface: "wood" });
    K.railing(b, -20.6, -3, -20.6, 1.5, 4.6, {
      mat: "ferry_green",
      handMat: "mahogany",
      h: 1.0,
    });
    K.ladder(b, -21.3, -2.95, 4.6, 9.2, 0, 1, { w: 0.55, hoop: true });
    b.boxMM("paint_black", -21.8, 9.19, -3, -20.8, 9.2, -2, {
      tint: [0.02, 0.02, 0.02],
    }); // hatch
    // the memorial window (west) & a slit on the landing
    K.archWin(b, -21.9, 5.2, 1.0, 1, 0, 0.9, 2.4, {
      state: "lit",
      paneTint: [0.52, 0.56, 0.56],
      surround: "ferry_green",
      surroundTint: green,
      fw: 0.12,
      depth: 0.12,
      sill: true,
    });
    b.light(-20.8, 6.2, 1.0, [0.7, 0.74, 0.76], 0.7, 6, { box: TWR });
    b.light(-19, 1.8, 0, [0.5, 0.8, 0.35], 0.35, 5, { box: TWR });
    // bell rope hanging through the ceiling
    b.pipe("rope", -18.2, 9.2, -1.2, -18.2, 1.1, -1.2, 0.025, 4);
    b.geo("rope", K.sphereGeo(), {
      x: -18.2,
      y: 1.1,
      z: -1.2,
      sx: 0.06,
      sy: 0.12,
      sz: 0.06,
    });
    K.clutter(b, -21.7, -2.8, -16.3, 1.4, 0, {
      n: 5,
      seed: 561,
      kinds: ["debris", "paper", "can"],
    });
    // the barred west door (inside face)
    b.boxMM("ferry_green", -21.98, 0, -0.7, -21.9, 2.3, 0.7, {
      tint: [0.5, 0.62, 0.54],
    });
    b.beam("wood_rotten", -21.84, 1.2, -1.0, -21.84, 1.2, 1.0, 0.14, 0.2, {
      tint: [0.5, 0.42, 0.34],
    });
    for (const z of [-0.85, 0.85])
      b.box("black_iron", -21.86, 1.1, z, 0.1, 0.3, 0.08);

    // CLOCK ROOM (y 13.8)
    const CY = 13.8;
    K.room(b, ctx, {
      x0: -22,
      z0: -3,
      x1: -16,
      z1: 3,
      y: CY,
      h: 3.6,
      floor: "planks_iron",
      fc: [0.5, 0.46, 0.4],
      wall: "clapboard",
      wc: [0.5, 0.5, 0.46],
      ceil: "wood_rotten",
      cc: [0.36, 0.32, 0.28],
      trimMat: "ferry_green",
    });
    const dialIn = K.paint(
      "art",
      "ph2_pa_dial_in",
      256,
      256,
      (x, X, Y, W, Hh) => {
        const cx = X + W / 2,
          cy = Y + Hh / 2,
          R = W * 0.48;
        x.fillStyle = "#000";
        x.fillRect(X, Y, W, Hh);
        const g = x.createRadialGradient(cx, cy, R * 0.1, cx, cy, R);
        g.addColorStop(0, "#fff6dc");
        g.addColorStop(1, "#d8cca8");
        x.fillStyle = g;
        x.beginPath();
        x.arc(cx, cy, R, 0, 6.3);
        x.fill();
        x.save();
        x.translate(cx, cy);
        x.scale(-1, 1); // numerals seen from behind (mirrored)
        x.fillStyle = "rgba(40,40,30,0.55)";
        x.textAlign = "center";
        x.textBaseline = "middle";
        x.font = "bold 24px Georgia, serif";
        const RN = [
          "XII",
          "I",
          "II",
          "III",
          "IIII",
          "V",
          "VI",
          "VII",
          "VIII",
          "IX",
          "X",
          "XI",
        ];
        for (let k = 0; k < 12; k++) {
          const a = (k / 12) * Math.PI * 2 - Math.PI / 2;
          x.fillText(RN[k], Math.cos(a) * R * 0.78, Math.sin(a) * R * 0.78);
        }
        x.restore();
        x.strokeStyle = "#1a1a14";
        x.lineWidth = 5;
        for (let k = 0; k < 4; k++) {
          x.beginPath();
          x.moveTo(cx - R, cy + (k - 1.5) * R * 0.5);
          x.lineTo(cx + R, cy + (k - 1.5) * R * 0.5);
          x.stroke();
        } // glazing bars
        x.fillStyle = "rgba(20,20,15,0.85)";
        x.beginPath();
        x.moveTo(cx - R * 0.3, cy - R * 0.2);
        x.lineTo(cx - R * 0.55, cy - R * 0.1);
        x.lineTo(cx - R * 0.42, cy + R * 0.12);
        x.fill();
      },
    );
    for (const [x, z, nx, nz] of [
      [-16.12, 0, -1, 0],
      [-21.88, 0, 1, 0],
      [-19, -2.88, 0, 1],
      [-19, 2.88, 0, -1],
    ]) {
      b.plate("lamp", x, CY + 1.9, z, nx, nz, 2.5, 2.5, null, {
        off: 0.0,
        tint: [0.02, 0.02, 0.02],
      });
      b.plate("neon", x, CY + 1.9, z, nx, nz, 2.5, 2.5, dialIn, { off: 0.01 });
      b.light(
        x + nx * 0.8,
        CY + 1.9,
        z + nz * 0.8,
        [0.95, 0.9, 0.75],
        0.75,
        4.2,
        { box: CLK },
      );
      b.beam(
        "black_iron",
        x + nx * 0.06,
        CY + 1.9,
        z + nz * 0.06,
        x + nx * 0.06 + nz * 0.55,
        CY + 2.02,
        z + nz * 0.06 - nx * 0.55,
        0.07,
        0.04,
      ); // hour hand (9:47 from behind)
      b.beam(
        "black_iron",
        x + nx * 0.08,
        CY + 1.9,
        z + nz * 0.08,
        x + nx * 0.08 + nz * 0.18,
        CY + 2.95,
        z + nz * 0.08 - nx * 0.18,
        0.05,
        0.04,
      );
    }
    // the movement: iron frame, gear train, drive rods to the four dials, pendulum rod through the floor
    b.boxMM("cast_iron", -20, CY, -0.8, -18, CY + 1.3, 0.8, {
      tint: [0.3, 0.29, 0.27],
      faces: "nsewt",
    });
    b.col(-20, CY, -0.8, -18, CY + 1.3, 0.8, {
      tag: "machine",
      surface: "metal",
      walkable: false,
    });
    for (let k = 0; k < 6; k++) {
      const gx = -19.6 + (k % 3) * 0.6,
        gy = CY + 1.3 + (k > 2 ? 0.55 : 0.3);
      b.geo("brass_old", K.unitCyl(16), {
        x: gx,
        y: gy,
        z: -0.3 + (k % 2) * 0.6,
        sx: 0.18 + (k % 3) * 0.08,
        sy: 0.04,
        sz: 0.18 + (k % 3) * 0.08,
        rx: HP,
        tint: [0.7, 0.58, 0.36],
      });
    }
    b.pipe("steel", -19, CY + 1.9, 0, -16.2, CY + 1.9, 0, 0.03, 6);
    b.pipe("steel", -19, CY + 1.9, 0, -21.8, CY + 1.9, 0, 0.03, 6);
    b.pipe("steel", -19, CY + 1.9, 0, -19, CY + 1.9, -2.8, 0.03, 6);
    b.pipe("steel", -19, CY + 1.9, 0, -19, CY + 1.9, 2.8, 0.03, 6);
    b.pipe("steel", -19, CY + 1.3, 0, -19, CY + 1.9, 0, 0.05, 6);
    b.pipe("steel", -18.4, CY, 0.3, -18.4, CY - 3, 0.3, 0.02, 4);
    b.box("paint_black", -18.4, CY + 0.02, 0.3, 0.2, 0.01, 0.2);
    b.cyl("rust", -17.6, CY + 0.9, 0.4, 0.12, 0.12, 0.25, 8);
    b.beam("rust", -17.6, CY + 1.02, 0.4, -17.2, CY + 1.02, 0.4, 0.04, 0.04); // the winding arbor
    A("crank", -17.5, CY + 1.0, 0.4, 0);
    K.skel(ctx, -21.2, CY, 2.1, 0.8, "sitting", { loot: "skeleton" });
    K.note(ctx, "ph2_note_pa_winder", -21, CY + 0.02, 1.5, {
      type: "note",
      name: "Winding Card",
      title: "Memorial Clock — Winding Card",
      text: "WIND EVERY SUNDAY, 12 TURNS, DO NOT OVERWIND.\n\n[Rows of initials and dates run down the card, nearly fifty years of Sundays. The last line:]\n\nMar 5 1967 — 09:30 — 12 turns — P.D.\n\n[Under it, in a different, shaky hand:] Wound it that Sunday like always. It stopped seventeen minutes later, when the windows went. So did everything.",
    });

    ctx.intRoot = b.finish(null);
    ctx.intRoot.name = "poi_pier_a_int";

    // ================================================= doors, ladders, the crank
    const OX = O.x,
      OY = O.y,
      OZ = O.z,
      P = PV.pa;
    K.door(ctx, {
      id: "ph2_pa_in",
      pos: ctx.anchors.door.clone(),
      label: "Pier A",
      verb: "Enter",
      target: { x: OX + 18.6, y: OY, z: OZ, yaw: HP },
      onEnter: () => K.safe("disc", () => G.discover("pier_a")),
    });
    K.door(ctx, {
      id: "ph2_pa_out",
      pos: new THREE.Vector3(OX + 19.9, OY + 1.3, OZ),
      label: "The Battery",
      verb: "Leave",
      target: { x: P.HX1 + 2.3, y: P.PY, z: 895, yaw: -HP },
    }); // on the pier apron just outside the head-house door, facing the Battery
    K.oneWay(ctx, {
      flag: "pa_towerdoor",
      open: {
        pos: new THREE.Vector3(OX - 21.8, OY + 1.2, OZ),
        label: "Tower Door — Pier",
        verb: "Unbar",
        target: { x: P.TX - P.TW / 2 - 1.6, y: P.PY, z: P.TZ + 2.4, yaw: HP },
        msg: "You lift the bar and shoulder the swollen door open onto the pier.",
      },
      barred: {
        pos: ctx.anchors.towerDoor,
        label: "Clock Tower Door",
        verb: "Open",
        target: { x: OX - 20.6, y: OY, z: OZ, yaw: -HP },
        msg: "The door is barred from the inside.",
      },
    });
    ctx.interactables.push(
      G.world.addInteractable({
        pos: new THREE.Vector3(OX - 21.3, OY + 5.6, OZ - 2.6),
        radius: 0.9,
        label: "Ladder — Clock Room",
        verb: "Climb",
        priority: 1,
        onInteract: () => {
          K.sfx("door_open", null);
          G.fadeTransition(() =>
            G.player.teleport(OX - 21.1, OY + CY, OZ - 1.6, PI),
          );
        },
      }),
    );
    ctx.interactables.push(
      G.world.addInteractable({
        pos: new THREE.Vector3(OX - 21.3, OY + CY + 0.6, OZ - 2.6),
        radius: 0.9,
        label: "Ladder — Tower Landing",
        verb: "Climb down",
        priority: 1,
        onInteract: () => {
          K.sfx("door_open", null);
          G.fadeTransition(() =>
            G.player.teleport(OX - 21.2, OY + 4.6, OZ - 1.4, PI),
          );
        },
      }),
    );
    ctx.interactables.push(
      G.world.addInteractable({
        pos: ctx.anchors.crank,
        radius: 0.8,
        label: "Clock Movement",
        verb: () => (PV.flag("pa_clock_wound") ? "Listen" : "Wind"),
        priority: 1,
        onInteract: () => {
          if (PV.flag("pa_clock_wound")) {
            K.notify("Tick. Tock. The old movement keeps harbour time again.");
            return;
          }
          const can = K.has("ph2_clock_key") || K.skill("mechanics") >= 50;
          if (!can) {
            K.sfx("door_locked", null);
            K.notify(
              "The winding arbor needs its crank. (Clock key, or Mechanics 50)",
            );
            if (!K.q.started("ph2_947")) K.q.start("ph2_947");
            return;
          }
          PV.setFlag("pa_clock_wound", true);
          K.notify(
            K.has("ph2_clock_key")
              ? "Twelve turns. Do not overwind. The movement shudders — and starts to tick."
              : "[Mechanics 50] You rig a wrench to the arbor and wind it by hand. The movement shudders — and starts to tick.",
          );
          K.sfx("door_open", null);
          K.safe("bell", () => {
            if (!G.isStub("sfx"))
              G.sfx.play("bell", {
                pos: new THREE.Vector3(P.TX, P.clockY + 3, P.TZ),
              });
          });
          if (!K.q.started("ph2_947")) K.q.start("ph2_947");
          K.q.complete("ph2_947");
          K.standing(10, "Restarted the Pier A clock");
        },
      }),
    );

    // ================================================= anchors, loot, notes, terminal
    A("entrance", 18.6, 0, 0, HP);
    A("loot1", -21, 4.6, -1.5, 0);
    A("loot2", 19.2, UY, -5.2, -HP);
    A("loot3", -14.8, 0, 4.8, 0);
    K.loot(ctx, "locker", 19.6, 0, -4.4, -HP, { count: 3, loot: "locker" });
    K.loot(ctx, "first_aid", 8.2, 1.5, 4.4, HP, { loot: "first_aid" });
    K.loot(ctx, "skeleton", 12.4, 0, 1.75, PI, {
      pose: "seated",
      container: true,
      loot: "skeleton",
    });
    K.loot(ctx, "footlocker", 10.3, UY, 4.9, 0, { loot: "footlocker" });
    K.loot(ctx, "footlocker", 11.6, UY, -0.1, PI, { loot: "footlocker" });
    K.loot(ctx, "safe", 19.85, UY + 1.2, -0.8, -HP, {
      wall: true,
      loot: "safe",
      items: [["ph2_clock_key", 1]],
      name: "Harbor Master's Safe",
      lock: K.regLock({
        id: "ph2_lk_pa_safe",
        label: "Harbor Master's Safe",
        kind: "safe",
        code: "1919",
        hint: 'The harbor master\'s log ("The clock") gives the year the clock was first wound.',
      }),
    });
    K.loot(ctx, "ammo_box", -21, 4.6, -1.2, HP, { loot: "ammo_box" });
    K.loot(ctx, "toolbox", -15.2, 0, 5.3, PI, { loot: "toolbox" });
    K.loot(ctx, "crate", 6.5, 0, -5.2, 0.2, { kind: "plain", loot: "crate" });
    K.loot(ctx, "skeleton", -2.8, 0, -3.8, 2.2, {
      pose: "reaching",
      container: true,
      loot: "skeleton",
    });
    K.terminal(
      ctx,
      "ph2_term_pa_dispatch",
      14.6,
      0.76,
      2.55,
      PI,
      termDispatch(),
      "bare",
    );
    K.terminal(
      ctx,
      "ph2_term_pa_harbor",
      18.4,
      UY + 0.76,
      1.6,
      -HP,
      termHarbor(),
      "bare",
    );
  };

  function termDispatch() {
    return {
      title: "F.D.N.Y. MARINE DISPATCH",
      header:
        "MARINE COMPANY 1 — PIER A, THE BATTERY\nKestrel teletype — Fire Alarm Telegraph Interface",
      entries: [
        {
          title: "Last alarms received",
          text: "03/05/67 09:31 — BOX 22 — Governors Island — DRILL\n03/05/67 09:44 — BOX 1 — ALL COMPANIES — [CIVIL DEFENSE OVERRIDE]\n03/05/67 09:46 — BOX 1 — ALL COMPANIES — [CIVIL DEFENSE OVERRIDE]\n03/05/67 09:47 — BOX 1 — ALL COMPANIES — ALL COMP",
        },
        {
          title: "Standing orders",
          text: "In the event of a nuclear attack, Marine 1 will proceed to the Hudson River piers and supply water to land companies, until relieved.\n\nNobody relieved us.",
        },
        {
          title: "Pumps (maintenance)",
          text: "F/B PATRICK DUGGAN — Worthington pumps 1–4 serviced. Governor, pump 2, rebuilt 2/25. Note for the ferry boys: yes, it is the same governor as yours. No, you can't borrow ours.",
        },
      ],
    };
  }
  function termHarbor() {
    return {
      title: "HARBOR MASTER — LOG",
      header:
        "PORT OF NEW YORK — HARBOR MASTER, PIER A\nPersonal Log (Capt. E. Van Wyck)",
      entries: [
        {
          title: "The clock",
          learn: "ph2_lk_pa_safe",
          text: "The memorial clock has been wound every Sunday since 1919. (The office safe is set to that year too, 1-9-1-9, so the spare crank is never lost.) Every harbor master since has kept the key in this office. The ship's bell tolls the watches: two bells, four, six, eight. The men on the water set their watches by it.\n\n[A note is clipped to this entry: \"KEY IN THE WALL SAFE. SPARE ON MY BELT. 12 TURNS. DON'T OVERWIND.\"]",
          action: () => {
            K.q.start("ph2_947");
            return undefined;
          },
        },
        {
          title: "March 1967",
          text: 'Governors Island drill Tuesday. Horseshoe crabs up and down the Jersey flats, out of season — the Fish & Wildlife men say "large crabs." They are large. They are unusually large. Nobody can say why.',
        },
        {
          title: "Final entry",
          text: "Sirens. The Duggan is getting up steam. The ferries are still running, God help them. I have to go down and see to the — [ENTRY ENDS]",
        },
      ],
    };
  }
})();
