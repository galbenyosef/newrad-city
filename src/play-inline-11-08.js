// play-inline-11 08 — ctx
// Lines 2152-2483 of readable/play-inline-11.pretty.js (statement-aligned).
  def("plaster_stained", {
    meters: 3,
    normal: 1.5,
    rough: 0.95,
    desc: "old plaster: water stains, cracks, spalls revealing lath",
    gen(ctx, w, h, r, hc) {
      const { n2 } = noiseBase(
        ctx,
        w,
        h,
        r,
        [
          [0, "#a8a08a"],
          [0.5, "#c2b99f"],
          [1, "#d4ccb2"],
        ],
        { scale: 3, seed: 301, grain: 8 },
      );
      heightFrom(hc, w, h, (i) => 0.6 + (n2[i] - 0.5) * 0.1);
      // water stains: pale-brown blooms with darker tide-line rims
      // (soft-edged bloom, faint nested tide lines, a run of drips below; hard outlined blobs read as cartoon balloons)
      for (let k = 0; k < 5; k++) {
        const x = r() * w,
          y = r() * h,
          radius = w * (0.05 + r() * 0.1),
          ry = radius * (1 + r() * 0.6),
          sd = r() * 1e4;
        X.wrap(w, h, x, y, Math.max(radius, ry) * 1.6, (cx, cy) => {
          const rr = X.rng ? X.rng(sd) : r;
          ctx.save();
          ctx.filter = "blur(" + (2 + radius * 0.06).toFixed(1) + "px)";
          X.smoothBlob(ctx, cx, cy, radius, ry, rr, 12, 0.45);
          ctx.fillStyle = "rgba(140,110,60,0.12)";
          ctx.fill();
          ctx.restore();
          // tide lines: blurred, faint and broken (a crisp outline reads as a drawn ring)
          ctx.save();
          ctx.filter = "blur(1.4px)";
          for (let t = 0; t < 2; t++) {
            const kk = 1 - t * 0.28;
            X.smoothBlob(
              ctx,
              cx,
              cy + t * radius * 0.12,
              radius * kk,
              ry * kk,
              rr,
              12,
              0.45,
            );
            ctx.setLineDash([
              radius * (0.4 + r() * 0.6),
              radius * (0.15 + r() * 0.3),
            ]);
            ctx.strokeStyle =
              "rgba(110,78,34," + (0.1 - t * 0.04).toFixed(2) + ")";
            ctx.lineWidth = 1.5 + r();
            ctx.stroke();
          }
          ctx.restore();
          if (r() < 0.6) {
            const g = ctx.createLinearGradient(0, cy, 0, cy + ry * 2.5);
            g.addColorStop(0, "rgba(120,90,45,0.16)");
            g.addColorStop(1, "rgba(120,90,45,0)");
            ctx.fillStyle = g;
            for (let q = 0; q < 3; q++)
              ctx.fillRect(
                cx + (r() - 0.5) * radius,
                cy + ry * 0.6,
                1.5 + r() * 3,
                ry * (1 + r() * 1.5),
              );
          }
        });
      }
      // fallen plaster, per pixel from a noisy distance field (no polygon outlines): a soft AO halo, a crumbly broken edge of
      // the white finish coat, a stepped band of the darker brown scratch coat, then the lath — strips of random spacing and
      // a slight tilt, broken ends, dark cavity between them with plaster keys squeezed through, rusty nails at the studs.
      {
        const img = ctx.getImageData(0, 0, w, h),
          d = img.data,
          himg = hc.getImageData(0, 0, w, h),
          hd = himg.data;
        const pa = X.fbm(w, h, { scale: 28, octaves: 3, seed: 307 }),
          pb = X.fbm(w, h, { scale: 64, octaves: 2, seed: 308 });
        for (let k = 0; k < 4; k++) {
          const cx = r() * w,
            cy = r() * h,
            radius = 16 + r() * 30,
            sq = 0.6 + r() * 0.8;
          const sp = 5.5 + r() * 3,
            fill = 0.58 + r() * 0.14,
            tiltK = Math.tan((r() - 0.5) * 0.08),
            ph = r() * sp;
          const stud = w * 0.135,
            sOff = r() * stud,
            R = Math.ceil(radius * 2.9 * Math.max(1, sq));
          for (let yy = -R; yy <= R; yy++)
            for (let xx = -R; xx <= R; xx++) {
              const px = (((Math.round(cx) + xx) % w) + w) % w,
                py = (((Math.round(cy) + yy) % h) + h) % h,
                i = py * w + px,
                o = i * 4;
              const dn =
                (Math.hypot(xx, yy / sq) / radius) *
                  (1 + (pa[i] - 0.5) * 0.95) +
                (pb[i] - 0.5) * 0.16;
              if (dn > 1.45 || !(dn > -1)) continue;
              let c = [d[o], d[o + 1], d[o + 2]],
                hh = hd[o];
              const e1 = 0.93 + (pa[i] - 0.5) * 0.12,
                e2 = 0.7 + (pb[i] - 0.5) * 0.2 + (pa[i] - 0.5) * 0.18; // wandering step edges
              if (dn > 1.0) {
                const ao = 1 - 0.2 * (1 - (dn - 1.0) / 0.45);
                c = c.map((v) => v * ao);
              } // halo: dirt gathered at the break
              else if (dn > e1) {
                c = X.mix(
                  c,
                  [214, 206, 188],
                  0.3 * Math.max(0, pb[i] - 0.3) * 2,
                );
                hh = 146;
              } // crumbly broken edge of the finish coat
              else if (dn > e2) {
                c = X.mix([118, 104, 84], [146, 132, 108], pb[i]);
                hh = 112;
                if (yy < 0 && dn > e1 - 0.06) c = c.map((v) => v * 0.78);
              } // scratch coat (stepped down)
              else {
                const lv = (yy + xx * tiltK + ph) / sp,
                  f = lv - Math.floor(lv),
                  strip = Math.floor(lv);
                const broken = X.rng((strip * 7919 + k * 131) >>> 0)();
                const gapBreak =
                  broken < 0.25 &&
                  Math.abs(xx - (broken * 4 - 0.5) * radius) < radius * 0.25; // a snapped strip
                if (f < fill && !gapBreak) {
                  const e = Math.min(f, fill - f) / fill; // round the strip edges
                  c = X.mix(
                    [74, 58, 40],
                    [128, 104, 74],
                    Math.min(1, e * 3) * (0.7 + 0.3 * pb[i]),
                  );
                  hh = 70 + e * 40;
                  const nx = (((px - sOff) % stud) + stud) % stud; // nails where the strip crosses a stud
                  if (nx < 2.2 && f > fill * 0.3 && f < fill * 0.7) {
                    c = [92, 46, 22];
                    hh = 60;
                  } else if (nx < 3.5 && f > fill * 0.7)
                    c = X.mix(c, [110, 60, 30], 0.5); // rust bleed under the nail
                } else {
                  c = [26, 20, 15];
                  hh = 25; // cavity
                  if (pb[i] > 0.68 && f > fill + 0.08) {
                    c = [168, 158, 136];
                    hh = 55;
                  } // plaster keys pushed through
                }
                if (dn > 0.6) {
                  const ao = 0.55 + 0.45 * (1 - (dn - 0.6) / 0.14);
                  c = c.map((v) => v * (yy < 0 ? ao * 0.8 : ao));
                } // shadow under the coats
              }
              d[o] = c[0];
              d[o + 1] = c[1];
              d[o + 2] = c[2];
              hd[o] = hd[o + 1] = hd[o + 2] = hh;
            }
        }
        ctx.putImageData(img, 0, 0);
        hc.putImageData(himg, 0, 0);
      }
      X.cracks(
        ctx,
        w,
        h,
        r,
        { count: 6, width: 1, seg: 6, steps: 40, color: "rgba(60,50,40,0.75)" },
        hc,
      );
      X.streaks(ctx, w, h, r, {
        count: 14,
        color: "#6a5a3a",
        alpha: 0.15,
        maxW: 20,
      });
      X.blotches(ctx, w, h, r, { count: 5, color: "#39402a", alpha: 0.15 }); // mould
      macroGrime(ctx, w, h, 0.25, 305);
    },
  });
  def("wallpaper", {
    meters: 2,
    normal: 0,
    rough: 0.9,
    desc: "faded 1950s starburst-pattern wallpaper, peeling",
    gen(ctx, w, h, r, hc) {
      ctx.fillStyle = "#b8b08a";
      ctx.fillRect(0, 0, w, h);
      // vertical pinstripes
      for (let x = 0; x < w; x += w / 8) {
        ctx.fillStyle = "rgba(120,140,110,0.35)";
        ctx.fillRect(x, 0, 6, h);
      }
      // starbursts & boomerangs in a half-drop repeat
      const s = w / 4;
      for (let j = 0; j < 4; j++)
        for (let i = 0; i < 4; i++) {
          const cx = i * s + s / 2 + ((j % 2) * s) / 2,
            cy = j * s + s / 2;
          X.wrap(w, h, cx, cy, s, (x, y) => {
            ctx.strokeStyle = "rgba(160,80,60,0.55)";
            ctx.lineWidth = 1.5;
            for (let a = 0; a < 8; a++) {
              const an = (a / 8) * TAU;
              ctx.beginPath();
              ctx.moveTo(x, y);
              ctx.lineTo(
                x + Math.cos(an) * s * 0.2,
                y + Math.sin(an) * s * 0.2,
              );
              ctx.stroke();
            }
            ctx.fillStyle = "rgba(160,80,60,0.6)";
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, TAU);
            ctx.fill();
            ctx.fillStyle = "rgba(70,110,110,0.45)";
            ctx.beginPath();
            ctx.moveTo(x + s * 0.25, y + s * 0.3);
            ctx.quadraticCurveTo(
              x + s * 0.4,
              y + s * 0.15,
              x + s * 0.5,
              y + s * 0.35,
            );
            ctx.quadraticCurveTo(
              x + s * 0.4,
              y + s * 0.25,
              x + s * 0.25,
              y + s * 0.3,
            );
            ctx.fill();
          });
        }
      X.desaturate(ctx, w, h, 0.3);
      X.blotches(ctx, w, h, r, {
        count: 10,
        color: "#7a6040",
        alpha: 0.25,
        stretchY: 1.8,
      });
      X.streaks(ctx, w, h, r, {
        count: 20,
        color: "#5a4020",
        alpha: 0.2,
        maxW: 16,
      });
      // peeled strips showing plaster
      for (let k = 0; k < 4; k++) {
        const x = r() * w,
          y = r() * h,
          sw = 20 + r() * 40,
          sh = 40 + r() * 90;
        X.wrap(w, h, x, y, Math.max(sw, sh), (cx, cy) => {
          ctx.fillStyle = "#9c957e";
          X.blobPath(ctx, cx, cy, sw, r, 9, 0.6);
          ctx.fill();
          ctx.strokeStyle = "rgba(240,230,200,0.6)";
          ctx.lineWidth = 2;
          ctx.stroke();
        });
      }
      macroGrime(ctx, w, h, 0.3, 315);
    },
  });
  def("tile_subway", {
    roughVar: 0.6,
    meters: 1.2,
    normal: 2.5,
    rough: 0.35,
    desc: "white 3×6 subway tile, grimy grout",
    gen(ctx, w, h, r, hc) {
      ctx.fillStyle = "#6e685c";
      ctx.fillRect(0, 0, w, h);
      hc.fillStyle = "#404040";
      hc.fillRect(0, 0, w, h);
      const cols = 8,
        rows = 16,
        tw = w / cols,
        th = h / rows,
        gap = 2;
      for (let j = 0; j < rows; j++)
        for (let i = -1; i <= cols; i++) {
          const x = i * tw + ((j % 2) * tw) / 2,
            y = j * th;
          const c = X.jitter(r() < 0.04 ? "#9a9888" : "#dcd8cc", r, 0.05);
          const g = ctx.createLinearGradient(0, y, 0, y + th);
          g.addColorStop(0, X.css(X.shade(c, 0.1)));
          g.addColorStop(1, X.css(X.shade(c, -0.08)));
          ctx.fillStyle = g;
          X.rrect(ctx, x + gap / 2, y + gap / 2, tw - gap, th - gap, 3);
          ctx.fill();
          hc.fillStyle = "#d0d0d0";
          X.rrect(hc, x + gap / 2, y + gap / 2, tw - gap, th - gap, 3);
          hc.fill();
          if (r() < 0.05) {
            ctx.fillStyle = "#4a4438";
            ctx.beginPath();
            ctx.moveTo(x + r() * tw, y);
            ctx.lineTo(x + tw, y + r() * th);
            ctx.lineTo(x + tw, y);
            ctx.fill();
          } // broken corner
        }
      X.cracks(ctx, w, h, r, {
        count: 4,
        width: 1,
        seg: 6,
        steps: 30,
        color: "rgba(40,38,32,0.7)",
      });
      X.streaks(ctx, w, h, r, {
        count: 30,
        color: "#4a3e2a",
        alpha: 0.22,
        maxW: 16,
      });
      X.blotches(ctx, w, h, r, { count: 10, color: "#3a3428", alpha: 0.28 });
      macroGrime(ctx, w, h, 0.35, 325);
    },
  });
