// play-inline-468 07 — far
// Lines 3398-3746 of readable/play-inline-468.pretty.js (statement-aligned).
  function rebuildBatch(P) {
    const list = P.members.filter(
      (ch) =>
        ch.root.parent === P.parent &&
        !ch.hidden &&
        ch.root.visible &&
        ch.tpl._farGeo,
    );
    let nv = 0,
      ni = 0;
    for (const ch of list) {
      const g = ch.tpl._farGeo;
      nv += g.attributes.position.count;
      ni += g.index ? g.index.count : g.attributes.position.count;
    }
    if (P.mesh) {
      P.mesh.geometry.dispose();
      P.mesh.visible = false;
    }
    if (!nv) return;
    const pos = new Float32Array(nv * 3),
      nor = new Float32Array(nv * 3),
      col = new Float32Array(nv * 3),
      uv = new Float32Array(nv * 2),
      pbr = new Float32Array(nv * 3),
      part = new Float32Array(nv),
      cls = new Float32Array(nv);
    const idx = new Uint32Array(ni);
    let vo = 0,
      io = 0;
    for (const ch of list) {
      const g = ch.tpl._farGeo,
        n = g.attributes.position.count;
      ch.root.updateMatrix();
      _bm.copy(ch.root.matrix);
      _bn.getNormalMatrix(_bm);
      const e = _bm.elements,
        ne = _bn.elements;
      const P3 = g.attributes.position.array,
        N3 = g.attributes.normal.array,
        C3 = g.attributes.color ? g.attributes.color.array : null;
      const t = ch.material.userData.uniforms.uTints.value[1],
        k = ch.material.userData.uniforms.uTints.value[2];
      for (let i = 0; i < n; i++) {
        const x = P3[i * 3],
          y = P3[i * 3 + 1],
          z = P3[i * 3 + 2],
          o = (vo + i) * 3;
        pos[o] = e[0] * x + e[4] * y + e[8] * z + e[12];
        pos[o + 1] = e[1] * x + e[5] * y + e[9] * z + e[13];
        pos[o + 2] = e[2] * x + e[6] * y + e[10] * z + e[14];
        const a = N3[i * 3],
          b = N3[i * 3 + 1],
          c = N3[i * 3 + 2];
        nor[o] = ne[0] * a + ne[3] * b + ne[6] * c;
        nor[o + 1] = ne[1] * a + ne[4] * b + ne[7] * c;
        nor[o + 2] = ne[2] * a + ne[5] * b + ne[8] * c;
        const cl = g.attributes.mcls ? g.attributes.mcls.array[i] : 0,
          tt = cl === 1 ? t : cl === 2 ? k : null;
        const r = C3 ? C3[i * 3] : 1,
          gg = C3 ? C3[i * 3 + 1] : 1,
          bb = C3 ? C3[i * 3 + 2] : 1;
        col[o] = tt ? r * tt.r : r;
        col[o + 1] = tt ? gg * tt.g : gg;
        col[o + 2] = tt ? bb * tt.b : bb;
      }
      if (g.attributes.uv) uv.set(g.attributes.uv.array, vo * 2);
      if (g.attributes.pbr) pbr.set(g.attributes.pbr.array, vo * 3);
      if (g.attributes.partId) part.set(g.attributes.partId.array, vo);
      if (g.attributes.mcls) {
        const m = g.attributes.mcls.array;
        for (let i = 0; i < n; i++)
          cls[vo + i] = m[i] === 1 || m[i] === 2 ? 0 : m[i];
      } // tint already baked
      if (g.index) {
        const ia = g.index.array;
        for (let i = 0; i < ia.length; i++) idx[io++] = ia[i] + vo;
      } else for (let i = 0; i < n; i++) idx[io++] = vo + i;
      vo += n;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    geo.setAttribute("pbr", new THREE.BufferAttribute(pbr, 3));
    geo.setAttribute("partId", new THREE.BufferAttribute(part, 1));
    geo.setAttribute("mcls", new THREE.BufferAttribute(cls, 1));
    geo.setIndex(new THREE.BufferAttribute(idx, 1));
    geo.computeBoundingSphere();
    if (!P.mat) {
      P.mat = L.makeMaterial();
      P.mat.userData.uniforms.uDirt.value = 0.35;
    }
    if (!P.mesh) {
      P.mesh = new THREE.Mesh(geo, P.mat);
      P.mesh.name = "charFarCrowd";
      P.mesh.castShadow = false;
      P.mesh.receiveShadow = true;
      P.mesh.matrixAutoUpdate = false;
      P.parent.add(P.mesh);
    } else P.mesh.geometry = geo;
    P.mesh.visible = true;
    // remember where everyone was baked (moved / hidden → rebuild)
    for (const ch of P.members) {
      const q = ch.root.position;
      ch._farAt = [
        q.x,
        q.y,
        q.z,
        ch.root.rotation.y,
        ch.hidden || !ch.root.visible ? 1 : 0,
      ];
    }
  }
  /**
   * Is the character actually rendered? (not disposed / hidden, root visible
   * and every ancestor visible up to a scene — an interior cell whose root is
   * hidden hides its NPCs too).
   */
  L.charShown = function (ch) {
    if (ch.disposed || ch.hidden || !ch.root.visible) return false;
    let o = ch.root.parent,
      n = 0;
    while (o && n++ < 48) {
      if (!o.visible) return false;
      if (o.isScene || !o.parent) return !!o.isScene;
      o = o.parent;
    }
    return false;
  };
  /**
   * Fresh horizontal camera distance² for budget ranking (Infinity when not
   * rendered). _camD2 is only refreshed while a character ticks, so hidden /
   * detached ones keep a stale (often tiny) value from when the player was near.
   */
  function visD2(ch, cam) {
    if (!cam || !L.charShown(ch)) return Infinity;
    let x, z;
    if (ch.root.parent === G.scene) {
      x = ch.root.position.x;
      z = ch.root.position.z;
    } else {
      const e = ch.root.matrixWorld.elements;
      x = e[12];
      z = e[14];
    }
    const dx = x - cam.x,
      dz = z - cam.z;
    return dx * dx + dz * dz;
  }
  /** Per-frame: far-tier decisions (every few frames), batch rebuilds, shadow budget. */
  L.crowdUpdate = function () {
    const cam = G.camera ? G.camera.position : null;
    FAR.frame++;
    // refresh the rendered-distance cache every other frame (used by the live /
    // shadow budgets below and by the face prefetch in 90_module)
    if (FAR.frame % 2 === 0) for (const ch of LIVE) ch._visD2 = visD2(ch, cam);
    if (cam && FAR.frame % 6 === 0) {
      // ---- decide who is far (hidden members never take a live slot) ----
      const crowd = [];
      for (const ch of LIVE)
        if (ch.crowd && !ch.disposed && ch.root.parent) crowd.push(ch);
      for (const ch of crowd)
        if (ch._visD2 === undefined) ch._visD2 = visD2(ch, cam);
      crowd.sort((a, b) =>
        a._visD2 === b._visD2 ? 0 : a._visD2 < b._visD2 ? -1 : 1,
      );
      const d2far = FAR.dist * FAR.dist,
        d2near = (FAR.dist - 4) * (FAR.dist - 4);
      crowd.forEach((ch, rank) => {
        const d2 = ch._visD2;
        const idle =
          !ch.dead &&
          !ch.one &&
          !ch._getup &&
          !ch._dissolve &&
          !ch.hidden &&
          ch.root.visible &&
          ch.speedM < 0.2 &&
          !(ch.face && ch.face.isTalking && ch.face.isTalking()) &&
          ch._posed;
        const over = rank >= FAR.budget && d2 > 18 * 18;
        if (ch._far) {
          if (!idle || (d2 < d2near && !over)) ch._farExit();
          else if (ch._farAt) {
            const q = ch.root.position,
              f = ch._farAt;
            if (
              Math.abs(q.x - f[0]) +
                Math.abs(q.y - f[1]) +
                Math.abs(q.z - f[2]) >
                0.05 ||
              Math.abs(ch.root.rotation.y - f[3]) > 0.02
            )
              ch._far.dirty = true;
          }
        } else if (idle && (d2 > d2far || over) && ch.autoFar !== false)
          ch._farEnter();
      });
    }
    for (const [key, P] of FAR.pools) {
      if (!P.members.length) {
        if (P.mesh) P.mesh.visible = false;
        if (++P.idle > 600) {
          // unused ~10 s: free it
          if (P.mesh) {
            P.parent.remove(P.mesh);
            P.mesh.geometry.dispose();
          }
          if (P.mat) P.mat.dispose();
          FAR.pools.delete(key);
        }
        continue;
      }
      P.idle = 0;
      // hidden/shown members (interiors toggling actors) → rebuild
      if (!P.dirty && FAR.frame % 6 === 3)
        for (const ch of P.members) {
          const h = ch.hidden || !ch.root.visible ? 1 : 0;
          if (!ch._farAt || ch._farAt[4] !== h) {
            P.dirty = true;
            break;
          }
        }
      if (P.dirty) {
        P.dirty = false;
        rebuildBatch(P);
      }
    }
    // ---- shadow budget: only the N nearest characters cast shadows ----
    if (FAR.frame % 4 === 0) {
      const cand = [];
      for (const ch of LIVE) {
        if (ch.disposed || !ch.root.parent || ch._far) continue;
        if (ch._visD2 === undefined) ch._visD2 = visD2(ch, cam);
        const d2 = ch._visD2;
        if (d2 === Infinity) {
          ch._shadowOk = false;
          ch.mesh.castShadow = false;
        } // hidden (interior cell / hidden rig): no slot
        else if (d2 < 3600) cand.push(ch);
        else ch._shadowOk = true;
      }
      if (cand.length > FAR.shadows) cand.sort((a, b) => a._visD2 - b._visD2);
      for (let i = 0; i < cand.length; i++) {
        const ok = i < FAR.shadows;
        cand[i]._shadowOk = ok;
        if (!ok) cand[i].mesh.castShadow = false;
      }
    }
  };
  /**
   * Budgets for crowded places: {live, farDist, shadows} or a number (= live).
   * live: crowd members animated at full rig (nearest first; the rest freeze
   * into the per-scene far batch once > 18 m away); farDist: distance beyond
   * which standing crowd members always freeze; shadows: shadow casters.
   */
  C.setCrowdBudget = function (o) {
    if (typeof o === "number") o = { live: o };
    o = o || {};
    if (o.live !== undefined) FAR.budget = Math.max(0, o.live | 0);
    if (o.farDist !== undefined)
      FAR.dist = Math.max(12, Number(o.farDist) || 42);
    if (o.shadows !== undefined) FAR.shadows = Math.max(0, o.shadows | 0);
    return { live: FAR.budget, farDist: FAR.dist, shadows: FAR.shadows };
  };
  C.crowdStats = function () {
    let far = 0,
      pools = 0;
    for (const [, P] of FAR.pools) {
      far += P.members.length;
      if (P.members.length && P.mesh && P.mesh.visible) pools++;
    }
    let crowd = 0,
      shadows = 0;
    for (const ch of LIVE) {
      if (ch.crowd && !ch.disposed) crowd++;
      if (ch.mesh.castShadow && ch.mesh.visible && ch.root.parent) shadows++;
    }
    return {
      crowd,
      far,
      farDrawCalls: pools,
      shadowCasters: shadows,
      budget: FAR.budget,
      farDist: FAR.dist,
      shadowBudget: FAR.shadows,
    };
  };

  /** Build (or bump) the shared template a create(type, opts) would use — no Character. */
  L.warmTemplate = function (type, opts) {
    const r = resolveType(type, opts || {});
    if (!r || !L.infos[r.base]) return null;
    return templateFor(r.base, r.opts).tpl;
  };

  // ------------------------------------------------------------------
  // PUBLIC API
  // ------------------------------------------------------------------
  C.create = function (type, opts) {
    opts = opts || {};
    let r = resolveType(type, opts);
    let info = r && L.infos[r.base];
    if (!info) {
      // Unknown type (typo / not-yet-supported creature): never throw — warn once and
      // build the closest known body plan so quests & landmarks still get an actor.
      warnUnknown(type, "create");
      r = resolveType(fallbackType(type), opts);
      info = r && L.infos[r.base];
      if (!info) {
        r = {
          base: "human",
          opts: Object.assign({}, opts, { outfit: "settler" }),
        };
        info = L.infos.human;
      }
    }
    const tf = templateFor(r.base, r.opts);
    const tpl = tf.tpl,
      seed = tf.seed;
    if (tf.ratios.skin || tf.ratios.hair) r.opts._ratios = tf.ratios;
    const ch = new Character(String(type), r.base, tpl, info, r.opts, seed);
    if (opts.addToScene !== false && G.scene) G.scene.add(ch.root);
    if (opts.pos)
      ch.root.position.set(opts.pos.x || 0, opts.pos.y || 0, opts.pos.z || 0);
    if (opts.yaw !== undefined) ch.root.rotation.y = opts.yaw;
    ch._lastPos.set(NaN, 0, 0);
    if (opts.anim) ch.setAnim(opts.anim, { inPlace: !!opts.inPlace });
    if (opts.weapon && opts.weapon.isObject3D)
      ch.setWeapon(opts.weapon, opts.hold);
    else if (
      typeof opts.weapon === "string" &&
      !G.isStub("weapons") &&
      G.weapons.createWorldModel
    ) {
      try {
        const w = G.weapons.createWorldModel(opts.weapon);
        if (w) {
          w.userData.weaponId = w.userData.weaponId || opts.weapon;
          ch.setWeapon(w, opts.hold);
        }
      } catch (e) {
        /* weapons optional */
      }
    }
    return ch;
  };
