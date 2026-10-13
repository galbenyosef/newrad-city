/* src/render_perf/40_prewarm.js */
/* =====================================================================
 * RENDER_PERF — shader prewarm + texture pre-upload (no first-use hitches).
 *
 * Measured before this module: the first frame that shows a new material set
 * stalled for 0.9–1.3 s (Katz's Deli: 7 programs + its canvas textures; the
 * Dakota: 2 programs; AMNH: 4 s including its bake). Outdoors the same thing
 * happened whenever a POI with its own materials came into view.
 *
 * 1. Programs: after every world module has built (init, order 95) one proxy mesh
 *    per unique (material × object kind × geometry attribute layout) is compiled
 *    with `renderer.compileAsync` against the real scene (fog + lights) and, when
 *    the post-fx chain is on, with an HDR render target bound — exactly the
 *    program variant the frame will ask for (linear output, no tone mapping). The
 *    driver compiles in parallel (KHR_parallel_shader_compile) while the title
 *    screen is up. Re-run for new roots after newGame/load and after a quality
 *    change (post on/off changes every program's output variant).
 * 2. Textures: every texture used by the exterior world is uploaded during
 *    loading (time-boxed; the rest trickles in at ≤ 3 ms/frame). Interior cells
 *    are uploaded when the player LOOKS AT a door leading there (focus event), so
 *    the cell is resident before E is pressed; never all cells at once (VRAM).
 * Skipped in smoke/shot/survey runs (SwiftShader compiles are very slow there
 * and those runs only render a handful of views).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  if (!G || !G.renderPerf || !G.renderPerf._) return;
  const R = G.renderPerf._;

  const W = (R.warm = {
    programsBefore: 0,
    programsAfter: 0,
    compiled: 0,
    compileMs: 0,
    texUploaded: 0,
    texMs: 0,
    pending: [],
    busy: false,
    seenMat: new Set(),
    cellsDone: new Set(),
  });
  let hdrRT = null;

  function postOn() {
    try {
      return !!(
        G.atmos &&
        !G.isStub("atmos") &&
        G.atmos.isPostFX &&
        G.atmos.isPostFX()
      );
    } catch (e) {
      return false;
    }
  }
  function geoSig(g) {
    let s = "";
    for (const k in g.attributes) {
      const a = g.attributes[k];
      s += k + (a.itemSize | 0) + ",";
    }
    if (g.morphAttributes)
      for (const k in g.morphAttributes)
        if (g.morphAttributes[k] && g.morphAttributes[k].length)
          s += "m" + k + g.morphAttributes[k].length;
    return s;
  }
  function matKey(m) {
    return Array.isArray(m) ? m.map((x) => x && x.uuid).join("+") : m && m.uuid;
  }

  /** Build proxy objects (sharing geometry+material) for every unique program-relevant combination under `root`. */
  function collectProxies(root, out, seen) {
    root.traverse((o) => {
      const mat = o.material,
        g = o.geometry;
      if (!mat) return;
      if (o.isSprite) {
        const k = "S" + matKey(mat);
        if (seen.has(k)) return;
        seen.add(k);
        out.push(new THREE.Sprite(mat));
        return;
      }
      if (!g || !g.attributes || !g.attributes.position) return;
      const kind = o.isInstancedMesh
        ? "I" + (o.instanceColor ? "c" : "")
        : o.isSkinnedMesh
          ? "K"
          : o.isPoints
            ? "P"
            : o.isLineSegments
              ? "LS"
              : o.isLine
                ? "L"
                : o.isMesh
                  ? "M"
                  : null;
      if (!kind) return;
      const k = kind + "|" + matKey(mat) + "|" + geoSig(g);
      if (seen.has(k)) return;
      seen.add(k);
      let p;
      try {
        if (o.isInstancedMesh) {
          p = new THREE.InstancedMesh(g, mat, 1);
          if (o.instanceColor) p.instanceColor = o.instanceColor;
        } else if (o.isSkinnedMesh) {
          if (!o.skeleton) return;
          p = new THREE.SkinnedMesh(g, mat);
          p.skeleton = o.skeleton;
          p.bindMatrix.copy(o.bindMatrix);
          p.bindMatrixInverse.copy(o.bindMatrixInverse);
        } else if (o.isPoints) p = new THREE.Points(g, mat);
        else if (o.isLineSegments) p = new THREE.LineSegments(g, mat);
        else if (o.isLine) p = new THREE.Line(g, mat);
        else p = new THREE.Mesh(g, mat);
      } catch (e) {
        return;
      }
      p.frustumCulled = false;
      out.push(p);
    });
    return out;
  }

  /** Compile proxies against the live scene lights/fog, HDR target bound when post-fx is on. → Promise */
  function compileProxies(proxies, targetScene, camera) {
    const r = G.renderer;
    if (!proxies.length || !r) return Promise.resolve(0);
    const tmp = new THREE.Scene();
    for (const p of proxies) tmp.add(p);
    const prev = r.getRenderTarget();
    let pr = null;
    const t0 = performance.now();
    try {
      if (postOn()) {
        if (!hdrRT)
          hdrRT = new THREE.WebGLRenderTarget(4, 4, {
            type: THREE.HalfFloatType,
            depthBuffer: true,
          });
        r.setRenderTarget(hdrRT);
      }
      if (typeof r.compileAsync === "function")
        pr = r.compileAsync(tmp, camera, targetScene);
      else {
        r.compile(tmp, camera, targetScene);
        pr = Promise.resolve();
      }
    } catch (e) {
      console.warn("[render_perf] prewarm compile failed:", e && e.message);
      pr = Promise.resolve();
    } finally {
      r.setRenderTarget(prev);
    }
    W.compileMs += performance.now() - t0;
    W.compiled += proxies.length;
    const done = () => {
      tmp.clear();
      return proxies.length;
    };
    return Promise.resolve(pr).then(done, done);
  }

  /** Programs for everything in the scene + the viewmodel scene. */
  R.prewarmPrograms = function (onlyNewRoots) {
    if (!G.renderer || !G.scene || !G.camera) return Promise.resolve(0);
    const seen = onlyNewRoots ? W.seenMat : (W.seenMat = new Set());
    const proxies = [];
    for (const root of G.scene.children) {
      if (root.isCamera || root.isLight) continue;
      collectProxies(root, proxies, seen);
    }
    W.programsBefore = G.renderer.info.programs
      ? G.renderer.info.programs.length
      : 0;
    const jobs = [compileProxies(proxies, G.scene, G.camera)];
    if (G.viewScene && G.viewCamera) {
      const vp = collectProxies(G.viewScene, [], seen);
      jobs.push(compileProxies(vp, G.viewScene, G.viewCamera));
    }
    return Promise.all(jobs).then((n) => {
      W.programsAfter = G.renderer.info.programs
        ? G.renderer.info.programs.length
        : 0;
      return n[0] + (n[1] || 0);
    });
  };

  // ------------------------------------------------------------------
  // Textures
  // ------------------------------------------------------------------
  const texSeen = new WeakSet();
  function texturesOf(root, out, filter) {
    root.traverse((o) => {
      const ms = o.material;
      if (!ms) return;
      if (filter && !filter(o)) return;
      const arr = Array.isArray(ms) ? ms : [ms];
      for (const m of arr) {
        if (!m) continue;
        for (const k in m) {
          const v = m[k];
          if (v && v.isTexture && !texSeen.has(v)) {
            texSeen.add(v);
            out.push(v);
          }
        }
        if (m.uniforms)
          for (const k in m.uniforms) {
            const u = m.uniforms[k];
            const v = u && u.value;
            if (v && v.isTexture && !texSeen.has(v)) {
              texSeen.add(v);
              out.push(v);
            }
          }
      }
    });
    return out;
  }
  function uploadable(t) {
    if (!t || t.isRenderTargetTexture || t.isDepthTexture || t.isVideoTexture)
      return false;
    if (
      t.isDataTexture ||
      t.isData3DTexture ||
      t.isDataArrayTexture ||
      t.isCompressedTexture
    )
      return true;
    const img = t.image;
    if (!img) return false;
    if (
      typeof HTMLCanvasElement !== "undefined" &&
      img instanceof HTMLCanvasElement
    )
      return img.width > 0 && img.height > 0;
    if (typeof ImageBitmap !== "undefined" && img instanceof ImageBitmap)
      return true;
    if (
      typeof HTMLImageElement !== "undefined" &&
      img instanceof HTMLImageElement
    )
      return img.complete && img.naturalWidth > 0;
    return !!(img.width && img.height);
  }
  /** Upload queued textures for at most `ms` milliseconds. */
  function pumpTextures(ms) {
    const r = G.renderer;
    if (!r || !W.pending.length) return 0;
    const t0 = performance.now();
    let n = 0;
    while (W.pending.length && performance.now() - t0 < ms) {
      const t = W.pending.shift();
      if (!uploadable(t)) continue;
      try {
        r.initTexture(t);
        n++;
      } catch (e) {
        /* skip */
      }
    }
    W.texUploaded += n;
    W.texMs += performance.now() - t0;
    return n;
  }
  R.pumpTextures = pumpTextures;

  const XMIN = () => (G.LAYOUT && G.LAYOUT.INTERIOR_X_MIN) || 2500;
  const _p = new THREE.Vector3();
  function isExterior(o) {
    o.getWorldPosition(_p);
    return _p.x < XMIN();
  }
  R.queueExteriorTextures = function () {
    for (const root of G.scene.children) {
      if (root.isCamera || root.isLight) continue;
      texturesOf(root, W.pending, isExterior);
    }
    texturesOf(G.viewScene || new THREE.Object3D(), W.pending, null);
  };
  /** Queue the textures of an interior cell (roots/objects whose world position lies in that cell). */
  R.queueCellTextures = function (key) {
    if (!key || W.cellsDone.has(key)) return;
    W.cellsDone.add(key);
    const I = G.LAYOUT && G.LAYOUT.INTERIORS,
      c = I && I[key] && I[key].origin;
    if (!c) return;
    const inCell = (o) => {
      o.getWorldPosition(_p);
      return Math.abs(_p.x - c.x) < 175 && Math.abs(_p.z - c.z) < 175;
    };
    const list = [];
    for (const root of G.scene.children) {
      if (root.isCamera || root.isLight) continue;
      // cheap reject: a root far from the cell whose children are all near it is rare; test the root's subtree
      texturesOf(root, list, inCell);
    }
    // cell textures first: the player is about to walk in
    W.pending = list.concat(W.pending);
  };

  // door focus → pre-upload the target cell
  function onFocus(it) {
    if (!it || !R.enabled || !R.opts.prewarm) return;
    let tgt = null;
    if (it.def && it.def.target) tgt = it.def.target;
    else if (it.target && isFinite(it.target.x)) tgt = it.target;
    if (!tgt || !isFinite(tgt.x) || tgt.x < XMIN()) return;
    const key = R.cellAt(tgt.x, tgt.z);
    if (key) R.queueCellTextures(key);
  }

  R.addSystem({
    name: "prewarm",
    order: 40,
    init() {
      if (!R.opts.prewarm || G.SMOKE || G.SHOT || G.SURVEY) return null;
      const t0 = performance.now();
      R.queueExteriorTextures();
      // loading-time budget for textures; the remainder trickles in during play
      pumpTextures(1500);
      W.initTexMs = Math.round(performance.now() - t0);
      G.events.on("focus", onFocus);
      // new roots (actors, items, quest props) after a game starts
      const again = () =>
        setTimeout(() => {
          try {
            R.prewarmPrograms(true);
          } catch (e) {
            /* ignore */
          }
        }, 2500);
      G.events.on("newGame", again);
      G.events.on("loaded", again);
      // programs: parallel compile while the title screen is up (not awaited → loading isn't extended)
      const tp = performance.now();
      W.promise = R.prewarmPrograms(false)
        .then((n) => {
          W.doneMs = Math.round(performance.now() - tp);
          W.done = true;
          return n;
        })
        .catch((e) => {
          console.warn("[render_perf] prewarm:", e && e.message);
        });
      return W.promise;
    },
    update(dt, realDt) {
      if (W.pending.length) pumpTextures(G.state === "play" ? 3 : 8);
    },
  });
})();
