// play-inline-177 02 — fillstyle
// Lines 22-366 of readable/play-inline-177.pretty.js (statement-aligned).
  const K = G.PMID.kit,
    F = K.f,
    T = K.T;
  const PI = Math.PI,
    HP = PI / 2;

  function art() {
    K.facade("msg_brick", {
      bays: 4,
      floors: 5,
      bayW: 3.4,
      floorH: 3.6,
      wall: "#8e5a44",
      brick: true,
      seed: 41,
      win: { x0: 0.28, x1: 0.72, y0: 0.2, y1: 0.85 },
      frame: "#2e2a24",
      glass: "#232a28",
      broken: 0.4,
      boarded: 0.25,
      mullions: 1,
      sill: "#c8bca0",
      pierShade: 0.2,
    });
    // marquee faces (self-lit): top band + event board
    K.litPaint("msg_marquee", 1536, 256, (x, w, h) => {
      x.fillStyle = "#16120c";
      x.fillRect(0, 0, w, h);
      // bulb border
      for (let i = 12; i < w; i += 22)
        for (const y of [10, h - 10]) {
          x.fillStyle = (i / 22) % 5 < 1 ? "#5a4020" : "#ffd890";
          x.beginPath();
          x.arc(i, y, 6, 0, 7);
          x.fill();
        }
      for (let j = 32; j < h - 20; j += 22)
        for (const xx of [10, w - 10]) {
          x.fillStyle = "#ffd890";
          x.beginPath();
          x.arc(xx, j, 6, 0, 7);
          x.fill();
        }
      x.fillStyle = "#e8e0c8";
      x.fillRect(30, 30, w - 60, h - 60);
      x.fillStyle = "#1a1612";
      K.fitText(
        x,
        "BOXING  TONIGHT",
        w / 2,
        h * 0.38,
        w - 120,
        96,
        "bold ",
        "#1a1612",
        null,
      );
      K.fitText(
        x,
        "THE PIT  ·  ALL COMERS  ·  3 ROUNDS  ·  BETS AT THE WINDOW",
        w / 2,
        h * 0.72,
        w - 140,
        44,
        "bold ",
        "#8a1a14",
        null,
      );
      // missing letters (black gaps)
      x.fillStyle = "#16120c";
      x.fillRect(w * 0.62, h * 0.24, 46, 70);
      x.fillRect(w * 0.18, h * 0.62, 30, 40);
      K.stains(x, w, h, 10, 43, 0.3);
    });
    K.litPaint("msg_marquee_top", 1536, 160, (x, w, h) => {
      x.fillStyle = "#12100c";
      x.fillRect(0, 0, w, h);
      x.save();
      x.shadowColor = "#ffb040";
      x.shadowBlur = 18;
      K.fitText(
        x,
        "MADISON  SQUARE  GARDEN",
        w / 2,
        h / 2 + 4,
        w - 60,
        128,
        "bold ",
        "#ffd070",
        null,
      );
      x.restore();
      K.fitText(
        x,
        "MADISON  SQUARE  GARDEN",
        w / 2,
        h / 2 + 4,
        w - 60,
        128,
        "bold ",
        "#fff0c8",
        null,
      );
      // a few dead bulbs in the letters
      x.fillStyle = "rgba(20,16,12,0.8)";
      for (let i = 0; i < 18; i++)
        x.fillRect((i * 97) % w, 30 + ((i * 37) % 90), 16, 16);
    });
    K.litPaint("msg_marquee_side", 512, 256, (x, w, h) => {
      x.fillStyle = "#12100c";
      x.fillRect(0, 0, w, h);
      for (let i = 14; i < w; i += 24)
        for (const y of [12, h - 12]) {
          x.fillStyle = "#ffd890";
          x.beginPath();
          x.arc(i, y, 6, 0, 7);
          x.fill();
        }
      K.fitText(
        x,
        "M S G",
        w / 2,
        h / 2,
        w - 60,
        150,
        "bold ",
        "#ff6a3a",
        null,
      );
    });
    K.paint("msg_name", 1400, 160, (x, w, h) => {
      x.clearRect(0, 0, w, h);
      K.fitText(
        x,
        "MADISON  SQUARE  GARDEN",
        w / 2,
        h / 2 + 4,
        w - 40,
        120,
        "bold ",
        "#e8dcc0",
        "#3a2a1a",
        6,
      );
    });
    K.paint("msg_pitsign", 700, 260, (x, w, h) => {
      x.fillStyle = "#6a5a44";
      x.fillRect(0, 0, w, h);
      for (let i = 0; i < 6; i++) {
        x.fillStyle = i % 2 ? "#7a6a52" : "#5e4e3a";
        x.fillRect(0, (i * h) / 6, w, h / 6 - 3);
      }
      K.fitText(
        x,
        "THE PIT",
        w / 2,
        h * 0.36,
        w - 60,
        110,
        "bold ",
        "#d8202a",
        "#1a0a08",
        6,
      );
      K.fitText(
        x,
        "FRIENDLY FOLKS · FIST FIGHTS · NO GUNS IN THE RING",
        w / 2,
        h * 0.76,
        w - 50,
        30,
        "bold ",
        "#f0e8d0",
        "#1a0a08",
        3,
      );
      K.weather(x, w, h, 44, 1.2);
    });
    // fight posters (original)
    const posters = [
      ["KID KEARNS", "vs", "IRON MIKE MOLLOY", "#b8281e"],
      ["GOLDEN GLOVES", "FINALS", "1958", "#2a4a8a"],
      [
        "BRICK BRUNO",
        "CHAMPION OF THE PIT",
        '"NOBODY GOES THE DISTANCE"',
        "#3a6a2a",
      ],
      ["FRIDAY NIGHT", "FIGHTS", "PRESENTED BY FIZZO COLA", "#8a1a14"],
    ];
    posters.forEach((p, i) =>
      K.paint("msg_poster" + i, 256, 384, (x, w, h) => {
        x.fillStyle = "#e4d8b8";
        x.fillRect(0, 0, w, h);
        x.fillStyle = p[3];
        x.fillRect(0, 0, w, h * 0.22);
        x.fillRect(0, h * 0.86, w, h * 0.14);
        K.fitText(
          x,
          p[0],
          w / 2,
          h * 0.11,
          w - 20,
          40,
          "bold ",
          "#f4ecd8",
          null,
        );
        x.fillStyle = "#2a2420";
        x.beginPath();
        x.ellipse(w * 0.32, h * 0.46, 34, 60, -0.2, 0, 7);
        x.fill();
        x.beginPath();
        x.ellipse(w * 0.68, h * 0.46, 34, 60, 0.2, 0, 7);
        x.fill();
        x.fillStyle = "#8a1a14";
        x.beginPath();
        x.arc(w * 0.44, h * 0.4, 16, 0, 7);
        x.arc(w * 0.56, h * 0.42, 16, 0, 7);
        x.fill();
        K.fitText(
          x,
          p[1],
          w / 2,
          h * 0.7,
          w - 30,
          30,
          "bold ",
          "#2a2420",
          null,
        );
        K.fitText(
          x,
          p[2],
          w / 2,
          h * 0.93,
          w - 20,
          20,
          "bold ",
          "#f4ecd8",
          null,
        );
        K.weather(x, w, h, 50 + i, 1.3);
      }),
    );
    // bookie chalkboard (odds)
    K.paint("msg_odds", 512, 320, (x, w, h) => {
      x.fillStyle = "#1e2a22";
      x.fillRect(0, 0, w, h);
      x.strokeStyle = "#6a4a2a";
      x.lineWidth = 16;
      x.strokeRect(0, 0, w, h);
      x.fillStyle = "#e8e8dc";
      x.font = 'bold 30px "Comic Sans MS", cursive';
      x.textAlign = "left";
      x.fillText("TONIGHT'S ODDS", 30, 50);
      x.font = '24px "Comic Sans MS", cursive';
      [
        "Sully vs NEWCOMER ...... 3 to 1",
        "Burrow Rat Melee ........... 4 to 1",
        "BRICK vs anybody ........ 9 to 1",
        "House takes 10%. No IOUs.",
        "NO CHEMS BEFORE THE BELL",
      ].forEach((l, i) => x.fillText(l, 30, 100 + i * 42));
      x.globalAlpha = 0.25;
      x.fillStyle = "#e8e8dc";
      for (let i = 0; i < 30; i++)
        x.fillRect(Math.random() * w, Math.random() * h, 40, 2);
      x.globalAlpha = 1;
    });
    // scoreboard faces (self-lit)
    K.litPaint("msg_score", 512, 256, (x, w, h) => {
      x.fillStyle = "#0c0e0c";
      x.fillRect(0, 0, w, h);
      x.strokeStyle = "#8a8a80";
      x.lineWidth = 8;
      x.strokeRect(4, 4, w - 8, h - 8);
      K.fitText(x, "GARDEN", w / 2, 40, w - 60, 40, "bold ", "#ffcf60", null);
      const bulbs = (tx, ox, oy) => {
        x.fillStyle = "#ff5a2a";
        x.font = "bold 60px monospace";
        x.textAlign = "center";
        x.fillText(tx, ox, oy);
      };
      x.fillStyle = "#e8e0c8";
      x.font = "bold 22px " + K.SANS;
      x.textAlign = "center";
      x.fillText("ROUND", w * 0.25, 90);
      x.fillText("TIME", w * 0.75, 90);
      bulbs("3", w * 0.25, 160);
      bulbs("0:00", w * 0.75, 160);
      x.fillStyle = "#6aff7a";
      x.font = "bold 22px " + K.SANS;
      x.fillText("HOME  ●●●○○   VISITOR  ●○○○○", w / 2, 220);
    });
    // lobby sign & concession menu
    K.paint("msg_concession", 700, 200, (x, w, h) => {
      x.fillStyle = "#c8281e";
      x.fillRect(0, 0, w, h);
      x.fillStyle = "#f4e8c8";
      x.fillRect(10, 10, w - 20, h - 20);
      K.fitText(
        x,
        "CARLA'S CONCESSIONS",
        w / 2,
        h * 0.3,
        w - 40,
        60,
        "bold ",
        "#c8281e",
        null,
      );
      K.fitText(
        x,
        "SQUIRREL ON A STICK 8¢ · FIZZO 20¢ · PURIFIED WATER 20¢ · BEEF JERKY 12¢",
        w / 2,
        h * 0.7,
        w - 40,
        26,
        "bold ",
        "#2a2420",
        null,
      );
      K.weather(x, w, h, 61, 0.9);
    });
    K.paint("msg_tickets", 512, 128, (x, w, h) => {
      x.fillStyle = "#2a1e14";
      x.fillRect(0, 0, w, h);
      K.fitText(
        x,
        "TICKETS",
        w / 2,
        h / 2,
        w - 40,
        80,
        "bold ",
        "#e8c870",
        null,
      );
    });
  }

  // ------------------------------------------------------------------
  // EXTERIOR
  // ------------------------------------------------------------------
