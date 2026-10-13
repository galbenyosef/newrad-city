// play-inline-198 03 — math
// Lines 46-339 of readable/play-inline-198.pretty.js (statement-aligned).
  const TAU = Math.PI * 2;
  const U = () => G.util;

  // ------------------------------------------------------------------
  // unit geometries (cloned per use — kit builders may consume them)
  // ------------------------------------------------------------------
  const GEO = {};
  function rockGeo(v) {
    const k = "rock" + v;
    if (GEO[k]) return GEO[k];
    const g = new THREE.IcosahedronGeometry(0.5, 0);
    const p = g.attributes.position,
      r = U().rng(911 + v * 37);
    // weld-free jitter: identical positions get identical offsets (keyed by rounded position)
    const off = new Map();
    for (let i = 0; i < p.count; i++) {
      const key =
        Math.round(p.getX(i) * 100) +
        "," +
        Math.round(p.getY(i) * 100) +
        "," +
        Math.round(p.getZ(i) * 100);
      let o = off.get(key);
      if (!o) {
        o = 0.72 + r() * 0.5;
        off.set(key, o);
      }
      p.setXYZ(i, p.getX(i) * o, p.getY(i) * o, p.getZ(i) * o);
    }
    g.computeVertexNormals();
    return (GEO[k] = g);
  }
  const box = () => GEO.box || (GEO.box = new THREE.BoxGeometry(1, 1, 1));
  const plane = () =>
    GEO.plane ||
    (GEO.plane = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2)); // faces +Y
  const planeDown = () =>
    GEO.planeD ||
    (GEO.planeD = new THREE.PlaneGeometry(1, 1).rotateX(Math.PI / 2)); // faces -Y
  const cyl = () =>
    GEO.cyl || (GEO.cyl = new THREE.CylinderGeometry(0.5, 0.5, 1, 7, 1));
  const bottle = () =>
    GEO.bottle ||
    (GEO.bottle = new THREE.LatheGeometry(
      [
        [0.001, 0],
        [0.5, 0],
        [0.5, 0.62],
        [0.2, 0.8],
        [0.17, 1],
        [0.001, 1],
      ].map((q) => new THREE.Vector2(q[0], q[1])),
      7,
    ));
  function holeGeo(seed) {
    const k = "hole" + seed;
    if (GEO[k]) return GEO[k];
    const r = U().rng(4441 + seed),
      n = 14,
      pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU,
        rr = 0.36 + r() * 0.16;
      pts.push(new THREE.Vector2(Math.cos(a) * rr, Math.sin(a) * rr));
    }
    const g = new THREE.ShapeGeometry(new THREE.Shape(pts)).rotateX(
      Math.PI / 2,
    ); // normal −Y (seen from below)
    return (GEO[k] = g);
  }
  const _m = new THREE.Matrix4(),
    _q = new THREE.Quaternion(),
    _e = new THREE.Euler(),
    _p = new THREE.Vector3(),
    _s = new THREE.Vector3();
  function M(x, y, z, rx, ry, rz, sx, sy, sz) {
    _e.set(rx || 0, ry || 0, rz || 0, "YXZ");
    _q.setFromEuler(_e);
    return new THREE.Matrix4().compose(
      _p.set(x, y, z),
      _q,
      _s.set(sx, sy === undefined ? sx : sy, sz === undefined ? sx : sz),
    );
  }

  // ------------------------------------------------------------------
  // decal atlas: 4×2 cells (256²): 0 blood, 1 drag trail, 2 scorch, 3 stain, 4 puddle, 5 cracks, 6 scraps, 7 drift
  // ------------------------------------------------------------------
  let decalMat = null;
  function getDecalMat() {
    if (decalMat) return decalMat;
    const W = 1024,
      H = 512,
      C = 256;
    const cv = document.createElement("canvas");
    cv.width = W;
    cv.height = H;
    const x = cv.getContext("2d");
    const r = U().rng(77);
    const blob = (cx, cy, rds, col, a) => {
      const g = x.createRadialGradient(cx, cy, 0, cx, cy, rds);
      g.addColorStop(0, col + a + ")");
      g.addColorStop(1, col + "0)");
      x.fillStyle = g;
      x.beginPath();
      x.arc(cx, cy, rds, 0, TAU);
      x.fill();
    };
    const cell = (i, fn) => {
      const ox = (i % 4) * C,
        oy = Math.floor(i / 4) * C;
      x.save();
      x.beginPath();
      x.rect(ox, oy, C, C);
      x.clip();
      x.translate(ox, oy);
      fn();
      x.restore();
    };
    // 0 blood splat
    cell(0, () => {
      for (let k = 0; k < 14; k++)
        blob(
          128 + (r() - 0.5) * 70,
          128 + (r() - 0.5) * 70,
          18 + r() * 42,
          "rgba(70,6,4,",
          0.55 + r() * 0.35,
        );
      x.fillStyle = "rgba(55,4,3,0.85)";
      for (let k = 0; k < 40; k++) {
        const a = r() * TAU,
          d = 50 + r() * 70;
        x.beginPath();
        x.arc(
          128 + Math.cos(a) * d,
          128 + Math.sin(a) * d,
          1 + r() * 5,
          0,
          TAU,
        );
        x.fill();
      }
      for (let k = 0; k < 7; k++) {
        const a = r() * TAU;
        x.strokeStyle = "rgba(60,5,3,0.7)";
        x.lineWidth = 2 + r() * 4;
        x.beginPath();
        x.moveTo(128, 128);
        x.lineTo(
          128 + Math.cos(a) * (70 + r() * 50),
          128 + Math.sin(a) * (70 + r() * 50),
        );
        x.stroke();
      }
    });
    // 1 drag trail (runs along v)
    cell(1, () => {
      for (let y = 8; y < 248; y += 3) {
        const w = 26 + Math.sin(y * 0.05) * 8 + r() * 10,
          a = 0.25 + 0.5 * (1 - y / 256) + r() * 0.15;
        x.fillStyle = "rgba(62,6,4," + a.toFixed(2) + ")";
        for (let s = 0; s < 3; s++)
          x.fillRect(
            128 - w / 2 + (r() - 0.5) * 16 + s * 9 - 9,
            y,
            5 + r() * 7,
            4,
          );
      }
      blob(128, 30, 40, "rgba(58,5,3,", 0.8);
    });
    // 2 scorch
    cell(2, () => {
      blob(128, 128, 120, "rgba(8,6,5,", 0.9);
      for (let k = 0; k < 12; k++)
        blob(
          128 + (r() - 0.5) * 120,
          128 + (r() - 0.5) * 120,
          20 + r() * 30,
          "rgba(20,14,10,",
          0.5,
        );
    });
    // 3 water / grime stain (ring)
    cell(3, () => {
      blob(128, 128, 118, "rgba(48,40,26,", 0.45);
      x.strokeStyle = "rgba(40,30,18,0.35)";
      for (let k = 0; k < 4; k++) {
        x.lineWidth = 3 + r() * 6;
        x.beginPath();
        x.ellipse(
          128,
          128,
          70 + k * 12 + r() * 6,
          60 + k * 11 + r() * 6,
          r(),
          0,
          TAU,
        );
        x.stroke();
      }
    });
    // 4 dark puddle (irregular)
    cell(4, () => {
      for (let k = 0; k < 10; k++)
        blob(
          128 + (r() - 0.5) * 110,
          128 + (r() - 0.5) * 80,
          30 + r() * 50,
          "rgba(14,16,12,",
          0.75,
        );
    });
    // 5 cracks
    cell(5, () => {
      x.strokeStyle = "rgba(12,10,8,0.85)";
      const crack = (px, py, a, len, w) => {
        if (len < 8 || w < 0.4) return;
        x.lineWidth = w;
        x.beginPath();
        x.moveTo(px, py);
        const nx = px + Math.cos(a) * len,
          ny = py + Math.sin(a) * len;
        x.lineTo(nx, ny);
        x.stroke();
        crack(nx, ny, a + (r() - 0.5) * 1.1, len * 0.7, w * 0.75);
        if (r() < 0.45)
          crack(nx, ny, a + (r() - 0.5) * 2.4, len * 0.5, w * 0.55);
      };
      for (let k = 0; k < 5; k++)
        crack(128, 128, r() * TAU, 30 + r() * 20, 3.5);
    });
    // 6 paper scraps / confetti of litter
    cell(6, () => {
      for (let k = 0; k < 26; k++) {
        x.save();
        x.translate(20 + r() * 216, 20 + r() * 216);
        x.rotate(r() * TAU);
        const t = 150 + r() * 70;
        x.fillStyle =
          "rgba(" +
          (t | 0) +
          "," +
          ((t * 0.94) | 0) +
          "," +
          ((t * 0.78) | 0) +
          ",0.95)";
        x.fillRect(-10 - r() * 10, -7 - r() * 8, 18 + r() * 18, 12 + r() * 14);
        x.restore();
      }
    });
    // 7 dirt drift (dense at v=0 edge = the wall side)
    cell(7, () => {
      for (let y = 0; y < 256; y += 2) {
        const a = Math.pow(1 - y / 256, 1.6) * 0.8;
        x.fillStyle = "rgba(52,44,32," + a.toFixed(3) + ")";
        x.fillRect(0, y, 256, 2);
      }
      for (let k = 0; k < 400; k++) {
        x.fillStyle = "rgba(30,26,20," + (r() * 0.6).toFixed(2) + ")";
        const yy = Math.pow(r(), 2) * 160;
        x.fillRect(r() * 256, yy, 2 + r() * 4, 2 + r() * 3);
      }
    });
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace || tex.colorSpace;
    tex.anisotropy = 4;
    decalMat = new THREE.MeshBasicMaterial({
      map: tex,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
    decalMat.userData.shared = true;
    return decalMat;
  }
  const DECAL = {
    blood: 0,
    drag: 1,
    scorch: 2,
    stain: 3,
    puddle: 4,
    crack: 5,
    scraps: 6,
    drift: 7,
  };

  // ------------------------------------------------------------------
  // styles: item weights + decal weights
  // ------------------------------------------------------------------
