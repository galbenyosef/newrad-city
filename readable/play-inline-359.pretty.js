/* src/poi_wallst/10_stpauls_ext.js */
/* =====================================================================
 * NEW RAD CITY — POI WALL STREET — 10_stpauls_ext.js
 * ST. PAUL'S CHAPEL (1766) — exterior on its site (x -110..-50,
 * z 631..664): Manhattan-schist Georgian chapel with brownstone quoins,
 * two tiers of windows, the giant Broadway portico (east, facing 7th Ave
 * here) with its pediment and statue niche, the white timber steeple of
 * 1794 (clock stage, octagonal belfry, lantern, spire) over the west door,
 * the colonial churchyard (slate headstones with winged death's heads,
 * table tombs, obelisks) behind an iron railing — now "St. Paul's Refuge":
 * gates with sandbags, lean-tos under the portico, a cook fire, garden
 * beds and laundry lines. Door: west tower door → interior narthex.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._pws) return;
  const PF = G._pws;
  const K = PF.kit,
    D = PF.dress;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const PI = Math.PI,
    HP = PI / 2,
    TAU = PI * 2;

  // footprint (world)
  const SP = (PF.SP = {
    FN: 632.4,
    FS: 662.6,
    FW: -109.5,
    FE: -50.5, // churchyard fence line
    TW: -105,
    TE: -98,
    TN: 644,
    TS: 651,
    ZC: 647.5, // tower
    NW: -98,
    NE: -72,
    NN: 639.5,
    NS: 655.5, // nave
    PE: -66,
    PN: 640.3,
    PS: 654.7, // portico
    WALL: 10.5,
    RIDGE: 15.2,
    TOWER: 15.6,
  });
  PF.SP.door = V3(SP.TW - 0.35, 1.6, SP.ZC);

  PF.addBuilder(
    "st_pauls_chapel",
    function (PF2, site, root) {
      const b = PF.batch("stpauls_ext");
      b.ground = 0;
      b.aoH = 4;
      const r = PF.rng("stpauls");
      const anchors = {};
      const {
        FN,
        FS,
        FW,
        FE,
        TW,
        TE,
        TN,
        TS,
        ZC,
        NW,
        NE,
        NN,
        NS,
        PE,
        PN,
        PS,
        WALL,
        RIDGE,
        TOWER,
      } = SP;
      // every sign, dial and headstone face of the chapel in ONE atlas (one draw call instead of nine)
      const AT = PF.atlas("stpauls", [
        [
          "welcome",
          PF.signTex(
            "sp_welcome",
            [
              "ST. PAUL'S REFUGE",
              "ALL WELCOME — WEAPONS HOLSTERED",
              "SOUP AT SUNDOWN",
            ],
            "raider",
            512,
            200,
            { bg: "#e0d8c4", fg: "#2a3a5a", outline: false },
          ),
        ],
        [
          "board",
          PF.signTex(
            "sp_board",
            [
              "ST. PAUL'S CHAPEL",
              "Built 1766 · Oldest Church in Manhattan",
              "Prayer · Shelter · Medicine",
            ],
            "enamel",
            512,
            200,
            { bg: "#1e2a44", fg: "#e8dfc4" },
          ),
        ],
        [
          "montgomery",
          PF.signTex(
            "sp_montgomery",
            [
              "THIS MONUMENT",
              "is erected by order of Congress",
              "to transmit to posterity",
              "a grateful remembrance",
              "of the patriotism, conduct,",
              "enterprise & perseverance",
              "of MAJOR GENERAL",
              "RICHARD MONTGOMERY",
            ],
            "engraved",
            256,
            320,
            { bg: "#d8d0c0" },
          ),
        ],
        [
          "way",
          PF.signTex(
            "sp_way",
            [
              "REFUGE ENTRANCE",
              "WEST DOOR — ROUND THE YARD",
              "→ follow the lanterns →",
            ],
            "raider",
            512,
            200,
            { bg: "#d8ccb0", fg: "#7a1a14", outline: false },
          ),
        ],
        ["clock", PF.clockTex(false)],
        ["hs0", PF.headstoneTex(0)],
        ["hs1", PF.headstoneTex(1)],
        ["hs2", PF.headstoneTex(2)],
        ["hs3", PF.headstoneTex(3)],
      ]);
      const atq = (name, x, y, z, w, h, o) =>
        b.quad(
          AT.key,
          x,
          y,
          z,
          w,
          h,
          Object.assign({ uvRect: AT.rect(name) }, o),
        );
      PF.hsAtlas = AT;

      // =================================================================
      // GROUND: churchyard turf, flagstone paths, the refuge's garden beds
      // =================================================================
      b.boxMM("dirt", FW, -0.1, FN, FE, 0.1, FS, { grime: 0.3, segLen: 6 });
      for (const [x0, z0, x1, z1] of [
        [FW + 0.6, FN + 0.6, FE - 0.6, NN - 1.2],
        [FW + 0.6, NS + 1.2, FE - 0.6, FS - 0.6],
        [PE + 1.2, NN - 1.2, FE - 0.6, NS + 1.2],
      ]) {
        b.boxMM("grass", x0, 0.1, z0, x1, 0.13, z1, { grime: 0.5, segLen: 6 });
      }
      // flagstone paths: west gate → tower door, south gate → west path, east gate → portico, walk around the chapel
      const flag = (x0, z0, x1, z1) =>
        b.boxMM("flagstone", x0, 0.1, z0, x1, 0.16, z1, {
          grime: 0.55,
          segLen: 3,
        });
      flag(FW, ZC - 2, TW, ZC + 2);
      flag(-81, NS + 1.2, -77, FS);
      flag(NW - 1, NS + 0.2, PE, NS + 1.4);
      flag(NW - 1, NN - 1.4, PE, NN - 0.2);
      flag(TW - 1.2, NN - 1.4, TW, NS + 1.4);
      flag(PE, ZC - 2, FE, ZC + 2);
      flag(NE, PN, PE + 0.8, PS); // portico floor
      b.boxMM("brown_sp", NE, 0, PN - 0.3, PE + 0.8, 0.45, PS + 0.3, {
        seg: false,
        grime: 0.6,
      });
      PF.colMM(NE, 0, PN - 0.3, PE + 0.8, 0.45, PS + 0.3, {
        surface: "concrete",
      });
      for (let k = 0; k < 2; k++) {
        b.boxMM(
          "brown_sp",
          PE + 0.8,
          0,
          PN + 1,
          PE + 1.4 + k * 0.1,
          0.3 - k * 0.15,
          PS - 1,
          { seg: false },
        );
      }
      PF.colMM(PE + 0.8, 0, PN + 1, PE + 1.5, 0.3, PS - 1, {
        surface: "concrete",
      });

      // =================================================================
      // RAILING: brownstone kneewall + iron pickets with urn finials, three gates
      // =================================================================
      const railRun = (x0, z0, x1, z1) => {
        const len = Math.hypot(x1 - x0, z1 - z0),
          ry = Math.atan2(-(z1 - z0), x1 - x0);
        if (len < 0.3) return;
        b.box("brown_sp", (x0 + x1) / 2, 0, (z0 + z1) / 2, len, 0.55, 0.5, {
          ry,
          seg: false,
          grime: 0.6,
        });
        b.box(
          "brown_sp",
          (x0 + x1) / 2,
          0.55,
          (z0 + z1) / 2,
          len + 0.08,
          0.1,
          0.6,
          { ry, seg: false, c: 0xd8c0b0 },
        );
        const n = Math.max(1, Math.round(len / 0.18));
        for (let i = 0; i <= n; i++) {
          const t = i / n,
            px = x0 + (x1 - x0) * t,
            pz = z0 + (z1 - z0) * t;
          if (r() < 0.05) continue;
          const bent = r() < 0.06;
          b.box("iron", px, 0.65, pz, 0.03, 1.25, 0.03, {
            seg: false,
            grime: 0.2,
            rz: bent ? (r() - 0.5) * 0.7 : 0,
            rx: bent ? (r() - 0.5) * 0.4 : 0,
          });
          if (!bent)
            b.cyl("iron", px, 1.9, pz, 0.001, 0.04, 0.12, 3, {
              hSeg: 1,
              open: true,
            }); // spear finial (open 3-sided cone: 6 tris)
        }
        b.beam("iron", V3(x0, 0.85, z0), V3(x1, 0.85, z1), 0.05, 0.03);
        b.beam("iron", V3(x0, 1.75, z0), V3(x1, 1.75, z1), 0.05, 0.03);
        for (let p = 0; p <= len; p += 4) {
          const t = p / len,
            px = x0 + (x1 - x0) * t,
            pz = z0 + (z1 - z0) * t;
          b.box("iron", px, 0.65, pz, 0.1, 1.45, 0.1, { seg: false });
          b.lathe(
            "iron",
            [
              [0.02, 0],
              [0.09, 0.05],
              [0.1, 0.16],
              [0.05, 0.22],
              [0.02, 0.3],
            ],
            6,
            px,
            2.1,
            pz,
            {},
          );
        }
        PF.colWall(x0, z0, x1, z1, 0.55, 0, 2.1, { walkable: false });
      };
      railRun(FW, FN, FE, FN); // Chambers St (north)
      railRun(FW, FS, -81.2, FS);
      railRun(-76.8, FS, FE, FS); // Fulton St (south gate)
      railRun(FW, FN, FW, ZC - 2.2);
      railRun(FW, ZC + 2.2, FW, FS); // 8th Ave (west gate)
      railRun(FE, FN, FE, ZC - 2.2);
      railRun(FE, ZC + 2.2, FE, 654.6);
      railRun(FE, 659.2, FE, FS); // 7th Ave (east gate)
      // a section of the 7th Ave railing flattened onto the sidewalk (a car, long ago): pickets, rails, a split kneewall
      {
        const z0 = 654.8,
          z1 = 659.0,
          xo = FE + 1.15;
        b.box("brown_sp", FE, 0, (z0 + z1) / 2 - 1.2, 0.5, 0.35, 1.5, {
          seg: false,
          grime: 0.7,
          rx: 0.05,
        });
        D.rubble(b, FE + 0.2, 0.1, (z0 + z1) / 2 + 0.8, 0.35, 5, 17);
        for (let z = z0; z <= z1; z += 0.18)
          if (r() > 0.1)
            b.box("iron", xo + (r() - 0.5) * 0.06, 0.08, z, 1.25, 0.03, 0.03, {
              seg: false,
              grime: 0.3,
              ry: (r() - 0.5) * 0.08,
            });
        for (const dx of [-0.4, 0.5])
          b.beam(
            "iron",
            V3(xo + dx, 0.1, z0),
            V3(xo + dx + 0.05, 0.1, z1),
            0.05,
            0.03,
          );
      }
      // gate piers (brownstone, with iron lanterns — the refuge keeps two lit)
      const piers = [
        [FW, ZC - 2.2],
        [FW, ZC + 2.2],
        [-81.2, FS],
        [-76.8, FS],
        [FE, ZC - 2.2],
        [FE, ZC + 2.2],
      ];
      piers.forEach(([x, z], i) => {
        b.box("brown_sp", x, 0, z, 0.9, 2.4, 0.9, { seg: false, grime: 0.55 });
        b.box("brown_sp", x, 2.4, z, 1.05, 0.2, 1.05, { seg: false });
        b.lathe(
          "brown_sp",
          [
            [0.05, 0],
            [0.3, 0.05],
            [0.36, 0.3],
            [0.2, 0.55],
            [0.26, 0.62],
            [0.02, 0.8],
          ],
          8,
          x,
          2.6,
          z,
          {},
        );
        PF.col(x, z, 0.9, 0.9, 0, 2.6, 0, { walkable: false });
        if (i % 2 === 0) {
          const lit = i !== 4;
          b.box("iron", x, 3.4, z, 0.26, 0.4, 0.26, { seg: false });
          b.box(lit ? "lamp_ws" : "glass_broken", x, 3.45, z, 0.2, 0.3, 0.2, {
            seg: false,
            noAO: true,
            grime: 0,
          });
          if (lit)
            PF.glow(V3(x, 3.6, z), 0xffc070, 1.6, null, {
              intensity: 1.0,
              flicker: 0.2,
              dayFactor: 0.25,
            });
        }
      });
      // open gate leaves (wrought iron, one hanging off its hinge)
      b.box("iron", FW - 0.1, 0.15, ZC - 2.0, 0.05, 1.7, 1.7, {
        ry: 0.9,
        seg: false,
      });
      b.box("iron", -81.1, 0.1, FS + 0.9, 1.7, 1.7, 0.05, {
        ry: 1.2,
        rz: 0.18,
        seg: false,
      });
      b.box("iron", FE + 0.9, 0.15, ZC + 2.0, 1.7, 1.7, 0.05, {
        ry: -0.9,
        seg: false,
      });

      // =================================================================
      // NAVE: schist rubble walls, brownstone quoins & surrounds, 2 window tiers
      // =================================================================
      b.boxMM("brown_sp", NW - 0.25, 0, NN - 0.25, NE + 0.25, 0.8, NS + 0.25, {
        seg: false,
        grime: 0.7,
      }); // water table
      b.boxMM("schist_sp", NW, 0.8, NN, NE, WALL, NS, {
        segLen: 4,
        grime: 0.55,
      });
      PF.colMM(NW, 0, NN, NE, WALL + 0.8, NS, { walkable: false });
      const quoins = (x, z, sx, sz, y0, y1) => {
        let y = y0,
          k = 0;
        while (y < y1 - 0.2) {
          const hh = Math.min(0.55, y1 - y),
            long = k % 2 === 0;
          b.box(
            "brown_sp",
            x - sx * (long ? 0.55 : 0.3) + 0,
            y,
            z,
            long ? 1.1 : 0.6,
            hh - 0.04,
            0.18,
            { seg: false, grime: 0.5 },
          );
          b.box(
            "brown_sp",
            x,
            y,
            z - sz * (long ? 0.3 : 0.55),
            0.18,
            hh - 0.04,
            long ? 0.6 : 1.1,
            { seg: false, grime: 0.5 },
          );
          y += hh;
          k++;
        }
      };
      quoins(NE + 0.05, NN - 0.05, 1, -1, 0.8, WALL);
      quoins(NE + 0.05, NS + 0.05, 1, 1, 0.8, WALL);
      quoins(NW - 0.05, NN - 0.05, -1, -1, 0.8, WALL);
      quoins(NW - 0.05, NS + 0.05, -1, 1, 0.8, WALL);
      // cornice + frieze
      b.boxMM(
        "sp_white",
        NW - 0.35,
        WALL,
        NN - 0.45,
        NE + 0.35,
        WALL + 0.35,
        NS + 0.45,
        { seg: false, grime: 0.4 },
      );
      b.boxMM(
        "sp_white",
        NW - 0.5,
        WALL + 0.35,
        NN - 0.6,
        NE + 0.5,
        WALL + 0.6,
        NS + 0.6,
        { seg: false, grime: 0.4 },
      );
      for (let x = NW + 0.3; x < NE; x += 0.6)
        for (const z of [NN - 0.5, NS + 0.5])
          b.box("sp_white", x, WALL + 0.12, z, 0.16, 0.2, 0.16, { seg: false }); // modillions
      // windows on the long walls: 5 bays; lower rectangular, upper tall round-arched with white muntins
      const bays = 5,
        bw = (NE - NW) / bays;
      for (const [z, ry] of [
        [NS, 0],
        [NN, PI],
      ]) {
        for (let i = 0; i < bays; i++) {
          const x = NW + (i + 0.5) * bw;
          const roll = r();
          const paneLo =
            roll < 0.18
              ? "glass_broken"
              : roll < 0.45
                ? "planks"
                : "glass_dark";
          PF.classicWindow(
            b,
            x,
            1.6,
            z + (ry === 0 ? 0.01 : -0.01),
            ry,
            1.5,
            2.3,
            {
              pane: paneLo,
              frame: "brown_sp",
              head: "cornice",
              muntins: [3, 4],
              muntinKey: "timber_white",
              keystone: true,
            },
          );
          if (paneLo === "planks") {
            // the refuge nailed boards across the ground-floor windows
            const off = ry === 0 ? 0.08 : -0.08;
            for (let k = 0; k < 3; k++)
              b.box("rotten", x, 1.9 + k * 0.7, z + off, 1.8, 0.2, 0.05, {
                rz: (r() - 0.5) * 0.35,
                seg: false,
                grime: 0.6,
              });
          }
          const roll2 = r();
          PF.archBay(b, x, 5.1, z + (ry === 0 ? 0.02 : -0.02), ry, 1.8, 4.3, {
            pane:
              roll2 < 0.2
                ? "glass_broken"
                : roll2 < 0.28
                  ? "planks"
                  : "glass_dark",
            ring: "brown_sp",
            key: "brown_sp",
            sash: roll2 >= 0.2,
            sashKey: "timber_white",
            jambs: true,
            ringW: 0.28,
          });
          // sill
          const c = Math.cos(ry),
            s = Math.sin(ry);
          b.box("brown_sp", x, 4.95, z + c * 0.15 + s * 0, 2.2, 0.16, 0.34, {
            ry,
            seg: false,
          });
        }
      }
      // pitched slate roof over nave + portico (east gable = the portico pediment)
      {
        const len = PE + 0.5 - (NW - 0.4),
          half = (NS - NN) / 2 + 0.6,
          rise = RIDGE - WALL - 0.6;
        const slope = Math.hypot(half, rise),
          ang = Math.atan2(rise, half);
        const cx = (NW - 0.4 + PE + 0.5) / 2,
          cz = (NN + NS) / 2;
        for (const sg of [-1, 1]) {
          b.box(
            "slate_roof",
            cx,
            WALL + 0.6 + rise / 2 - 0.2,
            cz + (sg * half) / 2,
            len,
            0.25,
            slope,
            { rx: sg * ang, seg: true, segLen: 4, grime: 0.6 },
          );
        }
        b.box("slate_roof", cx, RIDGE - 0.1, cz, len, 0.25, 0.4, {
          seg: false,
        });
        // gable infill above the nave's west wall (behind the tower)
        const sh = new THREE.Shape();
        sh.moveTo(-half, 0);
        sh.lineTo(half, 0);
        sh.lineTo(0, rise);
        sh.closePath();
        const g = new THREE.ExtrudeGeometry(sh, {
          depth: 0.6,
          bevelEnabled: false,
        });
        b.add("schist_sp", g, {
          m: PF.m4(NW - 0.3, WALL + 0.6, cz, HP),
          grime: 0.5,
        });
        // a hole in the roof (fire damage) with scorched rafters, and patches of missing slates showing the battens
        for (let k = 0; k < 6; k++)
          b.box(
            "rotten",
            -83 + k * 0.7,
            WALL + 1.6 + (k % 2) * 0.3,
            NS - 2.5,
            0.18,
            0.18,
            4.2,
            { rx: -ang, seg: false, c: 0x5a4a3a },
          );
        const onSlope = (sg, x, f, w, h, key, o) => {
          // point on the slope at fraction f (0 eave → 1 ridge), lifted off the slates along the normal
          const zz = cz + sg * half * (1 - f),
            yy = WALL + 0.6 + rise * f;
          const nY = Math.cos(ang),
            nZ = sg * Math.sin(ang);
          b.quad(
            key,
            x,
            yy + nY * 0.16,
            zz + nZ * 0.16,
            w,
            h,
            Object.assign(
              { rx: ang - HP, ry: sg > 0 ? 0 : PI, noAO: true, grime: 0.2 },
              o || {},
            ),
          );
          return [yy + nY * 0.2, zz + nZ * 0.2];
        };
        for (const [sg, x, f, w, h] of [
          [1, -81, 0.5, 4.2, 2.2],
          [1, -69.5, 0.35, 1.6, 1.1],
          [1, -90.5, 0.62, 1.2, 0.9],
          [-1, -86, 0.45, 2.2, 1.3],
          [-1, -73, 0.6, 1.4, 0.8],
        ]) {
          const [yy, zz] = onSlope(sg, x, f, w, h, "glass_broken");
          for (let k = 0; k < Math.round(h / 0.35); k++) {
            // battens across the hole
            const ff = f + ((k - (h / 0.35 - 1) / 2) * 0.35) / slope;
            const zb = cz + sg * half * (1 - ff),
              yb = WALL + 0.6 + rise * ff;
            b.box(
              "rotten",
              x + (r() - 0.5) * 0.3,
              yb + 0.1,
              zb + sg * 0.1,
              w * (0.7 + r() * 0.4),
              0.05,
              0.08,
              { rx: sg * ang, seg: false, c: 0x6a5a48 },
            );
          }
          for (let k = 0; k < 5; k++)
            b.box(
              "slate_roof",
              x + (r() - 0.5) * w * 1.2,
              yy + 0.02,
              zz + sg * (r() - 0.5) * 0.3,
              0.35,
              0.03,
              0.5,
              {
                rx: sg * ang + (r() - 0.5) * 0.4,
                ry: (r() - 0.5) * 0.8,
                seg: false,
              },
            ); // slipped slates
        }
      }

      // =================================================================
      // EAST PORTICO: four giant columns, entablature, pediment + statue niche,
      // the Palladian window and the Montgomery memorial on the chancel wall
      // =================================================================
      {
        const colX = PE - 0.9,
          n = 4;
        for (let i = 0; i < n; i++) {
          const z = PN + 1.0 + (i * (PS - PN - 2.0)) / (n - 1);
          K.column(b, "sp_white", colX, 0.45, z, WALL - 0.45, 0.5, {
            flutes: 16,
          });
        }
        // coffered soffit under the portico roof
        b.boxMM("sp_white", NE, WALL + 0.55, PN, PE, WALL + 0.65, PS, {
          seg: false,
          grime: 0.3,
          noAO: true,
        });
        // entablature over the columns
        b.boxMM("sp_white", PE - 1.6, WALL, PN, PE, WALL + 0.6, PS, {
          seg: false,
          grime: 0.35,
        });
        b.boxMM(
          "sp_white",
          PE - 1.8,
          WALL + 0.6,
          PN - 0.3,
          PE + 0.35,
          WALL + 0.9,
          PS + 0.3,
          { seg: false },
        );
        // pediment (east face)
        K.pediment(
          b,
          "sp_white",
          PE - 0.2,
          WALL + 0.9,
          (PN + PS) / 2,
          PS - PN + 0.4,
          RIDGE - WALL - 1.1,
          0.6,
          HP,
          { corniceKey: "sp_white" },
        );
        // statue of St. Paul in a round-headed niche in the tympanum (weathered wood, the sword lost)
        const nz = (PN + PS) / 2;
        b.box("slate", PE + 0.12, WALL + 1.4, nz, 0.1, 1.9, 1.0, {
          seg: false,
        });
        b.cyl("slate", PE + 0.12, WALL + 3.3, nz, 0.5, 0.5, 0.1, 10, {
          rz: HP,
          thetaLen: PI,
          hSeg: 1,
        });
        b.cyl("sp_white", PE + 0.28, WALL + 1.4, nz, 0.2, 0.3, 1.3, 8, {
          hSeg: 2,
        });
        b.sphere("sp_white", PE + 0.28, WALL + 2.9, nz, 0.15, { ws: 8, hs: 6 });
        b.box("sp_white", PE + 0.38, WALL + 2.2, nz + 0.2, 0.08, 0.5, 0.08, {
          rz: 0.4,
          seg: false,
        });
        // chancel wall inside the portico: Palladian window + memorial
        const wx = NE + 0.02;
        PF.archBay(b, wx, 5.6, nz, -HP * -1, 2.2, 4.4, {
          pane: "glass_dark",
          ring: "brown_sp",
          key: "brown_sp",
          sash: true,
          sashKey: "timber_white",
          jambs: true,
        });
        for (const sg of [-1, 1])
          PF.classicWindow(b, wx, 5.6, nz + sg * 2.4, HP, 1.0, 2.4, {
            pane: "glass_dark",
            frame: "brown_sp",
            muntins: [2, 3],
          });
        // Montgomery memorial: marble cenotaph with urn & trophies under the window
        b.boxMM("marble_ws", wx, 0.45, nz - 1.6, wx + 0.6, 3.2, nz + 1.6, {
          seg: false,
          grime: 0.6,
        });
        b.boxMM("marble_ws", wx, 3.2, nz - 1.8, wx + 0.75, 3.45, nz + 1.8, {
          seg: false,
          grime: 0.5,
        });
        b.lathe(
          "marble_ws",
          [
            [0.05, 0],
            [0.35, 0.05],
            [0.45, 0.4],
            [0.3, 0.8],
            [0.35, 0.9],
            [0.05, 1.2],
          ],
          10,
          wx + 0.35,
          3.45,
          nz,
          { grime: 0.5 },
        );
        atq("montgomery", wx + 0.62, 1.9, nz, 1.6, 2.0, { ry: HP, grime: 0.4 });
        PF.col(wx + 0.3, nz, 0.7, 3.6, 0, 3.5, 0, { walkable: false });
      }

      // =================================================================
      // TOWER + STEEPLE (west): stone base, clock stage, belfry, lantern, spire
      // =================================================================
      {
        const tx = (TW + TE) / 2,
          tz = ZC,
          tw = TE - TW;
        b.boxMM(
          "brown_sp",
          TW - 0.25,
          0,
          TN - 0.25,
          TE + 0.25,
          0.8,
          TS + 0.25,
          { seg: false, grime: 0.7 },
        );
        b.boxMM("schist_sp", TW, 0.8, TN, TE, TOWER, TS, {
          segLen: 4,
          grime: 0.55,
        });
        PF.colMM(TW, 0, TN, TE, TOWER, TS, { walkable: false });
        quoins(TW - 0.05, TN - 0.05, -1, -1, 0.8, TOWER);
        quoins(TW - 0.05, TS + 0.05, -1, 1, 0.8, TOWER);
        quoins(TE + 0.05, TN - 0.05, 1, -1, WALL + 0.6, TOWER);
        quoins(TE + 0.05, TS + 0.05, 1, 1, WALL + 0.6, TOWER);
        // west door: round-headed, brownstone surround, panelled double door, fanlight, a stone step
        const dx = TW - 0.02;
        PF.archBay(b, dx, 0.3, tz, -HP, 2.0, 4.2, {
          pane: "window_amber",
          ring: "brown_sp",
          key: "brown_sp",
          sash: false,
          jambs: true,
          ringW: 0.34,
        });
        for (const sg of [-1, 1]) {
          b.boxMM(
            "oak_ws",
            dx - 0.12,
            0.3,
            tz + sg * 0.03,
            dx - 0.04,
            3.2,
            tz + sg * 1.0,
            { seg: false },
          );
          for (let k = 0; k < 3; k++)
            b.boxMM(
              "oak_ws",
              dx - 0.16,
              0.6 + k * 0.9,
              tz + sg * 0.18,
              dx - 0.12,
              1.3 + k * 0.9,
              tz + sg * 0.85,
              { seg: false, c: 0xc8b8a0 },
            );
        }
        b.boxMM("brown_sp", dx - 1.3, 0, tz - 1.6, dx, 0.3, tz + 1.6, {
          seg: false,
        });
        PF.colMM(dx - 1.3, 0, tz - 1.6, dx, 0.3, tz + 1.6, {
          surface: "concrete",
        });
        // oculus window above the door, and a lit round window over it (the refuge's lamp in the narthex)
        b.cyl("brown_sp", dx - 0.02, 6.8, tz, 0.75, 0.75, 0.2, 14, {
          rz: HP,
          hSeg: 1,
        });
        b.cyl("window_amber", dx - 0.1, 6.8, tz, 0.55, 0.55, 0.05, 14, {
          rz: HP,
          hSeg: 1,
          noAO: true,
          grime: 0,
        });
        // side windows up the tower (N, S, W faces)
        for (const [x, z, ry] of [
          [tx, TN - 0.02, PI],
          [tx, TS + 0.02, 0],
        ])
          PF.archBay(b, x, 8.8, z, ry, 1.2, 3.0, {
            pane: "glass_dark",
            ring: "brown_sp",
            sash: true,
            sashKey: "timber_white",
          });
        PF.archBay(b, dx, 10.4, tz, -HP, 1.2, 3.0, {
          pane: "glass_broken",
          ring: "brown_sp",
          sash: false,
        });
        // tower cornice & balustrade
        b.boxMM(
          "sp_white",
          TW - 0.4,
          TOWER,
          TN - 0.4,
          TE + 0.4,
          TOWER + 0.5,
          TS + 0.4,
          { seg: false, grime: 0.4 },
        );
        K.balustrade(
          b,
          "sp_white",
          [
            [TW - 0.25, TN - 0.25],
            [TE + 0.25, TN - 0.25],
            [TE + 0.25, TS + 0.25],
            [TW - 0.25, TS + 0.25],
            [TW - 0.25, TN - 0.25],
          ],
          TOWER + 0.5,
          0.9,
          { urns: true },
        );
        // STAGE B: square timber clock stage with corner pilasters and 4 dials
        const yB0 = TOWER + 0.5,
          yB1 = yB0 + 4.4,
          hb = 2.6;
        b.boxMM("sp_white", tx - hb, yB0, tz - hb, tx + hb, yB1, tz + hb, {
          segLen: 3,
          grime: 0.45,
        });
        for (const sx of [-1, 1])
          for (const sz of [-1, 1])
            b.box(
              "sp_white",
              tx + sx * (hb + 0.02),
              yB0,
              tz + sz * (hb + 0.02),
              0.45,
              4.4,
              0.45,
              { seg: false, grime: 0.35 },
            );
        const ck = AT.key;
        for (const [nx, nz, ry] of [
          [1, 0, HP],
          [-1, 0, -HP],
          [0, 1, 0],
          [0, -1, PI],
        ]) {
          const cx = tx + nx * (hb + 0.06),
            cz = tz + nz * (hb + 0.06);
          b.quad(ck, cx, yB0 + 2.3, cz, 2.0, 2.0, {
            ry,
            grime: 0.3,
            uvRect: AT.rect("clock"),
          });
          b.cyl(
            "gilt",
            cx - nx * 0.02,
            yB0 + 2.3,
            cz - nz * 0.02,
            1.1,
            1.1,
            0.08,
            18,
            {
              rx: nz !== 0 ? HP : 0,
              rz: nx !== 0 ? HP : 0,
              hSeg: 1,
              open: true,
            },
          );
        }
        b.boxMM(
          "sp_white",
          tx - hb - 0.35,
          yB1,
          tz - hb - 0.35,
          tx + hb + 0.35,
          yB1 + 0.45,
          tz + hb + 0.35,
          { seg: false },
        );
        // urns on the four corners
        for (const sx of [-1, 1])
          for (const sz of [-1, 1])
            b.lathe(
              "sp_white",
              [
                [0.05, 0],
                [0.28, 0.05],
                [0.34, 0.35],
                [0.18, 0.62],
                [0.24, 0.7],
                [0.02, 0.95],
              ],
              8,
              tx + sx * (hb + 0.1),
              yB1 + 0.45,
              tz + sz * (hb + 0.1),
              {},
            );
        // STAGE C: octagonal belfry — 8 columns around a dark bell chamber with the bell visible
        const yC0 = yB1 + 0.45,
          yC1 = yC0 + 4.6,
          rc = 2.3;
        b.cyl("sp_white", tx, yC0, tz, rc + 0.3, rc + 0.3, 0.35, 8, {
          hSeg: 1,
          thetaStart: PI / 8,
        });
        b.cyl("slate", tx, yC0 + 0.35, tz, rc - 0.55, rc - 0.55, 4.0, 8, {
          hSeg: 1,
          thetaStart: PI / 8,
        });
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * TAU + PI / 8;
          K.column(
            b,
            "sp_white",
            tx + Math.cos(a) * rc,
            yC0 + 0.35,
            tz + Math.sin(a) * rc,
            3.9,
            0.17,
            { collide: false, flutes: 8 },
          );
        }
        b.lathe(
          "bronze",
          [
            [0.05, 0],
            [0.65, 0],
            [0.55, 0.3],
            [0.42, 0.9],
            [0.3, 1.15],
            [0.05, 1.2],
          ],
          12,
          tx,
          yC0 + 1.6,
          tz,
          {},
        );
        b.cyl("sp_white", tx, yC1 - 0.35, tz, rc + 0.35, rc + 0.35, 0.55, 8, {
          hSeg: 1,
          thetaStart: PI / 8,
        });
        // STAGE D: lantern
        const yD0 = yC1 + 0.2,
          yD1 = yD0 + 3.0,
          rd = 1.45;
        b.cyl("sp_white", tx, yD0, tz, rd + 0.15, rd + 0.35, 0.4, 8, {
          hSeg: 1,
          thetaStart: PI / 8,
        });
        b.cyl("slate", tx, yD0 + 0.4, tz, rd - 0.35, rd - 0.35, 2.3, 8, {
          hSeg: 1,
          thetaStart: PI / 8,
        });
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * TAU + PI / 8;
          b.cyl(
            "sp_white",
            tx + Math.cos(a) * rd,
            yD0 + 0.4,
            tz + Math.sin(a) * rd,
            0.1,
            0.12,
            2.3,
            6,
            { hSeg: 1 },
          );
        }
        b.cyl("sp_white", tx, yD1 - 0.3, tz, rd + 0.25, rd + 0.25, 0.4, 8, {
          hSeg: 1,
          thetaStart: PI / 8,
        });
        // SPIRE + ball + weathervane
        const yS0 = yD1 + 0.1,
          yS1 =
            site && site.height ? Math.min(site.height - 2, yS0 + 9) : yS0 + 9;
        b.cyl("sp_white", tx, yS0, tz, 0.05, rd, yS1 - yS0, 8, {
          hSeg: 3,
          thetaStart: PI / 8,
          grime: 0.5,
        });
        b.sphere("gilt", tx, yS1 + 0.15, tz, 0.22, { ws: 8, hs: 6 });
        b.cyl("iron", tx + 0.17, yS1 + 0.3, tz, 0.025, 0.025, 1.4, 4, {
          hSeg: 1,
          rz: -0.25,
        }); // the vane rod, bent by a blast
        b.box("gilt", tx + 0.55, yS1 + 1.12, tz, 0.9, 0.25, 0.03, {
          ry: 0.6,
          rz: -0.3,
          seg: false,
        });
        anchors.steeple_top = PF.anchor(tx, yS1 + 1.6, tz, 0);
      }

      // =================================================================
      // CHURCHYARD: headstones, table tombs, obelisks, an old dead sycamore
      // =================================================================
      let hv = 0;
      const clearOf = (x, z) => {
        if (Math.abs(z - ZC) < 2.6 && (x > PE - 0.5 || x < TW)) return false; // gate paths
        if (x > -81.5 && x < -76.5 && z > NS) return false;
        if (z > NN - 1.8 && z < NS + 1.8 && x > NW - 1.8 && x < PE + 1.5)
          return false;
        if (Math.abs(x - (TW - 0.6)) < 1.4 && z > NN - 1.8 && z < NS + 1.8)
          return false;
        return true;
      };
      // east yard: dense rows facing west (the dead face east), the classic Broadway view
      for (let x = PE + 2.4; x < FE - 1.0; x += 1.55) {
        for (let z = FN + 1.4; z < FS - 1.2; z += 1.35) {
          const jx = x + (r() - 0.5) * 0.5,
            jz = z + (r() - 0.5) * 0.35;
          if (!clearOf(jx, jz) || r() < 0.18) continue;
          PF.headstone(b, jx, jz, -HP + (r() - 0.5) * 0.2, hv++, { y: 0.12 });
        }
      }
      // north & south strips: looser rows (the refuge camps between them in the north)
      for (let x = NW + 1; x < PE; x += 2.2) {
        for (const z of [FS - 2.0, FS - 4.4]) {
          const jx = x + (r() - 0.5) * 0.6;
          if (
            !clearOf(jx, z) ||
            r() < 0.25 ||
            (jx > -89 && jx < -70 && z > FS - 5)
          )
            continue; // garden beds keep a gap
          PF.headstone(
            b,
            jx,
            z + (r() - 0.5) * 0.3,
            -HP + (r() - 0.5) * 0.25,
            hv++,
            { y: 0.12 },
          );
        }
      }
      for (let x = TW; x < -86; x += 2.3) {
        const jx = x + (r() - 0.5) * 0.6;
        if (!clearOf(jx, FN + 2)) continue;
        PF.headstone(
          b,
          jx,
          FN + 2 + (r() - 0.5) * 0.4,
          -HP + (r() - 0.5) * 0.25,
          hv++,
          { y: 0.12 },
        );
      }
      // table tombs
      for (const [x, z, ry] of [
        [-60.5, 636.2, 0.05],
        [-56.2, 659.4, -0.1],
        [-102.5, 659.8, 0.2],
        [-58.4, 641.2, 0],
      ]) {
        b.box("brown_sp", x, 0.12, z, 2.0, 0.75, 1.0, {
          ry,
          seg: false,
          grime: 0.7,
        });
        b.box("slate", x, 0.87, z, 2.3, 0.12, 1.25, {
          ry,
          rz: (r() - 0.5) * 0.08,
          seg: false,
          grime: 0.5,
        });
        for (const sx of [-0.85, 0.85])
          for (const sz of [-0.38, 0.38])
            b.cyl(
              "brown_sp",
              x + sx * Math.cos(ry) + sz * Math.sin(ry),
              0.12,
              z - sx * Math.sin(ry) + sz * Math.cos(ry),
              0.09,
              0.1,
              0.75,
              6,
              { hSeg: 1 },
            );
        PF.col(x, z, 2.3, 1.25, 0, 1.0, ry, { walkable: true });
      }
      // obelisks
      for (const [x, z, h] of [
        [-53.4, 652.6, 3.4],
        [-63.2, 660.1, 2.6],
        [-107.2, 636.1, 2.9],
      ]) {
        b.box("marble_ws", x, 0.12, z, 1.1, 0.6, 1.1, {
          seg: false,
          grime: 0.7,
        });
        b.cyl("marble_ws", x, 0.72, z, 0.12, 0.42, h, 4, {
          hSeg: 2,
          thetaStart: PI / 4,
          grime: 0.6,
        });
        PF.col(x, z, 1.1, 1.1, 0, 0.8 + h, 0, { walkable: false });
      }
      // the old sycamore (dead, huge) in the east yard and a younger dead tree by the west path
      PF.deadTree(b, -58.8, 0.12, 646.2 - 5.0, 11, 7);
      PF.col(-58.8, 641.2, 0.9, 0.9, 0, 4, 0, { walkable: false });
      PF.deadTree(b, -107.3, 0.12, 656.4, 6, 3);

      // =================================================================
      // THE REFUGE: sandbag gate posts, lean-tos under the portico, cook fire,
      // garden beds, laundry, lanterns, the welcome sign
      // =================================================================
      // south gate (Fulton St): sandbag chicane + watch post
      PF.sandbags(b, -84.2, FS - 1.2, -81.6, FS - 1.2, 3, { y: 0.12 });
      PF.sandbags(b, -76.4, FS - 1.2, -73.8, FS - 1.2, 3, { y: 0.12 });
      atq("welcome", -79, 3.1, FS + 0.05, 3.4, 1.33, { ry: 0, grime: 0.3 });
      b.box("rotten", -79, 2.35, FS, 3.6, 0.08, 0.08, { seg: false });
      for (const sx of [-1.7, 1.7])
        b.box("rotten", -79 + sx, 0, FS + 0.02, 0.1, 3.85, 0.1, { seg: false });
      // west gate sign: the parish board

      b.box("iron", FW + 1.4, 0.12, ZC - 3.6, 0.08, 1.6, 0.08, { seg: false });
      b.box("iron", FW + 1.4, 0.12, ZC - 5.4, 0.08, 1.6, 0.08, { seg: false });
      atq("board", FW + 1.35, 2.2, ZC - 4.5, 2.1, 0.82, {
        ry: -HP,
        grime: 0.3,
      });
      // the Broadway side has the portico but no door: a painted board sends visitors round to the west door,
      // with a flagstone connector to the lantern-lit north path
      for (const dz of [-1.0, 1.0])
        b.box("rotten", PE + 2.0, 0.12, ZC + 3.3 + dz, 0.1, 2.1, 0.1, {
          seg: false,
        });
      atq("way", PE + 2.06, 1.7, ZC + 3.3, 2.3, 0.9, { ry: HP, grime: 0.3 });
      flag(PE - 0.2, NN - 1.4, PE + 1.3, PN - 0.3);
      flag(PE + 0.8, PN - 0.3, PE + 2.0, ZC - 2);

      b.box("oak_ws", FW + 1.42, 1.75, ZC - 4.5, 0.06, 0.95, 2.2, {
        seg: false,
      });
      // lean-tos under the portico (tarp + planks), bedrolls, a cook fire in a barrel, crates
      for (const [z, tint] of [
        [PN + 1.8, 0x8a7a5a],
        [PS - 1.9, 0x5a6a4a],
      ]) {
        b.box("canvas_ws", PE - 3.2, 1.9, z, 3.2, 0.05, 2.6, {
          rz: 0.5,
          seg: false,
          c: tint,
        });
        for (const zz of [-1.2, 1.2])
          b.box("rotten", PE - 1.9, 0.45, z + zz, 0.08, 2.0, 0.08, {
            seg: false,
          });
        D.mattress(b, PE - 3.6, 0.47, z, 0, 0xb8a888);
      }
      PF.barrel(b, PE - 3.8, 0.45, (PN + PS) / 2 + 3.0, { fire: true });
      D.crates(b, PE - 5.2, 0.45, (PN + PS) / 2 - 3.3, 2, 11);
      // cook fire + soup kettle in the north strip, benches around it
      {
        const cx = -86,
          cz = FN + 3.4;
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * TAU;
          b.rock(
            "rubble",
            cx + Math.cos(a) * 0.75,
            0.2,
            cz + Math.sin(a) * 0.75,
            0.22,
            { flat: 0.6, detail: 0 },
          );
        }
        b.cyl("fire", cx, 0.15, cz, 0.35, 0.45, 0.25, 8, {
          hSeg: 1,
          noAO: true,
          grime: 0,
        });
        PF.fires.push(V3(cx, 0.4, cz));
        for (const sx of [-0.9, 0.9])
          b.box("iron", cx + sx, 0.12, cz, 0.05, 1.4, 0.05, { seg: false });
        b.beam(
          "iron",
          V3(cx - 0.9, 1.5, cz),
          V3(cx + 0.9, 1.5, cz),
          0.04,
          0.04,
        );
        b.lathe(
          "iron",
          [
            [0.02, 0],
            [0.34, 0.02],
            [0.4, 0.3],
            [0.36, 0.5],
            [0.001, 0.5],
          ],
          10,
          cx,
          0.75,
          cz,
          {},
        );
        PF.bench(b, cx - 2.6, 0.12, cz, HP);
        PF.bench(b, cx + 2.6, 0.12, cz, -HP);
        anchors.cook = PF.anchor(
          cx + 1.3,
          0.12,
          cz + 0.9,
          PF.yawTo(cx + 1.3, cz + 0.9, cx, cz),
        );
      }
      // raised garden beds in the south strip (potatoes & corn)
      for (let i = 0; i < 4; i++) {
        const x = -88 + i * 4.3,
          z = FS - 3.4;
        b.boxMM("planks", x - 1.6, 0.12, z - 0.9, x + 1.6, 0.5, z + 0.9, {
          seg: false,
          grime: 0.7,
        });
        b.boxMM("dirt", x - 1.5, 0.3, z - 0.8, x + 1.5, 0.55, z + 0.8, {
          seg: false,
        });
        for (let k = 0; k < 7; k++) {
          const px = x - 1.3 + k * 0.43;
          b.cyl(
            "grass",
            px,
            0.55,
            z + (k % 2 ? 0.35 : -0.35),
            0.01,
            0.16,
            0.5 + r() * 0.8,
            4,
            { hSeg: 1, grime: 0 },
          );
        }
        PF.col(x, z, 3.2, 1.8, 0, 0.55, 0, { walkable: true, surface: "dirt" });
      }
      // laundry line from the tower to the railing, lanterns on posts along the paths
      {
        const a = V3(TW - 0.2, 3.2, TN - 0.2),
          c = V3(FW + 0.5, 2.1, FN + 0.5);
        b.beam("rope", a, c, 0.012, 0.012, { noAO: true });
        for (let k = 1; k < 6; k++) {
          const t = k / 6,
            p = a.clone().lerp(c, t);
          p.y -= Math.sin(t * PI) * 0.3;
          b.box(
            k % 2 ? "linen_ws" : "canvas_ws",
            p.x,
            p.y - 0.7,
            p.z,
            0.5,
            0.7,
            0.02,
            {
              ry: Math.atan2(-(c.z - a.z), c.x - a.x),
              seg: false,
              c: [0xffffff, 0xc8b8d0, 0xb8c8d8, 0xe0c8a0, 0xffffff][k - 1],
            },
          );
        }
      }
      for (const [x, z] of [
        [-96, NS + 2.3],
        [-78, NS + 2.3],
        [-96, NN - 2.3],
        [-87, NN - 2.3],
        [-78, NN - 2.3],
        [-69, NN - 2.3],
        [PE + 1.6, PN - 1.2],
        [PE + 3.5, ZC + 2.8],
      ]) {
        b.box("iron", x, 0.12, z, 0.08, 2.4, 0.08, { seg: false });
        b.box("iron", x, 2.5, z, 0.24, 0.34, 0.24, { seg: false });
        b.box("lamp_ws", x, 2.55, z, 0.18, 0.24, 0.18, {
          seg: false,
          noAO: true,
          grime: 0,
        });
        PF.glow(V3(x, 2.7, z), 0xffc070, 1.3, null, {
          intensity: 0.9,
          flicker: 0.15,
          dayFactor: 0.2,
        });
      }

      // =================================================================
      // anchors + door
      // =================================================================
      anchors.entrance = PF.anchor(TW - 3.0, 0.16, ZC, -HP);
      anchors.exterior_entrance = anchors.entrance;
      anchors.guard = PF.anchor(-79, 0.12, FS - 2.6, PI);
      anchors.guard_w = PF.anchor(FW + 2.2, 0.16, ZC + 2.8, HP);
      anchors.portico = PF.anchor(PE - 2.6, 0.45, (PN + PS) / 2 + 1.2, -HP);
      anchors.garden = PF.anchor(-82, 0.12, FS - 5.0, PI);
      anchors.graves = PF.anchor(-60, 0.12, ZC + 6, HP);
      SP.anchors = anchors;

      PF.hsAtlas = null;
      PF.flushFires();
      b.build(root);
      PF.flushGlows(root);
    },
    10,
  );
})();
