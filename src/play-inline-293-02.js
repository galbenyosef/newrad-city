// play-inline-293 02 — rec
// Lines 16-223 of readable/play-inline-293.pretty.js (statement-aligned).
  const PM = G._pm2;

  PM.doorsList = [];
  /** Coloured standalone mesh for a door leaf (white vertex colour like the batch materials expect). */
  function leafMesh(key, w, h, t) {
    const g = new THREE.BoxGeometry(w, h, t);
    g.translate(w / 2, h / 2, 0); // hinge at local x = 0, bottom at y = 0
    const n = g.attributes.position.count,
      col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const y = g.attributes.position.getY(i);
      const k = 0.6 + 0.4 * Math.min(1, y / 1.5);
      col[i * 3] = col[i * 3 + 1] = col[i * 3 + 2] = k;
    }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    // world-ish UVs in metres so wood/steel textures read at the right scale
    const uv = g.attributes.uv;
    for (let i = 0; i < uv.count; i++)
      uv.setXY(i, (uv.getX(i) * w) / 2, (uv.getY(i) * h) / 2);
    const m = new THREE.Mesh(g, PM.mat(key));
    m.castShadow = false;
    m.receiveShadow = true;
    return m;
  }
  /**
   * def: {id, x, y, z (hinge point, floor level), ry (leaf faces +Z rotated by ry, extends along local +X),
   *       w, h, t, key (material), parent, lock ({id, label, key?|code?} for G.locks), label, openAngle (default -1.6),
   *       pivot:'centre' (bookcase), cond()→bool (extra gate, e.g. quest flag), lockedText, onOpen(), panel(mesh) (extra dressing)}
   */
  PM.swingDoor = function (def) {
    const d = Object.assign(
      { w: 1.1, h: 2.3, t: 0.08, key: "oak", openAngle: -1.6, lock: null },
      def,
    );
    if (d.lock)
      PM.lockReg(Object.assign({ kind: "door", label: d.label }, d.lock));
    const pivot = new THREE.Group();
    pivot.position.set(d.x, d.y, d.z);
    pivot.rotation.y = d.ry || 0;
    const leaf = d.mesh || leafMesh(d.key, d.w, d.h, d.t);
    if (d.pivot === "centre" && !d.mesh) leaf.position.x = -d.w / 2;
    pivot.add(leaf);
    if (d.dress) d.dress(pivot);
    (d.parent || G.scene).add(pivot);
    const c = Math.cos(d.ry || 0),
      s = Math.sin(d.ry || 0);
    const off = d.pivot === "centre" ? 0 : d.w / 2;
    const cx = d.x + c * off,
      cz = d.z - s * off;
    const rec = {
      def: d,
      pivot,
      leaf,
      open: false,
      t: 0,
      target: 0,
      collider: null,
      locked: d.lock ? 1 : 0,
    };
    rec.addCol = () => {
      if (!rec.collider)
        rec.collider = PM.col(
          cx,
          cz,
          d.w,
          Math.max(0.2, d.t + 0.1),
          d.y,
          d.y + d.h,
          d.ry || 0,
          { walkable: false, surface: "wood", tag: "pm2_door" },
        );
    };
    rec.remCol = () => {
      if (rec.collider) {
        try {
          G.world.removeCollider(rec.collider);
        } catch (e) {
          /* core */
        }
        rec.collider = null;
      }
    };
    rec.addCol();
    const flagKey = "door_" + d.id;
    PM.flagDefaults[flagKey] = 0; // 0 closed & locked as defined, 1 unlocked, 2 open
    rec.setState = (st, instant) => {
      rec.locked =
        st >= 1 ||
        (d.lock &&
          PM.locksLive() &&
          G.locks.isOpen &&
          G.locks.isOpen(d.lock.id))
          ? 0
          : d.lock
            ? 1
            : 0;
      rec.open = st >= 2;
      rec.target = rec.open ? d.openAngle : 0;
      if (instant) {
        rec.t = rec.target;
        leafPose(rec);
      }
      if (rec.open) rec.remCol();
      else rec.addCol();
    };
    rec.doOpen = () => {
      PM.setFlag(flagKey, 2);
      rec.setState(2);
      PM.sfx(d.sound || "door_open", new THREE.Vector3(cx, d.y + 1, cz));
      if (d.onOpen) PM.safe("door:onOpen", d.onOpen);
    };
    rec.unlock = () => {
      if ((PM.flag(flagKey) || 0) < 1) PM.setFlag(flagKey, 1);
      rec.locked = 0;
      if (d.lock)
        PM.safe("door:unlock", () => {
          if (PM.locksLive() && G.locks.unlock) G.locks.unlock(d.lock.id);
        });
    };
    const ipos = new THREE.Vector3(
      cx + s * 0.15,
      d.y + Math.min(1.3, d.h * 0.5),
      cz + c * 0.15,
    );
    rec.interact = PM.use({
      pos: ipos,
      radius: Math.max(0.7, d.w * 0.55),
      range: 2.8,
      priority: 1,
      label: () => d.label || "Door",
      verb: () =>
        rec.open
          ? "Close"
          : rec.locked || (d.cond && !d.cond())
            ? "Unlock"
            : "Open",
      locked: () => {
        if (rec.open) return null;
        if (d.cond && !d.cond()) return d.lockedText || "Sealed";
        return rec.locked ? "Locked" : null;
      },
      onInteract() {
        if (rec.open) {
          PM.setFlag(flagKey, 1);
          rec.setState(1);
          PM.sfx("door_open", ipos, { pitch: 0.8 });
          return;
        }
        if (d.cond && !PM.safe("door:cond", d.cond)) {
          PM.sfx("door_locked", ipos);
          G.notify(d.lockedText || "It won't budge.");
          return;
        }
        if (rec.locked) {
          if (
            !PM.locksLive() &&
            !(d.lock.key && PM.inv.count(d.lock.key) > 0)
          ) {
            PM.sfx("door_locked", ipos);
            G.notify(d.lockedText || "This door is locked.");
            return;
          }
          PM.lockOpen(d.lock, () => {
            rec.unlock();
            rec.doOpen();
          });
          return;
        }
        rec.doOpen();
      },
    });
    PM.doorsList.push(rec);
    return rec;
  };
  function leafPose(rec) {
    if (rec.def.slide) {
      rec.leaf.position.x = (rec.t / rec.def.openAngle) * rec.def.slide;
      return;
    }
    rec.leaf.rotation.y = rec.t;
  }
  PM.updaters.push(function (dt) {
    for (const r of PM.doorsList) {
      if (Math.abs(r.t - r.target) < 1e-3) continue;
      const sp = 2.4 * (dt || 0.016);
      r.t += Math.max(-sp, Math.min(sp, r.target - r.t));
      leafPose(r);
    }
  });
  /** Unlock a door from script (terminal, dialogue). open=true also swings it. */
  PM.unlockDoor = function (id, open) {
    const r = PM.doorsList.find((x) => x.def.id === id);
    if (!r) return;
    if (open) r.doOpen();
    else {
      r.unlock();
    }
  };
  function applyAll(instant) {
    for (const r of PM.doorsList)
      r.setState(PM.flag("door_" + r.def.id) || 0, instant);
  }
  PM.onReset.push(() => applyAll(true));
  PM.onNewGame.push(() => applyAll(true));
  PM.onLoaded.push(() => applyAll(true));
  PM.flagWatch.push((k) => {
    if (k === "*") applyAll(true);
  });
