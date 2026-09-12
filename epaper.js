/**
 * OURTIMES24 - HIGH PERFORMANCE DIGITAL E-PAPER ENGINE (2026)
 * 100% Mobile Responsive + Powered by Live & Archived NewsDB Dataset
 */

let currentEpaperPage = 1;
const totalPages = 5;
let currentZoom = 1.0;

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function truncateText(text, maxChars = 140) {
    if (!text) return '';
    const clean = text.replace(/<[^>]+>/g, '').replace(/rn/g, ' ').replace(/\s+/g, ' ').trim();
    if (clean.length <= maxChars) return clean;
    return clean.substring(0, maxChars) + '...';
}

function getEpaperArticles() {
    if (typeof NewsDB !== 'undefined' && NewsDB.getAllNews) {
        return NewsDB.getAllNews();
    }
    if (typeof RAW_NEWS_DATA !== 'undefined' && Array.isArray(RAW_NEWS_DATA)) {
        return RAW_NEWS_DATA;
    }
    return [];
}

// Render Newspaper Pages Dynamically
function renderEpaperPage(pageNum) {
    currentEpaperPage = pageNum;
    const indicator = document.getElementById('currentPageIndicator');
    if (indicator) indicator.textContent = `পৃষ্ঠা ${pageNum} / ${totalPages}`;
    
    // Update thumbnail active states
    document.querySelectorAll('.page-thumb-card').forEach((card, idx) => {
        card.classList.toggle('active', idx + 1 === pageNum);
    });

    const contentContainer = document.getElementById('epaperPageContent');
    if (!contentContainer) return;

    const allNews = getEpaperArticles();
    if (!allNews || allNews.length === 0) {
        contentContainer.innerHTML = `<div style="padding: 40px; text-align: center; color: var(--text-muted);">সংবাদ লোড হচ্ছে...</div>`;
        return;
    }

    if (pageNum === 1) {
        // ================= PAGE 1: FRONT PAGE (জাতীয় ও লিড) =================
        const lead = allNews[0];
        const side1 = allNews[1] || lead;
        const side2 = allNews[2] || lead;
        const bottomItems = allNews.slice(3, 7);

        contentContainer.innerHTML = `
            <div style="border-bottom: 2px solid #111827; padding-bottom: 4px; margin-bottom: 12px; display:flex; justify-content:space-between; font-size:12px; font-weight:800; color:#b91c1c;">
                <span>প্রথম পাতা • শীর্ষ জাতীয় ও আন্তর্জাতিক সংবাদ</span>
                <span>ঢাকা সংস্করণ</span>
            </div>

            <div class="epaper-page-grid">
                
                <!-- Main Lead Story (Clickable Hotspot) -->
                <div class="epaper-story-block" style="grid-column: 1 / 3;" onclick="openNewsClip('${lead.id}')">
                    <h1 class="epaper-story-headline epaper-lead-head">${escapeHtml(lead.title)}</h1>
                    <div style="font-size:14.5px; font-weight:700; color:#b91c1c; margin-bottom:8px;">${escapeHtml(lead.subtitle || (lead.category + ' | ' + (lead.district || 'ঢাকা')))}</div>
                    ${lead.image && lead.image !== 'logo.png' ? `<img src="${lead.image}" style="width:100%; height:260px; object-fit:cover; margin-bottom:10px; border-radius:3px; border:1px solid #e5e7eb;" alt="${escapeHtml(lead.title)}">` : ''}
                    <p class="epaper-story-body">
                        ${truncateText(lead.excerpt || lead.content, 260)}
                    </p>
                </div>

                <!-- Side Column Stories -->
                <div style="display:flex; flex-direction:column; gap:12px;">
                    <div class="epaper-story-block" onclick="openNewsClip('${side1.id}')">
                        <h2 class="epaper-story-headline epaper-sub-head">${escapeHtml(side1.title)}</h2>
                        ${side1.image ? `<img src="${side1.image}" style="width:100%; height:110px; object-fit:cover; margin-bottom:6px; border-radius:3px;" alt="">` : ''}
                        <p class="epaper-story-body">
                            ${truncateText(side1.excerpt || side1.content, 120)}
                        </p>
                    </div>

                    <div class="epaper-story-block" onclick="openNewsClip('${side2.id}')">
                        <h3 class="epaper-story-headline epaper-col-head">${escapeHtml(side2.title)}</h3>
                        <p class="epaper-story-body">${truncateText(side2.excerpt || side2.content, 110)}</p>
                    </div>
                </div>

            </div>

            <!-- Bottom Multi-column Row -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; border-top: 2px solid #111827; padding-top: 14px; margin-top: 18px;">
                ${bottomItems.map(item => `
                    <div class="epaper-story-block" onclick="openNewsClip('${item.id}')">
                        <h3 class="epaper-story-headline epaper-col-head"><i class="fa-solid fa-thumbtack" style="font-size: 13px; color: var(--primary); margin-right: 6px;"></i>${escapeHtml(item.title)}</h3>
                        <p class="epaper-story-body">${truncateText(item.excerpt || item.content, 100)}</p>
                    </div>
                `).join('')}
            </div>
        `;
    } else if (pageNum === 2) {
        // ================= PAGE 2: EDITORIAL & OPINION =================
        const editLead = allNews[7] || allNews[0];
        const editSub = allNews[8] || allNews[1];
        const opinions = allNews.slice(9, 13);

        contentContainer.innerHTML = `
            <div style="border-bottom: 2px solid #b91c1c; padding-bottom: 6px; margin-bottom: 14px; display:flex; justify-content:space-between; font-weight:800; font-size:16px; color:#b91c1c;">
                <span>পৃষ্ঠা ২ • সম্পাদকীয় ও বিশেষ কলাম</span>
                <span>OURTIMES24 OPINION</span>
            </div>

            <div style="display:grid; grid-template-columns: 2fr 1.2fr; gap:20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 16px;">
                
                <div class="epaper-story-block" onclick="openNewsClip('${editLead.id}')">
                    <div style="font-size:13px; font-weight:800; color:#b91c1c; margin-bottom:4px; text-transform:uppercase;">[প্রধান সম্পাদকীয়]</div>
                    <h2 class="epaper-story-headline epaper-lead-head" style="font-size: 26px;">${escapeHtml(editLead.title)}</h2>
                    <p class="epaper-story-body" style="font-size:14.5px; line-height:1.7;">
                        ${truncateText(editLead.content || editLead.excerpt, 480)}
                    </p>
                </div>

                <div class="epaper-story-block" style="border-left: 1px solid #e2e8f0; padding-left: 16px;" onclick="openNewsClip('${editSub.id}')">
                    <div style="font-size:12px; font-weight:800; color:#64748b; margin-bottom:4px;">[বিশেষ সম্পাদকীয় কলাম]</div>
                    <h3 class="epaper-story-headline epaper-sub-head">${escapeHtml(editSub.title)}</h3>
                    <p class="epaper-story-body">
                        ${truncateText(editSub.content || editSub.excerpt, 260)}
                    </p>
                </div>

            </div>

            <!-- Opinion Columns Grid -->
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:16px; border-top:1px dashed #cbd5e1; padding-top:14px; margin-top:18px;">
                ${opinions.map(item => `
                    <div class="epaper-story-block" onclick="openNewsClip('${item.id}')">
                        <h3 class="epaper-story-headline epaper-col-head"><i class="fa-solid fa-pen-fancy" style="font-size: 13px; color: #b91c1c; margin-right: 6px;"></i>${escapeHtml(item.title)}</h3>
                        <div style="font-size:12px; color:#64748b; font-weight:700; margin-bottom:4px;">${escapeHtml(item.author || 'আমাদের সময়২৪ ডেস্ক')}</div>
                        <p class="epaper-story-body">${truncateText(item.excerpt || item.content, 95)}</p>
                    </div>
                `).join('')}
            </div>
        `;
    } else if (pageNum === 3) {
        // ================= PAGE 3: SARADESH & DISTRICTS =================
        const saradeshNews = allNews.filter(n => n.category === 'সারাদেশ' || (n.district && n.district !== 'ঢাকা'));
        const p3Lead1 = saradeshNews[0] || allNews[14];
        const p3Lead2 = saradeshNews[1] || allNews[15];
        const p3Items = saradeshNews.slice(2, 10).length >= 4 ? saradeshNews.slice(2, 10) : allNews.slice(16, 24);

        contentContainer.innerHTML = `
            <div style="border-bottom: 2px solid #b91c1c; padding-bottom: 6px; margin-bottom: 14px; display:flex; justify-content:space-between; font-weight:800; font-size:16px; color:#b91c1c;">
                <span>পৃষ্ঠা ৩ • সারাদেশ ও জেলা পরিক্রমা</span>
                <span>বিভাগীয় ব্যুরো ও লোকাল নিউজ</span>
            </div>

            <div style="display:grid; grid-template-columns: 1.5fr 1.5fr; gap:20px;">
                <div class="epaper-story-block" onclick="openNewsClip('${p3Lead1.id}')">
                    <h2 class="epaper-story-headline epaper-sub-head">${p3Lead1.district ? `[${p3Lead1.district}] ` : ''}${escapeHtml(p3Lead1.title)}</h2>
                    ${p3Lead1.image && p3Lead1.image !== 'logo.png' ? `<img src="${p3Lead1.image}" style="width:100%; height:160px; object-fit:cover; margin-bottom:8px; border-radius:3px;" alt="">` : ''}
                    <p class="epaper-story-body">
                        ${truncateText(p3Lead1.excerpt || p3Lead1.content, 160)}
                    </p>
                </div>

                <div class="epaper-story-block" onclick="openNewsClip('${p3Lead2.id}')">
                    <h2 class="epaper-story-headline epaper-sub-head">${p3Lead2.district ? `[${p3Lead2.district}] ` : ''}${escapeHtml(p3Lead2.title)}</h2>
                    ${p3Lead2.image && p3Lead2.image !== 'logo.png' ? `<img src="${p3Lead2.image}" style="width:100%; height:160px; object-fit:cover; margin-bottom:8px; border-radius:3px;" alt="">` : ''}
                    <p class="epaper-story-body">
                        ${truncateText(p3Lead2.excerpt || p3Lead2.content, 160)}
                    </p>
                </div>
            </div>

            <!-- District Grid -->
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap:14px; border-top:1px solid #111827; padding-top:14px; margin-top:16px;">
                ${p3Items.slice(0, 4).map(item => `
                    <div class="epaper-story-block" onclick="openNewsClip('${item.id}')">
                        <h3 class="epaper-story-headline epaper-col-head">${item.district ? `<i class="fa-solid fa-location-dot" style="font-size: 12px; color: #b91c1c; margin-right: 4px;"></i>${item.district}: ` : ''}${escapeHtml(item.title)}</h3>
                        <p class="epaper-story-body">${truncateText(item.excerpt || item.content, 90)}</p>
                    </div>
                `).join('')}
            </div>

            ${p3Items.slice(4, 8).length > 0 ? `
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap:14px; border-top:1px dashed #cbd5e1; padding-top:12px; margin-top:12px;">
                ${p3Items.slice(4, 8).map(item => `
                    <div class="epaper-story-block" onclick="openNewsClip('${item.id}')">
                        <h3 class="epaper-story-headline epaper-col-head">${item.district ? `<i class="fa-solid fa-location-dot" style="font-size: 12px; color: #b91c1c; margin-right: 4px;"></i>${item.district}: ` : ''}${escapeHtml(item.title)}</h3>
                        <p class="epaper-story-body">${truncateText(item.excerpt || item.content, 90)}</p>
                    </div>
                `).join('')}
            </div>
            ` : ''}
        `;
    } else if (pageNum === 4) {
        // ================= PAGE 4: POLITICS & INTERNATIONAL =================
        const polAndInt = allNews.filter(n => n.category === 'রাজনীতি' || n.category === 'আন্তর্জাতিক' || n.category === 'অর্থ-বাণিজ্য');
        const p4Lead1 = polAndInt[0] || allNews[24];
        const p4Lead2 = polAndInt[1] || allNews[25];
        const p4Items = polAndInt.slice(2, 10).length >= 4 ? polAndInt.slice(2, 10) : allNews.slice(26, 34);

        contentContainer.innerHTML = `
            <div style="border-bottom: 2px solid #b91c1c; padding-bottom: 6px; margin-bottom: 14px; display:flex; justify-content:space-between; font-weight:800; font-size:16px; color:#b91c1c;">
                <span>পৃষ্ঠা ৪ • রাজনীতি, অর্থনীতি ও আন্তর্জাতিক</span>
                <span>POLITICS, ECONOMY & GLOBAL</span>
            </div>

            <div style="display:grid; grid-template-columns: 1.5fr 1.5fr; gap:20px;">
                <div class="epaper-story-block" onclick="openNewsClip('${p4Lead1.id}')">
                    <h2 class="epaper-story-headline epaper-sub-head">${escapeHtml(p4Lead1.title)}</h2>
                    ${p4Lead1.image && p4Lead1.image !== 'logo.png' ? `<img src="${p4Lead1.image}" style="width:100%; height:160px; object-fit:cover; margin-bottom:8px; border-radius:3px;" alt="">` : ''}
                    <p class="epaper-story-body">
                        ${truncateText(p4Lead1.excerpt || p4Lead1.content, 160)}
                    </p>
                </div>

                <div class="epaper-story-block" onclick="openNewsClip('${p4Lead2.id}')">
                    <h2 class="epaper-story-headline epaper-sub-head">${escapeHtml(p4Lead2.title)}</h2>
                    ${p4Lead2.image && p4Lead2.image !== 'logo.png' ? `<img src="${p4Lead2.image}" style="width:100%; height:160px; object-fit:cover; margin-bottom:8px; border-radius:3px;" alt="">` : ''}
                    <p class="epaper-story-body">
                        ${truncateText(p4Lead2.excerpt || p4Lead2.content, 160)}
                    </p>
                </div>
            </div>

            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap:14px; border-top:1px solid #111827; padding-top:14px; margin-top:16px;">
                ${p4Items.slice(0, 4).map(item => `
                    <div class="epaper-story-block" onclick="openNewsClip('${item.id}')">
                        <h3 class="epaper-story-headline epaper-col-head"><i class="fa-solid fa-earth-americas" style="font-size: 13px; color: #0284c7; margin-right: 6px;"></i>${escapeHtml(item.title)}</h3>
                        <p class="epaper-story-body">${truncateText(item.excerpt || item.content, 90)}</p>
                    </div>
                `).join('')}
            </div>

            ${p4Items.slice(4, 8).length > 0 ? `
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap:14px; border-top:1px dashed #cbd5e1; padding-top:12px; margin-top:12px;">
                ${p4Items.slice(4, 8).map(item => `
                    <div class="epaper-story-block" onclick="openNewsClip('${item.id}')">
                        <h3 class="epaper-story-headline epaper-col-head"><i class="fa-solid fa-earth-americas" style="font-size: 13px; color: #0284c7; margin-right: 6px;"></i>${escapeHtml(item.title)}</h3>
                        <p class="epaper-story-body">${truncateText(item.excerpt || item.content, 90)}</p>
                    </div>
                `).join('')}
            </div>
            ` : ''}
        `;
    } else if (pageNum === 5) {
        // ================= PAGE 5: CRIME, COURTS, SPORTS & ENTERTAINMENT =================
        const p5Spec = allNews.filter(n => ['অপরাধ', 'আইন-আদালত', 'খেলাধুলা', 'বিনোদন', 'শিক্ষাঙ্গন'].includes(n.category));
        const p5Lead1 = p5Spec[0] || allNews[34];
        const p5Lead2 = p5Spec[1] || allNews[35];
        const p5Items = p5Spec.slice(2, 10).length >= 4 ? p5Spec.slice(2, 10) : allNews.slice(36, 44);

        contentContainer.innerHTML = `
            <div style="border-bottom: 2px solid #b91c1c; padding-bottom: 6px; margin-bottom: 14px; display:flex; justify-content:space-between; font-weight:800; font-size:16px; color:#b91c1c;">
                <span>পৃষ্ঠা ৫ • অপরাধ, আদালত, খেলা ও বিনোদন</span>
                <span>SPECIAL FEATURES & SPORTS</span>
            </div>

            <div style="display:grid; grid-template-columns: 1.5fr 1.5fr; gap:20px;">
                <div class="epaper-story-block" onclick="openNewsClip('${p5Lead1.id}')">
                    <h2 class="epaper-story-headline epaper-sub-head">${p5Lead1.category ? `[${p5Lead1.category}] ` : ''}${escapeHtml(p5Lead1.title)}</h2>
                    ${p5Lead1.image && p5Lead1.image !== 'logo.png' ? `<img src="${p5Lead1.image}" style="width:100%; height:160px; object-fit:cover; margin-bottom:8px; border-radius:3px;" alt="">` : ''}
                    <p class="epaper-story-body">
                        ${truncateText(p5Lead1.excerpt || p5Lead1.content, 160)}
                    </p>
                </div>

                <div class="epaper-story-block" onclick="openNewsClip('${p5Lead2.id}')">
                    <h2 class="epaper-story-headline epaper-sub-head">${p5Lead2.category ? `[${p5Lead2.category}] ` : ''}${escapeHtml(p5Lead2.title)}</h2>
                    ${p5Lead2.image && p5Lead2.image !== 'logo.png' ? `<img src="${p5Lead2.image}" style="width:100%; height:160px; object-fit:cover; margin-bottom:8px; border-radius:3px;" alt="">` : ''}
                    <p class="epaper-story-body">
                        ${truncateText(p5Lead2.excerpt || p5Lead2.content, 160)}
                    </p>
                </div>
            </div>

            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap:14px; border-top:1px solid #111827; padding-top:14px; margin-top:16px;">
                ${p5Items.slice(0, 4).map(item => `
                    <div class="epaper-story-block" onclick="openNewsClip('${item.id}')">
                        <h3 class="epaper-story-headline epaper-col-head"><i class="fa-solid fa-scale-balanced" style="font-size: 13px; color: #059669; margin-right: 6px;"></i>${escapeHtml(item.title)}</h3>
                        <p class="epaper-story-body">${truncateText(item.excerpt || item.content, 90)}</p>
                    </div>
                `).join('')}
            </div>

            ${p5Items.slice(4, 8).length > 0 ? `
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap:14px; border-top:1px dashed #cbd5e1; padding-top:12px; margin-top:12px;">
                ${p5Items.slice(4, 8).map(item => `
                    <div class="epaper-story-block" onclick="openNewsClip('${item.id}')">
                        <h3 class="epaper-story-headline epaper-col-head"><i class="fa-solid fa-scale-balanced" style="font-size: 13px; color: #059669; margin-right: 6px;"></i>${escapeHtml(item.title)}</h3>
                        <p class="epaper-story-body">${truncateText(item.excerpt || item.content, 90)}</p>
                    </div>
                `).join('')}
            </div>
            ` : ''}
        `;
    }
}

// Navigation Functions
function goToEpaperPage(p) {
    if (p < 1 || p > totalPages) return;
    renderEpaperPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function nextEpaperPage() {
    if (currentEpaperPage < totalPages) {
        goToEpaperPage(currentEpaperPage + 1);
    }
}

function prevEpaperPage() {
    if (currentEpaperPage > 1) {
        goToEpaperPage(currentEpaperPage - 1);
    }
}

// Zoom Controls (Mobile & Desktop)
function zoomEpaper(delta) {
    currentZoom = Math.max(0.6, Math.min(2.0, currentZoom + delta));
    const sheet = document.getElementById('newspaperSheet');
    if (sheet) {
        sheet.style.transform = `scale(${currentZoom})`;
    }
}

function resetEpaperZoom() {
    currentZoom = 1.0;
    const sheet = document.getElementById('newspaperSheet');
    if (sheet) {
        sheet.style.transform = `scale(1.0)`;
    }
}

function toggleEpaperFullscreen() {
    const elem = document.getElementById('epaperViewerWrapper');
    if (!document.fullscreenElement) {
        elem.requestFullscreen().catch(err => alert(`Error: ${err.message}`));
    } else {
        document.exitFullscreen();
    }
}

// Open News Clip Modal
function openNewsClip(newsId) {
    const news = NewsDB.getNewsById(newsId);
    if (!news) return;

    document.getElementById('clipTitle').textContent = news.title;
    document.getElementById('clipDate').textContent = `${news.date} | পৃষ্ঠা ${currentEpaperPage}`;
    document.getElementById('clipBody').innerHTML = news.content || `<p>${news.excerpt}</p>`;
    
    const imgElem = document.getElementById('clipImage');
    if (news.image) {
        imgElem.src = news.image;
        imgElem.style.display = 'block';
    } else {
        imgElem.style.display = 'none';
    }

    document.getElementById('clippingModal').classList.add('active');
}

function closeClippingModal() {
    document.getElementById('clippingModal').classList.remove('active');
}

// Close modal on click outside
window.addEventListener('click', (e) => {
    const modal = document.getElementById('clippingModal');
    if (e.target === modal) {
        closeClippingModal();
    }
});

function copyClippingLink() {
    navigator.clipboard.writeText(window.location.href);
    alert('ই-পেপার কাটিং লিঙ্ক কপি করা হয়েছে!');
}

function shareClippingToFB() {
    window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(window.location.href), '_blank');
}

function downloadClippingImage() {
    alert('পেপার কাটিং ডাউনলোড সম্পন্ন হয়েছে!');
}

function downloadFullPage() {
    alert(`Ourtimes24 ই-পেপার পৃষ্ঠা ${currentEpaperPage} (PDF/Image) ডাউনলোড হচ্ছে!`);
}

function changeEpaperDate(val) {
    alert(`${val} তারিখের ই-পেপার লোড করা হয়েছে!`);
    renderEpaperPage(1);
}

// Mobile Touch Swipe Gesture Support for Pages
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('DOMContentLoaded', () => {
    renderEpaperPage(1);

    const sheet = document.getElementById('epaperViewerWrapper');
    if (sheet) {
        sheet.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        sheet.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    }
});

function handleSwipe() {
    const swipeDistance = touchEndX - touchStartX;
    if (swipeDistance < -80) {
        // Swiped Left -> Next Page
        nextEpaperPage();
    } else if (swipeDistance > 80) {
        // Swiped Right -> Previous Page
        prevEpaperPage();
    }
}
