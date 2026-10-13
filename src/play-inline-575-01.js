// play-inline-575 01 — math
// Lines 10-357 of readable/play-inline-575.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const QX = G.qx;

  const GEO = {};
  function unitBox() {
    return GEO.box || (GEO.box = new THREE.BoxGeometry(1, 1, 1));
  }
  function unitCyl(seg) {
    const k = "cyl" + seg;
    return GEO[k] || (GEO[k] = new THREE.CylinderGeometry(0.5, 0.5, 1, seg));
  }
  function unitCone(seg) {
    const k = "cone" + seg;
    return GEO[k] || (GEO[k] = new THREE.ConeGeometry(0.5, 1, seg));
  }
  function unitSphere() {
    return GEO.sph || (GEO.sph = new THREE.SphereGeometry(0.5, 12, 8));
  }
  function unitTorus() {
    return GEO.tor || (GEO.tor = new THREE.TorusGeometry(0.5, 0.08, 6, 20));
  }

  const matCache = new Map();
  /** Shared material: G.mats when available, else a plain coloured standard material. */
  function mat(name, fallbackColor) {
    const key = name + "|" + (fallbackColor || "");
    if (matCache.has(key)) return matCache.get(key);
    let m = null;
    if (QX.live("mats") && G.mats.get)
      m = QX.safe("mats.get", () => G.mats.get(name));
    if (!m) {
      m = new THREE.MeshStandardMaterial({
        color: fallbackColor || 0x777066,
        roughness: 0.8,
        metalness: 0.2,
      });
      m.userData.shared = true;
    }
    matCache.set(key, m);
    return m;
  }
  /** Own coloured material (for tints that G.mats doesn't provide). */
  function tint(key, color, opts) {
    const k = "tint:" + key;
    if (matCache.has(k)) return matCache.get(k);
    const m = new THREE.MeshStandardMaterial(
      Object.assign({ color, roughness: 0.75, metalness: 0.15 }, opts || {}),
    );
    m.userData.shared = true;
    matCache.set(k, m);
    return m;
  }

  /** Builder: collect baked geometry per material, then flush into one mesh per material. */
  function builder() {
    return { parts: new Map() };
  }
  function add(b, m, geom) {
    let arr = b.parts.get(m);
    if (!arr) {
      arr = [];
      b.parts.set(m, arr);
    }
    arr.push(geom);
  }
  function bake(g, x, y, z, sx, sy, sz, ry, rx, rz) {
    return G.util.bake(
      g,
      { x, y, z },
      ry || 0,
      new THREE.Vector3(sx, sy, sz),
      rx || 0,
      rz || 0,
    );
  }
  const K = {
    mat,
    tint,
    builder,
    box(b, m, w, h, d, x, y, z, ry, rx, rz) {
      add(b, m, bake(unitBox(), x, y, z, w, h, d, ry, rx, rz));
    },
    cyl(b, m, r, h, x, y, z, seg, rx, rz, ry) {
      add(b, m, bake(unitCyl(seg || 10), x, y, z, r * 2, h, r * 2, ry, rx, rz));
    },
    cone(b, m, r, h, x, y, z, seg) {
      add(b, m, bake(unitCone(seg || 12), x, y, z, r * 2, h, r * 2));
    },
    sphere(b, m, r, x, y, z) {
      add(b, m, bake(unitSphere(), x, y, z, r * 2, r * 2, r * 2));
    },
    torus(b, m, r, x, y, z, rx, ry) {
      add(b, m, bake(unitTorus(), x, y, z, r * 2, r * 2, r * 2, ry, rx));
    },
    /** Merge everything into meshes under `group` (strip normals-less / colour mismatches handled by mergeGeometries). */
    flush(b, group, shadows) {
      for (const [m, geoms] of b.parts) {
        const merged = G.util.mergeGeometries(
          geoms.map((g) => {
            if (g.attributes.color) g.deleteAttribute("color");
            return g;
          }),
        );
        for (const g of geoms) g.dispose();
        const mesh = new THREE.Mesh(merged, m);
        mesh.castShadow = !!shadows;
        mesh.receiveShadow = true;
        group.add(mesh);
      }
      b.parts.clear();
      return group;
    },
    /** Root group placed in the world (yaw = which way the prop's front faces). */
    group(x, y, z, yaw, lod) {
      const g = new THREE.Group();
      g.position.set(x, y || 0, z);
      g.rotation.y = yaw || 0;
      G.scene.add(g);
      if (G.world.addLOD) G.world.addLOD(g, lod || 140);
      return g;
    },
    /** A textured sign plane from G.tex.sign (falls back to a canvas we paint ourselves). */
    sign(text, style, w, h, opts) {
      let tex = null;
      if (QX.live("tex") && G.tex.sign)
        tex = QX.safe("tex.sign", () =>
          G.tex.sign(text, style || "enamel", opts || {}),
        );
      if (!tex) tex = K.paintSign(text, opts && opts.fg, opts && opts.bg);
      const m = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.7,
        metalness: 0.1,
        side: THREE.DoubleSide,
        emissive: opts && opts.glow ? 0xffffff : 0x000000,
        emissiveMap: opts && opts.glow ? tex : null,
        emissiveIntensity: (opts && opts.glow) || 0,
      });
      if (!h && tex.userData && tex.userData.aspect)
        h = w / tex.userData.aspect;
      return new THREE.Mesh(new THREE.PlaneGeometry(w, h || w * 0.3), m);
    },
    /** Minimal fallback sign painter (also used for hand-lettered cardboard). */
    paintSign(text, fg, bg, font) {
      const c = document.createElement("canvas");
      c.width = 512;
      c.height = 160;
      const x = c.getContext("2d");
      x.fillStyle = bg || "#d9c9a0";
      x.fillRect(0, 0, 512, 160);
      // grime
      for (let i = 0; i < 140; i++) {
        x.fillStyle = "rgba(40,30,20," + Math.random() * 0.12 + ")";
        x.fillRect(
          Math.random() * 512,
          Math.random() * 160,
          2 + Math.random() * 18,
          1 + Math.random() * 6,
        );
      }
      x.fillStyle = fg || "#2a1c10";
      const lines = String(text).split("\n");
      const fs = Math.min(70, Math.floor(150 / lines.length) - 6);
      x.font = (font || "bold ") + fs + 'px "Courier New", monospace';
      x.textAlign = "center";
      x.textBaseline = "middle";
      lines.forEach((l, i) =>
        x.fillText(l, 256, 80 + (i - (lines.length - 1) / 2) * (fs + 6), 490),
      );
      const t = new THREE.CanvasTexture(c);
      if ("colorSpace" in t) t.colorSpace = THREE.SRGBColorSpace;
      t.userData.aspect = 512 / 160;
      return t;
    },
    glow(x, y, z, color, size) {
      if (QX.live("fx") && G.fx.glowSprite)
        return QX.safe("glow", () =>
          G.fx.glowSprite(new THREE.Vector3(x, y, z), color, size || 1),
        );
      return null;
    },
    collider(x, z, w, d, y0, y1, yaw, surface) {
      return G.world.addCollider(x, z, w, d, y0 || 0, y1, yaw || 0, {
        tag: "qx_prop",
        surface: surface || "metal",
      });
    },
    /** Local→world helper for a group's placement (x,z offsets rotated by yaw). */
    local(g, lx, lz) {
      const c = Math.cos(g.rotation.y),
        s = Math.sin(g.rotation.y);
      return {
        x: g.position.x + lx * c + lz * s,
        z: g.position.z - lx * s + lz * c,
      };
    },
  };

  // ------------------------------------------------------------------
  // Prefabs
  // ------------------------------------------------------------------
  /** Tripod + camera + "SCENIC VIEWPOINT" plaque. Front (camera lens) faces yaw. */
  K.tripod = function (x, y, z, yaw) {
    const g = K.group(x, y, z, yaw, 160);
    const b = builder();
    const metal = mat("metal_painted", 0x3a3a36),
      chrome = mat("chrome", 0xbfc3c6),
      wood = mat("wood_planks", 0x6a4a2a);
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI * 2) / 3;
      K.cyl(
        b,
        metal,
        0.018,
        1.45,
        Math.sin(a) * 0.22,
        0.68,
        Math.cos(a) * 0.22,
        6,
        Math.cos(a) * 0.3,
        -Math.sin(a) * 0.3,
      );
    }
    K.cyl(b, chrome, 0.03, 0.2, 0, 1.42, 0, 8);
    K.box(
      b,
      tint("qx_camera", 0x2b2622, { roughness: 0.5 }),
      0.26,
      0.18,
      0.14,
      0,
      1.6,
      0,
    );
    K.cyl(b, chrome, 0.05, 0.09, 0, 1.6, -0.1, 12, Math.PI / 2);
    K.box(b, chrome, 0.06, 0.04, 0.05, 0.08, 1.71, 0.02);
    // plaque post beside it
    K.cyl(b, wood, 0.035, 1.1, 0.7, 0.55, 0.1, 6);
    K.flush(b, g, false);
    const sg = K.sign("SCENIC VIEWPOINT\nFinch's Facts", "enamel", 0.62, 0.3, {
      fg: "#1b3a2a",
      bg: "#e8dcb8",
    });
    sg.position.set(0.7, 1.18, 0.12);
    sg.rotation.y = Math.PI;
    g.add(sg);
    // camera lens glint
    const lens = K.local(g, 0, -0.16);
    K.glow(lens.x, y + 1.6, lens.z, 0xffffff, 0.12);
    return g;
  };

  /** Street-food cart with umbrella and name board. */
  K.hotdogCart = function (x, y, z, yaw, name, colA, colB) {
    const g = K.group(x, y, z, yaw, 170);
    const b = builder();
    const body = tint("qx_cart_" + name.length, colA || 0xb8b2a0, {
      metalness: 0.5,
      roughness: 0.45,
    });
    const trim = mat("chrome", 0xc9c9c9),
      rust = mat("rust", 0x6b3a22),
      tyre = tint("qx_tyre", 0x1a1816, { roughness: 0.95 });
    K.box(b, body, 1.9, 0.95, 0.85, 0, 0.75, 0);
    K.box(b, trim, 1.96, 0.05, 0.9, 0, 1.25, 0);
    K.box(b, trim, 1.96, 0.05, 0.9, 0, 0.28, 0);
    K.box(b, rust, 0.9, 0.35, 0.6, 0.35, 1.45, -0.05); // steam table
    K.box(b, trim, 0.5, 0.02, 0.4, -0.55, 1.29, 0); // cutting board
    for (const sx of [-0.7, 0.7])
      K.cyl(b, tyre, 0.25, 0.1, sx, 0.25, 0.46, 12, 0, Math.PI / 2);
    K.cyl(b, trim, 0.025, 0.9, -1.05, 0.9, 0, 6, 0, Math.PI / 2 - 0.35); // push handle
    K.cyl(b, trim, 0.025, 1.6, 0.85, 1.9, 0.3, 6); // umbrella pole
    K.cone(
      b,
      tint("qx_umb_" + name.length, colB || 0xb03a2a, {
        roughness: 0.9,
        side: THREE.DoubleSide,
      }),
      1.25,
      0.55,
      0.85,
      2.85,
      0.3,
      10,
    );
    K.flush(b, g, true);
    const sg = K.sign(name, "shop", 1.7, 0.42, {
      fg: "#fff3d0",
      bg: "#6a1a12",
    });
    sg.position.set(0, 0.8, 0.43);
    g.add(sg);
    const sg2 = sg.clone();
    sg2.position.set(0, 0.8, -0.43);
    sg2.rotation.y = Math.PI;
    g.add(sg2);
    K.collider(x, z, 2.1, 1.0, y, y + 1.6, yaw, "metal");
    K.glow(x, y + 1.7, z, 0xffc070, 0.5);
    return g;
  };

  /** Bus stop: pole + round route sign + bench. */
  K.busStop = function (x, y, z, yaw) {
    const g = K.group(x, y, z, yaw, 160);
    const b = builder();
    const metal = mat("metal_painted", 0x3d4a40),
      wood = mat("wood_rotten", 0x5a4630);
    K.cyl(b, metal, 0.04, 2.9, -1.4, 1.45, 0, 8);
    K.box(b, metal, 1.9, 0.06, 0.08, 0, 0.45, 0.1);
    K.box(b, wood, 1.9, 0.05, 0.4, 0, 0.47, 0);
    K.box(b, wood, 1.9, 0.35, 0.05, 0, 0.72, 0.2);
    for (const sx of [-0.85, 0.85])
      K.box(b, metal, 0.06, 0.45, 0.4, sx, 0.22, 0);
    K.flush(b, g, false);
    const sg = K.sign("BUS\nM42", "enamel", 0.5, 0.5, {
      fg: "#ffffff",
      bg: "#1d3f8a",
    });
    sg.position.set(-1.4, 2.6, -0.06);
    sg.rotation.y = Math.PI;
    g.add(sg);
    K.collider(x, z, 2.0, 0.5, y, y + 0.9, yaw, "wood");
    return g;
  };

  /** A row of parking meters along the kerb (local +x). */
  K.meters = function (x, y, z, yaw, n) {
    const g = K.group(x, y, z, yaw, 120);
    const b = builder();
    const metal = mat("metal_painted", 0x5a5a52),
      chrome = mat("chrome", 0xbfbfbf),
      glass = tint("qx_meter_glass", 0x9fc0a0, {
        roughness: 0.2,
        metalness: 0.3,
      });
    for (let i = 0; i < n; i++) {
      const lx = i * 2.6;
      K.cyl(b, metal, 0.035, 1.15, lx, 0.58, 0, 8, i === 2 ? 0.25 : 0);
      K.box(b, chrome, 0.2, 0.28, 0.16, lx, 1.28, 0);
      K.box(b, glass, 0.14, 0.1, 0.02, lx, 1.34, -0.085);
    }
    K.flush(b, g, false);
    return g;
  };

  /** Ham-radio listening post: antenna mast, folding table, crates. */
