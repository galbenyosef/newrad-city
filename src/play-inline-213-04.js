// play-inline-213 04 — add
// Lines 793-1102 of readable/play-inline-213.pretty.js (statement-aligned).
  function buildFerry(b, M) {
    const add = (key, geo, m, o) =>
      b.add(
        key,
        geo,
        Object.assign(
          {
            m: new THREE.Matrix4().multiplyMatrices(M, m),
            grime: 0.8,
            ground: -1.2,
          },
          o || {},
        ),
      );
    const hull = new THREE.CapsuleGeometry(4.2, 26, 4, 12);
    hull.rotateX(Math.PI / 2);
    hull.scale(1.25, 0.55, 1);
    add("rust", hull, PH.m4(0, 1.2, 0), { c: 0x8a7a70 });
    add("paint_black", new THREE.BoxGeometry(10.8, 0.6, 30), PH.m4(0, 2.6, 0));
    add("paint_white", new THREE.BoxGeometry(8.6, 2.6, 22), PH.m4(0, 4.2, 0), {
      c: 0xc8c0b0,
    });
    for (let k = 0; k < 10; k++)
      for (const s of [-1, 1])
        add(
          "shadow",
          new THREE.PlaneGeometry(1.1, 1.0),
          PH.m4(s * 4.31, 4.4, -9.5 + k * 2.1, (s * Math.PI) / 2),
        );
    add("paint_cream", new THREE.BoxGeometry(9.4, 0.25, 23), PH.m4(0, 5.6, 0));
    for (const zz of [-8, 8]) {
      add(
        "paint_cream",
        new THREE.BoxGeometry(3.4, 2.0, 2.6),
        PH.m4(0, 6.8, zz),
        { c: 0xc8c0b0 },
      );
      add("glass", new THREE.BoxGeometry(3.5, 0.7, 2.7), PH.m4(0, 7.3, zz));
      add("rust", new THREE.BoxGeometry(3.8, 0.2, 3.0), PH.m4(0, 7.9, zz));
    }
    add(
      "paint_black",
      new THREE.CylinderGeometry(0.9, 1.0, 4.0, 12),
      PH.m4(0, 7.4, 0),
      { c: 0x6a4a3a },
    );
    const nameK = PH.signMat(
      "ferry_name",
      ["ELLIS ISLAND"],
      "engraved",
      512,
      96,
      { bg: "#2a2a28", fg: "#c8c0a0" },
    );
    for (const s of [-1, 1])
      add(
        nameK,
        new THREE.PlaneGeometry(5, 0.8),
        PH.m4(s * 5.3, 2.55, 0, (s * Math.PI) / 2),
        { uv: "keep", grime: 0.1, noAO: true },
      );
  }

  /** Small outboard skiff (wooden) at local origin, length along Z. */
  function buildSkiff(b, M) {
    const add = (key, geo, m, o) =>
      b.add(
        key,
        geo,
        Object.assign(
          {
            m: new THREE.Matrix4().multiplyMatrices(M, m),
            grime: 0.6,
            ground: -1.2,
          },
          o || {},
        ),
      );
    const hull = new THREE.CylinderGeometry(
      1.1,
      0.7,
      5.6,
      10,
      1,
      true,
      0,
      Math.PI,
    );
    hull.rotateZ(Math.PI);
    hull.rotateX(Math.PI / 2);
    hull.scale(1, 0.7, 1);
    add("wood", hull, PH.m4(0, 0.75, 0), { c: 0x7a6a58 });
    add(
      "paint_teal",
      new THREE.BoxGeometry(2.2, 0.14, 5.4),
      PH.m4(0, 0.78, 0),
      {},
    );
    add("wood", new THREE.BoxGeometry(1.8, 0.1, 0.4), PH.m4(0, 0.55, 0.6));
    add("wood", new THREE.BoxGeometry(1.8, 0.1, 0.4), PH.m4(0, 0.55, -1.2));
    add(
      "paint_black",
      new THREE.BoxGeometry(0.4, 0.55, 0.45),
      PH.m4(0, 1.0, -2.8),
    );
    add(
      "rust",
      new THREE.CylinderGeometry(0.06, 0.06, 0.9, 6),
      PH.m4(0, 0.4, -2.95),
    );
    add("rust", new THREE.BoxGeometry(0.5, 0.35, 0.5), PH.m4(0, 0.45, 2.2));
  }
  PH.buildSkiff = buildSkiff;

  function flagTex() {
    return PH.canvasTex("ph_flag", 512, 288, (ctx, w, h) => {
      const sh = h / 13;
      for (let i = 0; i < 13; i++) {
        ctx.fillStyle = i % 2 ? "#d8d0bc" : "#8a2a24";
        ctx.fillRect(0, i * sh, w, sh + 1);
      }
      const cw = w * 0.42,
        ch = sh * 7;
      ctx.fillStyle = "#26345a";
      ctx.fillRect(0, 0, cw, ch);
      ctx.fillStyle = "#e0d8c4";
      for (let i = 0; i < 13; i++) {
        const a = (i / 13) * TAU - Math.PI / 2;
        ctx.beginPath();
        ctx.arc(
          cw / 2 + Math.cos(a) * ch * 0.34,
          ch / 2 + Math.sin(a) * ch * 0.34,
          ch * 0.05,
          0,
          TAU,
        );
        ctx.fill();
      }
      const r = PH.rng("flag");
      for (let i = 0; i < 40; i++) {
        ctx.fillStyle = "rgba(40,30,20," + (0.05 + r() * 0.2) + ")";
        ctx.beginPath();
        ctx.ellipse(
          r() * w,
          r() * h,
          10 + r() * 50,
          6 + r() * 30,
          r() * 3,
          0,
          TAU,
        );
        ctx.fill();
      }
      ctx.globalCompositeOperation = "destination-out";
      for (let i = 0; i < 9; i++) {
        ctx.beginPath();
        ctx.arc(w - r() * 60, r() * h, 6 + r() * 20, 0, TAU);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    });
  }

  // -------------------------------------------------------------------
  // Battery Park side: skiff pier with a boarding stile over the promenade railing
  // -------------------------------------------------------------------
  function buildBatteryPier(root) {
    const L = G.LAYOUT;
    const b = PH.batch("battery_skiff_pier");
    // shoreline point on the SW edge of the Battery (between Castle Clinton and the old Pier A)
    let sx = -160,
      sz = 950;
    for (let t = 0; t < 60; t++) {
      const z = 930 + t * 0.5;
      if (!L.isManhattan(sx, z)) {
        sz = z - 0.2;
        break;
      }
    }
    const nx = -Math.SQRT1_2,
      nz = Math.SQRT1_2; // outward (water) direction
    const ry = Math.atan2(nx, nz); // local +Z = outward
    const P = (lx, lz) => PH.rot(sx, sz, ry, lx, lz);
    const DECK = 0.45,
      LEN = 22,
      W = 3.2;
    // deck (planks) on pilings, from 3 m inland (over the promenade stile) out to LEN
    {
      const [cx, cz] = P(0, 1 + LEN / 2);
      b.box("wood", cx, DECK - 0.3, cz, W, 0.3, LEN, {
        ry,
        grime: 0.6,
        ground: -1.2,
      });
      PH.col(cx, cz, W, LEN, -3, DECK, ry, { surface: "wood" });
      for (let lz = 2; lz <= LEN + 1; lz += 3)
        for (const s of [-1, 1]) {
          const [px, pz] = P(s * (W / 2 - 0.15), lz);
          b.cyl("rotten", px, -5, pz, 0.2, 0.22, 5.8, 6, {
            hSeg: 2,
            ground: -1.2,
          });
        }
      // rope rails
      for (const s of [-1, 1]) {
        const pts = [];
        for (let lz = 2; lz <= LEN + 1; lz += 4) {
          const [px, pz] = P(s * (W / 2 - 0.1), lz);
          pts.push([px, pz]);
        }
        PH.railing(b, pts, DECK, 1.0, "rotten", { postStep: 4, r: 0.05 });
      }
    }
    // stile: steps up from the promenade (land side), a small platform over the iron railing, steps down to the deck
    {
      const [ax, az] = P(0, -3.4);
      PH.stairs(b, "wood", ax, az, ry, 1.8, 1.6, 0.05, 1.3, {
        maxRise: 0.3,
        rails: "rotten",
      });
      const [px, pz] = P(0, -1.8 + 1.1);
      b.box("wood", px, 0, pz, 1.8, 1.3, 2.2, { ry, grime: 0.5 });
      PH.col(px, pz, 1.8, 2.2, 0, 1.3, ry, { surface: "wood" });
      const [dx, dz] = P(0, 0.3);
      PH.stairs(b, "wood", dx, dz, ry, 1.8, 1.2, 1.3, DECK, { maxRise: 0.3 });
    }
    // skiff moored at the pier head, booth & sign
    const [kx, kz] = P(W / 2 + 1.3, LEN - 3);
    buildSkiff(b, PH.m4(kx, -1.05, kz, ry + 0.06));
    const [bx, bz] = P(-W / 2 + 0.2, 3.5);
    b.box("panel", bx, DECK, bz, 1.6, 2.4, 1.6, { ry, grime: 0.6 });
    b.box("paint_teal", bx, DECK + 2.4, bz, 2.0, 0.18, 2.0, { ry, seg: false });
    const signK = PH.signMat(
      "battery_ellis_skiff",
      ["HARBOR SKIFF", "ELLIS ISLAND ▸ THE REGISTRY"],
      "enamel",
      512,
      192,
      { bg: "#2a4a3a" },
    );
    const [qx, qz] = P(-W / 2 + 0.2, 2.68);
    b.quad(signK, qx, DECK + 1.7, qz, 1.5, 0.56, { ry: ry + Math.PI });
    PH.col(bx, bz, 1.6, 1.6, DECK, DECK + 2.6, ry, { walkable: false });
    const g = b.build(root);
    g.name = "battery_ellis_skiff";
    const [ex, ez] = P(W / 2 - 0.2, LEN - 3);
    const [ax2, az2] = P(0, LEN - 5);
    PH.BATTERY = {
      skiffDoor: PH.v3(ex, DECK + 0.8, ez),
      arrive: {
        x: ax2,
        y: DECK + 0.05,
        z: az2,
        yaw: ry /* face out along the pier? no: face inland */ + 0,
      },
    };
    // arrival faces inland (back toward the Battery): actor yaw facing -outward
    PH.BATTERY.arrive.yaw = PH.yawTo(ax2, az2, sx, sz);
    return {
      skiff: PH.anchor(ax2, DECK, az2, 0),
      stile: PH.anchor(sx, 0, sz, 0),
    };
  }

  PH.addBuilder(
    "ellis_ext",
    function () {
      const root = new THREE.Group();
      root.name = "poi_ellis_island";
      G.scene.add(root);
      const anchors = buildEllis(root);
      const bp = buildBatteryPier(root);
      anchors.battery_skiff = bp.skiff;
      PH.ellisExt = { root, anchors };
      // harbor skiff doors: Battery Park seawall pier <-> Ellis Island boat ramp
      try {
        const E = PH.ELLIS,
          B = PH.BATTERY;
        G.world.addDoor({
          id: "ph_skiff_to_ellis",
          pos: B.skiffDoor,
          label: "Harbor Skiff to Ellis Island",
          verb: "Ride",
          radius: 1.6,
          target: E.arrive,
          sound: "door_open",
          onEnter: () =>
            G.notify(
              "The skiff putters across the Upper Bay toward the copper domes of Ellis Island...",
            ),
        });
        G.world.addDoor({
          id: "ph_skiff_to_battery",
          pos: E.skiffDoor,
          label: "Harbor Skiff to Battery Park",
          verb: "Ride",
          radius: 1.6,
          target: B.arrive,
          sound: "door_open",
          onEnter: () =>
            G.notify("The skiff noses back into the Battery seawall."),
        });
      } catch (e) {
        PH.safe("skiff doors", () => {
          throw e;
        });
      }
    },
    10,
  );
