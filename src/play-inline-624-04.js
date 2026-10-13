// play-inline-624 04 — grow
// Lines 612-773 of readable/play-inline-624.pretty.js (statement-aligned).
  function newAcc(cell) {
    if (!ACC) {
      const bits = 16;
      ACC = {
        bits,
        hk: new Int32Array(1 << bits),
        hv: new Int32Array(1 << bits).fill(-1),
        hn: 0,
        // position clusters
        pn: 0,
        px: new Float64Array(4096),
        py: new Float64Array(4096),
        pz: new Float64Array(4096),
        pc: new Float32Array(4096),
        ph: new Int32Array(4096),
        // output vertices
        vn: 0,
        vCell: new Int32Array(8192),
        vKey: new Int32Array(8192),
        vNext: new Int32Array(8192),
        vSlot: new Uint16Array(8192),
        vN: new Float32Array(8192 * 3),
        vC: new Float32Array(8192 * 3),
        vE: new Float32Array(8192 * 3),
        vW: new Float32Array(8192),
        tn: 0,
        tri: new Uint32Array(16384),
      };
    }
    const A = ACC;
    if (A.hn) A.hv.fill(-1);
    A.hn = 0;
    A.pn = 0;
    A.vn = 0;
    A.tn = 0;
    A.srcTris = 0;
    A.ox = (cell.ix + 0.5) * H.CELL;
    A.oz = (cell.iz + 0.5) * H.CELL;
    A.g = H.GRID;
    A.ig = 1 / H.GRID;
    A.bx0 = A.by0 = A.bz0 = Infinity;
    A.bx1 = A.by1 = A.bz1 = -Infinity;
    return A;
  }
  function rehash(A) {
    const ok = A.hk,
      ov = A.hv,
      bits = A.bits + 1,
      n = 1 << bits,
      mask = n - 1;
    const nk = new Int32Array(n),
      nvals = new Int32Array(n).fill(-1);
    for (let i = 0; i < ok.length; i++) {
      if (ov[i] < 0) continue;
      let h = Math.imul(ok[i], 0x9e3779b1) >>> (32 - bits);
      while (nvals[h] >= 0) h = (h + 1) & mask;
      nk[h] = ok[i];
      nvals[h] = ov[i];
    }
    A.hk = nk;
    A.hv = nvals;
    A.bits = bits;
  }
  /** Position cluster id of a world point (or -1 when out of the cell's local grid range). */
  function cellId(A, x, y, z) {
    const ix = Math.floor((x - A.ox) * A.ig),
      iy = Math.floor(y * A.ig),
      iz = Math.floor((z - A.oz) * A.ig);
    if (
      ix < -1024 ||
      ix > 1023 ||
      iz < -1024 ||
      iz > 1023 ||
      iy < -32 ||
      iy > 991
    )
      return -1;
    const key = ((ix + 1024) << 21) | ((iz + 1024) << 10) | (iy + 32);
    const mask = (1 << A.bits) - 1;
    let h = Math.imul(key, 0x9e3779b1) >>> (32 - A.bits);
    const hk = A.hk,
      hv = A.hv;
    while (hv[h] >= 0) {
      if (hk[h] === key) {
        const id = hv[h];
        A.px[id] += x;
        A.py[id] += y;
        A.pz[id] += z;
        A.pc[id]++;
        return id;
      }
      h = (h + 1) & mask;
    }
    const id = A.pn++;
    if (id >= A.px.length) {
      A.px = grow(A.px, id + 1);
      A.py = grow(A.py, id + 1);
      A.pz = grow(A.pz, id + 1);
      A.pc = grow(A.pc, id + 1);
      A.ph = grow(A.ph, id + 1);
    }
    A.px[id] = x;
    A.py[id] = y;
    A.pz[id] = z;
    A.pc[id] = 1;
    A.ph[id] = -1;
    hk[h] = key;
    hv[h] = id;
    if (++A.hn * 2 > hv.length) rehash(A);
    return id;
  }
  /** Output vertex for (position cluster, normal bucket, slot). */
  function outVert(A, pc, nb, slot) {
    const key = nb * 65536 + slot;
    for (let v = A.ph[pc]; v >= 0; v = A.vNext[v])
      if (A.vKey[v] === key) return v;
    const v = A.vn++;
    if (v >= A.vCell.length) {
      const n = v + 1;
      A.vCell = grow(A.vCell, n);
      A.vKey = grow(A.vKey, n);
      A.vNext = grow(A.vNext, n);
      A.vSlot = grow(A.vSlot, n);
      A.vN = grow(A.vN, n * 3);
      A.vC = grow(A.vC, n * 3);
      A.vE = grow(A.vE, n * 3);
      A.vW = grow(A.vW, n);
    }
    A.vCell[v] = pc;
    A.vKey[v] = key;
    A.vSlot[v] = slot;
    A.vNext[v] = A.ph[pc];
    A.ph[pc] = v;
    A.vN[v * 3] = A.vN[v * 3 + 1] = A.vN[v * 3 + 2] = 0;
    A.vC[v * 3] = A.vC[v * 3 + 1] = A.vC[v * 3 + 2] = 0;
    A.vE[v * 3] = A.vE[v * 3 + 1] = A.vE[v * 3 + 2] = 0;
    A.vW[v] = 0;
    return v;
  }
  function addCorner(A, v, nx, ny, nz, cr, cg, cb, er, eg, eb, w) {
    const i = v * 3;
    A.vN[i] += nx * w;
    A.vN[i + 1] += ny * w;
    A.vN[i + 2] += nz * w;
    A.vC[i] += cr * w;
    A.vC[i + 1] += cg * w;
    A.vC[i + 2] += cb * w;
    A.vE[i] += er * w;
    A.vE[i + 1] += eg * w;
    A.vE[i + 2] += eb * w;
    A.vW[v] += w;
  }

  // scratch per-vertex buffers
  let WP = new Float32Array(3 * 65536),
    CID = new Int32Array(65536);
  const _m4 = new THREE.Matrix4(),
    _im = new THREE.Matrix4(),
    _ic = new THREE.Color();

  let WORK = 0; // work units since the last yield (shared across meshes: small meshes add up)
  /** Generator: add one mesh's triangles (world space) to the accumulator; yields every few thousand items. */
