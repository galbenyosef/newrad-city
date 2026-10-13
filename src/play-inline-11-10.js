// play-inline-11 10 — ctx
// Lines 2825-3157 of readable/play-inline-11.pretty.js (statement-aligned).
  def("rubble", {
    meters: 4,
    normal: 2.8,
    rough: 0.95,
    desc: "broken concrete, brick & plaster debris",
    gen(ctx, w, h, r, hc) {
      const wn = X.worley(w, h, { cells: 14, seed: 401 }),
        wn2 = X.worley(w, h, { cells: 34, seed: 402 });
      const n = X.fbm(w, h, { scale: 8, octaves: 4, seed: 403 });
      const pal = [
        X.hex("#8a867c"),
        X.hex("#9c978b"),
        X.hex("#6e6a62"),
        X.hex("#8a4a36"),
        X.hex("#a89c80"),
        X.hex("#5a5650"),
      ];
      const hv = new Float32Array(w * h);
      X.fillPixels(ctx, w, h, (i) => {
        const big = wn.f1[i] < 0.42 && wn.id[i] > 0.25;
        const W2 = big ? wn : wn2;
        const id = W2.id[i],
          c = pal[(id * pal.length) | 0];
        const dome = Math.max(0, 1 - W2.f1[i] * (big ? 2.4 : 1.6));
        const edge = W2.f2[i] - W2.f1[i];
        let k = 0.55 + dome * 0.5 + (n[i] - 0.5) * 0.25;
        if (edge < 0.04) k *= 0.35 + edge * 12;
        hv[i] = (big ? 0.35 : 0.1) + dome * 0.5;
        const g = (r() - 0.5) * 16;
        return [c[0] * k + g, c[1] * k + g, c[2] * k + g];
      });
      heightFrom(hc, w, h, (i) => hv[i]);
      // rebar bits & dust
      ctx.lineCap = "round";
      for (let k = 0; k < 16; k++) {
        const x = r() * w,
          y = r() * h,
          a = r() * TAU,
          l = 15 + r() * 40;
        ctx.strokeStyle = "#3a200e";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(
          x + Math.cos(a) * l * 0.5 + 6,
          y + Math.sin(a) * l * 0.5,
          x + Math.cos(a) * l,
          y + Math.sin(a) * l,
        );
        ctx.stroke();
        ctx.strokeStyle = "rgba(180,110,60,0.5)";
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
      X.blotches(ctx, w, h, r, { count: 10, color: "#b0a890", alpha: 0.25 }); // pulverised dust
      X.speckle(ctx, w, h, r, {
        count: 3000,
        colors: ["#c8c0a8", "#3a3228"],
        min: 0.3,
        max: 1.4,
        alpha: 0.6,
      });
    },
  });

  // ==================================================================
  // GLASS, WATER, SKY
  // ==================================================================
  def("glass_dirty", {
    w: 256,
    meters: 2,
    normal: 0,
    rough: 0.1,
    metal: 0.5,
    desc: "grimy window glass (use with transparent material)",
    gen(ctx, w, h, r) {
      noiseBase(
        ctx,
        w,
        h,
        r,
        [
          [0, "#7c8c88"],
          [1, "#a8b4ae"],
        ],
        { scale: 3, seed: 411, grain: 6 },
      );
      X.blotches(ctx, w, h, r, { count: 12, color: "#6a5a40", alpha: 0.35 });
      X.streaks(ctx, w, h, r, {
        count: 30,
        color: "#5a4a30",
        alpha: 0.3,
        maxW: 10,
      });
      // spider crack
      const cx = w * 0.6,
        cy = h * 0.4;
      ctx.strokeStyle = "rgba(235,240,235,0.55)";
      ctx.lineWidth = 0.8;
      for (let k = 0; k < 9; k++) {
        const a = (k / 9) * TAU + r() * 0.3;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        let x = cx,
          y = cy;
        for (let s = 0; s < 6; s++) {
          x += Math.cos(a + (r() - 0.5) * 0.5) * 10;
          y += Math.sin(a + (r() - 0.5) * 0.5) * 10;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      for (let rr = 8; rr < 40; rr += 11) {
        ctx.beginPath();
        ctx.arc(cx, cy, rr, 0, TAU);
        ctx.stroke();
      }
    },
  });
  def("water", {
    meters: 12,
    normal: 1.2,
    rough: 0.1,
    desc: "murky irradiated river water (colour + ripple normal)",
    gen(ctx, w, h, r, hc) {
      const n = X.fbm(w, h, { scale: 3, octaves: 5, seed: 421 }),
        rip = X.fbm(w, h, { scale: 12, octaves: 4, seed: 422 });
      const ramp = X.ramp([
        [0, "#1c2a1e"],
        [0.5, "#2e4030"],
        [0.8, "#3e5236"],
        [1, "#556a44"],
      ]);
      X.fillPixels(ctx, w, h, (i) => {
        const c = ramp(n[i]),
          s = Math.pow(Math.max(0, Math.sin(rip[i] * 30)), 12) * 30;
        return [c[0] + s, c[1] + s * 1.1, c[2] + s * 0.8];
      });
      heightFrom(
        hc,
        w,
        h,
        (i) => 0.5 + Math.sin(rip[i] * 30) * 0.25 + (n[i] - 0.5) * 0.2,
      );
      X.blotches(ctx, w, h, r, { count: 8, color: "#6a7a40", alpha: 0.15 }); // algae scum
    },
  });
  def("sky_clouds", {
    w: 1024,
    h: 512,
    meters: 1000,
    normal: 0,
    alpha: true,
    desc: "RGBA wispy cloud layer, tiles horizontally (for sky domes)",
    gen(ctx, w, h, r) {
      const n = X.fbm(w, h, {
          scale: 6,
          sy: 3,
          octaves: 7,
          seed: 431,
          persist: 0.55,
        }),
        n2 = X.fbm(w, h, { scale: 24, sy: 6, octaves: 3, seed: 432 });
      X.fillPixels(ctx, w, h, (i, x, y) => {
        const band = Math.sin((y / h) * Math.PI); // fade at top/bottom rows
        const v = n[i] * 0.8 + n2[i] * 0.2;
        const a = Math.max(0, Math.min(1, (v - 0.45) * 3.2)) * band;
        const lum = 200 + (v - 0.5) * 90 - (1 - a) * 40;
        return [lum, lum * 0.99, lum * 0.93, a * 255];
      });
    },
  });
  // CRT screen glow (text lines, scanlines). screen_green = generic green-tint CRT; screen_amber = teletype terminals.
  function screenGen(c0, c1, ink) {
    return function (ctx, w, h, r) {
      const g = ctx.createRadialGradient(
        w / 2,
        h / 2,
        10,
        w / 2,
        h / 2,
        w * 0.7,
      );
      g.addColorStop(0, c0);
      g.addColorStop(1, c1);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = ink;
      ctx.font = '11px "Share Tech Mono","Courier New",monospace';
      const lines = [
        "HALCYON TELEPRINTER  MODEL 9",
        "TELETYPE NETWORK LINK",
        "",
        "NODE C9 / MUNICIPAL",
        "",
        "> LOGIN",
        "> PASSCODE: ********",
        "> STATUS",
        "CORE MEMORY 64K WORDS",
        "TAPE UNITS 4 .... READY",
        "LINE PRINTER .... ONLINE",
        "",
        "AWAITING INPUT",
        "",
        "> _",
      ];
      lines.forEach((l, i) => ctx.fillText(l, 10, 16 + i * 10));
      for (let y = 0; y < h; y += 2) {
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.fillRect(0, y, w, 1);
      }
    };
  }
  def("screen_green", {
    w: 256,
    h: 192,
    meters: 1,
    normal: 0,
    repeat: false,
    desc: "green-tint CRT screen glow (text lines, scanlines)",
    gen: screenGen("#0f3a1a", "#021006", "#6aff8a"),
  });
  def("screen_amber", {
    w: 256,
    h: 192,
    meters: 1,
    normal: 0,
    repeat: false,
    desc: "amber teletype-terminal screen glow (text lines, scanlines)",
    gen: screenGen("#3a2208", "#100602", "#ffb347"),
  });
  def("window_lit", {
    w: 128,
    h: 192,
    meters: 1.5,
    normal: 0,
    repeat: false,
    desc: "single warm-lit window (blinds, silhouette) — also emissive map",
    gen(ctx, w, h, r) {
      const g = ctx.createRadialGradient(
        w * 0.5,
        h * 0.35,
        5,
        w * 0.5,
        h * 0.4,
        h * 0.7,
      );
      g.addColorStop(0, "#ffe2a8");
      g.addColorStop(0.5, "#d8904a");
      g.addColorStop(1, "#5a2a10");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      // venetian blinds half down, a few bent slats
      const bl = h * (0.3 + r() * 0.2);
      for (let y = 0; y < bl; y += 6) {
        ctx.fillStyle = "rgba(60,40,20,0.55)";
        ctx.fillRect(0, y, w, 3.5);
        if (r() < 0.15) {
          ctx.fillStyle = "rgba(255,220,160,0.6)";
          ctx.fillRect(r() * w, y, 20, 3.5);
        }
      }
      // silhouette: lamp shade + chair back
      ctx.fillStyle = "rgba(40,20,10,0.75)";
      ctx.beginPath();
      ctx.moveTo(w * 0.15, h * 0.62);
      ctx.lineTo(w * 0.35, h * 0.62);
      ctx.lineTo(w * 0.3, h * 0.5);
      ctx.lineTo(w * 0.2, h * 0.5);
      ctx.fill();
      ctx.fillRect(w * 0.24, h * 0.62, 3, h * 0.3);
      X.rrect(ctx, w * 0.55, h * 0.6, w * 0.35, h * 0.4, 12);
      ctx.fill();
      // muntins/frame
      ctx.fillStyle = "#2a2018";
      ctx.fillRect(0, 0, w, 6);
      ctx.fillRect(0, h - 6, w, 6);
      ctx.fillRect(0, 0, 6, h);
      ctx.fillRect(w - 6, 0, 6, h);
      ctx.fillRect(0, h / 2 - 3, w, 6);
      X.blotches(ctx, w, h, r, { count: 6, color: "#3a2a10", alpha: 0.3 });
    },
  });

  // ==================================================================
  // FABRIC / ORGANIC
  // ==================================================================
  function weave(ctx, w, h, r, base, cell, seed) {
    const n = X.fbm(w, h, { scale: 4, octaves: 4, seed });
    const c = X.hex(base);
    X.fillPixels(ctx, w, h, (i, x, y) => {
      const a = (((x / cell) | 0) + ((y / cell) | 0)) % 2;
      const t = a
        ? Math.sin(((x % cell) / cell) * Math.PI)
        : Math.sin(((y % cell) / cell) * Math.PI);
      const k = 0.72 + t * 0.25 + (n[i] - 0.5) * 0.2 + (r() - 0.5) * 0.06;
      return [c[0] * k, c[1] * k, c[2] * k];
    });
  }
  X.weave = weave;
  def("fabric", {
    w: 256,
    meters: 0.5,
    normal: 0,
    rough: 1,
    desc: "woven canvas/cloth, neutral (tint via material colour)",
    gen(ctx, w, h, r) {
      weave(ctx, w, h, r, "#b0a68c", 4, 441);
      X.blotches(ctx, w, h, r, { count: 8, color: "#4a3a24", alpha: 0.25 });
    },
  });
  def("burlap", {
    w: 256,
    meters: 0.6,
    normal: 2,
    rough: 1,
    desc: "sandbag burlap",
    gen(ctx, w, h, r, hc) {
      weave(ctx, w, h, r, "#8a7650", 6, 451);
      heightFrom(hc, w, h, (i) => {
        const x = i % w,
          y = (i / w) | 0;
        return (
          0.5 +
          0.4 *
            ((((x / 6) | 0) + ((y / 6) | 0)) % 2
              ? Math.sin(((x % 6) / 6) * Math.PI)
              : Math.sin(((y % 6) / 6) * Math.PI))
        );
      });
      X.blotches(ctx, w, h, r, { count: 10, color: "#3a2a14", alpha: 0.3 });
    },
  });
