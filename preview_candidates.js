const fs = require('fs');
const manifest = JSON.parse(fs.readFileSync('gallery_manifest.json', 'utf8'));

// Filter top files across women, lookbook, and men
const candidates = manifest
  .filter(m => m.src.endsWith('.jpg') || m.src.endsWith('.png') || m.src.endsWith('.webp'))
  .map(m => {
    try {
      return { ...m, size: fs.statSync(m.src).size };
    } catch(e) {
      return { ...m, size: 0 };
    }
  })
  .sort((a,b) => b.size - a.size)
  .slice(0, 20);

let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Gallery Candidate Preview</title>
  <style>
    body { background: #121212; color: #FFF; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 20px; }
    h1 { color: #D4AF37; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    .card { background: #1E1E1E; border: 1px solid #333; border-radius: 8px; overflow: hidden; }
    img { width: 100%; height: 320px; object-fit: cover; display: block; }
    .info { padding: 10px; font-size: 13px; line-height: 1.4; }
    .info b { color: #D4AF37; }
  </style>
</head>
<body>
  <h1>Select Best Image for Slide #2 (Saree, Lehenga, Indo-Western, Gown)</h1>
  <div class="grid">
`;

candidates.forEach((c, idx) => {
  const filename = c.src.split('/').pop();
  html += `
    <div class="card" id="card-${idx}">
      <img src="${c.src}" alt="${c.title}">
      <div class="info">
        <b>Candidate #${idx}</b><br>
        <code>${filename}</code><br>
        Size: ${(c.size / 1024).toFixed(0)} KB<br>
        Category: ${c.category}<br>
        ${c.title}
      </div>
    </div>
  `;
});

html += `
  </div>
</body>
</html>
`;

fs.writeFileSync('image_preview.html', html, 'utf8');
console.log('image_preview.html generated with 20 top candidates.');

