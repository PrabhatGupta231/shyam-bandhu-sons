/**
 * Shyam Bandhu & Sons - Static Development & Dynamic Gallery Server
 * Native Node.js HTTP Server - Zero External Dependencies
 * Vercel Serverless Compatible
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFile } = require('child_process');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;

// Use process.cwd() so Vercel serverless bundle resolves paths correctly
const ROOT_DIR = process.cwd();

// Admin authentication store (In-memory session registry with cryptographic tokens & expiry)
// Map of token -> { token, username, name, role, createdAt, expiresAt }
const activeAdminSessions = new Map();

// Login rate limiting store: Map of ip -> { attempts, lockoutUntil }
const loginRateLimiter = new Map();

const ADMIN_CREDENTIALS = [
  { username: 'admin', password: 'admin123', name: 'Raj Kamal Atelier Admin', role: 'Showroom Administrator' },
  { username: 'rajkamal', password: 'admin123', name: 'Raj Kamal (Founder)', role: 'Owner & Atelier Lead' },
  { username: 'rajkamal', password: 'sb2026', name: 'Raj Kamal (Founder)', role: 'Owner & Atelier Lead' },
  { username: 'shyambandhu', password: 'admin123', name: 'Showroom Manager', role: 'Branch Manager' },
  { username: 'shyambandhu', password: 'sb2026', name: 'Showroom Manager', role: 'Branch Manager' }
];

function getClientIp(req) {
  return (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || '127.0.0.1';
}

function checkRateLimit(ip) {
  const record = loginRateLimiter.get(ip);
  if (!record) return { allowed: true };
  if (record.lockoutUntil && Date.now() < record.lockoutUntil) {
    const remainingSecs = Math.ceil((record.lockoutUntil - Date.now()) / 1000);
    return { allowed: false, remainingSecs };
  }
  if (record.lockoutUntil && Date.now() >= record.lockoutUntil) {
    loginRateLimiter.delete(ip);
    return { allowed: true };
  }
  return { allowed: true };
}

function recordFailedLogin(ip) {
  const record = loginRateLimiter.get(ip) || { attempts: 0 };
  record.attempts += 1;
  if (record.attempts >= 5) {
    record.lockoutUntil = Date.now() + 5 * 60 * 1000; // 5 minute lockout after 5 failed attempts
  }
  loginRateLimiter.set(ip, record);
}

function clearRateLimit(ip) {
  loginRateLimiter.delete(ip);
}

function extractAdminToken(req) {
  const authHeader = req.headers['authorization'] || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.replace('Bearer ', '').trim();
  }
  if (authHeader) {
    return authHeader.trim();
  }
  const cookieHeader = req.headers['cookie'] || '';
  if (cookieHeader) {
    const match = cookieHeader.match(/sb_admin_token=([^;]+)/);
    if (match) return decodeURIComponent(match[1].trim());
  }
  return null;
}

function requireAdminAuth(req, res) {
  const token = extractAdminToken(req);
  if (!token) {
    res.writeHead(401, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({
      success: false,
      error: 'Unauthorized: Showroom Admin authentication required. Please sign in.'
    }));
    return null;
  }

  const session = activeAdminSessions.get(token);
  if (!session || Date.now() > session.expiresAt) {
    if (session) activeAdminSessions.delete(token);
    res.writeHead(401, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({
      success: false,
      error: 'Unauthorized: Session expired or invalid token. Please sign in again.'
    }));
    return null;
  }

  return session;
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

// ==========================================================================
// PERSISTENT GALLERY ENGINE (backed by memory, tmp, data/gallery.json & gallery_manifest.json)
// ==========================================================================
const DATA_DIR = path.join(ROOT_DIR, 'data');
const GALLERY_JSON = path.join(DATA_DIR, 'gallery.json');
const MANIFEST_JSON = path.join(ROOT_DIR, 'gallery_manifest.json');
const GALLERY_IMAGES_DIR = path.join(ROOT_DIR, 'public', 'images', 'gallery');
const BACKUP_TMP_JSON = path.join(os.tmpdir(), 'shyam_bandhu_gallery.json');

let memoryGalleryItems = null;

function initGalleryStorage() {
  // Wrapped in try/catch — Vercel has a read-only filesystem at startup
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (e) {
    console.warn('Read-only filesystem (data dir):', e.message);
  }

  try {
    if (!fs.existsSync(GALLERY_JSON) && fs.existsSync(MANIFEST_JSON)) {
      fs.copyFileSync(MANIFEST_JSON, GALLERY_JSON);
    }
  } catch (e) {
    console.warn('Read-only filesystem (gallery.json init):', e.message);
  }
}

// Auto-initialize on module load (safe on Vercel read-only FS)
try { initGalleryStorage(); } catch (e) { console.warn('initGalleryStorage skipped:', e.message); }

function loadAllGalleryItems() {
  if (Array.isArray(memoryGalleryItems) && memoryGalleryItems.length > 0) {
    return memoryGalleryItems;
  }

  // 1. Try temp backup if written during runtime
  if (fs.existsSync(BACKUP_TMP_JSON)) {
    try {
      const data = JSON.parse(fs.readFileSync(BACKUP_TMP_JSON, 'utf8'));
      if (Array.isArray(data) && data.length > 0) {
        memoryGalleryItems = data;
        return memoryGalleryItems;
      }
    } catch (e) {}
  }

  // 2. Try data/gallery.json
  if (fs.existsSync(GALLERY_JSON)) {
    try {
      const data = JSON.parse(fs.readFileSync(GALLERY_JSON, 'utf8'));
      if (Array.isArray(data) && data.length > 0) {
        memoryGalleryItems = data;
        return memoryGalleryItems;
      }
    } catch (e) {}
  }

  // 3. Try gallery_manifest.json
  if (fs.existsSync(MANIFEST_JSON)) {
    try {
      const data = JSON.parse(fs.readFileSync(MANIFEST_JSON, 'utf8'));
      if (Array.isArray(data) && data.length > 0) {
        memoryGalleryItems = data;
        return memoryGalleryItems;
      }
    } catch (e) {}
  }

  // 4. Fallback: scan directory
  if (fs.existsSync(GALLERY_IMAGES_DIR)) {
    try {
      const files = fs.readdirSync(GALLERY_IMAGES_DIR).filter(f => {
        const ext = path.extname(f).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.webp', '.avif'].includes(ext);
      });
      const categories = ['men', 'women', 'kids', 'lookbook'];
      memoryGalleryItems = files.map((file, idx) => ({
        id: `insta-${idx + 1}`,
        filename: file,
        src: `public/images/gallery/${file}`,
        category: categories[idx % categories.length],
        title: `Showroom Creation • Look #${idx + 1}`,
        date: '2026 Season Lookbook',
        instagramPost: `@ShyamBandhuAndSons • Look #${idx + 1}`,
        aspect: 'portrait'
      }));
      return memoryGalleryItems;
    } catch (e) {}
  }

  memoryGalleryItems = [];
  return memoryGalleryItems;
}

function persistGalleryItems(items) {
  memoryGalleryItems = items;
  const jsonStr = JSON.stringify(items, null, 2);

  // Always persist to tmpdir so memory/restarts retain changes
  try {
    fs.writeFileSync(BACKUP_TMP_JSON, jsonStr, 'utf8');
  } catch (e) {
    console.warn('Read-only filesystem (tmp gallery):', e.message);
  }

  // Try saving to data/gallery.json (may be read-only on Vercel)
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(GALLERY_JSON, jsonStr, 'utf8');
  } catch (e) {
    console.warn('Read-only filesystem (gallery.json):', e.message);
  }

  // Try updating gallery_manifest.json
  try {
    fs.writeFileSync(MANIFEST_JSON, jsonStr, 'utf8');
  } catch (e) {
    console.warn('Read-only filesystem (gallery_manifest.json):', e.message);
  }
}

function saveImageFromBase64(base64Str, originalFilename) {
  if (!base64Str) return null;
  const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  let ext = '.jpg';
  let buffer;
  if (matches && matches.length === 3) {
    const mime = matches[1].toLowerCase();
    if (mime.includes('png')) ext = '.png';
    else if (mime.includes('webp')) ext = '.webp';
    else if (mime.includes('avif')) ext = '.avif';
    else ext = '.jpg';
    buffer = Buffer.from(matches[2], 'base64');
  } else {
    buffer = Buffer.from(base64Str, 'base64');
  }

  const cleanOriginal = (originalFilename || 'look')
    .replace(/[^a-zA-Z0-9_\-\.]/g, '_')
    .replace(/\.[^.]+$/, '');
  const finalFilename = `${Date.now()}_${cleanOriginal}${ext}`;

  try {
    if (!fs.existsSync(GALLERY_IMAGES_DIR)) {
      fs.mkdirSync(GALLERY_IMAGES_DIR, { recursive: true });
    }
    const targetPath = path.join(GALLERY_IMAGES_DIR, finalFilename);
    fs.writeFileSync(targetPath, buffer);
  } catch (e) {
    // Fallback to tmpdir (Vercel read-only FS)
    try {
      const tmpPath = path.join(os.tmpdir(), finalFilename);
      fs.writeFileSync(tmpPath, buffer);
      console.warn('Image saved to tmpdir (read-only FS):', tmpPath);
    } catch (err) {
      console.warn('Could not save image anywhere:', err.message);
    }
  }

  return {
    filename: finalFilename,
    src: `public/images/gallery/${finalFilename}`
  };
}

// ==========================================================================
// PERSISTENT REELS ENGINE (backed by memory, tmp, and data/reels.json)
// ==========================================================================
const REELS_JSON = path.join(ROOT_DIR, 'data', 'reels.json');
const BACKUP_TMP_REELS_JSON = path.join(os.tmpdir(), 'shyam_bandhu_reels.json');

const DEFAULT_SEED_REELS = [
  {
    id: "reel-1",
    url: "https://www.instagram.com/reel/C-bridal-lehenga-walk/",
    title: "Royal Bridal Lehenga Walk • Tedhi Puliya Lounge",
    category: "bridal",
    type: "mp4",
    directVideoUrl: "public/videos/reel-bridal-lehenga.mp4",
    embedUrl: "https://www.instagram.com/reel/C-bridal-lehenga-walk/embed/",
    active: true,
    likes: "15.4k Views",
    date: "November 2026"
  },
  {
    id: "reel-2",
    url: "https://www.instagram.com/reel/C-banarasi-gold-zari/",
    title: "Master Banarasi Weave & Real Gold Zari Drape",
    category: "women",
    type: "mp4",
    directVideoUrl: "public/videos/reel-banarasi-saree.mp4",
    embedUrl: "https://www.instagram.com/reel/C-banarasi-gold-zari/embed/",
    active: true,
    likes: "21.8k Views",
    date: "November 2026"
  },
  {
    id: "reel-3",
    url: "https://www.instagram.com/reel/C-regal-groom-sherwani/",
    title: "Regal Heritage Groom Sherwani Trials",
    category: "men",
    type: "mp4",
    directVideoUrl: "public/videos/reel-heritage-couture.mp4",
    embedUrl: "https://www.instagram.com/reel/C-regal-groom-sherwani/embed/",
    active: true,
    likes: "11.2k Views",
    date: "October 2026"
  },
  {
    id: "reel-4",
    url: "https://www.instagram.com/reel/C-kids-festive-twirl/",
    title: "Kids Festive Twirl & Royal Ensemble Showcase",
    category: "kids",
    type: "mp4",
    directVideoUrl: "public/videos/reel-bridal-lehenga.mp4",
    embedUrl: "https://www.instagram.com/reel/C-kids-festive-twirl/embed/",
    active: true,
    likes: "9.5k Views",
    date: "October 2026"
  }
];

let memoryReels = null;

function loadAllReels() {
  if (Array.isArray(memoryReels) && memoryReels.length > 0) {
    return memoryReels;
  }
  if (fs.existsSync(BACKUP_TMP_REELS_JSON)) {
    try {
      const data = JSON.parse(fs.readFileSync(BACKUP_TMP_REELS_JSON, 'utf8'));
      if (Array.isArray(data) && data.length > 0) {
        memoryReels = data;
        return memoryReels;
      }
    } catch (e) {}
  }
  if (fs.existsSync(REELS_JSON)) {
    try {
      const data = JSON.parse(fs.readFileSync(REELS_JSON, 'utf8'));
      if (Array.isArray(data) && data.length > 0) {
        memoryReels = data;
        return memoryReels;
      }
    } catch (e) {}
  }

  // Fallback to initial seeds
  memoryReels = [...DEFAULT_SEED_REELS];
  persistReels(memoryReels);
  return memoryReels;
}

function persistReels(reels) {
  memoryReels = reels;
  const jsonStr = JSON.stringify(reels, null, 2);
  try {
    fs.writeFileSync(BACKUP_TMP_REELS_JSON, jsonStr, 'utf8');
  } catch (e) {
    console.warn('Read-only filesystem (tmp reels):', e.message);
  }
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(REELS_JSON, jsonStr, 'utf8');
  } catch (e) {
    console.warn('Read-only filesystem (reels.json):', e.message);
  }
}

function resolveReelVideo(inputUrl, callback) {
  const url = (inputUrl || '').trim();
  if (!url) {
    return callback(new Error('Empty video URL'));
  }

  // 1. Direct MP4 or local/external video file
  if (/\.(mp4|webm|mov)(\?.*)?$/i.test(url) || url.startsWith('public/videos/') || url.startsWith('/api/reels/stream/')) {
    return callback(null, {
      type: 'mp4',
      directVideoUrl: url,
      embedUrl: null
    });
  }

  // 2. YouTube Shorts or YouTube Video
  const ytShortsMatch = url.match(/(?:shorts\/|youtu\.be\/|watch\?v=)([A-Za-z0-9_-]{8,15})/);
  if (ytShortsMatch) {
    const videoId = ytShortsMatch[1];
    return callback(null, {
      type: 'youtube',
      directVideoUrl: null,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&playsinline=1&rel=0`
    });
  }

  // 3. Instagram Reel or Post
  const instaMatch = url.match(/(?:instagram\.com\/(?:[A-Za-z0-9_.]+\/)?(?:reel|p|tv)\/)([A-Za-z0-9_-]+)/i);
  if (instaMatch) {
    const reelCode = instaMatch[1];
    const fallbackEmbed = `https://www.instagram.com/reel/${reelCode}/embed/`;
    const uniqueFileName = `reel_${reelCode}_${Date.now()}.mp4`;
    const targetLocalPath = path.join(__dirname, 'public', 'videos', 'reels', uniqueFileName);
    const publicRelPath = `public/videos/reels/${uniqueFileName}`;

    const reelsDir = path.join(ROOT_DIR, 'public', 'videos', 'reels');
    if (!fs.existsSync(reelsDir)) {
      try { fs.mkdirSync(reelsDir, { recursive: true }); } catch (e) {
        console.warn('Read-only filesystem (reels dir):', e.message);
      }
    }

    // Check if a unique file specifically generated for this reel shortcode already exists
    try {
      const files = fs.readdirSync(reelsDir);
      const existing = files.find(f => f.startsWith(`reel_${reelCode}`) && f.endsWith('.mp4'));
      if (existing) {
        return callback(null, {
          type: 'mp4',
          directVideoUrl: `public/videos/reels/${existing}`,
          embedUrl: fallbackEmbed
        });
      }
    } catch (e) {}

    // Attempt direct download with yt-dlp using mobile User-Agent to avoid Instagram 403 Forbidden
    const mobileUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1';
    execFile('yt-dlp', ['--user-agent', mobileUA, '-f', 'best[ext=mp4]/best', '-o', targetLocalPath, '--no-warnings', url], { timeout: 45000 }, (err) => {
      if (!err && fs.existsSync(targetLocalPath)) {
        try {
          const stats = fs.statSync(targetLocalPath);
          if (stats.size > 10000) {
            return callback(null, {
              type: 'mp4',
              directVideoUrl: publicRelPath,
              embedUrl: fallbackEmbed
            });
          }
        } catch (e) {}
      }

      // If direct download failed, try extracting direct stream URL using yt-dlp -g with mobile UA
      execFile('yt-dlp', ['--user-agent', mobileUA, '-g', '--no-warnings', url], { timeout: 10000 }, (gErr, stdout) => {
        if (!gErr && stdout && stdout.trim().startsWith('http')) {
          const streamUrl = stdout.trim().split('\n')[0].trim();
          return callback(null, {
            type: 'mp4',
            directVideoUrl: streamUrl,
            embedUrl: fallbackEmbed
          });
        }

        // Try scraping og:video or video_url from Instagram page
        try {
          const https = require('https');
          const req = https.get(url, {
            headers: {
              'User-Agent': mobileUA,
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            },
            timeout: 5000
          }, (res) => {
            let html = '';
            res.on('data', chunk => { if (html.length < 500000) html += chunk; });
            res.on('end', () => {
              const metaVideo = html.match(/<meta[^>]+property=["']og:video["'][^>]+content=["']([^"']+)["']/i) ||
                                html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:video["']/i) ||
                                html.match(/"video_url"\s*:\s*"([^"]+)"/);
              if (metaVideo && metaVideo[1]) {
                const directStream = metaVideo[1].replace(/\\u0026/g, '&');
                return callback(null, {
                  type: 'mp4',
                  directVideoUrl: directStream,
                  embedUrl: fallbackEmbed
                });
              }

              // Fallback directly to that specific Instagram reel's embed player
              return callback(null, {
                type: 'instagram',
                directVideoUrl: null,
                embedUrl: fallbackEmbed,
                warning: 'Instagram restricted direct video stream. Clean Instagram reel embed player enabled.'
              });
            });
          });
          req.on('error', () => {
            return callback(null, {
              type: 'instagram',
              directVideoUrl: null,
              embedUrl: fallbackEmbed,
              warning: 'Could not connect to Instagram stream. Clean Instagram reel embed player enabled.'
            });
          });
          req.on('timeout', () => {
            req.destroy();
            return callback(null, {
              type: 'instagram',
              directVideoUrl: null,
              embedUrl: fallbackEmbed,
              warning: 'Instagram request timed out. Clean Instagram reel embed player enabled.'
            });
          });
          return;
        } catch (e) {
          return callback(null, {
            type: 'instagram',
            directVideoUrl: null,
            embedUrl: fallbackEmbed,
            warning: 'Instagram parser error. Clean Instagram reel embed player enabled.'
          });
        }
      });
    });
    return;
  }

  // Fallback for generic video links
  const isVideoExt = /\.(mp4|webm|mov)(\?.*)?$/i.test(url) || url.startsWith('public/videos/');
  return callback(null, {
    type: isVideoExt ? 'mp4' : 'unknown',
    directVideoUrl: isVideoExt ? url : null,
    embedUrl: isVideoExt ? null : (url.includes('instagram.com') ? url : null)
  });
}

// Auto-initialize reels on startup
loadAllReels();

const server = http.createServer((req, res) => {
  let reqPath = decodeURIComponent(req.url.split('?')[0]);

  // Handle CORS preflight options
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  // Route: Admin Login Authentication API
  if (reqPath === '/api/admin/login' && req.method === 'POST') {
    const clientIp = getClientIp(req);
    const rateCheck = checkRateLimit(clientIp);
    if (!rateCheck.allowed) {
      res.writeHead(429, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      });
      return res.end(JSON.stringify({
        success: false,
        message: `Too many failed login attempts. Please wait ${rateCheck.remainingSecs} seconds before trying again.`
      }));
    }

    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const userClean = (payload.username || '').trim().toLowerCase();
        const passClean = (payload.password || '').trim();

        const account = ADMIN_CREDENTIALS.find(acc => 
          acc.username.toLowerCase() === userClean && acc.password === passClean
        );

        if (account) {
          clearRateLimit(clientIp);
          const secureToken = 'sb_adm_' + Date.now() + '_' + crypto.randomBytes(24).toString('hex');
          const sessionObj = {
            token: secureToken,
            username: account.username,
            name: account.name,
            role: account.role,
            createdAt: Date.now(),
            expiresAt: Date.now() + (24 * 60 * 60 * 1000)
          };
          activeAdminSessions.set(secureToken, sessionObj);

          res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8',
            'Set-Cookie': `sb_admin_token=${secureToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`,
            'Access-Control-Allow-Origin': '*'
          });
          return res.end(JSON.stringify({
            success: true,
            token: secureToken,
            user: {
              username: account.username,
              name: account.name,
              role: account.role
            },
            message: 'Showroom Admin authentication successful'
          }));
        } else {
          recordFailedLogin(clientIp);
          res.writeHead(401, {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*'
          });
          return res.end(JSON.stringify({
            success: false,
            message: 'Invalid showroom username or password. Please verify credentials.'
          }));
        }
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, message: 'Invalid JSON request payload' }));
      }
    });
    return;
  }

  // Route: Admin Verify Session API
  if (reqPath === '/api/admin/verify' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const token = (payload.token || (req.headers['authorization'] || '').replace('Bearer ', '') || (extractAdminToken(req) || '')).trim();
        const session = activeAdminSessions.get(token);
        const isValid = !!session && Date.now() < session.expiresAt;
        if (!isValid && session) {
          activeAdminSessions.delete(token);
        }

        res.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*'
        });
        return res.end(JSON.stringify({
          valid: isValid,
          user: isValid ? { username: session.username, name: session.name, role: session.role } : null
        }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ valid: false }));
      }
    });
    return;
  }

  // Route: Admin Logout API
  if (reqPath === '/api/admin/logout' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const token = (payload.token || extractAdminToken(req) || '').trim();
        if (token) activeAdminSessions.delete(token);

        res.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8',
          'Set-Cookie': 'sb_admin_token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
          'Access-Control-Allow-Origin': '*'
        });
        return res.end(JSON.stringify({ success: true, message: 'Admin signed out successfully' }));
      } catch (e) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: true }));
      }
    });
    return;
  }

  // ==========================================================================
  // GALLERY CRUD API ROUTES (GET, POST, PUT, DELETE)
  // ==========================================================================

  // Route: GET /api/gallery (Public read-only)
  if (reqPath === '/api/gallery' && req.method === 'GET') {
    const items = loadAllGalleryItems();
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*'
    });
    return res.end(JSON.stringify(items));
  }

  // Route: POST /api/gallery (Upload one or multiple new looks - Admin Authenticated)
  if (reqPath === '/api/gallery' && req.method === 'POST') {
    const auth = requireAdminAuth(req, res);
    if (!auth) return;

    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const itemsToProcess = Array.isArray(payload.items) ? payload.items : [payload];
        const allItems = loadAllGalleryItems();
        const createdItems = [];

        itemsToProcess.forEach((p, idx) => {
          let filename = p.filename || `look_${Date.now()}_${idx + 1}.jpg`;
          let src = p.src || `public/images/gallery/${filename}`;

          if (p.imageBase64) {
            const saved = saveImageFromBase64(p.imageBase64, p.filename);
            if (saved) {
              filename = saved.filename;
              src = saved.src;
            }
          }

          const newItem = {
            id: p.id || `insta-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            filename: filename,
            src: src,
            category: (p.category || 'women').toLowerCase(),
            title: p.title || `Showroom Creation • Look #${allItems.length + 1}`,
            date: p.date || '2026 Season Lookbook',
            instagramPost: p.instagramPost || `@ShyamBandhuAndSons • ${p.title || 'Look'}`,
            aspect: p.aspect || 'portrait'
          };
          allItems.unshift(newItem);
          createdItems.push(newItem);
        });

        persistGalleryItems(allItems);

        res.writeHead(201, {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*'
        });
        return res.end(JSON.stringify({ success: true, count: createdItems.length, items: createdItems }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        return res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // Route: PUT /api/gallery/:id (Edit look - Admin Authenticated)
  const putGalleryMatch = reqPath.match(/^\/api\/gallery\/([^\/?#]+)$/);
  if (putGalleryMatch && req.method === 'PUT') {
    const auth = requireAdminAuth(req, res);
    if (!auth) return;

    const id = putGalleryMatch[1];
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const allItems = loadAllGalleryItems();
        const index = allItems.findIndex(x => x.id === id);
        if (index === -1) {
          res.writeHead(404, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          return res.end(JSON.stringify({ success: false, error: 'Look not found' }));
        }

        const item = allItems[index];
        if (payload.title !== undefined) item.title = payload.title;
        if (payload.category !== undefined) item.category = payload.category.toLowerCase();
        if (payload.instagramPost !== undefined) item.instagramPost = payload.instagramPost;
        if (payload.aspect !== undefined) item.aspect = payload.aspect;

        if (payload.imageBase64) {
          const saved = saveImageFromBase64(payload.imageBase64, payload.filename || item.filename);
          if (saved) {
            item.filename = saved.filename;
            item.src = saved.src;
          }
        }

        allItems[index] = item;
        persistGalleryItems(allItems);

        res.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*'
        });
        return res.end(JSON.stringify({ success: true, item: item }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        return res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // Route: DELETE /api/gallery/:id (Delete look - Admin Authenticated)
  const delGalleryMatch = reqPath.match(/^\/api\/gallery\/([^\/?#]+)$/);
  if (delGalleryMatch && req.method === 'DELETE') {
    const auth = requireAdminAuth(req, res);
    if (!auth) return;

    const id = delGalleryMatch[1];
    const allItems = loadAllGalleryItems();
    const index = allItems.findIndex(x => x.id === id);
    if (index === -1) {
      res.writeHead(404, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      return res.end(JSON.stringify({ success: false, error: 'Look not found' }));
    }

    const removedItem = allItems.splice(index, 1)[0];
    persistGalleryItems(allItems);

    // Unlink image file if located in public/images/gallery/
    try {
      if (removedItem.src && removedItem.src.startsWith('public/images/gallery/')) {
        const filePath = path.join(__dirname, removedItem.src);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    } catch (e) {
      console.warn('Could not remove file:', e.message);
    }

    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    });
    return res.end(JSON.stringify({ success: true, deletedId: id }));
  }

  // ==========================================================================
  // REELS & VIDEO SHOWCASE API ROUTES (GET, POST, PUT, DELETE, STREAM)
  // ==========================================================================

  // Route: GET /api/reels/stream/:id (Proxy / Stream clean .mp4 reel)
  const streamMatch = reqPath.match(/^\/api\/reels\/stream\/([^\/?#]+)$/);
  if (streamMatch && req.method === 'GET') {
    const reelId = streamMatch[1];
    const allReels = loadAllReels();
    const reel = allReels.find(x => x.id === reelId);
    let targetVideo = reel ? (reel.directVideoUrl || reel.url) : null;

    let localFile = null;
    if (targetVideo && fs.existsSync(path.join(ROOT_DIR, targetVideo))) {
      localFile = path.join(ROOT_DIR, targetVideo);
    } else if (fs.existsSync(path.join(ROOT_DIR, `public/videos/reels/reel-${reelId}.mp4`))) {
      localFile = path.join(ROOT_DIR, `public/videos/reels/reel-${reelId}.mp4`);
    }

    if (!localFile) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('404 Video Not Found');
    }

    fs.stat(localFile, (err, stats) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('404 Video Not Found');
      }
      const range = req.headers.range;
      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
        const chunksize = (end - start) + 1;
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${stats.size}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'video/mp4',
          'Access-Control-Allow-Origin': '*'
        });
        fs.createReadStream(localFile, { start, end }).pipe(res);
      } else {
        res.writeHead(200, {
          'Content-Length': stats.size,
          'Content-Type': 'video/mp4',
          'Accept-Ranges': 'bytes',
          'Access-Control-Allow-Origin': '*'
        });
        fs.createReadStream(localFile).pipe(res);
      }
    });
    return;
  }

  // Route: GET /api/reels
  if (reqPath === '/api/reels' && req.method === 'GET') {
    const reels = loadAllReels();
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*'
    });
    return res.end(JSON.stringify(reels));
  }

  // Route: POST /api/reels (Add / Auto-resolve clean video reel or direct video upload - Admin Authenticated)
  if (reqPath === '/api/reels' && req.method === 'POST') {
    const auth = requireAdminAuth(req, res);
    if (!auth) return;

    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');

        // Check if direct video file base64 was uploaded
        if (payload.videoBase64) {
          const cleanB64 = payload.videoBase64.replace(/^data:video\/[a-z0-9]+;base64,/, '');
          const filename = `reel_upload_${Date.now()}.mp4`;
          const filePath = path.join(ROOT_DIR, 'public/videos/reels', filename);
          const reelsDir = path.join(ROOT_DIR, 'public/videos/reels');
          try {
            if (!fs.existsSync(reelsDir)) fs.mkdirSync(reelsDir, { recursive: true });
            fs.writeFileSync(filePath, Buffer.from(cleanB64, 'base64'));
          } catch (e) {
            console.warn('Read-only filesystem (reel upload):', e.message);
          }
          const publicRelPath = `public/videos/reels/${filename}`;
          const allReels = loadAllReels();
          const newReel = {
            id: 'reel-' + Date.now(),
            url: publicRelPath,
            title: (payload.title || '').trim() || 'Showroom Creation Reel',
            category: ((payload.category || 'bridal').trim()).toLowerCase(),
            type: 'mp4',
            directVideoUrl: publicRelPath,
            embedUrl: null,
            active: payload.active !== false,
            likes: '10.5k Views',
            date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
          };
          allReels.unshift(newReel);
          persistReels(allReels);
          res.writeHead(201, {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*'
          });
          return res.end(JSON.stringify({ success: true, item: newReel, count: allReels.length }));
        }

        const url = (payload.url || '').trim();
        if (!url) {
          res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          return res.end(JSON.stringify({ success: false, error: 'Reel link or video file is required' }));
        }

        resolveReelVideo(url, (err, resolved) => {
          const allReels = loadAllReels();
          const newReel = {
            id: 'reel-' + Date.now(),
            url: url,
            title: (payload.title || '').trim() || 'Showroom Exclusive Reel',
            category: ((payload.category || 'bridal').trim()).toLowerCase(),
            type: resolved ? resolved.type : 'mp4',
            directVideoUrl: resolved ? resolved.directVideoUrl : (url.endsWith('.mp4') ? url : null),
            embedUrl: resolved ? resolved.embedUrl : null,
            warning: resolved && resolved.warning ? resolved.warning : undefined,
            active: payload.active !== false,
            likes: '10.5k Views',
            date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
          };

          allReels.unshift(newReel);
          persistReels(allReels);

          res.writeHead(201, {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*'
          });
          return res.end(JSON.stringify({ success: true, item: newReel, count: allReels.length, warning: newReel.warning }));
        });
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        return res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // Route: PUT /api/reels/:id (Update reel title, category, or active toggle - Admin Authenticated)
  const putReelMatch = reqPath.match(/^\/api\/reels\/([^\/?#]+)$/);
  if (putReelMatch && req.method === 'PUT') {
    const auth = requireAdminAuth(req, res);
    if (!auth) return;

    const id = putReelMatch[1];
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const allReels = loadAllReels();
        const index = allReels.findIndex(x => x.id === id);
        if (index === -1) {
          res.writeHead(404, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          return res.end(JSON.stringify({ success: false, error: 'Reel not found' }));
        }

        const item = allReels[index];
        if (payload.title !== undefined) item.title = payload.title.trim();
        if (payload.category !== undefined) item.category = payload.category.trim().toLowerCase();
        if (payload.active !== undefined) item.active = Boolean(payload.active);
        if (payload.directVideoUrl !== undefined) item.directVideoUrl = payload.directVideoUrl;

        allReels[index] = item;
        persistReels(allReels);

        res.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*'
        });
        return res.end(JSON.stringify({ success: true, item: item }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        return res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // Route: DELETE /api/reels/:id (Delete reel - Admin Authenticated)
  const delReelMatch = reqPath.match(/^\/api\/reels\/([^\/?#]+)$/);
  if (delReelMatch && req.method === 'DELETE') {
    const auth = requireAdminAuth(req, res);
    if (!auth) return;

    const id = delReelMatch[1];
    const allReels = loadAllReels();
    const index = allReels.findIndex(x => x.id === id);
    if (index === -1) {
      res.writeHead(404, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      return res.end(JSON.stringify({ success: false, error: 'Reel not found' }));
    }

    allReels.splice(index, 1);
    persistReels(allReels);

    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    });
    return res.end(JSON.stringify({ success: true, deletedId: id }));
  }

  // Routing friendly URLs
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  } else if (reqPath === '/admin' || reqPath === '/admin/') {
    reqPath = '/admin.html';
  } else if (reqPath === '/gallery' || reqPath === '/gallery/') {
    reqPath = '/gallery.html';
  }

  const safePath = path.normalize(path.join(ROOT_DIR, reqPath));
  if (!safePath.startsWith(ROOT_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('403 Forbidden: Access Denied');
  }

  const filePath = safePath;
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  // Security Headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // Video Streaming Support (HTTP 206 Partial Content & Range Requests)
  if (ext === '.mp4' || ext === '.webm') {
    fs.stat(filePath, (err, stats) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('404 Not Found');
      }

      const range = req.headers.range;
      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(filePath, { start, end });

        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${stats.size}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*'
        });
        file.pipe(res);
      } else {
        res.writeHead(200, {
          'Content-Length': stats.size,
          'Content-Type': contentType,
          'Accept-Ranges': 'bytes',
          'Access-Control-Allow-Origin': '*'
        });
        fs.createReadStream(filePath).pipe(res);
      }
    });
    return;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(content);
    }
  });
});

// Export handler for Vercel Serverless Functions
module.exports = server;

// Only start listening when run directly (local development)
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`======================================================`);
    console.log(`✦ SHYAM BANDHU & SONS - OFFLINE SHOWROOM & LOOKBOOK`);
    console.log(`✦ Server running at: http://localhost:${PORT}/`);
    console.log(`✦ Gallery API at:    http://localhost:${PORT}/api/gallery`);
    console.log(`✦ Gallery Page at:   http://localhost:${PORT}/gallery`);
    console.log(`✦ Admin Panel at:    http://localhost:${PORT}/admin`);
    console.log(`======================================================`);
  });
}
