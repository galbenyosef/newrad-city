// play-inline-569 02 — setflag
// Lines 352-394 of readable/play-inline-569.pretty.js (statement-aligned).
  function mq29Done(how) {
    L.setFlag("ms_rocky_told", how);
    if (how === "evac")
      L.news(
        "This is Radio Free Manhattan. This is not a drill and it's not a joke. If you live within forty blocks of Grand Central, get out. Go north, go upriver, go to your cousin in Yonkers you never liked. Take water. Take your kids. Take a candle if it makes you feel better. Go today.",
      );
    else if (how === "truth")
      L.news(
        "Folks, here it is straight. There's a bomb under Grand Central, the sun people mean to light it Sunday morning, and the sleeper from Chambers Street is going down there to stop them. That's it. That's the news. Say a prayer, or don't, but keep your radio on.",
      );
    else
      L.news(
        "Stay calm, New Rad City. Nobody's served by a stampede. Here's the slow one. Keep your lights on.",
      );
    if (at("mq29", "rocky")) Q.complete("mq29");
  }

  // ------------------------------------------------------------------
  // Test solver
  // ------------------------------------------------------------------
  ms.solver("mq29", {
    return() {
      Q.setStage("mq29", "broadcast");
    },
    broadcast() {
      L.setFlag("ms_dawn_broadcast_heard");
      L.give("ms_note_dawn_broadcast", 1, true);
      Q.setStage("mq29", "cathedral");
    },
    cathedral() {
      L.setFlag("ms_noonday_mq29");
      Q.setStage("mq29", "rose");
    },
    rose() {
      L.setFlag("ms_rose_lie2");
      ms.addTrust(1, "test");
      L.setFlag("ms_rose_forgiven");
      mq29RoseDone();
    },
    rocky() {
      mq29Done("truth");
    },
  });
