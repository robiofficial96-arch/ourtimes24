/**
 * OURTIMES24 - ULTRA-PREMIUM DIGITAL NEWSROOM CORE ENGINE (2026)
 * Real Published Articles Repository (324 Posts) + Live Search + Division Filter
 */

const CATEGORIES = [
    { slug: 'national', name: 'জাতীয়' },
    { slug: 'politics', name: 'রাজনীতি' },
    { slug: 'international', name: 'আন্তর্জাতিক' },
    { slug: 'economy', name: 'অর্থ-বাণিজ্য' },
    { slug: 'sports', name: 'খেলাধুলা' },
    { slug: 'entertainment', name: 'বিনোদন' },
    { slug: 'tech', name: 'প্রযুক্তি' },
    { slug: 'saradesh', name: 'সারাদেশ' },
    { slug: 'opinion', name: 'মতামত' }
];

// Data Repository Manager
class NewsRepository {
    constructor() {
        if (!localStorage.getItem('ourtimes_ads_config')) {
            const initialConfig = {
                header: { enabled: false, type: 'image', imageUrl: '', linkUrl: '', code: '' },
                homeMiddle: { enabled: false, type: 'image', imageUrl: '', linkUrl: '', code: '' },
                sidebar: { enabled: false, type: 'image', imageUrl: '', linkUrl: '', code: '' },
                inArticle: { enabled: false, type: 'image', imageUrl: '', linkUrl: '', code: '' }
            };
            localStorage.setItem('ourtimes_ads_config', JSON.stringify(initialConfig));
        }
    }

    getAllNews() {
        try {
            const custom = JSON.parse(localStorage.getItem('ourtimes_news_v2'));
            if (custom && Array.isArray(custom) && custom.length >= 100) {
                return custom;
            }
        } catch (e) {}
        const raw = (typeof window !== 'undefined' && window.RAW_NEWS_DATA) ? window.RAW_NEWS_DATA : (typeof RAW_NEWS_DATA !== 'undefined' ? RAW_NEWS_DATA : []);
        return raw && raw.length > 0 ? raw : [];
    }

    getNewsById(id) {
        return this.getAllNews().find(n => String(n.id) === String(id));
    }

    saveNews(newsItem) {
        const all = this.getAllNews();
        const index = all.findIndex(n => String(n.id) === String(newsItem.id));
        if (index >= 0) {
            all[index] = newsItem;
        } else {
            all.unshift(newsItem);
        }
        localStorage.setItem('ourtimes_news_v2', JSON.stringify(all));
    }

    deleteNews(id) {
        const filtered = this.getAllNews().filter(n => String(n.id) !== String(id));
        localStorage.setItem('ourtimes_news_v2', JSON.stringify(filtered));
    }

    getAdConfig() {
        try {
            const raw = localStorage.getItem('ourtimes_ads_config');
            if (raw) {
                const parsed = JSON.parse(raw);
                return {
                    header: parsed.header || { enabled: false, type: 'image', imageUrl: '', linkUrl: '', code: '' },
                    homeMiddle: parsed.homeMiddle || { enabled: false, type: 'image', imageUrl: '', linkUrl: '', code: '' },
                    sidebar: parsed.sidebar || { enabled: false, type: 'image', imageUrl: '', linkUrl: '', code: '' },
                    inArticle: parsed.inArticle || { enabled: false, type: 'image', imageUrl: '', linkUrl: '', code: '' }
                };
            }
        } catch (e) {}
        return {
            header: { enabled: false, type: 'image', imageUrl: '', linkUrl: '', code: '' },
            homeMiddle: { enabled: false, type: 'image', imageUrl: '', linkUrl: '', code: '' },
            sidebar: { enabled: false, type: 'image', imageUrl: '', linkUrl: '', code: '' },
            inArticle: { enabled: false, type: 'image', imageUrl: '', linkUrl: '', code: '' }
        };
    }

    setAdConfig(config) {
        localStorage.setItem('ourtimes_ads_config', JSON.stringify(config));
    }
}

const NewsDB = new NewsRepository();
if (typeof window !== 'undefined') {
    window.NewsDB = NewsDB;
}

// ==========================================
// 1. BANGLA LIVE DATE & DIGITAL CLOCK
// ==========================================
function initBanglaClock() {
    const banglaDigits = {'0':'০','1':'১','2':'২','3':'৩','4':'৪','5':'৫','6':'৬','7':'৭','8':'৮','9':'৯'};
    const days = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
    const months = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];

    function toBangla(str) {
        return String(str).replace(/[0-9]/g, d => banglaDigits[d]);
    }

    function update() {
        const now = new Date();
        const dayName = days[now.getDay()];
        const date = toBangla(now.getDate());
        const monthName = months[now.getMonth()];
        const year = toBangla(now.getFullYear());
        
        let hours = now.getHours();
        const minutes = toBangla(String(now.getMinutes()).padStart(2, '0'));
        const ampm = hours >= 12 ? 'অপরাহ্ন' : 'পূর্বাহ্ন';
        hours = hours % 12 || 12;
        const banglaHours = toBangla(hours);

        const fullDateString = `${dayName}, ${date} ${monthName} ${year} | ${banglaHours}:${minutes} ${ampm}`;
        
        const elem = document.getElementById('liveBanglaDate');
        if (elem) elem.textContent = fullDateString;
    }

    update();
    setInterval(update, 1000);
}

// ==========================================
// 2. BREAKING NEWS TICKER
// ==========================================
function renderBreakingTicker() {
    const all = NewsDB.getAllNews();
    const breakingNews = all.filter(n => n.isBreaking);
    const displayList = breakingNews.length > 0 ? breakingNews : all.slice(0, 5);
    const tickerContainer = document.getElementById('breakingTickerText');
    if (!tickerContainer) return;

    tickerContainer.innerHTML = displayList.map(n => `
        <a href="article.html?id=${n.id}" style="margin-right: 40px; color: inherit; display: inline-flex; align-items: center; gap: 8px;">
            <span style="color:var(--primary); font-weight:800;">[${n.category}]</span>
            <span>${n.title}</span>
        </a>
    `).join('');
}

// ==========================================
// 3. HOMEPAGE FEEDS RENDERER
// ==========================================
function renderHomepage() {
    const all = NewsDB.getAllNews();
    if (all.length === 0) return;

    // 1. Prothom Alo / International Style Flat Hero Block
    const lead = all.find(n => n.isLead) || all[0];
    const subLeads = all.filter(n => n.id !== lead.id).slice(0, 3);
    const unifiedContainer = document.getElementById('unifiedLeadCard');

    if (unifiedContainer) {
        unifiedContainer.innerHTML = `
            <!-- Top Main Big Lead Story -->
            <div class="lead-story-row">
                <a href="article.html?id=${lead.id}" class="lead-img-box">
                    <img src="${lead.image}" alt="${lead.title}">
                </a>
                <div class="lead-content">
                    <span class="category-tag-inline">${lead.category}</span>
                    <h1 class="lead-title">
                        <a href="article.html?id=${lead.id}">${lead.title}</a>
                    </h1>
                    <p class="lead-excerpt">${lead.excerpt}</p>
                    <div class="lead-meta">
                        <span><i class="fa-regular fa-user"></i> ${lead.author || 'স্টাফ রিপোর্টার'}</span>
                        <span>•</span>
                        <span><i class="fa-regular fa-clock"></i> ${lead.date || 'আজ'}</span>
                    </div>
                </div>
            </div>

            <!-- Sub-leads 3 Cards Grid -->
            <div class="sublead-flat-list">
                ${subLeads.map(n => {
                    const cleanExcerpt = n.excerpt && n.excerpt.length > 110 ? n.excerpt.substring(0, 105).trim() + '...' : (n.excerpt || '');
                    return `
                        <a href="article.html?id=${n.id}" class="sublead-list-row">
                            <div class="sublead-row-img">
                                <img src="${n.image}" alt="${n.title}">
                            </div>
                            <h3 class="sublead-row-title">${n.title}</h3>
                            <p class="sublead-row-excerpt">${cleanExcerpt}</p>
                        </a>
                    `;
                }).join('')}
            </div>
        `;
    }

    // 2. Tabbed Sidebar: Latest & Most Read (Ranked List)
    const latestList = document.getElementById('latestNewsList');
    const mostReadList = document.getElementById('mostReadNewsList');
    const rankDigits = ['১', '২', '৩', '৪', '৫', '৬'];
    const timeLabels = ['৫ মিনিট আগে', '১৫ মিনিট আগে', '৩০ মিনিট আগে', '১ ঘণ্টা আগে', '২ ঘণ্টা আগে', '৩ ঘণ্টা আগে'];

    if (latestList) {
        latestList.innerHTML = all.slice(0, 6).map((n, i) => `
            <li class="ranked-item">
                <a href="article.html?id=${n.id}" class="ranked-item-link">
                    <div class="rank-thumb-wrapper">
                        <span class="rank-badge-overlay">${rankDigits[i] || (i + 1)}</span>
                        <img src="${n.image}" alt="${n.title}">
                    </div>
                    <div class="rank-content">
                        <h4 class="rank-title">${n.title}</h4>
                        <div class="rank-meta">
                            <span><i class="fa-regular fa-clock"></i> ${timeLabels[i] || '১ ঘণ্টা আগে'}</span>
                        </div>
                    </div>
                </a>
            </li>
        `).join('');
    }

    if (mostReadList) {
        const curatedMostRead = [...all].reverse().slice(0, 6);
        mostReadList.innerHTML = curatedMostRead.map((n, i) => `
            <li class="ranked-item">
                <a href="article.html?id=${n.id}" class="ranked-item-link">
                    <div class="rank-thumb-wrapper">
                        <span class="rank-badge-overlay rank-fire">${rankDigits[i] || (i + 1)}</span>
                        <img src="${n.image}" alt="${n.title}">
                    </div>
                    <div class="rank-content">
                        <h4 class="rank-title">${n.title}</h4>
                        <div class="rank-meta">
                            <span style="color:var(--primary); font-weight:700;">${n.category}</span>
                            <span>•</span>
                            <span>জনপ্রিয়</span>
                        </div>
                    </div>
                </a>
            </li>
        `).join('');
    }

    // 3. Category Grids
    renderCategoryGrid('nationalGrid', 'জাতীয়', 4);
    renderCategoryGrid('politicsGrid', 'রাজনীতি', 4);
    renderCategoryGrid('sportsGrid', 'খেলাধুলা', 4);
}

// ==========================================
// 4. SMART CATEGORY GRID RENDERER
// ==========================================
function renderCategoryGrid(containerId, categoryName, limit = 4) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const all = NewsDB.getAllNews();
    if (all.length === 0) return;

    const categoryMap = {
        'জাতীয়': ['জাতীয়', 'অপরাধ', 'আইন-আদালত', 'শিক্ষাঙ্গন', 'national'],
        'সারাদেশ': ['সারাদেশ', 'দেশজুড়ে', 'দেশজুড়ে', 'saradesh'],
        'রাজনীতি': ['রাজনীতি', 'politics'],
        'আন্তর্জাতিক': ['আন্তর্জাতিক', 'প্রবাস খবর', 'international'],
        'অর্থ-বাণিজ্য': ['অর্থ-বাণিজ্য', 'অর্থ ও বাণিজ্য', 'বাণিজ্য', 'economy'],
        'খেলাধুলা': ['খেলাধুলা', 'sports'],
        'বিনোদন': ['বিনোদন', 'জীবনশৈলী', 'entertainment'],
        'প্রযুক্তি': ['প্রযুক্তি', 'tech'],
        'মতামত': ['মতামত', 'opinion']
    };

    const targetList = categoryMap[categoryName] || [categoryName];
    let news = all.filter(n => targetList.includes(n.category) || targetList.includes(n.categorySlug));

    // Supplement from latest news if fewer items so no section is ever empty
    if (news.length < limit) {
        const existingIds = new Set(news.map(n => n.id));
        const filler = all.filter(n => !existingIds.has(n.id));
        news = news.concat(filler.slice(0, limit - news.length));
    }

    const displayItems = news.slice(0, limit);
    container.innerHTML = displayItems.map(n => `
        <div class="news-card-std">
            <a href="article.html?id=${n.id}" class="news-card-img">
                <img src="${n.image}" alt="${n.title}">
                <span class="category-tag">${n.category}</span>
            </a>
            <div class="news-card-body">
                <h3 class="news-card-title">
                    <a href="article.html?id=${n.id}">${n.title}</a>
                </h3>
            </div>
        </div>
    `).join('');
}

// ==========================================
// 5. SARADESH INTERACTIVE DIVISION HUB
// ==========================================
function renderSaradeshGrid(selectedDivision = 'all') {
    const container = document.getElementById('saradeshGridContainer');
    if (!container) return;

    const all = NewsDB.getAllNews();
    const saradeshAliases = ['saradesh', 'সারাদেশ', 'দেশজুড়ে', 'দেশজুড়ে'];
    let news = all.filter(n => saradeshAliases.includes(n.categorySlug) || saradeshAliases.includes(n.category));

    if (selectedDivision !== 'all') {
        const filteredByDiv = news.filter(n => (n.district && n.district.includes(selectedDivision)) || n.title.includes(selectedDivision) || (n.excerpt && n.excerpt.includes(selectedDivision)));
        if (filteredByDiv.length > 0) {
            news = filteredByDiv;
        }
    }

    if (news.length === 0) {
        news = all.slice(6, 12);
    }

    const lead = news[0];
    const subItems = news.slice(1, 5);

    container.innerHTML = `
        <div class="saradesh-split-container">
            <!-- Left Side: Big District Lead News -->
            <div class="saradesh-left-lead">
                <a href="article.html?id=${lead.id}" class="saradesh-left-img-box">
                    <img src="${lead.image}" alt="${lead.title}">
                </a>
                <span class="category-tag-inline"><i class="fa-solid fa-location-dot"></i> ${lead.district || 'জেলা সংবাদ'}</span>
                <h2 class="saradesh-left-title">
                    <a href="article.html?id=${lead.id}">${lead.title}</a>
                </h2>
                <p class="saradesh-left-excerpt">${lead.excerpt || ''}</p>
                <div class="saradesh-left-meta">
                    <span><i class="fa-regular fa-user"></i> ${lead.author || 'জেলা প্রতিনিধি'}</span>
                    <span>•</span>
                    <span><i class="fa-regular fa-clock"></i> ${lead.date || 'আজ'}</span>
                </div>
            </div>

            <!-- Right Side: 2x2 District Grid -->
            <div class="saradesh-right-grid">
                ${subItems.map(n => `
                    <div class="news-card-std">
                        <a href="article.html?id=${n.id}" class="news-card-img">
                            <img src="${n.image}" alt="${n.title}">
                            <span class="category-tag">${n.district || n.category}</span>
                        </a>
                        <div class="news-card-body">
                            <h4 class="news-card-title"><a href="article.html?id=${n.id}">${n.title}</a></h4>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function filterSaradeshByDivision(divisionName, btnElement) {
    if (btnElement) {
        const parent = btnElement.parentElement;
        if (parent) {
            parent.querySelectorAll('.div-chip').forEach(b => b.classList.remove('active'));
        }
        btnElement.classList.add('active');
    }
    renderSaradeshGrid(divisionName);
}

// ==========================================
// 6. INSTANT LIVE SEARCH ENGINE
// ==========================================
function handleLiveSearch(query) {
    const container = document.getElementById('liveSearchResults');
    if (!container) return;

    const q = (query || '').trim().toLowerCase();
    if (!q) {
        container.innerHTML = `
            <div style="padding: 24px; text-align: center; color: var(--text-muted);">
                <i class="fa-solid fa-keyboard" style="font-size: 28px; margin-bottom: 8px; opacity: 0.6;"></i>
                <div>খুঁজতে কিওয়ার্ড লিখুন...</div>
            </div>
        `;
        return;
    }

    const all = NewsDB.getAllNews();
    const results = all.filter(n => {
        return (n.title && n.title.toLowerCase().includes(q)) ||
               (n.category && n.category.toLowerCase().includes(q)) ||
               (n.district && n.district.toLowerCase().includes(q)) ||
               (n.excerpt && n.excerpt.toLowerCase().includes(q));
    }).slice(0, 15);

    if (results.length === 0) {
        container.innerHTML = `
            <div style="padding: 24px; text-align: center; color: var(--text-muted);">
                <i class="fa-solid fa-magnifying-glass-chart" style="font-size: 28px; margin-bottom: 8px; opacity: 0.6;"></i>
                <div>"<strong>${q}</strong>" সম্পর্কিত কোনো সংবাদ পাওয়া যায়নি।</div>
            </div>
        `;
        return;
    }

    container.innerHTML = results.map(n => `
        <a href="article.html?id=${n.id}" class="search-result-item">
            <img src="${n.image}" alt="${n.title}" class="search-result-thumb">
            <div>
                <div class="search-result-title">${n.title}</div>
                <div class="search-result-meta">
                    <span style="color:var(--primary); font-weight:700;">[${n.category}]</span>
                    <span>${n.date || 'আজ'}</span>
                    ${n.district ? `<span>• ${n.district}</span>` : ''}
                </div>
            </div>
        </a>
    `).join('');
}

// ==========================================
// 7. SINGLE ARTICLE PAGE ENGINE
// ==========================================
function renderSingleArticle() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id') || 'news-1522';
    const article = NewsDB.getNewsById(id) || NewsDB.getAllNews()[0];

    if (!article) {
        const cont = document.getElementById('articleContainer');
        if (cont) {
            cont.innerHTML = `
                <h2>সংবাদটি পাওয়া যায়নি!</h2>
                <p><a href="index.html" class="text-primary">হোমপেজে ফিরে যান</a></p>
            `;
        }
        return;
    }

    document.title = `${article.title} - আওয়ার টাইমস২৪`;

    // Dynamic Meta Tags updater for DOM and mobile webviews
    try {
        let fullImgUrl = article.image || '';
        if (fullImgUrl && !fullImgUrl.startsWith('http://') && !fullImgUrl.startsWith('https://')) {
            const domain = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
                ? 'https://ourtimes24.com'
                : window.location.origin;
            fullImgUrl = domain + '/' + fullImgUrl.replace(/^\/+/, '');
        }
        const cleanDesc = (article.excerpt || article.title || '').replace(/<[^>]*>?/gm, '').trim();
        const pageUrl = window.location.href;

        function setOrUpdateMeta(selector, val) {
            let el = document.querySelector(selector);
            if (el) {
                el.setAttribute('content', val);
            } else {
                el = document.createElement('meta');
                if (selector.includes('property=')) {
                    el.setAttribute('property', selector.match(/property=["'](.*?)["']/)[1]);
                } else if (selector.includes('name=')) {
                    el.setAttribute('name', selector.match(/name=["'](.*?)["']/)[1]);
                }
                el.setAttribute('content', val);
                document.head.appendChild(el);
            }
        }

        setOrUpdateMeta('meta[property="og:title"]', article.title);
        setOrUpdateMeta('meta[property="og:description"]', cleanDesc);
        setOrUpdateMeta('meta[property="og:image"]', fullImgUrl);
        setOrUpdateMeta('meta[property="og:image:secure_url"]', fullImgUrl);
        setOrUpdateMeta('meta[property="og:url"]', pageUrl);
        setOrUpdateMeta('meta[name="twitter:title"]', article.title);
        setOrUpdateMeta('meta[name="twitter:description"]', cleanDesc);
        setOrUpdateMeta('meta[name="twitter:image"]', fullImgUrl);
    } catch (e) {
        console.error('Meta update error:', e);
    }

    const elCat = document.getElementById('artCategory');
    const elHead = document.getElementById('artHeadline');
    const elSub = document.getElementById('artSubtitle');
    const elAuth = document.getElementById('artAuthor');
    const elDate = document.getElementById('artDate');
    const elImg = document.getElementById('artImage');
    const elCap = document.getElementById('artCaption');
    const elBody = document.getElementById('artBody');

    if (elCat) elCat.textContent = article.category;
    if (elHead) elHead.textContent = article.title;
    if (elAuth) elAuth.textContent = article.author || 'আওয়ার টাইমস২৪ ডেস্ক';

    // Dynamic Author Avatar / Profile Photo
    const elAvatar = document.getElementById('artAuthorAvatarContainer');
    if (elAvatar) {
        if (article.authorAvatar && article.authorAvatar.trim()) {
            elAvatar.innerHTML = `<img src="${article.authorAvatar}" alt="${escapeHtml(article.author || '')}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
            elAvatar.style.background = 'transparent';
            elAvatar.style.border = '1px solid var(--border-color)';
        } else if (article.author && (article.author.includes('ডেস্ক') || article.author.includes('Ourtimes') || article.author.includes('আওয়ার টাইমস'))) {
            elAvatar.innerHTML = `<i class="fa-solid fa-newspaper" style="color:var(--primary); font-size:18px;"></i>`;
            elAvatar.style.background = 'rgba(192, 6, 18, 0.08)';
            elAvatar.style.border = '1px solid rgba(192, 6, 18, 0.2)';
        } else {
            elAvatar.innerHTML = `<i class="fa-solid fa-user-pen" style="color:var(--primary); font-size:18px;"></i>`;
            elAvatar.style.background = 'var(--bg-subtle)';
            elAvatar.style.border = '1px solid var(--border-color)';
        }
    }
    if (elDate) elDate.textContent = `${article.date || 'আজ'}`;
    if (elImg) elImg.src = article.image;
    if (elCap) elCap.textContent = `${article.title} — ছবি: Ourtimes24`;
    
    if (elBody) {
        let bodyContent = article.content || `<p>${article.excerpt}</p>`;
        
        // Zero Blank Space In-Article Banner Injection
        try {
            const ads = NewsDB.getAdConfig();
            if (ads && ads.inArticle && ads.inArticle.enabled) {
                let adHtml = '';
                if (ads.inArticle.type === 'code' && ads.inArticle.code && ads.inArticle.code.trim()) {
                    adHtml = `
                        <div class="site-ad-wrapper in-article-ad-slot" style="display:block;">
                            <div class="site-ad-container">
                                <span class="site-ad-label">বিজ্ঞাপন</span>
                                <div class="site-ad-code-inner">${ads.inArticle.code}</div>
                            </div>
                        </div>
                    `;
                } else if (ads.inArticle.type === 'image' && ads.inArticle.imageUrl && ads.inArticle.imageUrl.trim()) {
                    const link = ads.inArticle.linkUrl && ads.inArticle.linkUrl.trim() ? ads.inArticle.linkUrl.trim() : '#';
                    adHtml = `
                        <div class="site-ad-wrapper in-article-ad-slot" style="display:block;">
                            <div class="site-ad-container">
                                <span class="site-ad-label">বিজ্ঞাপন</span>
                                <a href="${link}" ${link !== '#' ? 'target="_blank" rel="noopener noreferrer"' : ''}>
                                    <img src="${ads.inArticle.imageUrl}" alt="সংবাদের বিজ্ঞাপন" class="site-ad-img" loading="lazy">
                                </a>
                            </div>
                        </div>
                    `;
                }

                if (adHtml) {
                    const paragraphs = bodyContent.split('</p>');
                    if (paragraphs.length > 2) {
                        paragraphs[1] = paragraphs[1] + '</p>' + adHtml;
                        bodyContent = paragraphs.join('</p>');
                    } else {
                        bodyContent += adHtml;
                    }
                }
            }
        } catch (e) {
            console.error('In-article ad injection error:', e);
        }

        elBody.innerHTML = bodyContent;
    }

    // Render 4 Related Articles
    const relatedList = document.getElementById('relatedNewsGrid');
    if (relatedList) {
        const related = NewsDB.getAllNews()
            .filter(n => String(n.id) !== String(article.id) && (n.category === article.category || n.categorySlug === article.categorySlug))
            .slice(0, 4);

        relatedList.innerHTML = related.map(n => `
            <div class="news-card-std">
                <a href="article.html?id=${n.id}" class="news-card-img">
                    <img src="${n.image}" alt="${n.title}">
                    <span class="category-tag">${n.category}</span>
                </a>
                <div class="news-card-body">
                    <h3 class="news-card-title">
                        <a href="article.html?id=${n.id}">${n.title}</a>
                    </h3>
                </div>
            </div>
        `).join('');
    }
}

// Reading Progress Bar
window.addEventListener('scroll', () => {
    const bar = document.getElementById('readingProgressBar');
    if (!bar) return;
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    bar.style.width = scrolled + "%";
});

// Text-to-Speech Bangla Reader
let isSpeaking = false;
function toggleSpeechReader() {
    if (!('speechSynthesis' in window)) {
        alert('আপনার ব্রাউজার টেক্সট-টু-স্পিচ সমর্থন করে না।');
        return;
    }

    const btn = document.getElementById('btnListenAudio');
    if (isSpeaking) {
        window.speechSynthesis.cancel();
        isSpeaking = false;
        if (btn) btn.innerHTML = `<i class="fa-solid fa-volume-high"></i> খবর শুনুন`;
    } else {
        const headline = document.getElementById('artHeadline')?.textContent || '';
        const body = document.getElementById('artBody')?.innerText || '';
        const utterance = new SpeechSynthesisUtterance(`${headline}। ${body}`);
        utterance.lang = 'bn-BD';
        utterance.rate = 0.95;

        utterance.onend = () => {
            isSpeaking = false;
            if (btn) btn.innerHTML = `<i class="fa-solid fa-volume-high"></i> খবর শুনুন`;
        };

        window.speechSynthesis.speak(utterance);
        isSpeaking = true;
        if (btn) btn.innerHTML = `<i class="fa-solid fa-stop"></i> বন্ধ করুন`;
    }
}

// Font Zoom
function adjustFontSize(delta) {
    const bodyContent = document.getElementById('artBody');
    if (!bodyContent) return;
    const currentSize = parseFloat(window.getComputedStyle(bodyContent).fontSize);
    const newSize = Math.max(15, Math.min(26, currentSize + delta));
    bodyContent.style.fontSize = `${newSize}px`;
}

// Theme Toggle
function updateThemeUI(theme) {
    const icons = document.querySelectorAll('.theme-switch-icon, #themeIcon');
    icons.forEach(icon => {
        icon.className = theme === 'dark' ? 'fa-solid fa-sun theme-switch-icon' : 'fa-solid fa-moon theme-switch-icon';
    });
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('ourtimes_theme', next);
    updateThemeUI(next);
}

// Offcanvas Drawer Menu
function toggleOffcanvasMenu() {
    const drawer = document.getElementById('offcanvasDrawer');
    const backdrop = document.getElementById('offcanvasBackdrop');
    if (!drawer || !backdrop) return;

    const isActive = drawer.classList.contains('active');
    if (isActive) {
        closeOffcanvasMenu();
    } else {
        drawer.classList.add('active');
        backdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeOffcanvasMenu() {
    const drawer = document.getElementById('offcanvasDrawer');
    const backdrop = document.getElementById('offcanvasBackdrop');
    if (drawer) drawer.classList.remove('active');
    if (backdrop) backdrop.classList.remove('active');
    document.body.style.overflow = '';
}

// Share Functions
function shareToPlatform(platform) {
    let currentUrl = window.location.href;
    // If tested on localhost, replace origin with live production domain so Facebook/WhatsApp scrapers work!
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        currentUrl = currentUrl.replace(/^http:\/\/[^/]+/, 'https://ourtimes24.com');
    }

    const url = encodeURIComponent(currentUrl);
    const title = encodeURIComponent(document.title);

    if (platform === 'facebook') {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=450');
    } else if (platform === 'whatsapp') {
        window.open(`https://api.whatsapp.com/send?text=${title}%0A${url}`, '_blank');
    } else if (platform === 'twitter') {
        window.open(`https://twitter.com/intent/tweet?text=${title}&url=${url}`, '_blank', 'width=600,height=450');
    } else if (platform === 'copy') {
        navigator.clipboard.writeText(currentUrl).then(() => {
            alert('সংবাদের লিঙ্ক সফলভাবে কপি করা হয়েছে!');
        }).catch(() => {
            prompt('লিঙ্কটি কপি করুন:', currentUrl);
        });
    }
}

// ==========================================
// 10. SMART AD BANNER RENDERING ENGINE (ZERO BLANK SPACE)
// ==========================================
function renderSiteAds() {
    if (typeof NewsDB === 'undefined' || !NewsDB.getAdConfig) return;
    const ads = NewsDB.getAdConfig();

    function buildAdElement(slotData, altText) {
        if (!slotData || !slotData.enabled) return '';
        if (slotData.type === 'code' && slotData.code && slotData.code.trim()) {
            return `
                <div class="site-ad-container">
                    <span class="site-ad-label">বিজ্ঞাপন</span>
                    <div class="site-ad-code-inner">${slotData.code}</div>
                </div>
            `;
        }
        if (slotData.type === 'image' && slotData.imageUrl && slotData.imageUrl.trim()) {
            const link = slotData.linkUrl && slotData.linkUrl.trim() ? slotData.linkUrl.trim() : '#';
            return `
                <div class="site-ad-container">
                    <span class="site-ad-label">বিজ্ঞাপন</span>
                    <a href="${link}" ${link !== '#' ? 'target="_blank" rel="noopener noreferrer"' : ''}>
                        <img src="${slotData.imageUrl}" alt="${altText}" class="site-ad-img" loading="lazy">
                    </a>
                </div>
            `;
        }
        return '';
    }

    // 1. Header Slot
    const headerSlot = document.getElementById('headerAdSlot');
    if (headerSlot) {
        const html = buildAdElement(ads.header, 'Header Banner');
        if (html) {
            headerSlot.innerHTML = html;
            headerSlot.style.display = 'block';
        } else {
            headerSlot.innerHTML = '';
            headerSlot.style.display = 'none';
        }
    }

    // 2. Homepage Middle Slot
    const homeMiddleSlot = document.getElementById('homepageMiddleAdSlot');
    if (homeMiddleSlot) {
        const html = buildAdElement(ads.homeMiddle, 'Homepage Middle Banner');
        if (html) {
            homeMiddleSlot.innerHTML = html;
            homeMiddleSlot.style.display = 'block';
        } else {
            homeMiddleSlot.innerHTML = '';
            homeMiddleSlot.style.display = 'none';
        }
    }

    // 3. Sidebar Slot
    const sidebarSlot = document.getElementById('sidebarAdSlot');
    if (sidebarSlot) {
        const html = buildAdElement(ads.sidebar, 'Sidebar Banner');
        if (html) {
            sidebarSlot.innerHTML = html;
            sidebarSlot.style.display = 'block';
        } else {
            sidebarSlot.innerHTML = '';
            sidebarSlot.style.display = 'none';
        }
    }
}

// Expose Global Helper Functions
if (typeof window !== 'undefined') {
    window.renderHomepage = renderHomepage;
    window.renderCategoryGrid = renderCategoryGrid;
    window.renderSaradeshGrid = renderSaradeshGrid;
    window.filterSaradeshByDivision = filterSaradeshByDivision;
    window.handleLiveSearch = handleLiveSearch;
    window.renderSingleArticle = renderSingleArticle;
    window.toggleTheme = toggleTheme;
    window.toggleOffcanvasMenu = toggleOffcanvasMenu;
    window.closeOffcanvasMenu = closeOffcanvasMenu;
    window.renderSiteAds = renderSiteAds;
    window.shareToPlatform = shareToPlatform;
}

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('ourtimes_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeUI(savedTheme);

    initBanglaClock();
    renderBreakingTicker();
    renderSiteAds();

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.tab;
            const container = btn.closest('.flat-sidebar-block') || document;
            container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            container.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            const panel = document.getElementById(target);
            if (panel) panel.classList.add('active');
        });
    });
});
