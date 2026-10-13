// play-inline-228 04 — guest
// Lines 721-819 of readable/play-inline-228.pretty.js (statement-aligned).
  LI.spawnFns.push(function () {
    const C = LI.un;
    if (!C) return;
    const g = guest();
    LI.spawnNPC(
      {
        id: "li_keel",
        type: "human",
        name: "Major Adelaide Keel",
        outfit: "continuity_exo_rig",
        gender: "f",
        faction: "continuity",
        ai: "guard",
        homeR: 3,
        hostile: !g,
        level: 14,
        hp: 330,
        weapon: "gyrojet_carbine",
        dialogue: "dlg_li_keel",
        voice: "continuity",
        inventory: [
          ["li_un_fieldkey", 1],
          ["scrip", 140],
          ["ammo_gyrojet", 18],
          ["rally_tonic", 2],
        ],
        barks: {
          idle: [
            "Calibration. Everything is calibration.",
            "Do not touch the horseshoe table.",
            "The Republic endures.",
          ],
          alert: [
            "Intruder in the Council chamber!",
            "You were a guest, citizen. Were.",
          ],
        },
        onDeath: () => {
          Q.set("li_keel_dead");
        },
      },
      C.anchors.officer,
    );
    // the lobby checkpoint turrets follow the guest rule too (hostile unless guest)
    state._turrets = null;
    applyTurrets(true);
  });

  // ------------------------------------------------------------------
  // Guest truce inside the cell (mirrors the UN Plaza rule for our garrison)
  // ------------------------------------------------------------------
  let tt = 0;
  LI.animators.push({
    cell: null,
    fn(dt) {
      tt -= dt;
      if (tt > 0) return;
      tt = 1;
      const C = LI.un;
      if (!C || !C.active || G.isStub("actors")) return;
      const g = guest();
      applyTurrets(false);
      for (const a of G.actors.list()) {
        if (!a || a.dead || a.faction !== "continuity" || !LI.inCell(C, a.pos))
          continue;
        if (g && !a.__liTruce && !(a.wasFriendly && a.hostOverride === true)) {
          a.__liTruce = true;
          try {
            a.setHostile(false);
          } catch (e) {
            /* */
          }
        } else if (!g && a.__liTruce) {
          delete a.__liTruce;
          try {
            a.setHostile(true);
          } catch (e) {
            /* */
          }
        }
      }
    },
  });
  // shooting at the garrison while a guest ends the courtesy (Keel remembers)
  G.events.on("actorDamaged", (a, amt, info) => {
    try {
      const C = LI.un;
      if (!C || !a || a.faction !== "continuity" || !LI.inCell(C, a.pos))
        return;
      if (
        info &&
        (info.source === "player" || info.source === G.player) &&
        guest()
      )
        Q.set("li_keel_hostile");
    } catch (e) {
      /* */
    }
  });
