// play-inline-508 03 — rotation
// Lines 686-857 of readable/play-inline-508.pretty.js (statement-aligned).
  function animate(ch, dt) {
    ch._animT += dt * ch._speed;
    const t = ch._animT,
      P = ch.parts;
    if (ch._dead) {
      ch._deathT = Math.min(1, ch._deathT + dt * 1.8);
      const k = ch._deathT;
      const e = k < 1 ? 1 - Math.pow(1 - k, 3) : 1;
      if (ch.kind === "biped") {
        ch.body.rotation.x = ((ch._deathDir * e * Math.PI) / 2) * 0.98;
        ch.body.position.y = e * 0.15;
      } else if (ch.kind === "float" || ch.kind === "fly") {
        ch.body.rotation.z = e * 1.2;
      } else {
        ch.body.rotation.z = e * Math.PI * 0.95;
        ch.body.position.y = e * 0.25;
      }
      if (P.leftArm) P.leftArm.rotation.x = -0.6 * e;
      if (P.rightArm) P.rightArm.rotation.x = -1.0 * e;
      return;
    }
    const a = ch._anim;
    const moving = a === "walk" || a === "run" || a === "stealth";
    const freq = a === "run" ? 11 : a === "stealth" ? 4.5 : 7;
    const amp = a === "run" ? 0.9 : a === "stealth" ? 0.35 : 0.5;
    const s = moving ? Math.sin(t * freq) * amp : 0;
    if (ch.kind === "biped") {
      if (P.leftLeg) P.leftLeg.rotation.x = s;
      if (P.rightLeg) P.rightLeg.rotation.x = -s;
      let la = -s * 0.8,
        ra = s * 0.8;
      if (a === "aim" || ch._armed) ra = -1.35; // rifle-at-shoulder pose
      if (ch._armed && (a === "aim" || a === "idle")) la = -1.2;
      if (P.leftArm) P.leftArm.rotation.x = la;
      if (P.rightArm) P.rightArm.rotation.x = ra;
      if (ch.hips)
        ch.hips.position.y =
          (ch.hips.userData.y0 || (ch.hips.userData.y0 = ch.hips.position.y)) -
          (a === "stealth" ? 0.25 : 0) +
          (moving ? Math.abs(Math.cos(t * freq)) * 0.04 : 0);
      if (P.torso)
        P.torso.rotation.x = a === "stealth" ? 0.35 : a === "run" ? 0.15 : 0;
    } else if (ch.kind === "quad" || ch.kind === "crab" || ch.kind === "bug") {
      if (P.leftArm) P.leftArm.rotation.x = s;
      if (P.rightLeg) P.rightLeg.rotation.x = s;
      if (P.rightArm) P.rightArm.rotation.x = -s;
      if (P.leftLeg) P.leftLeg.rotation.x = -s;
      if (ch.kind === "bug" && P.leftArm) {
        P.leftArm.rotation.y = Math.sin(t * 5) * 0.3;
        P.rightArm.rotation.y = -Math.sin(t * 5.3) * 0.3;
      }
    } else if (ch.kind === "fly") {
      if (P.leftArm) P.leftArm.rotation.z = Math.sin(t * 60) * 0.6;
      if (P.rightArm) P.rightArm.rotation.z = -Math.sin(t * 60) * 0.6;
      ch.body.position.y = Math.sin(t * 3) * 0.08;
    } else if (ch.kind === "float") {
      ch.body.position.y = Math.sin(t * 2.2) * 0.06;
      if (P.head) P.head.rotation.y = Math.sin(t * 0.7) * 0.4;
    }
    // One-shots (attack / hit)
    if (ch._oneShot) {
      ch._oneShotT += dt;
      const k = ch._oneShotT / 0.45;
      if (k >= 1) ch._oneShot = null;
      else {
        const w = Math.sin(k * Math.PI);
        if (ch._oneShot === "attack_melee") {
          if (P.rightArm) P.rightArm.rotation.x = -2.4 * w + 0.6 * k;
          if (P.head && ch.kind !== "biped") P.head.rotation.x = -0.5 * w;
        } else if (ch._oneShot === "attack_ranged") {
          if (P.rightArm) P.rightArm.rotation.x = -1.35 - 0.2 * w;
        } else if (ch._oneShot === "hit") {
          if (P.torso) P.torso.rotation.x = -0.35 * w;
        } else if (ch._oneShot === "reload") {
          if (P.leftArm) P.leftArm.rotation.x = -0.8 - 0.6 * w;
        }
      }
    }
  }

  C.createPlaceholder = function (type, opts) {
    const ch = build(type, opts || {});
    ch.setAnim = function (name) {
      if (name === "death" || name === "dead") {
        if (!ch._dead) {
          ch._dead = true;
          ch._deathT = name === "dead" ? 1 : 0;
          ch._deathDir = Math.random() < 0.7 ? 1 : -1;
        }
        return;
      }
      if (ch._dead) {
        ch._dead = false;
        ch.body.rotation.set(ch.type === "ripjaw" ? -0.25 : 0, 0, 0);
        ch.body.position.y = 0;
      }
      ch._anim = name;
    };
    ch.playOneShot = function (name) {
      ch._oneShot = name;
      ch._oneShotT = 0;
    };
    ch.update = function (dt) {
      animate(ch, dt);
    };
    ch.lookAt = function () {
      /* placeholder ignores head tracking */
    };
    ch.setWeapon = function (obj) {
      if (ch._weapon && ch._weapon.parent) ch._weapon.parent.remove(ch._weapon);
      ch._weapon = obj || null;
      ch._armed = !!obj;
      if (obj && ch.hand) {
        ch.hand.add(obj);
        obj.rotation.set(0, 0, 0);
        obj.position.set(0, 0, 0);
      }
    };
    ch.dismember = function (part) {
      const p = ch.parts[part];
      if (!p || ch._hidden.has(part)) return [];
      ch._hidden.add(part);
      p.traverse((o) => {
        if (o.isMesh) o.visible = false;
      });
      return []; // combat spawns generic gib chunks itself
    };
    ch.dispose = function () {
      if (ch.root.parent) ch.root.parent.remove(ch.root);
    };
    ch.root.traverse((o) => {
      if (o.isMesh) o.receiveShadow = false;
    });
    return ch;
  };

  /** Simple world model for an NPC weapon when G.weapons can't make one. */
  C.placeholderWeaponModel = function (wid, info) {
    const g = new THREE.Group();
    const dark = mat(0x2a2a2a, { metalness: 0.6, roughness: 0.5 }),
      wood = mat(0x5a3a22);
    if (info && info.melee) {
      mesh(cyl(0.025, 0.03, 0.8), wood, 0, 0, -0.35, g).rotation.x =
        Math.PI / 2;
      if (wid === "fire_axe") mesh(box(0.03, 0.14, 0.2), dark, 0, 0, -0.75, g);
    } else {
      const long = info && (info.range > 100 || info.automatic);
      mesh(
        box(0.05, 0.08, long ? 0.55 : 0.22),
        dark,
        0,
        0.02,
        long ? -0.2 : -0.08,
        g,
      );
      mesh(
        cyl(0.015, 0.015, long ? 0.4 : 0.15),
        dark,
        0,
        0.05,
        long ? -0.6 : -0.25,
        g,
      ).rotation.x = Math.PI / 2;
      if (long) mesh(box(0.05, 0.1, 0.25), wood, 0, -0.01, 0.15, g);
      mesh(box(0.04, 0.12, 0.05), dark, 0, -0.07, 0, g);
    }
    const muzzle = new THREE.Object3D();
    muzzle.name = "muzzle";
    muzzle.position.set(0, 0.05, info && info.range > 100 ? -0.8 : -0.35);
    g.add(muzzle);
    return g;
  };
