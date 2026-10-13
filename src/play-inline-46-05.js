// play-inline-46 05 — env
// Lines 743-1011 of readable/play-inline-46.pretty.js (statement-aligned).
  function solve(realDt) {
    const h = G.time.hour;
    env.hour = h;
    env.day = G.time.day;
    sunPath(h, env.sunDir);
    moonPath(h, env.moonDir);
    env.sunY = env.sunDir.y;
    env.night = 1 - smooth(-0.12, 0.16, env.sunY);
    ATMOS.sunDirection.copy(env.sunDir);
    ATMOS.moonDirection.copy(env.moonDir);

    const W = A.weather ? A.weather.cur : null;
    const snap = A.envSnap || !A._envInit;
    A._envInit = true;
    const k = realDt > 0 ? 1 - Math.exp(-2.0 * realDt) : 1;

    if (ATMOS.interior) {
      const mood = moodFor(ATMOS.interiorKey);
      env.interior = true;
      env.mood = mood;
      env.lightDir.set(0.25, 1, 0.18).normalize();
      env.lightColor.copy(mood.light);
      env.lightInt = mood.lightI;
      env.hemiSky.copy(mood.hemiS);
      env.hemiGround.copy(mood.hemiG);
      env.hemiInt = mood.hemiI;
      env.fogColor.copy(mood.fog);
      env.fogDensity = mood.fogD;
      env.zenith.copy(mood.fog);
      env.horizon.copy(mood.fog);
      env.glow.copy(mood.fog);
      env.stars = 0;
      env.exposure = mood.exp;
      env.sunSize = 0;
      env.flash = 0;
      // soft side fill (bounce off floors/walls) so shadowed sides keep their form
      env.fillDir.set(-0.62, 0.35, -0.42).normalize();
      env.fillColor.copy(mood.hemiG).lerp(mood.light, 0.5);
      normColor(env.fillColor);
      env.fillInt = 0.18 + mood.lightI * 0.3;
      env.scatter = 0;
      return;
    }
    env.interior = false;
    env.mood = null;
    A.sampleKeys(OUT, h, keyOut);

    // --- light direction: sun by day, moon at night; clamp low angles for sane shadows
    const w = smooth(-0.05, 0.05, env.sunY);
    const src = w > 0.5 ? env.sunDir : env.moonDir;
    env.lightDir.copy(src);
    if (env.lightDir.y < 0.14) {
      env.lightDir.y = 0.14;
      env.lightDir.normalize();
    }
    env.lightColor.copy(keyOut.sunC);
    env.lightInt = keyOut.sunI;
    env.hemiSky.copy(keyOut.hemiS);
    env.hemiGround.copy(keyOut.hemiG);
    env.hemiInt = keyOut.hemiI;
    env.fogColor.copy(keyOut.fog);
    env.fogDensity = keyOut.fogD;
    env.zenith.copy(keyOut.zen);
    env.horizon.copy(keyOut.hor);
    env.glow.copy(keyOut.glow);
    env.cloudLit.copy(keyOut.cLit);
    env.cloudShade.copy(keyOut.cShade);
    env.stars = keyOut.stars;
    env.exposure = keyOut.exp;
    env.sunSize = keyOut.sunSize;

    // --- district tweaks (smoothly blended)
    const D = DISTRICT[ATMOS.district] || { d: 1, tint: null, t: 0 };
    if (snap) {
      distD = D.d;
      distT = D.t;
      if (D.tint) distTintCur.copy(D.tint);
    } else {
      distD = lerp(distD, D.d, k * 0.5);
      distT = lerp(distT, D.t, k * 0.5);
      if (D.tint) distTintCur.lerp(D.tint, k * 0.5);
    }
    env.fogDensity *= distD;
    if (distT > 0.001) {
      _distTint.copy(distTintCur).multiplyScalar(0.25 + 0.75 * (1 - env.night)); // tints are darker at night
      env.fogColor.lerp(_distTint, distT);
      env.horizon.lerp(_distTint, distT * 0.6);
    }

    // --- weather
    if (W) {
      const nightDim = 0.3 + 0.7 * (1 - env.night);
      // overcast: pull the sky toward a flat grey-olive, crush the sun
      const oc = W.cloudDark * W.cloud;
      _grey
        .copy(env.fogColor)
        .lerp(A.tmpC.setRGB(0.28, 0.3, 0.26).multiplyScalar(nightDim), 0.35);
      env.zenith.lerp(_grey, oc * 0.85);
      env.horizon.lerp(_grey, oc * 0.5);
      env.glow.lerp(_grey, oc * 0.8);
      env.cloudLit.lerp(env.cloudShade, oc * 0.55);
      env.lightInt *= W.sunMul;
      env.hemiInt *= 0.78 + 0.22 * W.sunMul + 0.1 * oc;
      env.stars *= 1 - W.cloud * 0.95;
      env.sunSize *= 1 - oc * 0.9;
      // the eye opens up under a heavy sky (grey rain days stay readable, not murky)
      env.exposure *= 1 + 0.22 * oc * (1 - env.night);
      // weather fog tint (dust = brown, rad weather = toxic green, rain = grey-blue)
      if (W.fogTintAmt > 0.001) {
        A.tmpC2.copy(W.fogTint).multiplyScalar(nightDim);
        env.fogColor.lerp(A.tmpC2, W.fogTintAmt);
        env.horizon.lerp(A.tmpC2, W.fogTintAmt * 0.85);
        env.zenith.lerp(A.tmpC2, W.fogTintAmt * 0.45);
        env.hemiSky.lerp(A.tmpC2, W.fogTintAmt * 0.35);
        env.cloudLit.lerp(A.tmpC2, W.fogTintAmt * 0.5);
        env.cloudShade.lerp(A.tmpC2.multiplyScalar(0.45), W.fogTintAmt * 0.5);
      }
      env.fogDensity *= W.fogMul;
      // rad weather (preset rad > 0; none currently): the storm light itself is green — sky fill, key light, bounce and clouds
      // look: NOT a monochrome night-vision filter — a dark, brooding sky (dusk-level light at
      // noon), a sickly yellow-green glow band low on the horizon under the deck, green-lit shadows and
      // haze, while surfaces keep their own colour (brick still reads as brick). Green lightning does
      // the rest (+ atmosphere's post grade pulses).
      if (W.rad > 0.01) {
        const rk = clamp(W.rad, 0, 1);
        env.hemiSky.lerp(_radSky, 0.42 * rk);
        env.hemiGround.lerp(_radGround, 0.35 * rk);
        env.lightColor.lerp(_radKey, 0.34 * rk);
        env.cloudLit.lerp(_radSky, 0.45 * rk);
        env.glow.lerp(_radGlow, 0.7 * rk);
        env.zenith.lerp(
          _radZen.copy(_radZen0).multiplyScalar(nightDim),
          0.75 * rk,
        );
        env.horizon.lerp(
          _radHor.copy(_radHor0).multiplyScalar(nightDim),
          0.55 * rk,
        );
        env.hemiInt *= 1 - 0.22 * rk;
        env.exposure *= 1 - 0.14 * rk * (1 - env.night);
      }
      // lightning
      env.flash = W.flash || 0;
      if (env.flash > 0.001) {
        env.flashColor.copy(W.flashColor);
        env.hemiInt += env.flash * 2.2;
        env.hemiSky.lerp(env.flashColor, clamp(env.flash, 0, 1) * 0.6);
      }
    }

    // --- the key light dips while it hands over between sun and moon (hides the shadow flip at 06:00 / 19:00)
    env.lightInt *= 0.3 + 0.7 * smooth(0.0, 0.07, Math.abs(env.sunY));

    // --- height fog: dense in the streets, thinning above ~60-70 m (weather sets scale height & the uniform haze share)
    env.fogH = W && W.fogH ? W.fogH : 70;
    env.fogHaze = W && W.haze !== undefined ? W.haze : 0.12;
    env.fogH *= 1 - 0.15 * env.night; // cold night air pools the haze lower
    env.fogBase = 6;
    env.fogMax = 1;
    env.fogFar = 2000;
    // aerial perspective: climbing rays fade toward a desaturated horizon-sky tint (not the ground haze)
    const hl =
      env.horizon.r * 0.2126 + env.horizon.g * 0.7152 + env.horizon.b * 0.0722;
    env.fogSky
      .copy(env.horizon)
      .lerp(_grey.setRGB(hl, hl, hl), 0.3)
      .lerp(env.fogColor, 0.3);
    env.aerial = 0.85 * (1 - (W ? W.dust * 0.8 : 0));
    // forward scattering around the sun (warm dusk glow in the haze) or the moon (cold halo)
    const dayW = smooth(-0.05, 0.05, env.sunY);
    env.scatterDir.copy(dayW > 0.5 ? env.sunDir : env.moonDir);
    env.scatterColor.copy(env.lightColor);
    const lowSun = 1 - smooth(0.05, 0.5, Math.abs(env.sunY));
    env.scatter =
      (dayW > 0.5 ? 0.12 + 0.3 * lowSun : 0.06) *
      (W ? 1 - 0.75 * W.cloud * W.cloudDark : 1);

    // --- ambient bounce: sunlit streets & façades across the street light the shaded sides.
    // A shadowless fill from the anti-sun direction, slightly from below, in the warm ground-bounce colour.
    env.fillDir.set(-env.lightDir.x, 0, -env.lightDir.z);
    if (env.fillDir.lengthSq() < 1e-4) env.fillDir.set(-0.6, 0, -0.4);
    env.fillDir.normalize();
    env.fillDir.y = 0.32;
    env.fillDir.normalize();
    env.fillColor
      .copy(env.lightColor)
      .multiply(_bounceAlb)
      .lerp(env.hemiGround, 0.25);
    normColor(env.fillColor);
    env.fillInt = env.lightInt * 0.17 + env.hemiInt * 0.05;
  }
  const _bounceAlb = new THREE.Color("#c9b99a");
  const _radSky = new THREE.Color("#7c983a"),
    _radGround = new THREE.Color("#3c4a22"),
    _radKey = new THREE.Color("#c4ec8a");
  const _radGlow = new THREE.Color("#b8c64a"),
    _radZen0 = new THREE.Color("#1e2814"),
    _radHor0 = new THREE.Color("#7e8a3e");
  const _radZen = new THREE.Color(),
    _radHor = new THREE.Color();
  function normColor(c) {
    const m = Math.max(c.r, c.g, c.b, 1e-4);
    c.multiplyScalar(1 / m);
    return c;
  }

  // ------------------------------------------------------------------
  // Public API
  // ------------------------------------------------------------------
  ATMOS.setHour = function (h, opts) {
    h = Number(h);
    if (!isFinite(h)) return;
    const T = G.time;
    if (opts && opts.advanceDay && h < T.hour) T.day = (T.day || 1) + 1;
    T.hour = ((h % 24) + 24) % 24;
    A.envSnap = true;
    G.events.emit("hourChanged", T.hour);
  };
  /** Pass game hours (waiting/sleeping). */
  ATMOS.advanceHours = function (n) {
    const T = G.time;
    let h = T.hour + (Number(n) || 0);
    while (h >= 24) {
      h -= 24;
      T.day = (T.day || 1) + 1;
      G.events.emit("dayChanged", T.day);
    }
    T.hour = h;
    A.envSnap = true;
    G.events.emit("hourChanged", T.hour);
  };
  ATMOS.getHour = () => G.time.hour;
  /** Night = the sun is (mostly) below the horizon — the SAME measure the lighting uses, so sneak/detection agree with what you see. */
  ATMOS.isNight = () => env.night > 0.5;
  /** 0 = full day, 1 = full night (smooth). */
  ATMOS.nightFactor = () => env.night;
  /** Approximate ambient light level 0..1 at the camera/player (for sneak detection etc.). */
  ATMOS.lightLevel = function () {
    if (env.interior) return clamp(0.25 + env.hemiInt * 0.35, 0, 1);
    return clamp(
      0.18 +
        (1 - env.night) *
          0.75 *
          (A.weather ? 0.6 + 0.4 * A.weather.cur.sunMul : 1),
      0,
      1,
    );
  };
  ATMOS.getEnv = () => env;
  /** 12h clock string "9:45 AM" for UI. */
  ATMOS.clockString = function () {
    const h = G.time.hour,
      hh = Math.floor(h),
      mm = Math.floor((h - hh) * 60);
    const h12 = ((hh + 11) % 12) + 1;
    return h12 + ":" + (mm < 10 ? "0" : "") + mm + (hh < 12 ? " AM" : " PM");
  };

  A.addSystem({
    name: "timeofday",
    order: 10,
    init() {
      solve(0);
    },
    update(dt, realDt) {
      advance(dt);
      solve(realDt);
    },
  });
