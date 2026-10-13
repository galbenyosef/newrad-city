// play-inline-425 04 — title
// Lines 1154-1200 of readable/play-inline-425.pretty.js (statement-aligned).
  function termDispatch() {
    return {
      title: "F.D.N.Y. MARINE DISPATCH",
      header:
        "MARINE COMPANY 1 — PIER A, THE BATTERY\nKestrel teletype — Fire Alarm Telegraph Interface",
      entries: [
        {
          title: "Last alarms received",
          text: "03/05/67 09:31 — BOX 22 — Governors Island — DRILL\n03/05/67 09:44 — BOX 1 — ALL COMPANIES — [CIVIL DEFENSE OVERRIDE]\n03/05/67 09:46 — BOX 1 — ALL COMPANIES — [CIVIL DEFENSE OVERRIDE]\n03/05/67 09:47 — BOX 1 — ALL COMPANIES — ALL COMP",
        },
        {
          title: "Standing orders",
          text: "In the event of a nuclear attack, Marine 1 will proceed to the Hudson River piers and supply water to land companies, until relieved.\n\nNobody relieved us.",
        },
        {
          title: "Pumps (maintenance)",
          text: "F/B PATRICK DUGGAN — Worthington pumps 1–4 serviced. Governor, pump 2, rebuilt 2/25. Note for the ferry boys: yes, it is the same governor as yours. No, you can't borrow ours.",
        },
      ],
    };
  }
  function termHarbor() {
    return {
      title: "HARBOR MASTER — LOG",
      header:
        "PORT OF NEW YORK — HARBOR MASTER, PIER A\nPersonal Log (Capt. E. Van Wyck)",
      entries: [
        {
          title: "The clock",
          learn: "ph2_lk_pa_safe",
          text: "The memorial clock has been wound every Sunday since 1919. (The office safe is set to that year too, 1-9-1-9, so the spare crank is never lost.) Every harbor master since has kept the key in this office. The ship's bell tolls the watches: two bells, four, six, eight. The men on the water set their watches by it.\n\n[A note is clipped to this entry: \"KEY IN THE WALL SAFE. SPARE ON MY BELT. 12 TURNS. DON'T OVERWIND.\"]",
          action: () => {
            K.q.start("ph2_947");
            return undefined;
          },
        },
        {
          title: "March 1967",
          text: 'Governors Island drill Tuesday. Horseshoe crabs up and down the Jersey flats, out of season — the Fish & Wildlife men say "large crabs." They are large. They are unusually large. Nobody can say why.',
        },
        {
          title: "Final entry",
          text: "Sirens. The Duggan is getting up steam. The ferries are still running, God help them. I have to go down and see to the — [ENTRY ENDS]",
        },
      ],
    };
  }
