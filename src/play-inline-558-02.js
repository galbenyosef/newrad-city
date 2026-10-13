// play-inline-558 02 — gal
// Lines 369-674 of readable/play-inline-558.pretty.js (statement-aligned).
  const GAL = {
    active: false,
    t: 0,
    dur: 30,
    hits: 0,
    shots: 0,
    targets: [],
    mesh: null,
    hud: null,
    S: null,
    dir: null,
    right: null,
    lanes: [],
    spawnT: 0,
  };
  const MAX_T = 8;
  const _m = new THREE.Matrix4(),
    _q = new THREE.Quaternion(),
    _e = new THREE.Euler(),
    _p = new THREE.Vector3(),
    _s = new THREE.Vector3(1, 1, 1);
  function buildTargetMesh() {
    // A "tin raider" cut-out on a post: vertex-coloured, merged, one InstancedMesh = 1 draw call.
    const parts = [];
    const add = (geo, col, x, y, z) => {
      geo.translate(x, y, z);
      const c = new THREE.Color(col);
      const n = geo.attributes.position.count;
      const a = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        a[i * 3] = c.r;
        a[i * 3 + 1] = c.g;
        a[i * 3 + 2] = c.b;
      }
      geo.setAttribute("color", new THREE.BufferAttribute(a, 3));
      parts.push(geo);
    };
    add(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 6), 0x3a3a36, 0, 0.45, 0); // post
    add(new THREE.BoxGeometry(0.52, 0.62, 0.03), 0xb8b0a0, 0, 1.2, 0); // tin body
    add(new THREE.BoxGeometry(0.4, 0.14, 0.035), 0x9a2a1a, 0, 1.36, 0.004); // red sash
    add(
      new THREE.CylinderGeometry(0.17, 0.17, 0.03, 12).rotateX(Math.PI / 2),
      0xc8c0b0,
      0,
      1.68,
      0,
    ); // head
    add(new THREE.BoxGeometry(0.22, 0.05, 0.036), 0x1a1a1a, 0, 1.7, 0.004); // mask stripe
    add(
      new THREE.CylinderGeometry(0.09, 0.09, 0.036, 12).rotateX(Math.PI / 2),
      0xd0302a,
      0,
      1.2,
      0.006,
    ); // bullseye
    add(
      new THREE.CylinderGeometry(0.04, 0.04, 0.04, 8).rotateX(Math.PI / 2),
      0xf0e0c0,
      0,
      1.2,
      0.01,
    );
    const g = G.util.mergeGeometries ? G.util.mergeGeometries(parts) : parts[1];
    const mat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.55,
      metalness: 0.5,
    });
    const m = new THREE.InstancedMesh(g, mat, MAX_T);
    m.frustumCulled = false;
    m.castShadow = false;
    m.name = "neon_gallery_targets";
    m.visible = false;
    G.scene.add(m);
    return m;
  }
  function galleryHud(on) {
    if (G.SMOKE && on) return;
    if (!on) {
      if (GAL.hud) {
        GAL.hud.remove();
        GAL.hud = null;
      }
      return;
    }
    if (GAL.hud) return;
    const el = document.createElement("div");
    el.style.cssText =
      'position:fixed;top:12%;left:50%;transform:translateX(-50%);z-index:860;pointer-events:none;font-family:"Share Tech Mono",monospace;' +
      "color:#ffd27a;text-shadow:0 0 6px rgba(255,160,40,.8);font-size:22px;letter-spacing:3px;text-align:center;background:rgba(20,10,0,.35);padding:6px 18px;border:1px solid rgba(255,190,90,.5)";
    document.body.appendChild(el);
    GAL.hud = el;
  }
  function rangeSetup() {
    const T = N();
    const shooter = T.spot(["gallery_range", "gallery_shooter"], {
      near: ["gallery_owner", "gallery_door", "plaza"],
      dx: 0,
      dz: 2.2,
    });
    if (!shooter) return false;
    const tgt = T.has(["gallery_targets", "gallery_backstop"]);
    const eye = new THREE.Vector3(shooter.x, shooter.y + 1.5, shooter.z);
    let dir = null,
      len = 17;
    if (tgt && Math.hypot(tgt.x - shooter.x, tgt.z - shooter.z) > 5) {
      dir = new THREE.Vector3(tgt.x - shooter.x, 0, tgt.z - shooter.z);
      len = Math.min(22, dir.length());
      dir.normalize();
    } else {
      // the clearest line with a backstop wall (a building front 18–30 m away) and nobody's stall in it
      let best = null,
        bs = -1e9;
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        const d = new THREE.Vector3(-Math.sin(a), 0, -Math.cos(a));
        const h = G.world.raycast(eye, d, 32);
        const hd = h ? h.dist : 32;
        let sc = Math.min(hd, 20) * 2 - (hd > 30 ? 6 : 0);
        // aim away from the plaza centre (the crowd)
        const c = new THREE.Vector3(
          -40 - shooter.x,
          0,
          -262 - shooter.z,
        ).normalize();
        sc -= Math.max(0, d.dot(c)) * 8;
        if (sc > bs) {
          bs = sc;
          best = { d, hd };
        }
      }
      dir = best.d;
      len = Math.max(6, Math.min(19, best.hd - 1.5));
    }
    GAL.S = shooter;
    GAL.dir = dir;
    GAL.right = new THREE.Vector3(-dir.z, 0, dir.x);
    GAL.lanes = [0.5, 0.72, 0.95].map((f) => f * len);
    return true;
  }
  function popTarget() {
    const free = GAL.targets.filter((t) => !t.up && t.downT <= 0);
    if (!free.length) return;
    const t = pick(free);
    t.lane = Math.floor(Math.random() * GAL.lanes.length);
    t.phase = Math.random() * 6.28;
    t.amp = 1.2 + Math.random() * 2.2;
    t.w = 0.8 + Math.random() * 1.4 + GAL.hits * 0.05;
    t.up = true;
    t.life = 2.4 + Math.random() * 1.6;
    t.flip = 0;
    t.hit = false;
  }
  function targetPos(t, time, out) {
    const d = GAL.lanes[t.lane],
      S = GAL.S;
    const lat = Math.sin(time * t.w + t.phase) * t.amp;
    out.set(
      S.x + GAL.dir.x * d + GAL.right.x * lat,
      0,
      S.z + GAL.dir.z * d + GAL.right.z * lat,
    );
    out.y = G.world.groundHeight(out.x, out.z, S.y + 1, 0.2);
    if (!isFinite(out.y)) out.y = S.y;
    return out;
  }
  function startGallery() {
    if (!N().place("gallery")) return; // no range without the gallery (the service is hidden until it is built)
    if (GAL.active) return;
    if (
      G.isStub("weapons") ||
      !G.weapons.current ||
      !G.weapons.current() ||
      G.weapons.current().id === "unarmed"
    ) {
      L.say("neon_annie", "Bring a gun, sugar. I ain't lending you mine.");
      return;
    }
    if (!rangeSetup()) return;
    if (!L.pay(5)) return;
    if (!GAL.mesh) GAL.mesh = buildTargetMesh();
    GAL.targets = [];
    for (let i = 0; i < MAX_T; i++)
      GAL.targets.push({ up: false, downT: 0, flip: 0, lane: 0 });
    GAL.active = true;
    GAL.t = 0;
    GAL.hits = 0;
    GAL.shots = 0;
    GAL.spawnT = 1.2;
    GAL.end = null;
    const yaw = Math.atan2(-GAL.dir.x, -GAL.dir.z);
    G.player.teleport(GAL.S.x, GAL.S.y, GAL.S.z, yaw);
    G.player.pitch = -0.02;
    if (!G.isStub("combat") && G.combat.setSafeZoneQuiet)
      G.combat.setSafeZoneQuiet("times_square", true);
    GAL.mesh.visible = true;
    galleryHud(true);
    L.later(0.6, () =>
      L.say(
        "neon_annie",
        "Thirty seconds! Tin raiders pop up, you knock 'em down! Go!",
        3,
      ),
    );
  }
  function endGallery(silent) {
    if (!GAL.active) return;
    GAL.active = false;
    if (GAL.mesh) GAL.mesh.visible = false;
    galleryHud(false);
    if (!G.isStub("combat") && G.combat.setSafeZoneQuiet)
      G.combat.setSafeZoneQuiet("times_square", false);
    if (silent) return;
    const h = GAL.hits;
    L.setFlag(
      "neon_gallery_best",
      Math.max(Number(L.flag("neon_gallery_best")) || 0, h),
    );
    let pay = 0,
      line;
    if (h >= 12) {
      pay = 80;
      line =
        h +
        " tin raiders! Now THAT'S shootin'! You ever want a job, the Guard's hiring — tell Kincaid I sent you.";
    } else if (h >= 8) {
      pay = 40;
      line = h + " down. Not bad, not bad at all. Here's your scrip.";
    } else if (h >= 5) {
      pay = 15;
      line = h + " hits. You'd survive a small raider. A very small one.";
    } else
      line =
        h +
        (h === 1 ? " hit" : " hits") +
        ". Honey, the tin raiders are laughing at you. Can't hear it, but they are.";
    if (pay) L.giveScrip(pay);
    L.say("neon_annie", line, 5);
    L.notify(
      "SHOOTING GALLERY: " +
        h +
        " hits, " +
        GAL.shots +
        " shots" +
        (pay ? " — " + pay + " scrip" : ""),
    );
    if (h >= 12 && !L.flag("neon_gallery_champ")) {
      L.setFlag("neon_gallery_champ");
      L.give("q_neon_deadeye", 1);
      L.xp(75, "Ammo Annie's Gallery: champion");
      const a = L.npc("neon_annie");
      if (a && a.merchant) a.merchant.markup = 0.85;
    }
    L.incFlag("neon_gallery_rounds");
  }
  const _o = new THREE.Vector3(),
    _d = new THREE.Vector3(),
    _c = new THREE.Vector3();
  function galleryShot() {
    if (!GAL.active) return;
    GAL.shots++;
    G.camera.getWorldPosition(_o);
    G.camera.getWorldDirection(_d);
    const wall = G.world.raycast(_o, _d, 60);
    const maxT = wall ? wall.dist + 0.3 : 60;
    let best = null,
      bt = maxT;
    for (const t of GAL.targets) {
      if (!t.up || t.hit) continue;
      targetPos(t, GAL.t, _c);
      _c.y += 1.3;
      // ray-sphere against the body (r .34) and the head
      for (const [dy, r] of [
        [0, 0.34],
        [0.4, 0.2],
      ]) {
        const cy = _c.y + dy;
        const ox = _o.x - _c.x,
          oy = _o.y - cy,
          oz = _o.z - _c.z;
        const b = ox * _d.x + oy * _d.y + oz * _d.z,
          cc = ox * ox + oy * oy + oz * oz - r * r;
        const disc = b * b - cc;
        if (disc < 0) continue;
        const tt = -b - Math.sqrt(disc);
        if (tt > 0 && tt < bt) {
          bt = tt;
          best = t;
        }
      }
    }
    if (best) {
      best.hit = true;
      best.flip = 0.001;
      GAL.hits++;
      targetPos(best, GAL.t, _c);
      _c.y += 1.3;
      L.sfx("ricochet", { pos: _c.clone(), volume: 0.9 });
      if (!G.isStub("fx") && G.fx.sparks)
        try {
          G.fx.sparks(_c.clone());
        } catch (e) {
          /* ignore */
        }
    }
  }
