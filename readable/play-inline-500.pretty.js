/* src/weapons/50_view.js */
/* =====================================================================
 * NEW RAD CITY — WEAPONS: viewmodel runtime
 *
 * Owns the first-person rig in G.viewScene / G.viewCamera:
 *   viewCamera
 *     └─ V.root            (bob of the whole rig)
 *          ├─ V.pivot      (weapon transform: hip/ADS/sprint/lower + sway + recoil + action anim)
 *          │    └─ model.root (current weapon, origin = right-hand grip)
 *          └─ arms.root    (IK arms; hands follow weapon sockets)
 *   viewScene
 *     ├─ V.flash           (muzzle flash, placed at muzzle socket)
 *     ├─ V.light           (muzzle/energy glow PointLight, always present)
 *     └─ V.shells          (ejected casing pool)
 *
 * Also: scope overlay (DOM), ADS FOV, visibility rules.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const P = G.weapons._;
  const U = () => G.util;

  // ------------------------------------------------------------------
  // Small math helpers
  // ------------------------------------------------------------------
  function Spring(k, d) {
    return { x: 0, v: 0, k: k, d: d };
  }
  function stepSpring(s, dt) {
    if (dt <= 0) return;
    const n = Math.min(8, Math.ceil(dt / 0.008)),
      h = dt / n;
    for (let i = 0; i < n; i++) {
      s.v += (-s.k * s.x - s.d * s.v) * h;
      s.x += s.v * h;
    }
    if (!isFinite(s.x)) {
      s.x = 0;
      s.v = 0;
    }
  }
  P.Spring = Spring;
  P.stepSpring = stepSpring;
  const ease = (t) => t * t * (3 - 2 * t);
  P.ease = ease;
  /** keyframe track [[t, value(number|array)], ...] sampled at t with smoothstep between keys */
  P.kf = function (track, t, out) {
    if (!track || !track.length) return out;
    let a = track[0],
      b = track[track.length - 1];
    if (t <= a[0]) b = a;
    else if (t >= b[0]) a = b;
    else
      for (let i = 0; i < track.length - 1; i++)
        if (t >= track[i][0] && t <= track[i + 1][0]) {
          a = track[i];
          b = track[i + 1];
          break;
        }
    const k = a === b ? 0 : ease((t - a[0]) / (b[0] - a[0]));
    if (typeof a[1] === "number") return a[1] + (b[1] - a[1]) * k;
    out = out || [];
    for (let i = 0; i < a[1].length; i++)
      out[i] = a[1][i] + (b[1][i] - a[1][i]) * k;
    return out;
  };
  /** Quaternion from hand-frame basis (x axis, y axis) given as arrays. */
  const _bx = new THREE.Vector3(),
    _by = new THREE.Vector3(),
    _bz = new THREE.Vector3(),
    _bm = new THREE.Matrix4();
  P.basisQ = function (x, y, out) {
    _bx.set(x[0], x[1], x[2]).normalize();
    _by.set(y[0], y[1], y[2]);
    _by.addScaledVector(_bx, -_by.dot(_bx)).normalize();
    _bz.crossVectors(_bx, _by);
    _bm.makeBasis(_bx, _by, _bz);
    return (out || new THREE.Quaternion()).setFromRotationMatrix(_bm);
  };
  /** Hand socket helper: parent, name, pos, xAxis (grip axis; thumb is at -X for right hand), yAxis (back of hand) */
  P.handSocket = function (parent, name, p, x, y) {
    const o = new THREE.Object3D();
    o.name = name;
    o.position.set(p[0], p[1], p[2]);
    P.basisQ(x, y, o.quaternion);
    parent.add(o);
    return o;
  };

  // ------------------------------------------------------------------
  // Rig state
  // ------------------------------------------------------------------
  const V = (P.view = {
    built: false,
    model: null, // current model instance
    pendingKind: null, // kind waiting for the swap (after lowering)
    adsT: 0,
    sprintT: 0,
    lowerT: 1,
    blockT: 0,
    raiseT: 0,
    swimT: 0,
    ads: false,
    scoped: false,
    springs: {
      yaw: Spring(90, 13),
      pitch: Spring(90, 13),
      sx: Spring(80, 12),
      sy: Spring(80, 12),
      land: Spring(120, 12),
      roll: Spring(70, 11),
      recZ: Spring(420, 30),
      recP: Spring(300, 22),
      recR: Spring(250, 20),
      recY: Spring(250, 20),
      recX: Spring(300, 24),
    },
    anim: { p: [0, 0, 0], r: [0, 0, 0] }, // action-driven offsets (reset each frame)
    // hand overrides set by actions each frame: {w, socket|free, socket2|free2, t2}
    handOv: { R: { w: 0 }, L: { w: 0 } },
    hideModel: false, // actions may hide the weapon (e.g. grenade quick-throw)
    hideLeft: false,
    shotT: 9, // time since last shot (drives slide/hammer animation)
    triggerHeld: false,
    spin: 0,
    spinAngle: 0, // minigun
    bobPhase: 0,
    bobAmt: 0,
    strafe: 0,
    lastOnGround: true,
    flashT: 9,
    flashKind: "ballistic",
    time: 0,
  });

  V.build = function () {
    if (V.built || !G.viewCamera) return;
    P.arms.build();
    V.root = new THREE.Group();
    V.root.name = "wpn_root";
    V.pivot = new THREE.Group();
    V.pivot.name = "wpn_pivot";
    V.pivot.rotation.order = "YXZ";
    V.root.add(V.pivot);
    V.root.add(P.arms.root);
    G.viewCamera.add(V.root);
    // environment reflections for metal
    const env = P.buildEnv();
    if (env)
      for (const m of Object.values(P.MAT_DEFS)) {
        /* materials are created lazily; set on creation below */
      }
    V.env = env;
    // muzzle flash + light
    V.flash = buildFlash();
    G.viewScene.add(V.flash);
    V.light = new THREE.PointLight(0xffc070, 0, 1.4, 2);
    G.viewScene.add(V.light);
    // Secondary lights (camera space, scaled with the world light). The old frontal fill from behind
    // the eye flattened everything into "unlit plastic"; now: a warm ground bounce from below so
    // undersides never go black, and a cool sky kicker from in front/above that rims fingers, knuckles
    // and gun edges against the world. The key light itself is G.viewLights (atmosphere drives it
    // from the sun direction / interior light and a player-in-shadow probe).
    V.fill = new THREE.DirectionalLight(0xd2b898, 0.22);
    V.fill.position.set(0.25, -1.0, 0.35);
    G.viewCamera.add(V.fill);
    G.viewScene.add(V.fill.target);
    V.rim = new THREE.DirectionalLight(0xc8d4e0, 0.3);
    V.rim.position.set(-0.35, 0.75, -1.0);
    G.viewCamera.add(V.rim);
    V.rim.target = V.fill.target;
    // shell pool
    V.shells = [];
    V.shellRoot = new THREE.Group();
    V.shellRoot.name = "wpn_shells";
    G.viewCamera.add(V.shellRoot);
    // flame stream sprites (flamer)
    V.flames = buildFlames();
    G.viewCamera.add(V.flames.root);
    // muzzle smoke wisps (view layer)
    V.smoke = buildSmoke();
    G.viewCamera.add(V.smoke.root);
    // scope overlay
    buildScopeOverlay();
    V.built = true;
  };

  /** Apply the env map to all view materials (called after building models). */
  V.applyEnv = function () {
    if (!V.env) return;
    for (const m of P.allViewMats())
      if (m.isMeshStandardMaterial && m.envMap !== V.env) {
        m.envMap = V.env;
        m.envMapIntensity = (V._envK || 1) * (m.userData.envK || 1);
        m.needsUpdate = true;
      }
  };

  // ------------------------------------------------------------------
  // Muzzle flash (view layer)
  // ------------------------------------------------------------------
  function flashTexture() {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const x = c.getContext("2d");
    const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(255,255,240,1)");
    g.addColorStop(0.15, "rgba(255,230,160,0.95)");
    g.addColorStop(0.4, "rgba(255,150,40,0.55)");
    g.addColorStop(1, "rgba(255,80,0,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, 128, 128);
    // star rays
    x.globalCompositeOperation = "lighter";
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + (i % 2) * 0.2;
      x.save();
      x.translate(64, 64);
      x.rotate(a);
      const rg = x.createLinearGradient(0, 0, 60, 0);
      rg.addColorStop(0, "rgba(255,240,200,0.9)");
      rg.addColorStop(1, "rgba(255,120,20,0)");
      x.fillStyle = rg;
      x.beginPath();
      x.moveTo(0, -5);
      x.lineTo(60, 0);
      x.lineTo(0, 5);
      x.fill();
      x.restore();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  function flameTexture() {
    const c = document.createElement("canvas");
    c.width = 64;
    c.height = 128;
    const x = c.getContext("2d");
    const g = x.createLinearGradient(0, 128, 0, 0);
    g.addColorStop(0, "rgba(255,255,230,1)");
    g.addColorStop(0.3, "rgba(255,200,90,0.9)");
    g.addColorStop(0.7, "rgba(255,110,20,0.5)");
    g.addColorStop(1, "rgba(255,60,0,0)");
    x.fillStyle = g;
    x.beginPath();
    x.moveTo(32, 0);
    x.quadraticCurveTo(64, 70, 34, 128);
    x.lineTo(30, 128);
    x.quadraticCurveTo(0, 70, 32, 0);
    x.fill();
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  function glowTexture() {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const x = c.getContext("2d");
    const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.25, "rgba(255,255,255,0.6)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  P.glowTexture = () => (P._glowTex = P._glowTex || glowTexture());

  function buildFlash() {
    const grp = new THREE.Group();
    grp.name = "wpn_flash";
    grp.visible = false;
    const addMat = (tex, color) => {
      const m = new THREE.MeshBasicMaterial({
        map: tex,
        color: color || 0xffffff,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
        side: THREE.DoubleSide,
      });
      m.userData.shared = true;
      return m;
    };
    const star = flashTexture(),
      flame = flameTexture(),
      glow = P.glowTexture();
    // front-facing star (billboard handled by facing the camera: plane in XY)
    const front = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), addMat(star));
    grp.add(front);
    // side petals: 3 crossed planes along -Z
    const petals = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const pg = new THREE.PlaneGeometry(0.5, 1);
      pg.rotateX(-Math.PI / 2);
      pg.translate(0, 0, -0.5);
      const m = new THREE.Mesh(pg, addMat(flame));
      m.rotation.z = (i / 3) * Math.PI;
      petals.add(m);
    }
    grp.add(petals);
    const glowM = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      addMat(glow, 0xffa040),
    );
    grp.add(glowM);
    grp.userData = { front, petals, glowM };
    grp.traverse((o) => {
      o.frustumCulled = false;
      o.renderOrder = 10;
    });
    return grp;
  }

  const FLASH_STYLE = {
    ballistic: {
      color: 0xffffff,
      glow: 0xffa040,
      size: 0.09,
      petal: 0.12,
      light: 0xffb060,
      li: 3.2,
      dur: 0.05,
    },
    gyro: {
      color: 0xffe2a8,
      glow: 0xff8a30,
      size: 0.05,
      petal: 0.02,
      light: 0xffa050,
      li: 1.6,
      dur: 0.06,
    },
    rocket: {
      color: 0xffffff,
      glow: 0xff9030,
      size: 0.22,
      petal: 0.3,
      light: 0xffa050,
      li: 5,
      dur: 0.1,
    },
  };
  /** Trigger the view-layer muzzle flash. kind from weapon.flash */
  V.muzzleFlash = function (kind, scale) {
    if (!V.built || kind === "none" || kind === "flame") return;
    V.flashT = 0;
    V.flashKind = FLASH_STYLE[kind] ? kind : "ballistic";
    V.flashScale = scale || 1;
    const st = FLASH_STYLE[V.flashKind];
    const u = V.flash.userData;
    u.front.material.color.setHex(st.color);
    u.glowM.material.color.setHex(st.glow);
    u.petals.children.forEach((m) => m.material.color.setHex(st.color));
    u.front.rotation.z = Math.random() * Math.PI * 2;
    u.petals.rotation.z = Math.random() * Math.PI;
    V.light.color.setHex(st.light);
  };
  const _mw = new THREE.Vector3(),
    _mq = new THREE.Quaternion(),
    _ms = new THREE.Vector3();
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
  function updateFlames(dt) {
    for (const p of V.flames.parts) {
      if (!p.alive) continue;
      p.age += dt;
      const k = p.age / p.life;
      if (k >= 1) {
        p.alive = false;
        p.m.visible = false;
        continue;
      }
      p.vel.y += 1.5 * dt;
      p.m.position.addScaledVector(p.vel, dt);
      const s = 0.05 + k * 1.3;
      p.m.scale.set(s, s, s);
      const c = p.m.material.color;
      if (k < 0.2) c.setRGB(1, 0.95, 0.7);
      else if (k < 0.6) c.setRGB(1, 0.55, 0.15);
      else c.setRGB(0.5 * (1 - k) * 2, 0.15 * (1 - k), 0.02);
      p.m.material.opacity = 1 - k * k;
    }
  }

  // ------------------------------------------------------------------
  // Scope overlay (DOM)
  // ------------------------------------------------------------------
  function buildScopeOverlay() {
    if (document.getElementById("wpn-scope")) {
      V.scopeEl = document.getElementById("wpn-scope");
      return;
    }
    const el = document.createElement("div");
    el.id = "wpn-scope";
    el.className = "wpn-scope";
    el.innerHTML =
      '<div class="wpn-scope-ring"></div><div class="wpn-scope-h"></div><div class="wpn-scope-v"></div>' +
      '<div class="wpn-scope-post"></div><div class="wpn-scope-dots"></div><div class="wpn-scope-glint"></div>' +
      '<div class="wpn-scope-breath"><span>HOLD BREATH</span><i></i></div>';
    document.body.appendChild(el);
    V.scopeEl = el;
    V.breathEl = el.querySelector
      ? el.querySelector(".wpn-scope-breath")
      : null;
    V.breathBar = V.breathEl ? V.breathEl.querySelector("i") : null;
  }
  function updateScope() {
    if (!V.scopeEl) return;
    const show =
      V.scoped &&
      V.adsT > 0.88 &&
      V.root.visible !== false &&
      G.state !== "dead";
    const cls = show ? "wpn-scope on" : "wpn-scope";
    if (V.scopeEl.className !== cls) V.scopeEl.className = cls;
    // hold-breath meter (Shift): only shown while holding or recovering
    if (show && V.breathEl && V.breathBar && P.breathState) {
      const b = P.breathState();
      const vis = b.holding || b.winded || b.breath < 0.999;
      const bc =
        "wpn-scope-breath" + (vis ? " on" : "") + (b.winded ? " winded" : "");
      if (V.breathEl.className !== bc) V.breathEl.className = bc;
      const wpc = Math.round(b.breath * 100) + "%";
      if (V.breathBar.style.width !== wpc) V.breathBar.style.width = wpc;
    }
  }

  // ------------------------------------------------------------------
  // Model switching
  // ------------------------------------------------------------------
  /** Show a model instance (already built) — detaches the previous one. */
  V.setModel = function (inst) {
    if (V.model === inst) return;
    if (V.model && V.model.root.parent)
      V.model.root.parent.remove(V.model.root);
    V.model = inst;
    if (inst) {
      V.pivot.add(inst.root);
      // per-model on-screen scale (long guns are drawn a touch smaller)
      inst.root.scale.setScalar(inst.cfg.viewScale || 1);
      // optional turn about the model's own up axis (two-handed melee: show the side of the head, not its back)
      inst.root.rotation.y = inst.cfg.spinY || 0;
      P.arms.setPose("R", inst.cfg.rightPose || "trigger");
      P.arms.setPose("L", inst.cfg.leftPose || "support");
      V.applyEnv();
    }
  };

  // ------------------------------------------------------------------
  // Hand targets
  // ------------------------------------------------------------------
  const _inv = new THREE.Matrix4(),
    _tm = new THREE.Matrix4(),
    _tp = new THREE.Vector3(),
    _tq = new THREE.Quaternion(),
    _ts = new THREE.Vector3();
  /** World (view camera) transform of an Object3D expressed in arms-root space. */
  V.socketPose = function (obj, out) {
    out = out || { p: new THREE.Vector3(), q: new THREE.Quaternion() };
    _inv.copy(P.arms.root.matrixWorld).invert();
    _tm.multiplyMatrices(_inv, obj.matrixWorld);
    _tm.decompose(out.p, out.q, _ts);
    return out;
  };
  /** Free pose in camera space: p array, basis x/y arrays */
  V.freePose = function (p, x, y, out) {
    out = out || { p: new THREE.Vector3(), q: new THREE.Quaternion() };
    out.p.set(p[0], p[1], p[2]).sub(P.arms.root.position);
    P.basisQ(x, y, out.q);
    return out;
  };
  const tgtR = { p: new THREE.Vector3(), q: new THREE.Quaternion() },
    tgtL = { p: new THREE.Vector3(), q: new THREE.Quaternion() };
  function blendTarget(t, pose, w) {
    w = Math.min(1, w);
    t.p.lerp(pose.p, w);
    t.q.slerp(pose.q, w);
    return t;
  }
  const ovA = { p: new THREE.Vector3(), q: new THREE.Quaternion() },
    ovB = { p: new THREE.Vector3(), q: new THREE.Quaternion() };
  const ovT = { p: new THREE.Vector3(), q: new THREE.Quaternion() };
  /** Resolve an override descriptor into a pose (or null). */
  function resolveOv(ov, out) {
    if (!(ov.w > 0)) return null;
    let a = null;
    if (ov.socket) {
      a = V.socketPose(ov.socket, out);
      if (ov.basis) a.q.copy(ov.basis);
    } // socket position, camera-space hand basis
    else if (ov.free) a = V.freePose(ov.free.p, ov.free.x, ov.free.y, out);
    if (ov.t2 > 0 && (ov.socket2 || ov.free2)) {
      const b = ov.socket2
        ? V.socketPose(ov.socket2, ovT)
        : V.freePose(ov.free2.p, ov.free2.x, ov.free2.y, ovT);
      if (ov.socket2 && ov.basis2) b.q.copy(ov.basis2);
      if (!a) {
        out.p.copy(b.p);
        out.q.copy(b.q);
        a = out;
      } else {
        a.p.lerp(b.p, Math.min(1, ov.t2));
        a.q.slerp(b.q, Math.min(1, ov.t2));
      }
    }
    return a;
  }

  // ------------------------------------------------------------------
  // Per-frame pose
  // ------------------------------------------------------------------
  const _pos = new THREE.Vector3(),
    _hip = new THREE.Vector3(),
    _adsP = new THREE.Vector3();
  const _solveOpt = { ads: 0, ext: 0, raise: 0, hintL: null, hintR: null };
  const DEFAULT_LOWER = { p: [0.06, -0.3, 0.1], r: [-0.9, 0.35, 0.3] };
  const DEFAULT_SPRINT = { p: [-0.02, -0.04, 0.03], r: [-0.35, 0.55, 0.35] };
  // left-arm raise (scripted gestures): forearm horizontal across the view, inside of the wrist toward the eye
  const RAISE_LEFT = {
    p: [0.21, -0.035, -0.37],
    x: [0.0, -0.95, 0.3],
    y: [0.0, 0.3, 0.95],
  };
  // one-handed guns: left hand hanging just below the bottom edge of the frame
  const LEFT_REST = { p: [-0.1, -0.42, -0.2], x: [0, 0, -1], y: [-1, 0.25, 0] };

  V.update = function (dt, realDt) {
    if (!V.built) return;
    const pl = G.player;
    const S = V.springs;
    V.time += realDt;
    const m = V.model;
    const cfg = m ? m.cfg : {};
    const st = G.state;

    // ---------------- visibility ----------------
    const stateOk =
      st === "play" ||
      st === "goggles" ||
      st === "paused" ||
      st === "container" ||
      st === "barter" ||
      st === "levelup" ||
      st === "cutscene";
    const vis =
      !!m &&
      stateOk &&
      !pl.camOverride &&
      pl.alive !== false &&
      G.viewmodelVisible !== false;
    V.root.visible = vis;
    if (!vis) {
      V.flash.visible = false;
      V.light.intensity = 0;
      updateScope();
      return;
    }

    // ---------------- blend channels ----------------
    const wantLower =
      V.pendingKind !== null ||
      P.state.holstered ||
      pl.swimming ||
      V.forceLower;
    if (wantLower) {
      V.lowerT = G.util.damp(V.lowerT, 1, 9, realDt);
      V._raiseFrom = V.lowerT;
    } else if (V.lowerT > 0) {
      // draw: a timed swing up from below (smoothstep, weight-dependent) instead of an exponential creep, then
      // the gun's momentum carries it a hair past the hold and it settles (muzzle flick + roll)
      const w = P.state.cur && P.state.cur.def && P.state.cur.def.weapon;
      const dd =
        cfg.drawTime ||
        (w && w.twoHanded ? ((cfg.viewScale || 1) < 0.85 ? 0.75 : 0.55) : 0.42);
      V._raiseFrom = Math.max(V._raiseFrom || 0, V.lowerT);
      V.lowerT = Math.max(0, V.lowerT - realDt / dd);
      if (V.lowerT === 0 && (V._raiseFrom || 0) > 0.3) {
        const heavy = w && w.twoHanded ? 1.3 : 1;
        S.recP.v += 1.1 * heavy;
        S.recR.v -= 1.4;
        S.recZ.v -= 0.12 * heavy;
        S.land.v -= 0.12 * heavy;
        V._raiseFrom = 0;
      }
    }
    const wantAds = V.ads && !wantLower && !P.state.busyNoAds;
    V.adsT = G.util.damp(
      V.adsT,
      wantAds ? 1 : 0,
      wantAds ? 13 : 11,
      dt > 0 ? dt / Math.max(G.timeScale, 0.05) : realDt,
    );
    const sprinting = pl.sprinting && !V.ads;
    V.sprintT = G.util.damp(V.sprintT, sprinting ? 1 : 0, 8, realDt);
    V.blockT = G.util.damp(V.blockT, V.blocking ? 1 : 0, 14, realDt);
    V.raiseT = G.util.damp(V.raiseT, V.raiseWanted ? 1 : 0, 10, realDt); // nothing on the wrist: only scripted gestures raise it

    // pending model swap once fully lowered
    if (V.pendingKind !== null && V.lowerT > 0.93) {
      P.swapToPending();
    }

    // ---------------- springs: look sway, landing, strafe ----------------
    const I = G.input;
    if (st === "play" && I.locked) {
      const k = 1 - 0.7 * V.adsT;
      S.yaw.v += I.mouse.dx * 0.018 * k;
      S.pitch.v += I.mouse.dy * 0.014 * k;
      S.sx.v -= I.mouse.dx * 0.0011 * k;
      S.sy.v += I.mouse.dy * 0.0009 * k;
    }
    // clamp sway so fast flicks don't throw the gun off-screen
    S.yaw.x = G.util.clamp(S.yaw.x, -0.12, 0.12);
    S.pitch.x = G.util.clamp(S.pitch.x, -0.1, 0.1);
    S.sx.x = G.util.clamp(S.sx.x, -0.03, 0.03);
    S.sy.x = G.util.clamp(S.sy.x, -0.03, 0.03);
    // jump start
    if (V.lastOnGround && !pl.onGround && pl.vel && pl.vel.y > 1) {
      S.land.v -= 0.35;
    }
    V.lastOnGround = pl.onGround;
    // strafe roll: lateral velocity in camera frame
    if (pl.vel) {
      const lat = pl.vel.x * Math.cos(pl.yaw) - pl.vel.z * Math.sin(pl.yaw);
      V.strafe = G.util.damp(V.strafe, G.util.clamp(lat / 5, -1, 1), 6, realDt);
    }
    const sdt = dt > 0 ? dt : st === "goggles" ? realDt : 0;
    for (const k in S) stepSpring(S[k], sdt);

    // ---------------- bob ----------------
    const speed = pl.moveSpeed || 0;
    V.bobAmt = G.util.damp(
      V.bobAmt,
      pl.onGround ? Math.min(speed / 4.6, 1.7) : 0,
      8,
      realDt,
    );
    V.bobPhase =
      pl._bob !== undefined ? pl._bob : V.bobPhase + realDt * speed * 1.9;
    const ph = V.bobPhase,
      ba = V.bobAmt * (1 - 0.8 * V.adsT);
    const sprintK = V.sprintT;
    const bobX = Math.cos(ph) * (0.007 + 0.016 * sprintK) * ba;
    const bobY = -Math.abs(Math.sin(ph)) * (0.009 + 0.012 * sprintK) * ba;
    const bobR = Math.cos(ph) * (0.014 + 0.03 * sprintK) * ba;
    const bobP = Math.sin(ph * 2) * (0.006 + 0.02 * sprintK) * ba;
    const bobYaw = Math.cos(ph) * 0.03 * sprintK * ba;
    // idle breathing
    const t = V.time;
    const br = 1 - 0.75 * V.adsT;
    const idleY = Math.sin(t * 1.5) * 0.0016 * br,
      idleP = Math.sin(t * 1.5 + 0.6) * 0.004 * br,
      idleYaw = Math.sin(t * 0.63) * 0.003 * br;

    // ---------------- actions ----------------
    V.anim.p[0] = V.anim.p[1] = V.anim.p[2] = 0;
    V.anim.r[0] = V.anim.r[1] = V.anim.r[2] = 0;
    for (const k of ["R", "L"]) {
      const o = V.handOv[k];
      o.w = 0;
      o.socket = o.socket2 = o.free = o.free2 = o.basis = o.basis2 = null;
      o.t2 = 0;
    }
    V.hideModel = false;
    V.hideLeft = false;
    if (m) P.resetParts(m);
    P.updateAction(dt, realDt);
    if (m) P.updateShotParts(m, dt);

    // ---------------- compose weapon transform ----------------
    const hip = cfg.hip || { p: [0.12, -0.14, -0.3], r: [0, 0, 0] };
    _hip.set(hip.p[0], hip.p[1], hip.p[2]);
    // ADS: sight socket to screen centre
    if (m && m.sockets.sight) {
      const sp = m.sockets.sight.position; // sight sockets are direct children of model root
      const vs = cfg.viewScale || 1;
      _adsP.set(-sp.x * vs, -sp.y * vs, -(cfg.adsDist || 0.22) - sp.z * vs);
    } else _adsP.copy(_hip);
    _pos.copy(_hip).lerp(_adsP, ease(V.adsT));
    let rx = (hip.r[0] || 0) * (1 - V.adsT),
      ry = (hip.r[1] || 0) * (1 - V.adsT),
      rz = (hip.r[2] || 0) * (1 - V.adsT);
    const sp = cfg.sprint || DEFAULT_SPRINT,
      lw = cfg.lower || DEFAULT_LOWER,
      bl = cfg.block || { p: [-0.05, 0.05, 0.02], r: [0.3, -0.2, 0.9] };
    const eS = ease(sprintK),
      eL = ease(V.lowerT),
      eB = ease(V.blockT),
      eP = ease(V.raiseT);
    _pos.x += sp.p[0] * eS + lw.p[0] * eL + bl.p[0] * eB + 0.02 * eP;
    _pos.y += sp.p[1] * eS + lw.p[1] * eL + bl.p[1] * eB - 0.3 * eP;
    _pos.z += sp.p[2] * eS + lw.p[2] * eL + bl.p[2] * eB;
    rx += sp.r[0] * eS + lw.r[0] * eL + bl.r[0] * eB - 0.6 * eP;
    ry += sp.r[1] * eS + lw.r[1] * eL + bl.r[1] * eB;
    rz += sp.r[2] * eS + lw.r[2] * eL + bl.r[2] * eB;
    // sway/bob/recoil/anim
    const kickK = 1 - 0.45 * V.adsT;
    _pos.x += bobX + S.sx.x + S.recX.x * kickK + V.anim.p[0];
    _pos.y += bobY + idleY + S.sy.x + S.land.x * 0.06 + V.anim.p[1];
    _pos.z += S.recZ.x * kickK + V.anim.p[2];
    rx +=
      bobP +
      idleP +
      S.pitch.x * 0.6 +
      S.recP.x * kickK +
      V.anim.r[0] +
      S.land.x * 0.15;
    ry += bobYaw + idleYaw + S.yaw.x * 0.6 + S.recY.x * kickK + V.anim.r[1];
    rz +=
      bobR +
      S.recR.x * kickK -
      V.strafe * 0.05 * (1 - 0.7 * V.adsT) +
      S.yaw.x * 0.25 +
      V.anim.r[2];
    V.pivot.position.copy(_pos);
    V.pivot.rotation.set(rx, ry, rz, "YXZ");
    // whole rig bob (shoulders follow a little)
    V.root.position.set(bobX * 0.4, bobY * 0.5 + S.land.x * 0.02, 0);
    if (m) m.root.visible = !V.hideModel;

    // minigun barrels etc.
    if (m && m.parts.barrels && cfg.spinBarrels) {
      V.spinAngle += V.spin * dt * 42;
      m.parts.barrels.rotation.z = V.spinAngle;
    }
    if (m && cfg.onFrame) cfg.onFrame(m, dt, V);

    // ---------------- hands ----------------
    V.root.updateMatrixWorld(true);
    let right = null,
      left = null;
    if (m && !V.hideModel && m.sockets.rightHand)
      right = V.socketPose(m.sockets.rightHand, tgtR);
    else if (m && cfg.rightFree)
      right = V.freePose(
        cfg.rightFree.p,
        cfg.rightFree.x,
        cfg.rightFree.y,
        tgtR,
      );
    // handguns are fired one-handed: the left arm rests below the frame and only
    // swings up for the reload / slide rack, so hip fire and iron sights show a single sleeve.
    const oneHanded = !!(m && cfg.oneHanded);
    if (oneHanded && V.raiseT > 0.01)
      left = V.freePose(LEFT_REST.p, LEFT_REST.x, LEFT_REST.y, tgtL); // the raise starts from the rest pose
    else if (m && cfg.leftFree)
      left = V.freePose(cfg.leftFree.p, cfg.leftFree.x, cfg.leftFree.y, tgtL);
    else if (m && m.sockets.leftHand && !V.hideModel && !oneHanded)
      left = V.socketPose(m.sockets.leftHand, tgtL);
    const ovR = resolveOv(V.handOv.R, ovA),
      ovL = resolveOv(V.handOv.L, ovB);
    if (ovR) {
      if (!right || V.handOv.R.w >= 1) {
        right = tgtR;
        right.p.copy(ovR.p);
        right.q.copy(ovR.q);
      } else blendTarget(right, ovR, V.handOv.R.w);
    }
    if (ovL && !left && oneHanded && V.handOv.L.w < 1) {
      // rise from the rest pose below the frame instead of popping in at the socket
      if (V.handOv.L.w >= 0.03) {
        left = V.freePose(LEFT_REST.p, LEFT_REST.x, LEFT_REST.y, tgtL);
        blendTarget(left, ovL, V.handOv.L.w);
      }
    } else if (ovL) {
      if (!left || V.handOv.L.w >= 1) {
        left = tgtL;
        left.p.copy(ovL.p);
        left.q.copy(ovL.q);
      } else blendTarget(left, ovL, V.handOv.L.w);
    }
    // left-arm raise: left arm to the face, right arm drops away
    if (V.raiseT > 0.01) {
      const pp = V.freePose(RAISE_LEFT.p, RAISE_LEFT.x, RAISE_LEFT.y);
      if (!left) {
        left = tgtL;
        left.p.copy(pp.p);
        left.q.copy(pp.q);
      } else {
        left.p.lerp(pp.p, ease(V.raiseT));
        left.q.slerp(pp.q, ease(V.raiseT));
      }
      P.arms.setPose(
        "L",
        V.raiseT > 0.5 ? "relaxed" : cfg.leftPose || "support",
      );
    }
    if (V.hideLeft) left = null;
    // fully lowered: hide arms entirely (holstered)
    if (
      V.lowerT > 0.97 &&
      V.raiseT < 0.02 &&
      !(P.action && P.action.name === "throw")
    ) {
      right = null;
      left = null;
    }
    if (V.raiseT > 0.5) right = null;
    _solveOpt.ads = V.adsT;
    _solveOpt.ext = oneHanded ? 1 : 0;
    _solveOpt.raise = V.raiseT;
    _solveOpt.hintL = cfg.hintL || null;
    _solveOpt.hintR = cfg.hintR || null;
    P.arms.solve(right, left, _solveOpt);
    P.arms.updateHands(realDt);
    P.arms.updateScreen(realDt);

    // ---------------- lighting follows the world (atmosphere dims G.viewLights at night / indoors)
    const amb =
      G.viewLights && G.viewLights.amb ? G.viewLights.amb.intensity : 1.1;
    const lk = G.util.clamp(amb / 1.1, 0.15, 1.4);
    V.fill.intensity = 0.22 * lk;
    V.rim.intensity = 0.3 * lk;
    if (Math.abs((V._envK || 0) - lk) > 0.02) {
      V._envK = lk;
      for (const mt of P.allViewMats())
        if (mt.isMeshStandardMaterial)
          mt.envMapIntensity = lk * (mt.userData.envK || 1);
    }

    // ---------------- effects ----------------
    updateFlash(realDt > 0 ? dt : 0);
    updateShells(dt);
    updateFlames(dt);
    updateSmoke(dt);
    // ADS: view camera FOV (bigger gun, feel of focus)
    const vfov = 58 - 8 * V.adsT * (V.scoped ? 0 : 1);
    // ADS near plane: the eye sits a few cm above the stock comb, so the stock top between the eye and the rear
    // sight filled the bottom half of the sight picture as a flat slab. Pull the view near plane out while
    // aiming (the stock is simply not in the sight picture); the sights are ≥12 cm away.
    const vnear =
      0.01 +
      (cfg.adsNear !== undefined ? cfg.adsNear : 0.075) *
        ease(V.adsT) *
        (V.scoped ? 0 : 1);
    if (
      Math.abs(G.viewCamera.fov - vfov) > 0.01 ||
      Math.abs(G.viewCamera.near - vnear) > 0.0005
    ) {
      G.viewCamera.fov = vfov;
      G.viewCamera.near = vnear;
      G.viewCamera.updateProjectionMatrix();
    }
    // scoped: overlay on, weapon hidden when fully in the scope
    updateScope();
    if (V.scoped && V.adsT > 0.88) V.root.visible = false;
  };

  /** Recoil impulse. k = def.kick scale, ads reduces automatically. */
  V.kick = function (k, def) {
    const S = V.springs;
    k = k || 1;
    // one-handed guns flip at the wrist (grip = pivot): more muzzle climb, less push-back, a hint of roll
    const oneH = !!(V.model && V.model.cfg.oneHanded);
    const one = (def && !def.twoHanded) || oneH ? 1.3 : 1;
    S.recZ.v += (oneH ? 0.42 : 0.55) * k;
    S.recP.v += 2.2 * k * one;
    if (oneH) S.recR.v -= 0.6 * k;
    S.recR.v += (Math.random() - 0.5) * 2.4 * k;
    S.recY.v += (Math.random() - 0.5) * 1.2 * k;
    S.recX.v += (Math.random() - 0.5) * 0.12 * k;
  };
  V.landImpulse = function (vy) {
    V.springs.land.v -= Math.min(Math.abs(vy || 0), 16) * 0.05;
  };
})();
