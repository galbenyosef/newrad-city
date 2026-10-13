/* src/poi_midtown/12_waldorf_sub.js */
/* =====================================================================
 * NEW RAD CITY — poi_midtown / 12_waldorf_sub.js
 * The Waldorf-Astoria SUB-BASEMENT (main story, mq14 "Jamming Season").
 * Down a staff stair from the service stair hall (door on the hall's EAST
 * wall): a concrete plant room under Park Avenue (pipes, a dead pump,
 * crates), the Continuity guard post, and the post's holding cage, where it
 * keeps its prisoners (Ruby Kehoe in mq14: the main story's NPC, anchor
 * `ruby_cell`).
 * The M-61 freight elevator itself (the Waldorf way down to Track 61) is the
 * lair's door on the WEST wall of the service stair hall (src/lair,
 * 30_entrances.js: lock ms_track61_hatch, welded until mq35). Nothing of
 * ours is placed there; this file only publishes the story's anchors for it.
 * Anchors (G.pois.getAnchor('waldorf', name)): sub_basement, sub_stair, ruby_cell, brig,
 *   m61_door (standing spot facing the lair's M-61 door), freight_elevator (that door).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !THREE || !G.PMID) return;
  const K = G.PMID.kit,
    A = G.PMID,
    F = K.f;
  const PI = Math.PI,
    HP = PI / 2;

  K.defineSite("waldorf_sub", 11, function () {
    const rec = A.records && A.records.waldorf;
    if (!rec) return;
    const O = G.LAYOUT.INTERIORS.waldorf.origin;
    const ox = O.x,
      oz = O.z,
      YL = 1.5;
    const KX1 = ox + 16,
      SZ0 = oz - 24;
    const b = K.builder("waldorf_sub", {
      grime: 0.45,
      ambient: 0.55,
      maxLight: 2.6,
      gain: 1.3,
    });
    const glows = K.glowSet("waldorf_sub");

    // ---------------- service stair hall: the staff door down ----------------
    const HDZ = oz - 22.4; // door centre on the hall's east wall
    b.light(KX1 - 1.2, YL + 2.6, HDZ, 4, 0xff6040, 0.6);
    b.box("metal_dark", KX1 - 0.17, YL, HDZ, 0.08, 2.25, 1.2, {
      tint: 0x4e524c,
      grime: 0.6,
    });
    b.box("black_metal", KX1 - 0.2, YL + 2.25, HDZ, 0.1, 0.12, 1.4);
    b.box("steel", KX1 - 0.24, YL + 1.0, HDZ + 0.45, 0.06, 0.06, 0.18); // push bar handle
    const subSign = K.paint("pmid_wa_subsign", 384, 128, (x, w, h) => {
      x.fillStyle = "#d8c060";
      x.fillRect(0, 0, w, h);
      x.fillStyle = "#1a1a14";
      x.fillRect(6, 6, w - 12, h - 12);
      x.fillStyle = "#d8c060";
      K.fitText(
        x,
        "SUB-BASEMENT",
        w / 2,
        h * 0.42,
        w - 30,
        46,
        "bold ",
        "#d8c060",
      );
      K.fitText(
        x,
        "STAFF ONLY · NO ADMITTANCE",
        w / 2,
        h * 0.78,
        w - 30,
        22,
        "bold ",
        "#d8c060",
      );
    });
    b.panel("atlas_paint", KX1 - 0.22, YL + 2.6, HDZ, 0.9, 0.3, -HP, {
      rect: subSign,
      grime: 0.2,
    });
    glows.add(KX1 - 0.4, YL + 2.45, HDZ, 0xff4030, "s");

    // ---------------- the sub-basement (a separate plant room in the cell) ----------------
    const X0 = ox + 26,
      X1 = ox + 44,
      Z0 = oz - 36,
      Z1 = oz - 20,
      Y = 0,
      H = 4.4;
    const EZ = oz - 28;
    b.light((X0 + X1) / 2, Y + 3.6, (Z0 + Z1) / 2, 11, 0xd8d4c0, 0.75);
    b.light(X1 - 2.2, Y + 3.4, EZ, 6, 0xffc890, 0.5);
    b.light(X0 + 3.5, Y + 2.8, Z0 + 3.2, 5, 0xffc070, 0.6); // the cage's bare bulb
    b.light(X0 + 1.5, Y + 2.6, Z1 - 3, 4, 0xffd8a0, 0.5); // the stair landing
    K.room(b, {
      x0: X0,
      x1: X1,
      z0: Z0,
      z1: Z1,
      y: Y,
      h: H,
      floor: "concrete",
      wall: "concrete_dark",
      ceil: "concrete",
      walls: "nsew",
      floorTint: 0x8a8678,
      wallTint: 0x8c897e,
      ceilTint: 0x6a6860,
      base: "black_metal",
      grime: 0.55,
    });
    // stair landing (west): a short flight coming down from the door (visual) + the door frame
    for (let i = 0; i < 5; i++)
      b.box(
        "concrete",
        X0 + 0.45 + i * 0.32,
        Y,
        Z1 - 3.0,
        0.32,
        1.25 - i * 0.25,
        1.6,
        { tint: 0x9a968a },
      );
    K.colBox(X0, Y, Z1 - 3.8, X0 + 0.6, Y + 1.25, Z1 - 2.2, {
      surface: "concrete",
    });
    b.box("metal_dark", X0 + 0.17, Y + 1.25, Z1 - 3.0, 0.08, 2.2, 1.2, {
      tint: 0x4e524c,
    });
    F.railing(b, X0 + 0.4, Z1 - 3.85, X0 + 2.2, Z1 - 3.85, Y, {
      mat: "black_metal",
    });
    // pipes along the ceiling + a dead pump and boiler stub
    F.pipe(b, X0, Y + 3.9, Z0 + 0.6, X1, Y + 3.9, Z0 + 0.6, 0.16);
    F.pipe(b, X0, Y + 3.6, Z0 + 1.1, X1, Y + 3.6, Z0 + 1.1, 0.09, {
      mat: "steel",
    });
    F.pipe(b, X0 + 8, Y + 3.9, Z0 + 0.6, X0 + 8, Y + 3.9, Z1 - 0.5, 0.12);
    F.pipe(b, X0 + 8, Y + 0.3, Z0 + 0.6, X0 + 8, Y + 3.9, Z0 + 0.6, 0.12);
    b.cyl("rust", X0 + 11, Y, Z0 + 1.6, 0.9, 0.9, 1.9, 14, { top: true });
    b.cyl("metal_dark", X0 + 13, Y, Z0 + 1.4, 0.55, 0.55, 1.1, 12, {
      top: true,
    });
    K.colBox(X0 + 10, Y, Z0 + 0.4, X0 + 13.6, Y + 1.9, Z0 + 2.6, {
      surface: "metal",
    });
    F.crate(b, X0 + 15.5, Y, Z1 - 1.2, 0.2, 1.0);
    F.crate(b, X0 + 16.6, Y, Z1 - 1.3, -0.1, 0.9);
    F.crate(b, X0 + 16, Y + 0.8, Z1 - 1.2, 0.4, 0.8, { col: false });
    F.debris(b, X0 + 6, Y, Z1 - 2, 1.0, 6, {
      mats: ["rubble", "concrete_dark"],
    });
    F.papers(b, X0 + 2, Z0 + 5, X1 - 6, Z1 - 4, Y, 10, { tint: 0xa8a090 });
    // the Continuity guard post: desk, field telephone, sandbags facing the elevator
    F.desk(b, X0 + 8.5, Y, Z1 - 4.5, PI);
    b.box("paint_green", X0 + 8.3, Y + 0.78, Z1 - 4.6, 0.3, 0.18, 0.22); // field telephone
    F.chair(b, X0 + 8.5, Y, Z1 - 3.8, PI);
    F.sandbags(b, X1 - 6.5, Y, EZ, HP, 3.2, 2);
    const ordTex = K.paint("pmid_wa_suborders", 256, 340, (x, w, h) => {
      x.fillStyle = "#e8e2cc";
      x.fillRect(0, 0, w, h);
      x.fillStyle = "#1a1a14";
      x.font = "bold 22px " + K.SANS;
      x.textAlign = "center";
      x.fillText("CONTINUITY", w / 2, 34);
      x.font = "bold 16px " + K.SANS;
      x.fillText("POST ORDERS — SUB-LEVEL", w / 2, 58);
      x.font = "14px " + K.FONT;
      x.textAlign = "left";
      [
        "1. The M-61 elevator stays SEALED.",
        "2. Any sound from the shaft is",
        "    to be reported, not investigated.",
        "3. Prisoners are fed at 0800.",
        "4. No candles on this level.",
        "    (Ask Sgt. Okwu why.)",
      ].forEach((t, i) => x.fillText(t, 18, 100 + i * 26));
      K.stains(x, w, h, 3, 41, 0.2);
    });
    b.panel("atlas_paint", X0 + 9.8, Y + 1.7, Z1 - 0.17, 0.5, 0.66, PI, {
      rect: ordTex,
      grime: 0.3,
    });

    // ---------------- the holding cage (south-west corner) ----------------
    const CX0 = X0 + 0.4,
      CX1 = X0 + 5.2,
      CZ0 = Z0 + 0.4,
      CZ1 = Z0 + 5.0;
    const bars = (ax, az, bx, bz, gap) => {
      const L = Math.hypot(bx - ax, bz - az),
        n = Math.round(L / 0.16);
      for (let i = 0; i <= n; i++) {
        const t = i / n,
          x = ax + (bx - ax) * t,
          z = az + (bz - az) * t;
        if (gap && t > gap[0] && t < gap[1]) continue;
        b.beam("black_metal", x, Y, z, x, Y + 2.8, z, 0.035, { round: 6 });
      }
      b.beam("black_metal", ax, Y + 2.8, az, bx, Y + 2.8, bz, 0.06);
      b.beam("black_metal", ax, Y + 1.2, az, bx, Y + 1.2, bz, 0.04);
    };
    bars(CX1, CZ0, CX1, CZ1, [0.62, 0.86]); // east side (the door gap, door standing open)
    bars(CX0, CZ1, CX1, CZ1); // north side
    K.colBox(
      CX1 - 0.06,
      Y,
      CZ0,
      CX1 + 0.06,
      Y + 2.8,
      CZ0 + (CZ1 - CZ0) * 0.62,
      { walkable: false },
    );
    K.colBox(
      CX1 - 0.06,
      Y,
      CZ0 + (CZ1 - CZ0) * 0.86,
      CX1 + 0.06,
      Y + 2.8,
      CZ1,
      { walkable: false },
    );
    K.colBox(CX0, Y, CZ1 - 0.06, CX1, Y + 2.8, CZ1 + 0.06, { walkable: false });
    // the cage door, swung open against the east bars
    const dz0 = CZ0 + (CZ1 - CZ0) * 0.62;
    for (let i = 0; i < 7; i++)
      b.beam(
        "black_metal",
        CX1 + 0.12 + i * 0.16,
        Y,
        dz0 - 0.05,
        CX1 + 0.12 + i * 0.16,
        Y + 2.2,
        dz0 - 0.05,
        0.03,
        { round: 6 },
      );
    b.box("steel", CX1 + 0.6, Y + 1.0, dz0 - 0.05, 0.14, 0.18, 0.1); // padlock hasp
    F.bed(b, CX0 + 1.0, Y, CZ0 + 2.4, 0, { tint: 0x6a6a5a });
    b.box("metal_dark", CX0 + 3.6, Y, CZ0 + 0.8, 0.35, 0.4, 0.35, {
      tint: 0x5a5a50,
    }); // bucket
    glows.add(CX0 + 2.4, Y + 2.9, CZ0 + 2.6, 0xffc070, "s");
    b.beam(
      "black_metal",
      CX0 + 2.4,
      Y + 3.0,
      CZ0 + 2.6,
      CX0 + 2.4,
      Y + H,
      CZ0 + 2.6,
      0.015,
    );
    const cageSign = K.paint("pmid_wa_cagesign", 320, 96, (x, w, h) => {
      x.fillStyle = "#c8302a";
      x.fillRect(0, 0, w, h);
      K.fitText(
        x,
        "HOLDING — CONTINUITY USE",
        w / 2,
        h * 0.62,
        w - 20,
        34,
        "bold ",
        "#f0e8d8",
      );
    });
    b.panel("atlas_paint", CX1 + 0.05, Y + 2.45, CZ0 + 1.2, 0.9, 0.27, HP, {
      rect: cageSign,
      grime: 0.3,
    });

    b.finish(rec.interiorRoot, { cast: false });
    glows.finish(rec.interiorRoot, { interior: true, nightOpacity: 0.95 });

    // ---------------- anchors ----------------
    const AN = (n, x, y, z, yaw) => {
      const v = rec.anchor(n, x, y, z, yaw);
      v.interior = "waldorf";
      return v;
    };
    AN("sub_stair", KX1 - 1.4, YL, HDZ, -HP);
    AN("sub_basement", (X0 + X1) / 2, Y, (Z0 + Z1) / 2 + 2, -HP);
    AN("m61_door", ox + 6.9, YL, oz - 18.6, HP); // the lair's M-61 door, west wall of the service stair hall (src/lair)
    AN("freight_elevator", ox + 5.4, YL + 1.3, oz - 18.6, HP);
    AN("ruby_cell", CX0 + 2.6, Y, CZ0 + 3.4, HP);
    AN("brig", CX1 + 1.2, Y, CZ0 + 2.8, HP);

    // ---------------- doors + the M-61 interaction ----------------
    const upArr = { x: KX1 - 1.4, y: YL, z: HDZ, yaw: HP };
    K.door(rec, {
      id: "pmid_wa_sub_down",
      pos: new THREE.Vector3(KX1 - 0.4, YL + 1.2, HDZ),
      label: "Staff Stair — Sub-basement",
      verb: "Descend",
      target: { x: X0 + 2.6, y: Y, z: Z1 - 4.6, yaw: -HP },
    });
    K.door(rec, {
      id: "pmid_wa_sub_up",
      pos: new THREE.Vector3(X0 + 0.45, Y + 2.4, Z1 - 3.0),
      label: "Staff Stair — Kitchen Level",
      verb: "Climb",
      target: upArr,
    });
  });
})();
