// play-inline-241 02 — ctx
// Lines 16-351 of readable/play-inline-241.pretty.js (statement-aligned).
  const PR = G._pr;
  const U = G.util;
  const TAU = Math.PI * 2;
  const HP = Math.PI / 2;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

  // -------------------------------------------------------------------
  // Custom canvas textures (world-projected materials)
  // -------------------------------------------------------------------
  function tileWall(ctx, w, h) {
    const r = U.rng(771);
    const n = 16,
      s = w / n;
    ctx.fillStyle = "#8a8676";
    ctx.fillRect(0, 0, w, h); // grout
    for (let j = 0; j < n; j++)
      for (let i = 0; i < n; i++) {
        const miss = r() < 0.035;
        const base = miss ? 70 : 200 + (r() - 0.5) * 22;
        const g = miss ? 60 : base - 4,
          bl = miss ? 52 : base - 16;
        ctx.fillStyle =
          "rgb(" + (base | 0) + "," + (g | 0) + "," + (bl | 0) + ")";
        ctx.fillRect(i * s + 1.5, j * s + 1.5, s - 3, s - 3);
        if (!miss && r() < 0.12) {
          ctx.strokeStyle = "rgba(40,36,30,0.5)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(i * s + r() * s, j * s);
          ctx.lineTo(i * s + r() * s, j * s + s);
          ctx.stroke();
        }
        // glaze highlight
        if (!miss) {
          ctx.fillStyle = "rgba(255,255,250,0.18)";
          ctx.fillRect(i * s + 3, j * s + 3, s * 0.4, 2);
        }
      }
    // rust tears & mildew
    for (let k = 0; k < 26; k++) {
      const x = r() * w,
        y = r() * h * 0.6,
        len = 40 + r() * 200;
      const gr = ctx.createLinearGradient(x, y, x, y + len);
      gr.addColorStop(0, "rgba(110,70,30,0.45)");
      gr.addColorStop(1, "rgba(110,70,30,0)");
      ctx.fillStyle = gr;
      ctx.fillRect(x, y, 3 + r() * 6, len);
    }
    for (let k = 0; k < 40; k++) {
      ctx.fillStyle = "rgba(50,60,30," + (0.05 + r() * 0.15) + ")";
      ctx.beginPath();
      ctx.ellipse(
        r() * w,
        h - r() * h * 0.5,
        10 + r() * 50,
        6 + r() * 30,
        0,
        0,
        TAU,
      );
      ctx.fill();
    }
  }
  function checker(ctx, w, h) {
    const r = U.rng(4411);
    const n = 8,
      s = w / n;
    for (let j = 0; j < n; j++)
      for (let i = 0; i < n; i++) {
        const dark = (i + j) % 2 === 0;
        const v = dark ? 38 + r() * 14 : 176 + r() * 20;
        ctx.fillStyle = dark
          ? "rgb(" + (v | 0) + "," + ((v + 6) | 0) + "," + ((v + 2) | 0) + ")"
          : "rgb(" + (v | 0) + "," + ((v - 4) | 0) + "," + ((v - 20) | 0) + ")";
        ctx.fillRect(i * s, j * s, s, s);
        if (r() < 0.1) {
          ctx.fillStyle = "rgba(90,80,60,0.6)";
          ctx.fillRect(
            i * s + r() * s * 0.5,
            j * s + r() * s * 0.5,
            s * 0.5,
            s * 0.4,
          );
        } // lifted tile
      }
    for (let k = 0; k < 60; k++) {
      ctx.fillStyle = "rgba(30,24,16," + (0.05 + r() * 0.2) + ")";
      ctx.beginPath();
      ctx.ellipse(
        r() * w,
        r() * h,
        8 + r() * 60,
        6 + r() * 40,
        r() * 3,
        0,
        TAU,
      );
      ctx.fill();
    }
  }
  function padded(ctx, w, h) {
    const r = U.rng(1839);
    ctx.fillStyle = "#b8b09a";
    ctx.fillRect(0, 0, w, h);
    const s = 64;
    for (let y = 0; y < h; y += s)
      for (let x = 0; x < w; x += s) {
        const g = ctx.createRadialGradient(
          x + s / 2,
          y + s / 2,
          4,
          x + s / 2,
          y + s / 2,
          s * 0.72,
        );
        g.addColorStop(0, "rgba(235,228,205,0.9)");
        g.addColorStop(1, "rgba(110,100,80,0.9)");
        ctx.fillStyle = g;
        ctx.fillRect(x, y, s, s);
        ctx.fillStyle = "#4a4232";
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, TAU);
        ctx.fill(); // button
      }
    for (let k = 0; k < 30; k++) {
      ctx.fillStyle = "rgba(70,40,20," + (0.08 + r() * 0.25) + ")";
      ctx.beginPath();
      ctx.ellipse(
        r() * w,
        r() * h,
        6 + r() * 40,
        4 + r() * 60,
        r() * 3,
        0,
        TAU,
      );
      ctx.fill();
    }
    // scratch marks
    ctx.strokeStyle = "rgba(60,30,20,0.55)";
    ctx.lineWidth = 2;
    for (let k = 0; k < 6; k++) {
      const x = r() * w,
        y = r() * h;
      for (let f = 0; f < 4; f++) {
        ctx.beginPath();
        ctx.moveTo(x + f * 7, y);
        ctx.lineTo(x + f * 7 + 10, y + 50 + r() * 30);
        ctx.stroke();
      }
    }
  }
  function gneissDraw(o) {
    // coursed rubble of the island's own grey gneiss, bigger & paler than schist
    return function (ctx, w, h) {
      const r = U.rng(o.seed || 7);
      ctx.fillStyle = o.mortar;
      ctx.fillRect(0, 0, w, h);
      const rows = o.rows;
      const rh = h / rows;
      for (let j = 0; j < rows; j++) {
        let x = -r() * 60;
        while (x < w) {
          const bw = 50 + r() * 90,
            bh = rh * (0.78 + r() * 0.18);
          const v = (r() - 0.5) * o.vary;
          const c = [
            o.base[0] * (1 + v),
            o.base[1] * (1 + v),
            o.base[2] * (1 + v * 1.1),
          ];
          ctx.fillStyle =
            "rgb(" + (c[0] | 0) + "," + (c[1] | 0) + "," + (c[2] | 0) + ")";
          const y = j * rh + (rh - bh) / 2 + (r() - 0.5) * 3;
          ctx.beginPath();
          ctx.moveTo(x + 3 + r() * 4, y + r() * 3);
          ctx.lineTo(x + bw - 3 - r() * 4, y + r() * 4);
          ctx.lineTo(x + bw - 1 - r() * 3, y + bh - r() * 4);
          ctx.lineTo(x + 2 + r() * 4, y + bh - r() * 3);
          ctx.closePath();
          ctx.fill();
          // mica banding
          ctx.strokeStyle = "rgba(30,30,32,0.18)";
          ctx.lineWidth = 1;
          for (let k = 0; k < 3; k++) {
            const yy = y + bh * (0.2 + r() * 0.6);
            ctx.beginPath();
            ctx.moveTo(x + 4, yy);
            ctx.lineTo(x + bw - 4, yy + (r() - 0.5) * 6);
            ctx.stroke();
          }
          x += bw + 3;
        }
      }
      // soot & rain streaks
      for (let k = 0; k < 60; k++) {
        ctx.fillStyle = "rgba(20,20,18," + (0.04 + r() * 0.12) + ")";
        ctx.beginPath();
        ctx.ellipse(r() * w, r() * h, 10 + r() * 50, 8 + r() * 40, 0, 0, TAU);
        ctx.fill();
      }
      for (let k = 0; k < 40; k++) {
        const x = r() * w;
        ctx.fillStyle = "rgba(20,20,18," + (0.06 + r() * 0.08) + ")";
        ctx.fillRect(x, r() * h * 0.5, 2 + r() * 4, 60 + r() * 200);
      }
    };
  }
  function brickInt(ctx, w, h) {
    const r = U.rng(99);
    ctx.fillStyle = "#5a4a3e";
    ctx.fillRect(0, 0, w, h);
    const rows = 16,
      rh = h / rows,
      bw = w / 4;
    for (let j = 0; j < rows; j++) {
      const off = ((j % 2) * bw) / 2;
      for (let i = -1; i < 5; i++) {
        const v = (r() - 0.5) * 0.3;
        ctx.fillStyle =
          "rgb(" +
          ((120 + v * 120) | 0) +
          "," +
          ((66 + v * 60) | 0) +
          "," +
          ((48 + v * 40) | 0) +
          ")";
        ctx.fillRect(i * bw + off + 2, j * rh + 2, bw - 4, rh - 4);
      }
    }
    for (let k = 0; k < 40; k++) {
      ctx.fillStyle = "rgba(210,206,190," + (0.03 + r() * 0.06) + ")";
      ctx.beginPath();
      ctx.ellipse(
        r() * w,
        h * (0.6 + r() * 0.4),
        10 + r() * 30,
        4 + r() * 12,
        0,
        0,
        TAU,
      );
      ctx.fill();
    } // efflorescence (low on the wall)
    for (let k = 0; k < 40; k++) {
      ctx.fillStyle = "rgba(15,12,10," + (0.06 + r() * 0.2) + ")";
      ctx.beginPath();
      ctx.ellipse(r() * w, r() * h, 10 + r() * 50, 6 + r() * 30, 0, 0, TAU);
      ctx.fill();
    }
  }
  function plasterOld(ctx, w, h) {
    const r = U.rng(5150);
    ctx.fillStyle = "#c9c3b2";
    ctx.fillRect(0, 0, w, h);
    const img = ctx.getImageData(0, 0, w, h),
      d = img.data;
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const n = U.fbm2(x / 70, y / 70, 4),
          m = U.fbm2(x / 9 + 50, y / 9, 2);
        const k = (n - 0.5) * 40 + (m - 0.5) * 14,
          i = (y * w + x) * 4;
        d[i] += k;
        d[i + 1] += k;
        d[i + 2] += k * 0.9;
      }
    ctx.putImageData(img, 0, 0);
    // water stains: soft tide rings running down from the top
    for (let k = 0; k < 5; k++) {
      const x = r() * w,
        ww = 30 + r() * 90,
        hh = 80 + r() * 260;
      const g = ctx.createLinearGradient(0, 0, 0, hh);
      g.addColorStop(0, "rgba(120,96,60,0.22)");
      g.addColorStop(0.8, "rgba(120,96,60,0.07)");
      g.addColorStop(1, "rgba(120,96,60,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(x, 0, ww / 2, hh, 0, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "rgba(90,70,40,0.25)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(x, 0, ww / 2, hh * 0.92, 0, 0.2, Math.PI - 0.2);
      ctx.stroke();
    }
    // hairline cracks
    ctx.strokeStyle = "rgba(60,54,44,0.55)";
    ctx.lineWidth = 1.2;
    for (let k = 0; k < 10; k++) {
      let x = r() * w,
        y = r() * h,
        a = r() * TAU;
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let j = 0; j < 12; j++) {
        a += (r() - 0.5) * 0.9;
        x += Math.cos(a) * 12;
        y += Math.sin(a) * 12;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    // a few spalled patches showing the lath / brick behind
    for (let k = 0; k < 1; k++) {
      const x = r() * w,
        y = r() * h,
        rw = 14 + r() * 20,
        rh = 10 + r() * 14;
      ctx.fillStyle = "rgba(110,82,62,0.9)";
      ctx.beginPath();
      ctx.ellipse(x, y, rw, rh, r() * 3, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "rgba(70,52,40,0.9)";
      ctx.lineWidth = 2;
      for (let j = -3; j <= 3; j++) {
        ctx.beginPath();
        ctx.moveTo(x - rw * 0.8, y + j * 6);
        ctx.lineTo(x + rw * 0.8, y + j * 6);
        ctx.stroke();
      }
      ctx.strokeStyle = "rgba(230,224,208,0.6)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(x, y, rw + 2, rh + 2, 0, 0, TAU);
      ctx.stroke();
    }
    // dado grime at the bottom
    const g2 = ctx.createLinearGradient(0, h * 0.75, 0, h);
    g2.addColorStop(0, "rgba(40,34,26,0)");
    g2.addColorStop(1, "rgba(40,34,26,0.3)");
    ctx.fillStyle = g2;
    ctx.fillRect(0, h * 0.75, w, h * 0.25);
  }
