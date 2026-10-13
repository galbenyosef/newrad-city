// play-inline-423 02 — len
// Lines 28-70 of readable/play-inline-423.pretty.js (statement-aligned).
  const PV = G._ph2;
  const K = PV.kit;
  const PI = Math.PI,
    HP = PI / 2;

  // Pew / bench with back: length along x, seat faces +z (dir 1) or −z (dir −1)
  function pew(b, x, y, z, len, dir, o) {
    o = o || {};
    const mat = o.mat || "oak",
      t = o.tint || [0.62, 0.46, 0.3];
    b.box(mat, x, y + 0.42, z, len, 0.06, 0.46, { tint: t, faces: "nsewtb" });
    b.box(mat, x, y + 0.48, z - dir * 0.24, len, 0.52, 0.06, {
      tint: t,
      faces: "nsewtb",
    });
    for (const e of [-1, 1])
      b.box(
        mat,
        x + e * (len / 2 - 0.03),
        y,
        z - dir * 0.02,
        0.06,
        0.78,
        0.52,
        { tint: t.map((v) => v * 0.85) },
      );
    for (let k = 1; k < Math.floor(len / 1.6); k++)
      b.box(
        "cast_iron",
        x - len / 2 + (k * len) / Math.floor(len / 1.6),
        y,
        z,
        0.05,
        0.42,
        0.4,
      );
    if (o.col !== false)
      b.col(x - len / 2, y, z - 0.3, x + len / 2, y + 0.5, z + 0.3, {
        tag: "furniture",
        surface: "wood",
      });
  }

