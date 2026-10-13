// play-inline-104 02 — cam
// Lines 337-436 of readable/play-inline-104.pretty.js (statement-aligned).
  function update(dt, realDt) {
    // one-shot bow-tie carriageway lint once every module has built (Times Square's X must stay open road)
    if (
      bowtieTimer > 0 &&
      (bowtieTimer -= realDt) <= 0 &&
      G.LAYOUT.lintBowties
    ) {
      try {
        MAP.stats.bowtieLint = G.LAYOUT.lintBowties(G.world);
        if (MAP.stats.bowtieLint.length)
          console.warn(
            "[map] bow-tie lint (BLOCKING for the owner):",
            JSON.stringify(MAP.stats.bowtieLint),
          );
      } catch (e) {
        G.reportError("map:bowtieLint", e);
      }
    }
    if (M.updateInteriors) M.updateInteriors(dt, realDt); // cog door, sliding doors, dungeon names (90_module_interior.js)
    visTimer -= realDt;
    if (visTimer <= 0 || forceVis > 0) {
      // (forced for a few frames after a teleport: the camera may only follow the player later in the frame)
      forceVis--;
      visTimer = 0.2;
      const cam = G.camera ? G.camera.position : G.player.pos;
      const indoor = cam.x >= G.LAYOUT.INTERIOR_X_MIN;
      if (!indoor && M.updateLOD) M.updateLOD(cam);
      if (M.roots.city) M.roots.city.visible = !indoor;
      if (M.interiorVisibility) M.interiorVisibility(cam, indoor); // interior cell roots (90_module_interior.js)
      if (G.QS && G.QS.get && G.QS.get("mapdebug") && G.camera) {
        try {
          debugVisible();
        } catch (e) {
          /* */
        }
      }
    }
  }

  /** ?mapdebug=1: hidden <pre id="map-vis"> with the map meshes in the camera frustum, grouped by material:layer (draw-call audit). */
  function debugVisible() {
    const cam = G.camera;
    cam.updateMatrixWorld();
    const fr = new THREE.Frustum(),
      m4 = new THREE.Matrix4();
    fr.setFromProjectionMatrix(
      m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse),
    );
    const by = {},
      tr = {};
    let n = 0,
      sh = 0;
    const walk = (o, vis) => {
      if (!o.visible || !vis) return;
      if (o.isMesh) {
        if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere();
        const sp = o.geometry.boundingSphere
          .clone()
          .applyMatrix4(o.matrixWorld);
        if (fr.intersectsSphere(sp)) {
          const k = o.name.replace(/^map:/, "");
          by[k] = (by[k] || 0) + 1;
          tr[k] =
            (tr[k] || 0) + (o.geometry.index ? o.geometry.index.count / 3 : 0);
          n++;
          if (o.castShadow) sh++;
        }
      }
      for (const c of o.children) walk(c, true);
    };
    if (M.roots.city) walk(M.roots.city, true);
    let pre = document.getElementById("map-vis");
    if (!pre) {
      pre = document.createElement("pre");
      pre.id = "map-vis";
      pre.style.display = "none";
      document.body.appendChild(pre);
    }
    pre.textContent =
      "MAPVIS" +
      JSON.stringify({
        n,
        casters: sh,
        cam: [cam.position.x, cam.position.z].map(Math.round),
        by: Object.entries(by).sort((p, q) => q[1] - p[1]),
        tris: Object.entries(tr)
          .map((e) => [e[0], Math.round(e[1])])
          .sort((p, q) => q[1] - p[1])
          .slice(0, 30),
      }) +
      "ENDMAPVIS";
  }

  // refresh visibility/LOD immediately after any teleport (doors, fast travel, loading)
  G.on("teleport", () => {
    visTimer = 0;
    forceVis = 3;
  });

  G.registerModule({ name: "map", order: 20, init, update });
