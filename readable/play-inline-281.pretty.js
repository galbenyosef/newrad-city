/* src/poi_theater/06_parts.js */
/* =====================================================================
 * NEW RAD CITY — POI THEATER · 06 theatre-district parts
 * Reusable procedural pieces for the three Theater District POIs:
 *   marquee boxes with chaser bulbs, vertical blade signs, theatre seat
 *   lines, TV studio cameras, stage lanterns (fresnels), lighting
 *   battens, rooftop water towers, lattice masts, fire escapes, 1950s
 *   transit buses, bulb strips, gothic pinnacles, lettering textures.
 * Everything goes into a P.Batch in the site's LOCAL coordinates.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._pt) return;
  const P = G._pt;
  const TAU = P.TAU,
    PI = P.PI,
    HP = P.HP;
  const K = (P.parts = {});

  // ---------------------------------------------------------------
  // Lettering textures
  // ---------------------------------------------------------------
  /** Vertical blade sign: letters stacked top→bottom, cream enamel, red neon tubes, bulb border. dead: set of letter indexes unlit. */
  K.bladeTex = function (key, text, o) {
    o = o || {};
    return P.canvasTex(
      "pt_blade_" + key,
      256,
      1024,
      (ctx, w, h) => {
        const r = P.rng(key);
        ctx.fillStyle = o.bg || "#2a0e0b";
        ctx.fillRect(0, 0, w, h);
        // enamel wear
        P.blotches(ctx, w, h, r, 40, 0.35);
        P.speckle(ctx, w, h, r, 1600, 0.35, 0.1);
        for (let i = 0; i < 14; i++) {
          ctx.fillStyle = "rgba(110,50,20," + (0.2 + r() * 0.4) + ")";
          ctx.fillRect(r() * w, r() * h, 3 + r() * 10, 20 + r() * 90);
        }
        ctx.strokeStyle = o.frame || "#c8b890";
        ctx.lineWidth = 16;
        ctx.strokeRect(10, 10, w - 20, h - 20);
        // bulb border
        for (let y = 30; y < h - 20; y += 34)
          for (const x of [26, w - 26]) {
            const lit = r() > 0.25;
            ctx.fillStyle = lit ? "#fff4c8" : "#5a4a30";
            ctx.beginPath();
            ctx.arc(x, y, 7, 0, TAU);
            ctx.fill();
          }
        const letters = text.split("");
        const step = (h - 80) / letters.length;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const fs = Math.min(step * 0.92, w * 0.62);
        ctx.font = "bold " + fs + "px " + P.FONTS.DECO;
        letters.forEach((ch, i) => {
          const y = 40 + step * (i + 0.5);
          const dead = o.dead && o.dead.indexOf(i) >= 0;
          if (!dead) {
            ctx.shadowColor = o.neon || "#ff3a24";
            ctx.shadowBlur = 22;
          }
          ctx.fillStyle = dead ? "#4a2a22" : o.neon || "#ff4a30";
          ctx.fillText(ch, w / 2, y);
          ctx.shadowBlur = 0;
          if (!dead) {
            ctx.fillStyle = "rgba(255,240,225,0.85)";
            ctx.font = "bold " + fs * 0.94 + "px " + P.FONTS.DECO;
            ctx.fillText(ch, w / 2, y);
            ctx.font = "bold " + fs + "px " + P.FONTS.DECO;
          }
        });
      },
      { clamp: true },
    );
  };
  /** Marquee front: big title line + letter-board lines (black slotted letters on milk glass, some missing). */
  K.marqueeTex = function (key, title, lines, o) {
    o = o || {};
    return P.canvasTex(
      "pt_mq_" + key,
      1024,
      256,
      (ctx, w, h) => {
        const r = P.rng(key);
        // title band
        ctx.fillStyle = o.titleBg || "#1c1410";
        ctx.fillRect(0, 0, w, h * 0.46);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        let fs = Math.floor(h * 0.3);
        ctx.font = "bold " + fs + "px " + P.FONTS.DECO;
        const tw = ctx.measureText(title).width;
        if (tw > w * 0.9) {
          fs = Math.floor((fs * w * 0.9) / tw);
          ctx.font = "bold " + fs + "px " + P.FONTS.DECO;
        }
        ctx.shadowColor = o.neon || "#ff5a3a";
        ctx.shadowBlur = 20;
        ctx.fillStyle = o.neon || "#ff6a48";
        ctx.fillText(title, w / 2, h * 0.24);
        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(255,235,215,0.6)";
        ctx.fillText(title, w / 2, h * 0.24);
        // letter board
        const g = ctx.createLinearGradient(0, h * 0.46, 0, h);
        g.addColorStop(0, "#efe6cc");
        g.addColorStop(1, "#cbbf9e");
        ctx.fillStyle = g;
        ctx.fillRect(0, h * 0.46, w, h * 0.54);
        ctx.strokeStyle = "rgba(60,50,30,0.35)";
        ctx.lineWidth = 2;
        for (let k = 0; k < 3; k++) {
          const y = h * 0.5 + k * h * 0.165;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }
        ctx.font = "bold " + Math.floor(h * 0.12) + "px " + P.FONTS.SANS;
        (lines || []).forEach((t, i) => {
          const y = h * 0.585 + i * h * 0.165;
          // draw letter by letter so some can be missing / crooked
          let x = w / 2 - ctx.measureText(t).width / 2;
          for (const ch of t) {
            const cw = ctx.measureText(ch).width;
            if (ch !== " " && r() > (o.missing || 0.12)) {
              ctx.save();
              ctx.translate(x + cw / 2, y);
              ctx.rotate((r() - 0.5) * (r() < 0.1 ? 0.6 : 0.06));
              ctx.fillStyle = "#141210";
              ctx.fillText(ch, 0, 0);
              ctx.restore();
            }
            x += cw;
          }
        });
        P.blotches(ctx, w, h, r, 30, 0.3);
        P.speckle(ctx, w, h, r, 1500, 0.3, 0.08);
      },
      { clamp: true },
    );
  };

  // ---------------------------------------------------------------
  // Bulbs / neon
  // ---------------------------------------------------------------
  /** Row of bulbs from a to b (arrays), every step metres; ~25% dead (glass_dark). */
  K.bulbs = function (b, a, c, step, o) {
    o = o || {};
    const L = Math.hypot(c[0] - a[0], c[1] - a[1], c[2] - a[2]),
      n = Math.max(1, Math.floor(L / (step || 0.35)));
    const r = P.rng(a[0] * 3.1 + a[1] * 7.3 + a[2] * 1.7);
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      b.sphere(
        r() < (o.dead === undefined ? 0.25 : o.dead)
          ? "glass_dark"
          : o.key || "bulb",
        a[0] + (c[0] - a[0]) * t,
        a[1] + (c[1] - a[1]) * t,
        a[2] + (c[2] - a[2]) * t,
        o.r || 0.06,
        { ws: 5, hs: 4, noAO: true, noBake: true },
      );
    }
  };

  // ---------------------------------------------------------------
  // Seats
  // ---------------------------------------------------------------
  /** Theatre seats along the segment (xa,za)→(xb,zb) at floor y, each facing yaw ry (0 = seat faces +z). */
  K.seatLine = function (b, xa, za, xb, zb, y, ry, o) {
    o = o || {};
    const L = Math.hypot(xb - xa, zb - za),
      n = Math.max(1, Math.floor(L / 0.58));
    const r = P.rng(xa * 3.1 + za * 7.7 + y * 5.3);
    const seat = o.seat || "seat_red";
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n,
        x = xa + (xb - xa) * t,
        z = za + (zb - za) * t;
      if (r() < (o.missing === undefined ? 0.1 : o.missing)) continue;
      if (o.skip && o.skip(x, z)) continue;
      const tip = r() < 0.18 ? 0.9 : 0;
      const M = P.m4(x, y, z, ry);
      b.geo(
        "iron",
        new THREE.BoxGeometry(0.05, 0.64, 0.46).translate(-0.28, 0.32, 0),
        M,
        { noAO: true },
      );
      b.geo(
        seat,
        new THREE.BoxGeometry(0.46, 0.1, 0.42)
          .translate(0, 0, 0.21)
          .rotateX(-tip)
          .translate(0, 0.44, -0.19),
        M,
        { noAO: true, grime: 0.4 },
      );
      if (r() > 0.06)
        b.geo(
          seat,
          new THREE.BoxGeometry(0.5, 0.6, 0.09)
            .rotateX(-0.14)
            .translate(0, 0.76, -0.24),
          M,
          { noAO: true, grime: 0.4 },
        );
      b.geo(
        o.arm || "wood_dark",
        new THREE.BoxGeometry(0.06, 0.05, 0.42).translate(0.28, 0.66, -0.04),
        M,
        { noAO: true },
      );
    }
  };

  // ---------------------------------------------------------------
  // Studio / stage equipment
  // ---------------------------------------------------------------
  /** 1950s TV studio camera on a pedestal dolly (lens toward local +z after ry). tally → red lamp. */
  K.tvCamera = function (b, x, y, z, ry, o) {
    o = o || {};
    const M = P.m4(x, y, z, ry);
    const add = (k, g, op) =>
      b.geo(k, g, M, Object.assign({ noAO: true }, op || {}));
    // tripod dolly
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * TAU + 0.3;
      add(
        "iron",
        new THREE.BoxGeometry(0.06, 0.06, 0.75)
          .translate(0, 0.12, 0.37)
          .rotateY(a),
      );
      add(
        "rubber",
        new THREE.CylinderGeometry(0.07, 0.07, 0.05, 8)
          .rotateZ(HP)
          .translate(Math.sin(a) * 0.72, 0.07, Math.cos(a) * 0.72),
      );
    }
    add(
      "steel",
      new THREE.CylinderGeometry(0.09, 0.12, 1.15, 8).translate(0, 0.7, 0),
    );
    add(
      "iron",
      new THREE.CylinderGeometry(0.2, 0.2, 0.05, 10).translate(0, 1.0, 0),
    );
    // body
    const tilt = o.tilt || 0;
    const B = new THREE.Matrix4().multiplyMatrices(
      M,
      P.m4(0, 1.38, 0, 0, tilt),
    );
    const addB = (k, g) => b.geo(k, g, B, { noAO: true });
    addB(o.body || "paint_blue", new THREE.BoxGeometry(0.5, 0.48, 0.78));
    addB("steel", new THREE.BoxGeometry(0.52, 0.06, 0.8).translate(0, 0.26, 0));
    // lens turret (four lenses on a disc)
    addB(
      "iron",
      new THREE.CylinderGeometry(0.2, 0.2, 0.06, 12)
        .rotateX(HP)
        .translate(0, 0, 0.42),
    );
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * TAU;
      addB(
        "chrome",
        new THREE.CylinderGeometry(0.05, 0.06, 0.22 + k * 0.05, 8)
          .rotateX(HP)
          .translate(Math.cos(a) * 0.12, Math.sin(a) * 0.12, 0.55 + k * 0.02),
      );
    }
    addB(
      "glass_dark",
      new THREE.CircleGeometry(0.045, 8).translate(0.12, 0, 0.67),
    );
    // viewfinder hood + handles
    addB(
      "paint_black",
      new THREE.BoxGeometry(0.34, 0.26, 0.3).translate(0, 0.38, -0.22),
    );
    for (const s of [-1, 1])
      addB(
        "steel",
        new THREE.CylinderGeometry(0.02, 0.02, 0.6, 5)
          .rotateX(HP)
          .translate(s * 0.2, -0.12, -0.62),
      );
    // cable
    b.rod(
      "rubber",
      new THREE.Vector3(0, 1.2, -0.4).applyMatrix4(M),
      new THREE.Vector3(0.6, y + 0.02, -1.6).applyMatrix4(M).setY(y + 0.02),
      0.025,
      4,
      { noAO: true },
    );
    // tally light + number plate
    if (o.tally)
      addB(
        o.tallyKey || "lamp_red",
        new THREE.BoxGeometry(0.08, 0.08, 0.04).translate(0, 0.33, 0.39),
      );
  };
  /** Fresnel stage lantern hanging on a batten (points along local +z tilted down by pitch). */
  K.lantern = function (b, x, y, z, ry, pitch, o) {
    o = o || {};
    const M = P.m4(x, y, z, ry, pitch || 0.6);
    b.geo(
      "iron",
      new THREE.BoxGeometry(0.04, 0.3, 0.04).translate(0, 0.15, 0),
      P.m4(x, y, z, ry),
      { noAO: true },
    );
    b.geo(
      "iron",
      new THREE.TorusGeometry(0.2, 0.02, 4, 10, PI).rotateZ(PI),
      M,
      { noAO: true },
    );
    b.geo(
      o.key || "paint_black",
      new THREE.CylinderGeometry(0.16, 0.18, 0.42, 10).rotateX(HP),
      M,
      { noAO: true },
    );
    b.geo(
      o.key || "paint_black",
      new THREE.BoxGeometry(0.22, 0.14, 0.14).translate(0, 0.1, -0.2),
      M,
      { noAO: true },
    );
    b.geo(
      o.lit ? o.lens || "bulb" : "glass_dark",
      new THREE.CircleGeometry(0.15, 10).translate(0, 0, 0.215),
      M,
      { noAO: true, noBake: true },
    );
  };
  /** Pipe batten across X or Z with lanterns every `step`. */
  K.batten = function (b, a, c, y, o) {
    o = o || {};
    b.rod("iron", [a[0], y, a[1]], [c[0], y, c[1]], 0.035, 6, { noAO: true });
    const L = Math.hypot(c[0] - a[0], c[1] - a[1]),
      n = Math.floor(L / (o.step || 1.2));
    const r = P.rng(a[0] + a[1] * 3 + y);
    for (let i = 1; i < n; i++) {
      const t = i / n;
      if (r() < 0.2) continue;
      K.lantern(
        b,
        a[0] + (c[0] - a[0]) * t,
        y - 0.3,
        a[1] + (c[1] - a[1]) * t,
        (o.ry || 0) + (r() - 0.5) * 0.5,
        0.5 + r() * 0.5,
        { lit: o.lit && r() < (o.litFrac || 0.4), lens: o.lens },
      );
    }
    // lift lines to the grid
    if (o.lines !== false)
      for (const t of [0.15, 0.5, 0.85])
        b.rod(
          "iron",
          [a[0] + (c[0] - a[0]) * t, y, a[1] + (c[1] - a[1]) * t],
          [
            a[0] + (c[0] - a[0]) * t,
            y + (o.lineH || 6),
            a[1] + (c[1] - a[1]) * t,
          ],
          0.008,
          3,
          { noAO: true },
        );
  };
  /** Studio boom microphone stand. */
  K.boom = function (b, x, y, z, ry) {
    const M = P.m4(x, y, z, ry);
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * TAU;
      b.geo(
        "iron",
        new THREE.BoxGeometry(0.04, 0.04, 0.5)
          .translate(0, 0.05, 0.25)
          .rotateY(a),
        M,
        { noAO: true },
      );
    }
    b.geo(
      "steel",
      new THREE.CylinderGeometry(0.03, 0.03, 1.9, 6).translate(0, 0.95, 0),
      M,
      { noAO: true },
    );
    b.geo(
      "steel",
      new THREE.CylinderGeometry(0.02, 0.02, 2.6, 5)
        .rotateX(HP - 0.25)
        .translate(0, 1.95, 0.9),
      M,
      { noAO: true },
    );
    b.geo(
      "chrome",
      new THREE.CapsuleGeometry()
        ? new THREE.CapsuleGeometry(0.05, 0.14, 3, 6).rotateX(HP)
        : new THREE.CylinderGeometry(0.05, 0.05, 0.2, 6).rotateX(HP),
      P.m4(0, 2.25, 2.15).premultiply(M),
      { noAO: true },
    );
  };
  /** Old-fashioned standing microphone (vintage broadcast mic). */
  K.standMic = function (b, x, y, z, ry) {
    const M = P.m4(x, y, z, ry);
    b.geo("iron", new THREE.CylinderGeometry(0.14, 0.16, 0.03, 10), M, {
      noAO: true,
    });
    b.geo(
      "chrome",
      new THREE.CylinderGeometry(0.012, 0.012, 1.45, 5).translate(0, 0.72, 0),
      M,
      { noAO: true },
    );
    b.geo(
      "chrome",
      new THREE.BoxGeometry(0.1, 0.16, 0.06).translate(0, 1.5, 0),
      M,
      { noAO: true },
    );
    b.geo(
      "iron",
      new THREE.BoxGeometry(0.08, 0.12, 0.065).translate(0, 1.5, 0),
      M,
      { noAO: true },
    );
  };

  // ---------------------------------------------------------------
  // Rooftop / facade furniture
  // ---------------------------------------------------------------
  /** Classic NYC wooden water tower on a steel stand. */
  K.waterTower = function (b, x, y, z, r, h, o) {
    o = o || {};
    const legH = o.legH || 3;
    for (const [lx, lz] of [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ])
      b.box(
        "rust",
        x + lx * r * 0.7 - 0.12,
        y,
        z + lz * r * 0.7 - 0.12,
        x + lx * r * 0.7 + 0.12,
        y + legH,
        z + lz * r * 0.7 + 0.12,
        { seg: false },
      );
    for (const s of [-1, 1]) {
      b.rod(
        "rust",
        [x - r * 0.7, y + 0.4, z + s * r * 0.7],
        [x + r * 0.7, y + legH - 0.3, z + s * r * 0.7],
        0.03,
        3,
      );
      b.rod(
        "rust",
        [x + s * r * 0.7, y + 0.4, z - r * 0.7],
        [x + s * r * 0.7, y + legH - 0.3, z + r * 0.7],
        0.03,
        3,
      );
    }
    b.box(
      "rust",
      x - r - 0.1,
      y + legH,
      z - r - 0.1,
      x + r + 0.1,
      y + legH + 0.2,
      z + r + 0.1,
      { seg: false },
    );
    b.cyl(o.key || "wood_rotten", x, y + legH + 0.2, z, r * 0.96, r, h, 14, {
      hSeg: 3,
    });
    for (let k = 0; k < 4; k++)
      b.torus(
        "iron",
        x,
        y + legH + 0.5 + (k * (h - 0.6)) / 3,
        z,
        r + 0.02,
        0.03,
        TAU,
        { rx: HP, ts: 18, rs: 3, noAO: true },
      );
    b.cyl(
      o.roof || "wood_rotten",
      x,
      y + legH + 0.2 + h,
      z,
      0.08,
      r * 1.08,
      r * 0.7,
      14,
      {},
    );
    b.rod(
      "iron",
      [x, y + legH + 0.2 + h, z],
      [x, y + legH + h + r * 0.7 + 0.8, z],
      0.03,
      4,
    );
    b.rod(
      "iron",
      [x + r, y + legH + 0.2, z],
      [x + r + 0.05, y + legH + h, z],
      0.02,
      3,
    );
  };
  /** Lattice broadcast mast (triangular section). Adds a red aircraft light (visual only). */
  K.mast = function (b, x, y, z, h, w, o) {
    o = o || {};
    const pts = [0, 1, 2].map((k) => [
      x + Math.cos((k / 3) * TAU) * w,
      z + Math.sin((k / 3) * TAU) * w,
    ]);
    const segs = Math.round(h / 1.6);
    for (let k = 0; k < 3; k++) {
      const a = pts[k],
        c = pts[(k + 1) % 3];
      b.rod(
        o.key || "rust",
        [a[0], y, a[1]],
        [a[0] * 0.85 + x * 0.15, y + h, a[1] * 0.85 + z * 0.15],
        0.05,
        4,
        { noAO: true },
      );
      for (let s = 0; s < segs; s++) {
        const t0 = s / segs,
          t1 = (s + 1) / segs,
          sh0 = 1 - 0.15 * t0,
          sh1 = 1 - 0.15 * t1;
        const A0 = [x + (a[0] - x) * sh0, y + h * t0, z + (a[1] - z) * sh0],
          C1 = [x + (c[0] - x) * sh1, y + h * t1, z + (c[1] - z) * sh1];
        b.rod(o.key || "rust", A0, C1, 0.018, 3, { noAO: true });
        if (s % 2 === 0) {
          const C0 = [x + (c[0] - x) * sh0, y + h * t0, z + (c[1] - z) * sh0];
          b.rod(o.key || "rust", A0, C0, 0.018, 3, { noAO: true });
        }
      }
    }
    b.sphere(o.dead ? "glass_dark" : "lamp_red", x, y + h + 0.15, z, 0.14, {
      ws: 6,
      hs: 4,
      noAO: true,
      noBake: true,
    });
  };
  /** Fire escape on a facade F: stacked platforms with zig-zag stairs, from floor yFirst every dy, n levels, u0..u1 wide. */
  K.fireEscape = function (F, u0, u1, yFirst, dy, n, o) {
    o = o || {};
    const k = o.key || "rust";
    for (let i = 0; i < n; i++) {
      const y = yFirst + i * dy;
      F.box(k, u0, u1, y - 0.08, y, 0.05, 1.3, { seg: false });
      // railing
      F.box(k, u0, u1, y + 0.95, y + 1.0, 1.25, 1.3, { seg: false });
      for (let u = u0; u <= u1 + 0.01; u += 0.5)
        F.box(k, u - 0.015, u + 0.015, y, y + 0.95, 1.26, 1.29, { seg: false });
      for (const uu of [u0, u1])
        F.box(k, uu - 0.02, uu + 0.02, y, y + 1.0, 0.05, 1.3, { seg: false });
      // stair to the next platform (diagonal)
      if (i < n - 1) {
        const dir = i % 2 ? 1 : -1,
          ua = dir > 0 ? u0 + 0.3 : u1 - 0.3,
          ub = dir > 0 ? u1 - 1.2 : u0 + 1.2;
        const A = F.pt(ua, 0.75),
          B = F.pt(ub, 0.75);
        F.S.b.rod(k, [A[0], y, A[1]], [B[0], y + dy, B[1]], 0.35, 4, {
          square: true,
          r2: 0.03,
        });
      }
      // brackets
      for (const uu of [u0 + 0.3, u1 - 0.3]) {
        const A = F.pt(uu, 0.05),
          B = F.pt(uu, 1.2);
        F.S.b.rod(k, [A[0], y - 0.9, A[1]], [B[0], y - 0.05, B[1]], 0.02, 3);
      }
    }
    // drop ladder
    const L = F.pt(u1 - 0.4, 1.2);
    F.S.b.rod(k, [L[0], yFirst - 2.6, L[1]], [L[0], yFirst, L[1]], 0.02, 3);
  };
  /** Gothic pinnacle (square shaft + pyramid). */
  K.pinnacle = function (b, key, x, y, z, s, h) {
    b.box(key, x - s, y, z - s, x + s, y + h * 0.55, z + s, { seg: false });
    b.geo(
      key,
      new THREE.ConeGeometry(s * 1.2, h * 0.45, 4).rotateY(PI / 4),
      P.m4(x, y + h * 0.55 + h * 0.225, z),
      { noAO: true },
    );
    b.sphere(key, x, y + h + 0.05, z, s * 0.45, { ws: 5, hs: 4, noAO: true });
  };
  /** Pointed (gothic) arch ring, extruded, in a facade F at u, springing at y, half-width r, ring thickness th, depth d0..d1. */
  function archPts(r, R, cx, N, rightToLeft) {
    // left arc: centre (+cx, 0), radius R, from (-r', 0) up to the apex
    const a1 = Math.acos(-cx / R),
      out = [];
    for (let i = 0; i <= N; i++) {
      const a = PI + (a1 - PI) * (i / N);
      out.push([cx + Math.cos(a) * R, Math.sin(a) * R]);
    }
    return rightToLeft ? out : out;
  }
  K.gothicArch = function (F, key, u, y, r, th, d0, d1, o) {
    const R = r * 1.6,
      cx = R - r,
      R2 = R + th,
      N = 8;
    const outerL = archPts(r + th, R2, cx, N),
      innerL = archPts(r, R, cx, N);
    const sh = new THREE.Shape();
    sh.moveTo(outerL[0][0], 0);
    for (const p of outerL) sh.lineTo(p[0], p[1]);
    for (let i = N; i >= 0; i--) sh.lineTo(-outerL[i][0], outerL[i][1]);
    sh.lineTo(-innerL[0][0], 0);
    for (let i = 0; i <= N; i++) sh.lineTo(-innerL[i][0], innerL[i][1]);
    for (let i = N; i >= 0; i--) sh.lineTo(innerL[i][0], innerL[i][1]);
    sh.closePath();
    return F.S.b.extrude(
      key,
      sh,
      d1 - d0,
      F.mat(u, y, d0),
      Object.assign({ curve: 4 }, o || {}),
    );
  };
  /** Filled pointed-arch panel (glass / tympanum) matching K.gothicArch's opening. */
  K.gothicFill = function (F, key, u, y, r, d, o) {
    const R = r * 1.6,
      cx = R - r,
      N = 8,
      L = archPts(r, R, cx, N);
    const sh = new THREE.Shape();
    sh.moveTo(L[0][0], 0);
    for (const p of L) sh.lineTo(p[0], p[1]);
    for (let i = N; i >= 0; i--) sh.lineTo(-L[i][0], L[i][1]);
    sh.closePath();
    return F.S.b.geo(
      key,
      new THREE.ShapeGeometry(sh, 4),
      F.mat(u, y, d),
      Object.assign({ uv: "box", noAO: true, grime: 0.1 }, o || {}),
    );
  };
  /** Same pointed-arch outline as a standalone shape (for interior prosceniums / windows), local XY. */
  K.gothicShape = function (r, R0) {
    const R = R0 || r * 1.6,
      cx = R - r,
      N = 10,
      L = archPts(r, R, cx, N);
    const sh = new THREE.Shape();
    sh.moveTo(L[0][0], 0);
    for (const p of L) sh.lineTo(p[0], p[1]);
    for (let i = N; i >= 0; i--) sh.lineTo(-L[i][0], L[i][1]);
    sh.closePath();
    return sh;
  };
  /** Pointed arch height above springing for half-width r (matches gothicArch). */
  K.gothicRise = (r) => {
    const R = r * 1.6,
      cx = R - r;
    return Math.sqrt(R * R - cx * cx);
  };

  // ---------------------------------------------------------------
  // 1950s transit bus (GM "old look"-style), rusted. Length along local +z (front at +z).
  // ---------------------------------------------------------------
  K.bus = function (b, x, y, z, ry, o) {
    o = o || {};
    const M = P.m4(x, y, z, ry, 0, o.roll || 0);
    const L = 10.5,
      W = 2.5,
      H = 2.9,
      r = P.rng(x * 3 + z * 7);
    const paint = o.paint || "bus_paint",
      add = (k, g, op) =>
        b.geo(k, g, M, Object.assign({ noAO: true, grime: 0.55 }, op || {}));
    const sink = o.flat ? -0.18 : 0;
    // lower body + skirt
    add(paint, new THREE.BoxGeometry(W, 1.05, L).translate(0, 0.72 + sink, 0));
    add(
      "rust",
      new THREE.BoxGeometry(W + 0.04, 0.18, L + 0.02).translate(
        0,
        0.3 + sink,
        0,
      ),
    );
    add(
      "stainless",
      new THREE.BoxGeometry(W + 0.05, 0.08, L + 0.03).translate(
        0,
        1.22 + sink,
        0,
      ),
    );
    // window band: pillars + glass
    const nWin = 7;
    for (let i = 0; i <= nWin; i++) {
      const zz = -L / 2 + 0.6 + (i * (L - 1.4)) / nWin;
      for (const s of [-1, 1])
        add(
          paint,
          new THREE.BoxGeometry(0.08, 0.95, 0.16).translate(
            s * (W / 2 - 0.04),
            1.72 + sink,
            zz,
          ),
        );
    }
    for (let i = 0; i < nWin; i++) {
      const zz = -L / 2 + 0.6 + ((i + 0.5) * (L - 1.4)) / nWin;
      for (const s of [-1, 1])
        add(
          r() < 0.45 ? "glass_broken" : "glass_dark",
          new THREE.BoxGeometry(0.03, 0.8, (L - 1.4) / nWin - 0.16).translate(
            s * (W / 2 - 0.05),
            1.72 + sink,
            zz,
          ),
        );
    }
    // roof (rounded) + roof rim
    add(
      paint,
      new THREE.CylinderGeometry(W / 2, W / 2, L - 0.3, 12, 1, false, -HP, PI)
        .rotateX(HP)
        .scale(1, 0.34, 1)
        .translate(0, 2.2 + sink, 0),
    );
    add(
      "stainless",
      new THREE.BoxGeometry(W + 0.02, 0.06, L - 0.2).translate(
        0,
        2.2 + sink,
        0,
      ),
    );
    // front: windshield (split), destination box, bumper, headlights
    add(
      paint,
      new THREE.BoxGeometry(W, 2.0, 0.2).translate(0, 1.2 + sink, L / 2 - 0.05),
    );
    for (const s of [-1, 1])
      add(
        r() < 0.5 ? "glass_broken" : "glass_dark",
        new THREE.BoxGeometry(W / 2 - 0.15, 0.8, 0.04).translate(
          (s * W) / 4,
          1.72 + sink,
          L / 2 + 0.06,
        ),
      );
    add(
      o.destKey || "paint_black",
      new THREE.BoxGeometry(1.5, 0.28, 0.05).translate(
        0,
        2.3 + sink,
        L / 2 + 0.06,
      ),
    );
    add(
      "stainless",
      new THREE.BoxGeometry(W + 0.1, 0.18, 0.18).translate(
        0,
        0.42 + sink,
        L / 2 + 0.12,
      ),
    );
    for (const s of [-1, 1])
      add(
        "chrome",
        new THREE.CylinderGeometry(0.12, 0.12, 0.06, 10)
          .rotateX(HP)
          .translate(s * 0.85, 0.85 + sink, L / 2 + 0.07),
      );
    // rear: engine grille
    add(
      paint,
      new THREE.BoxGeometry(W, 2.0, 0.2).translate(
        0,
        1.2 + sink,
        -L / 2 + 0.05,
      ),
    );
    for (let k = 0; k < 6; k++)
      add(
        "iron",
        new THREE.BoxGeometry(1.6, 0.04, 0.03).translate(
          0,
          0.6 + k * 0.1 + sink,
          -L / 2 - 0.06,
        ),
      );
    add(
      "glass_dark",
      new THREE.BoxGeometry(1.4, 0.5, 0.04).translate(
        0,
        1.85 + sink,
        -L / 2 - 0.05,
      ),
    );
    // door (front right)
    add(
      "glass_dark",
      new THREE.BoxGeometry(0.04, 1.8, 0.9).translate(
        W / 2 + 0.01,
        1.2 + sink,
        L / 2 - 0.9,
      ),
    );
    // wheels (flat tyres sit lower)
    for (const zz of [L / 2 - 1.8, -L / 2 + 2.2])
      for (const s of [-1, 1]) {
        add(
          "rubber",
          new THREE.CylinderGeometry(0.5, 0.5, 0.32, 12)
            .rotateZ(HP)
            .translate(s * (W / 2 - 0.12), 0.5 + sink * 0.8, zz),
        );
        add(
          "rust",
          new THREE.CylinderGeometry(0.26, 0.26, 0.34, 8)
            .rotateZ(HP)
            .translate(s * (W / 2 - 0.1), 0.5 + sink * 0.8, zz),
        );
      }
    // stripe
    add(
      o.stripe || "paint_red",
      new THREE.BoxGeometry(W + 0.02, 0.14, L - 0.3).translate(
        0,
        1.0 + sink,
        0,
      ),
    );
  };
})();
