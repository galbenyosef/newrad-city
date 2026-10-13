// play-inline-262 03 — ctx
// Lines 133-650 of readable/play-inline-262.pretty.js (statement-aligned).
  D.masterTex = function () {
    return P.canvasTex("ues_masters", 1024, 1024, (ctx, w, h) => {
      const r = P.rng("masters");
      const cw = w / 4,
        ch = h / 4;
      const scenes = [
        (x, y) => {
          // 0 Delft interior: mistress in yellow jacket + maid with a letter
          ctx.fillStyle = "#1a1712";
          ctx.fillRect(x, y, cw, ch);
          const g = ctx.createRadialGradient(
            x + cw * 0.2,
            y + ch * 0.3,
            5,
            x + cw * 0.3,
            y + ch * 0.4,
            cw * 0.8,
          );
          g.addColorStop(0, "rgba(220,200,150,0.35)");
          g.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = g;
          ctx.fillRect(x, y, cw, ch);
          ctx.fillStyle = "#2c3a58";
          ctx.fillRect(x, y + ch * 0.72, cw, ch * 0.28); // table cloth
          figure(ctx, x + cw * 0.36, y + ch * 0.46, cw * 0.55, {
            body: "#d8b030",
            collar: "#f0ead8",
            skin: "#e8c8a8",
            hair: "#6a4a2a",
          });
          ctx.fillStyle = "#d8b030";
          for (let i = 0; i < 12; i++) {
            ctx.fillStyle = "#f4f0e0";
            ctx.fillRect(x + cw * 0.22 + i * 5, y + ch * 0.58, 2, 2);
          }
          figure(ctx, x + cw * 0.72, y + ch * 0.44, cw * 0.5, {
            body: "#6a5038",
            skin: "#c89a78",
            collar: "#c8b898",
          });
          ctx.fillStyle = "#f0ead0";
          ctx.fillRect(x + cw * 0.62, y + ch * 0.52, cw * 0.08, ch * 0.05); // the letter
          ctx.fillStyle = "#c8c0b0";
          ctx.beginPath();
          ctx.arc(x + cw * 0.2, y + ch * 0.8, 8, 0, TAU);
          ctx.fill(); // pearl box / jug
        },
        (x, y) => {
          // 1 self-portrait, gold light out of darkness
          ctx.fillStyle = "#140e08";
          ctx.fillRect(x, y, cw, ch);
          const g = ctx.createRadialGradient(
            x + cw * 0.5,
            y + ch * 0.4,
            5,
            x + cw * 0.5,
            y + ch * 0.5,
            cw * 0.6,
          );
          g.addColorStop(0, "rgba(200,140,60,0.45)");
          g.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = g;
          ctx.fillRect(x, y, cw, ch);
          figure(ctx, x + cw * 0.5, y + ch * 0.5, cw * 0.9, {
            body: "#b88a2a",
            collar: "#8a2a1a",
            skin: "#d8a060",
            hat: "#1a120a",
          });
          ctx.fillStyle = "#6a1a10";
          ctx.fillRect(x + cw * 0.3, y + ch * 0.78, cw * 0.4, ch * 0.06); // sash
          ctx.fillStyle = "#3a2410";
          ctx.fillRect(x + cw * 0.46, y + ch * 0.82, cw * 0.05, ch * 0.18); // cane
        },
        (x, y) => {
          // 2 saint in the desert: rocky cliffs, brown robe, golden light, blue sky
          const g = ctx.createLinearGradient(0, y, 0, y + ch);
          g.addColorStop(0, "#5a8ac8");
          g.addColorStop(0.5, "#d8e0d8");
          g.addColorStop(0.51, "#b8a070");
          g.addColorStop(1, "#6a5a38");
          ctx.fillStyle = g;
          ctx.fillRect(x, y, cw, ch);
          ctx.fillStyle = "#8a7a5a";
          ctx.beginPath();
          ctx.moveTo(x, y + ch);
          ctx.lineTo(x, y + ch * 0.25);
          ctx.lineTo(x + cw * 0.18, y + ch * 0.18);
          ctx.lineTo(x + cw * 0.34, y + ch * 0.45);
          ctx.lineTo(x + cw * 0.3, y + ch);
          ctx.fill();
          ctx.fillStyle = "#9a8a60";
          ctx.beginPath();
          ctx.moveTo(x + cw * 0.6, y + ch * 0.55);
          ctx.lineTo(x + cw * 0.8, y + ch * 0.3);
          ctx.lineTo(x + cw, y + ch * 0.4);
          ctx.lineTo(x + cw, y + ch * 0.62);
          ctx.fill();
          ctx.fillStyle = "#e8d8a0";
          ctx.fillRect(x + cw * 0.7, y + ch * 0.3, cw * 0.08, ch * 0.05);
          ctx.fillRect(x + cw * 0.82, y + ch * 0.28, cw * 0.05, ch * 0.08); // hill town
          figure(ctx, x + cw * 0.5, y + ch * 0.58, cw * 0.5, {
            body: "#5a3a22",
            skin: "#d8b090",
            full: false,
          });
          ctx.strokeStyle = "#3a2a1a";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(x + cw * 0.35, y + ch * 0.62);
          ctx.lineTo(x + cw * 0.38, y + ch * 0.48);
          ctx.moveTo(x + cw * 0.65, y + ch * 0.62);
          ctx.lineTo(x + cw * 0.62, y + ch * 0.48);
          ctx.stroke(); // outstretched arms
          const s = ctx.createRadialGradient(
            x + cw * 0.05,
            y + ch * 0.05,
            2,
            x + cw * 0.05,
            y + ch * 0.05,
            cw * 0.5,
          );
          s.addColorStop(0, "rgba(255,240,180,0.7)");
          s.addColorStop(1, "rgba(255,240,180,0)");
          ctx.fillStyle = s;
          ctx.fillRect(x, y, cw, ch);
          ctx.fillStyle = "#4a6a2a";
          ctx.beginPath();
          ctx.arc(x + cw * 0.2, y + ch * 0.2, 12, 0, TAU);
          ctx.fill(); // laurel
          ctx.fillStyle = "#8a8a88";
          ctx.beginPath();
          ctx.ellipse(x + cw * 0.85, y + ch * 0.8, 12, 7, 0, 0, TAU);
          ctx.fill(); // donkey
        },
        (x, y) => {
          // 3 Tudor statesman: green ground, fur collar, red velvet sleeves, gold chain
          ctx.fillStyle = "#1e4a3a";
          ctx.fillRect(x, y, cw, ch);
          ctx.fillStyle = "#7a1a1a";
          ctx.fillRect(x, y, cw * 0.18, ch * 0.5); // curtain
          figure(ctx, x + cw * 0.5, y + ch * 0.44, cw * 0.95, {
            body: "#2a1a12",
            collar: "#5a4030",
            skin: "#d8a888",
            hat: "#141010",
          });
          ctx.fillStyle = "#8a1e1a";
          ctx.fillRect(x + cw * 0.18, y + ch * 0.72, cw * 0.18, ch * 0.28);
          ctx.fillRect(x + cw * 0.64, y + ch * 0.72, cw * 0.18, ch * 0.28);
          ctx.strokeStyle = "#d8b040";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(x + cw * 0.5, y + ch * 0.46, cw * 0.16, 0.2, PI - 0.2);
          ctx.stroke();
          ctx.fillStyle = "#d8b040";
          ctx.beginPath();
          ctx.arc(x + cw * 0.5, y + ch * 0.64, 6, 0, TAU);
          ctx.fill();
        },
        (x, y) => {
          // 4 golden harbour at dawn
          const g = ctx.createLinearGradient(0, y, 0, y + ch);
          g.addColorStop(0, "#e8c070");
          g.addColorStop(0.5, "#f4e0a0");
          g.addColorStop(0.6, "#a89868");
          g.addColorStop(1, "#5a5a48");
          ctx.fillStyle = g;
          ctx.fillRect(x, y, cw, ch);
          const s = ctx.createRadialGradient(
            x + cw * 0.55,
            y + ch * 0.42,
            2,
            x + cw * 0.55,
            y + ch * 0.42,
            cw * 0.4,
          );
          s.addColorStop(0, "rgba(255,250,220,0.95)");
          s.addColorStop(1, "rgba(255,240,200,0)");
          ctx.fillStyle = s;
          ctx.fillRect(x, y, cw, ch);
          for (let i = 0; i < 4; i++) {
            const sx = x + cw * (0.1 + i * 0.22),
              sy = y + ch * (0.55 + (i % 2) * 0.06);
            ctx.fillStyle = "rgba(60,40,30,0.7)";
            ctx.fillRect(sx, sy, cw * 0.12, ch * 0.04);
            ctx.fillRect(sx + cw * 0.05, sy - ch * 0.25, 2, ch * 0.25);
            ctx.fillStyle = "rgba(230,210,170,0.6)";
            ctx.fillRect(sx + cw * 0.01, sy - ch * 0.2, cw * 0.04, ch * 0.14);
          }
        },
        (x, y) => {
          // 5 rococo garden: pink & green, lovers, frothy trees
          ctx.fillStyle = "#9ab8a8";
          ctx.fillRect(x, y, cw, ch);
          for (let i = 0; i < 40; i++) {
            ctx.fillStyle = ["#5a7a4a", "#7a9a5a", "#4a6a3a", "#a8b878"][i % 4];
            ctx.beginPath();
            ctx.arc(x + r() * cw, y + r() * ch * 0.6, 14 + r() * 24, 0, TAU);
            ctx.fill();
          }
          ctx.fillStyle = "#d8c8a8";
          ctx.fillRect(x + cw * 0.62, y + ch * 0.2, cw * 0.1, ch * 0.5); // statue plinth
          figure(ctx, x + cw * 0.35, y + ch * 0.55, cw * 0.4, {
            body: "#f0b8b8",
            skin: "#f0d0b8",
            hair: "#c8a878",
            full: true,
          });
          figure(ctx, x + cw * 0.52, y + ch * 0.55, cw * 0.38, {
            body: "#d8a040",
            skin: "#e0b898",
            hair: "#6a4a2a",
            full: true,
          });
          for (let i = 0; i < 30; i++) {
            ctx.fillStyle = "rgba(255,200,210,0.6)";
            ctx.beginPath();
            ctx.arc(x + r() * cw, y + r() * ch * 0.5, 3, 0, TAU);
            ctx.fill();
          }
        },
        (x, y) => {
          // 6 full-length society lady in grey
          ctx.fillStyle = "#3a3a38";
          ctx.fillRect(x, y, cw, ch);
          const g = ctx.createLinearGradient(x, 0, x + cw, 0);
          g.addColorStop(0, "rgba(0,0,0,0.3)");
          g.addColorStop(1, "rgba(90,90,85,0.3)");
          ctx.fillStyle = g;
          ctx.fillRect(x, y, cw, ch);
          figure(ctx, x + cw * 0.5, y + ch * 0.3, cw * 0.45, {
            body: "#8a8a88",
            skin: "#e8d0c0",
            hair: "#2a2018",
            full: true,
            collar: "#c8c8c0",
          });
          ctx.fillStyle = "#1a1a1a";
          ctx.fillRect(x + cw * 0.2, y + ch * 0.9, cw * 0.6, ch * 0.1);
        },
        (x, y) => {
          // 7 king in red and silver
          ctx.fillStyle = "#2a2420";
          ctx.fillRect(x, y, cw, ch);
          figure(ctx, x + cw * 0.5, y + ch * 0.38, cw * 0.62, {
            body: "#a82a22",
            collar: "#e0dcd0",
            skin: "#e8c0a0",
            hair: "#c8a060",
          });
          for (let i = 0; i < 20; i++) {
            ctx.fillStyle = "rgba(230,230,230,0.7)";
            ctx.fillRect(
              x + cw * (0.34 + r() * 0.32),
              y + ch * (0.45 + r() * 0.4),
              3,
              6,
            );
          }
          ctx.fillStyle = "#1a1410";
          ctx.fillRect(x + cw * 0.7, y + ch * 0.6, cw * 0.05, ch * 0.3);
        },
        (x, y) => {
          // 8 Dutch village with water mill
          const g = ctx.createLinearGradient(0, y, 0, y + ch);
          g.addColorStop(0, "#a8b8c8");
          g.addColorStop(0.45, "#e8e0c8");
          g.addColorStop(0.46, "#5a6a3a");
          g.addColorStop(1, "#3a4a28");
          ctx.fillStyle = g;
          ctx.fillRect(x, y, cw, ch);
          for (let i = 0; i < 12; i++) {
            ctx.fillStyle = "#3a4a2a";
            ctx.beginPath();
            ctx.arc(
              x + cw * (0.5 + r() * 0.5),
              y + ch * (0.25 + r() * 0.2),
              12 + r() * 14,
              0,
              TAU,
            );
            ctx.fill();
          }
          ctx.fillStyle = "#8a4a2a";
          ctx.fillRect(x + cw * 0.12, y + ch * 0.4, cw * 0.28, ch * 0.2);
          ctx.fillStyle = "#5a2a1a";
          ctx.beginPath();
          ctx.moveTo(x + cw * 0.1, y + ch * 0.4);
          ctx.lineTo(x + cw * 0.26, y + ch * 0.28);
          ctx.lineTo(x + cw * 0.42, y + ch * 0.4);
          ctx.fill();
          ctx.strokeStyle = "#4a3a2a";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(x + cw * 0.44, y + ch * 0.58, 16, 0, TAU);
          ctx.stroke();
          ctx.fillStyle = "#6a7a88";
          ctx.fillRect(x, y + ch * 0.7, cw, ch * 0.1);
        },
        (x, y) => {
          // 9 the forge — dark, three smiths, orange heat
          ctx.fillStyle = "#16100c";
          ctx.fillRect(x, y, cw, ch);
          const s = ctx.createRadialGradient(
            x + cw * 0.5,
            y + ch * 0.7,
            2,
            x + cw * 0.5,
            y + ch * 0.7,
            cw * 0.4,
          );
          s.addColorStop(0, "rgba(255,160,60,0.9)");
          s.addColorStop(1, "rgba(255,120,30,0)");
          ctx.fillStyle = s;
          ctx.fillRect(x, y, cw, ch);
          for (const fx of [0.28, 0.5, 0.72])
            figure(ctx, x + cw * fx, y + ch * 0.45, cw * 0.36, {
              body: "#4a3a2a",
              skin: "#b87850",
              full: true,
            });
          ctx.strokeStyle = "#2a2018";
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(x + cw * 0.3, y + ch * 0.35);
          ctx.lineTo(x + cw * 0.45, y + ch * 0.2);
          ctx.stroke();
        },
        (x, y) => {
          // 10 elongated figures, cold blues and acid yellows
          ctx.fillStyle = "#2a3448";
          ctx.fillRect(x, y, cw, ch);
          for (let i = 0; i < 7; i++)
            figure(
              ctx,
              x + cw * (0.12 + i * 0.13),
              y + ch * (0.3 + (i % 2) * 0.05),
              cw * 0.3,
              {
                body: ["#c8c030", "#3a5a9a", "#b83a2a", "#6a8a4a"][i % 4],
                skin: "#c8a888",
                full: true,
              },
            );
          ctx.fillStyle = "rgba(230,230,210,0.2)";
          ctx.fillRect(x, y, cw, ch * 0.2);
        },
        (x, y) => {
          // 11 comtesse in blue satin
          ctx.fillStyle = "#3a3830";
          ctx.fillRect(x, y, cw, ch);
          ctx.fillStyle = "#8a7a5a";
          ctx.fillRect(x + cw * 0.72, y, cw * 0.28, ch); // mirror frame
          figure(ctx, x + cw * 0.42, y + ch * 0.4, cw * 0.62, {
            body: "#4a70a8",
            skin: "#f0dcc8",
            hair: "#3a2418",
          });
          ctx.fillStyle = "rgba(255,255,255,0.3)";
          for (let i = 0; i < 6; i++)
            ctx.fillRect(
              x + cw * (0.25 + r() * 0.3),
              y + ch * (0.5 + r() * 0.4),
              2,
              14,
            );
        },
        (x, y) => {
          // 12 the founder, dark suit, white moustache
          ctx.fillStyle = "#241c14";
          ctx.fillRect(x, y, cw, ch);
          figure(ctx, x + cw * 0.5, y + ch * 0.46, cw * 0.95, {
            body: "#16120e",
            collar: "#e8e4d8",
            skin: "#d8b098",
            hair: "#e8e4dc",
          });
          ctx.fillStyle = "#f0ece4";
          ctx.beginPath();
          ctx.ellipse(
            x + cw * 0.5,
            y + ch * 0.36,
            cw * 0.06,
            ch * 0.02,
            0,
            0,
            TAU,
          );
          ctx.fill(); // moustache
          ctx.fillStyle = "#8a6a2a";
          ctx.fillRect(x + cw * 0.56, y + ch * 0.62, 3, ch * 0.06); // watch chain
        },
        (x, y) => {
          // 13 atomic-age commission: rocket over a gleaming city (Civil Defense lobby art)
          const g = ctx.createLinearGradient(0, y, 0, y + ch);
          g.addColorStop(0, "#1a3a6a");
          g.addColorStop(1, "#e8a860");
          ctx.fillStyle = g;
          ctx.fillRect(x, y, cw, ch);
          for (let i = 0; i < 9; i++) {
            ctx.fillStyle = ["#e8e0c8", "#c8d8e8", "#a8c0d8"][i % 3];
            const bw = cw * 0.08,
              bh = ch * (0.2 + r() * 0.4);
            ctx.fillRect(x + (i * cw) / 9, y + ch - bh, bw, bh);
          }
          ctx.fillStyle = "#d83a2a";
          ctx.beginPath();
          ctx.ellipse(
            x + cw * 0.6,
            y + ch * 0.32,
            cw * 0.05,
            ch * 0.16,
            0.5,
            0,
            TAU,
          );
          ctx.fill();
          ctx.fillStyle = "#f4d060";
          ctx.beginPath();
          ctx.moveTo(x + cw * 0.52, y + ch * 0.46);
          ctx.lineTo(x + cw * 0.42, y + ch * 0.62);
          ctx.lineTo(x + cw * 0.5, y + ch * 0.5);
          ctx.fill();
        },
        (x, y) => {
          // 14 slashed canvas (a portrait, knifed, raider tag)
          ctx.fillStyle = "#3a2c20";
          ctx.fillRect(x, y, cw, ch);
          figure(ctx, x + cw * 0.5, y + ch * 0.45, cw * 0.8, {
            body: "#2a1e16",
            skin: "#c8a080",
            collar: "#d8d0c0",
          });
          ctx.strokeStyle = "#0a0806";
          ctx.lineWidth = 7;
          for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(x + cw * (0.2 + i * 0.2), y + ch * 0.1);
            ctx.lineTo(x + cw * (0.35 + i * 0.2), y + ch * 0.9);
            ctx.stroke();
          }
          ctx.fillStyle = "#c42a1e";
          ctx.font = "bold 42px Impact, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("MINE", x + cw / 2, y + ch * 0.58);
        },
        (x, y) => {
          // 15 formal portrait of a Valet butler, bow tie, gilt chair
          ctx.fillStyle = "#2a2a24";
          ctx.fillRect(x, y, cw, ch);
          ctx.fillStyle = "#6a1a1a";
          ctx.fillRect(x, y, cw, ch * 0.18);
          ctx.fillStyle = "#9aa0a0";
          ctx.beginPath();
          ctx.arc(x + cw * 0.5, y + ch * 0.5, cw * 0.2, 0, TAU);
          ctx.fill();
          const g = ctx.createRadialGradient(
            x + cw * 0.45,
            y + ch * 0.45,
            2,
            x + cw * 0.5,
            y + ch * 0.5,
            cw * 0.2,
          );
          g.addColorStop(0, "rgba(255,255,255,0.5)");
          g.addColorStop(1, "rgba(0,0,0,0.3)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(x + cw * 0.5, y + ch * 0.5, cw * 0.2, 0, TAU);
          ctx.fill();
          for (const a of [-0.5, 0, 0.5]) {
            ctx.strokeStyle = "#7a8080";
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(x + cw * 0.5, y + ch * 0.35);
            ctx.lineTo(x + cw * (0.5 + a * 0.4), y + ch * 0.15);
            ctx.stroke();
            ctx.fillStyle = "#e8e8d8";
            ctx.beginPath();
            ctx.arc(x + cw * (0.5 + a * 0.4), y + ch * 0.15, 7, 0, TAU);
            ctx.fill();
          }
          ctx.fillStyle = "#101010";
          ctx.beginPath();
          ctx.moveTo(x + cw * 0.42, y + ch * 0.68);
          ctx.lineTo(x + cw * 0.5, y + ch * 0.72);
          ctx.lineTo(x + cw * 0.42, y + ch * 0.76);
          ctx.moveTo(x + cw * 0.58, y + ch * 0.68);
          ctx.lineTo(x + cw * 0.5, y + ch * 0.72);
          ctx.lineTo(x + cw * 0.58, y + ch * 0.76);
          ctx.fill();
          ctx.fillStyle = "#ffb040";
          ctx.beginPath();
          ctx.moveTo(x + cw * 0.46, y + ch * 0.74);
          ctx.lineTo(x + cw * 0.54, y + ch * 0.74);
          ctx.lineTo(x + cw * 0.5, y + ch * 0.92);
          ctx.fill();
        },
      ];
      scenes.forEach((f, i) => {
        const x = (i % 4) * cw,
          y = Math.floor(i / 4) * ch;
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, cw, ch);
        ctx.clip();
        try {
          f(x, y);
        } catch (e) {
          /* keep atlas */
        }
        varnish(ctx, x, y, cw, ch, r, i === 13 ? 0.5 : 1);
        ctx.restore();
      });
    });
  };
  /** Framed Old Master (cell 0..15), facing ry (0 → +z). o: {frame, ft, deep}. */
