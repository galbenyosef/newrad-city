// play-inline-210 04 — expect
// Lines 322-633 of readable/play-inline-210.pretty.js (statement-aligned).
  function run() {
    const res = { ok: true, steps: [], fails: [], physical: null };
    try {
      res.physical = physicalAudit();
    } catch (e) {
      res.physical = {
        issues: ["audit threw " + ((e && e.stack) || e)],
        notes: [],
      };
    }
    if (res.physical.issues.length) {
      res.ok = false;
      res.fails.push(
        "physical: " +
          res.physical.issues.length +
          " issue(s): " +
          res.physical.issues.join(" | "),
      );
    }
    const step = (name, fn) => {
      try {
        fn();
        res.steps.push("ok " + name);
      } catch (e) {
        res.ok = false;
        res.fails.push(name + ": " + (e && e.message));
      }
    };
    const live =
      !G.isStub("quests") && !G.isStub("dialogue") && !G.isStub("inventory");
    if (live) {
      const fade0 = G.fadeTransition;
      G.fadeTransition = (fn) => {
        fn();
      };
      const P0 = G.player.pos.clone(),
        Y0 = G.player.yaw;
      try {
        step("quests defined", () => {
          for (const id of [
            "pf_dust",
            "pf_gold",
            "pf_deep",
            "pf_shellback_omelette",
            "pf_seeds",
          ])
            expect(G.quests.get ? G.quests.get(id) : true, "missing " + id);
        });
        step("npcs spawned", () => {
          if (G.isStub("actors")) return;
          for (const id of [
            "pf_tr_reverend",
            "pf_tr_doctor",
            "pf_ft_vane",
            "pf_ft_nan",
            "pf_ft_dilly",
            "pf_ft_hollis",
            "pf_sp_lottie",
            "pf_tr_sexton",
            "pf_fed_warden",
          ])
            expect(PF.getNpc(id), "no npc " + id);
        });

        // ---- Dust to Dust
        step("dust: Pell → key", () => {
          const s = startNode("pf_dlg_pell");
          say("pf_dlg_pell", s);
          say("pf_dlg_pell", "problem", /take a look/);
          expect(stage("pf_dust") === "key", "stage " + stage("pf_dust"));
          expect(has("pf_crypt_key"), "no key");
        });
        step("dust: unlock crypt gate", () => {
          interact(/^Crypt Gate$/, A("trinity_church", "crypt_door"));
          expect(PF.flag("tr_crypt_open"), "gate not open");
          expect(stage("pf_dust") === "crypt", "stage " + stage("pf_dust"));
        });
        step("dust: descend → clear", () => {
          const c = A("trinity_church", "crypt");
          enter({ x: c.x, y: c.y + 0.1, z: c.z });
          expect(stage("pf_dust") === "clear", "stage " + stage("pf_dust"));
        });
        step("dust: kill the Sexton → breach", () => {
          const a = PF.getNpc("pf_tr_sexton");
          if (a && a.kill) a.kill({});
          else G.events.emit("actorKilled", { id: "pf_tr_sexton" });
          expect(stage("pf_dust") === "breach", "stage " + stage("pf_dust"));
        });
        step("dust: seal breach (dialogue) → report", () => {
          const b = A("trinity_church", "breach");
          G.player.teleport(b.x, b.y + 0.05, b.z);
          expect(
            G.world.interactables.some(
              (it) =>
                (typeof it.label === "function" ? it.label() : it.label) ===
                "The Breach",
            ),
            "no breach interactable",
          );
          say("pf_dlg_breach", startNode("pf_dlg_breach"), /rubble/i);
          expect(stage("pf_dust") === "report", "stage " + stage("pf_dust"));
        });
        step("dust: report → Weehawken", () => {
          expect(
            startNode("pf_dlg_pell") === "report",
            "Pell start " + startNode("pf_dlg_pell"),
          );
          say("pf_dlg_pell", "report", /at rest/);
          expect(
            G.quests.isComplete("pf_dust"),
            "not complete " + stage("pf_dust"),
          );
          expect(has("pf_weehawken"), "no Weehawken");
        });

        // ---- The Gold Standard
        step("gold: Vane → enter", () => {
          say("pf_dlg_vane", startNode("pf_dlg_vane"), /Federal Reserve/);
          say("pf_dlg_vane", "job", /^I'm in/);
          expect(stage("pf_gold") === "enter", "stage " + stage("pf_gold"));
        });
        step("gold: street door → hall → power", () => {
          const d = G.world.doors.find(
            (x) => x.def && x.def.id === "pf_fed_enter",
          );
          expect(d, "no door");
          d._locked = 0;
          d.onInteract();
          const p = G.player.pos;
          enter({ x: p.x, y: p.y, z: p.z });
          expect(stage("pf_gold") === "power", "stage " + stage("pf_gold"));
        });
        step("gold: security terminal → descend", () => {
          term("pf_fed_security", /Vault Elevator/);
          expect(stage("pf_gold") === "descend", "stage " + stage("pf_gold"));
        });
        step("gold: elevator → door", () => {
          interact(
            /Vault Elevator \(Level V\)/,
            A("federal_reserve", "elevator_up"),
          );
          expect(stage("pf_gold") === "door", "stage " + stage("pf_gold"));
          const d = A("federal_reserve", "elevator_down");
          expect(
            Math.abs(G.player.pos.y - d.y) < 1.5,
            "not on Level V: y " + G.player.pos.y.toFixed(1),
          );
        });
        step("gold: control → cylinder turns → ledger", () => {
          term("pf_fed_vault", /Cylinder Door/);
          for (let i = 0; i < 90; i++)
            for (const fn of PF.updaters) {
              try {
                fn(0.1, 0.1);
              } catch (e) {
                /* ignore */
              }
            }
          expect(stage("pf_gold") === "ledger", "stage " + stage("pf_gold"));
        });
        step("gold: ledger → return → Vane", () => {
          const L = A("federal_reserve", "ledger");
          expect(
            PF.pickupQ.some(
              (p) =>
                p.id === "pf_reserve_ledger" &&
                Math.hypot(p.pos.x - L.x, p.pos.z - L.z) < 3,
            ),
            "ledger pickup not at its anchor",
          );
          G.inventory.add("pf_reserve_ledger", 1);
          expect(stage("pf_gold") === "return", "stage " + stage("pf_gold"));
          expect(
            startNode("pf_dlg_vane") === "ledger",
            "Vane start " + startNode("pf_dlg_vane"),
          );
          say("pf_dlg_vane", "ledger", /As agreed/);
          expect(G.quests.isComplete("pf_gold"), "not complete");
        });

        // ---- Low Tide
        step("deep: knock → talk → ship", () => {
          G.quests.start("pf_deep");
          interact(/Barricaded Office/, A("seaport", "mezz"));
          expect(stage("pf_deep") === "talk", "stage " + stage("pf_deep"));
          say("pf_dlg_lottie", startNode("pf_dlg_lottie"), /look for Cal/);
          expect(stage("pf_deep") === "ship", "stage " + stage("pf_deep"));
        });
        step("deep: hold → nest", () => {
          const h = A("seaport", "hold_fore");
          const n = A("seaport", "nest");
          enter({ x: (h.x + n.x) / 2, y: n.y + 0.2, z: n.z });
          enter({ x: n.x, y: n.y + 0.2, z: n.z });
          expect(
            ["nest", "ship"].indexOf(stage("pf_deep")) >= 0,
            "stage " + stage("pf_deep"),
          );
        });
        step("deep: harvest + destroy the nest → report", () => {
          const s = startNode("pf_dlg_nest");
          say("pf_dlg_nest", s, /Harvest/);
          expect(
            has("pf_shellback_egg") >= 6 || G.isStub("inventory"),
            "no eggs",
          );
          say("pf_dlg_nest", "root", /Smash/);
          expect(stage("pf_deep") === "report", "stage " + stage("pf_deep"));
        });
        step("deep: Cal tape reel → optional done", () => {
          G.inventory.add("pf_reel_cal", 1);
          expect(PF.flag("sp_cal"), "flag");
        });
        step("deep: report → complete", () => {
          expect(
            startNode("pf_dlg_lottie") === "report",
            "Lottie start " + startNode("pf_dlg_lottie"),
          );
          say("pf_dlg_lottie", "report", /sorry/);
          expect(G.quests.isComplete("pf_deep"), "not complete");
          expect(PF.flag("sp_market"), "market flag");
        });

        // ---- A Taste of the Sea (eggs already in the pack when the quest starts)
        step("omelette: Nan → start with eggs in pack → bring", () => {
          say("pf_dlg_nan", "root", /anything for the kitchen/);
          say("pf_dlg_nan", "need", /Five shellback/);
          expect(G.quests.isActive("pf_shellback_omelette"), "not started");
          expect(
            stage("pf_shellback_omelette") === "bring",
            "stage " +
              stage("pf_shellback_omelette") +
              " with " +
              has("pf_shellback_egg") +
              " eggs",
          );
          say("pf_dlg_nan", "eggs", /omelette/);
          expect(G.quests.isComplete("pf_shellback_omelette"), "not complete");
        });

        // ---- Victory Garden
        step("seeds: Dilly → cold store tin → bring", () => {
          say("pf_dlg_dilly", startNode("pf_dlg_dilly"), /What would help/);
          say("pf_dlg_dilly", "need", /get your seeds/);
          expect(stage("pf_seeds") === "find", "stage " + stage("pf_seeds"));
          const c = A("seaport", "cold_store");
          expect(
            PF.pickupQ.some(
              (p) =>
                p.id === "pf_seed_tin" &&
                Math.hypot(p.pos.x - c.x, p.pos.z - c.z) < 4,
            ),
            "tin pickup not in the cold store",
          );
          G.inventory.add("pf_seed_tin", 1);
          expect(stage("pf_seeds") === "bring", "stage " + stage("pf_seeds"));
          say("pf_dlg_dilly", "root", /seed tin/);
          say("pf_dlg_dilly", "tin", /Plant them/);
          expect(G.quests.isComplete("pf_seeds"), "not complete");
        });
      } finally {
        G.fadeTransition = fade0;
        try {
          G.player.teleport(P0.x, P0.y, P0.z, Y0);
        } catch (e) {
          /* ignore */
        }
      }
    } else
      res.steps.push("skip playthrough (quests/dialogue/inventory stubbed)");

    const summary =
      "[pftest] " +
      (res.ok ? "PASS" : "FAIL") +
      " " +
      res.steps.length +
      " ok, " +
      res.fails.length +
      " failed" +
      (res.fails.length ? ": " + res.fails.join(" || ") : "");
    console.log(summary);
    if (G.warnings) G.warnings.unshift(summary.slice(0, 2000));
    if (!res.ok)
      G.reportError(
        "poi_financial:selftest",
        new Error(res.fails.join(" || ").slice(0, 3000)),
      );
    window.PF_TEST = res;
    try {
      const pre = document.createElement("pre");
      pre.id = "pftest-out";
      pre.style.display = "none";
      pre.textContent = JSON.stringify(res, null, 1);
      document.body.appendChild(pre);
    } catch (e) {
      /* ignore */
    }
    return res;
  }
  PF.selfTest = run;

  let done = false;
  G.events.on("newGame", () => {
    if (done) return;
    done = true;
    setTimeout(() => {
      try {
        run();
      } catch (e) {
        G.reportError("poi_financial:selftest", e);
      }
    }, 600);
  });
