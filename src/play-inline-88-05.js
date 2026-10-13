// play-inline-88 05 — lot
// Lines 1104-1211 of readable/play-inline-88.pretty.js (statement-aligned).
  M.buildDecay = function () {
    const r = M.rng("decay");
    let walls = 0;
    for (const w of M.wallLog || []) {
      weatherWall(w, r);
      walls++;
    }
    // debris at the foot of buildings: most street fronts get a drift, ruins a big spill
    let bases = 0;
    for (const lot of M.lots || []) {
      if (lot.kind === "shell" || lot.kind === "collapsed") continue;
      const rr = M.rng(
        "base" + Math.round(lot.x0 * 3) + "," + Math.round(lot.z0 * 3),
      );
      const fr = {
        n: lot.front.n || !!lot.faceN,
        s: lot.front.s || !!lot.faceS,
        e: lot.front.e,
        w: lot.front.w,
      };
      // wind-blown dirt, dead leaves and litter banked against every street wall
      for (const k of ["n", "s", "e", "w"]) {
        if (!fr[k]) continue;
        const alongX = k === "n" || k === "s";
        const span = alongX ? lot.x1 - lot.x0 : lot.z1 - lot.z0;
        for (let t = rr.range(0, 2); t < span - 1; t += rr.range(3, 6)) {
          const l = rr.range(2.5, 4.5),
            off = rr.range(0.35, 0.7);
          const x = alongX
            ? lot.x0 + t + l / 2
            : k === "e"
              ? lot.x1 + off
              : lot.x0 - off;
          const z = alongX
            ? k === "s"
              ? lot.z1 + off
              : lot.z0 - off
            : lot.z0 + t + l / 2;
          if (rr() < 0.3) continue;
          M.decal(
            M.buf("my/markings", x, z, "fine"),
            x,
            M.SIDEWALK_Y + 0.013,
            z,
            rr.range(0.9, 1.5),
            l,
            alongX ? Math.PI / 2 : 0,
            rr.pick([
              M.MARK.DIRT,
              M.MARK.LEAVES,
              M.MARK.GRIME,
              M.MARK.LITTER,
              M.MARK.SAND,
            ]),
            M.mulc(M.WHITE, rr.range(0.7, 1)),
          );
        }
      }
      for (const k of ["n", "s", "e", "w"]) {
        if (!fr[k]) continue;
        const p = lot.ruined ? 0.95 : lot.kind === "brownstone" ? 0.18 : 0.55;
        if (rr() > p) continue;
        const alongX = k === "n" || k === "s";
        const span = alongX ? lot.x1 - lot.x0 : lot.z1 - lot.z0;
        const len = Math.min(span * 0.8, rr.range(3, lot.ruined ? 12 : 7));
        const tc = rr.range(
          len / 2 + 0.3,
          Math.max(len / 2 + 0.31, span - len / 2 - 0.3),
        );
        const dep = lot.ruined ? rr.range(1.8, 3.2) : rr.range(0.9, 1.6);
        const out = dep * 0.4;
        const x = alongX
          ? lot.x0 + tc
          : k === "e"
            ? lot.x1 + out
            : lot.x0 - out;
        const z = alongX
          ? k === "s"
            ? lot.z1 + out
            : lot.z0 - out
          : lot.z0 + tc;
        M.debrisDrift(
          x,
          z,
          len,
          dep,
          lot.ruined ? rr.range(0.45, 0.9) : rr.range(0.18, 0.38),
          alongX ? Math.PI / 2 : 0,
          rr,
          {},
        );
        if (lot.ruined && rr() < 0.6)
          M.rubblePile(
            x + rr.range(-1, 1),
            z + rr.range(-1, 1),
            rr.range(1.4, 2.6),
            rr.range(0.5, 1.1),
            rr,
            { layer: "detail", noCollide: true },
          );
        bases++;
      }
    }
    curbClutter();
    puddles();
    M.decayStats = Object.assign(M.decayStats || {}, { walls, bases });
    M.wallLog = [];
  };
