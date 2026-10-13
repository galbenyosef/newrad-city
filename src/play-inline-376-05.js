// play-inline-376 05 — relay
// Lines 801-1143 of readable/play-inline-376.pretty.js (statement-aligned).
  C.overloadRelay = function () {
    if (F.relay !== "on") return;
    F.relay = "off";
    const a = A("helmsley", "relay");
    if (a) {
      const p = new THREE.Vector3(a.x, a.y + 4, a.z - 3);
      P.safe("boom", () => {
        if (!G.isStub("fx")) {
          G.fx.explosion(p, 2.5, "plasma");
          G.fx.sparks(p);
          G.fx.smoke(p.clone().add(new THREE.Vector3(0, 2, 0)), 1.5);
        }
      });
      sfx("explosion", { pos: p, volume: 0.8 });
      if (G.player) P.safe("shake", () => G.player.shake(0.6, 1.2));
    }
    applyRelay();
    G.notify(
      "Relay 7 is dead. For the first time in a year, the midtown band is silent.",
    );
    standing(10, "Silenced the Continuity relay");
    news(
      "Word from Midtown, folks: the Continuity's big red eye on top of the New York Central Building went dark tonight. Somebody walked right up to the crown and pulled the plug. Whoever you are — the drinks at Radio City are on me.",
      "m3_relay_off",
    );
    qComplete("m3_dead_air");
    G.events.emit("continuityRelaySilenced", { id: "helmsley", mode: "off" });
  };
  C.retuneRelay = function () {
    if (F.relay !== "on") return;
    F.relay = "rfm";
    applyRelay();
    sfx("terminal_success");
    G.notify(
      "Relay 7 now repeats Radio Free Manhattan across Midtown. The beacon on the mast turns green.",
    );
    standing(20, "Gave the airwaves back to the city");
    xp(100, "Re-tuned Relay 7");
    news(
      "Well, well, well. If you're hearing this a little louder than usual, Midtown, that's because somebody just hijacked the Continuity's own relay on the New York Central Building and pointed it at us. The red eye is green now, baby. This one's for you, whoever you are.",
      "m3_relay_rfm",
    );
    qComplete("m3_dead_air");
    G.events.emit("continuityRelaySilenced", { id: "helmsley", mode: "rfm" });
  };
  let relayT = 0;
  function tickRelay(dt, realDt) {
    relayT += realDt;
    const R = P.helmsRelay,
      B = P.helmsBeacon;
    if (R && P.inCell("helmsley") && F.relay !== "off") {
      const k = F.relay === "rfm" ? 0.4 : 1.2;
      R.rings.children.forEach((m, i) => {
        if (m.geometry && m.geometry.type === "TorusGeometry")
          m.rotation.z += realDt * k * (i % 2 ? -1 : 1) * (1 + i * 0.3);
      });
      R.ringMat.emissiveIntensity =
        1.4 + Math.sin(relayT * (F.relay === "rfm" ? 2 : 6)) * 0.5;
    }
    if (B && F.relay === "on") {
      const on = relayT % 1.6 < 0.35;
      B.mat.emissiveIntensity = on ? 3.0 : 0.15;
      if (B.glow) B.glow.visible = on;
    } else if (B && F.relay === "rfm") {
      B.mat.emissiveIntensity = 1.6 + Math.sin(relayT * 1.5) * 0.6;
    }
    // Continuity searchlight on the crown terrace: night only, sweeps Park Ave → 47th St; dies with the relay
    const SL = B && B.search;
    if (SL) {
      let night = 0;
      try {
        const env = G.atmos && G.atmos._ && G.atmos._.env;
        night = env ? env.night || 0 : 0;
      } catch (e) {
        night = 0;
      }
      const on = F.relay !== "off" && night > 0.05;
      if (SL.beam.visible !== on) SL.beam.visible = on;
      SL.lens.material.color.setHex(F.relay === "off" ? 0x1a1a1a : 0xeef4ff);
      if (on) {
        SL.beamMat.opacity = 0.12 * Math.min(1, night * 1.3);
        SL.pivot.rotation.y =
          2.4 + Math.sin(relayT * 0.2) * 0.9 + Math.sin(relayT * 0.53) * 0.12;
      }
    }
  }

  // ==================================================================
  // NAMED BOSSES
  // ==================================================================
  /** A named actor restored by combat from a save keeps its id but loses the onDeath closure: re-attach it, and if
   *  it came back already dead, record the death now (so it can never respawn on a later load). */
  function rebind(a, fn) {
    if (!a) return;
    if (a.dead) {
      P.safe("rebind:" + a.id, fn);
      return;
    }
    if (!a.onDeath) a.onDeath = fn;
  }
  function spawnVoss() {
    if (
      F.vossDead ||
      G.isStub("actors") ||
      typeof G.actors.spawn !== "function"
    )
      return;
    const ex = actor("m3_voss");
    if (ex) {
      rebind(ex, () => {
        F.vossDead = true;
      });
      return;
    }
    const a = A("helmsley", "boss");
    if (!a) return;
    P.safe("spawn:voss", () =>
      G.actors.spawn({
        id: "m3_voss",
        type: "continuity_soldier",
        name: "Lieutenant Voss",
        faction: "continuity",
        level: 15,
        hostile: true,
        pos: { x: a.x, y: a.y, z: a.z },
        yaw: a.yaw || 0,
        ai: "guard",
        home: { x: a.x, z: a.z, r: 5 },
        noRespawn: true,
        inventory: [
          ["m3_relay_codes", 1],
          ["m3_note_voss", 1],
        ],
        barks: [
          "This relay belongs to the United States of America!",
          "You are unauthorized. And unwashed.",
          "Deane! Overload the — never mind, I'll do it myself!",
          "For the Continuity!",
        ],
        onDeath: () => {
          F.vossDead = true;
        },
      }),
    );
  }
  // The Jockeys and the relay crew: extra named defenders on top of combat's location population (club_52 only gets
  // 3 raiders + the boss from the layout record — too thin for a four-level raider den; the relay room had no escort).
  const EXTRA = [
    {
      id: "m3_jockey_bookie",
      poi: "club_52",
      anchor: "spawn8",
      type: "raider",
      name: "Jockey Bookie",
      level: 6,
      barks: [
        "Odds just went up, pal!",
        "Pay up or lay down!",
        "House always wins!",
      ],
    },
    {
      id: "m3_jockey_stable",
      poi: "club_52",
      anchor: "spawn7",
      type: "raider",
      name: "Jockey Stablehand",
      level: 5,
      barks: ["Who let the softling in the stable?", "Get off my bedroll!"],
    },
    {
      id: "m3_jockey_enforcer",
      poi: "club_52",
      anchor: "spawn6",
      type: "raider",
      name: "Jockey Enforcer",
      level: 7,
      barks: ["The King don't take visitors!", "You're a scratch, buddy!"],
    },
    {
      id: "m3_helms_signals",
      poi: "helmsley",
      anchor: "spawn6",
      type: "continuity_soldier",
      name: "Continuity Signals Officer",
      level: 12,
      barks: ["Relay room is off limits!", "Contact in the crown!"],
    },
    {
      id: "m3_helms_crownguard",
      poi: "helmsley",
      anchor: "crown_guard",
      type: "continuity_soldier",
      name: "Continuity Crown Guard",
      level: 13,
      barks: [
        "Halt! This is a restricted floor!",
        "Intruder at the express car!",
      ],
    },
  ];
  function spawnExtras() {
    if (G.isStub("actors") || typeof G.actors.spawn !== "function") return;
    F.extraDead = F.extraDead || [];
    for (const e of EXTRA) {
      if (F.extraDead.indexOf(e.id) >= 0) continue;
      const ex = actor(e.id);
      if (ex) {
        rebind(ex, () => {
          if (F.extraDead.indexOf(e.id) < 0) F.extraDead.push(e.id);
        });
        continue;
      }
      const a = A(e.poi, e.anchor);
      if (!a) continue;
      const faction = e.type === "raider" ? "raiders" : "continuity";
      P.safe("spawn:" + e.id, () =>
        G.actors.spawn({
          id: e.id,
          type: e.type,
          name: e.name,
          faction,
          level: e.level,
          hostile: true,
          pos: { x: a.x, y: a.y, z: a.z },
          yaw: a.yaw || 0,
          ai: "guard",
          home: { x: a.x, z: a.z, r: 6 },
          noRespawn: true,
          barks: e.barks,
          onDeath: () => {
            if (F.extraDead.indexOf(e.id) < 0) F.extraDead.push(e.id);
          },
        }),
      );
    }
  }
  /** Combat names the '52' raider boss "Raider Boss" — make him the Jockey King (once per spawn). */
  function tickKing() {
    if (
      !P.inCell("club_52") ||
      G.isStub("actors") ||
      typeof G.actors.list !== "function"
    )
      return;
    for (const a of G.actors.list()) {
      if (!a || a.dead || a._m3King || a.group !== "club_52") continue;
      if (a.isBoss || a.name === "Raider Boss") {
        a._m3King = true;
        a.name = "The Jockey King";
        a.customBarks = [
          "And they're OFF!",
          "Nobody welches on the King!",
          "Place your bets, softling!",
          "Photo finish! Photo finish!",
        ];
        try {
          a.inventory = a.inventory || [];
          a.inventory.push(["m3_jockey_cap", 1], ["scrip", 60]);
        } catch (e) {
          /* */
        }
      }
    }
  }

  // ==================================================================
  // INTERACTABLES
  // ==================================================================
  function interactables() {
    const W = G.world;
    // the brick wall
    const sw = A("club_52", "secret_wall");
    if (sw)
      W.addInteractable({
        pos: new THREE.Vector3(sw.x - 0.3, sw.y + 1.2, sw.z),
        radius: 1.1,
        priority: 0.8,
        label: () => (F.holeFound ? "Brick Wall (pin-hole)" : "Brick Wall"),
        verb: () =>
          !F.holeFound
            ? "Examine"
            : has("m3_meat_skewer")
              ? "Insert Skewer"
              : "Examine",
        enabled: () => !F.cellarOpen,
        onInteract() {
          if (!F.holeFound) {
            F.holeFound = true;
            G.notify(
              "One brick in this wall has a neat round hole in its mortar — no wider than a pencil. The pointing around this section is far too clean.",
            );
            qStart("m3_cellar", "open");
            qSet("m3_cellar", "open");
            return;
          }
          if (has("m3_meat_skewer")) {
            G.notify(
              "You slide the skewer into the hole. Something clicks deep inside the wall.",
            );
            P.safe("unlock", () => {
              if (P.locksLive()) G.locks.unlock(P.LOCKS.cellar_wall.id);
            });
            C.openCellar(false);
            return;
          }
          sfx("ui_error");
          G.notify(
            "You need something long, thin and stiff to reach whatever is behind that hole. The kitchen had a rack of meat skewers.",
          );
        },
      });
  }

  // ==================================================================
  // lifecycle
  // ==================================================================
  function resetWorld() {
    const T = P.club52;
    if (T && T.openCol) {
      P.safe("rmopencol", () => G.world.removeCollider(T.openCol));
      T.openCol = null;
    }
    if (T) {
      T.open = false;
      T.anim = 0;
      T.leaf.rotation.y = 0;
      if (!T.leafCol)
        T.leafCol = G.world.addBox(
          T.leaf.position.x - 0.25,
          T.leaf.position.y,
          T.leaf.position.z - 2.2,
          T.leaf.position.x + 0.25,
          T.leaf.position.y + 2.5,
          T.leaf.position.z,
          { tag: "poi", walkable: false },
        );
    }
  }
  function applyWorldState() {
    if (F.cellarOpen) C.openCellar(true);
    applyRelay();
  }
