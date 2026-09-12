/**
 * OURTIMES24 - ULTRA-PREMIUM DIGITAL NEWSROOM CORE ENGINE (2026)
 * Comprehensive 90+ News Dataset across all categories
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

// RAW_NEWS_DATA is provided by news_data.js (324 Real Published Articles)
if (typeof RAW_NEWS_DATA === 'undefined') {
    var RAW_NEWS_DATA = [];
}

// Data Repository Manager
class NewsRepository {
    constructor() {
        if (!localStorage.getItem('ourtimes_ads_config')) {
            localStorage.setItem('ourtimes_ads_config', JSON.stringify({
                headerLeaderboard: false,
                sidebarRectangle: false,
                inArticleBanner: false
            }));
        }
    }

    getAllNews() {
        try {
            const custom = JSON.parse(localStorage.getItem('ourtimes_news_v2'));
            if (custom && Array.isArray(custom) && custom.length > 0) {
                return custom;
            }
        } catch (e) {}
        return (typeof RAW_NEWS_DATA !== 'undefined' && RAW_NEWS_DATA.length > 0) ? RAW_NEWS_DATA : [];
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
        return JSON.parse(localStorage.getItem('ourtimes_ads_config')) || {};
    }

    setAdConfig(config) {
        localStorage.setItem('ourtimes_ads_config', JSON.stringify(config));
    }
}

const NewsDB = new NewsRepository();

// Bangla Date & Live Digital Clock
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

// Breaking News Ticker Loader
function renderBreakingTicker() {
    const breakingNews = NewsDB.getAllNews().filter(n => n.isBreaking);
    const tickerContainer = document.getElementById('breakingTickerText');
    if (!tickerContainer) return;

    if (breakingNews.length === 0) {
        tickerContainer.innerHTML = `<span>সর্বশেষ খবরের জন্য Ourtimes24-এর সাথেই থাকুন।</span>`;
        return;
    }

    tickerContainer.innerHTML = breakingNews.map(n => `
        <a href="article.html?id=${n.id}" style="margin-right: 36px; color: inherit; display: inline-flex; align-items: center; gap: 6px;">
            <span style="color:var(--primary); font-weight:800;">[${n.category}]</span> ${n.title}
        </a>
    `).join('');
}

// Homepage Feeds Renderer
function renderHomepage() {
    const all = NewsDB.getAllNews();
    if (all.length === 0) return;

    // 1. Prothom Alo Style Flat Hero Block (Main Lead + Sub-leads List with Divider Lines)
    const lead = all.find(n => n.isLead) || all[0];
    const subLeads = all.filter(n => n.id !== lead.id).slice(0, 6);
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
                </div>
            </div>

            <!-- Sub-leads Vertical List View with Natural Text Wrapping Under Image -->
            <div class="sublead-flat-list">
                ${subLeads.map(n => {
                    const cleanExcerpt = n.excerpt && n.excerpt.length > 130 ? n.excerpt.substring(0, 125).trim() + '...' : (n.excerpt || '');
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

    // 3. Tabbed Sidebar: Latest & Most Read (Luxury Layout with Badges, Images, Meta)
    const latestList = document.getElementById('latestNewsList');
    const mostReadList = document.getElementById('mostReadNewsList');
    const rankDigits = ['১', '২', '৩', '৪', '৫', '৬', '৭'];
    const timeLabels = ['৫ মিনিট আগে', '১৫ মিনিট আগে', '৩০ মিনিট আগে', '১ ঘণ্টা আগে', '২ ঘণ্টা আগে', '৩ ঘণ্টা আগে'];

    if (latestList) {
        latestList.innerHTML = all.slice(0, 6).map((n, i) => `
            <li class="ranked-item">
                <a href="article.html?id=${n.id}" class="ranked-item-link">
                    <div class="rank-thumb-wrapper">
                        <span class="rank-badge-overlay">${rankDigits[i] || (i + 1)}</span>
                        <div class="rank-img-box">
                            <img src="${n.image}" alt="${n.title}">
                        </div>
                    </div>
                    <div class="rank-content">
                        <h4 class="rank-title">${n.title}</h4>
                        <div class="rank-meta">
                            <span class="rank-time"><i class="fa-regular fa-clock"></i> ${timeLabels[i] || '১ ঘণ্টা আগে'}</span>
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
                        <div class="rank-img-box">
                            <img src="${n.image}" alt="${n.title}">
                        </div>
                    </div>
                    <div class="rank-content">
                        <h4 class="rank-title">${n.title}</h4>
                        <div class="rank-meta">
                            <span class="rank-cat">${n.category}</span>
                            <span>•</span>
                            <span>জনপ্রিয়</span>
                        </div>
                    </div>
                </a>
            </li>
        `).join('');
    }

    // 4. Category Grids (4 items each, Image Clickable)
    renderCategoryGrid('nationalGrid', 'জাতীয়', 4);
    renderCategoryGrid('politicsGrid', 'রাজনীতি', 4);
    renderCategoryGrid('sportsGrid', 'খেলাধুলা', 4);
    renderCategoryGrid('techGrid', 'প্রযুক্তি', 4);
}

function renderCategoryGrid(containerId, categoryName, limit = 4) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const news = NewsDB.getAllNews().filter(n => n.category === categoryName).slice(0, limit);
    if (news.length === 0) {
        container.innerHTML = `<p class="text-muted" style="grid-column: 1/-1; padding: 12px;">এই মুহূর্তে এই বিভাগে কোনো খবর নেই।</p>`;
        return;
    }

    container.innerHTML = news.map(n => `
        <div class="news-card-std">
            <a href="article.html?id=${n.id}" class="news-card-img">
                <img src="${n.image}" alt="${n.title}">
                <span class="category-tag" style="top:10px; left:10px; font-size:11px; padding:2px 8px;">${n.category}</span>
            </a>
            <div class="news-card-body">
                <h3 class="news-card-title">
                    <a href="article.html?id=${n.id}">${n.title}</a>
                </h3>
            </div>
        </div>
    `).join('');
}

// Single Article Page Engine
function renderSingleArticle() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id') || 'nat-1';
    const article = NewsDB.getNewsById(id) || NewsDB.getAllNews()[0];

    if (!article) {
        document.getElementById('articleContainer').innerHTML = `
            <h2>সংবাদটি পাওয়া যায়নি!</h2>
            <p><a href="index.html" class="text-primary">হোমপেজে ফিরে যান</a></p>
        `;
        return;
    }

    document.title = `${article.title} - Ourtimes24`;

    document.getElementById('artCategory').textContent = article.category;
    document.getElementById('artHeadline').textContent = article.title;
    document.getElementById('artSubtitle').textContent = article.subtitle || '';
    document.getElementById('artAuthor').textContent = article.author;
    document.getElementById('artDate').textContent = `${article.date}`;
    document.getElementById('artImage').src = article.image;
    document.getElementById('artCaption').textContent = `${article.title} — ছবি: Ourtimes24`;
    document.getElementById('artBody').innerHTML = article.content || `<p>${article.excerpt}</p>`;

    // Quick Photo Card Studio Link
    const quickPhotoCardBtn = document.getElementById('btnMakePhotoCard');
    if (quickPhotoCardBtn) {
        quickPhotoCardBtn.href = `photocard.html?title=${encodeURIComponent(article.title)}&cat=${encodeURIComponent(article.category)}&img=${encodeURIComponent(article.image)}`;
    }

    // Related News (3 items)
    const related = NewsDB.getAllNews().filter(n => n.id !== article.id && n.category === article.category).slice(0, 3);
    const relatedContainer = document.getElementById('relatedNewsGrid');
    if (relatedContainer) {
        relatedContainer.innerHTML = related.map(n => `
            <div class="news-card-std">
                <a href="article.html?id=${n.id}" class="news-card-img">
                    <img src="${n.image}" alt="${n.title}">
                </a>
                <div class="news-card-body">
                    <h4 class="news-card-title"><a href="article.html?id=${n.id}">${n.title}</a></h4>
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

// Theme Toggle & Switch Sync
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

// Offcanvas Drawer Menu Control
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

// Share Menu & Platform Handlers
function toggleShareMenu(e) {
    if (e) e.stopPropagation();
    
    // If native web share is available on mobile devices, use it directly
    if (navigator.share && window.innerWidth <= 768) {
        navigator.share({
            title: document.title,
            text: document.title,
            url: window.location.href
        }).catch(() => {});
        return;
    }

    const popover = document.getElementById('sharePopover');
    if (popover) {
        popover.classList.toggle('active');
    }
}

function shareToPlatform(platform) {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);

    if (platform === 'facebook') {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=450');
    } else if (platform === 'whatsapp') {
        window.open(`https://api.whatsapp.com/send?text=${title}%20${url}`, '_blank');
    } else if (platform === 'twitter') {
        window.open(`https://twitter.com/intent/tweet?text=${title}&url=${url}`, '_blank', 'width=600,height=450');
    } else if (platform === 'copy') {
        navigator.clipboard.writeText(window.location.href).then(() => {
            alert('সংবাদের লিঙ্ক সফলভাবে কপি করা হয়েছে!');
        }).catch(() => {
            prompt('লিঙ্কটি কপি করুন:', window.location.href);
        });
    }

    const popover = document.getElementById('sharePopover');
    if (popover) popover.classList.remove('active');
}

// Close share popover when clicking anywhere else
document.addEventListener('click', (e) => {
    const popover = document.getElementById('sharePopover');
    const shareBtn = document.getElementById('btnShareArticle');
    if (popover && popover.classList.contains('active')) {
        if (!popover.contains(e.target) && e.target !== shareBtn && !shareBtn?.contains(e.target)) {
            popover.classList.remove('active');
        }
    }
});

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('ourtimes_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeUI(savedTheme);

    initBanglaClock();
    renderBreakingTicker();

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
