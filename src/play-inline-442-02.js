// play-inline-442 02 — color
// Lines 347-642 of readable/play-inline-442.pretty.js (statement-aligned).
  D("mailbox", (k, r, v) => {
    const o = { color: C.mailBlue, rust: 0.2 + r() * 0.3 };
    const kk = v === 1 ? new X.Kit(5) : k;
    kk.boxB("metal", 0.54, 0.86, 0.5, 0, 0.18, 0, o);
    kk.cyl(
      "metal",
      0.25,
      0.25,
      0.54,
      0,
      1.04,
      0,
      Object.assign({ rz: PI / 2, seg: 12, thetaLength: PI, thetaStart: 0 }, o),
    );
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        kk.boxB("metal", 0.06, 0.18, 0.06, sx * 0.22, 0, sz * 0.2, o);
    kk.quad("mailbox", 0.46, 0.46, 0, 0.72, -0.253, { ry: PI });
    kk.box("metal", 0.36, 0.08, 0.08, 0, 1.0, -0.26, { color: 0x2a3a50 }); // pull-down chute handle
    kk.quad("mailbox", 0.4, 0.4, 0.273, 0.72, 0, { ry: PI / 2 });
    kk.quad("mailbox", 0.4, 0.4, -0.273, 0.72, 0, { ry: -PI / 2 });
    if (v === 1) {
      // knocked over, letters spilled
      k.include(kk, { y: 0.27, z: 0.2, rx: -PI / 2 });
      for (let i = 0; i < 7; i++)
        k.quad("paper", 0.14, 0.1, (r() - 0.5) * 0.9, 0.012, -0.9 - r() * 0.7, {
          rx: -PI / 2,
          rz: r() * 3,
          color: 0xe8e0d0,
        });
      k.meta.collider = { w: 0.6, d: 1.3, h: 0.55, cz: -0.35 };
    } else k.meta.collider = { w: 0.56, d: 0.52, h: 1.3 };
    k.meta.container = { name: "Mailbox", loot: "mailbox" };
    k.meta.tier = "small";
  });

  // ---------------- newspaper vending boxes ----------------
  D("newsbox", (k, r, v) => {
    const cols = [0xc8b048, 0x3a6ab0, 0xb03a2a];
    const o = { color: cols[v % 3], rust: 0.25 };
    k.boxB("metal", 0.1, 0.36, 0.1, 0, 0, 0, { color: 0x333333 });
    k.cbox(
      "metal",
      0.46,
      0.72,
      0.42,
      0,
      0.72,
      0,
      Object.assign({ bevel: 0.02 }, o),
    );
    k.quad("news_" + (v % 3), 0.44, 0.56, 0, 0.72, -0.214, { ry: PI });
    k.box("metal", 0.48, 0.04, 0.44, 0, 1.1, 0, o);
    k.meta.tier = "small";
    k.meta.collider = { w: 0.46, d: 0.42, h: 1.1 };
  });

  // ---------------- phone booth ----------------
  D("phone_booth", (k, r, v) => {
    const o = { color: 0x8a8a80, rust: 0.35 };
    const W = 0.9,
      H = 2.25;
    k.boxB("concrete", W + 0.1, 0.08, W + 0.1, 0, 0, 0, { color: 0x9a968c });
    // corner posts
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        k.boxB("metal", 0.07, H, 0.07, (sx * W) / 2, 0.08, (sz * W) / 2, o);
    // roof with sign band
    k.boxB("metal", W + 0.08, 0.3, W + 0.08, 0, H + 0.08, 0, o);
    k.cbox(
      "metal",
      W + 0.14,
      0.08,
      W + 0.14,
      0,
      H + 0.42,
      0,
      Object.assign({ bevel: 0.03 }, o),
    );
    for (let s = 0; s < 4; s++) {
      const a = (s * PI) / 2;
      k.quad(
        "phone_sign",
        W,
        0.16,
        -Math.sin(a) * (W / 2 + 0.045),
        H + 0.23,
        -Math.cos(a) * (W / 2 + 0.045),
        { ry: a + PI },
      );
    }
    // back wall panel + phone unit
    k.boxB("metal", W - 0.04, H - 0.1, 0.04, 0, 0.1, W / 2 - 0.02, o);
    k.cbox("metal", 0.26, 0.42, 0.14, 0, 1.35, W / 2 - 0.1, {
      color: 0x2a2a2a,
      bevel: 0.03,
    });
    k.box("plain", 0.2, 0.06, 0.06, 0.02, 1.12, W / 2 - 0.2, {
      color: 0x151515,
      rz: 0.4,
    }); // dangling handset
    k.seg("plain", [0, 1.2, W / 2 - 0.12], [0.02, 1.12, W / 2 - 0.2], 0.008, {
      color: 0x111111,
    });
    k.box("metal", 0.5, 0.03, 0.22, 0, 1.0, W / 2 - 0.12, o); // shelf / phone book
    // glass (some panes smashed)
    const panes = [
      [W / 2, 0, PI / 2],
      [-W / 2, 0, -PI / 2],
      [0, -W / 2, 0],
    ];
    for (const [px, pz, ry] of panes) {
      for (let i = 0; i < 3; i++) {
        if (r() < (v === 1 ? 0.6 : 0.25)) continue;
        const y = 0.5 + i * 0.6;
        k.box("glass", W - 0.1, 0.56, 0.02, px * 0.98, y + 0.28, pz * 0.98, {
          ry,
          color: 0x7a8a88,
          ao: [1, 1],
        });
      }
      for (let i = 0; i <= 3; i++)
        k.box(
          "metal",
          W - 0.06,
          0.04,
          0.05,
          px,
          0.48 + i * 0.6,
          pz,
          Object.assign({ ry }, o),
        );
    }
    k.meta.collider = { w: W + 0.1, d: W + 0.1, h: H + 0.5 };
    k.meta.tier = "medium";
  });

  // ---------------- bench ----------------
  D("bench", (k, r, v) => {
    const L = 1.8,
      broken = v === 1;
    const iron = { color: 0x2a2c28, rust: 0.4 };
    for (const sx of [-0.75, 0.75]) {
      k.seg("metal", [sx, 0, -0.25], [sx, 0.45, -0.18], 0.03, iron);
      k.seg("metal", [sx, 0, 0.22], [sx, 0.45, 0.18], 0.03, iron);
      k.seg("metal", [sx, 0.45, -0.22], [sx, 0.45, 0.22], 0.03, iron);
      k.seg("metal", [sx, 0.45, 0.2], [sx, 0.9, 0.34], 0.03, iron);
      k.seg("metal", [sx, 0.62, -0.26], [sx, 0.62, 0.1], 0.025, iron); // armrest
    }
    for (let i = 0; i < 5; i++) {
      if (broken && r() < 0.4) continue;
      k.box("wood", L, 0.035, 0.08, 0, 0.47, -0.18 + i * 0.09, {
        color: 0xb09878,
        rust: 0,
      });
    }
    for (let i = 0; i < 3; i++) {
      if (broken && r() < 0.5) continue;
      k.box("wood", L, 0.08, 0.03, 0, 0.6 + i * 0.12, 0.23 + i * 0.03, {
        rx: -0.25,
        color: 0xb09878,
      });
    }
    k.meta.collider = { w: L, d: 0.5, h: 0.5 };
    k.meta.tier = "small";
  });

  // ---------------- litter basket (NYC wire basket) / metal can ----------------
  D("trash_can", (k, r, v) => {
    if (v === 0 || v === 2) {
      const tip = v === 2;
      const kk = tip ? new X.Kit(11) : k;
      kk.cyl("chain", 0.3, 0.24, 0.85, 0, 0.47, 0, {
        seg: 12,
        open: true,
        color: 0x6a6e60,
        uvScale: 2.2,
      });
      kk.torus("metal", 0.3, 0.02, 0, 0.9, 0, {
        rx: PI / 2,
        tseg: 14,
        rseg: 4,
        color: 0x4a4e44,
      });
      kk.torus("metal", 0.26, 0.015, 0, 0.45, 0, {
        rx: PI / 2,
        tseg: 14,
        rseg: 4,
        color: 0x4a4e44,
      });
      kk.cyl("metal", 0.24, 0.24, 0.03, 0, 0.06, 0, {
        seg: 12,
        color: 0x3a3a34,
      });
      for (let i = 0; i < 4; i++) {
        const a = (i * PI) / 2;
        kk.seg(
          "metal",
          [Math.cos(a) * 0.24, 0, Math.sin(a) * 0.24],
          [Math.cos(a) * 0.3, 0.9, Math.sin(a) * 0.3],
          0.012,
          { color: 0x3a3a34 },
        );
      }
      // garbage inside
      kk.sphere("fabric", 0.22, 0, 0.75, 0, {
        s: [1, 0.6, 1],
        color: 0x2a2a28,
        wseg: 8,
        hseg: 5,
      });
      if (tip) {
        k.include(kk, { y: 0.3, rx: PI / 2 - 0.1, ry: r() * 6 });
        for (let i = 0; i < 6; i++)
          k.sphere(
            "fabric",
            0.08 + r() * 0.1,
            (r() - 0.5) * 0.8,
            0.05,
            0.6 + r() * 0.6,
            {
              s: [1, 0.5, 1],
              color: [0x2a2a28, 0x6a5a40, 0xb0a890][i % 3],
              wseg: 6,
              hseg: 4,
            },
          );
        for (let i = 0; i < 4; i++)
          k.quad(
            "paper",
            0.18,
            0.13,
            (r() - 0.5) * 1.2,
            0.012,
            0.4 + r() * 1.2,
            { rx: -PI / 2, rz: r() * 3 },
          );
      }
    } else {
      // dented municipal can with lid
      const o = {
        color: [0x4a5a40, 0x606058, 0x3a4a5a][(r() * 3) | 0],
        rust: 0.5,
      };
      k.cyl("metal", 0.28, 0.25, 0.8, 0, 0.4, 0, Object.assign({ seg: 12 }, o));
      for (const y of [0.15, 0.4, 0.65])
        k.torus(
          "metal",
          0.27,
          0.015,
          0,
          y,
          0,
          Object.assign({ rx: PI / 2, tseg: 12, rseg: 3 }, o),
        );
      k.cyl(
        "metal",
        0.3,
        0.3,
        0.05,
        0.03,
        0.84,
        0.02,
        Object.assign({ seg: 12, rz: 0.12 }, o),
      );
      k.seg("metal", [-0.08, 0.9, 0.02], [0.1, 0.9, 0.02], 0.015, o);
    }
    k.meta.collider = v === 2 ? null : { w: 0.55, d: 0.55, h: 0.9 };
    k.meta.container = { name: "Trash Can", loot: "trash" };
    k.meta.tier = "small";
  });

  // ---------------- parking meter ----------------
  D("parking_meter", (k, r, v) => {
    const o = { color: 0x5a5e58, rust: 0.45 };
    k.cyl("metal", 0.035, 0.04, 1.1, 0, 0.55, 0, Object.assign({ seg: 6 }, o));
    if (v === 1) {
      k.seg("metal", [0, 1.1, 0], [0.12, 1.22, -0.1], 0.03, o);
      return;
    } // head snapped off
    k.cbox(
      "metal",
      0.2,
      0.3,
      0.14,
      0,
      1.25,
      0,
      Object.assign({ bevel: 0.05 }, o),
    );
    k.sphere("glass", 0.08, 0, 1.3, -0.06, { s: [1, 1, 0.5], color: 0x9aa098 });
    k.box("plain", 0.08, 0.02, 0.02, 0, 1.43, 0, { color: 0x222222 });
    k.meta.tier = "small";
  });

  // ---------------- bus stop (sign / shelter) ----------------
