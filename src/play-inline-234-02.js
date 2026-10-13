// play-inline-234 02 — fillstyle
// Lines 27-185 of readable/play-inline-234.pretty.js (statement-aligned).
  const LI = G._li,
    A = LI.arch,
    F = LI.furn,
    Q = LI.q,
    TAU = Math.PI * 2;
  const KEY = "flatiron_interior";
  const OFF = { x: 150, z: 121 };
  // local polygon (world P − OFF): prow tip north, base on the south street
  const PL = [
    [-16.6, -28],
    [-14.8, -27.3],
    [24, 28],
    [-19, 28],
    [-19, -25.7],
    [-18.1, -27.2],
  ];
  const xd = (z) => -14.8 + (z + 27.3) * (38.8 / 55.3); // diagonal (east) wall x at z
  const FA = 0,
    FB = 4.3,
    HA = 3.9,
    HB = 8.2;

  function art() {
    const T = {};
    const street = (id, seed, kind) =>
      LI.texMat(
        id,
        LI.canvasTex(
          id,
          1024,
          512,
          (x, W, H) => {
            const r = LI.rng(seed);
            const g = x.createLinearGradient(0, 0, 0, H);
            g.addColorStop(0, "#6a7a5a");
            g.addColorStop(0.5, "#b0aa84");
            g.addColorStop(1, "#4a463a");
            x.fillStyle = g;
            x.fillRect(0, 0, W, H);
            if (kind === "park") {
              x.fillStyle = "rgba(70,74,54,0.95)";
              x.fillRect(0, H * 0.62, W, H * 0.38);
              x.strokeStyle = "rgba(40,36,28,0.9)";
              for (let i = 0; i < 22; i++) {
                const tx = r() * W,
                  th = 50 + r() * 90;
                x.lineWidth = 5;
                x.beginPath();
                x.moveTo(tx, H * 0.66);
                x.lineTo(tx, H * 0.66 - th);
                x.stroke();
                x.lineWidth = 2;
                for (let k = 0; k < 5; k++) {
                  x.beginPath();
                  x.moveTo(tx, H * 0.66 - th * (0.5 + k * 0.1));
                  x.lineTo(
                    tx + (r() - 0.5) * 70,
                    H * 0.66 - th * (0.8 + k * 0.06),
                  );
                  x.stroke();
                }
              }
              x.fillStyle = "rgba(64,62,54,0.95)";
              x.fillRect(W * 0.62, H * 0.08, 60, H * 0.6);
              x.beginPath();
              x.moveTo(W * 0.62, H * 0.08);
              x.lineTo(W * 0.62 + 30, -10);
              x.lineTo(W * 0.62 + 60, H * 0.08);
              x.fill();
              x.fillStyle = "rgba(220,210,170,0.8)";
              x.beginPath();
              x.arc(W * 0.62 + 30, H * 0.18, 16, 0, TAU);
              x.fill();
            } else {
              x.fillStyle = "rgba(66,64,56,0.95)";
              for (let i = 0; i < 26; i++) {
                const w = 30 + r() * 80,
                  h = 80 + r() * 260;
                const cx = r() * W;
                x.fillRect(cx - w / 2, H - h, w, h);
              }
              x.fillStyle = "rgba(40,40,34,0.6)";
              for (let i = 0; i < 300; i++)
                x.fillRect(r() * W, H * 0.2 + r() * H * 0.7, 6, 9);
            }
            x.fillStyle = "rgba(40,38,32,0.95)";
            x.fillRect(0, H * 0.9, W, H * 0.1);
            LI.wear(x, W, H, seed, 0.4);
          },
          { clamp: true },
        ),
        { emissive: 0.7, rough: 1 },
      );
    T.west = street("fl_west", 1, "city");
    T.south = street("fl_south", 2, "city");
    T.east = street("fl_east", 3, "city");
    T.prow = street("fl_prow", 4, "park");
    T.board = LI.texMat(
      "fl_board",
      LI.canvasTex(
        "fl_board",
        768,
        512,
        (x, W, H) => {
          x.fillStyle = "#5a4630";
          x.fillRect(0, 0, W, H);
          const r = LI.rng(6);
          const notes = [
            "WANTED: WATER RUNNER. ASK LORENA.",
            'LOST: PACK-BOT "DOLLY". REWARD. — CALDWELL',
            "ROOMS 20 SCRIP/NIGHT — THE WEDGE",
            "NO GUNS DRAWN INSIDE THE POST",
            "RADIOS FIXED. TUBES BOUGHT. — TUBES",
            "CONVOY TO GRAND CENTRAL — TUESDAYS",
            "HAVE YOU SEEN NATE? (WATER CART)",
            "23 SKIDOO CLUB MEETS FRIDAYS (ROOF)",
          ];
          for (let i = 0; i < notes.length; i++) {
            const px = 20 + (i % 3) * 245 + r() * 10,
              py = 20 + Math.floor(i / 3) * 160 + r() * 14;
            x.save();
            x.translate(px + 110, py + 65);
            x.rotate((r() - 0.5) * 0.12);
            x.fillStyle = ["#e8e0c8", "#e0d8a8", "#d8e0c8"][i % 3];
            x.fillRect(-110, -65, 220, 130);
            x.fillStyle = "#2a2418";
            x.font = 'bold 20px "Special Elite", "Courier New", monospace';
            x.textAlign = "center";
            const words = notes[i].split(" ");
            let line = "",
              ly = -30;
            for (const w of words) {
              if ((line + w).length > 16) {
                x.fillText(line, 0, ly);
                ly += 26;
                line = "";
              }
              line += w + " ";
            }
            x.fillText(line, 0, ly);
            x.fillStyle = "#a02a20";
            x.beginPath();
            x.arc(0, -58, 6, 0, TAU);
            x.fill();
            x.restore();
          }
          LI.wear(x, W, H, 6, 0.5);
        },
        { clamp: true },
      ),
      { rough: 0.95 },
    );
    T.sign = (id, lines, st, w, h) =>
      LI.texMat("fl_sign_" + id, LI.signTex("fl_" + id, lines, st, w, h), {
        rough: 0.8,
      });
    return T;
  }

