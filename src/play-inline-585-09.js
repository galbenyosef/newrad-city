// play-inline-585 09 — three
// Lines 2312-2539 of readable/play-inline-585.pretty.js (statement-aligned).
  K.glowSet = function () {
    const pts = [];
    return {
      /** size = world metres; flick 0..1 (0 = steady bulb, 1 = candle); */
      add(x, y, z, color, size, flick) {
        pts.push({
          x,
          y,
          z,
          c: new THREE.Color(color === undefined ? 0xffb860 : color),
          s: size || 0.25,
          f: flick === undefined ? 1 : flick,
        });
        return this;
      },
      count: () => pts.length,
      finish(parent) {
        if (!pts.length) return null;
        const n = pts.length,
          pos = new Float32Array(n * 3),
          col = new Float32Array(n * 3),
          sz = new Float32Array(n),
          ph = new Float32Array(n),
          fl = new Float32Array(n);
        const r = K.rng(n * 7 + 3);
        pts.forEach((p, i) => {
          pos.set([p.x, p.y, p.z], i * 3);
          col.set([p.c.r, p.c.g, p.c.b], i * 3);
          sz[i] = p.s;
          ph[i] = r() * 100;
          fl[i] = p.f;
        });
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        g.setAttribute("color", new THREE.BufferAttribute(col, 3));
        g.setAttribute("size", new THREE.BufferAttribute(sz, 1));
        g.setAttribute("phase", new THREE.BufferAttribute(ph, 1));
        g.setAttribute("flick", new THREE.BufferAttribute(fl, 1));
        g.computeBoundingSphere();
        const m = new THREE.ShaderMaterial({
          uniforms: {
            map: { value: getGlowTex() },
            time: glowTime,
            scale: { value: 600 },
          },
          vertexShader: [
            "attribute float size; attribute float phase; attribute float flick; attribute vec3 color; varying vec3 vC; varying float vA;",
            "uniform float time; uniform float scale;",
            "void main(){",
            "  float f = 1.0 - flick * (0.18 + 0.18*sin(time*9.0+phase) + 0.12*sin(time*23.0+phase*1.7) + 0.1*sin(time*3.1+phase*0.3));",
            "  vC = color; vA = f;",
            "  vec4 mv = modelViewMatrix * vec4(position + vec3(0.0, flick*0.012*sin(time*7.0+phase), 0.0), 1.0);",
            "  gl_PointSize = clamp(size * f * scale / max(0.2, -mv.z), 1.0, 220.0);",
            "  gl_Position = projectionMatrix * mv;",
            "}",
          ].join("\n"),
          fragmentShader: [
            "uniform sampler2D map; varying vec3 vC; varying float vA;",
            "void main(){ vec4 t = texture2D(map, gl_PointCoord); gl_FragColor = vec4(vC * t.rgb * vA * 1.6, t.a * vA); }",
          ].join("\n"),
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          fog: false,
          toneMapped: false,
        });
        const P = new THREE.Points(g, m);
        P.frustumCulled = false;
        P.renderOrder = 5;
        P.name = "lair_glows";
        parent.add(P);
        return P;
      },
    };
  };

  // ------------------------------------------------------------------
  // Interactables (removed on demand); anchors
  // ------------------------------------------------------------------
  K.fires = K.fires || []; // {cell, x, y, z}: real fx fires started while the player is in that cell
  K.anchors = K.anchors || {};
  K.anchor = function (name, p, yaw) {
    const v = p.clone ? p.clone() : new THREE.Vector3(p.x, p.y, p.z);
    v.yaw = yaw || 0;
    K.anchors[name] = v;
    return v;
  };
  LR.anchor = function (name) {
    const a = K.anchors[name];
    if (!a) return null;
    const v = a.clone();
    v.yaw = a.yaw || 0;
    return v;
  };
  LR.anchors = () => Object.keys(K.anchors);
  K.interact = function (def) {
    return G.world.addInteractable(def);
  };

  // ------------------------------------------------------------------
  // Quest flags (main-story flags are prefixed ms_; outline names are read as a fallback)
  // ------------------------------------------------------------------
  // ------------------------------------------------------------------
  // Small reusable set pieces
  // ------------------------------------------------------------------
  /** One candle: wax column (+ drips), wick, wax pool decal, and a flickering flame glow. Returns the flame height. */
  K.candle = function (b, glows, x, y, z, h, r, o) {
    o = o || {};
    r = r || 0.03;
    h = h || 0.15;
    b.cyl(o.mat || "wax", x, y, z, r * 1.08, r, h, 7, {
      tint: o.tint || 0xf2e6c8,
      grime: 0.05,
      rows: 1,
    });
    if (h > 0.08 && !o.noDrip)
      b.cyl(
        "wax",
        x + r * 0.7,
        y + h * 0.35,
        z,
        r * 0.28,
        r * 0.18,
        h * 0.55,
        4,
        { tint: 0xece0c0, grime: 0, rows: 1 },
      );
    b.beam("iron", x, y + h, z, x, y + h + 0.018, z, 0.006, { grime: 0 });
    if (glows && !o.out)
      glows.add(
        x,
        y + h + 0.035,
        z,
        o.color || 0xffb050,
        o.size || 0.14 + r * 1.2,
        o.flick === undefined ? 1 : o.flick,
      );
    return y + h + 0.035;
  };
  /** A run of candles along a line (a shelf, a ledge, a step edge). Returns flame positions for aggregate lights. */
  K.candleRow = function (b, glows, ax, y, az, bx, bz, spacing, rng, o) {
    o = o || {};
    const L = Math.hypot(bx - ax, bz - az),
      n = Math.max(1, Math.floor(L / spacing));
    const out = [];
    for (let i = 0; i < n; i++) {
      if (rng() < (o.gaps || 0.15)) continue;
      const t = (i + 0.5) / n,
        jx = (rng() - 0.5) * (o.jitter || 0.05),
        jz = (rng() - 0.5) * (o.jitter || 0.05);
      const h =
          (o.hMin || 0.05) + rng() * ((o.hMax || 0.22) - (o.hMin || 0.05)),
        r = (o.rMin || 0.022) + rng() * ((o.rMax || 0.04) - (o.rMin || 0.022));
      const out1 = rng() < (o.outFrac || 0.08);
      const fy = K.candle(
        b,
        glows,
        ax + (bx - ax) * t + jx,
        y,
        az + (bz - az) * t + jz,
        h,
        r,
        { out: out1 },
      );
      if (!out1) out.push([ax + (bx - ax) * t, fy, az + (bz - az) * t]);
    }
    return out;
  };
  /** Half-ellipse wall fill (lunette) in a vertical plane: centre (cx, ys, cz) of the springing line, half-width a, rise h, facing yaw. */
  K.lunette = function (b, mat, cx, ys, cz, a, h, face, o) {
    const sh = new THREE.Shape();
    sh.moveTo(-a, 0);
    for (let i = 0; i <= 24; i++) {
      const t = (Math.PI * i) / 24;
      sh.lineTo(-a * Math.cos(t), h * Math.sin(t));
    }
    sh.lineTo(-a, 0);
    const g = new THREE.ShapeGeometry(sh, 1);
    // tessellate a little so the bake has vertices to light
    const pts = [];
    for (let j = 0; j <= 6; j++)
      for (let i = 0; i <= 16; i++) {
        const u = -a + (2 * a * i) / 16,
          vmax = h * Math.sqrt(Math.max(0, 1 - (u / a) * (u / a)));
        pts.push([u, (vmax * j) / 6]);
      }
    const pos = [],
      idx = [];
    pts.forEach((p) => pos.push(p[0], p[1], 0));
    for (let j = 0; j < 6; j++)
      for (let i = 0; i < 16; i++) {
        const k = j * 17 + i;
        idx.push(k, k + 1, k + 18, k, k + 18, k + 17);
      }
    const gg = new THREE.BufferGeometry();
    gg.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    gg.setIndex(idx);
    gg.computeVertexNormals();
    g.dispose();
    b.geo(mat, gg, Object.assign({ x: cx, y: ys, z: cz, ry: face }, o || {}));
    gg.dispose();
    return b;
  };

  K.Q = () => (K.live("quests") ? G.quests : null);
  K.flag = function (name) {
    const Q = K.Q();
    return Q ? Q.flag(name) : undefined;
  };
  K.setFlag = function (name, v) {
    const Q = K.Q();
    if (Q) Q.setFlag(name, v === undefined ? true : v);
  };
  /** Main-story flag: ms_<name>, then the outline's bare name. */
  K.ms = function (name) {
    const a = K.flag("ms_" + name);
    if (a !== undefined && a !== null) return a;
    return K.flag(name);
  };
  K.L = () => (K.live("quests") && G.quests.lib) || null;
  K.notify = function (text, opts) {
    K.safe("notify", () => G.notify(text, opts));
  };
  K.sfx = function (name, opts) {
    if (K.live("sfx")) K.safe("sfx", () => G.sfx.play(name, opts));
  };
  K.heroName = () => (G.HERO && G.HERO.name) || "Eli Wayte";
  K.heroFirst = () => String(K.heroName()).split(" ")[0];
