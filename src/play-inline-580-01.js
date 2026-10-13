// play-inline-580 01 — rnd
// Lines 24-345 of readable/play-inline-580.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const QX = G.qx;
  const K = () => QX.kit;

  // seeded rng so the dressing is identical every run
  let seed = 6741;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  // ------------------------------------------------------------------
  // Procedural textures (built once)
  // ------------------------------------------------------------------
  /** Tileable ripple normal map: sum of integer-frequency waves (wraps exactly). */
  function rippleNormal() {
    const N = 256,
      c = document.createElement("canvas");
    c.width = c.height = N;
    const x = c.getContext("2d");
    const img = x.createImageData(N, N);
    const waves = [];
    for (let i = 0; i < 14; i++) {
      const k = 1 + Math.floor(rnd() * 7),
        a = rnd() * Math.PI * 2;
      waves.push({
        kx: Math.round(Math.cos(a) * k),
        ky: Math.round(Math.sin(a) * k) || 1,
        amp: 1 / (1 + k * 0.6),
        ph: rnd() * Math.PI * 2,
      });
    }
    const T = (Math.PI * 2) / N;
    for (let j = 0; j < N; j++)
      for (let i = 0; i < N; i++) {
        let dx = 0,
          dy = 0;
        for (const w of waves) {
          const c0 = Math.cos((w.kx * i + w.ky * j) * T + w.ph) * w.amp;
          dx += c0 * w.kx;
          dy += c0 * w.ky;
        }
        let nx = -dx * 0.09,
          ny = -dy * 0.09,
          nz = 1;
        const l = Math.hypot(nx, ny, nz);
        nx /= l;
        ny /= l;
        nz /= l;
        const o = (j * N + i) * 4;
        img.data[o] = (nx * 0.5 + 0.5) * 255;
        img.data[o + 1] = (ny * 0.5 + 0.5) * 255;
        img.data[o + 2] = (nz * 0.5 + 0.5) * 255;
        img.data[o + 3] = 255;
      }
    x.putImageData(img, 0, 0);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  }
  /** Floating film: green-brown algae scum + a few rainbow oil slicks, alpha, wrapped so it tiles. */
  function scumTex() {
    const N = 512,
      c = document.createElement("canvas");
    c.width = c.height = N;
    const x = c.getContext("2d");
    const blob = (cx, cy, r, col) => {
      for (const ox of [-N, 0, N])
        for (const oy of [-N, 0, N]) {
          const g = x.createRadialGradient(
            cx + ox,
            cy + oy,
            0,
            cx + ox,
            cy + oy,
            r,
          );
          g.addColorStop(0, col);
          g.addColorStop(1, "rgba(0,0,0,0)");
          x.fillStyle = g;
          x.beginPath();
          x.arc(cx + ox, cy + oy, r, 0, Math.PI * 2);
          x.fill();
        }
    };
    for (let i = 0; i < 70; i++)
      blob(
        rnd() * N,
        rnd() * N,
        10 + rnd() * 46,
        "rgba(" +
          ((60 + rnd() * 30) | 0) +
          "," +
          ((72 + rnd() * 30) | 0) +
          ",30," +
          (0.25 + rnd() * 0.35).toFixed(2) +
          ")",
      );
    for (let i = 0; i < 160; i++)
      blob(
        rnd() * N,
        rnd() * N,
        3 + rnd() * 6,
        "rgba(90,96,48," + (0.2 + rnd() * 0.3).toFixed(2) + ")",
      );
    // oil sheen: a few soft, faintly iridescent smears (filled, never outlined — outlines read as stamped circles)
    for (let i = 0; i < 6; i++) {
      const cx = rnd() * N,
        cy = rnd() * N,
        r0 = 26 + rnd() * 40;
      const hues = [
        "rgba(150,90,170,0.07)",
        "rgba(70,130,190,0.07)",
        "rgba(90,170,120,0.06)",
        "rgba(200,170,80,0.06)",
      ];
      hues.forEach((h, k) =>
        blob(
          cx + (rnd() - 0.5) * 20,
          cy + (rnd() - 0.5) * 20,
          r0 * (1 - k * 0.15),
          h,
        ),
      );
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    if ("colorSpace" in t) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  /** Tiny equirect 'room' for the water to reflect: dark ceiling, bright tube lights, the pale tiled wall band. */
  function roomEnv() {
    const W = 512,
      H = 256;
    const t = canvasTex(W, H, (x) => {
      const g = x.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#111612");
      g.addColorStop(0.36, "#1e2621");
      g.addColorStop(0.47, "#44524a");
      g.addColorStop(0.5, "#2a332e");
      g.addColorStop(1, "#0a0c0b");
      x.fillStyle = g;
      x.fillRect(0, 0, W, H);
      // (no thin high-contrast lines here: rippled normals turn them into squiggles on the water)
      for (const [u, v, w] of [
        [0.06, 0.2, 40],
        [0.31, 0.26, 34],
        [0.56, 0.2, 40],
        [0.81, 0.26, 34],
        [0.19, 0.1, 24],
        [0.69, 0.1, 24],
      ]) {
        const cx = u * W,
          cy = v * H;
        const rg = x.createRadialGradient(cx, cy, 0, cx, cy, w);
        rg.addColorStop(0, "rgba(235,250,230,1)");
        rg.addColorStop(0.25, "rgba(200,230,200,0.7)");
        rg.addColorStop(1, "rgba(120,160,120,0)");
        x.fillStyle = rg;
        x.fillRect(cx - w, cy - w, w * 2, w * 2);
        x.fillStyle = "#f4fff0";
        x.fillRect(cx - w * 0.6, cy - 2, w * 1.2, 4);
      }
      for (const u of [0.43, 0.93]) {
        const cx = u * W,
          cy = H * 0.4;
        const rg = x.createRadialGradient(cx, cy, 0, cx, cy, 16);
        rg.addColorStop(0, "rgba(255,70,40,0.45)");
        rg.addColorStop(1, "rgba(255,40,20,0)");
        x.fillStyle = rg;
        x.fillRect(cx - 16, cy - 16, 32, 32);
      }
    });
    t.mapping = THREE.EquirectangularReflectionMapping;
    return t;
  }
  function ringTex() {
    const N = 128,
      c = document.createElement("canvas");
    c.width = c.height = N;
    const x = c.getContext("2d");
    const g = x.createRadialGradient(
      N / 2,
      N / 2,
      N * 0.3,
      N / 2,
      N / 2,
      N * 0.5,
    );
    g.addColorStop(0, "rgba(210,230,215,0)");
    g.addColorStop(0.55, "rgba(210,230,215,0.9)");
    g.addColorStop(0.7, "rgba(40,50,45,0.5)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, N, N);
    const g2 = x.createRadialGradient(
      N / 2,
      N / 2,
      N * 0.12,
      N / 2,
      N / 2,
      N * 0.22,
    );
    g2.addColorStop(0, "rgba(210,230,215,0)");
    g2.addColorStop(0.5, "rgba(210,230,215,0.45)");
    g2.addColorStop(1, "rgba(210,230,215,0)");
    x.fillStyle = g2;
    x.fillRect(0, 0, N, N);
    const t = new THREE.CanvasTexture(c);
    if ("colorSpace" in t) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  /** The Project Long Winter floor seal, painted on the pod-hall floor round the column: a six-armed frost star
   *  inside an orange ring, lettered PROJECT LONG WINTER · UNIT C-4 · O.C.D. */
  function emblemTex() {
    const N = 1024,
      c = document.createElement("canvas");
    c.width = c.height = N;
    const x = c.getContext("2d");
    const C = N / 2;
    x.translate(C, C);
    // orange ring with a frost-white inner pinstripe
    x.fillStyle = "rgba(216,100,30,0.92)";
    x.beginPath();
    x.arc(0, 0, C * 0.98, 0, Math.PI * 2);
    x.arc(0, 0, C * 0.62, 0, Math.PI * 2, true);
    x.fill("evenodd");
    x.lineWidth = C * 0.025;
    x.strokeStyle = "rgba(232,238,240,0.95)";
    x.beginPath();
    x.arc(0, 0, C * 0.6, 0, Math.PI * 2);
    x.stroke();
    // the frost star: six arms, each with two pairs of barbs
    x.strokeStyle = "rgba(232,238,240,0.95)";
    x.lineCap = "round";
    for (let i = 0; i < 6; i++) {
      x.save();
      x.rotate((i / 6) * Math.PI * 2);
      x.lineWidth = C * 0.05;
      x.beginPath();
      x.moveTo(0, -C * 0.08);
      x.lineTo(0, -C * 0.5);
      x.stroke();
      x.lineWidth = C * 0.03;
      for (const [d, l] of [
        [0.24, 0.11],
        [0.38, 0.08],
      ]) {
        x.beginPath();
        x.moveTo(-C * l, -C * (d + l));
        x.lineTo(0, -C * d);
        x.lineTo(C * l, -C * (d + l));
        x.stroke();
      }
      x.restore();
    }
    x.fillStyle = "rgba(232,238,240,0.95)";
    x.beginPath();
    x.arc(0, 0, C * 0.07, 0, Math.PI * 2);
    x.fill();
    // lettering round the ring
    x.fillStyle = "rgba(28,28,26,0.92)";
    x.font = "bold " + ((C * 0.085) | 0) + 'px "Courier New", monospace';
    x.textAlign = "center";
    x.textBaseline = "middle";
    const words = ["PROJECT", "LONG WINTER", "UNIT C-4", "O.C.D."];
    words.forEach((w, i) => {
      const a0 = (i / 4) * Math.PI * 2;
      for (let k = 0; k < w.length; k++) {
        const a = a0 + (k - (w.length - 1) / 2) * 0.075;
        x.save();
        x.rotate(a);
        x.translate(0, -C * 0.8);
        x.fillText(w[k], 0, 0);
        x.restore();
      }
    });
    // twenty-two years under water: scuffs, silt and bare patches
    x.globalCompositeOperation = "destination-out";
    for (let i = 0; i < 900; i++) {
      const a = rnd() * Math.PI * 2,
        r = C * (0.55 + rnd() * 0.45);
      x.fillStyle = "rgba(0,0,0," + (rnd() * 0.6).toFixed(2) + ")";
      x.fillRect(
        Math.cos(a) * r,
        Math.sin(a) * r,
        2 + rnd() * 16,
        1 + rnd() * 6,
      );
    }
    for (let i = 0; i < 16; i++) {
      const a = rnd() * Math.PI * 2,
        r = C * (0.6 + rnd() * 0.35);
      const g = x.createRadialGradient(
        Math.cos(a) * r,
        Math.sin(a) * r,
        0,
        Math.cos(a) * r,
        Math.sin(a) * r,
        C * 0.12,
      );
      g.addColorStop(0, "rgba(0,0,0,0.85)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      x.fillStyle = g;
      x.fillRect(-C, -C, N, N);
    }
    x.globalCompositeOperation = "source-over";
    for (let i = 0; i < 30; i++) {
      const a = rnd() * Math.PI * 2,
        r = C * (0.6 + rnd() * 0.38);
      x.fillStyle = "rgba(46,52,34," + (0.2 + rnd() * 0.3).toFixed(2) + ")";
      x.beginPath();
      x.arc(Math.cos(a) * r, Math.sin(a) * r, 6 + rnd() * 30, 0, Math.PI * 2);
      x.fill();
    }
    const t = new THREE.CanvasTexture(c);
    if ("colorSpace" in t) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  /** Our own 2:3 posters (painted here so they need no shared brand art). kind: lw | crew | ocd | fizzo | comic */
