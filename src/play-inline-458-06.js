// play-inline-458 06 — math
// Lines 1494-1843 of readable/play-inline-458.pretty.js (statement-aligned).
  function sculptedBeard(R, b, face, style, color, C, RX, RY, RZ, skin) {
    const ws = 46,
      hsg = 24;
    const th0 = Math.acos(-0.02); // shell starts below the eyes/lower lids (it would cover the eyeballs at 0.98)
    const g = P.shell(1, 1, 1, ws, hsg, 4.1, th0, PI - th0);
    const pos = g.attributes.position,
      n = pos.count;
    const mw = face._k.mouthW;
    const styleMask = (x, y, z) => {
      const mo =
        sm(mw + 0.08, mw - 0.02, Math.abs(x)) *
        band(y, MOUTH_Y + 0.045, MOUTH_Y + 0.13, 0.015) *
        sm(-0.55, -0.8, z); // moustache
      if (style === "moustache") return mo;
      let m = beardMask(x, y, z);
      if (style === "goatee")
        m *=
          Math.exp(-Math.pow(x / 0.3, 6)) *
          sm(MOUTH_Y + 0.02, MOUTH_Y - 0.04, y);
      return Math.max(m, mo);
    };
    // CONTINUOUS thickness from the (noisy) mask: outside it the shell lies
    // 2 % under the skin (hidden), inside it rises smoothly — the visible edge
    // is where the shell emerges from the skin, a smooth ragged contour
    // instead of grid-aligned stair steps from collapsed vertices.
    const o = [0, 0, 0, 0, 0, 0];
    for (let i = 0; i < n; i++) {
      const x = pos.getX(i),
        y = pos.getY(i),
        z = pos.getZ(i);
      const m =
        styleMask(x, y, z) +
        (L.noise3(x * 9 + 5, y * 9, z * 9) - 0.5) * 0.3 +
        (L.noise3(x * 31 + 2, y * 31, z * 31) - 0.5) * 0.12;
      const grow = sm(0.4, 0.78, m);
      sculpt(face, x, y, z, o, { noSocket: true, noRecess: true });
      const len =
        style === "full"
          ? 0.055 + 0.1 * sm(-0.55, -1.0, y)
          : style === "goatee"
            ? 0.05 + 0.07 * sm(-0.6, -1.0, y)
            : 0.045;
      // bare shell round the mouth is tucked deep (it must never span the open
      // mouth's cavity); elsewhere it stays just under the skin, so the rise
      // is gradual and the emergence contour smooth (a deep tuck next to a
      // grown vertex makes a steep wall whose skin crossing follows the grid)
      const mouthZone =
        Math.exp(
          -Math.pow(x / (mw + 0.05), 4) - Math.pow((y - MOUTH_Y) / 0.09, 4),
        ) * sm(-0.3, -0.7, z);
      const k = 0.98 + (len + 0.024) * grow - 0.26 * mouthZone * (1 - grow);
      let yy = o[1];
      if (style === "full" && y < -0.7)
        yy -= 0.12 * sm(-0.7, -0.98, y) * grow * grow; // chin beard hangs
      pos.setXYZ(
        i,
        C[0] + o[0] * RX * k,
        C[1] + yy * RY * k,
        C[2] + o[2] * RZ * k,
      );
    }
    g.computeVertexNormals();
    R.add("head", g, {
      color: L.shade(color, 0.92),
      region: "fur",
      rough: 0.95,
      noise: 0.16,
      grad: [0.9, 1.05],
      noDouble: true,
      skin: skin || undefined,
    });
  }

  // Beard shells follow the jaw (so full beards open with the mouth)
  const oldBeard = H.beard;
  H.beard = function (R, b, style, color, C, RX, RY, RZ, skin) {
    if (!skin) return oldBeard(R, b, style, color, C, RX, RY, RZ);
    const n0 = R.prims.length;
    oldBeard(R, b, style, color, C, RX, RY, RZ);
    // re-skin the beard prims just added (their geometry is already coloured & uv'd)
    for (let i = n0; i < R.prims.length; i++) {
      const p = R.prims[i],
        geo = p.geo,
        pos = geo.attributes.position,
        n = pos.count,
        bw = R.bones[p.bone].world;
      const idx = new Uint16Array(n * 4),
        w = new Float32Array(n * 4);
      for (let k = 0; k < n; k++) {
        const list = skin(
          pos.getX(k) + bw[0],
          pos.getY(k) + bw[1],
          pos.getZ(k) + bw[2],
        );
        let sum = 0,
          m = 0;
        idx[k * 4] = p.bone;
        for (const e of list) {
          const ob = R.map[e[0]];
          if (ob === undefined || m >= 3) continue;
          idx[k * 4 + 1 + m] = ob;
          w[k * 4 + 1 + m] = e[1];
          sum += e[1];
          m++;
        }
        if (sum > 1) {
          for (let q = 1; q <= m; q++) w[k * 4 + q] /= sum;
          sum = 1;
        }
        w[k * 4] = 1 - sum;
      }
      geo.userData.infl = { idx, w };
    }
  };

  // ==================================================================
  // FACE TEXTURES
  // ==================================================================
  // Pixel → direction lookup (per column / per row), built once.
  let colA = null,
    rowT = null;
  function ensureLUT() {
    if (colA) return;
    colA = new Float32Array(FT * 2);
    rowT = new Float32Array(FT * 2);
    for (let i = 0; i < FT; i++) {
      const a = fwd(TA, (i + 0.5) / FT),
        th = fwd(TT, Math.min(1, (i + 0.5) / (FT * TV)));
      colA[i * 2] = Math.sin(a);
      colA[i * 2 + 1] = Math.cos(a);
      rowT[i * 2] = Math.sin(th);
      rowT[i * 2 + 1] = Math.cos(th);
    }
  }
  const hash2 = (x, y) => {
    let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  /** unit-head point → canvas pixel */
  const _pp = [0, 0];
  function px(x, y, z) {
    FM.param(x, y, z, _pp);
    return [_pp[0] * FT, _pp[1] * FT];
  }
  function pxFront(x, y) {
    return px(x, y, -Math.sqrt(Math.max(0.02, 1 - x * x - y * y)));
  }

  /**
   * Generic face: every value is a MODULATION of the vertex skin colour
   * (0.5 = ×1), alpha = roughness multiplier.
   */
  function paintGeneric(ctx) {
    ensureLUT();
    const img = ctx.createImageData(FT, FT),
      D = img.data;
    for (let py = 0; py < FT; py++) {
      const st = rowT[py * 2],
        y = rowT[py * 2 + 1];
      for (let pxl = 0; pxl < FT; pxl++) {
        const x = st * colA[pxl * 2],
          z = -st * colA[pxl * 2 + 1];
        const f = sm(0.1, 0.6, -z);
        let r = 0.5,
          g = 0.5,
          b = 0.5,
          a = 1;
        // broad tone variation
        const n1 = L.noise3(x * 3.2 + 7, y * 3.2, z * 3.2) - 0.5;
        const n2 = L.noise3(x * 9 + 3, y * 9, z * 9) - 0.5;
        r *= 1 + 0.07 * n1 + 0.04 * n2;
        g *= 1 + 0.06 * n1 + 0.035 * n2;
        b *= 1 + 0.05 * n1 + 0.03 * n2;
        // redness: cheeks, nose tip, chin, ears, lower forehead near brows
        let red = 0;
        for (const sg of [-1, 1])
          red += 0.42 * gau((x - sg * 0.47) * 0.8, y + 0.16, 0.05); // broad & soft (tight blobs read as a doll's rouge)
        red +=
          1.0 * gau(x, y + 0.2, 0.006) +
          0.4 * gau(x, y + 0.72, 0.02) +
          0.6 * sm(0.85, 0.97, Math.abs(x)) * band(y, -0.3, 0.3, 0.1);
        red *= f + (Math.abs(x) > 0.85 ? 1 : 0);
        r *= 1 + 0.1 * red;
        g *= 1 - 0.07 * red;
        b *= 1 - 0.06 * red;
        // eye area: darker, cooler skin under and around the eyes; lid crease
        for (const sg of [-1, 1]) {
          const dx = x - sg * 0.355;
          const ue = Math.exp(
            -Math.pow(dx / 0.12, 2) - Math.pow((y - 0.03) / 0.05, 2),
          );
          r *= 1 - 0.13 * ue * f;
          g *= 1 - 0.15 * ue * f;
          b *= 1 - 0.06 * ue * f;
          const cr = Math.exp(
            -Math.pow(dx / 0.13, 2) - Math.pow((y - 0.205) / 0.012, 2),
          );
          r *= 1 - 0.18 * cr * f;
          g *= 1 - 0.2 * cr * f;
          b *= 1 - 0.18 * cr * f;
          const sock = Math.exp(
            -Math.pow((dx * dx) / 0.016 + Math.pow(y - 0.125, 2) / 0.0105, 1.5),
          );
          r *= 1 - 0.18 * sock * f;
          g *= 1 - 0.22 * sock * f;
          b *= 1 - 0.18 * sock * f;
          // nostrils (undersides of the alae)
          const no = Math.exp(
            -Math.pow((x - sg * 0.052) / 0.019, 2) -
              Math.pow((y + 0.27) / 0.011, 2),
          );
          r *= 1 - 0.55 * no * f;
          g *= 1 - 0.6 * no * f;
          b *= 1 - 0.6 * no * f;
          // nasolabial fold line
          const nd = segD(x, y, sg * 0.14, -0.21, sg * 0.3, -0.47);
          const nf = Math.exp(-Math.pow(nd / 0.014, 2)) * f;
          r *= 1 - 0.08 * nf;
          g *= 1 - 0.1 * nf;
          b *= 1 - 0.1 * nf;
        }
        // brows (generic: soft, medium-dark) — templates repaint in the hair colour
        // oral cavity: wet dark red, darker deeper in
        const rm =
          Math.exp(-Math.pow(Math.pow(x / 0.235, 2), 2.5)) *
          Math.exp(-Math.pow((y - MOUTH_Y) / 0.03, 2)) *
          f;
        if (rm > 0.01) {
          const k = clamp(rm * 1.3, 0, 1);
          r = lerp(r, 0.2, k);
          g = lerp(g, 0.07, k);
          b = lerp(b, 0.07, k);
          a = lerp(a, 0.45, k);
        }
        // pores: pixel-scale noise + dark pits (strongest on nose & cheeks)
        const hp = hash2(pxl, py),
          hq = hash2(pxl * 3 + 1, py * 7 + 2);
        const poreK =
          (0.6 +
            0.8 *
              (gau(x, y + 0.12, 0.03) +
                gau(x - 0.45, y + 0.1, 0.04) +
                gau(x + 0.45, y + 0.1, 0.04))) *
            f +
          0.3;
        const grain = (hp - 0.5) * 0.05 * poreK;
        r *= 1 + grain;
        g *= 1 + grain;
        b *= 1 + grain;
        if (hq > 0.955) {
          const k = 1 - 0.1 * poreK;
          r *= k;
          g *= k;
          b *= k;
        }
        // roughness: oily T-zone (forehead, nose), rougher cheeks
        const tz =
          (sm(0.3, 0.5, y) * sm(0.45, 0.2, Math.abs(x)) +
            Math.exp(-(x * x) / 0.012) * band(y, -0.25, 0.25, 0.05)) *
          f;
        a = Math.min(a, 1 - 0.14 * tz);
        D[(py * FT + pxl) * 4] = clamp(r, 0, 1) * 255;
        D[(py * FT + pxl) * 4 + 1] = clamp(g, 0, 1) * 255;
        D[(py * FT + pxl) * 4 + 2] = clamp(b, 0, 1) * 255;
        D[(py * FT + pxl) * 4 + 3] = clamp(a, 0.35, 1) * 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    paintSwatches(ctx);
  }
  /** Iris (radial fibres, limbal ring, pupil) & lip creases. */
  function paintSwatches(ctx) {
    const [ix, iy, iw, ih] = SW.iris,
      cx = ix + iw / 2,
      cy = iy + ih / 2,
      R0 = iw / 2;
    ctx.save();
    ctx.fillStyle = "rgb(128,128,128)";
    ctx.fillRect(ix - 2, iy - 2, iw + 4, ih + 4);
    const R = L.rng(4242);
    const gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, R0);
    gr.addColorStop(0, "rgb(20,20,20)");
    gr.addColorStop(0.3, "rgb(22,22,22)");
    gr.addColorStop(0.36, "rgb(96,90,84)");
    gr.addColorStop(0.55, "rgb(150,146,140)");
    gr.addColorStop(0.82, "rgb(118,116,112)");
    gr.addColorStop(0.93, "rgb(40,40,42)");
    gr.addColorStop(1, "rgb(70,70,72)");
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.arc(cx, cy, R0, 0, PI * 2);
    ctx.fill();
    ctx.lineWidth = 0.8;
    for (let i = 0; i < 140; i++) {
      // radial fibres
      const a = R() * PI * 2,
        r0 = R0 * (0.34 + R() * 0.1),
        r1 = R0 * (0.62 + R() * 0.3),
        v = 90 + ((R() * 120) | 0);
      ctx.strokeStyle = "rgba(" + v + "," + v + "," + (v - 6) + ",0.5)";
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
      ctx.lineTo(
        cx + Math.cos(a + (R() - 0.5) * 0.15) * r1,
        cy + Math.sin(a + (R() - 0.5) * 0.15) * r1,
      );
      ctx.stroke();
    }
    ctx.fillStyle = "rgb(8,8,8)";
    ctx.beginPath();
    ctx.arc(cx, cy, R0 * 0.31, 0, PI * 2);
    ctx.fill();
    // lips: vertical creases, a lighter wet centre band
    const [lx, ly, lw, lh] = SW.lips;
    ctx.fillStyle = "rgb(128,124,124)";
    ctx.fillRect(lx, ly, lw, lh);
    const lg = ctx.createLinearGradient(0, ly, 0, ly + lh);
    lg.addColorStop(0, "rgba(0,0,0,0.12)");
    lg.addColorStop(0.5, "rgba(255,240,240,0.10)");
    lg.addColorStop(1, "rgba(0,0,0,0.12)");
    ctx.fillStyle = lg;
    ctx.fillRect(lx, ly, lw, lh);
    ctx.strokeStyle = "rgba(40,20,20,0.3)";
    ctx.lineWidth = 0.7;
    for (let i = 0; i < 70; i++) {
      const x = lx + R() * lw,
        y = ly + R() * lh;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (R() - 0.5) * 1.5, y + 2 + R() * 4);
      ctx.stroke();
    }
    ctx.restore();
  }
  function makeTex(cv) {
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.NoColorSpace || "";
    t.anisotropy = 4;
    t.generateMipmaps = true;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.magFilter = THREE.LinearFilter;
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    t.name = "faceTex";
    return t;
  }
  let baseCanvas = null,
    genericCanvas = null,
    genericTex = null;
  /** The per-pixel base (pores, tone, sockets, cavity) — painted once (~0.1 s). */
