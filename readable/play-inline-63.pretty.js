/* src/atmosphere/56_fx_effects.js */
/* =====================================================================
 * ATMOSPHERE / FX — combat & world effects (public G.fx API)
 *   muzzleFlash, impact (per surface), blood (red/green/oil), sparks, dust,
 *   tracer, laserBeam, fire/smoke/steam emitters, splash,
 *   flamer stream, shell ejection helper, electric arcs.
 * All effects build on the pooled particle systems (A.psAdd / A.psAlpha),
 * the beam batch (A.addBeam), the flash light pool (G.fx.flash) and decals.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !G.atmos || !G.atmos._) return;
  const A = G.atmos._,
    FX = G.fx,
    FR = A.FR;
  const rr = A.rr;
  const _v = new THREE.Vector3(),
    _v2 = new THREE.Vector3(),
    _v3 = new THREE.Vector3(),
    _d = new THREE.Vector3();
  const UP = new THREE.Vector3(0, 1, 0);

  // per-function scratch vectors/colours for the hot paths (automatic weapons call these ~20×/s):
  // no per-shot allocations. Everything downstream (spawn, flash, decal, beams) copies its inputs.
  const _mp = new THREE.Vector3(),
    _md = new THREE.Vector3(),
    _mc = new THREE.Color(),
    _mc2 = new THREE.Color(),
    _white = new THREE.Color(1, 1, 1);
  const _ip = new THREE.Vector3(),
    _in = new THREE.Vector3(),
    _ic = new THREE.Color();
  const _bp = new THREE.Vector3(),
    _bd = new THREE.Vector3();
  function ready() {
    return !!(A.psAdd && A.psAlpha);
  }
  function toV(p, out) {
    return A.v3(p, out || new THREE.Vector3());
  }
  /** normalised direction (default up) */
  function dirOf(d, out) {
    out = A.v3(d || UP, out);
    if (out.lengthSq() < 1e-8) out.set(0, 1, 0);
    return out.normalize();
  }

  // ------------------------------------------------------------------
  // Viewmodel muzzle flash (drawn in G.viewScene so the gun doesn't hide it)
  // ------------------------------------------------------------------
  const VM = { meshes: [], t: 1, dur: 0.05 };
  function initViewFlash() {
    if (!G.viewScene || !A.atlasTex) return;
    const mkQuad = (frame) => {
      const g = new THREE.PlaneGeometry(1, 1);
      const cx = frame % 4,
        cy = 3 - Math.floor(frame / 4);
      const uv = g.attributes.uv;
      for (let i = 0; i < uv.count; i++)
        uv.setXY(i, (cx + uv.getX(i)) / 4, (cy + uv.getY(i)) / 4);
      return g;
    };
    const mat = new THREE.MeshBasicMaterial({
      map: A.atlasTex,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      color: new THREE.Color(4, 2.6, 1.2),
      side: THREE.DoubleSide,
      toneMapped: true,
    });
    mat.name = "atmos_view_flash";
    const grp = new THREE.Group();
    grp.name = "atmos_view_muzzle";
    grp.visible = false;
    const star = new THREE.Mesh(mkQuad(FR.STAR), mat);
    grp.add(star);
    const s1 = new THREE.Mesh(mkQuad(FR.FLAME_SIDE), mat);
    s1.rotation.x = -Math.PI / 2;
    s1.position.z = -0.5;
    grp.add(s1);
    const s2 = new THREE.Mesh(mkQuad(FR.FLAME_SIDE), mat);
    s2.rotation.set(-Math.PI / 2, 0, 0);
    s2.rotation.y = Math.PI / 2;
    s2.position.z = -0.5;
    grp.add(s2);
    grp.renderOrder = 999;
    grp.traverse((o) => {
      o.renderOrder = 999;
      o.frustumCulled = false;
    });
    G.viewScene.add(grp);
    VM.grp = grp;
    VM.mat = mat;
    VM.star = star;
  }
  function viewMuzzle(worldPos, dir, color, size, dur) {
    if (!VM.grp || !G.camera || !G.viewCamera) return;
    const cam = G.camera;
    cam.updateMatrixWorld();
    const local = _v.copy(worldPos);
    cam.worldToLocal(local);
    G.viewCamera.updateMatrixWorld();
    const vp = G.viewCamera.localToWorld(local.clone());
    const dl = _v2
      .copy(dir)
      .transformDirection(cam.matrixWorldInverse)
      .transformDirection(G.viewCamera.matrixWorld);
    VM.grp.position.copy(vp);
    VM.grp.quaternion.setFromUnitVectors(_v3.set(0, 0, -1), dl.normalize());
    VM.grp.scale.setScalar(size);
    VM.star.rotation.z = Math.random() * Math.PI * 2;
    VM.mat.color.copy(A.color(color)).multiplyScalar(4.5);
    VM.t = 0;
    VM.dur = dur;
    VM.grp.visible = true;
  }
  function updateViewFlash(dt, realDt) {
    if (!VM.grp || !VM.grp.visible) return;
    VM.t += realDt;
    const k = 1 - VM.t / VM.dur;
    if (k <= 0) {
      VM.grp.visible = false;
      return;
    }
    VM.mat.opacity = k;
  }

  // ------------------------------------------------------------------
  // Muzzle flash
  // ------------------------------------------------------------------
  const MUZ = {
    pistol: {
      col: 0xffb35a,
      size: 0.32,
      flames: 3,
      smoke: 0.5,
      light: 2.2,
      sparks: 2,
    },
    rifle: {
      col: 0xffa84a,
      size: 0.45,
      flames: 4,
      smoke: 0.8,
      light: 3,
      sparks: 4,
      brake: true,
    },
    hunting: {
      col: 0xffb35a,
      size: 0.5,
      flames: 4,
      smoke: 1.0,
      light: 3,
      sparks: 3,
    },
    sniper: {
      col: 0xffb35a,
      size: 0.55,
      flames: 4,
      smoke: 1.1,
      light: 3.2,
      sparks: 3,
      brake: true,
    },
    smg: {
      col: 0xffc060,
      size: 0.3,
      flames: 3,
      smoke: 0.4,
      light: 2,
      sparks: 2,
    },
    minigun: {
      col: 0xffb050,
      size: 0.38,
      flames: 4,
      smoke: 0.5,
      light: 2.6,
      sparks: 3,
    },
    shotgun: {
      col: 0xff9a40,
      size: 0.6,
      flames: 6,
      smoke: 1.6,
      light: 3.6,
      sparks: 8,
    },
    laser: {
      col: 0xff2a14,
      size: 0.3,
      flames: 0,
      smoke: 0,
      light: 2.2,
      sparks: 0,
      energy: true,
    },
    gyro: {
      col: 0xffb050,
      size: 0.22,
      flames: 1,
      smoke: 1.2,
      light: 1.6,
      sparks: 2,
    },
    recoilless: {
      col: 0xffb060,
      size: 0.7,
      flames: 3,
      smoke: 3.4,
      light: 3.4,
      sparks: 6,
      backblast: true,
    },
    missile: {
      col: 0xffb060,
      size: 0.6,
      flames: 3,
      smoke: 3.0,
      light: 3,
      sparks: 6,
      backblast: true,
    },
    flamer: {
      col: 0xff8a2a,
      size: 0.4,
      flames: 0,
      smoke: 0.4,
      light: 2.5,
      sparks: 0,
      flamer: true,
    },
    bb: {
      col: 0xffffff,
      size: 0.0,
      flames: 0,
      smoke: 0.2,
      light: 0,
      sparks: 0,
    },
  };
  const MUZ_ALIAS = {
    gun_pistol: "pistol",
    "10mm": "pistol",
    magnum: "pistol",
    revolver: "pistol",
    assault: "rifle",
    gun_rifle: "rifle",
    gun_smg: "smg",
    gun_hunting: "hunting",
    gun_shotgun: "shotgun",
    gun_minigun: "minigun",
    gun_laser: "laser",
    gun_gyrojet: "gyro",
    gun_recoilless: "recoilless",
    gun_missile: "missile",
    energy: "laser",
    ballistic: "rifle",
    auto: "smg",
  };

  /**
   * Muzzle flash at world pos, direction dir. kind: pistol|rifle|smg|hunting|sniper|shotgun|minigun|laser|gyro|recoilless|missile|flamer|bb
   * opts: {scale, color, view:true (force first-person flash), noLight}
   */
  FX.muzzleFlash = function (pos, dir, kind, opts) {
    if (!ready() || !pos) return;
    opts = opts || {};
    const P = MUZ[kind] || MUZ[MUZ_ALIAS[kind]] || MUZ.rifle;
    const p = toV(pos, _mp),
      d = dirOf(dir || _md.set(0, 0, -1), _md);
    const sc = opts.scale || 1;
    const col = A.color(opts.color !== undefined ? opts.color : P.col, _mc);
    const nearCam = A.camDist(p) < 2.2;
    const isView = opts.view || nearCam;
    // the weapons module draws its own first-person flash + light; ours is only a fallback
    const ownView = opts.view || G.isStub("weapons");
    // flash core (world)
    // World flash (NPC / third-person guns). HDR is kept moderate: the old core (7) + glow + 4 tongues (5
    // each) stacked to ~30× in the red channel, which the tone map / grade rolled into a pale BLUE-WHITE
    // disc inside a big soft orb — the "coloured dot in the muzzle flash" the player reported. Now: a
    // hot, slightly desaturated star core, a small tight glow, and a directional flame cone along the
    // barrel (side-on, flashes read petal/cone shaped, not as round bokeh balls).
    if (!isView && P.size > 0) {
      const hot = _mc2.copy(col).lerp(_white, P.energy ? 0.2 : 0.35);
      A.psAdd.spawn({
        pos: p,
        size: P.size * 0.85 * sc,
        size1: P.size * 1.15 * sc,
        life: 0.05,
        color: hot,
        intensity: 3.2,
        frame: FR.STAR,
        rot: Math.random() * 6.28,
        fadeIn: 0.004,
        fadeOut: 0.35,
      });
      A.psAdd.spawn({
        pos: p,
        size: P.size * 1.5 * sc,
        life: 0.06,
        color: col,
        intensity: 0.5,
        frame: FR.GLOW,
        fadeIn: 0.004,
        fadeOut: 0.25,
      });
      if (!P.energy) {
        // the flash cone: a short, fat streak along the barrel just in front of the muzzle
        _v.copy(p).addScaledVector(d, P.size * 0.35 * sc);
        A.psAdd.spawn({
          pos: _v,
          vx: d.x * 6,
          vy: d.y * 6,
          vz: d.z * 6,
          size: P.size * 0.55 * sc,
          life: 0.045,
          color: col,
          intensity: 2.4,
          frame: FR.FLAME_SIDE,
          stretch: 0.11 * sc,
          drag: 30,
          fadeIn: 0.004,
          fadeOut: 0.35,
        });
      }
    }
    if (isView && ownView && P.size > 0)
      viewMuzzle(p, d, col, P.size * 0.55 * sc, P.energy ? 0.07 : 0.05);
    // forward flame tongues
    for (let i = 0; i < P.flames; i++) {
      A.coneDir(d, 0.12, _d);
      const sp = rr(9, 16) * sc;
      A.psAdd.spawn({
        pos: p,
        vx: _d.x * sp,
        vy: _d.y * sp,
        vz: _d.z * sp,
        size: P.size * 0.36 * sc,
        life: rr(0.03, 0.055),
        color: col,
        intensity: 2.2,
        frame: FR.FLAME_SIDE,
        stretch: 0.012,
        fadeIn: 0.004,
        fadeOut: 0.3,
      });
    }
    // muzzle-brake side jets
    if (P.brake) {
      _v2.crossVectors(d, UP);
      if (_v2.lengthSq() < 1e-4) _v2.set(1, 0, 0);
      _v2.normalize();
      for (const s of [-1, 1])
        A.psAdd.spawn({
          pos: p,
          vx: _v2.x * s * 7,
          vy: _v2.y * s * 7 + 0.5,
          vz: _v2.z * s * 7,
          size: P.size * 0.3,
          life: 0.04,
          color: col,
          intensity: 4,
          frame: FR.FLAME_SIDE,
          stretch: 0.015,
          fadeIn: 0.01,
        });
    }
    // sparks / unburnt powder
    for (let i = 0; i < P.sparks; i++) {
      A.coneDir(d, 0.35, _d);
      const sp = rr(6, 18);
      A.psAdd.spawn({
        pos: p,
        vx: _d.x * sp,
        vy: _d.y * sp,
        vz: _d.z * sp,
        size: 0.018,
        life: rr(0.08, 0.2),
        color: col,
        intensity: 4,
        frame: FR.STREAK,
        stretch: 0.02,
        grav: 0.4,
      });
    }
    // energy weapons: charged glow + motes
    if (P.energy) {
      A.psAdd.spawn({
        pos: p,
        size: 0.42 * sc,
        size1: 0.18,
        life: 0.12,
        color: col,
        intensity: 1.5,
        frame: FR.GLOW,
        fadeIn: 0.006,
      });
      for (let i = 0; i < 4; i++) {
        A.randDir(_d);
        A.psAdd.spawn({
          pos: p,
          vx: _d.x,
          vy: _d.y + 0.5,
          vz: _d.z,
          size: 0.03,
          life: rr(0.15, 0.35),
          color: col,
          intensity: 4,
          frame: FR.GLOW,
          drag: 3,
        });
      }
    }
    // smoke puff (lingers, drifts with wind)
    if (P.smoke > 0) {
      const n = Math.ceil(P.smoke * 2);
      for (let i = 0; i < n; i++) {
        A.coneDir(d, 0.4, _d);
        const sp = rr(0.6, 2.2) * P.smoke;
        _v.copy(p).addScaledVector(d, isView ? 0.35 : 0.05);
        A.psAlpha.spawn({
          pos: _v,
          vx: _d.x * sp,
          vy: _d.y * sp + 0.25,
          vz: _d.z * sp,
          size: 0.12 * P.smoke,
          size1: rr(0.6, 1.0) * P.smoke,
          life: rr(0.9, 1.8),
          color: 0xb8b4a8,
          alpha: 0.22,
          frame: FR.SMOKE1 + (i % 3),
          drag: 2.5,
          wind: 0.6,
          rotv: rr(-1, 1),
          fadeIn: 0.05,
          fadeOut: 0.3,
        });
      }
    }
    // missile launcher / recoilless rifle backblast
    if (P.backblast) {
      for (let i = 0; i < 10; i++) {
        A.coneDir(_v3.copy(d).negate(), 0.5, _d);
        const sp = rr(3, 9);
        A.psAlpha.spawn({
          pos: p,
          vx: _d.x * sp,
          vy: _d.y * sp + 0.5,
          vz: _d.z * sp,
          size: 0.4,
          size1: rr(1.5, 2.6),
          life: rr(1.2, 2.2),
          color: 0xa8a49a,
          alpha: 0.35,
          frame: FR.SMOKE1 + (i % 3),
          drag: 2,
          wind: 0.5,
          rotv: rr(-1, 1),
        });
      }
    }
    if (P.flamer) FX.flamer(p, d, { scale: sc });
    if (!opts.noLight && P.light > 0) {
      FX.flash(p, col, P.light * sc, P.energy ? 0.09 : 0.06, {
        range: 8 + P.light * 2,
      });
      if (isView && ownView && A.viewFlash)
        A.viewFlash(col, P.light * 0.6, 0.06);
    }
  };

  /** Flamethrower stream burst from pos along dir (call every frame while firing). */
  FX.flamer = function (pos, dir, opts) {
    if (!ready()) return;
    opts = opts || {};
    const p = toV(pos),
      d = dirOf(dir, _v3.set(0, 0, -1)).clone();
    const sc = opts.scale || 1;
    for (let i = 0; i < 6; i++) {
      A.coneDir(d, 0.09, _d);
      const sp = rr(13, 18);
      A.psAdd.spawn({
        pos: p,
        vx: _d.x * sp,
        vy: _d.y * sp,
        vz: _d.z * sp,
        size: 0.15 * sc,
        size1: rr(1.2, 2.2) * sc,
        life: rr(0.45, 0.7),
        color: 0xffe0a0,
        intensity: 3.5,
        color1: 0xff3a08,
        intensity1: 1.2,
        frame: FR.FLAME,
        rot: rr(0, 6.28),
        rotv: rr(-3, 3),
        drag: 2.2,
        grav: -0.35,
        fadeIn: 0.05,
        fadeOut: 0.5,
      });
    }
    if (Math.random() < 0.4)
      A.psAlpha.spawn({
        pos: p.clone().addScaledVector(d, 6),
        vx: d.x * 4,
        vy: 1.5,
        vz: d.z * 4,
        size: 0.6,
        size1: 2.8,
        life: 1.6,
        color: 0x2a2622,
        alpha: 0.35,
        frame: FR.SMOKE2,
        drag: 1.4,
        wind: 0.6,
        rotv: rr(-1, 1),
      });
    if (Math.random() < 0.3)
      FX.flash(p.clone().addScaledVector(d, 3), 0xff8a30, 2.5, 0.12, {
        range: 14,
        flicker: 0.4,
      });
  };

  // ------------------------------------------------------------------
  // Bullet / energy impacts
  // ------------------------------------------------------------------
  const SURF = {
    concrete: { dust: 0xb0a898, chip: 0x8a867c, sparks: 0.25, decal: "bullet" },
    stone: { dust: 0xb8b0a0, chip: 0x9a9284, sparks: 0.3, decal: "bullet" },
    brick: { dust: 0xa87858, chip: 0x8a4a36, sparks: 0.15, decal: "bullet" },
    asphalt: { dust: 0x8c8880, chip: 0x3a3836, sparks: 0.2, decal: "bullet" },
    rubble: { dust: 0xa8a090, chip: 0x7a7468, sparks: 0.15, decal: "bullet" },
    metal: {
      dust: 0x807c78,
      chip: 0x5a5854,
      sparks: 1,
      decal: "bullet_metal",
      metal: true,
    },
    wood: {
      dust: 0x9a7e5a,
      chip: 0x6e5030,
      sparks: 0,
      decal: "bullet_wood",
      splinter: true,
    },
    dirt: {
      dust: 0x8a7658,
      chip: 0x4a3a26,
      sparks: 0,
      decal: "dirt",
      soft: true,
    },
    grass: {
      dust: 0x8a8060,
      chip: 0x4a4a26,
      sparks: 0,
      decal: null,
      soft: true,
      grass: true,
    },
    sand: {
      dust: 0xb8a47c,
      chip: 0x8a7a58,
      sparks: 0,
      decal: null,
      soft: true,
    },
    carpet: { dust: 0x9a8c80, chip: 0x6a5a50, sparks: 0, decal: "bullet" },
    glass: {
      dust: 0xc8d0d0,
      chip: 0xb0c4c8,
      sparks: 0.2,
      decal: "crack",
      glass: true,
    },
    water: { water: true },
    flesh: { flesh: true },
  };
  /**
   * Impact effect. surface: concrete|metal|wood|dirt|grass|water|glass|carpet|rubble|brick|asphalt|flesh.
   * opts: {kind:'bullet'|'laser'|'shotgun'|'melee', scale, decal:false, color}
   */
  FX.impact = function (pos, normal, surface, opts) {
    if (!ready() || !pos) return;
    opts = opts || {};
    const p = toV(pos, _ip),
      n = dirOf(normal, _in);
    const kind = opts.kind || "bullet";
    const sc = opts.scale || (kind === "shotgun" ? 0.6 : 1);
    const S = SURF[surface] || SURF.concrete;
    if (S.flesh) {
      FX.blood(p, n, sc, opts.color);
      return;
    }
    if (S.water) {
      FX.splash(p, sc * (kind === "melee" ? 0.5 : 1));
      return;
    }
    // energy impacts
    if (kind === "laser") {
      const col = A.color(
        opts.color !== undefined ? opts.color : 0xff3018,
        _ic,
      );
      A.psAdd.spawn({
        pos: p,
        size: 0.6 * sc,
        size1: 0.2,
        life: 0.18,
        color: col,
        intensity: 5,
        frame: FR.GLOW,
        fadeIn: 0.01,
      });
      A.psAdd.spawn({
        pos: p,
        size: 0.45 * sc,
        size1: 0.1,
        life: 0.08,
        color: 0xffffff,
        intensity: 4,
        frame: FR.STAR,
        fadeIn: 0.01,
      });
      const cnt = 7;
      for (let i = 0; i < cnt; i++) {
        A.coneDir(n, 1.1, _d);
        const sp = rr(2, 7);
        A.psAdd.spawn({
          pos: p,
          vx: _d.x * sp,
          vy: _d.y * sp,
          vz: _d.z * sp,
          size: 0.025,
          life: rr(0.2, 0.5),
          color: col,
          intensity: 5,
          frame: kind === "plasma" ? FR.GLOW : FR.STREAK,
          stretch: kind === "plasma" ? 0 : 0.03,
          grav: kind === "plasma" ? 0.8 : 0.6,
          bounce: true,
          drag: 1,
        });
      }
      A.psAlpha.spawn({
        pos: p,
        vx: n.x * 0.4,
        vy: n.y * 0.4 + 0.3,
        vz: n.z * 0.4,
        size: 0.12,
        size1: 0.6,
        life: 1.1,
        color: 0x3a3632,
        alpha: 0.3,
        frame: FR.SMOKE3,
        drag: 1.5,
        wind: 0.5,
      });
      FX.flash(p, col, 1.5, 0.1, { range: 6 });
      if (opts.decal !== false) FX.decal(p, n, "laser", { size: 0.22 });
      return;
    }
    // dust puff
    const dustN = S.soft ? 3 : 2;
    for (let i = 0; i < dustN; i++) {
      A.coneDir(n, 0.6, _d);
      const sp = rr(0.5, 1.8);
      A.psAlpha.spawn({
        pos: p,
        vx: _d.x * sp,
        vy: _d.y * sp,
        vz: _d.z * sp,
        size: 0.12 * sc,
        size1: rr(0.5, 0.9) * sc,
        life: rr(0.7, 1.4),
        color: S.dust,
        alpha: S.soft ? 0.5 : 0.4,
        frame: FR.DUST,
        drag: 3,
        wind: 0.4,
        grav: -0.02,
        rotv: rr(-1, 1),
        fadeIn: 0.03,
        fadeOut: 0.35,
      });
    }
    // directional JET: a fast, tight burst of pulverised material shot out along the normal
    // that brakes hard and hangs — reads as the hit even at 40 m (the slow puffs above are the haze)
    const jetN = S.soft ? 3 : 2;
    for (let i = 0; i < jetN; i++) {
      A.coneDir(n, S.soft ? 0.28 : 0.2, _d);
      const sp = rr(5, 9.5);
      A.psAlpha.spawn({
        pos: p,
        vx: _d.x * sp,
        vy: _d.y * sp + (S.soft ? 1.2 : 0),
        vz: _d.z * sp,
        size: 0.05 * sc,
        size1: rr(0.3, 0.5) * sc,
        life: rr(0.35, 0.65),
        color: S.dust,
        alpha: S.soft ? 0.62 : 0.5,
        frame: FR.DUST,
        drag: 7.5,
        wind: 0.3,
        grav: S.soft ? 0.25 : 0,
        rotv: rr(-2, 2),
        fadeIn: 0.005,
        fadeOut: 0.55,
        lit: 1,
      });
    }
    // chips / splinters / dirt clods
    const chipN = S.soft ? 9 : S.splinter ? 7 : 6;
    for (let i = 0; i < chipN; i++) {
      A.coneDir(n, S.soft ? 0.5 : 0.9, _d);
      const sp = rr(2.5, S.soft ? 6 : 8);
      A.psAlpha.spawn({
        pos: p,
        vx: _d.x * sp,
        vy: _d.y * sp,
        vz: _d.z * sp,
        size: rr(0.02, 0.05) * sc,
        life: rr(0.5, 1.1),
        color: S.chip,
        alpha: 1,
        frame: S.splinter ? FR.STREAK : FR.DEBRIS,
        stretch: S.splinter ? 0.01 : 0,
        grav: 1.1,
        bounce: true,
        rotv: rr(-12, 12),
        fadeIn: 0.001,
        fadeOut: 0.8,
        lit: 1,
      });
    }
    if (S.grass)
      for (let i = 0; i < 5; i++) {
        A.coneDir(n, 0.6, _d);
        const sp = rr(1.5, 4);
        A.psAlpha.spawn({
          pos: p,
          vx: _d.x * sp,
          vy: _d.y * sp,
          vz: _d.z * sp,
          size: 0.05,
          life: rr(0.8, 1.4),
          color: 0x6a6a38,
          frame: FR.FLAKE,
          grav: 0.35,
          drag: 1.5,
          rotv: rr(-8, 8),
          bounce: true,
        });
      }
    // sparks
    const sparkN = Math.round(
      (S.metal ? 10 : 4) * S.sparks * (0.6 + Math.random() * 0.8),
    );
    for (let i = 0; i < sparkN; i++) {
      A.coneDir(n, 0.8, _d);
      const sp = rr(4, S.metal ? 14 : 9);
      A.psAdd.spawn({
        pos: p,
        vx: _d.x * sp,
        vy: _d.y * sp,
        vz: _d.z * sp,
        size: 0.02,
        life: rr(0.15, S.metal ? 0.6 : 0.3),
        color: 0xffb860,
        intensity: 6,
        color1: 0xff5010,
        intensity1: 3,
        frame: FR.STREAK,
        stretch: 0.025,
        grav: 1,
        bounce: true,
        drag: 0.8,
      });
    }
    if (S.metal) {
      A.psAdd.spawn({
        pos: p,
        size: 0.25 * sc,
        life: 0.05,
        color: 0xffd090,
        intensity: 5,
        frame: FR.STAR,
        fadeIn: 0.01,
      });
      if (Math.random() < 0.5) FX.flash(p, 0xffb060, 1.2, 0.06, { range: 5 });
    }
    if (S.glass)
      for (let i = 0; i < 8; i++) {
        A.coneDir(n, 0.9, _d);
        const sp = rr(2, 6);
        A.psAdd.spawn({
          pos: p,
          vx: _d.x * sp,
          vy: _d.y * sp,
          vz: _d.z * sp,
          size: 0.03,
          life: rr(0.4, 0.9),
          color: 0xd8f0ff,
          intensity: 1.2,
          frame: FR.FLAKE,
          grav: 1,
          bounce: true,
          rotv: rr(-15, 15),
          flicker: true,
        });
      }
    if (opts.decal !== false && S.decal)
      FX.decal(p, n, S.decal, kind === "shotgun" ? { size: 0.11 } : undefined);
  };

  // ------------------------------------------------------------------
  // Blood & gore
  // ------------------------------------------------------------------
  const BLOOD = {
    red: { c: 0x6a0a06, mist: 0x5a0a08, decal: "blood" },
    green: { c: 0x4a7a12, mist: 0x5a8a1a, decal: "blood_green" },
    violet: { c: 0x4a1a4a, mist: 0x3a1a3a, decal: "blood" }, // Brutes, Colossus, some creatures
    blue: { c: 0x1e3c86, mist: 0x2a4a8a, decal: "oil" }, // Shellbacks (copper-based blood)
    shellback: { c: 0x1e3c86, mist: 0x2a4a8a, decal: "oil" },
    glowing: { c: 0x6aff3a, mist: 0x6aff3a, decal: "goo", glow: true },
    oil: { c: 0x0e0c0a, mist: 0x2a2826, decal: "oil", robot: true },
    robot: { c: 0x0e0c0a, mist: 0x2a2826, decal: "oil", robot: true },
  };
  const _down = new THREE.Vector3(0, -1, 0);
  /** Blood spray at pos travelling along dir. amount ~1 per hit (2–4 for dismemberment). color: red|green|violet|blue|oil|glowing|hex */
  FX.blood = function (pos, dir, amount, color) {
    if (!ready() || !pos) return;
    amount = amount === undefined ? 1 : Math.max(0.2, Math.min(5, amount));
    let B = BLOOD.red;
    if (typeof color === "string" && BLOOD[color]) B = BLOOD[color];
    else if (
      color !== undefined &&
      color !== null &&
      typeof color !== "string"
    ) {
      const c = A.color(color);
      B = {
        c: c.getHex(),
        mist: c.getHex(),
        decal: c.g > c.r ? "blood_green" : "blood",
      };
    }
    const p = toV(pos, _bp),
      d = dirOf(dir || _bd.set(0, 0, 1), _bd);
    // mist
    for (let i = 0; i < 2; i++) {
      A.coneDir(d, 0.7, _d);
      const sp = rr(0.5, 2);
      A.psAlpha.spawn({
        pos: p,
        vx: _d.x * sp,
        vy: _d.y * sp + 0.2,
        vz: _d.z * sp,
        size: 0.15 * amount,
        size1: rr(0.5, 0.9) * Math.sqrt(amount),
        life: rr(0.35, 0.7),
        color: B.mist,
        alpha: 0.55,
        frame: FR.DUST,
        drag: 4,
        fadeIn: 0.02,
      });
    }
    // droplets
    const n = Math.round(7 * amount);
    for (let i = 0; i < n; i++) {
      A.coneDir(d, 0.55, _d);
      const sp = rr(1.5, 5.5);
      if (B.glow)
        A.psAdd.spawn({
          pos: p,
          vx: _d.x * sp,
          vy: _d.y * sp + 1,
          vz: _d.z * sp,
          size: rr(0.03, 0.07),
          life: rr(0.6, 1.2),
          color: B.c,
          intensity: 2.5,
          frame: FR.DROP,
          grav: 1,
          stick: true,
          stretch: 0.03,
        });
      else
        A.psAlpha.spawn({
          pos: p,
          vx: _d.x * sp,
          vy: _d.y * sp + 1,
          vz: _d.z * sp,
          size: rr(0.03, 0.07),
          life: rr(0.6, 1.2),
          color: B.c,
          alpha: 1,
          frame: FR.DROP,
          grav: 1,
          stick: true,
          stretch: 0.03,
          lit: 0.7,
          fadeOut: 0.8,
        });
    }
    if (B.robot) {
      FX.sparks(p, { count: 6 + ((4 * amount) | 0), dir: d });
      A.psAlpha.spawn({
        pos: p,
        vy: 0.8,
        size: 0.3,
        size1: 1.4,
        life: 1.6,
        color: 0x2a2826,
        alpha: 0.5,
        frame: FR.SMOKE2,
        wind: 0.5,
        drag: 1,
      });
    }
    // decals: splatter on the wall behind and a pool on the ground
    try {
      const hitW = G.world.raycast(p, d, 2.6, {
        ignoreTags: ["actor", "interactable_self"],
      });
      if (hitW)
        FX.decal(hitW.point, hitW.normal, B.decal, {
          size: rr(0.5, 0.9) * Math.sqrt(amount),
        });
      _v.copy(p).addScaledVector(d, rr(0.3, 1.2));
      _v.y = p.y + 0.2;
      const hitG = G.world.raycast(_v, _down, 4, {
        ignoreTags: ["actor", "interactable_self"],
      });
      if (hitG && hitG.normal.y > 0.5)
        FX.decal(
          hitG.point,
          hitG.normal,
          amount > 1.5 && Math.random() < 0.4
            ? B.decal === "blood"
              ? "blood_smear"
              : B.decal
            : B.decal,
          { size: rr(0.5, 1.0) * Math.sqrt(amount) },
        );
    } catch (e) {
      /* ignore */
    }
  };
  /** Gibs (chunks) for dismemberment/explosions. */
  FX.gibs = function (pos, count, color) {
    if (!ready() || !pos) return;
    const p = toV(pos);
    const B = (typeof color === "string" && BLOOD[color]) || BLOOD.red;
    for (let i = 0; i < (count || 8); i++) {
      A.randDir(_d);
      _d.y = Math.abs(_d.y) + 0.4;
      const sp = rr(3, 8);
      A.psAlpha.spawn({
        pos: p,
        vx: _d.x * sp,
        vy: _d.y * sp,
        vz: _d.z * sp,
        size: rr(0.08, 0.18),
        life: rr(2, 4),
        color: B.robot ? 0x3a3834 : 0x5a1410,
        frame: FR.DEBRIS,
        grav: 1.1,
        bounce: true,
        rotv: rr(-10, 10),
        fadeOut: 0.85,
        lit: 1,
      });
    }
    FX.blood(p, UP, 3, color);
  };

  // ------------------------------------------------------------------
  // Small generic effects
  // ------------------------------------------------------------------
  /** Spark shower. opts: {count, color, dir, speed, spread} */
  FX.sparks = function (pos, opts) {
    if (!ready() || !pos) return;
    opts = opts || {};
    const p = toV(pos),
      d = dirOf(opts.dir || UP, new THREE.Vector3());
    const col = opts.color !== undefined ? opts.color : 0xffc070;
    const n = opts.count || 14,
      spd = opts.speed || 7;
    for (let i = 0; i < n; i++) {
      A.coneDir(d, opts.spread || 1.2, _d);
      const sp = rr(0.4, 1.2) * spd;
      A.psAdd.spawn({
        pos: p,
        vx: _d.x * sp,
        vy: _d.y * sp,
        vz: _d.z * sp,
        size: 0.022,
        life: rr(0.25, 0.8),
        color: col,
        intensity: 6,
        color1: 0xff4a10,
        intensity1: 2,
        frame: FR.STREAK,
        stretch: 0.03,
        grav: 1,
        bounce: true,
        drag: 0.6,
      });
    }
    A.psAdd.spawn({
      pos: p,
      size: 0.5,
      life: 0.06,
      color: col,
      intensity: 4,
      frame: FR.STAR,
      fadeIn: 0.01,
    });
    if (opts.light !== false) FX.flash(p, col, 1.4, 0.08, { range: 6 });
  };
  /** Electric arc crackle (robots, broken power lines). */
  FX.arc = function (pos, opts) {
    if (!ready() || !pos) return;
    opts = opts || {};
    const p = toV(pos),
      col = opts.color !== undefined ? opts.color : 0x9ad8ff;
    for (let i = 0; i < (opts.count || 3); i++) {
      A.randDir(_d);
      A.psAdd.spawn({
        pos: p.clone().addScaledVector(_d, 0.2),
        size: rr(0.3, 0.7) * (opts.scale || 1),
        life: rr(0.05, 0.12),
        color: col,
        intensity: 5,
        frame: FR.ARC,
        rot: rr(0, 6.28),
        fadeIn: 0.01,
      });
    }
    A.psAdd.spawn({
      pos: p,
      size: 1.2 * (opts.scale || 1),
      life: 0.1,
      color: col,
      intensity: 1.5,
      frame: FR.GLOW,
      fadeIn: 0.01,
    });
    if (Math.random() < 0.5) FX.flash(p, col, 1.2, 0.07, { range: 6 });
  };
  /** Dust puff (footfalls of big creatures, falling debris, landing). opts: {scale, color, count} */
  FX.dust = function (pos, opts) {
    if (!ready() || !pos) return;
    opts = typeof opts === "number" ? { scale: opts } : opts || {};
    const p = toV(pos),
      sc = opts.scale || 1;
    const col = opts.color !== undefined ? opts.color : 0xa89c84;
    const n = opts.count || 6;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rr(-0.3, 0.3),
        sp = rr(0.8, 2.2) * sc;
      A.psAlpha.spawn({
        x: p.x,
        y: p.y + 0.1,
        z: p.z,
        vx: Math.cos(a) * sp,
        vy: rr(0.2, 0.8) * sc,
        vz: Math.sin(a) * sp,
        size: 0.3 * sc,
        size1: rr(1.2, 2.0) * sc,
        life: rr(1.2, 2.2),
        color: col,
        alpha: 0.4,
        frame: FR.DUST,
        drag: 2.2,
        wind: 0.5,
        rotv: rr(-0.8, 0.8),
        fadeIn: 0.05,
      });
    }
  };
  /** Water splash (bullets, bodies, grenades in water). */
  FX.splash = function (pos, scale) {
    if (!ready() || !pos) return;
    const p = toV(pos),
      sc = scale || 1;
    const wl =
      G.world && G.world.waterLevel !== undefined ? G.world.waterLevel : -1.2;
    if (Math.abs(p.y - wl) < 1.5 && G.LAYOUT && G.LAYOUT.isWater(p.x, p.z))
      p.y = wl + 0.02;
    for (let i = 0; i < Math.round(12 * sc); i++) {
      const a = Math.random() * Math.PI * 2,
        r = rr(0.3, 1.6) * sc;
      A.psAlpha.spawn({
        pos: p,
        vx: Math.cos(a) * r,
        vy: rr(2.5, 5.5) * Math.sqrt(sc),
        vz: Math.sin(a) * r,
        size: rr(0.04, 0.09) * sc,
        life: rr(0.5, 1.0),
        color: 0xb8c0b0,
        alpha: 0.85,
        frame: FR.DROP,
        grav: 1,
        stretch: 0.04,
        lit: 1,
        fadeOut: 0.7,
      });
    }
    A.psAlpha.spawn({
      pos: p,
      vy: 1.2 * sc,
      size: 0.3 * sc,
      size1: 1.4 * sc,
      life: 0.8,
      color: 0xc8d0c0,
      alpha: 0.45,
      frame: FR.DUST,
      drag: 3,
    });
    A.psAlpha.spawn({
      x: p.x,
      y: p.y + 0.03,
      z: p.z,
      size: 0.4 * sc,
      size1: 2.2 * sc,
      life: 0.9,
      color: 0xd8e0d0,
      alpha: 0.6,
      frame: FR.SPLASH,
      rot: 0,
      fadeIn: 0.02,
    });
  };
  /** Ejected shell casing (brass) from the viewmodel/world; dir = ejection direction. */
  FX.shell = function (pos, dir, opts) {
    if (!ready() || !pos) return;
    opts = opts || {};
    const p = toV(pos),
      d = dirOf(dir || { x: 1, y: 0.6, z: 0 }, new THREE.Vector3());
    const sp = rr(2, 3.5);
    A.psAlpha.spawn({
      pos: p,
      vx: d.x * sp,
      vy: d.y * sp + 1.5,
      vz: d.z * sp,
      size: opts.shotgun ? 0.05 : 0.03,
      life: 1.6,
      color: opts.shotgun ? 0xa02010 : 0xc8a040,
      alpha: 1,
      frame: FR.STREAK,
      stretch: 0.004,
      grav: 1.2,
      bounce: true,
      rotv: rr(-20, 20),
      lit: 1,
      fadeOut: 0.85,
    });
  };

  // ------------------------------------------------------------------
  // Tracers, laser beams
  // ------------------------------------------------------------------
  /** Bullet tracer streaking from → to. color default warm yellow. opts: {speed, width, length} */
  FX.tracer = function (from, to, color, opts) {
    if (!A.addBeam || !from || !to) return;
    opts = opts || {};
    const a = toV(from),
      b = toV(to);
    const dist = a.distanceTo(b);
    if (dist < 0.5) return;
    const dir = b.clone().sub(a).divideScalar(dist);
    const speed = opts.speed || 380,
      len = opts.length || Math.min(9, 2 + dist * 0.18);
    const col = color !== undefined ? color : 0xffd890;
    // start a little ahead of the muzzle so it doesn't smear across the screen
    const start = Math.min(1.2, dist * 0.2);
    A.addBeam({
      a,
      b: a.clone(),
      width: opts.width || 0.022,
      color: col,
      intensity: opts.intensity || 4,
      life: (dist - start) / speed + len / speed + 0.02,
      kind: "tracer",
      fade: 0.05,
      update(bm) {
        const head = Math.min(dist, start + bm.age * speed),
          tail = Math.max(start, head - len);
        bm.b.copy(a).addScaledVector(dir, head);
        bm.a.copy(a).addScaledVector(dir, tail);
        if (tail >= dist - 0.01) return false;
        return true;
      },
    });
  };
  /** Laser beam (AER9 red by default). color: 'red'|'green'|'blue'|hex. opts: {width, life} */
  FX.laserBeam = function (from, to, color, opts) {
    if (!A.addBeam || !from || !to) return;
    opts = opts || {};
    const a = toV(from),
      b = toV(to);
    const col = A.color(color || "red");
    A.addBeam({
      a,
      b,
      width: opts.width || 0.045,
      color: col,
      intensity: 5,
      life: opts.life || 0.24,
      kind: "laser",
      fade: 0.6,
    });
    A.addBeam({
      a,
      b,
      width: (opts.width || 0.045) * 4,
      color: col,
      intensity: 0.6,
      life: (opts.life || 0.24) * 0.8,
      kind: "laser",
      fade: 0.8,
    });
    if (ready()) {
      A.psAdd.spawn({
        pos: b,
        size: 0.5,
        size1: 0.15,
        life: 0.2,
        color: col,
        intensity: 4,
        frame: FR.GLOW,
        fadeIn: 0.01,
      });
      A.psAdd.spawn({
        pos: a,
        size: 0.25,
        life: 0.08,
        color: col,
        intensity: 4,
        frame: FR.GLOW,
        fadeIn: 0.01,
      });
      // a few motes drifting off the beam
      for (let i = 0; i < 5; i++) {
        _v.lerpVectors(a, b, Math.random());
        A.psAdd.spawn({
          pos: _v,
          vx: rr(-0.3, 0.3),
          vy: rr(0, 0.5),
          vz: rr(-0.3, 0.3),
          size: 0.03,
          life: rr(0.2, 0.5),
          color: col,
          intensity: 3,
          frame: FR.GLOW,
        });
      }
    }
  };
  const boltHandles = [];
  function updateBolts(dt) {
    for (let i = boltHandles.length - 1; i >= 0; i--) {
      const b = boltHandles[i];
      b.h.age += dt;
      if (!b.h.alive || b.h.age > b.h.life) {
        boltHandles.splice(i, 1);
        continue;
      }
      if (dt > 0) b.tick();
    }
  }

  // ------------------------------------------------------------------
  // Continuous emitters: fire, smoke, steam
  // ------------------------------------------------------------------
  let fireSounds = 0;
  /**
   * Fire (burning barrel, car fire, campfire, burning debris). Returns handle {stop(), setPos(), setScale(), pos, glow}.
   * opts: {smoke=true, glow=true, sound=true, embers=true, light=false (steal a flash light while close), lod}
   */
  FX.fire = function (pos, scale, opts) {
    opts = opts || {};
    if (!A.addEmitter) return null;
    const s0 = scale || 1;
    // procedural flame volume (57_fx_flames.js): the body of the fire. The atlas sprites below are
    // only small licks / sparks for motion on top of it (or the whole fire if the card system is off).
    const card =
      A.flameCard && opts.card !== false
        ? A.flameCard(pos, s0, { lod: Math.min(opts.lod || 160, 220) })
        : null;
    // halo: with a flame card it is only the soft light around the fire (a big bright disc washed the
    // flame's lower half out to a pale blob)
    const glow =
      opts.glow !== false && FX.glowSprite
        ? FX.glowSprite(
            toV(pos).add(new THREE.Vector3(0, 0.6 * s0, 0)),
            0xff7a28,
            (card ? 1.9 : 2.3) * s0,
            { intensity: card ? 0.55 : 1.0, dayFactor: 0.3, flicker: 0.35 },
          )
        : null;
    let snd = null,
      lightT = 0,
      lightH = null;
    const e = A.addEmitter({
      pos: toV(pos),
      rate: (card ? 7 : 16) * Math.sqrt(s0),
      lod: opts.lod || 160,
      scale: s0,
      spawn(p, em) {
        const s = em.scale;
        const a = Math.random() * Math.PI * 2,
          r = Math.random() * 0.35 * s;
        if (card)
          A.psAdd.spawn({
            x: p.x + Math.cos(a) * r,
            y: p.y + 0.25 * s,
            z: p.z + Math.sin(a) * r,
            vx: rr(-0.25, 0.25),
            vy: rr(1.6, 3.0) * Math.sqrt(s),
            vz: rr(-0.25, 0.25),
            size: rr(0.18, 0.32) * s,
            size1: 0.05 * s,
            life: rr(0.3, 0.55),
            color: 0xffb060,
            intensity: 1.5,
            color1: 0x901404,
            intensity1: 0.6,
            frame: FR.FLAME,
            rot: rr(-0.3, 0.3),
            rotv: rr(-1.5, 1.5),
            wind: 0.5,
            fadeIn: 0.15,
            fadeOut: 0.5,
          });
        else
          A.psAdd.spawn({
            x: p.x + Math.cos(a) * r,
            y: p.y + 0.05,
            z: p.z + Math.sin(a) * r,
            vx: rr(-0.2, 0.2),
            vy: rr(1.2, 2.4) * Math.sqrt(s),
            vz: rr(-0.2, 0.2),
            size: rr(0.45, 0.75) * s,
            size1: 0.12 * s,
            life: rr(0.55, 0.95),
            color: 0xffd890,
            intensity: 3.2,
            color1: 0xc01e04,
            intensity1: 1.2,
            frame: FR.FLAME,
            rot: rr(-0.3, 0.3),
            rotv: rr(-1, 1),
            wind: 0.4,
            fadeIn: 0.12,
            fadeOut: 0.45,
          });
        if (opts.embers !== false && Math.random() < 0.18)
          A.psAdd.spawn({
            x: p.x + rr(-0.2, 0.2) * s,
            y: p.y + 0.4 * s,
            z: p.z + rr(-0.2, 0.2) * s,
            vx: rr(-0.6, 0.6),
            vy: rr(1.5, 3.5),
            vz: rr(-0.6, 0.6),
            size: 0.035,
            life: rr(1, 2.5),
            color: 0xffa040,
            intensity: 5,
            frame: FR.GLOW,
            drag: 0.6,
            wind: 0.8,
            flicker: true,
          });
        if (opts.smoke !== false && Math.random() < 0.22)
          A.psAlpha.spawn({
            x: p.x,
            y: p.y + 0.9 * s,
            z: p.z,
            vx: rr(-0.2, 0.2),
            vy: rr(1.0, 1.8) * Math.sqrt(s),
            vz: rr(-0.2, 0.2),
            size: 0.5 * s,
            size1: rr(2.5, 4) * s,
            life: rr(3, 5.5),
            color: 0x2c2824,
            alpha: 0.42,
            frame: FR.SMOKE1 + ((Math.random() * 3) | 0),
            drag: 0.35,
            wind: 0.35,
            rotv: rr(-0.5, 0.5),
            fadeIn: 0.1,
            fadeOut: 0.5,
          });
      },
      onUpdate(dt, em) {
        if (glow)
          glow.position.set(em.pos.x, em.pos.y + 0.6 * em.scale, em.pos.z);
        if (card) {
          card.pos.copy(em.pos);
          card.scale = em.scale;
          card.vis = !em.paused;
        }
        const d = A.camDist(em.pos);
        // positional crackle for the nearest fires only
        if (opts.sound !== false && G.worldRunning()) {
          if (!snd && d < 20 && fireSounds < 3) {
            try {
              snd = G.sfx.play("fire_loop", {
                pos: em.pos,
                loop: true,
                volume: Math.min(1, 0.4 + 0.3 * em.scale),
              });
            } catch (er) {
              snd = null;
            }
            if (snd) fireSounds++;
            else snd = { stop() {}, fake: true };
          } else if (snd && d > 28) {
            try {
              snd.stop && snd.stop();
            } catch (er) {
              /* ignore */
            }
            if (!snd.fake) fireSounds--;
            snd = null;
          }
        }
        // optional real light: lowest priority (combat flashes always win the slot), and it keeps
        // refreshing ITS OWN slot rather than grabbing a new one every tick
        if (opts.light && d < 35) {
          lightT -= dt;
          if (lightT <= 0) {
            lightT = 0.25;
            const lp = A.tmpV3.copy(em.pos).setY(em.pos.y + 1);
            if (!(lightH && lightH.alive() && lightH.extend(0.3, lp)))
              lightH = FX.flash(lp, 0xff7a30, 1.4 * em.scale, 0.3, {
                range: 9 * em.scale,
                flicker: 0.5,
                curve: "hold",
                priority: 0,
              });
          }
        }
      },
    });
    e.glow = glow;
    if (glow && opts.light) glow.noLight = true; // it already has its own flickering light
    e.card = card;
    e.onStop = () => {
      if (card) card.remove();
      if (lightH) {
        lightH.stop();
        lightH = null;
      }
      if (glow) glow.dispose();
      if (snd) {
        try {
          snd.stop && snd.stop();
        } catch (er) {
          /* ignore */
        }
        if (!snd.fake) fireSounds--;
        snd = null;
      }
    };
    return e;
  };
  /**
   * Smoke column (burning cars, chimneys, smouldering ruins). opts: {color, alpha, rate, rise, lod, dark}
   * Returns handle {stop(), setPos(), setScale()}.
   */
  FX.smoke = function (pos, scale, opts) {
    opts = opts || {};
    if (!A.addEmitter) return null;
    const s0 = scale || 1;
    const col =
      opts.color !== undefined
        ? opts.color
        : opts.dark === false
          ? 0x9a968c
          : 0x2e2a26;
    return A.addEmitter({
      pos: toV(pos),
      rate: opts.rate || 3.2 * Math.sqrt(s0),
      lod: opts.lod || 320,
      scale: s0,
      spawn(p, em) {
        const s = em.scale;
        A.psAlpha.spawn({
          x: p.x + rr(-0.3, 0.3) * s,
          y: p.y,
          z: p.z + rr(-0.3, 0.3) * s,
          vx: rr(-0.2, 0.2),
          vy: rr(1.2, 2.2) * (opts.rise || 1) * Math.sqrt(s),
          vz: rr(-0.2, 0.2),
          size: 0.6 * s,
          size1: rr(4, 7) * s,
          life: rr(6, 9),
          color: col,
          alpha: opts.alpha || 0.4,
          frame: FR.SMOKE1 + ((Math.random() * 3) | 0),
          drag: 0.15,
          wind: 0.22,
          rotv: rr(-0.3, 0.3),
          fadeIn: 0.08,
          fadeOut: 0.45,
        });
      },
    });
  };
  /** Steam vent (manholes, broken pipes). */
  FX.steam = function (pos, scale, opts) {
    opts = opts || {};
    if (!A.addEmitter) return null;
    const s0 = scale || 1;
    return A.addEmitter({
      pos: toV(pos),
      rate: opts.rate || 5 * s0,
      lod: opts.lod || 90,
      scale: s0,
      spawn(p, em) {
        const s = em.scale;
        A.psAlpha.spawn({
          x: p.x + rr(-0.35, 0.35) * s,
          y: p.y + 0.05,
          z: p.z + rr(-0.35, 0.35) * s,
          vx: rr(-0.15, 0.15),
          vy: rr(0.9, 1.6) * s,
          vz: rr(-0.15, 0.15),
          size: 0.5 * s,
          size1: rr(2.2, 3.4) * s,
          life: rr(2.2, 3.6),
          color: 0xd8dcd0,
          alpha: 0.2,
          frame: FR.SMOKE1 + ((Math.random() * 3) | 0),
          drag: 0.5,
          wind: 0.45,
          rotv: rr(-0.4, 0.4),
          fadeIn: 0.15,
          fadeOut: 0.4,
        });
      },
    });
  };
  /** Stop every emitter (debug). */
  FX.stopAllEmitters = function () {
    for (const e of A.emitters.slice()) e.stop();
  };
  /** Clear transient effects (particles, beams, decals). */
  FX.clear = function () {
    for (const s of A.systems)
      if (
        s.reset &&
        (s.name === "particles" ||
          s.name === "beams" ||
          s.name === "lights_decals" ||
          s.name === "explosions")
      ) {
        try {
          s.reset();
        } catch (e) {
          /* ignore */
        }
      }
  };
  FX.stats = () => ({
    add: A.psAdd ? A.psAdd.n : 0,
    alpha: A.psAlpha ? A.psAlpha.n : 0,
    emitters: A.emitters ? A.emitters.length : 0,
    glows: A.glowCount ? A.glowCount() : 0,
  });

  A.addSystem({
    name: "effects",
    order: 61,
    init() {
      initViewFlash();
    },
    update(dt, realDt) {
      updateBolts(dt);
      updateViewFlash(dt, realDt);
    },
    reset() {
      boltHandles.length = 0;
      if (VM.grp) VM.grp.visible = false;
    },
  });
})();
