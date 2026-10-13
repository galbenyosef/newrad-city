// play-inline-5 02 — append
// Lines 339-470 of readable/play-inline-5.pretty.js (statement-aligned).
  async function submit() {
    if (!el) return;
    const $ = (id) => el.querySelector("#" + id);
    const title = $("br-title").value.trim(),
      desc = $("br-desc").value.trim();
    if (!title || !desc) {
      msg("Please fill in the title and what happened.", "err");
      ($("br-title").value.trim() ? $("br-desc") : $("br-title")).focus();
      return;
    }
    const diag = diagnostics();
    const text =
      "Title: " +
      title +
      "\nCategory: " +
      $("br-cat").value +
      "\nContact: " +
      ($("br-contact").value.trim() || "-") +
      "\n\n" +
      desc +
      "\n\n--- diagnostics ---\n" +
      diag;
    if (!online()) {
      try {
        await navigator.clipboard.writeText(text);
        msg("Report copied to your clipboard.", "ok");
      } catch (e) {
        $("br-diag").textContent = text;
        el.querySelector("details").open = true;
        msg(
          'Copy failed: select the text under "Technical details" and copy it by hand.',
          "err",
        );
      }
      return;
    }
    const wait = lastSent + COOLDOWN_MS - Date.now();
    if (wait > 0) {
      msg(
        "Please wait " +
          Math.ceil(wait / 1000) +
          " s before sending another report.",
        "err",
      );
      return;
    }
    const fd = new FormData();
    fd.append("form-name", "bug-report");
    fd.append("bot-field", el.querySelector("input[name=bot-field]").value);
    fd.append("title", title);
    fd.append("category", $("br-cat").value);
    fd.append("description", desc);
    fd.append("contact", $("br-contact").value.trim());
    fd.append("diagnostics", diag);
    if (shot && $("br-useshot").checked)
      fd.append("screenshot", shot, "screenshot.jpg");
    const btn = $("br-send");
    btn.disabled = true;
    btn.textContent = "SENDING…";
    msg("");
    try {
      const r = await fetch("/", { method: "POST", body: fd }); // no Content-Type header: the browser sets the multipart boundary
      if (!r.ok) throw new Error("HTTP " + r.status);
      lastSent = Date.now();
      if (!el) return;
      msg("Report sent. Thank you, survivor! Closing…", "ok");
      btn.textContent = "SENT";
      setTimeout(() => {
        if (el) close();
      }, 1800);
    } catch (e) {
      if (!el) return;
      btn.disabled = false;
      btn.textContent = "RETRY";
      msg(
        "Could not send (" +
          e.message +
          "). Check your connection and press RETRY.",
        "err",
      );
    }
  }

  // F8 from anywhere (except while typing somewhere or loading)
  window.addEventListener(
    "keydown",
    (e) => {
      if (el && (e.code === "Escape" || e.key === "Escape")) {
        e.preventDefault();
        e.stopImmediatePropagation();
        close();
        return;
      } // focus may have left the form
      if (e.code !== "F8" || e.repeat) return;
      if (
        e.target &&
        (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
      )
        return;
      e.preventDefault();
      e.stopImmediatePropagation();
      if (el) {
        close();
        return;
      }
      if (G.state === "loading" || G.state === undefined) return;
      if (G.state === "cheats" && G.cheatMenu) {
        openFromCheats();
        return;
      }
      prime();
      open();
    },
    true,
  );

  /** From the cheat menu: the frame was captured when P was pressed; the menu hands over its previous state. */
  function openFromCheats() {
    const from =
      G.cheatMenu && G.cheatMenu._prevState ? G.cheatMenu._prevState() : "play";
    if (G.cheatMenu && G.cheatMenu._detach) G.cheatMenu._detach();
    open({ from });
  }

  G.events.on("state", (s) => {
    if (s !== "cheats" && el) {
      el.remove();
      el = null;
    }
  });

  G.bugReport = { open, close, prime, openFromCheats, diagnostics };
