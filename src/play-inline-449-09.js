// play-inline-449 09 — color
// Lines 2500-2517 of readable/play-inline-449.pretty.js (statement-aligned).
  D("fizzo_bottle", (k, r, v) => {
    k.lathe("glass", fizzoProfile(), 0, 0, 0, { seg: 10, color: 0x4a1208 });
    k.cyl("plain", 0.0345, 0.0345, 0.035, 0, 0.17, 0, {
      seg: 10,
      color: 0xe8e0d0,
      open: true,
    });
    k.cyl("plain", 0.0347, 0.0347, 0.008, 0, 0.158, 0, {
      seg: 10,
      color: 0xc0141a,
      open: true,
    });
    k.cyl("metal", 0.014, 0.014, 0.01, 0, 0.264, 0, {
      seg: 8,
      color: 0xc8b070,
    });
    k.meta.tier = "small";
  });
