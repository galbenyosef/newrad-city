// play-inline-531 03 — spec
// Lines 379-623 of readable/play-inline-531.pretty.js (statement-aligned).
  const f1 = (v) => Math.round(v * 10) / 10;
  X.cartridgeArt = function (spec, mode) {
    const cy = 100;
    const s = Math.min(
      (mode === "load" ? 236 : spec.shot ? 112 : 150) / spec.oal,
      (mode === "load" ? 64 : 56) / Math.max(spec.dia, spec.rim || 0),
    );
    const R = (spec.dia / 2) * s,
      RR = ((spec.rim || spec.dia) / 2) * s,
      RN = ((spec.neck || spec.dia * 0.94) / 2) * s;
    const L = spec.len * s,
      OAL = spec.oal * s;
    const rimW = Math.max(3, 1.3 * s),
      groove = spec.rim && spec.rim > spec.dia ? 0 : Math.max(2, 1.1 * s);
    const bR = RN * 0.9; // bullet radius
    const seat = Math.min(L * 0.35, (spec.shot ? 0 : 5.5) * s);
    const pr = Math.max(2.4, (spec.dia > 11 ? 2.7 : 2.2) * s * 0.5 + 1); // primer half-height
    let d = "",
      a;
    // case outline (top & bottom halves), base at x0
    const caseOutline = (x0) => {
      const up = (r) => f1(cy - r),
        dn = (r) => f1(cy + r);
      const xs = [x0, x0 + rimW, x0 + rimW + groove];
      let top = `M${f1(x0)} ${up(RR)} H${f1(xs[1])} V${up(groove ? R * 0.84 : R)} H${f1(xs[2])} V${up(R)}`;
      let bot = `M${f1(x0)} ${dn(RR)} H${f1(xs[1])} V${dn(groove ? R * 0.84 : R)} H${f1(xs[2])} V${dn(R)}`;
      if (spec.shoulder) {
        const sh = x0 + spec.shoulder * s,
          sh2 = sh + Math.max(4, (R - RN) * 1.6);
        top += ` L${f1(sh)} ${up(R * 0.985)} L${f1(sh2)} ${up(RN)} H${f1(x0 + L)}`;
        bot += ` L${f1(sh)} ${dn(R * 0.985)} L${f1(sh2)} ${dn(RN)} H${f1(x0 + L)}`;
      } else {
        top += ` L${f1(x0 + L)} ${up(RN)}`;
        bot += ` L${f1(x0 + L)} ${dn(RN)}`;
      }
      return (
        `<path d="${top} V${dn(RN)}" /><path d="${bot}" /><path d="M${f1(x0)} ${up(RR)} V${dn(RR)}" />` +
        (spec.shot
          ? `<path d="M${f1(x0 + 12 * s)} ${up(R)} V${dn(R)}" class="t"/><path d="M${f1(x0)} ${up(RR)} h${f1(12 * s)} M${f1(x0)} ${dn(RR)} h${f1(12 * s)}" class="t"/>`
          : "")
      );
    };
    // bullet (or shot column) with its base at bx
    const bullet = (bx) => {
      if (spec.shot) {
        let g = "";
        const rows = 3,
          cols = Math.max(
            3,
            Math.floor(((spec.oal - spec.len * 0.55) * s) / 9),
          );
        for (let i = 0; i < cols; i++)
          for (let j = 0; j < rows; j++)
            g += `<circle cx="${f1(bx + 4 + i * 8.4)}" cy="${f1(cy - R * 0.62 + j * R * 0.62)}" r="3.4"/>`;
        return `<g class="t">${g}</g>`;
      }
      const tip = bx + (spec.oal - spec.len) * s + seat;
      const shank =
        spec.nose === "spire"
          ? (tip - bx) * 0.38
          : spec.nose === "flat"
            ? (tip - bx) * 0.55
            : (tip - bx) * 0.3;
      const x1 = bx + shank;
      const nose =
        spec.nose === "flat"
          ? `L${f1(tip - 2)} ${f1(cy - bR * 0.5)} L${f1(tip)} ${f1(cy - bR * 0.45)} V${f1(cy + bR * 0.45)} L${f1(tip - 2)} ${f1(cy + bR * 0.5)}`
          : spec.nose === "spire"
            ? `Q${f1(x1 + (tip - x1) * 0.55)} ${f1(cy - bR)} ${f1(tip)} ${cy} Q${f1(x1 + (tip - x1) * 0.55)} ${f1(cy + bR)}`
            : `Q${f1(tip)} ${f1(cy - bR)} ${f1(tip)} ${cy} Q${f1(tip)} ${f1(cy + bR)}`;
      return (
        `<path d="M${f1(bx)} ${f1(cy - bR)} H${f1(x1)} ${nose} ${f1(x1)} ${f1(cy + bR)} H${f1(bx)} Z" />` +
        `<path d="M${f1(bx + 2)} ${f1(cy - bR * 0.55)} H${f1(x1)}" class="t"/>`
      );
    };
    const powderDots = (x0, x1, r) => {
      let g = "";
      for (let x = x0, k = 0; x < x1; x += 4.2, k++)
        for (let y = -r + 2 + (k % 2) * 2; y < r - 1; y += 4)
          g += `<circle cx="${f1(x)}" cy="${f1(cy + y)}" r="1.05"/>`;
      return `<g class="f">${g}</g>`;
    };
    if (mode === "load") {
      const x0 = 160 - OAL / 2;
      const mouth = x0 + L;
      const pb = x0 + (spec.shot ? 12 * s : rimW + groove + 2);
      const pEnd = spec.shot ? x0 + L * 0.45 : mouth - seat - 1;
      d += caseOutline(x0);
      // inner wall (X-ray section)
      d += `<path d="M${f1(x0 + rimW + 3)} ${f1(cy - R + 1.6)} H${f1(mouth - 1)} M${f1(x0 + rimW + 3)} ${f1(cy + R - 1.6)} H${f1(mouth - 1)}" class="h"/>`;
      // primer in its pocket + flash hole
      d += `<rect x="${f1(x0 - 0.5)}" y="${f1(cy - pr)}" width="${f1(Math.max(3, 1.6 * s))}" height="${f1(pr * 2)}" class="f"/><path d="M${f1(x0 + Math.max(3, 1.6 * s))} ${cy} h4" class="t"/>`;
      d += powderDots(pb + 3, pEnd, (spec.shot ? R : R) * 0.72);
      if (spec.shot) {
        const wx = x0 + L * 0.45;
        d += `<path d="M${f1(wx)} ${f1(cy - R * 0.86)} v${f1(R * 1.72)} M${f1(wx + 6)} ${f1(cy - R * 0.86)} v${f1(R * 1.72)} M${f1(wx)} ${cy} h6" class="h"/>`;
        d += bullet(wx + 7);
        // folded crimp
        d += `<path d="M${f1(mouth)} ${f1(cy - R)} L${f1(mouth + 5)} ${cy} L${f1(mouth)} ${f1(cy + R)} M${f1(mouth)} ${f1(cy - R * 0.5)} L${f1(mouth + 5)} ${cy} L${f1(mouth)} ${f1(cy + R * 0.5)}" class="t"/>`;
        a = [
          [f1(x0 + L * 0.7), f1(cy - R)],
          [f1(x0 + 1), cy],
          [f1((pb + pEnd) / 2), f1(cy + R * 0.4)],
          [f1(wx + 20), cy],
        ];
      } else {
        d += bullet(mouth - seat);
        d += `<path d="M${f1(mouth - seat)} ${f1(cy - bR)} V${f1(cy + bR)}" class="h"/>`;
        a = [
          [f1(x0 + L * 0.45), f1(cy - R)],
          [f1(x0 + 1), cy],
          [f1((pb + pEnd) / 2), f1(cy + R * 0.35)],
          [f1(mouth + (spec.oal - spec.len) * s * 0.5), f1(cy - bR * 0.5)],
        ];
      }
      return {
        d,
        a,
        dim: [
          f1(x0),
          f1(x0 + OAL + (spec.shot ? 5 : 0)),
          150,
          (spec.label || "") + " · " + spec.oal + " mm",
        ],
      };
    }
    // exploded view along the centre line: primer · case · powder · bullet
    const caseless = mode === "explode_nc";
    d += `<path d="M24 ${cy} H304" class="h"/>`;
    const px = 30;
    d += `<rect x="${px}" y="${f1(cy - pr - 1)}" width="${f1(Math.max(4, 1.8 * s))}" height="${f1(pr * 2 + 2)}" rx="1.2" class="f"/><path d="M${px + 2} ${f1(cy - pr - 1)} v${f1(pr * 2 + 2)}" class="t"/>`;
    const cx0 = 58;
    if (!caseless) d += caseOutline(cx0);
    // powder: a little conical heap below the line, between case and bullet
    const hx = caseless ? 130 : Math.min(236, cx0 + L + 34);
    d +=
      `<path d="M${hx - 26} ${cy + 36} Q${hx} ${cy + 4} ${hx + 26} ${cy + 36} Z" class="f"/>` +
      `<g class="t"><circle cx="${hx - 8}" cy="${cy + 28}" r="1.3"/><circle cx="${hx + 4}" cy="${cy + 22}" r="1.3"/><circle cx="${hx + 12}" cy="${cy + 31}" r="1.3"/><circle cx="${hx - 2}" cy="${cy + 32}" r="1.3"/></g>`;
    a = caseless ? [] : [[f1(cx0 + L * 0.5), f1(cy - R)]];
    a.push([px + 2, cy], [hx, cy + 24]);
    if (spec.shot) {
      // a little pyramid of buckshot on the bench, right of the powder
      let g = "";
      const sx = Math.min(282, hx + 50);
      for (let row = 0; row < 4; row++)
        for (let i = 0; i <= 3 - row; i++)
          g += `<circle cx="${f1(sx - (3 - row) * 4.4 + i * 8.8)}" cy="${f1(cy + 32 - row * 7.6)}" r="4"/>`;
      d += `<g class="t">${g}</g><path d="M${sx - 34} ${cy + 36.5} H${sx + 34}" class="t"/>`;
      a.push([sx, cy + 17]);
    } else {
      const bl = (spec.oal - spec.len) * s + seat;
      const bx = Math.min(
        304 - bl - 4,
        Math.max(hx + 34, caseless ? 190 : cx0 + L + 70),
      );
      d += bullet(bx);
      a.push([f1(bx + bl * 0.45), f1(cy - bR * 0.6)]);
    }
    return { d, a, dim: [24, 304, 156, "EXPLODED · " + (spec.label || "")] };
  };
  /** Drained cells wired across a dry cell (RECYCLE). Anchors: cells, battery, conductor. */
  ART.recharge = {
    d: `<g><rect x="36" y="64" width="34" height="50" rx="4"/><rect x="46" y="58" width="14" height="6"/><rect x="80" y="64" width="34" height="50" rx="4"/><rect x="90" y="58" width="14" height="6"/>
      <rect x="124" y="64" width="34" height="50" rx="4"/><rect x="134" y="58" width="14" height="6"/></g>
      <path d="M44 80 h18 M88 80 h18 M132 80 h18 M44 94 h18 M88 94 h18 M132 94 h18" class="t"/>
      <path d="M53 58 q0-14 22-14 h13 M97 58 q0-8 12-8 h32 q0 0 0 8 M141 58 v-14 h60 v18" class="h"/>
      <rect x="200" y="62" width="84" height="60" rx="6"/><path d="M212 62 v-8 h16 v8 M256 62 v-8 h16 v8" class="t"/>
      <circle cx="242" cy="92" r="16" class="f"/><path d="M242 80 l-7 13 h14 l-7 13" class="t"/>
      <path d="M160 128 q20 14 44 0 q10-8 24 0" /><path d="M170 124 h12 v8 h-12z" class="f"/>`,
    a: [
      [97, 104],
      [242, 92],
      [176, 128],
    ],
    dim: [36, 284, 152, "SERIES RECHARGE RIG"],
  };

  const esc = (s) =>
    String(s == null ? "" : s).replace(
      /[&<>"]/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
    );

  // Callout bubbles: a row along the top-left (the title block sits top-right), leader lines down to the parts.
  function callouts(anchors, n) {
    let s = "";
    const k = Math.min(n, 6);
    for (let i = 0; i < k; i++) {
      const a = anchors[i % anchors.length];
      const jitter =
        i >= anchors.length ? 12 * Math.floor(i / anchors.length) : 0;
      const ax = a[0] + jitter,
        ay = a[1];
      const cx = k === 1 ? 100 : 22 + i * (148 / (k - 1));
      const cy = 14;
      s +=
        `<path d="M${cx.toFixed(1)} ${cy + 7} L${ax} ${ay}" class="lead"/>` +
        `<circle cx="${ax}" cy="${ay}" r="1.8" class="dot"/>` +
        `<circle cx="${cx.toFixed(1)}" cy="${cy}" r="7" class="bub"/><text x="${cx.toFixed(1)}" y="${cy + 3.5}" class="num">${i + 1}</text>`;
    }
    return s;
  }
  function dimension(dim) {
    if (!dim) return "";
    const [x0, x1, y, label] = dim;
    const mid = (x0 + x1) / 2;
    return (
      `<g class="dim"><path d="M${x0} ${y - 5} v10 M${x1} ${y - 5} v10 M${x0} ${y} H${mid - 22} M${mid + 22} ${y} H${x1}"/>` +
      `<path d="M${x0} ${y} l6 -3 v6z M${x1} ${y} l-6 -3 v6z" class="arr"/><text x="${mid}" y="${y + 3}" class="dimt">${esc(label)}</text></g>`
    );
  }

  const cache = new Map();
  /**
   * Blueprint SVG. opts: {title, sub, parts:n (number of callouts), id (for the pattern id)}
   * The grid pattern id is unique per call so several blueprints can coexist on a page.
   */
  let uid = 0;
  X.blueprint = function (kind, opts) {
    opts = opts || {};
    const art = ART[kind] || ART.generic;
    const n = Math.max(0, opts.parts | 0);
    const key =
      (ART[kind] ? kind : "generic") +
      "|" +
      n +
      "|" +
      (opts.title || "") +
      "|" +
      (opts.sub || "");
    if (cache.has(key)) return cache.get(key);
    const pid = "crg" + ++uid;
    const svg =
      `<svg class="craft-bp" viewBox="0 0 320 180" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">` +
      `<defs><pattern id="${pid}" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0H0V10" class="grid"/></pattern></defs>` +
      `<rect x="1" y="1" width="318" height="178" fill="url(#${pid})" class="frame"/>` +
      `<g class="art">${art.d}</g>` +
      dimension(art.dim) +
      callouts(art.a, n) +
      `<g class="tblock"><path d="M184 32 H318 M184 1 V32"/><text x="189" y="14" class="tb1">${esc((opts.title || "").toUpperCase().slice(0, 21))}</text>` +
      `<text x="189" y="27" class="tb2">${esc((opts.sub || "FIG. 1 · NOT TO SCALE").toUpperCase().slice(0, 25))}</text></g></svg>`;
    if (cache.size > 120) cache.clear();
    cache.set(key, svg);
    return svg;
  };
