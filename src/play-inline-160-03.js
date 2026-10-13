// play-inline-160 03 — floory
// Lines 185-416 of readable/play-inline-160.pretty.js (statement-aligned).
  function buildTrapMeshes(t, root) {
    const mk = () => {
      const b = new P.Batch("trap_" + t.id, { grime: 0.4, ao: 0.2 });
      b.ground = t.floorY;
      b.aoH = 0.6;
      return b;
    };
    const armed = mk();
    const a = t.a,
      c = t.c,
      V = (x, y, z) => new THREE.Vector3(x, y, z);
    if (t.kind === "tripwire" || t.kind === "shotgun" || t.kind === "chime") {
      armed.rod("chrome", [a.x, a.y, a.z], [c.x, c.y, c.z], 0.009, 3, {
        noAO: true,
        grime: 0,
      });
      for (const p of [a, c])
        armed.cyl(
          "rust",
          p.x,
          t.floorY,
          p.z,
          0.012,
          0.02,
          p.y - t.floorY + 0.07,
          4,
        ); // stakes / eye screws
      if (t.kind === "tripwire") {
        const q = t.bouquet;
        for (let k = 0; k < 3; k++) {
          // three frags taped to the stake
          const gx = q.x + Math.cos(k * 2.1) * 0.075,
            gz = q.z + Math.sin(k * 2.1) * 0.075;
          armed.sphere("paint_green", gx, q.y + 0.06, gz, 0.05, {
            ws: 7,
            hs: 5,
            sy: 1.25,
            noAO: true,
          });
          armed.cyl("steel", gx, q.y + 0.12, gz, 0.014, 0.014, 0.035, 5);
          armed.torus("steel", gx + 0.02, q.y + 0.15, gz, 0.018, 0.004, TAU, {
            ts: 8,
            rs: 3,
          });
        }
        armed.cyl("rubber", q.x, q.y + 0.03, q.z, 0.1, 0.1, 0.05, 8, {
          open: true,
        }); // tape
      } else if (t.kind === "chime") {
        const n = 7;
        for (let k = 1; k < n; k++) {
          const p = a.clone().lerp(c, k / n);
          p.y -= 0.1 + Math.sin((k / n) * PI) * 0.04;
          armed.cyl(
            k % 2 ? "rust" : "chrome",
            p.x,
            p.y - 0.05,
            p.z,
            0.035,
            0.035,
            0.1,
            7,
            { rz: ((k % 3) - 1) * 0.25 },
          );
          armed.rod(
            "steel",
            [p.x, p.y + 0.05, p.z],
            [p.x, p.y + 0.1, p.z],
            0.003,
            3,
            { noAO: true },
          );
        }
      }
    } else if (t.kind === "beartrap") {
      const p = t.pos;
      const jaws = (bb, open) => {
        bb.cyl("rust", p.x, t.floorY + 0.005, p.z, 0.22, 0.22, 0.02, 12);
        bb.cyl("iron", p.x, t.floorY + 0.02, p.z, 0.05, 0.05, 0.03, 8);
        for (const sg of [-1, 1]) {
          if (open)
            bb.torus(
              "rust",
              p.x,
              t.floorY + 0.02,
              p.z + sg * 0.01,
              0.22,
              0.013,
              PI,
              { rx: -HP, ry: sg > 0 ? 0 : PI, ts: 12, rs: 4 },
            );
          else
            bb.torus("rust", p.x, t.floorY + 0.02, p.z, 0.2, 0.013, PI, {
              rx: sg * 0.25,
              ts: 12,
              rs: 4,
            });
          for (let k = 1; k < 8; k++) {
            const aa = (k / 8) * PI,
              lx = Math.cos(aa) * 0.21;
            if (open)
              bb.cyl(
                "rust",
                p.x + lx,
                t.floorY + 0.02,
                p.z + sg * (0.02 + Math.sin(aa) * 0.21),
                0.001,
                0.012,
                0.05,
                3,
                { rx: sg * HP },
              );
            else
              bb.cyl(
                "rust",
                p.x + lx,
                t.floorY + 0.02 + Math.sin(aa) * 0.19,
                p.z + sg * 0.03,
                0.001,
                0.012,
                0.05,
                3,
                { rx: -sg * 0.3 },
              );
          }
        }
        bb.rod(
          "iron",
          [p.x + 0.22, t.floorY + 0.01, p.z],
          [p.x + 0.6, t.floorY + 0.01, p.z + 0.25],
          0.007,
          3,
          { noAO: true },
        ); // chain
        bb.cyl("iron", p.x + 0.6, t.floorY, p.z + 0.25, 0.02, 0.03, 0.12, 5); // stake
      };
      jaws(armed, true);
      const sprung = mk();
      jaws(sprung, false);
      t.gSprung = sprung.build(root);
    } else if (t.kind === "mine") {
      const p = t.pos;
      armed.cyl("paint_green", p.x, t.floorY, p.z, 0.16, 0.18, 0.07, 14);
      armed.cyl("steel", p.x, t.floorY + 0.07, p.z, 0.07, 0.09, 0.03, 10);
      armed.cyl("rubber", p.x, t.floorY + 0.1, p.z, 0.02, 0.02, 0.025, 6);
      for (let k = 0; k < 6; k++) {
        const aa = (k / 6) * TAU;
        armed.box(
          "steel",
          p.x + Math.cos(aa) * 0.17 - 0.012,
          t.floorY + 0.01,
          p.z + Math.sin(aa) * 0.17 - 0.012,
          p.x + Math.cos(aa) * 0.17 + 0.012,
          t.floorY + 0.055,
          p.z + Math.sin(aa) * 0.17 + 0.012,
          { seg: false },
        );
      }
      // blinking arming light (own unlit mesh so it can blink)
      const led = new THREE.Mesh(
        new THREE.SphereGeometry(0.018, 6, 4),
        new THREE.MeshBasicMaterial({ color: 0xff2a1a }),
      );
      led.position.set(p.x + 0.045, t.floorY + 0.1, p.z);
      led.name = "pu_mine_led";
      root.add(led);
      t.led = led;
    }
    t.gArmed = armed.build(root);
    if (t.kind === "shotgun") {
      // the gun: a kitchen chair with a sawed-off lashed to its back, string to the trigger
      const gb = mk(),
        g = t.gun,
        d = t.gunDir,
        yaw = Math.atan2(d.x, d.z);
      const R = (lx, ly, lz) => {
        const s = Math.sin(yaw),
          co = Math.cos(yaw);
        return [g.x + lx * co + lz * s, ly, g.z - lx * s + lz * co];
      };
      const bx = (key, cx, y0, cz, w, h, dd) => {
        const q = R(cx, 0, cz);
        gb.boxC(key, q[0], y0, q[2], w, h, dd, { ry: yaw, seg: false });
      };
      const y0 = t.floorY;
      for (const [lx, lz] of [
        [-0.2, -0.2],
        [0.2, -0.2],
        [-0.2, 0.2],
        [0.2, 0.2],
      ])
        bx("wood_dark", lx, y0, lz, 0.04, 0.45, 0.04);
      bx("wood_dark", 0, y0 + 0.45, 0, 0.46, 0.04, 0.46);
      bx("wood_dark", 0, y0 + 0.49, -0.21, 0.44, 0.45, 0.04); // back rest
      const m0 = R(-0.028, 0, -0.2),
        m1 = R(-0.028, 0, 0.55),
        s0 = R(0.028, 0, -0.2),
        s1 = R(0.028, 0, 0.55);
      gb.rod(
        "paint_black",
        [m0[0], y0 + 0.72, m0[2]],
        [m1[0], y0 + 0.72, m1[2]],
        0.024,
        7,
      ); // twin barrels
      gb.rod(
        "paint_black",
        [s0[0], y0 + 0.72, s0[2]],
        [s1[0], y0 + 0.72, s1[2]],
        0.024,
        7,
      );
      bx("wood", 0, y0 + 0.66, 0.3, 0.1, 0.06, 0.3); // fore-end
      bx("wood", 0, y0 + 0.62, -0.32, 0.07, 0.12, 0.26); // cut-down stock
      bx("rubber", 0, y0 + 0.55, -0.2, 0.47, 0.06, 0.05); // lashing
      const tr = R(0, 0, -0.14);
      gb.rod(
        "steel",
        [tr[0], y0 + 0.64, tr[2]],
        [t.mid.x, t.floorY + 0.12, t.mid.z],
        0.003,
        3,
        { noAO: true },
      ); // trigger string
      t.gGun = gb.build(root);
    }
  }

  /**
   * def: {id, cell, kind, a/c (local wire ends, y = local floor), pos (local point kinds), bouquet (local), gun (local) + gunAt (local aim point), dmg, spot}
   * Built at initDone (colliders exist → validated).
   */
