// play-inline-304 02 — three
// Lines 16-346 of readable/play-inline-304.pretty.js (statement-aligned).
  const P = G._pe;
  const TAU = P.TAU,
    PI = P.PI,
    HP = P.HP;
  const D = P.dress;
  const E = (P.dress2 = {});

  // ---------------------------------------------------------------
  // Office
  // ---------------------------------------------------------------
  /** Steel/oak office desk, front (+z local) toward the chair. o: {w, wood, clutter, lamp (S)} */
  E.desk = function (b, x, y, z, ry, o) {
    o = o || {};
    const M = P.m4(x, y, z, ry),
      w = o.w || 1.5,
      d = o.d || 0.75,
      k = o.key || "wood_dark";
    const add = (key, g, oo) =>
      b.geo(key, g, M, Object.assign({ noAO: true, grime: 0.35 }, oo || {}));
    add(k, new THREE.BoxGeometry(w, 0.05, d).translate(0, 0.74, 0));
    add(
      k,
      new THREE.BoxGeometry(0.42, 0.7, d - 0.06).translate(
        w / 2 - 0.23,
        0.36,
        0,
      ),
    );
    add(
      k,
      new THREE.BoxGeometry(0.04, 0.7, d - 0.06).translate(
        -w / 2 + 0.03,
        0.36,
        0,
      ),
    );
    add(
      k,
      new THREE.BoxGeometry(w - 0.1, 0.5, 0.03).translate(
        0,
        0.45,
        -d / 2 + 0.04,
      ),
    );
    for (let i = 0; i < 3; i++)
      add(
        "brass",
        new THREE.BoxGeometry(0.12, 0.02, 0.02).translate(
          w / 2 - 0.23,
          0.18 + i * 0.22,
          d / 2 - 0.02,
        ),
      );
    if (o.clutter !== false) {
      const r = P.rng(x * 7.1 + z * 3.3);
      for (let i = 0; i < 3; i++)
        add(
          "paper",
          new THREE.BoxGeometry(0.22, 0.01, 0.3)
            .rotateY(r() * 2)
            .translate(
              (r() - 0.5) * w * 0.7,
              0.77 + i * 0.004,
              (r() - 0.5) * d * 0.5,
            ),
        );
      if (r() < 0.6)
        add(
          "newsprint",
          new THREE.BoxGeometry(0.3, 0.08 + r() * 0.15, 0.4).translate(
            -w / 2 + 0.25,
            0.8,
            -0.1,
          ),
          { uv: "box" },
        );
      if (r() < 0.5)
        add(
          "paint_white",
          new THREE.CylinderGeometry(0.04, 0.035, 0.1, 6).translate(
            w / 2 - 0.3,
            0.82,
            0.15,
          ),
        );
    }
    if (o.typewriter !== false) E.typewriter(b, 0, 0.765, 0.05, 0, M);
    if (o.phone) E.phone(b, -w / 2 + 0.25, 0.765, 0.15, 0.3, M);
  };
  /** Typewriter on a desk top. (lx,ly,lz,lry) local to M (or world when no M). */
  E.typewriter = function (b, lx, ly, lz, lry, M) {
    const m = (M ? M.clone() : new THREE.Matrix4()).multiply(
      P.m4(lx, ly, lz, lry),
    );
    const add = (key, g) => b.geo(key, g, m, { noAO: true, grime: 0.3 });
    add(
      "press_dark",
      new THREE.BoxGeometry(0.44, 0.1, 0.34).translate(0, 0.05, 0),
    );
    add(
      "press_dark",
      new THREE.BoxGeometry(0.4, 0.08, 0.16)
        .rotateX(-0.35)
        .translate(0, 0.1, 0.1),
    );
    add(
      "chrome",
      new THREE.CylinderGeometry(0.035, 0.035, 0.52, 8)
        .rotateZ(HP)
        .translate(0, 0.16, -0.1),
    );
    add(
      "paper",
      new THREE.BoxGeometry(0.22, 0.26, 0.004)
        .rotateX(-0.25)
        .translate(0, 0.3, -0.13),
    );
    for (let r = 0; r < 3; r++)
      for (let i = 0; i < 8; i++)
        add(
          "paint_white",
          new THREE.CylinderGeometry(0.012, 0.012, 0.02, 5).translate(
            -0.14 + i * 0.04,
            0.14 + r * 0.02,
            0.05 + r * 0.045,
          ),
        );
  };
  E.phone = function (b, lx, ly, lz, lry, M) {
    const m = (M ? M.clone() : new THREE.Matrix4()).multiply(
      P.m4(lx, ly, lz, lry),
    );
    b.geo(
      "paint_black",
      new THREE.BoxGeometry(0.2, 0.08, 0.22).translate(0, 0.04, 0),
      m,
      { noAO: true },
    );
    b.geo(
      "paint_black",
      new THREE.CylinderGeometry(0.03, 0.03, 0.22, 6)
        .rotateZ(HP)
        .translate(0, 0.11, 0),
      m,
      { noAO: true },
    );
    b.geo(
      "chrome",
      new THREE.CylinderGeometry(0.05, 0.05, 0.01, 10).translate(
        0,
        0.085,
        0.05,
      ),
      m,
      { noAO: true },
    );
  };
  /** Green banker's desk lamp; adds a small baked light + glow when lit. */
  E.deskLamp = function (S, x, y, z, lit) {
    const b = S.b;
    b.cyl("brass", x, y, z, 0.06, 0.08, 0.03, 8, { noAO: true });
    b.rod("brass", [x, y, z], [x, y + 0.32, z - 0.04], 0.012, 4, {
      noAO: true,
    });
    b.cyl("paint_green", x, y + 0.3, z, 0.07, 0.12, 0.08, 10, {
      rz: 0.1,
      noAO: true,
      open: true,
    });
    if (lit) {
      b.sphere("lamp", x, y + 0.29, z, 0.035, { ws: 5, hs: 4 });
      S.light(x, y + 0.2, z, 0xffd8a0, 3.2, 0.7);
      S.glow(x, y + 0.25, z, 0xffd8a0, 0.35);
    }
  };
  /** Visual four-drawer file cabinet (no container). */
  E.cabinet = function (b, x, y, z, ry, o) {
    o = o || {};
    const M = P.m4(x, y, z, ry),
      k = o.key || "metal";
    b.geo(k, new THREE.BoxGeometry(0.5, 1.35, 0.62).translate(0, 0.675, 0), M, {
      noAO: true,
      grime: 0.4,
    });
    for (let i = 0; i < 4; i++) {
      const open = o.open && i === 1 ? 0.3 : 0;
      b.geo(
        k,
        new THREE.BoxGeometry(0.46, 0.29, 0.03).translate(
          0,
          0.2 + i * 0.32,
          0.31 + open,
        ),
        M,
        { noAO: true },
      );
      b.geo(
        "chrome",
        new THREE.BoxGeometry(0.14, 0.025, 0.03).translate(
          0,
          0.25 + i * 0.32,
          0.34 + open,
        ),
        M,
        { noAO: true },
      );
      if (open)
        b.geo(
          "paper",
          new THREE.BoxGeometry(0.42, 0.22, 0.28).translate(
            0,
            0.25 + i * 0.32,
            0.18 + open,
          ),
          M,
          { noAO: true },
        );
    }
  };
  /** Teletype / wire machine on a stand, paper tape spilling out. */
  E.teletype = function (b, x, y, z, ry) {
    const M = P.m4(x, y, z, ry);
    b.geo(
      "press_green",
      new THREE.BoxGeometry(0.7, 0.72, 0.55).translate(0, 0.36, 0),
      M,
      { noAO: true },
    );
    b.geo(
      "press_green",
      new THREE.BoxGeometry(0.66, 0.34, 0.5).translate(0, 0.9, 0),
      M,
      { noAO: true },
    );
    b.geo(
      "glass_dark",
      new THREE.BoxGeometry(0.5, 0.18, 0.02).translate(0, 0.95, 0.25),
      M,
      { noAO: true },
    );
    b.geo(
      "paper",
      new THREE.BoxGeometry(0.3, 0.5, 0.005)
        .rotateX(0.4)
        .translate(0, 1.05, -0.2),
      M,
      { noAO: true },
    );
    b.geo(
      "paper",
      new THREE.BoxGeometry(0.3, 0.005, 0.9).translate(0, 0.01, 0.7),
      M,
      { noAO: true },
    );
  };

  // ---------------------------------------------------------------
  // Lighting fixtures
  // ---------------------------------------------------------------
  /** Hanging enamel shade lamp on a chain. */
  E.hangLamp = function (S, x, y, z, o) {
    o = o || {};
    const b = S.b,
      ch = o.chain || 1.2;
    b.rod("iron", [x, y, z], [x, y - ch, z], 0.012, 3, { noAO: true });
    b.cyl(o.shade || "paint_green", x, y - ch - 0.18, z, 0.06, 0.28, 0.2, 12, {
      open: true,
      noAO: true,
    });
    if (o.lit !== false) {
      b.sphere("lamp", x, y - ch - 0.2, z, 0.06, { ws: 6, hs: 4 });
      S.light(
        x,
        y - ch - 0.35,
        z,
        o.color || 0xffd8a0,
        o.r || 6.5,
        o.i || 0.85,
      );
      S.glow(x, y - ch - 0.25, z, o.color || 0xffd8a0, o.size || 0.55);
    } else b.sphere("glass_dark", x, y - ch - 0.2, z, 0.06, { ws: 6, hs: 4 });
  };
  /** Twin-tube fluorescent fixture hanging from rods (cool light). */
  E.tube = function (S, x, y, z, ry, o) {
    o = o || {};
    const b = S.b,
      L = o.len || 2.4,
      M = P.m4(x, y, z, ry);
    for (const s of [-1, 1])
      b.geo(
        "iron",
        new THREE.CylinderGeometry(0.008, 0.008, o.drop || 0.8, 3).translate(
          s * L * 0.4,
          (o.drop || 0.8) / 2,
          0,
        ),
        M,
        { noAO: true },
      );
    b.geo("metal", new THREE.BoxGeometry(L, 0.06, 0.28).translate(0, 0, 0), M, {
      noAO: true,
    });
    const lit = o.lit !== false;
    for (const s of [-1, 1])
      b.geo(
        lit ? "lamp_cool" : "glass_dark",
        new THREE.CylinderGeometry(0.025, 0.025, L - 0.1, 6)
          .rotateZ(HP)
          .translate(0, -0.05, s * 0.07),
        M,
        { noAO: true },
      );
    if (lit) {
      const p = new THREE.Vector3(0, -0.3, 0).applyMatrix4(M);
      S.light(p.x, p.y, p.z, o.color || 0xdce8ff, o.r || 9, o.i || 0.9);
      if (o.glow !== false)
        S.glow(p.x, p.y + 0.2, p.z, o.color || 0xdce8ff, o.size || 0.8);
    }
  };

  // ---------------------------------------------------------------
  // Structure / ruin
  // ---------------------------------------------------------------
  /** I-beam from a to b (square-ish rod with flanges). */
  E.girder = function (b, a, c, s, key) {
    s = s || 0.18;
    key = key || "rust";
    b.rod(key, a, c, s * 0.25, 4, { square: true, r2: s, noAO: true });
    b.rod(key, a, c, s, 4, { square: true, r2: s * 0.12, noAO: true });
  };
  /** Steel-grate catwalk deck with collider (walkable) and optional rails. */
