// play-inline-137 08 — the
// Lines 2884-3832 of readable/play-inline-137.pretty.js (statement-aligned).
  LB.addBuilder(
    "nyse",
    function (LB, site, root) {
      const K = LB.kit,
        D = LB.dress;
      const b = LB.batch("nyse");
      b.ground = 0;
      b.aoH = 3;
      const anchors = {};
      // Round 1 refit: Broadway now runs along the EAST edge of the block (x≈32…48). The hall keeps its Wall Street
      // portico; the raider forecourt straddles the southern half of Wall Street (its north lane stays drivable) with its
      // side gate on the Broadway sidewalk, and the west half of the block (the old Broadway line) is the NYSE's 1922
      // annex, 11 Wall Street.
      const X0 = 2,
        X1 = 29,
        XC = (X0 + X1) / 2,
        ZF = 820,
        ZB = 843,
        H = 30;
      const PODIUM = 3.6;
      // ---- hall shell: walls with the north door gap, thin roof so the trading floor is tall
      K.room(
        b,
        "marble",
        X0,
        ZF,
        X1,
        ZB,
        0,
        H - 3,
        1.2,
        [{ side: "n", c: XC, w: 3.4, h: 3.0 }],
        { grime: 0.5 },
      );
      b.boxMM("marble", X0, H - 3, ZF, X1, H - 2.4, ZB, { grime: 0.4 });
      LB.colMM(X0, H - 4, ZF, X1, H - 2.4, ZB, { walkable: false });
      // facade podium with rusticated base (the door passage stays open)
      b.boxMM("marble", X0 - 1, 0, ZF - 3.8, XC - 1.7, PODIUM, ZF + 0.2, {
        grime: 0.6,
      });
      b.boxMM("marble", XC + 1.7, 0, ZF - 3.8, X1 + 1, PODIUM, ZF + 0.2, {
        grime: 0.6,
      });
      b.boxMM("marble", XC - 1.7, 3.0, ZF - 3.8, XC + 1.7, PODIUM, ZF + 0.2, {
        seg: false,
      });
      b.boxMM("granite_dark", XC - 1.7, 2.9, ZF - 3.8, XC + 1.7, 3.0, ZF, {
        seg: false,
      });
      for (let y = 0.9; y < PODIUM; y += 0.9) {
        b.boxMM(
          "granite_dark",
          X0 - 1.05,
          y,
          ZF - 3.86,
          XC - 1.7,
          y + 0.08,
          ZF - 3.78,
          { seg: false },
        );
        b.boxMM(
          "granite_dark",
          XC + 1.7,
          y,
          ZF - 3.86,
          X1 + 1.05,
          y + 0.08,
          ZF - 3.78,
          { seg: false },
        );
      }
      // six great Corinthian columns between the end piers, entablature, pediment with sculpture group, attic
      const colX = [-9, -5.4, -1.8, 1.8, 5.4, 9].map((d) => XC + d);
      for (const x of colX)
        K.column(b, "marble", x, PODIUM, ZF - 2.2, 16, 0.75, {
          collide: false,
        });
      for (const x of [X0 + 1.6, X1 - 1.6])
        b.boxMM(
          "marble",
          x - 2.1,
          PODIUM,
          ZF - 3,
          x + 2.1,
          PODIUM + 16,
          ZF + 0.2,
          { grime: 0.5 },
        );
      b.boxMM("marble", X0, PODIUM + 16, ZF - 3.4, X1, PODIUM + 18, ZF + 0.2, {
        grime: 0.4,
      });
      const nyseK = LB.texMat(
        "nyse_frieze",
        LB.signTex(
          "nyse_frieze",
          ["NEW YORK STOCK EXCHANGE"],
          "engraved",
          1024,
          64,
          { bg: "#cfc8b8", size: 44 },
        ),
      );
      b.quad(nyseK, XC, PODIUM + 16.9, ZF - 3.42, 22, 1.4, { ry: Math.PI });
      b.boxMM(
        "marble",
        X0 - 0.4,
        PODIUM + 18,
        ZF - 3.8,
        X1 + 0.4,
        PODIUM + 18.6,
        ZF + 0.2,
        { seg: false },
      );
      K.pediment(
        b,
        "marble",
        XC,
        PODIUM + 18.6,
        ZF - 1.8,
        X1 - X0 + 0.6,
        4.4,
        3,
        Math.PI,
        { relief: 9, reliefKey: "marble" },
      );
      b.boxMM("marble", X0, PODIUM + 18.6, ZF - 0.2, X1, H - 2.4, ZB, {
        grime: 0.4,
      });
      K.balustrade(
        b,
        "marble",
        [
          [X0, ZF - 0.1],
          [X1, ZF - 0.1],
          [X1, ZB],
          [X0, ZB],
          [X0, ZF - 0.1],
        ],
        H - 2.4,
        1.0,
        {},
      );
      // the famous glass curtain wall behind the columns
      for (let k = 0; k < 5; k++) {
        const x = XC - 7.2 + k * 3.6;
        b.quad("glass_dark", x, PODIUM + 8.2, ZF - 0.02, 3.0, 9.0, {
          ry: Math.PI,
          uv: "box",
          noAO: true,
        });
        for (let m = 1; m < 4; m++)
          b.box("iron", x, PODIUM + 3.7 + m * 2.25, ZF - 0.08, 3.0, 0.1, 0.1, {
            seg: false,
          });
        for (let m = -1; m <= 1; m++)
          b.box("iron", x + m, PODIUM + 3.7, ZF - 0.08, 0.1, 9, 0.1, {
            seg: false,
          });
      }
      K.polyWindows(
        b,
        [
          [X1, ZF],
          [X1, ZB],
          [X0, ZB],
          [X0, ZF],
        ],
        {
          y0: 5,
          floors: 4,
          floorH: 5.5,
          w: 1.6,
          h: 3.4,
          spacing: 3.6,
          inset: 0.05,
          broken: 0.5,
          seed: 41,
          frameKey: "marble",
          skipEdge: (i) => i !== 2,
        },
      );
      // ---- Broadway (east) and south elevations (round 1 revise): the giant order carried round the block — rusticated
      // base with channelled joints, marble pilasters with capitals rising to the front's entablature line, two tiers of
      // windows per bay (tall pedimented lower lights, square upper lights, darker spandrel panels), the entablature +
      // modillioned cornice returned from the Wall St front, and a BLIND-ARCADED attic. At the Broadway corner the first
      // two pilasters become engaged Corinthian columns — an echo of the famous screen, so the Exchange reads from both streets.
      const classicalFace = (p, q, seed, engaged) => {
        const r = LB.rng(seed),
          dx = q[0] - p[0],
          dz = q[1] - p[1],
          len = Math.hypot(dx, dz),
          ux = dx / len,
          uz = dz / len;
        let nx = uz,
          nz = -ux;
        if (
          ((p[0] + q[0]) / 2 - XC) * nx +
            ((p[1] + q[1]) / 2 - (ZF + ZB) / 2) * nz <
          0
        ) {
          nx = -nx;
          nz = -nz;
        }
        const ryB = Math.atan2(-uz, ux),
          ryF = Math.atan2(nx, nz);
        const at = (t, d) => [p[0] + ux * t + nx * d, p[1] + uz * t + nz * d];
        const bx = (key, t, d, y, w, h, dep, ex) => {
          const [x, z] = at(t, d);
          b.box(
            key,
            x,
            y,
            z,
            w,
            h,
            dep,
            Object.assign({ ry: ryB, seg: false }, ex || {}),
          );
        };
        const qd = (key, t, d, y, w, h, ex) => {
          const [x, z] = at(t, d);
          b.quad(
            key,
            x,
            y,
            z,
            w,
            h,
            Object.assign(
              { ry: ryF, uv: "box", noAO: true, grime: 0.12 },
              ex || {},
            ),
          );
        };
        const gk = () => {
          const v = r();
          return v < 0.35 ? "glass_broken" : v < 0.5 ? "planks" : "glass_dark";
        };
        const TOPO = PODIUM + 16,
          ATT = PODIUM + 18.6;
        bx("marble", len / 2, 0.2, 0, len + 0.4, PODIUM, 0.4, {
          seg: true,
          segLen: 3,
          grime: 0.75,
        }); // rusticated base
        for (let y = 0.9; y < PODIUM; y += 0.9)
          bx("granite_dark", len / 2, 0.405, y, len + 0.42, 0.08, 0.02, {
            grime: 0.2,
          });
        bx("marble", len / 2, 0.32, PODIUM, len + 0.6, 0.4, 0.64, {
          grime: 0.55,
        }); // water table
        const nb = Math.max(3, Math.round(len / 3.85)),
          bw = len / nb;
        for (let i = 0; i <= nb; i++) {
          const t = Math.min(len - 0.5, Math.max(0.5, i * bw));
          if (engaged && (i === 1 || i === 2)) {
            const [x, z] = at(t, 0.45);
            K.column(b, "marble", x, PODIUM + 0.4, z, 15.6, 0.66, {
              collide: false,
            });
            LB.col(x, z, 1.4, 1.4, 0, TOPO, 0, { walkable: false });
            continue;
          }
          bx("marble", t, 0.22, PODIUM + 0.4, 1.05, TOPO - PODIUM - 1.2, 0.44, {
            seg: true,
            segLen: 5,
            grime: 0.5,
          });
          bx("marble", t, 0.28, PODIUM + 0.4, 1.35, 0.5, 0.56, { grime: 0.5 }); // base
          bx("marble", t, 0.32, TOPO - 1.1, 1.45, 0.75, 0.64, { grime: 0.35 }); // capital block
          for (const sd of [-0.55, 0.55]) {
            const [x, z] = at(t + sd, 0.6);
            b.sphere("marble", x, TOPO - 0.72, z, 0.2, {
              ws: 6,
              hs: 4,
              grime: 0.3,
            });
          } // volutes
        }
        for (let i = 0; i < nb; i++) {
          const t = (i + 0.5) * bw,
            w1 = Math.min(2.0, bw - 1.6),
            h1 = 6.0,
            y1 = PODIUM + 1.3,
            h2 = 3.4,
            y2 = PODIUM + 10.6;
          const k1 = gk();
          qd(k1, t, 0.03, y1 + h1 / 2, w1, h1);
          bx("marble", t - w1 / 2 - 0.13, 0.1, y1, 0.26, h1, 0.22);
          bx("marble", t + w1 / 2 + 0.13, 0.1, y1, 0.26, h1, 0.22);
          bx("marble", t, 0.16, y1 - 0.24, w1 + 0.8, 0.24, 0.36); // sill
          {
            const ped = new THREE.Shape();
            ped.moveTo(-w1 / 2 - 0.45, 0);
            ped.lineTo(w1 / 2 + 0.45, 0);
            ped.lineTo(0, 0.75);
            ped.closePath();
            const [x, z] = at(t, 0.02);
            b.add(
              "marble",
              new THREE.ExtrudeGeometry(ped, {
                depth: 0.42,
                bevelEnabled: false,
              }),
              { m: LB.m4(x, y1 + h1 + 0.3, z, ryF), grime: 0.45 },
            );
          }
          bx("marble", t, 0.15, y1 + h1, w1 + 0.9, 0.3, 0.4);
          for (const d2 of [-w1 / 4, w1 / 4])
            qd("iron", t + d2, 0.05, y1 + h1 / 2, 0.05, h1, { grime: 0 });
          qd("iron", t, 0.05, y1 + h1 * 0.62, w1, 0.05, { grime: 0 });
          qd(
            "marble",
            t,
            0.025,
            (y1 + h1 + 1.1 + y2 - 0.2) / 2,
            w1 + 0.4,
            y2 - 0.2 - (y1 + h1 + 1.1),
            { c: 0x9c9688, grime: 0.6, uv: "box", noAO: false },
          ); // spandrel panel
          const k2 = gk();
          qd(k2, t, 0.03, y2 + h2 / 2, w1, h2);
          bx("marble", t, 0.14, y2 - 0.2, w1 + 0.5, 0.2, 0.3);
          bx("marble", t, 0.1, y2 + h2, w1 + 0.4, 0.22, 0.2);
          if (k1 === "glass_broken" && r() < 0.5)
            qd("concrete_dark", t, 0.015, y1 + h1 + 1.6, 1.6, 2.4, {
              grime: 0.8,
              noAO: false,
            }); // soot
        }
        // entablature returned from the front: architrave, frieze, modillioned cornice
        bx("marble", len / 2, 0.3, TOPO, len + 0.4, 0.8, 0.6, { grime: 0.4 });
        bx("marble", len / 2, 0.2, TOPO + 0.8, len + 0.3, 1.2, 0.4, {
          grime: 0.35,
        });
        bx("marble", len / 2, 0.55, TOPO + 2.0, len + 1.2, 0.6, 1.1, {
          grime: 0.4,
        });
        for (let t = 0.5; t < len; t += 0.9)
          bx("marble", t, 0.85, TOPO + 1.78, 0.22, 0.22, 0.6, { grime: 0.3 });
        // blind-arcaded attic: per bay a recessed dark panel under a round arch on imposts
        for (let i = 0; i < nb; i++) {
          const t = (i + 0.5) * bw,
            aw = bw - 1.3,
            ah = H - 2.4 - ATT - 1.2,
            rA = aw / 2;
          qd("marble", t, 0.02, ATT + 0.35 + (ah - rA) / 2, aw, ah - rA, {
            c: 0x8a857a,
            grime: 0.7,
            noAO: false,
          });
          {
            const [x, z] = at(t, 0.02);
            b.add("marble", new THREE.CircleGeometry(rA, 10, 0, Math.PI), {
              m: LB.m4(x, ATT + 0.35 + ah - rA, z, ryF),
              uv: "box",
              c: 0x8a857a,
              grime: 0.7,
            });
            const [xa, za] = at(t, 0.1);
            b.add(
              "marble",
              new THREE.RingGeometry(rA, rA + 0.3, 12, 1, 0, Math.PI),
              { m: LB.m4(xa, ATT + 0.35 + ah - rA, za, ryF), grime: 0.4 },
            );
          }
          bx("marble", t - aw / 2 - 0.15, 0.08, ATT + 0.35, 0.3, ah - rA, 0.18);
          bx("marble", t + aw / 2 + 0.15, 0.08, ATT + 0.35, 0.3, ah - rA, 0.18);
        }
        return { at, ryF, nx, nz, len };
      };
      const eastF = classicalFace([X1, ZF], [X1, ZB], "nyse_bway", true);
      classicalFace([X1, ZB], [X0, ZB], "nyse_south", false);
      const excK = LB.texMat(
        "nyse_exchange",
        LB.signTex(
          "nyse_exchange2",
          ["THE EXCHANGE", "EVERYTHING FOR SALE — INCLUDING YOU"],
          "raider",
          1024,
          256,
          { bg: "#7a7466", fg: "#f2d64a" },
        ),
        { emissive: 0.18 },
      );
      // Broadway dressing: a grimy iron flag bracket with a tattered flag, and the raiders' spray banner draped down the order
      {
        const [bx0, bz0] = eastF.at(14.0, 0.3),
          [bx1, bz1] = eastF.at(14.0, 3.4);
        b.rod(
          "iron",
          V(bx0, PODIUM + 12.6, bz0),
          V(bx1, PODIUM + 14.2, bz1),
          0.07,
          6,
          { grime: 0.6 },
        );
        b.rod(
          "iron",
          V(bx0, PODIUM + 11.2, bz0),
          V((bx0 + bx1) / 2, PODIUM + 13.4, (bz0 + bz1) / 2),
          0.04,
          4,
          { grime: 0.6 },
        );
        b.box("rust", bx0, PODIUM + 10.9, bz0, 0.5, 2.0, 0.5, { seg: false });
        const bf = LB.makeFlag ? LB.makeFlag(LB.flagTex(1), 2.9, 1.7) : null;
        if (bf) {
          bf.position.set(
            bx0 + (bx1 - bx0) * 0.12,
            PODIUM + 12.9,
            bz0 + (bz1 - bz0) * 0.12,
          );
          bf.rotation.y = Math.atan2(-(bz1 - bz0), bx1 - bx0);
          bf.rotation.z = 0.46;
          root.add(bf);
          LB.animate(bf.position, 180, (t) => bf.userData.wave(t));
        }
        const [gx, gz] = eastF.at(19.2, 0.62);
        b.quad(excK, gx, PODIUM + 9.5, gz, 3.4, 11.5, {
          ry: eastF.ryF,
          grime: 0.3,
          noAO: true,
          rz: Math.PI / 2,
        }); // spray banner (reuses the gate sign's texture — no extra draw call)
        b.box(
          "rust",
          gx - eastF.nx * 0.05,
          PODIUM + 15.3,
          gz - eastF.nz * 0.05,
          0.12,
          0.12,
          3.8,
          { ry: eastF.ryF + Math.PI / 2, seg: false },
        );
      }
      // ---- roof: parapet walk behind the balustrade, a glazed monitor skylight over the trading floor (smashed panes),
      // HVAC plant, ducts, a radio mast and a raider sniper nest
      {
        const RY = H - 2.4;
        const sx0 = XC - 6,
          sx1 = XC + 6,
          sz0 = ZF + 5,
          sz1 = ZB - 4;
        b.boxMM(
          "marble",
          sx0 - 0.5,
          RY,
          sz0 - 0.5,
          sx1 + 0.5,
          RY + 1.1,
          sz1 + 0.5,
          { grime: 0.6 },
        ); // skylight curb
        if (LB.glassHip)
          LB.glassHip(b, sx0, sx1, sz0, sz1, RY + 1.1, 2.4, {
            pane: 1.8,
            key: "glass_dark",
            missing: 0.18,
            seed: 5,
          }); // glass_dark: no extra material in this batch
        else
          b.boxMM("glass_dark", sx0, RY + 1.1, sz0, sx1, RY + 2.6, sz1, {
            seg: false,
          });
        const hv = LB.rng("nyse_roof");
        for (const [x, z, w, d, h] of [
          [X0 + 3, ZB - 3.5, 3.2, 2.4, 2.2],
          [X0 + 3, ZF + 6, 2.6, 2.0, 1.8],
          [X1 - 3.2, ZB - 3.2, 3.6, 2.2, 2.6],
          [X1 - 2.8, ZF + 9, 2.2, 2.2, 1.6],
        ]) {
          b.box("corrugated", x, RY, z, w, h, d, { seg: false, grime: 0.75 });
          b.cyl(
            "iron",
            x,
            RY + h,
            z,
            Math.min(w, d) * 0.36,
            Math.min(w, d) * 0.36,
            0.3,
            10,
            { hSeg: 1 },
          ); // fan shroud
          for (let k = 0; k < 3; k++)
            b.box(
              "iron",
              x,
              RY + h + 0.3,
              z,
              Math.min(w, d) * 0.7,
              0.04,
              0.06,
              { ry: k * 1.05, seg: false },
            );
          LB.colMM(x - w / 2, RY, z - d / 2, x + w / 2, RY + h, z + d / 2, {
            walkable: true,
            surface: "metal",
          });
        }
        b.rod(
          "corrugated",
          V(X0 + 3, RY + 1.2, ZB - 2.2),
          V(X0 + 3, RY + 1.2, ZF + 7),
          0.35,
          8,
          { grime: 0.6 },
        ); // duct run
        b.rod(
          "corrugated",
          V(X1 - 3.2, RY + 1.3, ZB - 2.1),
          V(sx1 + 0.5, RY + 1.3, ZB - 2.1),
          0.3,
          8,
          { grime: 0.6 },
        );
        b.cyl("iron", X0 + 2, RY, ZF + 1.5, 0.06, 0.12, 9, 6, { hSeg: 2 }); // radio mast
        for (const k of [0, 1, 2])
          b.rod(
            "iron",
            V(X0 + 2, RY + 8.5, ZF + 1.5),
            V(
              X0 + 2 + Math.cos(k * 2.1) * 3,
              RY,
              ZF + 1.5 + Math.sin(k * 2.1) * 3,
            ),
            0.012,
            3,
          );
        LB.sandbags(b, X1 - 5.5, ZF + 0.8, X1 - 1, ZF + 0.8, 2, {
          y: RY,
          noCollide: true,
        });
        b.box("planks", X1 - 3, RY, ZF + 2.4, 0.9, 0.7, 0.9, {
          seg: false,
          ry: hv(),
        });
        anchors.roof = LB.anchor(X1 - 3.2, RY, ZF + 1.8, 0);
      }
      // giant weathered flag hung BEHIND the colonnade (from the entablature soffit, in front of the glass wall), so the
      // six Corinthian columns read crisply against it — the Exchange's signature look. GPU-waved (no per-frame CPU).
      const flagMesh = LB.makeFlag
        ? LB.makeFlag(LB.flagTex(2), 15.2, 10.6, {
            hang: true,
            amp: 0.22,
            freq: 0.6,
            speed: 0.9,
          })
        : null;
      if (flagMesh) {
        flagMesh.position.set(XC + 7.6, PODIUM + 15.9, ZF - 0.75);
        flagMesh.rotation.y = Math.PI; // printed face toward Broad/Wall Street (north)
        root.add(flagMesh);
        b.box("iron", XC, PODIUM + 15.85, ZF - 0.75, 15.8, 0.14, 0.14, {
          seg: false,
        }); // hanging bar
      }
      // facade colliders with the door passage
      LB.colMM(X0 - 1, 0, ZF - 3.8, XC - 1.7, H + 1.5, ZF - 0.6, {
        walkable: false,
      });
      LB.colMM(XC + 1.7, 0, ZF - 3.8, X1 + 1, H + 1.5, ZF - 0.6, {
        walkable: false,
      });
      LB.colMM(XC - 1.7, 3.0, ZF - 3.8, XC + 1.7, H + 1.5, ZF - 0.6, {
        walkable: false,
      });

      // =================================================================
      // THE TRADING FLOOR (walk-in, lit batch, the Boss's throne, bell podium): 30_downtown_interior.js
      // =================================================================
      const ix = { root, anchors, X0, X1, XC, ZF, ZB, H };
      LB.interiorPart("nyse", "floor", ix);

      // =================================================================
      // THE FORECOURT FORT (scrap walls, bus gate, watchtowers) — inside x 1…30, z 809…816
      // =================================================================
      const FZ = 809.3,
        WX0 = 1.2,
        WX1 = 30; // front wall on the Wall St south sidewalk (the roadway stays clear)
      LB.scrapWall(b, WX0, FZ, 10, FZ, 4.2, { seed: 51 });
      LB.scrapWall(b, 21, FZ, WX1, FZ, 4.2, { seed: 52 });
      LB.scrapWall(b, WX1, FZ, WX1, 810.5, 4.2, { seed: 54 }); // east wall onto Broadway with an open side gate…
      LB.scrapWall(b, WX1, 815, WX1, ZF - 3.8, 4.2, { seed: 57 }); // …between z 810.5 and 815
      LB.scrapWall(b, WX0, FZ, WX0, ZF - 3.8, 4.2, { seed: 53 }); // west wall against the annex
      // gate: a school bus body pushed half across the main opening (passable gap at x 16.5…21)
      b.box("paint_orange", 13.2, 0.4, FZ + 1.4, 6.5, 3.0, 2.5, {
        seg: false,
        grime: 0.7,
      });
      for (let k = 0; k < 4; k++)
        b.quad("glass_broken", 10.9 + k * 1.3, 2.4, FZ + 0.12, 0.9, 0.8, {
          ry: Math.PI,
        });
      for (const x of [10.6, 15.8]) {
        const w = new THREE.CylinderGeometry(0.55, 0.55, 0.4, 10);
        w.rotateZ(Math.PI / 2);
        b.add("tire", w, { m: LB.m4(x, 0.55, FZ + 0.2, Math.PI / 2) });
      }
      LB.col(13.2, FZ + 1.4, 6.5, 2.5, 0, 3.4, 0, { surface: "metal" });
      b.box("rust", 15.5, 5.4, FZ, 12, 2.6, 0.2, { seg: false, grime: 0.6 });
      b.quad(excK, 15.5, 6.7, FZ - 0.12, 11.6, 2.4, { ry: Math.PI });
      for (const x of [9.6, 21.4])
        b.box("rust", x, 0, FZ, 0.3, 8.2, 0.3, { seg: false });
      const sideK = LB.texMat(
        "nyse_side",
        LB.signTex("nyse_side2", ["EXCHANGE", "OPEN ▸"], "raider", 512, 192, {
          bg: "#7a7466",
          fg: "#f2d64a",
        }),
        { emissive: 0.15 },
      );
      b.quad(sideK, WX1 + 0.12, 3.2, 812.75, 2.6, 1.0, { ry: Math.PI / 2 });
      for (const z of [810.3, 815.2]) {
        b.box("rust", WX1, 0, z, 0.3, 5.2, 0.3, { seg: false });
        b.sphere("lamp", WX1 + 0.2, 5.0, z, 0.16, { noAO: true, grime: 0 });
        LB.glows.push({
          pos: V(WX1 + 0.4, 5.0, z),
          color: 0xffc070,
          size: 2.2,
        });
      }
      for (const [x, z] of [
        [4.4, FZ + 3.2],
        [26.8, FZ + 3.2],
      ]) {
        for (const [dx, dz] of [
          [-1.4, -1.4],
          [1.4, -1.4],
          [-1.4, 1.4],
          [1.4, 1.4],
        ])
          b.box("rust", x + dx, 0, z + dz, 0.2, 7.5, 0.2, { seg: false });
        for (let y = 1.5; y < 7; y += 2) {
          b.beam(
            "rust",
            V(x - 1.4, y, z - 1.4),
            V(x + 1.4, y + 1.5, z - 1.4),
            0.08,
          );
          b.beam(
            "rust",
            V(x - 1.4, y, z + 1.4),
            V(x + 1.4, y + 1.5, z + 1.4),
            0.08,
          );
        }
        b.boxMM("planks", x - 1.8, 7.5, z - 1.8, x + 1.8, 7.7, z + 1.8, {
          seg: false,
        });
        LB.sandbags(b, x - 1.8, z - 1.8, x + 1.8, z - 1.8, 2, {
          y: 7.7,
          noCollide: true,
        });
        b.box("corrugated", x, 9.6, z, 4.0, 0.12, 4.0, {
          seg: false,
          rx: 0.08,
        });
        for (const [dx, dz] of [
          [-1.7, -1.7],
          [1.7, -1.7],
          [-1.7, 1.7],
          [1.7, 1.7],
        ])
          b.box("rust", x + dx, 7.7, z + dz, 0.1, 1.9, 0.1, { seg: false });
        LB.colMM(x - 1.8, 0, z - 1.8, x + 1.8, 7.7, z + 1.8, {
          walkable: true,
          surface: "wood",
        });
        anchors["tower_" + (x < XC ? "w" : "e")] = LB.anchor(x, 7.7, z, 0);
      }
      anchors.turret1 = LB.anchor(4.4, 7.7, FZ + 2.4, 0);
      anchors.turret2 = LB.anchor(26.8, 7.7, FZ + 2.4, 0); // facing Wall Street (north)
      // gate lighting: burning barrels either side of the bus, a string of bulbs under the sign, lanterns on the posts
      LB.barrel(b, 8.4, 0, FZ + 1.0, { fire: true });
      LB.barrel(b, 22.6, 0, FZ + 1.0, { fire: true });
      for (const x of [9.6, 21.4]) {
        b.sphere("lamp", x, 8.35, FZ - 0.1, 0.22, { noAO: true, grime: 0 });
        LB.glows.push({
          pos: V(x, 8.35, FZ - 0.35),
          color: 0xffc070,
          size: 3.2,
        });
      }
      for (let i = 0; i <= 8; i++) {
        const x = 10 + i * 1.4,
          y = 8.0 - Math.sin((i / 8) * Math.PI) * 0.7;
        b.sphere(i % 3 === 1 ? "lamp_red" : "lamp", x, y, FZ - 0.3, 0.09, {
          ws: 6,
          hs: 4,
          noAO: true,
          grime: 0,
        });
        if (i % 2 === 0)
          LB.glows.push({
            pos: V(x, y, FZ - 0.4),
            color: i % 3 === 1 ? 0xff5040 : 0xffd090,
            size: 1.1,
          });
      }
      // skull-on-spike 'price tags' along the top of the front wall
      for (const x of [3, 6.5, 24.5, 28]) {
        b.box("rust", x, 4.2, FZ, 0.07, 1.3, 0.07, { seg: false });
        b.sphere("bone", x, 5.55, FZ, 0.15, { sx: 1, sy: 1.1, sz: 1.2 });
      }
      // forecourt clutter (kept to the sides so the gate → door path stays clear)
      LB.barrel(b, 8.6, 0, 813.2, { fire: true });
      b.box("iron", 5.5, 0, 815.2, 4, 2.4, 0.15, { seg: false });
      for (let i = 0; i < 5; i++)
        b.box("iron", 4.0 + i * 0.75, 1.6, 815.3, 0.03, 0.8, 0.03, {
          seg: false,
        });
      LB.car(b, 22.4, 0, 812.9, 1.45, { seed: 7, flipped: true });
      // radioactive barrel dump by the Broadway side gate (Geiger crackle)
      for (let i = 0; i < 4; i++) {
        b.cyl(
          "paint_orange",
          26.6 + (i % 2) * 0.7,
          0,
          814.6 + Math.floor(i / 2) * 0.7,
          0.3,
          0.3,
          0.9,
          10,
          { hSeg: 1 },
        );
      }
      b.cyl("goo", 26.95, 0.02, 814.95, 1.3, 1.3, 0.03, 12, { hSeg: 1 });
      try {
        G.world.addRadSource({
          x: 26.95,
          y: 0.5,
          z: 814.95,
          radius: 4.5,
          strength: 2.2,
        });
      } catch (e) {
        /* core */
      }
      buildAnnex();
      anchors.gate = LB.anchor(18.8, 0, FZ - 2, 0);
      anchors.side_gate = LB.anchor(WX1 + 2, 0, 812.75, Math.PI / 2);
      anchors.entrance = LB.anchor(XC, 0, ZF - 5, 0);
      anchors.footlocker = LB.anchor(7.6, 0, 813.9, 0);
      // ---- 11 Wall Street (1922 annex): the west half of the block, a plain limestone slab with a rusticated base,
      //      boarded arcade, a blown-open corner and a raider billboard on its roof ----
      function buildAnnex() {
        const AX0 = site.x0 + 1,
          AX1 = -0.6,
          AZ0 = site.z0 + 1.2,
          AZ1 = site.z1 - 0.6,
          AH = 44,
          SB = 38;
        const ap = [
          [AX0, AZ0],
          [AX1, AZ0],
          [AX1, AZ1],
          [AX0, AZ1],
        ];
        K.prism(b, "granite_dark", K.offsetPoly(ap, 0.1), 0, 1.2, {
          grime: 0.7,
        });
        K.prismBands(b, "limestone", ap, 1.2, 9, 3, { grime: 0.7 });
        for (let y = 2.4; y < 9; y += 1.2)
          K.prism(b, "limestone", K.offsetPoly(ap, 0.06), y, y + 0.1, {
            grime: 0.5,
            noAO: true,
          }); // rustication
        K.prism(b, "limestone", K.offsetPoly(ap, 0.4), 8.8, 9.6, {
          grime: 0.5,
        });
        K.prismBands(b, "limestone", ap, 9.6, SB, 7, { grime: 0.5 });
        K.polyWindows(b, ap, {
          y0: 11,
          floors: 9,
          floorH: 3.0,
          w: 1.1,
          h: 1.9,
          spacing: 2.4,
          inset: 0.04,
          broken: 0.35,
          boarded: 0.08,
          lit: 0.01,
          seed: 71,
          frameKey: "limestone",
          margin: 1.4,
        });
        K.prism(b, "limestone", K.offsetPoly(ap, 0.55), SB, SB + 0.9, {
          grime: 0.4,
        });
        const tp = K.offsetPoly(ap, -2.2);
        K.prism(b, "limestone", tp, SB + 0.9, AH, { grime: 0.45 });
        K.polyWindows(b, tp, {
          y0: SB + 2,
          floors: 1,
          floorH: 3,
          w: 1.1,
          h: 2.2,
          spacing: 2.4,
          inset: 0.04,
          broken: 0.5,
          seed: 72,
          frameKey: "limestone",
          margin: 1.4,
        });
        K.prism(b, "limestone", K.offsetPoly(tp, 0.35), AH, AH + 0.7, {});
        // ground-floor arcade: tall arched openings, boarded or black
        {
          const r = LB.rng("annex_gf");
          for (const [p, q, ry] of [
            [[AX0, AZ0], [AX1, AZ0], Math.PI],
            [[AX0, AZ1], [AX1, AZ1], 0],
            [[AX0, AZ0], [AX0, AZ1], -Math.PI / 2],
          ]) {
            const len = Math.hypot(q[0] - p[0], q[1] - p[1]),
              ux = (q[0] - p[0]) / len,
              uz = (q[1] - p[1]) / len,
              nx = Math.sin(ry),
              nz = Math.cos(ry);
            for (let t = 3; t < len - 2; t += 4.2) {
              const x = p[0] + ux * t + nx * 0.12,
                z = p[1] + uz * t + nz * 0.12;
              b.quad(
                r() < 0.5 ? "planks" : "glass_broken",
                x,
                3.4,
                z,
                2.6,
                4.4,
                { ry, uv: "box", grime: 0.2, noAO: true },
              );
              b.add(
                "limestone",
                new THREE.RingGeometry(1.3, 1.75, 10, 1, 0, Math.PI),
                { m: LB.m4(x + nx * 0.02, 5.6, z + nz * 0.02, ry), grime: 0.4 },
              );
            }
          }
        }
        const n11 = LB.texMat(
          "nyse_11wall",
          LB.signTex(
            "nyse_11wall",
            ["ELEVEN WALL STREET"],
            "engraved",
            1024,
            96,
            { bg: "#cfc8b8", size: 56 },
          ),
        );
        b.quad(n11, (AX0 + AX1) / 2, 7.8, AZ0 - 0.14, 12, 0.8, { ry: Math.PI });
        LB.colMM(AX0, 0, AZ0, AX1, AH + 0.7, AZ1, { walkable: false });
        // the blown-open north-east corner: a ragged black cavity with slabs hanging out, rubble fan on the forecourt side
        const hx = AX1 - 3.2,
          hz = AZ0 + 0.02;
        b.quad("glass_broken", hx, 22, hz - 0.05, 7.0, 9.5, {
          ry: Math.PI,
          uv: "box",
          noAO: true,
          grime: 0.6,
        });
        for (let k = 0; k < 3; k++)
          b.box(
            "concrete_dark",
            hx - 1.6 + k * 1.4,
            18.5 + k * 3.1,
            hz - 0.9,
            3.4,
            0.35,
            2.2,
            { rx: 0.25 - k * 0.12, rz: (k - 1) * 0.15, seg: false, grime: 0.8 },
          );
        for (let k = 0; k < 6; k++)
          b.beam(
            "rust",
            V(hx - 3 + k * 1.1, 17.6 + (k % 3) * 2.8, hz),
            V(hx - 3.4 + k * 1.2, 16.4 + (k % 3) * 2.6, hz - 1.4 - (k % 2)),
            0.05,
            0.05,
          );
        D.rubble(b, hx, 0, hz - 3, 2.2, 10, 73);
        LB.billboard(
          b,
          "super_sergeant",
          (AX0 + AX1) / 2,
          AH + 0.7,
          AZ0 + 6,
          Math.PI,
          12,
          5.2,
          3.4,
        );
        // rooftop water tower
        const wx = AX0 + 6,
          wz = AZ1 - 6,
          ry = AH + 0.7;
        for (const [dx, dz] of [
          [-1.4, -1.4],
          [1.4, -1.4],
          [-1.4, 1.4],
          [1.4, 1.4],
        ])
          b.box("iron", wx + dx, ry, wz + dz, 0.2, 3.6, 0.2, { seg: false });
        b.box("iron", wx, ry + 2.6, wz, 3.2, 0.15, 3.2, { seg: false });
        b.cyl("rotten", wx, ry + 3.6, wz, 1.9, 2.0, 4.0, 14, {
          hSeg: 3,
          grime: 0.5,
        });
        b.cyl("rust", wx, ry + 7.6, wz, 0.05, 2.1, 1.4, 14, { hSeg: 1 });
      }
      const g = b.build(root);
      g.name = "nyse";
      ix.g = g;
      LB.interiorPart("nyse", "attach", ix); // the lit trading-floor batch under the landmark + its ticker animation
      LB.register("nyse", g, anchors, ["wall_street"]);
      LB.plaque(
        V(XC - 3.2, 1.4, ZF - 4),
        "Exchange Plaque",
        '"On this site in 1967 the market closed at an all-time high, followed shortly by an all-time low. Trading has since resumed in scrip, ammunition and people. Past performance is no guarantee of survival."',
      );
      LB.onReady.push(() => {
        LB.spawnProp("turret", {
          x: anchors.turret1.x,
          y: anchors.turret1.y,
          z: anchors.turret1.z,
          yaw: 0,
          faction: "raiders",
        });
        LB.spawnProp("turret", {
          x: anchors.turret2.x,
          y: anchors.turret2.y,
          z: anchors.turret2.z,
          yaw: 0,
          faction: "raiders",
        });
        LB.interiorPart("nyse", "props", ix); // the Boss's safe behind the throne
        LB.spawnProp("footlocker", {
          x: anchors.footlocker.x,
          y: 0,
          z: anchors.footlocker.z,
          yaw: 0,
          loot: "raider_stash",
          owner: "raiders",
        });
      });
    },
    33,
  );
