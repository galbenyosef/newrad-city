// play-inline-559 01 — math
// Lines 24-309 of readable/play-inline-559.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const L = G.quests.lib;
  const Q = G.quests;
  const N = () => L.neonTown;
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const TS = { x: -40, z: -262 };
  const IXM = () => (G.LAYOUT ? G.LAYOUT.INTERIOR_X_MIN : 2500);
  const absH = () =>
    (Math.max(1, G.time.day || 1) - 1) * 24 + (G.time.hour || 0);
  const nearNeon = (r) =>
    G.player &&
    G.player.pos.x < IXM() &&
    Math.hypot(G.player.pos.x - TS.x, G.player.pos.z - TS.z) < (r || 150);
  function mk(names, fb, label) {
    const s = N().spot(names, fb);
    return s ? { x: s.x, z: s.z, y: s.y, label } : null;
  }
  const npcM = (id, label) => ({ npc: id, label });

  // ------------------------------------------------------------------
  // Items
  // ------------------------------------------------------------------
  L.hook("init", function () {
    const Qi = (d) =>
      L.defineItem(
        Object.assign(
          { type: "misc", weight: 0, value: 0, quest: true, noLoot: true },
          d,
        ),
      );
    Qi({
      id: "q_neon_winch_motor",
      name: "Book-Lift Winch Motor",
      weight: 8,
      mesh: "toolbox",
      desc: "A 1930s elevator winch motor pulled out of the New York Public Library's book lift. Heavy, greasy, and — incredibly — it still turns.",
    });
    Qi({
      id: "q_neon_cable",
      name: "Spool of Steel Cable",
      weight: 4,
      mesh: "toolbox",
      desc: 'Forty metres of braided steel elevator cable, re-spooled by Sprocket. "Rated for one Ball. Do NOT use for bungee."',
    });
    L.defineItem({
      id: "q_neon_sab_note",
      type: "note",
      name: "Crumpled Note (Power Plant)",
      title: "Found in the Big Buzz breaker room",
      weight: 0,
      value: 0,
      noLoot: true,
      text: "Cut the main at 2. West gate. They come when it's dark.\nHalf now, half after.\nBurn this.\n\n— K.L.\n\n[The note has not been burned. There is a greasy thumbprint and the stamp of the NEON DEPOT on the back.]",
    });
    L.defineItem({
      id: "q_neon_pay_note",
      type: "note",
      name: "Slag's Promise",
      title: "Scrawled on a Port Authority bus schedule",
      weight: 0,
      value: 0,
      noLoot: true,
      text: "Kip —\nLights out at 2, west gate open, and you get your 300 back plus a cut of the Neon. You don't, and I tell Lucky Lou where you sleep.\n— Slag, Terminal Boys",
    });
    Qi({
      id: "q_neon_wig",
      name: "Velvet's Wig",
      weight: 1,
      mesh: "teddy",
      desc: "An enormous platinum-blonde old-world wig, lacquered into a shape not found in nature. Smells of hairspray, whiskey, and fame.",
    });
    L.defineItem({
      id: "q_neon_beret",
      type: "apparel",
      slot: "head",
      name: "Neon Guard Sergeant's Beret",
      weight: 0,
      value: 80,
      dr: 2,
      attrs: { presence: 1 },
      skills: { firearms: 5 },
      desc: "A red beret with a hand-soldered neon-tube badge that still glows faintly. Captain Kincaid pinned it on you herself. +1 Presence, +5 Firearms.",
    });
    Qi({
      id: "q_neon_club_card",
      name: "Cinder Club Membership Card",
      value: 25,
      mesh: "paper",
      quest: false,
      desc: '"HONORARY CARD-BURNER. Bearer is permitted in the Cinder Club despite never having burned a census card." Signed by Big Sal, with a thumbprint the size of a postage stamp.',
    });
    L.defineItem({
      id: "q_neon_program",
      type: "note",
      name: "Neon Revue Programme",
      title: "THE NEON REVUE — OPENING NIGHT",
      weight: 0,
      value: 10,
      noLoot: true,
      text: 'LIONEL FAIRWEATHER presents\nTHE NEON REVUE\n"Twenty-Two Years of Broadway (After the Fire)"\n\nstarring VELVET MALONEY\nwith {NAME}\n\nAct I: "The Lights Never Go Out"\nAct II: "Mind the Face, Darling"\nFinale: "Shine On, Ashen Moon"\n\nNo refunds. No heckling (NICKY). Management is not responsible for falling scenery, falling actors, or falling standards.',
    });
  });

  // ==================================================================
  // DROP THE BALL
  // ==================================================================
  function ballSpots() {
    const T = N();
    const top = T.has(["ball_top"]);
    const ots = T.has(["one_times_square"]);
    const base = T.spot(["ball_base"], {
      near: ["one_times_square", "entrance_south"],
      dx: 0,
      dz: -4,
    });
    let hi = null,
      lo = null;
    if (top) {
      hi = { x: top.x, y: top.y, z: top.z };
      const b = T.has(["ball_bottom"]);
      lo = b
        ? { x: b.x, y: b.y, z: b.z }
        : { x: top.x, y: top.y - 11, z: top.z };
    } else if (ots) {
      hi = { x: ots.x, y: ots.y + 12.5, z: ots.z };
      lo = { x: ots.x, y: ots.y + 1.8, z: ots.z };
    }
    return { base, hi, lo };
  }
  // (a metre off the anchor: Wexler's manual can sit on the same NYPL 'loot1' spot, and two items on one
  //  point hide each other from the interaction focus)
  function motorSpot() {
    const p = L.anchor(
      "nypl",
      ["loot2", "loot1", "loot", "stacks", "boss", "entrance"],
      { x: 70, z: -160 },
    );
    return p
      ? L.freeSpot(p.x + 1.1, p.z + 0.4, p.y, { maxR: 3, radius: 0.25 })
      : p;
  }
  const BALL = {
    seq: null,
    gatherOn: false,
    sprite: null,
    lastDay: -1,
    mesh: null,
  };
  /**
   * Stopgap Ball (used only while landmarks_a has no times_square.setBallDrop): a quests-owned faceted
   * crystal ball — red / blue / white / gold panels, unlit so it blooms — that rides the mast down.
   * It is built when a drop starts and disposed when the fireworks end (1 draw call, 19 s a night).
   */
  function ballMesh() {
    if (BALL.mesh) return BALL.mesh;
    const geo = new THREE.IcosahedronGeometry(1.85, 2).toNonIndexed();
    const n = geo.attributes.position.count,
      col = new Float32Array(n * 3);
    const PAL = [
      [1, 1, 1],
      [1, 0.32, 0.3],
      [0.38, 0.62, 1],
      [1, 0.84, 0.36],
      [0.86, 0.94, 1],
      [1, 1, 1],
    ];
    for (let f = 0; f < n / 3; f++) {
      const c = PAL[(f * 7 + (f >> 2)) % PAL.length],
        k = 0.62 + ((f * 13) % 7) / 16;
      for (let v = 0; v < 3; v++) {
        const i = (f * 3 + v) * 3;
        col[i] = c[0] * k;
        col[i + 1] = c[1] * k;
        col[i + 2] = c[2] * k;
      }
    }
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const m = new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({ vertexColors: true }),
    );
    m.name = "neon_ball_stopgap";
    m.castShadow = false;
    m.receiveShadow = false;
    G.scene.add(m);
    BALL.mesh = m;
    return m;
  }
  function dropBallMesh() {
    const m = BALL.mesh;
    BALL.mesh = null;
    if (!m) return;
    try {
      if (m.parent) m.parent.remove(m);
      m.geometry.dispose();
      m.material.dispose();
    } catch (e) {
      /* ignore */
    }
  }
  function ballFixed() {
    return !!L.flag("neon_ball_fixed");
  }
  function landmarkBall(t) {
    try {
      const ts = !G.isStub("landmarks") && G.landmarks.times_square;
      if (ts && typeof ts.setBallDrop === "function") {
        ts.setBallDrop(t);
        return true;
      }
    } catch (e) {
      /* ignore */
    }
    return false;
  }
  function crowdNear(r) {
    return N()
      .recs()
      .filter(
        (rec) =>
          rec.a &&
          !rec.a.dead &&
          rec.a.inScene &&
          !rec.def.guard &&
          G.player &&
          Math.hypot(
            rec.a.pos.x - G.player.pos.x,
            rec.a.pos.z - G.player.pos.z,
          ) < (r || 45),
      );
  }
  function shout(text, n) {
    const c = crowdNear(50);
    for (let i = 0; i < Math.min(n || 3, c.length); i++) {
      const a = pick(c).a;
      if (!a.talking) a.say(text, 1.1);
    }
  }
  function firework(sp) {
    const col = pick([
      0xff5050, 0x50a0ff, 0xffe070, 0x70ff90, 0xff70e0, 0xffffff,
    ]);
    const p = new THREE.Vector3(
      sp.x + (Math.random() - 0.5) * 40,
      sp.y + 18 + Math.random() * 22,
      sp.z + (Math.random() - 0.5) * 40,
    );
    if (!G.isStub("fx")) {
      try {
        if (G.fx.flash) G.fx.flash(p, col, 2.5, 0.5);
      } catch (e) {
        /* ignore */
      }
      try {
        if (G.fx.sparks)
          for (let k = 0; k < 3; k++)
            G.fx.sparks(
              p
                .clone()
                .add(
                  new THREE.Vector3(
                    (Math.random() - 0.5) * 3,
                    (Math.random() - 0.5) * 3,
                    (Math.random() - 0.5) * 3,
                  ),
                ),
            );
      } catch (e) {
        /* ignore */
      }
    }
    L.sfx("explosion", {
      pos: p,
      volume: 0.22,
      pitch: 1.9 + Math.random() * 0.5,
    });
  }
  function startDrop() {
    const S = ballSpots();
    if (!S.hi) return;
    BALL.seq = { t: 0, n: 10, S, fireT: 0 };
    shout("Here it comes!", 2);
    L.notify("The Times Square Ball is dropping!");
  }
