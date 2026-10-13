// play-inline-61 04 — rng
// Lines 566-879 of readable/play-inline-61.pretty.js (statement-aligned).
  function makeDecalAtlas() {
    const S = 256,
      N = 4;
    const cv = document.createElement("canvas");
    cv.width = cv.height = S * N;
    const g = cv.getContext("2d");
    const rng = G.util.rng(777);
    function cell(k, fn) {
      const x = (k % N) * S,
        y = Math.floor(k / N) * S;
      g.save();
      g.beginPath();
      g.rect(x, y, S, S);
      g.clip();
      g.translate(x + S / 2, y + S / 2);
      fn();
      g.restore();
    }
    function blob(r, col, alpha, n) {
      g.fillStyle = col;
      for (let i = 0; i < (n || 1); i++) {
        g.globalAlpha = alpha;
        g.beginPath();
        const pts = 12;
        for (let p = 0; p < pts; p++) {
          const a = (p / pts) * Math.PI * 2,
            rr = r * (0.7 + rng() * 0.45);
          p
            ? g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr)
            : g.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
        }
        g.closePath();
        g.fill();
      }
      g.globalAlpha = 1;
    }
    function rad(r, stops) {
      const gr = g.createRadialGradient(0, 0, 0, 0, 0, r);
      stops.forEach((s) => gr.addColorStop(s[0], s[1]));
      g.fillStyle = gr;
      g.beginPath();
      g.arc(0, 0, r, 0, Math.PI * 2);
      g.fill();
    }
    function cracks(n, len, col, w) {
      g.strokeStyle = col;
      g.lineWidth = w;
      for (let i = 0; i < n; i++) {
        let a = rng() * Math.PI * 2,
          x = 0,
          y = 0;
        g.beginPath();
        g.moveTo(0, 0);
        const segs = 4 + ((rng() * 4) | 0);
        for (let s = 0; s < segs; s++) {
          a += (rng() - 0.5) * 0.9;
          const l = (len / segs) * (0.6 + rng() * 0.8);
          x += Math.cos(a) * l;
          y += Math.sin(a) * l;
          g.lineTo(x, y);
        }
        g.stroke();
      }
    }
    // 0 bullet concrete: chipped light halo, dark hole, radial cracks
    cell(0, () => {
      rad(110, [
        [0, "rgba(210,205,190,0.55)"],
        [0.5, "rgba(190,185,170,0.25)"],
        [1, "rgba(190,185,170,0)"],
      ]);
      cracks(7, 90, "rgba(40,36,30,0.6)", 3);
      blob(34, "#1a1712", 0.95);
      rad(22, [
        [0, "rgba(0,0,0,1)"],
        [1, "rgba(0,0,0,0.6)"],
      ]);
    });
    // 1 bullet metal: dimple with bright rim
    cell(1, () => {
      rad(80, [
        [0, "rgba(40,36,32,0.9)"],
        [0.45, "rgba(90,86,80,0.7)"],
        [0.6, "rgba(210,205,195,0.6)"],
        [1, "rgba(120,110,100,0)"],
      ]);
      rad(26, [
        [0, "rgba(5,5,5,1)"],
        [1, "rgba(20,20,20,0.9)"],
      ]);
    });
    // 2 scorch: big soot burst
    cell(2, () => {
      for (let i = 0; i < 26; i++) {
        g.save();
        g.rotate(rng() * 6.28);
        g.translate(rng() * 40, 0);
        rad(60 + rng() * 60, [
          [0, "rgba(8,6,4,0.55)"],
          [1, "rgba(8,6,4,0)"],
        ]);
        g.restore();
      }
      for (let i = 0; i < 18; i++) {
        g.save();
        g.rotate(rng() * 6.28);
        g.fillStyle = "rgba(10,8,6,0.35)";
        g.fillRect(20, -3, 80 + rng() * 40, 6);
        g.restore();
      }
    });
    // 3 blood red / 4 blood green / 8 oil / 9 goo : splats with droplets
    function splat(k, core, edge, glowCol) {
      cell(k, () => {
        blob(60, core, 0.92, 1);
        blob(46, edge, 0.5, 2);
        for (let i = 0; i < 22; i++) {
          const a = rng() * 6.28,
            d = 60 + rng() * 60,
            r = 3 + rng() * 11;
          g.globalAlpha = 0.85;
          g.fillStyle = core;
          g.beginPath();
          g.arc(Math.cos(a) * d, Math.sin(a) * d, r, 0, 6.28);
          g.fill();
        }
        for (let i = 0; i < 6; i++) {
          const a = rng() * 6.28;
          g.save();
          g.rotate(a);
          g.fillStyle = core;
          g.globalAlpha = 0.8;
          g.beginPath();
          g.ellipse(70, 0, 30 + rng() * 25, 5 + rng() * 5, 0, 0, 6.28);
          g.fill();
          g.restore();
        }
        g.globalAlpha = 1;
        if (glowCol)
          rad(70, [
            [0, glowCol],
            [1, "rgba(0,0,0,0)"],
          ]);
      });
    }
    splat(3, "#5a0906", "#7a100a");
    splat(4, "#3c5a0c", "#5c8a18");
    // 5 laser burn: dark pit + hot rim (emissive handled in shader)
    cell(5, () => {
      rad(70, [
        [0, "rgba(10,6,4,1)"],
        [0.35, "rgba(30,14,8,0.9)"],
        [0.6, "rgba(120,50,20,0.6)"],
        [1, "rgba(60,30,20,0)"],
      ]);
      cracks(5, 50, "rgba(20,10,5,0.7)", 2);
    });
    // 6 plasma burn: molten green-edged crater
    cell(6, () => {
      rad(95, [
        [0, "rgba(12,16,8,1)"],
        [0.4, "rgba(30,50,15,0.9)"],
        [0.65, "rgba(90,150,40,0.55)"],
        [1, "rgba(40,60,20,0)"],
      ]);
      blob(30, "#0c0f08", 0.9);
    });
    // 7 crack
    cell(7, () => {
      cracks(9, 120, "rgba(25,22,18,0.85)", 4);
      cracks(12, 70, "rgba(25,22,18,0.6)", 2);
    });
    splat(8, "#0c0b09", "#1e1a14");
    splat(9, "#46b02a", "#6ade3a");
    // 10 small scorch
    cell(10, () => {
      rad(120, [
        [0, "rgba(6,5,4,0.85)"],
        [0.5, "rgba(12,10,8,0.5)"],
        [1, "rgba(12,10,8,0)"],
      ]);
    });
    // 11 blood smear (drag)
    cell(11, () => {
      g.fillStyle = "#5a0906";
      for (let i = 0; i < 9; i++) {
        g.globalAlpha = 0.25 + rng() * 0.35;
        g.fillRect(
          -110 + rng() * 20,
          -50 + i * 11 + rng() * 4,
          200 + rng() * 20,
          6 + rng() * 6,
        );
      }
      g.globalAlpha = 0.9;
      blob(34, "#5a0906", 0.9);
      g.globalAlpha = 1;
    });
    // 12 bullet wood: splintered
    cell(12, () => {
      for (let i = 0; i < 10; i++) {
        g.save();
        g.rotate(rng() * 6.28);
        g.fillStyle = "rgba(200,170,120,0.6)";
        g.fillRect(10, -3, 40 + rng() * 40, 5);
        g.restore();
      }
      blob(28, "#140e08", 0.95);
    });
    // 13 wet puddle
    cell(13, () => {
      blob(110, "rgba(20,24,22,1)", 0.45, 2);
    });
    // 14 dirt splat
    cell(14, () => {
      blob(80, "#3a3020", 0.6, 3);
      for (let i = 0; i < 30; i++) {
        const a = rng() * 6.28,
          d = 60 + rng() * 60;
        g.fillStyle = "rgba(60,50,35,0.7)";
        g.beginPath();
        g.arc(Math.cos(a) * d, Math.sin(a) * d, 2 + rng() * 6, 0, 6.28);
        g.fill();
      }
    });
    // 15 radioactive puddle
    cell(15, () => {
      blob(100, "#2c5a14", 0.8, 2);
      rad(90, [
        [0, "rgba(120,255,60,0.6)"],
        [1, "rgba(60,160,30,0)"],
      ]);
    });
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    tex.needsUpdate = true;
    return tex;
  }

  function initDecals() {
    const geo = new THREE.PlaneGeometry(1, 1);
    geo.setAttribute("dUv", geo.attributes.uv.clone());
    decAttr = new THREE.InstancedBufferAttribute(
      new Float32Array(DEC_CAP * 4),
      4,
    );
    decAttr.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute("aDecal", decAttr);
    const tex = makeDecalAtlas();
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.85,
      metalness: 0.0,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -4,
    });
    mat.name = "atmos_decals";
    mat.onBeforeCompile = (sh) => {
      sh.uniforms.uDecalMap = { value: tex };
      sh.vertexShader = sh.vertexShader
        .replace(
          "#include <common>",
          "#include <common>\nattribute vec4 aDecal; attribute vec2 dUv; varying vec4 vDecal; varying vec2 vDUv;",
        )
        .replace(
          "#include <begin_vertex>",
          "#include <begin_vertex>\nvDecal = aDecal; vDUv = (vec2(mod(aDecal.x, 4.0), 3.0 - floor(aDecal.x / 4.0)) + dUv) / 4.0;",
        );
      sh.fragmentShader = sh.fragmentShader
        .replace(
          "#include <common>",
          "#include <common>\nuniform sampler2D uDecalMap; varying vec4 vDecal; varying vec2 vDUv;",
        )
        .replace(
          "#include <map_fragment>",
          "vec4 dcol = texture2D(uDecalMap, vDUv); diffuseColor.rgb *= dcol.rgb; diffuseColor.a *= dcol.a * vDecal.y; if (diffuseColor.a < 0.01) discard;",
        )
        .replace(
          "#include <emissivemap_fragment>",
          `#include <emissivemap_fragment>
          float cell = vDecal.x;
          vec3 heatCol = (cell > 4.5 && cell < 5.5) ? vec3(3.2, 0.9, 0.2) : ((cell > 5.5 && cell < 6.5) || cell > 8.5) ? vec3(0.6, 2.6, 0.3) : vec3(2.2, 0.9, 0.3);
          float rim = (cell > 4.5 && cell < 6.5) ? smoothstep(0.05, 0.45, 1.0 - dcol.r * 2.0) : 1.0;
          totalEmissiveRadiance += heatCol * vDecal.z * dcol.a * vDecal.y * rim;`,
        );
    };
    mat.customProgramCacheKey = () => "atmos_decals_v1";
    decMesh = new THREE.InstancedMesh(geo, mat, DEC_CAP);
    decMesh.name = "atmos_decals";
    decMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    decMesh.count = 0;
    decMesh.frustumCulled = false;
    decMesh.receiveShadow = true;
    decMesh.castShadow = false;
    decMesh.renderOrder = 5;
    G.scene.add(decMesh);
    for (let i = 0; i < DEC_CAP; i++)
      decMeta.push({ born: -1e9, life: 0, heat: 0, alpha: 0 });
  }
  const _m = new THREE.Matrix4(),
    _q = new THREE.Quaternion(),
    _q2 = new THREE.Quaternion(),
    _s = new THREE.Vector3(),
    _n = new THREE.Vector3(),
    _p = new THREE.Vector3();
  const _z = new THREE.Vector3(0, 0, 1);
  /**
   * Place a decal. kind: bullet|bullet_metal|bullet_wood|scorch|scorch_small|blood|blood_green|oil|goo|laser|plasma|crack|puddle|dirt|rad_puddle
   * opts: {size, life (s, default 240), heat (0..1 emissive glow that cools), rot}
   */
