// play-inline-490 04 — three
// Lines 769-1027 of readable/play-inline-490.pretty.js (statement-aligned).
  function famMat(fam) {
    const key = "_" + fam;
    if (matCache.view[key]) return matCache.view[key];
    let m;
    if (fam === "glowFam")
      m = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        vertexColors: true,
        toneMapped: false,
        fog: false,
      });
    else {
      const [tex, bump] = FAMILY_TEX[fam];
      m = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        vertexColors: true,
        roughness: 0.5,
        metalness: 0.5,
      });
      m.map = TEX[tex]();
      if (bump) {
        m.bumpMap = m.map;
        m.bumpScale = bump;
      }
      m.envMapIntensity = 1.0;
      m.onBeforeCompile = (sh) => {
        sh.vertexShader =
          "attribute vec2 wrm;\nvarying vec2 vWrm;\n" +
          sh.vertexShader.replace(
            "#include <begin_vertex>",
            "#include <begin_vertex>\n  vWrm = wrm;",
          );
        sh.fragmentShader =
          "varying vec2 vWrm;\n" +
          sh.fragmentShader
            .replace(
              "#include <roughnessmap_fragment>",
              "float roughnessFactor = vWrm.x;",
            )
            .replace(
              "#include <metalnessmap_fragment>",
              "float metalnessFactor = vWrm.y;",
            );
      };
      m.customProgramCacheKey = () => "wpnFamRM";
    }
    m.name = "wpn_" + fam;
    m.userData.shared = true;
    m.userData.wpnMat = fam;
    return (matCache.view[key] = m);
  }

  // ------------------------------------------------------------------
  // Environment map for the viewmodel scene (metals need reflections)
  // ------------------------------------------------------------------
  P.buildEnv = function () {
    if (P.envTex || !G.renderer) return P.envTex;
    try {
      const pm = new THREE.PMREMGenerator(G.renderer);
      const sc = new THREE.Scene();
      // gradient dome: warm hazy sky above, dark dusty ground below
      const dome = new THREE.Mesh(
        new THREE.SphereGeometry(10, 24, 12),
        new THREE.ShaderMaterial({
          side: THREE.BackSide,
          depthWrite: false,
          uniforms: {},
          vertexShader:
            "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }",
          fragmentShader:
            "varying vec3 vP; void main(){ float h = vP.y; vec3 sky = mix(vec3(0.55,0.56,0.45), vec3(0.85,0.82,0.66), smoothstep(0.0,0.6,h));" +
            "vec3 gnd = mix(vec3(0.26,0.24,0.2), vec3(0.4,0.37,0.31), smoothstep(-0.6,0.0,h)); gl_FragColor = vec4(h>0.0?sky:gnd, 1.0); }",
        }),
      );
      sc.add(dome);
      // bright "windows"/softboxes for specular streaks
      const lm = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const addPanel = (x, y, z, w, h, k) => {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), lm.clone());
        m.material.color.setScalar(k);
        m.position.set(x, y, z);
        m.lookAt(0, 0, 0);
        sc.add(m);
      };
      addPanel(0, 7, 3, 8, 2.5, 3.5);
      addPanel(-6, 3, -4, 3, 5, 1.6);
      addPanel(6, 2, 2, 2, 5, 1.2);
      addPanel(0, 1.5, -8, 6, 1.2, 1.4);
      const rt = pm.fromScene(sc, 0.02);
      P.envTex = rt.texture;
      pm.dispose();
      sc.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
      });
    } catch (e) {
      G.reportError("weapons:env", e);
      P.envTex = null;
    }
    return P.envTex;
  };

  // ------------------------------------------------------------------
  // Geometry primitives (all return fresh BufferGeometry)
  // ------------------------------------------------------------------
  const GEO = {};
  P.GEO = GEO;
  /** Rounded/chamfered box centred at origin. r = bevel radius. */
  GEO.box = function (w, h, d, r, segs) {
    r = Math.min(
      r === undefined ? Math.min(w, h, d) * 0.12 : r,
      w / 2 - 1e-4,
      h / 2 - 1e-4,
      d / 2 - 1e-4,
    );
    if (r <= 0.0005) return new THREE.BoxGeometry(w, h, d);
    // bevel grows the outline by bs — inset the shape. Keep bs small relative to the
    // shape or ExtrudeGeometry's bevel vectors spike on thin shapes.
    const bs = Math.min(r * 0.7, Math.min(w, h) * 0.18);
    const hw = w / 2 - bs,
      hh = h / 2 - bs,
      rc = Math.min(r * 0.6, hw * 0.9, hh * 0.9);
    const sh = new THREE.Shape();
    sh.moveTo(-hw + rc, -hh);
    sh.lineTo(hw - rc, -hh);
    sh.quadraticCurveTo(hw, -hh, hw, -hh + rc);
    sh.lineTo(hw, hh - rc);
    sh.quadraticCurveTo(hw, hh, hw - rc, hh);
    sh.lineTo(-hw + rc, hh);
    sh.quadraticCurveTo(-hw, hh, -hw, hh - rc);
    sh.lineTo(-hw, -hh + rc);
    sh.quadraticCurveTo(-hw, -hh, -hw + rc, -hh);
    const g = new THREE.ExtrudeGeometry(sh, {
      depth: Math.max(1e-4, d - 2 * r),
      bevelEnabled: true,
      bevelThickness: r,
      bevelSize: bs,
      bevelSegments: segs || 1,
      curveSegments: 2,
    });
    g.translate(0, 0, -(d - 2 * r) / 2);
    return g;
  };
  /** Side-profile extrusion. pts = [[fwd, up], ...] (fwd = -Z). thickness along X, centred. */
  GEO.profile = function (pts, thickness, bevel, curveSeg, bevelSeg) {
    bevel = bevel === undefined ? Math.min(0.004, thickness * 0.2) : bevel;
    const sh = new THREE.Shape();
    pts.forEach((p, i) => (i ? sh.lineTo(p[0], p[1]) : sh.moveTo(p[0], p[1])));
    const depth = Math.max(1e-4, thickness - 2 * bevel);
    const g = new THREE.ExtrudeGeometry(sh, {
      depth,
      bevelEnabled: bevel > 0,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: bevelSeg || 1,
      curveSegments: curveSeg || 4,
    });
    g.translate(0, 0, -depth / 2);
    g.rotateY(Math.PI / 2); // shape X -> -Z (forward), extrusion -> X
    return g;
  };
  /** Profile from a THREE.Shape-building callback (for curves). */
  GEO.shapeProfile = function (build, thickness, bevel, curveSeg) {
    bevel = bevel === undefined ? Math.min(0.004, thickness * 0.2) : bevel;
    const sh = new THREE.Shape();
    build(sh);
    const depth = Math.max(1e-4, thickness - 2 * bevel);
    const g = new THREE.ExtrudeGeometry(sh, {
      depth,
      bevelEnabled: bevel > 0,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 1,
      curveSegments: curveSeg || 8,
    });
    g.translate(0, 0, -depth / 2);
    g.rotateY(Math.PI / 2);
    return g;
  };
  /** Cylinder along Z (forward). centred on its length. */
  GEO.cyl = function (r, len, seg, r2) {
    const g = new THREE.CylinderGeometry(
      r2 === undefined ? r : r2,
      r,
      len,
      seg || 12,
      1,
    );
    g.rotateX(-Math.PI / 2); // +Y -> -Z : top (r2) faces forward
    return g;
  };
  /** Cylinder along X */
  GEO.cylX = function (r, len, seg) {
    const g = new THREE.CylinderGeometry(r, r, len, seg || 12, 1);
    g.rotateZ(Math.PI / 2);
    return g;
  };
  /** Cylinder along Y */
  GEO.cylY = function (r, len, seg, r2) {
    return new THREE.CylinderGeometry(
      r2 === undefined ? r : r2,
      r,
      len,
      seg || 12,
      1,
    );
  };
  /** Hollow tube along Z (barrel with visible bore). */
  GEO.tube = function (rOut, rIn, len, seg) {
    const pts = [
      new THREE.Vector2(rIn, len / 2),
      new THREE.Vector2(rOut, len / 2),
      new THREE.Vector2(rOut, -len / 2),
      new THREE.Vector2(rIn, -len / 2),
      new THREE.Vector2(rIn, len / 2 - 0.0001),
    ];
    const g = new THREE.LatheGeometry(pts, seg || 14);
    g.rotateX(-Math.PI / 2);
    return g;
  };
  /** Lathe along Z. pts = [[radius, fwd], ...] fwd positive = forward (-Z). */
  GEO.lathe = function (pts, seg) {
    const g = new THREE.LatheGeometry(
      pts.map((p) => new THREE.Vector2(Math.max(0, p[0]), p[1])),
      seg || 16,
    );
    g.rotateX(-Math.PI / 2);
    return g;
  };
  /** Lathe along Y (up). pts [[r,y]] */
  GEO.latheY = function (pts, seg) {
    return new THREE.LatheGeometry(
      pts.map((p) => new THREE.Vector2(Math.max(0, p[0]), p[1])),
      seg || 16,
    );
  };
  GEO.sphere = (r, ws, hs) => new THREE.SphereGeometry(r, ws || 12, hs || 8);
  GEO.torus = (R, r, rs, ts, arc) =>
    new THREE.TorusGeometry(R, r, rs || 6, ts || 16, arc || Math.PI * 2);
  GEO.capsule = (r, len, cs, rs) =>
    new THREE.CapsuleGeometry(r, len, cs || 3, rs || 8);
  /** Tube along a path of points (cables, hoses). */
  GEO.hose = function (pts, r, seg, radial) {
    const curve = new THREE.CatmullRomCurve3(
      pts.map((p) => new THREE.Vector3(p[0], p[1], p[2])),
    );
    return new THREE.TubeGeometry(curve, seg || 16, r, radial || 6, false);
  };
  /** Wedge/triangular prism etc via profile with thickness. */
  GEO.prism = (pts, thick, bevel) =>
    GEO.profile(pts, thick, bevel === undefined ? 0.0015 : bevel);
  /**
   * Loft: sweep a closed cross-section ([[x, y], ...] in the XY plane) through stations along -Z.
   * Hard-surface friendly: section corners sharper than `crease` degrees keep split normals (crisp
   * machined chamfers), gentler ones shade smooth; stations flagged `sharp` crease across the part.
   * station = {z, sx?, sy?, dx?, dy?, sharp?}: x' = x*sx + dx, y' = (y - anchorY)*sy + anchorY + dy
   * (anchorY defaults to the section's lowest point, so sy < 1 slopes the TOP down — slide noses,
   * receiver ramps). Both ends are closed with flat end plates. Used for slides, receivers and housings
   * whose cross-section is not a box (the old side-profile extrusions all read as bricks from behind).
   */
