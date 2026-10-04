(function () {
  'use strict';
  var SB_URL = 'https://ulokpqtouottaflqjwcp.supabase.co';
  var SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsb2twcXRvdW90dGFmbHFqd2NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEwNzIwNzAsImV4cCI6MjEwNjY0ODA3MH0.Ldqr-4WgX06Ca4k_-AsBsS_juj7OJVFdLkpRLXTLMGU';
  var KEY = 'soccerScheduler.v2', OLD_KEY = 'soccerScheduler.v1', NAME_KEY = 'rf.name', NOTIF_KEY = 'rf.notifAsked';
  var sb = null;
  try { if (window.supabase) sb = window.supabase.createClient(SB_URL, SB_KEY); } catch (e) { sb = null; }

  var TEAM_KEY = 'rf.teamName', DEFAULT_TEAM = 'Figuig PA';
  var pickTeam = 'red';
  var openBring = {};
  var state = load();

  // ---------- helpers ----------
  function uid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16);
    });
  }
  function isUuid(s) { return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s || ''); }
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  // ---------- icons (inline SVG, Feather-style line icons) ----------
  var IC = {
      "ball": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><polygon points=\"12 8 15.5 10.5 14.2 14.5 9.8 14.5 8.5 10.5\"/><path d=\"M12 8V2.3M15.5 10.5l5.3-1.8M14.2 14.5l3.3 4.5M9.8 14.5l-3.3 4.5M8.5 10.5L3.2 8.7\"/>",
      "calendar": "<rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"/><line x1=\"16\" y1=\"2\" x2=\"16\" y2=\"6\"/><line x1=\"8\" y1=\"2\" x2=\"8\" y2=\"6\"/><line x1=\"3\" y1=\"10\" x2=\"21\" y2=\"10\"/>",
      "gift": "<rect x=\"3\" y=\"8\" width=\"18\" height=\"4\"/><path d=\"M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5\"/>",
      "chat": "<path d=\"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z\"/>",
      "users": "<path d=\"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2\"/><circle cx=\"9\" cy=\"7\" r=\"4\"/><path d=\"M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75\"/>",
      "user": "<path d=\"M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2\"/><circle cx=\"12\" cy=\"7\" r=\"4\"/>",
      "checkcircle": "<path d=\"M22 11.08V12a10 10 0 1 1-5.93-9.14\"/><polyline points=\"22 4 12 14.01 9 11.01\"/>",
      "check": "<polyline points=\"20 6 9 17 4 12\"/>",
      "shirt": "<path d=\"M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z\"/>",
      "clipboard": "<rect x=\"8\" y=\"2\" width=\"8\" height=\"4\" rx=\"1\"/><path d=\"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2\"/>",
      "chart": "<path d=\"M18 20V10M12 20V4M6 20v-6\"/>",
      "camera": "<path d=\"M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z\"/><circle cx=\"12\" cy=\"13\" r=\"4\"/>",
      "mic": "<path d=\"M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z\"/><path d=\"M19 10v2a7 7 0 0 1-14 0v-2\"/><line x1=\"12\" y1=\"19\" x2=\"12\" y2=\"23\"/><line x1=\"8\" y1=\"23\" x2=\"16\" y2=\"23\"/>",
      "send": "<line x1=\"22\" y1=\"2\" x2=\"11\" y2=\"13\"/><polygon points=\"22 2 15 22 11 13 2 9 22 2\"/>",
      "gear": "<circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z\"/>",
      "edit": "<path d=\"M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z\"/>",
      "trash": "<polyline points=\"3 6 5 6 21 6\"/><path d=\"M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2\"/>",
      "plus": "<line x1=\"12\" y1=\"5\" x2=\"12\" y2=\"19\"/><line x1=\"5\" y1=\"12\" x2=\"19\" y2=\"12\"/>",
      "x": "<line x1=\"18\" y1=\"6\" x2=\"6\" y2=\"18\"/><line x1=\"6\" y1=\"6\" x2=\"18\" y2=\"18\"/>",
      "pin": "<path d=\"M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z\"/><circle cx=\"12\" cy=\"10\" r=\"3\"/>",
      "medical": "<path d=\"M9 3h6v6h6v6h-6v6H9v-6H3V9h6z\"/>",
      "ban": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><line x1=\"4.93\" y1=\"4.93\" x2=\"19.07\" y2=\"19.07\"/>",
      "help": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3\"/><line x1=\"12\" y1=\"17\" x2=\"12.01\" y2=\"17\"/>",
      "package": "<path d=\"M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z\"/><polyline points=\"3.27 6.96 12 12.01 20.73 6.96\"/><line x1=\"12\" y1=\"22.08\" x2=\"12\" y2=\"12\"/>",
      "home": "<path d=\"M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"/><polyline points=\"9 22 9 12 15 12 15 22\"/>",
      "star": "<polygon points=\"12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2\"/>",
      "back": "<line x1=\"19\" y1=\"12\" x2=\"5\" y2=\"12\"/><polyline points=\"12 19 5 12 12 5\"/>",
      "video": "<rect x=\"2\" y=\"6\" width=\"13\" height=\"12\" rx=\"2\"/><path d=\"M22 8l-7 4 7 4z\"/>",
      "more": "<circle cx=\"12\" cy=\"5\" r=\"1.6\"/><circle cx=\"12\" cy=\"12\" r=\"1.6\"/><circle cx=\"12\" cy=\"19\" r=\"1.6\"/>",
      "smile": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M8 14s1.5 2 4 2 4-2 4-2\"/><line x1=\"9\" y1=\"9\" x2=\"9.01\" y2=\"9\"/><line x1=\"15\" y1=\"9\" x2=\"15.01\" y2=\"9\"/>",
      "clip": "<path d=\"M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48\"/>",
      "dcheck": "<polyline points=\"1 13 6 18 16 6\"/><polyline points=\"9 15 11 17 21 6\"/>",
      "reply": "<polyline points=\"9 14 4 9 9 4\"/><path d=\"M20 20v-7a4 4 0 0 0-4-4H4\"/>",
      "play": "<polygon points=\"6 4 20 12 6 20 6 4\"/>",
      "pause": "<rect x=\"6\" y=\"4\" width=\"4\" height=\"16\"/><rect x=\"14\" y=\"4\" width=\"4\" height=\"16\"/>",
      "clock": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><polyline points=\"12 6 12 12 16 14\"/>",
      "chevdown": "<polyline points=\"6 9 12 15 18 9\"/>",
      "chevright": "<polyline points=\"9 18 15 12 9 6\"/>",
      "shuffle": "<polyline points=\"16 3 21 3 21 8\"/><line x1=\"4\" y1=\"20\" x2=\"21\" y2=\"3\"/><polyline points=\"21 16 21 21 16 21\"/><line x1=\"15\" y1=\"15\" x2=\"21\" y2=\"21\"/><line x1=\"4\" y1=\"4\" x2=\"9\" y2=\"9\"/>",
      "expand": "<polyline points=\"15 3 21 3 21 9\"/><polyline points=\"9 21 3 21 3 15\"/><line x1=\"21\" y1=\"3\" x2=\"14\" y2=\"10\"/><line x1=\"3\" y1=\"21\" x2=\"10\" y2=\"14\"/>",
      "shrink": "<polyline points=\"4 14 10 14 10 20\"/><polyline points=\"20 10 14 10 14 4\"/><line x1=\"14\" y1=\"10\" x2=\"21\" y2=\"3\"/><line x1=\"3\" y1=\"21\" x2=\"10\" y2=\"14\"/>",
      "move": "<polyline points=\"5 9 2 12 5 15\"/><polyline points=\"9 5 12 2 15 5\"/><polyline points=\"15 19 12 22 9 19\"/><polyline points=\"19 9 22 12 19 15\"/><line x1=\"2\" y1=\"12\" x2=\"22\" y2=\"12\"/><line x1=\"12\" y1=\"2\" x2=\"12\" y2=\"22\"/>",
      "layout": "<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><line x1=\"3\" y1=\"9\" x2=\"21\" y2=\"9\"/><line x1=\"9\" y1=\"21\" x2=\"9\" y2=\"9\"/>",
      "refresh": "<polyline points=\"23 4 23 10 17 10\"/><path d=\"M20.49 15a9 9 0 1 1-2.12-9.36L23 10\"/>",
      "alert": "<path d=\"M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z\"/><line x1=\"12\" y1=\"9\" x2=\"12\" y2=\"13\"/><line x1=\"12\" y1=\"17\" x2=\"12.01\" y2=\"17\"/>"
  };
  function svg(n) { return '<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + IC[n] + '</svg>'; }
  function setIc(node, n, text) {
    node.innerHTML = svg(n);
    if (text) node.appendChild(document.createTextNode(text));
    return node;
  }
  function ei(tag, cls, n, text) { return setIc(el(tag, cls), n, text); }
  function hydrateIcons() {
    var q = document.querySelectorAll('[data-ic]');
    for (var i = 0; i < q.length; i++) { q[i].insertAdjacentHTML('afterbegin', svg(q[i].getAttribute('data-ic'))); q[i].removeAttribute('data-ic'); }
  }
  hydrateIcons();
  function nowIso() { return new Date().toISOString(); }
  function myName() { return localStorage.getItem(NAME_KEY) || ''; }
  function askName(msg) {
    var n = (prompt(msg, myName()) || '').trim();
    if (n) localStorage.setItem(NAME_KEY, n);
    return n;
  }
  function safeUrl(u) { return /^https?:\/\//i.test((u || '').trim()) ? u.trim() : null; }
  function mapsHref(url, addr) {
    var u = safeUrl(url);
    if (u) return u;
    if (addr && addr.trim()) return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(addr.trim());
    return null;
  }
  function mapsBtn(url, addr) {
    var h = mapsHref(url, addr);
    if (!h) return null;
    var a = ei('a', 'maps-btn', 'pin', 'Open in Maps');
    a.href = h; a.target = '_blank'; a.rel = 'noopener noreferrer';
    return a;
  }

  function mapEmbed(addr) {
    if (!addr || !addr.trim()) return null;
    var wrap = el('div', 'map-embed');
    var f = document.createElement('iframe');
    f.src = 'https://www.google.com/maps?q=' + encodeURIComponent(addr.trim()) + '&output=embed';
    f.loading = 'lazy'; f.title = 'Map: ' + addr.trim();
    f.referrerPolicy = 'no-referrer-when-downgrade'; f.setAttribute('allowfullscreen', '');
    wrap.appendChild(f);
    return wrap;
  }

  // ---------- state / persistence ----------
  function blank() {
    return { practices: [], players: [], avail: {}, teams: {}, sel: null, events: [], items: [], assignments: [], chat: [], photos: [], albums: [], polls: [], pollOpts: [], pollVotes: [], admins: [],
      lineup: { pos: {}, strokes: [] }, outbox: [] };
  }
  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY));
      if (s && s.practices) { return Object.assign(blank(), s); }
    } catch (e) {}
    return migrate();
  }
  // Convert the v1 localStorage data (non-uuid ids, yes/no statuses) and queue it for upload.
  function migrate() {
    var s = blank(), o = null;
    try { o = JSON.parse(localStorage.getItem(OLD_KEY)); } catch (e) {}
    if (!o || !o.practices) return s;
    var map = {};
    function id(x) { if (!map[x]) map[x] = isUuid(x) ? x : uid(); return map[x]; }
    var ST = { yes: 'available', no: 'unavailable', maybe: 'maybe' };
    s.players = (o.players || []).map(function (p) { return { id: id(p.id), name: p.name }; });
    s.practices = o.practices.map(function (p) {
      return { id: id(p.id), date: p.date, time: p.time, location: p.place || '', field_address: '', field_map_url: '', notes: '' };
    });
    Object.keys(o.avail || {}).forEach(function (pid) {
      s.avail[id(pid)] = {};
      Object.keys(o.avail[pid]).forEach(function (pl) { s.avail[id(pid)][id(pl)] = ST[o.avail[pid][pl]] || 'maybe'; });
    });
    Object.keys(o.teams || {}).forEach(function (pid) {
      s.teams[id(pid)] = {};
      Object.keys(o.teams[pid]).forEach(function (pl) { s.teams[id(pid)][id(pl)] = o.teams[pid][pl]; });
    });
    s.sel = o.sel ? id(o.sel) : null;
    var L = o.lineup || { pos: {}, strokes: [] };
    Object.keys(L.pos || {}).forEach(function (pl) { s.lineup.pos[id(pl)] = L.pos[pl]; });
    s.lineup.strokes = L.strokes || [];
    s.players.forEach(function (p) { s.outbox.push({ t: 'players', a: 'up', r: { id: p.id, name: p.name, created_at: nowIso() } }); });
    s.practices.forEach(function (p) { s.outbox.push({ t: 'practices', a: 'up', r: practiceRow(p) }); });
    Object.keys(s.avail).forEach(function (pid) {
      Object.keys(s.avail[pid]).forEach(function (pl) { s.outbox.push(availOp(pid, pl, s.avail[pid][pl])); });
    });
    Object.keys(s.lineup.pos).forEach(function (pl) { s.outbox.push(posOp(pl, s.lineup.pos[pl])); });
    return s;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }

  function practiceRow(p) {
    return { id: p.id, date: p.date, time: p.time, location: p.location || null, field_address: p.field_address || null,
      field_map_url: p.field_map_url || null, notes: p.notes || null, created_at: p.created_at || nowIso() };
  }
  function availOp(pid, plid, status) {
    return { t: 'availability', a: 'up', c: 'practice_id,player_id', r: { practice_id: pid, player_id: plid, status: status } };
  }
  function posOp(plid, pos) {
    return { t: 'lineup_positions', a: 'up', c: 'player_id', r: { player_id: plid, x: pos.x, y: pos.y, updated_at: nowIso() } };
  }

  // ---------- sync (outbox -> Supabase, then pull) ----------
  var flushing = false, syncState = 'local';
  function setSync(s) {
    syncState = s;
    var b = $('sync');
    var T = { synced: ['● Synced', 'ok'], offline: ['● Offline – saved locally', 'off'], setup: ['● Setup needed', 'warn'], local: ['● Local only', 'off'], busy: ['● Syncing…', 'ok'] };
    b.textContent = T[s][0]; b.className = 'sync ' + T[s][1];
  }
  function teamName() { return localStorage.getItem(TEAM_KEY) || DEFAULT_TEAM; }
  function renderTeamName() {
    var n = teamName(), h = $('teamName');
    if (!h) return;
    h.textContent = '';
    var m = n.match(/^(.*\S)\s+(PA)$/);
    if (m) { h.appendChild(document.createTextNode(m[1] + ' ')); h.appendChild(el('span', 'pa', m[2])); }
    else h.textContent = n;
    document.title = n;
  }
  function setTeamName(n, remote) {
    if (!n || n === teamName()) return;
    try { localStorage.setItem(TEAM_KEY, n); } catch (e) {}
    renderTeamName();
  }
  function editTeamName() {
    var n = prompt('Team name (shared with everyone):', teamName());
    if (n == null) return;
    n = n.trim().slice(0, 40);
    if (!n || n === teamName()) return;
    setTeamName(n);
    push({ t: 'team_settings', a: 'up', c: 'id', r: { id: 1, name: n } });
  }
  var PIC_KEY = 'rf.teamPic';
  function teamPic() { return localStorage.getItem(PIC_KEY) || ''; }
  function renderTeamPic() {
    var c = document.querySelector('.crest'), u = teamPic();
    if (!c) return;
    c.textContent = '';
    c.classList.toggle('has-pic', !!u);
    if (u) {
      var im = document.createElement('img');
      im.alt = '';
      im.onerror = function () { c.classList.remove('has-pic'); setIc(c, 'ball'); };
      im.src = u;
      c.appendChild(im);
    } else setIc(c, 'ball');
  }
  function setTeamPic(u) {
    if (!u || u === teamPic()) return;
    try { localStorage.setItem(PIC_KEY, u); } catch (e) {}
    renderTeamPic();
  }
  function resizeImage(file) {
    return new Promise(function (res, rej) {
      var url = URL.createObjectURL(file), im = new Image();
      im.onload = function () {
        var s = Math.min(1, 512 / Math.max(im.width, im.height));
        var w = Math.max(1, Math.round(im.width * s)), h = Math.max(1, Math.round(im.height * s));
        var cv = document.createElement('canvas'); cv.width = w; cv.height = h;
        var cx = cv.getContext('2d');
        cx.fillStyle = '#fff'; cx.fillRect(0, 0, w, h);
        cx.drawImage(im, 0, 0, w, h);
        URL.revokeObjectURL(url);
        cv.toBlob(function (b) { b ? res(b) : rej(new Error('encode')); }, 'image/jpeg', 0.8);
      };
      im.onerror = function () { URL.revokeObjectURL(url); rej(new Error('Not a readable image')); };
      im.src = url;
    });
  }
  async function changeTeamPic(file) {
    if (!file) return;
    if (!sb) { alert('Team picture needs a connection to the server.'); return; }
    try {
      var blob = await resizeImage(file);
      var path = 'team-' + Date.now() + '.jpg';
      var up = await sb.storage.from('team-assets').upload(path, blob, { contentType: 'image/jpeg', cacheControl: '31536000' });
      if (up.error) throw up.error;
      var url = sb.storage.from('team-assets').getPublicUrl(path).data.publicUrl;
      setTeamPic(url);
      push({ t: 'team_settings', a: 'up', c: 'id', r: { id: 1, name: teamName(), picture_url: url } });
    } catch (e) {
      alert('Could not upload picture: ' + (e && e.message ? e.message : e));
    }
  }
  function teamSettings() {
    var old = $('teamMenu'); if (old) old.remove();
    var ov = el('div', 'tm-overlay'); ov.id = 'teamMenu';
    var box = el('div', 'tm-box');
    var b1 = el('button', 'tm-btn', 'Change team name');
    var b2 = el('button', 'tm-btn', 'Change team picture');
    var b3 = el('button', 'tm-btn tm-cancel', 'Cancel');
    var fi = document.createElement('input'); fi.type = 'file'; fi.accept = 'image/*'; fi.hidden = true;
    b1.type = b2.type = b3.type = 'button';
    b1.onclick = function () { ov.remove(); editTeamName(); };
    b2.onclick = function () { fi.click(); };
    fi.onchange = function () { var f = fi.files && fi.files[0]; ov.remove(); changeTeamPic(f); };
    b3.onclick = function () { ov.remove(); };
    ov.addEventListener('click', function (e) { if (e.target === ov) ov.remove(); });
    var sInfo = el('div', 'tm-storage', 'Storage: calculating…'), b4 = el('button', 'tm-btn', 'Clear cached media');
    b4.type = 'button';
    function showUsage() {
      mediaUsage().then(function (u) { sInfo.textContent = 'Storage: ' + fmtBytes(u.bytes) + ' of media on this device (' + u.n + ' file' + (u.n === 1 ? '' : 's') + ')'; b4.disabled = !u.n; })
        .catch(function () { sInfo.textContent = 'Storage: local media unavailable'; b4.disabled = true; });
    }
    b4.onclick = function () {
      if (!confirm('Clear cached photos and voice messages from this device? They will re-download when viewed.')) return;
      mediaClear().then(showUsage).catch(function () { sInfo.textContent = 'Could not clear cache'; });
    };
    showUsage();
    box.appendChild(b1); box.appendChild(b2); box.appendChild(sInfo); box.appendChild(b4); box.appendChild(b3); box.appendChild(fi);
    ov.appendChild(box); document.body.appendChild(ov);
  }
  function push(op) { state.outbox.push(op); save(); flush(); }
  async function exec(op) {
    var res = await exec0(op);
    // photos.album_id not migrated yet: store the photo unsorted rather than losing it
    if (res.error && op.t === 'photos' && op.r && 'album_id' in op.r && /album_id/.test(res.error.message || '')) {
      var r2 = Object.assign({}, op.r); delete r2.album_id;
      return exec0({ t: op.t, a: op.a, c: op.c, r: r2 });
    }
    return res;
  }
  function exec0(op) {
    var q = sb.from(op.t);
    if (op.a === 'up') return q.upsert(op.r, op.c ? { onConflict: op.c } : undefined);
    q = q.delete();
    Object.keys(op.m).forEach(function (k) { q = Array.isArray(op.m[k]) ? q.in(k, op.m[k]) : q.eq(k, op.m[k]); });
    return q;
  }
  function isNetErr(res) { return res.status === 0 || /fetch|network/i.test(res.error.message || ''); }
  async function flush() {
    if (flushing) return;
    if (!sb || !navigator.onLine) { setSync(sb ? 'offline' : 'local'); return; }
    flushing = true;
    try {
      while (state.outbox.length) {
        var res = await exec(state.outbox[0]);
        if (res.error) {
          if (isNetErr(res)) { setSync('offline'); return; }
          if (res.error.code === 'PGRST205' || res.error.code === '42P01') { setSync('setup'); return; }
          console.warn('dropping rejected op', state.outbox[0], res.error);
        }
        state.outbox.shift(); save();
      }
      await pull();
    } catch (e) { setSync('offline'); }
    finally { flushing = false; }
  }
  async function pull() {
    setSync('busy');
    var T = ['players', 'practices', 'availability', 'events', 'volunteer_items', 'assignments', 'chat_messages', 'lineup_positions'];
    var PT = ['polls', 'poll_options', 'poll_votes'];
    var pres = await Promise.all(PT.map(function (t) { return sb.from(t).select('*'); }));
    var res = await Promise.all(T.map(function (t) {
      var q = sb.from(t).select('*');
      if (t === 'chat_messages') q = q.order('created_at', { ascending: false }).limit(300);
      return q;
    }));
    for (var i = 0; i < res.length; i++) {
      if (res[i].error) { setSync(isNetErr(res[i]) ? 'offline' : 'setup'); return; }
    }
    var pollsOk = true;
    for (var j = 0; j < pres.length; j++) {
      if (pres[j].error) {
        if (isNetErr(pres[j])) { setSync('offline'); return; }
        pollsOk = false; // poll tables not created yet: keep local polls, don't break the rest
      }
    }
    var photosRes = await sb.from('photos').select('*');
    var albumsRes = await sb.from('albums').select('*');
    var ad = await sb.from('chat_admins').select('*');
    var adminsOk = !ad.error;
    var ts = await sb.from('team_settings').select('*').eq('id', 1);
    if (!ts.error && ts.data && ts.data[0] && !state.outbox.length) { setTeamName(ts.data[0].name); if (ts.data[0].picture_url) setTeamPic(ts.data[0].picture_url); }
    if (state.outbox.length) return; // local edits made mid-pull win; next flush re-pulls
    var d = res.map(function (r) { return r.data || []; });
    state.players = d[0].sort(byCreated).map(function (r) { return { id: r.id, name: r.name }; });
    state.practices = d[1].map(function (r) {
      return { id: r.id, date: r.date, time: (r.time || '').slice(0, 5), location: r.location || '', field_address: r.field_address || '',
        field_map_url: r.field_map_url || '', notes: r.notes || '', created_at: r.created_at };
    });
    state.avail = {};
    d[2].forEach(function (r) { (state.avail[r.practice_id] = state.avail[r.practice_id] || {})[r.player_id] = r.status; });
    state.events = d[3].map(function (r) {
      return { id: r.id, title: r.title, date: r.date || '', time: (r.time || '').slice(0, 5), venue_name: r.venue_name || '',
        venue_address: r.venue_address || '', venue_map_url: r.venue_map_url || '', notes: r.notes || '', created_at: r.created_at };
    });
    state.items = d[4].sort(byCreated);
    state.assignments = d[5].sort(byCreated);
    state.chat = d[6].sort(byCreated).map(chatRow);
    if (!photosRes.error) state.photos = (photosRes.data || []).sort(byCreated);
    if (!albumsRes.error) state.albums = (albumsRes.data || []).sort(byCreated);
    if (pollsOk) {
      state.polls = pres[0].data.sort(byCreated);
      state.pollOpts = pres[1].data.sort(function (x, y) { return (x.position || 0) - (y.position || 0); });
      state.pollVotes = pres[2].data;
    }
    if (adminsOk) state.admins = ad.data.sort(byCreated).map(function (r) { return r.name; });
    state.lineup.pos = {};
    d[7].forEach(function (r) { state.lineup.pos[r.player_id] = { x: r.x, y: r.y }; });
    save(); setSync('synced');
    renderAll(true);
  }
  function byCreated(a, b) { return (a.created_at || '') < (b.created_at || '') ? -1 : 1; }
  function chatRow(r) { return { id: r.id, sender: r.sender, body: r.body, created_at: r.created_at }; }

  function subscribe() {
    if (!sb) return;
    sb.channel('team-live').on('postgres_changes', { event: '*', schema: 'public', table: 'team_settings' }, function (p) {
      if (p.new && p.new.name) setTeamName(p.new.name);
      if (p.new && p.new.picture_url) setTeamPic(p.new.picture_url);
    }).subscribe();
    sb.channel('chat-live').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, function (p) {
      addChat(chatRow(p.new), true);
    }).on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'chat_messages' }, function (p) {
      if (p.old && p.old.id) removeChat(p.old.id);
    }).subscribe();
    sb.channel('albums-live').on('postgres_changes', { event: '*', schema: 'public', table: 'albums' }, function (p) {
      var r = p.eventType === 'DELETE' ? p.old : p.new;
      if (!r || !r.id) return;
      state.albums = state.albums.filter(function (a) { return a.id !== r.id; });
      if (p.eventType !== 'DELETE') state.albums.push(r);
      save(); renderAlbum();
    }).on('postgres_changes', { event: '*', schema: 'public', table: 'photos' }, function (p) {
      var r = p.eventType === 'DELETE' ? p.old : p.new;
      if (!r || !r.id) return;
      state.photos = state.photos.filter(function (x) { return x.id !== r.id; });
      if (p.eventType !== 'DELETE') state.photos.push(r);
      save(); renderAlbum();
    }).subscribe();
    sb.channel('admins-live').on('postgres_changes', { event: '*', schema: 'public', table: 'chat_admins' }, function (p) {
      var r = p.eventType === 'DELETE' ? p.old : p.new;
      if (!r || !r.name) return;
      var k = r.name.toLowerCase();
      state.admins = state.admins.filter(function (n) { return n.toLowerCase() !== k; });
      if (p.eventType !== 'DELETE') state.admins.push(r.name);
      save(); renderChat(); renderPolls(); renderMembers();
    }).subscribe();
  }

  // ---------- date helpers ----------
  function sortKey(p) { return (p.date || '') + ' ' + (p.time || ''); }
  function stamp(p) { return new Date((p.date || '') + 'T' + (p.time || '00:00')); }
  function fmt(p) {
    var d = stamp(p);
    if (isNaN(d)) return [p.date, p.time].filter(Boolean).join(' ');
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) +
      (p.time ? ' · ' + d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }) : '');
  }
  function isPast(p) { return stamp(p) < new Date(); }
  function bySort(a, b) { return sortKey(a) < sortKey(b) ? -1 : 1; }
  function selected() {
    var list = state.practices.slice().sort(bySort);
    var found = list.filter(function (p) { return p.id === state.sel; })[0];
    if (found) return found;
    return list.filter(function (p) { return !isPast(p); })[0] || list[list.length - 1] || null;
  }

  // ---------- status model ----------
  var NEXT = { maybe: 'available', available: 'unavailable', unavailable: 'injured', injured: 'maybe' };
  var LABEL = { available: 'Available', unavailable: 'Unavailable', injured: 'Injured', maybe: 'Maybe' };
  var ICON = { available: 'checkcircle', unavailable: 'ban', injured: 'medical', maybe: 'help' };
  function getAvail(pid, plid) { return (state.avail[pid] || {})[plid] || 'maybe'; }
  function teamOf(pid, plid) { return (state.teams[pid] || {})[plid]; }
  function teamable(a) { return a === 'maybe' || a === 'available'; }

  // ---------- navigation: 5 panes (Games / Gathering / Chat / Polls / Photos) ----------
  var paneOf = { polls: 'polls-pane', practices: 'soccer', players: 'soccer', avail: 'soccer', teams: 'soccer', lineup: 'soccer', events: 'gather', album: 'album-pane', chat: 'chat-pane' };
  var lastSub = { soccer: 'practices', gather: 'events', 'chat-pane': 'chat', 'polls-pane': 'polls', 'album-pane': 'album' };
  var curTab = 'practices', beforeChat = 'practices';
  var tabOrder = ['practices', 'players', 'avail', 'teams', 'lineup', 'events', 'chat', 'polls', 'album'];
  var enterTimer = null;
  function showTab(name) {
    if (typeof setLuFull === 'function' && name !== 'lineup') setLuFull(false);
    var dir = tabOrder.indexOf(name) >= tabOrder.indexOf(curTab) ? 1 : -1;
    document.documentElement.style.setProperty('--dir', dir);
    var pane = paneOf[name] || 'soccer';
    if (name !== 'chat') beforeChat = name;
    curTab = name; lastSub[pane] = name;
    document.querySelectorAll('.bottombar button').forEach(function (x) { x.classList.toggle('active', x.dataset.pane === pane); });
    document.querySelectorAll('.pane').forEach(function (p) { p.classList.toggle('active', p.id === pane); });
    document.querySelectorAll('.subnav button').forEach(function (x) { x.classList.toggle('active', x.dataset.tab === name); });
    document.querySelectorAll('.tab').forEach(function (t) { t.classList.toggle('active', t.id === name); });
    document.body.classList.toggle('on-chat', name === 'chat');
    document.querySelectorAll('.subnav button').forEach(function (x) { x.setAttribute('aria-selected', x.dataset.tab === name); });
    if (name === 'chat') openChat();
    renderAll();
    window.scrollTo(0, 0);
    markEntering(name);
    var b = document.querySelector('.subnav button[data-tab="' + name + '"]');
    if (b && b.scrollIntoView) b.scrollIntoView({ inline: 'center', block: 'nearest' });
  }
  function markEntering(name) {
    var t = $(name); if (!t) return;
    document.querySelectorAll('.tab.entering').forEach(function (x) { x.classList.remove('entering'); });
    void t.offsetWidth; t.classList.add('entering');
    clearTimeout(enterTimer);
    enterTimer = setTimeout(function () { t.classList.remove('entering'); }, 900);
  }
  document.querySelectorAll('.subnav button').forEach(function (b) { b.onclick = function () { showTab(b.dataset.tab); }; });
  document.querySelectorAll('.bottombar button').forEach(function (b) { b.onclick = function () { showTab(lastSub[b.dataset.pane]); }; });

  // ---------- bring list (practices + events) ----------
  function bringList(owner) {
    var key = owner.practice_id ? 'practice_id' : 'event_id';
    var oid = owner[key];
    var wrap = el('div', 'sub');
    wrap.appendChild(ei('h4', null, 'package', 'Bring list'));
    var items = state.items.filter(function (i) { return i[key] === oid; });
    var ul = el('ul', 'bring');
    if (!items.length) ul.appendChild(el('li', 'muted', 'Nothing yet — add what is needed.'));
    items.forEach(function (it) {
      var li = el('li', it.volunteer_name ? 'taken' : '');
      var info = el('div', 'grow');
      var t = el('strong', null, it.item);
      if (it.quantity) t.appendChild(el('span', 'qty', '× ' + it.quantity.replace(/^[x×]\s*/i, '')));
      info.appendChild(t);
      if (it.volunteer_name) info.appendChild(ei('small', null, 'check', it.volunteer_name + ' is bringing it'));
      var btn = el('button', 'vol' + (it.volunteer_name ? ' on' : ''), it.volunteer_name ? 'Withdraw' : "I'll bring it");
      btn.onclick = function () {
        if (it.volunteer_name) it.volunteer_name = null;
        else {
          var n = askName('Your name?');
          if (!n) return;
          it.volunteer_name = n;
        }
        pushItem(it); renderAll();
      };
      var del = ei('button', 'del sm', 'x');
      del.setAttribute('aria-label', 'Remove item');
      del.onclick = function () {
        state.items = state.items.filter(function (x) { return x.id !== it.id; });
        push({ t: 'volunteer_items', a: 'del', m: { id: it.id } }); renderAll();
      };
      li.appendChild(info); li.appendChild(btn); li.appendChild(del);
      ul.appendChild(li);
    });
    wrap.appendChild(ul);
    var f = el('form', 'inline');
    var i1 = el('input'); i1.placeholder = 'Item (e.g. Water bottles)'; i1.required = true;
    var i2 = el('input', 'qty-in'); i2.placeholder = 'Qty'; i2.setAttribute('aria-label', 'Quantity');
    var ad = el('button', 'primary sm', 'Add'); ad.type = 'submit';
    f.appendChild(i1); f.appendChild(i2); f.appendChild(ad);
    f.onsubmit = function (e) {
      e.preventDefault();
      if (!i1.value.trim()) return;
      var it = { id: uid(), practice_id: null, event_id: null, item: i1.value.trim(), quantity: i2.value.trim(), volunteer_name: null, created_at: nowIso() };
      it[key] = oid;
      state.items.push(it); pushItem(it); renderAll();
    };
    wrap.appendChild(f);
    return wrap;
  }
  function pushItem(it) {
    push({ t: 'volunteer_items', a: 'up', r: { id: it.id, practice_id: it.practice_id || null, event_id: it.event_id || null, item: it.item,
      quantity: it.quantity || null, volunteer_name: it.volunteer_name || null, created_at: it.created_at } });
  }
  function toggleBring(id, content) {
    var b = ei('button', 'link', openBring[id] ? 'chevdown' : 'chevright', 'Bring list');
    b.onclick = function () { openBring[id] = !openBring[id]; renderAll(); };
    return b;
  }

  // ---------- practices ----------
  $('practice-form').onsubmit = function (e) {
    e.preventDefault();
    var old = editingPractice && state.practices.filter(function (x) { return x.id === editingPractice; })[0];
    var p = { id: old ? old.id : uid(), date: $('p-date').value, time: $('p-time').value, location: $('p-place').value.trim(),
      field_address: $('p-addr').value.trim(), field_map_url: $('p-map').value.trim(), notes: $('p-notes').value.trim(), created_at: old ? old.created_at : nowIso() };
    if (p.field_map_url && !safeUrl(p.field_map_url)) { alert('Map link must start with http:// or https://'); return; }
    if (old) { state.practices[state.practices.indexOf(old)] = p; }
    else { state.practices.push(p); if (!state.sel) state.sel = p.id; }
    push({ t: 'practices', a: 'up', r: practiceRow(p) });
    endPracticeEdit(); renderAll();
  };
  var editingPractice = null;
  function endPracticeEdit() {
    editingPractice = null; $('practice-form').reset(); $('practice-fold').open = false;
    $('practice-form').querySelector('button.primary').textContent = 'Add game';
    setIc($('practice-fold').querySelector('summary'), 'plus', 'New game');
    $('p-cancel').hidden = true;
  }
  $('p-cancel').onclick = function () { endPracticeEdit(); };
  function startPracticeEdit(p) {
    editingPractice = p.id;
    $('p-date').value = p.date || ''; $('p-time').value = p.time || ''; $('p-place').value = p.location || '';
    $('p-addr').value = p.field_address || ''; $('p-map').value = p.field_map_url || ''; $('p-notes').value = p.notes || '';
    $('practice-form').querySelector('button.primary').textContent = 'Save changes';
    setIc($('practice-fold').querySelector('summary'), 'edit', 'Edit game');
    $('p-cancel').hidden = false;
    $('practice-fold').open = true; $('practice-fold').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function practiceItem(p) {
    var li = el('li', 'card-item');
    var top = el('div', 'top');
    var info = el('div', 'grow');
    info.appendChild(el('strong', null, fmt(p)));
    if (p.location) info.appendChild(ei('small', null, 'ball', p.location));
    if (p.field_address) info.appendChild(ei('small', null, 'pin', p.field_address));
    if (p.notes) info.appendChild(el('small', 'notes', p.notes));
    var del = ei('button', 'del', 'trash');
    del.setAttribute('aria-label', 'Delete game');
    del.onclick = function () {
      if (!confirm('Delete this game?')) return;
      state.practices = state.practices.filter(function (x) { return x.id !== p.id; });
      state.items = state.items.filter(function (x) { return x.practice_id !== p.id; });
      delete state.avail[p.id]; delete state.teams[p.id];
      push({ t: 'practices', a: 'del', m: { id: p.id } }); renderAll();
    };
    var edit = ei('button', 'edit', 'edit');
    edit.setAttribute('aria-label', 'Edit game');
    edit.onclick = function () { startPracticeEdit(p); };
    top.appendChild(info); top.appendChild(edit); top.appendChild(del);
    li.appendChild(top);
    var me = mapEmbed(p.field_address);
    if (me) li.appendChild(me);
    var cn = { available: 0, maybe: 0, unavailable: 0, injured: 0 };
    state.players.forEach(function (pl) { cn[getAvail(p.id, pl.id)]++; });
    var sum = cn.available + ' available · ' + cn.maybe + ' maybe · ' + cn.unavailable + ' out' + (cn.injured ? ' · ' + cn.injured + ' injured' : '');
    li.appendChild(el('div', 'avail-sum', sum));
    var acts = el('div', 'acts');
    var mb = mapsBtn(p.field_map_url, p.field_address);
    if (mb) acts.appendChild(mb);
    acts.appendChild(toggleBring(p.id));
    li.appendChild(acts);
    if (openBring[p.id]) li.appendChild(bringList({ practice_id: p.id }));
    return li;
  }
  function renderPractices() {
    var sorted = state.practices.slice().sort(bySort);
    var up = $('upcoming'), past = $('past');
    up.innerHTML = ''; past.innerHTML = '';
    sorted.filter(function (p) { return !isPast(p); }).forEach(function (p) { up.appendChild(practiceItem(p)); });
    sorted.filter(isPast).reverse().forEach(function (p) { past.appendChild(practiceItem(p)); });
    if (!up.children.length) up.appendChild(el('li', 'muted empty', 'No upcoming games.'));
  }

  // ---------- players ----------
  $('player-form').onsubmit = function (e) {
    e.preventDefault();
    var name = $('player-name').value.trim();
    if (!name) return;
    var p = { id: uid(), name: name };
    state.players.push(p);
    push({ t: 'players', a: 'up', r: { id: p.id, name: name, created_at: nowIso() } });
    e.target.reset(); renderAll();
  };
  function renderPlayers() {
    var ul = $('player-list'); ul.innerHTML = '';
    $('player-count').textContent = state.players.length + ' player' + (state.players.length === 1 ? '' : 's');
    state.players.forEach(function (pl) {
      var li = el('li'); li.appendChild(el('strong', null, pl.name));
      var del = ei('button', 'del', 'trash');
      del.setAttribute('aria-label', 'Remove ' + pl.name);
      del.onclick = function () {
        if (!confirm('Remove ' + pl.name + '?')) return;
        state.players = state.players.filter(function (x) { return x.id !== pl.id; });
        Object.keys(state.avail).forEach(function (k) { delete state.avail[k][pl.id]; });
        Object.keys(state.teams).forEach(function (k) { delete state.teams[k][pl.id]; });
        delete state.lineup.pos[pl.id];
        push({ t: 'players', a: 'del', m: { id: pl.id } }); renderAll();
      };
      li.appendChild(del); ul.appendChild(li);
    });
  }

  // ---------- practice selectors ----------
  function fillSelect(sel) {
    var cur = selected();
    sel.innerHTML = '';
    if (!state.practices.length) { sel.appendChild(new Option('No games yet', '')); return null; }
    state.practices.slice().sort(bySort).forEach(function (p) {
      var o = new Option(fmt(p) + (p.location ? ' – ' + p.location : ''), p.id);
      o.selected = cur && cur.id === p.id;
      sel.appendChild(o);
    });
    return cur;
  }
  ['avail-practice', 'teams-practice', 'lineup-practice'].forEach(function (id) {
    $(id).onchange = function () { state.sel = this.value; save(); renderAll(); };
  });

  // ---------- availability ----------
  function renderAvail() {
    var p = fillSelect($('avail-practice'));
    var ul = $('avail-list'), counts = $('avail-counts');
    ul.innerHTML = ''; counts.innerHTML = '';
    if (!p) { ul.appendChild(el('li', 'muted empty', 'Create a game first.')); return; }
    var n = { available: 0, maybe: 0, unavailable: 0, injured: 0 };
    state.players.forEach(function (pl) { n[getAvail(p.id, pl.id)]++; });
    ['available', 'maybe', 'unavailable', 'injured'].forEach(function (k) {
      var d = el('div', k); d.appendChild(el('span', null, n[k])); d.appendChild(document.createTextNode(LABEL[k]));
      counts.appendChild(d);
    });
    if (!state.players.length) ul.appendChild(el('li', 'muted empty', 'Add players first.'));
    state.players.forEach(function (pl) {
      var a = getAvail(p.id, pl.id);
      var li = el('li', a);
      li.appendChild((function () { var s = el('strong'); if (a === 'injured') setIc(s, 'medical'); s.appendChild(document.createTextNode(pl.name)); return s; })());
      li.appendChild(ei('span', 'badge ' + a, ICON[a], LABEL[a]));
      li.onclick = function () {
        var m = state.avail[p.id] = state.avail[p.id] || {};
        m[pl.id] = NEXT[a];
        if (!teamable(m[pl.id]) && state.teams[p.id]) delete state.teams[p.id][pl.id];
        push(availOp(p.id, pl.id, m[pl.id])); renderAll();
      };
      ul.appendChild(li);
    });
  }

  // ---------- teams ----------
  function setTeam(p, plid, team) {
    var t = state.teams[p.id] = state.teams[p.id] || {};
    if (team) t[plid] = team; else delete t[plid];
    save(); renderTeams();
  }
  function chipBtn(cls, name, ic, label) {
    var b = el('button', 'pchip ' + cls); b.type = 'button';
    b.appendChild(el('span', 'pav', initials(name)));
    b.appendChild(el('span', 'pn', name));
    if (label) b.appendChild(el('em', 'pq', label));
    if (ic) b.insertAdjacentHTML('beforeend', '<span class="pi">' + svg(ic) + '</span>');
    return b;
  }
  function setCount(id, n) {
    var e = $(id);
    if (e.textContent === String(n)) return;
    e.textContent = n; e.classList.remove('bump'); void e.offsetWidth; e.classList.add('bump');
  }
  function renderTeams() {
    var p = fillSelect($('teams-practice'));
    ['red-list', 'yellow-list', 'pool', 'out'].forEach(function (id) { $(id).innerHTML = ''; });
    $('pick-red').classList.toggle('active', pickTeam === 'red');
    $('pick-yellow').classList.toggle('active', pickTeam === 'yellow');
    $('team-seg').dataset.v = pickTeam;
    var cnt = { red: 0, yellow: 0, pool: 0, out: 0 };
    if (p) {
      state.players.forEach(function (pl) {
        var a = getAvail(p.id, pl.id), t = teamOf(p.id, pl.id);
        if (!teamable(a)) {
          cnt.out++;
          var o = chipBtn('out', pl.name, null, LABEL[a]); o.disabled = true;
          $('out').appendChild(o);
        } else if (t) {
          cnt[t]++;
          var c = chipBtn(t, pl.name, 'x', a === 'maybe' ? 'maybe' : '');
          c.setAttribute('aria-label', 'Remove ' + pl.name + ' from team ' + t);
          c.onclick = function () { setTeam(p, pl.id, null); };
          $(t + '-list').appendChild(c);
        } else {
          cnt.pool++;
          var pi = chipBtn('bench add-' + pickTeam, pl.name, 'plus', a === 'maybe' ? 'maybe' : '');
          pi.setAttribute('aria-label', 'Add ' + pl.name + ' to team ' + pickTeam);
          pi.onclick = function () { setTeam(p, pl.id, pickTeam); };
          $('pool').appendChild(pi);
        }
      });
    }
    setCount('red-n', cnt.red); setCount('yellow-n', cnt.yellow); setCount('pool-n', cnt.pool); setCount('out-n', cnt.out);
    var diff = Math.abs(cnt.red - cnt.yellow), b = $('balance');
    b.className = 'balance' + (diff > 1 ? ' uneven' : '');
    b.textContent = diff > 1
      ? 'Uneven: ' + (cnt.red > cnt.yellow ? 'Red' : 'Yellow') + ' has ' + diff + ' more'
      : cnt.red + cnt.yellow ? 'Teams are balanced' : 'Tap players below to build teams';
    if (diff > 1) b.insertAdjacentHTML('afterbegin', svg('alert')); else if (cnt.red + cnt.yellow) b.insertAdjacentHTML('afterbegin', svg('check'));
    if (!cnt.red) $('red-list').appendChild(el('span', 'chip-empty', 'No players yet'));
    if (!cnt.yellow) $('yellow-list').appendChild(el('span', 'chip-empty', 'No players yet'));
    if (!cnt.pool) $('pool').appendChild(el('span', 'chip-empty', p ? 'Everyone is assigned' : 'Create a game first'));
    if (!cnt.out) $('out').appendChild(el('span', 'chip-empty', 'None'));
  }
  $('pick-red').onclick = function () { pickTeam = 'red'; renderTeams(); };
  $('pick-yellow').onclick = function () { pickTeam = 'yellow'; renderTeams(); };
  var shuffling = false;
  $('auto-balance').onclick = function () {
    var p = selected(); if (!p || shuffling) return;
    var ids = state.players.filter(function (pl) { return teamable(getAvail(p.id, pl.id)); }).map(function (pl) { return pl.id; });
    if (!ids.length) return;
    // Fisher-Yates: draw names from a hat
    for (var i = ids.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), tmp = ids[i]; ids[i] = ids[j]; ids[j] = tmp;
    }
    var t = state.teams[p.id] = state.teams[p.id] || {};
    ids.forEach(function (id) { delete t[id]; });
    shuffling = true;
    renderTeams();
    var pool = $('pool'), n = 0;
    pool.classList.add('shuffling');
    var tick = setInterval(function () {
      var kids = Array.prototype.slice.call(pool.children);
      kids.sort(function () { return Math.random() - 0.5; }).forEach(function (k) { pool.appendChild(k); });
      if (++n < 6) return;
      clearInterval(tick);
      pool.classList.remove('shuffling');
      var half = Math.ceil(ids.length / 2); // Red gets the extra player when odd
      ids.forEach(function (id, k) { t[id] = k < half ? 'red' : 'yellow'; });
      shuffling = false;
      save(); renderTeams();
      ['red-list', 'yellow-list'].forEach(function (id) {
        Array.prototype.forEach.call($(id).querySelectorAll('.pchip'), function (c, k) { c.style.animationDelay = (k * 40) + 'ms'; c.classList.add('settle'); });
      });
    }, 130);
  };

  // ---------- lineup board ----------
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
  function lineupPool() {
    var p = selected();
    if (!p) return [];
    return state.players.filter(function (pl) { return getAvail(p.id, pl.id) === 'available'; });
  }
  function onField() { return lineupPool().filter(function (p) { return state.lineup.pos[p.id]; }); }
  function savePos(plid) { save(); push(posOp(plid, state.lineup.pos[plid])); }
  function pathPts(s) { return s.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '); }
  function drawStroke(s) {
    var pl = document.createElementNS(NS, 'polyline');
    pl.setAttribute('points', pathPts(s));
    pl.setAttribute('class', 'stroke');
    $('lu-draw').appendChild(pl);
    return pl;
  }
  function teamCls(p, pl) {
    var t = p && teamOf(p.id, pl.id);
    return t === 'red' ? 't-red' : t === 'yellow' ? 't-yellow' : 't-none';
  }
  function renderLineup() {
    var p = fillSelect($('lineup-practice'));
    var f = $('field'), lp = $('lu-players'), L = state.lineup;
    f.classList.toggle('pen', luMode === 'pen');
    $('lu-move').classList.toggle('active', luMode === 'move');
    $('lu-pen').classList.toggle('active', luMode === 'pen');
    var pool = lineupPool(), on = onField();
    var have = {};
    Array.prototype.slice.call(lp.children).forEach(function (n) { have[n.dataset.id] = n; });
    on.forEach(function (pl) {
      var pos = L.pos[pl.id];
      var d = have[pl.id], fresh = !d;
      if (d) { delete have[pl.id]; d.innerHTML = ''; } else { d = el('div'); d.dataset.id = pl.id; }
      d.className = 'pl ' + teamCls(p, pl) + (luSel === pl.id ? ' sel' : '') + (fresh ? ' pop' : '');
      d.style.left = pos.x + '%'; d.style.top = pos.y + '%';
      d.appendChild(el('span', 'jersey', initials(pl.name)));
      d.appendChild(el('span', 'nm', pl.name.split(/\s+/)[0]));
      if (luSel === pl.id) {
        var x = el('button', 'rm', '×');
        x.setAttribute('aria-label', 'Remove ' + pl.name + ' from field');
        x.onpointerdown = function (e) { e.stopPropagation(); };
        x.onclick = function (e) {
          e.stopPropagation(); delete L.pos[pl.id]; luSel = null; save();
          push({ t: 'lineup_positions', a: 'del', m: { player_id: pl.id } }); renderLineup();
        };
        d.appendChild(x);
      }
      lp.appendChild(d);
    });
    Object.keys(have).forEach(function (k) { have[k].remove(); });
    $('lu-draw').innerHTML = '';
    L.strokes.forEach(drawStroke);
    $('lu-count').textContent = on.length + ' on';
    $('lu-hint').style.display = on.length || L.strokes.length ? 'none' : '';
    $('lu-help').textContent = luMode === 'pen' ? 'Pen: draw lines on the field. Switch to Move to place players.'
      : luSel ? 'Now tap a spot on the field (or drag a placed player).' : 'Tap a player, then tap the field. Tap a placed player to select or remove.';
    var ro = $('lu-roster'); ro.innerHTML = '';
    if (!p) ro.appendChild(el('p', 'muted', 'Create a game first.'));
    else if (!state.players.length) ro.appendChild(el('p', 'muted', 'Add players in the Players tab first.'));
    else if (!pool.length) ro.appendChild(el('p', 'muted', 'No players marked Available for this game. Set them in the Availability tab.'));
    pool.forEach(function (pl) {
      var c = el('button', 'lchip ' + teamCls(p, pl) + (L.pos[pl.id] ? ' on' : '') + (luSel === pl.id ? ' sel' : ''));
      c.appendChild(el('span', 'jersey', initials(pl.name)));
      c.appendChild(el('span', null, pl.name));
      c.onclick = function () { luSel = luSel === pl.id ? null : pl.id; renderLineup(); };
      ro.appendChild(c);
    });
  }
  (function () {
    var f = $('field');
    f.addEventListener('pointerdown', function (e) {
      if (e.target.closest('.rm') || e.target.closest('.fs-btn')) return;
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
        t.classList.add('drag');
        luDrag = { id: t.dataset.id, moved: false, sx: e.clientX, sy: e.clientY, wasSel: luSel === t.dataset.id, node: t };
        return;
      }
      if (luSel) {
        state.lineup.pos[luSel] = { x: p.x, y: p.y };
        var id = luSel; luSel = null; savePos(id); renderLineup();
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
        var d = luDrag; luDrag = null; d.node.classList.remove('drag');
        if (d.moved) { luSel = d.id; savePos(d.id); }
        else luSel = d.wasSel ? null : d.id;
        renderLineup();
      }
    }
    f.addEventListener('pointerup', end);
    f.addEventListener('pointercancel', end);
  })();
  function setLuFull(on) {
    $('lineup').classList.toggle('full', on);
    document.body.classList.toggle('lu-full', on);
    var b = $('lu-full'); b.innerHTML = svg(on ? 'shrink' : 'expand');
    b.setAttribute('aria-label', on ? 'Exit full screen' : 'Full screen field');
  }
  $('lu-full').onclick = function () { setLuFull(!$('lineup').classList.contains('full')); };
  $('lu-full-x').onclick = function () { setLuFull(false); };
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && $('lineup').classList.contains('full')) setLuFull(false); });
  $('lu-move').onclick = function () { luMode = 'move'; renderLineup(); };
  $('lu-pen').onclick = function () { luMode = 'pen'; luSel = null; renderLineup(); };
  $('lu-clear').onclick = function () {
    var ids = Object.keys(state.lineup.pos);
    if ((ids.length || state.lineup.strokes.length) && !confirm('Clear all players and drawings from the board?')) return;
    state.lineup = { pos: {}, strokes: [] }; luSel = null; save();
    if (ids.length) push({ t: 'lineup_positions', a: 'del', m: { player_id: ids } });
    renderLineup();
  };
  // rows back-to-front (GK, defense, midfield, attack) for n players
  function formationRows(n) {
    if (n <= 1) return [n];
    if (n === 6) return [2, 3, 1];
    var rest = n - 1, att = rest >= 7 ? 2 : rest >= 3 ? 1 : 0, r = rest - att, def = Math.ceil(r / 2), mid = r - def;
    return [1, def, mid, att].filter(function (c) { return c > 0; });
  }
  function placeSide(list, top) {
    var rows = formationRows(list.length), i = 0, p = state.lineup.pos;
    rows.forEach(function (c, ri) {
      var t = rows.length === 1 ? 0.5 : ri / (rows.length - 1);
      var y = top ? 8 + t * 34 : 92 - t * 34;
      for (var j = 0; j < c; j++) p[list[i++].id] = { x: c === 1 ? 50 : 18 + j * (64 / (c - 1)), y: y };
    });
  }
  $('lu-auto').onclick = function () {
    var list = onField();
    if (!list.length) list = lineupPool().slice(0, 22);
    if (!list.length) return;
    var pr = selected(), side = { red: [], yellow: [], none: [] };
    list.forEach(function (pl) {
      var t = pr && teamOf(pr.id, pl.id);
      side[t === 'red' || t === 'yellow' ? t : 'none'].push(pl);
    });
    placeSide(side.red, true);
    placeSide(side.yellow, false);
    side.none.forEach(function (pl, k) {
      state.lineup.pos[pl.id] = { x: 5, y: side.none.length === 1 ? 50 : 8 + k * (84 / (side.none.length - 1)) };
    });
    luSel = null; save();
    list.forEach(function (pl) { push(posOp(pl.id, state.lineup.pos[pl.id])); });
    renderLineup();
  };

  // ---------- events ----------
  $('event-form').onsubmit = function (e) {
    e.preventDefault();
    var old = editingEvent && state.events.filter(function (x) { return x.id === editingEvent; })[0];
    var ev = { id: old ? old.id : uid(), title: $('e-title').value.trim(), date: $('e-date').value, time: $('e-time').value,
      venue_name: $('e-venue').value.trim(), venue_address: $('e-addr').value.trim(), venue_map_url: $('e-map').value.trim(),
      notes: $('e-notes').value.trim(), created_at: old ? old.created_at : nowIso() };
    if (!ev.title) return;
    if (ev.venue_map_url && !safeUrl(ev.venue_map_url)) { alert('Map link must start with http:// or https://'); return; }
    if (old) state.events[state.events.indexOf(old)] = ev; else state.events.push(ev);
    push({ t: 'events', a: 'up', r: eventRow(ev) });
    endEventEdit(); renderAll();
  };
  var editingEvent = null;
  function endEventEdit() {
    editingEvent = null; $('event-form').reset(); $('event-fold').open = false;
    $('event-form').querySelector('button.primary').textContent = 'Add event';
    setIc($('event-fold').querySelector('summary'), 'plus', 'New event');
    $('e-cancel').hidden = true;
  }
  $('e-cancel').onclick = function () { endEventEdit(); };
  function startEventEdit(ev) {
    editingEvent = ev.id;
    $('e-title').value = ev.title || ''; $('e-date').value = ev.date || ''; $('e-time').value = ev.time || '';
    $('e-venue').value = ev.venue_name || ''; $('e-addr').value = ev.venue_address || '';
    $('e-map').value = ev.venue_map_url || ''; $('e-notes').value = ev.notes || '';
    $('event-form').querySelector('button.primary').textContent = 'Save changes';
    setIc($('event-fold').querySelector('summary'), 'edit', 'Edit event');
    $('e-cancel').hidden = false;
    $('event-fold').open = true; $('event-fold').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function eventRow(ev) {
    return { id: ev.id, title: ev.title, date: ev.date || null, time: ev.time || null, venue_name: ev.venue_name || null,
      venue_address: ev.venue_address || null, venue_map_url: ev.venue_map_url || null, notes: ev.notes || null, created_at: ev.created_at || nowIso() };
  }
  function pushAssign(a) {
    push({ t: 'assignments', a: 'up', r: { id: a.id, event_id: a.event_id, task: a.task, assignee: a.assignee || null, done: !!a.done, created_at: a.created_at } });
  }
  function assignments(ev) {
    var wrap = el('div', 'sub');
    wrap.appendChild(ei('h4', null, 'clipboard', 'Who does what'));
    var list = state.assignments.filter(function (a) { return a.event_id === ev.id; });
    var ul = el('ul', 'bring');
    if (!list.length) ul.appendChild(el('li', 'muted', 'No tasks yet.'));
    list.forEach(function (a) {
      var li = el('li', a.done ? 'taken' : '');
      var cb = el('input', 'cb'); cb.type = 'checkbox'; cb.checked = !!a.done;
      cb.setAttribute('aria-label', 'Done');
      cb.onchange = function () { a.done = cb.checked; pushAssign(a); renderAll(); };
      var info = el('div', 'grow');
      info.appendChild(el('strong', a.done ? 'strike' : '', a.task));
      if (a.assignee) info.appendChild(ei('small', null, 'user', a.assignee));
      var del = ei('button', 'del sm', 'x');
      del.setAttribute('aria-label', 'Remove task');
      del.onclick = function () {
        state.assignments = state.assignments.filter(function (x) { return x.id !== a.id; });
        push({ t: 'assignments', a: 'del', m: { id: a.id } }); renderAll();
      };
      li.appendChild(cb); li.appendChild(info); li.appendChild(del);
      ul.appendChild(li);
    });
    wrap.appendChild(ul);
    var f = el('form', 'inline');
    var i1 = el('input'); i1.placeholder = 'Task (e.g. Book hall)'; i1.required = true;
    var i2 = el('input', 'qty-in wide'); i2.placeholder = 'Assignee';
    var ad = el('button', 'primary sm', 'Add'); ad.type = 'submit';
    f.appendChild(i1); f.appendChild(i2); f.appendChild(ad);
    f.onsubmit = function (e) {
      e.preventDefault();
      if (!i1.value.trim()) return;
      var a = { id: uid(), event_id: ev.id, task: i1.value.trim(), assignee: i2.value.trim(), done: false, created_at: nowIso() };
      state.assignments.push(a); pushAssign(a); renderAll();
    };
    wrap.appendChild(f);
    return wrap;
  }
  function eventCard(ev) {
    var li = el('li', 'card-item');
    var top = el('div', 'top');
    var info = el('div', 'grow');
    info.appendChild(el('strong', null, ev.title));
    if (ev.date) info.appendChild(ei('small', null, 'calendar', fmt(ev)));
    if (ev.venue_name) info.appendChild(ei('small', null, 'home', ev.venue_name));
    if (ev.venue_address) info.appendChild(ei('small', null, 'pin', ev.venue_address));
    if (ev.notes) info.appendChild(el('small', 'notes', ev.notes));
    var del = ei('button', 'del', 'trash');
    del.setAttribute('aria-label', 'Delete event');
    del.onclick = function () {
      if (!confirm('Delete this event?')) return;
      state.events = state.events.filter(function (x) { return x.id !== ev.id; });
      state.items = state.items.filter(function (x) { return x.event_id !== ev.id; });
      state.assignments = state.assignments.filter(function (x) { return x.event_id !== ev.id; });
      push({ t: 'events', a: 'del', m: { id: ev.id } }); renderAll();
    };
    var edit = ei('button', 'edit', 'edit');
    edit.setAttribute('aria-label', 'Edit event');
    edit.onclick = function () { startEventEdit(ev); };
    top.appendChild(info); top.appendChild(edit); top.appendChild(del);
    li.appendChild(top);
    var me = mapEmbed(ev.venue_address);
    if (me) li.appendChild(me);
    var mb = mapsBtn(ev.venue_map_url, ev.venue_address);
    if (mb) { var acts = el('div', 'acts'); acts.appendChild(mb); li.appendChild(acts); }
    li.appendChild(bringList({ event_id: ev.id }));
    li.appendChild(assignments(ev));
    return li;
  }
  function renderEvents() {
    var ul = $('event-list'); ul.innerHTML = '';
    var list = state.events.slice().sort(function (a, b) { return sortKey(a) < sortKey(b) ? -1 : 1; });
    if (!list.length) ul.appendChild(el('li', 'muted empty', 'No events yet.'));
    list.forEach(function (ev) { ul.appendChild(eventCard(ev)); });
  }

  // ---------- chat admins ----------
  function isAdmin(name) {
    var k = (name || '').toLowerCase();
    return !!k && state.admins.some(function (n) { return n.toLowerCase() === k; });
  }
  function iAmAdmin() { return isAdmin(myName()); }
  // With no admins yet nobody can enforce anything, so polls stay deletable by everyone until the first claim.
  function canDeletePoll() { return !state.admins.length || iAmAdmin(); }

  // ---------- polls ----------
  function pollOptsOf(pid) {
    return state.pollOpts.filter(function (o) { return o.poll_id === pid; })
      .sort(function (x, y) { return (x.position || 0) - (y.position || 0); });
  }
  function vote(poll, opt) {
    var name = myName() || askName('Your name (used for votes and chat)');
    if (!name) return;
    var mine = state.pollVotes.filter(function (v) { return v.poll_id === poll.id && v.voter === name; })[0];
    if (mine && mine.option_id === opt.id) return;
    var row = { id: mine ? mine.id : uid(), poll_id: poll.id, option_id: opt.id, voter: name, created_at: nowIso() };
    state.pollVotes = state.pollVotes.filter(function (v) { return !(v.poll_id === poll.id && v.voter === name); });
    state.pollVotes.push(row);
    push({ t: 'poll_votes', a: 'up', c: 'poll_id,voter', r: row });
    renderPolls();
  }
  function pollCard(poll) {
    var li = el('li', 'card-item poll');
    var top = el('div', 'top');
    top.appendChild(el('strong', null, poll.question));
    var del = el('button', 'link danger', 'Delete');
    del.type = 'button';
    del.onclick = function () {
      if (!confirm('Delete this poll and all its votes?')) return;
      state.polls = state.polls.filter(function (p) { return p.id !== poll.id; });
      state.pollOpts = state.pollOpts.filter(function (o) { return o.poll_id !== poll.id; });
      state.pollVotes = state.pollVotes.filter(function (v) { return v.poll_id !== poll.id; });
      push({ t: 'polls', a: 'del', m: { id: poll.id } }); renderPolls();
    };
    if (canDeletePoll()) top.appendChild(del);
    li.appendChild(top);
    var votes = state.pollVotes.filter(function (v) { return v.poll_id === poll.id; });
    var me = myName();
    var myVote = votes.filter(function (v) { return v.voter === me; })[0];
    pollOptsOf(poll.id).forEach(function (o) {
      var vs = votes.filter(function (v) { return v.option_id === o.id; });
      var pct = votes.length ? Math.round(vs.length * 100 / votes.length) : 0;
      var b = el('button', 'poll-opt' + (myVote && myVote.option_id === o.id ? ' mine' : ''));
      b.type = 'button';
      var bar = el('i', 'bar'); bar.style.width = pct + '%';
      b.appendChild(bar);
      b.appendChild(el('span', 'ot', o.text));
      b.appendChild(el('span', 'oc', vs.length + ' · ' + pct + '%'));
      b.onclick = function () { vote(poll, o); };
      li.appendChild(b);
      if (vs.length) li.appendChild(el('small', 'voters', vs.map(function (v) { return v.voter; }).join(', ')));
    });
    li.appendChild(el('small', 'muted', votes.length + (votes.length === 1 ? ' vote' : ' votes') + ' · tap an option to vote or change your vote'));
    return li;
  }
  function renderPolls() {
    var ul = $('poll-list'); ul.innerHTML = '';
    var list = state.polls.slice().sort(function (a, b) { return -byCreated(a, b); });
    if (!list.length) ul.appendChild(el('li', 'muted empty', 'No polls yet.'));
    list.forEach(function (p) { ul.appendChild(pollCard(p)); });
  }
  function pollFields() { return Array.prototype.slice.call($('poll-opts').querySelectorAll('input')); }
  function addPollField(val) {
    var row = el('div', 'poll-field');
    var inp = el('input'); inp.type = 'text'; inp.placeholder = 'Option'; inp.value = val || '';
    var x = ei('button', 'link danger', 'x'); x.type = 'button'; x.setAttribute('aria-label', 'Remove option');
    x.onclick = function () { if (pollFields().length > 2) { row.remove(); } };
    row.appendChild(inp); row.appendChild(x);
    $('poll-opts').appendChild(row);
  }
  function resetPollForm() {
    $('poll-q').value = ''; $('poll-opts').innerHTML = ''; addPollField(); addPollField();
  }
  $('poll-add-opt').onclick = function () { addPollField(); };
  $('poll-form').onsubmit = function (e) {
    e.preventDefault();
    var q = $('poll-q').value.trim();
    var texts = pollFields().map(function (i) { return i.value.trim(); }).filter(Boolean);
    if (!q) return;
    if (texts.length < 2) { alert('A poll needs at least 2 options.'); return; }
    var poll = { id: uid(), question: q, created_at: nowIso() };
    state.polls.push(poll);
    push({ t: 'polls', a: 'up', r: poll });
    texts.forEach(function (t, i) {
      var o = { id: uid(), poll_id: poll.id, text: t, position: i };
      state.pollOpts.push(o);
      push({ t: 'poll_options', a: 'up', r: o });
    });
    resetPollForm(); $('poll-fold').open = false; renderPolls();
  };
  resetPollForm();

  // ---------- chat ----------
  var unread = 0, chatBound = false;
  function chatActive() { return curTab === 'chat'; }
  function fmtTime(iso) {
    var d = new Date(iso);
    return isNaN(d) ? '' : d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }
  function fmtDay(iso) {
    var d = new Date(iso), t = new Date();
    if (isNaN(d)) return '';
    if (d.toDateString() === t.toDateString()) return 'Today';
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  }
  // ---------- WhatsApp-style helpers ----------
  var WA_COLORS = ['#ff7eb6', '#53bdeb', '#ffa84c', '#b388ff', '#25d3b0', '#f06f62', '#8fd14f', '#e8c34a', '#ff8f6b', '#5fc9f8', '#d98cf0', '#7ed6a5'];
  function nameColor(n) {
    var h = 0; n = (n || '').toLowerCase();
    for (var i = 0; i < n.length; i++) h = (h * 31 + n.charCodeAt(i)) >>> 0;
    return WA_COLORS[h % WA_COLORS.length];
  }
  function avatarFor(n) {
    var a = el('span', 'av', (n || '?').trim().charAt(0).toUpperCase());
    a.style.background = nameColor(n); return a;
  }
  // replies ride inside the body (no schema change): "[re]<id>|<sender>|<snippet>\n<text>"
  function parseReply(body) {
    var m = /^\[re\]([^|\n]*)\|([^|\n]*)\|([^\n]*)\n([\s\S]*)$/.exec(body || '');
    return m ? { id: decodeURIComponent(m[1]), who: decodeURIComponent(m[2]), snip: decodeURIComponent(m[3]), text: m[4] } : null;
  }
  function plainBody(body) { var r = parseReply(body); return r ? r.text : body; }
  function snippetOf(body) {
    var md = parseMedia(body); if (md) return md.type === 'img' ? 'Photo' : 'Voice message';
    return plainBody(body).replace(/\s+/g, ' ').slice(0, 80);
  }
  var replyTo = null;
  function setReply(m) {
    replyTo = m;
    var bar = $('reply-bar'); bar.hidden = !m;
    if (m) {
      var c = nameColor(m.sender);
      bar.style.setProperty('--qc', c);
      $('reply-who').textContent = m.sender === myName() ? 'You' : m.sender; $('reply-who').style.color = c;
      $('reply-text').textContent = snippetOf(m.body);
      $('chat-input').focus();
    }
  }
  $('reply-x').onclick = function () { setReply(null); };
  function memberPreview() {
    var me = (myName() || '').toLowerCase();
    var n = memberNames().map(function (x) { return x.split(/\s+/)[0]; });
    return n.join(', ');
  }
  function renderChatHead() {
    $('chat-title').textContent = teamName();
    $('chat-sub').textContent = memberPreview();
    var av = $('chat-avatar'), u = teamPic();
    av.textContent = '';
    if (u) { var im = el('img'); im.alt = ''; im.onerror = function () { av.textContent = ''; setIc(av, 'ball'); }; im.src = u; av.appendChild(im); }
    else setIc(av, 'ball');
  }
  function actionSheet(m) {
    var ov = el('div', 'tm-overlay'), box = el('div', 'tm-box wa-sheet');
    var r = ei('button', 'tm-btn', 'reply', 'Reply'); r.type = 'button';
    r.onclick = function () { ov.remove(); setReply(m); };
    box.appendChild(r);
    if (!parseMedia(m.body)) {
      var cp = el('button', 'tm-btn', 'Copy'); cp.type = 'button';
      cp.onclick = function () { ov.remove(); try { navigator.clipboard.writeText(plainBody(m.body)); } catch (e) {} };
      box.appendChild(cp);
    }
    if (myName() && (m.sender === myName() || iAmAdmin())) {
      var d = ei('button', 'tm-btn danger', 'trash', 'Delete'); d.type = 'button';
      d.onclick = function () { ov.remove(); deleteChat(m); };
      box.appendChild(d);
    }
    var c = el('button', 'tm-btn tm-cancel', 'Cancel'); c.type = 'button'; c.onclick = function () { ov.remove(); };
    box.appendChild(c); ov.appendChild(box);
    ov.addEventListener('click', function (e) { if (e.target === ov) ov.remove(); });
    document.body.appendChild(ov);
  }
  // long-press / right-click = action sheet; swipe right = reply
  function bindGestures(row, bub, m) {
    var sx = 0, sy = 0, dx = 0, tm = null, mode = '', fired = false;
    function clear() { clearTimeout(tm); }
    row.addEventListener('touchstart', function (e) {
      var t = e.touches[0]; sx = t.clientX; sy = t.clientY; dx = 0; mode = ''; fired = false;
      clear(); tm = setTimeout(function () { fired = true; mode = 'x'; if (navigator.vibrate) try { navigator.vibrate(15); } catch (_) {} actionSheet(m); }, 480);
    }, { passive: true });
    row.addEventListener('touchmove', function (e) {
      if (sx == null) return;
      var t = e.touches[0], mx = t.clientX - sx, my = t.clientY - sy;
      if (!mode) {
        if (Math.abs(my) > 10) { mode = 'x'; clear(); return; }
        if (Math.abs(mx) > 10) { mode = 'swipe'; clear(); }
      }
      if (mode === 'swipe') { dx = clamp(mx, 0, 90); bub.style.transition = 'none'; bub.style.transform = 'translateX(' + dx + 'px)'; row.classList.toggle('armed', dx > 60); }
    }, { passive: true });
    function end() {
      clear(); bub.style.transition = ''; bub.style.transform = ''; row.classList.remove('armed');
      if (mode === 'swipe' && dx > 60) setReply(m);
      mode = ''; dx = 0;
    }
    row.addEventListener('touchend', end); row.addEventListener('touchcancel', end);
    row.addEventListener('contextmenu', function (e) { e.preventDefault(); if (!fired) actionSheet(m); });
  }
  function jumpTo(id) {
    var t = $('chat-msgs').querySelector('[data-id="' + id + '"]');
    if (!t) return;
    t.scrollIntoView({ block: 'center', behavior: 'smooth' });
    t.classList.add('flash'); setTimeout(function () { t.classList.remove('flash'); }, 1200);
  }
  function renderChat(forceBottom) {
    var box = $('chat-msgs');
    renderChatHead();
    var nearBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 80;
    box.innerHTML = '';
    var me = myName(), lastDay = '', lastSender = '';
    if (!state.chat.length) box.appendChild(el('div', 'chat-empty', 'No messages yet. Say hi!'));
    state.chat.forEach(function (m) {
      var day = fmtDay(m.created_at);
      if (day !== lastDay) { box.appendChild(el('div', 'day', day)); lastDay = day; lastSender = ''; }
      var mine = !!me && m.sender === me, first = lastSender !== m.sender;
      var row = el('div', 'row ' + (mine ? 'mine' : 'theirs') + (first ? ' first' : ''));
      row.dataset.id = m.id;
      if (!mine) { if (first) row.appendChild(avatarFor(m.sender)); else row.appendChild(el('span', 'av-sp')); }
      var b = el('div', 'bubble ' + (mine ? 'mine' : 'theirs') + (first ? ' tail' : ''));
      var media = parseMedia(m.body), rp = media ? null : parseReply(m.body);
      if (!mine && first) b.appendChild((function () { var w = el('div', 'who', m.sender); w.style.color = nameColor(m.sender); if (isAdmin(m.sender)) w.insertAdjacentHTML('beforeend', svg('star')); return w; })());
      if (rp) {
        var q = el('div', 'quote'); q.style.setProperty('--qc', nameColor(rp.who));
        var qw = el('b', '', rp.who === me ? 'You' : rp.who); qw.style.color = nameColor(rp.who);
        q.appendChild(qw); q.appendChild(el('span', '', rp.snip));
        q.onclick = function (e) { e.stopPropagation(); jumpTo(rp.id); };
        b.appendChild(q);
      }
      var time = el('span', 'time', fmtTime(m.created_at));
      if (mine) time.insertAdjacentHTML('beforeend', svg('dcheck'));
      if (media && media.type === 'img') {
        b.classList.add('has-img');
        var im = el('img', 'img'); im.alt = 'Photo'; im.loading = 'lazy';
        loadInto(media.key, im);
        im.onclick = function (e) { e.stopPropagation(); openViewer(media.key, '', null); };
        b.appendChild(im);
        time.classList.add('over');
      } else if (media) { b.classList.add('has-voice'); b.appendChild(voiceBubble(media, m.sender, time)); time = null; }
      else b.appendChild(el('span', 'body', rp ? rp.text : m.body));
      if (time) b.appendChild(time);
      bindGestures(row, b, m);
      row.appendChild(b);
      box.appendChild(row);
      lastSender = m.sender;
    });
    if (forceBottom || nearBottom) box.scrollTop = box.scrollHeight;
    var dot = $('chat-dot');
    dot.textContent = unread; dot.style.display = unread ? '' : 'none';
  }
  function removeChat(id) {
    var n = state.chat.length;
    state.chat = state.chat.filter(function (x) { return x.id !== id; });
    if (state.chat.length !== n) { save(); renderChat(); }
  }
  function deleteChat(m) {
    if (!myName() || (m.sender !== myName() && !iAmAdmin())) return;
    if (!confirm('Delete ' + (m.sender === myName() ? 'this message' : m.sender + "'s message") + '?\n\n' + (parseMedia(m.body) ? '(media)' : plainBody(m.body).slice(0, 120)))) return;
    removeChat(m.id);
    push({ t: 'chat_messages', a: 'del', m: { id: m.id } });
  }
  function addChat(m, incoming) {
    if (state.chat.some(function (x) { return x.id === m.id; })) return;
    state.chat.push(m); state.chat.sort(byCreated);
    if (state.chat.length > 300) state.chat = state.chat.slice(-300);
    save();
    var mine = m.sender === myName();
    if (incoming && !mine) {
      if (!chatActive() || document.hidden) unread++;
      notify(m);
    }
    renderChat(true);
  }
  function notify(m) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    if (!document.hidden && document.hasFocus()) return;
    var pm = parseMedia(m.body), opts = { body: pm ? (pm.type === 'img' ? 'Photo' : 'Voice message') : plainBody(m.body), tag: 'rf-chat', icon: 'icon-192.png' };
    try {
      if (navigator.serviceWorker && navigator.serviceWorker.ready) {
        navigator.serviceWorker.ready.then(function (r) { r.showNotification(m.sender, opts); }).catch(function () { new Notification(m.sender, opts); });
      } else new Notification(m.sender, opts);
    } catch (e) {}
  }
  function openChat() {
    if (!myName()) askName('Your name for chat');
    if ('Notification' in window && Notification.permission === 'default' && !localStorage.getItem(NOTIF_KEY)) {
      localStorage.setItem(NOTIF_KEY, '1');
      try { Notification.requestPermission(); } catch (e) {}
    }
    unread = 0;
    renderChat(true);
  }
  $('chat-form').onsubmit = function (e) {
    e.preventDefault();
    var inp = $('chat-input'), body = inp.value.trim();
    if (!body) return;
    var name = myName() || askName('Your name for chat');
    if (!name) return;
    inp.value = ''; syncSendBtn();
    if (replyTo) body = '[re]' + encodeURIComponent(replyTo.id) + '|' + encodeURIComponent(replyTo.sender) + '|' + encodeURIComponent(snippetOf(replyTo.body)) + '\n' + body;
    setReply(null);
    var m = { id: uid(), sender: name, body: body, created_at: nowIso() };
    addChat(m, false);
    push({ t: 'chat_messages', a: 'up', r: m });
    inp.focus();
  };
  function sendMedia(body) {
    var name = myName() || askName('Your name for chat');
    if (!name) return;
    var m = { id: uid(), sender: name, body: body, created_at: nowIso() };
    addChat(m, false);
    push({ t: 'chat_messages', a: 'up', r: m });
  }
  // ---------- Backblaze B2 media (S3 API, SigV4 presigned URLs) ----------
  var B2 = { host: 's3.us-east-005.backblazeb2.com', region: 'us-east-005', bucket: 'team-photos',
    id: '00507055f19acd20000000001', secret: 'K005aiJ1bb4wq3zXvlLgP7aCaJHFsMo' };
  var enc = new TextEncoder();
  function hex(buf) { return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join(''); }
  async function hmac(key, str) {
    var k = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    return crypto.subtle.sign('HMAC', k, enc.encode(str));
  }
  function rfc3986(s) { return encodeURIComponent(s).replace(/[!'()*]/g, function (c) { return '%' + c.charCodeAt(0).toString(16).toUpperCase(); }); }
  async function presign(method, key, expires) {
    var now = new Date(), amz = now.toISOString().replace(/[-:]|\.\d{3}/g, ''), day = amz.slice(0, 8);
    var scope = day + '/' + B2.region + '/s3/aws4_request';
    var path = '/' + B2.bucket + '/' + key.split('/').map(rfc3986).join('/');
    var q = { 'X-Amz-Algorithm': 'AWS4-HMAC-SHA256', 'X-Amz-Credential': B2.id + '/' + scope, 'X-Amz-Date': amz,
      'X-Amz-Expires': String(expires), 'X-Amz-SignedHeaders': 'host' };
    var qs = Object.keys(q).sort().map(function (k) { return rfc3986(k) + '=' + rfc3986(q[k]); }).join('&');
    var canon = [method, path, qs, 'host:' + B2.host + '\n', 'host', 'UNSIGNED-PAYLOAD'].join('\n');
    var hash = hex(await crypto.subtle.digest('SHA-256', enc.encode(canon)));
    var sts = ['AWS4-HMAC-SHA256', amz, scope, hash].join('\n');
    var k = await hmac(enc.encode('AWS4' + B2.secret), day);
    k = await hmac(k, B2.region); k = await hmac(k, 's3'); k = await hmac(k, 'aws4_request');
    var sig = hex(await hmac(k, sts));
    return 'https://' + B2.host + path + '?' + qs + '&X-Amz-Signature=' + sig;
  }
  var urlCache = {};
  async function getUrl(key) {
    var c = urlCache[key];
    if (c && c.exp > Date.now()) return c.url;
    var url = await presign('GET', key, 86400);
    urlCache[key] = { url: url, exp: Date.now() + 12 * 3600 * 1000 };
    return url;
  }
  // ---------- Local-first media (IndexedDB media_store, keyed by B2 object key) ----------
  var mdb = null;
  function mediaDb() {
    if (mdb) return mdb;
    mdb = new Promise(function (resolve, reject) {
      if (!window.indexedDB) { reject(new Error('no indexedDB')); return; }
      var rq = indexedDB.open('rf-media', 1);
      rq.onupgradeneeded = function () { rq.result.createObjectStore('media_store'); };
      rq.onsuccess = function () { resolve(rq.result); };
      rq.onerror = function () { reject(rq.error); };
    });
    mdb.catch(function () { mdb = null; });
    return mdb;
  }
  function mediaTx(mode, fn) {
    return mediaDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction('media_store', mode), out = fn(tx.objectStore('media_store'));
        tx.oncomplete = function () { resolve(out && out.result); };
        tx.onerror = tx.onabort = function () { reject(tx.error); };
      });
    });
  }
  function mediaGet(key) { return mediaTx('readonly', function (st) { return st.get(key); }); }
  function mediaPut(key, blob) { return mediaTx('readwrite', function (st) { return st.put(blob, key); }); }
  function mediaUsage() {
    return mediaDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var n = 0, bytes = 0, rq = db.transaction('media_store', 'readonly').objectStore('media_store').openCursor();
        rq.onsuccess = function () {
          var c = rq.result;
          if (c) { n++; bytes += (c.value && c.value.size) || 0; c.continue(); } else resolve({ n: n, bytes: bytes });
        };
        rq.onerror = function () { reject(rq.error); };
      });
    });
  }
  function mediaClear() {
    objUrls = {}; inflight = {};
    return mediaTx('readwrite', function (st) { return st.clear(); });
  }
  var objUrls = {}, inflight = {};
  // Local blob URL for a key: IndexedDB first; otherwise download once from B2, store, then serve locally.
  function mediaUrl(key) {
    if (objUrls[key]) return Promise.resolve(objUrls[key]);
    if (inflight[key]) return inflight[key];
    var p = mediaGet(key).catch(function () { return null; }).then(function (blob) {
      if (blob) return blob;
      return getUrl(key).then(function (u) { return fetch(u); }).then(function (r) {
        if (!r.ok) throw new Error('download failed (' + r.status + ')');
        return r.blob();
      }).then(function (b) { mediaPut(key, b).catch(function () {}); return b; });
    }).then(function (blob) {
      return (objUrls[key] = URL.createObjectURL(blob));
    }).catch(function () { return getUrl(key); }) // offline-cache/CORS failure: stream remotely as before
      .then(function (u) { delete inflight[key]; return u; }, function (e) { delete inflight[key]; throw e; });
    inflight[key] = p;
    return p;
  }
  function fmtBytes(b) { return b < 1048576 ? Math.round(b / 1024) + ' KB' : (b / 1048576).toFixed(1) + ' MB'; }
  function loadInto(key, node) {
    mediaUrl(key).then(function (u) {
      if (node.tagName === 'IMG' || node.tagName === 'AUDIO') node.src = u; else node.style.backgroundImage = 'url("' + u + '")';
    }).catch(function () {});
  }
  async function b2Put(key, blob, type) {
    var url = await presign('PUT', key, 600);
    var r = await fetch(url, { method: 'PUT', body: blob, headers: { 'Content-Type': type } });
    if (!r.ok) throw new Error('upload failed (' + r.status + ')');
  }
  function rnd() { return Math.random().toString(36).slice(2, 8); }
  function compress(file, max, q) {
    return new Promise(function (resolve, reject) {
      var img = new Image(), u = URL.createObjectURL(file);
      img.onload = function () {
        var s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
        var cv = document.createElement('canvas');
        cv.width = Math.round(img.naturalWidth * s); cv.height = Math.round(img.naturalHeight * s);
        var cx = cv.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0, 0, cv.width, cv.height);
        cx.drawImage(img, 0, 0, cv.width, cv.height);
        URL.revokeObjectURL(u);
        cv.toBlob(function (b) { b ? resolve(b) : reject(new Error('compress failed')); }, 'image/jpeg', q);
      };
      img.onerror = function () { URL.revokeObjectURL(u); reject(new Error('not an image')); };
      img.src = u;
    });
  }
  // message bodies: "[img]key" and "[voice]key|seconds"
  function parseMedia(body) {
    var m = /^\[(img|voice)\]([^|\s]+)(?:\|(\d+))?$/.exec(body || '');
    return m ? { type: m[1], key: m[2], dur: +m[3] || 0 } : null;
  }
  function fmtDur(s) { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }

  // viewer
  var viewerPhoto = null;
  function openViewer(key, caption, photo) {
    viewerPhoto = photo;
    $('viewer-img').removeAttribute('src'); loadInto(key, $('viewer-img'));
    $('viewer-cap').textContent = caption || '';
    $('viewer-del').hidden = !(photo && myName() && (photo.uploader === myName() || iAmAdmin()));
    $('viewer').hidden = false;
  }
  $('viewer-close').onclick = function () { $('viewer').hidden = true; };
  $('viewer').onclick = function (e) { if (e.target === $('viewer')) $('viewer').hidden = true; };
  $('viewer-del').onclick = function () {
    var ph = viewerPhoto; if (!ph || !confirm('Delete this photo?')) return;
    state.photos = state.photos.filter(function (x) { return x.id !== ph.id; });
    save(); push({ t: 'photos', a: 'del', m: { id: ph.id } });
    $('viewer').hidden = true; renderAlbum();
  };

  // ---------- albums (event-based) ----------
  var UNSORTED = '__unsorted', curAlbum = null, pendingUpload = null;
  function todayIso() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function shortDate(iso) {
    var d = new Date((iso || '') + 'T00:00'); if (isNaN(d)) return iso || '';
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
  function photoSort(a, b) { return (a.created_at || '') < (b.created_at || '') ? 1 : -1; } // newest first
  function albumPhotos(id) {
    var ids = {}; state.albums.forEach(function (a) { ids[a.id] = 1; });
    return state.photos.filter(function (p) { return id === UNSORTED ? !(p.album_id && ids[p.album_id]) : p.album_id === id; }).sort(photoSort);
  }
  function albumList() {
    var l = state.albums.slice().sort(function (a, b) {
      var ka = (a.event_date || (a.created_at || '').slice(0, 10)) + (a.created_at || ''), kb = (b.event_date || (b.created_at || '').slice(0, 10)) + (b.created_at || '');
      return ka < kb ? 1 : -1;
    }).map(function (a) { return { id: a.id, name: a.name, photos: albumPhotos(a.id), real: true }; });
    var un = albumPhotos(UNSORTED);
    if (un.length) l.push({ id: UNSORTED, name: 'Unsorted', photos: un, real: false });
    return l;
  }
  function albumById(id) { return albumList().filter(function (a) { return a.id === id; })[0]; }
  function countLabel(n) { return n + ' photo' + (n === 1 ? '' : 's'); }
  function deleteAlbum(a) {
    var n = a.photos.length;
    if (!confirm('Delete "' + a.name + '"' + (n ? ' and its ' + countLabel(n) : '') + '?')) return;
    if (n) {
      var gone = {}; a.photos.forEach(function (p) { gone[p.id] = 1; });
      state.photos = state.photos.filter(function (p) { return !gone[p.id]; });
      push({ t: 'photos', a: 'del', m: { id: Object.keys(gone) } });
    }
    state.albums = state.albums.filter(function (x) { return x.id !== a.id; });
    push({ t: 'albums', a: 'del', m: { id: a.id } });
    if (curAlbum === a.id) curAlbum = null;
    renderAlbum();
  }
  function renderAlbum() {
    var g = $('album-grid'); if (!g) return;
    var cur = curAlbum && albumById(curAlbum);
    if (curAlbum && !cur) curAlbum = null;
    $('album-list-head').hidden = !!cur; $('album-detail-head').hidden = !cur;
    g.innerHTML = ''; g.className = cur ? 'album-grid' : 'album-cards';
    if (cur) {
      $('album-title').textContent = cur.name; $('album-count').textContent = countLabel(cur.photos.length);
      if (!cur.photos.length) g.appendChild(el('p', 'muted', 'No photos in this album yet. Tap + to add some.'));
      cur.photos.forEach(function (ph) {
        var b = el('button', 'ph'); b.type = 'button'; b.setAttribute('aria-label', 'Photo by ' + ph.uploader);
        loadInto(ph.thumb_url || ph.url, b);
        b.onclick = function () { openViewer(ph.url, ph.uploader + (ph.caption ? ' · ' + ph.caption : ''), ph); };
        g.appendChild(b);
      });
      return;
    }
    var list = albumList();
    if (!list.length) { g.appendChild(el('p', 'muted ab-empty', 'No albums yet. Tap + to create one.')); return; }
    list.forEach(function (a) {
      var card = el('div', 'ab-card'); card.tabIndex = 0; card.setAttribute('role', 'button'); card.setAttribute('aria-label', a.name + ', ' + countLabel(a.photos.length));
      var stack = el('div', 'ab-stack');
      var shown = a.photos.slice(0, 3);
      if (!shown.length) { var em = ei('div', 'ab-ph ab-ph0 ab-blank', 'camera'); stack.appendChild(em); }
      for (var i = shown.length - 1; i >= 0; i--) {
        var t = el('div', 'ab-ph ab-ph' + i); loadInto(shown[i].thumb_url || shown[i].url, t); stack.appendChild(t);
      }
      if (a.real) {
        var d = ei('button', 'ab-del', 'trash'); d.type = 'button'; d.setAttribute('aria-label', 'Delete album ' + a.name);
        d.onclick = function (e) { e.stopPropagation(); deleteAlbum(a); };
        stack.appendChild(d);
      }
      card.appendChild(stack);
      card.appendChild(el('div', 'ab-name', a.name));
      card.appendChild(el('div', 'ab-n', countLabel(a.photos.length)));
      function open() { curAlbum = a.id; renderAlbum(); window.scrollTo(0, 0); }
      card.onclick = open;
      card.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } };
      g.appendChild(card);
    });
  }
  $('album-back').onclick = function () { curAlbum = null; renderAlbum(); };

  // sheet: create album / add photos to an album
  function openAlbumSheet() {
    if (!myName() && !askName('Your name')) return;
    var old = $('albumSheet'); if (old) old.remove();
    var ov = el('div', 'tm-overlay'); ov.id = 'albumSheet';
    var box = el('div', 'tm-box ab-sheet');
    box.appendChild(el('h3', null, 'Photos'));
    var lbl1 = el('label', null, 'Album'), sel = el('select');
    sel.appendChild(new Option('New album', 'new'));
    albumList().forEach(function (a) { sel.appendChild(new Option(a.name + ' (' + a.photos.length + ')', a.id)); });
    if (!albumById(UNSORTED)) sel.appendChild(new Option('Unsorted', UNSORTED));
    sel.value = curAlbum && albumById(curAlbum) ? curAlbum : 'new';
    var nw = el('div', 'ab-new');
    var lbl2 = el('label', null, 'Pick a game or event'), gsel = el('select');
    gsel.appendChild(new Option('None (custom album)', ''));
    var gg = el('optgroup'); gg.label = 'Games';
    state.practices.slice().sort(bySort).reverse().forEach(function (p) { gg.appendChild(new Option((p.location || 'Game') + ' · ' + shortDate(p.date), 'p:' + p.id)); });
    var eg = el('optgroup'); eg.label = 'Events';
    state.events.slice().sort(bySort).reverse().forEach(function (v) { eg.appendChild(new Option(v.title + (v.date ? ' · ' + shortDate(v.date) : ''), 'e:' + v.id)); });
    if (gg.children.length) gsel.appendChild(gg);
    if (eg.children.length) gsel.appendChild(eg);
    var lbl3 = el('label', null, 'Album name'), nm = el('input'); nm.type = 'text'; nm.maxLength = 60; nm.value = shortDate(todayIso()); nm.placeholder = 'e.g. Vs FC Fusion Aug 16';
    var lbl4 = el('label', null, 'Date (optional)'), dt = el('input'); dt.type = 'date'; dt.value = todayIso();
    var gameId = null;
    gsel.onchange = function () {
      var v = gsel.value; gameId = null;
      if (!v) return;
      var rec = v[0] === 'p' ? state.practices.filter(function (x) { return x.id === v.slice(2); })[0] : state.events.filter(function (x) { return x.id === v.slice(2); })[0];
      if (!rec) return;
      if (v[0] === 'p') gameId = rec.id;
      dt.value = rec.date || todayIso();
      nm.value = (v[0] === 'p' ? (rec.location || 'Game') : rec.title) + ' ' + shortDate(dt.value);
    };
    [lbl2, gsel, lbl3, nm, lbl4, dt].forEach(function (n) { nw.appendChild(n); });
    var go = ei('button', 'tm-btn ab-go', 'camera', 'Choose photos'), empty = el('button', 'tm-btn', 'Create empty album'), cancel = el('button', 'tm-btn tm-cancel', 'Cancel');
    go.type = empty.type = cancel.type = 'button';
    function sync() { nw.hidden = empty.hidden = sel.value !== 'new'; }
    sel.onchange = sync; sync();
    function buildNew() {
      var d = dt.value || null;
      return { id: uid(), name: nm.value.trim() || (d ? shortDate(d) : shortDate(todayIso())), event_date: d, game_id: gameId, created_at: nowIso() };
    }
    go.onclick = function () {
      pendingUpload = sel.value === 'new' ? { album: buildNew() } : { albumId: sel.value };
      ov.remove(); $('album-file').click();
    };
    empty.onclick = function () {
      var a = buildNew(); state.albums.push(a); save(); push({ t: 'albums', a: 'up', r: a });
      curAlbum = a.id; ov.remove(); renderAlbum();
    };
    cancel.onclick = function () { ov.remove(); };
    ov.addEventListener('click', function (e) { if (e.target === ov) ov.remove(); });
    [lbl1, sel, nw, go, empty, cancel].forEach(function (n) { box.appendChild(n); });
    ov.appendChild(box); document.body.appendChild(ov);
  }
  $('album-add').onclick = openAlbumSheet;
  $('album-add2').onclick = openAlbumSheet;
  $('album-file').onchange = async function () {
    var files = Array.prototype.slice.call(this.files || []); this.value = '';
    var tgt = pendingUpload; pendingUpload = null;
    if (!files.length || !tgt) return;
    var st = $('album-status'), name = myName(), ok = 0, aid = tgt.albumId === UNSORTED ? null : (tgt.albumId || null);
    if (tgt.album) { state.albums.push(tgt.album); save(); push({ t: 'albums', a: 'up', r: tgt.album }); aid = tgt.album.id; }
    curAlbum = aid || UNSORTED; renderAlbum();
    for (var i = 0; i < files.length; i++) {
      st.textContent = 'Uploading ' + (i + 1) + ' of ' + files.length + '…';
      try {
        var blob = await compress(files[i], 1600, 0.85), key = 'album/' + Date.now() + '-' + rnd() + '.jpg';
        await mediaPut(key, blob).catch(function () {});
        await b2Put(key, blob, 'image/jpeg');
        var ph = { id: uid(), url: key, thumb_url: key, uploader: name, caption: '', album_id: aid, created_at: nowIso() };
        state.photos.push(ph); save(); push({ t: 'photos', a: 'up', r: ph }); ok++;
        renderAlbum();
      } catch (e) { st.textContent = 'Upload failed: ' + (e && e.message ? e.message : e); return; }
    }
    st.textContent = ok ? 'Added ' + countLabel(ok) + '.' : '';
  };

  // chat picture
  function pickPhoto(inp) { return function () { if (!myName() && !askName('Your name for chat')) return; inp.click(); }; }
  $('chat-attach').onclick = pickPhoto($('chat-file'));
  $('chat-photo').onclick = pickPhoto($('chat-cam'));
  async function sendPhotoFile() {
    var f = this.files && this.files[0]; this.value = ''; if (!f) return;
    var btn = $('chat-photo'); btn.disabled = true; setIc(btn, 'clock');
    try {
      var blob = await compress(f, 1280, 0.8), key = 'chat/' + Date.now() + '-' + rnd() + '.jpg';
      await mediaPut(key, blob).catch(function () {});
      await b2Put(key, blob, 'image/jpeg');
      sendMedia('[img]' + key);
    } catch (e) { alert('Could not send picture: ' + (e && e.message ? e.message : e)); }
    btn.disabled = false; setIc(btn, 'camera');
  }
  $('chat-file').onchange = sendPhotoFile;
  $('chat-cam').onchange = sendPhotoFile;
  $('chat-emoji').onclick = function () { $('chat-input').focus(); };
  function syncSendBtn() {
    var has = !!$('chat-input').value.trim(), b = $('chat-mic');
    if (rec || b.disabled) return;
    if (b.dataset.mode !== (has ? 'send' : 'mic')) { b.dataset.mode = has ? 'send' : 'mic'; setIc(b, has ? 'send' : 'mic'); b.setAttribute('aria-label', has ? 'Send' : 'Record voice message'); }
  }
  $('chat-input').addEventListener('input', syncSendBtn);

  // voice playback
  var curAudio = null, curBtn = null;
  function waveBars(key, n) {
    var h = 7; for (var i = 0; i < key.length; i++) h = (h * 33 + key.charCodeAt(i)) >>> 0;
    var out = [];
    for (var k = 0; k < n; k++) { h = (h * 1664525 + 1013904223) >>> 0; out.push(0.22 + 0.78 * ((h >>> 8) % 100) / 100); }
    return out;
  }
  function voiceBubble(md, sender, timeEl) {
    var w = el('div', 'voice'), btn = ei('button', 'vplay', 'play'), wave = el('div', 'vwave'), dur = el('span', 'vdur', fmtDur(md.dur));
    var bars = [], N = 36, dot = el('i', 'vdot');
    btn.type = 'button';
    waveBars(md.key, N).forEach(function (v) { var s = el('s'); s.style.height = Math.round(v * 100) + '%'; wave.appendChild(s); bars.push(s); });
    wave.appendChild(dot);
    var mid = el('div', 'vmid'), meta = el('div', 'vmeta');
    meta.appendChild(dur); meta.appendChild(timeEl);
    mid.appendChild(wave); mid.appendChild(meta);
    var av = avatarFor(sender); av.classList.add('vav'); av.insertAdjacentHTML('beforeend', svg('mic'));
    w.appendChild(btn); w.appendChild(mid); w.appendChild(av);
    function paint(p) {
      var n = Math.round(p * N);
      bars.forEach(function (s, i) { s.classList.toggle('on', i < n); });
      dot.style.left = 'calc(' + (p * 100) + '% - ' + (p * 8) + 'px)';
    }
    paint(0);
    var au = null;
    function stop() { setIc(btn, 'play'); }
    function ensure() {
      if (au) return Promise.resolve();
      au = new Audio(); au.preload = 'metadata';
      au.onended = function () { stop(); paint(0); dur.textContent = fmtDur(md.dur); };
      au.onpause = stop;
      au.onplay = function () { setIc(btn, 'pause'); };
      au.ontimeupdate = function () {
        var d = isFinite(au.duration) && au.duration ? au.duration : md.dur;
        if (d) paint(Math.min(1, au.currentTime / d));
        dur.textContent = fmtDur(au.paused && !au.currentTime ? d : au.currentTime);
      };
      return mediaUrl(md.key).then(function (u) { au.src = u; });
    }
    function toggle(e) {
      e.stopPropagation();
      ensure().then(function () {
        if (!au.paused) { au.pause(); return; }
        if (curAudio && curAudio !== au) curAudio.pause();
        curAudio = au;
        return au.play();
      }).catch(function () { stop(); });
    }
    btn.onclick = toggle;
    wave.onclick = function (e) {
      e.stopPropagation();
      ensure().then(function () {
        var d = isFinite(au.duration) && au.duration ? au.duration : md.dur, r = wave.getBoundingClientRect();
        if (d) au.currentTime = d * clamp((e.clientX - r.left) / r.width, 0, 1);
      });
    };
    return w;
  }

  // voice recording
  var rec = null;
  function recStop(send) {
    if (!rec) return;
    var r = rec; rec = null; r.send = send;
    clearInterval(r.timer);
    $('rec-bar').hidden = true; $('chat-mic').classList.remove('on');
    try { r.mr.stop(); } catch (e) {}
    r.stream.getTracks().forEach(function (t) { t.stop(); });
  }
  $('rec-cancel').onclick = function () { recStop(false); };
  $('chat-mic').onclick = async function () {
    if (!rec && $('chat-input').value.trim()) { $('chat-form').requestSubmit ? $('chat-form').requestSubmit() : $('chat-form').dispatchEvent(new Event('submit', { cancelable: true })); return; }
    if (rec) { recStop(true); return; }
    if (!myName() && !askName('Your name for chat')) return;
    if (!navigator.mediaDevices || !window.MediaRecorder) { alert('Voice recording is not supported in this browser.'); return; }
    var stream;
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); }
    catch (e) { alert('Microphone permission is needed to record.'); return; }
    var mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].filter(function (t) { return MediaRecorder.isTypeSupported(t); })[0] || '';
    var mr = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
    var type = (mr.mimeType || mime || 'audio/webm').split(';')[0], ext = /mp4/.test(type) ? 'mp4' : 'webm';
    var r = { mr: mr, stream: stream, chunks: [], start: Date.now(), send: false };
    mr.ondataavailable = function (e) { if (e.data && e.data.size) r.chunks.push(e.data); };
    mr.onstop = async function () {
      if (!r.send || !r.chunks.length) return;
      var secs = (Date.now() - r.start) / 1000;
      if (secs < 0.7) return;
      var btn = $('chat-mic'); btn.disabled = true; setIc(btn, 'clock');
      try {
        var key = 'voice/' + Date.now() + '.' + ext;
        var vblob = new Blob(r.chunks, { type: type });
        await mediaPut(key, vblob).catch(function () {});
        await b2Put(key, vblob, type);
        sendMedia('[voice]' + key + '|' + Math.round(secs));
      } catch (e) { alert('Could not send voice message: ' + (e && e.message ? e.message : e)); }
      btn.disabled = false; btn.dataset.mode = ''; setIc(btn, 'mic'); syncSendBtn();
    };
    rec = r; mr.start();
    $('rec-bar').hidden = false; $('chat-mic').classList.add('on'); $('rec-time').textContent = '0:00';
    r.timer = setInterval(function () {
      var s = (Date.now() - r.start) / 1000; $('rec-time').textContent = fmtDur(s);
      if (s >= 300) recStop(true);
    }, 250);
  };
  function memberNames() {
    var seen = {}, out = [];
    function add(n) {
      n = (n || '').trim(); var k = n.toLowerCase();
      if (n && !seen[k]) { seen[k] = 1; out.push(n); }
    }
    state.admins.forEach(add);
    add(myName());
    state.players.forEach(function (p) { add(p.name); });
    state.chat.forEach(function (m) { add(m.sender); });
    return out.sort(function (x, y) {
      return (isAdmin(y) - isAdmin(x)) || x.toLowerCase().localeCompare(y.toLowerCase());
    });
  }
  function setAdmin(name, on) {
    var k = name.toLowerCase();
    var stored = state.admins.filter(function (n) { return n.toLowerCase() === k; })[0] || name;
    state.admins = state.admins.filter(function (n) { return n.toLowerCase() !== k; });
    if (on) {
      state.admins.push(name);
      push({ t: 'chat_admins', a: 'up', r: { name: name, created_at: nowIso() } });
    } else {
      push({ t: 'chat_admins', a: 'del', m: { name: stored } });
    }
    save(); renderMembers(); renderChat(); renderPolls();
  }
  function renderMembers() {
    var box = $('members-body');
    if (!box || $('members').hidden) return;
    box.innerHTML = '';
    var me = myName(), amAdmin = iAmAdmin();
    if (!state.admins.length) {
      var c = el('div', 'claim');
      c.appendChild(el('p', 'muted', 'This group has no admin yet. The first person to claim becomes admin and can then appoint others.'));
      var cb = ei('button', 'primary', 'star', 'Claim admin');
      cb.type = 'button';
      cb.onclick = function () {
        var n = myName() || askName('Your name for chat');
        if (n && !state.admins.length) setAdmin(n, true);
      };
      c.appendChild(cb); box.appendChild(c);
    } else {
      box.appendChild(el('p', 'muted', amAdmin ? 'You are an admin: you can appoint admins and delete any message or poll.'
        : 'Admins (star) can delete any message or poll and appoint other admins.'));
    }
    var ul = el('ul', 'member-list');
    memberNames().forEach(function (n) {
      var adm = isAdmin(n);
      var li = el('li', 'member' + (adm ? ' is-admin' : ''));
      li.appendChild(el('span', 'mname', n + (me && n.toLowerCase() === me.toLowerCase() ? ' (you)' : '')));
      if (adm) li.appendChild(ei('span', 'admin-badge', 'star', 'Admin'));
      if (amAdmin) {
        var b = el('button', 'link' + (adm ? ' danger' : ''), adm ? 'Remove admin' : 'Make admin');
        b.type = 'button';
        b.onclick = function () {
          if (adm && state.admins.length === 1 && !confirm('This is the last admin. Remove anyway? Then anyone can claim admin again.')) return;
          setAdmin(n, !adm);
        };
        li.appendChild(b);
      }
      ul.appendChild(li);
    });
    box.appendChild(ul);
  }
  function openMembers() { $('members').hidden = !$('members').hidden; renderMembers(); }
  $('members-btn').onclick = function () { $('chat-menu').hidden = true; openMembers(); };
  $('chat-info').onclick = openMembers;
  $('chat-more').onclick = function (e) { e.stopPropagation(); $('chat-menu').hidden = !$('chat-menu').hidden; };
  document.addEventListener('click', function () { $('chat-menu').hidden = true; });
  $('chat-back').onclick = function () { showTab(beforeChat); };
  $('chat-video').onclick = function () { alert('Video calls are not available in this app.'); };
  $('members-close').onclick = function () { $('members').hidden = true; };
  $('chat-name').onclick = function () { $('chat-menu').hidden = true; if (askName('Your name for chat')) renderChat(); };

  // ---------- render ----------
  function renderAll(fromSync) {
    var ae = document.activeElement;
    if (fromSync && ae && /INPUT|TEXTAREA|SELECT/.test(ae.tagName) && !chatActive()) { renderChat(); return; }
    renderPractices(); renderPlayers(); renderAvail(); renderTeams(); renderLineup(); renderEvents(); renderPolls(); renderChat(); renderMembers(); renderAlbum();
  }
  renderTeamName();
  renderTeamPic();
  if ($('teamEdit')) $('teamEdit').addEventListener('click', teamSettings);
  window.addEventListener('online', flush);
  window.addEventListener('offline', function () { setSync('offline'); });
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) { if (chatActive()) { unread = 0; renderChat(); } flush(); }
  });
  setInterval(function () { if (!document.hidden) flush(); }, 30000);

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }
  setSync(sb ? (navigator.onLine ? 'busy' : 'offline') : 'local');
  renderAll();
  markEntering(curTab);
  // pull-to-refresh (touch, only at top of page, not in chat / full-screen field)
  (function () {
    var ptr = $('ptr'), y0 = null, d = 0, busy = false;
    function reset() { ptr.style.transform = ''; ptr.classList.remove('pulling', 'ready'); }
    document.addEventListener('touchstart', function (e) {
      var inField = e.target.closest && e.target.closest('#field');
      y0 = (window.scrollY <= 0 && !busy && curTab !== 'chat' && !inField && !document.body.classList.contains('lu-full') && e.touches.length === 1) ? e.touches[0].clientY : null; d = 0;
    }, { passive: true });
    document.addEventListener('touchmove', function (e) {
      if (y0 == null) return;
      d = e.touches[0].clientY - y0;
      if (d <= 0) { reset(); return; }
      var s = Math.min(d * 0.5, 70);
      ptr.classList.add('pulling'); ptr.classList.toggle('ready', s >= 56);
      ptr.style.transform = 'translate(-50%,' + s + 'px) rotate(' + (s * 4) + 'deg)';
    }, { passive: true });
    document.addEventListener('touchend', function () {
      if (y0 == null) return;
      var go = d * 0.5 >= 56; y0 = null;
      if (!go) { reset(); return; }
      busy = true; ptr.classList.add('spin'); ptr.style.transform = 'translate(-50%,56px)';
      Promise.resolve(sb && navigator.onLine ? flush() : null).catch(function () {}).then(function () {
        setTimeout(function () { busy = false; ptr.classList.remove('spin'); reset(); }, 450);
      });
    }, { passive: true });
  })();
  subscribe();
  flush();
})();
