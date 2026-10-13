// play-inline-509 03 — actor
// Lines 955-1298 of readable/play-inline-509.pretty.js (statement-aligned).
  C.Actor = Actor;

  // ------------------------------------------------------------------
  // Hit capsules (per part). Computed lazily from the character's meshes,
  // in each part's local space so they follow the animation.
  // ------------------------------------------------------------------
  function partMeshes(obj, partSet, out) {
    if (obj.isMesh && obj.visible !== false) out.push(obj);
    for (const c of obj.children)
      if (!partSet.has(c)) partMeshes(c, partSet, out);
    return out;
  }
  const _box = new THREE.Box3(),
    _b2 = new THREE.Box3(),
    _inv = new THREE.Matrix4();
  C.computeHitParts = function (actor) {
    const ch = actor.char;
    ch.root.updateMatrixWorld(true);
    const parts = ch.parts || {};
    const partSet = new Set(Object.values(parts).filter(Boolean));
    const out = [];
    const markerMode = !ch.placeholder && typeof ch.raycast === "function";
    const keys = Object.keys(parts).sort((p, q) =>
      p === "torso" ? -1 : q === "torso" ? 1 : 0,
    );
    const seenObj = new Set();
    for (const key of keys) {
      const obj = parts[key];
      if (!obj || !obj.isObject3D) continue;
      if (seenObj.has(obj)) continue; // G.chars aliases missing parts to the torso marker
      seenObj.add(obj);
      if (markerMode) {
        const r = (obj.userData && obj.userData.radius) || 0.2;
        out.push({
          key,
          obj,
          a: new THREE.Vector3(),
          b: new THREE.Vector3(),
          r,
          wa: new THREE.Vector3(),
          wb: new THREE.Vector3(),
          label: C.partLabel(actor.type, key, ch),
          meshes: [],
        });
        continue;
      }
      const meshes = partMeshes(obj, partSet, []);
      _inv.copy(obj.matrixWorld).invert();
      _box.makeEmpty();
      for (const m of meshes) {
        const g = m.geometry;
        if (!g) continue;
        if (!g.boundingBox) g.computeBoundingBox();
        _b2
          .copy(g.boundingBox)
          .applyMatrix4(_m.multiplyMatrices(_inv, m.matrixWorld));
        _box.union(_b2);
      }
      let a, b, r;
      if (_box.isEmpty()) {
        a = new THREE.Vector3();
        b = new THREE.Vector3();
        r = Math.max(0.08, actor.height * 0.08);
      } else {
        const size = _box.getSize(new THREE.Vector3()),
          c = _box.getCenter(new THREE.Vector3());
        // scale factor of the part (world) so radii are in world units
        const sc = new THREE.Vector3();
        obj.matrixWorld.decompose(_v1, new THREE.Quaternion(), sc);
        const ax =
          size.x >= size.y && size.x >= size.z
            ? "x"
            : size.y >= size.z
              ? "y"
              : "z";
        const others = ["x", "y", "z"].filter((k) => k !== ax);
        r = Math.max(
          0.05,
          Math.max(size[others[0]], size[others[1]]) * 0.5 * 0.92,
        );
        const half = Math.max(0, size[ax] * 0.5 - r);
        a = c.clone();
        b = c.clone();
        a[ax] -= half;
        b[ax] += half;
        r *= (sc.x + sc.y + sc.z) / 3;
      }
      out.push({
        key,
        obj,
        a,
        b,
        r,
        wa: new THREE.Vector3(),
        wb: new THREE.Vector3(),
        label: C.partLabel(actor.type, key, ch),
        meshes,
      });
    }
    // Virtual 'weapon' part (shoot it out of their hands)
    if (actor.weaponModel) {
      const m = actor.weaponModel;
      _box.setFromObject(m);
      if (!_box.isEmpty()) {
        _inv.copy(m.matrixWorld).invert();
        const lb = _box.clone().applyMatrix4(_inv);
        const size = lb.getSize(new THREE.Vector3()),
          c = lb.getCenter(new THREE.Vector3());
        const r = Math.max(0.05, Math.min(size.x, size.y) * 0.5 + 0.02);
        const a = c.clone(),
          b = c.clone();
        const half = Math.max(0, size.z * 0.5 - r);
        a.z -= half;
        b.z += half;
        out.push({
          key: "weapon",
          obj: m,
          a,
          b,
          r: Math.max(r, 0.06),
          wa: new THREE.Vector3(),
          wb: new THREE.Vector3(),
          label: "Weapon",
          virtual: true,
        });
      }
    }
    actor.hitParts = out;
    // Limb conditions: each limb has its own health
    for (const hp of out) {
      if (hp.virtual || actor.limbs[hp.key]) continue;
      const frac = hp.key === "torso" ? 1.0 : hp.key === "head" ? 0.45 : 0.5;
      actor.limbs[hp.key] = {
        hp: actor.maxHp * frac,
        max: actor.maxHp * frac,
        crippled: false,
      };
    }
    return out;
  };
  /** Update world-space capsule endpoints (call once per frame per actor before tests). */
  C.updateHitParts = function (actor) {
    if (!actor.hitParts) C.computeHitParts(actor);
    if (actor._hpStamp === G.time.frame) return actor.hitParts;
    actor._hpStamp = G.time.frame;
    actor.char.root.updateMatrixWorld(true);
    for (const hp of actor.hitParts) {
      hp.wa.copy(hp.a).applyMatrix4(hp.obj.matrixWorld);
      hp.wb.copy(hp.b).applyMatrix4(hp.obj.matrixWorld);
    }
    return actor.hitParts;
  };
  C.partCenter = function (actor, key, out) {
    out = out || new THREE.Vector3();
    const parts = C.updateHitParts(actor);
    const hp = parts.find((p) => p.key === key);
    if (!hp) return actor.centerPos(out);
    return out.addVectors(hp.wa, hp.wb).multiplyScalar(0.5);
  };

  // ------------------------------------------------------------------
  // Floating barks (DOM subtitles above heads)
  // ------------------------------------------------------------------
  let barkLayer = null;
  const barks = new Map(); // actor → {el, t, dur}
  function ensureLayer() {
    if (barkLayer) return barkLayer;
    barkLayer = document.createElement("div");
    barkLayer.className = "cmb-barks";
    document.body.appendChild(barkLayer);
    return barkLayer;
  }
  C.showBark = function (actor, text, dur) {
    if (!actor.inScene || G.SMOKE) {
      return;
    }
    if (actor.distToPlayer() > 40) return;
    ensureLayer();
    let b = barks.get(actor);
    if (!b) {
      const el = document.createElement("div");
      el.className = "cmb-bark";
      barkLayer.appendChild(el);
      b = { el };
      barks.set(actor, b);
    }
    b.el.innerHTML =
      '<span class="cmb-bark-name"></span><span class="cmb-bark-text"></span>';
    b.el.firstChild.textContent = actor.name;
    b.el.lastChild.textContent = text;
    b.t = 0;
    b.dur = dur || Math.min(6, 2.2 + text.length * 0.05);
    b.el.style.opacity = "0";
  };
  C.hideBark = function (actor) {
    const b = barks.get(actor);
    if (b) {
      b.el.remove();
      barks.delete(actor);
    }
  };
  C.clearBarks = function () {
    for (const b of barks.values()) b.el.remove();
    barks.clear();
  };
  const _proj = new THREE.Vector3();
  C.updateBarks = function (realDt) {
    if (!barks.size) return;
    const hideAll = G.state !== "play";
    const w = window.innerWidth,
      h = window.innerHeight;
    const shown = [];
    for (const [actor, b] of barks) {
      b.t += realDt;
      if (b.t > b.dur || !actor.inScene || (actor.dead && b.t > 0.5)) {
        b.el.remove();
        barks.delete(actor);
        continue;
      }
      _proj
        .set(actor.pos.x, actor.pos.y + actor.height + 0.35, actor.pos.z)
        .project(G.camera);
      const d = actor.distToPlayer();
      if (hideAll || _proj.z > 1 || _proj.z < -1 || d > 45) {
        b.el.style.opacity = "0";
        continue;
      }
      const sc = C.clamp(1.15 - d / 60, 0.7, 1.1);
      // true on-screen size: unscaled layout box × our scale (scale is anchored bottom-centre)
      const bw = (b.el.offsetWidth || 200) * sc,
        bh = (b.el.offsetHeight || 34) * sc;
      shown.push({
        b,
        d,
        sc,
        x: (_proj.x * 0.5 + 0.5) * w,
        y: (-_proj.y * 0.5 + 0.5) * h,
        bw,
        bh,
        fade:
          Math.min(1, b.t * 5, (b.dur - b.t) * 2) *
          C.clamp(1.3 - d / 40, 0.35, 1),
      });
    }
    // At most 3 subtitles at once (nearest speakers), so barks never flood the screen
    shown.sort((p, q) => p.d - q.d);
    for (let i = 3; i < shown.length; i++) shown[i].b.el.style.opacity = "0";
    if (shown.length > 3) shown.length = 3;
    // Clamp into the screen, then stack: each later (farther) bark climbs above whatever it overlaps
    const M = 8;
    const clampX = (S) => {
      S.x = C.clamp(S.x, S.bw / 2 + M, w - S.bw / 2 - M);
      S.y = C.clamp(S.y, S.bh + M, h - M);
    };
    for (let i = 0; i < shown.length; i++) {
      const A = shown[i];
      clampX(A);
      for (let pass = 0; pass < 6; pass++) {
        let moved = false;
        for (let j = 0; j < i; j++) {
          const B = shown[j];
          // boxes: x centred, y = bottom edge
          if (
            Math.abs(A.x - B.x) < (A.bw + B.bw) / 2 + 6 &&
            A.y > B.y - B.bh - 4 &&
            A.y - A.bh < B.y + 4
          ) {
            A.y = B.y - B.bh - 6;
            moved = true;
          }
        }
        if (!moved) break;
      }
      if (A.y - A.bh < M) {
        A.y = A.bh + M;
        A.b.el.style.opacity = "0";
        A.hidden = true;
      }
    }
    for (const S of shown) {
      if (S.hidden) continue;
      S.b.el.style.opacity = S.fade.toFixed(2);
      S.b.el.style.transformOrigin = "50% 100%";
      S.b.el.style.transform =
        "translate(" +
        Math.round(S.x) +
        "px," +
        Math.round(S.y) +
        "px) translate(-50%,-100%) scale(" +
        S.sc.toFixed(2) +
        ")";
    }
  };

  // ------------------------------------------------------------------
  // Public API: G.actors
  // ------------------------------------------------------------------
  const AP = G.actors;
  /** Spawn an actor. See CONTRACT §2 combat for def fields. */
  AP.spawn = function (def) {
    if (!def || !def.pos) {
      G.reportError("combat:spawn", new Error("actor def needs pos"));
      return null;
    }
    if (def.id && C.byId.has(def.id)) {
      // Re-spawning a stable id replaces the old instance (e.g. quest reload)
      AP.remove(C.byId.get(def.id));
    }
    let a;
    try {
      a = new Actor(def);
    } catch (e) {
      G.reportError("combat:spawn " + def.type, e);
      return null;
    }
    C.list.push(a);
    if (a.stableId) C.byId.set(a.id, a);
    // Talk / Search interactable
    a.interactable = G.world.addInteractable({
      getPos: () => a.interactPos(),
      radius: Math.max(0.55, Math.min(1.4, a.radius + 0.25)),
      label: () => a.name,
      verb: () =>
        a.dead ? "Search" : a.canPickpocket() ? "Pickpocket" : "Talk",
      enabled: () =>
        a.inScene && (a.dead ? !a.noSearch : a.canTalk() || a.canPickpocket()),
      onInteract: () =>
        a.dead ? a.search() : a.canPickpocket() ? a.pickpocket() : a.talk(),
      priority: 0.3,
      actor: a,
    });
    // Saved state for stable ids (applied after load)
    if (a.stableId && C.pendingState.has(a.id)) {
      C.applySavedActorState(a, C.pendingState.get(a.id));
      C.pendingState.delete(a.id);
    }
    // Initial AI setup
    if (C.initAI) C.initAI(a, def);
    if (a.distToPlayer() < C.ACTIVE_R || def.alwaysActive) a.attach();
    return a;
  };
  AP.list = () => C.list;
  AP.get = (id) => C.byId.get(id) || C.list.find((a) => a.id === id) || null;
  AP.find = (pred) => C.list.filter(pred);
