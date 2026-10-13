// play-inline-582 02 — the
// Lines 302-567 of readable/play-inline-582.pretty.js (statement-aligned).
  QX.hook("world", function () {
    const k = K();
    const p = QX.freeSpot(SP.knight.x, SP.knight.z, undefined, {
      maxR: 8,
      radius: 1.6,
    });
    SP.knight.x = p.x;
    SP.knight.z = p.z;
    SP.knight.y = p.y;
    const yaw = Math.PI / 2; // she faces east, across the avenue; the scaffold lies across her legs
    const g = k.group(p.x, p.y, p.z, yaw, 140);
    const b = k.builder();
    const pipe = k.mat("rust", 0x6a3a22),
      plank = k.mat("wood_planks", 0x6a5238),
      slab = k.mat("concrete_dark", 0x55524c);
    const tarp = k.tint("qx_kd_tarp", 0x3f5a4a, {
      roughness: 1,
      side: THREE.DoubleSide,
    });
    // the standing half of the scaffold behind her (against the building line)
    for (const sx of [-1.8, 1.8])
      for (const sz of [0.9, 2.3]) k.cyl(b, pipe, 0.035, 3.6, sx, 1.8, sz, 6);
    for (const y of [1.2, 2.4, 3.5]) {
      k.cyl(b, pipe, 0.03, 3.7, 0, y, 0.9, 6, 0, Math.PI / 2);
      k.cyl(b, pipe, 0.03, 3.7, 0, y, 2.3, 6, 0, Math.PI / 2);
    }
    k.box(b, plank, 3.8, 0.05, 1.5, 0, 2.43, 1.6);
    k.box(b, tarp, 3.6, 1.1, 0.02, 0, 3.0, 2.34, 0, 0.05);
    // the collapsed half: planks & a girder across her shins (her legs point toward local -Z)
    k.box(
      b,
      pipe,
      0.22,
      0.28,
      4.4,
      0.05,
      0.42,
      -0.72,
      Math.PI / 2 - 0.12,
      0,
      0.08,
    ); // steel I-beam across the legs
    k.box(
      b,
      pipe,
      0.02,
      0.3,
      4.4,
      0.05,
      0.42,
      -0.72,
      Math.PI / 2 - 0.12,
      0,
      0.08,
    );
    k.box(b, plank, 2.8, 0.05, 0.28, -0.6, 0.62, -1.05, 0.5, 0.2, 0.35);
    k.box(b, plank, 2.6, 0.05, 0.28, 0.9, 0.3, -1.6, -0.4, 0.1, -0.2);
    for (let i = 0; i < 4; i++)
      k.cyl(
        b,
        pipe,
        0.035,
        2.8 + i * 0.4,
        -1.2 + i * 0.8,
        0.25 + (i % 2) * 0.35,
        -1.3 - i * 0.25,
        6,
        1.35 - i * 0.3,
        0.2 * i,
      );
    for (let i = 0; i < 6; i++)
      k.box(
        b,
        slab,
        0.5 + (i % 3) * 0.2,
        0.18 + (i % 2) * 0.1,
        0.4,
        -1.8 + i * 0.7,
        0.1,
        -2.1 + (i % 2) * 0.5,
        i,
      );
    k.flush(b, g, false);
    k.collider(p.x, p.z, 4.4, 1.2, p.y, p.y + 0.6, yaw, "metal");
    const c1 = k.local(g, 0, 1.6);
    k.collider(c1.x, c1.z, 3.8, 1.6, p.y + 2.4, p.y + 2.5, yaw, "wood");
    // the transponder: a hardened box on her exo-rig's backpack frame, with a whip antenna and a red strobe
    const tp = k.local(g, 0.55, 0.35);
    const tg = k.group(tp.x, p.y, tp.z, yaw, 160);
    const tb = k.builder();
    k.box(tb, k.mat("metal_panel", 0x4a4a44), 0.2, 0.26, 0.14, 0, 0.13, 0);
    k.cyl(tb, k.mat("metal_panel", 0x4a4a44), 0.006, 1.6, 0.06, 1.06, 0, 5);
    k.flush(tb, tg, false);
    const strobeMat = new THREE.MeshStandardMaterial({
      color: 0x401010,
      emissive: 0xff2a1a,
      emissiveIntensity: 0.2,
      roughness: 0.4,
    });
    const strobe = new THREE.Mesh(
      new THREE.SphereGeometry(0.035, 10, 6),
      strobeMat,
    );
    strobe.position.set(0.06, 1.88, 0);
    tg.add(strobe);
    beacon = {
      pos: QX.V3(tp.x, p.y + 1.2, tp.z),
      mat: strobeMat,
      t: 0,
      beep: 0,
    };
    // the tow-truck wreck with the jack in its toolbox
    const j = QX.freeSpot(SP.jack.x, SP.jack.z, undefined, {
      maxR: 8,
      radius: 2.5,
    });
    SP.jack.x = j.x;
    SP.jack.z = j.z;
    SP.jack.y = j.y;
    QX.prop("car", {
      x: j.x,
      z: j.z,
      yaw: 0.2,
      kind: "pickup",
      wreck: true,
      persistent: true,
    });
    if (QX.live("containers") && G.containers.create) {
      QX.world.kdToolbox = QX.safe("kdToolbox", () =>
        G.containers.create({
          id: "qx_kd_towbox",
          kind: "toolbox",
          name: "Tow Truck Toolbox",
          pos: { x: j.x + 2.4, y: j.y, z: j.z + 0.6 },
          yaw: -Math.PI / 2,
          items: [
            ["qx_kd_jack", 1],
            ["scrap_metal", 2],
            ["duct_tape", 1],
            ["wrench", 1],
          ].filter((e) => QX.itemExists(e[0])),
        }),
      );
    }
    if (!QX.world.kdToolbox)
      QX.hook("spawn", () => {
        if (!QX.has("qx_kd_jack") && !QX.flag("kd_freed"))
          QX.pickup("kd_jack", "qx_kd_jack", 1, {
            x: j.x + 2.4,
            y: j.y + 0.05,
            z: j.z + 0.6,
          });
      });
  });

  // Strobe blink + transponder pips (only near, only while the pulse is on).
  QX.hook("update", function (dt, realDt) {
    if (!beacon) return;
    const on = !QX.reached(QID, "done_saved") && !QX.flag("kd_gone");
    beacon.t += realDt;
    const ph = beacon.t % 2.4;
    const lit = on && (ph < 0.12 || (ph > 0.3 && ph < 0.42));
    beacon.mat.emissiveIntensity = lit ? 3.2 : 0.15;
    if (!on || QX.inInterior()) return;
    const d = QX.dist(beacon.pos.x, beacon.pos.z);
    if (d > 45) return;
    if (
      (ph < 0.12 || (ph > 0.3 && ph < 0.42)) &&
      beacon.beep !== Math.floor(beacon.t / 0.3)
    ) {
      beacon.beep = Math.floor(beacon.t / 0.3);
      QX.sfx("mine_beep", { pos: beacon.pos, pitch: 0.62, volume: 0.7 });
    }
  });

  // ==================================================================
  // NPCs: Rask and the Maniacs
  // ==================================================================
  QX.hook("spawn", function () {
    if (QX.flag("kd_gone")) return;
    const p = SP.knight;
    if (p.y === undefined) return;
    const saved = QX.reached(QID, "done_saved");
    QX.spawnNPC({
      id: NPC,
      type: RASK_TYPE,
      name: "Lancer Rask",
      gender: "f",
      faction: RASK_FACTION,
      level: 8,
      essential: true,
      noRespawn: true,
      ai: saved ? "wander" : "sit",
      home: "here",
      homeR: saved ? 4 : 0.2,
      voice: RASK_VOICE,
      dialogue: "qx_dlg_rask",
      weapon: QX.flag("kd_robbed") ? undefined : CARBINE,
      inventory: [[ROCKETS, 12]],
      pos: { x: p.x, y: p.y, z: p.z },
      yaw: Math.PI / 2,
      barks: QX.flag("kd_robbed")
        ? ["Coward.", "The Covenant remembers faces."]
        : [
            "Stay back from the Maniacs' side of the street.",
            "Transponder's still going. Every Maniac in the Kitchen knows I'm here.",
            "Iron and oath... ow.",
          ],
    });
    if (saved) QX.later(1, walkOff);
    if (!QX.done(QID)) {
      for (let i = 0; i < MANIACS; i++) {
        const id = "qx_kd_maniac" + i;
        if (QX.flag("dead_" + id)) continue;
        const a = (i / MANIACS) * Math.PI * 2 + 0.7;
        QX.spawnNPC({
          id,
          type: MANIAC_TYPE,
          name: i === 0 ? "Maniac Roamer" : "Maniac",
          faction: MANIAC_FACTION,
          hostile: true,
          level: 4 + i,
          noRespawn: true,
          ai: "wander",
          home: { x: p.x + Math.cos(a) * 12, z: p.z + Math.sin(a) * 12, r: 7 },
          aggroRange: 18,
          at: {
            fallback: { x: p.x + Math.cos(a) * 12, z: p.z + Math.sin(a) * 12 },
            maxR: 6,
          },
        });
      }
    }
  });

  // Start: the pulse is picked up within ~110 m outdoors (the goggles' emergency band), or by tuning the signal.
  QX.trigger({
    id: "kd_pulse",
    pos: () => SP.knight,
    r: 110,
    cond: () => !QX.started(QID) && !QX.inInterior() && G.player.pos.y < 30,
    fire: () => A.start(false),
  });
  QX.trigger({
    id: "kd_arrive",
    pos: () => SP.knight,
    r: 9,
    cond: () => QX.stage(QID) === "find",
    fire: () => {
      QX.say(NPC, "Civilian! Over here — keep your head down!", 4);
    },
  });
  G.events.on("radioSignalFound", (e) => {
    if (e && (e.id === "sig_covenant_distress" || e.id === "sig_lancer"))
      QX.later(2, () => A.start(false));
  });
  G.events.on("itemAdded", (id) => {
    if (id === "qx_kd_jack" && QX.started(QID) && !QX.flag("kd_freed"))
      QX.notify("A twelve-ton bottle jack. That should shift a girder.", {
        quiet: true,
      });
  });

  // ==================================================================
  // Dialogue
  // ==================================================================
