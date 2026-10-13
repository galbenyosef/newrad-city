// play-inline-509 02 — def
// Lines 217-954 of readable/play-inline-509.pretty.js (statement-aligned).
  class Actor {
    constructor(def) {
      const type = def.type || "human";
      const td = C.typeDef(type);
      this.uid = ++uid;
      this.def = def;
      this.id = def.id || "actor_" + this.uid;
      this.stableId = !!def.id;
      this.type = type;
      this.td = td;
      this.level = Math.max(1, Math.round(def.level || 1));
      this.faction = def.faction || td.faction || "settlers";
      this.name =
        def.name || C.rankName(type, this.level, def) || td.name || type;
      this.voice = def.voice !== undefined ? def.voice : td.voice;
      this.customBarks = def.barks || null;
      this.essential = !!def.essential;
      this.dialogue = def.dialogue || null;
      this.merchant = def.merchant || null;
      this.ai = def.ai || (td.human ? "wander" : "wander");
      this.home = def.home
        ? { x: def.home.x, z: def.home.z, r: def.home.r || 10 }
        : { x: def.pos.x, z: def.pos.z, r: def.ai === "guard" ? 2 : 12 };
      this.patrol = def.patrol || null;
      this.patrolIdx = 0;
      this.isRobot = !!td.isRobot;
      this.isCreature = !!td.isCreature;
      this.gore = td.gore || "red";
      // Stats (scaled by level)
      const hp =
        def.hp || Math.round(td.hp + (td.hpLvl || 5) * (this.level - 1));
      this.maxHp = hp;
      this.hp = hp;
      this.dr = def.dr !== undefined ? def.dr : td.dr || 0;
      this.dt = td.dt || 0;
      this.perception = td.per || 5;
      this.sight = def.aggroRange || td.sight || 50;
      this.walkSpeed = (def.speed ? def.speed * 0.4 : td.walk) || 1.6;
      this.runSpeed = def.speed || td.run || 5;
      this.damageMult = def.damage || 1;
      this.accuracy = td.accuracy || 1;
      this.xp = def.xp || td.xp || 10; // base XP; rpg scales it by level on actorKilled
      this.dead = false;
      this.hostOverride = def.hostile === undefined ? undefined : !!def.hostile;
      this.inventory = [];
      this.loot = def.loot || null;
      // Limbs: each targetable part has its own condition (crippling)
      this.limbs = {};
      // AI state
      this.state = "idle";
      this.stateT = 0;
      this.target = null;
      this.lastKnown = null;
      this.awareness = 0;
      this.detectedPlayer = false;
      this.inCombat = false;
      this.fleeing = false;
      this.moveGoal = null;
      this.followTarget = null;
      this.yaw = def.yaw || 0;
      this.vy = 0;
      this.onDeath = def.onDeath || null;
      this.onTalk = def.onTalk || null;
      this.noRespawn = !!def.noRespawn;
      this.group = def._group || null; // population group (location / encounter)
      this.roaming = !!def._roaming;
      this._t = Math.random() * 10; // per-actor timer offset (staggering)
      // Character
      this.char = createCharacter(
        type,
        Object.assign({}, def, { level: this.level }),
      );
      this.height = this.char.height || td.height || 1.8;
      this.radius = Math.max(
        0.25,
        Math.min(1.6, this.char.radius || td.radius || 0.35),
      );
      this.pos = this.char.root.position;
      this.char.root.userData.actor = this;
      this.hover = def.hover !== undefined ? def.hover : td.hover || 0;
      this.flying = this.hover > 0;
      // G.chars builds the hover height into the rig itself: keep the root on the ground then
      if (!this.char.placeholder && this.hover && def.hover === undefined) {
        let ci = null;
        try {
          ci = G.chars.info(type);
        } catch (e) {
          ci = null;
        }
        if (ci && ci.hover) this.hover = 0;
      }
      const y0 = def.pos.y !== undefined ? def.pos.y : 0;
      this.pos.set(def.pos.x, y0, def.pos.z);
      if (!this.hover)
        this.pos.y = G.world.groundHeight(
          def.pos.x,
          def.pos.z,
          y0 + 0.6,
          this.radius * 0.5,
        );
      else
        this.pos.y =
          G.world.groundHeight(def.pos.x, def.pos.z, y0 + 0.6, 0.2) +
          this.hover;
      this.applyYaw();
      this.char.root.traverse((o) => {
        if (o.isMesh) o.userData.actor = this;
      });
      // Weapon
      this.weaponId = null;
      this.weapon = null;
      this.weaponModel = null;
      this.magLeft = 0;
      this.natural = td.natural ? C.NATURAL[td.natural] : null;
      this._resolveWeapon(def);
      // Inventory & loot
      this._buildInventory(def);
      this.inScene = false;
      this.hitParts = null;
      this._anim = null;
    }

    // ---- basic helpers --------------------------------------------------
    applyYaw() {
      this.char.root.rotation.y = this.yaw + (this.char.yawOffset || 0);
    }
    get alive() {
      return !this.dead;
    }
    forward(out) {
      return (out || new THREE.Vector3()).set(
        -Math.sin(this.yaw),
        0,
        -Math.cos(this.yaw),
      );
    }
    /** Eye/head position (world). */
    eyePos(out) {
      out = out || new THREE.Vector3();
      const h = this.char.parts && this.char.parts.head;
      if (h && this.inScene && !this.dead) {
        h.getWorldPosition(out);
        out.y += 0.08;
        return out;
      }
      return out.set(this.pos.x, this.pos.y + this.height * 0.9, this.pos.z);
    }
    centerPos(out) {
      return (out || new THREE.Vector3()).set(
        this.pos.x,
        this.pos.y + (this.dead ? 0.3 : this.height * 0.55),
        this.pos.z,
      );
    }
    distTo(p) {
      return Math.hypot(p.x - this.pos.x, p.z - this.pos.z);
    }
    distToPlayer() {
      const p = G.player.pos;
      return Math.hypot(p.x - this.pos.x, p.z - this.pos.z);
    }

    /** Hostile to the player? */
    hostile() {
      if (this.dead) return false;
      if (this.frenzied || this._zoneAggro) return true; // _zoneAggro: town guards answering gunfire (45_safezone)
      if (this.hostOverride !== undefined) return this.hostOverride;
      return G.combat.relation(this.faction, "player") === "hostile";
    }
    setHostile(b) {
      const was = this.hostile();
      this.hostOverride = b === undefined ? undefined : !!b;
      // stood down (truce, surrender, a visitor pass…): leave combat properly — clearing only the target left
      // `inCombat` set with the actor idle, so canTalk() stayed false for good (untalkable quest NPCs)
      if (!this.hostile() && this.target === "player") {
        if (C.leaveCombat) C.leaveCombat(this, "idle");
        else {
          this.target = null;
          this.inCombat = false;
          this.setState("idle");
        }
      }
      if (
        !was &&
        this.hostile() &&
        this.dialogue &&
        G.dialogue &&
        !G.isStub("dialogue") &&
        G.dialogue.isActive &&
        G.dialogue.isActive()
      ) {
        try {
          G.dialogue.end();
        } catch (e) {
          /* ignore */
        }
      }
    }
    /** Is `other` (actor | 'player') an enemy of this actor? */
    isEnemy(other) {
      if (other === "player") return this.hostile();
      if (!other || other.dead || other === this) return false;
      if (this.frenzied || other.frenzied) return true;
      // Town guards (45_safezone): anything player-hostile inside their zone is a target, and it shoots back
      if (this.safeGuard && C.safeIntruder && C.safeIntruder(this, other))
        return true;
      if (other.safeGuard && C.safeIntruder && C.safeIntruder(other, this))
        return true;
      // Player-aligned followers fight whatever the player fights
      const fa = this.following === "player" ? "player" : this.faction;
      const fb = other.following === "player" ? "player" : other.faction;
      if (fa === "player" && other.hostile()) return true;
      if (fb === "player" && this.hostile()) return true;
      return G.combat.relation(fa, fb) === "hostile";
    }

    setState(s) {
      if (this.state === s) return;
      this.prevState = this.state;
      this.state = s;
      this.stateT = 0;
    }
    damage(amount, info) {
      return C.applyDamage(this, amount, info || {});
    }
    kill(info) {
      if (this.dead) return;
      C.killActor(this, info || {});
    }
    heal(n) {
      if (this.dead) return;
      this.hp = Math.min(this.maxHp, this.hp + n);
    }

    /** Floating subtitle bark. */
    say(text, dur) {
      if (!text || this.dead) return;
      C.showBark(this, text, dur);
    }
    bark(cat, chance) {
      if (chance !== undefined && Math.random() > chance) return;
      const now = G.time.elapsed;
      if (
        this._lastBark &&
        now - this._lastBark < 4 &&
        cat !== "allyDown" &&
        cat !== "flee"
      )
        return;
      let line = null;
      if (this.customBarks) {
        if (Array.isArray(this.customBarks)) {
          if (cat === "idle" || cat === "greet")
            line = C.pick(this.customBarks);
        } else if (this.customBarks[cat]) line = C.pick(this.customBarks[cat]);
      }
      if (!line) line = C.bark(this.voice, cat);
      if (line) {
        this._lastBark = now;
        this.say(line);
      }
      // creatures/robots vocalise with sounds instead
      const snd =
        this.td.sounds &&
        (cat === "alert"
          ? this.td.sounds.alert
          : cat === "hurt"
            ? this.td.sounds.hurt
            : cat === "idle"
              ? this.td.sounds.idle
              : null);
      if (snd && !line)
        C.sfx(snd, {
          pos: this.pos,
          volume: 0.8,
          pitch:
            this.type === "colossus" || this.type === "shellback_matriarch"
              ? 0.6
              : 0.9 + Math.random() * 0.2,
        });
      else if (
        snd &&
        (this.isRobot || this.type === "brute") &&
        cat === "alert"
      )
        C.sfx(snd, { pos: this.pos, volume: 0.7 });
    }

    moveTo(x, z) {
      this.moveGoal = { x, z };
      if (this.state === "idle" || this.state === "follow")
        this.setState("move");
    }
    follow(t) {
      this.followTarget = t || null;
      this.following = t === "player" || t === G.player ? "player" : t || null;
      if (t) this.setState("follow");
      else this.setState("idle");
    }
    stop() {
      this.moveGoal = null;
      if (this.state === "move") this.setState("idle");
    }
    faceTowards(x, z, rate, dt) {
      const want = Math.atan2(-(x - this.pos.x), -(z - this.pos.z));
      if (!rate || !dt) this.yaw = want;
      else
        this.yaw += C.clamp(
          G.util.angleDiff(this.yaw, want),
          -rate * dt,
          rate * dt,
        );
      this.applyYaw();
    }

    canTalk() {
      if (this.dead || this.knockedOut || this.hostile() || this.inCombat)
        return false;
      if (this.onTalk || this.dialogue || this.merchant) return true;
      return !this.isCreature && !this.isRobot && this.type !== "sky_eye";
    }
    talk() {
      this.faceTowards(G.player.pos.x, G.player.pos.z);
      if (this.onTalk) {
        try {
          this.onTalk(this);
        } catch (e) {
          G.reportError("combat:onTalk", e);
        }
        return;
      }
      if (
        this.dialogue &&
        !G.isStub("dialogue") &&
        typeof G.dialogue.start === "function"
      ) {
        G.dialogue.start(this.dialogue, this);
        return;
      }
      if (
        this.merchant &&
        !G.isStub("trade") &&
        typeof G.barter.open === "function"
      ) {
        this.say(
          C.bark(this.voice === "merchant" ? "merchant" : "merchant", "greet"),
          3,
        );
        G.barter.open(this);
        return;
      }
      let line = null;
      if (this.customBarks)
        line = Array.isArray(this.customBarks)
          ? C.pick(this.customBarks)
          : this.customBarks.greet
            ? C.pick(this.customBarks.greet)
            : null;
      // Faction armour on the player changes how people greet you
      if (!line) {
        const af = C.playerArmorFaction();
        const t = af && C.ARMOR_GREET[af];
        const v =
          this.voice ||
          (this.faction === "continuity"
            ? "continuity"
            : this.faction === "covenant"
              ? "covenant"
              : null);
        if (t && v && t[v] && Math.random() < 0.8) line = C.pick(t[v]);
      }
      if (!line)
        line = C.bark(this.voice, "greet") || C.bark("settler", "greet");
      this.say(line, 4.5);
      if (this.char.playOneShot)
        try {
          this.char.playOneShot("talk");
        } catch (e) {
          /* ignore */
        }
    }
    /** Activating an unaware NPC while sneaking opens their pockets. */
    canPickpocket() {
      return (
        !this.dead &&
        G.player.sneaking &&
        !this.hostile() &&
        !this.inCombat &&
        this.td.human &&
        !this.talking &&
        !this.knockedOut &&
        this.following !== "player" &&
        !G.isStub("containers") &&
        !G.isStub("ui") &&
        typeof G.containers.fromActor === "function"
      );
    }
    pickpocket() {
      let c = null;
      try {
        c = this.container || G.containers.fromActor(this);
      } catch (e) {
        G.reportError("combat:pickpocket", e);
      }
      if (!c) {
        this.talk();
        return;
      }
      this.container = c;
      const actor = this;
      c.owner = this.faction;
      c.pickpocket = true;
      c.onTake = function (id, n) {
        if (actor.dead) return;
        if (id === actor.weaponId) actor.equipWeapon(null);
        let d = null;
        try {
          d = G.items.get(id);
        } catch (e) {
          d = null;
        }
        const value = (d ? d.value || 1 : 1) * (n || 1);
        const sneak = C.skill("stealth", 15);
        const chance = C.clamp(
          0.06 + value / 260 + (d ? d.weight || 0 : 1) * 0.025 - sneak / 260,
          0.03,
          0.95,
        );
        if (Math.random() < chance) {
          G.notify("You were caught pickpocketing!");
          C.sfx("sneak_detected", { volume: 0.9 });
          actor.say(
            C.pick([
              "Hey! Get your hands out of my pockets!",
              "Thief! THIEF!",
              "You picked the wrong pocket, pal.",
              "Do I look like a vending machine to you?!",
            ]),
            3.5,
          );
          if (!actor.essential) actor.setHostile(true);
          actor.awareness = 1;
          if (G.state === "container") G.setState("play");
          if (actor.hostile()) C.enterCombat(actor, "player");
          G.events.emit("crime", {
            type: "pickpocket",
            owner: actor.faction,
            value,
            witness: actor,
          });
        }
      };
      G.ui.openContainer(c);
    }
    /** Loot the corpse. */
    search() {
      if (
        !this.container &&
        !G.isStub("containers") &&
        typeof G.containers.fromActor === "function"
      ) {
        try {
          this.container = G.containers.fromActor(this);
        } catch (e) {
          G.reportError("combat:fromActor", e);
        }
      }
      if (
        this.container &&
        !G.isStub("ui") &&
        typeof G.ui.openContainer === "function"
      ) {
        G.ui.openContainer(this.container);
        return;
      }
      // Fallback: take everything straight into the inventory
      if (!G.isStub("inventory") && this.inventory.length) {
        for (const [id, n] of this.inventory) {
          try {
            if (id === "scrip" && G.inventory.addCaps) G.inventory.addCaps(n);
            else G.inventory.add(id, n);
          } catch (e) {
            /* ignore */
          }
        }
        this.inventory = [];
        C.sfx("pickup");
      } else G.notify(this.name + ": nothing of value.");
    }
    interactPos() {
      if (this.dead) return _v2.set(this.pos.x, this.pos.y + 0.35, this.pos.z);
      return _v2.set(
        this.pos.x,
        this.pos.y + Math.min(this.height * 0.8, 1.7),
        this.pos.z,
      );
    }

    // ---- weapon ---------------------------------------------------------
    _resolveWeapon(def) {
      let wid = def.weapon || null;
      if (wid === "none") wid = null;
      else if (
        !wid &&
        !this.isCreature &&
        !this.isRobot &&
        def.weapon === undefined
      ) {
        const poolKey =
          def._pool !== undefined
            ? def._pool
            : this.type === "raider"
              ? "raider"
              : this.type === "brute"
                ? "brute"
                : this.type === "continuity_soldier"
                  ? "continuity_soldier"
                  : this.type === "covenant_warden"
                    ? "covenant_warden"
                    : null;
        if (poolKey) wid = C.pickWeapon(poolKey, this.level);
      }
      this.equipWeapon(wid);
    }
    equipWeapon(wid) {
      if (this.weaponModel && this.char.setWeapon) {
        try {
          this.char.setWeapon(null);
        } catch (e) {
          /* ignore */
        }
      }
      this.weaponModel = null;
      const info = wid ? C.weaponInfo(wid) : null;
      if (!info) {
        this.weaponId = null;
        this.weapon = null;
        if (!this.natural && !this.isCreature) this.natural = C.NATURAL.fists;
        return;
      }
      this.weaponId = wid;
      this.weapon = info;
      this.magLeft = info.magSize || 0;
      if (this.natural === C.NATURAL.fists) this.natural = null;
      try {
        const m = weaponModel(wid, info);
        if (m && this.char.setWeapon) {
          this.char.setWeapon(m);
          this.weaponModel = m;
          m.traverse((o) => {
            o.userData.actor = this;
          });
        }
      } catch (e) {
        G.reportError("combat:setWeapon", e);
      }
      this.hitParts = null; // recompute (weapon part)
    }
    /** Knock the weapon out of the actor's hands (crippled arm / weapon shot). */
    disarm() {
      if (!this.weaponId || this.dead) return;
      const wid = this.weaponId;
      const p = this.weaponModel
        ? this.weaponModel.getWorldPosition(new THREE.Vector3())
        : this.centerPos();
      if (
        G.isStub("items") &&
        !this.char.placeholder &&
        typeof this.char.dropWeapon === "function"
      ) {
        try {
          this.char.dropWeapon();
        } catch (e) {
          /* ignore */
        }
        this.weaponModel = null;
      }
      this.equipWeapon(null);
      // Remove from its inventory and drop it in the world as a pickup
      const i = this.inventory.findIndex((e) => e[0] === wid);
      if (i >= 0) this.inventory.splice(i, 1);
      if (!G.isStub("items") && typeof G.items.spawnPickup === "function") {
        p.y = Math.max(p.y - 0.8, G.world.groundHeight(p.x, p.z, p.y) + 0.05);
        try {
          const pk = G.items.spawnPickup(wid, 1, p);
          if (pk) this._droppedGun = { p: pk, wid };
        } catch (e) {
          G.reportError("combat:spawnPickup", e);
        }
      }
      this.bark("disarmed", 0.9);
      this.disarmed = true;
      this._lostWeapon = wid;
      this._rearm = null;
    }
    /** World position of the weapon muzzle (or a sensible guess). */
    muzzlePos(out) {
      out = out || new THREE.Vector3();
      if (
        this.inScene &&
        !this.char.placeholder &&
        typeof this.char.getMuzzle === "function"
      ) {
        try {
          const m = this.char.getMuzzle(out, _v1);
          if (m && m.pos) return out;
        } catch (e) {
          /* fall through */
        }
      }
      if (this.weaponModel && this.inScene) {
        const mz = this.weaponModel.getObjectByName("muzzle");
        if (mz) return mz.getWorldPosition(out);
        this.weaponModel.getWorldPosition(out);
        const f = this.forward(_v1);
        out.addScaledVector(f, 0.45);
        return out;
      }
      const f = this.forward(_v1);
      out.set(
        this.pos.x + f.x * (this.radius + 0.25),
        this.pos.y + this.height * (this.hover ? 0.5 : 0.78),
        this.pos.z + f.z * (this.radius + 0.25),
      );
      // offset to the right hand
      out.x += -f.z * 0.18;
      out.z += f.x * 0.18;
      return out;
    }

    // ---- inventory ------------------------------------------------------
    _buildInventory(def) {
      const inv = [];
      const add = (id, n) => {
        if (!id || n <= 0) return;
        if (
          !G.isStub("items") &&
          typeof G.items.get === "function" &&
          id !== "scrip" &&
          !G.items.get(id)
        )
          return;
        const e = inv.find((x) => x[0] === id);
        if (e) e[1] += n;
        else inv.push([id, n]);
      };
      if (def.inventory) for (const [id, n] of def.inventory) add(id, n || 1);
      if (this.weaponId) {
        add(this.weaponId, 1);
        const a = this.weapon && this.weapon.ammo;
        if (a && a !== this.weaponId)
          add(
            a,
            C.randInt(3, Math.max(4, Math.min(24, this.weapon.magSize || 8))),
          );
      }
      if (!def.noLoot) {
        const L = C.LOOT[this.type] || (this.td.human ? C.LOOT.human : null);
        // rpg loot tables are keyed by actor type (raider, brute, ripjaw…); fall back to our hints
        let rolled = false;
        if (!G.isStub("items") && typeof G.items.rollLoot === "function") {
          for (const table of [def.loot, this.type, L && L.table].filter(
            Boolean,
          )) {
            try {
              const r = G.items.rollLoot(table, this.level);
              if (Array.isArray(r) && r.length) {
                for (const [id, n] of r) add(id, n);
                rolled = true;
                break;
              }
            } catch (e) {
              /* table may not exist */
            }
          }
        }
        if (!rolled && L && L.extra) {
          for (const ex of L.extra) {
            const id = ex[0],
              ch = ex[1],
              mn = ex[2],
              mx = ex[3];
            if (Math.random() < ch) add(id, mn ? C.randInt(mn, mx || mn) : 1);
          }
        }
      }
      this.inventory = inv;
    }

    // ---- scene streaming --------------------------------------------------
    attach() {
      if (this.inScene) return;
      G.scene.add(this.char.root);
      this.inScene = true;
    }
    detach() {
      if (!this.inScene) return;
      if (this.char.root.parent) this.char.root.parent.remove(this.char.root);
      this.inScene = false;
      C.hideBark(this);
    }

    // ---- animation --------------------------------------------------------
    anim(name, speed) {
      if (
        this._anim === name &&
        Math.abs((this._animSpeed || 1) - (speed || 1)) < 0.15
      )
        return;
      this._anim = name;
      this._animSpeed = speed || 1;
      try {
        this.char.setAnim(name, { loop: name !== "death", speed: speed || 1 });
      } catch (e) {
        /* ignore */
      }
    }
    oneShot(name) {
      try {
        if (this.char.playOneShot) this.char.playOneShot(name);
      } catch (e) {
        /* ignore */
      }
    }

    dispose() {
      this.detach();
      if (this.interactable) G.world.removeInteractable(this.interactable);
      if (this.burnFx) C.stopBurnFx(this);
      if (this.pile && this.pile.parent) this.pile.parent.remove(this.pile);
      try {
        if (this.char.dispose) this.char.dispose();
      } catch (e) {
        /* ignore */
      }
      C.clearHighlight && C.clearHighlight(this);
    }
  }
