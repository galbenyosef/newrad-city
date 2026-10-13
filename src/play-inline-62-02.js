// play-inline-62 02 — color
// Lines 27-357 of readable/play-inline-62.pretty.js (statement-aligned).
  const A = G.atmos._,
    ATMOS = G.atmos,
    FX = G.fx;
  const { clamp } = A;

  // ------------------------------------------------------------------
  // Registered + scanned fixtures
  // ------------------------------------------------------------------
  const fixtures = []; // {x,y,z, color:Color, i, range, interior, glow, flicker, seed, removed}
  let scanned = false;
  const MAX_SCAN = 420;

  /**
   * Register a light fixture that may receive a real pool of light when the player is near.
   * opts: {intensity=1.2, range=8, glow=true (add a glow sprite), glowSize, flicker=0, always=false (also by day outdoors)}
   * Returns {remove()}.
   */
  ATMOS.addFixtureLight = function (pos, color, opts) {
    opts = opts || {};
    const p = A.v3(pos);
    const f = {
      x: p.x,
      y: p.y,
      z: p.z,
      color: A.color(color === undefined ? 0xffe2b0 : color),
      i: opts.intensity || 1.2,
      range: opts.range || 8,
      interior: A.isInteriorPos(p.x),
      always: !!opts.always,
      flicker: opts.flicker || 0,
      seed: Math.random() * 100,
      removed: false,
      glow: null,
    };
    if (opts.glow !== false && FX.glowSprite) {
      f.glow = FX.glowSprite(
        new THREE.Vector3(p.x, p.y, p.z),
        f.color,
        opts.glowSize || 1.2,
        { intensity: 0.7, dayFactor: 0.25, flicker: f.flicker },
      );
      if (f.glow) f.glow.noLight = true; // the fixture itself is the light candidate
    }
    fixtures.push(f);
    return {
      remove() {
        f.removed = true;
        if (f.glow) f.glow.dispose();
        const i = fixtures.indexOf(f);
        if (i >= 0) fixtures.splice(i, 1);
      },
    };
  };
  /** Convenience for interiors/props: a glow sprite + (when close) a real light. Same as addFixtureLight. */
  ATMOS.fixtureGlow = (pos, color, opts) =>
    ATMOS.addFixtureLight(pos, color, opts);

  // ------------------------------------------------------------------
  // Interior scan: find emissive lamp geometry and cluster it
  // ------------------------------------------------------------------
  function lampInfo(m) {
    if (!m || m.transparent || m.isShaderMaterial || m.isRawShaderMaterial)
      return null;
    const key = (m.userData && m.userData.mapKey) || "";
    const named =
      /@[^|]*lamp/.test(key) ||
      /(lamp|light|bulb|fixture|tube)/i.test(m.name || "");
    if (m.emissive && m.emissive.isColor) {
      const e = m.emissive,
        k = m.emissiveIntensity === undefined ? 1 : m.emissiveIntensity;
      const lum = (0.2126 * e.r + 0.7152 * e.g + 0.0722 * e.b) * k;
      if (lum >= (named ? 0.3 : 0.55) && (named || !m.emissiveMap))
        return { color: e.clone(), lum };
      return null;
    }
    if (named && m.isMeshBasicMaterial && m.color)
      return { color: m.color.clone(), lum: 1 };
    return null;
  }
  const _v = new THREE.Vector3(),
    _n = new THREE.Vector3(),
    _nm = new THREE.Matrix3(),
    _im = new THREE.Matrix4(),
    _wm = new THREE.Matrix4();
  function scanInteriors() {
    scanned = true;
    const L = G.LAYOUT;
    if (!L || !G.scene) return 0;
    const XMIN = L.INTERIOR_X_MIN;
    const cells = new Map();
    const CELL = 1.6;
    const add = (x, y, z, nx, ny, nz, info) => {
      const k =
        Math.floor(x / CELL) +
        "," +
        Math.floor(y / CELL) +
        "," +
        Math.floor(z / CELL);
      let c = cells.get(k);
      if (!c) {
        c = {
          n: 0,
          x: 0,
          y: 0,
          z: 0,
          nx: 0,
          ny: 0,
          nz: 0,
          x0: 1e9,
          x1: -1e9,
          y0: 1e9,
          y1: -1e9,
          z0: 1e9,
          z1: -1e9,
          r: 0,
          g: 0,
          b: 0,
          lum: 0,
        };
        cells.set(k, c);
      }
      c.n++;
      c.x += x;
      c.y += y;
      c.z += z;
      c.nx += nx;
      c.ny += ny;
      c.nz += nz;
      if (x < c.x0) c.x0 = x;
      if (x > c.x1) c.x1 = x;
      if (y < c.y0) c.y0 = y;
      if (y > c.y1) c.y1 = y;
      if (z < c.z0) c.z0 = z;
      if (z > c.z1) c.z1 = z;
      c.r += info.color.r;
      c.g += info.color.g;
      c.b += info.color.b;
      c.lum += info.lum;
    };
    G.scene.updateMatrixWorld(true);
    let meshes = 0;
    G.scene.traverse((o) => {
      if (!o.isMesh || o.isSkinnedMesh || !o.geometry || !o.material) return;
      if (o.name && o.name.indexOf("atmos") === 0) return;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      let info = null;
      for (const m of mats) {
        info = lampInfo(m);
        if (info) break;
      }
      if (!info) return;
      const geo = o.geometry;
      if (!geo.boundingBox) geo.computeBoundingBox();
      // world-space quick reject: only interiors
      _v.copy(geo.boundingBox.max).applyMatrix4(o.matrixWorld);
      const bx = _v.x;
      _v.copy(geo.boundingBox.min).applyMatrix4(o.matrixWorld);
      if (Math.max(bx, _v.x) < XMIN) return;
      meshes++;
      const pos = geo.attributes.position,
        nor = geo.attributes.normal;
      if (!pos) return;
      if (o.isInstancedMesh) {
        for (let i = 0; i < Math.min(o.count, 400); i++) {
          o.getMatrixAt(i, _im);
          _wm.multiplyMatrices(o.matrixWorld, _im);
          _v.set(0, 0, 0).applyMatrix4(_wm);
          if (_v.x >= XMIN) add(_v.x, _v.y, _v.z, 0, -1, 0, info);
        }
        return;
      }
      _nm.getNormalMatrix(o.matrixWorld);
      const step = Math.max(1, Math.floor(pos.count / 40000));
      for (let i = 0; i < pos.count; i += step) {
        _v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
        if (_v.x < XMIN) continue;
        if (nor) _n.fromBufferAttribute(nor, i).applyMatrix3(_nm).normalize();
        else _n.set(0, -1, 0);
        add(_v.x, _v.y, _v.z, _n.x, _n.y, _n.z, info);
      }
    });
    // cells → fixtures (biggest/brightest first, capped)
    const list = [];
    for (const c of cells.values()) {
      if (c.n < 3) continue;
      const ext = Math.max(c.x1 - c.x0, c.y1 - c.y0, c.z1 - c.z0);
      if (ext > 3.5) continue; // not a fixture (a glowing wall panel / sign)
      list.push(c);
    }
    list.sort(
      (a, b) => (b.lum / b.n) * Math.sqrt(b.n) - (a.lum / a.n) * Math.sqrt(a.n),
    );
    let made = 0;
    for (const c of list) {
      if (made >= MAX_SCAN) break;
      const n = c.n;
      const x = c.x / n,
        y = c.y / n,
        z = c.z / n;
      _n.set(c.nx, c.ny, c.nz);
      // light sits a little in front of the emitting face (below a ceiling tube, in front of a wall lamp)
      if (_n.lengthSq() < 0.01 * n * n) _n.set(0, -1, 0);
      else _n.normalize();
      const col = new THREE.Color(c.r / n, c.g / n, c.b / n);
      const mx = Math.max(col.r, col.g, col.b, 1e-3);
      col.multiplyScalar(1 / mx);
      const lum = c.lum / n;
      const ext = Math.max(c.x1 - c.x0, c.y1 - c.y0, c.z1 - c.z0);
      const f = {
        x: x + _n.x * 0.45,
        y: y + _n.y * 0.45,
        z: z + _n.z * 0.45,
        color: col,
        i: clamp(0.8 + lum * 0.35, 0.8, 1.6),
        range: clamp(6 + ext * 1.5, 6, 10),
        interior: true,
        always: true,
        flicker: 0,
        seed: Math.random() * 100,
        removed: false,
        glow: null,
        auto: true,
      };
      if (FX.glowSprite) {
        f.glow = FX.glowSprite(
          new THREE.Vector3(x + _n.x * 0.08, y + _n.y * 0.08, z + _n.z * 0.08),
          col,
          clamp(ext * 1.2 + 0.45, 0.45, 2.4),
          { intensity: clamp(0.35 + lum * 0.2, 0.35, 0.8), dayFactor: 1 },
        );
        if (f.glow) f.glow.noLight = true;
      }
      fixtures.push(f);
      made++;
    }
    A.fixtureScan = { meshes, cells: cells.size, fixtures: made };
    return made;
  }

  // ------------------------------------------------------------------
  // Slot manager
  // ------------------------------------------------------------------
  const slots = []; // {entry (pool record) | null, cand, k, target, key}
  let chooseT = 0;
  const cands = []; // scratch candidate list
  function candKey(c) {
    return c.obj || c.fix || c;
  }

  let rlOut = false,
    rlT = 0;
  function gather() {
    cands.length = 0;
    const cam = A.camPos,
      env = A.env;
    const inter = env.interior;
    // Outdoors, render_lighting's virtual lights already give every street lamp / neon / fire its pool
    // of light (up to 255 of them, tiled) — lending real PointLights there only doubled a pool and took
    // slots from combat flashes. Interiors keep the pooled lights (true falloff under the bake).
    if ((rlT -= 0.25) <= 0) {
      rlT = 2;
      rlOut = !!(A.rlVirtualLights && A.rlVirtualLights());
    }
    if (!inter && rlOut && !(G.QS && G.QS.get("fixtures") === "1")) return;
    for (const f of fixtures) {
      if (f.removed || f.interior !== inter) continue;
      if (!inter && !f.always && env.night < 0.35) continue;
      const dx = f.x - cam.x,
        dy = f.y - cam.y,
        dz = f.z - cam.z;
      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 > 28 * 28) continue;
      cands.push({
        fix: f,
        x: f.x,
        y: f.y,
        z: f.z,
        color: f.color,
        i: f.i,
        range: f.range,
        flicker: f.flicker,
        seed: f.seed,
        score: f.i / (d2 + 9),
      });
    }
    if (
      !inter &&
      env.night > 0.35 &&
      A.glowLightCands &&
      !(G.QS && G.QS.get("fixtures") === "0")
    ) {
      const n = A.glowLightCandN || 0;
      for (let k = 0; k < n; k++) {
        const c = A.glowLightCands[k];
        const dx = c.x - cam.x,
          dy = c.y - cam.y,
          dz = c.z - cam.z;
        const d2 = dx * dx + dy * dy + dz * dz;
        const inten = clamp(c.i, 0, 2);
        // lamps hang 3–10 m up: the light goes a bit below the head so it pools on the ground
        cands.push({
          obj: c.obj,
          x: c.x,
          y: c.y - 0.5,
          z: c.z,
          color: A.tmpC.setRGB(c.r, c.g, c.b).clone(),
          i: 0.55 + inten * 0.6,
          range: clamp(6 + c.size * 2.5, 7, 14),
          flicker: c.flicker,
          seed: c.seed,
          score: (inten * clamp(c.size, 0.5, 3)) / (d2 + 16),
        });
      }
    }
    cands.sort((a, b) => b.score - a.score);
  }

  function freeEntry() {
    const pool = A.flashPool || [];
    for (const f of pool) if (!f.fixture && f.t >= f.dur) return f;
    return null;
  }
  function release(sl) {
    if (sl.entry) {
      sl.entry.fixture = null;
      sl.entry.t = sl.entry.dur = 0;
      sl.entry.light.intensity = 0;
      sl.entry = null;
    }
  }

