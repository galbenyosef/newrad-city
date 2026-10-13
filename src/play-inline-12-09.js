// play-inline-12 09 — ctx
// Lines 2127-2418 of readable/play-inline-12.pretty.js (statement-aligned).
  function genStorefront(idx) {
    const shop = SHOPS[idx];
    return function (ctx, w, h, r, hc) {
      // stone / cast-iron surround
      paintWall(
        ctx,
        0,
        0,
        w,
        h,
        idx % 3 === 0 ? "limestone" : idx % 3 === 1 ? "granite" : "brick_red",
        r,
        400 + idx,
      );
      const pil = 26,
        bandY = 8,
        bandH = h * 0.2,
        baseY = h - h * 0.12;
      // pilasters (tileable: split across the left/right edge)
      for (const px of [0, w]) {
        const g = ctx.createLinearGradient(px - pil, 0, px + pil, 0);
        g.addColorStop(0, "#3a3834");
        g.addColorStop(0.5, "#6e6a62");
        g.addColorStop(1, "#2a2824");
        ctx.fillStyle = g;
        ctx.fillRect(px - pil, 0, pil * 2, h);
        hc.fillStyle = "#e0e0e0";
        hc.fillRect(px - pil, 0, pil * 2, h);
      }
      // sign band
      const sx = pil + 4,
        sw = w - pil * 2 - 8;
      ctx.fillStyle = X.css(shop.band);
      ctx.fillRect(sx, bandY, sw, bandH);
      ctx.strokeStyle = "rgba(210,190,140,0.6)";
      ctx.lineWidth = 3;
      ctx.strokeRect(sx + 4, bandY + 4, sw - 8, bandH - 8);
      X.text(ctx, shop.name, w / 2 + 2, bandY + bandH * 0.45 + 2, {
        font: shop.font,
        size: bandH * 0.62,
        maxW: sw - 30,
        color: "rgba(0,0,0,0.5)",
      });
      X.text(ctx, shop.name, w / 2, bandY + bandH * 0.45, {
        font: shop.font,
        size: bandH * 0.62,
        maxW: sw - 30,
        color: shop.ink,
      });
      X.text(ctx, shop.sub, w / 2, bandY + bandH * 0.84, {
        font: "condensed",
        size: bandH * 0.15,
        maxW: sw - 40,
        color: X.css(shop.ink, 0.85),
        weight: "bold",
        spacing: 2,
      });
      // sun-bleach and peel the sign
      X.wearPaint ? null : null;
      ctx.save();
      ctx.beginPath();
      ctx.rect(sx, bandY, sw, bandH);
      ctx.clip();
      ctx.fillStyle = "rgba(230,220,190,0.18)";
      ctx.fillRect(sx, bandY, sw, bandH);
      X.blotches(ctx, w, h, r, {
        count: 6,
        color: "#1a140e",
        alpha: 0.35,
        rmin: 10,
        rmax: 40,
      });
      for (let k = 0; k < 5; k++) {
        ctx.fillStyle = "rgba(90,80,60,0.7)";
        X.blobPath(
          ctx,
          sx + r() * sw,
          bandY + r() * bandH,
          5 + r() * 14,
          r,
          8,
          0.7,
        );
        ctx.fill();
      }
      ctx.restore();
      hc.fillStyle = "#a0a0a0";
      hc.fillRect(sx, bandY, sw, bandH);
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(sx, bandY + bandH, sw, 4);
      // shop opening
      const oy = bandY + bandH + 6,
        oh = baseY - oy;
      const doorW = w * 0.17,
        doorX = idx % 2 ? w / 2 - doorW / 2 : w - pil - 10 - doorW;
      if (shop.state === "shutter") {
        // roll-down corrugated steel shutter with graffiti
        const g = ctx.createLinearGradient(0, oy, 0, h);
        g.addColorStop(0, "#7a7c78");
        g.addColorStop(1, "#4a4a46");
        ctx.fillStyle = g;
        ctx.fillRect(sx, oy, sw, h - oy);
        for (let y = oy; y < h; y += 6) {
          ctx.fillStyle = "rgba(0,0,0,0.25)";
          ctx.fillRect(sx, y, sw, 2);
          ctx.fillStyle = "rgba(255,255,255,0.08)";
          ctx.fillRect(sx, y + 2, sw, 1);
          hc.fillStyle = "#909090";
          hc.fillRect(sx, y, sw, 3);
        }
        X.blotches(ctx, w, h, r, {
          count: 8,
          color: "#6a3010",
          alpha: 0.3,
          rmin: 10,
          rmax: 40,
        });
        const tags = [
          "KILROY",
          "REPENT",
          "FIZZO 4 LIFE",
          "THE END",
          "SLEEPERS LIE",
          "NO SCRIP",
          "COUNT ME OUT",
        ];
        const tcol = ["#d02a2a", "#2a8ad0", "#e8e8e8", "#f0c020", "#30c060"];
        for (let k = 0; k < 2; k++)
          X.text(
            ctx,
            tags[(r() * tags.length) | 0],
            sx + sw * (0.3 + k * 0.4),
            oy + oh * (0.35 + k * 0.3),
            {
              font: "marker",
              size: 34,
              color: tcol[(r() * tcol.length) | 0],
              skew: -0.2,
              maxW: sw * 0.45,
              stroke: "#111",
              strokeW: 3,
            },
          );
        ctx.fillStyle = "#2a2a28";
        ctx.fillRect(sx, oy, sw, 10); // shutter box
      } else {
        // kick plate
        ctx.fillStyle = "#3a342c";
        ctx.fillRect(sx, baseY, sw, h - baseY);
        ctx.fillStyle = "rgba(255,255,255,0.12)";
        ctx.fillRect(sx, baseY, sw, 2);
        hc.fillStyle = "#909090";
        hc.fillRect(sx, baseY, sw, h - baseY);
        // display windows
        const win = [
          [sx + 4, doorX - 6],
          [doorX + doorW + 6, sx + sw - 4],
        ].filter((a) => a[1] - a[0] > 20);
        for (const [a, b] of win) {
          const st =
            shop.state === "boarded"
              ? "boarded"
              : shop.state === "broken"
                ? r() < 0.7
                  ? "broken"
                  : "intact"
                : r() < 0.25
                  ? "broken"
                  : "intact";
          drawWindow(ctx, hc, null, r, {
            x: a,
            y: oy,
            w: b - a,
            h: oh,
            state: st,
            panes: [2, 1],
            frame: "#2a2622",
            reveal: 4,
          });
          if (st === "intact") {
            // window lettering
            X.text(
              ctx,
              shop.name.toUpperCase().split(" ")[0],
              (a + b) / 2,
              oy + oh * 0.3,
              {
                font: "serif",
                size: 18,
                maxW: (b - a) * 0.8,
                color: "rgba(230,200,120,0.75)",
              },
            );
            // merchandise silhouettes
            ctx.fillStyle = "rgba(20,16,12,0.7)";
            for (let k = 0; k < 5; k++) {
              const bx = a + 8 + r() * (b - a - 30),
                bh2 = 10 + r() * 26;
              ctx.fillRect(bx, baseY - bh2, 8 + r() * 14, bh2);
            }
          }
          if (st === "boarded") {
            // plywood + posters
            const br =
              X.BRANDS &&
              X.BRANDS[G.LAYOUT.BRANDS[(r() * G.LAYOUT.BRANDS.length) | 0]];
            if (br) {
              // quick pasted-up handbill in the brand's colours
              ctx.save();
              ctx.translate(a + (b - a) * 0.5, oy + oh * 0.45);
              ctx.rotate((r() - 0.5) * 0.2);
              ctx.fillStyle = X.css(br.colors[0]);
              ctx.fillRect(-28, -40, 56, 80);
              ctx.fillStyle = X.css(br.colors[1], 0.9);
              ctx.fillRect(-28, 18, 56, 14);
              X.text(ctx, br.name.split(" ")[0], 0, -18, {
                font: "impact",
                size: 14,
                maxW: 50,
                color: br.colors[1],
              });
              ctx.fillStyle = "rgba(230,220,190,0.35)";
              ctx.fillRect(-28, -40, 56, 80);
              ctx.restore();
            }
            X.text(
              ctx,
              r() < 0.5 ? "KEEP OUT" : "CLOSED",
              (a + b) / 2,
              oy + oh * 0.8,
              {
                font: "marker",
                size: 22,
                maxW: (b - a) * 0.8,
                color: "#e8e0d0",
                skew: -0.15,
              },
            );
          }
        }
        // recessed door: glass upper half, push bar
        ctx.fillStyle = "#16120e";
        ctx.fillRect(doorX, oy, doorW, h - oy);
        ctx.fillStyle = "#4a3a2a";
        ctx.fillRect(doorX + 5, oy + 5, doorW - 10, h - oy - 10);
        const dg = ctx.createLinearGradient(
          doorX,
          oy,
          doorX + doorW,
          oy + oh * 0.5,
        );
        dg.addColorStop(0, shop.state === "broken" ? "#0e0c0a" : "#5a6a64");
        dg.addColorStop(1, "#141816");
        ctx.fillStyle = dg;
        ctx.fillRect(doorX + 10, oy + 10, doorW - 20, oh * 0.5);
        ctx.fillStyle = "#9a9488";
        ctx.fillRect(doorX + 10, oy + oh * 0.62, doorW - 20, 4);
        hc.fillStyle = "#303030";
        hc.fillRect(doorX, oy, doorW, h - oy);
        X.text(
          ctx,
          shop.state === "intact" ? "OPEN" : "CLOSED",
          doorX + doorW / 2,
          oy + oh * 0.25,
          { font: "helv", size: 10, color: "rgba(200,40,30,0.8)" },
        );
      }
      // awning bracket stubs + transom
      ctx.fillStyle = "#1e1c18";
      for (const bx of [sx + 10, sx + sw / 2, sx + sw - 14])
        ctx.fillRect(bx, bandY + bandH, 5, 12);
      weatherFacade(ctx, hc, w, h, r, 0.8);
      // street-level dirt splash at the bottom
      const bg = ctx.createLinearGradient(0, h - 40, 0, h);
      bg.addColorStop(0, "rgba(40,32,22,0)");
      bg.addColorStop(1, "rgba(40,32,22,0.55)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, h - 40, w, 40);
    };
  }
  SHOPS.forEach((s, i) =>
    X.def("storefront_" + (i + 1), {
      w: 512,
      h: 256,
      meters: 8,
      metersV: 4,
      normal: 1.8,
      rough: 0.8,
      desc: "storefront: " + s.name,
      gen: genStorefront(i),
    }),
  );
