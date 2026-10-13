// play-inline-292 09 — three
// Lines 2160-2245 of readable/play-inline-292.pretty.js (statement-aligned).
  PM.catMesh = function () {
    const g = new THREE.Group();
    g.name = "pm2_cat";
    const fur = PM.mat("fur_orange"),
      dark = PM.mat("iron");
    const mk = (geo, mat, x, y, z, rx, ry, rz) => {
      const n = geo.attributes.position.count;
      geo.setAttribute(
        "color",
        new THREE.BufferAttribute(new Float32Array(n * 3).fill(1), 3),
      );
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.rotation.set(rx || 0, ry || 0, rz || 0);
      m.castShadow = false;
      g.add(m);
      return m;
    };
    mk(new THREE.SphereGeometry(0.13, 10, 8), fur, 0, 0.13, 0).scale.set(
      1,
      0.75,
      1.6,
    ); // body (loaf)
    mk(new THREE.SphereGeometry(0.085, 10, 8), fur, 0, 0.2, 0.2); // head
    for (const sx of [-1, 1])
      mk(
        new THREE.ConeGeometry(0.03, 0.06, 4),
        fur,
        sx * 0.045,
        0.28,
        0.2,
        0,
        0,
        -sx * 0.25,
      ); // ears
    for (const sx of [-1, 1])
      mk(
        new THREE.SphereGeometry(0.012, 6, 4),
        PM.mat("lamp_green"),
        sx * 0.03,
        0.215,
        0.275,
      ); // glinting eyes
    mk(new THREE.SphereGeometry(0.012, 6, 4), dark, 0, 0.19, 0.285); // nose
    const tail = new THREE.Group();
    tail.position.set(0, 0.08, -0.2);
    g.add(tail);
    const tm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.028, 0.28, 6),
      fur,
    );
    tm.geometry.setAttribute(
      "color",
      new THREE.BufferAttribute(
        new Float32Array(tm.geometry.attributes.position.count * 3).fill(1),
        3,
      ),
    );
    tm.position.set(0.1, 0, -0.04);
    tm.rotation.set(0, 0, 1.3);
    tail.add(tm);
    g.userData.tail = tail;
    return g;
  };

  // -------------------------------------------------------------------
  // Glows queued by the copied dress kit (fluorescent tubes / string lights)
  // → parented to whichever interior cell contains them (else the scene).
  // -------------------------------------------------------------------
  PM.flushKitGlows = function () {
    const list = (PM.glows || []).splice(0);
    for (const g of list) {
      let parent = null;
      for (const k in PM.cells) {
        const c = PM.cells[k];
        if (
          Math.abs(g.pos.x - c.origin.x) < 170 &&
          Math.abs(g.pos.z - c.origin.z) < 170
        ) {
          parent = c.root;
          break;
        }
      }
      PM.glow(g.pos, g.color, g.size, parent, { intensity: 1.0 });
    }
  };
