// play-inline-130 04 — night
// Lines 675-699 of readable/play-inline-130.pretty.js (statement-aligned).
  function update(dt, realDt) {
    t += realDt;
    const night = K.night();
    K.updateGlows(t, night);
    K.updateNightMats(night);
    if (K.flagMat) K.flagMat.userData.uTime.value = t;
    // Billboards glow brighter at night (floodlit)
    const ads = K.mat("atlas_ads");
    if (ads.emissiveIntensity !== undefined)
      ads.emissiveIntensity = 0.12 + night * 0.55;
    const neon = K.mat("atlas_neon");
    const nf = 0.45 + night * 0.55;
    neon.color.setScalar(nf * (0.93 + 0.07 * Math.sin(t * 50)));
    for (const fn of A.animators) {
      try {
        fn(dt, t, night, realDt);
      } catch (e) {
        G.reportError("update:landmarks_a", e);
        A.animators.splice(A.animators.indexOf(fn), 1);
        break;
      }
    }
  }

  G.registerModule({ name: "landmarks_a", order: 24, init, update });
