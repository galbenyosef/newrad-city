/* src/lair/70_sound_dress.js */
/* =====================================================================
 * NEW RAD CITY — lair / 70_sound_dress.js
 * The shared story assets (sound helper 68_story_cues.js, textures 41_story.js)
 * used in the lair:
 *   - acoustics archetypes on our INTERIORS cells ('track61', 'sunroom')
 *   - positional loops while the player is in a cell: the phonograph playing
 *     "Two Bits and a Kiss" (G.sfx.record) in the Hall of Candles and the Sun
 *     Room, the candle-hall bed, Tinder's drill (mq35), the dosimeter, the
 *     firing set's hum (until the bomb is dark), the clock's tick in M42
 *   - one-shots for the finale beats (lairRecognition, lairDisarmed, lairEnding)
 *   - story posters pasted on the Track 61 walls (keep_light, dawn_hour,
 *     second_sun, directive_7a)
 * Every call is guarded: a missing sound id is a no-op (warned once by sound).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  const K = G.lair && G.lair._;
  if (!K) return;

  // acoustics (read lazily by sound/64_spaces.js from LAYOUT.INTERIORS)
  (function () {
    const I = G.LAYOUT && G.LAYOUT.INTERIORS;
    if (!I) return;
    if (I.lair_track61 && I.lair_track61.owner === "lair")
      I.lair_track61.acoustics = "track61";
    if (I.lair_m42 && I.lair_m42.owner === "lair")
      I.lair_m42.acoustics = "sunroom";
  })();

  const sfxLive = () => K.live("sfx") && typeof G.sfx.play === "function";
  const H = {}; // running handles by key
  function stop(key, fade) {
    const h = H[key];
    if (h) {
      K.safe("sfx.stop", () => {
        if (h.stop) h.stop(fade === undefined ? 0.8 : fade);
      });
      delete H[key];
    }
  }
  function loop(key, id, pos, vol) {
    if (H[key] || !sfxLive() || !pos) return;
    H[key] =
      K.safe("sfx.loop", () =>
        G.sfx.play(id, {
          pos,
          loop: true,
          volume: vol === undefined ? 1 : vol,
        }),
      ) || null;
  }
  function record(key, pos) {
    if (H[key] || !K.live("sfx") || !pos) return;
    H[key] =
      K.safe("sfx.record", () =>
        typeof G.sfx.record === "function"
          ? G.sfx.record("Two Bits and a Kiss", {
              pos,
              loop: true,
              volume: 0.8,
            })
          : G.sfx.play("record_crackle", { pos, loop: true }),
      ) || null;
  }
  const at = (n, dy) => {
    const a = K.anchors[n];
    return a ? new THREE.Vector3(a.x, (a.y || 0) + (dy || 0), a.z) : null;
  };
  const armed = () => {
    const s = K.ms("second_sun");
    return !(s === "disarmed" || s === "walled" || s === "risen");
  };
  const drilling = () =>
    !!(K.Q() && K.Q().isActive("mq35") && !K.flag("ms_mq35_drill_resolved"));

  let t = 0;
  K.onUpdate(function (dt, realDt) {
    t -= realDt || 0;
    if (t > 0) return;
    t = 0.5;
    if (!G.player) return;
    const cell = K.cellAt(G.player.pos);
    // Track 61: the hall's phonograph, the candle bed, the drill
    if (cell === "lair_track61") {
      record("rec1", K.recordPlayer1);
      loop("hall", "amb_candle_hall", at("hall_centre", 1.5), 0.7);
      if (drilling()) loop("drill", "drill_loop", at("drill", 1.0), 0.9);
      else stop("drill");
    } else {
      stop("rec1");
      stop("hall");
      stop("drill");
    }
    // the Sun Room: the phonograph, the dosimeter, the dynamotor, the clock
    if (cell === "lair_m42") {
      record("rec2", K.recordPlayer2);
      loop("dosi", "dosimeter_loop", at("dosimeter", 1.1), 0.6);
      if (armed())
        loop(
          "hum",
          "bomb_hum",
          K.sun && K.sun.bombTail ? K.sun.bombTail.clone() : at("bomb_centre"),
          0.55,
        );
      else stop("hum", 1.5);
      if (K.clock && K.clock.shown())
        loop("tick", "clock_tick_loop", at("clock", 4.6), 0.35);
      else stop("tick");
    } else {
      stop("rec2");
      stop("dosi");
      stop("hum");
      stop("tick");
    }
  });
  K.onReset(function () {
    for (const k of Object.keys(H)) stop(k, 0);
  });

  // finale beats
  const one = (id, pos) => {
    if (sfxLive()) K.safe("sfx", () => G.sfx.play(id, pos ? { pos } : {}));
  };
  G.events.on("lairRecognition", () => {
    one("match_strike", at("nicole", 1.2));
    setTimeout(() => one("match_flick", at("nicole", 1.2)), 6000);
  });
  G.events.on("lairDisarmed", (m) => {
    one(
      m === "breaker" ? "breaker_trip" : "firing_set_off",
      m === "breaker" ? at("breaker", 1.7) : at("firing_set", 1.0),
    );
    if (m === "rose" || m === "zeke" || m === "wrongword")
      for (let i = 0; i < 4; i++)
        setTimeout(() => one("cipher_wheel", at("plate", 1.2)), 150 * i);
  });
  G.events.on("lairEnding", (e) => {
    if (e === "C") one("bomb_key", at("plate", 1.1));
  });
  const prevMin = { v: null };
  K.onUpdate(function () {
    if (!K.clock || !K.clock.shown()) {
      prevMin.v = null;
      return;
    }
    const m = K.clock.get();
    if (prevMin.v !== null && m !== prevMin.v)
      one("clock_minute", at("clock", 4.6));
    prevMin.v = m;
  });

  // story posters on the Track 61 walls (shared material per poster)
  K.addBuild(35, function posters() {
    if (
      !K.live("mats") ||
      typeof G.mats.poster !== "function" ||
      !K.roots ||
      !K.roots.track61
    )
      return;
    const P = [
      ["keep_light", 0, -9.97, 9.4, 52, Math.PI / 2],
      ["dawn_hour", 0, -9.97, 9.4, 55.5, Math.PI / 2],
      ["keep_light", 1, -9.97, 9.4, 62, Math.PI / 2],
      ["second_sun", 0, 9.97, 9.3, 14, -Math.PI / 2],
      ["directive_7a", 0, 9.97, 9.3, 66, -Math.PI / 2],
      ["dawn_hour", 1, 9.97, 9.3, 72, -Math.PI / 2],
    ];
    const geo = new THREE.PlaneGeometry(1.2, 1.8);
    const MATS = {};
    for (const [id, v, x, y, z, yaw] of P) {
      const m0 = K.safe("poster:" + id, () => G.mats.poster(id, v));
      if (!m0) continue;
      // the platform is lit by candles and lanterns only: let the paper catch a little of it (emissive = its own map, low)
      const key = id + ":" + v;
      const m = (MATS[key] =
        MATS[key] ||
        K.safe("poster.clone", () => {
          const c = m0.clone();
          if (c.map) {
            c.emissive = new THREE.Color(0xffd8a0);
            c.emissiveMap = c.map;
            c.emissiveIntensity = 0.32;
          }
          return c;
        }) ||
        m0);
      const mesh = new THREE.Mesh(geo, m);
      mesh.position.set(x, y, z);
      mesh.rotation.y = yaw;
      mesh.rotation.z = (Math.random() - 0.5) * 0.06;
      mesh.name = "lair_poster_" + id;
      K.roots.track61.add(mesh);
    }
  });
})();
