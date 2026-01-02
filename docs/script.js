// GitHub Configuration
const GITHUB_USER = 'samonide';
const GITHUB_REPO = 'Wallpapers'; // Change this if your repo name is different
const GITHUB_BRANCH = 'main';

// State
let currentCategory = 'all';
let wallpapers = [];
let categories = [];

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    setupEventListeners();
    setupCategoryScroll();
    setupScrollEffects();
    addStaggeredAnimation();
});

// Load data from static JSON
async function loadData() {
    try {
        const response = await fetch('wallpapers.json');
        const data = await response.json();
        wallpapers = data.wallpapers;
        categories = data.categories;

        // Load categories into nav
        const navScroll = document.getElementById('navScroll');
        categories.forEach(category => {
            const btn = document.createElement('button');
            btn.className = 'category-btn';
            btn.dataset.category = category;
            btn.textContent = category;
            btn.addEventListener('click', () => filterByCategory(category));
            navScroll.appendChild(btn);
        });

        displayWallpapers();
    } catch (error) {
        console.error('Error loading data:', error);
        document.getElementById('gallery').innerHTML = '<div class="loading">Error loading wallpapers. Please ensure you\'re serving this via a web server.</div>';
    }
}

// Display wallpapers
function displayWallpapers() {
    const gallery = document.getElementById('gallery');
    const filtered = currentCategory === 'all'
        ? wallpapers
        : wallpapers.filter(w => w.category === currentCategory);

    // Update count
    document.getElementById('wallpaper-count').textContent =
        `${filtered.length} wallpaper${filtered.length !== 1 ? 's' : ''}`;

    if (filtered.length === 0) {
        gallery.innerHTML = '<div class="loading">No wallpapers found.</div>';
        return;
    }

    gallery.innerHTML = '';
    filtered.forEach(wallpaper => {
        const item = document.createElement('div');
        item.className = 'gallery-item';

        const img = document.createElement('img');
        img.src = `thumbnails/${wallpaper.category}/${wallpaper.name}.jpg`;
        img.alt = wallpaper.name;
        img.loading = 'lazy';
        img.style.cursor = 'pointer';
        img.onclick = () => openGitHubRaw(wallpaper);
        img.onerror = () => {
            img.src = `../${wallpaper.category}/${wallpaper.filename}`;
        };

        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        overlay.innerHTML = `
            <div class="overlay-content">
                <h3>${wallpaper.name}</h3>
                <p>${wallpaper.category}</p>
            </div>
        `;

        item.appendChild(img);
        item.appendChild(overlay);
        gallery.appendChild(item);
    });
}

// Filter by category
function filterByCategory(category) {
    currentCategory = category;

    // Update active button
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });

    displayWallpapers();

    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Re-apply staggered animation to new items
    setTimeout(() => addStaggeredAnimation(), 100);
}

// Open raw GitHub link
function openGitHubRaw(wallpaper) {
    const rawUrl = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${wallpaper.category}/${wallpaper.filename}`;
    window.open(rawUrl, '_blank');
}

// Setup event listeners
function setupEventListeners() {
    // No lightbox listeners needed anymore
}

// Setup category scroll functionality
function setupCategoryScroll() {
    const scrollContainer = document.getElementById('navScroll');
    const scrollLeft = document.getElementById('scrollLeft');
    const scrollRight = document.getElementById('scrollRight');

    scrollLeft.onclick = () => {
        scrollContainer.scrollBy({ left: -200, behavior: 'smooth' });
    };

    scrollRight.onclick = () => {
        scrollContainer.scrollBy({ left: 200, behavior: 'smooth' });
    };

    // Update button visibility
    function updateScrollButtons() {
        const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
        scrollLeft.style.opacity = scrollContainer.scrollLeft > 5 ? '1' : '0.4';
        scrollRight.style.opacity = scrollContainer.scrollLeft < maxScroll - 5 ? '1' : '0.4';
        scrollLeft.style.pointerEvents = scrollContainer.scrollLeft > 5 ? 'auto' : 'none';
        scrollRight.style.pointerEvents = scrollContainer.scrollLeft < maxScroll - 5 ? 'auto' : 'none';
    }

    scrollContainer.addEventListener('scroll', updateScrollButtons);
    window.addEventListener('resize', updateScrollButtons);
    setTimeout(updateScrollButtons, 100);
}

// Add scroll effects for navbar
function setupScrollEffects() {
    const nav = document.querySelector('.category-nav');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        // Add scrolled class for styling
        if (currentScroll > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });
}

// Add staggered animation to gallery items
function addStaggeredAnimation() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 50);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '50px'
    });

    document.querySelectorAll('.gallery-item').forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(item);
    });
}
