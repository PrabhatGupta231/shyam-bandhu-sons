/**
 * Shyam Bandhu & Sons - Offline Showroom & Digital Lookbook Engine
 * Fully Dynamic, Localized, Luxury Family Fashion Showroom
 */

document.addEventListener('DOMContentLoaded', () => {
  // Load dynamic data from StorageEngine (or fallback to defaults)
  const config = StorageEngine.getStoreConfig();
  const heroSlides = StorageEngine.getHeroSlides();
  let catalogItems = StorageEngine.getCatalog();
  const galleryItems = StorageEngine.getGallery();
  const articles = StorageEngine.getArticles();

  // Application State - Prioritize Women's Wear
  const state = {
    activeCategory: 'women', // Default to Women's Wear top priority
    activeSubCat: 'all',
    heroSlideIndex: 0
  };

  /* ==========================================================================
     POPULATE STORE CONFIG IN DOM
     ========================================================================== */
  function applyStoreConfig() {
    // Announcement
    const annEl = document.getElementById('announcement-text');
    if (annEl) annEl.textContent = config.announcement;

    // Brand Name & Tagline (Preserves Custom Royal Lockup & Single-Line Logo)
    const singleNameEl = document.querySelector('.brand-name-single');
    if (singleNameEl) {
      singleNameEl.textContent = "Shyam Bandhu & Sons";
    }
    const bylineEl = document.querySelector('.brand-byline');
    if (bylineEl) {
      bylineEl.textContent = "By : Raj Kamal";
    }

    const tagEl = document.getElementById('brand-tagline-text');
    if (tagEl) tagEl.textContent = config.tagline;

    // Contact Numbers
    document.querySelectorAll('.store-phone-display').forEach(el => {
      el.textContent = config.phone;
    });
    document.querySelectorAll('.store-phone-link').forEach(el => {
      el.href = `tel:${config.phone.replace(/[^0-9+]/g, '')}`;
    });

    // Store Timings
    document.querySelectorAll('.store-timings-display').forEach(el => {
      el.textContent = config.timings;
    });

    // Store Address
    document.querySelectorAll('.store-address-display').forEach(el => {
      el.textContent = config.address;
    });

    // Google Maps Link
    document.querySelectorAll('.store-map-link').forEach(el => {
      el.href = config.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(config.address)}`;
    });

    // WhatsApp Links
    document.querySelectorAll('.btn-general-whatsapp').forEach(btn => {
      btn.href = `https://api.whatsapp.com/send?phone=${config.whatsapp}&text=${encodeURIComponent('Hello Shyam Bandhu & Sons, I would like to enquire about visiting your family fashion showroom.')}`;
    });

    // Instagram links
    document.querySelectorAll('.instagram-link').forEach(el => {
      el.href = config.instagram;
    });
    document.querySelectorAll('.instagram-handle-display').forEach(el => {
      el.textContent = config.instagramHandle || '@ShyamBandhuAndSons';
    });

    // Flagship Showroom Showcase Image
    const flagshipImg = document.getElementById('flagship-showcase-img') || document.querySelector('.flagship-main-img');
    if (flagshipImg && config.showroomImage) {
      flagshipImg.src = config.showroomImage;
    }
  }

  /* ==========================================================================
     TOAST NOTIFICATIONS
     ========================================================================== */
  function showToast(message, icon = '✦') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.innerHTML = `<span style="color: var(--accent-gold); font-weight: bold;">${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  /* ==========================================================================
     HERO CAROUSEL
     ========================================================================== */
  function renderHeroSlider() {
    const track = document.getElementById('hero-slider-track');
    const dotsContainer = document.getElementById('hero-dots-container');
    if (!track) return;

    track.innerHTML = heroSlides.map((slide, idx) => `
      <div class="hero-slide ${idx === 0 ? 'active' : ''}">
        <img class="hero-slide-bg" src="${slide.image}" alt="${slide.title}">
        <div class="hero-overlay"></div>
        <div class="hero-slide-container">
          <div class="hero-content">
            <span class="hero-subtitle">${slide.subtitle}</span>
            <h1 class="hero-title">${slide.title}</h1>
            <p class="hero-desc">${slide.description}</p>
            <div class="hero-actions">
              <a href="#collections-section" class="btn-hero-primary">Explore Collections</a>
              <a href="#store-location-section" class="btn-hero-outline">Get Store Directions</a>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    if (dotsContainer) {
      dotsContainer.innerHTML = heroSlides.map((_, idx) => `
        <div class="hero-dot ${idx === 0 ? 'active' : ''}" data-idx="${idx}"></div>
      `).join('');
    }

    attachHeroListeners();
  }

  let heroInterval = null;
  function showHeroSlide(index) {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-dot');
    if (slides.length === 0) return;
    state.heroSlideIndex = (index + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle('active', i === state.heroSlideIndex));
    dots.forEach((d, i) => d.classList.toggle('active', i === state.heroSlideIndex));
  }

  function startHeroTimer() {
    if (heroInterval) clearInterval(heroInterval);
    heroInterval = setInterval(() => {
      showHeroSlide(state.heroSlideIndex + 1);
    }, 6000);
  }

  function attachHeroListeners() {
    document.getElementById('hero-prev-btn')?.addEventListener('click', () => {
      showHeroSlide(state.heroSlideIndex - 1);
      startHeroTimer();
    });
    document.getElementById('hero-next-btn')?.addEventListener('click', () => {
      showHeroSlide(state.heroSlideIndex + 1);
      startHeroTimer();
    });

    document.querySelectorAll('.hero-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        showHeroSlide(Number(dot.getAttribute('data-idx')));
        startHeroTimer();
      });
    });

    startHeroTimer();
  }

  /* ==========================================================================
     SUB-CATEGORY CHIPS DEFINITION
     ========================================================================== */
  const subCategoryMap = {
    all: ['All Collections', 'Sherwanis', 'Bridal Lehengas', 'Designer Sarees', 'Suits & Tuxedos', 'Kurta Sets', 'Kids Wear'],
    men: ['All Men\'s Wear', 'Sherwanis', 'Suits & Tuxedos', 'Kurta Sets', 'Casuals & Indo-Western'],
    women: ['All Women\'s Wear', 'Bridal Lehengas', 'Designer Sarees', 'Suits & Anarkalis', 'Western & Indo-Western'],
    kids: ['All Kids\' Wear', 'Boys\' Festive Wear', 'Girls\' Ethnic Lehengas', 'Girls\' Party Wear']
  };

  function renderSubCategoryChips() {
    const container = document.getElementById('subcat-chips-bar');
    if (!container) return;

    const list = subCategoryMap[state.activeCategory] || subCategoryMap.all;

    container.innerHTML = list.map((sub, idx) => `
      <button class="subcat-chip-btn ${idx === 0 ? 'active' : ''}" data-subcat="${idx === 0 ? 'all' : sub}">
        ${sub}
      </button>
    `).join('');

    container.querySelectorAll('.subcat-chip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.subcat-chip-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.activeSubCat = btn.getAttribute('data-subcat');
        renderCatalog();
      });
    });
  }

  /* ==========================================================================
     CATALOG RENDERING (Men, Women, Kids)
     ========================================================================== */
  function getFilteredItems() {
    return catalogItems.filter(item => {
      // Main family category filter
      if (state.activeCategory !== 'all' && item.category !== state.activeCategory) {
        return false;
      }
      // Subcategory filter
      if (state.activeSubCat !== 'all' && item.subCategory !== state.activeSubCat) {
        return false;
      }
      return true;
    });
  }

  function renderCatalog() {
    const grid = document.getElementById('catalog-grid');
    const countEl = document.getElementById('catalog-count-display');
    if (!grid) return;

    const items = getFilteredItems();

    if (countEl) {
      countEl.textContent = `Showing ${items.length} showroom creations on display`;
    }

    if (items.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
          <h3 style="font-family: var(--font-serif); font-size: 1.5rem; margin-bottom: 0.5rem;">No creations in this section</h3>
          <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">Fresh arrivals arrive weekly in our showroom. Visit us or ask on WhatsApp.</p>
          <button id="btn-reset-catalog" class="btn-hero-primary" style="margin: 0 auto;">Show All Creations</button>
        </div>
      `;
      document.getElementById('btn-reset-catalog')?.addEventListener('click', () => {
        state.activeCategory = 'all';
        state.activeSubCat = 'all';
        document.querySelectorAll('.family-tab-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-category') === 'all'));
        renderSubCategoryChips();
        renderCatalog();
      });
      return;
    }

    grid.innerHTML = items.map(item => {
      const whatsappMsg = encodeURIComponent(
        `Hello Shyam Bandhu & Sons, I saw "${item.name}" (SKU: ${item.sku}) on your Lookbook. Is this available to try in your showroom?`
      );
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${config.whatsapp}&text=${whatsappMsg}`;

      return `
        <div class="catalog-card" data-id="${item.id}">
          <div class="card-img-box" data-id="${item.id}">
            <span class="card-status-badge">${item.status || 'Available in Store'}</span>
            <span class="card-subcat-badge">${item.subCategory}</span>
            <img class="card-img-primary" src="${item.images[0]}" alt="${item.name}" loading="lazy">
          </div>
          <div class="card-info">
            <h3 class="card-title">${item.name}</h3>
            <p class="card-fabric">✦ Fabric: ${item.fabric}</p>
            <div class="card-sizes-row">
              <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Sizes:</span>
              ${item.sizes.slice(0, 3).map(s => `<span class="size-pill">${s}</span>`).join('')}
              ${item.sizes.length > 3 ? `<span class="size-pill">+${item.sizes.length - 3}</span>` : ''}
            </div>
            <div class="card-actions">
              <a href="${whatsappUrl}" target="_blank" class="btn-card-whatsapp" title="Ask Availability on WhatsApp">
                <span>💬 WhatsApp</span>
              </a>
              <button class="btn-card-details btn-open-detail" data-id="${item.id}">
                <span>View Details</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach click listeners to open detail modal
    grid.querySelectorAll('.card-img-box, .btn-open-detail').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        openDetailModal(el.getAttribute('data-id'));
      });
    });
  }

  /* ==========================================================================
     DETAIL MODAL (No Prices, Only Fabric & In-Store Size Details)
     ========================================================================== */
  function openDetailModal(itemId) {
    const item = catalogItems.find(x => x.id === itemId);
    if (!item) return;

    const modal = document.getElementById('detail-modal');
    const container = document.getElementById('detail-modal-container');
    if (!modal || !container) return;

    const whatsappMsg = encodeURIComponent(
      `Hello Shyam Bandhu & Sons, I would like to check in-store availability for "${item.name}" (SKU: ${item.sku}) in fabric "${item.fabric}". Please let me know trial room availability.`
    );
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${config.whatsapp}&text=${whatsappMsg}`;

    container.innerHTML = `
      <div class="detail-modal-card">
        <button class="modal-close-btn" id="btn-close-modal">✕</button>
        <div class="modal-gallery-col">
          <img class="modal-main-img" id="modal-main-image-el" src="${item.images[0]}" alt="${item.name}">
          ${item.images.length > 1 ? `
            <div style="position: absolute; bottom: 1rem; left: 1rem; display: flex; gap: 0.5rem; z-index: 5;">
              ${item.images.map((img, idx) => `
                <img src="${img}" style="width: 44px; height: 55px; object-fit: cover; border-radius: 2px; cursor: pointer; border: 2px solid ${idx === 0 ? 'var(--accent-gold)' : '#FFFFFF'}; box-shadow: 0 2px 6px rgba(0,0,0,0.3);" class="modal-thumb-img" data-src="${img}">
              `).join('')}
            </div>
          ` : ''}
        </div>
        <div class="modal-details-col">
          <span class="modal-category-tag">${item.category.toUpperCase()}’S WEAR • ${item.subCategory}</span>
          <h2 class="modal-title">${item.name}</h2>
          <div class="modal-sku-row">
            <span>SKU: <strong>${item.sku}</strong></span>
            <span>•</span>
            <span class="modal-status-pill">✦ ${item.status || 'In Showroom Stock'}</span>
          </div>

          <p class="modal-desc">${item.description}</p>

          <div class="spec-box">
            <div class="spec-title">Fabric &amp; Craftsmanship</div>
            <div class="spec-val">${item.fabric}</div>
          </div>

          <div class="modal-sizes-box">
            <div class="modal-sizes-title">Available In-Store Sizes:</div>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              ${item.sizes.map(s => `<span class="size-pill" style="padding: 0.4rem 0.8rem; font-size: 0.82rem;">${s}</span>`).join('')}
            </div>
            <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem;">
              ✂️ <em>Complimentary alteration and custom fitting available by our in-house master tailors.</em>
            </p>
          </div>

          <div class="modal-action-buttons">
            <a href="${whatsappUrl}" target="_blank" class="btn-modal-whatsapp">
              <span>💬 Ask Availability on WhatsApp</span>
            </a>
            <button class="btn-modal-trial" id="btn-modal-book-trial">
              <span>🏛️ Book In-Store Trial Appointment</span>
            </button>
          </div>
        </div>
      </div>
    `;

    modal.classList.add('active');

    // Thumbnail switcher
    container.querySelectorAll('.modal-thumb-img').forEach(thumb => {
      thumb.addEventListener('click', () => {
        container.querySelectorAll('.modal-thumb-img').forEach(t => t.style.borderColor = '#FFFFFF');
        thumb.style.borderColor = 'var(--accent-gold)';
        const main = document.getElementById('modal-main-image-el');
        if (main) main.src = thumb.getAttribute('data-src');
      });
    });

    // Close button
    document.getElementById('btn-close-modal')?.addEventListener('click', () => {
      modal.classList.remove('active');
    });

    // Book trial click
    document.getElementById('btn-modal-book-trial')?.addEventListener('click', () => {
      modal.classList.remove('active');
      document.getElementById('store-location-section')?.scrollIntoView({ behavior: 'smooth' });
      const interestInput = document.getElementById('appt-interest-input');
      if (interestInput) interestInput.value = `${item.name} (${item.sku})`;
      showToast(`Selected "${item.name}" for your showroom trial appointment.`);
    });
  }

  // Close modal when clicking backdrop
  document.getElementById('detail-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'detail-modal') {
      document.getElementById('detail-modal')?.classList.remove('active');
    }
  });

  /* ==========================================================================
     GALLERY & INSTAGRAM REELS RENDERING (Modern Masonry & Lightbox)
     ========================================================================== */
  function renderGallery() {
    if (window.ShowroomGallery && document.getElementById('home-gallery-masonry-grid')) {
      new ShowroomGallery({
        containerId: 'home-gallery-masonry-grid',
        filterTabsId: 'home-gallery-filter-tabs',
        lightboxId: 'home-lightbox-modal',
        maxItems: 16,
        limit: 16,
        defaultCategory: 'women'
      });
      return;
    }

    const grid = document.getElementById('gallery-grid');
    if (!grid) return;

    grid.innerHTML = galleryItems.map(item => `
      <div class="gallery-card">
        <img src="${item.image}" alt="${item.title}" loading="lazy">
        <div class="gallery-overlay">
          <span class="gallery-type-tag">✦ ${item.type.toUpperCase()}</span>
          <h4 class="gallery-title">${item.title}</h4>
          <p class="gallery-sub">${item.subtitle}</p>
          <span class="gallery-likes-badge">❤️ ${item.likes}</span>
        </div>
      </div>
    `).join('');
  }

  /* ==========================================================================
     ARTICLES & STYLE GUIDES RENDERING
     ========================================================================== */
  function renderArticles() {
    const grid = document.getElementById('articles-grid');
    if (!grid) return;

    grid.innerHTML = articles.map(art => `
      <article class="article-card">
        <div class="article-img-box">
          <img src="${art.image}" alt="${art.title}" loading="lazy">
        </div>
        <div class="article-body">
          <div class="article-meta">
            <span>${art.category}</span> • <span>${art.readTime}</span>
          </div>
          <h3 class="article-title">${art.title}</h3>
          <p class="article-excerpt">${art.excerpt}</p>
          <span class="article-link btn-read-article" data-id="${art.id}">Read Full Article →</span>
        </div>
      </article>
    `).join('');

    grid.querySelectorAll('.btn-read-article').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const art = articles.find(x => x.id === id);
        if (art) {
          alert(`${art.title}\n\nCategory: ${art.category} (${art.date})\n\n${art.excerpt}\n\nFor personal styling consultations on this trend, visit Shyam Bandhu & Sons showroom or speak to our master karigars.`);
        }
      });
    });
  }

  /* ==========================================================================
     FAMILY CATEGORY TABS (Home / Men / Women / Kids)
     ========================================================================== */
  document.querySelectorAll('.family-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.family-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeCategory = btn.getAttribute('data-category');
      state.activeSubCat = 'all';
      renderSubCategoryChips();
      renderCatalog();
    });
  });

  // Navigation Links filtering
  document.querySelectorAll('.nav-filter-link').forEach(link => {
    link.addEventListener('click', (e) => {
      const cat = link.getAttribute('data-category');
      if (cat) {
        state.activeCategory = cat;
        state.activeSubCat = 'all';
        document.querySelectorAll('.family-tab-btn').forEach(b => {
          b.classList.toggle('active', b.getAttribute('data-category') === cat);
        });
        renderSubCategoryChips();
        renderCatalog();
      }
    });
  });

  /* ==========================================================================
     STORE APPOINTMENT FORM SUBMISSION
     ========================================================================== */
  document.getElementById('store-appointment-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('appt-name-input')?.value || 'Client';
    const phone = document.getElementById('appt-phone-input')?.value || '';
    const date = document.getElementById('appt-date-input')?.value || 'Upcoming Date';
    const branch = document.getElementById('appt-branch-input')?.value || (config.branch1 ? `${config.branch1.name} (${config.branch1.address})` : config.address);
    const section = document.getElementById('appt-section-input')?.value || 'All Sections';
    const code = 'SBS-SHOWROOM-' + Math.floor(1000 + Math.random() * 9000);

    const formBox = document.getElementById('appointment-form-box');
    if (formBox) {
      formBox.innerHTML = `
        <div style="text-align: center; padding: 2rem 1rem;">
          <div style="width: 64px; height: 64px; background: #E8F5E9; color: #2E7D32; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 1.25rem;">✓</div>
          <span style="font-size: 0.75rem; letter-spacing: 0.25em; text-transform: uppercase; color: var(--accent-gold-dark); font-weight: 700;">Showroom Visit Confirmed</span>
          <h3 style="font-family: var(--font-serif); font-size: 2rem; margin: 0.5rem 0 1rem;">Welcome, ${name}</h3>
          <p style="font-size: 0.95rem; color: var(--text-secondary); margin-bottom: 1.5rem; line-height: 1.6;">
            Your private family fashion viewing appointment has been reserved for <strong>${date}</strong> (${section}). Your booking code is <strong>#${code}</strong>.
          </p>
          <div style="background: #FFFFFF; border: 1px solid var(--border-light); padding: 1.25rem; border-radius: 4px; text-align: left; font-size: 0.88rem; margin-bottom: 1.5rem;">
            <p style="margin-bottom: 0.4rem;">✦ <strong>Selected Showroom:</strong> ${branch}</p>
            <p style="margin-bottom: 0.4rem;">✦ <strong>Timings:</strong> ${config.timings}</p>
            <p style="margin-top: 0.5rem; color: var(--accent-emerald);">✦ A dedicated personal floor stylist has been notified and will keep complimentary trial rooms ready for you and your family.</p>
          </div>
          <a href="https://api.whatsapp.com/send?phone=${config.whatsapp}&text=${encodeURIComponent(`Hello Shyam Bandhu & Sons, I booked showroom appointment #${code} for ${name} at ${branch} on ${date}. Please confirm.`)}" target="_blank" class="btn-card-whatsapp" style="display: inline-flex; padding: 0.85rem 1.75rem; font-size: 0.85rem;">
            <span>💬 Send Confirmation on WhatsApp</span>
          </a>
        </div>
      `;
    }

    showToast(`Showroom Trial Reserved: Code #${code}`, '🏛️');
  });

  /* ==========================================================================
     STICKY HEADER SCROLL EFFECT & MOBILE MENU
     ========================================================================== */
  window.addEventListener('scroll', () => {
    const header = document.querySelector('.site-header');
    if (header) {
      header.classList.toggle('scrolled', window.scrollY > 40);
    }
  });

  const mobileBtn = document.getElementById('mobile-menu-btn');
  const mobileNav = document.getElementById('mobile-nav-drawer');
  const mobileClose = document.getElementById('mobile-nav-close');

  if (mobileBtn && mobileNav) {
    mobileBtn.addEventListener('click', () => {
      mobileNav.style.display = 'block';
    });
    mobileClose?.addEventListener('click', () => {
      mobileNav.style.display = 'none';
    });
    mobileNav.addEventListener('click', (e) => {
      if (e.target === mobileNav) mobileNav.style.display = 'none';
    });
    mobileNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileNav.style.display = 'none';
      });
    });
  }

  /* ==========================================================================
     CINEMATIC AUTOPLAY VIDEO REEL CONTROLS (Sound & Playback)
     ========================================================================== */
  const heroVideo = document.getElementById('hero-showroom-video');
  const btnToggleSound = document.getElementById('btn-toggle-video-sound');
  const soundIcon = document.getElementById('sound-icon');
  const soundText = document.getElementById('sound-text');
  const btnTogglePlay = document.getElementById('btn-toggle-video-play');
  const playIcon = document.getElementById('play-icon');
  const playText = document.getElementById('play-text');

  if (heroVideo) {
    heroVideo.play().catch(() => {});

    if (btnToggleSound) {
      btnToggleSound.addEventListener('click', () => {
        heroVideo.muted = !heroVideo.muted;
        if (heroVideo.muted) {
          if (soundIcon) soundIcon.textContent = '🔇';
          if (soundText) soundText.textContent = 'Sound Off';
        } else {
          if (soundIcon) soundIcon.textContent = '🔊';
          if (soundText) soundText.textContent = 'Sound On';
        }
      });
    }

    if (btnTogglePlay) {
      btnTogglePlay.addEventListener('click', () => {
        if (heroVideo.paused) {
          heroVideo.play();
          if (playIcon) playIcon.textContent = '⏸';
          if (playText) playText.textContent = 'Playing';
        } else {
          heroVideo.pause();
          if (playIcon) playIcon.textContent = '▶';
          if (playText) playText.textContent = 'Paused';
        }
      });
    }
  }

  /* ==========================================================================
     SHOWROOM REELS & VIDEO SHOWCASE ENGINE (Clean 9:16 Auto-Playing Video Grid)
     ========================================================================== */
  let activeReelsList = [];
  let currentReelsCategory = 'all';

  async function loadShowroomReels() {
    const grid = document.getElementById('reels-showcase-grid');
    if (!grid) return;

    try {
      const res = await fetch('/api/reels');
      if (res.ok) {
        const data = await res.json();
        activeReelsList = Array.isArray(data) ? data.filter(x => x.active !== false) : [];
      }
    } catch (e) {
      console.warn('Could not fetch reels API:', e);
    }

    renderShowroomReels();
    setupReelsFilters();
  }

  function renderShowroomReels() {
    const grid = document.getElementById('reels-showcase-grid');
    if (!grid) return;

    let items = activeReelsList;
    if (currentReelsCategory !== 'all') {
      items = items.filter(x => (x.category || '').toLowerCase() === currentReelsCategory);
    }

    const countAllEl = document.getElementById('reels-count-all');
    if (countAllEl) countAllEl.textContent = activeReelsList.length;

    if (items.length === 0) {
      grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: #888; padding: 3rem;">No reels in this category right now. Explore other collections above!</div>';
      return;
    }

    grid.innerHTML = items.map((reel, index) => {
      const isVideoFile = (u) => u && (/\.(mp4|webm|mov)(\?.*)?$/i.test(u) || u.startsWith('public/videos/') || u.startsWith('/api/reels/stream/'));
      const hasDirectVideo = Boolean(reel.directVideoUrl && isVideoFile(reel.directVideoUrl));
      const categoryLabel = (reel.category || 'bridal').toUpperCase();
      const whatsappMsg = `Hello Shyam Bandhu & Sons (By : Raj Kamal), I would like to enquire about this Showroom Reel: "${reel.title || 'Haute Couture Look'}"`;
      const whatsappUrl = `https://api.whatsapp.com/send?phone=919450646328&text=${encodeURIComponent(whatsappMsg)}`;

      let mediaHtml = '';
      if (hasDirectVideo) {
        mediaHtml = `
          <button type="button" class="reel-mute-btn" data-target="reel-vid-${index}" aria-label="Toggle Audio" title="Mute/Unmute">🔇</button>
          <video class="reel-video-element" id="reel-vid-${index}" autoplay muted loop playsinline preload="auto" style="position: absolute !important; top: 0 !important; left: 0 !important; inset: 0; width: 100% !important; height: 100% !important; max-height: none !important; object-fit: cover !important; z-index: 1;">
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
          <video class="reel-video-element" id="reel-vid-${index}" autoplay muted loop playsinline preload="auto" style="position: absolute !important; top: 0 !important; left: 0 !important; inset: 0; width: 100% !important; height: 100% !important; max-height: none !important; object-fit: cover !important; z-index: 1;">
            <source src="${reel.url}" type="video/mp4">
          </video>
        `;
      }

      return `
        <div class="reel-card" data-reel-id="${reel.id}">
          <span class="reel-cat-badge">${categoryLabel}</span>
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
      vid.addEventListener('error', (e) => {
        console.warn('Reel video could not be played:', vid.currentSrc || vid.src);
      });
    });

    // Attach Mute/Unmute listeners
    grid.querySelectorAll('.reel-mute-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetId = btn.getAttribute('data-target');
        const video = document.getElementById(targetId);
        if (video) {
          video.muted = !video.muted;
          btn.textContent = video.muted ? '🔇' : '🔊';
        }
      });
    });
  }

  function setupReelsFilters() {
    const filterBar = document.getElementById('reels-filter-bar');
    if (!filterBar) return;

    filterBar.querySelectorAll('.reel-filter-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        filterBar.querySelectorAll('.reel-filter-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentReelsCategory = btn.getAttribute('data-cat') || 'all';
        renderShowroomReels();
      });
    });
  }

  /* ==========================================================================
     INITIALIZE EVERYTHING
     ========================================================================== */
  applyStoreConfig();
  renderHeroSlider();
  renderSubCategoryChips();
  renderCatalog();
  renderGallery();
  loadShowroomReels();
  renderArticles();
});
