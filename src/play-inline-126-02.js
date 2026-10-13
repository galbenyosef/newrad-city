// play-inline-126 02 — fillstyle
// Lines 18-106 of readable/play-inline-126.pretty.js (statement-aligned).
  const K = G.LMA.kit;

  const BLD = { x0: -28, x1: 28, z0: -356, z1: -328, h: 26 };
  const FOY = { x0: 2, x1: 27, z0: -354, z1: -330, h: 14 };
  const MEZ = { z0: -354, z1: -349.5, y: 5 };

  function textures() {
    K.facade("fac_radio", {
      bays: 8,
      floors: 8,
      bayW: 2.4,
      floorH: 3.2,
      wall: "#cbc1aa",
      spandrel: "#6a6254",
      glass: "#262c2c",
      frame: "#4a463c",
      win: { x0: 0.22, x1: 0.78, y0: 0.2, y1: 0.86 },
      broken: 0.22,
      boarded: 0.08,
      lit: 0.06,
      litColor: "#ffd090",
      mullions: 1,
      pierShade: 0.12,
      seed: 1932,
    });
    K.paint("rc_board", 1024, 192, (x, W, H) => {
      const g = x.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#f4ecd8");
      g.addColorStop(1, "#d8cfb8");
      x.fillStyle = g;
      x.fillRect(0, 0, W, H);
      x.fillStyle = "#1a1a1a";
      x.font = 'bold 58px "Arial Black", Impact, sans-serif';
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.fillText("RADIO FREE MANHATTAN", W / 2, H * 0.3);
      x.font = 'bold 46px "Arial Black", Impact, sans-serif';
      x.fillText("ON THE AIR · DAY & NIGHT", W / 2, H * 0.72);
      // missing letters / dead bulbs
      x.fillStyle = "rgba(120,110,90,0.8)";
      for (const px of [150, 610, 820]) x.fillRect(px, H * 0.55, 40, 60);
      K.stains(x, W, H, 8, 61, 0.3);
    });
    K.neon("rc_marquee", "RADIO CITY MUSIC HALL", 0xff3030, {
      font: 'bold 80px "Arial Black", Impact, sans-serif',
      h: 120,
    });
    K.interior("radio_city:neon"); // ON AIR, RADIO FREE MANHATTAN (booth) — 90_radio_city_interior.js
    K.neonDraw("rc_blade", 130, 90 * 10 + 40, (x, W, H) => {
      const text = "RADIO CITY",
        cc = "#ff3434";
      x.strokeStyle = cc;
      x.lineWidth = 6;
      x.shadowColor = cc;
      x.shadowBlur = 16;
      x.strokeRect(8, 8, W - 16, H - 16);
      x.font = 'bold 80px "Arial Black", Impact, sans-serif';
      x.textAlign = "center";
      x.textBaseline = "middle";
      for (let i = 0; i < text.length; i++) {
        if (text[i] === " ") continue;
        x.fillStyle = cc;
        x.shadowBlur = 22;
        x.fillText(text[i], W / 2, 62 + i * 90);
        x.shadowBlur = 0;
        x.fillStyle = "rgba(255,240,230,0.75)";
        x.fillText(text[i], W / 2, 62 + i * 90);
      }
    });
    K.interior("radio_city:paints"); // foyer mural + carpet
    K.paint("rc_roofsign", 1024, 256, (x, W, H) => {
      x.fillStyle = "#e8dcc0";
      x.fillRect(0, 0, W, H);
      x.fillStyle = "#b01a1a";
      x.font = 'bold 110px "Arial Black", Impact, sans-serif';
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.fillText("RADIO FREE", W / 2, H * 0.34);
      x.fillStyle = "#1a3a6a";
      x.fillText("MANHATTAN", W / 2, H * 0.76);
      x.strokeStyle = "#1a1a1a";
      x.lineWidth = 8;
      x.strokeRect(6, 6, W - 12, H - 12);
      K.stains(x, W, H, 14, 65, 0.4);
      K.streaks(x, W, H, 30, 66, 0.3);
    });
    K.interior("radio_city:records"); // DJ booth record crate
  }

