// play-inline-198 07 — face
// Lines 1434-1592 of readable/play-inline-198.pretty.js (statement-aligned).
  function vignette(E, v, p, out) {
    const r = E.rnd,
      face = p.wa + Math.PI; // facing away from the wall, into the room
    const fx = Math.sin(face),
      fz = Math.cos(face);
    const at = (d, side) => ({
      x: p.x + fx * d + Math.cos(face) * (side || 0),
      z: p.z + fz * d - Math.sin(face) * (side || 0),
    });
    const wallBack = Math.max(0, p.wd - 0.35);
    const base = {
      x: p.x + Math.sin(p.wa) * wallBack,
      y: p.y,
      z: p.z + Math.cos(p.wa) * wallBack,
    };
    const prop = (type, x, z, yaw, o) =>
      out.props.push({
        type,
        opts: Object.assign({ x, y: p.y, z, yaw, collide: false }, o || {}),
      });
    const note = (x, z) => {
      if (v.note) out.notes.push({ x, y: p.y + 0.02, z, note: v.note });
    };
    const k = v.kind;
    if (k === "last_stand") {
      prop("skeleton", base.x + fx * 0.15, base.z + fz * 0.15, face + Math.PI, {
        pose: "sitting",
      });
      const b = at(1.3);
      EMIT.table(E, { x: b.x, y: p.y, z: b.z, wa: p.wa + Math.PI, wd: 0 });
      out.cols.push({
        x: b.x,
        z: b.z,
        w: 1.3,
        d: 0.3,
        yaw: face,
        h: 0.85,
        y: p.y,
      });
      const c = at(1.0, 1.0);
      EMIT.chair(E, { x: c.x, y: p.y, z: c.z });
      EMIT.casings(E, { x: base.x + fx * 0.8, y: p.y, z: base.z + fz * 0.8 });
      E.decal(
        "blood",
        base.x + fx * 0.5,
        p.y,
        base.z + fz * 0.5,
        r() * TAU,
        1.3,
      );
      const n = at(0.6, -0.6);
      note(n.x, n.z);
    } else if (k === "camp") {
      const m = at(0.7, -0.4);
      E.put(
        "fabric",
        box(),
        M(m.x, p.y + 0.09, m.z, 0, face + Math.PI / 2, 0, 1.9, 0.18, 0.85),
      );
      E.put(
        "fabric",
        rockGeo(2),
        M(m.x + 0.2, p.y + 0.2, m.z, 0, face, 0, 0.9, 0.14, 0.6),
      );
      const f = at(1.9, 0.5);
      prop("campfire", f.x, f.z, 0, { pot: true, collide: true });
      const cr = at(0.5, 1.2);
      EMIT.crate(E, { x: cr.x, y: p.y, z: cr.z, wa: p.wa });
      EMIT.can(E, { x: f.x + 0.5, y: p.y, z: f.z + 0.3 });
      EMIT.can(E, { x: f.x - 0.4, y: p.y, z: f.z - 0.5 });
      EMIT.bottle(E, { x: m.x, y: p.y, z: m.z });
      E.decal("scorch", f.x, p.y, f.z, r() * TAU, 1.6);
      if (v.dead)
        prop("skeleton", m.x, m.z, face + Math.PI / 2, {
          pose: "curled",
          y: p.y + 0.18,
        });
      const n = at(0.4, 0.4);
      note(n.x, n.z);
    } else if (k === "lovers") {
      const a = at(0.6, -0.3),
        b = at(0.6, 0.35);
      prop("skeleton", a.x, a.z, face + Math.PI / 2, { pose: "lying" });
      prop("skeleton", b.x, b.z, face + Math.PI / 2 + 0.15, { pose: "curled" });
      E.decal("stain", (a.x + b.x) / 2, p.y, (a.z + b.z) / 2, r() * TAU, 2.2);
      const n = at(0.3, 1.0);
      note(n.x, n.z);
      EMIT.bottle(E, { x: n.x + 0.3, y: p.y, z: n.z });
    } else if (k === "barricade") {
      // chairs, a table and planks piled across a corner; someone didn't make it over
      for (let i = 0; i < 3; i++) {
        const q = at(1.2 + (r() - 0.5) * 0.4, (i - 1) * 0.9);
        EMIT.chair(E, { x: q.x, y: p.y, z: q.z });
      }
      const t = at(1.5);
      EMIT.table(E, { x: t.x, y: p.y, z: t.z, wa: p.wa + Math.PI, wd: 0 });
      out.cols.push({
        x: t.x,
        z: t.z,
        w: 1.3,
        d: 0.3,
        yaw: face,
        h: 0.85,
        y: p.y,
      });
      for (let i = 0; i < 3; i++) {
        const q = at(1.3, (r() - 0.5) * 2);
        EMIT.plank(E, { x: q.x, y: p.y + 0.3, z: q.z, wa: 0, wd: 9 });
      }
      const s = at(2.4, 0.3);
      prop("skeleton", s.x, s.z, face + Math.PI, { pose: "reaching" });
      E.decal("drag", at(3.3, 0.3).x, p.y, at(3.3, 0.3).z, face, 0.7, 2.2);
      const n = at(0.4);
      note(n.x, n.z);
    } else if (k === "trail") {
      // a blood trail along the floor to a body curled against the wall
      prop(
        "skeleton",
        base.x + fx * 0.3,
        base.z + fz * 0.3,
        face + Math.PI / 2,
        { pose: "curled" },
      );
      for (let i = 0; i < 3; i++) {
        const q = at(1.2 + i * 1.8, (r() - 0.5) * 0.3);
        E.decal("drag", q.x, p.y, q.z, face + (r() - 0.5) * 0.3, 0.8, 2.0, 0.9);
      }
      E.decal(
        "blood",
        base.x + fx * 0.6,
        p.y,
        base.z + fz * 0.6,
        r() * TAU,
        1.2,
      );
      const n = at(0.5, 0.6);
      note(n.x, n.z);
    } else if (k === "shrine") {
      // candles, a photo, flowers long dead: someone mourned here
      prop("skeleton", base.x + fx * 0.2, base.z + fz * 0.2, face + Math.PI, {
        pose: "seated" === v.pose ? "seated" : "sitting",
      });
      for (let i = 0; i < 6; i++) {
        const q = at(0.9 + r() * 0.4, (r() - 0.5) * 1.2);
        E.put(
          "candle",
          cyl(),
          M(q.x, p.y + 0.06, q.z, 0, 0, 0, 0.05, 0.12 + r() * 0.1, 0.05),
        );
      }
      E.decal("stain", at(0.9).x, p.y, at(0.9).z, 0, 1.5);
      const n = at(0.9, 0.2);
      note(n.x, n.z);
    }
  }

  // ------------------------------------------------------------------
  // main entry
  // ------------------------------------------------------------------
