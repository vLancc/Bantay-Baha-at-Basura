/* Bantay Baha at Basura - MDRRM Officer shell
   Shared sidebar, top bar, badges, state and fictional seed data for the MDRRM Officer pages.
   Requires static/js/app.js (exposes window.BBAH). Loaded before mdrrm-pages.js. */
(function () {
  'use strict';
  var B = window.BBAH;
  if (!B) return;
  var store = B.store, esc = B.esc;
  var PAGE = decodeURIComponent(location.pathname.split('/').pop() || '');
  var PREFIX = (PAGE.match(/^(mdrrm|brgy)-/) || [])[1] || '';
  var PAGE_ROLE = PREFIX === 'brgy' ? 'captain' : PREFIX === 'mdrrm' ? 'mdrrm' : '';
  var IS_MDRRM_PAGE = !!PAGE_ROLE;
  var sess = store.get('bbah-session', null);
  var HOME = { provincial: 'dashboard.html', mdrrm: 'mdrrm-dashboard.html', captain: 'brgy-dashboard.html' };

  /* Role separation: each role can only open its own pages. */
  if (IS_MDRRM_PAGE && sess && sess.role !== PAGE_ROLE) { location.replace(HOME[sess.role] || 'dashboard.html'); return; }
  var ROLE = IS_MDRRM_PAGE ? PAGE_ROLE : (sess && sess.role);
  /* Shared pages (preferences) only adopt a role shell for the MDRRMO Officer and Barangay Captain. */
  if (!IS_MDRRM_PAGE && ROLE !== 'mdrrm' && ROLE !== 'captain') return;

  var OFFICER = { name: 'Ramon Villanueva', initials: 'RV', email: 'ramonvillanueva@mdrrmo.com', title: 'MDRRMO Officer' };
  var MY_BRGY = 'Mabini';
  var CAPTAIN = { name: 'Rolando Bautista', initials: 'RB', email: 'rolandobautista@brgymabini.com', title: 'Barangay Captain' };
  var ME = ROLE === 'captain' ? CAPTAIN : OFFICER;
  var PORTAL = ROLE === 'captain' ? 'Barangay ' + MY_BRGY + ' Portal' : 'MDRRM Operations Center';

  /* ---------- formatting ---------- */
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function fmt(iso) {
    var d = new Date(iso), h = d.getHours(), ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return MON[d.getMonth()] + ' ' + d.getDate() + ', ' + h + ':' + ('0' + d.getMinutes()).slice(-2) + ' ' + ap;
  }
  function rel(iso) {
    var m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
    if (m < 1) return 'Just now';
    if (m < 60) return m + ' min ago';
    if (m < 1440) return Math.round(m / 60) + ' hr ago';
    return Math.round(m / 1440) + ' day' + (Math.round(m / 1440) > 1 ? 's' : '') + ' ago';
  }
  function num(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

  /* ---------- badges (same markup as the existing status badges) ---------- */
  var TONE = {
    Critical: 'red', High: 'orange', Medium: 'yellow', Low: 'emerald',
    Offline: 'gray'
  };
  function badge(text, tone) {
    return '<span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-' + tone + '-50 text-' + tone + '-700">' + esc(text) + '</span>';
  }
  function risk(r) { return badge(r, TONE[r] || 'gray'); }
  var STAGE = {
    awaiting_captain: ['Awaiting Barangay Verification', 'amber'],
    in_progress: ['Verification in Progress', 'amber'],
    pending_mdrrm: ['Pending MDRRM Approval', 'blue'],
    more_info: ['Additional Verification Requested', 'indigo'],
    approved: ['Approved', 'emerald'],
    rejected: ['Rejected', 'gray']
  };
  function stage(s) { return badge(STAGE[s][0], STAGE[s][1]); }
  var CSTAGE = {
    awaiting_captain: ['Pending Verification', 'amber'],
    in_progress: ['Verification in Progress', 'blue'],
    pending_mdrrm: ['Pending MDRRMO Approval', 'indigo'],
    more_info: ['Additional Verification Required', 'orange'],
    approved: ['Approved', 'emerald'],
    rejected: ['Rejected', 'gray']
  };
  function cstage(s) { return badge(CSTAGE[s][0], CSTAGE[s][1]); }

  /* ---------- seed data (fictional) ---------- */
  var STATIONS = [
    { id: 'S-01', name: 'Ilog Poblacion Gauge', brgy: 'Poblacion', watch: 2.5, warn: 3.5, crit: 4.5, level: 4.7, trend: 'Rising', rain: 41, ping: 2 },
    { id: 'S-02', name: 'Tulay Santa Rita Gauge', brgy: 'Santa Rita', watch: 2.0, warn: 3.0, crit: 4.0, level: 3.4, trend: 'Rising', rain: 36, ping: 1 },
    { id: 'S-03', name: 'Kanal Mabini Drain Node', brgy: 'Mabini', watch: 1.5, warn: 2.2, crit: 3.0, level: 2.4, trend: 'Rising', rain: 33, ping: 3, note: 'Clog warning' },
    { id: 'S-04', name: 'Ilog San Isidro Gauge', brgy: 'San Isidro', watch: 2.5, warn: 3.5, crit: 4.5, level: 2.9, trend: 'Steady', rain: 29, ping: 2 },
    { id: 'S-05', name: 'Estero Bagong Silang Gauge', brgy: 'Bagong Silang', watch: 1.2, warn: 1.8, crit: 2.5, level: 2.0, trend: 'Rising', rain: 31, ping: 4 },
    { id: 'S-06', name: 'Tulay Dulong Bayan Gauge', brgy: 'Dulong Bayan', watch: 2.0, warn: 3.0, crit: 4.0, level: 1.1, trend: 'Falling', rain: 12, ping: 2 },
    { id: 'S-07', name: 'Kanal Malaya Drain Node', brgy: 'Malaya', watch: 1.5, warn: 2.2, crit: 3.0, level: 0.8, trend: 'Steady', rain: 14, ping: 5 },
    { id: 'S-08', name: 'Ilog Bayanihan Gauge', brgy: 'Bayanihan', watch: 2.5, warn: 3.5, crit: 4.5, level: 1.9, trend: 'Falling', rain: 18, ping: 3 },
    { id: 'S-09', name: 'Estero Maligaya Gauge', brgy: 'Maligaya', watch: 1.2, warn: 1.8, crit: 2.5, level: 0.9, trend: 'Steady', rain: 15, ping: 6 },
    { id: 'S-10', name: 'Tulay Pag-asa Gauge', brgy: 'Pag-asa', watch: 2.0, warn: 3.0, crit: 4.0, level: 2.2, trend: 'Falling', rain: 22, ping: 2 },
    { id: 'S-11', name: 'Kanal Sampaguita Drain Node', brgy: 'Sampaguita', watch: 1.5, warn: 2.2, crit: 3.0, level: null, trend: 'No signal', rain: null, ping: 190, offline: true },
    { id: 'S-12', name: 'Ilog Narra Gauge', brgy: 'Narra', watch: 2.5, warn: 3.5, crit: 4.5, level: 1.6, trend: 'Steady', rain: 17, ping: 4 },
    { id: 'S-13', name: 'Mabini Creek Gauge', brgy: 'Mabini', watch: 1.5, warn: 2.2, crit: 3.0, level: 1.9, trend: 'Rising', rain: 33, ping: 2 },
    { id: 'S-14', name: 'Mabini Market Drain Inlet', brgy: 'Mabini', watch: 1.0, warn: 1.6, crit: 2.2, level: 0.7, trend: 'Steady', rain: 33, ping: 6 }
  ];
  function stationRisk(s) {
    if (s.offline) return 'Offline';
    if (s.level >= s.crit) return 'Critical';
    if (s.level >= s.warn) return 'High';
    if (s.level >= s.watch) return 'Medium';
    return 'Low';
  }

  var FN = ['Maria', 'Jose', 'Ana', 'Pedro', 'Luz', 'Roberto', 'Carmen', 'Antonio', 'Elena', 'Ricardo', 'Rosario', 'Eduardo', 'Teresita', 'Manuel', 'Gloria', 'Fernando', 'Josefina', 'Alfredo', 'Corazon', 'Danilo', 'Imelda', 'Rodrigo', 'Lourdes', 'Benjamin', 'Nenita', 'Cesar', 'Remedios', 'Virgilio', 'Erlinda', 'Arnel', 'Marites', 'Jun', 'Analyn', 'Joel', 'Divina', 'Rey'];
  var LN = ['Reyes', 'Santos', 'Cruz', 'Bautista', 'Ocampo', 'Garcia', 'Mendoza', 'Torres', 'Villanueva', 'Ramos', 'Aquino', 'Castillo', 'Flores', 'De Leon', 'Navarro', 'Salazar', 'Pascual', 'Domingo', 'Rivera', 'Mercado'];
  var BR = ['Poblacion', 'Santa Rita', 'Mabini', 'San Isidro', 'Bagong Silang', 'Dulong Bayan', 'Malaya', 'Bayanihan', 'Maligaya', 'Pag-asa'];
  var STREETS = ['Rizal St.', 'Mabini St.', 'Riverside Rd.', 'Sampaguita Ln.', 'Narra St.', 'Bonifacio St.', 'Luna St.', 'Kalayaan Ave.'];
  var ASSIST = ['None', 'Senior citizen (limited mobility)', 'None', 'PWD (wheelchair user)', 'None', 'Pregnant (third trimester)', 'None', 'Infant under 1 year', 'None', 'Bedridden family member', 'None', 'Medical equipment (oxygen)'];
  var STATUSES = ['Verified', 'Verified', 'Verified', 'Pending Verification', 'Verified', 'Inactive'];
  var CENTER_FOR = { 'Poblacion': 'Poblacion Elementary School', 'Santa Rita': 'Santa Rita Covered Court', 'Mabini': 'Mabini Barangay Hall', 'San Isidro': 'San Isidro Gymnasium', 'Bagong Silang': 'Bagong Silang Day Care Center', 'Dulong Bayan': 'Dulong Bayan Multi-Purpose Hall', 'Malaya': 'San Isidro Gymnasium', 'Bayanihan': 'Poblacion Elementary School', 'Maligaya': 'Pag-asa Elementary School', 'Pag-asa': 'Pag-asa Elementary School' };
  var RESIDENTS = (function () {
    var out = [];
    for (var i = 0; i < 52; i++) {
      var b = i >= 36 ? 'Mabini' : BR[(i * 3 + (i >> 2)) % BR.length];
      var n = i + 1, st = STATUSES[(i * 5 + 1) % STATUSES.length];
      var fn = FN[i % FN.length], ln = LN[(i * 7 + 3) % LN.length];
      var as = ASSIST[(i * 5 + 2) % ASSIST.length];
      out.push({
        id: 'RES-' + ('0000' + (1040 + n * 7)).slice(-5),
        name: fn + ' ' + ln,
        brgy: b,
        addr: (10 + ((i * 13) % 90)) + ' ' + STREETS[(i * 3) % STREETS.length] + ', Purok ' + (1 + (i % 6)) + ', Brgy. ' + b,
        phone: '09' + (17 + (i % 5)) + ' ' + ('000' + (500 + i * 37)).slice(-3) + ' ' + ('0000' + (100 + i * 91)).slice(-4),
        assist: as,
        status: st,
        household: 2 + (i % 6),
        registered: MON[(i * 2) % 12] + ' ' + (1 + (i * 3) % 27) + ', ' + (2024 + (i % 3)),
        contactName: FN[(i + 9) % FN.length] + ' ' + ln,
        contactPhone: '09' + (27 + (i % 4)) + ' ' + ('000' + (610 + i * 29)).slice(-3) + ' ' + ('0000' + (200 + i * 53)).slice(-4),
        center: CENTER_FOR[b]
      });
    }
    return out;
  })();

  function seed() {
    var now = Date.now();
    function m(min) { return new Date(now - min * 60000).toISOString(); }
    function snap(sid, lvl, extra) {
      var s = STATIONS.filter(function (x) { return x.id === sid; })[0];
      var o = { station: s.name, level: lvl, critical: s.crit, warning: s.warn, rise: '', rainfall: '', drainage: 'Normal' };
      for (var k in extra) o[k] = extra[k];
      return o;
    }
    var alerts = [
      { id: 'AL-2611-021', brgy: 'Poblacion', risk: 'Critical', detectedAt: m(26), stage: 'pending_mdrrm', households: 412, recipients: 1186, center: 'Poblacion Elementary School',
        trigger: 'Water level passed the critical threshold and is still rising.',
        sensor: snap('S-01', 4.7, { rise: '+0.6 m in the last hour', rainfall: '41 mm/hr', drainage: 'Normal' }),
        captain: { name: 'Kap. Ernesto Dela Cruz', status: 'Submitted', at: m(14), findings: 'Water has reached the first step of most houses along Riverside Rd., Purok 2 and 3. Road is passable to trucks only. Recommend evacuation of Purok 2 to 4.', simulate: '' },
        decision: null, bc: { status: 'none' } },
      { id: 'AL-2611-020', brgy: 'Santa Rita', risk: 'High', detectedAt: m(41), stage: 'pending_mdrrm', households: 188, recipients: 604, center: 'Santa Rita Covered Court',
        trigger: 'Water level above the warning threshold and rising for 3 consecutive readings.',
        sensor: snap('S-02', 3.4, { rise: '+0.3 m in the last hour', rainfall: '36 mm/hr' }),
        captain: { name: 'Kap. Luzviminda Ramos', status: 'Submitted', at: m(22), findings: 'River is overflowing near the footbridge. Two stores flooded. Families in Purok 5 are packing up. Recommend preemptive evacuation of Purok 5.', simulate: '' },
        decision: null, bc: { status: 'none' } },
      { id: 'AL-2611-019', brgy: 'Mabini', risk: 'High', detectedAt: m(7), stage: 'awaiting_captain', households: 126, recipients: 402, center: 'Mabini Barangay Hall',
        trigger: 'Drainage clog warning with water level above the warning threshold.',
        sensor: snap('S-03', 2.4, { rise: '+0.2 m in the last hour', rainfall: '33 mm/hr', drainage: 'Clog warning' }),
        captain: { name: 'Kap. Rolando Bautista', status: 'Verification requested', at: m(6), findings: '', simulate: 'Canal at Mabini St. is blocked with garbage and water is backing up into the road. Knee-deep at the market. Recommend evacuation of Purok 1 only.' },
        decision: null, bc: { status: 'none' } },
      { id: 'AL-2611-018', brgy: 'Bagong Silang', risk: 'High', detectedAt: m(58), stage: 'more_info', households: 97, recipients: 318, center: 'Bagong Silang Day Care Center',
        trigger: 'Water level above the warning threshold in a narrow estero.',
        sensor: snap('S-05', 2.0, { rise: '+0.2 m in the last hour', rainfall: '31 mm/hr' }),
        captain: { name: 'Kap. Cynthia Pascual', status: 'Re-verification requested', at: m(18), findings: 'Estero is nearly full. Some water on the road. No houses flooded yet.', simulate: 'Updated: water entered 6 houses at Purok 3. Count is 24 residents, including 3 seniors. Boats are not needed yet. Recommend evacuation.' },
        decision: { by: OFFICER.name, at: m(18), action: 'More verification requested', reason: 'Please confirm the number of flooded houses and whether the access road to the day care center is passable.' }, bc: { status: 'none' } },
      { id: 'AL-2611-016', brgy: 'Pag-asa', risk: 'High', detectedAt: m(160), stage: 'approved', households: 154, recipients: 498, center: 'Pag-asa Elementary School',
        trigger: 'Water level above the warning threshold after heavy rainfall.',
        sensor: snap('S-10', 3.2, { rise: '+0.4 m in the last hour', rainfall: '44 mm/hr' }),
        captain: { name: 'Kap. Leonora Salazar', status: 'Submitted', at: m(125), findings: 'Water at the knee level along Narra St. Several families already moved to the school. Recommend formal evacuation.', simulate: '' },
        decision: { by: OFFICER.name, at: m(40), action: 'Approved', reason: 'Captain findings match sensor trend. Evacuation approved for Purok 1 to 4.' }, bc: { status: 'none' } },
      { id: 'AL-2610-015', brgy: 'Dulong Bayan', risk: 'Critical', detectedAt: m(1560), stage: 'approved', households: 233, recipients: 1102, center: 'Dulong Bayan Multi-Purpose Hall',
        trigger: 'Water level passed the critical threshold.',
        sensor: snap('S-06', 4.2, { rise: '+0.7 m in the last hour', rainfall: '52 mm/hr' }),
        captain: { name: 'Kap. Dominador Aquino', status: 'Submitted', at: m(1530), findings: 'Houses near the bridge already flooded. Rescue boats on standby. Recommend immediate evacuation.', simulate: '' },
        decision: { by: OFFICER.name, at: m(1500), action: 'Approved', reason: 'Immediate evacuation of low-lying puroks.' },
        bc: { status: 'delivered', recipients: 1102, delivered: 1086, failed: 16, confirmedAt: m(1496), completedAt: m(1494) } },
      { id: 'AL-2610-012', brgy: 'Narra', risk: 'High', detectedAt: m(3000), stage: 'rejected', households: 0, recipients: 0, center: '-',
        trigger: 'Sudden spike above the warning threshold.',
        sensor: snap('S-12', 3.6, { rise: '+1.1 m in 10 minutes', rainfall: '8 mm/hr' }),
        captain: { name: 'Kap. Norberto Mercado', status: 'Submitted', at: m(2985), findings: 'Ground conditions are normal. Debris was seen stuck on the sensor housing. River is calm.', simulate: '' },
        decision: { by: OFFICER.name, at: m(2970), action: 'Rejected', reason: 'Sensor spike caused by debris. Ground conditions are normal per Barangay findings.' }, bc: { status: 'none' } }
    ];
    var incidents = [
      { id: 'IR-2611-010', title: 'Elderly residents need help moving out', brgy: 'Mabini', by: 'Kap. Rolando Bautista', at: m(300), priority: 'High', status: 'Action Required',
        desc: 'Several senior residents along Mabini St. cannot walk to the evacuation center without assistance.',
        remarks: [{ at: m(250), by: OFFICER.name, text: 'Please confirm how many residents need assistance and which purok they live in.' }], follow: [], responses: [] },
      { id: 'IR-2610-001', title: 'Damaged footbridge railing at Mabini Creek', brgy: 'Mabini', by: 'Kap. Rolando Bautista', at: m(7000), priority: 'Medium', status: 'Closed',
        desc: 'Railing on the creek footbridge was broken by floating debris and is unsafe for children.',
        remarks: [{ at: m(6800), by: OFFICER.name, text: 'Repair crew dispatched by the engineering office.' }], follow: [{ at: m(6800), text: 'Repair completed and inspected' }], responses: [] },
      { id: 'IR-2611-009', title: 'Clogged drainage along Rizal Street', brgy: 'Mabini', by: 'Kap. Rolando Bautista', at: m(95), priority: 'High', status: 'Submitted',
        desc: 'Drain inlets near the public market are blocked by plastic waste. Water is pooling during rain.', remarks: [], follow: [] },
      { id: 'IR-2611-008', title: 'Riverbank erosion near Purok 3', brgy: 'Santa Rita', by: 'Kap. Luzviminda Ramos', at: m(240), priority: 'Critical', status: 'Under Review',
        desc: 'About 5 meters of bank collapsed after last night\'s rain. Two houses are now close to the edge.',
        remarks: [{ at: m(200), by: OFFICER.name, text: 'Asked the barangay to cordon off the area. Engineering office to inspect.' }], follow: [{ at: m(200), text: 'Request site inspection from the municipal engineer' }] },
      { id: 'IR-2611-007', title: 'Garbage buildup at estero outlet', brgy: 'Bagong Silang', by: 'Kap. Cynthia Pascual', at: m(420), priority: 'High', status: 'In Progress',
        desc: 'Floating waste is collecting at the outlet and slowing water flow. Needs clearing before the next rain.',
        remarks: [{ at: m(380), by: OFFICER.name, text: 'Cleanup crew scheduled for tomorrow morning.' }], follow: [{ at: m(380), text: 'Deploy cleanup crew and one dump truck' }] },
      { id: 'IR-2611-006', title: 'Streetlight outage on evacuation route', brgy: 'Poblacion', by: 'Kap. Ernesto Dela Cruz', at: m(1100), priority: 'Medium', status: 'In Progress',
        desc: 'Four streetlights are out between the covered court and Poblacion Elementary School.',
        remarks: [], follow: [{ at: m(1000), text: 'Forwarded to the electric cooperative' }] },
      { id: 'IR-2611-005', title: 'Request for additional rescue boats', brgy: 'Dulong Bayan', by: 'Kap. Dominador Aquino', at: m(1700), priority: 'High', status: 'Resolved',
        desc: 'Barangay has only one boat. Requesting two more for the next flooding event.',
        remarks: [{ at: m(1500), by: OFFICER.name, text: 'Two inflatable boats released from the MDRRMO depot.' }], follow: [{ at: m(1500), text: 'Boats released and logged to the barangay' }] },
      { id: 'IR-2610-004', title: 'Sensor node tilted after strong current', brgy: 'Pag-asa', by: 'Kap. Leonora Salazar', at: m(2900), priority: 'Medium', status: 'Under Review',
        desc: 'The gauge at Tulay Pag-asa is leaning and may give wrong readings.',
        remarks: [], follow: [] },
      { id: 'IR-2610-003', title: 'Access road to evacuation center flooded', brgy: 'San Isidro', by: 'Kap. Teodoro Navarro', at: m(4300), priority: 'High', status: 'Resolved',
        desc: 'Road to the gymnasium was knee-deep during the last storm. Vehicles could not pass.',
        remarks: [{ at: m(4000), by: OFFICER.name, text: 'Alternate route through Luna St. marked and announced.' }], follow: [{ at: m(4000), text: 'Post alternate route signage' }] },
      { id: 'IR-2610-002', title: 'Uncollected waste blocking canal', brgy: 'Maligaya', by: 'Kap. Perla Domingo', at: m(5800), priority: 'Low', status: 'Resolved',
        desc: 'Waste not collected for a week and is slipping into the canal.',
        remarks: [{ at: m(5600), by: OFFICER.name, text: 'Coordinated with the solid waste office.' }], follow: [] }
    ];
    var TYPES = { 'IR-2611-009': ['Blocked drainage or waterway', 'Mabini St. near the public market'], 'IR-2611-008': ['Damaged infrastructure', 'Purok 3 riverbank'], 'IR-2611-007': ['Blocked drainage or waterway', 'Estero outlet'],
      'IR-2611-006': ['Damaged infrastructure', 'Court to school route'], 'IR-2611-005': ['Other disaster-related incident', 'Barangay boat station'], 'IR-2610-004': ['Damaged infrastructure', 'Tulay Pag-asa'],
      'IR-2610-003': ['Flooding', 'Gymnasium access road'], 'IR-2610-002': ['Blocked drainage or waterway', 'Maligaya canal'], 'IR-2611-010': ['Residents requiring emergency assistance', 'Mabini St., Purok 1 and 2'], 'IR-2610-001': ['Damaged infrastructure', 'Mabini Creek footbridge'] };
    incidents.forEach(function (i) { i.type = TYPES[i.id][0]; i.location = TYPES[i.id][1]; if (!i.responses) i.responses = []; });
    var centers = [
      { id: 'EC-01', name: 'Poblacion Elementary School', brgy: 'Poblacion', cap: 400, occ: 0, status: 'Standby', contact: 'Kap. Ernesto Dela Cruz', phone: '0917 555 0101', facilities: 'Classrooms, water tank, generator' },
      { id: 'EC-02', name: 'Santa Rita Covered Court', brgy: 'Santa Rita', cap: 250, occ: 0, status: 'Standby', contact: 'Kap. Luzviminda Ramos', phone: '0918 555 0102', facilities: 'Open hall, comfort rooms' },
      { id: 'EC-03', name: 'Mabini Barangay Hall', brgy: 'Mabini', cap: 150, occ: 0, status: 'Standby', contact: 'Kap. Rolando Bautista', phone: '0919 555 0103', facilities: 'Hall, first aid room' },
      { id: 'EC-04', name: 'San Isidro Gymnasium', brgy: 'San Isidro', cap: 500, occ: 0, status: 'Standby', contact: 'Kap. Teodoro Navarro', phone: '0920 555 0104', facilities: 'Gym, kitchen, generator' },
      { id: 'EC-05', name: 'Bagong Silang Day Care Center', brgy: 'Bagong Silang', cap: 120, occ: 0, status: 'Closed', contact: 'Kap. Cynthia Pascual', phone: '0917 555 0105', facilities: 'Roof repair ongoing' },
      { id: 'EC-06', name: 'Dulong Bayan Multi-Purpose Hall', brgy: 'Dulong Bayan', cap: 300, occ: 142, status: 'Open', contact: 'Kap. Dominador Aquino', phone: '0918 555 0106', facilities: 'Hall, kitchen, clinic corner' },
      { id: 'EC-07', name: 'Pag-asa Elementary School', brgy: 'Pag-asa', cap: 350, occ: 38, status: 'Open', contact: 'Kap. Leonora Salazar', phone: '0919 555 0107', facilities: 'Classrooms, water tank' }
    ];
    var log = [
      { at: m(40), type: 'Evacuation decision', ref: 'AL-2611-016', brgy: 'Pag-asa', summary: 'Approved evacuation alert (High)', by: OFFICER.name },
      { at: m(18), type: 'Evacuation decision', ref: 'AL-2611-018', brgy: 'Bagong Silang', summary: 'Requested additional verification', by: OFFICER.name },
      { at: m(380), type: 'Incident update', ref: 'IR-2611-007', brgy: 'Bagong Silang', summary: 'Remark added, status set to In Progress', by: OFFICER.name },
      { at: m(1494), type: 'SMS broadcast', ref: 'AL-2610-015', brgy: 'Dulong Bayan', summary: 'Broadcast completed: 1,086 of 1,102 delivered', by: 'System' },
      { at: m(1496), type: 'SMS broadcast', ref: 'AL-2610-015', brgy: 'Dulong Bayan', summary: 'Mass SMS broadcast confirmed to 1,102 residents', by: OFFICER.name },
      { at: m(1500), type: 'Evacuation decision', ref: 'AL-2610-015', brgy: 'Dulong Bayan', summary: 'Approved evacuation alert (Critical)', by: OFFICER.name },
      { at: m(1500), type: 'Incident update', ref: 'IR-2611-005', brgy: 'Dulong Bayan', summary: 'Status set to Resolved', by: OFFICER.name },
      { at: m(2970), type: 'Evacuation decision', ref: 'AL-2610-012', brgy: 'Narra', summary: 'Rejected evacuation alert (High)', by: OFFICER.name },
      { at: m(4000), type: 'Incident update', ref: 'IR-2610-003', brgy: 'San Isidro', summary: 'Status set to Resolved', by: OFFICER.name },
      { at: m(5600), type: 'Incident update', ref: 'IR-2610-002', brgy: 'Maligaya', summary: 'Status set to Resolved', by: OFFICER.name }
    ];
    return { v: 2, alerts: alerts, incidents: incidents, centers: centers, log: log };
  }

  var SKEY = 'bbah-mdrrm-state';
  var state = store.get(SKEY, null);
  if (!state || state.v !== 2) { state = seed(); store.set(SKEY, state); }
  function save() { store.set(SKEY, state); }
  function addLog(type, ref, brgy, summary, by) {
    state.log.unshift({ at: new Date().toISOString(), type: type, ref: ref, brgy: brgy, summary: summary, by: by || OFFICER.name });
  }

  /* SMS broadcast delivery is derived from the confirmation time so it persists across pages. */
  var BC_MS = 20000;
  function bcView(a) {
    var bc = a.bc;
    if (bc.status === 'none') return { key: 'none', label: 'Not sent', tone: 'gray', delivered: 0, total: 0 };
    if (bc.status === 'sending') {
      var p = Math.min(1, (Date.now() - new Date(bc.confirmedAt).getTime()) / BC_MS);
      return { key: 'sending', label: 'Sending', tone: 'blue', delivered: Math.floor(bc.recipients * p * 0.985), total: bc.recipients };
    }
    var partial = bc.failed / bc.recipients > 0.02;
    return { key: partial ? 'partial' : 'delivered', label: partial ? 'Partially Delivered' : 'Delivered', tone: partial ? 'amber' : 'emerald', delivered: bc.delivered, total: bc.recipients, failed: bc.failed };
  }
  function syncBroadcasts() {
    var changed = false;
    state.alerts.forEach(function (a) {
      var bc = a.bc;
      if (bc.status === 'sending' && Date.now() - new Date(bc.confirmedAt).getTime() >= BC_MS) {
        bc.failed = Math.max(1, Math.round(bc.recipients * 0.015));
        bc.delivered = bc.recipients - bc.failed;
        bc.completedAt = new Date().toISOString();
        bc.status = 'delivered';
        addLog('SMS broadcast', a.id, a.brgy, 'Broadcast completed: ' + num(bc.delivered) + ' of ' + num(bc.recipients) + ' delivered', 'System');
        changed = true;
      }
    });
    if (changed) save();
    return changed;
  }
  syncBroadcasts();
  function isOpenAlert(a) {
    if (a.stage === 'rejected') return false;
    if (a.stage === 'approved') return bcView(a).key !== 'delivered' && bcView(a).key !== 'partial';
    return true;
  }
  function pendingCount() { return state.alerts.filter(function (a) { return a.stage === 'pending_mdrrm'; }).length; }

  /* ---------- shell markup (mirrors the Provincial Head shell) ---------- */
  var ICON = {
    home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    map: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
    monitor: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    bell: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
    users: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    warn: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    building: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    doc: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    out: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
    help: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    prefs: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
  };
  function svg(path, cls) {
    return '<svg class="' + cls + '" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="' + path + '"/></svg>';
  }
  var NAV_MDRRM = [
    { label: 'Overview', items: [
      { key: 'dashboard', href: 'mdrrm-dashboard.html', text: 'Dashboard', icon: 'home' },
      { key: 'map', href: 'mdrrm-map.html', text: 'Monitoring Map', icon: 'map' },
      { key: 'monitoring', href: 'mdrrm-monitoring.html', text: 'Disaster Monitoring', icon: 'monitor' },
      { key: 'alerts', href: 'mdrrm-alerts.html', text: 'Alerts & Evacuation', icon: 'bell', dot: true }
    ] },
    { label: 'Operations', items: [
      { key: 'residents', href: 'mdrrm-residents.html', text: 'Registered Residents', icon: 'users' },
      { key: 'reports', href: 'mdrrm-reports.html', text: 'Reports & History', icon: 'doc' }
    ] }
  ];
  var NAV_CAPTAIN = [
    { label: 'Overview', items: [
      { key: 'dashboard', href: 'brgy-dashboard.html', text: 'Dashboard', icon: 'home' },
      { key: 'monitoring', href: 'brgy-monitoring.html', text: 'Disaster Monitoring', icon: 'monitor' },
      { key: 'alerts', href: 'brgy-alerts.html', text: 'Alerts & Verification', icon: 'bell', dot: true }
    ] },
    { label: 'Operations', items: [
      { key: 'residents', href: 'brgy-residents.html', text: 'Residents', icon: 'users' },
      { key: 'incidents', href: 'brgy-incidents.html', text: 'Incident Reports', icon: 'warn' },
      { key: 'centers', href: 'brgy-centers.html', text: 'Evacuation Centers', icon: 'building' }
    ] }
  ];
  var NAV = ROLE === 'captain' ? NAV_CAPTAIN : NAV_MDRRM;
  function needsVerification(a) { return a.brgy === MY_BRGY && (a.stage === 'awaiting_captain' || a.stage === 'in_progress' || a.stage === 'more_info'); }
  function dotCount() { return ROLE === 'captain' ? state.alerts.filter(needsVerification).length : pendingCount(); }
  var ITEM = 'sb-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 ';
  var ON = 'border-emerald-400/20 bg-gradient-to-r from-emerald-900/80 via-emerald-700/40 to-emerald-900/80 font-semibold text-white shadow-md shadow-black/30';
  var OFF = 'border-transparent font-medium text-gray-400 hover:bg-white/5 hover:text-white';

  function sidebarHTML(active) {
    var nav = NAV.map(function (g, gi) {
      return (gi ? '<div class="sb-divider h-px bg-white/5 mx-2 my-2"></div>' : '') +
        '<p class="sb-label px-3 ' + (gi ? 'pt-4 ' : '') + 'pb-1 text-[11px] font-semibold text-gray-500">' + g.label + '</p>' +
        g.items.map(function (it) {
          var on = it.key === active;
          var ico = svg(ICON[it.icon], 'w-5 h-5 shrink-0');
          if (it.dot && dotCount() > 0) {
            ico = '<span class="relative inline-flex">' + ico + '<span class="absolute -top-0.5 -right-0.5 flex h-2 w-2" aria-label="Alerts needing action"><span class="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping"></span><span class="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span></span></span>';
          }
          return '<a href="' + it.href + '" class="' + ITEM + (on ? ON : OFF) + '" title="' + esc(it.text) + '"' + (on ? ' aria-current="page"' : '') + '>' + ico + '<span class="sb-text whitespace-nowrap">' + esc(it.text) + '</span></a>';
        }).join('');
    }).join('');
    return '' +
      '<div class="sb-head flex items-center gap-3 px-4 pt-5 pb-4 border-b border-white/5">' +
        '<div class="w-10 h-10 rounded-xl bg-emerald-900/40 ring-1 ring-white/10 flex items-center justify-center shrink-0 overflow-hidden p-1"><img src="static/images/logo.png" alt="Bantay Baha at Basura logo" class="w-full h-full object-contain"></div>' +
        '<span class="sb-text text-[13px] font-extrabold text-white leading-tight tracking-tight">Bantay Baha at Basura</span>' +
        '<button type="button" id="sidebar-toggle" class="ml-auto p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60" aria-expanded="true" title="Collapse sidebar"><svg class="sb-toggle-ico w-4 h-4 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg></button>' +
      '</div>' +
      '<nav class="flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label="Main navigation">' + nav + '</nav>' +
      '<div class="px-3 pb-6 pt-3 border-t border-white/5 space-y-2">' +
        '<button type="button" data-action="signout" class="' + ITEM + OFF + ' w-full text-left hover:!bg-red-500/10 hover:!text-red-400" title="Sign Out">' + svg(ICON.out, 'w-5 h-5 shrink-0') + '<span class="sb-text whitespace-nowrap">Sign Out</span></button>' +
        '<button type="button" data-href="preferences.html" class="sb-profile w-full flex items-center gap-2.5 p-1.5 rounded-xl text-left transition hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60" title="Preferences">' +
          '<span class="w-10 h-10 rounded-full bg-gray-800 text-gray-400 flex items-center justify-center shrink-0 overflow-hidden shadow border border-gray-700"><svg class="w-6 h-6 mt-2 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg></span>' +
          '<span class="sb-text min-w-0 block"><span class="block text-xs font-bold text-white truncate leading-tight">' + ME.title + '</span><span class="block text-[10px] text-gray-400 truncate leading-tight mt-0.5">' + ME.email + '</span></span>' +
        '</button>' +
      '</div>';
  }

  function headerHTML() {
    var menu = function (href, icon, text) { return '<a href="' + href + '" class="w-full text-left flex items-center px-4 py-2.5 hover:bg-emerald-50 hover:text-brand transition gap-3">' + svg(ICON[icon], 'w-4 h-4 text-gray-400') + text + '</a>'; };
    var mbtn = function (act, icon, text) { return '<button type="button" data-action="' + act + '" class="w-full text-left flex items-center px-4 py-2.5 hover:bg-emerald-50 hover:text-brand transition gap-3">' + svg(ICON[icon], 'w-4 h-4 text-gray-400') + text + '</button>'; };
    return '' +
      '<div class="flex items-center space-x-3"><span class="text-xs font-bold uppercase tracking-wider text-gray-400">Portal:</span>' +
        '<span class="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-brand border border-emerald-200 flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> ' + PORTAL + '</span></div>' +
      '<div class="relative">' +
        '<button id="profile-menu-btn" class="flex items-center space-x-3 border-l pl-4 border-gray-200 focus:outline-none cursor-pointer group py-1">' +
          '<div class="w-9 h-9 rounded-full bg-brand text-white flex items-center justify-center font-bold text-xs shadow-sm group-hover:ring-2 group-hover:ring-brand/50 transition">' + ME.initials + '</div>' +
          '<div class="hidden md:block text-left"><p class="text-xs font-bold text-[#0F2922] group-hover:text-brand transition">' + ME.name + '</p><p class="text-[10px] text-gray-400 font-medium">' + ME.title + '</p></div>' +
          '<svg class="w-4 h-4 text-gray-400 group-hover:text-brand transition ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>' +
        '</button>' +
        '<div id="profile-dropdown" class="hidden absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">' +
          '<div class="px-4 py-3 border-b border-gray-100"><p class="text-xs font-extrabold text-[#0F2922]">' + ME.name + '</p><p class="text-[11px] text-gray-400">' + ME.email + '</p></div>' +
          '<div class="py-1 text-xs font-semibold text-gray-700">' + menu('preferences.html', 'prefs', 'Preferences') + mbtn('help', 'help', 'Help &amp; Support') + mbtn('report-problem', 'warn', 'Report a Problem') + '</div>' +
          '<div class="border-t border-gray-100 pt-1 mt-1"><button type="button" data-action="signout" class="w-full text-left flex items-center px-4 py-2.5 hover:bg-red-50 text-red-600 transition gap-3 text-xs font-bold">' + svg(ICON.out, 'w-4 h-4 text-red-500') + 'Sign Out</button></div>' +
        '</div>' +
      '</div>';
  }

  function injectSidebarCss() {
    if (document.getElementById('sidebar-css')) return;
    var st = document.createElement('style');
    st.id = 'sidebar-css';
    st.textContent = '#sidebar{width:16rem;transition:width .3s ease}#sidebar[data-state="collapsed"]{width:5rem}#sidebar .sb-divider{display:none}' +
      '#sidebar[data-state="collapsed"] .sb-text,#sidebar[data-state="collapsed"] .sb-label{display:none}#sidebar[data-state="collapsed"] .sb-divider{display:block}' +
      '#sidebar[data-state="collapsed"] .sb-item{justify-content:center;padding-left:0;padding-right:0;gap:0}#sidebar[data-state="collapsed"] .sb-head{flex-direction:column;gap:.75rem}' +
      '#sidebar[data-state="collapsed"] #sidebar-toggle{margin-left:0}#sidebar[data-state="collapsed"] .sb-toggle-ico{transform:rotate(180deg)}#sidebar[data-state="collapsed"] .sb-profile{justify-content:center}' +
      '#sidebar nav{scrollbar-width:thin;scrollbar-color:#24302a transparent}';
    document.head.appendChild(st);
  }

  function bindShell() {
    var sb = document.getElementById('sidebar'), btn = document.getElementById('sidebar-toggle');
    var KEY = 'bbah-sidebar';
    function setState(s) {
      sb.setAttribute('data-state', s);
      btn.setAttribute('aria-expanded', String(s === 'expanded'));
      btn.title = s === 'expanded' ? 'Collapse sidebar' : 'Expand sidebar';
    }
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) {}
    if (!saved) { try { saved = (JSON.parse(localStorage.getItem('bbah-prefs') || '{}')).sidebar || null; } catch (e) {} }
    setState(saved === 'collapsed' ? 'collapsed' : 'expanded');
    btn.addEventListener('click', function () {
      var next = sb.getAttribute('data-state') === 'expanded' ? 'collapsed' : 'expanded';
      setState(next);
      try { localStorage.setItem(KEY, next); } catch (e) {}
    });
    sb.addEventListener('transitionend', function (e) { if (e.propertyName === 'width') window.dispatchEvent(new Event('resize')); });
    var pb = document.getElementById('profile-menu-btn'), pd = document.getElementById('profile-dropdown');
    pb.addEventListener('click', function (e) { e.stopPropagation(); pd.classList.toggle('hidden'); });
    window.addEventListener('click', function () { pd.classList.add('hidden'); });
  }

  function mount(active) {
    injectSidebarCss();
    var old = document.getElementById('sidebar');
    var aside = document.createElement('aside');
    aside.id = 'sidebar';
    aside.setAttribute('data-state', 'expanded');
    aside.className = 'bg-darkSidebar text-gray-300 flex flex-col sticky top-0 h-screen z-50 shrink-0 overflow-hidden border-r border-gray-800 shadow-2xl';
    aside.innerHTML = sidebarHTML(active);
    if (old) old.replaceWith(aside); else document.body.insertBefore(aside, document.body.firstChild);
    var hd = document.querySelector('header');
    if (!hd) {
      hd = document.createElement('header');
      var host = document.getElementById('mdrrm-wrap');
      host.insertBefore(hd, host.firstChild);
    }
    hd.className = 'bg-white border-b border-gray-200 h-20 flex items-center justify-between px-8 sticky top-0 z-40 shadow-xs';
    hd.innerHTML = headerHTML();
    bindShell();
  }

  window.MDRRM = {
    OFFICER: OFFICER, ME: ME, ROLE: ROLE, MY_BRGY: MY_BRGY, CSTAGE: CSTAGE, cstage: cstage, needsVerification: needsVerification, state: state, save: save, addLog: addLog, fmt: fmt, rel: rel, num: num,
    badge: badge, risk: risk, stage: stage, STAGE: STAGE, TONE: TONE,
    STATIONS: STATIONS, stationRisk: stationRisk, RESIDENTS: RESIDENTS, BRGYS: BR,
    bcView: bcView, syncBroadcasts: syncBroadcasts, isOpenAlert: isOpenAlert, pendingCount: pendingCount,
    mount: mount, PAGE: PAGE
  };

  /* Shared page (preferences) viewed by the MDRRM Officer: swap in the MDRRM sidebar and identity. */
  if (!IS_MDRRM_PAGE) {
    mount('');
    document.title = document.title.replace(/Provincial[^-]*/i, '');
  }
})();
