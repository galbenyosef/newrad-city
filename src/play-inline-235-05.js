// play-inline-235 05 — lived
// Lines 702-755 of readable/play-inline-235.pretty.js (statement-aligned).
  D.flatiron_interior = function (C) {
    flickerTube(C, -12, 8.0, -6, Math.PI / 2, 1.3, 0.5); // third-floor storerooms
    const FA = 0,
      FB = 4.3;
    const PL = [
      [-16.6, -28],
      [-14.8, -27.3],
      [24, 28],
      [-19, 28],
      [-19, -25.7],
      [-18.1, -27.2],
    ];
    const xd = (z) => -14.8 + (z + 27.3) * (38.8 / 55.3);
    // morning sun through the west (Fifth Avenue) windows on both floors, a few through the diagonal Broadway side
    for (const y0 of [FA, FB]) {
      for (let t = 1.6 + 2.4 * 2; t < 52; t += 2.4 * 3)
        A.shaft(
          C,
          [-18.7, y0 + 2.6, 28 - t],
          [1, -0.62, -0.15],
          6.5,
          1.0,
          1.9,
          0xffe4b8,
          0.085,
        );
    }
    A.dust(C, -18.5, FA + 0.4, -20, 8, FA + 3.6, 27, 180);
    A.dust(C, -18.5, FB + 0.4, -20, 8, FB + 3.6, 27, 150);
    // a friendly trading post: lived-in, swept around the counters, junk in the corners
    const inside = (x, z) =>
      LI.inPoly(PL, x, z) && x < xd(z) - 0.4 && x > -18.6;
    const LIVED = {
      paper: 3,
      crumple: 2,
      can: 2,
      bottle: 1.2,
      chunk: 0.6,
      plank: 0.8,
      box: 1.2,
    };
    F.clutter(C, -19, -27.3, 24, 28, FA, {
      n: 70,
      seed: 61,
      test: inside,
      mix: LIVED,
    });
    F.clutter(C, -19, -27.3, 24, 28, FB, {
      n: 60,
      seed: 62,
      test: inside,
      mix: LIVED,
    });
  };
