// play-inline-358 08 — ctx
// Lines 1873-2166 of readable/play-inline-358.pretty.js (statement-aligned).
  PF.decalKey = function () {
    return PF.texMat(
      "decals",
      PF.canvasTex(
        "pws_decals",
        1024,
        512,
        (ctx) => {
          const r = PF.rng("decals"),
            S = 256;
          ctx.clearRect(0, 0, 1024, 512);
          const cell = (i, fn) => {
            ctx.save();
            ctx.translate((i % 4) * S, Math.floor(i / 4) * S);
            fn();
            ctx.restore();
          };
          // 0, 1: bullet-hole clusters (spalled plaster ring + dark core)
          for (const i of [0, 1])
            cell(i, () => {
              for (let k = 0; k < 9 + i * 6; k++) {
                const x = 40 + r() * 176,
                  y = 40 + r() * 176,
                  rr = 5 + r() * 8;
                ctx.fillStyle = "rgba(235,228,212,0.8)";
                ctx.beginPath();
                ctx.arc(x, y, rr * 2.1, 0, TAU);
                ctx.fill();
                ctx.fillStyle = "rgba(110,100,86,0.9)";
                ctx.beginPath();
                ctx.arc(x, y, rr * 1.2, 0, TAU);
                ctx.fill();
                ctx.fillStyle = "rgba(20,16,12,1)";
                ctx.beginPath();
                ctx.arc(x, y, rr * 0.55, 0, TAU);
                ctx.fill();
              }
            });
          // 2: water stain run from the ceiling
          cell(2, () => {
            const g = ctx.createLinearGradient(0, 0, 0, S);
            g.addColorStop(0, "rgba(90,70,40,0.75)");
            g.addColorStop(1, "rgba(90,70,40,0)");
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.moveTo(60, 0);
            for (let k = 0; k <= 10; k++)
              ctx.lineTo(60 + k * 14 + (r() - 0.5) * 10, 40 + r() * 190);
            ctx.lineTo(200, 0);
            ctx.fill();
            ctx.strokeStyle = "rgba(70,50,30,0.6)";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(55, 0);
            ctx.lineTo(62, 90);
            ctx.stroke();
          });
          // 3: blood splatter & drag
          cell(3, () => {
            ctx.fillStyle = "rgba(80,10,8,0.9)";
            ctx.beginPath();
            ctx.ellipse(128, 128, 60, 40, 0.3, 0, TAU);
            ctx.fill();
            for (let k = 0; k < 30; k++) {
              const a = r() * TAU,
                d = 50 + r() * 70;
              ctx.beginPath();
              ctx.arc(
                128 + Math.cos(a) * d,
                128 + Math.sin(a) * d * 0.7,
                2 + r() * 6,
                0,
                TAU,
              );
              ctx.fill();
            }
          });
          // 4: scorch (ray / arc blast)
          cell(4, () => {
            const g = ctx.createRadialGradient(128, 128, 5, 128, 128, 120);
            g.addColorStop(0, "rgba(10,8,6,0.95)");
            g.addColorStop(0.5, "rgba(30,22,14,0.6)");
            g.addColorStop(1, "rgba(30,22,14,0)");
            ctx.fillStyle = g;
            ctx.beginPath();
            for (let k = 0; k < 16; k++) {
              const a = (k / 16) * TAU,
                d = 70 + r() * 55;
              ctx.lineTo(128 + Math.cos(a) * d, 128 + Math.sin(a) * d);
            }
            ctx.fill();
          });
          // 5: blood trail (footprints / drips in a line)
          cell(5, () => {
            ctx.fillStyle = "rgba(80,10,8,0.85)";
            for (let k = 0; k < 14; k++) {
              ctx.beginPath();
              ctx.ellipse(
                128 + Math.sin(k * 0.7) * 20,
                10 + k * 17,
                8 + r() * 6,
                5 + r() * 4,
                r(),
                0,
                TAU,
              );
              ctx.fill();
            }
          });
          // 6: painted raider arrow
          cell(6, () => {
            ctx.strokeStyle = "rgba(200,40,30,0.9)";
            ctx.lineWidth = 16;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(30, 128);
            ctx.lineTo(210, 128);
            ctx.moveTo(160, 80);
            ctx.lineTo(215, 128);
            ctx.lineTo(160, 176);
            ctx.stroke();
          });
          // 7: grime / soot patch
          cell(7, () => {
            for (let k = 0; k < 40; k++) {
              ctx.fillStyle = "rgba(30,24,16," + r() * 0.15 + ")";
              ctx.beginPath();
              ctx.ellipse(
                128 + (r() - 0.5) * 140,
                128 + (r() - 0.5) * 140,
                20 + r() * 40,
                10 + r() * 30,
                r() * 3,
                0,
                TAU,
              );
              ctx.fill();
            }
          });
        },
        { clamp: true },
      ),
      { transparent: true, rough: 0.95, noShadow: true },
    );
  };
  /** Decal quad: kind 0..7 (see PF.decalKey). floor: lies on the floor (y = floor height). */
  PF.decal = function (b, kind, x, y, z, w, h, ry, opts) {
    opts = opts || {};
    const u0 = (kind % 4) * 0.25,
      v0 = kind < 4 ? 0.5 : 0;
    b.quad(PF.decalKey(), x, y + (opts.floor ? 0.012 : 0), z, w, h, {
      ry: ry || 0,
      rx: opts.floor ? -HP : 0,
      rz: opts.rz || 0,
      uvRect: [u0, v0, u0 + 0.25, v0 + 0.5],
      noAO: true,
      grime: 0,
    });
  };
  /** Engraved memorial plaques (8 names) for the undercroft loculi. */
  PF.plaqueKey = function () {
    return PF.texMat(
      "loculi",
      PF.canvasTex(
        "pws_loculi",
        1024,
        256,
        (ctx) => {
          const r = PF.rng("loculi");
          const names = [
            "JOHN WATTS",
            "ELIZ. RUTGERS",
            "CAPT. J. LEAKE",
            "MARY BAYARD",
            "THOS. BARCLAY",
            "ANNA VAN HORNE",
            "REV. S. AUCHMUTY",
            "W. LIVINGSTON",
          ];
          for (let i = 0; i < 8; i++) {
            const x = (i % 4) * 256,
              y = Math.floor(i / 4) * 128;
            ctx.fillStyle = ["#d8d2c4", "#cfc8b8", "#e0dace", "#c8c0b0"][i % 4];
            ctx.fillRect(x, y, 256, 128);
            ctx.strokeStyle = "rgba(60,54,44,0.6)";
            ctx.lineWidth = 3;
            ctx.strokeRect(x + 10, y + 10, 236, 108);
            ctx.fillStyle = "rgba(40,34,26,0.8)";
            ctx.textAlign = "center";
            ctx.font = "bold 20px Georgia, serif";
            ctx.fillText(names[i], x + 128, y + 52);
            ctx.font = "14px Georgia, serif";
            ctx.fillText(
              "OB. " + (1768 + i * 9) + "  ·  AET. " + (34 + i * 7),
              x + 128,
              y + 78,
            );
            ctx.fillText("R. I. P.", x + 128, y + 100);
            for (let k = 0; k < 40; k++) {
              ctx.fillStyle = "rgba(40,30,20," + r() * 0.2 + ")";
              ctx.beginPath();
              ctx.arc(x + r() * 256, y + r() * 128, 1 + r() * 7, 0, TAU);
              ctx.fill();
            }
            if (i % 3 === 1) {
              ctx.strokeStyle = "rgba(30,24,18,0.8)";
              ctx.lineWidth = 2;
              ctx.beginPath();
              let cx = x + 40 + r() * 60,
                cy = y;
              ctx.moveTo(cx, cy);
              for (let k = 0; k < 6; k++) {
                cx += 20 + r() * 20;
                cy += 10 + r() * 14;
                ctx.lineTo(cx, cy);
              }
              ctx.stroke();
            } // cracked slab
          }
        },
        { clamp: true },
      ),
      { rough: 0.6 },
    );
  };
  /** Soft additive light shaft (skylights, holes): a tapered open cone with a vertical fade. One draw call. */
  let shaftMat = null;
  PF.lightShaft = function (parent, x, y, z, rTop, rBot, h, opts) {
    opts = opts || {};
    if (!shaftMat) {
      const tex = PF.canvasTex(
        "pws_shaft",
        16,
        128,
        (ctx, w, hh) => {
          const g = ctx.createLinearGradient(0, 0, 0, hh);
          g.addColorStop(0, "rgba(255,255,255,0.0)");
          g.addColorStop(0.15, "rgba(255,255,255,0.9)");
          g.addColorStop(1, "rgba(255,255,255,0.0)");
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, w, hh);
        },
        { clamp: true },
      );
      shaftMat = new THREE.MeshBasicMaterial({
        color: opts.color || 0xfff0d0,
        map: tex,
        transparent: true,
        opacity: opts.opacity || 0.12,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
        fog: true,
      });
      shaftMat.userData.shared = true;
    }
    const g = new THREE.CylinderGeometry(rTop, rBot, h, 20, 1, true);
    if (opts.sz) g.scale(1, 1, opts.sz);
    const m = new THREE.Mesh(g, shaftMat);
    m.position.set(x, y - h / 2, z);
    if (opts.rz) m.rotation.z = opts.rz;
    if (opts.rx) m.rotation.x = opts.rx;
    m.castShadow = false;
    m.receiveShadow = false;
    m.renderOrder = 5;
    m.name = "pws_lightshaft";
    (parent || G.scene).add(m);
    return m;
  };

  // -------------------------------------------------------------------
  // TRAPS
  // -------------------------------------------------------------------
  PF.trapList = PF.trapList || [];
  const trapState = (t) => PF.flag("trap_" + t.id) || "armed";
  const trapArmed = (t) =>
    trapState(t) === "armed" && !(t.offFlag && PF.flag(t.offFlag));
  const segDist2 = (p, a, c) => {
    const dx = c.x - a.x,
      dz = c.z - a.z,
      L = dx * dx + dz * dz || 1e-6;
    const t = Math.max(
      0,
      Math.min(1, ((p.x - a.x) * dx + (p.z - a.z) * dz) / L),
    );
    const qx = a.x + dx * t - p.x,
      qz = a.z + dz * t - p.z;
    return qx * qx + qz * qz;
  };
  /**
   * def: {id, kind: 'tripwire'|'beartrap'|'laser'|'chime', parent (cell root), a, c (world endpoints, line kinds),
   * pos (point kinds), floorY, bouquet (world pos of the grenades), dmg, offFlag, onTrip(), label}
   * Builds its own small merged meshes (hidden once tripped/disarmed) and registers the disarm interactable.
   */
