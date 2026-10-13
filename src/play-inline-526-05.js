// play-inline-526 05 — pos
// Lines 1033-1330 of readable/play-inline-526.pretty.js (statement-aligned).
  const BROADCAST = [
    "This is Continuity Radio. Today's date is March 1967. Please set your clocks accordingly.",
    "Citizens: carry your 1967 enrolment card at all times. Rations and medicine are issued against enrolment only. Relief Station regulations remain in force.",
    "Directive 7-A is in preparation. Unenrolled persons will be advised of their schedule. Do not approach the Array. Do not approach Liberty Island.",
    "Citizens of New York: the emergency is temporary. Remain indoors and await the all-clear from your block captain.",
    "Acting President Marsh reminds you: ration books remain valid. Hoarding is unpatriotic. Federal scrip is legal tender.",
    "Unlicensed radio transmission is a federal offence under the Emergency Powers Act of 1967.",
    "The government is functioning normally. Repeat: the government is functioning normally. Stand by for further instructions.",
    "Report all foreign agents, French or otherwise, to the nearest Continuity patrol. Loose talk costs lives.",
  ];
  /** A positional "radio speaker" march loop. Returns {update(pos, level, realDt), stop(), onBreak(fn)}. */
  K.synth.march = function () {
    const H = {
      alive: true,
      update() {
        /* no audio */
      },
      stop() {
        H.alive = false;
      },
    };
    const SY = K.synth,
      c = SY.ctx();
    if (!c) return H;
    const ch = SY.chain(c, { x: 0, y: 0, z: 0 }, 9, 0.0001);
    ch.panner.rolloffFactor = 1.4;
    // speaker colouring: band-limited, a little crunchy
    const hp = c.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 420;
    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 3200;
    const pk = c.createBiquadFilter();
    pk.type = "peaking";
    pk.frequency.value = 1500;
    pk.gain.value = 7;
    pk.Q.value = 1.2;
    const sh = c.createWaveShaper();
    const cv = new Float32Array(512);
    for (let i = 0; i < 512; i++) {
      const x = i / 255.5 - 1;
      cv[i] = Math.tanh(x * 2.2) * 0.8;
    }
    sh.curve = cv;
    const bus = c.createGain();
    bus.gain.value = 0.55;
    bus.connect(sh);
    sh.connect(hp);
    hp.connect(lp);
    lp.connect(pk);
    pk.connect(ch.input);
    // faint carrier hiss
    const hiss = c.createBufferSource();
    hiss.buffer = SY.noise(c);
    hiss.loop = true;
    const hg = c.createGain();
    hg.gain.value = 0.025;
    hiss.connect(hg);
    hg.connect(hp);
    hiss.start();
    const EIGHTH = 60 / 116 / 2;
    let nextT = c.currentTime + 0.1,
      idx = 0,
      loops = 0,
      breakUntil = 0,
      lvl = 0;
    const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);
    function note(type, f, t, dur, g) {
      const o = c.createOscillator();
      o.type = type;
      o.frequency.value = f;
      const e = c.createGain();
      e.gain.setValueAtTime(0.0001, t);
      e.gain.exponentialRampToValueAtTime(g, t + 0.012);
      e.gain.exponentialRampToValueAtTime(g * 0.5, t + dur * 0.5);
      e.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.95);
      o.connect(e);
      e.connect(bus);
      o.start(t);
      o.stop(t + dur);
    }
    function drum(t, g, f) {
      const s = c.createBufferSource();
      s.buffer = SY.noise(c);
      const bp = c.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = f;
      bp.Q.value = 0.9;
      const e = c.createGain();
      e.gain.setValueAtTime(g, t);
      e.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);
      s.connect(bp);
      bp.connect(e);
      e.connect(bus);
      s.start(t, Math.random());
      s.stop(t + 0.13);
    }
    let eighthCount = 0;
    function schedule() {
      const horizon = c.currentTime + 0.5;
      if (nextT < c.currentTime - 0.05) nextT = c.currentTime + 0.05; // resumed after a pause: don't burst the backlog
      while (nextT < horizon) {
        if (c.currentTime < breakUntil) {
          nextT = breakUntil;
          return;
        }
        const [m, len] = MEL[idx];
        const dur = len * EIGHTH;
        if (m) {
          note("square", midi(m), nextT, dur * 0.92, 0.16);
          note("triangle", midi(m + 12), nextT, dur * 0.6, 0.05);
        }
        // oom-pah bass + snare on the off-beats, per eighth
        for (let k = 0; k < len; k++) {
          const tt = nextT + k * EIGHTH,
            e8 = eighthCount + k,
            bar = Math.floor(e8 / 4) % CHORDS.length,
            r = CHORDS[bar];
          if (e8 % 2 === 0)
            note(
              "triangle",
              midi(e8 % 4 === 0 ? r - 12 : r - 5),
              tt,
              EIGHTH * 0.9,
              0.22,
            );
          else {
            note("square", midi(r + 4), tt, EIGHTH * 0.5, 0.05);
            note("square", midi(r + 7), tt, EIGHTH * 0.5, 0.04);
            drum(tt, 0.28, 2200);
          }
          if (e8 % 4 === 0) drum(tt, 0.35, 180);
        }
        eighthCount += len;
        nextT += dur;
        idx++;
        if (idx >= MEL.length) {
          idx = 0;
          eighthCount = 0;
          loops++;
          // after each full tune: a spoken broadcast break
          breakUntil = nextT + 7.5;
          nextT = breakUntil;
          if (H.onBreak) {
            const at = nextT - 7.5;
            setTimeout(
              () => {
                if (H.alive && H.onBreak) H.onBreak();
              },
              Math.max(0, (at - c.currentTime) * 1000),
            );
          }
        }
      }
    }
    H.update = function (pos, level, realDt) {
      if (!H.alive) return;
      const now = c.currentTime,
        P = ch.panner;
      if (P.positionX) {
        P.positionX.setTargetAtTime(pos.x, now, 0.05);
        P.positionY.setTargetAtTime(pos.y, now, 0.05);
        P.positionZ.setTargetAtTime(pos.z, now, 0.05);
      } else P.setPosition(pos.x, pos.y, pos.z);
      const running = G.worldRunning && G.worldRunning();
      lvl += ((running ? level : 0) - lvl) * Math.min(1, (realDt || 0.016) * 3);
      ch.out.gain.setTargetAtTime(Math.max(0.0001, lvl * SY.vol()), now, 0.1);
      if (running) schedule();
      else {
        nextT = Math.max(nextT, now + 0.1);
      }
    };
    H.stop = function () {
      if (!H.alive) return;
      H.alive = false;
      const now = c.currentTime;
      try {
        ch.out.gain.cancelScheduledValues(now);
        ch.out.gain.setTargetAtTime(0.0001, now, 0.1);
      } catch (e) {
        /* ignore */
      }
      try {
        hiss.stop(now + 0.6);
      } catch (e) {
        /* ignore */
      }
      setTimeout(() => {
        try {
          ch.out.disconnect();
        } catch (e) {
          /* ignore */
        }
      }, 900);
    };
    return H;
  };

  function encSkyEye() {
    const P = G.player.pos;
    const s = K.streetSpot(P.x, P.z, 50, 80, {
      road: true,
      notSettlement: true,
      clear: 1,
      tries: 40,
    });
    if (!s) return null;
    // drift down the street past the player: target the far side
    const tx = s.x + (P.x - s.x) * 2.2,
      tz = s.z + (P.z - s.z) * 2.2;
    const a = K.spawnActor({
      type: "sky_eye",
      faction: "amb_broadcast",
      hostile: false,
      name: "Continuity Sky-Eye",
      level: Math.max(2, K.level()),
      pos: { x: s.x, y: s.y, z: s.z },
      ai: "patrol",
      patrol: [
        { x: tx, z: tz },
        { x: s.x, z: s.z },
      ],
      noRespawn: true,
      voice: "amb_none",
      barks: {
        idle: [
          "*static* ...the government is functioning normally...",
          "*crackle*",
        ],
        greet: ["*BZZT* Citizen. Remain calm."],
      },
    });
    if (!a) return null;
    const E = {
      kind: "sky_eye",
      x: s.x,
      z: s.z,
      actors: [a],
      t: 0,
      fx: [],
      line: 0,
    };
    const m = K.synth.march();
    E.fx.push(m);
    m.onBreak = function () {
      if (!K.actorAlive(a) || a.inCombat) return;
      if (K.distToPlayer(a.pos.x, a.pos.z) < 60) {
        K.say(a, BROADCAST[E.line++ % BROADCAST.length], 7);
        K.sfx("radio_static", { pos: a.pos, volume: 0.5 });
      }
    };
    E.update = function (dt, realDt) {
      E.t += dt;
      if (!K.actorAlive(a)) {
        m.stop();
        return U.castGone(E) ? "gone" : null;
      }
      E.x = a.pos.x;
      E.z = a.pos.z;
      _v.set(a.pos.x, a.pos.y + 0.3, a.pos.z);
      const d = K.distToPlayer(a.pos.x, a.pos.z);
      m.update(
        _v,
        a.inCombat || a.hostile()
          ? 0
          : K.clamp(1.25 - d / 110, 0, 1) *
              (K.isInterior(G.player.pos.x) ? 0 : 1),
        realDt || dt,
      );
      // drifted on past the player and out of sight: free the director for the next encounter
      if (
        E.t > 90 &&
        d > 120 &&
        !a.inCombat &&
        !K.inView(a.pos.x, a.pos.y, a.pos.z, 1, true)
      )
        return "gone";
      return U.castGone(E) || E.t > 300 ? "gone" : null;
    };
    E.cleanup = function () {
      m.stop();
      U.removeCast(E);
    };
    return E;
  }

  // ==================================================================
  // NYPD PATROLMAN ROBOT ON ITS BEAT
  // ==================================================================
  const COP_LINES = [
    "CITIZEN. THIS AREA IS UNDER CURFEW. CURFEW BEGAN: MARCH 1967.",
    "PLEASE HAVE YOUR IDENTIFICATION READY.",
    "LOITERING IS DISCOURAGED. THANK YOU FOR YOUR COOPERATION.",
    "ALL CITIZENS: PROCEED IN AN ORDERLY FASHION TO THE NEAREST PUBLIC SHELTER.",
    "THE NYPD IS YOUR FRIEND.",
    "REPORTING: ALL QUIET ON BEAT 14. ALL QUIET ON BEAT 14. ALL QUIET ON...",
  ];
