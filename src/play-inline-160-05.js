// play-inline-160 05 — pos
// Lines 764-1066 of readable/play-inline-160.pretty.js (statement-aligned).
  function alertHouse(pos, r) {
    const C = G.__cmb;
    if (C && typeof C.noise === "function") {
      try {
        C.noise(pos, r, "player", "gun");
        return;
      } catch (e) {
        /* fall back */
      }
    }
    if (!live("actors") || typeof G.actors.inRadius !== "function") return;
    for (const a of G.actors.inRadius(pos, r)) {
      if (!a || a.dead || !a.hostile || !a.hostile()) continue;
      try {
        a.moveTo(
          pos.x + (Math.random() - 0.5) * 3,
          pos.z + (Math.random() - 0.5) * 3,
        );
      } catch (e) {
        /* */
      }
    }
  }
  function boom(t) {
    TS[t.id] = "tripped";
    refresh(t);
    const q = t.boomAt || t.mid;
    try {
      if (live("combat") && typeof G.combat.explode === "function")
        G.combat.explode(q.clone(), 3.6, t.dmg, {
          source: null,
          kind: "normal",
        });
      else {
        const d = G.player.pos.distanceTo(q);
        if (d < 3.6)
          G.player.damage(t.dmg * (1 - d / 3.6), { type: "explosive" });
        if (G.fx && G.fx.explosion) G.fx.explosion(q.clone(), 3);
      }
    } catch (e) {
      G.reportError("poi_uptown:trap boom", e);
    }
  }

  let blinkT = 0;
  function tickTraps(dt) {
    const p = G.player && G.player.pos;
    if (!p || !G.player.alive) return;
    blinkT += dt;
    const sneaking = !!G.player.sneaking;
    const onGround = G.player.onGround !== false;
    for (const t of traps) {
      if (!P.inCell(t.cell)) continue;
      // fuses (grenade bouquets, beeping mines)
      if (t.fuse > 0) {
        t.fuse -= dt;
        if (t.kind === "mine") {
          if (stateOf(t) !== "armed") {
            t.fuse = -1;
            continue;
          } // disarmed in time
          t.beep -= dt;
          if (t.beep <= 0) {
            t.beep = t.fuse > 0.6 ? 0.22 : 0.1;
            sfx("robot_beep", t.pos, { volume: 0.7, pitch: 2.2 });
          }
          if (t.led) t.led.visible = Math.floor(blinkT * 12) % 2 === 0;
        }
        if (t.fuse <= 0) {
          t.fuse = -1;
          boom(t);
        }
        continue;
      }
      if (stateOf(t) !== "armed") continue;
      if (t.led) t.led.visible = blinkT % 1.6 < 0.12;
      const dx = p.x - t.mid.x,
        dz = p.z - t.mid.z,
        d2 = dx * dx + dz * dz;
      if (d2 > 144) continue;
      // Perception / Explosives: spot it before stepping on it
      if (!spotted[t.id] && d2 < 36 && Math.abs(p.y - t.floorY) < 2.5) {
        spotted[t.id] = true;
        const score = attr("senses", 5) * 8 + skill("explosives", 15) * 0.5;
        if (score >= t.spotDC)
          G.notify("[Senses] You spot " + SPOT[t.kind] + ".");
      }
      const dy = p.y - t.floorY;
      if (dy < -0.3 || dy > 0.9) continue;
      if (t.kind === "mine") {
        const r = sneaking ? 1.3 : 2.2;
        if (d2 < r * r) {
          trip(t);
          sfx("robot_beep", t.pos, { volume: 0.9, pitch: 2.2 });
        }
      } else if (t.kind === "beartrap") {
        if (Math.hypot(p.x - t.pos.x, p.z - t.pos.z) < 0.42 && dy < 0.3)
          trip(t);
      } else {
        // wires: walking through trips them, jumping over does not
        if (onGround && dy < 0.3 && segDist2(p, t.a, t.c) < 0.3 * 0.3) trip(t);
      }
    }
  }

  // ==================================================================
  // GARRISONS (authored enemy placements, stable ids)
  // ==================================================================
  // at: local cell coords; opts: ai, patrol (local pts), dormant (play dead, wake radius), weapon, name, holdPos, level offset
  const GARRISON = {
    tiffany: [
      {
        id: "pu_g_tif_drum1",
        type: "raider",
        at: [-7.6, 0, 19.2],
        yaw: PI * 0.8,
        ai: "guard",
        name: "Raider",
        barks: ["Who's at the door?", "Your turn to watch the cans."],
      },
      {
        id: "pu_g_tif_drum2",
        type: "raider",
        at: [-4.4, 0, 21.4],
        yaw: -PI * 0.7,
        ai: "guard",
        weapon: "lead_pipe",
      },
      {
        id: "pu_g_tif_patrol",
        type: "raider",
        at: [-10, 6.8, 8.5],
        ai: "patrol",
        patrol: [
          [-10, 6.8, 8.5],
          [8, 6.8, 8.5],
          [8, 6.8, 20],
          [-9, 6.8, 20],
        ],
        weapon: "bolt_rifle_32",
      },
      {
        id: "pu_g_tif_dog",
        type: "dog",
        at: [-6.2, 0, -2.2],
        ai: "guard",
        faction: "raiders",
        name: "Raider Attack Dog",
      },
      {
        id: "pu_g_tif_vault",
        type: "raider",
        at: [5.6, -5, -12.4],
        yaw: PI,
        ai: "guard",
        name: "Raider Safecracker",
        weapon: "sawed_off_shotgun",
        barks: ["Forty-one... forty-two... damn it."],
      },
      {
        id: "pu_g_tif_lookout",
        type: "raider",
        exterior: "lookout",
        ai: "guard",
        holdPos: true,
        name: "Raider Lookout",
        weapon: "hunting_rifle",
        lvl: 1,
      },
    ],
    dakota: [
      // the Pell dinner party: guests slumped by the table, playing dead until you lean in
      {
        id: "pu_g_dak_guest1",
        type: "maniac",
        at: [12.6, 4.5, 10.6],
        dormant: 5,
        name: "Dinner Guest",
      },
      {
        id: "pu_g_dak_guest2",
        type: "maniac",
        at: [20.6, 4.5, 16.6],
        dormant: 5,
        name: "Dinner Guest",
      },
      {
        id: "pu_g_dak_guest3",
        type: "maniac",
        at: [21.8, 4.5, 10.4],
        dormant: 6,
        name: "Dinner Guest",
      },
      {
        id: "pu_g_dak_lounge",
        type: "maniac",
        at: [-21.5, 0, 9.6],
        dormant: 5,
      },
      { id: "pu_g_dak_base1", type: "maniac", at: [12, -4.5, 5], ai: "wander" },
      { id: "pu_g_dak_base2", type: "maniac", at: [22, -4.5, 5], ai: "wander" },
      {
        id: "pu_g_dak_hall2",
        type: "maniac",
        at: [-20, 4.5, 5],
        ai: "wander",
        name: "Maniac Doorman",
      },
      // outside: one slumped in the carriage passage, one wandering the courtyard (world coords)
      {
        id: "pu_g_dak_arch",
        type: "maniac",
        world: [-139.5, 0, -616.6],
        dormant: 6,
      },
      {
        id: "pu_g_dak_court",
        type: "maniac",
        world: [-160, 0, -619],
        ai: "wander",
      },
    ],
    amnh: [
      {
        id: "pu_g_amnh_lurk1",
        type: "shellback",
        at: [8, -4.5, -40],
        ai: "wander",
      },
      {
        id: "pu_g_amnh_lurk2",
        type: "shellback",
        at: [34, -4.5, -20],
        ai: "wander",
      },
      {
        id: "pu_g_amnh_roach1",
        type: "giant_roach",
        at: [-44, 0, -33],
        ai: "wander",
      },
      {
        id: "pu_g_amnh_roach2",
        type: "giant_roach",
        at: [-43, 0, -31.5],
        ai: "wander",
      },
      {
        id: "pu_g_amnh_roach3",
        type: "giant_roach",
        at: [-26, 0, -14],
        ai: "wander",
      },
      {
        id: "pu_g_amnh_rat1",
        type: "burrow_rat",
        at: [-48, 0, 8],
        ai: "wander",
      },
      {
        id: "pu_g_amnh_rat2",
        type: "burrow_rat",
        at: [-22, 0, 27],
        ai: "wander",
      },
      // outside: burrow rats burrowed into the Roosevelt terrace lawns on Central Park West (world coords)
      {
        id: "pu_g_amnh_out1",
        type: "burrow_rat",
        world: [-129.5, 0, -739],
        ai: "wander",
      },
      {
        id: "pu_g_amnh_out2",
        type: "burrow_rat",
        world: [-129.5, 0, -703],
        ai: "wander",
      },
    ],
  };
  const spawnedCell = {};
  function locLevel(key) {
    try {
      const l = G.LAYOUT.getLocation
        ? G.LAYOUT.getLocation(key)
        : (G.LAYOUT.LOCATIONS || []).find((x) => x.id === key);
      return (l && l.level) || 5;
    } catch (e) {
      return 5;
    }
  }
  function locFaction(key) {
    try {
      const l = G.LAYOUT.getLocation ? G.LAYOUT.getLocation(key) : null;
      return (l && l.faction) || null;
    } catch (e) {
      return null;
    }
  }
  function extAnchor(siteId, name) {
    const S = P.sites.find((s) => s.id === siteId);
    return S && S.anchors[name] ? S.anchors[name].clone() : null;
  }
