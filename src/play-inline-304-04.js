// play-inline-304 04 — math
// Lines 688-763 of readable/play-inline-304.pretty.js (statement-aligned).
  E.bones = function (b, x, y, z, r, n, o) {
    o = o || {};
    const rn = P.rng(x * 13.7 + z * 2.9 + y);
    for (let i = 0; i < (n || 10); i++) {
      const a = rn() * TAU,
        d = Math.sqrt(rn()) * r,
        px = x + Math.cos(a) * d,
        pz = z + Math.sin(a) * d;
      const k = rn();
      if (k < 0.18)
        b.sphere("bone", px, y + 0.09, pz, 0.1 + rn() * 0.05, {
          ws: 6,
          hs: 5,
          sy: 0.9,
        });
      else if (k < 0.3) {
        for (let j = 0; j < 5; j++)
          b.torus("bone", px, y + 0.05, pz + j * 0.08, 0.16, 0.015, PI, {
            ry: rn(),
            rs: 3,
            ts: 8,
          });
      } else {
        const L = 0.25 + rn() * 0.4,
          aa = rn() * TAU;
        b.rod(
          o.key || "bone",
          [px, y + 0.03, pz],
          [
            px + Math.cos(aa) * L,
            y + 0.03 + rn() * 0.08,
            pz + Math.sin(aa) * L,
          ],
          0.025,
          4,
          { noAO: true },
        );
      }
    }
  };
  /** ash bear nest: ring of torn mattresses / fur / branches with bones in the bowl. */
  E.nest = function (S, x, y, z, R, o) {
    o = o || {};
    const b = S.b,
      rn = P.rng(x * 3.1 + z * 1.3);
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * TAU + rn() * 0.2,
        d = R * (0.75 + rn() * 0.3);
      b.rock(
        i % 3 === 0 ? "fabric" : "fur",
        x + Math.cos(a) * d,
        y + 0.15,
        z + Math.sin(a) * d,
        0.5 + rn() * 0.4,
        { flat: 0.5, rough: 0.8, seed: i * 1.7 },
      );
    }
    for (let i = 0; i < 16; i++) {
      const a = rn() * TAU,
        d = R * (0.5 + rn() * 0.6);
      b.rod(
        "wood_rotten",
        [x + Math.cos(a) * d, y + 0.1, z + Math.sin(a) * d],
        [
          x + Math.cos(a + 0.6) * d * 0.9,
          y + 0.25 + rn() * 0.2,
          z + Math.sin(a + 0.6) * d * 0.9,
        ],
        0.04,
        4,
        { noAO: true },
      );
    }
    b.cyl("fur", x, y, z, R * 0.8, R * 0.85, 0.08, 16, { noAO: true });
    E.bones(b, x, y + 0.08, z, R * 0.7, o.bones || 16);
  };
