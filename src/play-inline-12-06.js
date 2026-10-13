// play-inline-12 06 — ctx
// Lines 1483-1610 of readable/play-inline-12.pretty.js (statement-aligned).
  for (const s in STYLES) {
    const S = STYLES[s];
    for (let v = 0; v < S.variants; v++) {
      X.def("facade_" + s + "_" + (v + 1), {
        w: S.w,
        h: S.h,
        normal: 2.2,
        normalStep: 2,
        rough: 0.86,
        seed: v * 7919,
        meters: S.bays * S.bayW,
        metersV: S.floors * S.floorH,
        facade: {
          tileW: S.bays * S.bayW,
          tileH: S.floors * S.floorH,
          bays: S.bays,
          floors: S.floors,
          bayW: S.bayW,
          floorH: S.floorH,
          top: "facade_" + s + "_top",
          base: "facade_" + s + "_base",
          trimH: S.floorH,
          inhabited: INHABITED[s] === v,
        },
        desc:
          s + " facade tile (" + S.bays + " bays × " + S.floors + " floors)",
        gen: GENS[s](v),
      });
    }
  }

  // ==================================================================
  // TRIM STRIPS (non-repeating vertically): facade_<style>_top / _base
  // 512×128 = 14 m × 3.5 m (same px/m as the facade tiles), tileable in U only.
  //   _top  : cornice / parapet crown for the last storey (brackets, dentils, corbels, coping)
  //   _base : ground-floor band (rusticated stone, stoop & areaway, loading docks, granite plinth)
  // Listed in G.tex.facadeInfo(style).top/.base; material via G.mats.facadeTrim(style, 'top'|'base').
  // ==================================================================
  function rustication(ctx, hc, x0, y0, w, h, col, course, r) {
    ctx.fillStyle = X.css(X.shade(col, -0.55));
    ctx.fillRect(x0, y0, w, h); // deep channel joints
    hc.fillStyle = "#202020";
    hc.fillRect(x0, y0, w, h);
    for (let y = y0; y < y0 + h; y += course) {
      const off = (((y - y0) / course) | 0) % 2 ? course * 1.3 : 0;
      for (let x = x0 - off; x < x0 + w; x += course * 2.6) {
        const g = ctx.createLinearGradient(0, y, 0, y + course);
        g.addColorStop(0, X.css(X.shade(col, 0.12)));
        g.addColorStop(1, X.css(X.shade(col, -0.12 - r() * 0.1)));
        ctx.fillStyle = g;
        ctx.fillRect(x + 2, y + 2, course * 2.6 - 4, course - 4);
        ctx.fillStyle = "rgba(255,248,230,0.18)";
        ctx.fillRect(x + 2, y + 2, course * 2.6 - 4, 2); // lit top arris
        hc.fillStyle = "#d0d0d0";
        hc.fillRect(x + 2, y + 2, course * 2.6 - 4, course - 4);
      }
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillRect(x0, y + course - 2, w, 2);
      hc.fillStyle = "#303030";
      hc.fillRect(x0, y + course - 3, w, 3);
    }
  }
  function brackets(ctx, hc, y, h, n, col, w, scroll) {
    for (let k = 0; k < n; k++) {
      const bx = ((k + 0.5) * w) / n;
      ctx.fillStyle = X.css(col);
      ctx.beginPath();
      if (scroll) {
        // console bracket: wide head tapering to a curled scroll foot
        ctx.moveTo(bx - 10, y);
        ctx.lineTo(bx + 10, y);
        ctx.lineTo(bx + 9, y + h * 0.25);
        ctx.quadraticCurveTo(bx + 4, y + h * 0.5, bx + 7, y + h * 0.78);
        ctx.arc(bx + 1, y + h * 0.82, 6, 0, Math.PI * 1.6);
        ctx.quadraticCurveTo(bx - 7, y + h * 0.45, bx - 9, y + h * 0.25);
        ctx.closePath();
      } else ctx.rect(bx - 5, y, 10, h);
      ctx.fill();
      ctx.fillStyle = "rgba(255,245,225,0.22)";
      ctx.fillRect(bx - 9, y, 4, h * 0.6);
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillRect(bx + 10, y + 2, 5, h * 0.85); // cast shadow
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.fillRect(bx + 4, y, 3, h * 0.9);
      hc.fillStyle = "#f0f0f0";
      hc.fillRect(bx - 6, y, 12, h);
    }
  }
  function dentils(ctx, hc, y, h, col, w) {
    for (let x = 2; x < w; x += 12) {
      ctx.fillStyle = X.css(col);
      ctx.fillRect(x, y, 7, h);
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillRect(x + 7, y, 5, h);
      hc.fillStyle = "#e8e8e8";
      hc.fillRect(x, y, 7, h);
    }
  }
  function ledge(ctx, hc, y, h, col, w) {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, X.css(X.shade(col, 0.25)));
    g.addColorStop(0.5, X.css(col));
    g.addColorStop(1, X.css(X.shade(col, -0.35)));
    ctx.fillStyle = g;
    ctx.fillRect(0, y, w, h);
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(0, y + h, w, Math.max(3, h * 0.4));
    hc.fillStyle = "#ffffff";
    hc.fillRect(0, y, w, h);
  }
  function rustRuns(ctx, y, w, h, r, n) {
    for (let k = 0; k < n; k++) {
      const x = r() * w,
        len = h * (0.3 + r() * 0.7),
        g = ctx.createLinearGradient(0, y, 0, y + len);
      g.addColorStop(0, "rgba(110,55,20,0.55)");
      g.addColorStop(1, "rgba(110,55,20,0)");
      ctx.fillStyle = g;
      ctx.fillRect(x, y, 2 + r() * 4, len);
    }
  }
  const TRIM_WALL = {
    tenement: ["brick_red", "brick_tan", "brick_brown", "brick_cream"],
    artdeco: ["limestone", "brick_tan", "granite", "brick_dark"],
    brownstone: ["brownstone", "brick_red", "stucco"],
    warehouse: ["brick_red", "brick_brown"],
    office: ["stucco", "stucco", "concrete"],
  };
