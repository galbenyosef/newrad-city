// play-inline-204 06 — opts
// Lines 1144-1259 of readable/play-inline-204.pretty.js (statement-aligned).
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
  /**
   * Live flames (G.fx.fire: flame billboards, embers, crackle, optional flickering pool light) for hearths,
   * cook-fires and burning barrels. Created at initDone; the static 'fire' geometry stays as the ember bed.
   * PF.fires (pushed by PF.barrel({fire:true})) is consumed here too.
   */
  PF.fireQ = [];
  PF.fireAt = function (pos, scale, opts) {
    PF.fireQ.push({
      pos: pos.clone ? pos.clone() : V3(pos.x, pos.y, pos.z),
      scale: scale || 0.5,
      opts: opts || {},
    });
  };
  PF.startFires = function () {
    if (!PF.live("fx") || typeof G.fx.fire !== "function") return;
    for (const p of (PF.fires || []).splice(0))
      PF.fireQ.push({ pos: p.clone().setY(p.y - 0.15), scale: 0.45, opts: {} });
    for (const f of PF.fireQ.splice(0))
      PF.safe("fire", () =>
        G.fx.fire(f.pos, f.scale, Object.assign({ lod: 90 }, f.opts)),
      );
  };
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
