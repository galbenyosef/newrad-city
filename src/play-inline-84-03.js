// play-inline-84 03 — ctx
// Lines 458-787 of readable/play-inline-84.pretty.js (statement-aligned).
  M.defineAtlas("hieroglyphs", function () {
    const Wd = 256,
      H = 1024,
      cv = M.canvas(Wd, H),
      ctx = cv.getContext("2d");
    const r = M.rng("glyphs");
    // weathered rose granite
    const img = ctx.createImageData(Wd, H),
      d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = r(),
        sp = r() < 0.06 ? -40 : r() < 0.05 ? 30 : 0;
      d[i] = 150 + n * 34 + sp;
      d[i + 1] = 118 + n * 26 + sp;
      d[i + 2] = 108 + n * 22 + sp;
      d[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    // rain streaks & soot, darker lower down
    for (let i = 0; i < 60; i++) {
      const x = r() * Wd,
        w = 2 + r() * 10;
      ctx.fillStyle = "rgba(40,30,28," + (0.05 + r() * 0.1).toFixed(2) + ")";
      ctx.fillRect(x, r() * H * 0.3, w, H);
    }
    const grd = ctx.createLinearGradient(0, 0, 0, H);
    grd.addColorStop(0, "rgba(0,0,0,0)");
    grd.addColorStop(1, "rgba(30,24,20,0.35)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, Wd, H);
    // one central column of glyphs (the real Needle: a single inscribed column per face), worn away at the bottom
    const glyph = (cx, cy, s, k, a) => {
      ctx.strokeStyle = "rgba(52,36,32," + a + ")";
      ctx.fillStyle = "rgba(52,36,32," + a + ")";
      ctx.lineWidth = s * 0.12;
      ctx.lineCap = "round";
      ctx.beginPath();
      if (k === 0) {
        ctx.ellipse(cx, cy, s * 0.42, s * 0.22, 0, 0, 7);
        ctx.moveTo(cx - s * 0.1, cy);
        ctx.arc(cx, cy, s * 0.1, 0, 7);
      } // eye
      else if (k === 1) {
        ctx.moveTo(cx - s * 0.4, cy + s * 0.3);
        ctx.quadraticCurveTo(
          cx - s * 0.1,
          cy - s * 0.5,
          cx + s * 0.35,
          cy - s * 0.1,
        );
        ctx.lineTo(cx + s * 0.4, cy + s * 0.35);
        ctx.moveTo(cx + s * 0.35, cy - s * 0.1);
        ctx.lineTo(cx + s * 0.45, cy - s * 0.3);
      } // bird
      else if (k === 2) {
        for (let j = 0; j < 4; j++) {
          ctx.moveTo(cx - s * 0.45 + j * s * 0.22, cy);
          ctx.lineTo(cx - s * 0.34 + j * s * 0.22, cy - s * 0.12);
          ctx.lineTo(cx - s * 0.23 + j * s * 0.22, cy);
        }
      } // water
      else if (k === 3) {
        ctx.arc(cx, cy - s * 0.2, s * 0.16, 0, 7);
        ctx.moveTo(cx, cy - s * 0.04);
        ctx.lineTo(cx, cy + s * 0.42);
        ctx.moveTo(cx - s * 0.25, cy + s * 0.08);
        ctx.lineTo(cx + s * 0.25, cy + s * 0.08);
      } // ankh
      else if (k === 4) {
        ctx.moveTo(cx - s * 0.1, cy - s * 0.45);
        ctx.lineTo(cx - s * 0.1, cy + s * 0.4);
        ctx.moveTo(cx - s * 0.1, cy - s * 0.45);
        ctx.quadraticCurveTo(
          cx + s * 0.3,
          cy - s * 0.4,
          cx + s * 0.1,
          cy - s * 0.15,
        );
      } // reed
      else if (k === 5) {
        ctx.rect(cx - s * 0.35, cy - s * 0.2, s * 0.7, s * 0.4);
      } // house / pool
      else if (k === 6) {
        ctx.moveTo(cx - s * 0.4, cy + s * 0.3);
        ctx.lineTo(cx, cy - s * 0.4);
        ctx.lineTo(cx + s * 0.4, cy + s * 0.3);
      } // pyramid
      else {
        ctx.arc(cx, cy, s * 0.3, Math.PI, 0);
        ctx.moveTo(cx - s * 0.3, cy);
        ctx.lineTo(cx + s * 0.3, cy);
      } // bread / sun
      ctx.stroke();
    };
    ctx.strokeStyle = "rgba(60,42,36,0.55)";
    ctx.lineWidth = 3;
    ctx.strokeRect(78, 36, 100, H - 120);
    for (let y = 70; y < H - 100; y += 44) {
      const wear = M.clamp(1 - (y - H * 0.55) / (H * 0.4), 0.15, 1);
      if (r() < 0.12) continue;
      if (r() < 0.25) {
        glyph(108, y, 34, r.int(0, 7), (0.75 * wear).toFixed(2));
        glyph(148, y, 34, r.int(0, 7), (0.75 * wear).toFixed(2));
      } else glyph(128, y, 44, r.int(0, 7), (0.8 * wear).toFixed(2));
    }
    // cartouche near the top
    ctx.strokeStyle = "rgba(52,36,32,0.8)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(128, 160, 34, 70, 0, 0, 7);
    ctx.stroke();
    // cracks, chips, a spray-painted Glowkeeper sun-disc scrawl low on one face
    for (let i = 0; i < 16; i++) {
      let x = r() * Wd,
        y = r() * H;
      ctx.strokeStyle = "rgba(30,20,18,0.6)";
      ctx.lineWidth = 1 + r() * 1.5;
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let k = 0; k < 6; k++) {
        x += (r() - 0.5) * 20;
        y += 8 + r() * 16;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.save();
    ctx.translate(128, H - 128);
    ctx.rotate(-0.08);
    ctx.strokeStyle = ctx.fillStyle = "rgba(214,138,38,0.6)";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, 7);
    ctx.fill(); // the sun disc …
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 30, Math.sin(a) * 30);
      ctx.lineTo(
        Math.cos(a) * (k % 2 ? 40 : 48),
        Math.sin(a) * (k % 2 ? 40 : 48),
      );
      ctx.stroke();
    }
    ctx.font = "bold 27px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("THE SUN SAW US", 0, 82, 236); // … and its gospel
    ctx.restore();
    const t = M.finishTex(new THREE.CanvasTexture(cv));
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    return { texture: t, roughness: 0.9, bump: 0.6 };
  });
  function buildNeedle() {
    const P = PIECES.needle,
      x = P.x,
      z = P.z,
      r = M.rng("needle");
    const gr = M.buf("granite", x, z, "main");
    const GC = [0.72, 0.7, 0.68];
    // stepped granite base
    let y = 0;
    for (const [hw, h] of [
      [6, 0.4],
      [5, 0.4],
      [4, 0.45],
      [2.1, 1.7],
    ]) {
      M.box(gr, x - hw, y, z - hw, x + hw, y + h, z + hw, {
        s: 2,
        c: M.mulc(GC, 0.85 + 0.1 * r()),
        skip: 8,
      });
      y += h;
    }
    // bronze crabs under the four corners of the shaft (the Needle really stands on them)
    const br = M.buf("metal_painted", x, z, "detail");
    for (const [sx, sz] of [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ]) {
      M.obox(
        br,
        x + sx * 1.35,
        y + 0.18,
        z + sz * 1.35,
        0.9,
        0.36,
        0.7,
        Math.atan2(sx, sz),
        { c: [0.32, 0.5, 0.42], s: 1 },
      );
      for (let k = 0; k < 3; k++)
        M.beam(
          br,
          x + sx * 1.35,
          y + 0.2,
          z + sz * 1.35,
          x + sx * (1.8 + k * 0.1),
          y,
          z + sz * (1.1 + k * 0.25),
          0.07,
          0.07,
          { c: [0.3, 0.46, 0.4] },
        );
    }
    // the shaft: tapered square frustum with the glyph atlas on every face, pyramidion on top
    const y0 = y + 0.3,
      H = 13.5,
      bw = 1.25,
      tw = 0.8,
      py = 1.2;
    const gb = M.buf("my/hieroglyphs", x, z, "main");
    M.box(gr, x - 1.45, y, z - 1.45, x + 1.45, y0, z + 1.45, {
      s: 2,
      c: [0.5, 0.42, 0.4],
      skip: 8,
    });
    const lean = 0.012; // the smallest list after a century of New York frost
    const C = (sx, sz, top) => [
      x + sx * (top ? tw : bw) + (top ? lean * H : 0),
      top ? y0 + H : y0,
      z + sz * (top ? tw : bw),
    ];
    const faces = [
      [
        [-1, -1],
        [1, -1],
        [0, 0, -1],
      ],
      [
        [1, -1],
        [1, 1],
        [1, 0, 0],
      ],
      [
        [1, 1],
        [-1, 1],
        [0, 0, 1],
      ],
      [
        [-1, 1],
        [-1, -1],
        [-1, 0, 0],
      ],
    ];
    for (const [a, b2, n] of faces) {
      const nn = v3n([n[0], (bw - tw) / H, n[2]]);
      M.quad(
        gb,
        C(a[0], a[1], false),
        C(b2[0], b2[1], false),
        C(b2[0], b2[1], true),
        C(a[0], a[1], true),
        nn,
        [1, 0, 0, 0, 0, 1, 1, 1],
        [0.95, 0.92, 0.9],
        [1.05, 1.02, 1],
      );
      const apex = [x + lean * H, y0 + H + py, z];
      const tA = C(a[0], a[1], true),
        tB = C(b2[0], b2[1], true);
      M.tri(
        gr,
        tA,
        tB,
        apex,
        v3n([n[0], 0.7, n[2]]),
        [0, 0, 1, 0, 0.5, 1],
        [0.66, 0.54, 0.5],
      );
    }
    // a slab spalled off one corner, lying at the foot
    M.obox(gr, x + 2.9, y - 1.2, z + 1.6, 1.3, 0.35, 0.8, 0.7, {
      c: [0.62, 0.5, 0.46],
      s: 1,
      roll: 0.3,
    });
    // low cast-iron fence ring round the plinth (bent & broken in places)
    const fb = M.buf("metal_painted", x, z, "detail");
    const R = 6.6,
      n = 32;
    for (let i = 0; i < n; i++) {
      if (i % 11 === 4 || i % 11 === 5) continue; // gaps
      const a0 = (i / n) * Math.PI * 2,
        a1 = ((i + 1) / n) * Math.PI * 2;
      const p0 = [x + Math.cos(a0) * R, z + Math.sin(a0) * R],
        p1 = [x + Math.cos(a1) * R, z + Math.sin(a1) * R];
      const bend = i % 7 === 2 ? 0.45 : 0;
      M.beam(fb, p0[0], 0.95 - bend, p0[1], p1[0], 0.95, p1[1], 0.04, 0.04, {
        c: [0.16, 0.16, 0.15],
      });
      M.vbar(
        fb,
        p0[0],
        p0[1],
        0,
        1.05 - bend,
        0.04,
        Math.cos(a0),
        Math.sin(a0),
        [0.16, 0.16, 0.15],
        true,
      );
    }
    // colliders
    M.box3(x - 6, 0, z - 6, x + 6, 0.4, z + 6, {
      tag: "monument",
      surface: "concrete",
    });
    M.box3(x - 5, 0.4, z - 5, x + 5, 0.8, z + 5, {
      tag: "monument",
      surface: "concrete",
    });
    M.box3(x - 4, 0.8, z - 4, x + 4, 1.25, z + 4, {
      tag: "monument",
      surface: "concrete",
    });
    M.box3(x - 2.1, 1.25, z - 2.1, x + 2.1, y0 + H, z + 2.1, {
      tag: "monument",
      walkable: false,
    });
    M.needle = { x, z, top: y0 + H + py };
  }

  // -------------------------------------------------------------------
  // 3. Naumburg Bandshell (head of the Mall, opening west onto the promenade)
  // -------------------------------------------------------------------
