// play-inline-590 02 — the
// Lines 24-240 of readable/play-inline-590.pretty.js (statement-aligned).
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
