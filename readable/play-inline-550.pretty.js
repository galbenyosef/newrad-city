/* src/quests/20_cryo.js */
/* =====================================================================
 * NEW RAD CITY — QUESTS — 20: CRYO UNIT C-9 (MQ01 "Long Winter")
 *
 * The first ten minutes. Project Long Winter (Office of Civil Defense)
 * froze its volunteers in Cryo Unit C-9, a secret sub-basement under the
 * Manhattan Municipal Building, on 20 February 1967, for a scheduled
 * 90-day trial; the city was bombed two weeks in. Every pod but the hero's
 * has failed. Nobody living is left: only CUSTODIAN, the dying facility
 * computer (teletype capitals, text only), and the logs of the Facility
 * Director, Dr. Ruth Calloway.
 *
 * Beats: thaw (frost wash, CUSTODIAN) → VIGIL goggles on the prep-room
 * cradle (Tab) → Director Calloway's office (terminal logs + desk note →
 * blast door code 0220 = Feb 20, the day they went under, G.locks.learn) → security locker (sidearm) →
 * giant roaches in the maintenance corridor (counter) → Zeke's empty pod
 * and his locker (tape reel + Liberty Key) → blast door keypad (the map
 * owns lock q_cryo_blast_door; MQ01 watches the `blastDoor` event) →
 * service stair → Chambers Street → MQ02.
 *
 * The cryo interior belongs to the map module. Every position comes from
 * G.map.getAnchor('cryo_c9', name) with fallbacks derived from
 * LAYOUT.playerStart + a free-spot search, so MQ01 stays completable
 * whatever the map provides. Steps done out of order are skipped; leaving
 * early completes MQ01 and hands over the story items.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const L = G.quests.lib;
  const Q = G.quests;
  const LOCK_ID = "q_cryo_blast_door";
  const CODE = "0220";
  const HERO = () => L.heroName().toUpperCase();
  const safeCall = (where, fn) => {
    try {
      return fn();
    } catch (e) {
      G.reportError("quests:cryo:" + where, e);
      return undefined;
    }
  };
  const mapLive = () => !G.isStub("map") && !!G.map;
  const locksLive = () => !G.isStub("locks") && !!G.locks;

  // ------------------------------------------------------------------
  // Cryo geometry (anchors from the map, else derived fallbacks)
  // ------------------------------------------------------------------
  const C = {}; // resolved spots for this session
  function cryoAnchor(name) {
    const tries = [
      () => G.map.getAnchor && G.map.getAnchor("cryo_c9", name),
      () => G.map.cryoAnchors && G.map.cryoAnchors[name],
      () => G.landmarks.getAnchor && G.landmarks.getAnchor("cryo_c9", name),
    ];
    for (const t of tries) {
      let a = null;
      try {
        a = t();
      } catch (e) {
        a = null;
      }
      if (a && isFinite(a.x) && isFinite(a.z))
        return { x: a.x, y: a.y || 0, z: a.z };
    }
    return null;
  }
  /** Yaw that turns a prop's +Z face (a terminal screen) toward t. */
  const faceTo = (p, t) => (p && t ? Math.atan2(t.x - p.x, t.z - p.z) : 0);
  function computeSpots() {
    const S = G.LAYOUT.playerStart;
    const yaw = S.yaw || 0;
    const f = { x: -Math.sin(yaw), z: -Math.cos(yaw) },
      r = { x: Math.cos(yaw), z: -Math.sin(yaw) };
    const at = (fw, rt) => ({
      x: S.x + f.x * fw + r.x * rt,
      z: S.z + f.z * fw + r.z * rt,
    });
    const y0 = S.y || 0;
    const free = (p, y, opts) =>
      L.freeSpot(
        p.x,
        p.z,
        y !== undefined ? y : y0,
        Object.assign({ maxR: 6 }, opts || {}),
      );
    const A = (name) => cryoAnchor(name);
    const door = L.cryoExitDoor();
    C.start = { x: S.x, y: y0, z: S.z };
    C.goggles = A("goggles_cradle") || A("prep_room") || free(at(3.0, 2.4));
    C.office = A("director_office");
    C.desk =
      A("director_desk") ||
      (C.office
        ? free(C.office, C.office.y)
        : free(at(9, -3), y0, { maxR: 8 }));
    C.directorTerm =
      A("director_terminal") ||
      (C.desk
        ? free(
            { x: C.desk.x + 1.2, z: C.desk.z },
            C.desk.y !== undefined ? C.desk.y : y0,
          )
        : null);
    C.directorTermYaw = faceTo(C.directorTerm, C.office || C.start);
    C.securityLocker =
      A("security_locker") ||
      A("security") ||
      free(at(6, 4.2), y0, { maxR: 8 });
    C.roach =
      A("roach_nest") ||
      A("maintenance") ||
      A("corridor") ||
      free(at(14, 0), y0, { maxR: 10 });
    C.zekePod = A("zeke_pod") || free(at(0.5, 2.4));
    C.zekeLocker =
      A("zeke_locker") || A("lockers") || free(at(2.0, -3.2), y0, { maxR: 8 });
    // Locker 7 (the hero's own): the map's anchor, else one locker along from Zeke's.
    C.locker7 =
      A("locker7") ||
      A("hero_locker") ||
      (C.zekeLocker
        ? free(
            { x: C.zekeLocker.x - r.x * 1.3, z: C.zekeLocker.z - r.z * 1.3 },
            C.zekeLocker.y,
            { maxR: 4 },
          )
        : free(at(2.0, -1.8), y0, { maxR: 8 }));
    C.custodianTerm = A("computer_terminal") || null;
    C.custodianTermYaw = faceTo(C.custodianTerm, A("computer_core") || C.start);
    C.speaker = A("custodian_speaker") || C.start;
    C.blastDoor =
      A("blast_door") || A("door_keypad") || free(at(22, 0), y0, { maxR: 8 });
    C.keypad = A("door_keypad") || C.blastDoor;
    C.stair = A("stair_bottom") || C.blastDoor;
    C.exit = door
      ? { x: door.def.pos.x, y: door.def.pos.y || 0, z: door.def.pos.z }
      : A("exit_door") || A("stair_top") || free(at(28, 0), y0, { maxR: 8 });
    C.zekeHome = C.zekePod
      ? free({ x: C.zekePod.x + 1.2, z: C.zekePod.z + 0.8 }, C.zekePod.y)
      : C.start;
    C.locker = C.zekeLocker; // other files place things beside Zeke's locker
    return C;
  }

  // ------------------------------------------------------------------
  // CUSTODIAN (the facility computer): teletype lines, text only
  // ------------------------------------------------------------------
  function custodian(line, dur) {
    L.notify(line, {
      sub: "CUSTODIAN",
      speaker: "CUSTODIAN",
      teletype: true,
      duration: dur || 5.5,
    });
    L.sfx("teletype_print", { volume: 0.35 });
  }

  // ------------------------------------------------------------------
  // MQ01 definition
  // ------------------------------------------------------------------
  const ORDER = [
    "wake",
    "director",
    "locker7",
    "armory",
    "roaches",
    "zeke",
    "door",
    "leave",
  ];
  const ROACH_IDS = ["cryo_roach_1", "cryo_roach_2", "cryo_roach_3"];
  function roachesLeft() {
    return ROACH_IDS.filter((id) => !L.flag("dead_" + id)).length;
  }
  function pistolId() {
    return L.item("winter_service_pistol", "pistol_10mm");
  }
  function codeKnown() {
    return !!L.flag("cryo_code_known");
  }
  function blastOpen() {
    if (L.flag("cryo_blast_open")) return true;
    if (mapLive() && typeof G.map.isBlastDoorOpen === "function")
      return !!safeCall("isBlastDoorOpen", () => G.map.isBlastDoorOpen());
    return false;
  }
  /** Has the player already done what a stage asks (so the stage can be skipped)? */
  function met(stageId) {
    switch (stageId) {
      case "wake":
        return !!L.flag("got_goggles");
      case "director":
        return !!L.flag("cryo_logs_read");
      case "locker7":
        return !!L.flag("ms_locker7_opened");
      case "armory":
        return !!L.flag("got_service_pistol") || !pistolId();
      case "roaches":
        return roachesLeft() === 0 || !!L.flag("cryo_roaches_skipped");
      case "zeke":
        return !!L.flag("zeke_locker_looted");
      case "door":
        return blastOpen();
      default:
        return false;
    }
  }
  function firstUnmet(from) {
    for (let i = Math.max(0, from); i < ORDER.length; i++)
      if (!met(ORDER[i])) return ORDER[i];
    return "leave";
  }
  /** Move MQ01 on to the first stage the player has not already done. */
  function advance() {
    if (!Q.isActive("mq01")) return;
    const cur = Q.stage("mq01"),
      ci = ORDER.indexOf(cur);
    if (ci < 0 || !met(cur)) return;
    const next = firstUnmet(ci + 1);
    if (next !== cur) Q.setStage("mq01", next);
  }

  L.hook("init", function () {
    L.quest({
      id: "mq01",
      main: true,
      category: "main",
      order: 1,
      act: 1,
      actLabel: "Act I: Thaw",
      name: "Long Winter",
      giver: "CUSTODIAN",
      location: "Cryo Unit C-9",
      desc: () =>
        "Project Long Winter froze " +
        L.heroName() +
        " in Cryo Unit C-9, under the Manhattan Municipal Building, on February 20, 1967, for a ninety-day trial. Two weeks later the bombs fell. " +
        "The pod has opened at last. The calendar on the wall says 1989. Every other pod is dark, and nobody has come to say why. " +
        "Somewhere up there, twenty-two years ago, Nicole Mead was keeping a light on for you.",
      stages: [
        {
          id: "wake",
          text: "Find your VIGIL goggles on the charging cradle in the prep room.",
          markers: () =>
            C.goggles
              ? [
                  {
                    x: C.goggles.x,
                    z: C.goggles.z,
                    y: C.goggles.y,
                    label: "VIGIL Goggles",
                  },
                ]
              : [],
          onEnter() {
            if (G.isStub("items"))
              L.later(1, () => {
                L.giveGoggles(true);
                advance();
              });
          },
        },
        {
          id: "director",
          text: () =>
            "Find out what happened: read Director Calloway's logs in her office.",
          markers: () => {
            const m = [];
            if (C.directorTerm)
              m.push({
                x: C.directorTerm.x,
                z: C.directorTerm.z,
                y: C.directorTerm.y,
                label: "Director's Terminal",
              });
            if (
              C.desk &&
              !L.has("q_note_director_memo") &&
              !L.flag("got_cryo_desk_note")
            )
              m.push({
                x: C.desk.x,
                z: C.desk.z,
                y: C.desk.y,
                label: "Director's Desk",
              });
            return m;
          },
          onEnter() {
            L.later(1.5, () =>
              custodian(
                "DIRECTOR CALLOWAY IS NOT IN HER OFFICE. DIRECTOR CALLOWAY HAS NOT BEEN IN HER OFFICE FOR TEN DAYS. THIS HAS BEEN LOGGED.",
              ),
            );
            if (!C.directorTerm && !C.desk)
              L.later(2, () => {
                readLogs("the Director's office");
              });
          },
        },
        {
          id: "locker7",
          text: "Open your locker, number 7: Nicole's photo strip, her letters, the ring box.",
          markers: () =>
            C.locker7
              ? [
                  {
                    x: C.locker7.x,
                    z: C.locker7.z,
                    y: C.locker7.y,
                    label: "Locker 7",
                  },
                ]
              : [],
          onEnter() {
            L.later(1.2, () =>
              custodian(
                "PERSONAL EFFECTS, POD 7, ARE IN LOCKER 7. THEY HAVE BEEN KEPT AT A CONSTANT TEMPERATURE. THIS UNIT IS PROUD OF THAT.",
              ),
            );
          },
        },
        {
          id: "armory",
          text: "Take the sidearm from the security locker.",
          markers: () =>
            C.securityLocker
              ? [
                  {
                    x: C.securityLocker.x,
                    z: C.securityLocker.z,
                    y: C.securityLocker.y,
                    label: "Security Locker",
                  },
                ]
              : [],
          onEnter() {
            L.later(1.2, () =>
              custodian(
                "PEST INCURSION, MAINTENANCE CORRIDOR. PEST CONTROL STAFF ON DUTY: 0. SECURITY LOCKER: UNLOCKED. PLEASE ASSIST.",
              ),
            );
            if (!pistolId()) L.later(0.5, advance);
          },
        },
        {
          id: "roaches",
          text: () =>
            "Clear the giant roaches out of the maintenance corridor (" +
            (3 - roachesLeft()) +
            "/3).",
          markers: () =>
            C.roach
              ? [
                  {
                    x: C.roach.x,
                    z: C.roach.z,
                    y: C.roach.y,
                    label: "Giant Roaches",
                  },
                ]
              : [],
          onEnter() {
            spawnRoaches();
            L.hint(
              "fire",
              (!G.isStub("weapons") &&
              G.weapons.isHolstered &&
              !G.weapons.isHolstered()
                ? ""
                : "Draw your weapon with [H]. ") +
                "[Left Mouse] fires, [Right Mouse] aims, [R] reloads.",
              0.5,
            );
            if (G.isStub("actors"))
              L.later(1, () => {
                L.setFlag("cryo_roaches_skipped");
                advance();
              });
          },
        },
        {
          id: "zeke",
          text: "Find out what became of Zeke Marlow: check his pod and his locker.",
          markers: () => {
            const m = [];
            if (C.zekeLocker)
              m.push({
                x: C.zekeLocker.x,
                z: C.zekeLocker.z,
                y: C.zekeLocker.y,
                label: "Zeke's Locker",
              });
            if (C.zekePod && !L.flag("cryo_zeke_pod_seen"))
              m.push({
                x: C.zekePod.x,
                z: C.zekePod.z,
                y: C.zekePod.y,
                label: "Zeke's Pod",
              });
            return m;
          },
          onEnter() {
            L.later(1.0, () =>
              custodian(
                "POD 9, MARLOW: DISCHARGED ON A THAW FAULT TWENTY-ONE DAYS AGO. OCCUPANT LEFT A PERSONAL ITEM IN LOCKER 9 AND AN UNAUTHORIZED SANDWICH IN THE INFIRMARY.",
              ),
            );
            L.hint(
              "notes",
              "Notes and tape reels are kept in your goggles: [Tab] → NOTES.",
              3,
            );
          },
        },
        {
          id: "door",
          text: () =>
            codeKnown()
              ? "Enter Director Calloway's code on the blast door keypad."
              : "Find the blast door code and open the door.",
          markers: () =>
            C.keypad
              ? [
                  {
                    x: C.keypad.x,
                    z: C.keypad.z,
                    y: C.keypad.y,
                    label: "Blast Door Keypad",
                  },
                ]
              : [],
          onEnter() {
            L.hint(
              "keypad",
              "Walk up to the keypad and press [E]. Codes you find are logged in your goggles under NOTES → CODES.",
              1.5,
            );
            if (!codeKnown() && !L.flag("cryo_logs_read"))
              L.later(2, () =>
                custodian(
                  "THE BLAST DOOR CODE IS HELD BY THE FACILITY DIRECTOR. THE FACILITY DIRECTOR IS NOT AVAILABLE. HAVE YOU TRIED HER DESK.",
                ),
              );
          },
        },
        {
          id: "leave",
          text: "Climb the service stair, go up through the Municipal Building and out onto Chambers Street.",
          markers: () => {
            const p = G.player.pos,
              o =
                G.LAYOUT.INTERIORS.cryo_c9 && G.LAYOUT.INTERIORS.cryo_c9.origin;
            const inCell =
              o && Math.abs(p.x - o.x) < 200 && Math.abs(p.z - o.z) < 200;
            if (inCell && C.exit)
              return [
                {
                  x: C.exit.x,
                  z: C.exit.z,
                  y: C.exit.y,
                  label: "Service Stair",
                },
              ];
            const X = G.LAYOUT.cryoExit;
            return X ? [{ x: X.x, z: X.z, label: "Chambers Street" }] : [];
          },
          onEnter() {
            L.later(0.8, () =>
              custodian(
                "BLAST DOOR OPEN. PLEASE CLOSE IT BEHIND YOU. GOODBYE, POD 7. IT WAS PLEASANT TO HAVE SOMEONE TO TALK TO.",
                6.5,
              ),
            );
          },
        },
        {
          id: "ring",
          text: "(Optional) Take the ring.",
          sideObjective: true,
          optional: true,
          showIf: () => !!L.flag("ms_locker7_opened"),
          doneIf: () => !!L.flag("ms_has_ring"),
          markers: () =>
            C.locker7
              ? [
                  {
                    x: C.locker7.x,
                    z: C.locker7.z,
                    y: C.locker7.y,
                    label: "Locker 7",
                  },
                ]
              : [],
        },
        {
          id: "candles",
          text: "(Optional) Look at what is on the step outside the service door.",
          sideObjective: true,
          optional: true,
          showIf: () =>
            (Q.stage("mq01") === "door" || Q.stage("mq01") === "leave") &&
            !!C.exit,
          doneIf: () => !!L.flag("ms_candles_seen"),
          markers: () =>
            C.exit
              ? [
                  {
                    x: C.exit.x,
                    z: C.exit.z,
                    y: C.exit.y,
                    label: "Service door",
                  },
                ]
              : [],
        },
        {
          id: "custodian",
          text: "(Optional) Query CUSTODIAN at the computer core terminal.",
          sideObjective: true,
          optional: true,
          showIf: () => !!C.custodianTerm && !!L.flag("got_goggles"),
          doneIf: () => !!L.flag("cryo_custodian_talked"),
          markers: () =>
            C.custodianTerm
              ? [
                  {
                    x: C.custodianTerm.x,
                    z: C.custodianTerm.z,
                    y: C.custodianTerm.y,
                    label: "CUSTODIAN",
                  },
                ]
              : [],
        },
      ],
      rewards: { xp: 100 },
      onComplete() {
        L.later(
          4.5,
          () => {
            if (!Q.isStarted("mq02")) Q.start("mq02");
          },
          "chain",
        );
      },
    });
  });

  // ------------------------------------------------------------------
  // Scripted beats
  // ------------------------------------------------------------------
  function spawnRoaches() {
    if (!C.roach || G.isStub("actors") || !Q.isActive("mq01")) return;
    ROACH_IDS.forEach((id, i) => {
      if (L.flag("dead_" + id)) return;
      const a = (i / 3) * Math.PI * 2;
      L.spawnNPC({
        id,
        type: "giant_roach",
        name: "Giant Roach",
        faction: "creatures",
        level: 1,
        hostile: true,
        ai: "wander",
        noRespawn: true,
        hp: 12,
        damage: 2,
        at: {
          fallback: {
            x: C.roach.x + Math.cos(a) * 1.6,
            z: C.roach.z + Math.sin(a) * 1.6,
            y: C.roach.y,
          },
          maxR: 5,
        },
        home: { x: C.roach.x, z: C.roach.z, r: 5 },
      });
    });
  }
  // Walking into the maintenance corridor early wakes the roaches too.
  L.trigger({
    id: "cryo_roach_nest",
    r: 12,
    pos: () => C.roach || null,
    cond: () => Q.isActive("mq01") && roachesLeft() > 0 && L.inInterior(),
    fire: spawnRoaches,
  });

  function onRoachKilled(actor) {
    if (!actor || ROACH_IDS.indexOf(actor.id) < 0) return;
    L.setFlag("dead_" + actor.id);
    if (roachesLeft() === 0) {
      L.xp(15, "Pest control");
      advance();
    } else if (Q.stage("mq01") === "roaches") L.refresh("mq01");
  }

  /** The blast door code reached the player (terminal entry or desk note). */
  function learnCode(source) {
    if (locksLive() && G.locks.learn)
      safeCall("learn", () =>
        G.locks.learn(LOCK_ID, source || "Director Calloway"),
      );
    if (!L.flag("cryo_code_known")) {
      L.setFlag("cryo_code_known");
      L.hint(
        "codes",
        "Codes you find are logged in your goggles under NOTES → CODES.",
        1,
      );
    }
  }
  function readLogs(source) {
    learnCode(source);
    if (!L.flag("cryo_logs_read")) {
      L.setFlag("cryo_logs_read");
      L.xp(10, "Director Calloway's logs");
    }
    advance();
  }

  /** The blast door has opened (keypad, cheat, map, or the fallback keypad). */
  function onBlastOpen() {
    if (L.flag("cryo_blast_open")) {
      advance();
      return;
    }
    L.setFlag("cryo_blast_open");
    if (!(mapLive() && typeof G.map.openBlastDoor === "function")) {
      L.sfx("cryo_alarm", { volume: 0.5 });
      L.later(0.5, () => L.sfx("cryo_door"));
    }
    L.notify(
      "The blast door rolls aside on its track. Cold air comes down the service stair, smelling of rain and rust.",
    );
    if (G.player && G.player.shake) G.player.shake(0.25, 1.6);
    G.events.emit("blastDoorOpened");
    advance();
  }
  /** Fallback keypad (only while the map has no blast door of its own). */
  function useFallbackKeypad() {
    if (blastOpen()) {
      L.notify("The blast door is already open.");
      return;
    }
    const spec = {
      id: LOCK_ID,
      label: "C-9 Blast Door",
      code: CODE,
      kind: "door",
      hint: "Director Calloway's terminal and desk note",
    };
    if (locksLive() && G.locks.open) {
      safeCall("locks.open", () => G.locks.open(spec, () => onBlastOpen()));
      return;
    }
    if (codeKnown()) {
      L.sfx("keypad_accept");
      onBlastOpen();
    } else {
      L.notify("The keypad wants a four-digit code.");
      L.sfx("keypad_deny");
    }
  }
  L.cryo = { spots: C, openBlastDoor: onBlastOpen, custodian, learnCode };

  // ------------------------------------------------------------------
  // Terminals
  // ------------------------------------------------------------------
  const LOGS = [
    {
      title: "LOG 1967-02-20 — Seal Day",
      text:
        "Forty volunteers under by 2200 hours. Forty pods green. The volunteers were very brave and very polite and asked a great many " +
        "questions about the coffee. I told them there would be coffee when they woke. I believe that is the first thing I have lied about in this job.\n\n" +
        'Ninety-day trial. Scheduled thaw: 21 May. Snow on the steps of the Municipal Building when the staff came in tonight. CUSTODIAN performing within tolerances. It has started calling me "Director" ' +
        'instead of "Doctor." I have not corrected it.',
    },
    {
      title: "LOG 1967-03-05 — The Teletype",
      text:
        "Priority traffic since dawn from the Office of Civil Defense: bombers inbound. Not over the Pole, where every " +
        "drill for twenty years said they would come. From the east. From Europe. The last line on the tape before it ran out said the city had " +
        "been hit to the north — the Bronx line, Yonkers. Then the line went dead.\n\nThe building shook once, at 9:47 on a Sunday morning, day fourteen of ninety. The pods " +
        "did not notice. I envy them.",
    },
    {
      title: "LOG 1968-03-02 — Silence",
      text:
        "Washington has been silent since March. Albany is silent. Our relay to Liberty Island answers with a carrier tone and " +
        "nothing else. Staff vote: we hold. The volunteers signed up to sleep through the worst of it. This is the worst of it.\n\nWe are going into " +
        "the staff pods on a rotation. CUSTODIAN will wake one of us if anything fails.",
    },
    {
      title: "LOG 1974-08-19 — Pod 3",
      text:
        "Pod 3 failed during my thaw. Coolant seal. There was nothing to be done and I did it anyway for six hours.\n\n" +
        'CUSTODIAN has asked whether it should "reallocate Pod 3\'s power budget." I said yes. I am going to say yes to that question a great many times, ' +
        "I think.",
    },
    {
      title: "LOG 1975-02-20 — The Service Door",
      text:
        "Someone leaves a candle at the service door every twentieth of February. Protocol forbids me to open it.\n\n" +
        "I have the periscope on the outer step. This year I timed it: just after three in the morning, a coat, a hood, a lantern. Three knocks. A long wait. Then the candle, and the footsteps going away. " +
        "Eight years now. I have stopped telling CUSTODIAN to log it. It logs it anyway.\n\nThe twentieth of February. The day we went under. Whoever it is, they are not knocking for me.",
    },
    {
      title: "LOG 1981-01-06 — Roll Call",
      text:
        "Pods 11, 14, 20, 21 and 30 since my last thaw. I read their names into the log because nobody else will.\n\n" +
        "Twelve pods green. The staff pods are down to mine. Dr. Okafor did not wake in July. I have stopped scheduling thaw drills; there is no " +
        "one left to drill.",
    },
    {
      title: "LOG 1988-11-30 — The Continuity",
      text:
        "The Liberty relay woke up tonight and printed a teletype on the old federal header:\n\n" +
        '"ALL FEDERAL INSTALLATIONS. THE CONTINUITY OF GOVERNMENT IS PRESERVED. ACTING PRESIDENT MARSH ADDRESSES THE NATION AT 1900. ALL ' +
        'CIVIL DEFENSE ASSETS, PERSONNEL AND SLEEPERS ARE TO REPORT TO LIBERTY STATION. NAMES ARE BEING READ. DATE: MARCH 7, 1967."\n\n' +
        "It is not March 1967. Somebody out there believes it is. I have not answered.",
    },
    {
      title: "LOG 1989 — Pod 9, Marlow",
      text:
        "Pod 9 thawed early on a fault, three weeks ago tonight. Zeke Marlow, our maintenance engineer — the man who " +
        "wired half of this place and the Knickerbocker Array besides. He came out of the pod swearing and asked for coffee. There is no coffee.\n\n" +
        "He sits by Pod 7 every night. He says the radio up top is reading names, and one of them is his. He says they want the Array. I told him " +
        "not to answer. He says he never answers anything. That is the first thing he has lied to me about.",
    },
    {
      title: "LOG 1989 — Final Entry",
      learn: LOCK_ID,
      action: () => {
        readLogs("Director Calloway's terminal");
      },
      text: () =>
        "Zeke has gone up. I am going after him, and then I am going to find whoever is reading names on that radio and ask them, as a " +
        "federal employee, what in God's name they think they are doing.\n\nPod 7 is the last green pod. CUSTODIAN says it will open on its own " +
        "schedule. If you are the one reading this, " +
        L.heroName() +
        ": I am sorry about the coffee.\n\nThe blast door keypad takes " +
        CODE +
        " — the day we went under. The service stair comes out behind the Municipal Building. Take the sidearm from security. Do not trust the radio.\n\n" +
        "— Dr. Ruth Calloway, Facility Director, Cryo Unit C-9",
    },
  ];
  const directorTerm = {
    title: "CRYO UNIT C-9 — FACILITY DIRECTOR",
    header:
      "OFFICE OF CIVIL DEFENSE — PROJECT LONG WINTER\nCRYO UNIT C-9 / DIRECTOR R. CALLOWAY\n>> PERSONAL LOG. DO NOT REMOVE FROM PREMISES.",
    entries: [
      {
        title: "Facility Status",
        text: () =>
          "PODS INSTALLED: 40\nPODS GREEN: " +
          (Q.isComplete("mq01") || L.flag("got_goggles")
            ? "0 (POD 7 DISCHARGED)"
            : "1 (POD 7)") +
          "\nSTAFF ON DUTY: 0\nBLAST DOOR: " +
          (blastOpen() ? "OPEN" : "SEALED") +
          "\nCOFFEE: NONE",
      },
    ].concat(LOGS),
  };
  const custodianTerm = {
    title: "CUSTODIAN — FACILITY COMPUTER",
    header:
      "CUSTODIAN MAINFRAME — CRYO UNIT C-9\nCORE TEMPERATURE: HIGH. MEMORY: 61% (DEGRADING)\n>> GOOD MORNING. IT IS MORNING. PROBABLY.",
    entries: [
      {
        title: "QUERY: STATUS",
        action: () => {
          L.setFlag("cryo_custodian_talked");
        },
        text:
          "ALL SYSTEMS NOMINAL.\n\nCORRECTION: COOLING LOOP B NOMINAL. COOLING LOOP A NOT FOUND. POWER: 14% OF RATED. PEST CONTROL: SEE MAINTENANCE " +
          "CORRIDOR. HUMAN STAFF: 0.\n\nCORRECTION: ALL SYSTEMS ACCEPTABLE.",
      },
      {
        title: "QUERY: ROLL CALL",
        action: () => {
          L.setFlag("cryo_custodian_talked");
        },
        text: () =>
          "POD 7 ....... " +
          HERO() +
          " ....... DISCHARGED (THAW COMPLETE)\nPOD 9 ....... MARLOW, E. Z. ....... DISCHARGED (FAULT) 21 DAYS AGO\n" +
          "PODS 1-6, 8, 10-40 ....... FAILED. NAMES ON FILE. NAMES WILL BE READ ON REQUEST.\n\nDIRECTOR CALLOWAY ....... LEFT PREMISES 10 DAYS AGO. " +
          "DID NOT SIGN OUT. THIS HAS BEEN LOGGED.",
      },
      {
        title: "QUERY: THE DATE",
        action: () => {
          L.setFlag("cryo_custodian_talked");
        },
        text:
          "CALENDAR: 1989.\n\nTHIS UNIT WAS SEALED 20 FEBRUARY 1967. ELAPSED: 22 YEARS. THE PROGRAM SPECIFIED 90 DAYS.\n\nTHIS UNIT APOLOGIZES FOR THE OVERRUN. " +
          "THIS UNIT HAS FILED A REPORT. THERE IS NO ONE TO RECEIVE THE REPORT. THE REPORT HAS BEEN FILED ANYWAY.",
      },
      {
        title: "QUERY: WHAT HAPPENED",
        action: () => {
          L.setFlag("cryo_custodian_talked");
        },
        text:
          "MARCH 5, 1967, 09:47. ONE SEISMIC EVENT, NORTH. TELETYPE TRAFFIC CEASED 09:49.\n\nTHE EXTERNAL WORLD IS OUTSIDE THIS " +
          "UNIT'S AREA OF RESPONSIBILITY. THIS UNIT IS RESPONSIBLE FOR YOU. PLEASE TAKE A SIDEARM AND A COAT.",
      },
      {
        title: "QUERY: GOODBYE",
        cond: () => blastOpen(),
        action: () => {
          L.setFlag("cryo_custodian_talked");
        },
        text: "GOODBYE, POD 7.\n\nIF YOU FIND THE DIRECTOR, PLEASE TELL HER THAT THIS UNIT KEPT THE LIGHTS ON.",
      },
    ],
  };

  L.hook("register", function () {
    L.terminal("cryo_director", directorTerm);
    L.terminal("cryo_custodian", custodianTerm);
  });

  L.hook("world", function () {
    computeSpots();
    if (C.directorTerm)
      safeCall("term", () =>
        L.spawnTerminal("cryo_director", C.directorTerm, C.directorTermYaw),
      );
    if (C.custodianTerm)
      safeCall("term", () =>
        L.spawnTerminal("cryo_custodian", C.custodianTerm, C.custodianTermYaw),
      );
    // The keypad's lock belongs to the map; tell the lock audit where its code can be learned.
    if (locksLive() && G.locks.learnableFrom)
      safeCall("learnableFrom", () =>
        G.locks.learnableFrom(
          LOCK_ID,
          "Director Calloway's terminal + desk note (Cryo Unit C-9)",
        ),
      );
    // No blast door from the map (yet): a keypad stand-in so MQ01 can still be finished.
    const mapDoor = mapLive() && typeof G.map.openBlastDoor === "function";
    if (!mapDoor && C.keypad && G.world.addInteractable) {
      if (locksLive() && G.locks.register)
        safeCall("register", () =>
          G.locks.register({
            id: LOCK_ID,
            label: "C-9 Blast Door",
            code: CODE,
            kind: "door",
            hint: "Director Calloway's terminal and desk note",
          }),
        );
      G.world.addInteractable({
        pos: L.V3(C.keypad.x, (C.keypad.y || 0) + 1.3, C.keypad.z),
        radius: 0.8,
        label: "Blast Door Keypad",
        verb: "Use",
        onInteract: useFallbackKeypad,
      });
    }
    // No street door at the top of the service stair (yet): a stand-in stair that walks out to the street.
    if (
      !L.cryoExitDoor() &&
      C.exit &&
      G.LAYOUT.cryoExit &&
      G.world.addInteractable
    ) {
      G.world.addInteractable({
        pos: L.V3(C.exit.x, (C.exit.y || 0) + 1.2, C.exit.z),
        radius: 1.0,
        label: "Service Stair",
        verb: "Climb",
        onInteract() {
          if (!blastOpen()) {
            L.notify("The blast door is shut.");
            return;
          }
          const X = G.LAYOUT.cryoExit;
          L.travel(X.x, X.y || 0, X.z, X.yaw || 0);
        },
      });
    }
  });

  // ------------------------------------------------------------------
  // World objects (spawned on newGame and after loading)
  // ------------------------------------------------------------------
  let spawnGen = -1;
  L.hook("spawn", function () {
    computeSpots();
    if (
      Q.isActive("mq01") &&
      (Q.stage("mq01") === "roaches" || L.flag("trig_cryo_roach_nest"))
    )
      spawnRoaches();
    // Story doors: once open, open (the map / locks modules save their own state; this re-asserts it).
    if (L.flag("cryo_blast_open") || Q.isComplete("mq01")) {
      if (locksLive() && G.locks.unlock)
        safeCall("unlock", () => G.locks.unlock(LOCK_ID));
      if (
        mapLive() &&
        typeof G.map.openBlastDoor === "function" &&
        !(G.map.isBlastDoorOpen && G.map.isBlastDoorOpen())
      )
        safeCall("openBlastDoor", () =>
          G.map.openBlastDoor(true, { sound: false }),
        );
    }
    if (spawnGen === L.gen) return;
    spawnGen = L.gen; // session-local guard: props and pickups are placed once per new game / load
    // The goggles on their charging cradle.
    if (!L.flag("got_goggles") && C.goggles)
      L.pickup("cryo_goggles", L.gogglesId(), 1, {
        x: C.goggles.x,
        y: C.goggles.y,
        z: C.goggles.z,
      });
    // Director Calloway's desk note (the code).
    if (C.desk && !L.has("q_note_director_memo"))
      L.pickup("cryo_desk_note", "q_note_director_memo", 1, {
        x: C.desk.x,
        y: C.desk.y,
        z: C.desk.z,
      });
    // Security locker: the sidearm and its ammunition.
    if (!L.flag("got_service_pistol") && C.securityLocker) {
      const pistol = pistolId(),
        ammo = L.item("ammo_10mm");
      const items = [];
      if (pistol) items.push([pistol, 1]);
      if (ammo) items.push([ammo, 36]);
      const h = items.length
        ? L.dyn(
            L.prop("locker", {
              x: C.securityLocker.x,
              y: C.securityLocker.y,
              z: C.securityLocker.z,
              yaw: faceTo(C.securityLocker, C.start),
              items,
              name: "Security Locker",
              owner: null,
              id: "q_cryo_security_locker",
              persistent: false,
              noSave: false,
            }),
          )
        : null;
      if (pistol && (!h || (!h.container && !h.interactable))) {
        L.pickup("cryo_pistol", pistol, 1, {
          x: C.securityLocker.x,
          y: (C.securityLocker.y || 0) + 0.9,
          z: C.securityLocker.z,
        });
        if (ammo)
          L.pickup("cryo_ammo", ammo, 36, {
            x: C.securityLocker.x + 0.3,
            y: (C.securityLocker.y || 0) + 0.9,
            z: C.securityLocker.z,
          });
      }
    }
    // Locker 7: the hero's own effects (Nicole's photo strip and letters; the ring box is his choice).
    if (!L.flag("ms_locker7_emptied") && C.locker7) {
      const items = [];
      if (!L.has("ms_note_photo_strip") && !L.flag("ms_photo_taken"))
        items.push(["ms_note_photo_strip", 1]);
      if (!L.has("ms_note_nicole_letters"))
        items.push(["ms_note_nicole_letters", 1]);
      if (!L.flag("ms_has_ring")) items.push(["ms_grandmother_ring", 1]);
      if (items.length) {
        const h = L.dyn(
          L.prop("locker", {
            x: C.locker7.x,
            y: C.locker7.y,
            z: C.locker7.z,
            yaw: faceTo(C.locker7, C.start),
            items,
            name: "Locker 7 (yours)",
            owner: null,
            id: "q_locker7",
            persistent: false,
            noSave: false,
          }),
        );
        if (!h || (!h.container && !h.interactable)) {
          L.pickup("locker7_photo", "ms_note_photo_strip", 1, {
            x: C.locker7.x,
            y: (C.locker7.y || 0) + 0.9,
            z: C.locker7.z,
          });
          L.pickup("locker7_letters", "ms_note_nicole_letters", 1, {
            x: C.locker7.x + 0.3,
            y: (C.locker7.y || 0) + 0.9,
            z: C.locker7.z,
          });
          L.pickup("locker7_ring", "ms_grandmother_ring", 1, {
            x: C.locker7.x - 0.3,
            y: (C.locker7.y || 0) + 0.9,
            z: C.locker7.z,
          });
        }
      }
    }
    // The service door: twenty-two candle stubs on the outer step, seen through the wired-glass panel.
    if (C.exit && G.world.addInteractable) {
      const it = G.world.addInteractable({
        pos: L.V3(C.exit.x, (C.exit.y || 0) + 1.3, C.exit.z),
        radius: 1.2,
        label: "Service door (glass panel)",
        verb: "Look through",
        onInteract() {
          L.notify(
            "Through the wired glass you can see the outer step. Twenty-two candle stubs stand in a row along it, melted into each other like a little staircase of wax, oldest at the bottom. The newest is barely burned down. It cannot be more than a few weeks old.",
            { duration: 9 },
          );
          if (!L.flag("ms_candles_seen")) {
            L.setFlag("ms_candles_seen");
            L.xp(10, "Twenty-two candles");
          }
        },
      });
      L.dyn({ interactable: it });
    }
    // Zeke's locker: the tape reel and the Liberty Key.
    if (!L.flag("zeke_locker_looted") && C.zekeLocker) {
      const items = [
        ["q_reel_zeke", 1],
        ["q_liberty_key", 1],
      ];
      const stim = L.item("rally_tonic");
      if (stim) items.push([stim, 1]);
      const h = L.dyn(
        L.prop("locker", {
          x: C.zekeLocker.x,
          y: C.zekeLocker.y,
          z: C.zekeLocker.z,
          yaw: faceTo(C.zekeLocker, C.start),
          items,
          name: "Zeke's Locker (9)",
          owner: null,
          // stable id → rpg restores a half-emptied locker from the save instead of re-rolling it
          id: "q_zeke_locker",
          persistent: false,
          noSave: false,
        }),
      );
      if (!h || (!h.container && !h.interactable)) {
        L.pickup("zeke_reel", "q_reel_zeke", 1, {
          x: C.zekeLocker.x,
          y: (C.zekeLocker.y || 0) + 0.9,
          z: C.zekeLocker.z,
        });
        L.pickup("liberty_key", "q_liberty_key", 1, {
          x: C.zekeLocker.x + 0.35,
          y: (C.zekeLocker.y || 0) + 0.9,
          z: C.zekeLocker.z,
        });
      }
    }
    // Zeke's empty pod (examine).
    if (C.zekePod && G.world.addInteractable) {
      const it = G.world.addInteractable({
        pos: L.V3(C.zekePod.x, (C.zekePod.y || 0) + 1.2, C.zekePod.z),
        radius: 0.9,
        label: "Pod 9 (Marlow)",
        verb: "Examine",
        onInteract() {
          L.notify(
            'POD 9 — MARLOW, E. Z. — THAW FAULT — OCCUPANT DISCHARGED. The glass is propped open with a wrench. A Coney Island postcard is taped inside the lid: "Back soon. Don\'t touch my tools."',
            { duration: 7 },
          );
          if (!L.flag("cryo_zeke_pod_seen")) {
            L.setFlag("cryo_zeke_pod_seen");
            L.xp(5, "Pod 9");
          }
        },
      });
      L.dyn({ interactable: it });
    }
  });

  // ------------------------------------------------------------------
  // New game: the thaw
  // ------------------------------------------------------------------
  L.hook("newGame", function (opts) {
    opts = opts || {};
    if (opts.cheatSkipStart) {
      // Straight to the street: write MQ01 as already finished (no "QUEST ADDED" /
      // "COMPLETED" banners for a quest the player never saw) and hand over MQ02 at
      // once, so the tracker has an objective from the very first frame.
      L.setFlag("left_cryo");
      L.setFlag("cryo_blast_open");
      L.setFlag("cryo_code_known");
      if (locksLive() && G.locks.unlock)
        safeCall("unlock", () => G.locks.unlock(LOCK_ID));
      catchUpGear(true);
      L.completeSilently("mq01", ORDER);
      Q.start("mq02");
      return;
    }
    Q.start("mq01");
    // test modes (smoke / shot / survey) and skipIntro starts: no wake-up wash, no timed lines
    if (opts.skipIntro || G.SMOKE || G.SHOT || G.SURVEY) return;
    // Waking up: frost on the eyes, fading.
    L.overlay("#eef6ff", 0, 1.4, 4.2, 1);
    L.later(1.6, () =>
      custodian(
        "THAW CYCLE COMPLETE. POD 7 OCCUPANT: VITAL SIGNS ACCEPTABLE. GOOD MORNING, " +
          HERO() +
          ".",
      ),
    );
    L.later(7.4, () =>
      custodian(
        "THE DATE IS— [CALENDAR FAULT]. PLEASE COLLECT YOUR VIGIL GOGGLES FROM THE PREP ROOM CRADLE. THEY WILL EXPLAIN. THIS UNIT CANNOT.",
        6.5,
      ),
    );
    L.later(4.6, () =>
      L.hint(
        "move",
        "[W][A][S][D] move · [Mouse] look · [E] use · [Space] jump · [Shift] sprint",
      ),
    );
    L.later(5.5, () => {
      if (!G.isStub("music") && G.music.setMood)
        try {
          G.music.setMood("cryo");
        } catch (e) {
          /* */
        }
    });
  });

  /** Core cheat "skip the start" (and newGame {cheatSkipStart}): jump MQ01 to its end. */
  function skipStart() {
    if (L.flag("left_cryo")) return;
    L.setFlag("left_cryo");
    L.setFlag("cryo_blast_open");
    L.setFlag("cryo_code_known");
    if (locksLive() && G.locks.unlock)
      safeCall("unlock", () => G.locks.unlock(LOCK_ID));
    catchUpGear(true);
    if (Q.isActive("mq01")) {
      // Fill the log with the skipped steps so the completed quest reads properly.
      const s = L.STATE.get("mq01");
      if (s) {
        s.log = ORDER.slice();
        s.stage = "leave";
      }
      Q.complete("mq01");
    }
    // No 4.5 s gap with an empty tracker: the next objective is handed over now.
    if (!Q.isStarted("mq02")) Q.start("mq02");
  }
  L.hook("loaded", function () {
    if (Q.isComplete("mq01") || L.flag("left_cryo")) L.setFlag("got_goggles");
    // A save from before this quest was rewritten: move it onto the first step not yet done.
    if (Q.isActive("mq01") && ORDER.indexOf(Q.stage("mq01")) < 0) {
      const s = L.STATE.get("mq01"),
        next = firstUnmet(0);
      if (s) {
        s.stage = next;
        s.log = ORDER.slice(0, ORDER.indexOf(next) + 1);
      }
    }
  });
  G.events.on("cheatSkipStart", () => {
    safeCall("skipStart", skipStart);
  });

  // ------------------------------------------------------------------
  // Progress detection
  // ------------------------------------------------------------------
  G.events.on("actorKilled", (a) => {
    safeCall("roach", () => onRoachKilled(a));
  });
  G.events.on("itemAdded", (id) => {
    safeCall("itemAdded", () => {
      if (
        (id === "vigil_goggles" || id === "q_vigil_goggles") &&
        !L.flag("got_goggles")
      ) {
        L.giveGoggles(true);
        L.sfx("goggles_open");
        L.later(0.6, () =>
          L.notify("VIGIL goggles acquired.", {
            sub: "Press [Tab] to open them.",
            icon: "goggles",
          }),
        );
        L.hint(
          "goggles",
          "Press [Tab] to open your VIGIL goggles: status, items, quests, map, notes and radio.",
          2.5,
        );
        advance();
        return;
      }
      if (id === "q_note_director_memo") {
        readLogs("Director Calloway's desk note");
        return;
      }
      if (id === "ms_note_photo_strip" || id === "ms_note_nicole_letters") {
        if (id === "ms_note_photo_strip") L.setFlag("ms_photo_taken");
        if (!L.flag("ms_locker7_opened")) {
          L.setFlag("ms_locker7_opened");
          L.xp(10, "Locker 7");
          L.later(1, () =>
            L.notify(
              "Nicole. The photo strip from New Year's, her letters in green ink. Twenty-two years ago this was last week.",
              { duration: 6 },
            ),
          );
        }
        advance();
        return;
      }
      if (id === "ms_grandmother_ring") {
        if (!L.flag("ms_has_ring")) {
          L.setFlag("ms_has_ring");
          if (L.ms && L.ms.token) L.ms.token("ring");
          L.notify(
            "The ring box fits in your palm exactly the way it did in 1967.",
            { duration: 5 },
          );
        }
        return;
      }
      const pistol = pistolId();
      if (pistol && id === pistol && !L.flag("got_service_pistol")) {
        L.setFlag("got_service_pistol");
        if (!G.isStub("inventory") && G.inventory.equip)
          safeCall("equip", () => G.inventory.equip(pistol, { silent: true }));
        advance();
        return;
      }
      if (
        (id === "q_liberty_key" || id === "q_reel_zeke") &&
        !L.flag("left_cryo")
      ) {
        L.setFlag("zeke_locker_looted");
        advance();
      }
    });
  });
  G.events.on("blastDoor", (state) => {
    if (state === "opening" || state === "open")
      safeCall("blastDoor", onBlastOpen);
  });
  G.events.on("lockOpened", (id) => {
    if (id !== LOCK_ID) return;
    // The map opens its own door on a successful keypad entry; without one, MQ01 opens it.
    if (!(mapLive() && typeof G.map.openBlastDoor === "function"))
      safeCall("lockOpened", onBlastOpen);
  });

  // Polling: the blast door's state (in case its event was missed) and leaving the cryo unit.
  let pollT = 0;
  L.hook("update", function (dt, realDt) {
    pollT -= realDt;
    if (pollT > 0) return;
    pollT = 0.25;
    if (Q.isActive("mq01") && !L.flag("cryo_blast_open") && blastOpen())
      onBlastOpen();
    const p = G.player.pos;
    const outside = p.x < G.LAYOUT.INTERIOR_X_MIN;
    if (!outside || L.flag("left_cryo")) return;
    if (!Q.isStarted("mq01")) return;
    L.setFlag("left_cryo");
    catchUpGear();
    if (Q.isActive("mq01")) Q.complete("mq01");
    // Only play the "first daylight" cinematic when actually stepping out of the Municipal Building
    const X = G.LAYOUT.cryoExit;
    if (!G.SHOT && !G.SMOKE && X && Math.hypot(p.x - X.x, p.z - X.z) < 60)
      exitCinematic();
  });

  /** If the player skipped steps (walked straight out), give them what the story needs. */
  function catchUpGear(quiet) {
    let gave = false;
    if (!L.flag("got_goggles")) L.giveGoggles(true);
    // Nicole's photo strip and letters are the story's thread (the letters carry her return address).
    if (!L.has("ms_note_nicole_letters"))
      L.give("ms_note_nicole_letters", 1, true);
    if (!L.has("ms_note_photo_strip") && !L.flag("ms_photo_taken")) {
      L.give("ms_note_photo_strip", 1, true);
      L.setFlag("ms_photo_taken");
    }
    L.setFlag("ms_locker7_opened");
    if (!L.has("q_liberty_key")) {
      L.give("q_liberty_key", 1, true);
      if (!L.has("q_reel_zeke")) L.give("q_reel_zeke", 1, true);
      gave = true;
    }
    if (!L.flag("got_service_pistol")) {
      L.setFlag("got_service_pistol");
      const pistol = pistolId();
      if (pistol && !L.has(pistol)) L.give(pistol, 1, true);
      L.give(["ammo_10mm"], 24, true);
    }
    if (gave && !quiet)
      L.notify(
        "On the stair you find Zeke's reel and the Liberty Key in your suit pocket. He must have put them there while you slept.",
      );
  }

  // ------------------------------------------------------------------
  // "First daylight" exit cinematic (eyes adjusting, pan up Broadway to Midtown)
  // ------------------------------------------------------------------
  function exitCinematic() {
    const P = G.player;
    // Eyes adjusting to real daylight after twenty-two years: a white wash that fades…
    L.overlay("#fffbe8", 0, 0.15, 3.2, 1);
    // …while the camera drifts from the sky down to the Midtown skyline (driven by
    // the quest update loop, so it pauses with the game and dies with a reset).
    const y0 = P.yaw,
      p0 = 0.55;
    const tx = 80 - P.pos.x,
      tz = -72 - P.pos.z; // look north, toward the Empire State
    const y1 = Math.atan2(-tx, -tz);
    L.cinematic(5.2, (e) => {
      P.yaw = y0 + G.util.wrapAngle(y1 - y0) * e;
      P.pitch = p0 * (1 - e) + 0.06 * e;
    });
    L.sfx("wind_gust", { volume: 0.7 });
    L.later(1.2, () =>
      L.notify("Daylight. Real daylight, twenty-two years of it, all at once."),
    );
    L.later(6.0, () =>
      L.hint(
        "map",
        "[M] opens the map · [J] opens your quests · the tracker in the corner points to your objective.",
      ),
    );
    if (!G.isStub("music") && G.music.setMood)
      try {
        G.music.setMood("explore");
      } catch (e) {
        /* */
      }
  }

  // Debug helpers: G.quests.debug.blastDoor() — jump to the door stage with the code known.
  G.quests.debug.blastDoor = () => {
    if (Q.isActive("mq01")) Q.setStage("mq01", "door");
    learnCode("debug");
    return C;
  };
  G.quests.debug.cryoSpots = () => C;
})();
