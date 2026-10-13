// play-inline-116 04 — math
// Lines 3024-3087 of readable/play-inline-116.pretty.js (statement-aligned).
  function waterTower(b, x, y, z, r) {
    for (let k = 0; k < 4; k++) {
      const a = (k * Math.PI) / 2 + Math.PI / 4;
      b.beam(
        "rust",
        x + Math.cos(a) * r * 0.8,
        y,
        z + Math.sin(a) * r * 0.8,
        x + Math.cos(a) * r * 0.75,
        y + 3.2,
        z + Math.sin(a) * r * 0.75,
        0.16,
      );
    }
    b.beam(
      "rust",
      x - r * 0.57,
      y + 1.6,
      z - r * 0.57,
      x + r * 0.57,
      y + 1.6,
      z + r * 0.57,
      0.08,
    );
    b.beam(
      "rust",
      x + r * 0.57,
      y + 1.6,
      z - r * 0.57,
      x - r * 0.57,
      y + 1.6,
      z + r * 0.57,
      0.08,
    );
    b.box("rust", x, y + 3.2, z, r * 2, 0.2, r * 2, { grime: 0.5 });
    b.cyl("wood_rotten", x, y + 3.4, z, r, r * 0.97, r * 2.1, 12, {
      top: false,
      grime: 0.6,
    });
    for (let k = 0; k < 3; k++)
      b.cyl(
        "black_metal",
        x,
        y + 3.8 + k * r * 0.7,
        z,
        r * 1.01,
        r * 1.01,
        0.08,
        12,
        { top: false },
      );
    b.cyl("wood_dark", x, y + 3.4 + r * 2.1, z, r * 1.05, 0.15, r * 0.8, 12, {
      grime: 0.5,
    });
    b.beam("rust", x + r, y + 3.4, z, x + r, y + 3.4 + r * 2.4, z, 0.05);
  }
  K.parts.waterTower = waterTower;

  K.defineSite("times_square", 40, function () {
    textures();
    const rec = K.record("times_square");
    build(rec);
    rec.brandsUsed = Array.from(rec.brandsUsed || []);
  });
