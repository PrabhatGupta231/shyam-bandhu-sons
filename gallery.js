/**
 * Shyam Bandhu & Sons - Modern Masonry Gallery & Lightbox Engine
 * Dynamically loads 315+ Instagram looks with smooth animations & WhatsApp inquiries
 */

class ShowroomGallery {
  constructor(options = {}) {
    this.containerId = options.containerId || 'gallery-masonry-grid';
    this.filterTabsId = options.filterTabsId || 'gallery-filter-tabs';
    this.lightboxId = options.lightboxId || 'lightbox-modal';
    this.limit = options.limit || 24; // Page chunk size for smooth 60fps rendering
    this.maxItems = options.maxItems || null; // Optional cap for homepage widget

    this.items = [];
    this.filteredItems = [];
    this.displayedCount = 0;
    this.activeCategory = options.defaultCategory || 'women'; // Default to Women's Wear priority
    this.currentLightboxIndex = 0;
    this.isZoomed = false;

    this.init();
  }

  async init() {
    await this.loadGalleryData();
    this.setupFilterTabs();
    this.setupLightbox();
    this.render();
    this.setupInfiniteScroll();
  }

  async loadGalleryData() {
    try {
      // 1. Try dynamic server API first (automatically updates when new files are added)
      const res = await fetch('/api/gallery');
      if (res.ok) {
        this.items = await res.json();
      } else {
        throw new Error('API unavailable');
      }
    } catch (e) {
      try {
        // 2. Fallback to static manifest file (works offline/file://)
        const resStatic = await fetch('gallery_manifest.json');
        if (resStatic.ok) {
          this.items = await resStatic.json();
        } else {
          throw new Error('Manifest unavailable');
        }
      } catch (err) {
        // 3. Fallback to storage engine if available
        if (window.StorageEngine) {
          this.items = StorageEngine.getGallery();
        }
      }
    }

    // Load active showroom reels
    try {
      const reelsRes = await fetch('/api/reels');
      if (reelsRes.ok) {
        const reelsData = await reelsRes.json();
        this.reels = Array.isArray(reelsData) ? reelsData.filter(x => x.active !== false) : [];
      }
    } catch (e) {
      this.reels = [];
    }

    if (!this.items || this.items.length === 0) {
      this.items = [];
    }

    // Prominently highlight Women's Wear looks at the top of the collection
    this.items.sort((a, b) => {
      if (a.category === 'women' && b.category !== 'women') return -1;
      if (a.category !== 'women' && b.category === 'women') return 1;
      return 0;
    });

    if (this.activeCategory === 'all') {
      this.filteredItems = [...this.items];
    } else {
      this.filteredItems = this.items.filter(x => x.category === this.activeCategory);
    }
  }

  setupFilterTabs() {
    const tabsContainer = document.getElementById(this.filterTabsId);
    if (!tabsContainer) return;

    const categories = [
      { key: 'women', label: '👑 Women\'s Wear (Bridal & Ethnic)', isFeatured: true },
      { key: 'reels', label: '🎬 Reels & Videos', isFeatured: false },
      { key: 'all', label: 'All Looks', isFeatured: false },
      { key: 'men', label: 'Men\'s Wear', isFeatured: false },
      { key: 'kids', label: 'Kids\' Wear', isFeatured: false },
      { key: 'lookbook', label: 'Store & Festive Lookbook', isFeatured: false }
    ];

    tabsContainer.innerHTML = categories.map(cat => {
      let count = 0;
      if (cat.key === 'all') count = this.items.length;
      else if (cat.key === 'reels') count = (this.reels || []).length;
      else count = this.items.filter(x => x.category === cat.key).length;

      const featuredClass = cat.isFeatured ? 'featured-women-tab' : '';
      const activeClass = cat.key === this.activeCategory ? 'active' : '';

      return `
        <button class="gallery-filter-btn ${featuredClass} ${activeClass}" data-cat="${cat.key}">
          <span>${cat.label}</span>
          <span class="gallery-count-pill">${count}</span>
        </button>
      `;
    }).join('');

    tabsContainer.querySelectorAll('.gallery-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        tabsContainer.querySelectorAll('.gallery-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeCategory = btn.getAttribute('data-cat');
        this.filterCategory(this.activeCategory);
      });
    });
  }

  filterCategory(cat) {
    this.activeCategory = cat;
    const grid = document.getElementById(this.containerId);
    if (!grid) return;
    grid.innerHTML = '';

    if (cat === 'reels') {
      const reelsToShow = this.reels || [];
      if (reelsToShow.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: #888; padding: 4rem;">Loading showroom reels...</div>';
      } else {
        grid.innerHTML = reelsToShow.map((reel, idx) => {
          const isVideoFile = (u) => u && (/\.(mp4|webm|mov)(\?.*)?$/i.test(u) || u.startsWith('public/videos/') || u.startsWith('/api/reels/stream/'));
          const hasDirectVideo = Boolean(reel.directVideoUrl && isVideoFile(reel.directVideoUrl));
          const whatsappMsg = `Hello Shyam Bandhu & Sons, I would like to enquire about this Showroom Reel: "${reel.title || 'Haute Couture Look'}"`;
          const whatsappUrl = `https://api.whatsapp.com/send?phone=919450646328&text=${encodeURIComponent(whatsappMsg)}`;

          let mediaHtml = '';
          if (hasDirectVideo) {
            mediaHtml = `
              <button type="button" class="reel-mute-btn" data-target="gallery-reel-${idx}" title="Mute/Unmute">🔇</button>
              <video class="reel-video-element" id="gallery-reel-${idx}" autoplay muted loop playsinline preload="auto" style="position: absolute !important; top: 0 !important; left: 0 !important; inset: 0; width: 100% !important; height: 100% !important; max-height: none !important; object-fit: cover !important; z-index: 1;">
                <source src="${reel.directVideoUrl}" type="video/mp4">
              </video>
            `;
          } else if (reel.embedUrl) {
            mediaHtml = `
              <div class="reel-embed-frame-wrap" style="position: absolute; inset: 0; width: 100%; height: 100%; overflow: hidden; background: #000; z-index: 1;">
                <iframe src="${reel.embedUrl}" scrolling="no" frameborder="0" allowtransparency="true" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; transform: scale(1.38); transform-origin: center center; pointer-events: none;"></iframe>
              </div>
            `;
          } else {
            mediaHtml = `
              <video class="reel-video-element" id="gallery-reel-${idx}" autoplay muted loop playsinline preload="auto" style="position: absolute !important; top: 0 !important; left: 0 !important; inset: 0; width: 100% !important; height: 100% !important; max-height: none !important; object-fit: cover !important; z-index: 1;">
                <source src="${reel.url}" type="video/mp4">
              </video>
            `;
          }

          return `
            <div class="reel-card" style="margin-bottom: 1.5rem;">
              <span class="reel-cat-badge">${(reel.category || 'bridal').toUpperCase()}</span>
              ${mediaHtml}
              <div class="reel-card-gradient"></div>
              <div class="reel-bottom-card-overlay">
                <h3 class="reel-card-title">${reel.title || 'Showroom Exclusive Reel'}</h3>
                <a href="${whatsappUrl}" target="_blank" class="btn-reel-whatsapp">
                  <span>💬 Enquire on WhatsApp</span>
                </a>
              </div>
            </div>
          `;
        }).join('');

        // Handle video load errors gracefully without substituting another reel's video
        grid.querySelectorAll('.reel-video-element').forEach(vid => {
          vid.addEventListener('error', () => {
            console.warn('Gallery reel video failed to load:', vid.currentSrc || vid.src);
          });
        });

        grid.querySelectorAll('.reel-mute-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const targetId = btn.getAttribute('data-target');
            const v = document.getElementById(targetId);
            if (v) {
              v.muted = !v.muted;
              btn.textContent = v.muted ? '🔇' : '🔊';
            }
          });
        });
      }
      return;
    }

    if (cat === 'all') {
      this.filteredItems = [...this.items];
    } else {
      this.filteredItems = this.items.filter(x => x.category === cat);
    }
    this.displayedCount = 0;
    this.render();
  }

  render() {
    const grid = document.getElementById(this.containerId);
    if (!grid) return;

    if (this.maxItems && this.displayedCount >= this.maxItems) {
      return;
    }

    const fetchLimit = this.maxItems 
      ? Math.min(this.limit, this.maxItems - this.displayedCount) 
      : this.limit;

    if (fetchLimit <= 0) return;

    const nextBatch = this.filteredItems.slice(
      this.displayedCount, 
      this.displayedCount + fetchLimit
    );

    const fragment = document.createDocumentFragment();

    nextBatch.forEach((item, index) => {
      const overallIndex = this.displayedCount + index;
      const card = document.createElement('div');
      card.className = 'masonry-item';
      card.setAttribute('data-index', overallIndex);

      const categoryLabels = {
        men: "Men's Imperial Wear",
        women: "Women's Bridal & Silk",
        kids: "Kids' Festive Wear",
        lookbook: "Store & Lookbook"
      };
      const catLabel = categoryLabels[item.category] || 'Showroom Creation';

      card.innerHTML = `
        <div class="masonry-img-wrapper">
          <img class="masonry-img" src="${item.src}" alt="${item.title}" loading="lazy">
          <div class="masonry-overlay">
            <div class="masonry-overlay-top">
              <span class="masonry-cat-badge">${catLabel}</span>
              <div class="instagram-icon-badge" title="View on Instagram Lookbook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </div>
            </div>
            <div class="masonry-overlay-bottom">
              <h4 class="masonry-title">${item.title}</h4>
              <span class="masonry-post-handle">${item.instagramPost || '@ShyamBandhuAndSons'}</span>
              <button class="btn-view-look">
                <span>View Full Look 🔍</span>
              </button>
            </div>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        this.openLightbox(overallIndex);
      });

      fragment.appendChild(card);
    });

    grid.appendChild(fragment);
    this.displayedCount += nextBatch.length;

    // Trigger smooth staggered scroll reveal
    this.observeScrollReveal();
  }

  observeScrollReveal() {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.masonry-item:not(.revealed)').forEach(el => {
      observer.observe(el);
    });
  }

  setupInfiniteScroll() {
    window.addEventListener('scroll', () => {
      if (this.maxItems && this.displayedCount >= this.maxItems) return;
      if (this.displayedCount >= this.filteredItems.length) return;

      const scrollBottom = window.innerHeight + window.scrollY;
      const documentHeight = document.documentElement.offsetHeight - 600;

      if (scrollBottom >= documentHeight) {
        this.render();
      }
    });
  }

  /* ==========================================================================
     LIGHTBOX IMPLEMENTATION
     ========================================================================== */
  setupLightbox() {
    let modal = document.getElementById(this.lightboxId);
    if (!modal) {
      modal = document.createElement('div');
      modal.id = this.lightboxId;
      modal.className = 'lightbox-modal';
      modal.innerHTML = `
        <button class="lightbox-close-btn" id="btn-close-lightbox" aria-label="Close Lightbox">✕</button>
        <button class="lightbox-btn-nav lightbox-prev-btn" id="btn-lightbox-prev" aria-label="Previous Outfit">‹</button>
        <button class="lightbox-btn-nav lightbox-next-btn" id="btn-lightbox-next" aria-label="Next Outfit">›</button>

        <div class="lightbox-content-box">
          <div class="lightbox-img-viewer" id="lightbox-viewer">
            <img class="lightbox-img-el" id="lightbox-image" src="" alt="Lookbook Item">
          </div>
          <div class="lightbox-sidebar">
            <div>
              <div class="lightbox-top-meta">
                <span class="lightbox-counter-badge" id="lightbox-counter">Look 1 of 315</span>
                <button class="lightbox-zoom-toggle-btn" id="btn-lightbox-zoom">🔍 Click to Zoom</button>
              </div>
              <span class="lightbox-category-tag" id="lightbox-category">Men's Imperial Wear</span>
              <h3 class="lightbox-title" id="lightbox-title">Royal Ivory Zari Sherwani</h3>
              <div class="lightbox-info-box">
                <p>✦ <strong>Showroom Locations:</strong> Shop No. 73, 74 New Market Nakkhas &amp; Tedhi Puliya, Kursi Road, Lucknow</p>
                <p>✦ <strong>Deals Exclusively in:</strong> Suit, Saree, Lehenga, Gown &amp; Kids Wear</p>
                <p>✦ <strong>Trial Room:</strong> Complimentary In-Store Fitting &amp; Styling</p>
                <p style="margin-top: 0.5rem; font-size: 0.8rem; color: var(--accent-gold);">Instagram Archive Look: <strong id="lightbox-sku">@ShyamBandhuAndSons</strong></p>
              </div>
            </div>

            <div class="lightbox-bottom-actions">
              <a href="#" target="_blank" class="btn-lightbox-whatsapp" id="btn-lightbox-whatsapp">
                <span>💬 Enquire About This Outfit on WhatsApp</span>
              </a>
              <a href="#store-location-section" class="btn-lightbox-trial" id="btn-lightbox-trial">
                <span>🏛️ Book In-Store Trial Appointment</span>
              </a>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }

    // Attach Lightbox Controls
    document.getElementById('btn-close-lightbox')?.addEventListener('click', () => this.closeLightbox());
    document.getElementById('btn-lightbox-prev')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.navigateLightbox(-1);
    });
    document.getElementById('btn-lightbox-next')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.navigateLightbox(1);
    });

    // Zoom toggle
    const viewer = document.getElementById('lightbox-viewer');
    viewer?.addEventListener('click', () => {
      this.isZoomed = !this.isZoomed;
      viewer.classList.toggle('zoomed', this.isZoomed);
      const zoomBtn = document.getElementById('btn-lightbox-zoom');
      if (zoomBtn) zoomBtn.textContent = this.isZoomed ? '🔍 Zoom Out' : '🔍 Click to Zoom';
    });

    document.getElementById('btn-lightbox-zoom')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.isZoomed = !this.isZoomed;
      viewer?.classList.toggle('zoomed', this.isZoomed);
      const zoomBtn = document.getElementById('btn-lightbox-zoom');
      if (zoomBtn) zoomBtn.textContent = this.isZoomed ? '🔍 Zoom Out' : '🔍 Click to Zoom';
    });

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target.id === this.lightboxId) {
        this.closeLightbox();
      }
    });

    // Close on book trial
    document.getElementById('btn-lightbox-trial')?.addEventListener('click', () => {
      this.closeLightbox();
      document.getElementById('store-location-section')?.scrollIntoView({ behavior: 'smooth' });
    });

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('active')) return;
      if (e.key === 'Escape') this.closeLightbox();
      if (e.key === 'ArrowLeft') this.navigateLightbox(-1);
      if (e.key === 'ArrowRight') this.navigateLightbox(1);
    });
  }

  openLightbox(index) {
    if (index < 0 || index >= this.filteredItems.length) return;
    this.currentLightboxIndex = index;
    this.isZoomed = false;
    const viewer = document.getElementById('lightbox-viewer');
    if (viewer) viewer.classList.remove('zoomed');

    this.updateLightboxContent();

    const modal = document.getElementById(this.lightboxId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  closeLightbox() {
    const modal = document.getElementById(this.lightboxId);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  navigateLightbox(direction) {
    const total = this.filteredItems.length;
    this.currentLightboxIndex = (this.currentLightboxIndex + direction + total) % total;
    this.isZoomed = false;
    const viewer = document.getElementById('lightbox-viewer');
    if (viewer) viewer.classList.remove('zoomed');
    this.updateLightboxContent();
  }

  updateLightboxContent() {
    const item = this.filteredItems[this.currentLightboxIndex];
    if (!item) return;

    const imgEl = document.getElementById('lightbox-image');
    if (imgEl) imgEl.src = item.src;

    const counterEl = document.getElementById('lightbox-counter');
    if (counterEl) counterEl.textContent = `Look ${this.currentLightboxIndex + 1} of ${this.filteredItems.length}`;

    const titleEl = document.getElementById('lightbox-title');
    if (titleEl) titleEl.textContent = item.title;

    const catEl = document.getElementById('lightbox-category');
    const categoryLabels = {
      men: "MEN'S WEAR • IMPERIAL ATELIER",
      women: "WOMEN'S WEAR • BRIDAL & HANDLOOM SILK",
      kids: "KIDS' WEAR • FESTIVE COLLECTION",
      lookbook: "STORE AMBIANCE & CUSTOMER LOOKBOOK"
    };
    if (catEl) catEl.textContent = categoryLabels[item.category] || 'ROYAL SHOWROOM ARCHIVE';

    const skuEl = document.getElementById('lightbox-sku');
    if (skuEl) skuEl.textContent = item.instagramPost || item.filename;

    const whatsappBtn = document.getElementById('btn-lightbox-whatsapp');
    if (whatsappBtn) {
      const cfg = (typeof StorageEngine !== 'undefined') ? StorageEngine.getStoreConfig() : null;
      const whatsappNum = (cfg && cfg.whatsapp) ? cfg.whatsapp : '919450646328';
      const msg = encodeURIComponent(
        `Hello Shyam Bandhu & Sons (By : Raj Kamal), I saw this look on your Digital Lookbook:\n\n✦ Look: ${item.title}\n✦ Archive Ref: ${item.filename}\n\nIs this outfit or a similar customized design available for an in-store trial at your Lucknow showrooms (Nakkhas / Tedhi Puliya)?`
      );
      whatsappBtn.href = `https://api.whatsapp.com/send?phone=${whatsappNum}&text=${msg}`;
    }
  }
}

// Export / Attach to window
window.ShowroomGallery = ShowroomGallery;
