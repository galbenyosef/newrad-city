// play-inline-580 04 — position
// Lines 1368-1414 of readable/play-inline-580.pretty.js (statement-aligned).
  let T = 0;
  QX.hook("update", function (dt) {
    const V = QX.c4;
    if (!V || !V.root || !V.root.visible || !D.normal) return;
    T += dt;
    D.normal.offset.set((T * 0.011) % 1, (T * 0.006) % 1);
    for (const s of D.scum)
      if (s.material.map) {
        s.material.map.offset.set((T * 0.0022) % 1, (T * 0.0013) % 1);
        break;
      }
    const drained = QX.flag("c4_pumps");
    for (const d of D.debris) {
      const w = V.water[d.sheet];
      if (!w) continue;
      const bob =
        drained && w.position.y < 0.08 ? 0 : Math.sin(T * 0.9 + d.ph) * 0.012;
      d.group.position.y = w.position.y - 0.42 + bob;
      d.group.rotation.y =
        drained && w.position.y < 0.08
          ? d.group.rotation.y
          : Math.sin(T * 0.05 + d.ph) * 0.01;
    }
    for (const r of D.rings) {
      const w = V.water[r.sheet];
      const wy = w ? w.position.y : 0.42;
      r.t += dt;
      const fall = 0.55; // drop falls for fall s, then the ring spreads
      if (r.t < fall) {
        r.drop.visible = true;
        r.drop.position.y = wy + (1 - r.t / fall) * (r.sheet === 1 ? 6.5 : 2.6);
        r.mesh.material.opacity = 0;
      } else {
        r.drop.visible = false;
        const u = (r.t - fall) / 1.3;
        if (u >= 1) {
          r.mesh.material.opacity = 0;
          if (r.t > fall + r.period) r.t = 0;
        } else {
          const s = 0.08 + u * 0.9;
          r.mesh.scale.set(s, s, 1);
          r.mesh.material.opacity = (1 - u) * 0.55;
        }
      }
      r.mesh.position.y = wy + 0.004;
    }
  });
