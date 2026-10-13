// play-inline-63 02 — three
// Lines 15-270 of readable/play-inline-63.pretty.js (statement-aligned).
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
