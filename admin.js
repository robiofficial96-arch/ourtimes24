/**
 * OURTIMES24 - ADMIN NEWSROOM DASHBOARD CONTROLLER
 * Integrated with Cloudinary Direct Media Upload (mlk8lrzc / ourtimes_news)
 */

const CLOUDINARY_CONFIG = {
    cloudName: 'mlk8lrzc',
    uploadPreset: 'ourtimes_news'
};

// ==========================================
// 1. CLOUDINARY IMAGE UPLOAD & PREVIEW
// ==========================================

function handleImageFileSelect(e) {
    const file = e.target.files && e.target.files[0];
    if (file) {
        uploadToCloudinary(file);
    }
}

function uploadToCloudinary(file) {
    if (!file.type.startsWith('image/')) {
        alert('অনুগ্রহ করে শুধুমাত্র একটি ইমেজ ফাইল (JPG, PNG, WebP) সিলেক্ট করুন!');
        return;
    }

    const promptEl = document.getElementById('uploadPrompt');
    const progressEl = document.getElementById('uploadProgress');

    if (promptEl) promptEl.style.display = 'none';
    if (progressEl) progressEl.style.display = 'block';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);

    fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`, {
        method: 'POST',
        body: formData
    })
    .then(res => {
        if (!res.ok) {
            throw new Error(`সার্ভার এরর: ${res.status}`);
        }
        return res.json();
    })
    .then(data => {
        if (data && data.secure_url) {
            setFeaturedImage(data.secure_url);
        } else {
            throw new Error('Cloudinary থেকে কোনো ছবির লিঙ্ক পাওয়া যায়নি!');
        }
    })
    .catch(err => {
        console.error('Cloudinary Upload Error:', err);
        alert('ছবি আপলোডে সমস্যা হয়েছে: ' + err.message);
    })
    .finally(() => {
        if (promptEl) promptEl.style.display = 'block';
        if (progressEl) progressEl.style.display = 'none';
    });
}

function setFeaturedImage(url) {
    const input = document.getElementById('newsImage');
    const previewContainer = document.getElementById('imagePreviewContainer');
    const previewImg = document.getElementById('imagePreviewImg');

    if (input) input.value = url;
    if (previewImg) previewImg.src = url;
    if (previewContainer) previewContainer.style.display = 'block';
}

function removeUploadedImage() {
    const input = document.getElementById('newsImage');
    const previewContainer = document.getElementById('imagePreviewContainer');
    const previewImg = document.getElementById('imagePreviewImg');
    const fileInput = document.getElementById('imageFileInput');

    if (input) input.value = '';
    if (previewImg) previewImg.src = '';
    if (previewContainer) previewContainer.style.display = 'none';
    if (fileInput) fileInput.value = '';
}

function setupDropzone() {
    const dropzone = document.getElementById('imageDropzone');
    if (!dropzone) return;

    ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.add('dragover');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.remove('dragover');
        });
    });

    dropzone.addEventListener('drop', (e) => {
        const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (file) {
            uploadToCloudinary(file);
        }
    });

    // When manual URL is typed or changed, update preview
    const urlInput = document.getElementById('newsImage');
    if (urlInput) {
        urlInput.addEventListener('input', (e) => {
            const val = e.target.value.trim();
            if (val && (val.startsWith('http://') || val.startsWith('https://'))) {
                const previewContainer = document.getElementById('imagePreviewContainer');
                const previewImg = document.getElementById('imagePreviewImg');
                if (previewImg) previewImg.src = val;
                if (previewContainer) previewContainer.style.display = 'block';
            }
        });
    }
}

// ==========================================
// 2. TAB SWITCHING
// ==========================================

function switchAdminTab(tabId) {
    ['tabCreateNews', 'tabManageNews', 'tabAdSettings', 'tabBreakingTicker'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = (id === tabId) ? 'block' : 'none';
    });

    ['btnTabCreate', 'btnTabManage', 'btnTabAds', 'btnTabBreaking'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('active');
    });

    if (tabId === 'tabCreateNews') document.getElementById('btnTabCreate')?.classList.add('active');
    if (tabId === 'tabManageNews') {
        document.getElementById('btnTabManage')?.classList.add('active');
        renderNewsTable();
    }
    if (tabId === 'tabAdSettings') {
        document.getElementById('btnTabAds')?.classList.add('active');
        loadAdSettings();
    }
    if (tabId === 'tabBreakingTicker') {
        document.getElementById('btnTabBreaking')?.classList.add('active');
        renderBreakingManagerList();
    }
}

// ==========================================
// 3. NEWS SUBMIT & MANAGEMENT
// ==========================================

function handleNewsSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('newsId').value || `news-${Date.now()}`;
    const title = document.getElementById('newsTitle').value.trim();
    const subtitle = document.getElementById('newsSubtitle').value.trim();
    const category = document.getElementById('newsCategory').value;
    const district = document.getElementById('newsDistrict').value || 'ঢাকা';
    const author = document.getElementById('newsAuthor').value || 'নিজস্ব প্রতিবেদক';
    const image = document.getElementById('newsImage').value.trim();
    const excerpt = document.getElementById('newsExcerpt').value.trim() || (title + ' - বিস্তারিত পড়ুন।');
    const content = document.getElementById('newsContent').value.trim() || `<p>${excerpt}</p>`;
    const isLead = document.getElementById('newsIsLead')?.checked || false;
    const isBreaking = document.getElementById('newsIsBreaking')?.checked || false;

    if (!image) {
        alert('অনুগ্রহ করে সংবাদের একটি ফিচার্ড ছবি আপলোড করুন বা ছবির URL দিন!');
        return;
    }

    const catSlugs = {
        'জাতীয়': 'national',
        'রাজনীতি': 'politics',
        'আন্তর্জাতিক': 'international',
        'অর্থ-বাণিজ্য': 'economy',
        'খেলাধুলা': 'sports',
        'বিনোদন': 'entertainment',
        'প্রযুক্তি': 'tech',
        'সারাদেশ': 'saradesh',
        'মতামত': 'opinion'
    };

    const newsItem = {
        id,
        title,
        subtitle,
        category,
        categorySlug: catSlugs[category] || 'national',
        district,
        author,
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        image,
        excerpt,
        content: content.startsWith('<p>') ? content : `<p>${content}</p>`,
        isLead,
        isBreaking,
        date: new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }),
        views: 100
    };

    // If marked as lead, unset other leads
    if (isLead) {
        const all = NewsDB.getAllNews();
        all.forEach(n => n.isLead = false);
        localStorage.setItem('ourtimes_news', JSON.stringify(all));
    }

    NewsDB.saveNews(newsItem);
    alert('🎉 সংবাদটি সফলভাবে সংরক্ষিত ও প্রকাশিত হয়েছে!');
    resetNewsForm();
    switchAdminTab('tabManageNews');
}

let adminSearchQuery = '';
let adminCategoryQuery = 'all';
let adminCurrentPage = 1;
const ADMIN_PER_PAGE = 15;

function handleAdminSearch(val) {
    adminSearchQuery = (val || '').trim().toLowerCase();
    adminCurrentPage = 1;
    renderNewsTable();
}

function filterAdminCategory(cat) {
    adminCategoryQuery = cat || 'all';
    adminCurrentPage = 1;
    renderNewsTable();
}

function getFilteredNews() {
    let all = NewsDB.getAllNews();
    if (adminCategoryQuery !== 'all') {
        all = all.filter(n => n.category === adminCategoryQuery || n.categorySlug === adminCategoryQuery);
    }
    if (adminSearchQuery) {
        all = all.filter(n => {
            const title = (n.title || '').toLowerCase();
            const excerpt = (n.excerpt || '').toLowerCase();
            const author = (n.author || '').toLowerCase();
            const cat = (n.category || '').toLowerCase();
            return title.includes(adminSearchQuery) || excerpt.includes(adminSearchQuery) || author.includes(adminSearchQuery) || cat.includes(adminSearchQuery);
        });
    }
    return all;
}

function renderNewsTable() {
    const container = document.getElementById('adminNewsListTable');
    const paginationContainer = document.getElementById('adminPagination');
    if (!container) return;

    const filtered = getFilteredNews();
    const countEl = document.getElementById('totalNewsCount');
    if (countEl) countEl.textContent = filtered.length;

    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="padding: 40px 20px; text-align: center; color: var(--text-muted); background: var(--bg-surface-alt); border-radius: 8px; border: 1px dashed var(--border-color);">
                <i class="fa-regular fa-newspaper" style="font-size: 36px; margin-bottom: 12px; color: var(--text-muted);"></i>
                <div style="font-weight: 700;">কোনো সংবাদ পাওয়া যায়নি।</div>
                <div style="font-size: 13px; margin-top: 4px;">অনুসন্ধানের শর্ত পরিবর্তন করে আবার চেষ্টা করুন।</div>
            </div>
        `;
        if (paginationContainer) paginationContainer.innerHTML = '';
        return;
    }

    const totalPages = Math.ceil(filtered.length / ADMIN_PER_PAGE);
    if (adminCurrentPage > totalPages) adminCurrentPage = totalPages;
    if (adminCurrentPage < 1) adminCurrentPage = 1;

    const startIdx = (adminCurrentPage - 1) * ADMIN_PER_PAGE;
    const pageItems = filtered.slice(startIdx, startIdx + ADMIN_PER_PAGE);

    // Desktop Table HTML
    const desktopTable = `
        <div class="admin-table-desktop" style="overflow-x: auto; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 8px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14.5px; text-align: left;">
                <thead>
                    <tr style="background: var(--bg-surface-alt); border-bottom: 2px solid var(--border-color);">
                        <th style="padding: 12px 14px; width: 70px;">ছবি</th>
                        <th style="padding: 12px 14px;">শিরোনাম</th>
                        <th style="padding: 12px 14px; width: 110px;">বিভাগ</th>
                        <th style="padding: 12px 14px; width: 140px;">তারিখ</th>
                        <th style="padding: 12px 14px; width: 140px; text-align: right;">অ্যাকশন</th>
                    </tr>
                </thead>
                <tbody id="newsTableBody">
                    ${pageItems.map(n => `
                        <tr style="border-bottom: 1px solid var(--border-color); transition: background 0.15s ease;">
                            <td style="padding: 10px 14px;">
                                <img src="${n.image}" style="width: 55px; height: 38px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border-color);" alt="">
                            </td>
                            <td style="padding: 10px 14px; font-weight: 600;">
                                <a href="article.html?id=${n.id}" target="_blank" style="color: var(--text-main); line-height: 1.4; display: inline-block;">
                                    ${n.title}
                                </a>
                                <div style="margin-top: 4px; display: flex; gap: 6px;">
                                    ${n.isLead ? '<span style="background:var(--primary); color:white; font-size:10px; font-weight:700; padding:2px 6px; border-radius:3px;">প্রধান লিড</span>' : ''}
                                    ${n.isBreaking ? '<span style="background:#eab308; color:black; font-size:10px; font-weight:700; padding:2px 6px; border-radius:3px;">ব্রেকিং</span>' : ''}
                                </div>
                            </td>
                            <td style="padding: 10px 14px; color: var(--primary); font-weight: 700;">${n.category}</td>
                            <td style="padding: 10px 14px; color: var(--text-muted); font-size: 13px;">${n.date || 'আজ'}</td>
                            <td style="padding: 10px 14px; text-align: right; white-space: nowrap;">
                                <button class="tool-btn" style="display:inline-flex; padding:6px 10px; margin-right:4px; border-radius:4px; cursor:pointer;" onclick="editNews('${n.id}')" title="সম্পাদনা করুন">
                                    <i class="fa-solid fa-pen-to-square"></i>
                                </button>
                                <a href="photocard.html?title=${encodeURIComponent(n.title)}&cat=${encodeURIComponent(n.category)}&img=${encodeURIComponent(n.image)}" target="_blank" class="tool-btn" style="display:inline-flex; padding:6px 10px; margin-right:4px; color:#059669; border-radius:4px;" title="ফটো কার্ড তৈরি">
                                    <i class="fa-solid fa-camera"></i>
                                </a>
                                <button class="tool-btn" style="display:inline-flex; padding:6px 10px; color:#dc2626; border-radius:4px; cursor:pointer;" onclick="deleteNewsItem('${n.id}')" title="মুছে ফেলুন">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    // Mobile News Card List HTML
    const mobileCards = `
        <div class="admin-news-card-mobile">
            ${pageItems.map(n => `
                <div class="mobile-news-item">
                    <div class="mobile-news-top">
                        <img src="${n.image}" class="mobile-news-thumb" alt="">
                        <div class="mobile-news-info">
                            <a href="article.html?id=${n.id}" target="_blank" class="mobile-news-title">${n.title}</a>
                            <div class="mobile-news-meta">
                                <span style="color:var(--primary); font-weight:700;">${n.category}</span>
                                <span>•</span>
                                <span>${n.date || 'আজ'}</span>
                                ${n.isLead ? '<span style="background:var(--primary); color:white; font-size:10px; font-weight:700; padding:1px 5px; border-radius:3px;">লিড</span>' : ''}
                                ${n.isBreaking ? '<span style="background:#eab308; color:black; font-size:10px; font-weight:700; padding:1px 5px; border-radius:3px;">ব্রেকিং</span>' : ''}
                            </div>
                        </div>
                    </div>
                    <div class="mobile-news-actions">
                        <button type="button" class="mobile-action-btn btn-edit" onclick="editNews('${n.id}')">
                            <i class="fa-solid fa-pen-to-square"></i> সম্পাদনা
                        </button>
                        <a href="photocard.html?title=${encodeURIComponent(n.title)}&cat=${encodeURIComponent(n.category)}&img=${encodeURIComponent(n.image)}" target="_blank" class="mobile-action-btn btn-photo">
                            <i class="fa-solid fa-camera"></i> ফটো কার্ড
                        </a>
                        <button type="button" class="mobile-action-btn btn-del" onclick="deleteNewsItem('${n.id}')">
                            <i class="fa-solid fa-trash"></i> মুছুন
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    container.innerHTML = desktopTable + mobileCards;

    // Render Pagination Controls
    if (paginationContainer) {
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
        } else {
            let paginationHtml = `
                <button class="admin-page-btn" onclick="changeAdminPage(${adminCurrentPage - 1})" ${adminCurrentPage === 1 ? 'disabled' : ''}>
                    <i class="fa-solid fa-chevron-left"></i> পূর্ববর্তী
                </button>
            `;

            const startPage = Math.max(1, adminCurrentPage - 2);
            const endPage = Math.min(totalPages, adminCurrentPage + 2);

            if (startPage > 1) {
                paginationHtml += `<button class="admin-page-btn" onclick="changeAdminPage(1)">১</button>`;
                if (startPage > 2) paginationHtml += `<span style="padding:0 4px; color:var(--text-muted);">...</span>`;
            }

            for (let p = startPage; p <= endPage; p++) {
                const bnDigits = String(p).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);
                paginationHtml += `
                    <button class="admin-page-btn ${p === adminCurrentPage ? 'active' : ''}" onclick="changeAdminPage(${p})">
                        ${bnDigits}
                    </button>
                `;
            }

            if (endPage < totalPages) {
                if (endPage < totalPages - 1) paginationHtml += `<span style="padding:0 4px; color:var(--text-muted);">...</span>`;
                const bnTotal = String(totalPages).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);
                paginationHtml += `<button class="admin-page-btn" onclick="changeAdminPage(${totalPages})">${bnTotal}</button>`;
            }

            paginationHtml += `
                <button class="admin-page-btn" onclick="changeAdminPage(${adminCurrentPage + 1})" ${adminCurrentPage === totalPages ? 'disabled' : ''}>
                    পরবর্তী <i class="fa-solid fa-chevron-right"></i>
                </button>
            `;

            paginationContainer.innerHTML = paginationHtml;
        }
    }
}

function changeAdminPage(page) {
    adminCurrentPage = page;
    renderNewsTable();
}

function editNews(id) {
    const item = NewsDB.getNewsById(id);
    if (!item) return;

    document.getElementById('newsId').value = item.id;
    document.getElementById('newsTitle').value = item.title;
    document.getElementById('newsSubtitle').value = item.subtitle || '';
    document.getElementById('newsCategory').value = item.category;
    document.getElementById('newsDistrict').value = item.district || '';
    document.getElementById('newsAuthor').value = item.author || '';
    
    // Set image and preview
    setFeaturedImage(item.image);

    document.getElementById('newsExcerpt').value = item.excerpt || '';
    document.getElementById('newsContent').value = item.content || '';
    
    if (document.getElementById('newsIsLead')) {
        document.getElementById('newsIsLead').checked = !!item.isLead;
    }
    if (document.getElementById('newsIsBreaking')) {
        document.getElementById('newsIsBreaking').checked = !!item.isBreaking;
    }

    const formTitle = document.getElementById('formTitle');
    if (formTitle) formTitle.textContent = 'সংবাদ সম্পাদনা করুন';
    
    switchAdminTab('tabCreateNews');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteNewsItem(id) {
    if (confirm('আপনি কি নিশ্চিত যে এই সংবাদটি মুছে ফেলতে চান?')) {
        NewsDB.deleteNews(id);
        renderNewsTable();
    }
}

function resetNewsForm() {
    const form = document.getElementById('newsForm');
    if (form) form.reset();
    
    document.getElementById('newsId').value = '';
    removeUploadedImage();
    
    const formTitle = document.getElementById('formTitle');
    if (formTitle) formTitle.textContent = 'নতুন সংবাদ লিখুন';
}

// ==========================================
// 4. AD SETTINGS CONTROLLER
// ==========================================

function loadAdSettings() {
    const config = NewsDB.getAdConfig();
    const h = document.getElementById('adToggleHeader');
    const s = document.getElementById('adToggleSidebar');
    const a = document.getElementById('adToggleInArticle');

    if (h) h.checked = !!config.headerLeaderboard;
    if (s) s.checked = !!config.sidebarRectangle;
    if (a) a.checked = !!config.inArticleBanner;
}

function saveAdToggles() {
    const config = {
        headerLeaderboard: !!document.getElementById('adToggleHeader')?.checked,
        sidebarRectangle: !!document.getElementById('adToggleSidebar')?.checked,
        inArticleBanner: !!document.getElementById('adToggleInArticle')?.checked
    };
    NewsDB.setAdConfig(config);
}

// ==========================================
// 5. BREAKING TICKER MANAGER
// ==========================================

function renderBreakingManagerList() {
    const news = NewsDB.getAllNews();
    const container = document.getElementById('adminBreakingList');
    if (!container) return;

    if (news.length === 0) {
        container.innerHTML = `<div style="padding: 24px; color: var(--text-muted); text-align: center;">কোনো সংবাদ পাওয়া যায়নি।</div>`;
        return;
    }

    container.innerHTML = news.map(n => `
        <div class="admin-breaking-item">
            <div class="admin-breaking-info">
                <img src="${n.image}" class="admin-breaking-thumb" alt="" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'48\' height=\'36\'><rect width=\'48\' height=\'36\' fill=\'%23e2e8f0\'/></svg>'">
                <div class="admin-breaking-text">
                    <span class="admin-breaking-cat">[${n.category}]</span>
                    <span class="admin-breaking-title">${n.title}</span>
                </div>
            </div>
            <label class="admin-breaking-toggle">
                <input type="checkbox" ${n.isBreaking ? 'checked' : ''} onchange="toggleBreakingStatus('${n.id}', this.checked)" style="width:16px; height:16px; accent-color:var(--primary);">
                <span>টিকারে প্রদর্শন</span>
            </label>
        </div>
    `).join('');
}

function toggleBreakingStatus(id, status) {
    const item = NewsDB.getNewsById(id);
    if (item) {
        item.isBreaking = status;
        NewsDB.saveNews(item);
    }
}

// ==========================================
// 6. ADMIN PIN AUTHENTICATION & EXPORT
// ==========================================

const ADMIN_MASTER_PIN = '2424';

function checkAdminAuth() {
    const isAuth = sessionStorage.getItem('ourtimes_admin_auth');
    const overlay = document.getElementById('adminPinOverlay');
    if (isAuth === 'true') {
        if (overlay) overlay.style.display = 'none';
    } else {
        if (overlay) overlay.style.display = 'flex';
        const pinInput = document.getElementById('adminPinInput');
        if (pinInput) setTimeout(() => pinInput.focus(), 100);
    }
}

function handlePinSubmit(e) {
    e.preventDefault();
    const pin = document.getElementById('adminPinInput')?.value.trim();
    const err = document.getElementById('pinError');
    if (pin === ADMIN_MASTER_PIN) {
        sessionStorage.setItem('ourtimes_admin_auth', 'true');
        const overlay = document.getElementById('adminPinOverlay');
        if (overlay) overlay.style.display = 'none';
    } else {
        if (err) err.style.display = 'block';
    }
}

function adminLogout() {
    if (confirm('আপনি কি নিশ্চিত যে অ্যাডমিন প্যানেল থেকে লগআউট করতে চান?')) {
        sessionStorage.removeItem('ourtimes_admin_auth');
        window.location.reload();
    }
}

function downloadNewsJs() {
    const all = NewsDB.getAllNews();
    const jsContent = `/**\n * OURTIMES24 - REAL ARCHIVE & PUBLISHED NEWS DATASET\n * Total Articles: ${all.length}\n * Generated: ${new Date().toISOString()}\n */\n\nwindow.RAW_NEWS_DATA = ` + JSON.stringify(all, null, 2) + `;\n`;
    
    const blob = new Blob([jsContent], { type: 'application/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'news_data.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function resetToDefaultData() {
    if (confirm('⚠️ আপনি কি ব্রাউজার ক্যাশ রিসেট করে news_data.js-এর মূল ডেটায় ফিরে যেতে চান? (আপনার সাম্প্রতিক অসংরক্ষিত পরিবর্তন মুছে যেতে পারে)')) {
        localStorage.removeItem('ourtimes_news_v2');
        alert('ক্যাশ সফলভাবে রিসেট হয়েছে!');
        window.location.reload();
    }
}

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuth();
    setupDropzone();
    renderNewsTable();
});
