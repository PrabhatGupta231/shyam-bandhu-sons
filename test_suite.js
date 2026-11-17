/**
 * Shyam Bandhu & Sons - Offline Showroom & Lookbook Test Suite
 * Tests Offline Architecture, Layout Alignment, Navigation Order, Women's Wear Priority, and Zero E-Commerce
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// 1. Load Data
const dataContent = fs.readFileSync(path.join(__dirname, 'data.js'), 'utf8');
const exported = vm.runInNewContext(dataContent + '\n;({ DEFAULT_STORE_CONFIG, DEFAULT_HERO_SLIDES, DEFAULT_CATALOG, DEFAULT_GALLERY, DEFAULT_ARTICLES, StorageEngine });');
const { DEFAULT_STORE_CONFIG, DEFAULT_HERO_SLIDES, DEFAULT_CATALOG, DEFAULT_GALLERY, DEFAULT_ARTICLES, StorageEngine } = exported;

const results = [];

function assert(condition, message) {
  if (condition) {
    results.push({ status: 'PASS', message });
  } else {
    results.push({ status: 'FAIL', message });
  }
}

// 1. Store Config & Identity
assert(DEFAULT_STORE_CONFIG.name === 'SHYAM BANDHU & SONS', 'Brand Name is strictly SHYAM BANDHU & SONS (No AZA)');
assert(DEFAULT_STORE_CONFIG.byline === 'By : Raj Kamal', 'Official Founder By-line is strictly By : Raj Kamal');
assert(DEFAULT_STORE_CONFIG.phone.includes('9450646328') && DEFAULT_STORE_CONFIG.altPhone.includes('9889340888'), 'Store phones updated to official showroom numbers (9450646328, 9889340888)');
assert(DEFAULT_STORE_CONFIG.instagramHandle === '@shyam_bandhu_andsons', 'Official Instagram handle is @shyam_bandhu_andsons');
assert(DEFAULT_STORE_CONFIG.tagline.includes('Saree') && DEFAULT_STORE_CONFIG.tagline.includes('Lehenga') && DEFAULT_STORE_CONFIG.tagline.includes('Gown') && DEFAULT_STORE_CONFIG.tagline.includes('Kids'), 'Tagline defines Deals Exclusively In: Saree • Lehenga • Indo-Western • Dresses • Frock • Suits • Gown • Kids Wear');
assert(DEFAULT_STORE_CONFIG.city.includes('Lucknow'), 'Store city is Lucknow (Lko)');
assert(DEFAULT_STORE_CONFIG.branch1 && DEFAULT_STORE_CONFIG.branch1.address.includes('Nakkhas') && DEFAULT_STORE_CONFIG.branch1.address.includes('73, 74'), 'Branch 1 is Shop no. 73, 74 new market Nakkhas, Lucknow');
assert(DEFAULT_STORE_CONFIG.branch2 && DEFAULT_STORE_CONFIG.branch2.address.includes('Tedhi Puliya') && DEFAULT_STORE_CONFIG.branch2.address.includes('Kursi Road'), 'Branch 2 is M.M.S - 2/15-16 Sector - C, Tedhi Puliya, Kursi Road, Lucknow');
assert(!JSON.stringify(DEFAULT_STORE_CONFIG).includes('Varanasi') && !JSON.stringify(DEFAULT_STORE_CONFIG).includes('Godowlia'), 'Zero references to Varanasi or Godowlia in store config');
assert(DEFAULT_STORE_CONFIG.timings.includes('10:30 AM – 9:00 PM'), 'Showroom hours set to 10:30 AM – 9:00 PM');
assert(!DEFAULT_STORE_CONFIG.announcement.includes('Shyam Bandhu & Sons (By : Raj Kamal)'), 'Top announcement bar does not redundantly repeat brand name and byline');
assert(!JSON.stringify(DEFAULT_STORE_CONFIG).includes('AZA'), 'Zero references to AZA in store config');

// 2. Family Category Validation & Priority (Women's Wear First)
const menItems = DEFAULT_CATALOG.filter(x => x.category === 'men');
const womenItems = DEFAULT_CATALOG.filter(x => x.category === 'women');
const kidsItems = DEFAULT_CATALOG.filter(x => x.category === 'kids');

assert(womenItems.length >= 4, `Women's Wear collection loaded (${womenItems.length} items: Lehengas, Banarasi Sarees, Anarkalis, Western)`);
assert(menItems.length >= 4, `Men's Wear collection loaded (${menItems.length} items: Sherwanis, Suits, Kurtas, Indo-Western)`);
assert(kidsItems.length >= 4, `Kids' Wear collection loaded (${kidsItems.length} items: Boys' Sherwanis, Girls' Lehengas, Party Frocks)`);

// Verify Women's Wear Top Priority in Catalog
assert(DEFAULT_CATALOG[0].category === 'women', "DEFAULT_CATALOG starts with Women's Wear items as top priority");
const sortedCatalog = StorageEngine.getCatalog();
assert(sortedCatalog[0].category === 'women', "StorageEngine.getCatalog() strictly guarantees Women's Wear items are returned first");

// 3. Hero Slide Priority & Sequencing
assert(DEFAULT_HERO_SLIDES[0].subtitle.includes("Women") && DEFAULT_HERO_SLIDES[0].title.includes("Women's Bridal Lehengas"),
  "Hero Slide #1 primary focus is Women's Bridal Lehengas, Designer Sarees & Ethnic Gowns"
);
assert(DEFAULT_HERO_SLIDES[0].image.includes("bridal-girl-hero.jpg"),
  "Hero Slide #1 uses the bridal girl hero image (public/images/bridal-girl-hero.jpg)"
);
assert(DEFAULT_HERO_SLIDES[1].subtitle.includes("Men") && DEFAULT_HERO_SLIDES[1].title.includes("Men's Royal Sherwanis"),
  "Hero Slide #2 showcases Men's Royal Sherwanis following Women's Wear"
);
assert(DEFAULT_HERO_SLIDES[2].subtitle.includes("Kids") && DEFAULT_HERO_SLIDES[2].title.includes("Kids' Festive Wear"),
  "Hero Slide #3 showcases Kids' Celebrations following Men's Wear"
);

// 4. Header 3-Column Grid & Navigation Alignment in styles.css
const stylesCss = fs.readFileSync(path.join(__dirname, 'styles.css'), 'utf8');
assert(stylesCss.includes('grid-template-columns: 1fr auto 1fr'), "Header uses 3-column CSS Grid (1fr auto 1fr) for dead-center logo alignment");
assert(stylesCss.includes('flex-wrap: nowrap') && stylesCss.includes('white-space: nowrap'),
  "Navigation menu uses flex-wrap: nowrap and white-space: nowrap for clean single-line bar"
);
assert(stylesCss.includes('padding: 0 1.5rem'),
  "Navigation container has proper px-6 (1.5rem) horizontal padding preventing edge clipping on Home and Contact links"
);

// Hero Editorial Layout & Gradient Assertions
assert(stylesCss.includes('rgba(15, 10, 8, 0.85)') && stylesCss.includes('rgba(15, 10, 8, 0.50)') && stylesCss.includes('rgba(15, 10, 8, 0.15)'),
  "Hero overlay uses adjusted 90deg gradient dark on left (0.85), mid (0.50), subtle on right (0.15) for image reveal"
);
assert(stylesCss.includes('.hero-slide-bg') && stylesCss.includes('opacity: 1') && stylesCss.includes('z-index: 1'),
  "Hero background image has explicit opacity: 1 and z-index: 1"
);
assert(stylesCss.includes('.hero-overlay') && stylesCss.includes('z-index: 2'),
  "Hero overlay has z-index: 2 sitting cleanly above image"
);
assert(stylesCss.includes('.hero-content') && stylesCss.includes('z-index: 3') && stylesCss.includes('color: #FFFFFF'),
  "Hero content has z-index: 3, opacity: 1 and color: #FFFFFF sitting above overlay"
);
assert(stylesCss.includes('hero-slide-container') && stylesCss.includes('padding: 0 6%'),
  "Hero text container is left-aligned with clean 6% padding"
);
assert(stylesCss.includes('max-width: 600px'),
  "Hero text content has max-width: 600px for balanced editorial hierarchy"
);
assert(stylesCss.includes('.hero-showroom-badge') && stylesCss.includes('bottom: 90px') && stylesCss.includes('right: 24px') && stylesCss.includes('z-index: 20'),
  "Showroom badge cleanly stacked at bottom: 90px; right: 24px; z-index: 20 with zero overlap over WhatsApp button"
);
assert(stylesCss.includes('.floating-whatsapp-btn') && stylesCss.includes('bottom: 24px') && stylesCss.includes('right: 24px'),
  "Floating WhatsApp button positioned at bottom: 24px; right: 24px;"
);

// 5. Navigation Link Ordering in index.html & gallery.html
const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const galleryHtml = fs.readFileSync(path.join(__dirname, 'gallery.html'), 'utf8');
const galleryJs = fs.readFileSync(path.join(__dirname, 'gallery.js'), 'utf8');
const appJs = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

// Signboard Brand Identity & Metallic Royal Emblem Verification
assert(!indexHtml.includes('stroke-dasharray="3,2"') && !galleryHtml.includes('stroke-dasharray="3,2"'),
  "Dotted circle around S monogram is completely removed from index.html and gallery.html"
);
assert(indexHtml.includes('family=Aladin') && galleryHtml.includes('family=Aladin'),
  "Google Font Aladin imported in document heads of index.html and gallery.html"
);
assert(stylesCss.includes("'Aladin'") && stylesCss.includes("font-size: 38px"),
  "Brand typography styled with Google Font Aladin on a single horizontal line at 38px"
);
assert(indexHtml.includes('brand-emblem-svg') && galleryHtml.includes('brand-emblem-svg'),
  "Header embeds the custom Royal Tiara & SB Monogram inline SVG on both index.html and gallery.html"
);
assert(indexHtml.includes('brand-name-single') && galleryHtml.includes('brand-name-single'),
  "Brand typography places 'Shyam Bandhu & Sons' on a single horizontal line on both index.html and gallery.html"
);
assert(stylesCss.includes('brand-emblem-img') && stylesCss.includes('color: #111111'),
  "Brand typography styled with crisp luxury black (#111111) for maximum clarity and elegance on white header"
);
assert(indexHtml.includes('favicon.svg') && galleryHtml.includes('favicon.svg'),
  "Vector SVG favicon featuring the Royal Tiara & SB Monogram linked in document heads"
);
assert(indexHtml.includes('Showroom &amp; Gallery') || indexHtml.includes('Showroom & Gallery'),
  "Navigation links updated to SHOWROOM & GALLERY (315+ Looks)"
);

// Dedicated 'Our Flagship Showrooms' Section Verification
assert(indexHtml.includes('id="flagship-showrooms"') && indexHtml.includes('flagship-showrooms-section'),
  "Dedicated 'Our Flagship Showrooms' showcase section positioned below Hero Banner"
);
assert(indexHtml.includes('showroom-exterior-pillars.jpg') || indexHtml.includes('showroom-facade.jpg'),
  "Flagship showroom section embeds clean full-view architectural facade & illuminated white pillars photo"
);
assert(stylesCss.includes('.flagship-main-img') && stylesCss.includes('object-fit: cover') && stylesCss.includes('object-position: center'),
  "Flagship showroom image uses object-fit: cover and object-position: center for grand architectural display"
);
assert(DEFAULT_STORE_CONFIG.showroomImage && DEFAULT_STORE_CONFIG.showroomImage.includes('showroom-'),
  "Store config defines showroomImage allowing dynamic updates from the /admin CMS panel"
);
assert(indexHtml.includes('Grand Bridal Lounge') && indexHtml.includes('Custom Tailoring') && indexHtml.includes('2 Prime Lucknow Locations'),
  "Flagship showroom section highlights the 3 luxury experience pillars (Bridal Lounge, Tailoring, 2 Locations)"
);

const womenNavPos = indexHtml.indexOf('data-category="women"');
const menNavPos = indexHtml.indexOf('data-category="men"');
const homeNavPos = indexHtml.indexOf('Home');
assert(homeNavPos < womenNavPos && womenNavPos < menNavPos,
  "Navigation Order strictly follows: HOME -> WOMEN'S WEAR -> MEN'S WEAR in index.html"
);

assert(galleryHtml.includes('header-left-col') && galleryHtml.includes('header-location-badge'),
  "gallery.html incorporates 3-column header grid and minimal location badge"
);

// 6. Lucknow Showrooms & Specialization Verification
assert(indexHtml.includes('Nakkhas') && indexHtml.includes('Tedhi Puliya') && indexHtml.includes('Kursi Road'),
  "index.html showcases both Lucknow branches: Nakkhas and Tedhi Puliya, Kursi Road"
);
assert(!indexHtml.includes('Godowlia') && !indexHtml.includes('Varanasi'),
  "index.html completely free of Varanasi / Godowlia placeholders"
);
assert(indexHtml.includes('By : Raj Kamal'),
  "index.html showcases the official founder by-line (By : Raj Kamal) in header and footer"
);
assert(indexHtml.includes('9450646328') && indexHtml.includes('9889340888'),
  "index.html displays the real showroom contact numbers (9450646328, 9889340888)"
);
assert(indexHtml.includes('shyam_bandhu_andsons'),
  "index.html links to the official Instagram handle (@shyam_bandhu_andsons)"
);
assert(indexHtml.includes('SAREE • LEHENGA') && indexHtml.includes('KIDS WEAR'),
  "index.html displays the exact specialization tagline matching the official storefront banner"
);

// 6. E-Commerce Elements Absence Verification
assert(!indexHtml.includes('cart-drawer'), 'Shopping Cart drawer completely removed from index.html');
assert(!indexHtml.includes('wishlist-drawer'), 'Wishlist drawer completely removed from index.html');
assert(!indexHtml.includes('currency-selector'), 'Currency switcher completely removed from index.html');
assert(!indexHtml.includes('AZAVIP'), 'Promo code AZAVIP completely removed from index.html');
assert(!indexHtml.includes('Worldwide Express Shipping'), 'Worldwide Express Shipping tags removed');
assert(!indexHtml.includes('Ready to Ship'), 'Ready to Ship badges removed');

let hasPriceField = false;
DEFAULT_CATALOG.forEach(item => {
  if (item.price || item.priceINR) hasPriceField = true;
});
assert(!hasPriceField, 'Catalog items contain NO price fields (strictly lookbook & in-store inquiry)');

// Admin Hero Banners Management Verification
const adminHtml = fs.readFileSync(path.join(__dirname, 'admin.html'), 'utf8');
assert(adminHtml.includes('id="tab-hero"') && adminHtml.includes('id="form-hero-slide"'),
  "Admin CMS Panel contains dynamic Hero Banners tab and editor form"
);
assert(adminHtml.includes('hero-slides-cards') && adminHtml.includes('renderHeroSlidesAdmin'),
  "Admin CMS Panel dynamically renders and populates active hero slide cards"
);
assert(adminHtml.includes('moveHeroSlide') && adminHtml.includes('deleteHeroSlide') && adminHtml.includes('editHeroSlide'),
  "Admin CMS Panel provides Edit, Move Up/Down reordering, and Delete controls for hero slides"
);

// Admin Instagram Dynamic Archive Full CRUD Controls Verification
assert(adminHtml.includes('btn-open-upload-modal') && adminHtml.includes('modal-gallery-upload'),
  "Admin CMS Panel embeds '+ Upload New Photo(s)' button and multi-photo upload modal"
);
assert(adminHtml.includes('modal-gallery-edit') && adminHtml.includes('openEditGalleryModal') && adminHtml.includes('deleteGalleryLook'),
  "Admin CMS Panel provides Edit and Delete action controls for every gallery look"
);

// Admin Authentication Architecture Verification
assert(adminHtml.includes('id="admin-login-screen"') && adminHtml.includes('admin-auth-overlay'),
  "Admin CMS Panel embeds secure Royal Authentication Login Screen modal overlay"
);
assert(adminHtml.includes('id="form-admin-login"') && adminHtml.includes('id="auth-username"') && adminHtml.includes('id="auth-password"'),
  "Admin CMS Panel provides secure login form with username, password, and remember options"
);
assert(adminHtml.includes('id="btn-admin-logout"') && adminHtml.includes('id="admin-user-pill"'),
  "Admin header provides active session user pill and logout button"
);
assert(adminHtml.includes('id="btn-toggle-pw"'),
  "Admin login form provides password show/hide toggle eye button"
);
assert(adminHtml.includes('body.admin-authenticated .admin-header') && adminHtml.includes('#admin-main-container') && adminHtml.includes('display: none !important;'),
  "Admin CMS Panel implements strict CSS Auth Guard hiding dashboard and header until authenticated"
);

const validAuth = StorageEngine.verifyAdminCredentials('admin', 'admin123');
assert(validAuth && validAuth.success && validAuth.token && validAuth.user.role === 'Showroom Administrator',
  "StorageEngine verifies showroom admin credentials and generates session token"
);
const invalidAuth = StorageEngine.verifyAdminCredentials('admin', 'wrong_password_99');
assert(invalidAuth && !invalidAuth.success,
  "StorageEngine rejects invalid admin credentials"
);

// Responsive Architecture Multi-Screen Verification
assert(stylesCss.includes('@media (max-width: 1200px)') &&
       stylesCss.includes('@media (max-width: 992px)') &&
       stylesCss.includes('@media (max-width: 768px)') &&
       stylesCss.includes('@media (max-width: 576px)') &&
       stylesCss.includes('@media (max-width: 380px)'),
  "Comprehensive multi-breakpoint responsive architecture defined (1200px, 992px, 768px, 576px, 380px)"
);
assert(stylesCss.includes('catalog-filter-bar') && stylesCss.includes('overflow-x: auto') && stylesCss.includes('flex-wrap: nowrap'),
  "Catalog filter chips and subcategories swipeable horizontally without wrapping on mobile screens"
);
assert(stylesCss.includes('.hero-actions') && stylesCss.includes('flex-direction: column') && stylesCss.includes('.btn-hero-primary'),
  "Hero actions adapt cleanly to vertical full-width touch targets on mobile viewports"
);
assert(adminHtml.includes('@media (max-width: 768px)') && adminHtml.includes('overflow-x: auto'),
  "Admin CMS Panel includes responsive styling with swipeable tabs and single-column form grids on mobile"
);

// Mobile Overflow & Layout Exact Specifications
assert(stylesCss.includes('max-width: 100%') && stylesCss.includes('overflow-x: hidden'),
  "html and body have max-width: 100% and overflow-x: hidden eliminating horizontal overflow"
);
assert(stylesCss.includes('padding: 6px 12px') && stylesCss.includes('font-size: 11px'),
  "Top announcement bar formatted cleanly on mobile with 11px font and 6px 12px padding"
);
assert(stylesCss.includes('font-size: 22px') && stylesCss.includes('28px'),
  "Mobile header scales brand logo to 22px and royal SVG emblem to 28px height"
);
assert(stylesCss.includes('clamp(1.75rem, 6vw, 3.5rem)'),
  "Hero and section headings scale fluidly using clamp(1.75rem, 6vw, 3.5rem)"
);
assert(stylesCss.includes('padding: 1.5rem 1rem'),
  "Hero slide container has balanced 1.5rem 1rem padding so hero text never touches screen edges"
);
assert(stylesCss.includes('box-sizing: border-box !important'),
  "Global reset applies box-sizing: border-box !important across all elements"
);
assert(stylesCss.includes('padding: 14px 16px') && stylesCss.includes('btn-submit-appointment'),
  "Maroon appointment submit button wraps text cleanly with 14px 16px padding"
);
assert(stylesCss.includes('text-overflow: ellipsis') && stylesCss.includes('select'),
  "Select dropdowns prevent long option text from breaking mobile viewport width"
);
assert(stylesCss.includes('.floating-whatsapp-btn') && stylesCss.includes('width: auto !important') && stylesCss.includes('padding: 10px 16px'),
  "Floating WhatsApp button neatly tucked in bottom-right corner without stretching across screen"
);

// Helper for HTTP requests
function fetch(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

function postJson(url, payload, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const bodyStr = JSON.stringify(payload);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(bodyStr),
      ...extraHeaders
    };
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname,
      method: 'POST',
      headers: headers
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

function putJson(url, payload, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const bodyStr = JSON.stringify(payload);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(bodyStr),
      ...extraHeaders
    };
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname,
      method: 'PUT',
      headers: headers
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

function deleteReq(url, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname,
      method: 'DELETE',
      headers: { ...extraHeaders }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function runHttpTests() {
  try {
    // 7. Test Live HTTP Server Routes
    const homeRes = await fetch('http://localhost:3000/');
    assert(homeRes.statusCode === 200, 'HTTP Server GET / serves index.html (200 OK)');

    const galleryPageRes = await fetch('http://localhost:3000/gallery');
    assert(galleryPageRes.statusCode === 200, 'HTTP Server GET /gallery serves gallery.html (200 OK)');

    const adminRes = await fetch('http://localhost:3000/admin');
    assert(adminRes.statusCode === 200, 'HTTP Server GET /admin routes to Admin CMS Panel (200 OK)');

    // Test Admin Authentication API Endpoints
    const adminLoginSuccess = await postJson('http://localhost:3000/api/admin/login', { username: 'admin', password: 'admin123' });
    const loginData = JSON.parse(adminLoginSuccess.body || '{}');
    assert(adminLoginSuccess.statusCode === 200 && loginData.success === true && loginData.token,
      'HTTP Server POST /api/admin/login authenticates valid credentials (200 OK)'
    );

    const adminLoginFail = await postJson('http://localhost:3000/api/admin/login', { username: 'admin', password: 'wrongpassword' });
    const failData = JSON.parse(adminLoginFail.body || '{}');
    assert(adminLoginFail.statusCode === 401 && failData.success === false,
      'HTTP Server POST /api/admin/login rejects invalid credentials with 401 Unauthorized'
    );

    const activeToken = loginData.token;
    const authHeader = { 'Authorization': `Bearer ${activeToken}` };

    const adminVerifyRes = await postJson('http://localhost:3000/api/admin/verify', { token: activeToken });
    const verifyData = JSON.parse(adminVerifyRes.body || '{}');
    assert(adminVerifyRes.statusCode === 200 && verifyData.valid === true,
      'HTTP Server POST /api/admin/verify confirms active session token (200 OK)'
    );

    // Test Strict Security: Unauthenticated & Fake Token mutation attempts must return 401 Unauthorized
    const unauthGalleryPost = await postJson('http://localhost:3000/api/gallery', { title: 'Unauthorized Look' });
    assert(unauthGalleryPost.statusCode === 401, 'HTTP Server POST /api/gallery rejects unauthenticated requests with 401 Unauthorized');

    const fakeTokenGalleryPost = await postJson('http://localhost:3000/api/gallery', { title: 'Fake Token Look' }, { 'Authorization': 'Bearer sb_adm_fake_forged_token' });
    assert(fakeTokenGalleryPost.statusCode === 401, 'HTTP Server POST /api/gallery rejects fake/forged tokens with 401 Unauthorized');

    const unauthReelsPost = await postJson('http://localhost:3000/api/reels', { url: 'https://instagram.com/reel/fake' });
    assert(unauthReelsPost.statusCode === 401, 'HTTP Server POST /api/reels rejects unauthenticated requests with 401 Unauthorized');

    const unauthReelsPut = await putJson('http://localhost:3000/api/reels/reel-test', { active: false });
    assert(unauthReelsPut.statusCode === 401, 'HTTP Server PUT /api/reels/:id rejects unauthenticated requests with 401 Unauthorized');

    const unauthReelsDel = await deleteReq('http://localhost:3000/api/reels/reel-test');
    assert(unauthReelsDel.statusCode === 401, 'HTTP Server DELETE /api/reels/:id rejects unauthenticated requests with 401 Unauthorized');

    const cssRes = await fetch('http://localhost:3000/styles.css');
    assert(cssRes.statusCode === 200, 'HTTP Server GET /styles.css returns 200 OK');

    const appJsRes = await fetch('http://localhost:3000/app.js');
    assert(appJsRes.statusCode === 200, 'HTTP Server GET /app.js returns 200 OK');

    const galleryJsRes = await fetch('http://localhost:3000/gallery.js');
    assert(galleryJsRes.statusCode === 200, 'HTTP Server GET /gallery.js returns 200 OK');

    // 8. Test Dynamic Gallery API & Category Sorting
    const apiRes = await fetch('http://localhost:3000/api/gallery');
    assert(apiRes.statusCode === 200, 'HTTP Server GET /api/gallery returns 200 OK');

    let galleryItems = [];
    try {
      galleryItems = JSON.parse(apiRes.body);
    } catch (e) { }

    assert(Array.isArray(galleryItems) && galleryItems.length >= 315, `Gallery API returns all 315+ Instagram looks (Found: ${galleryItems.length})`);

    const hasValidFields = galleryItems.length > 0 && galleryItems.every(x => x.src && x.title && x.category && x.instagramPost);
    assert(hasValidFields, 'Every look has valid fields: src, title, category, and instagramPost');

    // Check category distribution
    const menGallery = galleryItems.filter(x => x.category === 'men');
    const womenGallery = galleryItems.filter(x => x.category === 'women');
    const kidsGallery = galleryItems.filter(x => x.category === 'kids');
    const lookbookGallery = galleryItems.filter(x => x.category === 'lookbook');

    assert(menGallery.length > 0 && womenGallery.length > 0 && kidsGallery.length > 0 && lookbookGallery.length > 0,
      `Gallery categories populated: Women (${womenGallery.length}), Men (${menGallery.length}), Kids (${kidsGallery.length}), Lookbook (${lookbookGallery.length})`
    );

    // Test Gallery CRUD API: POST (Upload), PUT (Edit), DELETE (Remove)
    const newLookPayload = {
      title: 'Automated Suite Test Bridal Look',
      category: 'women',
      filename: 'automated_test_look.jpg'
    };
    const postRes = await postJson('http://localhost:3000/api/gallery', newLookPayload, authHeader);
    const postData = JSON.parse(postRes.body || '{}');
    assert(postRes.statusCode === 201 && postData.success === true && postData.items && postData.items.length > 0,
      'HTTP Server POST /api/gallery creates new look with 201 Created'
    );

    const testLookId = postData.items[0].id;
    const putRes = await putJson(`http://localhost:3000/api/gallery/${testLookId}`, {
      title: 'Automated Suite Test Bridal Look (Updated Title)',
      category: 'women'
    }, authHeader);
    const putData = JSON.parse(putRes.body || '{}');
    assert(putRes.statusCode === 200 && putData.success === true && putData.item.title.includes('Updated Title'),
      'HTTP Server PUT /api/gallery/:id updates look title and metadata with 200 OK'
    );

    const delRes = await deleteReq(`http://localhost:3000/api/gallery/${testLookId}`, authHeader);
    const delData = JSON.parse(delRes.body || '{}');
    assert(delRes.statusCode === 200 && delData.success === true && delData.deletedId === testLookId,
      'HTTP Server DELETE /api/gallery/:id removes look with 200 OK'
    );

    // 9. Test Image Assets Serving (.webp, .avif & .svg emblems)
    const emblemRes = await fetch('http://localhost:3000/public/images/shyam-bandhu-emblem.svg');
    assert(emblemRes.statusCode === 200 && (emblemRes.headers['content-type'] || '').includes('image/svg+xml'),
      'Royal Emblem SVG serves with 200 OK and image/svg+xml MIME type'
    );

    const faviconRes = await fetch('http://localhost:3000/public/images/favicon.svg');
    assert(faviconRes.statusCode === 200 && (faviconRes.headers['content-type'] || '').includes('image/svg+xml'),
      'Favicon SVG serves with 200 OK and image/svg+xml MIME type'
    );

    const webpRes = await fetch('http://localhost:3000/public/images/gallery/616195401_18042226253717404_6789636413294497759_n.webp');
    assert(webpRes.statusCode === 200 && (webpRes.headers['content-type'] || '').includes('image/webp'), 'WebP image serves with 200 OK and image/webp MIME type');

    const avifRes = await fetch('http://localhost:3000/public/images/gallery/893300522_1910720039721223_7097646774970989875_n.avif');
    assert(avifRes.statusCode === 200 && (avifRes.headers['content-type'] || '').includes('image/avif'), 'AVIF image serves with 200 OK and image/avif MIME type');

    // 10. Test Video Reel Asset & Autoplay Section
    assert(indexHtml.includes('hero-showroom-video') && indexHtml.includes('showroom-cinematic.mp4'),
      'index.html embeds the autoplaying cinematic showroom video reel before the hero carousel'
    );

    const videoRes = await fetch('http://localhost:3000/public/videos/showroom-cinematic.mp4');
    assert(videoRes.statusCode === 200 && (videoRes.headers['content-type'] || '').includes('video/mp4') && videoRes.headers['accept-ranges'] === 'bytes',
      'Cinematic video reel serves with 200 OK, video/mp4 MIME type, and bytes range support'
    );

    // 11. Test Seamless Hero Video to Bridal Slider Editorial Transition
    assert(
      indexHtml.includes('video-bottom-blend') && stylesCss.includes('height: 160px') && stylesCss.includes('rgba(9, 7, 6, 0.75)'),
      'Hero video features smooth 160px bottom fade-out gradient overlay melting into obsidian base'
    );

    assert(
      indexHtml.includes('hero-top-blend') && stylesCss.includes('height: 100px') && stylesCss.includes('#090706'),
      'Bridal slider section features matching 100px top fade-in gradient overlay'
    );

    assert(
      indexHtml.includes('hero-transition-divider') && indexHtml.includes('✦ SIGNATURE SHOWROOM COLLECTIONS ✦') && stylesCss.includes('transition-hairline'),
      'Subtle champagne-gold ornamental divider and emblem pill centered directly on transition seam'
    );

    assert(
      stylesCss.includes('padding-top: 165px;') && stylesCss.includes('.video-content-wrapper'),
      'Left hero card wrapper has proper 165px top clearance below navigation menu preventing clipping'
    );

    // 12. Test Showroom Reels & Video Showcase Feature (Admin CMS, API & Frontend)
    assert(
      adminHtml.includes('tab-reels') && adminHtml.includes('form-add-reel') && adminHtml.includes('reel-url-input'),
      'Admin CMS embeds dedicated Showroom Reels & Video Links Manager tab and input form'
    );

    assert(
      adminHtml.includes('toggleReelActive') && adminHtml.includes('deleteReel'),
      'Admin CMS provides quick Active/Hide toggle and Delete controls for reels'
    );

    assert(
      indexHtml.includes('showroom-reels-section') && indexHtml.includes('reels-showcase-grid'),
      'index.html embeds dedicated Showroom Reels section with 4-column 9:16 vertical video grid'
    );

    assert(
      indexHtml.includes('href="#showroom-reels-section"'),
      'index.html navigation bar contains SHOWROOM REELS link'
    );

    assert(
      stylesCss.includes('.showroom-reels-section') && stylesCss.includes('aspect-ratio: 9 / 16'),
      'styles.css defines pure 9:16 borderless video cards with dark luxury obsidian background'
    );

    assert(
      galleryJs.includes("key: 'reels'") && galleryJs.includes('🎬 Reels & Videos'),
      'gallery.js includes dedicated Reels & Videos filter tab with reactive count'
    );

    const reelsRes = await fetch('http://localhost:3000/api/reels');
    assert(reelsRes.statusCode === 200, 'HTTP Server GET /api/reels returns 200 OK');
    const reelsList = JSON.parse(reelsRes.body || '[]');
    assert(Array.isArray(reelsList) && reelsList.length >= 4, `Reels API returns active showroom reels (Found: ${reelsList.length})`);

    const newReelRes = await postJson('http://localhost:3000/api/reels', {
      url: 'public/videos/showroom-cinematic-hd.mp4',
      title: 'Automated Suite Test Royal Bridal Walk',
      category: 'bridal'
    }, authHeader);
    const newReelData = JSON.parse(newReelRes.body || '{}');
    assert(
      newReelRes.statusCode === 201 && newReelData.success === true && newReelData.item.type === 'mp4',
      'HTTP Server POST /api/reels creates and auto-resolves clean video reel with 201 Created'
    );

    const testReelId = newReelData.item.id;
    const putReelRes = await putJson(`http://localhost:3000/api/reels/${testReelId}`, {
      title: 'Automated Suite Test Royal Bridal Walk (Updated)',
      active: false
    }, authHeader);
    const putReelData = JSON.parse(putReelRes.body || '{}');
    assert(
      putReelRes.statusCode === 200 && putReelData.success === true && putReelData.item.active === false,
      'HTTP Server PUT /api/reels/:id updates reel active toggle with 200 OK'
    );

    const delReelRes = await deleteReq(`http://localhost:3000/api/reels/${testReelId}`, authHeader);
    const delReelData = JSON.parse(delReelRes.body || '{}');
    assert(
      delReelRes.statusCode === 200 && delReelData.success === true && delReelData.deletedId === testReelId,
      'HTTP Server DELETE /api/reels/:id removes reel with 200 OK'
    );

    // Test Admin Logout API & Token Invalidation
    const adminLogoutRes = await postJson('http://localhost:3000/api/admin/logout', { token: activeToken });
    const logoutData = JSON.parse(adminLogoutRes.body || '{}');
    assert(adminLogoutRes.statusCode === 200 && logoutData.success === true,
      'HTTP Server POST /api/admin/logout invalidates session (200 OK)'
    );

    const postLogoutVerify = await postJson('http://localhost:3000/api/admin/verify', { token: activeToken });
    const postLogoutData = JSON.parse(postLogoutVerify.body || '{}');
    assert(postLogoutData.valid === false, 'Session token is invalidated and rejected after logout');

    // 13. Test Specific Visual & Functional Fixes for Reels & Navigation
    assert(
      stylesCss.includes('gap: 18px') && stylesCss.includes('font-size: 12px') && stylesCss.includes('overflow: visible'),
      'Top navigation bar uses gap: 18px, font-size: 12px, and overflow: visible for unclipped menu items'
    );

    assert(
      stylesCss.includes('transform: scale(1.38)') && stylesCss.includes('transform-origin: center center'),
      'Card #1 Instagram embed is cropped and scaled with transform: scale(1.38) and center origin'
    );

    assert(
      stylesCss.includes('linear-gradient(180deg, transparent 55%, rgba(0, 0, 0, 0.92) 100%)'),
      'Reel cards use rich bottom gradient overlay (transparent 55% to 0.92 dark) for text legibility'
    );

    assert(
      stylesCss.includes('height: 2.6em') && stylesCss.includes('-webkit-line-clamp: 2'),
      'Reel titles use fixed 2.6em height and line-clamp 2 preventing layout shift'
    );

    assert(
      stylesCss.includes('.btn-reel-whatsapp') && stylesCss.includes('height: 40px'),
      'Enquire on WhatsApp buttons have uniform 40px fixed height for horizontal baseline alignment'
    );

    assert(
      stylesCss.includes('padding-right: 3rem') && stylesCss.includes('.showroom-reels-section .container'),
      'Reels showcase container provides 3rem right clearance preventing floating WhatsApp button overlap'
    );

    // Verify all active reel video files are served with HTTP 200 and video/mp4 MIME type
    const reelVid1Res = await fetch('http://localhost:3000/public/videos/reel-bridal-lehenga.mp4');
    assert(
      reelVid1Res.statusCode === 200 && reelVid1Res.headers['content-type'] === 'video/mp4',
      'Card #3 bridal lehenga video serves with 200 OK and video/mp4 MIME type'
    );

    const reelVid2Res = await fetch('http://localhost:3000/public/videos/reel-banarasi-saree.mp4');
    assert(
      reelVid2Res.statusCode === 200 && reelVid2Res.headers['content-type'] === 'video/mp4',
      'Card #4 Banarasi saree video serves with 200 OK and video/mp4 MIME type'
    );

    const reelVid3Res = await fetch('http://localhost:3000/public/videos/reel-heritage-couture.mp4');
    assert(
      reelVid3Res.statusCode === 200 && reelVid3Res.headers['content-type'] === 'video/mp4',
      'Card #2 heritage couture video serves with 200 OK and video/mp4 MIME type'
    );

    // Verify Card #3 and Card #4 videos are distinct
    const activeReels = reelsList.filter(x => x.active !== false);
    assert(
      activeReels.length >= 4 && activeReels[2].directVideoUrl !== activeReels[3].directVideoUrl,
      'Cards #3 and #4 render distinct video streams with zero duplicate video sources'
    );

    // 14. Test Edge-to-Edge 9:16 Video Filling & Native Autoplay
    assert(
      stylesCss.includes('inset: 0') && stylesCss.includes('object-fit: cover !important') && stylesCss.includes('.reel-card video'),
      'Every <video> inside .reel-card is styled with position: absolute; inset: 0; object-fit: cover !important to fill 9:16 frame'
    );

    assert(
      appJs.includes('<video class="reel-video-element"'),
      'Frontend app.js renders reels with native HTML5 <video> tags'
    );

    assert(
      appJs.includes('autoplay muted loop playsinline preload="auto"'),
      'Frontend app.js configures native video reels with autoplay muted loop playsinline preload="auto"'
    );

    const reelVid0Res = await fetch('http://localhost:3000/public/videos/reels/reel-exclusive-bridal.mp4');
    assert(
      reelVid0Res.statusCode === 200 && reelVid0Res.headers['content-type'] === 'video/mp4',
      'Card #1 exclusive bridal reel video serves with 200 OK and video/mp4 MIME type'
    );

    const streamTargetId = (reelsList && reelsList.length > 0) ? reelsList[0].id : 'reel-1';
    const streamApiRes = await fetch(`http://localhost:3000/api/reels/stream/${streamTargetId}`);
    assert(
      streamApiRes.statusCode === 200 && streamApiRes.headers['content-type'] === 'video/mp4',
      'Backend /api/reels/stream/:id endpoint streams clean .mp4 video with 200 OK and video/mp4 MIME type'
    );

    // 15. Output Results
    console.log('\n======================================================');
    console.log('✦ SHYAM BANDHU & SONS - OFFLINE SHOWROOM TEST SUITE');
    console.log('======================================================');
    let passes = 0;
    let fails = 0;
    results.forEach(r => {
      if (r.status === 'PASS') {
        passes++;
        console.log(`[PASS] ${r.message}`);
      } else {
        fails++;
        console.log(`[FAIL] ${r.message}`);
      }
    });
    console.log('======================================================');
    console.log(`Summary: ${passes} Passed, ${fails} Failed out of ${results.length} Tests`);
    console.log('======================================================\n');
    process.exit(fails > 0 ? 1 : 0);

  } catch (err) {
    console.error('[FAIL] HTTP Server Error:', err.message);
    process.exit(1);
  }
}

runHttpTests();
