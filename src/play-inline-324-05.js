// play-inline-324 05 — the
// Lines 1340-1367 of readable/play-inline-324.pretty.js (statement-aligned).
  function D_crates(b, x, y, z) {
    const r = PF.rng("flatcrates");
    for (let i = 0; i < 6; i++) {
      const s = 0.9 + r() * 0.4;
      b.box(
        r() < 0.5 ? "crate" : "army",
        x + (r() - 0.5) * 1.6,
        y,
        z - 4.5 + i * 1.6,
        s,
        s * 0.85,
        s,
        { ry: (r() - 0.5) * 0.4, seg: false, grime: 0.5 },
      );
    }
    b.box("tent", x, y + 1.0, z + 2, 2.6, 0.05, 4.2, {
      rz: 0.1,
      rx: 0.05,
      seg: false,
      grime: 0.6,
    });
  }

  /**
   * The freight terminal headhouse the High Line runs into (south end): an Art Deco
   * brick-and-limestone block straddling the tracks with a track portal at deck level and a
   * truck dock at street level (door to the interior on each level).
   */
