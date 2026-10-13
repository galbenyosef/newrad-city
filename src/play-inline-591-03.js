// play-inline-591 03 — min
// Lines 381-412 of readable/play-inline-591.pretty.js (statement-aligned).
  const phaseNode = () => {
    const f = F();
    if (f.ending === "B") return "after_b";
    if (f.ending) return "idle";
    switch (f.phase) {
      case "hello":
        return "hello";
      case "story":
        return "story1";
      case "guilt":
        return "guilt";
      case "list":
        return "list";
      case "rose":
        return roseState() === "alone" && !f.roseArrived && K.alive("rose")
          ? "rose_arrives"
          : "moment";
      case "rose_arg":
        return "rose_arg";
      case "final":
      case "c":
        return "final";
      default:
        return "idle";
    }
  };
  function setPhase(p, min) {
    F().phase = p;
    if (min) clockTo(min);
  }
  const ringToRose = () => I().ring === "rose";

