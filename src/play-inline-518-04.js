// play-inline-518 04 — connect
// Lines 940-1085 of readable/play-inline-518.pretty.js (statement-aligned).
  SY.rotor = function () {
    const H = {
      alive: true,
      update() {
        /* no audio */
      },
      stop() {
        H.alive = false;
      },
    };
    const c = SY.ctx();
    if (!c) return H;
    const t0 = c.currentTime;
    const ch = SY.chain(c, { x: 0, y: 0, z: 0 }, 38, 0.0001);
    ch.panner.rolloffFactor = 1.05;
    // blade slap: low noise through a lowpass, amplitude-modulated at blade-pass frequency
    const src = c.createBufferSource();
    src.buffer = SY.noise(c);
    src.loop = true;
    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 520;
    lp.Q.value = 0.7;
    const am = c.createGain();
    am.gain.value = 0.35;
    const lfo = c.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 11;
    const shp = c.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const x = i / 127.5 - 1;
      curve[i] = Math.pow(Math.max(0, x), 3) * 1.6;
    }
    shp.curve = curve;
    lfo.connect(shp);
    shp.connect(am.gain);
    // thump body: sub sine at the same rate
    const sub = c.createOscillator();
    sub.type = "sine";
    sub.frequency.value = 55;
    const subG = c.createGain();
    subG.gain.value = 0;
    const subShp = c.createGain();
    subShp.gain.value = 0.5;
    shp.connect(subShp);
    subShp.connect(subG.gain);
    // turbine whine
    const wh = c.createOscillator();
    wh.type = "sawtooth";
    wh.frequency.value = 820;
    const whBp = c.createBiquadFilter();
    whBp.type = "bandpass";
    whBp.frequency.value = 1650;
    whBp.Q.value = 6;
    const whG = c.createGain();
    whG.gain.value = 0.05;
    src.connect(lp);
    lp.connect(am);
    am.connect(ch.input);
    sub.connect(subG);
    subG.connect(ch.input);
    wh.connect(whBp);
    whBp.connect(whG);
    whG.connect(ch.input);
    src.start(t0);
    lfo.start(t0);
    sub.start(t0);
    wh.start(t0);
    let lvl = 0;
    H.update = function (pos, vel, level, realDt) {
      if (!H.alive) return;
      const now = c.currentTime;
      const P = ch.panner;
      if (P.positionX) {
        P.positionX.setTargetAtTime(pos.x, now, 0.05);
        P.positionY.setTargetAtTime(pos.y, now, 0.05);
        P.positionZ.setTargetAtTime(pos.z, now, 0.05);
      } else P.setPosition(pos.x, pos.y, pos.z);
      // cheap Doppler: radial speed toward the camera
      let dop = 1;
      const cam = G.camera;
      if (cam && vel) {
        const dx = cam.position.x - pos.x,
          dy = cam.position.y - pos.y,
          dz = cam.position.z - pos.z;
        const d = Math.hypot(dx, dy, dz) || 1;
        const vr = (vel.x * dx + vel.y * dy + vel.z * dz) / d; // + approaching
        dop = K.clamp(343 / (343 - vr), 0.8, 1.25);
      }
      const running = G.worldRunning && G.worldRunning();
      const target = running ? K.clamp(level, 0, 1) : 0;
      lvl += (target - lvl) * Math.min(1, (realDt || 0.016) * 3);
      ch.out.gain.setTargetAtTime(
        Math.max(0.0001, lvl * 1.1 * SY.vol()),
        now,
        0.08,
      );
      lfo.frequency.setTargetAtTime(11 * dop, now, 0.1);
      wh.frequency.setTargetAtTime(820 * dop, now, 0.1);
      src.playbackRate.setTargetAtTime(dop, now, 0.1);
    };
    H.stop = function () {
      if (!H.alive) return;
      H.alive = false;
      const now = c.currentTime;
      try {
        ch.out.gain.cancelScheduledValues(now);
        ch.out.gain.setTargetAtTime(0.0001, now, 0.15);
      } catch (e) {
        /* ignore */
      }
      const st = now + 0.8;
      for (const n of [src, lfo, sub, wh]) {
        try {
          n.stop(st);
        } catch (e) {
          /* ignore */
        }
      }
      setTimeout(() => {
        try {
          ch.out.disconnect();
        } catch (e) {
          /* ignore */
        }
      }, 1200);
    };
    return H;
  };

  // ------------------------------------------------------------------
  // System registry (driven by 90_module.js)
  // ------------------------------------------------------------------
  // def: {name, order, init(), initDone(), newGame(opts), reset(), loaded(), update(dt, realDt), save() → json, load(d)}
  K.systems = [];
  K.system = function (def) {
    K.systems.push(def);
    K.systems.sort((a, b) => (a.order || 50) - (b.order || 50));
    return def;
  };
  K.sys = (name) => K.systems.find((s) => s.name === name) || null;
  K.log = function () {
    if (G.DEBUG || (G.QS && G.QS.has("ambdebug")))
      console.log.apply(console, ["[ambient]"].concat(Array.from(arguments)));
  };
