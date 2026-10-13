// play-inline-41 05 — the
// Lines 1340-1412 of readable/play-inline-41.pretty.js (statement-aligned).
  D(
    "glass_clink",
    Object.assign({}, SPOT, {
      sr: 22050,
      dur: 1.0,
      variants: 4,
      gain: 0.22,
      ref: 4,
      wet: 1,
      build(k, v) {
        if (v % 2 === 0) {
          // two glasses touching
          const f = k.rr(2600, 3400),
            m = k.metal(1, [f, f * 2.71, f * 5.2], 60, [1, 0.5, 0.25]);
          k.chain(m.output, k.gain(0.8), k.out);
          const taps = 1 + ((k.r() * 2) | 0);
          for (let j = 0; j < taps; j++)
            k.burst({
              start: 0.01 + j * k.rr(0.08, 0.14),
              a: 0.0002,
              d: 0.002,
              peak: 1 - j * 0.4,
              type: "highpass",
              f: 2000,
              dest: m.input,
            });
        } else {
          // a bottle set down on the bar
          const f = k.rr(700, 1000),
            m = k.metal(1, [f, f * 2.4, f * 4.1], 30, [1, 0.5, 0.3]);
          k.chain(m.output, k.gain(0.5), k.out);
          k.burst({
            kind: "brown",
            start: 0.01,
            a: 0.001,
            d: 0.03,
            peak: 1,
            type: "lowpass",
            f: 400,
          });
          k.burst({
            start: 0.01,
            a: 0.0005,
            d: 0.006,
            peak: 0.6,
            type: "bandpass",
            f: 1800,
            q: 1,
            dest: m.input,
          });
        }
      },
    }),
  );

  // ------------------------------------------------------------------
  // 4. Archetypes & interior map
  // ------------------------------------------------------------------
  // spot option flags: high (up in the vaults/rafters), far (beyond the walls, occluded), wall (along the walls, low),
  // near (close to a friendly NPC), maxD (m)
  const FAMILY = {
    // room-size class → reverb, per material family
    stone: ["stone", "stone", "gallery", "concourse"],
    plaster: ["small", "office", "hall", "concourse"],
    wood: ["small", "room", "auditorium", "auditorium"],
    concrete: ["bunker", "bunker", "hall", "tunnel"],
    metal: ["hull", "hull", "industrial", "industrial"],
  };
  const OLD = [
    ["building_settle", 0.35],
    ["plaster_trickle", 0.45],
    ["distant_thud", 0.1, { far: 1 }],
  ];
