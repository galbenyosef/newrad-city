// play-inline-316 05 — ctx
// Lines 2037-2165 of readable/play-inline-316.pretty.js (statement-aligned).
  function buildInteractables(ctx) {
    const O = ctx.O;
    FOODS.forEach((fd, s) => {
      const x = -12 + s * 3 + 1.5;
      G.world.addInteractable({
        pos: new THREE.Vector3(O.x + x, O.y + 1.9, O.z + ctx.wallZ + 0.3),
        radius: 1.3,
        priority: 0.3,
        label: () =>
          PH.flag("am_fixed")
            ? "Automat — " + itemName(fd.id) + " (" + fd.price + " scrip)"
            : "Automat — " + fd.label,
        verb: () => (PH.flag("am_fixed") ? "Insert scrip" : "Examine"),
        enabled: () => ctx.inside,
        onInteract() {
          vend(ctx, fd);
        },
      });
    });
    G.world.addInteractable({
      pos: new THREE.Vector3(O.x - 13.2, O.y + 1.6, O.z - 19.2),
      radius: 1.2,
      priority: 0.3,
      label: "Dolphin Coffee Spout",
      verb: () => (PH.flag("am_fixed") ? "Pour (2 scrip)" : "Try"),
      enabled: () => ctx.inside,
      onInteract() {
        if (!PH.flag("am_fixed")) {
          K.notify(
            "The brass dolphin coughs up a spoonful of cold sludge. The system is down.",
          );
          K.sfx("empty_click");
          return;
        }
        if (!pay(2)) return;
        K.give("ph_am_coffee", 1);
        K.sfx("drink", null, { volume: 0.5 });
      },
    });
    const c = ctx.anchors.carousel;
    G.world.addInteractable({
      pos: new THREE.Vector3(c.x, c.y + 1.1, c.z - 0.3),
      radius: 1.0,
      priority: 0.6,
      label: "Master Carousel Crank",
      verb: () => (PH.flag("am_fixed") ? "Examine" : "Throw"),
      enabled: () => ctx.inside,
      onInteract() {
        throwCrank(ctx);
      },
    });
  }
  function itemName(id) {
    try {
      const d = !G.isStub("items") && G.items.get && G.items.get(id);
      return d ? d.name : id;
    } catch (e) {
      return id;
    }
  }
  function pay(n) {
    if (G.isStub("inventory")) return true;
    if (K.scripCount() < n) {
      K.notify("You need " + n + " scrip.");
      K.sfx("ui_error");
      return false;
    }
    K.safe("pay", () => G.inventory.addScrip(-n));
    return true;
  }
  function vend(ctx, fd) {
    if (!PH.flag("am_fixed")) {
      K.sfx("empty_click");
      K.notify(
        PH.flag("am_asked")
          ? "The little door won't budge. Penny says the Master Carousel in the basement is jammed."
          : 'The little glass door is locked tight. There\'s a coin slot, and a sign: "PLEASE SEE ATTENDANT."',
      );
      return;
    }
    if (!pay(fd.price)) return;
    K.give(fd.id, 1);
    K.sfx("pickup_scrip", null, { volume: 0.6 });
    PH.setFlag("am_bought", (PH.flag("am_bought") || 0) + 1);
  }
  function throwCrank(ctx) {
    if (PH.flag("am_fixed")) {
      K.notify(
        "The Master Carousel turns steadily, humming and clicking like a happy clock.",
      );
      return;
    }
    if (!roachesClear(ctx)) {
      K.notify(
        "Giant roaches are swarming around the drive. Deal with them first.",
      );
      K.sfx("roach_hiss");
      return;
    }
    const rep = K.skill("mechanics");
    if (rep < 35 && !K.has("dry_cell")) {
      K.notify("The drive motor is dead. (Mechanics 35, or a Dry Cell)");
      K.sfx("ui_error");
      return;
    }
    if (rep < 35) {
      K.take("dry_cell", 1);
      K.notify("You swap in a Dry Cell and throw the crank.");
    } else
      K.notify(
        "[Mechanics 35] You clear the tubes, grease the drive and throw the crank.",
      );
    PH.setFlag("am_fixed", true);
    K.sfx("cryo_door", null, { volume: 0.4, pitch: 1.6 });
    K.xp(80, "Restarted the Master Carousel");
    if (K.q.active("ph_nickel")) K.q.set("ph_nickel", "return");
  }
  function roachesClear(ctx) {
    if (G.isStub("actors") || !G.actors.get) return true;
    for (let i = 1; i <= 5; i++) {
      const a = G.actors.get("ph_am_roach" + i);
      if (a && !a.dead) return false;
    }
    return true;
  }

  // ==================================================================
  // DATA: items, quest, dialogue
  // ==================================================================
