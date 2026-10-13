// play-inline-231 05 — hazard
// Lines 1787-1888 of readable/play-inline-231.pretty.js (statement-aligned).
  LI.spawnFns.push(function () {
    const C = LI.nyse;
    if (!C) return;
    LI.spawnNPC(
      {
        id: "li_nyse_bruno",
        type: "human",
        name: '"Bull Market" Bruno',
        outfit: "raider_heavy",
        gender: "m",
        faction: "raiders",
        ai: "guard",
        homeR: 6,
        hostile: true,
        level: 11,
        hp: 380,
        damage: 1.4,
        weapon: "fire_axe",
        noRespawn: true,
        voice: "raider",
        hair: "wild",
        inventory: [
          ["key_exchange_vault", 1],
          ["li_pit_key", 1],
          ["scrip", 90],
          ["bull_tabs", 1],
          ["rage", 1],
        ],
        barks: {
          idle: [
            "Who's next? WHO'S NEXT?",
            "Bruno is the market. The market only goes UP.",
          ],
          alert: ["FRESH STOCK!", "Time to CORRECT you!"],
        },
      },
      C.anchors.pit,
    );
    if (!Q.flag("li_nyse_freed")) {
      LI.spawnNPC(
        {
          id: "li_nyse_captive",
          type: "human",
          name: "Nate Oduya",
          outfit: "settler",
          gender: "m",
          faction: "settlers",
          ai: "static",
          homeR: 0.5,
          hostile: false,
          essential: true,
          dialogue: "dlg_li_captive",
          level: 3,
          skinTone: 0.75,
          barks: ["Psst! Over here! The cage!", "Forty to one. FORTY TO ONE."],
        },
        C.anchors.captive,
      );
    }
  });
  // live-wire hazard: shocks anyone wading into the flooded post pit
  let shockT = 0;
  LI.animators.push({
    cell: null,
    fn(dt) {
      const C = LI.nyse;
      if (!C || !C.active || !C.hazard || !G.player || dt <= 0) return;
      const P = G.player.pos,
        hx = C.O.x + C.hazard.x,
        hz = C.O.z + C.hazard.z;
      if (Math.hypot(P.x - hx, P.z - hz) < C.hazard.r && P.y < 0.6) {
        shockT -= dt;
        if (shockT <= 0) {
          shockT = 0.5;
          try {
            G.player.damage(7, { type: "energy", source: "hazard" });
          } catch (e) {
            /* */
          }
          try {
            G.fx.sparks(new THREE.Vector3(P.x, 0.3, P.z));
          } catch (e) {
            /* */
          }
          LI.sfx("hum_electric", { volume: 0.7 });
        }
      } else shockT = 0;
      if (Math.random() < dt * 2) {
        try {
          G.fx.sparks(
            new THREE.Vector3(
              hx + (Math.random() - 0.5) * 2,
              0.2,
              hz + (Math.random() - 0.5) * 2,
            ),
          );
        } catch (e) {
          /* */
        }
      }
    },
  });
