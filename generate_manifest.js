/**
 * Generate gallery_manifest.json from public/images/gallery
 */
const fs = require('fs');
const path = require('path');

const galleryDir = path.join(__dirname, 'public', 'images', 'gallery');
const manifestFile = path.join(__dirname, 'gallery_manifest.json');

const files = fs.readdirSync(galleryDir).filter(f => {
  const ext = path.extname(f).toLowerCase();
  return ['.jpg', '.jpeg', '.png', '.webp', '.avif'].includes(ext);
});

// Categories requested:
// All | Men's Wear | Women's Wear | Kids Wear | Store & Festive Lookbook
const categories = ['men', 'women', 'kids', 'lookbook'];

const categoryTitles = {
  men: [
    "Imperial Zari Sherwani Lookbook",
    "Royal Velvet Bandhgala Atelier",
    "Groom's Handcrafted Silk Kurta Set",
    "Classic Reception Tuxedo & Stole",
    "Pistachio Silk Bundi & Kurta",
    "Heritage Kashi Angrakha Silhouette",
    "Artisanal Raw Silk Jodhpur Suit",
    "Traditional Wedding Safa & Brocade"
  ],
  women: [
    "Royal Crimson Bullion Bridal Lehenga",
    "Kadwa Banarasi Katan Silk Saree",
    "Pastel Blush Organza Pre-Draped Saree",
    "Champagne Mirrorwork Floor-Length Anarkali",
    "Luminescent Crystal Sangeet Gown",
    "Mehendi Turmeric Dori Flared Set",
    "Heritage Temple Border Handloom Drape",
    "Sculptural Metallic Evening Cape"
  ],
  kids: [
    "Little Prince Miniature Velvet Sherwani",
    "Gulabi Gota Patti Twirl Lehenga",
    "Nawab Mustard Dhoti Kurta Ensemble",
    "Princess Shimmer Ruffle Party Ballgown",
    "Chanderi Brocade Festive Kurta Set",
    "Floral Embroidered Girl's Jacket Lehenga"
  ],
  lookbook: [
    "Nakkhas Flagship Showroom Interior",
    "VIP Private Bridal Trial Lounge",
    "Real Client Diary: Sangeet Celebrations",
    "Artisanal Karigari & Loom Weaving Session",
    "Festive Window Display & Lookbook Showcase",
    "Celebrity & Patron Styling Diary"
  ]
};

const items = files.map((file, idx) => {
  // Deterministic and balanced category assignment based on index
  const catIndex = idx % categories.length;
  const cat = categories[catIndex];
  const titles = categoryTitles[cat];
  const title = titles[idx % titles.length] + ` • Look #${idx + 1}`;

  return {
    id: `insta-${idx + 1}`,
    filename: file,
    src: `public/images/gallery/${file}`,
    category: cat,
    title: title,
    date: '2026 Season Lookbook',
    instagramPost: `@ShyamBandhuAndSons • Look #${idx + 1}`,
    aspect: (idx % 5 === 0) ? 'tall' : (idx % 7 === 0) ? 'wide' : 'portrait'
  };
});

fs.writeFileSync(manifestFile, JSON.stringify(items, null, 2), 'utf8');
console.log(`Generated gallery_manifest.json with ${items.length} Instagram images.`);

