// play-inline-560 04 — qid
// Lines 898-966 of readable/play-inline-560.pretty.js (statement-aligned).
  L.hook("world", function () {
    const b = N() && N().has(["bounty_board"]);
    if (b)
      G.world.addInteractable({
        pos: L.V3(b.x, (b.y || 0) + 1.6, b.z),
        radius: 1.0,
        label: "Guard Bounty Board",
        verb: "Read",
        priority: 0.8,
        onInteract() {
          L.startDialogue("dlg_neon_bounty_board", null);
        },
      });
  });
  L.hook("spawn", function () {
    siteCache = null;
    marksman();
    const c = C();
    if (c && Q.stage(QID) === "hunt") spawnContract(c);
  });
  G.events.on("actorKilled", (a) => {
    if (!a || !a.id || !/^nc\d+_/.test(a.id)) return;
    const c = C();
    if (!c || Q.stage(QID) !== "hunt" || !c.ids.some((t) => t.id === a.id))
      return;
    const left = aliveTargets(c, a.id).length;
    if (left <= 0) {
      Q.setStage(QID, "report");
      L.notify("Contract target cleared. Report to Sergeant Mulroney.");
    } else L.refresh(QID);
  });
  G.events.on("questFlag", (name) => {
    if (typeof name === "string" && name.indexOf("neon_rumor_") === 0)
      L.later(0.5, rumorsTick);
  });
  let t1 = 0;
  L.hook("update", function (dt) {
    if (dt <= 0) return;
    t1 += dt;
    if (t1 < 1) return;
    t1 = 0;
    if (Q.isActive(RID)) {
      try {
        rumorsTick();
      } catch (e) {
        G.reportError("quests:neon rumors", e);
      }
    }
  });

  // Debug (dev console)
  Q.debug.neonContract = () => {
    L.setFlag("neon_guard_member", true);
    L.setFlag("neon_contract_day", -1);
    acceptContract();
    return C();
  };
  Q.debug.neonContractSites = () =>
    contractSites().map(
      (s) => s.name + " (" + Math.round(s.x) + "," + Math.round(s.z) + ")",
    );
  L.neonContracts = {
    newContract,
    spawnContract,
    acceptContract,
    contractSites,
    LEADS,
    KINDS,
  };
