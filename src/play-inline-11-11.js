// play-inline-11 11 — ctx
// Lines 3158-3474 of readable/play-inline-11.pretty.js (statement-aligned).
  def("cryo_suit", {
    w: 256,
    meters: 0.5,
    normal: 1,
    rough: 0.85,
    desc: "Long Winter cryo suit: grey-white padded nylon, diamond quilting (collar ring: cryo_suit_orange material)",
    gen(ctx, w, h, r, hc) {
      const n = X.fbm(w, h, { scale: 4, octaves: 4, seed: 461 });
      const cell = w / 8;
      X.fillPixels(ctx, w, h, (i, x, y) => {
        const u = ((x + y) % cell) / cell,
          v = ((x - y + w * 4) % cell) / cell;
        const seam = Math.min(u, 1 - u, v, 1 - v) < 0.06 ? 0.82 : 1,
          puff = 0.94 + Math.sin(u * Math.PI) * Math.sin(v * Math.PI) * 0.08;
        const k = seam * puff * (0.9 + n[i] * 0.14);
        return [206 * k, 210 * k, 212 * k];
      });
      heightFrom(hc, w, h, (i) => {
        const x = i % w,
          y = (i / w) | 0,
          u = ((x + y) % cell) / cell,
          v = ((x - y + w * 4) % cell) / cell;
        return 0.3 + Math.sin(u * Math.PI) * Math.sin(v * Math.PI) * 0.6;
      });
      X.blotches(ctx, w, h, r, { count: 6, color: "#4a4a44", alpha: 0.18 });
    },
  });
  def("leather", {
    w: 256,
    meters: 0.5,
    normal: 1.5,
    rough: 0.75,
    desc: "worn brown leather (raider/leather armor)",
    gen(ctx, w, h, r, hc) {
      const wn = X.worley(w, h, { cells: 30, seed: 471 });
      const n = X.fbm(w, h, { scale: 4, octaves: 5, seed: 472 });
      X.fillPixels(ctx, w, h, (i) => {
        const e = wn.f2[i] - wn.f1[i];
        const k = (0.7 + n[i] * 0.4) * (e < 0.06 ? 0.75 : 1);
        return [98 * k, 66 * k, 40 * k];
      });
      heightFrom(hc, w, h, (i) => Math.min(1, (wn.f2[i] - wn.f1[i]) * 4));
      X.blotches(ctx, w, h, r, { count: 8, color: "#c0a070", alpha: 0.18 });
      X.blotches(ctx, w, h, r, { count: 6, color: "#1a1008", alpha: 0.3 });
    },
  });
  def("military", {
    w: 256,
    meters: 1,
    normal: 0,
    rough: 0.7,
    metal: 0.2,
    desc: "olive drab painted surface (ammo boxes, combat armor)",
    gen: paintedMetal("#4f5536", 0.3, 481),
  });
  def("rubber", {
    w: 256,
    meters: 0.5,
    normal: 0,
    rough: 0.95,
    desc: "cracked black rubber (tyres)",
    gen(ctx, w, h, r) {
      noiseBase(
        ctx,
        w,
        h,
        r,
        [
          [0, "#141414"],
          [1, "#2c2a28"],
        ],
        { scale: 4, seed: 491, grain: 10 },
      );
      X.cracks(ctx, w, h, r, {
        count: 10,
        width: 0.8,
        seg: 4,
        steps: 20,
        color: "rgba(90,85,78,0.5)",
      });
      for (let x = 0; x < w; x += 16) {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(x, 0, 6, h);
      } // tread
    },
  });
  def("cardboard", {
    w: 256,
    meters: 0.8,
    normal: 0,
    rough: 0.95,
    desc: "soggy corrugated cardboard",
    gen(ctx, w, h, r) {
      noiseBase(
        ctx,
        w,
        h,
        r,
        [
          [0, "#7a6040"],
          [1, "#a88a5e"],
        ],
        { scale: 3, seed: 501, grain: 10 },
      );
      for (let x = 0; x < w; x += 5) {
        ctx.fillStyle = "rgba(60,40,20,0.12)";
        ctx.fillRect(x, 0, 2, h);
      }
      X.blotches(ctx, w, h, r, { count: 6, color: "#3a2810", alpha: 0.35 });
      X.text(ctx, "THIS SIDE UP", w / 2, h * 0.3, {
        font: "stencil",
        size: 20,
        color: "rgba(40,30,20,0.5)",
      });
    },
  });
  def("paper", {
    w: 256,
    h: 256,
    meters: 0.5,
    normal: 0,
    rough: 1,
    desc: "yellowed newspaper page (litter)",
    gen(ctx, w, h, r) {
      noiseBase(
        ctx,
        w,
        h,
        r,
        [
          [0, "#b8ac88"],
          [1, "#d6cca8"],
        ],
        { scale: 3, seed: 511, grain: 8 },
      );
      X.text(ctx, "THE NEW YORK HERALD", w / 2, 18, {
        font: "didone",
        size: 20,
        color: "#2a2620",
        maxW: w - 16,
      });
      X.text(ctx, "PARIS RECALLS ENVOY!", w / 2, 46, {
        font: "impact",
        size: 24,
        color: "#1e1c18",
        maxW: w - 16,
      });
      ctx.fillStyle = "rgba(40,36,30,0.55)";
      for (let c = 0; c < 4; c++)
        for (let y = 66; y < h - 10; y += 5)
          if (r() > 0.06)
            ctx.fillRect(8 + c * 61, y, 52 * (0.6 + r() * 0.4), 2);
      ctx.fillStyle = "rgba(40,36,30,0.35)";
      ctx.fillRect(8 + 61, 80, 113, 70);
      X.blotches(ctx, w, h, r, { count: 7, color: "#6a5028", alpha: 0.3 });
    },
  });
  def("bone", {
    w: 256,
    meters: 0.5,
    normal: 0,
    rough: 0.8,
    desc: "aged bone (skeletons)",
    gen(ctx, w, h, r) {
      noiseBase(
        ctx,
        w,
        h,
        r,
        [
          [0, "#8a7a5a"],
          [0.5, "#b8a880"],
          [1, "#d4c8a4"],
        ],
        { scale: 4, seed: 521, grain: 10 },
      );
      X.blotches(ctx, w, h, r, { count: 8, color: "#4a3a20", alpha: 0.3 });
      X.cracks(ctx, w, h, r, {
        count: 4,
        width: 0.7,
        seg: 4,
        steps: 20,
        color: "rgba(60,50,30,0.6)",
      });
    },
  });
  def("skin_base", {
    w: 256,
    meters: 0.4,
    normal: 0,
    rough: 0.7,
    desc: "neutral light skin (tint via material colour)",
    gen(ctx, w, h, r) {
      noiseBase(
        ctx,
        w,
        h,
        r,
        [
          [0, "#caa48a"],
          [0.5, "#dcb59a"],
          [1, "#e6c3aa"],
        ],
        { scale: 4, seed: 531, grain: 6 },
      );
      X.blotches(ctx, w, h, r, { count: 14, color: "#c07a6a", alpha: 0.12 });
      X.speckle(ctx, w, h, r, {
        count: 1500,
        colors: ["#a8806a"],
        min: 0.3,
        max: 0.8,
        alpha: 0.35,
      });
    },
  });
  def("skin_brute", {
    w: 256,
    meters: 0.5,
    normal: 3,
    rough: 0.7,
    desc: "Brute hide: grey-violet, thick and lumpy, pale bone plates breaking through",
    gen(ctx, w, h, r, hc) {
      const wn = X.worley(w, h, { cells: 10, seed: 551 }),
        n = X.fbm(w, h, { scale: 4, octaves: 5, seed: 552 });
      const ramp = X.ramp([
        [0, "#3a3242"],
        [0.4, "#5a4e62"],
        [0.7, "#766a7c"],
        [1, "#948a98"],
      ]);
      X.fillPixels(ctx, w, h, (i) => {
        const lump = Math.max(0, 1 - wn.f1[i] * 1.6);
        if (wn.id[i] > 0.86 && wn.f1[i] < 0.35) {
          const k = 0.85 + n[i] * 0.2;
          return [214 * k, 204 * k, 182 * k];
        } // bone plate
        const c = ramp(n[i] * 0.6 + lump * 0.4);
        return [c[0], c[1], c[2]];
      });
      heightFrom(hc, w, h, (i) =>
        wn.id[i] > 0.86 && wn.f1[i] < 0.35
          ? 0.95
          : Math.max(0, 1 - wn.f1[i] * 1.6) * 0.7 + n[i] * 0.3,
      );
      ctx.strokeStyle = "rgba(40,30,46,0.5)";
      ctx.lineWidth = 1.2;
      for (let k = 0; k < 20; k++) {
        let x = r() * w,
          y = r() * h;
        ctx.beginPath();
        ctx.moveTo(x, y);
        for (let q = 0; q < 8; q++) {
          x += (r() - 0.5) * 16;
          y += r() * 10;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      X.blotches(ctx, w, h, r, { count: 8, color: "#3a2a20", alpha: 0.25 });
    },
  });
  def("chainlink", {
    w: 256,
    meters: 1,
    normal: 0,
    alpha: true,
    alphaTest: 0.35,
    rough: 0.5,
    metal: 0.8,
    side: "double",
    desc: "RGBA chain-link fence mesh",
    gen(ctx, w, h, r) {
      ctx.clearRect(0, 0, w, h);
      const s = w / 8;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      for (let j = -1; j <= 8; j++)
        for (let i = -1; i <= 8; i++) {
          const x = i * s,
            y = j * s;
          const rust = r() < 0.3;
          ctx.strokeStyle = rust ? "#6a4020" : "#9a9c98";
          ctx.beginPath();
          ctx.moveTo(x, y + s / 2);
          ctx.lineTo(x + s / 2, y);
          ctx.lineTo(x + s, y + s / 2);
          ctx.lineTo(x + s / 2, y + s);
          ctx.closePath();
          ctx.stroke();
        }
      // cut hole
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(w * 0.7, h * 0.7, 18, 0, TAU);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
    },
  });
  def("shadow_blob", {
    w: 128,
    meters: 1,
    normal: 0,
    repeat: false,
    desc: "soft radial blob (use as alphaMap for contact shadows)",
    gen(ctx, w, h) {
      const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      g.addColorStop(0, "#fff");
      g.addColorStop(0.5, "#999");
      g.addColorStop(1, "#000");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    },
  });

  // ==================================================================
  // CRYO FACILITY (Project Long Winter)
  // ==================================================================
