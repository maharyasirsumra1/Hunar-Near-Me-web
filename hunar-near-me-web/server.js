'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const { store, uid, now, hashPassword, verifyPassword } = require('./lib/store');

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const PAYMENT_UPLOAD_DIR = path.join(__dirname, 'private-uploads', 'payment-proofs');
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';
const SESSION_MS = 12 * 60 * 60 * 1000;
const LOCK_MS = 15 * 60 * 1000;
const WORKER_STATUSES = ['pending', 'approved', 'rejected', 'suspended'];
const REQUEST_STATUSES = ['new', 'contacted', 'assigned', 'in_progress', 'completed', 'cancelled'];

fs.mkdirSync(UPLOAD_DIR, { recursive: true });
fs.mkdirSync(PAYMENT_UPLOAD_DIR, { recursive: true });
const db = store.load();
if (store.created) {
  console.log('\n  First run: default admin account created.');
  console.log(`  Username: admin   Password: ${store.adminPassword}`);
  console.log('  Change it from Admin > Account after you log in.\n');
}

// ---------- helpers ----------
const fail = (status, message) => Object.assign(new Error(message), { status });
const str = (v, max = 200) => String(v ?? '').trim().slice(0, max);
const num = (v, fallback = 0) => { const n = Number(v); return Number.isFinite(n) ? n : fallback; };
const bool = v => v === true || v === 'true' || v === 'on' || v === 1 || v === '1';
const byOrder = (a, b) => (a.order || 0) - (b.order || 0);
const safeLink = v => { const l = str(v, 200); return /^(#\/|https?:\/\/)/.test(l) ? l : '#/workers'; };
const wrap = fn => (req, res, next) => { try { fn(req, res, next); } catch (err) { next(err); } };
const countBy = (list, status) => list.filter(x => x.status === status).length;
const body = req => req.body || {};

function getCookies(req) {
  const out = {};
  for (const part of String(req.headers.cookie || '').split(';')) {
    const i = part.indexOf('=');
    if (i < 1) continue;
    try { out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim()); } catch (e) { /* ignore bad cookie */ }
  }
  return out;
}

// Accepts 03XXXXXXXXX, 03XX-XXXXXXX, +923XXXXXXXXX or 923XXXXXXXXX
function normalizePhone(value) {
  let p = String(value || '').replace(/[\s\-()]/g, '');
  if (p.startsWith('+92')) p = '0' + p.slice(3);
  else if (p.startsWith('92') && p.length === 12) p = '0' + p.slice(2);
  return /^03\d{9}$/.test(p) ? p : null;
}

function findCity(cityId) {
  for (const province of db.locations) {
    const city = province.cities.find(c => c.id === cityId);
    if (city) return { province, city };
  }
  return null;
}

// Finds any location node by type: province | city | area | subArea
function locateNode(type, id) {
  for (const province of db.locations) {
    if (type === 'province' && province.id === id) return { node: province, list: db.locations };
    for (const city of province.cities) {
      if (type === 'city' && city.id === id) return { node: city, list: province.cities };
      for (const area of city.areas) {
        if (type === 'area' && area.id === id) return { node: area, list: city.areas };
        for (const sub of area.subAreas) {
          if (type === 'subArea' && sub.id === id) return { node: sub, list: area.subAreas };
        }
      }
    }
  }
  return null;
}

function newLocation(type, name) {
  if (type === 'province') return { id: uid('prv_'), name, cities: [] };
  if (type === 'city') return { id: uid('cty_'), name, areas: [] };
  if (type === 'area') return { id: uid('area_'), name, subAreas: [] };
  return { id: uid('sub_'), name };
}

function collectIds(node, set = new Set()) {
  set.add(node.id);
  for (const key of ['cities', 'areas', 'subAreas']) (node[key] || []).forEach(child => collectIds(child, set));
  return set;
}

// Number of worker/request records that point at any id in the set
function locationUsage(ids) {
  return db.workers.filter(w => ids.has(w.cityId) || w.areas.some(a => ids.has(a.id))).length
    + db.requests.filter(r => ids.has(r.cityId) || ids.has(r.areaId)).length;
}

function cleanCategory(b, existing) {
  const name = str(b.name, 60);
  if (!name) throw fail(400, 'Service name is required');
  const subs = Array.isArray(b.subServices) ? b.subServices : String(b.subServices || '').split(',');
  return {
    name,
    nameUr: str(b.nameUr, 60),
    icon: str(b.icon, 8) || '🛠️',
    subServices: subs.map(s => str(s, 60)).filter(Boolean).slice(0, 30),
    active: b.active === undefined ? (existing ? existing.active : true) : bool(b.active)
  };
}

// Validates a base64 data URL image (PNG/JPG/WEBP, max 3 MB) and checks magic bytes.
function saveValidatedImage(dataUrl, directory) {
  const m = /^data:image\/(png|jpe?g|webp);base64,([A-Za-z0-9+/=]+)$/.exec(String(dataUrl || ''));
  if (!m) throw fail(400, 'Only PNG, JPG or WEBP images are allowed');
  const buf = Buffer.from(m[2], 'base64');
  if (buf.length > 3 * 1024 * 1024) throw fail(400, 'Image must be smaller than 3 MB');
  const isPng = buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const isJpg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  const isWebp = buf.subarray(0, 4).toString('latin1') === 'RIFF' && buf.subarray(8, 12).toString('latin1') === 'WEBP';
  if (!isPng && !isJpg && !isWebp) throw fail(400, 'File content is not a valid image');
  const ext = isPng ? 'png' : isJpg ? 'jpg' : 'webp';
  const name = crypto.randomBytes(12).toString('hex') + '.' + ext;
  fs.writeFileSync(path.join(directory, name), buf);
  return name;
}

function saveImage(dataUrl) {
  return '/uploads/' + saveValidatedImage(dataUrl, UPLOAD_DIR);
}

function savePaymentProof(dataUrl) {
  return saveValidatedImage(dataUrl, PAYMENT_UPLOAD_DIR);
}

function removeUpload(url) {
  if (!url || !String(url).startsWith('/uploads/')) return;
  fs.unlink(path.join(UPLOAD_DIR, path.basename(url)), () => {});
}

function removePaymentProof(name) {
  if (!name) return;
  fs.unlink(path.join(PAYMENT_UPLOAD_DIR, path.basename(name)), () => {});
}

// ---------- realtime notifications (Server-Sent Events) ----------
const clients = new Set();

function broadcast(event, data) {
  const msg = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of clients) client.write(msg);
}

function notify(type, title, text, refId) {
  const item = { id: uid('ntf_'), type, title, body: text, refId, read: false, createdAt: now() };
  db.notifications.unshift(item);
  if (db.notifications.length > 300) db.notifications.length = 300;
  store.touch();
  broadcast('notification', item);
}

// ---------- admin sessions and brute-force protection ----------
const sessions = new Map();   // token -> { adminId, expires }
const loginFails = new Map(); // ip -> { count, lockedUntil }

function requireAdmin(req, res, next) {
  const token = getCookies(req).hn_session;
  const session = token ? sessions.get(token) : null;
  if (!session || session.expires < Date.now()) {
    if (token) sessions.delete(token);
    return res.status(401).json({ error: 'Please log in to continue' });
  }
  const admin = db.admins.find(a => a.id === session.adminId);
  if (!admin) return res.status(401).json({ error: 'Please log in to continue' });
  session.expires = Date.now() + SESSION_MS;
  req.admin = admin;
  next();
}

// ---------- visitor analytics ----------
function dayKey(d) {
  return new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

// Counts a page view of the public site. Visitors are identified by a random cookie, stored hashed.
function trackVisit(req, res) {
  let vid = getCookies(req).hn_vid;
  if (!vid || !/^[a-f0-9]{32}$/.test(vid)) {
    vid = crypto.randomBytes(16).toString('hex');
    res.append('Set-Cookie', `hn_vid=${vid}; Path=/; Max-Age=31536000; SameSite=Lax`);
  }
  const hash = crypto.createHash('sha256').update(vid).digest('hex').slice(0, 24);
  const stats = db.stats;
  const day = dayKey(new Date());
  const d = stats.daily[day] || (stats.daily[day] = { views: 0, visitors: [] });
  d.views += 1;
  stats.totalViews += 1;
  if (!d.visitors.includes(hash)) d.visitors.push(hash);
  stats.seen[hash] = 1;
  const keys = Object.keys(stats.daily).sort();
  while (keys.length > 90) delete stats.daily[keys.shift()];
  store.touch();
}

function statsSummary() {
  const series = [];
  for (let i = 13; i >= 0; i--) {
    const key = dayKey(new Date(Date.now() - i * 86400000));
    const d = db.stats.daily[key];
    series.push({ date: key, views: d ? d.views : 0, visitors: d ? d.visitors.length : 0 });
  }
  const cities = db.locations.reduce((n, p) => n + p.cities.length, 0);
  const areas = db.locations.reduce((n, p) => n + p.cities.reduce((m, c) => m + c.areas.length, 0), 0);
  const reqs = db.requests;
  return {
    totalViews: db.stats.totalViews,
    uniqueVisitors: Object.keys(db.stats.seen).length,
    today: series[series.length - 1],
    series,
    requests: {
      total: reqs.length,
      new: countBy(reqs, 'new'),
      active: reqs.filter(r => ['contacted', 'assigned', 'in_progress'].includes(r.status)).length,
      completed: countBy(reqs, 'completed')
    },
    workers: {
      total: db.workers.length,
      pending: countBy(db.workers, 'pending'),
      approved: countBy(db.workers, 'approved'),
      rejected: countBy(db.workers, 'rejected'),
      suspended: countBy(db.workers, 'suspended')
    },
    categories: db.categories.filter(c => c.active).length,
    locations: { provinces: db.locations.length, cities, areas }
  };
}

// ---------- app ----------
const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '6mb' }));
app.use((req, res, next) => {
  res.set({ 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'SAMEORIGIN', 'Referrer-Policy': 'strict-origin-when-cross-origin' });
  next();
});
app.use((req, res, next) => {
  if (req.method === 'GET' && req.path === '/') trackVisit(req, res);
  next();
});
app.use(express.static(PUBLIC_DIR));
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '7d' }));

// ---------- public API ----------
const publicWorker = w => ({
  id: w.id, name: w.name, photo: w.photo, categoryId: w.categoryId, categoryName: w.categoryName,
  cityId: w.cityId, cityName: w.cityName, areas: w.areas, experience: w.experience, bio: w.bio,
  phone: w.showPhone ? w.phone : '', verified: w.status === 'approved'
});

app.get('/api/settings', (req, res) => res.json(db.settings));
app.get('/api/maps-config', (req, res) => res.json({ apiKey: GOOGLE_MAPS_API_KEY }));
app.get('/api/categories', (req, res) => res.json(db.categories.filter(c => c.active).sort(byOrder)));
app.get('/api/locations', (req, res) => res.json(db.locations));
app.get('/api/banners', (req, res) => res.json(db.banners.filter(b => b.active).sort(byOrder)));

app.get('/api/workers', (req, res) => {
  const { categoryId, cityId, areaId } = req.query;
  let list = db.workers.filter(w => w.status === 'approved');
  if (categoryId) list = list.filter(w => w.categoryId === categoryId);
  if (cityId) list = list.filter(w => w.cityId === cityId);
  if (areaId) list = list.filter(w => w.areas.length === 0 || w.areas.some(a => a.id === areaId));
  list = list.slice().sort((a, b) => b.experience - a.experience);
  res.json(list.map(publicWorker));
});

app.post('/api/workers', wrap((req, res) => {
  const b = body(req);
  const name = str(b.name, 80);
  const phone = normalizePhone(b.phone);
  const category = db.categories.find(c => c.id === b.categoryId && c.active);
  const loc = findCity(b.cityId);
  const fee = Math.max(0, num(db.settings.registrationFee));
  const method = ['easypaisa', 'jazzcash'].includes(b.paymentMethod) ? b.paymentMethod : '';
  const paymentRef = str(b.paymentRef, 60);
  if (name.length < 3) throw fail(400, 'Please enter your full name');
  if (!phone) throw fail(400, 'Enter a valid Pakistani mobile number (03XX-XXXXXXX)');
  if (!category) throw fail(400, 'Please choose your profession');
  if (!loc) throw fail(400, 'Please choose your city');
  if (db.workers.some(w => w.phone === phone && w.status !== 'rejected')) {
    throw fail(409, 'An application with this mobile number already exists');
  }
  if (fee > 0 && (!method || paymentRef.length < 4 || !b.paymentScreenshot)) {
    throw fail(400, `Registration fee of PKR ${fee} is required. Choose the payment method, enter the transaction ID and attach the payment screenshot.`);
  }
  const wanted = Array.isArray(b.areaIds) ? b.areaIds.map(String) : [];
  const areas = loc.city.areas.filter(a => wanted.includes(a.id)).map(a => ({ id: a.id, name: a.name }));
  let photo = '';
  let proof = '';
  try {
    photo = b.photo ? saveImage(b.photo) : '';
    proof = fee > 0 ? savePaymentProof(b.paymentScreenshot) : '';
  } catch (err) {
    removeUpload(photo);
    removePaymentProof(proof);
    throw err;
  }
  const worker = {
    id: uid('wrk_'), name, phone, categoryId: category.id, categoryName: category.name,
    experience: Math.min(60, Math.max(0, num(b.experience))), bio: str(b.bio, 500),
    provinceName: loc.province.name, cityId: loc.city.id, cityName: loc.city.name, areas,
    showPhone: bool(b.showPhone), photo, status: 'pending',
    payment: {
      required: fee > 0, amount: fee, method, ref: paymentRef, verified: false,
      proof
    },
    notes: '', createdAt: now(), updatedAt: now()
  };
  db.workers.push(worker);
  store.touch();
  notify('worker', 'New worker application', `${name} (${category.name}) from ${loc.city.name}`, worker.id);
  res.status(201).json({ ok: true, message: 'Application received. Our team will verify it shortly.' });
}));

app.post('/api/requests', wrap((req, res) => {
  const b = body(req);
  const name = str(b.name, 80);
  const phone = normalizePhone(b.phone);
  const category = db.categories.find(c => c.id === b.categoryId && c.active);
  const loc = findCity(b.cityId);
  const area = loc ? loc.city.areas.find(a => a.id === b.areaId) : null;
  const locationName = str(b.locationName, 300);
  const selectedAddress = str(b.address, 200);
  const hasLatitude = String(b.latitude ?? '').trim() !== '';
  const hasLongitude = String(b.longitude ?? '').trim() !== '';
  const latitude = hasLatitude ? Number(b.latitude) : NaN;
  const longitude = hasLongitude ? Number(b.longitude) : NaN;
  const description = str(b.description, 1000);
  const date = str(b.preferredDate, 10);
  if (name.length < 3) throw fail(400, 'Please enter your name');
  if (!phone) throw fail(400, 'Enter a valid Pakistani mobile number');
  if (!category) throw fail(400, 'Please choose a service');
  if (b.cityId && !loc) throw fail(400, 'Please choose a valid city');
  if (b.areaId && (!loc || !area)) throw fail(400, 'Please choose a valid area');
  if (!loc && !locationName && !selectedAddress) throw fail(400, 'Please choose your location');
  if (hasLatitude !== hasLongitude
    || (hasLatitude && (!Number.isFinite(latitude) || !Number.isFinite(longitude)
      || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180))) {
    throw fail(400, 'The selected map coordinates are invalid');
  }
  if (description.length < 10) throw fail(400, 'Please describe the work in at least 10 characters');
  db.counters.request += 1;
  const request = {
    id: uid('req_'),
    code: 'HN-' + String(db.counters.request).padStart(5, '0'),
    name, phone,
    categoryId: category.id, categoryName: category.name,
    provinceName: loc ? loc.province.name : str(b.provinceName, 100),
    cityId: loc ? loc.city.id : '', cityName: loc ? loc.city.name : str(b.cityName, 100),
    areaId: area ? area.id : '', areaName: area ? area.name : str(b.areaName, 100),
    locationName, latitude: Number.isFinite(latitude) ? latitude : null,
    longitude: Number.isFinite(longitude) ? longitude : null,
    address: selectedAddress, description,
    preferredDate: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : '',
    status: 'new', assignedWorkerId: '', assignedWorkerName: '', assignedWorkerPhone: '',
    notes: [], createdAt: now(), updatedAt: now()
  };
  db.requests.unshift(request);
  store.touch();
  const requestLocation = [request.cityName, request.areaName].filter(Boolean).join(', ')
    || request.locationName || request.address || 'Location not specified';
  notify('request', `New service request ${request.code}`,
    `${category.name} needed in ${requestLocation} - ${name} (${phone})`, request.id);
  res.status(201).json({ ok: true, code: request.code, status: request.status });
}));

app.get('/api/requests/track', wrap((req, res) => {
  const code = str(req.query.code, 20).toUpperCase();
  const phone = normalizePhone(req.query.phone);
  const r = phone && db.requests.find(x => x.code === code && x.phone === phone);
  if (!r) throw fail(404, 'No request matches this code and mobile number');
  const assignedWorker = r.assignedWorkerId && db.workers.find(w => w.id === r.assignedWorkerId);
  res.json({
    code: r.code, status: r.status, categoryName: r.categoryName,
    cityName: r.cityName, areaName: r.areaName, locationName: r.locationName || '',
    assignedWorkerName: r.assignedWorkerName || '',
    assignedWorkerPhone: assignedWorker && assignedWorker.showPhone ? r.assignedWorkerPhone || '' : '',
    createdAt: r.createdAt, updatedAt: r.updatedAt
  });
}));

// ---------- admin auth ----------
app.post('/api/admin/login', wrap((req, res) => {
  const ip = req.ip || 'unknown';
  const lock = loginFails.get(ip) || { count: 0, lockedUntil: 0 };
  if (lock.lockedUntil > Date.now()) throw fail(429, 'Too many failed attempts. Please wait 15 minutes.');
  const username = str(body(req).username, 60).toLowerCase();
  const admin = db.admins.find(a => a.username.toLowerCase() === username);
  if (!admin || !verifyPassword(body(req).password, admin.passwordHash)) {
    lock.count += 1;
    if (lock.count >= 5) { lock.lockedUntil = Date.now() + LOCK_MS; lock.count = 0; }
    loginFails.set(ip, lock);
    throw fail(401, 'Invalid username or password');
  }
  loginFails.delete(ip);
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, { adminId: admin.id, expires: Date.now() + SESSION_MS });
  res.set('Set-Cookie', `hn_session=${token}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${SESSION_MS / 1000}`);
  res.json({ ok: true, admin: { id: admin.id, username: admin.username, name: admin.name } });
}));

app.post('/api/admin/logout', (req, res) => {
  const token = getCookies(req).hn_session;
  if (token) sessions.delete(token);
  res.set('Set-Cookie', 'hn_session=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0');
  res.json({ ok: true });
});

app.get('/api/admin/me', requireAdmin, (req, res) => {
  res.json({ admin: { id: req.admin.id, username: req.admin.username, name: req.admin.name } });
});

app.post('/api/admin/password', requireAdmin, wrap((req, res) => {
  const b = body(req);
  if (!verifyPassword(b.currentPassword, req.admin.passwordHash)) throw fail(400, 'Current password is incorrect');
  if (String(b.newPassword || '').length < 8) throw fail(400, 'New password must be at least 8 characters');
  req.admin.passwordHash = hashPassword(b.newPassword);
  store.touch();
  res.json({ ok: true });
}));

app.post('/api/admin/username', requireAdmin, wrap((req, res) => {
  const username = String(body(req).username ?? '').trim();
  if (!/^[a-zA-Z0-9._-]{3,32}$/.test(username)) {
    throw fail(400, 'Username must be 3–32 characters and use only letters, numbers, dots, underscores or hyphens');
  }
  if (!verifyPassword(body(req).currentPassword, req.admin.passwordHash)) {
    throw fail(400, 'Current password is incorrect');
  }
  if (db.admins.some(admin => admin.id !== req.admin.id && admin.username.toLowerCase() === username.toLowerCase())) {
    throw fail(409, 'That username is already in use');
  }
  req.admin.username = username;
  store.touch();
  res.json({ ok: true, admin: { id: req.admin.id, username: req.admin.username, name: req.admin.name } });
}));

// Live notification stream for the admin panel
app.get('/api/admin/events', requireAdmin, (req, res) => {
  res.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
  res.flushHeaders();
  res.write('retry: 5000\n\n');
  clients.add(res);
  const ping = setInterval(() => res.write(': ping\n\n'), 25000);
  req.on('close', () => { clearInterval(ping); clients.delete(res); });
});

// ---------- admin: dashboard, notifications, settings ----------
app.get('/api/admin/stats', requireAdmin, (req, res) => res.json(statsSummary()));

app.get('/api/admin/notifications', requireAdmin, (req, res) => {
  res.json({
    items: db.notifications.slice(0, 100),
    unread: db.notifications.filter(n => !n.read).length
  });
});

app.post('/api/admin/notifications/read-all', requireAdmin, (req, res) => {
  db.notifications.forEach(n => { n.read = true; });
  store.touch();
  res.json({ ok: true });
});

app.get('/api/admin/settings', requireAdmin, (req, res) => res.json(db.settings));

const SETTING_LIMITS = {
  siteName: 60, tagline: 140, easypaisaNumber: 20, easypaisaTitle: 60,
  jazzcashNumber: 20, jazzcashTitle: 60, supportPhone: 30, supportEmail: 80, address: 160
};

app.put('/api/admin/settings', requireAdmin, wrap((req, res) => {
  const b = body(req);
  const s = db.settings;
  // Only fields that were sent are changed, so a partial update never blanks other values
  for (const [key, max] of Object.entries(SETTING_LIMITS)) {
    if (b[key] !== undefined) s[key] = str(b[key], max);
  }
  if (b.registrationFee !== undefined) s.registrationFee = Math.max(0, Math.round(num(b.registrationFee)));
  if (!s.siteName) s.siteName = 'Hunar Near Me';
  store.touch();
  res.json(s);
}));

// ---------- admin: services / categories ----------
app.get('/api/admin/categories', requireAdmin, (req, res) => res.json(db.categories.slice().sort(byOrder)));

app.post('/api/admin/categories', requireAdmin, wrap((req, res) => {
  const item = { id: uid('cat_'), ...cleanCategory(body(req)), order: db.categories.length + 1, createdAt: now() };
  db.categories.push(item);
  store.touch();
  res.status(201).json(item);
}));

app.put('/api/admin/categories/:id', requireAdmin, wrap((req, res) => {
  const item = db.categories.find(c => c.id === req.params.id);
  if (!item) throw fail(404, 'Service not found');
  Object.assign(item, cleanCategory(body(req), item));
  store.touch();
  res.json(item);
}));

app.post('/api/admin/categories/:id/move', requireAdmin, wrap((req, res) => {
  const list = db.categories.slice().sort(byOrder);
  const i = list.findIndex(c => c.id === req.params.id);
  if (i < 0) throw fail(404, 'Service not found');
  const j = i + (num(body(req).dir) < 0 ? -1 : 1);
  if (j >= 0 && j < list.length) {
    [list[i], list[j]] = [list[j], list[i]];
    list.forEach((c, k) => { c.order = k + 1; });
    store.touch();
  }
  res.json({ ok: true });
}));

app.delete('/api/admin/categories/:id', requireAdmin, wrap((req, res) => {
  const idx = db.categories.findIndex(c => c.id === req.params.id);
  if (idx < 0) throw fail(404, 'Service not found');
  const used = db.workers.filter(w => w.categoryId === req.params.id).length
    + db.requests.filter(r => r.categoryId === req.params.id).length;
  if (used) throw fail(409, `This service is used by ${used} record(s). Hide it instead of deleting.`);
  db.categories.splice(idx, 1);
  db.categories.sort(byOrder).forEach((c, k) => { c.order = k + 1; });
  store.touch();
  res.json({ ok: true });
}));

// ---------- admin: locations ----------
app.post('/api/admin/locations', requireAdmin, wrap((req, res) => {
  const b = body(req);
  const name = str(b.name, 100);
  if (!name) throw fail(400, 'Name is required');
  if (b.type === 'province') {
    db.locations.push(newLocation('province', name));
  } else if (['city', 'area', 'subArea'].includes(b.type)) {
    const parentType = { city: 'province', area: 'city', subArea: 'area' }[b.type];
    const key = { city: 'cities', area: 'areas', subArea: 'subAreas' }[b.type];
    const parent = locateNode(parentType, b.parentId);
    if (!parent) throw fail(404, 'Parent location not found');
    parent.node[key].push(newLocation(b.type, name));
  } else {
    throw fail(400, 'Invalid location type');
  }
  store.touch();
  res.status(201).json({ ok: true });
}));

app.put('/api/admin/locations/:type/:id', requireAdmin, wrap((req, res) => {
  const found = locateNode(req.params.type, req.params.id);
  if (!found) throw fail(404, 'Location not found');
  const name = str(body(req).name, 100);
  if (!name) throw fail(400, 'Name is required');
  found.node.name = name;
  store.touch();
  res.json({ ok: true });
}));

app.delete('/api/admin/locations/:type/:id', requireAdmin, wrap((req, res) => {
  const found = locateNode(req.params.type, req.params.id);
  if (!found) throw fail(404, 'Location not found');
  const used = locationUsage(collectIds(found.node));
  if (used) throw fail(409, `Cannot delete: ${used} worker/request record(s) use this location.`);
  found.list.splice(found.list.indexOf(found.node), 1);
  store.touch();
  res.json({ ok: true });
}));

// Bulk import: "Province | City | Area | Sub-area" per line. Missing items are created.
app.post('/api/admin/locations/import', requireAdmin, wrap((req, res) => {
  const lines = String(body(req).text || '').split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('#'));
  if (!lines.length) throw fail(400, 'Paste at least one line');
  if (lines.length > 5000) throw fail(400, 'Import up to 5000 lines at a time');
  let created = 0;
  let skipped = 0;
  const ensure = (list, name, type) => {
    let node = list.find(n => n.name.toLowerCase() === name.toLowerCase());
    if (!node) { node = newLocation(type, name); list.push(node); created += 1; }
    return node;
  };
  for (const line of lines) {
    const [prov, city, area, sub] = line.split('|').map(p => str(p, 100));
    if (!prov || !city) { skipped += 1; continue; }
    const province = ensure(db.locations, prov, 'province');
    const cityNode = ensure(province.cities, city, 'city');
    if (!area) continue;
    const areaNode = ensure(cityNode.areas, area, 'area');
    if (sub) ensure(areaNode.subAreas, sub, 'subArea');
  }
  store.touch();
  res.json({ ok: true, created, skipped, lines: lines.length });
}));

// ---------- admin: banners / ads ----------
app.get('/api/admin/banners', requireAdmin, (req, res) => res.json(db.banners.slice().sort(byOrder)));

app.post('/api/admin/banners', requireAdmin, wrap((req, res) => {
  const b = body(req);
  const title = str(b.title, 120);
  if (!title) throw fail(400, 'Headline is required');
  const item = {
    id: uid('ban_'), title, subtitle: str(b.subtitle, 160), link: safeLink(b.link),
    image: b.image ? saveImage(b.image) : '',
    active: b.active === undefined ? true : bool(b.active),
    order: db.banners.length + 1, createdAt: now()
  };
  db.banners.push(item);
  store.touch();
  res.status(201).json(item);
}));

app.put('/api/admin/banners/:id', requireAdmin, wrap((req, res) => {
  const item = db.banners.find(x => x.id === req.params.id);
  if (!item) throw fail(404, 'Ad not found');
  const b = body(req);
  if (b.title !== undefined) item.title = str(b.title, 120) || item.title;
  if (b.subtitle !== undefined) item.subtitle = str(b.subtitle, 160);
  if (b.link !== undefined) item.link = safeLink(b.link);
  if (b.active !== undefined) item.active = bool(b.active);
  if (b.image) { removeUpload(item.image); item.image = saveImage(b.image); }
  store.touch();
  res.json(item);
}));

app.delete('/api/admin/banners/:id', requireAdmin, wrap((req, res) => {
  const idx = db.banners.findIndex(x => x.id === req.params.id);
  if (idx < 0) throw fail(404, 'Ad not found');
  removeUpload(db.banners[idx].image);
  db.banners.splice(idx, 1);
  store.touch();
  res.json({ ok: true });
}));

// ---------- admin: workers ----------
app.get('/api/admin/workers', requireAdmin, (req, res) => {
  const status = req.query.status;
  res.json(db.workers.filter(w => !status || w.status === status).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
});

app.get('/api/admin/workers/:id/payment-proof', requireAdmin, (req, res, next) => {
  const worker = db.workers.find(w => w.id === req.params.id);
  const proof = worker && worker.payment && worker.payment.proof;
  if (!proof || path.basename(proof) !== proof) return res.status(404).json({ error: 'Payment screenshot not found' });
  res.sendFile(path.join(PAYMENT_UPLOAD_DIR, proof), err => {
    if (err && !res.headersSent) next(err);
  });
});

app.put('/api/admin/workers/:id', requireAdmin, wrap((req, res) => {
  const w = db.workers.find(x => x.id === req.params.id);
  if (!w) throw fail(404, 'Worker not found');
  const b = body(req);
  if (b.paymentVerified !== undefined && w.payment.required) w.payment.verified = bool(b.paymentVerified);
  if (b.status !== undefined) {
    if (!WORKER_STATUSES.includes(b.status)) throw fail(400, 'Invalid status');
    if (b.status === 'approved' && w.payment.required && !w.payment.verified) {
      throw fail(400, 'Verify the registration fee payment before approving');
    }
    w.status = b.status;
  }
  if (b.notes !== undefined) w.notes = str(b.notes, 500);
  w.updatedAt = now();
  store.touch();
  res.json(w);
}));

app.delete('/api/admin/workers/:id', requireAdmin, wrap((req, res) => {
  const idx = db.workers.findIndex(w => w.id === req.params.id);
  if (idx < 0) throw fail(404, 'Worker not found');
  removeUpload(db.workers[idx].photo);
  removePaymentProof(db.workers[idx].payment && db.workers[idx].payment.proof);
  db.workers.splice(idx, 1);
  store.touch();
  res.json({ ok: true });
}));

// ---------- admin: customer service requests ----------
app.get('/api/admin/requests', requireAdmin, (req, res) => {
  const status = req.query.status;
  res.json(db.requests.filter(r => !status || r.status === status));
});

app.put('/api/admin/requests/:id', requireAdmin, wrap((req, res) => {
  const r = db.requests.find(x => x.id === req.params.id);
  if (!r) throw fail(404, 'Request not found');
  const b = body(req);
  if (b.status !== undefined) {
    if (!REQUEST_STATUSES.includes(b.status)) throw fail(400, 'Invalid status');
    r.status = b.status;
  }
  if (b.assignedWorkerId !== undefined) {
    const id = String(b.assignedWorkerId || '');
    if (id) {
      const w = db.workers.find(x => x.id === id && x.status === 'approved');
      if (!w) throw fail(400, 'Select an approved worker');
      Object.assign(r, { assignedWorkerId: w.id, assignedWorkerName: w.name, assignedWorkerPhone: w.phone });
      if (r.status === 'new' || r.status === 'contacted') r.status = 'assigned';
    } else {
      Object.assign(r, { assignedWorkerId: '', assignedWorkerName: '', assignedWorkerPhone: '' });
    }
  }
  r.updatedAt = now();
  store.touch();
  res.json(r);
}));

app.post('/api/admin/requests/:id/notes', requireAdmin, wrap((req, res) => {
  const r = db.requests.find(x => x.id === req.params.id);
  if (!r) throw fail(404, 'Request not found');
  const text = str(body(req).text, 500);
  if (!text) throw fail(400, 'Note cannot be empty');
  r.notes.push({ id: uid('note_'), text, by: req.admin.name, at: now() });
  store.touch();
  res.status(201).json(r);
}));

app.delete('/api/admin/requests/:id', requireAdmin, wrap((req, res) => {
  const idx = db.requests.findIndex(r => r.id === req.params.id);
  if (idx < 0) throw fail(404, 'Request not found');
  db.requests.splice(idx, 1);
  store.touch();
  res.json({ ok: true });
}));

// ---------- fallbacks and errors ----------
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: status >= 500 ? 'Something went wrong on the server' : err.message });
});

const server = app.listen(PORT, () => {
  console.log(`Hunar Near Me running at http://localhost:${PORT}`);
  console.log(`Admin panel:           http://localhost:${PORT}/admin/`);
});

function shutdown() {
  store.flush();
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 500).unref();
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
