// play-inline-62 03 — slots
// Lines 358-489 of readable/play-inline-62.pretty.js (statement-aligned).
  function choose() {
    const pool = A.flashPool || [];
    const K = Math.max(0, Math.min(2, pool.length - 1)); // always leave ≥ 1 slot for combat
    gather();
    const want = cands.slice(0, K);
    // keep existing slots whose candidate is still wanted (refresh their data); fade out the rest
    for (const sl of slots) {
      const i = want.findIndex((c) => candKey(c) === sl.key);
      if (i >= 0) {
        sl.cand = want[i];
        sl.target = 1;
        want.splice(i, 1);
      } else sl.target = 0;
    }
    // new candidates → free (faded-out) slot records or new ones
    for (const c of want) {
      let sl = slots.find((s) => s.target === 0 && s.k < 0.02);
      if (!sl) {
        if (slots.length >= K + 2) break;
        sl = { entry: null, cand: null, k: 0, target: 0, key: null };
        slots.push(sl);
      }
      release(sl);
      sl.cand = c;
      sl.key = candKey(c);
      sl.k = 0;
      sl.target = 1;
    }
  }

  function update(dt, realDt) {
    const rd = realDt || 0.016;
    if (!scanned && G.LAYOUT && A.ready && A._initDone) {
      try {
        scanInteriors();
      } catch (e) {
        scanned = true;
        G.reportError("update:atmosphere/fixtures-scan", e);
      }
    }
    chooseT -= rd;
    if (chooseT <= 0) {
      chooseT = 0.25;
      choose();
    }
    const t = A.animTime;
    for (const sl of slots) {
      sl.k = A.damp(sl.k, sl.target, sl.target > 0 ? 3 : 6, rd);
      if (sl.target === 0 && sl.k < 0.02) {
        release(sl);
        sl.key = null;
        continue;
      }
      if (!sl.cand) continue;
      if (!sl.entry || sl.entry.fixture !== sl) {
        sl.entry = null;
        if (sl.target === 0) {
          sl.k = 0;
          continue;
        } // was fading out anyway: don't grab a new slot
        const e = freeEntry();
        if (!e) continue; // all slots busy with combat flashes — wait
        e.fixture = sl;
        e.prio = 0;
        e.t = 0;
        e.dur = Infinity;
        e.follow = null;
        e.flicker = 0;
        e.owner = -1;
        sl.entry = e;
        sl.k = Math.min(sl.k, 0.1); // fade back in after a steal
      }
      const c = sl.cand,
        L = sl.entry.light;
      L.position.set(c.x, c.y, c.z);
      L.color.copy(c.color);
      L.distance = c.range;
      let fl = 1;
      if (c.flicker)
        fl =
          1 -
          c.flicker *
            0.5 *
            (1 + Math.sin(t * 17 + c.seed) * Math.sin(t * 7.3 + c.seed * 3));
      L.intensity = c.i * Math.pow(c.range * 0.33, 2) * sl.k * fl;
    }
  }

  function reset() {
    for (const sl of slots) release(sl);
    slots.length = 0;
  }

  A.addSystem({
    name: "fixtures",
    order: 65,
    init() {
      G.events.on("initDone", () => {
        A._initDone = true;
      });
    },
    late(dt, realDt) {
      update(dt, realDt);
    },
    reset,
  });
  /** Public, read-only: the registered + auto-scanned fixtures (render_lighting request f).
   *  Returns [{x,y,z,color,intensity,range,interior,always,flicker}] (fresh objects; colour is shared, don't mutate). */
  ATMOS.fixtures = function () {
    const out = [];
    for (const f of fixtures)
      if (!f.removed)
        out.push({
          x: f.x,
          y: f.y,
          z: f.z,
          color: f.color,
          intensity: f.i,
          range: f.range,
          interior: f.interior,
          always: f.always,
          flicker: f.flicker,
          auto: !!f.auto,
        });
    return out;
  };
  ATMOS.fixtureStats = () => ({
    fixtures: fixtures.length,
    outdoorToVirtual: rlOut,
    scan: A.fixtureScan || null,
    slots: slots.map((s) => ({ k: +s.k.toFixed(2), on: !!s.entry })),
  });
