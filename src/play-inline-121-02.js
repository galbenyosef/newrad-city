// play-inline-121 02 — fillstyle
// Lines 21-109 of readable/play-inline-121.pretty.js (statement-aligned).
  const K = G.LMA.kit;

  const B = { x0: 58, x1: 101, z0: -176, z1: -149, h: 17 };
  const TERR = 3; // terrace / hall floor level
  const HALL = { x0: 89, x1: 101, z0: -166.5, z1: -158.5, h: 12.5 };
  const PORT = { x0: 101, x1: 104.5, z0: -169.5, z1: -155.5 };

  function textures() {
    K.facade("fac_nypl", {
      bays: 4,
      floors: 3,
      bayW: 3.6,
      floorH: 5.6,
      wall: "#e2ddd0",
      glass: "#2a302e",
      frame: "#6a6458",
      win: { x0: 0.26, x1: 0.74, y0: 0.14, y1: 0.86 },
      broken: 0.35,
      boarded: 0.15,
      mullions: 1,
      sill: "#cfc8b8",
      lintel: true,
      seed: 1911,
      deco: (x, W, H, fy, y0, fh, bw) => {
        for (let i = 0; i < 4; i++) {
          x.fillStyle = "rgba(120,110,95,0.35)";
          x.beginPath();
          x.arc(i * bw + bw / 2, y0 + fh * 0.14, bw * 0.24, Math.PI, 0);
          x.fill();
        }
      },
    });
    K.facade("fac_nypl_stacks", {
      bays: 8,
      floors: 4,
      bayW: 1.6,
      floorH: 4.2,
      wall: "#ddd7c8",
      glass: "#252b2a",
      frame: "#5a564c",
      win: { x0: 0.32, x1: 0.68, y0: 0.05, y1: 0.95 },
      broken: 0.3,
      boarded: 0.1,
      mullions: 0,
      seed: 1912,
    });
    K.paint("nypl_inscr", 1024, 96, (x, W, H) => {
      x.fillStyle = "#d8d2c2";
      x.fillRect(0, 0, W, H);
      x.fillStyle = "#5a5448";
      x.font = 'bold 46px Georgia, "Times New Roman", serif';
      x.textAlign = "center";
      x.textBaseline = "middle";
      try {
        x.letterSpacing = "3px";
      } catch (e) {
        /* */
      }
      x.fillText("THE NEW YORK PUBLIC LIBRARY", W / 2, H / 2 + 3);
      try {
        x.letterSpacing = "0px";
      } catch (e) {
        /* */
      }
      K.stains(x, W, H, 6, 31, 0.3);
      K.streaks(x, W, H, 16, 32, 0.3);
    });
    K.interior("nypl:paints"); // Astor Hall ceiling + card catalogues — 60_nypl_bryant_interior.js
    K.paint("bp_sign", 512, 128, (x, W, H) =>
      K.signText(x, W, H, "BRYANT PARK", {
        bg: "#2a3a2a",
        fg: "#e8e0c0",
        size: 70,
        border: "#8a8a60",
        font: "Georgia, serif",
      }),
    );
    K.paint("carousel_top", 256, 256, (x, W, H) => {
      for (let i = 0; i < 16; i++) {
        x.fillStyle = i % 2 ? "#c8403a" : "#e8dcc0";
        x.beginPath();
        x.moveTo(W / 2, H / 2);
        x.arc(W / 2, H / 2, W / 2, (i * Math.PI) / 8, ((i + 1) * Math.PI) / 8);
        x.fill();
      }
      K.stains(x, W, H, 10, 35, 0.5);
    });
  }

