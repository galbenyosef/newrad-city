// play-inline-357 06 — opts
// Lines 1223-1558 of readable/play-inline-357.pretty.js (statement-aligned).
  PF.note = function (id, name, title, text, extra) {
    return PF.item(
      Object.assign(
        { id, type: "note", name, title, text, weight: 0, value: 0 },
        extra || {},
      ),
    );
  };
  PF.tapeReel = function (id, name, title, text, extra) {
    return PF.item(
      Object.assign(
        { id, type: "tape", name, title, text, weight: 0, value: 0 },
        extra || {},
      ),
    );
  };

  /** Semicircular-arch opening: voussoir ring + recessed pane (+ optional sash). (x,y,z) bottom centre on the wall. */
  PF.archBay = function (b, x, y, z, ry, w, h, opts) {
    opts = opts || {};
    const c = Math.cos(ry),
      s = Math.sin(ry);
    const P = (lx, ly, lz) =>
      V3(x + lx * c + lz * s, y + ly, z - lx * s + lz * c);
    const springY = h - w / 2;
    const sh = new THREE.Shape();
    sh.moveTo(-w / 2, 0);
    sh.lineTo(w / 2, 0);
    sh.lineTo(w / 2, springY);
    sh.absarc(0, springY, w / 2, 0, PI, false);
    sh.lineTo(-w / 2, 0);
    const g = PF.shapeGeo(sh, 10);
    b.add(opts.pane || "glass_dark", g, {
      m: PF.m4(x - s * 0.02, y, z - c * 0.02, ry),
      uv: opts.paneUV || (opts.paneRect ? "keep" : "box"),
      uvRect: opts.paneRect,
      grime: 0.1,
      noAO: true,
    });
    const N = opts.n || 11,
      rw = opts.ringW || 0.3,
      R = w / 2 + rw * 0.55;
    // voussoirs: close the joints along the arc (thin rings used to read as separate 'teeth'); thin gilt/iron
    // rings get a proportionally shallower radial depth
    const tang = Math.max(rw, ((PI * R) / N) * 0.94),
      radial = rw >= 0.3 ? 0.46 : Math.max(0.22, rw * 1.4);
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * PI;
      const p = P(Math.cos(a) * R, springY + Math.sin(a) * R, 0.06);
      b.add(opts.ring || "lime_ws", new THREE.BoxGeometry(tang, radial, 0.3), {
        m: PF.m4(p.x, p.y, p.z, ry, 0, a - HP),
        grime: 0.5,
      });
    }
    if (opts.jambs)
      for (const sg of [-1, 1]) {
        const p = P(sg * (w / 2 + 0.15), 0, 0.06);
        b.box(opts.ring || "lime_ws", p.x, y, p.z, 0.3, springY, 0.3, {
          ry,
          seg: false,
          grime: 0.5,
        });
      }
    if (opts.key) {
      const p = P(0, h + 0.18, 0.1);
      b.add(opts.key, new THREE.BoxGeometry(0.4, 0.6, 0.34), {
        m: PF.m4(p.x, p.y, p.z, ry),
        grime: 0.4,
      });
    }
    if (opts.sash) {
      for (const k of [-1, 0, 1]) {
        const p = P((k * w) / 4, 0, 0.03);
        b.box(
          opts.sashKey || "iron",
          p.x,
          y,
          p.z,
          0.06,
          springY + (w / 2) * Math.sqrt(1 - (k / 2) * (k / 2)),
          0.05,
          { ry, seg: false },
        );
      }
      for (let k = 1; k <= 3; k++) {
        const p = P(0, (springY * k) / 3.2, 0.03);
        b.box(opts.sashKey || "iron", p.x, p.y, p.z, w, 0.05, 0.05, {
          ry,
          seg: false,
        });
      }
    }
  };
  /**
   * Classical window: pane + architrave frame + sill (+ optional cornice/pediment head, keystone, muntins).
   * (x,y,z) = bottom centre on the wall face; faces ry. opts: {pane, frame, head:'cornice'|'pediment'|'arch'|null, muntins, keystone, frameW}
   */
  PF.classicWindow = function (b, x, y, z, ry, w, h, opts) {
    opts = opts || {};
    const fk = opts.frame || "lime_ws",
      fw = opts.frameW || 0.18;
    const c = Math.cos(ry),
      s = Math.sin(ry);
    const P = (lx, ly, lz) =>
      V3(x + lx * c + lz * s, y + ly, z - lx * s + lz * c);
    const pane = opts.pane || "glass_dark";
    const p0 = P(0, h / 2, 0.01);
    b.quad(pane, p0.x, p0.y, p0.z, w, h, {
      ry,
      uv: "box",
      grime: 0.1,
      noAO: true,
    });
    for (const sg of [-1, 1]) {
      const p = P(sg * (w / 2 + fw / 2), 0, 0.06);
      b.box(fk, p.x, y, p.z, fw, h, 0.14, { ry, seg: false, grime: 0.45 });
    }
    {
      const p = P(0, 0, 0.06);
      b.box(fk, p.x, y + h, p.z, w + fw * 2, fw, 0.14, {
        ry,
        seg: false,
        grime: 0.45,
      });
    }
    {
      const p = P(0, 0, 0.1);
      b.box(fk, p.x, y - 0.16, p.z, w + fw * 2 + 0.2, 0.16, 0.3, {
        ry,
        seg: false,
        grime: 0.5,
      });
    }
    if (opts.muntins && pane !== "glass_broken" && pane !== "planks") {
      const mk = opts.muntinKey || "timber_white";
      const nx = opts.muntins[0],
        ny = opts.muntins[1];
      for (let i = 1; i < nx; i++) {
        const p = P(-w / 2 + (i * w) / nx, 0, 0.04);
        b.box(mk, p.x, y, p.z, 0.04, h, 0.04, { ry, seg: false, grime: 0.2 });
      }
      for (let j = 1; j < ny; j++) {
        const p = P(0, 0, 0.04);
        b.box(mk, p.x, y + (j * h) / ny - 0.02, p.z, w, 0.04, 0.04, {
          ry,
          seg: false,
          grime: 0.2,
        });
      }
    }
    const top = y + h + fw;
    if (opts.head === "cornice") {
      const p = P(0, 0, 0.14);
      b.box(fk, p.x, top + 0.05, p.z, w + fw * 2 + 0.4, 0.14, 0.34, {
        ry,
        seg: false,
        grime: 0.5,
      });
      const q = P(0, 0, 0.08);
      b.box(fk, q.x, top - 0.02, q.z, w + fw * 2 + 0.1, 0.3, 0.2, {
        ry,
        seg: false,
        grime: 0.5,
      });
    } else if (opts.head === "pediment") {
      const pw = w + fw * 2 + 0.4,
        ph = pw * 0.22;
      const sh = new THREE.Shape();
      sh.moveTo(-pw / 2, 0);
      sh.lineTo(pw / 2, 0);
      sh.lineTo(0, ph);
      sh.closePath();
      const g = new THREE.ExtrudeGeometry(sh, {
        depth: 0.3,
        bevelEnabled: false,
      });
      g.translate(0, 0, -0.05);
      const p = P(0, 0, 0);
      b.add(fk, g, { m: PF.m4(p.x, top + 0.05, p.z, ry), grime: 0.5 });
      const q = P(0, 0, 0.12);
      b.box(fk, q.x, top - 0.05, q.z, pw, 0.12, 0.3, { ry, seg: false });
    } else if (opts.head === "arch") {
      const N = 7,
        R = w / 2 + fw / 2;
      for (let i = 0; i <= N; i++) {
        const a = (i / N) * PI;
        const p = P(Math.cos(a) * R, h + Math.sin(a) * R * 0.5, 0.06);
        b.add(fk, new THREE.BoxGeometry(fw, 0.32, 0.16), {
          m: PF.m4(p.x, p.y, p.z, ry, 0, a - HP),
          grime: 0.4,
        });
      }
    }
    if (opts.keystone) {
      const p = P(0, 0, 0.12);
      b.box(fk, p.x, y + h - 0.1, p.z, 0.3, 0.44, 0.22, {
        ry,
        seg: false,
        grime: 0.4,
      });
    }
  };
  /** Corinthian column: base, fluted shaft, bell capital with two leaf rows and volutes, abacus. */
  PF.corinthian = function (b, key, x, y, z, h, r, opts) {
    opts = opts || {};
    const ck = opts.capKey || key;
    b.box(key, x, y, z, r * 2.7, r * 0.45, r * 2.7, { seg: false, grime: 0.5 });
    b.cyl(key, x, y + r * 0.45, z, r * 1.18, r * 1.3, r * 0.22, 16, {
      hSeg: 1,
    });
    b.cyl(key, x, y + r * 0.67, z, r * 1.05, r * 1.15, r * 0.2, 16, {
      hSeg: 1,
    });
    const capH = r * 2.2,
      shaftH = h - r * 0.87 - capH - r * 0.3;
    b.cyl(key, x, y + r * 0.87, z, r * 0.86, r, shaftH, opts.flutes || 20, {
      hSeg: Math.max(2, Math.round(shaftH / 3)),
      grime: 0.45,
    });
    const cy = y + r * 0.87 + shaftH;
    b.cyl(ck, x, cy, z, r * 1.25, r * 0.88, capH, 12, { hSeg: 1, grime: 0.4 });
    if (!opts.cheap) {
      for (let row = 0; row < 2; row++)
        for (let i = 0; i < 8; i++) {
          const a = ((i + row * 0.5) / 8) * TAU,
            rr = r * (0.95 + row * 0.12);
          b.add(ck, new THREE.SphereGeometry(r * 0.3, 5, 4), {
            m: PF.m4(
              x + Math.cos(a) * rr,
              cy + capH * (0.25 + row * 0.3),
              z + Math.sin(a) * rr,
              -a,
              0,
              0,
              0.7,
              1.4,
              0.55,
            ),
            grime: 0.4,
          });
        }
      for (let i = 0; i < 4; i++) {
        const a = PI / 4 + i * HP;
        b.sphere(
          ck,
          x + Math.cos(a) * r * 1.25,
          cy + capH * 0.85,
          z + Math.sin(a) * r * 1.25,
          r * 0.22,
          { ws: 6, hs: 4 },
        );
      }
    }
    b.box(ck, x, cy + capH, z, r * 2.8, r * 0.3, r * 2.8, {
      seg: false,
      grime: 0.4,
    });
    if (opts.collide !== false)
      PF.col(x, z, r * 2.2, r * 2.2, y, y + h, 0, { walkable: false });
  };
  /** Waterford-style crystal chandelier: brass stem, ring of arms with candle bulbs, tiers of crystal drops. */
  PF.chandelier = function (b, x, y, z, R, lit, parent, ceilY) {
    if (ceilY !== undefined)
      b.beam("brass_ws", V3(x, y + 0.9, z), V3(x, ceilY, z), 0.03, 0.03, {
        noAO: true,
      });
    b.lathe(
      "brass_ws",
      [
        [0.02, 0],
        [0.12, 0.1],
        [0.08, 0.4],
        [0.14, 0.6],
        [0.05, 0.9],
      ],
      8,
      x,
      y,
      z,
      { noAO: true, grime: 0.1 },
    );
    const arms = Math.max(6, Math.round(R * 10));
    for (let i = 0; i < arms; i++) {
      const a = (i / arms) * TAU,
        ax = x + Math.cos(a) * R,
        az = z + Math.sin(a) * R;
      b.beam(
        "brass_ws",
        V3(x, y + 0.25, z),
        V3(ax, y + 0.18, az),
        0.025,
        0.025,
        { noAO: true },
      );
      b.cyl("candle_ws", ax, y + 0.18, az, 0.025, 0.025, 0.12, 5, {
        hSeg: 1,
        noAO: true,
        grime: 0,
      });
      b.sphere(lit ? "bulb_ws" : "crystal", ax, y + 0.34, az, 0.04, {
        ws: 5,
        hs: 3,
        noAO: true,
        grime: 0,
      });
    }
    // crystal drops: two tiers of cones
    for (let t = 0; t < 2; t++) {
      const rr = R * (0.85 - t * 0.35),
        n = Math.round(rr * 16);
      for (let i = 0; i < n; i++) {
        const a = ((i + t * 0.5) / n) * TAU;
        b.cyl(
          "crystal",
          x + Math.cos(a) * rr,
          y - 0.16 - t * 0.22,
          z + Math.sin(a) * rr,
          0.001,
          0.035,
          0.18,
          4,
          { hSeg: 1, noAO: true, grime: 0 },
        );
      }
    }
    b.cyl("crystal", x, y - 0.5, z, 0.001, 0.12, 0.45, 6, {
      hSeg: 1,
      noAO: true,
      grime: 0,
    });
    if (lit)
      PF.glow(V3(x, y + 0.1, z), 0xffe0b0, R * 3.2, parent || null, {
        intensity: 1.1,
      });
  };
  /** Coffered ceiling grid between (x0,z0)-(x1,z1) at height y (underside): beams + recessed panels + rosettes. */
