// play-inline-384 04 — math
// Lines 602-787 of readable/play-inline-384.pretty.js (statement-aligned).
  K.medallion = function (kind, size) {
    size = size || 512;
    return K.paint(
      "art",
      "ppn_medal_" + kind,
      size,
      size,
      function (x, X, Y, W, H) {
        x.clearRect(X, Y, W, H);
        const cx = X + W / 2,
          cy = Y + H / 2,
          R = W * 0.48;
        if (kind === "star") {
          x.fillStyle = "#4a4238";
          x.beginPath();
          x.arc(cx, cy, R, 0, PI * 2);
          x.fill();
          x.fillStyle = "#d8d0bc";
          x.beginPath();
          x.arc(cx, cy, R * 0.94, 0, PI * 2);
          x.fill();
          x.fillStyle = "#6a5a3e";
          x.beginPath();
          x.arc(cx, cy, R * 0.9, 0, PI * 2);
          x.fill();
          for (let k = 0; k < 16; k++) {
            const a = (k * PI) / 8,
              long = k % 2 === 0,
              rr = long ? R * 0.88 : R * 0.6;
            x.fillStyle =
              k % 4 === 0 ? "#e8e0cc" : long ? "#b8ac92" : "#8a7c62";
            x.beginPath();
            x.moveTo(cx, cy);
            x.lineTo(
              cx + Math.cos(a - 0.09) * rr * 0.3,
              cy + Math.sin(a - 0.09) * rr * 0.3,
            );
            x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
            x.lineTo(
              cx + Math.cos(a + 0.09) * rr * 0.3,
              cy + Math.sin(a + 0.09) * rr * 0.3,
            );
            x.closePath();
            x.fill();
          }
          x.fillStyle = "#23305a";
          x.beginPath();
          x.arc(cx, cy, R * 0.14, 0, PI * 2);
          x.fill();
          x.fillStyle = "#e8e0cc";
          for (let k = 0; k < 13; k++) {
            const a = (k / 13) * PI * 2;
            x.beginPath();
            x.arc(
              cx + Math.cos(a) * R * 0.09,
              cy + Math.sin(a) * R * 0.09,
              3,
              0,
              PI * 2,
            );
            x.fill();
          }
          x.font = "bold " + Math.round(R * 0.07) + "px Georgia, serif";
          x.fillStyle = "#3a3226";
          x.textAlign = "center";
          x.fillText("FEDERAL HALL · 1789", cx, cy + R * 0.97 - R * 0.12);
        } else {
          x.fillStyle = "#6a5a38";
          x.beginPath();
          x.arc(cx, cy, R, 0, PI * 2);
          x.fill();
          x.fillStyle = "#c8b27a";
          x.beginPath();
          x.arc(cx, cy, R * 0.9, 0, PI * 2);
          x.fill();
          x.fillStyle = "#6a5a38";
          x.font = "bold " + Math.round(R * 0.5) + "px Georgia, serif";
          x.textAlign = "center";
          x.textBaseline = "middle";
          x.fillText(kind === "bt" ? "BT" : "D", cx, cy);
          x.font = "bold " + Math.round(R * 0.09) + "px Georgia, serif";
          x.fillText(
            kind === "bt"
              ? "BANKERS TRUST COMPANY · 1903"
              : "DELMONICO'S · 1837",
            cx,
            cy + R * 0.7,
          );
        }
        K.stains(x, X, Y, W, H, 10, 90 + kind.length, 0.4, [40, 30, 20]);
        K.grain(x, X, Y, W, H, 25, 91);
      },
    );
  };

  // ------------------------------------------------------------------
  // Level-flow & set-dressing helpers (revision 2)
  // ------------------------------------------------------------------
  /**
   * One-way shortcut (a door barred from the other side). o: {flag, radius,
   *   open:{pos (world), label, verb, target{x,y,z,yaw}, msg}  — the side that unbars it (deep in the level)
   *   barred:{pos, label, verb, target}                        — the side near the entrance (locked until flag)}
   */
  K.oneWay = function (ctx, o) {
    const go = (t, label) =>
      K.safe("oneway", () => {
        K.sfx(o.sound || "door_open", null);
        G.fadeTransition(() => {
          G.player.teleport(t.x, t.y, t.z, t.yaw || 0);
          G.events.emit("doorTransition", { id: o.flag, label, target: t });
        });
      });
    ctx.interactables.push(
      G.world.addInteractable({
        pos: o.open.pos,
        radius: o.radius || 1.1,
        label: o.open.label,
        verb: o.open.verb || "Open",
        priority: 1,
        onInteract: () => {
          if (!PV.flag(o.flag)) {
            PV.setFlag(o.flag, true);
            if (o.open.msg) K.notify(o.open.msg);
          }
          go(o.open.target, o.open.label);
        },
      }),
    );
    ctx.interactables.push(
      G.world.addInteractable({
        pos: o.barred.pos,
        radius: o.radius || 1.1,
        label: o.barred.label,
        verb: o.barred.verb || "Open",
        priority: 1,
        locked: () => (PV.flag(o.flag) ? null : "Barred from the other side"),
        onInteract: () => {
          if (!PV.flag(o.flag)) {
            K.sfx("door_locked", null);
            K.notify(o.barred.msg || "It is barred from the other side.");
            return;
          }
          go(o.barred.target, o.barred.label);
        },
      }),
    );
  };

  /**
   * Vertical ring collar (steel frame round a strongroom opening): RingGeometry r0..r1 in a wall plane.
   * (x,y,z) centre, facing (nx,nz) — one of the axes.
   */
  K.ringCollar = function (b, mat, x, y, z, nx, nz, r0, r1, o) {
    o = o || {};
    const ry = Math.atan2(nx, nz);
    b.geo(mat, new THREE.RingGeometry(r0, r1, o.seg || 32, 1), {
      x,
      y,
      z,
      ry,
      tint: o.tint,
      grime: o.grime,
    });
    // bolt heads on the collar
    if (o.bolts)
      for (let k = 0; k < o.bolts; k++) {
        const a = (k / o.bolts) * PI * 2,
          rr = (r0 + r1) / 2,
          ux = nz,
          uz = -nx;
        b.geo(mat, K.sphereGeo(), {
          x: x + ux * Math.cos(a) * rr + nx * 0.02,
          y: y + Math.sin(a) * rr,
          z: z + uz * Math.cos(a) * rr + nz * 0.02,
          s: 0.05,
          tint: o.tint,
        });
      }
  };

  /**
   * Room set-dressing: dense post-Bombing clutter scattered over a floor rect (merged geometry, no colliders
   * except the few big pieces, which stay low). o: {n, seed, kinds[], avoid:[[x0,z0,x1,z1]…], office, tint}
   *   kinds: 'chair' fallen chairs · 'paper' paper drifts · 'box' file boxes · 'panel' fallen ceiling tiles ·
   *          'debris' plaster piles · 'glass' broken glass · 'can' cans & bottles · 'books' book heaps
   */
