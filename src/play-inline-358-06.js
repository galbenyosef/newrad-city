// play-inline-358 06 — ctx
// Lines 1226-1550 of readable/play-inline-358.pretty.js (statement-aligned).
  PF.deskClutter = function (b, x, y, z, ry, seed, opts) {
    opts = opts || {};
    const r = PF.rng("desk" + seed);
    const M = PF.m4(x, y, z, ry);
    const add = (k, g, m, o) =>
      b.add(
        k,
        g,
        Object.assign(
          { m: new THREE.Matrix4().multiplyMatrices(M, m), grime: 0.35 },
          o || {},
        ),
      );
    add(
      "felt",
      new THREE.BoxGeometry(0.62, 0.012, 0.42),
      PF.m4(0, 0.006, 0.05),
    );
    if (opts.typewriter !== false && r() < 0.8) {
      add(
        "black_enamel",
        new THREE.BoxGeometry(0.42, 0.09, 0.34),
        PF.m4(-0.05, 0.045, 0.02),
      );
      add(
        "black_enamel",
        new THREE.BoxGeometry(0.4, 0.05, 0.16),
        PF.m4(-0.05, 0.1, 0.1, 0, 0.35),
      );
      add(
        "iron",
        new THREE.CylinderGeometry(0.03, 0.03, 0.44, 8),
        PF.m4(-0.05, 0.14, -0.1, 0, 0, HP),
      );
      add(
        "paper",
        new THREE.PlaneGeometry(0.2, 0.26),
        PF.m4(-0.05, 0.25, -0.12, 0, -0.25),
        { uv: "keep", noAO: true },
      );
      for (let k = 0; k < 4; k++)
        add(
          "chrome",
          new THREE.BoxGeometry(0.34, 0.01, 0.02),
          PF.m4(-0.05, 0.1 + k * 0.012, 0.16 - k * 0.03, 0, 0.35),
        );
    } else {
      add(
        "mahog_ws",
        new THREE.BoxGeometry(0.34, 0.05, 0.26),
        PF.m4(-0.05, 0.025, 0.05, 0.2),
      ); // ledger
      add(
        "paper",
        new THREE.BoxGeometry(0.32, 0.03, 0.24),
        PF.m4(-0.05, 0.05, 0.05, 0.2),
      );
    }
    // telephone
    add(
      "black_enamel",
      new THREE.BoxGeometry(0.16, 0.06, 0.18),
      PF.m4(0.36, 0.03, -0.08, -0.3),
    );
    add(
      "black_enamel",
      new THREE.CapsuleGeometry(0.02, 0.16, 2, 6),
      PF.m4(0.36, 0.085, -0.08, -0.3, 0, HP),
    );
    // banker's lamp
    add(
      "brass_ws",
      new THREE.CylinderGeometry(0.06, 0.07, 0.03, 10),
      PF.m4(-0.36, 0.015, -0.14),
    );
    add(
      "brass_ws",
      new THREE.CylinderGeometry(0.01, 0.01, 0.3, 5),
      PF.m4(-0.36, 0.17, -0.14),
    );
    add(
      opts.lit ? "lamp_ws" : "paint_teal",
      new THREE.CylinderGeometry(0.1, 0.1, 0.24, 10, 1, false, 0, PI),
      PF.m4(-0.36, 0.34, -0.1, 0, 0, HP),
    );
    if (opts.lit)
      PF.glow(
        new THREE.Vector3(-0.36, 0.3, -0.05).applyMatrix4(M),
        0x9affb0,
        0.8,
        opts.parent || null,
        { intensity: 0.8 },
      );
    // ashtray + butts, pen stand, loose papers & a coffee cup
    add(
      "chrome",
      new THREE.CylinderGeometry(0.06, 0.05, 0.02, 10),
      PF.m4(0.3, 0.01, 0.16),
    );
    for (let k = 0; k < 3; k++)
      add(
        "paper",
        new THREE.CylinderGeometry(0.006, 0.006, 0.04, 4),
        PF.m4(0.28 + k * 0.02, 0.025, 0.15 + (k % 2) * 0.02, 0, 0, HP),
      );
    add(
      "black_enamel",
      new THREE.BoxGeometry(0.1, 0.02, 0.05),
      PF.m4(0.12, 0.01, 0.2),
    );
    add(
      "black_enamel",
      new THREE.CylinderGeometry(0.005, 0.005, 0.12, 4),
      PF.m4(0.1, 0.07, 0.2, 0, 0.3),
    );
    add(
      "china",
      new THREE.CylinderGeometry(0.04, 0.033, 0.08, 10),
      PF.m4(0.22, 0.04, -0.16),
    );
    for (let k = 0; k < 4; k++)
      add(
        "paper",
        new THREE.PlaneGeometry(0.21, 0.28),
        PF.m4(
          0.05 + (r() - 0.5) * 0.4,
          0.014 + k * 0.002,
          -0.1 + (r() - 0.5) * 0.15,
          r() * 3,
          -HP,
        ),
        { uv: "keep", noAO: true },
      );
  };
  /** Leather club chair (key = leather). */
  PF.clubChair = function (b, x, y, z, ry, key, tipped) {
    key = key || "leather_ws";
    const M = PF.m4(
      x,
      y + (tipped ? 0.42 : 0),
      z,
      ry,
      tipped ? -HP + 0.15 : 0,
      0,
    );
    const add = (g, m) =>
      b.add(key, g, {
        m: new THREE.Matrix4().multiplyMatrices(M, m),
        grime: 0.45,
      });
    add(new THREE.BoxGeometry(0.8, 0.28, 0.78), PF.m4(0, 0.2, 0));
    add(new THREE.BoxGeometry(0.62, 0.14, 0.62), PF.m4(0, 0.4, 0.06));
    add(new THREE.BoxGeometry(0.8, 0.5, 0.18), PF.m4(0, 0.55, -0.32, 0, -0.1));
    for (const sx of [-1, 1])
      add(
        new THREE.CapsuleGeometry(0.1, 0.62, 2, 8),
        PF.m4(sx * 0.36, 0.52, 0.02, 0, HP),
      );
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        b.add("mahog_ws", new THREE.BoxGeometry(0.06, 0.08, 0.06), {
          m: new THREE.Matrix4().multiplyMatrices(
            M,
            PF.m4(sx * 0.34, 0.04, sz * 0.32),
          ),
          grime: 0.3,
        });
  };
  /** Bookcase (w wide, rows of shelves) filled with leather-bound books, a few leaning or fallen. */
  PF.bookcase = function (b, x, y, z, ry, w, rows, seed, key) {
    const r = PF.rng("books" + seed);
    const M = PF.m4(x, y, z, ry);
    const add = (k, g, m, o) =>
      b.add(
        k,
        g,
        Object.assign(
          { m: new THREE.Matrix4().multiplyMatrices(M, m), grime: 0.4 },
          o || {},
        ),
      );
    const H = rows * 0.42 + 0.25,
      wood = key || "walnut";
    add(wood, new THREE.BoxGeometry(w, H, 0.06), PF.m4(0, H / 2, -0.17));
    for (const sx of [-1, 1])
      add(
        wood,
        new THREE.BoxGeometry(0.05, H, 0.4),
        PF.m4(sx * (w / 2 - 0.025), H / 2, 0),
      );
    add(
      wood,
      new THREE.BoxGeometry(w + 0.08, 0.08, 0.44),
      PF.m4(0, H + 0.04, 0),
    );
    const cols = [0x5a1a14, 0x1e3a2a, 0x2a2440, 0x6a4a2a, 0x3a2a1a, 0x7a6a4a];
    for (let k = 0; k < rows; k++) {
      const sy = 0.08 + k * 0.42;
      add(wood, new THREE.BoxGeometry(w - 0.1, 0.03, 0.36), PF.m4(0, sy, 0.01));
      let bx = -w / 2 + 0.08;
      while (bx < w / 2 - 0.12) {
        const bw = 0.03 + r() * 0.04,
          bh = 0.24 + r() * 0.1;
        if (r() < 0.08) {
          bx += 0.15;
          continue;
        }
        const lean = r() < 0.06 ? 0.3 : 0;
        add(
          "leather_ws",
          new THREE.BoxGeometry(bw, bh, 0.24),
          PF.m4(bx + bw / 2, sy + 0.015 + bh / 2, 0.02, 0, 0, lean),
          { c: cols[(r() * cols.length) | 0], grime: 0.3 },
        );
        bx += bw + 0.004 + (lean ? 0.06 : 0);
      }
    }
    for (let k = 0; k < 3; k++)
      add(
        "leather_ws",
        new THREE.BoxGeometry(0.2, 0.05, 0.28),
        PF.m4((r() - 0.5) * w, 0.03 - y + y, 0.45 + r() * 0.3, r() * 3),
        { c: cols[k], grime: 0.4 },
      ); // fallen books
    PF.col(x, z, w, 0.45, y, y + H, ry, { walkable: false });
  };
  /** Oriental rug texture atlas (2 designs) + a rug quad on the floor. */
  PF.rugKey = function () {
    return PF.texMat(
      "rugs",
      PF.canvasTex(
        "pws_rugs",
        512,
        256,
        (ctx, W, H) => {
          const r = PF.rng("rugs");
          for (let v = 0; v < 2; v++) {
            const x0 = v * 256,
              cx = x0 + 128,
              cy = 128;
            const field = v ? "#1e2a4a" : "#6a1a1a",
              border = v ? "#8a2a20" : "#1e2a44",
              gold = "#c89a4a";
            ctx.fillStyle = border;
            ctx.fillRect(x0, 0, 256, 256);
            ctx.fillStyle = gold;
            ctx.fillRect(x0 + 14, 14, 228, 228);
            ctx.fillStyle = field;
            ctx.fillRect(x0 + 22, 22, 212, 212);
            for (let k = 0; k < 28; k++) {
              ctx.fillStyle = k % 2 ? gold : "#e8dcc0";
              ctx.fillRect(x0 + 4 + k * 9, 4, 5, 6);
              ctx.fillRect(x0 + 4 + k * 9, 246, 5, 6);
            }
            ctx.fillStyle = gold;
            ctx.beginPath();
            ctx.moveTo(cx, cy - 80);
            ctx.lineTo(cx + 60, cy);
            ctx.lineTo(cx, cy + 80);
            ctx.lineTo(cx - 60, cy);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = v ? "#6a1a1a" : "#1e2a44";
            ctx.beginPath();
            ctx.moveTo(cx, cy - 56);
            ctx.lineTo(cx + 40, cy);
            ctx.lineTo(cx, cy + 56);
            ctx.lineTo(cx - 40, cy);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "#e8dcc0";
            ctx.beginPath();
            ctx.arc(cx, cy, 14, 0, TAU);
            ctx.fill();
            for (const [dx, dy] of [
              [-80, -80],
              [80, -80],
              [-80, 80],
              [80, 80],
            ]) {
              ctx.fillStyle = gold;
              ctx.beginPath();
              ctx.arc(cx + dx, cy + dy, 16, 0, TAU);
              ctx.fill();
            }
            for (let i = 0; i < 160; i++) {
              ctx.fillStyle =
                "rgba(" +
                (r() < 0.5 ? "0,0,0" : "230,210,170") +
                "," +
                r() * 0.15 +
                ")";
              ctx.fillRect(x0 + 22 + r() * 212, 22 + r() * 212, 2 + r() * 6, 2);
            }
            for (let i = 0; i < 20; i++) {
              ctx.fillStyle = "rgba(40,30,20," + r() * 0.3 + ")";
              ctx.beginPath();
              ctx.ellipse(
                x0 + r() * 256,
                r() * 256,
                8 + r() * 30,
                5 + r() * 16,
                r() * 3,
                0,
                TAU,
              );
              ctx.fill();
            } // stains
          }
        },
        { clamp: true },
      ),
      { rough: 1 },
    );
  };
  PF.rug = function (b, x, y, z, w, d, ry, v) {
    b.quad(PF.rugKey(), x, y + 0.012, z, w, d, {
      rx: -HP,
      rz: ry || 0,
      uvRect: v ? [0.5, 0, 1, 1] : [0, 0, 0.5, 1],
      grime: 0.4,
      noAO: true,
    });
  };
  /** Posters atlas: 0 pin-up, 1 Fizzo Cola, 2 WANTED, 3 Civil Defense. */
