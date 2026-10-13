// play-inline-69 03 — mesh
// Lines 326-377 of readable/play-inline-69.pretty.js (statement-aligned).
  ATMOS.skylineStats = () => {
    const o = Object.assign({ visible: !!(mesh && mesh.visible) }, stats);
    if (mesh) {
      try {
        const pr = G.renderer.properties.get(mesh.material),
          prog = pr && pr.currentProgram;
        o.prog = prog
          ? prog.diagnostics
            ? {
                runnable: prog.diagnostics.runnable,
                log: String(
                  (prog.diagnostics.fragmentShader &&
                    prog.diagnostics.fragmentShader.log) ||
                    (prog.diagnostics.vertexShader &&
                      prog.diagnostics.vertexShader.log) ||
                    "",
                ).slice(0, 300),
              }
            : "ok"
          : "none";
        const P = mesh.geometry.attributes.iPos.array,
          X = mesh.geometry.attributes.iAx.array;
        o.first = [P[0], P[1], P[2], X[0], X[2]].map((v) => +v.toFixed(1));
        o.uI = +mesh.material.uniforms.uI.value.toFixed(2);
        o.uPx = mesh.material.uniforms.uPx.value;
        // how many panes project into the view (debug)
        const v = new THREE.Vector3();
        let inView = 0,
          near = 0;
        const smp = [];
        for (let i = 0; i < count; i++) {
          v.set(P[i * 3], P[i * 3 + 1], P[i * 3 + 2]);
          const d = v.distanceTo(G.camera.position);
          if (d < 150) near++;
          v.project(G.camera);
          if (Math.abs(v.x) < 1 && Math.abs(v.y) < 1 && v.z < 1) {
            inView++;
            if (smp.length < 6)
              smp.push([+v.x.toFixed(2), +v.y.toFixed(2), Math.round(d)]);
          }
        }
        o.inView = inView;
        o.near = near;
        o.smp = smp;
        o.parent = !!mesh.parent;
        o.layers = mesh.layers.mask;
      } catch (e) {
        o.err = String(e.message);
      }
    }
    return o;
  };
