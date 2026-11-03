/* Bantay Baha at Basura - Barangay Captain pages
   Reuses the shell, shared state and UI helpers from mdrrm-shell.js / mdrrm-pages.js.
   Shared state means a verification or incident submitted here appears in the MDRRMO Officer interface. */
(function () {
  'use strict';
  var M = window.MDRRM, B = window.BBAH;
  if (!M || !B || !M.ui || M.ROLE !== 'captain') return;
  var U = M.ui, S = M.state, ME = M.ME, MY = M.MY_BRGY;
  var esc = B.esc, modal = B.modal, confirmDialog = B.confirmDialog, toast = B.toast, INPUT = B.INPUT, LABEL = B.LABEL;
  var root = U.root, page = U.page, $ = U.$, H = U.handlers;
  var CAP_NAME = 'Kap. ' + ME.name;
  var NOTE_SIM = 'Simulated prototype values, not live readings.';

  function mineAlerts() { return S.alerts.filter(function (a) { return a.brgy === MY; }); }
  function mineIncidents() { return S.incidents.filter(function (i) { return i.brgy === MY; }).sort(function (a, b) { return new Date(b.at) - new Date(a.at); }); }
  function myStations() { return M.STATIONS.filter(function (s) { return s.brgy === MY; }); }
  function localDT(d) { var z = new Date(d.getTime() - d.getTimezoneOffset() * 60000); return z.toISOString().slice(0, 16); }
  function alertType(a) { return a.sensor.drainage !== 'Normal' ? 'Flood risk and drainage clog' : 'Flood risk'; }
  function worstStation() {
    var o = { Critical: 0, High: 1, Medium: 2, Low: 3 };
    return myStations().filter(function (s) { return !s.offline; }).sort(function (a, b) { return o[M.stationRisk(a)] - o[M.stationRisk(b)] || b.level / b.crit - a.level / a.crit; })[0];
  }
  function levelBar(s) {
    if (s.offline) return '-';
    var p = Math.min(100, Math.round(s.level / s.crit * 100));
    return '<div class="flex items-center gap-2"><span class="font-bold text-[#0F2922] w-12">' + s.level.toFixed(1) + ' m</span><div class="h-1.5 w-20 rounded-full bg-gray-100 overflow-hidden"><div class="h-full rounded-full bg-brand" style="width:' + p + '%"></div></div></div>';
  }
  function isOpen(a) { return M.isOpenAlert(a); }

  /* ======================================================== DASHBOARD */
  function dashboard() {
    var al = mineAlerts(), ic = mineIncidents(), w = worstStation(), wr = M.stationRisk(w);
    var pend = al.filter(M.needsVerification), open = al.filter(isOpen);
    var openInc = ic.filter(function (i) { return i.status !== 'Resolved' && i.status !== 'Closed'; });
    var h = new Date().getHours();
    function alertRow(a) {
      return '<tr class="hover:bg-gray-50/50 transition"><td class="py-3.5 pl-2 font-bold text-[#0F2922]">' + esc(a.id) + '<p class="text-[11px] font-normal text-gray-400">' + esc(alertType(a)) + ' &middot; ' + M.rel(a.detectedAt) + '</p></td><td class="py-3.5">' + M.risk(a.risk) + '</td><td class="py-3.5 text-right pr-2">' + M.cstage(a.stage) + '</td></tr>';
    }
    root.innerHTML =
      '<div class="pb-2"><p class="text-sm font-medium text-gray-500">' + (h < 12 ? 'Good morning,' : h < 18 ? 'Good afternoon,' : 'Good evening,') + '</p><h1 class="text-2xl sm:text-3xl font-extrabold text-[#164a38] tracking-tight mt-0.5">Barangay Captain</h1><p class="text-xs sm:text-sm text-gray-500 mt-1">Local disaster preparedness for Brgy. ' + esc(MY) + '. ' + NOTE_SIM + '</p></div>' +
      '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">' +
        U.statCard('Current Flood Risk', 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z', wr, M.risk(wr), 'Highest local station: ' + w.level.toFixed(1) + ' m (simulated)') +
        U.statCard('Active Alerts', 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', String(open.length), M.badge(open.length ? 'Open' : 'Clear', open.length ? 'orange' : 'emerald'), 'Alerts affecting your barangay') +
        U.statCard('Pending Verifications', 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', String(pend.length), M.badge(pend.length ? 'Needs you' : 'None waiting', pend.length ? 'amber' : 'emerald'), 'Ground checks for the MDRRMO Officer') +
        U.statCard('Reported Incidents', 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', String(ic.length), M.badge(openInc.length + ' open', openInc.length ? 'blue' : 'emerald'), 'Submitted from this barangay') +
      '</div>' +
      '<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">' +
        '<div class="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs"><div class="flex items-center justify-between mb-4"><div><h2 class="text-base font-bold text-[#0F2922]">Recent Alerts Affecting Brgy. ' + esc(MY) + '</h2><p class="text-xs text-gray-500">Latest alerts and where each stands</p></div><a href="brgy-alerts.html" class="text-xs font-bold text-brand hover:underline">See All</a></div>' +
          '<div class="overflow-x-auto"><table class="w-full text-left text-xs"><thead><tr class="text-gray-400 border-b border-gray-100 uppercase text-[10px] font-bold tracking-wider"><th class="pb-3 pl-2">Alert</th><th class="pb-3">Risk Level</th><th class="pb-3 text-right pr-2">Status</th></tr></thead><tbody class="divide-y divide-gray-100">' +
          (al.length ? al.slice().sort(function (a, b) { return new Date(b.detectedAt) - new Date(a.detectedAt); }).slice(0, 5).map(alertRow).join('') : U.emptyRow(3, 'No alerts for your barangay.')) + '</tbody></table></div></div>' +
        '<div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs"><h2 class="text-base font-bold text-[#0F2922] mb-4">Verification Requests</h2><ul class="divide-y divide-gray-100 text-xs">' +
          (pend.length ? pend.map(function (a) { return '<li class="py-3"><div class="flex items-start justify-between gap-2"><div><p class="font-bold text-[#0F2922]">' + esc(a.id) + '</p><p class="text-gray-500 mt-0.5">' + esc(a.stage === 'more_info' ? 'MDRRMO Officer asked for more details' : 'Please verify conditions on the ground') + '</p></div>' + M.risk(a.risk) + '</div><a href="brgy-alerts.html#' + a.id + '" class="' + U.BTN_P + ' inline-block mt-2">' + (a.stage === 'more_info' ? 'Respond' : 'Verify') + '</a></li>'; }).join('') : '<li class="py-6 text-center text-gray-400">No verification requests right now.</li>') + '</ul></div>' +
      '</div>' +
      '<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">' +
        '<div class="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs"><div class="flex items-center justify-between mb-4"><div><h2 class="text-base font-bold text-[#0F2922]">Recent Incident Reports</h2><p class="text-xs text-gray-500">Your submitted reports and their statuses</p></div><a href="brgy-incidents.html" class="text-xs font-bold text-brand hover:underline">See All</a></div>' +
          '<div class="overflow-x-auto"><table class="w-full text-left text-xs"><thead><tr class="text-gray-400 border-b border-gray-100 uppercase text-[10px] font-bold tracking-wider"><th class="pb-3 pl-2">Report</th><th class="pb-3">Priority</th><th class="pb-3 text-right pr-2">Status</th></tr></thead><tbody class="divide-y divide-gray-100">' +
          (ic.length ? ic.slice(0, 4).map(function (i) { return '<tr class="hover:bg-gray-50/50 transition"><td class="py-3.5 pl-2 font-bold text-[#0F2922]"><a href="brgy-incidents.html#' + i.id + '" class="hover:text-brand">' + esc(i.title) + '</a><p class="text-[11px] font-normal text-gray-400">' + esc(i.id) + ' &middot; ' + M.rel(i.at) + '</p></td><td class="py-3.5">' + M.risk(i.priority) + '</td><td class="py-3.5 text-right pr-2">' + U.incStatus(i.status) + '</td></tr>'; }).join('') : U.emptyRow(3, 'No reports submitted yet.')) + '</tbody></table></div></div>' +
        '<div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs"><div class="flex items-center justify-between mb-4"><h2 class="text-base font-bold text-[#0F2922]">Local Sensors</h2><a href="brgy-monitoring.html" class="text-xs font-bold text-brand hover:underline">Details</a></div><div class="space-y-3">' +
          myStations().map(function (s) { return '<div class="p-3 rounded-xl bg-gray-50"><div class="flex items-center justify-between gap-2"><p class="text-xs font-bold text-[#0F2922]">' + esc(s.name) + '</p>' + M.risk(M.stationRisk(s)) + '</div><div class="mt-2 text-xs">' + levelBar(s) + '</div></div>'; }).join('') +
          '</div><p class="text-[11px] text-gray-400 font-medium mt-4">' + NOTE_SIM + ' Thresholds are set by the System Administrator.</p></div>' +
      '</div>';
  }

  /* ======================================================== MONITORING */
  function monitoring() {
    var list = myStations(), w = worstStation(), al = mineAlerts().filter(isOpen);
    var rain = Math.max.apply(null, list.map(function (s) { return s.rain || 0; }));
    root.innerHTML = U.header('Disaster Monitoring', 'Flood conditions for Brgy. ' + esc(MY) + '. ' + NOTE_SIM) +
      '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">' +
        U.statCard('Local Flood Risk', 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z', M.stationRisk(w), M.risk(M.stationRisk(w)), 'Highest of ' + list.length + ' local sensors') +
        U.statCard('Highest Water Level', 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', w.level.toFixed(1) + ' m', '', esc(w.name)) +
        U.statCard('Sensors Online', 'M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728M9.172 15.828a4 4 0 010-5.656m5.656 0a4 4 0 010 5.656', list.filter(function (s) { return !s.offline; }).length + ' of ' + list.length, M.badge('Online', 'emerald')) +
        U.statCard('Rainfall', 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z', rain + ' mm/hr', '', 'Nearest gauge') +
      '</div>' +
      '<div class="' + U.CARD + ' overflow-hidden"><div class="p-5 border-b border-gray-100"><h3 class="text-xs font-extrabold uppercase tracking-wider text-gray-400">Sensors in Brgy. ' + esc(MY) + '</h3></div><div class="overflow-x-auto"><table class="w-full text-left text-xs"><thead><tr class="' + U.TH + '"><th class="py-3 px-6">Sensor</th><th class="py-3 px-4">Water Level</th><th class="py-3 px-4">Flood Risk</th><th class="py-3 px-4">Sensor Status</th><th class="py-3 px-4">Last Updated</th><th class="py-3 px-6 text-right">Actions</th></tr></thead><tbody class="divide-y divide-gray-100 text-gray-700">' +
        list.map(function (s) { return '<tr class="hover:bg-gray-50/50 transition"><td class="py-4 px-6 font-bold text-[#0F2922]">' + esc(s.name) + '<p class="text-[11px] font-normal text-gray-400">' + s.id + (s.note ? ' &middot; ' + esc(s.note) : '') + '</p></td><td class="py-4 px-4">' + levelBar(s) + '</td><td class="py-4 px-4">' + M.risk(M.stationRisk(s)) + '</td><td class="py-4 px-4">' + M.badge(s.offline ? 'Offline' : 'Online', s.offline ? 'gray' : 'emerald') + '</td><td class="py-4 px-4 text-gray-500">' + s.ping + ' min ago (simulated)</td><td class="py-4 px-6 text-right"><button type="button" class="' + U.BTN_G + '" data-act="s-view" data-id="' + s.id + '">View</button></td></tr>'; }).join('') +
      '</tbody></table></div><p class="px-6 py-3 border-t border-gray-100 text-[11px] text-gray-400">Sensor thresholds, hardware and data feeds are managed by the System Administrator and cannot be changed from this account.</p></div>' +
      '<div class="' + U.CARD + ' p-6"><h2 class="text-base font-bold text-[#0F2922] mb-4">Monitoring Alerts</h2><ul class="divide-y divide-gray-100 text-xs">' +
        (al.length ? al.map(function (a) { return '<li class="py-3 flex items-center justify-between gap-3"><div><p class="font-bold text-[#0F2922]">' + esc(a.id) + ' &middot; ' + esc(a.trigger) + '</p><p class="text-[11px] text-gray-400 mt-0.5">' + M.fmt(a.detectedAt) + '</p></div><div class="flex items-center gap-2 shrink-0">' + M.risk(a.risk) + '<a href="brgy-alerts.html#' + a.id + '" class="' + U.BTN_G + '">Open</a></div></li>'; }).join('') : '<li class="py-4 text-center text-gray-400">No active monitoring alerts for your barangay.</li>') + '</ul></div>';
    H['s-view'] = function (el) {
      var s = U.byId(M.STATIONS, el.getAttribute('data-id'));
      modal({ title: s.name, size: 'max-w-lg', actions: [{ label: 'Close', variant: 'primary' }], body: '<dl class="space-y-2">' +
        U.kv('Location', 'Brgy. ' + esc(s.brgy)) + U.kv('Water level', s.offline ? 'No signal' : s.level.toFixed(1) + ' m') + U.kv('Watch level', s.watch.toFixed(1) + ' m') + U.kv('Warning level', s.warn.toFixed(1) + ' m') + U.kv('Critical level', s.crit.toFixed(1) + ' m') +
        U.kv('Trend', s.trend) + U.kv('Rainfall', s.rain == null ? '-' : s.rain + ' mm/hr') + U.kv('Drainage', s.note || 'Normal') + U.kv('Flood risk', M.risk(M.stationRisk(s))) + U.kv('Sensor status', s.offline ? 'Offline' : 'Online') + U.kv('Last updated', s.ping + ' min ago (simulated)') + '</dl>' +
        '<p class="mt-3 text-[11px] text-gray-400">Read-only. ' + NOTE_SIM + '</p>' });
    };
  }

  /* ======================================================== ALERTS & VERIFICATION */
  var CONDITIONS = ['Flooding confirmed', 'Water rising, not yet flooding', 'Conditions normal', 'Unable to confirm'];
  function alertsPage() {
    var filter = 'All statuses';
    root.innerHTML = U.header('Alerts & Verification', 'Verify ground conditions and submit your findings to the MDRRMO Officer.') +
      '<div class="' + U.CARD + ' overflow-hidden"><div class="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3"><h3 class="text-xs font-extrabold uppercase tracking-wider text-gray-400">Alerts for Brgy. ' + esc(MY) + '</h3><select id="f-s" class="' + U.SEL + '" aria-label="Filter by status">' + U.opts(['All statuses'].concat(Object.keys(M.CSTAGE).map(function (k) { return M.CSTAGE[k][0]; })), filter) + '</select></div>' +
      '<div class="overflow-x-auto"><table class="w-full text-left text-xs"><thead><tr class="' + U.TH + '"><th class="py-3 px-6">Alert ID</th><th class="py-3 px-4">Alert Type</th><th class="py-3 px-4">Location</th><th class="py-3 px-4">Flood-Risk Level</th><th class="py-3 px-4">Date &amp; Time</th><th class="py-3 px-4">Verification Status</th><th class="py-3 px-6 text-right">Actions</th></tr></thead><tbody id="a-body" class="divide-y divide-gray-100 text-gray-700"></tbody></table></div></div>' +
      '<p class="text-[11px] text-gray-400">Your verification is one of two required steps. Only the MDRRMO Officer can give final approval, and only an approved alert can proceed to an evacuation SMS broadcast.</p>';
    function draw() {
      var l = mineAlerts().filter(function (a) { return filter === 'All statuses' || M.CSTAGE[a.stage][0] === filter; }).sort(function (a, b) { return new Date(b.detectedAt) - new Date(a.detectedAt); });
      $('#a-body').innerHTML = l.length ? l.map(function (a) {
        var act = M.needsVerification(a);
        return '<tr class="hover:bg-gray-50/50 transition"><td class="py-4 px-6 font-bold text-[#0F2922]">' + esc(a.id) + '</td><td class="py-4 px-4 text-gray-600">' + esc(alertType(a)) + '</td><td class="py-4 px-4 text-gray-600">Brgy. ' + esc(a.brgy) + '<p class="text-[11px] text-gray-400">' + esc(a.sensor.station) + '</p></td><td class="py-4 px-4">' + M.risk(a.risk) + '</td><td class="py-4 px-4 text-gray-500 whitespace-nowrap">' + M.fmt(a.detectedAt) + '</td><td class="py-4 px-4">' + M.cstage(a.stage) + '</td>' +
          '<td class="py-4 px-6 text-right"><button type="button" class="' + (act ? U.BTN_P : U.BTN_G) + '" data-act="a-open" data-id="' + a.id + '">' + (a.stage === 'more_info' ? 'Respond' : a.stage === 'in_progress' ? 'Continue' : act ? 'Verify' : 'View') + '</button></td></tr>';
      }).join('') : U.emptyRow(7, 'No alerts match this status.');
    }
    draw();
    $('#f-s').addEventListener('change', function (e) { filter = e.target.value; draw(); });
    H['a-open'] = function (el) { openAlert(el.getAttribute('data-id'), draw); };
    if (location.hash.length > 1) openAlert(decodeURIComponent(location.hash.slice(1)), draw);
  }

  function openAlert(id, redraw) {
    var a = U.byId(S.alerts, id);
    if (!a || a.brgy !== MY) return;
    var s = a.sensor, c = a.captain, editable = M.needsVerification(a), d = c.draft || {};
    var info = '<p class="mb-3">' + M.cstage(a.stage) + '</p>' +
      '<dl class="space-y-2">' + U.kv('Alert type', esc(alertType(a))) + U.kv('Location', 'Brgy. ' + esc(a.brgy)) + U.kv('Flood-risk level', M.risk(a.risk)) + U.kv('Detected', M.fmt(a.detectedAt)) + U.kv('Trigger', esc(a.trigger)) + '</dl>' +
      U.section('Sensor readings (simulated)', '<dl class="space-y-2">' + U.kv('Station', esc(s.station)) + U.kv('Water level', s.level.toFixed(1) + ' m') + U.kv('Warning / critical', s.warning.toFixed(1) + ' m / ' + s.critical.toFixed(1) + ' m') + U.kv('Rate of rise', esc(s.rise)) + U.kv('Rainfall', esc(s.rainfall)) + U.kv('Drainage', esc(s.drainage)) + '</dl>');
    var form = null, body;
    if (a.stage === 'more_info' && a.decision) info += U.section('Request from MDRRMO Officer', '<div class="bg-indigo-50 text-indigo-800 rounded-xl px-3 py-2 font-semibold">' + esc(a.decision.reason) + '<p class="text-[11px] font-normal text-indigo-500 mt-1">' + M.fmt(a.decision.at) + ' &middot; ' + esc(a.decision.by) + '</p></div>');
    if (editable) {
      var cond = d.condition || '', loc = d.location || ('Brgy. ' + a.brgy + ', ' + s.station), when = d.verifiedAt || localDT(new Date());
      form = B.mk('form', '', info + U.section('Ground-condition verification',
        '<label class="block mb-3"><span class="' + LABEL + '">Observed ground condition</span><select name="cond" required class="' + INPUT + '"><option value="">Select condition</option>' + CONDITIONS.map(function (o) { return '<option' + (o === cond ? ' selected' : '') + '>' + o + '</option>'; }).join('') + '</select></label>' +
        '<label class="block mb-3"><span class="' + LABEL + '">Confirmed affected location</span><input name="loc" required value="' + esc(loc) + '" class="' + INPUT + '"></label>' +
        '<div class="grid grid-cols-2 gap-3 mb-3"><label class="block"><span class="' + LABEL + '">Verified on (date and time)</span><input name="when" type="datetime-local" required value="' + when + '" class="' + INPUT + '"></label>' +
        '<label class="block"><span class="' + LABEL + '">Households affected (est.)</span><input name="hh" type="number" min="0" value="' + (d.households || '') + '" class="' + INPUT + '"></label></div>' +
        '<label class="block"><span class="' + LABEL + '">Observations and remarks</span><textarea name="obs" rows="3" class="' + INPUT + '" placeholder="Describe what you see on the ground">' + esc(d.findings || '') + '</textarea></label>') +
        '<p class="mt-3 text-[11px] text-gray-400">Submitting sends your findings to the MDRRMO Officer for final approval. It does not authorize an evacuation SMS.</p>');
      body = form;
    } else {
      var ro = '';
      if (c.findings) ro = U.section('Your submitted verification', '<dl class="space-y-2">' + U.kv('Status', 'Verification Submitted') + U.kv('Submitted', M.fmt(c.at)) + (c.condition ? U.kv('Ground condition', esc(c.condition)) : '') + (c.location ? U.kv('Confirmed location', esc(c.location)) : '') + (c.verifiedAt ? U.kv('Verified on site', M.fmt(c.verifiedAt)) : '') + (c.households ? U.kv('Households affected (est.)', M.num(c.households)) : '') + '</dl><div class="mt-2 bg-gray-50 rounded-xl px-3 py-2 text-[#0F2922]">' + esc(c.findings) + '</div>');
      if (a.decision && a.stage !== 'more_info') ro += U.section('MDRRMO Officer decision', '<dl class="space-y-2">' + U.kv('Decision', esc(a.decision.action)) + U.kv('Recorded', M.fmt(a.decision.at)) + '</dl><div class="mt-2 bg-gray-50 rounded-xl px-3 py-2 text-[#0F2922]">' + esc(a.decision.reason) + '</div>');
      if (a.stage === 'pending_mdrrm') ro += '<p class="mt-3 text-[11px] text-gray-400">Waiting for the MDRRMO Officer. You cannot approve or broadcast an evacuation alert.</p>';
      if (a.stage === 'approved') { var v = M.bcView(a); ro += U.section('SMS broadcast', '<dl class="space-y-2">' + U.kv('Delivery status', M.badge(v.label, v.tone)) + '</dl><p class="mt-2 text-[11px] text-gray-400">The MDRRMO Officer controls the SMS broadcast.</p>'); }
      body = info + ro;
    }
    var actions = [{ label: editable ? 'Cancel' : 'Close', variant: 'ghost' }];
    function read() { return { condition: form.cond.value, location: form.loc.value.trim(), verifiedAt: form.when.value, households: parseInt(form.hh.value, 10) || 0, findings: form.obs.value.trim() }; }
    if (editable) {
      actions.push({ label: 'Save progress', variant: 'ghost', onClick: function () {
        c.draft = read(); if (a.stage === 'awaiting_captain') a.stage = 'in_progress'; c.status = 'Verification in progress';
        M.save(); toast('Progress saved. Not yet submitted.', 'info'); redraw();
      } });
      actions.push({ label: 'Submit to MDRRMO Officer', variant: 'primary', onClick: function () {
        if (!form.reportValidity()) return false;
        if (!form.obs.value.trim()) { toast('Add your observations before submitting.', 'error'); return false; }
        var v = read(); c.draft = v;
        confirmDialog({ title: 'Submit verification?', message: 'Your findings for <strong>' + esc(a.id) + '</strong> go to the MDRRMO Officer for final approval. <strong>This does not authorize an evacuation SMS.</strong>', confirmLabel: 'Submit findings' }).then(function (ok) {
          if (!ok) { M.save(); return; }
          c.condition = v.condition; c.location = v.location; c.verifiedAt = new Date(v.verifiedAt).toISOString(); c.households = v.households; c.findings = v.findings;
          c.status = 'Submitted'; c.at = new Date().toISOString(); delete c.draft;
          a.stage = 'pending_mdrrm'; a.decision = null;
          M.addLog('Barangay verification', a.id, a.brgy, 'Verification submitted: ' + v.condition, CAP_NAME);
          M.save(); toast('Verification submitted to the MDRRMO Officer'); redraw();
        });
      } });
    }
    modal({ title: 'Alert ' + a.id, size: 'max-w-2xl', body: body, actions: actions });
  }

  /* ======================================================== RESIDENTS */
  function residents() {
    var f = { q: '', status: 'All statuses', assist: 'All', page: 1 }, PER = 10;
    var all = M.RESIDENTS.filter(function (r) { return r.brgy === MY; });
    root.innerHTML = U.header('Residents', 'Registered residents of Brgy. ' + esc(MY) + ' for emergency coordination. View only.') +
      '<div class="' + U.CARD + ' overflow-hidden"><div class="p-5 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3"><h3 class="text-xs font-extrabold uppercase tracking-wider text-gray-400">Resident Directory <span id="r-count" class="normal-case font-semibold text-gray-500 ml-2"></span></h3>' +
      '<div class="flex flex-wrap items-center gap-2"><input id="f-q" type="search" placeholder="Search name, ID or address" class="' + U.SEARCH + '" aria-label="Search residents"><select id="f-s" class="' + U.SEL + '">' + U.opts(['All statuses', 'Verified', 'Pending Verification', 'Inactive'], 'All statuses') + '</select><select id="f-a" class="' + U.SEL + '">' + U.opts(['All', 'Needs assistance', 'No assistance'], 'All') + '</select></div></div>' +
      '<div class="overflow-x-auto"><table class="w-full text-left text-xs"><thead><tr class="' + U.TH + '"><th class="py-3 px-6">Resident ID</th><th class="py-3 px-4">Full Name</th><th class="py-3 px-4">Address</th><th class="py-3 px-4">Contact Number</th><th class="py-3 px-4">Emergency Assistance</th><th class="py-3 px-4">Status</th><th class="py-3 px-6 text-right">Actions</th></tr></thead><tbody id="r-body" class="divide-y divide-gray-100 text-gray-700"></tbody></table></div>' +
      '<div class="p-4 border-t border-gray-100 flex items-center justify-between text-xs"><span id="r-range" class="text-gray-500 font-medium"></span><div class="flex gap-2"><button type="button" class="' + U.BTN_G + '" data-act="pg" data-d="-1">Previous</button><button type="button" class="' + U.BTN_G + '" data-act="pg" data-d="1">Next</button></div></div></div>' +
      '<p class="text-[11px] text-gray-400">Fictional placeholder records. Only residents of your assigned barangay are shown, and this account cannot create, edit or delete registrations.</p>';
    var tone = { 'Verified': 'emerald', 'Pending Verification': 'amber', 'Inactive': 'gray' };
    function list() {
      var q = f.q.toLowerCase();
      return all.filter(function (r) { return (f.status === 'All statuses' || r.status === f.status) && (f.assist === 'All' || (f.assist === 'Needs assistance') === (r.assist !== 'None')) && (!q || (r.name + ' ' + r.id + ' ' + r.addr).toLowerCase().indexOf(q) > -1); });
    }
    function draw() {
      var l = list(), pages = Math.max(1, Math.ceil(l.length / PER)); if (f.page > pages) f.page = pages;
      var s = (f.page - 1) * PER, part = l.slice(s, s + PER);
      $('#r-count').textContent = '(' + l.length + ' of ' + all.length + ')';
      $('#r-range').textContent = l.length ? 'Showing ' + (s + 1) + ' to ' + (s + part.length) + ' of ' + l.length : 'No results';
      $('#r-body').innerHTML = part.length ? part.map(function (r) {
        return '<tr class="hover:bg-gray-50/50 transition"><td class="py-4 px-6 font-bold text-[#0F2922]">' + r.id + '</td><td class="py-4 px-4 font-bold text-[#0F2922]">' + esc(r.name) + '</td><td class="py-4 px-4 text-gray-500">' + esc(r.addr) + '</td><td class="py-4 px-4 text-gray-600 whitespace-nowrap">' + r.phone + '</td><td class="py-4 px-4">' + (r.assist === 'None' ? '<span class="text-gray-400">None recorded</span>' : M.badge(r.assist, 'amber')) + '</td><td class="py-4 px-4">' + M.badge(r.status, tone[r.status]) + '</td><td class="py-4 px-6 text-right"><button type="button" class="' + U.BTN_G + '" data-act="r-view" data-id="' + r.id + '">View</button></td></tr>';
      }).join('') : U.emptyRow(7, 'No residents match your filters.');
    }
    draw();
    $('#f-q').addEventListener('input', function (e) { f.q = e.target.value; f.page = 1; draw(); });
    $('#f-s').addEventListener('change', function (e) { f.status = e.target.value; f.page = 1; draw(); });
    $('#f-a').addEventListener('change', function (e) { f.assist = e.target.value; f.page = 1; draw(); });
    H.pg = function (el) { f.page = Math.max(1, f.page + parseInt(el.getAttribute('data-d'), 10)); draw(); };
    H['r-view'] = function (el) {
      var r = U.byId(all, el.getAttribute('data-id'));
      modal({ title: r.name, size: 'max-w-lg', actions: [{ label: 'Close', variant: 'primary' }], body: '<dl class="space-y-2">' + U.kv('Resident ID', r.id) + U.kv('Address', esc(r.addr)) + U.kv('Contact number', r.phone) + U.kv('Household size', r.household + ' members') + U.kv('Emergency assistance', r.assist === 'None' ? 'None recorded' : esc(r.assist)) + U.kv('Emergency contact', esc(r.contactName) + '<br><span class="text-gray-500 font-medium">' + r.contactPhone + '</span>') + U.kv('Assigned center', esc(r.center)) + U.kv('Registration status', M.badge(r.status, tone[r.status])) + U.kv('Registered', r.registered) + '</dl><p class="mt-3 text-[11px] text-gray-400">View only.</p>' });
    };
  }

  /* ======================================================== INCIDENT REPORTS */
  var TYPES = ['Flooding', 'Blocked drainage or waterway', 'Damaged infrastructure', 'Residents requiring emergency assistance', 'Other disaster-related incident'];
  function incidents() {
    root.innerHTML = U.header('Incident Reports', 'Submit field reports to the MDRRMO Officer and track their status.') +
      '<div class="' + U.CARD + ' p-6"><h3 class="text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-4">Submit a New Report</h3><form id="ir-form" class="grid grid-cols-1 md:grid-cols-2 gap-4">' +
        '<label class="block md:col-span-2"><span class="' + LABEL + '">Report title</span><input name="title" required class="' + INPUT + '" placeholder="Short summary of the issue"></label>' +
        '<label class="block"><span class="' + LABEL + '">Incident type</span><select name="type" class="' + INPUT + '">' + U.opts(TYPES, TYPES[0]) + '</select></label>' +
        '<label class="block"><span class="' + LABEL + '">Priority</span><select name="pri" class="' + INPUT + '">' + U.opts(['Low', 'Medium', 'High', 'Critical'], 'Medium') + '</select></label>' +
        '<label class="block"><span class="' + LABEL + '">Location</span><input name="loc" required class="' + INPUT + '" placeholder="Street, purok or landmark in Brgy. ' + esc(MY) + '"></label>' +
        '<label class="block"><span class="' + LABEL + '">Date and time</span><input name="when" type="datetime-local" required value="' + localDT(new Date()) + '" class="' + INPUT + '"></label>' +
        '<label class="block md:col-span-2"><span class="' + LABEL + '">Description</span><textarea name="desc" rows="3" required class="' + INPUT + '" placeholder="What happened and what is needed?"></textarea></label>' +
        '<div class="md:col-span-2 flex justify-end"><button type="submit" class="px-4 py-2 rounded-xl text-xs font-bold bg-brand hover:bg-brandDark text-white transition">Submit Report</button></div></form></div>' +
      '<div class="' + U.CARD + ' overflow-hidden"><div class="p-5 border-b border-gray-100"><h3 class="text-xs font-extrabold uppercase tracking-wider text-gray-400">My Submitted Reports</h3></div><div class="overflow-x-auto"><table class="w-full text-left text-xs"><thead><tr class="' + U.TH + '"><th class="py-3 px-6">Report ID</th><th class="py-3 px-4">Report Title</th><th class="py-3 px-4">Incident Type</th><th class="py-3 px-4">Location</th><th class="py-3 px-4">Date Submitted</th><th class="py-3 px-4">Priority</th><th class="py-3 px-4">Status</th><th class="py-3 px-6 text-right">Actions</th></tr></thead><tbody id="i-body" class="divide-y divide-gray-100 text-gray-700"></tbody></table></div></div>';
    function draw() {
      var l = mineIncidents();
      $('#i-body').innerHTML = l.length ? l.map(function (i) {
        var act = i.status === 'Action Required';
        return '<tr class="hover:bg-gray-50/50 transition"><td class="py-4 px-6 font-bold text-[#0F2922]">' + i.id + '</td><td class="py-4 px-4 font-bold text-[#0F2922]">' + esc(i.title) + '</td><td class="py-4 px-4 text-gray-600">' + esc(i.type) + '</td><td class="py-4 px-4 text-gray-500">' + esc(i.location) + '</td><td class="py-4 px-4 text-gray-500 whitespace-nowrap">' + M.fmt(i.at) + '</td><td class="py-4 px-4">' + M.risk(i.priority) + '</td><td class="py-4 px-4">' + U.incStatus(i.status) + '</td><td class="py-4 px-6 text-right"><button type="button" class="' + (act ? U.BTN_P : U.BTN_G) + '" data-act="i-open" data-id="' + i.id + '">' + (act ? 'Respond' : 'View') + '</button></td></tr>';
      }).join('') : U.emptyRow(8, 'No reports submitted yet.');
    }
    draw();
    $('#ir-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var f = e.target, max = 0;
      S.incidents.forEach(function (i) { if (/^IR-2611-/.test(i.id)) max = Math.max(max, parseInt(i.id.slice(-3), 10)); });
      var id = 'IR-2611-' + ('00' + (max + 1)).slice(-3);
      S.incidents.push({ id: id, title: f.title.value.trim(), brgy: MY, by: CAP_NAME, at: new Date(f.when.value).toISOString(), priority: f.pri.value, status: 'Submitted', type: f.type.value, location: f.loc.value.trim(), desc: f.desc.value.trim(), remarks: [], follow: [], responses: [] });
      M.addLog('Incident report', id, MY, 'Report submitted: ' + f.title.value.trim(), CAP_NAME);
      M.save(); toast('Report ' + id + ' submitted to the MDRRMO Officer');
      f.reset(); f.when.value = localDT(new Date()); draw();
    });
    H['i-open'] = function (el) { openIncident(el.getAttribute('data-id'), draw); };
    if (location.hash.length > 1) openIncident(decodeURIComponent(location.hash.slice(1)), draw);
  }
  function openIncident(id, redraw) {
    var i = U.byId(S.incidents, id);
    if (!i || i.brgy !== MY) return;
    var hist = function (arr) { return arr.length ? '<ul class="space-y-2">' + arr.map(function (x) { return '<li class="bg-gray-50 rounded-xl px-3 py-2"><p class="text-[#0F2922]">' + esc(x.text) + '</p><p class="text-[11px] text-gray-400 mt-0.5">' + M.fmt(x.at) + (x.by ? ' &middot; ' + esc(x.by) : '') + '</p></li>'; }).join('') + '</ul>' : '<p class="text-gray-400">None yet.</p>'; };
    var need = i.status === 'Action Required';
    var form = B.mk('form', '', '<dl class="space-y-2">' + U.kv('Report ID', i.id) + U.kv('Status', U.incStatus(i.status)) + U.kv('Incident type', esc(i.type)) + U.kv('Location', esc(i.location)) + U.kv('Priority', M.risk(i.priority)) + U.kv('Date submitted', M.fmt(i.at)) + '</dl>' +
      '<div class="mt-2 bg-gray-50 rounded-xl px-3 py-2 text-[#0F2922]">' + esc(i.desc) + '</div>' +
      U.section('Remarks from MDRRMO Officer', hist(i.remarks)) + U.section('Follow-up actions', hist(i.follow)) + (i.responses.length ? U.section('Your responses', hist(i.responses)) : '') +
      (need ? '<div class="mt-4 pt-4 border-t border-gray-100"><label class="block"><span class="' + LABEL + '">Your response</span><textarea name="resp" rows="3" required class="' + INPUT + '" placeholder="Provide the information requested"></textarea></label></div>' : ''));
    var actions = [{ label: 'Close', variant: 'ghost' }];
    if (need) actions.push({ label: 'Send response', variant: 'primary', onClick: function () {
      if (!form.reportValidity()) return false;
      i.responses.push({ at: new Date().toISOString(), by: CAP_NAME, text: form.resp.value.trim() });
      i.status = 'Under Review';
      M.addLog('Incident update', i.id, i.brgy, 'Captain responded to request, status set to Under Review', CAP_NAME);
      M.save(); toast('Response sent to the MDRRMO Officer'); redraw();
    } });
    modal({ title: i.title, size: 'max-w-2xl', body: form, actions: actions });
  }

  /* ======================================================== EVACUATION CENTERS */
  function centers() {
    var tone = { Open: 'emerald', Standby: 'blue', Full: 'red', Closed: 'gray' };
    var l = S.centers.slice().sort(function (a, b) { return (a.brgy === MY ? 0 : 1) - (b.brgy === MY ? 0 : 1); });
    root.innerHTML = U.header('Evacuation Centers', 'Center availability for local coordination. View only.') +
      '<div class="' + U.CARD + ' overflow-hidden"><div class="overflow-x-auto"><table class="w-full text-left text-xs"><thead><tr class="' + U.TH + '"><th class="py-3 px-6">Evacuation Center</th><th class="py-3 px-4">Location</th><th class="py-3 px-4">Total Capacity</th><th class="py-3 px-4">Current Occupancy</th><th class="py-3 px-4">Available Capacity</th><th class="py-3 px-6">Status</th></tr></thead><tbody class="divide-y divide-gray-100 text-gray-700">' +
      l.map(function (c) { var avail = c.status === 'Closed' ? 0 : Math.max(0, c.cap - c.occ);
        return '<tr class="hover:bg-gray-50/50 transition"><td class="py-4 px-6 font-bold text-[#0F2922]">' + esc(c.name) + (c.brgy === MY ? '<p class="text-[11px] font-normal text-brand">Your barangay</p>' : '') + '<p class="text-[11px] font-normal text-gray-400">' + esc(c.contact) + ' &middot; ' + c.phone + '</p></td><td class="py-4 px-4 text-gray-600">Brgy. ' + esc(c.brgy) + '</td><td class="py-4 px-4">' + M.num(c.cap) + '</td><td class="py-4 px-4">' + M.num(c.occ) + '</td><td class="py-4 px-4 font-bold text-[#0F2922]">' + M.num(avail) + '</td><td class="py-4 px-6">' + M.badge(c.status, tone[c.status]) + '</td></tr>'; }).join('') +
      '</tbody></table></div></div><p class="text-[11px] text-gray-400">Status and occupancy are updated by the MDRRMO Officer.</p>';
  }

  var PAGES = { dashboard: dashboard, monitoring: monitoring, alerts: alertsPage, residents: residents, incidents: incidents, centers: centers };
  if (PAGES[page]) PAGES[page]();
})();
