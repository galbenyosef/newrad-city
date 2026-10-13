// play-inline-429 10 — yaw
// Lines 2891-3138 of readable/play-inline-429.pretty.js (statement-aligned).
  K.bed = function (b, x, y, z, yaw, o) {
    o = o || {};
    const w = o.w || 1.4,
      L = o.l || 2.0;
    b.box(o.frame || "black_iron", x, y, z, w, 0.35, L, { yaw });
    b.box(o.sheet || "cloth_white", x, y + 0.35, z, w - 0.06, 0.18, L - 0.06, {
      yaw,
      tint: o.tint || [0.7, 0.66, 0.58],
    });
    const c = Math.cos(yaw),
      s = Math.sin(yaw);
    b.box(
      o.frame || "black_iron",
      x + (L / 2) * s,
      y,
      z + (L / 2) * c,
      w,
      1.1,
      0.06,
      { yaw },
    );
    b.box(
      "cloth_white",
      x + (L / 2 - 0.3) * s,
      y + 0.53,
      z + (L / 2 - 0.3) * c,
      w * 0.7,
      0.12,
      0.35,
      { yaw, tint: [0.8, 0.78, 0.7] },
    );
    if (o.col !== false)
      b.ocol(x, z, w, L, y, y + 0.55, yaw, {
        tag: "furniture",
        surface: "fabric",
      });
  };
  /** Shelf unit against a wall, facing (nx,nz). Items: cans/jars/bottles. */
  K.shelf = function (b, x, y, z, yaw, w, o) {
    o = o || {};
    const h = o.h || 2.0,
      d = o.d || 0.4,
      mat = o.mat || "metal",
      r = K.rng(o.seed || (x * 13 + z * 7) | 0);
    const c = Math.cos(yaw),
      s = Math.sin(yaw);
    for (const e of [-1, 1])
      b.box(mat, x + e * (w / 2) * c, y, z - e * (w / 2) * s, 0.04, h, d, {
        yaw,
        tint: o.tint,
      });
    const levels = o.levels || 4;
    for (let k = 0; k < levels; k++) {
      const yy =
        y + 0.12 + ((k * (h - 0.2)) / (levels - 1 || 1)) * (levels > 1 ? 1 : 0);
      b.box(mat, x, yy, z, w, 0.03, d, { yaw, tint: o.tint, faces: "nsewtb" });
      if (o.empty) continue;
      const items = o.items || ["can", "jar", "bottle", "box"];
      let t = -w / 2 + 0.08;
      while (t < w / 2 - 0.1) {
        if (r() < 0.25) {
          t += 0.15;
          continue;
        }
        const kind = r.pick(items);
        const px = x + t * c + (r() - 0.5) * 0.1 * s,
          pz = z - t * s + (r() - 0.5) * 0.1 * c;
        if (kind === "can") {
          b.cyl(
            r() < 0.5 ? "rust" : "metal",
            px,
            yy + 0.03,
            pz,
            0.04,
            0.04,
            0.12,
            6,
            {
              tint: r.pick([
                [0.8, 0.3, 0.2],
                [0.8, 0.7, 0.4],
                [0.5, 0.6, 0.7],
                [0.7, 0.7, 0.7],
              ]),
            },
          );
          t += 0.1;
        } else if (kind === "jar") {
          b.cyl("glass", px, yy + 0.03, pz, 0.06, 0.06, 0.16, 8, {
            tint: r.pick([
              [0.6, 0.8, 0.4],
              [0.8, 0.6, 0.3],
              [0.5, 0.7, 0.5],
            ]),
          });
          t += 0.14;
        } else if (kind === "bottle") {
          b.cyl("glass", px, yy + 0.03, pz, 0.035, 0.035, 0.22, 6, {
            tint: r.pick([
              [0.3, 0.5, 0.3],
              [0.5, 0.3, 0.15],
              [0.7, 0.7, 0.6],
            ]),
          });
          b.cyl("glass", px, yy + 0.25, pz, 0.012, 0.012, 0.07, 5);
          t += 0.09;
        } else if (kind === "box") {
          const bw = 0.15 + r() * 0.15;
          b.box("fabric", px, yy + 0.03, pz, bw, 0.12 + r() * 0.15, 0.2, {
            yaw: yaw + (r() - 0.5) * 0.3,
            tint: r.pick([
              [0.7, 0.6, 0.4],
              [0.6, 0.5, 0.35],
              [0.8, 0.75, 0.6],
            ]),
          });
          t += bw + 0.03;
        } else if (kind === "book") {
          const bw = 0.04 + r() * 0.04;
          b.box("flat", px, yy + 0.03, pz, bw, 0.18 + r() * 0.1, 0.22, {
            yaw,
            tint: r.pick([
              [0.5, 0.15, 0.1],
              [0.15, 0.25, 0.4],
              [0.2, 0.35, 0.2],
              [0.55, 0.45, 0.3],
              [0.3, 0.2, 0.15],
            ]),
          });
          t += bw + 0.005;
        } else if (kind === "paint") {
          b.cyl("metal", px, yy + 0.03, pz, 0.08, 0.08, 0.14, 8, {
            tint: r.pick([
              [0.8, 0.2, 0.15],
              [0.2, 0.3, 0.7],
              [0.9, 0.8, 0.2],
              [0.9, 0.9, 0.85],
            ]),
          });
          t += 0.18;
        }
      }
    }
    if (o.col !== false)
      b.ocol(x, z, w, d, y, y + h, yaw, { tag: "furniture", surface: "metal" });
  };
  /** Rubble pile (local), with rebar. */
  K.rubble = function (b, x, y, z, r, h, o) {
    o = o || {};
    const rr = K.rng(o.seed || (x * 31 + z * 17) | 0);
    b.cyl(o.mat || "rubble", x, y, z, r, r * 0.25, h, 9, {
      tint: o.tint || [0.8, 0.78, 0.74],
    });
    for (let i = 0; i < (o.n || 7); i++) {
      const a = rr() * Math.PI * 2,
        d = rr() * r * 0.9,
        s = 0.2 + rr() * 0.5;
      b.box(
        rr() < 0.3 ? "brick_red" : "concrete",
        x + Math.cos(a) * d,
        y + rr() * h * 0.5,
        z + Math.sin(a) * d,
        s,
        s * 0.6,
        s * 0.8,
        { yaw: rr() * 3 },
      );
    }
    for (let i = 0; i < 3; i++) {
      const a = rr() * 6.28;
      b.pipe(
        "rust",
        x + Math.cos(a) * r * 0.3,
        y + h * 0.4,
        z + Math.sin(a) * r * 0.3,
        x + Math.cos(a) * r * 0.9,
        y + h + rr() * 0.8,
        z + Math.sin(a) * r * 0.9,
        0.015,
        4,
      );
    }
    if (o.col !== false)
      b.col(
        x - r * 0.6,
        y,
        z - r * 0.6,
        x + r * 0.6,
        y + h * 0.55,
        z + r * 0.6,
        { tag: "rubble", surface: "rubble" },
      );
  };
  /** Litter on a floor rect: papers, cans, debris. */
  K.litter = function (b, x0, z0, x1, z1, y, n, seed) {
    const r = K.rng(seed || (x0 * 7 + z0 * 3) | 0);
    for (let i = 0; i < n; i++) {
      const x = x0 + r() * (x1 - x0),
        z = z0 + r() * (z1 - z0),
        k = r();
      if (k < 0.45)
        b.hplate(
          "flat",
          x,
          y + 0.012 + i * 0.0005,
          z,
          0.2 + r() * 0.15,
          0.25 + r() * 0.15,
          r() * 6,
          null,
          { tint: [0.75 + r() * 0.15, 0.72, 0.6] },
        );
      else if (k < 0.65)
        b.pipe(
          "rust",
          x,
          y + 0.04,
          z,
          x + 0.1,
          y + 0.04,
          z + (r() - 0.5) * 0.1,
          0.035,
          6,
          {
            tint: r.pick([
              [0.8, 0.3, 0.2],
              [0.7, 0.7, 0.7],
            ]),
          },
        );
      else if (k < 0.85)
        b.box(
          "concrete",
          x,
          y,
          z,
          0.1 + r() * 0.3,
          0.05 + r() * 0.12,
          0.1 + r() * 0.25,
          { yaw: r() * 3 },
        );
      else
        b.box("wood_rotten", x, y, z, 0.8 + r() * 0.6, 0.05, 0.12, {
          yaw: r() * 3,
        });
    }
  };
  /** Hanging lamp fixture: cord + shade + bulb, and a baked light + glow. kind: 'bulb'|'pendant'|'lantern'|'tube'|'globe'|'cage' */
