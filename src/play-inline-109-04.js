// play-inline-109 04 — hip
// Lines 684-1000 of readable/play-inline-109.pretty.js (statement-aligned).
  P.car = function (b, x, z, yaw, o) {
    o = o || {};
    const r = K.rng(o.seed || x * 23 + z * 29);
    const f = frame(x, 0, z, yaw);
    const paints = [0x7a9aa0, 0xb04a3a, 0xd8c8a0, 0x4a6a4a, 0x2a3a5a, 0xc89a40];
    const tint = o.tint || paints[Math.floor(r() * paints.length)];
    const y0 = o.flipped ? 0 : 0.3;
    // body
    const bp = f.p(0, 0, 0);
    b.geo("metal", T.sphere, {
      x: bp[0],
      y: y0 + 0.45,
      z: bp[2],
      ry: yaw,
      sx: 0.95,
      sy: 0.42,
      sz: 2.4,
      tint,
      grime: 0.8,
    });
    b.box("metal", bp[0], y0 + 0.2, bp[2], 1.9, 0.5, 4.2, {
      yaw,
      tint,
      grime: 0.8,
    });
    // cabin
    const cp = f.p(0, 0, -0.2);
    b.geo("metal", T.sphere, {
      x: cp[0],
      y: y0 + 0.8,
      z: cp[2],
      ry: yaw,
      sx: 0.8,
      sy: 0.45,
      sz: 1.2,
      tint,
      grime: 0.8,
    });
    b.geo("glass_broken", T.sphere, {
      x: cp[0],
      y: y0 + 0.82,
      z: cp[2],
      ry: yaw,
      sx: 0.81,
      sy: 0.38,
      sz: 1.0,
    });
    // fins
    for (const s of [-1, 1]) {
      const fp = f.p(s * 0.8, 0, -1.9);
      b.geo("metal", T.box, {
        x: fp[0],
        y: y0 + 0.65,
        z: fp[2],
        ry: yaw,
        rx: -0.4,
        sx: 0.06,
        sy: 0.4,
        sz: 0.8,
        tint,
        grime: 0.8,
      });
    }
    // chrome bumpers
    for (const s of [-1, 1]) {
      const p = f.p(0, 0, s * 2.12);
      b.box("chrome", p[0], y0 + 0.05, p[2], 1.9, 0.18, 0.12, {
        yaw,
        grime: 0.6,
      });
    }
    // wheels (some missing)
    for (const sx of [-1, 1])
      for (const sz of [-1.3, 1.3]) {
        if (r() < 0.25) continue;
        const p = f.p(sx * 0.9, 0, sz);
        b.geo("rubber", T.cyl12, {
          x: p[0],
          y: 0.32,
          z: p[2],
          ry: yaw,
          rz: Math.PI / 2,
          sx: 0.32,
          sy: 0.22,
          sz: 0.32,
          grime: 0,
        });
      }
    if (o.collide !== false)
      K.colRot(x, z, 2.0, 4.4, 0, 1.4, yaw, { surface: "metal", tag: "cover" });
    return b;
  };
  P.spike = function (b, x, z, h, o) {
    o = o || {};
    b.beam("wood_rotten", x, 0, z, x + 0.1, h, z + 0.05, 0.1);
    if (o.skull !== false)
      b.geo("bone", T.sphereLo, {
        x: x + 0.1,
        y: h + 0.1,
        z: z + 0.05,
        sx: 0.12,
        sy: 0.14,
        sz: 0.15,
      });
    if (o.gore)
      b.geo("flesh", T.dodeca, { x: x + 0.05, y: h - 0.4, z, s: 0.18 });
    return b;
  };
  /** Hanging gore sack (Brute larder) under a chain from `top`. */
  P.meatBag = function (b, x, top, z, o) {
    o = o || {};
    const len = o.len || 1.2;
    b.beam("rust", x, top, z, x, top - len, z, 0.03);
    b.geo("flesh", T.sphere, {
      x,
      y: top - len - 0.5,
      z,
      sx: 0.38,
      sy: 0.6,
      sz: 0.34,
      ry: x,
      grime: 0.4,
    });
    b.geo("fabric", T.sphereLo, {
      x: x + 0.05,
      y: top - len - 0.3,
      z: z + 0.03,
      sx: 0.36,
      sy: 0.4,
      sz: 0.36,
      tint: 0x7a4a3a,
      grime: 0.6,
    });
    return b;
  };
  P.cage = function (b, x, z, w, h, o) {
    o = o || {};
    const y0 = o.y || 0;
    b.box("rust", x, y0, z, w, 0.1, w, { grime: 0.6 });
    b.box("rust", x, y0 + h, z, w, 0.08, w, { grime: 0.6 });
    for (let i = 0; i <= 6; i++)
      for (const side of [0, 1, 2, 3]) {
        const t = -w / 2 + (w * i) / 6;
        const px = side < 2 ? x + t : x + (side === 2 ? -w / 2 : w / 2),
          pz = side < 2 ? z + (side === 0 ? -w / 2 : w / 2) : z + t;
        b.beam("rust", px, y0, pz, px, y0 + h, pz, 0.04);
      }
    if (o.hollow) {
      // a cage somebody is locked IN: four thin barred walls (not a solid block around the prisoner), tagged like an
      // interactable's own collider so the bars stop you but you can still talk to whoever is inside
      const t = 0.06,
        hw = w / 2,
        co = { surface: "metal", tag: "interactable_self", walkable: false };
      K.colBox(x - hw, y0, z - hw, x + hw, y0 + h, z - hw + t, co);
      K.colBox(x - hw, y0, z + hw - t, x + hw, y0 + h, z + hw, co);
      K.colBox(x - hw, y0, z - hw, x - hw + t, y0 + h, z + hw, co);
      K.colBox(x + hw - t, y0, z - hw, x + hw, y0 + h, z + hw, co);
    } else if (o.collide !== false)
      K.colBox(x - w / 2, y0, z - w / 2, x + w / 2, y0 + h, z + w / 2, {
        surface: "metal",
      });
    return b;
  };

  // ------------------------------------------------------------------
  // Statuary
  // ------------------------------------------------------------------
  /**
   * Stylised human statue. pose: 'stand'|'raised'|'seated'|'flying'|'atlas'|'robed'|'reclined'.
   * Local frame: faces +z, height ≈ 2 m × s.
   */
  P.figure = function (b, mat, x, y, z, yaw, s, pose, o) {
    o = o || {};
    const f = frame(x, y, z, yaw, s);
    const limb = (a, c, r) => {
      const A = f.p(a[0], a[1], a[2]),
        C = f.p(c[0], c[1], c[2]);
      b.beam(mat, A[0], A[1], A[2], C[0], C[1], C[2], r * 2 * s, {
        round: 8,
        grime: o.grime,
      });
    };
    const blob = (p, sx, sy, sz, rx) => {
      const P0 = f.p(p[0], p[1], p[2]);
      b.geo(mat, T.sphere, {
        x: P0[0],
        y: P0[1],
        z: P0[2],
        ry: yaw,
        rx: rx || 0,
        sx: sx * s,
        sy: sy * s,
        sz: sz * s,
        grime: o.grime,
      });
    };
    let hip = [0, 0.95, 0],
      chest = [0, 1.35, 0],
      head = [0, 1.75, 0.02];
    let lean = 0;
    if (pose === "flying") {
      hip = [0, 0.9, -0.2];
      chest = [0, 1.3, 0.15];
      head = [0, 1.62, 0.35];
      lean = 0.6;
    }
    if (pose === "seated") {
      hip = [0, 0.55, -0.1];
      chest = [0, 0.98, -0.1];
      head = [0, 1.38, -0.08];
    }
    if (pose === "atlas") {
      hip = [0, 0.7, -0.1];
      chest = [0, 1.1, 0.05];
      head = [0, 1.42, 0.22];
      lean = 0.35;
    }
    if (pose === "reclined") {
      hip = [0, 0.35, -0.4];
      chest = [0, 0.6, 0.1];
      head = [0, 0.85, 0.45];
      lean = 1.0;
    }
    blob(chest, 0.23, 0.3, 0.15, lean);
    blob(hip, 0.2, 0.16, 0.14, lean * 0.5);
    limb(hip, chest, 0.14);
    blob(head, 0.12, 0.14, 0.13);
    limb(
      [chest[0], chest[1] + 0.2, chest[2]],
      [head[0], head[1] - 0.12, head[2]],
      0.055,
    );
    const sh = (sx) => [sx * 0.22, chest[1] + 0.16, chest[2]];
    // legs
    if (pose === "seated") {
      for (const sx of [-1, 1]) {
        limb(
          [sx * 0.11, hip[1], hip[2]],
          [sx * 0.13, hip[1] + 0.02, 0.4],
          0.085,
        );
        limb([sx * 0.13, hip[1] + 0.02, 0.4], [sx * 0.14, 0.05, 0.45], 0.07);
      }
    } else if (pose === "flying") {
      limb([-0.1, hip[1], hip[2]], [-0.14, 0.55, -0.55], 0.085);
      limb([-0.14, 0.55, -0.55], [-0.12, 0.25, -0.95], 0.07);
      limb([0.1, hip[1], hip[2]], [0.16, 0.35, -0.05], 0.085);
      limb([0.16, 0.35, -0.05], [0.14, 0.05, -0.5], 0.07);
    } else if (pose === "atlas") {
      limb([-0.1, hip[1], hip[2]], [-0.16, 0.5, 0.4], 0.09);
      limb([-0.16, 0.5, 0.4], [-0.16, 0.04, 0.45], 0.075);
      limb([0.1, hip[1], hip[2]], [0.16, 0.08, -0.25], 0.09);
      limb([0.16, 0.08, -0.25], [0.16, 0.06, -0.75], 0.075);
    } else if (pose === "reclined") {
      for (const sx of [-1, 1]) {
        limb([sx * 0.1, hip[1], hip[2]], [sx * 0.14, 0.2, -0.95], 0.085);
        limb([sx * 0.14, 0.2, -0.95], [sx * 0.14, 0.12, -1.5], 0.07);
      }
    } else {
      for (const sx of [-1, 1]) {
        limb([sx * 0.1, hip[1], 0], [sx * 0.12, 0.5, 0.02], 0.085);
        limb([sx * 0.12, 0.5, 0.02], [sx * 0.12, 0.06, 0], 0.07);
        blob([sx * 0.12, 0.04, 0.06], 0.06, 0.04, 0.12);
      }
    }
    if (pose === "robed" || o.robe) {
      const rp = f.p(0, 0, 0);
      b.geo(mat, T.cone8, {
        x: rp[0],
        y: y + 0.62 * s,
        z: rp[2],
        ry: yaw,
        sx: 0.36 * s,
        sy: 1.25 * s,
        sz: 0.3 * s,
        rx: Math.PI,
        grime: o.grime,
      });
    }
    // arms
    const arm = (sx, el, hand) => {
      limb(sh(sx), el, 0.06);
      limb(el, hand, 0.05);
      blob(hand, 0.05, 0.06, 0.05);
    };
    if (pose === "raised") {
      arm(1, [0.3, 1.8, 0.05], [0.32, 2.2, 0.08]);
      arm(-1, [-0.3, 1.1, 0.05], [-0.28, 0.82, 0.12]);
    } else if (pose === "flying") {
      arm(1, [0.35, 1.7, 0.4], [0.4, 2.05, 0.6]);
      arm(-1, [-0.4, 1.25, 0.2], [-0.62, 1.1, 0.0]);
    } else if (pose === "atlas") {
      arm(1, [0.42, 1.55, 0.05], [0.4, 1.95, 0.0]);
      arm(-1, [-0.42, 1.55, 0.05], [-0.4, 1.95, 0.0]);
    } else if (pose === "seated") {
      arm(1, [0.3, 0.8, 0.05], [0.3, 0.62, 0.3]);
      arm(-1, [-0.3, 0.85, 0.0], [-0.34, 0.65, 0.25]);
    } else if (pose === "reclined") {
      arm(1, [0.35, 0.45, 0.2], [0.4, 0.3, 0.5]);
      arm(-1, [-0.35, 0.6, 0.3], [-0.3, 0.9, 0.55]);
    } else {
      arm(1, [0.3, 1.12, 0.02], [0.32, 0.82, 0.06]);
      arm(-1, [-0.3, 1.12, 0.02], [-0.32, 0.82, 0.06]);
    }
    // wings on helmet (Mercury)
    if (o.wingedHat)
      for (const sx of [-1, 1]) {
        const a = f.p(sx * 0.1, head[1] + 0.05, head[2]),
          c = f.p(sx * 0.3, head[1] + 0.22, head[2] - 0.12);
        b.beam(mat, a[0], a[1], a[2], c[0], c[1], c[2], 0.03 * s, {
          d: 0.14 * s,
        });
      }
    return f;
  };

  /** Reclining library lion on its own (no pedestal). Faces local +z. */
