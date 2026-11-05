'use strict';
// Page renderers for the admin panel. Each returns HTML for the main area.
// Loaded before core.js; functions here only call helpers at runtime.

const LABEL = { province: 'Province', city: 'City', area: 'Area', subArea: 'Sub-area' };
const CHILD = { province: ['city', 'cities'], city: ['area', 'areas'], area: ['subArea', 'subAreas'] };
const WORKER_LABEL = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected', suspended: 'Suspended' };
const REQ_LABEL = {
  new: 'New', contacted: 'Contacted', assigned: 'Assigned',
  in_progress: 'In progress', completed: 'Completed', cancelled: 'Cancelled'
};

const tag = (label, cls) => `<span class="tag ${cls}">${esc(label)}</span>`;
const reqTag = s => tag(REQ_LABEL[s] || s, 'st-' + s);
const workerTag = s => tag(WORKER_LABEL[s] || s, 'st-' + s);
const empty = msg => `<div class="empty">${esc(msg)}</div>`;
const fmtDate = iso => (iso ? new Date(iso).toLocaleString() : '-');
const initials = name => String(name || '?').split(/\s+/).map(s => s[0] || '').join('').slice(0, 2).toUpperCase();
const waLink = (phone, text) => `https://wa.me/92${String(phone).replace(/^0/, '')}?text=${encodeURIComponent(text)}`;
const statCard = (label, value, sub) =>
  `<div class="card stat"><span>${esc(label)}</span><strong>${esc(value)}</strong><small>${esc(sub)}</small></div>`;

function filterSelect(page, key, value, labels, allLabel) {
  return `<div class="toolbar"><select data-filter="${page}" data-key="${key}">
    <option value="">${esc(allLabel)}</option>
    ${Object.entries(labels).map(([k, v]) => `<option value="${k}" ${k === value ? 'selected' : ''}>${esc(v)}</option>`).join('')}
  </select></div>`;
}

function requestTable(list) {
  return `<div class="table-wrap"><table>
    <thead><tr><th>Code</th><th>Customer</th><th>Service</th><th>Location</th><th>Status</th><th>Received</th><th></th></tr></thead>
    <tbody>${list.map(r => `<tr>
      <td><b>${esc(r.code)}</b></td>
      <td>${esc(r.name)}<br><small class="muted">${esc(r.phone)}</small></td>
      <td>${esc(r.categoryName)}</td>
      <td>${esc(r.cityName || r.locationName || '—')}${r.areaName ? `<br><small class="muted">${esc(r.areaName)}</small>` : ''}</td>
      <td>${reqTag(r.status)}</td>
      <td><small>${fmtDate(r.createdAt)}</small></td>
      <td class="actions"><button class="btn btn-sm" data-act="req-open" data-id="${esc(r.id)}">Open</button></td>
    </tr>`).join('')}</tbody>
  </table></div>`;
}

function paymentText(w) {
  const p = w.payment;
  if (!p.required) return 'Free';
  if (!p.ref) return 'Missing';
  return `${p.method} · ${p.ref} ${p.verified ? '✔ verified' : '(not verified)'}`;
}

function workerTable(list) {
  return `<div class="table-wrap"><table>
    <thead><tr><th>Name</th><th>Profession</th><th>Location</th><th>Experience</th><th>Payment</th><th>Status</th><th>Applied</th><th></th></tr></thead>
    <tbody>${list.map(w => `<tr>
      <td><b>${esc(w.name)}</b><br><small class="muted">${esc(w.phone)}</small></td>
      <td>${esc(w.categoryName)}</td>
      <td>${esc(w.cityName)}${w.areas.length ? `<br><small class="muted">${esc(w.areas.map(a => a.name).join(', '))}</small>` : ''}</td>
      <td>${esc(w.experience)} yrs</td>
      <td><small>${esc(paymentText(w))}</small></td>
      <td>${workerTag(w.status)}</td>
      <td><small>${fmtDate(w.createdAt)}</small></td>
      <td class="actions"><button class="btn btn-sm" data-act="worker-open" data-id="${esc(w.id)}">Open</button></td>
    </tr>`).join('')}</tbody>
  </table></div>`;
}

// ---------- dashboard ----------
async function pageDashboard() {
  const [s, reqs] = await Promise.all([api('/api/admin/stats'), api('/api/admin/requests')]);
  const max = Math.max(1, ...s.series.map(d => d.views));
  return `
<div class="stat-grid">
  ${statCard('Total site visits', s.totalViews, 'since launch')}
  ${statCard('Unique visitors', s.uniqueVisitors, 'distinct browsers')}
  ${statCard('Visits today', s.today.views, `${s.today.visitors} unique today`)}
  ${statCard('New requests', s.requests.new, `${s.requests.total} total`)}
  <a class="card stat stat-link" href="#/workers?status=pending">
    <span>Pending workers</span><strong>${esc(s.workers.pending)}</strong>
    <small>${esc(s.workers.approved)} approved · Review applications →</small>
  </a>
  ${statCard('Active services', s.categories, `${s.locations.cities} cities · ${s.locations.areas} areas`)}
</div>
<div class="stack">
  <section class="card">
    <div class="card-head"><h3>Website visits, last 14 days</h3></div>
    <div class="chart">${s.series.map(d => `
      <div class="bar-col" title="${d.date}: ${d.views} views, ${d.visitors} visitors">
        <div class="bar" style="height:${Math.max(2, Math.round(d.views / max * 100))}%"></div>
        <small>${d.date.slice(8)}</small>
      </div>`).join('')}</div>
  </section>
  <section class="card">
    <div class="card-head">
      <h3>Latest requests</h3>
      <button class="btn btn-sm btn-ghost" data-act="go" data-page="requests">View all</button>
    </div>
    ${reqs.length ? requestTable(reqs.slice(0, 6)) : empty('No service requests yet')}
  </section>
</div>`;
}

// ---------- service requests ----------
async function pageRequests() {
  const status = hashQuery().get('status') || '';
  const list = await api('/api/admin/requests' + (status ? `?status=${encodeURIComponent(status)}` : ''));
  return filterSelect('requests', 'status', status, REQ_LABEL, 'All statuses')
    + (list.length ? `<section class="card table-card">${requestTable(list)}</section>` : empty('No requests match this filter'));
}

async function openRequest(id) {
  const [reqs, workers] = await Promise.all([
    api('/api/admin/requests'), api('/api/admin/workers?status=approved')
  ]);
  const r = reqs.find(x => x.id === id);
  if (!r) throw new Error('Request not found');
  const matching = workers.filter(w => w.categoryId === r.categoryId)
    .sort((a, b) => (b.cityId === r.cityId) - (a.cityId === r.cityId));
  const others = workers.filter(w => !matching.includes(w));
  const opt = w => `<option value="${esc(w.id)}" ${w.id === r.assignedWorkerId ? 'selected' : ''}>${esc(w.name)} · ${esc(w.categoryName)} · ${esc(w.cityName)}</option>`;
  const statusOpts = Object.entries(REQ_LABEL)
    .map(([k, v]) => `<option value="${k}" ${k === r.status ? 'selected' : ''}>${v}</option>`).join('');
  const wa = waLink(r.phone, `Hello ${r.name}, this is Hunar Near Me about your request ${r.code}.`);

  openModal(`Request ${r.code}`, `
<div class="detail-grid">
  <div><small class="muted">Code</small><br><b>${esc(r.code)}</b></div>
  <div><small class="muted">Status</small><br>${reqTag(r.status)}</div>
  <div><small class="muted">Received</small><br><small>${fmtDate(r.createdAt)}</small></div>
</div>
<p><b>Customer:</b> ${esc(r.name)} · <a href="tel:${esc(r.phone)}">${esc(r.phone)}</a> ·
  <a target="_blank" rel="noopener" href="${wa}">WhatsApp ↗</a></p>
<p><b>Service:</b> ${esc(r.categoryName)} &nbsp; <b>Location:</b> ${esc([r.provinceName, r.cityName, r.areaName].filter(Boolean).join(' › ') || r.locationName || '—')}</p>
${Number.isFinite(r.latitude) && Number.isFinite(r.longitude)
    ? `<p><a target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${r.latitude},${r.longitude}`)}">Open selected pin in Google Maps ↗</a></p>`
    : ''}
${r.address ? `<p><b>Address:</b> ${esc(r.address)}</p>` : ''}
<p><b>Preferred date:</b> ${esc(r.preferredDate || 'Flexible')}</p>
<div class="quote">${esc(r.description)}</div>
<div class="form">
  <div class="grid-2">
    <label>Status<select id="reqStatus">${statusOpts}</select></label>
    <label>Assign worker<select id="reqWorker">
      <option value="">— Not assigned —</option>
      ${matching.length ? `<optgroup label="Same service, best city match first">${matching.map(opt).join('')}</optgroup>` : ''}
      ${others.length ? `<optgroup label="Other approved workers">${others.map(opt).join('')}</optgroup>` : ''}
    </select></label>
  </div>
  <div class="form-actions"><button class="btn btn-primary" type="button" data-act="req-save" data-id="${r.id}">Save changes</button></div>
</div>
<h4>Internal notes</h4>
${(r.notes || []).map(n => `<div class="note"><small class="muted">${fmtDate(n.at)} · ${esc(n.by)}</small><p>${esc(n.text)}</p></div>`).join('') || '<p class="muted">No notes yet.</p>'}
<div class="note-add">
  <input id="noteText" maxlength="500" placeholder="e.g. Called customer, visit fixed for Sunday">
  <button class="btn btn-sm" type="button" data-act="req-note" data-id="${r.id}">Add note</button>
</div>
<div class="form-actions split-end"><span></span>
  <button class="btn btn-sm btn-danger" type="button" data-act="req-del" data-id="${r.id}">Delete request</button>
</div>`);
}

// ---------- workers ----------
async function pageWorkers() {
  const status = hashQuery().get('status') || '';
  const list = await api('/api/admin/workers' + (status ? `?status=${encodeURIComponent(status)}` : ''));
  return `<section class="card approval-guide">
    <div><strong>How to approve a worker</strong>
      <p>Open an application and review the profile. For paid registrations, check the receipt and transaction against your payment statement, then mark the payment verified before approving.</p>
    </div>
    <a class="btn btn-sm ${status === 'pending' ? 'btn-ghost' : 'btn-primary'}" href="#/workers?status=pending">Review pending</a>
  </section>`
    + filterSelect('workers', 'status', status, WORKER_LABEL, 'All statuses')
    + (list.length ? `<section class="card table-card">${workerTable(list)}</section>` : empty('No workers match this filter'));
}

async function openWorker(id) {
  const list = await api('/api/admin/workers');
  const w = list.find(x => x.id === id);
  if (!w) throw new Error('Worker not found');
  const p = w.payment;
  const payLine = p.required
    ? `PKR ${p.amount} · ${esc(p.method || '-')} · Txn ID <b>${esc(p.ref || '-')}</b> · ${p.verified ? '<span class="tag st-approved">Verified</span>' : '<span class="tag st-pending">Not verified</span>'}`
    : 'No fee required';
  const actionBtn = (status, cls, label) =>
    `<button class="btn ${cls}" type="button" data-act="worker-set" data-id="${w.id}" data-status="${status}">${label}</button>`;
  const actions = [
    w.status !== 'approved' && (!p.required || p.verified) && actionBtn('approved', 'btn-primary', '✔ Approve'),
    w.status !== 'rejected' && actionBtn('rejected', 'btn-danger', 'Reject'),
    w.status === 'approved' && actionBtn('suspended', 'btn-warn', 'Suspend'),
    w.status !== 'pending' && actionBtn('pending', 'btn-ghost', 'Set pending')
  ].filter(Boolean).join('');
  const verifyBtn = p.required && !p.verified
    ? `<button class="btn btn-sm" type="button" data-act="worker-verify" data-id="${w.id}">Mark payment verified</button>`
    : '';

  openModal(`Worker: ${w.name}`, `
<div class="worker-detail">
  ${w.photo ? `<img class="photo-lg" src="${esc(w.photo)}" alt="">` : `<div class="avatar lg">${esc(initials(w.name))}</div>`}
  <div>
    <h3>${esc(w.name)}</h3>
    <p>${esc(w.categoryName)} · ${esc(w.experience)} yrs · ${esc(w.cityName)}</p>
    <p><b>Phone:</b> <a href="tel:${esc(w.phone)}">${esc(w.phone)}</a> ·
      <a target="_blank" rel="noopener" href="${waLink(w.phone, `Hello ${w.name}, this is Hunar Near Me.`)}">WhatsApp ↗</a> ·
      shown publicly: ${w.showPhone ? 'yes' : 'no'}</p>
    <p><b>Areas:</b> ${esc(w.areas.map(a => a.name).join(', ') || 'Whole city')}</p>
    <p><b>About:</b> ${esc(w.bio || '-')}</p>
    <p><b>Registration fee:</b> ${payLine} ${verifyBtn}</p>
    ${p.proof ? `<p><b>Payment screenshot:</b> <a class="btn btn-sm" target="_blank" rel="noopener" href="/api/admin/workers/${encodeURIComponent(w.id)}/payment-proof">View receipt ↗</a></p>` : ''}
    ${p.required && !p.verified && w.status !== 'approved' ? '<p class="approval-note">Verify the payment before the Approve button becomes available.</p>' : ''}
    <p><b>Status:</b> ${workerTag(w.status)}</p>
  </div>
</div>
<div class="form-actions wrap">
  ${actions}
  <button class="btn btn-ghost btn-danger" type="button" data-act="worker-del" data-id="${w.id}">Delete</button>
</div>`);
}

// ---------- services / categories ----------
async function pageCategories() {
  const cats = await api('/api/admin/categories');
  state.cats = cats;
  return `
<div class="card-head">
  <p class="muted">Services shown on the website. Hide a service instead of deleting it if it is already used.</p>
  <button class="btn btn-primary" data-act="cat-add">+ Add service</button>
</div>
<section class="card table-card"><div class="table-wrap"><table>
  <thead><tr><th>#</th><th>Icon</th><th>Name</th><th>Urdu name</th><th>Sub-services</th><th>Status</th><th class="actions">Actions</th></tr></thead>
  <tbody>${cats.map((c, i) => `<tr>
    <td>${c.order}</td>
    <td class="icon-cell">${esc(c.icon)}</td>
    <td><b>${esc(c.name)}</b></td>
    <td dir="rtl">${esc(c.nameUr || '')}</td>
    <td><small>${esc((c.subServices || []).join(', '))}</small></td>
    <td>${c.active ? tag('Visible', 'st-approved') : tag('Hidden', 'st-suspended')}</td>
    <td class="actions">
      <button class="btn btn-sm btn-ghost" data-act="cat-move" data-id="${c.id}" data-dir="-1" ${i === 0 ? 'disabled' : ''}>↑</button>
      <button class="btn btn-sm btn-ghost" data-act="cat-move" data-id="${c.id}" data-dir="1" ${i === cats.length - 1 ? 'disabled' : ''}>↓</button>
      <button class="btn btn-sm" data-act="cat-edit" data-id="${c.id}">Edit</button>
      <button class="btn btn-sm btn-danger" data-act="cat-del" data-id="${c.id}">Delete</button>
    </td>
  </tr>`).join('')}</tbody>
</table></div></section>`;
}

// ---------- locations ----------
function locNode(type, node) {
  const child = CHILD[type];
  const addBtn = child
    ? `<button class="btn btn-sm" data-act="loc-add" data-type="${child[0]}" data-parent="${node.id}">+ ${LABEL[child[0]]}</button>`
    : '';
  const actions = `<span class="loc-actions">${addBtn}
    <button class="btn btn-sm btn-ghost" data-act="loc-edit" data-type="${type}" data-id="${node.id}" data-name="${esc(node.name)}">Rename</button>
    <button class="btn btn-sm btn-danger" data-act="loc-del" data-type="${type}" data-id="${node.id}" data-name="${esc(node.name)}">Delete</button>
  </span>`;
  if (!child) return `<div class="loc-leaf"><span>${esc(node.name)}</span>${actions}</div>`;
  const kids = node[child[1]];
  return `<details ${type === 'province' ? 'open' : ''}>
    <summary><span>${esc(node.name)} <small class="muted">(${kids.length})</small></span>${actions}</summary>
    ${kids.map(k => locNode(child[0], k)).join('')}
  </details>`;
}

async function pageLocations() {
  const locs = await api('/api/locations');
  const areaCount = locs.reduce((n, p) => n + p.cities.reduce((m, c) => m + c.areas.length, 0), 0);
  return `
<div class="card-head">
  <p class="muted">Province → City → Area / Society → Sub-area. These appear in every customer and worker dropdown.
    ${locs.length} provinces · ${areaCount} areas.</p>
  <button class="btn btn-primary" data-act="loc-add" data-type="province">+ Add province</button>
</div>
<div class="grid-loc">
  <section class="card loc-tree">
    ${locs.length ? locs.map(p => locNode('province', p)).join('') : empty('No locations yet. Add a province or use bulk import.')}
  </section>
  <section class="card">
    <h3>Bulk import</h3>
    <p class="muted small">One location per line, levels separated by <b>|</b>. Missing items are created automatically. Lines starting with <b>#</b> are ignored.</p>
    <form class="form" data-form="import">
      <textarea name="text" rows="12" required placeholder="Punjab | Lahore | Johar Town | Block A"></textarea>
      <div class="form-actions"><button class="btn btn-primary" type="submit">Import locations</button></div>
    </form>
    <details class="example"><summary>Example</summary><pre>Punjab | Lahore | Johar Town | Block A
Punjab | Lahore | Gulberg
Punjab | Faisalabad | Madina Town
Sindh | Karachi | Gulshan-e-Iqbal | Block 13
Balochistan | Quetta | Jinnah Town</pre></details>
  </section>
</div>`;
}

// ---------- ads / banners ----------
async function pageAds() {
  const list = await api('/api/admin/banners');
  return `
<div class="card-head">
  <p class="muted">Promotional banners rotate on the homepage. Recommended image size: 1600 × 600 px.</p>
  <button class="btn btn-primary" data-act="ad-add">+ New ad</button>
</div>
${list.length ? `<div class="ad-grid">${list.map(b => `
  <article class="card ad-card">
    <div class="ad-img" style="${b.image ? `background-image:url('${esc(b.image)}')` : ''}">${b.image ? '' : 'No image'}</div>
    <div class="ad-body">
      <strong>${esc(b.title)}</strong>
      <small class="muted">${esc(b.subtitle || '')}</small>
      <small>Link: <code>${esc(b.link)}</code></small>
      <div class="ad-actions">
        ${b.active ? tag('Live', 'st-approved') : tag('Paused', 'st-suspended')}
        <button class="btn btn-sm" data-act="ad-toggle" data-id="${b.id}" data-active="${b.active ? 1 : 0}">${b.active ? 'Pause' : 'Activate'}</button>
        <button class="btn btn-sm btn-danger" data-act="ad-del" data-id="${b.id}">Delete</button>
      </div>
    </div>
  </article>`).join('')}</div>` : empty('No ads yet. Create one to show on the homepage.')}`;
}

// ---------- settings ----------
const fieldInput = (name, label, value = '', type = 'text') =>
  `<label>${esc(label)}<input type="${type}" name="${name}" value="${esc(value)}"></label>`;

async function pageSettings() {
  const s = await api('/api/admin/settings');
  return `
<form class="card form narrow" data-form="settings">
  <h3>General</h3>
  <div class="grid-2">${fieldInput('siteName', 'Site name', s.siteName)}${fieldInput('tagline', 'Tagline', s.tagline)}</div>
  <h3>Worker registration fee</h3>
  <div class="grid-2">${fieldInput('registrationFee', 'Fee in PKR (0 = free pilot)', s.registrationFee, 'number')}</div>
  <div class="grid-2">
    ${fieldInput('easypaisaNumber', 'EasyPaisa number', s.easypaisaNumber)}
    ${fieldInput('easypaisaTitle', 'EasyPaisa account title', s.easypaisaTitle)}
    ${fieldInput('jazzcashNumber', 'JazzCash number', s.jazzcashNumber)}
    ${fieldInput('jazzcashTitle', 'JazzCash account title', s.jazzcashTitle)}
  </div>
  <h3>Contact</h3>
  <div class="grid-2">${fieldInput('supportPhone', 'Support phone', s.supportPhone)}${fieldInput('supportEmail', 'Support email', s.supportEmail)}</div>
  ${fieldInput('address', 'Office address', s.address)}
  <div class="form-actions"><button class="btn btn-primary" type="submit">Save settings</button></div>
</form>`;
}

// ---------- notifications ----------
async function pageNotifications() {
  const { items, unread } = await api('/api/admin/notifications');
    const alertStatus = !window.isSecureContext || !('Notification' in window) || !('serviceWorker' in navigator)
      ? 'Browser alerts need a supported browser and a secure HTTPS connection (localhost is supported).'
      : Notification.permission === 'granted'
        ? 'Browser alerts are enabled on this device.'
        : 'Enable browser permission to receive alerts when this tab is in the background.';
    if (unread) {
      api('/api/admin/notifications/read-all', { method: 'POST' }).then(() => refreshCounts()).catch(() => {});
    }
  return `
  <div class="card-head">
    <div><p class="muted">${unread} unread · newest first</p><p class="muted small">Keep the admin panel open for instant worker and service-request alerts on this device.</p></div>
    <button class="btn btn-sm" data-act="notif-desktop">Enable mobile &amp; desktop alerts</button>
  </div>
  <p class="muted small">${esc(alertStatus)}</p>
  <section class="card">${items.length ? items.map(n => `
  <div class="notif ${n.read ? '' : 'unread'}">
    <span class="notif-ico">${n.type === 'request' ? '📩' : '👷'}</span>
    <div style="flex:1">
      <strong>${esc(n.title)}</strong>
      <p class="muted">${esc(n.body)}</p>
      <small class="muted">${fmtDate(n.createdAt)}</small>
    </div>
    ${n.refId ? `<button class="btn btn-sm" data-act="${n.type === 'request' ? 'req-open' : 'worker-open'}" data-id="${esc(n.refId)}">Open</button>` : ''}
  </div>`).join('') : empty('No notifications yet')}</section>`;
}

// ---------- account ----------
async function pageAccount() {
  const { admin } = await api('/api/admin/me');
  return `
<form class="card form narrow" data-form="username">
  <h3>Change username</h3>
  <label>New username<input name="username" value="${esc(admin.username)}" required minlength="3" maxlength="32" pattern="[A-Za-z0-9._-]{3,32}" autocomplete="username"></label>
  <small class="muted">Use 3–32 letters, numbers, dots, underscores or hyphens.</small>
  <label>Confirm with current password<input type="password" name="currentPassword" required autocomplete="current-password"></label>
  <div class="form-actions"><button class="btn btn-primary" type="submit">Update username</button></div>
</form>
<form class="card form narrow" data-form="password">
  <h3>Change password</h3>
  <label>Current password<input type="password" name="currentPassword" required autocomplete="current-password"></label>
  <label>New password (minimum 8 characters)<input type="password" name="newPassword" required minlength="8" autocomplete="new-password"></label>
  <label>Confirm new password<input type="password" name="confirmPassword" required minlength="8" autocomplete="new-password"></label>
  <div class="form-actions"><button class="btn btn-primary" type="submit">Update password</button></div>
</form>`;
}

const RENDERERS = {
  dashboard: pageDashboard,
  requests: pageRequests,
  workers: pageWorkers,
  categories: pageCategories,
  locations: pageLocations,
  ads: pageAds,
  settings: pageSettings,
  notifications: pageNotifications,
  account: pageAccount
};
