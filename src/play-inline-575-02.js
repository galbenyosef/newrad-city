// play-inline-575 02 — box
// Lines 358-584 of readable/play-inline-575.pretty.js (statement-aligned).
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
