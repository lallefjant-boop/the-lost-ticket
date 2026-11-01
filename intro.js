// Runs before the page paints: decides whether the "Goonboi. presents..."
// intro plays (first visit in this tab, and only without reduced motion).
(function () {
  "use strict";
  var d = document.documentElement;
  d.className += " js";
  try {
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var seen = false;
    try { seen = window.sessionStorage.getItem("lt-intro") === "1"; } catch (e) { seen = false; }
    if (!reduce && !seen) d.className += " intro";
  } catch (e) { /* no intro */ }
})();
