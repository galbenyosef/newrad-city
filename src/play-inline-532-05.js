// play-inline-532 05 — rec
// Lines 1360-1621 of readable/play-inline-532.pretty.js (statement-aligned).
  X.placeSchematics = function () {
    if (
      schemPlaced ||
      !real("items") ||
      typeof G.items.spawnPickup !== "function"
    )
      return;
    schemPlaced = true;
    X.placed = [];
    for (const [id, x, z, radius, note] of X.SCHEM_PLACEMENTS) {
      try {
        const s = X.findSpot(x, z, radius);
        if (!s) {
          if (G.warnings)
            G.warnings.push("crafting: no spot for " + id + " (" + note + ")");
          continue;
        }
        s.y += 0.02;
        G.items.spawnPickup(id, 1, s, {
          yaw: (((x * 13 + z * 7) % 6.28) + 6.28) % 6.28,
          static: true,
          keepY: true,
        });
        X.placed.push({ id, x: s.x, y: s.y, z: s.z, note });
      } catch (e) {
        G.reportError("crafting:placeSchematic " + id, e);
      }
    }
  };

  // ------------------------------------------------------------------
  // Harvestable plants (instanced per patch & species; LOD'd)
  // ------------------------------------------------------------------
  X.plants = []; // {key, species, pos (Vector3 label), mesh, index, matrix, harvested}
  let plantMat = null;
  const PLANT_GEO = {};
  function coloured(geo, hex) {
    return G.util.paint(geo, hex);
  }
  function buildPlantGeos() {
    if (PLANT_GEO.ashbloom) return;
    const U = G.util;
    const parts = [];
    // Ashbloom: three stems, rust-orange flower heads, a rosette of dusty leaves
    for (let i = 0; i < 3; i++) {
      const a = i * 2.1,
        lean = 0.22;
      const h = 0.34 + i * 0.05;
      const stem = coloured(
        new THREE.CylinderGeometry(0.006, 0.009, h, 5, 1),
        0x5a6a2c,
      );
      parts.push(
        U.bake(
          stem,
          { x: Math.cos(a) * 0.04, y: h / 2, z: Math.sin(a) * 0.04 },
          a,
          1,
          Math.sin(a) * lean,
          Math.cos(a) * lean,
        ),
      );
      const tip = {
        x: Math.cos(a) * 0.04 + Math.cos(a) * h * Math.sin(lean) * 0.9,
        y: h * 0.97,
        z: Math.sin(a) * 0.04 + Math.sin(a) * h * Math.sin(lean) * 0.9,
      };
      parts.push(
        U.bake(
          coloured(
            new THREE.IcosahedronGeometry(0.045, 0),
            i === 1 ? 0xc0501e : 0xd2691e,
          ),
          tip,
          a,
          1,
        ),
      );
      parts.push(
        U.bake(
          coloured(new THREE.ConeGeometry(0.03, 0.05, 5), 0xe0a040),
          { x: tip.x, y: tip.y + 0.035, z: tip.z },
          a,
          1,
        ),
      );
    }
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + 0.3;
      const leaf = coloured(new THREE.ConeGeometry(0.035, 0.2, 3), 0x6a7a34);
      parts.push(
        U.bake(
          leaf,
          { x: Math.cos(a) * 0.08, y: 0.04, z: Math.sin(a) * 0.08 },
          -a,
          { x: 1, y: 1, z: 0.35 },
          0,
          Math.PI / 2 - 0.35,
        ),
      );
    }
    PLANT_GEO.ashbloom = U.mergeGeometries(parts);
    const xp = [];
    // Knotroot: a purple-brown crown half out of the soil + long ragged leaves
    xp.push(
      U.bake(
        coloured(new THREE.SphereGeometry(0.075, 7, 5), 0x6e3a58),
        { x: 0, y: 0.03, z: 0 },
        0,
        { x: 1, y: 0.7, z: 1 },
      ),
    );
    xp.push(
      U.bake(
        coloured(new THREE.SphereGeometry(0.05, 6, 4), 0x7a4662),
        { x: 0.07, y: 0.02, z: 0.03 },
        0,
        { x: 1, y: 0.6, z: 1 },
      ),
    );
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      const h = 0.28 + (i % 3) * 0.06;
      const leaf = coloured(
        new THREE.ConeGeometry(0.03, h, 3),
        i % 2 ? 0x55702e : 0x4a6428,
      );
      xp.push(
        U.bake(
          leaf,
          { x: Math.cos(a) * 0.05, y: 0.06 + h * 0.45, z: Math.sin(a) * 0.05 },
          -a,
          { x: 1, y: 1, z: 0.3 },
          0,
          0.45,
        ),
      );
    }
    PLANT_GEO.knotroot = U.mergeGeometries(xp);
    plantMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.88,
      metalness: 0,
      side: THREE.DoubleSide,
    });
    plantMat.userData.shared = true;
  }
  const _m = new THREE.Matrix4(),
    _q = new THREE.Quaternion(),
    _s = new THREE.Vector3(),
    _p = new THREE.Vector3(),
    _e = new THREE.Euler();
  const ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
  X.buildPlants = function () {
    if (X.plants.length || !G.scene) return;
    buildPlantGeos();
    const U = G.util;
    X.plantRoot = new THREE.Group();
    X.plantRoot.name = "crafting_plants";
    G.scene.add(X.plantRoot);
    X.PLANT_PATCHES.forEach(([cx, cz, radius, n, mix], pi) => {
      const rnd = U.rng(1000 + pi * 77);
      const spots = [];
      for (let tries = 0; tries < n * 6 && spots.length < n; tries++) {
        const a = rnd() * Math.PI * 2,
          r = Math.sqrt(rnd()) * radius;
        const x = cx + Math.cos(a) * r,
          z = cz + Math.sin(a) * r;
        if (spots.some((s) => Math.hypot(s.x - x, s.z - z) < 1.1)) continue;
        const y = X.groundAt(x, z, 1.0);
        if (y === null) continue;
        spots.push({
          x,
          y,
          z,
          sp: spots.length < Math.round(n * mix) ? "ashbloom" : "knotroot",
          rot: rnd() * 6.28,
          sc: 1.15 + rnd() * 0.45,
        });
      }
      if (!spots.length) return;
      for (const sp of ["ashbloom", "knotroot"]) {
        const mine = spots.filter((s) => s.sp === sp);
        if (!mine.length) continue;
        const mesh = new THREE.InstancedMesh(
          PLANT_GEO[sp],
          plantMat,
          mine.length,
        );
        mesh.name = "cr_plants_" + sp + "_" + pi;
        mesh.castShadow = false;
        mesh.receiveShadow = true;
        mine.forEach((s, i) => {
          _q.setFromEuler(_e.set(0, s.rot, 0));
          _m.compose(_p.set(s.x, s.y, s.z), _q, _s.set(s.sc, s.sc, s.sc));
          mesh.setMatrixAt(i, _m);
          const rec = {
            key: "p" + pi + "_" + sp + "_" + i,
            species: sp,
            pos: new THREE.Vector3(s.x, s.y + 0.22, s.z),
            mesh,
            index: i,
            matrix: _m.clone(),
            harvested: false,
            interactable: null,
          };
          rec.interactable = G.world.addInteractable({
            pos: rec.pos,
            radius: 0.4,
            range: 2.4,
            priority: 0.3,
            label: X.PLANT_SPECIES[sp].label,
            verb: "Harvest",
            enabled: () => !rec.harvested,
            onInteract: () => X.harvest(rec),
          });
          X.plants.push(rec);
        });
        mesh.instanceMatrix.needsUpdate = true;
        if (typeof mesh.computeBoundingSphere === "function")
          mesh.computeBoundingSphere();
        else mesh.frustumCulled = false;
        X.plantRoot.add(mesh);
        if (G.world.addLOD)
          G.world.addLOD(mesh, 110, new THREE.Vector3(cx, 0, cz));
      }
    });
  };
  function setPlantVisible(rec, on) {
    rec.mesh.setMatrixAt(rec.index, on ? rec.matrix : ZERO);
    rec.mesh.instanceMatrix.needsUpdate = true;
  }
  X.harvest = function (rec) {
    if (!rec || rec.harvested) return false;
    const sp = X.PLANT_SPECIES[rec.species];
    const n = 1 + (X.skill("survival") >= 60 ? 1 : 0);
    rec.harvested = true;
    X.S.harvested[rec.key] = X.gameHours() + X.REGROW_HOURS;
    setPlantVisible(rec, false);
    try {
      if (X.invReal()) G.inventory.add(sp.item, n);
    } catch (e) {
      G.reportError("crafting:harvest", e);
    }
    X.S.stats.harvested += n;
    X.sfx("pickup", { pos: rec.pos, volume: 0.6 });
    G.events.emit("plantHarvested", sp.item, n);
    return true;
  };
  /** Apply X.S.harvested to the meshes (after load/reset) and regrow what's due. */
  X.syncPlants = function () {
    const now = X.gameHours();
    for (const rec of X.plants) {
      const until = X.S.harvested[rec.key];
      const h = until !== undefined && until > now;
      if (!h && until !== undefined) delete X.S.harvested[rec.key];
      if (h !== rec.harvested) {
        rec.harvested = h;
        setPlantVisible(rec, !h);
      }
    }
  };
