// play-inline-356 05 — ctx
// Lines 812-1135 of readable/play-inline-356.pretty.js (statement-aligned).
  PF.stainedTex = function (variant) {
    return PF.canvasTex(
      "pws_stained_" + variant,
      256,
      512,
      (ctx, w, h) => {
        const r = PF.rng(900 + variant * 31);
        const pal = [
          ["#1a3a8a", "#2a5ac0", "#b02820", "#e0b030", "#2a8a4a", "#6a2a8a"],
          ["#8a1a1a", "#c03020", "#e0a020", "#1a4a9a", "#e8d8a0", "#3a7a3a"],
          ["#1a4a6a", "#3a8aa0", "#d0a030", "#8a2a4a", "#2a2a7a", "#c8c060"],
        ][variant % 3];
        ctx.fillStyle = "#101010";
        ctx.fillRect(0, 0, w, h);
        // random quarry panes
        const cell = 22;
        for (let y = 0; y < h; y += cell)
          for (let x = 0; x < w; x += cell) {
            const c = pal[Math.floor(r() * pal.length)];
            ctx.fillStyle = c;
            ctx.globalAlpha = 0.55 + r() * 0.45;
            ctx.fillRect(x + 2, y + 2, cell - 4, cell - 4);
          }
        ctx.globalAlpha = 1;
        // central figure medallions (abstract saints / symbols)
        const meds = [
          [w / 2, h * 0.22, 70],
          [w / 2, h * 0.55, 80],
          [w / 2, h * 0.83, 60],
        ];
        meds.forEach(([cx, cy, rr], i) => {
          ctx.fillStyle = "#0c0c0c";
          ctx.beginPath();
          ctx.arc(cx, cy, rr + 6, 0, TAU);
          ctx.fill();
          const g = ctx.createRadialGradient(cx, cy - rr * 0.3, 4, cx, cy, rr);
          g.addColorStop(0, pal[(i + 3) % pal.length]);
          g.addColorStop(1, pal[i % pal.length]);
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(cx, cy, rr, 0, TAU);
          ctx.fill();
          // figure: halo + robe silhouette
          ctx.fillStyle = "#e8c860";
          ctx.beginPath();
          ctx.arc(cx, cy - rr * 0.45, rr * 0.28, 0, TAU);
          ctx.fill();
          ctx.fillStyle = "#f0e0c0";
          ctx.beginPath();
          ctx.arc(cx, cy - rr * 0.45, rr * 0.16, 0, TAU);
          ctx.fill();
          ctx.fillStyle = pal[(i + 1) % pal.length];
          ctx.beginPath();
          ctx.moveTo(cx - rr * 0.45, cy + rr * 0.8);
          ctx.quadraticCurveTo(
            cx,
            cy - rr * 0.4,
            cx + rr * 0.45,
            cy + rr * 0.8,
          );
          ctx.fill();
          ctx.strokeStyle = "#0a0a0a";
          ctx.lineWidth = 4;
          for (let k = 0; k < 6; k++) {
            const a = (k / 6) * TAU;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
            ctx.stroke();
          }
        });
        // lead cames
        ctx.strokeStyle = "#080808";
        ctx.lineWidth = 3;
        for (let y = 0; y < h; y += cell) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }
        for (let x = 0; x < w; x += cell) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        // grime and broken panes
        for (let i = 0; i < 40; i++) {
          ctx.fillStyle = "rgba(20,16,10," + (0.1 + r() * 0.3) + ")";
          ctx.beginPath();
          ctx.ellipse(
            r() * w,
            r() * h,
            10 + r() * 40,
            8 + r() * 30,
            r() * 3,
            0,
            TAU,
          );
          ctx.fill();
        }
        for (let i = 0; i < 7; i++) {
          ctx.fillStyle = "#050505";
          const x = Math.floor((r() * w) / cell) * cell,
            y = Math.floor((r() * h) / cell) * cell;
          ctx.fillRect(x, y, cell, cell);
        }
      },
      { clamp: true },
    );
  };
  /** Material key for a stained-glass texture (emissive so it glows in the dark nave). */
  PF.stainedKey = function (variant, glow) {
    return PF.texMat(
      "stained_" + variant + "_" + (glow || 1),
      PF.stainedTex(variant),
      {
        emissive: glow || 1.0,
        rough: 0.4,
        noShadow: true,
        side: THREE.DoubleSide,
      },
    );
  };
  /** A pointed-arch (lancet) shape in XY: width w, height h, spring at h - w*k. */
  PF.lancetShape = function (w, h, k) {
    const sh = new THREE.Shape();
    const spring = h - w * (k || 0.85);
    sh.moveTo(-w / 2, 0);
    sh.lineTo(w / 2, 0);
    sh.lineTo(w / 2, spring);
    sh.quadraticCurveTo(w / 2, h - w * 0.12, 0, h);
    sh.quadraticCurveTo(-w / 2, h - w * 0.12, -w / 2, spring);
    sh.closePath();
    return sh;
  };
  /** Shape geometry with uvs normalised to 0..1 over its bounding box. */
  PF.shapeGeo = function (shape, segs) {
    const g = new THREE.ShapeGeometry(shape, segs || 6);
    g.computeBoundingBox();
    const bb = g.boundingBox,
      uv = g.attributes.uv,
      p = g.attributes.position;
    for (let i = 0; i < p.count; i++)
      uv.setXY(
        i,
        (p.getX(i) - bb.min.x) / (bb.max.x - bb.min.x || 1),
        (p.getY(i) - bb.min.y) / (bb.max.y - bb.min.y || 1),
      );
    return g;
  };
  /**
   * Pointed-arch opening frame (voussoirs) + optional glazing on a wall.
   * (x,y,z) = bottom centre on the wall face, ry = facing, w/h opening, depth = reveal depth.
   * opts: {glass: materialKey, frame: key, frameW, sill}
   */
  PF.lancetWindow = function (b, x, y, z, ry, w, h, opts) {
    opts = opts || {};
    const fk = opts.frame || "limestone";
    const fw = opts.frameW || 0.22;
    const c = Math.cos(ry),
      s = Math.sin(ry);
    const out = opts.out === undefined ? 0.05 : opts.out;
    if (opts.glass) {
      const g = PF.shapeGeo(PF.lancetShape(w, h, opts.k), 8);
      b.add(opts.glass, g, {
        m: PF.m4(x - s * 0.02, y, z - c * 0.02, ry),
        uv: "keep",
        grime: 0.05,
        noAO: true,
      });
    }
    // frame: two jambs + curved arch approximated by segments
    const spring = h - w * (opts.k || 0.85);
    const P = (lx, ly, lz) =>
      new THREE.Vector3(x + lx * c + lz * s, y + ly, z - lx * s + lz * c);
    for (const sg of [-1, 1])
      b.beam(
        fk,
        P(sg * (w / 2 + fw / 2), 0, out),
        P(sg * (w / 2 + fw / 2), spring, out),
        fw,
        fw,
        { twist: ry, grime: 0.4 },
      );
    const N = 6;
    for (const sg of [-1, 1]) {
      let prev = null;
      for (let i = 0; i <= N; i++) {
        const t = i / N;
        // quadratic from (±w/2, spring) via (±w/2, h - w*0.12) to (0, h)
        const ax = sg * (w / 2 + fw / 2),
          ay = spring,
          bx = sg * (w / 2 + fw / 2),
          by = h - w * 0.12 + fw * 0.4,
          cx = 0,
          cy = h + fw * 0.5;
        const px = (1 - t) * (1 - t) * ax + 2 * (1 - t) * t * bx + t * t * cx,
          py = (1 - t) * (1 - t) * ay + 2 * (1 - t) * t * by + t * t * cy;
        const cur = P(px, py, out);
        if (prev) b.beam(fk, prev, cur, fw, fw, { grime: 0.4 });
        prev = cur;
      }
    }
    if (opts.mullion)
      b.beam(
        fk,
        P(0, 0, out * 0.5),
        P(0, spring + (h - spring) * 0.6, out * 0.5),
        0.08,
        0.08,
        {},
      );
    if (opts.sill !== false)
      b.box(
        fk,
        x + s * out,
        y - 0.18,
        z + c * out,
        w + fw * 2 + 0.2,
        0.18,
        0.35,
        { ry, seg: false, grime: 0.4 },
      );
  };
  /**
   * Axis-aligned wall with rectangular openings at any height (+ colliders).
   * axis 'x': runs along x from a0..a1, occupying z f0..f1. axis 'z': runs along z (a0..a1), occupying x f0..f1.
   * gaps: [{c, w, y0, h}] — c/w along the run, y0 absolute bottom. opts: {grime, noCollide, surface}
   */
  PF.wall = function (b, key, axis, a0, a1, f0, f1, y0, y1, gaps, opts) {
    opts = opts || {};
    gaps = gaps || [];
    const cuts = [a0, a1];
    for (const g of gaps) {
      cuts.push(
        Math.max(a0, Math.min(a1, g.c - g.w / 2)),
        Math.max(a0, Math.min(a1, g.c + g.w / 2)),
      );
    }
    cuts.sort((p, q) => p - q);
    for (let i = 0; i < cuts.length - 1; i++) {
      const p = cuts[i],
        q = cuts[i + 1];
      if (q - p < 0.02) continue;
      const mid = (p + q) / 2;
      const holes = gaps
        .filter((g) => mid > g.c - g.w / 2 && mid < g.c + g.w / 2)
        .map((g) => [g.y0, g.y0 + g.h])
        .sort((u, v) => u[0] - v[0]);
      let y = y0;
      const spans = [];
      for (const h of holes) {
        if (h[0] > y + 0.02) spans.push([y, Math.min(h[0], y1)]);
        y = Math.max(y, h[1]);
      }
      if (y < y1 - 0.02) spans.push([y, y1]);
      for (const [ya, yb] of spans) {
        if (yb - ya < 0.02) continue;
        if (axis === "x") {
          b.boxMM(key, p, ya, f0, q, yb, f1, { grime: opts.grime, segLen: 4 });
          if (!opts.noCollide)
            PF.colMM(p, ya, f0, q, yb, f1, {
              walkable: false,
              surface: opts.surface,
            });
        } else {
          b.boxMM(key, f0, ya, p, f1, yb, q, { grime: opts.grime, segLen: 4 });
          if (!opts.noCollide)
            PF.colMM(f0, ya, p, f1, yb, q, {
              walkable: false,
              surface: opts.surface,
            });
        }
      }
    }
  };
  /** Standalone mesh with a shared module material (adds the white vertex colour the materials expect). */
  PF.mesh = function (key, geo) {
    const n = geo.attributes.position.count;
    const c = new Float32Array(n * 3).fill(1);
    geo.setAttribute("color", new THREE.BufferAttribute(c, 3));
    const m = new THREE.Mesh(geo, PF.mat(key));
    m.castShadow = false;
    m.receiveShadow = true;
    return m;
  };
  /** Readable plaque: interactable that shows text. */
  PF.readable = function (pos, title, text, verb) {
    PF.use({
      pos,
      radius: 0.6,
      range: 2.6,
      label: title,
      verb: verb || "Read",
      onInteract() {
        G.notify(title + " — " + text, { duration: 10 });
        PF.sfx("ui_click");
      },
    });
  };
  /** Candle cluster (emissive flames + one glow). */
  PF.candles = function (b, x, y, z, n, seed, parent) {
    const r = PF.rng(seed || x * 3 + z * 5);
    for (let i = 0; i < n; i++) {
      const a = r() * TAU,
        d = r() * 0.18,
        hh = 0.08 + r() * 0.22;
      const cx = x + Math.cos(a) * d,
        cz = z + Math.sin(a) * d;
      b.cyl("candle", cx, y, cz, 0.022, 0.026, hh, 6, { hSeg: 1, grime: 0.2 });
      b.sphere("flame", cx, y + hh + 0.03, cz, 0.018, {
        ws: 4,
        hs: 3,
        sy: 2,
        noAO: true,
        grime: 0,
      });
    }
    PF.glow(V3(x, y + 0.3, z), 0xffb060, 0.9, parent, {
      intensity: 1.2,
      flicker: 0.25,
    });
  };
