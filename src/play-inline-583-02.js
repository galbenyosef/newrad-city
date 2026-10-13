// play-inline-583 02 — math
// Lines 351-701 of readable/play-inline-583.pretty.js (statement-aligned).
  const REMAINS = [
    {
      id: "deke",
      name: "the dealer",
      seat: 0,
      loot: [[OLD_DOLLARS, 8]],
      found:
        'The dealer\'s left cuff is stiff. Inside it: a brass key on a string, and the ace of spades. The rest of his "winnings" are in his lap.',
    },
    {
      id: "sal",
      name: "Sal",
      seat: 1,
      loot: [["cigarettes", 1]],
      found:
        "Sal: a pack of cigarettes, an IOU for twenty dollars made out to Deke, and a pair of three.",
    },
    {
      id: "ruthie",
      name: "Ruthie",
      seat: 2,
      loot: [["lighter", 1]],
      found:
        "Ruthie: a silver lighter and a full house, kings over nines. She would have won.",
    },
    {
      id: "mo",
      name: "Mo",
      seat: 3,
      loot: [["subway_token", 1]],
      found:
        "Mo: a subway token, a rabbit's foot and a hand of nothing. He folded. He never got up.",
    },
  ];
  QX.hook("world", function () {
    const k = K();
    // ---------------- Dead Man's Hand: the table ----------------
    const t = QX.freeSpot(SP.table.x, SP.table.z, undefined, {
      maxR: 8,
      radius: 1.8,
    });
    SP.table.x = t.x;
    SP.table.z = t.z;
    SP.table.y = t.y;
    const g = k.group(t.x, t.y, t.z, 0.25, 110);
    const b = k.builder();
    const wood = k.mat("wood_planks", 0x5a3a20),
      felt = k.tint("qx_lh_felt", 0x1c3a26, { roughness: 1 }),
      card = k.tint("qx_card", 0xece6d4, { roughness: 0.8 });
    const chip = k.tint("qx_lh_chip", 0x8a2a22, { roughness: 0.6 }),
      money = k.tint("qx_lh_money", 0x6f7a55, { roughness: 0.95 }),
      glass = k.tint("qx_lh_glass", 0x4a3a1a, {
        roughness: 0.2,
        metalness: 0.1,
      });
    k.cyl(b, wood, 0.62, 0.05, 0, 0.74, 0, 18);
    k.cyl(b, felt, 0.57, 0.012, 0, 0.768, 0, 18);
    k.cyl(b, wood, 0.06, 0.72, 0, 0.36, 0, 8);
    k.cyl(b, wood, 0.32, 0.04, 0, 0.02, 0, 12);
    // four hands of cards, face down in front of each seat; dollars & chips
    for (let s = 0; s < 4; s++) {
      const a = (s * Math.PI) / 2,
        cx = Math.sin(a) * 0.4,
        cz = Math.cos(a) * 0.4;
      for (let c = 0; c < 5; c++)
        k.box(
          b,
          card,
          0.065,
          0.004,
          0.09,
          cx + Math.cos(a) * (c - 2) * 0.03,
          0.777,
          cz - Math.sin(a) * (c - 2) * 0.03,
          a + (c - 2) * 0.12,
        );
      k.box(
        b,
        money,
        0.14,
        0.012 + (s === 0 ? 0.03 : 0.006 * s),
        0.07,
        Math.sin(a) * 0.22 + 0.08,
        0.782,
        Math.cos(a) * 0.22,
        a,
      );
      for (let c = 0; c < 3 + s; c++)
        k.cyl(
          b,
          chip,
          0.022,
          0.006,
          Math.sin(a + 0.6) * 0.3,
          0.778 + c * 0.006,
          Math.cos(a + 0.6) * 0.3,
          8,
        );
    }
    k.cyl(b, glass, 0.04, 0.24, 0.12, 0.89, -0.1, 8);
    k.cyl(b, glass, 0.015, 0.06, 0.12, 1.03, -0.1, 6); // whiskey bottle
    // the dust ring where the key should be
    k.cyl(
      b,
      k.tint("qx_lh_dust", 0x6a6050, { roughness: 1 }),
      0.05,
      0.002,
      0,
      0.775,
      0,
      10,
    );
    // four chairs; seat 0.45 (the seated skeleton pose sits on 0.45)
    for (let s = 0; s < 4; s++) {
      const a = (s * Math.PI) / 2,
        cx = Math.sin(a) * 0.95,
        cz = Math.cos(a) * 0.95;
      k.box(b, wood, 0.44, 0.04, 0.42, cx, 0.43, cz, a);
      const bx = Math.sin(a) * 1.16,
        bz = Math.cos(a) * 1.16;
      k.box(b, wood, 0.42, 0.5, 0.04, bx, 0.7, bz, a);
      for (const [lx, lz] of [
        [-0.18, -0.17],
        [0.18, -0.17],
        [-0.18, 0.17],
        [0.18, 0.17],
      ]) {
        const c = Math.cos(a),
          sn = Math.sin(a);
        k.box(
          b,
          wood,
          0.035,
          0.42,
          0.035,
          cx + lx * c + lz * sn,
          0.21,
          cz - lx * sn + lz * c,
        );
      }
    }
    k.flush(b, g, false);
    k.collider(t.x, t.z, 2.4, 2.4, t.y, t.y + 0.8, 0.25, "wood");
    // the players (seat s sits at angle a, facing the table centre)
    for (const R of REMAINS) {
      const a = 0.25 + (R.seat * Math.PI) / 2;
      const sx = t.x + Math.sin(a) * 0.9,
        sz = t.z + Math.cos(a) * 0.9;
      QX.prop("skeleton", {
        x: sx,
        y: t.y,
        z: sz,
        yaw: QX.yawTo(sx, sz, t.x, t.z),
        pose: "seated",
        persistent: true,
      });
      QX.interact({
        pos: QX.V3(sx, t.y + 0.95, sz),
        radius: 0.45,
        label:
          R.id === "deke" ? "The Dealer's Remains" : "Remains of " + R.name,
        verb: "Search",
        priority: 1,
        enabled: () => !QX.flag("lh_searched_" + R.id),
        onInteract: () => U.searchRemains(R.id),
      });
    }
    QX.interact({
      pos: QX.V3(t.x, t.y + 0.85, t.z),
      radius: 0.55,
      label: "Card Table",
      verb: "Examine",
      priority: 0,
      enabled: () => !QX.done(LH),
      onInteract: () => U.readTable(),
    });
    // two wrecks as a windbreak, a street lamp that went out with the game
    QX.prop("car", {
      x: t.x - 5.2,
      z: t.z - 2.5,
      yaw: 1.35,
      kind: "coupe",
      wreck: true,
      persistent: true,
    });
    QX.prop("car", {
      x: t.x + 4.8,
      z: t.z + 3.0,
      yaw: -1.9,
      kind: "sedan",
      wreck: true,
      burnt: true,
      persistent: true,
    });

    // ---------------- the skull box ----------------
    const m = QX.freeSpot(SP.box.x, SP.box.z, undefined, {
      maxR: 5,
      radius: 0.5,
    });
    SP.box.x = m.x;
    SP.box.z = m.z;
    SP.box.y = m.y;
    const yaw = -Math.PI / 2; // mail slot faces the avenue (west)
    QX.registerLock(SKULLBOX);
    if (QX.live("containers") && G.containers.create) {
      QX.world.lhBox = QX.safe("lhBox", () =>
        G.containers.create({
          id: "qx_lh_skullbox",
          kind: "mailbox",
          name: "Mailbox (painted skull)",
          pos: { x: m.x, y: m.y, z: m.z },
          yaw,
          lock: SKULLBOX,
          items: [
            [QX.SCRIP_ID, 180],
            [OLD_DOLLARS, 14],
            ["magnum_44", 1],
            ["ammo_44", 18],
            ["scotch", 1],
            ["cigarette_carton", 1],
          ].filter((e) => e[0] === QX.SCRIP_ID || QX.itemExists(e[0])),
        }),
      );
    }
    // no key: a strong stranger can tear the rusted door off (the key path always works too)
    QX.interact({
      pos: QX.V3(m.x, m.y + 0.6, m.z),
      radius: 0.5,
      label: "Rusted Mailbox Door",
      verb: "[Brawn 8] Wrench Open",
      priority: 0,
      enabled: () =>
        !QX.done(LH) &&
        !QX.has("qx_lh_key") &&
        !QX.isUnlocked(SKULLBOX.id) &&
        QX.attr("brawn") >= 8,
      onInteract: () => U.wrenchBox(),
    });
    // the painted skull: a white skull stencil on the mailbox's front (container models face +Z local)
    const sk = k.group(m.x, m.y, m.z, yaw, 90);
    const skull = skullTexture();
    const pm = new THREE.MeshStandardMaterial({
      map: skull,
      transparent: true,
      alphaTest: 0.2,
      roughness: 0.9,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    });
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.38), pm);
    plane.position.set(0, 0.64, 0.254); // the mailbox's front (+Z), over the U.S. MAIL panel
    sk.add(plane);
    // nobody mails anything here: a dead pigeon & a pile of leaves (cheap boxes)
    const lb = k.builder();
    k.box(
      lb,
      k.tint("qx_lh_leaves", 0x5a4a2a, { roughness: 1 }),
      0.8,
      0.06,
      0.5,
      0.2,
      0.03,
      0.55,
      0.4,
    );
    k.flush(lb, sk, false);
    if (!QX.world.lhBox) {
      // no container system: the box is a plain "Open" interactable
      QX.interact({
        pos: QX.V3(m.x, m.y + 1.0, m.z),
        radius: 0.5,
        label: "Mailbox (painted skull)",
        verb: "Open",
        priority: 1,
        enabled: () => !QX.done(LH) && QX.has("qx_lh_key"),
        onInteract: () =>
          QX.openLock(SKULLBOX, () => {
            QX.giveScrip(180);
            U.boxOpened();
          }),
      });
    }

    // ---------------- Getting Warmer ----------------
    const lu = QX.freeSpot(SP.lunch.x, SP.lunch.z, undefined, {
      maxR: 4,
      radius: 0.35,
    });
    SP.lunch.x = lu.x;
    SP.lunch.z = lu.z;
    SP.lunch.y = lu.y;
    const lg = k.group(lu.x, lu.y, lu.z, 0.4, 70);
    const bb = k.builder();
    const tin = k.tint("qx_chalk_lunch", 0xc8402a, {
        roughness: 0.5,
        metalness: 0.5,
      }),
      tin2 = k.tint("qx_chalk_lunch2", 0xe0c040, {
        roughness: 0.5,
        metalness: 0.5,
      });
    k.box(bb, tin, 0.3, 0.2, 0.12, 0, 0.1, 0);
    k.box(bb, tin2, 0.31, 0.03, 0.125, 0, 0.13, 0);
    k.torus(bb, tin2, 0.05, 0, 0.215, 0, 0, Math.PI / 2);
    k.flush(bb, lg, false);
    decal(
      lu.x - 0.9,
      lu.y,
      lu.z + 0.2,
      QX.yawTo(lu.x, lu.z, SP.arrows[0].x, SP.arrows[0].z),
      "start",
    );
    SP.arrows.forEach((a, i) => {
      const p = QX.freeSpot(a.x, a.z, undefined, { maxR: 3, radius: 0.3 });
      a.x = p.x;
      a.z = p.z;
      a.y = p.y;
      decal(p.x, p.y, p.z, QX.yawTo(p.x, p.z, a.to.x, a.to.z), a.text);
    });
    const d = QX.freeSpot(SP.drain.x, SP.drain.z, undefined, {
      maxR: 3,
      radius: 0.4,
    });
    SP.drain.x = d.x;
    SP.drain.z = d.z;
    SP.drain.y = d.y;
    decal(d.x, d.y, d.z, 0, "x");
    const dg = k.group(d.x, d.y, d.z, 0, 70);
    const db = k.builder();
    const iron = k.tint("qx_chalk_grate", 0x2a2724, {
      roughness: 0.6,
      metalness: 0.7,
    });
    for (let i = -3; i <= 3; i++)
      k.box(db, iron, 0.05, 0.03, 0.5, i * 0.08, 0.015, 0);
    k.box(db, iron, 0.6, 0.03, 0.05, 0, 0.015, -0.25);
    k.box(db, iron, 0.6, 0.03, 0.05, 0, 0.015, 0.25);
    k.flush(db, dg, false);
    QX.interact({
      pos: QX.V3(d.x, d.y + 0.3, d.z),
      radius: 0.6,
      label: "Loose Drain Grate",
      verb: "Reach Under",
      priority: 1,
      enabled: () => !QX.flag("chalk_opened"),
      onInteract: () => U.openDrain(),
    });
  });

  // Session pickups: the scorecard on the table, Tommy's note on the lunchbox.
