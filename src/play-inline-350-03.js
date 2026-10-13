// play-inline-350 03 — flag
// Lines 347-422 of readable/play-inline-350.pretty.js (statement-aligned).
  const mb = (PC.mb = {
    /** The stage the quest should be at, from the world state. */
    wantStage() {
      if (!PC.flag("mb_wren_free")) return "free";
      return K.has("pc_mb_register") || PC.flag("mb_register_back")
        ? "return"
        : "register";
    },
    sync() {
      if (!K.q.active("pc_records")) return;
      if (PC.flag("mb_register_back")) {
        mb.finish();
        return;
      }
      const want = mb.wantStage();
      if (K.q.stage("pc_records") !== want) K.q.set("pc_records", want);
    },
    wrenFreed() {
      if (PC.flag("mb_wren_freed_evt")) return;
      PC.setFlag("mb_wren_freed_evt", true);
      PC.setFlag("mb_wren_free", true);
      const a =
        !G.isStub("actors") && G.actors.get && G.actors.get("pc_mb_wren");
      if (a && !a.dead)
        K.safe("wren out", () => {
          a.say &&
            a.say(
              "Out! OUT! Oh, I could kiss you. I won't. There's a form for that.",
            );
          const d = PC.anchor("municipal_building", "records_desk_stand");
          if (!d) return;
          a.ai = "static";
          a.aiMode = "guard";
          a.home = { x: d.x, z: d.z, r: 1.2 };
          a.homeYaw = Math.PI;
          a.moveGoal = null;
          if (a.setState && a.state !== "combat") a.setState("idle");
          if (a.anim) a.anim("idle");
        }); // 'guard' walks him to his post (the desk) now; a reload spawns him there
      K.xp(50, "Freed Tobias Wren");
      mb.sync();
    },
    /** Wren takes his Register back: the quest's story is done. */
    registerBack() {
      if (PC.flag("mb_register_back")) return;
      PC.setFlag("mb_register_back", true);
      K.take("pc_mb_register", 1);
      K.xp(100, "Returned the Register");
      K.standing(10, "Saved the Last Clerk's Register");
      K.setQFlag("ms_register_returned", true);
      mb.finish();
    },
    /** The Deed Ledger's fate (any time Wren is free and the hero carries it). */
    deed(mode) {
      if (PC.flag("mb_deed_done")) return;
      PC.setFlag("mb_deed_done", mode);
      K.setQFlag("ms_deed_ledger", mode);
      if (mode === "wren") {
        K.take("pc_mb_ledger", 1);
        K.scrip(150);
        K.standing(15, "Gave the Deed Ledger to the Last Clerk");
        K.give("pc_mb_stamp", 1);
      } else if (mode === "sold")
        K.standing(-10, "Meant to sell the Deed Ledger");
    },
    finish() {
      if (PC.flag("mb_wren_done")) return;
      PC.setFlag("mb_wren_done", true);
      if (!K.q.active("pc_records")) K.q.start("pc_records");
      K.q.complete("pc_records");
    },
  });
  function startRecords() {
    K.q.start("pc_records");
    mb.sync();
  }
