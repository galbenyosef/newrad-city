// play-inline-40 03 — cue
// Lines 711-1049 of readable/play-inline-40.pretty.js (statement-aligned).
  function buzzSpots() {
    const L = G.landmarks && G.landmarks.times_square,
      root = L && L.root;
    const cells = new Map(),
      s = siteRect();
    if (root && root.traverse) {
      root.traverse((o) => {
        if (
          !o.isPoints ||
          !/lma_glow_ts/.test((o.parent && o.parent.name) || o.name || "")
        )
          return;
        const pa =
          o.geometry && o.geometry.attributes && o.geometry.attributes.position;
        if (!pa) return;
        o.updateMatrixWorld(true);
        const e = o.matrixWorld.elements;
        for (let i = 0; i < pa.count; i += 1) {
          const x0 = pa.getX(i),
            y0 = pa.getY(i),
            z0 = pa.getZ(i);
          const x = e[0] * x0 + e[4] * y0 + e[8] * z0 + e[12],
            y = e[1] * x0 + e[5] * y0 + e[9] * z0 + e[13],
            z = e[2] * x0 + e[6] * y0 + e[10] * z0 + e[14];
          if (
            y < 2.5 ||
            y > 22 ||
            x < s.x0 - 5 ||
            x > s.x1 + 5 ||
            z < s.z0 - 5 ||
            z > s.z1 + 5
          )
            continue;
          const key = Math.floor(x / 16) + "," + Math.floor(z / 16);
          const c = cells.get(key) || { x: 0, y: 0, z: 0, n: 0 };
          c.x += x;
          c.y += y;
          c.z += z;
          c.n++;
          cells.set(key, c);
        }
      });
    }
    const list = Array.from(cells.values())
      .filter((c) => c.n >= 2)
      .sort((a, b) => b.n - a.n)
      .slice(0, 7)
      .map((c) => ({
        x: c.x / c.n,
        y: Math.min(c.y / c.n, 9),
        z: c.z / c.n,
        n: c.n,
      }));
    return list;
  }
  function startEmitters() {
    if (N.built) return;
    N.built = true;
    const pk = pocketSpots();
    N.chat = pk.map((p, i) => ({
      p,
      h: S.play("neon_chatter_" + "abcd"[i % 4], {
        pos: p,
        loop: true,
        volume: 0.0001,
        noOcclusion: false,
      }),
      lvl: 0,
    }));
    const bz = buzzSpots();
    N.buzz = bz.map((p) => ({
      p,
      h: S.play("neon_buzz", {
        pos: p,
        loop: true,
        volume: 0.0001,
        pitch: 0.97 + Math.random() * 0.06,
      }),
      lvl: 0,
      n: p.n,
    }));
    N.glowFound = bz.length;
  }
  function stopEmitters() {
    if (!N.built) return;
    N.built = false;
    for (const e of N.chat) if (e.h) e.h.stop(1.5);
    for (const e of N.buzz) if (e.h) e.h.stop(1.5);
    N.chat = [];
    N.buzz = [];
  }
  /** Living, non-hostile people near each pocket (G.actors, polled 1×/s). */
  function peopleNear(p) {
    let n = 0;
    try {
      const list =
        G.actors && !G.isStub("actors") && G.actors.list
          ? G.actors.list()
          : null;
      if (!list) return -1;
      for (const a of list) {
        if (!a || a.dead || !a.pos || a.isCreature || a.isRobot) continue;
        if (Math.abs(a.pos.x - p.x) > 9 || Math.abs(a.pos.z - p.z) > 9)
          continue;
        if (a.hostile || (a.isHostile && a.isHostile())) continue;
        n++;
      }
    } catch (e) {
      return -1;
    }
    return n;
  }
  function spot(name, p, vol) {
    if (p)
      S.play(name, {
        pos: { x: p.x + S.rand(-3, 3), y: p.y || 1.2, z: p.z + S.rand(-3, 3) },
        volume: vol || 1,
      });
  }

  // ------------------------------------------------------------------
  // The Rad Room jukebox
  // ------------------------------------------------------------------
  const JB = {
    on: false,
    cue: null,
    song: null,
    next: 0,
    occK: 1,
    occT: 0,
    recent: [],
  };
  function jukeboxPos() {
    try {
      const v =
        G.landmarks &&
        G.landmarks.getAnchor &&
        G.landmarks.getAnchor("times_square", "jukebox");
      if (v) return { x: v.x, y: (v.y || 0) + 1.0, z: v.z };
    } catch (e) {
      /* */
    }
    return JUKEBOX_FALLBACK;
  }
  function jbChain() {
    const ctx = S.ctx,
      p = jukeboxPos();
    const input = ctx.createGain();
    const shelf = ctx.createBiquadFilter();
    shelf.type = "lowshelf";
    shelf.frequency.value = 140;
    shelf.gain.value = 4; // big wooden cabinet
    const box = ctx.createBiquadFilter();
    box.type = "peaking";
    box.frequency.value = 900;
    box.Q.value = 1.2;
    box.gain.value = 2.5;
    const air = ctx.createBiquadFilter();
    air.type = "lowpass";
    air.frequency.value = 9000;
    air.Q.value = 0.5;
    const pan = ctx.createPanner();
    pan.panningModel = "equalpower";
    pan.distanceModel = "inverse";
    pan.refDistance = 2.5;
    pan.rolloffFactor = 1.1;
    pan.maxDistance = 10000;
    S.setPannerPos(pan, p);
    const out = ctx.createGain();
    out.gain.value = 1;
    const send = ctx.createGain();
    send.gain.value = 0.35;
    input.connect(shelf);
    shelf.connect(box);
    box.connect(air);
    air.connect(out);
    out.connect(pan);
    pan.connect(S.bus.world);
    pan.connect(send);
    send.connect(S.bus.revSend);
    return {
      input,
      air,
      out,
      pan,
      send,
      p,
      dispose() {
        [input, shelf, box, air, out, pan, send].forEach((n) => {
          try {
            n.disconnect();
          } catch (e) {
            /* */
          }
        });
      },
    };
  }
  function jbPickSong() {
    const T = S.radioText,
      list = (T && T.rfmSongs) || [];
    if (!list.length) return null;
    const pool = list.filter((s) => !JB.recent.includes(s.title));
    const s = S.pick(pool.length ? pool : list);
    JB.recent.push(s.title);
    if (JB.recent.length > 6) JB.recent.shift();
    return s;
  }
  function jbStartRecord(midway) {
    const ctx = S.ctx,
      song = jbPickSong();
    if (!song || !S.songs || !S.Cue) return false;
    if (!JB.chain) JB.chain = jbChain();
    const gen = new S.songs.PhonoWrap(S.songs.make(song), {
      crackle: 0.22,
      hiss: 0.006,
      lp: 6800,
      hp: 70,
      out: 0.9,
    });
    const cue = new S.Cue("jukebox:" + song.title, gen, {
      dest: JB.chain.input,
      reverb: 0,
    });
    cue.out.gain.value = S.songs.gainFor(song) * 1.25;
    const startBar = midway
      ? Math.floor(Math.random() * S.songs.lengthOf(gen.gen) * 0.5)
      : 0;
    cue.start(ctx.currentTime + 0.1, midway ? 1.5 : 0.25);
    if (startBar) cue.seek(startBar);
    JB.cue = cue;
    JB.song = song;
    return true;
  }
  function jbStop(fade) {
    if (JB.cue) {
      JB.cue.stop(fade || 1.5);
      JB.cue = null;
    }
    if (JB.chain) {
      const c = JB.chain;
      JB.chain = null;
      setTimeout(() => c.dispose(), ((fade || 1.5) + 7) * 1000);
    }
    JB.on = false;
    JB.song = null;
  }
  const _o = { x: 0, y: 0, z: 0 },
    _d = { x: 0, y: 0, z: 0 };
  function occluded(pos) {
    try {
      const L = S.listenerPos,
        dist = Math.hypot(pos.x - L.x, pos.y - L.y, pos.z - L.z);
      if (!G.world || !G.world.raycast || dist < 2.5) return false;
      _o.x = L.x;
      _o.y = L.y;
      _o.z = L.z;
      _d.x = (pos.x - L.x) / dist;
      _d.y = (pos.y - L.y) / dist;
      _d.z = (pos.z - L.z) / dist;
      const h = G.world.raycast(_o, _d, dist - 0.8, {
        ignoreTags: ["actor", "interactable_self", "prop_small"],
      });
      return !!(h && h.collider && h.dist < dist - 1.0);
    } catch (e) {
      return false;
    }
  }
  /** How loud the jukebox is at the listener (0..1): the score steps aside for it (30_music.js). */
  S.jukeboxPresence = function () {
    if (!JB.on || !JB.chain) return 0;
    const p = JB.chain.p,
      L = S.listenerPos,
      d = Math.hypot(p.x - L.x, p.y - L.y, p.z - L.z);
    return (2.5 / (2.5 + 1.1 * Math.max(0, d - 2.5))) * JB.occK;
  };
  function jbUpdate(realDt) {
    const ctx = S.ctx,
      now = ctx.currentTime,
      st = G.state;
    const inWorld =
      st === "play" ||
      st === "goggles" ||
      st === "dialogue" ||
      st === "paused" ||
      st === "barter" ||
      st === "container";
    const p = jukeboxPos(),
      L = S.listenerPos,
      d = Math.hypot(p.x - L.x, p.z - L.z);
    const want =
      inWorld &&
      d < 40 &&
      Math.abs(L.y - p.y) < 12 &&
      !(G.LAYOUT && G.LAYOUT.isInterior && G.LAYOUT.isInterior(L.x));
    if (!want) {
      if (JB.on && (d > 55 || !inWorld)) jbStop(2);
      return;
    }
    const needs = ["piano", "bass", "drums", "guitar", "vibes", "pizz"];
    if (!S.inst.allReady(needs)) {
      needs.forEach(S.inst.ensure);
      return;
    }
    if (!JB.on) {
      JB.on = true;
      JB.next = 0;
      if (jbStartRecord(true)) {
        /* joined mid-record */
      }
    }
    if (JB.cue) {
      JB.cue.tick(now, now + 1.2);
      if (JB.cue.done || JB.cue.stopped) {
        JB.cue = null;
        JB.next = G.time.real + 1.2;
        S.play("jukebox_mech", { pos: p, volume: 0.9 });
      }
    } else if (G.time.real > JB.next && JB.next > 0) {
      JB.next = 0;
      jbStartRecord(false);
    } else if (JB.next === 0 && !JB.cue) JB.next = G.time.real + 3.4;
    // occlusion (walls between you and the Rad Room): muffle + drop, glided
    JB.occT -= realDt;
    if (JB.occT <= 0 && JB.chain) {
      JB.occT = 0.6;
      const k = occluded(p) ? 0.35 : 1;
      if (k !== JB.occK) {
        JB.occK = k;
        JB.chain.out.gain.setTargetAtTime(k, now, 0.25);
        JB.chain.air.frequency.setTargetAtTime(k < 1 ? 650 : 9000, now, 0.25);
      }
    }
  }

  // ------------------------------------------------------------------
  // Voiced barks (VOX performs what the bark captions show)
  // ------------------------------------------------------------------
  const VP = S.vox && S.vox.PROFILES;
