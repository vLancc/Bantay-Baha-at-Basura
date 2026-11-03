/* Bantay Baha at Basura - MDRRM Officer pages
   Renders each MDRRM page into #mdrrm-content. Needs app.js and mdrrm-shell.js. */
(function () {
  'use strict';
  var M = window.MDRRM, B = window.BBAH;
  if (!M || !B) return;
  var esc = B.esc, modal = B.modal, confirmDialog = B.confirmDialog, toast = B.toast, INPUT = B.INPUT, LABEL = B.LABEL;
  var S = M.state;
  var root = document.getElementById('mdrrm-content');
  var page = document.body.getAttribute('data-mdrrm-page');
  if (!root || !page) return;
  M.mount(page);

  /* ---------- shared UI snippets (same classes as the Provincial Head pages) ---------- */
  var CARD = 'bg-white rounded-2xl border border-gray-200 shadow-sm';
  var BTN_G = 'px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition';
  var BTN_P = 'px-2.5 py-1.5 bg-brand hover:bg-brandDark text-white font-bold rounded-lg transition shadow-xs';
  var TH = 'text-gray-400 bg-gray-50 border-b border-gray-100 uppercase text-[10px] font-bold tracking-wider';
  var SEL = 'text-xs font-bold bg-gray-50 border border-gray-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-brand/40';
  var SEARCH = 'px-3 py-2 rounded-xl border border-gray-200 text-xs text-[#0F2922] bg-white focus:outline-none focus:ring-2 focus:ring-brand/40 w-full sm:w-64';

  function header(title, sub, right) {
    return '<div class="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-200 pb-4 gap-4"><div>' +
      '<h1 class="text-2xl sm:text-3xl font-extrabold text-[#164a38] tracking-tight">' + title + '</h1>' +
      '<p class="text-xs sm:text-sm text-gray-500 mt-1">' + sub + '</p></div>' + (right || '') + '</div>';
  }
  function statCard(label, icon, value, badgeHtml, sub) {
    return '<div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs relative flex flex-col justify-between">' +
      '<div class="flex items-center justify-between"><span class="text-xs font-bold uppercase tracking-wider text-gray-400">' + label + '</span>' +
      '<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="' + icon + '"/></svg></div>' +
      '<div class="mt-4 flex items-baseline justify-between gap-2"><h3 class="text-2xl font-extrabold text-[#0F2922]">' + value + '</h3>' + (badgeHtml || '') + '</div>' +
      (sub ? '<p class="text-[11px] text-gray-400 font-medium mt-2">' + sub + '</p>' : '') + '</div>';
  }
  function kv(label, value) {
    return '<div class="flex justify-between gap-4 bg-gray-50 rounded-xl px-3 py-2"><dt class="font-bold text-gray-500 shrink-0">' + label + '</dt><dd class="font-semibold text-[#0F2922] text-right">' + value + '</dd></div>';
  }
  function section(title, inner) {
    return '<h3 class="text-[11px] font-bold uppercase tracking-wider text-gray-400 mt-4 mb-2">' + title + '</h3>' + inner;
  }
  function emptyRow(cols, msg) { return '<tr><td colspan="' + cols + '" class="py-8 text-center text-xs text-gray-400">' + msg + '</td></tr>'; }
  function opts(list, cur) { return list.map(function (o) { return '<option' + (o === cur ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join(''); }
  function byId(list, id) { return list.filter(function (x) { return x.id === id; })[0]; }
  function $(s, r) { return (r || document).querySelector(s); }

  var handlers = {};
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]');
    if (!el || el.disabled) return;
    var fn = handlers[el.getAttribute('data-act')];
    if (fn) fn(el);
  });
  var riskOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };

  /* =============================================================== DASHBOARD */
  function dashboard() {
    var worst = M.STATIONS.slice().filter(function (s) { return !s.offline; }).sort(function (a, b) { return riskOrder[M.stationRisk(a)] - riskOrder[M.stationRisk(b)] || b.level / b.crit - a.level / a.crit; })[0];
    var wr = M.stationRisk(worst);
    var open = S.alerts.filter(M.isOpenAlert).length, pend = M.pendingCount();
    var needAssist = M.RESIDENTS.filter(function (r) { return r.assist !== 'None'; }).length;
    var attention = S.alerts.filter(function (a) { return a.stage === 'pending_mdrrm' || a.stage === 'more_info' || (a.stage === 'approved' && a.bc.status === 'none'); })
      .sort(function (a, b) { return riskOrder[a.risk] - riskOrder[b.risk] || new Date(b.detectedAt) - new Date(a.detectedAt); });
    var decisions = S.log.filter(function (l) { return l.type === 'Evacuation decision'; }).slice(0, 5);
    var online = M.STATIONS.filter(function (s) { return !s.offline; }).length;
    var withCaptain = S.alerts.filter(function (a) { return a.stage === 'awaiting_captain' || a.stage === 'in_progress' || a.stage === 'more_info'; }).length;
    var anySending = S.alerts.some(function (a) { return M.bcView(a).key === 'sending'; });

    function alertRow(a) {
      var action = a.stage === 'approved' ? 'Confirm SMS' : a.stage === 'more_info' ? 'View' : 'Review';
      return '<tr class="hover:bg-gray-50/50 transition"><td class="py-3.5 pl-2 font-bold text-[#0F2922]">Brgy. ' + esc(a.brgy) + '<p class="text-[11px] font-normal text-gray-400">' + esc(a.id) + ' &middot; ' + M.rel(a.detectedAt) + '</p></td>' +
        '<td class="py-3.5">' + M.risk(a.risk) + '</td><td class="py-3.5">' + M.stage(a.stage) + '</td>' +
        '<td class="py-3.5 text-right pr-2"><a href="mdrrm-alerts.html#' + a.id + '" class="' + (a.stage === 'pending_mdrrm' || a.stage === 'approved' ? BTN_P : BTN_G) + '">' + action + '</a></td></tr>';
    }
    var greet = new Date().getHours() < 12 ? 'Good morning,' : new Date().getHours() < 18 ? 'Good afternoon,' : 'Good evening,';
    root.innerHTML =
      '<div class="pb-2"><p class="text-sm font-medium text-gray-500">' + greet + '</p><h1 class="text-2xl sm:text-3xl font-extrabold text-[#164a38] tracking-tight mt-0.5">MDRRM Officer</h1><p class="text-xs sm:text-sm text-gray-500 mt-1">Here is the current disaster response status of your area.</p></div>' +
      '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">' +
        statCard('Current Flood Risk', 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z', wr, M.risk(wr), 'Highest: Brgy. ' + esc(worst.brgy) + ' at ' + worst.level.toFixed(1) + ' m') +
        statCard('Active Alerts', 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', String(open), M.badge(open ? 'Open' : 'Clear', open ? 'orange' : 'emerald'), 'Not yet rejected or fully delivered') +
        statCard('Pending MDRRM Approvals', 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', String(pend), M.badge(pend ? 'Needs action' : 'None waiting', pend ? 'blue' : 'emerald'), 'Verified by Barangay Captains') +
        statCard('Registered Residents', 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', M.num(M.RESIDENTS.length), M.badge(needAssist + ' need assistance', 'amber'), 'Across ' + M.BRGYS.length + ' barangays') +
      '</div>' +
      '<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">' +
        '<div class="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs"><div class="flex items-center justify-between mb-4"><div><h2 class="text-base font-bold text-[#0F2922]">Alerts Requiring Attention</h2><p class="text-xs text-gray-500">Waiting for your decision or SMS confirmation</p></div><a href="mdrrm-alerts.html" class="text-xs font-bold text-brand hover:underline">See All</a></div>' +
          '<div class="overflow-x-auto"><table class="w-full text-left text-xs"><thead><tr class="text-gray-400 border-b border-gray-100 uppercase text-[10px] font-bold tracking-wider"><th class="pb-3 pl-2">Barangay</th><th class="pb-3">Risk Level</th><th class="pb-3">Stage</th><th class="pb-3 text-right pr-2">Action</th></tr></thead><tbody class="divide-y divide-gray-100">' +
          (attention.length ? attention.map(alertRow).join('') : emptyRow(4, 'Nothing needs your attention right now.')) + '</tbody></table></div></div>' +
        '<div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs"><h2 class="text-base font-bold text-[#0F2922] mb-4">Operational Status</h2><div class="grid grid-cols-2 gap-2 text-center">' +
          [['Sensor Feed', online + ' of ' + M.STATIONS.length + ' online', online === M.STATIONS.length ? '' : 'text-amber-600'],
           ['SMS Gateway', anySending ? 'Sending' : 'Ready', anySending ? 'text-blue-600' : ''],
           ['With Captains', withCaptain + ' awaiting', withCaptain ? 'text-amber-600' : ''],
           ['Need Assistance', needAssist + ' residents', '']].map(function (t) {
            return '<div class="p-3 rounded-xl bg-gray-50"><p class="text-[10px] uppercase font-bold text-gray-400">' + t[0] + '</p><p class="text-xs font-extrabold text-[#0F2922] mt-0.5 ' + t[2] + '">' + t[1] + '</p></div>';
          }).join('') + '</div>' +
          '<p class="text-[11px] text-gray-400 font-medium mt-4">Sensor thresholds and feeds are managed by the System Administrator. You have read-only access to readings.</p>' +
          '<a href="mdrrm-monitoring.html" class="inline-block mt-3 text-xs font-bold text-brand hover:underline">Open Disaster Monitoring</a></div>' +
      '</div>' +
      '<div class="grid grid-cols-1 gap-6">' +
        '<div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs"><div class="flex items-center justify-between mb-4"><h2 class="text-base font-bold text-[#0F2922]">Recent Evacuation Decisions</h2><a href="mdrrm-reports.html" class="text-xs font-bold text-brand hover:underline">History</a></div><ul class="divide-y divide-gray-100 text-xs">' +
          (decisions.length ? decisions.map(function (d) { return '<li class="py-3"><p class="font-bold text-[#0F2922]">Brgy. ' + esc(d.brgy) + '</p><p class="text-gray-500 mt-0.5">' + esc(d.summary) + '</p><p class="text-[11px] text-gray-400 mt-0.5">' + M.fmt(d.at) + ' &middot; ' + esc(d.ref) + '</p></li>'; }).join('') : '<li class="py-6 text-center text-gray-400">No decisions recorded yet.</li>') + '</ul></div>' +
      '</div>';
  }
  function incStatus(s) { return M.badge(s, { 'Submitted': 'blue', 'Under Review': 'amber', 'Action Required': 'orange', 'In Progress': 'indigo', 'Resolved': 'emerald', 'Closed': 'gray' }[s] || 'gray'); }

  /* =============================================================== MONITORING */
  function monitoring() {
    var live = M.STATIONS.filter(function (s) { return !s.offline; });
    var top = live.slice().sort(function (a, b) { return b.level / b.crit - a.level / a.crit; })[0];
    var hi = live.filter(function (s) { var r = M.stationRisk(s); return r === 'High' || r === 'Critical'; }).length;
    var rain = live.slice().sort(function (a, b) { return b.rain - a.rain; })[0];
    var f = { q: '', risk: 'All' };
    root.innerHTML = header('Disaster Monitoring', 'Live water level and rainfall readings by station. Read-only view.') +
      '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">' +
        statCard('Highest Water Level', 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', top.level.toFixed(1) + ' m', M.risk(M.stationRisk(top)), 'Brgy. ' + esc(top.brgy)) +
        statCard('Stations Online', 'M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728M9.172 15.828a4 4 0 010-5.656m5.656 0a4 4 0 010 5.656', live.length + ' of ' + M.STATIONS.length, M.badge(live.length === M.STATIONS.length ? 'All online' : '1 offline', live.length === M.STATIONS.length ? 'emerald' : 'amber')) +
        statCard('High or Critical', 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', String(hi), M.badge(hi ? 'Watch closely' : 'None', hi ? 'orange' : 'emerald'), 'Stations above warning level') +
        statCard('Peak Rainfall', 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z', rain.rain + ' mm/hr', '', 'Brgy. ' + esc(rain.brgy)) +
      '</div>' +
      '<div class="' + CARD + ' p-6"><div class="mb-4"><h2 class="text-base font-bold text-[#0F2922]">Water Level Against Critical Threshold</h2><p class="text-xs text-gray-500">Percent of each station\'s critical level</p></div><div class="h-64 w-full"><canvas id="mdrrmLevels"></canvas></div></div>' +
      '<div class="' + CARD + ' overflow-hidden"><div class="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3"><h3 class="text-xs font-extrabold uppercase tracking-wider text-gray-400">Sensor Stations</h3>' +
        '<div class="flex flex-wrap items-center gap-2"><input id="f-q" type="search" placeholder="Search station or barangay" class="' + SEARCH + '" aria-label="Search stations"><select id="f-risk" class="' + SEL + '" aria-label="Filter by risk">' + opts(['All', 'Critical', 'High', 'Medium', 'Low', 'Offline'], 'All') + '</select></div></div>' +
        '<div class="overflow-x-auto"><table class="w-full text-left text-xs"><thead><tr class="' + TH + '"><th class="py-3 px-6">Station</th><th class="py-3 px-4">Barangay</th><th class="py-3 px-4">Water Level</th><th class="py-3 px-4">Trend</th><th class="py-3 px-4">Risk Level</th><th class="py-3 px-4">Last Reading</th><th class="py-3 px-6 text-right">Actions</th></tr></thead><tbody id="st-body" class="divide-y divide-gray-100 text-gray-700"></tbody></table></div>' +
        '<p class="px-6 py-3 border-t border-gray-100 text-[11px] text-gray-400">Alert and critical thresholds are set by the System Administrator and cannot be changed from this account.</p></div>';

    function rows() {
      var q = f.q.toLowerCase();
      var list = M.STATIONS.filter(function (s) { return (f.risk === 'All' || M.stationRisk(s) === f.risk) && (!q || (s.name + ' ' + s.brgy + ' ' + s.id).toLowerCase().indexOf(q) > -1); });
      $('#st-body').innerHTML = list.length ? list.map(function (s) {
        return '<tr class="hover:bg-gray-50/50 transition"><td class="py-4 px-6 font-bold text-[#0F2922]">' + esc(s.name) + '<p class="text-[11px] font-normal text-gray-400">' + s.id + '</p></td><td class="py-4 px-4 text-gray-600">' + esc(s.brgy) + '</td>' +
          '<td class="py-4 px-4 font-bold text-[#0F2922]">' + (s.offline ? '-' : s.level.toFixed(1) + ' m') + '</td><td class="py-4 px-4 text-gray-500">' + s.trend + '</td><td class="py-4 px-4">' + M.risk(M.stationRisk(s)) + '</td>' +
          '<td class="py-4 px-4 text-gray-500">' + (s.ping > 60 ? Math.round(s.ping / 60) + ' hr ago' : s.ping + ' min ago') + '</td><td class="py-4 px-6 text-right"><button type="button" class="' + BTN_G + '" data-act="st-view" data-id="' + s.id + '">View</button></td></tr>';
      }).join('') : emptyRow(7, 'No stations match your filters.');
    }
    rows();
    $('#f-q').addEventListener('input', function (e) { f.q = e.target.value; rows(); });
    $('#f-risk').addEventListener('change', function (e) { f.risk = e.target.value; rows(); });
    handlers['st-view'] = function (el) {
      var s = byId(M.STATIONS, el.getAttribute('data-id'));
      modal({ title: s.name, size: 'max-w-lg', actions: [{ label: 'Close', variant: 'primary' }], body: '<dl class="space-y-2">' +
        kv('Barangay', esc(s.brgy)) + kv('Water level', s.offline ? 'No signal' : s.level.toFixed(1) + ' m') + kv('Watch level', s.watch.toFixed(1) + ' m') + kv('Warning level', s.warn.toFixed(1) + ' m') + kv('Critical level', s.crit.toFixed(1) + ' m') +
        kv('Trend', s.trend) + kv('Rainfall', s.rain == null ? '-' : s.rain + ' mm/hr') + kv('Drainage', s.note || (s.offline ? 'Unknown' : 'Normal')) + kv('Risk level', M.risk(M.stationRisk(s))) + '</dl>' +
        '<p class="mt-3 text-[11px] text-gray-400">Thresholds are read-only for the MDRRM Officer.</p>' });
    };
    if (window.Chart) {
      var pts = live.map(function (s) { return { n: s.brgy, p: Math.round(s.level / s.crit * 100), r: M.stationRisk(s) }; });
      var col = { Critical: '#dc2626', High: '#ea580c', Medium: '#eab308', Low: '#164a38' };
      new Chart($('#mdrrmLevels').getContext('2d'), { type: 'bar',
        data: { labels: pts.map(function (x) { return x.n; }), datasets: [{ data: pts.map(function (x) { return x.p; }), backgroundColor: pts.map(function (x) { return col[x.r]; }), borderRadius: 6 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, suggestedMax: 110, ticks: { callback: function (v) { return v + '%'; } }, grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } } } });
    }
  }

  /* =============================================================== ALERTS */
  var AF = 'all';
  function steps(a) {
    var s = a.stage;
    var rank = { awaiting_captain: 1, in_progress: 1, more_info: 1, pending_mdrrm: 2, approved: 3, rejected: 3 }[s];
    var bc = M.bcView(a).key;
    var names = ['System detection', 'Barangay verification', 'MDRRM decision', 'SMS broadcast'];
    var done = [true, rank >= 2, rank >= 3, bc === 'delivered' || bc === 'partial'];
    var cur = [false, rank === 1, rank === 2, (s === 'approved' && !done[3])];
    if (s === 'rejected') done[3] = false;
    return '<ol class="flex flex-wrap gap-2 text-[11px] font-bold">' + names.map(function (n, i) {
      var cls = done[i] ? 'bg-emerald-50 text-emerald-700' : cur[i] ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-400';
      return '<li class="px-2.5 py-1 rounded-lg ' + cls + '">' + (i + 1) + '. ' + n + '</li>';
    }).join('') + '</ol>';
  }
  function bcBadge(a) { var v = M.bcView(a); return M.badge(v.key === 'sending' ? 'Sending ' + M.num(v.delivered) + ' / ' + M.num(v.total) : v.label, v.tone); }

  function alertsPage() {
    root.innerHTML = header('Alerts & Evacuation', 'Review verified alerts, record your decision, then confirm the evacuation SMS broadcast.') +
      '<div class="flex flex-wrap gap-2" id="af"></div><div id="al-list" class="space-y-4"></div>' +
      '<p class="text-[11px] text-gray-400">Approval and SMS delivery are separate steps. An approved alert is not sent until you confirm the broadcast, and delivery is reported once the gateway finishes.</p>';
    var FILTERS = [['all', 'All alerts'], ['pending_mdrrm', 'Needs my approval'], ['awaiting', 'With Barangay Captain'], ['approved', 'Approved'], ['rejected', 'Rejected']];
    function match(a) {
      if (AF === 'all') return true;
      if (AF === 'awaiting') return a.stage === 'awaiting_captain' || a.stage === 'in_progress' || a.stage === 'more_info';
      return a.stage === AF;
    }
    function draw() {
      $('#af').innerHTML = FILTERS.map(function (f) {
        var n = S.alerts.filter(function (a) { AF0 = AF; AF = f[0]; var r = match(a); AF = AF0; return r; }).length;
        return '<button type="button" data-act="af" data-f="' + f[0] + '" class="' + (AF === f[0] ? 'px-4 py-1.5 bg-brand text-white text-xs font-bold rounded-full shadow-sm' : 'px-4 py-1.5 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold rounded-full transition') + '" aria-pressed="' + (AF === f[0]) + '">' + f[1] + ' (' + n + ')</button>';
      }).join('');
      var list = S.alerts.filter(match).sort(function (a, b) { return (a.stage === 'pending_mdrrm' ? 0 : 1) - (b.stage === 'pending_mdrrm' ? 0 : 1) || riskOrder[a.risk] - riskOrder[b.risk] || new Date(b.detectedAt) - new Date(a.detectedAt); });
      $('#al-list').innerHTML = list.length ? list.map(function (a) {
        var edge = a.risk === 'Critical' ? 'border-l-red-600' : 'border-l-amber-500';
        var needs = a.stage === 'pending_mdrrm', send = a.stage === 'approved' && a.bc.status === 'none';
        return '<div class="bg-white p-6 rounded-2xl border-l-[6px] ' + edge + ' shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition hover:shadow-md">' +
          '<div class="min-w-0"><div class="flex flex-wrap items-center gap-2 mb-1"><h3 class="text-base font-extrabold text-[#0F2922]">Brgy. ' + esc(a.brgy) + '</h3>' + M.risk(a.risk) + M.stage(a.stage) + (a.stage === 'approved' ? bcBadge(a) : '') + '</div>' +
          '<p class="text-xs text-gray-500">' + esc(a.trigger) + '</p>' +
          '<p class="text-[11px] text-gray-400 mt-1">' + esc(a.id) + ' &middot; Detected ' + M.rel(a.detectedAt) + ' &middot; ' + a.sensor.level.toFixed(1) + ' m at ' + esc(a.sensor.station) + '</p></div>' +
          '<div class="flex gap-2 shrink-0"><button type="button" class="' + (needs || send ? BTN_P : BTN_G) + '" data-act="al-open" data-id="' + a.id + '">' + (needs ? 'Review &amp; Decide' : send ? 'Confirm SMS' : 'View') + '</button></div></div>';
      }).join('') : '<div class="bg-white p-10 rounded-2xl border border-dashed border-gray-200 text-center text-xs text-gray-400 font-semibold">No alerts in this view.</div>';
    }
    var AF0;
    handlers.af = function (el) { AF = el.getAttribute('data-f'); draw(); };
    handlers['al-open'] = function (el) { openAlert(el.getAttribute('data-id')); };
    window.__alDraw = draw;
    draw();
    setInterval(function () { if (M.syncBroadcasts() || S.alerts.some(function (a) { return a.bc.status === 'sending'; })) draw(); }, 1500);
    if (location.hash.length > 1) { var a = byId(S.alerts, decodeURIComponent(location.hash.slice(1))); if (a) openAlert(a.id); }
  }

  function openAlert(id) {
    var a = byId(S.alerts, id); if (!a) return;
    var v = M.bcView(a), c = a.captain, s = a.sensor;
    var body = steps(a) +
      section('Risk classification', '<dl class="space-y-2">' + kv('Barangay', 'Brgy. ' + esc(a.brgy)) + kv('Risk level', M.risk(a.risk)) + kv('Detected', M.fmt(a.detectedAt)) + kv('Trigger', esc(a.trigger)) + kv('Households affected', a.households ? M.num(a.households) : '-') + kv('Evacuation center', esc(a.center)) + '</dl>') +
      section('Sensor readings', '<dl class="space-y-2">' + kv('Station', esc(s.station)) + kv('Water level', s.level.toFixed(1) + ' m') + kv('Warning / critical', s.warning.toFixed(1) + ' m / ' + s.critical.toFixed(1) + ' m') + kv('Rate of rise', esc(s.rise)) + kv('Rainfall', esc(s.rainfall)) + kv('Drainage', esc(s.drainage)) + '</dl>') +
      section('Barangay Captain verification', '<dl class="space-y-2">' + kv('Captain', esc(c.name)) + kv('Status', esc(c.status) + (c.findings ? ' &middot; ' + M.fmt(c.at) : '')) + (c.condition ? kv('Ground condition', esc(c.condition)) : '') + (c.location ? kv('Confirmed location', esc(c.location)) : '') + (c.verifiedAt ? kv('Verified on site', M.fmt(c.verifiedAt)) : '') + (c.households ? kv('Households affected (est.)', M.num(c.households)) : '') + '</dl>' +
        '<div class="mt-2 bg-gray-50 rounded-xl px-3 py-2 text-[#0F2922]">' + (c.findings ? esc(c.findings) : '<span class="text-gray-400">No findings submitted yet. This alert cannot be approved until the Barangay Captain submits findings.</span>') + '</div>') +
      (a.decision ? section('Your decision', '<dl class="space-y-2">' + kv('Decision', esc(a.decision.action)) + kv('Recorded', M.fmt(a.decision.at)) + kv('By', esc(a.decision.by)) + '</dl><div class="mt-2 bg-gray-50 rounded-xl px-3 py-2 text-[#0F2922]">' + esc(a.decision.reason) + '</div>') : '') +
      (a.stage === 'approved' ? section('SMS broadcast (separate from approval)', '<dl class="space-y-2">' + kv('Delivery status', bcBadge(a)) + (v.key === 'none' ? kv('Recipients', M.num(a.recipients) + ' registered residents') : kv('Delivered', M.num(v.delivered) + ' of ' + M.num(v.total)) + (v.failed ? kv('Failed', M.num(v.failed)) : '') + kv('Confirmed', M.fmt(a.bc.confirmedAt))) + '</dl>') : '');
    var actions = [{ label: 'Close', variant: 'ghost' }];
    if (a.stage === 'awaiting_captain' || a.stage === 'in_progress' || a.stage === 'more_info') {
      actions.unshift({ label: 'Simulate captain reply (prototype)', variant: 'ghost', onClick: function () { simulateCaptain(a); } });
    } else if (a.stage === 'pending_mdrrm') {
      actions = [{ label: 'Close', variant: 'ghost' },
        { label: 'Request verification', variant: 'ghost', onClick: function () { decide(a, 'more'); } },
        { label: 'Reject', variant: 'danger', onClick: function () { decide(a, 'reject'); } },
        { label: 'Approve evacuation', variant: 'primary', onClick: function () { decide(a, 'approve'); } }];
    } else if (a.stage === 'approved' && a.bc.status === 'none') {
      actions.push({ label: 'Confirm SMS broadcast', variant: 'primary', onClick: function () { confirmSms(a); } });
    }
    modal({ title: 'Alert ' + a.id, size: 'max-w-2xl', body: body, actions: actions });
  }
  function simulateCaptain(a) {
    a.captain.findings = a.captain.simulate || a.captain.findings || 'Conditions confirmed on the ground. Recommend evacuation.';
    a.captain.status = 'Submitted'; a.captain.at = new Date().toISOString();
    a.stage = 'pending_mdrrm';
    M.save(); toast('Captain findings received. Alert is now in your approval queue.', 'info'); refresh();
  }
  function ask(title, label, ph, cb, confirmLabel, danger) {
    var form = B.mk('form', '', '<label class="block"><span class="' + LABEL + '">' + label + '</span><textarea name="t" rows="4" required class="' + INPUT + '" placeholder="' + ph + '"></textarea></label>');
    var m = modal({ title: title, body: form, actions: [{ label: 'Cancel', variant: 'ghost' }, { label: confirmLabel, variant: danger ? 'danger' : 'primary', onClick: function () { if (!form.reportValidity()) return false; cb(form.t.value.trim()); } }] });
    form.addEventListener('submit', function (e) { e.preventDefault(); m.buttons[1].click(); });
  }
  function decide(a, kind) {
    var now = function () { return new Date().toISOString(); };
    if (kind === 'approve') {
      confirmDialog({ title: 'Approve evacuation alert?', message: 'This records your approval for <strong>Brgy. ' + esc(a.brgy) + '</strong> with the current time. <strong>No SMS is sent yet.</strong> You will confirm the broadcast as a separate step.', confirmLabel: 'Approve' }).then(function (ok) {
        if (!ok) return;
        a.stage = 'approved'; a.decision = { by: M.OFFICER.name, at: now(), action: 'Approved', reason: 'Captain findings reviewed against sensor readings. Evacuation approved.' };
        M.addLog('Evacuation decision', a.id, a.brgy, 'Approved evacuation alert (' + a.risk + ')');
        M.save(); toast('Evacuation approved. Confirm the SMS broadcast next.'); refresh(a.id);
      });
    } else if (kind === 'reject') {
      ask('Reject alert', 'Reason for rejection', 'Why is evacuation not needed?', function (t) {
        a.stage = 'rejected'; a.decision = { by: M.OFFICER.name, at: now(), action: 'Rejected', reason: t };
        M.addLog('Evacuation decision', a.id, a.brgy, 'Rejected evacuation alert (' + a.risk + ')');
        M.save(); toast('Alert rejected and recorded', 'info'); refresh();
      }, 'Reject alert', true);
    } else {
      ask('Request additional verification', 'What should the Barangay Captain check?', 'Tell the captain what to confirm', function (t) {
        a.stage = 'more_info'; a.captain.status = 'Re-verification requested';
        a.decision = { by: M.OFFICER.name, at: now(), action: 'More verification requested', reason: t };
        M.addLog('Evacuation decision', a.id, a.brgy, 'Requested additional verification');
        M.save(); toast('Request sent to ' + a.captain.name, 'info'); refresh();
      }, 'Send request');
    }
  }
  function confirmSms(a) {
    confirmDialog({ title: 'Confirm mass SMS broadcast?', message: 'An evacuation SMS will be sent to <strong>' + M.num(a.recipients) + '</strong> registered residents of <strong>Brgy. ' + esc(a.brgy) + '</strong>. Approval is already recorded; this step starts delivery.', confirmLabel: 'Confirm broadcast' }).then(function (ok) {
      if (!ok) return;
      a.bc = { status: 'sending', recipients: a.recipients, confirmedAt: new Date().toISOString() };
      M.addLog('SMS broadcast', a.id, a.brgy, 'Mass SMS broadcast confirmed to ' + M.num(a.recipients) + ' residents');
      M.save(); toast('Broadcast confirmed. Delivery in progress.', 'info'); refresh();
    });
  }
  function refresh() { if (window.__alDraw) window.__alDraw(); else location.reload(); }

  /* =============================================================== RESIDENTS */
  function residents() {
    var f = { q: '', brgy: 'All barangays', status: 'All statuses', assist: 'All', page: 1 }, PER = 10;
    root.innerHTML = header('Registered Residents', 'View resident details for emergency coordination. Read-only access.') +
      '<div class="' + CARD + ' overflow-hidden"><div class="p-5 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3"><h3 class="text-xs font-extrabold uppercase tracking-wider text-gray-400">Resident Directory <span id="r-count" class="normal-case font-semibold text-gray-500 ml-2"></span></h3>' +
      '<div class="flex flex-wrap items-center gap-2"><input id="f-q" type="search" placeholder="Search name, ID or address" class="' + SEARCH + '" aria-label="Search residents">' +
      '<select id="f-b" class="' + SEL + '" aria-label="Barangay">' + opts(['All barangays'].concat(M.BRGYS), 'All barangays') + '</select>' +
      '<select id="f-s" class="' + SEL + '" aria-label="Status">' + opts(['All statuses', 'Verified', 'Pending Verification', 'Inactive'], 'All statuses') + '</select>' +
      '<select id="f-a" class="' + SEL + '" aria-label="Assistance">' + opts(['All', 'Needs assistance', 'No assistance'], 'All') + '</select></div></div>' +
      '<div class="overflow-x-auto"><table class="w-full text-left text-xs"><thead><tr class="' + TH + '"><th class="py-3 px-6">Resident ID</th><th class="py-3 px-4">Full Name</th><th class="py-3 px-4">Barangay</th><th class="py-3 px-4">Address</th><th class="py-3 px-4">Contact Number</th><th class="py-3 px-4">Emergency Assistance</th><th class="py-3 px-4">Status</th><th class="py-3 px-6 text-right">Actions</th></tr></thead><tbody id="r-body" class="divide-y divide-gray-100 text-gray-700"></tbody></table></div>' +
      '<div class="p-4 border-t border-gray-100 flex items-center justify-between text-xs"><span id="r-range" class="text-gray-500 font-medium"></span><div class="flex gap-2"><button type="button" class="' + BTN_G + '" data-act="pg" data-d="-1">Previous</button><button type="button" class="' + BTN_G + '" data-act="pg" data-d="1">Next</button></div></div></div>' +
      '<p class="text-[11px] text-gray-400">Residents are fictional placeholder data. Creating, editing or removing registrations is outside the MDRRMO Officer\'s permissions.</p>';
    var stTone = { 'Verified': 'emerald', 'Pending Verification': 'amber', 'Inactive': 'gray' };
    function list() {
      var q = f.q.toLowerCase();
      return M.RESIDENTS.filter(function (r) {
        return (f.brgy === 'All barangays' || r.brgy === f.brgy) && (f.status === 'All statuses' || r.status === f.status) &&
          (f.assist === 'All' || (f.assist === 'Needs assistance') === (r.assist !== 'None')) && (!q || (r.name + ' ' + r.id + ' ' + r.addr).toLowerCase().indexOf(q) > -1);
      });
    }
    function draw() {
      var l = list(), pages = Math.max(1, Math.ceil(l.length / PER)); if (f.page > pages) f.page = pages;
      var s = (f.page - 1) * PER, part = l.slice(s, s + PER);
      $('#r-count').textContent = '(' + l.length + ' of ' + M.RESIDENTS.length + ')';
      $('#r-range').textContent = l.length ? 'Showing ' + (s + 1) + ' to ' + (s + part.length) + ' of ' + l.length : 'No results';
      $('#r-body').innerHTML = part.length ? part.map(function (r) {
        return '<tr class="hover:bg-gray-50/50 transition"><td class="py-4 px-6 font-bold text-[#0F2922]">' + r.id + '</td><td class="py-4 px-4 font-bold text-[#0F2922]">' + esc(r.name) + '</td><td class="py-4 px-4 text-gray-600">' + esc(r.brgy) + '</td><td class="py-4 px-4 text-gray-500">' + esc(r.addr) + '</td><td class="py-4 px-4 text-gray-600 whitespace-nowrap">' + r.phone + '</td>' +
          '<td class="py-4 px-4">' + (r.assist === 'None' ? '<span class="text-gray-400">None recorded</span>' : M.badge(r.assist, 'amber')) + '</td><td class="py-4 px-4">' + M.badge(r.status, stTone[r.status]) + '</td>' +
          '<td class="py-4 px-6 text-right"><button type="button" class="' + BTN_G + '" data-act="r-view" data-id="' + r.id + '">View</button></td></tr>';
      }).join('') : emptyRow(8, 'No residents match your filters.');
    }
    draw();
    $('#f-q').addEventListener('input', function (e) { f.q = e.target.value; f.page = 1; draw(); });
    $('#f-b').addEventListener('change', function (e) { f.brgy = e.target.value; f.page = 1; draw(); });
    $('#f-s').addEventListener('change', function (e) { f.status = e.target.value; f.page = 1; draw(); });
    $('#f-a').addEventListener('change', function (e) { f.assist = e.target.value; f.page = 1; draw(); });
    handlers.pg = function (el) { f.page = Math.max(1, f.page + parseInt(el.getAttribute('data-d'), 10)); draw(); };
    handlers['r-view'] = function (el) {
      var r = byId(M.RESIDENTS, el.getAttribute('data-id'));
      modal({ title: r.name, size: 'max-w-lg', actions: [{ label: 'Close', variant: 'primary' }], body: '<dl class="space-y-2">' +
        kv('Resident ID', r.id) + kv('Barangay', esc(r.brgy)) + kv('Address', esc(r.addr)) + kv('Contact number', r.phone) + kv('Household size', r.household + ' members') +
        kv('Emergency assistance', r.assist === 'None' ? 'None recorded' : esc(r.assist)) + kv('Emergency contact', esc(r.contactName) + '<br><span class="text-gray-500 font-medium">' + r.contactPhone + '</span>') +
        kv('Assigned center', esc(r.center)) + kv('Registration status', M.badge(r.status, stTone[r.status])) + kv('Registered', r.registered) + '</dl>' +
        '<p class="mt-3 text-[11px] text-gray-400">View only. This account cannot change registrations.</p>' });
    };
  }

  /* =============================================================== REPORTS & HISTORY */
  function reports() {
    var f = { q: '', type: 'All types' };
    var LOG = S.log.filter(function (l) { return ['Incident report', 'Incident update', 'Center update'].indexOf(l.type) < 0; });
    var dec = LOG.filter(function (l) { return l.type === 'Evacuation decision'; });
    var decided = S.alerts.filter(function (a) { return a.decision && a.decision.action !== 'More verification requested'; });
    var avg = decided.length ? Math.round(decided.reduce(function (n, a) { return n + (new Date(a.decision.at) - new Date(a.captain.at)) / 60000; }, 0) / decided.length) : 0;
    var delivered = S.alerts.reduce(function (n, a) { return n + (a.bc.delivered || 0); }, 0);
    root.innerHTML = header('Reports & History', 'Record of evacuation decisions and SMS broadcasts.', '<button type="button" class="' + BTN_P + ' self-start md:self-end" data-act="export">Export CSV</button>') +
      '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">' +
        statCard('Decisions Recorded', 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', String(dec.length), '') +
        statCard('Avg. Decision Time', 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', avg + ' min', '', 'After captain submission') +
        statCard('SMS Delivered', 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', M.num(delivered), '') +
        statCard('Alerts Rejected', 'M6 18L18 6M6 6l12 12', String(S.alerts.filter(function (a) { return a.stage === 'rejected'; }).length), '') + '</div>' +
      '<div class="' + CARD + ' overflow-hidden"><div class="p-5 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3"><h3 class="text-xs font-extrabold uppercase tracking-wider text-gray-400">Activity History</h3>' +
      '<div class="flex flex-wrap items-center gap-2"><input id="f-q" type="search" placeholder="Search reference or barangay" class="' + SEARCH + '" aria-label="Search history"><select id="f-t" class="' + SEL + '">' + opts(['All types', 'Barangay verification', 'Evacuation decision', 'SMS broadcast'], 'All types') + '</select></div></div>' +
      '<div class="overflow-x-auto"><table class="w-full text-left text-xs"><thead><tr class="' + TH + '"><th class="py-3 px-6">Date &amp; Time</th><th class="py-3 px-4">Type</th><th class="py-3 px-4">Reference</th><th class="py-3 px-4">Barangay</th><th class="py-3 px-4">Summary</th><th class="py-3 px-4">Recorded By</th><th class="py-3 px-6 text-right">Actions</th></tr></thead><tbody id="h-body" class="divide-y divide-gray-100 text-gray-700"></tbody></table></div></div>';
    function filtered() {
      var q = f.q.toLowerCase();
      return LOG.filter(function (l) { return (f.type === 'All types' || l.type === f.type) && (!q || (l.ref + ' ' + l.brgy + ' ' + l.summary).toLowerCase().indexOf(q) > -1); }).sort(function (a, b) { return new Date(b.at) - new Date(a.at); });
    }
    function draw() {
      var l = filtered();
      $('#h-body').innerHTML = l.length ? l.map(function (x, n) {
        return '<tr class="hover:bg-gray-50/50 transition"><td class="py-4 px-6 text-gray-500 whitespace-nowrap">' + M.fmt(x.at) + '</td><td class="py-4 px-4 font-bold text-[#0F2922]">' + esc(x.type) + '</td><td class="py-4 px-4 text-gray-600">' + esc(x.ref) + '</td><td class="py-4 px-4 text-gray-600">' + esc(x.brgy) + '</td><td class="py-4 px-4 text-gray-500">' + esc(x.summary) + '</td><td class="py-4 px-4 text-gray-500">' + esc(x.by) + '</td>' +
          '<td class="py-4 px-6 text-right"><button type="button" class="' + BTN_G + '" data-act="h-view" data-i="' + n + '">View</button></td></tr>';
      }).join('') : emptyRow(7, 'No records match your filters.');
    }
    draw();
    $('#f-q').addEventListener('input', function (e) { f.q = e.target.value; draw(); });
    $('#f-t').addEventListener('change', function (e) { f.type = e.target.value; draw(); });
    handlers['h-view'] = function (el) {
      var x = filtered()[parseInt(el.getAttribute('data-i'), 10)];
      modal({ title: x.type, size: 'max-w-lg', actions: [{ label: 'Close', variant: 'primary' }], body: '<dl class="space-y-2">' + kv('Recorded', M.fmt(x.at)) + kv('Reference', esc(x.ref)) + kv('Barangay', esc(x.brgy)) + kv('Summary', esc(x.summary)) + kv('Recorded by', esc(x.by)) + '</dl>' });
    };
    handlers.export = function () {
      var rows = [['Date and time', 'Type', 'Reference', 'Barangay', 'Summary', 'Recorded by']].concat(filtered().map(function (x) { return [M.fmt(x.at), x.type, x.ref, x.brgy, x.summary, x.by]; }));
      B.downloadFile('mdrrm-activity-history.csv', rows.map(function (r) { return r.map(B.csvCell).join(','); }).join('\n') + '\n', 'text/csv');
      toast('History exported', 'info');
    };
  }

  M.ui = { CARD: CARD, BTN_G: BTN_G, BTN_P: BTN_P, TH: TH, SEL: SEL, SEARCH: SEARCH, header: header, statCard: statCard, kv: kv, section: section, emptyRow: emptyRow, opts: opts, byId: byId, $: $, handlers: handlers, riskOrder: riskOrder, incStatus: incStatus, ask: ask, root: root, page: page };
  var PAGES = { map: function () {}, dashboard: dashboard, monitoring: monitoring, alerts: alertsPage, residents: residents, reports: reports };
  if (M.ROLE === 'mdrrm' && PAGES[page]) PAGES[page]();
})();
