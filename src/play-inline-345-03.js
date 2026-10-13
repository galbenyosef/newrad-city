// play-inline-345 03 — tint
// Lines 294-2758 of readable/play-inline-345.pretty.js (statement-aligned).
  function interior(ctx) {
    const O = ctx.O;
    const b = K.builder({
      name: "pd_int",
      off: O,
      lit: true,
      amb: [0.15, 0.15, 0.16],
      floors: [0, GAL, BY],
      grime: 0.45,
    });
    const r = K.rng("pd_int");
    const fl = (mat, x0, z0, x1, z1, y, tint, surface) => {
      b.face(mat, x0, y, z1, 1, 0, 0, 0, 0, -1, x1 - x0, z1 - z0, {
        uv: "top",
        tint,
      });
      b.col(x0, y - 0.3, z0, x1, y, z1, {
        tag: "floor",
        surface: surface || "concrete",
      });
    };

    // ================= VESTIBULE =================
    const VB = [-5.1, -0.3, -6.5, 5.1, 5.2, 0.1];
    K.gap(ctx, 0, C.z + A, 3.2, 0, 3.8);
    K.room(b, ctx, {
      x0: -5,
      z0: C.z + A,
      x1: 5,
      z1: 0,
      y: 0,
      h: 5,
      floor: "marble",
      fc: [0.7, 0.66, 0.6],
      wall: "plaster",
      wc: CREAM,
      wain: "marble",
      wainC: [0.55, 0.5, 0.45],
      wainH: 1.3,
      ceil: "coffer",
      cc: [0.7, 0.66, 0.58],
      cornice: true,
      trimMat: "bronze",
    });
    // inner bronze doors (the way out) and benches
    // (round 2: a readable glazed bronze pair with daylight through the transom + a lit EXIT sign)
    K.doorway(b, 0, 0, -0.1, 0, -1, {
      w: 3.2,
      h: 3.0,
      transom: 0.6,
      mat: "bronze",
      frame: "marble",
      frameTint: [0.62, 0.58, 0.52],
      glow: [0.85, 0.9, 1.0],
      glowI: 0.6,
      exit: "EXIT",
      exitY: 4.45,
      lightBox: VB,
    });
    for (const s of [-1, 1]) {
      b.boxMM(
        "oak_panel",
        s * 4.95 - 0.45,
        0,
        -5,
        s * 4.95 + 0.45,
        0.45,
        -1.2,
        { tint: [0.6, 0.45, 0.3] },
      );
      b.boxMM(
        "oak_panel",
        s * 4.95 - 0.1,
        0.45,
        -5,
        s * 4.95 + 0.1,
        1.1,
        -1.2,
        { tint: [0.6, 0.45, 0.3] },
      );
      b.col(s * 4.95 - 0.45, 0, -5, s * 4.95 + 0.45, 0.5, -1.2, {
        tag: "furniture",
      });
    }
    // Ardent Robotics contraband scanner arch across the vestibule
    for (const s of [-1, 1]) {
      b.boxMM("metal", s * 1.55 - 0.3, 0, -3.6, s * 1.55 + 0.3, 2.9, -3.0, {
        tint: [0.6, 0.62, 0.6],
      });
      b.col(s * 1.55 - 0.3, 0, -3.6, s * 1.55 + 0.3, 2.9, -3.0, {});
      for (let k = 0; k < 5; k++)
        b.box("lamp", s * 1.25, 0.5 + k * 0.45, -3.3, 0.02, 0.1, 0.35, {
          tint: k === 2 ? [1, 0.15, 0.1] : [0.3, 0.08, 0.06],
        });
    }
    b.boxMM("metal", -1.85, 2.9, -3.65, 1.85, 3.4, -2.95, {
      tint: [0.6, 0.62, 0.6],
    });
    b.plate(
      "art",
      0,
      3.15,
      -2.93,
      0,
      1,
      3.2,
      0.36,
      K.signCell(
        "pc_pd_scan",
        "ARDENT CONTRABAND SCANNER · PLEASE WALK SLOWLY",
        512,
        56,
        { bg: "#1c2a24", fg: "#e8d888", font: "Arial, sans-serif" },
      ),
    );
    b.light(0, 2.6, -3.3, [1, 0.2, 0.12], 0.9, 4, { box: VB });
    b.glow(0, 3.0, -3.0, [1, 0.12, 0.08], 1.2);
    b.plate(
      "art",
      0,
      4.2,
      C.z + A + 0.13,
      0,
      1,
      3.4,
      0.5,
      K.signCell(
        "pc_pd_report",
        "ALL VISITORS REPORT TO THE MUSTER DESK",
        512,
        64,
        { bg: "#22324a", fg: "#d8c080", font: "Georgia, serif" },
      ),
    );
    K.lamp(b, 0, 3.9, -4.7, "globe", WARM, 0.6, 6, {
      ceil: 5,
      size: 0.22,
      lightOpts: { box: VB },
    }); // (behind the scanner: keeps the EXIT sign clear)
    b.light(-3, 1.5, -1, COOL, 0.3, 5, { box: VB });
    K.litter(b, -4.5, -5.8, 4.5, -0.5, 0, 10, 11);

    // ================= ROTUNDA =================
    const RB = [-A - 0.2, -0.3, C.z - A - 0.2, A + 0.2, 16, C.z + A + 0.2];
    for (let m = 0; m < 8; m++) {
      const phi = (m * PI) / 4,
        [pa, pc] = sidePts(phi);
      const o = {
        mat: "plaster",
        tint: CREAM,
        wain: "marble",
        wainC: [0.5, 0.46, 0.42],
        wainH: 1.4,
        trimMat: "bronze",
      };
      if (m === 2)
        K.segWall(
          b,
          pa[0],
          pa[1],
          pc[0],
          pc[1],
          0,
          RH,
          -1,
          Object.assign(o, { gaps: [{ t: HS, w: 3.2, y1: 3.8 }] }),
        );
      else if (m === 0 || m === 4)
        K.segWall(
          b,
          pa[0],
          pa[1],
          pc[0],
          pc[1],
          0,
          RH,
          -1,
          Object.assign(o, { gaps: [{ t: HS, w: 2.4, y1: 3.2 }] }),
        );
      else if (m === 6) {
        K.segWall(
          b,
          pa[0],
          pa[1],
          pc[0],
          pc[1],
          0,
          GAL,
          -1,
          Object.assign({}, o, { gaps: [{ t: HS, w: 2.4, y1: 3.2 }] }),
        );
        K.segWall(b, pa[0], pa[1], pc[0], pc[1], GAL, RH, -1, {
          mat: "plaster",
          tint: CREAM,
          trimMat: "bronze",
          gaps: [{ t: HS, w: 1.6, y0: GAL, y1: GAL + 2.5 }],
        });
      } else K.segWall(b, pa[0], pa[1], pc[0], pc[1], 0, RH, -1, o);
      // pilaster at vertex pa
      const vx = pa[0],
        vz = pa[1],
        dx = C.x - vx,
        dz = C.z - vz,
        dl = Math.hypot(dx, dz);
      const px = vx + (dx / dl) * 0.25,
        pz = vz + (dz / dl) * 0.25;
      b.box("marble", px, 0, pz, 0.7, 1.4, 0.7, {
        yaw: -phi + PI / 8,
        tint: [0.45, 0.42, 0.38],
      });
      b.box("plaster", px, 1.4, pz, 0.55, RH - 2.2, 0.55, {
        yaw: -phi + PI / 8,
        tint: [0.9, 0.86, 0.76],
      });
      b.box("gold", px, RH - 0.8, pz, 0.75, 0.5, 0.75, {
        yaw: -phi + PI / 8,
        tint: [0.6, 0.48, 0.28],
      });
    }
    // floor, seal, cornices
    K.ngonFloor(b, C.x, 0, C.z, R, 8, PI / 8, "marble", [0.72, 0.68, 0.62]);
    b.col(C.x - A, -0.3, C.z - A, C.x + A, 0, C.z + A, {
      tag: "floor",
      surface: "concrete",
    });
    K.ngonFloor(
      b,
      C.x,
      0.008,
      C.z,
      6.2,
      8,
      PI / 8,
      "terrazzo",
      [0.45, 0.42, 0.4],
    );
    b.hplate("art", C.x, 0.016, C.z, 3.6, 3.6, 0, seal(), {
      tint: [0.9, 0.88, 0.8],
    });
    K.domeIn(b, C.x, RH, C.z, R - 0.3, 5.4, {
      mat: "coffer",
      seg: 16,
      rows: 6,
      oculus: 1.5,
      ribs: 8,
      ribMat: "plaster",
      tint: [0.78, 0.72, 0.6],
      ringMat: "gold",
    });
    for (let m = 0; m < 8; m++) {
      const phi = (m * PI) / 4 + PI / 8;
      const p0 = [
          C.x + Math.cos(phi) * (R - 0.25),
          C.z + Math.sin(phi) * (R - 0.25),
        ],
        p1 = [
          C.x + Math.cos(phi + PI / 4) * (R - 0.25),
          C.z + Math.sin(phi + PI / 4) * (R - 0.25),
        ];
      b.beam(
        "plaster",
        p0[0],
        RH - 0.2,
        p0[1],
        p1[0],
        RH - 0.2,
        p1[1],
        0.5,
        0.4,
        { tint: [0.8, 0.74, 0.62] },
      );
      b.beam(
        "gold",
        p0[0],
        RH - 0.45,
        p0[1],
        p1[0],
        RH - 0.45,
        p1[1],
        0.3,
        0.1,
        { tint: [0.55, 0.44, 0.26] },
      );
    }
    // oculus daylight: a cold shaft onto the seal
    b.light(C.x, 14.5, C.z, COOL, 1.5, 20, { box: RB, wrap: 0.6 });
    b.glow(C.x, RH + 5.3, C.z, [0.8, 0.85, 0.9], 5);
    K.ngonFloor(
      b,
      C.x,
      RH + 5.45,
      C.z,
      1.7,
      16,
      0,
      "lamp",
      [0.75, 0.8, 0.85],
      false,
    );
    // gallery ring (y 5) — every side but the NW, which carries the stair
    const Ri = (A - 2.0) / Math.cos(PI / 8);
    for (let m = 0; m < 8; m++) {
      if (m === 5) continue;
      const phi = (m * PI) / 4,
        a = phi - PI / 8,
        c = phi + PI / 8;
      const oa = [C.x + R * Math.cos(a), C.z + R * Math.sin(a)],
        oc = [C.x + R * Math.cos(c), C.z + R * Math.sin(c)];
      const ia = [C.x + Ri * Math.cos(a), C.z + Ri * Math.sin(a)],
        ic = [C.x + Ri * Math.cos(c), C.z + Ri * Math.sin(c)];
      b.quadN(
        "marble",
        [oa[0], GAL, oa[1]],
        [oc[0], GAL, oc[1]],
        [ic[0], GAL, ic[1]],
        [ia[0], GAL, ia[1]],
        [0, 1, 0],
        { tint: [0.62, 0.58, 0.52] },
      );
      b.quadN(
        "coffer",
        [oa[0], GAL - 0.4, oa[1]],
        [oc[0], GAL - 0.4, oc[1]],
        [ic[0], GAL - 0.4, ic[1]],
        [ia[0], GAL - 0.4, ia[1]],
        [0, -1, 0],
        { tint: [0.6, 0.56, 0.48] },
      );
      b.quadN(
        "plaster",
        [ia[0], GAL - 0.4, ia[1]],
        [ic[0], GAL - 0.4, ic[1]],
        [ic[0], GAL, ic[1]],
        [ia[0], GAL, ia[1]],
        [-Math.cos(phi), 0, -Math.sin(phi)],
        { tint: [0.8, 0.74, 0.62] },
      );
      b.beam(
        "gold",
        ia[0],
        GAL - 0.1,
        ia[1],
        ic[0],
        GAL - 0.1,
        ic[1],
        0.06,
        0.08,
        { tint: [0.55, 0.44, 0.26] },
      );
      const mid = A - 1.0,
        len = 2 * (A - 0.7) * Math.tan(PI / 8);
      b.ocol(
        C.x + Math.cos(phi) * mid,
        C.z + Math.sin(phi) * mid,
        len,
        2.05,
        GAL - 0.4,
        GAL,
        tanYaw(phi),
        { tag: "floor", surface: "concrete" },
      );
      K.railing(b, ia[0], ia[1], ic[0], ic[1], GAL, {
        h: 1.0,
        mat: "bronze",
        handMat: "brass",
        step: 0.35,
      });
      if (m === 4)
        K.railing(b, oc[0], oc[1], ic[0], ic[1], GAL, {
          h: 1.0,
          mat: "bronze",
          handMat: "brass",
          step: 0.35,
        }); // W end over the stair
      // gallery sconces
      const sx = C.x + Math.cos(phi) * (A - 0.15),
        sz = C.z + Math.sin(phi) * (A - 0.15);
      if (m !== 6 && m !== 2) {
        b.box("brass", sx, GAL + 1.8, sz, 0.14, 0.3, 0.14, {
          tint: [0.6, 0.45, 0.25],
        });
        b.geo("lamp", K.sphereGeo(), {
          x: sx - Math.cos(phi) * 0.18,
          y: GAL + 2.15,
          z: sz - Math.sin(phi) * 0.18,
          s: 0.1,
          tint: m % 3 ? WARM : [0.3, 0.25, 0.2],
        });
        if (m % 3) {
          b.light(
            sx - Math.cos(phi) * 0.6,
            GAL + 2.1,
            sz - Math.sin(phi) * 0.6,
            WARM,
            0.55,
            6,
            { box: RB },
          );
          b.glow(
            sx - Math.cos(phi) * 0.18,
            GAL + 2.15,
            sz - Math.sin(phi) * 0.18,
            [1, 0.7, 0.4],
            0.8,
          );
        }
      }
    }
    // gallery-level dressing: a gilt inscription frieze round the drum, the Commissioners' portraits
    // (Roosevelt's Board of 1895 onward), the department seal over the entrance arch
    {
      const FR = [
        "THE POLICE DEPARTMENT",
        "OF THE CITY OF NEW YORK",
        "ERECTED MCMIX",
        "FIDELIS AD MORTEM",
        "TO PROTECT",
        "AND TO SERVE",
        "COURTESY · PROFESSIONALISM",
        "· RESPECT ·",
      ];
      const COMM = [
        ["T. ROOSEVELT", "1895–1897"],
        ["W. McADOO", "1904–1905"],
        ["A. WOODS", "1914–1917"],
        ["L. VALENTINE", "1934–1945"],
        ["J. HARGROVE", "1955–1962"],
        ["C. DUNMORE", "1962–1967"],
        ["PATROLMAN P-1", "ACTING, 1967–"],
      ];
      const portrait = (i) =>
        K.paint("pics", "pc_pd_comm" + i, 128, 160, function (x, X, Y, W, H) {
          const rr = K.rng("comm" + i);
          const g = x.createRadialGradient(
            X + W * 0.5,
            Y + H * 0.35,
            4,
            X + W * 0.5,
            Y + H * 0.45,
            W * 0.8,
          );
          g.addColorStop(0, "#5a4a36");
          g.addColorStop(1, "#1e160e");
          x.fillStyle = g;
          x.fillRect(X, Y, W, H);
          const cx = X + W * 0.5;
          if (i === 6) {
            // the robot "commissioner": a patrolman dome in a braided cap
            x.fillStyle = "#6a7064";
            x.beginPath();
            x.ellipse(cx, Y + H * 0.42, W * 0.2, H * 0.16, 0, 0, 6.3);
            x.fill();
            x.fillStyle = "#9adfff";
            x.beginPath();
            x.arc(cx, Y + H * 0.42, W * 0.08, 0, 6.3);
            x.fill();
            x.fillStyle = "#4a5048";
            x.fillRect(cx - W * 0.3, Y + H * 0.6, W * 0.6, H * 0.4);
          } else {
            x.fillStyle = [
              "#c8a888",
              "#b89272",
              "#d0b090",
              "#8a6448",
              "#c09a7a",
              "#a88062",
            ][i % 6];
            x.beginPath();
            x.ellipse(cx, Y + H * 0.4, W * 0.15, H * 0.14, 0, 0, 6.3);
            x.fill();
            x.fillStyle = "rgba(40,25,15,0.5)";
            x.fillRect(cx - W * 0.1, Y + H * 0.36, W * 0.2, 2);
            if (i === 0) {
              x.fillStyle = "#2a2018";
              x.fillRect(cx - W * 0.09, Y + H * 0.45, W * 0.18, 4);
              x.strokeStyle = "#d8d0b0";
              x.lineWidth = 2;
              x.strokeRect(cx - W * 0.1, Y + H * 0.35, W * 0.08, H * 0.04);
              x.strokeRect(cx + W * 0.02, Y + H * 0.35, W * 0.08, H * 0.04);
            } // pince-nez & moustache
            if (rr() < 0.6) {
              x.fillStyle = "#14161e";
              x.fillRect(cx - W * 0.17, Y + H * 0.24, W * 0.34, H * 0.07);
              x.fillRect(cx - W * 0.2, Y + H * 0.3, W * 0.4, H * 0.025);
              x.fillStyle = "#c8a860";
              x.fillRect(cx - W * 0.03, Y + H * 0.26, W * 0.06, H * 0.04);
            } else {
              x.fillStyle = ["#2a2018", "#6a6660", "#1a1410"][i % 3];
              x.beginPath();
              x.ellipse(cx, Y + H * 0.29, W * 0.16, H * 0.07, 0, PI, 0);
              x.fill();
            }
            x.fillStyle = "#1e2638";
            x.beginPath();
            x.ellipse(cx, Y + H * 0.92, W * 0.42, H * 0.36, 0, PI, 0);
            x.fill();
            x.fillStyle = "#e8e0cc";
            x.beginPath();
            x.moveTo(cx - W * 0.06, Y + H * 0.56);
            x.lineTo(cx + W * 0.06, Y + H * 0.56);
            x.lineTo(cx, Y + H * 0.66);
            x.fill();
            x.fillStyle = "#c8a860";
            for (let k = 0; k < 3; k++)
              x.fillRect(cx - 2, Y + H * (0.7 + k * 0.08), 4, 4);
            x.fillRect(cx - W * 0.3, Y + H * 0.64, W * 0.08, 3);
            x.fillRect(cx + W * 0.22, Y + H * 0.64, W * 0.08, 3);
          }
          K.stains(x, X, Y, W, H, 6, 300 + i, 0.4, [20, 12, 5]);
          x.fillStyle = "rgba(200,170,110,0.12)";
          x.fillRect(X, Y, W, H);
        });
      let pi = 0;
      for (let m = 0; m < 8; m++) {
        const phi = (m * PI) / 4,
          [pa, pc] = sidePts(phi);
        const L = Math.hypot(pc[0] - pa[0], pc[1] - pa[1]),
          tx = (pc[0] - pa[0]) / L,
          tz = (pc[1] - pa[1]) / L;
        const nx = -Math.cos(phi),
          nz = -Math.sin(phi),
          mx = C.x + Math.cos(phi) * (A - 0.1),
          mz = C.z + Math.sin(phi) * (A - 0.1); // wall face (walls are 0.2 thick, centred on the octagon)
        // frieze
        b.plate(
          "art",
          mx + nx * 0.02,
          RH - 1.25,
          mz + nz * 0.02,
          nx,
          nz,
          L - 1.0,
          0.5,
          K.signCell("pc_pd_frz" + m, FR[m], 768, 64, {
            bg: "#1c2a40",
            fg: "#d8b868",
            font: "Georgia, serif",
            border: "#a88a48",
          }),
          { tint: [0.9, 0.86, 0.78] },
        );
        b.beam(
          "gold",
          pa[0] + nx * 0.15,
          RH - 1.53,
          pa[1] + nz * 0.15,
          pc[0] + nx * 0.15,
          RH - 1.53,
          pc[1] + nz * 0.15,
          0.08,
          0.06,
          { tint: [0.55, 0.44, 0.26] },
        );
        if (m === 2) {
          b.plate("art", mx, GAL + 2.4, mz, nx, nz, 2.4, 2.4, seal(), {
            tint: [0.9, 0.88, 0.8],
            off: 0.03,
          });
          continue;
        }
        if (m === 6) continue;
        for (const off of [-2.1, 2.1]) {
          const px = mx + tx * off,
            pz = mz + tz * off;
          if (pi >= COMM.length) {
            // taken down (looted for the frames): a pale unfaded rectangle and the nail
            b.plate("plaster", px, GAL + 2.3, pz, nx, nz, 1.18, 1.43, null, {
              tint: [0.97, 0.94, 0.84],
              off: 0.006,
            });
            b.box(
              "black_iron",
              px + nx * 0.02,
              GAL + 3.05,
              pz + nz * 0.02,
              0.03,
              0.03,
              0.03,
            );
            pi++;
            continue;
          }
          K.framed(b, px, GAL + 2.3, pz, nx, nz, 1.0, 1.25, portrait(pi), {
            frame: "gold",
            fw: 0.09,
            frameTint: [0.6, 0.48, 0.28],
          });
          b.plate(
            "art",
            px + nx * 0.03,
            GAL + 1.45,
            pz + nz * 0.03,
            nx,
            nz,
            0.7,
            0.16,
            K.signCell(
              "pc_pd_commn" + pi,
              COMM[pi][0] + "\n" + COMM[pi][1],
              256,
              58,
              {
                bg: "#6a5228",
                fg: "#1a140c",
                font: "Georgia, serif",
                weather: false,
              },
            ),
            { tint: [0.9, 0.85, 0.7] },
          );
          pi++;
        }
      }
    }
    // stair along the NW side (bottom at the W vertex, top at the N vertex)
    {
      const phi = (5 * PI) / 4,
        a = phi - PI / 8,
        c = phi + PI / 8;
      const pa = [C.x + R * Math.cos(a), C.z + R * Math.sin(a)],
        pc = [C.x + R * Math.cos(c), C.z + R * Math.sin(c)];
      const L = Math.hypot(pc[0] - pa[0], pc[1] - pa[1]),
        ux = (pc[0] - pa[0]) / L,
        uz = (pc[1] - pa[1]) / L;
      const inx = -Math.cos(phi),
        inz = -Math.sin(phi),
        W = 1.8,
        n = 21,
        run = (L - 0.3) / n,
        yaw = tanYaw(phi);
      for (let i = 0; i < n; i++) {
        const t = 0.15 + (i + 0.5) * run,
          top = (GAL * (i + 1)) / n;
        const cx = pa[0] + ux * t + inx * (W / 2 + 0.15),
          cz = pa[1] + uz * t + inz * (W / 2 + 0.15);
        b.box(
          "marble",
          cx,
          Math.max(0, top - 0.35),
          cz,
          run + 0.01,
          Math.min(top, 0.35),
          W,
          { yaw, tint: [0.68, 0.64, 0.58], faces: "nsewtb" },
        );
        b.ocol(cx, cz, run + 0.02, W, 0, top, yaw, {
          tag: "stairs",
          surface: "concrete",
        });
      }
      // stringer + handrail + balusters on the open side
      const e0 = [
          pa[0] + ux * 0.15 + inx * (W + 0.15),
          pa[1] + uz * 0.15 + inz * (W + 0.15),
        ],
        e1 = [
          pa[0] + ux * (L - 0.15) + inx * (W + 0.15),
          pa[1] + uz * (L - 0.15) + inz * (W + 0.15),
        ];
      b.beam("marble", e0[0], 0.1, e0[1], e1[0], GAL - 0.2, e1[1], 0.14, 0.45, {
        tint: [0.6, 0.56, 0.5],
      });
      b.beam("brass", e0[0], 1.0, e0[1], e1[0], GAL + 1.0, e1[1], 0.07, 0.06, {
        tint: [0.6, 0.45, 0.25],
      });
      for (let k = 0; k <= 14; k++) {
        const t = k / 14,
          x = e0[0] + (e1[0] - e0[0]) * t,
          z = e0[1] + (e1[1] - e0[1]) * t,
          y = GAL * t;
        b.beam("bronze", x, y, z, x, y + 1.0, z, 0.03, 0.03);
      }
      b.ocol(
        (e0[0] + e1[0]) / 2,
        (e0[1] + e1[1]) / 2,
        L,
        0.12,
        0.3,
        GAL + 1.0,
        yaw,
        { tag: "rail", walkable: false },
      );
    }
    // MUSTER DESK: raised octagonal counter around the desk sergeant
    {
      const M = { x: C.x, z: C.z - 4.3 };
      K.ngonFloor(
        b,
        M.x,
        0.35,
        M.z,
        2.7,
        8,
        PI / 8,
        "oak_panel",
        [0.5, 0.36, 0.24],
      );
      b.col(M.x - 2.4, 0, M.z - 2.4, M.x + 2.4, 0.35, M.z + 2.4, {
        tag: "floor",
        surface: "wood",
      });
      for (let m = 0; m < 8; m++) {
        if (m === 6) continue; // opening at the back (north) for the sergeant
        const phi = (m * PI) / 4,
          rr = 2.55 * Math.cos(PI / 8),
          len = 2 * 2.55 * Math.sin(PI / 8);
        const cx = M.x + Math.cos(phi) * rr,
          cz = M.z + Math.sin(phi) * rr,
          yaw = tanYaw(phi);
        b.box("oak_panel", cx, 0, cz, len, 1.25, 0.35, {
          yaw,
          tint: [0.62, 0.45, 0.3],
        });
        b.box("marble", cx, 1.25, cz, len + 0.05, 0.06, 0.6, {
          yaw,
          tint: [0.35, 0.33, 0.3],
        });
        b.ocol(cx, cz, len, 0.4, 0, 1.3, yaw, { tag: "counter" });
      }
      // brass desk lamps, ledgers, the big call board
      for (const phi of [0.2, 1.6, 2.9]) {
        const lx = M.x + Math.cos(phi) * 2.35,
          lz = M.z + Math.sin(phi) * 2.35;
        K.lamp(b, lx, 1.62, lz, "pendant", [1, 0.85, 0.5], 0.5, 3.5, {
          ceil: 1.31,
          shade: "paint_green",
          lightOpts: { box: RB },
        });
      }
      for (const phi of [0.9, 2.4, 4.1]) {
        const lx = M.x + Math.cos(phi) * 2.3,
          lz = M.z + Math.sin(phi) * 2.3;
        b.box("leather", lx, 1.31, lz, 0.45, 0.06, 0.32, {
          yaw: -phi,
          tint: [0.3, 0.2, 0.12],
        });
      }
      b.box("metal_dark", M.x, 0.35, M.z - 1.2, 1.8, 1.6, 0.4, {
        tint: [0.3, 0.32, 0.3],
      });
      for (let k = 0; k < 12; k++)
        b.box(
          "lamp",
          M.x - 0.75 + (k % 6) * 0.3,
          1.55 + Math.floor(k / 6) * 0.25,
          M.z - 0.99,
          0.08,
          0.08,
          0.02,
          { tint: r() < 0.3 ? [1, 0.3, 0.1] : [0.2, 0.1, 0.05] },
        );
      b.plate(
        "art",
        M.x,
        2.35,
        M.z + 2.4,
        0,
        1,
        2.2,
        0.36,
        K.signCell("pc_pd_muster", "MUSTER DESK", 256, 40, {
          bg: "#22324a",
          fg: "#d8c080",
          font: "Georgia, serif",
        }),
      );
      b.plate(
        "art",
        M.x,
        2.35,
        M.z - 2.4,
        0,
        -1,
        2.2,
        0.36,
        K.signCell("pc_pd_muster", "MUSTER DESK", 256, 40, {
          bg: "#22324a",
          fg: "#d8c080",
          font: "Georgia, serif",
        }),
      );
      b.beam(
        "black_iron",
        M.x,
        1.3,
        M.z + 2.4,
        M.x,
        2.2,
        M.z + 2.4,
        0.03,
        0.03,
      );
      ctx.muster = M;
      K.anchor(ctx, "sergeant", M.x, 0.35, M.z - 0.4);
    }
    // memorial wall (N-E side), flags, benches, a police call-box pillar
    {
      const phi = (7 * PI) / 4,
        wx = C.x + Math.cos(phi) * (A - 0.2),
        wz = C.z + Math.sin(phi) * (A - 0.2);
      b.plate(
        "art",
        wx,
        2.6,
        wz,
        -Math.cos(phi),
        -Math.sin(phi),
        2.6,
        3.4,
        memorial(),
      );
      b.box(
        "bronze",
        wx - Math.cos(phi) * 0.2,
        0.8,
        wz - Math.sin(phi) * 0.2,
        2.8,
        0.1,
        0.4,
        { yaw: -phi + HP, tint: [0.45, 0.35, 0.22] },
      );
      for (let k = 0; k < 5; k++) {
        const t = (k - 2) * 0.45,
          cx = wx - Math.cos(phi) * 0.25 + Math.cos(phi + HP) * t,
          cz = wz - Math.sin(phi) * 0.25 + Math.sin(phi + HP) * t;
        b.cyl("wax", cx, 0.9, cz, 0.04, 0.04, 0.08 + r() * 0.12, 6);
      }
      b.light(
        wx - Math.cos(phi) * 0.8,
        1.2,
        wz - Math.sin(phi) * 0.8,
        [1, 0.62, 0.3],
        0.45,
        3,
        { box: RB },
      );
      b.glow(
        wx - Math.cos(phi) * 0.25,
        1.05,
        wz - Math.sin(phi) * 0.25,
        [1, 0.6, 0.25],
        0.6,
      );
    }
    for (const phi of [(3 * PI) / 4, PI / 4]) {
      const fx = C.x + Math.cos(phi) * (A - 0.8),
        fz = C.z + Math.sin(phi) * (A - 0.8);
      b.pipe("brass", fx, 0, fz, fx, 3.2, fz, 0.035, 6);
      b.geo("gold", K.sphereGeo(), { x: fx, y: 3.25, z: fz, s: 0.07 });
      const cl = phi < 1 ? [0.2, 0.28, 0.55] : [0.7, 0.4, 0.22];
      b.quad(
        "fabric",
        [fx, 3.1, fz],
        [fx + 0.1, 3.1, fz + 0.1],
        [fx + 0.14, 1.7, fz + 0.16],
        [fx, 1.8, fz],
        { tint: cl },
      );
      b.quad(
        "fabric",
        [fx + 0.1, 3.1, fz + 0.1],
        [fx, 3.1, fz],
        [fx, 1.8, fz],
        [fx + 0.14, 1.7, fz + 0.16],
        { tint: cl },
      );
    }
    for (const phi of [PI * 0.62, PI * 0.38]) {
      const bx = C.x + Math.cos(phi) * 6.6,
        bz = C.z + Math.sin(phi) * 6.6;
      b.box("oak_panel", bx, 0, bz, 2.2, 0.45, 0.5, {
        yaw: -phi + HP,
        tint: [0.55, 0.4, 0.26],
      });
      b.ocol(bx, bz, 2.2, 0.5, 0, 0.45, -phi + HP, { tag: "furniture" });
    }
    b.plate("art", C.x - A + 0.14, 2.2, C.z + 2.5, 1, 0, 1.9, 1.3, wanted()); // W wall south of the bullpen door
    b.plate(
      "art",
      C.x + A - 0.14,
      2.0,
      C.z - 2.5,
      -1,
      0,
      1.1,
      1.5,
      K.signCell(
        "pc_pd_cells",
        "HOLDING\nCELLS →\nAUTHORIZED\nPERSONNEL",
        192,
        256,
        { bg: "#22324a", fg: "#e8d888", font: "Arial, sans-serif" },
      ),
    );
    K.litter(b, -6, -21, 6, -9, 0, 18, 12);
    for (let k = 0; k < 5; k++)
      b.hplate(
        "decal",
        -5 + r() * 10,
        0.02 + k * 0.001,
        -21 + r() * 12,
        1 + r(),
        1 + r(),
        r() * 6,
        K.decal(k % 2 ? "grime" : "crack", k + 20),
      );
    K.skel(ctx, 4.8, 0, -10.2, 2.4, "lying");

    // ================= BRIEFING ROOM (north, y 0) =================
    const BRB = [-7.1, -0.3, -34.1, 7.1, 4.7, C.z - A + 0.1];
    K.gap(ctx, 0, C.z - A, 2.4, 0, 3.2);
    K.room(b, ctx, {
      x0: -7,
      z0: -34,
      x1: 7,
      z1: C.z - A,
      y: 0,
      h: 4.7,
      floor: "lino",
      fc: [0.7, 0.72, 0.66],
      wall: "plaster",
      wc: [0.72, 0.74, 0.66],
      wain: "oak_panel",
      wainC: [0.6, 0.45, 0.3],
      wainH: 1.1,
      ceil: "plaster",
      cc: [0.6, 0.6, 0.56],
    });
    b.plate("art", 0, 2.4, -33.86, 0, 1, 5.2, 3.2, chalkMap());
    b.boxMM("oak_panel", -3, 0, -32.4, 3, 0.3, -30.6, {
      tint: [0.55, 0.4, 0.26],
    });
    b.col(-3, 0, -32.4, 3, 0.3, -30.6, { tag: "floor", surface: "wood" });
    b.boxMM("oak_panel", -0.4, 0.3, -31.6, 0.4, 1.4, -31.2, {
      tint: [0.5, 0.36, 0.22],
    });
    b.col(-0.4, 0.3, -31.6, 0.4, 1.4, -31.2, {});
    for (let row = 0; row < 4; row++)
      for (let k = 0; k < 6; k++) {
        const cx = -4.5 + k * 1.8,
          cz = -28.6 + row * 1.2;
        K.chair(b, cx, 0, cz, PI, {
          mat: "metal",
          tint: [0.45, 0.5, 0.45],
          fallen: r() < 0.15,
        });
      }
    b.boxMM("metal_dark", 4.8, 0, -26.6, 6.6, 1.2, -25.6, {
      tint: [0.35, 0.35, 0.33],
    });
    b.cyl("metal_dark", 5.7, 1.2, -26.1, 0.25, 0.25, 0.4, 10); // film projector cart
    for (const x of [-4, 0, 4])
      K.lamp(
        b,
        x,
        3.6,
        -29,
        "tube",
        [0.85, 0.95, 0.85],
        x === 4 ? 0 : 0.55,
        7,
        { ceil: 4.7, len: 1.4, dead: x === 4, lightOpts: { box: BRB } },
      );
    K.litter(b, -6.5, -33.5, 6.5, -25, 0, 10, 13);

    // ================= COMMISSIONER'S OFFICE (north, y 5) =================
    const OFB = [-7.1, GAL - 0.3, -34.1, 7.1, GAL + 4.3, C.z - A + 0.1];
    K.gap(ctx, 0, C.z - A, 1.6, GAL, 2.5);
    K.room(b, ctx, {
      x0: -7,
      z0: -34,
      x1: 7,
      z1: C.z - A,
      y: GAL,
      h: 4.2,
      floor: "carpet",
      fc: [0.35, 0.3, 0.4],
      wall: "plaster",
      wc: [0.78, 0.72, 0.6],
      wain: "oak_panel",
      wainC: [0.62, 0.44, 0.28],
      wainH: 1.4,
      ceil: "coffer",
      cc: [0.6, 0.56, 0.48],
      surface: "carpet",
      cornice: true,
    });
    K.table(b, 0, GAL, -29.5, 3.2, 1.4, { mat: "mahogany", h: 0.8 });
    K.chair(b, 0, GAL, -30.8, PI, { mat: "leather", seatMat: "leather" });
    b.box("leather", 0.9, GAL + 0.8, -29.3, 0.5, 0.04, 0.35, {
      tint: [0.2, 0.14, 0.1],
    });
    K.lamp(b, -1.2, GAL + 1.2, -29.6, "pendant", [1, 0.85, 0.5], 0.7, 5, {
      ceil: GAL + 0.8,
      shade: "paint_green",
      lightOpts: { box: OFB },
    });
    K.framed(b, 0, GAL + 2.5, -33.88, 0, 1, 1.3, 1.7, portrait(), {
      frame: "gold",
    });
    for (const s of [-1, 1]) {
      b.pipe("brass", s * 1.8, GAL, -33.4, s * 1.8, GAL + 2.8, -33.4, 0.03, 6);
      b.quad(
        "fabric",
        [s * 1.8, GAL + 2.7, -33.4],
        [s * 1.8 + s * 0.8, GAL + 2.7, -33.35],
        [s * 1.8 + s * 0.8, GAL + 1.5, -33.35],
        [s * 1.8, GAL + 1.5, -33.4],
        { tint: s < 0 ? [0.2, 0.28, 0.55] : [0.72, 0.42, 0.22] },
      );
    }
    K.shelf(b, -6.6, GAL, -30, HP, 3.0, {
      mat: "mahogany",
      items: ["book", "book", "book", "box"],
      seed: 1611,
      h: 2.4,
    });
    // trophy case + liquor trolley
    b.boxMM("mahogany", 3.6, GAL, -33.8, 6.8, GAL + 1.0, -33.2, {
      tint: [0.5, 0.25, 0.15],
    });
    b.plate("glass_clear", 5.2, GAL + 1.6, -33.2, 0, 1, 3.2, 1.2, null, {
      tint: [0.7, 0.8, 0.8],
    });
    for (let k = 0; k < 5; k++)
      b.cyl(
        "gold",
        3.9 + k * 0.62,
        GAL + 1.0,
        -33.5,
        0.08,
        0.12,
        0.3 + (k % 2) * 0.15,
        8,
      );
    b.col(3.6, GAL, -33.8, 6.8, GAL + 2.2, -33.2, {});
    b.plate(
      "art",
      -6.86,
      GAL + 2.4,
      -26.5,
      1,
      0,
      2.4,
      1.6,
      K.signCell(
        "pc_pd_cmd",
        "EMERGENCY DIRECTIVE 67-C\nCITYWIDE CURFEW\nPATROLMAN ENFORCEMENT: AUTHORIZED",
        512,
        300,
        {
          bg: "#e8dcc0",
          fg: "#22324a",
          font: "Georgia, serif",
          border: "#b8261e",
        },
      ),
    );
    b.hplate("decal", 1.2, GAL + 0.012, -28, 1.8, 1.8, 0, K.decal("blood", 7));
    K.skel(ctx, 0.3, GAL, -30.8, PI, "sitting");
    b.light(0, GAL + 3.2, -28, [0.9, 0.78, 0.6], 0.5, 9, { box: OFB });

    // ================= PRECINCT BULLPEN (west) =================
    const BPB = [-30.1, -0.3, -26.1, -8.6, 4.8, -3.9];
    K.gap(ctx, -A, C.z, 2.4, 0, 3.2);
    K.room(b, ctx, {
      x0: -30,
      z0: -26,
      x1: -A,
      z1: -4,
      y: 0,
      h: 4.6,
      floor: "lino",
      fc: [0.66, 0.7, 0.64],
      wall: "plaster",
      wc: GREEN_W,
      wain: "celltile",
      wainC: [0.7, 0.78, 0.68],
      wainH: 1.3,
      ceil: "tin",
      cc: [0.62, 0.6, 0.54],
      noFloor: true,
    });
    fl("lino", -30, -26, -A, -17, 0, [0.66, 0.7, 0.64]);
    fl("lino", -30, -13, -A, -4, 0, [0.66, 0.7, 0.64]);
    fl("lino", -30, -17, -24, -13, 0, [0.66, 0.7, 0.64]);
    fl("lino", -14, -17, -A, -13, 0, [0.66, 0.7, 0.64]);
    K.railing(b, -24, -17, -14, -17, 0, { mat: "steel", handMat: "steel" });
    K.railing(b, -24, -13, -14, -13, 0, { mat: "steel", handMat: "steel" });
    K.railing(b, -14, -17, -14, -13, 0, { mat: "steel", handMat: "steel" });
    b.plate(
      "art",
      -25.2,
      1.2,
      -17.05,
      0,
      1,
      1.6,
      0.4,
      K.signCell("pc_pd_down", "BASEMENT ↓ RANGE · ARMORY", 256, 64, {
        bg: "#22324a",
        fg: "#e8d888",
      }),
    );
    // stair shaft (bullpen → basement) and its walls
    K.stairs(b, -24, -17, -14, -13, BY, 0, "-x", {
      mat: "concrete",
      tint: [0.6, 0.6, 0.56],
      nosing: "steel",
    });
    K.segWall(b, -24, -17, -14, -17, BY, 0, -1, {
      mat: "celltile",
      tint: [0.6, 0.66, 0.58],
      trim: false,
    });
    K.segWall(b, -24, -13, -14, -13, BY, 0, 1, {
      mat: "celltile",
      tint: [0.6, 0.66, 0.58],
      trim: false,
    });
    K.segWall(b, -24, -13, -24, -17, BY, 0, -1, {
      mat: "celltile",
      tint: [0.6, 0.66, 0.58],
      trim: false,
    });
    // desks (8) with typewriters, papers, phones
    for (let row = 0; row < 2; row++)
      for (let k = 0; k < 4; k++) {
        const dx = -27 + k * 4.2,
          dz = row ? -8.5 : -21.5;
        if (dx > -12) continue;
        if (!row && k === 1) continue; // that desk and its chair blocked the door of the sergeant's glass office
        K.table(b, dx, 0, dz, 1.6, 0.8, {
          mat: "metal",
          tint: [0.4, 0.46, 0.42],
          h: 0.76,
        });
        b.box("metal_dark", dx - 0.3, 0.76, dz, 0.5, 0.18, 0.4, {
          tint: [0.2, 0.2, 0.2],
        }); // typewriter
        b.box("ceramic", dx - 0.3, 0.9, dz - 0.14, 0.44, 0.1, 0.02, {
          tint: [0.85, 0.82, 0.72],
        });
        b.box("bakelite", dx + 0.45, 0.76, dz - 0.15, 0.22, 0.1, 0.18, {
          tint: [0.1, 0.08, 0.06],
        }); // telephone
        for (let p = 0; p < 3; p++)
          b.hplate(
            "flat",
            dx + (r() - 0.5) * 1.2,
            0.765 + p * 0.002,
            dz + (r() - 0.5) * 0.5,
            0.22,
            0.3,
            r() * 3,
            null,
            { tint: [0.85, 0.82, 0.72] },
          );
        K.chair(b, dx, 0, dz + (row ? -0.7 : 0.7), row ? 0 : PI, {
          mat: "metal",
          tint: [0.35, 0.4, 0.36],
          fallen: r() < 0.2,
        });
      }
    // sergeant's glass office (NW corner)
    b.boxMM("oak_panel", -30, 0, -20, -24, 1.1, -19.8, {
      tint: [0.55, 0.4, 0.26],
    });
    b.boxMM("oak_panel", -24.2, 0, -26, -24, 1.1, -21.4, {
      tint: [0.55, 0.4, 0.26],
    });
    b.plate("glass_clear", -27, 2.1, -19.9, 0, 1, 6, 2, null, {
      tint: [0.7, 0.8, 0.8],
    });
    b.plate("glass_clear", -24.1, 2.1, -23.7, 1, 0, 4.6, 2, null, {
      tint: [0.7, 0.8, 0.8],
    });
    b.col(-30, 0, -20.05, -24, 3.1, -19.75, {});
    b.col(-24.25, 0, -26, -23.95, 3.1, -21.4, {});
    b.plate(
      "art",
      -27,
      2.9,
      -19.84,
      0,
      1,
      2.2,
      0.36,
      K.signCell("pc_pd_sgt", "DESK SERGEANT", 256, 44, {
        bg: null,
        fg: "#d8c080",
        font: "Georgia, serif",
        weather: false,
      }),
    );
    // wanted board, lockers, coffee station, holding bench
    b.plate("art", -29.86, 2.3, -10, 1, 0, 3.4, 2.1, wanted());
    b.boxMM("paint_black", -29.9, 0.9, -12.2, -29.8, 1.1, -7.8, {
      tint: [0.1, 0.1, 0.1],
    });
    K.table(b, -12.5, 0, -25.3, 1.8, 0.7, {
      mat: "metal",
      tint: [0.45, 0.45, 0.42],
    });
    b.cyl("chrome", -12.9, 0.76, -25.3, 0.12, 0.12, 0.35, 10);
    b.cyl("ceramic", -12.3, 0.76, -25.2, 0.05, 0.04, 0.09, 8);
    b.cyl("ceramic", -12.1, 0.76, -25.4, 0.05, 0.04, 0.09, 8);
    b.plate(
      "art",
      -12.5,
      1.9,
      -25.86,
      0,
      1,
      1.6,
      0.6,
      K.signCell("pc_pd_coffee", "COFFEE FUND\n5¢ HONOR SYSTEM", 256, 96, {
        bg: "#e8dcc0",
        fg: "#2a2a20",
        font: "Arial, sans-serif",
      }),
    );
    b.boxMM("oak_panel", -29.7, 0, -7.5, -26, 0.45, -4.3, {
      tint: [0.5, 0.36, 0.22],
    });
    b.boxMM("oak_panel", -29.9, 0.45, -7.5, -29.7, 1.2, -4.3, {
      tint: [0.5, 0.36, 0.22],
    });
    b.col(-29.9, 0, -7.5, -26, 0.45, -4.3, { tag: "furniture" });
    b.pipe("steel", -29.75, 0.9, -6.4, -29.75, 0.9, -5.4, 0.02, 4);
    K.skel(ctx, -28.3, 0.45, -5.8, HP, "sitting");
    for (const [x, z, dead] of [
      [-26, -21, false],
      [-19, -21, true],
      [-26, -9, false],
      [-19, -9, false],
      [-12, -15, false],
    ])
      K.lamp(b, x, 3.6, z, "tube", [0.9, 1, 0.9], dead ? 0 : 0.5, 7, {
        ceil: 4.6,
        len: 1.4,
        dead,
        lightOpts: { box: BPB },
      });
    b.light(-27, 2.2, -23, WARM, 0.35, 4, { box: BPB });
    K.litter(b, -29.5, -25.5, -9.5, -4.5, 0, 26, 14);
    for (let k = 0; k < 6; k++)
      b.hplate(
        "decal",
        -28 + r() * 17,
        0.012 + k * 0.001,
        -25 + r() * 20,
        1 + r() * 1.5,
        1 + r() * 1.5,
        r() * 6,
        K.decal(k % 3 ? "grime" : "blood", k + 30),
      );
    b.burn(-20, 1, -4.2, 3, 0.7);

    // ================= HOLDING CELLS (east) =================
    const CB = [8.6, -0.3, -21.1, 30.1, 4.6, -8.9];
    K.gap(ctx, A, C.z, 2.4, 0, 3.2);
    K.gap(ctx, 30, -15, 3.6, 0, 3.6);
    K.room(b, ctx, {
      x0: A,
      z0: -21,
      x1: 30,
      z1: -9,
      y: 0,
      h: 4.4,
      floor: "concrete",
      fc: [0.6, 0.6, 0.57],
      wall: "plaster",
      wc: [0.72, 0.74, 0.66],
      wain: "celltile",
      wainC: [0.66, 0.74, 0.64],
      wainH: 1.5,
      ceil: "concrete",
      cc: [0.5, 0.5, 0.48],
      trim: false,
    });
    // guard station (x A..12)
    b.boxMM("metal", 9.4, 0, -20.6, 11.6, 1.1, -19.4, {
      tint: [0.42, 0.46, 0.44],
    });
    b.col(9.4, 0, -20.6, 11.6, 1.1, -19.4, { tag: "counter" });
    b.boxMM("oak_panel", 11.7, 1.2, -20.95, 12.0, 2.4, -19.5, {
      tint: [0.5, 0.36, 0.22],
    });
    for (let k = 0; k < 6; k++)
      b.box(
        "brass",
        11.7,
        1.4 + (k % 3) * 0.35,
        -20.8 + Math.floor(k / 3) * 0.7,
        0.06,
        0.12,
        0.05,
        { tint: [0.6, 0.45, 0.25] },
      );
    // cells: 6 per side, x 12..30, 3 m wide; front bars on the corridor (z −16.8 / −13.2)
    const CELLS = [];
    for (const side of [-1, 1])
      for (let i = 0; i < 6; i++) {
        const x0 = 12 + i * 3,
          x1 = x0 + 3,
          zf = side < 0 ? -16.8 : -13.2,
          zb = side < 0 ? -21 : -9;
        CELLS.push({ side, i, x0, x1, zf, zb });
        // partition walls
        K.segWall(b, x0, zf, x0, zb, 0, 4.4, 1, {
          mat: "celltile",
          tint: [0.64, 0.7, 0.62],
          both: true,
          trim: false,
        });
        if (i === 5)
          K.segWall(b, x1, zf, x1, zb, 0, 4.4, 1, {
            mat: "celltile",
            tint: [0.64, 0.7, 0.62],
            both: true,
            trim: false,
          });
        const pike = side > 0 && i === 2;
        // bars (door section at x0+0.9..x0+2.1 is the gate on Mott's cell; others static, some ajar)
        const ajar = (!pike && r() < 0.3) || (side < 0 && i === 0); // N-1 (Orlov's cell, with his note) always stands open
        for (let x = x0 + 0.14; x < x1 - 0.05; x += 0.15) {
          if (pike && x > x0 + 0.88 && x < x0 + 2.12) continue;
          if (ajar && x > x0 + 0.88 && x < x0 + 2.12) continue;
          b.cyl("black_iron", x, 0, zf, 0.018, 0.018, 2.5, 5, {
            tint: [0.3, 0.29, 0.27],
            top: false,
          });
        }
        for (const y of [0.05, 1.2, 2.45])
          b.boxMM("black_iron", x0, y, zf - 0.04, x1, y + 0.07, zf + 0.04, {
            tint: [0.3, 0.29, 0.27],
          });
        b.boxMM("concrete", x0, 2.52, zf - 0.1, x1, 4.4, zf + 0.1, {
          tint: [0.6, 0.6, 0.57],
        });
        if (ajar) {
          // swung-open door leaf
          const hx = x0 + 0.9;
          for (let k = 0; k < 8; k++)
            b.cyl(
              "black_iron",
              hx,
              0,
              zf + side * -0.15 * (k + 1),
              0.018,
              0.018,
              2.4,
              5,
              { tint: [0.3, 0.29, 0.27], top: false },
            );
          b.col(x0, 0, zf - 0.05, x0 + 0.9, 2.5, zf + 0.05, {
            tag: "bars",
            walkable: false,
          });
          b.col(x0 + 2.1, 0, zf - 0.05, x1, 2.5, zf + 0.05, {
            tag: "bars",
            walkable: false,
          });
        } else if (pike) {
          b.col(x0, 0, zf - 0.05, x0 + 0.9, 2.5, zf + 0.05, {
            tag: "bars",
            walkable: false,
          });
          b.col(x0 + 2.1, 0, zf - 0.05, x1, 2.5, zf + 0.05, {
            tag: "bars",
            walkable: false,
          });
        } else
          b.col(x0, 0, zf - 0.05, x1, 2.5, zf + 0.05, {
            tag: "bars",
            walkable: false,
          });
        // bunk, toilet, tally marks
        const bz = (zf + zb) / 2,
          bx = x1 - 0.5;
        b.boxMM(
          "black_iron",
          x1 - 0.95,
          0.45,
          Math.min(zf, zb) + 0.2,
          x1 - 0.05,
          0.5,
          Math.max(zf, zb) - 0.4,
          { tint: [0.3, 0.29, 0.27] },
        );
        b.boxMM(
          "cloth_white",
          x1 - 0.9,
          0.5,
          Math.min(zf, zb) + 0.3,
          x1 - 0.1,
          0.58,
          Math.max(zf, zb) - 0.5,
          { tint: [0.45, 0.42, 0.34] },
        );
        for (const cz of [Math.min(zf, zb) + 0.25, Math.max(zf, zb) - 0.45])
          b.pipe("black_iron", bx, 0, cz, bx, 0.45, cz, 0.03, 4);
        b.col(
          x1 - 0.95,
          0,
          Math.min(zf, zb) + 0.2,
          x1 - 0.05,
          0.58,
          Math.max(zf, zb) - 0.4,
          { tag: "furniture" },
        );
        b.cyl(
          "steel",
          x0 + 0.4,
          0,
          zb + (side < 0 ? 0.45 : -0.45),
          0.22,
          0.18,
          0.42,
          10,
          { tint: [0.7, 0.72, 0.72] },
        );
        b.plate(
          "decal",
          x0 + 0.02,
          1.6,
          bz,
          1,
          0,
          1.2,
          0.8,
          K.tag(
            [
              "IIII IIII III",
              "INNOCENT",
              "TOMMY WAS HERE",
              "CURFEW MY ASS",
              "IIII IIII IIII IIII",
              "DAY 3",
            ][(i + (side > 0 ? 3 : 0)) % 6],
            "#d8d0b8",
            256,
            96,
            { size: 0.4, font: "Arial, sans-serif" },
          ),
        );
        b.plate(
          "art",
          (x0 + x1) / 2,
          2.75,
          zf + (side < 0 ? 0.11 : -0.11),
          0,
          side < 0 ? 1 : -1,
          0.6,
          0.3,
          K.signCell(
            "pc_pd_cellno_" + (side < 0 ? "n" : "s") + i,
            (side < 0 ? "N-" : "S-") + (i + 1),
            96,
            48,
            { bg: "#e8dcc0", fg: "#22324a" },
          ),
        );
        CELLS.lastPike = pike ? { x0, x1, zf, zb } : CELLS.lastPike;
      }
    // occupants: skeletons, the pike cell's bedroll
    K.skel(ctx, 13.4, 0.58, -19.5, 0.3, "lying");
    K.skel(ctx, 25.3, 0, -10.2, 2.2, "curled");
    K.skel(ctx, 28.8, 0.58, -19.8, 3.2, "lying");
    b.boxMM("fabric", 18.3, 0.02, -10.4, 19.6, 0.12, -9.3, {
      tint: [0.5, 0.42, 0.3],
    });
    b.cyl("metal", 20.5, 0, -12.8, 0.12, 0.12, 0.14, 8, {
      tint: [0.6, 0.6, 0.58],
    }); // food tray / can the robots push through
    for (const x of [14, 20, 26])
      K.lamp(b, x, 3.9, -15, "cage", SICK, x === 26 ? 0 : 0.6, 7, {
        ceil: 4.4,
        dead: x === 26,
        lightOpts: { box: CB },
      });
    b.light(10.5, 2.2, -20, WARM, 0.4, 4, { box: CB });
    b.light(19.5, 2.0, -11, [0.9, 0.75, 0.5], 0.35, 3.5, { box: CB });
    K.litter(b, 9.5, -16.6, 29.5, -13.4, 0, 12, 15);
    for (let k = 0; k < 4; k++)
      b.hplate(
        "decal",
        12 + r() * 17,
        0.012 + k * 0.001,
        -16.5 + r() * 3,
        1.2,
        1.2,
        r() * 6,
        K.decal(k % 2 ? "puddle" : "grime", k + 40),
      );
    ctx.pikeCell = CELLS.lastPike;

    // ================= EAST STAIRWELL (cells → basement) =================
    const SWB = [29.9, BY - 0.3, -16.9, 44.1, 4.5, -13.1];
    K.stairs(b, 30, -16.8, 40, -13.2, BY, 0, "-x", {
      mat: "concrete",
      tint: [0.58, 0.58, 0.55],
      nosing: "steel",
      rail: "r",
      railMat: "steel",
      handMat: "steel",
    });
    K.segWall(b, 30, -16.8, 40, -16.8, BY, 4.4, -1, {
      mat: "concrete",
      tint: [0.55, 0.55, 0.52],
      trim: false,
    });
    K.segWall(b, 30, -13.2, 40, -13.2, BY, 4.4, 1, {
      mat: "concrete",
      tint: [0.55, 0.55, 0.52],
      trim: false,
    });
    K.segWall(b, 40, -13.2, 40, -16.8, BY + 3.4, 4.4, 1, {
      mat: "concrete",
      tint: [0.55, 0.55, 0.52],
      trim: false,
    });
    b.face("concrete", 30, 4.4, -16.8, 1, 0, 0, 0, 0, 1, 10, 3.6, {
      uv: "top",
      tint: [0.45, 0.45, 0.43],
    });
    K.lamp(b, 35, 2.4, -15, "cage", SICK, 0.5, 6, {
      ceil: 4.4,
      lightOpts: { box: SWB },
    });

    // ================= BASEMENT (y −5) =================
    const BB = [-14.1, BY - 0.3, -36.1, 44.1, BY + 3.5, -13.1];
    const bw = {
      wall: "concrete",
      wc: [0.56, 0.56, 0.52],
      floor: "concrete",
      fc: [0.5, 0.5, 0.47],
      ceil: "concrete",
      cc: [0.4, 0.4, 0.38],
      trim: false,
      y: BY,
      h: 3.4,
    };
    // east landing
    K.gap(ctx, 40, -15, 3.6, BY, 3.4);
    K.gap(ctx, 40, -22, 3.8, BY, 3.4);
    K.room(
      b,
      ctx,
      Object.assign({}, bw, { x0: 40, z0: -24, x1: 44, z1: -13.2 }),
    );
    // west landing
    K.gap(ctx, -14, -15, 3.6, BY, 3.4);
    K.gap(ctx, -10, -22, 3.8, BY, 3.4);
    K.room(
      b,
      ctx,
      Object.assign({}, bw, { x0: -14, z0: -24, x1: -10, z1: -13.2 }),
    );
    // corridor
    K.gap(ctx, -4, -24, 1.4, BY, 2.4);
    K.gap(ctx, 11, -24, 1.4, BY, 2.5);
    K.gap(ctx, 29, -24, 1.6, BY, 2.5);
    K.gap(ctx, 0, -20, 1.4, BY, 2.4);
    K.room(
      b,
      ctx,
      Object.assign({}, bw, {
        x0: -10,
        z0: -24,
        x1: 40,
        z1: -20,
        open: { e: true, w: true },
      }),
    );
    for (let x = -8; x < 39; x += 2.2) {
      b.pipe("rust", x, BY + 3.1, -23.7, x + 2.2, BY + 3.1, -23.7, 0.09, 6, {
        tint: [0.55, 0.4, 0.3],
      });
    }
    b.pipe("metal", -10, BY + 2.9, -20.4, 40, BY + 2.9, -20.4, 0.05, 5);
    for (const x of [-6, 6, 18, 32])
      K.lamp(
        b,
        x,
        BY + 2.9,
        -22,
        "cage",
        x === 18 ? [1, 0.25, 0.15] : SICK,
        x === 6 ? 0 : 0.55,
        7,
        { ceil: BY + 3.4, dead: x === 6, lightOpts: { box: BB } },
      );
    b.plate(
      "art",
      11,
      BY + 2.75,
      -23.88,
      0,
      1,
      1.8,
      0.35,
      K.signCell("pc_pd_armsign", "ARMORY · SIGN OUT ALL WEAPONS", 384, 64, {
        bg: "#b8261e",
        fg: "#f0e8d0",
      }),
    );
    b.plate(
      "art",
      29,
      BY + 2.75,
      -23.88,
      0,
      1,
      1.8,
      0.35,
      K.signCell("pc_pd_evsign", "EVIDENCE · PROPERTY CLERK", 384, 64, {
        bg: "#22324a",
        fg: "#e8d888",
      }),
    );
    b.plate(
      "art",
      0,
      BY + 2.6,
      -20.12,
      0,
      -1,
      1.8,
      0.35,
      K.signCell("pc_pd_rangesign", "PISTOL RANGE · EARS ON", 384, 64, {
        bg: "#e8d888",
        fg: "#1a1a1a",
      }),
    );
    for (let k = 0; k < 6; k++)
      b.hplate(
        "decal",
        -8 + r() * 46,
        BY + 0.012 + k * 0.001,
        -23.6 + r() * 3.2,
        1.2 + r(),
        1.2 + r(),
        r() * 6,
        K.decal(k % 2 ? "puddle" : "grime", k + 50),
      );
    K.litter(b, -9, -23.6, 39, -20.4, BY, 16, 16);
    b.burn(18, BY + 1.5, -21, 3, 0.5);
    // BOILER & RECORDS (x −10..2)
    K.room(b, ctx, Object.assign({}, bw, { x0: -10, z0: -36, x1: 2, z1: -24 }));
    b.cyl("rust", -6, BY, -31, 1.6, 1.6, 3.0, 14, { tint: [0.55, 0.42, 0.34] });
    b.col(-7.6, BY, -32.6, -4.4, BY + 3.0, -29.4, {});
    for (let k = 0; k < 3; k++)
      b.pipe(
        "rust",
        -6 + k * 0.6 - 0.6,
        BY + 3.0,
        -31,
        -6 + k * 0.6 - 0.6,
        BY + 3.4,
        -31,
        0.12,
        6,
      );
    b.light(-6, BY + 0.6, -29.2, [1, 0.45, 0.15], 0.5, 4, { box: BB });
    b.glow(-6, BY + 0.5, -29.35, [1, 0.4, 0.1], 0.8);
    for (let k = 0; k < 4; k++)
      K.shelf(b, -1 + 0, BY, -34.5 + k * 2.6, HP, 2.2, {
        mat: "metal",
        items: ["box", "box", "book"],
        seed: 1620 + k,
        h: 2.4,
      });
    K.lamp(b, -3, BY + 2.9, -30, "bulb", WARM, 0.45, 6, {
      ceil: BY + 3.4,
      lightOpts: { box: BB },
    });
    // ARMORY (x 4..18) — reward room behind the cage gate
    K.room(
      b,
      ctx,
      Object.assign({}, bw, {
        x0: 4,
        z0: -36,
        x1: 18,
        z1: -24,
        wall: "celltile",
        wc: [0.55, 0.6, 0.55],
      }),
    );
    for (let k = 0; k < 3; k++) {
      // weapon racks on the north wall
      const rx = 6.5 + k * 4.5;
      b.boxMM(
        "wood_dark",
        rx - 1.6,
        BY + 0.2,
        -35.8,
        rx + 1.6,
        BY + 2.2,
        -35.6,
        { tint: [1.5, 1.35, 1.15] },
      );
      b.boxMM(
        "wood_dark",
        rx - 1.6,
        BY + 0.2,
        -35.6,
        rx + 1.6,
        BY + 0.34,
        -35.2,
        { tint: [1.3, 1.1, 0.9] },
      ); // butt rest
      b.boxMM(
        "wood_dark",
        rx - 1.6,
        BY + 1.55,
        -35.6,
        rx + 1.6,
        BY + 1.62,
        -35.3,
        { tint: [1.3, 1.1, 0.9] },
      ); // barrel comb
      for (let g = 0; g < 6; g++) {
        // riot guns: stock, receiver, barrel, pump
        const gx = rx - 1.3 + g * 0.52;
        if (r() < 0.35) continue;
        const zz = -35.42,
          lean = 0.05;
        b.beam(
          "wood_dark",
          gx,
          BY + 0.34,
          zz,
          gx + lean * 0.3,
          BY + 0.72,
          zz + 0.01,
          0.05,
          0.13,
          { tint: [1.4, 1.0, 0.7] },
        ); // stock
        b.beam(
          "metal_dark",
          gx + lean * 0.3,
          BY + 0.72,
          zz,
          gx + lean * 0.5,
          BY + 0.98,
          zz + 0.02,
          0.055,
          0.1,
          { tint: [0.16, 0.16, 0.16] },
        ); // receiver
        b.pipe(
          "metal_dark",
          gx + lean * 0.5,
          BY + 0.98,
          zz + 0.02,
          gx + lean,
          BY + 1.62,
          zz + 0.04,
          0.014,
          5,
          { tint: [0.12, 0.12, 0.12] },
        ); // barrel
        b.pipe(
          "wood_dark",
          gx + lean * 0.62,
          BY + 1.12,
          zz + 0.05,
          gx + lean * 0.8,
          BY + 1.36,
          zz + 0.055,
          0.024,
          5,
          { tint: [1.4, 1.0, 0.7] },
        ); // pump
      }
      // helmets on the shelf above
      b.boxMM(
        "wood_dark",
        rx - 1.6,
        BY + 2.2,
        -35.9,
        rx + 1.6,
        BY + 2.26,
        -35.45,
        { tint: [1.3, 1.1, 0.9] },
      );
      for (let g = 0; g < 4; g++)
        if (r() < 0.75)
          b.geo("police_blue", K.hemiGeo(12, 5), {
            x: rx - 1.2 + g * 0.8,
            y: BY + 2.26,
            z: -35.66,
            s: 0.15,
            sy: 0.14,
            tint: [1.6, 1.6, 1.6],
          });
    }
    // riot shields leaning along the west wall, ammunition cases stacked by the table
    for (let k = 0; k < 7; k++) {
      const sz = -34.8 + k * 0.62,
        lean = 0.26;
      b.quadN(
        "glass",
        [4.1 + lean, BY + 0.02, sz - 0.28],
        [4.1 + lean, BY + 0.02, sz + 0.28],
        [4.1, BY + 1.12, sz + 0.28],
        [4.1, BY + 1.12, sz - 0.28],
        [1, 0.24, 0],
        { tint: [0.55, 0.62, 0.66], grime: 0.3 },
      );
      b.plate(
        "art",
        4.2,
        BY + 0.62,
        sz,
        1,
        0,
        0.42,
        0.12,
        K.signCell("pc_pd_shield", "POLICE", 128, 36, {
          bg: "#1a1a1a",
          fg: "#f0f0e0",
          font: "Arial, sans-serif",
          weather: false,
        }),
        { off: 0.03 },
      );
    }
    b.col(4, BY, -35.2, 4.5, BY + 1.15, -30.2, { tag: "furniture" });
    for (let k = 0; k < 6; k++) {
      const cx = 13.4 + (k % 3) * 0.72,
        cy = BY + Math.floor(k / 3) * 0.42,
        cz = -26.2 + (k % 2) * 0.06;
      b.box("paint_green", cx, cy, cz, 0.66, 0.4, 0.4, {
        tint: [0.32, 0.38, 0.26],
        yaw: (r() - 0.5) * 0.1,
      });
      b.plate(
        "art",
        cx,
        cy + 0.2,
        cz + 0.205,
        0,
        1,
        0.5,
        0.14,
        K.signCell("pc_pd_ammo", "12 GA · 00 BUCK", 160, 40, {
          bg: "#4a5a3a",
          fg: "#e8e0b8",
          font: "Arial, sans-serif",
        }),
        { off: 0.004 },
      );
    }
    b.col(13.0, BY, -26.45, 15.5, BY + 0.84, -25.9, { tag: "furniture" });
    for (const z of [-33, -29]) {
      b.boxMM("metal", 17.4, BY, z - 1.4, 17.95, BY + 2.0, z + 1.4, {
        tint: [0.3, 0.36, 0.3],
      });
      b.col(17.4, BY, z - 1.4, 17.95, BY + 2.0, z + 1.4, {});
    }
    b.boxMM("wood", 8, BY, -30.5, 12, BY + 0.9, -28.5, {
      tint: [0.5, 0.42, 0.3],
    });
    b.col(8, BY, -30.5, 12, BY + 0.9, -28.5, { tag: "furniture" });
    b.plate(
      "art",
      11,
      BY + 1.8,
      -35.5,
      0,
      1,
      2.6,
      0.5,
      K.signCell("pc_pd_riot", "RIOT CONTROL · UNIT 7", 384, 64, {
        bg: "#22324a",
        fg: "#e8d888",
      }),
    );
    K.lamp(b, 11, BY + 2.9, -30, "tube", [0.95, 1, 0.9], 0.8, 8, {
      ceil: BY + 3.4,
      len: 1.6,
      lightOpts: { box: BB },
    });
    K.lamp(b, 11, BY + 2.9, -34.4, "tube", [0.95, 1, 0.9], 0.7, 6, {
      ceil: BY + 3.4,
      len: 2.4,
      lightOpts: { box: BB },
    });
    b.light(5.5, BY + 2.0, -32.5, [0.9, 0.95, 1], 0.35, 5, { box: BB });
    ctx.armoryGate = K.gate(ctx, {
      id: "armory",
      flag: "pd_armory_open",
      label: "Armory Cage",
      x: 11,
      z: -24,
      w: 1.4,
      axis: "x",
      y0: BY,
      h: 2.5,
      lock: {
        id: "pc_lk_pd_armory",
        key: "pc_pd_armory_key",
        hint: "The armory key is in the Commissioner's wall safe; the command terminal can also release the cage.",
      },
      style: "cage",
    });
    // EVIDENCE LOCKUP (x 20..38)
    K.room(b, ctx, Object.assign({}, bw, { x0: 20, z0: -36, x1: 38, z1: -24 }));
    for (let k = 0; k < 4; k++)
      K.shelf(b, 22.5 + k * 4, BY, -35.5, 0, 3.4, {
        mat: "metal",
        items: ["box", "box", "jar", "can", "bottle"],
        seed: 1630 + k,
        h: 2.6,
      });
    for (let k = 0; k < 3; k++)
      K.shelf(b, 24 + k * 5, BY, -29.5, PI, 3.6, {
        mat: "metal",
        items: ["box", "box", "box"],
        seed: 1640 + k,
        h: 2.2,
      });
    // chain-link property cage around the east end
    for (let z = -35.8; z < -26; z += 0.12)
      b.box("black_iron", 33.5, BY, z, 0.012, 2.6, 0.012, {
        tint: [0.55, 0.55, 0.52],
      });
    for (let y = BY + 0.1; y < BY + 2.6; y += 0.12)
      b.box("black_iron", 33.5, y, -31, 0.012, 0.012, 9.8, {
        tint: [0.55, 0.55, 0.52],
      });
    b.col(33.45, BY, -36, 33.55, BY + 2.6, -27.4, {
      tag: "fence",
      walkable: false,
    });
    b.plate(
      "art",
      33.44,
      BY + 2.2,
      -28,
      -1,
      0,
      1.4,
      0.3,
      K.signCell("pc_pd_ev_cage", "NARCOTICS · PILLS", 256, 48, {
        bg: "#e8d888",
        fg: "#1a1a1a",
      }),
    );
    b.boxMM("oak_panel", 20.5, BY, -26.2, 23.5, BY + 1.1, -25, {
      tint: [0.5, 0.36, 0.22],
    });
    b.col(20.5, BY, -26.2, 23.5, BY + 1.1, -25, { tag: "counter" });
    // property clerk's window: wire grille over the counter with a pass-through slot, bell, tagged evidence bags
    for (let x = 20.55; x < 23.5; x += 0.1)
      b.box("black_iron", x, BY + 1.35, -25.6, 0.01, 1.4, 0.01, {
        tint: [0.55, 0.55, 0.52],
      });
    for (let y = BY + 1.4; y < BY + 2.75; y += 0.1)
      b.box("black_iron", 22, y, -25.6, 3.0, 0.01, 0.01, {
        tint: [0.55, 0.55, 0.52],
      });
    b.boxMM("oak_panel", 20.5, BY + 1.1, -25.66, 23.5, BY + 1.35, -25.54, {
      tint: [0.45, 0.32, 0.2],
    });
    b.boxMM("oak_panel", 20.5, BY + 2.75, -25.7, 23.5, BY + 2.95, -25.5, {
      tint: [0.45, 0.32, 0.2],
    });
    b.col(20.5, BY + 1.1, -25.7, 23.5, BY + 2.95, -25.5, {
      tag: "fence",
      walkable: false,
    });
    b.plate(
      "art",
      22,
      BY + 2.85,
      -25.48,
      0,
      1,
      2.2,
      0.2,
      K.signCell(
        "pc_pd_propclerk",
        "PROPERTY CLERK · RING FOR SERVICE",
        384,
        36,
        { bg: "#22324a", fg: "#e8d888", weather: false },
      ),
    );
    b.cyl("brass", 22.9, BY + 1.1, -25.35, 0.06, 0.03, 0.06, 8, {
      tint: [0.6, 0.46, 0.24],
    });
    for (let k = 0; k < 5; k++) {
      const ex = 20.8 + r() * 1.6,
        ez = -25.9 + r() * 0.2;
      b.box("cloth_white", ex, BY + 1.1, ez, 0.22, 0.3, 0.12, {
        yaw: r() * 0.6,
        tint: [0.72, 0.58, 0.4],
      });
      b.plate(
        "art",
        ex,
        BY + 1.3,
        ez + 0.07,
        0,
        1,
        0.1,
        0.06,
        K.signCell("pc_pd_etag", "EVID.", 64, 36, {
          bg: "#e8c040",
          fg: "#1a1a1a",
          weather: false,
        }),
        { off: 0.004 },
      );
    }
    for (const x of [24, 32])
      K.lamp(
        b,
        x,
        BY + 2.9,
        -30,
        "tube",
        [0.9, 1, 0.9],
        x === 32 ? 0.3 : 0.6,
        7,
        { ceil: BY + 3.4, len: 1.4, lightOpts: { box: BB } },
      );
    // PISTOL RANGE (x −8..28, z −20..−13.4)
    K.room(
      b,
      ctx,
      Object.assign({}, bw, {
        x0: -8,
        z0: -20,
        x1: 28,
        z1: -13.4,
        wall: "concrete",
        wc: [0.5, 0.5, 0.47],
      }),
    );
    for (let k = 0; k < 5; k++) {
      const bz = -19.4 + k * 1.25;
      b.boxMM("wood_dark", -3.2, BY, bz, -2.9, BY + 1.8, bz + 0.12, {
        tint: [0.4, 0.3, 0.2],
      });
    }
    b.boxMM("wood_dark", -3.2, BY + 0.9, -19.8, -2.8, BY + 1.0, -13.6, {
      tint: [0.4, 0.3, 0.2],
    });
    b.col(-3.25, BY, -19.8, -2.75, BY + 1.0, -13.6, { tag: "counter" });
    for (let k = 0; k < 5; k++) {
      const tz = -19.2 + k * 1.3;
      b.pipe("steel", -3, BY + 2.9, tz, 27.5, BY + 2.9, tz, 0.012, 3);
      const tx = 12 + r() * 14;
      b.plate(
        "art",
        tx,
        BY + 1.7,
        tz,
        -1,
        0,
        0.6,
        0.9,
        K.signCell("pc_pd_target", "◎", 96, 144, {
          bg: "#e8dcc0",
          fg: "#1a1a1a",
          size: 90,
        }),
      );
      b.pipe("steel", tx, BY + 2.15, tz, tx, BY + 2.9, tz, 0.01, 3);
    }
    b.boxMM("rubble", 27.3, BY, -19.9, 27.95, BY + 3.4, -13.5, {
      tint: [0.4, 0.36, 0.3],
    });
    for (let k = 0; k < 30; k++)
      b.cyl(
        "brass",
        -2 + r() * 3,
        BY + 0.01,
        -19.5 + r() * 5.8,
        0.012,
        0.012,
        0.04,
        4,
        { tint: [0.7, 0.55, 0.3] },
      );
    K.lamp(b, 12, BY + 2.9, -16.7, "tube", [0.9, 1, 0.9], 0.5, 12, {
      ceil: BY + 3.4,
      len: 2.4,
      lightOpts: { box: BB },
    });
    b.light(-5, BY + 2.2, -16.7, WARM, 0.35, 5, { box: BB });

    ctx.intRoot = b.finish(null);
    ctx.intRoot.name = "poi_police_int";

    // ================= doors, anchors, loot, terminals =================
    const P = PC.POLICE;
    K.door(ctx, {
      id: "pc_pd_in",
      pos: V(160, P.LY + 1.3, P.LZ + 0.55),
      label: "Police Headquarters",
      verb: "Enter",
      target: { x: O.x, y: O.y, z: O.z - 2.2, yaw: 0 },
      onEnter: () => K.safe("disc", () => G.discover("police_hq")),
    });
    K.door(ctx, {
      id: "pc_pd_out",
      pos: V(O.x, O.y + 1.3, O.z - 0.3),
      label: "Worth Street",
      verb: "Leave",
      target: { x: 160, y: P.LY, z: P.LZ + 1.6, yaw: PI },
    });
    K.anchor(ctx, "entrance", 0, 0, -2.2);
    K.anchor(ctx, "rotunda", 0, 0, -9.5);
    K.anchor(ctx, "office", 0, GAL, -28);
    K.anchor(ctx, "pike", 19.2, 0, -10.8);
    K.anchor(ctx, "cells", 20, 0, -15);
    K.anchor(ctx, "armory", 11, BY, -30);
    K.anchor(ctx, "evidence", 27, BY, -27);
    K.anchor(ctx, "boss", 13, BY, -22);
    K.anchor(ctx, "patrol_a", 4, 0, -19);
    K.anchor(ctx, "patrol_b", -4, 0, -11);
    [
      [5.5, 0, -12],
      [21, 0, -15],
      [-18, 0, -21],
      [26, BY, -22],
      [14, BY, -17],
      [28, BY, -31],
    ].forEach((p, i) => K.anchor(ctx, "spawn" + (i + 1), p[0], p[1], p[2]));
    // loot
    K.loot(ctx, "file_cabinet", -29.4, 0, -24.8, HP, { loot: "file_cabinet" });
    K.loot(ctx, "file_cabinet", -29.4, 0, -23.8, HP, { loot: "file_cabinet" });
    K.loot(ctx, "locker", -14, 0, -25.6, 0, { loot: "locker", count: 3 });
    K.loot(ctx, "desk", -27.5, 0, -24.4, 0, {
      loot: "desk",
      name: "Sergeant's Desk",
      items: [["pc_pd_cellkey", 1]],
    });
    K.loot(ctx, "first_aid", 11.88, 1.4, -18.2, -HP, {
      loot: "first_aid",
      wall: true,
    }); // on cell N-1's partition (it used to float in the corridor)
    K.loot(ctx, "footlocker", 9.4, 0, -10, HP, {
      loot: "footlocker",
      name: "Guard Footlocker",
      items: [["scrap_metal", 5]],
    });
    K.loot(ctx, "safe", 6.4, GAL, -33.2, -HP, {
      loot: "wall_safe",
      name: "Commissioner's Safe",
      lock: K.regLock({
        id: "pc_lk_pd_comm_safe",
        label: "Commissioner's Safe",
        kind: "safe",
        code: "1845",
        hint: "The Commissioner's personal log on his command terminal gives the combination.",
      }),
      items: [
        ["pc_pd_armory_key", 1],
        ["old_dollars", 4],
      ],
    });
    K.loot(ctx, "desk", -3.8, GAL, -25.4, 0, {
      loot: "desk",
      name: "Aide's Desk",
    });
    K.loot(ctx, "ammo_box", 6, BY, -35.2, 0, { loot: "ammo_box", large: true });
    K.loot(ctx, "ammo_box", 9.6, BY + 0.9, -29.5, 0.2, { loot: "ammo_box" });
    K.loot(ctx, "footlocker", 15.8, BY, -35.2, 0, {
      name: "Riot Gear Locker",
      items: [
        ["riot_police_armor", 1],
        ["riot_police_helmet", 1],
        ["rally_tonic", 2],
      ],
    });
    K.loot(ctx, "locker", 17.2, BY, -25.2, -HP, {
      name: "Shotgun Locker",
      items: [
        ["combat_shotgun", 1],
        ["ammo_12ga", 24],
      ],
      count: 2,
    });
    K.loot(ctx, "footlocker", 35.8, BY, -34.8, PI, {
      name: "Narcotics Evidence",
      lock: K.regLock({
        id: "pc_lk_pd_narcotics",
        label: "Narcotics Evidence",
        kind: "container",
        code: "0923",
        hint: "The Property Clerk's evidence index lists the cage combination.",
      }),
      items: [
        ["rush", 2],
        ["rage", 1],
        ["bull_tabs", 1],
        ["morphine_syrette", 1],
      ],
    });
    K.loot(ctx, "file_cabinet", 21, BY, -27.6, HP, {
      loot: "file_cabinet",
      name: "Property Clerk Files",
    });
    K.loot(ctx, "footlocker", 30, BY, -35.2, 0, {
      name: "Evidence Box #7741",
      items: [
        ["magnum_44", 1],
        ["ammo_44", 12],
      ],
    });
    K.loot(ctx, "first_aid", -9.8, BY + 1.4, -21, HP, {
      loot: "first_aid",
      wall: true,
    });
    K.loot(ctx, "toolbox", 1.4, BY, -25.2, PI, { loot: "toolbox" });
    K.skel(ctx, 25, BY, -31.8, 1.2, "reaching");
    K.skel(ctx, -1.8, BY, -16, 0.4, "lying");
    // notes
    K.note(ctx, "pc_pd_note_password", 36.6, BY + 0.9, -30.4, {
      type: "note",
      name: "Commissioner's Passcode",
      learn: "pc_lk_pd_term_comm",
      title: "Evidence tag #7790 — desk blotter (Commissioner's office)",
      text: 'EVIDENCE TAG #7790\nItem: 1 desk blotter, green leather, property of the Office of the Commissioner.\nReason held: "Internal matter."\n\nWritten along the edge of the blotter in fountain pen, then scratched out and written again, larger:\n\n    TELETYPE  —  "FINEST"\n\n(The Property Clerk\'s note beneath: "Sir, respectfully, you cannot keep your passcode on your desk. — Sgt. D. Brennan")',
    });
    K.note(ctx, "pc_pd_reel_brennan", 22.4, BY + 1.12, -25.6, {
      type: "tape",
      name: "Tape reel: Sgt. Brennan",
      learn: "pc_lk_pd_term_evid",
      title: "Property Clerk — Sgt. Dolores Brennan, 03/05/1967",
      text: "(tape hiss; a klaxon somewhere above)\n\nSergeant Brennan, Property. It's oh-nine-forty, Sunday. The sirens started ten minutes ago, and the Commissioner just came down in his pajamas and his hat and signed Directive 67-C on my counter. Citywide curfew, Patrolman enforcement, no expiry date. I asked him \"no expiry?\" and he said \"Until further notice, Dolores.\"\n\nThe Patrolmen are locking everybody out. Everybody. They put Patrolman Orlov in a cell for being out after nine. It's nine-forty in the MORNING.\n\nThe override's on the Commissioner's terminal upstairs. I've got his passcode in evidence, God help me — tag 7790, look it up on my index, the index answers to HOLDFAST. If anybody hears this — lift the curfew. They'll never stop otherwise. They're very... dedicated.",
    });
    K.note(ctx, "pc_pd_note_ruiz", 13.6, 0.6, -20.4, {
      type: "note",
      name: "Scratched Note",
      title: "Scratched into the wall of cell N-1, copied onto a ration card",
      text: "PTL. A. RUIZ, SHIELD 4471.\nDAY 1: told it I am a police officer. it said \"CITIZEN, THAT IS WHAT A CRIMINAL WOULD SAY.\"\nDAY 2: water through the slot. crackers.\nDAY 3: no more sirens. no more anything.\nDAY 9: it still says good night.\nDAY ??: the key is in the SERGEANT'S DESK. the key is ALWAYS in the sergeant's desk. if you read this and you are human: bullpen, west wing.",
    });
    K.note(ctx, "pc_pd_note_memo", -26.8, 0.8, -8.6, {
      type: "note",
      name: "Ardent Robotics Deployment Memo",
      title: "MEMO — Ardent Robotics, Municipal Contracts Division",
      text: 'TO: All Precinct Commanders\nRE: Patrolman Police Model P-7 ("PATROLMAN") — field notes\n\n1. Patrolmen will enforce any active directive until it is formally rescinded from a command terminal. They do not recognise verbal orders, hand signals, badges, uniforms, or "come on, it\'s me, Frank."\n2. A Patrolman cannot be bribed. Please stop trying.\n3. Patrolmen cannot distinguish between a suspect and a mannequin. Department stores have been advised.\n4. The Bulwark unit (sentry class) assigned to Headquarters basement is NOT to be used for crowd control, parades, or the Christmas party.\n\nThank you for choosing Ardent. Protecting New York, one citizen at a time.',
    });
    // terminals (definitions: 80_content.js provides the actions through PC.pd)
    const pd = () => PC.pd || {};
    K.terminal(
      ctx,
      "pc_pd_term_desk",
      ctx.muster.x + 0.6,
      1.31,
      ctx.muster.z + 2.3,
      PI,
      {
        title: "NYPD PRECINCT NETWORK — MUSTER DESK",
        header: "CITY OF NEW YORK · POLICE HEADQUARTERS · 240 CENTRE ST",
        entries: [
          {
            title: "Duty Roster — 03/05/1967",
            text: 'DAY TOUR: 212 officers scheduled.\nREPORTED FOR DUTY: 9\nPATROLMAN UNITS ON PATROL: 4,112\n\nNote from the Desk Sergeant: "Where is everybody?"\nNote from the Desk Sergeant, 11:02: "Oh."',
          },
          {
            title: "Directive 67-C (summary)",
            text: "CITYWIDE CURFEW IN EFFECT. All citizens must remain in their homes or assigned shelters.\nPATROLMAN ENFORCEMENT AUTHORIZED. Violators will be detained.\nThis directive can only be rescinded from the COMMAND TERMINAL, Office of the Commissioner (gallery level).",
          },
          {
            title: "Citizen Complaint #88213",
            text: 'COMPLAINANT: Mrs. E. Van Dusen, Park Ave.\nCOMPLAINT: "There is a large grey man in the lobby of my building eating the doorman."\nACTION TAKEN: Patrolman dispatched. Mrs. Van Dusen detained for curfew violation.\nSTATUS: Resolved.',
          },
          {
            title: "Cell Block Status",
            text: () =>
              "HOLDING CELLS: 12\nOCCUPIED: " +
              (PC.flag("pd_pike_free") ? "0" : "1") +
              "\nCELL S-3: PIKE, EZRA — CURFEW VIOLATION — DETAINED 3 DAYS\n\n(Cell doors are controlled from the Cell Block terminal, east wing guard station.)",
          },
          {
            title: "Guard Station Memo — 3/2",
            learn: "pc_lk_pd_term_cells",
            text: 'FROM: Desk Sergeant\nTO: East Wing guard station\n\nCell Block terminal passcode changed for the month. New passcode: TURNKEY.\nIt is NOT "password". It was never "password". Stop typing "password".',
          },
        ],
      },
      "bare",
    );
    K.terminal(
      ctx,
      "pc_pd_term_cells",
      10.5,
      1.1,
      -20.0,
      PI,
      {
        title: "CELL BLOCK CONTROL — EAST WING",
        header: "ARDENT DETENTION SYSTEMS v2.3",
        lock: {
          id: "pc_lk_pd_term_cells",
          passcode: "TURNKEY",
          hint: "The muster desk terminal posts the guard-station passcode.",
        },
        entries: [
          {
            title: "Detainee List",
            text: "N-1: RUIZ, A. (PTL.) — CURFEW — STATUS: UNRESPONSIVE (DAY 8,040)\nN-4: VACANT\nS-3: PIKE, EZRA — CURFEW — STATUS: VERY RESPONSIVE\nS-6: VAN DUSEN, E. — CURFEW — STATUS: UNRESPONSIVE",
          },
          {
            title: "Release Cell S-3",
            cond: () => !PC.flag("pd_pike_free"),
            text: "Cell S-3 door released.",
            action: () => {
              K.gateOpen(ctx, "pike");
              if (pd().pikeReleased) pd().pikeReleased();
            },
          },
        ],
      },
      "bare",
    );
    K.terminal(
      ctx,
      "pc_pd_term_comm",
      1.1,
      GAL + 0.8,
      -29.4,
      PI,
      {
        title: "OFFICE OF THE COMMISSIONER — COMMAND TERMINAL",
        header: "NYPD COMMAND NETWORK · AUTHORIZED USERS ONLY",
        lock: {
          id: "pc_lk_pd_term_comm",
          passcode: "FINEST",
          hint: "Evidence tag #7790 in the basement lockup: the Commissioner wrote his passcode on his blotter.",
        },
        entries: [
          {
            title: "Personal Log — 3/5",
            text: "I signed it. Brennan looked at me like I'd shot her dog. What was I supposed to do — let the city tear itself apart in the streets? The robots will keep people inside. Inside is where you live.\n\nThey're saying the bombers are already over the coast. Bombers, coming in off the Atlantic. Moscow, I suppose. Who else would it be.\n\nWell. At least nobody will be out after curfew.\n\n(Reminder to self, for the hundredth time: the wall safe is the year the Department was founded. 1-8-4-5. Dolores says I should not write that down either.)",
            learn: "pc_lk_pd_comm_safe",
          },
          {
            title: "Patrolman Command: Directive 67-C",
            text: () =>
              PC.flag("pd_curfew_lifted")
                ? "DIRECTIVE 67-C: RESCINDED. All Patrolman units returned to COMMUNITY RELATIONS mode."
                : "DIRECTIVE 67-C: ACTIVE (day 8,040).\nUnits enforcing: 4,112 (estimated operational: 38).",
          },
          {
            title: ">> RESCIND DIRECTIVE 67-C (LIFT CURFEW)",
            cond: () => !PC.flag("pd_curfew_lifted"),
            text: 'DIRECTIVE 67-C RESCINDED.\nBroadcasting to all units...\n\n"THE CURFEW HAS BEEN LIFTED. HAVE A NICE DAY, CITIZEN."',
            action: () => {
              if (pd().liftCurfew) pd().liftCurfew();
            },
          },
          {
            title: ">> Release Armory Lock",
            cond: () => !PC.flag("pd_armory_open"),
            text: "ARMORY CAGE: UNLOCKED.",
            action: () => K.gateOpen(ctx, "armory"),
          },
        ],
      },
      "bare",
    );
    K.terminal(
      ctx,
      "pc_pd_term_evid",
      22,
      BY + 1.1,
      -25.6,
      0,
      {
        title: "PROPERTY CLERK — EVIDENCE INDEX",
        header: "NYPD PROPERTY CLERK DIVISION",
        lock: {
          id: "pc_lk_pd_term_evid",
          passcode: "HOLDFAST",
          hint: "Sgt. Brennan's tape reel at the property counter mentions her index passcode.",
        },
        entries: [
          {
            title: "Recent Intake",
            text: '#7741  .44 revolver, "Dirty" — seized from a very angry detective\n#7752  1 crate Fizzo Blue (EMPTY — clerk\'s note: "who?")\n#7768  Tape reel, "Super Sergeant and the Kremlin Robot" (confiscated from the Commissioner\'s nephew)\n#7790  1 desk blotter, Office of the Commissioner. HOLD. DO NOT RETURN. SERIOUSLY.',
          },
          {
            title: "Narcotics Cage",
            learn: "pc_lk_pd_narcotics",
            text: "Combination padlock. Combination reset 3/2 to 0-9-2-3 by Sgt. D. Brennan.\n(Combination is NOT to be shared with the Commissioner's nephew.)",
          },
        ],
      },
      "bare",
    );
    // gate on Mott's cell (door section of cell S-3)
    const pc = ctx.pikeCell;
    K.gate(ctx, {
      id: "pike",
      flag: "pd_pike_free",
      label: "Cell S-3",
      x: pc.x0 + 1.5,
      z: pc.zf,
      w: 1.2,
      axis: "x",
      y0: 0,
      h: 2.5,
      lock: {
        id: "pc_lk_pd_cell_s3",
        key: "pc_pd_cellkey",
        hint: "The cell key is in the Sergeant's Desk in the west-wing bullpen; the Cell Block terminal also releases S-3.",
      },
      style: "bars",
      onOpen: () => {
        if (pd().pikeReleased) pd().pikeReleased();
      },
    });
    // locks: cell S-3 — cell key (Sergeant's Desk) or the Cell Block terminal (passcode TURNKEY on the muster desk terminal);
    // the Commissioner's safe (code 1845, in his own terminal log) holds the armory key; the armory also opens from the
    // command terminal (passcode FINEST, evidence tag #7790 in the lockup), so either route reaches the reward.
    // ---- traps (08_traps.js) ----
    // boiler room: the gas main sheared when the boiler shifted; a looter lit up. Fire a gun in here and it goes.
    K.trap(ctx, {
      id: "pd_gas",
      kind: "gas",
      pos: [-3.6, BY, -27.4],
      r: 4.6,
      ceil: 3.35,
      valve: [-9.86, BY + 1.35, -27.4],
      valveYaw: HP,
    });
    K.skel(ctx, -4.6, BY, -26.2, 2.2, "lying");
    K.note(ctx, "pc_pd_note_gas", -4.1, BY + 0.02, -25.7, {
      type: "note",
      name: "Maintenance Ticket #1182",
      title: "NYPD Facilities — Maintenance Ticket #1182 (URGENT)",
      text: 'LOCATION: Basement, boiler & records.\nPROBLEM: Gas main sheared behind boiler #2 when the building shook.\nSMELL: Yes.\nACTION: Shut-off valve is on the WEST WALL (red wheel). DO NOT fire weapons, strike matches or use the range until the valve is closed.\n\nFiled 03/05/1967 09:52 by Custodian M. Kowalski.\n\n(Beneath, in pencil, a different hand: "valve stuck. will get wrench. anybody got a light")',
    });
    // evidence lockup doorway: a looter's tripwire and a bouquet of evidence-room frag grenades
    K.trap(ctx, {
      id: "pd_trip",
      kind: "tripwire",
      a: [28.16, BY + 0.22, -24.5],
      c: [29.84, BY + 0.22, -24.5],
      bouquet: [27.8, BY, -24.62],
    });
    K.note(ctx, "pc_pd_note_trap", 25.5, BY + 0.03, -31.1, {
      type: "note",
      name: "Looter's Note",
      title: "Torn from a notebook",
      text: "Day 2 in the evidence room. Rigged the door with the grenades from shelf C so the tin cans can't follow me in.\n\nDay 3. They don't come in anyway. They just stand at the door and say \"CITIZEN, PLEASE EXIT THE RESTRICTED AREA.\" All night.\n\nDay 4. I can't get out past my own tripwire in the dark. Forgot which side the wire is. Stupid stupid stupid.\n\nDay 5. There's a whole case of Rush in the narcotics cage and I don't have the combination. There are worse ways to go. This is one of them.",
    });
    // pistol range: a live frag mine somebody left down-range
    K.trap(ctx, { id: "pd_mine", kind: "mine", pos: [9.5, BY, -16.2] });
  }

  // ------------------------------------------------------------------ NPCs (interior)
