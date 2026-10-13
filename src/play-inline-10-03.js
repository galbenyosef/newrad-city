// play-inline-10 03 — ctx
// Lines 662-992 of readable/play-inline-10.pretty.js (statement-aligned).
  X.speckle = function (ctx, w, h, r, opts, hctx) {
    const n = opts.count || 500,
      cols = opts.colors || ["#000"],
      s0 = opts.min || 0.5,
      s1 = opts.max || 2,
      a = opts.alpha === undefined ? 1 : opts.alpha;
    const styles = cols.map((c) =>
      [0.5, 0.7, 0.85, 1].map((k) => X.css(c, a * k)),
    );
    for (let i = 0; i < n; i++) {
      const x = r() * w,
        y = r() * h,
        s = s0 + r() * r() * (s1 - s0);
      ctx.fillStyle = styles[(r() * cols.length) | 0][(r() * 4) | 0];
      if (s < 1.4) ctx.fillRect(x - s * 0.5, y - s * 0.5, s, s);
      else {
        ctx.beginPath();
        ctx.arc(x, y, s, 0, Math.PI * 2);
        ctx.fill();
      }
      if (hctx && opts.height !== undefined) {
        hctx.fillStyle = opts.height;
        if (s < 1.4) hctx.fillRect(x - s * 0.5, y - s * 0.5, s, s);
        else {
          hctx.beginPath();
          hctx.arc(x, y, s, 0, Math.PI * 2);
          hctx.fill();
        }
      }
    }
  };
  /** Irregular polygon blob path (for chips, peeled paint, puddles). */
  X.blobPath = function (ctx, x, y, radius, r, pts, rough) {
    pts = pts || 10;
    rough = rough === undefined ? 0.45 : rough;
    ctx.beginPath();
    for (let i = 0; i <= pts; i++) {
      const a = ((i % pts) / pts) * Math.PI * 2,
        rr = radius * (1 - rough / 2 + r() * rough);
      const px = x + Math.cos(a) * rr,
        py = y + Math.sin(a) * rr;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  };
  /** Smooth blob using quadratic curves between jittered points. */
  X.smoothBlob = function (ctx, x, y, rx, ry, r, pts, rough) {
    pts = pts || 12;
    rough = rough === undefined ? 0.35 : rough;
    const P = [];
    for (let i = 0; i < pts; i++) {
      const a = (i / pts) * Math.PI * 2,
        k = 1 - rough / 2 + r() * rough;
      P.push([x + Math.cos(a) * rx * k, y + Math.sin(a) * ry * k]);
    }
    ctx.beginPath();
    const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    let m = mid(P[pts - 1], P[0]);
    ctx.moveTo(m[0], m[1]);
    for (let i = 0; i < pts; i++) {
      const n = P[(i + 1) % pts],
        mm = mid(P[i], n);
      ctx.quadraticCurveTo(P[i][0], P[i][1], mm[0], mm[1]);
    }
    ctx.closePath();
  };

  // ------------------------------------------------------------------
  // Height -> normal map (tileable Sobel). height: Float32Array 0..1.
  // step: sample every `step` pixels (normal maps can be half-res).
  // ------------------------------------------------------------------
  X.heightFromCtx = function (hctx, w, h) {
    const d = hctx.getImageData(0, 0, w, h).data,
      out = new Float32Array(w * h);
    for (let i = 0, o = 0; i < out.length; i++, o += 4) out[i] = d[o] / 255;
    return out;
  };
  /** Tileable separable box blur (radius r) of a Float32 field, in place. */
  X.blurField = function (f, w, h, radius) {
    radius = radius || 1;
    const tmp = new Float32Array(w * h),
      k = 1 / (radius * 2 + 1);
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        let a = 0;
        for (let d = -radius; d <= radius; d++)
          a += f[y * w + ((x + d + w) % w)];
        tmp[y * w + x] = a * k;
      }
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        let a = 0;
        for (let d = -radius; d <= radius; d++)
          a += tmp[((y + d + h) % h) * w + x];
        f[y * w + x] = a * k;
      }
    return f;
  };
  X.normalCanvas = function (height, w, h, strength, step) {
    step = step || 1;
    X.blurField(height, w, h, step); // kill per-pixel noise: normal maps should read as form, not static
    const nw = Math.max(1, (w / step) | 0),
      nh = Math.max(1, (h / step) | 0);
    const cv = X.canvas(nw, nh);
    const img = cv.ctx.createImageData(nw, nh),
      d = img.data;
    const H = (x, y) => height[(((y % h) + h) % h) * w + (((x % w) + w) % w)];
    const s = strength || 2;
    for (let y = 0; y < nh; y++)
      for (let x = 0; x < nw; x++) {
        const X0 = x * step,
          Y0 = y * step;
        const tl = H(X0 - step, Y0 - step),
          t = H(X0, Y0 - step),
          tr = H(X0 + step, Y0 - step);
        const l = H(X0 - step, Y0),
          rr = H(X0 + step, Y0);
        const bl = H(X0 - step, Y0 + step),
          b = H(X0, Y0 + step),
          br = H(X0 + step, Y0 + step);
        const dx = tr + 2 * rr + br - (tl + 2 * l + bl);
        const dy = bl + 2 * b + br - (tl + 2 * t + tr);
        let nx = -dx * s,
          ny = dy * s,
          nz = 1; // canvas y down -> flip for OpenGL-style normal maps
        const len = Math.hypot(nx, ny, nz);
        nx /= len;
        ny /= len;
        nz /= len;
        const o = (y * nw + x) * 4;
        d[o] = (nx * 0.5 + 0.5) * 255;
        d[o + 1] = (ny * 0.5 + 0.5) * 255;
        d[o + 2] = (nz * 0.5 + 0.5) * 255;
        d[o + 3] = 255;
      }
    cv.ctx.putImageData(img, 0, 0);
    return cv.c;
  };

  // ------------------------------------------------------------------
  // Typography
  // ------------------------------------------------------------------
  X.FONTS = {
    script:
      '"Brush Script MT","Brush Script Std","Snell Roundhand","Segoe Script","Lucida Handwriting",cursive',
    impact:
      'Impact,"Haettenschweiler","Arial Black","Arial Narrow Bold",sans-serif',
    condensed: '"Oswald","DIN Condensed","Arial Narrow",Impact,sans-serif',
    serif: 'Georgia,"Times New Roman",serif',
    didone: '"Bodoni 72","Didot","Bodoni MT","Big Caslon",Georgia,serif',
    slab: '"Rockwell","American Typewriter","Roboto Slab","Courier New",serif',
    deco: '"Futura","Century Gothic","Avenir Next","Trebuchet MS",sans-serif',
    copper:
      '"Copperplate","Copperplate Gothic Bold","Engravers MT",Georgia,serif',
    typewriter: '"Special Elite","American Typewriter","Courier New",monospace',
    mono: '"Share Tech Mono","Courier New",monospace',
    marker: '"Marker Felt","Chalkboard SE","Comic Sans MS",cursive',
    helv: '"Helvetica Neue",Helvetica,Arial,sans-serif',
    black: '"Arial Black","Helvetica Neue",Arial,sans-serif',
    rounded:
      '"Arial Rounded MT Bold","Arial Rounded","Varela Round","Trebuchet MS",sans-serif',
    stencil: '"Stencil","Stencil Std","Impact","Arial Black",sans-serif',
    fancy: '"Herculanum","Papyrus","Copperplate",fantasy',
  };
  /** ctx.font string with size clamped so text fits maxW. Returns final size. `extra(size)` = decoration width. */
  X.setFont = function (ctx, text, size, family, maxW, weight, italic, extra) {
    const f = X.FONTS[family] || family;
    let s = size;
    const mk = () =>
      (italic ? "italic " : "") +
      (weight || "bold") +
      " " +
      Math.round(s) +
      "px " +
      f;
    ctx.font = mk();
    if (maxW) {
      // two passes: decorations (stroke, skew, extrusion) scale with the size
      for (let pass = 0; pass < 2; pass++) {
        const m = ctx.measureText(text).width + (extra ? extra(s) : 0);
        if (m > maxW) {
          s = Math.max(6, (s * maxW) / m);
          ctx.font = mk();
        } else break;
      }
    }
    return s;
  };
  /**
   * Optional safe area for lettering, in the CURRENT drawing coordinates: {x0, x1}. While set (e.g. by the
   * billboard renderer), X.text shrinks any line that would cross it — so no slogan is ever cut by the frame.
   */
  X.textSafe = null;
  /**
   * Draw styled text. o: {size, font, weight, italic, color, stroke, strokeW, shadow ('#000'), shadowOff, align, base,
   *   maxW, skew (x shear), spacing (px), glow, extrude:{color, dx, dy, n}}
   * maxW is honoured INCLUDING letter-spacing, outline, skew and extrusion (all widen the ink).
   */
  X.text = function (ctx, str, x, y, o) {
    o = o || {};
    str = String(str);
    ctx.save();
    ctx.textAlign = o.align || "center";
    ctx.textBaseline = o.base || "middle";
    // letter-spacing must be active while measuring (it widens the line)
    const hasLS = "letterSpacing" in ctx;
    if (hasLS) ctx.letterSpacing = (o.spacing || 0) + "px";
    const extra = (s) => {
      const k = s / (o.size || 32);
      let e =
        (o.stroke ? (o.strokeW || s * 0.12) * k : 0) +
        Math.abs(o.skew || 0) * s * 0.8 +
        (o.italic ? s * 0.08 : 0);
      if (o.extrude) e += Math.abs(o.extrude.dx || 1) * (o.extrude.n || 6);
      if (o.shadow) e += o.shadowOff || s * 0.06;
      if (!hasLS && o.spacing) e += o.spacing * str.length;
      return e;
    };
    let maxW = o.maxW || 0;
    const safe = X.textSafe;
    if (safe && !o.noSafe) {
      const al = ctx.textAlign;
      const room =
        al === "center"
          ? 2 * Math.min(x - safe.x0, safe.x1 - x)
          : al === "left" || al === "start"
            ? safe.x1 - x
            : x - safe.x0;
      if (room > 10) maxW = maxW ? Math.min(maxW, room) : room;
    }
    const size = X.setFont(
      ctx,
      str,
      o.size || 32,
      o.font || "impact",
      maxW || null,
      o.weight,
      o.italic,
      extra,
    );
    ctx.translate(x, y);
    if (o.skew) ctx.transform(1, 0, o.skew, 1, 0, 0);
    if (o.scaleY) ctx.scale(1, o.scaleY);
    const sk = size / (o.size || 32);
    if (o.extrude) {
      // 3-D block letters, very 50s
      const e = o.extrude,
        n = e.n || 6;
      ctx.fillStyle = X.css(e.color || "#000");
      for (let i = n; i >= 1; i--)
        ctx.fillText(str, (e.dx || 1) * i, (e.dy || 1) * i);
    }
    if (o.shadow) {
      ctx.fillStyle = X.css(o.shadow, o.shadowA || 0.6);
      const so = o.shadowOff || size * 0.06;
      ctx.fillText(str, so, so);
    }
    if (o.glow) {
      ctx.shadowColor = X.css(o.glow);
      ctx.shadowBlur = o.glowBlur || size * 0.4;
    }
    if (o.stroke) {
      ctx.lineJoin = "round";
      ctx.strokeStyle = X.css(o.stroke);
      ctx.lineWidth =
        (o.strokeW || (o.size || 32) * 0.12) * Math.min(1, sk * 1.15);
      ctx.strokeText(str, 0, 0);
    }
    ctx.fillStyle = o.fill || X.css(o.color || "#fff");
    ctx.fillText(str, 0, 0);
    if (o.inner) {
      ctx.strokeStyle = X.css(o.inner);
      ctx.lineWidth = o.innerW || 1;
      ctx.strokeText(str, 0, 0);
    }
    if (X.textCapture) captureText(ctx, str, size, o);
    ctx.restore();
    return size;
  };
  /**
   * While X.textCapture is an array, every X.text call records its device-space bounding box
   * {x, y, w, h, size} (size in device px). 32_ads.js uses this to keep weathering off brand wordmarks.
   */
  X.textCapture = null;
  function captureText(ctx, str, size, o) {
    try {
      const w = ctx.measureText(str).width,
        h = size * 1.05;
      const al = ctx.textAlign,
        bl = ctx.textBaseline;
      const x0 =
        al === "center" ? -w / 2 : al === "right" || al === "end" ? -w : 0;
      const y0 =
        bl === "middle"
          ? -h / 2
          : bl === "top"
            ? 0
            : bl === "bottom"
              ? -h
              : -h * 0.8;
      const m = ctx.getTransform();
      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
      for (const [px, py] of [
        [x0, y0],
        [x0 + w, y0],
        [x0, y0 + h],
        [x0 + w, y0 + h],
      ]) {
        const X1 = m.a * px + m.c * py + m.e,
          Y1 = m.b * px + m.d * py + m.f;
        minX = Math.min(minX, X1);
        maxX = Math.max(maxX, X1);
        minY = Math.min(minY, Y1);
        maxY = Math.max(maxY, Y1);
      }
      X.textCapture.push({
        x: minX,
        y: minY,
        w: maxX - minX,
        h: maxY - minY,
        size: maxY - minY,
      });
    } catch (e) {
      /* capture is best-effort */
    }
  }
  /** Text along a circular arc (centre cx,cy, radius), centred on angle `mid` (radians, -PI/2 = top). */
