// play-inline-82 04 — math
// Lines 941-1000 of readable/play-inline-82.pretty.js (statement-aligned).
  function buildSigns() {
    const L = G.LAYOUT;
    const r = M.rng("streetsignpoles");
    for (const q of M.intersections || []) {
      if (r() < 0.25) continue;
      if (L.siteAt(q.x, q.z, 3)) continue;
      const sx = q.x + (q.a.width / 2 - 0.7),
        sz = q.z - (q.s.width / 2 - 0.6);
      if (M.rasterAt(sx, sz) !== M.RC.RAISED) continue;
      let ave = q.a.name;
      if (q.a.x === -120 && q.z < -415) ave = "Central Park West";
      signPole(sx, sz, ave, q.s.name, r, r() < 0.1);
    }
    // Broadway × street crossings (the diagonal stretches): pole on the NE sidewalk corner
    const B = L.BROADWAY;
    for (const s of M.roads.streets)
      for (let i = 0; i + 1 < B.length; i++) {
        const a = B[i],
          c = B[i + 1];
        if ((a[1] - s.z) * (c[1] - s.z) > 0 || Math.abs(c[1] - a[1]) < 1)
          continue;
        const t = (s.z - a[1]) / (c[1] - a[1]),
          x = a[0] + (c[0] - a[0]) * t;
        if (x < s.x0 + 2 || x > s.x1 - 2) continue;
        if (
          M.roads.avenues.some(
            (av) => Math.abs(av.x - x) < 14 && s.z >= av.z0 && s.z <= av.z1,
          )
        )
          continue; // avenue crossing has its own
        if (L.siteAt(x, s.z, 3) || r() < 0.2) continue;
        for (const [ox, oz] of [
          [9.5, -(s.width / 2 - 0.6)],
          [-9.5, s.width / 2 - 0.6],
        ]) {
          const sx = x + ox,
            sz = s.z + oz;
          if (M.rasterAt(sx, sz) !== M.RC.RAISED) continue;
          signPole(sx, sz, "Broadway", s.name, r, r() < 0.1);
          break;
        }
      }
    // roundabout: one pole on each corner sidewalk
    for (const c of M.roads.circles || []) {
      for (const a of [0.8, 2.4, 3.9, 5.5]) {
        const rr = c.rOuter + 1.2,
          sx = c.x + Math.cos(a) * rr,
          sz = c.z + Math.sin(a) * rr;
        if (M.rasterAt(sx, sz) !== M.RC.RAISED) continue;
        signPole(sx, sz, c.name, "59th Street", r, false);
      }
    }
  }

  M.buildStreets = function () {
    buildMarkings();
    roundaboutMarkings();
    buildDamage();
    buildSigns();
  };
