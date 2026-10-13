// play-inline-21 09 — the
// Lines 2242-2590 of readable/play-inline-21.pretty.js (statement-aligned).
  function readQuality() {
    let q = "high",
      t = 0;
    try {
      if (!G.isStub("atmos")) {
        if (typeof G.atmos.quality === "string") q = G.atmos.quality;
        if (typeof G.atmos.perfTier === "number" && G.atmos.perfTier > 0)
          t = G.atmos.perfTier;
      }
    } catch (e) {
      /* defaults */
    }
    if (G.QS && G.QS.get && G.QS.get("txq")) q = G.QS.get("txq"); // dev: ?txq=low|medium|high
    if (q === "low") t = Math.max(t, 2);
    else if (q === "medium") t = Math.max(t, 1);
    // medium quality: flat dim rooms (no ray-cast / parallax) and no relief layers (brick bump, façade wall relief,
    // close-range detail normals); dynamic-resolution pressure on high (tier 1) keeps the rooms on nearer windows only
    // and drops the relief; tier 2 (low / heavy pressure) also drops the dust layer
    Q.tier = t;
    Q.winLvl = t >= 2 || q === "medium" ? 1 : 0;
    uTxQ.value.set(
      t >= 2 ? 0.45 : t >= 1 ? 0.65 : 1,
      Q.winLvl,
      t >= 2 ? 0 : 1,
      t >= 1 ? 0 : 1,
    );
    if (q !== Q.quality) {
      const wasLow = Q.low;
      Q.quality = q;
      Q.low = q === "low";
      if (wasLow !== Q.low) recompileAll("quality " + q);
    }
  }
  X.quality = Q;
  function isTxHook(f) {
    return f === txCompile || !!(f && f.txChain);
  }
  /** Force every material carrying our hook to rebuild its program (its key changed: quality or a fallback). */
  function recompileAll(why) {
    let n = 0;
    const hit = (m) => {
      if (m && isTxHook(m.onBeforeCompile)) {
        m.needsUpdate = true;
        n++;
      }
    };
    try {
      if (G.scene)
        G.scene.traverse((o) => {
          const m = o.material;
          if (!m) return;
          if (Array.isArray(m)) m.forEach(hit);
          else hit(m);
        });
    } catch (e) {
      /* scene mid-rebuild */
    }
    matCache.forEach(hit);
    if (why && G.DEBUG)
      console.log("[textures] recompiled " + n + " materials (" + why + ")");
    return n;
  }
  /**
   * three.js calls renderer.debug.onShaderError(gl, program, vs, fs) when a program fails to link. If the failing
   * source carries one of our patches, disable that patch (façade → macro → flicker, most specific first), rebuild
   * the programs without it and warn once — the city renders unpatched instead of black/missing on that driver.
   * Anybody else's failure is logged exactly like three's default (and passed to a previous handler, if any).
   */
  function installShaderGuard() {
    const r = G.renderer;
    if (!r || !r.debug || r.debug.txGuard) return;
    const prev =
      typeof r.debug.onShaderError === "function"
        ? r.debug.onShaderError
        : null;
    r.debug.onShaderError = function (gl, program, vs, fs) {
      let src = "";
      try {
        src = gl.getShaderSource(fs) || "";
      } catch (e) {
        src = "";
      }
      const which = /uTxWinMask/.test(src)
        ? "win"
        : /uTxMacro/.test(src)
          ? "macro"
          : /uTxFkMode/.test(src)
            ? "flk"
            : /uTxEnvK/.test(src)
              ? "env"
              : null;
      let log = "";
      try {
        log =
          "Program Info Log: " +
          gl.getProgramInfoLog(program) +
          "\nVERTEX: " +
          gl.getShaderInfoLog(vs) +
          "\nFRAGMENT: " +
          gl.getShaderInfoLog(fs);
      } catch (e) {
        log = String(e);
      }
      if (which && !fail[which]) {
        fail[which] = true;
        if (which === "macro") fail.win = true; // the façade patch builds on the macro one
        console.warn(
          "[textures] " +
            which +
            " shader patch failed to compile on this GPU — falling back to plain materials.\n" +
            log.slice(0, 1200),
        );
        setTimeout(() => recompileAll("fallback " + which), 0);
        return;
      }
      if (which) return; // already falling back: this is a straggler of the same failure
      if (prev) {
        try {
          prev.call(this, gl, program, vs, fs);
          return;
        } catch (e) {
          /* fall through */
        }
      }
      let err = 0;
      try {
        err = gl.getError();
      } catch (e) {
        /* ignore */
      }
      console.error(
        "THREE.WebGLProgram: Shader Error " +
          err +
          " - VALIDATE_STATUS " +
          gl.getProgramParameter(program, gl.VALIDATE_STATUS) +
          "\n\n" +
          log,
      );
    };
    r.debug.txGuard = true;
  }
  /**
   * onBeforeCompile hook shared by every material this module builds AND by every clone of them
   * (installed in the TxStandardMaterial constructor, so `mat.clone()` inherits it with no scan and
   * no later recompile). Runs once per material when three.js first builds its program, i.e. the
   * first time it is actually rendered — the right moment to register it with the night-glow driver.
   */
  function txCompile(shader) {
    const ud = this.userData || {};
    if (ud.txGlow && !seenMats.has(this)) {
      seenMats.add(this);
      addGlow(this);
    }
    const k = txVariant(this);
    if (k.macro) {
      macroPatch(this, shader);
      X.macroCount++;
      if (k.win) {
        const win = winInfo(this);
        if (win) {
          winPatch(this, shader, win);
          X.winCount++;
        }
      }
    }
    if (k.flk) flkPatch(this, shader);
    else flkPatched.delete(this);
    if (k.env) envPatch(shader);
  }
  /** Which patches this material gets right now (quality tier, driver fallbacks, tags). */
  function txVariant(m) {
    const ud = m.userData || {};
    const hasMap = !!m.map;
    const win =
      hasMap && !Q.low && !fail.win && !!(ud.txWin || ud.txWinGrid) && winOK();
    const macro = hasMap && !Q.low && !fail.macro && (!!ud.txMacro || win);
    const flk = !fail.flk && !!(ud.txGlow && ud.txGlow.f);
    const env = !fail.env && envOurs(m);
    return { macro, win, flk, env };
  }
  // Few program variants (so clones share programs with their originals): plain / macro / façade, × flicker.
  function txKeyOf(m) {
    const k = txVariant(m);
    return (
      (k.win ? "txWin2" : k.macro ? "txMacro4" : "tx0") +
      (k.flk ? "F" : "") +
      (k.env ? "E" : "")
    );
  }
  // If another module replaces onBeforeCompile on a clone (its own shader patch), fall back to three's default key
  // (the function source) so its program can never be confused with ours.
  function txKey() {
    if (this.onBeforeCompile !== txCompile) return String(this.onBeforeCompile);
    return txKeyOf(this);
  }

  /**
   * MeshStandardMaterial whose clones keep the texture module's compile hook.
   * (Material.copy copies userData but not callbacks; the constructor re-installs them.)
   */
  class TxStandardMaterial extends THREE.MeshStandardMaterial {
    constructor(params) {
      super(params);
      this.onBeforeCompile = txCompile;
      this.customProgramCacheKey = txKey;
    }
  }
  X.TxStandardMaterial = TxStandardMaterial;
  const StdMat = TxStandardMaterial;

  /** Foreign material (not built here): install the hook if it has none of its own. */
  function addMacro(mat, recompile) {
    if (!mat.isMeshStandardMaterial) return;
    if (isTxHook(mat.onBeforeCompile)) return;
    if (mat.onBeforeCompile !== protoOBC) return; // never clobber someone else's patch (they can opt in: G.mats.chainCompile)
    mat.onBeforeCompile = txCompile;
    mat.customProgramCacheKey = txKey;
    if (recompile) mat.needsUpdate = true;
  }

  /** Register one material (shared or clone): glow driver + macro patch, once. */
  function track(mat, recompile) {
    if (!mat || !mat.isMaterial || seenMats.has(mat)) return mat;
    const ud = mat.userData || {};
    if (ud.txGlow) {
      seenMats.add(mat);
      addGlow(mat);
    }
    if (ud.txMacro || (ud.txGlow && ud.txGlow.f)) addMacro(mat, recompile); // flicker-only materials get the hook too
    return mat;
  }
  /**
   * Walk the scene for tagged materials that did NOT come from TxStandardMaterial (e.g. somebody did
   * `new MeshStandardMaterial().copy(ours)`). withMacro=true only at load time (initDone/newGame),
   * because installing the patch on an already-compiled material forces a recompile.
   */
  function scanVisit(m, withMacro) {
    if (!m || seenMats.has(m) || isTxHook(m.onBeforeCompile)) return;
    const ud = m.userData;
    if (!ud || !(ud.txGlow || ud.txMacro)) return;
    if (ud.txGlow) {
      seenMats.add(m);
      addGlow(m);
    }
    if (withMacro && (ud.txMacro || (ud.txGlow && ud.txGlow.f)))
      addMacro(m, true);
  }
  function scanScene(withMacro) {
    if (!G.scene) return;
    G.scene.traverse((o) => {
      const m = o.material;
      if (!m) return;
      if (Array.isArray(m)) {
        for (const mm of m) scanVisit(mm, withMacro);
      } else scanVisit(m, withMacro);
    });
  }
  /**
   * Periodic discovery sweep, time-sliced: ONE walk does both the foreign-clone scan and the automatic window-grid
   * detection, a slice of <= budget ms per frame (no 12 s hitch of two full traversals + readbacks), and skips
   * invisible subtrees (hidden interior roots are picked up by the first sweep after they are shown).
   */
  let sweep = null;
  X.sweepStats = { runs: 0, maxMs: 0, frames: 0 };
  function sweepStep(budgetMs) {
    if (!sweep) {
      if (!G.scene) return true;
      sweep = {
        stack: [G.scene],
        auto: winOK() && !autoOff && !Q.low,
        frames: 0,
      };
    }
    const t0 = now(),
      st = sweep.stack;
    sweep.frames++;
    while (st.length) {
      const o = st.pop();
      if (!o || (o !== G.scene && o.visible === false)) continue;
      const m = o.material;
      if (m) {
        const list = Array.isArray(m) ? m : null;
        if (list) {
          for (const mm of list) {
            scanVisit(mm, false);
            if (sweep.auto) autoVisit(mm, o, true);
          }
        } else {
          scanVisit(m, false);
          if (sweep.auto) autoVisit(m, o, true);
        }
      }
      const ch = o.children;
      if (ch) for (let i = ch.length - 1; i >= 0; i--) st.push(ch[i]);
      if (now() - t0 > budgetMs) break;
    }
    const dt = now() - t0;
    if (dt > X.sweepStats.maxMs) X.sweepStats.maxMs = +dt.toFixed(2);
    if (st.length) return false;
    X.sweepStats.runs++;
    X.sweepStats.frames = sweep.frames;
    sweep = null;
    return true;
  }

  // ==================================================================
  // Materials
  // ==================================================================
  const matCache = new Map();

  // Named special materials (no texture of the same name, or custom params)
  const NEON_COLORS = {
    red: 0xff2a2a,
    green: 0x39ff5a,
    blue: 0x3a7bff,
    pink: 0xff3fa8,
    yellow: 0xffe24a,
    orange: 0xff8a1f,
    white: 0xfff4e0,
    cyan: 0x3afcff,
    purple: 0xb14aff,
    teal: 0x22e0c0,
    magenta: 0xff2ad4,
    amber: 0xffb020,
  };
  X.NEON_COLORS = NEON_COLORS;
  const PAINTS = {
    red: "#9c2a22",
    teal: "#3e8a86",
    cream: "#d9cfae",
    yellow: "#d3a82c",
    blue: "#2f5a8c",
    green: "#4f6b3a",
    black: "#1e1e1e",
    white: "#d8d6cc",
    orange: "#c4622a",
    mint: "#8fc7a8",
    pink: "#d58a93",
    olive: "#5a5a36",
    grey: "#7c7f7c",
    brown: "#5c4030",
    navy: "#1f2f4c",
    cryo_grey: "#c4c9ca",
    cryo_orange: "#e0702a",
    fizzo_red: "#b3201c",
    army: "#4d5238",
  };
  X.PAINTS = PAINTS;

