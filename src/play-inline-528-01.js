// play-inline-528 01 — convoys
// Lines 29-219 of readable/play-inline-528.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const K = G.ambient._;
  const A = G.ambient;

  const disabled = new Set();
  const failed = new Map(); // system -> error count
  const ms = {}; // system -> smoothed update ms
  const QS = G.QS || new URLSearchParams(location.search);
  const OFF = QS.has("noambient");

  function callAll(fn) {
    const args = Array.prototype.slice.call(arguments, 1);
    for (const s of K.systems)
      if (s[fn]) {
        try {
          s[fn].apply(s, args);
        } catch (e) {
          G.reportError("ambient:" + fn + ":" + s.name, e);
        }
      }
  }

  G.registerModule({
    name: "ambient_life",
    order: 55,
    init() {
      if (OFF) {
        console.info("[ambient] disabled by ?noambient");
        return;
      }
      callAll("init");
      G.events.on("initDone", () => callAll("initDone"));
      G.events.on("reset", () => callAll("reset"));
      G.events.on("newGame", (opts) => callAll("newGame", opts || {}));
      G.events.on("loaded", () => callAll("loaded"));
      G.save.register("ambient_life", {
        save() {
          const o = {};
          for (const s of K.systems)
            if (s.save) {
              try {
                o[s.name] = s.save();
              } catch (e) {
                G.reportError("ambient:save:" + s.name, e);
              }
            }
          return o;
        },
        load(d) {
          if (!d) return;
          for (const s of K.systems)
            if (s.load && d[s.name] !== undefined) {
              try {
                s.load(d[s.name]);
              } catch (e) {
                G.reportError("ambient:load:" + s.name, e);
              }
            }
        },
      });
    },
    update(dt, realDt) {
      if (
        OFF ||
        G.state === "loading" ||
        G.state === "title" ||
        G.state === "chargen"
      )
        return;
      if (!K.playerOk()) return;
      K.refreshFrustum();
      for (let i = 0; i < K.systems.length; i++) {
        const s = K.systems[i];
        if (!s.update || disabled.has(s.name)) continue;
        const t0 = performance.now();
        try {
          s.update(dt, realDt);
        } catch (e) {
          const n = (failed.get(s.name) || 0) + 1;
          failed.set(s.name, n);
          if (n <= 2) G.reportError("ambient:update:" + s.name, e);
          if (n >= 30) {
            disabled.add(s.name);
            console.warn(
              "[ambient] system disabled after repeated errors:",
              s.name,
            );
          }
        }
        const d = performance.now() - t0;
        ms[s.name] =
          ms[s.name] === undefined ? d : ms[s.name] * 0.95 + d * 0.05;
      }
    },
  });

  // ------------------------------------------------------------------
  // Public API
  // ------------------------------------------------------------------
  const P = () => G.player.pos;
  A.CFG = K.CFG;
  A.stats = function () {
    const f = K.fauna ? K.fauna.stats() : {};
    const rc = K.rotorcraft && K.rotorcraft.active();
    const ff = K.distant && K.distant.current();
    let total = 0;
    for (const k in ms) total += ms[k];
    return {
      birds: f.birds || 0,
      flocks: f.flocks || [],
      rats: f.rats || 0,
      oxen: K.oxen ? K.oxen.live() : 0,
      convoys: K.convoys
        ? K.convoys
            .list()
            .map(
              (c) =>
                (c.live ? "LIVE " : "") + K.convoys.name(c) + " " + c.state,
            )
        : [],
      rotorcraft: rc ? rc.kind + ":" + rc.mode + ":" + (rc.phase || "") : null,
      firefight: ff
        ? ff.A.faction + " vs " + ff.B.faction + (ff.real ? " (real)" : "")
        : null,
      pendingEvents: K.distant ? K.distant.pending() : 0,
      encounter: K.encounters ? K.encounters.stats() : null,
      sleepers: K.schedules ? K.schedules.count() : 0,
      ms: Object.fromEntries(
        Object.keys(ms).map((k) => [k, +ms[k].toFixed(3)]),
      ),
      msTotal: +total.toFixed(3),
      disabled: Array.from(disabled),
    };
  };
  A.setEnabled = function (name, on) {
    if (on) disabled.delete(name);
    else disabled.add(name);
    return !disabled.has(name);
  };
  A.systems = () => K.systems.map((s) => s.name);
  A.flock = function (kind, x, z) {
    if (!K.fauna) return null;
    kind = kind || "pigeon";
    const p = P();
    x = x === undefined ? p.x + 12 : x;
    z = z === undefined ? p.z - 12 : z;
    const y =
      kind === "pigeon"
        ? G.world.groundHeight(x, z, p.y + 1, 0.2)
        : p.y + (kind === "gull" ? 20 : 26);
    return K.fauna.spawnFlock(kind, x, y, z, kind === "pigeon" ? 8 : 6, {
      r: 14,
    });
  };
  A.scareBirds = (x, z, r) => (K.fauna ? K.fauna.scare(x, z, r || 60) : null);
  A.rotorcraft = (kind, mode) =>
    K.rotorcraft
      ? K.rotorcraft.fly(kind || "continuity", mode || "flyover")
      : null;
  A.firefight = () => (K.distant ? K.distant.startFight() : null);
  A.encounter = (kind) => (K.encounters ? K.encounters.start(kind) : null);
  A.kinds = () => (K.encounters ? K.encounters.kinds() : []);
  A.hitSquad = (kind) => (K.encounters ? K.encounters.hitSquad(kind) : null);
  A.convoys = function () {
    if (!K.convoys) return [];
    return K.convoys.list().map((c) => ({
      name: K.convoys.name(c),
      trader: K.convoys.traders[c.ti].title,
      x: Math.round(c.x),
      z: Math.round(c.z),
      state: c.state,
      live: !!c.live,
      alive: c.alive,
    }));
  };
  /** Map markers for living convoys the player has met this game (goggles map / HUD may use these). */
  A.convoyMarkers = function () {
    if (!K.convoys) return [];
    return K.convoys
      .list()
      .filter((c) => c.alive && c.met)
      .map((c) => ({ x: c.x, z: c.z, label: K.convoys.name(c) + " (convoy)" }));
  };
  A.bringConvoy = function (i) {
    const p = P();
    return K.convoys ? K.convoys.bringTo(i || 0, p.x + 10, p.z) : null;
  };
  A.ox = (def) => (K.oxen ? K.oxen.spawnActor(def) : null);
  A.packOx = A.ox;
  A.createOx = (opts) => (K.oxen ? K.oxen.createModel(opts) : null);
