// play-inline-544 02 — geo
// Lines 349-693 of readable/play-inline-544.pretty.js (statement-aligned).
  function buildShared() {
    if (M) return;
    let wood = null;
    try {
      if (!G.isStub("mats") && G.mats.get) wood = G.mats.get("wood_planks");
    } catch (e) {
      wood = null;
    }
    M = {
      wood: wood || std({ color: 0x6b5134, roughness: 0.9 }),
      band: std({ color: 0x3a2a1c, roughness: 0.9 }),
      // Keys to the City: gilded bronze (vertex-coloured: gold, darker shadow-gold), velvet, the ribbon
      gold: std({
        vertexColors: true,
        metalness: 0.92,
        roughness: 0.26,
        emissive: 0x2a1a04,
        emissiveIntensity: 0.35,
      }),
      velvet: std({ vertexColors: true, roughness: 0.95, metalness: 0 }),
      plaque: std({ map: plaqueTex(), metalness: 0.6, roughness: 0.35 }),
      vitrine: std({
        color: 0xe8f2f4,
        transparent: true,
        opacity: 0.16,
        roughness: 0.05,
        metalness: 0.6,
        depthWrite: false,
      }),
      lampShade: std({
        color: 0xf0d8a0,
        emissive: 0xffc070,
        emissiveIntensity: 0.55,
        roughness: 0.8,
        side: THREE.DoubleSide,
      }),
      flyer: std({ map: flyerTex(), roughness: 0.9 }),
      miniBase: std({ vertexColors: true, roughness: 0.38, metalness: 0.45 }),
      glint: new THREE.SpriteMaterial({
        map: glintTex(),
        color: 0xffe0a0,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
        opacity: 0.5,
      }),
      cart: null,
      sign: std({ map: souvenirTex(), roughness: 0.8, metalness: 0.15 }),
      canopy: std({
        vertexColors: true,
        roughness: 0.95,
        side: THREE.DoubleSide,
      }),
      // cabinets
      cabGlass: std({
        color: 0xffffff,
        transparent: true,
        opacity: 0.1,
        roughness: 0.04,
        metalness: 0.9,
        depthWrite: false,
      }),
      marq: {},
      screen: {},
      screenLive: null,
    };
    const grime = grimeTex();
    M.cart = std({
      vertexColors: true,
      map: grime,
      roughness: 0.6,
      metalness: 0.35,
    });
    M.prop = std({
      vertexColors: true,
      map: grime,
      roughness: 0.85,
      metalness: 0.05,
    });
    M.cab = std({
      vertexColors: true,
      map: grime,
      roughness: 0.55,
      metalness: 0.15,
    });
    M.glint.userData.shared = true;
    for (const d of AR.GAME_DEFS) {
      const mt = marqueeTex(d);
      M.marq[d.id] = std({
        map: mt,
        emissiveMap: mt,
        emissive: 0xffffff,
        emissiveIntensity: 0.9,
        roughness: 0.5,
      });
      M.screen[d.id] = basic({ map: screenTex(d), toneMapped: false });
    }
    WORLD.liveCanvas = canvasEl(256, 192, (x, w, h) => {
      x.fillStyle = "#000";
      x.fillRect(0, 0, w, h);
    });
    WORLD.liveCtx = WORLD.liveCanvas.getContext("2d");
    const lt = new THREE.CanvasTexture(WORLD.liveCanvas);
    lt.colorSpace = THREE.SRGBColorSpace;
    M.screenLive = basic({ map: lt, toneMapped: false });
    // Key to the City + its presentation box, the furniture it lies on, the flyer board
    GEO.key = keyGeo();
    GEO.ribbon = ribbonGeo();
    GEO.keyBox = keyBoxGeo();
    GEO.keyVelvet = keyVelvetGeo();
    GEO.plaque = new THREE.PlaneGeometry(0.1, 0.05);
    GEO.plaque.rotateX(-0.25);
    GEO.plaque.translate(0, 0.085, -0.084);
    GEO.sets = {
      case: caseGeo(),
      desk: deskGeo(),
      suite: suiteGeo(),
      lectern: lecternGeo(),
    };
    GEO.vitrine = new THREE.BoxGeometry(0.5, 0.4, 0.5);
    GEO.vitrine.translate(0, 1.13, 0);
    GEO.shade = new THREE.CylinderGeometry(0.09, 0.15, 0.17, 14, 1, true);
    GEO.board = boardGeo();
    GEO.boardFace = boardFaceGeo();
    // landmark miniature base
    GEO.mBase = new THREE.CylinderGeometry(0.074, 0.09, 0.056, 24);
    GEO.mBase.translate(0, 0.028, 0);
    GEO.mBand = new THREE.CylinderGeometry(0.0755, 0.0755, 0.008, 24);
    GEO.mBand.translate(0, 0.052, 0);
    GEO.mPlaque = new THREE.BoxGeometry(0.05, 0.02, 0.004);
    GEO.mPlaque.translate(0, 0.028, 0.086);
    GEO.mFelt = new THREE.CylinderGeometry(0.066, 0.066, 0.006, 24);
    GEO.mFelt.translate(0, 0.059, 0);
    // set dressing
    GEO.cart = cartGeo();
    GEO.canopy = canopyGeo();
    GEO.cartSign = cartSignGeo();
    // cabinets
    GEO.cab = {};
    for (const st of ["wood", "chrome", "space"]) GEO.cab[st] = cabinetGeo(st);
    GEO.battery = batteryGeo();
    GEO.screen = new THREE.PlaneGeometry(0.46, 0.345);
    GEO.screen.rotateX(-SCREEN_TILT);
    GEO.screen.translate(0, 1.285, 0.142);
    GEO.screenGlass = new THREE.PlaneGeometry(0.5, 0.38);
    GEO.screenGlass.rotateX(-SCREEN_TILT);
    GEO.screenGlass.translate(0, 1.285, 0.152);
    GEO.marquee = new THREE.PlaneGeometry(0.58, 0.2);
    GEO.marquee.translate(0, 1.685, 0.283);
  }

  // ------------------------------------------------------------------
  // The arcade cabinet (original upright design). Local frame: front faces +z,
  // origin on the floor at the footprint centre, 0.66 m wide, 1.82 m tall.
  // Side profile (z, y): back → kick panel → control-panel lip → panel slope →
  // tilted monitor bezel → speaker hood → marquee box → roof.
  // ------------------------------------------------------------------
  const SCREEN_TILT = 0.18;
  const CAB_STYLE = {
    wood: {
      side: 0x6a4426,
      face: 0x1b1410,
      trim: 0xe8dcc0,
      art: [0xff7a3a, 0xffd23a],
      kick: 0x1a1a1a,
    },
    chrome: {
      side: 0x1c1c20,
      face: 0x0e0e10,
      trim: 0xc8ccd2,
      art: [0xffd23a, 0xc8ccd2],
      kick: 0x2a2a2e,
    },
    space: {
      side: 0x1b1f5a,
      face: 0x0b0d24,
      trim: 0xff4a8a,
      art: [0xff4a8a, 0x5fe0ff],
      kick: 0x101010,
    },
  };
  function cabinetGeo(style) {
    const S = CAB_STYLE[style] || CAB_STYLE.wood,
      P = [];
    // side panels: extruded profile (shape x = local z, shape y = local y)
    const pr = [
      [-0.38, 0],
      [0.3, 0],
      [0.3, 0.84],
      [0.44, 0.9],
      [0.44, 0.97],
      [0.18, 1.05],
      [0.1, 1.5],
      [0.28, 1.55],
      [0.28, 1.82],
      [-0.38, 1.82],
    ];
    const sh = new THREE.Shape();
    sh.moveTo(pr[0][0], pr[0][1]);
    for (let i = 1; i < pr.length; i++) sh.lineTo(pr[i][0], pr[i][1]);
    sh.closePath();
    const side = new THREE.ExtrudeGeometry(sh, {
      depth: 0.025,
      bevelEnabled: false,
    });
    P.push(
      G.util.paint(
        G.util.bake(side, { x: -0.305, y: 0, z: 0 }, -PI / 2),
        S.side,
      ),
      G.util.paint(G.util.bake(side, { x: 0.33, y: 0, z: 0 }, -PI / 2), S.side),
    );
    // T-molding along the side front edges (thin strips, trim colour)
    for (const sx of [-0.318, 0.318]) {
      for (let i = 1; i < pr.length - 1; i++) {
        const a = pr[i - 1],
          b = pr[i];
        if (i === 1) continue;
        const dz = b[0] - a[0],
          dy = b[1] - a[1],
          len = Math.hypot(dz, dy);
        P.push(
          part(
            box(0.03, 0.012, len),
            sx,
            (a[1] + b[1]) / 2,
            (a[0] + b[0]) / 2,
            S.trim,
            0,
            -Math.atan2(dy, dz),
          ),
        );
      }
    }
    // side art: two diagonal stripes on the outer faces
    for (const sx of [-0.332, 0.332]) {
      P.push(
        part(box(0.004, 0.07, 0.62), sx, 0.62, -0.06, S.art[0], 0, -0.55),
        part(box(0.004, 0.03, 0.62), sx, 0.5, -0.02, S.art[1], 0, -0.55),
      );
    }
    // body panels
    P.push(part(box(0.61, 1.82, 0.02), 0, 0.91, -0.37, S.face)); // back
    P.push(part(box(0.61, 0.02, 0.66), 0, 1.81, -0.05, S.face)); // roof
    P.push(part(box(0.61, 0.84, 0.02), 0, 0.42, 0.29, S.face)); // kick panel
    P.push(part(box(0.66, 0.06, 0.72), 0, 0.03, -0.04, S.kick)); // plinth
    P.push(part(box(0.61, 0.08, 0.15), 0, 0.875, 0.37, S.face, 0, -0.405)); // under the control panel
    P.push(part(box(0.61, 0.08, 0.02), 0, 0.935, 0.44, S.trim)); // control panel front lip
    P.push(part(box(0.61, 0.05, 0.28), 0, 0.985, 0.31, 0x24242a, 0, 0.298)); // control panel slope
    // coin door: plate, two lit slot plates, a key lock, the return cup
    P.push(part(box(0.3, 0.36, 0.012), 0, 0.44, 0.302, 0x3a3a40));
    for (const x of [-0.07, 0.07])
      P.push(
        part(box(0.06, 0.09, 0.012), x, 0.52, 0.31, 0xff3a2a),
        part(box(0.008, 0.04, 0.014), x, 0.52, 0.312, 0x1a0a08),
      );
    P.push(
      part(cyl(0.012, 0.012, 0.012, 8), 0.1, 0.36, 0.31, 0xb8bcc0, 0, PI / 2),
      part(box(0.08, 0.05, 0.03), 0, 0.33, 0.31, 0x101010),
    );
    // joystick + three buttons (on the slope)
    const yOn = (z) => 0.97 + ((0.44 - z) * 0.08) / 0.26 + 0.025;
    P.push(
      part(
        cyl(0.03, 0.03, 0.006, 12),
        -0.14,
        yOn(0.31),
        0.31,
        0x0a0a0a,
        0,
        0.298,
      ),
      part(
        cyl(0.007, 0.007, 0.07, 6),
        -0.14,
        yOn(0.31) + 0.035,
        0.31,
        0x9a9aa0,
      ),
      part(
        new THREE.SphereGeometry(0.022, 10, 8),
        -0.14,
        yOn(0.31) + 0.075,
        0.31,
        0xd8261c,
      ),
    );
    [
      [0.02, 0xffd23a],
      [0.08, 0x5fe0ff],
      [0.14, 0xff4a8a],
    ].forEach((b) =>
      P.push(
        part(
          cyl(0.016, 0.016, 0.016, 10),
          b[0],
          yOn(0.3) + 0.006,
          0.3,
          b[1],
          0,
          0.298,
        ),
      ),
    );
    // monitor bezel (tilted back), speaker hood, marquee box
    P.push(
      part(box(0.61, 0.447, 0.02), 0, 1.28, 0.125, 0x0c0c0e, 0, -SCREEN_TILT),
    );
    P.push(part(box(0.61, 0.05, 0.19), 0, 1.525, 0.19, 0x202024));
    for (let k = 0; k < 5; k++)
      P.push(part(box(0.5, 0.004, 0.01), 0, 1.5, 0.12 + k * 0.03, 0x060606)); // grille slots
    P.push(part(box(0.61, 0.26, 0.02), 0, 1.685, 0.265, 0x0a0a0a));
    P.push(
      part(box(0.61, 0.012, 0.02), 0, 1.81, 0.29, S.trim),
      part(box(0.61, 0.012, 0.02), 0, 1.56, 0.29, S.trim),
    );
    return G.util.mergeGeometries(P);
  }
  /** Street cabinets: a car battery on the pavement behind, a cable up into the back panel. */
  function batteryGeo() {
    const P = [];
    P.push(
      part(box(0.26, 0.2, 0.17), 0.46, 0.1, -0.3, 0x1a1a1a),
      part(box(0.27, 0.02, 0.18), 0.46, 0.205, -0.3, 0x2a2a2a),
    );
    P.push(
      part(cyl(0.012, 0.012, 0.03, 6), 0.38, 0.225, -0.3, 0xc0281e),
      part(cyl(0.012, 0.012, 0.03, 6), 0.54, 0.225, -0.3, 0x9a9aa0),
    );
    P.push(
      part(cyl(0.006, 0.006, 0.5, 4), 0.42, 0.42, -0.36, 0x0a0a0a, 0, 0, 0.5),
      part(cyl(0.006, 0.006, 0.3, 4), 0.25, 0.6, -0.38, 0x0a0a0a, 0, 0, 1.2),
    );
    return G.util.mergeGeometries(P);
  }

  function part(geo, x, y, z, col, ry, rx, rz) {
    return G.util.paint(
      G.util.bake(geo, { x, y, z }, ry || 0, 1, rx || 0, rz || 0),
      col,
    );
  }
  const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const cyl = (r0, r1, h, s) => new THREE.CylinderGeometry(r0, r1, h, s || 10);
  const cone = (r, h, s) => new THREE.ConeGeometry(r, h, s || 10);
