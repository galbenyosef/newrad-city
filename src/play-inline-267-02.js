// play-inline-267 02 — ctx
// Lines 29-375 of readable/play-inline-267.pretty.js (statement-aligned).
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
