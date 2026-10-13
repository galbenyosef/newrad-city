// play-inline-525 02 — math
// Lines 374-614 of readable/play-inline-525.pretty.js (statement-aligned).
  function sandwichBoard() {
    if (!boardGeo) {
      const tex = K.canvasTex(256, 384, (c, w, h) => {
        c.fillStyle = "#d9cfae";
        c.fillRect(0, 0, w, h);
        for (let i = 0; i < 900; i++) {
          c.fillStyle = "rgba(80,60,30," + Math.random() * 0.12 + ")";
          c.fillRect(
            Math.random() * w,
            Math.random() * h,
            2 + Math.random() * 6,
            1 + Math.random() * 3,
          );
        }
        c.fillStyle = "#7a1a14";
        c.textAlign = "center";
        c.font = "bold 50px Impact, Oswald, sans-serif";
        c.fillText("REPENT!", w / 2, 70);
        c.fillStyle = "#231a12";
        c.font = "bold 30px Impact, Oswald, sans-serif";
        const lines = ["THE BOMBS", "WERE JUST", "THE WARM-UP"];
        lines.forEach((l, i) => c.fillText(l, w / 2, 140 + i * 42));
        c.font = "italic 22px Georgia, serif";
        c.fillText("— Br. Amos, Broadway", w / 2, 300);
        c.strokeStyle = "#3a2a1a";
        c.lineWidth = 8;
        c.strokeRect(6, 6, w - 12, h - 12);
        c.fillStyle = "rgba(60,40,20,0.35)";
        c.fillRect(0, h - 40, w, 40);
      });
      const m = K.mat(
        "amb_board",
        () => new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 }),
      );
      const g = new THREE.PlaneGeometry(0.5, 0.74);
      boardGeo = {
        g,
        m,
        frame: K.merge([
          K.part(
            new THREE.BoxGeometry(0.52, 0.76, 0.02),
            0x4a3522,
            [0, 0, 0],
            null,
            null,
            0.2,
            3,
          ),
        ]),
      };
    }
    const grp = new THREE.Group();
    grp.name = "amb_sandwich_board";
    const fm = K.vcMat("amb_board_frame");
    for (const s of [-1, 1]) {
      const fr = new THREE.Mesh(boardGeo.frame, fm);
      fr.position.set(0, 0, s * 0.19);
      fr.rotation.x = -s * 0.1;
      grp.add(fr);
      const pl = new THREE.Mesh(boardGeo.g, boardGeo.m);
      pl.position.set(0, 0, s * 0.203);
      pl.rotation.x = -s * 0.1;
      if (s < 0) pl.rotation.y = Math.PI;
      grp.add(pl);
    }
    return grp;
  }
  const SERMON = [
    'The Lord looked upon Manhattan and said: "Eh." And lo, the Bombs fell.',
    "Repent! The Bombs were only the warm-up act!",
    "Brothers, sisters! Your Rush will not save you! Unless it's the good Rush. Even then, no.",
    "Blessed are the irradiated, for they shall glow in the Kingdom! Not like THAT, Glowkeepers. Sit down.",
    "I have seen the Second Warm-Up! It had FOUR heads! Like a committee, but worse!",
    "Ask not what the Ruins can do for you! They can do nothing! They are ruins!",
    "The Continuity flies! The Iron Covenant marches! And the Lord? The Lord is taking notes!",
    "Donations! Scrip, water, snack cakes! The Almighty accepts all currencies!",
    "They told us it would be the Russians! It was the French! Read your Revelation, people, it is ALL in there!",
  ];
  function encPreacher() {
    const P = G.player.pos;
    const s = K.streetSpot(P.x, P.z, 35, 60, {
      road: true,
      hidden: true,
      notSettlement: true,
      clear: 1,
      tries: 40,
    });
    if (!s) return null;
    // walk a line down the street, back and forth, preaching
    const ax = G.LAYOUT.isRoad(s.x + 12, s.z) && G.LAYOUT.isRoad(s.x - 12, s.z);
    const pts = ax
      ? [
          { x: s.x - 18, z: s.z },
          { x: s.x + 18, z: s.z },
        ]
      : [
          { x: s.x, z: s.z - 18 },
          { x: s.x, z: s.z + 18 },
        ];
    const a = K.spawnActor({
      type: "human",
      outfit: "settler",
      gender: "m",
      hair: "wild",
      faction: "settlers",
      name: "Brother Amos Vell",
      level: 4,
      pos: s,
      ai: "patrol",
      patrol: pts,
      weapon: "none",
      noRespawn: true,
      dialogue: "amb_dlg_preacher",
      voice: "settler",
      barks: {
        idle: SERMON,
        greet: ["Ah! A lost lamb! Or a lost... whatever you are!"],
      },
      inventory: K.stock([
        [K.SCRIP, 12],
        ["amb_note_pamphlet", 3],
      ]),
      seed: "amb_preacher",
    });
    if (!a) return null;
    // sandwich board over the torso (follows the rig)
    const E = {
      kind: "preacher",
      x: s.x,
      z: s.z,
      actors: [a],
      objs: [],
      t: 0,
      nextSermon: K.now() + 3,
    };
    try {
      const torso = a.char && a.char.parts && a.char.parts.torso;
      if (torso) {
        const b = sandwichBoard();
        b.position.set(0, 0.05, 0);
        torso.add(b);
        E.objs.push(b);
      }
    } catch (e) {
      /* cosmetic */
    }
    stats.preacher++;
    E.update = function (dt) {
      E.t += dt;
      if (!K.actorAlive(a)) return castGone(E) ? "gone" : null;
      E.x = a.pos.x;
      E.z = a.pos.z;
      const d = K.distToPlayer(a.pos.x, a.pos.z);
      if (d < 45 && K.now() > E.nextSermon && !K.actorBusy(a) && !a.inCombat) {
        E.nextSermon = K.now() + K.rand(7, 14);
        K.say(a, K.pick(SERMON), 5);
      }
      return castGone(E) || E.t > 900 ? "gone" : null;
    };
    E.cleanup = function () {
      removeCast(E);
    };
    return E;
  }
  function registerPreacherDialogue() {
    K.registerDialogue("amb_dlg_preacher", {
      start: "hello",
      nodes: {
        hello: {
          text: () =>
            K.standing() <= -500
              ? "YOU. I know that walk. That is the walk of someone who has done Things. Repent! Repent at once! ...Or at least tithe."
              : "Brother! Sister! Popsicle-person! Have you heard the Good News? The Bombs were only the warm-up. The main event is coming, and the tickets are FREE.",
          responses: [
            { text: "What exactly is coming?", next: "doom" },
            {
              text: "[Give 10 scrip] For the mission.",
              cond: () => K.scrip() >= 10,
              action: () => {
                if (K.takeScrip(10)) {
                  K.addStanding(10, "Donated to a street preacher");
                  K.sfx(K.SFX_PAY);
                }
              },
              next: "thanks",
            },
            {
              text: "If the Lord wanted us saved, why'd He make the bomb so easy to build?",
              check: { skill: "persuasion", value: 40 },
              next: "debate_win",
              failNext: "debate_lose",
            },
            { text: "Your sign is upside down.", next: "sign" },
            { text: "Goodbye, preacher.", end: true },
          ],
        },
        doom: {
          text: "The Second Warm-Up! Fire from the sky, but slower, so you can see it coming. Brutes in the streets, but polite, so it hurts more. And the rivers shall run with Fizzo Cola. Flat Fizzo Cola.",
          responses: [
            { text: "That sounds... specific.", next: "hello" },
            { text: "I'll keep an eye out.", end: true },
          ],
        },
        thanks: {
          text: "Bless you! May your Geiger stay quiet and your tonic bottles be many. Here: the Word, in portable form.",
          onEnter: () => {
            if (
              K.itemExists("amb_note_pamphlet") &&
              !G.isStub("inventory") &&
              !(G.inventory.count("amb_note_pamphlet") > 0)
            )
              K.give("amb_note_pamphlet", 1);
          },
          responses: [{ text: "Thanks, I guess.", end: true }],
        },
        debate_win: {
          text: "...Huh. Huh! I... the Lord works in... hm. You know, nobody's ever argued BACK before. Take this. It's the only copy I haven't sold. It's free. Theologically, it's now yours.",
          onEnter: () => {
            K.addXP(25, "Out-argued a preacher");
            if (K.itemExists("amb_note_pamphlet"))
              K.give("amb_note_pamphlet", 1);
          },
          responses: [{ text: "Go in peace, Brother.", end: true }],
        },
        debate_lose: {
          text: "AH-HA! A doubter! The Lord LOVES a doubter. They fall the funniest! Begone, heathen, you're scaring off my congregation. (There is no congregation.)",
          responses: [{ text: "Fine.", end: true }],
        },
        sign: {
          text: "...It is NOT. It's just that the whole world's upside down, friend. The sign's the only thing that's right.",
          responses: [{ text: "Deep.", next: "hello" }],
        },
      },
    });
  }

  // ------------------------------------------------------------------
  // Encounter: Timothy Pell, a lost sleeper out of Cryo Unit C-7 (not C-4: C-4 thawed all its pods in 1967)
  // ------------------------------------------------------------------
  const GC_ID = "grand_central";
  let sleeper = null; // the live actor while the encounter/quest runs
