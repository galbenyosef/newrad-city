// play-inline-500 01 — three
// Lines 19-367 of readable/play-inline-500.pretty.js (statement-aligned).
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
