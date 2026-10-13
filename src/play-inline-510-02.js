// play-inline-510 02 — pos
// Lines 347-695 of readable/play-inline-510.pretty.js (statement-aligned).
  C.noise = function (pos, radius, source, kind) {
    for (const a of C.list) {
      if (a.dead || !a.inScene || a === source) continue;
      const d = Math.hypot(a.pos.x - pos.x, a.pos.z - pos.z);
      if (d > radius) continue;
      if (a.state === "dormant") {
        if (d < radius * 0.6) C.wake(a);
        continue;
      }
      if (a.state === "combat") continue;
      const enemy =
        source === "player" ? a.isEnemy("player") : source && a.isEnemy(source);
      // Merchants / posted quest NPCs stay at their stall: they cower instead of wandering off to investigate
      if (
        enemy &&
        (a.ai === "merchant" ||
          a.ai === "static" ||
          a.ai === "sit" ||
          a.ai === "kneel") &&
        !(source === "player" && a.isEnemy("player"))
      ) {
        if ((kind === "gun" || kind === "explosion") && a.td.human && d < 30) {
          a.setState("cower");
        }
        continue;
      }
      if (
        enemy &&
        source === "player" &&
        a.warden &&
        C.wardenHold &&
        C.wardenHold(a)
      ) {
        C.wardenNoise(a, kind, pos);
        continue;
      }
      if (enemy) {
        const strength =
          kind === "step" ? 0.3 : kind === "explosion" ? 1.0 : 0.6;
        a.awareness = Math.max(
          a.awareness,
          Math.min(0.95, a.awareness + strength * (1 - d / radius) + 0.25),
        );
        const jitter = kind === "step" ? 2 : 6;
        C.startSearch(a, {
          x: pos.x + (Math.random() - 0.5) * jitter,
          z: pos.z + (Math.random() - 0.5) * jitter,
          y: pos.y || 0,
        });
      } else if (
        source &&
        source !== "player" &&
        source.target &&
        G.combat.relation(a.faction, source.faction) === "ally" &&
        kind === "gun"
      ) {
        // Allies hear their friend shooting → join the fight
        if (!a.isCreature || a.faction === source.faction)
          C.enterCombat(a, source.target, 0.4 + Math.random() * 0.8);
      } else if (kind === "gun" || kind === "explosion") {
        // Civilians near gunfire cower
        if (
          !a.weapon &&
          !a.natural &&
          a.td.human &&
          d < 30 &&
          !a.isEnemy("player")
        ) {
          a.setState("cower");
          a.bark("cower", 0.3);
        } else if (a.td.human && !a.weapon && d < 30) {
          a.setState("cower");
        }
      }
    }
  };

  C.wake = function (a) {
    if (a.state !== "dormant") return;
    a.setState("idle");
    a.anim("idle");
    a.oneShot("hit");
    a.awareness = 0.9;
    C.sfx((a.td.sounds && a.td.sounds.alert) || "maniac_scream", {
      pos: a.pos,
      volume: 0.9,
    });
    if (a.isEnemy("player")) C.enterCombat(a, "player", 0.5);
  };

  C.startSearch = function (a, p) {
    if (a.state === "combat" || a.state === "flee" || a.dead) return;
    a.lastKnown = (a.lastKnown || new THREE.Vector3()).set(p.x, p.y || 0, p.z);
    if (a.state !== "search") {
      a.setState("search");
      a.bark("search", 0.6);
    }
    a.searchT = 10 + Math.random() * 6;
  };

  /** Enter combat against target ('player' | actor), with optional reaction delay. */
  C.enterCombat = function (a, target, delay) {
    if (a.dead || !target) return;
    if (target !== "player" && target.dead) return;
    // Trespass garrison holding fire (warnings first) — only provocation / the timer turns them
    if (target === "player" && a.warden && C.wardenHold && C.wardenHold(a))
      return;
    a.cautionUntil = 0;
    if (a.state === "dormant") {
      a.setState("idle");
      a.anim("idle");
    }
    const wasCombat = a.state === "combat";
    const prevTarget = a.target;
    a.target = target;
    if (a.state === "flee" && a.stateT < 6) return;
    a.setState("combat");
    a.inCombat = true;
    a.aimT = now() + (delay || 0) + 0.25 + Math.random() * 0.35;
    a.lastSeenT = now();
    a.lastKnown = (a.lastKnown || new THREE.Vector3()).copy(
      target === "player" ? G.player.pos : target.pos,
    );
    if (target === "player") {
      a.awareness = 1;
      a.detectedPlayer = true;
      // every time an actor turns on the player (HUD [DANGER], combat music, quests)
      if (!wasCombat || prevTarget !== "player")
        G.events.emit("playerDetected", a, { sneaking: !!G.player.sneaking });
    }
    if (!wasCombat || prevTarget !== target) {
      if (!wasCombat) {
        a.bark("alert", 0.85);
        if (a.type === "ripjaw") {
          a.roarT = now() + 0.9;
          a.oneShot("attack_melee");
        }
        if (a.type === "colossus") {
          a.roarT = now() + 1.2;
          G.player.shake(0.25, 0.6);
        }
      }
      // Group aggro: friends nearby join in
      if (!a._groupAggroT || now() - a._groupAggroT > 2) {
        a._groupAggroT = now();
        for (const o of C.list) {
          if (
            o === a ||
            o.dead ||
            !o.inScene ||
            o.state === "combat" ||
            o.state === "flee"
          )
            continue;
          if (
            o.faction !== a.faction &&
            G.combat.relation(o.faction, a.faction) !== "ally"
          )
            continue;
          if (target === "player" && !o.isEnemy("player")) continue;
          if (target !== "player" && !o.isEnemy(target)) continue;
          const d = Math.hypot(o.pos.x - a.pos.x, o.pos.z - a.pos.z);
          if (d < 28)
            C.enterCombat(o, target, 0.4 + d * 0.04 + Math.random() * 0.5);
        }
      }
    }
  };
  C.leaveCombat = function (a, toState) {
    a.inCombat = false;
    a.target = null;
    a.coverPos = null;
    a.burstLeft = 0;
    a.ducked = false;
    a._flankUntil = 0;
    a.setState(toState || "idle");
    try {
      if (a.char.lookAt) a.char.lookAt(null);
    } catch (e) {
      /* ignore */
    }
    if (toState !== "knocked") C.calmEssential(a);
  };
  /**
   * An ESSENTIAL character the player attacked (friendly before, `wasFriendly`) can never die, so staying
   * hostile for good would lock every quest that needs to talk to them. Once the fight ends (target lost, or they
   * get back up after being knocked out) they calm down and are talkable again. Quest-scripted hostility never
   * sets `wasFriendly`, so it is left alone.
   */
  C.calmEssential = function (a) {
    if (
      !a ||
      a.dead ||
      !a.essential ||
      !a.wasFriendly ||
      a.hostOverride !== true
    )
      return;
    a.wasFriendly = false;
    a.setHostile(false);
  };

  // ------------------------------------------------------------------
  // Steering & locomotion
  // ------------------------------------------------------------------
  const _dir = new THREE.Vector3();
  function blockedAhead(a, dx, dz, dist) {
    _a.set(a.pos.x, a.pos.y + Math.min(0.8, a.height * 0.5), a.pos.z);
    _dir.set(dx, 0, dz);
    const h = G.world.raycast(_a, _dir, dist + a.radius, {
      ignoreTags: ["actor"],
    });
    if (h && h.dist < dist + a.radius) {
      // a low step we can walk up onto doesn't count
      if (h.collider && h.collider.maxY <= a.pos.y + 0.55) return false;
      return true;
    }
    // water or a ledge ahead (bridge decks, rooftops, piers)
    if (!a.hover) {
      const px = a.pos.x + dx * (dist + a.radius),
        pz = a.pos.z + dz * (dist + a.radius);
      let gh = G.world.groundHeight(px, pz, a.pos.y + 0.6, 0.2);
      if (a.td.amphibious) gh = Math.max(gh, G.world.waterLevel - 0.9);
      if (gh < a.pos.y - 2.5) return true;
      if (!a.td.amphibious && gh < G.world.waterLevel - 0.3) return true;
    }
    return false;
  }
  /** Move actor toward direction (dx,dz normalised) at speed for dt, with avoidance. */
  C.steer = function (a, dx, dz, speed, dt) {
    if (a.legsCrippled) speed *= 0.55;
    if (a.slowT && a.slowT > now()) speed *= 0.4;
    const len = Math.hypot(dx, dz);
    if (len < 1e-4 || speed <= 0) {
      a.speed = 0;
      return;
    }
    a._wantMoveT = now(); // (35_reactions watchdog: "trying to walk")
    dx /= len;
    dz /= len;
    // Detour while stuck
    if (a.detourT > 0) {
      a.detourT -= dt;
      dx = a.detour.x;
      dz = a.detour.z;
    } else {
      // Feelers (throttled)
      a.feelT -= dt;
      if (a.feelT <= 0) {
        a.feelT = 0.25 + Math.random() * 0.1;
        a.avoid = null;
        const look = Math.min(2.6, 0.8 + speed * 0.35);
        if (blockedAhead(a, dx, dz, look)) {
          const base = Math.atan2(dx, dz);
          const side = a.strafeDir || 1;
          for (const off of [0.5, -0.5, 1.0, -1.0, 1.5, -1.5, 2.2, -2.2]) {
            const ang = base + off * side;
            const ex = Math.sin(ang),
              ez = Math.cos(ang);
            if (!blockedAhead(a, ex, ez, look)) {
              a.avoid = { x: ex, z: ez, t: 0.6 };
              break;
            }
          }
        }
      }
      if (a.avoid) {
        a.avoid.t -= dt;
        if (a.avoid.t <= 0) a.avoid = null;
        else {
          dx = dx * 0.25 + a.avoid.x * 0.75;
          dz = dz * 0.25 + a.avoid.z * 0.75;
          const l = Math.hypot(dx, dz) || 1;
          dx /= l;
          dz /= l;
        }
      }
    }
    const stepX = dx * speed * dt,
      stepZ = dz * speed * dt;
    const r = G.world.moveCircle(
      a.pos,
      Math.min(a.radius, 0.9),
      a.height,
      stepX,
      stepZ,
    );
    let nx = r.x,
      nz = r.z;
    // Don't walk into deep water (unless amphibious/hovering) or off a ledge (bridge deck, roof)
    if (!a.hover && (nx !== a.pos.x || nz !== a.pos.z)) {
      let ngh = G.world.groundHeight(nx, nz, a.pos.y + 0.6, 0.2);
      if (a.td.amphibious) ngh = Math.max(ngh, G.world.waterLevel - 0.9);
      if (
        ngh < a.pos.y - 2.5 ||
        (!a.td.amphibious && ngh < G.world.waterLevel - 0.3)
      ) {
        nx = a.pos.x;
        nz = a.pos.z;
      }
    }
    const moved = Math.hypot(nx - a.pos.x, nz - a.pos.z);
    a.pos.x = nx;
    a.pos.z = nz;
    a.speed = dt > 0 ? moved / dt : 0;
    // Stuck detection
    const expected = speed * dt;
    if (expected > 0.001) {
      if (moved < expected * 0.3) a.stuckT += dt;
      else a.stuckT = Math.max(0, a.stuckT - dt * 2);
      if (a.stuckT > 0.8 && a.detourT <= 0) {
        a.stuckT = 0;
        const s = Math.random() < 0.5 ? 1 : -1;
        const ang = Math.atan2(dx, dz) + s * (1.2 + Math.random() * 0.9);
        a.detour = { x: Math.sin(ang), z: Math.cos(ang) };
        a.detourT = 0.7 + Math.random() * 0.9;
        a.strafeDir = -a.strafeDir;
      }
    }
    // Face the movement direction unless aiming at something
    if (!a.faceTarget) {
      const want = Math.atan2(-dx, -dz);
      a.yaw += C.clamp(U.angleDiff(a.yaw, want), -8 * dt, 8 * dt);
      a.applyYaw();
    }
  };
  function steerTo(a, x, z, speed, dt, stopDist) {
    const dx = x - a.pos.x,
      dz = z - a.pos.z;
    const d = Math.hypot(dx, dz);
    if (d <= (stopDist || 0.4)) {
      a.speed = 0;
      return true;
    }
    C.steer(a, dx, dz, Math.min(speed, d / Math.max(dt, 1e-3)), dt);
    return false;
  }
  // ------------------------------------------------------------------
  // Local navigation: lazy 1 m occupancy grid (per 64×64 m tile) + incremental A*
  //  - Tiles cache, per 1 m cell, the terrain height and the colliders touching the cell
  //    (padded); walkability is evaluated on the fly relative to the height we arrive at
  //    (so stairs, ramps, bridge decks and interiors with several floors all work):
  //    blocked if a collider spans [h+step, h+actorHeight] at the cell centre or at the
  //    half-way point from the parent cell (thin walls), a drop > 2.2 m, or deep water.
  //  - Searches are incremental: at most NAV_NODES expansions per frame over all actors,
  //    tile builds are budgeted too, and each search is capped (best partial path wins).
  //  - Used when the goal isn't in a clear straight line, or steering got stuck; the feelers
  //    in C.steer still handle local avoidance (other actors, small props) along the path.
  // ------------------------------------------------------------------
