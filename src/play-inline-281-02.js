// play-inline-281 02 — ctx
// Lines 16-350 of readable/play-inline-281.pretty.js (statement-aligned).
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
