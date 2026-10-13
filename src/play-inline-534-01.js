// play-inline-534 01 — art
// Lines 18-328 of readable/play-inline-534.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const C = G.crafting;
  const X = C._;

  // ------------------------------------------------------------------
  // Items. Components are worth nothing on their own at a vendor: a round
  // must never break down into more scrip than it cost (that was an
  // infinite-money loop).
  // ------------------------------------------------------------------
  const PRIMER_MESH = "scrap"; // small brass bits on the ground
  const CM = (id, name, value, mesh, desc) => ({
    id,
    name,
    type: "misc",
    weight: 0,
    value,
    tags: ["component", "reloading"],
    mesh,
    icon: "misc",
    noLoot: true,
    desc,
  });
  X.ITEM_DEFS.push(
    CM(
      "cr_lead",
      "Lead",
      0,
      "junk_metal",
      "Soft grey slugs cut from pipe, fishing weights and the occasional old-world toy soldier. The business end of every hand-loaded round.",
    ),
    CM(
      "cr_powder",
      "Smokeless Powder",
      0,
      "can_paint",
      "A scoop of nitrocellulose flakes. Keep it dry, keep it away from campfires, keep it away from Earl.",
    ),
    CM(
      "cr_primer_pistol",
      "Small Pistol Primer",
      0,
      PRIMER_MESH,
      "A tiny brass cup with a dab of priming compound. Strike it and it wakes the powder up.",
    ),
    CM(
      "cr_primer_rifle",
      "Large Rifle Primer",
      0,
      PRIMER_MESH,
      "A hotter, harder primer for rifle cartridges. Old-world military surplus, still crisp.",
    ),
    CM(
      "cr_primer_shot",
      "Shotshell Primer",
      0,
      PRIMER_MESH,
      "A battery-cup primer for shotgun hulls.",
    ),
    CM(
      "cr_case_32",
      ".32 Case",
      0,
      "scrap",
      "A spent .32 brass case. With a new primer, some powder and a slug it could be a bullet again.",
    ),
    CM(
      "cr_case_10mm",
      "10mm Case",
      0,
      "scrap",
      "A spent 10mm brass case, still smelling of the last firefight.",
    ),
    CM(
      "cr_case_44",
      ".44 Magnum Case",
      0,
      "scrap",
      "A long, heavy .44 case. Handloaders love these; so do scavengers.",
    ),
    CM(
      "cr_case_556",
      "5.56mm Case",
      0,
      "scrap",
      "A bottlenecked 5.56mm case with a U.S. Army headstamp.",
    ),
    CM(
      "cr_case_308",
      ".308 Case",
      0,
      "scrap",
      "A full-length .308 rifle case. Resize it, prime it, fill it, seat it.",
    ),
    CM(
      "cr_hull_12ga",
      "12 Ga. Hull",
      0,
      "scrap",
      "An empty red plastic shotgun hull with a brass head. Reloadable, if you have the primers.",
    ),
    CM(
      "cr_drained_dry_cell",
      "Dead Lantern Battery",
      0,
      "battery",
      "A lantern battery run flat by one siren shriek. The zinc can is fine; it just needs a charge from a fresh dry cell.",
    ),
  );

  // Cartridge → components (hand load consumes these, break down returns them).
  // rep = Mechanics needed to hand-load it (null = can't be hand-loaded, only broken down).
  // art = real cartridge dimensions (mm) for the blueprint (X.cartridgeArt).
  X.AMMO_PARTS = {
    ammo_32: {
      casing: "cr_case_32",
      primer: "cr_primer_pistol",
      powder: 1,
      lead: 1,
      rep: 15,
      art: {
        len: 23.6,
        oal: 32,
        dia: 8.6,
        rim: 9.9,
        nose: "round",
        label: ".32 S&W LONG",
      },
    },
    ammo_10mm: {
      casing: "cr_case_10mm",
      primer: "cr_primer_pistol",
      powder: 2,
      lead: 1,
      rep: 25,
      art: {
        len: 25.2,
        oal: 32,
        dia: 10.8,
        neck: 10.6,
        nose: "flat",
        label: "10MM AUTO",
      },
    },
    ammo_44: {
      casing: "cr_case_44",
      primer: "cr_primer_pistol",
      powder: 3,
      lead: 2,
      rep: 45,
      art: {
        len: 32.6,
        oal: 40.6,
        dia: 11.6,
        rim: 13.1,
        nose: "flat",
        label: ".44 MAGNUM",
      },
    },
    ammo_556: {
      casing: "cr_case_556",
      primer: "cr_primer_rifle",
      powder: 3,
      lead: 1,
      rep: 35,
      art: {
        len: 44.7,
        oal: 57.4,
        dia: 9.6,
        neck: 6.4,
        shoulder: 36.5,
        nose: "spire",
        label: "5.56X45MM",
      },
    },
    ammo_308: {
      casing: "cr_case_308",
      primer: "cr_primer_rifle",
      powder: 4,
      lead: 2,
      rep: 50,
      art: {
        len: 51.2,
        oal: 71.1,
        dia: 11.9,
        neck: 8.7,
        shoulder: 40.5,
        nose: "spire",
        label: ".308 WIN",
      },
    },
    ammo_12ga: {
      casing: "cr_hull_12ga",
      primer: "cr_primer_shot",
      powder: 2,
      lead: 3,
      rep: 30,
      art: {
        len: 62,
        oal: 64,
        dia: 18.5,
        rim: 20.5,
        shot: true,
        label: '12 GA 2-3/4"',
      },
    },
    ammo_5mm: {
      casing: null,
      primer: "cr_primer_rifle",
      powder: 1,
      lead: 1,
      rep: null,
      art: {
        len: 30,
        oal: 40,
        dia: 7.4,
        neck: 5.4,
        shoulder: 22,
        nose: "spire",
        label: "5MM CASELESS",
      },
    },
  };
  // Battery ammo → the dead battery it leaves behind, and the chance per shot.
  X.DRAINED = { ammo_dry_cell: ["cr_drained_dry_cell", 0.7] };
  X.CASE_CHANCE = 0.8;

  // ------------------------------------------------------------------
  // Recipes (station 'reloading'; `gives` = several outputs, `label` = row name)
  // ------------------------------------------------------------------
  const partsOf = (a) => {
    const p = [];
    if (a.casing) p.push([a.casing, 1]);
    p.push([a.primer, 1], ["cr_powder", a.powder], ["cr_lead", a.lead]);
    return p;
  };
  for (const ammo in X.AMMO_PARTS) {
    const a = X.AMMO_PARTS[ammo],
      cal = ammo.slice(5);
    if (X.cartridgeArt && X.ART) {
      X.ART["hl_" + cal] = X.cartridgeArt(a.art, "load");
      X.ART["bd_" + cal] = X.cartridgeArt(
        a.art,
        a.casing ? "explode" : "explode_nc",
      );
    }
    if (a.rep !== null) {
      X.RECIPES.push({
        id: "cr_hl_" + cal,
        station: "reloading",
        tab: "handload",
        makes: ammo,
        n: 1,
        parts: partsOf(a),
        req: { mechanics: a.rep },
        xp: 0,
        art: "hl_" + cal,
        note: a.art.shot
          ? "Punch a new primer into the brass head, drop the powder, seat a wad, pour the shot and fold the crimp shut."
          : "Resize the case, seat a new primer, throw a charge of powder and press a cast slug home.",
      });
    }
    X.RECIPES.push({
      id: "cr_bd_" + cal,
      station: "reloading",
      tab: "breakdown",
      makes: ammo,
      n: 1,
      parts: [[ammo, 1]],
      gives: partsOf(a),
      req: {},
      xp: 0,
      art: "bd_" + cal,
      breakdown: true,
      note: a.art.shot
        ? "Slit the crimp, pour out the buckshot and the powder, punch out the primer and keep the hull."
        : "Pull the bullet, dump the powder, punch out the primer" +
          (a.casing
            ? " and keep the case."
            : ". The 5mm case is too thin to reload."),
    });
  }
  X.RECIPES.push({
    id: "cr_rc_dry_cell",
    station: "reloading",
    tab: "recycle",
    makes: "ammo_dry_cell",
    n: 4,
    parts: [
      ["cr_drained_dry_cell", 4],
      ["dry_cell", 1],
    ],
    req: { electronics: 30 },
    xp: 6,
    art: "recharge",
    note: "Wire four dead lantern batteries in parallel across a fresh dry cell and bleed the charge back in.",
  });
  X.TABS.reloading = [
    ["handload", "HAND LOAD"],
    ["breakdown", "BREAK DOWN"],
    ["recycle", "RECYCLE"],
  ];
  X.STATION_TITLE.reloading = "RELOADING BENCH";
  X.STATION_SKILLS = {
    workbench: ["mechanics", "electronics", "medicine"],
    campfire: ["survival", "medicine"],
    reloading: ["mechanics", "electronics"],
  };

  // Searchable "Reloading Supplies" crate at every bench (restocks every 3 days).
