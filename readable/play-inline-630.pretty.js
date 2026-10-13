/* src/render_perf/90_module.js */
/* =====================================================================
 * RENDER_PERF — module registration (order 95: after every world module has
 * built; lateUpdate is the last one before G.render(), so the cull pass sees the
 * final camera of the frame and nothing is ever a frame late).
 *
 * Public API (G.renderPerf):
 *   setQuality(q) / getQuality() / qualities() / presets()      — 50_quality.js
 *   audit() / stats() / overlay(bool)                            — 60_audit.js
 *   setEnabled(bool), setOption(name, bool), rescan(), prewarm() — here
 * Test switches: ?rp=0 (module off), ?rpocc=0, ?rpsize=0, ?rpint=0, ?rpwarm=0,
 *   ?perf=1 (overlay), ?rpdebug=1.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  if (!G || !G.renderPerf || !G.renderPerf._ || !G.registerModule) return;
  const RP = G.renderPerf,
    R = RP._;

  function run(kind, dt, realDt) {
    for (const s of R.systems) {
      if (s._dead || !s[kind]) continue;
      try {
        s[kind](dt, realDt);
      } catch (e) {
        G.reportError(kind + ":render_perf/" + s.name, e);
        s._errs = (s._errs || 0) + 1;
        if (s._errs > 10) s._dead = true;
      }
    }
  }

  RP.setEnabled = function (on) {
    R.enabled = !!on && !G.SURVEY;
    if (!R.enabled) {
      if (R.hlod) R.hlod.onEnabled(false);
      R.showAll();
      if (R.freezeReleaseAll) R.freezeReleaseAll();
    } else {
      R.force = true;
      if (R.freezeAdopt)
        for (const root of R.adopted)
          if (root.parent === G.scene) R.freezeAdopt(root);
    }
    return R.enabled;
  };
  RP.isEnabled = () => R.enabled;
  /** occlusion | sizeCull | interiorCull | prewarm | hlod */
  RP.setOption = function (name, on) {
    if (!(name in R.opts)) return false;
    R.opts[name] = !!on;
    if (!on) {
      const bit =
        name === "occlusion"
          ? R.HIDE.OCC
          : name === "sizeCull"
            ? R.HIDE.SIZE
            : name === "interiorCull"
              ? R.HIDE.INT
              : 0;
      if (bit)
        for (const u of R.units)
          if (u.mask & bit) {
            u.mask &= ~bit;
            R.apply(u);
          }
    }
    R.force = true;
    return true;
  };
  RP.rescan = function () {
    return R.scan(true);
  };
  RP.prewarm = function () {
    return R.prewarmPrograms ? R.prewarmPrograms(false) : Promise.resolve(0);
  };

  let scanT = 0,
    cullErrors = 0;
  G.registerModule({
    name: "render_perf",
    order: 95,
    async init() {
      const t0 = performance.now();
      for (const s of R.systems)
        if (s.name === "quality" && s.init) {
          try {
            s.init();
          } catch (e) {
            G.reportError("init:render_perf/quality", e);
          }
        }
      if (R.enabled) {
        try {
          R.scan(true);
        } catch (e) {
          G.reportError("init:render_perf/scan", e);
        }
        try {
          if (R.occ) R.occ.build();
        } catch (e) {
          G.reportError("init:render_perf/occluders", e);
        }
        R.unitsReady = true;
      }
      R.initMs = Math.round(performance.now() - t0);
      // a new/loaded game spawns interactable props, quest set pieces… under already adopted roots
      const full = () => {
        R._fullRescan = 45;
        R._skipWave = false;
      };
      G.events.on("newGame", full);
      G.events.on("loaded", full);
      for (const s of R.systems) {
        if (s.name === "quality" || !s.init) continue;
        try {
          s.init();
        } catch (e) {
          s._dead = true;
          G.reportError("init:render_perf/" + s.name, e);
        }
      }
      // (the program prewarm runs in parallel and is not awaited: the title screen comes up while the driver compiles)
    },
    update(dt, realDt) {
      run("update", dt, realDt);
    },
    lateUpdate(dt, realDt) {
      if (!R.enabled || !R.unitsReady) return;
      // adopt roots added after init (quest set pieces, late builders) once they have settled
      scanT -= realDt || 0;
      if (R._fullRescan > 0 && --R._fullRescan === 0) {
        try {
          R.rescanSome(R.adopted.length);
        } catch (e) {
          G.reportError("late:render_perf/rescan", e);
        }
      }
      if (scanT <= 0) {
        scanT = 2;
        try {
          R.scan(false);
          R.rescanSome(3);
          // once the first freeze wave has settled, try to skip every fully static root
          const F = R.freeze;
          if (
            F &&
            F.enabled &&
            F.cand.length < 400 &&
            F.frozen &&
            !R._skipWave
          ) {
            R._skipWave = true;
            for (const r of R.adopted) R.freezeEvalSkip(r);
          }
        } catch (e) {
          G.reportError("late:render_perf/scan", e);
        }
      }
      try {
        R.sweep(160);
      } catch (e) {
        G.reportError("late:render_perf/sweep", e);
      }
      try {
        if (R.freeze && R.freeze.enabled) {
          R.freezeObserve(600);
          R.freezeCheck();
        }
      } catch (e) {
        G.reportError("late:render_perf/freeze", e);
        R.freeze.enabled = false;
        R.freezeReleaseAll();
      }
      if (cullErrors > 5) return;
      try {
        R.cullPass();
      } catch (e) {
        cullErrors++;
        G.reportError("late:render_perf/cull", e);
        if (cullErrors > 5) {
          R.showAll();
          console.warn(
            "[render_perf] cull pass disabled after repeated errors",
          );
        }
      }
    },
  });
})();
