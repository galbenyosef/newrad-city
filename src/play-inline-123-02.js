// play-inline-123 02 — fillstyle
// Lines 21-153 of readable/play-inline-123.pretty.js (statement-aligned).
  const K = G.LMA.kit;

  const PZ = 2.5; // plaza podium height
  const RINK = { x0: 90, x1: 101, z0: -327, z1: -313 };
  const POD = { x0: 84, x1: 104, z0: -334, z1: -306 };

  function textures() {
    K.facade("fac_30rock", {
      bays: 10,
      floors: 10,
      bayW: 1.8,
      floorH: 3.2,
      wall: "#cbbfa6",
      spandrel: "#3e3c36",
      glass: "#1c2222",
      frame: "#3a3830",
      win: { x0: 0.3, x1: 0.7, y0: 0.2, y1: 0.88 },
      broken: 0.18,
      boarded: 0.05,
      mullions: 0,
      pierShade: 0.28,
      seed: 1933,
    });
    K.paint("wisdom", 512, 384, (x, W, H) => {
      x.fillStyle = "#2a2420";
      x.fillRect(0, 0, W, H);
      // bearded figure with compass parting the clouds (original stylisation)
      const gold = x.createLinearGradient(0, 0, 0, H);
      gold.addColorStop(0, "#f2cf6a");
      gold.addColorStop(1, "#9a7026");
      x.fillStyle = gold;
      x.strokeStyle = gold;
      x.beginPath();
      x.ellipse(W / 2, H * 0.3, 60, 70, 0, 0, 7);
      x.fill();
      x.fillStyle = "#e8e0cc";
      for (let i = 0; i < 9; i++) {
        x.beginPath();
        x.moveTo(W / 2 - 50 + i * 12, H * 0.38);
        x.lineTo(W / 2 - 40 + i * 10, H * 0.62);
        x.lineTo(W / 2 - 34 + i * 10, H * 0.38);
        x.fill();
      }
      x.strokeStyle = "#f2cf6a";
      x.lineWidth = 12;
      x.beginPath();
      x.moveTo(W * 0.2, H * 0.15);
      x.lineTo(W * 0.42, H * 0.3);
      x.stroke();
      x.lineWidth = 6;
      x.beginPath();
      x.moveTo(W / 2, H * 0.5);
      x.lineTo(W / 2 - 110, H * 0.95);
      x.moveTo(W / 2, H * 0.5);
      x.lineTo(W / 2 + 110, H * 0.95);
      x.stroke();
      x.lineWidth = 3;
      for (let i = 0; i < 8; i++) {
        x.strokeStyle = i % 2 ? "#7aa0c0" : "#c05a3a";
        x.beginPath();
        x.arc(W / 2, H * 0.95, 60 + i * 18, Math.PI, 0);
        x.stroke();
      }
      x.fillStyle = "#d8d0b8";
      x.font = "bold 26px Georgia, serif";
      x.textAlign = "center";
      x.fillText(
        "WISDOM AND KNOWLEDGE SHALL BE THE STABILITY OF THY TIMES",
        W / 2,
        H - 10,
      );
      K.stains(x, W, H, 8, 41, 0.4);
    });
    K.paint("covenant_banner", 256, 768, (x, W, H) => {
      x.fillStyle = "#6a1a18";
      x.fillRect(0, 0, W, H);
      x.fillStyle = "#1a1a1a";
      x.fillRect(0, 0, W, 40);
      x.fillRect(0, H - 60, W, 60);
      x.fillStyle = "#c8a860";
      x.fillRect(12, 44, W - 24, 5);
      x.fillRect(12, H - 70, W - 24, 5);
      K.covenantEmblem(x, W / 2, H * 0.36, 95, "#e8d8b0");
      x.fillStyle = "#e8d8b0";
      x.font = "bold 27px Georgia, serif";
      x.textAlign = "center";
      x.fillText("FORGED TO", W / 2, H * 0.7);
      x.fillText("ENDURE", W / 2, H * 0.745);
      K.streaks(x, W, H, 24, 42, 0.25);
      K.stains(x, W, H, 8, 43, 0.3);
    });
    K.paint("helipad", 512, 512, (x, W, H) => {
      x.fillStyle = "#5a5a56";
      x.fillRect(0, 0, W, H);
      x.strokeStyle = "#d8c850";
      x.lineWidth = 18;
      x.beginPath();
      x.arc(W / 2, H / 2, W * 0.4, 0, 7);
      x.stroke();
      x.fillStyle = "#e8e4d8";
      x.fillRect(W * 0.34, H * 0.28, 36, H * 0.44);
      x.fillRect(W * 0.66 - 36, H * 0.28, 36, H * 0.44);
      x.fillRect(W * 0.34, H * 0.47, W * 0.32, 32);
      x.strokeStyle = "#e8e4d8";
      x.lineWidth = 8;
      x.strokeRect(10, 10, W - 20, H - 20);
      K.stains(x, W, H, 20, 44, 0.5);
      K.grain(x, W, H, 20, 45);
      x.fillStyle = "rgba(20,20,20,0.5)";
      x.beginPath();
      x.ellipse(W * 0.6, H * 0.4, 90, 60, 0.4, 0, 7);
      x.fill();
    });
    K.paint("covenant_crate", 256, 128, (x, W, H) => {
      x.fillStyle = "#4a5238";
      x.fillRect(0, 0, W, H);
      K.covenantEmblem(x, W * 0.3, H * 0.5, 36, "#d8c890");
      x.fillStyle = "#d8c890";
      x.font = "bold 22px monospace";
      x.fillText("5.56 AMMO", W * 0.5, H * 0.58);
      K.stains(x, W, H, 4, 46, 0.3);
    });
    K.paint("rock_sign", 1024, 128, (x, W, H) =>
      K.signText(x, W, H, "ROCKEFELLER  CENTER", {
        bg: "#1c1a16",
        fg: "#d8b860",
        size: 80,
        spacing: 10,
        font: "Georgia, serif",
      }),
    );
  }

