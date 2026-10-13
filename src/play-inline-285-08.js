// play-inline-285 08 — push
// Lines 1722-1918 of readable/play-inline-285.pretty.js (statement-aligned).
  function addInteractables() {
    const W = G.world;
    const seat = A("lyceum_theatre", "seat");
    if (seat)
      W.addInteractable({
        pos: seat.clone().add(new THREE.Vector3(0, 0.6, 0)),
        radius: 0.9,
        label: "Seat of Honour (A-101)",
        verb: () => (show ? "..." : "Sit"),
        priority: 0.6,
        enabled: () =>
          !show && (qStage("pt_show") === "showtime" || qDone("pt_show")),
        onInteract() {
          C.startShow();
        },
      });
    const lk = A("port_authority", "locker417");
    if (lk)
      W.addInteractable({
        pos: lk.clone().add(new THREE.Vector3(0, 0.3, 0.3)),
        radius: 0.6,
        label: "Coin Locker 417",
        verb: () =>
          F.locker ? "Inspect" : has("pt_key_locker417") ? "Unlock" : "Open",
        priority: 0.8,
        locked: () =>
          F.locker ||
          has("pt_key_locker417") ||
          P.lockIsOpen(P.LOCKS.locker417.id)
            ? null
            : "Locked",
        onInteract() {
          if (F.locker) {
            C.openLocker();
            return;
          }
          if (!P.locksLive() && !has("pt_key_locker417")) {
            G.sfx.play("door_locked");
            G.notify("Locker 417 is locked. The key must be somewhere.");
            return;
          }
          P.lockOpen(P.LOCKS.locker417, () => C.openLocker());
        },
      });
    const gl = A("lyceum_theatre", "ghost_light");
    if (gl)
      W.addInteractable({
        pos: gl.clone().add(new THREE.Vector3(0, 1.9, 0)),
        radius: 0.6,
        label: "The Ghost Light",
        verb: "Look",
        onInteract() {
          G.notify(
            'A single bare bulb on a stand. It has not gone out in twenty-two years. Somebody has written on the base: "KEEP IT LIT."',
          );
        },
      });
    const cue = A("ed_sullivan", "stage");
    if (cue)
      W.addInteractable({
        pos: new THREE.Vector3(cue.x + 6.36, cue.y + 1.1, cue.z + 6.7),
        radius: 0.7,
        label: "Cue Cards",
        verb: "Read",
        onInteract() {
          if (!has("pt_note_es_cuecards")) give("pt_note_es_cuecards", 1);
          else
            G.notify(
              '"...AND REMEMBER, FOLKS: THE SAFEST PLACE TO WATCH TOMORROW IS FROM A SHELTER!"',
            );
        },
      });
  }

  // ------------------------------------------------------------------
  // combat spawns: Mr. Showtime (boss) + the stage manager's log on a victim
  // ------------------------------------------------------------------
  P.onRelocated.push((key, a) => {
    if (
      key === "ed_sullivan" &&
      a.type === "valet" &&
      a._ptForced &&
      !a._ptBoss
    ) {
      a._ptBoss = true;
      a.name = "Mr. Showtime";
      a.isBoss = true;
      a.maxHp = Math.round((a.maxHp || 120) * 1.6);
      a.hp = a.maxHp;
      try {
        a.inventory = Array.isArray(a.inventory) ? a.inventory : [];
        a.inventory.push(["pt_note_es_cuecards", 1]);
      } catch (e) {
        /* */
      }
      try {
        a.barks = [
          "Welcome back to THE TOMORROW HOUR!",
          "Please remain seated!",
          "Nobody leaves during a live broadcast!",
          "Let's hear it for the audience!",
        ];
      } catch (e) {
        /* */
      }
    }
    if (key === "ed_sullivan" && a.type === "patrolman" && !a._ptName) {
      a._ptName = true;
      a.name = "Usher Unit";
    }
  });

  // ------------------------------------------------------------------
  // world state from flags
  // ------------------------------------------------------------------
  function applyWorldState() {
    if (P.esOnAir) P.esOnAir.visible = !!F.broadcast;
    if (F.safeReleased) releaseSafe();
  }
  function resetWorld() {
    show = null;
    if (G.player) G.player.frozen = false;
    if (P.esOnAir) P.esOnAir.visible = false;
  }

  // ------------------------------------------------------------------
  // item pick-ups start quests
  // ------------------------------------------------------------------
  G.events.on("itemAdded", (id) => {
    if (
      id === "pt_reel_es_stagemgr" &&
      !qActive("pt_deadair") &&
      !qDone("pt_deadair")
    )
      qStart("pt_deadair", "prep");
    if (id === "pt_es_master_reel") {
      if (!qActive("pt_deadair") && !qDone("pt_deadair"))
        qStart("pt_deadair", "prep");
      checkDeadAir();
    }
    if (
      id === "pt_note_pa_claimcheck" &&
      !qActive("pt_locker417") &&
      !qDone("pt_locker417") &&
      !F.locker
    )
      qStart("pt_locker417", "key");
    if (
      id === "pt_key_locker417" &&
      qActive("pt_locker417") &&
      qStage("pt_locker417") === "key"
    )
      qSet("pt_locker417", "open");
    if (
      (id === "pt_prompt_book" || id === "pt_es_klieg") &&
      !qActive("pt_show") &&
      !qDone("pt_show")
    )
      qStart("pt_show", "talk");
  });

  // ------------------------------------------------------------------
  // lifecycle hooks
  // ------------------------------------------------------------------
  P.onPreReady.push(() => defineItems());
  P.onReady.push(() => {
    defineTerminals();
    defineDialogue();
    defineQuests();
    addInteractables();
  });
  P.onReady.push(() => {
    // the stage manager's log lies with the skeleton in the Ed Sullivan trap room
    const a = A("ed_sullivan", "spawn3b");
    if (a && !G.isStub("items") && G.items.spawnPickup)
      P.safe("pickup:stagemgr", () =>
        G.items.spawnPickup(
          "pt_reel_es_stagemgr",
          1,
          new THREE.Vector3(a.x + 1.2, a.y + 0.02, a.z + 2.2),
          { static: true, keepY: true },
        ),
      );
  });
  P.onNewGame.push(() => {
    F = DEF_STATE();
    applyWorldState();
    spawnAll();
  });
  P.onReset.push(() => {
    resetWorld();
  });
  P.onLoaded.push(() => {
    applyWorldState();
    spawnAll();
  });
  P.tick.push(tickShow);
