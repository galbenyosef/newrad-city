// play-inline-191 06 — title
// Lines 2736-2859 of readable/play-inline-191.pretty.js (statement-aligned).
  function studioWindows(b, x0, x1, y, box, dim) {
    for (const t of [0.28, 0.72]) {
      const cx = x0 + (x1 - x0) * t;
      b.plate("lamp", cx, y + 1.7, -0.12, 0, -1, 1.2, 2.1, null, {
        tint: dim ? [0.4, 0.42, 0.44] : [0.62, 0.66, 0.7],
      });
      b.beam(
        "paint_cream",
        cx - 0.62,
        y + 0.62,
        -0.16,
        cx + 0.62,
        y + 0.62,
        -0.16,
        0.08,
        0.1,
      );
      b.beam(
        "paint_cream",
        cx - 0.62,
        y + 1.7,
        -0.16,
        cx + 0.62,
        y + 1.7,
        -0.16,
        0.05,
        0.05,
      );
      b.beam(
        "paint_cream",
        cx,
        y + 0.62,
        -0.16,
        cx,
        y + 2.78,
        -0.16,
        0.05,
        0.05,
      );
      b.box("fabric", cx - 0.8, y + 0.3, -0.25, 0.3, 2.6, 0.08, {
        tint: [0.6, 0.25, 0.22],
      }); // curtains
      b.box("fabric", cx + 0.8, y + 0.3, -0.25, 0.3, 2.6, 0.08, {
        tint: [0.6, 0.25, 0.22],
      });
      b.light(cx, y + 1.8, -0.8, [0.75, 0.82, 0.9], dim ? 0.6 : 1.0, 6.5, {
        box,
      });
      b.glow(cx, y + 1.8, -0.3, [0.25, 0.28, 0.3], 2.2);
    }
  }
  function easel(b, x, y, z, yaw, rect) {
    const c = Math.cos(yaw),
      s = Math.sin(yaw);
    const P = (lx, ly, lz) => [
      x + lx * c + lz * s,
      y + ly,
      z - lx * s + lz * c,
    ];
    const leg = (a, bb) => {
      const p = P(a[0], a[1], a[2]),
        q = P(bb[0], bb[1], bb[2]);
      b.beam("wood", p[0], p[1], p[2], q[0], q[1], q[2], 0.04, 0.04, {
        tint: [0.7, 0.55, 0.4],
      });
    };
    leg([-0.35, 0, 0.15], [0, 1.9, 0]);
    leg([0.35, 0, 0.15], [0, 1.9, 0]);
    leg([0, 0, -0.5], [0, 1.8, 0]);
    leg([-0.4, 0.75, 0.13], [0.4, 0.75, 0.13]);
    const q0 = P(-0.42, 0.8, 0.16),
      q1 = P(0.42, 0.8, 0.16),
      q2 = P(0.42, 1.85, 0.08),
      q3 = P(-0.42, 1.85, 0.08);
    b.quad("art", q0, q1, q2, q3, { rect, grime: 0 });
    b.quad("wood", q1, q0, q3, q2, { tint: [0.8, 0.75, 0.65] });
    b.ocol(x, z, 0.8, 0.5, y, y + 1.9, yaw, {
      tag: "furniture",
      walkable: false,
    });
  }

  function termDesk() {
    return {
      // Stanley never logs off: the front-office terminal is open to anyone standing at his desk
      title: "HOTEL CHELSEA — FRONT OFFICE",
      header:
        "KESTREL TELETYPE CORP. — MODEL 40 LINE TERMINAL\n-Guest Registry, 2nd ed.-",
      entries: [
        {
          title: "Guest Registry — March 1967",
          text: "Rm 100 — Mr. & Mrs. N. (musician). Rent 2 weeks late. Screaming.\nRm 822 — J. Nitro. Rent 9 weeks late. Screaming.\nRm 824 — the writer. Paid a year in advance. Never leaves.\nPENTHOUSE — A. Moretz. Paid in paintings since 1931. Management accepts.\nLOBBY SCULPTURE — do NOT let the Dadaists take her down again.",
        },
        {
          title: "Memo: Civil Defense Offer",
          text: 'The Office of Civil Defense has offered the residents "priority placement" in a deep shelter in exchange for the lobby art collection, to "preserve American culture underground."\n\nThe residents voted. The vote was unanimous. The reply was two words long and I will not put it on a government-issue terminal.',
        },
        {
          title: "1989 — Settlement Ledger",
          text: 'Residents: 23 (14 painters, 5 musicians, 3 poets, 1 unknown — Johnny says he is "post-human").\nPaintings in the stairwell: 1,114.\nManiac incidents this year: 2. Critics shot: 0 (a new record).\nVivienne reports her portrait stolen by Tombs raiders. Nobody wants to go downtown. Nobody ever wants to go downtown.',
        },
        {
          title: "Hotel Safe — Combination",
          learn: LK.hotelSafe.id,
          text: () => {
            K.learn(LK.hotelSafe.id);
            return "Wall safe, manager's office. Combination: the year the house opened, 1-8-8-4.\n(Stanley: if you are reading this, you are standing at my desk. Put the pen back.)";
          },
        },
        {
          title: "Open Hotel Safe",
          text: "The safe bolt clacks open.",
          action: () => {
            PV.unlockTagged("chelsea", "safe");
            K.notify("The hotel safe is unlocked.");
          },
        },
      ],
    };
  }

  // ==================================================================
  // DATA: items, dialogues, quest
  // ==================================================================
