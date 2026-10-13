// play-inline-225 12 — day
// Lines 3155-3441 of readable/play-inline-225.pretty.js (statement-aligned).
  LI.shaftTick = function () {
    if (!shaftMat && !dustMat && !LI.skyCards.length) return;
    let sy = 0.6,
      sunMul = 1,
      storm = 0,
      tint = null;
    try {
      const A2 = G.atmos && !G.atmos.__stub ? G.atmos._ : null;
      if (A2 && A2.env) sy = A2.env.sunDir.y;
    } catch (e) {
      /* */
    }
    try {
      const wp =
        !G.isStub("atmos") && G.atmos.getWeatherParams
          ? G.atmos.getWeatherParams()
          : null;
      if (wp) {
        sunMul = wp.sunMul === undefined ? 1 : wp.sunMul;
        storm = wp.rad || 0;
        tint = wp.fogTint;
      }
    } catch (e) {
      /* */
    }
    const day = LI.smooth(-0.04, 0.22, sy),
      warm = 1 - LI.smooth(0.08, 0.45, sy);
    _sc
      .copy(_sw)
      .lerp(_sa, warm)
      .multiplyScalar(
        day * Math.pow(Math.max(0.05, sunMul), 0.85) * (1 + warm * 0.25),
      );
    _sc.r += _sm.r * 0.2 * (1 - day);
    _sc.g += _sm.g * 0.2 * (1 - day);
    _sc.b += _sm.b * 0.2 * (1 - day);
    if (storm > 0 && tint)
      _sc.lerp(tint.clone().multiplyScalar(day * 0.9 + 0.1), storm * 0.55);
    if (shaftMat) shaftMat.color.copy(_sc);
    // window panoramas: bright hazy day, orange dusk, near-dark blue night with the lit windows still reading
    for (const k of LI.skyCards) {
      const m = matCache[k];
      if (!m) continue;
      m.emissiveIntensity =
        0.1 + 0.72 * day * Math.pow(Math.max(0.1, sunMul), 0.6);
      m.color.setRGB(
        0.35 + 0.65 * day,
        0.38 + 0.6 * day - warm * 0.12 * day,
        0.5 + 0.5 * day - warm * 0.25 * day,
      );
      if (storm > 0 && tint) m.color.lerp(tint, storm * 0.35);
      if (m.emissive) m.emissive.copy(m.color);
    }
    if (dustMat) dustMat.opacity = 0.18 + 0.4 * Math.min(1, day * sunMul + 0.1);
  };
  /** Floating dust motes inside a local box (n points). */
  A.dust = function (C, x0, y0, z0, x1, y1, z1, n) {
    C.dustBoxes = C.dustBoxes || [];
    C.dustBoxes.push([x0, y0, z0, x1, y1, z1, n || 150]);
  };
  function buildDust(C) {
    if (!C.dustBoxes || !C.dustBoxes.length) return;
    const r = LI.rng("dust" + C.key),
      P = [];
    for (const [x0, y0, z0, x1, y1, z1, n] of C.dustBoxes)
      for (let i = 0; i < n; i++)
        P.push(
          x0 + r() * (x1 - x0),
          y0 + r() * (y1 - y0),
          z0 + r() * (z1 - z0),
        );
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(P, 3));
    g.computeBoundingSphere();
    g.boundingSphere.radius += 1;
    const pts = new THREE.Points(g, getDustMat());
    pts.name = "li_dust";
    pts.renderOrder = 3;
    C.root.add(pts);
  }
  LI._buildAtmos = function (C) {
    try {
      buildShafts(C);
    } catch (e) {
      G.reportError("landmark_interiors:shafts " + C.key, e);
    }
    try {
      buildDust(C);
    } catch (e) {
      G.reportError("landmark_interiors:dust " + C.key, e);
    }
  };

  // =====================================================================
  // Street doorway kit (world cells): door-local frame + a readable entrance
  // =====================================================================
  /** Door-local frame from a facade point and the yaw of someone standing in FRONT of the door looking away from it
   *  (street doors: looking out into the street; room-side exits: looking into the room): p(u, v), v = metres toward that viewer. */
  LI.doorFrame = function (x, z, yawOut) {
    return A.frame(x, z, Math.cos(yawOut), -Math.sin(yawOut), true);
  };
  /** Painted glimpse of a lit room behind an open door (warm or cool), used as the "inside" of street doorways. */
  LI.voidTex = function (id, o) {
    o = o || {};
    return LI.texMat(
      id,
      LI.canvasTex(
        id,
        128,
        256,
        (x, W, H) => {
          const g = x.createLinearGradient(0, 0, 0, H);
          g.addColorStop(0, o.top || "#0c0a08");
          g.addColorStop(0.6, o.mid || "#16120c");
          g.addColorStop(1, o.floor || "#2e2416");
          x.fillStyle = g;
          x.fillRect(0, 0, W, H);
          const l = x.createRadialGradient(
            W * 0.5,
            H * 0.35,
            2,
            W * 0.5,
            H * 0.4,
            W * 0.7,
          );
          l.addColorStop(0, o.glow || "rgba(255,200,120,0.55)");
          l.addColorStop(1, "rgba(0,0,0,0)");
          x.fillStyle = l;
          x.fillRect(0, 0, W, H);
          x.fillStyle = "rgba(0,0,0,0.5)";
          x.fillRect(0, 0, W * 0.12, H);
          x.fillRect(W * 0.88, 0, W * 0.12, H); // reveals
          if (o.figure) {
            x.fillStyle = "rgba(10,10,10,0.8)";
            x.fillRect(W * 0.62, H * 0.52, W * 0.1, H * 0.36);
            x.beginPath();
            x.arc(W * 0.67, H * 0.49, W * 0.05, 0, TAU);
            x.fill();
          }
        },
        { clamp: true },
      ),
      { rough: 0.95, emissive: o.emissive === undefined ? 0.45 : o.emissive },
    );
  };
  /**
   * A street doorway on a facade: bronze/steel frame, two leaves with glass lights (one ajar showing a lit glimpse
   * of the inside), threshold, a lamp over the door (real light pool at night via the fixture pool), optional sign.
   * Wc = world cell, Fr = LI.doorFrame(...), fy = ground y. o: {w, h, frame, leaf, glass, ajar (±1 = which leaf),
   * voidK, lamp:'deco'|'cage'|false, lampColor, sign:{key, w, h}}. No colliders across the opening.
   */
  LI.doorway = function (Wc, Fr, fy, o) {
    o = o || {};
    const b = Wc.b,
      w = o.w || 2.4,
      h = o.h || 3.0,
      fk = o.frame || "bronze",
      lk = o.leaf || fk,
      nb = { noBake: true },
      ry = Fr.ry;
    const bx = (key, u0, u1, y0, y1, v0, v1, e) =>
      Fr.box(
        Wc,
        key,
        u0,
        u1,
        v0,
        v1,
        fy + y0,
        fy + y1,
        Object.assign({}, nb, e || {}),
      );
    bx(fk, -w / 2 - 0.22, -w / 2, 0, h + 0.22, -0.05, 0.16);
    bx(fk, w / 2, w / 2 + 0.22, 0, h + 0.22, -0.05, 0.16); // jambs
    bx(fk, -w / 2 - 0.22, w / 2 + 0.22, h, h + 0.22, -0.05, 0.16); // head
    bx(
      o.sill || "granite_black",
      -w / 2 - 0.3,
      w / 2 + 0.3,
      0,
      0.05,
      -0.05,
      0.55,
    ); // threshold
    if (o.voidK) {
      const c = Fr.p(0, -0.02);
      b.quad(o.voidK, c[0], fy + h / 2, c[1], w, h, ry + Math.PI, {
        noBake: true,
        noAO: true,
      });
    }
    const lw = w / 2 - 0.02,
      aj = o.ajar || 0;
    if (o.single) {
      // one leaf: panelled, wired-glass light, knob
      bx(lk, -w / 2 + 0.01, w / 2 - 0.01, 0.02, h - 0.02, -0.02, 0.04);
      if (o.glass !== false)
        bx(
          o.glass || "glass_dark",
          -w / 2 + 0.22,
          w / 2 - 0.22,
          h * 0.58,
          h - 0.3,
          0.04,
          0.05,
        );
      for (const yy of [0.25, h * 0.3])
        bx(fk, -w / 2 + 0.16, w / 2 - 0.16, yy, yy + h * 0.2, 0.04, 0.055);
      bx("brass", w / 2 - 0.2, w / 2 - 0.12, 1.0, 1.08, 0.04, 0.12);
    }
    for (const s of o.single ? [] : [-1, 1]) {
      const cu = (s * w) / 4;
      if (aj === s) {
        const hu = (s * w) / 2,
          a = 0.9,
          c = Fr.p(
            hu - (s * Math.cos(a) * lw) / 2,
            0.02 + (Math.sin(a) * lw) / 2,
          );
        b.obox(lk, c[0], fy + h / 2, c[1], lw, h - 0.04, 0.06, ry - s * a, nb);
        continue;
      }
      bx(lk, cu - lw / 2, cu + lw / 2, 0.02, h - 0.02, -0.02, 0.04);
      if (o.glass !== false)
        bx(
          o.glass || "glass_dark",
          cu - lw / 2 + 0.14,
          cu + lw / 2 - 0.14,
          h * 0.35,
          h - 0.25,
          0.04,
          0.05,
        );
      bx(
        "brass",
        cu - s * (lw / 2 - 0.12) - 0.025,
        cu - s * (lw / 2 - 0.12) + 0.025,
        0.95,
        1.4,
        0.05,
        0.11,
      );
    }
    if (o.lamp !== false) {
      const lc = o.lampColor === undefined ? 0xffd8a0 : o.lampColor,
        c = Fr.p(0, 0.35);
      if (o.lamp === "cage") {
        b.cyl("rust", c[0], fy + h + 0.28, c[1], 0.1, 0.12, 0.08, 8, nb);
        b.cyl("lamp_amber", c[0], fy + h + 0.36, c[1], 0.08, 0.09, 0.2, 8, nb);
        b.cyl("rust", c[0], fy + h + 0.56, c[1], 0.05, 0.1, 0.06, 8, nb);
      } else {
        bx(fk, -0.35, 0.35, h + 0.3, h + 0.36, 0, 0.45);
        bx("lamp", -0.28, 0.28, h + 0.27, h + 0.3, 0.08, 0.4);
      }
      Wc.glow(c[0], fy + h + 0.25, c[1], lc, 0.8, {
        fixture: true,
        intensity: 1.2,
        range: 8,
        dayFactor: 0.25,
      });
    }
    if (o.sign) {
      const c = Fr.p(0, 0.18);
      b.quad(
        o.sign.key,
        c[0],
        fy + h + (o.sign.y || 0.75),
        c[1],
        o.sign.w || w,
        o.sign.h || 0.45,
        ry + Math.PI,
        nb,
      );
    }
  };

  // =====================================================================
  // Shared skyline panorama (window cards: Rainbow Room ring, Woolworth crown lancets, …)
  // =====================================================================
  LI.skyCards = LI.skyCards || [];
  /**
   * Painted ruined-Manhattan panorama with atmospheric depth: haze-lit far towers, mid towers with broken tops,
   * near towers with window grids and a few lit windows, rivers/park bands, cloud streaks, landmark silhouettes.
   * opts: {W, H, seed, horizon (0..1), kind:'city'|'harbor'|'bridge', water:[[u0,u1],…], park:[[u0,u1],…],
   *        marks:[{u, kind:'esb'|'chrysler'|'spire'|'liberty'|'bridge'}]}. The material is registered as a sky card:
   * its glow follows the time of day and weather (LI.shaftTick).
   */
