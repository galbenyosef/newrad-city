// play-inline-45 04 — the
// Lines 728-968 of readable/play-inline-45.pretty.js (statement-aligned).
  A.prewarmFns = [];
  A.onPrewarm = (fn) => {
    A.prewarmFns.push(fn);
  };
  /**
   * Compile the materials of `root` (Object3D) for the world scene. async=true uses
   * renderer.compileAsync (parallel compile, no stall) when available → Promise.
   */
  A.compileFor = function (root, async) {
    const r = G.renderer;
    if (!r || !G.camera || !root) return Promise.resolve(false);
    const prevRT = r.getRenderTarget();
    const P = A.post;
    try {
      if (P && P.enabled && P.rtScene) r.setRenderTarget(P.rtScene);
      if (async && typeof r.compileAsync === "function") {
        const pr = r.compileAsync(root, G.camera, G.scene); // synchronous part (program creation) happens here
        r.setRenderTarget(prevRT);
        return Promise.resolve(pr).then(
          () => true,
          () => false,
        );
      }
      r.compile(root, G.camera, G.scene);
    } catch (e) {
      /* older three: ignore */
    }
    r.setRenderTarget(prevRT);
    return Promise.resolve(true);
  };
  function prewarm() {
    if (!A.prewarmFns.length || !G.renderer || !G.camera) return;
    const t0 = performance.now();
    const root = new THREE.Scene();
    root.fog = G.scene.fog;
    for (const fn of A.prewarmFns) {
      try {
        const objs = fn() || [];
        for (const o of objs)
          if (o) {
            o.frustumCulled = false;
            root.add(o);
          }
      } catch (e) {
        G.reportError("init:atmosphere/prewarm", e);
      }
    }
    A.compileFor(root, false);
    root.traverse((o) => {
      if (
        o.isMesh &&
        o.geometry &&
        o.geometry.userData &&
        o.geometry.userData.prewarmTemp
      )
        o.geometry.dispose();
    });
    A.prewarmMs = Math.round(performance.now() - t0);
  }
  A._prewarm = prewarm;

  // ------------------------------------------------------------------
  // Module registration
  // ------------------------------------------------------------------
  function interiorKeyAt(p) {
    const L = G.LAYOUT;
    if (!L || p.x < L.INTERIOR_X_MIN) return null;
    let best = null,
      bd = 1e9;
    for (const k in L.INTERIORS) {
      const o = L.INTERIORS[k].origin;
      const d = Math.hypot(p.x - o.x, p.z - o.z);
      if (d < bd) {
        bd = d;
        best = k;
      }
    }
    return best || "interior";
  }
  A.interiorKeyAt = interiorKeyAt;

  // ------------------------------------------------------------------
  // Headless screenshot helper (?shot=…): Chrome's --screenshot does not
  // always pick up the WebGL canvas when no further animation frames are
  // produced, so after core's runShot() finishes we copy the final frame
  // into an <img> layered over the canvas (below #ui-root). SHOT mode only.
  // ------------------------------------------------------------------
  if (G.SHOT) {
    G.events.on("initDone", () =>
      setTimeout(() => {
        try {
          const c = G.renderer && G.renderer.domElement;
          if (!c) return;
          // Only overlay a frame that actually contains an image: if the drawing buffer was
          // already cleared (black), an overlay would HIDE a valid canvas instead of fixing it.
          try {
            const probe = document.createElement("canvas");
            probe.width = 48;
            probe.height = 27;
            const pg = probe.getContext("2d");
            pg.drawImage(c, 0, 0, 48, 27);
            const px = pg.getImageData(0, 0, 48, 27).data;
            let sum = 0;
            for (let i = 0; i < px.length; i += 4)
              sum += px[i] + px[i + 1] + px[i + 2];
            if (sum / (px.length / 4) < 6) {
              console.warn(
                "[atmosphere] shot: frame buffer looks empty, no overlay",
              );
              return;
            }
          } catch (e) {
            /* tainted/unsupported → just overlay */
          }
          const img = document.createElement("img");
          img.src = c.toDataURL("image/png");
          img.id = "atmos-shot-frame";
          img.style.cssText =
            "position:absolute;left:0;top:0;width:100%;height:100%;z-index:1;pointer-events:none";
          (document.getElementById("game-root") || document.body).appendChild(
            img,
          );
          // the overlay is only for the capture: as soon as the game renders another frame
          // (someone keeps the loop running after the shot) it is removed again
          A.shotOverlay = img;
          const t0 = performance.now();
          A.onFrameRendered = () => {
            if (performance.now() - t0 > 1500 && A.shotOverlay) {
              A.shotOverlay.remove();
              A.shotOverlay = null;
              A.onFrameRendered = null;
            }
          };
        } catch (e) {
          /* ignore */
        }
      }, 0),
    );
  }

  G.registerModule({
    name: "atmosphere",
    order: 15,
    init: function () {
      A.quality = ATMOS.quality = G.SMOKE ? "medium" : "high";
      try {
        const q = localStorage.getItem("nrc_gfx_quality");
        if (q) A.quality = ATMOS.quality = q;
      } catch (e) {
        /* ignore */
      }
      for (const s of A.systems) {
        if (!s.init) continue;
        const t0 = performance.now();
        try {
          s.init();
        } catch (e) {
          s._dead = true;
          G.reportError("init:atmosphere/" + s.name, e);
        }
        s._initMs = Math.round(performance.now() - t0);
      }
      G.events.on("initDone", () => {
        try {
          prewarm();
        } catch (e) {
          G.reportError("event:initDone/atmosphere-prewarm", e);
        }
      });
      G.events.on("reset", () => {
        A.flushTimersOnReset();
        for (const s of A.systems)
          if (s.reset && !s._dead) {
            try {
              s.reset();
            } catch (e) {
              G.reportError("event:reset/atmosphere/" + s.name, e);
            }
          }
      });
      A.ready = true;
    },
    update: function (dt, realDt) {
      // visual time: world time while the world runs; real time on the title screen/menus
      // that show the world in motion (title, chargen); frozen in the goggles menu / pause.
      const st = G.state;
      const animDt = G.worldRunning()
        ? dt
        : st === "title" ||
            st === "loading" ||
            st === "chargen" ||
            st === "dead"
          ? realDt
          : 0;
      A.animDt = animDt;
      A.animTime += animDt;
      A.realTime += realDt;
      if (G.camera) A.camPos.copy(G.camera.position);
      // interior detection (camera-based: title camera, cutscene cams etc.)
      const key = interiorKeyAt(A.camPos);
      const inter = !!key;
      if (inter !== ATMOS.interior || key !== ATMOS.interiorKey) {
        ATMOS.interior = inter;
        ATMOS.interiorKey = key;
        A.envSnap = true; // snap environment on transitions (doors fade to black anyway)
        G.events.emit("atmosInterior", inter, key);
      }
      if (!inter && G.LAYOUT)
        ATMOS.district = G.LAYOUT.districtAt(A.camPos.x, A.camPos.z);
      else ATMOS.district = "interior";
      runTimers(animDt);
      for (const s of A.systems) {
        if (s._dead || !s.update) continue;
        try {
          s.update(dt, realDt, animDt);
        } catch (e) {
          G.reportError("update:atmosphere/" + s.name, e);
          s._errs = (s._errs || 0) + 1;
          if (s._errs > 30) s._dead = true;
        }
      }
    },
    lateUpdate: function (dt, realDt) {
      if (G.camera) {
        G.camera.updateMatrixWorld();
        A.camPos.copy(G.camera.position);
      }
      const animDt = A.animDt || 0;
      for (const s of A.systems) {
        if (s._dead || !s.late) continue;
        try {
          s.late(dt, realDt, animDt);
        } catch (e) {
          G.reportError("late:atmosphere/" + s.name, e);
          s._errs = (s._errs || 0) + 1;
          if (s._errs > 30) s._dead = true;
        }
      }
      A.envSnap = false;
    },
  });
