// play-inline-218 03 — ship
// Lines 246-1335 of readable/play-inline-218.pretty.js (statement-aligned).
  function buildNavy(root) {
    const b = PH.batch("navy_ext");
    b.aoH = 5;
    const anchors = {};
    const r = PH.rng("navy");
    // ================= the raised quay & the graving dock =================
    // quay slab strips around the pit
    const strip = (x0, z0, x1, z1) => {
      b.boxMM("concrete", x0, QY - 0.4, z0, x1, QY, z1, {
        grime: 0.6,
        segLen: 8,
      });
      PH.colMM(x0, 0, z0, x1, QY, z1, {});
    };
    strip(Q.x0, Q.z0, Q.x1, PIT.z0);
    strip(Q.x0, PIT.z1, Q.x1, Q.z1);
    strip(Q.x0, PIT.z0, PIT.x0, PIT.z1);
    strip(PIT.x1, PIT.z0, Q.x1, PIT.z1);
    // granite outer walls with a rusticated plinth & coping
    for (const [x0, z0, x1, z1] of [
      [Q.x0, Q.z0, Q.x1, Q.z0 + 0.8],
      [Q.x0, Q.z1 - 0.8, Q.x1, Q.z1],
      [Q.x0, Q.z0, Q.x0 + 0.8, Q.z1],
      [Q.x1 - 0.8, Q.z0, Q.x1, Q.z1],
    ]) {
      b.boxMM("granite", x0, 0, z0, x1, QY - 0.4, z1, {
        grime: 0.7,
        segLen: 6,
      });
      b.boxMM(
        "granite",
        x0 - 0.15,
        QY - 0.4,
        z0 - 0.15,
        x1 + 0.15,
        QY + 0.1,
        z1 + 0.15,
        { seg: false, grime: 0.5 },
      );
    }
    // dock pit: two granite altars per side down to the floor
    const altar = (side) => {
      const zEdge = side < 0 ? PIT.z0 : PIT.z1,
        dz = -side;
      for (let k = 0; k < 2; k++) {
        const zf = zEdge + dz * k * 2.2,
          yTop = QY - k * 2.9,
          yBot = yTop - 2.9;
        const zt = zf + dz * 2.2;
        b.boxMM(
          "granite",
          PIT.x0,
          Math.max(FLOOR, yBot),
          Math.min(zf, zf - dz * 0.6),
          PIT.x1,
          yTop,
          Math.max(zf, zf - dz * 0.6),
          { grime: 0.7, segLen: 6 },
        );
        b.boxMM(
          "granite",
          PIT.x0,
          yBot - 0.4,
          Math.min(zf, zt),
          PIT.x1,
          yBot,
          Math.max(zf, zt),
          { grime: 0.6, segLen: 6 },
        );
        PH.colMM(
          PIT.x0,
          0,
          Math.min(zf, zt),
          PIT.x1,
          Math.max(FLOOR, yBot),
          Math.max(zf, zt),
          {},
        );
      }
    };
    altar(-1);
    altar(1);
    b.boxMM("granite", PIT.x1 - 0.6, FLOOR, PIT.z0, PIT.x1, QY, PIT.z1, {
      grime: 0.7,
    });
    PH.colMM(PIT.x1 - 0.6, 0, PIT.z0, PIT.x1, QY, PIT.z1, { walkable: true });
    b.boxMM(
      "concrete_dark",
      PIT.x0,
      0,
      PIT.z0 + 4.4,
      PIT.x1,
      FLOOR,
      PIT.z1 - 4.4,
      { grime: 0.9, segLen: 8 },
    );
    // the caisson (steel dock gate) at the west end, and the flooded basin beyond it
    b.boxMM("rust", PIT.x0 - 2.2, 0, PIT.z0, PIT.x0, QY + 0.4, PIT.z1, {
      grime: 0.7,
    });
    for (let z = PIT.z0 + 2; z < PIT.z1; z += 4)
      b.box("navy_dark", PIT.x0 + 0.05, 0, z, 0.2, QY, 0.3, { seg: false });
    PH.colMM(PIT.x0 - 2.2, 0, PIT.z0, PIT.x0, QY + 0.4, PIT.z1, {
      walkable: true,
      surface: "metal",
    });
    // puddles & silt on the dock floor, keel blocks under the ship
    for (let x = SHIP.x0 + 8; x < SHIP.x1 - 12; x += 6) {
      b.box("rotten", x, FLOOR, SHIP.cz, 1.6, (SHIP.keel - FLOOR) * 0.5, 2.4, {
        seg: false,
      });
      b.box(
        "concrete",
        x,
        FLOOR + (SHIP.keel - FLOOR) * 0.5,
        SHIP.cz,
        1.4,
        (SHIP.keel - FLOOR) * 0.5,
        2.0,
        { seg: false },
      );
      for (const s of [-1, 1])
        b.beam(
          "rotten",
          PH.v3(x, FLOOR, SHIP.cz + s * 12),
          PH.v3(x, SHIP.keel + 4, SHIP.cz + s * 9.6),
          0.3,
          0.3,
        ); // shores
    }
    for (let i = 0; i < 7; i++)
      b.box(
        "water",
        580 + r() * 120,
        FLOOR + 0.01,
        764 + r() * 32,
        4 + r() * 6,
        0.02,
        2 + r() * 3,
        { seg: false, noAO: true },
      );
    // dock-floor stair (east head) so a fall into the dock isn't a death sentence
    PH.colMM(PIT.x0, 0, PIT.z0 + 4.4, PIT.x1, FLOOR, PIT.z1 - 4.4, {});
    // (real stair: a straight flight along the east dock head, quay → floor)
    PH.stairs(b, "granite", PIT.x1 - 2.0, PIT.z0 + 6, 0, 2.4, 11, FLOOR, QY, {
      rails: "iron",
      railSides: [-1],
    });
    b.boxMM(
      "granite",
      PIT.x1 - 3.2,
      FLOOR,
      PIT.z0 + 6,
      PIT.x1 - 3.1,
      QY,
      PIT.z0 + 17,
      { seg: false },
    );
    // quay-edge railings (chain posts) with gaps at the gangway and the dock stair
    const railZ = (z, x0, x1) =>
      PH.railing(
        b,
        [
          [x0, z],
          [x1, z],
        ],
        QY,
        1.05,
        "iron",
        { postStep: 2.4, r: 0.04 },
      );
    railZ(PIT.z0 - 0.3, PIT.x0 - 2, 640);
    railZ(PIT.z0 - 0.3, 646, PIT.x1 - 3.6);
    railZ(PIT.z1 + 0.3, PIT.x0 - 2, PIT.x1);
    PH.railing(
      b,
      [
        [PIT.x1 + 0.3, PIT.z0],
        [PIT.x1 + 0.3, PIT.z0 + 5.5],
      ],
      QY,
      1.05,
      "iron",
      { postStep: 2.4, r: 0.04 },
    );
    PH.railing(
      b,
      [
        [PIT.x1 + 0.3, PIT.z0 + 18],
        [PIT.x1 + 0.3, PIT.z1],
      ],
      QY,
      1.05,
      "iron",
      { postStep: 2.4, r: 0.04 },
    );
    // bollards & capstans on the quay
    for (let x = PIT.x0 + 6; x < PIT.x1; x += 14)
      for (const z of [PIT.z0 - 1.6, PIT.z1 + 1.6]) {
        b.cyl("iron", x, QY, z, 0.35, 0.4, 0.8, 10, { hSeg: 1 });
        b.cyl("iron", x, QY + 0.8, z, 0.5, 0.5, 0.15, 10, { hSeg: 1 });
        PH.col(x, z, 0.9, 0.9, QY, QY + 0.9, 0, {});
      }
    // crane rails along the north quay + a portal crane
    for (const z of [749, 753])
      b.boxMM("rust", Q.x0 + 2, QY, z - 0.1, Q.x1 - 2, QY + 0.15, z + 0.1, {
        seg: false,
      });
    {
      const cx = 612,
        cz = 751;
      for (const [sx, sz] of [
        [-4, -3],
        [4, -3],
        [-4, 3],
        [4, 3],
      ]) {
        b.beam(
          "paint_yellow",
          PH.v3(cx + sx, QY, cz + sz),
          PH.v3(cx + sx * 0.5, QY + 18, cz + sz * 0.5),
          0.42,
          0.42,
          { c: 0xa08850 },
        );
        PH.col(cx + sx, cz + sz, 0.6, 0.6, QY, QY + 18, 0, { walkable: false });
      }
      for (let y = 3; y < 18; y += 4) {
        const f = y / 18;
        for (const [ax, az, bx, bz] of [
          [-4, -3, 4, -3],
          [-4, 3, 4, 3],
          [-4, -3, -4, 3],
          [4, -3, 4, 3],
        ])
          b.beam(
            "paint_yellow",
            PH.v3(cx + ax * (1 - f * 0.5), QY + y, cz + az * (1 - f * 0.5)),
            PH.v3(
              cx + bx * (1 - (f + 0.2) * 0.5),
              QY + y + 3.6,
              cz + bz * (1 - (f + 0.2) * 0.5),
            ),
            0.12,
            0.12,
            { c: 0xa08850 },
          );
      }
      b.cyl("paint_yellow", cx, QY + 18, cz, 3, 3, 3, 16, {
        hSeg: 1,
        c: 0xa08850,
      });
      b.boxMM("panel", cx - 2, QY + 21, cz - 3, cx + 4, QY + 25, cz + 3, {
        grime: 0.7,
      });
      b.beam(
        "paint_yellow",
        PH.v3(cx, QY + 22, cz),
        PH.v3(cx + 26, QY + 30, cz + 20),
        0.9,
        1.2,
        { c: 0xa08850 },
      );
      b.beam(
        "rust",
        PH.v3(cx - 2, QY + 25, cz),
        PH.v3(cx - 8, QY + 22, cz - 4),
        0.6,
        0.6,
      );
      b.box("concrete", cx - 9, QY + 19, cz - 5, 3, 3, 3, { seg: false });
      b.rod(
        "black",
        PH.v3(cx + 26, QY + 30, cz + 20),
        PH.v3(cx + 26, QY + 16, cz + 20),
        0.05,
        4,
      );
      // a raider "gibbet" cage dangling from the crane hook
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * TAU;
        b.rod(
          "iron",
          PH.v3(
            cx + 26 + Math.cos(a) * 0.8,
            QY + 13.5,
            cz + 20 + Math.sin(a) * 0.8,
          ),
          PH.v3(
            cx + 26 + Math.cos(a) * 0.8,
            QY + 16,
            cz + 20 + Math.sin(a) * 0.8,
          ),
          0.03,
          3,
        );
      }
      PH.skeleton(b, cx + 26, QY + 13.6, cz + 20, 0.3, { sit: true });
    }

    // ================= the monumental stair from the yard gate up to the quay =================
    PH.stairs(b, "granite", 640, Q.z0 - 12, 0, 12, 12, 0, QY, { c: 0xd0ccc4 });
    for (const s of [-1, 1]) {
      b.boxMM(
        "granite",
        640 + s * 6 - 0.6,
        0,
        Q.z0 - 12,
        640 + s * 6 + 0.6,
        QY + 1.0,
        Q.z0,
        { grime: 0.6 },
      );
      PH.colMM(
        640 + s * 6 - 0.6,
        0,
        Q.z0 - 12,
        640 + s * 6 + 0.6,
        QY + 1.0,
        Q.z0,
        { walkable: false },
      );
      b.cyl("iron", 640 + s * 6, 0, Q.z0 - 12.6, 0.1, 0.12, 3.6, 6, {
        hSeg: 1,
      });
      b.sphere("lamp", 640 + s * 6, 3.8, Q.z0 - 12.6, 0.22, { noAO: true });
    }
    // yard gate: stone piers + iron arch sign (the old Navy Yard gate), raider barricade
    for (const s of [-1, 1]) {
      b.boxMM("granite", 640 + s * 9 - 1, 0, 712, 640 + s * 9 + 1, 7, 714, {
        grime: 0.6,
      });
      PH.colMM(640 + s * 9 - 1, 0, 712, 640 + s * 9 + 1, 7, 714, {
        walkable: false,
      });
      b.sphere("granite", 640 + s * 9, 7.4, 713, 0.7, {});
    }
    for (const k of [0, 1]) {
      const arch = new THREE.TorusGeometry(9, 0.14, 6, 28, Math.PI);
      b.add("iron", arch, {
        m: PH.m4(640, 6.4 + k * 0.9, 713, 0, 0, 0, 1, 0.32, 1),
      });
    }
    for (let k = -8; k <= 8; k += 1) {
      const yy = 6.4 + 9 * 0.32 * Math.sqrt(Math.max(0, 1 - (k / 9) * (k / 9)));
      b.rod(
        "iron",
        PH.v3(640 + k, yy, 713),
        PH.v3(640 + k, yy + 0.9, 713),
        0.03,
        4,
      );
    }
    const gateK = PH.signMat(
      "navy_gate",
      ["U.S. NAVY YARD · NEW YORK"],
      "enamel",
      1024,
      128,
      { bg: "#1c2a3a" },
    );
    b.quad(gateK, 640, 10.9, 712.9, 10, 1.25, { ry: Math.PI });
    const pirK = PH.signMat(
      "navy_pirates",
      ["NAVY YARD PIRATES", "TOLL: EVERYTHING YOU OWN"],
      "raider",
      768,
      256,
      { bg: "#3a3a36", fg: "#e8e0d0" },
    );
    b.quad(pirK, 640, 4.6, 712.8, 5.2, 1.7, { ry: Math.PI });
    PH.scrapWall(b, 626, 716, 635, 716, 2.8);
    PH.scrapWall(b, 645, 716, 654, 716, 2.8);
    for (const x of [633, 647]) {
      b.cyl("rust", x, 0, 718, 0.32, 0.32, 0.95, 10, { hSeg: 1 });
      b.sphere("fire", x, 1.0, 718, 0.3, { sy: 0.7, noAO: true });
      PH.col(x, 718, 0.7, 0.7, 0, 0.95, 0, { walkable: false });
      PH.onReady.push(() =>
        PH.safe("fire", () => {
          if (!G.isStub("fx") && G.fx.fire) G.fx.fire(PH.v3(x, 1.0, 718), 0.55);
        }),
      );
    }
    for (let i = 0; i < 4; i++) {
      const x = 628 + i * 8;
      b.rod("rust", PH.v3(x, 0, 721), PH.v3(x + 0.4, 3.2, 721), 0.05, 4);
      b.sphere("bone", x + 0.4, 3.35, 721, 0.14, {});
    }

    // ================= the ship =================
    hullBand(b, "hullgrey", 1, 0, 0.42);
    hullBand(b, "hullgrey", -1, 0, 0.42);
    hullBand(b, "hullred", 1, 0.42, 1);
    hullBand(b, "hullred", -1, 0.42, 1);
    // black boot-top stripe, and the armour-belt strake standing proud of the side amidships
    for (const s of [-1, 1])
      hullBand(b, "paint_black", s, 0.4, 0.44, { grime: 0.3, grow: 0.02 });
    for (const s of [-1, 1])
      hullBand(b, "navy_dark", s, 0.27, 0.4, { grime: 0.6, grow: 0.12 });
    // hull fittings: two rows of brass-rimmed portholes fore & aft (with eyebrows and rust tears),
    // the degaussing cable in its clamps just under the deck edge, and a scatter of scupper stains
    {
      const pr = PH.rng("portholes");
      const disc = new THREE.CircleGeometry(0.21, 10),
        rim = new THREE.TorusGeometry(0.24, 0.045, 4, 10);
      for (const s of [-1, 1]) {
        for (const [u0, u1] of [
          [0.06, 0.3],
          [0.6, 0.86],
        ])
          for (const h of [0.1, 0.19]) {
            for (let u = u0; u < u1; u += 2.6 / (SHIP.x1 - SHIP.x0)) {
              if (pr() < 0.08) continue;
              const p = hullPt(u, h, s, 0.02),
                M = PH.m4(p.x, p.y, p.z, p.ry);
              b.add(pr() < 0.2 ? "glass" : "paint_black", disc.clone(), {
                m: M,
                noAO: true,
                grime: 0,
              });
              b.add("bronze", rim.clone(), {
                m: M.clone(),
                noAO: true,
                grime: 0.6,
              });
              const e = hullPt(u, h - 0.028, s, 0.05);
              b.box("navy_dark", e.x, e.y, e.z, 0.7, 0.05, 0.1, {
                ry: p.ry,
                seg: false,
                noAO: true,
              });
              if (pr() < 0.55) {
                const t = hullPt(u, h + 0.06, s, 0.025);
                b.box(
                  "rust",
                  t.x,
                  t.y - 0.4,
                  t.z,
                  0.07 + pr() * 0.08,
                  0.9 + pr() * 1.2,
                  0.01,
                  { ry: p.ry, seg: false, noAO: true },
                );
              }
            }
          }
        // degaussing cable + clamps
        let prev = null;
        for (let u = 0.035; u <= 0.955; u += 0.012) {
          const p = hullPt(u, 0.035, s, 0.1),
            v = PH.v3(p.x, p.y, p.z);
          if (prev) b.beam("navy_dark", prev, v, 0.15, 0.15, { noAO: true });
          if (Math.round(u / 0.012) % 3 === 0)
            b.box("navy", p.x, p.y - 0.12, p.z, 0.12, 0.24, 0.2, {
              ry: p.ry,
              seg: false,
              noAO: true,
            });
          prev = v;
        }
        // scupper stains: dark weeping marks under deck drains
        for (let u = 0.08; u < 0.92; u += 0.045) {
          const p = hullPt(u, 0.03, s, 0.015);
          b.box("rust", p.x, p.y - 1.9, p.z, 0.16, 1.8, 0.01, {
            ry: p.ry,
            seg: false,
            noAO: true,
          });
        }
      }
    }
    deckSurface(b);
    // deck colliders (step boxes following the sheer) + lifeline railings
    for (let x = SHIP.x0 + 1; x < SHIP.x1 - 2; x += 3) {
      const u = (x + 1.5 - SHIP.x0) / (SHIP.x1 - SHIP.x0),
        B = halfBeam(u) - 0.4;
      if (B < 1) continue;
      PH.col(
        x + 1.5,
        SHIP.cz,
        3.05,
        B * 2,
        deckY(x + 1.5) - 2,
        deckY(x + 1.5),
        0,
        { surface: "wood" },
      );
    }
    PH.col(
      SHIP.x0 + (SHIP.x1 - SHIP.x0) / 2,
      SHIP.cz,
      SHIP.x1 - SHIP.x0 - 6,
      18,
      SHIP.keel,
      deckY(640) - 2.2,
      0,
      { walkable: false, surface: "metal" },
    );
    for (const s of [-1, 1]) {
      const pts = [];
      for (let i = 0; i <= 44; i++) {
        const u = 0.01 + (i / 44) * 0.975,
          x = SHIP.x0 + u * (SHIP.x1 - SHIP.x0);
        if (s < 0 && x > 640 && x < 652) {
          if (pts.length > 1) {
            const p0 = pts.slice();
            railPts(b, p0);
          }
          pts.length = 0;
          continue;
        } // gangway gap
        pts.push([x, SHIP.cz + s * (halfBeam(u) - 0.25), deckY(x)]);
      }
      railPts(b, pts);
    }
    // anchors, chains, hull number, name
    for (const s of [-1, 1]) {
      // hawse pipe (ring in the flare of the bow) with the stockless anchor hauled up into it
      {
        const hp = hullPt((696 - SHIP.x0) / 130, 0.2, s, 0.08);
        b.add("navy_dark", new THREE.TorusGeometry(0.75, 0.2, 6, 14), {
          m: PH.m4(hp.x, hp.y, hp.z, hp.ry),
          noAO: true,
        });
        b.add("paint_black", new THREE.CircleGeometry(0.62, 12), {
          m: PH.m4(hp.x, hp.y, hp.z - s * 0.02, hp.ry),
          noAO: true,
        });
        const ap = hullPt((695.2 - SHIP.x0) / 130, 0.33, s, 0.3);
        b.box("iron", ap.x, ap.y, ap.z, 0.36, 2.6, 0.3, {
          ry: ap.ry,
          seg: false,
        }); // shank
        b.box("iron", ap.x, ap.y - 0.2, ap.z, 1.9, 0.55, 0.45, {
          ry: ap.ry,
          seg: false,
        }); // crown
        for (const k of [-1, 1])
          b.box(
            "iron",
            ap.x + Math.cos(ap.ry) * k * 0.8,
            ap.y + 0.1,
            ap.z - Math.sin(ap.ry) * k * 0.8,
            0.5,
            1.1,
            0.4,
            { ry: ap.ry, rz: k * 0.25, seg: false },
          ); // flukes
        b.box("rust", ap.x, ap.y - 1.6, ap.z + s * 0.01, 0.35, 2.4, 0.01, {
          ry: ap.ry,
          seg: false,
          noAO: true,
        }); // rust tear below
      }
      b.rod(
        "iron",
        PH.v3(695.5, deckY(695.5) + 0.1, SHIP.cz + s * 1.8),
        PH.v3(684, deckY(684) + 0.1, SHIP.cz + s * 1.2),
        0.14,
        5,
      );
      b.cyl("iron", 684, deckY(684), SHIP.cz + s * 1.2, 0.7, 0.8, 0.8, 10, {
        hSeg: 1,
      });
      const numK = PH.texMat(
        "navy_68",
        PH.canvasTex("ph_navy68", 512, 512, (ctx, w, h) => {
          ctx.clearRect(0, 0, w, h);
          ctx.font = 'bold 380px Impact, "Arial Narrow", sans-serif';
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "rgba(20,22,24,0.9)";
          ctx.fillText("68", w / 2 + 14, h / 2 + 14); // drop shadow (USN style)
          ctx.fillStyle = "#e8e8e2";
          ctx.fillText("68", w / 2, h / 2);
          ctx.globalCompositeOperation = "destination-out";
          const rr = PH.rng("n68");
          for (let i = 0; i < 260; i++) {
            ctx.fillStyle = "rgba(0,0,0," + (0.3 + rr() * 0.7) + ")";
            ctx.fillRect(rr() * w, rr() * h, 2 + rr() * 10, 2 + rr() * 6);
          }
          ctx.globalCompositeOperation = "source-over";
        }),
        { transparent: true },
      );
      const up = hullPt((691 - SHIP.x0) / 130, 0.14, s, 0.06);
      b.quad(numK, up.x, up.y, up.z, 4.6, 4.6, { ry: up.ry });
    }
    const nameK = PH.signMat("navy_name", ["HUDSON"], "stencil", 512, 128, {
      bg: "#6a7078",
      fg: "#e8e8e0",
    });
    b.quad(nameK, SHIP.x0 - 0.05, deckY(SHIP.x0) - 1.6, SHIP.cz, 6, 1.5, {
      ry: -Math.PI / 2,
    });
    const bbK = PH.signMat("navy_bb68", ["BB-68"], "stencil", 512, 128, {
      bg: "#6a7078",
      fg: "#e8e8e0",
    });
    b.quad(bbK, SHIP.x0 - 0.05, deckY(SHIP.x0) - 2.8, SHIP.cz, 3.4, 0.85, {
      ry: -Math.PI / 2,
    });
    // the dock's own name cut into the quay wall either side of the monumental stair
    const ddK = PH.signMat(
      "navy_dd4",
      ["DRY DOCK No. 4", "U.S. NAVY · 1851"],
      "engraved",
      768,
      256,
      {},
    );
    for (const x of [620, 660])
      b.quad(ddK, x, 3.6, Q.z0 - 0.2, 6.5, 2.2, { ry: Math.PI });
    // turrets: A & B forward (B superfiring on a raised barbette), C aft facing astern
    turret(b, 672, deckY(672) + 0.6, SHIP.cz, 0, 0.12);
    b.cyl("navy", 657, deckY(657), SHIP.cz, 5.9, 6.1, 2.6, 24, { hSeg: 1 });
    turret(b, 657, deckY(657) + 3.2, SHIP.cz, 0, 0.05);
    turret(b, 596, deckY(596) + 0.6, SHIP.cz, Math.PI, -0.08);
    // superstructure
    const D = deckY(630);
    // superstructure deckhouses: riveted haze-grey plate, portholes with eyebrows & rust tears, watertight
    // doors with dogs, a drip rail along the roof edge and a weld/coaming strip at the foot.
    // skip: [x0, x1, side] spans where nothing may be mounted (banner, conning tower, entrance)
    const HSKIP = [
      [620.5, 643.5, -1],
      [647.5, 654.5, 0],
      [601.5, 610.5, 0],
    ];
    const skipAt = (x, s) =>
      HSKIP.some(([a, c, ss]) => x > a && x < c && (ss === 0 || ss === s));
    const houseDress = (x0, x1, w, y0, h) => {
      for (const s of [-1, 1]) {
        const z = SHIP.cz + s * w,
          ry = s > 0 ? 0 : Math.PI;
        b.boxMM(
          "navy_dark",
          x0 - 0.02,
          y0 + h - 0.12,
          z - 0.06 * -s - 0.04,
          x1 + 0.02,
          y0 + h - 0.04,
          z + 0.06 * s + 0.04,
          { seg: false },
        ); // drip rail
        b.boxMM("navy_dark", x0, y0, z - 0.03, x1, y0 + 0.12, z + 0.03, {
          seg: false,
          grime: 0.8,
        }); // coaming
        const doorX = x1 - x0 > 7 ? x0 + 2.4 + ((x0 * 7) % 3) : null;
        if (doorX !== null && !skipAt(doorX, s) && h >= 2.6) {
          b.box("navy_dark", doorX, y0, z + s * 0.05, 1.25, 2.05, 0.1, {
            seg: false,
          });
          b.box("navy", doorX, y0 + 0.2, z + s * 0.1, 0.95, 1.7, 0.06, {
            seg: false,
            grime: 0.55,
          });
          for (const dy of [0.45, 1.0, 1.55])
            for (const e of [-1, 1])
              b.box(
                "iron",
                doorX + e * 0.52,
                y0 + dy,
                z + s * 0.14,
                0.14,
                0.05,
                0.05,
                { seg: false },
              );
          b.cyl("lamp", doorX, y0 + 2.3, z + s * 0.12, 0.07, 0.07, 0.1, 8, {
            rx: Math.PI / 2,
            hSeg: 1,
            noAO: true,
          });
        }
        if (h < 2.6) continue;
        for (let x = x0 + 1.4; x < x1 - 0.8; x += 2.4) {
          if (skipAt(x, s) || (doorX !== null && Math.abs(x - doorX) < 1.3))
            continue;
          const py = y0 + h * 0.58;
          b.cyl("bronze", x, py, z + s * 0.03, 0.2, 0.2, 0.06, 12, {
            rx: Math.PI / 2,
            hSeg: 1,
          });
          b.cyl("shadow", x, py, z + s * 0.065, 0.15, 0.15, 0.01, 12, {
            rx: Math.PI / 2,
            hSeg: 1,
            noAO: true,
          });
          b.box("navy_dark", x, py + 0.26, z + s * 0.06, 0.55, 0.04, 0.1, {
            seg: false,
          }); // eyebrow
          b.box("rust", x + 0.04, py - 0.75, z + s * 0.012, 0.05, 0.55, 0.01, {
            seg: false,
            noAO: true,
            grime: 0.2,
          }); // rust tear
        }
      }
    };
    const house = (x0, x1, w, y0, h, key) => {
      b.boxMM(
        key || "navyplate",
        x0,
        y0,
        SHIP.cz - w,
        x1,
        y0 + h,
        SHIP.cz + w,
        { grime: 0.5, c: 0xd0d4d8 },
      );
      PH.colMM(x0, y0, SHIP.cz - w, x1, y0 + h, SHIP.cz + w, {
        walkable: true,
        surface: "metal",
      });
      houseDress(x0, x1, w, y0, h);
    };
    house(610, 652, 7.6, D, 3.2);
    house(616, 650, 6.2, D + 3.2, 3.0);
    house(638, 652, 5.4, D + 6.2, 3.2);
    // conning tower (armoured cylinder) and pilot house with its window band
    b.cyl("navy_dark", 651, D + 3.2, SHIP.cz, 3.1, 3.1, 9.0, 16, { hSeg: 2 });
    for (let k = 0; k < 10; k++) {
      const a = -0.9 + k * 0.2;
      b.box(
        "shadow",
        651 + Math.cos(a) * 3.12,
        D + 10.6,
        SHIP.cz + Math.sin(a) * 3.12,
        0.05,
        0.25,
        0.4,
        { ry: -a, seg: false, noAO: true },
      );
    }
    house(641, 650, 4.6, D + 9.4, 3.0);
    for (let z = -4; z <= 4; z += 1)
      b.box("glass", 650.05, D + 10.6, SHIP.cz + z, 0.05, 0.9, 0.8, {
        seg: false,
      });
    for (const s of [-1, 1])
      for (let x = 642; x < 650; x += 1.1)
        b.box("glass", x, D + 10.6, SHIP.cz + s * 4.65, 0.8, 0.9, 0.05, {
          seg: false,
        });
    b.boxMM(
      "navy",
      640.5,
      D + 12.4,
      SHIP.cz - 5.2,
      650.5,
      D + 12.6,
      SHIP.cz + 5.2,
      { seg: false },
    ); // bridge wings / open bridge deck
    // fire-control director + rangefinder, tower mast, radar
    b.box("navy", 646, D + 12.6, SHIP.cz, 3.2, 2.2, 3.2, { seg: false });
    b.box("navy_dark", 646, D + 13.6, SHIP.cz, 1.0, 0.6, 9, { seg: false });
    for (const [lx, lz] of [
      [-1.4, -1.4],
      [1.4, -1.4],
      [-1.4, 1.4],
      [1.4, 1.4],
    ])
      b.beam(
        "navy",
        PH.v3(644 + lx, D + 12.6, SHIP.cz + lz),
        PH.v3(643.5 + lx * 0.3, D + 25, SHIP.cz + lz * 0.3),
        0.22,
        0.22,
      );
    b.box("navy", 643.5, D + 24.6, SHIP.cz, 1.6, 0.5, 5.4, { seg: false });
    for (let k = 0; k < 6; k++)
      b.box("iron", 643.5, D + 25.2 + k * 0.35, SHIP.cz, 0.08, 0.06, 4.6, {
        seg: false,
      });
    b.rod(
      "iron",
      PH.v3(643.5, D + 25, SHIP.cz),
      PH.v3(643.5, D + 31, SHIP.cz),
      0.06,
      4,
    );
    // funnels (raked, elliptical) with black tops
    for (const fx of [633, 621]) {
      b.cyl("navy", fx, D + 6.2, SHIP.cz, 2.6, 3.0, 9, 16, {
        sx: 1.2,
        sz: 0.8,
        hSeg: 2,
        rz: 0.06,
      });
      b.cyl("paint_black", fx - 0.55, D + 15.2, SHIP.cz, 2.5, 2.6, 1.4, 16, {
        sx: 1.2,
        sz: 0.8,
        hSeg: 1,
        rz: 0.06,
      });
      PH.col(fx, SHIP.cz, 6.4, 4.8, D + 6.2, D + 16, 0, { walkable: false });
    }
    // after superstructure: 02 level with the aft main-battery director & searchlight platform
    house(610.5, 616.5, 4.4, D + 3.2, 6.0);
    b.box("navy", 613.8, D + 9.2, SHIP.cz, 2.8, 2.0, 2.8, { seg: false });
    b.box("navy_dark", 613.8, D + 10.1, SHIP.cz, 0.9, 0.55, 7.5, {
      seg: false,
    });
    for (const s of [-1, 1]) {
      b.cyl("navy", 627, D + 11.5, SHIP.cz + s * 3.4, 1.1, 1.1, 0.25, 12, {
        hSeg: 1,
      });
      b.cyl("chrome", 627, D + 11.75, SHIP.cz + s * 3.4, 0.45, 0.45, 0.6, 10, {
        rx: Math.PI / 2,
        hSeg: 1,
      });
      b.beam(
        "navy",
        PH.v3(627, D + 6.2, SHIP.cz + s * 3),
        PH.v3(627, D + 11.5, SHIP.cz + s * 3.4),
        0.15,
        0.15,
      );
    }
    // secondary battery & AA mounts
    for (const x of [620, 632, 644])
      for (const s of [-1, 1])
        mount5(
          b,
          x,
          D + 3.2,
          SHIP.cz + s * 8.3,
          s < 0 ? Math.PI / 2 : -Math.PI / 2,
        );
    for (const [x, s] of [
      [606, -1],
      [606, 1],
      [664, -1],
      [664, 1],
      [586, 0],
    ])
      bofors(
        b,
        x,
        deckY(x),
        SHIP.cz + s * 8.6,
        s ? (s < 0 ? Math.PI / 2 : -Math.PI / 2) : Math.PI,
      );
    // aft house + mainmast with the pirate flag
    house(602, 610, 5.0, deckY(606), 3.0);
    for (const [lx, lz] of [
      [0, -2],
      [0, 2],
      [-3, 0],
    ])
      b.beam(
        "navy",
        PH.v3(606 + lx, deckY(606) + 3, SHIP.cz + lz),
        PH.v3(605, deckY(606) + 20, SHIP.cz),
        0.25,
        0.25,
      );
    const jrK = PH.texMat("navy_jolly", jollyRogerTex(), { double: true });
    b.quad(jrK, 606.6, deckY(606) + 18.2, SHIP.cz, 3.2, 2.0, { ry: 0.1 });
    b.rod(
      "iron",
      PH.v3(605, deckY(606) + 20, SHIP.cz),
      PH.v3(605, deckY(606) + 23, SHIP.cz),
      0.05,
      4,
    );
    // stern crane & flagstaff
    b.cyl("navy", 580, deckY(580), SHIP.cz, 0.6, 0.7, 4.5, 10, { hSeg: 1 });
    b.beam(
      "navy",
      PH.v3(580, deckY(580) + 4, SHIP.cz),
      PH.v3(592, deckY(580) + 9, SHIP.cz + 4),
      0.4,
      0.4,
    );
    // raider fortification on deck: scrap walls, banner, fire barrels, string lights
    PH.scrapWall(b, 612, SHIP.cz - 9.8, 626, SHIP.cz - 9.8, 1.8, { y: D });
    PH.scrapWall(b, 654, SHIP.cz - 9.4, 664, SHIP.cz - 10.0, 1.6, {
      y: deckY(660),
    });
    const banK = PH.signMat(
      "navy_banner",
      ["NAVY YARD PIRATES", "FLAGSHIP OF THE COMMODORE"],
      "raider",
      1024,
      256,
      { bg: "#2a2a2a", fg: "#d8d0b8" },
    );
    b.quad(banK, 632, D + 4.7, SHIP.cz - 6.25, 20, 2.5, { ry: Math.PI });
    for (const [x, z] of [
      [616, SHIP.cz - 9],
      [660, SHIP.cz - 9],
      [590, SHIP.cz - 6],
      [690, SHIP.cz + 3],
    ]) {
      const y = deckY(x);
      b.cyl("rust", x, y, z, 0.32, 0.32, 0.95, 10, { hSeg: 1 });
      b.sphere("fire", x, y + 1.0, z, 0.3, { sy: 0.7, noAO: true });
      PH.col(x, z, 0.7, 0.7, y, y + 0.95, 0, { walkable: false });
      PH.onReady.push(() =>
        PH.safe("fire", () => {
          if (!G.isStub("fx") && G.fx.fire)
            G.fx.fire(PH.v3(x, y + 1.0, z), 0.5);
        }),
      );
    }
    for (let t = 0; t <= 24; t++) {
      const x = 606 + t * 1.7;
      b.sphere(
        t % 5 ? "lamp" : "lamp_red",
        x,
        D + 7.4 - Math.sin((t / 24) * Math.PI) * 1.2,
        SHIP.cz - 7.7,
        0.07,
        { ws: 6, hs: 4, noAO: true },
      );
    }
    // entrance: the aft deckhouse's port watertight door (reached along the port deck from the gangway).
    // (It used to sit on house 1's aft face, which the aft deckhouse abuts — unreachable.)
    {
      const ex = 603.2,
        ez = SHIP.cz - 5; // aft of the port Bofors tub (606, -8.6)
      b.box("navy_dark", ex, D, ez - 0.05, 1.45, 2.3, 0.14, { seg: false }); // frame
      b.box("shadow", ex, D + 0.25, ez - 0.13, 0.95, 1.8, 0.02, {
        seg: false,
        noAO: true,
      }); // the open doorway
      b.box("navy", ex + 0.65, D + 0.2, ez - 0.47, 0.95, 1.75, 0.06, {
        ry: 1.2,
        seg: false,
        grime: 0.5,
      }); // leaf swung open outboard
      for (const dy of [0.5, 1.05, 1.6])
        b.box("iron", ex + 0.82, D + dy, ez - 0.86, 0.14, 0.05, 0.05, {
          ry: 1.2,
          seg: false,
        });
      b.box("navy_dark", ex, D, ez - 0.16, 1.1, 0.25, 0.3, { seg: false }); // coaming
      b.box("metal", ex, D + 2.5, ez - 0.08, 0.16, 0.16, 0.06, { seg: false });
      b.sphere("lamp", ex, D + 2.42, ez - 0.2, 0.08, {
        ws: 8,
        hs: 6,
        noAO: true,
      });
      PH.onReady.push(() =>
        PH.safe("door glow", () => {
          if (!G.isStub("fx") && G.fx.glowSprite)
            G.fx.glowSprite(PH.v3(ex, D + 2.42, ez - 0.4), 0xffd08a, 1.4, {
              intensity: 0.9,
              dayFactor: 0.25,
            });
        }),
      );
      const qdK = PH.signMat(
        "navy_qd",
        ["QUARTERDECK", "ALL HANDS REPORT TO THE COMMODORE"],
        "stencil",
        512,
        160,
        { bg: "#50565c", fg: "#e8e4d8" },
      );
      b.quad(qdK, ex, D + 2.85, ez - 0.03, 1.8, 0.56, { ry: Math.PI });
      PH.NAVY.door = {
        x: ex,
        y: D,
        z: ez - 0.4,
        exit: { x: ex - 0.2, z: ez - 1.5, yaw: 0 },
      };
    }

    // ================= the gangway (quay → deck) =================
    {
      const gx = 643,
        zA = PIT.z0 - 0.8,
        zB = SHIP.cz - halfBeam((gx - SHIP.x0) / 130) + 0.6;
      const yA = QY,
        yB = deckY(gx);
      const run = zB - zA,
        n = Math.ceil((yB - yA) / 0.3);
      for (let i = 0; i < n; i++) {
        const t0 = i / n,
          t1 = (i + 1) / n,
          top = yA + (yB - yA) * t1;
        const zc = zA + (run * (t0 + t1)) / 2;
        b.box("diamond", gx, top - 0.12, zc, 2.2, 0.12, run / n + 0.02, {
          seg: false,
        });
        PH.col(gx, zc, 2.2, run / n + 0.05, top - 0.4, top, 0, {
          surface: "metal",
        });
      }
      for (const s of [-1, 1]) {
        b.rod(
          "rust",
          PH.v3(gx + s * 1.1, yA + 1, zA),
          PH.v3(gx + s * 1.1, yB + 1, zB),
          0.04,
          6,
        );
        b.beam(
          "rust",
          PH.v3(gx + s * 1.05, yA - 0.3, zA),
          PH.v3(gx + s * 1.05, yB - 0.3, zB),
          0.12,
          0.3,
        );
        PH.colWall(gx + s * 1.2, zA, gx + s * 1.2, zB, 0.15, yA, yB + 1.2);
      }
      // raider checkpoint at the foot of the gangway
      PH.sandbags(b, 636, PIT.z0 - 4, 640, PIT.z0 - 2, 3, { y: QY });
      PH.sandbags(b, 646, PIT.z0 - 2, 650, PIT.z0 - 4, 3, { y: QY });
      const brdK = PH.signMat(
        "navy_board",
        ["PERMISSION TO COME ABOARD", "DENIED"],
        "raider",
        512,
        192,
        { bg: "#4a4a44", fg: "#e02a1a" },
      );
      b.quad(brdK, gx, QY + 2.4, PIT.z0 - 0.9, 2.6, 1.0, { ry: Math.PI });
      b.box("rust", gx - 1.35, QY, PIT.z0 - 0.9, 0.12, 3.2, 0.12, {
        seg: false,
      });
      b.box("rust", gx + 1.35, QY, PIT.z0 - 0.9, 0.12, 3.2, 0.12, {
        seg: false,
      });
      anchors.gangway = PH.anchor(gx, QY, PIT.z0 - 3, Math.PI);
      anchors.deck = PH.anchor(gx, deckY(gx), zB + 2, -Math.PI / 2);
    }

    // ================= machine shop (south backdrop) & pump house =================
    {
      const x0 = 590,
        x1 = 690,
        z0 = 826,
        z1 = 856,
        H = 16;
      b.boxMM("brick", x0, 0, z0, x1, H, z1, { grime: 0.6, segLen: 5 });
      PH.colMM(x0, 0, z0, x1, H, z1, { walkable: false });
      for (let x = x0 + 2; x < x1; x += 5)
        for (const y of [2, 8.5]) {
          b.box("shadow", x + 1.5, y, z0 - 0.02, 3.2, 4.6, 0.05, {
            seg: false,
            noAO: true,
          });
          for (let k = 1; k < 4; k++)
            b.box("rust", x + 1.5, y + k * 1.15, z0 - 0.06, 3.2, 0.06, 0.05, {
              seg: false,
            });
        }
      for (let x = x0; x < x1; x += 8) {
        const sh = new THREE.Shape();
        sh.moveTo(0, 0);
        sh.lineTo(8, 0);
        sh.lineTo(8, 3.2);
        sh.closePath();
        b.add(
          "corrugated",
          new THREE.ExtrudeGeometry(sh, {
            depth: z1 - z0,
            bevelEnabled: false,
          }),
          { m: PH.m4(x, H, z0) },
        );
      }
      const msK = PH.signMat(
        "navy_shop",
        ["BUILDING 128 · MACHINE SHOP"],
        "stencil",
        1024,
        128,
        { bg: "#6a3a2c", fg: "#e8dcc0" },
      );
      b.quad(msK, 640, 14, z0 - 0.05, 24, 2.4, { ry: Math.PI });
    }
    anchors.entrance = PH.anchor(
      PH.NAVY.door.exit.x,
      D,
      PH.NAVY.door.exit.z,
      0,
    );
    anchors.quay = PH.anchor(640, QY, Q.z0 + 4, Math.PI);
    anchors.stair = PH.anchor(640, 0, Q.z0 - 14, Math.PI);
    const g = b.build(root);
    g.name = "navy_yard";
    return anchors;
  }

