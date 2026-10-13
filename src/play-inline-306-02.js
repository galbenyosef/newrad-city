// play-inline-306 02 — the
// Lines 24-290 of readable/play-inline-306.pretty.js (statement-aligned).
  const P = G._pe,
    D = P.dress;
  const PI = P.PI,
    HP = P.HP,
    TAU = P.TAU;
  const DN = (P.dn = P.dn || {});
  const RC = { x: 0, z: 8 },
    RR = 11; // rotunda centre / radius (10_journal_bldg.js)
  const atR = (a, r) => [RC.x + Math.sin(a) * r, RC.z + Math.cos(a) * r];

  function sunTex() {
    return P.texMat(
      "dn_relay_sun",
      P.canvasTex(
        "dn_relay_sun",
        256,
        256,
        (x, w) => {
          x.clearRect(0, 0, w, w);
          const c = w / 2;
          x.strokeStyle = "rgba(236,226,200,0.8)";
          x.fillStyle = "rgba(236,226,200,0.8)";
          x.lineWidth = 7;
          x.beginPath();
          x.arc(c, c, 34, 0, TAU);
          x.stroke();
          for (let i = 0; i < 12; i++) {
            const a = (i / 12) * TAU;
            x.beginPath();
            x.moveTo(c + Math.cos(a) * 48, c + Math.sin(a) * 48);
            x.lineTo(c + Math.cos(a) * 112, c + Math.sin(a) * 112);
            x.stroke();
          }
        },
        { clamp: true },
      ),
      { transparent: true, rough: 1 },
    );
  }

  function cut() {
    try {
      if (G.isStub("quests")) return false;
      const Q = G.quests;
      return !!(
        Q.flag("ms_dawn_relay_cut") ||
        Q.flag("dawn_relay_cut") ||
        Q.flag("ms_dawn_relay") === "cut"
      );
    } catch (e) {
      return false;
    }
  }

  P.addBuilder(
    "dn_relay",
    function () {
      const O = P.I("journal_bldg");
      const S = P.site("dn_relay_int", {
        ox: O.x,
        oy: O.y,
        oz: O.z,
        lit: true,
        ambient: 0x5a5448,
        ambI: 0.4,
        interiorKey: "journal_bldg",
      });
      const b = S.b;
      // ---------- the relay stack (rotunda, east wall, between the east opening and the SE torchere) ----------
      const a = 2.0,
        [rx, rz] = atR(a, RR - 1.1);
      const ry = a + PI; // the stack's front faces the globe
      const M = P.m4(rx, 0, rz, ry);
      const add = (key, g, o) =>
        b.geo(key, g, M, Object.assign({ noAO: true, grime: 0.45 }, o || {}));
      add("crate", new THREE.BoxGeometry(1.3, 0.6, 0.8).translate(0, 0.3, 0));
      add(
        "crate",
        new THREE.BoxGeometry(0.9, 0.5, 0.7).translate(-0.9, 0.25, 0.1),
      );
      add(
        "press_green",
        new THREE.BoxGeometry(1.1, 0.55, 0.6).translate(0, 0.88, 0),
      ); // receiver
      add(
        "press_green",
        new THREE.BoxGeometry(0.9, 0.45, 0.55).translate(0, 1.38, -0.02),
      ); // transmitter
      add(
        "press_dark",
        new THREE.BoxGeometry(0.5, 0.4, 0.5).translate(-0.9, 0.7, 0.1),
      ); // the power pack
      for (let i = 0; i < 4; i++)
        add(
          "chrome",
          new THREE.CylinderGeometry(0.035, 0.035, 0.03, 10)
            .rotateX(HP)
            .translate(-0.35 + i * 0.22, 0.88, 0.31),
        ); // knobs
      add(
        "screen",
        new THREE.BoxGeometry(0.34, 0.14, 0.01).translate(0.25, 1.42, 0.26),
      ); // tuning dial
      add(
        "paper",
        new THREE.BoxGeometry(0.3, 0.22, 0.005)
          .rotateX(-0.2)
          .translate(-0.25, 1.48, 0.25),
      ); // a taped schedule card
      // the whip aerial up into the dome
      const top = new THREE.Vector3(0.2, 7.6, -0.35).applyMatrix4(M),
        base = new THREE.Vector3(0.2, 1.6, -0.1).applyMatrix4(M);
      b.rod("steel", base, top, 0.015, 4);
      // the feeder cable: across the floor to the trench grate, then down
      const GA = 2.2,
        [gx, gz] = atR(GA, RR - 0.6);
      const c0 = new THREE.Vector3(0.45, 0.5, -0.3).applyMatrix4(M);
      b.rod("rubber", [c0.x, c0.y, c0.z], [c0.x, 0.03, c0.z], 0.035, 6);
      b.rod("rubber", [c0.x, 0.03, c0.z], [gx, 0.03, gz], 0.035, 6);
      b.box("iron", gx - 0.45, 0.0, gz - 0.35, gx + 0.45, 0.025, gz + 0.35, {
        seg: false,
        noAO: true,
        ry: GA,
      });
      for (let k = 0; k < 6; k++)
        b.box(
          "paint_black",
          gx - 0.4 + k * 0.15,
          0.026,
          gz - 0.3,
          gx - 0.34 + k * 0.15,
          0.03,
          gz + 0.3,
          { seg: false, noAO: true },
        );
      // the chalked sun on the floor in front, candle stubs (unlit — the relay runs before dawn and nobody stays)
      b.quad(
        sunTex(),
        rx + Math.sin(a + PI) * 1.4,
        0.015,
        rz + Math.cos(a + PI) * 1.4,
        1.5,
        1.5,
        { rx: -HP, ry: a },
      );
      D.candles(
        S,
        rx + Math.sin(a + PI) * 1.0 + 0.5,
        0.0,
        rz + Math.cos(a + PI) * 1.0,
        4,
        { r: 0.1, i: 0.01, size: 0.2 },
      );
      S.col(rx - 1.0, 0, rz - 0.9, rx + 1.0, 1.65, rz + 0.9, {
        walkable: false,
      });
      // live tubes + dial glow: separate (toggleable) meshes, not merged into the batch
      const live = new THREE.Group();
      live.name = "dn_relay_live";
      const tubeMat = new THREE.MeshBasicMaterial({
        color: 0xffa860,
        toneMapped: false,
      });
      for (let i = 0; i < 5; i++) {
        const t = new THREE.Mesh(
          new THREE.CylinderGeometry(0.03, 0.03, 0.1, 8),
          tubeMat,
        );
        t.position
          .copy(
            new THREE.Vector3(-0.32 + i * 0.16, 1.66, -0.05).applyMatrix4(M),
          )
          .add(S.W(0, 0, 0));
        live.add(t);
      }
      const dial = new THREE.Mesh(
        new THREE.PlaneGeometry(0.32, 0.12),
        new THREE.MeshBasicMaterial({ color: 0x9adfa0, toneMapped: false }),
      );
      dial.position
        .copy(new THREE.Vector3(0.25, 1.49, 0.27).applyMatrix4(M))
        .add(S.W(0, 0, 0));
      dial.rotation.y = ry;
      live.add(dial);
      S.root.add(live);
      DN.relayLive = live;
      S.light(
        rx + Math.sin(a + PI) * 0.8,
        1.6,
        rz + Math.cos(a + PI) * 0.8,
        0xffa860,
        3.5,
        0.5,
      );
      // anchors
      S.anchor("globe_room", 4.6, 0, 4.4, -0.9);
      const [sx, sz] = atR(a, RR - 2.6);
      S.anchor("relay", sx, 0, sz, a + PI); // standing in front of the stack, facing it
      S.anchor(
        "relay_grate",
        gx + Math.sin(GA + PI) * 0.9,
        0,
        gz + Math.cos(GA + PI) * 0.9,
        GA + PI,
      );
      S.build({ interior: true });
      P.addInterior("journal_bldg", S.root);
      for (const k in S.anchors) S.anchors[k].interior = "journal_bldg";

      // ---------- 42nd Street: the cable comes out under a sidewalk vault grate, heading west ----------
      const E = P.site("dn_relay_ext", { grime: 0.5 });
      const eb = E.b;
      const GX = 299.4,
        GZ = -236.6,
        SW = 0.13;
      eb.box(
        "iron",
        GX - 0.6,
        SW - 0.01,
        GZ - 0.4,
        GX + 0.6,
        SW + 0.012,
        GZ + 0.4,
        { seg: false, noAO: true },
      );
      for (let k = 0; k < 8; k++)
        eb.box(
          "paint_black",
          GX - 0.55 + k * 0.15,
          SW + 0.012,
          GZ - 0.36,
          GX - 0.5 + k * 0.15,
          SW + 0.016,
          GZ + 0.36,
          { seg: false, noAO: true },
        );
      eb.rod(
        "rubber",
        [GX + 0.3, SW + 0.02, GZ - 0.2],
        [GX + 0.3, SW + 0.02, -238.0],
        0.03,
        6,
      ); // a loop of feeder cable pulled up through the bars
      eb.quad(sunTex(), GX - 1.3, SW + 0.02, GZ, 0.6, 0.6, { rx: -HP }); // a chalk sun on the paving, pointing west
      eb.rod(
        "paint_white",
        [GX - 1.9, SW + 0.02, GZ],
        [GX - 3.1, SW + 0.02, GZ],
        0.02,
        3,
      );
      E.anchor("cable_grate", GX + 0.9, SW - 0.01, GZ + 1.4, HP);
      E.build({ lod: 160 });
      const rec = G.pois && G.pois.journal_bldg;
      if (rec && rec.anchors) Object.assign(rec.anchors, S.anchors, E.anchors);
      // state: tubes go dark when the story cuts the relay
      let tt = 0;
      P.tick = P.tick || [];
      P.tick.push((dt, realDt) => {
        tt -= realDt;
        if (tt > 0) return;
        tt = 1;
        if (DN.relayLive) DN.relayLive.visible = !cut();
      });
    },
    55,
  );
