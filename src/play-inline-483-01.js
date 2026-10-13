// play-inline-483 01 — hostile
// Lines 17-152 of readable/play-inline-483.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;

  const ANIMALS = /^(dog|wild_dog|mongrel|burrow_rat|ash_bear|pack_ox|coyote)$/;
  const isAnimal = (a) => !!(a && ANIMALS.test(String(a.type || "")));
  const actorsLive = () =>
    !G.isStub("actors") && G.actors && typeof G.actors.inRadius === "function";

  // ------------------------------------------------------------------
  // Beast Whisperer
  // ------------------------------------------------------------------
  function scanAnimals() {
    const rank = G.rpg.talentRank("beast_whisperer");
    if (!rank || !actorsLive() || !G.player) return;
    const P = G.player;
    const near = G.actors.inRadius(P.pos, 70);
    let threats = null;
    for (const a of near) {
      if (!isAnimal(a) || a.dead || a._rpgAnimalAngry || a.frenzied) continue;
      if (!a._rpgAnimalFriend) {
        if (
          a.hostOverride === undefined &&
          typeof a.hostile === "function" &&
          a.hostile() &&
          typeof a.setHostile === "function"
        ) {
          a.setHostile(false);
          a._rpgAnimalFriend = true;
        }
        continue;
      }
      // Rank 2: friendly animals pile onto whoever is fighting the player
      if (rank >= 2) {
        if (!threats)
          threats = near.filter(
            (o) =>
              o &&
              !o.dead &&
              !isAnimal(o) &&
              typeof o.hostile === "function" &&
              o.hostile() &&
              o.target === "player",
          );
        if (!threats.length) continue;
        if (a.target && a.target !== "player" && !a.target.dead) continue;
        let t = null,
          td = 30;
        for (const o of threats) {
          const d = Math.hypot(o.pos.x - a.pos.x, o.pos.z - a.pos.z);
          if (d < td) {
            td = d;
            t = o;
          }
        }
        if (!t) continue;
        try {
          const C = G.__cmb; // combat internals (same owner), used defensively
          if (C && typeof C.enterCombat === "function")
            C.enterCombat(a, t, 0.2);
          else {
            a.target = t;
            if (typeof a.setState === "function") a.setState("combat");
          }
        } catch (e) {
          /* ignore */
        }
      }
    }
  }
  // Hurting an animal friend ends the truce with that animal
  G.events.on("actorDamaged", (a, dmg, info) => {
    if (
      !a ||
      !a._rpgAnimalFriend ||
      !info ||
      (info.source !== "player" && info.source !== G.player)
    )
      return;
    a._rpgAnimalFriend = false;
    a._rpgAnimalAngry = true;
    try {
      if (typeof a.setHostile === "function") a.setHostile(true);
    } catch (e) {
      /* ignore */
    }
  });

  // ------------------------------------------------------------------
  // Stealth practice: sneaking unseen within 25 m of a hostile actor
  // ------------------------------------------------------------------
  function stealthPractice(dt) {
    const P = G.player;
    if (!P || !P.sneaking || !actorsLive()) return;
    let det = "hidden";
    try {
      if (!G.isStub("combat") && G.combat.detection) det = G.combat.detection();
    } catch (e) {
      det = "hidden";
    }
    if (det !== "hidden") return;
    const near = G.actors.inRadius(P.pos, 25);
    if (
      near.some(
        (a) => a && !a.dead && typeof a.hostile === "function" && a.hostile(),
      )
    )
      G.rpg.practice("stealth", 0.06 * dt, "sneak");
  }

  // ------------------------------------------------------------------
  // Update
  // ------------------------------------------------------------------
  let tAnimal = 0,
    tSneak = 0;
  G.rpg._talentHooksUpdate = function (realDt) {
    tAnimal -= realDt;
    tSneak -= realDt;
    if (tAnimal <= 0) {
      tAnimal = 1;
      try {
        scanAnimals();
      } catch (e) {
        G.reportError("rpg:beastWhisperer", e);
        tAnimal = 10;
      }
    }
    if (tSneak <= 0) {
      tSneak = 1;
      try {
        stealthPractice(1);
      } catch (e) {
        G.reportError("rpg:stealthPractice", e);
        tSneak = 10;
      }
    }
  };
