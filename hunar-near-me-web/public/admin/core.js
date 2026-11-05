'use strict';
// Admin core: login, routing, live notifications, modal forms and all actions.
// Loaded after pages.js.

const PAGES = {
  dashboard: 'Dashboard', requests: 'Service requests', workers: 'Workers', categories: 'Services',
  locations: 'Locations', ads: 'Ads & banners', settings: 'Settings', notifications: 'Notifications', account: 'Account'
};

const state = { user: null, es: null, notificationRegistration: null, cats: [], modalSubmit: null, modalFields: [] };

const $ = (sel, root = document) => root.querySelector(sel);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const hashQuery = () => new URLSearchParams(location.hash.split('?')[1] || '');
const currentPage = () => {
  const page = location.hash.replace(/^#\/?/, '').split('?')[0];
  return PAGES[page] ? page : 'dashboard';
};

async function api(url, { method = 'GET', body } = {}) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  if (res.status === 401 && !url.includes('/login')) {
    showLogin();
    throw new Error('Your session has expired. Please log in again.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

function toast(message, type = 'ok') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = message;
  $('#toasts').append(el);
  setTimeout(() => el.remove(), 4200);
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    if (file.size > 3 * 1024 * 1024) return reject(new Error('Image must be smaller than 3 MB'));
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read the file'));
    reader.readAsDataURL(file);
  });
}

// ---------- modal ----------
function openModal(title, html) {
  $('#modalTitle').textContent = title;
  $('#modalBody').innerHTML = html;
  $('#modal').classList.remove('hidden');
}

function closeModal() {
  $('#modal').classList.add('hidden');
  $('#modalBody').innerHTML = '';
  state.modalSubmit = null;
}

function fieldHTML(f) {
  if (f.type === 'checkbox') {
    return `<label class="check"><input type="checkbox" name="${f.name}" ${f.value ? 'checked' : ''}> ${esc(f.label)}</label>`;
  }
  if (f.type === 'file') {
    return `<label>${esc(f.label)}<input type="file" name="${f.name}" accept="image/png,image/jpeg,image/webp"></label>`;
  }
  if (f.type === 'textarea') {
    return `<label>${esc(f.label)}<textarea name="${f.name}" rows="${f.rows || 3}">${esc(f.value)}</textarea></label>`;
  }
  return `<label>${esc(f.label)}<input type="${f.type || 'text'}" name="${f.name}" value="${esc(f.value)}" ${f.required ? 'required' : ''}></label>`;
}

// Generic add/edit form shown in the modal. onSubmit receives the collected values.
function formModal({ title, fields, submitText = 'Save', onSubmit }) {
  state.modalFields = fields;
  state.modalSubmit = onSubmit;
  openModal(title, `<form class="form" data-form="modal">
    ${fields.map(fieldHTML).join('')}
    <div class="form-actions">
      <button type="button" class="btn btn-ghost" data-close>Cancel</button>
      <button class="btn btn-primary" type="submit">${esc(submitText)}</button>
    </div>
  </form>`);
}

async function collect(form, fields) {
  const out = {};
  for (const f of fields) {
    const el = form.elements[f.name];
    if (f.type === 'checkbox') out[f.name] = el.checked;
    else if (f.type === 'file') out[f.name] = el.files[0] ? await readFile(el.files[0]) : '';
    else out[f.name] = el.value.trim();
  }
  return out;
}

// ---------- actions (buttons with data-act) ----------
const ACTIONS = {
  go: ({ page }) => { location.hash = '#/' + page; },
  logout: async () => {
    await api('/api/admin/logout', { method: 'POST' });
    showLogin();
  },

  // requests
  'req-open': ({ id }) => openRequest(id),
  'req-save': async ({ id }) => {
    await api(`/api/admin/requests/${id}`, {
      method: 'PUT',
      body: { status: $('#reqStatus').value, assignedWorkerId: $('#reqWorker').value }
    });
    toast('Request updated');
    closeModal();
    route();
    refreshCounts();
  },
  'req-note': async ({ id }) => {
    const text = $('#noteText').value.trim();
    if (!text) throw new Error('Write a note first');
    await api(`/api/admin/requests/${id}/notes`, { method: 'POST', body: { text } });
    toast('Note added');
    openRequest(id);
  },
  'req-del': async ({ id }) => {
    if (!confirm('Delete this request permanently?')) return;
    await api(`/api/admin/requests/${id}`, { method: 'DELETE' });
    toast('Request deleted');
    closeModal();
    route();
    refreshCounts();
  },

  // workers
  'worker-open': ({ id }) => openWorker(id),
  'worker-set': async ({ id, status }) => {
    await api(`/api/admin/workers/${id}`, { method: 'PUT', body: { status } });
    toast(`Worker marked ${status}`);
    closeModal();
    route();
    refreshCounts();
  },
  'worker-verify': async ({ id }) => {
    if (!confirm('Have you checked the transaction against your EasyPaisa / JazzCash statement and the receipt?')) return;
    await api(`/api/admin/workers/${id}`, { method: 'PUT', body: { paymentVerified: true } });
    toast('Payment marked verified');
    openWorker(id);
    route();
  },
  'worker-del': async ({ id }) => {
    if (!confirm('Delete this worker application permanently?')) return;
    await api(`/api/admin/workers/${id}`, { method: 'DELETE' });
    toast('Worker deleted');
    closeModal();
    route();
    refreshCounts();
  },

  // services
  'cat-add': () => formModal({
    title: 'Add service', submitText: 'Create service',
    fields: catFieldsFor({}),
    onSubmit: v => api('/api/admin/categories', { method: 'POST', body: v })
  }),
  'cat-edit': ({ id }) => {
    const c = state.cats.find(x => x.id === id);
    if (!c) throw new Error('Service not found, please refresh');
    formModal({
      title: 'Edit service', submitText: 'Save changes',
      fields: catFieldsFor(c),
      onSubmit: v => api(`/api/admin/categories/${id}`, { method: 'PUT', body: v })
    });
  },
  'cat-move': ({ id, dir }) => api(`/api/admin/categories/${id}/move`, { method: 'POST', body: { dir: Number(dir) } }).then(route),
  'cat-del': async ({ id }) => {
    if (!confirm('Delete this service? This is blocked if it is already used.')) return;
    await api(`/api/admin/categories/${id}`, { method: 'DELETE' });
    toast('Service deleted');
    route();
  },

  // locations
  'loc-add': ({ type, parent }) => formModal({
    title: `Add ${LABEL[type]}`, submitText: 'Add',
    fields: [{ name: 'name', label: `${LABEL[type]} name *`, required: true, placeholder: 'e.g. Johar Town' }],
    onSubmit: v => api('/api/admin/locations', { method: 'POST', body: { type, parentId: parent, name: v.name } })
  }),
  'loc-edit': ({ type, id, name }) => formModal({
    title: `Rename ${LABEL[type]}`, submitText: 'Save name',
    fields: [{ name: 'name', label: 'Name *', required: true, value: name }],
    onSubmit: v => api(`/api/admin/locations/${type}/${id}`, { method: 'PUT', body: { name: v.name } })
  }),
  'loc-del': async ({ type, id, name }) => {
    if (!confirm(`Delete "${name}" and everything inside it?`)) return;
    await api(`/api/admin/locations/${type}/${id}`, { method: 'DELETE' });
    toast('Location deleted');
    route();
  },

  // ads
  'ad-add': () => formModal({
    title: 'New ad', submitText: 'Publish ad',
    fields: adFieldsFor({}),
    onSubmit: v => api('/api/admin/banners', { method: 'POST', body: v })
  }),
  'ad-toggle': ({ id, active }) => api(`/api/admin/banners/${id}`, { method: 'PUT', body: { active: active !== '1' } })
    .then(() => { toast('Ad updated'); route(); }),
  'ad-del': async ({ id }) => {
    if (!confirm('Delete this ad?')) return;
    await api(`/api/admin/banners/${id}`, { method: 'DELETE' });
    toast('Ad deleted');
    route();
  },

  // notifications
  'notif-desktop': async () => {
    if (!window.isSecureContext || !('Notification' in window) || !('serviceWorker' in navigator)) {
      throw new Error('Browser alerts need a supported browser and a secure HTTPS connection (localhost is supported)');
    }
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') throw new Error('Alert permission was not granted. You can enable it in your browser settings.');
    await registerNotificationWorker();
    toast('Browser alerts enabled on this device');
    route();
  }
};

function catFieldsFor(c) {
  return [
    { name: 'name', label: 'Service name (English) *', value: c.name || '', required: true },
    { name: 'nameUr', label: 'Urdu name', value: c.nameUr || '' },
    { name: 'icon', label: 'Icon (emoji)', value: c.icon || '🛠️' },
    { name: 'subServices', label: 'Sub-services (comma separated)', type: 'textarea', rows: 3, value: (c.subServices || []).join(', ') },
    { name: 'active', label: 'Show on website', type: 'checkbox', value: c.active !== false }
  ];
}

function adFieldsFor(b) {
  return [
    { name: 'title', label: 'Headline *', value: b.title || '', required: true },
    { name: 'subtitle', label: 'Short text', value: b.subtitle || '' },
    { name: 'link', label: 'Link (e.g. #/workers or https://...)', value: b.link || '#/workers' },
    { name: 'image', label: 'Banner image (PNG, JPG or WEBP, max 3 MB, optional)', type: 'file' },
    { name: 'active', label: 'Show on homepage', type: 'checkbox', value: b.active !== false }
  ];
}

// ---------- form submissions (forms with data-form) ----------
const SUBMITS = {
  login: async form => {
    $('#loginErr').textContent = '';
    await api('/api/admin/login', {
      method: 'POST',
      body: { username: form.elements.username.value, password: form.elements.password.value }
    });
    form.elements.password.value = '';
    boot();
  },

  modal: async form => {
    const values = await collect(form, state.modalFields);
    await state.modalSubmit(values);
    closeModal();
    toast('Saved successfully');
    route();
    refreshCounts();
  },

  settings: async form => {
    const body = Object.fromEntries(new FormData(form).entries());
    await api('/api/admin/settings', { method: 'PUT', body });
    toast('Settings saved');
  },

  password: async form => {
    const f = form.elements;
    if (f.newPassword.value !== f.confirmPassword.value) throw new Error('New passwords do not match');
    await api('/api/admin/password', {
      method: 'POST',
      body: { currentPassword: f.currentPassword.value, newPassword: f.newPassword.value }
    });
    form.reset();
    toast('Password updated');
  },

  username: async form => {
    const f = form.elements;
    const result = await api('/api/admin/username', {
      method: 'POST',
      body: { username: f.username.value, currentPassword: f.currentPassword.value }
    });
    state.user = result.admin;
    $('#whoami').textContent = result.admin.name;
    f.username.value = result.admin.username;
    f.currentPassword.value = '';
    toast('Username updated');
  },

  import: async form => {
    const r = await api('/api/admin/locations/import', { method: 'POST', body: { text: form.elements.text.value } });
    toast(`Imported: ${r.created} new item(s), ${r.skipped} line(s) skipped`);
    route();
  }
};

// ---------- global event wiring ----------
document.addEventListener('click', async e => {
  if (e.target.closest('[data-close]') || e.target.id === 'modal') return closeModal();
  const el = e.target.closest('[data-act]');
  if (!el) return;
  e.preventDefault();
  const fn = ACTIONS[el.dataset.act];
  if (!fn) return;
  try {
    await fn(el.dataset, el);
  } catch (err) {
    toast(err.message, 'err');
  }
});

document.addEventListener('submit', async e => {
  const kind = e.target.dataset.form;
  if (!kind || !SUBMITS[kind]) return;
  e.preventDefault();
  try {
    await SUBMITS[kind](e.target);
  } catch (err) {
    if (kind === 'login') $('#loginErr').textContent = err.message;
    else toast(err.message, 'err');
  }
});

// Filter dropdowns update the URL (e.g. #/requests?status=new)
document.addEventListener('change', e => {
  const page = e.target.dataset.filter;
  if (!page) return;
  const q = new URLSearchParams();
  if (e.target.value) q.set(e.target.dataset.key, e.target.value);
  const h = '#/' + page + (q.toString() ? '?' + q : '');
  if (location.hash === h) route(); else location.hash = h;
});

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
window.addEventListener('hashchange', route);

// ---------- live notifications ----------
function beep() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    gain.gain.value = 0.08;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
    setTimeout(() => ctx.close(), 500);
  } catch (err) {
    // Browser blocked audio before any user interaction. Safe to ignore.
  }
}

function connectEvents() {
  if (state.es) state.es.close();
  state.es = new EventSource('/api/admin/events');
  state.es.addEventListener('notification', e => {
    const n = JSON.parse(e.data);
    toast(`${n.title}: ${n.body}`, 'info');
    beep();
    if (document.visibilityState === 'hidden' && state.notificationRegistration && Notification.permission === 'granted') {
      state.notificationRegistration.showNotification(n.title, {
        body: n.body,
        tag: n.id,
        data: { path: n.type === 'request' ? '#/requests' : '#/workers' }
      }).catch(err => console.warn('Could not display browser notification:', err));
    }
    refreshCounts();
    if (['dashboard', 'requests', 'workers', 'notifications'].includes(currentPage())) route();
  });
}

async function registerNotificationWorker() {
  if (!state.notificationRegistration) {
    await navigator.serviceWorker.register('/service-worker.js');
    state.notificationRegistration = await navigator.serviceWorker.ready;
  }
}

function setCount(selector, n) {
  const el = $(selector);
  el.textContent = n;
  el.classList.toggle('hidden', !n);
}

function setBadge(page, n) {
  const el = document.querySelector(`#nav [data-page="${page}"] .badge-count`);
  if (!el) return;
  el.textContent = n;
  el.classList.toggle('hidden', !n);
}

async function refreshCounts() {
  if (!state.user) return;
  try {
    const [stats, notes] = await Promise.all([api('/api/admin/stats'), api('/api/admin/notifications')]);
    setCount('#bellCount', notes.unread);
    setBadge('requests', stats.requests.new);
    setBadge('workers', stats.workers.pending);
  } catch (err) {
    // Counters are a convenience. Ignore failures.
  }
}

// ---------- routing and boot ----------
async function route() {
  if (!state.user) return;
  const page = currentPage();
  document.querySelectorAll('#nav a').forEach(a => a.classList.toggle('active', a.dataset.page === page));
  $('#pageTitle').textContent = PAGES[page];
  $('#page').innerHTML = '<div class="loader"></div>';
  try {
    $('#page').innerHTML = await RENDERERS[page]();
  } catch (err) {
    $('#page').innerHTML = `<div class="card error-card">${esc(err.message)}</div>`;
  }
}

function showLogin() {
  state.user = null;
  if (state.es) { state.es.close(); state.es = null; }
  $('#appView').classList.add('hidden');
  $('#loginView').classList.remove('hidden');
}

async function boot() {
  try {
    const { admin } = await api('/api/admin/me');
    state.user = admin;
    $('#whoami').textContent = admin.name;
    $('#loginView').classList.add('hidden');
    $('#appView').classList.remove('hidden');
    connectEvents();
    refreshCounts();
    route();
    if ('Notification' in window && Notification.permission === 'granted'
      && window.isSecureContext && 'serviceWorker' in navigator) {
      registerNotificationWorker().catch(err => toast(`Could not enable browser alerts: ${err.message}`, 'err'));
    }
  } catch (err) {
    showLogin();
  }
}

boot();
