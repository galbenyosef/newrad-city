// play-inline-624 05 — mat
// Lines 774-1109 of readable/play-inline-624.pretty.js (statement-aligned).
  function* addMesh(A, m) {
    const g = m.geometry,
      pos = g.attributes.position,
      idx = g.index;
    const uv = g.attributes.uv,
      col = g.attributes.color;
    const nVert = pos.count;
    if (WP.length < nVert * 3) {
      WP = new Float32Array(nVert * 3);
      CID = new Int32Array(nVert);
    }
    const plain =
      !pos.isInterleavedBufferAttribute &&
      !pos.normalized &&
      pos.array instanceof Float32Array &&
      pos.itemSize === 3;
    const P = pos.array;
    const insts = m.isInstancedMesh ? m.count : 1;
    const groups =
      g.groups && g.groups.length
        ? g.groups
        : [{ start: 0, count: idx ? idx.count : nVert, materialIndex: 0 }];
    const dr0 = g.drawRange.start,
      dr1 =
        g.drawRange.count === Infinity
          ? Infinity
          : g.drawRange.start + g.drawRange.count;
    const minA = 0.01 * A.g * A.g;
    for (let ins = 0; ins < insts; ins++) {
      if (m.isInstancedMesh) {
        m.getMatrixAt(ins, _im);
        _m4.multiplyMatrices(m.matrixWorld, _im);
      } else _m4.copy(m.matrixWorld);
      let ir = 1,
        igc = 1,
        ib = 1;
      if (m.isInstancedMesh && m.instanceColor) {
        m.getColorAt(ins, _ic);
        ir = _ic.r;
        igc = _ic.g;
        ib = _ic.b;
      }
      const e = _m4.elements;
      const flipW = _m4.determinant() < 0;
      // 1. world positions + position clusters
      for (let v = 0; v < nVert; v++) {
        let x, y, z;
        if (plain) {
          x = P[v * 3];
          y = P[v * 3 + 1];
          z = P[v * 3 + 2];
        } else {
          x = pos.getX(v);
          y = pos.getY(v);
          z = pos.getZ(v);
        }
        const wx = e[0] * x + e[4] * y + e[8] * z + e[12],
          wy = e[1] * x + e[5] * y + e[9] * z + e[13],
          wz = e[2] * x + e[6] * y + e[10] * z + e[14];
        WP[v * 3] = wx;
        WP[v * 3 + 1] = wy;
        WP[v * 3 + 2] = wz;
        CID[v] = cellId(A, wx, wy, wz);
        if (wx < A.bx0) A.bx0 = wx;
        if (wx > A.bx1) A.bx1 = wx;
        if (wy < A.by0) A.by0 = wy;
        if (wy > A.by1) A.by1 = wy;
        if (wz < A.bz0) A.bz0 = wz;
        if (wz > A.bz1) A.bz1 = wz;
        if (++WORK >= 4000) {
          WORK = 0;
          yield;
        }
      }
      // 2. triangles per material group
      for (const gr of groups) {
        const mat = Array.isArray(m.material)
          ? m.material[gr.materialIndex | 0]
          : m.material;
        if (!mat) continue;
        // a texture read-back (≈ 3–8 ms) gets a slice of its own
        if (WORK > 300 && (needSat(mat.map) || needSat(mat.emissiveMap))) {
          WORK = 0;
          yield;
        }
        const slot = getSlot(mat);
        const basic = !!mat.isMeshBasicMaterial;
        const tiMap = uv ? texInfo(mat.map) : null;
        const tiEm = uv && !basic ? texInfo(mat.emissiveMap) : null;
        const allMap = !uv && mat.map ? texInfo(mat.map) : null;
        const allEm =
          !uv && !basic && mat.emissiveMap ? texInfo(mat.emissiveMap) : null;
        if (satBuilt) {
          satBuilt = false;
          yield;
        }
        const useVC = !!(mat.vertexColors && col);
        const flip = (mat.side === THREE.BackSide) !== flipW;
        const s0 = Math.max(gr.start, dr0),
          s1 = Math.min(gr.start + gr.count, dr1, idx ? idx.count : nVert);
        const I = idx ? idx.array : null;
        let tmR = 1,
          tmG = 1,
          tmB = 1,
          emR = 1,
          emG = 1,
          emB = 1;
        if (allMap) {
          tmR = allMap.s.all[0];
          tmG = allMap.s.all[1];
          tmB = allMap.s.all[2];
        }
        if (allEm) {
          emR = allEm.s.all[0];
          emG = allEm.s.all[1];
          emB = allEm.s.all[2];
        }
        for (let t = s0; t + 2 < s1; t += 3) {
          let a = I ? I[t] : t,
            b = I ? I[t + 1] : t + 1,
            c = I ? I[t + 2] : t + 2;
          if (flip) {
            const q = b;
            b = c;
            c = q;
          }
          const ca = CID[a],
            cb = CID[b],
            cc = CID[c];
          A.srcTris++;
          if (++WORK >= 3000) {
            WORK = 0;
            yield;
          }
          if (ca < 0 || cb < 0 || cc < 0 || ca === cb || cb === cc || ca === cc)
            continue;
          const ax = WP[a * 3],
            ay = WP[a * 3 + 1],
            az = WP[a * 3 + 2];
          const e1x = WP[b * 3] - ax,
            e1y = WP[b * 3 + 1] - ay,
            e1z = WP[b * 3 + 2] - az;
          const e2x = WP[c * 3] - ax,
            e2y = WP[c * 3 + 1] - ay,
            e2z = WP[c * 3 + 2] - az;
          let nx = e1y * e2z - e1z * e2y,
            ny = e1z * e2x - e1x * e2z,
            nz = e1x * e2y - e1y * e2x;
          const l = Math.sqrt(nx * nx + ny * ny + nz * nz),
            area = 0.5 * l;
          if (!(area > minA)) continue;
          nx /= l;
          ny /= l;
          nz /= l;
          // texture colour over this triangle's UV rectangle
          let tr = tmR,
            tg = tmG,
            tb = tmB,
            er = emR,
            eg = emG,
            eb = emB;
          if (tiMap || tiEm) {
            const ua = uv.getX(a),
              va = uv.getY(a),
              ub = uv.getX(b),
              vb = uv.getY(b),
              uc = uv.getX(c),
              vc = uv.getY(c);
            if (tiMap) {
              const M = tiMap.m;
              const pa = M[0] * ua + M[3] * va + M[6],
                qa = M[1] * ua + M[4] * va + M[7];
              const pb = M[0] * ub + M[3] * vb + M[6],
                qb = M[1] * ub + M[4] * vb + M[7];
              const pcc = M[0] * uc + M[3] * vc + M[6],
                qc = M[1] * uc + M[4] * vc + M[7];
              const r = regionAvg(
                tiMap,
                Math.min(pa, pb, pcc),
                Math.min(qa, qb, qc),
                Math.max(pa, pb, pcc),
                Math.max(qa, qb, qc),
              );
              tr = r[0];
              tg = r[1];
              tb = r[2];
            }
            if (tiEm) {
              const M = tiEm.m;
              const pa = M[0] * ua + M[3] * va + M[6],
                qa = M[1] * ua + M[4] * va + M[7];
              const pb = M[0] * ub + M[3] * vb + M[6],
                qb = M[1] * ub + M[4] * vb + M[7];
              const pcc = M[0] * uc + M[3] * vc + M[6],
                qc = M[1] * uc + M[4] * vc + M[7];
              const r = regionAvg(
                tiEm,
                Math.min(pa, pb, pcc),
                Math.min(qa, qb, qc),
                Math.max(pa, pb, pcc),
                Math.max(qa, qb, qc),
              );
              er = r[0];
              eg = r[1];
              eb = r[2];
            }
          }
          const nb =
            (Math.round(nx * 2) + 2) * 25 +
            (Math.round(ny * 2) + 2) * 5 +
            (Math.round(nz * 2) + 2);
          const va2 = outVert(A, ca, nb, slot),
            vb2 = outVert(A, cb, nb, slot),
            vc2 = outVert(A, cc, nb, slot);
          const w = area;
          // per-corner vertex colours (AO / grime) × instance colour
          let ar = ir,
            ag = igc,
            ab = ib,
            br = ir,
            bg = igc,
            bb = ib,
            cr = ir,
            cg = igc,
            cbb = ib;
          if (useVC) {
            ar *= col.getX(a);
            ag *= col.getY(a);
            ab *= col.getZ(a);
            br *= col.getX(b);
            bg *= col.getY(b);
            bb *= col.getZ(b);
            cr *= col.getX(c);
            cg *= col.getY(c);
            cbb *= col.getZ(c);
          }
          if (basic) {
            // unlit: the whole texture × vertex colour is emitted (slot diffuse = 0)
            addCorner(
              A,
              va2,
              nx,
              ny,
              nz,
              0,
              0,
              0,
              tr * ar,
              tg * ag,
              tb * ab,
              w,
            );
            addCorner(
              A,
              vb2,
              nx,
              ny,
              nz,
              0,
              0,
              0,
              tr * br,
              tg * bg,
              tb * bb,
              w,
            );
            addCorner(
              A,
              vc2,
              nx,
              ny,
              nz,
              0,
              0,
              0,
              tr * cr,
              tg * cg,
              tb * cbb,
              w,
            );
          } else {
            addCorner(
              A,
              va2,
              nx,
              ny,
              nz,
              tr * ar,
              tg * ag,
              tb * ab,
              er,
              eg,
              eb,
              w,
            );
            addCorner(
              A,
              vb2,
              nx,
              ny,
              nz,
              tr * br,
              tg * bg,
              tb * bb,
              er,
              eg,
              eb,
              w,
            );
            addCorner(
              A,
              vc2,
              nx,
              ny,
              nz,
              tr * cr,
              tg * cg,
              tb * cbb,
              er,
              eg,
              eb,
              w,
            );
          }
          const k = A.tn;
          if (k + 3 > A.tri.length) A.tri = grow(A.tri, k + 3);
          A.tri[k] = va2;
          A.tri[k + 1] = vb2;
          A.tri[k + 2] = vc2;
          A.tn = k + 3;
        }
      }
    }
  }

  /** Accumulator → BufferGeometry (compact, quantised). */
