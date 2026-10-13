// play-inline-161 08 — show
// Lines 2141-2455 of readable/play-inline-161.pretty.js (statement-aligned).
  function spawnNanny() {
    if (F.nanny === "rest" || F.nanny === "destroyed") return;
    const where =
      F.nanny === "agnes" ? A("dakota", "agnes_parlour") : A("dakota", "nanny");
    if (!where || G.isStub("actors")) return;
    if (actor("pu_nanny")) return;
    P.safe("spawn:nanny", () =>
      G.actors.spawn({
        id: "pu_nanny",
        type: "valet",
        name: "Nanny",
        faction: "settlers",
        level: 6,
        pos: { x: where.x, y: where.y, z: where.z },
        yaw: where.yaw || 0,
        ai: "guard",
        home: { x: where.x, z: where.z, r: 1.5 },
        dialogue: "dlg_pu_nanny",
        essential: false,
        hostile: F.nanny === "hostile",
        noRespawn: true,
        voice: "valet_m",
        barks: [
          "Hush now...",
          "Four notes, like your name...",
          "Please use your indoor voice.",
          "Eight thousand and thirty-five nights. Tonight is the night.",
        ],
        onDeath: () => {
          if (F.nanny !== "rest" && F.nanny !== "agnes") {
            F.nanny = "destroyed";
            if (qActive("pu_nursery")) qSet("pu_nursery", "report");
          }
        },
      }),
    );
  }
  function spawnAll() {
    for (const d of NPCS) spawnNPC(d);
    spawnNanny();
  }

  // ==================================================================
  // SET PIECES
  // ==================================================================
  // ---------- AMNH star show ----------
  let show = null;
  const SHOW_LINES = [
    "The house lights dim. Somewhere under the dome, a forty-year-old motor coughs and begins to turn.",
    '"Good evening, and welcome to the Hayden Planetarium. This morning: the sky over Manhattan, as it will appear tonight, Sunday the fifth of March, 1967."',
    '"Above you, the Great Square of Pegasus. To the north, Cassiopeia, the vain queen, forever rotating around the Pole Star."',
    '"On a clear night, far from the city lights, you might see as many as two thousand stars. In New York, of course, you see about eleven. And the Goodyear blimp."',
    '"Some say the stars are cold and distant. We at the Hayden prefer to think of them as permanent. Whatever happens down here..."',
    '"...they will still be up there, waiting for us to look up again. Thank you for visiting. Please mind the steps on your way out."',
  ];
  C.startStarShow = function () {
    const S = P.amnhShow;
    if (!S || !S.powered || show) return;
    show = { t: 0, line: 0 };
    S.active = true;
    G.sfx.play("hum_electric", { pos: S.pos, volume: 0.8 });
    try {
      if (!G.isStub("music")) G.music.setMood("cryo");
    } catch (e) {
      /* */
    }
    if (!F.showRuns) xp(50, "The Sky Over Manhattan");
    F.showRuns++;
  };
  function tickShow(dt, realDt) {
    const S = P.amnhShow;
    if (!S) return;
    const dome = S.dome;
    if (show) {
      show.t += realDt;
      const k =
        Math.min(1, show.t / 4) *
        (show.t > 44 ? Math.max(0, 1 - (show.t - 44) / 4) : 1);
      dome.material.color.setRGB(
        0.23 + 0.77 * k,
        0.26 + 0.74 * k,
        0.31 + 0.69 * k,
      );
      dome.rotation.y += realDt * 0.02;
      S.proj.rotation.y += realDt * 0.15;
      S.proj.rotation.z = Math.sin(show.t * 0.2) * 0.2;
      const li = Math.floor(show.t / 7.5);
      if (li > show.line - 1 && li < SHOW_LINES.length && li >= show.line) {
        if (P.inCell("amnh")) G.notify(SHOW_LINES[li]);
        show.line = li + 1;
      }
      if (show.t > 48) {
        show = null;
        S.active = false;
      }
    } else if (S.powered) {
      dome.material.color.setRGB(0.23, 0.26, 0.31);
      dome.rotation.y += realDt * 0.002;
    } else {
      dome.material.color.setRGB(0.03, 0.03, 0.04);
    }
  }
  // ---------- Carnegie concert ----------
  let concert = null;
  const CONCERT_LINES = [
    "The house lights go down. Dynamo No. 2 hums. Somewhere in the Dress Circle, Lady Constance coughs, loudly, so that everyone knows she came.",
    "Maestro Bell raises the baton. Four soft notes rise from the violins: the Hollis theme. A-D-A.",
    "The organ enters — twenty-two years of dust blowing out of the pipes in a great grey sigh, and then, underneath it, a chord.",
    'Rudy "Keys" Lomax takes the melody. His ring finger stays on. Mostly.',
    "The whole orchestra swells. For four minutes nobody in the hall is hungry, or irradiated, or afraid.",
    'The last chord fades, "ppp — as if the whole city is asleep". Silence. Then the Plaza Society, to its own astonishment, stands up and applauds.',
  ];
  function inAuditorium() {
    const O = P.I("carnegie_hall"),
      p = G.player && G.player.pos;
    if (!p) return false;
    const lx = p.x - O.x,
      lz = p.z - O.z,
      ly = p.y - O.y;
    return lx > -22 && lx < 22 && lz > -25 && lz < 16 && ly < 12;
  }
  function startConcert() {
    if (concert || F.concertDone) return;
    concert = { t: 0, line: 0 };
    const CC = P.carnegieConcert;
    if (CC) CC.group.visible = true;
    try {
      if (!G.isStub("radio") && G.radio.tune)
        G.radio.tune("classical", { pos: CC ? CC.stage : undefined });
    } catch (e) {
      /* */
    }
    try {
      if (!G.isStub("music")) G.music.setMood("settlement");
    } catch (e) {
      /* */
    }
    for (const id of ["pu_rudy", "pu_cellist", "pu_clara", "pu_bell"]) {
      const a = actor(id);
      if (a && a.char && a.char.setAnim)
        P.safe("anim", () => a.char.setAnim("work", { loop: true }));
    }
  }
  function tickConcert(dt, realDt) {
    const CC = P.carnegieConcert;
    if (!concert) {
      if (
        qStage("pu_encore") === "concert" &&
        P.inCell("carnegie_hall") &&
        inAuditorium()
      )
        startConcert();
      if (CC && !F.dynamoOn && CC.group.visible) CC.group.visible = false;
      if (CC && F.dynamoOn && !CC.group.visible && F.concertDone)
        CC.group.visible = true;
      return;
    }
    concert.t += realDt;
    const li = Math.floor(concert.t / 8);
    if (li >= concert.line && li < CONCERT_LINES.length) {
      G.notify(CONCERT_LINES[li]);
      concert.line = li + 1;
    }
    const bell = actor("pu_bell");
    if (bell && bell.char && bell.char.root)
      bell.char.root.rotation.z = Math.sin(concert.t * 2.1) * 0.03;
    if (concert.t > 50) {
      concert = null;
      F.concertDone = true;
      try {
        if (!G.isStub("radio") && G.radio.tune) G.radio.tune(null);
      } catch (e) {
        /* */
      }
      qComplete("pu_encore");
      try {
        if (!G.isStub("rpg") && G.rpg.addEffect)
          G.rpg.addEffect({
            id: "pu_standing_ovation",
            name: "Standing Ovation",
            kind: "buff",
            duration: 1800,
            mods: { attrs: { presence: 1 }, skills: { persuasion: 5 } },
            desc: "Presence +1, Persuasion +5. You were there.",
          });
      } catch (e) {
        /* */
      }
      try {
        if (!G.isStub("radio") && G.radio.addNews)
          G.radio.addNews(
            "Culture news, folks: Carnegie Hall is open for business! The Carnegie Consort premiered a symphony twenty-two years late, and I hear even the Plaza Society clapped. Somebody check on them.",
          );
      } catch (e) {
        /* */
      }
    }
  }
  // ---------- Dakota: crying, sealed door, Nanny ----------
  let cryT = 20;
  function tickDakota(dt, realDt) {
    if (!P.inCell("dakota")) return;
    const O = P.I("dakota"),
      p = G.player.pos;
    if (!F.cryHeard) {
      F.cryHeard = true;
      G.notify(
        "Somewhere far above you, a baby is crying. A woman's voice hums along, very softly.",
      );
    }
    if (F.nanny) return;
    cryT -= realDt;
    const onTop = p.y - O.y > 12;
    if (cryT <= 0) {
      cryT = onTop ? 25 : 60;
      G.notify(
        onTop
          ? "(From behind the boarded door at the end of the hall: a thin wail, and four notes of a lullaby.)"
          : "(A baby is crying, somewhere upstairs.)",
      );
      if (onTop) G.sfx.play("maniac_growl", { volume: 0.15, pitch: 2.2 });
    }
  }
  C.openHollis = function (silent) {
    const Sd = P.dakotaSealed;
    if (!Sd || Sd.open) return;
    Sd.open = true;
    F.hollisOpen = true;
    Sd.root.visible = false;
    try {
      G.world.removeCollider(Sd.col);
    } catch (e) {
      /* */
    }
    if (!silent) {
      G.sfx.play("door_open");
      G.notify(
        "The boards come away. The door swings open on a room that smells of talcum powder and twenty-two years.",
      );
      if (qStage("pu_nursery") === "open" || qStage("pu_nursery") === "key")
        qSet("pu_nursery", "source");
    }
  };
  C.nannyResolve = function (how) {
    const a = actor("pu_nanny");
    if (how === "hostile") {
      F.nanny = "hostile";
      if (a && a.setHostile) P.safe("hostile", () => a.setHostile(true));
      return;
    }
    F.nanny = how;
    if (how === "rest") {
      if (a)
        P.safe("rest", () => {
          if (G.actors.remove) G.actors.remove(a);
        });
      standing(10, "Let Nanny rest");
    }
    if (how === "agnes" && a) {
      const to = A("dakota", "agnes_parlour");
      if (to)
        G.fadeTransition(() => {
          P.safe("move", () => {
            a.pos.set(to.x + 1.2, to.y, to.z);
            if (a.home) {
              a.home.x = to.x + 1.2;
              a.home.z = to.z;
            }
          });
        }, 0.3);
    }
    if (qActive("pu_nursery")) qSet("pu_nursery", "report");
  };
  // ---------- Plaza: suite & presidential lock ----------
  C.rent = function () {
    F.rented = true;
    if (!has("pu_key_suite")) give("pu_key_suite", 1);
  };
  P.plazaSleep = function () {
    if (!F.rented && !has("pu_key_suite")) {
      G.notify(
        "This is Suite 610. Pemberton at the front desk rents it for 40 scrip a night.",
      );
      G.sfx.play("ui_error");
      return;
    }
    try {
      if (!G.isStub("rpg") && G.rpg.sleep) {
        G.fadeTransition(() => G.rpg.sleep(8, { owned: true }), 0.6);
        return;
      }
    } catch (e) {
      G.reportError("poi_uptown:sleep", e);
    }
    G.notify("You sleep in a four-poster bed for the first time in your life.");
  };
  C.openPresidential = function (silent) {
    const g = P.plazaGate;
    if (!g || g.open) return;
    g.open = true;
    F.presOpen = true;
    g.root.visible = false;
    try {
      G.world.removeCollider(g.col);
    } catch (e) {
      /* */
    }
    if (!silent) {
      G.sfx.play("door_open");
      G.notify(
        "The Presidential Suite. Nobody has been in here since 1967 — except, apparently, a very determined moth.",
      );
    }
  };
  // ---------- Carnegie dynamo ----------
