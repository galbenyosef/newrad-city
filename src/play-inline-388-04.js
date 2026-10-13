// play-inline-388 04 — ctx
// Lines 2534-2627 of readable/play-inline-388.pretty.js (statement-aligned).
  function buildParcels(ctx, BELT, BH) {
    const O = ctx.O,
      N = 16;
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const cols = new Float32Array(geo.attributes.position.count * 3);
    for (let i = 0; i < geo.attributes.position.count; i++) {
      const ny = geo.attributes.normal.getY(i);
      const l = ny > 0.5 ? 0.62 : 0.42;
      cols[i * 3] = l * 0.95;
      cols[i * 3 + 1] = l * 0.82;
      cols[i * 3 + 2] = l * 0.62;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(cols, 3));
    const mesh = new THREE.InstancedMesh(geo, K.mat("wood", true), N);
    mesh.name = "ppn_parcels";
    mesh.frustumCulled = false;
    const pts = BELT.map(
      (p) => new THREE.Vector3(p[0] + O.x, O.y + BH, p[1] + O.z),
    );
    const seg = [];
    let L = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const d = pts[i].distanceTo(pts[i + 1]);
      seg.push([L, d]);
      L += d;
    }
    const r = K.rng("parcels");
    const P = [];
    for (let i = 0; i < N; i++)
      P.push({
        s: (i * L) / N + r() * 1.2,
        w: 0.3 + r() * 0.35,
        h: 0.18 + r() * 0.25,
        d: 0.25 + r() * 0.3,
        yaw: (r() - 0.5) * 0.5,
      });
    ctx.intRoot.add(mesh);
    const m4 = new THREE.Matrix4(),
      q = new THREE.Quaternion(),
      e = new THREE.Euler(),
      sc = new THREE.Vector3(),
      pos = new THREE.Vector3();
    ctx.parcels = {
      mesh,
      pts,
      seg,
      L,
      P,
      place() {
        for (let i = 0; i < N; i++) {
          const p = P[i];
          let s = ((p.s % L) + L) % L,
            k = 0;
          while (k < seg.length - 1 && s > seg[k][0] + seg[k][1]) k++;
          const t = (s - seg[k][0]) / seg[k][1],
            A = pts[k],
            B = pts[k + 1];
          pos.set(
            A.x + (B.x - A.x) * t,
            A.y + p.h / 2 + 0.02,
            A.z + (B.z - A.z) * t,
          );
          const fade = s < 0.6 ? s / 0.6 : s > L - 0.6 ? (L - s) / 0.6 : 1; // appear from the chute, drop off the end
          e.set(0, Math.atan2(B.x - A.x, B.z - A.z) + p.yaw, 0);
          q.setFromEuler(e);
          sc.set(p.w * fade + 1e-3, p.h * fade + 1e-3, p.d * fade + 1e-3);
          m4.compose(pos, q, sc);
          mesh.setMatrixAt(i, m4);
        }
        mesh.instanceMatrix.needsUpdate = true;
      },
    };
    ctx.parcels.place();
  }
  let hum = null;
  PV.faInteriorUpdate = function (dt, realDt, ctx) {
    if (!ctx.inside) {
      if (hum) {
        K.safe("hum stop", () => hum.stop());
        hum = null;
      }
      return;
    }
    const P = ctx.parcels;
    if (P && dt > 0) {
      for (const p of P.P) p.s += dt * 0.55;
      P.place();
    }
    if (!hum && dt > 0)
      hum = K.sfx("hum_electric", K.world(ctx, -4, 1.2, -26), {
        loop: true,
        volume: 0.35,
      });
  };
