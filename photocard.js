/**
 * OURTIMES24 - ULTRA-PREMIUM SOCIAL PHOTO CARD CANVAS ENGINE (2026)
 */

const canvas = document.getElementById('photoCardCanvas');
const ctx = canvas.getContext('2d');

let currentTemplate = 'classic';
let activeImage = new Image();
let imageLoaded = false;

// Dedicated Bengali Brand Typography Vector Drawer for Canvas
function drawBanglaBrandLogo(context, x, y, options = {}) {
    context.save();
    const fontSize = options.fontSize || 36;
    const fontPrimaryColor = options.fontPrimaryColor || '#ffffff';
    const numColor = options.numColor || '#ef4444';
    const showTagline = options.showTagline !== false;
    const align = options.align || 'left';

    context.textAlign = 'left';
    context.textBaseline = 'middle';
    
    // Measure Bengali logo text
    context.font = `900 ${fontSize}px "Anek Bangla", "Hind Siliguri", sans-serif`;
    const textMain = 'আওয়ার টাইমস';
    const textNum = '২৪';
    const wMain = context.measureText(textMain).width;
    const wNum = context.measureText(textNum).width;
    const spacing = Math.round(fontSize * 0.1);
    const totalW = wMain + spacing + wNum;

    let startX = x;
    if (align === 'right') {
        startX = x - totalW;
    } else if (align === 'center') {
        startX = x - (totalW / 2);
    }

    // Main text: আওয়ার টাইমস
    context.fillStyle = fontPrimaryColor;
    context.fillText(textMain, startX, y);

    // Number text: ২৪
    context.fillStyle = numColor;
    context.fillText(textNum, startX + wMain + spacing, y);

    // Red dot accent
    const dotRadius = Math.max(2, Math.round(fontSize * 0.08));
    context.beginPath();
    context.arc(startX + totalW + (dotRadius * 1.6), y + (fontSize * 0.18), dotRadius, 0, Math.PI * 2);
    context.fillStyle = numColor;
    context.fill();

    // Optional Tagline below
    if (showTagline) {
        const taglineFontSize = Math.max(12, Math.round(fontSize * 0.35));
        context.font = `600 ${taglineFontSize}px "Hind Siliguri", sans-serif`;
        context.fillStyle = options.taglineColor || (fontPrimaryColor === '#ffffff' ? '#cbd5e1' : '#64748b');
        const taglineText = options.taglineText || 'সত্য ও বস্তুনিষ্ঠ সংবাদ';
        context.fillText(taglineText, startX, y + (fontSize * 0.62));
    }
    context.restore();
}

// Pan & Zoom state
let imageX = 0;
let imageY = 0;
let imageZoom = 1.0;
let isDragging = false;
let startX = 0;
let startY = 0;
let headlineFontSize = 48;

// Initialize Default Image
activeImage.crossOrigin = "anonymous";
activeImage.onload = () => {
    imageLoaded = true;
    resetImagePosition();
    renderCanvas();
};

function initDefaultPhotoCardData() {
    const params = new URLSearchParams(window.location.search);
    if (!params.get('title') && !params.get('img')) {
        const defaultArt = (typeof NewsDB !== 'undefined' && NewsDB.getAllNews) ? NewsDB.getAllNews()[0] : null;
        if (defaultArt) {
            const headlineEl = document.getElementById('cardHeadline');
            if (headlineEl && !headlineEl.value) {
                headlineEl.value = defaultArt.title;
            }
            const catEl = document.getElementById('cardCategory');
            if (catEl && defaultArt.category) {
                catEl.value = defaultArt.category;
            }
            if (defaultArt.image && defaultArt.image !== 'logo.png') {
                activeImage.src = defaultArt.image;
                return;
            }
        }
    }
    if (!activeImage.src) {
        const withImg = (typeof NewsDB !== 'undefined' && NewsDB.getAllNews)
            ? NewsDB.getAllNews().find(a => a.image && a.image !== 'logo.png')
            : null;
        activeImage.src = withImg ? withImg.image : 'uploads/0000.webp';
    }
}

function initCardDate() {
    const cardDateInput = document.getElementById('cardDate');
    if (!cardDateInput || cardDateInput.value) return;
    const banglaDigits = {'0':'০','1':'১','2':'২','3':'৩','4':'৪','5':'৫','6':'৬','7':'৭','8':'৮','9':'৯'};
    const months = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
    const now = new Date();
    const day = String(now.getDate()).replace(/[0-9]/g, d => banglaDigits[d]);
    const month = months[now.getMonth()];
    const year = String(now.getFullYear()).replace(/[0-9]/g, d => banglaDigits[d]);
    cardDateInput.value = `${day} ${month} ${year}`;
}

function loadImageFromUrl(url) {
    if (!url) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
        activeImage = img;
        imageLoaded = true;
        resetImagePosition();
        renderCanvas();
    };
    img.onerror = () => {
        console.warn("Retrying image load without CORS headers...");
        const fallback = new Image();
        fallback.onload = () => {
            activeImage = fallback;
            imageLoaded = true;
            resetImagePosition();
            renderCanvas();
        };
        fallback.src = url;
    };
    img.src = url;
}

// Check for URL Query Parameters from Single Article Page or Admin
window.addEventListener('DOMContentLoaded', () => {
    initCardDate();

    // Load custom categories from CategoryStore/localStorage if present
    try {
        const raw = localStorage.getItem('ourtimes_custom_categories_v1');
        if (raw) {
            const custom = JSON.parse(raw);
            if (Array.isArray(custom)) {
                const catSelect = document.getElementById('cardCategory');
                if (catSelect) {
                    custom.forEach(c => {
                        if (!Array.from(catSelect.options).some(opt => opt.value === c.name)) {
                            const opt = document.createElement('option');
                            opt.value = c.name;
                            opt.textContent = c.name;
                            catSelect.appendChild(opt);
                        }
                    });
                }
            }
        }
    } catch(e) {}

    const params = new URLSearchParams(window.location.search);
    const titleParam = params.get('title');
    const catParam = params.get('cat');
    const imgParam = params.get('img');
    const dateParam = params.get('date');

    if (titleParam) document.getElementById('cardHeadline').value = titleParam;
    if (catParam) document.getElementById('cardCategory').value = catParam;
    if (dateParam) document.getElementById('cardDate').value = dateParam;
    if (imgParam) {
        const urlInput = document.getElementById('imageUrlInput');
        if (urlInput) urlInput.value = imgParam;
        loadImageFromUrl(imgParam);
    } else {
        initDefaultPhotoCardData();
    }

    if (document.fonts) {
        document.fonts.ready.then(() => renderCanvas());
    }
});

// Image Upload Handler
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            activeImage = img;
            imageLoaded = true;
            resetImagePosition();
            renderCanvas();
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function handleImageUrlChange(val) {
    const trimmed = (val || '').trim();
    if (trimmed) {
        loadImageFromUrl(trimmed);
    }
}

// Reset Image Position
function resetImagePosition() {
    imageX = 0;
    imageY = 0;
    imageZoom = 1.0;
    const slider = document.getElementById('zoomSlider');
    const val = document.getElementById('zoomVal');
    if (slider) slider.value = 1.0;
    if (val) val.textContent = '1.0x';
    renderCanvas();
}

// Update Zoom
function updateImageZoom(val) {
    imageZoom = parseFloat(val);
    const label = document.getElementById('zoomVal');
    if (label) label.textContent = `${imageZoom.toFixed(2)}x`;
    renderCanvas();
}

// Update Font Size
function updateFontSize(val) {
    headlineFontSize = parseInt(val);
    const label = document.getElementById('fontSizeVal');
    if (label) label.textContent = `${headlineFontSize}px`;
    renderCanvas();
}

// Set Template
function setTemplate(tpl) {
    currentTemplate = tpl;
    document.querySelectorAll('.template-card').forEach(c => c.classList.remove('active'));
    const tplCard = document.getElementById(`tpl-${tpl}`);
    if (tplCard) tplCard.classList.add('active');

    const quoteFields = document.getElementById('quoteFields');
    if (quoteFields) {
        quoteFields.style.display = (tpl === 'quote') ? 'block' : 'none';
    }

    renderCanvas();
}

// Mouse Pan / Drag Events for Canvas
canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    const rect = canvas.getBoundingClientRect();
    const scale = 1080 / rect.width;
    startX = (e.clientX - rect.left) * scale - imageX;
    startY = (e.clientY - rect.top) * scale - imageY;
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const rect = canvas.getBoundingClientRect();
    const scale = 1080 / rect.width;
    imageX = (e.clientX - rect.left) * scale - startX;
    imageY = (e.clientY - rect.top) * scale - startY;
    renderCanvas();
});

window.addEventListener('mouseup', () => {
    isDragging = false;
});

// Touch Pan / Drag Events for Mobile Phones (Touchscreens)
canvas.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches.length === 1) {
        e.preventDefault();
        isDragging = true;
        const rect = canvas.getBoundingClientRect();
        const scale = 1080 / rect.width;
        startX = (e.touches[0].clientX - rect.left) * scale - imageX;
        startY = (e.touches[0].clientY - rect.top) * scale - imageY;
    }
}, { passive: false });

window.addEventListener('touchmove', (e) => {
    if (!isDragging || !e.touches || e.touches.length !== 1) return;
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const scale = 1080 / rect.width;
    imageX = (e.touches[0].clientX - rect.left) * scale - startX;
    imageY = (e.touches[0].clientY - rect.top) * scale - startY;
    renderCanvas();
}, { passive: false });

window.addEventListener('touchend', () => {
    isDragging = false;
});

window.addEventListener('touchcancel', () => {
    isDragging = false;
});

// Helper: Rounded Rectangle
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof radius === 'undefined') radius = 5;
    if (typeof radius === 'number') radius = { tl: radius, tr: radius, br: radius, bl: radius };
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
}

// Helper: Text Wrapping for Canvas
function wrapText(context, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    const lines = [];

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            lines.push(line);
            line = words[n] + ' ';
        } else {
            line = testLine;
        }
    }
    lines.push(line);

    for (let k = 0; k < lines.length; k++) {
        context.fillText(lines[k].trim(), x, y + (k * lineHeight));
    }
    return lines.length * lineHeight;
}

// MAIN RENDER CANVAS FUNCTION
function renderCanvas() {
    ctx.clearRect(0, 0, 1080, 1080);
    ctx.fillStyle = '#0a0f1d';
    ctx.fillRect(0, 0, 1080, 1080);

    const headline = document.getElementById('cardHeadline').value || '';
    const category = document.getElementById('cardCategory').value || 'জাতীয়';
    const date = document.getElementById('cardDate').value || '২৯ আগস্ট ২০২৬';
    const speaker = document.getElementById('cardSpeaker')?.value || '';
    const showLogo = document.getElementById('toggleLogo').checked;
    const showWatermark = document.getElementById('toggleWatermark').checked;

    // 1. Draw Background Image
    if (imageLoaded && activeImage.width > 0) {
        ctx.save();
        const baseWidth = 1080 * imageZoom;
        const baseHeight = (activeImage.height / activeImage.width) * baseWidth;
        const drawX = (1080 - baseWidth) / 2 + imageX;
        const drawY = (1080 - baseHeight) / 2 + imageY;
        ctx.drawImage(activeImage, drawX, drawY, baseWidth, baseHeight);
        ctx.restore();
    }

    // 2. Render Template Overlays
    if (currentTemplate === 'classic') {
        renderClassicTemplate(headline, category, date, showLogo, showWatermark);
    } else if (currentTemplate === 'quote') {
        renderQuoteTemplate(headline, speaker, date, showLogo, showWatermark);
    } else if (currentTemplate === 'breaking') {
        renderBreakingTemplate(headline, category, date, showLogo, showWatermark);
    } else if (currentTemplate === 'sports') {
        renderSportsTemplate(headline, category, date, showLogo, showWatermark);
    }
}

// TEMPLATE 1: CLASSIC EDITORIAL CARD
function renderClassicTemplate(headline, category, date, showLogo, showWatermark) {
    const gradient = ctx.createLinearGradient(0, 320, 0, 1080);
    gradient.addColorStop(0, 'rgba(9, 14, 26, 0)');
    gradient.addColorStop(0.35, 'rgba(9, 14, 26, 0.75)');
    gradient.addColorStop(0.7, 'rgba(9, 14, 26, 0.96)');
    gradient.addColorStop(1, 'rgba(9, 14, 26, 1)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 250, 1080, 830);

    // Top Header Glass Bar
    ctx.fillStyle = 'rgba(9, 14, 26, 0.92)';
    ctx.fillRect(0, 0, 1080, 115);
    
    // Bottom Crimson Accent Line
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(0, 1066, 1080, 14);

    // Bengali Brand Logo
    if (showLogo) {
        drawBanglaBrandLogo(ctx, 50, 48, {
            fontSize: 34,
            fontPrimaryColor: '#ffffff',
            numColor: '#ef4444',
            showTagline: true,
            taglineColor: '#cbd5e1'
        });
    }

    // Category Pill Badge Top Right
    ctx.fillStyle = '#b91c1c';
    roundRect(ctx, 830, 34, 200, 50, 8, true, false);
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 22px "Hind Siliguri", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(category, 930, 68);
    ctx.textAlign = 'left';

    // Headline Text
    ctx.fillStyle = '#ffffff';
    ctx.font = `800 ${headlineFontSize}px "Anek Bangla", "Hind Siliguri", sans-serif`;
    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur = 12;
    wrapText(ctx, headline, 50, 800 - (headlineFontSize * 1.5), 980, headlineFontSize * 1.35);
    ctx.shadowBlur = 0;

    // Date & Watermark Footer
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 20px "Hind Siliguri", sans-serif';
    ctx.fillText(`${date}`, 50, 1030);

    if (showWatermark) {
        ctx.textAlign = 'right';
        ctx.fillStyle = '#f8fafc';
        ctx.font = '800 20px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('ourtimes24.com', 1030, 1030);
        ctx.textAlign = 'left';
    }
}

// TEMPLATE 2: EXECUTIVE QUOTE / STATEMENT CARD
function renderQuoteTemplate(headline, speaker, date, showLogo, showWatermark) {
    const gradient = ctx.createLinearGradient(0, 200, 0, 1080);
    gradient.addColorStop(0, 'rgba(15, 23, 42, 0.2)');
    gradient.addColorStop(0.4, 'rgba(15, 23, 42, 0.85)');
    gradient.addColorStop(0.75, 'rgba(15, 23, 42, 0.98)');
    gradient.addColorStop(1, '#0f172a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1080);

    // Top Header
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.fillRect(0, 0, 1080, 110);

    // Bengali Brand Logo
    if (showLogo) {
        drawBanglaBrandLogo(ctx, 60, 48, {
            fontSize: 34,
            fontPrimaryColor: '#ffffff',
            numColor: '#f59e0b',
            showTagline: true,
            taglineColor: '#94a3b8'
        });
    }

    // Gold Quote Icon
    ctx.fillStyle = '#d97706';
    ctx.font = '900 120px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('“', 60, 480);

    // Quote Body
    ctx.fillStyle = '#ffffff';
    ctx.font = `700 ${headlineFontSize}px "Noto Serif Bengali", serif`;
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 10;
    wrapText(ctx, headline, 60, 560, 960, headlineFontSize * 1.4);
    ctx.shadowBlur = 0;

    // Speaker Name Bar
    if (speaker) {
        ctx.fillStyle = '#d97706';
        roundRect(ctx, 60, 880, 10, 70, 4, true, false);

        ctx.fillStyle = '#fef3c7';
        ctx.font = '800 28px "Hind Siliguri", sans-serif';
        ctx.fillText(speaker, 85, 925);
    }

    // Footer
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 20px "Hind Siliguri", sans-serif';
    ctx.fillText(`${date}`, 60, 1030);

    if (showWatermark) {
        ctx.textAlign = 'right';
        ctx.fillStyle = '#d97706';
        ctx.font = '800 20px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('ourtimes24.com', 1020, 1030);
        ctx.textAlign = 'left';
    }
}

// TEMPLATE 3: BREAKING NEWS FLASH CARD
function renderBreakingTemplate(headline, category, date, showLogo, showWatermark) {
    const gradient = ctx.createLinearGradient(0, 300, 0, 1080);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(0.4, 'rgba(0, 0, 0, 0.7)');
    gradient.addColorStop(0.8, 'rgba(0, 0, 0, 0.98)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 200, 1080, 880);

    // Red Urgent Banner Top
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(0, 0, 1080, 105);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 36px "Anek Bangla", sans-serif';
    ctx.fillText('ব্রেকিং নিউজ', 50, 68);

    // Bengali Brand Logo
    if (showLogo) {
        drawBanglaBrandLogo(ctx, 1030, 48, {
            fontSize: 32,
            fontPrimaryColor: '#ffffff',
            numColor: '#fee2e2',
            showTagline: true,
            taglineColor: '#fee2e2',
            align: 'right',
            taglineText: 'সবার আগে সব খবর'
        });
    }

    // Center Headline Box with White Card
    ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
    roundRect(ctx, 40, 650, 1000, 340, 16, true, false);

    ctx.fillStyle = '#111827';
    ctx.font = `800 ${headlineFontSize}px "Anek Bangla", sans-serif`;
    wrapText(ctx, headline, 75, 740, 930, headlineFontSize * 1.35);

    // Red Line under card
    ctx.fillStyle = '#ef4444';
    roundRect(ctx, 40, 976, 1000, 14, { tl: 0, tr: 0, br: 16, bl: 16 }, true, false);

    // Footer
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 20px "Hind Siliguri", sans-serif';
    ctx.fillText(`${date}`, 50, 1040);

    if (showWatermark) {
        ctx.textAlign = 'right';
        ctx.fillStyle = '#ffffff';
        ctx.font = '800 20px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('ourtimes24.com', 1030, 1040);
        ctx.textAlign = 'left';
    }
}

// TEMPLATE 4: SPORTS MATCH SPOTLIGHT CARD
function renderSportsTemplate(headline, category, date, showLogo, showWatermark) {
    const gradient = ctx.createLinearGradient(0, 280, 0, 1080);
    gradient.addColorStop(0, 'rgba(4, 120, 87, 0)');
    gradient.addColorStop(0.4, 'rgba(6, 78, 59, 0.8)');
    gradient.addColorStop(0.8, 'rgba(2, 44, 34, 0.98)');
    gradient.addColorStop(1, '#022c22');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 200, 1080, 880);

    // Emerald Header Bar
    ctx.fillStyle = '#059669';
    ctx.fillRect(0, 0, 1080, 105);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 34px "Anek Bangla", sans-serif';
    ctx.fillText('খেলাধুলা • SPORTS SPOTLIGHT', 50, 68);

    // Bengali Brand Logo
    if (showLogo) {
        drawBanglaBrandLogo(ctx, 1030, 48, {
            fontSize: 32,
            fontPrimaryColor: '#ffffff',
            numColor: '#fef08a',
            showTagline: true,
            taglineColor: '#d1fae5',
            align: 'right',
            taglineText: 'সবার আগে সব খবর'
        });
    }

    // Headline
    ctx.fillStyle = '#ffffff';
    ctx.font = `800 ${headlineFontSize}px "Anek Bangla", sans-serif`;
    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur = 14;
    wrapText(ctx, headline, 50, 780 - (headlineFontSize * 1.5), 980, headlineFontSize * 1.35);
    ctx.shadowBlur = 0;

    // Gold Badge
    ctx.fillStyle = '#f59e0b';
    roundRect(ctx, 50, 880, 220, 48, 8, true, false);
    ctx.fillStyle = '#000000';
    ctx.font = '800 20px "Hind Siliguri", sans-serif';
    ctx.fillText('বিশেষ প্রতিবেদন', 75, 912);

    // Footer
    ctx.fillStyle = '#a7f3d0';
    ctx.font = '600 20px "Hind Siliguri", sans-serif';
    ctx.fillText(`${date}`, 50, 1030);

    if (showWatermark) {
        ctx.textAlign = 'right';
        ctx.fillStyle = '#34d399';
        ctx.font = '800 20px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('ourtimes24.com', 1030, 1030);
        ctx.textAlign = 'left';
    }
}

// Download HD Photo Card
function downloadPhotoCard() {
    const link = document.createElement('a');
    link.download = `ourtimes24-photocard-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
}

// Copy to Clipboard
async function copyCanvasImageToClipboard() {
    try {
        canvas.toBlob(async (blob) => {
            const item = new ClipboardItem({ 'image/png': blob });
            await navigator.clipboard.write([item]);
            alert('ফটো কার্ডটি সরাসরি ক্লিপবোর্ডে কপি করা হয়েছে! (Ctrl+V দিয়ে ফেসবুকে পেস্ট করতে পারেন)');
        });
    } catch (err) {
        alert('ক্লিপবোর্ড কপি সমর্থিত নয়। দয়া করে ডাউনলোড বাটনে ক্লিক করুন।');
    }
}

// Ensure web fonts are rendered properly on canvas
if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
        renderCanvas();
    });
}

