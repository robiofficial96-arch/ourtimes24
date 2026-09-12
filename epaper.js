/**
 * OURTIMES24 - HIGH PERFORMANCE DIGITAL E-PAPER ENGINE
 * 100% Mobile Responsive + Full Multi-Page Dataset
 */

let currentEpaperPage = 1;
const totalPages = 5;
let currentZoom = 1.0;

// Render Newspaper Pages
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

    if (pageNum === 1) {
        // ================= PAGE 1: FRONT PAGE =================
        contentContainer.innerHTML = `
            <div style="border-bottom: 2px solid #111827; padding-bottom: 4px; margin-bottom: 12px; display:flex; justify-content:space-between; font-size:12px; font-weight:800; color:#b91c1c;">
                <span>প্রথম পাতা • শীর্ষ জাতীয় ও আন্তর্জাতিক সংবাদ</span>
                <span>ঢাকা সংস্করণ</span>
            </div>

            <div class="epaper-page-grid">
                
                <!-- Main Lead Story (Clickable Hotspot) -->
                <div class="epaper-story-block" style="grid-column: 1 / 3;" onclick="openNewsClip('nat-1')">
                    <h1 class="epaper-story-headline epaper-lead-head">দেশের অর্থনৈতিক প্রবৃদ্ধি ও টেকসই রূপান্তরে নতুন মেগা প্রকল্প অনুমোদন</h1>
                    <div style="font-size:14.5px; font-weight:700; color:#b91c1c; margin-bottom:8px;">একনেক সভায় ৪টি বৃহৎ আধুনিক যোগাযোগ ও শিল্পায়নের প্রস্তাবনা পাস</div>
                    <img src="https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1000&auto=format&fit=crop&q=80" style="width:100%; height:260px; object-fit:cover; margin-bottom:10px; border-radius:3px; border:1px solid #e5e7eb;" alt="">
                    <p class="epaper-story-body">
                        জাতীয় অর্থনৈতিক পরিষদের নির্বাহী কমিটি (একনেক) দেশের সামগ্রিক অর্থনৈতিক প্রবৃদ্ধি ও প্রান্তিক পর্যায়ের শিল্পায়নকে গতিশীল করার লক্ষ্যে প্রায় ১৫ হাজার কোটি টাকার ৪টি নতুন মেগা প্রকল্প অনুমোদন করেছে। রাজধানীর শেরেবাংলা নগরে অনুষ্ঠিত উচ্চপর্যায়ের সভায় এই সিদ্ধান্ত গৃহীত হয়। পরিকল্পনা কমিশন সূত্রে জানা গেছে, অনুমোদিত প্রকল্পগুলোর মধ্যে সবচেয়ে গুরুত্বপূর্ণ হলো দক্ষিণ ও উত্তরবঙ্গের আধুনিক সড়ক যোগাযোগ নেটওয়ার্ক স্থাপন এবং স্মার্ট শিল্পনগরী গড়ে তোলা।
                    </p>
                </div>

                <!-- Side Column Stories -->
                <div style="display:flex; flex-direction:column; gap:12px;">
                    <div class="epaper-story-block" onclick="openNewsClip('pol-1')">
                        <h2 class="epaper-story-headline epaper-sub-head">সংসদ নির্বাচন: রাজনৈতিক দলগুলোর সংলাপ জোরদার</h2>
                        <img src="https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=600&auto=format&fit=crop&q=80" style="width:100%; height:110px; object-fit:cover; margin-bottom:6px; border-radius:3px;" alt="">
                        <p class="epaper-story-body">
                            আসন্ন জাতীয় সংসদ নির্বাচনকে অবাধ, সুষ্ঠু ও গ্রহণযোগ্য করতে নির্বাচন কমিশন ও নাগরিক সমাজের সাথে ধারাবাহিক সংলাপ শুরু হয়েছে।
                        </p>
                    </div>

                    <div class="epaper-story-block" onclick="openNewsClip('nat-4')">
                        <h3 class="epaper-story-headline epaper-col-head">রেলওয়ের বহরে যুক্ত হচ্ছে ২০টি দ্রুতগতির ট্রেন</h3>
                        <p class="epaper-story-body">ঢাকা-চট্টগ্রাম রুটে যাতায়াত সময় কমে হবে মাত্র দেড় ঘণ্টা।</p>
                    </div>
                </div>

            </div>

            <!-- Bottom Multi-column Row -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; border-top: 2px solid #111827; padding-top: 14px; margin-top: 18px;">
                <div class="epaper-story-block" onclick="openNewsClip('spo-1')">
                    <h3 class="epaper-story-headline epaper-col-head">🏆 এশিয়া কাপে ইতিহাস গড়ল বাংলাদেশ</h3>
                    <p class="epaper-story-body">শেষ ওভারের রুদ্ধশ্বাস রোমাঞ্চে ৩ উইকেটে জয় তুলে নিয়ে এশিয়া কাপের শিরোপা নিশ্চিত করল লাল-সবুজ বাহিনী।</p>
                </div>

                <div class="epaper-story-block" onclick="openNewsClip('int-1')">
                    <h3 class="epaper-story-headline epaper-col-head">🛢️ বিশ্ববাজারে জ্বালানি তেলের টানা দরপতন</h3>
                    <p class="epaper-story-body">প্রতি ব্যারেল ব্রেন্ট ক্রুড অয়েলের দাম কমে নেমেছে ৭০ ডলারে, অভ্যন্তরীণ বাজারে মূল্য সমন্বয়ের আশা।</p>
                </div>

                <div class="epaper-story-block" onclick="openNewsClip('nat-8')">
                    <h3 class="epaper-story-headline epaper-col-head">⚓ মাতারবাড়ী গভীর সমুদ্রবন্দরে নতুন চুক্তি</h3>
                    <p class="epaper-story-body">আন্তর্জাতিক কনসোর্টিয়ামের সাথে ঐতিহাসিক অংশীদারিত্ব চুক্তি সই, আঞ্চলিক ট্রানজিট হাবের পথে।</p>
                </div>

                <div class="epaper-story-block" onclick="openNewsClip('tec-1')">
                    <h3 class="epaper-story-headline epaper-col-head">🤖 এআই গবেষণায় বাংলাদেশি তরুণদের জয়</h3>
                    <p class="epaper-story-body">সিলিকন ভ্যালির আন্তর্জাতিক প্রযুক্তি সামিটে স্বাস্থ্যসেবা ও এআই মডেলে প্রথম পুরস্কার অর্জন।</p>
                </div>
            </div>
        `;
    } else if (pageNum === 2) {
        // ================= PAGE 2: EDITORIAL & OPINION =================
        contentContainer.innerHTML = `
            <div style="border-bottom: 2px solid #b91c1c; padding-bottom: 6px; margin-bottom: 14px; display:flex; justify-content:space-between; font-weight:800; font-size:16px; color:#b91c1c;">
                <span>পৃষ্ঠা ২ • সম্পাদকীয় ও মতামত কলাম</span>
                <span>OURTIMES24 OPINION</span>
            </div>

            <div style="display:grid; grid-template-columns: 1.8fr 1.2fr; gap:20px;">
                
                <!-- Main Editorial -->
                <div class="epaper-story-block" onclick="openNewsClip('opi-1')">
                    <h1 class="epaper-story-headline epaper-lead-head">সম্পাদকীয়: প্রযুক্তিনির্ভর আধুনিক সমাজ বিনির্মাণে তারুণ্যের ভূমিকা</h1>
                    <div style="font-style:italic; font-weight:700; color:#4b5563; margin-bottom:10px; font-size:14px;">জ্ঞানভিত্তিক অর্থনীতি গড়ে তুলতে সময়োপযোগী কারিগরি শিক্ষার বিকল্প নেই</div>
                    <img src="https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&auto=format&fit=crop&q=80" style="width:100%; height:180px; object-fit:cover; margin-bottom:10px; border-radius:3px;" alt="">
                    <p class="epaper-story-body">
                        চতুর্থ শিল্পবিপ্লবের যুগে কৃত্রিম বুদ্ধিমত্তা ও ডিজিটাল উদ্ভাবন পুরো বিশ্বের অর্থনৈতিক রূপরেখা বদলে দিচ্ছে। আমাদের মোট জনসংখ্যার প্রায় অর্ধেকই তরুণ। এই জনমিতিক সুবিধাকে সর্বোচ্চ কাজে লাগাতে হলে মাধ্যমিক স্তর থেকেই কোডিং ও ব্যবহারিক প্রযুক্তি শিক্ষাকে বাধ্যতামূলক করতে হবে।
                    </p>
                </div>

                <!-- Editor's Column -->
                <div style="display:flex; flex-direction:column; gap:12px;">
                    <div class="epaper-story-block" style="background:#fef2f2; border-left:3px solid #b91c1c;" onclick="openNewsClip('opi-4')">
                        <h2 class="epaper-story-headline epaper-sub-head">দৃষ্টিভঙ্গি: সুশাসন ও তথ্যের অবাধ প্রবাহ</h2>
                        <div style="font-weight:700; color:#b91c1c; font-size:13px; margin-bottom:6px;">— সৈয়দ হাফিজ মনির (সম্পাদক)</div>
                        <p class="epaper-story-body">
                            গণমাধ্যমের স্বাধীনতা একটি গণতান্ত্রিক সমাজের মূল স্তম্ভ। বস্তুনিষ্ঠ ও নির্ভীক সাংবাদিকতা দুর্নীতি রোধে সবচেয়ে বড় পাহারাদার হিসেবে কাজ করে। Ourtimes24 সবসময় সত্য ও জনগণের অধিকারের পক্ষে অবিচল থাকবে।
                        </p>
                    </div>

                    <div class="epaper-story-block" onclick="openNewsClip('opi-6')">
                        <h3 class="epaper-story-headline epaper-col-head">ডিজিটাল সাক্ষরতা ও সাইবার সচেতনতা</h3>
                        <p class="epaper-story-body">সোশ্যাল মিডিয়ায় গুজব ও অপতথ্য প্রতিরোধে ফ্যাক্ট-চেকিংয়ের গুরুত্ব অপরিসীম।</p>
                    </div>
                </div>

            </div>

            <!-- Opinion Columns Grid -->
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:16px; border-top:1px dashed #cbd5e1; padding-top:14px; margin-top:18px;">
                <div class="epaper-story-block" onclick="openNewsClip('opi-2')">
                    <h3 class="epaper-story-headline epaper-col-head">🏢 টেকসই নগরায়নে বিকেন্দ্রীকরণ</h3>
                    <div style="font-size:12px; color:#64748b; font-weight:700; margin-bottom:4px;">ড. ফাহিম আহমেদ</div>
                    <p class="epaper-story-body">রাজধানীমুখী জনস্রোত কমাতে প্রতিটি বিভাগীয় শহরকে আধুনিক সুযোগ-সুবিধাসম্পন্ন করতে হবে।</p>
                </div>

                <div class="epaper-story-block" onclick="openNewsClip('opi-3')">
                    <h3 class="epaper-story-headline epaper-col-head">🌾 কৃষিতে জলবায়ু পরিবর্তন ও খাদ্য</h3>
                    <div style="font-size:12px; color:#64748b; font-weight:700; margin-bottom:4px;">ড. মোস্তাফিজুর রহমান</div>
                    <p class="epaper-story-body">লবণাক্ততা ও খরা সহনশীল ফসলের জাত উদ্ভাবনে বিজ্ঞানীদের গবেষণায় জোর দিতে হবে।</p>
                </div>

                <div class="epaper-story-block" onclick="openNewsClip('opi-5')">
                    <h3 class="epaper-story-headline epaper-col-head">🌊 নদী রক্ষায় দূষণমুক্তির লড়াই</h3>
                    <div style="font-size:12px; color:#64748b; font-weight:700; margin-bottom:4px;">পরিবেশ মঞ্চ</div>
                    <p class="epaper-story-body">বুড়িগঙ্গা ও কর্ণফুলীকে বাঁচাতে শিল্পবর্জ্য নিষ্কাশনে কঠোর আইনের প্রয়োগ চাই।</p>
                </div>

                <div class="epaper-story-block" onclick="openNewsClip('opi-8')">
                    <h3 class="epaper-story-headline epaper-col-head">📚 পাড়ায় পাড়ায় লাইব্রেরির ডাক</h3>
                    <div style="font-size:12px; color:#64748b; font-weight:700; margin-bottom:4px;">সংস্কৃতি পাতা</div>
                    <p class="epaper-story-body">শিশুদের অতিরিক্ত স্ক্রিন আসক্তি থেকে মুক্ত করতে মুক্ত পাঠাগার স্থাপন জরুরি।</p>
                </div>
            </div>
        `;
    } else if (pageNum === 3) {
        // ================= PAGE 3: SARADESH & DISTRICTS =================
        contentContainer.innerHTML = `
            <div style="border-bottom: 2px solid #b91c1c; padding-bottom: 6px; margin-bottom: 14px; display:flex; justify-content:space-between; font-weight:800; font-size:16px; color:#b91c1c;">
                <span>পৃষ্ঠা ৩ • সারাদেশ ও জেলা পরিক্রমা</span>
                <span>বিভাগীয় ব্যুরো ও লোকাল নিউজ</span>
            </div>

            <div style="display:grid; grid-template-columns: 1.5fr 1.5fr; gap:20px;">
                
                <div class="epaper-story-block" onclick="openNewsClip('sar-1')">
                    <h2 class="epaper-story-headline epaper-sub-head">পাবনা: পদ্মা ও যমুনা নদীর সংযোগ খালের কাজ দ্রুত এগোচ্ছে</h2>
                    <img src="https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&auto=format&fit=crop&q=80" style="width:100%; height:160px; object-fit:cover; margin-bottom:8px; border-radius:3px;" alt="">
                    <p class="epaper-story-body">
                        কৃষি বিপ্লব ও পরিবেশবান্ধব নৌ-যোগাযোগে উত্তর ও মধ্যাঞ্চলের কৃষকদের সেচ সুবিধা নিশ্চিত করতে মেগা সংযোগ খালের ৬০ শতাংশ কাজ সফলভাবে সম্পন্ন হয়েছে।
                    </p>
                </div>

                <div class="epaper-story-block" onclick="openNewsClip('sar-2')">
                    <h2 class="epaper-story-headline epaper-sub-head">সিলেট: চা-বাগানগুলোতে রেকর্ড উৎপাদন ও পর্যটকদের উপচে পড়া ভিড়</h2>
                    <img src="https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&auto=format&fit=crop&q=80" style="width:100%; height:160px; object-fit:cover; margin-bottom:8px; border-radius:3px;" alt="">
                    <p class="epaper-story-body">
                        শ্রীমঙ্গল ও মৌলভীবাজারের সবুজে ঘেরা চা-বাগানগুলোতে এ বছর বাম্পার ফলন হয়েছে এবং স্থানীয় হোটেলগুলোতে পর্যটকদের শতভাগ বুকিং চলছে।
                    </p>
                </div>

            </div>

            <!-- District Grid 4 Columns -->
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap:14px; border-top:1px solid #111827; padding-top:14px; margin-top:16px;">
                <div class="epaper-story-block" onclick="openNewsClip('sar-3')">
                    <h3 class="epaper-story-headline epaper-col-head">🏛️ বগুড়া: মহাস্থানগড়ে প্রাচীন নিদর্শন</h3>
                    <p class="epaper-story-body">আড়াই হাজার বছরের প্রাচীন পুণ্ড্রবর্ধন রাজ্যের বিরল মুদ্রা ও মৃৎপাত্র উদ্ধার।</p>
                </div>

                <div class="epaper-story-block" onclick="openNewsClip('sar-4')">
                    <h3 class="epaper-story-headline epaper-col-head">🥦 কুমিল্লা: রপ্তানিমুখী কৃষি কোল্ড হাব</h3>
                    <p class="epaper-story-body">মধ্যপ্রাচ্য ও ইউরোপে প্রতিদিন আকাশপথে যাচ্ছে কুমিল্লার তাজা শাকসবজি।</p>
                </div>

                <div class="epaper-story-block" onclick="openNewsClip('sar-5')">
                    <h3 class="epaper-story-headline epaper-col-head">🚗 চট্টগ্রাম: কর্ণফুলী টানেলে নতুন রেকর্ড</h3>
                    <p class="epaper-story-body">টানেল ঘিরে আনোয়ারা-পতেঙ্গায় শিল্পায়ন ও পর্যটনের ব্যাপক জোয়ার।</p>
                </div>

                <div class="epaper-story-block" onclick="openNewsClip('sar-6')">
                    <h3 class="epaper-story-headline epaper-col-head">🥭 রাজশাহী: আম ও সিল্ক অর্থনৈতিক জোন</h3>
                    <p class="epaper-story-body">ভ্যালু অ্যাডেড প্রসেসিং ইউনিটে আমের জুস ও সিল্ক পোশাক তৈরির মহাযজ্ঞ।</p>
                </div>
            </div>

            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap:14px; border-top:1px dashed #cbd5e1; padding-top:12px; margin-top:12px;">
                <div class="epaper-story-block" onclick="openNewsClip('sar-7')">
                    <h3 class="epaper-story-headline epaper-col-head">🛶 বরিশাল: ভাসমান পেয়ারার হাট</h3>
                    <p class="epaper-story-body">ভিমরুলির খালে নৌকায় কেনাবেচা দেখতে দেশি-বিদেশি পর্যটকদের সমাগম।</p>
                </div>

                <div class="epaper-story-block" onclick="openNewsClip('sar-8')">
                    <h3 class="epaper-story-headline epaper-col-head">☀️ রংপুর: সৌর সেচে তিন ফসলি বিপ্লব</h3>
                    <p class="epaper-story-body">পরিবেশবান্ধব সোলার পাম্পে ডিজেল খরচ ৬০ শতাংশ সাশ্রয়।</p>
                </div>

                <div class="epaper-story-block" onclick="openNewsClip('sar-9')">
                    <h3 class="epaper-story-headline epaper-col-head">🏖️ কক্সবাজার: সৈকত পরিচ্ছন্নতায় রোবট</h3>
                    <p class="epaper-story-body">আন্তর্জাতিক ব্লু-ফ্ল্যাগ সনদের মানদণ্ডে সৈকত প্লাস্টিকমুক্ত রাখার উদ্যোগ।</p>
                </div>

                <div class="epaper-story-block" onclick="openNewsClip('sar-10')">
                    <h3 class="epaper-story-headline epaper-col-head">🐟 ময়মনসিংহ: খাঁচায় মাছ চাষে সাফল্য</h3>
                    <p class="epaper-story-body">বেকার তরুণরা বায়োফ্লক ও খাঁচায় উন্নত জাতের মাছ চাষে স্বাবলম্বী।</p>
                </div>
            </div>
        `;
    } else if (pageNum === 4) {
        // ================= PAGE 4: INTERNATIONAL & ECONOMY =================
        contentContainer.innerHTML = `
            <div style="border-bottom: 2px solid #b91c1c; padding-bottom: 6px; margin-bottom: 14px; display:flex; justify-content:space-between; font-weight:800; font-size:16px; color:#b91c1c;">
                <span>পৃষ্ঠা ৪ • আন্তর্জাতিক ও অর্থ-বাণিজ্য</span>
                <span>GLOBAL NEWS & BUSINESS</span>
            </div>

            <div style="display:grid; grid-template-columns: 1.5fr 1.5fr; gap:20px;">
                
                <div class="epaper-story-block" onclick="openNewsClip('eco-1')">
                    <h2 class="epaper-story-headline epaper-sub-head">রপ্তানি আয়ে নতুন মাইলফলক: পোশাকের পাশাপাশি চামড়া ও আইটিতে বড় উল্লম্ফন</h2>
                    <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80" style="width:100%; height:160px; object-fit:cover; margin-bottom:8px; border-radius:3px;" alt="">
                    <p class="epaper-story-body">
                        ইউরোপ ও আমেরিকার বাজারে বাংলাদেশি তৈরি পণ্যের চাহিদা বৃদ্ধি পাওয়ায় চলতি অর্থবছরে রপ্তানি আয়ে ১৫ শতাংশ প্রবৃদ্ধি অর্জিত হয়েছে।
                    </p>
                </div>

                <div class="epaper-story-block" onclick="openNewsClip('int-2')">
                    <h2 class="epaper-story-headline epaper-sub-head">জলবায়ু সম্মেলনে ঐতিহাসিক চুক্তি: নবায়নযোগ্য শক্তিতে ট্রিলিয়ন ডলার তহবিল</h2>
                    <img src="https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=600&auto=format&fit=crop&q=80" style="width:100%; height:160px; object-fit:cover; margin-bottom:8px; border-radius:3px;" alt="">
                    <p class="epaper-story-body">
                        জাতিসংঘের জলবায়ু শীর্ষ সম্মেলনে ক্ষতিগ্রস্ত দেশগুলোকে সরাসরি সহায়তা দিতে উন্নত দেশগুলোর সর্বসম্মত চুক্তি স্বাক্ষরিত হয়েছে।
                    </p>
                </div>

            </div>

            <!-- Economy & World Grid -->
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap:14px; border-top:1px solid #111827; padding-top:14px; margin-top:16px;">
                <div class="epaper-story-block" onclick="openNewsClip('eco-2')">
                    <h3 class="epaper-story-headline epaper-col-head">💵 রেমিট্যান্স প্রবাহে নতুন রেকর্ড</h3>
                    <p class="epaper-story-body">বৈধ ব্যাংকিং চ্যানেলে আড়াই বিলিয়ন ডলার পাঠিয়েছেন প্রবাসীরা, বৈদেশিক মুদ্রার রিজার্ভে স্বস্তি।</p>
                </div>

                <div class="epaper-story-block" onclick="openNewsClip('eco-3')">
                    <h3 class="epaper-story-headline epaper-col-head">📈 শেয়ারবাজারে টানা ঊর্ধ্বগতি</h3>
                    <p class="epaper-story-body">ডিএসই ও সিএসইতে প্রাতিষ্ঠানিক বিনিয়োগকারীদের সক্রিয়তায় প্রধান সূচকের বড় উত্থান।</p>
                </div>

                <div class="epaper-story-block" onclick="openNewsClip('int-4')">
                    <h3 class="epaper-story-headline epaper-col-head">⚡ ৩ ন্যানোমিটার মাইক্রোচিপ বিপ্লব</h3>
                    <p class="epaper-story-body">স্মার্টফোন ও কম্পিউটারে বিদ্যুৎ সাশ্রয়ী সর্বাধুনিক প্রসেসর বাজারে ছাড়ল প্রযুক্তি জায়ান্টরা।</p>
                </div>

                <div class="epaper-story-block" onclick="openNewsClip('int-5')">
                    <h3 class="epaper-story-headline epaper-col-head">🌕 চাঁদে স্থায়ী স্টেশন স্থাপনে নাসা</h3>
                    <p class="epaper-story-body">দক্ষিণ মেরুতে পানির সন্ধানে রোবটিক রোভার পাঠিয়ে মানব বসতির গবেষণায় অগ্রগতি।</p>
                </div>
            </div>

            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap:14px; border-top:1px dashed #cbd5e1; padding-top:12px; margin-top:12px;">
                <div class="epaper-story-block" onclick="openNewsClip('eco-5')">
                    <h3 class="epaper-story-headline epaper-col-head">🚀 স্টার্টআপে ৫০০ মিলিয়ন ডলার বিনিয়োগ</h3>
                    <p class="epaper-story-body">ফিনটেক ও এগ্রিটেক খাতে বিদেশি ভেঞ্চার ক্যাপিটালের বিপুল সরাসরি বিনিয়োগ।</p>
                </div>

                <div class="epaper-story-block" onclick="openNewsClip('eco-6')">
                    <h3 class="epaper-story-headline epaper-col-head">🥇 স্বর্ণের ভরিতে ৫ হাজার টাকা ছাড়</h3>
                    <p class="epaper-story-body">বিশ্ববাজারে বুলিয়নের দরপতনের পর বাজুসের নতুন মূল্য নির্ধারণ।</p>
                </div>

                <div class="epaper-story-block" onclick="openNewsClip('int-6')">
                    <h3 class="epaper-story-headline epaper-col-head">🔌 ইউরোপে একক ইউএসবি-সি চার্জার</h3>
                    <p class="epaper-story-body">ইলেকট্রনিক বর্জ্য রোধে সব ডিভাইসে বাধ্যতামূলক একই চার্জিং কেবল আইন।</p>
                </div>

                <div class="epaper-story-block" onclick="openNewsClip('eco-8')">
                    <h3 class="epaper-story-headline epaper-col-head">🚘 দেশেই তৈরি হচ্ছে ইলেকট্রিক কার</h3>
                    <p class="epaper-story-body">হাইটেক সিটিতে পরিবেশবান্ধব ইভি কার কারখানার শুভ উদ্বোধন।</p>
                </div>
            </div>
        `;
    } else if (pageNum === 5) {
        // ================= PAGE 5: SPORTS & ENTERTAINMENT =================
        contentContainer.innerHTML = `
            <div style="border-bottom: 2px solid #b91c1c; padding-bottom: 6px; margin-bottom: 14px; display:flex; justify-content:space-between; font-weight:800; font-size:16px; color:#b91c1c;">
                <span>পৃষ্ঠা ৫ • খেলাধুলা, বিজ্ঞান-প্রযুক্তি ও বিনোদন</span>
                <span>SPORTS, TECH & ENTERTAINMENT</span>
            </div>

            <div style="display:grid; grid-template-columns: 1.5fr 1.5fr; gap:20px;">
                
                <div class="epaper-story-block" onclick="openNewsClip('spo-2')">
                    <h2 class="epaper-story-headline epaper-sub-head">বিশ্বকাপ ফুটবলের বাছাইপর্বে দুর্দান্ত সূচনা: প্রতিপক্ষকে ২-০ গোলে হারাল বাংলাদেশ</h2>
                    <img src="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80" style="width:100%; height:160px; object-fit:cover; margin-bottom:8px; border-radius:3px;" alt="">
                    <p class="epaper-story-body">
                        জাতীয় স্টেডিয়ামে হাজারো উল্লাসিত দর্শকের সামনে চোখ ধাঁধানো আক্রমণাত্মক ফুটবল খেলে প্রথমার্ধেই দুই গোল আদায় করে পূর্ণ ৩ পয়েন্ট অর্জন করেছে লাল-সবুজ বাহিনী।
                    </p>
                </div>

                <div class="epaper-story-block" onclick="openNewsClip('ent-1')">
                    <h2 class="epaper-story-headline epaper-sub-head">কান চলচ্চিত্র উৎসবে প্রশংসিত বাংলাদেশি তরুণ পরিচালকের নতুন চলচ্চিত্র</h2>
                    <img src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80" style="width:100%; height:160px; object-fit:cover; margin-bottom:8px; border-radius:3px;" alt="">
                    <p class="epaper-story-body">
                        রেড কার্পেটে দাঁড়িয়ে আন্তর্জাতিক দর্শকদের তুমুল করতালি ও বিশ্বমানের সিনেমা সমালোচকদের প্রশংসা কুড়িয়েছে দেশীয় পূর্ণদৈর্ঘ্য চলচ্চিত্রটি।
                    </p>
                </div>

            </div>

            <!-- Sports & Entertainment Grid -->
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap:14px; border-top:1px solid #111827; padding-top:14px; margin-top:16px;">
                <div class="epaper-story-block" onclick="openNewsClip('spo-3')">
                    <h3 class="epaper-story-headline epaper-col-head">🏏 টেস্ট র‍্যাঙ্কিংয়ে শীর্ষ তিনে টাইগার</h3>
                    <p class="epaper-story-body">আইসিসি সাপ্তাহিক আপডেটে অলরাউন্ডার বিভাগে অভাবনীয় পয়েন্ট অর্জন।</p>
                </div>

                <div class="epaper-story-block" onclick="openNewsClip('spo-5')">
                    <h3 class="epaper-story-headline epaper-col-head">⚽ সাফ অনূর্ধ্ব-২০ নারী চ্যাম্পিয়ন</h3>
                    <p class="epaper-story-body">ফাইনালে ৩-১ গোলে ভারতকে উড়িয়ে দিয়ে টানা দ্বিতীয়বার বাংলার মেয়েদের জয়।</p>
                </div>

                <div class="epaper-story-block" onclick="openNewsClip('ent-2')">
                    <h3 class="epaper-story-headline epaper-col-head">🎬 অস্কারের আসরে অফিশিয়াল এন্ট্রি</h3>
                    <p class="epaper-story-body">৯৮তম একাডেমি অ্যাওয়ার্ডসের সেরা আন্তর্জাতিক ফিচার বিভাগে মনোনীত ঢাকাই ছবি।</p>
                </div>

                <div class="epaper-story-block" onclick="openNewsClip('ent-3')">
                    <h3 class="epaper-story-headline epaper-col-head">🎸 আর্মি স্টেডিয়ামে রক-ফোক মেগা কনসার্ট</h3>
                    <p class="epaper-story-body">৫০ হাজার দর্শকের উপস্থিতিতে রাতভর সুরের মূর্ছনায় মাতাল দেশীয় ব্যান্ডগুলো।</p>
                </div>
            </div>

            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap:14px; border-top:1px dashed #cbd5e1; padding-top:12px; margin-top:12px;">
                <div class="epaper-story-block" onclick="openNewsClip('tec-2')">
                    <h3 class="epaper-story-headline epaper-col-head">📡 দেশব্যাপী ফাইভ-জি সম্প্রসারণ সম্পন্ন</h3>
                    <p class="epaper-story-body">৬৪ জেলায় আল্ট্রাফাস্ট ১ জিবিপিএস গতির নেটওয়ার্ক টাওয়ার চালু।</p>
                </div>

                <div class="epaper-story-block" onclick="openNewsClip('tec-3')">
                    <h3 class="epaper-story-headline epaper-col-head">🛡️ সাইবার সুরক্ষায় এআই ফায়ারওয়াল</h3>
                    <p class="epaper-story-body">জাতীয় ক্রাইসিস রেসপন্স টিমের তৈরি দেশীয় ডিফেন্স প্রযুক্তির সাফল্য।</p>
                </div>

                <div class="epaper-story-block" onclick="openNewsClip('tec-6')">
                    <h3 class="epaper-story-headline epaper-col-head">🚁 কৃষিতে স্মার্ট ড্রোনের বিপ্লব</h3>
                    <p class="epaper-story-body">১০ মিনিটে ১ একর জমিতে সার ও কীটনাশক ছিটানোর সুবিধা।</p>
                </div>

                <div class="epaper-story-block" onclick="openNewsClip('tec-10')">
                    <h3 class="epaper-story-headline epaper-col-head">🛰️ মহাকাশে বঙ্গবন্ধু-২ স্যাটেলাইটের প্রস্তুতি</h3>
                    <p class="epaper-story-body">আবহাওয়া পর্যবেক্ষণ ও খনিজ সম্পদ অনুসন্ধানে আধুনিক আর্থ অবজারভেটরি।</p>
                </div>
            </div>
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
    alert('✅ ই-পেপার কাটিং লিঙ্ক কপি করা হয়েছে!');
}

function shareClippingToFB() {
    window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(window.location.href), '_blank');
}

function downloadClippingImage() {
    alert('📸 পেপার কাটিং ডাউনলোড সম্পন্ন হয়েছে!');
}

function downloadFullPage() {
    alert(`📥 Ourtimes24 ই-পেপার পৃষ্ঠা ${currentEpaperPage} (PDF/Image) ডাউনলোড হচ্ছে!`);
}

function changeEpaperDate(val) {
    alert(`📅 ${val} তারিখের ই-পেপার লোড করা হয়েছে!`);
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
