'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_FILE = path.join(__dirname, '..', 'data', 'db.json');

const uid = (prefix = '') => prefix + crypto.randomBytes(6).toString('hex');
const now = () => new Date().toISOString();

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  return salt + ':' + crypto.scryptSync(String(password), salt, 64).toString('hex');
}

function verifyPassword(password, stored) {
  const [salt, hash] = String(stored || '').split(':');
  if (!salt || !hash) return false;
  const expected = Buffer.from(hash, 'hex');
  const actual = crypto.scryptSync(String(password), salt, expected.length);
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

// Starter services (from the proposal). Admin can add/edit/hide any of these.
const SEED_CATEGORIES = [
  { name: 'Electrician', nameUr: 'الیکٹریشن', icon: '⚡', sub: ['Wiring', 'Fan & light repair', 'Inverter installation'] },
  { name: 'Plumber', nameUr: 'پلمبر', icon: '🔧', sub: ['Pipe leakage', 'Tank cleaning', 'Bathroom fitting'] },
  { name: 'AC Repair', nameUr: 'اے سی مرمت', icon: '❄️', sub: ['Gas refill', 'Servicing', 'Installation'] },
  { name: 'Mechanic', nameUr: 'مکینک', icon: '🛠️', sub: ['Engine repair', 'Car service'] },
  { name: 'Painter', nameUr: 'پینٹر', icon: '🖌️', sub: ['House painting', 'Wall design'] },
  { name: 'Carpenter', nameUr: 'ترکھان', icon: '🪚', sub: ['Furniture', 'Doors & windows'] },
  { name: 'Cleaning', nameUr: 'صفائی', icon: '🧹', sub: ['Home cleaning', 'Sofa cleaning'] },
  { name: 'Tutor', nameUr: 'ٹیوٹر', icon: '📚', sub: ['Math tutoring', 'Science tutoring'] },
  { name: 'Tailor', nameUr: 'درزی', icon: '🧵', sub: ['Custom stitching', 'Alterations'] },
  { name: 'Cook', nameUr: 'باورچی', icon: '🍳', sub: ['Home cooking', 'Event catering'] },
  { name: 'Gardener', nameUr: 'مالی', icon: '🌱', sub: ['Lawn care', 'Landscaping'] },
  { name: 'Other', nameUr: 'دیگر', icon: '➕', sub: [] }
];

// Seed the best-known service areas below, then add the curated Pakistan city list.
const SEED_LOCATIONS = {
  'Punjab': {
    'Lahore': ['Johar Town', 'DHA Phase 1-8', 'Gulberg', 'Model Town', 'Bahria Town', 'Iqbal Town', 'Wapda Town'],
    'Faisalabad': ['Madina Town', 'Peoples Colony', 'Samanabad'],
    'Rawalpindi': ['Satellite Town', 'Chaklala', 'Bahria Town', 'Saddar'],
    'Multan': ['Cantt', 'Shah Rukn-e-Alam Colony'],
    'Gujranwala': ['Model Town', 'Satellite Town']
  },
  'Islamabad Capital Territory': {
    'Islamabad': ['F-6', 'F-7', 'F-10', 'G-9', 'G-11', 'I-8', 'Bahria Enclave', 'DHA Phase 2']
  },
  'Sindh': {
    'Karachi': ['Gulshan-e-Iqbal', 'DHA', 'Clifton', 'North Nazimabad', 'Saddar', 'Bahria Town'],
    'Hyderabad': ['Qasimabad', 'Latifabad']
  },
  'Khyber Pakhtunkhwa': {
    'Peshawar': ['University Town', 'Hayatabad', 'Saddar'],
    'Mardan': [],
    'Abbottabad': []
  },
  'Balochistan': {
    'Quetta': ['Jinnah Town', 'Satellite Town']
  },
  'Azad Jammu & Kashmir': {
    'Muzaffarabad': [],
    'Mirpur': []
  },
  'Gilgit-Baltistan': {
    'Gilgit': []
  }
};

function buildLocations() {
  const locations = Object.entries(SEED_LOCATIONS).map(([province, cities]) => ({
    id: uid('prv_'),
    name: province,
    cities: Object.entries(cities).map(([city, areas]) => ({
      id: uid('cty_'),
      name: city,
      areas: areas.map(area => ({ id: uid('area_'), name: area, subAreas: [] }))
    }))
  }));
  const cityList = fs.readFileSync(path.join(__dirname, '..', 'samples', 'pakistan-cities.txt'), 'utf8');
  for (const line of cityList.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const [provinceName, cityName] = line.split('|').map(part => part.trim());
    if (!provinceName || !cityName) continue;
    let province = locations.find(item => item.name.toLowerCase() === provinceName.toLowerCase());
    if (!province) {
      province = { id: uid('prv_'), name: provinceName, cities: [] };
      locations.push(province);
    }
    if (!province.cities.some(city => city.name.toLowerCase() === cityName.toLowerCase())) {
      province.cities.push({ id: uid('cty_'), name: cityName, areas: [] });
    }
  }
  return locations;
}

function seedData(adminPassword) {
  return {
    settings: {
      siteName: 'Hunar Near Me',
      tagline: 'Find trusted skilled professionals near you',
      registrationFee: 0,
      easypaisaNumber: '03XX-XXXXXXX',
      easypaisaTitle: 'Hunar Near Me',
      jazzcashNumber: '03XX-XXXXXXX',
      jazzcashTitle: 'Hunar Near Me',
      supportPhone: '+92 300 0000000',
      supportEmail: 'support@hunarnearme.pk',
      address: 'Lahore, Pakistan'
    },
    admins: [{
      id: uid('adm_'), username: 'admin', name: 'Super Admin',
      passwordHash: hashPassword(adminPassword), createdAt: now()
    }],
    categories: SEED_CATEGORIES.map((c, i) => ({
      id: uid('cat_'), name: c.name, nameUr: c.nameUr, icon: c.icon,
      subServices: c.sub, active: true, order: i + 1, createdAt: now()
    })),
    locations: buildLocations(),
    banners: [
      { id: uid('ban_'), title: 'Find trusted electricians near you', subtitle: 'Verified local professionals in your city', image: '', link: '#/workers', active: true, order: 1, createdAt: now() },
      { id: uid('ban_'), title: 'Are you a skilled worker?', subtitle: 'Register, get verified and receive customer requests', image: '', link: '#/join', active: true, order: 2, createdAt: now() }
    ],
    workers: [],
    requests: [],
    notifications: [],
    stats: { totalViews: 0, seen: {}, daily: {} },
    counters: { request: 0 }
  };
}

class Store {
  constructor(file = DATA_FILE) {
    this.file = file;
    this.adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    this.data = null;
    this.created = false;
    this.timer = null;
  }

  load() {
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    if (!fs.existsSync(this.file)) {
      this.data = seedData(this.adminPassword);
      this.created = true;
      this.flush();
      return this.data;
    }
    const loaded = JSON.parse(fs.readFileSync(this.file, 'utf8'));
    const defaults = seedData(this.adminPassword);
    let changed = false;
    for (const key of Object.keys(defaults)) {
      if (loaded[key] === undefined) {
        loaded[key] = defaults[key];
        changed = true;
      }
    }
    for (const seededProvince of defaults.locations) {
      let province = loaded.locations.find(item => item.name.toLowerCase() === seededProvince.name.toLowerCase());
      if (!province) {
        loaded.locations.push(seededProvince);
        changed = true;
        continue;
      }
      for (const seededCity of seededProvince.cities) {
        let city = province.cities.find(item => item.name.toLowerCase() === seededCity.name.toLowerCase());
        if (!city) {
          province.cities.push(seededCity);
          changed = true;
          continue;
        }
        for (const seededArea of seededCity.areas) {
          if (!city.areas.some(item => item.name.toLowerCase() === seededArea.name.toLowerCase())) {
            city.areas.push(seededArea);
            changed = true;
          }
        }
      }
    }
    if (changed) {
      this.data = loaded;
      this.flush();
    }
    this.data = loaded;
    return this.data;
  }

  // Write immediately (atomic: temp file then rename)
  flush() {
    clearTimeout(this.timer);
    this.timer = null;
    const tmp = this.file + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(this.data, null, 2));
    fs.renameSync(tmp, this.file);
  }

  // Debounced write so many changes do not hammer the disk
  touch() {
    if (this.timer) return;
    this.timer = setTimeout(() => { this.timer = null; this.flush(); }, 300);
  }
}

const store = new Store();
module.exports = { store, uid, now, hashPassword, verifyPassword };
