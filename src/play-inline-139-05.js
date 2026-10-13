// play-inline-139 05 — add
// Lines 2568-2614 of readable/play-inline-139.pretty.js (statement-aligned).
  function buildFerryWreck(b, M) {
    const add = (key, geo, m, o) =>
      b.add(
        key,
        geo,
        Object.assign(
          {
            m: new THREE.Matrix4().multiplyMatrices(M, m),
            grime: 0.75,
            ground: -1.2,
          },
          o || {},
        ),
      );
    const hull = new THREE.CapsuleGeometry(5, 30, 4, 12);
    hull.rotateX(Math.PI / 2);
    hull.scale(1.15, 0.7, 1);
    add("paint_orange", hull, LB.m4(0, 1.5, 0));
    add("rust", new THREE.BoxGeometry(11.8, 0.4, 36), LB.m4(0, 4.8, 0));
    add("paint_orange", new THREE.BoxGeometry(10.5, 3.2, 28), LB.m4(0, 6.6, 0));
    add("paint_cream", new THREE.BoxGeometry(8, 2.6, 18), LB.m4(0, 9.5, 0));
    for (const zz of [-10, 10])
      add("paint_cream", new THREE.BoxGeometry(4, 2.2, 3), LB.m4(0, 12.0, zz));
    add("rust", new THREE.CylinderGeometry(0.9, 1.1, 5, 10), LB.m4(0, 12.5, 0));
    for (let k = 0; k < 12; k++)
      for (const s of [-1, 1])
        add(
          "glass_broken",
          new THREE.PlaneGeometry(1.4, 1.2),
          LB.m4(s * 5.27, 6.8, -12.5 + k * 2.3, (s * Math.PI) / 2),
          { uv: "keep", noAO: true },
        );
    const nameK = LB.texMat(
      "ferry_name",
      LB.signTex("ferry_name", ["STATEN ISLAND FERRY"], "enamel", 1024, 128, {
        bg: "#c8702c",
        fg: "#1a1a1a",
      }),
    );
    for (const s of [-1, 1])
      add(
        nameK,
        new THREE.PlaneGeometry(16, 1.3),
        LB.m4(s * 5.29, 8.6, 0, (s * Math.PI) / 2),
        { uv: "keep", grime: 0.3 },
      );
  }
