// play-inline-371 02 — ctx
// Lines 16-339 of readable/play-inline-371.pretty.js (statement-aligned).
  const P = G._m3;
  const TAU = P.TAU,
    HP = P.HP;
  const M = P.MAT,
    C = P.CUSTOM;

  // ---- plain paints (own MeshStandardMaterial with vertex colours) ----
  Object.assign(M, {
    silk_red: { color: 0xa8281e, rough: 0.55, uv: 1 },
    silk_yellow: { color: 0xd6a820, rough: 0.55, uv: 1 },
    silk_green: { color: 0x236f36, rough: 0.55, uv: 1 },
    silk_blue: { color: 0x24449a, rough: 0.55, uv: 1 },
    silk_orange: { color: 0xcc5f22, rough: 0.55, uv: 1 },
    silk_purple: { color: 0x5e3280, rough: 0.55, uv: 1 },
    silk_white: { color: 0xe4ded0, rough: 0.6, uv: 1 },
    jockey_black: { color: 0x141412, rough: 0.45, metal: 0.2, uv: 1 },
    jockey_face: { color: 0x6c655c, rough: 0.7, metal: 0.25, uv: 1 },
    check_red: { custom: "check_red", color: 0xb03028, uv: 0.8, rough: 0.95 },
    mahogany: { custom: "mahogany", color: 0x4a2418, uv: 1.8, rough: 0.5 },
    canvas_green: { src: "fabric", tint: 0x2e4a30, color: 0x2e4a30, uv: 1 },
    canvas_red: { src: "fabric", tint: 0x7a2420, color: 0x7a2420, uv: 1 },
    sheet: { src: "fabric", tint: 0xcfc6ae, color: 0xbab094, uv: 1 },
    continuity_black: {
      src: "metal_painted",
      tint: 0x2a2c2e,
      color: 0x222426,
      uv: 2,
      metal: 0.4,
    },
    continuity_panel: {
      src: "metal_panel",
      tint: 0x5c6266,
      color: 0x4a5054,
      uv: 2,
    },
    gilt: { color: 0xc89a3a, rough: 0.35, metal: 0.75, uv: 1 },
    gilt_dull: { color: 0x9a7a38, rough: 0.55, metal: 0.55, uv: 1 },
    copper_roof: {
      src: "copper_patina",
      tint: 0xb8c890,
      color: 0x7a9a6a,
      uv: 3,
    },
    copper_gilt: {
      src: "copper_patina",
      tint: 0xf0c060,
      color: 0xa88a40,
      uv: 4,
      rough: 0.5,
      metal: 0.25,
    }, // the Helmsley's gilded roof, patina bleeding through
    travertine: { src: "marble", tint: 0xeadcc0, color: 0xc8b890, uv: 2.5 },
    marble_rouge: {
      src: "marble_dark",
      tint: 0xe09a80,
      color: 0x8a4a38,
      uv: 2,
    },
    lamp_amber: {
      color: 0xffc070,
      emissive: 0xffa040,
      ei: 1.6,
      plain: true,
      noShadow: true,
      uv: 1,
    },
    lamp_gold: {
      color: 0xffe0a0,
      emissive: 0xffc860,
      ei: 1.3,
      plain: true,
      noShadow: true,
      uv: 1,
    },
    holo: {
      color: 0x103a20,
      emissive: 0x40ff90,
      ei: 0.8,
      rough: 0.2,
      plain: true,
      noShadow: true,
      uv: 1,
      opacity: 0.55,
    },
    core_blue: {
      color: 0x284a78,
      emissive: 0x5aa0ff,
      ei: 1.6,
      rough: 0.2,
      plain: true,
      noShadow: true,
      uv: 1,
    },
    // one vertex-tinted material for every racing silk (was 7 materials = 7 draw calls per site): b.geo('silk', g, m, {c: P.SILK_COL[k]})
    silk: { color: 0xffffff, rough: 0.55, uv: 1 },
    frame_dirty: { src: "paint_white", tint: 0x8e887a, color: 0x8a8476, uv: 2 },
    frame_cream_dirty: {
      src: "paint_cream",
      tint: 0x948a70,
      color: 0x8a8068,
      uv: 2,
    },
    travertine_v: {
      custom: "travertine_v",
      color: 0xd8c8a4,
      uv: 2.4,
      rough: 0.55,
    },
    terrazzo_polish: {
      src: "terrazzo",
      tint: 0xe8dcc4,
      color: 0xb8b0a0,
      uv: 2,
      rough: 0.28,
    },
    lacquer_red: { custom: "lacquer_red", color: 0x3a1410, uv: 2, rough: 0.35 },
    tin_ceiling: {
      custom: "tin_ceiling",
      color: 0x8a8070,
      uv: 1.2,
      rough: 0.5,
      metal: 0.3,
    },
    linoleum: { custom: "linoleum", color: 0x6a6450, uv: 2.4, rough: 0.6 },
    frost: { color: 0xdce8ee, rough: 0.3, uv: 1 },
    meat: { color: 0x5a1a14, rough: 0.5, uv: 0.5 },
    chalk: {
      color: 0xe8e4d8,
      emissive: 0x303030,
      ei: 0.3,
      plain: true,
      noShadow: true,
      uv: 1,
    },
  });
  P.SILK_COL = {
    silk_red: 0xa8281e,
    silk_yellow: 0xd6a820,
    silk_green: 0x236f36,
    silk_blue: 0x24449a,
    silk_orange: 0xcc5f22,
    silk_purple: 0x5e3280,
    silk_white: 0xe4ded0,
  };
  /** Material key + options for a silk colour key: ['silk', {c}] (or the key untouched if it isn't a silk). */
  P.silkKey = (k) =>
    P.SILK_COL[k] !== undefined ? ["silk", P.SILK_COL[k]] : [k, undefined];

  C.travertine_v = [
    512,
    512,
    (ctx, w, h) => {
      const r = P.rng("trav");
      ctx.fillStyle = "#e4d6b8";
      ctx.fillRect(0, 0, w, h);
      // horizontal sedimentary banding + pitting, cut in ashlar blocks (2 courses per tile)
      for (let y = 0; y < h; y += 2) {
        ctx.fillStyle =
          "rgba(" +
          ((150 + r() * 60) | 0) +
          "," +
          ((120 + r() * 40) | 0) +
          ",80," +
          (0.04 + r() * 0.08) +
          ")";
        ctx.fillRect(0, y, w, 1 + r() * 3);
      }
      for (let i = 0; i < 26; i++) {
        const y = r() * h;
        ctx.strokeStyle = "rgba(150,110,60," + (0.12 + r() * 0.2) + ")";
        ctx.lineWidth = 1 + r() * 3;
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x <= w; x += 32)
          ctx.lineTo(x, y + Math.sin(x * 0.02 + i) * 6 + (r() - 0.5) * 4);
        ctx.stroke();
      }
      for (let i = 0; i < 700; i++) {
        ctx.fillStyle = "rgba(90,70,40," + (0.2 + r() * 0.4) + ")";
        ctx.fillRect(r() * w, r() * h, 1 + r() * 4, 1 + r() * 1.6);
      }
      ctx.strokeStyle = "rgba(120,96,60,0.55)";
      ctx.lineWidth = 2;
      for (let j = 0; j < 2; j++) {
        const y = (j * h) / 2;
        ctx.beginPath();
        ctx.moveTo(0, y + 1);
        ctx.lineTo(w, y + 1);
        ctx.stroke();
        const jx = (j % 2 ? w / 2 : 0) + 1;
        ctx.beginPath();
        ctx.moveTo(jx, y);
        ctx.lineTo(jx, y + h / 2);
        ctx.stroke();
      }
      P.blotches(ctx, w, h, r, 16, 0.12);
    },
  ];
  C.lacquer_red = [
    256,
    256,
    (ctx, w, h) => {
      const r = P.rng("lacq");
      ctx.fillStyle = "#5a1a12";
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 40; i++) {
        const g = ctx.createRadialGradient(
          r() * w,
          r() * h,
          0,
          r() * w,
          r() * h,
          20 + r() * 60,
        );
        g.addColorStop(0, "rgba(20,4,2,0.25)");
        g.addColorStop(1, "rgba(20,4,2,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }
      ctx.strokeStyle = "rgba(200,150,60,0.25)";
      ctx.lineWidth = 3;
      ctx.strokeRect(6, 6, w - 12, h - 12);
      P.speckle(ctx, w, h, r, 500, 0.2, 0.05);
    },
  ];
  C.tin_ceiling = [
    256,
    256,
    (ctx, w, h) => {
      const r = P.rng("tin");
      ctx.fillStyle = "#9a9080";
      ctx.fillRect(0, 0, w, h);
      const n = 2,
        s = w / n;
      for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++) {
          const x = i * s,
            y = j * s;
          ctx.strokeStyle = "rgba(40,34,26,0.7)";
          ctx.lineWidth = 4;
          ctx.strokeRect(x + 6, y + 6, s - 12, s - 12);
          ctx.strokeStyle = "rgba(230,220,200,0.35)";
          ctx.lineWidth = 2;
          ctx.strokeRect(x + 12, y + 12, s - 24, s - 24);
          ctx.beginPath();
          ctx.arc(x + s / 2, y + s / 2, s * 0.22, 0, TAU);
          ctx.stroke();
          for (let k = 0; k < 8; k++) {
            const a = (k / 8) * TAU;
            ctx.beginPath();
            ctx.arc(
              x + s / 2 + Math.cos(a) * s * 0.3,
              y + s / 2 + Math.sin(a) * s * 0.3,
              5,
              0,
              TAU,
            );
            ctx.fillStyle = "rgba(40,34,26,0.45)";
            ctx.fill();
          }
        }
      P.blotches(ctx, w, h, r, 30, 0.35);
      for (let i = 0; i < 20; i++) {
        ctx.fillStyle = "rgba(110,60,30," + r() * 0.4 + ")";
        ctx.fillRect(r() * w, r() * h, 4 + r() * 20, 3 + r() * 14);
      }
    },
  ];
  C.linoleum = [
    256,
    256,
    (ctx, w, h) => {
      const r = P.rng("lino");
      ctx.fillStyle = "#7a735a";
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 1400; i++) {
        ctx.fillStyle =
          r() < 0.5 ? "rgba(40,36,24,0.25)" : "rgba(200,190,150,0.18)";
        ctx.fillRect(r() * w, r() * h, 1 + r() * 3, 1 + r() * 3);
      }
      ctx.strokeStyle = "rgba(30,26,18,0.35)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
      for (let i = 0; i < 14; i++) {
        const g = ctx.createRadialGradient(
          r() * w,
          r() * h,
          0,
          r() * w,
          r() * h,
          30 + r() * 50,
        );
        g.addColorStop(0, "rgba(30,24,14,0.3)");
        g.addColorStop(1, "rgba(30,24,14,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }
    },
  ];

  C.check_red = [
    256,
    256,
    (ctx, w, h) => {
      const r = P.rng("check");
      ctx.fillStyle = "#e8e0cc";
      ctx.fillRect(0, 0, w, h);
      const n = 8,
        s = w / n;
      for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++) {
          const a = (i % 2) + (j % 2);
          ctx.fillStyle =
            a === 2
              ? "rgba(150,28,24,0.95)"
              : a === 1
                ? "rgba(170,50,44,0.55)"
                : "rgba(0,0,0,0)";
          ctx.fillRect(i * s, j * s, s, s);
        }
      P.blotches(ctx, w, h, r, 26, 0.35);
      P.speckle(ctx, w, h, r, 900, 0.3, 0.06);
    },
  ];
