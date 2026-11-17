/**
 * Shyam Bandhu & Sons - Complete Family Fashion Showroom
 * Offline Showroom & Digital Lookbook Data & Storage Engine
 */

const DEFAULT_STORE_CONFIG = {
  name: "SHYAM BANDHU & SONS",
  byline: "By : Raj Kamal",
  tagline: "Deals Exclusively In: Saree • Lehenga • Indo-Western • Dresses • Frock • Suits • Gown • Kids Wear",
  announcement: "Deals in: Saree, Lehenga, Indo-Western, Dresses, Frock, Suits, Gown & Kids Wear • Nakkhas & Tedhi Puliya, Lucknow • Call: 9450646328, 9889340888",
  phone: "+91 9450646328",
  altPhone: "+91 9889340888",
  phoneDisplay: "9450646328, 9889340888",
  whatsapp: "919450646328",
  whatsapp2: "919889340888",
  email: "contact@shyambandhuandsons.com",
  instagram: "https://instagram.com/shyam_bandhu_andsons",
  instagramHandle: "@shyam_bandhu_andsons",
  facebook: "https://facebook.com/shyam_bandhu_andsons",
  timings: "10:30 AM – 9:00 PM (Open All 7 Days)",
  address: "Shop no. 73, 74 new market Nakkhas, Lucknow | M.M.S - 2/15-16 Sector - C, Tedhi Puliya, Kursi Road, Lucknow - 226022",
  branch1: {
    name: "Nakkhas Flagship Showroom",
    address: "Shop no. 73, 74 new market Nakkhas, Lucknow",
    landmark: "New Market, Nakkhas, Lucknow",
    phone: "+91 94506 46328",
    mapsUrl: "https://maps.google.com/?q=Nakkhas+New+Market+Lucknow"
  },
  branch2: {
    name: "Tedhi Puliya / Kursi Road Branch",
    address: "M.M.S - 2/15-16 Sector - C, Tedhi Puliya, Kursi Road, Lucknow - 226022",
    landmark: "Sector - C, Tedhi Puliya, Kursi Road, Lucknow",
    phone: "+91 98893 40888",
    mapsUrl: "https://maps.google.com/?q=MMS+2+15+16+Sector+C+Tedhi+Puliya+Kursi+Road+Lucknow"
  },
  city: "Lucknow (Lko)",
  specialization: "Saree, Lehenga, Indo-Western, Dresses, Frock, Suits, Gown, Kids Wear etc",
  showroomImage: "public/images/showroom-exterior-pillars.jpg",
  googleMapsUrl: "https://maps.google.com/?q=Nakkhas+Lucknow"
};

const DEFAULT_HERO_SLIDES = [
  {
    id: "hero-1",
    subtitle: "Women's Bridal, Festive & Heritage Fashion",
    title: "Women's Bridal Lehengas, Designer Sarees & Ethnic Gowns",
    description: "Welcome to Shyam Bandhu & Sons (By : Raj Kamal), Lucknow. Deals exclusively in breathtaking Bridal Lehengas, pure Silk Sarees, Cocktail Gowns, Designer Suits, and adorable Kids' Festive Wear.",
    image: "public/images/bridal-girl-hero.jpg",
    tag: "Women's Bridal & Ethnic Wear"
  },
  {
    id: "hero-2",
    subtitle: "Men's Royal Imperial Atelier",
    title: "Men's Royal Sherwanis, Designer Suits & Indo-Western",
    description: "Handcrafted groom sherwanis, imperial achkans, designer suits, and festive silk bandhgalas tailored to perfection by our in-house master karigars in Lucknow.",
    image: "public/images/gallery/501938891_1211598403424681_804587882121033921_n.jpg",
    tag: "Men's Royal Atelier"
  },
  {
    id: "hero-3",
    subtitle: "Little Royalty: Kids' Celebrations",
    title: "Kids' Festive Wear, Party Gowns & Ethnic Sets",
    description: "Adorable miniature sherwanis, festive kurta-dhotis for boys, alongside twirl-worthy lehengas, party frocks, and ballgowns for girls in delicate, skin-friendly fabrics.",
    image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=1920&q=85",
    tag: "Kids' Special Lookbook"
  }
];

const DEFAULT_CATALOG = [
  // ================= WOMEN'S WEAR (TOP PRIORITY) =================
  {
    id: "w-01",
    name: "Gulmohar Crimson Zardozi Bridal Lehenga",
    category: "women",
    subCategory: "Bridal Lehengas",
    fabric: "Pure Velvet & Katan Silk with Bullion Zardozi",
    sizes: ["Custom In-Store Fit", "S", "M", "L", "XL"],
    status: "Showroom Masterpiece",
    description: "A heritage red velvet bridal lehenga set adorned with 200 hours of authentic bullion embroidery, Swarovski stones, accompanied by twin hand-embroidered tissue dupattas.",
    sku: "SBS-WOM-LH-101",
    images: [
      "public/images/bridal-girl-hero.jpg",
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80"
    ]
  },
  {
    id: "w-02",
    name: "Shyam Heirlooms Kadwa Banarasi Katan Silk Saree",
    category: "women",
    subCategory: "Designer Sarees",
    fabric: "100% Pure Mulberry Katan Silk with Certified Gold Zari",
    sizes: ["Free Size (Includes Unstitched Blouse Piece)"],
    status: "Silk Mark Certified",
    description: "Woven on traditional wooden pit-looms in Old Kashi. Each floral 'buta' is individually hand-engraved with Kadwa technique, creating an eternal heirloom saree.",
    sku: "SBS-WOM-SR-205",
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80"
    ]
  },
  {
    id: "w-03",
    name: "Noor Champagne Sequin Floor-Length Anarkali",
    category: "women",
    subCategory: "Suits & Anarkalis",
    fabric: "Georgette with Mirror & Cut-dana Work",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    status: "Available in Showroom",
    description: "Flared 32-kali champagne anarkali featuring intricate neckline embroidery, scalloped border dupatta, and churidar. An ethereal choice for Sangeet & Reception nights.",
    sku: "SBS-WOM-AK-311",
    images: [
      "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=1000&q=80"
    ]
  },
  {
    id: "w-04",
    name: "Aura Metallic Pre-Draped Cocktail Saree Gown",
    category: "women",
    subCategory: "Western & Indo-Western",
    fabric: "Metallic Pleated Organza & Satin",
    sizes: ["S", "M", "L", "Custom Sizing"],
    status: "Trending Lookbook",
    description: "Contemporary pre-draped silhouette with structured corset blouse and fluid metallic drape that flows seamlessly into an evening train.",
    sku: "SBS-WOM-IW-415",
    images: [
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=1000&q=80"
    ]
  },

  // ================= MEN'S WEAR =================
  {
    id: "m-01",
    name: "Royal Ivory Kadwa Brocade Groom Sherwani",
    category: "men",
    subCategory: "Sherwanis",
    fabric: "Pure Matka Katan Silk with Real Zari Weave",
    sizes: ["38 (S)", "40 (M)", "42 (L)", "44 (XL)", "Custom In-Store Fit"],
    status: "Available in Showroom",
    description: "An aristocratic groom sherwani crafted in rich ivory matka silk, adorned with intricate gold bullion work, handcrafted brass jeweled buttons, paired with chanderi stole and churidar.",
    sku: "SBS-MEN-SH-101",
    images: [
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1000&q=80"
    ]
  },
  {
    id: "m-02",
    name: "Imperial Midnight Velvet Tuxedo Suit",
    category: "men",
    subCategory: "Suits & Tuxedos",
    fabric: "Italian Velvet & Fine Wool Blend",
    sizes: ["38", "40", "42", "44", "Bespoke Fitting"],
    status: "Available in Showroom",
    description: "Modern evening luxury tailored tuxedo featuring satin shawl lapels, tailored trousers, and matching waistcoat. Perfect for grand wedding receptions and sangeet cocktails.",
    sku: "SBS-MEN-TX-204",
    images: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80"
    ]
  },
  {
    id: "m-03",
    name: "Pistachio Silk Bundi & Kurta Pajama Set",
    category: "men",
    subCategory: "Kurta Sets",
    fabric: "Raw Silk Bundi with Fine Cotton-Silk Kurta",
    sizes: ["S", "M", "L", "XL", "XXL"],
    status: "Available in Showroom",
    description: "Graceful pastel pistachio raw silk Nehru jacket accented with tonal thread embroidery, worn over an organic cotton-silk kurta and tapered churidar.",
    sku: "SBS-MEN-KS-308",
    images: [
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80"
    ]
  },
  {
    id: "m-04",
    name: "Heritage Angrakha Kurta with Cowl Dhoti",
    category: "men",
    subCategory: "Casuals & Indo-Western",
    fabric: "Handspun Chanderi with Dori Detailing",
    sizes: ["38", "40", "42", "44"],
    status: "Fresh Collection",
    description: "Classic asymmetrical Angrakha cut with tie-up tassel dori, paired with pre-pleated cowl dhoti trousers for haldi, mehendi, and pooja celebrations.",
    sku: "SBS-MEN-IW-412",
    images: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1000&q=80"
    ]
  },

  // ================= KIDS' WEAR =================
  {
    id: "k-01",
    name: "Prince Royal Navy Velvet Sherwani Set",
    category: "kids",
    subCategory: "Boys' Festive Wear",
    fabric: "Soft Micro-Velvet with Cotton Inner Lining",
    sizes: ["2-3 Yrs", "4-5 Yrs", "6-7 Yrs", "8-9 Yrs", "10-12 Yrs"],
    status: "Available in Showroom",
    description: "Miniature royal navy sherwani with antique gold zari embroidery, mandarin collar, soft breathable cotton lining for delicate skin, paired with cream churidar.",
    sku: "SBS-KID-BY-102",
    images: [
      "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80"
    ]
  },
  {
    id: "k-02",
    name: "Gulabi Gota Patti Twirl Lehenga Set",
    category: "kids",
    subCategory: "Girls' Ethnic Lehengas",
    fabric: "Chanderi Silk with Soft Shantoon Lining",
    sizes: ["2-3 Yrs", "4-5 Yrs", "6-7 Yrs", "8-10 Yrs", "11-13 Yrs"],
    status: "Available in Showroom",
    description: "Playful Rani Pink flared lehenga with lightweight gota patti ribbons, adjustable elasticated waistband, and an easy-wear embroidered choli.",
    sku: "SBS-KID-GL-208",
    images: [
      "https://images.unsplash.com/photo-1607453998774-d533f65dac99?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80"
    ]
  },
  {
    id: "k-03",
    name: "Little Nawab Marigold Dhoti Kurta Set",
    category: "kids",
    subCategory: "Boys' Festive Wear",
    fabric: "Pure Cotton Silk with Gold Tissue Border",
    sizes: ["1-2 Yrs", "3-4 Yrs", "5-6 Yrs", "7-8 Yrs"],
    status: "Festive Hit",
    description: "Comfortable festive kurta in joyful turmeric yellow, paired with an easy slip-on pre-stitched dhoti with gold border. No itchy seams.",
    sku: "SBS-KID-BY-304",
    images: [
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=1000&q=80"
    ]
  },
  {
    id: "k-04",
    name: "Princess Peach Tulle Ruffle Ballgown",
    category: "kids",
    subCategory: "Girls' Party Wear",
    fabric: "Fine Shimmer Net, Satin & Soft Cotton Lining",
    sizes: ["3-4 Yrs", "5-6 Yrs", "7-8 Yrs", "9-10 Yrs"],
    status: "Available in Showroom",
    description: "Tiered multi-layer peach ballgown with sequin bodice and detachable butterfly bow back. Ideal for birthdays, wedding receptions, and family galas.",
    sku: "SBS-KID-GL-412",
    images: [
      "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1607453998774-d533f65dac99?auto=format&fit=crop&w=1000&q=80"
    ]
  }
];

const DEFAULT_GALLERY = [
  {
    id: "gal-1",
    type: "showroom",
    title: "Grand Bridal Suite & Private Trial Lounges",
    subtitle: "Floor 2 • Exclusive Bridal Appointments",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
    likes: "2.4k"
  },
  {
    id: "gal-2",
    type: "customer",
    title: "Real Client Diary: The Mathur Family Wedding",
    subtitle: "Dressed by Shyam Bandhu & Sons",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
    likes: "3.1k"
  },
  {
    id: "gal-3",
    type: "showroom",
    title: "Men's Heritage Atelier & Fabric Display",
    subtitle: "Floor 1 • Silk & Velvet Swatches",
    image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=800&q=80",
    likes: "1.8k"
  },
  {
    id: "gal-4",
    type: "customer",
    title: "Groom in Custom Pure Katan Sherwani",
    subtitle: "Bespoke Karigari from our Atelier",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
    likes: "4.5k"
  },
  {
    id: "gal-5",
    type: "reels",
    title: "Reel: Behind The Master Weaving in Kashi",
    subtitle: "Watch Our Artisans at Work",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
    likes: "12.8k Reels Views"
  },
  {
    id: "gal-6",
    type: "reels",
    title: "Reel: Kids' Festive Twirl Collection Showcase",
    subtitle: "Fresh In-Store Arrivals",
    image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80",
    likes: "8.3k Reels Views"
  }
];

const DEFAULT_ARTICLES = [
  {
    id: "art-1",
    title: "How to Choose the Perfect Wedding Sherwani for Your Body Type",
    category: "Groom Styling Guide",
    date: "November 2026",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
    excerpt: "From color harmonization with your bride's lehenga to selecting authentic Banarasi brocade vs raw silk, master the art of looking majestic at the altar."
  },
  {
    id: "art-2",
    title: "The Ultimate Guide to Pure Kadwa Banarasi Silk: How to Spot Authentic Weaves",
    category: "Heritage & Craft",
    date: "October 2026",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
    excerpt: "Understand why genuine handwoven Kadwa sarees have zero loose floats on the reverse and why it takes 45 days of painstaking karigar devotion to finish."
  },
  {
    id: "art-3",
    title: "Kids' Festive Wear: Choosing Outfits that Balance Regal Looks with Pure Comfort",
    category: "Kids Fashion Tips",
    date: "November 2026",
    readTime: "3 min read",
    image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80",
    excerpt: "How our in-house master tailors integrate soft pure cotton linings and non-abrasive seams so your little prince and princess enjoy the celebrations in comfort."
  }
];

/**
 * Storage & CMS Helper Engine
 * Allows the store owner to add, edit, delete items via /admin.html
 * Changes persist in localStorage and take precedence over defaults.
 */
const StorageEngine = {
  getStoreConfig() {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem("sbs_store_config") : null;
    if (!saved) return DEFAULT_STORE_CONFIG;
    try {
      const cfg = JSON.parse(saved);
      if (cfg.address && (cfg.address.includes("Varanasi") || cfg.address.includes("Godowlia"))) {
        return DEFAULT_STORE_CONFIG;
      }
      if (cfg.phone && (cfg.phone.includes("98390") || !cfg.byline || (cfg.instagramHandle && cfg.instagramHandle.includes("ShyamBandhuAndSons")) || (cfg.announcement && cfg.announcement.includes("Shyam Bandhu & Sons (By : Raj Kamal)")) || (cfg.showroomImage && cfg.showroomImage.includes("showroom-banner-sign")))) {
        if (typeof localStorage !== 'undefined') localStorage.removeItem("sbs_store_config");
        return DEFAULT_STORE_CONFIG;
      }
      if (!cfg.showroomImage) {
        cfg.showroomImage = DEFAULT_STORE_CONFIG.showroomImage;
      }
      return cfg;
    } catch (e) {
      return DEFAULT_STORE_CONFIG;
    }
  },
  saveStoreConfig(cfg) {
    if (typeof localStorage !== 'undefined') localStorage.setItem("sbs_store_config", JSON.stringify(cfg));
  },

  getHeroSlides() {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem("sbs_hero_slides") : null;
    if (!saved) return DEFAULT_HERO_SLIDES;
    try {
      const slides = JSON.parse(saved);
      if (!Array.isArray(slides) || slides.length === 0) return DEFAULT_HERO_SLIDES;
      // Invalidate if old legacy placeholder data from AZA or Varanasi exists
      if (JSON.stringify(slides).includes("AZA") || JSON.stringify(slides).includes("Varanasi") || JSON.stringify(slides).includes("Godowlia")) {
        if (typeof localStorage !== 'undefined') localStorage.removeItem("sbs_hero_slides");
        return DEFAULT_HERO_SLIDES;
      }
      return slides;
    } catch (e) {
      return DEFAULT_HERO_SLIDES;
    }
  },
  saveHeroSlides(slides) {
    if (typeof localStorage !== 'undefined') localStorage.setItem("sbs_hero_slides", JSON.stringify(slides));
  },

  getCatalog() {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem("sbs_catalog") : null;
    let items;
    try {
      items = saved ? JSON.parse(saved) : DEFAULT_CATALOG;
      if (items[0] && !JSON.stringify(items[0]).includes("bridal-girl-hero")) {
        if (typeof localStorage !== 'undefined') localStorage.removeItem("sbs_catalog");
        items = DEFAULT_CATALOG;
      }
    } catch (e) {
      items = DEFAULT_CATALOG;
    }
    // Strictly prioritize Women's Wear first, then Men's Wear, then Kids' Wear
    const categoryPriority = { women: 1, men: 2, kids: 3 };
    return items.sort((a, b) => {
      const pA = categoryPriority[a.category] || 99;
      const pB = categoryPriority[b.category] || 99;
      return pA - pB;
    });
  },
  saveCatalog(items) {
    if (typeof localStorage !== 'undefined') localStorage.setItem("sbs_catalog", JSON.stringify(items));
  },

  getGallery() {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem("sbs_gallery") : null;
    return saved ? JSON.parse(saved) : DEFAULT_GALLERY;
  },
  saveGallery(items) {
    if (typeof localStorage !== 'undefined') localStorage.setItem("sbs_gallery", JSON.stringify(items));
  },

  getArticles() {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem("sbs_articles") : null;
    return saved ? JSON.parse(saved) : DEFAULT_ARTICLES;
  },
  saveArticles(items) {
    if (typeof localStorage !== 'undefined') localStorage.setItem("sbs_articles", JSON.stringify(items));
  },

  resetAllToDefault() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem("sbs_store_config");
      localStorage.removeItem("sbs_hero_slides");
      localStorage.removeItem("sbs_catalog");
      localStorage.removeItem("sbs_gallery");
      localStorage.removeItem("sbs_articles");
    }
  },

  // Admin Authentication Helpers
  isAdminLoggedIn() {
    try {
      const session = this.getAdminSession();
      if (!session || !session.token) return false;
      if (session.expiresAt && Date.now() > session.expiresAt) {
        this.clearAdminSession();
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  },

  getAdminSession() {
    try {
      if (typeof sessionStorage !== 'undefined') {
        const s = sessionStorage.getItem("sbs_admin_session");
        if (s) return JSON.parse(s);
      }
      if (typeof localStorage !== 'undefined') {
        const l = localStorage.getItem("sbs_admin_session");
        if (l) return JSON.parse(l);
      }
      return null;
    } catch (e) {
      return null;
    }
  },

  setAdminSession(sessionData, remember = false) {
    try {
      const dataStr = JSON.stringify(sessionData);
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem("sbs_admin_session", dataStr);
      }
      if (remember && typeof localStorage !== 'undefined') {
        localStorage.setItem("sbs_admin_session", dataStr);
      }
    } catch (e) {}
  },

  clearAdminSession() {
    try {
      if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem("sbs_admin_session");
      if (typeof localStorage !== 'undefined') localStorage.removeItem("sbs_admin_session");
    } catch (e) {}
  },

  // Internal cryptographic hash helper (no plaintext credentials exposed in client scripts)
  _authHash(str) {
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
  },

  verifyAdminCredentials(username, password) {
    const u = (username || '').trim().toLowerCase();
    const p = (password || '').trim();
    const digest = this._authHash(`sbs_salt:${u}:${p}`);
    const validHashes = {
      '15c5373d44b299': { username: 'admin', name: 'Raj Kamal Atelier Admin', role: 'Showroom Administrator' },
      '1e104f1760aaf2': { username: 'rajkamal', name: 'Raj Kamal (Founder)', role: 'Showroom Administrator' },
      'c69b4a97f708d': { username: 'shyambandhu', name: 'Showroom Manager', role: 'Showroom Administrator' }
    };

    if (validHashes[digest]) {
      const matched = validHashes[digest];
      return {
        success: true,
        token: 'sb_adm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
        user: {
          username: matched.username,
          name: matched.name,
          role: matched.role
        },
        expiresAt: Date.now() + (24 * 60 * 60 * 1000)
      };
    }
    return { success: false, message: 'Invalid username or password.' };
  }
};
