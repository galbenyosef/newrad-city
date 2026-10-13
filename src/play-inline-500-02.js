// play-inline-500 02 — math
// Lines 368-704 of readable/play-inline-500.pretty.js (statement-aligned).
  function updateFlash(dt) {
    V.flashT += dt;
    const st = FLASH_STYLE[V.flashKind] || FLASH_STYLE.ballistic;
    const m = V.model;
    const on =
      m &&
      m.sockets.muzzle &&
      V.flashT < st.dur &&
      !V.hideModel &&
      V.root.visible;
    V.flash.visible = !!on;
    // light: flash burst or constant energy glow
    let li = 0;
    if (on) {
      const k = 1 - V.flashT / st.dur;
      m.sockets.muzzle.getWorldPosition(_mw);
      m.sockets.muzzle.getWorldQuaternion(_mq);
      V.flash.position.copy(_mw);
      V.flash.quaternion.copy(_mq);
      const s =
        (0.7 + Math.random() * 0.5) * (V.flashScale || 1) * (0.6 + 0.4 * k);
      const u = V.flash.userData;
      u.front.scale.setScalar(st.size * s * 2);
      u.glowM.scale.setScalar(st.size * s * 4);
      u.petals.scale.set(st.petal * s, st.petal * s, st.petal * s * 1.4);
      u.petals.visible = st.petal > 0;
      li = st.li * k;
      V.light.position.copy(_mw);
    }
    // flamer pilot light / energy idle glow
    if (m && m.cfg.idleGlow && V.root.visible && !V.hideModel) {
      const gl = m.cfg.idleGlow;
      if (li < gl.i) {
        li = gl.i * (0.9 + Math.random() * 0.2);
        V.light.color.setHex(gl.color);
        if (m.sockets[gl.at || "muzzle"])
          m.sockets[gl.at || "muzzle"].getWorldPosition(V.light.position);
      }
    }
    V.light.intensity = li;
  }

  // ------------------------------------------------------------------
  // Shell casings (view layer, pooled)
  // ------------------------------------------------------------------
  const SHELL_GEO = {};
  function shellMesh(kind) {
    if (!SHELL_GEO[kind]) {
      const b = P.builder();
      const dims = {
        pistol: [0.0055, 0.019],
        pistol_small: [0.0045, 0.015],
        magnum: [0.0058, 0.028],
        rifle: [0.0048, 0.036],
        rifle_small: [0.0035, 0.026],
        rifle_long: [0.006, 0.05],
        shell: [0.0105, 0.058],
      }[kind] || [0.005, 0.02];
      if (kind === "shell") {
        b.cyl("red", dims[0], dims[1] * 0.75, [0, 0, -dims[1] * 0.125], {
          seg: 10,
        });
        b.cyl(
          "brass",
          dims[0] * 1.05,
          dims[1] * 0.25,
          [0, 0, dims[1] * 0.375],
          { seg: 10 },
        );
      } else {
        b.add(
          P.GEO.lathe(
            [
              [dims[0] * 1.08, -dims[1] / 2],
              [dims[0] * 1.08, -dims[1] / 2 + 0.0015],
              [dims[0] * 0.9, -dims[1] / 2 + 0.0022],
              [dims[0], -dims[1] / 2 + 0.003],
              [dims[0], dims[1] * 0.3],
              [dims[0] * 0.8, dims[1] * 0.45],
              [dims[0] * 0.8, dims[1] / 2],
            ],
            10,
          ),
          "brass",
        );
      }
      const grp = b.build();
      SHELL_GEO[kind] = grp.children.map((c) => ({
        geo: c.geometry,
        mat: c.material,
      }));
    }
    const g = new THREE.Group();
    for (const it of SHELL_GEO[kind]) {
      const m = new THREE.Mesh(it.geo, it.mat);
      m.frustumCulled = false;
      g.add(m);
    }
    g.userData.kind = kind;
    return g;
  }
  const _ep = new THREE.Vector3(),
    _eq = new THREE.Quaternion(),
    _ev = new THREE.Vector3();
  /** Eject a casing from socket (default 'eject') in camera space; dirLocal = eject direction in weapon space */
  V.ejectShell = function (kind, socketName, dirLocal, speed) {
    if (!V.built || !kind || !V.model) return;
    const sock = V.model.sockets[socketName || "eject"];
    if (!sock) return;
    let s = V.shells.find((x) => !x.alive && x.kind === kind);
    if (!s) {
      if (V.shells.length >= 24) {
        s = V.shells.reduce((a, b) => (a.age > b.age ? a : b));
        V.shellRoot.remove(s.mesh);
      } else s = {};
      s.mesh = shellMesh(kind);
      s.kind = kind;
      if (V.shells.indexOf(s) < 0) V.shells.push(s);
      V.shellRoot.add(s.mesh);
    }
    // socket position in camera space
    V.root.updateMatrixWorld(true);
    sock.getWorldPosition(_ep);
    sock.getWorldQuaternion(_eq);
    s.mesh.position.copy(_ep);
    s.mesh.quaternion.copy(_eq);
    s.mesh.rotateY(Math.PI / 2);
    const d = dirLocal || [1, 0.7, 0.25];
    _ev
      .set(d[0], d[1], d[2])
      .normalize()
      .applyQuaternion(_eq)
      .multiplyScalar((speed || 1.6) * (0.85 + Math.random() * 0.3));
    if (!s.vel) {
      s.vel = new THREE.Vector3();
      s.spin = new THREE.Vector3();
    } // allocated once per pool entry
    s.vel.copy(_ev);
    s.spin.set(
      (Math.random() - 0.5) * 30,
      (Math.random() - 0.5) * 30,
      (Math.random() - 0.5) * 20,
    );
    s.age = 0;
    s.alive = true;
    s.mesh.visible = true;
    s.life = 0.9;
  };
  function updateShells(dt) {
    for (const s of V.shells) {
      if (!s.alive) continue;
      s.age += dt;
      s.vel.y -= 7.5 * dt;
      s.mesh.position.addScaledVector(s.vel, dt);
      s.mesh.rotation.x += s.spin.x * dt;
      s.mesh.rotation.y += s.spin.y * dt;
      s.mesh.rotation.z += s.spin.z * dt;
      if (s.age > s.life || s.mesh.position.y < -0.8) {
        s.alive = false;
        s.mesh.visible = false;
        if (s.tink !== false && Math.random() < 0.7)
          G.sfx.play("ricochet", {
            volume: 0.06,
            pitch: 2.6 + Math.random() * 0.6,
          });
      }
    }
  }

  // ------------------------------------------------------------------
  // Flame stream (flamer) — additive sprites flowing from the nozzle
  // ------------------------------------------------------------------
  // ------------------------------------------------------------------
  // Muzzle smoke wisps: soft grey puffs that curl up from the barrel
  // after shots (heavier after long bursts)
  // ------------------------------------------------------------------
  function smokeTexture() {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const x = c.getContext("2d");
    for (let i = 0; i < 6; i++) {
      const px = 20 + Math.random() * 24,
        py = 20 + Math.random() * 24,
        r = 10 + Math.random() * 14;
      const g = x.createRadialGradient(px, py, 0, px, py, r);
      g.addColorStop(0, "rgba(235,232,220,0.5)");
      g.addColorStop(1, "rgba(235,232,220,0)");
      x.fillStyle = g;
      x.fillRect(0, 0, 64, 64);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  function buildSmoke() {
    const root = new THREE.Group();
    root.name = "wpn_smoke";
    const tex = smokeTexture();
    const parts = [];
    for (let i = 0; i < 18; i++) {
      const m = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: tex,
          color: 0xbdb8aa,
          transparent: true,
          depthWrite: false,
          opacity: 0,
        }),
      );
      m.visible = false;
      m.frustumCulled = false;
      m.renderOrder = 9;
      root.add(m);
      parts.push({
        m,
        alive: false,
        age: 0,
        life: 1,
        vel: new THREE.Vector3(),
        spin: 0,
      });
    }
    return { root, parts, heat: 0 };
  }
  /** Emit n wisps at the muzzle. */
  V.smokePuff = function (n, strength) {
    const m = V.model;
    if (!V.smoke || !m || !m.sockets.muzzle) return;
    V.root.updateMatrixWorld(true);
    m.sockets.muzzle.getWorldPosition(_ep);
    G.viewCamera.worldToLocal(_ep);
    for (let i = 0; i < n; i++) {
      const p = V.smoke.parts.find((x) => !x.alive);
      if (!p) return;
      p.alive = true;
      p.age = 0;
      p.life = 0.7 + Math.random() * 0.6;
      p.m.position.copy(_ep);
      p.m.position.z -= 0.02 + Math.random() * 0.04;
      p.vel.set(
        (Math.random() - 0.5) * 0.06,
        0.06 + Math.random() * 0.08,
        -0.05 - Math.random() * 0.1,
      );
      p.base = (0.025 + Math.random() * 0.02) * (strength || 1);
      p.m.material.rotation = Math.random() * 6.28;
      p.spin = (Math.random() - 0.5) * 1.5;
      p.m.visible = true;
    }
  };
  function updateSmoke(dt) {
    if (!V.smoke) return;
    V.smoke.heat = Math.max(0, V.smoke.heat - dt * 0.8);
    for (const p of V.smoke.parts) {
      if (!p.alive) continue;
      p.age += dt;
      const k = p.age / p.life;
      if (k >= 1) {
        p.alive = false;
        p.m.visible = false;
        continue;
      }
      p.vel.y += 0.05 * dt; // buoyancy
      p.m.position.addScaledVector(p.vel, dt);
      p.m.material.rotation += p.spin * dt;
      const s = p.base * (1 + k * 3.5);
      p.m.scale.set(s, s, s);
      p.m.material.opacity =
        0.32 * Math.sin(Math.PI * Math.min(1, k * 1.4)) * (1 - k * 0.5);
    }
  }
  /** Called per shot by the firing code. */
  V.shotSmoke = function (w) {
    if (!w || w.flash === "none" || w.flash === "flame") return;
    const heavy = w.flash === "rocket" || w.pellets > 1;
    V.smoke.heat = Math.min(3, V.smoke.heat + (w.automatic ? 0.12 : 0.5));
    if (heavy) V.smokePuff(3, 1.6);
    else if (w.flash === "gyro") V.smokePuff(2, 0.7);
    else if (w.automatic) {
      if (Math.random() < 0.35) V.smokePuff(1, 0.8 + V.smoke.heat * 0.3);
    } else V.smokePuff(2, 1);
  };

  function buildFlames() {
    const root = new THREE.Group();
    root.name = "wpn_flames";
    const tex = P.glowTexture();
    const parts = [];
    for (let i = 0; i < 26; i++) {
      const m = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: tex,
          color: 0xffa040,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          toneMapped: false,
        }),
      );
      m.visible = false;
      m.frustumCulled = false;
      m.renderOrder = 11;
      root.add(m);
      parts.push({
        m,
        alive: false,
        age: 0,
        life: 0.5,
        vel: new THREE.Vector3(),
      });
    }
    return { root, parts, emit: 0 };
  }
  V.flameEmit = function (dt) {
    const f = V.flames;
    const m = V.model;
    if (!m || !m.sockets.muzzle) return;
    f.emit += dt * 60;
    m.sockets.muzzle.getWorldPosition(_ep);
    // view camera space == viewScene space for our children (camera at origin, identity)
    G.viewCamera.worldToLocal(_ep);
    while (f.emit >= 1) {
      f.emit -= 1;
      const p = f.parts.find((x) => !x.alive);
      if (!p) break;
      p.alive = true;
      p.age = 0;
      p.life = 0.35 + Math.random() * 0.2;
      p.m.position.copy(_ep);
      p.vel.set(
        (Math.random() - 0.5) * 0.6,
        (Math.random() - 0.3) * 0.5,
        -9 - Math.random() * 3,
      );
      p.m.visible = true;
    }
  };
