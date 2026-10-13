// play-inline-151 05 — ctx
// Lines 2478-2602 of readable/play-inline-151.pretty.js (statement-aligned).
  function cutDoor(geo, az, y0, y1, ha) {
    const p = geo.attributes.position,
      keep = [];
    for (let i = 0; i < p.count; i += 3) {
      const cx = (p.getX(i) + p.getX(i + 1) + p.getX(i + 2)) / 3,
        cy = (p.getY(i) + p.getY(i + 1) + p.getY(i + 2)) / 3,
        cz = (p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2)) / 3;
      const a = Math.atan2(cz, cx);
      if (cy > y0 && cy < y1 && Math.abs(a - az) < ha) continue;
      keep.push(i);
    }
    for (const nm of Object.keys(geo.attributes)) {
      const at = geo.attributes[nm],
        s = at.itemSize,
        arr = new Float32Array(keep.length * 3 * s);
      keep.forEach((i, k) => {
        arr.set(at.array.subarray(i * s, (i + 3) * s), k * 3 * s);
      });
      geo.setAttribute(nm, new THREE.BufferAttribute(arr, s));
    }
    return geo;
  }
  function mapTex() {
    return P.canvasTex("pu_amnh_map", 512, 340, (ctx, w, h) => {
      const r = P.rng("map");
      ctx.fillStyle = "#e0d4b0";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#2a2418";
      ctx.font = "bold 26px " + P.FONTS.DECO;
      ctx.textAlign = "center";
      ctx.fillText("MUSEUM GUIDE · FIRST FLOOR", w / 2, 34);
      const rooms = [
        [40, 60, 140, 120, "#c8a860", "AFRICAN MAMMALS"],
        [190, 60, 120, 150, "#b0b890", "ROOSEVELT ROTUNDA"],
        [330, 60, 140, 90, "#90b0c0", "OCEAN LIFE"],
        [330, 170, 140, 100, "#a0a0c8", "HAYDEN PLANETARIUM"],
        [40, 200, 140, 90, "#c8b0a0", "DINOSAURS (4th Fl.)"],
      ];
      ctx.font = "bold 13px " + P.FONTS.SANS;
      for (const [x, y, rw, rh, c, t] of rooms) {
        ctx.fillStyle = c;
        ctx.fillRect(x, y, rw, rh);
        ctx.strokeStyle = "#3a3020";
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, rw, rh);
        ctx.fillStyle = "#2a2418";
        ctx.fillText(t, x + rw / 2, y + rh / 2);
      }
      ctx.fillStyle = "#b8302a";
      ctx.beginPath();
      ctx.arc(250, 250, 9, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#2a2418";
      ctx.fillText("YOU ARE HERE", 250, 280);
      P.blotches(ctx, w, h, r, 30, 0.3);
      P.speckle(ctx, w, h, r, 800);
    });
  }

  // ===================================================================
  // Street <-> interior doors & registration — called by 10_amnh.js's builder right
  // after buildExterior() (E = its site context).
  // ===================================================================
  P.interiorBuilders.amnh = function (E) {
    const I = buildInterior();
    const O = P.I("amnh");
    // main doors ↔ vestibule
    E.door(
      -144.2,
      2.4 + 1.6,
      -722,
      "American Museum of Natural History",
      { x: O.x, y: O.y + FLOOR_Y, z: O.z + 41.2, yaw: 0 },
      { radius: 1.8, onEnter: () => P.safe("disc", () => G.discover("amnh")) },
    );
    I.door(
      0,
      1.6,
      45.4,
      "Central Park West",
      { x: -140.0, y: 2.4, z: -722, yaw: -HP },
      { verb: "Exit", radius: 1.6 },
    );
    // Rose Center: barred from the inside until the player opens it on the way out
    const rose = P.barDoor(
      E.door(
        -149.4,
        1.5,
        -766,
        "Hayden Planetarium",
        { x: O.x + 92.9, y: O.y + FLOOR_Y, z: O.z - 3.5, yaw: HP },
        { id: "pu_amnh_rose_ext", radius: 1.5 },
      ),
      {
        message: "The planetarium doors are barred from the inside.",
        unbarMessage: "You lift the bar off the planetarium doors.",
      },
    );
    I.door(
      95.3,
      1.6,
      -8,
      "81st Street",
      { x: -147.2, y: 0, z: -766, yaw: -HP },
      { verb: "Exit", radius: 1.5, onEnter: () => rose.unbar() },
    );
    P.register("amnh", {
      root: E.root,
      interiorRoot: I.root,
      interiorKey: "amnh",
      anchors: Object.assign({}, E.anchors, I.anchors),
      doors: { rose },
    });
    // barred plank on the outside of the planetarium door follows the door state (also after a load)
    if (P.amnhRosePlank) {
      let t = 0;
      (P.tick = P.tick || []).push((dt, realDt) => {
        t -= realDt;
        if (t > 0) return;
        t = 0.5;
        const v = !!rose._barred;
        if (P.amnhRosePlank.visible !== v) P.amnhRosePlank.visible = v;
      });
    }
  };
