// play-inline-414 04 — ctx
// Lines 1561-1591 of readable/play-inline-414.pretty.js (statement-aligned).
  function termRolls() {
    return {
      title: "THE GILDED FORK SOCIETY",
      header:
        "KESTREL TELETYPE — PRIVATE\nMEMBERSHIP ROLLS & MINUTES · DELMONICO'S, 56 BEAVER STREET",
      lock: DM_LOCKS.rolls,
      entries: [
        {
          title: "Membership Rolls",
          text: 'ACTIVE: Mrs. C. Van Duyn · The Hon. Judge R. Halvorsen · Col. A. Whitcombe (ret.) · Miss P. Fenwick · Mr. T. Astor-Pryce · L. Delmonico VII (Host) · A. Mercier (Chef)\n\nLAPSED (DECEASED): 19\nLAPSED (CONSUMED): 4\n\nTo be "lapsed (consumed)" is the highest honour the Society can bestow. It has not, historically, been sought.',
        },
        {
          title: "Minutes — The Resolution of '68",
          text: 'With the collapse of the beef supply and the Society\'s refusal to eat "giant roach, rat, or anything that crawls," the Chair moved that the Society adopt the old sailors\' custom, strictly among ourselves.\n\nAMENDMENT (Col. Whitcombe): "Among ourselves" to be read as "among whomever answers the advertisement."\n\nCARRIED, 6 to 1. Mr. Delmonico abstained. Mr. Delmonico always abstains, and always eats.',
        },
        {
          title: "Minutes — Recent",
          text: 'The Chef reports the dishwasher (T.) is "coming along nicely." The Colonel requests the rib. Miss Fenwick requests that the dishwasher stop singing; it upsets her digestion.\n\nThe Host reports a woman at the door asking after her husband. She was not admitted. She was, the Host notes, "rather lean."\n\nThe Treasurer reports that the Society strongbox has been reset to 7-4-1-9 following the incident with Miss Fenwick\'s nephew. Members are asked to commit it to memory and to stop writing it on napkins.',
          learn: DM_LOCKS.strongbox.id,
        },
      ],
    };
  }

  PV.dmUpdate = function (dt, realDt, ctx) {
    // keep the cage state in sync after loads / resets
    if (ctx.setCell) {
      const open = !!PV.flag("dm_cage_open");
      if (ctx.cellDoor && ctx.cellDoor.visible === open) ctx.setCell(!open);
    }
  };
