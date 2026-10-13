// play-inline-59 02 — math
// Lines 19-367 of readable/play-inline-59.pretty.js (statement-aligned).
  const A = G.atmos._;

  // ------------------------------------------------------------------
  // Atlas frames
  // ------------------------------------------------------------------
  const FR = (A.FR = {
    GLOW: 0,
    SMOKE1: 1,
    SMOKE2: 2,
    SMOKE3: 3,
    STREAK: 4,
    STAR: 5,
    FLAME_SIDE: 6,
    FLAME: 7,
    DEBRIS: 8,
    DROP: 9,
    DUST: 10,
    RING: 11,
    FLAKE: 12,
    RAIN: 13,
    ARC: 14,
    SPLASH: 15,
  });

  function makeAtlas() {
    const S = 128,
      N = 4;
    const cv = document.createElement("canvas");
    cv.width = cv.height = S * N;
    const g = cv.getContext("2d");
    const rng = G.util.rng(4242);
    const cell = (f) => [(f % N) * S, Math.floor(f / N) * S];
    function radial(cx, cy, r, stops) {
      const gr = g.createRadialGradient(cx, cy, 0, cx, cy, r);
      for (const s of stops) gr.addColorStop(s[0], s[1]);
      g.fillStyle = gr;
      g.beginPath();
      g.arc(cx, cy, r, 0, Math.PI * 2);
      g.fill();
    }
    function withCell(f, fn) {
      const [x, y] = cell(f);
      g.save();
      g.beginPath();
      g.rect(x, y, S, S);
      g.clip();
      g.translate(x, y);
      fn();
      g.restore();
    }
    // soft round mask: blobs that spill over the 128 px cell would otherwise be cut by the cell
    // border → smoke/dust/flame billboards showed hard straight (vertical) edges on screen
    function softMask(f, r0, r1, cy) {
      const [x, y] = cell(f);
      g.save();
      g.beginPath();
      g.rect(x, y, S, S);
      g.clip();
      g.globalCompositeOperation = "destination-in";
      const gr = g.createRadialGradient(
        x + 64,
        y + (cy || 64),
        0,
        x + 64,
        y + (cy || 64),
        64,
      );
      gr.addColorStop(0, "rgba(0,0,0,1)");
      gr.addColorStop(r0, "rgba(0,0,0,1)");
      gr.addColorStop(r1, "rgba(0,0,0,0)");
      gr.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = gr;
      g.fillRect(x, y, S, S);
      g.restore();
    }
    // GLOW
    withCell(FR.GLOW, () =>
      radial(64, 64, 64, [
        [0, "rgba(255,255,255,1)"],
        [0.18, "rgba(255,255,255,0.75)"],
        [0.45, "rgba(255,255,255,0.22)"],
        [1, "rgba(255,255,255,0)"],
      ]),
    );
    // SMOKE puffs: many soft blobs with a lit top-left
    function smoke(f, blobs, spread, rad, seedShift) {
      withCell(f, () => {
        for (let i = 0; i < blobs; i++) {
          const a = rng() * Math.PI * 2,
            d = Math.pow(rng(), 0.7) * spread;
          const x = 64 + Math.cos(a) * d,
            y = 64 + Math.sin(a) * d;
          const r = rad * (0.45 + rng() * 0.7);
          const shade = Math.round(
            175 +
              80 *
                Math.max(
                  0,
                  Math.min(
                    1,
                    0.6 - (x - 64 + y - 64) / 110 + (rng() - 0.5) * 0.3,
                  ),
                ),
          );
          radial(x, y, r, [
            [0, `rgba(${shade},${shade},${shade},${0.22 + rng() * 0.18})`],
            [0.6, `rgba(${shade},${shade},${shade},${0.08 + seedShift})`],
            [1, `rgba(${shade},${shade},${shade},0)`],
          ]);
        }
      });
    }
    smoke(FR.SMOKE1, 34, 30, 26, 0.02);
    smoke(FR.SMOKE2, 46, 32, 22, 0.03);
    smoke(FR.SMOKE3, 26, 36, 19, 0.01);
    for (const f of [FR.SMOKE1, FR.SMOKE2, FR.SMOKE3]) softMask(f, 0.45, 0.97);
    // STREAK (vertical soft line, fades at both ends; head = top)
    withCell(FR.STREAK, () => {
      const gr = g.createLinearGradient(0, 0, 0, 128);
      gr.addColorStop(0, "rgba(255,255,255,0)");
      gr.addColorStop(0.15, "rgba(255,255,255,1)");
      gr.addColorStop(1, "rgba(255,255,255,0)");
      for (let w = 18; w >= 2; w -= 4) {
        g.globalAlpha = 0.25 + (18 - w) / 24;
        g.fillStyle = gr;
        g.fillRect(64 - w / 2, 0, w, 128);
      }
      g.globalAlpha = 1;
    });
    // STAR (muzzle flash front)
    withCell(FR.STAR, () => {
      radial(64, 64, 40, [
        [0, "rgba(255,255,255,1)"],
        [0.3, "rgba(255,255,255,0.7)"],
        [1, "rgba(255,255,255,0)"],
      ]);
      const spikes = 7;
      for (let i = 0; i < spikes; i++) {
        const a = (i / spikes) * Math.PI * 2 + rng() * 0.4,
          len = 40 + rng() * 22,
          w = 5 + rng() * 5;
        g.save();
        g.translate(64, 64);
        g.rotate(a);
        const gr = g.createLinearGradient(0, 0, len, 0);
        gr.addColorStop(0, "rgba(255,255,255,0.95)");
        gr.addColorStop(1, "rgba(255,255,255,0)");
        g.fillStyle = gr;
        g.beginPath();
        g.moveTo(0, -w);
        g.lineTo(len, 0);
        g.lineTo(0, w);
        g.closePath();
        g.fill();
        g.restore();
      }
    });
    // FLAME_SIDE (muzzle side cone, pointing up = +v)
    withCell(FR.FLAME_SIDE, () => {
      for (let i = 0; i < 16; i++) {
        const y = 110 - i * 6.5,
          r = 22 - i * 1.1 + rng() * 5;
        radial(64 + (rng() - 0.5) * 8, y, Math.max(4, r), [
          [0, "rgba(255,255,255,0.55)"],
          [1, "rgba(255,255,255,0)"],
        ]);
      }
    });
    // FLAME (fire tongue)
    withCell(FR.FLAME, () => {
      for (let i = 0; i < 26; i++) {
        const t = i / 26,
          y = 108 - t * 92,
          r = (1 - t) * 30 + 5 + rng() * 6;
        radial(64 + Math.sin(t * 7 + rng()) * 8 * t, y, r, [
          [0, `rgba(255,255,255,${0.45 - t * 0.2})`],
          [1, "rgba(255,255,255,0)"],
        ]);
      }
    });
    // DEBRIS chunk
    withCell(FR.DEBRIS, () => {
      g.translate(64, 64);
      const n = 7;
      g.beginPath();
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2,
          r = 28 + rng() * 26;
        if (i) g.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        else g.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      g.closePath();
      const gr = g.createLinearGradient(-40, -40, 40, 40);
      gr.addColorStop(0, "#fff");
      gr.addColorStop(1, "#777");
      g.fillStyle = gr;
      g.fill();
      g.strokeStyle = "rgba(40,40,40,0.8)";
      g.lineWidth = 3;
      g.stroke();
    });
    // DROP (liquid droplet)
    withCell(FR.DROP, () => {
      radial(64, 64, 44, [
        [0, "rgba(255,255,255,1)"],
        [0.7, "rgba(235,235,235,0.95)"],
        [1, "rgba(200,200,200,0)"],
      ]);
      radial(52, 50, 12, [
        [0, "rgba(255,255,255,0.9)"],
        [1, "rgba(255,255,255,0)"],
      ]);
    });
    // DUST (soft low-contrast)
    withCell(FR.DUST, () => {
      for (let i = 0; i < 30; i++) {
        const a = rng() * 6.28,
          d = rng() * 36;
        radial(64 + Math.cos(a) * d, 64 + Math.sin(a) * d, 22 + rng() * 18, [
          [0, "rgba(255,255,255,0.14)"],
          [1, "rgba(255,255,255,0)"],
        ]);
      }
    });
    softMask(FR.DUST, 0.4, 0.97);
    softMask(FR.FLAME, 0.5, 0.98, 70);
    softMask(FR.FLAME_SIDE, 0.55, 0.98);
    // RING
    withCell(FR.RING, () => {
      const gr = g.createRadialGradient(64, 64, 30, 64, 64, 62);
      gr.addColorStop(0, "rgba(255,255,255,0)");
      gr.addColorStop(0.6, "rgba(255,255,255,0.9)");
      gr.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = gr;
      g.fillRect(0, 0, 128, 128);
    });
    // FLAKE (ash / ember)
    withCell(FR.FLAKE, () => {
      g.translate(64, 64);
      g.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2,
          r = 22 + rng() * 26;
        if (i) g.lineTo(Math.cos(a) * r, Math.sin(a) * r * 0.6);
        else g.moveTo(Math.cos(a) * r, Math.sin(a) * r * 0.6);
      }
      g.closePath();
      g.fillStyle = "rgba(255,255,255,0.95)";
      g.fill();
    });
    // RAIN streak (thin)
    withCell(FR.RAIN, () => {
      // full cell width (the quad's width IS the drop width; an 8 px line made rain sub-pixel and invisible)
      const gr = g.createLinearGradient(0, 0, 0, 128);
      gr.addColorStop(0, "rgba(255,255,255,0)");
      gr.addColorStop(0.35, "rgba(255,255,255,0.9)");
      gr.addColorStop(0.75, "rgba(255,255,255,0.7)");
      gr.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = gr;
      g.fillRect(0, 0, 128, 128);
      g.globalCompositeOperation = "destination-in";
      const gx = g.createLinearGradient(0, 0, 128, 0);
      gx.addColorStop(0, "rgba(0,0,0,0)");
      gx.addColorStop(0.5, "rgba(0,0,0,1)");
      gx.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = gx;
      g.fillRect(0, 0, 128, 128);
      g.globalCompositeOperation = "source-over";
    });
    // ARC (electric zigzag)
    withCell(FR.ARC, () => {
      g.strokeStyle = "rgba(255,255,255,1)";
      g.shadowColor = "white";
      g.shadowBlur = 8;
      g.lineWidth = 3;
      for (let k = 0; k < 2; k++) {
        g.beginPath();
        let x = 64,
          y = 2;
        g.moveTo(x, y);
        while (y < 126) {
          y += 8 + rng() * 10;
          x = 64 + (rng() - 0.5) * 44;
          g.lineTo(x, y);
        }
        g.stroke();
        g.lineWidth = 1.5;
      }
    });
    // SPLASH (crown ring)
    withCell(FR.SPLASH, () => {
      g.strokeStyle = "rgba(255,255,255,0.9)";
      g.lineWidth = 6;
      g.beginPath();
      g.ellipse(64, 80, 44, 16, 0, 0, Math.PI * 2);
      g.stroke();
      for (let i = 0; i < 9; i++) {
        const a = rng() * Math.PI * 2;
        radial(64 + Math.cos(a) * 42, 76 + Math.sin(a) * 14 - rng() * 30, 5, [
          [0, "rgba(255,255,255,1)"],
          [1, "rgba(255,255,255,0)"],
        ]);
      }
    });
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.NoColorSpace;
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
    return tex;
  }

  // ------------------------------------------------------------------
  // Shaders
  // ------------------------------------------------------------------
  const VERT = `
    attribute vec4 iPos;    // xyz, size
    attribute vec4 iCol;    // rgb, alpha
    attribute vec4 iMisc;   // rot, frame, stretch (s), lit
    attribute vec3 iVel;
    varying vec2 vUv; varying vec4 vCol; varying float vLit; varying float vSoftR;
    varying float vSoftZ;
    #include <fog_pars_vertex>
    void main(){
      vec4 mv = modelViewMatrix * vec4(iPos.xyz, 1.0);
      float size = iPos.w;
      vec2 q = position.xy;
      if (iMisc.z > 0.0) {
        vec3 vv = (modelViewMatrix * vec4(iVel, 0.0)).xyz;
        vec2 d = vv.xy; float L = length(d);
        vec2 dir = L > 1e-5 ? d / L : vec2(0.0, 1.0);
        vec2 perp = vec2(dir.y, -dir.x);   // (perp, dir) must be a proper rotation: the mirrored basis flipped the winding and FrontSide culled every streak
        float len = size + L * iMisc.z;
        mv.xy += dir * (q.y - 0.5) * len + perp * q.x * size;
      } else {
        float c = cos(iMisc.x), s = sin(iMisc.x);
        mv.xy += vec2(c * q.x - s * q.y, s * q.x + c * q.y) * size;
      }
      gl_Position = projectionMatrix * mv;
      float f = iMisc.y;
      vec2 cell = vec2(mod(f, 4.0), 3.0 - floor(f / 4.0));
      vUv = (cell + (q + 0.5)) / 4.0;
      vCol = iCol; vLit = iMisc.w;
      vSoftZ = -mv.z; vSoftR = iMisc.z > 0.0 ? 0.0 : size * 0.3;   // soft-particle fade range (streaks stay crisp)
      vec4 mvPosition = mv;
      #include <fog_vertex>
    }
  `;
