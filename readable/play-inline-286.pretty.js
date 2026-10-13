/* src/poi_theater/85_lighting.js */
/* =====================================================================
 * NEW RAD CITY — POI THEATER · 85 interior lighting
 *
 * The walls of the three cells carry baked per-vertex light, but actors
 * (NPCs, robots, raiders) and loose props are lit ONLY by the scene's
 * real lights — with the generic "theater"/"transit" mood they rendered
 * as black silhouettes against the baked sets. Two real light sources
 * are now driven while the player is inside one of our cells:
 *
 *  1. The scene's HemisphereLight (+ the overhead key DirectionalLight and
 *     the bounce fill) — atmosphere owns them and drives them from
 *     G.atmos._.MOODS[interiorKey]. We inject an exact mood per cell (the
 *     owner's mood wins over the category) and re-grade it every frame by
 *     ROOM: the player's position picks a zone (lobby, house, stage,
 *     backstage, basement, control room, concourse, bus deck, office,
 *     baggage…) and the mood eases toward that zone's light (colour,
 *     sky/ground balance, key, exposure, fog). Story state re-grades it
 *     too: Ed Sullivan's stage goes studio-bright once "Dead Air" is ON
 *     AIR; the Lyceum house lights dim while the play runs.
 *  2. The flash/fixture PointLight pool (G.atmos.addFixtureLight — CONTRACT:
 *     no permanent PointLights of our own): authored fixtures at the spots
 *     where people stand (stage wash, ghost light, green-room string
 *     lights, raider fires, dispatcher office, transmitter…) so the 2 pool
 *     slots land on real pools of light around the actors, not only on the
 *     nearest ceiling tube.
 * Zero extra lights, draw calls or shader variants.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._pt) return;
  const P = G._pt;

  const C = (h) => new THREE.Color(h);
  // light profile: hemiS/hemiG (sky/ground of the HemisphereLight), hemiI, light/lightI (overhead key), exp, fog/fogD
  const PR = (o) => ({
    hemiS: C(o.hemiS),
    hemiG: C(o.hemiG),
    hemiI: o.hemiI,
    light: C(o.light),
    lightI: o.lightI,
    exp: o.exp,
    fog: C(o.fog),
    fogD: o.fogD,
  });

  // ------------------------------------------------------------------
  // Per-cell zones (local coords relative to the cell origin, floor lift
  // included: world = origin + (x, y + LIFT, z)). Classification = nearest
  // point, with height weighted ×4 so floors never bleed into each other.
  // ------------------------------------------------------------------
  const CELLS = {
    ed_sullivan: {
      lift: 4.5,
      bloom: 0.55,
      vig: 0.05,
      zones: {
        // dead lobby: grey daylight leaking round the boarded doors, dusty checker floor
        lobby: {
          pts: [
            [30, 0, 0],
            [26.5, 0, 3.4],
            [26.2, 0, -6.2],
            [34, 0, 0],
            [22, 0, 0],
          ],
          p: PR({
            hemiS: "#c0bca8",
            hemiG: "#5a5046",
            hemiI: 1.3,
            light: "#e8e4d4",
            lightI: 0.5,
            exp: 1.14,
            fog: "#15130f",
            fogD: 0.012,
          }),
        },
        // the house: tired gilt under a ceiling breach, warm and dim
        house: {
          pts: [
            [14, -1.2, 0],
            [16, -1.5, 6],
            [16, -1.5, -6],
            [8, -1.8, 0],
            [3, -2.1, 3],
            [17, 5.8, 0],
            [13.2, 4.84, -6],
          ],
          p: PR({
            hemiS: "#c8a888",
            hemiG: "#4e3a2c",
            hemiI: 1.22,
            light: "#ffd8b0",
            lightI: 0.46,
            exp: 1.16,
            fog: "#140f0c",
            fogD: 0.011,
          }),
        },
        // the Tomorrow Hour set: studio key light still burning off the emergency bus
        stage: {
          pts: [
            [-6, -1, 0],
            [-7, -1, -1],
            [-6, -1, 1.5],
            [-10, -1, 4],
            [-10, -1, -4],
            [-2, -1, 0],
          ],
          p: PR({
            hemiS: "#e0cdb4",
            hemiG: "#5e4a3a",
            hemiI: 1.42,
            light: "#fff0da",
            lightI: 0.7,
            exp: 1.12,
            fog: "#16110d",
            fogD: 0.009,
          }),
        },
        // wings / dressing rooms / scene dock: bare amber work lights
        backstage: {
          pts: [
            [-18, -1, -2],
            [-26, -1, -11],
            [-26, -1, 14.6],
            [-22, -1, 6],
            [-16, -1, 8],
          ],
          p: PR({
            hemiS: "#c4a47e",
            hemiG: "#46362a",
            hemiI: 1.18,
            light: "#ffcc90",
            lightI: 0.42,
            exp: 1.18,
            fog: "#15100b",
            fogD: 0.016,
          }),
        },
        // transmitter & trap room: cold blue-green valve glow
        basement: {
          pts: [
            [-26, -4.5, -7],
            [-26, -4.5, -3],
            [-8, -4.5, 0],
            [-31, -4.5, -2],
            [-18, -4.5, 0],
          ],
          p: PR({
            hemiS: "#94b4b4",
            hemiG: "#2e3a3a",
            hemiI: 1.12,
            light: "#c8f0ec",
            lightI: 0.38,
            exp: 1.22,
            fog: "#0c1212",
            fogD: 0.02,
          }),
        },
        // control room / producer's office: monitor-wall blue over tungsten desks
        upstairs: {
          pts: [
            [26, 6.5, -2],
            [27.5, 6.5, -1.8],
            [30, 6.5, 3],
            [35, 6.5, 4],
            [24.5, 6.5, -7.6],
            [30.6, 6.5, -1],
          ],
          p: PR({
            hemiS: "#a8bcc8",
            hemiG: "#3e3a36",
            hemiI: 1.22,
            light: "#e0ecf4",
            lightI: 0.46,
            exp: 1.15,
            fog: "#10131a",
            fogD: 0.014,
          }),
        },
      },
      // story: the broadcast restored → studio lights up (stage + house)
      boost(zone) {
        const on = P.esOnAir && P.esOnAir.visible;
        if (!on) return null;
        return zone === "stage"
          ? { hemiI: 0.22, lightI: 0.25, exp: -0.03 }
          : zone === "house"
            ? { hemiI: 0.12, lightI: 0.1 }
            : null;
      },
    },
    lyceum_theatre: {
      lift: 2.0,
      bloom: 0.5,
      vig: 0.04,
      zones: {
        // lobby: Mortimer's bar, lit chandelier, candles — the warmest room in Midtown
        lobby: {
          pts: [
            [0, 0, 28.6],
            [8.7, 0, 27.3],
            [2.6, 0, 28.6],
            [0, 0, 24],
            [-6, 0, 26],
            [0, 4.5, 21.8],
          ],
          p: PR({
            hemiS: "#e4c49c",
            hemiG: "#5c4230",
            hemiI: 1.42,
            light: "#ffd8a4",
            lightI: 0.55,
            exp: 1.12,
            fog: "#18120b",
            fogD: 0.01,
          }),
        },
        // the house: gold and red plush under the dome chandelier
        house: {
          pts: [
            [0, -1.8, 1.5],
            [-3.5, -1.9, 0.6],
            [0, -1.2, 8],
            [0, -0.6, 14],
            [0, 4.5, 19.2],
            [-11.6, 2.6, -3.5],
            [11.6, 2.6, -3.5],
          ],
          p: PR({
            hemiS: "#dcb892",
            hemiG: "#5a3a2a",
            hemiI: 1.32,
            light: "#ffd4a0",
            lightI: 0.5,
            exp: 1.14,
            fog: "#170f0a",
            fogD: 0.009,
          }),
        },
        // the stage: footlights + battens + the ghost light
        stage: {
          pts: [
            [0, -0.8, -11.5],
            [-4.5, -0.8, -13],
            [4.5, -0.8, -13],
            [-2, -0.8, -12.5],
            [-6.5, -0.8, -16.5],
            [3.5, -0.8, -16.5],
            [-9, -0.8, -9.5],
          ],
          p: PR({
            hemiS: "#f0d6b0",
            hemiG: "#6a4c34",
            hemiI: 1.5,
            light: "#fff0d0",
            lightI: 0.72,
            exp: 1.1,
            fog: "#18110b",
            fogD: 0.008,
          }),
        },
        fly: {
          pts: [
            [11.7, 5.4, -19],
            [-11.7, 5.4, -19],
          ],
          p: PR({
            hemiS: "#b89c7c",
            hemiG: "#3a2c22",
            hemiI: 1.12,
            light: "#f0c890",
            lightI: 0.38,
            exp: 1.18,
            fog: "#130e0a",
            fogD: 0.014,
          }),
        },
        // green room / office / prop room: string lights, stove, makeup-mirror bulbs
        backstage: {
          pts: [
            [-4, -0.8, -29],
            [-11.2, -0.8, -26.2],
            [9, -0.8, -29],
            [4.3, -0.8, -33.4],
            [0, -0.8, -24],
          ],
          p: PR({
            hemiS: "#e8c496",
            hemiG: "#5a3e2a",
            hemiI: 1.4,
            light: "#ffcc8c",
            lightI: 0.52,
            exp: 1.13,
            fog: "#17100a",
            fogD: 0.012,
          }),
        },
      },
      // story: "The house lights dim" while the play runs — house darkens, the stage keeps its key
      boost(zone) {
        if (!(P.showRunning && P.showRunning())) return null;
        return zone === "house"
          ? { hemiI: -0.38, lightI: 0.2, exp: 0.04 }
          : null;
      },
    },
    port_authority: {
      lift: 4.5,
      bloom: 0.55,
      vig: 0.06,
      zones: {
        // concourse: dying fluorescent troughs, green tile, raider cookfires
        concourse: {
          pts: [
            [-15, 0, 0],
            [21.5, 0, -2],
            [28.6, 0, 0],
            [0, 0, 0],
            [-23, 0, 16.9],
            [10, 0, 10],
            [-5, 0, -10],
          ],
          p: PR({
            hemiS: "#c4d0b4",
            hemiG: "#4a4432",
            hemiI: 1.3,
            light: "#e4f0cc",
            lightI: 0.5,
            exp: 1.16,
            fog: "#10130d",
            fogD: 0.014,
          }),
        },
        // upper bus deck: dead sodium, tunnel mouth, oil-drum fires
        deck: {
          pts: [
            [-18, 6.5, 0],
            [-28, 6.5, 8],
            [-4, 6.5, 0],
            [16, 6.5, -10],
            [6, 6.5, 8],
          ],
          p: PR({
            hemiS: "#c8ae88",
            hemiG: "#3e3226",
            hemiI: 1.16,
            light: "#ffc888",
            lightI: 0.42,
            exp: 1.2,
            fog: "#130f0a",
            fogD: 0.018,
          }),
        },
        // dispatcher's glass office: the boss has the generator
        office: {
          pts: [
            [23.5, 7.1, -18.5],
            [22.2, 7.1, -21],
            [20, 7.1, -16],
          ],
          p: PR({
            hemiS: "#d0d8c4",
            hemiG: "#4a463a",
            hemiI: 1.32,
            light: "#eef4e0",
            lightI: 0.55,
            exp: 1.13,
            fog: "#11130f",
            fogD: 0.012,
          }),
        },
        // baggage level: flooded, irradiated, sickly green
        baggage: {
          pts: [
            [21, -4.5, -12.5],
            [14.4, -4.5, -15.4],
            [26, -4.5, -5.7],
            [13.2, -4.5, -17],
            [5, -4.5, -8],
          ],
          p: PR({
            hemiS: "#a4c09c",
            hemiG: "#2c3a26",
            hemiI: 1.1,
            light: "#cff0b8",
            lightI: 0.36,
            exp: 1.22,
            fog: "#0c120b",
            fogD: 0.022,
          }),
        },
      },
      boost() {
        return null;
      },
    },
  };

  // ------------------------------------------------------------------
  // Authored fixture lights → real PointLights from atmosphere's pool when near
  // [x, y, z (local, before lift), color, intensity, range, flicker]
  // ------------------------------------------------------------------
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
})();
