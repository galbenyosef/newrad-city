// play-inline-524 02 — rand
// Lines 340-526 of readable/play-inline-524.pretty.js (statement-aligned).
  function goReal() {
    const f = FF;
    f.real = true;
    clearEvents();
    const actors = [];
    const lvl = K.level();
    for (const S of [f.A, f.B]) {
      const mk = ACTOR_OF[S.faction];
      if (!mk) continue;
      const n =
        S.faction === "maniacs" || S.faction === "creatures"
          ? K.randInt(3, 4)
          : K.randInt(2, 3);
      for (let i = 0; i < n; i++) {
        const sp = K.freeSpotNear(
          S.x + (Math.random() - 0.5) * 6,
          S.z + (Math.random() - 0.5) * 6,
          4,
          10,
        );
        if (!sp) continue;
        const other = S === f.A ? f.B : f.A;
        const def = Object.assign(
          {
            level: Math.max(2, lvl + K.randInt(-2, 1)),
            pos: sp,
            yaw: K.yawTo(sp.x, sp.z, other.x, other.z),
            ai: "patrol",
            patrol: [{ x: other.x, z: other.z }],
            noRespawn: true,
          },
          mk(),
        );
        if (def.weapon && !K.itemExists(def.weapon)) delete def.weapon;
        const a = K.spawnActor(def);
        if (a) actors.push(a);
      }
    }
    if (K.encounters) K.encounters.adopt(actors, "firefight");
    K.log("firefight is real:", actors.length, "actors");
    return actors;
  }
  function updateFight(dt) {
    const f = FF;
    if (!f) return;
    f.t += dt;
    const d = K.distToPlayer(f.x, f.z);
    if (!f.real) {
      if (d < 150 && K.playerOutdoors() && K.hasActors() && f.t < f.dur - 3) {
        goReal();
        FF = null;
        nextFightT = K.now() + K.rand(120, 260);
        return;
      }
      f.next -= dt;
      if (f.next <= 0 && f.t < f.dur) {
        f.next = K.rand(0.4, 2.6);
        if (Math.random() < 0.55) burst(f.A, f.B);
        else burst(f.B, f.A);
        if (f.booms > 0 && f.t > 4 && Math.random() < 0.08) {
          f.booms--;
          const tgt = Math.random() < 0.5 ? f.A : f.B;
          const e = schedule(K.now() + 0.5, E_BOOM);
          if (e) {
            e.x = tgt.x + (Math.random() - 0.5) * 8;
            e.y = tgt.y - 1.2;
            e.z = tgt.z + (Math.random() - 0.5) * 8;
          }
        }
      }
    }
    if (f.t > f.dur + 4 || d > 700 || K.isInterior(G.player.pos.x)) {
      FF = null;
      nextFightT = K.now() + K.rand(100, 260);
    }
  }

  // ------------------------------------------------------------------
  // Far-off life
  // ------------------------------------------------------------------
  function farSound() {
    const dark = K.isDark();
    const kind = K.weighted([
      ["dog", dark ? 1.4 : 0.8],
      ["howl", dark ? 0.8 : 0.05],
      ["siren", 0.12],
      ["collapse", 0.18],
      ["creak", 0.4],
      ["scream", dark ? 0.3 : 0.1],
    ]);
    const P = G.player.pos,
      a = Math.random() * 6.28,
      r = K.rand(130, 340);
    const x = P.x + Math.sin(a) * r,
      z = P.z + Math.cos(a) * r;
    const add = (dt, snd, vol, pitch) => {
      const e = schedule(K.now() + dt, E_SOUND);
      if (e) {
        e.snd = snd;
        e.x = x;
        e.y = 2;
        e.z = z;
        e.vol = vol;
        e.pitch = pitch || 1;
      }
    };
    if (kind === "dog") {
      const n = K.randInt(2, 5),
        p = K.rand(0.85, 1.15);
      for (let i = 0; i < n; i++)
        add(i * K.rand(0.35, 0.8), "dog_bark", 0.7, p);
    } else if (kind === "howl") {
      add(0, "howl", 0.75, K.rand(0.9, 1.1));
      if (Math.random() < 0.5)
        add(K.rand(1.5, 3), "howl", 0.5, K.rand(1.05, 1.25));
    } else if (kind === "siren") add(0, "siren_distant", 0.5);
    else if (kind === "collapse") {
      add(0, "creak", 0.8, 0.6);
      add(1.2, "debris", 1, 0.7);
      add(1.6, "explosion", 0.35, 0.5);
    } else if (kind === "creak") add(0, "creak", 0.6, K.rand(0.6, 0.9));
    else {
      const k = K.pick([
        ["moan", 1.35],
        ["brute_roar", 1],
        ["hurt_human", 1],
      ]);
      add(0, k[0], 0.55, k[1] * K.rand(0.85, 1.05));
    }
  }

  function update(dt) {
    if (dt <= 0) return;
    const t = K.now();
    // pending events
    for (const e of EV)
      if (e.on && t >= e.t) {
        e.on = false;
        try {
          fire(e);
        } catch (err) {
          G.reportError("ambient:distant", err);
        }
      }
    if (!K.playerOk()) return;
    updateFight(dt);
    const outdoors = K.playerOutdoors();
    if (!FF && outdoors && G.state === "play") {
      if (!nextFightT) nextFightT = t + K.rand(45, 140);
      if (t > nextFightT) {
        nextFightT = t + K.rand(60, 150);
        if (
          !K.isStormy() &&
          !K.inCombat() &&
          !K.friendlyLocAt(G.player.pos.x, G.player.pos.z, 0)
        )
          startFight();
      }
    }
    if (outdoors && G.state === "play") {
      if (!nextSoundT) nextSoundT = t + K.rand(15, 40);
      if (t > nextSoundT) {
        nextSoundT = t + K.rand(22, 65);
        farSound();
      }
    }
  }

  K.system({
    name: "distant",
    order: 50,
    reset() {
      clearEvents();
      FF = null;
      nextFightT = 0;
      nextSoundT = 0;
    },
    update,
  });

  K.distant = {
    startFight,
    goReal: () => (FF && !FF.real ? goReal() : null),
    current: () => FF,
    pending: () => EV.filter((e) => e.on).length,
    farSound,
  };
