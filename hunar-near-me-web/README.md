# Hunar Near Me: Web Platform

A web marketplace for skilled local professionals in Pakistan, with:

- **Customer website**: home page with ads, service categories, worker search with province / city / area filters, Google Maps service-location selection, worker registration, request tracking, English and Urdu.
- **Admin control centre**: live notifications for every new request or worker application, dashboard with website visit statistics, service requests with worker assignment, worker approvals with fee verification, services, unlimited locations, ads/banners, settings and account.

## 1. Requirements

- **Node.js 20 or newer**: download the LTS version from https://nodejs.org and install it.
- **VS Code** (recommended).

Check the installed version in a terminal with `node -v`.

## 2. Run it in VS Code

1. Open VS Code, then **File > Open Folder** and select the `hunar-near-me-web` folder.
2. Open a terminal: **Terminal > New Terminal**.
3. Install the packages (only needed the first time):
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm start
   ```
5. Open these links in the browser:
   - Customer website: http://localhost:3000
   - Admin panel: http://localhost:3000/admin/

You can also press **F5** and choose **Run Hunar Near Me** from the Run and Debug panel. The server then runs with the debugger attached.

To stop the server, press `Ctrl + C` in the terminal.

## 3. Admin login

| Field    | Default value |
|----------|---------------|
| Username | `admin`       |
| Password | `admin123`    |

The username and password can both be changed from **Admin > Account**. Each change requires the current password. To set a different password before the first run, stop the server and start it like this:

- Windows PowerShell: `$env:ADMIN_PASSWORD="YourStrongPassword"; npm start`
- Mac / Linux: `ADMIN_PASSWORD="YourStrongPassword" npm start`

This only applies when the data file is created for the first time. After that, use **Admin > Account**.

The admin panel locks login for 15 minutes after 5 wrong password attempts.

## 4. Adding Pakistan locations

Locations are a four-level tree: **Province > City > Area / Society > Sub-area**. Every province, city and area you add appears in the customer search and in the worker and customer forms.

The starter data includes more than 330 curated city and town names across Pakistan's provinces and territories. It is not a complete official gazetteer, and it does not include every village or neighborhood. New starter entries are added to existing databases without removing your saved locations. Add missing localities and neighborhoods with either method below:

- **Bulk import (fastest):** Admin > Locations > Bulk import. Paste one location per line, with levels separated by `|`:
  ```
  Punjab | Lahore | Johar Town | Block A
  Punjab | Lahore | Gulberg
  Sindh | Karachi | Gulshan-e-Iqbal | Block 13
  ```
  Items that already exist are reused, so you can paste the same lines again without duplicates.
- **Manual:** use the **+ Province / + City / + Area** buttons in the tree. Use **Rename** or **Delete** to edit. A location that is used by a worker or request cannot be deleted.

The file `samples/pakistan-cities.txt` contains the starter city and town list. It is loaded automatically when the app is first started and when an existing database is upgraded. You can also paste it into the bulk import box; existing entries are reused. Add the areas and societies under each city.

Customer service requests also support selecting an exact address or neighborhood anywhere in the world, even when it is not in the saved city / area list. The map opens to a world view; customers can search worldwide with Google Places, click or drag the request-location pin, or voluntarily use the current-location button. The browser asks permission before sharing the location; the app does not continuously track the customer. A blue dot marks the current location and a separate pin marks the selected service location. HTTPS or localhost is required for browser geolocation. The map and Places search have no country restriction. Google Places availability depends on Google's map data and the API key's enabled services. To enable the interactive map, enable the **Maps JavaScript API**, **Places API** and **Geocoding API** in a Google Cloud project, attach billing, and create an API key restricted to your site domains and those APIs. Configure the key in the same PowerShell terminal used to start the server:

```powershell
$env:GOOGLE_MAPS_API_KEY="your-restricted-key"
npm start
```

For local development, include `http://localhost:3000/*` (or your chosen local port) in the key's website restrictions. Without a key, service requests continue to use the province / city / area selectors. Clicking or dragging the pin saves that exact pin's coordinates, even if Google cannot resolve a street address. Map-selected details can be opened from Admin > Requests.

## 5. Services (categories)

Admin > Services lets you add, rename, reorder (↑ ↓), hide and delete services, and set their sub-services and Urdu names. Hidden services stay in the database but disappear from the website. A service that is already used by a worker or request cannot be deleted, so hide it instead.

## 6. Live notifications

When a customer sends a service request, or a worker submits an application, the signed-in admin panel:

- shows a notification toast in the corner,
- plays a short sound (after the first click on the page, as browsers require),
- updates the 🔔 counter and the sidebar badges,
- can show a browser alert while the admin tab is in the background if you enable **Notifications > Enable mobile & desktop alerts** and allow browser permission.

The stream uses Server-Sent Events, so no page refresh is needed. Keep the admin panel open and signed in to receive live alerts. Browser alerts require HTTPS (or localhost) and browser permission; support varies by mobile browser.

## 7. Light and dark mode

Use the moon/sun button in the customer site or admin panel. Your preference is saved in that browser and shared between both pages.

## 8. Registration fee and manual payment checks

Admin > Settings sets the worker registration fee in PKR and the EasyPaisa / JazzCash receiving numbers.

- **0 PKR** means free registration (pilot mode).
- When the fee is above 0, a worker must choose a payment method, enter a transaction ID and attach a payment screenshot. The screenshot is only visible to signed-in admins; verify the payment against the merchant statement before approval.
- The worker form previews the selected receipt before submission and accepts PNG, JPG or WEBP up to 3 MB. Admins can open the private receipt from the worker application details.
- To approve an application, sign in at **Admin > Workers**, open a pending worker, review the profile and select **Approve**. For paid registrations, first open the receipt, check the transaction against the EasyPaisa / JazzCash merchant statement, and select **Mark payment verified**. The server blocks approval until required payment verification is complete. Approved workers then appear in public worker search.

## 9. Testing

With the server running in one terminal, open a second terminal and run:

```bash
npm test
```

The test checks the public pages, request validation, admin security, live notifications, worker approval rules, fee enforcement, location import and the dashboard. It removes its own test records at the end.

## 10. Project structure

```
hunar-near-me-web/
├── server.js            Express server: public API, admin API, sessions, live events
├── lib/store.js         JSON data store, password hashing, starter data
├── public/
│   ├── index.html       Customer website shell
│   ├── css/style.css    Shared responsive light and dark themes
│   ├── js/site.js       Customer website logic (routing, search, forms, EN / UR)
│   ├── js/theme.js      Shared saved light / dark theme
│   ├── service-worker.js Mobile-friendly browser notification clicks
│   └── admin/
│       ├── index.html   Admin shell (login, sidebar, top bar)
│       ├── pages.js     Admin page renderers
│       └── core.js      Admin routing, actions, modals, live notifications
├── samples/pakistan-cities.txt   Ready-to-paste list of Pakistani cities
├── tests/smoke.js       Automated smoke test (npm test)
├── .vscode/launch.json  One-click run configuration for VS Code
├── data/db.json         Created on first run: all records (services, locations, workers, requests, settings, admins)
├── uploads/             Public profile photos and ad images
└── private-uploads/     Payment screenshots, available only to signed-in admins
```

## 11. Backup

Everything is stored in `data/db.json`, `uploads/` and `private-uploads/`. To back up, copy these folders somewhere safe while the server is stopped.

## 12. Scope of this version and what comes next

This version is a working local platform for demonstrations and pilot testing. It follows the proposal's **local-first prototype** stage, with these limits:

- **Storage** is a JSON file, which is suitable for a few thousand records. The proposal's production target is PostgreSQL with PostGIS.
- **Customer and worker login with SMS OTP** is not included yet. Customers submit requests without an account, and workers are verified by the admin. The proposal's "real OTP provider" step needs a provider account (for example Telenor or Jazz SMS gateway, or a service such as Twilio).
- **Reviews, quotations and in-app chat** are not included yet. They are the next modules.
- **EasyPaisa / JazzCash** are handled manually. Automatic payment confirmation needs merchant API approval.
- **Images** are checked for real image content and size (3 MB maximum), but they are not converted to WebP or scanned for malware yet.
- **HTTPS, backups scheduling and hosting** must be set up before public launch. Run this on a server with HTTPS, and change the admin password first.

Before public launch, also review the security list in the proposal: strong password policy, rate limits on public forms, backups with restore tests, and privacy notices.
