// play-inline-511 04 — obj
// Lines 1018-1359 of readable/play-inline-511.pretty.js (statement-aligned).
  C.dismember = function (a, part, dir, explode) {
    if (!a.char.parts || !a.char.parts[part]) part = "head";
    if (a.dismembered && a.dismembered.has(part)) return;
    (a.dismembered = a.dismembered || new Set()).add(part);
    const p = C.partCenter(a, part, new THREE.Vector3());
    if (!a.char.placeholder && typeof a.char.dismember === "function") {
      // G.chars severs the bone, spawns & simulates its own gibs and stump
      try {
        a.char.dismember(part, { dir: dir || null, explode: !!explode });
      } catch (e) {
        G.reportError("combat:dismember", e);
      }
      C.fx(
        "blood",
        p.clone(),
        dir ? dir.clone() : UP.clone(),
        explode ? 4 : 2.5,
        goreKey(a),
      );
      C.fx(
        "decal",
        new THREE.Vector3(p.x, G.world.groundHeight(p.x, p.z, p.y) + 0.02, p.z),
        UP.clone(),
        bloodDecal(a),
      );
      C.sfx("bullet_flesh", { pos: p, volume: 1, pitch: 0.7 });
      if (part === "head") a.headless = true;
      return;
    }
    let chunks = null;
    try {
      chunks = a.char.dismember ? a.char.dismember(part) : null;
    } catch (e) {
      G.reportError("combat:dismember", e);
    }
    let n = 0;
    if (Array.isArray(chunks)) {
      for (const ch of chunks) {
        if (!ch || !ch.isObject3D) continue;
        n++;
        if (ch.userData.selfAnimated) {
          if (!ch.parent) G.scene.add(ch);
          continue;
        }
        const wp = ch.parent
          ? ch.getWorldPosition(new THREE.Vector3())
          : ch.position.clone();
        if (ch.parent && ch.parent !== G.scene) {
          G.scene.attach(ch);
        }
        const v = new THREE.Vector3(
          (Math.random() - 0.5) * 3,
          2 + Math.random() * 3,
          (Math.random() - 0.5) * 3,
        );
        if (dir) v.addScaledVector(dir, 3);
        addGibPhysics(ch, wp, v, 30);
      }
    }
    const gore = a.gore;
    C.spawnGibs(p, dir, explode ? 7 : n ? 2 : 4, gore, explode ? 5 : 3.5);
    C.fx(
      "blood",
      p.clone(),
      dir ? dir.clone() : UP.clone(),
      explode ? 4 : 2.5,
      goreKey(a),
    );
    if (explode) C.fx("blood", p.clone(), UP.clone(), 3, goreKey(a));
    C.fx(
      "decal",
      new THREE.Vector3(p.x, G.world.groundHeight(p.x, p.z, p.y) + 0.02, p.z),
      UP.clone(),
      bloodDecal(a),
    );
    C.sfx("bullet_flesh", { pos: p, volume: 1, pitch: 0.7 });
    if (part === "head") a.headless = true;
  };
  /** Full explosive gib: several limbs + chunk shower. */
  C.gib = function (a, info, limbs) {
    const gdir =
      info.dir ||
      (info.explosion
        ? new THREE.Vector3()
            .subVectors(a.pos, info.explosion.center)
            .normalize()
        : null);
    if (
      !a.char.placeholder &&
      typeof a.char.dismember === "function" &&
      (limbs >= 4 || info.finalDamage > a.maxHp * 1.5)
    ) {
      try {
        a.char.dismember("all", { dir: gdir });
      } catch (e) {
        G.reportError("combat:gib", e);
      }
      a.gibbed = true;
      C.fx("blood", a.centerPos(), UP.clone(), 4, goreKey(a));
      return;
    }
    const keys = ["head", "leftArm", "rightArm", "leftLeg", "rightLeg"]
      .sort(() => Math.random() - 0.5)
      .slice(0, limbs);
    for (const k of keys)
      C.dismember(
        a,
        k,
        info.dir ||
          (info.explosion
            ? _e.subVectors(a.pos, info.explosion.center).normalize().clone()
            : null),
        k === "head",
      );
    C.spawnGibs(a.centerPos(), null, 6, a.gore, 6);
  };
  function updateGibs(dt) {
    for (let i = gibs.length - 1; i >= 0; i--) {
      const g = gibs[i];
      g.t += dt;
      if (g.t > g.life) {
        g.obj.position.y -= dt * 0.1;
        if (g.t > g.life + 3) {
          gibs.splice(i, 1);
          if (g.obj.parent) g.obj.parent.remove(g.obj);
        }
        continue;
      }
      if (g.rest) continue;
      g.vel.y -= 18 * dt;
      g.obj.position.addScaledVector(g.vel, dt);
      g.obj.rotation.x += g.spin.x * dt;
      g.obj.rotation.y += g.spin.y * dt;
      g.obj.rotation.z += g.spin.z * dt;
      const gh = G.world.groundHeight(
        g.obj.position.x,
        g.obj.position.z,
        g.obj.position.y + 0.3,
      );
      if (g.obj.position.y < gh + 0.04) {
        g.obj.position.y = gh + 0.04;
        if (g.vel.y < -3 && Math.random() < 0.3)
          C.fx(
            "decal",
            new THREE.Vector3(g.obj.position.x, gh + 0.02, g.obj.position.z),
            UP.clone(),
            "blood",
          );
        g.vel.y = -g.vel.y * 0.3;
        g.vel.x *= 0.6;
        g.vel.z *= 0.6;
        g.spin.multiplyScalar(0.5);
        if (Math.abs(g.vel.y) < 0.6 && Math.hypot(g.vel.x, g.vel.z) < 0.3)
          g.rest = true;
      }
    }
  }
  C.clearGibs = function () {
    for (const g of gibs) if (g.obj.parent) g.obj.parent.remove(g.obj);
    gibs.length = 0;
  };

  // ------------------------------------------------------------------
  // Disintegration (ash pile) — not triggered by any weapon; kept for scripted deaths
  // ------------------------------------------------------------------
  const disints = [];
  let ashMat = null,
    pileGeo = null;
  function disintAssets() {
    if (ashMat) return;
    ashMat = new THREE.MeshStandardMaterial({
      color: 0x3a3632,
      roughness: 1,
      emissive: 0xff5a10,
      emissiveIntensity: 0.6,
    });
    ashMat.userData.shared = true;
    pileGeo = new THREE.ConeGeometry(0.45, 0.28, 9, 1);
    pileGeo.translate(0, 0.14, 0);
  }
  C.disintegrate = function (a) {
    const kind = "ash";
    disintAssets();
    a.disintegrated = kind;
    a.name = "Ash Pile";
    if (!a.char.placeholder && typeof a.char.disintegrate === "function") {
      // G.chars dissolves the body with glowing edges and leaves the ash pile
      try {
        a.char.disintegrate(kind, 1.6);
      } catch (e) {
        G.reportError("combat:disintegrate", e);
      }
      C.fx("flash", a.centerPos(), 0xff6a20, 3, 0.8);
      C.sfx("laser_impact", { pos: a.pos, volume: 0.8, pitch: 0.5 });
      return;
    }
    const fxOk = !G.isStub("fx") && typeof G.fx[kind] === "function";
    if (fxOk) {
      try {
        G.fx[kind](a.char.root);
      } catch (e) {
        G.reportError("combat:fx." + kind, e);
      }
    }
    // Our own dissolve: swap to glowing ash material & collapse, then leave a pile
    const mat = ashMat.clone();
    if (!fxOk)
      a.char.root.traverse((o) => {
        if (o.isMesh) {
          o.material = mat;
        }
      });
    if (!fxOk) {
      // the fx module leaves its own pile
      const pile = new THREE.Mesh(pileGeo, ashMat);
      pile.scale.setScalar(Math.max(0.6, a.height / 1.8) * 0.01);
      pile.position.set(
        a.pos.x,
        G.world.groundHeight(a.pos.x, a.pos.z, a.pos.y + 0.5) + 0.01,
        a.pos.z,
      );
      G.scene.add(pile);
      a.pile = pile;
    }
    disints.push({
      a,
      t: 0,
      mat,
      fxOk,
      kind,
      s: Math.max(0.6, a.height / 1.8),
    });
    C.fx("flash", a.centerPos(), 0xff6a20, 3, 0.8);
    C.sfx("laser_impact", { pos: a.pos, volume: 0.8, pitch: 0.5 });
  };
  function updateDisints(dt) {
    for (let i = disints.length - 1; i >= 0; i--) {
      const d = disints[i];
      d.t += dt;
      const k = C.clamp(d.t / 1.4, 0, 1);
      const root = d.a.char.root;
      if (!d.fxOk) {
        root.scale.set(1 + k * 0.15, Math.max(0.02, 1 - k), 1 + k * 0.15);
        d.mat.emissiveIntensity = 1.4 * (1 - k * 0.8);
      }
      if (d.a.pile) d.a.pile.scale.setScalar(d.s * Math.max(0.01, k));
      if (d.a.pile) ashMat.emissiveIntensity = 0.25;
      if (k >= 1) {
        root.visible = false;
        disints.splice(i, 1);
      }
    }
  }

  // ------------------------------------------------------------------
  // Burning (flamers / fire)
  // ------------------------------------------------------------------
  let fireTex = null;
  function glowTexture() {
    if (fireTex) return fireTex;
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const g = c.getContext("2d");
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, "rgba(255,255,255,1)");
    gr.addColorStop(0.35, "rgba(255,255,255,0.6)");
    gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, 64, 64);
    fireTex = new THREE.CanvasTexture(c);
    return fireTex;
  }
  C.glowTexture = glowTexture;
  function spriteMat(color, opacity) {
    const m = new THREE.SpriteMaterial({
      map: glowTexture(),
      color,
      transparent: true,
      opacity: opacity === undefined ? 1 : opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    return m;
  }
  C.spriteMat = spriteMat;
  C.ignite = function (a, secs, dps, src) {
    if (a.dead && !a.corpseBurn) return;
    a.burnT = Math.max(a.burnT || 0, secs);
    a.burnDps = Math.max(a.burnDps || 0, dps);
    a.burnSrc = src;
    if (!a.burnFx) {
      const g = new THREE.Group();
      for (let i = 0; i < 3; i++) {
        const s = new THREE.Sprite(spriteMat(i ? 0xff7a20 : 0xffc040, 0.9));
        s.scale.setScalar(0.6);
        g.add(s);
      }
      a.char.root.add(g);
      a.burnFx = g;
    }
  };
  C.stopBurnFx = function (a) {
    if (a.burnFx) {
      if (a.burnFx.parent) a.burnFx.parent.remove(a.burnFx);
      a.burnFx.children.forEach((s) => s.material.dispose());
      a.burnFx = null;
    }
  };
  function updateBurn(a, dt) {
    if (!a.burnT) return;
    a.burnT -= dt;
    if (!a.dead)
      C.applyDamage(a, a.burnDps * dt, {
        type: "fire",
        source: a.burnSrc,
        part: "torso",
        silent: true,
        raw: false,
      });
    if (a.burnFx) {
      const t = now();
      a.burnFx.children.forEach((s, i) => {
        s.position.set(
          Math.sin(t * 7 + i * 2) * 0.2,
          (a.dead ? 0.25 : a.height * (0.3 + i * 0.25)) +
            Math.sin(t * 11 + i) * 0.1,
          Math.cos(t * 5 + i) * 0.2,
        );
        s.scale.setScalar(
          (a.dead ? 0.5 : 0.7) + Math.sin(t * 13 + i * 3) * 0.2,
        );
      });
    }
    if (a.burnT <= 0) {
      a.burnT = 0;
      C.stopBurnFx(a);
    }
  }

  // ------------------------------------------------------------------
  // G.combat.fire — hitscan / pellets / projectile weapons
  // ------------------------------------------------------------------
