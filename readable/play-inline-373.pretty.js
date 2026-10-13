/* src/poi_midtown3/10_club52_interior.js */
/* =====================================================================
 * NEW RAD CITY — POI MIDTOWN 3 · 10 The '52' Club — interior
 *
 * Cell 'club_52' (origin 9800,0,0). Local plan (+z = south = street):
 *   GROUND (y 0)  vestibule & coat check → the BAR ROOM (low lacquered
 *                 ceiling crammed with ~200 hanging toys, mahogany to the
 *                 ceiling, walls of framed photos, banquettes, red-check
 *                 two-tops) + the GRILL behind it; the PADDOCK next door
 *                 (the Jockeys' giant roach-derby track, betting table, main
 *                 stair) → kitchen (meat skewers!, walk-in cooler) and the
 *                 service stairwell.
 *   UPSTAIRS (y 4.6) "Upstairs at 21" — THRONE ROOM (carousel-horse throne
 *                 on a dais, jockey honour guard), DORM (bedrolls, chem
 *                 table, Fizzo machine), TROPHY ROOM (welchers' cage, gore
 *                 bags, loot table) and the Remington Room (bronzes, the
 *                 King's desk & safe).
 *                 Main stair from the bar room + service stair = loop.
 *   BASEMENT (y -4) stores, kegs, boiler, the raiders' pen — and the
 *                 BRICK WALL that is really a two-ton door (a skewer in
 *                 the right hole opens it; see 80_content_interior.js) →
 *   WINE CELLAR (No. 19's basement, y -4): barrel vault, racks, the
 *                 private-collection lockers, the Mayor's Reserve, the
 *                 last sommelier — and the old bootleggers' stair up to
 *                 the sidewalk hatch in front of No. 19 (exit / loop).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._m3) return;
  const P = G._m3,
    D = P.dress;
  const PI = P.PI,
    HP = P.HP,
    TAU = P.TAU;

  const UY = 4.6,
    BY = -4;

  /** A toy hanging from the ceiling on a wire (local batch coords). kind: plane|truck|helmet|bat|racket|zeppelin|rotorcraft|fizzo_truck|puck|boat */
  function toy(b, kind, x, y, z, ry, r, ceil) {
    const M = P.m4(x, y, z, ry);
    const g = (k, geo, m) => {
      const sk = P.silkKey(k);
      return b.geo(sk[0], geo, m ? M.clone().multiply(m) : M.clone(), {
        noAO: true,
        grime: 0.35,
        c: sk[1],
      });
    };
    const col = [
      "paint_red",
      "paint_blue",
      "paint_green",
      "paint_cream",
      "silk_yellow",
      "paint_white",
      "chrome",
    ][Math.floor(r() * 7)];
    const top = (ceil || 4.15) - y;
    b.rod("iron", [x, y + 0.05, z], [x, y + top, z], 0.004, 3, { noAO: true });
    if (kind === "plane") {
      g(col, new THREE.CylinderGeometry(0.05, 0.035, 0.7, 7).rotateX(HP));
      g(col, new THREE.BoxGeometry(0.9, 0.015, 0.14).translate(0, 0.01, -0.06));
      g(col, new THREE.BoxGeometry(0.3, 0.012, 0.08).translate(0, 0.03, 0.3));
      g(col, new THREE.BoxGeometry(0.012, 0.12, 0.08).translate(0, 0.08, 0.31));
      g("iron", new THREE.BoxGeometry(0.18, 0.02, 0.01).translate(0, 0, -0.36));
    } else if (kind === "truck" || kind === "fizzo_truck") {
      const c2 = kind === "fizzo_truck" ? "paint_red" : col;
      g(c2, new THREE.BoxGeometry(0.2, 0.18, 0.42).translate(0, 0.09, 0.06));
      g(
        kind === "fizzo_truck" ? "paint_white" : "chrome",
        new THREE.BoxGeometry(0.19, 0.14, 0.14).translate(0, 0.07, -0.22),
      );
      for (const sx of [-1, 1])
        for (const sz of [-0.22, 0.16])
          g(
            "rubber",
            new THREE.CylinderGeometry(0.045, 0.045, 0.03, 8)
              .rotateZ(HP)
              .translate(sx * 0.11, -0.02, sz),
          );
    } else if (kind === "helmet") {
      g(
        col,
        new THREE.SphereGeometry(0.13, 8, 6, 0, TAU, 0, HP * 1.15).scale(
          1,
          1,
          1.15,
        ),
      );
      for (let k = 0; k < 3; k++)
        g(
          "chrome",
          new THREE.TorusGeometry(0.1, 0.006, 3, 8, PI)
            .rotateY(HP)
            .translate(0, -0.03 - k * 0.03, 0.08),
        );
    } else if (kind === "bat") {
      g("wood", new THREE.CylinderGeometry(0.03, 0.012, 0.8, 6).rotateZ(1.2));
    } else if (kind === "racket") {
      g(
        "wood",
        new THREE.TorusGeometry(0.12, 0.012, 4, 12)
          .scale(1, 1.3, 1)
          .translate(0, 0.2, 0),
      );
      g(
        "wood",
        new THREE.CylinderGeometry(0.015, 0.015, 0.3, 4).translate(0, -0.1, 0),
      );
    } else if (kind === "zeppelin") {
      g("paint_cream", new THREE.SphereGeometry(0.1, 10, 6).scale(1, 1, 3.0));
      g("iron", new THREE.BoxGeometry(0.08, 0.06, 0.2).translate(0, -0.16, 0));
    } else if (kind === "rotorcraft") {
      // tandem twin-rotor helicopter: fuselage, two masts, two rotor discs fore and aft
      g(
        "continuity_black",
        new THREE.CylinderGeometry(0.07, 0.07, 0.6, 8).rotateX(HP),
      );
      for (const sz of [-1, 1]) {
        g(
          "continuity_black",
          new THREE.CylinderGeometry(0.015, 0.015, 0.1, 5).translate(
            0,
            0.11,
            sz * 0.24,
          ),
        );
        g(
          "continuity_black",
          new THREE.CylinderGeometry(0.22, 0.22, 0.008, 12).translate(
            0,
            0.16,
            sz * 0.24,
          ),
        );
      }
    } else if (kind === "boat") {
      g(col, new THREE.BoxGeometry(0.16, 0.08, 0.6).translate(0, 0, 0));
      g(
        "paint_white",
        new THREE.BoxGeometry(0.1, 0.1, 0.18).translate(0, 0.09, -0.05),
      );
      g(
        "paint_black",
        new THREE.CylinderGeometry(0.025, 0.025, 0.12, 5).translate(
          0,
          0.2,
          -0.05,
        ),
      );
    } else {
      g("rubber", new THREE.CylinderGeometry(0.06, 0.06, 0.03, 10));
    }
  }

  /** Bottle rack (wine) against a wall: lattice + bottle ends. Along x (wall at z, facing +z if dir>0). */
  function rackX(b, x0, x1, y, z, dir, h, r) {
    const d = 0.45 * dir;
    b.box(
      "wood_dark",
      Math.min(x0, x1),
      y,
      Math.min(z, z + d),
      Math.max(x0, x1),
      y + 0.06,
      Math.max(z, z + d),
      { seg: false },
    );
    for (let yy = y + 0.3; yy < y + h; yy += 0.3)
      b.box(
        "wood_dark",
        Math.min(x0, x1),
        yy,
        Math.min(z, z + d),
        Math.max(x0, x1),
        yy + 0.025,
        Math.max(z, z + d),
        { seg: false, noAO: true },
      );
    for (let xx = x0; xx <= x1 + 1e-3; xx += 0.3)
      b.box(
        "wood_dark",
        xx - 0.02,
        y,
        Math.min(z, z + d),
        xx + 0.02,
        y + h,
        Math.max(z, z + d),
        { seg: false, noAO: true },
      );
    for (let xx = x0 + 0.15; xx < x1; xx += 0.3)
      for (let yy = y + 0.15; yy < y + h - 0.1; yy += 0.3) {
        if (r() < 0.22) continue;
        b.cyl(
          r() < 0.55 ? "glass_dark" : "glass",
          xx,
          yy,
          z + d * 0.55,
          0.04,
          0.04,
          0.34,
          6,
          { rx: HP, noAO: true, grime: 0.6 },
        );
      }
  }
  function rackZ(b, z0, z1, y, x, dir, h, r) {
    const d = 0.45 * dir;
    b.box(
      "wood_dark",
      Math.min(x, x + d),
      y,
      Math.min(z0, z1),
      Math.max(x, x + d),
      y + 0.06,
      Math.max(z0, z1),
      { seg: false },
    );
    for (let yy = y + 0.3; yy < y + h; yy += 0.3)
      b.box(
        "wood_dark",
        Math.min(x, x + d),
        yy,
        Math.min(z0, z1),
        Math.max(x, x + d),
        yy + 0.025,
        Math.max(z0, z1),
        { seg: false, noAO: true },
      );
    for (let zz = z0; zz <= z1 + 1e-3; zz += 0.3)
      b.box(
        "wood_dark",
        Math.min(x, x + d),
        y,
        zz - 0.02,
        Math.max(x, x + d),
        y + h,
        zz + 0.02,
        { seg: false, noAO: true },
      );
    for (let zz = z0 + 0.15; zz < z1; zz += 0.3)
      for (let yy = y + 0.15; yy < y + h - 0.1; yy += 0.3) {
        if (r() < 0.22) continue;
        b.cyl(
          r() < 0.55 ? "glass_dark" : "glass",
          x + d * 0.55,
          yy,
          zz,
          0.04,
          0.04,
          0.34,
          6,
          { rz: HP, noAO: true, grime: 0.6 },
        );
      }
  }

  function buildInterior() {
    const O = P.I("club_52");
    const S = P.site("club52_int", {
      ox: O.x,
      oy: O.y,
      oz: O.z,
      lit: true,
      ambient: 0x5a5048,
      ambI: 0.34,
      interiorKey: "club_52",
    });
    const b = S.b;
    const r = P.rng("club52_int");

    // =================== GROUND: vestibule & coat check ===================
    S.room({
      x0: -3,
      z0: 20,
      x1: 3,
      z1: 25,
      y: 0,
      h: 3.4,
      wall: "mahogany",
      floor: "tile",
      ceil: "plaster_cream",
      holes: { n: [[-1.2, 1.2, 0, 2.7]], s: [[-0.9, 0.9, 0, 2.6]] },
      trim: "wood_dark",
    });
    b.box("paint_red", -0.9, 0, 24.82, 0.9, 2.6, 24.86, { seg: false });
    b.box("mahogany", -2.85, 0, 21.2, -1.6, 1.05, 24.2, { seg: false });
    b.box("marble_dark", -2.9, 1.05, 21.1, -1.5, 1.1, 24.3, { seg: false });
    S.col(-2.85, 0, 21.2, -1.6, 1.1, 24.2, { walkable: false });
    b.rod("chrome", [-2.8, 2.0, 21.3], [-2.8, 2.0, 24.1], 0.02, 5);
    for (let k = 0; k < 7; k++) {
      if (r() < 0.3) continue;
      const z = 21.5 + k * 0.4;
      b.box(
        ["fabric", "leather", "canvas_green", "fabric_white"][k % 4],
        -2.95,
        1.1,
        z - 0.18,
        -2.65,
        1.98,
        z + 0.18,
        { seg: false, rx: (r() - 0.5) * 0.1 },
      );
    }
    const cc = P.texMat(
      "club52_coat",
      P.signTex(
        "club52_coat",
        ["CHECK ROOM", "ALL ITEMS AT OWNER'S RISK"],
        "brass",
        512,
        128,
      ),
      { rough: 0.5, metal: 0.4 },
    );
    b.quad(cc, -1.52, 1.6, 22.7, 1.1, 0.28, { ry: HP });
    S.light(0, 2.9, 22.5, 0xffc080, 6, 0.8, 0.4);
    b.box("lamp_amber", -0.2, 3.3, 22.3, 0.2, 3.36, 22.7, { seg: false });
    S.anchor("entrance", 0, 0, 23.4, 0);
    S.pickup("m3_note_menu", 1, -2.2, 1.12, 22.3);

    // =================== GROUND: the Bar Room (x -10..2, z 9..20), the Grill (z 2..9), the Paddock (x 2..10) ===================
    // The club's bar is low, dark and crammed: mahogany to the ceiling, a lacquered red ceiling at 3.2 m hung with
    // well over a hundred toys, banquettes, tables elbow to elbow. The Jockeys' roach derby lives next door in the
    // old private dining room ("the Paddock"), which keeps the full storey height and the main stair.
    const RH = 4.2,
      BRH = 3.2;
    S.floor("parquet", -10, 2, 10, 20, 0, { surface: "wood" });
    S.wallX("mahogany", 20, -10.15, 10.15, 0, RH, 0.3, [[-1.2, 1.2, 0, 2.7]]);
    S.wallX("mahogany", 2, -10.15, 10.15, 0, RH, 0.3, [
      [-7.2, -5.6, 0, 2.5],
      [4, 6, 0, 2.5],
    ]);
    S.wallZ("mahogany", -10, 2, 20, 0, RH, 0.3, []);
    S.wallZ("mahogany", 10, 2, 20, 0, RH, 0.3, []);
    // partitions: bar | paddock (x = 2, two openings) and bar | grill (z = 9, a wide cased opening)
    S.wallZ("mahogany", 2, 2.15, 19.85, 0, RH, 0.24, [
      [13.2, 15.4, 0, 2.5],
      [4.2, 6.0, 0, 2.4],
    ]);
    S.wallX("mahogany", 9, -9.85, 1.88, 0, BRH, 0.24, [[-6.4, -1.4, 0, 2.55]]);
    b.box("wood_dark", -6.55, 2.5, 8.82, -1.25, 2.7, 9.18, { seg: false });
    for (const x of [-6.55, -1.45])
      b.box("wood_dark", x, 0, 8.82, x + 0.2, 2.6, 9.18, { seg: false });
    // lacquered red ceiling over bar + grill, dark beams; the paddock keeps a plaster ceiling (stair hole x 8..10, z 12.6..18.6)
    S.ceil("lacquer_red", -10, 2, 2, 20, BRH);
    for (let z = 3.6; z <= 19; z += 2.6)
      b.box(
        "wood_dark",
        -9.85,
        BRH - 0.28,
        z - 0.11,
        1.88,
        BRH - 0.05,
        z + 0.11,
        { seg: false },
      );
    b.box("wood_dark", -9.85, BRH - 0.2, 8.85, 1.88, BRH, 9.15, { seg: false });
    S.ceil("plaster", 2, 2, 8, 20, RH);
    S.ceil("plaster", 8, 2, 10, 12.6, RH);
    S.ceil("plaster", 8, 18.6, 10, 20, RH);
    for (let z = 4; z <= 18; z += 3.5)
      b.box("wood_dark", 2.1, RH - 0.35, z - 0.15, 9.8, RH - 0.05, z + 0.15, {
        seg: false,
      });
    // plate rail + framed photographs crowding the bar walls (one sepia atlas, 8 frames)
    const ph = P.texMat(
      "club52_photos",
      P.canvasTex(
        "m3_club52_photos",
        1024,
        512,
        (ctx, w, h) => {
          const rr = P.rng("photos");
          for (let i = 0; i < 4; i++)
            for (let j = 0; j < 2; j++) {
              const x0 = (i * w) / 4,
                y0 = (j * h) / 2,
                cw = w / 4,
                chh = h / 2;
              ctx.fillStyle = "#e8dcc0";
              ctx.fillRect(x0, y0, cw, chh);
              const g = ctx.createLinearGradient(x0, y0, x0, y0 + chh);
              g.addColorStop(0, "#b8a078");
              g.addColorStop(1, "#6a5438");
              ctx.fillStyle = g;
              ctx.fillRect(x0 + 14, y0 + 14, cw - 28, chh - 46);
              ctx.fillStyle = "rgba(40,28,16,0.85)";
              const k = (i + j * 4) % 4;
              if (k === 0) {
                ctx.beginPath();
                ctx.ellipse(
                  x0 + cw * 0.5,
                  y0 + chh * 0.5,
                  cw * 0.22,
                  chh * 0.12,
                  0,
                  0,
                  TAU,
                );
                ctx.fill();
                for (const lx of [-0.15, -0.08, 0.1, 0.17])
                  ctx.fillRect(
                    x0 + cw * (0.5 + lx),
                    y0 + chh * 0.55,
                    6,
                    chh * 0.22,
                  );
                ctx.fillRect(x0 + cw * 0.66, y0 + chh * 0.3, 10, chh * 0.2);
                ctx.beginPath();
                ctx.arc(x0 + cw * 0.46, y0 + chh * 0.3, 12, 0, TAU);
                ctx.fill();
              } else
                for (let p = 0; p < 2 + k; p++) {
                  const px = x0 + cw * (0.2 + (p * 0.6) / (1 + k)) + 10,
                    py = y0 + chh * 0.34;
                  ctx.beginPath();
                  ctx.arc(px, py, 14, 0, TAU);
                  ctx.fill();
                  ctx.fillRect(px - 20, py + 14, 40, chh * 0.4);
                }
              ctx.fillStyle = "rgba(30,20,10,0.7)";
              ctx.font = "italic 16px " + P.FONTS.SERIF;
              ctx.fillText(
                [
                  "To Jack & Charlie",
                  "Derby Day '61",
                  "With love — B.",
                  "Best table in town",
                  "Mr. Kellerman, 1961",
                  "The Governor's party",
                  "Kentucky Oaks",
                  "Keep the ice cold!",
                ][i + j * 4],
                x0 + 16,
                y0 + chh - 14,
              );
              P.speckle(ctx, w, h, rr, 60, 0.3, 0.05);
            }
        },
        { clamp: true },
      ),
      { rough: 0.8 },
    );
    const frame = (x, y, z, ry, w, hgt, cell) => {
      const m = P.m4(x, y, z, ry);
      b.geo("wood_dark", new THREE.BoxGeometry(w + 0.08, hgt + 0.08, 0.04), m, {
        noAO: true,
      });
      const u0 = (cell % 4) / 4,
        v0 = cell < 4 ? 0.5 : 0;
      b.geo(ph, new THREE.PlaneGeometry(w, hgt).translate(0, 0, 0.025), m, {
        uv: "keep",
        uvRect: [u0, v0, u0 + 0.25, v0 + 0.5],
        noAO: true,
        grime: 0.2,
      });
    };
    for (let x = -9.4; x < 1.6; x += 0.52)
      if (x < -6.6 || x > -1.2)
        for (const y of [1.6, 2.15, 2.65])
          if (r() < 0.75) frame(x, y, 9.14, 0, 0.36, 0.28, (r() * 8) | 0);
    for (let z = 9.5; z < 13.1; z += 0.55)
      for (const y of [1.6, 2.15, 2.65])
        if (r() < 0.8) frame(1.86, y, z, -HP, 0.36, 0.28, (r() * 8) | 0);
    for (let x = -9.4; x < 1.6; x += 0.55)
      if (x < -1.5 || x > 1.4)
        for (const y of [1.55, 2.1, 2.6])
          if (r() < 0.8)
            frame(
              x,
              y + (r() - 0.5) * 0.08,
              19.83,
              PI,
              0.38,
              0.3,
              (r() * 8) | 0,
            );
    for (let z = 15.8; z < 19.6; z += 0.55)
      for (const y of [1.6, 2.15, 2.65])
        if (r() < 0.8) frame(1.86, y, z, -HP, 0.36, 0.28, (r() * 8) | 0);
    for (let x = -9.4; x < 1.6; x += 0.5)
      if (x < -7.5 || x > -5.3)
        for (const y of [1.6, 2.15])
          if (r() < 0.7) frame(x, y, 2.17, 0, 0.34, 0.26, (r() * 8) | 0);
    for (const [x0, x1, z] of [
      [-9.85, 1.88, 19.82],
      [-9.85, 1.88, 2.18],
    ])
      b.box("wood_dark", x0, 1.25, z - 0.06, x1, 1.3, z + 0.06, { seg: false }); // chair rails
    // THE BAR: mahogany counter along the west wall, brass rail, back bar with mirror & bottles
    b.box("mahogany", -8.3, 0, 10.2, -7.5, 1.08, 19.2, { segLen: 2 });
    b.box("marble_dark", -8.4, 1.08, 10.1, -7.35, 1.14, 19.3, { seg: false });
    b.box("mahogany", -8.3, 0, 10.2, -7.35, 1.14, 10.45, { seg: false });
    b.rod("gold", [-7.3, 0.2, 10.4], [-7.3, 0.2, 19.1], 0.025, 6);
    S.col(-8.4, 0, 10.1, -7.35, 1.14, 19.3, { walkable: false });
    b.box("mahogany", -9.85, 0, 10.2, -9.35, 1.0, 19.6, { seg: false });
    for (let s = 0; s < 2; s++) {
      const sy = 1.3 + s * 0.4;
      b.box("mahogany", -9.85, sy, 10.3, -9.45, sy + 0.04, 19.5, {
        seg: false,
        noAO: true,
      });
      for (let z = 10.5; z < 19.3; z += 0.13 + r() * 0.1) {
        if (r() < 0.3) continue;
        const hh = 0.2 + r() * 0.12;
        b.cyl(
          r() < 0.5 ? "glass_dark" : "glass",
          -9.62,
          sy + 0.04,
          z,
          0.035,
          0.04,
          hh,
          6,
          { noAO: true },
        );
      }
    }
    b.box("glass", -9.84, 2.15, 11.0, -9.8, 2.95, 18.8, {
      seg: false,
      noAO: true,
    });
    for (let k = 0; k < 8; k++) {
      const z = 11.0 + k * 1.1;
      b.cyl("wood_dark", -6.85, 0, z, 0.2, 0.18, 0.05, 8, { noAO: true });
      b.cyl("iron", -6.85, 0.05, z, 0.03, 0.03, 0.7, 5);
      b.cyl("canvas_red", -6.85, 0.75, z, 0.22, 0.2, 0.09, 10, { noAO: true });
    }
    for (let k = 0; k < 16; k++) {
      const z = 10.6 + r() * 8.4;
      b.cyl(
        r() < 0.5 ? "glass_dark" : "glass",
        -7.9 + r() * 0.3,
        1.14,
        z,
        0.035,
        0.04,
        0.22,
        6,
        { noAO: true },
      );
    }
    // bar lamps (a few still wired to the raiders' generator)
    for (let k = 0; k < 4; k++) {
      const z = 11.2 + k * 2.4,
        on = k !== 2;
      b.rod("iron", [-8, BRH - 0.5, z], [-8, BRH, z], 0.01, 3);
      b.cyl(
        on ? "lamp_amber" : "glass_dark",
        -8,
        BRH - 0.72,
        z,
        0.08,
        0.2,
        0.22,
        8,
        { open: false },
      );
      if (on) S.light(-8, BRH - 0.9, z, 0xffb870, 5.5, 0.8, 0.35);
    }
    // banquettes: red leather along the paddock partition and the street wall
    const banq = (x0, z0, x1, z1, back) => {
      b.box("leather", x0, 0, z0, x1, 0.45, z1, { seg: false, c: 0x9a3024 });
      if (back === "e")
        b.box("leather", x1 - 0.18, 0.45, z0, x1, 1.15, z1, {
          seg: false,
          c: 0x9a3024,
        });
      else
        b.box("leather", x0, 0.45, z1 - 0.18, x1, 1.15, z1, {
          seg: false,
          c: 0x9a3024,
        });
      S.col(x0, 0, z0, x1, 0.45, z1, { surface: "wood" });
    };
    banq(1.2, 15.6, 1.86, 19.8, "e");
    banq(-7.1, 19.2, -1.5, 19.82, "s");
    // tables: tight rows of red-check two-tops (bar), the grill's longer tables; one kicked over
    const tables = [
      [-5.2, 11.4],
      [-5.2, 13.8],
      [-5.2, 16.2],
      [-3.0, 12.6],
      [-3.0, 15.0],
      [0.3, 16.4],
      [0.3, 18.4],
      [-5.4, 18.4],
      [-3.2, 18.4],
      [-8.4, 3.8],
      [-8.4, 6.6],
      [-5.6, 3.8],
      [-2.8, 3.8],
      [-0.4, 3.8],
      [-0.4, 6.8],
    ];
    tables.forEach(([x, z], i) => {
      const over = i === 3 || i === 12;
      if (over) {
        b.box("wood_dark", x - 0.55, 0, z - 0.4, x + 0.55, 0.06, z + 0.4, {
          rz: 0.1,
          seg: false,
        });
        b.box("check_red", x - 0.6, 0.06, z - 0.45, x + 0.6, 0.09, z + 0.45, {
          seg: false,
          ry: 0.5,
        });
      } else {
        D.table(b, x, 0, z, {
          rect: [1.0, 0.75],
          cloth: "check_red",
          top: "wood_dark",
          leg: "wood_dark",
        });
        S.col(x - 0.55, 0, z - 0.42, x + 0.55, 0.8, z + 0.42, {
          walkable: false,
        });
      }
      const seats =
        x > 0
          ? [[-0.7, 0, HP]]
          : z > 18
            ? [[0, -0.65, 0]]
            : [
                [0, -0.62, 0],
                [0, 0.62, PI],
                [-0.75, 0, HP],
                [0.75, 0, -HP],
              ];
      for (const [dx, dz, ry] of seats) {
        if (r() < 0.2) continue;
        D.chair(b, x + dx, 0, z + dz, ry + (r() - 0.5) * 0.4, {
          seat: "canvas_red",
          wood: "wood_dark",
          toppled: r() < 0.15,
        });
      }
      if (!over) {
        for (let k = 0; k < 3; k++)
          if (r() < 0.6)
            b.cyl(
              r() < 0.5 ? "glass" : "glass_dark",
              x + (r() - 0.5) * 0.7,
              0.8,
              z + (r() - 0.5) * 0.45,
              0.03,
              0.03,
              0.12,
              6,
              { noAO: true },
            );
        if (i % 3 === 0) {
          b.cyl("bronze", x, 0.8, z, 0.05, 0.07, 0.25, 8);
          b.cyl(
            i % 2 ? "glass_dark" : "lamp_amber",
            x,
            1.05,
            z,
            0.14,
            0.09,
            0.14,
            8,
            { open: true },
          );
          if (i % 2 === 0) S.light(x, 1.2, z, 0xffb070, 3.2, 0.6);
        }
      }
    });
    // THE CEILING OF TOYS: 150 toys in a dense overlapping grid 2.3–2.9 m up (one merged batch → no extra draw calls)
    const KINDS = [
      "plane",
      "plane",
      "truck",
      "helmet",
      "bat",
      "racket",
      "zeppelin",
      "plane",
      "boat",
      "truck",
      "helmet",
      "puck",
    ];
    let ti = 0;
    for (let x = -9.2; x < 1.4; x += 0.85)
      for (let z = 2.8; z < 19.4; z += 0.9) {
        if (x < -7.0 && z > 10 && z < 19.4 && r() < 0.5) continue; // thinner over the bar itself
        if (Math.abs(z - 9) < 0.5) continue; // the grill partition
        if (r() < 0.12) continue;
        const kind =
          ti === 21
            ? "rotorcraft"
            : ti === 57
              ? "fizzo_truck"
              : ti === 93
                ? "rotorcraft"
                : KINDS[(ti * 7 + ((x * 3) | 0)) % KINDS.length];
        toy(
          b,
          kind,
          x + (r() - 0.5) * 0.5,
          2.3 + r() * 0.62,
          z + (r() - 0.5) * 0.5,
          r() * TAU,
          r,
          BRH,
        );
        ti++;
      }
    // ---- the Paddock: the Jockeys' giant roach derby ----
    const TX0 = 2.8,
      TX1 = 7.6,
      TZ0 = 3.0,
      TZ1 = 11.8;
    b.box("dirt", TX0, 0.02, TZ0, TX1, 0.09, TZ1, { seg: false, grime: 0.7 });
    for (const [x0, z0, x1, z1] of [
      [TX0, TZ0, TX1, TZ0 + 0.08],
      [TX0, TZ1 - 0.08, TX1, TZ1],
      [TX0, TZ0, TX0 + 0.08, TZ1],
      [TX1 - 0.08, TZ0, TX1, TZ1],
    ]) {
      b.box("wood_rotten", x0, 0, z0, x1, 0.45, z1, { seg: false, grime: 0.8 });
    }
    b.box("wood_rotten", TX0 + 1.3, 0, TZ0 + 1.9, TX1 - 1.3, 0.35, TZ1 - 1.9, {
      seg: false,
    }); // infield
    b.box("grass", TX0 + 1.4, 0.35, TZ0 + 2.0, TX1 - 1.4, 0.38, TZ1 - 2.0, {
      seg: false,
      grime: 0.6,
    });
    for (let k = 0; k < 5; k++)
      b.box(
        "iron",
        TX0 + 0.25 + k * 0.22,
        0.09,
        TZ0 + 0.3,
        TX0 + 0.27 + k * 0.22,
        0.5,
        TZ0 + 1.5,
        { seg: false },
      ); // starting gate stalls
    b.box("rust", TX0 + 0.2, 0.5, TZ0 + 0.25, TX0 + 1.2, 0.55, TZ0 + 1.55, {
      seg: false,
    });
    b.rod(
      "paint_white",
      [TX1 - 0.7, 0, TZ0 + 0.1],
      [TX1 - 0.7, 1.3, TZ0 + 0.1],
      0.03,
      5,
    ); // finish post
    const chk = P.texMat(
      "club52_chk",
      P.canvasTex(
        "m3_chk",
        64,
        64,
        (ctx) => {
          for (let i = 0; i < 4; i++)
            for (let j = 0; j < 4; j++) {
              ctx.fillStyle = (i + j) % 2 ? "#111" : "#eee";
              ctx.fillRect(i * 16, j * 16, 16, 16);
            }
        },
        { clamp: true },
      ),
      { double: true },
    );
    b.quad(chk, TX1 - 0.45, 1.15, TZ0 + 0.1, 0.5, 0.35, { ry: 0 });
    S.col(TX0, 0, TZ0, TX1, 0.45, TZ1, { surface: "wood" });
    for (let k = 0; k < 4; k++) {
      const x = TX0 + 0.5 + r() * 3.8,
        z = TZ0 + 0.4 + (k % 2 ? TZ1 - TZ0 - 1.2 : 0.4);
      b.sphere("leather", x, 0.12, z, 0.1, {
        sx: 1,
        sy: 0.45,
        sz: 2.2,
        ry: r() * 3,
      });
    }
    // spectator benches (scrap) along the track, the betting table, the tote board
    for (const z of [5.0, 8.8]) {
      b.box("wood_rotten", 8.2, 0.4, z - 0.9, 9.4, 0.46, z + 0.9, {
        seg: false,
        grime: 0.8,
      });
      for (const dz of [-0.8, 0.8])
        b.box("rust", 8.3, 0, z + dz - 0.05, 9.3, 0.4, z + dz + 0.05, {
          seg: false,
        });
      S.col(8.2, 0, z - 0.9, 9.4, 0.46, z + 0.9, { surface: "wood" });
    }
    D.table(b, 5.2, 0, 14.4, {
      rect: [1.4, 0.9],
      top: "wood_rotten",
      leg: "rust",
    });
    S.col(4.5, 0, 13.95, 5.9, 0.8, 14.85, { walkable: false });
    for (let k = 0; k < 18; k++)
      b.cyl(
        "chrome",
        4.8 + r() * 0.8,
        0.75 + (k % 4) * 0.012,
        14.1 + r() * 0.6,
        0.012,
        0.012,
        0.01,
        6,
        { noAO: true },
      );
    const tote = P.texMat("club52_tote", null);
    b.quad(tote, 9.83, 2.3, 7.0, 1.4, 1.75, { ry: -HP });
    D.chair(b, 5.2, 0, 15.3, PI, { seat: "canvas_red" });
    // raider camp in the paddock: fire drum, mattresses, trash, graffiti
    S.prop("barrel", 3.4, 0, 13.4, 0, { burning: true });
    S.light(3.4, 1.8, 13.4, 0xff8a30, 9, 1.1);
    for (const [x, z, ry] of [
      [3.2, 19.1, -0.1],
      [5.6, 19.2, 0.05],
    ])
      S.prop("mattress", x, 0, z, ry, {});
    S.prop("footlocker", 7.2, 0, 19.2, PI, {
      loot: "raider_stash",
      name: "Jockey's Footlocker",
    });
    D.papers(b, 5, 0, 15, 3, 14);
    D.papers(b, -4, 0, 6, 3, 10);
    const g1 = P.texMat(
      "club52_g1",
      P.signTex("club52_g1", ["NO BETS", "AFTER THE BELL"], "raider", 512, 256),
      { transparent: true },
    );
    b.quad(g1, 5.2, 2.6, 2.19, 2.6, 1.3, { ry: 0 });
    const g2 = P.texMat(
      "club52_g2",
      P.signTex("club52_g2", ["KING UPSTAIRS"], "raider", 512, 128, {
        fg: "#e8d020",
      }),
      { transparent: true },
    );
    b.quad(g2, 9.82, 3.1, 17.6, 2.2, 0.55, { ry: -HP });
    for (let k = 0; k < 3; k++) {
      const z = 2.9 + k * 1.2,
        sk = P.silkKey(P.SILKS[k % P.SILKS.length]);
      b.box("wood_dark", 9.78, 2.9, z - 0.4, 9.82, 3.7, z + 0.4, {
        seg: false,
      });
      b.box(sk[0], 9.74, 2.98, z - 0.32, 9.78, 3.62, z + 0.32, {
        seg: false,
        noAO: true,
        c: sk[1],
      });
    }
    S.prop("ammo_box", 9.2, 0, 11.6, 0, { loot: "ammo_box" });
    // the grill's raider corner: a stripped table used as a card table, a second fire
    S.prop("barrel", -8.8, 0, 8.1, 0, { burning: true });
    S.light(-8.8, 1.7, 8.1, 0xff8a30, 7, 0.9);
    S.anchor("bar_room", -3, 0, 14, 0);
    S.anchor("derby", 5.2, 0, 7.4, 0);
    S.anchor("spawn1", -4.2, 0, 17.2, 0);
    S.anchor("spawn2", 5.6, 0, 17.0, 0);
    S.anchor("spawn8", 5.0, 0, 12.8, 0);
    S.anchor("loot1", -8.8, 1.2, 12, 0);
    // main stair up (east wall of the paddock), climbing north
    S.stairs("mahogany", 9, 18.6, "n", 1.9, 0, UY, {
      rail: "gold",
      railSides: [-1],
    });

    // =================== GROUND: kitchen ===================
    const KH = 3.6;
    S.room({
      x0: -4,
      z0: -8,
      x1: 10,
      z1: 2,
      y: 0,
      h: KH,
      wall: "tile_white",
      floor: "tile",
      ceil: "plaster",
      skip: "s",
      holes: { w: [[-7.6, -6.1, 0, 2.4]] },
    });
    // stoves & hood (north wall)
    for (let k = 0; k < 3; k++) {
      const x = -1.8 + k * 2.2;
      b.box("steel", x - 1, 0, -7.85, x + 1, 0.9, -7.05, { seg: false });
      b.box("iron", x - 1, 0.9, -7.85, x + 1, 0.95, -7.05, { seg: false });
      for (let j = 0; j < 4; j++)
        b.cyl(
          "iron",
          x - 0.6 + (j % 2) * 1.2,
          0.95,
          -7.65 + Math.floor(j / 2) * 0.4,
          0.13,
          0.13,
          0.02,
          8,
        );
    }
    S.col(-2.8, 0, -7.85, 3.4, 0.95, -7.05, { walkable: false });
    b.box("steel", -3, 2.3, -7.85, 3.6, 2.9, -6.8, { seg: false });
    b.box("steel", -0.6, 2.9, -7.85, 0.6, KH, -7.2, { seg: false });
    // pots & pans on the stoves
    for (let k = 0; k < 5; k++)
      b.cyl(
        "steel",
        -2.4 + k * 1.3,
        0.97,
        -7.45,
        0.18,
        0.16,
        0.22 + (k % 2) * 0.1,
        10,
      );
    // butcher block + prep tables (the skewer rack)
    b.box("wood", 1.5, 0, -3.6, 5.5, 0.9, -2.2, { segLen: 2 });
    S.col(1.5, 0, -3.6, 5.5, 0.92, -2.2, { walkable: false });
    b.box("steel", -2.6, 0, -5.0, 0.2, 0.9, -4.2, { seg: false });
    S.col(-2.6, 0, -5.0, 0.2, 0.92, -4.2, { walkable: false });
    for (let k = 0; k < 4; k++)
      b.box(
        k % 2 ? "steel" : "wood",
        -2.3 + k * 0.6,
        0.9,
        -4.8,
        -1.95 + k * 0.6,
        0.94,
        -4.4,
        { seg: false },
      );
    for (let k = 0; k < 6; k++)
      b.rod(
        "steel",
        [2.0 + k * 0.08, 0.92, -2.9 - k * 0.03],
        [2.6 + k * 0.08, 0.92, -2.5 - k * 0.03],
        0.004,
        3,
      ); // loose skewers
    b.box("wood_dark", 5.0, 0.9, -3.3, 5.4, 1.3, -3.1, { seg: false }); // knife block
    // meat hooks rail + the raiders' "stock"
    b.rod("steel", [0.5, 3.0, -5.8], [5.5, 3.0, -5.8], 0.03, 5);
    for (let k = 0; k < 4; k++) {
      const x = 1 + k * 1.3;
      b.rod("steel", [x, 3.0, -5.8], [x, 2.6, -5.8], 0.01, 3);
      if (k % 2 === 0)
        b.cyl(k ? "sheet" : "leather", x, 1.2, -5.8, 0.18, 0.12, 1.4, 7, {
          grime: 0.9,
        });
    }
    b.box("paint_red", 0.4, 0.001, -6.8, 5.6, 0.012, -4.8, {
      seg: false,
      noAO: true,
      c: 0x5a1a14,
    }); // old stains
    // walk-in cooler (NE corner) with a door ajar
    S.wallX("steel", -1.2, 6.2, 9.85, 0, KH, 0.15, [[6.8, 8.2, 0, 2.3]]);
    S.wallZ("steel", 6.2, -7.85, -1.2, 0, KH, 0.15, []);
    b.box("steel", 8.2, 0, -1.15, 8.25, 2.3, 0.3, { seg: false, ry: 0 });
    S.prop("fridge", 9.2, 0, -7.2, PI, {
      loot: "fridge",
      name: "Cooler Shelf",
    });
    S.prop("crate", 7.2, 0, -7.2, 0.2, {
      kind: "plain",
      loot: "food_oldworld",
      name: "Produce Crate",
    });
    S.light(8, 2.8, -4.5, 0x9ab8d0, 5, 0.5);
    // inside the cooler: frost-rimed floor, steel shelving of spoiled stock, carcass sacks on a rail
    b.box("frost", 6.35, 0.002, -7.7, 9.7, 0.012, -1.4, {
      seg: false,
      noAO: true,
      grime: 0.5,
    });
    for (const x of [6.7, 9.4]) {
      b.box("steel", x - 0.25, 0, -6.6, x + 0.25, 2.0, -2.6, { seg: false });
      for (let k = 0; k < 4; k++) {
        b.box(
          "steel",
          x - 0.27,
          0.3 + k * 0.5,
          -6.6,
          x + 0.27,
          0.33 + k * 0.5,
          -2.6,
          { seg: false },
        );
        for (let j = 0; j < 5; j++)
          if (r() < 0.6)
            b.box(
              r() < 0.5 ? "meat" : "paper",
              x - 0.18,
              0.33 + k * 0.5,
              -6.4 + j * 0.75,
              x + 0.18,
              0.5 + k * 0.5,
              -6.0 + j * 0.75,
              { seg: false, grime: 0.8 },
            );
      }
      S.col(x - 0.27, 0, -6.6, x + 0.27, 2.0, -2.6, { walkable: false });
    }
    b.rod("steel", [8.05, 3.0, -6.8], [8.05, 3.0, -2.4], 0.03, 5);
    for (let k = 0; k < 3; k++) {
      const z = -6.2 + k * 1.5;
      b.rod("steel", [8.05, 3.0, z], [8.05, 2.5, z], 0.01, 3);
      b.cyl("sheet", 8.05, 1.0, z, 0.22, 0.14, 1.5, 7, {
        grime: 0.95,
        c: 0x9a8a78,
      });
    }
    // cooler door: porthole + latch
    b.box("glass_dark", 8.2, 1.4, -0.12, 8.25, 1.75, 0.12, { seg: false });
    b.box("chrome", 8.18, 1.0, 0.12, 8.3, 1.12, 0.28, { seg: false });
    // dish pit, trash
    b.box("steel", -3.85, 0, -4.8, -3.05, 0.95, -1.2, { seg: false });
    S.col(-3.85, 0, -4.8, -3.05, 0.95, -1.2, { walkable: false });
    for (let k = 0; k < 10; k++)
      b.cyl(
        "paint_white",
        -3.5 + r() * 0.3,
        0.95 + k * 0.02,
        -3 + r() * 1.2,
        0.12,
        0.1,
        0.02,
        10,
      );
    S.prop("trash_can", 9.2, 0, 1.3, 0, {});
    // fluorescent strips
    for (const [x, on] of [
      [0, 1],
      [5, 0],
    ]) {
      b.box(
        on ? "lamp" : "glass_dark",
        x - 1.0,
        KH - 0.1,
        -3.05,
        x + 1.0,
        KH - 0.04,
        -2.95,
        { seg: false },
      );
      if (on) S.light(x, KH - 0.6, -3, 0xe8f0e0, 8, 0.6);
    }
    S.light(3.5, 1.4, -2.9, 0xffa850, 4, 0.5);
    S.pickup("m3_meat_skewer", 1, 3.2, 0.93, -2.75);
    S.anchor("kitchen", 3.5, 0, -1, 0);
    S.anchor("skewer", 3.5, 0.94, -2.9, 0);
    S.anchor("spawn3", 3.0, 0, 0.4, PI);
    S.anchor("loot2", 9.2, 0, -7.2, 0);

    // =================== service stairwell (x -8..-4, z -8..2) ===================
    // ground floor pieces around the down-flight opening (x -7.9..-6.1, z -5..0.1)
    S.floor("concrete", -8, 0.1, -4, 2, 0);
    S.floor("concrete", -6.1, -8, -4, 0.1, 0);
    S.floor("concrete", -8, -8, -6.1, -5, 0);
    S.wallZ("brick_red", -8, -8, 2, BY, UY + 3.6, 0.3, []);
    S.wallX("brick_red", -8, -8.15, -3.85, BY, UY + 3.6, 0.3, []);
    // x=-4 wall above the kitchen height (to the upstairs floor) + upstairs
    S.wallZ("brick_red", -4, -8, 2, KH, UY, 0.3, []);
    S.wallZ("plaster_red", -4, -8, 2, UY, UY + 3.6, 0.3, [
      [-7.6, -6.1, 0, 2.4],
    ]);
    // down flight: bottom z 0.1 in the basement, climbing north to the ground at z -5
    S.stairs("concrete", -7, 0.1, "n", 1.8, BY, 0, {
      rail: "iron",
      railSides: [1],
    });
    S.rail(
      "iron",
      [
        [-6.1, 0.1],
        [-7.9, 0.1],
      ],
      0,
      1.0,
      { r: 0.03 },
    );
    // up flight: bottom z 1.6 at ground, climbing north to the upstairs at z -4.4
    S.stairs("concrete", -5.1, 1.6, "n", 1.8, 0, UY, {
      rail: "iron",
      railSides: [-1],
      railCol: false,
    });
    // upstairs floor pieces around the up-flight opening (x -6..-4.2, z -4.4..1.6)
    S.floor("parquet", -8, -8, -4, -4.4, UY, { surface: "wood" });
    S.floor("parquet", -8, -4.4, -6, 2, UY, { surface: "wood" });
    S.rail(
      "iron",
      [
        [-6, -4.4],
        [-6, 1.6],
        [-4.2, 1.6],
      ],
      UY,
      1.0,
      { r: 0.03 },
    );
    S.ceil("plaster", -8, -8, -4, 2, UY + 3.6);
    b.box("lamp_dim", -6.2, UY + 3.45, -6.2, -5.8, UY + 3.5, -5.8, {
      seg: false,
    });
    S.light(-6, UY + 3, -6, 0xffd8a0, 7, 0.6);
    S.light(-6, 2.8, -1.5, 0xffc890, 6, 0.45);
    const ss = P.texMat(
      "club52_svc",
      P.signTex(
        "club52_svc",
        ["EMPLOYEES ONLY", "CELLAR ▼   UPSTAIRS ▲"],
        "label",
        512,
        160,
      ),
      { rough: 0.8 },
    );
    b.quad(ss, -7.83, 1.8, -6.6, 1.1, 0.34, { ry: HP });

    // =================== BASEMENT (y -4) ===================
    const BH = 3.2;
    S.floor("concrete", -8, -14, 10, 4, BY);
    S.ceil("concrete", -6.1, -14, 10, 4, BY + BH);
    S.ceil("concrete", -8, -14, -6.1, -5, BY + BH);
    S.ceil("concrete", -8, 0.1, -6.1, 4, BY + BH);
    S.wallX("brick_red", -14, -8.15, 10.15, BY, BY + BH, 0.3, []);
    S.wallX("brick_red", 4, -8.15, 10.15, BY, BY + BH, 0.3, []);
    S.wallZ("brick_red", -8, -14, 4, BY, BY + BH, 0.3, []);
    // the east wall (x = 10) — solid brick, except the two-ton door opening z -9.2..-7.0 (filled by the leaf)
    S.wallZ("brick_red", 10, -14, 4, BY, BY + BH, 0.5, [[-9.2, -7.0, 0, 2.5]]);
    // wall between the stair column and the stores (with an opening)
    S.wallZ("brick_red", -4, -14, -8, BY, BY + BH, 0.3, [[-11, -9.5, 0, 2.3]]);
    // stores: shelving, kegs, crates, the old ice room, boiler
    for (const z of [-12.8, -10.6]) {
      b.box("steel", -3.5, BY, z - 0.35, 3.5, BY + 2.2, z + 0.35, {
        seg: false,
      });
      for (let s = 0; s < 4; s++) {
        b.box(
          "steel",
          -3.5,
          BY + 0.2 + s * 0.55,
          z - 0.37,
          3.5,
          BY + 0.23 + s * 0.55,
          z + 0.37,
          { seg: false },
        );
        for (let k = 0; k < 14; k++)
          if (r() < 0.55)
            b.box(
              r() < 0.5 ? "crate" : "paint_cream",
              -3.3 + k * 0.48,
              BY + 0.23 + s * 0.55,
              z - 0.22,
              -3.0 + k * 0.48,
              BY + 0.5 + s * 0.55,
              z + 0.18,
              { seg: false },
            );
      }
      S.col(-3.5, BY, z - 0.37, 3.5, BY + 2.2, z + 0.37, { walkable: false });
    }
    for (let k = 0; k < 6; k++) {
      const x = 5 + (k % 3) * 0.75,
        z = 2.8 - Math.floor(k / 3) * 0.8;
      b.cyl("wood", x, BY, z, 0.32, 0.3, 0.8, 10);
      b.torus("iron", x, BY + 0.2, z, 0.315, 0.015, TAU, {
        rx: HP,
        ts: 12,
        rs: 3,
      });
      b.torus("iron", x, BY + 0.6, z, 0.315, 0.015, TAU, {
        rx: HP,
        ts: 12,
        rs: 3,
      });
    }
    S.col(4.6, BY, 1.6, 7.0, BY + 0.8, 3.2, { walkable: false });
    b.cyl("rust", 7.8, BY, -3.2, 0.9, 0.9, 2.4, 12);
    b.rod("rust", [7.8, BY + 2.4, -3.2], [7.8, BY + BH, -3.2], 0.15, 6);
    S.col(6.9, BY, -4.1, 8.7, BY + 2.4, -2.3, { walkable: false });
    S.light(7.8, BY + 0.6, -2.2, 0xff6a20, 3, 0.4);
    S.glow(7.8, BY + 0.5, -2.25, 0xff6020, 0.25);
    // the raiders' pen (chain-link, a skeleton, a bucket)
    for (let z = -3.8; z <= 1.8; z += 0.2)
      b.rod("iron", [0.2, BY, z], [0.2, BY + 2.4, z], 0.008, 3);
    for (let x = -3.8; x <= 0.2; x += 0.2)
      b.rod("iron", [x, BY, 1.8], [x, BY + 2.4, 1.8], 0.008, 3);
    b.rod("iron", [0.2, BY + 2.4, -3.8], [0.2, BY + 2.4, 1.8], 0.02, 4);
    b.rod("iron", [-3.8, BY + 2.4, 1.8], [0.2, BY + 2.4, 1.8], 0.02, 4);
    S.col(0.15, BY, -3.8, 0.25, BY + 2.4, 1.8, { walkable: false });
    S.col(-3.8, BY, 1.75, 0.2, BY + 2.4, 1.85, { walkable: false });
    S.prop("skeleton", -2.4, BY, -1.2, 0.8, { pose: "curled" });
    S.pickup("m3_note_pen", 1, -1.8, BY + 0.02, -0.4);
    // bare bulbs
    for (const [x, z, on] of [
      [-1, -7.8, 1],
      [5, -9, 0],
      [5, -2, 1],
      [-6, -11, 1],
    ]) {
      b.rod("iron", [x, BY + BH - 0.4, z], [x, BY + BH, z], 0.006, 3);
      b.sphere(on ? "lamp_amber" : "glass_dark", x, BY + BH - 0.45, z, 0.06);
      if (on) S.light(x, BY + BH - 0.6, z, 0xffc070, 7, 0.7);
    }
    // the secret spot: tidy brick with a single dark pin-hole
    b.box("paint_black", 9.74, BY + 1.18, -8.12, 9.745, BY + 1.2, -8.08, {
      seg: false,
      noAO: true,
    });
    b.torus("concrete_dark", 10, BY + 0.004, -7.0, 2.1, 0.035, HP * 0.95, {
      rx: HP,
      ry: PI,
      ts: 14,
      rs: 2,
      noAO: true,
    });
    S.pickup("m3_note_chaz", 1, 6.5, BY + 0.02, -9.8);
    b.cyl("wood", 7.2, BY, -10.6, 0.3, 0.28, 0.46, 10);
    b.torus("iron", 7.2, BY + 0.12, -10.6, 0.3, 0.012, TAU, {
      rx: HP,
      ts: 12,
      rs: 3,
    });
    b.torus("iron", 7.2, BY + 0.36, -10.6, 0.29, 0.012, TAU, {
      rx: HP,
      ts: 12,
      rs: 3,
    });
    S.col(6.9, BY, -10.9, 7.5, BY + 0.46, -10.3, { walkable: false });
    S.prop("skeleton", 7.2, BY + 0.02, -10.6, 2.4, { pose: "sitting" });
    // the Jockeys' dig: holes bashed through the other walls (not this one), picks & sledges, chalk marks, NOT HERE
    const hole = (x0, x1, z, y0, y1, face) => {
      b.box("paint_black", x0, BY + y0, z - 0.01, x1, BY + y1, z + 0.01, {
        seg: false,
        noAO: true,
        grime: 0,
      });
      for (let k = 0; k < 7; k++)
        b.rock(
          "brick_red",
          x0 + r() * (x1 - x0),
          BY + 0.1,
          z + face * (0.3 + r() * 0.7),
          0.14 + r() * 0.18,
          { flat: 0.6 },
        );
      b.box(
        "rubble",
        x0 - 0.2,
        BY,
        Math.min(z, z + face * 1.1),
        x1 + 0.2,
        BY + 0.22,
        Math.max(z, z + face * 1.1),
        { seg: false, grime: 0.9 },
      );
    };
    hole(-6.6, -5.4, -13.83, 0.5, 1.6, 1);
    hole(1.2, 2.2, 3.83, 0.2, 1.1, -1);
    hole(5.0, 6.2, -13.83, 0.8, 1.9, 1);
    const nh = P.texMat(
      "club52_nothere",
      P.signTex("club52_nothere", ["NOT HERE"], "raider", 512, 128, {
        fg: "#e8e4d8",
      }),
      { transparent: true },
    );
    b.quad(nh, -6.0, BY + 2.1, -13.82, 1.6, 0.4, { ry: 0 });
    b.quad(nh, 5.6, BY + 2.4, -13.82, 1.6, 0.4, { ry: 0 });
    b.quad(nh, 1.7, BY + 1.6, 3.82, 1.6, 0.4, { ry: PI });
    for (const [x, z, ry] of [
      [-3.2, -7.8, 0],
      [0.8, -8.0, 0.2],
    ]) {
      for (let k = -1; k <= 1; k += 2)
        b.box(
          "chalk",
          x - 0.3,
          BY + 1.6 + k * 0.001,
          z,
          x + 0.3,
          BY + 1.63,
          z + 0.01,
          { seg: false, rz: k * 0.7, ry },
        );
    }
    for (const [x, z, ry] of [
      [-5.2, -12.6, 0.4],
      [3.6, -12.9, -0.3],
      [8.8, -6.0, 1.2],
    ]) {
      b.rod(
        "wood",
        [x, BY + 0.05, z],
        [x + Math.cos(ry) * 0.9, BY + 0.05, z + Math.sin(ry) * 0.9],
        0.025,
        5,
      );
      b.box(
        "rust",
        x + Math.cos(ry) * 0.9 - 0.25,
        BY,
        z + Math.sin(ry) * 0.9 - 0.05,
        x + Math.cos(ry) * 0.9 + 0.25,
        BY + 0.08,
        z + Math.sin(ry) * 0.9 + 0.05,
        { ry: -ry, seg: false },
      );
    }
    for (let k = 0; k < 5; k++)
      b.boxC(
        "crate",
        -6.8 + k * 0.7,
        BY,
        -7.2 + (k % 2) * 0.5,
        0.6,
        0.35 + (k % 3) * 0.15,
        0.5,
        { ry: k * 0.6, rz: k % 2 ? 0.25 : 0, seg: false, grime: 0.8 },
      );
    // pipes along the ceiling + a string of bare bulbs
    for (const [z, rr] of [
      [-12.2, 0.07],
      [-11.9, 0.05],
      [2.6, 0.08],
    ])
      b.rod(
        z > 0 ? "rust" : "steel",
        [-7.8, BY + BH - 0.25, z],
        [9.8, BY + BH - 0.25, z],
        rr,
        6,
      );
    b.rod(
      "rubber",
      [-7.5, BY + BH - 0.35, -6.6],
      [9.6, BY + BH - 0.45, -6.6],
      0.008,
      3,
    );
    for (let k = 0; k < 8; k++) {
      const x = -7 + k * 2.2,
        on = k % 3 !== 1;
      b.sphere(on ? "lamp_amber" : "glass_dark", x, BY + BH - 0.58, -6.6, 0.05);
      if (on && k % 2 === 0) S.light(x, BY + BH - 0.8, -6.6, 0xffc070, 5, 0.45);
    }
    S.anchor("basement", 5.5, BY, -7, 0); // quest marker: close enough to the suspicious brick section to notice it
    S.anchor("secret_wall", 9.7, BY, -8.1, -HP);
    S.anchor("spawn4", -1.5, BY, -8.2, 0);
    S.anchor("loot3", 5.6, BY, 2.4, 0);
    S.prop("toolbox", -7.3, BY, -13.2, HP, { loot: "toolbox" });
    // the dig crew's corner in the middle of the floor: crate stacks, a bedroll, a lantern, empties
    for (const [x, z, h, ry] of [
      [3.4, -5.6, 0.6, 0.2],
      [4.1, -5.1, 0.6, -0.3],
      [3.7, -5.3, 1.2, 0.5],
      [-1.2, -4.6, 0.6, 0.1],
    ])
      b.boxC("crate", x, BY + h - 0.6, z, 0.7, 0.6, 0.6, {
        ry,
        seg: false,
        grime: 0.7,
      });
    S.col(3.0, BY, -6.0, 4.5, BY + 1.2, -4.7, { walkable: false });
    S.prop("mattress", 1.4, BY, -3.0, 0.3, {});
    // lantern stands ON the top crate (top face at BY+1.2): iron base, amber globe, wire cage, carry bail
    b.cyl("iron", 3.7, BY + 1.2, -5.3, 0.09, 0.1, 0.04, 8);
    b.cyl("lamp_amber", 3.7, BY + 1.24, -5.3, 0.07, 0.09, 0.2, 8);
    b.cyl("iron", 3.7, BY + 1.44, -5.3, 0.05, 0.08, 0.04, 8);
    for (let k = 0; k < 4; k++) {
      const ang = k * HP + 0.4;
      b.rod(
        "iron",
        [3.7 + Math.cos(ang) * 0.1, BY + 1.24, -5.3 + Math.sin(ang) * 0.1],
        [3.7 + Math.cos(ang) * 0.08, BY + 1.45, -5.3 + Math.sin(ang) * 0.08],
        0.006,
        3,
      );
    }
    b.torus("iron", 3.7, BY + 1.5, -5.3, 0.06, 0.006, PI, { ts: 8, rs: 3 });
    S.light(3.7, BY + 1.55, -5.3, 0xffb060, 6, 0.8);
    S.glow(3.7, BY + 1.34, -5.3, 0xffa040, 0.4);
    for (let k = 0; k < 8; k++)
      b.cyl(
        r() < 0.5 ? "glass_dark" : "glass",
        0.5 + r() * 3,
        BY,
        -4 + r() * 2,
        0.035,
        0.04,
        0.26,
        6,
        { rz: HP },
      );

    // =================== WINE CELLAR (y -4; No. 19's basement) ===================
    const CX0 = 12,
      CX1 = 26,
      CZ0 = -14,
      CZ1 = 3,
      CH = 2.7;
    S.floor("brick_red", CX0, CZ0, CX1, CZ1, BY, { surface: "concrete" });
    // passage behind the door (x 10..12)
    S.floor("brick_red", 10, -9.2, 12, -7.0, BY);
    S.wallX("brick_red", -9.35, 10.2, 12, BY, BY + 2.6, 0.3, []);
    S.wallX("brick_red", -6.85, 10.2, 12, BY, BY + 2.6, 0.3, []);
    b.box("brick_red", 10.2, BY + 2.5, -9.3, 12, BY + 2.8, -6.9, {
      seg: false,
    });
    S.wallX(
      "brick_red",
      CZ0,
      CX0 - 0.15,
      CX1 + 0.15,
      BY,
      BY + CH + 1.2,
      0.3,
      [],
    );
    S.wallX(
      "brick_red",
      CZ1,
      CX0 - 0.15,
      CX1 + 0.15,
      BY,
      BY + CH + 1.2,
      0.3,
      [],
    );
    S.wallZ("brick_red", CX0, CZ0, CZ1, BY, 2.6, 0.3, [[-9.2, -7.0, 0, 2.5]]);
    S.wallZ("brick_red", CX1, CZ0, 4.4, BY, 2.6, 0.3, [[-4, -2, 0, 2.5]]);
    // barrel vault: half-cylinder seen from inside along x
    {
      const L = CX1 - CX0,
        R = (CZ1 - CZ0) / 2,
        cz = (CZ0 + CZ1) / 2;
      const vg = new THREE.CylinderGeometry(R, R, L, 20, 6, true, 0, PI);
      vg.rotateZ(HP);
      b.inside(
        "brick_red",
        vg,
        P.m4((CX0 + CX1) / 2, BY + CH, cz, 0, 0, 0, 1, 0.3, 1),
        { grime: 0.6 },
      );
      for (let x = CX0 + 1.5; x < CX1; x += 3) {
        const rg = new THREE.TorusGeometry(R - 0.05, 0.12, 4, 20, PI);
        b.geo("brick_red", rg, P.m4(x, BY + CH, cz, HP, 0, 0, 1, 0.3, 1), {
          grime: 0.7,
        });
      }
    }
    // racks along the long walls
    rackX(b, CX0 + 0.4, CX1 - 0.4, BY, CZ0 + 0.15, 1, 2.1, r);
    rackX(b, CX0 + 0.4, 21.6, BY, CZ1 - 0.15, -1, 2.1, r);
    S.col(CX0, BY, CZ0, CX1, BY + 2.1, CZ0 + 0.6, { walkable: false });
    S.col(CX0, BY, CZ1 - 0.6, 21.6, BY + 2.1, CZ1, { walkable: false });
    // private-collection lockers (west end, brass nameplates)
    const NAMES = [
      "MAYOR O'ROURKE",
      "J.-C. BRADBERTON",
      "SEN. HOLLAND",
      "SUPER SERGEANT",
      "GEN. CHASE",
      "MRS. VANDERHOOF",
      "C. MCGEE",
      "H. DALTON",
    ];
    const lk = [];
    for (let k = 0, z = CZ0 + 1.6; k < 8; k++, z += 1.3) {
      if (z > -9.9 && z < -6.3) z = -5.8; // keep the passage from the two-ton door clear
      if (z > CZ1 - 1.4) break;
      b.box(
        "iron",
        CX0 + 0.15,
        BY + 0.5,
        z - 0.55,
        CX0 + 0.55,
        BY + 1.8,
        z + 0.55,
        { seg: false },
      );
      b.box(
        "steel",
        CX0 + 0.55,
        BY + 0.55,
        z - 0.5,
        CX0 + 0.58,
        BY + 1.75,
        z + 0.5,
        { seg: false },
      );
      const nk = P.texMat(
        "club52_lock" + k,
        P.signTex("club52_lock" + k, [NAMES[k]], "brass", 256, 64),
        { rough: 0.4, metal: 0.4 },
      );
      b.quad(nk, CX0 + 0.6, BY + 1.55, z, 0.7, 0.17, { ry: HP });
      lk.push([NAMES[k], z]);
    }
    S.col(CX0, BY, CZ0 + 1, CX0 + 0.6, BY + 1.8, -9.9, { walkable: false });
    S.col(CX0, BY, -6.3, CX0 + 0.6, BY + 1.8, CZ1 - 1.4, { walkable: false });
    // tasting table with candles, chairs, the sommelier
    b.box("wood_dark", 16, BY, -7.2, 20, BY + 0.78, -5.8, { segLen: 2 });
    S.col(16, BY, -7.2, 20, BY + 0.8, -5.8, { walkable: false });
    D.candles(S, 16.8, BY + 0.78, -6.5, 3, { r: 6, i: 0.9 });
    D.candles(S, 19.2, BY + 0.78, -6.5, 3, { r: 6, i: 0.9 });
    for (let k = 0; k < 6; k++)
      b.cyl(
        k % 2 ? "glass" : "glass_dark",
        17.4 + k * 0.3,
        BY + 0.78,
        -6.5 + ((k % 3) - 1) * 0.2,
        0.035,
        0.035,
        0.3,
        6,
      );
    for (const [x, z, ry] of [
      [17, -7.8, 0],
      [19, -7.8, 0],
      [19, -5.2, PI],
    ])
      D.chair(b, x, BY, z, ry, {
        seat: "leather",
        wood: "wood_dark",
        arms: true,
      });
    S.prop("skeleton", 19, BY, -5.2, PI, { pose: "seated" });
    S.pickup("m3_reel_sommelier", 1, 18.6, BY + 0.8, -6.1);
    // the Mayor's Reserve: a crate on a little plinth under a hanging lamp
    b.box("marble_dark", 23.4, BY, -10.2, 25.2, BY + 0.5, -8.4, { seg: false });
    S.col(23.4, BY, -10.2, 25.2, BY + 0.5, -8.4, { walkable: false });
    b.box("crate", 23.6, BY + 0.5, -10, 25, BY + 1.1, -8.6, { seg: false });
    const mr = P.texMat(
      "club52_reserve",
      P.signTex(
        "club52_reserve",
        ["THE MAYOR'S RESERVE", "KENTUCKY · 1932 · DO NOT SERVE"],
        "engraved",
        512,
        128,
        { bg: "#9a8a68" },
      ),
      { rough: 0.8 },
    );
    b.quad(mr, 23.58, BY + 0.82, -9.3, 1.3, 0.32, { ry: -HP });
    b.rod("iron", [24.3, BY + 2.6, -9.3], [24.3, BY + CH + 1.0, -9.3], 0.01, 3);
    b.cyl("lamp_amber", 24.3, BY + 2.4, -9.3, 0.08, 0.22, 0.2, 8);
    S.light(24.3, BY + 2.1, -9.3, 0xffc070, 6, 1.0, 0.4);
    S.pickup("m3_mayors_reserve", 1, 24.3, BY + 1.12, -9.3);
    // private-collection lockers are containers (brass plates above)
    const LOCK_ITEMS = {
      "MAYOR O'ROURKE": [
        ["whiskey", 2],
        ["scrip", 45],
      ],
      "J.-C. BRADBERTON": [
        ["fizzo_blue", 1],
        ["fizzo_cola", 2],
      ],
      "SEN. HOLLAND": [
        ["scotch", 2],
        ["old_dollars", 6],
      ],
      "SUPER SERGEANT": [
        ["wine", 1],
        ["shade_field", 1],
      ],
      "GEN. CHASE": [
        ["vodka", 2],
        ["ammo_44", 12],
      ],
      "MRS. VANDERHOOF": [
        ["wine", 3],
        ["gold_bar", 1],
      ],
      "C. MCGEE": [["beer", 4]],
      "H. DALTON": [
        ["whiskey", 1],
        ["rush", 1],
      ],
    };
    for (const [nm, z] of lk)
      S.container("Private Locker — " + nm, CX0 + 0.62, BY + 1.1, z, {
        items: LOCK_ITEMS[nm] || [["wine", 1]],
        locked: 0,
        lock:
          nm === "MRS. VANDERHOOF"
            ? P.LOCKS.locker_vanderhoof
            : nm === "J.-C. BRADBERTON"
              ? P.LOCKS.locker_bradberton
              : undefined,
        radius: 0.7,
      });
    for (let k = 0; k < 4; k++)
      S.pickup(
        k % 2 ? "wine" : "scotch",
        1,
        14 + k * 2.6,
        BY + 0.9 + (k % 2) * 0.3,
        CZ0 + 0.4,
      );
    S.light(15, BY + 2.2, -11, 0xffb070, 7, 0.5);
    S.light(15, BY + 2.2, 0, 0xffb070, 7, 0.45);
    // kegs & cases stacked east
    for (let k = 0; k < 5; k++)
      b.cyl(
        "wood",
        25.2,
        BY + 0.4 + (k > 2 ? 0.8 : 0),
        -12.8 + (k % 3) * 0.85,
        0.4,
        0.4,
        0.8,
        10,
        { rx: HP },
      );
    S.col(24.7, BY, -13.4, 25.7, BY + 1.6, -10.6, { walkable: false });
    // bootleggers' stair shaft (east of the cellar) up to the sidewalk hatch, landing at street level
    S.floor("brick_red", 26, -4, 28.6, 2.3, BY);
    S.stairs("brick_red", 27.4, -2.8, "s", 2.2, BY, 0, {
      rail: "iron",
      railSides: [-1],
    });
    S.floor("concrete", 26, 2.3, 28.6, 4.4, 0);
    S.wallZ("brick_red", 28.6, -4, 4.4, BY, 2.6, 0.3, []);
    S.wallX("brick_red", -4, 26, 28.75, BY, 2.6, 0.3, []);
    S.wallX("brick_red", 4.4, 26, 28.75, BY, 2.6, 0.3, []);
    b.box("concrete", 26, 2.6, -4, 28.6, 2.75, 2.3, { seg: false });
    b.box("rust", 26.1, 2.55, 2.4, 28.5, 2.6, 4.3, { seg: false }); // hatch doors overhead
    for (let k = 0; k < 8; k++)
      b.box("iron", 27.0, 0.3 + k * 0.28, 4.1, 27.8, 0.33 + k * 0.28, 4.22, {
        seg: false,
      });
    for (const sx of [-1, 1])
      b.box(
        "iron",
        27.4 + sx * 0.42 - 0.03,
        0,
        4.1,
        27.4 + sx * 0.42 + 0.03,
        2.55,
        4.22,
        { seg: false },
      );
    S.light(27.4, 2.2, 3.4, 0xc8d8e8, 5, 0.5);
    S.light(27.4, BY + 2.2, -3, 0xffb070, 5, 0.4);
    const hs = P.texMat(
      "club52_hs",
      P.signTex(
        "club52_hs",
        ["NO. 19 — DELIVERIES", "KNOCK TWICE · ASK FOR CHARLIE"],
        "label",
        512,
        160,
      ),
      { rough: 0.8 },
    );
    b.quad(hs, 28.43, BY + 1.9, -1.2, 1.1, 0.34, { ry: -HP });
    S.anchor("cellar", 18, BY, -9, 0);
    S.anchor("reserve", 24.3, BY, -9.3, -HP);
    S.anchor("hatch_landing", 27.4, 0, 3.3, PI);
    S.anchor("loot4", 23.8, BY, -12, 0);

    // =================== UPSTAIRS (y 4.6): "Upstairs at 21", the Jockeys' den ===================
    // The old private dining rooms, split as they were: the THRONE ROOM (west, the King's dais), the DORM (north-east,
    // where the gang sleeps, cooks chems and drinks) and the TROPHY ROOM (south-east, the stair head: cage, gore, loot).
    const UH = 3.8;
    S.floor("parquet", -10, 2, 8, 20, UY, { surface: "wood" });
    S.floor("parquet", 8, 2, 10, 12.6, UY, { surface: "wood" });
    S.floor("parquet", 8, 18.6, 10, 20, UY, { surface: "wood" });
    S.rail(
      "gold",
      [
        [8, 12.6],
        [8, 18.6],
        [10, 18.6],
      ],
      UY,
      1.0,
      { r: 0.035 },
    );
    S.ceil("tin_ceiling", -10, 2, 10, 20, UY + UH);
    for (let x = -8; x <= 8; x += 4)
      b.box(
        "wood_dark",
        x - 0.14,
        UY + UH - 0.3,
        2.2,
        x + 0.14,
        UY + UH - 0.02,
        19.8,
        { seg: false },
      );
    S.wallX("damask", 20, -10.15, 10.15, UY, UY + UH, 0.3, []);
    S.wallX("damask", 2, -10.15, 10.15, UY, UY + UH, 0.3, [
      [-8, -6.2, 0, 2.4],
      [1, 2.6, 0, 2.4],
    ]);
    S.wallZ("damask", -10, 2, 20, UY, UY + UH, 0.3, []);
    S.wallZ("damask", 10, 2, 20, UY, UY + UH, 0.3, []);
    S.wallZ("damask", -2, 2.15, 19.85, UY, UY + UH, 0.24, [
      [9.4, 11.0, 0, 2.4],
      [13.2, 14.8, 0, 2.4],
    ]);
    S.wallX("damask", 11, -1.88, 9.85, UY, UY + UH, 0.24, [[3.0, 4.6, 0, 2.4]]);
    for (const [x0, z0, x1, z1] of [
      [-2.15, 9.4, -1.85, 9.5],
      [-2.15, 10.9, -1.85, 11.0],
      [-2.15, 13.1, -1.85, 13.2],
      [-2.15, 14.8, -1.85, 14.9],
    ])
      b.box("wood_dark", x0, UY, z0, x1, UY + 2.5, z1, { seg: false });
    // French windows onto the balcony (south wall = the facade): boarded, daylight slits
    for (const x of [-7.8, -4.2, 0.6, 4.2]) {
      b.box(
        "glass_dark",
        x - 0.65,
        UY + 0.2,
        19.83,
        x + 0.65,
        UY + 3.1,
        19.84,
        { seg: false },
      );
      for (let k = 0; k < 5; k++)
        b.box(
          "wood_rotten",
          x - 0.75,
          UY + 0.4 + k * 0.58,
          19.78,
          x + 0.75,
          UY + 0.62 + k * 0.58,
          19.84,
          { seg: false, rx: k % 2 ? 0.04 : -0.04 },
        );
      S.light(x, UY + 1.8, 19.2, 0xc8d4d8, 5, 0.45);
    }
    // ---- THRONE ROOM (x -10..-2) ----
    b.box("wood_dark", -10, UY, 7, -5.6, UY + 0.45, 15, { segLen: 2 });
    S.col(-10, UY, 7, -5.6, UY + 0.45, 15, { surface: "wood" });
    S.stairs("wood_dark", -5.3, 11, "w", 2.2, UY, UY + 0.45, { run: 0.3 });
    D.rug(b, -9.8, 7.2, -5.8, 14.8, UY + 0.45, "carpet_red");
    D.rug(b, -5.3, 9.6, -2.3, 12.4, UY + 0.005, "carpet_red");
    D.horse(b, "paint_white", -8.2, UY + 0.45 + 0.3, 11, HP, 0.95, {
      rear: false,
    });
    b.rod("gold", [-8.2, UY + 0.45, 11], [-8.2, UY + UH, 11], 0.04, 6); // carousel pole
    b.box(
      "leather",
      -8.6,
      UY + 0.45 + 1.62,
      10.5,
      -7.8,
      UY + 0.45 + 1.72,
      11.5,
      { seg: false },
    );
    for (const sz of [-1, 1]) {
      const sk = P.silkKey("silk_red");
      b.box(
        sk[0],
        -9.9,
        UY + 0.45,
        11 + sz * 2.8 - 0.4,
        -9.8,
        UY + 3.4,
        11 + sz * 2.8 + 0.4,
        { seg: false, c: sk[1] },
      );
    }
    b.box("wood_dark", -9.7, UY + 0.45, 8, -8.9, UY + 1.3, 9.6, { seg: false });
    for (let k = 0; k < 4; k++)
      b.lathe(
        "gilt",
        [
          [0.001, 0],
          [0.08, 0],
          [0.03, 0.05],
          [0.03, 0.15],
          [0.12, 0.25],
          [0.1, 0.38],
          [0.001, 0.36],
        ],
        10,
        -9.3,
        UY + 1.3,
        8.2 + k * 0.4,
      );
    b.torus("foliage", -9.7, UY + 2.6, 11, 0.7, 0.12, PI * 1.6, {
      ry: HP,
      ts: 16,
      rs: 5,
      rz: PI * 1.3,
    });
    const kingSign = P.texMat(
      "club52_king",
      P.signTex(
        "club52_king",
        ["THE JOCKEY KING", "ALL BETS ARE FINAL"],
        "raider",
        512,
        256,
      ),
      { transparent: true },
    );
    b.quad(kingSign, -9.82, 3.2 + UY, 11, 3.4, 1.7, { ry: HP });
    D.candles(S, -6.2, UY + 0.45, 8, 4, { r: 6, i: 0.9 });
    D.candles(S, -6.2, UY + 0.45, 14, 4, { r: 6, i: 0.9 });
    // lawn jockeys as the King's honour guard, flanking the dais (two with raider skulls)
    for (const [z, sk, s1, s2] of [
      [6.2, true, "silk_red", "silk_yellow"],
      [15.8, false, "silk_green", "silk_white"],
      [7.4, false, "silk_blue", "silk_orange"],
      [14.6, true, "silk_purple", "silk_white"],
    ])
      P.jockey(
        b,
        z < 7 || z > 15 ? -6.0 : -5.95,
        UY + (z < 7 || z > 15 ? 0 : 0.45),
        z,
        HP,
        { silk: s1, silk2: s2, s: 1.35, skull: sk, pose: "salute" },
      );
    // junk barricade across the south end (scrap sheets, a toppled banquette), framed silks on the north wall
    for (let k = 0; k < 4; k++)
      b.boxC(
        k % 2 ? "corrugated" : "rust",
        -9.2 + k * 1.9,
        UY,
        17.4 + (k % 2) * 0.3,
        1.8,
        1.3 + (k % 3) * 0.3,
        0.06,
        { ry: (k - 1.5) * 0.12, seg: false, grime: 0.85 },
      );
    S.col(-9.9, UY, 17.2, -2.3, UY + 1.3, 17.9, { walkable: false });
    b.box("leather", -6.0, UY, 18.4, -3.2, UY + 0.45, 19.2, {
      seg: false,
      rz: 0.12,
      c: 0x9a3024,
    });
    for (let k = 0; k < 3; k++) {
      const x = -5.4 + k * 1.3,
        sk = P.silkKey(P.SILKS[(k + 2) % P.SILKS.length]);
      b.box("gilt_dull", x - 0.45, UY + 1.6, 2.16, x + 0.45, UY + 2.7, 2.2, {
        seg: false,
      });
      b.box(sk[0], x - 0.38, UY + 1.67, 2.2, x + 0.38, UY + 2.63, 2.22, {
        seg: false,
        noAO: true,
        c: sk[1],
      });
    }
    D.chandelier(S, -5.5, UY + UH - 0.9, 11, 0.7, {
      tiers: 2,
      broken: true,
      lr: 6,
      li: 0.55,
    });
    // ---- DORM (x -2..10, z 2..11) ----
    for (const [x, z, ry] of [
      [-0.6, 3.6, HP],
      [-0.6, 6.4, HP + 0.1],
      [3.6, 9.6, 0.05],
      [6.4, 9.7, -0.08],
    ])
      S.prop("mattress", x, UY, z, ry, {});
    for (const [x, z] of [
      [0.4, 4.2],
      [0.7, 6.9],
      [4.4, 9.2],
    ])
      b.box(
        "paint_red",
        x - 0.3,
        UY + 0.005,
        z - 0.2,
        x + 0.25,
        UY + 0.012,
        z + 0.3,
        { seg: false, noAO: true, c: 0x4a1410 },
      ); // old blood
    S.prop("footlocker", -1.4, UY, 8.6, HP, {
      loot: "raider_stash",
      name: "Jockey's Footlocker",
    });
    // the chem table: a kitchen table, burners, tubing, jars
    b.box("wood_rotten", 2.6, UY + 0.78, 4.2, 5.0, UY + 0.84, 5.4, {
      seg: false,
    });
    for (const [x, z] of [
      [2.7, 4.3],
      [4.9, 4.3],
      [2.7, 5.3],
      [4.9, 5.3],
    ])
      b.box("rust", x - 0.04, UY, z - 0.04, x + 0.04, UY + 0.78, z + 0.04, {
        seg: false,
      });
    S.col(2.6, UY, 4.2, 5.0, UY + 0.84, 5.4, { walkable: false });
    for (let k = 0; k < 7; k++)
      b.cyl(
        k % 3 ? "glass" : "glass_dark",
        2.9 + k * 0.3,
        UY + 0.84,
        4.5 + (k % 2) * 0.5,
        0.05,
        0.06,
        0.18 + (k % 3) * 0.08,
        7,
        { noAO: true },
      );
    b.cyl("steel", 3.3, UY + 0.84, 5.0, 0.12, 0.12, 0.1, 10);
    b.cyl("fire", 3.3, UY + 0.94, 5.0, 0.04, 0.07, 0.06, 6);
    b.rod("rubber", [3.3, UY + 1.0, 5.0], [4.2, UY + 1.2, 4.6], 0.012, 4);
    S.light(3.3, UY + 1.3, 5.0, 0x80c0ff, 3, 0.5);
    S.pickup("rush", 1, 4.3, UY + 0.86, 5.1);
    S.pickup("rage", 1, 3.7, UY + 0.86, 4.4);
    S.pickup("bull_tabs", 1, 2.9, UY + 0.86, 5.2);
    S.prop("fizzo_machine", 9.3, UY, 9.8, -HP, {});
    S.prop("workbench", 9.4, UY, 5, -HP, {});
    for (let k = 0; k < 4; k++)
      D.chair(
        b,
        6.2 + (k % 2) * 0.5,
        UY + (k > 1 ? 0.5 : 0),
        3.4 + (k % 2) * 0.4,
        r() * 3,
        { seat: "velvet", wood: "wood_dark", toppled: k % 2 === 0 },
      );
    b.box("wood_rotten", 5.5, UY, 2.6, 7.6, UY + 0.5, 4.4, {
      rz: 0.05,
      seg: false,
    });
    S.col(5.5, UY, 2.6, 7.6, UY + 0.5, 4.4, { walkable: false });
    D.chandelier(S, 3.5, UY + UH - 0.9, 7.2, 0.7, {
      tiers: 2,
      broken: true,
      lr: 6,
      li: 0.5,
    });
    S.prop("barrel", 0.6, UY, 9.9, 0, { burning: true });
    S.light(0.6, UY + 1.8, 9.9, 0xff8a30, 8, 0.9);
    // ---- TROPHY ROOM (x -2..10, z 11..20): the cage, gore bags, the King's loot table ----
    const CG = [-1.6, 15.8, 1.6, 19.6];
    for (let x = CG[0]; x <= CG[2] + 1e-3; x += 0.2)
      b.rod("iron", [x, UY, CG[1]], [x, UY + 2.4, CG[1]], 0.012, 3);
    for (let z = CG[1]; z <= CG[3] + 1e-3; z += 0.2) {
      if (z > 16.9 && z < 17.9) continue;
      b.rod("iron", [CG[2], UY, z], [CG[2], UY + 2.4, z], 0.012, 3);
    }
    for (const [a, c] of [
      [
        [CG[0], CG[1]],
        [CG[2], CG[1]],
      ],
      [
        [CG[2], CG[1]],
        [CG[2], CG[3]],
      ],
    ]) {
      b.rod("iron", [a[0], UY + 2.4, a[1]], [c[0], UY + 2.4, c[1]], 0.03, 4);
      b.rod("iron", [a[0], UY + 1.2, a[1]], [c[0], UY + 1.2, c[1]], 0.02, 4);
    }
    b.box("iron", CG[0], UY + 2.4, CG[1], CG[2], UY + 2.43, CG[3], {
      seg: false,
    });
    S.col(CG[0], UY, CG[1] - 0.05, CG[2], UY + 2.4, CG[1] + 0.05, {
      walkable: false,
    });
    S.col(CG[2] - 0.05, UY, CG[1], CG[2] + 0.05, UY + 2.4, 16.9, {
      walkable: false,
    });
    S.col(CG[2] - 0.05, UY, 17.9, CG[2] + 0.05, UY + 2.4, CG[3], {
      walkable: false,
    });
    b.box("iron", CG[2] + 0.1, UY, 16.9, CG[2] + 0.15, UY + 2.3, 17.9, {
      seg: false,
      ry: 0.9,
    }); // cage door swung open
    S.prop("skeleton", -0.6, UY, 18.4, 0.4, { pose: "curled" });
    b.cyl("rust", 0.8, UY, 19.0, 0.18, 0.15, 0.3, 8, { open: true });
    S.pickup("m3_note_pen2", 1, -0.2, UY + 0.02, 17.3);
    // gore bags hanging from the beams
    for (const [x, z] of [
      [3.2, 13.2],
      [4.6, 17.4],
      [6.6, 14.6],
      [2.4, 18.8],
    ]) {
      b.rod("iron", [x, UY + UH - 0.3, z], [x, UY + 2.3, z], 0.01, 3);
      b.sphere("leather", x, UY + 1.75, z, 0.32, { sy: 1.6, c: 0x5a1a14 });
      b.sphere("meat", x + 0.1, UY + 1.3, z, 0.12, { sy: 1.4 });
    }
    // the King's loot table: silks, a trophy saddle, racing hats, a jockey head on a spike
    b.box("wood_dark", 5.0, UY + 0.78, 12.2, 7.6, UY + 0.84, 13.2, {
      seg: false,
    });
    for (const [x, z] of [
      [5.1, 12.3],
      [7.5, 12.3],
      [5.1, 13.1],
      [7.5, 13.1],
    ])
      b.box(
        "wood_dark",
        x - 0.04,
        UY,
        z - 0.04,
        x + 0.04,
        UY + 0.78,
        z + 0.04,
        { seg: false },
      );
    S.col(5.0, UY, 12.2, 7.6, UY + 0.84, 13.2, { walkable: false });
    b.box("leather", 5.3, UY + 0.84, 12.4, 6.2, UY + 1.1, 13.0, {
      seg: false,
      rz: 0.1,
    });
    for (let k = 0; k < 24; k++)
      b.cyl(
        "chrome",
        6.3 + r() * 0.9,
        UY + 0.84 + (k % 5) * 0.012,
        12.4 + r() * 0.6,
        0.012,
        0.012,
        0.01,
        6,
        { noAO: true },
      );
    b.cyl("rust", 7.35, UY + 0.84, 12.7, 0.02, 0.02, 0.6, 4);
    b.sphere("jockey_face", 7.35, UY + 1.5, 12.7, 0.07);
    S.pickup("m3_jockey_cap", 1, 6.6, UY + 0.86, 12.9);
    S.prop("barrel", 6.8, UY, 17.2, 0, { burning: true });
    S.light(6.8, UY + 1.8, 17.2, 0xff8a30, 9, 1.0);
    S.prop("sandbags", 7.0, UY, 11.9, HP, { low: true });
    D.chandelier(S, 3.5, UY + UH - 0.9, 15.8, 0.7, { tiers: 2, dark: true });
    for (let k = 0; k < 18; k++)
      b.cyl(
        r() < 0.5 ? "glass_dark" : "glass",
        -9 + r() * 18,
        UY,
        3 + r() * 14,
        0.035,
        0.04,
        0.26,
        6,
        { rz: r() < 0.6 ? HP : 0 },
      );
    D.papers(b, 3, UY, 15, 4, 20);
    const gk = P.texMat(
      "club52_g3",
      P.signTex("club52_g3", ["WELCHERS", "END UP HERE"], "raider", 512, 256),
      { transparent: true },
    );
    b.quad(gk, -1.86, UY + 2.5, 18.0, 2.4, 1.2, { ry: HP });
    S.anchor("court", -4, UY, 11, -HP);
    S.anchor("boss", -7.3, UY + 0.45, 11, -HP);
    S.anchor("spawn5", 4.5, UY, 15.0, 0);
    S.anchor("spawn7", 2.0, UY, 7.0, 0);
    S.anchor("dorm", 3, UY, 7, 0);
    S.anchor("trophy", 4, UY, 15, 0);
    S.anchor("loot5", -9.3, UY + 1.35, 9.2, 0);

    // =================== UPSTAIRS: the Remington Room (x -4..10, z -8..2) ===================
    S.floor("carpet_red", -4, -8, 10, 2, UY, { surface: "carpet" });
    S.ceil("plaster_cream", -4, -8, 10, 2, UY + UH);
    S.wallX("wood_oak", -8, -4.15, 10.15, UY, UY + UH, 0.3, []);
    S.wallZ("wood_oak", 10, -8, 2, UY, UY + UH, 0.3, []);
    // cowboy bronzes on plinths
    for (const [x, z, ry] of [
      [1, -6.6, 0.3],
      [6.5, -6.6, -0.4],
    ]) {
      b.box("marble_dark", x - 0.6, UY, z - 0.4, x + 0.6, UY + 1.0, z + 0.4, {
        seg: false,
      });
      S.col(x - 0.6, UY, z - 0.4, x + 0.6, UY + 1.0, z + 0.4, {
        walkable: false,
      });
      D.horse(b, "bronze", x, UY + 1.0, z, ry + HP, 0.42, { rear: true });
      D.figure(
        b,
        "bronze",
        x + Math.cos(ry) * 0.05,
        UY + 1.0 + 0.62,
        z,
        ry + HP,
        0.42,
        "rider",
        { hat: "bronze" },
      );
    }
    // paintings (western scenes stand-ins)
    D.painting(b, 9.83, UY + 2.1, -4.5, 1.8, 1.2, -HP, 3);
    D.painting(b, 9.83, UY + 2.1, -0.5, 1.6, 1.1, -HP, 5);
    // the King's desk, terminal, safe, bookcase
    S.prop("desk", 5, UY, -1, PI, { loot: "desk", name: "The King's Desk" });
    S.prop("terminal", 5, UY + 0.78, -0.8, PI, {
      terminalId: "m3_club52_ledger",
      mount: "bare",
    });
    S.prop("safe", 9.3, UY, -7.3, -HP * 0.5, {
      locked: 0,
      lock: P.LOCKS.king_safe,
      name: "The King's Safe",
      items: [
        ["scrip", 180],
        ["m3_photo_finish", 1],
        ["m3_jockey_cap", 1],
        ["rush", 2],
      ],
    });
    D.bookcase(b, -3.7, UY, -4, HP, { w: 1.8 });
    D.sofa(b, 2, UY, 0.9, PI, { fabric: "leather", w: 2.2 });
    D.rug(b, 0, -5, 8, -1.5, UY + 0.005, "carpet_red");
    D.sconce(S, 9.83, UY + 2.3, -2.5, -HP, { r: 6, i: 0.8 });
    D.sconce(S, -3.83, UY + 2.3, -6.5, HP, { r: 6, i: 0.7 });
    S.light(3, UY + 3, -3.5, 0xffc890, 9, 0.55);
    S.anchor("remington", 3, UY, -3, 0);
    S.anchor("spawn6", 3.5, UY, -4.8, 0);
    S.anchor("loot6", 9.3, UY, -7.3, 0);

    S.build({ interior: true });
    P.addInterior("club_52", S.root);

    // ---- the two-ton door (separate leaf so it can swing) ----
    // hinge at the south jamb (z -7.0), leaf spans z -9.2..-7.0 in the x=10 wall plane (x 9.75..10.25)
    const leaf = new THREE.Group();
    leaf.name = "m3_club52_leaf";
    leaf.position.set(S.ox + 10, S.oy + BY, S.oz - 7.0);
    {
      const lb = new P.Batch("club52_leaf", {
        lit: true,
        ambient: 0x5a5048,
        ambI: 0.34,
        grime: 0.55,
      });
      // same baked light as the wall around it (the old leaf had its own lamps and glowed like a texture bug)
      for (const l of S.b.lights)
        lb.lights.push({
          p: l.p.clone().sub(leaf.position),
          c: l.c,
          r: l.r,
          i: l.i,
        });
      lb.box("brick_red", -0.24, 0, -2.2, 0.24, 2.5, 0, { grime: 0.55 });
      lb.box("steel", 0.24, 0.1, -2.1, 0.3, 2.4, -0.1, { seg: false }); // steel back plate (seen once open)
      for (const y of [0.4, 1.25, 2.1])
        lb.box("iron", 0.3, y, -0.5, 0.34, y + 0.12, -0.02, { seg: false });
      lb.box("paint_black", -0.245, 1.18, -1.12, -0.24, 1.2, -1.08, {
        seg: false,
      });
      lb.build(leaf);
    }
    S.root.add(leaf);
    const leafCol = S.col(9.75, BY, -9.2, 10.25, BY + 2.5, -7.0, {
      walkable: false,
    });
    P.club52 = { leaf, leafCol, open: false, anim: 0, lockers: lk };
    return S;
  }

  // ===================================================================
  // Doors & registration (called from 10_club52.js via P.finishSite)
  // ===================================================================
  P.interiorBuilders.club_52 = function (EX) {
    const E = EX.S;
    const I = buildInterior();
    const O = P.I("club_52");
    E.door(
      EX.DOOR_X,
      1.5,
      EX.FZ + 0.25,
      '"52" Club',
      { x: O.x, y: O.y, z: O.z + 23.3, yaw: 0 },
      {
        radius: 1.6,
        onEnter: () => P.safe("disc", () => G.discover("club_52")),
      },
    );
    const ea = E.anchors.exterior_entrance,
      ha = E.anchors.cellar_hatch;
    I.door(
      0,
      1.4,
      24.65,
      EX.street || "42nd Street",
      { x: ea.x, y: 0, z: ea.z + 0.1, yaw: PI },
      { verb: "Exit", radius: 1.5 },
    );
    // No. 19's sidewalk hatch: barred from below until you come up that way
    const hatch = P.barDoor(
      E.door(
        EX.HATCH_X,
        0.6,
        EX.FZ + 1.2,
        "Cellar Hatch",
        { x: O.x + 27.4, y: O.y, z: O.z + 3.2, yaw: 0 },
        { id: "m3_club52_hatch", radius: 1.3, verb: "Open" },
      ),
      {
        lockText: "Bolted from below",
        message: "The steel doors are bolted from below.",
        unbarMessage:
          "You shove back the bolts and heave the hatch doors open.",
      },
    );
    I.door(
      27.4,
      1.9,
      4.0,
      "Sidewalk Hatch",
      { x: ha.x, y: 0, z: ha.z, yaw: PI },
      { verb: "Climb Out", radius: 1.3, onEnter: () => hatch.unbar() },
    );
    P.club52Doors = { hatch };
    P.register("club_52", {
      root: E.root,
      interiorRoot: I.root,
      interiorKey: "club_52",
      anchors: Object.assign({}, E.anchors, I.anchors),
      doors: { hatch },
    });
  };
})();
