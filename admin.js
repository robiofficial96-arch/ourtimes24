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

function renderNewsTable() {
    const container = document.getElementById('adminNewsListTable');
    if (!container) return;

    const news = NewsDB.getAllNews();

    if (news.length === 0) {
        container.innerHTML = `
            <div style="padding: 40px; text-align: center; color: var(--text-muted); background: var(--bg-subtle); border-radius: 8px; border: 1px dashed var(--border-color);">
                <i class="fa-regular fa-newspaper" style="font-size: 36px; margin-bottom: 12px; color: var(--text-muted);"></i>
                <div style="font-weight: 700;">এখনো কোনো সংবাদ প্রকাশিত হয়নি।</div>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div style="overflow-x: auto; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14.5px; text-align: left;">
                <thead>
                    <tr style="background: var(--bg-subtle); border-bottom: 2px solid var(--border-color);">
                        <th style="padding: 12px 14px; width: 70px;">ছবি</th>
                        <th style="padding: 12px 14px;">শিরোনাম</th>
                        <th style="padding: 12px 14px; width: 110px;">বিভাগ</th>
                        <th style="padding: 12px 14px; width: 140px;">তারিখ</th>
                        <th style="padding: 12px 14px; width: 140px; text-align: right;">অ্যাকশন</th>
                    </tr>
                </thead>
                <tbody id="newsTableBody">
                    ${news.map(n => `
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
        container.innerHTML = `<div style="padding: 24px; color: var(--text-muted);">কোনো সংবাদ পাওয়া যায়নি।</div>`;
        return;
    }

    container.innerHTML = news.map(n => `
        <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-subtle); padding:14px 18px; border-radius:6px; margin-bottom:10px; border:1px solid var(--border-color);">
            <div style="display: flex; align-items: center; gap: 12px;">
                <img src="${n.image}" style="width: 44px; height: 32px; object-fit: cover; border-radius: 4px;" alt="">
                <div>
                    <span style="color:var(--primary); font-weight:700; font-size:13px;">[${n.category}]</span>
                    <strong style="font-size:14.5px; margin-left: 4px;">${n.title}</strong>
                </div>
            </div>
            <label style="cursor:pointer; font-weight:700; color:var(--primary); display:flex; align-items:center; gap:6px; white-space:nowrap;">
                <input type="checkbox" ${n.isBreaking ? 'checked' : ''} onchange="toggleBreakingStatus('${n.id}', this.checked)">
                টিকারে দেখান
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
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    setupDropzone();
    renderNewsTable();
});
