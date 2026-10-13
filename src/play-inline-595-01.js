// play-inline-595 01 — best
// Lines 1-261 of readable/play-inline-595.pretty.js (statement-aligned).
/* src/lair/90_main.js */
/* =====================================================================
 * NEW RAD CITY — lair / 90_main.js
 * Module registration (order 63, after quests 60 / quests_extra 62):
 * builds the two lair cells, injects their interior moods, toggles cell
 * visibility, animates (candle flicker, record platter, dosimeter needle,
 * the oil-drum fires), runs the spawn/reset hooks and saves the module's
 * own small state (save key 'lair').
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  const LR = G.lair,
    K = LR && LR._;
  if (!K) return;

  // Interior moods (atmosphere reads MOODS[interiorKey]; we only ADD our own keys).
  const MOODS = {
    lair_track61: {
      fog: "#1a120c",
      fogD: 0.016,
      hemiS: "#a08060",
      hemiG: "#3a2a1a",
      hemiI: 0.2,
      light: "#ffc890",
      lightI: 0.08,
      exp: 1.22,
      bloom: 0.45,
      vig: 0.07,
      grain: 0.012,
    },
    lair_m42: {
      fog: "#1c120a",
      fogD: 0.012,
      hemiS: "#b08658",
      hemiG: "#3e2a16",
      hemiI: 0.18,
      light: "#ffc078",
      lightI: 0.07,
      exp: 1.24,
      bloom: 0.42,
      vig: 0.08,
      grain: 0.012,
    },
  };
  function installMoods() {
    try {
      const A = G.atmos && !G.isStub("atmos") ? G.atmos._ : null;
      const M = A && A.MOODS;
      if (!M) return;
      for (const k in MOODS) {
        if (M[k]) continue;
        const m = Object.assign({}, MOODS[k]);
        for (const n of ["fog", "hemiS", "hemiG", "light"])
          m[n] = new THREE.Color(m[n]);
        M[k] = m;
      }
    } catch (e) {
      /* atmosphere absent or changed: default mood */
    }
  }

  // ------------------------------------------------------------------
  // Visibility: a lair root is visible only while the camera is indoors and near its cell.
  // ------------------------------------------------------------------
  function updateVisibility() {
    const cam = G.camera ? G.camera.position : G.player.pos;
    const indoor = cam.x >= G.LAYOUT.INTERIOR_X_MIN;
    const R = K.roots || {};
    if (R.track61) {
      const o = K.O1();
      R.track61.visible =
        indoor && Math.abs(cam.x - o.x) < 200 && Math.abs(cam.z - o.z) < 200;
    }
    if (R.m42) {
      const o = K.O2();
      R.m42.visible =
        indoor && Math.abs(cam.x - o.x) < 200 && Math.abs(cam.z - o.z) < 200;
    }
    for (const d of K.dressRoots || []) d.root.visible = d.test(cam, indoor);
  }

  // ------------------------------------------------------------------
  // Real fires in the camp oil drums while the player is on Track 61 (G.fx pool)
  // ------------------------------------------------------------------
  let firesOn = false;
  function updateFires() {
    const want = K.cellAt(G.player.pos) === "lair_track61";
    if (want === firesOn) return;
    firesOn = want;
    for (const f of K.fires) {
      if (want && !f.h && K.live("fx") && G.fx.fire)
        f.h = K.safe("fx.fire", () =>
          G.fx.fire(new THREE.Vector3(f.x, f.y, f.z), 0.45),
        );
      else if (!want && f.h) {
        K.safe("fx.fire.stop", () => {
          if (f.h.stop) f.h.stop();
          else if (f.h.remove) f.h.remove();
        });
        f.h = null;
      }
    }
  }

  // ------------------------------------------------------------------
  // Save: the module's own small state (everything story-relevant lives in quest flags)
  // ------------------------------------------------------------------
  K.state = K.state || {};
  G.save.register("lair", {
    save() {
      return JSON.parse(JSON.stringify(K.state || {}));
    },
    load(d) {
      K.state = d || {};
    },
  });

  let animT = 0;
  G.registerModule({
    name: "lair",
    order: 63,
    init() {
      installMoods();
      const t0 = performance.now();
      for (const bd of K.builds.slice().sort((a, b) => a.order - b.order))
        K.safe("build:" + bd.order, bd.fn);
      K.buildMs = Math.round(performance.now() - t0);
      G.events.on("initDone", () => {
        installMoods();
        for (const fn of K.readyFns) K.safe("ready", fn);
      });
      G.events.on("reset", () => {
        firesOn = true;
        K.fires.forEach((f) => {
          if (f.h)
            K.safe("fx.stop", () => {
              if (f.h.stop) f.h.stop();
              else if (f.h.remove) f.h.remove();
            });
          f.h = null;
        });
        firesOn = false;
        K.state = {};
        for (const fn of K.resetFns) K.safe("reset", fn);
      });
      const spawn = () => {
        for (const fn of K.spawnFns) K.safe("spawn", fn);
      };
      G.events.on("newGame", spawn);
      G.events.on("loaded", spawn);
    },
    update(dt, realDt) {
      for (const fn of K.updateFns) K.safe("update", () => fn(dt, realDt));
    },
    lateUpdate(dt, realDt) {
      updateVisibility();
      if (G.player) updateFires();
      animT += realDt || 0;
      K.glowTime.value = animT;
      const R = K.roots || {};
      if ((R.track61 && R.track61.visible) || (R.m42 && R.m42.visible))
        for (const fn of K.animFns) K.safe("anim", () => fn(dt, animT));
    },
  });
})();

// ---- debug: ?lairdbg (with ?shot=) dumps mesh/colour stats of the lair roots into the DOM ----
(function () {
  const G = window.G;
  const K = G.lair && G.lair._;
  if (!K) return;
  K.debugStats = function () {
    const out = {};
    for (const k in K.roots || {}) {
      const root = K.roots[k];
      const meshes = [];
      root.traverse((o) => {
        if (!o.isMesh || !o.geometry || !o.geometry.attributes.color) return;
        const c = o.geometry.attributes.color.array;
        let s = 0,
          n = c.length / 3,
          mx = 0;
        for (let i = 0; i < c.length; i += 3) {
          const v = (c[i] + c[i + 1] + c[i + 2]) / 3;
          s += v;
          if (v > mx) mx = v;
        }
        meshes.push({
          name: o.name,
          verts: n,
          avg: +(s / n).toFixed(3),
          max: +mx.toFixed(2),
          vis: o.visible,
          side: o.material.side,
          map: !!o.material.map,
        });
      });
      out[k] = { visible: root.visible, meshes };
    }
    K.roots.m42 &&
      K.roots.m42.traverse((o) => {
        if (!o.isMesh || !/sun_ceiling/.test(o.name)) return;
        const img = o.material.map && o.material.map.image;
        const info = { w: img && img.width, h: img && img.height };
        try {
          const d = img
            .getContext("2d")
            .getImageData(img.width / 2 + 300, img.height / 2, 1, 1).data;
          info.px = Array.from(d);
        } catch (e) {
          info.err = String(e);
        }
        const P = o.geometry.attributes.position.array,
          C = o.geometry.attributes.color.array;
        let best = 0;
        for (let i = 0; i < P.length / 3; i++)
          if (P[i * 3 + 1] > P[best * 3 + 1]) best = i;
        info.apex = [
          P[best * 3],
          P[best * 3 + 1],
          P[best * 3 + 2],
          C[best * 3],
          C[best * 3 + 1],
          C[best * 3 + 2],
        ];
        info.color = o.material.color.getHexString();
        info.type = o.material.type;
        info.uvAt = Array.from(
          o.geometry.attributes.uv.array.slice(best * 2, best * 2 + 2),
        );
        out.ceiling = info;
      });
    out.atmos = {
      key: G.atmos && G.atmos.interiorKey,
      mood: !!(
        G.atmos &&
        G.atmos._ &&
        G.atmos._.MOODS &&
        G.atmos._.MOODS.lair_m42
      ),
    };
    return out;
  };
  if (/[?&]lairdbg\b/.test(location.search)) {
    let f = 0;
    G.events.on("initDone", () => {});
    const tick = () => {
      f++;
      if (document.title === "SHOT_READY" || f > 600) {
        const pre = document.createElement("pre");
        pre.id = "lairdbg";
        pre.textContent =
          "LAIRDBG" + JSON.stringify(K.debugStats()) + "LAIRDBG";
        document.body.appendChild(pre);
      } else setTimeout(tick, 50);
    };
    setTimeout(tick, 50);
  }
})();
