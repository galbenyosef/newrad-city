/* src/render_lighting/40_contact.js */
/* =====================================================================
 * RENDER_LIGHTING — contact shadows (ground occlusion under big props)
 *
 * Sun shadows ground objects only while the sun is up and not hidden; at
 * night, under overcast / rain / thunderstorm skies and inside building shadow,
 * cars and dumpsters seem to float on the asphalt. We ground them with
 * a dark occlusion pool underneath — here ONE InstancedMesh (1 draw call,
 * ≤ 256 soft elliptical blobs) placed from the world colliders: every car
 * (`prop_car`) and every bulky spawned prop (`prop`, ≥ 0.8 m², ≤ 3.5 m tall,
 * sitting on the ground) within ~110 m, nearest first, refreshed once a
 * second (destroyed cars drop out with their collider).
 * Strength follows the conditions: ~0.5 in clear sun (an AO core under the
 * real shadow), up to ~0.75 at night / overcast. Hidden indoors.
 *
 * ACTORS (second InstancedMesh, 1 draw call, ≤ 48 blobs, every frame): NPCs,
 * creatures and the third-person player body within 40 m get a soft
 * foot-occlusion blob sized from their bind-pose bounds — indoors too, where
 * nothing casts dynamic shadows and people otherwise stand on the floor like
 * cut-outs. Weaker in clear sun (the near cascade shadows them already).
 * Off: ?rlcontact=0, RL.setContact(false); userData.rlNoContact on the
 * collider's data object opts one out.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !G.rlight || !G.rlight._) return;
  const RL = G.rlight,
    R = RL._;

  const MAX = 256,
    RANGE = 110;
  let mesh = null,
    t = 0,
    count = 0;
  const _m = new THREE.Matrix4(),
    _q = new THREE.Quaternion(),
    _s = new THREE.Vector3(),
    _v = new THREE.Vector3(),
    _up = new THREE.Vector3(0, 1, 0);
  const cand = [];

  function blobTexture() {
    const N = 64,
      d = new Uint8Array(N * N * 4);
    for (let j = 0; j < N; j++)
      for (let i = 0; i < N; i++) {
        const x = ((i + 0.5) / N) * 2 - 1,
          y = ((j + 0.5) / N) * 2 - 1;
        // rounded-rectangle falloff: dense core under the body, soft skirt past the footprint
        const r = Math.pow(
          Math.pow(Math.abs(x), 4) + Math.pow(Math.abs(y), 4),
          0.25,
        );
        const a = Math.max(0, 1 - r);
        const v = Math.min(1, a * 1.9);
        const o = (j * N + i) * 4;
        d[o] = d[o + 1] = d[o + 2] = 0;
        d[o + 3] = Math.round(v * v * (3 - 2 * v) * 255);
      }
    const tex = new THREE.DataTexture(
      d,
      N,
      N,
      THREE.RGBAFormat,
      THREE.UnsignedByteType,
    );
    tex.magFilter = THREE.LinearFilter;
    tex.minFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    tex.needsUpdate = true;
    return tex;
  }

  function init() {
    if (!RL.contact) return;
    const geo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      map: blobTexture(),
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -4,
      fog: true,
    });
    mat.userData.shared = true;
    mesh = new THREE.InstancedMesh(geo, mat, MAX);
    mesh.name = "rl_contact_blobs";
    mesh.count = 0;
    mesh.frustumCulled = false;
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.renderOrder = -1; // before other transparents (smoke, glass) that sit above it
    mesh.userData.rlNoNearShadow = true;
    mesh.userData.rlNoBake = true;
    G.scene.add(mesh);
  }

  function refresh() {
    const W = G.world,
      cam = G.camera;
    if (!W || !W.colliders || !cam) return;
    const px = cam.position.x,
      pz = cam.position.z,
      r2 = RANGE * RANGE;
    const th = W.terrainHeight;
    cand.length = 0;
    for (const c of W.colliders) {
      if (!c) continue;
      const car = c.tag === "prop_car";
      if (!car && c.tag !== "prop") continue;
      const dx = c.cx - px,
        dz = c.cz - pz,
        d2 = dx * dx + dz * dz;
      if (d2 > r2) continue;
      if (c.data && c.data.rlNoContact) continue;
      if (!car) {
        const h = c.maxY - c.minY;
        if (c.hx * c.hz * 4 < 0.8 || h < 0.5 || h > 3.5) continue;
        if (th) {
          let g = 0;
          try {
            g = th(c.cx, c.cz);
          } catch (e) {
            g = c.minY;
          }
          if (Math.abs(c.minY - g) > 0.5) continue;
        }
      }
      cand.push({ c, d2, car });
    }
    cand.sort((a, b) => a.d2 - b.d2);
    count = Math.min(MAX, cand.length);
    for (let i = 0; i < count; i++) {
      const c = cand[i].c,
        car = cand[i].car;
      _v.set(c.cx, c.minY + 0.025, c.cz);
      _q.setFromAxisAngle(_up, -(c.yaw || 0));
      _s.set(
        c.hx * 2 * (car ? 1.22 : 1.35) + 0.5,
        1,
        c.hz * 2 * (car ? 1.22 : 1.35) + 0.5,
      );
      _m.compose(_v, _q, _s);
      mesh.setMatrixAt(i, _m);
    }
    mesh.count = count;
    mesh.instanceMatrix.needsUpdate = true;
  }

  function update(dt, realDt) {
    if (!mesh) return;
    const indoors = R.interior();
    if (!amesh && G.actors) initActors();
    if (amesh) {
      const aon = RL.contact && G.state !== "title";
      if (aon) updateActors(indoors);
      else amesh.visible = false;
      if (aon) {
        let day = 0;
        try {
          const A = G.atmos;
          if (A && A.sun) day = Math.min(1, A.sun.intensity / 0.6);
        } catch (e) {
          day = 0;
        }
        // clear sun: the near cascade grounds them already → a light AO core; night / indoors / overcast: the only cue
        // indoors with the overhead shadow on, actors already cast real soft shadows: the blob is only the AO core
        const inSh = indoors && R.interiorShadowOn && R.interiorShadowOn();
        amesh.material.opacity = indoors
          ? inSh
            ? 0.34
            : 0.6
          : Math.min(0.72, 0.62 - 0.3 * day * (1 - R.overcast()));
      }
    }
    const on = RL.contact && !indoors && G.state !== "title";
    mesh.visible = on && count > 0;
    if (!on) {
      t = 0;
      return;
    }
    t -= realDt || 0.016;
    if (t <= 0) {
      t = 1.0;
      refresh();
      mesh.visible = count > 0;
    }
    // stronger when real sun shadows are weak (night, overcast); 0.5 in clear daylight
    let night = 0;
    try {
      const A = G.atmos;
      if (A && A.sun && A.hemi)
        night = A.sun.intensity < 0.6 ? 1 - A.sun.intensity / 0.6 : 0;
    } catch (e) {
      night = 0;
    }
    mesh.material.opacity = Math.min(
      0.78,
      0.5 + 0.22 * R.overcast() + 0.2 * night,
    );
  }

  // ------------------------------------------------------------------
  // actors
  // ------------------------------------------------------------------
  const AMAX = 48,
    ARANGE = 40;
  let amesh = null,
    acount = 0;
  const sizeCache = new WeakMap();
  const _box = new THREE.Box3(),
    _bs = new THREE.Vector3();
  const acand = [];
  function footprint(root) {
    let f = sizeCache.get(root);
    if (f) return f;
    f = { w: 0.75, d: 0.55 };
    try {
      _box.setFromObject(root);
      _box.getSize(_bs);
      if (
        isFinite(_bs.x) &&
        _bs.x > 0.15 &&
        _bs.x < 12 &&
        _bs.z > 0.15 &&
        _bs.z < 12
      ) {
        // the bounds include swinging arms / tails: keep the blob under the body mass
        f.w = Math.min(6, Math.max(0.55, Math.min(_bs.x, _bs.z) * 0.95));
        f.d = Math.min(8, Math.max(0.45, Math.max(_bs.x, _bs.z) * 0.8));
        if (_bs.y < 0.6) {
          f.w *= 0.8;
          f.d *= 0.8;
        } // giant roaches, burrow rats: small, tight
      }
    } catch (e) {
      /* keep the default */
    }
    sizeCache.set(root, f);
    return f;
  }
  function initActors() {
    const geo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
    const mat = mesh ? mesh.material.clone() : null;
    if (!mat) return;
    mat.userData.shared = true;
    amesh = new THREE.InstancedMesh(geo, mat, AMAX);
    amesh.name = "rl_contact_actors";
    amesh.count = 0;
    amesh.frustumCulled = false;
    amesh.castShadow = false;
    amesh.receiveShadow = false;
    amesh.renderOrder = -1;
    amesh.userData.rlNoNearShadow = true;
    amesh.userData.rlNoBake = true;
    G.scene.add(amesh);
  }
  function updateActors(indoors) {
    const AC = G.actors,
      cam = G.camera;
    acand.length = 0;
    if (AC && !G.isStub("actors") && AC.list && cam) {
      const list = AC.list() || [];
      const px = cam.position.x,
        pz = cam.position.z;
      for (let i = 0; i < list.length; i++) {
        const a = list[i];
        if (!a || !a.pos || !a.char || !a.char.root) continue;
        const root = a.char.root;
        if (
          !root.visible ||
          !root.parent ||
          (root.userData && root.userData.rlNoContact)
        )
          continue;
        const dx = a.pos.x - px,
          dz = a.pos.z - pz,
          d2 = dx * dx + dz * dz;
        if (d2 > ARANGE * ARANGE) continue;
        acand.push({
          root,
          x: a.pos.x,
          y: a.pos.y,
          z: a.pos.z,
          yaw: a.yaw || root.rotation.y || 0,
          dead: !!a.dead,
          d2,
        });
      }
    }
    const P = G.player;
    if (P && P.thirdPersonActive && P.tpBody && P.tpBody.root && P.pos) {
      const r = P.tpBody.root;
      if (r.visible)
        acand.push({
          root: r,
          x: r.position.x,
          y: r.position.y,
          z: r.position.z,
          yaw: r.rotation.y,
          dead: false,
          d2: 0,
        });
    }
    acand.sort((a, b) => a.d2 - b.d2);
    acount = Math.min(AMAX, acand.length);
    for (let i = 0; i < acount; i++) {
      const c = acand[i],
        f = footprint(c.root);
      let w = f.w,
        d = f.d;
      if (c.dead) {
        const m = Math.max(w, d) * 1.5;
        w = m * 0.7;
        d = m;
      } // lying down: longer, flatter pool
      _v.set(c.x, c.y + 0.03, c.z);
      _q.setFromAxisAngle(_up, c.yaw);
      _s.set(w * 1.35 + 0.25, 1, d * 1.35 + 0.25);
      _m.compose(_v, _q, _s);
      amesh.setMatrixAt(i, _m);
    }
    amesh.count = acount;
    amesh.instanceMatrix.needsUpdate = true;
    amesh.visible = acount > 0;
  }

  RL.setContact = function (on) {
    RL.contact = !!on;
    if (on && !mesh) init();
  };
  RL.contactInfo = () => ({
    on: !!mesh && RL.contact,
    blobs: count,
    actorBlobs: acount,
  });

  R.addSystem({
    name: "contact",
    order: 40,
    init,
    update,
    dispose() {
      if (mesh) mesh.visible = false;
      if (amesh) amesh.visible = false;
    },
  });
})();
