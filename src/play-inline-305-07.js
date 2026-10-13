// play-inline-305 07 — ctx
// Lines 2146-2251 of readable/play-inline-305.pretty.js (statement-aligned).
  P.CUSTOM.roller_tex = [
    256,
    128,
    (ctx, w, h) => {
      const r = P.rng("roller");
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#2a2c2a");
      g.addColorStop(0.5, "#707470");
      g.addColorStop(1, "#2a2c2a");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 6; i++) {
        ctx.fillStyle = "rgba(10,10,12,0.8)";
        ctx.fillRect((i * w) / 6, 0, 6, h);
      }
      for (let i = 0; i < 30; i++) {
        ctx.fillStyle = "rgba(10,10,12," + r() * 0.4 + ")";
        ctx.fillRect(r() * w, 0, 2, h);
      }
    },
  ];
  P.CUSTOM.web_tex = [
    512,
    128,
    (ctx, w, h) => {
      const r = P.rng("web");
      ctx.fillStyle = "#dcd4bc";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(40,36,30,0.45)";
      for (let x = 8; x < w; x += 64)
        for (let y = 10; y < h - 6; y += 6)
          ctx.fillRect(x, y, 44 * (0.6 + r() * 0.4), 2);
    },
  ];
  P.MAT.roller = {
    custom: "roller_tex",
    color: 0x606460,
    metal: 0.6,
    rough: 0.4,
    uv: 1,
    keep: true,
  };
  P.MAT.web = {
    custom: "web_tex",
    color: 0xd8d0b8,
    rough: 1,
    uv: 1,
    keep: true,
    noShadow: true,
  };

  P.addBuilder(
    "journal_bldg",
    function () {
      const EX = buildExterior(),
        ES = EX.S;
      const I = buildInterior();
      const O = P.I("journal_bldg");
      P.addInterior("journal_bldg", I.root);
      DN.extRoot = ES.root;
      ES.door(
        EX.doorX,
        1.6,
        EX.doorZ + 0.35,
        "First Journal Building",
        { x: O.x, y: O.y, z: O.z + 24.2, yaw: 0 },
        {
          id: "pe_dn_front",
          radius: 2.0,
          onEnter: () => P.safe("disc", () => G.discover("journal_bldg")),
        },
      );
      I.door(
        0,
        1.5,
        26.7,
        "42nd Street",
        { x: EX.doorX, y: 0, z: EX.doorZ + 2.6, yaw: PI },
        { id: "pe_dn_front_in", verb: "Exit", radius: 1.8 },
      );
      // loading dock loop: pressroom ⇄ east side of the building
      I.door(
        23.6,
        -6 + 2.4,
        -31,
        "Loading Dock (outside)",
        { x: 331.4, y: 0, z: -252, yaw: -HP },
        { id: "pe_dn_dock_in", verb: "Exit", radius: 1.8, sound: "door_open" },
      );
      ES.door(
        329.3,
        1.6,
        -252,
        "First Journal — Pressroom Dock",
        { x: O.x + 22.6, y: O.y - 6 + 1.0, z: O.z - 32.8, yaw: 2.0 },
        { id: "pe_dn_dock", radius: 1.8 },
      ); // arrival faces west along the dock apron (clear), away from the dock door
      P.register("journal_bldg", {
        root: ES.root,
        interiorRoot: I.root,
        interiorKey: "journal_bldg",
        anchors: Object.assign({}, ES.anchors, I.anchors),
      });
    },
    10,
  );
