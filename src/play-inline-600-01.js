// play-inline-600 01 — math
// Lines 20-354 of readable/play-inline-600.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const H = G.hud._;

  const RW = 480,
    RH = 300; // offscreen render size
  const CACHE = new Map(); // key → dataURL | null (failed)
  const R = {
    rt: null,
    scene: null,
    cam: null,
    normalMat: null,
    lights: null,
    buf: null,
    buf2: null,
    failed: 0,
  };

  function setup() {
    if (R.rt) return true;
    if (!THREE || !G.renderer || !THREE.WebGLRenderTarget) return false;
    R.rt = new THREE.WebGLRenderTarget(RW, RH, {
      depthBuffer: true,
      stencilBuffer: false,
    });
    R.scene = new THREE.Scene();
    R.scene.background = null;
    R.cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 50);
    R.normalMat = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide });
    const amb = new THREE.AmbientLight(0xffffff, 1.4);
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(3, 5, 4);
    const fill = new THREE.DirectionalLight(0xffffff, 0.9);
    fill.position.set(-4, 1, 2);
    R.lights = [amb, key, fill];
    R.lights.forEach((l) => R.scene.add(l));
    R.buf = new Uint8Array(RW * RH * 4);
    R.buf2 = new Uint8Array(RW * RH * 4);
    return true;
  }

  /** Build the model for an item: {obj, kind:'weapon'|'item'|'body', dispose?} or null. */
  function buildModel(d, id) {
    if (!d) return null;
    try {
      if (d.type === "weapon" && H.has("weapons", "createWorldModel")) {
        const m = G.weapons.createWorldModel(id);
        if (m) return { obj: m, kind: "weapon" };
      }
      if (d.type === "apparel") {
        const slot = d.slot || "body";
        if (slot !== "body" || !d.outfit || !H.has("chars", "create"))
          return null;
        const ch = G.chars.create("human", {
          outfit: d.outfit,
          seed: 7,
          gender: "m",
          addToScene: false,
          variant: 0,
        });
        if (!ch || !ch.root) return null;
        try {
          if (ch.setAnim) ch.setAnim("idle", { loop: true });
          if (ch.update) {
            ch.update(0.4);
            ch.update(0.4);
          }
        } catch (e) {
          /* pose optional */
        }
        if (ch.root.parent) ch.root.parent.remove(ch.root);
        return {
          obj: ch.root,
          kind: "body",
          dispose: () => {
            try {
              ch.dispose && ch.dispose();
            } catch (e) {
              /* ignore */
            }
          },
        };
      }
      if (
        (d.type === "aid" ||
          d.type === "ammo" ||
          d.type === "misc" ||
          d.type === "junk" ||
          d.type === "key" ||
          d.type === "tape" ||
          d.book) &&
        H.has("items", "createItemModel")
      ) {
        const m = G.items.createItemModel(id);
        if (m) return { obj: m, kind: "item" };
      }
    } catch (e) {
      H.warnOnce("itemrender.build", e);
    }
    return null;
  }

  /** Orient + frame the model; returns false when it has no visible size. */
  function frame(model) {
    const holder = new THREE.Group();
    holder.add(model.obj);
    const o = model.obj;
    o.position.set(0, 0, 0);
    if (model.kind === "weapon") {
      // barrel (-Z) to the right, seen from the side with a slight 3/4 turn and a tilt from above
      // (the camera sits on +Z looking -Z; models are built barrel/face toward -Z)
      holder.rotation.set(0.2, -Math.PI / 2 + 0.28, 0);
    } else if (model.kind === "body") {
      holder.rotation.set(0.06, Math.PI - 0.45, 0); // characters face -Z: turn them to the viewer, 3/4
    } else {
      // small items: find their long axis and show them upright-ish at 3/4
      const b0 = new THREE.Box3().setFromObject(o),
        s0 = b0.getSize(new THREE.Vector3());
      if (s0.z > s0.x * 1.3 && s0.z > s0.y)
        holder.rotation.set(0.35, Math.PI / 2 + 0.4, 0);
      else holder.rotation.set(0.42, -0.6, 0);
    }
    R.scene.add(holder);
    holder.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(holder);
    if (model.kind === "body")
      box.min.y = box.max.y - (box.max.y - box.min.y) * 0.5; // head to hips: the armour is the subject
    const size = box.getSize(new THREE.Vector3()),
      c = box.getCenter(new THREE.Vector3());
    if (!(size.x > 1e-4 && size.y > 1e-4)) {
      R.scene.remove(holder);
      return null;
    }
    const aspect = RW / RH,
      pad = 1.12;
    let hw = (size.x / 2) * pad,
      hh = (size.y / 2) * pad;
    if (hw / hh > aspect) hh = hw / aspect;
    else hw = hh * aspect;
    const cam = R.cam;
    cam.left = -hw;
    cam.right = hw;
    cam.top = hh;
    cam.bottom = -hh;
    cam.position.set(c.x, c.y, c.z + size.z + 5);
    cam.near = 0.01;
    cam.far = size.z + 12;
    cam.lookAt(c.x, c.y, c.z);
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld(true);
    return holder;
  }

  function renderPass(override, out) {
    const r = G.renderer;
    R.scene.overrideMaterial = override || null;
    r.setRenderTarget(R.rt);
    r.setClearColor(0x000000, 0);
    r.clear(true, true, false);
    r.render(R.scene, R.cam);
    r.readRenderTargetPixels(R.rt, 0, 0, RW, RH, out);
  }

  /** Render the model twice and compose the phosphor picture. */
  function renderItem(model, colHex) {
    const r = G.renderer;
    const holder = frame(model);
    if (!holder) return null;
    // --- save renderer state (the main frame must not notice us) ---
    const prevRT = r.getRenderTarget();
    const prevCol = r.getClearColor(new THREE.Color()),
      prevA = r.getClearAlpha();
    const prevAuto = r.autoClear;
    const sm = r.shadowMap,
      prevSMNeeds = sm ? sm.needsUpdate : false,
      prevSMAuto = sm ? sm.autoUpdate : false;
    const info = r.info,
      prevInfoAuto = info ? info.autoReset : true;
    let ok = false;
    try {
      r.autoClear = false;
      if (sm) {
        sm.autoUpdate = false;
        sm.needsUpdate = false;
      }
      if (info) info.autoReset = false; // don't disturb the frame's draw-call stats
      holder.traverse((x) => {
        if (x.isMesh || x.isSkinnedMesh) {
          x.frustumCulled = false;
        }
        if (x.isLOD && x.levels && x.levels.length) {
          x.autoUpdate = false;
          x.levels.forEach((lv, i) => {
            lv.object.visible = i === 0;
          });
        }
      });
      renderPass(R.normalMat, R.buf);
      renderPass(null, R.buf2);
      ok = true;
    } catch (e) {
      H.warnOnce("itemrender.render", e);
    } finally {
      R.scene.overrideMaterial = null;
      r.setRenderTarget(prevRT);
      r.setClearColor(prevCol, prevA);
      r.autoClear = prevAuto;
      if (sm) {
        sm.autoUpdate = prevSMAuto;
        sm.needsUpdate = prevSMNeeds;
      }
      if (info) info.autoReset = prevInfoAuto;
      R.scene.remove(holder);
    }
    if (!ok) return null;
    return compose(colHex, model.kind === "body");
  }

  /** Normals + colour buffers → goggle monochrome picture (data URL). */
  function compose(colHex, fadeBottom) {
    const N = R.buf,
      C = R.buf2;
    const n = RW * RH;
    const alpha = new Float32Array(n),
      shade = new Float32Array(n),
      tex = new Float32Array(n);
    const nx = new Float32Array(n),
      ny = new Float32Array(n),
      nz = new Float32Array(n);
    // key light in view space: upper left, toward the viewer
    let lx = -0.45,
      ly = 0.62,
      lz = 0.64;
    const ll = Math.hypot(lx, ly, lz);
    lx /= ll;
    ly /= ll;
    lz /= ll;
    let tmax = 0.001,
      tmin = 1,
      cnt = 0;
    for (let y = 0; y < RH; y++) {
      const src = (RH - 1 - y) * RW; // readPixels rows run bottom-up
      for (let x = 0; x < RW; x++) {
        const i = y * RW + x,
          s = (src + x) * 4;
        const a = N[s + 3] / 255;
        alpha[i] = a;
        if (a < 0.02) continue;
        const vx = N[s] / 127.5 - 1,
          vy = N[s + 1] / 127.5 - 1,
          vz = N[s + 2] / 127.5 - 1;
        nx[i] = vx;
        ny[i] = vy;
        nz[i] = vz;
        shade[i] = Math.max(0, vx * lx + vy * ly + vz * lz);
        const t = Math.sqrt(
          (0.2126 * C[s] + 0.7152 * C[s + 1] + 0.0722 * C[s + 2]) / 255,
        );
        tex[i] = t;
        if (t > tmax) tmax = t;
        if (t < tmin) tmin = t;
        cnt++;
      }
    }
    if (cnt < 40) return null;
    const trange = Math.max(0.05, tmax - tmin);
    const cv = document.createElement("canvas");
    cv.width = RW;
    cv.height = RH;
    const g = cv.getContext("2d");
    const img = g.createImageData(RW, RH),
      o = img.data;
    const cr = parseInt(colHex.slice(1, 3), 16),
      cg = parseInt(colHex.slice(3, 5), 16),
      cb = parseInt(colHex.slice(5, 7), 16);
    for (let y = 1; y < RH - 1; y++) {
      for (let x = 1; x < RW - 1; x++) {
        const i = y * RW + x;
        const a = alpha[i];
        // silhouette edge: alpha gradient
        const ga =
          Math.abs(alpha[i + 1] - alpha[i - 1]) +
          Math.abs(alpha[i + RW] - alpha[i - RW]);
        let edge = Math.min(1, ga * 1.4);
        if (a > 0.02) {
          // crease edge: normal discontinuity against right / lower neighbour
          const j = i + 1,
            k = i + RW;
          if (alpha[j] > 0.02) {
            const d = nx[i] * nx[j] + ny[i] * ny[j] + nz[i] * nz[j];
            if (d < 0.82) edge = Math.max(edge, 0.75);
          }
          if (alpha[k] > 0.02) {
            const d = nx[i] * nx[k] + ny[i] * ny[k] + nz[i] * nz[k];
            if (d < 0.82) edge = Math.max(edge, 0.75);
          }
          // paint / label detail: strong luminance steps become thin lines too
          const tt =
            Math.abs(tex[i + 1] - tex[i - 1]) +
            Math.abs(tex[i + RW] - tex[i - RW]);
          if (tt > trange * 0.55) edge = Math.max(edge, 0.45);
        }
        const p = i * 4;
        if (a <= 0.02 && edge <= 0.02) {
          o[p + 3] = 0;
          continue;
        }
        // face fill: key-light bands (3 steps, soft) × paint value, kept dim so the outline reads
        const t = (tex[i] - tmin) / trange;
        let v = 0.18 + 0.5 * shade[i];
        v = (Math.round(v * 5) / 5) * 0.55 + v * 0.45;
        v = v * (0.55 + 0.45 * t);
        let I = 0.12 + v * 0.62;
        if (edge > 0) I = Math.max(I, 0.35 + edge * 0.65);
        // horizontal hatch in the shadowed areas (engraved-plate look)
        if (a > 0.02 && shade[i] < 0.28 && edge < 0.3 && y % 3 === 0) I *= 0.55;
        o[p] = Math.min(255, cr * I + 60 * Math.max(0, I - 0.85));
        o[p + 1] = Math.min(255, cg * I + 60 * Math.max(0, I - 0.85));
        o[p + 2] = Math.min(255, cb * I + 60 * Math.max(0, I - 0.85));
        let fa = 1;
        if (fadeBottom && y > RH * 0.78)
          fa = Math.max(0, 1 - (y - RH * 0.78) / (RH * 0.2)); // cropped figure dissolves at the hips
        o[p + 3] = Math.round(255 * fa * Math.min(1, Math.max(a * 0.94, edge)));
      }
    }
    g.putImageData(img, 0, 0);
    try {
      return cv.toDataURL("image/png");
    } catch (e) {
      return null;
    }
  }

  /** → data URL, null (not renderable) or, with cachedOnly, undefined when it has not been rendered yet. */
