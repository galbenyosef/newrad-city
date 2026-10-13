// play-inline-148 08 — key
// Lines 2066-2211 of readable/play-inline-148.pretty.js (statement-aligned).
  Batch.prototype.build = function (parent, o) {
    o = o || {};
    const group = new THREE.Group();
    group.name = "pu_" + this.name;
    const byKey = new Map();
    for (const it of this.items) {
      let key = it.key;
      if (
        this.lit &&
        !isEmissive(key) &&
        key.indexOf("tex:") !== 0 &&
        !it.noBake
      ) {
        bake(it.g, this.lights, this.ambient);
        key = key + "@lit";
      } else if (this.lit && key.indexOf("tex:") === 0 && !it.noBake) {
        bake(it.g, this.lights, this.ambient);
        key = key + "@lit";
      }
      let arr = byKey.get(key);
      if (!arr) {
        arr = [];
        byKey.set(key, arr);
      }
      arr.push(it.g);
    }
    for (const [key, arr] of byKey) {
      // bakes/no-bakes of one material must share attribute sets → split by attribute signature
      const sigs = new Map();
      for (const g of arr) {
        const s = Object.keys(g.attributes).sort().join(",");
        let a = sigs.get(s);
        if (!a) {
          a = [];
          sigs.set(s, a);
        }
        a.push(g);
      }
      for (const list of sigs.values()) {
        let chunk = [],
          cnt = 0;
        const flush = () => {
          if (!chunk.length) return;
          let geo = mergeAll(chunk);
          for (const g of chunk) g.dispose();
          let mat =
            key.indexOf("tex:") === 0
              ? P.mat(key.replace("@lit", ""))
              : P.mat(key);
          if (key.indexOf("tex:") === 0 && key.slice(-4) === "@lit")
            mat = texBaked(key);
          // o.mergeInto (a group built earlier, e.g. the site's main batch): append to its mesh of the same
          // material + attribute set instead of adding a new draw call (clutter/decay passes after the build)
          if (o.mergeInto) {
            const sig = Object.keys(geo.attributes).sort().join(",");
            const host = o.mergeInto.children.find(
              (m) =>
                m.isMesh &&
                m.material === mat &&
                !m.userData.puNoMerge &&
                Object.keys(m.geometry.attributes).sort().join(",") === sig &&
                m.geometry.attributes.position.count +
                  geo.attributes.position.count <
                  600000,
            );
            if (host) {
              const old = host.geometry;
              host.geometry = mergeAll([old, geo]);
              old.dispose();
              geo.dispose();
              P.mergedDecay = (P.mergedDecay || 0) + 1;
              chunk = [];
              cnt = 0;
              return;
            }
          }
          const mesh = new THREE.Mesh(geo, mat);
          mesh.name = this.name + ":" + key;
          const bk = baseKey(key);
          mesh.castShadow = !!o.shadow && !NO_SHADOW.has(bk) && !DETAIL.has(bk);
          mesh.receiveShadow = o.receive !== false;
          mesh.matrixAutoUpdate = false;
          mesh.updateMatrix();
          group.add(mesh);
          if (
            o.lod &&
            (DETAIL.has(bk) || geo.attributes.position.count < 3000)
          ) {
            try {
              G.world.addLOD(
                mesh,
                o.lod + geo.boundingSphere.radius,
                geo.boundingSphere.center.clone(),
              );
            } catch (e) {
              /* core */
            }
          }
          chunk = [];
          cnt = 0;
        };
        for (const g of list) {
          chunk.push(g);
          cnt += g.attributes.position.count;
          if (cnt > 500000) flush();
        }
        flush();
      }
    }
    this.items = [];
    if (parent) parent.add(group);
    return group;
  };
  function texBaked(key) {
    if (matCache[key]) return matCache[key];
    return (matCache[key] = bakedVariant(P.mat(key.slice(0, -4)), key));
  }

  /** Flip a geometry inside-out (non-indexed result). */
  P.flipGeo = function (geo) {
    const g = geo.index ? geo.toNonIndexed() : geo;
    const p = g.attributes.position,
      n = g.attributes.normal,
      uv = g.attributes.uv;
    for (let i = 0; i < p.count; i += 3) {
      for (const a of [p, n, uv]) {
        if (!a) continue;
        const s = a.itemSize;
        for (let k = 0; k < s; k++) {
          const t = a.array[(i + 1) * s + k];
          a.array[(i + 1) * s + k] = a.array[(i + 2) * s + k];
          a.array[(i + 2) * s + k] = t;
        }
      }
    }
    if (n) for (let i = 0; i < n.array.length; i++) n.array[i] = -n.array[i];
    return g;
  };

  // ===================================================================
  // Site builder context
  // ===================================================================
  /**
   * S = P.site(id, {ox,oy,oz, lit, ambient, ambI, interiorKey})
   * All coordinates passed to S.* are LOCAL (origin = ox,oy,oz).
   */
