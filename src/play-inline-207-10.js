// play-inline-207 10 — three
// Lines 4282-4301 of readable/play-inline-207.pretty.js (statement-aligned).
  function tricornMesh() {
    const g = new THREE.Group();
    const b1 = PF.mesh(
      "fabric",
      new THREE.CylinderGeometry(0.32, 0.32, 0.05, 3),
    );
    g.add(b1);
    const c1 = PF.mesh(
      "fabric",
      new THREE.CylinderGeometry(0.16, 0.2, 0.18, 10),
    );
    c1.position.y = 0.1;
    g.add(c1);
    g.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = false;
      }
    });
    return g;
  }
