// play-inline-336 05 — line
// Lines 2183-2271 of readable/play-inline-336.pretty.js (statement-aligned).
  const HEADLINES = [
    "ALE HOUSE TURNS 110",
    "SOLDIERS SHIP OUT TO SAIGON",
    "MAYOR BANS NOTHING, ALE HOUSE UNIMPRESSED",
    "BERLIN CRISIS DEEPENS",
    "COOPER UNION ADDS ROBOTS",
    'TAMMANY BOSS "RE-ELECTED"',
    "LIGHT OR DARK? CITY DECIDES",
    "FIZZO COLA SHORTAGE",
    "CIVIL DEFENSE OPENS MANHATTAN SHELTERS",
    "FIRE AT 7th ST — ALE SAVED",
    "HOUDINI'S CUFFS STILL LOCKED",
    "CAT ELECTED ALDERMAN (UNOPPOSED)",
  ];
  function clipping(i) {
    const h = HEADLINES[i % HEADLINES.length];
    return K.paint("art", "mcs_clip_" + i, 128, 96, function (x, X, Y, W, Hh) {
      x.fillStyle =
        "rgb(" +
        (210 + ((i * 7) % 30)) +
        "," +
        (200 + ((i * 5) % 25)) +
        "," +
        (170 + ((i * 3) % 20)) +
        ")";
      x.fillRect(X, Y, W, Hh);
      x.fillStyle = "#1a1a1a";
      x.font = "bold 12px Georgia, serif";
      x.textAlign = "center";
      const words = h.split(" ");
      let line = "",
        yy = Y + 16;
      for (const w of words) {
        if ((line + w).length > 16) {
          x.fillText(line, X + W / 2, yy);
          yy += 14;
          line = "";
        }
        line += w + " ";
      }
      x.fillText(line, X + W / 2, yy);
      x.fillStyle = "rgba(40,40,40,0.5)";
      for (let k = 0; k < 6; k++) x.fillRect(X + 8, yy + 8 + k * 7, W - 16, 3);
      K.stains(x, X, Y, W, Hh, 4, i + 3, 0.5, [100, 70, 30]);
    });
  }
  function termDeck() {
    return {
      title: "O'ROURKE'S — BACK OFFICE",
      header:
        "KESTREL TELETYPE CORP. — MODEL 40 LINE PROTOCOL\nProperty of O'Rourke's Old Ale House — \"Be Good or Be Gone\"",
      lock: {
        id: "pev_lk_mcs_office",
        passcode: "SAWDUST",
        hint: "Ask Deck about the place; he'll tell you what the floor is made of.",
      },
      entries: [
        {
          title: "Ledger: Ward Tax Paid to Tammany",
          text: "Week 1: 40 scrip + 1 keg dark. Week 2: 40 scrip + 1 keg dark. Week 3: 60 scrip (\"inflation,\" says the Brave) + 1 keg dark + my good mustard.\n\nThe Boss drinks the dark himself. I've seen him. He doesn't even like dark. He does it because it's mine.",
        },
        {
          title: "Recipe: Light",
          text: "Malt, water, hops from the Beer Garden vines, yeast from the 1854 culture (DO NOT LET IT DIE — it survived the Civil War, Prohibition AND the bombs).\n\nIt is also, technically, the dark, with less roast. Don't tell anybody.",
        },
        {
          title: "Note to Self: Wishbones",
          text: "Nineteen bones on the lamp. Finn came home. Finn will not take his down. Says the man who hung it didn't come back, not really.\n\nI dust around it.",
        },
        {
          title: "Family Safe",
          learn: "pev_lk_mcs_safe",
          text: "Same combination as over the door, like Grandpa wanted: 1-8-5-4. If you are a Tammany Brave reading this: it is not.",
        },
        {
          title: "Open Family Safe",
          text: "The safe's bolts clunk back.",
          action: () => {
            EV.unlockTagged("mcs", "safe");
            K.notify("The O'Rourke family safe is unlocked.");
          },
        },
      ],
    };
  }

  // ==================================================================
  // DATA: items, quest, dialogues
  // ==================================================================
