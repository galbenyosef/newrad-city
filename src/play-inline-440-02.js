// play-inline-440 02 — three
// Lines 341-651 of readable/play-inline-440.pretty.js (statement-aligned).
  X.mat = function (key) {
    if (MATS[key]) return MATS[key];
    let m;
    const std = (o) => {
      const mm = new THREE.MeshStandardMaterial(
        Object.assign({ vertexColors: true }, o),
      );
      return mm;
    };
    switch (key) {
      case "metal":
        m = std({ map: X.ownTex("grime"), roughness: 0.62, metalness: 0.35 });
        break;
      case "paint":
        m = std({ map: X.ownTex("grime"), roughness: 0.48, metalness: 0.32 });
        break;
      case "chrome":
        m = std({ roughness: 0.3, metalness: 0.75, color: 0xdddddd });
        break;
      case "rust":
        m = std({
          map: X.tex("rust", "rust"),
          roughness: 0.92,
          metalness: 0.25,
          color: 0x9a9088,
        });
        break;
      case "concrete":
        m = std({
          map: X.tex("concrete", "concrete"),
          roughness: 0.96,
          metalness: 0,
        });
        break;
      case "wood":
        m = std({
          map: X.tex("wood_planks", "wood"),
          roughness: 0.88,
          metalness: 0,
        });
        break;
      case "fabric":
        m = std({ map: X.ownTex("fabric"), roughness: 1, metalness: 0 });
        break;
      case "plain":
        m = std({ roughness: 0.72, metalness: 0.05 });
        break;
      case "glass":
        m = std({ roughness: 0.12, metalness: 0.65, color: 0x9fb0ae });
        break;
      case "atlas":
        m = std({ map: X.atlasTexture(), roughness: 0.72, metalness: 0.12 });
        break;
      case "trim":
        m = std({ map: X.atlasTexture(), roughness: 0.42, metalness: 0.5 });
        break;
      case "glow":
        m = new THREE.MeshBasicMaterial({ vertexColors: true });
        break;
      case "screen":
        m = new THREE.MeshBasicMaterial({
          vertexColors: true,
          map: X.atlasTexture(),
        });
        break;
      case "chain":
        m = std({
          map: X.ownTex("chain"),
          alphaTest: 0.28,
          transparent: false,
          side: THREE.DoubleSide,
          roughness: 0.5,
          metalness: 0.6,
        });
        break;
      default:
        m = std({ roughness: 0.8 });
    }
    m.userData.shared = true;
    m.name = "props_" + key;
    MATS[key] = m;
    return m;
  };
  /** The atlas texture is created by 10_atlas.js; placeholder until then. */
  X.atlasTexture = function () {
    return X._atlasTex || null;
  };

  // ------------------------------------------------------------------
  // Geometry helpers
  // ------------------------------------------------------------------
  const _m4 = new THREE.Matrix4(),
    _q = new THREE.Quaternion(),
    _e = new THREE.Euler(),
    _p = new THREE.Vector3(),
    _s = new THREE.Vector3();
  function xform(o) {
    _e.set(o.rx || 0, o.ry || 0, o.rz || 0, o.order || "YXZ");
    _q.setFromEuler(_e);
    _p.set(o.x || 0, o.y || 0, o.z || 0);
    if (Array.isArray(o.s)) _s.set(o.s[0], o.s[1], o.s[2]);
    else {
      const s = o.s === undefined ? 1 : o.s;
      _s.set(s, s, s);
    }
    return _m4.compose(_p, _q, _s);
  }
  X.xform = xform;

  /** Box-projected UVs (metres * scale) chosen by dominant normal axis. */
  function boxUV(g, scale) {
    const p = g.attributes.position,
      n = g.attributes.normal,
      cnt = p.count;
    const uv = new Float32Array(cnt * 2);
    for (let i = 0; i < cnt; i++) {
      const ax = Math.abs(n.getX(i)),
        ay = Math.abs(n.getY(i)),
        az = Math.abs(n.getZ(i));
      let u, v;
      if (ay >= ax && ay >= az) {
        u = p.getX(i);
        v = p.getZ(i);
      } else if (ax >= az) {
        u = p.getZ(i);
        v = p.getY(i);
      } else {
        u = p.getX(i);
        v = p.getY(i);
      }
      uv[i * 2] = u * scale;
      uv[i * 2 + 1] = v * scale;
    }
    g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  }
  X.boxUV = boxUV;

  /**
   * Bake vertex colours: base colour x height-AO x grime noise x rust creep.
   * o: {color, colorFn(x,y,z)->Color|hex, ao:[min, height], grime:0..1, rust:0..1, rustColor, noiseScale, seed}
   */
  const RUST_C = new THREE.Color(X.PAL.rust),
    RUST_D = new THREE.Color(X.PAL.rustDark);
  function bakeColors(g, o, worldOff) {
    const p = g.attributes.position,
      cnt = p.count;
    const col = new Float32Array(cnt * 3);
    const base = X.color(o.color !== undefined ? o.color : 0xffffff);
    const aoMin = o.ao ? o.ao[0] : 0.62,
      aoH = o.ao ? o.ao[1] : 0.55;
    const grime = o.grime === undefined ? 0.18 : o.grime;
    const rust = o.rust || 0;
    const rc = o.rustColor ? X.color(o.rustColor) : RUST_C;
    const ns = o.noiseScale || 2.3,
      seed = o.seed || 0;
    const tmp = new THREE.Color();
    for (let i = 0; i < cnt; i++) {
      const x = p.getX(i),
        y = p.getY(i),
        z = p.getZ(i);
      if (o.colorFn) {
        const r = o.colorFn(x, y, z);
        tmp.set(r);
      } else tmp.copy(base);
      // ambient occlusion by height above the prop's ground plane
      const ao =
        aoMin >= 1
          ? 1
          : X.lerp(aoMin, 1, X.clamp((y - (o.aoY0 || 0)) / aoH, 0, 1));
      const n = X.noise3(x * ns + seed, y * ns, z * ns - seed);
      let k = ao * (1 - grime * n);
      if (rust > 0) {
        const rn =
          X.noise3(x * 3.1 + 7 + seed, y * 3.3, z * 2.9 + 3) +
          (1 - X.clamp(y / 1.2, 0, 1)) * 0.25;
        const t = X.smooth(1.05 - rust * 0.75, 1.2 - rust * 0.7, rn);
        if (t > 0) {
          tmp.lerp(rn > 0.9 ? RUST_D : rc, t);
        }
      }
      col[i * 3] = tmp.r * k;
      col[i * 3 + 1] = tmp.g * k;
      col[i * 3 + 2] = tmp.b * k;
    }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  }
  X.bakeColors = bakeColors;

  /**
   * Superellipse loft (car bodies, rounded cabinets, bus shells).
   * stations: [{z, wb, wt, yb, yt, n}] ordered along +z; wb/wt = half widths at bottom/top.
   * Returns indexed BufferGeometry with smooth normals and flat end faces.
   */
  X.loftGeometry = function (stations, seg, opts) {
    opts = opts || {};
    seg = seg || 16;
    const pos = [],
      idx = [];
    const se = (v, n) => Math.sign(v) * Math.pow(Math.abs(v), 2 / n);
    const ringStart = [];
    for (let i = 0; i < stations.length; i++) {
      const s = stations[i];
      ringStart.push(pos.length / 3);
      for (let j = 0; j < seg; j++) {
        const th = (j / seg) * X.TAU - Math.PI / 2;
        const n = s.n || 4;
        const ux = se(Math.cos(th), n),
          uy = se(Math.sin(th), n);
        const t = (uy + 1) / 2;
        const w = X.lerp(s.wb, s.wt, t);
        pos.push(ux * w + (s.x || 0), X.lerp(s.yb, s.yt, t), s.z);
      }
    }
    for (let i = 0; i < stations.length - 1; i++) {
      const a = ringStart[i],
        b = ringStart[i + 1];
      for (let j = 0; j < seg; j++) {
        const j2 = (j + 1) % seg;
        // rings run CCW (seen from +z) and advance along +z → this winding faces outward
        idx.push(a + j, a + j2, b + j, a + j2, b + j2, b + j);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    const parts = [g];
    // flat end faces (separate verts so edges stay crisp). start face looks -z, end face +z
    const cap = (si, isEnd) => {
      const s = stations[si],
        cp = [],
        ci = [];
      const cy = (s.yb + s.yt) / 2;
      cp.push(s.x || 0, cy, s.z);
      for (let j = 0; j < seg; j++) {
        const k = (ringStart[si] + j) * 3;
        cp.push(pos[k], pos[k + 1], pos[k + 2]);
      }
      for (let j = 0; j < seg; j++) {
        const j2 = (j + 1) % seg;
        if (isEnd) ci.push(0, 1 + j, 1 + j2);
        else ci.push(0, 1 + j2, 1 + j);
      }
      const cg = new THREE.BufferGeometry();
      cg.setAttribute("position", new THREE.Float32BufferAttribute(cp, 3));
      cg.setIndex(ci);
      cg.computeVertexNormals();
      parts.push(cg);
    };
    if (opts.capStart !== false) cap(0, false);
    if (opts.capEnd !== false) cap(stations.length - 1, true);
    if (parts.length === 1) return g;
    // merge (no uv/colour yet)
    return mergeRaw(parts);
  };
  function mergeRaw(parts) {
    let vc = 0,
      ic = 0;
    for (const p of parts) {
      vc += p.attributes.position.count;
      ic += p.index ? p.index.count : p.attributes.position.count;
    }
    const pos = new Float32Array(vc * 3),
      nor = new Float32Array(vc * 3),
      idx = new Uint32Array(ic);
    let vo = 0,
      io = 0;
    for (const p of parts) {
      pos.set(p.attributes.position.array, vo * 3);
      nor.set(p.attributes.normal.array, vo * 3);
      if (p.index) {
        for (let i = 0; i < p.index.count; i++)
          idx[io++] = p.index.array[i] + vo;
      } else
        for (let i = 0; i < p.attributes.position.count; i++)
          idx[io++] = i + vo;
      vo += p.attributes.position.count;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
    g.setIndex(new THREE.BufferAttribute(idx, 1));
    return g;
  }
  X.mergeRaw = mergeRaw;

  /** Extrude a 2D outline (array of [u,v]) by depth; shape plane XY, depth along +Z (centered). */
  X.extrudeGeometry = function (pts, depth, bevel) {
    const sh = new THREE.Shape();
    sh.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) sh.lineTo(pts[i][0], pts[i][1]);
    sh.closePath();
    const g = new THREE.ExtrudeGeometry(sh, {
      depth,
      bevelEnabled: !!bevel,
      bevelThickness: bevel || 0,
      bevelSize: bevel || 0,
      bevelSegments: 1,
      curveSegments: 4,
    });
    g.translate(0, 0, -depth / 2);
    return g;
  };

  // ------------------------------------------------------------------
  // Kit: builds a prototype from primitives. All positions in metres,
  // prop-local (y = 0 is the ground, -Z is the prop's "front").
  // Every primitive: (matKey, ...dims, x, y, z, opts) where (x,y,z) is the
  // CENTRE of the primitive; opts: {rx,ry,rz,s, color, colorFn, ao, grime,
  // rust, tint (instance tint applies), uv:'keep', uvScale, seg}.
  // ------------------------------------------------------------------
