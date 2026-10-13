/* src/quests_extra/06_kit.js */
/* =====================================================================
 * NEW RAD CITY — QUESTS_EXTRA — 06: SMALL PROP KIT
 * Procedural set dressing for this module's street scenes (tripods, hot-dog
 * carts, bus stop, parking meters, listening post, freight hatch, booths...).
 * Geometry is accumulated per material and merged, one mesh per material
 * per prop; every prop is distance-culled with G.world.addLOD.
 * ===================================================================== */
(function () {
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
  K.listeningPost = function (x, y, z, yaw) {
    const g = K.group(x, y, z, yaw, 260);
    const b = builder();
    const rust = mat("rust", 0x6a3a22),
      metal = mat("metal_panel", 0x5a5a55),
      wood = mat("wood_planks", 0x6a4a2a);
    K.cyl(b, rust, 0.06, 9, 1.8, 4.5, 1.2, 6);
    for (let i = 0; i < 4; i++)
      K.box(b, rust, 1.6 - i * 0.3, 0.04, 0.04, 1.8, 5.5 + i * 1.1, 1.2);
    K.box(b, metal, 0.35, 0.35, 0.02, 1.8, 8.7, 1.2, 0.5);
    for (const a of [0, 2.1, 4.2])
      K.cyl(
        b,
        tint("qx_guy", 0x222222),
        0.01,
        9.4,
        1.8 + Math.sin(a) * 2.2,
        4.4,
        1.2 + Math.cos(a) * 2.2,
        4,
        Math.cos(a) * 0.24,
        -Math.sin(a) * 0.24,
      );
    K.box(b, wood, 1.6, 0.05, 0.8, 0, 0.78, 0);
    for (const sx of [-0.7, 0.7])
      for (const sz of [-0.32, 0.32])
        K.cyl(b, metal, 0.025, 0.78, sx, 0.39, sz, 6);
    K.box(
      b,
      tint("qx_radio", 0x3b3326, { roughness: 0.6 }),
      0.7,
      0.35,
      0.35,
      -0.2,
      0.98,
      0.05,
    );
    K.box(
      b,
      tint("qx_dial", 0xd8b060, { emissive: 0x6a4a10, emissiveIntensity: 0.8 }),
      0.4,
      0.08,
      0.01,
      -0.2,
      1.05,
      -0.13,
    );
    K.box(b, wood, 0.6, 0.45, 0.6, 1.0, 0.23, -0.9);
    K.box(b, wood, 0.5, 0.4, 0.5, 1.0, 0.65, -0.9, 0.3);
    K.flush(b, g, false);
    K.collider(x, z, 1.7, 0.9, y, y + 1.0, yaw, "wood");
    const p = K.local(g, 1.8, 1.2);
    K.collider(p.x, p.z, 0.3, 0.3, y, y + 9, 0, "metal");
    K.glow(
      K.local(g, -0.2, -0.15).x,
      y + 1.05,
      K.local(g, -0.2, -0.15).z,
      0xffb040,
      0.3,
    );
    K.glow(p.x, y + 9.1, p.z, 0xff3020, 0.5); // aircraft-warning lamp
    return g;
  };

  /**
   * Stencil plate painted on our own canvas (multi-line, monospace stencil lettering), optional hazard-striped border.
   * Used for Office of Civil Defense / Project Long Winter placards. opts {fg, bg, stripe, stripe2, font}
   */
  K.plate = function (text, w, h, opts) {
    opts = opts || {};
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = Math.max(64, Math.round((512 * h) / w));
    const x = c.getContext("2d");
    const W = c.width,
      H = c.height;
    x.fillStyle = opts.bg || "#d8dcdc";
    x.fillRect(0, 0, W, H);
    const bw = opts.stripe ? Math.round(Math.min(W, H) * 0.09) : 0;
    if (bw) {
      x.save();
      x.beginPath();
      x.rect(0, 0, W, H);
      x.rect(bw, bw, W - bw * 2, H - bw * 2);
      x.clip("evenodd");
      x.fillStyle = opts.stripe2 || "#1c1c1a";
      x.fillRect(0, 0, W, H);
      x.fillStyle = opts.stripe;
      for (let i = -H; i < W + H; i += bw * 2.4) {
        x.beginPath();
        x.moveTo(i, 0);
        x.lineTo(i + bw * 1.2, 0);
        x.lineTo(i + bw * 1.2 - H, H);
        x.lineTo(i - H, H);
        x.fill();
      }
      x.restore();
    }
    for (let i = 0; i < 120; i++) {
      x.fillStyle = "rgba(40,36,30," + (Math.random() * 0.1).toFixed(3) + ")";
      x.fillRect(
        Math.random() * W,
        Math.random() * H,
        2 + Math.random() * 16,
        1 + Math.random() * 5,
      );
    }
    x.fillStyle = opts.fg || "#1c1c1a";
    const lines = String(text).split("\n");
    const fs = Math.min(Math.floor((H - bw * 2) / lines.length) - 8, 72);
    x.font = (opts.font || "bold ") + fs + 'px "Courier New", monospace';
    x.textAlign = "center";
    x.textBaseline = "middle";
    lines.forEach((l, i) =>
      x.fillText(
        l,
        W / 2,
        H / 2 + (i - (lines.length - 1) / 2) * (fs + 6),
        W - bw * 2 - 16,
      ),
    );
    const t = new THREE.CanvasTexture(c);
    if ("colorSpace" in t) t.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.MeshStandardMaterial({
      map: t,
      roughness: 0.8,
      metalness: 0.1,
      side: THREE.DoubleSide,
      emissive: opts.glow ? 0xffffff : 0x000000,
      emissiveMap: opts.glow ? t : null,
      emissiveIntensity: opts.glow || 0,
    });
    return new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
  };

  /**
   * Square freight hatch of a Project Long Winter site, flush in a concrete collar: riveted steel leaf with
   * two lifting bars, an orange/black hazard border, salt rime like frost round the seams, an Office of Civil
   * Defense stencil and a warning post with an amber lamp.
   */
  K.freightHatch = function (x, y, z, yaw, unit) {
    const g = K.group(x, y, z, yaw, 220);
    const b = builder();
    const steel = mat("metal_panel", 0x7a7e80),
      rust = mat("rust", 0x6a3a22),
      conc = mat("concrete_dark", 0x55534e);
    const orange = tint("qx_lw_orange", 0xd8641e, { roughness: 0.7 }),
      black = tint("qx_lw_black", 0x1c1c1a, { roughness: 0.8 });
    const frost = tint("qx_lw_frost", 0xe8eef0, {
      roughness: 0.95,
      transparent: true,
      opacity: 0.75,
    });
    K.box(b, conc, 3.1, 0.34, 3.1, 0, 0.17, 0); // collar
    for (let i = 0; i < 10; i++) {
      // hazard border (four sides)
      const u = -1.26 + i * 0.28,
        m = i % 2 ? orange : black;
      K.box(b, m, 0.28, 0.02, 0.16, u, 0.35, -1.32);
      K.box(b, m, 0.28, 0.02, 0.16, u, 0.35, 1.32);
      K.box(b, m, 0.16, 0.02, 0.28, -1.32, 0.35, u);
      K.box(b, m, 0.16, 0.02, 0.28, 1.32, 0.35, u);
    }
    K.box(b, steel, 2.3, 0.1, 2.3, 0, 0.39, 0); // the leaf
    for (const s of [-0.75, 0, 0.75])
      K.box(b, steel, 2.3, 0.05, 0.1, 0, 0.46, s); // stiffening ribs
    for (const s of [-1, 1])
      for (const t of [-1, 1])
        K.cyl(b, rust, 0.11, 0.08, s * 0.98, 0.45, t * 0.98, 8); // hinge / dog bosses
    for (const s of [-0.45, 0.45]) {
      // lifting bars
      K.box(b, steel, 0.05, 0.14, 0.05, s - 0.25, 0.5, 0.95);
      K.box(b, steel, 0.05, 0.14, 0.05, s + 0.25, 0.5, 0.95);
      K.box(b, steel, 0.55, 0.05, 0.05, s, 0.57, 0.95);
    }
    for (let i = 0; i < 14; i++) {
      // salt rime along the seams
      const side = i % 4,
        u = -1.05 + ((i * 0.37) % 2.1);
      const px = side < 2 ? u : side === 2 ? -1.16 : 1.16,
        pz = side < 2 ? (side === 0 ? -1.16 : 1.16) : u;
      K.box(
        b,
        frost,
        side < 2 ? 0.3 : 0.08,
        0.015,
        side < 2 ? 0.08 : 0.3,
        px,
        0.45,
        pz,
        i * 0.4,
      );
    }
    // warning post with flashing lamp
    K.cyl(b, steel, 0.05, 1.6, 1.9, 0.8, 0, 6);
    K.box(b, orange, 0.11, 0.25, 0.11, 1.9, 1.2, 0);
    K.flush(b, g, true);
    const sg = K.plate(
      "O.C.D. — PROJECT LONG WINTER\nCRYO UNIT " +
        (unit || "C-4") +
        "\nFREIGHT HATCH",
      0.95,
      0.52,
      { fg: "#1c1c1a", bg: "#dfe3e2", stripe: "#d8641e" },
    );
    sg.position.set(1.9, 1.35, -0.07);
    sg.rotation.y = Math.PI;
    g.add(sg);
    const st = K.plate(String(unit || "C-4"), 1.2, 0.5, {
      fg: "#e8eaea",
      bg: "#6a6e70",
    });
    st.rotation.x = -Math.PI / 2;
    st.position.set(0, 0.47, -0.4);
    g.add(st);
    K.collider(x, z, 3.1, 3.1, y, y + 0.34, yaw, "concrete");
    const lamp = K.local(g, 1.9, 0);
    g.userData.lamp = K.glow(lamp.x, y + 1.7, lamp.z, 0xffa020, 0.6);
    return g;
  };

  /**
   * Fortune teller's booth: a striped carnival tent open at the front (local +z) with its flaps tied back,
   * scalloped valance, brass finial + pennant, an all-seeing-eye hanging and a rug inside, a draped table
   * with the crystal ball, a tarot spread and candles at the mouth, a lantern, the customer's stool and an
   * easel sign out front. Returns { group, seat: local seat of the teller (behind the table), front }.
   */
  K.tent = function (x, y, z, yaw) {
    const g = K.group(x, y, z, yaw, 150);
    const b = builder();
    const DS = { side: THREE.DoubleSide };
    const purple = tint(
        "qx_tent",
        0x4a1a4a,
        Object.assign({ roughness: 0.95 }, DS),
      ),
      gold = tint("qx_tent2", 0xa8842c, Object.assign({ roughness: 0.9 }, DS));
    const brass = tint("qx_zora_brass", 0x9a7a3a, {
        roughness: 0.35,
        metalness: 0.8,
      }),
      wood = mat("wood_planks", 0x5a3a20);
    const drape = tint("qx_zora_cloth", 0x5a1e4a, { roughness: 0.95 }),
      fringe = tint("qx_zora_fringe", 0xc8a040, { roughness: 0.8 });
    const wax = tint("qx_zora_wax", 0xe8e0c8, { roughness: 0.8 }),
      flame = tint("qx_zora_flame", 0xffb040, {
        emissive: 0xffa030,
        emissiveIntensity: 2.2,
      });
    const R = 1.85,
      H = 2.15,
      N = 12;
    // walls: 12 panels, alternating purple / gold, the front three left open (the opening is centred on +z)
    for (let i = 0; i < N; i++) {
      const a = ((i + 0.5) / N) * Math.PI * 2; // panel centre angle (0 = +z)
      if (Math.cos(a) > 0.72) continue; // the mouth
      const w = 2 * R * Math.sin(Math.PI / N) + 0.02;
      K.box(
        b,
        i % 2 ? gold : purple,
        w,
        H,
        0.03,
        Math.sin(a) * R,
        H / 2,
        Math.cos(a) * R,
        a,
      );
    }
    // flaps tied back either side of the mouth, with rope ties
    for (const s of [-1, 1]) {
      const a = s * 0.62;
      K.box(
        b,
        purple,
        0.75,
        H - 0.1,
        0.03,
        Math.sin(a) * (R + 0.28),
        (H - 0.1) / 2,
        Math.cos(a) * (R + 0.28) + 0.05,
        a + s * 0.9,
      );
      K.torus(
        b,
        gold,
        0.1,
        Math.sin(a) * (R + 0.3),
        1.05,
        Math.cos(a) * (R + 0.3) + 0.06,
        Math.PI / 2,
        0,
      );
    }
    // roof: purple cone + 6 gold gores, brass finial, pennant
    K.cone(b, purple, R + 0.12, 1.5, 0, H + 0.75, 0, N);
    K.cyl(b, brass, 0.03, 0.6, 0, H + 1.7, 0, 6);
    K.sphere(b, brass, 0.07, 0, H + 1.55, 0);
    K.box(b, gold, 0.02, 0.22, 0.42, 0, H + 1.86, 0.22);
    // scalloped valance round the eave (little gold tassels between purple scallops)
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      K.box(
        b,
        i % 2 ? gold : purple,
        0.5,
        0.2,
        0.02,
        Math.sin(a) * (R + 0.1),
        H - 0.02,
        Math.cos(a) * (R + 0.1),
        a,
      );
      if (i % 2)
        K.cone(
          b,
          fringe,
          0.035,
          0.14,
          Math.sin(a) * (R + 0.12),
          H - 0.2,
          Math.cos(a) * (R + 0.12),
          5,
        );
    }
    // centre pole and a hanging lantern
    K.cyl(b, brass, 0.09, 0.18, 0, 1.95, 0.25, 6);
    K.cyl(b, brass, 0.006, 1.2, 0, 2.64, 0.25, 4);
    // the draped table at the mouth (skirt + top + fringe)
    const TZ = 0.55;
    K.cyl(b, drape, 0.62, 0.7, 0, 0.35, TZ, 16);
    K.cyl(b, drape, 0.66, 0.05, 0, 0.72, TZ, 16);
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      K.box(
        b,
        fringe,
        0.02,
        0.1,
        0.02,
        Math.sin(a) * 0.665,
        0.65,
        TZ + Math.cos(a) * 0.665,
        a,
      );
    }
    K.cyl(b, brass, 0.1, 0.06, 0, 0.78, TZ - 0.05, 10); // crystal-ball stand
    for (const [cx, cz] of [
      [-0.42, TZ - 0.2],
      [0.44, TZ - 0.12],
    ]) {
      K.cyl(b, wax, 0.025, 0.16, cx, 0.83, cz, 6);
      K.cone(b, flame, 0.012, 0.04, cx, 0.935, cz, 5);
    }
    // the customer's stool and the teller's chair (high back)
    K.cyl(b, wood, 0.2, 0.05, 0, 0.45, TZ + 1.0, 10);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      K.cyl(
        b,
        wood,
        0.02,
        0.45,
        Math.sin(a) * 0.14,
        0.22,
        TZ + 1.0 + Math.cos(a) * 0.14,
        5,
      );
    }
    K.box(b, wood, 0.5, 0.05, 0.45, 0, 0.46, -1.0);
    K.box(b, drape, 0.5, 1.1, 0.05, 0, 1.0, -1.25);
    for (const sx of [-0.22, 0.22])
      K.box(b, wood, 0.04, 0.46, 0.04, sx, 0.23, -1.0);
    // easel sign out front, to the right of the mouth
    K.box(b, wood, 0.04, 1.7, 0.04, 1.75, 0.83, 2.25, 0, 0.18);
    K.box(b, wood, 0.04, 1.7, 0.04, 2.45, 0.83, 2.25, 0, 0.18);
    K.box(b, wood, 0.04, 1.6, 0.04, 2.1, 0.8, 2.0, 0, -0.3);
    K.box(b, wood, 0.8, 0.04, 0.06, 2.1, 0.62, 2.33, 0, 0.18);
    K.flush(b, g, false);
    // gold gores on the roof: six cone wedges a hair outside the purple cone, merged into one mesh
    const gores = [];
    for (let i = 0; i < 6; i++) {
      const cg = new THREE.ConeGeometry(
        R + 0.135,
        1.51,
        3,
        1,
        true,
        (i / 6) * Math.PI * 2,
        Math.PI / 6,
      );
      cg.translate(0, H + 0.755, 0);
      gores.push(cg);
    }
    const gm = new THREE.Mesh(G.util.mergeGeometries(gores), gold);
    g.add(gm);
    for (const cg of gores) cg.dispose();
    // crystal ball (own mesh: glassy + glowing)
    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 18, 12),
      tint("qx_crystal", 0x9fe0ff, {
        roughness: 0.05,
        metalness: 0.1,
        transparent: true,
        opacity: 0.8,
        emissive: 0x2a6a9a,
        emissiveIntensity: 1.0,
      }),
    );
    ball.position.set(0, 0.95, TZ - 0.05);
    g.add(ball);
    const bp = K.local(g, 0, TZ - 0.05);
    K.glow(bp.x, y + 0.97, bp.z, 0x70c0ff, 0.7);
    const lp = K.local(g, 0, 0.25);
    K.glow(lp.x, y + 1.9, lp.z, 0xffb050, 1.4);
    // painted cloth things: the all-seeing eye hanging, the rug, the tarot spread, the sign
    const paint = (w, h, fn) => {
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      fn(c.getContext("2d"), w, h);
      const t = new THREE.CanvasTexture(c);
      if ("colorSpace" in t) t.colorSpace = THREE.SRGBColorSpace;
      return t;
    };
    const eye = paint(256, 320, (c, w, h) => {
      c.fillStyle = "#2a0e2a";
      c.fillRect(0, 0, w, h);
      c.strokeStyle = "#c8a040";
      c.lineWidth = 6;
      c.strokeRect(8, 8, w - 16, h - 16);
      c.fillStyle = "#c8a040";
      for (let i = 0; i < 40; i++) {
        const a = Math.random() * 6.28,
          r = 60 + Math.random() * 60;
        c.fillRect(w / 2 + Math.cos(a) * r, 150 + Math.sin(a) * r, 3, 3);
      }
      c.beginPath();
      c.moveTo(w / 2, 50);
      c.lineTo(w / 2 + 90, 210);
      c.lineTo(w / 2 - 90, 210);
      c.closePath();
      c.lineWidth = 5;
      c.stroke();
      c.beginPath();
      c.ellipse(w / 2, 158, 42, 22, 0, 0, 7);
      c.fillStyle = "#e8dcc0";
      c.fill();
      c.stroke();
      c.beginPath();
      c.arc(w / 2, 158, 13, 0, 7);
      c.fillStyle = "#3aa890";
      c.fill();
      c.beginPath();
      c.arc(w / 2, 158, 6, 0, 7);
      c.fillStyle = "#101010";
      c.fill();
      c.fillStyle = "#c8a040";
      c.font = "bold 26px Georgia, serif";
      c.textAlign = "center";
      c.fillText("ZORA", w / 2, 270);
      for (let i = 0; i < 12; i++) {
        c.beginPath();
        c.moveTo(20 + i * 20, h - 12);
        c.lineTo(30 + i * 20, h - 2);
        c.lineTo(40 + i * 20, h - 12);
        c.fill();
      }
    });
    const hang = new THREE.Mesh(
      new THREE.PlaneGeometry(1.0, 1.25),
      new THREE.MeshStandardMaterial({
        map: eye,
        roughness: 0.95,
        side: THREE.DoubleSide,
      }),
    );
    hang.position.set(0, 1.25, -R + 0.08);
    g.add(hang);
    const rugT = paint(256, 256, (c, w) => {
      c.fillStyle = "#5a1a20";
      c.beginPath();
      c.arc(w / 2, w / 2, w / 2 - 2, 0, 7);
      c.fill();
      for (const [r, col] of [
        [110, "#c8a040"],
        [96, "#2a3a6a"],
        [70, "#c8a040"],
        [60, "#5a1a20"],
        [30, "#c8a040"],
      ]) {
        c.beginPath();
        c.arc(w / 2, w / 2, r, 0, 7);
        c.lineWidth = 6;
        c.strokeStyle = col;
        c.stroke();
      }
      c.globalAlpha = 0.25;
      c.fillStyle = "#1a1410";
      for (let i = 0; i < 300; i++)
        c.fillRect(Math.random() * w, Math.random() * w, 4, 2);
    });
    const rug = new THREE.Mesh(
      new THREE.PlaneGeometry(2.6, 2.6),
      new THREE.MeshStandardMaterial({
        map: rugT,
        transparent: true,
        alphaTest: 0.2,
        roughness: 1,
        polygonOffset: true,
        polygonOffsetFactor: -2,
      }),
    );
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(0, 0.015, -0.1);
    g.add(rug);
    const cards = paint(256, 64, (c) => {
      const names = ["THE TOWER", "THE STAR", "DEATH", "STRANGER", "THE SUN"];
      names.forEach((n, i) => {
        const x0 = i * 51 + 2;
        c.fillStyle = "#e8dcc0";
        c.fillRect(x0, 2, 47, 60);
        c.strokeStyle = "#8a6a2a";
        c.lineWidth = 2;
        c.strokeRect(x0 + 3, 5, 41, 54);
        c.fillStyle = ["#8a2a20", "#2a4a8a", "#1a1a1a", "#2a6a4a", "#c8901a"][
          i
        ];
        c.beginPath();
        c.arc(x0 + 23.5, 26, 11, 0, 7);
        c.fill();
        c.fillStyle = "#2a1a10";
        c.font = "bold 7px sans-serif";
        c.textAlign = "center";
        c.fillText(n, x0 + 23.5, 52);
      });
    });
    const cardMat = new THREE.MeshStandardMaterial({
      map: cards,
      roughness: 0.8,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    });
    for (let i = 0; i < 5; i++) {
      const geo = new THREE.PlaneGeometry(0.09, 0.13);
      const uv = geo.attributes.uv;
      for (let v = 0; v < uv.count; v++) uv.setX(v, (i + uv.getX(v)) / 5);
      const m = new THREE.Mesh(geo, cardMat);
      m.rotation.set(-Math.PI / 2, 0, (i - 2) * 0.18);
      m.position.set((i - 2) * 0.11, 0.749, TZ + 0.3 - Math.abs(i - 2) * 0.03);
      g.add(m);
    }
    const sg = K.sign(
      "MADAME ZORA\nSEES ALL · TELLS SOME\nREADINGS 10 SCRIP",
      "wood",
      0.9,
      0.62,
      { fg: "#e8c870", bg: "#3a1030" },
    );
    sg.position.set(2.1, 1.15, 2.37);
    sg.rotation.x = -0.18;
    g.add(sg);
    // colliders: the walls (not the mouth), the table, the easel
    for (let i = 0; i < N; i++) {
      const a = ((i + 0.5) / N) * Math.PI * 2;
      if (Math.cos(a) > 0.72) continue;
      const p = K.local(g, Math.sin(a) * R, Math.cos(a) * R);
      K.collider(p.x, p.z, 1.0, 0.2, y, y + H, yaw + a, "wood");
    }
    const tp = K.local(g, 0, TZ);
    K.collider(tp.x, tp.z, 1.2, 1.2, y, y + 0.8, yaw, "wood");
    const ep = K.local(g, 2.1, 2.2);
    K.collider(ep.x, ep.z, 0.9, 0.5, y, y + 1.6, yaw, "wood");
    return {
      group: g,
      seat: K.local(g, 0, -0.42),
      front: K.local(g, 0, TZ + 1.6),
    };
  };

  /** Newsstand: sandwich board + bundles of papers. */
  K.newsStand = function (x, y, z, yaw) {
    const g = K.group(x, y, z, yaw, 120);
    const b = builder();
    const wood = mat("wood_planks", 0x6a4a2a),
      paper = tint("qx_paper", 0xcfc6a8, { roughness: 1 }),
      twine = tint("qx_twine", 0x8a6a3a);
    K.box(b, wood, 0.7, 1.0, 0.04, 0, 0.5, -0.18, 0, 0.18);
    K.box(b, wood, 0.7, 1.0, 0.04, 0, 0.5, 0.18, 0, -0.18);
    for (let i = 0; i < 3; i++) {
      K.box(
        b,
        paper,
        0.42,
        0.22,
        0.3,
        0.9 + i * 0.05,
        0.11 + i * 0.22,
        0.1,
        i * 0.3,
      );
      K.box(
        b,
        twine,
        0.43,
        0.02,
        0.31,
        0.9 + i * 0.05,
        0.2 + i * 0.22,
        0.1,
        i * 0.3,
      );
    }
    K.flush(b, g, false);
    const sg = K.sign("EXTRA!\nEXTRA!", "shop", 0.6, 0.5, {
      fg: "#1a1a1a",
      bg: "#e8e0c8",
    });
    sg.position.set(0, 0.62, -0.215);
    sg.rotation.y = Math.PI;
    sg.rotation.x = -0.18;
    g.add(sg);
    return g;
  };

  /** Crate stage with playbill board. */
  K.stage = function (x, y, z, yaw) {
    const g = K.group(x, y, z, yaw, 150);
    const b = builder();
    const wood = mat("wood_planks", 0x6a4a2a),
      red = tint("qx_curtain", 0x7a1a1a, { roughness: 0.95 });
    K.box(b, wood, 3.0, 0.45, 2.0, 0, 0.225, 0);
    K.box(b, wood, 0.08, 2.6, 0.08, -1.45, 1.75, 0.95);
    K.box(b, wood, 0.08, 2.6, 0.08, 1.45, 1.75, 0.95);
    K.box(b, wood, 3.0, 0.1, 0.1, 0, 3.0, 0.95);
    K.box(b, red, 0.6, 2.5, 0.05, -1.15, 1.75, 0.95);
    K.box(b, red, 0.6, 2.5, 0.05, 1.15, 1.75, 0.95);
    K.box(b, wood, 0.08, 1.4, 0.08, 2.2, 0.7, -0.6);
    K.flush(b, g, false);
    const sg = K.sign(
      "TONIGHT!\nHAMLET OF HOBOKEN\nB. BIXBY",
      "marquee",
      1.0,
      0.7,
      { fg: "#fff0c0", bg: "#2a1010", glow: 0.35 },
    );
    sg.position.set(2.2, 1.55, -0.56);
    sg.rotation.y = Math.PI;
    g.add(sg);
    K.collider(x, z, 3.0, 2.0, y, y + 0.45, yaw, "wood");
    return g;
  };

  /** Painted oil-drum drop box. */
  K.dropBox = function (x, y, z, yaw, text) {
    const g = K.group(x, y, z, yaw, 120);
    const b = builder();
    K.cyl(
      b,
      tint("qx_drum", 0x7a2a1a, { roughness: 0.7, metalness: 0.4 }),
      0.3,
      0.9,
      0,
      0.45,
      0,
      14,
    );
    K.cyl(b, mat("rust", 0x6a3a22), 0.31, 0.04, 0, 0.3, 0, 14);
    K.cyl(b, mat("rust", 0x6a3a22), 0.31, 0.04, 0, 0.62, 0, 14);
    K.box(b, mat("metal_panel", 0x555555), 0.25, 0.02, 0.06, 0, 0.905, 0);
    K.flush(b, g, false);
    const sg = K.sign(text || "RANSOM\nDROP", "warning", 0.5, 0.3, {
      fg: "#ffffff",
      bg: "#8a1010",
    });
    sg.position.set(0, 0.55, -0.315);
    sg.rotation.y = Math.PI;
    g.add(sg);
    K.collider(x, z, 0.62, 0.62, y, y + 0.92, 0, "metal");
    return g;
  };

  /** Folding card table with three cards (three-card monte). */
  /**
   * Three-card monte pitch: folding card table (green felt, three red-backed cards face down), a cigar box of
   * folded Scrip and a stack of winnings, the hustler's crate stool behind (local -z), a striped street parasol for a
   * silhouette you can spot from down the avenue, and a hand-lettered cardboard sign propped on a crate.
   */
  K.cardTable = function (x, y, z, yaw) {
    const g = K.group(x, y, z, yaw, 110);
    const b = builder();
    const wood = mat("wood_planks", 0x5a3a20),
      felt = tint("qx_felt", 0x1f4a2a, { roughness: 1 }),
      back = tint("qx_card_back", 0x8a1c1c, { roughness: 0.7 });
    const face = tint("qx_card", 0xece6d4, { roughness: 0.8 }),
      cig = tint("qx_cigarbox", 0x7a3a1a, { roughness: 0.6 }),
      note = tint("qx_scrip_note", 0xc8c8a8, { roughness: 0.95 });
    const stripeA = tint("qx_parasol_a", 0xb83a2a, {
        roughness: 0.9,
        side: THREE.DoubleSide,
      }),
      stripeB = tint("qx_parasol_b", 0xe0d8c0, {
        roughness: 0.9,
        side: THREE.DoubleSide,
      });
    const crate = mat("wood_rotten", 0x6a5030),
      steel = mat("metal_painted", 0x5a6068);
    // table
    K.box(b, wood, 0.9, 0.04, 0.6, 0, 0.72, 0);
    K.box(b, felt, 0.84, 0.01, 0.54, 0, 0.745, 0);
    for (const sx of [-0.38, 0.38])
      K.box(
        b,
        steel,
        0.03,
        0.72,
        0.5,
        sx,
        0.36,
        0,
        0,
        0,
        sx > 0 ? 0.12 : -0.12,
      );
    for (let i = -1; i <= 1; i++) {
      K.box(b, back, 0.07, 0.004, 0.1, i * 0.18, 0.752, 0.02, i * 0.2);
    }
    K.box(b, face, 0.07, 0.004, 0.1, 0.33, 0.752, -0.18, 0.5); // the deck, one card turned
    K.box(b, back, 0.07, 0.03, 0.1, 0.36, 0.765, -0.2, 0.1);
    K.box(b, cig, 0.2, 0.06, 0.13, -0.33, 0.78, -0.17, 0.2);
    K.box(b, cig, 0.2, 0.01, 0.13, -0.33, 0.86, -0.24, 0.2, -1.1); // cigar box, lid open
    for (let i = 0; i < 6; i++)
      K.box(
        b,
        note,
        0.05,
        0.004,
        0.025,
        -0.33 + (i % 3) * 0.03 - 0.03,
        0.8 + 0.002 * i,
        -0.17 + (i > 2 ? 0.03 : -0.02),
        i * 0.5,
      ); // folded notes
    for (let i = 0; i < 7; i++)
      K.box(
        b,
        note,
        0.06,
        0.003,
        0.03,
        -0.12,
        0.752 + i * 0.0035,
        -0.2,
        i * 0.15,
      ); // the winnings stack
    // hustler's crate stool behind the table
    K.box(b, crate, 0.45, 0.45, 0.45, 0.1, 0.225, -1.3, 0.3);
    K.box(b, wood, 0.47, 0.03, 0.47, 0.1, 0.46, -1.3, 0.3);
    // parasol on a weighted stand (behind, to the left)
    const px = -0.75,
      pz = -0.7;
    K.cyl(b, steel, 0.2, 0.08, px, 0.04, pz, 10);
    K.cyl(b, steel, 0.02, 2.3, px, 1.19, pz, 6);
    for (let i = 0; i < 8; i++) {
      const a = ((i + 0.5) / 8) * Math.PI * 2;
      K.box(
        b,
        i % 2 ? stripeA : stripeB,
        0.66,
        0.015,
        0.8,
        px + Math.sin(a) * 0.42,
        2.2,
        pz + Math.cos(a) * 0.42,
        a,
        -0.33,
      );
    }
    K.sphere(b, steel, 0.04, px, 2.38, pz);
    // sign crate out front, to the right
    K.box(b, crate, 0.5, 0.5, 0.5, 0.95, 0.25, 0.55, -0.3);
    K.flush(b, g, false);
    const sg = new THREE.Mesh(
      new THREE.PlaneGeometry(0.62, 0.42),
      new THREE.MeshStandardMaterial({
        map: K.paintSign(
          "FIND THE LADY!\nDOUBLE YOUR SCRIP",
          "#2a1a10",
          "#c8a878",
          "bold italic ",
        ),
        roughness: 1,
        side: THREE.DoubleSide,
      }),
    );
    sg.position.set(0.95, 0.72, 0.62);
    sg.rotation.set(-0.35, -0.3, 0, "YXZ");
    g.add(sg);
    K.collider(x, z, 0.9, 0.6, y, y + 0.75, yaw, "wood");
    const cp = K.local(g, 0.95, 0.55);
    K.collider(cp.x, cp.z, 0.55, 0.55, y, y + 0.5, yaw - 0.3, "wood");
    const pp = K.local(g, px, pz);
    K.collider(pp.x, pp.z, 0.3, 0.3, y, y + 2.2, yaw, "metal");
    return g;
  };

  QX.kit = K;
})();
