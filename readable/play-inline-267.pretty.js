/* src/poi_ues/35_gracie_vault.js */
/* =====================================================================
 * NEW RAD CITY — POI UPPER EAST SIDE · 35 Gracie Mansion: the Mayor's vault
 *
 * The end of the KEYS TO THE CITY hunt (arcade module: 16 ceremonial
 * gold keys, threaded on the Mayor's ribbon once all are found = item
 * 'arc_city_keyring'). Mayor Francis X. Delahunt had every key he gave
 * away cut with a working bit, and built a strongroom with sixteen locks
 * under Gracie Mansion: "a door only the city's friends can open together".
 *
 * Built in the Gracie Mansion interior cell (origin 7800,0,0), north of
 * the house (local x -10..-4, z -17..-5, outside its walls):
 *   · CELLAR DOOR in the Front Hall's west wall (z 5.9), under the landing
 *     → the brick cellar: shelter stores, a bare bulb, the steel vault door
 *     (round, bolted, hinged left) with "the Keyboard" beside it: a mahogany
 *     panel with sixteen brass keyholes under the city seal.
 *   · THE VAULT DOOR: lock 'ues_gracie_vault' (key arc_city_keyring) → the
 *     strongroom: the city's emergency payroll (federal ration scrip) in a
 *     strongbox, the Mayor's desk with his last letter (Saturday 4 March 1967)
 *     and a dictation reel, his coat and his pistol.
 * Once open, the door model stands swung back and sixteen gold keys sit in
 * the Keyboard. Anchors on G.pois.gracie_mansion: cellar, vault_door, vault.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._ues) return;
  const P = G._ues,
    D = P.dress;
  const PI = P.PI,
    HP = P.HP,
    TAU = P.TAU;

  const KEYRING = "arc_city_keyring";
  // (80_content.js replaces P.LOCKS wholesale when it loads: keep our own reference)
  const LOCK = {
    id: "ues_gracie_vault",
    label: "The Mayor's Vault",
    kind: "door",
    key: KEYRING,
    hint: "Sixteen locks: all sixteen ceremonial Keys to the City, threaded on the Mayor's ribbon (the ledger, key K, keeps the register).",
    keyFrom:
      "Keys to the City: all sixteen ceremonial keys found (arcade ledger)",
  };
  P.lockReg(LOCK);

  // ------------------------------------------------------------------
  // Items: the Mayor's letter + reel, his coat, his pistol. Defined at initDone (the
  // weapon is a variant of the .32, which the weapons module defines in its init),
  // ahead of poi_ues' own initDone handler that spawns the strongbox and pickups.
  // ------------------------------------------------------------------
  const ITEMS = {
    letter: "ues_note_mayor_vault",
    reel: "ues_reel_mayor_vault",
    coat: "ues_mayor_coat",
    pistol: "ues_hizzoner",
  };
  function defineItems() {
    if (G.isStub("items") || typeof G.items.define !== "function") return;
    const d = (def) =>
      P.safe("item:" + def.id, () => {
        if (!G.items.get(def.id)) G.items.define(def);
      });
    d({
      id: ITEMS.letter,
      type: "note",
      name: "Letter: To Whoever Turned Sixteen Keys",
      title: "GRACIE MANSION — SATURDAY, MARCH 4, 1967",
      weight: 0,
      value: 0,
      tags: ["note", "unique"],
      text:
        "Gracie Mansion. Saturday, March 4, 1967. A quarter past eleven at night.\n\n" +
        "To whoever turned sixteen keys,\n\n" +
        "You will have noticed that a key to the city does not, as a rule, open anything. I always thought that a shame. So when I took office I had " +
        "Kearney & Daughters of Brooklyn cut every key I presented with a working bit, and I had this room built with sixteen locks to match. A city, " +
        "I told the Board of Estimate, ought to keep one door that only its friends can open together. They said I was being sentimental. I was.\n\n" +
        "This afternoon a man from the Office of Civil Defense sat in my study for an hour and would not take off his hat. He told me that the " +
        "trouble everyone has been expecting from the East is not the trouble that is coming. That Paris has moved its bombers forward, and certain " +
        "friends of Paris with them. That Washington knows, and has decided that a calm country is safer than a frightened one. He asked me to say " +
        "nothing until Tuesday. I am the Mayor of New York, and I said nothing.\n\n" +
        "Some of the people who hold these keys are on the other side of whatever comes next. I gave Henri-Paul Lavergne his with my own hands. " +
        "We laughed about the size of it.\n\n" +
        "In the strongbox behind you is the city's emergency payroll: federal ration scrip, printed in 1962 for exactly this and never once taken out " +
        "of this room. Pay whoever is still working. Feed whoever is still hungry. The coat and the pistol were mine. I will not be needing the coat, " +
        "and you will need the pistol.\n\n" +
        "If I am wrong, I will burn this on Tuesday and nobody will ever know the Mayor was frightened. If I am right, I am sorry. " +
        "I should have rung every church bell in the five boroughs.\n\n" +
        "Francis X. Delahunt\nMayor",
    });
    d({
      id: ITEMS.reel,
      type: "tape",
      name: "Tape Reel: The Mayor's Dictation",
      title: "Office of the Mayor — dictation, 4 March 1967",
      weight: 0,
      value: 0,
      tags: ["tape", "unique"],
      text:
        "[A desk microphone. Ice in a glass. A man's voice, tired and very careful.]\n\n" +
        "MAYOR: Miss Kessel, for Monday. The luncheon list for the twelfth. Ambassador Lavergne regrets; recalled to Paris. Strike him. " +
        "President Mercier — no. Strike him too. Mrs. Calabrese, yes, and send a car to Mulberry Street, she won't take a taxi. " +
        "The Liberty Seven boys get theirs at City Hall on Monday morning: the photographers at ten, the band at ten-fifteen.\n\n" +
        "[A long pause. The glass is set down.]\n\n" +
        'MAYOR: And a note to the Commissioner of Civil Defense. "Dear Harold. If I ring every church bell in the five boroughs tomorrow, how many ' +
        "people get to a shelter before lunch?\" No. Don't type that. Don't type any of that.\n\n" +
        "[Click.]",
    });
    d({
      id: ITEMS.coat,
      type: "apparel",
      slot: "body",
      name: "The Mayor's Chesterfield",
      weight: 4,
      value: 650,
      dr: 8,
      unique: true,
      attrs: { presence: 2 },
      skills: { persuasion: 10, trade: 5 },
      tags: ["apparel", "unique"],
      outfit: "suit",
      desc:
        "A charcoal Chesterfield with a velvet collar, cut on Madison Avenue for the 1966 inauguration. The city seal is stitched inside the lining, " +
        "over the heart. People stand up a little straighter when you walk into a room in it.",
    });
    // Hizzoner: the Mayor's nickel-plated .32, the city seal on the grips (a variant of the .32 pistol)
    P.safe("item:" + ITEMS.pistol, () => {
      if (G.items.get(ITEMS.pistol)) return;
      const base = G.items.get("pistol_32");
      if (base && base.weapon) {
        const w = JSON.parse(
          JSON.stringify(base.weapon, (k, v) =>
            typeof v === "function" ? undefined : v,
          ),
        );
        w.damage = Math.round((w.damage || 14) * 1.45);
        w.critChance = (w.critChance || 0) + 4;
        w.condDecay = (w.condDecay || 0.002) * 0.5;
        G.items.define({
          id: ITEMS.pistol,
          type: "weapon",
          name: "Hizzoner",
          weight: base.weight || 2,
          value: 1200,
          unique: true,
          weapon: w,
          mesh: base.mesh,
          desc:
            "The Mayor's nickel-plated .32, the seal of the City of New York set into ivory grips. A gift from the Patrolmen's Benevolent " +
            'Association, 1966, inscribed "FOR THE DAY THE TALKING STOPS". It shoots straighter than any politician you have met.',
        });
      } else {
        G.items.define({
          id: ITEMS.pistol,
          type: "misc",
          name: "Hizzoner",
          weight: 2,
          value: 1200,
          unique: true,
          tags: ["valuable"],
          desc: "The Mayor's nickel-plated .32, the seal of the City of New York set into ivory grips.",
        });
      }
    });
  }
  G.events.on("initDone", () => P.safe("vault:items", defineItems));

  // ------------------------------------------------------------------
  // Textures
  // ------------------------------------------------------------------
  function sealTex(key) {
    return P.canvasTex(
      key,
      256,
      256,
      (ctx, w, h) => {
        ctx.fillStyle = "#e4d6a8";
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, w / 2 - 4, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = "#6a4a14";
        ctx.lineWidth = 9;
        ctx.stroke();
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, w / 2 - 26, 0, TAU);
        ctx.stroke();
        ctx.fillStyle = "#6a4a14";
        ctx.font = "bold 19px serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const txt = "SIXTEEN KEYS · ONE CITY · ";
        ctx.save();
        ctx.translate(w / 2, h / 2);
        for (let i = 0; i < txt.length * 2; i++) {
          ctx.save();
          ctx.rotate((i / (txt.length * 2)) * TAU);
          ctx.fillText((txt + txt)[i], 0, -w / 2 + 15);
          ctx.restore();
        }
        ctx.restore();
        ctx.font = "bold 26px serif";
        ctx.fillText("F.X.D.", w / 2, h / 2 - 8);
        ctx.font = "bold 20px serif";
        ctx.fillText("1966", w / 2, h / 2 + 22);
      },
      { clamp: true },
    );
  }
  function posterTex() {
    return P.canvasTex("vault_cd_poster", 256, 360, (ctx, w, h) => {
      ctx.fillStyle = "#e8e0c4";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#1e2f5a";
      ctx.fillRect(0, 0, w, 70);
      ctx.fillStyle = "#f0e8d0";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "bold 26px Arial, sans-serif";
      ctx.fillText("CIVIL DEFENSE", w / 2, 36);
      ctx.fillStyle = "#1e2f5a";
      ctx.beginPath();
      ctx.moveTo(w / 2, 100);
      ctx.lineTo(w / 2 + 70, 220);
      ctx.lineTo(w / 2 - 70, 220);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#e8e0c4";
      ctx.beginPath();
      ctx.arc(w / 2, 180, 26, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#b01e22";
      ctx.font = "bold 22px Arial, sans-serif";
      ctx.fillText("EMERGENCY STORES", w / 2, 262);
      ctx.fillStyle = "#1e2f5a";
      ctx.font = "15px Georgia, serif";
      ctx.fillText("City of New York", w / 2, 292);
      ctx.fillText("Do not remove. Do not ration early.", w / 2, 316, w - 30);
      const r = P.rng("cdposter");
      for (let i = 0; i < 40; i++) {
        ctx.fillStyle = "rgba(110,80,40," + r() * 0.2 + ")";
        ctx.fillRect(r() * w, r() * h, 4 + r() * 18, 3 + r() * 12);
      }
    });
  }

  // ------------------------------------------------------------------
  // The vault door model (plain meshes so it can swing) + the keys in the Keyboard
  // ------------------------------------------------------------------
  const VD = { door: null, keys: null, glow: null, O: null };
  function doorModel(O) {
    const steel = new THREE.MeshStandardMaterial({
      color: 0x8c949a,
      metalness: 0.85,
      roughness: 0.38,
    });
    const dark = new THREE.MeshStandardMaterial({
      color: 0x3a4044,
      metalness: 0.8,
      roughness: 0.5,
    });
    const brass = new THREE.MeshStandardMaterial({
      color: 0xc8a050,
      metalness: 0.9,
      roughness: 0.3,
    });
    for (const m of [steel, dark, brass]) m.userData.shared = true;
    const R = 1.22,
      hinge = new THREE.Group();
    // hinge on the door's left edge (seen from the cellar); the leaf extends +x from the hinge
    hinge.position.set(O.x - 7 - R, O.y + 1.45, O.z - 9.78);
    const leaf = new THREE.Group();
    leaf.position.x = R;
    hinge.add(leaf);
    const disc = new THREE.Mesh(
      new THREE.CylinderGeometry(R, R, 0.34, 40),
      steel,
    );
    disc.rotation.x = HP;
    leaf.add(disc);
    const face = new THREE.Mesh(
      new THREE.CylinderGeometry(R * 0.8, R * 0.8, 0.36, 40),
      dark,
    );
    face.rotation.x = HP;
    leaf.add(face);
    for (let i = 0; i < 12; i++) {
      // locking bolts round the rim
      const a = (i / 12) * TAU,
        b = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.05, 0.22, 10),
          steel,
        );
      b.position.set(Math.cos(a) * (R - 0.08), Math.sin(a) * (R - 0.08), 0.12);
      b.rotation.x = HP;
      leaf.add(b);
    }
    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.16, 0.12, 20),
      brass,
    );
    hub.rotation.x = HP;
    hub.position.z = 0.22;
    leaf.add(hub);
    for (let i = 0; i < 4; i++) {
      // the wheel's spokes + grips
      const a = i * HP + PI / 4,
        sp = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.05, 0.05), brass);
      sp.position.set(Math.cos(a) * 0.35, Math.sin(a) * 0.35, 0.26);
      sp.rotation.z = a;
      leaf.add(sp);
      const gr = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), brass);
      gr.position.set(Math.cos(a) * 0.72, Math.sin(a) * 0.72, 0.26);
      leaf.add(gr);
    }
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.72, 0.03, 8, 40),
      brass,
    );
    ring.position.z = 0.26;
    leaf.add(ring);
    for (const y of [-0.7, 0.7]) {
      const h = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.09, 0.36, 12),
        dark,
      );
      h.position.set(-R + 0.05, y, 0.02);
      leaf.add(h);
    }
    for (const o of [disc, face, hub]) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
    // the sixteen keys seated in the Keyboard (shown once the vault is open)
    const keys = new THREE.Group();
    const gold = new THREE.MeshStandardMaterial({
      color: 0xe2b04a,
      metalness: 0.92,
      roughness: 0.26,
      emissive: 0x2a1a04,
      emissiveIntensity: 0.4,
    });
    gold.userData.shared = true;
    const bow = new THREE.TorusGeometry(0.03, 0.007, 6, 16),
      stem = new THREE.CylinderGeometry(0.006, 0.006, 0.06, 6);
    for (let r = 0; r < 4; r++)
      for (let c = 0; c < 4; c++) {
        const kx = O.x - 4.9 + (c - 1.5) * 0.17,
          ky = O.y + 1.24 + (1.5 - r) * 0.16;
        const k = new THREE.Group();
        k.position.set(kx, ky, O.z - 9.84);
        const bw = new THREE.Mesh(bow, gold);
        bw.position.z = 0.07;
        k.add(bw);
        const st = new THREE.Mesh(stem, gold);
        st.rotation.x = HP;
        st.position.z = 0.03;
        k.add(st);
        k.rotation.z = (r * 4 + c) * 0.37;
        keys.add(k);
      }
    // warm light spilling out of the strongroom behind the open door
    const glow = new THREE.Mesh(
      new THREE.CircleGeometry(1.05, 32),
      new THREE.MeshBasicMaterial({
        color: 0xffc070,
        transparent: true,
        opacity: 0.55,
      }),
    );
    glow.material.userData.shared = true;
    glow.position.set(O.x - 7, O.y + 1.45, O.z - 9.93);
    return { hinge, keys, glow };
  }
  function syncVault() {
    if (!VD.door) return;
    let open = false;
    try {
      open = !G.isStub("locks") && G.locks.isOpen(LOCK.id);
    } catch (e) {
      open = false;
    }
    VD.door.rotation.y = open ? -1.85 : 0; // swung out into the cellar
    VD.keys.visible = open;
    VD.glow.visible = open;
  }
  P.vault = { sync: syncVault, items: ITEMS, lock: LOCK };
  G.events.on("lockOpened", (id) => {
    if (id === LOCK.id) syncVault();
  });
  P.onReady.push(syncVault);
  P.onNewGame.push(syncVault);
  P.onLoaded.push(syncVault);

  // ------------------------------------------------------------------
  // Build: cellar + strongroom in the Gracie cell, and the doors
  // ------------------------------------------------------------------
  function build() {
    const O = P.I("gracie_mansion");
    const S = P.site("gracie_vault", {
      ox: O.x,
      oy: O.y,
      oz: O.z,
      lit: true,
      ambient: 0x6a5a48,
      ambI: 0.34,
      interiorKey: "gracie_mansion",
    });
    const b = S.b;
    const W = (x, y, z) => ({ x: x + O.x, y: y + O.y, z: z + O.z });

    // ---- the cellar door in the Front Hall (west wall, under the landing) ----
    b.box("wood_dark", -3.3, 0, 5.35, -3.24, 2.2, 6.45, { seg: false });
    for (const [z0, z1] of [
      [5.25, 5.35],
      [6.45, 6.55],
    ])
      b.box("paint_white", -3.3, 0, z0, -3.2, 2.3, z1, { seg: false });
    b.box("paint_white", -3.3, 2.2, 5.25, -3.2, 2.3, 6.55, { seg: false });
    for (const [y0, y1] of [
      [0.3, 1.0],
      [1.2, 2.0],
    ])
      b.box("wood", -3.24, y0, 5.5, -3.22, y1, 6.3, { seg: false });
    b.sphere("gold", -3.19, 1.0, 6.3, 0.035, { ws: 8, hs: 6 });
    D.label(
      b,
      "vault_cellar",
      ["CELLAR", "PRIVATE"],
      -3.2,
      2.45,
      5.9,
      0.42,
      0.16,
      HP,
      "bronze",
    );
    S.anchor("cellar_door", -2.4, 0, 5.9, -HP);

    // ---- the cellar (x -10..-4, z -10..-5, 3 m) ----
    const CY = 3.0;
    S.floor("concrete", -10, -10, -4, -5, 0);
    S.ceil("concrete", -10, -10, -4, -5, CY, { col: true });
    S.wallX("brick_red", -4.85, -10.3, -3.7, 0, CY, 0.3);
    S.wallX("concrete", -10.5, -10.3, -3.7, 0, CY, 1.0);
    S.wallZ("brick_red", -10.15, -10, -5, 0, CY, 0.3);
    S.wallZ("brick_red", -3.85, -10, -5, 0, CY, 0.3);
    // stairs up into the south wall (to the Front Hall)
    for (let i = 0; i < 4; i++) {
      b.box(
        "wood_dark",
        -7.7,
        0,
        -6 + i * 0.25,
        -6.3,
        0.2 + i * 0.2,
        -5.75 + i * 0.25,
        { seg: false },
      );
      S.col(-7.7, 0, -6 + i * 0.25, -6.3, 0.2 + i * 0.2, -5.75 + i * 0.25, {
        surface: "wood",
      });
    }
    b.box("wood_dark", -7.75, 0, -6.05, -7.7, 1.9, -5.0, { seg: false });
    b.box("wood_dark", -6.3, 0, -6.05, -6.25, 1.9, -5.0, { seg: false });
    b.rod("wood", [-7.72, 1.0, -6.05], [-7.72, 1.9, -5.1], 0.025, 6);
    // the bare bulb, shelter stores on the west wall, a wine rack, file boxes
    b.rod("iron", [-7, CY, -7.6], [-7, CY - 0.5, -7.6], 0.01, 4);
    b.sphere("lamp", -7, CY - 0.58, -7.6, 0.07, { ws: 8, hs: 6 });
    S.light(-7, CY - 0.7, -7.6, 0xffd8a0, 8, 0.95, { size: 0.5 });
    for (let k = 0; k < 4; k++)
      b.box("wood", -9.95, 0.25 + k * 0.6, -9.6, -9.4, 0.29 + k * 0.6, -6.2, {
        seg: false,
      });
    for (const z of [-9.55, -6.25])
      b.box("wood_dark", -9.95, 0, z - 0.04, -9.4, 2.2, z + 0.04, {
        seg: false,
      });
    for (let k = 0; k < 4; k++)
      for (let i = 0; i < 9; i++) {
        const rn = P.rng("vcan" + k + i);
        if (rn() < 0.2) continue;
        const z = -9.35 + i * 0.36;
        if (rn() < 0.5)
          b.cyl(
            ["metal", "rust", "steel"][Math.floor(rn() * 3)],
            -9.65,
            0.29 + k * 0.6,
            z,
            0.1,
            0.1,
            0.24 + rn() * 0.08,
            10,
          );
        else
          b.box(
            ["crate", "paper", "leather"][Math.floor(rn() * 3)],
            -9.85,
            0.29 + k * 0.6,
            z - 0.15,
            -9.45,
            0.5 + k * 0.6,
            z + 0.15,
            { seg: false },
          );
      }
    S.col(-9.95, 0, -9.6, -9.4, 2.3, -6.2, { walkable: false });
    b.quad(
      P.texMat("vault_cd_poster", posterTex(), {}),
      -9.38,
      1.75,
      -5.7,
      0.5,
      0.7,
      { ry: HP },
    );
    for (let i = 0; i < 3; i++)
      b.box(
        "crate",
        -5.0 + (i % 2) * 0.05,
        i * 0.42,
        -6.0,
        -4.2,
        0.4 + i * 0.42,
        -5.3,
        { seg: false, ry: i * 0.1 },
      );
    S.col(-5.0, 0, -6.0, -4.2, 1.26, -5.3, { walkable: false });

    // ---- the vault door in the north wall (frame, the door model, the Keyboard) ----
    b.torus("steel", -7, 1.45, -10.0, 1.36, 0.14, TAU, { rs: 8, ts: 40 });
    b.box("concrete_dark", -8.55, 0, -10.0, -5.45, 0.08, -9.7, { seg: false });
    b.cyl("paint_black", -7, 1.44, -10.02, 1.2, 1.2, 0.02, 32, { rx: HP });
    // the Keyboard: mahogany panel, sixteen brass escutcheons + keyholes, the seal above, the plate below
    b.box("wood_dark", -5.38, 0.72, -10.0, -4.42, 1.78, -9.9, { seg: false });
    b.box("gold", -5.42, 1.78, -10.0, -4.38, 1.82, -9.88, { seg: false });
    for (let r = 0; r < 4; r++)
      for (let c = 0; c < 4; c++) {
        const kx = -4.9 + (c - 1.5) * 0.17,
          ky = 1.24 + (1.5 - r) * 0.16;
        b.cyl("gold", kx, ky - 0.01, -9.888, 0.045, 0.045, 0.02, 14, {
          rx: HP,
        });
        b.box(
          "paint_black",
          kx - 0.008,
          ky - 0.03,
          -9.88,
          kx + 0.008,
          ky + 0.012,
          -9.874,
          { seg: false },
        );
      }
    b.quad(
      P.texMat("vault_seal", sealTex("vault_seal"), { rough: 0.5, metal: 0.3 }),
      -4.9,
      2.1,
      -9.97,
      0.5,
      0.5,
      {},
    );
    D.label(
      b,
      "vault_keyboard",
      ["THE KEYS TO THE CITY", "Sixteen keys. One city."],
      -4.9,
      0.6,
      -9.89,
      0.86,
      0.2,
      0,
      "bronze",
    );
    S.anchor("vault_door", -7, 0, -9.0, 0);

    // ---- the strongroom (x -10..-4, z -17..-11.2, 2.8 m) ----
    const VY = 2.8;
    S.floor("terrazzo", -10, -17, -4, -11, 0);
    S.ceil("plaster", -10, -17, -4, -11, VY, { col: true });
    S.wallX("panel", -17.15, -10.3, -3.7, 0, VY, 0.3);
    S.wallX("panel", -10.95, -10.3, -3.7, 0, VY, 0.3);
    S.wallZ("panel", -10.15, -17, -11, 0, VY, 0.3);
    S.wallZ("panel", -3.85, -17, -11, 0, VY, 0.3);
    b.torus("steel", -7, 1.45, -11.12, 1.3, 0.12, TAU, { rs: 8, ts: 40 }); // the inside of the door frame
    b.cyl("paint_black", -7, 1.44, -11.08, 1.18, 1.18, 0.02, 32, { rx: HP });
    D.rug(b, -8.6, -16.4, -5.4, -12.4, 0.01, "carpet_red");
    // the Mayor's desk, chair, green lamp, the city flag and the national flag
    b.box("wood_dark", -8.0, 0, -16.2, -6.0, 0.78, -15.3, { seg: false });
    S.col(-8.0, 0, -16.2, -6.0, 0.8, -15.3, { walkable: false });
    b.box("leather", -7.7, 0.78, -16.0, -6.9, 0.785, -15.5, { seg: false });
    b.cyl("gold", -6.4, 0.78, -15.9, 0.06, 0.08, 0.04, 10);
    b.rod("gold", [-6.4, 0.8, -15.9], [-6.4, 1.15, -15.9], 0.01, 5);
    b.cyl("lamp", -6.4, 1.12, -15.85, 0.07, 0.14, 0.1, 12, { open: true });
    S.light(-6.4, 1.05, -15.7, 0xffe2b0, 3, 0.35, { size: 0.3 });
    D.chair(b, -7.0, 0, -16.6, 0, { seat: "leather", arms: true });
    for (const [x, c] of [
      [-9.4, 0x5a70c0],
      [-4.6, 0xffffff],
    ]) {
      b.cyl("gold", x, 0, -16.7, 0.02, 0.02, 2.3, 5);
      b.box("fabric_white", x, 1.5, -16.72, x + 0.75, 2.2, -16.7, {
        seg: false,
        noAO: true,
        c,
      });
    }
    b.quad(
      P.texMat("vault_seal2", sealTex("vault_seal2"), {
        rough: 0.5,
        metal: 0.3,
      }),
      -7,
      1.95,
      -16.98,
      0.8,
      0.8,
      {},
    );
    // steel shelving with strongboxes and banded bundles of ration scrip
    for (const x of [-9.9, -4.4]) {
      for (let k = 0; k < 4; k++)
        b.box(
          "steel",
          x - 0.25,
          0.3 + k * 0.55,
          -16.4,
          x + 0.25,
          0.33 + k * 0.55,
          -12.0,
          { seg: false },
        );
      for (const z of [-16.4, -12.0])
        b.box("steel", x - 0.25, 0, z - 0.03, x + 0.25, 2.1, z + 0.03, {
          seg: false,
        });
      for (let k = 0; k < 4; k++)
        for (let i = 0; i < 7; i++) {
          const rn = P.rng("vbox" + x + k + i);
          if (rn() < 0.25) continue;
          const z = -16.1 + i * 0.6;
          if (rn() < 0.55)
            b.box(
              "steel",
              x - 0.2,
              0.33 + k * 0.55,
              z - 0.2,
              x + 0.2,
              0.55 + k * 0.55,
              z + 0.2,
              { seg: false },
            );
          else
            for (let j = 0; j < 3; j++)
              b.box(
                "paper",
                x - 0.18,
                0.33 + k * 0.55 + j * 0.06,
                z - 0.12,
                x + 0.18,
                0.385 + k * 0.55 + j * 0.06,
                z + 0.12,
                { seg: false, c: 0xc8d0b0 },
              );
        }
      S.col(x - 0.25, 0, -16.4, x + 0.25, 2.2, -12.0, { walkable: false });
    }
    D.label(
      b,
      "vault_payroll",
      ["CITY OF NEW YORK", "EMERGENCY PAYROLL", "Federal ration scrip · 1962"],
      -9.62,
      2.35,
      -14.2,
      0.9,
      0.3,
      HP,
      "bronze",
    );
    S.light(-7, VY - 0.3, -13.6, 0xffe0b0, 9, 0.9, { size: 0.6 });
    b.sphere("lamp", -7, VY - 0.12, -13.6, 0.12, { ws: 10, hs: 6, sy: 0.4 });
    S.anchor("vault", -7, 0, -13.6, 0);

    // ---- contents: the strongbox (scrip + the coat + the pistol), the letter, the reel ----
    S.prop("safe", -8.9, 0, -14.4, HP, {
      locked: 0,
      name: "The City's Emergency Payroll",
      items: [
        ["scrip", 3000],
        [ITEMS.coat, 1],
        [ITEMS.pistol, 1],
      ],
    });
    S.pickup(ITEMS.letter, 1, -7.3, 0.79, -15.75);
    S.pickup(ITEMS.reel, 1, -6.8, 0.79, -15.6);

    S.build({ interior: true });
    P.addInterior("gracie_mansion", S.root);

    // ---- doors ----
    S.door(-3.0, 1.2, 5.9, "Cellar Stairs", W(-7, 0, -6.4), {
      verb: "Descend",
      radius: 1.0,
      id: "ues_gracie_cellar_down",
    });
    S.door(
      -7,
      1.2,
      -5.6,
      "Front Hall",
      Object.assign(W(-2.3, 0, 5.9), { yaw: -HP }),
      { verb: "Climb", radius: 1.2, id: "ues_gracie_cellar_up" },
    );
    S.door(
      -7,
      1.4,
      -9.6,
      "The Mayor's Vault",
      Object.assign(W(-7, 0, -12.1), { yaw: 0 }),
      {
        verb: "Open",
        radius: 1.5,
        id: "ues_gracie_vault_door",
        lock: LOCK,
        sound: "door_open",
      },
    );
    S.door(
      -7,
      1.3,
      -11.5,
      "The Cellar",
      Object.assign(W(-7, 0, -8.8), { yaw: PI }),
      { verb: "Leave", radius: 1.2, id: "ues_gracie_vault_out" },
    );

    // ---- the swinging door model + the Keyboard keys + the strongroom glow ----
    const m = doorModel(O);
    VD.door = m.hinge;
    VD.keys = m.keys;
    VD.glow = m.glow;
    S.root.add(m.hinge, m.keys, m.glow);
    syncVault();

    // anchors onto the mansion's POI record (quests: vault marker)
    const rec = G.pois && G.pois.gracie_mansion;
    if (rec && rec.anchors) Object.assign(rec.anchors, S.anchors);
  }
  P.addBuilder("gracie_vault", build, 31);
})();
