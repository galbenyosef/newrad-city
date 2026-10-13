// play-inline-626 03 — root
// Lines 380-499 of readable/play-inline-626.pretty.js (statement-aligned).
  function patchAdd() {
    if (addPatched) return;
    addPatched = true;
    const proto = THREE.Object3D.prototype,
      orig = proto.add;
    proto.add = function (object) {
      const r = orig.apply(this, arguments);
      for (let i = 0; i < arguments.length; i++) {
        const o = arguments[i];
        if (o && o.isObject3D) o.matrixWorldNeedsUpdate = true;
      }
      if (skipped.size && this !== G.scene) unskip(this);
      return r;
    };
  }
  function installSceneHook() {
    const sc = G.scene;
    if (
      !sc ||
      origSceneUMW ||
      sc.updateMatrixWorld !== THREE.Scene.prototype.updateMatrixWorld
    )
      return;
    patchAdd();
    origSceneUMW = sc.updateMatrixWorld;
    sc.updateMatrixWorld = function (force) {
      // the scene itself: identity unless someone really moved it → then three's own version
      const p = this.position,
        q = this.quaternion,
        k = this.scale;
      if (
        !F.enabled ||
        p.x !== 0 ||
        p.y !== 0 ||
        p.z !== 0 ||
        q._x !== 0 ||
        q._y !== 0 ||
        q._z !== 0 ||
        q._w !== 1 ||
        k.x !== 1 ||
        k.y !== 1 ||
        k.z !== 1 ||
        this.parent
      ) {
        return origSceneUMW.call(this, force);
      }
      if (this.matrixAutoUpdate) this.updateMatrix();
      if (this.matrixWorldNeedsUpdate || force) {
        this.matrixWorld.copy(this.matrix);
        this.matrixWorldNeedsUpdate = false;
      }
      const ch = this.children;
      for (let i = 0, l = ch.length; i < l; i++) {
        const c = ch[i];
        if (adoptedSet.has(c)) {
          if (c.matrixWorldAutoUpdate === true || force === true)
            c.updateMatrixWorld(force === true);
        } else c.updateMatrixWorld(true); // three's default: the scene's per-frame flag forces every other root
      }
    };
  }

  /**
   * Skip the maximal fully static subtrees of an adopted root (no auto-updating object, nothing pending):
   * matrixWorldAutoUpdate = false → three's pass (force=false) never walks into them. Re-run by the
   * rescans; anything that changes inside un-skips its ancestors again.
   */
  function isStaticSelf(o) {
    return (
      !o.matrixAutoUpdate &&
      !o.matrixWorldNeedsUpdate &&
      !o.isBone &&
      !o.isCamera &&
      !o.isLight &&
      !(o.userData && (o.userData.rpNoFreeze || o.userData.dynamic))
    );
  }
  function setSkip(o) {
    if (!skipped.has(o)) {
      skipped.add(o);
      o.matrixWorldAutoUpdate = false;
    }
  }
  function markStatic(o) {
    let st = isStaticSelf(o);
    const kids = o.children,
      n = kids.length;
    if (!n) return st;
    const res = new Array(n);
    for (let i = 0; i < n; i++) {
      res[i] = markStatic(kids[i]);
      if (!res[i]) st = false;
    }
    if (!st)
      for (let i = 0; i < n; i++)
        if (res[i] && kids[i].children.length) setSkip(kids[i]);
    return st;
  }
  R.freezeEvalSkip = function (root) {
    if (!F.enabled || !root || !adoptedSet.has(root) || root.parent !== G.scene)
      return false;
    if (skipped.has(root)) return true;
    if (root.userData && root.userData.rpNoFreeze) return false;
    const st = markStatic(root);
    if (st) setSkip(root);
    F.skipped = skipped.size;
    return st;
  };

  /** Undo everything (module off / debugging). */
  R.freezeReleaseAll = function () {
    if (origSceneUMW && G.scene) {
      G.scene.updateMatrixWorld = origSceneUMW;
      origSceneUMW = null;
    }
    for (const r of Array.from(skipped)) unskip(r);
    for (let i = F.objs.length - 1; i >= 0; i--) releaseAt(i);
    F.cand.length = 0;
    known = new WeakSet(); // a later re-adopt starts from scratch
  };
