// play-inline-65 07 — kind
// Lines 1617-1719 of readable/play-inline-65.pretty.js (statement-aligned).
  const nukeRads = [];
  function updateNukeRads(dt) {
    for (let i = nukeRads.length - 1; i >= 0; i--) {
      const r = nukeRads[i];
      r.t += dt;
      r.src.strength = r.s0 * Math.max(0, 1 - r.t / r.dur);
      if (r.t >= r.dur) {
        G.world.removeRadSource(r.src);
        nukeRads.splice(i, 1);
      }
    }
  }

  // ------------------------------------------------------------------
  // Public API
  // ------------------------------------------------------------------
  /**
   * Explosion. kind: 'normal'|'grenade'|'car'|'missile'|'nuke'|'plasma'|'fire'|'electric'|'emp'.
   * radius ≈ damage radius in metres. opts: {noShake, noDecal}
   */
  FX.explosion = function (pos, radius, kind) {
    if (!A.psAdd || !baseMat || !pos) return;
    const p = A.v3(pos);
    const R = Math.max(0.5, radius || 4);
    kind = kind || "normal";
    if (kind === "nuke") return explodeNuke(p, R);
    if (kind === "emp") kind = "electric";
    if (kind === "car") {
      explodeNormal(p, Math.max(R, 5), "normal");
      const f = FX.fire(
        new THREE.Vector3(p.x, A.groundAt(p.x, p.z, p.y + 1) + 0.4, p.z),
        1.4,
        { light: false },
      );
      if (f) f.expire(30);
      const s = FX.smoke(
        new THREE.Vector3(p.x, A.groundAt(p.x, p.z, p.y + 1) + 1.5, p.z),
        1.2,
      );
      if (s) s.expire(40);
      return;
    }
    return explodeNormal(
      p,
      R,
      kind === "plasma" || kind === "electric" || kind === "fire"
        ? kind
        : "normal",
    );
  };
  /** Expose for debug/tests */
  FX.mushroomCloud = (pos, radius) => explodeNuke(A.v3(pos), radius || 12);
  /** Live volumetric explosion puffs (debug / tests). */
  FX.puffCount = () => PF.n;

  function update(dt) {
    const env = A.env;
    shared.uSunDir.value.copy(env.lightDir);
    shared.uSunCol.value
      .copy(env.lightColor)
      .multiplyScalar(env.lightInt * 0.5);
    shared.uAmbient.value.copy(env.hemiSky).multiplyScalar(env.hemiInt * 0.7);
    for (let i = active.length - 1; i >= 0; i--) {
      const p = active[i];
      if (dt > 0) p.t += dt;
      if (p.t >= p.dur) {
        killPiece(p);
        active.splice(i, 1);
        continue;
      }
      if (dt > 0)
        try {
          p.fn(p.t, dt);
        } catch (e) {
          killPiece(p);
          active.splice(i, 1);
          G.reportError("update:atmosphere/explosion", e);
        }
    }
    updateDebris(dt);
    try {
      updatePuffs(dt);
    } catch (e) {
      PF.n = 0;
      G.reportError("update:atmosphere/puffs", e);
    }
    updateNukeRads(dt);
  }
  function reset() {
    for (const p of active) killPiece(p);
    active.length = 0;
    debris.length = 0;
    if (debMesh) debMesh.count = 0;
    PF.n = 0;
    if (PF.mesh) {
      PF.mesh.geometry.instanceCount = 0;
      PF.mesh.visible = false;
    }
    for (const r of nukeRads) G.world.removeRadSource(r.src);
    nukeRads.length = 0;
  }

  A.addSystem({ name: "explosions", order: 63, init, update, reset });
