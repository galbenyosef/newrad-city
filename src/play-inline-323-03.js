// play-inline-323 03 — ctx
// Lines 362-705 of readable/play-inline-323.pretty.js (statement-aligned).
  PF.heraldTex = function (mark, num) {
    return PF.canvasTex(
      "pch_herald_" + mark + num,
      512,
      256,
      (ctx, w, h) => {
        const r = PF.rng("herald" + mark + num);
        ctx.clearRect(0, 0, w, h);
        ctx.strokeStyle = "rgba(232,224,204,0.92)";
        ctx.fillStyle = "rgba(232,224,204,0.92)";
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.ellipse(w * 0.72, h * 0.45, w * 0.2, h * 0.3, 0, 0, TAU);
        ctx.stroke();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = 'bold 30px "Arial Black", Impact, sans-serif';
        ctx.fillText("NEW YORK", w * 0.72, h * 0.34);
        ctx.fillRect(w * 0.56, h * 0.44, w * 0.32, 5);
        ctx.font = 'bold 30px "Arial Black", Impact, sans-serif';
        ctx.fillText("CENTRAL", w * 0.72, h * 0.55);
        ctx.font = "bold 16px Arial, sans-serif";
        ctx.fillText("SYSTEM", w * 0.72, h * 0.67);
        ctx.textAlign = "left";
        ctx.font = "bold 38px Arial, sans-serif";
        ctx.fillText(mark + " " + num, w * 0.05, h * 0.3);
        ctx.font = "bold 18px Arial, sans-serif";
        ctx.fillText("CAPY 100000  LD LMT 131200", w * 0.05, h * 0.56);
        ctx.fillText("LT WT 56800   NEW 5-77", w * 0.05, h * 0.68);
        ctx.globalCompositeOperation = "destination-out";
        for (let i = 0; i < 500; i++) {
          ctx.fillStyle = "rgba(0,0,0," + (0.3 + r() * 0.7) + ")";
          ctx.beginPath();
          ctx.arc(r() * w, r() * h, 1 + r() * 6, 0, TAU);
          ctx.fill();
        }
        ctx.globalCompositeOperation = "source-over";
      },
      { clamp: true },
    );
  };

  /** Gig poster (Webster Hall shows). */
  PF.posterTex = function (key, title, sub, bg, fg) {
    return PF.canvasTex(
      "pch_poster_" + key,
      256,
      384,
      (ctx, w, h) => {
        const r = PF.rng("poster" + key);
        ctx.fillStyle = bg || "#1c2a4a";
        ctx.fillRect(0, 0, w, h);
        // sunburst
        ctx.save();
        ctx.translate(w / 2, h * 0.42);
        for (let i = 0; i < 18; i++) {
          ctx.rotate(TAU / 18);
          ctx.fillStyle =
            i % 2 ? "rgba(255,220,140,0.18)" : "rgba(255,255,255,0.05)";
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(-26, -260);
          ctx.lineTo(26, -260);
          ctx.fill();
        }
        ctx.restore();
        ctx.fillStyle = "#e8c048";
        ctx.beginPath();
        ctx.arc(w / 2, h * 0.42, 46, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "#1a1a1a";
        ctx.beginPath();
        ctx.arc(w / 2, h * 0.42, 30, 0, TAU);
        ctx.fill(); // record
        ctx.fillStyle = "#c83a2a";
        ctx.beginPath();
        ctx.arc(w / 2, h * 0.42, 9, 0, TAU);
        ctx.fill();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = fg || "#f0e0b8";
        ctx.font = "bold 20px Georgia, serif";
        ctx.fillText("WEBSTER HALL", w / 2, 30);
        ctx.font = "bold 13px Georgia, serif";
        ctx.fillText("119 EAST 11th STREET", w / 2, 52);
        let fs = 34;
        ctx.font = "bold " + fs + 'px Impact, "Arial Black", sans-serif';
        const lines = title.split("|");
        lines.forEach((t, i) => {
          let f = fs;
          ctx.font = "bold " + f + "px Impact, sans-serif";
          const mw = ctx.measureText(t).width;
          if (mw > w * 0.9) {
            f = Math.floor((f * w * 0.9) / mw);
            ctx.font = "bold " + f + "px Impact, sans-serif";
          }
          ctx.fillStyle = "#ffe07a";
          ctx.fillText(t, w / 2, h * 0.68 + i * 36);
        });
        ctx.fillStyle = fg || "#f0e0b8";
        ctx.font = "bold 14px Georgia, serif";
        ctx.fillText(sub || "DANCING NIGHTLY", w / 2, h * 0.9);
        // wear
        for (let i = 0; i < 60; i++) {
          ctx.fillStyle = "rgba(40,30,20," + r() * 0.25 + ")";
          ctx.beginPath();
          ctx.ellipse(
            r() * w,
            r() * h,
            4 + r() * 30,
            3 + r() * 20,
            r() * 3,
            0,
            TAU,
          );
          ctx.fill();
        }
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, w, 3);
        ctx.fillRect(0, h - 3, w, 3);
      },
      { clamp: true },
    );
  };

  /** Neon script lettering on transparent background (emissive, alpha-tested). */
  PF.neonTex = function (key, text, color, opts) {
    opts = opts || {};
    return PF.canvasTex(
      "pch_neon_" + key,
      opts.w || 1024,
      opts.h || 256,
      (ctx, w, h) => {
        ctx.clearRect(0, 0, w, h);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        let fs = opts.size || Math.floor(h * 0.7);
        const fam =
          opts.font || '"Futura", "Century Gothic", "Trebuchet MS", sans-serif';
        ctx.font = (opts.italic ? "italic " : "") + "bold " + fs + "px " + fam;
        const mw = ctx.measureText(text).width;
        if (mw > w * 0.94) {
          fs = Math.floor((fs * w * 0.94) / mw);
          ctx.font =
            (opts.italic ? "italic " : "") + "bold " + fs + "px " + fam;
        }
        ctx.lineJoin = "round";
        ctx.shadowColor = color;
        ctx.shadowBlur = fs * 0.25;
        ctx.strokeStyle = color;
        ctx.lineWidth = fs * 0.1;
        ctx.strokeText(text, w / 2, h / 2);
        ctx.shadowBlur = fs * 0.08;
        ctx.fillStyle = "#fff6ea";
        ctx.fillText(text, w / 2, h / 2);
      },
      { clamp: true },
    );
  };
  PF.neonKey = function (key, text, color, opts) {
    return PF.texMat("neon_" + key, PF.neonTex(key, text, color, opts), {
      transparent: true,
      emissive: 1.8,
      rough: 0.5,
      noShadow: true,
      side: THREE.DoubleSide,
    });
  };

  /** Chocolate Zeppelin carton print (for pallets of boxes): a little silver airship-shaped cake. */
  PF.cakeBoxTex = function () {
    return PF.canvasTex("pch_cakebox", 256, 256, (ctx, w, h) => {
      const r = PF.rng("cakebox");
      ctx.fillStyle = "#e4d6b4";
      ctx.fillRect(0, 0, w, h);
      // sky-blue band with the airship cake drifting across it
      ctx.fillStyle = "#2c4a78";
      ctx.fillRect(0, h * 0.06, w, h * 0.5);
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      for (const [cx, cy, rx] of [
        [w * 0.18, h * 0.16, 22],
        [w * 0.82, h * 0.13, 18],
      ]) {
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, rx * 0.4, 0, 0, TAU);
        ctx.fill();
      }
      const zx = w * 0.5,
        zy = h * 0.22;
      // tail fins
      ctx.fillStyle = "#9aa4ae";
      ctx.beginPath();
      ctx.moveTo(zx - 58, zy);
      ctx.lineTo(zx - 82, zy - 18);
      ctx.lineTo(zx - 74, zy);
      ctx.lineTo(zx - 82, zy + 18);
      ctx.closePath();
      ctx.fill();
      // silver envelope (foil-wrapped cake), with a chocolate seam
      const g = ctx.createLinearGradient(0, zy - 20, 0, zy + 20);
      g.addColorStop(0, "#f4f6f8");
      g.addColorStop(0.45, "#c2c8d0");
      g.addColorStop(1, "#7c848e");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(zx, zy, 66, 19, 0, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "#4a2a18";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(zx - 62, zy + 2);
      ctx.lineTo(zx + 62, zy + 2);
      ctx.stroke();
      ctx.strokeStyle = "rgba(80,88,96,0.6)";
      ctx.lineWidth = 1;
      for (let k = -2; k <= 2; k++) {
        ctx.beginPath();
        ctx.ellipse(zx + k * 22, zy, 3, 18 - Math.abs(k) * 2, 0, 0, TAU);
        ctx.stroke();
      }
      // gondola
      ctx.fillStyle = "#4a2a18";
      ctx.fillRect(zx - 12, zy + 18, 24, 7);
      ctx.fillStyle = "#fff4e0";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "italic bold 30px Georgia, serif";
      ctx.fillText("Chocolate", w / 2, h * 0.38);
      ctx.font = "bold 26px Georgia, serif";
      ctx.fillText("ZEPPELIN", w / 2, h * 0.49);
      ctx.fillStyle = "#4a2a18";
      ctx.font = "italic 13px Georgia, serif";
      ctx.fillText("Lighter than air. Sweeter than pie.", w / 2, h * 0.63);
      ctx.font = "bold 15px Arial, sans-serif";
      ctx.fillText("48 CT  —  KEEP DRY", w / 2, h * 0.73);
      ctx.fillText("NATIONAL BISCUIT CO.", w / 2, h * 0.82);
      ctx.fillText("THIS SIDE UP  ▲", w / 2, h * 0.92);
      for (let i = 0; i < 60; i++) {
        ctx.fillStyle = "rgba(90,60,30," + r() * 0.22 + ")";
        ctx.beginPath();
        ctx.ellipse(
          r() * w,
          r() * h,
          3 + r() * 24,
          3 + r() * 16,
          r() * 3,
          0,
          TAU,
        );
        ctx.fill();
      }
    });
  };
  PF.cakeBoxKey = function () {
    return PF.texMat("cakebox", PF.cakeBoxTex(), { rough: 0.9 });
  };

  /** Grass/wildflower card (transparent): dense blades of dry meadow grass, goldenrod and asters. */
  PF.grassCardTex = function (variant) {
    return PF.canvasTex(
      "pch_grasscard" + (variant || 0),
      256,
      128,
      (ctx, w, h) => {
        const r = PF.rng("grass" + (variant || 0));
        ctx.clearRect(0, 0, w, h);
        const cols = [
          "#7a7a44",
          "#8a8450",
          "#6a6a3a",
          "#9a9058",
          "#5a6234",
          "#a89a60",
          "#74803e",
        ];
        for (let i = 0; i < 90; i++) {
          const x0 = r() * w,
            hh = h * (0.35 + r() * 0.62),
            bend = (r() - 0.5) * 40;
          ctx.strokeStyle = cols[(r() * cols.length) | 0];
          ctx.lineWidth = 1.5 + r() * 2.5;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(x0, h);
          ctx.quadraticCurveTo(
            x0 + bend * 0.3,
            h - hh * 0.6,
            x0 + bend,
            h - hh,
          );
          ctx.stroke();
        }
        const flowers =
          variant === 1
            ? ["#d8b030", "#e0c040"]
            : variant === 2
              ? ["#c8b8e0", "#e8e0d0"]
              : ["#c8a030"];
        for (let i = 0; i < (variant ? 16 : 6); i++) {
          const x = 10 + r() * (w - 20),
            y = h * (0.1 + r() * 0.4);
          ctx.strokeStyle = "#6a6a3a";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(x, h);
          ctx.lineTo(x + (r() - 0.5) * 8, y);
          ctx.stroke();
          ctx.fillStyle = flowers[(r() * flowers.length) | 0];
          for (let k = 0; k < 6; k++) {
            ctx.beginPath();
            ctx.arc(
              x + (r() - 0.5) * 8,
              y + (r() - 0.5) * 10,
              2 + r() * 2.5,
              0,
              TAU,
            );
            ctx.fill();
          }
        }
      },
      { clamp: true },
    );
  };
  PF.grassCardKey = function (variant) {
    return PF.texMat(
      "grasscard" + (variant || 0),
      PF.grassCardTex(variant || 0),
      { transparent: true, rough: 1, noShadow: true, side: THREE.DoubleSide },
    );
  };

  // -------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------
  /** Realise glow requests queued by the kit (PF.glows) as sprites parented to `parent` (hide with the cell). */
  PF.flushGlows = function (parent) {
    for (const g of PF.glows.splice(0))
      PF.glow(g.pos, g.color, g.size, parent || null, {
        intensity: g.intensity || 1.2,
        flicker: g.flicker || 0,
      });
  };
  /** Exterior fire barrels queued by the kit → real fire FX at initDone. */
