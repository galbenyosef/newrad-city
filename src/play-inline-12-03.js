// play-inline-12 03 — ctx
// Lines 399-822 of readable/play-inline-12.pretty.js (statement-aligned).
  function drawWindow(ctx, hc, ec, r, o) {
    const { x, y, w, h } = o;
    const reveal = o.reveal === undefined ? Math.max(3, w * 0.07) : o.reveal;
    const frame = o.frame || "#d8d2c0";
    const state = o.state;
    const mc = ec && ec.txMask; // interior-mapping mask (façade atlases only)
    const path = (g, inset) => {
      g.beginPath();
      if (o.arch) {
        const rr = (w - inset * 2) / 2,
          top = y + inset + rr * 0.45;
        g.moveTo(x + inset, y + h - inset);
        g.lineTo(x + inset, top);
        g.quadraticCurveTo(
          x + w / 2,
          y + inset - rr * 0.25,
          x + w - inset,
          top,
        );
        g.lineTo(x + w - inset, y + h - inset);
        g.closePath();
      } else g.rect(x + inset, y + inset, w - inset * 2, h - inset * 2);
    };
    // reveal (deep shadowed jamb, light from upper-left)
    path(ctx, 0);
    ctx.fillStyle = "#1e1a16";
    ctx.fill();
    path(hc, 0);
    hc.fillStyle = "#383838";
    hc.fill();
    const gx = x + reveal,
      gy = y + reveal * 1.2,
      gw = w - reveal * 1.6,
      gh = h - reveal * 1.6;
    ctx.save();
    path(ctx, reveal * 0.8);
    ctx.clip();
    if (mc) {
      mc.save();
      path(mc, reveal * 0.8);
      mc.clip();
    }
    // --- pane content ---
    if (state === "boarded") {
      ctx.fillStyle = "#1a1612";
      ctx.fillRect(x, y, w, h);
      if (mc) {
        mc.fillStyle = MK_HOLE;
        mc.fillRect(x, y, w, h);
      } // slits between the planks show the dark room
      const planks = 3 + ((r() * 3) | 0),
        cols = ["#7a6a52", "#6a5c48", "#86765c", "#5e5242"];
      for (let i = 0; i < planks; i++) {
        const py = gy + (i * gh) / planks + (r() - 0.5) * 3,
          ph = gh / planks - 2;
        const rot = (r() - 0.5) * 0.12;
        if (mc) {
          mc.save();
          mc.translate(gx + gw / 2, py + ph / 2);
          mc.rotate(rot);
          mc.fillStyle = MK_NONE;
          mc.fillRect(-gw * 0.6, -ph / 2, gw * 1.2, ph);
          mc.restore();
        }
        ctx.save();
        ctx.translate(gx + gw / 2, py + ph / 2);
        ctx.rotate(rot);
        ctx.fillStyle = cols[(r() * cols.length) | 0];
        ctx.fillRect(-gw * 0.6, -ph / 2, gw * 1.2, ph);
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.fillRect(-gw * 0.6, ph / 2 - 1.5, gw * 1.2, 1.5);
        ctx.fillStyle = "rgba(40,30,20,0.5)";
        for (let k = 0; k < 3; k++)
          ctx.fillRect(
            -gw * 0.6 + r() * gw,
            -ph / 2 + r() * ph,
            6 + r() * 12,
            0.8,
          );
        ctx.fillStyle = "#2a2622";
        ctx.fillRect(-gw * 0.45, -1, 2, 2);
        ctx.fillRect(gw * 0.42, -1, 2, 2);
        ctx.restore();
      }
      hc.fillStyle = "#9a9a9a";
      hc.fillRect(gx, gy, gw, gh);
    } else if (state === "broken" || state === "burnt" || state === "empty") {
      const g = ctx.createLinearGradient(0, gy, 0, gy + gh);
      g.addColorStop(0, state === "burnt" ? "#0a0806" : "#16120e");
      g.addColorStop(1, state === "burnt" ? "#1a120c" : "#2c241c");
      ctx.fillStyle = g;
      ctx.fillRect(x, y, w, h);
      if (mc) {
        mc.fillStyle = state === "burnt" ? MK_BURNT : MK_HOLE;
        mc.fillRect(x, y, w, h);
      }
      // suggestion of a room: ceiling line, hanging fixture, far wall (only seen where the parallax room fades out)
      ctx.fillStyle = "rgba(80,70,55,0.35)";
      ctx.fillRect(gx, gy + gh * 0.72, gw, gh * 0.28);
      if (r() < 0.5) {
        ctx.strokeStyle = "rgba(90,80,60,0.6)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(gx + gw * 0.5, gy);
        ctx.lineTo(gx + gw * 0.5, gy + gh * 0.2);
        ctx.stroke();
      }
      if (state === "broken") {
        // 1–3 big shards still in the putty at a corner: straight fracture edges (glass breaks in lines, not saw teeth),
        // glass tone with the sky reflection, a bright fracture edge and a hairline crack; the rest is the dark room
        const corners = [
          [gx, gy],
          [gx + gw, gy],
          [gx + gw, gy + gh],
          [gx, gy + gh],
        ];
        const nS = 1 + ((r() * 2.6) | 0);
        const poly = (g, pts) => {
          g.beginPath();
          g.moveTo(pts[0][0], pts[0][1]);
          for (let q = 1; q < pts.length; q++) g.lineTo(pts[q][0], pts[q][1]);
          g.closePath();
        };
        for (let k = 0; k < nS; k++) {
          const ci = (r() * 4) | 0,
            cx0 = corners[ci][0],
            cy0 = corners[ci][1];
          const sx = ci === 0 || ci === 3 ? 1 : -1,
            sy = ci < 2 ? 1 : -1;
          const la = gw * (0.2 + r() * 0.6),
            lb = gh * (0.15 + r() * 0.5),
            m = 1 + ((r() * 3) | 0);
          const pts = [
            [cx0, cy0],
            [cx0 + sx * la, cy0],
          ];
          for (let q = 1; q <= m; q++) {
            const t = q / (m + 1),
              j = (r() - 0.35) * 0.5;
            pts.push([
              cx0 + sx * la * (1 - t) * (1 + j),
              cy0 + sy * lb * t * (1 + j),
            ]);
          }
          pts.push([cx0, cy0 + sy * lb]);
          const g2 = ctx.createLinearGradient(gx, gy, gx + gw * 0.4, gy + gh);
          g2.addColorStop(0, "rgba(124,140,132,0.92)");
          g2.addColorStop(0.45, "rgba(70,84,80,0.92)");
          g2.addColorStop(1, "rgba(34,40,38,0.92)");
          poly(ctx, pts);
          ctx.fillStyle = g2;
          ctx.fill();
          ctx.fillStyle = X.css("#5a4a30", 0.18 + r() * 0.15);
          ctx.fill(); // grime film
          if (mc) {
            poly(mc, pts);
            mc.fillStyle = MK_SHARD;
            mc.fill();
          }
          ctx.strokeStyle = "rgba(228,236,228,0.6)";
          ctx.lineWidth = 0.7;
          ctx.lineJoin = "miter";
          ctx.beginPath();
          ctx.moveTo(pts[1][0], pts[1][1]);
          for (let q = 2; q < pts.length; q++) ctx.lineTo(pts[q][0], pts[q][1]);
          ctx.stroke();
          if (r() < 0.6) {
            const p2 = pts[2];
            ctx.strokeStyle = "rgba(215,225,215,0.4)";
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p2[0], p2[1]);
            ctx.lineTo(
              p2[0] + (cx0 - p2[0]) * (0.35 + r() * 0.4),
              p2[1] + (cy0 - p2[1]) * (0.3 + r() * 0.5) + (r() - 0.5) * 4,
            );
            ctx.stroke();
          }
        }
      }
    } else if (state === "lit") {
      const g = ctx.createRadialGradient(
        gx + gw * 0.5,
        gy + gh * 0.3,
        2,
        gx + gw / 2,
        gy + gh / 2,
        gh,
      );
      // by day a lived-in window is just (cleaner, warmer) glass — the room behind it comes from the interior shader and the
      // glow from the emissive map at night (the old orange paint read as a lit window at noon)
      g.addColorStop(0, "#9a988a");
      g.addColorStop(0.6, "#5e5a4c");
      g.addColorStop(1, "#2a2620");
      ctx.fillStyle = g;
      ctx.fillRect(x, y, w, h);
      if (mc) {
        mc.fillStyle = MK_GLASS_LIT;
        mc.fillRect(x, y, w, h);
      }
      if (r() < 0.25) {
        ctx.fillStyle = "rgba(60,30,10,0.55)";
        if (mc) mc.fillStyle = "rgba(0,0,0,0.7)";
        for (let yy = gy; yy < gy + gh * (0.2 + r() * 0.4); yy += 4) {
          ctx.fillRect(gx, yy, gw, 2);
          if (mc) mc.fillRect(gx, yy, gw, 2);
        }
      }
      ctx.fillStyle = "rgba(40,25,12,0.3)";
      X.rrect(
        ctx,
        gx + gw * (0.1 + r() * 0.4),
        gy + gh * 0.55,
        gw * 0.4,
        gh * 0.45,
        5,
      );
      ctx.fill();
      if (ec) {
        const eg = ec.createRadialGradient(
          (gx + gw * 0.5) / 2,
          (gy + gh * 0.35) / 2,
          1,
          (gx + gw / 2) / 2,
          (gy + gh / 2) / 2,
          gh / 2,
        );
        eg.addColorStop(0, "#fff0c8");
        eg.addColorStop(0.7, "#a86020");
        eg.addColorStop(1, "#301006");
        ec.fillStyle = eg;
        ec.fillRect(gx / 2, gy / 2, gw / 2, gh / 2);
      }
    } else {
      // intact grimy glass reflecting a hazy sky
      const g = ctx.createLinearGradient(gx, gy, gx + gw * 0.4, gy + gh);
      g.addColorStop(0, "#7e8c84");
      g.addColorStop(0.35, "#4a5652");
      g.addColorStop(1, "#1e2422");
      ctx.fillStyle = g;
      ctx.fillRect(x, y, w, h);
      if (mc) {
        mc.fillStyle = MK_GLASS;
        mc.fillRect(x, y, w, h);
      }
      ctx.fillStyle = "rgba(210,220,200,0.12)"; // diagonal highlight streak
      ctx.beginPath();
      ctx.moveTo(gx + gw * 0.2, gy);
      ctx.lineTo(gx + gw * 0.45, gy);
      ctx.lineTo(gx + gw * 0.05, gy + gh);
      ctx.lineTo(gx - gw * 0.2, gy + gh);
      ctx.fill();
      // o.dress (office tenants): a run of windows shares blinds at a similar height / no dressing
      // Dressing painted into the atlas repeats with every tile and hides the fake room — the interior shader adds per-window
      // curtains / blinds (~28 %, keyed on the world position), so only a few atlas windows keep painted ones.
      const dr = o.dress,
        rr = dr
          ? dr.kind === "blind"
            ? 0.1
            : dr.kind === "curtain"
              ? 0.5
              : 0.9
          : r() < 0.88
            ? 0.9
            : r() * 0.6;
      if (rr < 0.35) {
        // blinds partly drawn
        const bl = dr
          ? gh * Math.max(0.08, Math.min(0.6, dr.level + (r() - 0.5) * 0.1))
          : gh * (0.15 + r() * 0.35);
        ctx.fillStyle = X.css(
          dr ? dr.col : r() < 0.5 ? "#c8bc9a" : "#a8a08a",
          0.8,
        );
        ctx.fillRect(gx, gy, gw, bl);
        if (mc) {
          mc.fillStyle = "rgb(14,0,0)";
          mc.fillRect(gx, gy, gw, bl);
        }
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        for (let yy = gy; yy < gy + bl; yy += 3) ctx.fillRect(gx, yy, gw, 1);
        if (r() < (dr ? 0.07 : 0.4)) {
          ctx.save();
          ctx.translate(gx + gw, gy + bl);
          ctx.rotate(-0.25);
          ctx.fillStyle = "rgba(200,190,160,0.8)";
          ctx.fillRect(-gw * 0.6, -3, gw * 0.6, 4);
          ctx.restore();
        } // slipped blind
      } else if (rr < 0.6) {
        // curtains
        const cc = CURTAINS[(r() * CURTAINS.length) | 0];
        ctx.fillStyle = X.css(X.shade(cc, -0.1), 0.85);
        const cw = gw * (0.2 + r() * 0.2),
          cr = cw * (0.6 + r() * 0.6);
        ctx.fillRect(gx, gy, cw, gh);
        ctx.fillRect(gx + gw - cr, gy, cw * 1.2, gh);
        if (mc) {
          mc.fillStyle = "rgb(10,0,0)";
          mc.fillRect(gx, gy, cw, gh);
          mc.fillRect(gx + gw - cr, gy, cw * 1.2, gh);
        }
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        for (let xx = gx; xx < gx + gw; xx += 4) ctx.fillRect(xx, gy, 1, gh);
      }
      // grime film + cracks
      const grime = 0.15 + r() * 0.2;
      ctx.fillStyle = X.css("#5a4a30", grime);
      ctx.fillRect(gx, gy + gh * 0.6, gw, gh * 0.4);
      if (mc) {
        mc.fillStyle = "rgba(0,0,0," + (grime * 0.9).toFixed(3) + ")";
        mc.fillRect(gx, gy + gh * 0.6, gw, gh * 0.4);
      } // grime film: less see-through
      if (r() < (o.crack === undefined ? 0.2 : o.crack))
        crackPane(ctx, r, gx, gy, gw, gh);
      hc.fillStyle = "#404040";
      hc.fillRect(gx, gy, gw, gh);
    }
    ctx.restore();
    if (mc) mc.restore();
    // --- sash frames & muntins ---
    if (state !== "boarded" && state !== "empty" && state !== "burnt") {
      const [pc, pr] = o.panes || [1, 2];
      ctx.strokeStyle = X.css(frame);
      ctx.lineWidth = Math.max(1.5, w * 0.035);
      hc.strokeStyle = "#707070";
      hc.lineWidth = ctx.lineWidth;
      if (mc) {
        mc.strokeStyle = MK_NONE;
        mc.lineWidth = ctx.lineWidth;
      }
      const gs = mc ? [ctx, hc, mc] : [ctx, hc];
      const miss = state === "broken";
      for (let i = 1; i < pc; i++) {
        if (miss && r() < 0.4) continue;
        const xx = gx + (gw * i) / pc;
        for (const g of gs) {
          g.beginPath();
          g.moveTo(xx, gy);
          g.lineTo(xx, gy + gh);
          g.stroke();
        }
      }
      for (let j = 1; j < pr; j++) {
        if (miss && r() < 0.4) continue;
        const yy = gy + (gh * j) / pr;
        for (const g of gs) {
          g.beginPath();
          g.moveTo(gx, yy);
          g.lineTo(gx + gw, yy);
          g.stroke();
        }
      }
      if (o.sash) {
        ctx.lineWidth = Math.max(2.5, w * 0.06);
        ctx.beginPath();
        ctx.moveTo(gx, gy + gh * 0.5);
        ctx.lineTo(gx + gw, gy + gh * 0.5);
        ctx.stroke();
        if (mc) {
          mc.lineWidth = ctx.lineWidth;
          mc.beginPath();
          mc.moveTo(gx, gy + gh * 0.5);
          mc.lineTo(gx + gw, gy + gh * 0.5);
          mc.stroke();
        }
      }
      ctx.lineWidth = Math.max(2, w * 0.05);
      path(ctx, reveal * 0.8);
      ctx.stroke();
      if (mc) {
        mc.lineWidth = ctx.lineWidth;
        path(mc, reveal * 0.8);
        mc.stroke();
      }
      // peeling paint on frames
      ctx.fillStyle = "rgba(60,40,25,0.5)";
      for (let k = 0; k < 4; k++)
        ctx.fillRect(gx + r() * gw, gy + r() * gh, 2 + r() * 3, 1.5);
    }
    // --- 1950s window air-conditioner ---
    if (o.ac && state !== "boarded") {
      const aw = w * 0.62,
        ah = h * 0.2,
        ax = x + (w - aw) / 2,
        ay = y + h * 0.62;
      ctx.fillStyle = "#8c8a80";
      ctx.fillRect(ax, ay, aw, ah);
      if (mc) {
        mc.fillStyle = MK_NONE;
        mc.fillRect(ax, ay, aw, ah + 3);
      }
      ctx.fillStyle = "#5a5850";
      for (let yy = ay + 3; yy < ay + ah - 2; yy += 3)
        ctx.fillRect(ax + 3, yy, aw - 6, 1.2);
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.fillRect(ax, ay + ah, aw, 3);
      ctx.fillStyle = "rgba(110,50,20,0.45)";
      ctx.fillRect(ax + aw * 0.3, ay + ah, 3, h * 0.35); // rust drip
      hc.fillStyle = "#e0e0e0";
      hc.fillRect(ax, ay, aw, ah);
    }
    // soot plume above a burnt window
    if (state === "burnt") {
      const sg = ctx.createRadialGradient(
        x + w / 2,
        y,
        2,
        x + w / 2,
        y - h * 0.3,
        h * 0.9,
      );
      sg.addColorStop(0, "rgba(8,6,4,0.85)");
      sg.addColorStop(0.5, "rgba(15,12,10,0.4)");
      sg.addColorStop(1, "rgba(20,18,15,0)");
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.moveTo(x - w * 0.1, y + h * 0.3);
      ctx.quadraticCurveTo(x - w * 0.3, y - h * 0.6, x + w / 2, y - h * 1.1);
      ctx.quadraticCurveTo(x + w * 1.3, y - h * 0.6, x + w * 1.1, y + h * 0.3);
      ctx.closePath();
      ctx.fill();
    }
  }
