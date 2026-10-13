/* src/core/thirdperson.js */
/* =====================================================================
 * NEW RAD CITY — THIRD-PERSON PLAYER BODY
 * Owned by: CORE.  The camera itself lives in player.js (P.thirdPerson,
 * F to toggle, mouse wheel to zoom). This file draws the player's own
 * character while the camera is behind them: a G.chars human built from
 * the chargen appearance + the equipped body/head apparel, holding the
 * current weapon's world model, animated from the player's movement.
 * Everything here is optional: if characters/weapons/rpg are stubbed the
 * camera still works, you just see no body.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !G.registerModule) return;

  let body = null; // Character from G.chars.create
  let bodySig = ""; // outfit/appearance signature it was built from
  let weaponSig = ""; // current weapon id + holster state on the body
  let sigTimer = 0;
  let failed = false; // creation threw once → don't retry every frame

  const HAT_KEYS = [
    "fedora",
    "cowboy",
    "hardhat",
    "beret",
    "helmet",
    "bandana",
    "hood",
    "cap",
  ];

  function live(ns) {
    return G[ns] && !G.isStub(ns);
  }

  /** What the body should look like right now. */
  function wantedLook() {
    const P = G.player;
    // the fixed hero's look (G.HERO.appearance); old saves without it fall back to the same defaults
    const app = P.appearance ||
      (G.HERO && G.HERO.appearance) || {
        gender: "m",
        skinTone: "fair",
        hair: "short",
        hairColor: 0x3a2616,
        beard: null,
      };
    let outfit = "cryo_suit",
      hat = null,
      power = false;
    try {
      if (live("inventory") && G.inventory.list) {
        for (const e of G.inventory.list("apparel")) {
          if (!e || !e.equipped || !e.def) continue;
          const d = e.def;
          if ((d.slot || "body") === "body" && d.outfit) {
            outfit = d.outfit;
            power = !!d.exoRig;
          } else if (d.slot === "head") {
            const id = String(d.id || "").toLowerCase();
            hat = HAT_KEYS.find((k) => id.indexOf(k) >= 0) || "helmet";
          }
        }
      }
    } catch (e) {
      /* inventory optional */
    }
    if (power) hat = null; // an exo-rig builds its own helmet
    const opts = {
      outfit,
      gender: app.gender || P.gender || "m",
      skinTone: app.skinTone,
      hair: app.hair,
      hairColor: app.hairColor,
      beard: app.beard === undefined ? null : app.beard,
      hat,
      seed: 9,
      addToScene: false,
    };
    Object.keys(opts).forEach((k) => {
      if (opts[k] === undefined) delete opts[k];
    });
    return { opts, sig: JSON.stringify(opts) };
  }

  function disposeBody() {
    if (!body) return;
    try {
      if (body.root.parent) body.root.parent.remove(body.root);
      body.dispose();
    } catch (e) {
      /* ignore */
    }
    body = null;
    bodySig = "";
    weaponSig = "";
    G.player.tpBody = null;
  }

  function ensureBody() {
    if (failed || !live("chars") || typeof G.chars.create !== "function")
      return null;
    const look = wantedLook();
    if (body && look.sig === bodySig) return body;
    disposeBody();
    try {
      body = G.chars.create("human", look.opts);
      if (!body) {
        failed = true;
        return null;
      }
      body.autoUpdate = false;
      body.isPlayerBody = true;
      G.scene.add(body.root);
      body.root.traverse((o) => {
        if (o.isMesh) {
          o.castShadow = true;
          o.frustumCulled = false;
        }
      });
      bodySig = look.sig;
      G.player.tpBody = body; // weapons: muzzle position for tracers in third person
    } catch (e) {
      G.reportError("thirdperson:create", e);
      failed = true;
      body = null;
    }
    return body;
  }

  function syncWeapon() {
    if (!body) return;
    let id = null,
      holstered = true,
      melee = false;
    try {
      if (live("weapons") && G.weapons.current) {
        const c = G.weapons.current();
        if (c && c.id) {
          id = c.id;
          holstered = !!c.holstered;
          const w = c.weapon || {};
          melee =
            w.reloadType === "melee" ||
            w.skill === "melee_weapons" ||
            w.skill === "unarmed";
        }
      }
    } catch (e) {
      /* weapons optional */
    }
    const sig = (id || "-") + (holstered ? ":h" : ":d");
    body._tpMelee = melee;
    body._tpDrawn = !!id && !holstered;
    if (sig === weaponSig) return;
    weaponSig = sig;
    let model = null;
    if (id && !holstered && G.weapons.createWorldModel) {
      try {
        model = G.weapons.createWorldModel(id);
        if (model) model.userData.weaponId = model.userData.weaponId || id;
      } catch (e) {
        model = null;
      }
    }
    // (the old model is simply dropped: world-model geometry/materials may be shared with pickups)
    try {
      body.setWeapon(model || null);
    } catch (e) {
      /* ignore */
    }
  }

  function pickAnim(P) {
    const hv = P.moveSpeed || 0;
    if (P.swimming) return ["walk", 0.8];
    if (hv > 0.3) {
      if (P.sneaking) return ["sneak", Math.max(0.6, Math.min(1.6, hv / 2.3))];
      if (hv > 5.2) return ["run", Math.max(0.7, Math.min(1.5, hv / 7))];
      return ["walk", Math.max(0.6, Math.min(1.7, hv / 4.6))];
    }
    if (P.sneaking) return ["sneak", 1];
    if (body && body._tpDrawn && !body._tpMelee) return ["aim", 1];
    return ["idle", 1];
  }

  G.registerModule({
    name: "core_thirdperson",
    order: 90,
    init() {
      G.events.on("reset", () => {
        disposeBody();
        failed = false;
      });
      G.events.on("playerAppearance", () => {
        bodySig = "";
      });
      G.events.on("weaponFired", (def) => {
        if (!body || !G.player.thirdPersonActive) return;
        try {
          const w = (def && def.weapon) || def || {};
          const melee =
            w.reloadType === "melee" ||
            w.skill === "melee_weapons" ||
            w.skill === "unarmed";
          body.playOneShot(melee ? "attack_melee" : "attack_ranged");
        } catch (e) {
          /* ignore */
        }
      });
      G.events.on("reloaded", () => {
        if (body && G.player.thirdPersonActive) {
          try {
            body.playOneShot("reload");
          } catch (e) {
            /* ignore */
          }
        }
      });
    },
    update(dt, realDt) {
      const P = G.player;
      if (!P.thirdPersonActive) {
        if (body) body.root.visible = false;
        return;
      }
      if (!body) {
        if (!ensureBody()) return;
        sigTimer = 0;
      }
      // outfit / weapon changes (cheap poll, 3×/s)
      sigTimer -= realDt;
      if (sigTimer <= 0) {
        sigTimer = 0.33;
        if (!ensureBody()) return;
        syncWeapon();
      }
      const b = body;
      b.root.visible = true;
      b.root.position.copy(P.pos);
      b.root.rotation.y = P.yaw + (b.yawOffset || 0);
      const a = pickAnim(P);
      try {
        if (b.setAim) b.setAim(!!(b._tpDrawn && !b._tpMelee));
        b.setAnim(a[0], { loop: true, speed: a[1] });
        b.update(dt);
      } catch (e) {
        G.reportError("thirdperson:anim", e);
        disposeBody();
        failed = true;
      }
    },
  });
})();
