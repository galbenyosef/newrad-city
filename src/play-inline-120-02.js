// play-inline-120 02 — fillstyle
// Lines 20-123 of readable/play-inline-120.pretty.js (statement-aligned).
  const K = G.LMA.kit;

  const SEC = { x0: 314, x1: 325, z0: -352, z1: -320, h: 80 };

  function textures() {
    K.facade("fac_un_glass", {
      bays: 12,
      floors: 12,
      bayW: 1.6,
      floorH: 3.3,
      wall: "#9aa4a2",
      glass: "#4a8480",
      frame: "#b8c2c0",
      blocks: false,
      win: { x0: 0.07, x1: 0.93, y0: 0.08, y1: 0.95 },
      broken: 0.2,
      boarded: 0.0,
      mullions: 0,
      transom: false,
      seed: 1952,
      deco: (x, W, H, fy, y0, fh) => {
        x.fillStyle = "rgba(40,70,70,0.35)";
        x.fillRect(0, y0 + fh * 0.9, W, fh * 0.1);
      },
    });
    K.paint("continuity_banner", 256, 768, (x, W, H) => {
      x.fillStyle = "#16181c";
      x.fillRect(0, 0, W, H);
      x.fillStyle = "#a01c26";
      x.fillRect(0, 0, W, 26);
      x.fillRect(0, H - 26, W, 26);
      // the Continuity's seal: a gold ring round a single white star, the motto, and the year they still live in
      x.strokeStyle = "#d8b040";
      x.lineWidth = 10;
      x.beginPath();
      x.arc(W / 2, H * 0.3, 92, 0, 7);
      x.stroke();
      x.lineWidth = 3;
      x.beginPath();
      x.arc(W / 2, H * 0.3, 76, 0, 7);
      x.stroke();
      K.star(x, W / 2, H * 0.3, 56, 22, "#e8e4d8");
      x.fillStyle = "#e8e4d8";
      x.font = "bold 30px Georgia, serif";
      x.textAlign = "center";
      x.fillText("ORDER", W / 2, H * 0.5);
      x.fillText("ENDURES", W / 2, H * 0.55);
      x.fillStyle = "#d8b040";
      x.font = "bold 64px Georgia, serif";
      x.fillText("1967", W / 2, H * 0.66);
      for (let i = 0; i < 3; i++) {
        x.fillStyle = i % 2 ? "#e8e4d8" : "#a01c26";
        x.fillRect(30, H * 0.72 + i * 34, W - 60, 24);
      }
      K.streaks(x, W, H, 20, 5, 0.2);
    });
    K.paint("un_sign", 1024, 128, (x, W, H) =>
      K.signText(x, W, H, "UNITED NATIONS", {
        bg: "#dfe4e6",
        fg: "#3a6a9a",
        size: 80,
        spacing: 12,
        font: "Georgia, serif",
      }),
    );
    K.paint("continuity_warn", 512, 128, (x, W, H) => {
      K.signText(x, W, H, "RESTRICTED — CONTINUITY", {
        bg: "#16181c",
        fg: "#e8e4d8",
        size: 50,
        border: "#a01c26",
      });
    });
    // force-field (additive animated)
    const c = K.canvas(128, 256),
      x = c.getContext("2d");
    const g = x.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, "rgba(90,170,255,0.1)");
    g.addColorStop(0.5, "rgba(90,170,255,0.45)");
    g.addColorStop(1, "rgba(90,170,255,0.1)");
    x.fillStyle = g;
    x.fillRect(0, 0, 128, 256);
    x.strokeStyle = "rgba(160,220,255,0.6)";
    x.lineWidth = 1.5;
    for (let i = 0; i < 256; i += 8) {
      x.beginPath();
      x.moveTo(0, i);
      x.lineTo(128, i + 16);
      x.stroke();
    }
    const t = K.texFromCanvas(c);
    K.ffTex = t;
    K.defineMat("force_field", {
      basic: true,
      map: t,
      color: 0x7ab8ff,
      transparent: true,
      additive: true,
      side: THREE.DoubleSide,
      toneMapped: false,
      noShadow: true,
    });
  }

