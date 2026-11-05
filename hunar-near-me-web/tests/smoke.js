#!/usr/bin/env node
'use strict';
// Smoke test for Hunar Near Me.
// 1) Start the server with `npm start` in one terminal.
// 2) Run `npm test` in another terminal.
// The test creates records named "QA ..." and removes them again at the end.

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function check(name, fn) {
  try {
    await fn();
    passed += 1;
    console.log(`  ✔ ${name}`);
  } catch (err) {
    failed += 1;
    console.log(`  ✘ ${name}\n      → ${err.message}`);
  }
}

async function call(method, path, { body, cookie } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (cookie) headers.Cookie = cookie;
  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data, res };
}

// Valid Pakistani mobile format: 03 + 9 digits
function randomPhone() {
  return '0300' + String(1000000 + Math.floor(Math.random() * 8999999));
}

// Opens the admin live stream, runs the trigger, and waits for a notification event
async function waitForNotification(cookie, trigger) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(BASE + '/api/admin/events', {
      headers: { Cookie: cookie },
      signal: controller.signal
    });
    assert(res.status === 200, `event stream returned ${res.status}`);
    await trigger();
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let text = '';
    for (;;) {
      const { value, done } = await reader.read();
      if (done) return false;
      text += decoder.decode(value, { stream: true });
      if (text.includes('event: notification')) return true;
    }
  } catch (err) {
    if (err.name === 'AbortError') return false;
    throw err;
  } finally {
    clearTimeout(timer);
    controller.abort();
  }
}

async function main() {
  console.log(`\nHunar Near Me smoke test → ${BASE}\n`);
  const tag = randomPhone().slice(-4);
  let cookie = '';
  let catId = '';
  let cityId = '';
  let areaId = '';
  let testCityId = '';
  let trackCode = '';
  let trackPhone = '';

  const findWorker = async phone => {
    const list = await call('GET', '/api/admin/workers', { cookie });
    return list.data.find(w => w.phone === phone);
  };

  console.log('Public website');

  await check('home page loads and sets a visitor cookie', async () => {
    const res = await fetch(BASE + '/');
    assert(res.status === 200, `status ${res.status}`);
    const html = await res.text();
    assert(html.includes('data-theme-toggle'), 'light/dark theme switch missing');
    assert(res.headers.getSetCookie().some(c => c.startsWith('hn_vid=')), 'visitor cookie not set');
  });

  await check('admin panel page loads', async () => {
    const res = await fetch(BASE + '/admin/');
    assert(res.status === 200, `status ${res.status}`);
    const html = await res.text();
    assert(html.includes('data-theme-toggle'), 'admin light/dark theme switch missing');
  });

  await check('mobile browser notification service worker is available', async () => {
    const res = await fetch(BASE + '/service-worker.js');
    assert(res.status === 200, `status ${res.status}`);
    assert((await res.text()).includes('notificationclick'), 'notification click handler missing');
  });

  await check('services and the Pakistan location tree are available', async () => {
    const cats = await call('GET', '/api/categories');
    assert(cats.data.length >= 10, `only ${cats.data.length} services`);
    const electrician = cats.data.find(c => c.name === 'Electrician');
    assert(electrician, 'Electrician service missing');
    catId = electrician.id;

    const locs = await call('GET', '/api/locations');
    const cityCount = locs.data.reduce((count, province) => count + province.cities.length, 0);
    assert(cityCount >= 330, `expected at least 330 seeded cities and towns, found ${cityCount}`);
    assert(locs.data.find(p => p.name === 'Khyber Pakhtunkhwa').cities.some(c => c.name === 'Pabbi'), 'Pabbi missing from Khyber Pakhtunkhwa');
    const lahore = locs.data.flatMap(p => p.cities).find(c => c.name === 'Lahore');
    assert(lahore && lahore.areas.length > 0, 'Lahore with areas not found');
    cityId = lahore.id;
    areaId = lahore.areas[0].id;
  });

  await check('map key configuration endpoint is available', async () => {
    const r = await call('GET', '/api/maps-config');
    assert(r.status === 200 && typeof r.data.apiKey === 'string', 'maps configuration is missing');
  });

  await check('customer map supports worldwide search and separate current/request location markers', async () => {
    const res = await fetch(BASE + '/js/site.js');
    assert(res.status === 200, `site script returned ${res.status}`);
    const source = await res.text();
    assert(source.includes('https://maps.googleapis.com/maps/api/js?key='), 'Google Maps JavaScript API loader missing');
    assert(source.includes('libraries=places'), 'Google Places library is not enabled');
    assert(source.includes('new google.maps.places.Autocomplete'), 'Google Places search missing');
    assert(!source.includes('componentRestrictions:'), 'Google Places search is restricted to a country');
    assert(source.includes('navigator.geolocation.getCurrentPosition'), 'current location flow missing');
    assert(source.includes('currentLocationMarker') && source.includes('requestMarker'), 'separate current and request markers missing');
  });

  await check('customer service request is accepted and gets a code', async () => {
    trackPhone = randomPhone();
    const r = await call('POST', '/api/requests', { body: {
      name: `QA Customer ${tag}`, phone: trackPhone, categoryId: catId, cityId, areaId,
      description: 'Ceiling fan not working since morning'
    } });
    assert(r.status === 201, `status ${r.status}: ${r.data.error}`);
    assert(/^HN-\d{5}$/.test(r.data.code), `unexpected code ${r.data.code}`);
    trackCode = r.data.code;
  });

  await check('request code and mobile number show the current request status', async () => {
    const r = await call('GET', `/api/requests/track?code=${trackCode}&phone=${trackPhone}`);
    assert(r.status === 200, `status ${r.status}: ${r.data.error}`);
    assert(r.data.code === trackCode && r.data.status === 'new', 'tracked request details did not match');
    assert(r.data.createdAt && r.data.updatedAt, 'request timestamps are missing');
    assert(r.data.assignedWorkerName === '' && r.data.assignedWorkerPhone === '', 'unassigned request exposes worker details');
  });

  await check('service request accepts an unmapped map pin and returns its place name', async () => {
    const phone = randomPhone();
    const created = await call('POST', '/api/requests', { body: {
      name: `QA Map ${tag}`, phone, categoryId: catId,
      locationName: 'QA Neighborhood, Abbottabad, Khyber Pakhtunkhwa',
      provinceName: 'Khyber Pakhtunkhwa', cityName: 'Abbottabad', areaName: 'QA Neighborhood',
      latitude: 34.1463, longitude: 73.2117,
      description: 'Please inspect a water pump at this location'
    } });
    assert(created.status === 201, `status ${created.status}: ${created.data.error}`);
    const tracked = await call('GET', `/api/requests/track?code=${created.data.code}&phone=${phone}`);
    assert(tracked.status === 200, `tracking status ${tracked.status}`);
    assert(tracked.data.locationName.includes('QA Neighborhood'), 'map-selected place was not saved');
  });

  await check('invalid mobile number is rejected', async () => {
    const r = await call('POST', '/api/requests', { body: {
      name: `QA Customer ${tag}`, phone: '123', categoryId: catId, cityId,
      description: 'Ceiling fan not working since morning'
    } });
    assert(r.status === 400, `expected 400, got ${r.status}`);
  });

  console.log('\nAdmin security');

  await check('admin API rejects requests without a session', async () => {
    const r = await call('GET', '/api/admin/requests');
    assert(r.status === 401, `expected 401, got ${r.status}`);
  });

  await check('wrong admin password is rejected', async () => {
    const r = await call('POST', '/api/admin/login', {
      body: { username: 'admin', password: 'not-the-password' }
    });
    assert(r.status === 401, `expected 401, got ${r.status}`);
  });

  await check('correct admin login returns a session cookie', async () => {
    const r = await call('POST', '/api/admin/login', {
      body: { username: 'admin', password: ADMIN_PASSWORD }
    });
    assert(r.status === 200, `status ${r.status} (check ADMIN_PASSWORD)`);
    const set = r.res.headers.getSetCookie().find(c => c.startsWith('hn_session='));
    assert(set, 'session cookie missing');
    cookie = set.split(';')[0];
  });

  await check('admin can change username after confirming the current password', async () => {
    const me = await call('GET', '/api/admin/me', { cookie });
    const originalUsername = me.data.admin.username;
    const username = `qa_admin_${Date.now()}`;
    const invalid = await call('POST', '/api/admin/username', { cookie, body: {
      username: 'x', currentPassword: ADMIN_PASSWORD
    } });
    assert(invalid.status === 400, `invalid username returned ${invalid.status}`);

    let changed = false;
    try {
      const update = await call('POST', '/api/admin/username', { cookie, body: {
        username, currentPassword: ADMIN_PASSWORD
      } });
      assert(update.status === 200, `update returned ${update.status}: ${update.data.error}`);
      changed = true;
      assert(update.data.admin.username === username, 'updated username not returned');
      const oldLogin = await call('POST', '/api/admin/login', { body: {
        username: originalUsername, password: ADMIN_PASSWORD
      } });
      assert(oldLogin.status === 401, 'old username still logs in');
      const newLogin = await call('POST', '/api/admin/login', { body: {
        username, password: ADMIN_PASSWORD
      } });
      assert(newLogin.status === 200, 'new username cannot log in');
    } finally {
      if (changed) {
        const restore = await call('POST', '/api/admin/username', { cookie, body: {
          username: originalUsername, currentPassword: ADMIN_PASSWORD
        } });
        assert(restore.status === 200, `could not restore username: ${restore.data.error}`);
      }
    }
  });

  await check('registration fee is reset to 0 for a clean run', async () => {
    const r = await call('PUT', '/api/admin/settings', { cookie, body: { registrationFee: 0 } });
    assert(r.status === 200, `status ${r.status}`);
  });

  console.log('\nLive notifications');

  await check('a new customer request pushes a live notification to the admin', async () => {
    const got = await waitForNotification(cookie, () => call('POST', '/api/requests', { body: {
      name: `QA Live ${tag}`, phone: randomPhone(), categoryId: catId, cityId,
      description: 'AC not cooling, gas refill needed'
    } }));
    assert(got, 'no notification received within 5 seconds');
  });

  await check('a new worker application pushes a live notification to the admin', async () => {
    const phone = randomPhone();
    const got = await waitForNotification(cookie, () => call('POST', '/api/workers', { body: {
      name: `QA Live Worker ${tag}`, phone, categoryId: catId, cityId, areaIds: [],
      experience: 3, bio: 'Electrical repairs'
    } }));
    assert(got, 'no worker notification received within 5 seconds');
  });

  console.log('\nWorkers');

  const workerPhone = randomPhone();

  await check('worker application is saved as pending', async () => {
    const r = await call('POST', '/api/workers', { body: {
      name: `QA Worker ${tag}`, phone: workerPhone, categoryId: catId, cityId, areaIds: [areaId],
      experience: 6, bio: 'Wiring and fan repair', showPhone: false
    } });
    assert(r.status === 201, `status ${r.status}: ${r.data.error}`);
  });

  await check('pending worker is hidden from public search', async () => {
    const r = await call('GET', `/api/workers?categoryId=${catId}&cityId=${cityId}`);
    assert(!r.data.some(w => w.name === `QA Worker ${tag}`), 'pending worker is visible publicly');
  });

  await check('admin approves the worker and they appear in search (phone hidden)', async () => {
    const w = await findWorker(workerPhone);
    assert(w, 'worker not found in admin list');
    const r = await call('PUT', `/api/admin/workers/${w.id}`, { cookie, body: { status: 'approved' } });
    assert(r.status === 200, `approve status ${r.status}: ${r.data.error}`);
    const list = await call('GET', `/api/workers?categoryId=${catId}&cityId=${cityId}&areaId=${areaId}`);
    const found = list.data.find(x => x.name === `QA Worker ${tag}`);
    assert(found, 'approved worker not visible in search');
    assert(found.phone === '', 'phone shown even though the worker opted out');
  });

  await check('request tracking respects the assigned worker phone visibility setting', async () => {
    const requestList = await call('GET', '/api/admin/requests', { cookie });
    const request = requestList.data.find(item => item.code === trackCode);
    const workerList = await call('GET', '/api/admin/workers', { cookie });
    const worker = workerList.data.find(item => item.phone === workerPhone);
    assert(request && worker, 'request or approved worker not found');
    const assigned = await call('PUT', `/api/admin/requests/${request.id}`, {
      cookie, body: { assignedWorkerId: worker.id }
    });
    assert(assigned.status === 200, `assignment failed: ${assigned.data.error}`);
    const tracked = await call('GET', `/api/requests/track?code=${trackCode}&phone=${trackPhone}`);
    assert(tracked.status === 200, `tracking status ${tracked.status}`);
    assert(tracked.data.status === 'assigned', 'assignment did not update request progress');
    assert(tracked.data.assignedWorkerName === worker.name, 'assigned worker name missing');
    assert(tracked.data.assignedWorkerPhone === '', 'worker phone was exposed despite opting out');
  });

  await check('paid registration: approval blocked until fee is verified', async () => {
    await call('PUT', '/api/admin/settings', { cookie, body: { registrationFee: 1000, easypaisaNumber: '03001234567' } });
    const phone = randomPhone();
    const payload = { name: `QA Paid ${tag}`, phone, categoryId: catId, cityId, areaIds: [] };

    const noPay = await call('POST', '/api/workers', { body: payload });
    assert(noPay.status === 400, `expected 400 without payment, got ${noPay.status}`);

    const noProof = await call('POST', '/api/workers', { body: {
      ...payload, paymentMethod: 'easypaisa', paymentRef: `TX${tag}98`
    } });
    assert(noProof.status === 400, `expected 400 without screenshot, got ${noProof.status}`);

    const paid = await call('POST', '/api/workers', { body: {
      ...payload, paymentMethod: 'easypaisa', paymentRef: `TX${tag}99`,
      paymentScreenshot: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/lXcAAAAASUVORK5CYII='
    } });
    assert(paid.status === 201, `expected 201 with payment, got ${paid.status}`);

    const w = await findWorker(phone);
    assert(w, 'paid worker not found');
    const proof = await call('GET', `/api/admin/workers/${w.id}/payment-proof`, { cookie });
    assert(proof.status === 200 && proof.res.headers.get('content-type').startsWith('image/png'), 'admin could not view the payment screenshot');
    const publicProof = await fetch(`${BASE}/uploads/payment-proofs/${w.payment.proof}`);
    assert(publicProof.status === 404, 'payment screenshot is publicly accessible');
    const early = await call('PUT', `/api/admin/workers/${w.id}`, { cookie, body: { status: 'approved' } });
    assert(early.status === 400, `approved before verification (status ${early.status})`);

    const verify = await call('PUT', `/api/admin/workers/${w.id}`, { cookie, body: { paymentVerified: true } });
    assert(verify.status === 200, `could not verify payment (status ${verify.status})`);

    const ok = await call('PUT', `/api/admin/workers/${w.id}`, { cookie, body: { status: 'approved' } });
    assert(ok.status === 200, `approval after verification failed (status ${ok.status})`);
  });

  console.log('\nLocations and dashboard');

  await check('bulk location import adds a city with an area and a sub-area', async () => {
    const r = await call('POST', '/api/admin/locations/import', { cookie, body: {
      text: `Punjab | QA City ${tag} | QA Area | QA Block\n# this line is ignored`
    } });
    assert(r.status === 200, `status ${r.status}: ${r.data.error}`);
    assert(r.data.created === 3, `expected 3 created, got ${r.data.created}`);
    const locs = await call('GET', '/api/locations');
    const city = locs.data.find(p => p.name === 'Punjab').cities.find(c => c.name === `QA City ${tag}`);
    assert(city, 'imported city not found');
    testCityId = city.id;
  });

  await check('dashboard counts website visits and requests', async () => {
    const r = await call('GET', '/api/admin/stats', { cookie });
    assert(r.data.totalViews >= 1, 'no visits recorded');
    assert(r.data.requests.total >= 1, 'no requests counted');
  });

  // Remove everything this run created
  const isQA = name => String(name).startsWith('QA ') && String(name).endsWith(tag);
  const [reqs, workers] = await Promise.all([
    call('GET', '/api/admin/requests', { cookie }),
    call('GET', '/api/admin/workers', { cookie })
  ]);
  for (const r of reqs.data.filter(x => isQA(x.name))) {
    await call('DELETE', `/api/admin/requests/${r.id}`, { cookie });
  }
  for (const w of workers.data.filter(x => isQA(x.name))) {
    await call('DELETE', `/api/admin/workers/${w.id}`, { cookie });
  }
  if (testCityId) await call('DELETE', `/api/admin/locations/city/${testCityId}`, { cookie });
  await call('PUT', '/api/admin/settings', { cookie, body: { registrationFee: 0 } });

  console.log(`\n  ${passed} passed, ${failed} failed\n`);
  process.exit(failed ? 1 : 0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
