// play-inline-161 09 — notify
// Lines 2456-2783 of readable/play-inline-161.pretty.js (statement-aligned).
  C.installPower = function () {
    if (F.dynamoOn) {
      G.notify("Dynamo No. 2 is humming happily.");
      return;
    }
    if (
      qStage("pu_encore") !== "dynamo" &&
      !has("pu_planetarium_cell") &&
      !has("dry_cell", 3)
    ) {
      G.notify("Dynamo No. 2. It needs a power cell — a big one.");
      return;
    }
    if (take("pu_planetarium_cell")) F.powerGiven = true;
    else if (has("dry_cell", 3)) {
      take("dry_cell", 3);
      F.powerGiven = true;
    } else {
      G.notify(
        "You need a power source: the Hayden planetarium cell, or three fission batteries.",
      );
      G.sfx.play("ui_error");
      return;
    }
    F.dynamoOn = true;
    G.sfx.play("hum_electric", { volume: 1 });
    G.notify(
      "Dynamo No. 2 coughs, sparks, and settles into a deep hum. Every lamp in Carnegie Hall comes on at once.",
    );
    try {
      if (!G.isStub("fx")) G.fx.sparks(P.anchor("carnegie_hall", "dynamo"));
    } catch (e) {
      /* */
    }
    xp(75, "Dynamo No. 2");
    if (P.carnegieConcert) P.carnegieConcert.group.visible = true;
    if (qStage("pu_encore") === "dynamo" || qStage("pu_encore") === "deliver")
      qSet("pu_encore", "concert");
  };
  C.setPatron = function (how) {
    F.patron = how || true;
    if (qStage("pu_heist") === "fence") qComplete("pu_heist");
  };
  // ---------- Tiffany: vault & breaker ----------
  let vaultAnim = 0;
  C.openVault = function (fromTerminal, silent) {
    const T = P.tiffany;
    if (!T || T.open) return;
    T.open = true;
    F.vaultOpen = true;
    try {
      G.world.removeCollider(T.leafCol);
    } catch (e) {
      /* */
    }
    if (silent) {
      T.leaf.rotation.y = 1.9;
      return;
    }
    vaultAnim = 0.001;
    G.sfx.play("cryo_door", { pos: T.leaf.position, volume: 0.9 });
    G.notify(
      fromTerminal
        ? "Somewhere below, a Mosler vault door rolls open."
        : "The bolts retract and the great round door swings open.",
    );
    if (!qDone("pu_heist")) {
      if (!qActive("pu_heist")) qStart("pu_heist", "take");
      else if (qStage("pu_heist") === "in") qSet("pu_heist", "take");
    }
  };
  function tickTiffany(dt, realDt) {
    const T = P.tiffany;
    if (!T) return;
    if (vaultAnim > 0 && vaultAnim < 1) {
      vaultAnim = Math.min(1, vaultAnim + realDt / 4);
      const e = 1 - Math.pow(1 - vaultAnim, 3);
      T.leaf.rotation.y = 1.9 * e;
    }
    if (!P.inCell("tiffany")) return;
    if (!F.heistStarted) {
      F.heistStarted = true;
      qStart("pu_heist", "in");
    }
    if (F.breakerOff || dt <= 0) return;
    const p = G.player.pos,
      H = T.hazard;
    T.sparkT -= realDt;
    if (T.sparkT <= 0) {
      T.sparkT = 0.35 + Math.random() * 0.8;
      P.safe("sparks", () => {
        if (!G.isStub("fx"))
          G.fx.sparks(
            new THREE.Vector3(
              H.x + (Math.random() - 0.5) * 6,
              H.y + 0.1,
              H.z + (Math.random() - 0.5) * 3,
            ),
          );
      });
    }
    if (
      Math.abs(p.x - H.x) < H.hx &&
      Math.abs(p.z - H.z) < H.hz &&
      p.y < H.y + 0.4
    ) {
      T.t -= realDt;
      if (T.t <= 0) {
        T.t = 0.5;
        P.safe("shock", () => {
          G.player.damage(7, { type: "energy", source: "hazard" });
          G.sfx.play("laser_impact", { volume: 0.6 });
          if (!G.isStub("fx"))
            G.fx.flash(
              new THREE.Vector3(p.x, p.y + 0.5, p.z),
              0x9ab8ff,
              2,
              0.12,
            );
        });
      }
    }
  }
  function tickHaggle() {
    /* heist: diamond picked up → next stage */
    if (qStage("pu_heist") === "take" && has("pu_atlas_diamond")) {
      qSet("pu_heist", "fence");
      xp(100, "The Atlas Diamond");
    }
    if (
      qStage("pu_omelette") === "egg" &&
      has("pu_ripjaw_egg") &&
      !F._eggNote
    ) {
      F._eggNote = true;
      G.notify("Chef Gaston at the Plaza will want to see this.");
    }
    if (qStage("pu_nursery") === "key" && has("pu_key_hollis"))
      qSet("pu_nursery", "open");
    if (qStage("pu_nursery") === "source" && P.inCell("dakota")) {
      const n = A("dakota", "nursery"),
        p = G.player.pos;
      if (
        n &&
        Math.hypot(p.x - n.x, p.z - n.z) < 6 &&
        Math.abs(p.y - n.y) < 2
      ) {
        qSet("pu_nursery", "nanny");
        G.notify(
          'The crying stops. A lamp clicks on. "Shh," says a voice. "She has only just gone down."',
        );
      }
    }
    if (
      qStage("pu_encore") === "gather" &&
      F.patron &&
      (F.scoreGiven || has("pu_score")) &&
      (F.powerGiven || has("pu_planetarium_cell") || has("dry_cell", 3)) &&
      !F._allNote
    ) {
      F._allNote = true;
      G.notify("You have everything Maestro Bell asked for.");
    }
  }

  // ------------------------------------------------------------------
  // interactables (built at initDone; positions from POI anchors)
  // ------------------------------------------------------------------
  function interactables() {
    const W = G.world;
    // AMNH projector cell
    const pj = A("amnh", "projector");
    if (pj)
      W.addInteractable({
        pos: pj.clone().add(new THREE.Vector3(0, 0.2, 0)),
        radius: 1.3,
        label: "Star Projector — Power Cell Housing",
        verb: "Remove Cell",
        priority: 0.5,
        enabled: () => !!(P.amnhShow && P.amnhShow.powered),
        onInteract() {
          if (!G.isStub("ui") && G.ui.confirm) {
            G.ui
              .confirm(
                "Remove the Mark IV cell? The planetarium will go dark for good.",
              )
              .then((ok) => {
                if (ok) takeCell();
              });
          } else takeCell();
        },
      });
    function takeCell() {
      const S = P.amnhShow;
      if (!S || !S.powered) return;
      S.powered = false;
      F.cellTaken = true;
      show = null;
      give("pu_planetarium_cell", 1);
      G.sfx.play("robot_death", { pos: S.pos, volume: 0.5 });
      G.notify(
        "The projector winds down with a long electric sigh. Eight thousand nine hundred stars go out.",
      );
    }
    // Dakota sealed door
    const sd = A("dakota", "sealed_door");
    if (sd)
      W.addInteractable({
        pos: sd.clone().add(new THREE.Vector3(0.4, 1.3, 0)),
        radius: 1.2,
        label: () => "Apartment 3B — Hollis (SEALED)",
        verb: () => (has("pu_key_hollis") ? "Unlock" : "Open"),
        priority: 0.8,
        locked: () =>
          has("pu_key_hollis") || P.lockIsOpen(P.LOCKS.dakota_3b.id)
            ? null
            : "Nailed shut & locked",
        enabled: () => !(P.dakotaSealed && P.dakotaSealed.open),
        onInteract() {
          if (!P.locksLive() && !has("pu_key_hollis")) {
            G.sfx.play("door_locked");
            G.notify(
              "The door is boarded shut and locked. The superintendent kept the key.",
            );
            return;
          }
          P.lockOpen(P.LOCKS.dakota_3b, () => C.openHollis());
        },
      });
    // Dakota music box
    const nb = A("dakota", "nursery");
    if (nb)
      W.addInteractable({
        pos: new THREE.Vector3(nb.x + 3.6, nb.y + 1.0, nb.z - 5.5),
        radius: 0.6,
        label: "Music Box",
        verb: "Wind",
        onInteract() {
          G.sfx.play("ui_select", { volume: 0.6 });
          G.notify(
            "The music box plays four tinny notes, over and over. A-D-A. A-D-A.",
          );
        },
      });
    // Plaza Presidential Suite
    const pg = P.plazaGate;
    if (pg)
      W.addInteractable({
        pos: pg.pos,
        radius: 1.2,
        label: "Presidential Suite",
        verb: "Open",
        priority: 0.8,
        locked: () => (P.lockIsOpen(P.LOCKS.pres_door.id) ? null : "Keypad"),
        enabled: () => !pg.open,
        onInteract() {
          P.lockOpen(P.LOCKS.pres_door, () => C.openPresidential());
        },
      });
    // Carnegie dynamo
    const dy = A("carnegie_hall", "dynamo");
    if (dy)
      W.addInteractable({
        pos: dy.clone().add(new THREE.Vector3(0, 1.4, -0.55)),
        radius: 1.4,
        label: () => (F.dynamoOn ? "Dynamo No. 2 (running)" : "Dynamo No. 2"),
        verb: () => (F.dynamoOn ? "Check" : "Install Cell"),
        priority: 0.6,
        onInteract: () => C.installPower(),
      });
    // Tiffany vault door + breaker
    const vd = A("tiffany", "vault_door");
    if (vd)
      W.addInteractable({
        pos: vd.clone().add(new THREE.Vector3(0, 1.8, -2.1)),
        radius: 1.6,
        label: "Mosler Vault Door",
        verb: () => (has("pu_key_tiffany_vault") ? "Unlock" : "Open"),
        priority: 0.8,
        locked: () =>
          has("pu_key_tiffany_vault") ||
          F.timelock ||
          P.lockIsOpen(P.LOCKS.vault.id)
            ? null
            : "Locked",
        enabled: () => !(P.tiffany && P.tiffany.open),
        onInteract() {
          if (F.timelock) {
            C.openVault(false);
            return;
          }
          if (!P.locksLive() && !has("pu_key_tiffany_vault")) {
            G.sfx.play("door_locked");
            G.notify(
              "The vault is sealed. A time lock, a keyhole — and no handle on this side.",
            );
            return;
          }
          P.lockOpen(P.LOCKS.vault, () => C.openVault(false));
        },
      });
    const br = A("tiffany", "breaker");
    if (br)
      W.addInteractable({
        pos: br.clone().add(new THREE.Vector3(0, 1.6, -0.25)),
        radius: 0.7,
        label: () =>
          F.breakerOff ? "Breaker Box (off)" : "Breaker Box (sparking)",
        verb: () => (F.breakerOff ? "Inspect" : "Cut Power"),
        onInteract() {
          if (F.breakerOff) {
            G.notify("Dead. The water in the corridor is just water now.");
            return;
          }
          F.breakerOff = true;
          G.sfx.play("robot_death", { volume: 0.4 });
          G.notify(
            "You throw the breaker. The water in the corridor stops crackling.",
          );
          xp(20, "Cut the power");
        },
      });
  }

  // ------------------------------------------------------------------
  // raider boss carries the vault key; the AMNH matriarch guards the eggs
  // ------------------------------------------------------------------
  let keyWait = 0;
