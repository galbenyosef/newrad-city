/* src/lair/40_cast.js */
/* =====================================================================
 * NEW RAD CITY — lair / 40_cast.js
 * The finale's inputs and the people in the Sun Room.
 *
 * Inputs: G.quests.lib.ms.finaleInputs() (main story, src/quests) with a
 * flag-level fallback; K.in() caches nothing (the story can change until
 * the M42 door opens).
 *
 * Cast (stable actor ids, all 'lair_' prefixed):
 *   lair_nicole     Nicole Mead / Sister Dawn (preset 'sister_dawn')
 *   lair_rose       Rose (preset 'rose') — the story's own ms_rose is released
 *                   (G.quests.lib.ms.rose.release(false)) when the finale takes over
 *   lair_tinder     Brother Tinder, if he is alive (the story's ms_tinder is retired)
 *   lair_z1..z6     Glowkeeper zealots kneeling round the flatcar
 *   lair_hollowell  Keeper Hollowell, only if he came down as an ally
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  const K = G.lair && G.lair._;
  if (!K) return;
  const HP = K.HP,
    PI = K.PI;

  K.L = () => (K.live("quests") && G.quests.lib) || null;
  K.msLib = () => {
    const L = K.L();
    return (L && L.ms) || null;
  };

  /** Every input the finale reads, in one object. */
  K.in = function () {
    const ms = K.msLib();
    let I =
      ms && ms.finaleInputs
        ? K.safe("finaleInputs", () => ms.finaleInputs())
        : null;
    if (!I) {
      const f = (k) => K.flag("ms_" + k);
      const trust = typeof f("rose_trust") === "number" ? f("rose_trust") : 1;
      const TOK = [
        "ring",
        "record",
        "booth",
        "rose_page",
        "pass",
        "nell",
        "voice",
        "poster",
      ];
      I = {
        roseTrust: trust,
        roseState: f("rose_captive")
          ? "captive"
          : f("rose_with_eli") && trust >= 3 && f("torch") !== "selective"
            ? "with_eli"
            : "alone",
        rosePromise: !!f("rose_promise"),
        ring: f("ring") || null,
        roseHasPhoto: !!f("rose_has_photo"),
        tokens: TOK.filter((t) => !!f("token_" + t)),
        notice: f("notice") || null,
        eliReplied: !!f("eli_replied"),
        glow: f("glow") || null,
        sunBattery: f("sun_battery") || null,
        lockTruth: !!f("lock_truth"),
        keel: f("keel") || null,
        microfilm: f("microfilm") || null,
        attributionRead: !!f("attribution_read"),
        torch: f("torch") || null,
        keyB: f("keyB") || null,
        sunWordDenied: !!f("sun_word_denied"),
        hollowell: f("hollowell") || null,
        childrenSent: !!f("children_sent"),
        evacuation: !!(f("evacuation_called") || f("evac_gc")),
        zealotsSpared: !!f("zealots_spared"),
        tinderStopped: !!f("tinder_stopped"),
        faction: K.flag("mq_faction") || "none",
        musters: f("musters") || [],
        zekeFree: !!f("zeke_free"),
        calloway: !!f("calloway_free"),
        crane: f("crane") || null,
        dawnPact: f("dawn_pact") || null,
      };
    }
    if (!Array.isArray(I.tokens)) I.tokens = [];
    if (!Array.isArray(I.musters)) I.musters = [];
    return I;
  };
  /** Each memory token beyond the first lowers Presence fallbacks by 1 and Persuasion fallbacks by 5. */
  K.tokenBonus = () => Math.max(0, K.in().tokens.length - 1);
  K.hasToken = (t) => K.in().tokens.indexOf(t) >= 0;

  // ---- who is alive (epilogue gating) ----
  const NPC_OF = {
    crane: "lib_crane",
    hale: "con_hale",
    stroud: "cov_stroud",
    keel: "li_keel",
    kong: "esb_kong",
    kincaid: "neon_capt",
    lys: "bs_lys",
    corbeau: "bs_corbeau",
    delphine: "gc_delphine",
    betty: "ws_betty",
    tony: "bb_tony",
    hollowell: "glow_ezra",
    zeke: "lib_zeke",
    rocky: "rc_rocky",
    moe: "gc_moe",
    hollis: "gc_doc",
    calloway: "ms_calloway",
    tinder: "ms_tinder",
    noonday: "glow_sister",
  };
  K.dead = function (who) {
    if (K.flag(who + "_dead") || K.flag("ms_" + who + "_dead")) return true;
    const id = NPC_OF[who];
    if (id && K.flag("dead_" + id)) return true;
    if (who === "keel" && K.flag("ms_keel") === "dead") return true;
    if (who === "hollowell" && K.flag("ms_hollowell") === "dead") return true;
    if (
      who === "tinder" &&
      (K.flag("dead_lair_tinder") || K.flag("ms_tinder_dead"))
    )
      return true;
    if (who === "rose" && K.flag("ms_rose_dead")) return true;
    if (who === "nicole" && K.flag("ms_nicole_dead")) return true;
    return false;
  };
  K.alive = (who) => !K.dead(who);
  K.mustered = (id) => K.in().musters.indexOf(id) >= 0;

  // ------------------------------------------------------------------
  // Actor helpers
  // ------------------------------------------------------------------
  function castTypes() {
    try {
      return G.chars && !G.isStub("chars") && G.chars.cast
        ? G.chars.cast().map((c) => c.id)
        : [];
    } catch (e) {
      return [];
    }
  }
  K.typeOr = function (preset, fb) {
    return castTypes().indexOf(preset) >= 0 ? preset : fb;
  };
  K.npc = (id) => {
    const L = K.L();
    return L ? L.npc(id) : null;
  };
  K.npcAlive = (id) => {
    const a = K.npc(id);
    return !!a && !a.dead;
  };
  K.spawn = function (def) {
    const L = K.L();
    return L ? L.spawnNPC(def) : null;
  };
  K.despawn = function (id) {
    const L = K.L();
    if (L && L.npc(id)) L.removeNPC(id);
  };
  K.face = function (id, x, z) {
    const a = K.npc(id);
    if (a && !a.dead && a.faceTowards)
      K.safe("face", () => a.faceTowards(x, z));
  };
  K.anim = function (id, name) {
    const a = K.npc(id);
    if (a && a.char && a.char.setAnim)
      K.safe("anim", () => a.char.setAnim(name, { loop: true }));
  };
  K.say = function (id, text, dur) {
    const a = K.npc(id);
    if (a && !a.dead && a.say) K.safe("say", () => a.say(text, dur || 4.5));
  };
  K.killNpc = function (id, opts) {
    const a = K.npc(id);
    if (a && !a.dead) {
      a.essential = false;
      K.safe("kill", () => a.kill(opts || {}));
    }
  };
  K.hostile = function (id, v) {
    const a = K.npc(id);
    if (a && !a.dead && a.setHostile) {
      if (v) a.essential = false;
      K.safe("hostile", () => a.setHostile(v !== false));
    }
  };
  const A = (n) => K.anchors[n];

  K.ZEALOTS = [
    "lair_z1",
    "lair_z2",
    "lair_z3",
    "lair_z4",
    "lair_z5",
    "lair_z6",
  ];
  /** Zealots in the Sun Room: 5, two fewer when Hollowell came down, one more when the evacuation tipped them off. */
  K.zealotCount = function () {
    const I = K.in();
    let n = 5;
    if (I.hollowell === "ally" && K.alive("hollowell")) n -= 2;
    if (I.evacuation) n += 1;
    return Math.max(2, Math.min(6, n));
  };

  const LEAVE_ROSE = ["ms_rose"];
  /** Take Rose over from the story (the scripted ally) — the finale spawns its own. */
  K.releaseStoryRose = function () {
    const ms = K.msLib();
    if (ms && ms.rose && ms.rose.release && !K.flag("ms_rose_released"))
      K.safe("rose.release", () => ms.rose.release(false));
    for (const id of LEAVE_ROSE) K.despawn(id);
  };
  /** Hand Rose back to the story after the ending (if she stays in the city). place: 'home' | {x,y,z} */
  K.returnRose = function (place) {
    K.despawn("lair_rose");
    const ms = K.msLib();
    if (!ms || !ms.rose) return;
    K.setFlag("ms_rose_released", false);
    K.safe("rose.place", () => {
      if (place === "home") ms.rose.place("home");
      else
        ms.rose.place("at", {
          fallback: { x: place.x, y: place.y, z: place.z },
        });
    });
  };

  /**
   * Spawn whoever belongs in the Sun Room for the current finale phase. Idempotent.
   * phase-aware: before the ending everybody is calm; Rose's position follows her state.
   */
  K.spawnSunCast = function () {
    if (!K.O2()) return;
    const F = K.fin(),
      I = K.in();
    const ended = !!F.ending;
    // Nicole (alive unless an A or C ending happened)
    if (!K.flag("ms_nicole_dead") && !K.flag("dead_lair_nicole")) {
      const n = A("nicole");
      const recognised = F.phase && F.phase !== "pre";
      K.spawn({
        id: "lair_nicole",
        type: K.typeOr("sister_dawn", "human"),
        preset: "sister_dawn",
        name: recognised ? "Nicole" : "Sister Dawn",
        gender: "f",
        outfit: "glowkeeper_robes",
        hair: "long",
        skinTone: 0.18,
        age: 50,
        faction: "glowkeepers",
        hostile: false,
        essential: true,
        ai: "static",
        level: 14,
        hp: 200,
        dialogue: "lair_dlg_dawn",
        noRespawn: true,
        voice: "f_old",
        pos: { x: n.x, y: 0, z: n.z },
        yaw: recognised ? HP : -HP,
        barks: [],
      });
      const a = K.npc("lair_nicole");
      if (a) {
        a.name = recognised ? "Nicole" : "Sister Dawn";
        a.essential = !ended;
        a.dialogue = "lair_dlg_dawn";
        a.yaw = recognised ? HP : -HP;
      }
    }
    // Rose
    if (!K.flag("ms_rose_dead") && !K.flag("dead_lair_rose") && !F.roseGone) {
      const st = I.roseState;
      let pos = null,
        ai = "guard";
      if (F.roseArrived || st === "with_eli") {
        const p = A("m42_arrival");
        pos = { x: p.x + 1.2, z: p.z + 1.8 };
      }
      if (st === "captive" && !F.roseFreed) {
        const p = A("rose_captive");
        pos = { x: p.x, z: p.z };
        ai = "sit";
      }
      if (F.roseArrived && st === "alone") {
        const p = A("spur_mouth");
        pos = { x: p.x - 3, z: p.z - 1 };
        ai = "guard";
      }
      if (ended && F.rosePlace) pos = F.rosePlace;
      if (pos) {
        K.spawn({
          id: "lair_rose",
          type: K.typeOr("rose", "human"),
          preset: "rose",
          name: "Rose",
          gender: "f",
          outfit: "leather_armor",
          hair: "short",
          skinTone: 0.32,
          faction: "cryo",
          hostile: false,
          essential: !ended || !K.flag("ms_rose_mortal"),
          ai,
          level: 12,
          hp: 320,
          weapon: ai === "sit" ? undefined : ["sniper_rifle", "hunting_rifle"],
          dialogue: "lair_dlg_rose",
          noRespawn: true,
          voice: "f_young",
          variant: ai === "sit" ? "brand" : undefined,
          pos: { x: pos.x, y: 0, z: pos.z },
          yaw: HP * 0.5,
          barks: [],
        });
      }
    }
    if (ended) return;
    // Tinder
    if (K.alive("tinder") && !K.flag("dead_lair_tinder")) {
      const p = A("plate");
      K.despawn("ms_tinder");
      K.spawn({
        id: "lair_tinder",
        type: K.typeOr("brother_tinder", "human"),
        preset: "brother_tinder",
        name: "Brother Tinder",
        gender: "m",
        outfit: "glowkeeper_robes",
        faction: "glowkeepers",
        hostile: false,
        essential: true,
        ai: "static",
        level: 13,
        hp: 300,
        weapon: ["sledgehammer", "lead_pipe"],
        noRespawn: true,
        pos: { x: p.x + 0.4, y: 0, z: p.z - 1.6 },
        yaw: HP,
        barks: ["Nine forty-seven.", "Mind the cables."],
      });
    }
    // the kneeling zealots
    const n = K.zealotCount(),
      KN = K.SUN.KNEEL || [];
    for (let i = 0; i < K.ZEALOTS.length; i++) {
      const id = K.ZEALOTS[i];
      if (i >= n || K.flag("dead_" + id) || F.zealotsGone) {
        if (K.npc(id) && !K.flag("dead_" + id)) K.despawn(id);
        continue;
      }
      const p = KN[(i * 3) % KN.length] || {
        x: K.O2().x - 6,
        z: K.O2().z,
        yaw: -HP,
      };
      K.spawn({
        id,
        type: K.typeOr("glowkeeper_zealot", "human"),
        preset: "glowkeeper_zealot",
        seed: 900 + i,
        name: "Glowkeeper Zealot",
        gender: i % 3 === 1 ? "f" : "m",
        outfit: "glowkeeper_robes",
        faction: "glowkeepers",
        hostile: !!F.fight,
        essential: false,
        ai: F.fight ? "guard" : "kneel",
        level: 11,
        hp: 160,
        weapon: [
          ["pipe_pistol", "pistol_10mm"],
          ["machete", "lead_pipe"],
          ["hunting_rifle", "bolt_rifle_32"],
        ][i % 3],
        noRespawn: true,
        pos: { x: p.x, y: 0, z: p.z },
        yaw: p.yaw,
        barks: [
          "Keep the light on.",
          "A dimanche.",
          "The Sun does not choose.",
        ],
      });
    }
    // Hollowell, if he came down as an ally
    if (K.in().hollowell === "ally" && K.alive("hollowell")) {
      const p = A("m42_arrival");
      K.spawn({
        id: "lair_hollowell",
        type: K.typeOr("keeper_hollowell", "human"),
        preset: "keeper_hollowell",
        name: "Keeper Ezra Hollowell",
        gender: "m",
        outfit: "glowkeeper_robes",
        faction: "glowkeepers",
        hostile: false,
        essential: true,
        ai: "static",
        level: 8,
        noRespawn: true,
        pos: { x: p.x + 0.6, y: 0, z: p.z - 2.2 },
        yaw: -HP,
      });
    }
  };
  /** Everybody out (reset, test runs). */
  K.despawnSunCast = function (keepNicole) {
    for (const id of ["lair_rose", "lair_tinder", "lair_hollowell"].concat(
      K.ZEALOTS,
    ))
      K.despawn(id);
    if (!keepNicole) K.despawn("lair_nicole");
  };
})();
