// play-inline-544 05 — three
// Lines 1349-1682 of readable/play-inline-544.pretty.js (statement-aligned).
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

