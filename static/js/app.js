/* Bantay Baha at Basura - shared UI behaviour (loaded on every app page) */
(function () {
  'use strict';

  var PAGE = decodeURIComponent(location.pathname.split('/').pop() || 'index.html');

  /* ---------- helpers ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function mk(tag, cls, html) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (html != null) el.innerHTML = html;
    return el;
  }
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) {} },
    keys: function () { try { return Object.keys(localStorage); } catch (e) { return []; } }
  };

  /* ---------- toast ---------- */
  function toast(msg, type) {
    var host = $('#bbah-toasts');
    if (!host) {
      host = mk('div', 'fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none');
      host.id = 'bbah-toasts';
      host.setAttribute('aria-live', 'polite');
      document.body.appendChild(host);
    }
    var colors = { success: 'bg-emerald-600', error: 'bg-red-600', info: 'bg-gray-800' };
    var el = mk('div', 'pointer-events-auto ' + (colors[type || 'success'] || colors.info) +
      ' text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-lg transition-all duration-300 opacity-0 translate-y-2 max-w-xs');
    el.textContent = msg;
    host.appendChild(el);
    requestAnimationFrame(function () { el.classList.remove('opacity-0', 'translate-y-2'); });
    setTimeout(function () {
      el.classList.add('opacity-0', 'translate-y-2');
      setTimeout(function () { el.remove(); }, 300);
    }, 3200);
  }

  /* ---------- modal ---------- */
  var BTN = 'px-4 py-2 rounded-xl text-xs font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 ';
  var VARIANT = {
    primary: 'bg-brand hover:bg-brandDark text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    ghost: 'bg-gray-100 hover:bg-gray-200 text-gray-700'
  };

  function modal(opts) {
    var prev = document.activeElement;
    var ov = mk('div', 'fixed inset-0 z-[90] bg-black/50 flex items-center justify-center p-4');
    var box = mk('div', 'bg-white rounded-2xl shadow-2xl w-full ' + (opts.size || 'max-w-md') + ' max-h-[90vh] overflow-y-auto');
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-labelledby', 'bbah-modal-title');

    var head = mk('div', 'px-6 pt-6 pb-2');
    var h = mk('h2', 'text-base font-extrabold text-[#0F2922]');
    h.id = 'bbah-modal-title';
    h.textContent = opts.title;
    head.appendChild(h);

    var body = mk('div', 'px-6 py-3 text-xs text-gray-600 leading-relaxed');
    if (typeof opts.body === 'string') body.innerHTML = opts.body;
    else if (opts.body) body.appendChild(opts.body);

    var foot = mk('div', 'px-6 pb-6 pt-3 flex justify-end gap-2');
    var closed = false;
    var api = { el: box, buttons: [] };

    function close() {
      if (closed) return;
      closed = true;
      document.removeEventListener('keydown', onKey, true);
      ov.remove();
      if (!$('.bbah-overlay')) document.body.classList.remove('overflow-hidden');
      if (opts.onClose) opts.onClose();
      if (prev && prev.focus) { try { prev.focus(); } catch (e) {} }
    }
    api.close = close;

    (opts.actions || []).forEach(function (a) {
      var b = mk('button', BTN + (VARIANT[a.variant] || VARIANT.ghost));
      b.type = 'button';
      b.textContent = a.label;
      b.addEventListener('click', function () {
        var r = a.onClick ? a.onClick(api) : undefined;
        if (r !== false) close();
      });
      foot.appendChild(b);
      api.buttons.push(b);
    });

    function onKey(e) {
      if (e.key === 'Escape') { e.stopPropagation(); close(); return; }
      if (e.key === 'Tab') {
        var f = $$('button, input, select, textarea, a[href]', box).filter(function (x) { return !x.disabled; });
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener('keydown', onKey, true);
    ov.addEventListener('mousedown', function (e) { if (e.target === ov) close(); });

    ov.className += ' bbah-overlay';
    box.appendChild(head); box.appendChild(body); box.appendChild(foot);
    ov.appendChild(box);
    document.body.appendChild(ov);
    document.body.classList.add('overflow-hidden');
    var first = $('input:not([type=hidden]), select, textarea', box) || foot.querySelector('button');
    if (first) first.focus();
    return api;
  }

  function confirmDialog(o) {
    return new Promise(function (resolve) {
      var done = false;
      function fin(v) { if (!done) { done = true; resolve(v); } }
      modal({
        title: o.title,
        body: '<p>' + o.message + '</p>',
        onClose: function () { fin(false); },
        actions: [
          { label: o.cancelLabel || 'Cancel', variant: 'ghost', onClick: function () { fin(false); } },
          { label: o.confirmLabel || 'Confirm', variant: o.danger ? 'danger' : 'primary', onClick: function () { fin(true); } }
        ]
      });
    });
  }

  function downloadFile(name, text, mime) {
    var blob = new Blob([text], { type: mime || 'text/plain' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 0);
  }
  function csvCell(v) { return '"' + String(v).replace(/"/g, '""') + '"'; }
  function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'file'; }

  /* ---------- sign out ---------- */
  function signOut() {
    confirmDialog({
      title: 'Sign out?',
      message: 'You will be signed out of Bantay Baha at Basura on this device.',
      confirmLabel: 'Sign out',
      danger: true
    }).then(function (ok) {
      if (!ok) return;
      store.del('bbah-session');
      toast('Signed out', 'info');
      setTimeout(function () { location.href = 'LOGIN.html'; }, 400);
    });
  }

  /* ---------- help / report a problem ---------- */
  function openHelp() {
    modal({
      title: 'Help & Support',
      body: '<p class="mb-3">Need a hand? Reach your system administrator or the MDRRMO operations desk.</p>' +
        '<dl class="space-y-2">' +
        '<div class="flex justify-between bg-gray-50 rounded-xl px-3 py-2"><dt class="font-bold text-gray-500">Hotline</dt><dd class="font-semibold text-[#0F2922]">Placeholder</dd></div>' +
        '<div class="flex justify-between bg-gray-50 rounded-xl px-3 py-2"><dt class="font-bold text-gray-500">Email</dt><dd class="font-semibold text-[#0F2922]">Placeholder</dd></div>' +
        '<div class="flex justify-between bg-gray-50 rounded-xl px-3 py-2"><dt class="font-bold text-gray-500">Office hours</dt><dd class="font-semibold text-[#0F2922]">Placeholder</dd></div></dl>',
      actions: [{ label: 'Close', variant: 'primary' }]
    });
  }

  var INPUT = 'w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-[#0F2922] bg-white focus:outline-none focus:ring-2 focus:ring-brand/40';
  var LABEL = 'block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1';

  function reportProblem() {
    var form = mk('form', '', '<label class="block mb-3"><span class="' + LABEL + '">What is it about?</span>' +
      '<select name="cat" class="' + INPUT + '"><option>Bug or error</option><option>Wrong or missing data</option><option>Sensor or hardware</option><option>Other</option></select></label>' +
      '<label class="block"><span class="' + LABEL + '">Describe the problem</span>' +
      '<textarea name="msg" rows="4" required class="' + INPUT + '" placeholder="What happened, and where?"></textarea></label>');
    var m = modal({
      title: 'Report a Problem', body: form,
      actions: [
        { label: 'Cancel', variant: 'ghost' },
        { label: 'Submit report', variant: 'primary', onClick: function () {
          if (!form.reportValidity()) return false;
          var list = store.get('bbah-problem-reports', []);
          list.push({ page: PAGE, category: form.cat.value, message: form.msg.value.trim(), at: new Date().toISOString() });
          store.set('bbah-problem-reports', list);
          toast('Report submitted. Thank you.');
        } }
      ]
    });
    form.addEventListener('submit', function (e) { e.preventDefault(); m.buttons[1].click(); });
  }

  /* ---------- table row engine ---------- */
  var OPTIONS = {
    'status level': ['Low', 'Medium', 'High', 'Critical'],
    'status': ['Active', 'Away', 'Revoked'],
    'telemetry status': ['Optimal Flow', 'Clog Warning', 'Critical Rise', 'Offline'],
    'access role': ['Provincial Head', 'Municipal Officer', 'Barangay Captain', 'Telemetry Technician']
  };
  var ENTITY = { 'reports&logs.html': 'report log', 'settings-hardware.html': 'sensor node', 'settings-users.html': 'user' };
  var ADD_DEFAULTS = { 'last ping': 'Just now' };

  function tone(v) {
    v = String(v).toLowerCase();
    if (/critical|revoked|offline/.test(v)) return 'red';
    if (/high|clog/.test(v)) return 'orange';
    if (/medium|away|warning/.test(v)) return 'yellow';
    if (/low|optimal|active|info/.test(v)) return 'emerald';
    return 'gray';
  }
  function setBadge(el, v) {
    var keep = el.className.split(/\s+/).filter(function (c) {
      return c && !/^(bg|text)-(red|orange|amber|yellow|emerald|green|gray|blue)-\d+$/.test(c);
    });
    var t = tone(v);
    el.className = keep.join(' ') + ' bg-' + t + '-100 text-' + t + '-800';
    el.textContent = v;
  }
  function titleNode(td) {
    for (var i = 0; i < td.childNodes.length; i++) {
      var n = td.childNodes[i];
      if (n.nodeType === 3 && n.nodeValue.trim()) return n;
    }
    return null;
  }

  function rowFields(table, tr) {
    var heads = $$('thead th', table).map(function (th) { return th.textContent.trim(); });
    var out = [];
    [].slice.call(tr.children).forEach(function (td, i) {
      if (td.querySelector('button')) return;
      var head = heads[i] || ('Field ' + (i + 1));
      var badge = td.querySelector('span[class*="rounded"]');
      var p = td.querySelector('p');
      if (badge && !p && td.textContent.trim() === badge.textContent.trim()) {
        out.push({ td: td, kind: 'badge', label: head, value: badge.textContent.trim(), options: OPTIONS[head.toLowerCase()] });
      } else if (p) {
        var parts = head.split('/').map(function (s) { return s.trim(); });
        var tn = titleNode(td);
        out.push({ td: td, kind: 'title', label: parts[0] || head, value: tn ? tn.nodeValue.trim() : '' });
        out.push({ td: td, kind: 'desc', label: parts[1] || 'Description', value: p.textContent.trim() });
      } else {
        out.push({ td: td, kind: 'text', label: head, value: td.textContent.trim(), options: OPTIONS[head.toLowerCase()] });
      }
    });
    return out;
  }

  function applyFields(fields, vals) {
    fields.forEach(function (f, i) {
      var v = vals[i];
      if (f.kind === 'badge') setBadge(f.td.querySelector('span[class*="rounded"]'), v);
      else if (f.kind === 'title') { var n = titleNode(f.td); if (n) n.nodeValue = '\n' + v + '\n'; }
      else if (f.kind === 'desc') f.td.querySelector('p').textContent = v;
      else f.td.textContent = v;
    });
  }

  function fieldHTML(f, i, value, readonly) {
    var name = 'f' + i;
    var html = '<label class="block mb-3"><span class="' + LABEL + '">' + esc(f.label) + '</span>';
    if (readonly) return html + '<span class="block text-xs font-semibold text-[#0F2922] bg-gray-50 rounded-xl px-3 py-2">' + esc(value) + '</span></label>';
    if (f.options) {
      var opts = f.options.slice();
      if (value && opts.indexOf(value) < 0) opts.unshift(value);
      html += '<select name="' + name + '" class="' + INPUT + '">' + opts.map(function (o) {
        return '<option' + (o === value ? ' selected' : '') + '>' + esc(o) + '</option>';
      }).join('') + '</select>';
    } else {
      html += '<input name="' + name + '" required value="' + esc(value) + '" placeholder="Placeholder" class="' + INPUT + '">';
    }
    return html + '</label>';
  }

  function formValues(form, n) {
    var v = [];
    for (var i = 0; i < n; i++) v.push(form.elements['f' + i].value.trim());
    return v;
  }

  function persist(table) {
    var tb = table.tBodies[0];
    if (tb) store.set('bbah-table-' + PAGE, tb.innerHTML);
  }
  function emptyRow(table) {
    var cols = $$('thead th', table).length || 1;
    return '<tr data-empty><td colspan="' + cols + '" class="py-8 text-center text-xs text-gray-400">No records yet.</td></tr>';
  }
  function crudTable() {
    return $$('table').filter(function (t) { return t.querySelector('[data-action]'); })[0] || null;
  }

  function rowAction(action, btn) {
    var tr = btn.closest('tr');
    var table = btn.closest('table');
    var fields = rowFields(table, tr);
    var entity = ENTITY[PAGE] || 'record';
    var name = (fields[0] && fields[0].value) || entity;

    if (action === 'view') {
      var dl = fields.map(function (f, i) { return fieldHTML(f, i, f.value, true); }).join('');
      modal({ title: 'View ' + entity, body: dl, actions: [{ label: 'Close', variant: 'primary' }] });
    }

    else if (action === 'edit') {
      var form = mk('form', '', fields.map(function (f, i) { return fieldHTML(f, i, f.value); }).join(''));
      var m = modal({
        title: 'Edit ' + entity, body: form,
        actions: [
          { label: 'Cancel', variant: 'ghost' },
          { label: 'Save changes', variant: 'primary', onClick: function () {
            if (!form.reportValidity()) return false;
            applyFields(fields, formValues(form, fields.length));
            persist(table);
            toast('Changes saved');
          } }
        ]
      });
      form.addEventListener('submit', function (e) { e.preventDefault(); m.buttons[1].click(); });
    }

    else if (action === 'configure') {
      var cfg = {};
      try { cfg = JSON.parse(tr.getAttribute('data-config') || '{}'); } catch (e) {}
      var f2 = mk('form', '', fields.filter(function (f) { return f.kind === 'text'; }).map(function (f) {
        return fieldHTML(f, fields.indexOf(f), f.value);
      }).join('') +
        '<label class="block mb-3"><span class="' + LABEL + '">Polling interval</span><select name="poll" class="' + INPUT + '">' +
        ['1 minute', '5 minutes', '15 minutes'].map(function (o) { return '<option' + (o === (cfg.poll || '5 minutes') ? ' selected' : '') + '>' + o + '</option>'; }).join('') + '</select></label>' +
        '<label class="block mb-3"><span class="' + LABEL + '">Alert when level reaches</span><select name="level" class="' + INPUT + '">' +
        OPTIONS['status level'].map(function (o) { return '<option' + (o === (cfg.level || 'High') ? ' selected' : '') + '>' + o + '</option>'; }).join('') + '</select></label>' +
        '<label class="flex items-center gap-2 font-semibold text-[#0F2922]"><input type="checkbox" name="sms" class="w-4 h-4 accent-brand"' + (cfg.sms === false ? '' : ' checked') + '> Send SMS when triggered</label>');
      var m2 = modal({
        title: 'Configure ' + name, body: f2,
        actions: [
          { label: 'Cancel', variant: 'ghost' },
          { label: 'Save configuration', variant: 'primary', onClick: function () {
            if (!f2.reportValidity()) return false;
            fields.forEach(function (f, i) {
              if (f.kind === 'text' && f2.elements['f' + i]) f.td.textContent = f2.elements['f' + i].value.trim();
            });
            tr.setAttribute('data-config', JSON.stringify({ poll: f2.poll.value, level: f2.level.value, sms: f2.sms.checked }));
            persist(table);
            toast('Node configuration saved');
          } }
        ]
      });
      f2.addEventListener('submit', function (e) { e.preventDefault(); m2.buttons[1].click(); });
    }

    else if (action === 'delete') {
      confirmDialog({
        title: 'Delete ' + entity + '?',
        message: 'This will permanently remove <strong>' + esc(name) + '</strong>. This cannot be undone.',
        confirmLabel: 'Delete', danger: true
      }).then(function (ok) {
        if (!ok) return;
        tr.style.transition = 'opacity .25s';
        tr.style.opacity = '0';
        setTimeout(function () {
          var tb = tr.parentNode;
          tr.remove();
          if (!tb.querySelector('tr')) tb.innerHTML = emptyRow(table);
          persist(table);
          toast(entity.charAt(0).toUpperCase() + entity.slice(1) + ' deleted');
        }, 250);
      });
    }

    else if (action === 'revoke') {
      if (/^dylan concepcion$/i.test(name)) { toast("You can't revoke your own access.", 'error'); return; }
      confirmDialog({
        title: 'Revoke access?',
        message: '<strong>' + esc(name) + '</strong> will no longer be able to sign in. You can restore access later.',
        confirmLabel: 'Revoke access', danger: true
      }).then(function (ok) {
        if (!ok) return;
        var sf = fields.filter(function (f) { return f.kind === 'badge'; })[0];
        if (sf) setBadge(sf.td.querySelector('span[class*="rounded"]'), 'Revoked');
        btn.textContent = 'Restore';
        btn.setAttribute('data-action', 'restore');
        btn.className = btn.className.replace('bg-red-50 hover:bg-red-100 text-red-600', 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700');
        persist(table);
        toast('Access revoked');
      });
    }

    else if (action === 'restore') {
      var sf2 = fields.filter(function (f) { return f.kind === 'badge'; })[0];
      if (sf2) setBadge(sf2.td.querySelector('span[class*="rounded"]'), 'Active');
      btn.textContent = 'Revoke';
      btn.setAttribute('data-action', 'revoke');
      btn.className = btn.className.replace('bg-emerald-50 hover:bg-emerald-100 text-emerald-700', 'bg-red-50 hover:bg-red-100 text-red-600');
      persist(table);
      toast('Access restored');
    }

    else if (action === 'download') {
      var head = fields.map(function (f) { return csvCell(f.label); }).join(',');
      var row = fields.map(function (f) { return csvCell(f.value); }).join(',');
      downloadFile(slug(name) + '.csv', head + '\n' + row + '\n', 'text/csv');
      toast('Download started', 'info');
    }
  }

  function addRow() {
    var table = crudTable();
    if (!table) return;
    var tb = table.tBodies[0];
    var entity = ENTITY[PAGE] || 'record';
    var tpl = table.getAttribute('data-row-tpl');
    if (!tpl) return;
    var holder = document.createElement('table');
    holder.innerHTML = '<tbody>' + tpl + '</tbody>';
    var sample = holder.querySelector('tr');
    var fields = rowFields(table, sample);
    var form = mk('form', '', fields.map(function (f, i) {
      var dflt = f.options ? f.options[0] : (ADD_DEFAULTS[f.label.toLowerCase()] || '');
      return fieldHTML(f, i, dflt);
    }).join(''));
    var m = modal({
      title: 'Add new ' + entity, body: form,
      actions: [
        { label: 'Cancel', variant: 'ghost' },
        { label: 'Add ' + entity, variant: 'primary', onClick: function () {
          if (!form.reportValidity()) return false;
          applyFields(fields, formValues(form, fields.length));
          var empty = tb.querySelector('tr[data-empty]');
          if (empty) empty.remove();
          tb.appendChild(sample);
          persist(table);
          toast(entity.charAt(0).toUpperCase() + entity.slice(1) + ' added');
        } }
      ]
    });
    form.addEventListener('submit', function (e) { e.preventDefault(); m.buttons[1].click(); });
  }

  function initTables() {
    var table = crudTable();
    if (!table || !table.tBodies[0]) return;
    var tb = table.tBodies[0];
    var last = tb.querySelector('tr:last-child');
    if (last) table.setAttribute('data-row-tpl', last.outerHTML);
    var saved = store.get('bbah-table-' + PAGE, null);
    if (saved) tb.innerHTML = saved;
  }

  /* ---------- settings: save + toggles + test ping + exports ---------- */
  function initToggles() {
    var boxes = $$('main input[type="checkbox"]').filter(function (b) { return !b.closest('#prefs-form'); });
    var saved = store.get('bbah-toggles-' + PAGE, null);
    if (saved) boxes.forEach(function (b, i) { if (typeof saved[i] === 'boolean') b.checked = saved[i]; });
  }
  function saveSettings(btn) {
    var boxes = $$('main input[type="checkbox"]');
    store.set('bbah-toggles-' + PAGE, boxes.map(function (b) { return b.checked; }));
    var t = crudTable();
    if (t) persist(t);
    toast((btn.textContent.indexOf('Hardware') > -1 ? 'Hardware' : 'Integration') + ' changes saved');
  }
  function testPing(btn) {
    var orig = btn.innerHTML;
    btn.disabled = true;
    btn.classList.add('opacity-60', 'cursor-wait');
    btn.textContent = 'Pinging...';
    setTimeout(function () {
      btn.disabled = false;
      btn.classList.remove('opacity-60', 'cursor-wait');
      btn.innerHTML = orig;
      toast('Handshake successful. Response time: Placeholder');
    }, 1200);
  }
  function exportLogs() {
    var table = $('main table');
    if (!table) return;
    var rows = $$('tr', table).filter(function (r) { return !r.hasAttribute('data-empty'); }).map(function (r) {
      return [].map.call(r.children, function (c) { return csvCell(c.textContent.replace(/\s+/g, ' ').trim()); }).join(',');
    });
    downloadFile('system-audit-logs.csv', rows.join('\n') + '\n', 'text/csv');
    toast('Diagnostic logs exported', 'info');
  }

  /* ---------- alerts page ---------- */
  function alertCards() { return $$('[class*="border-l-[6px]"]').filter(function (c) { return c.querySelector('button[data-action]'); }); }
  function cardLevel(card) {
    var m = card.textContent.match(/(Critical|High|Medium|Low) Level/);
    return m ? m[1].toLowerCase() : '';
  }
  function filterAlerts(btn) {
    var level = btn.getAttribute('data-level') || 'all';
    var btns = $$('[data-action="alert-filter"]');
    var active = btns.filter(function (b) { return b.className.indexOf('bg-brand') > -1; })[0];
    var inactive = btns.filter(function (b) { return b !== active; })[0];
    if (active && inactive && btn !== active) {
      var aCls = active.className, iCls = inactive.className;
      btns.forEach(function (b) { b.className = (b === btn) ? aCls : iCls; b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
    }
    var shown = 0;
    alertCards().forEach(function (c) {
      var ok = level === 'all' || cardLevel(c) === level;
      c.style.display = ok ? '' : 'none';
      if (ok) shown++;
    });
    var msg = $('#bbah-alert-empty');
    if (!shown) {
      if (!msg) {
        msg = mk('div', 'bg-white p-10 rounded-2xl border border-dashed border-gray-200 text-center text-xs text-gray-400 font-semibold', 'No alerts at this level.');
        msg.id = 'bbah-alert-empty';
        var cs = alertCards();
        cs[cs.length - 1].parentNode.appendChild(msg);
      }
      msg.style.display = '';
    } else if (msg) msg.style.display = 'none';
  }
  function pushAlert(btn) {
    var card = btn.closest('[class*="border-l-[6px]"]');
    var cap = card && card.querySelector('strong') ? card.querySelector('strong').textContent : 'the Barangay Captain';
    confirmDialog({
      title: 'Push alert to Barangay Captain?',
      message: 'This sends the alert to <strong>' + esc(cap) + '</strong> for local approval.',
      confirmLabel: 'Push alert'
    }).then(function (ok) {
      if (!ok) return;
      var st = $$('span', card).filter(function (s) { return /^Status:/.test(s.textContent.trim()); })[0];
      if (st) st.textContent = 'Status: Pushed to Barangay Captain';
      btn.disabled = true;
      btn.classList.add('opacity-60', 'cursor-not-allowed');
      btn.textContent = 'Pushed';
      toast('Alert pushed to Barangay Captain');
    });
  }
  function sendNotice(btn) {
    var card = btn.closest('[class*="border-l-[6px]"]');
    var st = card && $$('span', card).filter(function (s) { return /^Status:/.test(s.textContent.trim()); })[0];
    if (st) st.textContent = 'Status: Info Notice Sent';
    btn.disabled = true;
    btn.classList.add('opacity-60', 'cursor-not-allowed');
    btn.textContent = 'Notice sent';
    toast('Notice sent to Barangay Captain');
  }

  /* ---------- map page ---------- */
  function dispatchTeam(btn) {
    confirmDialog({
      title: 'Dispatch MDRRMO response team?',
      message: 'A dispatch request will be sent to the MDRRMO operations desk.',
      confirmLabel: 'Dispatch'
    }).then(function (ok) {
      if (!ok) return;
      btn.disabled = true;
      btn.classList.add('opacity-60', 'cursor-not-allowed');
      btn.textContent = 'Dispatched';
      toast('Dispatch request sent');
    });
  }
  function logWarning(btn) {
    var form = mk('form', '', '<label class="block"><span class="' + LABEL + '">Note (optional)</span>' +
      '<textarea name="note" rows="3" class="' + INPUT + '" placeholder="Add details for the log"></textarea></label>');
    modal({
      title: 'Log warning', body: form,
      actions: [
        { label: 'Cancel', variant: 'ghost' },
        { label: 'Save to log', variant: 'primary', onClick: function () {
          var list = store.get('bbah-warning-log', []);
          list.push({ note: form.note.value.trim(), at: new Date().toISOString() });
          store.set('bbah-warning-log', list);
          btn.disabled = true;
          btn.classList.add('opacity-60', 'cursor-not-allowed');
          btn.textContent = 'Logged';
          toast('Warning logged');
        } }
      ]
    });
  }

  /* ---------- dashboard chart filter / sort ---------- */
  var sortDesc = true;
  function chartFilter() {
    var ch = window.floodOverviewChart;
    if (!ch) { toast('Chart is not ready yet', 'error'); return; }
    var form = mk('form', '', ch.data.datasets.map(function (d, i) {
      return '<label class="flex items-center gap-2 py-1.5 font-semibold text-[#0F2922]"><input type="checkbox" name="d' + i + '" class="w-4 h-4 accent-brand"' +
        (ch.isDatasetVisible(i) ? ' checked' : '') + '> ' + esc(d.label) + ' (series ' + (i + 1) + ')</label>';
    }).join(''));
    modal({
      title: 'Filter basins', body: form,
      actions: [
        { label: 'Cancel', variant: 'ghost' },
        { label: 'Apply', variant: 'primary', onClick: function () {
          ch.data.datasets.forEach(function (d, i) { ch.setDatasetVisibility(i, form.elements['d' + i].checked); });
          ch.update();
          toast('Filter applied', 'info');
        } }
      ]
    });
  }
  function chartSort() {
    var ch = window.floodOverviewChart;
    if (!ch) { toast('Chart is not ready yet', 'error'); return; }
    var peak = function (d) { return Math.max.apply(null, d.data); };
    ch.data.datasets.sort(function (a, b) { return sortDesc ? peak(b) - peak(a) : peak(a) - peak(b); });
    ch.update();
    toast('Sorted by peak level (' + (sortDesc ? 'high to low' : 'low to high') + ')', 'info');
    sortDesc = !sortDesc;
  }

  /* ---------- preferences page ---------- */
  var DEFAULT_PREFS = { sidebar: 'expanded', timeFormat: '12', alertFilter: 'all', sound: true, popups: true, sms: false, digest: false };

  function initPreferences() {
    var form = $('#prefs-form');
    if (!form) return;
    var p = Object.assign({}, DEFAULT_PREFS, store.get('bbah-prefs', {}));
    function load(vals) {
      form.elements.sidebar.value = vals.sidebar;
      form.elements.timeFormat.value = vals.timeFormat;
      form.elements.alertFilter.value = vals.alertFilter;
      ['sound', 'popups', 'sms', 'digest'].forEach(function (k) { form.elements[k].checked = !!vals[k]; });
    }
    load(p);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = {
        sidebar: form.elements.sidebar.value, timeFormat: form.elements.timeFormat.value, alertFilter: form.elements.alertFilter.value,
        sound: form.elements.sound.checked, popups: form.elements.popups.checked, sms: form.elements.sms.checked, digest: form.elements.digest.checked
      };
      store.set('bbah-prefs', v);
      try { localStorage.setItem('bbah-sidebar', v.sidebar); } catch (err) {}
      var sb = $('#sidebar');
      if (sb) sb.setAttribute('data-state', v.sidebar);
      toast('Preferences saved');
    });
    $('[data-action="prefs-reset"]').addEventListener('click', function () {
      load(DEFAULT_PREFS);
      toast('Defaults restored. Select Save preferences to keep them.', 'info');
    });
  }
  function resetDemoData() {
    confirmDialog({
      title: 'Reset demo data?',
      message: 'This restores every table (reports, sensor nodes, users) and saved settings to their original state on this device.',
      confirmLabel: 'Reset data', danger: true
    }).then(function (ok) {
      if (!ok) return;
      store.keys().forEach(function (k) { if (/^bbah-(table|toggles|warning|problem)/.test(k)) store.del(k); });
      toast('Demo data reset');
    });
  }

  /* ---------- click routing ---------- */
  document.addEventListener('click', function (e) {
    var hrefEl = e.target.closest('[data-href]');
    var btn = e.target.closest('[data-action]');
    if (!btn) {
      if (hrefEl) location.href = hrefEl.getAttribute('data-href');
      return;
    }
    if (btn.disabled) return;
    var a = btn.getAttribute('data-action');
    switch (a) {
      case 'signout': signOut(); break;
      case 'help': openHelp(); break;
      case 'report-problem': reportProblem(); break;
      case 'add-row': addRow(); break;
      case 'view': case 'edit': case 'configure': case 'delete':
      case 'revoke': case 'restore': case 'download': rowAction(a, btn); break;
      case 'save-settings': saveSettings(btn); break;
      case 'test-ping': testPing(btn); break;
      case 'export-logs': exportLogs(); break;
      case 'alert-filter': filterAlerts(btn); break;
      case 'push-alert': pushAlert(btn); break;
      case 'send-notice': sendNotice(btn); break;
      case 'dispatch': dispatchTeam(btn); break;
      case 'log-warning': logWarning(btn); break;
      case 'chart-filter': chartFilter(); break;
      case 'chart-sort': chartSort(); break;
      case 'reset-demo': resetDemoData(); break;
    }
  });

  /* ---------- init ---------- */
  initTables();
  initToggles();
  initPreferences();
  if (PAGE === 'alerts.html') {
    var pref = store.get('bbah-prefs', {}).alertFilter;
    if (pref && pref !== 'all') {
      var b = $('[data-action="alert-filter"][data-level="' + pref + '"]');
      if (b) filterAlerts(b);
    }
  }
})();


/* ---------- Reusable Admin Breadcrumb ----------
   Usage: <nav data-breadcrumb="Hardware & Sensors"></nav>
   Omit the attribute value (or leave empty) on the Administration Overview page. */
(function () {
    var OVERVIEW_URL = 'systemadministration.html';
    var style = document.createElement('style');
    style.textContent =
        '.bb-crumb{display:flex;flex-wrap:wrap;align-items:center;min-height:20px;line-height:20px;margin-bottom:20px;font-size:12px;background:transparent;border:0;max-width:100%}' +
        '.bb-crumb a{color:#7C8798;font-weight:400;text-decoration:none;transition:color .15s}' +
        '.bb-crumb a:hover,.bb-crumb a:focus-visible{color:#0f3326;text-decoration:underline;text-underline-offset:3px}' +
        '.bb-crumb .bb-sep{color:#A0A8B5;font-weight:400;margin:0 10px;user-select:none}' +
        '.bb-crumb .bb-current{color:#174D3A;font-weight:500}';
    document.head.appendChild(style);

    document.querySelectorAll('nav[data-breadcrumb]').forEach(function (nav) {
        var current = nav.getAttribute('data-breadcrumb');
        nav.className = 'bb-crumb';
        nav.setAttribute('aria-label', 'Breadcrumb');
        nav.textContent = '';
        function span(cls, text) { var s = document.createElement('span'); s.className = cls; s.textContent = text; return s; }
        if (!current) {
            var only = span('bb-current', 'Administration');
            only.setAttribute('aria-current', 'page');
            nav.appendChild(only);
            return;
        }
        var a = document.createElement('a');
        a.href = OVERVIEW_URL;
        a.textContent = 'Administration';
        nav.appendChild(a);
        var sep = span('bb-sep', '/');
        sep.setAttribute('aria-hidden', 'true');
        nav.appendChild(sep);
        var cur = span('bb-current', current);
        cur.setAttribute('aria-current', 'page');
        nav.appendChild(cur);
    });
})();


/* ---------- Stable scrollbar gutter ----------
   Reserves scrollbar space so the layout doesn't shift when the scrollbar appears/disappears. */
(function () {
    var st = document.createElement('style');
    st.textContent = 'html{scrollbar-gutter:stable}';
    document.head.appendChild(st);
})();
