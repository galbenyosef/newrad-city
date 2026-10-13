// play-inline-576 03 — dot
// Lines 496-780 of readable/play-inline-576.pretty.js (statement-aligned).
  QX.hook("world", function () {
    const k = K();
    for (const v of VIEWS) {
      const p = QX.freeSpot(v.x, v.z, undefined, { maxR: 6 });
      v.x = p.x;
      v.z = p.z;
      v.y = p.y;
      const yaw = QX.yawTo(p.x, p.z, v.look.x, v.look.z);
      k.tripod(p.x, p.y, p.z, yaw);
      k.collider(p.x, p.z, 0.5, 0.5, p.y, p.y + 1.7, 0, "metal");
      QX.interact({
        pos: QX.V3(p.x, p.y + 1.55, p.z),
        radius: 0.5,
        label: "Scenic Viewpoint: " + v.name,
        verb: "Take Photograph",
        priority: 1,
        enabled: () => {
          const st = QX.stage(QID);
          return (
            (st === "ch1" || st === "ch1_ret") && !QX.flag("photo_" + v.key)
          );
        },
        onInteract: () => G_.takePhoto(v),
      });
    }

    // Ripjaw tracks: three huge toe gouges and a dragging fourth claw pressed into the mud.
    const ty = G.world.terrainHeight(TRACKS.x, TRACKS.z);
    const g = k.group(TRACKS.x, ty, TRACKS.z, 0.6, 90);
    const b = k.builder();
    const mud = k.tint("qx_mud", 0x2a2218, { roughness: 1 });
    for (let i = 0; i < 3; i++) {
      k.box(
        b,
        mud,
        0.28,
        0.04,
        1.1,
        (i - 1) * 0.42,
        0.01,
        -0.35 - (i === 1 ? 0.2 : 0),
        (i - 1) * 0.25,
      );
      k.box(b, mud, 1.1, 0.03, 0.9, 0.3, 0.01, 1.8 + i * 1.6); // stride continues
    }
    k.box(b, mud, 1.2, 0.035, 0.9, 0, 0.012, 0.4);
    k.flush(b, g, false);
    QX.interact({
      pos: QX.V3(TRACKS.x, ty + 0.3, TRACKS.z),
      radius: 0.9,
      label: "Ripjaw Footprint",
      verb: "Make Plaster Cast",
      priority: 1,
      enabled: () => QX.stage(QID) === "ch5" && QX.has("qx_plaster"),
      onInteract: () => G_.makeCast(),
    });

    // Dot's stall dressing: her own hand-painted banner over the counter front (the landmark's awning
    // board says SCRAP — "fixes"), a sandwich board out front, and her stock on the counter.
    const dp = QX.anchor("grand_central", ["merchant3", "merchant1"], {
      x: 247.5,
      z: -239.5,
    });
    if (dp) {
      const y0 = dp.y || 0;
      const banner = k.sign(
        "FINCH'S FACTS & FIXES\nmaps \u00b7 advice \u00b7 zippers \u00b7 guidebooks",
        "wood",
        3.3,
        0.72,
        { fg: "#f2e6c0", bg: "#27402c" },
      );
      banner.position.set(dp.x, y0 + 0.56, dp.z + 1.27);
      G.scene.add(banner);
      if (G.world.addLOD) G.world.addLOD(banner, 90);
      // counter goods (the counter top is at +1.1 m, its front at +1.25 m from Dot's spot)
      const cg = k.group(dp.x, y0, dp.z, 0, 70);
      const cb = k.builder();
      const paper = k.tint("qx_dot_paper", 0xd8ceb0, { roughness: 1 }),
        red = k.tint("qx_dot_red", 0x8a2a20, { roughness: 0.8 }),
        tin = k.mat("metal_painted", 0x6a7078);
      const books = [
        k.tint("qx_dot_book_a", 0x2a5a4a, { roughness: 0.9 }),
        k.tint("qx_dot_book_b", 0x7a4a22, { roughness: 0.9 }),
      ];
      for (let i = 0; i < 4; i++)
        k.cyl(
          cb,
          paper,
          0.035,
          0.62,
          -1.3 + i * 0.09,
          1.14,
          0.78 + (i % 2) * 0.05,
          8,
          0,
          Math.PI / 2,
          0.2,
        ); // rolled maps
      for (let i = 0; i < 5; i++)
        k.box(
          cb,
          books[i % 2],
          0.24,
          0.035,
          0.17,
          -0.45,
          1.12 + i * 0.036,
          0.72,
          i * 0.12,
        ); // guidebook stack
      k.box(cb, paper, 0.26, 0.004, 0.19, 0.05, 1.105, 0.78, -0.2);
      k.box(cb, paper, 0.26, 0.004, 0.19, 0.12, 1.109, 0.8, 0.3); // open maps
      k.cyl(cb, tin, 0.08, 0.2, 0.62, 1.2, 0.72, 10);
      k.cyl(cb, red, 0.082, 0.03, 0.62, 1.31, 0.72, 10); // the zipper tin
      k.cyl(cb, tin, 0.02, 0.9, 1.45, 1.55, 0.72, 6);
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        k.box(
          cb,
          i % 2 ? paper : red,
          0.12,
          0.16,
          0.005,
          1.45 + Math.sin(a) * 0.07,
          1.55 + (i % 3) * 0.2,
          0.72 + Math.cos(a) * 0.07,
          a,
        );
      } // postcard spinner
      k.flush(cb, cg, false);
      const bp = QX.freeSpot(dp.x - 2.6, dp.z + 2.0, y0, {
        maxR: 2,
        radius: 0.5,
      }) || { x: dp.x - 2.6, z: dp.z + 2.0, y: y0 };
      const sb = k.group(bp.x, bp.y || y0, bp.z, Math.PI * 0.85, 90);
      const bb = k.builder();
      const wood = k.mat("wood_planks", 0x6a4a2a);
      k.box(bb, wood, 0.7, 1.0, 0.04, 0, 0.5, -0.18, 0, 0.18);
      k.box(bb, wood, 0.7, 1.0, 0.04, 0, 0.5, 0.18, 0, -0.18);
      k.flush(bb, sb, false);
      for (const s of [-1, 1]) {
        const sg = k.sign(
          "FINCH'S\nFACTS & FIXES\nmaps · advice\nzippers",
          "wood",
          0.62,
          0.8,
          { fg: "#f2e6c0", bg: "#27402c" },
        );
        sg.position.set(0, 0.55, 0.2 * s + 0.015 * s);
        sg.rotation.x = -0.18 * s;
        if (s < 0) sg.rotation.y = Math.PI;
        sb.add(sg);
      }
      k.collider(
        bp.x,
        bp.z,
        0.8,
        0.5,
        bp.y || y0,
        (bp.y || y0) + 1.0,
        Math.PI * 0.85,
        "wood",
      );
    }
  });

  // Subway: placard interactable at the derailed train (interior anchor), token by the booth.
  let placardIt = null;
  QX.hook("spawn", function () {
    const tr = QX.anchor("subway", ["train", "car", "train_b"], null);
    const pos = tr ? QX.V3(tr.x, (tr.y || 0) + 1.5, tr.z) : null;
    if (pos) {
      placardIt = QX.sessionInteract({
        pos,
        radius: 1.2,
        label: "Route Placard",
        verb: "Copy Down",
        priority: 2,
        enabled: () => QX.stage(QID) === "ch4",
        onInteract: () => G_.copyPlacard(),
      });
    }
    if (QX.stage(QID) === "ch4") spawnSubwayToken();
  });
  // Fallback when the map module (subway) is absent: reaching the entrance counts.
  QX.trigger({
    id: "g_subway_fallback",
    x: -60,
    z: -228,
    r: 6,
    once: false,
    cooldown: 5,
    cond: () => QX.stage(QID) === "ch4" && !placardIt,
    fire: () => G_.copyPlacard(),
  });
  function spawnSubwayToken() {
    if (QX.flag("got_g_token") || QX.pickups.g_token) return;
    const b = QX.anchor("subway", ["booth", "mezzanine"], null);
    if (b)
      QX.pickup("g_token", "subway_token", 1, {
        x: b.x + 0.6,
        y: (b.y || 0) + 0.05,
        z: b.z + 0.4,
      });
  }

  // ------------------------------------------------------------------
  // Dot Finch
  // ------------------------------------------------------------------
  const DOT_STOCK = [
    ["scrap_metal", 6],
    ["duct_tape", 3],
    ["tuff_bond", 2],
    ["scrap_electronics", 2],
    ["subway_token", 3],
    ["souvenir_paperweight", 1],
    ["pencil", 4],
    ["clipboard", 1],
    ["old_world_book", 2],
    ["purified_water", 3],
    [PRUSSIAN, 1],
  ];
  QX.hook("spawn", function () {
    const cust = QX.anchor(
      "grand_central",
      ["merchant3_customer", "merchant1_customer"],
      { x: 247.5, z: -237.5 },
    );
    const dot = QX.spawnNPC({
      id: "qx_dot",
      type: "human",
      name: "Dot Finch",
      outfit: "settler",
      gender: "f",
      hair: "bun",
      hat: "beret",
      skinTone: "fair",
      faction: "settlers",
      ai: "merchant",
      home: "here",
      homeR: 1.5,
      essential: true,
      level: 4,
      at: {
        site: "grand_central",
        anchors: ["merchant3", "merchant1"],
        fallback: { x: 247.5, z: -239.5 },
      },
      lookAt: cust || { x: 247.5, z: -230 },
      dialogue: "qx_dlg_dot",
      voice: "merchant",
      merchant: { scrip: 220, stock: DOT_STOCK, restock: 3 },
      barks: [
        "Maps! Advice! Zippers!",
        "Finch's Facts: if it's not in the book, it didn't happen!",
        "Welcome to New York! Please keep your limbs inside the city at all times.",
        "Ask me anything! Except where the bathroom is. There isn't one. There's a bucket.",
      ],
    });
    // saves from before round 2 restore her at the old GUNS & AMMO stall: walk her over to her own
    QX.safe("dotMove", () => {
      const want = QX.anchor("grand_central", ["merchant3", "merchant1"], null);
      if (
        !dot ||
        dot.dead ||
        !want ||
        !dot.pos ||
        Math.hypot(dot.pos.x - want.x, dot.pos.z - want.z) < 3
      )
        return;
      dot.pos.x = want.x;
      dot.pos.z = want.z;
      if (want.y !== undefined) dot.pos.y = want.y;
      if (dot.home && typeof dot.home === "object") {
        dot.home.x = want.x;
        dot.home.z = want.z;
      }
      if (cust) dot.yaw = QX.yawTo(want.x, want.z, cust.x, cust.z);
    });
  });

  // ------------------------------------------------------------------
  // Dialogue
  // ------------------------------------------------------------------
