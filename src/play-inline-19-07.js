// play-inline-19 07 — decals
// Lines 2238-2344 of readable/play-inline-19.pretty.js (statement-aligned).
  for (let i = 0; i < GRAF.length; i++)
    DECALS["graffiti_" + (i + 1)] = (ctx, s, r) =>
      X.spray(
        ctx,
        GRAF[i],
        s / 2,
        s / 2,
        Math.min(s * 0.22, (s * 1.5) / Math.max(3, GRAF[i].length)),
        ["#d8261a", "#1e1e1e", "#f4f0e0", "#2a7ad0", "#3ac04a", "#f2c43a"][
          i % 6
        ],
        r,
        (r() - 0.5) * 0.2,
      );
  DECALS.graffiti = DECALS.graffiti_1;
  DECALS.raider_graffiti = DECALS.graffiti_raiders;
  DECALS.blood = DECALS.blood_splat;
  DECALS.crack = DECALS.cracks;
  DECALS.radiation_symbol = DECALS.radiation;
  DECALS.trefoil = DECALS.radiation;
  X.DECALS = DECALS;
  let dynCount = 0;
  const warnedDecal = new Set();
  X.decalTex = function (name) {
    name = String(name || "blood_splat");
    if (decalCache.has(name)) return decalCache.get(name);
    let fn = DECALS[name];
    let dyn = null;
    if (!fn && name.indexOf("graffiti_text:") === 0) {
      dyn = name.slice(14);
      fn = (ctx, s, r) =>
        X.spray(
          ctx,
          dyn,
          s / 2,
          s / 2,
          Math.min(s * 0.22, (s * 1.5) / Math.max(3, dyn.length)),
          "#d8261a",
          r,
          (r() - 0.5) * 0.15,
        );
    }
    if (dyn !== null && dynCount >= 32) {
      // cap: beyond 32 distinct texts reuse the stock tags (memory)
      const t = X.decalTex("graffiti_" + (1 + ((X.seedOf(dyn) >>> 0) % 10)));
      decalCache.set(name, t);
      return t;
    }
    if (!fn) {
      // unknown → alias to an existing decal texture instead of allocating a new one
      const alt =
        name.length >= 3
          ? Object.keys(DECALS).find((k) => k.indexOf(name) === 0)
          : null;
      const t = X.decalTex(alt || "blood_splat");
      if (!warnedDecal.has(name)) {
        warnedDecal.add(name);
        console.warn(
          '[textures] unknown decal "' +
            name +
            '" -> ' +
            (alt || "blood_splat"),
        );
      }
      decalCache.set(name, t);
      return t;
    }
    if (dyn !== null) dynCount++;
    const s =
      (X.DECAL_SIZE && X.DECAL_SIZE[name]) ||
      (/manhole|cryo_|long_winter|covenant|continuity|chalk|hopscotch|graffiti_(sleeper|sun|skull|raiders)/.test(
        name,
      )
        ? 512
        : 256); // 41_story.js sizes its own
    const paint = () => {
      const cv = X.canvas(s, s),
        r = X.rng(X.seedOf("decal:" + name));
      try {
        fn(cv.ctx, s, r);
      } catch (e) {
        G.reportError("textures:decal:" + name, e);
      }
      return cv.c;
    };
    const tex = X.toTexture(paint(), {
      repeat: false,
      name: "decal_" + name,
      regen: paint,
    });
    tex.userData.alpha = true;
    decalCache.set(name, tex);
    return tex;
  };

  // ------------------------------------------------------------------
  // ICONS (128², white-on-transparent line art; iconURL tints)
  // ------------------------------------------------------------------
  const L = (ctx, pts, close) => {
    ctx.beginPath();
    pts.forEach((p, i) =>
      i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]),
    );
    if (close) ctx.closePath();
    ctx.stroke();
  };
  let ICOL = "#ffffff"; // current icon ink (set per draw)
