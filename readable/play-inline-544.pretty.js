/* src/arcade/40_world.js */
/* =====================================================================
 * arcade — 40_world.js
 * Things placed in the city:
 *   · ARCADE CABINETS — original upright cabinets (lit marquee with the
 *     game's title art, dark bezel + tilted monitor with a glass pane,
 *     control panel with stick + three buttons, coin door with lit slots,
 *     side art), three styles: wood / chrome / space. Three stand in the
 *     Rad Room (Times Square, the Neon) by the door, three on street
 *     corners wired to a car battery. Interact "Play" → the cabinet screen.
 *     The nearest cabinet's monitor runs the live attract demo.
 *   · LANDMARK MINIATURES — die-cast souvenirs on abandoned street-vendor
 *     carts (tattered umbrella, spilled stock, sometimes the vendor).
 *   · KEYS TO THE CITY — sixteen ceremonial gold keys (gilded bow with the
 *     trefoil and the seal, collar, long shaft, working bit, a red-white-and-
 *     blue ribbon) in open presentation boxes, each set down where its
 *     recipient left it: a museum display case, a writing desk, a hotel
 *     side table, City Hall's presentation lectern. Placed on a free floor
 *     spot next to a landmark / POI anchor (interiors included), else on the
 *     street outside the site. Plus two "THE KEYS COME HOME" flyer boards
 *     (Chambers Street by the cryo exit, Gracie Mansion's front hall) that
 *     start the hunt.
 * Street spots are sidewalk / plaza places near a hint (spiral search: land,
 * off the roadway, outside building footprints, clear of colliders).
 * Placed once at `initDone` (static world); what the player has taken is
 * run state (AR.STATE, saved) → meshes hide / interactables disable.
 * Shared geometry & materials; one Group per spot with an LOD.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const AR = G.arcade._;

  const WORLD = {
    entries: [],
    placed: false,
    t: 0,
    live: null,
    liveT: 0,
    liveDt: 0,
    liveHolder: { inst: null, t: 0 },
  };
  AR.world = WORLD;
  let M = null; // materials
  const GEO = {}; // shared geometries
  const PI = Math.PI;

  // ------------------------------------------------------------------
  // Canvas textures
  // ------------------------------------------------------------------
  function canvasEl(w, h, fn) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    fn(c.getContext("2d"), w, h);
    return c;
  }
  function canvasTex(w, h, fn) {
    const t = new THREE.CanvasTexture(canvasEl(w, h, fn));
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  /** "THE KEYS COME HOME" flyer (Office of the Mayor, February 1967): cream stock, navy and gold, a drawn key. */
  function flyerTex() {
    return canvasTex(384, 512, (x, w, h) => {
      const r = G.util.rng(1967);
      x.fillStyle = "#ece4cc";
      x.fillRect(0, 0, w, h);
      x.strokeStyle = "#1e2f5a";
      x.lineWidth = 6;
      x.strokeRect(10, 10, w - 20, h - 20);
      x.lineWidth = 1.5;
      x.strokeRect(19, 19, w - 38, h - 38);
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.fillStyle = "#1e2f5a";
      x.font = 'bold 15px Georgia, "Times New Roman", serif';
      x.fillText("THE OFFICE OF THE MAYOR", w / 2, 46);
      x.font = "italic 13px Georgia, serif";
      x.fillText("requests the pleasure of your company", w / 2, 66);
      x.font = 'bold 46px Georgia, "Times New Roman", serif';
      x.fillText("THE KEYS", w / 2, 112);
      x.fillText("COME HOME", w / 2, 160, w - 50);
      // a big ceremonial key across the middle
      const ky = 232;
      x.fillStyle = "#b8862a";
      x.strokeStyle = "#6a4a14";
      x.lineWidth = 2;
      x.beginPath();
      x.arc(92, ky, 30, 0, Math.PI * 2);
      x.fill();
      x.stroke();
      for (const a of [-1, 0, 1]) {
        x.beginPath();
        x.arc(
          92 + Math.cos(Math.PI + a * 1.2) * 34,
          ky + Math.sin(Math.PI + a * 1.2) * 34,
          11,
          0,
          Math.PI * 2,
        );
        x.fill();
        x.stroke();
      }
      x.fillStyle = "#ece4cc";
      x.beginPath();
      x.arc(92, ky, 13, 0, Math.PI * 2);
      x.fill();
      x.fillStyle = "#b8862a";
      x.fillRect(122, ky - 6, 168, 12);
      x.strokeRect(122, ky - 6, 168, 12);
      x.fillRect(128, ky - 10, 8, 20);
      x.fillRect(140, ky - 9, 6, 18);
      x.fillRect(254, ky + 6, 36, 24);
      x.fillStyle = "#ece4cc";
      x.fillRect(262, ky + 18, 8, 12);
      x.fillStyle = "#b01e22";
      x.fillRect(74, ky + 30, 6, 46);
      x.fillStyle = "#f4f0e4";
      x.fillRect(80, ky + 30, 6, 52);
      x.fillStyle = "#1e2f5a";
      x.fillRect(86, ky + 30, 6, 44);
      x.fillStyle = "#1e2f5a";
      x.font = "15px Georgia, serif";
      const lines = [
        "Sixteen Keys to the City, presented by the",
        "Mayors of New York, 1954 to 1967,",
        "shown together for the first time.",
      ];
      lines.forEach((l, i) => x.fillText(l, w / 2, 330 + i * 21, w - 50));
      x.font = "bold 19px Georgia, serif";
      x.fillText("GRACIE MANSION", w / 2, 410);
      x.font = "bold 15px Georgia, serif";
      x.fillText("SUNDAY, MARCH 12, 1967 · TWO O'CLOCK", w / 2, 436, w - 40);
      x.font = "italic 14px Georgia, serif";
      x.fillText("Francis X. Delahunt, Mayor", w / 2, 470);
      // age: foxing, a damp tide line, a torn corner, a pencilled note
      for (let i = 0; i < 30; i++) {
        const px = r() * w,
          py = r() * h,
          rr = 2 + r() * 10;
        const g = x.createRadialGradient(px, py, 0, px, py, rr);
        g.addColorStop(0, "rgba(120,80,30,0.35)");
        g.addColorStop(1, "rgba(120,80,30,0)");
        x.fillStyle = g;
        x.fillRect(px - rr, py - rr, rr * 2, rr * 2);
      }
      x.fillStyle = "rgba(110,80,40,0.16)";
      x.fillRect(0, h * 0.86, w, h * 0.14);
      x.save();
      x.translate(w - 70, 286);
      x.rotate(-0.12);
      x.fillStyle = "rgba(60,60,70,0.7)";
      x.font = 'italic 12px "Comic Sans MS", cursive, sans-serif';
      x.fillText("16 bits, 16 locks", 0, 0);
      x.restore();
      x.globalCompositeOperation = "destination-out";
      x.beginPath();
      x.moveTo(w, 0);
      x.lineTo(w - 46, 0);
      x.lineTo(w, 52);
      x.fill();
      x.globalCompositeOperation = "source-over";
    });
  }
  /** Brass plaque inside a presentation box's lid. */
  function plaqueTex() {
    return canvasTex(128, 64, (x, w, h) => {
      const g = x.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#e2c068");
      g.addColorStop(0.5, "#b88a30");
      g.addColorStop(1, "#d8b458");
      x.fillStyle = g;
      x.fillRect(0, 0, w, h);
      x.strokeStyle = "#6a4a14";
      x.lineWidth = 2;
      x.strokeRect(3, 3, w - 6, h - 6);
      x.fillStyle = "#3a2808";
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.font = "bold 13px Georgia, serif";
      x.fillText("THE KEY", w / 2, 21);
      x.fillText("TO THE CITY", w / 2, 38);
      x.font = "8px Georgia, serif";
      x.fillText("CITY OF NEW YORK", w / 2, 53);
    });
  }
  function glintTex() {
    return canvasTex(64, 64, (x, w, h) => {
      const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.2, "rgba(220,235,255,0.5)");
      g.addColorStop(1, "rgba(200,220,255,0)");
      x.fillStyle = g;
      x.fillRect(0, 0, w, h);
      x.fillStyle = "rgba(255,255,255,0.8)";
      x.fillRect(31, 4, 2, 56);
      x.fillRect(4, 31, 56, 2);
    });
  }

  /** Old-world street-vendor cart panel: "GREETINGS FROM NEW YORK" with a big red apple. Faded, rusted, scratched. */
  function souvenirTex() {
    return canvasTex(512, 192, (x, w, h) => {
      const r = G.util.rng(771);
      x.fillStyle = "#e6dcc0";
      x.fillRect(0, 0, w, h);
      x.fillStyle = "#a92a22";
      x.fillRect(0, 0, w, 36);
      x.fillStyle = "#1f3f76";
      x.fillRect(0, h - 30, w, 30);
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.fillStyle = "#f3ead2";
      x.font = 'bold 25px "Arial Black", Arial, sans-serif';
      x.fillText("GENUINE NEW YORK SOUVENIRS", w / 2, 19, w - 20);
      x.fillStyle = "#181818";
      x.font = 'bold 54px Georgia, "Times New Roman", serif';
      x.fillText("GREETINGS", w * 0.3, 78);
      x.fillText("FROM N.Y.", w * 0.3, 128);
      // the Big Apple
      const ax = w * 0.78,
        ay = 104;
      x.fillStyle = "#c0281e";
      x.beginPath();
      x.arc(ax - 16, ay, 34, 0, PI * 2);
      x.arc(ax + 16, ay, 34, 0, PI * 2);
      x.fill();
      x.fillStyle = "#5a3a1a";
      x.fillRect(ax - 3, ay - 52, 6, 20);
      x.fillStyle = "#4a7a2a";
      x.beginPath();
      x.ellipse(ax + 16, ay - 44, 16, 7, -0.4, 0, PI * 2);
      x.fill();
      x.fillStyle = "rgba(255,255,255,0.35)";
      x.beginPath();
      x.ellipse(ax - 26, ay - 14, 8, 14, 0.4, 0, PI * 2);
      x.fill();
      x.fillStyle = "#f3ead2";
      x.font = "bold 16px Arial, sans-serif";
      x.fillText(
        "MINIATURES  ·  POSTCARDS  ·  PENNANTS  ·  ALL 25¢",
        w / 2,
        h - 15,
        w - 20,
      );
      // weathering: sun-fade, rust blooms, streaks, scratches
      x.fillStyle = "rgba(255,248,225,0.18)";
      x.fillRect(0, 0, w, h * 0.55);
      for (let i = 0; i < 38; i++) {
        const px = r() * w,
          py = r() * h,
          rr = 3 + r() * 16;
        const g = x.createRadialGradient(px, py, 0, px, py, rr);
        g.addColorStop(0, "rgba(96,48,20,0.75)");
        g.addColorStop(0.6, "rgba(140,80,40,0.35)");
        g.addColorStop(1, "rgba(140,80,40,0)");
        x.fillStyle = g;
        x.fillRect(px - rr, py - rr, rr * 2, rr * 2);
      }
      for (let i = 0; i < 26; i++) {
        const px = r() * w;
        x.fillStyle = "rgba(90,50,25," + (0.12 + r() * 0.2) + ")";
        x.fillRect(px, r() * h * 0.5, 1 + r() * 3, 30 + r() * 90);
      }
      x.strokeStyle = "rgba(40,30,20,0.35)";
      x.lineWidth = 1;
      for (let i = 0; i < 40; i++) {
        const px = r() * w,
          py = r() * h;
        x.beginPath();
        x.moveTo(px, py);
        x.lineTo(px + (r() - 0.5) * 40, py + (r() - 0.5) * 8);
        x.stroke();
      }
      x.fillStyle = "rgba(30,24,18,0.35)";
      x.fillRect(0, h - 10, w, 10);
    });
  }
  /** A cabinet's marquee (the game's title art, back-lit). */
  function marqueeTex(def) {
    return canvasTex(512, 176, (x, w, h) => {
      AR.drawMarquee(x, w, h, def);
    });
  }
  /** A cabinet monitor's idle picture: a frame of the game's attract demo + PRESS START band. */
  function screenTex(def) {
    return canvasTex(256, 192, (x, w, h) => {
      x.fillStyle = "#000";
      x.fillRect(0, 0, w, h);
      try {
        const holder = { inst: null, t: 0 };
        for (let i = 0; i < 70; i++) AR.tickDemo(holder, def.id, 1 / 20);
        holder.clock = 0;
        AR.renderAttract(holder, def.id, 0, x, w, h);
      } catch (e) {
        G.reportError("arcade:screenTex", e);
      }
    });
  }

  /** Neutral grime overlay for vertex-coloured props: white with rust blooms & dirt pooling at the bottom (UV v=0). */
  function grimeTex() {
    return canvasTex(256, 256, (x, w, h) => {
      const r = G.util.rng(4242);
      x.fillStyle = "#ffffff";
      x.fillRect(0, 0, w, h);
      const g = x.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(0.7, "rgba(70,55,40,0.12)");
      g.addColorStop(1, "rgba(50,38,26,0.5)");
      x.fillStyle = g;
      x.fillRect(0, 0, w, h);
      for (let i = 0; i < 70; i++) {
        const px = r() * w,
          py = r() * h,
          rr = 2 + r() * 14;
        const gg = x.createRadialGradient(px, py, 0, px, py, rr);
        gg.addColorStop(0, "rgba(120,62,28,0.38)");
        gg.addColorStop(1, "rgba(120,62,28,0)");
        x.fillStyle = gg;
        x.fillRect(px - rr, py - rr, rr * 2, rr * 2);
      }
      for (let i = 0; i < 40; i++) {
        x.fillStyle = "rgba(80,50,30," + (0.08 + r() * 0.15) + ")";
        x.fillRect(r() * w, r() * h * 0.6, 1 + r() * 2, 20 + r() * 70);
      }
      for (let i = 0; i < 400; i++) {
        x.fillStyle = "rgba(0,0,0," + r() * 0.12 + ")";
        x.fillRect(r() * w, r() * h, 1, 1);
      }
    });
  }

  // ------------------------------------------------------------------
  // Materials & geometries (built once)
  // ------------------------------------------------------------------
  function std(o) {
    const m = new THREE.MeshStandardMaterial(o);
    m.userData.shared = true;
    return m;
  }
  function basic(o) {
    const m = new THREE.MeshBasicMaterial(o);
    m.userData.shared = true;
    return m;
  }
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
  function miniGeo(id) {
    const P = [];
    const STONE = 0xd8cfb8,
      CREAM = 0xe6dcc0,
      SILVER = 0xe0e4e8,
      COPPER = 0x7fb8a0,
      GOLD = 0xd8b048,
      GREEN = 0x3e7a3a;
    switch (id) {
      case "empire":
        P.push(
          part(box(0.05, 0.04, 0.036), 0, 0.02, 0, STONE),
          part(box(0.04, 0.03, 0.028), 0, 0.055, 0, STONE),
          part(box(0.03, 0.02, 0.02), 0, 0.08, 0, STONE),
          part(box(0.018, 0.012, 0.012), 0, 0.096, 0, STONE),
          part(cyl(0.004, 0.006, 0.012), 0, 0.108, 0, SILVER),
          part(cyl(0.0012, 0.002, 0.02), 0, 0.124, 0, SILVER),
        );
        break;
      case "chrysler":
        P.push(
          part(box(0.04, 0.05, 0.04), 0, 0.025, 0, STONE),
          part(box(0.03, 0.022, 0.03), 0, 0.061, 0, STONE),
          part(cone(0.022, 0.034, 4), 0, 0.089, 0, SILVER, Math.PI / 4),
          part(cyl(0.0008, 0.002, 0.022), 0, 0.117, 0, SILVER),
        );
        break;
      case "liberty":
        P.push(
          part(box(0.046, 0.032, 0.046), 0, 0.016, 0, STONE),
          part(cyl(0.012, 0.018, 0.05, 10), 0, 0.057, 0, COPPER),
          part(new THREE.SphereGeometry(0.0075, 10, 8), 0, 0.088, 0, COPPER),
          part(cone(0.009, 0.007, 7), 0, 0.097, 0, COPPER),
          part(cyl(0.0028, 0.0028, 0.03), 0.009, 0.1, 0, COPPER, 0, 0, -0.2),
          part(cone(0.0045, 0.01, 6), 0.012, 0.118, 0, GOLD),
        );
        break;
      case "bridge":
        P.push(
          part(box(0.012, 0.075, 0.016), -0.03, 0.0375, 0, STONE),
          part(box(0.012, 0.075, 0.016), 0.03, 0.0375, 0, STONE),
          part(box(0.12, 0.004, 0.016), 0, 0.03, 0, 0x8a8478),
          part(
            box(0.004, 0.002, 0.052),
            -0.047,
            0.052,
            0,
            0x9aa0a8,
            Math.PI / 2,
            0,
            0.9,
          ),
          part(
            box(0.004, 0.002, 0.052),
            0.047,
            0.052,
            0,
            0x9aa0a8,
            Math.PI / 2,
            0,
            -0.9,
          ),
          part(box(0.06, 0.0015, 0.002), 0, 0.064, 0.006, 0x9aa0a8),
          part(box(0.06, 0.0015, 0.002), 0, 0.064, -0.006, 0x9aa0a8),
        );
        break;
      case "grand_central":
        P.push(
          part(box(0.085, 0.036, 0.03), 0, 0.018, 0, CREAM),
          part(box(0.05, 0.012, 0.026), 0, 0.042, 0, CREAM),
          part(
            cyl(0.008, 0.008, 0.004, 14),
            0,
            0.03,
            0.016,
            GOLD,
            0,
            Math.PI / 2,
          ),
          part(cone(0.006, 0.016, 6), 0, 0.056, 0, COPPER),
          part(box(0.012, 0.022, 0.002), -0.025, 0.016, 0.0155, 0x5a4a3a),
          part(box(0.012, 0.022, 0.002), 0, 0.012, 0.0155, 0x5a4a3a),
          part(box(0.012, 0.022, 0.002), 0.025, 0.016, 0.0155, 0x5a4a3a),
        );
        break;
      case "flatiron":
        P.push(
          part(cyl(0.04, 0.04, 0.07, 3), 0, 0.035, 0, 0xd9cdb5, Math.PI / 6),
          part(cyl(0.041, 0.041, 0.006, 3), 0, 0.072, 0, 0xb8ab93, Math.PI / 6),
        );
        break;
      case "times_square":
        P.push(
          part(box(0.02, 0.08, 0.02), 0, 0.04, 0, STONE),
          part(box(0.022, 0.018, 0.003), 0, 0.06, 0.011, 0xd23b2a),
          part(box(0.024, 0.055, 0.02), -0.03, 0.0275, 0.004, 0x8c8478),
          part(box(0.022, 0.02, 0.003), -0.03, 0.04, 0.015, 0xe8c040),
          part(box(0.024, 0.045, 0.02), 0.03, 0.0225, -0.004, 0x8c8478),
          part(box(0.022, 0.022, 0.003), 0.03, 0.03, 0.007, 0x3a6fd0),
          part(new THREE.SphereGeometry(0.005, 8, 6), 0, 0.087, 0, 0xf0f0f0),
        );
        break;
      default: // central_park — Angel of the Waters
        P.push(
          part(cyl(0.036, 0.04, 0.01, 18), 0, 0.005, 0, STONE),
          part(cyl(0.028, 0.028, 0.004, 18), 0, 0.011, 0, 0x6aa8c8),
          part(cyl(0.004, 0.006, 0.03), 0, 0.028, 0, STONE),
          part(cone(0.008, 0.022, 8), 0, 0.052, 0, COPPER),
          part(box(0.028, 0.009, 0.002), 0, 0.062, -0.002, COPPER),
          part(new THREE.SphereGeometry(0.004, 8, 6), 0, 0.066, 0, COPPER),
          part(cone(0.012, 0.04, 8), -0.048, 0.02, -0.01, GREEN),
          part(cone(0.011, 0.034, 8), 0.05, 0.017, 0.006, GREEN),
          part(cone(0.009, 0.028, 8), 0.02, 0.014, -0.045, GREEN),
        );
    }
    return G.util.mergeGeometries(P);
  }

  // ------------------------------------------------------------------
  // Set dressing: street-vendor souvenir cart (miniatures), the furniture the
  // Keys to the City lie on, the flyer board. Built once, shared by every spot.
  // ------------------------------------------------------------------
  function cartGeo() {
    const P = [];
    const STEEL = 0x9ba3a7,
      STEEL_D = 0x656d71,
      TOP = 0xb9bec0,
      RUB = 0x1d1d1d,
      WOOD = 0x7a5a3a,
      WOOD_D = 0x5e4430;
    const LIB = 0x6fa58f,
      MUG = 0xe6e0d0,
      TAXI = 0xd6a91c,
      PEN = 0xa8322a;
    P.push(part(box(1.3, 0.6, 0.66), 0, 0.66, 0, STEEL)); // body
    P.push(part(box(1.24, 0.05, 0.6), 0, 0.345, 0, STEEL_D)); // lower frame
    P.push(part(box(1.36, 0.04, 0.74), 0, 0.98, 0, TOP)); // counter
    P.push(
      part(box(1.36, 0.07, 0.02), 0, 1.03, -0.36, TOP),
      part(box(0.02, 0.07, 0.74), -0.67, 1.03, 0, TOP),
      part(box(0.02, 0.07, 0.74), 0.67, 1.03, 0, TOP),
    );
    P.push(
      part(box(1.32, 0.02, 0.02), 0, 0.95, 0.335, STEEL_D),
      part(box(1.32, 0.02, 0.02), 0, 0.38, 0.335, STEEL_D),
    ); // panel trim
    for (const z of [-0.36, 0.36]) {
      // spoked wheels
      P.push(
        part(cyl(0.2, 0.2, 0.06, 16), -0.42, 0.2, z, RUB, 0, PI / 2),
        part(cyl(0.07, 0.07, 0.075, 8), -0.42, 0.2, z, STEEL_D, 0, PI / 2),
      );
      for (let k = 0; k < 3; k++)
        P.push(
          part(
            box(0.3, 0.015, 0.02),
            -0.42,
            0.2,
            z,
            STEEL_D,
            0,
            0,
            (k * PI) / 3,
          ),
        );
    }
    P.push(part(cyl(0.02, 0.02, 0.76, 6), -0.42, 0.2, 0, STEEL_D, 0, PI / 2)); // axle
    for (const z of [-0.27, 0.27])
      P.push(part(box(0.05, 0.36, 0.05), 0.55, 0.18, z, STEEL_D)); // legs
    P.push(
      part(cyl(0.018, 0.018, 0.64, 6), 0.8, 0.93, 0, STEEL_D, 0, PI / 2), // push handle
      part(box(0.18, 0.03, 0.03), 0.72, 0.93, -0.3, STEEL_D),
      part(box(0.18, 0.03, 0.03), 0.72, 0.93, 0.3, STEEL_D),
    );
    P.push(
      part(cyl(0.017, 0.017, 1.5, 6), -0.52, 1.72, -0.2, STEEL_D, 0, 0, 0.09),
    ); // umbrella pole (leaning)
    P.push(
      part(box(0.86, 0.12, 0.2), 0.16, 1.06, -0.23, WOOD),
      part(box(0.86, 0.24, 0.12), 0.16, 1.12, -0.31, WOOD_D),
    ); // stepped display rack
    for (let i = 0; i < 4; i++) {
      // Liberty statuettes (one toppled)
      const x = -0.18 + i * 0.2;
      if (i === 2) {
        P.push(
          part(cyl(0.017, 0.024, 0.1, 6), x, 1.135, -0.2, LIB, 0.4, 0, PI / 2),
        );
        continue;
      }
      P.push(
        part(box(0.045, 0.02, 0.045), x, 1.13, -0.22, LIB),
        part(cyl(0.015, 0.022, 0.1, 6), x, 1.19, -0.22, LIB),
        part(new THREE.SphereGeometry(0.013, 6, 5), x, 1.252, -0.22, LIB),
        part(
          cyl(0.004, 0.004, 0.05, 4),
          x + 0.016,
          1.262,
          -0.22,
          LIB,
          0,
          0,
          -0.35,
        ),
        part(cone(0.008, 0.016, 5), x + 0.024, 1.292, -0.22, 0xd8b048),
      );
    }
    for (let i = 0; i < 5; i++)
      P.push(
        part(
          cyl(0.028, 0.026, 0.07, 8),
          -0.16 + i * 0.16,
          1.275,
          -0.31,
          i === 3 ? PEN : MUG,
        ),
      ); // mugs
    P.push(
      part(box(0.1, 0.035, 0.045), 0.46, 1.018, 0.2, TAXI, 0.5),
      part(box(0.05, 0.02, 0.04), 0.46, 1.045, 0.2, TAXI, 0.5),
    ); // toy taxi
    P.push(
      part(box(0.14, 0.004, 0.09), -0.42, 1.002, 0.16, 0xd9cfa8, 0.2),
      part(box(0.14, 0.004, 0.09), -0.38, 1.006, 0.2, 0xc4d0d8, -0.3),
    ); // postcards
    // pennant string between pole and rack
    P.push(
      part(cyl(0.008, 0.008, 0.34, 4), 0.57, 1.4, -0.34, STEEL_D), // pennant post on the rack
      part(
        cyl(0.004, 0.004, 1.14, 4),
        0.015,
        1.555,
        -0.34,
        0x2a2a2a,
        0,
        0,
        PI / 2 - 0.04,
      ),
    ); // string from the umbrella pole
    for (let i = 0; i < 5; i++)
      P.push(
        part(
          cone(0.03, 0.12, 3),
          -0.4 + i * 0.22,
          1.5 + (i - 2) * 0.01 * -1,
          -0.34,
          i % 2 ? PEN : 0x2c4f86,
          0,
          PI,
          0,
        ),
      );
    // spilled stock on the pavement
    P.push(
      part(cyl(0.028, 0.026, 0.07, 8), 0.35, 0.03, 0.55, MUG, 0.3, PI / 2),
      part(box(0.14, 0.004, 0.09), 0.1, 0.004, 0.62, 0xd9cfa8, 0.9),
      part(box(0.14, 0.004, 0.09), -0.25, 0.004, 0.5, 0xc4d0d8, 2.1),
      part(cyl(0.017, 0.024, 0.1, 6), 0.62, 0.024, -0.5, LIB, 1.2, 0, PI / 2),
    );
    return G.util.mergeGeometries(P);
  }
  /** Tattered vendor umbrella: striped cone, one panel torn away, slight droop. */
  function canopyGeo() {
    const segs = 12,
      g = new THREE.ConeGeometry(0.98, 0.34, segs, 1, true).toNonIndexed();
    const pos = g.attributes.position,
      n = pos.count,
      keep = [],
      col = [];
    const A = new THREE.Color(0xc9a53e),
      B = new THREE.Color(0x2c5783);
    for (let t = 0; t < n; t += 3) {
      const cx = (pos.getX(t) + pos.getX(t + 1) + pos.getX(t + 2)) / 3,
        cz = (pos.getZ(t) + pos.getZ(t + 1) + pos.getZ(t + 2)) / 3;
      const seg =
        Math.floor(((Math.atan2(cz, cx) + PI) / (2 * PI)) * segs) % segs;
      if (seg === 4) continue; // torn panel
      const c = seg % 2 ? A : B;
      for (let k = 0; k < 3; k++) {
        const i = t + k;
        let y = pos.getY(i);
        const x = pos.getX(i),
          z = pos.getZ(i);
        if (y < 0) y -= 0.05 * (0.5 + 0.5 * Math.sin(Math.atan2(z, x) * 3)); // droopy hem
        keep.push(x, y, z);
        col.push(c.r * 0.82, c.g * 0.82, c.b * 0.82);
      }
    }
    const out = new THREE.BufferGeometry();
    out.setAttribute("position", new THREE.Float32BufferAttribute(keep, 3));
    out.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    out.computeVertexNormals();
    return G.util.bake(out, { x: -0.587, y: 2.44, z: -0.2 }, 0, 1, 0, 0.09);
  }
  function cartSignGeo() {
    const a = new THREE.PlaneGeometry(1.18, 0.5);
    a.translate(0, 0.66, 0.332);
    const b = new THREE.PlaneGeometry(1.18, 0.5);
    b.rotateY(PI);
    b.translate(0, 0.66, -0.332);
    return G.util.mergeGeometries([a, b]);
  }
  // ------------------------------------------------------------------
  // The Key to the City. Local frame: lying flat (thickness along y), the bow
  // at the origin end, the shaft along +x, the bit hanging toward -z; ~0.3 m.
  // ------------------------------------------------------------------
  const GOLD = 0xe2b04a,
    GOLD_D = 0xa87828,
    GOLD_L = 0xf4d27a;
  function keyGeo() {
    const P = [];
    const flat = (g) => g.rotateX(PI / 2); // torus/disc lying flat
    P.push(
      part(
        flat(new THREE.TorusGeometry(0.034, 0.0068, 8, 28)),
        0.045,
        0,
        0,
        GOLD,
      ),
    ); // the bow ring
    for (const a of [PI / 2, PI, (3 * PI) / 2]) {
      // trefoil lobes round the bow
      P.push(
        part(
          flat(new THREE.TorusGeometry(0.012, 0.0042, 6, 16)),
          0.045 + Math.cos(a) * 0.044,
          0,
          Math.sin(a) * 0.044,
          GOLD,
        ),
      );
    }
    P.push(
      part(
        new THREE.CylinderGeometry(0.019, 0.019, 0.007, 20),
        0.045,
        0,
        0,
        GOLD_L,
      ),
    ); // the seal medallion
    P.push(
      part(
        new THREE.CylinderGeometry(0.012, 0.012, 0.009, 16),
        0.045,
        0,
        0,
        GOLD_D,
      ),
    ); // its raised centre
    for (let k = 0; k < 4; k++) {
      const a = (k * PI) / 2 + PI / 4;
      P.push(
        part(
          new THREE.BoxGeometry(0.018, 0.004, 0.004),
          0.045 + Math.cos(a) * 0.026,
          0,
          Math.sin(a) * 0.026,
          GOLD,
          -a,
        ),
      );
    }
    // collar: a ring, a bead, a second ring
    P.push(
      part(
        new THREE.CylinderGeometry(0.012, 0.012, 0.009, 14),
        0.087,
        0,
        0,
        GOLD_D,
        0,
        0,
        PI / 2,
      ),
    );
    P.push(part(new THREE.SphereGeometry(0.0105, 12, 8), 0.098, 0, 0, GOLD));
    P.push(
      part(
        new THREE.CylinderGeometry(0.0095, 0.0095, 0.007, 14),
        0.109,
        0,
        0,
        GOLD_D,
        0,
        0,
        PI / 2,
      ),
    );
    // shaft + tip
    P.push(
      part(
        new THREE.CylinderGeometry(0.0062, 0.0062, 0.165, 10),
        0.194,
        0,
        0,
        GOLD,
        0,
        0,
        PI / 2,
      ),
    );
    P.push(part(new THREE.SphereGeometry(0.0075, 10, 6), 0.278, 0, 0, GOLD_L));
    // the working bit (stepped wards)
    P.push(
      part(new THREE.BoxGeometry(0.038, 0.007, 0.026), 0.252, 0, -0.018, GOLD),
    );
    P.push(
      part(
        new THREE.BoxGeometry(0.009, 0.007, 0.013),
        0.239,
        0,
        -0.037,
        GOLD_D,
      ),
    );
    P.push(
      part(
        new THREE.BoxGeometry(0.009, 0.007, 0.009),
        0.262,
        0,
        -0.035,
        GOLD_D,
      ),
    );
    return G.util.mergeGeometries(P);
  }
  /** Red, white and blue ribbon through the bow: a loop and two tails lying on the velvet. */
  function ribbonGeo() {
    const P = [],
      cols = [0xb01e22, 0xf2eee4, 0x1e2f6a];
    for (const s of [-1, 1])
      for (let i = 0; i < 3; i++) {
        P.push(
          part(
            new THREE.BoxGeometry(0.11, 0.002, 0.0042),
            -0.03,
            -0.004,
            s * 0.008 + (i - 1) * 0.0042,
            cols[i],
            s * 0.32,
          ),
        );
      }
    P.push(
      part(
        new THREE.TorusGeometry(0.014, 0.004, 4, 10, PI),
        0.014,
        0.004,
        0,
        0xb01e22,
        0,
        PI / 2,
      ),
    );
    return G.util.mergeGeometries(P);
  }
  /** Open presentation box: navy leather shell, the lid hinged open at the back (velvet + brass plaque inside). */
  function keyBoxGeo() {
    const P = [],
      NAVY = 0x1c2440,
      NAVY_D = 0x121830;
    P.push(part(new THREE.BoxGeometry(0.36, 0.035, 0.15), 0, 0.0175, 0, NAVY)); // base
    for (const z of [-0.073, 0.073])
      P.push(
        part(new THREE.BoxGeometry(0.36, 0.012, 0.004), 0, 0.038, z, NAVY_D),
      );
    P.push(
      part(
        new THREE.BoxGeometry(0.36, 0.15, 0.012),
        0,
        0.105,
        -0.082,
        NAVY,
        0,
        -0.25,
      ),
    ); // lid (open)
    P.push(
      part(
        new THREE.BoxGeometry(0.012, 0.012, 0.012),
        -0.17,
        0.038,
        -0.07,
        0xc8a050,
      ),
    ); // hinges
    P.push(
      part(
        new THREE.BoxGeometry(0.012, 0.012, 0.012),
        0.17,
        0.038,
        -0.07,
        0xc8a050,
      ),
    );
    return G.util.mergeGeometries(P);
  }
  function keyVelvetGeo() {
    const P = [];
    P.push(
      part(new THREE.BoxGeometry(0.34, 0.006, 0.13), 0, 0.037, 0, 0x8a1420),
    ); // the bed
    P.push(
      part(
        new THREE.BoxGeometry(0.34, 0.13, 0.004),
        0,
        0.105,
        -0.0745,
        0x7a1018,
        0,
        -0.25,
      ),
    ); // lid lining
    return G.util.mergeGeometries(P);
  }
  // Furniture the key lies on. Each: local frame on the floor, front +z; the box sits at SETS[...].item.
  function caseGeo() {
    // museum display case: moulded pedestal (the vitrine glass is a separate mesh)
    const P = [],
      W = 0x4a2e1c,
      W_D = 0x2e1c10,
      BR = 0xb8903c;
    P.push(
      part(box(0.6, 0.08, 0.6), 0, 0.04, 0, W_D),
      part(box(0.52, 0.76, 0.52), 0, 0.46, 0, W),
      part(box(0.58, 0.07, 0.58), 0, 0.875, 0, W_D),
    );
    P.push(part(box(0.5, 0.02, 0.5), 0, 0.92, 0, 0x5a1018)); // velvet deck
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        P.push(part(box(0.012, 0.4, 0.012), sx * 0.248, 1.13, sz * 0.248, BR));
    P.push(part(box(0.51, 0.012, 0.51), 0, 1.335, 0, BR));
    P.push(part(box(0.2, 0.05, 0.004), 0, 0.72, 0.262, BR)); // caption plate
    return G.util.mergeGeometries(P);
  }
  function deskGeo() {
    // mahogany writing desk: top, apron, drawers, tapered legs, green blotter, inkstand
    const P = [],
      M_ = 0x5a2e1a,
      M_D = 0x3a1c10,
      BR = 0xc8a050;
    P.push(
      part(box(1.2, 0.04, 0.64), 0, 0.76, 0, M_),
      part(box(1.12, 0.1, 0.56), 0, 0.69, 0, M_D),
    );
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        P.push(
          part(cyl(0.025, 0.017, 0.64, 8), sx * 0.54, 0.32, sz * 0.25, M_D),
        );
    for (const sx of [-0.32, 0.32])
      P.push(
        part(box(0.3, 0.07, 0.01), sx, 0.69, 0.282, M_),
        part(box(0.04, 0.012, 0.012), sx, 0.69, 0.29, BR),
      );
    P.push(part(box(0.62, 0.006, 0.4), 0.06, 0.783, 0.02, 0x2a5a3a)); // blotter
    P.push(
      part(box(0.62, 0.008, 0.03), 0.06, 0.784, -0.18, M_D),
      part(box(0.62, 0.008, 0.03), 0.06, 0.784, 0.22, M_D),
    );
    P.push(
      part(box(0.2, 0.02, 0.1), -0.42, 0.79, -0.18, BR),
      part(cyl(0.025, 0.025, 0.04, 10), -0.46, 0.82, -0.18, 0x1a1a22),
      part(cyl(0.004, 0.004, 0.14, 4), -0.38, 0.85, -0.18, 0x1a1a1a, 0, 0.5),
    );
    P.push(
      part(cyl(0.05, 0.06, 0.02, 12), 0.47, 0.79, -0.2, BR),
      part(cyl(0.008, 0.008, 0.3, 6), 0.47, 0.95, -0.2, BR),
    ); // desk lamp stem
    return G.util.mergeGeometries(P);
  }
  function suiteGeo() {
    // hotel side table (round, pedestal) with a lamp and an ashtray
    const P = [],
      W = 0x6a3e22,
      W_D = 0x40241a,
      BR = 0xc8a050;
    P.push(
      part(cyl(0.34, 0.34, 0.03, 24), 0, 0.615, 0, W),
      part(cyl(0.35, 0.33, 0.02, 24), 0, 0.59, 0, W_D),
    );
    P.push(
      part(cyl(0.04, 0.06, 0.55, 10), 0, 0.31, 0, W_D),
      part(cyl(0.22, 0.25, 0.04, 16), 0, 0.02, 0, W_D),
    );
    P.push(
      part(cyl(0.07, 0.09, 0.04, 14), -0.2, 0.65, -0.12, BR),
      part(cyl(0.012, 0.012, 0.3, 6), -0.2, 0.8, -0.12, BR),
    ); // lamp base + stem
    P.push(part(cyl(0.05, 0.045, 0.015, 12), 0.2, 0.638, -0.16, 0xd8d8d0)); // ashtray
    return G.util.mergeGeometries(P);
  }
  function lecternGeo() {
    // City Hall presentation lectern: walnut, slanted top, the city seal on the front
    const P = [],
      W = 0x4a2a18,
      W_D = 0x2e1a10,
      BR = 0xc8a050;
    P.push(
      part(box(0.62, 0.06, 0.48), 0, 0.03, 0, W_D),
      part(box(0.5, 0.96, 0.36), 0, 0.54, -0.02, W),
    );
    P.push(part(box(0.62, 0.04, 0.5), 0, 1.06, 0, W_D, 0, -0.18)); // slanted reading top
    P.push(part(box(0.6, 0.03, 0.02), 0, 1.0, 0.245, BR)); // book ledge
    P.push(
      part(cyl(0.16, 0.16, 0.012, 24), 0, 0.62, 0.165, 0x1e2f6a, 0, PI / 2),
      part(cyl(0.17, 0.17, 0.008, 24), 0, 0.62, 0.162, BR, 0, PI / 2),
    ); // seal disc
    P.push(
      part(box(0.18, 0.018, 0.004), 0, 0.62, 0.174, BR),
      part(box(0.018, 0.18, 0.004), 0, 0.62, 0.174, BR),
    );
    return G.util.mergeGeometries(P);
  }
  /** A-frame sandwich board (two leaning panels + feet); the flyer is boardFaceGeo. */
  function boardGeo() {
    const P = [],
      W = 0x2a3a5a,
      W_D = 0x1a2438;
    for (const s of [-1, 1]) {
      P.push(part(box(0.62, 1.0, 0.03), 0, 0.5, s * 0.17, W, 0, s * 0.17));
      P.push(part(box(0.66, 0.05, 0.04), 0, 1.0, s * 0.09, W_D, 0, s * 0.17));
    }
    P.push(
      part(box(0.02, 0.02, 0.3), 0.3, 0.45, 0, 0x8a8a8a),
      part(box(0.02, 0.02, 0.3), -0.3, 0.45, 0, 0x8a8a8a),
    );
    return G.util.mergeGeometries(P);
  }
  function boardFaceGeo() {
    const a = new THREE.PlaneGeometry(0.5, 0.66);
    a.rotateX(-0.17);
    a.translate(0, 0.52, 0.19);
    const b = new THREE.PlaneGeometry(0.5, 0.66);
    b.rotateX(0.17);
    b.rotateY(PI);
    b.translate(0, 0.52, -0.19);
    return G.util.mergeGeometries([a, b]);
  }
  /** Merged miniature: lacquer base, gold band & plaque, felt top and the die-cast landmark (one draw). */
  function miniBodyGeo(id) {
    return G.util.mergeGeometries([
      G.util.paint(GEO.mBase.clone(), 0x2a1a10),
      G.util.paint(GEO.mBand.clone(), 0xc9a24a),
      G.util.paint(GEO.mPlaque.clone(), 0xd8b458),
      G.util.paint(GEO.mFelt.clone(), 0x7a1c1c),
      G.util.bake(miniGeo(id), { x: 0, y: 0.062, z: 0 }, 0, 1.35),
    ]);
  }

  // ------------------------------------------------------------------
  // Object builders
  // ------------------------------------------------------------------
  function cart() {
    const g = new THREE.Group();
    const body = new THREE.Mesh(GEO.cart, M.cart);
    body.castShadow = true;
    body.receiveShadow = true;
    const can = new THREE.Mesh(GEO.canopy, M.canopy);
    can.castShadow = true;
    g.add(body, new THREE.Mesh(GEO.cartSign, M.sign), can);
    return g;
  }
  /** The key in its open presentation box (box, velvet, lid plaque, the gold key, the ribbon, a glint). */
  function keyObj() {
    const g = new THREE.Group();
    const bx = new THREE.Mesh(GEO.keyBox, M.prop);
    bx.castShadow = true;
    const kg = new THREE.Mesh(GEO.key, M.gold);
    kg.position.set(-0.14, 0.046, 0.022);
    kg.castShadow = true;
    const rb = new THREE.Mesh(GEO.ribbon, M.velvet);
    rb.position.copy(kg.position);
    g.add(
      bx,
      new THREE.Mesh(GEO.keyVelvet, M.velvet),
      new THREE.Mesh(GEO.plaque, M.plaque),
      kg,
      rb,
    );
    const s = new THREE.Sprite(M.glint);
    s.position.set(0.0, 0.07, 0.02);
    s.scale.set(0.3, 0.3, 0.3);
    s.renderOrder = 2;
    g.add(s);
    g.userData.glint = s;
    return g;
  }
  function furniture(kind) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(GEO.sets[kind], M.prop);
    body.castShadow = true;
    body.receiveShadow = true;
    g.add(body);
    if (kind === "case") {
      const v = new THREE.Mesh(GEO.vitrine, M.vitrine);
      v.renderOrder = 3;
      g.add(v);
    }
    if (kind === "desk") {
      const sh = new THREE.Mesh(GEO.shade, M.lampShade);
      sh.position.set(0.47, 1.12, -0.2);
      g.add(sh);
    }
    if (kind === "suite") {
      const sh = new THREE.Mesh(GEO.shade, M.lampShade);
      sh.position.set(-0.2, 1.02, -0.12);
      g.add(sh);
    }
    return g;
  }
  function flyerBoard() {
    const g = new THREE.Group();
    const b = new THREE.Mesh(GEO.board, M.prop);
    b.castShadow = true;
    g.add(b, new THREE.Mesh(GEO.boardFace, M.flyer));
    return g;
  }
  function mini(id) {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(miniBodyGeo(id), M.miniBase));
    return g;
  }
  /** One arcade cabinet: body (style), monitor (game picture), glass pane, lit marquee (+ street battery). */
  function cabinet(c) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(GEO.cab[c.style] || GEO.cab.wood, M.cab);
    body.castShadow = true;
    body.receiveShadow = true;
    const screen = new THREE.Mesh(GEO.screen, M.screen[c.game]);
    const glass = new THREE.Mesh(GEO.screenGlass, M.cabGlass);
    glass.renderOrder = 3;
    const marq = new THREE.Mesh(GEO.marquee, M.marq[c.game]);
    g.add(body, screen, glass, marq);
    if (c.battery) g.add(new THREE.Mesh(GEO.battery, M.prop));
    g.userData.screen = screen;
    return g;
  }

  /**
   * Presentation per collectible ("set"): the prop it sits on, where the item rests (+ its tilt),
   * the collider box [w, d, h] and an optional props-module skeleton for a little story.
   *   mini → souvenir vendor cart (the vendor sometimes still there)
   *   key  → museum display case / writing desk / hotel side table / presentation lectern
   */
  const SETS = {
    case: {
      build: () => furniture("case"),
      item: [0, 0.93, 0],
      box: [0.6, 0.6, 1.34],
      clear: 0.6,
    },
    desk: {
      build: () => furniture("desk"),
      item: [-0.05, 0.786, 0.04],
      box: [1.2, 0.64, 0.78],
      clear: 0.8,
    },
    suite: {
      build: () => furniture("suite"),
      item: [0.06, 0.632, 0.08],
      box: [0.68, 0.68, 0.63],
      clear: 0.55,
    },
    lectern: {
      build: () => furniture("lectern"),
      item: [0, 1.08, 0.02],
      tilt: -0.18,
      box: [0.62, 0.5, 1.08],
      clear: 0.6,
    },
    cart: {
      build: cart,
      item: [0.26, 1.0, 0.13],
      box: [1.4, 0.76, 1.06],
      clear: 1.35,
    },
    board: {
      build: flyerBoard,
      item: [0, 0.75, 0.24],
      box: [0.66, 0.42, 1.05],
      clear: 0.6,
    },
  };

  // ------------------------------------------------------------------
  // Spot finder
  // ------------------------------------------------------------------
  const _p = { x: 0, y: 0, z: 0 };
  function spotOK(x, z, allowSite, clear) {
    const L = G.LAYOUT,
      Wd = G.world;
    if (!L.isLand(x, z)) return null;
    if (L.isRoad(x, z, true)) return null; // never in the roadway
    if (!allowSite && L.siteAt(x, z, 1.5)) return null; // outside landmark footprints
    const th = Wd.terrainHeight(x, z);
    if (!(th > Wd.waterLevel + 0.6)) return null; // dry land only
    _p.x = x;
    _p.y = th;
    _p.z = z;
    const mc = Wd.moveCircle(_p, clear || 1.0, 1.8, 0, 0);
    if (mc.blocked) return null; // clear of walls, cars, props
    const gh = Wd.groundHeight(x, z, th + 1.2, 0.6);
    if (gh > th + 0.3) return null; // not on top of rubble / a car roof
    for (const e of WORLD.entries)
      if (Math.abs(e.x - x) < 3 && Math.abs(e.z - z) < 3) return null;
    return th;
  }
  function findSpot(hint, allowSite, clear) {
    for (let r = 0; r <= 44; r += 2) {
      const n = r === 0 ? 1 : Math.max(8, Math.round(r * 1.7));
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2 + r * 0.37;
        const x = hint.x + Math.cos(a) * r,
          z = hint.z + Math.sin(a) * r;
        const y = spotOK(x, z, allowSite, clear);
        if (y !== null) return { x, y, z, ok: true };
      }
    }
    return {
      x: hint.x,
      y: G.world.terrainHeight(hint.x, hint.z),
      z: hint.z,
      ok: false,
    };
  }

  /**
   * A key's spot: a free floor spot 1.6–3.2 m from one of its site's anchors (never on the anchor itself:
   * NPCs and props use anchors), on the same floor and in sight of it; the furniture faces the anchor.
   * No usable anchor → on the street outside the site (spiral search from its location).
   */
  const _a = new THREE.Vector3(),
    _b = new THREE.Vector3();
  function anchorOf(site, name) {
    let a = null;
    try {
      if (!G.isStub("landmarks") && typeof G.landmarks.getAnchor === "function")
        a = G.landmarks.getAnchor(site, name);
    } catch (e) {
      a = null;
    }
    try {
      if (!a && G.pois && typeof G.pois.getAnchor === "function")
        a = G.pois.getAnchor(site, name);
    } catch (e) {
      a = null;
    }
    return a && isFinite(a.x) && isFinite(a.z) ? a : null;
  }
  function keySpot(q, SET) {
    const Wd = G.world,
      IXM = (G.LAYOUT && G.LAYOUT.INTERIOR_X_MIN) || 2500;
    const turn = (G.util.hashStr(q.id) % 8) * 0.39;
    for (const n of q.anchors || []) {
      const a = anchorOf(q.site, n);
      if (!a) continue;
      const y0 = a.y || 0;
      for (const r of [1.6, 2.2, 2.8, 3.4]) {
        for (let k = 0; k < 10; k++) {
          const ang = turn + (k * PI) / 5,
            x = a.x + Math.cos(ang) * r,
            z = a.z + Math.sin(ang) * r;
          if (
            x < IXM &&
            (!G.LAYOUT.isLand(x, z) || G.LAYOUT.isRoad(x, z, true))
          )
            continue;
          const gy = Wd.groundHeight(x, z, y0 + 0.6, 0.3);
          if (!isFinite(gy) || Math.abs(gy - y0) > 0.3) continue;
          _p.x = x;
          _p.y = gy;
          _p.z = z;
          if (Wd.moveCircle(_p, SET.clear, 1.8, 0, 0).blocked) continue;
          if (Wd.groundHeight(x, z, gy + 1.2, SET.clear) > gy + 0.3) continue; // nothing low and solid under the footprint
          _a.set(x, gy + 1.1, z);
          _b.set(a.x, y0 + 1.1, a.z);
          if (!Wd.lineOfSight(_a, _b)) continue;
          if (
            WORLD.entries.some(
              (e) =>
                Math.abs(e.x - x) < 2.5 &&
                Math.abs(e.z - z) < 2.5 &&
                Math.abs(e.y - gy) < 2,
            )
          )
            continue;
          return {
            x,
            y: gy,
            z,
            ok: true,
            anchor: n,
            yaw: Math.atan2(a.x - x, a.z - z),
            interior: x >= IXM,
          };
        }
      }
    }
    const f = findSpot(AR.keyHint(q), false, SET.clear);
    f.anchor = null;
    return f;
  }

  // ------------------------------------------------------------------
  // Placement
  // ------------------------------------------------------------------
  function addCabinet(c) {
    const def = AR.gameDef(c.game);
    if (!def) return null;
    let s;
    if (c.fixed) {
      const th = G.world.terrainHeight(c.fixed.x, c.fixed.z);
      s = {
        x: c.fixed.x,
        y: th + (c.indoor ? 0.03 : 0),
        z: c.fixed.z,
        ok: true,
      };
    } else s = findSpot(c.hint, !!c.allowSite, 1.1);
    const yaw = c.fixed ? c.fixed.yaw : (G.util.hashStr(c.id) % 628) / 100;
    const root = new THREE.Group();
    root.position.set(s.x, s.y, s.z);
    root.rotation.y = yaw;
    root.name = "arc_cabinet_" + c.id;
    const obj = cabinet(c);
    root.add(obj);
    G.scene.add(root);
    G.world.addLOD(root, c.indoor ? 60 : 120, root.position);
    let collider = null;
    try {
      collider = G.world.addCollider(
        s.x + Math.sin(yaw) * 0.02,
        s.z + Math.cos(yaw) * 0.02,
        0.68,
        0.84,
        s.y,
        s.y + 1.82,
        yaw,
        { tag: "interactable_self", surface: "wood" },
      );
    } catch (e) {
      /* core */
    }
    root.updateMatrixWorld(true);
    const labelPos = new THREE.Vector3(0, 1.25, 0.3);
    root.localToWorld(labelPos);
    const entry = {
      kind: "cabinet",
      id: c.id,
      game: c.game,
      style: c.style,
      set: "cabinet",
      x: s.x,
      y: s.y,
      z: s.z,
      ok: s.ok,
      root,
      item: obj,
      collider,
      labelPos,
      area: c.area || "",
      interactable: null,
      screen: obj.userData.screen,
      skeleton: null,
    };
    entry.interactable = G.world.addInteractable({
      pos: labelPos,
      radius: 0.6,
      range: 2.6,
      priority: 0.7,
      label: def.title + " (arcade cabinet)",
      verb: "Play",
      enabled: () => G.state === "play",
      onInteract: () => playAt(entry),
    });
    WORLD.entries.push(entry);
    return entry;
  }
  function playAt(entry) {
    const first = !AR.STATE.cabinets.has(entry.id);
    AR.STATE.cabinets.add(entry.id);
    if (first) G.events.emit("arcadeCabinetFound", entry.id, entry.game);
    G.arcade.play(entry.game, { cabinet: entry });
  }
  WORLD.playAt = playAt;

  function place() {
    if (WORLD.placed || !G.scene || !G.LAYOUT) return;
    WORLD.placed = true;
    buildShared();
    const t0 = performance.now();
    let n = 0;
    const add = (kind, id, spot, label, item, setId, skel, at) => {
      const SET = SETS[setId] || SETS.case;
      const s = at || findSpot(spot.hint, !!spot.allowSite, SET.clear);
      const yaw = isFinite(s.yaw) ? s.yaw : (G.util.hashStr(id) % 628) / 100;
      const root = new THREE.Group();
      root.position.set(s.x, s.y, s.z);
      root.rotation.y = yaw;
      root.name = "arc_" + kind + "_" + id;
      root.add(SET.build());
      const holder = new THREE.Group();
      holder.position.set(SET.item[0], SET.item[1], SET.item[2]);
      if (SET.tilt) holder.rotation.x = SET.tilt;
      holder.add(item);
      root.add(holder);
      G.scene.add(root);
      G.world.addLOD(
        root,
        s.interior ? 60 : kind === "mini" ? 150 : 140,
        root.position,
      );
      let collider = null;
      if (SET.box) {
        try {
          collider = G.world.addCollider(
            s.x,
            s.z,
            SET.box[0],
            SET.box[1],
            s.y,
            s.y + SET.box[2],
            yaw,
            {
              tag: "interactable_self",
              surface: setId === "cart" ? "metal" : "wood",
              walkable: false,
            },
          );
        } catch (e) {
          /* core */
        }
      }
      root.updateMatrixWorld(true);
      const lp = new THREE.Vector3(0, 0.16, 0);
      holder.localToWorld(lp);
      const labelPos = new THREE.Vector3(lp.x, lp.y, lp.z);
      const entry = {
        kind,
        id,
        set: setId,
        x: s.x,
        y: s.y,
        z: s.z,
        ok: s.ok,
        root,
        item: holder,
        collider,
        labelPos,
        area: spot.area || "",
        interactable: null,
        spin: item,
        glint: item.userData.glint || null,
        skeleton: null,
        anchor: s.anchor || null,
        interior: !!s.interior,
      };
      entry.interactable = G.world.addInteractable({
        pos: labelPos,
        radius: 0.5,
        range: 3,
        priority: 0.6,
        label,
        verb: kind === "flyer" ? "Take flyer" : "Take",
        enabled: () => !isFound(entry),
        onInteract: () => {
          if (isFound(entry)) return;
          if (kind === "flyer") takeFlyer();
          else AR.collect(kind, id);
        },
      });
      // a little story: a skeleton from the props kit (static, persistent)
      const sk = skel || SET.skel;
      if (sk && !G.isStub("props") && G.props.spawn) {
        const c = Math.cos(yaw),
          sn = Math.sin(yaw);
        const wx = s.x + sk.dx * c + sk.dz * sn,
          wz = s.z - sk.dx * sn + sk.dz * c;
        try {
          entry.skeleton = G.props.spawn("skeleton", {
            x: wx,
            y: s.y,
            z: wz,
            yaw: yaw + (sk.yaw || 0),
            pose: sk.pose,
            persistent: true,
            collide: false,
            id: "arc_skel_" + id,
          });
        } catch (e) {
          G.reportError("arcade:skeleton", e);
        }
      }
      WORLD.entries.push(entry);
      n++;
      return entry;
    };
    for (const c of AR.CABINETS) {
      try {
        if (addCabinet(c)) n++;
      } catch (e) {
        G.reportError("arcade:cabinet:" + c.id, e);
      }
    }
    for (let i = 0; i < AR.MINIS.length; i++) {
      const gl = AR.MINIS[i];
      const obj = mini(gl.id);
      obj.scale.setScalar(1.8);
      add(
        "mini",
        gl.id,
        gl,
        "Landmark Miniature - " + gl.name,
        obj,
        "cart",
        i % 3 === 1
          ? { pose: "sitting", dx: 1.05, dz: 0.2, yaw: -PI / 2 }
          : null,
      );
    }
    // the Keys to the City: each where its recipient left it
    for (const q of AR.KEYS) {
      const SET = SETS[q.set] || SETS.case;
      let at = null;
      try {
        at = keySpot(q, SET);
      } catch (e) {
        G.reportError("arcade:keySpot:" + q.id, e);
      }
      const e = add(
        "key",
        q.id,
        { hint: AR.keyHint(q), area: q.area },
        "Key to the City No. " + q.no + " (" + q.who + ")",
        keyObj(),
        q.set,
        null,
        at,
      );
      e.def = q;
    }
    // the flyers that start the hunt: Chambers Street by the cryo exit, and Gracie Mansion's front hall
    const ex = G.LAYOUT.cryoExit || { x: 157, z: 623 };
    add(
      "flyer",
      "flyer_chambers",
      { hint: { x: ex.x + 7, z: ex.z - 3 }, area: "Chambers Street" },
      'Flyer: "The Keys Come Home"',
      new THREE.Group(),
      "board",
    );
    const hall = {
      site: "gracie_mansion",
      anchors: ["hall", "entrance"],
      hint: AR.keyHint({ site: "gracie_mansion" }),
    };
    let hs = null;
    try {
      hs = keySpot(hall, SETS.board);
    } catch (e) {
      hs = null;
    }
    add(
      "flyer",
      "flyer_gracie",
      { hint: hall.hint, area: "Gracie Mansion" },
      'Flyer: "The Keys Come Home"',
      new THREE.Group(),
      "board",
      null,
      hs,
    );
    refresh();
    WORLD.placeMs = Math.round(performance.now() - t0);
    const bad = WORLD.entries.filter((e) => !e.ok).map((e) => e.id);
    if (bad.length)
      console.warn(
        "[arcade] no free spot found near hint for: " +
          bad.join(", ") +
          " (placed at hint)",
      );
    return n;
  }
  WORLD.place = place;

  function isFound(e) {
    const S = AR.STATE;
    if (e.kind === "flyer")
      return AR.quests && AR.quests.flyerTaken ? AR.quests.flyerTaken() : false;
    return e.kind === "mini"
      ? S.minis.has(e.id)
      : e.kind === "key"
        ? S.keys.has(e.id)
        : false;
  }
  /** The flyer board: hand over the note (the quest starts with it). The board itself stays. */
  function takeFlyer() {
    if (AR.quests && AR.quests.takeFlyer) AR.quests.takeFlyer();
    try {
      G.sfx.play("pickup_note", { volume: 0.7 });
    } catch (e) {
      /* stub */
    }
  }
  function refresh() {
    for (const e of WORLD.entries)
      if (e.kind !== "cabinet" && e.kind !== "flyer")
        e.item.visible = !isFound(e);
  }
  WORLD.refresh = refresh;
  WORLD.isFound = isFound;
  WORLD.placedCount = () => WORLD.entries.length;
  WORLD.entry = (kind, id) =>
    WORLD.entries.find((e) => e.kind === kind && e.id === id) || null;

  /**
   * Nearest not-yet-found collectible of a kind → {dist, dir, area, entry, def}. A key inside an interior
   * counts from its site's street location while the player is outdoors (and from the real spot when the
   * player is in the same interior cell).
   */
  const DIRS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  function proxyPos(e, P) {
    const IXM = G.LAYOUT.INTERIOR_X_MIN;
    if (!e.interior) return e;
    if (P.x >= IXM && Math.abs(e.x - P.x) < 200 && Math.abs(e.z - P.z) < 200)
      return e; // same cell
    const h = e.def ? AR.keyHint(e.def) : e;
    return { x: h.x, z: h.z };
  }
  WORLD.nearestUnfound = function (kind) {
    const P = G.player && G.player.pos;
    if (!P || !G.LAYOUT) return null;
    const inside = P.x >= G.LAYOUT.INTERIOR_X_MIN;
    let best = null,
      bd = 1e12,
      bp = null;
    for (const e of WORLD.entries) {
      if (e.kind !== kind || isFound(e)) continue;
      const q = proxyPos(e, P);
      if (inside && !(Math.abs(q.x - P.x) < 200 && Math.abs(q.z - P.z) < 200))
        continue; // indoors: only this cell's keys
      const d = (q.x - P.x) * (q.x - P.x) + (q.z - P.z) * (q.z - P.z);
      if (d < bd) {
        bd = d;
        best = e;
        bp = q;
      }
    }
    if (!best) return null;
    const ang = Math.atan2(bp.x - P.x, -(bp.z - P.z)); // 0 = north, clockwise
    const i = ((Math.round(ang / (Math.PI / 4)) % 8) + 8) % 8;
    return {
      dist: Math.sqrt(bd),
      dir: DIRS[i],
      area: best.def ? best.def.area : best.area,
      entry: best,
      def: best.def || null,
    };
  };
  /** Nearest missing key for the quest marker: the real spot (the quest engine routes through doors). */
  WORLD.nearestKeyEntry = function () {
    const P = G.player && G.player.pos;
    if (!P || !G.LAYOUT) return null;
    let best = null,
      bd = 1e18;
    for (const e of WORLD.entries) {
      if (e.kind !== "key" || isFound(e)) continue;
      const q = proxyPos(e, P);
      const d = (q.x - P.x) * (q.x - P.x) + (q.z - P.z) * (q.z - P.z);
      if (d < bd) {
        bd = d;
        best = e;
      }
    }
    return best;
  };
  /** Nearest cabinet (optionally of a game) → entry */
  WORLD.nearestCabinet = function (game, from) {
    const P = from || (G.player && G.player.pos);
    if (!P) return null;
    let best = null,
      bd = 1e18;
    for (const e of WORLD.entries) {
      if (e.kind !== "cabinet" || (game && e.game !== game)) continue;
      const d = (e.x - P.x) * (e.x - P.x) + (e.z - P.z) * (e.z - P.z);
      if (d < bd) {
        bd = d;
        best = e;
      }
    }
    return best;
  };

  /** Per-frame: glint pulse and the live attract demo on the nearest cabinet monitor. */
  const LIVE_R2 = 10 * 10,
    LIVE_DT = 1 / 12;
  WORLD.update = function (dt) {
    if (!M || !WORLD.entries.length) return;
    WORLD.t += dt;
    const t = WORLD.t;
    M.glint.opacity = 0.35 + Math.max(0, Math.sin(t * 1.7)) * 0.4;
    const P = G.player && G.player.pos;
    if (!P) return;
    let near = null,
      nd = LIVE_R2;
    for (const e of WORLD.entries) {
      const dx = e.x - P.x,
        dz = e.z - P.z,
        d2 = dx * dx + dz * dz;
      if (e.kind === "cabinet") {
        if (d2 < nd) {
          nd = d2;
          near = e;
        }
        continue;
      } // within 10 m: never distance-culled
      if (!e.item.visible || !e.root.visible || d2 > 900) continue;
    }
    // swap the live screen onto the nearest cabinet
    if (near !== WORLD.live) {
      if (WORLD.live && WORLD.live.screen)
        WORLD.live.screen.material = M.screen[WORLD.live.game];
      WORLD.live = near;
      WORLD.liveHolder = { inst: null, t: 0 };
      WORLD.liveDt = LIVE_DT;
      if (near && near.screen) near.screen.material = M.screenLive;
    }
    if (!near) return;
    WORLD.liveDt += dt;
    if (WORLD.liveDt < LIVE_DT) return;
    try {
      AR.renderAttract(
        WORLD.liveHolder,
        near.game,
        WORLD.liveDt,
        WORLD.liveCtx,
        WORLD.liveCanvas.width,
        WORLD.liveCanvas.height,
      );
      M.screenLive.map.needsUpdate = true;
    } catch (e) {
      G.reportError("arcade:liveScreen", e);
    }
    WORLD.liveDt = 0;
  };

  G.events.on("initDone", () => {
    try {
      place();
    } catch (e) {
      G.reportError("arcade:place", e);
    }
  });
})();
