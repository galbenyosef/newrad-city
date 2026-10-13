// play-inline-305 04 — height
// Lines 523-540 of readable/play-inline-305.pretty.js (statement-aligned).
  const RC = { x: 0, z: 8 },
    RR = 11,
    RH = 8.5; // rotunda centre / radius / wall height
  const WELL = 3.35; // globe well radius
  const OPENINGS = [
    // angle (0 = south, +HP = east), width, height
    { a: 0, w: 6.4, h: 5.2 },
    { a: -HP, w: 4.2, h: 4.0 },
    { a: PI, w: 5.2, h: 5.0 },
    { a: HP, w: 4.2, h: 4.0 },
  ];
  const wrap = (a) => {
    while (a > PI) a -= TAU;
    while (a < -PI) a += TAU;
    return a;
  };
  const atR = (a, r) => [RC.x + Math.sin(a) * r, RC.z + Math.cos(a) * r];

