// play-inline-513 05 — math
// Lines 1367-1715 of readable/play-inline-513.pretty.js (statement-aligned).
  function standing() {
    try {
      return !G.isStub("rpg") && typeof G.rpg.standing === "number"
        ? G.rpg.standing
        : 0;
    } catch (e) {
      return 0;
    }
  }
  /** Which faction the player sided with in MQ04 ('covenant' | 'continuity' | null). */
  function sidedWith() {
    const f = qFlag("mq_faction");
    return f === "covenant" || f === "continuity" ? f : null;
  }
  function specialChoices() {
    const pl = C.playerLevel(),
      k = standing(),
      out = [];
    if (pl >= 4 && k >= 750) {
      out.push(["merc", 3]);
      out.push(["gift", 1.2]);
    } else if (pl >= 3 && k >= 250) out.push(["gift", 0.6]);
    if (pl >= 4 && k <= -750) out.push(["marshal", 3]);
    if (sidedWith() && qDone("mq04")) out.push(["faction", 2.5]);
    return out;
  }
  function spawnSquad(kind, p, id, g, patrolPts) {
    const S = C.STANDING_SQUADS[kind],
      P = G.player,
      pl = C.playerLevel();
    const n = C.randInt(S.count[0], S.count[1]);
    const hasNote = ensureNote(S.note);
    for (let i = 0; i < n; i++) {
      const lead = i === 0;
      const lvl = Math.max(
        4,
        pl + S.levelBonus + (lead ? 1 : C.randInt(-1, 0)),
      );
      const pos = {
        x: p.x + (Math.random() - 0.5) * 5,
        y: p.y,
        z: p.z + (Math.random() - 0.5) * 5,
      };
      const inv = lead
        ? [
            ["scrip", C.randInt(40, 120)],
            ["rally_tonic", 1],
          ].concat(hasNote ? [[S.note, 1]] : [])
        : [["scrip", C.randInt(5, 30)]];
      const a = G.actors.spawn({
        type: "human",
        outfit: S.outfit,
        hat: S.hat,
        hatColor: S.hat ? 0x3a2a1a : undefined,
        faction: S.faction,
        voice: S.voice,
        name: lead ? S.leader : S.member,
        level: lvl,
        pos,
        yaw: Math.atan2(-(P.pos.x - p.x), -(P.pos.z - p.z)),
        ai: "patrol",
        patrol: patrolPts,
        weapon: C.pickWeapon(S.pool, lvl + (lead ? 2 : 0)),
        inventory: inv,
        evil: !!S.evil,
        xp: lead ? 45 : 30,
        hp: Math.round(60 + lvl * 9),
        _group: id,
        _roaming: true,
        noRespawn: true,
        gender: Math.random() < 0.7 ? "m" : "f",
      });
      if (a) {
        a.accuracy = lead ? 1.2 : 1.05;
        a.dr = 18;
        g.actors.push(a);
      }
    }
    g.hunt = true;
  }
  function spawnGiftGiver(p, id, g, patrolPts) {
    const gift = C.pick(C.GIFTS).filter(
      (e) =>
        e[0] === "scrip" ||
        G.isStub("items") ||
        typeof G.items.get !== "function" ||
        G.items.get(e[0]),
    );
    const a = G.actors.spawn({
      type: "human",
      outfit: C.pick(["settler", "drifter", "merchant"]),
      faction: "settlers",
      name: "Grateful Stranger",
      voice: "gift",
      level: 3,
      pos: p,
      ai: "patrol",
      patrol: patrolPts,
      weapon: "none",
      hostile: false,
      _group: id,
      _roaming: true,
      noRespawn: true,
      gender: Math.random() < 0.5 ? "m" : "f",
    });
    if (!a) return;
    a.giftItems = gift.length ? gift : [["scrip", 60]];
    a.onTalk = (who) => deliverGift(who);
    g.actors.push(a);
    g.hunt = true;
    g.gift = true;
  }
  function deliverGift(a) {
    if (!a || a.dead || a.giftDone) {
      if (a && !a.dead) a.say("Take care of yourself out there, friend.", 3);
      return;
    }
    a.giftDone = true;
    a.faceTowards(G.player.pos.x, G.player.pos.z);
    a.say(C.bark("gift", "greet"), 5);
    const names = [];
    for (const [id, n] of a.giftItems) {
      try {
        if (id === "scrip" && !G.isStub("inventory") && G.inventory.addCaps)
          G.inventory.addCaps(n);
        else if (!G.isStub("inventory")) G.inventory.add(id, n);
        let nm = id;
        try {
          const d = G.items.get(id);
          if (d && d.name) nm = d.name;
        } catch (e) {
          /* ignore */
        }
        names.push(
          (n > 1 ? n + " " : "") + (id === "scrip" ? "Bottle Caps" : nm),
        );
      } catch (e) {
        /* ignore */
      }
    }
    if (names.length) G.notify("Received: " + names.join(", "));
    C.sfx("pickup");
    // wander off afterwards
    a.patrol = [
      {
        x: a.pos.x + (Math.random() - 0.5) * 120,
        z: a.pos.z + (Math.random() - 0.5) * 120,
      },
    ];
    a.patrolIdx = 0;
  }
  function spawnFactionPatrol(p, id, g, patrolPts) {
    const side = sidedWith(),
      P = G.player,
      pl = C.playerLevel();
    const allyType =
      side === "covenant" ? "covenant_warden" : "continuity_soldier";
    const n = C.randInt(2, 3);
    for (let i = 0; i < n; i++) {
      const lvl = Math.max(6, pl + C.randInt(-1, 1));
      const a = G.actors.spawn({
        type: allyType,
        faction: side === "covenant" ? "covenant" : "continuity",
        voice: side === "covenant" ? "covenant" : "continuity",
        name:
          side === "covenant"
            ? i === 0
              ? "Covenant Warden"
              : "Covenant Lancer"
            : i === 0
              ? "Continuity Sergeant"
              : "Continuity Trooper",
        level: lvl,
        pos: {
          x: p.x + (Math.random() - 0.5) * 5,
          y: p.y,
          z: p.z + (Math.random() - 0.5) * 5,
        },
        ai: "patrol",
        patrol: patrolPts,
        hostile: false,
        _group: id,
        _roaming: true,
        noRespawn: true,
      });
      if (a) {
        a.alliedPatrol = side;
        g.actors.push(a);
      }
    }
    // …and more often than not, the other side shows up too
    if (Math.random() < 0.6) {
      const foeType =
        side === "covenant" ? "continuity_soldier" : "covenant_warden";
      const ang = Math.random() * 6.283;
      const fx = p.x + Math.sin(ang) * 35,
        fz = p.z + Math.cos(ang) * 35;
      const fy = C.freeSpot(fx, fz, 0.5, 0, false);
      if (fy !== null && Math.abs(fy) < 1.5) {
        const m = C.randInt(1, 2);
        for (let i = 0; i < m; i++) {
          const a = G.actors.spawn({
            type: foeType,
            level: Math.max(5, pl + C.randInt(-2, 0)),
            pos: {
              x: fx + (Math.random() - 0.5) * 4,
              y: fy,
              z: fz + (Math.random() - 0.5) * 4,
            },
            ai: "patrol",
            patrol: [
              { x: p.x, z: p.z },
              { x: P.pos.x, z: P.pos.z },
            ],
            _group: id,
            _roaming: true,
            noRespawn: true,
          });
          if (a) g.actors.push(a);
        }
        if (foeType === "continuity_soldier" && Math.random() < 0.5) {
          const e = G.actors.spawn({
            type: "sky_eye",
            level: Math.max(4, pl - 2),
            pos: { x: fx, y: fy, z: fz },
            ai: "patrol",
            patrol: [{ x: p.x, z: p.z }],
            _group: id,
            _roaming: true,
            noRespawn: true,
          });
          if (e) g.actors.push(e);
        }
      }
    }
    g.factionSide = side;
  }
  function trySpecialEncounter() {
    const day = gameDay();
    if (
      day -
        (C.roam.lastSpecialDay === undefined ? -99 : C.roam.lastSpecialDay) <
      2
    )
      return false;
    const ch = specialChoices();
    if (!ch.length || Math.random() < 0.4) return false;
    const kind = C.weighted(ch);
    const p = roamSpawnPoint(false);
    if (!p) return false;
    const P = G.player;
    const id = "roam_" + ++C.roam.n;
    const g = {
      id,
      kind: "roam",
      actors: [],
      state: "active",
      spawnT: G.time.elapsed,
      special: kind,
    };
    const pts = [
      {
        x: P.pos.x + (Math.random() - 0.5) * 10,
        z: P.pos.z + (Math.random() - 0.5) * 10,
      },
      { x: p.x, z: p.z },
    ];
    if (kind === "merc" || kind === "marshal") spawnSquad(kind, p, id, g, pts);
    else if (kind === "gift") spawnGiftGiver(p, id, g, pts);
    else
      spawnFactionPatrol(p, id, g, [
        { x: p.x, z: p.z },
        {
          x: P.pos.x + (Math.random() - 0.5) * 40,
          z: P.pos.z + (Math.random() - 0.5) * 40,
        },
        { x: 2 * P.pos.x - p.x, z: 2 * P.pos.z - p.z },
      ]);
    if (!g.actors.length) return false;
    C.roam.groups.push(g);
    C.roam.lastSpecialDay = day;
    return true;
  }
  /** Debug / quests: force a world-reaction encounter now ('merc' | 'marshal' | 'gift' | 'faction'). Returns its actors. */
  G.combat.spawnSpecialEncounter = function (kind) {
    const p = roamSpawnPoint(false);
    if (!p) return [];
    const P = G.player,
      id = "roam_" + ++C.roam.n;
    const g = {
      id,
      kind: "roam",
      actors: [],
      state: "active",
      spawnT: G.time.elapsed,
      special: kind,
    };
    const pts = [
      { x: P.pos.x, z: P.pos.z },
      { x: p.x, z: p.z },
    ];
    if (kind === "merc" || kind === "marshal") spawnSquad(kind, p, id, g, pts);
    else if (kind === "gift") spawnGiftGiver(p, id, g, pts);
    else if (sidedWith()) spawnFactionPatrol(p, id, g, pts);
    if (g.actors.length) {
      C.roam.groups.push(g);
      C.roam.lastSpecialDay = gameDay();
    }
    return g.actors.slice();
  };
  /** Hunters (hit squads, the gift-giver) keep homing in on the player until they meet. */
  function updateHunters(g) {
    if (!g.hunt) return;
    const P = G.player,
      t = G.time.elapsed;
    if (g._huntT && t < g._huntT) return;
    g._huntT = t + 6;
    for (const a of g.actors) {
      if (a.dead || a.inCombat || a.state === "flee" || (g.gift && a.giftDone))
        continue;
      if (g.gift) {
        const d = a.distToPlayer();
        if (d < 4 && a.seesPlayer !== false && P.alive && G.state === "play") {
          deliverGift(a);
          continue;
        }
        if (d < 30 && !a._hailed) {
          a._hailed = true;
          a.say(
            C.pick([
              "Hey! You there — wait up!",
              "Excuse me! Hold on a second!",
              "Hello! You! Please, wait!",
            ]),
            3,
          );
        }
      }
      a.patrol = [
        {
          x: P.pos.x + (Math.random() - 0.5) * (g.gift ? 2 : 8),
          z: P.pos.z + (Math.random() - 0.5) * (g.gift ? 2 : 8),
        },
      ];
      a.patrolIdx = 0;
    }
    if (g.gift) g._huntT = t + 1; // the stranger checks more often (hand-over distance)
  }

