// play-inline-149 09 — noao
// Lines 2072-2397 of readable/play-inline-149.pretty.js (statement-aligned).
  D.bar = function (b, x0, x1, y, z, zb, o) {
    o = o || {};
    const wk = o.wood || "wood_oak",
      r = P.rng(x0 + z * 13);
    b.box(wk, x0, y, z - 0.6, x1, y + 1.05, z, { segLen: 2 });
    b.box(
      o.top || "marble_dark",
      x0 - 0.05,
      y + 1.05,
      z - 0.65,
      x1 + 0.05,
      y + 1.12,
      z + 0.05,
      { seg: false, noAO: true },
    );
    b.box("gold", x0, y + 0.12, z + 0.02, x1, y + 0.16, z + 0.08, {
      seg: false,
      noAO: true,
    });
    if (zb !== undefined) {
      for (let s = 0; s < 3; s++) {
        const sy = y + 1.2 + s * 0.45;
        b.box(wk, x0, sy, zb, x1, sy + 0.04, zb + 0.3 * Math.sign(z - zb), {
          seg: false,
          noAO: true,
        });
        for (let u = x0 + 0.12; u < x1 - 0.1; u += 0.14 + r() * 0.1) {
          if (r() < 0.3) continue;
          const bz = zb + 0.15 * Math.sign(z - zb),
            hh = 0.2 + r() * 0.12;
          b.cyl(
            r() < 0.5 ? "glass_dark" : "glass",
            u,
            sy + 0.04,
            bz,
            0.035,
            0.04,
            hh,
            6,
            { noAO: true },
          );
          b.cyl("glass_dark", u, sy + 0.04 + hh, bz, 0.012, 0.02, 0.07, 4, {
            noAO: true,
          });
        }
      }
      b.box(
        "glass",
        x0 + 0.2,
        y + 2.6,
        zb + 0.01,
        x1 - 0.2,
        y + 3.3,
        zb + 0.03,
        { seg: false, noAO: true },
      );
    }
  };
  /** Rubble heap (visual + optional collider mound). */
  D.rubble = function (S, x, y, z, r, o) {
    o = o || {};
    const rn = P.rng(x * 17.3 + z * 5.1 + y);
    const n = o.n || Math.round(r * 5);
    for (let i = 0; i < n; i++) {
      const a = rn() * TAU,
        d = rn() * r * 0.8,
        s = (0.2 + rn() * 0.5) * (1 - (d / r) * 0.5) * (o.scale || 1);
      S.b.rock(
        o.key || "rubble",
        x + Math.cos(a) * d,
        y + s * 0.3,
        z + Math.sin(a) * d,
        s,
        { flat: 0.6, seed: i * 3.7 + x },
      );
    }
    if (o.slab)
      S.b.box(
        o.slabKey || "concrete",
        x - r * 0.4,
        y,
        z - r * 0.25,
        x + r * 0.5,
        y + 0.25,
        z + r * 0.3,
        { ry: rn() * 3, rz: 0.2, seg: false },
      );
    if (o.rebar)
      for (let i = 0; i < 4; i++)
        S.b.rod(
          "rust",
          [x + (rn() - 0.5) * r, y + 0.2, z + (rn() - 0.5) * r],
          [
            x + (rn() - 0.5) * r * 1.5,
            y + 0.6 + rn() * 1.2,
            z + (rn() - 0.5) * r * 1.5,
          ],
          0.015,
          3,
          { noAO: true },
        );
    if (o.col)
      S.col(
        x - r * 0.5,
        y,
        z - r * 0.5,
        x + r * 0.5,
        y + (o.colH || 0.4),
        z + r * 0.5,
        { surface: "rubble" },
      );
  };
  /** Paper / debris drift on a floor. */
  D.papers = function (b, x, y, z, r, n) {
    const rn = P.rng(x * 3.3 + z * 1.7);
    for (let i = 0; i < (n || 12); i++) {
      const a = rn() * TAU,
        d = Math.sqrt(rn()) * r;
      b.box(
        "paper",
        x + Math.cos(a) * d - 0.12,
        y + 0.005 + rn() * 0.01,
        z + Math.sin(a) * d - 0.16,
        x + Math.cos(a) * d + 0.12,
        y + 0.01 + rn() * 0.01,
        z + Math.sin(a) * d + 0.16,
        { ry: rn() * 3, seg: false, noAO: true, grime: 0.6 },
      );
    }
  };
  D.shards = function (b, x, y, z, r, n) {
    const rn = P.rng(x * 9.1 + z * 4.3);
    for (let i = 0; i < (n || 10); i++) {
      const a = rn() * TAU,
        d = Math.sqrt(rn()) * r,
        s = 0.05 + rn() * 0.14;
      const g = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(s, 0, s * 0.3),
        new THREE.Vector3(s * 0.2, 0, s),
      ]);
      g.setIndex([0, 2, 1]);
      g.computeVertexNormals();
      b.geo(
        "glass",
        g,
        P.m4(x + Math.cos(a) * d, y + 0.01, z + Math.sin(a) * d, rn() * TAU),
        { noAO: true },
      );
    }
  };
  /** Wall lamp / sconce (visual + baked light + glow). */
  D.sconce = function (S, x, y, z, ry, o) {
    o = o || {};
    const M = P.m4(x, y, z, ry);
    S.b.geo(
      "gold",
      new THREE.BoxGeometry(0.12, 0.25, 0.04).translate(0, 0, 0.02),
      M,
      { noAO: true },
    );
    S.b.geo(
      "gold",
      new THREE.CylinderGeometry(0.015, 0.015, 0.2, 4)
        .rotateX(HP)
        .translate(0, 0, 0.12),
      M,
      { noAO: true },
    );
    S.b.geo(
      o.dark ? "glass_dark" : "lamp_dim",
      new THREE.CylinderGeometry(0.06, 0.1, 0.16, 8, 1, true).translate(
        0,
        0.08,
        0.22,
      ),
      M,
      { noAO: true },
    );
    if (!o.dark) {
      const p = new THREE.Vector3(0, 0.1, 0.25).applyMatrix4(M);
      S.light(p.x, p.y, p.z, o.color || 0xffc880, o.r || 5, o.i || 0.7);
      if (o.glow !== false)
        S.glow(p.x, p.y, p.z, o.color || 0xffc880, o.size || 0.45);
    }
  };
  /** Candles cluster (light + glow). */
  D.candles = function (S, x, y, z, n, o) {
    o = o || {};
    const rn = P.rng(x * 5 + z * 7);
    for (let i = 0; i < (n || 3); i++) {
      const px = x + (rn() - 0.5) * 0.3,
        pz = z + (rn() - 0.5) * 0.3,
        h = 0.08 + rn() * 0.14;
      S.b.cyl("paint_cream", px, y, pz, 0.025, 0.028, h, 6, { noAO: true });
      S.b.cyl("candle", px, y + h, pz, 0.006, 0.014, 0.05, 4, { noAO: true });
    }
    S.light(x, y + 0.3, z, 0xffb060, o.r || 4.5, o.i || 0.8);
    S.glow(x, y + 0.2, z, 0xffa850, o.size || 0.5);
  };
  /**
   * Exit door set flush on a wall (round 2 door pass: every street exit must read as a door from across the room):
   * frame, double leaves with wired-glass lights and push bars, and a glowing red EXIT box sign above it (good
   * interiors always mark the way out). (x, y, z) = floor centre of the doorway on the wall face, ry = rotation.y of the
   * face (0 → faces +z). o: {leaf, frame, w, h, text, sub, noSign, noLeaves}.
   */
  D.exitDoor = function (S, x, y, z, ry, o) {
    o = o || {};
    const b = S.b,
      M = P.m4(x, y, z, ry),
      w = o.w || 2.4,
      h = o.h || 2.8,
      fk = o.frame || "wood_dark",
      lk = o.leaf || "wood_dark";
    const hw = w / 2;
    for (const s of [-1, 1])
      b.geo(
        fk,
        new THREE.BoxGeometry(0.16, h + 0.16, 0.2).translate(
          s * (hw + 0.08),
          (h + 0.16) / 2,
          0.06,
        ),
        M,
        { noAO: true },
      );
    b.geo(
      fk,
      new THREE.BoxGeometry(w + 0.32, 0.2, 0.22).translate(0, h + 0.1, 0.06),
      M,
      { noAO: true },
    );
    if (!o.noLeaves) {
      for (const s of [-1, 1]) {
        const cx = (s * hw) / 2;
        b.geo(
          lk,
          new THREE.BoxGeometry(hw - 0.03, h, 0.06).translate(cx, h / 2, 0.02),
          M,
          { noAO: true, grime: 0.5 },
        );
        b.geo(
          "glass_dark",
          new THREE.BoxGeometry(hw * 0.5, h * 0.3, 0.02).translate(
            cx,
            h * 0.62,
            0.06,
          ),
          M,
          { noAO: true },
        );
        b.geo(
          "chrome",
          new THREE.BoxGeometry(hw * 0.78, 0.05, 0.05).translate(cx, 1.02, 0.1),
          M,
          { noAO: true },
        );
        for (const t of [-1, 1])
          b.geo(
            "chrome",
            new THREE.BoxGeometry(0.04, 0.05, 0.08).translate(
              cx + t * hw * 0.37,
              1.02,
              0.07,
            ),
            M,
            { noAO: true },
          );
        b.geo(
          "metal",
          new THREE.BoxGeometry(hw - 0.08, 0.22, 0.012).translate(
            cx,
            0.15,
            0.056,
          ),
          M,
          { noAO: true },
        ); // kick plate
      }
    }
    if (o.noSign) return;
    const sy = o.signY || h + 0.46;
    b.geo(
      "paint_black",
      new THREE.BoxGeometry(0.95, 0.32, 0.09).translate(0, sy, 0.08),
      M,
      { noAO: true },
    );
    const key =
      "exit_" +
      (o.text || "EXIT").replace(/\W+/g, "_") +
      "_" +
      (o.sub || "").replace(/\W+/g, "_");
    const mat = P.texMat(
      key,
      P.signTex(
        key,
        o.sub ? [o.text || "EXIT", o.sub] : [o.text || "EXIT"],
        "neon",
        512,
        176,
        { fg: "#ff4a3a" },
      ),
      { emissive: 1.5 },
    );
    const p = new THREE.Vector3(0, sy, 0.13).applyMatrix4(M);
    b.quad(mat, p.x, p.y, p.z, 0.88, 0.28, { ry });
    const q = new THREE.Vector3(0, sy - 0.16, 0.7).applyMatrix4(M);
    S.light(q.x, q.y, q.z, 0xff4030, 4, 0.45);
    S.glow(p.x, p.y, p.z, 0xff4a3a, 0.55);
  };
  /** Wall-mounted exhibit / info label (brass plaque) facing ry. */
  D.label = function (b, key, lines, x, y, z, w, h, ry, style) {
    const k = P.texMat(
      "lbl_" + key,
      P.signTex(
        "lbl_" + key,
        lines,
        style || "label",
        512,
        Math.round((512 * h) / w),
      ),
      { rough: 0.7 },
    );
    b.quad(k, x, y, z, w, h, { ry });
  };
