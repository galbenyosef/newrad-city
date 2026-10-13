// play-inline-19 03 — ctx
// Lines 391-1003 of readable/play-inline-19.pretty.js (statement-aligned).
  const STYLES = {
    street(ctx, w, h, text, o, r) {
      X.rrect(ctx, 2, 2, w - 4, h - 4, h * 0.12);
      ctx.fillStyle = "#1f5b3c";
      ctx.fill();
      ctx.strokeStyle = "#e8ecde";
      ctx.lineWidth = h * 0.05;
      X.rrect(ctx, h * 0.08, h * 0.08, w - h * 0.16, h - h * 0.16, h * 0.08);
      ctx.stroke();
      const hasSub = !!o.sub;
      if (hasSub)
        X.text(ctx, o.sub, h * 0.42, h * 0.54, {
          font: "helv",
          size: h * 0.42,
          color: "#e8ecde",
        });
      X.text(ctx, text, w / 2 + (hasSub ? h * 0.2 : 0), h * 0.54, {
        font: "helv",
        size: h * 0.58,
        color: "#f0f2ea",
        maxW: w - h * (hasSub ? 1.2 : 0.6),
        weight: "bold",
      });
      ageSign(ctx, w, h, r, o.worn === undefined ? 0.6 : o.worn, true);
    },
    subway(ctx, w, h, text, o, r) {
      ctx.fillStyle = "#141414";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#e8e8e0";
      ctx.fillRect(0, h * 0.06, w, h * 0.035);
      const routes = o.routes || [];
      X.text(ctx, text, h * 0.3, h * 0.52, {
        font: "helv",
        size: h * 0.46,
        color: "#f4f4ec",
        align: "left",
        maxW: w - h * (0.5 + routes.length * 0.75),
      });
      routes.forEach((rt, i) => {
        const cx = w - h * 0.45 - (routes.length - 1 - i) * h * 0.72,
          cy = h * 0.54;
        ctx.beginPath();
        ctx.arc(cx, cy, h * 0.3, 0, TAU);
        ctx.fillStyle = ROUTE_COLORS[rt] || "#7a7a7a";
        ctx.fill();
        X.text(ctx, String(rt), cx, cy + h * 0.02, {
          font: "helv",
          size: h * 0.38,
          color: rt === "N" || rt === "Q" || rt === "R" ? "#111" : "#fff",
        });
      });
      ageSign(ctx, w, h, r, o.worn === undefined ? 0.7 : o.worn, false);
    },
    shop(ctx, w, h, text, o, r) {
      // bold, high-contrast painted boards (cream on oxblood / teal / bottle green, gilt on black, oxblood on cream) with a
      // dark keyline + drop shadow and lettering at ~60 % of the board height, so names read at 15–20 m through the grime
      const pal = [
        ["#6e1a16", "#f4e6c0"],
        ["#14504c", "#f2e2b4"],
        ["#1c3f24", "#f0e4c0"],
        ["#121210", "#e2b44c"],
        ["#ece2c6", "#7a1a14"],
        ["#1a2a4c", "#f0d070"],
        ["#3a1a2e", "#f4dca8"],
      ];
      const p = pal[X.seedOf(text) % pal.length];
      const bg = o.bg || p[0],
        fg = o.fg || p[1];
      const light = X.hex(bg).reduce((a, v) => a + v, 0) > 450;
      X.rrect(ctx, 0, 0, w, h, h * 0.08);
      ctx.fillStyle = bg;
      ctx.fill();
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "rgba(255,255,255,0.08)");
      g.addColorStop(0.5, "rgba(0,0,0,0)");
      g.addColorStop(1, "rgba(0,0,0,0.18)");
      ctx.fillStyle = g;
      ctx.fill();
      ctx.strokeStyle = X.css(fg, 0.85);
      ctx.lineWidth = h * 0.045;
      X.rrect(ctx, h * 0.09, h * 0.09, w - h * 0.18, h - h * 0.18, h * 0.05);
      ctx.stroke();
      const ink = light ? "#f4ecd8" : "#0c0a08";
      X.text(ctx, text, w / 2, h * (o.sub ? 0.43 : 0.53), {
        font: o.font || "didone",
        size: h * (o.sub ? 0.5 : 0.62),
        color: fg,
        maxW: w - h * 0.42,
        stroke: ink,
        strokeW: h * 0.035,
        shadow: ink,
        shadowA: light ? 0.35 : 0.7,
        shadowOff: h * 0.04,
      });
      if (o.sub)
        X.text(ctx, o.sub, w / 2, h * 0.78, {
          font: "condensed",
          size: h * 0.15,
          color: fg,
          spacing: 3,
          maxW: w - h * 0.5,
        });
      ageSign(ctx, w, h, r, o.worn === undefined ? 0.65 : o.worn, false);
    },
    wood(ctx, w, h, text, o, r) {
      // Scrap-wood settlement sign: 3–5 mismatched planks with gaps, nail heads and end-grain, and the lettering
      // brush-painted in thick house paint over a dark keyline (frontier-town style) so it reads at 20 m.
      // The paint follows the planks: it skips the gaps, is scraped thin along the grain and flakes off at the edges.
      const planks = Math.max(3, Math.round(h / 44));
      ctx.clearRect(0, 0, w, h);
      const P = [];
      for (let i = 0; i < planks; i++) {
        const y = (i * h) / planks,
          ph = h / planks;
        const rot = (r() - 0.5) * 0.035,
          x0 = r() * w * 0.025,
          x1 = w - r() * w * 0.025;
        P.push({ y, ph, rot });
        ctx.save();
        ctx.translate(w / 2, y + ph / 2);
        ctx.rotate(rot);
        const c = X.jitter(
          ["#6e5a42", "#7a6448", "#5e4c38", "#846a4a", "#6a5e50", "#8a7458"][
            (r() * 6) | 0
          ],
          r,
          0.12,
        );
        const g = ctx.createLinearGradient(0, -ph / 2, 0, ph / 2);
        g.addColorStop(0, X.css(X.shade(c, 0.12)));
        g.addColorStop(0.55, X.css(c));
        g.addColorStop(1, X.css(X.shade(c, -0.32)));
        ctx.fillStyle = g;
        ctx.fillRect(-w / 2 + x0, -ph / 2 + 2, x1 - x0, ph - 4);
        ctx.strokeStyle = "rgba(30,20,10,0.32)";
        ctx.lineWidth = 1;
        for (let k = 0; k < 7; k++) {
          const yy = (r() - 0.5) * ph * 0.85,
            a = (r() - 0.5) * 6;
          ctx.beginPath();
          ctx.moveTo(-w / 2, yy);
          ctx.bezierCurveTo(
            -w / 6,
            yy + a,
            w / 6,
            yy - a,
            w / 2,
            yy + (r() - 0.5) * 3,
          );
          ctx.stroke();
        }
        if (r() < 0.5) {
          const kx = (r() - 0.5) * w * 0.8;
          ctx.beginPath();
          ctx.ellipse(
            kx,
            (r() - 0.5) * ph * 0.4,
            ph * 0.08,
            ph * 0.05,
            0,
            0,
            TAU,
          );
          ctx.fillStyle = "rgba(40,26,14,0.55)";
          ctx.fill();
        } // knot
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.fillRect(-w / 2 + x0, ph / 2 - 3, x1 - x0, 2); // shadow gap under each plank
        for (const nx of [-w / 2 + x0 + ph * 0.25, x1 - w / 2 - ph * 0.25])
          for (const ny of [-ph * 0.22, ph * 0.22]) {
            ctx.beginPath();
            ctx.arc(nx, ny, Math.max(2, ph * 0.045), 0, TAU);
            ctx.fillStyle = "#26221e";
            ctx.fill();
            ctx.fillStyle = "rgba(110,50,20,0.35)";
            ctx.fillRect(nx - 1, ny, 2, ph * (0.1 + r() * 0.25)); // rust weep
          }
        ctx.restore();
      }
      // lettering on its own layer, then cut to the planks and scraped
      const L = X.canvas(w, h),
        lc = L.ctx;
      const PAINT = [
        ["#ece4d0", "#1a120a"],
        ["#f0d23c", "#1a120a"],
        ["#e8e0cc", "#6a140e"],
        ["#d8301e", "#f0e6d0"],
      ];
      const pc = o.fg
        ? [o.fg, o.ink || "#1a120a"]
        : PAINT[X.seedOf(text) % PAINT.length];
      const lines = String(text).split("\n");
      const sz = (h * (o.sub ? 0.5 : 0.64)) / Math.max(1, lines.length * 0.8);
      lines.forEach((ln, i) => {
        const y =
          h * (o.sub ? 0.4 : 0.52) + (i - (lines.length - 1) / 2) * sz * 0.95;
        X.text(lc, ln, w / 2, y, {
          font: o.font || "impact",
          size: sz,
          color: pc[0],
          maxW: w * 0.88,
          stroke: pc[1],
          strokeW: sz * 0.14,
          skew: (r() - 0.5) * 0.06,
        });
      });
      if (o.sub)
        X.text(lc, o.sub, w / 2, h * 0.82, {
          font: "marker",
          size: h * 0.15,
          color: pc[0],
          maxW: w * 0.85,
          stroke: pc[1],
          strokeW: h * 0.02,
        });
      lc.save();
      lc.globalCompositeOperation = "destination-out";
      for (const pl of P) lc.fillRect(0, pl.y - 2, w, 4); // paint breaks at the plank gaps
      for (let k = 0; k < w * 0.5; k++) {
        const x = r() * w,
          y = r() * h;
        lc.globalAlpha = 0.25 + r() * 0.6;
        lc.fillRect(x, y, 6 + r() * 60, 1 + r() * 1.5);
      } // scraped along the grain
      lc.globalAlpha = 1;
      for (let k = 0; k < 18; k++) {
        X.blobPath(lc, r() * w, r() * h, h * (0.01 + r() * 0.035), r, 7, 0.7);
        lc.fill();
      } // flaked-off chips
      lc.restore();
      ctx.globalAlpha = 0.95;
      ctx.drawImage(L.c, 0, 0);
      ctx.globalAlpha = 1;
      ageSign(ctx, w, h, r, 0.45, false);
    },
    metal(ctx, w, h, text, o, r) {
      const R = X.canvas(w, h);
      X.GEN.metal_painted.gen(R.ctx, w, h, r, X.canvas(w, h).ctx);
      ctx.drawImage(R.c, 0, 0);
      if (o.bg) {
        ctx.fillStyle = X.css(o.bg, 0.8);
        ctx.globalCompositeOperation = "multiply";
        ctx.fillRect(0, 0, w, h);
        ctx.globalCompositeOperation = "source-over";
      }
      X.text(ctx, text, w / 2, h * 0.52, {
        font: "stencil",
        size: h * 0.5,
        color: o.fg || "rgba(235,230,215,0.9)",
        maxW: w * 0.9,
      });
      for (const [x, y] of [
        [h * 0.12, h * 0.15],
        [w - h * 0.12, h * 0.15],
        [h * 0.12, h * 0.85],
        [w - h * 0.12, h * 0.85],
      ]) {
        ctx.fillStyle = "#3a3a36";
        ctx.beginPath();
        ctx.arc(x, y, h * 0.05, 0, TAU);
        ctx.fill();
      }
      ageSign(ctx, w, h, r, 0.7, true);
    },
    warning(ctx, w, h, text, o, r) {
      ctx.fillStyle = "#f0c020";
      ctx.fillRect(0, 0, w, h);
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, w, h);
      ctx.rect(h * 0.12, h * 0.12, w - h * 0.24, h - h * 0.24);
      ctx.clip("evenodd");
      ctx.fillStyle = "#1a1a1a";
      for (let x = -h; x < w + h; x += h * 0.24) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + h * 0.12, 0);
        ctx.lineTo(x + h * 0.12 - h, h);
        ctx.lineTo(x - h, h);
        ctx.fill();
      }
      ctx.restore();
      X.trefoil(ctx, h * 0.55, h / 2, h * 0.26, "#1a1a1a", null);
      X.text(ctx, text, (w + h * 0.9) / 2, h / 2, {
        font: "impact",
        size: h * 0.36,
        color: "#1a1a1a",
        maxW: w - h * 1.3,
      });
      ageSign(ctx, w, h, r, 0.7, true);
    },
    danger(ctx, w, h, text, o, r) {
      ctx.fillStyle = "#f4f0e6";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(0, 0, w, h * 0.42);
      ctx.fillStyle = "#d0201a";
      ctx.beginPath();
      ctx.ellipse(w / 2, h * 0.21, w * 0.34, h * 0.15, 0, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "#f4f0e6";
      ctx.lineWidth = h * 0.012;
      ctx.beginPath();
      ctx.ellipse(w / 2, h * 0.21, w * 0.34 - h * 0.02, h * 0.13, 0, 0, TAU);
      ctx.stroke();
      X.text(ctx, "DANGER", w / 2, h * 0.215, {
        font: "helv",
        size: h * 0.2,
        color: "#fff",
        maxW: w * 0.52,
        weight: "bold",
      });
      // body text: split long messages onto two lines so the lettering stays big and inside the plate margin
      let words = String(text).split(/\s+/),
        lines = [String(text)];
      if (words.length > 1 && String(text).length > 9) {
        let best = 1,
          bd = 1e9;
        for (let k = 1; k < words.length; k++) {
          const d = Math.abs(
            words.slice(0, k).join(" ").length -
              words.slice(k).join(" ").length,
          );
          if (d < bd) {
            bd = d;
            best = k;
          }
        }
        lines = [words.slice(0, best).join(" "), words.slice(best).join(" ")];
      }
      lines.forEach((l, i) =>
        X.text(ctx, l, w / 2, h * (lines.length > 1 ? 0.6 + i * 0.2 : 0.7), {
          font: "helv",
          size: h * (lines.length > 1 ? 0.17 : 0.2),
          color: "#1a1a1a",
          maxW: w * 0.8,
          weight: "bold",
        }),
      );
      ageSign(ctx, w, h, r, 0.7, true);
    },
    enamel(ctx, w, h, text, o, r) {
      const bg = o.bg || "#1e4a8a",
        fg = o.fg || "#f4f0e0";
      X.rrect(ctx, 0, 0, w, h, h * 0.15);
      ctx.fillStyle = bg;
      ctx.fill();
      ctx.strokeStyle = fg;
      ctx.lineWidth = h * 0.05;
      X.rrect(ctx, h * 0.1, h * 0.1, w - h * 0.2, h - h * 0.2, h * 0.1);
      ctx.stroke();
      X.text(ctx, text, w / 2, h * 0.52, {
        font: o.font || "slab",
        size: h * 0.5,
        color: fg,
        maxW: w - h * 0.4,
      });
      for (let k = 0; k < 10; k++) {
        const x = r() < 0.5 ? r() * w : r() < 0.5 ? 0 : w,
          y = r() < 0.5 ? (r() < 0.5 ? 0 : h) : r() * h;
        X.blobPath(ctx, x, y, h * (0.03 + r() * 0.08), r, 8, 0.6);
        ctx.fillStyle = "#1a1612";
        ctx.fill();
        ctx.strokeStyle = "#5a2a10";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ageSign(ctx, w, h, r, 0.5, true);
    },
    cryo(ctx, w, h, text, o, r) {
      // Project Long Winter facility signage: frost-white enamel, slate keyline, safety-orange band, crystal emblem
      ctx.fillStyle = "#e6eef2";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "#1c2e52";
      ctx.lineWidth = h * 0.06;
      ctx.strokeRect(h * 0.03, h * 0.03, w - h * 0.06, h - h * 0.06);
      ctx.fillStyle = "#e8742a";
      ctx.fillRect(h * 0.06, h * 0.8, w - h * 0.12, h * 0.1);
      A.snowflake(ctx, h * 0.55, h * 0.45, h * 0.28, "#3a6a8a", h * 0.05);
      const lines = String(text).split("\n");
      lines.forEach((l, i) =>
        X.text(
          ctx,
          l,
          (w + h) / 2,
          h * (0.45 + (i - (lines.length - 1) / 2) * 0.3),
          {
            font: "deco",
            size: h * (lines.length > 1 ? 0.26 : 0.42),
            color: "#1c2e52",
            maxW: w - h * 1.3,
            spacing: 2,
          },
        ),
      );
      ageSign(ctx, w, h, r, o.worn === undefined ? 0.4 : o.worn, true);
    },
    marquee(ctx, w, h, text, o, r) {
      ctx.fillStyle = "#1a1410";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#f4ecd8";
      ctx.fillRect(h * 0.18, h * 0.18, w - h * 0.36, h - h * 0.36);
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      for (let y = h * 0.18; y < h * 0.82; y += h * 0.16)
        ctx.fillRect(h * 0.18, y, w - h * 0.36, 2);
      const lines = String(text).split("\n");
      lines.forEach((l, i) =>
        X.text(ctx, l, w / 2, h * (0.5 + (i - (lines.length - 1) / 2) * 0.26), {
          font: "condensed",
          size: h * (lines.length > 1 ? 0.22 : 0.4),
          color: "#1a1410",
          maxW: w - h * 0.5,
          spacing: 2,
        }),
      );
      for (let x = h * 0.09; x < w; x += h * 0.12)
        for (const y of [h * 0.09, h * 0.91]) {
          const lit = r() > 0.25;
          ctx.beginPath();
          ctx.arc(x, y, h * 0.035, 0, TAU);
          ctx.fillStyle = lit ? "#fff4c8" : "#3a3024";
          ctx.fill();
        }
      for (let y = h * 0.21; y < h * 0.8; y += h * 0.12)
        for (const x of [h * 0.09, w - h * 0.09]) {
          const lit = r() > 0.25;
          ctx.beginPath();
          ctx.arc(x, y, h * 0.035, 0, TAU);
          ctx.fillStyle = lit ? "#fff4c8" : "#3a3024";
          ctx.fill();
        }
      // missing letter slots
      for (let k = 0; k < 3; k++) {
        ctx.fillStyle = "rgba(40,30,20,0.35)";
        ctx.fillRect(
          h * 0.2 + r() * (w - h * 0.6),
          h * 0.3 + r() * h * 0.3,
          h * 0.12,
          h * 0.18,
        );
      }
      ageSign(ctx, w, h, r, 0.45, true);
    },
    lightbox(ctx, w, h, text, o, r) {
      const bg = o.bg || "#f4f0e0",
        fg = o.fg || "#b8201a";
      ctx.fillStyle = "#2a2a28";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = bg;
      ctx.fillRect(h * 0.08, h * 0.08, w - h * 0.16, h - h * 0.16);
      X.text(ctx, text, w / 2, h * 0.52, {
        font: o.font || "deco",
        size: h * 0.5,
        color: fg,
        maxW: w - h * 0.4,
      });
      // smashed acrylic at the ends of the box (never over the name): a jagged hole showing the dark cabinet, a dead
      // fluorescent tube and its sockets, with a pale broken rim of the plastic around it
      const nHole = 1 + (r() < 0.5 ? 1 : 0);
      for (let k = 0; k < nHole; k++) {
        const left = (k === 0) === r() < 0.5,
          x = left ? h * 0.08 + r() * w * 0.07 : w - h * 0.08 - r() * w * 0.07,
          y = h * (0.25 + r() * 0.5),
          radius = h * (0.12 + r() * 0.1);
        ctx.save();
        ctx.beginPath();
        ctx.rect(h * 0.08, h * 0.08, w - h * 0.16, h - h * 0.16);
        ctx.clip();
        X.blobPath(ctx, x, y, radius * 1.12, r, 11, 0.9);
        ctx.fillStyle = "rgba(250,248,240,0.55)";
        ctx.fill();
        X.blobPath(ctx, x, y, radius, r, 11, 0.9);
        ctx.fillStyle = "#16140f";
        ctx.fill();
        ctx.clip();
        const ty = y + (r() - 0.5) * radius * 0.6;
        const tg = ctx.createLinearGradient(0, ty - h * 0.03, 0, ty + h * 0.03);
        tg.addColorStop(0, "#5a5a54");
        tg.addColorStop(0.5, "#b8b8ae");
        tg.addColorStop(1, "#3a3a36");
        ctx.fillStyle = tg;
        ctx.fillRect(x - radius * 1.5, ty - h * 0.025, radius * 3, h * 0.05);
        ctx.restore();
      }
      ageSign(ctx, w, h, r, 0.5, false);
    },
    banner(ctx, w, h, text, o, r) {
      const bg = o.bg || "#7a1e1a",
        fg = o.fg || "#f0e0b0";
      X.weave(ctx, w, h, r, bg, 3, 777);
      for (let x = 0; x < w; x += w / 6) {
        const g = ctx.createLinearGradient(x, 0, x + w / 6, 0);
        g.addColorStop(0, "rgba(0,0,0,0.25)");
        g.addColorStop(0.5, "rgba(255,255,255,0.08)");
        g.addColorStop(1, "rgba(0,0,0,0.25)");
        ctx.fillStyle = g;
        ctx.fillRect(x, 0, w / 6, h);
      }
      const em = o.emblem;
      if (em === "sun")
        A.sunDisc(ctx, w / 2, h * 0.36, Math.min(w * 0.42, h * 0.2), {
          color: fg,
          ink: null,
          inner: X.shade(bg, -0.2),
          core: X.shade(fg, 0.4),
        });
      else if (em === "covenant")
        A.covenant(ctx, w / 2, h * 0.34, Math.min(w * 0.85, h * 0.46), {
          steel: fg,
          iron: X.css(X.shade(fg, -0.3)),
          field: X.css(X.shade(bg, -0.35)),
        });
      else if (em === "continuity")
        A.continuity(ctx, w / 2, h * 0.32, Math.min(w * 0.4, h * 0.18), {
          navy: X.css(X.shade(bg, -0.45)),
          cream: fg,
          red: fg,
        });
      else if (em === "longwinter")
        A.longWinter(ctx, w / 2, h * 0.34, Math.min(w * 0.4, h * 0.2), {
          text: false,
        });
      X.text(ctx, text, w / 2, em ? h * 0.72 : h * 0.5, {
        font: o.font || "copper",
        size: h * (em ? 0.16 : 0.3),
        color: fg,
        maxW: w * 0.85,
      });
      ctx.save();
      ctx.globalCompositeOperation = "destination-out"; // frayed bottom edge
      for (let x = 0; x < w; x += 4) {
        ctx.fillRect(x, h - r() * h * 0.05, 3, h);
      }
      ctx.restore();
      ageSign(ctx, w, h, r, 0.6, false);
    },
    plaque(ctx, w, h, text, o, r) {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#8a6a34");
      g.addColorStop(0.5, "#6a4e24");
      g.addColorStop(1, "#4a3418");
      X.rrect(ctx, 0, 0, w, h, h * 0.06);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.strokeStyle = "#c8a860";
      ctx.lineWidth = h * 0.03;
      X.rrect(ctx, h * 0.06, h * 0.06, w - h * 0.12, h - h * 0.12, h * 0.04);
      ctx.stroke();
      X.text(ctx, text, w / 2, h * 0.38, {
        font: "copper",
        size: h * 0.2,
        color: "#e8d098",
        maxW: w * 0.86,
        shadow: "#1a1008",
        shadowA: 0.7,
      });
      if (o.sub)
        X.text(ctx, o.sub, w / 2, h * 0.64, {
          font: "serif",
          size: h * 0.12,
          italic: true,
          weight: "normal",
          color: "#e0c890",
          maxW: w * 0.86,
        });
      X.text(
        ctx,
        o.foot || "NEW YORK LANDMARKS PRESERVATION COMMISSION",
        w / 2,
        h * 0.85,
        {
          font: "condensed",
          size: h * 0.06,
          color: "#d0b880",
          spacing: 2,
          maxW: w * 0.8,
        },
      );
      X.blotches(ctx, w, h, r, {
        count: 8,
        color: "#3c6a58",
        alpha: 0.5,
        rmin: h * 0.05,
        rmax: h * 0.25,
      }); // verdigris
      ageSign(ctx, w, h, r, 0.4, true);
    },
    exit(ctx, w, h, text, o, r) {
      ctx.fillStyle = "#e8e4d8";
      ctx.fillRect(0, 0, w, h);
      X.text(ctx, text || "EXIT", w / 2, h * 0.52, {
        font: "helv",
        size: h * 0.62,
        color: "#1a8a3a",
        maxW: w * 0.85,
      });
      ageSign(ctx, w, h, r, 0.5, false);
    },
    gilt(ctx, w, h, text, o, r) {
      ctx.fillStyle = "#0e0e0c";
      ctx.fillRect(0, 0, w, h);
      X.text(ctx, text, w / 2, h * 0.5, {
        font: o.font || "deco",
        size: h * 0.5,
        color: "#d8b050",
        stroke: "#6a4a18",
        strokeW: h * 0.02,
        maxW: w * 0.9,
        spacing: 3,
      });
      ageSign(ctx, w, h, r, 0.35, false);
    },
  };
