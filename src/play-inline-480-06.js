// play-inline-480 06 — pos
// Lines 1985-2163 of readable/play-inline-480.pretty.js (statement-aligned).
  function hlMat(m) {
    if (
      !m ||
      m.isShaderMaterial ||
      (!m.isMeshStandardMaterial &&
        !m.isMeshPhongMaterial &&
        !m.isMeshLambertMaterial)
    )
      return m;
    let h = HL.get(m.uuid);
    if (!h) {
      h = m.clone();
      h.emissive = (m.emissive ? m.emissive.clone() : new THREE.Color(0)).add(
        new THREE.Color(0x3a3a30),
      );
      if (m.map && !m.emissiveMap) h.emissiveMap = m.map;
      h.emissiveIntensity = Math.max(1, m.emissiveIntensity || 1);
      h.userData = { shared: true, rpgHighlight: true };
      HL.set(m.uuid, h);
    }
    return h;
  }
  let hlPickup = null;
  function setHighlight(p, on) {
    if (!p || !p.object3d) return;
    p.object3d.traverse((o) => {
      if (!o.isMesh || !o.material || Array.isArray(o.material)) return;
      if (on) {
        if (!o.userData._rpgMat) {
          o.userData._rpgMat = o.material;
          o.material = hlMat(o.material);
        }
      } else if (o.userData._rpgMat) {
        o.material = o.userData._rpgMat;
        delete o.userData._rpgMat;
      }
    });
  }
  G.events.on("focus", (it) => {
    const p = it && it._rpgPickup ? it._rpgPickup : null;
    if (p === hlPickup) return;
    if (hlPickup) setHighlight(hlPickup, false);
    hlPickup = p && !p.taken ? p : null;
    if (hlPickup) setHighlight(hlPickup, true);
  });

  function isOwnedByOther(owner) {
    if (!owner || owner === "player") return false;
    const c = G.containers; // share the container module's hostile-owner rule when present
    return c && !G.isStub("containers") && c.isStealing
      ? c.isStealing(owner)
      : true;
  }

  function takePickup(p) {
    if (!p || p.taken) return false;
    const d = G.items.get(p.id);
    if (isOwnedByOther(p.owner) && G.containers && G.containers.stealCheck) {
      const value = (d ? d.value : 1) * p.count;
      G.containers.stealCheck(p.owner, value, {
        pos: p.pos,
        name: d ? d.name : p.id,
      });
    }
    const silent = !!(d && d.medallion);
    G.inventory.add(p.id, p.count, { cond: p.cond, silent });
    const snd =
      p.id === "scrip"
        ? "pickup_scrip"
        : d && d.type === "weapon"
          ? "pickup_weapon"
          : d && d.type === "apparel"
            ? "pickup_armor"
            : "pickup";
    G.sfx.play(snd, {
      pos: p.pos.clone ? p.pos.clone() : undefined,
      volume: 0.8,
    });
    if (p.static) takenStatic.add(p.key);
    removePickup(p);
    G.events.emit("pickupTaken", p.id, p.count);
    return true;
  }

  function removePickup(p) {
    if (!p) return;
    p.taken = true;
    if (hlPickup === p) {
      setHighlight(p, false);
      hlPickup = null;
    }
    if (p.interactable) G.world.removeInteractable(p.interactable);
    if (p.object3d && p.object3d.parent) p.object3d.parent.remove(p.object3d);
    const i = pickups.indexOf(p);
    if (i >= 0) pickups.splice(i, 1);
  }

  let cullT = 0;
  function update(realDt) {
    cullT -= realDt;
    if (cullT > 0) return;
    cullT = 0.3;
    const cam = G.camera && G.camera.position;
    if (!cam) return;
    const m2 = CULL * CULL;
    for (const p of pickups) {
      const dx = p.pos.x - cam.x,
        dz = p.pos.z - cam.z;
      p.object3d.visible = dx * dx + dz * dz < m2;
    }
  }

  function clearDynamic() {
    for (const p of pickups.slice()) if (!p.static) removePickup(p);
  }
  function restoreStatics() {
    // remove all statics then recreate those not taken
    for (const p of pickups.slice()) if (p.static) removePickup(p);
    for (const s of staticDefs)
      if (!takenStatic.has(s.key))
        spawnPickup(
          s.id,
          s.count,
          s.pos,
          Object.assign({}, s.opts, { static: true, _restore: true }),
        );
  }

  function serialize() {
    const dyn = [];
    for (const p of pickups)
      if (!p.static && !p.noSave)
        dyn.push([
          p.id,
          p.count,
          Math.round(p.pos.x * 100) / 100,
          Math.round(p.pos.y * 100) / 100,
          Math.round(p.pos.z * 100) / 100,
          p.cond === undefined ? null : p.cond,
          p.owner,
        ]);
    return { taken: Array.from(takenStatic), dyn };
  }
  function deserialize(d) {
    takenStatic = new Set((d && d.taken) || []);
    restoreStatics();
    for (const e of (d && d.dyn) || [])
      spawnPickup(
        e[0],
        e[1],
        { x: e[2], y: e[3], z: e[4] },
        {
          static: false,
          cond: e[5] === null ? undefined : e[5],
          owner: e[6] || null,
          keepY: true,
        },
      );
  }

  Object.assign(G.items, {
    spawnPickup,
    createItemModel,
    removePickup,
    takePickup,
    pickups: () => pickups.slice(),
    _pickupsUpdate: update,
    _pickupsReset() {
      clearDynamic();
      takenStatic = new Set();
      restoreStatics();
    },
    _pickupsSerialize: serialize,
    _pickupsDeserialize: deserialize,
    _endInitPhase() {
      initPhase = false;
    },
    MESH_KINDS: Object.keys(BUILDERS),
  });
