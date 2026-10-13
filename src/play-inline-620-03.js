// play-inline-620 03 — ctx
// Lines 694-1014 of readable/play-inline-620.pretty.js (statement-aligned).
  function paintArt(slide, t) {
    if (!artLayer) {
      artLayer = document.createElement("canvas");
      artLayer.width = 1600;
      artLayer.height = 900;
    }
    if (artSlide === slide && t - artT < 0.05 && t >= artT) return;
    artSlide = slide;
    artT = t;
    const a = artLayer.getContext("2d");
    a.setTransform(1, 0, 0, 1, 0, 0);
    a.globalCompositeOperation = "source-over";
    a.globalAlpha = 1;
    a.clearRect(0, 0, 1600, 900);
    try {
      (ART[slide.art] || ART.black)(a, t);
    } catch (e) {
      G.reportError("intro:art", e);
    }
  }
  /** Film look over the live 3D world: transparent canvas with a fade-up from black, vignette, band, grain, scratches. */
  function drawLiveFilm(ctx, w, h, t) {
    ctx.clearRect(0, 0, w, h);
    const up = Math.max(0, 1 - t / 1.1);
    if (up > 0) {
      ctx.fillStyle = "rgba(0,0,0," + up.toFixed(3) + ")";
      ctx.fillRect(0, 0, w, h);
    }
    const v = ctx.createRadialGradient(
      w / 2,
      h / 2,
      h * 0.34,
      w / 2,
      h / 2,
      Math.max(w, h) * 0.78,
    );
    v.addColorStop(0, "rgba(0,0,0,0)");
    v.addColorStop(1, "rgba(0,0,0,.7)");
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, w, h);
    const lb = ctx.createLinearGradient(0, h * 0.58, 0, h);
    lb.addColorStop(0, "rgba(0,0,0,0)");
    lb.addColorStop(1, "rgba(0,0,0,.66)");
    ctx.fillStyle = lb;
    ctx.fillRect(0, h * 0.58, w, h * 0.42);
    if (!grain) makeGrain();
    const ox = Math.random() * 256,
      oy = Math.random() * 256;
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.translate(-ox, -oy);
    ctx.fillStyle = ctx.createPattern(grain, "repeat");
    ctx.fillRect(ox, oy, w, h);
    ctx.restore();
    if (Math.random() < 0.25) {
      ctx.strokeStyle =
        "rgba(255,250,230," + (0.04 + Math.random() * 0.08) + ")";
      ctx.lineWidth = 1;
      const sx = Math.random() * w;
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx + (Math.random() - 0.5) * 20, h);
      ctx.stroke();
    }
  }
  function drawSlide(cv, slide, t) {
    const ctx = cv.getContext("2d");
    const w = cv.width,
      h = cv.height;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (I && I.live && I.slide === slide) {
      drawLiveFilm(ctx, w, h, t);
      return;
    }
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);
    // cover-fit the 1600x900 art with a slow Ken Burns push + gate weave
    const scale = Math.max(w / 1600, h / 900) * (1.02 + t * 0.006);
    const weaveX = Math.sin(t * 13.1) * 0.8,
      weaveY = Math.sin(t * 9.7) * 1.1;
    paintArt(slide, t);
    ctx.setTransform(
      scale,
      0,
      0,
      scale,
      (w - 1600 * scale) / 2 + weaveX,
      (h - 900 * scale) / 2 + weaveY,
    );
    ctx.drawImage(artLayer, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (slide.art !== "black") {
      // sepia wash & vignette
      ctx.globalCompositeOperation = "multiply";
      ctx.fillStyle =
        slide.art === "ruins" ? "rgba(200,220,170,1)" : "rgba(236,214,170,1)";
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "source-over";
      const v = ctx.createRadialGradient(
        w / 2,
        h / 2,
        h * 0.3,
        w / 2,
        h / 2,
        Math.max(w, h) * 0.75,
      );
      v.addColorStop(0, "rgba(0,0,0,0)");
      v.addColorStop(1, "rgba(0,0,0,.78)");
      ctx.fillStyle = v;
      ctx.fillRect(0, 0, w, h);
      // darken the lower third so the narration stays readable
      const lb = ctx.createLinearGradient(0, h * 0.55, 0, h);
      lb.addColorStop(0, "rgba(0,0,0,0)");
      lb.addColorStop(1, "rgba(0,0,0,.72)");
      ctx.fillStyle = lb;
      ctx.fillRect(0, h * 0.55, w, h * 0.45);
      // grain
      if (!grain) makeGrain();
      const ox = Math.random() * 256,
        oy = Math.random() * 256;
      ctx.save();
      ctx.translate(-ox, -oy);
      ctx.fillStyle = ctx.createPattern(grain, "repeat");
      ctx.fillRect(ox, oy, w, h);
      ctx.restore();
      // scratches & dust
      if (Math.random() < 0.35) {
        ctx.strokeStyle =
          "rgba(255,250,230," + (0.05 + Math.random() * 0.12) + ")";
        ctx.lineWidth = 1;
        const sx = Math.random() * w;
        ctx.beginPath();
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx + (Math.random() - 0.5) * 20, h);
        ctx.stroke();
      }
      for (let i = 0; i < 3; i++)
        if (Math.random() < 0.3) {
          ctx.fillStyle = "rgba(0,0,0,.5)";
          ctx.fillRect(
            Math.random() * w,
            Math.random() * h,
            2 + Math.random() * 3,
            2 + Math.random() * 3,
          );
        }
      // flicker
      ctx.fillStyle = "rgba(0,0,0," + Math.random() * 0.06 + ")";
      ctx.fillRect(0, 0, w, h);
    }
  }

  // ------------------------------------------------------------------
  // Live world shots (the render gate in 90_module lets the world draw while one is up)
  // ------------------------------------------------------------------
  function canLive() {
    return !!(
      G.camera &&
      G.player &&
      G.player.pos &&
      !G.isStub("map") &&
      G.state === "chargen" &&
      window.THREE
    );
  }
  function liveBegin(spec) {
    const P = G.player;
    if (!I.saved)
      I.saved = {
        pos: P.pos.clone(),
        cam: !!P.camOverride,
        fov: G.camera.fov,
        hour: G.time && G.time.hour,
      };
    P.camOverride = true;
    I.live = spec;
    try {
      if (spec.hour != null) {
        if (X.live("atmos") && G.atmos.setHour) G.atmos.setHour(spec.hour);
        else if (G.time) G.time.hour = spec.hour;
      }
    } catch (e) {
      /* ignore */
    }
    liveCamera(0);
  }
  function liveEnd() {
    if (!I || !I.saved) {
      if (I) I.live = null;
      return;
    }
    const s = I.saved,
      P = G.player;
    I.live = null;
    I.saved = null;
    try {
      P.pos.copy(s.pos);
      P.camOverride = s.cam;
      if (G.camera && G.camera.fov !== s.fov) {
        G.camera.fov = s.fov;
        G.camera.updateProjectionMatrix();
      }
    } catch (e) {
      /* ignore */
    }
  }
  const _lp = window.THREE ? new window.THREE.Vector3() : null,
    _ll = window.THREE ? new window.THREE.Vector3() : null;
  function liveCamera(u) {
    const L = I.live,
      C = G.camera;
    if (!L || !C || !_lp) return;
    const k = G.util.smoothstep(0, 1, X.clamp(u, 0, 1));
    const lerp3 = (out, a, b) =>
      out.set(
        a[0] + (b[0] - a[0]) * k,
        a[1] + (b[1] - a[1]) * k,
        a[2] + (b[2] - a[2]) * k,
      );
    lerp3(_lp, L.from, L.to);
    lerp3(_ll, L.look0, L.look1);
    C.position.copy(_lp);
    C.up.set(0, 1, 0);
    C.lookAt(_ll);
    const fov = L.fov || 55;
    if (Math.abs(C.fov - fov) > 0.01) {
      C.fov = fov;
      C.updateProjectionMatrix();
    }
    G.player.pos.set(_lp.x, 0, _lp.z); // LOD, shadow camera and ambience follow the shot (as the title flyover does)
  }

  // ------------------------------------------------------------------
  // Flow
  // ------------------------------------------------------------------
  function show(i) {
    if (!I) return;
    if (i >= SLIDES.length) {
      finish();
      return;
    }
    I.i = i;
    I.t = 0;
    I.chars = 0;
    const s = SLIDES[i];
    I.slide = s;
    I.text = typeof s.text === "function" ? String(s.text()) : s.text || "";
    if (s.live && canLive()) liveBegin(s.live);
    else liveEnd();
    ui.root.classList.toggle("live", !!I.live);
    ui.text.className = "cg-intro-text" + (s.title ? " title" : "");
    ui.root.classList.toggle("band", !!s.text && !s.title); // legibility band only under narrated art slides
    ui.text.innerHTML = "";
    // crossfade between two canvases
    const next = ui.cvs[I.front ^ 1];
    I.front ^= 1;
    next.classList.add("on");
    ui.cvs[I.front ^ 1].classList.remove("on");
    I.hold = s.hold || (s.title ? 3.8 : 2.8);
    if (s.art === "bombs") X.sfx("explosion", { volume: 0.8 });
    if (s.art === "pod") X.sfx("steam_hiss", { volume: 0.5 });
    if (s.art === "standby") X.sfx("hum_electric", { volume: 0.3 });
  }
  function advance() {
    if (!I) return;
    if (I.chars < I.text.length) {
      I.chars = I.text.length;
      paintText();
      return;
    }
    show(I.i + 1);
  }
  function paintText() {
    const s = I.slide,
      txt = I.text;
    const n = Math.floor(I.chars);
    ui.text.innerHTML =
      X.esc(txt.slice(0, n)) +
      (n < txt.length || s.title ? '<span class="cg-caret"></span>' : "");
  }
  function finish() {
    if (!I) return;
    const cb = I.onDone;
    stop();
    if (cb) cb();
  }
  function stop() {
    if (!I) return;
    liveEnd();
    I = null;
    X.popScreen(screen);
    if (ui) {
      const r = ui.root;
      ui = null;
      r.style.transition = "opacity .6s";
      r.style.opacity = "0";
      setTimeout(() => r.remove(), 650);
    }
  }

  const screen = {
    id: "intro",
    onKey(code) {
      if (!I) return false;
      if (code === "Escape") {
        finish();
        return true;
      }
      if (
        code === "Space" ||
        code === "Enter" ||
        code === "NumpadEnter" ||
        code === "KeyE"
      ) {
        advance();
        return true;
      }
      return true;
    },
  };

