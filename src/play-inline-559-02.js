// play-inline-559 02 — the
// Lines 310-654 of readable/play-inline-559.pretty.js (statement-aligned).
  function tickDrop(dt) {
    const q = BALL.seq;
    if (!q) return;
    q.t += dt;
    const S = q.S;
    const k = Math.min(1, q.t / 10);
    const y = S.hi.y + (S.lo.y - S.hi.y) * k;
    const pos = new THREE.Vector3(
      S.hi.x + (S.lo.x - S.hi.x) * k,
      y,
      S.hi.z + (S.lo.z - S.hi.z) * k,
    );
    if (!landmarkBall(k)) {
      // stopgap: our own crystal Ball rides the mast down (the landmark's ball mesh is static)
      const m = ballMesh();
      m.position.copy(pos);
      m.rotation.y += dt * 0.6;
      const pulse = 1 + Math.sin(q.t * 9) * 0.05 * (1 - k);
      m.scale.setScalar(pulse);
      if (!BALL.sprite && !G.isStub("fx") && G.fx.glowSprite) {
        try {
          BALL.sprite = G.fx.glowSprite(pos.clone(), 0xfff2d0, 6);
        } catch (e) {
          BALL.sprite = null;
        }
      }
      if (BALL.sprite && BALL.sprite.position) BALL.sprite.position.copy(pos);
      if (k < 1 && Math.random() < dt * 5 && !G.isStub("fx") && G.fx.sparks)
        try {
          G.fx.sparks(pos.clone().add(new THREE.Vector3(0, 1.9, 0)));
        } catch (e) {
          /* ignore */
        }
    }
    // countdown: one number a second
    const n = 10 - Math.floor(q.t);
    if (n < q.n && n >= 1) {
      q.n = n;
      shout(String(n) + "!", 4);
      L.sfx("ui_click", { volume: 0.4 });
    }
    if (q.t >= 10 && !q.cheered) {
      q.cheered = true;
      shout(
        pick([
          "HAPPY NEW YEAR!",
          "IT DROPPED! IT ACTUALLY DROPPED!",
          "Happy New Year, Neon!",
          "Twenty-two years! TWENTY-TWO YEARS!",
        ]),
        8,
      );
      if (!G.isStub("fx") && G.fx.flash)
        try {
          G.fx.flash(pos, 0xffffff, 4, 1.2);
        } catch (e) {
          /* ignore */
        }
      if (
        G.player &&
        Math.hypot(G.player.pos.x - S.lo.x, G.player.pos.z - S.lo.z) < 140 &&
        !G.isStub("rpg") &&
        G.rpg.addEffect
      ) {
        try {
          G.rpg.addEffect({
            id: "neon_new_year",
            name: "Neon New Year",
            kind: "buff",
            duration: 1200,
            mods: { attrs: { presence: 1, senses: 1 } },
            desc: "Presence +1, Senses +1",
          });
        } catch (e) {
          /* ignore */
        }
        L.notify("Neon New Year: Presence +1, Senses +1.");
      }
      L.incFlag("neon_ball_drops");
      if (Q.stage("sq_neon_ball") === "midnight")
        L.later(3, () => {
          Q.complete("sq_neon_ball");
          L.news(
            "The Times Square Ball dropped at midnight for the first time since New Year's of 1967. Old-timers, topsiders and at least one pack ox were seen weeping in the streets of the Neon. Happy New Year, Rad City, whatever month it is.",
          );
        });
    }
    if (q.t >= 10) {
      q.fireT -= dt;
      if (q.fireT <= 0) {
        q.fireT = 0.35 + Math.random() * 0.5;
        firework(S.lo);
      }
    }
    if (q.t > 19) {
      BALL.seq = null;
      if (BALL.sprite) {
        try {
          if (BALL.sprite.parent) BALL.sprite.parent.remove(BALL.sprite);
        } catch (e) {
          /* ignore */
        }
        BALL.sprite = null;
      }
      dropBallMesh();
      landmarkBall(0); // back to the top for tomorrow night
    }
  }
  function gatherSpotFor(rec) {
    if (!rec._gather) {
      const S = ballSpots();
      const c = N().has(["plaza_centre", "screen_view", "center"]) || {
        x: TS.x,
        y: 0,
        z: TS.z,
      };
      const ref = S.base || c;
      const ang = Math.random() * Math.PI * 2,
        r = 4 + Math.random() * 9;
      const s = L.freeSpot(
        (ref.x + c.x) / 2 + Math.cos(ang) * r,
        (ref.z + c.z) / 2 + Math.sin(ang) * r,
        ref.y || 0,
        { maxR: 6 },
      );
      const face = S.hi ? Math.atan2(-(S.hi.x - s.x), -(S.hi.z - s.z)) : 0;
      rec._gather = { x: s.x, y: s.y, z: s.z, yaw: face };
    }
    return rec._gather;
  }
  function ballTick(dt) {
    if (!ballFixed()) return;
    const h = G.time.hour;
    const want = (h >= 23.6 || h < 0.25) && nearNeon(220);
    if (want !== BALL.gatherOn) {
      BALL.gatherOn = want;
      N().setGather(
        want
          ? {
              who: (rec) =>
                !rec.def.guard &&
                [
                  "folk",
                  "hawker",
                  "singer",
                  "merchant",
                  "director",
                  "dealer",
                ].indexOf(rec.def.role) >= 0 &&
                !(rec.a.pos.x >= IXM()),
              at: gatherSpotFor,
            }
          : null,
      );
      if (!want) for (const r of N().recs()) delete r._gather;
    }
    // the drop: 23:55 game time (10 real seconds ≈ the last 5 game minutes)
    const midnightDay = h >= 12 ? G.time.day + 1 : G.time.day;
    if (
      !BALL.seq &&
      h >= 23.915 &&
      L.flag("neon_ball_last") !== midnightDay &&
      nearNeon(170)
    ) {
      L.setFlag("neon_ball_last", midnightDay);
      startDrop();
    }
  }
  function installBall(how) {
    L.setFlag("neon_ball_fixed", how);
    L.take("q_neon_winch_motor", 1);
    L.take("q_neon_cable", 1);
    Q.setStage("sq_neon_ball", "midnight");
    L.sfx("terminal_success");
  }

  // ==================================================================
  // POWER TO THE PEOPLE
  // ==================================================================
  const RAID = { actors: [], spawned: false };
  function powerPanelSpot() {
    return N().spot(["power_generator", "power_panel", "power_engineer"], {
      near: ["stage", "totem", "center"],
      dx: -5.5,
      dz: -3,
    });
  }
  function kipSpot() {
    return N().spot(["convoy_park_2", "depot_door", "convoy_master"], {
      near: ["entrance_south", "subway"],
      dx: -3,
      dz: 4,
    });
  }
  function spawnKip() {
    if (L.flag("kip_gone") || L.isDead("neon_kip")) return null;
    const p = kipSpot();
    if (!p) return null;
    return L.spawnNPC({
      id: "neon_kip",
      type: "human",
      name: "Kip Lasko",
      outfit: "drifter",
      gender: "m",
      hat: "cap",
      hatColor: 0x3a3a3a,
      faction: "settlers",
      ai: "wander",
      pos: { x: p.x, y: p.y, z: p.z },
      home: { x: p.x, z: p.z, r: 3 },
      level: 5,
      weapon: "switchblade",
      dialogue: "dlg_neon_kip",
      voice: "settler",
      inventory: [
        ["scrip", 45],
        ["q_neon_pay_note", 1],
      ],
      barks: {
        idle: ["…", "Heavy crate. Heavy crate.", "Nobody saw nothing."],
        greet: [
          "What? I'm working.",
          "You need something moved? Move it yourself.",
        ],
      },
    });
  }
  function raidOrigin() {
    const gw = N().has(["gate_w"]) ||
      N().has(["guard3"]) || { x: -92, y: 0, z: -280 };
    // from the south-west (the Terminal Boys come up from the Port Authority), clear of MSG and the Lyceum
    return L.freeSpot(gw.x - 38, gw.z + 22, 0, { maxR: 10 });
  }
  function spawnRaid() {
    if (RAID.spawned) return;
    RAID.spawned = true;
    RAID.actors = [];
    const o = raidOrigin();
    if (!o) return;
    const gw = N().has(["gate_w"]) ||
      N().has(["guard3"]) || { x: -92, z: -280 };
    const c = N().has(["plaza_centre", "center"]) || TS;
    const lvl = Math.max(4, L.level() + 1);
    const path = [
      { x: gw.x, z: gw.z },
      { x: c.x, z: c.z },
    ];
    const W = [
      "assault_rifle",
      "hunting_rifle",
      "sawed_off_shotgun",
      "smg_10mm",
      "bolt_rifle_32",
      "pistol_10mm",
      "combat_shotgun",
    ];
    for (let i = 0; i < 7; i++) {
      const boss = i === 0;
      const a = L.spawnNPC({
        id: "neon_raid" + i,
        type: "raider",
        faction: "raiders",
        name: boss ? "Slag" : "Terminal Boy",
        level: boss ? lvl + 3 : lvl,
        hostile: true,
        pos: {
          x: o.x + (Math.random() - 0.5) * 8,
          y: o.y,
          z: o.z + (Math.random() - 0.5) * 8,
        },
        ai: "patrol",
        patrol: path,
        weapon: boss ? "combat_shotgun" : W[i % W.length],
        voice: "raider",
        noRespawn: true,
        hp: boss ? 260 : undefined,
        inventory: boss
          ? [
              ["scrip", 120],
              ["rally_tonic", 2],
            ]
          : [["scrip", 12]],
        barks: boss
          ? {
              alert: ["Lights out, showfolk!", "The Neon's OURS tonight!"],
              combat: ["Burn it! Burn it all!", "Where's my lights, Kip?!"],
            }
          : undefined,
      });
      if (a) {
        a.safeExempt = true;
        a.questRaid = true;
        RAID.actors.push(a);
      }
    }
    const capt = L.npc("neon_capt");
    if (capt && !capt.dead)
      capt.say("Here they come! West gate — everybody on the wall!", 4);
    L.notify("Raiders are storming the west gate!");
    // lights out, if the saboteur's cut was never spliced
    if (!L.flag("power_spliced")) blackoutStart();
  }
  /**
   * The black-out. landmarks_a's times_square.setPower(k) dims the square's neon when it exists; until then
   * (and on top of it) quests stages the failure itself: transformers blow in a chain across the billboard
   * walls (flash-pool pops + spark showers), the cut feed at the breaker cabinet keeps arcing, the Oracle's
   * and the notice board's lamps die, and the crowd panics. Power comes back when the raid is beaten.
   */
  const BLACK = { on: false, t: 0, pops: [], popT: 0, arcT: 0 };
  function landmarkPower(k) {
    try {
      const ts = !G.isStub("landmarks") && G.landmarks.times_square;
      if (ts && typeof ts.setPower === "function") {
        ts.setPower(k);
        return true;
      }
    } catch (e) {
      /* ignore */
    }
    return false;
  }
  function billboardPoints() {
    const c = N().has(["plaza_centre", "center"]) || { x: TS.x, y: 0, z: TS.z };
    const out = [];
    for (let i = 0; i < 10; i++) {
      const a = i * 2.39996 + 0.4,
        r = 30 + (i % 3) * 7;
      out.push(
        new THREE.Vector3(
          c.x + Math.cos(a) * r,
          11 + ((i * 7) % 14),
          c.z + Math.sin(a) * r,
        ),
      );
    }
    return out;
  }
  function servicesLamps(on) {
    try {
      const S = L.neonServices;
      if (S && typeof S.lamps === "function") S.lamps(on);
    } catch (e) {
      /* ignore */
    }
  }
