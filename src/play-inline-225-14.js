// play-inline-225 14 — lineto
// Lines 3762-3919 of readable/play-inline-225.pretty.js (statement-aligned).
  LI.covenantEmblem = function (x, cx, cy, R, col) {
    x.save();
    x.fillStyle = col;
    x.strokeStyle = col;
    x.lineWidth = R * 0.07;
    x.lineJoin = "round";
    x.beginPath();
    x.moveTo(cx - R * 0.7, cy - R * 0.8);
    x.lineTo(cx + R * 0.7, cy - R * 0.8);
    x.lineTo(cx + R * 0.7, cy - R * 0.1);
    x.quadraticCurveTo(cx + R * 0.62, cy + R * 0.62, cx, cy + R * 0.95);
    x.quadraticCurveTo(
      cx - R * 0.62,
      cy + R * 0.62,
      cx - R * 0.7,
      cy - R * 0.1,
    );
    x.closePath();
    x.stroke();
    // anvil: face, horn, waist, foot
    x.beginPath();
    x.moveTo(cx - R * 0.42, cy + R * 0.02);
    x.lineTo(cx + R * 0.3, cy + R * 0.02);
    x.lineTo(cx + R * 0.52, cy - R * 0.06);
    x.lineTo(cx + R * 0.3, cy + R * 0.14);
    x.lineTo(cx + R * 0.14, cy + R * 0.16);
    x.lineTo(cx + R * 0.1, cy + R * 0.32);
    x.lineTo(cx + R * 0.26, cy + R * 0.42);
    x.lineTo(cx - R * 0.3, cy + R * 0.42);
    x.lineTo(cx - R * 0.14, cy + R * 0.32);
    x.lineTo(cx - R * 0.18, cy + R * 0.16);
    x.lineTo(cx - R * 0.42, cy + R * 0.14);
    x.closePath();
    x.fill();
    // hammer: handle + head
    x.fillRect(cx - R * 0.035, cy - R * 0.62, R * 0.07, R * 0.56);
    x.fillRect(cx - R * 0.2, cy - R * 0.7, R * 0.4, R * 0.14);
    for (let i = 0; i < 3; i++)
      x.fillRect(
        cx - R * (0.12 + i * 0.06),
        cy + R * (0.52 + i * 0.1),
        R * (0.24 + i * 0.12),
        R * 0.05,
      );
    x.restore();
  };
  /** Five-pointed star (painted art helper). */
  LI.star = function (x, cx, cy, R, r, col) {
    x.fillStyle = col;
    x.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5,
        rr = i % 2 ? r : R;
      x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
    }
    x.closePath();
    x.fill();
  };
  /** The Continuity's seal (original): a double ring, an unbroken column (the government that never fell)
   *  standing on a stepped base, flanked by two laurel arcs of short leaves. */
  LI.continuityEmblem = function (x, cx, cy, R, col) {
    x.strokeStyle = col;
    x.fillStyle = col;
    x.lineWidth = R * 0.06;
    x.beginPath();
    x.arc(cx, cy, R, 0, TAU);
    x.stroke();
    x.lineWidth = R * 0.025;
    x.beginPath();
    x.arc(cx, cy, R * 0.86, 0, TAU);
    x.stroke();
    const cw = R * 0.16,
      top = cy - R * 0.5,
      bot = cy + R * 0.42;
    x.fillRect(cx - cw / 2, top, cw, bot - top); // shaft
    x.fillRect(cx - cw * 0.95, top - R * 0.07, cw * 1.9, R * 0.07); // capital
    x.fillRect(cx - cw * 1.25, top - R * 0.12, cw * 2.5, R * 0.05);
    x.fillRect(cx - cw * 1.1, bot, cw * 2.2, R * 0.06); // stepped base
    x.fillRect(cx - cw * 1.6, bot + R * 0.06, cw * 3.2, R * 0.06);
    for (const s of [-1, 1])
      for (let i = 0; i < 7; i++) {
        // laurel arcs
        const a = Math.PI / 2 + s * (0.35 + i * 0.3),
          px = cx + Math.cos(a) * R * 0.62,
          py = cy + Math.sin(a) * R * 0.62;
        x.save();
        x.translate(px, py);
        x.rotate(a + s * 0.6);
        x.beginPath();
        x.ellipse(0, 0, R * 0.09, R * 0.035, 0, 0, TAU);
        x.fill();
        x.restore();
      }
  };
  /** Top-down Manhattan map drawn from the live LAYOUT (war-room tables). */
  LI.manhattanMap = function (x, W, H, opts) {
    opts = opts || {};
    const L = G.LAYOUT,
      WB = L.WORLD;
    const sx = W / (WB.maxX - WB.minX),
      sz = H / (WB.maxZ - WB.minZ),
      s = Math.min(sx, sz);
    const px = (X) => (X - WB.minX) * s + (W - (WB.maxX - WB.minX) * s) / 2,
      pz = (Z) => (Z - WB.minZ) * s + (H - (WB.maxZ - WB.minZ) * s) / 2;
    x.fillStyle = opts.sea || "#2a3a3a";
    x.fillRect(0, 0, W, H);
    const poly = (P, fill) => {
      x.fillStyle = fill;
      x.beginPath();
      P.forEach((p, i) =>
        i ? x.lineTo(px(p[0]), pz(p[1])) : x.moveTo(px(p[0]), pz(p[1])),
      );
      x.closePath();
      x.fill();
    };
    poly(L.MANHATTAN, opts.land || "#9a9070");
    poly(L.BROOKLYN, opts.land || "#9a9070");
    for (const c of [L.LIBERTY, L.ELLIS]) {
      x.beginPath();
      x.arc(px(c.x), pz(c.z), c.r * s, 0, TAU);
      x.fill();
    }
    x.fillStyle = opts.park || "#6a7a4a";
    x.fillRect(
      px(L.PARK.x0),
      pz(L.PARK.z0),
      (L.PARK.x1 - L.PARK.x0) * s,
      (L.PARK.z1 - L.PARK.z0) * s,
    );
    x.strokeStyle = opts.street || "rgba(60,50,30,0.5)";
    x.lineWidth = Math.max(1, 3 * s);
    for (const a of L.avenues) {
      x.beginPath();
      x.moveTo(px(a.x), pz(a.z0));
      x.lineTo(px(a.x), pz(a.z1));
      x.stroke();
    }
    for (const st of L.streets) {
      x.beginPath();
      x.moveTo(px(st.x0), pz(st.z));
      x.lineTo(px(st.x1), pz(st.z));
      x.stroke();
    }
    x.beginPath();
    L.BROADWAY.forEach((p, i) =>
      i ? x.lineTo(px(p[0]), pz(p[1])) : x.moveTo(px(p[0]), pz(p[1])),
    );
    x.stroke();
    x.fillStyle = opts.site || "rgba(40,30,20,0.7)";
    for (const si of L.SITES)
      x.fillRect(
        px(si.x0),
        pz(si.z0),
        (si.x1 - si.x0) * s,
        (si.z1 - si.z0) * s,
      );
    return { px, pz, s };
  };
