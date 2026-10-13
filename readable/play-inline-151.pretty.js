/* src/poi_uptown/10_amnh_interior.js */
/* =====================================================================
 * NEW RAD CITY — POI UPTOWN · 10 American Museum of Natural History — interior
 *
 * INTERIOR (cell 'amnh', origin 5000,0,0):
 *   Roosevelt Rotunda (Barosaurus vs Allosaurus) → Akeley Hall of African
 *   Mammals (elephant herd, lit dioramas behind cracked glass, balcony) →
 *   upper corridor → Hall of Dinosaurs (T. rex, Triceratops, Apatosaurus,
 *   the "ripjaw fossil", matriarch's lair in the collapsed east end) →
 *   rubble slope down into Collections Storage → Hall of Ocean Life (blue
 *   whale over a flooded, irradiated floor) → Rose Center: Hayden sphere
 *   with the Space Theater and its working star projector → barred exit
 *   to 81st Street (loop back outside).
 * EXTERIOR: see 10_amnh.js (its builder calls P.interiorBuilders.amnh below).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._pu) return;
  const P = G._pu,
    D = P.dress;
  const PI = P.PI,
    HP = P.HP,
    TAU = P.TAU;

  // ---------------------------------------------------------------
  // Textures owned by this POI
  // ---------------------------------------------------------------
  function backdropTex(kind) {
    return P.canvasTex("pu_dio_" + kind, 1024, 256, (ctx, w, h) => {
      const r = P.rng("dio" + kind);
      const sky = {
        savanna: ["#b8c8d0", "#f0d8a0"],
        jungle: ["#8aa8a0", "#b8c8a0"],
        desert: ["#c8b8a0", "#f0c890"],
        ocean: ["#1a4a6a", "#0a2030"],
        mountain: ["#a8b8c8", "#e0d8c8"],
      }[kind];
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, sky[0]);
      g.addColorStop(1, sky[1]);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      if (kind === "ocean") {
        for (let i = 0; i < 30; i++) {
          ctx.fillStyle = "rgba(160,210,230," + r() * 0.12 + ")";
          ctx.beginPath();
          ctx.moveTo(r() * w, 0);
          ctx.lineTo(r() * w + 80, h);
          ctx.lineTo(r() * w + 40, h);
          ctx.fill();
        }
        for (let i = 0; i < 40; i++) {
          ctx.fillStyle = "rgba(20,40,50,0.5)";
          ctx.beginPath();
          ctx.ellipse(
            r() * w,
            h * 0.3 + r() * h * 0.6,
            8 + r() * 14,
            3 + r() * 4,
            0,
            0,
            TAU,
          );
          ctx.fill();
        }
        return;
      }
      // distant hills / mountains
      ctx.fillStyle =
        kind === "mountain"
          ? "#6a7a8a"
          : kind === "jungle"
            ? "#4a6a4a"
            : "#9a8a6a";
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 16)
        ctx.lineTo(
          x,
          h * (kind === "mountain" ? 0.3 : 0.55) +
            Math.sin(x / 90) * 18 +
            Math.sin(x / 31) * 8 +
            (kind === "mountain" ? -Math.abs(Math.sin(x / 200)) * 50 : 0),
        );
      ctx.lineTo(w, h);
      ctx.fill();
      ctx.fillStyle =
        kind === "jungle"
          ? "#2a4a2a"
          : kind === "desert"
            ? "#c8a060"
            : "#b89a58";
      ctx.fillRect(0, h * 0.72, w, h * 0.28);
      if (kind === "savanna" || kind === "desert")
        for (let i = 0; i < 9; i++) {
          const x = r() * w,
            y = h * (0.6 + r() * 0.12),
            s = 0.6 + r() * 0.8;
          ctx.fillStyle = "#3a3020";
          ctx.fillRect(x, y - 30 * s, 3 * s, 30 * s);
          ctx.beginPath();
          ctx.ellipse(x + 1, y - 32 * s, 34 * s, 8 * s, 0, 0, TAU);
          ctx.fill();
        }
      if (kind === "jungle")
        for (let i = 0; i < 70; i++) {
          ctx.fillStyle =
            "rgba(" +
            ((30 + r() * 30) | 0) +
            "," +
            ((60 + r() * 50) | 0) +
            "," +
            ((30 + r() * 20) | 0) +
            ",0.9)";
          ctx.beginPath();
          ctx.arc(r() * w, h * (0.2 + r() * 0.6), 12 + r() * 30, 0, TAU);
          ctx.fill();
        }
      // herds on the horizon
      for (let i = 0; i < 20; i++) {
        ctx.fillStyle = "rgba(40,30,20,0.6)";
        ctx.fillRect(r() * w, h * (0.62 + r() * 0.06), 4, 3);
      }
      P.blotches(ctx, w, h, r, 14, 0.2);
    });
  }
  function muralTex() {
    return P.canvasTex("pu_amnh_mural", 1024, 512, (ctx, w, h) => {
      const r = P.rng("mural");
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#c8b890");
      g.addColorStop(1, "#8a7650");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      // map lines
      ctx.strokeStyle = "rgba(90,70,40,0.5)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.moveTo(0, (h * i) / 8);
        ctx.bezierCurveTo(
          w * 0.3,
          (h * i) / 8 + 30,
          w * 0.7,
          (h * i) / 8 - 30,
          w,
          (h * i) / 8,
        );
        ctx.stroke();
      }
      // steamship
      ctx.fillStyle = "#4a3a24";
      ctx.fillRect(w * 0.08, h * 0.62, w * 0.3, h * 0.08);
      ctx.fillRect(w * 0.16, h * 0.46, w * 0.04, h * 0.16);
      ctx.fillRect(w * 0.26, h * 0.46, w * 0.04, h * 0.16);
      // explorers with rifles & pack animals
      for (let i = 0; i < 6; i++) {
        const x = w * (0.46 + i * 0.07),
          y = h * 0.74;
        ctx.fillStyle = "#3a2c18";
        ctx.fillRect(x, y - 70, 14, 70);
        ctx.beginPath();
        ctx.arc(x + 7, y - 80, 11, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "#c8b890";
        ctx.fillRect(x - 6, y - 92, 26, 5);
      }
      ctx.fillStyle = "#5a4428";
      ctx.beginPath();
      ctx.ellipse(w * 0.88, h * 0.7, 60, 30, 0, 0, TAU);
      ctx.fill();
      ctx.fillRect(w * 0.84, h * 0.7, 8, 50);
      ctx.fillRect(w * 0.92, h * 0.7, 8, 50);
      // sunburst
      ctx.strokeStyle = "rgba(240,220,160,0.5)";
      ctx.lineWidth = 4;
      for (let k = 0; k < 18; k++) {
        const a = PI + (k / 17) * PI;
        ctx.beginPath();
        ctx.moveTo(w * 0.5, h * 0.3);
        ctx.lineTo(w * 0.5 + Math.cos(a) * 400, h * 0.3 + Math.sin(a) * 400);
        ctx.stroke();
      }
      P.blotches(ctx, w, h, r, 60, 0.3);
      P.speckle(ctx, w, h, r, 2000);
      // water damage run
      for (let i = 0; i < 5; i++) {
        const x = r() * w;
        const gg = ctx.createLinearGradient(0, 0, 0, h);
        gg.addColorStop(0, "rgba(40,30,10,0.5)");
        gg.addColorStop(1, "rgba(40,30,10,0)");
        ctx.fillStyle = gg;
        ctx.fillRect(x, 0, 20 + r() * 50, h);
      }
    });
  }
  // ===================================================================
  // INTERIOR
  // ===================================================================
  function diorama(S, cx, y0, cz, ry, w, dd, h, kind, fill, o) {
    o = o || {};
    const b = S.b;
    const M = P.m4(cx, y0, cz, ry);
    const L = (lx, ly, lz) => new THREE.Vector3(lx, ly, lz).applyMatrix4(M);
    // shell: floor, ceiling, side walls (recess extends to local -z)
    b.geo(
      "concrete_dark",
      new THREE.BoxGeometry(w, 0.2, dd).translate(0, -0.1, -dd / 2),
      M,
      { grime: 0.2 },
    );
    b.geo(
      "plaster",
      new THREE.BoxGeometry(w, 0.2, dd).translate(0, h + 0.1, -dd / 2),
      M,
      { noAO: true },
    );
    for (const s of [-1, 1])
      b.geo(
        "plaster",
        new THREE.BoxGeometry(0.2, h, dd).translate(
          s * (w / 2 + 0.1),
          h / 2,
          -dd / 2,
        ),
        M,
        {},
      );
    b.geo(
      "plaster",
      new THREE.BoxGeometry(w + 0.4, h, 0.2).translate(0, h / 2, -dd - 0.1),
      M,
      {},
    );
    // curved painted cyclorama
    const k = P.texMat("dio_" + kind, backdropTex(kind), { rough: 1 });
    const R = w * 0.62;
    const cyc = new THREE.CylinderGeometry(R, R, h, 16, 1, true, PI - 0.9, 1.8);
    b.geo(k, P.flipGeo(cyc).translate(0, h / 2, -dd + R * 0.97 - 0.05), M, {
      uv: "keep",
      noAO: true,
      grime: 0.05,
    });
    // ground: sculpted terrain lumps
    const gk =
      kind === "jungle" ? "foliage" : kind === "ocean" ? "rubble" : "dirt";
    b.geo(
      gk,
      new THREE.BoxGeometry(w, 0.3, dd).translate(0, 0.15, -dd / 2),
      M,
      { grime: 0.2 },
    );
    const rn = P.rng(cx * 3 + cz);
    for (let i = 0; i < 6; i++) {
      const p = L((rn() - 0.5) * w * 0.9, 0.2, -dd * (0.3 + rn() * 0.6));
      b.rock(
        kind === "jungle" ? "foliage" : "rubble",
        p.x,
        p.y,
        p.z,
        0.25 + rn() * 0.35,
        { flat: 0.5 },
      );
    }
    if (kind === "jungle")
      for (let i = 0; i < 5; i++) {
        const p = L((rn() - 0.5) * w * 0.9, 0.3, -dd * (0.5 + rn() * 0.45));
        b.rod(
          "wood_rotten",
          [p.x, p.y, p.z],
          [p.x + (rn() - 0.5), p.y + h * 0.8, p.z],
          0.12,
          5,
        );
        b.sphere("foliage", p.x, p.y + h * 0.75, p.z, 0.9, { sy: 0.6 });
      }
    // animals
    if (fill) fill(L, ry + 0, (lx, lz) => L(lx, 0.3, lz));
    // warm diorama light
    const lp = L(0, h - 0.4, -dd * 0.35);
    if (!o.dark) {
      S.light(
        lp.x,
        lp.y,
        lp.z,
        o.color || 0xffd8a0,
        Math.max(w, dd) * 1.3,
        o.li || 2.0,
      );
      const fp = L(0, h * 0.4, 1.2);
      S.light(fp.x, fp.y, fp.z, o.color || 0xffd8a0, 7.5, 0.6);
    }
    // glass front
    if (!o.open) {
      b.geo(
        "glass",
        new THREE.PlaneGeometry(w, h),
        M.clone().multiply(P.m4(0, h / 2, 0.02)),
        { uv: "box", noAO: true, grime: 0.4 },
      );
      if (o.cracked) {
        const ck = P.texMat("crack", crackTex(), {
          transparent: true,
          rough: 0.2,
        });
        b.geo(
          ck,
          new THREE.PlaneGeometry(w * 0.7, h * 0.8),
          M.clone().multiply(P.m4(o.cracked * w * 0.2, h * 0.5, 0.04)),
          { uv: "keep", noAO: true },
        );
      }
    }
    // bronze label rail
    b.geo(
      "bronze",
      new THREE.BoxGeometry(w, 0.08, 0.3).translate(0, -0.35, 0.15),
      M,
      { noAO: true },
    );
    if (o.label)
      D.label(
        b,
        "dio_" + kind + "_" + Math.round(cx) + "_" + Math.round(cz),
        o.label,
        L(0, -0.55, 0.32).x,
        L(0, -0.55, 0.32).y,
        L(0, -0.55, 0.32).z,
        1.2,
        0.36,
        ry,
        "label",
      );
  }
  function crackTex() {
    return P.canvasTex(
      "pu_crack",
      512,
      512,
      (ctx, w, h) => {
        const r = P.rng("crack");
        ctx.clearRect(0, 0, w, h);
        ctx.strokeStyle = "rgba(230,240,240,0.85)";
        ctx.lineWidth = 2;
        const cx = w * 0.5,
          cy = h * 0.45;
        for (let i = 0; i < 16; i++) {
          let x = cx,
            y = cy;
          const a = (i / 16) * TAU + r() * 0.3;
          ctx.beginPath();
          ctx.moveTo(x, y);
          for (let k = 0; k < 7; k++) {
            x += Math.cos(a + (r() - 0.5) * 0.6) * (20 + r() * 30);
            y += Math.sin(a + (r() - 0.5) * 0.6) * (20 + r() * 30);
            ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        for (const rr of [30, 70, 120]) {
          ctx.beginPath();
          for (let k = 0; k <= 16; k++) {
            const a = (k / 16) * TAU;
            const q = rr * (0.8 + r() * 0.4);
            ctx.lineTo(cx + Math.cos(a) * q, cy + Math.sin(a) * q);
          }
          ctx.stroke();
        }
      },
      { clamp: true },
    );
  }

  // every walkable interior floor must sit above the cell's terrain (y 0): the museum is lifted 5 m
  const FLOOR_Y = 5;
  function buildInterior() {
    const O = P.I("amnh");
    const S = P.site("amnh_int", {
      ox: O.x,
      oy: O.y + FLOOR_Y,
      oz: O.z,
      lit: true,
      ambient: 0x66707a,
      ambI: 0.3,
      interiorKey: "amnh",
    });
    const b = S.b;

    // =============== Vestibule ===============
    S.room({
      x0: -5,
      z0: 38,
      x1: 5,
      z1: 46,
      y: 0,
      h: 7,
      wall: "marble",
      floor: "marble",
      ceil: "plaster_cream",
      skip: "n",
      trim: "bronze",
    });
    b.box("bronze", -1.6, 0, 45.7, 1.6, 5.2, 45.85, { seg: false }); // inner face of the great doors
    for (const x of [-0.8, 0.8]) {
      b.box("bronze", x - 0.04, 0.95, 45.55, x + 0.04, 1.1, 45.7, {
        seg: false,
      });
      b.box("bronze", x - 0.5, 1.0, 45.5, x + 0.5, 1.06, 45.56, { seg: false });
    } // push bars
    D.exitDoor(S, 0, 0, 45.68, PI, {
      noLeaves: true,
      frame: "bronze",
      w: 3.2,
      h: 5.25,
      text: "EXIT",
      sub: "CENTRAL PARK WEST",
    });
    D.sconce(S, -4.8, 3.2, 42, HP);
    D.sconce(S, 4.8, 3.2, 42, -HP);
    S.prop("skeleton", 3.2, 0, 44.5, 2.4, { pose: "sitting" });
    D.papers(b, 0, 0, 42, 3, 14);

    // =============== Roosevelt Rotunda ===============
    const RY = 16;
    S.floor("marble", -16, 2, 16, 38, 0, { t: 0.3 });
    S.wallX("plaster_cream", 38, -16.15, 16.15, 0, RY, 0.3, [[-3, 3, 0, 5]]);
    S.wallX("plaster_cream", 2, -16.15, 16.15, 0, RY, 0.3, [[-3, 3, 0, 5]]);
    S.wallZ("plaster_cream", -16, 2, 38, 0, RY, 0.3, [[16, 24, 0, 6]]);
    S.wallZ("plaster_cream", 16, 2, 38, 0, RY, 0.3, []);
    // marble dado around the rotunda
    // (split at the doorways: a continuous dado ran straight across the 6 m entrance from the vestibule and the
    // north door to Akeley Hall — a 2.2 m black slab the player spawned facing)
    for (const [x0, z0, x1, z1] of [
      [-15.85, 2.15, -15.75, 16],
      [-15.85, 24, -15.75, 37.85],
      [15.75, 2.15, 15.85, 37.85],
      [-15.85, 2.15, -3, 2.25],
      [3, 2.15, 15.85, 2.25],
      [-15.85, 37.75, -3, 37.85],
      [3, 37.75, 15.85, 37.85],
    ])
      b.box("marble_dark", x0, 0, z0, x1, 2.2, z1, { segLen: 3 });
    // coffered barrel ceiling (spring at RY, rise 7)
    b.inside(
      "plaster_cream",
      new THREE.CylinderGeometry(16, 16, 36, 28, 6, true, HP, PI).rotateX(HP),
      P.m4(0, RY, 20, 0, 0, 0, 1, 0.45, 1),
      { noAO: true },
    );
    for (let k = 1; k < 12; k++) {
      const a = (PI * k) / 12;
      b.box(
        "plaster",
        Math.cos(a) * 15.75 - 0.15,
        RY + Math.sin(a) * 7.08 - 0.15,
        2.2,
        Math.cos(a) * 15.75 + 0.15,
        RY + Math.sin(a) * 7.08 + 0.05,
        37.8,
        { segLen: 3, noAO: true },
      );
    }
    for (let z = 3.6; z < 37; z += 2.25)
      for (let k = 0; k < 12; k++) {
        const a = (PI * (k + 0.5)) / 12;
        b.sphere(
          "gold",
          Math.cos(a) * 15.55,
          RY + Math.sin(a) * 6.98,
          z,
          0.14,
          { ws: 6, hs: 4, noAO: true },
        );
      }
    for (let z = 2.5; z <= 37.5; z += 2.25)
      b.geo(
        "plaster",
        new THREE.TorusGeometry(15.8, 0.16, 4, 24, PI).scale(1, 0.45, 1),
        P.m4(0, RY, z),
        { noAO: true },
      );
    // broken ceiling panel: daylight shaft
    b.box("rubble", -2, 0.45, 11, 3, 0.62, 15, { seg: false });
    D.rubble(S, 1, 0.45, 13, 2.2, { n: 10, slab: true, rebar: true });
    S.light(0, RY + 5, 13, 0xc8d8e8, 22, 0.75);
    // walls: pilasters, entablature, murals, tall arched (boarded) windows
    for (const x of [-16, 16]) {
      const s = x < 0 ? 1 : -1;
      for (let z = 4; z <= 36; z += 8)
        if (!(x < 0 && z === 20))
          b.box(
            "marble_dark",
            x + s * 0.15,
            0,
            z - 0.6,
            x + s * 0.55,
            RY - 1,
            z + 0.6,
            { segLen: 2 },
          );
      b.box("marble_dark", x + s * 0.15, RY - 1.2, 2, x + s * 0.8, RY, 38, {
        seg: false,
      });
      for (const z of [8, 32])
        if (!(x < 0 && z > 14 && z < 26)) {
          const mk = P.texMat("amnh_mural", muralTex(), { rough: 0.9 });
          b.quad(mk, x + s * 0.18, 10.5, z, 7.2, 3.6, {
            ry: s * HP,
            noAO: true,
          });
          b.box(
            "gold",
            x + s * 0.16,
            8.55,
            z - 3.7,
            x + s * 0.26,
            8.7,
            z + 3.7,
            { seg: false },
          );
          b.box(
            "gold",
            x + s * 0.16,
            12.3,
            z - 3.7,
            x + s * 0.26,
            12.45,
            z + 3.7,
            { seg: false },
          );
        }
    }
    D.painting(b, 16 - 0.2, 4.2, 20, 3.2, 1.6, -HP, 2, { frame: "gold" });
    // Barosaurus rearing to defend her young from an Allosaurus
    b.box("granite", -12.5, 0, 11, 12.5, 0.45, 29, { segLen: 3 });
    b.box("bronze", -12.6, 0.4, 10.9, 12.6, 0.47, 29.1, { seg: false });
    S.col(-12.5, 0, 11, 12.5, 0.45, 29, { surface: "concrete" });
    D.label(
      b,
      "baro",
      [
        "BAROSAURUS LENTUS",
        "Late Jurassic · Morrison Formation",
        "A mother rears to defend her young.",
        '"Admission free for veterans & children"',
      ],
      0,
      0.8,
      29.12,
      2.4,
      0.7,
      0,
      "label",
    );
    // mother, rearing: tail east → hips → shoulders → neck soaring west
    D.skeleton(b, {
      pts: [
        [12, 0.9, 20],
        [9, 2.3, 20.2],
        [6, 3.8, 20.2],
        [3.3, 5.2, 20],
        [1.2, 6.9, 20],
        [-0.5, 9.2, 20],
        [-1.8, 11.8, 19.8],
        [-2.8, 14.3, 19.6],
        [-3.1, 16.1, 19.5],
        [-2.3, 16.9, 19.4],
      ],
      n: 72,
      v: 0.38,
      ribs: [0.36, 0.5],
      ribLen: 1.9,
      floor: 0.45,
      taper: (t) =>
        t < 0.3 ? 0.2 + t * 2.7 : t < 0.52 ? 1 : 1 - (t - 0.52) * 1.35,
      legs: [
        {
          t: 0.32,
          femur: 2.9,
          tibia: 2.5,
          meta: 0.7,
          spread: 0.75,
          r: 0.26,
          fwd: 1,
        },
      ],
      arms: [
        {
          t: 0.5,
          upper: 2.3,
          lower: 2.0,
          hand: 0.35,
          spread: 0.8,
          reach: 0.55,
          drop: 0.55,
          raise: 0.25,
          r: 0.2,
          claws: 3,
        },
      ],
      skull: { len: 1.0, h: 0.45, w: 0.45, open: 0.25, teeth: 6, pitch: 0.4 },
      mountT: [0.26, 0.34],
    });
    // juvenile fleeing west
    D.skeleton(b, {
      pts: [
        [4.5, 0.9, 25.5],
        [2.6, 1.7, 25.4],
        [0.8, 2.3, 25.3],
        [-0.8, 2.5, 25.2],
        [-2.2, 3.3, 25.1],
        [-3.2, 4.2, 25],
      ],
      n: 34,
      v: 0.17,
      ribs: [0.35, 0.6],
      ribLen: 0.8,
      floor: 0.45,
      legs: [
        { t: 0.38, femur: 1.2, tibia: 1.05, meta: 0.3, spread: 0.35, r: 0.12 },
        { t: 0.62, femur: 1.1, tibia: 0.95, meta: 0.28, spread: 0.35, r: 0.11 },
      ],
      skull: { len: 0.45, h: 0.22, w: 0.22, teeth: 4 },
    });
    // Allosaurus lunging east at the juvenile
    D.skeleton(b, {
      pts: [
        [-12, 1.2, 14],
        [-10, 2.3, 14.5],
        [-7.8, 3.1, 15.2],
        [-5.8, 3.5, 16.2],
        [-4.2, 4.0, 17.2],
        [-3.2, 4.3, 18],
      ],
      n: 40,
      v: 0.24,
      ribs: [0.46, 0.72],
      ribLen: 1.15,
      floor: 0.45,
      legs: [
        {
          t: 0.45,
          femur: 1.7,
          tibia: 1.55,
          meta: 0.5,
          spread: 0.45,
          r: 0.17,
          pose: [
            [0.35, 0],
            [-0.25, 0.25],
          ],
        },
      ],
      arms: [
        {
          t: 0.84,
          upper: 0.6,
          lower: 0.5,
          hand: 0.28,
          spread: 0.32,
          reach: 1,
          drop: 0.25,
          r: 0.06,
        },
      ],
      skull: {
        len: 1.15,
        h: 0.55,
        w: 0.45,
        open: 0.65,
        teeth: 12,
        pitch: -0.1,
      },
    });
    S.light(-2, 12, 22, 0xffe6c0, 16, 0.8);
    S.light(6, 3, 26, 0xffd8a0, 9, 0.5);
    // info desk, turnstiles, museum map, donation box
    b.box("wood_dark", 7.5, 0, 32.4, 13.5, 1.05, 33.3, { segLen: 2 });
    b.box("marble_dark", 7.4, 1.05, 32.3, 13.6, 1.12, 33.4, { seg: false });
    b.box("bronze", 7.5, 0.1, 33.3, 13.5, 0.2, 33.36, { seg: false });
    S.col(7.4, 0, 32.3, 13.6, 1.12, 33.4, { walkable: false });
    const infoS = P.texMat(
      "amnh_info",
      P.signTex("amnh_info", ["INFORMATION"], "gilt", 512, 96),
      { rough: 0.5 },
    );
    b.quad(infoS, 10.5, 2.9, 32.35, 2.4, 0.45, { ry: PI });
    for (const x of [8, 13])
      b.rod("iron", [x, 1.12, 32.4], [x, 3.2, 32.4], 0.02, 4);
    b.box("iron", 8, 3.12, 32.35, 13, 3.2, 32.45, { seg: false });
    S.prop("terminal", 9.2, 1.12, 32.85, PI, {
      terminalId: "pu_amnh_security",
      mount: "bare",
    });
    S.prop("cash_register", 12.2, 1.12, 32.85, PI, {
      loot: "cash_register",
      name: "Admissions Register",
    });
    for (let x = -7; x <= 7; x += 2.8) {
      if (Math.abs(x) < 1.4) continue;
      b.box("chrome", x - 0.08, 0, 36.8, x + 0.08, 1.0, 37.8, { seg: false });
      b.rod("chrome", [x, 0.95, 37.3], [x + 1.0, 0.95, 37.0], 0.03, 4);
    }
    const mapT = P.texMat("amnh_map", mapTex(), { rough: 0.8 });
    b.quad(mapT, -15.75, 2.4, 33, 3.0, 2.0, { ry: HP });
    b.box("wood_dark", -15.8, 0.9, 31.4, -15.6, 3.5, 34.6, { seg: false });
    b.box("glass", -11.5, 0, 34, -10.5, 1.3, 34.7, { seg: false });
    b.box("bronze", -11.55, 1.3, 33.95, -10.45, 1.36, 34.75, { seg: false });
    S.col(-11.5, 0, 34, -10.5, 1.36, 34.7, { walkable: false });
    S.container("Donation Box", -11, 0.6, 34.35, {
      items: [
        ["scrip", 23],
        ["old_dollars", 3],
      ],
    });
    // lighting: dim pendant globes + a flickering emergency lamp
    for (const [x, z] of [
      [-8, 10],
      [8, 10],
      [-8, 30],
      [8, 30],
    ]) {
      b.rod("iron", [x, 11, z], [x, RY + 4, z], 0.02, 3);
      b.sphere("lamp_dim", x, 10.6, z, 0.45, { ws: 10, hs: 8 });
      S.light(x, 10.2, z, 0xffd8a0, 14, 0.55);
      S.glow(x, 10.6, z, 0xffd8a0, 1.3);
    }
    S.light(0, 3, 36, 0xffd0a0, 10, 0.5);
    // skeleton vignette: a field-trip teacher and a lunchbox by the Barosaurus
    S.prop("skeleton", -6.5, 0.45, 26.2, 0.8, { pose: "lying" });
    S.pickup("lunchbox", 1, -5.9, 0.45, 25.5);
    S.pickup("pu_note_worksheet", 1, -6.1, 0.46, 26.9);
    S.anchor("entrance", 0, 0, 41.5, 0);
    S.anchor("rotunda", 0, 0, 30, 0);
    S.anchor("spawn1", 7, 0, 22, 0);

    // corridor rotunda → ocean balcony
    S.room({
      x0: -3,
      z0: -4,
      x1: 3,
      z1: 2,
      y: 0,
      h: 5,
      wall: "marble",
      floor: "marble",
      ceil: "plaster",
      skip: "ns",
    });
    D.label(
      b,
      "ocean_arrow",
      [
        "HALL OF OCEAN LIFE  →",
        "Milstein Hall · The Great Blue Whale",
        "Please do not feed the exhibits",
      ],
      -2.8,
      2.2,
      -1,
      1.8,
      0.5,
      HP,
      "label",
    );

    // =============== Akeley Hall of African Mammals ===============
    const AX0 = -56,
      AX1 = -16,
      AZ0 = 0,
      AZ1 = 40,
      AH = 15,
      BY = 6;
    S.floor("marble_green", AX0, AZ0, AX1, AZ1, 0);
    S.ceil("plaster_cream", AX0, AZ0, AX1, AZ1, AH);
    // lower dioramas (N & S walls) — recesses behind openings
    const dioN = [
        [-46, "savanna"],
        [-35, "jungle"],
        [-24, "savanna"],
      ],
      dioS = [
        [-46, "desert"],
        [-35, "savanna"],
        [-24, "mountain"],
      ];
    const holes = (list, y0, y1) =>
      list.map((d) => [d[0] - 3.2, d[0] + 3.2, y0, y1]);
    S.wallX(
      "marble_dark",
      AZ0,
      AX0,
      AX1,
      0,
      AH,
      0.4,
      holes(dioN, 0.8, 5.2).concat([[-30, -26, BY, BY + 3.5]]),
    );
    S.wallX(
      "marble_dark",
      AZ1,
      AX0,
      AX1,
      0,
      AH,
      0.4,
      holes(dioS, 0.8, 5.2).concat(holes(dioS, BY + 0.8, BY + 4.8)),
    );
    S.wallZ("marble_dark", AX0, AZ0, AZ1, 0, AH, 0.4, [
      [16.5, 23.5, 0.8, 5.2],
      [16.5, 23.5, BY + 0.8, BY + 4.8],
    ]);
    // (east wall is the rotunda's west wall)
    // balcony ring at BY
    const BD = 4;
    S.floor("marble", AX0, AZ0, AX1, AZ0 + BD, BY, { t: 0.4 });
    S.floor("marble", AX0, AZ1 - BD, AX1, AZ1, BY, { t: 0.4 });
    S.floor("marble", AX0, AZ0 + BD, AX0 + BD, AZ1 - BD, BY, { t: 0.4 });
    S.floor("marble", AX1 - BD, AZ0 + BD, AX1, AZ1 - BD, BY, { t: 0.4 });
    // balcony fronts with bronze railings (gap at the stair head)
    S.rail(
      "bronze",
      [
        [AX0 + BD, AZ0 + BD],
        [AX1 - BD, AZ0 + BD],
      ],
      BY,
      1.0,
      { step: 0.25 },
    );
    S.rail(
      "bronze",
      [
        [AX0 + BD, AZ1 - BD],
        [AX1 - BD, AZ1 - BD],
      ],
      BY,
      1.0,
      { step: 0.25 },
    );
    S.rail(
      "bronze",
      [
        [AX0 + BD, AZ0 + BD],
        [AX0 + BD, AZ1 - BD],
      ],
      BY,
      1.0,
      { step: 0.25 },
    );
    S.rail(
      "bronze",
      [
        [AX1 - BD, AZ0 + BD],
        [AX1 - BD, 21.5],
      ],
      BY,
      1.0,
      { step: 0.25 },
    );
    S.rail(
      "bronze",
      [
        [AX1 - BD, 26],
        [AX1 - BD, AZ1 - BD],
      ],
      BY,
      1.0,
      { step: 0.25 },
    );
    for (const [x0, z0, x1, z1] of [
      [AX0 + BD, AZ0 + BD - 0.5, AX1 - BD, AZ0 + BD],
      [AX0 + BD, AZ1 - BD, AX1 - BD, AZ1 - BD + 0.5],
      [AX0 + BD - 0.5, AZ0 + BD, AX0 + BD, AZ1 - BD],
      [AX1 - BD, AZ0 + BD, AX1 - BD + 0.5, AZ1 - BD],
    ])
      b.box("marble_dark", x0, BY - 0.9, z0, x1, BY - 0.4, z1, { seg: false });
    // columns under the balcony
    for (let x = AX0 + BD; x <= AX1 - BD + 0.1; x += 8)
      for (const z of [AZ0 + BD, AZ1 - BD]) {
        b.cyl("marble_dark", x, 0, z, 0.35, 0.4, BY - 0.4, 12);
        S.col(x - 0.4, 0, z - 0.4, x + 0.4, BY - 0.4, z + 0.4, {
          walkable: false,
        });
      }
    // stair to the east balcony strip
    S.stairs("marble", -21.5, 31, "n", 3, 0, BY, {
      rail: "bronze",
      railSides: [-1],
    });
    // elephant herd on its plinth
    b.box("rubble", -44, 0, 12, -28, 0.7, 28, { segLen: 3 });
    b.box("marble_dark", -44.2, 0, 11.8, -27.8, 0.25, 28.2, { seg: false });
    S.col(-44, 0, 12, -28, 0.7, 28, { surface: "dirt" });
    b.box("grass", -43.6, 0.7, 12.4, -28.4, 0.75, 27.6, {
      segLen: 3,
      grime: 0.6,
    });
    D.elephant(b, -36, 0.75, 22.5, 0.2, 1.05, { raise: true, flare: true });
    D.elephant(b, -39.5, 0.75, 17, 0.9, 0.95);
    D.elephant(b, -31.5, 0.75, 16.5, -0.7, 0.92);
    D.elephant(b, -41, 0.75, 24.5, 2.4, 0.9);
    D.elephant(b, -31, 0.75, 25.5, -2.6, 0.72);
    D.label(
      b,
      "elephants",
      [
        "AFRICAN ELEPHANTS",
        "Loxodonta africana",
        "Collected 1909-1926.",
        "Eight tons of alarmed matriarch.",
      ],
      -36,
      0.5,
      28.35,
      2.0,
      0.6,
      0,
      "label",
    );
    S.light(-36, 11, 20, 0xffe0b0, 21, 1.7);
    for (const [x, z] of [
      [-48, 8],
      [-24, 8],
      [-48, 32],
      [-24, 32],
    ]) {
      b.rod("iron", [x, 11.6, z], [x, AH, z], 0.02, 3);
      b.sphere("lamp_dim", x, 11.3, z, 0.4, { ws: 10, hs: 8 });
      S.light(x, 10.8, z, 0xffd8a0, 13, 0.6);
      S.glow(x, 11.3, z, 0xffd8a0, 1.1);
    }
    S.light(-36, 4, 31, 0xffd8a0, 10, 0.6);
    S.light(-36, 4, 9, 0xffd8a0, 10, 0.5);
    S.glow(-36, 13.5, 20, 0xffe8c8, 1.6);
    b.rod("iron", [-36, 13.4, 20], [-36, AH, 20], 0.03, 4);
    b.cyl("iron", -36, 13.2, 20, 0.3, 0.6, 0.4, 10, { open: true });
    // the dioramas
    diorama(
      S,
      -46,
      0.8,
      AZ0 - 0.2,
      0,
      6.4,
      3.4,
      4.4,
      "savanna",
      (L, ry) => {
        const p = L(0.4, 0.3, -1.6);
        D.animal(b, p.x, p.y, p.z, ry + 0.4, {
          len: 2.0,
          h: 1.0,
          head: "cat",
          mane: "hide_dark",
          key: "hide_tan",
        });
        const q = L(-1.8, 0.3, -2.2);
        D.animal(b, q.x, q.y, q.z, ry - 0.7, {
          len: 1.8,
          h: 0.9,
          head: "cat",
          key: "hide_tan",
          neck: 0.1,
        });
        const z = L(1.9, 0.3, -2.4);
        D.animal(b, z.x, z.y - 0.4, z.z, ry + 1.2, {
          len: 2.0,
          h: 1.2,
          head: "horse",
          key: "hide_zebra",
          neck: 0.1,
        });
      },
      {
        label: [
          "LIONS",
          "Panthera leo · Serengeti Plain",
          "The pride at the kill.",
        ],
        cracked: 0.5,
      },
    );
    diorama(
      S,
      -35,
      0.8,
      AZ0 - 0.2,
      0,
      6.4,
      3.4,
      4.4,
      "jungle",
      (L, ry) => {
        const p = L(-0.8, 0.3, -1.8);
        D.ape(b, p.x, p.y, p.z, ry + 0.3, 1.1);
        const q = L(1.4, 0.3, -2.4);
        D.ape(b, q.x, q.y, q.z, ry - 0.5, 0.85);
      },
      {
        label: [
          "MOUNTAIN GORILLAS",
          "Gorilla beringei · Virunga Volcanoes",
          "Collected by Carl Akeley, 1921.",
        ],
      },
    );
    diorama(
      S,
      -24,
      0.8,
      AZ0 - 0.2,
      0,
      6.4,
      3.4,
      4.4,
      "savanna",
      (L, ry) => {
        for (let i = 0; i < 3; i++) {
          const p = L(-1.8 + i * 1.8, 0.3, -1.5 - (i % 2) * 1.2);
          D.animal(b, p.x, p.y, p.z, ry + 0.6 + i * 0.3, {
            len: 2.0,
            h: 1.25,
            head: "horse",
            key: "hide_zebra",
            neck: 0.3 + i * 0.2,
          });
        }
      },
      {
        label: [
          "PLAINS ZEBRA",
          "Equus quagga · Athi Plains",
          "No two stripes alike. Neither are two bullets.",
        ],
        cracked: -0.4,
      },
    );
    diorama(
      S,
      -46,
      0.8,
      AZ1 + 0.2,
      PI,
      6.4,
      3.4,
      4.4,
      "desert",
      (L, ry) => {
        for (let i = 0; i < 4; i++) {
          const p = L(-2 + i * 1.3, 0.3, -1.4 - (i % 2));
          D.animal(b, p.x, p.y, p.z, ry + i * 0.8, {
            len: 1.5,
            h: 1.0,
            head: "antelope",
            key: "hide_tan",
            horns: true,
            hornL: 2.2,
            neck: 0.4,
          });
        }
      },
      { label: ["GEMSBOK", "Oryx gazella · Kalahari", "At the water hole."] },
    );
    // the smashed "Expedition" diorama — walk in, loot the helmet
    diorama(
      S,
      -35,
      0.8,
      AZ1 + 0.2,
      PI,
      6.4,
      3.4,
      4.4,
      "savanna",
      (L, ry) => {
        const t = L(-1.2, 0.3, -2.2);
        b.cyl("fabric", t.x, t.y, t.z, 0.1, 1.5, 1.8, 4, { ry: ry + 0.78 });
        const c = L(1.2, 0.3, -1.2);
        D.chair(b, c.x, c.y, c.z, ry + 0.4, { wood: "wood", seat: "fabric" });
        const k = L(0.2, 0.3, -2.6);
        b.box(
          "crate",
          k.x - 0.4,
          k.y,
          k.z - 0.3,
          k.x + 0.4,
          k.y + 0.55,
          k.z + 0.3,
          { ry, seg: false },
        );
        const f = L(-0.2, 0.3, -1.0);
        b.cyl("rubble", f.x, f.y, f.z, 0.4, 0.45, 0.12, 8);
        b.rod(
          "wood_rotten",
          [f.x - 0.3, f.y + 0.1, f.z],
          [f.x + 0.3, f.y + 0.2, f.z + 0.1],
          0.04,
          4,
        );
      },
      {
        open: true,
        label: [
          "THE AKELEY EXPEDITION",
          "Camp at Kivu, 1926",
          "Diorama closed for renovation.",
        ],
        li: 1.4,
      },
    );
    S.col(-38.2, 0, AZ1, -31.8, 1.1, AZ1 + 3.4, { surface: "dirt" }); // floor of the smashed case
    S.col(-36.5, 0, AZ1 - 0.9, -33.5, 0.55, AZ1, { surface: "rubble" }); // rubble step
    D.rubble(S, -35, 0, AZ1 - 0.45, 1.3, { n: 7, scale: 0.8 });
    D.shards(b, -35, 0, AZ1 - 1.2, 1.8, 18);
    S.prop("skeleton", -35.6, 0.95, AZ1 + 1.8, 2.4, { pose: "lying" });
    S.pickup("pu_pith_helmet", 1, -34.3, 1.12, AZ1 + 2.3);
    S.pickup("pu_reel_akeley", 1, -36.2, 0.98, AZ1 + 1.4);
    diorama(
      S,
      -24,
      0.8,
      AZ1 + 0.2,
      PI,
      6.4,
      3.4,
      4.4,
      "mountain",
      (L, ry) => {
        for (let i = 0; i < 2; i++) {
          const p = L(-1 + i * 2, 0.3, -1.8);
          D.animal(b, p.x, p.y, p.z, ry + 0.5 - i, {
            len: 1.3,
            h: 0.95,
            head: "antelope",
            key: "hide_dark",
            horns: true,
            hornL: 1.0,
          });
        }
      },
      {
        label: ["MOUNTAIN NYALA", "Tragelaphus buxtoni · Ethiopia", ""],
        cracked: 0.3,
      },
    );
    // upper dioramas (south wall + west wall)
    for (const d of dioS)
      diorama(
        S,
        d[0],
        BY + 0.8,
        AZ1 + 0.2,
        PI,
        6.4,
        3.0,
        4.0,
        d[0] === -35 ? "jungle" : "savanna",
        (L, ry) => {
          const p = L(0, 0.3, -1.5);
          if (d[0] === -35)
            D.animal(b, p.x, p.y, p.z, ry + 0.8, {
              len: 1.8,
              h: 1.2,
              head: "antelope",
              key: "hide_spots",
              neck: 1.0,
            });
          else
            D.animal(b, p.x, p.y, p.z, ry - 0.6, {
              len: 1.8,
              h: 0.8,
              head: "cat",
              key: "hide_spots",
              neck: 0.2,
            });
        },
        {
          label: [
            d[0] === -35 ? "OKAPI" : "LEOPARD",
            d[0] === -35
              ? "Okapia johnstoni · Ituri Forest"
              : "Panthera pardus",
            "",
          ],
          cracked: d[0] === -24 ? 0.2 : 0,
          dark: d[0] === -46,
        },
      );
    diorama(
      S,
      AX0 - 0.2,
      0.8,
      20,
      HP,
      7.0,
      3.4,
      4.4,
      "savanna",
      (L, ry) => {
        for (let i = 0; i < 3; i++) {
          const p = L(-2 + i * 2, 0.3, -1.8);
          D.animal(b, p.x, p.y, p.z, ry + 0.2 * i, {
            len: 2.4,
            h: 1.6,
            head: "antelope",
            key: "hide_tan",
            neck: 0.9,
            horns: i === 1,
          });
        }
      },
      { label: ["GIRAFFE & ELAND", "Serengeti", ""], cracked: 0.6 },
    );
    diorama(
      S,
      AX0 - 0.2,
      BY + 0.8,
      20,
      HP,
      7.0,
      3.0,
      4.0,
      "jungle",
      (L, ry) => {
        const p = L(0, 0.3, -1.6);
        D.animal(b, p.x, p.y, p.z, ry + 0.3, {
          len: 2.4,
          h: 1.3,
          head: "bear",
          key: "hide_dark",
          girth: 1.3,
        });
      },
      { label: ["CAPE BUFFALO", "Syncerus caffer", ""], dark: true },
    );
    // balcony upper wall details: murals / rails / sconces
    for (let x = -50; x <= -22; x += 7) {
      D.sconce(S, x, BY + 5.8, AZ0 + 0.25, 0, { r: 5, i: 0.4, size: 0.35 });
      D.sconce(S, x, BY + 5.8, AZ1 - 0.25, PI, {
        r: 5,
        i: 0.4,
        size: 0.35,
        dark: x === -36,
      });
    }
    // clutter: toppled bench, papers, glass
    b.box("wood_dark", -26, 0, 8, -23, 0.45, 8.6, { ry: 0.3, seg: false });
    D.papers(b, -30, 0, 8, 3, 10);
    D.shards(b, -46, 0, 1.2, 1.4, 10);
    S.prop("first_aid", -55.4, 1.4, 34, HP, { loot: "first_aid" });
    S.anchor("akeley", -36, 0, 33, PI);
    S.anchor("spawn2", -30, 0, 34, 0);
    S.anchor("loot1", -34.3, 1.1, 42.3, 0);

    // upper corridor → Hall of Dinosaurs
    S.room({
      x0: -30,
      z0: -4,
      x1: -26,
      z1: 0,
      y: BY,
      h: 3.5,
      wall: "marble",
      floor: "marble",
      ceil: "plaster",
      skip: "ns",
    });
    D.label(
      b,
      "dino_arrow",
      ["HALL OF DINOSAURS", "Cretaceous & Jurassic", "CAUTION: floor damaged"],
      -29.8,
      BY + 1.8,
      -2,
      1.8,
      0.5,
      HP,
      "label",
    );
    S.light(-28, BY + 3, -2, 0xff4030, 6, 0.6);
    S.glow(-28, BY + 3.2, -1, 0xff4030, 0.4);
    b.box("lamp_red", -28.3, BY + 3.1, -1.1, -27.7, BY + 3.3, -0.9, {
      seg: false,
    });

    b.ground = BY;
    // =============== Hall of Dinosaurs (y 6..18) ===============
    const DX0 = -60,
      DX1 = -12,
      DZ0 = -42,
      DZ1 = -4,
      DY = BY,
      DH = 12;
    // floor with the collapsed hole (x -22..-14, z -30..-22)
    S.floor("parquet", DX0, DZ0, DX1, -30, DY, { t: 0.4, surface: "wood" });
    S.floor("parquet", DX0, -22, DX1, DZ1, DY, { t: 0.4, surface: "wood" });
    S.floor("parquet", DX0, -30, -22, -22, DY, { t: 0.4, surface: "wood" });
    S.floor("parquet", -14, -30, DX1, -22, DY, { t: 0.4, surface: "wood" });
    S.ceil("plaster_cream", DX0, DZ0, DX1, DZ1, DY + DH);
    S.wallX("plaster_green", DZ1, DX0, DX1, DY, DY + DH, 0.4, [
      [-30, -26, 0, 3.5],
    ]);
    S.wallX("plaster_green", DZ0, DX0, DX1, DY, DY + DH, 0.4, []);
    S.wallZ("plaster_green", DX0, DZ0, DZ1, DY, DY + DH, 0.4, []);
    S.wallZ("plaster_green", DX1, DZ0, DZ1, DY, DY + DH, 0.4, []);
    // skylight trusses, one caved in
    for (let x = -56; x <= -16; x += 8)
      b.box(
        "iron",
        x - 0.15,
        DY + DH - 0.8,
        DZ0,
        x + 0.15,
        DY + DH - 0.1,
        DZ1,
        { seg: false },
      );
    for (let x = -54; x <= -18; x += 12) {
      b.box(
        x === -18 ? "glass_broken" : "glass",
        x - 3,
        DY + DH - 0.05,
        -34,
        x + 3,
        DY + DH + 0.02,
        -12,
        { seg: false, noBake: true },
      );
      S.light(x, DY + DH - 1, -23, 0xb8c8d0, 14, 0.5);
    }
    // wall paintings of the Cretaceous, labels, stanchions
    D.painting(b, DX0 + 0.25, DY + 4.2, -23, 5.2, 2.6, HP, 4, {
      frame: "wood_dark",
    });
    D.painting(b, DX1 - 0.25, DY + 4.2, -8, 3.2, 1.8, -HP, 5, {
      frame: "wood_dark",
    });
    // T. rex (tail-down classic 1950s posture) on a plinth
    b.box("granite", -46, DY, -30, -30, DY + 0.5, -18, { segLen: 3 });
    S.col(-46, DY, -30, -30, DY + 0.5, -18);
    D.skeleton(b, {
      pts: [
        [-45, DY + 0.7, -20],
        [-43, DY + 1.8, -21.5],
        [-40.5, DY + 3.0, -23],
        [-38, DY + 3.9, -24],
        [-35.5, DY + 4.5, -24.6],
        [-33.5, DY + 5.2, -24.8],
        [-32.6, DY + 5.8, -24.8],
      ],
      n: 46,
      v: 0.26,
      ribs: [0.52, 0.8],
      ribLen: 1.5,
      floor: DY + 0.5,
      taper: (t) => (t < 0.5 ? 0.25 + t * 1.5 : 1),
      legs: [
        {
          t: 0.55,
          femur: 2.2,
          tibia: 2.0,
          meta: 0.8,
          spread: 0.55,
          r: 0.2,
          pose: [
            [0.15, 0],
            [-0.1, 0.1],
          ],
        },
      ],
      arms: [
        {
          t: 0.86,
          upper: 0.5,
          lower: 0.4,
          hand: 0.15,
          spread: 0.35,
          reach: 0.8,
          drop: 0.3,
          r: 0.05,
          claws: 2,
        },
      ],
      skull: { len: 1.5, h: 0.75, w: 0.65, open: 0.35, teeth: 14 },
      mountT: [0.4, 0.6, 0.8],
    });
    D.label(
      b,
      "trex",
      [
        "TYRANNOSAURUS REX",
        "Hell Creek Formation, Montana",
        "King of the tyrant lizards.",
        "Presented by the Friends of the Museum, 1955",
      ],
      -38,
      DY + 0.8,
      -17.9,
      2.4,
      0.7,
      0,
      "label",
    );
    // Triceratops
    b.box("granite", -56, DY, -16, -46, DY + 0.4, -8, { segLen: 3 });
    S.col(-56, DY, -16, -46, DY + 0.4, -8);
    D.skeleton(b, {
      pts: [
        [-55, DY + 1.0, -12.5],
        [-53, DY + 1.6, -12.2],
        [-51, DY + 2.0, -12],
        [-49, DY + 2.0, -12],
        [-47.6, DY + 1.8, -12],
      ],
      n: 30,
      v: 0.24,
      ribs: [0.3, 0.75],
      ribLen: 1.2,
      floor: DY + 0.4,
      legs: [
        { t: 0.35, femur: 1.0, tibia: 0.9, meta: 0.3, spread: 0.6, r: 0.18 },
        {
          t: 0.78,
          femur: 0.9,
          tibia: 0.8,
          meta: 0.3,
          spread: 0.65,
          r: 0.16,
          fwd: -0.5,
        },
      ],
      skull: {
        len: 1.4,
        h: 0.6,
        w: 0.7,
        open: 0.1,
        teeth: 0,
        pitch: 0.3,
        frill: 1.0,
        horns: [
          { r: 0.08, l: 0.9, x: -0.25, y: 0.45, z: 0.3, rx: -0.9 },
          { r: 0.08, l: 0.9, x: 0.25, y: 0.45, z: 0.3, rx: -0.9 },
          { r: 0.06, l: 0.4, x: 0, y: 0.2, z: 1.2, rx: -0.3 },
        ],
      },
    });
    // Apatosaurus along the north wall
    b.box("granite", -58, DY, -40, -22, DY + 0.4, -34, { segLen: 3 });
    S.col(-58, DY, -40, -22, DY + 0.4, -34);
    D.skeleton(b, {
      pts: [
        [-57, DY + 1.0, -35],
        [-52, DY + 3.0, -36.5],
        [-46, DY + 4.4, -37],
        [-40, DY + 4.6, -37],
        [-35, DY + 5.2, -37],
        [-30, DY + 7.0, -36.5],
        [-26.5, DY + 8.6, -36],
        [-24, DY + 9.2, -35.5],
      ],
      n: 70,
      v: 0.3,
      ribs: [0.36, 0.55],
      ribLen: 1.9,
      floor: DY + 0.4,
      taper: (t) =>
        t < 0.35 ? 0.15 + t * 2.4 : t < 0.58 ? 1 : 1 - (t - 0.58) * 1.6,
      legs: [
        { t: 0.36, femur: 2.2, tibia: 1.9, meta: 0.5, spread: 0.8, r: 0.25 },
        {
          t: 0.56,
          femur: 2.1,
          tibia: 1.8,
          meta: 0.5,
          spread: 0.8,
          r: 0.24,
          fwd: 0.3,
        },
      ],
      skull: { len: 0.7, h: 0.35, w: 0.35, teeth: 6 },
      mountT: [0.4, 0.5, 0.7],
    });
    // THE RIPJAW "FOSSIL" (a old-world replica, supposedly) — the gag exhibit
    b.box("marble_dark", -24, DY, -12, -16, DY + 1.0, -6, { segLen: 2 });
    b.box("gold", -24.1, DY + 0.95, -12.1, -15.9, DY + 1.05, -5.9, {
      seg: false,
    });
    S.col(-24, DY, -12, -16, DY + 1.0, -6, { walkable: false });
    D.skeleton(b, {
      pts: [
        [-23.4, DY + 1.3, -9.5],
        [-22.2, DY + 2.0, -9.3],
        [-21, DY + 2.9, -9.1],
        [-20, DY + 3.9, -9.0],
        [-19.2, DY + 4.5, -9.0],
        [-18.4, DY + 4.6, -9.0],
      ],
      n: 28,
      v: 0.17,
      ribs: [0.42, 0.72],
      ribLen: 0.95,
      floor: DY + 1.0,
      legs: [
        { t: 0.35, femur: 1.4, tibia: 1.3, meta: 0.5, spread: 0.35, r: 0.12 },
      ],
      arms: [
        {
          t: 0.74,
          upper: 1.0,
          lower: 0.9,
          hand: 0.6,
          spread: 0.45,
          reach: 0.7,
          drop: 0.55,
          raise: 0.05,
          r: 0.08,
          claws: 3,
        },
      ],
      skull: {
        len: 0.7,
        h: 0.4,
        w: 0.45,
        open: 0.7,
        teeth: 8,
        horns: [
          { r: 0.07, l: 0.8, x: -0.28, y: 0.4, z: 0.05, rx: -1.3, rz: 0.5 },
          { r: 0.07, l: 0.8, x: 0.28, y: 0.4, z: 0.05, rx: -1.3, rz: -0.5 },
        ],
      },
    });
    D.label(
      b,
      "ripjaw",
      [
        '"RIPJAW" (Unguis mortis)',
        "MUSEUM REPLICA · on loan from the Tonopah Research Station",
        "Artist's impression. No such animal exists.",
        "Any resemblance to living creatures is regrettable.",
      ],
      -20,
      DY + 0.55,
      -5.85,
      2.6,
      0.8,
      0,
      "label",
    );
    // the matriarch's lair in the ruined east end: nest of exhibit bones, torn banners, eggs
    D.rubble(S, -17, DY, -14.5, 2.4, { n: 14, key: "bone_dark", scale: 0.7 });
    b.cyl("fabric", -16.5, DY, -15, 2.2, 2.6, 0.5, 12, {
      open: true,
      grime: 0.8,
    });
    b.cyl("dirt", -16.5, DY, -15, 2.2, 2.2, 0.3, 12);
    S.col(-18.7, DY, -17.2, -14.3, DY + 0.3, -12.8, { surface: "dirt" });
    for (let i = 0; i < 9; i++) {
      const a = i * 0.7;
      b.rod(
        "bone",
        [-16.5 + Math.cos(a) * 1.9, DY + 0.3, -15 + Math.sin(a) * 1.9],
        [
          -16.5 + Math.cos(a) * 2.6,
          DY + 0.9 + (i % 3) * 0.2,
          -15 + Math.sin(a) * 2.6,
        ],
        0.07,
        4,
      );
    }
    S.pickup("pu_ripjaw_egg", 1, -16.2, DY + 0.32, -15.3);
    S.pickup("pu_ripjaw_egg", 1, -16.9, DY + 0.32, -14.6);
    S.prop("skeleton", -20.5, DY, -18.5, 1.3, { pose: "reaching" });
    S.prop("footlocker", -13.2, DY, -19, -HP, {
      loot: "footlocker",
      name: "Scavenger's Footlocker",
      items: [
        ["hunting_rifle", 1],
        ["ammo_308", 14],
        ["rally_tonic", 2],
      ],
    });
    S.light(-16.5, DY + 3, -15, 0xff6a3a, 7, 0.45);
    S.light(-20, DY + 4.5, -7, 0xffe0b0, 7, 0.9);
    S.light(-38, DY + 7, -24, 0xffe0b0, 13, 0.9);
    S.light(-51, DY + 5, -12, 0xffe0b0, 9, 0.7);
    S.light(-40, DY + 6, -37, 0xffe0b0, 12, 0.7);
    // rubble slope down through the collapsed floor into storage (x -22 → -14)
    for (let i = 0; i < 13; i++) {
      const x0 = -22 + i * 0.62,
        top = DY - (i + 1) * (DY / 13);
      S.col(x0, 0, -30, x0 + 0.62, Math.max(0.02, top), -22, {
        surface: "rubble",
      });
      b.box("rubble", x0, 0, -29.6, x0 + 0.62, Math.max(0.05, top), -22.4, {
        seg: false,
        grime: 0.7,
      });
    }
    const rs = P.rng("slope");
    for (let i = 0; i < 40; i++) {
      const t = rs();
      b.rock(
        "rubble",
        -22 + t * 8,
        (1 - t) * DY + 0.1,
        -29.5 + rs() * 7,
        0.2 + rs() * 0.45,
        { flat: 0.6 },
      );
    }
    for (let i = 0; i < 6; i++)
      b.rod(
        "rust",
        [-22 + rs() * 2, DY - 0.2, -30 + rs() * 8],
        [-22 + rs() * 3, DY - 1.5 - rs() * 2, -30 + rs() * 8],
        0.02,
        3,
      );
    b.box("parquet", -22.5, DY - 1.2, -26, -20.5, DY - 0.9, -23, {
      rz: 0.5,
      seg: false,
    });
    S.rail(
      "iron",
      [
        [-22, -30.2],
        [-14, -30.2],
      ],
      DY,
      0.9,
      { r: 0.03 },
    );
    S.anchor("dino_hall", -40, DY, -12, 0);
    S.anchor("boss", -17.5, DY, -12.5, PI);
    S.anchor("spawn5", -38, DY, -10, PI);
    S.anchor("loot2", -16.5, DY + 0.3, -15, 0);

    b.ground = 0;
    // =============== Collections Storage (below, y 0..5.7) ===============
    const CY = 0,
      CH = DY - 0.4;
    S.floor("concrete", DX0, DZ0, DX1, DZ1, CY);
    S.wallX("concrete", DZ1, DX0, DX1, CY, CH, 0.4, []);
    S.wallX("concrete", DZ0, DX0, DX1, CY, CH, 0.4, []);
    S.wallZ("concrete", DX0, DZ0, DZ1, CY, CH, 0.4, []);
    S.wallZ("concrete", DX1, DZ0, DZ1, CY, CH, 0.4, [[-14, -10, 0, 3]]);
    // under-slab ceiling (visual): the DH floor is the slab; add beams
    for (let x = -58; x <= -14; x += 6)
      b.box("concrete_dark", x - 0.25, CH - 0.5, DZ0, x + 0.25, CH, DZ1, {
        seg: false,
      });
    // shelving aisles with specimen jars / drawers
    const jr = P.rng("jars");
    for (let x = -56; x <= -30; x += 4.5)
      for (const [z0, z1] of [
        [-40, -33],
        [-30, -24],
        [-20, -14],
      ]) {
        b.box("steel", x - 0.35, 0, z0, x + 0.35, 2.6, z0 + 0.06, {
          seg: false,
        });
        b.box("steel", x - 0.35, 0, z1 - 0.06, x + 0.35, 2.6, z1, {
          seg: false,
        });
        for (let s = 0; s < 4; s++) {
          const y = 0.2 + s * 0.8;
          b.box("steel", x - 0.4, y, z0, x + 0.4, y + 0.04, z1, { seg: false });
          for (let z = z0 + 0.3; z < z1 - 0.2; z += 0.35 + jr() * 0.3) {
            if (jr() < 0.25) continue;
            if (jr() < 0.5) {
              b.cyl(
                jr() < 0.5 ? "glass" : "glass_dark",
                x + (jr() - 0.5) * 0.4,
                y + 0.04,
                z,
                0.1,
                0.1,
                0.25 + jr() * 0.2,
                8,
              );
            } else
              b.box(
                jr() < 0.5 ? "crate" : "paper",
                x - 0.3,
                y + 0.04,
                z - 0.15,
                x + 0.3,
                y + 0.3,
                z + 0.15,
                { seg: false, ry: (jr() - 0.5) * 0.2 },
              );
          }
        }
        S.col(x - 0.4, 0, z0, x + 0.4, 2.6, z1, { walkable: false });
      }
    // mastodon skeleton crated on a pallet + specimen cabinets
    b.box("wood", -27, 0, -40, -15, 0.25, -34, { seg: false });
    D.skeleton(b, {
      pts: [
        [-26, 1.0, -37],
        [-24, 2.4, -37],
        [-21, 2.9, -37],
        [-18.5, 2.8, -37],
        [-17.2, 2.6, -37],
      ],
      n: 26,
      v: 0.26,
      ribs: [0.35, 0.8],
      ribLen: 1.3,
      floor: 0.25,
      legs: [
        { t: 0.4, femur: 1.2, tibia: 1.1, meta: 0.25, spread: 0.7, r: 0.2 },
        { t: 0.85, femur: 1.2, tibia: 1.1, meta: 0.25, spread: 0.7, r: 0.2 },
      ],
      skull: {
        len: 1.0,
        h: 0.9,
        w: 0.9,
        open: 0.05,
        teeth: 0,
        horns: [
          { r: 0.12, l: 2.2, x: -0.35, y: -0.3, z: 0.8, rx: -2.3 },
          { r: 0.12, l: 2.2, x: 0.35, y: -0.3, z: 0.8, rx: -2.3 },
        ],
      },
    });
    S.col(-27, 0, -40, -15, 3.2, -34, { walkable: false });
    for (let x = -26; x <= -16; x += 2.5) {
      b.box("wood_dark", x - 1, 0, -6, x + 1, 1.9, -4.5, { seg: false });
      for (let k = 0; k < 6; k++)
        b.box(
          "bronze",
          x - 0.9,
          0.2 + k * 0.28,
          -6.02,
          x + 0.9,
          0.25 + k * 0.28,
          -5.98,
          { seg: false },
        );
      S.col(x - 1, 0, -6, x + 1, 1.9, -4.5, { walkable: false });
    }
    // curator's office partition (NW corner)
    b.box("wood", -50, 0, -12.2, -41, 2.6, -12, { seg: false });
    b.box("glass", -50, 1.1, -12.25, -44, 2.4, -12.18, { seg: false });
    S.col(-50, 0, -12.3, -41, 2.6, -11.9, { walkable: false });
    S.prop("desk", -58.8, 0, -8, -HP, {
      loot: "desk",
      name: "Curator Halvorsen's Desk",
    });
    S.prop("terminal", -59.0, 0.78, -8.5, -HP, {
      terminalId: "pu_amnh_collections",
      mount: "bare",
    });
    S.prop("file_cabinet", -59.5, 0, -5.4, -HP, { loot: "file_cabinet" });
    S.pickup("pu_note_halvorsen", 1, -58.7, 0.8, -7.3);
    S.prop("ammo_box", -14.4, 0, -39.4, 0, { loot: "ammo_box" });
    S.prop("crate", -32, 0, -9, 0.3, { kind: "plain", loot: "crate" });
    S.prop("crate", -33.2, 0, -8.2, 0.9, { kind: "plain", loot: "crate" });
    // fluorescent strips (a couple dead)
    for (const [x, z, on] of [
      [-50, -36, 1],
      [-38, -36, 0],
      [-50, -22, 1],
      [-38, -22, 1],
      [-50, -8, 1],
      [-30, -8, 0],
      [-20, -26, 1],
    ]) {
      b.box(
        on ? "lamp" : "glass_dark",
        x - 1.2,
        CH - 0.62,
        z - 0.08,
        x + 1.2,
        CH - 0.55,
        z + 0.08,
        { seg: false },
      );
      if (on) {
        S.light(x, CH - 0.9, z, 0xd8f0e0, 8.5, 0.75);
        S.glow(x, CH - 0.7, z, 0xd8f0e0, 0.7);
      }
    }
    S.anchor("storage", -36, 0, -26, 0);
    S.anchor("spawn3", -34.6, 0, -28, 0);
    S.anchor("loot3", -56, 0.8, -8, 0);
    // passage storage → ocean balcony
    S.room({
      x0: -12,
      z0: -14,
      x1: -6,
      z1: -10,
      y: 0,
      h: 3,
      wall: "concrete",
      floor: "concrete",
      ceil: "concrete",
      skip: "we",
    });
    D.label(
      b,
      "staff",
      [
        "STAFF ONLY",
        "Collections Department",
        "Absolutely no specimens beyond this point",
      ],
      -9,
      2.3,
      -13.75,
      1.6,
      0.45,
      0,
      "label",
    );

    // =============== Hall of Ocean Life ===============
    b.ground = -4.5;
    const OX0 = -6,
      OX1 = 44,
      OZ0 = -48,
      OZ1 = -4,
      OY = -4.5,
      OH = 12,
      OB = 4;
    S.floor("tile", OX0, OZ0, OX1, OZ1, OY);
    S.ceil("plaster", OX0, OZ0, OX1, OZ1, OH);
    S.wallX("plaster_green", OZ1, OX0, OX1, OY, OH, 0.4, [
      [-3, 3, -OY, -OY + 5],
      [4, 12, 0.6, 3.6],
      [26, 34, 0.6, 3.6],
    ]);
    S.wallX("plaster_green", OZ0, OX0, OX1, OY, OH, 0.4, [
      [4, 14, 0.6, 3.6],
      [24, 34, 0.6, 3.6],
    ]);
    S.wallZ("plaster_green", OX0, OZ0, OZ1, OY, OH, 0.4, [
      [-14, -10, -OY, -OY + 3],
    ]);
    S.wallZ("plaster_green", OX1, OZ0, OZ1, OY, OH, 0.4, [
      [-30, -24, -OY, -OY + 4],
    ]);
    // balcony ring at y 0
    S.floor("terrazzo", OX0, OZ1 - OB, OX1, OZ1, 0, { t: 0.4 });
    S.floor("terrazzo", OX0, OZ0, OX1, OZ0 + OB, 0, { t: 0.4 });
    S.floor("terrazzo", OX0, OZ0 + OB, OX0 + OB, OZ1 - OB, 0, { t: 0.4 });
    S.floor("terrazzo", OX1 - OB, OZ0 + OB, OX1, OZ1 - OB, 0, { t: 0.4 });
    S.rail(
      "chrome",
      [
        [OX0 + OB, OZ1 - OB],
        [OX1 - OB, OZ1 - OB],
      ],
      0,
      1.0,
      { step: 0.2 },
    );
    S.rail(
      "chrome",
      [
        [OX0 + OB, OZ0 + OB],
        [16.5, OZ0 + OB],
      ],
      0,
      1.0,
      { step: 0.2 },
    );
    S.rail(
      "chrome",
      [
        [21.5, OZ0 + OB],
        [OX1 - OB, OZ0 + OB],
      ],
      0,
      1.0,
      { step: 0.2 },
    );
    S.rail(
      "chrome",
      [
        [OX0 + OB, OZ0 + OB],
        [OX0 + OB, OZ1 - OB],
      ],
      0,
      1.0,
      { step: 0.2 },
    );
    S.rail(
      "chrome",
      [
        [OX1 - OB, OZ0 + OB],
        [OX1 - OB, OZ1 - OB],
      ],
      0,
      1.0,
      { step: 0.2 },
    );
    for (let x = OX0 + OB; x <= OX1 - OB + 0.1; x += 9)
      for (const z of [OZ0 + OB, OZ1 - OB]) {
        b.cyl("concrete", x, OY, z, 0.35, 0.35, -OY - 0.4, 10);
        S.col(x - 0.36, OY, z - 0.36, x + 0.36, -0.4, z + 0.36, {
          walkable: false,
        });
      }
    // stair down to the flooded floor (north side)
    S.stairs("terrazzo", 19, OZ0 + OB + 5.7, "n", 3, OY, 0, { rail: "chrome" });
    // toxic flood water + rad source
    const wmat = P.mat("water_toxic").clone();
    wmat.color.setHex(0x0a120e);
    wmat.opacity = 0.95;
    wmat.emissive.setHex(0x1f8a2c);
    const water = new THREE.Mesh(
      new THREE.PlaneGeometry(OX1 - OX0 - 0.8, OZ1 - OZ0 - 0.8).rotateX(-HP),
      wmat,
    );
    water.position.set(
      S.ox + (OX0 + OX1) / 2,
      S.oy + OY + 0.55,
      S.oz + (OZ0 + OZ1) / 2,
    );
    water.name = "amnh_flood";
    S.root.add(water);
    P.animate(S.ox + 19, S.oz - 26, 90, (t) => {
      water.material.emissiveIntensity = 0.09 + 0.03 * Math.sin(t * 1.3);
    });
    G.world.addRadSource({
      x: S.ox + 19,
      y: S.oy + OY,
      z: S.oz - 26,
      radius: 20,
      strength: 1.2,
    });
    for (const [x, z] of [
      [8, -30],
      [26, -18],
      [30, -36],
    ])
      S.light(x, OY + 0.8, z, 0x50ff70, 10, 0.45);
    // debris breaking the surface: rubble islands, a drifting bench, a sunken display case, barrels
    const fr = P.rng("flood");
    for (const [x, z, r] of [
      [6, -14, 1.6],
      [31, -40, 1.9],
      [36, -16, 1.2],
      [2, -38, 1.4],
    ]) {
      D.rubble(S, x, OY, z, r, { n: 7, slab: true, scale: 1.1 });
      b.rock("rubble", x, OY + 0.5, z, r * 0.7, { flat: 0.45 });
    }
    b.box("wood_dark", 12.5, OY + 0.5, -20.5, 14.9, OY + 0.72, -19.9, {
      ry: 0.5,
      rz: 0.08,
      seg: false,
    });
    b.box("glass_broken", 25, OY, -31.5, 27.4, OY + 0.9, -30.3, {
      ry: 0.3,
      rz: 0.35,
      seg: false,
    });
    b.box("bronze", 25, OY + 0.85, -31.5, 27.4, OY + 0.95, -30.3, {
      ry: 0.3,
      rz: 0.35,
      seg: false,
    });
    for (let i = 0; i < 6; i++) {
      const x = 2 + fr() * 34,
        z = -44 + fr() * 36;
      b.cyl(
        fr() < 0.5 ? "rust" : "paint_red",
        x,
        OY + 0.3,
        z,
        0.3,
        0.3,
        0.85,
        10,
        { rz: fr() < 0.4 ? HP : 0.15 },
      );
    }
    S.prop("skeleton", 31, OY + 0.9, -40, 0.7, { pose: "lying" });
    // THE BLUE WHALE
    D.whale(b, 19, 6.5, -26, HP, 27);
    for (const dx of [-9, 0, 9])
      b.rod("steel", [19 + dx, 8.2, -26], [19 + dx, OH, -26], 0.03, 3);
    S.light(19, 11, -26, 0x9ab8d0, 24, 1.1);
    S.light(19, 2, -16, 0x70a8c0, 18, 0.7);
    for (const dx of [-10, 0, 10])
      S.light(19 + dx, 1.6, -26, 0x6ab0e8, 11, 1.25); // uplights through the murk onto the belly
    S.light(19, 2, -36, 0x70a8c0, 18, 0.7);
    S.light(2, 3, -26, 0x5a90b0, 12, 0.5);
    S.light(38, 3, -26, 0x5a90b0, 12, 0.5);
    // lower-level dioramas: sperm whale vs giant squid, walrus, dolphins
    diorama(
      S,
      8,
      OY + 0.6,
      OZ1 + 0.2,
      PI,
      7.6,
      3.2,
      3.0,
      "ocean",
      (L, ry) => {
        const p = L(-0.6, 1.3, -1.6);
        b.box(
          "whale",
          p.x - 1.6,
          p.y - 0.6,
          p.z - 0.6,
          p.x + 1.6,
          p.y + 0.6,
          p.z + 0.6,
          { ry, seg: false },
        );
        const q = L(1.8, 1.0, -1.8);
        b.sphere("paint_red", q.x, q.y, q.z, 0.4, { sy: 1.8 });
        for (let k = 0; k < 8; k++)
          b.rod(
            "paint_red",
            [q.x, q.y - 0.6, q.z],
            [
              q.x + Math.cos(k) * 1.4,
              q.y - 0.6 + Math.sin(k * 2) * 0.8,
              q.z + Math.sin(k) * 1.2,
            ],
            0.04,
            4,
          );
      },
      {
        label: [
          "SPERM WHALE & GIANT SQUID",
          "Battle in the abyss, 3,000 feet down",
        ],
        color: 0x6ab8d8,
        li: 1.4,
      },
    );
    diorama(
      S,
      30,
      OY + 0.6,
      OZ1 + 0.2,
      PI,
      7.6,
      3.2,
      3.0,
      "ocean",
      (L, ry) => {
        for (let k = 0; k < 3; k++) {
          const p = L(-2 + k * 2, 1.4 + k * 0.3, -1.4);
          b.sphere("whale", p.x, p.y, p.z, 0.35, {
            sx: 1,
            sy: 0.8,
            sz: 2.4,
            ry: ry + 0.4 * k,
          });
        }
      },
      {
        label: ["BOTTLENOSE DOLPHINS", "Tursiops truncatus"],
        color: 0x6ab8d8,
        cracked: 0.4,
      },
    );
    diorama(
      S,
      9,
      OY + 0.6,
      OZ0 - 0.2,
      0,
      9.6,
      3.2,
      3.0,
      "ocean",
      (L, ry) => {
        for (let k = 0; k < 2; k++) {
          const p = L(-1.5 + k * 3, 0.3, -1.6);
          D.animal(b, p.x, p.y, p.z, ry + 0.5 + k, {
            len: 2.6,
            h: 0.9,
            head: "bear",
            key: "hide_tan",
            girth: 1.6,
            tail: false,
          });
        }
      },
      { label: ["WALRUS", "Odobenus rosmarus · Arctic ice"], color: 0x9ac8e8 },
    );
    diorama(S, 29, OY + 0.6, OZ0 - 0.2, 0, 9.6, 3.2, 3.0, "ocean", null, {
      label: [
        "CORAL REEF",
        "Andros Island, Bahamas",
        "Exhibit drained for maintenance.",
      ],
      dark: true,
    });
    // benches & clutter on the balcony
    for (const x of [6, 32]) {
      b.box("wood_dark", x - 1.2, 0, OZ1 - 2.6, x + 1.2, 0.45, OZ1 - 2.0, {
        seg: false,
      });
    }
    S.prop("skeleton", 34, 0, OZ1 - 1.5, 2.1, { pose: "sitting" });
    S.pickup("pu_note_ocean", 1, 33.4, 0.02, OZ1 - 1.2);
    S.prop("fizzo_machine", OX1 - 0.6, 0, OZ1 - 2.2, -HP, {});
    for (const x of [2, 19, 36]) {
      b.box("lamp_dim", x - 0.6, OH - 0.3, -6.2, x + 0.6, OH - 0.2, -5.8, {
        seg: false,
      });
      S.light(x, OH - 1, -6, 0xffe0b0, 9, 0.45);
    }
    S.anchor("ocean", 19, 0, -6, PI);
    S.anchor("spawn4", 12, OY, -30, 0);
    S.anchor("lurk", 26, OY, -34, 0);

    b.ground = 0;
    // =============== Rose Center: the Hayden sphere ===============
    const RX0 = 48,
      RX1 = 96,
      RZ0 = -52,
      RZ1 = 0,
      RH = 26;
    const C = new THREE.Vector3(72, 12, -26),
      R = 11;
    S.room({
      x0: 44,
      z0: -30,
      x1: 48,
      z1: -24,
      y: 0,
      h: 4,
      wall: "concrete",
      floor: "terrazzo",
      ceil: "concrete",
      skip: "we",
    });
    S.floor("terrazzo", RX0, RZ0, RX1, RZ1, 0);
    S.ceil("glass_night", RX0, RZ0, RX1, RZ1, RH);
    S.wallX("glass_night", RZ1, RX0, RX1, 0, RH, 0.4, []);
    S.wallX("glass_night", RZ0, RX0, RX1, 0, RH, 0.4, []);
    S.wallZ("glass_night", RX0, RZ0, RZ1, 0, RH, 0.4, [[-30, -24, 0, 4]]);
    S.wallZ("glass_night", RX1, RZ0, RZ1, 0, RH, 0.4, [[-10, -6, 0, 3.4]]);
    // steel mullion grid on the glass
    for (let x = RX0; x <= RX1; x += 4)
      for (const z of [RZ0 + 0.25, RZ1 - 0.25])
        b.box("steel", x - 0.08, 0, z - 0.06, x + 0.08, RH, z + 0.06, {
          seg: false,
        });
    for (let z = RZ0; z <= RZ1; z += 4)
      for (const x of [RX0 + 0.25, RX1 - 0.25])
        b.box("steel", x - 0.06, 0, z - 0.08, x + 0.06, RH, z + 0.08, {
          seg: false,
        });
    for (let y = 3; y < RH; y += 3)
      for (const [x0, z0, x1, z1] of [
        [RX0, RZ0 + 0.2, RX1, RZ0 + 0.35],
        [RX0, RZ1 - 0.35, RX1, RZ1 - 0.2],
      ])
        b.box("steel", x0, y - 0.06, z0, x1, y + 0.06, z1, { seg: false });
    // the sphere shell with a doorway (east) — outer white panels + inner star dome
    const shell = new THREE.SphereGeometry(R, 44, 30).toNonIndexed();
    cutDoor(shell, 0, 10 - C.y, 13.2 - C.y, 0.15);
    b.geo("sphere_white", shell, P.m4(C.x, C.y, C.z), { grime: 0.3 });
    for (let k = -4; k <= 4; k++) {
      const y = (k * R) / 5;
      const r2 = Math.sqrt(R * R - y * y) + 0.04;
      if (k === -1) continue;
      b.torus("steel", C.x, C.y + y, C.z, r2, 0.05, TAU, {
        rx: HP,
        ts: 36,
        rs: 3,
      });
    }
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * TAU + 0.3;
      b.rod(
        "steel",
        [C.x + Math.cos(a) * 7.5, 0, C.z + Math.sin(a) * 7.5],
        [C.x + Math.cos(a) * 4, C.y - R * 0.86, C.z + Math.sin(a) * 4],
        0.4,
        10,
      );
      S.col(
        C.x + Math.cos(a) * 6 - 0.7,
        0,
        C.z + Math.sin(a) * 6 - 0.7,
        C.x + Math.cos(a) * 6 + 0.7,
        4,
        C.z + Math.sin(a) * 6 + 0.7,
        { walkable: false },
      );
    }
    S.col(C.x - 7, 0, C.z - 7, C.x + 7, 1.5, C.z + 7, { walkable: false }); // under-sphere keep-out (ring of lamps)
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * TAU;
      const lx = C.x + Math.cos(a) * 8.5,
        lz = C.z + Math.sin(a) * 8.5;
      b.cyl("steel", lx, 0, lz, 0.3, 0.35, 0.4, 8);
      b.cyl("lamp", lx, 0.4, lz, 0.2, 0.25, 0.08, 8);
      S.light(lx, 1.2, lz, 0x9ab8ff, 9, 0.7);
    }
    for (const [x, z] of [
      [52, -4],
      [92, -48],
      [52, -48],
      [92, -2],
    ])
      S.light(x, 14, z, 0x5a70b0, 20, 0.6);
    S.light(72, 25, -26, 0x8aa0d0, 26, 0.5);
    // stairs + bridge to the Space Theater
    S.stairs("terrazzo", 91, -6, "n", 3, 0, 5, { rail: "chrome" });
    S.floor("terrazzo", 89.5, -15.4, 92.5, -12.2, 5, { t: 0.35 });
    S.stairs("terrazzo", 91, -15.4, "n", 3, 5, 10, { rail: "chrome" });
    S.floor("terrazzo", 82.5, -29, 94, -21.6, 10, { t: 0.4 });
    S.rail(
      "chrome",
      [
        [94, -29],
        [94, -21.6],
      ],
      10,
      1.0,
    );
    S.rail(
      "chrome",
      [
        [82.8, -29],
        [94, -29],
      ],
      10,
      1.0,
    );
    S.rail(
      "chrome",
      [
        [82.8, -21.6],
        [89.5, -21.6],
      ],
      10,
      1.0,
    );
    for (const [x, z] of [
      [93.5, -28.5],
      [93.5, -22],
      [89.5, -13],
    ]) {
      b.cyl("steel", x, 0, z, 0.2, 0.2, x > 90 && z < -20 ? 10 : 5, 8);
      S.col(
        x - 0.2,
        0,
        z - 0.2,
        x + 0.2,
        x > 90 && z < -20 ? 9.6 : 4.6,
        z + 0.2,
        { walkable: false },
      );
    }
    // Space Theater inside the sphere (floor y 10)
    b.cyl("carpet", C.x, 9.7, C.z, 10.7, 10.7, 0.3, 40);
    S.col(C.x - 7.5, 9.7, C.z - 7.5, C.x + 7.5, 10, C.z + 7.5, {
      surface: "carpet",
    });
    S.col(C.x - 10.4, 9.7, C.z - 4, C.x + 10.9, 10, C.z + 4, {
      surface: "carpet",
    });
    S.col(C.x - 4, 9.7, C.z - 10.4, C.x + 4, 10, C.z + 10.4, {
      surface: "carpet",
    });
    for (let k = 0; k < 22; k++) {
      const st = 0.17,
        sp = (TAU - 2 * st) / 22,
        a0 = st + k * sp,
        a1 = a0 + sp,
        am = (a0 + a1) / 2;
      const rr = 10.55,
        cx = C.x + Math.cos(am) * rr,
        cz = C.z + Math.sin(am) * rr;
      S.colR(cx, cz, 0.5, rr * sp + 0.3, 10, 16, -am, { walkable: false });
    }
    b.inside(
      "velvet",
      new THREE.CylinderGeometry(10.5, 10.6, 2.0, 40, 1, true),
      P.m4(C.x, 11, C.z),
      { noAO: true, grime: 0.3 },
    );
    // concentric seats facing the projector
    for (const ring of [4.2, 5.8, 7.4, 9.0]) {
      const n = Math.floor((ring * TAU) / 0.62);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU;
        if (Math.abs(Math.atan2(Math.sin(a), Math.cos(a))) < 0.32) continue;
        const px = C.x + Math.cos(a) * ring,
          pz = C.z + Math.sin(a) * ring,
          ry = Math.atan2(-(C.x - px), -(C.z - pz)) + PI;
        const M = P.m4(px, 10, pz, ry);
        b.geo(
          "velvet",
          new THREE.BoxGeometry(0.5, 0.12, 0.5).translate(0, 0.42, 0),
          M,
          { noAO: true, grime: 0.3 },
        );
        b.geo(
          "velvet",
          new THREE.BoxGeometry(0.52, 0.7, 0.1)
            .rotateX(0.6)
            .translate(0, 0.72, 0.25),
          M,
          { noAO: true, grime: 0.3 },
        );
        b.geo(
          "iron",
          new THREE.BoxGeometry(0.06, 0.4, 0.5).translate(0.27, 0.2, 0),
          M,
          { noAO: true },
        );
      }
    }
    // aisle lights
    for (let k = 0; k < 10; k++) {
      const a = (k / 10) * TAU;
      b.box(
        "lamp_red",
        C.x + Math.cos(a) * 10.2 - 0.08,
        10.05,
        C.z + Math.sin(a) * 10.2 - 0.08,
        C.x + Math.cos(a) * 10.2 + 0.08,
        10.12,
        C.z + Math.sin(a) * 10.2 + 0.08,
        { seg: false },
      );
    }
    S.light(C.x, 11.5, C.z, 0x6a80c8, 11, 0.55);
    S.light(C.x + 9, 12, C.z, 0xff3030, 5, 0.4);
    // console + projector pedestal
    b.box("steel", C.x - 0.9, 10, C.z - 0.9, C.x + 0.9, 11.2, C.z + 0.9, {
      seg: false,
    });
    S.col(C.x - 0.95, 10, C.z - 0.95, C.x + 0.95, 11.2, C.z + 0.95, {
      walkable: false,
    });
    b.box("panel", C.x + 2.2, 10, C.z + 2.4, C.x + 3.6, 11.0, C.z + 3.2, {
      seg: false,
    });
    S.prop("terminal", C.x + 2.9, 11.0, C.z + 2.8, PI, {
      terminalId: "pu_amnh_planetarium",
      mount: "bare",
    });
    S.col(C.x + 2.1, 10, C.z + 2.2, C.x + 3.7, 11.0, C.z + 3.4, {
      walkable: false,
    });
    S.anchor("projector", C.x, 11.2, C.z, 0);
    S.anchor("theater", C.x + 6, 10, C.z, HP);
    S.anchor("console", C.x + 2.9, 10, C.z + 4, PI);
    // Scales of the Universe: hanging planets
    const planets = [
      [58, 18, -8, 2.2, "hide_tan"],
      [60, 16, -44, 1.8, "paint_cream"],
      [88, 20, -44, 0.9, "paint_blue"],
      [86, 21, -38, 0.55, "paint_red"],
      [54, 22, -30, 1.2, "paint_green"],
    ];
    for (const [x, y, z, r, k] of planets) {
      b.sphere(k, x, y, z, r, { ws: 16, hs: 12 });
      b.rod("steel", [x, y + r, z], [x, RH, z], 0.02, 3);
    }
    b.torus("paint_cream", 60, 16, -44, 3.2, 0.25, TAU, {
      rx: HP + 0.35,
      sy: 1,
      ts: 32,
      rs: 3,
    });
    // control room (south-east): safe with the operator's stash
    S.room({
      x0: 84,
      z0: -52,
      x1: 96,
      z1: -42,
      y: 0,
      h: 3.2,
      wall: "panel",
      floor: "tile",
      ceil: "panel",
      skip: "nesf",
      holes: { w: [[-46, -44, 0, 2.3]] },
    });
    S.wallX("panel", -42, 84, 96, 0, 3.2, 0.3, [[88, 90, 0, 2.3]]);
    S.prop("safe", 95.4, 0, -50.5, -HP, {
      locked: 0,
      lock: P.LOCKS.star_safe,
      name: "Planetarium Safe",
      items: [
        ["scrip", 120],
        ["pu_star_chart", 1],
        ["rally_tonic", 1],
        ["gemini", 1],
        ["ammo_gyrojet", 16],
      ],
    });
    S.prop("desk", 90, 0, -50.8, 0, { loot: "desk" });
    S.pickup("pu_reel_projectionist", 1, 89.6, 0.79, -50.8);
    b.box("lamp_green", 86, 1.2, -51.9, 88, 2.2, -51.85, { seg: false });
    S.light(90, 2.5, -47, 0xc8e8ff, 7, 0.6);
    // exit door (east wall) + signage
    b.box("steel", 95.6, 0, -10.2, 96.2, 3.6, -5.8, { seg: false });
    const ex = P.texMat(
      "amnh_exit",
      P.signTex("amnh_exit", ["EXIT · 81st STREET"], "neon", 512, 96, {
        fg: "#ff4a3a",
      }),
      { emissive: 1.4 },
    );
    b.quad(ex, 95.55, 3.9, -8, 2.2, 0.4, { ry: -HP });
    S.light(94.5, 3.5, -8, 0xff4030, 5, 0.5);
    S.anchor("rose_center", 80, 0, -8, 0);
    S.anchor("rose_exit", 92.9, 0, -3.5, HP);
    S.anchor("spawn6", 64, 0, -8, 0);

    S.build({ interior: true });
    P.addInterior("amnh", S.root);
    // star dome + projector (animated, own meshes)
    const dome = new THREE.Mesh(
      P.flipGeo(new THREE.SphereGeometry(10.2, 48, 20, 0, TAU, 0, HP * 0.98)),
      new THREE.MeshBasicMaterial({
        map: P.customTex("stars"),
        color: 0x3a4250,
        fog: false,
      }),
    );
    dome.position.set(S.ox + C.x, S.oy + 11.9, S.oz + C.z);
    dome.name = "amnh_star_dome";
    S.root.add(dome);
    const proj = new THREE.Group();
    proj.position.set(S.ox + C.x, S.oy + 11.2, S.oz + C.z);
    proj.name = "amnh_projector";
    {
      const pb = new P.Batch("proj", {});
      pb.cyl("steel", 0, 0, 0, 0.25, 0.4, 1.4, 10);
      pb.rod("steel", [0, 1.6, -1.3], [0, 1.6, 1.3], 0.18, 10);
      for (const s of [-1, 1]) {
        pb.sphere("paint_black", 0, 1.6, s * 1.35, 0.62, { ws: 14, hs: 10 });
        for (let k = 0; k < 10; k++) {
          const a = (k / 10) * TAU;
          pb.cyl(
            "lamp",
            Math.cos(a) * 0.5,
            1.6 + Math.sin(a) * 0.5,
            s * 1.35 + s * 0.28,
            0.07,
            0.07,
            0.12,
            6,
            { rx: HP },
          );
        }
      }
      pb.build(proj);
    }
    S.root.add(proj);
    P.amnhShow = {
      dome,
      proj,
      active: false,
      t: 0,
      powered: true,
      pos: new THREE.Vector3(S.ox + C.x, S.oy + 11, S.oz + C.z),
    };
    return S;
  }
  /** Remove sphere triangles around azimuth 0 (+x) between y0..y1 (relative to centre) within half-angle ha. */
  function cutDoor(geo, az, y0, y1, ha) {
    const p = geo.attributes.position,
      keep = [];
    for (let i = 0; i < p.count; i += 3) {
      const cx = (p.getX(i) + p.getX(i + 1) + p.getX(i + 2)) / 3,
        cy = (p.getY(i) + p.getY(i + 1) + p.getY(i + 2)) / 3,
        cz = (p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2)) / 3;
      const a = Math.atan2(cz, cx);
      if (cy > y0 && cy < y1 && Math.abs(a - az) < ha) continue;
      keep.push(i);
    }
    for (const nm of Object.keys(geo.attributes)) {
      const at = geo.attributes[nm],
        s = at.itemSize,
        arr = new Float32Array(keep.length * 3 * s);
      keep.forEach((i, k) => {
        arr.set(at.array.subarray(i * s, (i + 3) * s), k * 3 * s);
      });
      geo.setAttribute(nm, new THREE.BufferAttribute(arr, s));
    }
    return geo;
  }
  function mapTex() {
    return P.canvasTex("pu_amnh_map", 512, 340, (ctx, w, h) => {
      const r = P.rng("map");
      ctx.fillStyle = "#e0d4b0";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#2a2418";
      ctx.font = "bold 26px " + P.FONTS.DECO;
      ctx.textAlign = "center";
      ctx.fillText("MUSEUM GUIDE · FIRST FLOOR", w / 2, 34);
      const rooms = [
        [40, 60, 140, 120, "#c8a860", "AFRICAN MAMMALS"],
        [190, 60, 120, 150, "#b0b890", "ROOSEVELT ROTUNDA"],
        [330, 60, 140, 90, "#90b0c0", "OCEAN LIFE"],
        [330, 170, 140, 100, "#a0a0c8", "HAYDEN PLANETARIUM"],
        [40, 200, 140, 90, "#c8b0a0", "DINOSAURS (4th Fl.)"],
      ];
      ctx.font = "bold 13px " + P.FONTS.SANS;
      for (const [x, y, rw, rh, c, t] of rooms) {
        ctx.fillStyle = c;
        ctx.fillRect(x, y, rw, rh);
        ctx.strokeStyle = "#3a3020";
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, rw, rh);
        ctx.fillStyle = "#2a2418";
        ctx.fillText(t, x + rw / 2, y + rh / 2);
      }
      ctx.fillStyle = "#b8302a";
      ctx.beginPath();
      ctx.arc(250, 250, 9, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#2a2418";
      ctx.fillText("YOU ARE HERE", 250, 280);
      P.blotches(ctx, w, h, r, 30, 0.3);
      P.speckle(ctx, w, h, r, 800);
    });
  }

  // ===================================================================
  // Street <-> interior doors & registration — called by 10_amnh.js's builder right
  // after buildExterior() (E = its site context).
  // ===================================================================
  P.interiorBuilders.amnh = function (E) {
    const I = buildInterior();
    const O = P.I("amnh");
    // main doors ↔ vestibule
    E.door(
      -144.2,
      2.4 + 1.6,
      -722,
      "American Museum of Natural History",
      { x: O.x, y: O.y + FLOOR_Y, z: O.z + 41.2, yaw: 0 },
      { radius: 1.8, onEnter: () => P.safe("disc", () => G.discover("amnh")) },
    );
    I.door(
      0,
      1.6,
      45.4,
      "Central Park West",
      { x: -140.0, y: 2.4, z: -722, yaw: -HP },
      { verb: "Exit", radius: 1.6 },
    );
    // Rose Center: barred from the inside until the player opens it on the way out
    const rose = P.barDoor(
      E.door(
        -149.4,
        1.5,
        -766,
        "Hayden Planetarium",
        { x: O.x + 92.9, y: O.y + FLOOR_Y, z: O.z - 3.5, yaw: HP },
        { id: "pu_amnh_rose_ext", radius: 1.5 },
      ),
      {
        message: "The planetarium doors are barred from the inside.",
        unbarMessage: "You lift the bar off the planetarium doors.",
      },
    );
    I.door(
      95.3,
      1.6,
      -8,
      "81st Street",
      { x: -147.2, y: 0, z: -766, yaw: -HP },
      { verb: "Exit", radius: 1.5, onEnter: () => rose.unbar() },
    );
    P.register("amnh", {
      root: E.root,
      interiorRoot: I.root,
      interiorKey: "amnh",
      anchors: Object.assign({}, E.anchors, I.anchors),
      doors: { rose },
    });
    // barred plank on the outside of the planetarium door follows the door state (also after a load)
    if (P.amnhRosePlank) {
      let t = 0;
      (P.tick = P.tick || []).push((dt, realDt) => {
        t -= realDt;
        if (t > 0) return;
        t = 0.5;
        const v = !!rose._barred;
        if (P.amnhRosePlank.visible !== v) P.amnhRosePlank.visible = v;
      });
    }
  };
})();
