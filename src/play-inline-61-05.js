// play-inline-61 05 — opts
// Lines 880-1121 of readable/play-inline-61.pretty.js (statement-aligned).
  FX.decal = function (pos, normal, kind, opts) {
    if (!decMesh || !pos) return -1;
    opts = opts || {};
    if (
      A.isInteriorPos(pos.x) === false &&
      G.LAYOUT &&
      G.LAYOUT.isWater &&
      G.world &&
      pos.y < (G.world.waterLevel || -1.2) + 0.05 &&
      G.LAYOUT.isWater(pos.x, pos.z)
    )
      return -1;
    const k =
      DK[kind] !== undefined ? DK[kind] : typeof kind === "number" ? kind : 0;
    // de-dupe (combat may call decal() and impact() for the same hit)
    const now = A.animTime;
    if (
      lastDecal.k === k &&
      now - lastDecal.t < 0.05 &&
      Math.abs(lastDecal.x - pos.x) +
        Math.abs(lastDecal.y - pos.y) +
        Math.abs(lastDecal.z - pos.z) <
        0.05
    )
      return -1;
    lastDecal.k = k;
    lastDecal.t = now;
    lastDecal.x = pos.x;
    lastDecal.y = pos.y;
    lastDecal.z = pos.z;
    const defSize = {
      0: 0.16,
      1: 0.12,
      2: 2.6,
      3: 0.9,
      4: 0.9,
      5: 0.22,
      6: 0.4,
      7: 1.2,
      8: 0.8,
      9: 1.2,
      10: 1.1,
      11: 1.4,
      12: 0.16,
      13: 1.5,
      14: 0.8,
      15: 1.6,
    }[k];
    const size =
      (opts.size || defSize) * (opts.size ? 1 : 0.8 + Math.random() * 0.4);
    A.v3(normal || { x: 0, y: 1, z: 0 }, _n);
    if (_n.lengthSq() < 1e-6) _n.set(0, 1, 0);
    _n.normalize();
    _p.copy(pos).addScaledVector(_n, 0.015 + Math.random() * 0.01);
    _q.setFromUnitVectors(_z, _n);
    _q2.setFromAxisAngle(
      _z,
      opts.rot !== undefined ? opts.rot : Math.random() * Math.PI * 2,
    );
    _q.multiply(_q2);
    _s.set(size, size, size);
    _m.compose(_p, _q, _s);
    const i = decNext;
    decNext = (decNext + 1) % DEC_CAP;
    decCount = Math.min(DEC_CAP, decCount + 1);
    decMesh.setMatrixAt(i, _m);
    decMesh.instanceMatrix.needsUpdate = true;
    decMesh.count = decCount;
    const meta = decMeta[i];
    meta.born = now;
    meta.life = opts.life || 240;
    meta.heat =
      opts.heat !== undefined
        ? opts.heat
        : k === 5
          ? 1
          : k === 6
            ? 0.8
            : k === 15
              ? 0.25
              : k === 9
                ? 0.2
                : 0;
    meta.alpha = 1;
    meta.cool = k === 15 || k === 9 ? 0 : 1.1;
    const a = decAttr.array;
    a[i * 4] = k;
    a[i * 4 + 1] = 1;
    a[i * 4 + 2] = meta.heat;
    a[i * 4 + 3] = 0;
    decAttr.needsUpdate = true;
    if (meta.heat > 0 && meta.cool > 0) hotDecals.add(i);
    else hotDecals.delete(i);
    return i;
  };
  let decAgeT = 0;
  function updateDecals(dt) {
    if (!decMesh || dt <= 0) return;
    const a = decAttr.array;
    let dirty = false;
    for (const i of hotDecals) {
      const m = decMeta[i];
      m.heat = Math.max(0, m.heat - dt * m.cool * 0.35);
      a[i * 4 + 2] = m.heat;
      dirty = true;
      if (m.heat <= 0) hotDecals.delete(i);
    }
    decAgeT -= dt;
    if (decAgeT <= 0) {
      decAgeT = 1;
      const now = A.animTime;
      for (let i = 0; i < decCount; i++) {
        const m = decMeta[i];
        const age = now - m.born;
        const fadeStart = m.life * 0.8;
        const al =
          age < fadeStart
            ? 1
            : Math.max(0, 1 - (age - fadeStart) / (m.life - fadeStart));
        if (al !== a[i * 4 + 1]) {
          a[i * 4 + 1] = al;
          dirty = true;
        }
      }
    }
    if (dirty) decAttr.needsUpdate = true;
  }
  function clearDecals() {
    decCount = 0;
    decNext = 0;
    if (decMesh) decMesh.count = 0;
    hotDecals.clear();
  }

  // ==================================================================
  // Floating text
  // ==================================================================
  const texts = [];
  function makeTextSprite() {
    const cv = document.createElement("canvas");
    cv.width = 256;
    cv.height = 64;
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      fog: false,
      toneMapped: false,
    });
    const sp = new THREE.Sprite(mat);
    sp.renderOrder = 999;
    sp.visible = false;
    sp.scale.set(1.6, 0.4, 1);
    sp.name = "atmos_float_text";
    G.scene.add(sp);
    return { sp, cv, tex, t: 1, life: 1, vy: 0 };
  }
  /** Floating world text (e.g. damage numbers). color hex/string. */
  FX.floatingText = function (pos, text, color, opts) {
    if (!pos) return null;
    opts = opts || {};
    let e = texts.find((x) => x.t >= x.life);
    if (!e) {
      if (texts.length < 14) {
        e = makeTextSprite();
        texts.push(e);
      } else e = texts.reduce((a, b) => (a.t / a.life > b.t / b.life ? a : b));
    }
    const g = e.cv.getContext("2d");
    g.clearRect(0, 0, 256, 64);
    g.font = 'bold 40px "Share Tech Mono", "VT323", monospace';
    g.textAlign = "center";
    g.textBaseline = "middle";
    const col = "#" + A.color(color || 0x39ff6a).getHexString();
    g.lineWidth = 6;
    g.strokeStyle = "rgba(0,0,0,0.75)";
    g.strokeText(String(text), 128, 34);
    g.shadowColor = col;
    g.shadowBlur = 10;
    g.fillStyle = col;
    g.fillText(String(text), 128, 34);
    e.tex.needsUpdate = true;
    e.sp.position.copy(pos);
    const sc = opts.scale || 1;
    e.sp.scale.set(1.6 * sc, 0.4 * sc, 1);
    e.t = 0;
    e.life = opts.life || 1.4;
    e.vy = opts.rise !== undefined ? opts.rise : 0.9;
    e.sp.visible = true;
    e.sp.material.opacity = 1;
    return e.sp;
  };
  function updateTexts(dt, realDt) {
    const d = dt > 0 ? dt : realDt * 0; // freeze with the world
    for (const e of texts) {
      if (e.t >= e.life) {
        e.sp.visible = false;
        continue;
      }
      e.t += d;
      e.sp.position.y += e.vy * d;
      e.sp.material.opacity = Math.max(0, 1 - Math.pow(e.t / e.life, 2));
      if (e.t >= e.life) e.sp.visible = false;
    }
  }

  // ==================================================================
  A.addSystem({
    name: "lights_decals",
    order: 64,
    init() {
      initLights();
      initGlows();
      initDecals();
    },
    update(dt, realDt) {
      updateLights(dt, realDt);
      updateDecals(dt);
      updateTexts(dt, realDt);
    },
    late() {
      uploadGlows();
    },
    reset() {
      for (const f of flashes) {
        if (f.fixture) {
          f.fixture.entry = null;
          f.fixture = null;
        }
        f.t = f.dur;
        f.light.intensity = 0;
      }
      clearDecals();
      for (const e of texts) {
        e.t = e.life;
        e.sp.visible = false;
      }
    },
  });
