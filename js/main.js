/* --- GLOBAL DATA STORAGE --- */
let portfolioData = {};

/**
 * 1. DATA LOADER
 * Fetches all JSON files from the /content folder
 */
async function loadContent() {
    try {
        const [experience, projects, skills, profile, links, education, certifications, episodesData] = await Promise.all([
            fetch('content/experience.json').then(res => res.json()),
            fetch('content/projects.json').then(res => res.json()),
            fetch('content/top10_skills.json').then(res => res.json()),
            fetch('content/profile.json').then(res => res.json()),
            fetch('content/links.json').then(res => res.json()),
            fetch('content/education.json').then(res => res.json()),
            fetch('content/certifications.json').then(res => res.json()),
            fetch('content/episodes.json').then(res => res.json())
        ]);

        portfolioData = { experience, projects, skills, profile, links, education, certifications, episodesData };

        const heroMetaContainer = document.querySelector('.flex.items-center.gap-4.text-white.text-base.font-bold.mb-6');
        if (heroMetaContainer && profile) {
            heroMetaContainer.innerHTML = `
                <span class="text-[#46d369]">99% Match</span>
                <span class="text-gray-300">${profile.year || "2026"}</span>
                <span class="border border-gray-400 px-2 rounded-sm text-xs py-0.5 bg-black/40">
                    ${portfolioData.episodesData.length} Seasons
                </span>
            `;
        }

        // 1. POPULATE HERO TITLE
        const titleEl = document.querySelector('.avengers-title');
        if (titleEl && profile.name) {
            const nameParts = profile.name.toUpperCase().split(' ');
            titleEl.innerHTML = `
                <div class="first-name-row">${nameParts[0]}</div>
                <div class="last-name-row">${nameParts[1] || ''}</div>
            `;
        }


        const loglineEl = document.getElementById('hero-logline');
        const subLoglineEl = document.getElementById('hero-sub-logline');
        if (loglineEl) loglineEl.textContent = portfolioData.profile.log_line || "";
        if (subLoglineEl) subLoglineEl.textContent = portfolioData.profile.sub_log_line || "";


        // 2. POPULATE SEASONS MODAL (MORE INFO)
        const selector = document.getElementById('season-selector');
        if (selector && episodesData.length > 0) {
            selector.innerHTML = episodesData.map((s, i) => `<option value="${i}">${s.season} (${s.year})</option>`).join('');
            const lastSeasonIndex = episodesData.length - 1;
            selector.value = lastSeasonIndex;
            renderEpisodes(lastSeasonIndex);
        }

        // Mapping Metadata
        document.getElementById('series-hero-img').src = profile.hero_image || 'assets/images/hero.jpg';
        document.getElementById('series-year').textContent = profile.year || "2026";
        document.getElementById('series-season-count').textContent = episodesData.length + " Seasons";
        document.getElementById('series-logline').textContent = profile.title;
        document.getElementById('series-summary').textContent = profile.summary;
        document.getElementById('series-genres').textContent = profile.genres;
        document.getElementById('series-starring').textContent = profile.starring || profile.name;
        document.getElementById('series-mood').textContent = profile.mood;

        // 3. TRIGGER MAIN APP RENDERING (This restores your tiles)
        init();

    } catch (error) {
        console.error("Content Loading Error:", error);
    }
}

/**
 * 2. INITIALIZATION
 * Triggers the rendering of all sections
 */
function init() {
    // Render all Tile sections
    ['experience', 'projects', 'education', 'certifications'].forEach(cat => {
        let containerId;
        if (cat === 'experience') containerId = 'exp-container';
        else if (cat === 'projects') containerId = 'proj-container';
        else if (cat === 'education') containerId = 'edu-container';
        else if (cat === 'certifications') containerId = 'certs-container';

        const container = document.getElementById(containerId);
        if (container && portfolioData[cat]) {
            container.className = "flex overflow-x-auto gap-2 md:gap-3 hide-scroll pb-8 items-center pr-12 scroll-smooth";
            container.innerHTML = portfolioData[cat].map((item, index) => renderCard(item, cat, index)).join('');
        }
    });

    // Render Skills (Top 10 style)
    const skillsContainer = document.getElementById('skills-container');
    if (skillsContainer && portfolioData.skills) {
        skillsContainer.innerHTML = portfolioData.skills.map((s, i) => renderCard(s, 'skill', i)).join('');
    }

    // Render Footer Links
    const footerLinks = document.getElementById('footer-links');
    if (footerLinks && portfolioData.links) {
        const l = portfolioData.links;
        footerLinks.innerHTML = `
            <a href="${l.linkedin}" target="_blank" class="text-white text-3xl hover:text-[#0077b5] transition transform hover:scale-110"><i class="fab fa-linkedin"></i></a>
            <a href="${l.github}" target="_blank" class="text-white text-3xl hover:text-gray-400 transition transform hover:scale-110"><i class="fab fa-github"></i></a>
            <a href="${l.medium}" target="_blank" class="text-white text-3xl hover:text-white transition transform hover:scale-110"><i class="fab fa-medium"></i></a>
            <a href="mailto:${l.email}" class="text-white text-3xl hover:text-[#E50914] transition transform hover:scale-110"><span class="material-symbols-outlined text-4xl">mail</span></a>
        `;
    }

    // Reveal App
    setTimeout(() => {
        const app = document.getElementById('main-app');
        if (app) app.classList.remove('opacity-0');
    }, 1500);

    const sporeLayer = document.getElementById('spore-layer');
    if (sporeLayer) {
        sporeLayer.innerHTML = '';

        const sporeCount = 50;

        for (let i = 0; i < sporeCount; i++) {
            const spore = document.createElement('div');
            spore.className = 'spore';

            const horizontalStart = Math.random() * 100;
            const fallDuration = 15 + Math.random() * 15;
            const startDelay = Math.random() * -20;
            const size = 1 + Math.random() * 3; 

            spore.style.left = `${horizontalStart}%`;
            spore.style.width = `${size}px`;
            spore.style.height = `${size}px`;
            spore.style.animationDuration = `${fallDuration}s`;
            spore.style.animationDelay = `${startDelay}s`;

            spore.style.opacity = Math.random() * 0.5;

            sporeLayer.appendChild(spore);
        }
    }
}


/**
 * 3. CARD RENDERER
 * Creates the HTML for both Netflix tiles and Ranked Skills
 */
function renderCard(item, type, index = 0) {
    if (type === 'skill') {
        return `
        <div class="top-10-item flex-none group relative flex items-center pr-4">
            <span class="text-[12rem] font-bold leading-none text-transparent select-none opacity-70 z-0 transition-all duration-300" 
                style="-webkit-text-stroke: 2px #555; font-family: 'Bebas Neue';">
                ${index + 1}
            </span>
            <div class="top-10-card bg-[#222] w-32 h-48 md:w-36 md:h-52 rounded flex flex-col items-center justify-center p-3 text-center border border-[#333] -ml-6 z-10 relative transition-all duration-300">
                <div class="font-bold text-white text-sm md:text-base uppercase tracking-tight leading-tight">
                    ${item.name || item.title}
                </div>
            </div>
        </div>`;
    }

    const title = item.company || item.title;
    const role = item.role || item.subtitle || item.title;
    const img = item.image || 'assets/images/default.png';
    const id = item.id || index;

    return `
        <div class="netflix-card flex-none w-64 md:w-[19rem] rounded-md overflow-hidden relative bg-[#181818] group aspect-video shadow-lg" 
            onclick="openModal('${type}', '${id}')">
            <img src="${img}" alt="${title}" loading="lazy" 
                 decodings="async" class="w-full h-full object-cover opacity-90 transition">
            <div class="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col justify-end h-1/2">
                <div class="flex items-center justify-between">
                    <h3 class="text-white font-bold text-sm md:text-base leading-tight">${title}</h3>
                    ${type === 'certifications' ? '<span class="material-symbols-outlined text-[#46d369] text-sm">verified</span>' : ''}
                </div>
                <div class="flex items-center gap-2 mt-1">
                    <span class="text-[10px] text-gray-300">${role}</span>
                </div>
            </div>
        </div>`;
}


function renderEpisodes(index) {
    const season = portfolioData.episodesData[index];
    const container = document.getElementById('episodes-list');

    const seasonSummaryEl = document.getElementById('season-summary');
    const metaSeasonTitle = document.getElementById('meta-season-title');
    const metaSeasonTeaser = document.getElementById('meta-season-teaser');

    if (!container || !season) return;

    // 1. Update Season Metadata
    if (seasonSummaryEl) {
        seasonSummaryEl.textContent = season.summary || "";
    }
    if (metaSeasonTitle) {
        metaSeasonTitle.textContent = season.title + ":";
    }
    if (metaSeasonTeaser) {
        metaSeasonTeaser.textContent = season.summary || season.theme || "";
    }

    if (metaSeasonTitle) {
        metaSeasonTitle.textContent = season.title || "";
    }
    if (metaSeasonTeaser) {
        metaSeasonTeaser.textContent = season.summary || season.theme || "";
    }

    // 2. Render Episode List
    container.innerHTML = season.episodes.map((ep, i) => {
        const detailId = `detail-${index}-${i}`;
        return `
        <div class="episode-group">
            <div class="episode-row flex flex-col md:flex-row items-center gap-6 p-6 transition-all duration-300 cursor-pointer hover:bg-[#222]" 
                 id="row-${detailId}" onclick="toggleEpisodeDetail('${detailId}')">
                
                <div class="text-gray-500 font-netflix text-2xl w-8 text-center">${i + 1}</div>
                
                <div class="w-full md:w-48 aspect-video flex-shrink-0 overflow-hidden rounded relative shadow-lg">
                    <img src="${ep.img}" class="w-full h-full object-cover" onerror="this.src='assets/images/default.png'">
                </div>
                
                <div class="flex-1">
                    <div class="flex justify-between items-center mb-1">
                        <h4 class="text-white font-bold text-lg tracking-tight">${ep.title}</h4>
                        <span class="material-symbols-outlined chevron-icon text-gray-600 transition-transform duration-300">expand_more</span>
                    </div>
                    <p class="text-gray-400 text-sm leading-relaxed line-clamp-2 font-light italic">
                        ${ep.log_line || ep.summary || ""}
                    </p>
                </div>
            </div>

            <div id="${detailId}" class="episode-detail-container bg-[#181818]">
                <div class="px-14 md:px-28 pt-2 pb-8 space-y-4 max-w-4xl">
                    
                    <div class="bg-[#222]/20 p-6 rounded-lg border-l-4 border-[#E50914]/40 mt-0">
                        <h5 class="text-[#E50914] font-bold text-[10px] uppercase tracking-[0.4em] mb-4 opacity-80">Production Highlights</h5>
                        <ul class="text-gray-200 text-[16px] space-y-3 font-normal leading-relaxed" style="font-family: 'Roboto', sans-serif;">
                            ${(ep.bullets || []).map(b => `
                                <li class="flex items-start gap-4">
                                    <span class="text-[#E50914] mt-1.5 text-[8px] opacity-60">●</span>
                                    <span class="tracking-normal">${b}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>

                    <div class="bg-[#222]/30 p-6 rounded-lg border-l-4 border-[#46d369]/40">
                        <h5 class="text-[#46d369] font-bold text-[10px] uppercase tracking-[0.4em] mb-3 opacity-80">Director's Note</h5>
                        <p class="font-serif-st italic text-gray-100 text-lg md:text-xl leading-snug">
                            "${ep.reflection || ""}"
                        </p>
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');
}



// Helper to toggle the block
function toggleEpisodeDetail(id) {
    const detail = document.getElementById(id);
    const row = document.getElementById(`row-${id}`);
    const modalContent = document.getElementById('seasons-content');
    const allDetails = document.querySelectorAll('.episode-detail-container');
    const allRows = document.querySelectorAll('.episode-row');

    if (!detail || !row || !modalContent) return;

    const isOpening = !detail.classList.contains('active');

    allDetails.forEach(d => { if (d.id !== id) d.classList.remove('active'); });
    allRows.forEach(r => { if (r.id !== `row-${id}`) r.classList.remove('is-active'); });

    detail.classList.toggle('active');
    row.classList.toggle('is-active');

    if (isOpening) {
        setTimeout(() => {
            const rowRect = row.getBoundingClientRect();
            const containerRect = modalContent.getBoundingClientRect();
            
            // Calculate relative offset
            const relativeOffset = rowRect.top - containerRect.top + modalContent.scrollTop;

            modalContent.scrollTo({
                top: relativeOffset - 80, 
                behavior: 'smooth'
            });
        }, 300); 
    }
}

/**
 * 4. UI HELPERS & MODALS
 */
function openModal(type, id) {
    const data = portfolioData[type].find((item, index) => (item.id || index).toString() === id.toString());
    if (!data) return;

    const uiMap = {
        'modal-img': { prop: 'src', val: data.image || 'assets/images/default.jpg' },
        'modal-title': { prop: 'textContent', val: data.company || data.title },
        'modal-year': { prop: 'textContent', val: data.year || (data.start_date ? `${data.start_date} - ${data.end_date}` : "") },
        'modal-role': { prop: 'textContent', val: data.title || data.subtitle || data.role },
        'modal-tech': { prop: 'textContent', val: (data.tags || data.tech_stack || []).join(', ') },
        'modal-genres': { prop: 'textContent', val: (data.genres || []).join(' • ') },
        'modal-mood': { prop: 'textContent', val: data.mood || "Innovative, Impactful" }
    };

    Object.entries(uiMap).forEach(([targetId, config]) => {
        const el = document.getElementById(targetId);
        if (el) el[config.prop] = config.val;
    });

    const locEl = document.getElementById('modal-loc');
    if (locEl) {
        locEl.innerHTML = type === 'certifications'
            ? `<span class="material-symbols-outlined text-[#46d369] align-middle text-xl">verified</span> Verified`
            : (data.location || "");
    }

    const descEl = document.getElementById('modal-desc');
    const bullets = data.bullets || data.details || data.desc || [];
    descEl.innerHTML = bullets.map(d => `<li class="mb-1">${d}</li>`).join('');

    const infoContainer = document.querySelector('#info-modal .md\\:col-span-1');
    const oldBtn = document.getElementById('modal-cred-link');
    if (oldBtn) oldBtn.remove(); 

    if (type === 'certifications' && data.link) {
        const linkBtn = document.createElement('a');
        linkBtn.id = 'modal-cred-link';
        linkBtn.href = data.link;
        linkBtn.target = '_blank';
        linkBtn.className = 'mt-6 inline-flex items-center gap-2 btn-more-info text-white px-4 py-2 rounded font-bold text-sm transition w-full justify-center border border-gray-600 hover:border-white';
        linkBtn.innerHTML = `<span class="material-symbols-outlined text-sm">open_in_new</span> View Credential`;
        infoContainer.appendChild(linkBtn);
    }

    toggleModal('info-modal', true);
}

function toggleModal(id, show) {
    const modal = document.getElementById(id);
    const content = modal.firstElementChild;
    if (show) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            content.classList.remove('scale-90');
            content.classList.add('scale-100');
        }, 10);
    } else {
        modal.classList.add('opacity-0');
        content.classList.add('scale-90');
        content.classList.remove('scale-100');
        document.body.style.overflow = 'auto';
        setTimeout(() => modal.classList.add('hidden'), 300);
    }
}

function closeModal(e, id, force) {
    if (force || e.target.id === id) toggleModal(id, false);
}

function scrollRow(id, amount) {
    const el = document.getElementById(id);
    if (el) el.scrollBy({ left: amount, behavior: 'smooth' });
}

function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: y, behavior: 'smooth' });
    }
}

function toggleProfileDropdown(event) {
    event.stopPropagation();
    const dropdown = document.getElementById('profile-dropdown');
    const arrow = document.getElementById('profile-arrow');
    if (dropdown) dropdown.classList.toggle('hidden');
    if (arrow) arrow.classList.toggle('rotate-180');
}

function openContactModal() {
    const dropdown = document.getElementById('profile-dropdown');
    if (dropdown) dropdown.classList.add('hidden');
    toggleModal('contact-modal', true);
}

window.addEventListener('click', () => {
    const dropdown = document.getElementById('profile-dropdown');
    if (dropdown) dropdown.classList.add('hidden');
});

function openSeasonsModal() {
    toggleModal('seasons-modal', true);
}

// Function to reset the Seasons modal to the very first season
function playFromBeginning() {
    const selector = document.getElementById('season-selector');
    if (selector) {
        selector.value = 0; 
        renderEpisodes(0); 

        const content = document.getElementById('seasons-content');
        if (content) content.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// START THE ENGINE
document.addEventListener('DOMContentLoaded', loadContent);
