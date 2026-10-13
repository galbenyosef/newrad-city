// play-inline-448 05 — car
// Lines 1113-1461 of readable/play-inline-448.pretty.js (statement-aligned).
  D("car_pickup", (k, r, v) => {
    const stripped = v === 1,
      dy = stripped ? -0.14 : 0;
    const po = {
      tint: true,
      rust: 0.45 + r() * 0.25,
      color: 0xf0f0ec,
      seg: 16,
      ao: [0.55, 0.9],
    };
    k.loft("paint", shift(PICKUP_HOOD, dy), po);
    k.loft("paint", shift(PICKUP_CAB, dy), po);
    k.box("trim", 1.6, 0.6, 0.05, 0, 1.55 + dy, -0.98, GL({ rx: 0.1 }));
    for (const s of [-1, 1])
      k.box("trim", 0.05, 0.5, 0.9, s * 0.99, 1.55 + dy, -0.25, GL({}));
    // bed
    k.boxB("paint", 2.0, 0.08, 2.4, 0, 0.55 + dy, 1.65, po);
    for (const s of [-1, 1])
      k.boxB("paint", 0.07, 0.55, 2.4, s * 0.98, 0.6 + dy, 1.65, po);
    k.boxB("paint", 2.0, 0.55, 0.07, 0, 0.6 + dy, 2.84, po);
    // junk in the bed
    X.crate(k, r, (r() * 5) | 0, -0.4, 0.63 + dy, 1.5, r(), 0.8);
    k.torus(
      "trim",
      0.3,
      0.11,
      0.45,
      0.75 + dy,
      2.1,
      T({ rx: PI / 2, color: C.rubber, tseg: 12, rseg: 5 }),
    );
    headlights(k, 0.95, 0.9 + dy, -2.55);
    grille(k, 0.8, 0.75 + dy, -2.62, 0.25);
    bumper(k, 1.0, 0.5 + dy, -2.7, false);
    bumper(k, 1.0, 0.5 + dy, 2.92, false);
    for (const wz of [-1.75, 1.8])
      for (const s of [-1, 1]) wheel(k, s * 0.88, 0.4, wz, 0.4, s, stripped);
    k.meta.size = [2.05, 5.7, 1.95 + dy];
  });

  // ------------------------------------------------------------------
  // CAR MANAGER
  // ------------------------------------------------------------------
  const KINDS = {
    sedan: { proto: "car_sedan", hp: 70, radius: 7, dmg: 110 },
    coupe: { proto: "car_coupe", hp: 65, radius: 7, dmg: 110 },
    taxi: { proto: "car_taxi", hp: 70, radius: 7, dmg: 110 },
    police: { proto: "car_police", hp: 80, radius: 7, dmg: 110 },
    van: { proto: "car_van", hp: 90, radius: 7.5, dmg: 120 },
    bus: { proto: "car_bus", hp: 160, radius: 9, dmg: 150 },
    fizzo_truck: { proto: "car_fizzo_truck", hp: 140, radius: 9, dmg: 150 },
    pickup: { proto: "car_pickup", hp: 80, radius: 7, dmg: 110 },
  };
  X.CAR_KINDS = KINDS;
  /** Canonical car kind ('truck' → the delivery truck); unknown → null. */
  X.carKind = function (kind) {
    if (kind === "truck" || kind === "delivery") return "fizzo_truck";
    return KINDS[kind] ? kind : null;
  };
  const GUTTABLE = { sedan: 1, coupe: 1, taxi: 1, police: 1 };
  // far-LOD twins don't model the sag of a stripped wreck → drop them by the same amount
  const LO_DY = { bus: -0.2, fizzo_truck: -0.18 };
  // models whose livery is baked into vertex colours (instance tint only fades them)
  const LIVERY = { taxi: 1, police: 1, bus: 1, fizzo_truck: 1 };
  // faded 1950s paint colours
  const PAINTS = [
    0x7ab8b0, 0xa8c8a0, 0xe0d0a8, 0xd89080, 0xd8c070, 0x90a8c8, 0x8a3a3a,
    0xd8d4c8, 0x3a3a3a, 0xa84038, 0x6a7a5a, 0x5a6a8a, 0xc8a8c0, 0x4a7a7a,
  ];
  X.randomPaint = function (r) {
    const c = new THREE.Color(PAINTS[(r() * PAINTS.length) | 0]);
    const f = 0.72 + r() * 0.25;
    return c.multiplyScalar(f);
  };
  const BURNT_PAINT = new THREE.Color(0.11, 0.095, 0.085),
    BURNT_TRIM = new THREE.Color(0.24, 0.21, 0.19);
  const WHITE = new THREE.Color(1, 1, 1);
  const CHUNK = 400;

  const CARS = (X.CARS = {
    list: [],
    pools: new Map(),
    grid: new Map(),
    built: false,
    active: new Set(),
    byId: new Map(),
  });

  /** Queue a car during init (before build) or add a dynamic one after. */
  X.addCar = function (kind, x, z, yaw, o) {
    o = o || {};
    kind = X.carKind(kind) || "sedan";
    const K = KINDS[kind];
    // every model has a stripped-on-rims variant (1); the sedans also have a gutted wreck (2)
    const variant =
      o.wreck && GUTTABLE[kind] ? 2 : o.stripped || o.wreck ? 1 : 0;
    const pr = X.proto(K.proto, variant);
    const size = pr.meta.size || [2, 5, 1.5];
    const car = {
      id: o.id || "car_" + Math.round(x * 10) + "_" + Math.round(z * 10),
      kind,
      K,
      pr,
      x,
      z,
      y: o.y !== undefined ? o.y : X.ground(x, z),
      yaw: yaw || 0,
      pitch: o.pitch || 0,
      roll: o.roll || 0,
      paint: o.tint
        ? X.color(o.tint)
        : o.paint ||
          (LIVERY[kind]
            ? new THREE.Color(1, 1, 1).multiplyScalar(
                0.72 + U.hash2(x | 0, z | 0) * 0.25,
              )
            : X.randomPaint(U.rng(U.hashStr(kind + x + "," + z)))),
      hp: K.hp * (o.hpMul || 1),
      maxHp: K.hp,
      state: o.burnt ? "burnt" : "intact",
      size,
      fuse: 0,
      anim: null,
      fire: null,
      smoke: null,
      collider: null,
      far: null,
      near: null,
      persistent: !!o.persistent || !X._initDone,
      explodable: o.explodable !== false,
      startBurnt: !!o.burnt,
      baseRoll: o.roll || 0,
      basePitch: o.pitch || 0,
    };
    if (CARS.byId.has(car.id)) car.id += "_" + CARS.list.length;
    CARS.list.push(car);
    CARS.byId.set(car.id, car);
    // grid for damage lookups
    const gk = Math.floor(x / 20) + "," + Math.floor(z / 20);
    if (!CARS.grid.has(gk)) CARS.grid.set(gk, []);
    CARS.grid.get(gk).push(car);
    // collider (walkable roof)
    const cosy = Math.cos(car.yaw),
      siny = Math.sin(car.yaw);
    if (o.onSide) {
      // tipped onto its side: roll ±90° about the long axis, lifted by half the width;
      // the footprint shifts sideways by half the (old) height
      const sd = o.onSide > 0 ? 1 : -1;
      car.roll = car.baseRoll = (sd * Math.PI) / 2 + (car.roll || 0) * 0.3;
      car.y += size[0] / 2 - 0.04;
      const off = (-sd * size[2]) / 2;
      car.collider = G.world.addCollider(
        x + off * cosy,
        z - off * siny,
        size[2] * 0.95,
        size[1] * 0.96,
        car.y - size[0] / 2,
        car.y + size[0] / 2,
        car.yaw,
        { tag: "prop_car", surface: "metal", data: { car } },
      );
    } else {
      if (o.flipped) {
        car.roll = car.baseRoll = Math.PI + (car.roll || 0);
        car.y += size[2] * 0.97;
      }
      const cy0 = o.flipped ? car.y - size[2] : car.y;
      car.collider = G.world.addCollider(
        x,
        z,
        size[0] * 0.95,
        size[1] * 0.96,
        cy0,
        cy0 + size[2] * (car.roll && !o.flipped ? 0.85 : 1),
        car.yaw,
        { tag: "prop_car", surface: "metal", data: { car } },
      );
    }
    if (CARS.built) placeDynamic(car);
    return car;
  };

  const _m = new THREE.Matrix4(),
    _q = new THREE.Quaternion(),
    _e = new THREE.Euler(),
    _p = new THREE.Vector3(),
    _s = new THREE.Vector3(1, 1, 1);
  function carMatrix(car, extraY, extraRoll, extraPitch) {
    _e.set(
      (car.pitch || 0) + (extraPitch || 0),
      car.yaw,
      (car.roll || 0) + (extraRoll || 0),
      "YXZ",
    );
    _q.setFromEuler(_e);
    _p.set(car.x, car.y + (extraY || 0), car.z);
    return _m.compose(_p, _q, _s);
  }
  // ------------------------------------------------------------------
  // ONE material per car: paint + chrome + rubber + glass + livery decals
  // share a single draw call. Per-vertex attribute cm = (tintMask,
  // roughness, metalness); uvg = grime-texture UV for painted panels (the
  // atlas UV of painted verts points at the white texel). Instance colour
  // = paint colour; a NEGATIVE instance colour means "burnt": paint gets
  // |colour|, chrome/glass/rubber get darkened to charred grey.
  // ------------------------------------------------------------------
  let CAR_MAT = null;
  X.carMaterial = function () {
    if (CAR_MAT) return CAR_MAT;
    const m = new THREE.MeshStandardMaterial({
      vertexColors: true,
      map: X.atlasTexture(),
      roughness: 0.5,
      metalness: 0.3,
    });
    const grime = X.ownTex("grime");
    m.onBeforeCompile = (sh) => {
      sh.uniforms.grimeMap = { value: grime };
      sh.vertexShader =
        "attribute vec3 cm;\nattribute vec2 uvg;\nvarying vec3 vCm;\nvarying vec2 vUvG;\n" +
        sh.vertexShader.replace(
          "#include <color_vertex>",
          [
            "vColor = vec3(1.0);",
            "#ifdef USE_COLOR",
            " vColor *= color;",
            "#endif",
            "#ifdef USE_INSTANCING_COLOR",
            " vec3 icol = instanceColor.xyz; float trimK = 1.0;",
            " if (icol.r < 0.0) { icol = -icol; trimK = 0.22; }",
            " vColor.xyz *= mix(vec3(trimK), icol, cm.x);",
            "#endif",
            "vCm = cm; vUvG = uvg;",
          ].join("\n"),
        );
      sh.fragmentShader =
        "uniform sampler2D grimeMap;\nvarying vec3 vCm;\nvarying vec2 vUvG;\n" +
        sh.fragmentShader
          .replace(
            "#include <map_fragment>",
            "#include <map_fragment>\n{ vec3 gc = texture2D(grimeMap, vUvG).rgb; diffuseColor.rgb *= mix(vec3(1.0), gc * gc, vCm.x); }",
          )
          .replace(
            "#include <metalnessmap_fragment>",
            "#include <metalnessmap_fragment>\nroughnessFactor = vCm.y; metalnessFactor = vCm.z;",
          );
    };
    m.customProgramCacheKey = () => "props_car_v1";
    m.name = "props_car";
    m.userData.shared = true;
    CAR_MAT = m;
    return m;
  };
  /** PBR guess for trim vertices from their baked colour: chrome, rubber, glass, rust, lamps. */
  function trimPBR(r, g, b, atlasUV) {
    if (atlasUV) return [0.6, 0.12]; // printed livery / plates / signs
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b,
      mx = Math.max(r, g, b),
      mn = Math.min(r, g, b);
    const sat = mx > 0 ? (mx - mn) / mx : 0;
    if (lum < 0.011) return [0.92, 0.0]; // tyres, wheel wells, grille holes
    if (lum < 0.07 && sat < 0.45 && b >= r * 0.9) return [0.14, 0.35]; // dark window glass
    if (lum > 0.25 && sat < 0.18) return [0.26, 0.85]; // chrome
    if (r > g * 1.25 && g > b && lum < 0.2) return [0.88, 0.25]; // rust
    return [0.42, 0.2]; // lamps, lenses, misc paint
  }
  /** Merge a car prototype's parts into one geometry with cm/uvg attributes (cached on the proto). */
  function carGeo(pr) {
    if (pr._carGeo) return pr._carGeo;
    const W = X.atlasRegion("white"),
      wu = (W.u0 + W.u1) / 2,
      wv = (W.v0 + W.v1) / 2;
    let vc = 0,
      ic = 0;
    for (const part of pr.parts) {
      const g = part.geom;
      vc += g.attributes.position.count;
      ic += g.index ? g.index.count : g.attributes.position.count;
    }
    const pos = new Float32Array(vc * 3),
      nor = new Float32Array(vc * 3),
      uv = new Float32Array(vc * 2),
      col = new Float32Array(vc * 3);
    const cm = new Float32Array(vc * 3),
      uvg = new Float32Array(vc * 2),
      idx = new Uint32Array(ic);
    let vo = 0,
      io = 0;
    for (const part of pr.parts) {
      const g = part.geom,
        n = g.attributes.position.count,
        gu = g.attributes.uv,
        gc = g.attributes.color;
      pos.set(g.attributes.position.array, vo * 3);
      nor.set(g.attributes.normal.array, vo * 3);
      col.set(gc.array, vo * 3);
      const paint = part.mat === "paint",
        keepUV =
          part.mat === "trim" || part.mat === "atlas" || part.mat === "screen";
      for (let i = 0; i < n; i++) {
        const k = vo + i,
          u = gu.array[i * 2],
          v = gu.array[i * 2 + 1];
        if (paint) {
          uv[k * 2] = wu;
          uv[k * 2 + 1] = wv;
          uvg[k * 2] = u;
          uvg[k * 2 + 1] = v;
          cm[k * 3] = part.tint ? 1 : 0;
          cm[k * 3 + 1] = 0.52;
          cm[k * 3 + 2] = 0.3;
          continue;
        }
        const atl =
          keepUV && (Math.abs(u - wu) > 0.002 || Math.abs(v - wv) > 0.002);
        uv[k * 2] = keepUV ? u : wu;
        uv[k * 2 + 1] = keepUV ? v : wv;
        const pb = trimPBR(
          gc.array[i * 3],
          gc.array[i * 3 + 1],
          gc.array[i * 3 + 2],
          atl,
        );
        cm[k * 3] = 0;
        cm[k * 3 + 1] = pb[0];
        cm[k * 3 + 2] = pb[1];
      }
      if (g.index) {
        const ia = g.index.array;
        for (let i = 0; i < ia.length; i++) idx[io++] = ia[i] + vo;
      } else for (let i = 0; i < n; i++) idx[io++] = i + vo;
      vo += n;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
    geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    geo.setAttribute("cm", new THREE.BufferAttribute(cm, 3));
    geo.setAttribute("uvg", new THREE.BufferAttribute(uvg, 2));
    geo.setIndex(
      new THREE.BufferAttribute(vc > 65535 ? idx : new Uint16Array(idx), 1),
    );
    geo.computeBoundingSphere();
    geo.computeBoundingBox();
    pr._carGeo = geo;
    return geo;
  }
  X.carGeo = carGeo;
