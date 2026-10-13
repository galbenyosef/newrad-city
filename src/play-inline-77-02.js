// play-inline-77 02 — the
// Lines 20-289 of readable/play-inline-77.pretty.js (statement-aligned).
  const RL = G.rlight,
    R = RL._,
    U = R.uniforms;

  function run(kind, dt, realDt) {
    for (const s of R.systems) {
      if (s._dead || !s[kind]) continue;
      try {
        s[kind](dt, realDt);
      } catch (e) {
        G.reportError(kind + ":render_lighting/" + s.name, e);
        s._errs = (s._errs || 0) + 1;
        if (s._errs > 20) {
          s._dead = true;
          if (s.dispose) {
            try {
              s.dispose();
            } catch (e2) {
              /* ignore */
            }
          }
        }
      }
    }
  }

  G.registerModule({
    name: "render_lighting",
    order: 16,
    init() {
      if (!R.patched)
        console.warn(
          "[render_lighting] shader patches unavailable — running with atmosphere lighting only",
        );
      for (const s of R.systems) {
        if (!s.init) continue;
        try {
          s.init();
        } catch (e) {
          s._dead = true;
          G.reportError("init:render_lighting/" + s.name, e);
        }
      }
      RL.ready = true;
    },
    update(dt, realDt) {
      run("update", dt, realDt);
    },
    lateUpdate(dt, realDt) {
      run("late", dt, realDt);
      try {
        shaderCheck();
      } catch (e) {
        /* never let the check itself break a frame */
      }
    },
  });

  // ------------------------------------------------------------------
  // shader self-check + fallback
  // ------------------------------------------------------------------
  let frames = 0,
    lastN = -1,
    fellBack = false;
  const seen = new WeakSet();
  const LIT = /^Mesh(Standard|Physical|Lambert|Phong|Toon)Material$/;
  const OURS =
    /nrc(VL|Csm|I[Ocemnsv]\b|Tap|Hz|Probe|Bounce|SoftShadow|Depth|HemiIrr|Vis|FillK|Park|Atlas|Alb|Occ|Lit|Line|Top|Dst|Tn|Far|Sh\b|Nc|Ne\b|Ndl|Sl\b|Fc|Fe\b|WP|UV|H0|H1)/;
  const LIMITS =
    /too many|exceed|maximum|sampler|MAX_|register|out of resources|varyings|uniforms/i;
  function shaderCheck() {
    frames++;
    // headless shot/survey pages: expose our state for the test tools (hidden, text only)
    if ((G.SHOT || G.SURVEY) && frames % 10 === 0) {
      try {
        let el = document.getElementById("rl-info");
        if (!el) {
          el = document.createElement("pre");
          el.id = "rl-info";
          el.style.display = "none";
          document.body.appendChild(el);
        }
        el.textContent = "RLINFO" + JSON.stringify(RL.info()) + "RLEND";
        if (showInfo) {
          // ?rlinfo=1: visible overlay (one headless run gives the picture AND the numbers)
          let v = document.getElementById("rl-info-vis");
          if (!v) {
            v = document.createElement("pre");
            v.id = "rl-info-vis";
            v.style.cssText =
              "position:fixed;left:4px;bottom:4px;z-index:99999;margin:0;font:10px/1.15 monospace;color:#fff;background:rgba(0,0,0,.6);max-width:62%;white-space:pre-wrap;pointer-events:none";
            document.body.appendChild(v);
          }
          const li = RL.lightsInfo ? RL.lightsInfo() : {};
          v.textContent =
            JSON.stringify(li) +
            "\n" +
            JSON.stringify(RL.lightsList ? RL.lightsList(6) : []) +
            "\ncontact " +
            JSON.stringify(RL.contactInfo ? RL.contactInfo() : null) +
            " cam " +
            (G.camera
              ? G.camera.position
                  .toArray()
                  .map((x) => x.toFixed(1))
                  .join(",")
              : "") +
            "\ncascade " +
            JSON.stringify(
              RL.cascadeInfo
                ? (({ active, tier, passes, interior, clutterActive }) => ({
                    active,
                    tier,
                    passes,
                    interior,
                    clutterActive,
                  }))(RL.cascadeInfo())
                : null,
            ) +
            "\nprobe " +
            JSON.stringify(RL._nearProbe ? RL._nearProbe() : null) +
            "\nframe " +
            (G.renderer
              ? G.renderer.info.render.calls +
                " calls " +
                (G.renderer.info.render.triangles / 1e6).toFixed(2) +
                "M tris"
              : "");
        }
      } catch (e) {
        /* ignore */
      }
    }
    if (frames === 20 && failTest && !fellBack) fallback(true); // ?rlfailtest=1: exercise the fallback (not remembered)
    const progs =
      (G.renderer && G.renderer.info && G.renderer.info.programs) || [];
    if (progs.length === lastN && frames % 30 !== 0) return;
    lastN = progs.length;
    for (const p of progs) {
      const d = p.diagnostics;
      if (!d || d.runnable !== false || seen.has(p)) continue;
      seen.add(p);
      const log =
        ((d.fragmentShader && d.fragmentShader.log) || "") +
        " " +
        ((d.vertexShader && d.vertexShader.log) || "") +
        " " +
        (d.programLog || "");
      const lit = LIT.test(p.name || "");
      const ours =
        R.patched &&
        ((lit && (OURS.test(log) || LIMITS.test(log))) || OURS.test(log));
      G.reportError(
        "render_lighting/shader",
        new Error(
          (p.name || "?") +
            (ours ? " [falling back to stock lighting]" : "") +
            ": " +
            log.trim().slice(0, 360),
        ),
      );
      if (ours && !fellBack) fallback();
    }
  }
  let failTest = false,
    showInfo = false;
  try {
    const q = new URLSearchParams(location.search);
    failTest = q.get("rlfailtest") === "1";
    showInfo = q.get("rlinfo") === "1";
  } catch (e) {
    /* ignore */
  }
  function fallback(test) {
    fellBack = true;
    try {
      U.nrcCsm.value.x = 0;
      U.nrcProbeK.value.x = 0;
      if (U.nrcVL) U.nrcVL.value.x = 0;
      U.nrcHzL.value.w = 0;
      U.nrcCsm3.value.z = 1;
      if (R.disposeCascade) R.disposeCascade();
      if (R.near) {
        R.near.castShadow = false;
        if (R.near.parent) R.near.parent.remove(R.near);
      }
      RL.cascades = false;
      R.unpatch();
      const bump = (o) => {
        const m = o.material;
        if (!m) return;
        (Array.isArray(m) ? m : [m]).forEach((x) => {
          if (!x) return;
          // instance-level cache keys bypass the prototype bust in R.unpatch(): wrap them too
          if (
            Object.prototype.hasOwnProperty.call(x, "customProgramCacheKey") &&
            !x._nrcKeyBust
          ) {
            const f = x.customProgramCacheKey;
            x.customProgramCacheKey = function () {
              return f.call(this) + "|rlsafe";
            };
            x._nrcKeyBust = true;
          }
          x.needsUpdate = true;
        });
      };
      if (G.scene) G.scene.traverse(bump);
      for (const k of ["viewScene", "vmScene", "viewModelScene"])
        if (G[k] && G[k].traverse) G[k].traverse(bump);
      if (!test) {
        try {
          localStorage.setItem("nrc_rl_safe", "1");
        } catch (e) {
          /* ignore */
        }
      }
      console.warn(
        "[render_lighting] lighting patches failed on this GPU — reverted to stock lighting (remembered; ?rlsafe=0 to retry)",
      );
    } catch (e) {
      G.reportError("render_lighting/fallback", e);
    }
  }
  /** Forget a remembered shader failure (the next load patches again). */
  RL.clearSafeMode = () => {
    try {
      localStorage.removeItem("nrc_rl_safe");
    } catch (e) {
      /* ignore */
    }
  };
  RL._testFallback = () => fallback(true); // debug: exercise the fallback path (not remembered)

  /** Debug / console: G.rlight.info() */
  RL.info = () => ({
    patched: R.patched,
    safeMode: !!RL.safeMode,
    fellBack,
    cascades: RL.cascadeInfo ? RL.cascadeInfo() : null,
    probes: RL.probeInfo ? RL.probeInfo() : null,
    contact: RL.contactInfo ? RL.contactInfo() : null,
    bake: RL.bakeInfo ? RL.bakeInfo() : null,
    lights: RL.lightsInfo ? RL.lightsInfo() : null,
    nearMap: RL.debug && RL._nearAscii ? RL._nearAscii(48) : undefined,
    meshes: RL.debug
      ? (() => {
          const out = [];
          const c = G.camera.position;
          const b = new THREE.Box3();
          G.scene.traverse((o) => {
            if (!o.isMesh || out.length > 60) return;
            b.setFromObject(o);
            if (b.isEmpty() || b.distanceToPoint(c) > 12) return;
            let v = true;
            for (let p = o; p; p = p.parent) if (!p.visible) v = false;
            out.push([
              o.name || o.type,
              o.castShadow ? 1 : 0,
              v ? 1 : 0,
              o.frustumCulled ? 1 : 0,
              o.layers.mask,
              Array.isArray(o.material) ? "arr" : o.material && o.material.type,
              o.material && o.material.side,
            ]);
          });
          return out;
        })()
      : undefined,
  });
