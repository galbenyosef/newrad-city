// play-inline-89 01 — ctx
// Lines 16-332 of readable/play-inline-89.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const M = G.map._;

  // Hand-lettered old-world trade signs (text, colours) + billboard brands for the washed-out picture ads
  const TRADE = [
    ["FIZZO COLA", "5¢  ICE COLD", "#a8322a", "#efe6cc"],
    ["LONLY", "TELEVISION · SALES & SERVICE", "#1f1f1f", "#e8c860"],
    ["KOSHER", "DELICATESSEN", "#e8e2d0", "#6b2016"],
    ["HOTEL ASTOR", "FIREPROOF · 400 ROOMS", "#2a3a2a", "#e6dcc0"],
    ["STORAGE", "MOVING · PIANOS", "#e8e2d0", "#1d3a5a"],
    ["MAMA MARINARA'S", "INSTANT MEATBALLS", "#c42a1e", "#f6ead0"],
    ["PRAIRIE", "ROOT BEER", "#7a4422", "#f6e2b0"],
    ["CHOCOLATE ZEPPELIN", "SNACK CAKES", "#5a3420", "#f0e4c8"],
    ["HOMEGUARD", "CLEANSER", "#e8e4d8", "#1a3a6a"],
    ["SILVER TORCH", "CIGARETTES", "#26323e", "#e8eaee"],
    ["CIVIL DEFENSE", "KNOW YOUR SHELTER", "#1b2f5a", "#f4f0e6"],
    ["EAGLE MOTORS", "FREEDOM TO EXPLORE", "#16324a", "#f0e8d0"],
  ];
  const GCOLS = 4,
    GROWS = 5;
  // 8 washed-out picture ads (the brands not already painted as trade signs above)
  const PIC_WANT = [
    "empire_brew",
    "burger_brigade",
    "pizza_galaxy",
    "miracle_mane",
    "forever_franks",
    "freedom_flakes",
    "golden_plain",
    "big_apple_cab",
  ];
  /** The picture-ad brands: the wanted ids if the textures module (or the layout) lists them, else its first others. */
  function picBrands() {
    let list = null;
    try {
      list =
        !G.isStub("tex") && G.tex.brands && G.tex.brands().length
          ? G.tex.brands()
          : G.LAYOUT && G.LAYOUT.BRANDS;
    } catch (e) {
      list = null;
    }
    if (!list || !list.length) return PIC_WANT.slice();
    const out = PIC_WANT.filter((b) => list.indexOf(b) >= 0);
    for (const b of list) {
      if (out.length >= PIC_WANT.length) break;
      if (out.indexOf(b) < 0) out.push(b);
    }
    return out;
  }
  M.defineAtlas("ghostads", function () {
    const CW = 512,
      CH = 256;
    const cv = M.canvas(GCOLS * CW, GROWS * CH),
      ctx = cv.getContext("2d");
    const r = M.rng("ghostads");
    const PIC_BRANDS = picBrands();
    ctx.clearRect(0, 0, cv.width, cv.height);
    for (let i = 0; i < GCOLS * GROWS; i++) {
      const x = (i % GCOLS) * CW,
        y = Math.floor(i / GCOLS) * CH;
      ctx.save();
      ctx.beginPath();
      ctx.rect(x + 2, y + 2, CW - 4, CH - 4);
      ctx.clip();
      let drewPic = false;
      if (i >= TRADE.length) {
        // washed-out picture ad from the textures module's billboard artwork
        try {
          const t =
            !G.isStub("tex") && G.tex.billboard
              ? G.tex.billboard(
                  PIC_BRANDS[(i - TRADE.length) % PIC_BRANDS.length],
                  1,
                )
              : null;
          const img = t && (t.image || (t.source && t.source.data));
          if (img && img.width) {
            ctx.globalAlpha = 0.85;
            ctx.drawImage(img, x, y, CW, CH);
            drewPic = true;
          }
        } catch (e) {
          drewPic = false;
        }
      }
      if (!drewPic) {
        const tr = TRADE[i % TRADE.length];
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = tr[2];
        ctx.fillRect(x + 8, y + 8, CW - 16, CH - 16);
        ctx.strokeStyle = tr[3];
        ctx.lineWidth = 8;
        ctx.strokeRect(x + 22, y + 22, CW - 44, CH - 44);
        ctx.fillStyle = tr[3];
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "bold 92px Georgia, serif";
        ctx.fillText(tr[0], x + CW / 2, y + CH * 0.42, CW - 70);
        ctx.font = "bold 38px Arial, sans-serif";
        ctx.fillText(tr[1], x + CW / 2, y + CH * 0.76, CW - 90);
      }
      // weathering: paint eaten along the brick courses, flaked patches, bleaching
      ctx.globalCompositeOperation = "destination-out";
      for (let yy = 0; yy < CH; yy += 7) {
        ctx.globalAlpha = 0.22 + r() * 0.2;
        ctx.fillRect(x, y + yy, CW, 2);
      }
      for (let k = 0; k < 90; k++) {
        ctx.globalAlpha = 0.5 + r() * 0.5;
        const w = 6 + r() * 60,
          h = 4 + r() * 26;
        ctx.fillRect(x + r() * CW, y + r() * CH, w, h);
      }
      const g = ctx.createLinearGradient(x, y, x, y + CH);
      g.addColorStop(0, "rgba(0,0,0,0.25)");
      g.addColorStop(1, "rgba(0,0,0,0.6)");
      ctx.globalAlpha = 1;
      ctx.fillStyle = g;
      ctx.fillRect(x, y, CW, CH);
      ctx.globalCompositeOperation = "source-over";
      ctx.restore();
    }
    const t = M.finishTex(new THREE.CanvasTexture(cv));
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    return { texture: t, transparent: true, roughness: 0.95 };
  });

  /** Painted sign on a wall line a→b (outward normal n) at t (m along a→b), centre height yc. */
  function ghostSign(w, t, yc, sw, cell, c) {
    const len = Math.hypot(w.bx - w.ax, w.bz - w.az),
      ux = (w.bx - w.ax) / len,
      uz = (w.bz - w.az) / len;
    const o = 0.035,
      sh = sw / 2;
    const P = (tt, y) => [
      w.ax + ux * tt + w.nx * o,
      y,
      w.az + uz * tt + w.nz * o,
    ];
    const uv = M.cellUV(cell, GCOLS, GROWS);
    // a→b runs right-to-left seen from outside → u runs from the (t+sw/2) end
    M.quad(
      M.buf("my/ghostads", w.ax + ux * t, w.az + uz * t, "main"),
      P(t + sw / 2, yc - sh / 2),
      P(t - sw / 2, yc - sh / 2),
      P(t - sw / 2, yc + sh / 2),
      P(t + sw / 2, yc + sh / 2),
      [w.nx, 0, w.nz],
      [uv[0], uv[1], uv[2], uv[1], uv[2], uv[3], uv[0], uv[3]],
      c,
      c,
    );
  }
  /** Downspout with leader head, straps and shoe; plus a leak streak under the head. */
  function downspout(w, t, r) {
    const len = Math.hypot(w.bx - w.ax, w.bz - w.az),
      ux = (w.bx - w.ax) / len,
      uz = (w.bz - w.az) / len;
    const x = w.ax + ux * t + w.nx * 0.14,
      z = w.az + uz * t + w.nz * 0.14;
    const b = M.buf(r() < 0.6 ? "rust" : "metal_painted", x, z, "detail");
    const c = r.pick([
      [0.45, 0.38, 0.32],
      [0.3, 0.32, 0.3],
      [0.5, 0.42, 0.36],
    ]);
    const top = w.y1 - 0.3,
      bot = Math.max(w.y0, 0.15);
    const broken = r() < 0.25 ? r.range(bot + 2, top - 3) : null;
    M.pipe(b, x, broken ? broken : bot + 0.3, z, x, top - 0.5, z, 0.075, 5, {
      c,
    });
    if (!broken)
      M.pipe(
        b,
        x,
        bot + 0.3,
        z,
        x + w.nx * 0.35,
        bot + 0.05,
        z + w.nz * 0.35,
        0.075,
        6,
        { c },
      ); // shoe
    else {
      M.pipe(
        b,
        x + w.nx * 0.2,
        bot + 0.1,
        z + w.nz * 0.2,
        x + w.nx * 0.2 + ux * 1.2,
        bot + 0.15,
        z + w.nz * 0.2 + uz * 1.2,
        0.075,
        6,
        { c },
      );
    } // the lower length fell off
    M.box(b, x - 0.2, top - 0.6, z - 0.2, x + 0.2, top - 0.2, z + 0.2, {
      s: 1,
      c: M.mulc(c, 0.9),
    }); // leader head
    for (let y = bot + 1.5; y < top - 1; y += 4.8)
      M.box(b, x - 0.1, y, z - 0.1, x + 0.1, y + 0.05, z + 0.1, {
        s: 1,
        c: M.mulc(c, 0.7),
        skip: 4 + 8,
      });
    if (M.grimeOverlay && M.GR)
      M.grimeOverlay(
        w.ax,
        w.az,
        w.bx,
        w.bz,
        w.nx,
        w.nz,
        Math.max(0, t - 0.8),
        Math.min(len, t + 0.8),
        Math.max(w.y0, top - r.range(8, 16)),
        top - 0.3,
        r() < 0.5 ? M.GR.RUST : M.GR.LEAK,
        0.05,
      );
  }
  /** Row of iron tie-rod anchor plates (S-irons / stars) along a floor line. */
  function anchors(w, y, r) {
    const len = Math.hypot(w.bx - w.ax, w.bz - w.az),
      ux = (w.bx - w.ax) / len,
      uz = (w.bz - w.az) / len;
    const b = M.buf(
      "metal_painted",
      (w.ax + w.bx) / 2,
      (w.az + w.bz) / 2,
      "detail",
    );
    const star = r() < 0.5;
    for (let t = r.range(1.2, 2.5); t < len - 1; t += r.range(3.2, 4.2)) {
      const x = w.ax + ux * t + w.nx * 0.03,
        z = w.az + uz * t + w.nz * 0.03;
      const yaw = Math.atan2(ux, uz);
      M.obox(b, x, y, z, 0.05, star ? 0.5 : 0.6, star ? 0.14 : 0.1, yaw, {
        s: 1,
        c: [0.2, 0.18, 0.16],
        roll: star ? 0 : 0.4,
        skip: 2,
      });
    }
  }

  M.buildWallDressing = function () {
    const r = M.rng("blankwalls");
    let signs = 0,
      pipes = 0,
      rows = 0;
    const used = [];
    for (const w of M.wallLog || []) {
      if (w.f !== "b") continue;
      const len = Math.hypot(w.bx - w.ax, w.bz - w.az),
        H = w.y1 - w.y0;
      if (len < 6 || H < 6) continue;
      // downspouts & conduit
      const np = len > 20 ? 2 : 1;
      for (let i = 0; i < np; i++)
        if (r() < 0.75) {
          downspout(w, r.range(0.8, len - 0.8), r);
          pipes++;
        }
      // tie-rod anchors at two or three floor lines
      if (r() < 0.45) {
        let k = 0;
        for (
          let y = w.y0 + 3.4 * r.int(1, 2) + r.range(0, 0.3);
          y < w.y1 - 2 && k < 2;
          y += 3.4 * r.int(2, 4), k++
        ) {
          anchors(w, y, r);
          rows++;
        }
      }
      // ghost sign on tall walls (not too many, spread out; skip walls already carrying a painted billboard)
      if (H > 11 && len > 9 && signs < 110 && r() < 0.5) {
        const mx = (w.ax + w.bx) / 2,
          mz = (w.az + w.bz) / 2;
        if (used.some((u) => Math.hypot(u[0] - mx, u[1] - mz) < 45)) continue;
        if (
          (M.billboards || []).some(
            (bb) =>
              Math.hypot(bb.x - mx, bb.z - mz) < 14 &&
              Math.abs(bb.nx * w.nx + bb.nz * w.nz) > 0.9,
          )
        )
          continue;
        const sw = Math.min(len - 2, r.range(8, 15)),
          sh = sw / 2;
        const yc =
          w.y1 - sh / 2 - r.range(1.5, Math.max(1.6, Math.min(8, H - sh - 2)));
        if (yc - sh / 2 < w.y0 + 3) continue;
        const cell = r.int(0, GCOLS * GROWS - 1);
        ghostSign(
          w,
          r.range(sw / 2 + 0.5, len - sw / 2 - 0.5),
          yc,
          sw,
          cell,
          M.mulc([1, 0.96, 0.9], r.range(0.62, 0.9)),
        );
        used.push([mx, mz]);
        signs++;
      }
    }
    M.wallDressStats = { signs, pipes, anchorRows: rows };
    return M.wallDressStats;
  };
