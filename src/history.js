/* history.js — undo / redo, 50 step limit */

var KanvazHistory = (function() {

  var stack   = [];
  var pointer = -1;
  var MAX     = 50;
  var locked  = false;

  /* ── Snapshot ──
     KanvazCards.serialise() includes each card's full dataUrl (base64
     media, can be tens of MB per card). A naive JSON.parse(JSON.stringify
     (...)) deep-clones that string into EVERY undo-stack entry — with
     MAX=50 steps, a media-heavy board could hold up to 50x copies of all
     embedded media in RAM at once.

     dataUrl/name/path/naturalW/naturalH/type/id are never mutated in
     place after a card is created (verified across cards.js), so they're
     safe to share by reference across snapshots. Only the mutable fields
     (position/size/z/pin/text/opacity/flip/annotations) need deep
     copying — deserialise() consumes exactly this shape. */
  function snapshot() {
    var src = KanvazCards.serialise();
    var snap = [];
    for (var i = 0; i < src.length; i++) {
      var c = src[i];
      snap.push({
        id:       c.id,
        type:     c.type,
        dataUrl:  c.dataUrl,
        name:     c.name,
        path:     c.path,
        naturalW: c.naturalW,
        naturalH: c.naturalH,
        x:        c.x,
        y:        c.y,
        w:        c.w,
        h:        c.h,
        z:        c.z,
        pinned:   c.pinned,
        text:     c.text,
        opacity:  c.opacity,
        flipH:    c.flipH,
        flipV:    c.flipV,
        annotations: JSON.parse(JSON.stringify(c.annotations || []))
      });
    }
    return snap;
  }

  /* ── Push after any mutation ── */

  function push() {
    if (locked) return;
    stack = stack.slice(0, pointer + 1);
    stack.push(snapshot());
    if (stack.length > MAX) stack = stack.slice(stack.length - MAX);
    pointer = stack.length - 1;
    updateUI();
  }

  /* ── Undo ── */

  function undo() {
    if (pointer <= 0) { KanvazUI.toast('Nothing to undo'); return; }
    pointer--;
    restore(stack[pointer]);
    updateUI();
    KanvazUI.toast('Undo');
  }

  /* ── Redo ── */

  function redo() {
    if (pointer >= stack.length - 1) { KanvazUI.toast('Nothing to redo'); return; }
    pointer++;
    restore(stack[pointer]);
    updateUI();
    KanvazUI.toast('Redo');
  }

  /* ── Restore snapshot ── */

  function restore(snap) {
    locked = true;
    KanvazCards.deserialise(snap);
    locked = false;
    KanvazApp.markDirty();
  }

  /* ── Clear ── */

  function clear() {
    stack   = [];
    pointer = -1;
    stack.push(snapshot());
    pointer = 0;
    updateUI();
  }

  /* ── Update toolbar ── */

  function updateUI() {
    var undoBtn = document.querySelector('[title="Undo (Ctrl+Z)"]');
    var redoBtn = document.querySelector('[title="Redo (Ctrl+Y)"]');
    if (undoBtn) undoBtn.style.opacity = pointer <= 0 ? '0.35' : '';
    if (redoBtn) redoBtn.style.opacity = pointer >= stack.length - 1 ? '0.35' : '';
  }

  function init() { clear(); }

  return { init: init, push: push, undo: undo, redo: redo, clear: clear };

})();
