/* src/quests_extra/36_cryo_c4_dress.js */
/* =====================================================================
 * NEW RAD CITY — QUESTS_EXTRA — 36: CRYO UNIT C-4 SET DRESSING
 * Runs after 35_cryo_c4.js built the shell (same 'world' phase, later
 * file). Everything here is parented to the facility root, so it is only
 * drawn while the player is inside (root.visible === V.inside()).
 *
 *  - the flood: a proper water surface (tiling procedural ripple normal
 *    map, scrolled every frame; a floating scum/oil film on top), drip
 *    rings under the leaking pipes, and floating debris that bobs on the
 *    water and settles on the floor once the pumps have drained it
 *  - the Project Long Winter floor seal on the pod-hall floor (seen through
 *    the water), painted Civil Defense / Long Winter / Fizzo Cola / comic
 *    posters (our own canvases), rust and water stains, a child's drawing
 *  - the Director's office (Civil Defense desk kit, swivel chair, filing
 *    cabinets, bookshelf, the O.C.D. pennant, a stopped clock), the crew
 *    quarters (mess table with a checkers game, footlockers, water cooler)
 *    and the pump room (valve wheels, gauge board, the notorious Pump 2
 *    fuse box, "PUMP 1 / PUMP 2" stencils)
 *  - caged ceiling fixtures round every fluorescent tube
 * Merged per material (QX.kit builder): ~20 extra draw calls, interior only.
 * ===================================================================== */
(function () {
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
  function posterTex(kind) {
    return canvasTex(256, 384, (x, w, h) => {
      const txt = (t, y, size, col, font) => {
        x.fillStyle = col;
        x.font = (font || "bold ") + size + 'px "Courier New", monospace';
        x.textAlign = "center";
        x.textBaseline = "middle";
        x.fillText(t, w / 2, y, w - 20);
      };
      if (kind === "lw" || kind === "crew") {
        x.fillStyle = "#dfe3e2";
        x.fillRect(0, 0, w, h);
        x.fillStyle = "#d8641e";
        x.fillRect(0, 0, w, 54);
        x.fillRect(0, h - 40, w, 40);
        txt("PROJECT", 20, 18, "#f4f4f0");
        txt("LONG WINTER", 40, 22, "#f4f4f0");
        x.strokeStyle = "#3a4a52";
        x.lineWidth = 6;
        x.lineCap = "round";
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          x.beginPath();
          x.moveTo(w / 2, 150);
          x.lineTo(w / 2 + Math.sin(a) * 62, 150 - Math.cos(a) * 62);
          x.stroke();
        }
        x.fillStyle = "#d8641e";
        x.beginPath();
        x.arc(w / 2, 150, 16, 0, 7);
        x.fill();
        if (kind === "lw") {
          txt("SLEEP TODAY.", 250, 24, "#1c1c1a");
          txt("WAKE TO TOMORROW.", 282, 20, "#1c1c1a");
          txt("A civil-service volunteer program", 322, 11, "#3a3a38", "");
        } else {
          txt("WATCH CREW:", 246, 24, "#1c1c1a");
          txt("CHECK THE SEALS", 278, 20, "#1c1c1a");
          txt("EVERY SHIFT · EVERY POD", 310, 14, "#3a3a38");
        }
        txt("OFFICE OF CIVIL DEFENSE", h - 20, 13, "#f4f4f0");
      } else if (kind === "ocd") {
        x.fillStyle = "#e8e2cc";
        x.fillRect(0, 0, w, h);
        x.fillStyle = "#1c1c1a";
        x.fillRect(14, 14, w - 28, 70);
        txt("KNOW YOUR", 36, 22, "#e8e2cc");
        txt("SHELTER", 66, 30, "#e8e2cc");
        x.strokeStyle = "#1c1c1a";
        x.lineWidth = 5;
        x.strokeRect(70, 110, 116, 116);
        x.beginPath();
        x.moveTo(70, 168);
        x.lineTo(186, 168);
        x.moveTo(128, 110);
        x.lineTo(128, 226);
        x.stroke();
        x.fillStyle = "#c4561a";
        x.beginPath();
        x.moveTo(128, 120);
        x.lineTo(176, 208);
        x.lineTo(80, 208);
        x.closePath();
        x.fill();
        txt("1. GO DOWN", 262, 17, "#1c1c1a");
        txt("2. STAY DOWN", 288, 17, "#1c1c1a");
        txt("3. WAIT FOR THE ALL-CLEAR", 314, 13, "#1c1c1a");
        txt("O.C.D. BULLETIN 14 — 1966", h - 24, 11, "#5a5048");
      } else if (kind === "fizzo") {
        x.fillStyle = "#b8241c";
        x.fillRect(0, 0, w, h);
        x.fillStyle = "#f4f0e6";
        for (let i = 0; i < 9; i++) x.fillRect(0, 120 + i * 26, w, 6);
        // the tall ribbed bottle
        x.fillStyle = "#2a1a14";
        x.beginPath();
        x.moveTo(118, 70);
        x.lineTo(138, 70);
        x.lineTo(140, 120);
        x.quadraticCurveTo(162, 150, 158, 200);
        x.lineTo(160, 320);
        x.lineTo(96, 320);
        x.lineTo(98, 200);
        x.quadraticCurveTo(94, 150, 116, 120);
        x.closePath();
        x.fill();
        x.strokeStyle = "rgba(255,255,255,0.35)";
        x.lineWidth = 3;
        for (let i = 0; i < 6; i++) {
          x.beginPath();
          x.moveTo(104 + i * 10, 210);
          x.lineTo(104 + i * 10, 312);
          x.stroke();
        }
        x.fillStyle = "#f4f0e6";
        x.fillRect(102, 236, 52, 30);
        txt("FIZZO", 251, 14, "#b8241c");
        txt("FIZZO COLA", 34, 30, "#f4f0e6");
        txt("THE TALL COOL ONE", h - 30, 16, "#f4f0e6");
      } else {
        x.fillStyle = "#e8c860";
        x.fillRect(0, 0, w, h);
        // Super Sergeant (Bowery Comics): his steel helmet over the triple-chevron insignia
        x.fillStyle = "#1c3a6a";
        x.fillRect(0, 0, w, 64);
        txt("SUPER", 22, 22, "#f4f0e6");
        txt("SERGEANT", 48, 26, "#e84a2a");
        x.fillStyle = "#5e6e3a";
        x.beginPath();
        x.arc(128, 150, 62, Math.PI, 0);
        x.lineTo(196, 158);
        x.lineTo(60, 158);
        x.closePath();
        x.fill();
        x.fillStyle = "#3e4a26";
        x.fillRect(56, 152, 144, 10);
        x.fillStyle = "#f2c43a";
        x.beginPath();
        x.arc(128, 212, 44, 0, 7);
        x.fill();
        x.strokeStyle = "#b8241c";
        x.lineWidth = 10;
        x.lineCap = "round";
        x.lineJoin = "round";
        for (let i = 0; i < 3; i++) {
          x.beginPath();
          x.moveTo(100, 206 + i * 15);
          x.lineTo(128, 187 + i * 15);
          x.lineTo(156, 206 + i * 15);
          x.stroke();
        }
        x.strokeStyle = "#f2c43a";
        x.lineWidth = 6;
        for (let i = 0; i < 2; i++) {
          x.beginPath();
          x.moveTo(108, 126 + i * 12);
          x.lineTo(128, 112 + i * 12);
          x.lineTo(148, 126 + i * 12);
          x.stroke();
        }
        txt("AMERICA'S FINEST FIGHTING MAN!", 274, 11, "#1c1c1a");
        txt("#12 — OPERATION DEEP FREEZE", 300, 12, "#1c1c1a");
        txt("BOWERY COMICS · 12¢", 340, 16, "#1c1c1a");
      }
      for (let i = 0; i < 120; i++) {
        x.fillStyle = "rgba(60,50,30," + (rnd() * 0.12).toFixed(2) + ")";
        x.fillRect(rnd() * w, rnd() * h, 2 + rnd() * 20, 1 + rnd() * 8);
      }
    });
  }
  /** A child's crayon drawing taped to the quarters wall: a family, the sun, and the word HOME. */
  function drawingTex() {
    return canvasTex(256, 256, (x) => {
      x.fillStyle = "#ece6d4";
      x.fillRect(8, 8, 240, 240);
      x.lineWidth = 4;
      x.lineCap = "round";
      x.strokeStyle = "#e0a020";
      x.beginPath();
      x.arc(200, 54, 22, 0, 7);
      x.stroke();
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        x.beginPath();
        x.moveTo(200 + Math.cos(a) * 28, 54 + Math.sin(a) * 28);
        x.lineTo(200 + Math.cos(a) * 40, 54 + Math.sin(a) * 40);
        x.stroke();
      }
      const fig = (fx, s, col) => {
        x.strokeStyle = col;
        x.beginPath();
        x.arc(fx, 150 - 30 * s, 10 * s, 0, 7);
        x.moveTo(fx, 160 - 20 * s);
        x.lineTo(fx, 190);
        x.moveTo(fx - 14 * s, 172 - 10 * s);
        x.lineTo(fx + 14 * s, 172 - 10 * s);
        x.moveTo(fx, 190);
        x.lineTo(fx - 10, 214);
        x.moveTo(fx, 190);
        x.lineTo(fx + 10, 214);
        x.stroke();
      };
      fig(60, 1.2, "#c4561a");
      fig(104, 1.15, "#3a6a9a");
      fig(140, 0.8, "#7a3a8a");
      fig(170, 0.7, "#2a7a3a");
      x.fillStyle = "#c4261a";
      x.font = 'bold 34px "Comic Sans MS", "Courier New", monospace';
      x.textAlign = "center";
      x.fillText("HOME", 110, 60);
      x.fillStyle = "#5a5048";
      x.font = '14px "Courier New", monospace';
      x.fillText("by Lulu B. (age 6)", 128, 238);
    });
  }
  /** Checkers board / clock face / fuse panel / gauge board labels. */
  function canvasTex(w, h, draw) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    draw(c.getContext("2d"), w, h);
    const t = new THREE.CanvasTexture(c);
    if ("colorSpace" in t) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  const D = (QX.c4dress = {
    rings: [],
    debris: [],
    waterMat: null,
    scumMat: null,
    scum: [],
    normal: null,
  });

  QX.hook("world", function () {
    const V = QX.c4;
    if (!V || !V.root) return;
    const root = V.root,
      O = V.origin(),
      k = K();
    const col = (lx, lz, w, d, y0, y1, surface) =>
      G.world.addCollider(O.x + lx, O.z + lz, w, d, y0, y1, 0, {
        tag: "qx_c4",
        surface: surface || "metal",
      });
    const plane = (mat, w, h, x, y, z, ry, rx) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
      m.position.set(x, y, z);
      m.rotation.set(rx || 0, ry || 0, 0, "YXZ");
      root.add(m);
      return m;
    };
    const mats = QX.live("mats") ? G.mats : null;

    // ================================================================
    // 1. THE FLOOD — ripple surface, scum film, drip rings, debris
    // ================================================================
    D.normal = rippleNormal();
    D.waterMat = new THREE.MeshStandardMaterial({
      color: 0x15211a,
      roughness: 0.05,
      metalness: 0.15,
      transparent: true,
      opacity: 0.88,
      depthWrite: false,
      normalMap: D.normal,
      normalScale: new THREE.Vector2(0.16, 0.16),
      envMap: roomEnv(),
      envMapIntensity: 1.2,
    });
    const scumT = scumTex();
    D.scumMat = new THREE.MeshStandardMaterial({
      map: scumT,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      roughness: 0.85,
      metalness: 0,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
    for (const w of V.water) {
      const g = w.geometry;
      const p = g.parameters || {};
      const uv = g.attributes.uv;
      const su = (p.width || 4) / 3.5,
        sv = (p.height || 4) / 3.5;
      for (let i = 0; i < uv.count; i++)
        uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv);
      uv.needsUpdate = true;
      w.material = D.waterMat;
      // scum film, a hair above the water, follows it down when drained
      const s = new THREE.Mesh(g, D.scumMat);
      s.renderOrder = 3;
      s.position.z = 0.004; // plane-local +z = up (sheet is rotated -90° on x)
      w.add(s);
      D.scum.push(s);
    }
    // drip rings under the leaking overhead pipes and the ceiling seams
    const rt = ringTex();
    const DRIPS = [
      [-9, 30],
      [9, 36.5],
      [-9, 41],
      [0.6, 12],
      [-0.8, 17],
      [-18.5, 29],
      [6.2, 24.5],
      [-3.5, 26.5],
    ];
    DRIPS.forEach((d, i) => {
      const m = new THREE.MeshBasicMaterial({
        map: rt,
        transparent: true,
        depthWrite: false,
        opacity: 0,
        color: 0xcfe0d4,
      });
      const r = plane(m, 1, 1, d[0], 0.43, d[1], 0, -Math.PI / 2);
      r.renderOrder = 4;
      D.rings.push({
        mesh: r,
        t: rnd() * 2,
        period: 1.4 + rnd() * 1.6,
        sheet: d[1] < 21 ? 0 : d[0] < -12 ? 2 : 1,
      });
    });
    // falling drops (one tiny streak per ring, drawn only while falling)
    const dropMat = new THREE.MeshBasicMaterial({
      color: 0xd8e8dc,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    for (const r of D.rings) {
      const dm = new THREE.Mesh(
        new THREE.BoxGeometry(0.012, 0.09, 0.012),
        dropMat,
      );
      dm.position.set(r.mesh.position.x, 3, r.mesh.position.z);
      dm.visible = false;
      root.add(dm);
      r.drop = dm;
    }

    // floating debris — merged into one group per flooded sheet so it can ride the water level
    const debrisSet = [
      {
        sheet: 1,
        items: [
          ["plank", -4.2, 30.5, 0.4],
          ["plank", 5.3, 34.2, 1.9],
          ["paper", -2.8, 36.2, 0.2],
          ["paper", 3.2, 29.4, 1.1],
          ["paper", -8.4, 27.2, 2.5],
          ["paper", 8.6, 42.0, 0.8],
          ["bottle", -5.6, 41.5, 0.3],
          ["bottle", 2.2, 38.8, 2.2],
          ["lunchbox", 4.6, 31.2, 0.6],
          ["tray", -9.8, 35.4, 0.9],
          ["chair", 7.8, 30.1, 0.4],
          ["bear", -3.9, 24.4, 1.4],
          ["plank", -10.2, 43.4, 0.1],
          ["cushion", 9.2, 38.2, 0.7],
        ],
      },
      {
        sheet: 0,
        items: [
          ["paper", 0.3, 7.5, 0.4],
          ["plank", -0.6, 13.8, 1.45],
          ["bottle", 0.8, 18.2, 2.1],
        ],
      },
      {
        sheet: 2,
        items: [
          ["paper", -16.2, 28.6, 0.5],
          ["paper", -14.0, 38.2, 2.0],
          ["cushion", -17.6, 36.5, 1.2],
          ["comic", -15.1, 31.4, 0.3],
          ["bottle", -19.8, 33.1, 1.0],
        ],
      },
    ];
    const DM = {
      wood: k.mat("wood_rotten", 0x5a4028),
      paper: k.tint("qx_c4_paper", 0xb8b098, { roughness: 1 }),
      glass: k.tint("qx_c4_bottle", 0x3a5a3a, {
        roughness: 0.15,
        metalness: 0.1,
        transparent: true,
        opacity: 0.8,
      }),
      orange: k.tint("qx_c4_orange", 0xd8641e, { roughness: 0.6 }),
      white: k.tint("qx_c4_white", 0xe8eef0, { roughness: 0.5 }),
      fab: k.tint("qx_c4_fabric_r", 0x6a3a30, { roughness: 1 }),
      metal: k.mat("metal_painted", 0x55606a),
      bear: k.tint("qx_c4_bear", 0x7a5a3a, { roughness: 1 }),
      comic: k.tint("qx_c4_comic", 0xb04030, { roughness: 0.9 }),
    };
    const WY = 0.42;
    for (const set of debrisSet) {
      const g = new THREE.Group();
      root.add(g);
      const b = k.builder();
      for (const [kind, x, z, a] of set.items) {
        if (kind === "plank")
          k.box(
            b,
            DM.wood,
            1.6 + rnd() * 0.8,
            0.05,
            0.18,
            x,
            WY,
            z,
            a,
            0.02,
            0.03,
          );
        else if (kind === "paper")
          k.box(
            b,
            DM.paper,
            0.22,
            0.004,
            0.3,
            x,
            WY + 0.004,
            z,
            a,
            0.05 * (rnd() - 0.5),
            0.05 * (rnd() - 0.5),
          );
        else if (kind === "bottle") {
          k.cyl(b, DM.glass, 0.035, 0.2, x, WY + 0.01, z, 8, Math.PI / 2, 0, a);
          k.cyl(
            b,
            DM.glass,
            0.014,
            0.08,
            x + Math.sin(a) * 0.13,
            WY + 0.01,
            z + Math.cos(a) * 0.13,
            6,
            Math.PI / 2,
            0,
            a,
          );
        } else if (kind === "lunchbox") {
          k.box(b, DM.white, 0.3, 0.16, 0.12, x, WY + 0.03, z, a, 0.15);
          k.box(b, DM.orange, 0.31, 0.03, 0.13, x, WY + 0.08, z, a, 0.15);
        } else if (kind === "tray")
          k.box(b, DM.metal, 0.46, 0.025, 0.34, x, WY + 0.005, z, a, 0.04);
        else if (kind === "chair") {
          k.box(
            b,
            DM.orange,
            0.42,
            0.42,
            0.06,
            x,
            WY + 0.05,
            z,
            a,
            Math.PI / 2 - 0.2,
          );
          k.box(
            b,
            DM.orange,
            0.42,
            0.06,
            0.4,
            x + Math.sin(a) * 0.25,
            WY + 0.12,
            z + Math.cos(a) * 0.25,
            a,
            -0.3,
          );
        } else if (kind === "bear") {
          k.sphere(b, DM.bear, 0.11, x, WY + 0.04, z);
          k.sphere(b, DM.bear, 0.075, x + 0.14, WY + 0.05, z + 0.02);
          k.sphere(b, DM.bear, 0.03, x + 0.16, WY + 0.1, z + 0.07);
          k.sphere(b, DM.bear, 0.03, x + 0.16, WY + 0.1, z - 0.04);
        } else if (kind === "cushion")
          k.box(b, DM.fab, 0.44, 0.08, 0.44, x, WY + 0.02, z, a, 0.06);
        else if (kind === "comic")
          k.box(b, DM.comic, 0.2, 0.01, 0.28, x, WY + 0.005, z, a, 0.02);
      }
      k.flush(b, g, false);
      D.debris.push({ group: g, sheet: set.sheet, ph: rnd() * 6 });
    }

    // ================================================================
    // 2. FLOOR SEAL (under the water) + posters + stains
    // ================================================================
    const em = new THREE.MeshStandardMaterial({
      map: emblemTex(),
      transparent: true,
      depthWrite: false,
      roughness: 0.55,
      metalness: 0.1,
      polygonOffset: true,
      polygonOffsetFactor: -3,
      polygonOffsetUnits: -3,
    });
    plane(em, 9.5, 9.5, 0, 0.012, 33, 0, -Math.PI / 2);
    {
      const PT = {};
      const poster = (kind, x, y, z, ry, s) =>
        QX.safe("poster", () => {
          const m =
            PT[kind] ||
            (PT[kind] = new THREE.MeshStandardMaterial({
              map: posterTex(kind),
              roughness: 0.92,
              metalness: 0,
              side: THREE.DoubleSide,
            }));
          plane(m, 0.8 * (s || 1), 1.2 * (s || 1), x, y, z, ry);
        });
      poster("lw", -3.8, 2.6, 44.84, Math.PI, 1.3); // pod-hall south wall, beside the pump room
      poster("fizzo", 7.5, 2.5, 44.84, Math.PI, 1.1);
      poster("crew", 11.84, 2.5, 26.4, -Math.PI / 2, 1.1); // pod-hall east wall
      poster("ocd", -11.84, 2.7, 25.0, Math.PI / 2, 1.1); // pod-hall west wall
      poster("comic", -12.16, 2.0, 38.6, -Math.PI / 2, 1.0); // quarters (east wall, inside)
      poster("fizzo", -18.8, 2.0, 40.84, Math.PI, 0.9); // quarters south wall
      poster("lw", 19.0, 2.0, 27.16, 0, 1.0); // office north wall
      poster("ocd", 4.84, 2.6, 51.5, -Math.PI / 2, 1.0); // pump room east wall
    }
    if (mats && mats.decal) {
      const decal = (name, w, h, x, y, z, ry, rx) =>
        QX.safe("decal", () => {
          const m = mats.decal(name);
          if (m) plane(m, w, h, x, y, z, ry, rx);
        });
      // rust bleeding down from the ceiling seams and water stains at the old tide line
      for (const [x, z, ry] of [
        [9.0, 21.04, 0],
        [4.0, 21.04, 0],
        [8.5, 44.96, Math.PI],
        [-8.2, 44.96, Math.PI],
        [11.96, 25.5, -Math.PI / 2],
        [-11.96, 40.6, Math.PI / 2],
      ])
        decal("rust_stain", 1.4, 3.2, x, 6.2, z, ry);
      for (const [x, z, ry] of [
        [5.5, 21.04, 0],
        [6.5, 44.96, Math.PI],
        [11.96, 41.5, -Math.PI / 2],
        [-11.96, 24.2, Math.PI / 2],
        [-1.66, 10, -Math.PI / 2],
        [1.66, 15, Math.PI / 2],
      ])
        decal("water_stain", 2.4, 1.6, x, 1.6, z, ry);
      for (const [x, z, ry] of [
        [-11.96, 29, Math.PI / 2],
        [11.96, 36.2, -Math.PI / 2],
        [-23.96, 29, Math.PI / 2],
        [4.96, 48, -Math.PI / 2],
      ])
        decal("moss", 2.0, 1.2, x, 0.9, z, ry);
      plane(
        new THREE.MeshStandardMaterial({ map: drawingTex(), roughness: 0.95 }),
        0.7,
        0.7,
        -22.4,
        1.7,
        40.96,
        Math.PI,
      ); // a child's drawing on the quarters wall
      decal("cracks", 2.2, 2.2, 6.0, 7.96, 33, 0, Math.PI / 2);
      decal("cracks", 2.2, 2.2, -5.0, 7.96, 29.5, 0.8, Math.PI / 2);
      decal("blood_smear", 1.0, 0.9, -2.3, 1.1, 44.96, Math.PI); // someone tried the pump-room door the hard way
    }

    // ================================================================
    // 3. ROOMS
    // ================================================================
    const b = k.builder();
    const M = {
      metal: k.mat("metal_painted", 0x55606a),
      dark: k.tint("qx_c4_dark", 0x14171a, { roughness: 0.9 }),
      rust: k.mat("rust", 0x5a3a22),
      orange: k.tint("qx_c4_orange", 0xd8641e, { roughness: 0.6 }),
      white: k.tint("qx_c4_white", 0xe8eef0, { roughness: 0.5 }),
      wood: k.mat("wood_planks", 0x6a4a2a),
      desk: k.tint("qx_c4_desk", 0x5d6a6a, { roughness: 0.5, metalness: 0.55 }),
      chrome: k.tint("qx_c4_chrome", 0xb8bcbc, {
        roughness: 0.25,
        metalness: 0.9,
      }),
      leather: k.tint("qx_c4_leather", 0x3a2418, { roughness: 0.6 }),
      fab: k.mat("fabric", 0x6a6a5a),
      paper: DM.paper,
      book: k.tint("qx_c4_books", 0x6a3226, { roughness: 0.9 }),
      book2: k.tint("qx_c4_books2", 0x2a4a5a, { roughness: 0.9 }),
      crt: k.tint("qx_c4_crt", 0x3a2408, {
        emissive: 0xffa020,
        emissiveIntensity: 0.9,
      }),
      red: k.tint("qx_c4_red", 0x801810, {
        emissive: 0xff2a10,
        emissiveIntensity: 1.4,
      }),
      amber: k.tint("qx_c4_amber", 0x7a5010, {
        emissive: 0xffa020,
        emissiveIntensity: 1.2,
      }),
      cage: k.tint("qx_c4_cage", 0x2a2e2e, { roughness: 0.6, metalness: 0.7 }),
      rug: k.tint("qx_c4_rug", 0x5a2a24, { roughness: 1 }),
      valve: k.tint("qx_c4_valve", 0x8a1c14, {
        roughness: 0.55,
        metalness: 0.4,
      }),
      plast: k.tint("qx_c4_plastic", 0x8aa8b0, {
        roughness: 0.3,
        transparent: true,
        opacity: 0.55,
      }),
    };

    // ---- caged fixtures round every fluorescent tube (the tubes themselves are in 35) ----
    const TUBES = [
      [0, 7.2, 0],
      [0, 3.0, 8],
      [0, 3.0, 16],
      [-6, 7.7, 27],
      [6, 7.7, 27],
      [-6, 7.7, 39],
      [6, 7.7, 39],
      [-18, 3.3, 30],
      [-18, 3.3, 37],
      [16.5, 3.3, 31],
      [0, 4.8, 51],
    ];
    for (const [x, y, z] of TUBES) {
      k.box(b, M.metal, 1.5, 0.08, 0.34, x, y + 0.07, z); // housing
      for (const s of [-1, 1])
        k.box(b, M.cage, 1.5, 0.12, 0.02, x, y - 0.02, z + s * 0.16); // side lips
      for (let i = -2; i <= 2; i++)
        k.box(b, M.cage, 0.015, 0.015, 0.34, x + i * 0.34, y - 0.08, z); // cage wires
      if (y > 4)
        k.cyl(b, M.cage, 0.008, 7.95 - y - 0.1, x, (y + 7.95) / 2 + 0.05, z, 4); // suspension rods in the tall rooms
    }

    // ---- Director's office (x 12..21, z 27..37, h 3.4) ----
    // Civil Defense desk kit: the old wooden desk from 35 gets a steel modesty panel, chrome trim, blotter, papers, lamp, mug, the Director's nameplate
    const dx = 16.5,
      dz = 33.6;
    k.box(b, M.desk, 2.24, 0.06, 1.04, dx, 0.85, dz);
    k.box(b, M.chrome, 2.26, 0.03, 0.03, dx, 0.83, dz - 0.52);
    k.box(b, M.desk, 2.1, 0.7, 0.04, dx, 0.42, dz - 0.46);
    k.box(b, M.leather, 0.9, 0.01, 0.55, dx + 0.1, 0.885, dz); // blotter
    for (let i = 0; i < 5; i++)
      k.box(
        b,
        M.paper,
        0.22,
        0.004,
        0.3,
        dx - 0.65 + rnd() * 0.25,
        0.884 + i * 0.004,
        dz + 0.05 + rnd() * 0.2,
        rnd() * 0.6 - 0.3,
      );
    k.cyl(b, M.metal, 0.08, 0.02, dx + 0.85, 0.89, dz + 0.25, 10);
    k.cyl(b, M.metal, 0.012, 0.36, dx + 0.85, 1.06, dz + 0.25, 5); // desk lamp
    k.cone(b, M.orange, 0.1, 0.12, dx + 0.85, 1.25, dz + 0.18, 10);
    k.box(b, M.amber, 0.06, 0.02, 0.06, dx + 0.85, 1.19, dz + 0.18);
    k.cyl(b, M.fab, 0.04, 0.09, dx - 0.9, 0.93, dz - 0.18, 8); // mug
    k.box(b, M.white, 0.34, 0.08, 0.02, dx, 0.93, dz - 0.4, 0, -0.35); // nameplate
    // swivel chair behind the desk (south side, pushed back as if she just stood up)
    const cx = dx - 0.5,
      cz = dz + 0.9;
    k.cyl(b, M.chrome, 0.28, 0.03, cx, 0.06, cz, 5);
    k.cyl(b, M.chrome, 0.03, 0.4, cx, 0.26, cz, 6);
    k.box(b, M.leather, 0.5, 0.1, 0.48, cx, 0.5, cz, 0.25);
    k.box(
      b,
      M.leather,
      0.48,
      0.55,
      0.08,
      cx + 0.06,
      0.86,
      cz + 0.24,
      0.25,
      -0.12,
    );
    col(cx, cz, 0.55, 0.55, 0, 0.9, "metal");
    // filing cabinets + bookshelf on the north wall, the O.C.D. pennant on the south wall, a stopped clock over the door
    for (let i = 0; i < 3; i++) {
      const fx = 12.75 + i * 0.62;
      k.box(b, M.desk, 0.58, 1.32, 0.62, fx, 0.66, 27.35);
      for (let d = 0; d < 4; d++) {
        k.box(b, M.metal, 0.5, 0.27, 0.02, fx, 0.2 + d * 0.31, 27.67);
        k.box(b, M.chrome, 0.12, 0.025, 0.03, fx, 0.29 + d * 0.31, 27.69);
      }
    }
    k.box(b, M.desk, 0.58, 0.02, 0.62, 13.37, 1.33, 27.35);
    k.sphere(b, M.book2, 0.17, 12.9, 1.52, 27.35);
    k.cyl(b, M.chrome, 0.012, 0.36, 12.9, 1.52, 27.35, 5, 0.4); // desk globe on the cabinet
    col(13.37, 27.35, 1.9, 0.66, 0, 1.35);
    k.box(b, M.wood, 1.8, 2.2, 0.36, 16.2, 1.1, 27.2);
    for (let s = 0; s < 4; s++) {
      k.box(b, M.wood, 1.72, 0.03, 0.32, 16.2, 0.35 + s * 0.5, 27.22);
      let bx = 15.4;
      while (bx < 16.95) {
        const w = 0.04 + rnd() * 0.05,
          h = 0.26 + rnd() * 0.14;
        if (rnd() > 0.12)
          k.box(
            b,
            rnd() > 0.5 ? M.book : M.book2,
            w,
            h,
            0.24,
            bx,
            0.37 + s * 0.5 + h / 2,
            27.24,
            0,
            0,
            rnd() > 0.85 ? 0.25 : 0,
          );
        bx += w + 0.012;
      }
    }
    col(16.2, 27.2, 1.8, 0.4, 0, 2.2, "wood");
    k.box(b, M.rug, 3.0, 0.012, 2.0, dx, 0.006, dz + 0.2);
    const flag = k.plate("OFFICE OF\nCIVIL\nDEFENSE\n— C-4 —", 0.9, 1.3, {
      fg: "#f4f4f0",
      bg: "#c4561a",
    });
    flag.position.set(15.2, 2.1, 36.84);
    flag.rotation.y = Math.PI;
    root.add(flag);
    k.cyl(b, M.chrome, 0.012, 1.1, 15.2, 2.78, 36.8, 5, 0, Math.PI / 2);
    const clockT = canvasTex(128, 128, (x, w) => {
      x.fillStyle = "#e8e2cc";
      x.beginPath();
      x.arc(64, 64, 60, 0, 7);
      x.fill();
      x.lineWidth = 6;
      x.strokeStyle = "#2a2a28";
      x.stroke();
      x.fillStyle = "#2a2a28";
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        x.fillRect(64 + Math.sin(a) * 48 - 2, 64 - Math.cos(a) * 48 - 5, 4, 10);
      }
      x.lineCap = "round";
      x.lineWidth = 5;
      x.beginPath();
      x.moveTo(64, 64);
      x.lineTo(64 + Math.sin(2.6) * 28, 64 - Math.cos(2.6) * 28);
      x.stroke(); // 9:47 — day nine
      x.lineWidth = 3;
      x.beginPath();
      x.moveTo(64, 64);
      x.lineTo(64 + Math.sin(4.92) * 44, 64 - Math.cos(4.92) * 44);
      x.stroke();
      x.fillStyle = "rgba(90,70,40,0.3)";
      x.beginPath();
      x.arc(80, 90, 30, 0, 7);
      x.fill();
    });
    plane(
      new THREE.MeshStandardMaterial({ map: clockT, roughness: 0.4 }),
      0.36,
      0.36,
      12.16,
      2.95,
      34.4,
      Math.PI / 2,
    );
    // (the tally-mark wall is in 35)

    // ---- crew quarters (x -24..-12, z 25..41, h 3.4) ----
    // mess table with a checkers game abandoned mid-move; benches
    const tx = -16.8,
      tz = 33.2;
    k.box(b, M.desk, 1.9, 0.05, 0.9, tx, 0.76, tz);
    for (const sx of [-0.8, 0.8])
      for (const sz of [-0.35, 0.35])
        k.cyl(b, M.chrome, 0.025, 0.74, tx + sx, 0.37, tz + sz, 6);
    for (const sz of [-0.75, 0.75]) {
      k.box(b, M.orange, 1.7, 0.05, 0.32, tx, 0.45, tz + sz);
      for (const sx of [-0.7, 0.7])
        k.box(b, M.chrome, 0.04, 0.44, 0.04, tx + sx, 0.22, tz + sz);
    }
    col(tx, tz, 1.9, 1.9, 0, 0.8, "metal");
    const chk = canvasTex(128, 128, (x) => {
      for (let i = 0; i < 8; i++)
        for (let j = 0; j < 8; j++) {
          x.fillStyle = (i + j) % 2 ? "#1a1a1a" : "#b83020";
          x.fillRect(i * 16, j * 16, 16, 16);
        }
      const pc = [
        [1, 0, "#e0d8c0"],
        [3, 0, "#e0d8c0"],
        [0, 1, "#e0d8c0"],
        [4, 3, "#e0d8c0"],
        [6, 1, "#e0d8c0"],
        [2, 5, "#303030"],
        [5, 6, "#303030"],
        [7, 6, "#303030"],
        [3, 4, "#303030"],
        [1, 6, "#303030"],
      ];
      for (const [i, j, c] of pc) {
        if ((i + j) % 2 === 0) continue;
        x.fillStyle = c;
        x.beginPath();
        x.arc(i * 16 + 8, j * 16 + 8, 6, 0, 7);
        x.fill();
      }
    });
    plane(
      new THREE.MeshStandardMaterial({ map: chk, roughness: 0.6 }),
      0.42,
      0.42,
      tx + 0.3,
      0.79,
      tz,
      0.2,
      -Math.PI / 2,
    );
    k.cyl(b, M.metal, 0.05, 0.1, tx - 0.5, 0.84, tz + 0.2, 8);
    k.box(b, M.paper, 0.2, 0.004, 0.14, tx - 0.4, 0.786, tz - 0.25, 0.4);
    // finish the bunks from 35: second pair of posts, head/foot boards, side rails, pillows, blankets, a ladder
    const blanket = [
      k.tint("qx_c4_blanket_a", 0x3a4a6a, { roughness: 1 }),
      k.tint("qx_c4_blanket_b", 0x5a5a48, { roughness: 1 }),
    ];
    const pillow = k.tint("qx_c4_pillow", 0xb8b4a0, { roughness: 1 });
    for (let i = 0; i < 4; i++) {
      const bz = 27 + i * 3.4;
      for (const px of [-23.75, -21.85])
        k.box(b, M.metal, 0.06, 2.0, 0.06, px, 1.0, bz + 0.44);
      k.box(b, M.white, 0.05, 1.9, 0.9, -23.8, 1.0, bz); // headboard
      for (const lvl of [0.45, 1.6]) {
        k.box(b, M.orange, 0.05, 0.36, 0.9, -21.8, lvl + 0.16, bz); // footboard
        k.box(b, M.metal, 1.9, 0.04, 0.03, -22.8, lvl + 0.08, bz + 0.46); // side rail
        k.box(b, pillow, 0.34, 0.1, 0.55, -23.5, lvl + 0.25, bz, 0.08);
        const messy = (i + (lvl > 1 ? 1 : 0)) % 2;
        if (messy)
          k.box(
            b,
            blanket[i % 2],
            1.2,
            0.05,
            0.88,
            -22.35,
            lvl + 0.22,
            bz + 0.03,
            0.06,
            0.04,
          ); // thrown back
        else
          k.box(b, blanket[(i + 1) % 2], 0.4, 0.1, 0.8, -22.1, lvl + 0.25, bz); // folded at the foot
      }
      for (let r = 0; r < 4; r++)
        k.box(b, M.chrome, 0.03, 0.03, 0.34, -21.78, 0.55 + r * 0.33, bz - 0.2); // ladder rungs
    }
    // footlockers at the bunk ends, a water cooler, a laundry basket
    for (let i = 0; i < 3; i++) {
      const bz = 27 + i * 3.4;
      k.box(b, i % 2 ? M.white : M.desk, 0.5, 0.36, 0.8, -21.45, 0.18, bz);
      k.box(b, M.orange, 0.51, 0.04, 0.81, -21.45, 0.3, bz);
      col(-21.45, bz, 0.5, 0.8, 0, 0.36);
    }
    k.box(b, M.metal, 0.38, 1.0, 0.38, -12.6, 0.5, 39.8);
    k.cyl(b, M.plast, 0.16, 0.42, -12.6, 1.22, 39.8, 12);
    col(-12.6, 39.8, 0.42, 0.42, 0, 1.4);
    k.cyl(b, M.wood, 0.25, 0.4, -14.2, 0.2, 40.3, 10);
    k.box(b, M.fab, 0.4, 0.1, 0.4, -14.2, 0.42, 40.3, 0.5);
    // a ceiling pipe run over the bunks
    k.cyl(b, M.metal, 0.09, 16, -23.5, 3.05, 33, 8, Math.PI / 2);
    k.cyl(b, M.rust, 0.06, 16, -23.2, 3.18, 33, 8, Math.PI / 2);

    // ---- pump room (x -5..5, z 45..57, h 5) ----
    for (const px of [-2.6, 2.6]) {
      k.torus(
        b,
        M.valve,
        0.34,
        px + (px < 0 ? 1.05 : -1.05),
        1.5,
        49,
        0,
        Math.PI / 2,
      ); // valve wheels (facing the aisle)
      k.cyl(
        b,
        M.metal,
        0.03,
        0.3,
        px + (px < 0 ? 0.95 : -0.95),
        1.5,
        49,
        6,
        0,
        Math.PI / 2,
      );
      k.box(b, M.metal, 2.1, 0.2, 2.1, px, 0.1, 49); // plinths
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        k.cyl(
          b,
          M.chrome,
          0.04,
          0.12,
          px + Math.cos(a) * 0.95,
          2.62,
          49 + Math.sin(a) * 0.95,
          6,
        );
      } // flange bolts
      k.cyl(b, M.metal, 0.22, 3.5, px, 3.85, 46.8, 10, Math.PI / 2); // discharge pipe → atrium
    }
    // gauge board on the east wall + the notorious Pump 2 fuse box on the west wall
    k.box(b, M.desk, 0.1, 1.2, 2.2, 4.9, 1.6, 48.8);
    for (let i = 0; i < 3; i++) {
      k.cyl(
        b,
        M.chrome,
        0.16,
        0.06,
        4.83,
        1.85,
        48.1 + i * 0.7,
        14,
        0,
        Math.PI / 2,
      );
      k.cyl(
        b,
        M.paper,
        0.13,
        0.065,
        4.82,
        1.85,
        48.1 + i * 0.7,
        14,
        0,
        Math.PI / 2,
      );
      k.box(
        b,
        M.red,
        0.01,
        0.11,
        0.01,
        4.78,
        1.88,
        48.1 + i * 0.7 + 0.02,
        0,
        (i - 1) * 0.9,
      );
    }
    for (let i = 0; i < 4; i++)
      k.box(
        b,
        i === 2 ? M.red : M.amber,
        0.03,
        0.06,
        0.06,
        4.84,
        1.3,
        48.0 + i * 0.5,
      );
    k.box(b, M.desk, 0.26, 0.9, 0.7, -4.85, 1.6, 50.2);
    k.box(b, M.orange, 0.02, 0.2, 0.2, -4.71, 1.85, 50.2);
    k.box(b, M.dark, 0.02, 0.5, 0.5, -4.7, 1.45, 50.2, 0, 0, 0.35); // blown door hanging off
    for (let i = 0; i < 3; i++)
      k.box(
        b,
        M.dark,
        0.3,
        0.02,
        0.08,
        -4.6,
        2.1 + i * 0.05,
        49.5 - i * 0.2,
        0.3,
        0,
        -0.5 + i * 0.3,
      ); // scorch streaks
    // hazard stripes round the pump plinths
    for (const sx of [-1.45, 1.45])
      for (let i = 0; i < 18; i++)
        k.box(
          b,
          i % 2 ? M.orange : M.dark,
          0.12,
          0.012,
          0.4,
          sx,
          0.006,
          45.6 + i * 0.4,
        );
    k.flush(b, root, false);

    // stencils
    const st = (t, x, y, z, ry, w) => {
      const s = k.plate(t, w || 1.0, (w || 1.0) * 0.3, {
        fg: "#1c1c1a",
        bg: "#d8641e",
      });
      s.position.set(x, y, z);
      s.rotation.y = ry;
      root.add(s);
    };
    st("PUMP 1", -2.6, 2.9, 47.95, Math.PI, 0.8);
    st("PUMP 2", 2.6, 2.9, 47.95, Math.PI, 0.8);
    st("DANGER — 480 V\nDO NOT TOUCH, CHO", -4.7, 2.35, 50.2, Math.PI / 2, 0.8);
    st("DIRECTOR'S OFFICE →", 11.84, 2.45, 28.4, -Math.PI / 2, 1.1);
    st("CREW QUARTERS →", -11.84, 2.45, 37.2, Math.PI / 2, 1.1);

    // an interactable for the fuse box (flavour; ties the maintenance log together)
    QX.interact({
      pos: QX.V3(O.x - 4.6, 1.6, O.z + 50.2),
      radius: 0.6,
      label: "Pump 2 Fuse Box",
      verb: "Examine",
      priority: 1,
      onInteract: () =>
        QX.notify(
          QX.flag("c4_pumps")
            ? "Somebody has jammed a bent spoon across the blown fuse. It is holding. It should not be holding."
            : 'Blackened, blown, and bone dry for the first time in twenty-two years. A grease-pencil note on the lid: "NOBODY. — Maintenance."',
        ),
    });
  });

  // ------------------------------------------------------------------
  // Animation (only while inside the facility)
  // ------------------------------------------------------------------
  let T = 0;
  QX.hook("update", function (dt) {
    const V = QX.c4;
    if (!V || !V.root || !V.root.visible || !D.normal) return;
    T += dt;
    D.normal.offset.set((T * 0.011) % 1, (T * 0.006) % 1);
    for (const s of D.scum)
      if (s.material.map) {
        s.material.map.offset.set((T * 0.0022) % 1, (T * 0.0013) % 1);
        break;
      }
    const drained = QX.flag("c4_pumps");
    for (const d of D.debris) {
      const w = V.water[d.sheet];
      if (!w) continue;
      const bob =
        drained && w.position.y < 0.08 ? 0 : Math.sin(T * 0.9 + d.ph) * 0.012;
      d.group.position.y = w.position.y - 0.42 + bob;
      d.group.rotation.y =
        drained && w.position.y < 0.08
          ? d.group.rotation.y
          : Math.sin(T * 0.05 + d.ph) * 0.01;
    }
    for (const r of D.rings) {
      const w = V.water[r.sheet];
      const wy = w ? w.position.y : 0.42;
      r.t += dt;
      const fall = 0.55; // drop falls for fall s, then the ring spreads
      if (r.t < fall) {
        r.drop.visible = true;
        r.drop.position.y = wy + (1 - r.t / fall) * (r.sheet === 1 ? 6.5 : 2.6);
        r.mesh.material.opacity = 0;
      } else {
        r.drop.visible = false;
        const u = (r.t - fall) / 1.3;
        if (u >= 1) {
          r.mesh.material.opacity = 0;
          if (r.t > fall + r.period) r.t = 0;
        } else {
          const s = 0.08 + u * 0.9;
          r.mesh.scale.set(s, s, 1);
          r.mesh.material.opacity = (1 - u) * 0.55;
        }
      }
      r.mesh.position.y = wy + 0.004;
    }
  });
})();
