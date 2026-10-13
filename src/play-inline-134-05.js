// play-inline-134 05 — three
// Lines 2944-3162 of readable/play-inline-134.pretty.js (statement-aligned).
  G._lb.flagTime = G._lb.flagTime || { value: 0 };
  function makeFlag(tex, w, h, opts) {
    opts = opts || {};
    const geo = new THREE.PlaneGeometry(
      w,
      h,
      opts.hang ? 16 : 14,
      opts.hang ? 10 : 6,
    );
    geo.translate(w / 2, -h / 2, 0);
    const mat = new THREE.MeshStandardMaterial({
      map: tex,
      side: THREE.DoubleSide,
      roughness: 0.95,
    });
    const P = {
      uLbT: G._lb.flagTime,
      uLbF: {
        value: new THREE.Vector4(
          w,
          h,
          opts.amp || (opts.hang ? 0.25 : 0.35),
          opts.hang ? 1 : 0,
        ),
      },
      uLbS: {
        value: new THREE.Vector3(
          opts.freq || (opts.hang ? 0.7 : 1.3),
          opts.speed || (opts.hang ? 1.1 : 3.2),
          opts.hang ? 0 : 0.3,
        ),
      },
    };
    mat.onBeforeCompile = function (sh) {
      Object.assign(sh.uniforms, P);
      sh.vertexShader = sh.vertexShader
        .replace(
          "#include <common>",
          `#include <common>
uniform float uLbT; uniform vec4 uLbF; uniform vec3 uLbS;
float lbWave(vec2 q) {
  float k = uLbF.w > 0.5 ? clamp(-q.y / uLbF.y, 0.0, 1.0) : clamp(q.x / uLbF.x, 0.0, 1.0);
  float a = sin(q.x * uLbS.x - uLbT * uLbS.y + q.y * 0.3) * uLbF.z * k;
  float b = sin(q.x * (uLbS.x * 2.2) - uLbT * (uLbS.y * 1.6)) * uLbF.z * 0.24 * (uLbF.w > 0.5 ? 1.0 : k);
  return a + b;
}`,
        )
        .replace(
          "#include <beginnormal_vertex>",
          `float lbZ = lbWave(position.xy);
float lbZx = lbWave(position.xy + vec2(0.05, 0.0)), lbZy = lbWave(position.xy + vec2(0.0, 0.05));
vec3 objectNormal = normalize(vec3(-(lbZx - lbZ) / 0.05, -(lbZy - lbZ) / 0.05, 1.0));
#ifdef USE_TANGENT
vec3 objectTangent = vec3(tangent.xyz);
#endif`,
        )
        .replace(
          "#include <begin_vertex>",
          `vec3 transformed = vec3(position);
transformed.z += lbZ;
if (uLbF.w < 0.5) { float kk = clamp(position.x / uLbF.x, 0.0, 1.0); transformed.y -= kk * kk * 0.3; }`,
        );
    };
    mat.customProgramCacheKey = () => "lb_flag_v1";
    mat.userData.shared = true;
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = false; // the depth pass would not wave; flags are thin anyway
    mesh.receiveShadow = true;
    mesh.frustumCulled = true;
    geo.boundingSphere = null;
    geo.computeBoundingSphere();
    geo.boundingSphere.radius += (opts.amp || 0.4) + 0.3;
    mesh.userData.wave = function () {
      /* GPU-driven — kept for API compatibility */
    };
    return mesh;
  }
  G._lb.makeFlag = makeFlag;

  // ====================================================================
  // Continuity Rotorcraft: a tandem twin-rotor transport helicopter (boxy
  // hull with a rounded roof, glazed nose, low forward and tall aft rotor
  // pylons with three-blade rotors, sponson tanks, four wheels, the rear
  // loading ramp lowered). Nose at local +Z.
  // ====================================================================
  function buildRotorcraft(b, M) {
    const add = (key, geo, m, extra) =>
      b.add(
        key,
        geo,
        Object.assign(
          { m: new THREE.Matrix4().multiplyMatrices(M, m), grime: 0.45 },
          extra || {},
        ),
      );
    const K = "gunmetal";
    add(K, new THREE.BoxGeometry(2.6, 1.7, 11.4), LB.m4(0, 1.75, -0.4)); // hull
    const roof = new THREE.CylinderGeometry(
      1.3,
      1.3,
      11.4,
      14,
      1,
      false,
      Math.PI / 2,
      Math.PI,
    );
    roof.rotateX(Math.PI / 2);
    add(K, roof, LB.m4(0, 2.6, -0.4, 0, 0, 0, 1, 0.5, 1)); // rounded roof
    const nose = new THREE.CylinderGeometry(0.9, 1.35, 1.6, 12, 1);
    nose.rotateX(Math.PI / 2);
    add(K, nose, LB.m4(0, 1.95, 6.1, 0, 0, 0, 1, 0.85, 1)); // tapered nose
    add(
      "glass_dark",
      new THREE.BoxGeometry(2.0, 0.85, 0.08),
      LB.m4(0, 2.5, 6.25, 0, -0.65),
      { noAO: true },
    ); // windscreen
    for (const sx of [-1, 1]) {
      add(
        "glass_dark",
        new THREE.BoxGeometry(0.06, 0.6, 1.3),
        LB.m4(sx * 1.31, 2.25, 4.9),
        { noAO: true },
      ); // cockpit side glass
      add(
        "glass_dark",
        new THREE.PlaneGeometry(1.4, 1.5),
        LB.m4(sx * 1.31, 1.75, 2.6, (sx * Math.PI) / 2),
        { uv: "keep", noAO: true },
      ); // open side door
      add(K, new THREE.BoxGeometry(0.5, 0.7, 6.0), LB.m4(sx * 1.5, 1.25, -0.6)); // sponson tank
      add(
        "paint_cream",
        new THREE.CircleGeometry(0.5, 20),
        LB.m4(sx * 1.32, 2.05, -3.0, (sx * Math.PI) / 2),
        { uv: "keep", noAO: true },
      ); // roundel
      add(
        K,
        new THREE.CircleGeometry(0.3, 20),
        LB.m4(sx * 1.335, 2.05, -3.0, (sx * Math.PI) / 2),
        { uv: "keep", noAO: true },
      );
      const eng = new THREE.CylinderGeometry(0.4, 0.4, 2.0, 10);
      eng.rotateX(Math.PI / 2);
      add(K, eng, LB.m4(sx * 0.95, 3.5, -5.0)); // engine pods on the aft pylon
    }
    add(K, new THREE.BoxGeometry(1.2, 0.8, 1.8), LB.m4(0, 3.1, 4.4)); // forward pylon (low)
    add(K, new THREE.BoxGeometry(1.4, 2.0, 3.2), LB.m4(0, 3.3, -4.8)); // aft pylon (tall)
    const rotor = (z, y, a0) => {
      add(
        "iron",
        new THREE.CylinderGeometry(0.22, 0.28, 0.5, 8),
        LB.m4(0, y, z),
      );
      for (let k = 0; k < 3; k++) {
        const bl = new THREE.BoxGeometry(0.38, 0.06, 5.6);
        bl.translate(0, 0, 2.8);
        add("iron", bl, LB.m4(0, y + 0.2, z, a0 + (k * TAU) / 3, -0.03));
      }
    };
    rotor(4.4, 3.6, 0.3);
    rotor(-4.8, 4.45, 0.9);
    for (const [gx, gz] of [
      [-1.15, 3.6],
      [1.15, 3.6],
      [-1.3, -3.8],
      [1.3, -3.8],
    ]) {
      // wheeled landing gear
      add("iron", new THREE.BoxGeometry(0.14, 0.7, 0.14), LB.m4(gx, 0.55, gz));
      const w = new THREE.CylinderGeometry(0.42, 0.42, 0.3, 12);
      w.rotateZ(Math.PI / 2);
      add("tire", w, LB.m4(gx + Math.sign(gx) * 0.12, 0.42, gz));
    }
    add(
      K,
      new THREE.BoxGeometry(2.2, 0.12, 2.6),
      LB.m4(0, 0.5, -7.2, 0, -0.32),
    ); // rear ramp, lowered
    add(
      "glass_dark",
      new THREE.PlaneGeometry(2.2, 1.6),
      LB.m4(0, 1.75, -6.12, Math.PI),
      { uv: "keep", noAO: true },
    ); // dark hold
  }

  // ====================================================================
  // Harbor skiff (rowboat with outboard motor) — used by both piers
  // ====================================================================
  function buildSkiff(b, M) {
    const add = (key, geo, m) =>
      b.add(key, geo, {
        m: new THREE.Matrix4().multiplyMatrices(M, m),
        grime: 0.5,
      });
    const hull = new THREE.SphereGeometry(
      1,
      12,
      8,
      0,
      TAU,
      Math.PI / 2,
      Math.PI / 2,
    );
    hull.scale(1.1, 0.7, 3.0);
    add("paint_teal", hull, LB.m4(0, 0.8, 0));
    add("rotten", new THREE.BoxGeometry(2.0, 0.06, 0.4), LB.m4(0, 0.7, 0.4));
    add("rotten", new THREE.BoxGeometry(1.8, 0.06, 0.4), LB.m4(0, 0.7, -1.4));
    add("iron", new THREE.BoxGeometry(0.4, 0.7, 0.5), LB.m4(0, 1.0, -3.0));
    add(
      "iron",
      new THREE.CylinderGeometry(0.05, 0.05, 1.2, 5),
      LB.m4(0, 0.3, -3.1),
    );
  }
  G._lb.buildSkiff = buildSkiff;
