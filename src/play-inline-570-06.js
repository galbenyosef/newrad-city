// play-inline-570 06 — lantern
// Lines 1228-1573 of readable/play-inline-570.pretty.js (statement-aligned).
  function raiderDef(i) {
    const k = raidKey();
    const s = SITE[k];
    const c = siteLoc(k) || s.fallback;
    const ang = (i / RAIDERS.length) * Math.PI * 2 + 0.4,
      r = k === "roof" ? 5 : 14;
    const leader = i === 0;
    return {
      type: leader ? "glowkeeper_brother" : "glowkeeper_zealot",
      seed: 320 + i,
      name: leader ? "Brother Lumen" : "Glowkeeper Zealot",
      gender: i % 3 === 1 ? "f" : "m",
      outfit: "glowkeeper_robes",
      faction: "glowkeepers",
      hostile: true,
      ai: "guard",
      level: 11,
      hp: leader ? 220 : 160,
      weapon: leader
        ? ["glowkeeper_censer", "hunting_rifle"]
        : [
            ["machete", "lead_pipe"],
            ["pipe_pistol", "pistol_10mm"],
            ["sledgehammer", "machete"],
          ][i % 3],
      at: {
        fallback: {
          x: c.x + Math.cos(ang) * r,
          z: c.z + Math.sin(ang) * r,
          y: c.y,
        },
        maxR: 5,
      },
      barks:
        k === "roof"
          ? [
              "Little Sun! Come home!",
              "For your own safety, child!",
              "Keep the light on!",
            ]
          : [
              "Feed the Sun!",
              "The battery belongs to the Light!",
              "Keep the light on!",
            ],
    };
  }
  RAIDERS.forEach((id, i) =>
    ms.actor({
      id,
      when: () => stage("mq32") === "raid" && !!raidSite() && !raidOver(),
      def: () => raiderDef(i),
    }),
  );
  const ALLY = {
    covenant: [
      ["Lancer Ibarra", "m"],
      ["Lancer Voss", "f"],
    ],
    tap: [
      ["Lineman Dooley", "m"],
      ["Lineman Petra", "f"],
    ],
  };
  ["ms_bo_ally1", "ms_bo_ally2"].forEach((id, i) =>
    ms.actor({
      id,
      when: () =>
        stage("mq32") === "raid" &&
        raidSite() === "battery" &&
        !raidOver() &&
        !!ALLY[batteryKey()],
      def: () => {
        const k = batteryKey();
        const c = siteLoc(k) || SITE[k].fallback;
        const a = ALLY[k][i];
        return {
          type: "human",
          name: a[0],
          gender: a[1],
          outfit: k === "covenant" ? "covenant_exo_rig" : "drifter",
          hat: k === "tap" ? "hardhat" : undefined,
          faction: "settlers",
          hostile: false,
          essential: true,
          ai: "guard",
          home: "here",
          homeR: 4,
          level: 10,
          hp: 260,
          weapon:
            k === "covenant"
              ? ["gyrojet_carbine", "assault_rifle"]
              : ["combat_shotgun", "hunting_rifle"],
          at: {
            fallback: { x: c.x + (i ? 2 : -2), z: c.z + 2, y: c.y },
            maxR: 5,
          },
          barks:
            k === "covenant"
              ? ["Iron keeps!", "Hold the gantry!"]
              : ["Mind the live cable!", "Sparks'll kill us if they cut it!"],
        };
      },
    }),
  );

  // the masked Dawn, seen once (never reachable, never killable, gone after the scene)
  let dawnBusy = false,
    lantern = null;
  function dawnSpot(where) {
    const W = G.world;
    if (where === "roof") {
      const r = L.anchor("tudor_city", ["ext_roof"], null);
      if (r && r.anchored && W && W.groundHeight) {
        const y = W.groundHeight(304, -167.6, r.y - 22, 0.3);
        if (isFinite(y) && Math.abs(y - (r.y - 24)) < 3)
          return { x: 304, y, z: -167.6, look: r }; // the Windsor wing's sign gantry, across the gap
      }
      const c = siteLoc("roof") || SITE.roof.fallback;
      return Object.assign(
        L.freeSpot(c.x - 28, c.z + 6, undefined, { maxR: 10 }),
        { look: c },
      );
    }
    if (W && W.groundHeight) {
      const y = W.groundHeight(-31.6, -222.6, 61, 0.3);
      if (isFinite(y) && y > 50) return { x: -31.6, y, z: -222.6, look: pl() }; // the ledge of One Times Square
    }
    const P = pl() || { x: -40, z: -262 };
    return Object.assign(
      L.freeSpot(P.x + 30, P.z + 30, undefined, { maxR: 10 }),
      { look: P },
    );
  }
  function dawnScene(where) {
    if (dawnBusy) return;
    dawnBusy = true;
    const p = dawnSpot(where);
    const lk = p.look || pl() || p;
    L.spawnNPC({
      id: "ms_dawn_masked",
      type: "sister_dawn",
      variant: "masked",
      name: "Woman in a Sun Mask",
      gender: "f",
      outfit: "glowkeeper_robes",
      faction: "glowkeepers",
      hostile: false,
      essential: true,
      ai: "static",
      level: 20,
      hp: 9999,
      noRespawn: true,
      pos: { x: p.x, y: p.y || 0, z: p.z },
      lookYaw: Math.atan2(-(lk.x - p.x), -(lk.z - p.z)),
    });
    try {
      const THREE = window.THREE;
      if (THREE && G.scene) {
        lantern = new THREE.PointLight(0xffc06a, 2.2, 14, 2);
        lantern.position.set(p.x + 0.4, (p.y || 0) + 2.1, p.z);
        G.scene.add(lantern);
        L.dyn({ object3d: lantern });
      }
    } catch (e) {
      lantern = null;
    }
    const lines =
      where === "roof"
        ? [
            [
              null,
              "[Across the gap, on the gantry of the second TUDOR CITY sign, a woman in grey robes stands in the red light. A gilt mask with twelve rays hides her face. She lifts a lantern and holds it there, looking at the two of you. Just looking.]",
              6,
            ],
            [
              "Rose",
              "[She has the rifle up before you see her move. One shot. It sparks off the gantry a hand's width from the mask.]",
              4.5,
            ],
            ["Rose", "I never miss.", 4],
            [
              null,
              "[The lantern goes out. When the sign flickers back, the gantry is empty.]",
              4,
            ],
          ]
        : [
            [
              null,
              "[High on the ledge of One Times Square, above the dead screens, a woman in grey robes and a gilt twelve-ray mask holds up a lantern at arm's length, the way you hold a light for someone coming down a dark stair. She is not looking at the battery. She is looking at you.]",
              7,
            ],
            [null, "[Then the lantern goes out, and the ledge is empty.]", 4],
          ];
    const t = ms.scene(lines);
    L.later(t + 0.6, () => {
      L.removeNPC("ms_dawn_masked");
      if (lantern && lantern.parent) lantern.parent.remove(lantern);
      lantern = null;
      dawnBusy = false;
      if (where !== "roof" && !L.has("ms_note_journal_lantern")) {
        L.give("ms_note_journal_lantern", 1);
        L.notify('Journal: "Something about the way she held the lantern."', {
          duration: 5,
        });
      }
      finishMq32();
    });
  }
  function finishMq32() {
    if (!Q.isActive("mq32")) return;
    if (raidSite() !== "roof" && !L.has("ms_note_journal_lantern"))
      L.give("ms_note_journal_lantern", 1);
    Q.complete("mq32");
  }
  L.hook("reset", function () {
    dawnBusy = false;
    lantern = null;
  });
  L.hook("spawn", function () {
    L.later(1.0, () => {
      if (!dawnBusy) L.removeNPC("ms_dawn_masked");
      if (stage("mq32") === "after" && !dawnBusy) finishMq32(); // loaded between the raid and the ledge
      if (stage("mq32") !== "raid" && !ms.f("kincaid_dead"))
        setEssential("neon_capt", true);
    });
  });
  G.events.on("actorKilled", (a) => {
    if (a && a.id === "neon_capt") ms.set("kincaid_dead");
  });

  // the choice: Rose's roof or the battery
  ms.dlg("dlg_ms5_choose", "idle").add({
    idle: { text: "[You look around.]", responses: [{ text: "[Step back.]" }] },
    roof: {
      speaker: "Tudor City Roof",
      text: () =>
        "[The roof under the TUDOR CITY sign. Rose's blankets, her spotting scope, the parapet she keeps her rifle on. If you hold here tonight, nobody holds " +
        batteryName() +
        ".]",
      responses: [
        {
          text: "[Hold the roof with Rose.]",
          action: () => chooseRaid("roof"),
        },
        { text: "[Not yet.]" },
      ],
    },
    battery: {
      speaker: "Battery",
      text: () =>
        "[" +
        batteryName().charAt(0).toUpperCase() +
        batteryName().slice(1) +
        ". Twenty-eight volts the Second Sun needs. If you hold here tonight, nobody but the Unkindled and an old doorman holds Rose's roof.]",
      responses: [
        { text: "[Hold the battery.]", action: () => chooseRaid("battery") },
        { text: "[Not yet.]" },
      ],
    },
  });
  ms.spot({
    id: "ms5_choose_roof",
    when: () => stage("mq32") === "choose",
    at: Object.assign({ dx: -1.4 }, SITE.roof),
    label: "Hold the Roof",
    verb: "Choose",
    radius: 1.6,
    use() {
      ms.talk("dlg_ms5_choose", "Tudor City Roof", "roof");
    },
  });
  for (const k of ["neon", "covenant", "tap"]) {
    ms.spot({
      id: "ms5_choose_" + k,
      when: () => stage("mq32") === "choose" && batteryKey() === k,
      at: Object.assign({ dx: 1.5 }, SITE[k]),
      label: "Hold the Battery",
      verb: "Choose",
      radius: 1.8,
      use() {
        ms.talk("dlg_ms5_choose", "Battery", "battery");
      },
    });
  }
  ms.dlg("dlg_ms_rose")
    .add({
      mq32_choose: {
        speaker: "Rose",
        text: () =>
          "Jory saw robes on the Tudor stairs at noon, counting steps. And Sparks says somebody's been walking the cable to " +
          batteryName() +
          '. Same night, same hour. Dusk. [She checks the bolt without looking at it.] They want the battery for the Sun. And they want me. "For my safety." You can\'t be in two places, ' +
          first() +
          ".",
        responses: [
          { text: "I'm staying here. With you.", next: "mq32_stay" },
          {
            text: "If they get the battery, everybody burns. I have to hold it.",
            next: "mq32_go",
          },
          { text: "Let me think." },
        ],
      },
      mq32_stay: {
        speaker: "Rose",
        text: "[A long look. She doesn't say thank you. She moves her blankets so there's room for two behind the parapet.] Then get down. They come up the east stair first. They always come up the east stair.",
        responses: [
          { text: "[Take your position.]", action: () => chooseRaid("roof") },
        ],
      },
      mq32_go: {
        speaker: "Rose",
        text: "Then go. I've held this roof against worse than robes. [She doesn't look at you.] Go on. You're wasting light.",
        responses: [{ text: "[Go to the battery.]" }],
      },
      mq32_after: {
        speaker: "Rose",
        text: "[She is cleaning the rifle she already cleaned.] Don't ask me about the shot. I had her. The wind didn't move. I had her, and I pulled it. [The cloth stops.] I never pull it.",
        onEnter() {
          ms.set("mq32_after_talk");
        },
        responses: [
          { text: "[Don't ask.]" },
          { text: "Maybe you didn't want to hit her.", next: "mq32_after2" },
        ],
      },
      mq32_after2: {
        speaker: "Rose",
        text: "[Very quietly.] Don't.",
        responses: [{ text: "[Leave it.]" }],
      },
    })
    .when(() =>
      stage("mq32") === "choose" && !raidSite() ? "mq32_choose" : null,
    )
    .when(() =>
      Q.isComplete("mq32") &&
      ms.f("rose_defended") &&
      !ms.f("mq32_after_talk") &&
      !Q.isStarted("mq34")
        ? "mq32_after"
        : null,
    );
