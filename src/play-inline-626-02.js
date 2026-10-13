// play-inline-626 02 — snap
// Lines 41-379 of readable/play-inline-626.pretty.js (statement-aligned).
  const R = G.renderPerf._;

  const MOVERS =
    /(^|[^a-z])(container\w*|doors?|lids?|hinges?|gates?|fans?|rotors?|elevators?|needles?|dials?|blades?|propellers?|wheels?|flags?|arms?|hands?|pendulums?|clocks?|swings?|sway\w*|flicker\w*|anim\w*)($|[^a-z])/i;
  let known = new WeakSet(); // objects already observed / frozen / rejected
  const mine = new WeakSet(); // currently frozen by us
  const F = (R.freeze = {
    enabled: R.QS.get("rpfreeze") !== "0",
    cand: [],
    objs: [],
    roots: [],
    parents: [],
    snap: new Float64Array(0),
    changes: new Uint8Array(0),
    frozen: 0,
    released: 0,
    checkMs: 0,
    observeIdx: 0,
    frame: 0,
    skipped: 0,
  });
  const skipped = new Set(); // fully static subtrees (any depth) the scene pass no longer walks
  const adoptedSet = new WeakSet();

  function topRoot(o) {
    let r = o;
    while (r.parent && r.parent !== G.scene) r = r.parent;
    return r;
  }
  /** Un-skip every skipped ancestor of `o` (and `o` itself). */
  function unskip(o) {
    if (!skipped.size) return;
    for (let a = o; a && a !== G.scene; a = a.parent)
      if (skipped.has(a)) {
        skipped.delete(a);
        a.matrixWorldAutoUpdate = true;
      }
    F.skipped = skipped.size;
  }
  function inSkipped(o) {
    if (!skipped.size) return false;
    for (let a = o; a && a !== G.scene; a = a.parent)
      if (skipped.has(a)) return true;
    return false;
  }

  function takeSnap(o, arr, b) {
    const p = o.position,
      q = o.quaternion,
      s = o.scale;
    arr[b] = p.x;
    arr[b + 1] = p.y;
    arr[b + 2] = p.z;
    arr[b + 3] = q._x;
    arr[b + 4] = q._y;
    arr[b + 5] = q._z;
    arr[b + 6] = q._w;
    arr[b + 7] = s.x;
    arr[b + 8] = s.y;
    arr[b + 9] = s.z;
  }
  function sameSnap(o, arr, b) {
    const p = o.position,
      q = o.quaternion,
      s = o.scale;
    return (
      arr[b] === p.x &&
      arr[b + 1] === p.y &&
      arr[b + 2] === p.z &&
      arr[b + 3] === q._x &&
      arr[b + 4] === q._y &&
      arr[b + 5] === q._z &&
      arr[b + 6] === q._w &&
      arr[b + 7] === s.x &&
      arr[b + 8] === s.y &&
      arr[b + 9] === s.z
    );
  }

  // objects referenced by interactables (optional stricter mode: ?rpfreeze=strict)
  function interactableObjects() {
    const set = new Set();
    const W = G.world;
    if (!W || !W.interactables) return set;
    for (const it of W.interactables) {
      for (const k of [
        "object3d",
        "obj",
        "mesh",
        "model",
        "root",
        "group",
        "node",
      ]) {
        const o = it[k];
        if (o && o.isObject3D) o.traverse((c) => set.add(c));
      }
    }
    return set;
  }

  /** Register the transformable objects under an adopted static root (re-run by the rescans: new objects only). */
  R.freezeAdopt = function (root) {
    if (!F.enabled || !root) return;
    guardRoot(root);
    // (interactable props — terminals, footlockers, safes — are frozen too: a lid that opens is caught by the per-frame check)
    const skip =
      F._skip ||
      (F._skip =
        R.QS.get("rpfreeze") === "strict" ? interactableObjects() : new Set());
    const now = performance.now();
    (function walk(o) {
      if (o.userData && (o.userData.rpNoFreeze || o.userData.rpNoCull)) return;
      if (o.name && MOVERS.test(o.name)) return; // the whole moving sub-assembly stays live
      if (!known.has(o)) {
        known.add(o);
        if (
          o.matrixAutoUpdate &&
          !o.isBone &&
          !o.isCamera &&
          !o.isLight &&
          !o.isSkinnedMesh &&
          !(o.userData && (o.userData.rpNoFreeze || o.userData.dynamic)) &&
          !skip.has(o)
        ) {
          const c = { o, t: now, n: 0, s: new Float64Array(10), p: o.parent };
          takeSnap(o, c.s, 0);
          F.cand.push(c);
        }
      }
      for (const c of o.children) walk(c);
    })(root);
  };

  function growArrays(n) {
    if (F.snap.length >= n * 10) return;
    const cap = Math.max(n, (F.objs.length * 1.5) | 0, 1024);
    const s = new Float64Array(cap * 10);
    s.set(F.snap);
    F.snap = s;
    const ch = new Uint8Array(cap);
    ch.set(F.changes);
    F.changes = ch;
  }
  function freezeObj(c) {
    const o = c.o;
    const i = F.objs.length;
    growArrays(i + 1);
    o.updateMatrix(); // make sure the frozen local matrix is current
    o.matrixWorldNeedsUpdate = true;
    o.matrixAutoUpdate = false;
    mine.add(o);
    F.objs.push(o);
    F.parents.push(o.parent);
    F.roots.push(topRoot(o));
    takeSnap(o, F.snap, i * 10);
    F.changes[i] = 0;
    F.frozen++;
  }
  function releaseAt(i) {
    const o = F.objs[i];
    if (o) {
      o.matrixAutoUpdate = true;
      o.matrixWorldNeedsUpdate = true;
      mine.delete(o);
      unskip(o);
    }
    const last = F.objs.length - 1;
    if (i !== last) {
      F.objs[i] = F.objs[last];
      F.parents[i] = F.parents[last];
      F.roots[i] = F.roots[last];
      F.changes[i] = F.changes[last];
      F.snap.copyWithin(i * 10, last * 10, last * 10 + 10);
    }
    F.objs.pop();
    F.parents.pop();
    F.roots.pop();
    F.frozen--;
    F.released++;
  }

  /** Observation: candidates unchanged for 4 s get frozen (time-sliced). */
  R.freezeObserve = function (budget) {
    if (!F.enabled || !F.cand.length) return;
    const now = performance.now();
    let n = Math.min(budget, F.cand.length);
    while (n-- > 0 && F.cand.length) {
      if (F.observeIdx >= F.cand.length) F.observeIdx = 0;
      const i = F.observeIdx;
      const c = F.cand[i];
      const o = c.o;
      let drop = false;
      if (!o.parent || !o.matrixAutoUpdate)
        drop = true; // gone, or the owner manages the matrix itself
      else if (!sameSnap(o, c.s, 0) || o.parent !== c.p) {
        takeSnap(o, c.s, 0);
        c.p = o.parent;
        c.t = now;
        if (++c.n > 3) drop = true; // animated: never freeze
      } else if (now - c.t > 4000) {
        freezeObj(c);
        drop = true;
      }
      if (drop) {
        F.cand[i] = F.cand[F.cand.length - 1];
        F.cand.pop();
      } else F.observeIdx++;
    }
  };

  /** A change we detected: refresh now; inside a skipped subtree push the world matrices down ourselves. */
  function refreshed(o) {
    o.matrixWorldNeedsUpdate = true;
    if (o.parent && inSkipped(o)) o.updateMatrixWorld(true);
  }

  /** Every frame, right before the render: refresh frozen objects an owner touched. */
  R.freezeCheck = function () {
    if (!F.enabled) return;
    const t0 = performance.now();
    const fr = ++F.frame;
    guardCheck(fr & 7);
    const objs = F.objs,
      snap = F.snap,
      par = F.parents,
      roots = F.roots;
    const sl = fr & 3,
      sl8 = fr & 7;
    for (let i = objs.length - 1; i >= 0; i--) {
      const o = objs[i];
      if (o.parent !== par[i]) {
        if (!o.parent) {
          releaseAt(i);
          continue;
        } // left the scene (pooled / removed)
        par[i] = o.parent; // reparented: world matrix must follow
        roots[i] = topRoot(o);
        unskip(o); // its new parent chain must be walked again
        refreshed(o);
      }
      if (o.matrixAutoUpdate) {
        releaseAt(i);
        continue;
      } // an owner took it back
      // objects under a hidden root (interior cells while outside…) are checked on an 8-frame rotation
      if (!roots[i].visible && (i & 7) !== sl8) continue;
      const b = i * 10,
        p = o.position,
        q = o.quaternion;
      let ch =
        snap[b] !== p.x ||
        snap[b + 1] !== p.y ||
        snap[b + 2] !== p.z ||
        snap[b + 3] !== q._x ||
        snap[b + 4] !== q._y ||
        snap[b + 5] !== q._z ||
        snap[b + 6] !== q._w;
      if (!ch && (i & 3) === sl) {
        const s = o.scale;
        ch = snap[b + 7] !== s.x || snap[b + 8] !== s.y || snap[b + 9] !== s.z;
      }
      if (ch) {
        o.updateMatrix();
        takeSnap(o, snap, b);
        refreshed(o);
        if (++F.changes[i] >= 3) releaseAt(i); // it moves: hand it back to three
      }
    }
    F.checkMs = performance.now() - t0;
  };

  // ------------------------------------------------------------------
  // Guard for owner-managed (matrixAutoUpdate=false) objects inside adopted roots
  // ------------------------------------------------------------------
  const guard = { objs: [], roots: [], snap: new Float64Array(0) };
  const guardKnown = new WeakSet();
  let origSceneUMW = null;
  function guardAdd(o, root) {
    const i = guard.objs.length;
    if (guard.snap.length < (i + 1) * 6) {
      const n = new Float64Array(Math.max(4096, (i + 1) * 12));
      n.set(guard.snap);
      guard.snap = n;
    }
    guard.objs.push(o);
    guard.roots.push(root);
    const e = o.matrix.elements,
      b = i * 6;
    guard.snap[b] = e[0];
    guard.snap[b + 1] = e[5];
    guard.snap[b + 2] = e[10];
    guard.snap[b + 3] = e[12];
    guard.snap[b + 4] = e[13];
    guard.snap[b + 5] = e[14];
  }
  function guardRoot(root) {
    adoptedSet.add(root);
    root.traverse((o) => {
      if (!o.matrixAutoUpdate && !guardKnown.has(o) && !mine.has(o)) {
        guardKnown.add(o);
        guardAdd(o, root);
      }
    });
    installSceneHook();
  }
  function guardCheck(slice) {
    const objs = guard.objs,
      s = guard.snap;
    for (let i = slice; i < objs.length; i += 8) {
      const o = objs[i];
      if (o.matrixAutoUpdate) {
        unskip(o);
        continue;
      } // the owner switched it to auto-update
      const e = o.matrix.elements,
        b = i * 6;
      if (
        s[b] !== e[0] ||
        s[b + 1] !== e[5] ||
        s[b + 2] !== e[10] ||
        s[b + 3] !== e[12] ||
        s[b + 4] !== e[13] ||
        s[b + 5] !== e[14]
      ) {
        s[b] = e[0];
        s[b + 1] = e[5];
        s[b + 2] = e[10];
        s[b + 3] = e[12];
        s[b + 4] = e[13];
        s[b + 5] = e[14];
        refreshed(o);
      }
    }
  }

  // Object3D.add flags every newly added object (so it always gets a world matrix, even inside an adopted
  // root that is no longer force-updated) and un-skips the root it was added to.
  let addPatched = false;
