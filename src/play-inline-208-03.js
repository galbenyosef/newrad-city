// play-inline-208 03 — seg
// Lines 332-557 of readable/play-inline-208.pretty.js (statement-aligned).
  function facade(b, u, i, bays, bw, fs, r) {
    const RZ0 = 680,
      RZ1 = 694,
      zf = fs > 0 ? RZ1 : RZ0,
      ry = fs > 0 ? 0 : PI;
    const Z = (d) => zf + fs * d;
    // ground storey: granite band, piers, cast-iron shopfronts
    b.boxMM(
      "granite",
      u.x0,
      0,
      Math.min(Z(0), Z(0.2)),
      u.x1,
      4.0,
      Math.max(Z(0), Z(0.2)),
      { seg: false, grime: 0.55 },
    );
    for (let k = 0; k <= bays; k++)
      b.box("granite", u.x0 + k * bw, 0, Z(0.3), 0.6, 4.0, 0.3, {
        seg: false,
        grime: 0.5,
      });
    for (let k = 0; k < bays; k++) {
      const cx = u.x0 + (k + 0.5) * bw,
        roll = r(),
        door = k === 1;
      b.quad(
        roll < 0.35 ? "planks" : roll < 0.55 ? "glass_broken" : "glass_dark",
        cx,
        1.8,
        Z(0.21),
        bw - 0.9,
        3.0,
        { ry, uv: "box", noAO: true },
      );
      for (const dx of [-(bw - 0.9) / 6, (bw - 0.9) / 6])
        b.box("iron", cx + dx, 0.3, Z(0.24), 0.07, 2.9, 0.06, { seg: false });
      b.box("iron", cx, 2.6, Z(0.25), bw - 0.9, 0.08, 0.07, { seg: false });
      b.box("granite", cx, 0, Z(0.3), bw - 0.8, 0.45, 0.2, {
        seg: false,
        grime: 0.6,
      }); // stall riser
      if (door) {
        b.box("glass_dark", cx, 0, Z(0.16), 1.2, 2.4, 0.08, { seg: false });
        b.box("rotten", cx + 0.35, 0.02, Z(0.62), 1.15, 2.3, 0.06, {
          ry: fs * 0.9,
          seg: false,
        });
      }
      // tattered canvas awning on some bays (north side mostly)
      if ((fs < 0 && r() < 0.55) || (fs > 0 && r() < 0.25)) {
        const torn = r() < 0.4,
          dep = torn ? 0.9 : 1.6;
        b.box(
          r() < 0.5 ? "awning_green" : "awning_red",
          cx,
          3.45 - dep * 0.3,
          Z(0.3 + dep / 2),
          bw - 0.95,
          0.04,
          dep,
          { rx: fs * 0.36, seg: false, grime: 0.6 },
        );
        for (const dx of [-(bw - 1) / 2, (bw - 1) / 2])
          b.beam(
            "iron",
            V3(cx + dx, 3.5, Z(0.3)),
            V3(cx + dx, 3.45 - dep * 0.6, Z(0.3 + dep)),
            0.03,
            0.03,
          );
      }
    }
    const names = fs > 0 ? SHOPS_S : SHOPS_N;
    const sk = PF.texMat(
      (fs > 0 ? "sp_shop" : "sp_shopn") + i,
      PF.signTex(
        (fs > 0 ? "sp_shop" : "sp_shopn") + i,
        [names[i]],
        (fs > 0 && i === 5) || (fs < 0 && i === 2) ? "enamel" : "engraved",
        512,
        96,
        (fs > 0 && i === 5) || (fs < 0 && i === 2)
          ? { bg: "#7a1c14", fg: "#f0e0c0" }
          : { bg: "#2a3a30", fg: "#e0d0a0" },
      ),
    );
    b.quad(
      sk,
      (u.x0 + u.x1) / 2,
      3.55,
      Z(0.36),
      Math.min(8, u.x1 - u.x0 - 2),
      0.6,
      { ry },
    );
    // upper storeys: framed sash windows
    for (let k = 0; k < bays; k++) {
      const cx = u.x0 + (k + 0.5) * bw;
      for (let f = 1; f < u.stories; f++) {
        const y = 4.6 + (f - 1) * 3.0,
          yc = y + 0.95,
          roll = r();
        const state =
          roll < 0.5
            ? "dark"
            : roll < 0.7
              ? "broken"
              : roll < 0.85
                ? "boarded"
                : "shutter";
        b.quad(
          state === "boarded"
            ? "planks"
            : state === "broken"
              ? "glass_broken"
              : "glass_dark",
          cx,
          yc,
          Z(0.015),
          1.0,
          1.8,
          { ry, noAO: true, uv: state === "boarded" ? "box" : undefined },
        );
        // reveal: jambs + head standing proud of the glass so the window reads recessed
        for (const dx of [-0.56, 0.56])
          b.box("brick_brown", cx + dx, y - 0.05, Z(0.02), 0.14, 2.0, 0.16, {
            seg: false,
            grime: 0.6,
          });
        b.box("limestone", cx, y + 1.9, Z(0.08), 1.44, 0.28, 0.2, {
          seg: false,
          grime: 0.45,
        }); // splayed lintel
        b.box("limestone", cx, y + 2.02, Z(0.14), 0.26, 0.2, 0.14, {
          seg: false,
        }); // keystone
        b.box("limestone", cx, y - 0.12, Z(0.1), 1.3, 0.1, 0.26, {
          seg: false,
          grime: 0.5,
        }); // sill
        if (state === "dark" || state === "shutter") {
          b.box("white_paint", cx, yc, Z(0.035), 1.0, 0.06, 0.05, {
            seg: false,
            grime: 0.6,
          }); // meeting rail
          for (const dx of [-0.17, 0.17])
            b.box("white_paint", cx + dx, y + 0.05, Z(0.035), 0.03, 1.8, 0.03, {
              seg: false,
              grime: 0.6,
            });
          for (const dy of [0.5, 1.4])
            b.box("white_paint", cx, y + dy, Z(0.035), 1.0, 0.03, 0.03, {
              seg: false,
              grime: 0.6,
            });
          for (const dx of [-0.5, 0.5])
            b.box("white_paint", cx + dx, y + 0.05, Z(0.035), 0.06, 1.8, 0.05, {
              seg: false,
              grime: 0.6,
            });
        } else if (state === "boarded") {
          for (const a of [0.55, -0.55])
            b.box("rotten", cx, yc - 0.1, Z(0.06), 1.35, 0.16, 0.04, {
              rz: a,
              seg: false,
              grime: 0.6,
            });
        } else {
          for (const dx of [-0.5, 0.5])
            b.box("white_paint", cx + dx, y + 0.05, Z(0.035), 0.06, 1.8, 0.05, {
              seg: false,
              grime: 0.7,
            });
          b.box("white_paint", cx - 0.2, yc - 0.3, Z(0.02), 0.04, 0.9, 0.04, {
            rz: 0.5,
            seg: false,
          }); // snapped muntin
        }
        if (state === "shutter")
          for (const sd of [-1, 1]) {
            const hang = r() < 0.3 && sd > 0;
            b.box(
              "paint_teal",
              cx + sd * 0.86,
              y + (hang ? -0.2 : 0.05),
              Z(0.1),
              0.5,
              1.8,
              0.04,
              { rz: hang ? 0.25 : 0, seg: false, grime: 0.6, c: 0x5a7a58 },
            );
          }
      }
    }
    // dentil cornice
    b.boxMM(
      "white_paint",
      u.x0,
      u.h - 0.35,
      Math.min(Z(0), Z(0.45)),
      u.x1,
      u.h,
      Math.max(Z(0), Z(0.45)),
      { seg: false, grime: 0.5 },
    );
    b.boxMM(
      "white_paint",
      u.x0,
      u.h - 0.62,
      Math.min(Z(0), Z(0.2)),
      u.x1,
      u.h - 0.52,
      Math.max(Z(0), Z(0.2)),
      { seg: false, grime: 0.55 },
    );
    for (let x = u.x0 + 0.15; x < u.x1 - 0.1; x += 0.28)
      b.box("white_paint", x, u.h - 0.52, Z(0.12), 0.13, 0.17, 0.2, {
        seg: false,
        grime: 0.55,
      });
  }

  // ===================================================================
  // EXTERIOR
  // ===================================================================
