/* src/map/20_streets.js */
/* =====================================================================
 * NEW RAD CITY — MAP MODULE · 20 STREETS
 * Faded lane lines, zebra crosswalks & stop lines, potholes, cracks, oil
 * stains, manholes (steam anchors exported for atmosphere), bomb craters
 * (some radioactive), uplifted/broken road slabs, rubble drifts, and NYC
 * green street-name signs at intersections (atlas; uses G.tex.sign when it
 * produces a suitable strip). Also defines the street-sign and shop-sign
 * canvas atlases.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const M = G.map._;
  const SY = M.SIDEWALK_Y;
  const MK = M.MARK;

  // -------------------------------------------------------------------
  // Atlases
  // -------------------------------------------------------------------
  M.streetSignIndex = {};
  M.defineAtlas("streetsigns", function () {
    const names = [];
    const add = (n) => {
      if (n && !(n in M.streetSignIndex)) {
        M.streetSignIndex[n] = names.length;
        names.push(n);
      }
    };
    for (const a of G.LAYOUT.AVENUE_DEFS) add(a.name);
    add("Broadway");
    add("Central Park West");
    add("Central Park South");
    add("Columbus Circle");
    for (const a of M.roads.avenues) add(a.name);
    for (const s of M.roads.streets) add(s.name);
    const cols = 2,
      rows = 64,
      CW = 512,
      CH = 64;
    const cv = M.canvas(cols * CW, rows * CH),
      ctx = cv.getContext("2d");
    const r = M.rng("streetsigns");
    names.slice(0, cols * rows).forEach((n, i) => {
      const x = (i % cols) * CW,
        y = Math.floor(i / cols) * CH;
      let drawn = false;
      try {
        if (!G.isStub("tex") && G.tex.sign) {
          const t = G.tex.sign(n.toUpperCase(), "street");
          const img = t && t.image;
          if (
            img &&
            img.width &&
            img.height &&
            img.width / img.height > 3 &&
            img.width / img.height < 12
          ) {
            ctx.drawImage(img, x, y, CW, CH);
            drawn = true;
          }
        }
      } catch (e) {
        drawn = false;
      }
      if (!drawn) {
        ctx.fillStyle = "#1f5a36";
        ctx.fillRect(x, y, CW, CH);
        ctx.strokeStyle = "#e8e8dc";
        ctx.lineWidth = 4;
        ctx.strokeRect(x + 5, y + 5, CW - 10, CH - 10);
        ctx.fillStyle = "#ecece0";
        ctx.font = 'bold 40px "Arial Narrow", Arial, sans-serif';
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const txt = n
          .replace(" Street", " St")
          .replace(" Avenue", " Av")
          .toUpperCase();
        ctx.save();
        ctx.translate(x + CW / 2, y + CH / 2 + 2);
        ctx.scale(0.8, 1);
        ctx.fillText(txt, 0, 0, CW * 1.15);
        ctx.restore();
      }
      // weathering
      for (let k = 0; k < 40; k++) {
        ctx.fillStyle =
          "rgba(" + ((60 + r() * 60) | 0) + ",40,20," + r() * 0.35 + ")";
        ctx.fillRect(x + r() * CW, y + r() * CH, 2 + r() * 12, 1 + r() * 6);
      }
    });
    M.streetSignNames = names;
    const t = M.finishTex(new THREE.CanvasTexture(cv));
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    return { texture: t, roughness: 0.6, metalness: 0.2 };
  });
  M.streetSignUV = function (name) {
    M.atlasMaterial("streetsigns");
    const i = M.streetSignIndex[name];
    return M.cellUV(i === undefined ? 0 : i, 2, 64);
  };

  const SHOPS = [
    ["DELICATESSEN", "#7a1f1a", "#f0e2c0"],
    ["PHARMACY", "#1d4d33", "#f2f2e0"],
    ["PAWN SHOP · LOANS", "#23233a", "#e8c24a"],
    ["LAUNDROMAT", "#2e5a7a", "#ffffff"],
    ["HARDWARE", "#5a3a1a", "#f0d890"],
    ["LIQUORS", "#6a1a2a", "#ffe0a0"],
    ["BARBER SHOP", "#f0ece0", "#b02020"],
    ["SHOE REPAIR", "#3a3020", "#e8dcc0"],
    ["RADIO & TV REPAIR", "#1e3a4a", "#9ff0ff"],
    ["SPARKLE CLEANERS", "#d8d0b0", "#1b3f6b"],
    ["FIZZO COLA SOLD HERE", "#a8322a", "#f7f0dc"],
    ["DINER · OPEN 24 HRS", "#c8c0a8", "#8a1a14"],
    ["BOOKS & MAGAZINES", "#2a2a2a", "#e0d8b8"],
    ["TAILOR", "#4a3a5a", "#f0e8d8"],
    ["JEWELRY", "#101010", "#e8c870"],
    ["BAKERY", "#e8d8b0", "#6a3a1a"],
    ["FLORIST", "#2a4a2a", "#f8e8e8"],
    ["HOTEL", "#3a1a1a", "#f0c860"],
    ["CHECK CASHING", "#e0c030", "#202020"],
    ["GROCERY", "#2d5a2d", "#f8f0d8"],
    ["TELETYPE SALES & SERVICE", "#26323a", "#ffb347"],
    ["CIVIL DEFENSE RECRUITING", "#1b2f5a", "#f4f0e6"],
    ["PIZZA GALAXY · SLICES", "#20103a", "#ffcf40"],
    ["CHOP SUEY", "#8a1a1a", "#f0d060"],
    ["TOBACCONIST", "#3a2a1a", "#e0c898"],
    ["CAMERA EXCHANGE", "#202830", "#f0f0f0"],
    ["TOYS & HOBBIES", "#d04020", "#fff4c0"],
    ["BAR & GRILL", "#1a1a1a", "#ff9040"],
    ["LONLY TELEVISION · SALES & SERVICE", "#e8e2d0", "#1b3f6b"],
    ["PHOTO STUDIO", "#403040", "#f0e0f0"],
    ["LUNCHEONETTE", "#c83a2a", "#ffffff"],
    ["OPTICIAN", "#1a2a4a", "#e0f0ff"],
  ];
  M.SHOP_SIGN_COUNT = SHOPS.length;
  M.defineAtlas("shopsigns", function () {
    const cols = 2,
      rows = 16,
      CW = 512,
      CH = 64;
    const cv = M.canvas(cols * CW, rows * CH),
      ctx = cv.getContext("2d");
    const r = M.rng("shopsigns");
    const fonts = [
      "bold 38px Georgia, serif",
      'bold 40px "Arial Narrow", Arial, sans-serif',
      "italic bold 38px Georgia, serif",
      'bold 36px "Courier New", monospace',
    ];
    SHOPS.forEach(([txt, bg, fg], i) => {
      const x = (i % cols) * CW,
        y = Math.floor(i / cols) * CH;
      ctx.fillStyle = bg;
      ctx.fillRect(x, y, CW, CH);
      ctx.strokeStyle = fg;
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 3;
      ctx.strokeRect(x + 6, y + 6, CW - 12, CH - 12);
      ctx.globalAlpha = 1;
      ctx.fillStyle = fg;
      ctx.font = fonts[i % fonts.length];
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(txt, x + CW / 2, y + CH / 2 + 2, CW - 30);
      // grime, rust drips, missing letters
      for (let k = 0; k < 60; k++) {
        ctx.fillStyle =
          "rgba(" +
          ((40 + r() * 50) | 0) +
          "," +
          ((30 + r() * 30) | 0) +
          ",20," +
          r() * 0.45 +
          ")";
        ctx.fillRect(x + r() * CW, y + r() * CH, 2 + r() * 16, 1 + r() * 10);
      }
      for (let k = 0; k < 6; k++) {
        ctx.fillStyle = "rgba(90,50,25,0.35)";
        ctx.fillRect(x + r() * CW, y + CH * 0.5, 2, CH * 0.5);
      }
      if (r() < 0.4) {
        ctx.fillStyle = bg;
        ctx.fillRect(x + 40 + r() * (CW - 100), y + 8, 26, CH - 16);
      }
    });
    const t = M.finishTex(new THREE.CanvasTexture(cv));
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    return { texture: t, roughness: 0.75 };
  });

  // -------------------------------------------------------------------
  // Lane lines, crosswalks, stop lines
  // -------------------------------------------------------------------
  const Y_MARK = 0.012;
  function dashes(ax, az, bx, bz, w, dash, gap, cell, fade, r) {
    const len = Math.hypot(bx - ax, bz - az);
    if (len < 1) return;
    const ux = (bx - ax) / len,
      uz = (bz - az) / len,
      yaw = Math.atan2(ux, uz);
    for (let t = 0; t < len - dash; t += dash + gap) {
      if (r() < fade) continue;
      const cx = ax + ux * (t + dash / 2),
        cz = az + uz * (t + dash / 2);
      if (
        M.circlePart &&
        M.circlePart(cx, cz) &&
        M.circlePart(cx, cz) !== "walk"
      )
        continue; // roundabouts get their own paint
      // 22 years of traffic-free weathering: faded, sun-bleached paint (dimmer vertex colour = less contrast)
      const c = M.mulc([1, 1, 1], r.range(0.2, 0.5));
      // broken paint: some dashes survive only as fragments
      const frag = r() < 0.3 ? r.range(0.35, 0.8) : 1;
      M.decal(
        M.buf("my/markings", cx, cz, "detail"),
        cx,
        Y_MARK,
        cz,
        w,
        dash * frag,
        yaw,
        cell,
        c,
        r() < 0.5,
      );
    }
  }
  function solid(ax, az, bx, bz, w, cell, r, fade) {
    const len = Math.hypot(bx - ax, bz - az);
    if (len < 1) return;
    const n = Math.ceil(len / 6);
    for (let i = 0; i < n; i++) {
      if (r() < (fade || 0.15)) continue;
      const t0 = (i * len) / n,
        t1 = ((i + 1) * len) / n;
      dashes(
        ax + ((bx - ax) * t0) / len,
        az + ((bz - az) * t0) / len,
        ax + ((bx - ax) * t1) / len,
        az + ((bz - az) * t1) / len,
        w,
        t1 - t0 - 0.01,
        0.01,
        cell,
        0,
        r,
      );
    }
  }
  function intersections() {
    const out = [];
    for (const a of M.roads.avenues)
      for (const s of M.roads.streets) {
        if (a.x < s.x0 + 4 || a.x > s.x1 - 4) continue;
        if (s.z < a.z0 + 3 || s.z > a.z1 - 3) continue;
        out.push({ a, s, x: a.x, z: s.z });
      }
    M.intersections = out;
    return out;
  }
  function buildMarkings() {
    const L = G.LAYOUT;
    const r = M.rng("markings");
    const X = intersections();
    // avenue lane lines, segmented between intersections
    for (const a of M.roads.avenues) {
      const cuts = X.filter((q) => q.a === a)
        .map((q) => q.z)
        .sort((p, q) => p - q);
      let z = a.z0;
      const segs = [];
      for (const cz of cuts) {
        segs.push([z, cz - 8]);
        z = cz + 8;
      }
      segs.push([z, a.z1]);
      for (const [z0, z1] of segs) {
        if (z1 - z0 < 6) continue;
        dashes(a.x - 2, z0 + 1, a.x - 2, z1 - 1, 0.14, 3, 6, MK.WHITE, 0.42, r);
        dashes(a.x + 2, z0 + 1, a.x + 2, z1 - 1, 0.14, 3, 6, MK.WHITE, 0.42, r);
        solid(a.x - 5.6, z0 + 1, a.x - 5.6, z1 - 1, 0.12, MK.WHITE, r, 0.5);
        solid(a.x + 5.6, z0 + 1, a.x + 5.6, z1 - 1, 0.12, MK.WHITE, r, 0.5);
        // right-hand traffic: northbound lanes (east half, reading toward -z) approach the intersection at z0,
        // southbound lanes (west half, rotated π) approach it at z1
        if (z1 - z0 > 20 && r() < 0.35) {
          const zz = z0 + 8;
          M.decal(
            M.buf("my/markings", a.x + 4, zz, "detail"),
            a.x + 4,
            Y_MARK,
            zz,
            2.4,
            2.6,
            0,
            MK.ONLY,
            M.mulc([1, 1, 1], r.range(0.25, 0.45)),
          );
        }
        if (z1 - z0 > 20 && r() < 0.35) {
          const zz = z1 - 8;
          M.decal(
            M.buf("my/markings", a.x - 4, zz, "detail"),
            a.x - 4,
            Y_MARK,
            zz,
            2.4,
            2.6,
            Math.PI,
            MK.ONLY,
            M.mulc([1, 1, 1], r.range(0.25, 0.45)),
          );
        }
        if (z1 - z0 > 24 && r() < 0.45) {
          const zz = z0 + 13;
          M.decal(
            M.buf("my/markings", a.x + 3.8, zz, "detail"),
            a.x + 3.8,
            Y_MARK,
            zz,
            1.4,
            3.2,
            0,
            MK.ARROW,
            M.mulc([1, 1, 1], r.range(0.25, 0.45)),
          );
        }
        if (z1 - z0 > 24 && r() < 0.45) {
          const zz = z1 - 13;
          M.decal(
            M.buf("my/markings", a.x - 3.8, zz, "detail"),
            a.x - 3.8,
            Y_MARK,
            zz,
            1.4,
            3.2,
            Math.PI,
            MK.ARROW,
            M.mulc([1, 1, 1], r.range(0.25, 0.45)),
          );
        }
      }
    }
    // street centre lines
    for (const s of M.roads.streets) {
      const cuts = X.filter((q) => q.s === s)
        .map((q) => q.x)
        .sort((p, q) => p - q);
      let x = s.x0;
      for (const cx of cuts.concat([s.x1 + 6])) {
        const x0 = x + 1,
          x1 = cx - 7;
        if (x1 - x0 > 6)
          dashes(
            x0,
            s.z,
            x1,
            s.z,
            0.13,
            3,
            5,
            s.extra ? MK.WHITE : MK.YELLOW,
            0.45,
            r,
          );
        x = cx + 7;
      }
    }
    // Broadway double yellow
    const B = L.BROADWAY;
    for (let i = 0; i < B.length - 1; i++) {
      const a = B[i],
        b = B[i + 1];
      const dx = b[0] - a[0],
        dz = b[1] - a[1],
        l = Math.hypot(dx, dz),
        px = (-dz / l) * 0.15,
        pz = (dx / l) * 0.15;
      if (L.inPark(a[0], a[1]) && L.inPark(b[0], b[1])) continue;
      // where Broadway rides inside an avenue's carriageway for a block (8th Ave at Columbus Circle, 6th Ave at
      // Herald Sq) the avenue's own lane paint is the paint — no second set of lines on top of it
      if (
        M.roads.avenues.some(
          (av) =>
            Math.abs(a[0] - av.x) < 2.5 &&
            Math.abs(b[0] - av.x) < 2.5 &&
            Math.min(a[1], b[1]) >= av.z0 - 20 &&
            Math.max(a[1], b[1]) <= av.z1 + 20,
        )
      )
        continue;
      solid(a[0] + px, a[1] + pz, b[0] + px, b[1] + pz, 0.1, MK.YELLOW, r, 0.2);
      solid(a[0] - px, a[1] - pz, b[0] - px, b[1] - pz, 0.1, MK.YELLOW, r, 0.2);
    }
    // crosswalks + stop lines at every intersection
    for (const q of X) {
      const a = q.a,
        s = q.s;
      const hwA = a.road / 2,
        hwS = s.road / 2;
      if (L.siteAt(q.x, q.z, 0) && L.siteAt(q.x, q.z, 0).closesStreets)
        continue;
      if (M.circlePart && M.circlePart(q.x, q.z)) continue; // roundabout: see roundaboutMarkings()
      for (const sd of [-1, 1]) {
        // across the avenue (north/south of the intersection): bars run N-S
        const zc = q.z + sd * (hwS + 2.2);
        if (r() < 0.85)
          for (let x = a.x - hwA + 0.6; x < a.x + hwA - 0.4; x += 1.3) {
            if (r() < 0.35) continue;
            M.decal(
              M.buf("my/markings", x, zc, "detail"),
              x,
              Y_MARK,
              zc,
              0.6,
              3.0 * (r() < 0.25 ? r.range(0.4, 0.8) : 1),
              0,
              MK.WHITE,
              M.mulc([1, 1, 1], r.range(0.2, 0.48)),
              r() < 0.5,
            );
          }
        // stop line for oncoming traffic
        if (r() < 0.7)
          M.decal(
            M.buf("my/markings", a.x, zc + sd * 2.3, "detail"),
            a.x,
            Y_MARK,
            zc + sd * 2.3,
            a.road - 0.6,
            0.4,
            0,
            MK.WHITE,
            M.mulc([1, 1, 1], r.range(0.22, 0.42)),
          );
        // across the street (east/west): bars run E-W
        const xc = q.x + sd * (hwA + 2.2);
        if (r() < 0.8)
          for (let z = s.z - hwS + 0.6; z < s.z + hwS - 0.4; z += 1.3) {
            if (r() < 0.35) continue;
            M.decal(
              M.buf("my/markings", xc, z, "detail"),
              xc,
              Y_MARK,
              z,
              3.0 * (r() < 0.25 ? r.range(0.4, 0.8) : 1),
              0.6,
              0,
              MK.WHITE,
              M.mulc([1, 1, 1], r.range(0.2, 0.48)),
              r() < 0.5,
            );
          }
      }
    }
  }

  /**
   * Roundabout paint: faded dashed lane divider around the ring, a solid edge line along the island,
   * yield "shark teeth" + zebra crossings on every approach arm (avenue N/S, street E/W, Broadway).
   */
  function roundaboutMarkings() {
    const L = G.LAYOUT,
      r = M.rng("roundabout");
    for (const c of M.roads.circles || []) {
      const mid = (c.rIsland + c.rOuter) / 2;
      const nSeg = Math.round((Math.PI * 2 * mid) / 4.5);
      for (let i = 0; i < nSeg; i++) {
        if (r() < 0.3) continue;
        const a = ((i + 0.25) / nSeg) * Math.PI * 2,
          x = c.x + Math.cos(a) * mid,
          z = c.z + Math.sin(a) * mid;
        M.decal(
          M.buf("my/markings", x, z, "detail"),
          x,
          Y_MARK,
          z,
          0.14,
          2.2,
          Math.atan2(-Math.sin(a), Math.cos(a)),
          MK.WHITE,
          M.mulc([1, 1, 1], r.range(0.2, 0.45)),
        );
      }
      const nE = Math.round((Math.PI * 2 * (c.rIsland + 0.6)) / 1.6);
      for (let i = 0; i < nE; i++) {
        if (r() < 0.15) continue;
        const a = (i / nE) * Math.PI * 2,
          rr = c.rIsland + 0.55,
          x = c.x + Math.cos(a) * rr,
          z = c.z + Math.sin(a) * rr;
        M.decal(
          M.buf("my/markings", x, z, "detail"),
          x,
          Y_MARK,
          z,
          0.12,
          1.65,
          Math.atan2(-Math.sin(a), Math.cos(a)),
          MK.YELLOW,
          M.mulc([1, 1, 1], r.range(0.25, 0.5)),
        );
      }
      // approach arms: unit direction + carriageway width
      const arms = [];
      for (const a of M.roads.avenues)
        if (
          Math.abs(a.x - c.x) < a.road &&
          c.z > a.z0 - c.rOuter &&
          c.z < a.z1 + c.rOuter
        ) {
          if (a.z0 < c.z - c.rOuter) arms.push([0, -1, a.road]);
          if (a.z1 > c.z + c.rOuter) arms.push([0, 1, a.road]);
        }
      for (const s of M.roads.streets)
        if (
          Math.abs(s.z - c.z) < s.road &&
          c.x > s.x0 - c.rOuter &&
          c.x < s.x1 + c.rOuter
        ) {
          if (s.x0 < c.x - c.rOuter) arms.push([-1, 0, s.road]);
          if (s.x1 > c.x + c.rOuter) arms.push([1, 0, s.road]);
        }
      const B = L.BROADWAY;
      for (let i = 0; i + 1 < B.length; i++) {
        if (Math.hypot(B[i][0] - c.x, B[i][1] - c.z) < 1) {
          const dx = B[i + 1][0] - B[i][0],
            dz = B[i + 1][1] - B[i][1],
            l = Math.hypot(dx, dz);
          // Broadway leaving along an avenue arm (8th Ave south of Columbus Circle) shares that arm's paint
          if (!arms.some((q) => (q[0] * dx) / l + (q[1] * dz) / l > 0.95))
            arms.push([dx / l, dz / l, L.BROADWAY_ROAD]);
        }
      }
      for (const [ux, uz, w] of arms) {
        const px = -uz,
          pz = ux,
          yaw = Math.atan2(ux, uz);
        // yield teeth just outside the ring on the inbound half (right-hand traffic: inbound = the half on the driver's right)
        const tr = c.rOuter + 0.9;
        for (let k = 0; k < w / 2 - 0.6; k += 1.0) {
          const off = -(k + 0.6);
          const x = c.x + ux * tr + px * off,
            z = c.z + uz * tr + pz * off;
          if (r() < 0.25) continue;
          M.decal(
            M.buf("my/markings", x, z, "detail"),
            x,
            Y_MARK,
            z,
            0.6,
            0.9,
            yaw,
            MK.WHITE,
            M.mulc([1, 1, 1], r.range(0.25, 0.5)),
          );
        }
        // zebra crossing a few metres out
        const zr = c.rOuter + 4.2;
        for (let k = -w / 2 + 0.6; k < w / 2 - 0.4; k += 1.3) {
          if (r() < 0.3) continue;
          const x = c.x + ux * zr + px * k,
            z = c.z + uz * zr + pz * k;
          M.decal(
            M.buf("my/markings", x, z, "detail"),
            x,
            Y_MARK,
            z,
            0.6,
            3.0 * (r() < 0.25 ? r.range(0.4, 0.8) : 1),
            yaw,
            MK.WHITE,
            M.mulc([1, 1, 1], r.range(0.2, 0.48)),
            r() < 0.5,
          );
        }
      }
    }
  }
  M.roundaboutMarkings = roundaboutMarkings;

  // -------------------------------------------------------------------
  // Road damage: potholes, cracks, stains, patches, manholes, craters
  // -------------------------------------------------------------------
  M.manholes = [];
  M.craters = [];
  function roadPoint(r) {
    // random point on a road (weighted by length)
    const R = M.roads;
    if (!R._w) {
      R._w = [];
      let acc = 0;
      for (const a of R.avenues) {
        acc += a.z1 - a.z0;
        R._w.push([acc, "a", a]);
      }
      for (const s of R.streets) {
        acc += s.x1 - s.x0;
        R._w.push([acc, "s", s]);
      }
      R._tot = acc;
    }
    const k = r() * R._tot;
    for (const e of R._w)
      if (k <= e[0]) {
        if (e[1] === "a") {
          const a = e[2];
          return [
            a.x + r.range(-a.road / 2 + 0.6, a.road / 2 - 0.6),
            r.range(a.z0, a.z1),
            "a",
            a,
          ];
        }
        const s = e[2];
        return [
          r.range(s.x0, s.x1),
          s.z + r.range(-s.road / 2 + 0.6, s.road / 2 - 0.6),
          "s",
          s,
        ];
      }
    return [0, 0, "a", R.avenues[0]];
  }
  function buildDamage() {
    const L = G.LAYOUT;
    const r = M.rng("roaddamage");
    const decalCells = [
      MK.CRACKS,
      MK.CRACKS,
      MK.POTHOLE,
      MK.STAIN,
      MK.STAIN,
      MK.PUDDLE,
      MK.DIRT,
      MK.LITTER,
      MK.GRIME,
    ];
    for (let i = 0; i < 1500; i++) {
      const [x, z] = roadPoint(r);
      if (L.siteAt(x, z, 0) && L.siteAt(x, z, 0).closesStreets) continue;
      const cell = r.pick(decalCells);
      const s = cell === MK.POTHOLE ? r.range(0.8, 2.2) : r.range(1.5, 5);
      M.decal(
        M.buf("my/markings", x, z, "fine"),
        x,
        Y_MARK + 0.002,
        z,
        s * r.range(0.8, 1.4),
        s,
        r() * 6,
        cell,
        M.mulc([1, 1, 1], r.range(0.7, 1)),
      );
    }
    // sidewalk grime/cracks/litter on raised pieces
    for (let i = 0; i < 1400; i++) {
      const [x, z, kind, rd] = roadPoint(r);
      let px = x,
        pz = z;
      if (kind === "a")
        px =
          rd.x +
          (r() < 0.5 ? -1 : 1) * r.range(rd.road / 2 + 0.6, rd.width / 2 - 0.4);
      else
        pz =
          rd.z +
          (r() < 0.5 ? -1 : 1) * r.range(rd.road / 2 + 0.6, rd.width / 2 - 0.4);
      if (M.rasterAt(px, pz) !== M.RC.RAISED) continue;
      const cell = r.pick([
        MK.CRACKS,
        MK.STAIN,
        MK.LITTER,
        MK.DIRT,
        MK.LEAVES,
        MK.GRIME,
      ]);
      M.decal(
        M.buf("my/markings", px, pz, "fine"),
        px,
        SY + 0.012,
        pz,
        r.range(1.2, 3),
        r.range(1.2, 3),
        r() * 6,
        cell,
        M.mulc([1, 1, 1], r.range(0.7, 1)),
      );
    }
    // manholes
    const mb = (x, z) => M.buf("metal_panel", x, z, "detail");
    for (let i = 0; i < 360; i++) {
      const [x, z] = roadPoint(r);
      if (L.siteAt(x, z, 1)) continue;
      M.cyl(mb(x, z), x, -0.02, z, 0.42, 0.42, 0.045, 12, {
        capTop: true,
        c: [0.45, 0.4, 0.36],
        cy: [0.55, 0.5, 0.45],
      });
      M.cyl(mb(x, z), x, -0.02, z, 0.5, 0.5, 0.03, 12, {
        capTop: true,
        c: [0.35, 0.34, 0.32],
      });
      M.manholes.push({ x, y: 0.03, z, steam: r() < 0.22 });
    }
    // uplifted / broken asphalt slabs (small obstacles) along roads
    for (let i = 0; i < 90; i++) {
      const [x, z, kind] = roadPoint(r);
      if (L.siteAt(x, z, 2)) continue;
      brokenSlabs(x, z, r.range(3, 6), r, kind === "a" ? 0 : Math.PI / 2);
    }
    // bomb craters (a few radioactive)
    for (let i = 0; i < 26; i++) {
      const [x, z] = roadPoint(r);
      if (L.siteAt(x, z, 8)) continue;
      crater(x, z, r.range(3.5, 7), r, i % 5 === 0);
    }
    // rubble drifts on sidewalks & in the gutter
    for (let i = 0; i < 160; i++) {
      const [x, z, kind, rd] = roadPoint(r);
      let px = x,
        pz = z;
      if (kind === "a")
        px =
          rd.x +
          (r() < 0.5 ? -1 : 1) * r.range(rd.road / 2 - 1.5, rd.width / 2 - 0.5);
      else
        pz =
          rd.z +
          (r() < 0.5 ? -1 : 1) * r.range(rd.road / 2 - 1.2, rd.width / 2 - 0.5);
      if (L.siteAt(px, pz, 2)) continue;
      M.rubblePile(px, pz, r.range(1.2, 2.6), r.range(0.4, 1.1), r, {
        layer: "detail",
        noCollide: true,
      });
    }
  }
  function brokenSlabs(x, z, size, r, yaw) {
    const b = M.buf("asphalt", x, z, "main");
    const bd = M.buf("dirt", x, z, "detail");
    M.decal(
      M.buf("my/markings", x, z, "fine"),
      x,
      Y_MARK + 0.004,
      z,
      size * 1.4,
      size * 1.2,
      r() * 6,
      MK.DIRT,
    );
    const n = r.int(2, 4);
    for (let i = 0; i < n; i++) {
      const px = x + r.range(-size / 2, size / 2),
        pz = z + r.range(-size / 2, size / 2);
      const w = r.range(1.2, 2.6),
        d = r.range(1.2, 2.4);
      const tilt = r.range(0.15, 0.45);
      M.obox(
        b,
        px,
        0.1 + Math.sin(tilt) * w * 0.3,
        pz,
        w,
        0.28,
        d,
        yaw + r.range(-0.6, 0.6),
        {
          roll: tilt * (r() < 0.5 ? 1 : -1),
          pitch: r.range(-0.2, 0.2),
          s: 3,
          c: [0.85, 0.85, 0.82],
        },
      );
      M.obox(bd, px, 0.02, pz, w * 0.8, 0.2, d * 0.8, r() * 3, {
        s: 2,
        c: [0.7, 0.6, 0.5],
      });
      if (tilt > 0.3)
        M.box3(
          px - w * 0.4,
          0,
          pz - d * 0.4,
          px + w * 0.4,
          0.5 + Math.sin(tilt) * w * 0.5,
          pz + d * 0.4,
          { tag: "rubble", surface: "rubble" },
        );
    }
  }
  function crater(x, z, rds, r, hot) {
    M.craters.push({ x, z, r: rds, hot });
    M.decal(
      M.buf("my/markings", x, z, "detail"),
      x,
      Y_MARK + 0.006,
      z,
      rds * 2.6,
      rds * 2.6,
      r() * 6,
      MK.SCORCH,
      [1, 1, 1],
    );
    M.decal(
      M.buf("my/markings", x, z, "detail"),
      x,
      Y_MARK + 0.008,
      z,
      rds * 1.4,
      rds * 1.4,
      r() * 6,
      MK.POTHOLE,
      [0.8, 0.8, 0.8],
    );
    // rim of uplifted asphalt plates
    const b = M.buf("asphalt", x, z, "main");
    const n = Math.round(rds * 2.2);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + r.range(-0.2, 0.2);
      const d = rds * r.range(0.8, 1.05);
      const px = x + Math.cos(a) * d,
        pz = z + Math.sin(a) * d;
      const w = r.range(1.2, 2.4);
      // plate tilted outward (like a peeled rim)
      M.obox(b, px, 0.25, pz, w, 0.3, r.range(1, 1.8), -a + Math.PI / 2, {
        pitch: 0,
        roll: 0,
        s: 3,
        c: [0.8, 0.8, 0.78],
      });
      M.obox(
        b,
        px + Math.cos(a) * 0.3,
        0.3,
        pz + Math.sin(a) * 0.3,
        r.range(0.8, 1.6),
        0.25,
        w,
        Math.atan2(Math.cos(a), Math.sin(a)),
        { pitch: -r.range(0.3, 0.7), s: 3, c: [0.75, 0.75, 0.72] },
      );
    }
    // dirt bowl
    const bd = M.buf("dirt", x, z, "main");
    M.cyl(bd, x, -0.1, z, rds * 0.95, rds * 0.4, 0.15, 12, {
      capTop: true,
      c: [0.55, 0.45, 0.35],
      cy: [0.45, 0.38, 0.3],
    });
    M.rubblePile(x + r.range(-1, 1), z + r.range(-1, 1), rds * 0.35, 0.5, r, {
      layer: "detail",
      noCollide: true,
    });
    // rim collider ring (low; walkable)
    if (hot) {
      G.world.addRadSource({ x, y: 0.5, z, radius: rds * 1.6, strength: 2.5 });
      // glowing puddle of irradiated goo
      M.disc(
        M.buf("neon_green@lampg", x, z, "main"),
        x + r.range(-0.5, 0.5),
        0.06,
        z + r.range(-0.5, 0.5),
        rds * 0.25,
        10,
        1,
        [1, 1, 1],
        2,
      );
    }
  }
  M.crater = crater;

  // -------------------------------------------------------------------
  // Street name signs
  // -------------------------------------------------------------------
  function signPole(x, z, aveName, stName, r, fallen) {
    const b = M.buf("metal_painted", x, z, "detail");
    const pc = [0.25, 0.32, 0.27];
    const H = 3.4;
    if (fallen) {
      const a = r() * 6;
      M.pipe(
        b,
        x,
        0.2,
        z,
        x + Math.cos(a) * H,
        0.25,
        z + Math.sin(a) * H,
        0.05,
        6,
        { c: pc },
      );
      return;
    }
    const lean = r() < 0.2 ? r.range(0.05, 0.18) : 0;
    const la = r() * 6;
    const tx = x + Math.cos(la) * Math.sin(lean) * H,
      tz = z + Math.sin(la) * Math.sin(lean) * H,
      ty = SY + Math.cos(lean) * H;
    M.pipe(b, x, SY, z, tx, ty, tz, 0.045, 6, { c: pc });
    M.cyl(b, x, SY, z, 0.1, 0.08, 0.3, 6, { c: pc });
    const sb = M.buf("my/streetsigns", x, z, "detail");
    const blade = (name, y, alongX, twist) => {
      const uv = M.streetSignUV(name);
      const L2 = 1.25,
        h = 0.2;
      const dx = alongX ? Math.cos(twist) : Math.sin(twist),
        dz = alongX ? Math.sin(twist) : Math.cos(twist);
      const nx = -dz,
        nz = dx;
      const p0 = [tx - (dx * L2) / 2, y, tz - (dz * L2) / 2],
        p1 = [tx + (dx * L2) / 2, y, tz + (dz * L2) / 2];
      // both faces (text readable from both sides)
      M.quad(
        sb,
        [p0[0] + nx * 0.012, y, p0[2] + nz * 0.012],
        [p1[0] + nx * 0.012, y, p1[2] + nz * 0.012],
        [p1[0] + nx * 0.012, y + h, p1[2] + nz * 0.012],
        [p0[0] + nx * 0.012, y + h, p0[2] + nz * 0.012],
        [nx, 0, nz],
        [uv[0], uv[1], uv[2], uv[1], uv[2], uv[3], uv[0], uv[3]],
      );
      M.quad(
        sb,
        [p0[0] - nx * 0.012, y, p0[2] - nz * 0.012],
        [p1[0] - nx * 0.012, y, p1[2] - nz * 0.012],
        [p1[0] - nx * 0.012, y + h, p1[2] - nz * 0.012],
        [p0[0] - nx * 0.012, y + h, p0[2] - nz * 0.012],
        [-nx, 0, -nz],
        [uv[2], uv[1], uv[0], uv[1], uv[0], uv[3], uv[2], uv[3]],
      );
    };
    const tw = r() < 0.2 ? r.range(-0.4, 0.4) : 0;
    blade(stName, ty - 0.25, true, tw);
    blade(aveName, ty - 0.02, false, r() < 0.2 ? r.range(-0.5, 0.5) : 0);
  }
  function buildSigns() {
    const L = G.LAYOUT;
    const r = M.rng("streetsignpoles");
    for (const q of M.intersections || []) {
      if (r() < 0.25) continue;
      if (L.siteAt(q.x, q.z, 3)) continue;
      const sx = q.x + (q.a.width / 2 - 0.7),
        sz = q.z - (q.s.width / 2 - 0.6);
      if (M.rasterAt(sx, sz) !== M.RC.RAISED) continue;
      let ave = q.a.name;
      if (q.a.x === -120 && q.z < -415) ave = "Central Park West";
      signPole(sx, sz, ave, q.s.name, r, r() < 0.1);
    }
    // Broadway × street crossings (the diagonal stretches): pole on the NE sidewalk corner
    const B = L.BROADWAY;
    for (const s of M.roads.streets)
      for (let i = 0; i + 1 < B.length; i++) {
        const a = B[i],
          c = B[i + 1];
        if ((a[1] - s.z) * (c[1] - s.z) > 0 || Math.abs(c[1] - a[1]) < 1)
          continue;
        const t = (s.z - a[1]) / (c[1] - a[1]),
          x = a[0] + (c[0] - a[0]) * t;
        if (x < s.x0 + 2 || x > s.x1 - 2) continue;
        if (
          M.roads.avenues.some(
            (av) => Math.abs(av.x - x) < 14 && s.z >= av.z0 && s.z <= av.z1,
          )
        )
          continue; // avenue crossing has its own
        if (L.siteAt(x, s.z, 3) || r() < 0.2) continue;
        for (const [ox, oz] of [
          [9.5, -(s.width / 2 - 0.6)],
          [-9.5, s.width / 2 - 0.6],
        ]) {
          const sx = x + ox,
            sz = s.z + oz;
          if (M.rasterAt(sx, sz) !== M.RC.RAISED) continue;
          signPole(sx, sz, "Broadway", s.name, r, r() < 0.1);
          break;
        }
      }
    // roundabout: one pole on each corner sidewalk
    for (const c of M.roads.circles || []) {
      for (const a of [0.8, 2.4, 3.9, 5.5]) {
        const rr = c.rOuter + 1.2,
          sx = c.x + Math.cos(a) * rr,
          sz = c.z + Math.sin(a) * rr;
        if (M.rasterAt(sx, sz) !== M.RC.RAISED) continue;
        signPole(sx, sz, c.name, "59th Street", r, false);
      }
    }
  }

  M.buildStreets = function () {
    buildMarkings();
    roundaboutMarkings();
    buildDamage();
    buildSigns();
  };
})();
