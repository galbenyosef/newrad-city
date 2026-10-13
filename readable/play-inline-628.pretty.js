/* src/render_perf/50_quality.js */
/* =====================================================================
 * RENDER_PERF — graphics quality presets: Low / Medium / High / Ultra.
 *
 *   G.renderPerf.setQuality('low'|'medium'|'high'|'ultra')   (persisted: nrc_rp_quality)
 *
 * | preset | atmosphere quality          | pixel ratio   | size cull | draw distance (small/medium objects) | addLOD ×| sun shadow |
 * |--------|-----------------------------|---------------|-----------|---------------------------------------|---------|------------|
 * | low    | low (no post, 1024 shadows) | 0.8           | 5 px      | 550 m for r ≤ 30 m                    | 0.6     | atmos low  |
 * | medium | medium (post, no MSAA, t1)  | 1.0           | 3 px      | 1000 m for r ≤ 18 m                   | 0.8     | atmos t1   |
 * | high   | high (post, MSAA 4×)        | min(dpr, 1.5) | 1.6 px    | unlimited                             | 1       | 2048       |
 * | ultra  | high + post 'ultra' + 4096  | min(dpr, 2)   | 1.0 px    | unlimited                             | 1.25    | 4096       |
 * (addLOD ×: every G.world.addLOD distance — props chunks, small props — scaled; High = as authored.)
 *
 * High is the look the game was tuned for — it is also the default when nothing
 * is stored, so a fresh start behaves exactly as before this module. The
 * atmosphere keeps its own dynamic resolution / perf tier on top of every preset.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  if (!G || !G.renderPerf || !G.renderPerf._) return;
  const RP = G.renderPerf,
    R = RP._;

  const PRESETS = {
    low: {
      label: "Low",
      atmos: "low",
      pr: () => 0.8,
      sizePx: 5,
      drawDist: 550,
      drawDistMaxR: 30,
      lod: 0.6,
      hlod: 0.7,
      shadow4k: false,
    },
    medium: {
      label: "Medium",
      atmos: "medium",
      pr: () => 1,
      sizePx: 3,
      drawDist: 1000,
      drawDistMaxR: 18,
      lod: 0.8,
      hlod: 0.85,
      shadow4k: false,
    },
    high: {
      label: "High",
      atmos: "high",
      pr: () => Math.min(window.devicePixelRatio || 1, 1.5),
      sizePx: 1.6,
      drawDist: Infinity,
      drawDistMaxR: 0,
      lod: 1,
      hlod: 1,
      shadow4k: false,
    },
    ultra: {
      label: "Ultra",
      atmos: "high",
      pr: () => Math.min(window.devicePixelRatio || 1, 2),
      sizePx: 1.0,
      drawDist: Infinity,
      drawDistMaxR: 0,
      lod: 1.25,
      hlod: 1.3,
      shadow4k: true,
      post: "ultra",
    },
  };
  const ORDER = ["low", "medium", "high", "ultra"];
  let current = "high";

  function lsGet(k) {
    try {
      return localStorage.getItem(k);
    } catch (e) {
      return null;
    }
  }
  function lsSet(k, v) {
    try {
      localStorage.setItem(k, v);
    } catch (e) {
      /* ignore */
    }
  }

  function applyKnobs(p) {
    R.q.sizePx = p.sizePx;
    R.q.drawDist = p.drawDist;
    R.q.drawDistMaxR = p.drawDistMaxR;
    R.q.lod = p.lod;
    if (R.hlod) R.hlod.Dmul = p.hlod || 1; // distant-proxy switch distance (25_hlod.js)
    applyLodScale();
    R.force = true;
  }
  // ---- G.world.addLOD distances (props chunks, small props…) scale with the preset (High = as authored) ----
  let lodSeen = 0;
  function applyLodScale(onlyNew) {
    const W = G.world;
    if (!W || !W.lods) return;
    const k = R.q.lod || 1,
      k2 = k * k;
    for (let i = onlyNew ? lodSeen : 0; i < W.lods.length; i++) {
      const e = W.lods[i];
      if (!e || !(e.max2 > 0)) continue;
      if (e._rpMax2 === undefined) e._rpMax2 = e.max2;
      else if (!onlyNew && e.max2 !== e._rpLast) e._rpMax2 = e.max2; // owner re-registered / changed it
      e.max2 = e._rpMax2 * k2;
      e._rpLast = e.max2;
    }
    lodSeen = W.lods.length;
  }
  function applyPixelRatio(p) {
    const r = G.renderer;
    if (!r) return;
    const want = p.pr();
    if (Math.abs(r.getPixelRatio() - want) < 0.01) return;
    r.setPixelRatio(want); // three re-applies setSize with the new ratio
    G.events.emit("resize", window.innerWidth, window.innerHeight); // atmosphere rebuilds its targets
  }

  // ---- Ultra: 4096² sun shadow map (re-asserted when the atmosphere's perf tier changes) ----
  let sunRef = null;
  function sun() {
    if (sunRef && sunRef.parent) return sunRef;
    sunRef = null;
    if (G.scene)
      for (const o of G.scene.children)
        if (o.isDirectionalLight && o.name === "atmos_sun") {
          sunRef = o;
          break;
        }
    return sunRef;
  }
  function atmosShadowSize() {
    try {
      const s = G.atmos.shadowInfo && G.atmos.shadowInfo();
      return (s && s.size) || 2048;
    } catch (e) {
      return 2048;
    }
  }
  function applyShadow() {
    const s = sun();
    if (!s || !s.shadow) return;
    let tier = 0;
    try {
      tier = G.atmos.perfTier | 0;
    } catch (e) {
      /* ignore */
    }
    const want =
      PRESETS[current].shadow4k && tier <= 0 && !G.SMOKE
        ? 4096
        : atmosShadowSize();
    const maxTex =
      (G.renderer &&
        G.renderer.capabilities &&
        G.renderer.capabilities.maxTextureSize) ||
      4096;
    const size = Math.min(want, maxTex);
    if (s.shadow.mapSize.x !== size) {
      s.shadow.mapSize.set(size, size);
      if (s.shadow.map) {
        s.shadow.map.dispose();
        s.shadow.map = null;
      }
    }
  }

  /** Switch the graphics preset. Returns true on success. */
  RP.setQuality = function (q, opts) {
    q = String(q || "").toLowerCase();
    const p = PRESETS[q];
    if (!p) return false;
    const prev = current;
    current = q;
    if (!(opts && opts.noSave)) lsSet("nrc_rp_quality", q);
    const postBefore = (() => {
      try {
        return G.atmos.isPostFX();
      } catch (e) {
        return null;
      }
    })();
    try {
      // (fromAtmos: the Settings menu already switched the atmosphere itself — only follow it here)
      if (
        !(opts && opts.fromAtmos) &&
        G.atmos &&
        !G.isStub("atmos") &&
        G.atmos.setQuality
      )
        G.atmos.setQuality(p.atmos); // (resets any explicit post level)
      // render_post's post-processing tier: Ultra = FXAA over MSAA, SSAO 16, 4 bloom levels… (when that API exists)
      if (p.post && G.atmos && typeof G.atmos.setPostQuality === "function")
        G.atmos.setPostQuality(p.post);
    } catch (e) {
      G.reportError("render_perf:setQuality", e);
    }
    applyKnobs(p);
    applyPixelRatio(p);
    applyShadow();
    // post-fx toggled → every program's output variant changed: recompile in parallel now, not on the next frames
    const postAfter = (() => {
      try {
        return G.atmos.isPostFX();
      } catch (e) {
        return null;
      }
    })();
    if (postBefore !== postAfter && R.prewarmPrograms && !G.SMOKE && !G.SHOT)
      R.prewarmPrograms(false);
    if (prev !== q) G.events.emit("graphicsQualityChanged", q, prev);
    lastAtmosQ = atmosQ();
    return true;
  };
  // The HUD's Settings → "Graphics Quality" row drives G.atmos.setQuality directly (low / medium / high).
  // Follow it so the whole preset (pixel ratio, cull thresholds, LOD and proxy distances, shadow size)
  // changes with it. An 'ultra' choice made through this API survives the atmosphere reporting 'high'.
  function atmosQ() {
    try {
      return (G.atmos && !G.isStub("atmos") && G.atmos.quality) || null;
    } catch (e) {
      return null;
    }
  }
  let lastAtmosQ = null;
  function followAtmos() {
    const aq = atmosQ();
    if (!aq || aq === lastAtmosQ) return;
    lastAtmosQ = aq;
    if (!PRESETS[aq] || PRESETS[current].atmos === aq) return;
    RP.setQuality(aq, { fromAtmos: true });
  }
  RP.getQuality = () => current;
  RP.qualities = () => ORDER.map((id) => ({ id, label: PRESETS[id].label }));
  RP.presets = () =>
    JSON.parse(
      JSON.stringify(PRESETS, (k, v) =>
        typeof v === "function" ? v() : v === Infinity ? "unlimited" : v,
      ),
    );

  R.addSystem({
    name: "quality",
    order: 10,
    init() {
      const stored = lsGet("nrc_rp_quality");
      if (stored && PRESETS[stored] && !G.SMOKE && !G.SHOT && !G.SURVEY) {
        RP.setQuality(stored, { noSave: true });
      } else {
        // no explicit choice: mirror the atmosphere's own setting, change nothing else
        let aq = "high";
        try {
          aq = (G.atmos && G.atmos.quality) || "high";
        } catch (e) {
          /* ignore */
        }
        current = PRESETS[aq] ? aq : "high";
        applyKnobs(PRESETS[current]);
      }
      G.events.on("perfTierChanged", () => applyShadow());
      lastAtmosQ = atmosQ();
    },
    update(dt, realDt) {
      R._qT = (R._qT || 0) - (realDt || 0);
      if (R._qT <= 0) {
        R._qT = 2;
        if (!G.SMOKE && !G.SHOT && !G.SURVEY) followAtmos();
        if (PRESETS[current].shadow4k) applyShadow();
        if (
          (R.q.lod || 1) !== 1 &&
          G.world &&
          G.world.lods &&
          G.world.lods.length !== lodSeen
        )
          applyLodScale(true); // entries added later
      }
    },
  });
})();
