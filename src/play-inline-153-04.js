// play-inline-153 04 — ctx
// Lines 1028-1129 of readable/play-inline-153.pretty.js (statement-aligned).
  function nurseryTex() {
    return P.canvasTex("pu_dak_nursery", 1024, 300, (ctx, w, h) => {
      const r = P.rng("nurs");
      ctx.fillStyle = "#e8d0d0";
      ctx.fillRect(0, 0, w, h);
      // parade of ducks and moons
      for (let i = 0; i < 9; i++) {
        const x = 60 + i * 110,
          y = h * 0.6;
        ctx.fillStyle = "#e8c860";
        ctx.beginPath();
        ctx.ellipse(x, y, 34, 22, 0, 0, TAU);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 28, y - 22, 14, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "#d8883a";
        ctx.beginPath();
        ctx.moveTo(x + 40, y - 22);
        ctx.lineTo(x + 54, y - 18);
        ctx.lineTo(x + 40, y - 14);
        ctx.fill();
        ctx.fillStyle = "#6a88b8";
        ctx.beginPath();
        ctx.arc(x, h * 0.2, 16, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "#e8d0d0";
        ctx.beginPath();
        ctx.arc(x + 8, h * 0.18, 14, 0, TAU);
        ctx.fill();
      }
      ctx.fillStyle = "#8a5a6a";
      ctx.font = "bold 34px " + P.FONTS.SERIF;
      ctx.textAlign = "center";
      ctx.fillText("Hush, little Ada, don't you cry", w / 2, h * 0.93);
      P.blotches(ctx, w, h, r, 40, 0.35);
      ctx.fillStyle = "rgba(80,20,20,0.6)";
      ctx.font = "bold 42px Impact, sans-serif";
      ctx.fillText("SHE IS STILL SINGING", w * 0.7, h * 0.42);
    });
  }
  // ===================================================================
  // Street <-> interior doors & registration — called by 20_dakota.js's builder right
  // after buildExterior() (E = its site context).
  // ===================================================================
  P.interiorBuilders.dakota = function (E) {
    const I = buildInterior();
    const O = P.I("dakota");
    E.door(
      -171.7,
      1.4,
      -622,
      "The Dakota — Residents' Stair",
      { x: O.x, y: O.y + FLOOR_Y, z: O.z + 10, yaw: 0 },
      {
        radius: 1.3,
        onEnter: () => P.safe("disc", () => G.discover("dakota")),
      },
    );
    I.door(
      0,
      1.4,
      11.6,
      "The Dakota — Courtyard",
      { x: -170.3, y: 0, z: -622, yaw: -HP },
      { verb: "Exit", radius: 1.3 },
    );
    // servants' stair: one-way shortcut out (basement and 3rd floor → courtyard service door), barred from inside
    const svcOut = { x: -160, y: 0, z: -623.8, yaw: PI }; // on the lane between the planters, facing the courtyard
    const svc = P.barDoor(
      E.door(
        -160,
        1.4,
        -625.3,
        "The Dakota — Service Door",
        { x: O.x - 23.2, y: O.y + FLOOR_Y - 4.5, z: O.z + 5, yaw: -HP },
        { id: "pu_dakota_service", radius: 1.3 },
      ),
      {
        message: "The service door is barred from the inside.",
        unbarMessage:
          "You lift the bar from the service door. A shortcut back into the Dakota.",
      },
    );
    I.door(-25.4, -4.5 + 1.4, 5, "Service Stair — Courtyard", svcOut, {
      verb: "Exit",
      radius: 1.3,
      onEnter: () => svc.unbar(),
    });
    I.door(25.4, 9 + 1.4, 5, "Servants' Stair — Courtyard", svcOut, {
      verb: "Exit",
      radius: 1.3,
      onEnter: () => svc.unbar(),
    });
    P.register("dakota", {
      root: E.root,
      interiorRoot: I.root,
      interiorKey: "dakota",
      anchors: Object.assign({}, E.anchors, I.anchors),
      doors: { svc },
    });
  };
