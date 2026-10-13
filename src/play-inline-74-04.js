// play-inline-74 04 — lights
// Lines 635-968 of readable/play-inline-74.pretty.js (statement-aligned).
  function result(st) {
    return {
      meshes: st.meshes,
      verts: st.verts,
      addedTris: st.added,
      rays: st.nRays,
      ms: Math.round(st.busy),
      lights: st.lights.length,
    };
  }
  function collect(root, auto) {
    const list = [];
    root.updateWorldMatrix(true, true);
    root.traverse((m) => {
      if (meshOk(m, auto)) list.push(m);
    });
    return list;
  }

  /** Synchronous bake of everything under root (see header). */
  RL.bakeInterior = function (root, opts) {
    if (!root) return { meshes: 0, verts: 0, addedTris: 0, rays: 0, ms: 0 };
    const st = makeState(
      root,
      collect(root, false),
      Object.assign(
        { users: geoUsers(G.scene && root !== G.scene ? G.scene : root) },
        opts || {},
      ),
    );
    runState(st, 1e9);
    return result(st);
  };
  const jobs = [];
  /** Same bake spread over frames (≤ opts.msPerFrame, default 4 ms). → {done, result, cancel()} */
  RL.bakeInteriorAsync = function (root, opts) {
    const job = {
      done: false,
      result: null,
      cancelled: false,
      cancel() {
        this.cancelled = true;
      },
    };
    if (!root) {
      job.done = true;
      return job;
    }
    job.st = makeState(
      root,
      collect(root, false),
      Object.assign({ users: geoUsers(G.scene) }, opts || {}),
    );
    job.ms = (opts && opts.msPerFrame) || 4;
    jobs.push(job);
    return job;
  };

  /** Irradiance multiplier at a point (same model as the bake): → THREE.Color */
  RL.bakedLightAt = function (pos, normal, opts) {
    const st = makeState(null, [], Object.assign({ maxRays: 64 }, opts || {}));
    return irradiance(
      new THREE.Color(),
      toV(pos),
      normal ? toV(normal).normalize() : null,
      st,
    );
  };

  // ------------------------------------------------------------------
  // AUTOMATIC interior bake
  // ------------------------------------------------------------------
  const cells = new Map(); // key → {key, origin, state:'queued'|'running'|'done'|'skipped', st, res}
  let auto = null; // current cell job
  function cellList() {
    const I = G.LAYOUT && G.LAYOUT.INTERIORS;
    if (!I) return [];
    return Object.keys(I)
      .filter((k) => I[k] && I[k].origin)
      .map((k) => ({ key: k, o: I[k].origin }));
  }
  function cellAt(x, z) {
    let best = null,
      bd = 1e18;
    for (const c of cellList()) {
      const d = (c.o.x - x) ** 2 + (c.o.z - z) ** 2;
      if (d < bd) {
        bd = d;
        best = c;
      }
    }
    return best && bd < 230 * 230 ? best : null;
  }
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
        return { color: e, lum };
      return null;
    }
    if (named && m.isMeshBasicMaterial && m.color)
      return { color: m.color, lum: 1 };
    return null;
  }
  function blocked(o) {
    for (let p = o; p; p = p.parent) {
      const u = p.userData;
      if (u && (u.rlNoBake || u.actor || u.isActor || u.npc || u.dynamic))
        return true;
      if (p.name && /^(atmos|rl_)/.test(p.name)) return true;
    }
    return false;
  }
  /** gather the cell's meshes + lamp clusters (one scene traversal) */
  function prepareCell(c) {
    const ox = c.o.x,
      oz = c.o.z,
      HALF = 200;
    const skipObjs = new Set();
    try {
      for (const d of (G.world && G.world.interactables) || []) {
        const ob = d && (d.object || d.mesh || d.obj);
        if (ob && ob.isObject3D) skipObjs.add(ob);
      }
    } catch (e) {
      /* ignore */
    }
    const list = [],
      clusters = new Map();
    const box = new THREE.Box3(),
      ctr = new THREE.Vector3();
    G.scene.updateMatrixWorld(); // only dirty matrices (a forced update of the whole city cost tens of ms)
    const inCell = (o) => {
      const g = o.geometry;
      if (!g.boundingBox) g.computeBoundingBox();
      box.copy(g.boundingBox).applyMatrix4(o.matrixWorld);
      box.getCenter(ctr);
      return Math.abs(ctr.x - ox) < HALF && Math.abs(ctr.z - oz) < HALF;
    };
    const skipUnder = new Set();
    G.scene.traverse((o) => {
      if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return;
      if (!inCell(o)) return;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      let info = null;
      for (const m of mats) {
        info = lampInfo(m);
        if (info) break;
      }
      if (info) {
        // lamp: cluster its vertices (sampled) into fixtures
        const pos = o.geometry.attributes.position,
          nor = o.geometry.attributes.normal;
        _m3.getNormalMatrix(o.matrixWorld);
        const step = Math.max(1, Math.floor(pos.count / 6000));
        for (let i = 0; i < pos.count; i += step) {
          _p.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
          if (nor) _n.fromBufferAttribute(nor, i).applyMatrix3(_m3).normalize();
          else _n.set(0, -1, 0);
          const k =
            Math.floor(_p.x / 1.6) +
            "," +
            Math.floor(_p.y / 1.6) +
            "," +
            Math.floor(_p.z / 1.6);
          let q = clusters.get(k);
          if (!q)
            clusters.set(
              k,
              (q = {
                n: 0,
                x: 0,
                y: 0,
                z: 0,
                nx: 0,
                ny: 0,
                nz: 0,
                r: 0,
                g: 0,
                b: 0,
                lum: 0,
                x0: 1e9,
                x1: -1e9,
                y0: 1e9,
                y1: -1e9,
                z0: 1e9,
                z1: -1e9,
              }),
            );
          q.n++;
          q.x += _p.x;
          q.y += _p.y;
          q.z += _p.z;
          q.nx += _n.x;
          q.ny += _n.y;
          q.nz += _n.z;
          q.r += info.color.r;
          q.g += info.color.g;
          q.b += info.color.b;
          q.lum += info.lum;
          if (_p.x < q.x0) q.x0 = _p.x;
          if (_p.x > q.x1) q.x1 = _p.x;
          if (_p.y < q.y0) q.y0 = _p.y;
          if (_p.y > q.y1) q.y1 = _p.y;
          if (_p.z < q.z0) q.z0 = _p.z;
          if (_p.z > q.z1) q.z1 = _p.z;
        }
        return;
      }
      if (skipObjs.has(o)) return;
      for (let p = o.parent; p; p = p.parent) if (skipObjs.has(p)) return;
      if (blocked(o) || !meshOk(o, true)) return;
      list.push(o);
    });
    const lights = [];
    for (const q of clusters.values()) {
      if (q.n < 3) continue;
      if (Math.max(q.x1 - q.x0, q.y1 - q.y0, q.z1 - q.z0) > 3.5) continue; // glowing wall panel / sign, not a fixture
      const n = q.n;
      _n.set(q.nx, q.ny, q.nz);
      if (_n.lengthSq() < 0.01 * n * n) _n.set(0, -1, 0);
      else _n.normalize();
      const col = new THREE.Color(q.r / n, q.g / n, q.b / n);
      const mx = Math.max(col.r, col.g, col.b, 1e-3);
      col.multiplyScalar(1 / mx); // hue only
      const lum = q.lum / n;
      lights.push({
        pos: [
          q.x / n + _n.x * 0.35,
          q.y / n + _n.y * 0.35,
          q.z / n + _n.z * 0.35,
        ],
        color: col,
        intensity: Math.min(1.6, 0.7 + lum * 0.5),
        range: 8 + Math.min(4, Math.sqrt(n) * 0.4),
        _w: lum * Math.sqrt(n),
        down: _n.y < -0.5,
      });
    }
    lights.sort((a, b) => b._w - a._w);
    if (lights.length > 220) lights.length = 220;
    return { list, lights };
  }
  function startCell(c) {
    let rec = cells.get(c.key);
    if (!rec) cells.set(c.key, (rec = { key: c.key, c, state: "queued" }));
    if (rec.state !== "queued") return rec;
    const t0 = performance.now();
    const { list, lights } = prepareCell(c);
    rec.lamps = lights.length;
    rec.prepMs = Math.round(performance.now() - t0);
    rec.lights = lights; // also the interior's virtual lights (50_lights.js)
    if (lights.length < 2 || !list.length) {
      rec.state = "skipped";
      return rec;
    }
    // auto bake stays close to the builders' own lighting: 85 % away from lamps, warm pools
    // big horizontal surfaces (floors, ceilings) first: they get the subdivision budget and show the pools
    const area = (m) => {
      const g = m.geometry;
      if (!g.boundingBox) g.computeBoundingBox();
      const b = g.boundingBox,
        sc = m.matrixWorld.getMaxScaleOnAxis() || 1;
      return (b.max.x - b.min.x) * (b.max.z - b.min.z) * sc * sc;
    };
    list.sort((a, b) => area(b) - area(a));
    rec.st = makeState(null, list, {
      lights,
      ambient: 0xf2efe6,
      ambientInt: 0.72,
      falloff: 0.05,
      compress: 0.9,
      ao: 0,
      maxEdge: 1.25,
      maxAddTris: G.SMOKE ? 20000 : 120000,
      maxRays: G.SMOKE ? 4000 : 60000,
      visCell: 1.0,
      defer: true,
      users: sceneUsers(),
    });
    rec.state = "running";
    return rec;
  }
  /** interior lamps of the cell at (x, z) for the virtual lights — from the bake's scan, or a
   *  lamp-only scan (once per cell) when the auto bake is off */
  const lampOnly = new Map();
  R.cellLampsAt = function (x, z) {
    const c = cellAt(x, z);
    if (!c) return null;
    const rec = cells.get(c.key);
    if (rec && rec.lights) return rec.lights;
    if (RL.autoBake && B_ready) return null; // the bake's own scan runs this frame / next
    let l = lampOnly.get(c.key);
    if (!l) {
      try {
        l = prepareCell(c).lights;
      } catch (e) {
        l = [];
      }
      lampOnly.set(c.key, l);
    }
    return l;
  };
  // geometry → user count (shared-geometry check before disposing a replaced one): one scene traversal
  // per 30 s at most, not one per cell
  let usersCache = null,
    usersAt = -1e9;
  function sceneUsers() {
    const now = performance.now();
    if (!usersCache || now - usersAt > 30000) {
      usersCache = geoUsers(G.scene);
      usersAt = now;
    }
    return usersCache;
  }
  let bgT = 0;
  /** Background baking (cells the player is NOT in) only while the game is paused in a UI — goggles,
   *  dialogue, terminal, map, menus, loading. render_perf measured 114–283 ms spikes while walking
   *  5th Ave when it ran during play: starting a cell (scene scan + lamp clustering) and subdividing a
   *  big merged mesh are not sliceable. The player's own cell still bakes in the foreground (6 ms/frame)
   *  right after the door fade. */
  function bgAllowed() {
    if (G.SMOKE || G.SHOT || G.SURVEY) return false;
    const st = G.state;
    return st !== "play" && st !== "dead" && st !== "cutscene";
  }
