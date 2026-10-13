// play-inline-558 03 — three
// Lines 675-974 of readable/play-inline-558.pretty.js (statement-aligned).
  function galleryUpdate(dt) {
    if (!GAL.active) return;
    if (G.state !== "play" && G.state !== "goggles") {
      endGallery(true);
      return;
    }
    GAL.t += dt;
    const left = GAL.dur - GAL.t;
    if (GAL.hud)
      GAL.hud.textContent =
        "ANNIE'S GALLERY   " +
        Math.max(0, Math.ceil(left)) +
        "s   HITS " +
        GAL.hits;
    // leaving the firing line ends the round
    if (
      GAL.t > 1.5 &&
      Math.hypot(G.player.pos.x - GAL.S.x, G.player.pos.z - GAL.S.z) > 6
    ) {
      L.say("neon_annie", "Hey! Round's over when you walk off the line!", 3);
      endGallery(false);
      return;
    }
    if (left <= 0) {
      endGallery(false);
      return;
    }
    GAL.spawnT -= dt;
    if (GAL.spawnT <= 0) {
      popTarget();
      GAL.spawnT =
        Math.max(0.55, 1.5 - GAL.t * 0.03) * (0.7 + Math.random() * 0.6);
    }
    let i = 0;
    for (const t of GAL.targets) {
      if (t.up) {
        t.life -= dt;
        if (t.hit) t.flip = Math.min(1, t.flip + dt * 5);
        if ((t.hit && t.flip >= 1) || t.life <= 0) {
          t.up = false;
          t.downT = 0.8;
        }
      } else if (t.downT > 0) t.downT -= dt;
      if (t.up) {
        targetPos(t, GAL.t, _p);
        const face = Math.atan2(G.player.pos.x - _p.x, G.player.pos.z - _p.z);
        _e.set((-t.flip * Math.PI) / 2, face, 0, "YXZ");
        _q.setFromEuler(_e);
        _m.compose(_p, _q, _s);
      } else _m.makeScale(0, 0, 0);
      GAL.mesh.setMatrixAt(i++, _m);
    }
    GAL.mesh.instanceMatrix.needsUpdate = true;
  }

  // ==================================================================
  // Marquee (Robo-Shop companion: a Valet robot)
  // ==================================================================
  function marquee() {
    return L.npc("neon_marquee");
  }
  function spawnMarquee(near) {
    const T = N();
    const p =
      near ||
      T.spot(["robo_owner", "robo_door"], {
        near: ["repairman", "vendor2", "plaza"],
        dx: 2,
        dz: 2,
      });
    if (!p) return null;
    const a = L.spawnNPC({
      id: "neon_marquee",
      type: "valet",
      name: "Marquee",
      faction: "settlers",
      level: Math.max(6, lvl()),
      essential: true,
      pos: { x: p.x, y: p.y, z: p.z },
      ai: "guard",
      home: { x: p.x, z: p.z, r: 2 },
      dialogue: "dlg_neon_marquee",
      voice: "valet",
      barks: {
        greet: [
          "Good day, good day! Marquee, American Automaton Valet, Series Four, entirely at your disposal!",
          "Shall I press your trousers? Shall I press an attacker? I am rated for both!",
        ],
        idle: [
          "Humming a little show tune! ♪ Hmm-hmm-hmm ♪",
          "Your posture, if I may, is a tragedy in three acts.",
          "I do so enjoy our little constitutionals.",
        ],
        combat: [
          "Unhand the guest, ruffian!",
          "Tally-ho!",
          "This will sting, I'm afraid!",
        ],
      },
    });
    return a;
  }
  function marqueeFollow(on) {
    const a = marquee();
    if (!a) return;
    const st = L.flag("neon_marquee") || {};
    if (on) {
      a.follow("player");
      st.mode = "follow";
    } else {
      a.follow(null);
      a.home = { x: a.pos.x, z: a.pos.z, r: 2 };
      a.aiMode = "guard";
      st.mode = "wait";
    }
    L.setFlag("neon_marquee", st);
  }
  function marqueeHome() {
    const a = marquee();
    if (!a) return;
    a.follow(null);
    const p = N().spot(["robo_owner", "robo_door"], {
      near: ["repairman", "vendor2", "plaza"],
      dx: 2,
      dz: 2,
    });
    if (p) {
      a.home = { x: p.x, z: p.z, r: 2 };
      a.aiMode = "guard";
      a.moveTo(p.x, p.z);
    }
    const st = L.flag("neon_marquee") || {};
    st.mode = "home";
    L.setFlag("neon_marquee", st);
  }

  // ==================================================================
  // World objects: notice board, oracle booth (fallback models), locker
  // ==================================================================
  function vcMesh(parts, mat) {
    const geos = parts.map(([geo, col, x, y, z, ry]) => {
      if (ry) geo.rotateY(ry);
      geo.translate(x, y, z);
      const c = new THREE.Color(col),
        n = geo.attributes.position.count,
        a = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        a[i * 3] = c.r;
        a[i * 3 + 1] = c.g;
        a[i * 3 + 2] = c.b;
      }
      geo.setAttribute("color", new THREE.BufferAttribute(a, 3));
      return geo.index ? geo.toNonIndexed() : geo;
    });
    const g = G.util.mergeGeometries ? G.util.mergeGeometries(geos) : geos[0];
    return new THREE.Mesh(g, mat);
  }
  function boardTexture() {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 192;
    const x = c.getContext("2d");
    x.fillStyle = "#5a4128";
    x.fillRect(0, 0, 256, 192);
    for (let i = 0; i < 40; i++) {
      x.fillStyle = "rgba(0,0,0," + Math.random() * 0.15 + ")";
      x.fillRect(Math.random() * 256, 0, 2, 192);
    }
    const notes = [
      ["#e8dfc4", "WANTED", "#8a1a1a"],
      ["#d8d0b0", "JOBS", "#1a1a1a"],
      ["#e0d8b8", "BOUNTY", "#8a1a1a"],
      ["#cfc7a8", "NOTICE", "#1a3a6a"],
      ["#e4dcc0", "LOST", "#1a1a1a"],
      ["#d4ccac", "REWARD", "#8a1a1a"],
    ];
    notes.forEach(([bg, t, fg], i) => {
      const px = 12 + (i % 3) * 82 + (Math.random() - 0.5) * 8,
        py = 12 + Math.floor(i / 3) * 88 + (Math.random() - 0.5) * 6;
      x.save();
      x.translate(px + 34, py + 38);
      x.rotate((Math.random() - 0.5) * 0.12);
      x.fillStyle = bg;
      x.fillRect(-34, -38, 68, 76);
      x.fillStyle = fg;
      x.font = "bold 13px Courier New";
      x.textAlign = "center";
      x.fillText(t, 0, -22);
      x.fillStyle = "rgba(30,30,30,.55)";
      for (let l = 0; l < 6; l++)
        x.fillRect(-26, -12 + l * 8, 40 + Math.random() * 12, 2);
      x.fillStyle = "#b02020";
      x.beginPath();
      x.arc(0, -34, 3, 0, 6.3);
      x.fill();
      x.restore();
    });
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace || t.colorSpace;
    return t;
  }
  function buildBoard(p) {
    const g = new THREE.Group();
    const frame = vcMesh(
      [
        [new THREE.BoxGeometry(1.9, 1.5, 0.08), 0x3a2a1a, 0, 1.55, 0],
        [new THREE.BoxGeometry(0.1, 2.3, 0.1), 0x2e2418, -0.95, 1.15, 0],
        [new THREE.BoxGeometry(0.1, 2.3, 0.1), 0x2e2418, 0.95, 1.15, 0],
        [new THREE.BoxGeometry(2.1, 0.12, 0.3), 0x4a3a28, 0, 2.36, 0.08],
      ],
      new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9 }),
    );
    const face = new THREE.Mesh(
      new THREE.PlaneGeometry(1.76, 1.32),
      new THREE.MeshStandardMaterial({ map: boardTexture(), roughness: 0.95 }),
    );
    face.position.set(0, 1.55, 0.045);
    g.add(frame, face);
    g.position.set(p.x, p.y, p.z);
    g.rotation.y = p.yaw || 0;
    G.scene.add(g);
    try {
      G.world.addCollider(p.x, p.z, 2.1, 0.3, p.y, p.y + 2.4, p.yaw || 0, {
        tag: "prop",
        walkable: false,
        surface: "wood",
      });
    } catch (e) {
      /* ignore */
    }
    if (G.world.addLOD) G.world.addLOD(g, 120);
    return g;
  }
  function buildOracle(p) {
    const mat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.6,
      metalness: 0.3,
    });
    const body = vcMesh(
      [
        [new THREE.BoxGeometry(0.9, 1.1, 0.7), 0x5a1a2a, 0, 0.55, 0],
        [new THREE.BoxGeometry(0.95, 0.08, 0.75), 0xb08a30, 0, 1.12, 0],
        [new THREE.BoxGeometry(0.8, 0.9, 0.6), 0x2a1018, 0, 1.6, -0.02],
        [new THREE.BoxGeometry(0.95, 0.18, 0.75), 0xb08a30, 0, 2.12, 0],
        [new THREE.BoxGeometry(0.12, 0.04, 0.02), 0x111111, 0.2, 0.9, 0.36],
        [new THREE.BoxGeometry(0.26, 0.06, 0.03), 0xd8d0b0, -0.18, 0.72, 0.36],
      ],
      mat,
    );
    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.75, 0.02),
      new THREE.MeshStandardMaterial({
        color: 0x224433,
        emissive: 0x33ff88,
        emissiveIntensity: 0.35,
        transparent: true,
        opacity: 0.55,
      }),
    );
    glass.position.set(0, 1.6, 0.29);
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 12, 10),
      new THREE.MeshStandardMaterial({
        color: 0x9a8a70,
        emissive: 0x33ff66,
        emissiveIntensity: 0.25,
        roughness: 0.5,
      }),
    );
    head.position.set(0, 1.62, 0.02);
    const g = new THREE.Group();
    g.add(body, glass, head);
    W.oracleMats = [glass.material, head.material];
    g.position.set(p.x, p.y, p.z);
    g.rotation.y = p.yaw || 0;
    G.scene.add(g);
    try {
      G.world.addCollider(p.x, p.z, 0.95, 0.75, p.y, p.y + 2.2, p.yaw || 0, {
        tag: "prop",
        walkable: false,
        surface: "wood",
      });
    } catch (e) {
      /* ignore */
    }
    if (!G.isStub("fx") && G.fx.glowSprite)
      try {
        W.oracleGlow = G.fx.glowSprite(
          new THREE.Vector3(p.x, p.y + 1.7, p.z),
          0x44ff88,
          1.2,
        );
      } catch (e) {
        /* ignore */
      }
    if (G.world.addLOD) G.world.addLOD(g, 120);
    return g;
  }
  const W = { built: false };
