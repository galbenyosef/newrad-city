// play-inline-458 09 — tpl
// Lines 2468-2766 of readable/play-inline-458.pretty.js (statement-aligned).
  function paintHairline(ctx, F, R) {
    const keep = F.hairKeep;
    if (typeof keep !== "function") return;
    ensureLUT();
    const hc = L.col(F.hairColor || 0x3a2616),
      sk = L.col(F.skin);
    const yMax = Math.floor(FT * TV * 0.78); // rows below the ears/nape never carry hair
    const img = ctx.getImageData(0, 0, FT, yMax),
      D = img.data;
    const q = [0, 0, 0];
    const up = (x, y, z, d) => {
      const yy = y + d,
        l = Math.hypot(x, yy, z) || 1;
      q[0] = x / l;
      q[1] = yy / l;
      q[2] = z / l;
      return keep(q[0], q[1], q[2]);
    };
    // half-resolution coverage field: 0 bald … 1 fully covered
    const HW = FT >> 1,
      HH = (yMax >> 1) + 1,
      cov = new Float32Array(HW * HH);
    for (let j = 0; j < HH; j++) {
      const py = Math.min(yMax - 1, j * 2),
        st = rowT[py * 2],
        y = rowT[py * 2 + 1];
      if (y < -0.45) continue;
      for (let i = 0; i < HW; i++) {
        const px = i * 2,
          x = st * colA[px * 2],
          z = -st * colA[px * 2 + 1];
        let c = 0;
        if (keep(x, y, z)) c = 1;
        else if (up(x, y, z, 0.1))
          c = up(x, y, z, 0.03) ? 0.7 : up(x, y, z, 0.06) ? 0.4 : 0.15;
        cov[j * HW + i] = c;
      }
    }
    // blur the field (2× separable box, r=2): the face map is sparse at the
    // temples/behind the ears, where a hard 0/1 edge renders as blocky black
    // blotches; a soft field gives a thinning, strand-broken hairline instead.
    // (running-sum box: O(1) per texel per pass, edge-clamped)
    const tmp = new Float32Array(HW * HH);
    const box = (src, dst, n, count, stride, step) => {
      for (let l = 0; l < count; l++) {
        const o = l * stride;
        let s = src[o] * 3 + src[o + step] + src[o + 2 * step];
        for (let i = 0; i < n; i++) {
          dst[o + i * step] = s / 5;
          s +=
            src[o + Math.min(n - 1, i + 3) * step] -
            src[o + Math.max(0, i - 2) * step];
        }
      }
    };
    if (HW > 3 && HH > 3)
      for (let pass = 0; pass < 2; pass++) {
        box(cov, tmp, HW, HH, HW, 1);
        box(tmp, cov, HH, HW, 1, HW);
      }
    for (let py = 0; py < yMax; py++) {
      const j = py >> 1;
      for (let px = 0; px < FT; px++) {
        const c = cov[j * HW + (px >> 1)];
        if (c <= 0) continue;
        const k = (py * FT + px) * 4;
        // strand noise: streaks running down (crown → hairline), finer at the edge
        const h =
          hash2(px, Math.floor(py / 3)) * 0.6 + hash2(px * 7 + 1, py) * 0.4;
        if (c <= 0.02) continue;
        if (c >= 0.97 || h < (c - 0.15) * 1.05) {
          // × HAIR_MATCH: the hair SHELL is the hair colour × the sRGB fur atlas
          // (≈0.55 linear on average); painted scalp hair at the full colour
          // read ~1.6× brighter than the shell above it — a pale "headband"
          const v =
            (0.6 + 0.55 * h) * (c >= 0.97 ? 1 : 0.9 + 0.2 * c) * HAIR_MATCH;
          D[k] = Math.sqrt(clamp(hc.r * v, 0, 1)) * 255;
          D[k + 1] = Math.sqrt(clamp(hc.g * v, 0, 1)) * 255;
          D[k + 2] = Math.sqrt(clamp(hc.b * v, 0, 1)) * 255;
          D[k + 3] = 51;
        } else if (D[k + 3] > 60) {
          // bare skin between strands: shadowed & tinted toward the hair (hair roots)
          const t = c * 0.55;
          D[k] *= 1 - t * (1 - clamp((hc.r + 0.02) / (sk.r + 0.02), 0.3, 1));
          D[k + 1] *=
            1 - t * (1 - clamp((hc.g + 0.02) / (sk.g + 0.02), 0.3, 1));
          D[k + 2] *=
            1 - t * (1 - clamp((hc.b + 0.02) / (sk.b + 0.02), 0.3, 1));
        }
      }
    }
    ctx.putImageData(img, 0, 0);
  }
  L.paintHairline = paintHairline;

  /** Build the per-template face texture from meta.face. */
  function buildTemplateFace(F) {
    if (!L.faceGeneric()) return null;
    const cv = document.createElement("canvas");
    cv.width = cv.height = FT;
    const ctx = cv.getContext("2d");
    // start from the shared per-pixel base (no brows yet)
    ctx.drawImage(faceBase(), 0, 0);
    const R = L.rng(((F.seed || 1) * 2654435761) >>> 0);
    if (F.maniac) paintManiac(ctx, F, R);
    if (F.mutant) paintMutant(ctx, R);
    const mcv = document.createElement("canvas");
    mcv.width = mcv.height = FT;
    paintBrows(ctx, F, R, F.maniac ? 0.8 : 1, mcv.getContext("2d"));
    const male = F.gender !== "f";
    if (male && !F.mutant) {
      // (a full beard's shell grows out of a heavy painted shadow: gaps & edges read as hair, not skin)
      const st =
        F.beard === "stubble" || F.beard === "full"
          ? "heavy"
          : F.beard
            ? "light"
            : R() < 0.55
              ? "light"
              : null;
      if (st) paintStubble(ctx, F, R, st);
    }
    if (F.age > 0.35) paintAge(ctx, F, R);
    if (
      !F.maniac &&
      !F.mutant &&
      (F.freckles || (R() < 0.18 && L.col(F.skin).r > 0.55))
    )
      paintFreckles(ctx, R);
    if (
      F.scars !== false &&
      (F.scars || R() < (F.paint === "raider" || F.maniac ? 0.6 : 0.18))
    )
      paintScar(ctx, R);
    if (F.burn) paintBurn(ctx, F, R);
    if (F.pallor) paintPallor(ctx, F);
    if (F.paint === "raider") paintWarPaint(ctx, F);
    if (
      !male &&
      !F.maniac &&
      F.makeup !== false &&
      (F.makeup === true || R() < 0.8)
    )
      paintMakeup(ctx, F);
    paintDirt(
      ctx,
      R,
      F.dirt !== undefined ? F.dirt : F.paint === "raider" ? 1 : 0.55,
    );
    markHair(ctx, mcv, null, F.hairColor, browColor(F.hairColor || 0x3a2616));
    if (F.hairKeep) {
      try {
        paintHairline(ctx, F, R);
      } catch (e) {
        if (G.reportError) G.reportError("chars.hairline", e);
      }
    }
    return makeTex(cv);
  }

  // LRU of per-template textures (512² RGBA ≈ 1.4 MB with mips each)
  // The cache is ADAPTIVE: MAX_FACE_TEX is a soft cap — only faces no nearby
  // character asked for in the last ~2 s are evicted, so a crowd that needs
  // 25 distinct faces at once (The Neon's market) grows the cache (up to the
  // hard cap) instead of evicting and rebuilding faces every few frames.
  const FACE_LRU = new Map();
  L.MAX_FACE_TEX = 16;
  L.MAX_FACE_TEX_HARD = 40;
  const NEED_FRAMES = 120;
  /** Ensure `tpl` has its own face texture; returns it (or null). */
  let lastBuildFrame = -1;
  const frameNow = () =>
    G.time && G.time.frame !== undefined ? G.time.frame : -2;
  // Evicted faces are KEPT at 256² (≈0.35 MB with mips, LRU of 48): beyond
  // ~8 m nobody can tell, so a crowd that walks out of the hi-res budget keeps
  // its painted faces (no fall back to the generic face, no repaint wave when
  // it comes back); within 8 m / when talking the full 512² map is repainted.
  const LO_LRU = new Map();
  L.MAX_FACE_TEX_LO = 48;
  L.FACE_HI_D2 = 8 * 8;
  function keepLo(tpl, tex) {
    try {
      const src = tex && tex.image;
      if (!src || !src.width || tpl.disposed) return null;
      const cv = document.createElement("canvas");
      cv.width = cv.height = FT >> 1;
      const cx = cv.getContext("2d");
      cx.imageSmoothingEnabled = true;
      if ("imageSmoothingQuality" in cx) cx.imageSmoothingQuality = "high";
      cx.drawImage(src, 0, 0, cv.width, cv.height);
      const t = makeTex(cv);
      t.name = "faceTexLo";
      t.anisotropy = 2;
      if (tpl.faceTexLo) tpl.faceTexLo.dispose();
      tpl.faceTexLo = t;
      LO_LRU.delete(tpl.key);
      LO_LRU.set(tpl.key, tpl);
      while (LO_LRU.size > L.MAX_FACE_TEX_LO) {
        const [k0, t0] = LO_LRU.entries().next().value;
        LO_LRU.delete(k0);
        if (t0.faceTexLo) {
          const gen = L.faceGeneric();
          if (L.live)
            for (const ch of L.live)
              if (
                ch.tpl === t0 &&
                ch.material &&
                ch.material.userData.uniforms.uFaceMap.value === t0.faceTexLo
              )
                ch.material.userData.uniforms.uFaceMap.value = gen;
          t0.faceTexLo.dispose();
          t0.faceTexLo = null;
        }
      }
      return t;
    } catch (e) {
      if (G.reportError) G.reportError("chars.faceLo", e);
      return null;
    }
  }
  function evictFace(k, old) {
    FACE_LRU.delete(k);
    const lo = old.disposed ? null : keepLo(old, old.faceTex);
    const gen = lo || L.faceGeneric();
    if (L.live)
      for (const ch of L.live)
        if (ch.tpl === old && ch.material)
          ch.material.userData.uniforms.uFaceMap.value = gen;
    if (old.faceTex) {
      old.faceTex.dispose();
      old.faceTex = null;
    }
  }
  /** Drop a disposed template's low-res face (template LRU eviction). */
  L.faceTexDrop = function (tpl) {
    if (!tpl) return;
    if (tpl.faceTexLo) {
      tpl.faceTexLo.dispose();
      tpl.faceTexLo = null;
    }
    LO_LRU.delete(tpl.key);
    if (tpl.faceTex && FACE_LRU.get(tpl.key) === tpl) {
      FACE_LRU.delete(tpl.key);
      tpl.faceTex.dispose();
      tpl.faceTex = null;
    }
  };
  L.faceTexFor = function (tpl, force, d2) {
    if (!tpl || !tpl.meta || !tpl.meta.face || tpl.disposed) return null;
    const frame = frameNow();
    tpl._faceNeed = frame;
    if (tpl.faceTex) {
      FACE_LRU.delete(tpl.key);
      FACE_LRU.set(tpl.key, tpl);
      return tpl.faceTex;
    }
    // a kept 256² copy serves everyone beyond ~8 m (d2 undefined = no distance → hi-res wanted)
    if (tpl.faceTexLo && !force) {
      LO_LRU.delete(tpl.key);
      LO_LRU.set(tpl.key, tpl);
      if (d2 !== undefined && d2 > L.FACE_HI_D2) return tpl.faceTexLo;
      if (frame === lastBuildFrame && frame >= 0) return tpl.faceTexLo;
    }
    // budget: at most one new face texture per frame (unless a line is being spoken now)
    if (!force && frame === lastBuildFrame && frame >= 0) return null;
    lastBuildFrame = frame;
    try {
      tpl.faceTex = buildTemplateFace(tpl.meta.face);
    } catch (e) {
      if (G.reportError) G.reportError("chars.faceTex", e);
      tpl.faceTex = null;
    }
    if (!tpl.faceTex) return tpl.faceTexLo || null;
    FACE_LRU.set(tpl.key, tpl);
    while (FACE_LRU.size > L.MAX_FACE_TEX) {
      let victim = null;
      const hard = FACE_LRU.size > L.MAX_FACE_TEX_HARD;
      for (const [k, t] of FACE_LRU) {
        if (t === tpl) continue;
        if (
          hard ||
          frame < 0 ||
          t.disposed ||
          frame - (t._faceNeed === undefined ? -1e9 : t._faceNeed) > NEED_FRAMES
        ) {
          victim = [k, t];
          break;
        }
      }
      if (!victim) break; // every cached face is on screen right now: grow (≤ hard cap)
      evictFace(victim[0], victim[1]);
    }
    return tpl.faceTex;
  };
  /** Was a face texture built this frame? (idle-frame prefetch uses the spare budget) */
  L.faceBuiltThisFrame = () => lastBuildFrame === frameNow();
  L.faceTexCount = () => FACE_LRU.size;
  L.faceTexLoCount = () => LO_LRU.size;
  H.sculptFace = sculpt;
