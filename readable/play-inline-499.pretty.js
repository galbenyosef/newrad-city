/* src/weapons/42_mods.js */
/* =====================================================================
 * NEW RAD CITY — WEAPONS: weapon mods
 *
 * Mods are misc inventory items. Installing one (workbench MODIFY tab or
 * G.weapons.installMod(weaponId, modId)) consumes the item and records it on
 * the weapon type (S.mods[weaponId] = [modId...], saved with the module).
 *
 *   P.moddedDef(def)          → per-player derived def (weapon block copy with
 *                                the mods applied; def.mods = sorted mod ids)
 *   P.attachMods(inst, ids)   → adds the mod hardware to a view model instance
 *                                (scope on the sight line, suppressor on the
 *                                muzzle, longer magazine, venturi sleeve) and
 *                                moves the sockets it covers (muzzle, sight)
 *
 * The view model cache is keyed by kind|skin|mods (90_api modelKey), so a
 * modded gun is its own model and the plain one stays untouched.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const P = G.weapons._;
  const GEO = P.GEO,
    C = P.COMP;

  const PISTOL_10 = [
    "pistol_10mm",
    "winter_service_pistol",
    "smg_10mm",
    "mat49_smg",
  ];
  const RIFLES = ["assault_rifle"];
  const round = (x) => Math.max(1, Math.round(x));

  /** Mod catalogue. kind drives the view hardware; apply(w) edits the copied weapon block. */
  const MODS = {
    mod_10mm_ext_mag: {
      kind: "extMag",
      name: "10mm Extended Magazine",
      value: 80,
      weight: 0.5,
      fits: PISTOL_10,
      desc: "A welded-together double-length 10mm magazine with a stiffer spring. Holds half again as many rounds.",
      effect: "Magazine +50%",
      apply(w) {
        w.magSize = round(w.magSize * 1.5);
        w.reloadTime *= 1.08;
      },
    },
    mod_10mm_silencer: {
      kind: "silencer",
      name: "10mm Silencer",
      value: 120,
      weight: 0.5,
      fits: PISTOL_10,
      desc: "A baffled steel can threaded for 10mm barrels. Turns a gunshot into a cough, and a sneak attack into a sure thing.",
      effect: "Quieter shots, no muzzle flash",
      apply(w) {
        w.silenced = true;
        w.sfxVolume = (w.sfxVolume || 1) * 0.3;
        w.sfxPitch = (w.sfxPitch || 1) * 1.45;
        w.flash = "none";
        w.range *= 0.92;
      },
    },
    mod_rifle_scope: {
      kind: "scope",
      name: "Rifle Scope",
      value: 150,
      weight: 1,
      fits: RIFLES.concat(["bolt_rifle_32", "gyrojet_carbine"]),
      desc: "A 2.5x hunting scope and a set of universal rings. Fits most rifle receivers with enough persuasion.",
      effect: "2.5x scope",
      apply(w) {
        w.scope = 2.5;
        w.adsSpread *= 0.55;
      },
    },
    mod_44_scope: {
      kind: "scope",
      name: ".44 Revolver Scope",
      value: 150,
      weight: 1,
      fits: ["magnum_44"],
      desc: "A long-eye-relief pistol scope on a clamp mount for the .44 Magnum.",
      effect: "2x scope",
      apply(w) {
        w.scope = 2.1;
        w.adsSpread *= 0.5;
      },
    },
    mod_rifle_ext_mag: {
      kind: "extMag",
      name: "Assault Rifle Extended Magazine",
      value: 100,
      weight: 0.5,
      fits: RIFLES,
      desc: "Two magazines taped and welded into one long stick. Crude, heavy and very generous.",
      effect: "Magazine +50%",
      apply(w) {
        w.magSize = round(w.magSize * 1.5);
        w.reloadTime *= 1.1;
      },
    },
    mod_gyro_venturi: {
      kind: "venturi",
      name: "Gyrojet Venturi Sleeve",
      value: 200,
      weight: 0.5,
      fits: ["gyrojet_pistol", "gyrojet_carbine"],
      desc: "A machined muzzle sleeve with canted ports that spins the rocket up before it leaves the barrel. Hits harder up close, flies straighter far away.",
      effect: "Damage +15%, point-blank penalty halved, spread -25%",
      apply(w) {
        w.damage = Math.round(w.damage * 1.15);
        w.spread *= 0.75;
        w.adsSpread *= 0.7;
        if (w.gyro)
          w.gyro = Object.assign({}, w.gyro, {
            min: w.gyro.min + (1 - w.gyro.min) * 0.5,
          });
      },
    },
  };
  P.MODS = MODS;

  /** Mod ids installed on a weapon type. */
  P.modsOf = function (id) {
    const S = P.state;
    return S.mods && S.mods[id] ? S.mods[id].slice() : [];
  };

  /** Derived def with the player's installed mods applied (returns def itself when unmodded). */
  P.moddedDef = function (def) {
    const ids = P.modsOf(def.id)
      .filter((m) => MODS[m])
      .sort();
    if (!ids.length) return def;
    const w = Object.assign({}, def.weapon);
    for (const m of ids) {
      try {
        MODS[m].apply(w);
      } catch (e) {
        G.reportError("weapons:mod " + m, e);
      }
    }
    return Object.assign({}, def, {
      weapon: w,
      mods: ids,
      baseDef: def,
      name: def.name,
    });
  };

  // ------------------------------------------------------------------
  // View hardware
  // ------------------------------------------------------------------
  const _m = new THREE.Matrix4(),
    _mi = new THREE.Matrix4(),
    _v = new THREE.Vector3();

  /** Stretch a part's geometry along axis `a` (part space) away from its top, by factor k. */
  function stretchPart(part, a, k) {
    const ax = new THREE.Vector3(a[0], a[1], a[2]).normalize();
    part.updateMatrixWorld(true);
    const inv = new THREE.Matrix4().copy(part.matrixWorld).invert();
    // top = the point with the smallest projection on the axis (the end that sits inside the gun)
    let top = Infinity;
    const meshes = [];
    part.traverse((o) => {
      if (o.isMesh) meshes.push(o);
    });
    for (const m of meshes) {
      _m.multiplyMatrices(inv, m.matrixWorld);
      const p = m.geometry.attributes.position;
      for (let i = 0; i < p.count; i++) {
        _v.fromBufferAttribute(p, i).applyMatrix4(_m);
        top = Math.min(top, _v.dot(ax));
      }
    }
    if (!isFinite(top)) return;
    // S = I + (k-1)·a·aᵀ about the plane a·x = top
    const e = k - 1;
    const S = new THREE.Matrix4().set(
      1 + e * ax.x * ax.x,
      e * ax.x * ax.y,
      e * ax.x * ax.z,
      0,
      e * ax.y * ax.x,
      1 + e * ax.y * ax.y,
      e * ax.y * ax.z,
      0,
      e * ax.z * ax.x,
      e * ax.z * ax.y,
      1 + e * ax.z * ax.z,
      0,
      0,
      0,
      0,
      1,
    );
    const T0 = new THREE.Matrix4().makeTranslation(
      -ax.x * top,
      -ax.y * top,
      -ax.z * top,
    );
    const T1 = new THREE.Matrix4().makeTranslation(
      ax.x * top,
      ax.y * top,
      ax.z * top,
    );
    const M = new THREE.Matrix4().multiplyMatrices(T1, S).multiply(T0);
    for (const m of meshes) {
      _m.multiplyMatrices(inv, m.matrixWorld);
      _mi.copy(_m).invert();
      m.geometry.applyMatrix4(_m);
      m.geometry.applyMatrix4(M);
      m.geometry.applyMatrix4(_mi);
      m.geometry.computeBoundingSphere();
    }
  }

  function attachSilencer(inst, kind) {
    const mz = inst.sockets.muzzle;
    if (!mz || !mz.parent) return;
    const small = /pistol|10mm/.test(kind) && kind !== "smg_10mm";
    const r = small ? 0.0125 : 0.0145,
      len = small ? 0.12 : 0.15;
    const b = P.builder();
    const z0 = mz.position.z;
    b.cyl(
      "blued",
      r,
      len,
      [mz.position.x, mz.position.y, z0 - len / 2 + 0.004],
      { seg: 22, wear: 1 },
    );
    b.add(
      GEO.lathe(
        [
          [r * 0.98, 0],
          [r * 1.02, 0.003],
          [r * 0.7, 0.006],
          [0.004, 0.0065],
        ],
        22,
      ),
      "blued",
      { p: [mz.position.x, mz.position.y, z0 - len + 0.004], wear: 1.5 },
    );
    b.add(GEO.tube(r * 1.06, r * 0.9, 0.018, 22), "darksteel", {
      p: [mz.position.x, mz.position.y, z0 - 0.006],
    }); // knurled mount collar
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      b.box(
        "darksteel",
        0.0016,
        0.0016,
        0.016,
        [
          mz.position.x + Math.cos(a) * r * 1.06,
          mz.position.y + Math.sin(a) * r * 1.06,
          z0 - 0.006,
        ],
        { bevel: 0.0004, tint: 1.3 },
      );
    }
    b.add(new THREE.CircleGeometry(0.0035, 12), "darksteel", {
      p: [mz.position.x, mz.position.y, z0 - len + 0.0035],
      tint: 0.2,
    });
    mz.parent.add(b.build());
    mz.position.z -= len - 0.004;
  }
  function attachScope(inst, kind) {
    const sg = inst.sockets.sight;
    if (!sg || !sg.parent) return;
    const pistol = kind === "magnum_44";
    const y = sg.position.y + (pistol ? 0.03 : 0.036);
    const zc = sg.position.z - (pistol ? 0.08 : 0.1);
    const b = P.builder();
    const eye = C.scope(
      b,
      y,
      zc,
      pistol ? 0.16 : 0.22,
      pistol ? 0.0125 : 0.015,
      { mountY: sg.position.y - 0.004 },
    );
    sg.parent.add(b.build());
    sg.position.set(0, y, eye);
    inst.cfg.adsDist = pistol ? 0.2 : 0.16;
  }
  function attachVenturi(inst) {
    const mz = inst.sockets.muzzle;
    if (!mz || !mz.parent) return;
    const b = P.builder();
    const p = mz.position;
    b.add(GEO.tube(0.016, 0.0095, 0.05, 18), "brushed", {
      p: [p.x, p.y, p.z - 0.02],
    });
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.4;
      b.box(
        "darksteel",
        0.004,
        0.004,
        0.016,
        [p.x + Math.cos(a) * 0.016, p.y + Math.sin(a) * 0.016, p.z - 0.03],
        { bevel: 0, r: [0.35, 0, a], tint: 0.3 },
      );
    }
    b.add(GEO.torus(0.0162, 0.002, 5, 18), "darksteel", {
      p: [p.x, p.y, p.z + 0.004],
    });
    mz.parent.add(b.build());
    mz.position.z -= 0.045;
  }

  /** Add installed mods' hardware to a freshly built view model. */
  P.attachMods = function (inst, ids, kind) {
    for (const id of ids) {
      const md = MODS[id];
      if (!md) continue;
      if (md.kind === "silencer") attachSilencer(inst, kind);
      else if (md.kind === "scope") attachScope(inst, kind);
      else if (md.kind === "venturi") attachVenturi(inst);
      else if (md.kind === "extMag") {
        const mag = inst.parts.mag;
        const ax = (inst.cfg.reload && inst.cfg.reload.axis) || [0, -1, 0];
        if (mag) stretchPart(mag, ax, 1.45);
      }
    }
    inst.mods = ids.slice();
    return inst;
  };
})();
