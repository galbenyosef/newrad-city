// play-inline-247 02 — title
// Lines 24-373 of readable/play-inline-247.pretty.js (statement-aligned).
  const PR = G._pr;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const PI = Math.PI;
  const TAPES = ["pr_reel_nell1", "pr_reel_nell2", "pr_reel_nell3"];
  const tapeCount = () =>
    TAPES.filter((t) => PR.inv.count(t) > 0 || PR.flag("tape_" + t)).length;

  Object.assign(PR.flagDefaults, {
    mac_met: false,
    tapes_aired: false,
    pox_reported: false,
    mac_sample: false,
  });

  // ===================================================================
  // ITEMS
  // ===================================================================
  PR.item({
    id: "pr_reel_nell1",
    type: "tape",
    name: 'Tape reel: "Ten Days — Tape One"',
    title: "Nell Brady, New York World-Telegram — Tape 1 (19 Feb. 1967)",
    weight: 0,
    value: 5,
    text: "[A woman's voice, low and quick. Water drips somewhere.]\n\nNELL: Nell Brady, World-Telegram. Sunday, February the nineteenth, 1967. They admitted me this afternoon as \"Nellie Brown, amnesiac, harmless.\" I told the magistrate I couldn't remember my own address. Took him forty seconds to sign me over to the City of New York.\n\nFor the record, since nobody else will keep one: I'm not here for the paper. I'm here for Nicky. My roommate. Nicky's fella signs up Monday. Ninety days in a freezer and nobody will tell her why. \"Project Long Winter,\" Civil Defense, very hush-hush, nine hundred dollars and a handshake. She's seeing him off tonight and she's pretending she isn't scared. She's a terrible pretender.\n\nThe one thing anybody would tell me: Civil Defense sends its \"difficult\" volunteers here first. To this island. So here I am, difficult.\n\nDay one: the bath. They call it hydrotherapy. You lie in a tub under a canvas sheet with a hole for your head, and they run the water cold until you stop arguing. One of the orderlies has a Civil Defense pin on the inside of his lapel.\n\nTen days. That's the assignment. Ten days and I go home and tell Nicky her fella's in good hands.\n\n[A door. Keys. The recording stops.]",
  });
  PR.item({
    id: "pr_reel_nell2",
    type: "tape",
    name: 'Tape reel: "Ten Days — Tape Two"',
    title: "Nell Brady — Tape 2 (recorded in the Lodge, 1 Mar. 1967)",
    weight: 0,
    value: 5,
    text: "[Whispering. Padding muffles everything.]\n\nNELL: Day ten. They moved me to the Lodge for \"agitation.\" I asked to see a lawyer. That's agitation.\n\nI saw the file on the Superintendent's desk before they dragged me off. PROGRAM 12 — CONFINEMENT TOLERANCE. Contractor: Civil Defense, Mental Hygiene Division. They're measuring how long a sane person stays sane behind a locked door with no windows and a man who counts out loud. The numbers go to the Long Winter people, for the men who'll run the sleeper sites. Under the file there was a roster. C-9. Forty pods. \"Volunteers placed 20 Feb.\" Nicky's fella is on a list in a madman's drawer, and he went under the day after I came in. I can't even get word out to her.\n\nThe man in cell four has been counting since Tuesday. He's up to eleven thousand.\n\n[A long pause.]\n\nNELL: I'm hiding the tapes where they won't look. If I don't come out, find the other two. Get them on the air. Somebody has to hear this.",
  });
  PR.item({
    id: "pr_reel_nell3",
    type: "tape",
    name: 'Tape reel: "Ten Days — Tape Three"',
    title: "Nell Brady — Tape 3 (Saturday, 4 Mar. 1967, night)",
    weight: 0,
    value: 5,
    text: '[Very quiet. A telephone bell, far off, through a wall.]\n\nNELL: Day fourteen. So much for ten days. Saturday, March the fourth, about eleven at night. I\'m in the treatment room; Harrow left the hatch to his office open and I could hear him on the telephone. He took notes while he talked. He always takes notes.\n\nHe said: "Yes, sir. Marsh says tomorrow." Then: "Move the rolls to Liberty tonight. No public notice." Then he listened for a long time, and he said, "Then the Study continues through the emergency. I have that in writing."\n\nTomorrow. They know something is coming tomorrow, and they are moving their paperwork to an island, and they are not telling anyone.\n\n[Her breathing.]\n\nNELL: Nicky. Nicky, if you hear this, get out of the city. Don\'t wait for him at the station. Don\'t wait for anybody. Go north, go anywhere, just go.\n\nIf anybody else hears this: I was here. We were all here. Put it on the air.\n\n[The tape runs on in silence for a long time.]',
  });
  PR.item({
    id: "pr_note_admission",
    type: "note",
    name: "Admission Register (page)",
    title: "Welfare Island — Octagon Annex — Admissions, Feb.–Mar. 1967",
    weight: 0,
    value: 0,
    text: 'FEB 13 — F. Donnelly, 41. Refused to stop singing. Committed.\nFEB 14 — "Mr. X." Found on the Queensboro claiming the French were in the water supply. Committed. (He was right about the water.)\nFEB 17 — R. Allbeury, 29. Referred by employer (Civil Defense) for "excessive questions." Committed, Program 12.\nFEB 19 — Nellie Brown, 26. Amnesiac, harmless. Committed.\nFEB 22 — Dr. S. Klein (our own staff). Referred by Dr. Harrow. Committed, Program 12.\nMAR 4 — BEDS FULL. Direct all new admissions to the Lodge.\n\n[Pencilled in the margin:] Nellie Brown carries a pencil. Search her.',
  });
  PR.item({
    id: "pr_note_hydro",
    type: "note",
    name: "Hydrotherapy Schedule",
    title: "Hydrotherapy — Continuous Bath Rota",
    weight: 0,
    value: 0,
    text: 'CONTINUOUS BATH: 6 hrs minimum. Water 92°F (reduce to 60°F for the argumentative).\nWET SHEET PACK: 3 hrs. Wrap tight. Patients will calm or tire; both are acceptable.\nNEEDLE SHOWER: at nurse\'s discretion.\n\nNOTE: Tub 4 is leaking into the drain again. Maintenance says the water "glows a little." Maintenance says a lot of things. Use Tub 4 for Program 12 only.\n\n— Head Nurse O. Trask',
  });
  PR.item({
    id: "pr_oct_office_key",
    type: "key",
    name: "Superintendent's Office Key",
    weight: 0,
    value: 0,
    desc: 'A brass key on a tag: "SUPT. — L1 NORTH". The night nurse kept it in her apron.',
  });
  PR.item({
    id: "pr_oct_master_key",
    type: "key",
    name: "Superintendent's Master Key",
    weight: 0,
    value: 0,
    desc: "A heavy iron key on a leather thong, worn smooth by a man who never stopped walking the rounds. Opens every cell in the Octagon.",
  });
  PR.item({
    id: "pr_note_harrow_letter",
    type: "note",
    name: "Letter from Civil Defense",
    title: "Civil Defense Mental Hygiene Division — to Dr. C. Harrow",
    weight: 0,
    value: 0,
    text: 'Dear Doctor Harrow,\n\nThank you for the interim results of PROGRAM 12. The Board was delighted to learn that the average test subject retains "functional compliance" for 212 days of confinement, and that this figure rises to 340 days with a charismatic authority figure and regular group singing.\n\nWe will be passing your recommendations on to the Facility Director training program. The Long Winter sites in particular have requested your notes on "the counting behaviour."\n\nPlease continue the Study through any civil emergency. We cannot stress this enough. ANY civil emergency.\n\nWarmly,\nOffice of Civil Defense — Mental Hygiene Division\n"Prepare for the Future!"',
  });
  PR.item({
    id: "pr_note_harrow_final",
    type: "note",
    name: "The Superintendent's Last Entry",
    title: "C. Harrow — (undated, written in lamp-black)",
    weight: 0,
    value: 0,
    text: "Day 7,912 of the Study.\n\nThe subjects have ceased to cooperate with the round. I walk it for them. Up the stair, round and round, as it was designed — Davis built the stair so the keepers could watch every floor at once. The eye goes round. The eye never closes.\n\nThe words slide about on the page now. When I read them aloud they come out as noise. No matter. I know the files by heart.\n\nThe reporter's cell is empty. She has hidden things. I will find them. I will find them and I will file them. Everything must be filed.\n\nThe strongbox up here keeps the only number that matters: 340. Zero-three-four-oh.\n\nFunctional compliance: indefinite.",
    learn: "pr_oct_dome_safe",
  });
  PR.item({
    id: "pr_orbitoclast",
    build() {
      const base = PR.live("items") ? G.items.get("combat_knife") : null;
      const w =
        base && base.weapon
          ? Object.assign({}, base.weapon, {
              damage: Math.round((base.weapon.damage || 12) * 1.35),
              critChance: 4,
              critMult: 2.5,
              apCost: 10,
              meleeStyle: "stab",
              condDecay: (base.weapon.condDecay || 0.002) * 0.6,
            })
          : undefined;
      return {
        id: "pr_orbitoclast",
        type: w ? "weapon" : "misc",
        name: "The Orbitoclast",
        weight: 1,
        value: 400,
        unique: true,
        icon: base ? base.icon : undefined,
        desc: 'A surgical steel ice pick with a graduated shaft, from the Superintendent\'s display case. The engraving reads "500 — WITH GRATITUDE, C.D. MHD." Criticals come easily. Everything about it is wrong.',
        weapon: w,
      };
    },
  });
  PR.item({
    id: "pr_press_hat",
    type: "apparel",
    slot: "head",
    name: "Nell Brady's Press Fedora",
    weight: 1,
    value: 120,
    unique: true,
    dr: 1,
    attrs: { senses: 1 },
    skills: { persuasion: 5 },
    mesh: "hat_fedora",
    tags: ["apparel", "hat", "unique"],
    desc: 'A battered grey fedora with a "PRESS" card still tucked in the band. Nell Brady wore it into the Octagon. Old Mac kept it on a nail for twenty-two years in case she came back for it.',
  });
  PR.item({
    id: "pr_ren_quarantine_key",
    type: "key",
    name: "Quarantine Cellar Key",
    weight: 0,
    value: 0,
    desc: 'A long iron key tagged in red: "QUARANTINE — CELLAR — AUTHORIZED STAFF ONLY."',
  });
  PR.item({
    id: "pr_note_ren_nurse",
    type: "note",
    name: "Nurse Pell's Note",
    title: "To whoever takes the next shift",
    weight: 0,
    value: 0,
    text: "The Army men say it isn't smallpox down there. They say it's \"Variola-W,\" which means smallpox plus whatever Kessler-Haas put in it.\n\nThe patients in the cellar don't have pustules any more. They have extra — I don't know the word. Extra.\n\nI've locked the cellar and I'm keeping the key in my locker. Nobody goes down without a suit. Nobody. Not even the Lieutenant.\n\nIf the Lieutenant asks, I lost it.\n\n— M. Pell, R.N.",
  });
  PR.item({
    id: "pr_note_renwick_orders",
    type: "note",
    name: "Army Field Order",
    title: "U.S. ARMY — MEDICAL COMMAND — FIELD ORDER 77-419",
    weight: 0,
    value: 0,
    text: 'SUBJECT: Renwick Hospital ruin, Welfare Island.\n\n1. Site designated KESSLER-HAAS FIELD STATION 9 for the duration of PROJECT VARIOLA.\n2. Public cover: "Landmark stabilization works." Erect scaffolding and shoring. Do NOT complete them.\n3. Quarantine cellar to be restored to 1856 condition (cells, morgue). Laboratory to be installed behind the morgue.\n4. Civilian nursing staff may be retained. Civilian nursing staff may NOT be told.\n5. In the event of enemy attack, incinerate all cultures. Incineration is to be initiated from the laboratory terminal.\n\nBy order,\nCol. A. Strickland, Medical Command',
  });
  PR.item({
    id: "pr_reel_variola",
    type: "tape",
    name: 'Tape reel: "Variola — Final Log"',
    title: "Dr. H. Oyelaran, Kessler-Haas — Field Station 9",
    weight: 0,
    value: 5,
    text: "[A respirator hisses between sentences.]\n\nOYELARAN: Final log. The bombs fell nine hours ago. The Colonel ordered incineration. I did not incinerate.\n\nI want that on the record. Not because I was brave. Because the cultures had finally stabilised. Variola for the delivery, the K-agent for the... remodelling. The subjects in the cellar are not dying any more. They are changing. They are joining.\n\nThe Matron — that's what the nurses called her, before — has taken the others into herself. She moves on too many hands. She sings.\n\nThe incineration switch is on the lab terminal. The code is in my head, and the lab seal answers to the morgue terminal. If you are hearing this and you are not me: burn it. Please burn it.\n\n[Something wet moves near the microphone. The respirator stops.]",
  });
  PR.item({
    id: "pr_kagent_sample",
    type: "misc",
    name: "Variola-W Culture Sample",
    weight: 1,
    value: 250,
    desc: 'A sealed steel canister, faintly warm, labelled "V-W / K-agent STRAIN 7 — DO NOT OPEN." Something inside it moves when you tilt it.',
  });
  PR.item({
    id: "pr_ren_gasmask",
    type: "apparel",
    slot: "head",
    name: "Quarantine Officer's Gas Mask",
    weight: 2,
    value: 180,
    unique: true,
    dr: 4,
    radResist: 15,
    skills: { medicine: 5 },
    mesh: "helmet_gasmask",
    tags: ["apparel", "helmet", "unique"],
    desc: "A rubberised 1967 Army biohazard mask with a red cross stencilled over one eyepiece. The filters are sealed and, somehow, still good.",
  });

  // ===================================================================
  // TERMINALS
  // ===================================================================
  PR.terminal("pr_oct_nurse", {
    title: "OCTAGON ANNEX — NIGHT NURSE STATION",
    header: "MERIDIAN TELETYPE CO. — TELELINK — METROPOLITAN HOSPITAL NETWORK",
    lock: 0,
    entries: [
      {
        title: "Patient Census — 4 Mar 1967",
        text: "WARD A (FEMALE): 14 / 12 BEDS\nWARD B (MALE, SOUTH WING): CLOSED — FIRE DAMAGE\nTHE LODGE: 10 / 10 CELLS\nPROGRAM 12 SUBJECTS: 23\nSTAFF ON SITE: 7\nSUPERINTENDENT: ON SITE (ALWAYS)",
      },
      {
        title: "Night Log",
        text: 'Mar 1 — Brown (Ward A) found with a pencil again. Confiscated. That makes nine pencils.\nMar 2 — Brown asked what "Program 12" is. Told her it\'s a television show.\nMar 3 — Brown moved to the Lodge per Dr. H.\nMar 4 — Dr. H. walked the stair all night with the lamp. Counting.\nMar 5 — SIRENS. Dr. H. has chained the service gate. Says it\'s "to keep the Study sealed." The office key is in my apron if anyone needs it. I think I need to leave.',
      },
      {
        title: "Memo: Superintendent's Teletype",
        learn: "pr_oct_harrow",
        text: "Dr. H. has asked that his personal teletype word be changed every month. It has been COUNTING since 1964. Nobody has the nerve to tell him.",
      },
      {
        title: "Memo: Service Stair",
        text: "FROM: C. Harrow, Superintendent\n\nThe staff stair between Hydrotherapy and the Treatment Room is to remain CHAINED on the hydrotherapy side at all times. Staff will use the rotunda stair like everybody else. The rotunda stair was designed so that the keepers can see every floor as they climb. We will be SEEN climbing.",
      },
    ],
  });
  PR.terminal("pr_oct_harrow", {
    title: "SUPERINTENDENT — DR. CORNELIUS HARROW",
    header:
      "MERIDIAN TELETYPE CO. — TELELINK — PERSONAL (CIVIL DEFENSE MHD LINK)",
    lock: PR.LOCKS.oct_harrow,
    entries: [
      {
        title: "Office Safe",
        learn: "pr_oct_office_safe",
        text: "Office safe: 0-2-1-2. Two hundred and twelve days, the first compliance figure. I am sentimental about numbers.",
      },
      {
        title: "Program 12 — Summary",
        text: 'OBJECTIVE: Establish the confinement tolerance of the average citizen for the Long Winter Facility Director training curriculum.\n\nMETHOD: Subjects confined with no clocks, no windows and a single authority figure who counts aloud.\n\nFINDINGS: Subjects stay compliant longer when the authority figure never sleeps. I have stopped sleeping.\n\nNOTE: the reporter "Nellie Brown" is not an amnesiac. Nobody that curious has ever forgotten anything. She asks about the Long Winter roster by name. Keep her in the Lodge.',
      },
      {
        title: "Personal Log — Mar 5",
        text: "Sunday. The flash came through the drum windows at a quarter to ten and lit the whole rotunda like noon. The Study must continue through any civil emergency; I have that in writing, and I was told last night to expect one. I have given the subjects tonight's sedative now. I have given it to all of them at once.\n\nI am going up to the dome to watch. The eye goes round.",
      },
      {
        title: () =>
          PR.flag("oct_cell6")
            ? "Lodge: Cell 6 released"
            : "Lodge: Release Cell 6 lock",
        action: () => {
          PR.setFlag("oct_cell6_picked", true);
          PR.setFlag("oct_cell6", true);
          PR.safe("unlock", () => {
            if (PR.locksLive()) G.locks.unlock(PR.LOCKS.oct_cell6.id);
          });
          return "CELL 6 — MAGNETIC BOLT RELEASED. (Why would you do that?)";
        },
      },
    ],
  });
  PR.terminal("pr_ren_nurse", {
    title: "WELFARE ISLAND — RENWICK STATION (NURSING)",
    header:
      "MERIDIAN TELETYPE CO. — TELELINK — U.S. ARMY MEDICAL COMMAND / CIVILIAN ANNEX",
    entries: [
      {
        title: "Shift Roster",
        text: "DAY: M. Pell, R.N. / J. Ocasio, R.N.\nNIGHT: M. Pell, R.N. (double) / J. Ocasio, R.N. (double)\nNOTE: Nurse Ocasio has not reported for three shifts. Last seen going down to the cellar with the Lieutenant.",
      },
      {
        title: "Quarantine Protocol",
        learn: "pr_ren_morgue",
        text: "The cellar gate stays locked. The key is held by the senior nurse on shift (quarters, north end of this floor).\nAll bodies go to the morgue. The laboratory seal is controlled from the morgue teletype (word: LAZARUS — the Army's joke, not ours). Civilian staff do NOT open the laboratory seal.",
      },
      {
        title: "Message from M. Pell",
        text: "To the Army: you told us it was smallpox. Smallpox doesn't walk on its hands. — M.P.",
      },
    ],
  });
  PR.terminal("pr_ren_morgue", {
    title: "RENWICK — MORGUE / INTAKE",
    header: "MERIDIAN TELETYPE CO. — TELELINK — KESSLER-HAAS FIELD STATION 9",
    lock: PR.LOCKS.ren_morgue,
    entries: [
      {
        title: "Laboratory Access",
        learn: ["pr_ren_seal", "pr_ren_lab"],
        text: "LABORATORY SEAL — manual keypad 1-8-5-6 (the year the cellar was dug; the Colonel likes history).\nCULTURE CONTROL teletype — word VARIOLA. Staff are reminded that a password is not a project name. Staff have ignored this.",
      },
      {
        title: "Intake Log",
        text: 'SUBJ 04 — deceased. SUBJ 07 — deceased. SUBJ 11 — deceased, then not deceased. Transferred to laboratory.\nSUBJ 12–19 — transferred to laboratory ("joined").\nM. OCASIO, R.N. — transferred to laboratory. (Not a subject. Transferred anyway. The Matron asked for her.)',
      },
      {
        title: () =>
          PR.flag("ren_seal")
            ? "Laboratory Seal: OPEN"
            : "Open Laboratory Seal",
        action: () => {
          if (!PR.flag("ren_seal")) {
            PR.setFlag("ren_seal_picked", true);
            PR.setFlag("ren_seal", true);
            PR.safe("unlock", () => {
              if (PR.locksLive()) G.locks.unlock(PR.LOCKS.ren_seal.id);
            });
            PR.q.advance("pr_pox", ["enter", "cellar"], "lab");
            return "SEAL DISENGAGED. PRESSURE EQUALIZING. BSL-4 SUITS REQUIRED BEYOND THIS POINT.";
          }
          return "The seal is already open.";
        },
      },
    ],
  });
  PR.terminal("pr_ren_lab", {
    title: "PROJECT VARIOLA — CULTURE CONTROL",
    header:
      "MERIDIAN TELETYPE CO. — TELELINK — KESSLER-HAAS FIELD STATION 9 (CLASSIFIED)",
    lock: PR.LOCKS.ren_lab,
    entries: [
      {
        title: "Hazard Suit Locker",
        learn: "pr_ren_lab_locker",
        text: "Suit locker combination: 0-4-1-9, per Field Order 77-419. Change it after the inspection. (There will be no inspection.)",
      },
      {
        title: "Project VARIOLA — Abstract",
        text: 'Variola major is the most efficient delivery vehicle ever evolved for a human-tropic payload. The K-agent is the most ambitious payload ever designed.\n\nVARIOLA-W combines them. Transmission: respiratory. Result: organism "improvement" in 11–30 days.\n\nSide effects: the subjects tend to merge.',
      },
      {
        title: "Culture Status",
        text: () =>
          PR.flag("ren_purged")
            ? "CULTURES: INCINERATED. TANKS: CLEAN. THANK YOU FOR YOUR COMPLIANCE."
            : "CULTURE TANKS 1–3: ACTIVE, STABLE, TEMPERATURE 37.2°C.\nINCINERATION CYCLE: NOT INITIATED (OVERRIDE BY DR. H. OYELARAN, 5 MAR 1967).",
      },
      {
        title: () =>
          PR.flag("ren_purged")
            ? "Incineration Complete"
            : "Initiate Incineration Cycle",
        action: () => {
          if (PR.flag("ren_purged")) return "Nothing left to burn.";
          PR.purgeTanks();
          return "INCINERATION CYCLE INITIATED.\nTANK 1 ... BURNING\nTANK 2 ... BURNING\nTANK 3 ... BURNING\nThe smell reaches you through the terminal fan.";
        },
      },
    ],
  });
