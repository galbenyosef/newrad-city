// play-inline-76 04 — math
// Lines 378-684 of readable/play-inline-76.pretty.js (statement-aligned).
  function push(
    x,
    y,
    z,
    r,
    g,
    b,
    i,
    range,
    cone,
    flicker,
    fire,
    seed,
    interior,
    always,
  ) {
    if (interior !== inside) return null;
    const dx = x - camX,
      dz = z - camZ,
      d2 = dx * dx + dz * dz;
    if (d2 > RSEL * RSEL) return null;
    let vis = 1;
    if (!interior && !always) vis = fire ? 0.4 + 0.6 * night : night;
    const e = i * vis * Math.max(r, g, b);
    if (e < 0.03) return null;
    // merge with a neighbour (same lamp seen by two sources: keep the stronger, it takes the larger range)
    const key =
      (Math.floor(x / MERGE) * 73856093) ^
      (Math.floor(y / MERGE) * 19349663) ^
      (Math.floor(z / MERGE) * 83492791);
    const prev = merge.get(key);
    if (prev) {
      if (prev.score >= e) {
        if (range > prev.range) prev.range = range;
        return null;
      }
      prev.dead = true;
    }
    const c = cand();
    c.x = x;
    c.y = y;
    c.z = z;
    c.r = r * vis;
    c.g = g * vis;
    c.b = b * vis;
    c.i = i;
    c.range = prev ? Math.max(range, prev.range) : range;
    c.cone = cone;
    c.flicker = flicker;
    c.fire = fire ? 1 : 0;
    c.seed = seed;
    c.key = key;
    c.score = e; // replaced by the view score below
    merge.set(key, c);
    return c;
  }

  const _v = new THREE.Vector3(),
    _s = new THREE.Vector3();
  let visFrame = 0;
  function effVisible(o) {
    let p = o,
      n = 0;
    while (p) {
      if (!p.visible) return false;
      if (p === G.scene) return true;
      p = p.parent;
      if (++n > 32) return false;
    }
    return false;
  }
  function gatherGlowField(rd) {
    const gf = findGlowField(rd);
    if (!gf || !gf.visible) return 0;
    const geo = gf.geometry,
      P = geo.attributes.position,
      C = geo.attributes.gcolor,
      Z = geo.attributes.size,
      F = geo.attributes.fl;
    if (!P || !C || !Z) return 0;
    const n = Math.min(
      P.count,
      geo.drawRange.count === Infinity ? P.count : geo.drawRange.count,
    );
    const pa = P.array,
      ca = C.array,
      za = Z.array,
      fa = F ? F.array : null;
    const e = gf.matrixWorld.elements,
      ident =
        e[0] === 1 &&
        e[5] === 1 &&
        e[10] === 1 &&
        e[12] === 0 &&
        e[13] === 0 &&
        e[14] === 0;
    let k = 0;
    for (let i = 0; i < n; i++) {
      const s = za[i];
      if (s < 1.6) continue; // indicator LEDs, tiny bulbs: glow only
      let x = pa[i * 3],
        y = pa[i * 3 + 1],
        z = pa[i * 3 + 2];
      if (!ident) {
        _v.set(x, y, z).applyMatrix4(gf.matrixWorld);
        x = _v.x;
        y = _v.y;
        z = _v.z;
      }
      // props' "interior" flag (fl ≥ 2) = a shop light that ignores daylight (storefront shells stand in the city)
      const fl = fa ? fa[i * 2] : 0,
        always = fl >= 1.5,
        fk = always ? fl - 2 : fl,
        interior = x >= XMIN;
      const r = ca[i * 3],
        g = ca[i * 3 + 1],
        b = ca[i * 3 + 2];
      const fire = isFire(r, g, b) && fk > 0.1;
      const range = Math.min(15, Math.max(6, 3 + s * 1.8));
      const inten = Math.min(1.5, Math.max(0.5, 0.35 + s * 0.16));
      // a lamp head well above the ground (lamp posts, pendants) throws its light down
      const cone = !fire && s >= 3 && s <= 7.5 ? (always ? 0.35 : 0.7) : 0;
      push(
        x,
        y - (cone > 0 ? 0.35 : 0),
        z,
        r,
        g,
        b,
        always ? inten * 0.8 : inten,
        range,
        cone,
        fk,
        fire,
        fa ? fa[i * 2 + 1] * 100 : i,
        interior,
        always,
      );
      k++;
    }
    return k;
  }
  function gatherGlows() {
    let k = 0;
    visFrame++;
    for (let j = glows.length - 1; j >= 0; j--) {
      const o = glows[j];
      if (o._disposed) {
        glows.splice(j, 1);
        o._rlTracked = false;
        continue;
      }
      if (!o.parent || o.noLight) continue;
      const e = o.matrixWorld.elements;
      const x = e[12],
        y = e[13],
        z = e[14];
      const dx = x - camX,
        dz = z - camZ;
      if (dx * dx + dz * dz > RSEL * RSEL) continue;
      if (o._rlVisF === undefined || (visFrame + j) % 8 === 0) {
        o._rlVis = effVisible(o);
        o._rlVisF = visFrame;
      }
      if (!o._rlVis) continue;
      _s.set(e[0], e[1], e[2]);
      const size = (o.glowSize || 1) * _s.length();
      if (size < 1.0) continue;
      const c = o.material && o.material.color;
      if (!c) continue;
      const gi =
        Math.min(
          1.5,
          Math.max(0.2, o.glowIntensity === undefined ? 1 : o.glowIntensity),
        ) * (o.material.opacity === undefined ? 1 : o.material.opacity);
      const fire = isFire(c.r, c.g, c.b) && (o.flicker || 0) > 0.05;
      const interior = x >= XMIN;
      push(
        x,
        y - 0.3,
        z,
        c.r,
        c.g,
        c.b,
        Math.min(1.4, Math.max(0.4, 0.3 + size * 0.25)) * gi,
        Math.min(15, Math.max(6, 4 + size * 2.5)),
        0,
        o.flicker || 0,
        fire,
        o._seed || j,
        interior,
        false,
      );
      k++;
    }
    return k;
  }
  function gatherFixtures() {
    let k = 0;
    for (let j = fixtures.length - 1; j >= 0; j--) {
      const f = fixtures[j];
      if (f.removed) {
        fixtures.splice(j, 1);
        continue;
      }
      const c = f.color;
      push(
        f.x,
        f.y,
        f.z,
        c.r,
        c.g,
        c.b,
        f.i,
        f.range,
        0,
        f.flicker,
        isFire(c.r, c.g, c.b) && f.flicker > 0.05,
        f.seed,
        f.x >= XMIN,
        f.always,
      );
      k++;
    }
    for (const L of apiLights) {
      if (L.removed) continue;
      const c = L.color;
      push(
        L.x,
        L.y,
        L.z,
        c.r,
        c.g,
        c.b,
        L.i,
        L.range,
        L.cone,
        L.flicker,
        L.fire,
        L.seed,
        L.x >= XMIN,
        L.always,
      );
      k++;
    }
    return k;
  }
  function gatherTransients() {
    let k = 0;
    for (const T of trans) {
      const c = T.color;
      // combat light wins its tiles (×4 score): a shot in the dark must light the alley it is fired in
      const cd = push(
        T.x,
        T.y,
        T.z,
        c.r,
        c.g,
        c.b,
        T.i * 4,
        T.range,
        0,
        0,
        false,
        T.seed,
        T.x >= XMIN,
        true,
      );
      if (cd) {
        cd.tr = T;
        cd.i = T.i;
        k++;
      }
    }
    return k;
  }
  function gatherInterior() {
    if (!inside || !R.cellLampsAt) return 0;
    const lamps = R.cellLampsAt(camX, camZ);
    if (!lamps) return 0;
    let k = 0;
    for (const L of lamps) {
      const p = L.pos,
        c = L.color;
      // bake lamps: hue-normalised colour; ceiling fixtures shine down
      push(
        p[0],
        p[1],
        p[2],
        c.r,
        c.g,
        c.b,
        (L.intensity || 1.2) * 0.75,
        L.range || 9,
        L.down ? 0.3 : 0,
        0,
        false,
        k * 7.1,
        true,
        true,
      );
      k++;
    }
    return k;
  }

  const sel = [];
