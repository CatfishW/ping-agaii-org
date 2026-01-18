const simulations = [
    {
        id: 'force-motion',
        title: 'Force & Motion',
        subject: 'physics',
        age: ['k6-9', 'k10-12'],
        image: 'images/force_and_motion.png',
        badge: 'NEW',
        tags: ['Motion', 'Newtonian', 'Forces'],
        url: 'https://game.agaii.org/Force&Motion/',
        description: 'Explore the relationship between force, mass, and acceleration.'
    },
    {
        id: 'circuit-construction',
        title: 'Circuit Construction Kit',
        subject: 'physics',
        age: ['k6-9', 'k10-12', 'beyond'],
        image: 'images/hero_bg.png', // Placeholder or use another generated if needed
        badge: 'POPULAR',
        tags: ['Electricity', 'Circuits', 'DC'],
        url: '#',
        description: 'Build circuits with batteries, resistors, and switches.'
    },
    {
        id: 'fractions-intro',
        title: 'Fractions: Intro',
        subject: 'math',
        age: ['k1-6'],
        image: 'images/math_thumb.png',
        badge: '',
        tags: ['Fractions', 'Numbers'],
        url: '#',
        description: 'Learn about fractions by building your own.'
    },
    {
        id: 'molecule-shapes',
        title: 'Molecule Shapes',
        subject: 'chemistry',
        age: ['k10-12', 'beyond'],
        image: 'images/chemistry_thumb.png',
        badge: '3D',
        tags: ['VSEPR', 'Bonds', 'Geometry'],
        url: '#',
        description: 'Explore molecule shapes by building them in 3D.'
    },
    {
        id: 'natural-selection',
        title: 'Natural Selection',
        subject: 'biology',
        age: ['k6-9', 'k10-12'],
        image: 'images/biology_thumb.png',
        badge: '',
        tags: ['Evolution', 'Genetics', 'Populations'],
        url: '#',
        description: 'Explore how populations change over time.'
    },
    {
        id: 'masses-springs',
        title: 'Masses & Springs',
        subject: 'physics',
        age: ['k6-9', 'k10-12'],
        image: 'images/force_and_motion.png',
        badge: '',
        tags: ['Hookes Law', 'Oscillation'],
        url: '#',
        description: 'Hang masses from springs and adjust the spring stiffness.'
    }
];

const simGrid = document.getElementById('sim-grid');
const resultsCount = document.getElementById('results-count');
const filterCheckboxes = document.querySelectorAll('.filters input[type="checkbox"]');
const searchInput = document.getElementById('main-search');

function renderSimulations(filteredSims) {
    // Add fade-out effect before clearing
    simGrid.style.opacity = '0';

    setTimeout(() => {
        simGrid.innerHTML = '';

        filteredSims.forEach((sim, index) => {
            const card = document.createElement('div');
            card.className = 'sim-card';
            card.style.animation = `fadeInUp 0.5s ease-out ${index * 0.05}s backwards`;

            card.innerHTML = `
                ${sim.badge ? `<span class="sim-badge">${sim.badge}</span>` : ''}
                <div class="sim-card-image">
                    <img src="${sim.image}" alt="${sim.title}">
                </div>
                <div class="sim-card-content">
                    <div class="sim-tags">
                        ${sim.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    <h4>${sim.title}</h4>
                    <div class="sim-footer">
                        <div class="sim-age">
                            <i data-lucide="users" size="14"></i>
                            ${formatAge(sim.age)}
                        </div>
                        <button class="btn-play">
                            Play <i data-lucide="play-circle" size="18"></i>
                        </button>
                    </div>
                </div>
            `;

            card.addEventListener('click', (e) => {
                e.preventDefault();
                window.open(sim.url, '_blank');
            });

            simGrid.appendChild(card);
        });

        lucide.createIcons();
        resultsCount.textContent = `${filteredSims.length} results found`;
        simGrid.style.opacity = '1';
    }, 200);
}

function formatAge(ageArray) {
    const labels = {
        'k1-6': 'K1-6',
        'k6-9': 'K6-9',
        'k10-12': 'K10-12',
        'beyond': 'Beyond K12'
    };
    return ageArray.map(a => labels[a]).join(', ');
}

function filterSimulations() {
    const checkedSubjects = Array.from(document.querySelectorAll('.filter-group:nth-child(2) input:checked')).map(cb => cb.value);
    const checkedAges = Array.from(document.querySelectorAll('.filter-group:nth-child(3) input:checked')).map(cb => cb.value);
    const searchTerm = searchInput.value.toLowerCase();

    const filtered = simulations.filter(sim => {
        const matchesSubject = checkedSubjects.length === 0 || checkedSubjects.includes(sim.subject);
        const matchesAge = checkedAges.length === 0 || checkedAges.some(age => sim.age.includes(age));
        const matchesSearch = sim.title.toLowerCase().includes(searchTerm) ||
            sim.tags.some(tag => tag.toLowerCase().includes(searchTerm));

        return matchesSubject && matchesAge && matchesSearch;
    });

    renderSimulations(filtered);
}

// Event Listeners
filterCheckboxes.forEach(cb => {
    cb.addEventListener('change', filterSimulations);
});

searchInput.addEventListener('input', filterSimulations);

document.getElementById('search-toggle').addEventListener('click', () => {
    searchInput.focus();
    searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

// Initial Render
renderSimulations(simulations);

// Add CSS transition for opacity
simGrid.style.transition = 'opacity 0.3s ease';
