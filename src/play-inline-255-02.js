// play-inline-255 02 — the
// Lines 25-314 of readable/play-inline-255.pretty.js (statement-aligned).
  const PF = G._pbr;
  const BK = PF.bk,
    K = PF.kit,
    D = PF.dress;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const PI = Math.PI,
    HP = PI / 2;
  const ZA = V3(0, 0, 1),
    UP = V3(0, 1, 0),
    XA = V3(1, 0, 0);

  const Q = (PF.QB = {
    x0: 300,
    brk: 490,
    zN: -440,
    zS: -430,
    zc: -435,
    deck: 22,
    lo: 16,
    towers: [346, 388, 428, 622],
    top: 64,
    low: 32,
    L: 26,
    mk: { x0: 300, x1: 341, z0: -441.2, z1: -424, top: 16 },
    ramp: { x0: 300, x1: 372, z0: -445.8, z1: -441.8 },
    stair: { xA: 400, xB: 406.5, lanes: [-427.9, -425.5], w: 2.2, ld: 1.8 },
    bays: [306.75, 316.25, 325.75, 335.25],
    arch: { w: 6.4, spring: 8 },
    doorBay: 1,
    kiosk: { x0: 314, x1: 319, z0: -439, z1: -434.5 },
  });

  /** Top-chord height of the cantilever trusses at x (peaks at the towers, tapering anchor arm at the west end). */
  function topRaw(x) {
    let y = Q.low;
    for (const T of Q.towers) {
      const t = Math.min(1, Math.abs(x - T) / Q.L);
      y = Math.max(y, Q.low + (Q.top - Q.low) * Math.pow(1 - t, 1.6));
    }
    return y;
  }
  const y330 = topRaw(330);
  function topY(x) {
    let y = topRaw(x);
    if (x < 330) y = Math.min(y, 24 + ((x - 312) / 18) * (y330 - 24));
    return y;
  }
  Q.topY = topY;
  /** Panel points between key stations (≈5 m panels, every station included). */
  function panels(keys) {
    const out = [keys[0]];
    for (let i = 0; i < keys.length - 1; i++) {
      const a = keys[i],
        c = keys[i + 1],
        n = Math.max(1, Math.round((c - a) / 5.2));
      for (let k = 1; k <= n; k++) out.push(a + ((c - a) * k) / n);
    }
    return out;
  }
  const nearestTower = (x) => {
    let best = Q.towers[0];
    for (const T of Q.towers)
      if (Math.abs(T - x) < Math.abs(best - x)) best = T;
    return best;
  };

  // =================================================================
  // Truss plane
  // =================================================================
  function trussPlane(b, z0, xs, opts) {
    opts = opts || {};
    const lo = Q.lo;
    const P = (x, y) => V3(x, y, z0);
    for (let i = 0; i < xs.length; i++) {
      const x = xs[i],
        ty = topY(x);
      const isTower = Q.towers.some((T) => Math.abs(T - x) < 0.01);
      // posts (tower posts are built separately)
      if (!isTower)
        BK.laced(b, "qb_steel", P(x, lo), P(x, ty), 0.95, 0.85, XA, {
          flange: 0.2,
          laceKey: "qb_steel_dk",
        });
      // pins on the top chord
      b.cyl("qb_steel_dk", x, ty - 0.8, z0, 0.3, 0.3, 1.6, 8, {
        hSeg: 1,
        rx: HP,
        grime: 0.4,
      });
      if (i === xs.length - 1) break;
      const xn = xs[i + 1],
        tn = topY(xn);
      // bottom chord (box girder) and eyebar top chord
      BK.beamOriented(b, "qb_steel", P(x, lo), P(xn, lo), 1.4, 1.2, UP, 0.55);
      BK.eyebars(b, "qb_steel", P(x, ty), P(xn, tn), 4, 1.15, 0.13, 0.3, ZA);
      // main diagonal: from the top of the tower-side post down to the foot of the far post
      const towerLeft =
        Math.abs(nearestTower((x + xn) / 2) - x) <
        Math.abs(nearestTower((x + xn) / 2) - xn);
      const a = towerLeft ? P(x, ty - 0.5) : P(xn, tn - 0.5),
        c = towerLeft ? P(xn, lo + 0.5) : P(x, lo + 0.5);
      BK.laced(b, "qb_steel", a, c, 0.75, 0.7, BK.perpUp(a, c, ZA), {
        flange: 0.16,
        laceKey: "qb_steel_dk",
      });
      // secondary strut: from the far post's top to the diagonal's midpoint (sub-paneling)
      const m = a.clone().lerp(c, 0.5);
      const f = towerLeft ? P(xn, tn - 0.5) : P(x, ty - 0.5);
      b.beam("qb_steel_dk", f, m, 0.35, 0.35, { grime: 0.5 });
      const g = towerLeft ? P(x, lo + 0.5) : P(xn, lo + 0.5);
      b.beam("qb_steel_dk", g, m, 0.3, 0.3, { grime: 0.5 });
      // deck-level colliders: the diagonal where it crosses the walking band (22..24.5)
      if (opts.collide && x >= 300 && xn <= Q.brk + 0.1) {
        for (const yy of [22.4, 23.6]) {
          const tt = (yy - c.y) / (a.y - c.y);
          if (tt < 0 || tt > 1) continue;
          const px = c.x + (a.x - c.x) * tt;
          PF.col(px, z0, 0.9, 0.9, yy - 0.6, yy + 0.6, 0, {
            walkable: false,
            surface: "metal",
          });
        }
      }
    }
    if (opts.collide)
      for (const x of xs) {
        if (x < 300 || x > Q.brk) continue;
        if (Q.towers.some((T) => Math.abs(T - x) < 0.01)) continue;
        if (topY(x) < Q.deck + 0.5) continue;
        PF.col(x, z0, 1.0, 0.95, Q.deck - 0.3, Q.deck + 3.5, 0, {
          walkable: false,
          surface: "metal",
        });
      }
  }

  // =================================================================
  // Towers (steel above the piers) with the famous pinnacle finials
  // =================================================================
  function tower(b, T, opts) {
    opts = opts || {};
    const y0 = Q.lo,
      y1 = Q.top + 2;
    for (const z0 of [Q.zN, Q.zS]) {
      for (const dx of [-1.6, 1.6]) {
        BK.laced(
          b,
          "qb_steel",
          V3(T + dx, y0, z0),
          V3(T + dx, y1, z0),
          1.4,
          1.6,
          XA,
          { flange: 0.28, laceKey: "qb_steel_dk", lace: 1.1 },
        );
        // finial: base, lantern, spire, ball
        b.box("qb_steel", T + dx, y1, z0, 2.0, 0.9, 2.0, {
          seg: false,
          grime: 0.4,
        });
        b.cyl("qb_steel", T + dx, y1 + 0.9, z0, 0.62, 0.75, 1.2, 8, {
          hSeg: 1,
          grime: 0.4,
        });
        b.cyl("qb_steel_dk", T + dx, y1 + 2.1, z0, 0.8, 0.6, 0.25, 8, {
          hSeg: 1,
        });
        b.cyl("qb_steel", T + dx, y1 + 2.35, z0, 0.04, 0.55, 4.6, 8, {
          hSeg: 2,
          grime: 0.3,
        });
        b.sphere("qb_steel_dk", T + dx, y1 + 6.9, z0, 0.2, { ws: 8, hs: 6 });
        for (const [sx, sz] of [
          [-1, -1],
          [1, -1],
          [-1, 1],
          [1, 1],
        ])
          b.cyl(
            "qb_steel",
            T + dx + sx * 0.8,
            y1 + 0.9,
            z0 + sz * 0.8,
            0.02,
            0.14,
            1.6,
            4,
            { hSeg: 1 },
          );
        if (opts.collide)
          PF.col(T + dx, z0, 1.5, 1.7, y0, y1, 0, {
            walkable: false,
            surface: "metal",
          });
      }
      // battens + X bracing between the twin columns of the post
      for (let y = y0 + 3; y < y1 - 1; y += 6) {
        BK.beamOriented(
          b,
          "qb_steel_dk",
          V3(T - 1.0, y, z0),
          V3(T + 1.0, y, z0),
          0.5,
          1.2,
          UP,
          0.5,
        );
        b.beam(
          "qb_steel_dk",
          V3(T - 1.0, y, z0),
          V3(T + 1.0, Math.min(y + 6, y1 - 1), z0),
          0.2,
          0.2,
          {},
        );
        b.beam(
          "qb_steel_dk",
          V3(T + 1.0, y, z0),
          V3(T - 1.0, Math.min(y + 6, y1 - 1), z0),
          0.2,
          0.2,
          {},
        );
      }
      BK.beamOriented(
        b,
        "qb_steel",
        V3(T - 2.6, y1 - 0.6, z0),
        V3(T + 2.6, y1 - 0.6, z0),
        1.3,
        1.9,
        UP,
        0.5,
      );
    }
    // portal bracing between the two trusses (clear of the deck)
    const lv = [31, 41, 51, 60, 65];
    for (const dx of [-1.6, 1.6]) {
      for (const y of lv)
        BK.laced(
          b,
          "qb_steel",
          V3(T + dx, y, Q.zN + 0.8),
          V3(T + dx, y, Q.zS - 0.8),
          1.0,
          0.8,
          UP,
          { flange: 0.18, laceKey: "qb_steel_dk" },
        );
      for (let i = 0; i < lv.length - 1; i++) {
        b.beam(
          "qb_steel_dk",
          V3(T + dx, lv[i], Q.zN + 0.8),
          V3(T + dx, lv[i + 1], Q.zS - 0.8),
          0.28,
          0.28,
          {},
        );
        b.beam(
          "qb_steel_dk",
          V3(T + dx, lv[i], Q.zS - 0.8),
          V3(T + dx, lv[i + 1], Q.zN + 0.8),
          0.28,
          0.28,
          {},
        );
      }
      // knee braces into the deck-level portal (the "gateway" silhouette seen from the roadway)
      b.beam(
        "qb_steel",
        V3(T + dx, 26.5, Q.zN + 0.8),
        V3(T + dx, 31, Q.zN + 4.5),
        0.5,
        0.5,
        {},
      );
      b.beam(
        "qb_steel",
        V3(T + dx, 26.5, Q.zS - 0.8),
        V3(T + dx, 31, Q.zS - 4.5),
        0.5,
        0.5,
        {},
      );
    }
  }

  // =================================================================
  // Granite piers
  // =================================================================
