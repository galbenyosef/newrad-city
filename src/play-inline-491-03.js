// play-inline-491 03 — reg
// Lines 395-758 of readable/play-inline-491.pretty.js (statement-aligned).
  function paintAtlas() {
    const mk = () => {
      const c = document.createElement("canvas");
      c.width = c.height = ATLAS;
      return c;
    };
    const col = mk(),
      bmp = mk(),
      rgh = mk();
    const C = col.getContext("2d"),
      B = bmp.getContext("2d"),
      R = rgh.getContext("2d");
    const rng = G.util.rng(G.util.hashStr("wpn_hand_atlas"));
    const U = G.util;
    // --- base: luminance ~0.9 skin with soft warm/cool mottling (the material colour is the tone)
    const img = C.getImageData(0, 0, ATLAS, ATLAS),
      d = img.data;
    for (let y = 0; y < ATLAS; y++)
      for (let x = 0; x < ATLAS; x++) {
        const n = U.fbm2(x / 38, y / 38, 3),
          m = U.fbm2(x / 9 + 40, y / 9, 2);
        const g = 222 + n * 26 + (m - 0.5) * 10;
        const i = (y * ATLAS + x) * 4;
        const warm = U.fbm2(x / 60 + 11, y / 60, 2) - 0.5;
        d[i] = Math.min(255, g * (1 + warm * 0.05));
        d[i + 1] = Math.min(255, g * (0.972 - warm * 0.02));
        d[i + 2] = Math.min(255, g * (0.955 - warm * 0.03));
        d[i + 3] = 255;
      }
    C.putImageData(img, 0, 0);
    B.fillStyle = "#808080";
    B.fillRect(0, 0, ATLAS, ATLAS);
    R.fillStyle = "rgb(0,168,0)";
    R.fillRect(0, 0, ATLAS, ATLAS); // roughness in G: 0.66
    // --- pores (colour: tiny darker dots; bump: pits)
    for (let i = 0; i < 9000; i++) {
      const x = rng() * ATLAS,
        y = rng() * ATLAS,
        a = 0.05 + rng() * 0.07;
      C.fillStyle = "rgba(120,70,55," + a + ")";
      C.fillRect(x, y, 1, 1);
      B.fillStyle = "rgba(40,40,40," + a * 3 + ")";
      B.fillRect(x, y, 1, 1);
    }
    // micro-lines (skin texture): short random strokes, stronger on the back of the hand/fingers
    B.lineWidth = 0.7;
    for (let i = 0; i < 1400; i++) {
      const x = rng() * ATLAS,
        y = rng() * ATLAS,
        a = (rng() - 0.5) * 1.2 + (rng() < 0.5 ? 0 : Math.PI / 2),
        l = 3 + rng() * 5;
      B.strokeStyle = "rgba(60,60,60," + (0.12 + rng() * 0.12) + ")";
      B.beginPath();
      B.moveTo(x, y);
      B.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
      B.stroke();
    }
    const line = (ctx, pts, style, w) => {
      ctx.strokeStyle = style;
      ctx.lineWidth = w;
      ctx.beginPath();
      pts.forEach((p, i) =>
        i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]),
      );
      ctx.stroke();
    };
    const blob = (ctx, x, y, rx, ry, style) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(1, ry / rx);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
      g.addColorStop(0, style);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(-rx, -rx, rx * 2, rx * 2);
      ctx.restore();
    };
    /** a crease across the palm side of a strip at v (wraps the seam: u .8→1 and 0→.2) */
    function crease(reg, v, span, depth) {
      for (const seg of [
        [1 - span, 1],
        [0, span],
      ]) {
        const pts = [];
        for (let k = 0; k <= 6; k++) {
          const u = seg[0] + ((seg[1] - seg[0]) * k) / 6;
          const du = Math.min(Math.abs(u), Math.abs(1 - u));
          pts.push(
            px(
              reg,
              u,
              v + 0.012 * Math.cos((du / span) * Math.PI) * (rng() - 0.3),
            ),
          );
        }
        line(C, pts, "rgba(120,62,50," + 0.35 * depth + ")", 1.4);
        line(B, pts, "rgba(20,20,20," + 0.7 * depth + ")", 1.6);
        line(R, pts, "rgba(0,205,0,0.6)", 1.5);
      }
    }
    /** knuckle wrinkles on the back of a strip, centred on v (a few bowed arcs + redness) */
    function wrinkles(reg, v, n, spread, strength) {
      const c = px(reg, 0.5, v),
        w = (reg[2] - reg[0]) * ATLAS;
      blob(
        C,
        c[0],
        c[1],
        w * 0.22,
        w * 0.14,
        "rgba(190,105,90," + 0.28 * strength + ")",
      );
      for (let k = 0; k < n; k++) {
        const dv = (k - (n - 1) / 2) * spread;
        const half =
          0.12 + 0.07 * (1 - Math.abs(k - (n - 1) / 2) / n) + rng() * 0.03;
        const pts = [];
        for (let s = 0; s <= 8; s++) {
          const u = 0.5 - half + (2 * half * s) / 8;
          const bow =
            Math.sin((s / 8) * Math.PI) * spread * 0.9 * Math.sign(dv || 1);
          pts.push(
            px(
              reg,
              u + (rng() - 0.5) * 0.01,
              v + dv + bow + (rng() - 0.5) * 0.004,
            ),
          );
        }
        line(C, pts, "rgba(110,58,45," + 0.3 * strength + ")", 1.1);
        line(B, pts, "rgba(25,25,25," + 0.75 * strength + ")", 1.3);
        line(R, pts, "rgba(0,200,0,0.5)", 1.2);
        const hi = pts.map((p) => [p[0], p[1] + 1.4]);
        line(C, hi, "rgba(255,235,220," + 0.12 * strength + ")", 0.8);
      }
    }
    // --- phalanx strips
    for (const [name, reg] of [
      ["prox", REG.prox],
      ["mid", REG.mid],
      ["dist", REG.dist],
    ]) {
      // palm-side creases at the joints (two lines at the base, one at the far joint)
      // (joint features sit on the body just inside the end domes: the domes overlap into the neighbouring
      //  segment when the finger bends, and features painted on them read as concentric rings)
      crease(reg, 0.21, 0.2, 1);
      crease(reg, 0.245, 0.17, 0.7);
      if (name !== "dist") crease(reg, 0.79, 0.18, 0.8);
      // back-of-finger wrinkles over the joints this strip touches
      if (name === "prox") wrinkles(reg, 0.765, 5, 0.011, 1);
      if (name === "mid") {
        wrinkles(reg, 0.235, 4, 0.011, 0.9);
        wrinkles(reg, 0.775, 3, 0.01, 0.7);
      }
      if (name === "dist") wrinkles(reg, 0.235, 3, 0.01, 0.65);
      // faint hair / pigment on the back of the proximal phalanx
      if (name === "prox")
        for (let i = 0; i < 40; i++) {
          const p0 = px(reg, 0.38 + rng() * 0.24, 0.3 + rng() * 0.4);
          line(C, [p0, [p0[0] + 1.5, p0[1] - 3]], "rgba(90,60,45,0.12)", 0.6);
        }
    }
    // distal: nail fold (cuticle) around where the nail sits, pinker pad & fingertip, whorl lines
    {
      const reg = REG.dist,
        w = (reg[2] - reg[0]) * ATLAS;
      const c0 = px(reg, 0.5, 0.52);
      blob(C, c0[0], c0[1] - 6, w * 0.28, w * 0.35, "rgba(210,120,110,0.22)");
      const tip = px(reg, 0.5, 0.97);
      blob(C, tip[0], tip[1], w * 0.6, w * 0.25, "rgba(225,130,120,0.25)");
      for (const u of [0.0, 1.0]) {
        const p0 = px(reg, u, 0.72);
        blob(C, p0[0], p0[1], w * 0.3, w * 0.5, "rgba(225,135,125,0.22)");
      }
      for (let k = 0; k < 7; k++) {
        // fingerprint arcs on the pad
        for (const off of [0, 1]) {
          const pts = [];
          for (let s = 0; s <= 10; s++) {
            const a = s / 10;
            pts.push(
              px(
                reg,
                off ? 1 - a * (0.1 + k * 0.012) : a * (0.1 + k * 0.012),
                0.62 + k * 0.03 + Math.sin(a * 3) * 0.01,
              ),
            );
          }
          line(B, pts, "rgba(50,50,50,0.25)", 0.8);
        }
      }
    }
    // --- palm (u around: .5 back, 0/1 palm side; v: 0 knuckles → 1 wrist)
    {
      const reg = REG.palm;
      // finger x (hand space), palm-local v of each knuckle (the knuckle end pole is at v=0 and is covered
      // by the finger bases — nothing is painted below v≈.15 so no detail pinches into a star there)
      const kn = [
        [-0.0255, 0.225],
        [-0.0083, 0.205],
        [0.0092, 0.215],
        [0.0255, 0.25],
      ];
      const uOfX = (x) =>
        0.5 -
        Math.asin(Math.max(-0.95, Math.min(0.95, x / 0.04))) / (Math.PI * 2);
      // extensor tendons fanning from the wrist to each knuckle (light ridge + dark flank, bump)
      for (const [x, kv] of kn) {
        const u1 = uOfX(x),
          u0 = 0.5 + (u1 - 0.5) * 0.25;
        const pts = [];
        for (let s = 0; s <= 10; s++) {
          const t = s / 10;
          pts.push(
            px(
              reg,
              u0 + (u1 - u0) * Math.pow(t, 0.8),
              0.95 - (0.95 - kv - 0.03) * t,
            ),
          );
        }
        line(C, pts, "rgba(255,240,228,0.10)", 3);
        line(B, pts, "rgba(210,210,210,0.35)", 3.2);
        line(
          B,
          pts.map((p) => [p[0] + 3, p[1]]),
          "rgba(60,60,60,0.25)",
          1.5,
        );
        // knuckle: redness + wrinkles
        const kp = px(reg, u1, kv);
        blob(C, kp[0], kp[1], 16, 12, "rgba(195,110,95,0.26)");
        for (let k = 0; k < 3; k++) {
          const pts2 = [];
          for (let s = 0; s <= 6; s++)
            pts2.push(
              px(
                reg,
                u1 - 0.03 + (0.06 * s) / 6,
                kv + 0.025 + k * 0.022 + Math.sin((s / 6) * Math.PI) * 0.01,
              ),
            );
          line(C, pts2, "rgba(115,62,48,0.22)", 1);
          line(B, pts2, "rgba(30,30,30,0.5)", 1.2);
        }
      }
      // two faint veins
      for (let vn = 0; vn < 2; vn++) {
        const pts = [];
        let u = 0.47 + vn * 0.07,
          v = 0.97;
        for (let s = 0; s < 14; s++) {
          pts.push(px(reg, u, v));
          u += (rng() - 0.5) * 0.02 + (vn ? 0.004 : -0.003);
          v -= 0.05;
        }
        line(C, pts, "rgba(95,105,150,0.13)", 2.4);
        line(B, pts, "rgba(190,190,190,0.25)", 2.2);
      }
      // palm creases (wrap around the seam at u=0/1)
      const palmLine = (u0, v0, u1, v1, bend, a) => {
        for (const off of [0, 1, -1]) {
          const pts = [];
          for (let s = 0; s <= 12; s++) {
            const t = s / 12;
            pts.push(
              px(
                reg,
                u0 + (u1 - u0) * t + off,
                v0 + (v1 - v0) * t + Math.sin(t * Math.PI) * bend,
              ),
            );
          }
          line(C, pts, "rgba(125,65,55," + a + ")", 1.3);
          line(B, pts, "rgba(25,25,25," + a * 2 + ")", 1.5);
        }
      };
      palmLine(0.84, 0.24, 1.1, 0.16, 0.03, 0.34); // heart line
      palmLine(0.88, 0.4, 1.14, 0.3, 0.04, 0.3); // head line
      palmLine(1.14, 0.36, 1.2, 0.9, 0.05, 0.28); // life line (around the thumb pad)
      // pinker, lighter palm
      for (const u of [0, 1]) {
        const p0 = px(reg, u, 0.5);
        blob(C, p0[0], p0[1], 120, 200, "rgba(230,150,135,0.16)");
      }
    }
    // --- nail plate (u across, v base → free edge)
    {
      const reg = REG.nail;
      const [x0, y0] = px(reg, 0, 1),
        [x1, y1] = px(reg, 1, 0);
      const W = x1 - x0,
        H = y1 - y0;
      C.fillStyle = "rgb(236,198,190)";
      C.fillRect(x0, y0, W, H);
      R.fillStyle = "rgb(0,82,0)";
      R.fillRect(x0, y0, W, H); // glossy
      B.fillStyle = "#909090";
      B.fillRect(x0, y0, W, H);
      const lu = px(reg, 0.5, 0.0);
      blob(C, lu[0], lu[1], W * 0.34, H * 0.22, "rgba(250,236,228,0.9)"); // lunula
      const fe = px(reg, 0.5, 0.93);
      C.fillStyle = "rgba(248,240,222,0.95)";
      C.fillRect(x0, y0, W, fe[1] - y0); // free edge
      line(
        C,
        [
          [x0, fe[1]],
          [x1, fe[1]],
        ],
        "rgba(200,150,140,0.6)",
        1.5,
      );
      for (let i = 0; i < 9; i++) {
        const xx = x0 + W * (0.1 + (0.8 * i) / 8);
        line(
          C,
          [
            [xx, y0 + H * 0.12],
            [xx, y1],
          ],
          "rgba(255,255,255,0.10)",
          1,
        );
        line(
          B,
          [
            [xx, y0],
            [xx, y1],
          ],
          "rgba(170,170,170,0.3)",
          1,
        );
      }
      // side folds & cuticle
      for (const s of [x0, x1 - 6]) {
        C.fillStyle = "rgba(190,120,110,0.4)";
        C.fillRect(s, y0, 6, H);
      }
      line(
        C,
        [
          [x0, y1 - 2],
          [x1, y1 - 2],
        ],
        "rgba(180,110,100,0.55)",
        3,
      );
    }
    // --- plain region: nothing extra (pores only)
    const tex = (cv, srgb) => {
      const t = new THREE.CanvasTexture(cv);
      t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
      if (srgb) t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
      t.needsUpdate = true;
      return t;
    };
    return {
      map: tex(col, true),
      bump: tex(bmp, false),
      rough: tex(rgh, false),
    };
  }
