// play-inline-335 05 — title
// Lines 2984-3319 of readable/play-inline-335.pretty.js (statement-aligned).
  function shutterClosed(ctx) {
    const s = ctx.shutter;
    if (!s) return;
    s.opening = false;
    s.t = 0;
    s.obj.position.y = 0;
    s.obj.visible = true;
    s.obj.traverse((o) => {
      if (o.isMesh || o.isPoints) {
        o.matrixAutoUpdate = true;
      }
    });
    if (!s.col)
      s.col = G.world.addBox(
        ctx.O.x + SHUT.x0,
        ctx.O.y,
        ctx.O.z + SHUT.z - 0.15,
        ctx.O.x + SHUT.x1,
        ctx.O.y + 3.2,
        ctx.O.z + SHUT.z + 0.15,
        { tag: "poi_eastvillage", surface: "metal", walkable: false },
      );
  }
  function openShutter(ctx, instant) {
    const s = ctx.shutter;
    if (!s) return;
    if (s.col) {
      K.safe("shutcol", () => G.world.removeCollider(s.col));
      s.col = null;
    }
    if (instant) {
      s.obj.visible = false;
      s.opening = false;
      return;
    }
    if (!s.opening && s.obj.visible) {
      s.opening = true;
      s.t = 0;
      K.sfx("cryo_door", K.world(ctx, 0, 1.5, SHUT.z));
    }
  }
  EV.cuOpenShutter = function (instant) {
    EV.setFlag("cu_shutter", true);
    const ctx = EV.ctxs.find((c) => c.id === "cooper");
    if (ctx) openShutter(ctx, instant);
    if (K.q.active("pev_right_makes_might")) {
      const st = K.q.stage("pev_right_makes_might");
      if (st === "enter" || st === "override")
        K.q.set("pev_right_makes_might", "hall");
    }
  };

  // ==================================================================
  // TERMINALS
  // ==================================================================
  function termPanel() {
    return {
      title: "PROCTOR ACCESS PANEL — GREAT HALL",
      header:
        "KESTREL TELETYPE CORP. — MODEL 40 LINE PROTOCOL\nPROCTOR SYSTEM v2.3 — CAMPUS SECURITY",
      lock: {
        id: "pev_lk_cu_panel",
        passcode: "SEMINAR",
        key: "pev_cu_override_card",
        hint: "Abigail Hewitt remembers the faculty passcode; the Dean's override card also works.",
      },
      entries: [
        {
          title: "Examination Status",
          text: 'EXAM: CE 401 FINAL, SECTION B\nSTATUS: IN PROGRESS\nSTUDENTS PRESENT: 211\nSTUDENTS RESPONDING: 0\nNOTE: Non-responsive students will be marked "ABSENT" and EXPELLED at the next roll call. Next roll call: continuous.',
        },
        {
          title: "Raise Security Shutter",
          text: "Shutter override accepted. Please proceed quietly. The examination is still in progress.",
          action: () => EV.cuOpenShutter(false),
          cond: () => !EV.flag("cu_shutter"),
        },
        {
          title: "Proctor Unit Roster",
          text: 'UNIT P-01 "PROFESSOR LINCOLN-TRON" — Great Hall lectern (lecture & proctoring)\nUNIT P-02 "PROCTOR" — Library (silence enforcement)\nUNITS P-03..P-11 — hallways (truancy enforcement)\n\nAll units report: ALL STUDENTS SEATED. ALL STUDENTS QUIET. EXCELLENT DISCIPLINE.',
        },
      ],
    };
  }
  function termRobotics() {
    return {
      title: "ROBOTICS LAB — PROF. W. HEWITT",
      header:
        "KESTREL TELETYPE CORP. — MODEL 40 LINE PROTOCOL\nCOOPER UNION / ARDENT ROBOTICS TECHNICAL ACADEMY",
      entries: [
        {
          title: "Grant Memo: Ardent Partnership",
          text: 'The Board is pleased to announce the Ardent Robotics Technical Academy partnership. In exchange for naming rights, Ardent will supply eleven Proctor-model units to manage examinations, freeing faculty for research.\n\nThe founding principle of Cooper Union — education "free as air and water" — is unchanged. Tuition, however, is now $4,100 per semester.',
        },
        {
          title: "Note: the Founder's Strongbox",
          learn: "pev_lk_cu_strongbox",
          text: "Facilities asked again. The founder's strongbox in the sub-basement still uses Peter Cooper's own combination: 1-8-3-0, the year of his Tom Thumb engine. Nobody has opened it since 1959. Nobody will.",
        },
        {
          title: "Log: The Lincoln Program",
          text: 'For the Founders\' Day gala I have loaded P-01 with the complete text of Lincoln\'s 1860 address, a stovepipe hat and a voice synthesizer. The students find it hilarious. The Dean finds it "on brand."\n\nMinor bug: when interrupted, P-01 restarts the speech from the beginning. When interrupted by weapons fire, P-01 considers this "heckling" and removes the heckler.',
        },
        {
          title: "Log: March 5, 1967",
          text: "Sirens. The Proctors locked down the building per exam protocol — \"no student may leave during an examination.\" I tried to override. The Dean has the only override card.\n\nThe Dean is in his office. The Dean will not open his door. I am going to O'Rourke's to wait this out. Abigail, my love, if you read this, I'm sorry about the ale, and about the scholarship exam on a Sunday. It was my idea.",
        },
      ],
    };
  }
  function termDean() {
    return {
      title: "OFFICE OF THE DEAN",
      header:
        "KESTREL TELETYPE CORP. — MODEL 40 LINE PROTOCOL\nCOOPER UNION — ADMINISTRATION",
      lock: {
        id: "pev_lk_cu_dean",
        passcode: "STANDARDS",
        hint: "The study-group tape reel in the student lounge.",
      },
      entries: [
        {
          title: "Founders' Day Speech (draft 14)",
          text: '"...and as Lincoln said in this very building: Let us have faith that right makes might. And as I say: let us have faith that the Ardent partnership makes budget."\n\n[Note: cut the budget line? — no, keep, Board will love it]',
        },
        {
          title: "Office Safe",
          learn: "pev_lk_cu_dean_safe",
          text: "Safe combination: the year of our founding, 1-8-5-9. Even I can remember 1859. — Office of the Dean",
        },
        {
          title: "Memo: Proctor Override",
          text: "The Proctor override is a punch card kept in my desk. It is the ONLY override. Do not ask for it. Do not ask where my desk is. My desk is here. I am always at my desk.\n\nThe card also works at the Great Hall lectern to END an examination early, which I will never do, because standards.",
        },
        {
          title: "Personal Log — Mar 5",
          text: "The students are panicking. The Proctors are keeping them seated, which is, frankly, the first time the Proctors have done exactly what I asked.\n\nI could end the exam. The card is right here. But if I end it early, the Board will say I lowered standards.\n\nI will wait until the time runs out. It's a three-hour exam. How long can three hours be?",
        },
        {
          title: "Unlock Desk Drawer",
          text: "The desk drawer clicks open.",
          action: () => {
            EV.setFlag("cu_drawer", true);
            K.notify("The Dean's desk drawer is unlocked.");
            spawnOverride();
          },
          cond: () => !EV.flag("cu_drawer"),
        },
      ],
      onUnlock: () => {
        EV.setFlag("cu_dean_unlocked", true);
      },
    };
  }
  function termLectern() {
    return {
      title: "GREAT HALL LECTERN — PROCTOR MASTER CONTROL",
      header:
        "KESTREL TELETYPE CORP. — MODEL 40 LINE PROTOCOL\nPROCTOR SYSTEM v2.3 — MASTER",
      lock: {
        id: "pev_lk_cu_lectern",
        key: "pev_cu_override_card",
        hint: "Only the Dean's override punch card (his desk drawer) works at the lectern.",
      },
      entries: [
        {
          title: "Lecture Queue",
          text: '1. "Address at Cooper Institute", A. Lincoln, Feb 27 1860 (loop)\n2. Pencils down (loop)\n3. Pencils down (loop)',
        },
        {
          title: "END EXAMINATION",
          text: "EXAMINATION CE 401 HAS ENDED.\nTIME: 11,571,840 MINUTES (OVERTIME)\nAVERAGE GRADE: INCOMPLETE\n\nProctor units are returning to their charging pods. Thank you for choosing the Ardent Robotics Technical Academy.",
          action: () => endExam(),
          cond: () => !EV.flag("cu_exam_over"),
        },
        {
          title: "Grade Report",
          text: 'All 211 students: INCOMPLETE.\nComment (auto-generated): "Showed up. Stayed. Did not finish." ',
          cond: () => !!EV.flag("cu_exam_over"),
        },
      ],
    };
  }
  function spawnOverride() {
    if (EV.flag("cu_card_taken") || K.has("pev_cu_override_card")) return;
    const a = EV.anchor("cooper", "override");
    if (a)
      K.safe("card", () => {
        if (!G.isStub("items") && G.items.spawnPickup)
          G.items.spawnPickup(
            "pev_cu_override_card",
            1,
            { x: a.x, y: a.y, z: a.z },
            { static: false, keepY: true, noSave: true },
          );
      });
  }
  function endExam() {
    EV.setFlag("cu_exam_over", true);
    EV.cuOpenShutter(true);
    // every robot in the building powers down
    let n = 0;
    K.safe("shutdown", () => {
      if (G.isStub("actors") || !G.actors.list) return;
      const c = EV.ctxs.find((q) => q.id === "cooper");
      if (!c) return;
      for (const a of G.actors.list()) {
        if (!a || a.dead || a.faction !== "robots") continue;
        if (Math.abs(a.pos.x - c.O.x) > 170 || Math.abs(a.pos.z - c.O.z) > 170)
          continue;
        // no killer: combat treats a non-actor `source` string as an actor (killer.bark / enterCombat), which threw
        // after the first robot and left the rest of the Proctors hostile
        K.safe("shutdown1", () => a.kill({ silent: true }));
        n++;
      }
    });
    K.notify(
      n
        ? "The Proctor units power down. (" + n + ")"
        : "The Proctor system shuts down.",
    );
    K.xp(150, "Ended the examination");
    K.standing(20, "Ended the eternal exam");
    if (K.q.active("pev_right_makes_might"))
      K.q.set("pev_right_makes_might", "return");
  }

  // ==================================================================
  // DATA (items, quest) & SPAWN
  // ==================================================================
  function data() {
    K.defineItem({
      id: "pev_cu_override_card",
      type: "key",
      name: "Dean's Override Punch Card",
      weight: 0,
      value: 0,
      quest: true,
      desc: 'A stiff manila punch card, "PROCTOR MASTER OVERRIDE — DEAN ONLY" printed across the top. Works at the Proctor access panel and the Great Hall lectern.',
    });
    K.defineItem({
      id: "pev_abe_hat",
      type: "apparel",
      slot: "head",
      name: "Honest Abe's Stovepipe Hat",
      weight: 1,
      value: 180,
      attrs: { presence: 1, wits: 1 },
      skills: { persuasion: 5 },
      mesh: "hat_top",
      tags: ["apparel", "hat", "unique"],
      desc: "Seven inches of black silk, prised off a robot that thought it was the sixteenth President. Smells faintly of ozone. Four score and seven percent more persuasive.",
    });
    K.defineItem({
      id: "pev_tom_thumb",
      type: "misc",
      name: "Tom Thumb Locomotive Model",
      weight: 3,
      value: 320,
      tags: ["valuable", "unique"],
      desc: "Peter Cooper's own brass-and-copper model of the Tom Thumb, America's first home-built steam engine (1830). The real one lost a race to a horse. This one has never lost anything, because it has never raced.",
    });
    K.defineItem({
      id: "pev_cu_diploma",
      type: "misc",
      name: "Cooper Union Diploma (Incomplete)",
      weight: 0.2,
      value: 5,
      tags: ["unique"],
      desc: 'Hand-lettered by Abigail Hewitt on the back of a library card. "Awarded for ending the longest final examination in history. Grade: INCOMPLETE. Honors: Highest."',
    });
    if (!G.isStub("quests") && G.quests.define) {
      G.quests.define({
        id: "pev_right_makes_might",
        name: "Right Makes Might",
        giver: "Abigail Hewitt",
        location: "Cooper Union",
        desc: 'Abigail Hewitt, who was once Cooper Union\'s librarian, wants her school back. Since March 1967 the Ardent Robotics "Proctor" robots have kept the Foundation Building locked in an endless Sunday scholarship exam — and they expel truants with ray emitters.',
        stages: [
          {
            id: "enter",
            text: "Get into the Cooper Union Foundation Building on Cooper Square.",
            markers: [
              () => {
                const c = EV.ctxs.find((q) => q.id === "cooper");
                const a = c && c.anchors.door;
                return a ? { x: a.x, z: a.z, label: "Cooper Union" } : null;
              },
            ],
          },
          {
            id: "override",
            text: "Find the Dean's override punch card (Dean's office, second floor).",
            markers: [
              () => {
                const a = EV.anchor("cooper", "override");
                return a
                  ? {
                      x: a.x,
                      z: a.z,
                      y: a.y,
                      label: "Dean's Office",
                      interior: "cooper_union",
                    }
                  : null;
              },
            ],
          },
          {
            id: "hall",
            text: "Reach the Great Hall and end the examination at the lectern.",
            markers: [
              () => {
                const a = EV.anchor("cooper", "boss");
                return a
                  ? {
                      x: a.x,
                      z: a.z,
                      y: a.y,
                      label: "Great Hall Lectern",
                      interior: "cooper_union",
                    }
                  : null;
              },
            ],
          },
          {
            id: "return",
            text: "Tell Abigail Hewitt at O'Rourke's that the exam is over.",
            markers: [{ npc: "pev_abigail", label: "Abigail" }],
          },
        ],
        rewards: { xp: 300, scrip: 120, standing: 10 },
      });
    }
  }
