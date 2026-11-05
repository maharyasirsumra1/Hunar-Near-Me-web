'use strict';

const T = {
  en: {
    brandSub: 'ہنر آپ کے قریب',
    navHome: 'Home', navFind: 'Find workers', navRequest: 'Request service', navJoin: 'Join as worker', navTrack: 'Track request',
    heroPill: 'Verified local professionals',
    heroTitle: 'Find trusted skilled professionals near you',
    heroSub: 'Electricians, plumbers, mechanics, tutors and more. Compare local experts in your area and request a service in minutes.',
    lblService: 'Service', selService: 'Choose a service', lblProv: 'Province', lblCity: 'City', lblArea: 'Area / Society',
    selProv: 'Select province', selCity: 'Select city', selArea: 'Any area', btnSearch: 'Search workers',
    errService: 'Please choose a service',
    adTag: 'Promotion',
    catTitle: 'Popular services', catSub: 'Pick a category to see available workers',
    stepsTitle: 'How it works',
    step1: 'Search', step1t: 'Choose a service and your area',
    step2: 'Compare', step2t: 'See verified workers with experience and contact options',
    step3: 'Request', step3t: 'Send your request and the worker will call you back',
    ctaTitle: 'Are you a skilled worker?',
    ctaSub: 'Create a profile, showcase your work and receive customer requests in your area.',
    btnJoin: 'Join as worker',
    findTitle: 'Find workers', findSub: 'Verified professionals filtered by service and location',
    allServices: 'All services', btnApply: 'Apply',
    noWorkers: 'No workers found for these filters yet. Try another area or send a request and we will find someone for you.',
    verified: 'Verified', yrs: 'yrs experience', btnRequest: 'Request this service',
    reqTitle: 'Request a service', reqSub: 'Tell us what you need. Matching workers will contact you.',
    lblName: 'Full name', lblPhone: 'Mobile number', lblAddress: 'Address / street (optional)',
    lblDate: 'Preferred date (optional)', lblDesc: 'Describe the work',
    btnSubmitReq: 'Submit request', reqSubmitting: 'Submitting your request…', reqSuccess: 'Request submitted!', reqCode: 'Your request code',
    reqSuccessSub: 'Save this code to track your request status.', btnTrack: 'Track request',
    copyCode: 'Copy code', codeCopied: 'Request code copied.', copyFailed: 'Could not copy the code. Please save it manually.',
    helpTitle: 'How we handle your request',
    help1: 'We check the request and share it with matching workers in your city.',
    help2: 'A worker contacts you on the number you provided.',
    help3: 'Your phone number is never shown publicly.',
    joinTitle: 'Join as a skilled worker',
    joinSub: 'Register your profile. Our admin team verifies every application before it goes live.',
    joinApproval: 'Your profile stays private while it is pending. An admin reviews your details and payment (if required) before approving it for the worker directory.',
    lblProfession: 'Main profession', lblExp: 'Years of experience', lblBio: 'About your work',
    lblServiceAreas: 'Service areas (select one or more)', lblPhoto: 'Profile photo (optional)',
    lblShowPhone: 'Show my phone number to customers', lblPayMethod: 'Payment method',
    lblPayRef: 'Transaction ID', lblPayScreenshot: 'Payment screenshot', payScreenshotHint: 'Attach a clear EasyPaisa / JazzCash receipt (PNG, JPG or WEBP, up to 3 MB). Only admins can view this receipt.',
    paymentFile: 'No screenshot selected', paymentFileSizeError: 'Image must be smaller than 3 MB',
    paymentFileTypeError: 'Choose a PNG, JPG or WEBP image', btnRegistering: 'Sending application…',
    btnRegister: 'Submit application', feeNote: 'Registration fee',
    selectOne: 'Select', pickCityFirst: 'Select a city first to see its areas',
    applied: 'Application received!',
    trackTitle: 'Track your request', trackSub: 'Enter the request code and the mobile number you used.',
    lblCode: 'Request code', btnCheck: 'Check status', checkingStatus: 'Checking…', trackProgress: 'Request progress',
    trackReceived: 'Request received', trackContact: 'Worker contact', trackAssigned: 'Worker assigned',
    trackWork: 'Work in progress', trackDone: 'Completed', trackCancelled: 'This request was cancelled.',
    trackCreated: 'Request created', trackUpdated: 'Last updated', trackWorker: 'Your assigned professional',
    mapSearch: 'Search for an address, area or place', mapHint: 'Search for a place anywhere in the world, click the map, or drag the pin. The exact pin coordinates will be saved with your request.',
    mapPinError: 'The exact pin coordinates are saved, but its address could not be found. You can still submit this location.',
    mapCurrentLocation: 'Use my current location', mapYourLocation: 'Your current location', mapRequestLocation: 'Service location',
    mapLocationError: 'Could not access your current location. Search for a place or pin it on the map.',
    mapLocationUnsupported: 'Current location is not supported by this browser.',
    mapChoose: 'Choose a location on the map first.', mapUnavailable: 'Google Maps is not configured. Choose your city and area below.',
    selectedLocation: 'Selected location',
    st_new: 'Received', st_contacted: 'Contacted', st_assigned: 'Worker assigned',
    st_in_progress: 'In progress', st_completed: 'Completed', st_cancelled: 'Cancelled',
    footerRights: 'All rights reserved.', adminLogin: 'Admin login'
  },
  ur: {
    brandSub: 'ہنر آپ کے قریب',
    navHome: 'ہوم', navFind: 'کارکن تلاش کریں', navRequest: 'سروس کی درخواست',
    navJoin: 'بطور کارکن شامل ہوں', navTrack: 'درخواست کی حالت',
    heroPill: 'تصدیق شدہ مقامی ماہرین',
    heroTitle: 'اپنے قریب قابلِ اعتماد ہنرمند تلاش کریں',
    heroSub: 'الیکٹریشن، پلمبر، مکینک، ٹیوٹر اور مزید۔ اپنے علاقے کے ماہرین کا موازنہ کریں اور چند منٹ میں سروس کی درخواست بھیجیں۔',
    lblService: 'سروس', selService: 'سروس منتخب کریں', lblProv: 'صوبہ', lblCity: 'شہر', lblArea: 'علاقہ / سوسائٹی',
    selProv: 'صوبہ منتخب کریں', selCity: 'شہر منتخب کریں', selArea: 'کوئی بھی علاقہ', btnSearch: 'کارکن تلاش کریں',
    errService: 'براہ کرم سروس منتخب کریں',
    adTag: 'پروموشن',
    catTitle: 'مقبول سروسز', catSub: 'کسی زمرے پر کلک کریں اور دستیاب کارکن دیکھیں',
    stepsTitle: 'یہ کیسے کام کرتا ہے',
    step1: 'تلاش کریں', step1t: 'سروس اور اپنا علاقہ منتخب کریں',
    step2: 'موازنہ کریں', step2t: 'تصدیق شدہ کارکن، تجربہ اور رابطے کے طریقے دیکھیں',
    step3: 'درخواست دیں', step3t: 'درخواست بھیجیں، کارکن آپ کو کال کرے گا',
    ctaTitle: 'کیا آپ ہنرمند کارکن ہیں؟',
    ctaSub: 'اپنی پروفائل بنائیں، اپنا کام دکھائیں اور اپنے علاقے میں گاہکوں کی درخواستیں حاصل کریں۔',
    btnJoin: 'بطور کارکن رجسٹر کریں',
    findTitle: 'کارکن تلاش کریں', findSub: 'سروس اور مقام کے مطابق تصدیق شدہ ماہرین',
    allServices: 'تمام سروسز', btnApply: 'تلاش کریں',
    noWorkers: 'ان فلٹرز کے لیے ابھی کوئی کارکن نہیں ملا۔ دوسرا علاقہ آزمائیں یا درخواست بھیجیں۔',
    verified: 'تصدیق شدہ', yrs: 'سال تجربہ', btnRequest: 'یہ سروس طلب کریں',
    reqTitle: 'سروس کی درخواست', reqSub: 'بتائیں آپ کو کیا چاہیے۔ متعلقہ کارکن آپ سے رابطہ کریں گے۔',
    lblName: 'پورا نام', lblPhone: 'موبائل نمبر', lblAddress: 'پتہ / گلی (اختیاری)',
    lblDate: 'ترجیحی تاریخ (اختیاری)', lblDesc: 'کام کی تفصیل',
    btnSubmitReq: 'درخواست جمع کریں', reqSubmitting: 'آپ کی درخواست بھیجی جا رہی ہے…', reqSuccess: 'درخواست جمع ہو گئی!', reqCode: 'آپ کا درخواست کوڈ',
    reqSuccessSub: 'اس کوڈ کو محفوظ رکھیں تاکہ آپ درخواست کی حالت دیکھ سکیں۔', btnTrack: 'درخواست کی حالت دیکھیں',
    copyCode: 'کوڈ کاپی کریں', codeCopied: 'درخواست کوڈ کاپی ہو گیا۔', copyFailed: 'کوڈ کاپی نہیں ہوا، براہ کرم اسے محفوظ کر لیں۔',
    helpTitle: 'ہم آپ کی درخواست کیسے سنبھالتے ہیں',
    help1: 'ہم درخواست کی جانچ کر کے آپ کے شہر کے متعلقہ کارکنوں کو بھیجتے ہیں۔',
    help2: 'کارکن آپ کے دیے گئے نمبر پر رابطہ کرے گا۔',
    help3: 'آپ کا فون نمبر عوامی طور پر ظاہر نہیں کیا جاتا۔',
    joinTitle: 'بطور ہنرمند کارکن شامل ہوں',
    joinSub: 'اپنی پروفائل رجسٹر کریں۔ ہماری ایڈمن ٹیم ہر درخواست کی تصدیق کے بعد ہی اسے شائع کرتی ہے۔',
    joinApproval: 'منظوری تک آپ کی پروفائل نجی رہے گی۔ ایڈمن آپ کی معلومات اور (اگر لازم ہو) ادائیگی کی جانچ کے بعد اسے کارکنوں کی فہرست میں شامل کرے گا۔',
    lblProfession: 'بنیادی پیشہ', lblExp: 'تجربہ (سال)', lblBio: 'اپنے کام کے بارے میں',
    lblServiceAreas: 'سروس کے علاقے (ایک یا زیادہ منتخب کریں)', lblPhoto: 'پروفائل تصویر (اختیاری)',
    lblShowPhone: 'میرا فون نمبر گاہکوں کو دکھائیں', lblPayMethod: 'ادائیگی کا طریقہ',
    lblPayRef: 'ٹرانزیکشن آئی ڈی', lblPayScreenshot: 'ادائیگی کا اسکرین شاٹ', payScreenshotHint: 'EasyPaisa / JazzCash رسید کی واضح تصویر لگائیں (PNG، JPG یا WEBP، زیادہ سے زیادہ 3 MB)۔ یہ رسید صرف ایڈمن دیکھ سکتے ہیں۔',
    paymentFile: 'ابھی کوئی اسکرین شاٹ منتخب نہیں', paymentFileSizeError: 'تصویر 3 MB سے چھوٹی ہونی چاہیے',
    paymentFileTypeError: 'PNG، JPG یا WEBP تصویر منتخب کریں', btnRegistering: 'درخواست بھیجی جا رہی ہے…',
    btnRegister: 'درخواست جمع کریں', feeNote: 'رجسٹریشن فیس',
    selectOne: 'منتخب کریں', pickCityFirst: 'پہلے شہر منتخب کریں',
    applied: 'درخواست موصول ہو گئی!',
    trackTitle: 'اپنی درخواست کی حالت دیکھیں', trackSub: 'درخواست کوڈ اور وہ موبائل نمبر درج کریں جو آپ نے استعمال کیا۔',
    lblCode: 'درخواست کوڈ', btnCheck: 'حالت دیکھیں', checkingStatus: 'حالت دیکھی جا رہی ہے…', trackProgress: 'درخواست کی پیش رفت',
    trackReceived: 'درخواست موصول', trackContact: 'رابطہ', trackAssigned: 'کارکن مقرر',
    trackWork: 'کام جاری ہے', trackDone: 'مکمل', trackCancelled: 'یہ درخواست منسوخ ہو گئی ہے۔',
    trackCreated: 'درخواست بنائی گئی', trackUpdated: 'آخری اپ ڈیٹ', trackWorker: 'آپ کے لیے مقرر ماہر',
    mapSearch: 'پتہ، علاقہ یا جگہ تلاش کریں', mapHint: 'دنیا میں کہیں بھی جگہ تلاش کریں، نقشے پر کلک کریں یا پن کو کھینچیں۔ پن کے عین coordinates آپ کی درخواست کے ساتھ محفوظ ہوں گے۔',
    mapPinError: 'پن کے عین coordinates محفوظ ہیں، لیکن اس کا پتہ نہیں مل سکا۔ آپ اسی مقام کے ساتھ درخواست جمع کر سکتے ہیں۔',
    mapCurrentLocation: 'میرا موجودہ مقام استعمال کریں', mapYourLocation: 'آپ کا موجودہ مقام', mapRequestLocation: 'سروس کا مقام',
    mapLocationError: 'موجودہ مقام حاصل نہیں ہو سکا۔ جگہ تلاش کریں یا نقشے پر پن منتخب کریں۔',
    mapLocationUnsupported: 'اس براؤزر میں موجودہ مقام کی سہولت دستیاب نہیں۔',
    mapChoose: 'پہلے نقشے سے مقام منتخب کریں۔', mapUnavailable: 'Google Maps ترتیب نہیں دیا گیا۔ نیچے شہر اور علاقہ منتخب کریں۔',
    selectedLocation: 'منتخب مقام',
    st_new: 'موصول', st_contacted: 'رابطہ ہو گیا', st_assigned: 'کارکن تفویض',
    st_in_progress: 'جاری ہے', st_completed: 'مکمل', st_cancelled: 'منسوخ',
    footerRights: 'جملہ حقوق محفوظ ہیں۔', adminLogin: 'ایڈمن لاگ ان'
  }
};

const state = {
  lang: localStorage.getItem('hn_lang') || 'en',
  settings: {}, categories: [], locations: [], banners: []
};
let carouselTimer = null;
let requestMap = null;
let requestMarker = null;
let currentLocationMarker = null;
let requestGeocoder = null;
let mapsScriptPromise = null;
let mapRequestSequence = 0;

const $ = (sel, root = document) => root.querySelector(sel);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const t = key => (T[state.lang] && T[state.lang][key]) || T.en[key] || key;
const catName = c => (state.lang === 'ur' && c.nameUr) ? c.nameUr : c.name;
const qs = obj => new URLSearchParams(Object.entries(obj).filter(([, v]) => v)).toString();

function parseHash() {
  const [path, query = ''] = location.hash.replace(/^#/, '').split('?');
  return { path: path || '/', q: Object.fromEntries(new URLSearchParams(query)) };
}

async function api(url, body) {
  const options = body === undefined
    ? {}
    : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
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

// ---------- locations: province > city > area ----------
function locFind(cityId) {
  for (const province of state.locations) {
    const city = province.cities.find(c => c.id === cityId);
    if (city) return { province, city };
  }
  return null;
}

const provinceOfCity = cityId => (locFind(cityId) || { province: { id: '' } }).province.id;

function fillSelect(select, items, placeholder, selected = '') {
  select.innerHTML = `<option value="">${esc(placeholder)}</option>` + items.map(i =>
    `<option value="${esc(i.id)}" ${i.id === selected ? 'selected' : ''}>${esc(i.name)}</option>`).join('');
}

// Wires the dropdowns with ids prefixProv, prefixCity and prefixArea
function wireLoc(prefix, sel = {}) {
  const pv = $(`#${prefix}Prov`), ct = $(`#${prefix}City`), ar = $(`#${prefix}Area`);
  const cities = () => (state.locations.find(p => p.id === pv.value) || { cities: [] }).cities;
  const areas = () => (cities().find(c => c.id === ct.value) || { areas: [] }).areas;
  const refreshCity = (id = '') => { fillSelect(ct, cities(), t('selCity'), id); ct.disabled = !pv.value; };
  // Worker signup uses checkboxes for areas instead of a dropdown, so there may be no area select
  const refreshArea = (id = '') => {
    if (!ar) return;
    fillSelect(ar, areas(), t('selArea'), id);
    ar.disabled = !ct.value;
  };
  pv.onchange = () => { refreshCity(); refreshArea(); };
  ct.onchange = () => refreshArea();
  fillSelect(pv, state.locations, t('selProv'), sel.prov || '');
  refreshCity(sel.city || '');
  refreshArea(sel.area || '');
}

// ---------- shared pieces ----------
const categoryOptions = (selected = '') => state.categories.map(c =>
  `<option value="${esc(c.id)}" ${c.id === selected ? 'selected' : ''}>${esc(catName(c))}</option>`).join('');

function carouselHTML() {
  const slides = state.banners.map((b, i) => `
    <a class="slide ${i === 0 ? 'on' : ''}" href="${esc(b.link)}" style="${b.image ? `background-image:url('${esc(b.image)}')` : ''}">
      <div class="slide-body">
        <span class="ad-tag">${esc(t('adTag'))}</span>
        <h3>${esc(b.title)}</h3>
        <p>${esc(b.subtitle || '')}</p>
      </div>
    </a>`).join('');
  const dots = state.banners.map((_, i) =>
    `<button class="dot ${i === 0 ? 'on' : ''}" data-slide="${i}" aria-label="Slide ${i + 1}"></button>`).join('');
  return `<section class="carousel" id="carousel">${slides}<div class="dots">${dots}</div></section>`;
}

function startCarousel() {
  const root = $('#carousel');
  if (!root || state.banners.length < 2) return;
  const slides = [...root.querySelectorAll('.slide')];
  const dots = [...root.querySelectorAll('.dot')];
  let current = 0;
  const show = n => {
    current = n;
    slides.forEach((s, k) => s.classList.toggle('on', k === n));
    dots.forEach((d, k) => d.classList.toggle('on', k === n));
  };
  const restart = () => {
    clearInterval(carouselTimer);
    carouselTimer = setInterval(() => show((current + 1) % slides.length), 5000);
  };
  dots.forEach((d, k) => { d.onclick = () => { show(k); restart(); }; });
  restart();
}

// ---------- HOME ----------
function homeHTML() {
  return `
<section class="hero">
  <div class="hero-copy">
    <span class="pill">✔ ${esc(t('heroPill'))}</span>
    <h1>${esc(t('heroTitle'))}</h1>
    <p>${esc(t('heroSub'))}</p>
  </div>
  <form class="search card" id="homeSearch">
    <label>${esc(t('lblService'))}
      <select id="hsCat"><option value="">${esc(t('selService'))}</option>${categoryOptions()}</select>
    </label>
    <div class="grid-3">
      <label>${esc(t('lblProv'))}<select id="hsProv"></select></label>
      <label>${esc(t('lblCity'))}<select id="hsCity" disabled></select></label>
      <label>${esc(t('lblArea'))}<select id="hsArea" disabled></select></label>
    </div>
    <button class="btn btn-primary btn-block" type="submit">${esc(t('btnSearch'))}</button>
  </form>
</section>
${state.banners.length ? carouselHTML() : ''}
<section class="section">
  <div class="section-head"><div><h2>${esc(t('catTitle'))}</h2><p>${esc(t('catSub'))}</p></div></div>
  <div class="cat-grid">
    ${state.categories.map(c => `
      <a class="cat-card" href="#/workers?${qs({ cat: c.id })}">
        <span class="cat-ico">${esc(c.icon)}</span>
        <strong>${esc(catName(c))}</strong>
        <small>${esc((c.subServices || []).slice(0, 2).join(' · '))}</small>
      </a>`).join('')}
  </div>
</section>
<section class="section">
  <h2>${esc(t('stepsTitle'))}</h2>
  <div class="grid-3">
    ${[1, 2, 3].map(i => `
      <div class="card step">
        <span class="step-no">${i}</span>
        <h3>${esc(t('step' + i))}</h3>
        <p class="muted">${esc(t('step' + i + 't'))}</p>
      </div>`).join('')}
  </div>
</section>
<section class="card cta">
  <div><h2>${esc(t('ctaTitle'))}</h2><p>${esc(t('ctaSub'))}</p></div>
  <a class="btn btn-gold" href="#/join">${esc(t('btnJoin'))}</a>
</section>`;
}

function bindHome() {
  wireLoc('hs');
  $('#homeSearch').onsubmit = e => {
    e.preventDefault();
    const cat = $('#hsCat').value;
    if (!cat) return toast(t('errService'), 'err');
    location.hash = '#/workers?' + qs({ cat, prov: $('#hsProv').value, city: $('#hsCity').value, area: $('#hsArea').value });
  };
  startCarousel();
}

// ---------- WORKERS ----------
function workerCard(w) {
  const initials = w.name.split(/\s+/).map(s => s[0] || '').join('').slice(0, 2).toUpperCase();
  const areas = (w.areas || []).map(a => a.name).join(', ');
  return `
<article class="card worker">
  <div class="worker-top">
    ${w.photo ? `<img src="${esc(w.photo)}" alt="">` : `<div class="avatar">${esc(initials)}</div>`}
    <div>
      <h3>${esc(w.name)}</h3>
      ${w.verified ? `<span class="badge ok">✔ ${esc(t('verified'))}</span>` : ''}
      <p class="muted">${esc(w.categoryName)} · ${esc(w.experience)} ${esc(t('yrs'))}</p>
    </div>
  </div>
  <p class="where">📍 ${esc(w.cityName)}${areas ? ' - ' + esc(areas) : ''}</p>
  ${w.bio ? `<p class="bio">${esc(w.bio)}</p>` : ''}
  <div class="worker-actions">
    ${w.phone ? `<a class="btn btn-ghost" href="tel:${esc(w.phone)}">📞 ${esc(w.phone)}</a>` : ''}
    <a class="btn btn-primary" href="#/request?${qs({ cat: w.categoryId, city: w.cityId })}">${esc(t('btnRequest'))}</a>
  </div>
</article>`;
}

function workersHTML() {
  return `
<section class="page-head"><h1>${esc(t('findTitle'))}</h1><p>${esc(t('findSub'))}</p></section>
<form class="filters card" id="wfForm">
  <label>${esc(t('lblService'))}<select id="wfCat"><option value="">${esc(t('allServices'))}</option>${categoryOptions()}</select></label>
  <label>${esc(t('lblProv'))}<select id="wfProv"></select></label>
  <label>${esc(t('lblCity'))}<select id="wfCity" disabled></select></label>
  <label>${esc(t('lblArea'))}<select id="wfArea" disabled></select></label>
  <button class="btn btn-primary" type="submit">${esc(t('btnApply'))}</button>
</form>
<div class="grid-cards" id="wfResults"><div class="loader"></div></div>`;
}

async function loadWorkers() {
  const box = $('#wfResults');
  const { q } = parseHash();
  box.innerHTML = '<div class="loader"></div>';
  try {
    const list = await api('/api/workers?' + qs({ categoryId: q.cat, cityId: q.city, areaId: q.area }));
    const reqQs = qs({ cat: q.cat, city: q.city });
    box.innerHTML = list.length
      ? list.map(workerCard).join('')
      : `<div class="empty card"><p>${esc(t('noWorkers'))}</p>
         <a class="btn btn-primary" href="#/request${reqQs ? '?' + reqQs : ''}">${esc(t('btnRequest'))}</a></div>`;
  } catch (err) {
    box.innerHTML = `<div class="empty card">${esc(err.message)}</div>`;
  }
}

function bindWorkers(q) {
  $('#wfCat').value = q.cat || '';
  wireLoc('wf', { prov: provinceOfCity(q.city), city: q.city, area: q.area });
  $('#wfForm').onsubmit = e => {
    e.preventDefault();
    const h = '#/workers?' + qs({
      cat: $('#wfCat').value, prov: $('#wfProv').value, city: $('#wfCity').value, area: $('#wfArea').value
    });
    if (location.hash === h) loadWorkers(); else location.hash = h;
  };
  loadWorkers();
}

// ---------- REQUEST ----------
function requestHTML(q) {
  return `
<section class="page-head"><h1>${esc(t('reqTitle'))}</h1><p>${esc(t('reqSub'))}</p></section>
<div class="split" id="reqWrap">
  <form class="card form" id="reqForm">
    <div class="grid-2">
      <label>${esc(t('lblName'))} *<input name="name" required minlength="3" maxlength="80"></label>
      <label>${esc(t('lblPhone'))} *<input name="phone" required placeholder="03XX-XXXXXXX" maxlength="16"></label>
    </div>
    <label>${esc(t('lblService'))} *
      <select name="categoryId" required><option value="">${esc(t('selService'))}</option>${categoryOptions(q.cat)}</select>
    </label>
    <div class="map-picker hidden" id="rqMapPanel">
      <label>${esc(t('mapSearch'))} *
        <input id="rqPlaceSearch" type="search" placeholder="${esc(t('mapSearch'))}" autocomplete="off">
      </label>
      <div class="map-toolbar">
        <p class="muted small">${esc(t('mapHint'))}</p>
        <button class="btn btn-ghost btn-sm" type="button" id="rqUseLocation">◎ ${esc(t('mapCurrentLocation'))}</button>
      </div>
      <div id="requestMap" class="request-map" role="application" aria-label="${esc(t('mapSearch'))}"></div>
      <div class="map-legend" aria-label="${esc(t('selectedLocation'))}">
        <span><i class="map-legend-dot current" aria-hidden="true"></i>${esc(t('mapYourLocation'))}</span>
        <span><i class="map-legend-dot request" aria-hidden="true"></i>${esc(t('mapRequestLocation'))}</span>
      </div>
      <p id="rqMapSelection" class="map-selection muted" aria-live="polite">${esc(t('selectedLocation'))}: —</p>
    </div>
    <div id="rqMapUnavailable" class="map-unavailable hidden">${esc(t('mapUnavailable'))}</div>
    <div class="grid-3 location-manual" id="rqManualLocation">
      <label>${esc(t('lblProv'))} *<select id="rqProv"></select></label>
      <label>${esc(t('lblCity'))} *<select id="rqCity" required disabled></select></label>
      <label>${esc(t('lblArea'))}<select id="rqArea" disabled></select></label>
    </div>
    <input type="hidden" name="locationName" id="rqLocationName">
    <input type="hidden" name="latitude" id="rqLatitude">
    <input type="hidden" name="longitude" id="rqLongitude">
    <input type="hidden" name="provinceName" id="rqProvinceName">
    <input type="hidden" name="cityName" id="rqCityName">
    <input type="hidden" name="areaName" id="rqAreaName">
    <input type="hidden" name="cityId" id="rqCityId">
    <input type="hidden" name="areaId" id="rqAreaId">
    <label>${esc(t('lblAddress'))}<input name="address" maxlength="200"></label>
    <label>${esc(t('lblDate'))}<input type="date" name="preferredDate"></label>
    <label>${esc(t('lblDesc'))} *
      <textarea name="description" rows="5" required minlength="10" maxlength="1000"></textarea>
    </label>
    <button class="btn btn-primary btn-block" type="submit">${esc(t('btnSubmitReq'))}</button>
  </form>
  <aside class="card side">
    <h3>${esc(t('helpTitle'))}</h3>
    <ol class="steps-list">
      <li>${esc(t('help1'))}</li><li>${esc(t('help2'))}</li><li>${esc(t('help3'))}</li>
    </ol>
    <a href="#/track" class="btn btn-ghost btn-block">${esc(t('btnTrack'))}</a>
  </aside>
</div>`;
}

function bindRequest(q) {
  wireLoc('rq', { prov: provinceOfCity(q.city), city: q.city });
  const manual = $('#rqManualLocation');
  $('#rqCity').addEventListener('change', () => { $('#rqCityId').value = $('#rqCity').value; });
  $('#rqArea').addEventListener('change', () => { $('#rqAreaId').value = $('#rqArea').value; });
  $('#rqProv').addEventListener('change', () => {
    $('#rqCityId').value = '';
    $('#rqAreaId').value = '';
    $('#rqProvinceName').value = $('#rqProv').selectedOptions[0]?.textContent || '';
    $('#rqCityName').value = '';
    $('#rqAreaName').value = '';
  });
  $('#rqCity').addEventListener('change', () => {
    const loc = locFind($('#rqCity').value);
    $('#rqProvinceName').value = loc ? loc.province.name : '';
    $('#rqCityName').value = loc ? loc.city.name : '';
    $('#rqAreaName').value = '';
  });
  $('#rqArea').addEventListener('change', () => {
    const loc = locFind($('#rqCity').value);
    const area = loc && loc.city.areas.find(item => item.id === $('#rqArea').value);
    $('#rqAreaName').value = area ? area.name : '';
  });
  initRequestMap(manual);
  $('#reqForm').onsubmit = async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    if (!$('#rqMapPanel').classList.contains('hidden')) {
      if (!data.locationName || data.latitude === '' || data.longitude === '') {
        toast(t('mapChoose'), 'err');
        return;
      }
    } else {
      data.cityId = $('#rqCity').value;
      data.areaId = $('#rqArea').value;
    }
    const button = e.submitter || e.target.querySelector('button[type="submit"]');
    button.disabled = true;
    button.classList.add('is-loading');
    button.textContent = t('reqSubmitting');
    try {
      const r = await api('/api/requests', data);
      $('#reqWrap').outerHTML = `
<section class="card success">
  <div class="tick">✔</div>
  <h2>${esc(t('reqSuccess'))}</h2>
  <p>${esc(t('reqCode'))}</p>
  <div class="code-row"><div class="code">${esc(r.code)}</div><button class="btn btn-ghost btn-sm" type="button" id="copyRequestCode">${esc(t('copyCode'))}</button></div>
  <p class="muted">${esc(t('reqSuccessSub'))}</p>
  <a class="btn btn-primary" href="#/track?code=${encodeURIComponent(r.code)}">${esc(t('btnTrack'))}</a>
</section>`;
      $('#copyRequestCode').onclick = async () => {
        try {
          await navigator.clipboard.writeText(r.code);
          toast(t('codeCopied'));
        } catch (err) {
          toast(t('copyFailed'), 'err');
        }
      };
    } catch (err) {
      toast(err.message, 'err');
      button.disabled = false;
      button.classList.remove('is-loading');
      button.textContent = t('btnSubmitReq');
    }
  };
}

function loadGoogleMaps(apiKey) {
  if (window.google && window.google.maps && window.google.maps.places) return Promise.resolve();
  if (mapsScriptPromise) return mapsScriptPromise;
  mapsScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places`;
    script.async = true;
    script.onload = () => window.google && window.google.maps && window.google.maps.places
      ? resolve()
      : reject(new Error('Google Maps Places library did not load'));
    script.onerror = () => reject(new Error('Google Maps could not be loaded. Check the API key and enabled APIs.'));
    document.head.append(script);
  });
  return mapsScriptPromise;
}

function initRequestMap(manual) {
  const mapPanel = $('#rqMapPanel');
  const fallback = $('#rqMapUnavailable');
  api('/api/maps-config').then(async config => {
    if (!config.apiKey) {
      fallback.classList.remove('hidden');
      return;
    }
    await loadGoogleMaps(config.apiKey);
    mapPanel.classList.remove('hidden');
    manual.classList.add('hidden');
    $('#rqCity').required = false;
    $('#rqCity').disabled = true;
    fallback.classList.add('hidden');

    const center = { lat: 20, lng: 0 };
    requestMap = new google.maps.Map($('#requestMap'), {
      center, zoom: 2, mapTypeControl: false, streetViewControl: false,
      fullscreenControl: true, clickableIcons: false
    });
    requestGeocoder = new google.maps.Geocoder();
    requestMarker = new google.maps.Marker({ map: requestMap, draggable: true });
    currentLocationMarker = new google.maps.Marker({
      map: requestMap,
      clickable: false,
      title: t('mapYourLocation'),
      zIndex: google.maps.Marker.MAX_ZINDEX + 1,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 9,
        fillColor: '#2563eb',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3
      }
    });
    $('#rqUseLocation').onclick = () => {
      if (!navigator.geolocation) {
        toast(t('mapLocationUnsupported'), 'err');
        return;
      }
      const button = $('#rqUseLocation');
      button.disabled = true;
      navigator.geolocation.getCurrentPosition(position => {
        const point = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        requestMap.panTo(point);
        requestMap.setZoom(16);
        currentLocationMarker.setPosition(point);
        requestMarker.setPosition(point);
        reverseGeocode(point, () => { button.disabled = false; });
      }, () => {
        button.disabled = false;
        toast(t('mapLocationError'), 'err');
      }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
    };
    const search = $('#rqPlaceSearch');
    search.addEventListener('input', () => {
      mapRequestSequence += 1;
      requestMarker.setPosition(null);
      setMapLocation('', '', '', '', '', '');
      $('#rqMapSelection').textContent = `${t('selectedLocation')}: —`;
    });
    const autocomplete = new google.maps.places.Autocomplete(search, {
      fields: ['geometry', 'formatted_address', 'address_components', 'name']
    });
    autocomplete.bindTo('bounds', requestMap);
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place.geometry || !place.geometry.location) {
        toast('Choose a suggested address to set the map pin.', 'err');
        return;
      }
      selectMapPlace(place, place.geometry.location);
    });
    requestMap.addListener('click', event => reverseGeocode(event.latLng));
    requestMarker.addListener('dragend', event => reverseGeocode(event.latLng));
  }).catch(err => {
    fallback.textContent = `${t('mapUnavailable')} ${err.message}`;
    fallback.classList.remove('hidden');
  });
}

function selectMapPlace(place, position) {
  mapRequestSequence += 1;
  const components = place.address_components || [];
  const component = type => {
    const found = components.find(item => item.types.includes(type));
    return found ? found.long_name : '';
  };
  const city = component('locality') || component('postal_town') || component('administrative_area_level_2');
  const area = component('sublocality_level_1') || component('neighborhood') || component('administrative_area_level_3');
  const province = component('administrative_area_level_1');
  const label = place.formatted_address || place.name || '';
  setMapLocation(label, position.lat(), position.lng(), province, city, area);
  requestMap.panTo(position);
  requestMap.setZoom(Math.max(requestMap.getZoom(), 15));
  requestMarker.setPosition(position);
}

function reverseGeocode(position, onComplete = () => {}) {
  const requestId = ++mapRequestSequence;
  const latitude = position.lat();
  const longitude = position.lng();
  requestMarker.setPosition(position);
  setMapLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`, latitude, longitude, '', '', '');
  requestGeocoder.geocode({ location: position }, (results, status) => {
    if (requestId === mapRequestSequence) {
      if (status !== 'OK' || !results.length) {
        toast(t('mapPinError'), 'err');
      } else {
        selectMapPlace(results[0], position);
        $('#rqPlaceSearch').value = results[0].formatted_address || '';
      }
    }
    onComplete();
  });
}

function setMapLocation(label, latitude, longitude, province, city, area) {
  $('#rqLocationName').value = label;
  $('#rqLatitude').value = latitude;
  $('#rqLongitude').value = longitude;
  $('#rqProvinceName').value = province;
  $('#rqCityName').value = city;
  $('#rqAreaName').value = area;
  $('#rqMapSelection').textContent = `${t('selectedLocation')}: ${label}`;
  const matchedCity = state.locations.flatMap(p => p.cities)
    .find(item => item.name.toLowerCase() === city.toLowerCase());
  $('#rqCityId').value = matchedCity ? matchedCity.id : '';
  const matchedArea = matchedCity && matchedCity.areas.find(item => item.name.toLowerCase() === area.toLowerCase());
  $('#rqAreaId').value = matchedArea ? matchedArea.id : '';
}

// ---------- JOIN AS WORKER ----------
function joinHTML() {
  const s = state.settings;
  const fee = Number(s.registrationFee) || 0;
  const pay = fee > 0 ? `
    <div class="pay-box">
      <strong>${esc(t('feeNote'))}: PKR ${fee}</strong>
      <p class="muted">EasyPaisa: <b>${esc(s.easypaisaNumber)}</b> (${esc(s.easypaisaTitle)})
        &nbsp;·&nbsp; JazzCash: <b>${esc(s.jazzcashNumber)}</b> (${esc(s.jazzcashTitle)})</p>
      <div class="grid-2">
        <label>${esc(t('lblPayMethod'))}
          <select name="paymentMethod" required>
            <option value="">${esc(t('selectOne'))}</option>
            <option value="easypaisa">EasyPaisa</option>
            <option value="jazzcash">JazzCash</option>
          </select>
        </label>
        <label>${esc(t('lblPayRef'))}<input name="paymentRef" required minlength="4" maxlength="60"></label>
      </div>
      <label>${esc(t('lblPayScreenshot'))} *
        <input id="paymentScreenshot" name="paymentScreenshot" type="file" accept="image/png,image/jpeg,image/webp" required>
        <small class="muted">${esc(t('payScreenshotHint'))}</small>
        <small class="payment-file-name muted" id="paymentFileName" aria-live="polite">${esc(t('paymentFile'))}</small>
      </label>
      <img id="paymentPreview" class="payment-preview hidden" alt="Payment screenshot preview">
    </div>` : '';
  return `
<section class="page-head"><h1>${esc(t('joinTitle'))}</h1><p>${esc(t('joinSub'))}</p></section>
<div id="joinWrap">
  <form class="card form" id="joinForm">
    <div class="approval-note">${esc(t('joinApproval'))}</div>
    <div class="grid-2">
      <label>${esc(t('lblName'))} *<input name="name" required minlength="3" maxlength="80"></label>
      <label>${esc(t('lblPhone'))} *<input name="phone" required placeholder="03XX-XXXXXXX"></label>
    </div>
    <div class="grid-2">
      <label>${esc(t('lblProfession'))} *
        <select name="categoryId" required><option value="">${esc(t('selService'))}</option>${categoryOptions()}</select>
      </label>
      <label>${esc(t('lblExp'))}<input type="number" name="experience" min="0" max="60" value="1"></label>
    </div>
    <div class="grid-3">
      <label>${esc(t('lblProv'))} *<select id="jwProv"></select></label>
      <label>${esc(t('lblCity'))} *<select id="jwCity" name="cityId" required disabled></select></label>
      <div></div>
    </div>
    <fieldset class="areas">
      <legend>${esc(t('lblServiceAreas'))}</legend>
      <div class="chips" id="jwAreas"></div>
    </fieldset>
    <label>${esc(t('lblBio'))}<textarea name="bio" rows="4" maxlength="500"></textarea></label>
    <div class="grid-2">
      <label>${esc(t('lblPhoto'))}<input type="file" name="photo" accept="image/png,image/jpeg,image/webp"></label>
      <label class="check"><input type="checkbox" name="showPhone"> ${esc(t('lblShowPhone'))}</label>
    </div>
    ${pay}
    <button class="btn btn-primary btn-block" type="submit">${esc(t('btnRegister'))}</button>
  </form>
</div>`;
}

function bindJoin() {
  wireLoc('jw');
  const paymentInput = $('#paymentScreenshot');
  if (paymentInput) {
    paymentInput.addEventListener('change', () => {
      const preview = $('#paymentPreview');
      if (preview.dataset.objectUrl) URL.revokeObjectURL(preview.dataset.objectUrl);
      if (!paymentInput.files[0]) {
        preview.classList.add('hidden');
        $('#paymentFileName').textContent = t('paymentFile');
        return;
      }
      const file = paymentInput.files[0];
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 3 * 1024 * 1024) {
        paymentInput.value = '';
        preview.classList.add('hidden');
        $('#paymentFileName').textContent = t('paymentFile');
        toast(t(file.size > 3 * 1024 * 1024 ? 'paymentFileSizeError' : 'paymentFileTypeError'), 'err');
        return;
      }
      preview.dataset.objectUrl = URL.createObjectURL(file);
      preview.src = preview.dataset.objectUrl;
      preview.classList.remove('hidden');
      $('#paymentFileName').textContent = file.name;
    });
  }
  const renderAreas = () => {
    const found = locFind($('#jwCity').value);
    $('#jwAreas').innerHTML = found && found.city.areas.length
      ? found.city.areas.map(a => `<label class="chip"><input type="checkbox" name="areaIds" value="${esc(a.id)}"> ${esc(a.name)}</label>`).join('')
      : `<span class="muted">${esc(t('pickCityFirst'))}</span>`;
  };
  $('#jwProv').addEventListener('change', renderAreas);
  $('#jwCity').addEventListener('change', renderAreas);
  renderAreas();

  $('#joinForm').onsubmit = async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const payload = Object.fromEntries(
      ['name', 'phone', 'categoryId', 'experience', 'cityId', 'bio', 'paymentMethod', 'paymentRef']
        .map(k => [k, fd.get(k) || ''])
    );
    payload.areaIds = fd.getAll('areaIds');
    payload.showPhone = fd.get('showPhone') === 'on';
    const button = e.submitter || e.target.querySelector('button[type="submit"]');
    button.disabled = true;
    button.classList.add('is-loading');
    button.textContent = t('btnRegistering');
    try {
      const photo = fd.get('photo');
      if (photo && photo.size) payload.photo = await readFile(photo);
      const proof = fd.get('paymentScreenshot');
      if (proof && proof.size) payload.paymentScreenshot = await readFile(proof);
      const r = await api('/api/workers', payload);
      $('#joinWrap').innerHTML = `
<section class="card success">
  <div class="tick">✔</div>
  <h2>${esc(t('applied'))}</h2>
  <p class="muted">${esc(r.message)}</p>
  <p class="approval-note">${esc(t('joinApproval'))}</p>
  <a class="btn btn-ghost" href="#/">${esc(t('navHome'))}</a>
</section>`;
    } catch (err) {
      toast(err.message, 'err');
      button.disabled = false;
      button.classList.remove('is-loading');
      button.textContent = t('btnRegister');
    }
  };
}

// ---------- TRACK ----------
function trackHTML(q) {
  return `
<section class="page-head"><h1>${esc(t('trackTitle'))}</h1><p>${esc(t('trackSub'))}</p></section>
<div class="split track-layout">
  <form class="card form" id="trackForm">
    <label>${esc(t('lblCode'))}<input name="code" required placeholder="HN-00001" maxlength="12" value="${esc(q.code || '')}"></label>
    <label>${esc(t('lblPhone'))}<input name="phone" required placeholder="03XX-XXXXXXX"></label>
    <button class="btn btn-primary btn-block" type="submit">${esc(t('btnCheck'))}</button>
  </form>
  <div id="trackResult" class="track-result">
    <section class="card track-empty"><div class="track-empty-icon">⌕</div><h3>${esc(t('trackTitle'))}</h3><p class="muted">${esc(t('trackSub'))}</p></section>
  </div>
</div>`;
}

function bindTrack() {
  const form = $('#trackForm');
  const checkStatus = async () => {
    const f = form.elements;
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    button.classList.add('is-loading');
    button.textContent = t('checkingStatus');
    try {
      const r = await api('/api/requests/track?' + qs({ code: f.code.value.trim(), phone: f.phone.value.trim() }));
      const steps = [
        ['new', t('trackReceived')],
        ['contacted', t('trackContact')],
        ['assigned', t('trackAssigned')],
        ['in_progress', t('trackWork')],
        ['completed', t('trackDone')]
      ];
      const statusIndex = { new: 0, contacted: 1, assigned: 2, in_progress: 3, completed: 4 };
      const current = statusIndex[r.status];
      $('#trackResult').innerHTML = `
<section class="card track-card">
  <div class="track-card-head"><div><span class="eyebrow">${esc(t('trackProgress'))}</span><h2>${esc(r.code)}</h2></div>
    <span class="badge ${r.status === 'completed' ? 'ok' : r.status === 'cancelled' ? 'cancelled' : 'info'}">${esc(t('st_' + r.status))}</span>
  </div>
  <div class="track-meta"><b>${esc(r.categoryName)}</b><span>${esc(r.locationName || [r.cityName, r.areaName].filter(Boolean).join(', ') || '—')}</span>
    <small class="muted">${esc(t('trackCreated'))}: ${esc(new Date(r.createdAt).toLocaleString())}</small>
    <small class="muted">${esc(t('trackUpdated'))}: ${esc(new Date(r.updatedAt).toLocaleString())}</small></div>
  ${r.assignedWorkerName ? `<div class="assigned-worker"><span class="eyebrow">${esc(t('trackWorker'))}</span><strong>${esc(r.assignedWorkerName)}</strong>${r.assignedWorkerPhone ? `<a href="tel:${esc(r.assignedWorkerPhone)}">${esc(r.assignedWorkerPhone)}</a>` : ''}</div>` : ''}
  ${r.status === 'cancelled' ? `<p class="track-cancelled">${esc(t('trackCancelled'))}</p>` : `
  <ol class="progress-track">${steps.map(([key, label], index) => {
    const done = current !== undefined && index < current;
    const active = current !== undefined && index === current;
    return `<li class="${done ? 'done' : ''} ${active ? 'active' : ''}">
      <span class="progress-dot">${done ? '✓' : index + 1}</span><span>${esc(label)}</span>
    </li>`;
  }).join('')}</ol>`}
</section>`;
    } catch (err) {
      toast(err.message, 'err');
    } finally {
      button.disabled = false;
      button.classList.remove('is-loading');
      button.textContent = t('btnCheck');
    }
  };
  form.onsubmit = async e => {
    e.preventDefault();
    await checkStatus();
  };
}

// ---------- router ----------
const VIEWS = {
  '/': { html: homeHTML, bind: bindHome },
  '/workers': { html: workersHTML, bind: bindWorkers },
  '/request': { html: requestHTML, bind: bindRequest },
  '/join': { html: joinHTML, bind: bindJoin },
  '/track': { html: trackHTML, bind: bindTrack }
};

function render() {
  clearInterval(carouselTimer);
  const { path, q } = parseHash();
  const view = VIEWS[path] || VIEWS['/'];
  document.querySelectorAll('.menu a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + path));
  $('#app').innerHTML = view.html(q);
  view.bind(q);
  window.scrollTo(0, 0);
}

function applyLang() {
  document.documentElement.lang = state.lang;
  document.documentElement.dir = state.lang === 'ur' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  $('#langBtn').textContent = state.lang === 'en' ? 'اردو' : 'English';
}

function renderChrome() {
  const s = state.settings;
  $('#brandName').textContent = s.siteName || 'Hunar Near Me';
  $('#footer').innerHTML = `
<div class="container foot-grid">
  <div><strong>${esc(s.siteName)}</strong><p class="muted-light">${esc(s.tagline)}</p></div>
  <div><strong>Contact</strong><p>${esc(s.supportPhone)}<br>${esc(s.supportEmail)}<br>${esc(s.address)}</p></div>
  <div><strong>Links</strong><p>
    <a href="#/workers">${esc(t('navFind'))}</a><br>
    <a href="#/join">${esc(t('navJoin'))}</a><br>
    <a href="/admin/">${esc(t('adminLogin'))}</a></p></div>
</div>
<p class="copy">© ${new Date().getFullYear()} ${esc(s.siteName)}. ${esc(t('footerRights'))}</p>`;
}

$('#langBtn').onclick = () => {
  state.lang = state.lang === 'en' ? 'ur' : 'en';
  localStorage.setItem('hn_lang', state.lang);
  applyLang();
  renderChrome();
  render();
};
$('#menuBtn').onclick = () => $('#menu').classList.toggle('open');
window.addEventListener('hashchange', () => { $('#menu').classList.remove('open'); render(); });

async function init() {
  applyLang();
  try {
    const [settings, categories, locations, banners] = await Promise.all([
      api('/api/settings'), api('/api/categories'), api('/api/locations'), api('/api/banners')
    ]);
    Object.assign(state, { settings, categories, locations, banners });
  } catch (err) {
    toast('Could not load site data. Make sure the server is running.', 'err');
  }
  renderChrome();
  render();
}

init();
