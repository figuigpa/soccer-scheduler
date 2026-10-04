(function () {
  'use strict';
  var KEY = 'soccerScheduler.v1';
  var state = load();
  var pickTeam = 'red';

  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY));
      if (s && s.practices) return s;
    } catch (e) {}
    return { practices: [], players: [], avail: {}, teams: {}, sel: null, lineup: { pos: {}, strokes: [] } };
  }
  if (!state.lineup) state.lineup = { pos: {}, strokes: [] };
  function save() { localStorage.setItem(KEY, JSON.stringify(state)); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function getAvail(pid, plid) { return (state.avail[pid] || {})[plid] || 'maybe'; }
  function teamOf(pid, plid) { return (state.teams[pid] || {})[plid]; }
  function sortKey(p) { return p.date + ' ' + p.time; }
  function fmt(p) {
    var d = new Date(p.date + 'T' + p.time);
    if (isNaN(d)) return p.date + ' ' + p.time;
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) +
      ' · ' + d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }
  function isPast(p) { return new Date(p.date + 'T' + p.time) < new Date(); }
  function selected() {
    var list = state.practices.slice().sort(function (a, b) { return sortKey(a) < sortKey(b) ? -1 : 1; });
    var found = list.filter(function (p) { return p.id === state.sel; })[0];
    if (found) return found;
    var up = list.filter(function (p) { return !isPast(p); })[0] || list[list.length - 1];
    return up || null;
  }

  // Tabs
  var tabBtns = document.querySelectorAll('nav button');
  tabBtns.forEach(function (b) {
    b.onclick = function () {
      tabBtns.forEach(function (x) { x.classList.toggle('active', x === b); });
      document.querySelectorAll('.tab').forEach(function (t) { t.classList.toggle('active', t.id === b.dataset.tab); });
      render();
    };
  });

  // Practices
  $('practice-form').onsubmit = function (e) {
    e.preventDefault();
    var p = { id: uid(), date: $('p-date').value, time: $('p-time').value, place: $('p-place').value.trim() };
    state.practices.push(p);
    if (!state.sel) state.sel = p.id;
    save(); e.target.reset(); render();
  };
  function practiceItem(p) {
    var li = el('li');
    var info = el('div');
    info.appendChild(el('strong', null, fmt(p)));
    if (p.place) info.appendChild(el('small', null, p.place));
    var del = el('button', 'del', '✕');
    del.setAttribute('aria-label', 'Delete practice');
    del.onclick = function () {
      if (!confirm('Delete this practice?')) return;
      state.practices = state.practices.filter(function (x) { return x.id !== p.id; });
      delete state.avail[p.id]; delete state.teams[p.id];
      save(); render();
    };
    li.appendChild(info); li.appendChild(del);
    return li;
  }
  function renderPractices() {
    var sorted = state.practices.slice().sort(function (a, b) { return sortKey(a) < sortKey(b) ? -1 : 1; });
    var up = $('upcoming'), past = $('past');
    up.innerHTML = ''; past.innerHTML = '';
    sorted.filter(function (p) { return !isPast(p); }).forEach(function (p) { up.appendChild(practiceItem(p)); });
    sorted.filter(isPast).reverse().forEach(function (p) { past.appendChild(practiceItem(p)); });
    if (!up.children.length) up.appendChild(el('li', 'muted', 'No upcoming practices.'));
  }

  // Players
  $('player-form').onsubmit = function (e) {
    e.preventDefault();
    var name = $('player-name').value.trim();
    if (!name) return;
    state.players.push({ id: uid(), name: name });
    save(); e.target.reset(); render();
  };
  function renderPlayers() {
    var ul = $('player-list'); ul.innerHTML = '';
    $('player-count').textContent = state.players.length + ' player' + (state.players.length === 1 ? '' : 's');
    state.players.forEach(function (pl) {
      var li = el('li'); li.appendChild(el('strong', null, pl.name));
      var del = el('button', 'del', '✕');
      del.setAttribute('aria-label', 'Remove ' + pl.name);
      del.onclick = function () {
        if (!confirm('Remove ' + pl.name + '?')) return;
        state.players = state.players.filter(function (x) { return x.id !== pl.id; });
        Object.keys(state.avail).forEach(function (k) { delete state.avail[k][pl.id]; });
        Object.keys(state.teams).forEach(function (k) { delete state.teams[k][pl.id]; });
        delete state.lineup.pos[pl.id];
        save(); render();
      };
      li.appendChild(del); ul.appendChild(li);
    });
  }

  // Practice selectors
  function fillSelect(sel) {
    var cur = selected();
    sel.innerHTML = '';
    if (!state.practices.length) { sel.appendChild(new Option('No practices yet', '')); return null; }
    state.practices.slice().sort(function (a, b) { return sortKey(a) < sortKey(b) ? -1 : 1; }).forEach(function (p) {
      var o = new Option(fmt(p) + (p.place ? ' – ' + p.place : ''), p.id);
      o.selected = cur && cur.id === p.id;
      sel.appendChild(o);
    });
    return cur;
  }
  ['avail-practice', 'teams-practice'].forEach(function (id) {
    $(id).onchange = function () { state.sel = this.value; save(); render(); };
  });

  // Availability
  var NEXT = { maybe: 'yes', yes: 'no', no: 'maybe' };
  var LABEL = { yes: 'Available', no: 'Unavailable', maybe: 'Maybe' };
  function renderAvail() {
    var p = fillSelect($('avail-practice'));
    var ul = $('avail-list'), counts = $('avail-counts');
    ul.innerHTML = ''; counts.innerHTML = '';
    if (!p) return;
    var n = { yes: 0, no: 0, maybe: 0 };
    state.players.forEach(function (pl) { n[getAvail(p.id, pl.id)]++; });
    ['yes', 'maybe', 'no'].forEach(function (k) {
      var d = el('div', k); d.appendChild(el('span', null, n[k])); d.appendChild(document.createTextNode(LABEL[k]));
      counts.appendChild(d);
    });
    if (!state.players.length) ul.appendChild(el('li', 'muted', 'Add players first.'));
    state.players.forEach(function (pl) {
      var a = getAvail(p.id, pl.id);
      var li = el('li', a);
      li.appendChild(el('strong', null, pl.name));
      li.appendChild(el('span', 'badge ' + a, LABEL[a]));
      li.onclick = function () {
        var m = state.avail[p.id] = state.avail[p.id] || {};
        m[pl.id] = NEXT[a];
        if (m[pl.id] === 'no' && state.teams[p.id]) delete state.teams[p.id][pl.id];
        save(); renderAvail();
      };
      ul.appendChild(li);
    });
  }

  // Teams
  function setTeam(p, plid, team) {
    var t = state.teams[p.id] = state.teams[p.id] || {};
    if (team) t[plid] = team; else delete t[plid];
    save(); renderTeams();
  }
  function renderTeams() {
    var p = fillSelect($('teams-practice'));
    ['red-list', 'yellow-list', 'pool', 'out'].forEach(function (id) { $(id).innerHTML = ''; });
    $('pick-red').classList.toggle('active', pickTeam === 'red');
    $('pick-yellow').classList.toggle('active', pickTeam === 'yellow');
    var cnt = { red: 0, yellow: 0 };
    if (p) {
      state.players.forEach(function (pl) {
        var a = getAvail(p.id, pl.id), t = teamOf(p.id, pl.id);
        if (a === 'no') {
          $('out').appendChild(el('li', null, pl.name));
        } else if (t) {
          cnt[t]++;
          var li = el('li', null, pl.name + (a === 'maybe' ? ' ?' : ''));
          li.title = 'Tap to unassign';
          li.onclick = function () { setTeam(p, pl.id, null); };
          $(t + '-list').appendChild(li);
        } else {
          var pi = el('li'); pi.appendChild(el('strong', null, pl.name));
          if (a === 'maybe') pi.appendChild(el('span', 'q', 'maybe'));
          pi.onclick = function () { setTeam(p, pl.id, pickTeam); };
          $('pool').appendChild(pi);
        }
      });
    }
    $('red-n').textContent = cnt.red; $('yellow-n').textContent = cnt.yellow;
    var diff = Math.abs(cnt.red - cnt.yellow), b = $('balance');
    b.className = 'balance' + (diff > 1 ? ' uneven' : '');
    b.textContent = diff > 1
      ? '⚠ Uneven: ' + (cnt.red > cnt.yellow ? 'Red' : 'Yellow') + ' has ' + diff + ' more'
      : cnt.red + cnt.yellow ? '✓ Teams are balanced' : 'Tap players below to build teams';
    if (!$('pool').children.length) $('pool').appendChild(el('li', 'muted', p ? 'No unassigned players.' : 'Create a practice first.'));
    if (!$('out').children.length) $('out').appendChild(el('li', 'muted', 'None'));
  }
  $('pick-red').onclick = function () { pickTeam = 'red'; renderTeams(); };
  $('pick-yellow').onclick = function () { pickTeam = 'yellow'; renderTeams(); };
  $('auto-balance').onclick = function () {
    var p = selected(); if (!p) return;
    var t = state.teams[p.id] = state.teams[p.id] || {};
    var c = { red: 0, yellow: 0 };
    state.players.forEach(function (pl) { if (t[pl.id] && getAvail(p.id, pl.id) !== 'no') c[t[pl.id]]++; });
    state.players.filter(function (pl) { return getAvail(p.id, pl.id) !== 'no' && !t[pl.id]; })
      .sort(function () { return Math.random() - 0.5; })
      .forEach(function (pl) { var k = c.red <= c.yellow ? 'red' : 'yellow'; t[pl.id] = k; c[k]++; });
    save(); renderTeams();
  };

  // Lineup board
  var luMode = 'move', luSel = null, luDrag = null, luStroke = null;
  var NS = 'http://www.w3.org/2000/svg';
  function initials(n) {
    var w = n.trim().split(/\s+/);
    return (w.length > 1 ? w[0].charAt(0) + w[1].charAt(0) : w[0].slice(0, 2)).toUpperCase();
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function fieldPt(e) {
    var r = $('field').getBoundingClientRect();
    return { x: clamp((e.clientX - r.left) / r.width * 100, 5, 95), y: clamp((e.clientY - r.top) / r.height * 100, 4, 96) };
  }
  function onField() { return state.players.filter(function (p) { return state.lineup.pos[p.id]; }); }
  function pathPts(s) { return s.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '); }
  function drawStroke(s) {
    var pl = document.createElementNS(NS, 'polyline');
    pl.setAttribute('points', pathPts(s));
    pl.setAttribute('class', 'stroke');
    $('lu-draw').appendChild(pl);
    return pl;
  }
  function renderLineup() {
    var f = $('field'), lp = $('lu-players'), L = state.lineup;
    f.classList.toggle('pen', luMode === 'pen');
    $('lu-move').classList.toggle('active', luMode === 'move');
    $('lu-pen').classList.toggle('active', luMode === 'pen');
    lp.innerHTML = '';
    var on = onField();
    on.forEach(function (pl) {
      var pos = L.pos[pl.id];
      var d = el('div', 'pl' + (luSel === pl.id ? ' sel' : ''));
      d.dataset.id = pl.id;
      d.style.left = pos.x + '%'; d.style.top = pos.y + '%';
      d.appendChild(el('span', 'jersey', pl.num || initials(pl.name)));
      d.appendChild(el('span', 'nm', pl.name.split(/\s+/)[0]));
      if (luSel === pl.id) {
        var x = el('button', 'rm', '×');
        x.setAttribute('aria-label', 'Remove ' + pl.name + ' from field');
        x.onpointerdown = function (e) { e.stopPropagation(); };
        x.onclick = function (e) { e.stopPropagation(); delete L.pos[pl.id]; luSel = null; save(); renderLineup(); };
        d.appendChild(x);
      }
      lp.appendChild(d);
    });
    $('lu-draw').innerHTML = '';
    L.strokes.forEach(drawStroke);
    $('lu-count').textContent = on.length + ' on';
    $('lu-hint').style.display = on.length || L.strokes.length ? 'none' : '';
    var help = $('lu-help');
    help.textContent = luMode === 'pen' ? 'Pen: draw lines on the field. Switch to Move to place players.'
      : luSel ? 'Now tap a spot on the field (or drag a placed player).' : 'Tap a player, then tap the field. Tap a placed player to select or remove.';
    var ro = $('lu-roster'); ro.innerHTML = '';
    if (!state.players.length) ro.appendChild(el('p', 'muted', 'Add players in the Players tab first.'));
    state.players.forEach(function (pl) {
      var c = el('button', 'lchip' + (L.pos[pl.id] ? ' on' : '') + (luSel === pl.id ? ' sel' : ''));
      c.appendChild(el('span', 'jersey', pl.num || initials(pl.name)));
      c.appendChild(el('span', null, pl.name));
      c.onclick = function () { luSel = luSel === pl.id ? null : pl.id; renderLineup(); };
      ro.appendChild(c);
    });
  }
  (function () {
    var f = $('field');
    f.addEventListener('pointerdown', function (e) {
      if (e.target.closest('.rm')) return;
      var p = fieldPt(e);
      if (luMode === 'pen') {
        e.preventDefault();
        f.setPointerCapture(e.pointerId);
        luStroke = [[p.x, p.y * 1.5]];
        luStroke.node = drawStroke(luStroke);
        return;
      }
      var t = e.target.closest('.pl');
      if (t) {
        e.preventDefault();
        f.setPointerCapture(e.pointerId);
        luDrag = { id: t.dataset.id, moved: false, sx: e.clientX, sy: e.clientY, wasSel: luSel === t.dataset.id, node: t };
        return;
      }
      if (luSel) {
        state.lineup.pos[luSel] = { x: p.x, y: p.y };
        luSel = null; save(); renderLineup();
      }
    });
    f.addEventListener('pointermove', function (e) {
      if (luStroke) {
        var p = fieldPt(e);
        luStroke.push([p.x, p.y * 1.5]);
        luStroke.node.setAttribute('points', pathPts(luStroke));
      } else if (luDrag) {
        if (!luDrag.moved && Math.abs(e.clientX - luDrag.sx) + Math.abs(e.clientY - luDrag.sy) < 6) return;
        luDrag.moved = true;
        var q = fieldPt(e);
        state.lineup.pos[luDrag.id] = { x: q.x, y: q.y };
        luDrag.node.style.left = q.x + '%'; luDrag.node.style.top = q.y + '%';
      }
    });
    function end() {
      if (luStroke) {
        if (luStroke.length > 1) state.lineup.strokes.push(luStroke.slice());
        luStroke = null; save(); renderLineup();
      } else if (luDrag) {
        var d = luDrag; luDrag = null;
        if (d.moved) { luSel = d.id; save(); }
        else luSel = d.wasSel ? null : d.id;
        renderLineup();
      }
    }
    f.addEventListener('pointerup', end);
    f.addEventListener('pointercancel', end);
  })();
  $('lu-move').onclick = function () { luMode = 'move'; renderLineup(); };
  $('lu-pen').onclick = function () { luMode = 'pen'; luSel = null; renderLineup(); };
  $('lu-clear').onclick = function () {
    if ((onField().length || state.lineup.strokes.length) && !confirm('Clear all players and drawings from the board?')) return;
    state.lineup = { pos: {}, strokes: [] }; luSel = null; save(); renderLineup();
  };
  $('lu-auto').onclick = function () {
    var list = onField();
    if (!list.length) {
      var p = selected();
      list = state.players.filter(function (pl) { return !p || getAvail(p.id, pl.id) !== 'no'; }).slice(0, 11);
    }
    var n = list.length; if (!n) return;
    var rows, gk = n !== 6;
    if (n === 6) rows = [1, 2, 3];
    else {
      var rest = n - 1, att = rest >= 7 ? 2 : rest >= 3 ? 1 : 0, r = rest - att, def = Math.ceil(r / 2), mid = r - def;
      rows = [att, mid, def].filter(function (c) { return c > 0; });
    }
    if (gk) rows.push(1);
    var pos = {}, i = 0;
    rows.forEach(function (c, ri) {
      var y = rows.length === 1 ? 50 : 20 + ri * (72 / (rows.length - 1));
      for (var j = 0; j < c; j++) pos[list[i++].id] = { x: (j + 1) / (c + 1) * 100, y: y };
    });
    state.lineup.pos = pos; luSel = null; save(); renderLineup();
  };

  function render() { renderPractices(); renderPlayers(); renderAvail(); renderTeams(); renderLineup(); }
  render();
})();
