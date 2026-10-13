// play-inline-261 06 — noao
// Lines 1245-1564 of readable/play-inline-261.pretty.js (statement-aligned).
  D.bed = function (b, x, y, z, ry, o) {
    o = o || {};
    const M = P.m4(x, y, z, ry),
      w = o.w || 1.5,
      L = 2.05,
      wk = o.wood || "wood_dark";
    b.geo(wk, new THREE.BoxGeometry(w, 0.3, L).translate(0, 0.25, 0), M, {
      noAO: true,
    });
    b.geo(
      o.sheet || "fabric_white",
      new THREE.BoxGeometry(w - 0.08, 0.18, L - 0.1).translate(0, 0.49, 0.02),
      M,
      { noAO: true, grime: 0.55 },
    );
    b.geo(
      o.cover || "velvet",
      new THREE.BoxGeometry(w - 0.02, 0.06, L * 0.6)
        .translate(0, 0.6, 0.35)
        .rotateX(0.02),
      M,
      { noAO: true, grime: 0.4 },
    );
    for (const s of [-1, 1])
      b.geo(
        "fabric_white",
        new THREE.BoxGeometry(w * 0.4, 0.12, 0.35).translate(
          s * w * 0.22,
          0.64,
          -L / 2 + 0.3,
        ),
        M,
        { noAO: true, grime: 0.5 },
      );
    b.geo(
      wk,
      new THREE.BoxGeometry(w + 0.1, 1.0, 0.08).translate(0, 0.6, -L / 2),
      M,
      { noAO: true },
    );
    b.geo(
      wk,
      new THREE.BoxGeometry(w + 0.1, 0.6, 0.08).translate(0, 0.4, L / 2),
      M,
      { noAO: true },
    );
    if (o.posts)
      for (const s of [-1, 1])
        for (const t of [-1, 1]) {
          b.geo(
            wk,
            new THREE.CylinderGeometry(0.05, 0.05, 2.2, 6).translate(
              s * (w / 2 + 0.02),
              1.1,
              (t * L) / 2,
            ),
            M,
            { noAO: true },
          );
          if (o.canopy)
            b.geo(
              o.canopy,
              new THREE.BoxGeometry(w + 0.2, 0.3, L + 0.1).translate(0, 2.1, 0),
              M,
              { noAO: true },
            );
        }
  };
  /** Grand piano (lid propped). */
  D.piano = function (b, x, y, z, ry, o) {
    o = o || {};
    const M = P.m4(x, y, z, ry),
      k = o.key || "paint_black";
    const sh = new THREE.Shape();
    sh.moveTo(-0.72, 0);
    sh.lineTo(0.72, 0);
    sh.lineTo(0.72, 0.6);
    sh.bezierCurveTo(0.72, 1.4, 0.2, 1.3, 0.05, 1.9);
    sh.lineTo(-0.72, 2.0);
    sh.closePath();
    const body = new THREE.ExtrudeGeometry(sh, {
      depth: 0.32,
      bevelEnabled: false,
      curveSegments: 8,
    })
      .rotateX(HP)
      .translate(0, 1.0, 0);
    b.geo(k, body, M, { noAO: true, grime: 0.25 });
    // lid (propped open)
    const lid = new THREE.ExtrudeGeometry(sh, {
      depth: 0.03,
      bevelEnabled: false,
      curveSegments: 8,
    }).rotateX(HP);
    b.geo(
      k,
      lid,
      M.clone()
        .multiply(P.m4(0.72, 1.0, 0, 0, 0, o.lidOpen === false ? 0 : 0.55))
        .multiply(P.m4(-0.72, 0, 0)),
      { noAO: true },
    );
    b.geo(
      "iron",
      new THREE.BoxGeometry(0.02, 0.9, 0.02)
        .translate(0.6, 1.4, 1.1)
        .rotateZ(0.1),
      M,
      { noAO: true },
    );
    for (const [lx, lz] of [
      [-0.6, 0.12],
      [0.6, 0.12],
      [-0.3, 1.7],
    ])
      b.geo(
        k,
        new THREE.CylinderGeometry(0.06, 0.05, 0.68, 6).translate(lx, 0.34, lz),
        M,
        { noAO: true },
      );
    // keyboard
    b.geo(
      "paint_white",
      new THREE.BoxGeometry(1.3, 0.04, 0.16).translate(0, 0.72, -0.08),
      M,
      { noAO: true },
    );
    for (let i = 0; i < 18; i++)
      b.geo(
        "paint_black",
        new THREE.BoxGeometry(0.03, 0.02, 0.09).translate(
          -0.6 + i * 0.07,
          0.75,
          -0.04,
        ),
        M,
        { noAO: true },
      );
    b.geo(
      k,
      new THREE.BoxGeometry(1.44, 0.1, 0.3).translate(0, 0.66, -0.05),
      M,
      { noAO: true },
    );
    if (o.bench !== false) {
      b.geo(
        k,
        new THREE.BoxGeometry(0.8, 0.08, 0.36).translate(0, 0.5, -0.65),
        M,
        { noAO: true },
      );
      for (const s of [-1, 1])
        b.geo(
          k,
          new THREE.BoxGeometry(0.05, 0.5, 0.3).translate(
            s * 0.35,
            0.25,
            -0.65,
          ),
          M,
          { noAO: true },
        );
    }
  };
  /** Organ pipe rank on a wall: centred at x, back at z, facing +z. */
  D.organ = function (b, x, y, z, w, h, ry) {
    const M = P.m4(x, y, z, ry || 0);
    const n = Math.floor(w / 0.32);
    for (let i = 0; i < n; i++) {
      const u = -w / 2 + ((i + 0.5) * w) / n,
        t = Math.abs(u) / (w / 2);
      const L =
        h * (0.45 + 0.55 * (1 - t * t)) * (0.9 + 0.1 * Math.sin(i * 1.7));
      const r = 0.1 + 0.05 * (1 - t);
      b.geo(
        "gold",
        new THREE.CylinderGeometry(r, r, L, 8).translate(u, 0.6 + L / 2, 0.35),
        M,
        { noAO: true, grime: 0.45 },
      );
      b.geo(
        "gold",
        new THREE.ConeGeometry(r, 0.4, 8).rotateX(PI).translate(u, 0.4, 0.35),
        M,
        { noAO: true },
      );
      b.geo(
        "iron",
        new THREE.BoxGeometry(r * 1.2, 0.08, 0.02).translate(u, 0.95, 0.35 + r),
        M,
        { noAO: true },
      );
    }
    b.geo(
      "wood_dark",
      new THREE.BoxGeometry(w + 0.6, 0.6, 0.7).translate(0, 0.3, 0.3),
      M,
      { noAO: true },
    );
    b.geo(
      "wood_dark",
      new THREE.BoxGeometry(w + 0.6, 0.25, 0.5).translate(0, h + 0.8, 0.25),
      M,
      { noAO: true },
    );
  };
  /** Chandelier: tiers of crystal rings + arms + candle bulbs; adds a baked light + glow via S. */
  D.chandelier = function (S, x, y, z, r, o) {
    o = o || {};
    const b = S.b,
      tiers = o.tiers || 3;
    b.rod("iron", [x, y, z], [x, y + (o.chain || 2), z], 0.025, 4, {
      noAO: true,
    });
    for (let t = 0; t < tiers; t++) {
      const rr = r * (1 - t * 0.28),
        yy = y - t * 0.45;
      b.torus("gold", x, yy, z, rr, 0.03, TAU, {
        rx: HP,
        ts: 20,
        rs: 4,
        noAO: true,
      });
      const n = Math.max(6, Math.round(rr * 10));
      for (let k = 0; k < n; k++) {
        const a = (k / n) * TAU,
          px = x + Math.cos(a) * rr,
          pz = z + Math.sin(a) * rr;
        if (!o.broken || k % 3)
          b.box(
            "crystal",
            px - 0.015,
            yy - 0.28,
            pz - 0.015,
            px + 0.015,
            yy - 0.02,
            pz + 0.015,
            { seg: false, noAO: true, noBake: true },
          );
        if (k % 2 === 0) {
          b.cyl(
            o.dark ? "glass_dark" : "candle",
            px,
            yy,
            pz,
            0.025,
            0.03,
            0.12,
            5,
            { noAO: true },
          );
        }
      }
      b.rod("gold", [x, yy, z], [x, yy + 0.45, z], 0.03, 5, { noAO: true });
    }
    b.sphere("crystal", x, y - tiers * 0.45, z, 0.12, {
      ws: 8,
      hs: 6,
      noAO: true,
    });
    if (!o.dark) {
      S.light(x, y - 0.4, z, o.color || 0xffd89a, o.lr || r * 9, o.li || 1.0);
      S.glow(x, y - 0.4, z, o.color || 0xffd89a, o.glow || r * 1.4);
    }
  };
  /** Bookcase full of books (against a wall, facing ry). */
  D.bookcase = function (b, x, y, z, ry, o) {
    o = o || {};
    const M = P.m4(x, y, z, ry),
      w = o.w || 1.6,
      h = o.h || 2.2,
      wk = o.wood || "wood_dark";
    const r = P.rng(x * 11 + z * 3);
    b.geo(wk, new THREE.BoxGeometry(w, h, 0.05).translate(0, h / 2, -0.18), M, {
      noAO: true,
    });
    for (const s of [-1, 1])
      b.geo(
        wk,
        new THREE.BoxGeometry(0.05, h, 0.4).translate((s * w) / 2, h / 2, 0),
        M,
        { noAO: true },
      );
    const shelves = o.shelves || 5;
    for (let i = 0; i <= shelves; i++) {
      const sy = 0.05 + (i * (h - 0.1)) / shelves;
      b.geo(wk, new THREE.BoxGeometry(w, 0.04, 0.4).translate(0, sy, 0), M, {
        noAO: true,
      });
      if (i === shelves) break;
      let u = -w / 2 + 0.05;
      while (u < w / 2 - 0.1) {
        const bw = 0.03 + r() * 0.05,
          bh = 0.2 + r() * 0.14;
        if (r() < (o.empty || 0.15)) {
          u += 0.12;
          continue;
        }
        const lean = r() < 0.1 ? 0.3 : 0;
        const keys = [
          "leather",
          "paint_red",
          "paint_green",
          "paint_blue",
          "fabric",
          "paper",
        ];
        b.geo(
          keys[Math.floor(r() * keys.length)],
          new THREE.BoxGeometry(bw, bh, 0.25)
            .translate(0, bh / 2, 0)
            .rotateZ(lean),
          M.clone().multiply(P.m4(u + bw / 2, sy + 0.02, 0.02)),
          { noAO: true, grime: 0.4 },
        );
        u += bw + 0.005;
      }
    }
  };
