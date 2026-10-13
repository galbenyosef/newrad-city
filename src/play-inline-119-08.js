// play-inline-119 08 — the
// Lines 4009-4094 of readable/play-inline-119.pretty.js (statement-aligned).
  K.neonTownPost = function (rec, sets) {
    K._tsPower = 1;
    rec.setPower = function (k) {
      K._tsPower = U.clamp(+k, 0, 1);
    };
    rec.power = () => K._tsPower;
    // (1) the square's own glow / pool / reflection sets: their opacity is re-set every frame by K.updateGlows (before the
    //     animators run), so scaling them in place is safe and touches nothing outside the square.
    const mats = [];
    for (const g of [sets.glows, sets.flick, rec.ball && rec.ball.glow])
      if (g)
        g.traverse((o) => {
          if (o.isPoints && o.material) mats.push(o.material);
        });
    const others = [sets.spill, sets.refl].filter(Boolean);
    // (2) SHARED materials (neon atlas, billboards, bulbs/tubes, screens) are used by every Midtown landmark: the square's
    //     meshes get PRIVATE clones that copy the shared material's live state every frame and then apply the power
    //     level — a black-out in the Neon never dims Radio City, the ESB crown or the interiors.
    const SHARED = {
      atlas_neon: 0.06,
      atlas_ads: 0,
      dcl_board: 0,
      neon_tube: 0.08,
      ts_screen: 0.05,
      ts_xscreen: 0.04,
      ts_crawl: 0.05,
      ts_zipper: 0.05,
      red_glass: 0.1,
    };
    const priv = []; // {src, dst, floor}
    const byMat = new Map();
    for (const key in SHARED) {
      const m = K.MATDEF[key] ? K.mat(key) : null;
      if (m) byMat.set(m, key);
    }
    rec.root.traverse((o) => {
      if (!o.isMesh || !o.material || Array.isArray(o.material)) return;
      const key = byMat.get(o.material);
      if (!key) return;
      let e = priv.find((q) => q.src === o.material);
      if (!e) {
        const src = o.material,
          dst = src.clone();
        dst.onBeforeCompile = src.onBeforeCompile;
        dst.customProgramCacheKey = src.customProgramCacheKey;
        dst.userData = { shared: true, tsPrivate: key };
        e = { src, dst, floor: SHARED[key] };
        priv.push(e);
      }
      o.material = e.dst;
    });
    rec.powerMaterials = priv.map((e) => e.dst);
    // the Crossroads-screen / zipper / crawl animators and 40's screen / tube animator write the shared state; this runs after them
    rec.applyPower = function () {
      const p = K._tsPower;
      for (const e of priv) {
        const s = e.src,
          d2 = e.dst,
          k = e.floor + (1 - e.floor) * p;
        if (s.color) d2.color.copy(s.color).multiplyScalar(e.floor ? k : 1);
        if (s.emissive && d2.emissive) {
          d2.emissive.copy(s.emissive);
          d2.emissiveIntensity =
            s.emissiveIntensity * (e.floor ? 1 : 0.15 + 0.85 * p);
        }
        d2.opacity = s.opacity;
      }
      if (p >= 0.999) return;
      for (const m of mats) m.opacity *= p;
      for (const m of others) {
        const mt = m.material;
        if (!mt) continue;
        if (mt.uniforms && mt.uniforms.uOpacity)
          mt.uniforms.uOpacity.value *= p;
        else mt.opacity *= p;
      }
    };
    // tsx neon (exterior signs + the Neon interiors, both powered by the Neon's plant) follows the day/night neon level
    K.animate((dt, t, night) => {
      K.mat("tsxn").color.setScalar(
        (0.45 + night * 0.55) *
          (0.93 + 0.07 * Math.sin(t * 50)) *
          (0.06 + 0.94 * K._tsPower),
      );
    });
  };
