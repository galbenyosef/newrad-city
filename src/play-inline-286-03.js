// play-inline-286 03 — hemii
// Lines 54-406 of readable/play-inline-286.pretty.js (statement-aligned).
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
