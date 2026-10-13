// play-inline-410 04 — ctx
// Lines 2368-2492 of readable/play-inline-410.pretty.js (statement-aligned).
  function termCog() {
    return {
      title: "CONTINUITY ARCHIVE 7",
      header:
        "UNITED STATES GOVERNMENT — CONTINUITY OF GOVERNMENT PROGRAM\nARCHIVE NODE 7 (NEW YORK SUB-TREASURY)\nWARNING: UNAUTHORIZED ACCESS IS A FEDERAL CRIME",
      lock: FH_LOCKS.term,
      entries: [
        {
          title: "Archive Status",
          text: "CORE: SEALED (ARCHIVE 7)\nCONTENTS: 214 program files, 1,406 personnel dossiers, 3 schematics sets flagged CONTINUITY-EYES-ONLY\nLAST SYNC: 03.05.1967 09:41\nNEXT SYNC: ———\n\nRETRIEVAL TEAM ETA: overdue by 8,037 days",
        },
        {
          title: "Memo: Relocation (03.04.67)",
          text: "FROM: Office of the Secretary (Continuity)\nTO: Node custodians, Eastern Seaboard\n\nIn the event of a Condition Red, custodians are to seal their node and await a retrieval team from Mount Weather. Custodians are NOT to evacuate to public shelters. Your family's placement in a Project Long Winter cryo facility has been arranged separately.\n\nThe Republic thanks you.",
        },
        {
          title: "Priority Traffic (04.03.67, 18:10)",
          text: () => {
            PV.setFlag("fh_memo_read", true);
            K.setQFlag("ms_memo_read", true);
            return PV.MARSH_MEMO;
          },
        },
        {
          title: "Custodian Log — H. Pryce",
          text: 'Sealed the door at 09:44. The retrieval team is not coming. I heard the helicopter go over and keep going.\n\nMy "placement" was Cryo Unit C-11. I checked the Long Winter roster on the node. Long Winter is one small trial with ninety-day volunteers. There is no Unit C-11. There never was. It was a story to keep the custodians at their posts.\n\nThe safe is set to 0-6-1-2, Ellie\'s birthday. I am writing it here so that somebody, someday, remembers her birthday.\n\nI am going to sit with the files. Somebody should.',
          learn: FH_LOCKS.safe.id,
        },
        {
          title: "Core Eject",
          text: "The core cradle unlocks with a hiss. The status lamp goes from red to green.",
          action: () => {
            K.notify("The archive core cradle unlocks.");
          },
        },
      ],
    };
  }
  function termKiosk() {
    return {
      title: "EXHIBIT KIOSK",
      header:
        'NATIONAL PARK SERVICE — INTERACTIVE HISTORY STATION\n"Birth of the Republic"',
      entries: [
        {
          title: "The First Congress (1789)",
          text: 'The First Congress of the United States met here in Federal Hall. It wrote the Bill of Rights, established the federal courts and argued, at great length, about what to call the President. "His Highness" was proposed. It did not pass.',
        },
        {
          title: "The Oath of Office",
          text: "On April 30, 1789, George Washington took the oath of office on the balcony overlooking Wall Street, his hand on a Bible borrowed from a nearby Masonic lodge. The crowd cheered. Washington, a nervous public speaker, then went inside and gave a very quiet speech.",
        },
        {
          title: "The Sub-Treasury",
          text: "From 1862 to 1920 this building was the U.S. Sub-Treasury. At times it held more gold than any building in the world. The vaults are closed to the public. Please stop asking the rangers about the vaults.",
        },
        {
          title: "Visitor Survey (1967)",
          text: "Q: How would you rate your visit? — A: The robot guide keeps telling me the Russians are coming. — Q: Would you recommend us to a friend? — A: If they are still alive after Tuesday.",
        },
      ],
    };
  }

  // The Mosler door: swing toward its target (flag), keep the closed / open colliders in step
  const FH_OPEN = -1.62;
  function fhDoorCols(ctx, open) {
    const g = ctx.fhDoorGeo;
    if (!g) return;
    if (!open && !ctx.fhDoorCol)
      ctx.fhDoorCol = G.world.addBox(
        g.hx - 0.1,
        g.y,
        g.z0 - 1.9,
        g.hx + 0.6,
        g.y + 3.9,
        g.z0 + 1.9,
        { tag: "poi_fidi3", surface: "metal", walkable: false },
      );
    if (open && ctx.fhDoorCol) {
      K.safe("rmcol", () => G.world.removeCollider(ctx.fhDoorCol));
      ctx.fhDoorCol = null;
    }
    if (open && !ctx.fhDoorOpenCol)
      ctx.fhDoorOpenCol = G.world.addBox(
        g.hx,
        g.y,
        g.z0 + g.DR - 0.05,
        g.hx + 2 * g.DR + 0.3,
        g.y + 3.9,
        g.z0 + g.DR + 0.6,
        { tag: "poi_fidi3", surface: "metal", walkable: false },
      );
    if (!open && ctx.fhDoorOpenCol) {
      K.safe("rmcol", () => G.world.removeCollider(ctx.fhDoorOpenCol));
      ctx.fhDoorOpenCol = null;
    }
  }
  PV.fhDoorUpdate = function (ctx, realDt) {
    const d = ctx.fhDoor;
    if (!d) return;
    if (!d.parent && ctx.intRoot) ctx.intRoot.add(d);
    const open = !!PV.flag("fh_vault_open"),
      target = open ? FH_OPEN : 0,
      cur = d.rotation.y;
    if (Math.abs(cur - target) > 1e-3) {
      if (!ctx.inside)
        d.rotation.y = target; // loads / resets snap
      else
        d.rotation.y =
          target < cur
            ? Math.max(target, cur - 0.45 * (realDt || 0.016))
            : Math.min(target, cur + 0.8 * (realDt || 0.016));
    }
    const shouldOpen = open && d.rotation.y < -0.35;
    if (shouldOpen !== !!ctx.fhDoorOpenCol || (!shouldOpen && !ctx.fhDoorCol))
      fhDoorCols(ctx, shouldOpen);
  };

  // Keep the core mesh parented to the interior root, visible only until taken
  PV.fhCoreUpdate = function (ctx) {
    if (!ctx.coreMesh) return;
    if (!ctx.coreMesh.parent && ctx.intRoot) ctx.intRoot.add(ctx.coreMesh);
    ctx.coreMesh.visible = !PV.flag("fh_core_taken");
  };
