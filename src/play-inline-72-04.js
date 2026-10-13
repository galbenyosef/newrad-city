// play-inline-72 04 — near
// Lines 695-1024 of readable/play-inline-72.pretty.js (statement-aligned).
  function lateInterior(sun) {
    const C = U.nrcCsm.value;
    setNearCast(false);
    const ok =
      RL.cascades &&
      RL.interiorShadows &&
      S.orderOk &&
      G.renderer.shadowMap.enabled &&
      TIERS[S.tier] &&
      G.camera;
    if (!ok) {
      if (S.inMode) leaveInterior();
      C.x = 0;
      C.z = 0;
      U.nrcCsm3.value.w = 0;
      near.shadow.autoUpdate = false;
      near.shadow.needsUpdate = false;
      sun.shadow.autoUpdate = true;
      S.active = false;
      S.lastKind = "";
      applyWeather(0);
      return;
    }
    const cam = G.camera;
    const P = G.player;
    const feet =
      P && P.pos && isFinite(P.pos.y) ? P.pos.y : cam.position.y - 1.6;
    const key = cellKeyAt(cam.position.x, cam.position.z);
    if (!S.inMode || key !== inKey) {
      if (S.inMode) restoreInterior();
      S.inMode = true;
      S.inFrames = 0;
      inKey = key;
      S.inT = 0;
      S.floor = feet;
      S.recollected = false;
      collectInterior(cam.position.x, cam.position.z);
    }
    S.inFrames++;
    S.inT += 1 / 60;
    if (!S.recollected && S.inFrames > 120) {
      S.recollected = true;
      collectInterior(cam.position.x, cam.position.z);
    } // late builders
    // floor tracking: follows the player down at once, up slowly (a jump doesn't lift the cut into the ceiling)
    if (feet < S.floor) S.floor = feet;
    else S.floor += Math.min(feet - S.floor, 0.04);
    const floor = Math.round(S.floor * 4) / 4,
      cut = floor + IN_CUT;
    // box: fixed size, a little ahead of the view, texel-snapped on the world XZ grid
    const E = S.extent,
      texel = (E * 2) / S.size;
    cam.getWorldDirection(_fd);
    _fd.y = 0;
    if (_fd.lengthSq() > 1e-6) _fd.normalize();
    let cx = cam.position.x + _fd.x * E * 0.35,
      cz = cam.position.z + _fd.z * E * 0.35;
    cx = Math.round(cx / texel) * texel;
    cz = Math.round(cz / texel) * texel;
    const sc = near.shadow.camera;
    sc.up.set(0, 0, -1); // looking straight down: light-space x = world x, y = −world z
    const far = cut - (floor - IN_BELOW);
    if (Math.abs(sc.near - 0.02) > 1e-4 || Math.abs(sc.far - far) > 1e-3) {
      sc.near = 0.02;
      sc.far = far;
      sc.updateProjectionMatrix();
    }
    near.position.set(cx, cut, cz);
    near.target.position.set(cx, cut - 10, cz);
    near.updateMatrixWorld();
    near.target.updateMatrixWorld();
    // soft, wide penumbrae (big overhead fixtures), receiver-plane bias for the short depth range
    const range = sc.far - sc.near;
    U.nrcCsm3.value.x = texel / range;
    U.nrcCsm3.value.z = 1;
    U.nrcCsm3.value.w = IN_AMB;
    const C2 = U.nrcCsm2.value;
    C2.y = (range * IN_LSIZE) / texel;
    C2.z = 1.5;
    C2.w = S.tier === 0 ? 9 : 6;
    C2.x = S.tier === 0 ? 8 : 5;
    selectInterior(cx, cz, E, floor, cut);
    C.x = 2;
    C.z = 0;
    // one pass: the near map (every frame on the full tier, every 2nd on reduced); the parked sun map
    // is only refreshed on the first frames (atmosphere clears it once)
    const nearNow =
      S.tier === 0 || (S.frame & 1) === 0 || !near.shadow.map || S.inFrames < 3;
    near.shadow.autoUpdate = nearNow;
    near.shadow.needsUpdate = false;
    sun.shadow.autoUpdate = S.inFrames < 3;
    if (nearNow) G.renderer.shadowMap.needsUpdate = true; // atmosphere switched the renderer's pass off indoors
    S.active = true;
    S.lastKind = "interior";
    S.inCut = +cut.toFixed(2);
  }
  /** debug (?rlinfo=1 shots): sample the near map on a 9×9 grid → {min, max, lit (texels at max depth)} */
  RL._nearProbe = function () {
    const rt = near && near.shadow.map;
    if (!rt || !G.renderer) return null;
    const px = new Uint8Array(4);
    let mn = 9,
      mx = -1,
      n = 0,
      far = 0;
    const N = rt.width;
    for (let j = 1; j < 10; j++)
      for (let i = 1; i < 10; i++) {
        G.renderer.readRenderTargetPixels(
          rt,
          Math.floor((N * i) / 10),
          Math.floor((N * j) / 10),
          1,
          1,
          px,
        );
        const d =
          px[0] / 255 / 16777216 +
          px[1] / 255 / 65536 +
          px[2] / 255 / 256 +
          px[3] / 255; // three's unpackRGBAToDepth (r158)
        if (d < mn) mn = d;
        if (d > mx) mx = d;
        n++;
        if (d > 0.999) far++;
      }
    const cam = near.shadow.camera;
    return {
      n,
      min: +mn.toFixed(3),
      max: +mx.toFixed(3),
      empty: far,
      camNear: cam.near,
      camFar: +cam.far.toFixed(2),
      up: cam.up.toArray(),
      pos: near.position.toArray().map((v) => +v.toFixed(1)),
      auto: near.shadow.autoUpdate,
      smAuto: G.renderer.shadowMap.autoUpdate,
    };
  };
  RL._nearAscii = function (W) {
    const rt = near && near.shadow.map;
    if (!rt || !G.renderer) return null;
    W = W || 48;
    const N = rt.width,
      all = new Uint8Array(N * N * 4);
    G.renderer.readRenderTargetPixels(rt, 0, 0, N, N, all);
    const cam = new THREE.Vector4(
      G.camera.position.x,
      0,
      G.camera.position.z,
      1,
    ).applyMatrix4(near.shadow.matrix);
    const ci = Math.floor(cam.x * W),
      cj = Math.floor(cam.y * W);
    const rows = [];
    for (let j = W - 1; j >= 0; j--) {
      let row = "";
      for (let i = 0; i < W; i++) {
        let mn = 9;
        for (let b = 0; b < 4; b++)
          for (let a = 0; a < 4; a++) {
            const x = Math.floor(((i + (a + 0.5) / 4) * N) / W),
              y = Math.floor(((j + (b + 0.5) / 4) * N) / W),
              o = (y * N + x) * 4;
            const d =
              all[o] / 255 / 16777216 +
              all[o + 1] / 255 / 65536 +
              all[o + 2] / 255 / 256 +
              all[o + 3] / 255;
            if (d < mn) mn = d;
          }
        row +=
          i === ci && j === cj
            ? "C"
            : mn > 0.99
              ? "."
              : String(Math.min(9, Math.floor(mn * 10)));
      }
      rows.push(row);
    }
    return rows;
  };
  R.interiorShadowOn = () => !!(S.inMode && U.nrcCsm.value.x > 1.5);
  RL.setInteriorShadows = function (on) {
    RL.interiorShadows = !!on;
    try {
      localStorage.setItem("nrc_rl_in", on ? "1" : "0");
    } catch (e) {
      /* ignore */
    }
  };

  // ------------------------------------------------------------------
  // NEAR-ONLY CASTERS: small street clutter (hydrants, bins, crates, debris…) is too numerous for
  // the big far map, but inside the near box it is exactly what grounds the scene. Registered meshes
  // get castShadow = true only while the NEAR map renders — a per-object flag read by the shadow
  // pass only (no program change, no recompiles). Chunks are chosen nearest-first among those whose
  // bounds touch the box, until the triangle budget (far-frame tris − near-frame tris) is used up.
  // ------------------------------------------------------------------
  const nearCasters = []; // {o, tris, c: Vector3 (world bound centre), r}
  let active = [];
  let nearCastOn = null;
  function setNearCast(on) {
    if (on === nearCastOn && !S.dirtySel) return;
    nearCastOn = on;
    S.dirtySel = false;
    for (let i = 0; i < nearCasters.length; i++)
      nearCasters[i].o.castShadow = false;
    if (on)
      for (let i = 0; i < active.length; i++) active[i].o.castShadow = true;
  }
  function eligible(o) {
    if (
      !o.isMesh ||
      o.isSkinnedMesh ||
      o.castShadow ||
      (o.userData && o.userData.rlNoNearShadow)
    )
      return false;
    const m = o.material;
    if (
      !m ||
      Array.isArray(m) ||
      m.transparent ||
      m.isMeshBasicMaterial ||
      m.isShaderMaterial
    )
      return false;
    return true;
  }
  function trisOf(g) {
    const n = g.index
      ? g.index.count
      : g.attributes.position
        ? g.attributes.position.count
        : 0;
    return n / 3;
  }
  function register(o) {
    if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere();
    const bs = o.geometry.boundingSphere;
    o.updateWorldMatrix(true, false);
    const c = bs.center.clone().applyMatrix4(o.matrixWorld);
    const r = bs.radius * o.matrixWorld.getMaxScaleOnAxis();
    nearCasters.push({ o, tris: trisOf(o.geometry), c, r });
  }
  /** Register an object (all its eligible meshes) as a near-cascade-only shadow caster. */
  RL.addNearCaster = function (obj) {
    if (!obj) return 0;
    let n = 0;
    obj.traverse((o) => {
      if (eligible(o) && !nearCasters.some((e) => e.o === o)) {
        register(o);
        n++;
      }
    });
    S.selAt = null;
    return n;
  };
  RL.removeNearCaster = function (obj) {
    if (!obj) return;
    obj.traverse((o) => {
      const i = nearCasters.findIndex((e) => e.o === o);
      if (i >= 0) {
        nearCasters.splice(i, 1);
        o.castShadow = false;
      }
    });
    active = active.filter((e) => nearCasters.indexOf(e) >= 0);
    S.selAt = null;
  };
  function selectClutter() {
    // budget: what the near pass may add on top of its own static casters to stay ≤ the far frame
    const base = S.tNear ? S.tNear - S.clutterUsed : 0;
    let budget =
      S.tFar && S.tNear ? Math.max(0, (S.tFar - base) * 0.97) : 60000;
    budget = Math.min(budget, 250000);
    S.budget = budget;
    // re-select when the box moved ~6 m or the budget changed noticeably
    const moved =
      !S.selAt ||
      Math.abs(S.cx - S.selAt.x) + Math.abs(S.cy - S.selAt.y) > 6 ||
      Math.abs(budget - S.selAt.b) > 20000;
    if (!moved) return;
    S.selAt = { x: S.cx, y: S.cy, b: budget };
    const E = S.extent + 2;
    const inBox = [];
    for (const e of nearCasters) {
      if (!e.o.parent || !e.o.visible) continue;
      const a = e.c.dot(_r) - S.cx,
        b = e.c.dot(_u) - S.cy;
      if (Math.abs(a) > E + e.r || Math.abs(b) > E + e.r) continue;
      e.d = Math.hypot(
        Math.max(0, Math.abs(a) - e.r),
        Math.max(0, Math.abs(b) - e.r),
      );
      inBox.push(e);
    }
    inBox.sort((x, y) => x.d - y.d || x.tris - y.tris);
    active = [];
    let used = 0;
    for (const e of inBox) {
      if (used + e.tris > budget) continue;
      active.push(e);
      used += e.tris;
    }
    S.clutterUsed = used;
    S.clutterIn = inBox.length;
    S.dirtySel = true;
  }
  // auto-discovery of props' merged small/medium clutter chunks (props builds them without shadows
  // for the far map's sake); props can opt a mesh out with userData.rlNoNearShadow
  function discoverClutter() {
    let n = 0;
    G.scene.traverse((o) => {
      if (o.name && /^props_(small|medium)_/.test(o.name))
        n += RL.addNearCaster(o);
    });
    S.clutter = n;
    let tris = 0,
      maxT = 0;
    for (const e of nearCasters) {
      tris += e.tris;
      if (e.tris > maxT) maxT = e.tris;
    }
    S.clutterTris = tris;
    S.clutterMaxTris = maxT;
  }

