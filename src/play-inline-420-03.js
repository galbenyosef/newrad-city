// play-inline-420 03 — flag
// Lines 369-547 of readable/play-inline-420.pretty.js (statement-aligned).
  K.flagCell = function (kind, w, h) {
    w = w || 256;
    h = h || 160;
    return K.paint("art", "ph2_flag_" + kind, w, h, function (x, X, Y, W, H) {
      x.clearRect(X, Y, W, H);
      x.save();
      if (kind === "us_upside") {
        x.translate(X + W / 2, Y + H / 2);
        x.rotate(PI);
        x.translate(-(X + W / 2), -(Y + H / 2));
      }
      if (kind === "raider") {
        x.fillStyle = "#6e1e16";
        x.fillRect(X, Y, W, H);
        x.fillStyle = "#e8dcc0";
        x.font =
          "bold " + Math.round(H * 0.2) + "px Impact, Arial Black, sans-serif";
        x.textAlign = "center";
        x.textBaseline = "middle";
        x.fillText("THE CONGRESS", X + W / 2, Y + H * 0.18, W * 0.9);
        // skull with a tricorn hat
        const cx = X + W / 2,
          cy = Y + H * 0.58;
        x.beginPath();
        x.arc(cx, cy, H * 0.17, 0, PI * 2);
        x.fill();
        x.fillRect(cx - H * 0.09, cy + H * 0.1, H * 0.18, H * 0.12);
        x.fillStyle = "#6e1e16";
        x.beginPath();
        x.arc(cx - H * 0.065, cy, H * 0.045, 0, PI * 2);
        x.arc(cx + H * 0.065, cy, H * 0.045, 0, PI * 2);
        x.fill();
        x.fillStyle = "#1a1410";
        x.beginPath();
        x.moveTo(cx - H * 0.28, cy - H * 0.1);
        x.lineTo(cx, cy - H * 0.32);
        x.lineTo(cx + H * 0.28, cy - H * 0.1);
        x.closePath();
        x.fill();
        x.fillStyle = "#e8dcc0";
        x.font =
          "bold " + Math.round(H * 0.11) + "px Impact, Arial Black, sans-serif";
        x.fillText("IN SESSION", X + W / 2, Y + H * 0.9, W * 0.8);
      } else {
        const sh = H / 13;
        for (let i = 0; i < 13; i++) {
          x.fillStyle = i % 2 ? "#e4dccb" : "#8e2a22";
          x.fillRect(X, Y + i * sh, W, sh + 0.5);
        }
        x.fillStyle = "#23305a";
        x.fillRect(X, Y, W * 0.4, sh * 7);
        x.fillStyle = "#e4dccb";
        for (let j = 0; j < 9; j++)
          for (let i = 0; i < (j % 2 ? 5 : 6); i++) {
            x.beginPath();
            x.arc(
              X + W * 0.4 * ((i + (j % 2 ? 1 : 0.5)) / 6.2),
              Y + sh * 7 * ((j + 0.7) / 9.6),
              1.8,
              0,
              PI * 2,
            );
            x.fill();
          }
      }
      x.restore();
      // grime + burn holes + frayed fly end
      K.stains(x, X, Y, W, H, 10, 7 + kind.length, 0.5, [40, 30, 20]);
      const r = K.rng("flag" + kind);
      x.globalCompositeOperation = "destination-out";
      for (let k = 0; k < 9; k++) {
        x.beginPath();
        x.arc(X + W * (0.2 + r() * 0.8), Y + r() * H, 3 + r() * 12, 0, PI * 2);
        x.fill();
      }
      for (let k = 0; k < 14; k++) {
        const yy = Y + r() * H;
        x.beginPath();
        x.moveTo(X + W, yy);
        x.lineTo(X + W - 10 - r() * 40, yy + 4);
        x.lineTo(X + W, yy + 10);
        x.fill();
      }
      x.globalCompositeOperation = "source-over";
    });
  };

  /** Round floor medallion (compass star / eagle seal) with alpha. */
  // ------------------------------------------------------------------
  // Level-flow & set-dressing helpers (revision 2)
  // ------------------------------------------------------------------
  /**
   * One-way shortcut (the classic "barred from the other side" door). o: {flag, radius,
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
   * Vertical ring collar (steel frame round an arched opening): RingGeometry r0..r1 in a wall plane.
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
   * Room set-dressing: dense ruin-style clutter scattered over a floor rect (merged geometry, no colliders
   * except the few big pieces, which stay low). o: {n, seed, kinds[], avoid:[[x0,z0,x1,z1]…], office, tint}
   *   kinds: 'chair' fallen chairs · 'paper' paper drifts · 'box' file boxes · 'panel' fallen ceiling tiles ·
   *          'debris' plaster piles · 'glass' broken glass · 'can' cans & bottles · 'books' book heaps
   */
