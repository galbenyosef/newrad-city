// play-inline-422 05 — add
// Lines 1420-1557 of readable/play-inline-422.pretty.js (statement-aligned).
  function ferries(ctx, root, b) {
    const FR = WH.FERRY;
    // shared ferry geometry (built once, placed twice)
    const fb = K.builder({ name: "wh_ferry", grime: 0.4 });
    ferryModel(fb);
    const proto = fb.finish(null);
    // (1) MARGARET CORBIN, moored in slip 1
    const f1 = new THREE.Group();
    f1.name = "ph2_ferry_corbin";
    f1.add(proto);
    f1.position.set(FR.cx, 0, FR.cz);
    f1.updateMatrix();
    // (2) her sister, sunk & listing in slip 3
    const f2 = new THREE.Group();
    f2.name = "ph2_ferry_sunk";
    for (const m of proto.children) f2.add(m.clone());
    f2.position.set(12.4, -2.3, 49.5);
    f2.rotation.set(0.05, 0.08, -0.24);
    f2.updateMatrix();
    // name boards (per ship): in each ferry's local coords
    const nb = K.builder({ name: "wh_ferry_names", grime: 0.1 });
    const name1 = K.paint(
      "art",
      "ph2_name_corbin",
      1024,
      96,
      (x, X, Y, W, Hh) => {
        x.clearRect(X, Y, W, Hh);
        x.fillStyle = "#f0e8d0";
        x.font = "bold 70px Georgia, serif";
        x.textAlign = "center";
        x.textBaseline = "middle";
        x.fillText("MARGARET  CORBIN", X + W / 2, Y + Hh / 2 + 3);
        K.streaks(x, X, Y, W, Hh, 20, 451, 0.4);
      },
    );
    const name2 = K.paint(
      "art",
      "ph2_name_newark",
      1024,
      96,
      (x, X, Y, W, Hh) => {
        x.clearRect(X, Y, W, Hh);
        x.fillStyle = "#f0e8d0";
        x.font = "bold 70px Georgia, serif";
        x.textAlign = "center";
        x.textBaseline = "middle";
        x.fillText("ADM. HENRY RICHMOND", X + W / 2, Y + Hh / 2 + 3);
        K.streaks(x, X, Y, W, Hh, 20, 452, 0.4);
      },
    );
    const sif = K.paint("art", "ph2_name_sif", 1024, 96, (x, X, Y, W, Hh) => {
      x.clearRect(X, Y, W, Hh);
      x.fillStyle = "#f0e8d0";
      x.font = "bold 64px Arial, sans-serif";
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.fillText("STATEN ISLAND FERRY", X + W / 2, Y + Hh / 2 + 3);
    });
    const names = (nm) => {
      const g = K.builder({ name: "wh_fn", grime: 0 });
      for (const s of [-1, 1]) {
        g.plate(
          "art",
          s * (FR.beam / 2 - 0.73),
          FR.deck + 4.95,
          0,
          s,
          0,
          9,
          0.85,
          nm,
          { off: 0.04 },
        );
        g.plate(
          "art",
          s * (FR.beam / 2 - 0.53),
          FR.deck + 2.25,
          0,
          s,
          0,
          11,
          0.9,
          sif,
          { off: 0.04 },
        );
      }
      return g.finish(null);
    };
    f1.add(names(name1));
    f2.add(names(name2));
    void nb;
    // colliders (local frame): moored ferry — hull + cabins solid, walkable end decks, top deck
    const cx = FR.cx,
      cz = FR.cz,
      L = FR.len,
      hb = FR.beam / 2;
    b.col(
      cx - hb,
      -4,
      cz - L / 2 + 1.4,
      cx + hb,
      FR.deck + 0.5,
      cz + L / 2 - 1.4,
      { tag: "ship", surface: "metal" },
    );
    b.col(
      cx - hb + 0.55,
      FR.deck,
      cz - 12.5,
      cx + hb - 0.55,
      FR.deck + 5.6,
      cz + 12.5,
      { tag: "ship", surface: "metal" },
    );
    // sunk ferry: blocking hull only (not walkable — the deck lists 14°)
    b.col(12.4 - hb, -4, 49.5 - L / 2 + 1, 12.4 + hb, 1.2, 49.5 + L / 2 - 1, {
      tag: "ship",
      surface: "metal",
      walkable: false,
    });
    // put both ferries into the frame (they are children of the rotated exterior root)
    const fg = new THREE.Group();
    fg.name = "ph2_wh_ferries";
    fg.add(f1);
    fg.add(f2);
    fg.position.set(F.px, 0, F.pz);
    fg.rotation.y = F.yaw;
    fg.updateMatrixWorld(true);
    root.add(fg);
    // oil slick & debris around the wreck
    b.hplate("decal", 12, -1.15, 44, 12, 14, 0.4, K.decal("puddle", 5));
    b.hplate("decal", 13, -1.15, 57, 9, 10, 1.4, K.decal("puddle", 6));
  }

  // ------------------------------------------------------------------
  // Caravan stage dressing on the apron (detail builder)
  // ------------------------------------------------------------------
