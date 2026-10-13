// play-inline-206 02 — math
// Lines 25-258 of readable/play-inline-206.pretty.js (statement-aligned).
  const PF = G._pf;
  const K = PF.kit,
    D = PF.dress;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const PI = Math.PI,
    HP = Math.PI / 2,
    TAU = Math.PI * 2;

  const BX0 = 52,
    BX1 = 108,
    BZ0 = 768,
    BZ1 = 797; // building footprint
  const H_BASE = 12,
    H_SHAFT = 34,
    H_LOG = 39.5,
    H_TOP = 41.6;
  const BASE = 30; // interior lift (see header)
  const VY = -25; // vault level (local)

  Object.assign(PF.flagDefaults, {
    fed_power: false, // vault elevator powered
    fed_gate: false, // ground checkpoint gate open
    fed_grid: true, // laser grid active
    fed_turrets: true, // security turrets active
    fed_alarm: false, // alarm tripped (robots alerted)
    fed_vault: false, // cylinder door open
    fed_warden_off: false, // Vault Sentinel in maintenance mode
    fed_egress: false, // egress door unbolted (ground side)
    fed_ledger: false, // ledger picked up
    fed_turrets_off: false, // turrets switched off at the security terminal
    fed_warden_dead: false,
  });

  // ---- locks: keys, codes and passcodes (the unlock for each is placed in this building) ----
  const FED_LOCKS = (PF.fedLocks = {
    gate: PF.regLock({
      id: "pf_lk_fed_gate",
      label: "Checkpoint Gate",
      code: "5107",
      kind: "gate",
      hint: "Card taped inside the guard booth window (security office side) — or raise it from the security terminal.",
    }),
    records: PF.regLock({
      id: "pf_lk_fed_records",
      label: "Records Room",
      code: "3906",
      kind: "door",
      hint: "The Chief of Security's memo on the security office desk.",
    }),
    security: PF.regLock({
      id: "pf_lk_fed_security",
      label: "Ground Security Teletype",
      key: "pf_fed_keycard",
      kind: "terminal",
      hint: "The Chief of Security's keycard, by his remains in the records room.",
    }),
    vault: PF.regLock({
      id: "pf_lk_fed_vault_term",
      label: "Level V Vault Control Teletype",
      key: "pf_fed_override",
      kind: "terminal",
      hint: "The override card: the Sergeant's safe in the Level V barracks, or Mortimer Vane.",
    }),
    barracks: PF.regLock({
      id: "pf_lk_fed_barracks_safe",
      label: "Sergeant's Safe",
      code: "8112",
      kind: "safe",
      hint: "The gin rummy scoreboard on the barracks wall.",
    }),
    office: PF.regLock({
      id: "pf_lk_fed_office_term",
      label: "Vault Manager's Teletype",
      passcode: "NANETTE",
      kind: "terminal",
      hint: "The Vault Manager's note on his desk.",
    }),
    officeSafe: PF.regLock({
      id: "pf_lk_fed_office_safe",
      label: "Vault Manager's Safe",
      code: "0915",
      kind: "safe",
      hint: "The Vault Manager's personal log on his teletype.",
    }),
  });
  PF.keyFrom(
    "pf_fed_override",
    "Sergeant's Safe (Level V barracks); Mortimer Vane (Fraunces Tavern)",
  );
  PF.keyFrom("pf_fed_reserve_key", "Vault Manager's Safe (Level V office)");

  /** Round (semicircular) arch shape w × h (springs at h - w/2). */
  function roundShape(w, h) {
    const s = new THREE.Shape(),
      r = w / 2,
      sp = h - r;
    s.moveTo(-r, 0);
    s.lineTo(r, 0);
    s.lineTo(r, sp);
    s.absarc(0, sp, r, 0, PI, false);
    s.lineTo(-r, 0);
    return s;
  }
  /** Round-arched opening on a wall face: dark glass/void, voussoirs, keystone, optional grille. */
  function archWindow(b, x, y, z, ry, w, h, opts) {
    opts = opts || {};
    const c = Math.cos(ry),
      s = Math.sin(ry);
    const P = (lx, ly, lz) =>
      V3(x + lx * c + lz * s, y + ly, z - lx * s + lz * c);
    b.add(opts.glass || "glass_dark", PF.shapeGeo(roundShape(w, h), 12), {
      m: PF.m4(x + s * 0.01, y, z + c * 0.01, ry),
      uv: "keep",
      grime: 0.1,
      noAO: true,
    });
    const r = w / 2,
      sp = h - r,
      vk = opts.frame || "fed_stone";
    const N = 9;
    for (let i = 0; i < N; i++) {
      const a0 = (i / N) * PI,
        a1 = ((i + 1) / N) * PI,
        am = (a0 + a1) / 2,
        rr = r + 0.3;
      const p = P(Math.cos(am) * rr, sp + Math.sin(am) * rr, 0.12);
      b.box(
        i === N >> 1 ? "fed_rust" : vk,
        p.x,
        p.y - 0.28,
        p.z,
        rr * (a1 - a0) + 0.02,
        i === N >> 1 ? 0.8 : 0.62,
        0.3,
        { ry, rz: am - HP, seg: false, grime: 0.5 },
      );
    }
    for (const sg of [-1, 1]) {
      const p = P(sg * (r + 0.25), 0, 0.1);
      b.box(vk, p.x, y, p.z, 0.45, sp, 0.3, { ry, seg: false, grime: 0.5 });
    }
    const sl = P(0, -0.2, 0.2);
    b.box(vk, sl.x, y - 0.25, sl.z, w + 0.9, 0.25, 0.5, { ry, seg: false });
    if (opts.grille) {
      const n = Math.max(3, Math.round(w / 0.28));
      for (let i = 1; i < n; i++) {
        const lx = -r + (i * w) / n;
        const top = sp + Math.sqrt(Math.max(0, r * r - lx * lx));
        const a = P(lx, 0, 0.16),
          bb = P(lx, top - 0.05, 0.16);
        b.beam("iron", a, bb, 0.05, 0.05, { grime: 0.3 });
      }
      for (const yy of [h * 0.3, h * 0.6]) {
        const a = P(-r, yy, 0.17),
          bb = P(r, yy, 0.17);
        b.beam("iron", a, bb, 0.045, 0.06, {});
      }
      if (opts.scroll) {
        const cc = P(0, sp, 0.18);
        b.add("iron", new THREE.TorusGeometry(r * 0.55, 0.035, 4, 16, PI), {
          m: PF.m4(cc.x, cc.y, cc.z, ry),
        });
      }
    }
  }
  /** Samuel Yellin-style wrought-iron cage lantern on a scrolled bracket. */
  function yellinLantern(b, x, y, z, ry, lit, parent) {
    const c = Math.cos(ry),
      s = Math.sin(ry);
    const P = (lx, ly, lz) =>
      V3(x + lx * c + lz * s, y + ly, z - lx * s + lz * c);
    // bracket: horizontal arm + scrolled brace + curl
    b.beam("iron", P(0, 0.6, 0), P(0, 0.6, 1.25), 0.1, 0.1, {});
    b.beam("iron", P(0, -0.6, 0), P(0, 0.55, 1.0), 0.07, 0.07, {});
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU;
      const p = P(0, 0.2 + Math.sin(a) * 0.18, 0.55 + Math.cos(a) * 0.18);
      b.box("iron", p.x, p.y, p.z, 0.04, 0.06, 0.06, { ry, seg: false });
    }
    const cx = P(0, 0, 1.3);
    b.cyl("iron", cx.x, cx.y + 0.5, cx.z, 0.06, 0.06, 0.12, 6, { hSeg: 1 });
    // cage: octagonal crown, bars, bowl
    b.cyl("iron", cx.x, cx.y - 0.95, cx.z, 0.34, 0.12, 0.3, 8, { hSeg: 1 });
    b.cyl("iron", cx.x, cx.y + 0.15, cx.z, 0.08, 0.42, 0.35, 8, { hSeg: 1 });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU;
      b.beam(
        "iron",
        V3(cx.x + Math.cos(a) * 0.36, cx.y - 0.66, cx.z + Math.sin(a) * 0.36),
        V3(cx.x + Math.cos(a) * 0.4, cx.y + 0.15, cx.z + Math.sin(a) * 0.4),
        0.03,
        0.03,
        {},
      );
    }
    for (const yy of [-0.66, -0.25, 0.15])
      b.add("iron", new THREE.TorusGeometry(0.39, 0.025, 3, 8), {
        m: PF.m4(cx.x, cx.y + yy, cx.z, 0, HP),
      });
    for (let i = 0; i < 8; i++) {
      const a = ((i + 0.5) / 8) * TAU;
      b.cyl(
        "iron",
        cx.x + Math.cos(a) * 0.42,
        cx.y + 0.5,
        cx.z + Math.sin(a) * 0.42,
        0.001,
        0.05,
        0.3,
        4,
        { hSeg: 1 },
      );
    }
    b.cyl(
      lit ? "lamp_warm" : "glass_broken",
      cx.x,
      cx.y - 0.62,
      cx.z,
      0.3,
      0.3,
      0.72,
      8,
      { hSeg: 1, noAO: true, grime: 0 },
    );
    if (lit)
      PF.glow(V3(cx.x, cx.y - 0.25, cx.z), 0xffb860, 2.2, parent || null, {
        intensity: 1.3,
        flicker: 0.35,
      });
  }

  // ===================================================================
  // EXTERIOR
  // ===================================================================
