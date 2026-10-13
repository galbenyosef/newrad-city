// play-inline-286 04 — key
// Lines 407-600 of readable/play-inline-286.pretty.js (statement-aligned).
  const FIX = {
    ed_sullivan: [
      [-6, 3.6, 0, 0xfff0d8, 1.9, 10, 0], // studio key over the Tomorrow Hour set
      [-26, -2.2, -5, 0x9ff0e8, 1.4, 8, 0.08], // transmitter valves (boss room)
      [26.5, 9.2, -2, 0xc8dcff, 1.2, 7, 0.05], // monitor wall, control room
      [29, 3.6, 0, 0xe8e0c8, 1.2, 9, 0], // lobby
      [-19, 2, -2, 0xffc890, 1.2, 8, 0.1], // backstage work light
      [14, 2.5, 0, 0xffd4a8, 1.1, 10, 0], // house (spill off the stage)
    ],
    lyceum_theatre: [
      [0, 3.4, -12.5, 0xfff0d0, 1.9, 11, 0], // stage wash (footlights + first batten)
      [-9, 1.4, -9.5, 0xfff4e0, 1.3, 6, 0.04], // the ghost light
      [-7, 2.2, -27, 0xffc880, 1.5, 8, 0.05], // green room string lights
      [0, 5, 25.5, 0xffdcaa, 1.4, 10, 0], // lobby chandelier
      [8.7, 2.4, 26, 0xffc070, 1.2, 6, 0.04], // Mortimer's bar
      [-3.5, 2.4, 2, 0xffd0a0, 1.0, 8, 0], // house, by the director's seat
    ],
    port_authority: [
      [-15, 1.1, 0, 0xff9a48, 1.6, 9, 0.35], // raider cookfire, camp
      [21.5, 3.2, -2, 0xe8f4d0, 1.2, 8, 0.12], // barricade under a live trough
      [22.5, 9.6, -19.5, 0xeef4e0, 1.4, 7, 0.06], // dispatcher's office
      [-18, 10.5, 0, 0xffb870, 1.2, 10, 0.2], // bus deck oil-drum fire
      [26, -2.6, -5.7, 0x9cff88, 1.2, 7, 0.15], // irradiated pool glow
      [21, -1.6, -12.5, 0xcff0b8, 1.0, 8, 0.1], // baggage carousel
    ],
  };

  const S = {}; // per cell runtime: {mood, zone, handles}
  let A = null;
  const _t = {
    hemiS: new THREE.Color(),
    hemiG: new THREE.Color(),
    light: new THREE.Color(),
    fog: new THREE.Color(),
  };

  function atmos() {
    if (A) return A;
    try {
      A =
        G.atmos && !G.atmos.__stub && G.atmos._ && G.atmos._.MOODS
          ? G.atmos._
          : null;
    } catch (e) {
      A = null;
    }
    return A;
  }

  function install() {
    const AT = atmos();
    if (!AT) return;
    for (const key in CELLS) {
      if (S[key]) continue;
      const cell = CELLS[key];
      const first = cell.zones[Object.keys(cell.zones)[0]].p;
      const m = {
        hemiS: first.hemiS.clone(),
        hemiG: first.hemiG.clone(),
        hemiI: first.hemiI,
        light: first.light.clone(),
        lightI: first.lightI,
        exp: first.exp,
        fog: first.fog.clone(),
        fogD: first.fogD,
        bloom: cell.bloom,
        vig: cell.vig,
        owner: "poi_theater",
      };
      AT.MOODS[key] = m; // exact mood: the cell owner's wins over the 'theater'/'transit' category
      S[key] = { mood: m, zone: null, handles: [] };
    }
    // the scene lights we drive through the moods (sanity: they must be real lights)
    const hemi = AT.hemi;
    if (
      hemi &&
      !(hemi.isHemisphereLight || hemi instanceof THREE.HemisphereLight)
    )
      G.reportError(
        "poi_theater:lighting",
        new Error("atmosphere hemi is not a HemisphereLight"),
      );
  }

  function addFixtures() {
    if (G.isStub("atmos") || typeof G.atmos.addFixtureLight !== "function")
      return;
    for (const key in FIX) {
      const I = G.LAYOUT.INTERIORS[key];
      if (!I || !S[key]) continue;
      const st = S[key];
      if (st.handles.length) continue;
      const lift = CELLS[key].lift;
      for (const f of FIX[key]) {
        P.safe("fixture", () => {
          const h = G.atmos.addFixtureLight(
            new THREE.Vector3(
              I.origin.x + f[0],
              (I.origin.y || 0) + lift + f[1],
              I.origin.z + f[2],
            ),
            f[3],
            { intensity: f[4], range: f[5], flicker: f[6], glow: false },
          );
          if (h) st.handles.push(h);
        });
      }
    }
  }

  function zoneAt(key, pos) {
    const cell = CELLS[key],
      I = G.LAYOUT.INTERIORS[key];
    const lx = pos.x - I.origin.x,
      ly = pos.y - (I.origin.y || 0) - cell.lift,
      lz = pos.z - I.origin.z;
    let best = null,
      bd = 1e9;
    for (const zn in cell.zones) {
      for (const p of cell.zones[zn].pts) {
        const d = Math.hypot(lx - p[0], lz - p[2]) + Math.abs(ly - p[1]) * 4;
        if (d < bd) {
          bd = d;
          best = zn;
        }
      }
    }
    return best;
  }

  function damp(a, b, k) {
    return a + (b - a) * k;
  }
  function grade(key, dt, snap) {
    const st = S[key],
      cell = CELLS[key],
      m = st.mood;
    const pos = G.player && G.player.pos;
    if (!pos) return;
    const zn = zoneAt(key, pos) || Object.keys(cell.zones)[0];
    const jumped = zn !== st.zone && st.zone === null;
    st.zone = zn;
    const p = cell.zones[zn].p;
    const b = P.safe("lightBoost", () => cell.boost(zn)) || null;
    const k = snap || jumped ? 1 : 1 - Math.exp(-1.6 * Math.max(0, dt));
    _t.hemiS.copy(p.hemiS);
    _t.hemiG.copy(p.hemiG);
    _t.light.copy(p.light);
    _t.fog.copy(p.fog);
    m.hemiS.lerp(_t.hemiS, k);
    m.hemiG.lerp(_t.hemiG, k);
    m.light.lerp(_t.light, k);
    m.fog.lerp(_t.fog, k);
    m.hemiI = damp(m.hemiI, p.hemiI + ((b && b.hemiI) || 0), k);
    m.lightI = damp(m.lightI, p.lightI + ((b && b.lightI) || 0), k);
    m.exp = damp(m.exp, p.exp + ((b && b.exp) || 0), k);
    m.fogD = damp(m.fogD, p.fogD, k);
  }

  P.lighting = {
    zone(key) {
      return S[key] ? S[key].zone : null;
    },
    mood(key) {
      return S[key] ? S[key].mood : null;
    },
    fixtures(key) {
      return S[key] ? S[key].handles.length : 0;
    },
  };

  P.onReady.push(() => {
    install();
    addFixtures();
  });
  let wasIn = null;
  (P.tick = P.tick || []).push((dt, realDt) => {
    if (!S.ed_sullivan) {
      install();
      if (!S.ed_sullivan) return;
      addFixtures();
    }
    const pos = G.player && G.player.pos;
    let cur = null;
    if (pos && pos.x >= G.LAYOUT.INTERIOR_X_MIN)
      for (const key in CELLS)
        if (P.inCell(key)) {
          cur = key;
          break;
        }
    if (cur) grade(cur, realDt, cur !== wasIn); // snap on entering (the door fade hides it)
    if (cur !== wasIn && wasIn && S[wasIn]) S[wasIn].zone = null;
    wasIn = cur;
  });
