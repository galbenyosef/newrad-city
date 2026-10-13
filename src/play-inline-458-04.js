// play-inline-458 04 — pos
// Lines 610-680 of readable/play-inline-458.pretty.js (statement-aligned).
  function lipTube(ctr, radius, tilt, US, VS, swatch) {
    const pos = [],
      uv = [],
      idx = [];
    for (let i = 0; i <= US; i++) {
      const u = -1 + (2 * i) / US;
      const c = ctr(u),
        r = radius(u),
        tl = tilt(u);
      const ct = Math.cos(tl),
        st = Math.sin(tl);
      for (let k = 0; k <= VS; k++) {
        const a = (k / VS) * PI * 2;
        const ly = r[0] * Math.sin(a),
          lz = -r[1] * Math.cos(a); // front at a = 0
        // rotate about x by -tilt (front goes down for +tilt)
        const yy = ly * ct + lz * st,
          zz = -ly * st + lz * ct;
        pos.push(c[0], c[1] + yy, c[2] + zz);
        uv.push(
          (swatch[0] + swatch[2] * (i / US)) / FT,
          (swatch[1] + swatch[3] * (0.5 + 0.5 * Math.sin(a))) / FT,
        );
      }
    }
    const W = VS + 1;
    for (let i = 0; i < US; i++)
      for (let k = 0; k < VS; k++) {
        const a = i * W + k,
          b = a + 1,
          c = a + W,
          d = c + 1;
        idx.push(a, b, c, b, d, c); // CCW seen from outside
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    weldNormals(g);
    return g;
  }
  /** Replace a geometry's uv with face-map params projected from the head centre. */
  function projectUV(g, toUnit) {
    const pos = g.attributes.position,
      n = pos.count;
    const uv = new Float32Array(n * 2),
      o = [0, 0],
      u = [0, 0, 0];
    for (let i = 0; i < n; i++) {
      toUnit(pos.getX(i), pos.getY(i), pos.getZ(i), u);
      FM.param(u[0], u[1], u[2], o);
      uv[i * 2] = o[0];
      uv[i * 2 + 1] = o[1];
    }
    g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    return g;
  }
  /** Thin tube along an arc (lid margins, lash lines). */
  function arcTube(pts, r) {
    return P.sweep(pts, r, { seg: Math.max(6, pts.length), rs: 4 });
  }

  // ==================================================================
  // THE HEAD
  // ==================================================================
  /**
   * face: {skin, gender, hair, hairColor, beard, eyeColor, maniac, burn, scars,
   *        age (0..1), paint ('raider'|null), paintSeed, noseSize, jawW, brow,
   *        mutant, lipColor, angry, skinPaint, seed}
   */
