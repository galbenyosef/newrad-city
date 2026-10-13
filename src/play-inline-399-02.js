// play-inline-399 02 — fixed
// Lines 26-83 of readable/play-inline-399.pretty.js (statement-aligned).
  const PV = G._pv3;
  const K = PV.kit;
  const PI = Math.PI,
    HP = PI / 2;
  PV.INT = PV.INT || {};

  // ---- locks (G.locks) ----
  const LK = (PV.LK_CH = {
    door86: K.regLock({
      id: "pv3_lk_ch_door86",
      label: "Door 86 (speakeasy password)",
      kind: "door",
      passcode: "TEACUP",
      hint: 'Lee Bedford tells the old password when you ask about "eighty-six".',
      learnedFrom: "Lee Bedford (dialogue)",
    }),
    grate: K.regLock({
      id: "pv3_lk_ch_grate",
      label: "Rusted Grate (bootleggers' tunnel)",
      kind: "door",
      key: "pv3_key_ch_grate",
      hint: "The grate key lies on the supply crates by the tunnel mouth.",
      keyFrom: "Cellar, on the supply crates by the tunnel mouth",
    }),
  });

  const CY = -3.2; // cellar floor (local)
  const H = 3.3;

  /** Rows of framed book jackets on a wall span (fixed = wall line; t0..t1 along it). */
  function jackets(b, t0, t1, y0, y1, fixed, nx, nz, seed) {
    const r = K.rng(seed);
    let i = seed * 7;
    for (let y = y0; y < y1 - 0.4; y += 0.52) {
      for (let t = t0 + 0.2; t < t1 - 0.3; t += 0.4 + r() * 0.08) {
        if (r() < 0.1) continue;
        const px = nz !== 0 ? t : fixed,
          pz = nz !== 0 ? fixed : t;
        K.framed(
          b,
          px,
          y + 0.22 + (r() - 0.5) * 0.04,
          pz,
          nx,
          nz,
          0.28,
          0.42,
          K.bookJacket((i++ % 24) + (seed % 3) * 0),
          {
            frame: r() < 0.7 ? "paint_black" : "wood_dark",
            fw: 0.025,
            depth: 0.02,
          },
        );
      }
    }
  }

