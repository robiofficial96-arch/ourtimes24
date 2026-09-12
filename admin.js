/**
 * OURTIMES24 - ADMIN NEWSROOM DASHBOARD CONTROLLER
 * Integrated with Cloudinary Direct Media Upload (mlk8lrzc / ourtimes_news)
 */

const CLOUDINARY_CONFIG = {
    cloudName: 'mlk8lrzc',
    uploadPreset: 'ourtimes_news'
};

// Content & Excerpt Sanitizers (Removes dead ads, rnrn artifacts, fixes paragraphs)
function cleanNewsHtml(html) {
    if (!html) return '';
    let clean = html;
    clean = clean.replace(/<div\s+class=["']ads["'][\s\S]*?(?:<\/div>\s*){3,6}/gi, '');
    clean = clean.replace(/<div\s+id=["'](?:div-gpt-ad|google_ads_iframe)[\s\S]*?<\/div>/gi, '');
    clean = clean.replace(/<div[^>]*data-google-query-id[\s\S]*?<\/div>/gi, '');
    clean = clean.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    clean = clean.replace(/(?:rn|\n){2,}/gi, '</p><p>');
    clean = clean.replace(/rnrn/gi, '</p><p>');
    clean = clean.replace(/([।?!])\s*rn\s*/gi, '$1</p><p>');
    clean = clean.replace(/(<\/?(?:p|div|br|figure|img|span)[^>]*>)\s*rn\s*/gi, '$1');
    clean = clean.replace(/\s*rn\s*(<\/?(?:p|div|br|figure|img|span)[^>]*>)/gi, '$1');
    clean = clean.replace(/\s+rn\s+/gi, ' ');
    clean = clean.replace(/rn([A-Za-z0-9\u0980-\u09FF])/g, ' $1');
    clean = clean.replace(/([A-Za-z0-9\u0980-\u09FF])rn/g, '$1 ');
    clean = clean.replace(/<p>\s*<\/p>/gi, '');
    clean = clean.trim();
    if (clean && !clean.startsWith('<p>') && !clean.startsWith('<div') && !clean.startsWith('<figure')) {
        clean = `<p>${clean}</p>`;
    }
    return clean;
}

function cleanNewsExcerpt(text) {
    if (!text) return '';
    return text
        .replace(/rnrn/gi, ' ')
        .replace(/rn/gi, ' ')
        .replace(/[\r\n]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

// ==========================================
// 0. PREMIUM NOTIFICATIONS & TOAST SYSTEM
// ==========================================

function showAdminToast(type, title, message, duration = 4000) {
    const container = document.getElementById('adminToastContainer');
    if (!container) return;

    const iconMap = {
        success: 'fa-solid fa-circle-check',
        error: 'fa-solid fa-circle-xmark',
        warning: 'fa-solid fa-triangle-exclamation',
        info: 'fa-solid fa-circle-info'
    };

    const iconClass = iconMap[type] || iconMap.info;
    const toast = document.createElement('div');
    toast.className = `admin-toast-item toast-${type}`;
    
    toast.innerHTML = `
        <div class="admin-toast-icon">
            <i class="${iconClass}"></i>
        </div>
        <div class="admin-toast-content">
            <div class="admin-toast-title">${title}</div>
            <div class="admin-toast-message">${message}</div>
        </div>
        <button class="admin-toast-close" type="button" aria-label="Close">
            <i class="fa-solid fa-xmark"></i>
        </button>
    `;

    const closeBtn = toast.querySelector('.admin-toast-close');
    const dismiss = () => {
        if (toast.classList.contains('removing')) return;
        toast.classList.add('removing');
        setTimeout(() => {
            if (toast.parentNode) toast.remove();
        }, 300);
    };

    if (closeBtn) closeBtn.addEventListener('click', dismiss);
    container.appendChild(toast);

    if (duration > 0) {
        setTimeout(dismiss, duration);
    }
}

function showNewsPublishSuccessModal(newsItem) {
    const modal = document.getElementById('publishSuccessModalOverlay');
    if (!modal) return;

    const titleEl = document.getElementById('publishSuccessNewsTitle');
    const viewLink = document.getElementById('publishSuccessViewLink');
    const photocardLink = document.getElementById('publishSuccessPhotocardLink');

    if (titleEl && newsItem) {
        titleEl.textContent = `"${newsItem.title}"`;
    }
    if (viewLink && newsItem) {
        viewLink.href = `article?id=${encodeURIComponent(newsItem.id)}`;
    }
    if (photocardLink && newsItem) {
        photocardLink.href = `photocard?newsId=${encodeURIComponent(newsItem.id)}`;
    }

    modal.style.display = 'flex';
}

function closePublishSuccessModal() {
    const modal = document.getElementById('publishSuccessModalOverlay');
    if (modal) {
        modal.style.display = 'none';
    }
}

if (typeof window !== 'undefined') {
    window.showAdminToast = showAdminToast;
    window.showNewsPublishSuccessModal = showNewsPublishSuccessModal;
    window.closePublishSuccessModal = closePublishSuccessModal;
}

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
        showAdminToast('warning', 'অবৈধ ফাইল', 'অনুগ্রহ করে শুধুমাত্র একটি ইমেজ ফাইল (JPG, PNG, WebP) সিলেক্ট করুন!');
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
        showAdminToast('error', 'আপলোড ত্রুটি', 'ছবি আপলোডে সমস্যা হয়েছে: ' + err.message);
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
// 1.5 IN-ARTICLE RICH MEDIA & IMAGE INSERTION
// ==========================================

function insertTextAtCursor(textarea, textToInsert) {
    if (!textarea) return;
    const startPos = textarea.selectionStart || 0;
    const endPos = textarea.selectionEnd || 0;
    const currentText = textarea.value;

    textarea.value = currentText.substring(0, startPos) + textToInsert + currentText.substring(endPos, currentText.length);
    textarea.focus();
    textarea.selectionStart = startPos + textToInsert.length;
    textarea.selectionEnd = startPos + textToInsert.length;
}

function openInsertImageModal() {
    const modal = document.getElementById('insertImageModalOverlay');
    if (modal) {
        modal.style.display = 'flex';
        const urlInput = document.getElementById('inArticleImageUrl');
        const captionInput = document.getElementById('inArticleImageCaption');
        const fileInput = document.getElementById('inArticleImageFile');
        const previewBox = document.getElementById('inArticleImagePreviewBox');
        if (urlInput) urlInput.value = '';
        if (captionInput) captionInput.value = '';
        if (fileInput) fileInput.value = '';
        if (previewBox) previewBox.style.display = 'none';
    }
}

function closeInsertImageModal() {
    const modal = document.getElementById('insertImageModalOverlay');
    if (modal) modal.style.display = 'none';
}

function uploadInArticleImageToCloudinary(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showAdminToast('warning', 'অবৈধ ফাইল', 'অনুগ্রহ করে শুধুমাত্র ইমেজ ফাইল (JPG, PNG, WebP) সিলেক্ট করুন!');
        return;
    }

    const progressEl = document.getElementById('inArticleUploadProgress');
    if (progressEl) progressEl.style.display = 'block';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);

    fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`, {
        method: 'POST',
        body: formData
    })
    .then(res => {
        if (!res.ok) throw new Error(`সার্ভার এরর: ${res.status}`);
        return res.json();
    })
    .then(data => {
        if (data && data.secure_url) {
            const urlInput = document.getElementById('inArticleImageUrl');
            if (urlInput) {
                urlInput.value = data.secure_url;
                previewInArticleImage(data.secure_url);
            }
            showAdminToast('success', 'আপলোড সম্পন্ন', 'নিউজ বডির ছবিটি সফলভাবে আপলোড হয়েছে!');
        } else {
            throw new Error('Cloudinary থেকে লিঙ্ক পাওয়া যায়নি!');
        }
    })
    .catch(err => {
        console.error('In-Article Cloudinary Upload Error:', err);
        showAdminToast('error', 'আপলোড ত্রুটি', 'ছবি আপলোডে সমস্যা হয়েছে: ' + err.message);
    })
    .finally(() => {
        if (progressEl) progressEl.style.display = 'none';
    });
}

function previewInArticleImage(url) {
    const box = document.getElementById('inArticleImagePreviewBox');
    const img = document.getElementById('inArticleImagePreviewImg');
    if (box && img) {
        if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
            img.src = url;
            box.style.display = 'block';
        } else {
            img.src = '';
            box.style.display = 'none';
        }
    }
}

function insertInArticleImageToContent() {
    const url = document.getElementById('inArticleImageUrl')?.value.trim();
    const caption = document.getElementById('inArticleImageCaption')?.value.trim();
    const align = document.getElementById('inArticleImageAlign')?.value || 'center';
    const textarea = document.getElementById('newsContent');

    if (!url) {
        showAdminToast('warning', 'ছবি আবশ্যক', 'অনুগ্রহ করে একটি ছবি নির্বাচন করে আপলোড করুন অথবা ছবির লিঙ্ক দিন!');
        return;
    }

    let figureHtml = '';
    if (align === 'left') {
        figureHtml = `\n<figure class="in-article-image-box" style="float: left; margin: 12px 18px 16px 0; max-width: 320px; text-align: center;">\n    <img src="${url}" alt="${caption || 'সংবাদের ছবি'}" style="width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); display: block;">\n    ${caption ? `<figcaption style="font-size: 12.5px; color: #64748b; margin-top: 6px; font-style: italic;">${caption}</figcaption>` : ''}\n</figure>\n`;
    } else if (align === 'right') {
        figureHtml = `\n<figure class="in-article-image-box" style="float: right; margin: 12px 0 16px 18px; max-width: 320px; text-align: center;">\n    <img src="${url}" alt="${caption || 'সংবাদের ছবি'}" style="width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); display: block;">\n    ${caption ? `<figcaption style="font-size: 12.5px; color: #64748b; margin-top: 6px; font-style: italic;">${caption}</figcaption>` : ''}\n</figure>\n`;
    } else {
        figureHtml = `\n<figure class="in-article-image-box" style="margin: 24px auto; text-align: center; max-width: 100%;">\n    <img src="${url}" alt="${caption || 'সংবাদের ছবি'}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); display: block; margin: 0 auto;">\n    ${caption ? `<figcaption style="font-size: 13px; color: #64748b; margin-top: 8px; font-style: italic; text-align: center;">${caption}</figcaption>` : ''}\n</figure>\n`;
    }

    insertTextAtCursor(textarea, figureHtml);
    closeInsertImageModal();
}

function insertParagraphBreak() {
    const textarea = document.getElementById('newsContent');
    insertTextAtCursor(textarea, '\n\n');
}

function insertBoldText() {
    const textarea = document.getElementById('newsContent');
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const sel = textarea.value.substring(start, end) || 'গুরুত্বপূর্ণ লেখা';
    const boldText = `<b>${sel}</b>`;
    insertTextAtCursor(textarea, boldText);
}

function insertQuoteBlock() {
    const textarea = document.getElementById('newsContent');
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const sel = textarea.value.substring(start, end) || 'এখানে বিশেষ বক্তব্য বা উক্তি লিখুন...';
    const quoteHtml = `\n<blockquote style="border-left: 4px solid var(--primary); padding: 10px 16px; margin: 18px 0; background: var(--bg-surface-alt); font-style: italic; border-radius: 0 6px 6px 0;">\n    "${sel}"\n</blockquote>\n`;
    insertTextAtCursor(textarea, quoteHtml);
}

function insertHeadingBreak() {
    const textarea = document.getElementById('newsContent');
    insertTextAtCursor(textarea, '\n\n<h3>উপশিরোনাম এখানে লিখুন</h3>\n\n');
}

function insertQuoteBox() {
    insertQuoteBlock();
}

// ==========================================
// 2. NAVIGATION & TAB SWITCHING
// ==========================================

function switchAdminTab(tabId) {
    const user = UserStore.getCurrentUser();
    const role = user ? user.roleKey : 'reporter';

    // RBAC Security Guard: Normal reporters cannot open user manager, ads or ticker
    if (role === 'reporter' || role === 'correspondent') {
        if (tabId === 'tabAdSettings' || tabId === 'tabUserManager' || tabId === 'tabBreakingTicker') {
            showAdminToast('error', 'অনুমতি নেই', 'আপনার পদবি অনুযায়ী এই সেকশনে প্রবেশের অনুমতি নেই। আপনি সংবাদ প্রকাশ, তালিকা ও ফটো কার্ড ব্যবহার করতে পারবেন।');
            tabId = 'tabCreateNews';
        }
    } else if (role === 'subeditor') {
        if (tabId === 'tabAdSettings' || tabId === 'tabUserManager') {
            showAdminToast('warning', 'অনুমতি সীমাবদ্ধ', 'সহ-সম্পাদক হিসেবে আপনি শুধুমাত্র সংবাদ ও ব্রেকিং নিউজ নিয়ন্ত্রণ করতে পারবেন।');
            tabId = 'tabCreateNews';
        }
    }

    ['tabCreateNews', 'tabManageNews', 'tabAdSettings', 'tabBreakingTicker', 'tabUserManager'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = (id === tabId) ? 'block' : 'none';
    });

    ['btnTabCreate', 'btnTabManage', 'btnTabAds', 'btnTabBreaking', 'btnTabUsers'].forEach(id => {
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
    if (tabId === 'tabUserManager') {
        document.getElementById('btnTabUsers')?.classList.add('active');
        renderUserList();
    }
}

// ==========================================
// 2.5 AUTHOR & BYLINE CONTROLLER (DESK / USER / CUSTOM)
// ==========================================

const DESK_NAMES = {
    'desk_ourtimes': 'আওয়ার টাইমস২৪ ডেস্ক',
    'desk_online': 'অনলাইন ডেস্ক',
    'desk_staff': 'স্টাফ রিপোর্টার',
    'desk_special': 'বিশেষ প্রতিনিধি',
    'desk_own': 'নিজস্ব প্রতিবেদক',
    'desk_district': 'জেলা প্রতিনিধি',
    'desk_sports': 'খেলাধুলা ডেস্ক',
    'desk_biz': 'বাণিজ্য ডেস্ক',
    'desk_intl': 'আন্তর্জাতিক ডেস্ক'
};

function populateAuthorOptions() {
    const optgroupUsers = document.getElementById('optgroupRegisteredUsers');
    if (!optgroupUsers) return;

    const users = UserStore.getAll().filter(u => u.status === 'active');
    optgroupUsers.innerHTML = users.map(u => `
        <option value="user_${u.id}">${u.name} (${u.role})</option>
    `).join('');
}

function handleAuthorSelectChange(val) {
    const authorInput = document.getElementById('newsAuthor');
    const avatarInput = document.getElementById('newsAuthorAvatar');
    const idInput = document.getElementById('newsAuthorId');
    if (!authorInput) return;

    if (val.startsWith('desk_')) {
        const deskName = DESK_NAMES[val] || 'আওয়ার টাইমস২৪ ডেস্ক';
        authorInput.value = deskName;
        if (avatarInput) avatarInput.value = '';
        if (idInput) idInput.value = '';
        authorInput.readOnly = false;
        updateAuthorAvatarPreview('');
    } else if (val.startsWith('user_')) {
        const userId = val.replace('user_', '');
        const u = UserStore.getById(userId);
        if (u) {
            authorInput.value = u.name;
            if (avatarInput) avatarInput.value = u.avatar || '';
            if (idInput) idInput.value = u.id;
            authorInput.readOnly = false;
            updateAuthorAvatarPreview(u.avatar || '');
        }
    } else if (val === 'custom') {
        if (avatarInput) avatarInput.value = '';
        if (idInput) idInput.value = '';
        authorInput.readOnly = false;
        updateAuthorAvatarPreview('');
        authorInput.value = '';
        authorInput.focus();
    }
}

function updateAuthorAvatarPreview(avatarUrl) {
    const previewContainer = document.getElementById('authorAvatarPreview');
    const previewImg = document.getElementById('authorAvatarPreviewImg');
    if (previewContainer && previewImg) {
        if (avatarUrl) {
            previewImg.src = avatarUrl;
            previewContainer.style.display = 'flex';
        } else {
            previewImg.src = '';
            previewContainer.style.display = 'none';
        }
    }
}

function applyAuthorBylineRules(user) {
    if (!user) user = UserStore.getCurrentUser();
    if (!user) return;

    populateAuthorOptions();

    const selectorRow = document.getElementById('authorSelectorRow');
    const authorInput = document.getElementById('newsAuthor');
    const avatarInput = document.getElementById('newsAuthorAvatar');
    const idInput = document.getElementById('newsAuthorId');
    const badge = document.getElementById('reporterRoleBadge');
    const helpText = document.getElementById('authorHelpText');
    const authorSelect = document.getElementById('newsAuthorSelect');

    const role = user.roleKey || 'reporter';

    if (role === 'reporter' || role === 'correspondent') {
        // Normal user / reporter: Locked to their own verified account!
        if (selectorRow) selectorRow.style.display = 'none';
        if (authorInput) {
            authorInput.value = user.name;
            authorInput.readOnly = true;
            authorInput.style.backgroundColor = 'var(--bg-subtle)';
            authorInput.style.cursor = 'not-allowed';
        }
        if (avatarInput) avatarInput.value = user.avatar || '';
        if (idInput) idInput.value = user.id;
        if (badge) {
            badge.style.display = 'inline-block';
            badge.style.background = '#fef2f2';
            badge.style.color = '#dc2626';
            badge.innerHTML = `<i class="fa-solid fa-lock"></i> একাউন্ট লকড (${user.role})`;
        }
        if (helpText) {
            helpText.innerHTML = `<i class="fa-solid fa-shield-halved text-danger" style="margin-right: 4px;"></i> আপনার প্রোফাইল (<strong>${user.name}</strong>) থেকে সংবাদটি সরাসরি আপনার নামে প্রকাশিত হবে। নাম পরিবর্তন করার অনুমতি নেই।`;
        }
        updateAuthorAvatarPreview(user.avatar || '');
    } else {
        // Admin or Subeditor: Full freedom!
        if (selectorRow) selectorRow.style.display = 'block';
        if (authorInput) {
            authorInput.readOnly = false;
            authorInput.style.backgroundColor = 'var(--bg-surface)';
            authorInput.style.cursor = 'text';
            // Default to desk if empty
            if (!authorInput.value || authorInput.value === 'নিজস্ব প্রতিবেদক') {
                authorInput.value = 'আওয়ার টাইমস২৪ ডেস্ক';
                if (authorSelect) authorSelect.value = 'desk_ourtimes';
            }
        }
        if (badge) {
            badge.style.display = 'none';
        }
        if (helpText) {
            helpText.innerHTML = `<i class="fa-solid fa-pen-nib text-primary" style="margin-right: 4px;"></i> সংবাদে প্রদর্শিত প্রতিবেদকের নাম ড্রপডাউন থেকে সিলেক্ট করতে পারেন অথবা নতুন নাম লিখতে পারেন।`;
        }
    }
}

function populateAuthorOptions() {
    const select = document.getElementById('newsAuthorSelect');
    if (!select) return;

    const currentVal = select.value;
    const users = UserStore.getActiveUsers();

    // Group users by role
    const subeditors = users.filter(u => u.roleKey === 'subeditor');
    const reporters = users.filter(u => u.roleKey === 'reporter');
    const correspondents = users.filter(u => u.roleKey === 'correspondent');

    let html = `
        <optgroup label="বার্তা বিভাগ ও সাধারণ বাইলাইন">
            <option value="desk_ourtimes">আওয়ার টাইমস২৪ ডেস্ক</option>
            <option value="special_rep">বিশেষ প্রতিনিধি</option>
            <option value="own_rep">নিজস্ব প্রতিবেদক</option>
            <option value="court_rep">আদালত প্রতিবেদক</option>
            <option value="sports_rep">খেলাধুলা বিভাগ</option>
        </optgroup>
    `;

    if (users.length > 0) {
        html += `<optgroup label="নিবন্ধিত সাংবাদিক ও লেখকবৃন্দ">`;
        users.forEach(u => {
            html += `<option value="user_${u.id}">${u.name} (${u.role})</option>`;
        });
        html += `</optgroup>`;
    }

    html += `
        <optgroup label="কাস্টম বাইলাইন">
            <option value="custom">অন্যান্য / সরাসরি নাম লিখুন...</option>
        </optgroup>
    `;

    select.innerHTML = html;
    if (currentVal && select.querySelector(`option[value="${currentVal}"]`)) {
        select.value = currentVal;
    }
}

function handleAuthorSelectChange() {
    const select = document.getElementById('newsAuthorSelect');
    const input = document.getElementById('newsAuthor');
    const avatarInput = document.getElementById('newsAuthorAvatar');
    const idInput = document.getElementById('newsAuthorId');
    if (!select || !input) return;

    const val = select.value;

    if (val === 'custom') {
        input.value = '';
        input.readOnly = false;
        input.focus();
        if (avatarInput) avatarInput.value = '';
        if (idInput) idInput.value = '';
        updateAuthorAvatarPreview('');
    } else if (val.startsWith('user_')) {
        const userId = val.replace('user_', '');
        const user = UserStore.getById(userId);
        if (user) {
            input.value = user.name;
            input.readOnly = false;
            if (avatarInput) avatarInput.value = user.avatar || '';
            if (idInput) idInput.value = user.id;
            updateAuthorAvatarPreview(user.avatar || '');
        }
    } else {
        const text = select.options[select.selectedIndex].text;
        input.value = text;
        input.readOnly = false;
        if (avatarInput) avatarInput.value = '';
        if (idInput) idInput.value = '';
        updateAuthorAvatarPreview('');
    }
}

function updateAuthorAvatarPreview(avatarUrl) {
    const wrap = document.getElementById('authorAvatarPreviewWrap');
    const img = document.getElementById('authorAvatarPreviewImg');
    const note = document.getElementById('authorAvatarNote');
    if (!wrap || !img) return;

    if (avatarUrl) {
        img.src = avatarUrl;
        wrap.style.display = 'flex';
        if (note) note.textContent = 'ব্যবহারকারীর ভেরিফায়েড ছবি যুক্ত হয়েছে';
    } else {
        img.src = '';
        wrap.style.display = 'none';
        if (note) note.textContent = '';
    }
}

// ==========================================
// 2.5 CATEGORY STORE & DYNAMIC CATEGORY MANAGER
// ==========================================

const DEFAULT_CATEGORIES = [
    { name: 'জাতীয়', slug: 'national' },
    { name: 'রাজনীতি', slug: 'politics' },
    { name: 'অর্থনীতি', slug: 'economy' },
    { name: 'আন্তর্জাতিক', slug: 'international' },
    { name: 'খেলা', slug: 'sports' },
    { name: 'বিনোদন', slug: 'entertainment' },
    { name: 'প্রবাস', slug: 'probash' },
    { name: 'আইন-আদালত', slug: 'law' },
    { name: 'সারাদেশ', slug: 'countrywide' }
];

const CategoryStore = {
    getAll() {
        try {
            const raw = localStorage.getItem('ourtimes_custom_categories');
            const custom = raw ? JSON.parse(raw) : [];
            const combined = [...DEFAULT_CATEGORIES];
            custom.forEach(c => {
                if (!combined.some(existing => existing.name === c.name || existing.slug === c.slug)) {
                    combined.push(c);
                }
            });
            return combined;
        } catch (e) {
            return DEFAULT_CATEGORIES;
        }
    },

    getCustomOnly() {
        try {
            const raw = localStorage.getItem('ourtimes_custom_categories');
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    },

    add(name, slug) {
        if (!name || !name.trim()) return { success: false, message: 'বিভাগের নাম আবশ্যক' };
        name = name.trim();
        slug = slug && slug.trim() ? slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-') : 'cat-' + Date.now();

        const all = this.getAll();
        if (all.some(c => c.name.toLowerCase() === name.toLowerCase())) {
            return { success: false, message: 'এই নামে ইতিমধ্যে একটি বিভাগ রয়েছে' };
        }
        if (all.some(c => c.slug.toLowerCase() === slug.toLowerCase())) {
            slug = slug + '-' + Math.floor(Math.random() * 1000);
        }

        const custom = this.getCustomOnly();
        const newCat = { name, slug, isCustom: true };
        custom.push(newCat);
        localStorage.setItem('ourtimes_custom_categories', JSON.stringify(custom));
        return { success: true, category: newCat };
    },

    delete(slug) {
        const custom = this.getCustomOnly();
        const filtered = custom.filter(c => c.slug !== slug);
        localStorage.setItem('ourtimes_custom_categories', JSON.stringify(filtered));
        return true;
    },

    getSlugByName(name) {
        const cat = this.getAll().find(c => c.name === name);
        return cat ? cat.slug : 'general';
    }
};

if (typeof window !== 'undefined') {
    window.CategoryStore = CategoryStore;
}

function populateCategorySelects(selectedName = null) {
    const categories = CategoryStore.getAll();

    // 1. News Form Category Select
    const newsCatSelect = document.getElementById('newsCategory');
    if (newsCatSelect) {
        const currentVal = selectedName || newsCatSelect.value || 'জাতীয়';
        newsCatSelect.innerHTML = categories.map(c => `
            <option value="${c.name}">${c.name}</option>
        `).join('') + `
            <option value="__add_new__" style="color:var(--primary); font-weight:700;">+ নতুন বিভাগ যোগ করুন...</option>
        `;
        if (categories.some(c => c.name === currentVal)) {
            newsCatSelect.value = currentVal;
        } else {
            newsCatSelect.value = categories[0].name;
        }
    }

    // 2. Admin News List Filter
    const filterCatSelect = document.getElementById('adminCategoryFilter');
    if (filterCatSelect) {
        const currentFilter = filterCatSelect.value || 'all';
        filterCatSelect.innerHTML = `
            <option value="all">সকল বিভাগ</option>
            ${categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}
        `;
        if (currentFilter) filterCatSelect.value = currentFilter;
    }

    // 3. Render Custom Categories in Modal
    renderCategoryModalList();
}

function handleCategorySelectChange(val) {
    if (val === '__add_new__') {
        openCategoryModal();
        const newsCatSelect = document.getElementById('newsCategory');
        if (newsCatSelect) newsCatSelect.value = 'জাতীয়';
    }
}

function openCategoryModal() {
    const modal = document.getElementById('categoryModalOverlay');
    if (modal) {
        modal.style.display = 'flex';
        renderCategoryModalList();
        const input = document.getElementById('newCategoryName');
        if (input) {
            input.value = '';
            setTimeout(() => input.focus(), 80);
        }
        const slugInput = document.getElementById('newCategorySlug');
        if (slugInput) slugInput.value = '';
    }
}

function closeCategoryModal() {
    const modal = document.getElementById('categoryModalOverlay');
    if (modal) modal.style.display = 'none';
}

function renderCategoryModalList() {
    const container = document.getElementById('customCategoryListContainer');
    if (!container) return;

    const custom = CategoryStore.getCustomOnly();
    if (custom.length === 0) {
        container.innerHTML = `<span style="font-size:12px; color:var(--text-muted);">এখনো কোনো কাস্টম বিভাগ তৈরি করা হয়নি।</span>`;
        return;
    }

    container.innerHTML = custom.map(c => `
        <span style="display:inline-flex; align-items:center; gap:6px; background:var(--bg-surface-alt); border:1px solid var(--border-color); padding:4px 10px; border-radius:16px; font-size:12.5px; font-weight:600;">
            <span>${c.name}</span>
            <small style="color:var(--text-muted); font-size:11px;">(${c.slug})</small>
            <button type="button" onclick="deleteCategoryConfirm('${c.slug}')" style="background:none; border:none; color:#dc2626; cursor:pointer; padding:0 2px;" title="বিভাগ মুছুন">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </span>
    `).join('');
}

function handleCategorySubmit(e) {
    e.preventDefault();
    const name = document.getElementById('newCategoryName').value.trim();
    const slug = document.getElementById('newCategorySlug').value.trim();

    if (!name) {
        showAdminToast('warning', 'বিভাগ নাম আবশ্যক', 'অনুগ্রহ করে বিভাগের নাম লিখুন!');
        return;
    }

    const res = CategoryStore.add(name, slug);
    if (!res.success) {
        showAdminToast('error', 'ত্রুটি', res.message);
        return;
    }

    closeCategoryModal();
    populateCategorySelects(res.category.name);
    showAdminToast('success', 'নতুন বিভাগ যুক্ত', `নতুন বিভাগ "${res.category.name}" সফলভাবে যুক্ত হয়েছে!`);
}

function deleteCategoryConfirm(slug) {
    if (confirm('আপনি কি নিশ্চিত যে এই কাস্টম বিভাগটি মুছে ফেলতে চান?')) {
        CategoryStore.delete(slug);
        populateCategorySelects();
        showAdminToast('info', 'মুছে ফেলা হয়েছে', 'কাস্টম বিভাগটি মুছে ফেলা হয়েছে।');
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
    const author = document.getElementById('newsAuthor').value.trim() || 'নিজস্ব প্রতিবেদক';
    let authorAvatar = document.getElementById('newsAuthorAvatar')?.value || '';
    const authorId = document.getElementById('newsAuthorId')?.value || '';
    const rawContent = document.getElementById('newsContent').value.trim();
    let excerpt = document.getElementById('newsExcerpt').value.trim();

    // Auto-generate rich clean excerpt from news content if excerpt field is left empty
    if (!excerpt && rawContent) {
        const cleanContent = rawContent
            .replace(/<style[^>]*>.*?<\/style>/gis, '')
            .replace(/<script[^>]*>.*?<\/script>/gis, '')
            .replace(/<figure[^>]*>.*?<\/figure>/gis, '')
            .replace(/<blockquote[^>]*>.*?<\/blockquote>/gis, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/&nbsp;/gi, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        if (cleanContent) {
            excerpt = cleanContent.length > 175 ? cleanContent.substring(0, 170).trim() + '...' : cleanContent;
        }
    }
    if (!excerpt) {
        excerpt = subtitle || title;
    }
    let finalContent = rawContent;
    if (!finalContent.includes('<p>')) {
        finalContent = finalContent
            .split(/\n\s*\n/)
            .map(block => {
                block = block.trim();
                if (!block) return '';
                if (block.startsWith('<figure') || block.startsWith('<blockquote') || block.startsWith('<div')) {
                    return block;
                }
                return `<p>${block.replace(/\n/g, '<br>')}</p>`;
            })
            .filter(Boolean)
            .join('\n');
    }
    finalContent = cleanNewsHtml(finalContent);
    excerpt = cleanNewsExcerpt(excerpt);

    const isLead = document.getElementById('newsIsLead')?.checked || false;
    const isBreaking = document.getElementById('newsIsBreaking')?.checked || false;

    if (!image) {
        showAdminToast('warning', 'ফিচার্ড ছবি আবশ্যক', 'অনুগ্রহ করে সংবাদের একটি ফিচার্ড ছবি আপলোড করুন বা ছবির URL দিন!');
        return;
    }

    // Auto-match avatar from UserStore if authorId is provided or matches name
    if (!authorAvatar) {
        const matched = UserStore.getAll().find(u => (authorId && u.id === authorId) || u.name === author);
        if (matched && matched.avatar) {
            authorAvatar = matched.avatar;
        }
    }

    const categorySlug = CategoryStore.getSlugByName(category);

    const newsItem = {
        id,
        title,
        subtitle,
        category,
        categorySlug,
        district,
        author,
        authorAvatar,
        authorId,
        image,
        excerpt,
        content: finalContent || `<p>${excerpt}</p>`,
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

    // Sync to server (for Facebook / WhatsApp dynamic SSR crawling)
    try {
        fetch('api_save_news.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newsItem)
        }).catch(() => {});
    } catch (err) {}

    showNewsPublishSuccessModal(newsItem);
    showAdminToast('success', 'প্রকাশিত হয়েছে', 'সংবাদটি সফলভাবে সংরক্ষিত ও প্রকাশিত হয়েছে!');
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
                                <a href="article?id=${n.id}" target="_blank" style="color: var(--text-main); line-height: 1.4; display: inline-block;">
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
                                <a href="photocard?title=${encodeURIComponent(n.title)}&cat=${encodeURIComponent(n.category)}&img=${encodeURIComponent(n.image)}" target="_blank" class="tool-btn" style="display:inline-flex; padding:6px 10px; margin-right:4px; color:#059669; border-radius:4px;" title="ফটো কার্ড তৈরি">
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
                            <a href="article?id=${n.id}" target="_blank" class="mobile-news-title">${n.title}</a>
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
    
    if (document.getElementById('newsAuthorAvatar')) {
        document.getElementById('newsAuthorAvatar').value = item.authorAvatar || '';
    }
    if (document.getElementById('newsAuthorId')) {
        document.getElementById('newsAuthorId').value = item.authorId || '';
    }
    updateAuthorAvatarPreview(item.authorAvatar || '');

    // Sync select dropdown for admin/subeditor
    const currentUser = UserStore.getCurrentUser();
    if (currentUser && currentUser.roleKey !== 'reporter' && currentUser.roleKey !== 'correspondent') {
        const select = document.getElementById('newsAuthorSelect');
        if (select) {
            // Check if desk
            const deskEntry = Object.entries(DESK_NAMES).find(([k, v]) => v === item.author);
            if (deskEntry) {
                select.value = deskEntry[0];
            } else if (item.authorId) {
                select.value = `user_${item.authorId}`;
            } else {
                // Check user by name
                const userMatch = UserStore.getAll().find(u => u.name === item.author);
                if (userMatch) {
                    select.value = `user_${userMatch.id}`;
                } else {
                    select.value = 'custom';
                }
            }
        }
    } else {
        // Normal reporter editing: keep locked to reporter profile
        applyAuthorBylineRules(currentUser);
    }

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
    const user = UserStore.getCurrentUser();
    if (user && (user.roleKey === 'reporter' || user.roleKey === 'correspondent')) {
        showAdminToast('error', 'অনুমতি নেই', 'রিপোর্টার বা প্রতিনিধিদের প্রকাশিত সংবাদ মুছে ফেলার অনুমতি নেই। যেকোনো পরিবর্তনের জন্য বার্তা বিভাগে যোগাযোগ করুন।');
        return;
    }
    if (confirm('আপনি কি নিশ্চিত যে এই সংবাদটি মুছে ফেলতে চান?')) {
        NewsDB.deleteNews(id);
        renderNewsTable();
        showAdminToast('info', 'মুছে ফেলা হয়েছে', 'সংবাদটি সফলভাবে মুছে ফেলা হয়েছে।');
    }
}

function resetNewsForm() {
    const form = document.getElementById('newsForm');
    if (form) form.reset();
    
    document.getElementById('newsId').value = '';
    removeUploadedImage();
    
    const formTitle = document.getElementById('formTitle');
    if (formTitle) formTitle.textContent = 'নতুন সংবাদ লিখুন';

    const currentUser = UserStore.getCurrentUser();
    applyAuthorBylineRules(currentUser);
}

// ==========================================
// 4. SMART AD SPACE CONTROLLER (4 SLOTS)
// ==========================================

const AD_SLOTS = ['header', 'homeMiddle', 'sidebar', 'inArticle'];
const AD_SLOT_CAPS = {
    header: 'Header',
    homeMiddle: 'HomeMiddle',
    sidebar: 'Sidebar',
    inArticle: 'InArticle'
};

// Slot types state tracker: 'image' or 'code'
let adSlotTypes = {
    header: 'image',
    homeMiddle: 'image',
    sidebar: 'image',
    inArticle: 'image'
};

function toggleAdSlotInputs(slot) {
    const cap = AD_SLOT_CAPS[slot];
    const toggle = document.getElementById(`adToggle${cap}`);
    const statusText = document.getElementById(`adStatus${cap}`);
    const body = document.getElementById(`adBody${cap}`);
    if (!toggle) return;

    const isEnabled = toggle.checked;
    if (statusText) {
        statusText.textContent = isEnabled ? 'বিজ্ঞাপন সক্রিয়' : 'বিজ্ঞাপন বন্ধ';
        statusText.style.color = isEnabled ? '#16a34a' : 'var(--text-muted)';
    }
    if (body) {
        body.style.opacity = isEnabled ? '1' : '0.5';
        body.style.pointerEvents = isEnabled ? 'auto' : 'none';
    }
}

function switchSlotType(slot, type) {
    adSlotTypes[slot] = type;
    const cap = AD_SLOT_CAPS[slot];
    const btnImg = document.getElementById(`btnType${cap}Img`);
    const btnCode = document.getElementById(`btnType${cap}Code`);
    const secImg = document.getElementById(`sec${cap}Img`);
    const secCode = document.getElementById(`sec${cap}Code`);

    if (type === 'image') {
        if (btnImg) btnImg.classList.add('active');
        if (btnCode) btnCode.classList.remove('active');
        if (secImg) secImg.style.display = 'grid';
        if (secCode) secCode.style.display = 'none';
    } else {
        if (btnImg) btnImg.classList.remove('active');
        if (btnCode) btnCode.classList.add('active');
        if (secImg) secImg.style.display = 'none';
        if (secCode) secCode.style.display = 'block';
    }
}

function previewAdImage(slot, url) {
    const cap = AD_SLOT_CAPS[slot];
    const img = document.getElementById(`previewImg${cap}`);
    if (!img) return;

    if (url && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:'))) {
        img.src = url;
        img.style.display = 'block';
    } else {
        img.src = '';
        img.style.display = 'none';
    }
}

function handleAdFileUpload(slot, input) {
    const file = input.files && input.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showAdminToast('warning', 'অবৈধ ফাইল', 'অনুগ্রহ করে শুধুমাত্র একটি ইমেজ ফাইল নির্বাচন করুন (JPG, PNG, WebP)!');
        return;
    }

    const cap = AD_SLOT_CAPS[slot];
    const urlInput = document.getElementById(`adImg${cap}`);

    const label = input.parentElement;
    if (label) {
        label.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> আপলোড হচ্ছে...';
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);

    fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`, {
        method: 'POST',
        body: formData
    })
    .then(res => {
        if (!res.ok) throw new Error(`Cloudinary Error: ${res.status}`);
        return res.json();
    })
    .then(data => {
        if (data && data.secure_url) {
            if (urlInput) urlInput.value = data.secure_url;
            previewAdImage(slot, data.secure_url);
            showAdminToast('success', 'আপলোড সফল', 'ব্যানার ছবি সফলভাবে ক্লাউডিনারিতে আপলোড হয়েছে!');
        } else {
            throw new Error('কোনো ছবির URL পাওয়া যায়নি');
        }
    })
    .catch(err => {
        console.error('Ad Upload Error:', err);
        showAdminToast('error', 'আপলোড ত্রুটি', 'ছবি আপলোড করতে ব্যর্থ হয়েছে: ' + err.message);
    })
    .finally(() => {
        if (label) {
            label.innerHTML = `
                <i class="fa-solid fa-upload"></i> আপলোড
                <input type="file" accept="image/*" style="display:none;" onchange="handleAdFileUpload('${slot}', this)">
            `;
        }
    });
}

function loadAdSettings() {
    const config = NewsDB.getAdConfig();

    AD_SLOTS.forEach(slot => {
        const cap = AD_SLOT_CAPS[slot];
        const slotData = config[slot] || { enabled: false, type: 'image', imageUrl: '', linkUrl: '', code: '' };

        const toggle = document.getElementById(`adToggle${cap}`);
        const imgInput = document.getElementById(`adImg${cap}`);
        const linkInput = document.getElementById(`adLink${cap}`);
        const codeInput = document.getElementById(`adCode${cap}`);

        if (toggle) toggle.checked = !!slotData.enabled;
        if (imgInput) imgInput.value = slotData.imageUrl || '';
        if (linkInput) linkInput.value = slotData.linkUrl || '';
        if (codeInput) codeInput.value = slotData.code || '';

        switchSlotType(slot, slotData.type || 'image');
        toggleAdSlotInputs(slot);
        previewAdImage(slot, slotData.imageUrl || '');
    });
}

function handleSaveAdConfig(e) {
    if (e) e.preventDefault();

    const config = {};
    AD_SLOTS.forEach(slot => {
        const cap = AD_SLOT_CAPS[slot];
        const isEnabled = !!document.getElementById(`adToggle${cap}`)?.checked;
        const type = adSlotTypes[slot] || 'image';
        const imageUrl = document.getElementById(`adImg${cap}`)?.value.trim() || '';
        const linkUrl = document.getElementById(`adLink${cap}`)?.value.trim() || '';
        const code = document.getElementById(`adCode${cap}`)?.value.trim() || '';

        config[slot] = {
            enabled: isEnabled,
            type,
            imageUrl,
            linkUrl,
            code
        };
    });

    NewsDB.setAdConfig(config);
    showAdminToast('success', 'সংরক্ষিত', 'সকল বিজ্ঞাপন সেটিংস সফলভাবে সংরক্ষিত হয়েছে! মূল ওয়েবসাইটে সক্রিয় বিজ্ঞাপনগুলো প্রদর্শিত হবে।');
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

// ==========================================
// 6. USER & REPORTER REPOSITORY & CONTROLLER
// ==========================================

const DEFAULT_USERS = [
    {
        id: 'usr-1',
        name: 'সৈয়দ হাফিজ মনির',
        username: 'admin',
        role: 'প্রধান সম্পাদক / অ্যাডমিন',
        roleKey: 'admin',
        pin: '2424',
        phone: '+8801711152711',
        avatar: '',
        status: 'active',
        isMaster: true,
        createdAt: '২০২৬-০১-০১'
    },
    {
        id: 'usr-reporter',
        name: 'রবিউল ইসলাম',
        username: 'robi',
        role: 'স্টাফ রিপোর্টার',
        roleKey: 'reporter',
        pin: '1234',
        phone: '+8801812345678',
        avatar: '',
        status: 'active',
        isMaster: false,
        createdAt: '২০২৬-০১-০১'
    }
];

class UserStore {
    static getAll() {
        try {
            const raw = localStorage.getItem('ourtimes_users_v1');
            if (raw) {
                let parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    // Purge legacy demo users
                    parsed = parsed.filter(u => u.id !== 'usr-2' && u.id !== 'usr-3');
                    // Ensure usr-reporter exists so demo PIN 1234 works right away
                    if (!parsed.some(u => u.id === 'usr-reporter')) {
                        parsed.push(DEFAULT_USERS[1]);
                    }
                    if (parsed.length > 0) return parsed;
                }
            }
        } catch (e) {}
        localStorage.setItem('ourtimes_users_v1', JSON.stringify(DEFAULT_USERS));
        return DEFAULT_USERS;
    }

    static save(user) {
        const users = this.getAll();
        const index = users.findIndex(u => u.id === user.id);
        if (index >= 0) {
            users[index] = { ...users[index], ...user };
        } else {
            users.push(user);
        }
        localStorage.setItem('ourtimes_users_v1', JSON.stringify(users));
    }

    static delete(id) {
        const users = this.getAll();
        const target = users.find(u => u.id === id);
        if (target && target.isMaster) {
            showAdminToast('error', 'অনুমতি নেই', 'মাস্টার অ্যাডমিন একাউন্ট মুছে ফেলা সম্ভব নয়!');
            return false;
        }
        const filtered = users.filter(u => u.id !== id);
        localStorage.setItem('ourtimes_users_v1', JSON.stringify(filtered));
        return true;
    }

    static getById(id) {
        return this.getAll().find(u => u.id === id);
    }

    static getByPin(pin) {
        return this.getAll().find(u => String(u.pin) === String(pin) && u.status === 'active');
    }

    static getCurrentUser() {
        try {
            const raw = sessionStorage.getItem('ourtimes_admin_user');
            if (raw) return JSON.parse(raw);
        } catch (e) {}
        return this.getAll()[0];
    }

    static setCurrentUser(user) {
        sessionStorage.setItem('ourtimes_admin_user', JSON.stringify(user));
    }
}

if (typeof window !== 'undefined') {
    window.UserStore = UserStore;
}

// User Avatar Upload Helpers
function handleUserAvatarFileSelect(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showAdminToast('warning', 'অবৈধ ফাইল', 'অনুগ্রহ করে শুধুমাত্র ছবি ফাইল (JPG, PNG, WebP) নির্বাচন করুন!');
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxDim = 256;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxDim) {
                    height = Math.round((height * maxDim) / width);
                    width = maxDim;
                }
            } else {
                if (height > maxDim) {
                    width = Math.round((width * maxDim) / height);
                    height = maxDim;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            const compressedData = canvas.toDataURL('image/jpeg', 0.82);
            setUserModalAvatar(compressedData);
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function setUserModalAvatar(dataUrl) {
    const dataInput = document.getElementById('editUserAvatarData');
    const previewImg = document.getElementById('editUserAvatarPreviewImg');
    const icon = document.getElementById('editUserAvatarIcon');
    const btnRemove = document.getElementById('btnRemoveUserAvatar');

    if (dataInput) dataInput.value = dataUrl || '';
    if (previewImg && icon) {
        if (dataUrl) {
            previewImg.src = dataUrl;
            previewImg.style.display = 'block';
            icon.style.display = 'none';
            if (btnRemove) btnRemove.style.display = 'inline-flex';
        } else {
            previewImg.src = '';
            previewImg.style.display = 'none';
            icon.style.display = 'block';
            if (btnRemove) btnRemove.style.display = 'none';
        }
    }
}

function removeUserAvatar() {
    setUserModalAvatar('');
    const fileInput = document.getElementById('editUserAvatarFile');
    if (fileInput) fileInput.value = '';
}

let userPinVisibility = {};

function renderUserList() {
    const users = UserStore.getAll();
    const container = document.getElementById('adminUserListContainer');
    if (!container) return;

    // Stats
    const totalCount = users.length;
    const adminCount = users.filter(u => u.roleKey === 'admin').length;
    const reporterCount = users.filter(u => u.roleKey !== 'admin').length;

    const totalEl = document.getElementById('userTotalCount');
    const adminEl = document.getElementById('userAdminCount');
    const reporterEl = document.getElementById('userReporterCount');
    if (totalEl) totalEl.textContent = totalCount;
    if (adminEl) adminEl.textContent = adminCount;
    if (reporterEl) reporterEl.textContent = reporterCount;

    // Desktop Table
    const desktopTable = `
        <table class="user-table-desktop">
            <thead>
                <tr>
                    <th>ইউজার / প্রতিনিধি</th>
                    <th>ভূমিকা (Role)</th>
                    <th>ফোন নম্বর</th>
                    <th>লগইন পিন</th>
                    <th>স্ট্যাটাস</th>
                    <th style="text-align: right;">অ্যাকশন</th>
                </tr>
            </thead>
            <tbody>
                ${users.map(u => {
                    const isVisible = !!userPinVisibility[u.id];
                    const pinDisplay = isVisible ? u.pin : '••••';
                    return `
                        <tr>
                            <td>
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <div class="admin-user-avatar-circle" style="width: 36px; height: 36px; border-radius: 50%; background: var(--bg-surface); border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: center; font-weight: 800; color: var(--primary); overflow: hidden; flex-shrink: 0;">
                                        ${u.avatar ? `<img src="${u.avatar}" alt="" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">` : u.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div style="font-weight: 700;">${u.name}</div>
                                        <div style="font-size: 12px; color: var(--text-muted);">@${u.username} ${u.isMaster ? '<i class="fa-solid fa-crown" style="color: #f59e0b; margin-left: 4px;" title="মাস্টার অ্যাডমিন"></i> মাস্টার' : ''}</div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="user-role-badge ${u.roleKey || 'reporter'}">${u.role}</span>
                            </td>
                            <td>
                                <span style="font-size: 13px; font-family: monospace;">${u.phone || '—'}</span>
                            </td>
                            <td>
                                <div style="display: inline-flex; align-items: center; gap: 6px; background: var(--bg-surface); padding: 4px 8px; border-radius: 4px; border: 1px solid var(--border-color); font-family: monospace; font-weight: 700; letter-spacing: 2px;">
                                    <span>${pinDisplay}</span>
                                    <button type="button" onclick="toggleUserPinVisibility('${u.id}')" style="background: none; border: none; cursor: pointer; color: var(--text-muted); font-size: 12px; padding: 0 2px;" title="পিন দেখুন/লুকান">
                                        <i class="fa-solid ${isVisible ? 'fa-eye-slash' : 'fa-eye'}"></i>
                                    </button>
                                </div>
                            </td>
                            <td>
                                <span class="user-status-pill ${u.status === 'active' ? 'active' : 'inactive'}">
                                    ${u.status === 'active' ? '<i class="fa-solid fa-circle" style="font-size: 8px; margin-right: 4px;"></i>সক্রিয়' : '<i class="fa-regular fa-circle" style="font-size: 8px; margin-right: 4px;"></i>নিষ্ক্রিয়'}
                                </span>
                            </td>
                            <td style="text-align: right;">
                                <div style="display: inline-flex; gap: 6px;">
                                    <button type="button" class="tool-btn" style="padding: 6px 10px; font-size: 12px;" onclick="openUserModal('${u.id}')" title="সম্পাদনা">
                                        <i class="fa-solid fa-pen-to-square"></i>
                                    </button>
                                    ${!u.isMaster ? `
                                        <button type="button" class="tool-btn" style="padding: 6px 10px; font-size: 12px; color: #dc2626;" onclick="deleteUserConfirm('${u.id}')" title="মুছুন">
                                            <i class="fa-solid fa-trash"></i>
                                        </button>
                                    ` : `
                                        <button type="button" class="tool-btn" style="padding: 6px 10px; font-size: 12px; opacity: 0.3; cursor: not-allowed;" title="মাস্টার অ্যাডমিন মোছা যাবে না">
                                            <i class="fa-solid fa-lock"></i>
                                        </button>
                                    `}
                                </div>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;

    // Mobile Cards
    const mobileCards = `
        <div class="user-card-mobile">
            ${users.map(u => {
                const isVisible = !!userPinVisibility[u.id];
                const pinDisplay = isVisible ? u.pin : '••••';
                return `
                    <div class="user-item-mobile">
                        <div class="user-mobile-top">
                            <div style="display: flex; gap: 10px; align-items: center;">
                                <div class="admin-user-avatar-circle" style="width: 40px; height: 40px; border-radius: 50%; background: var(--bg-surface); border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: center; font-weight: 800; color: var(--primary); font-size: 16px; overflow: hidden; flex-shrink: 0;">
                                    ${u.avatar ? `<img src="${u.avatar}" alt="" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">` : u.name.charAt(0)}
                                </div>
                                <div>
                                    <div style="font-weight: 800; font-size: 15px;">${u.name}</div>
                                    <div style="font-size: 12px; color: var(--text-muted);">@${u.username} ${u.isMaster ? '<i class="fa-solid fa-crown" style="color: #f59e0b; margin-left: 2px;" title="মাস্টার অ্যাডমিন"></i> ' : ''}• <span class="user-role-badge ${u.roleKey || 'reporter'}">${u.role}</span></div>
                                </div>
                            </div>
                            <span class="user-status-pill ${u.status === 'active' ? 'active' : 'inactive'}">
                                ${u.status === 'active' ? '<i class="fa-solid fa-circle" style="font-size: 8px; margin-right: 4px;"></i>সক্রিয়' : '<i class="fa-regular fa-circle" style="font-size: 8px; margin-right: 4px;"></i>নিষ্ক্রিয়'}
                            </span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 13px; background: var(--bg-surface); padding: 8px 12px; border-radius: 4px; border: 1px solid var(--border-color);">
                            <span>ফোন: <strong>${u.phone || '—'}</strong></span>
                            <div style="display: flex; align-items: center; gap: 6px; font-family: monospace; font-weight: 700;">
                                <span>পিন: ${pinDisplay}</span>
                                <button type="button" onclick="toggleUserPinVisibility('${u.id}')" style="background: none; border: none; cursor: pointer; color: var(--text-muted);">
                                    <i class="fa-solid ${isVisible ? 'fa-eye-slash' : 'fa-eye'}"></i>
                                </button>
                            </div>
                        </div>
                        <div class="user-mobile-actions">
                            <button type="button" class="tool-btn" style="padding: 8px;" onclick="openUserModal('${u.id}')">
                                <i class="fa-solid fa-pen-to-square"></i> সম্পাদনা
                            </button>
                            ${!u.isMaster ? `
                                <button type="button" class="tool-btn" style="padding: 8px; color: #dc2626;" onclick="deleteUserConfirm('${u.id}')">
                                    <i class="fa-solid fa-trash"></i> মুছুন
                                </button>
                            ` : `
                                <button type="button" class="tool-btn" style="padding: 8px; opacity: 0.4; cursor: not-allowed;" title="মাস্টার অ্যাডমিন">
                                    <i class="fa-solid fa-lock"></i> সুরক্ষিত
                                </button>
                            `}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;

    container.innerHTML = desktopTable + mobileCards;
}

function toggleUserPinVisibility(id) {
    userPinVisibility[id] = !userPinVisibility[id];
    renderUserList();
}

function updateRolePermissionHint() {
    const select = document.getElementById('editUserRole');
    const hintText = document.getElementById('rolePermissionHintText');
    if (!select || !hintText) return;

    const role = select.value;
    if (role === 'admin') {
        hintText.innerHTML = '<strong>প্রধান সম্পাদক / অ্যাডমিন:</strong> সম্পূর্ণ সাইট নিয়ন্ত্রণ — সংবাদ প্রকাশ, ইউজার ও রিপোর্টার তৈরি/মুছে ফেলা, বিজ্ঞাপন সেটিংস এবং ব্রেকিং নিউজ পরিবর্তন।';
    } else if (role === 'subeditor') {
        hintText.innerHTML = '<strong>সহ-সম্পাদক:</strong> সংবাদ তৈরি ও সম্পাদনা, ব্রেকিং নিউজ সরাসরি নিয়ন্ত্রণ এবং ফটো কার্ড স্টুডিও অ্যাক্সেস। (ইউজার ও বিজ্ঞাপন লক থাকবে)';
    } else if (role === 'correspondent') {
        hintText.innerHTML = '<strong>জেলা প্রতিনিধি:</strong> নিজের জেলার সংবাদ পাঠানো, সংবাদ তালিকা দেখা এবং সংবাদের ফটো কার্ড তৈরি। (অন্যান্য নিয়ন্ত্রণ লক থাকবে)';
    } else {
        hintText.innerHTML = '<strong>স্টাফ রিপোর্টার:</strong> শুধুমাত্র নতুন সংবাদ প্রকাশ, সংবাদ তালিকা দেখা ও সংবাদের ফটো কার্ড তৈরি করতে পারবেন। ইউজার ও বিজ্ঞাপন নিয়ন্ত্রণ লক থাকবে।';
    }
}

function openUserModal(userId = null) {
    const modal = document.getElementById('userModalOverlay');
    const form = document.getElementById('userForm');
    const modalTitle = document.getElementById('userModalTitle');
    if (!modal) return;

    if (userId) {
        const u = UserStore.getById(userId);
        if (!u) return;
        if (modalTitle) modalTitle.textContent = 'ইউজার তথ্য সম্পাদনা করুন';
        document.getElementById('editUserId').value = u.id;
        document.getElementById('editUserName').value = u.name;
        document.getElementById('editUserUsername').value = u.username;
        document.getElementById('editUserRole').value = u.roleKey || 'reporter';
        document.getElementById('editUserPhone').value = u.phone || '';
        document.getElementById('editUserPin').value = u.pin || '';
        document.getElementById('editUserStatus').value = u.status || 'active';
        setUserModalAvatar(u.avatar || '');
    } else {
        if (modalTitle) modalTitle.textContent = 'নতুন ইউজার / প্রতিনিধি যোগ করুন';
        if (form) form.reset();
        document.getElementById('editUserId').value = '';
        document.getElementById('editUserRole').value = 'reporter';
        document.getElementById('editUserStatus').value = 'active';
        setUserModalAvatar('');
    }

    updateRolePermissionHint();
    modal.style.display = 'flex';
}

function closeUserModal() {
    const modal = document.getElementById('userModalOverlay');
    if (modal) modal.style.display = 'none';
}

function handleUserSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('editUserId').value || `usr-${Date.now()}`;
    const name = document.getElementById('editUserName').value.trim();
    const username = document.getElementById('editUserUsername').value.trim().toLowerCase();
    const roleKey = document.getElementById('editUserRole').value;
    const phone = document.getElementById('editUserPhone').value.trim();
    const pin = document.getElementById('editUserPin').value.trim();
    const status = document.getElementById('editUserStatus').value;
    const avatar = document.getElementById('editUserAvatarData')?.value || '';

    const roleMap = {
        'admin': 'প্রধান সম্পাদক / অ্যাডমিন',
        'subeditor': 'সহ-সম্পাদক',
        'reporter': 'স্টাফ রিপোর্টার',
        'correspondent': 'জেলা প্রতিনিধি'
    };

    if (!name || !username || !pin) {
        showAdminToast('warning', 'ফর্ম ত্রুটি', 'অনুগ্রহ করে নাম, ইউজারনেম এবং গোপন পিন পূরণ করুন!');
        return;
    }

    if (pin.length < 4 || pin.length > 6) {
        showAdminToast('warning', 'পিন ত্রুটি', 'গোপন পিন অবশ্যই ৪ থেকে ৬ সংখ্যার হতে হবে!');
        return;
    }

    const existingUser = UserStore.getById(id);
    const isMaster = existingUser ? !!existingUser.isMaster : false;

    const userData = {
        id,
        name,
        username,
        role: roleMap[roleKey] || 'স্টাফ রিপোর্টার',
        roleKey,
        phone,
        pin,
        avatar: avatar || (existingUser ? existingUser.avatar || '' : ''),
        status,
        isMaster,
        createdAt: existingUser ? existingUser.createdAt : new Date().toISOString().split('T')[0]
    };

    UserStore.save(userData);

    // If currently logged-in user is updated, sync session
    const currentUser = UserStore.getCurrentUser();
    if (currentUser && currentUser.id === id) {
        UserStore.setCurrentUser(userData);
    }

    closeUserModal();
    renderUserList();
    updateCurrentUserUI();
    populateAuthorOptions();
    showAdminToast('success', 'সংরক্ষিত', 'ইউজার তথ্য সফলভাবে সংরক্ষিত হয়েছে!');
}

function deleteUserConfirm(id) {
    const u = UserStore.getById(id);
    if (!u) return;
    if (u.isMaster) {
        showAdminToast('error', 'অনুমতি নেই', 'মাস্টার অ্যাডমিন একাউন্ট মুছে ফেলা যাবে না!');
        return;
    }
    if (confirm(`আপনি কি নিশ্চিত যে "${u.name}"-এর একাউন্টটি মুছে ফেলতে চান?`)) {
        UserStore.delete(id);
        renderUserList();
        showAdminToast('info', 'মুছে ফেলা হয়েছে', `"${u.name}"-এর একাউন্ট মুছে ফেলা হয়েছে।`);
    }
}

// ==========================================
// 7. ADMIN AUTHENTICATION & RBAC ENFORCER
// ==========================================

const ADMIN_MASTER_PIN = '2424';

function applyUserPermissions(user) {
    if (!user) user = UserStore.getCurrentUser();
    if (!user) return;

    const role = user.roleKey || 'reporter';
    const btnUsers = document.getElementById('btnTabUsers');
    const btnAds = document.getElementById('btnTabAds');
    const btnBreaking = document.getElementById('btnTabBreaking');

    if (role === 'reporter' || role === 'correspondent') {
        // Normal users / reporters: Only News + Photo Card
        if (btnUsers) btnUsers.style.display = 'none';
        if (btnAds) btnAds.style.display = 'none';
        if (btnBreaking) btnBreaking.style.display = 'none';
    } else if (role === 'subeditor') {
        // Sub-editor: News + Breaking + Photo Card (No Users, No Ads)
        if (btnUsers) btnUsers.style.display = 'none';
        if (btnAds) btnAds.style.display = 'none';
        if (btnBreaking) btnBreaking.style.display = 'flex';
    } else {
        // Full Admin: Show all
        if (btnUsers) btnUsers.style.display = 'flex';
        if (btnAds) btnAds.style.display = 'flex';
        if (btnBreaking) btnBreaking.style.display = 'flex';
    }
}

function checkAdminAuth() {
    const isAuth = sessionStorage.getItem('ourtimes_admin_auth');
    const overlay = document.getElementById('adminPinOverlay');
    if (isAuth === 'true') {
        if (overlay) overlay.style.display = 'none';
        updateCurrentUserUI();
    } else {
        if (overlay) overlay.style.display = 'flex';
        const pinInput = document.getElementById('adminPinInput');
        if (pinInput) setTimeout(() => pinInput.focus(), 100);
    }
}

function updateCurrentUserUI() {
    const user = UserStore.getCurrentUser();
    if (!user) return;

    const nameEl = document.getElementById('adminCurrentUserName');
    const roleEl = document.getElementById('adminCurrentUserRole');
    const badgeEl = document.getElementById('adminCurrentUserBadge');
    
    if (nameEl) nameEl.textContent = user.name;
    if (roleEl) {
        roleEl.textContent = user.role;
        if (user.roleKey === 'admin') {
            roleEl.style.background = 'var(--primary)';
        } else if (user.roleKey === 'subeditor') {
            roleEl.style.background = '#2563eb';
        } else {
            roleEl.style.background = '#16a34a';
        }
    }

    if (badgeEl) {
        const avatarCircle = badgeEl.querySelector('.admin-user-avatar-circle');
        if (avatarCircle) {
            if (user.avatar) {
                avatarCircle.innerHTML = `<img src="${user.avatar}" alt="" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
            } else {
                let iconClass = 'fa-solid fa-feather-pointed';
                if (user.roleKey === 'admin') iconClass = 'fa-solid fa-user-shield';
                else if (user.roleKey === 'subeditor') iconClass = 'fa-solid fa-pen-nib';
                avatarCircle.innerHTML = `<i class="${iconClass}" id="adminCurrentUserIcon"></i>`;
            }
        }
    }

    // Apply strict tab permissions
    applyUserPermissions(user);

    // Apply author/byline rules for this user
    applyAuthorBylineRules(user);
}

function handlePinSubmit(e) {
    e.preventDefault();
    const pin = document.getElementById('adminPinInput')?.value.trim();
    const err = document.getElementById('pinError');

    // Check against registered users or fallback master pin
    const matchedUser = UserStore.getByPin(pin);
    if (pin === ADMIN_MASTER_PIN || matchedUser) {
        sessionStorage.setItem('ourtimes_admin_auth', 'true');
        const activeUser = matchedUser || (pin === ADMIN_MASTER_PIN ? UserStore.getAll().find(u => u.isMaster) || UserStore.getAll()[0] : UserStore.getAll()[0]);
        UserStore.setCurrentUser(activeUser);
        const overlay = document.getElementById('adminPinOverlay');
        if (overlay) overlay.style.display = 'none';
        updateCurrentUserUI();
        if (err) err.style.display = 'none';

        // Redirect reporters to News creation immediately
        if (activeUser.roleKey === 'reporter' || activeUser.roleKey === 'correspondent') {
            switchAdminTab('tabCreateNews');
        }
    } else {
        if (err) err.style.display = 'block';
    }
}

function adminLogout() {
    if (confirm('আপনি কি নিশ্চিত যে অ্যাডমিন প্যানেল থেকে লগআউট করতে চান?')) {
        sessionStorage.removeItem('ourtimes_admin_auth');
        sessionStorage.removeItem('ourtimes_admin_user');
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
    if (confirm('আপনি কি ব্রাউজার ক্যাশ রিসেট করে news_data.js-এর মূল ডেটায় ফিরে যেতে চান? (আপনার সাম্প্রতিক অসংরক্ষিত পরিবর্তন মুছে যেতে পারে)')) {
        localStorage.removeItem('ourtimes_news_v2');
        localStorage.removeItem('ourtimes_news_v3');
        showAdminToast('success', 'ক্যাশ রিসেট', 'ক্যাশ সফলভাবে রিসেট হয়েছে!');
        setTimeout(() => window.location.reload(), 800);
    }
}

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    UserStore.getAll(); // seed default users
    populateCategorySelects();
    checkAdminAuth();
    setupDropzone();
    renderNewsTable();
});
