// play-inline-624 06 — math
// Lines 1110-1455 of readable/play-inline-624.pretty.js (statement-aligned).
  function finish(A) {
    const n = A.vn;
    if (!n || !A.tn) return null;
    const pos = new Float32Array(n * 3),
      nrm = new Int8Array(n * 3),
      rc = new Uint8Array(n * 3),
      re = new Uint8Array(n * 3),
      rs = new Uint16Array(n);
    for (let v = 0; v < n; v++) {
      const p = A.vCell[v],
        k = 1 / A.pc[p];
      pos[v * 3] = A.px[p] * k;
      pos[v * 3 + 1] = A.py[p] * k;
      pos[v * 3 + 2] = A.pz[p] * k;
      let x = A.vN[v * 3],
        y = A.vN[v * 3 + 1],
        z = A.vN[v * 3 + 2];
      const l = Math.sqrt(x * x + y * y + z * z);
      if (l > 1e-9) {
        x /= l;
        y /= l;
        z /= l;
      } else {
        x = 0;
        y = 1;
        z = 0;
      }
      nrm[v * 3] = Math.round(x * 127);
      nrm[v * 3 + 1] = Math.round(y * 127);
      nrm[v * 3 + 2] = Math.round(z * 127);
      const w = A.vW[v] > 0 ? 1 / A.vW[v] : 0;
      for (let j = 0; j < 3; j++) {
        // stored as sqrt (decoded x² in the shader): dark linear tones keep their precision
        rc[v * 3 + j] = Math.round(
          Math.sqrt(Math.min(1, Math.max(0, A.vC[v * 3 + j] * w))) * 255,
        );
        re[v * 3 + j] = Math.round(
          Math.sqrt(Math.min(1, Math.max(0, A.vE[v * 3 + j] * w))) * 255,
        );
      }
      rs[v] = A.vSlot[v];
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("normal", new THREE.BufferAttribute(nrm, 3, true));
    geo.setAttribute("rpC", new THREE.BufferAttribute(rc, 3, true));
    geo.setAttribute("rpE", new THREE.BufferAttribute(re, 3, true));
    geo.setAttribute("rpS", new THREE.BufferAttribute(rs, 1));
    const tri = A.tri.subarray(0, A.tn);
    geo.setIndex(
      new THREE.BufferAttribute(
        n < 65536 ? Uint16Array.from(tri) : tri.slice(),
        1,
      ),
    );
    geo.computeBoundingBox();
    geo.computeBoundingSphere();
    return geo;
  }

  // ------------------------------------------------------------------
  // Cells
  // ------------------------------------------------------------------
  function cellFor(x, z) {
    const ix = Math.floor(x / H.CELL),
      iz = Math.floor(z / H.CELL),
      key = ix * 100000 + iz;
    let c = H.cells.get(key);
    if (!c) {
      c = {
        key,
        ix,
        iz,
        units: [],
        baked: [],
        proxy: null,
        ready: false,
        far: false,
        dirty: false,
        due: 0,
        stale: false,
        x0: 0,
        y0: 0,
        z0: 0,
        x1: 0,
        y1: 0,
        z1: 0,
        src: null,
        srcU: null,
        vis: null,
        tris: 0,
        srcTris: 0,
        fails: 0,
      };
      H.cells.set(key, c);
      H.list.push(c);
    }
    return c;
  }
  function assign(u, late) {
    if (u.hcell || u.interior || u.dead) return;
    const c = cellFor(u.cx, u.cz);
    u.hcell = c;
    c.units.push(u);
    // a unit adopted after its cell was baked (late builders, quest set pieces, newGame spawns):
    // rebuild the cell once things have settled — only if it brings something bakeable
    if (late && (c.done || H.jobCell === c) && !u.frozen) {
      const lods = lodObjects();
      const iv = camIndoors();
      for (const m of u.meshes)
        if (bakeable(m, lods, iv)) {
          markDirty(c, 5000);
          break;
        }
    }
  }
  H.assignAll = function (late) {
    for (const u of R.units)
      if (!u.hcell && !u.interior && !u.dead) assign(u, late);
  };

  function setFar(c, far) {
    if (c.far === far) return;
    c.far = far;
    for (const u of c.baked) {
      u.hf = far;
      R.apply(u);
    }
    if (!far && c.proxy) c.proxy.visible = false;
  }
  function markDirty(c, delay) {
    setFar(c, false);
    if (c.proxy) c.proxy.visible = false;
    c.ready = false;
    if (!c.dirty) H.stats.rebuilds++;
    c.dirty = true;
    c.due = Math.max(
      c.due || 0,
      performance.now() + (delay === undefined ? 2500 : delay),
    );
    if (H.jobCell === c) c.stale = true;
  }
  /** Called by the validation sweep when a unit's meshes moved / changed / left. */
  R.hlodInvalidate = function (u) {
    const c = u.hcell;
    if (u.hf) {
      u.hf = false;
      R.apply(u);
    }
    if (u.hb) {
      u.hb = null;
      u.hbAll = false;
      u.hInv = (u.hInv || 0) + 1;
      if (u.hInv >= 2) u.noHlod = true;
    }
    if (
      c &&
      (c.ready || H.jobCell === c) &&
      (c.baked.indexOf(u) >= 0 || H.jobCell === c)
    )
      markDirty(c);
  };

  function* buildJob(c) {
    const lods = lodObjects();
    const ignoreVis = camIndoors();
    c.builtIndoors = ignoreVis;
    const A = newAcc(c);
    const baked = [],
      src = [],
      srcU = [];
    c.units = c.units.filter((u) => !u.dead && u.hcell === c);
    for (const u of c.units) {
      u.hbNext = null;
      if (
        u.frozen ||
        u.noHlod ||
        u.dead ||
        !u.root ||
        u.root.parent !== G.scene
      )
        continue;
      const ms = u.meshes,
        hb = new Uint8Array(ms.length);
      let any = false;
      for (let i = 0; i < ms.length; i++)
        if (bakeable(ms[i], lods, ignoreVis)) {
          hb[i] = 1;
          any = true;
        }
      WORK += 30 * ms.length;
      if (WORK >= 3000) {
        WORK = 0;
        yield;
      }
      if (!any) continue;
      u.hbNext = hb;
      baked.push(u);
      for (let i = 0; i < ms.length; i++) {
        if (!hb[i]) continue;
        src.push(ms[i]);
        srcU.push(u);
        yield* addMesh(A, ms[i]);
        WORK += 200;
        if (WORK >= 3000) {
          WORK = 0;
          yield;
        }
      }
    }
    return { A, baked, src, srcU };
  }
  function install(c, res) {
    const t0 = performance.now();
    const geo = finish(res.A);
    const dt = performance.now() - t0;
    if (dt > (H.stats.finishWorst || 0)) H.stats.finishWorst = +dt.toFixed(1);
    // units that were baked last time but not now: make sure they are not left hidden
    for (const u of c.baked)
      if (res.baked.indexOf(u) < 0) {
        u.hb = null;
        u.hbAll = false;
        if (u.hf) {
          u.hf = false;
          R.apply(u);
        }
      }
    if (!geo) {
      if (c.proxy) {
        c.proxy.geometry.dispose();
        H.root.remove(c.proxy);
        c.proxy = null;
      }
      c.baked = [];
      c.src = c.srcU = c.vis = null;
      c.ready = false;
      c.dirty = false;
      return performance.now() - t0;
    }
    for (const u of res.baked) {
      if (u.hf) {
        u.hf = false;
        R.apply(u);
      }
      u.hb = u.hbNext;
      u.hbNext = null;
      let all = true;
      for (let i = 0; i < u.hb.length; i++)
        if (!u.hb[i]) {
          all = false;
          break;
        }
      u.hbAll = all; // every mesh is in the proxy: the cull pass can skip the unit while its cell is far
    }
    c.baked = res.baked;
    c.src = res.src;
    c.srcU = res.srcU;
    c.vis = new Uint8Array(res.src.length).fill(1);
    const A = res.A;
    c.x0 = A.bx0;
    c.y0 = A.by0;
    c.z0 = A.bz0;
    c.x1 = A.bx1;
    c.y1 = A.by1;
    c.z1 = A.bz1;
    for (const u of res.baked) {
      // the unit boxes may reach further than the baked meshes
      if (u.x0 < c.x0) c.x0 = u.x0;
      if (u.y0 < c.y0) c.y0 = u.y0;
      if (u.z0 < c.z0) c.z0 = u.z0;
      if (u.x1 > c.x1) c.x1 = u.x1;
      if (u.y1 > c.y1) c.y1 = u.y1;
      if (u.z1 > c.z1) c.z1 = u.z1;
    }
    c.srcTris = A.srcTris;
    c.tris = A.tn / 3;
    c.verts = A.vn;
    if (!c.proxy) {
      const mesh = new THREE.Mesh(geo, material());
      mesh.name = "rp_hlod_" + c.ix + "_" + c.iz;
      mesh.matrixAutoUpdate = false;
      mesh.matrixWorldAutoUpdate = false;
      mesh.castShadow = false;
      mesh.receiveShadow = true;
      mesh.raycast = function () {
        /* proxies are never hit */
      };
      mesh.visible = false;
      mesh.userData.rpNoCull = true;
      mesh.userData.rpNoFreeze = true;
      H.root.add(mesh);
      mesh.updateMatrixWorld(true);
      c.proxy = mesh;
      // first proxy: compile its program now (in parallel), not on the frame it first comes into view
      if (!H.compiled && !G.SMOKE && !G.SHOT && R.prewarmPrograms) {
        H.compiled = true;
        setTimeout(() => {
          try {
            R.prewarmPrograms(true);
          } catch (e) {
            /* optional */
          }
        }, 0);
      }
    } else {
      const old = c.proxy.geometry;
      c.proxy.geometry = geo;
      old.dispose();
      c.proxy.visible = false;
    }
    // the CPU copies are not needed after the upload (JS heap: the city is big enough already)
    for (const k in geo.attributes) geo.attributes[k].onUpload(freeArray);
    if (geo.index) geo.index.onUpload(freeArray);
    c.ready = true;
    c.dirty = false;
    c.far = false;
    H.stats.builds++;
    return performance.now() - t0;
  }
  function freeArray() {
    this.array = new this.array.constructor(0);
  }

  function pickNext(cam) {
    const now = performance.now();
    let best = null,
      bs = Infinity;
    const cx = cam ? cam.x : 0,
      cz = cam ? cam.z : 0;
    for (const c of H.list) {
      if (c.ready || (c.dirty && c.due > now) || c.fails > 2 || !c.units.length)
        continue;
      if (c.done && !c.dirty) continue;
      const dx = Math.max(0, Math.abs((c.ix + 0.5) * H.CELL - cx) - H.CELL / 2),
        dz = Math.max(0, Math.abs((c.iz + 0.5) * H.CELL - cz) - H.CELL / 2);
      const d = Math.sqrt(dx * dx + dz * dz);
      // the ones about to be needed first (just beyond the switch distance), the near ones last
      const s = d >= H.D * 0.75 ? d : d + 1e5;
      if (s < bs) {
        bs = s;
        best = c;
      }
    }
    return best;
  }
  /** Progressive builder. Returns ms spent. */
