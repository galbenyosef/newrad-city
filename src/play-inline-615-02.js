// play-inline-615 02 — code
// Lines 354-534 of readable/play-inline-615.pretty.js (statement-aligned).
  function footer() {
    const t = totals();
    const m = merch(B.actor);
    const w = X.invWeight() + t.wIn - t.wOut,
      max = X.carryMax();
    const bcls = t.balance < 0 && X.scrip() < -t.balance ? "bal-neg" : "";
    const balTxt =
      t.balance === 0 ? "0" : (t.balance > 0 ? "+" : "") + t.balance;
    const theirs = X.purse(m) || 0;
    const shortTxt =
      t.balance > 0 && theirs < t.balance
        ? ' <span class="bal-neg">(they have ' + theirs + ")</span>"
        : "";
    return (
      "<span>WT " +
      X.fmtNum(w) +
      "/" +
      Math.round(max) +
      '<span class="ui-wbar' +
      (w > max ? " over" : "") +
      '"><i style="width:' +
      Math.min(100, (w / max) * 100) +
      '%"></i></span></span>' +
      "<span>SELL <b>" +
      t.sell +
      "</b> &nbsp; BUY <b>" +
      t.buy +
      "</b></span>" +
      '<span class="big ' +
      bcls +
      '">BALANCE ' +
      balTxt +
      shortTxt +
      "</span>"
    );
  }

  /** Row right-hand side: weight (dim) + price. */
  function rt(e, price) {
    const w = e.def.weight || 0;
    return (
      '<span class="wg">' +
      X.fmtNum(w) +
      '</span><span class="pr">' +
      price +
      "</span>"
    );
  }

  const screen = {
    id: "barter",
    onKey(code, e) {
      if (!B) return false;
      if (B.w.qtyOpen) return B.w.qtyOpen.onKey(code);
      if (B.busy) return true;
      const K = X.K;
      const shift = e && e.shiftKey;
      if (K.up(code)) B.w.move(-1);
      else if (K.down(code)) B.w.move(1);
      else if (K.left(code)) B.w.switchCol(0);
      else if (K.right(code)) B.w.switchCol(1);
      else if (code === "Enter" || code === "NumpadEnter" || code === "KeyE")
        activate(B.w.focus, B.w.current(), shift);
      else if (code === "Space" || code === "KeyF") accept();
      else if (code === "KeyR") {
        B.sellMarks.clear();
        B.buyMarks.clear();
        X.sfx("ui_back", { volume: 0.4 });
        B.w.render();
      } else if (code === "KeyQ" || code === "PageUp") B.w.nextCat(-1);
      else if (code === "KeyZ" || code === "PageDown") B.w.nextCat(1);
      else if (K.digit(code) >= 1 && K.digit(code) <= 6)
        B.w.setCat(K.digit(code) - 1);
      else if (code === "Escape" || code === "Tab") close();
      return true;
    },
  };

  function close() {
    if (!B) return;
    const s = B;
    B = null;
    X.popScreen(screen);
    s.w.destroy();
    X.sfx("ui_back", { volume: 0.5 });
    G.events.emit("barterClosed", s.actor);
    if (s.onClose) {
      try {
        s.onClose();
      } catch (e) {
        G.reportError("barter:onClose", e);
      }
    } else X.returnToPlay("barter");
  }

  G.barter = {
    /** Open barter with a merchant actor. opts: {onClose} (dialogue uses it to resume). */
    open(actor, opts) {
      opts = opts || {};
      if (B) close();
      if (!actor) return false;
      B = {
        actor,
        onClose: opts.onClose || null,
        sellMarks: new Map(),
        buyMarks: new Map(),
        conds: {},
        busy: false,
        tmpMerch: null,
      };
      merch(actor); // normalises a real merchant's stock in place; builds a throwaway view otherwise
      B.w = X.createXfer({
        title: "TRADE",
        cats: true,
        startFocus: 1,
        subtitle: () =>
          "TRADE " +
          Math.round(X.skill("trade")) +
          " &nbsp;·&nbsp; PRESENCE " +
          X.attr("presence"),
        cols: [
          {
            title: () => X.esc(X.heroName()).toUpperCase(),
            info: () => "SCRIP " + X.scrip(),
            entries: leftEntries,
            right: (e) => rt(e, unitSell(e.def, e.condition)),
            empty: "Nothing to sell",
          },
          {
            title: () => X.esc(actor.name || "Merchant").toUpperCase(),
            info: () => "SCRIP " + (X.purse(merch(actor)) || 0),
            entries: rightEntries,
            right: (e) => rt(e, unitBuy(e.def, e.condition)),
            empty: "Sold out",
          },
        ],
        footer,
        keys: "<span><b>E</b>Mark</span><span><b>SHIFT+E</b>Mark all</span><span><b>A/D</b>Column</span><span><b>Q/Z</b>Category</span><span><b>SPACE</b>Accept</span><span><b>R</b>Reset</span><span><b>TAB</b>Leave</span>",
        onActivate: activate,
        extraDesc: (side, e) =>
          ' <span style="opacity:.75">— ' +
          (side === 0
            ? "They pay " + unitSell(e.def, e.condition)
            : "You pay " + unitBuy(e.def, e.condition)) +
          " Scrip each.</span>",
      });
      X.pushScreen(screen);
      if (G.state !== "barter") G.setState("barter");
      X.sfx("ui_select", { volume: 0.5 });
      G.events.emit("barterOpened", actor);
      return true;
    },
    close,
    isOpen: () => !!B,
    priceBuy: (def, cond) =>
      unitBuy(typeof def === "string" ? X.itemDef(def) : def, cond),
    priceSell: (def, cond) =>
      unitSell(typeof def === "string" ? X.itemDef(def) : def, cond),
  };

  X.barter = {
    onState(s) {
      if (B && s !== "barter") {
        const w = B.w;
        const cb = B.onClose;
        B = null;
        X.popScreen(screen);
        w.destroy();
        if (cb && s === "dialogue") {
          /* dialogue resumed itself */
        }
      }
    },
    reset() {
      if (B) {
        X.popScreen(screen);
        B.w.destroy();
        B = null;
      }
    },
  };
