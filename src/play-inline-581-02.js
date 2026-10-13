// play-inline-581 02 — lou
// Lines 363-634 of readable/play-inline-581.pretty.js (statement-aligned).
  const Lou = (QX.monte = {
    bet: 0,
    state: null,
    el: null,
    rigged(bet) {
      return bet >= 25 && !QX.flag("lou_caught") && !QX.flag("lou_honest");
    },
    /** Chance to spot the palm, from Senses. */
    spotChance() {
      return Math.min(0.95, Math.max(0, (QX.attr("senses") - 5) * 0.26));
    },
    /** Senses hunch at the pick: nothing below Senses 6, then 12% per point (Senses 10 = 60%). */
    hunchChance() {
      return Math.min(0.6, Math.max(0, (QX.attr("senses") - 5) * 0.12));
    },
    play(bet) {
      if (!QX.pay(bet)) return false;
      QX.inc("monte_games");
      Lou.bet = bet;
      setTimeout(() => {
        if (G.state === "play" || G.state === "dialogue") Lou.open();
      }, 80); // after the dialogue has closed
      return true;
    },
    open() {
      Lou.close();
      const root = QX.el("div", "qx-monte");
      root.innerHTML =
        '<div class="qx-monte-panel"><div class="qx-monte-title">FINGERS FIORELLO\'S — FOLLOW THE LADY</div>' +
        '<div class="qx-monte-bet"></div><div class="qx-monte-table"></div><div class="qx-monte-msg">Watch the queen...</div>' +
        '<div class="qx-monte-btns"></div></div>';
      Lou.el = root;
      root.querySelector(".qx-monte-bet").textContent =
        "BET: " + Lou.bet + " SCRIP   ·   PAYS 2 TO 1";
      const table = root.querySelector(".qx-monte-table");
      const cards = [];
      for (let i = 0; i < 3; i++) {
        const c = document.createElement("div");
        c.className = "qx-monte-card";
        c.dataset.i = i;
        c.innerHTML =
          '<div class="qx-card-back"></div><div class="qx-card-face">' +
          (i === 1
            ? "<b>Q</b><span>&#9829;</span>"
            : "<b>" + (i ? "7" : "2") + "</b><span>&#9827;</span>") +
          "</div>";
        table.appendChild(c);
        cards.push(c);
      }
      // slot[i] = which card element sits in position i; queen = card 1
      const S = (Lou.state = {
        cards,
        slot: [0, 1, 2],
        swaps: 0,
        phase: "show",
        t: 0,
        rig: Lou.rigged(Lou.bet),
        spotted: false,
        chosen: -1,
      });
      S.total = 5 + (Lou.bet >= 50 ? 5 : Lou.bet >= 25 ? 3 : 0);
      S.speed = Math.max(
        0.2,
        0.62 - QX.attr("senses") * 0.035 - (Lou.bet >= 50 ? 0.12 : 0),
      );
      Lou.layout(true);
      G.setState("qx_monte");
      QX.sfx("ui_click");
      setTimeout(() => {
        if (Lou.state === S) {
          for (const c of cards) c.classList.add("down");
          S.phase = "shuffle";
          Lou.step();
        }
      }, 1400);
    },
    layout(instant) {
      const S = Lou.state;
      if (!S) return;
      S.slot.forEach((ci, pos) => {
        const c = S.cards[ci];
        c.style.transition = instant
          ? "none"
          : "left " +
            S.speed +
            "s ease-in-out, transform " +
            S.speed +
            "s ease-in-out";
        c.style.left = pos * 132 + 14 + "px";
      });
    },
    step() {
      const S = Lou.state;
      if (!S || S.phase !== "shuffle") return;
      if (S.swaps >= S.total) {
        S.phase = "pick";
        Lou.pickable(true);
        // [Senses] a hunch: fair games only point at the real queen; on a palmed
        // game a sharp-eyed player simply feels that none of the three is her.
        if (!S.spotted && Math.random() < Lou.hunchChance()) {
          if (S.palmed) {
            S.spotted = true;
            Lou.pickable(true);
            Lou.msg(
              "[Senses] A cold, certain little feeling: she isn't on this table at all.",
            );
          } else {
            const pos = S.slot.indexOf(1);
            S.cards[1].classList.add("hunch");
            Lou.msg(
              "[Senses] You get a feeling about the " +
                ["left", "middle", "right"][pos] +
                " card.",
            );
          }
        } else if (!S.spotted) Lou.msg("Where's the lady? Pick a card.");
        return;
      }
      const a = Math.floor(Math.random() * 3);
      let bb = Math.floor(Math.random() * 2);
      if (bb >= a) bb++;
      const t = S.slot[a];
      S.slot[a] = S.slot[bb];
      S.slot[bb] = t;
      S.cards[S.slot[a]].style.transform = "translateY(-14px)";
      S.cards[S.slot[bb]].style.transform = "translateY(14px)";
      Lou.layout(false);
      setTimeout(() => {
        if (Lou.state !== S) return;
        for (const c of S.cards) c.style.transform = "";
      }, S.speed * 500);
      S.swaps++;
      // the palm: on a rigged game, midway through, Fingers lifts the queen — a sharp eye may catch it
      if (S.rig && S.swaps === Math.ceil(S.total * 0.6)) {
        S.palmed = true;
        if (Math.random() < Lou.spotChance()) {
          S.spotted = true;
          Lou.msg(
            "[Senses] Fingers' pinky dips toward his cuff as the cards cross. Did the queen just... leave?",
          );
        }
      }
      QX.sfx("ui_tick");
      setTimeout(() => Lou.step(), S.speed * 1000 + 40);
    },
    pickable(on) {
      const S = Lou.state;
      if (!S) return;
      for (const c of S.cards) {
        c.classList.toggle("pick", on);
        c.onclick = on
          ? () => Lou.pick(S.slot.indexOf(Number(c.dataset.i)))
          : null;
      }
      const btns = Lou.el.querySelector(".qx-monte-btns");
      btns.innerHTML = "";
      if (on && S.spotted)
        Lou.btn('"Fingers. Show me your sleeve."', () => Lou.callOut());
      if (!on) Lou.btn("Done", () => Lou.finish());
    },
    btn(label, fn) {
      const b = document.createElement("button");
      b.className = "qx-monte-btn";
      b.textContent = label;
      b.onclick = fn;
      Lou.el.querySelector(".qx-monte-btns").appendChild(b);
      return b;
    },
    msg(t) {
      if (Lou.el) Lou.el.querySelector(".qx-monte-msg").textContent = t;
    },
    pick(pos) {
      const S = Lou.state;
      if (!S || S.phase !== "pick") return;
      S.phase = "reveal";
      S.chosen = pos;
      Lou.pickable(false);
      const ci = S.slot[pos];
      let win = ci === 1 && !S.palmed;
      if (S.palmed && ci === 1) {
        // the queen was palmed; Fingers "reveals" a club where she should be and drops her under another card
        S.cards[1].querySelector(".qx-card-face").innerHTML =
          "<b>7</b><span>&#9827;</span>";
      }
      S.cards[ci].classList.remove("down");
      setTimeout(() => {
        if (Lou.state !== S) return;
        for (const c of S.cards) c.classList.remove("down");
        if (S.palmed && ci === 1) {
          const other = S.cards[(ci + 1) % 3];
          other.querySelector(".qx-card-face").innerHTML =
            "<b>Q</b><span>&#9829;</span>";
        }
        if (win) {
          QX.giveScrip(Lou.bet * 2);
          QX.inc("monte_won", Lou.bet);
          Lou.msg(
            "The lady! You win " +
              Lou.bet * 2 +
              " Scrip. Fingers grins like it hurts.",
          );
          QX.say(
            "qx_lou",
            [
              "Beginner's luck! Go again, go again!",
              "Ooh, sharp eyes on this one!",
              "The lady likes you! She never likes ME.",
            ][Math.floor(Math.random() * 3)],
          );
        } else {
          QX.inc("monte_lost", Lou.bet);
          Lou.msg(
            S.palmed
              ? "Not the lady. ...Somehow, she's under the other card now. Fingers shrugs, all innocence."
              : "Not the lady. Fingers sweeps your Scrip away with a sympathetic wince.",
          );
          QX.say(
            "qx_lou",
            [
              "So close! SO close!",
              "The lady's a tricky one!",
              "Double or nothing? Double or nothing!",
            ][Math.floor(Math.random() * 3)],
          );
        }
      }, 700);
    },
    callOut() {
      const S = Lou.state;
      if (!S) return;
      Lou.close();
      G.setState("play");
      QX.setFlag("lou_caught");
      QX.talk("qx_dlg_lou", "qx_lou");
    },
    finish() {
      Lou.close();
      if (G.state === "qx_monte") G.setState("play");
    },
    close() {
      if (Lou.el) {
        Lou.el.remove();
        Lou.el = null;
      }
      Lou.state = null;
    },
  });
  document.addEventListener(
    "keydown",
    (e) => {
      if (G.state !== "qx_monte" || !Lou.state) return;
      if (e.code === "Escape" || e.code === "Tab") {
        e.preventDefault();
        if (Lou.state.phase === "shuffle" || Lou.state.phase === "show") return;
        Lou.finish();
      }
      if (Lou.state.phase === "pick" && /^Digit[123]$/.test(e.code))
        Lou.pick(Number(e.code.slice(5)) - 1);
    },
    true,
  );
  QX.hook("reset", () => {
    Lou.close();
    pendingCard = null;
  });
  G.events.on("actorKilled", (a) => {
    if (a && a.id === "qx_lou") QX.setFlag("lou_gone");
  });

  // ==================================================================
  // Dialogue
  // ==================================================================
