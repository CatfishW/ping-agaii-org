const simulations = [
    {
        id: "force-motion",
        title: "Forces and Motion",
        subject: "physics",
        subSubject: "Motion",
        age: ["k6-9", "k10-12"],
        image: "https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics-600.png",
        badge: "Featured",
        tags: ["Motion", "Force", "Physics"],
        url: "https://game.agaii.org/Force&Motion/",
        description: "Explore the forces at work when pulling against a cart, and pushing a refrigerator, crate, or person."
    },
    {
        id: "bending-light",
        title: "Bending Light",
        subject: "physics",
        subSubject: "Light & Radiation",
        age: ["k10-12", "beyond"],
        image: "https://phet.colorado.edu/sims/html/bending-light/latest/bending-light-600.png",
        badge: "Hot",
        tags: ["Optics", "Refraction", "Waves"],
        url: "#",
        description: "Explore bending of light between two media with different indices of refraction."
    },
    {
        id: "circuit-dc",
        title: "Circuit Construction Kit: DC",
        subject: "physics",
        subSubject: "Electricity, Magnets & Circuits",
        age: ["k6-9", "k10-12", "beyond"],
        image: "https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc-600.png",
        badge: "New",
        tags: ["Circuits", "Electricity", "Physics"],
        url: "#",
        description: "Build circuits with batteries, resistors, light bulbs, and switches."
    },
    {
        id: "earth-layers",
        title: "Earth Layers",
        subject: "earth-science",
        subSubject: "Geology",
        age: ["k1-6", "k6-9"],
        image: "images/earth_science_thumb.png",
        badge: "New",
        tags: ["Geology", "Earth", "Science"],
        url: "#",
        description: "Dive deep into the Earth to explore the core, mantle, and crust layers."
    },
    {
        id: "fraction-matcher",
        title: "Fraction Matcher",
        subject: "math",
        subSubject: "Math Concepts",
        age: ["k1-6", "k6-9"],
        image: "https://phet.colorado.edu/sims/html/fraction-matcher/latest/fraction-matcher-600.png",
        badge: "Classic",
        tags: ["Fractions", "Math", "Numbers"],
        url: "#",
        description: "Match shapes and numbers to earn stars and level up your fraction skills."
    },
    {
        id: "balacing-act",
        title: "Balancing Act",
        subject: "physics",
        subSubject: "Work, Energy & Power",
        age: ["k1-6", "k6-9"],
        image: "https://phet.colorado.edu/sims/html/balancing-act/latest/balancing-act-600.png",
        badge: "",
        tags: ["Balance", "Torque", "Lever"],
        url: "#",
        description: "Play with objects on a teeter-totter to learn about balance and equilibrium."
    },
    {
        id: "natural-selection",
        title: "Natural Selection",
        subject: "biology",
        subSubject: "Evolution",
        age: ["k6-9", "k10-12", "beyond"],
        image: "https://phet.colorado.edu/sims/html/natural-selection/latest/natural-selection-600.png",
        badge: "Updated",
        tags: ["Biology", "Evolution", "Genetics"],
        url: "#",
        description: "Explore natural selection by controlling the environment and traits of a bunny population."
    },
    {
        id: "molarity",
        title: "Molarity",
        subject: "chemistry",
        subSubject: "General Chemistry",
        age: ["k10-12", "beyond"],
        image: "https://phet.colorado.edu/sims/html/molarity/latest/molarity-600.png",
        badge: "",
        tags: ["Chemistry", "Solutions", "Concentration"],
        url: "#",
        description: "What determines the concentration of a solution? Learn by adding solute to water."
    }
];

const subjectsOrder = [
    { id: "physics", label: "Physics", icon: "zap" },
    { id: "math", label: "Math & Statistics", icon: "divide" },
    { id: "chemistry", label: "Chemistry", icon: "flask-conical" },
    { id: "earth-science", label: "Earth Science", icon: "globe" },
    { id: "biology", label: "Biology", icon: "dna" }
];

function formatAge(ageKey) {
    const map = {
        "k1-6": "K1 ~ 6",
        "k6-9": "K6 ~ 9",
        "k10-12": "K10 ~ 12",
        "beyond": "Beyond K12"
    };
    return map[ageKey] || ageKey;
}

function createSimCard(sim) {
    return `
        <div class="sim-card" data-id="${sim.id}">
            ${sim.badge ? `<span class="sim-badge">${sim.badge}</span>` : ""}
            <div class="sim-card-image">
                <img src="${sim.image}" alt="${sim.title}" loading="lazy">
            </div>
            <div class="sim-card-content">
                <div class="sim-tags">
                    ${sim.tags.slice(0, 2).map(tag => `<span class="tag">${tag}</span>`).join("")}
                </div>
                <h4>${sim.title}</h4>
                <div class="sim-footer">
                    <div class="card-tech-icons">
                        <span class="tech-icon html5">5</span>
                    </div>
                    <div class="sim-age">
                        <i data-lucide="graduation-cap"></i>
                        <span>${sim.age.map(a => formatAge(a).split("~")[0]).join(", ")}</span>
                    </div>
                    <button class="btn-play" onclick="window.location.href='${sim.url}'; event.stopPropagation();">
                        <i data-lucide="play-circle"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderSimulations(filtered) {
    const grid = document.getElementById("sim-grid");
    const count = document.getElementById("results-count");

    // Smooth transition
    grid.style.opacity = "0";

    setTimeout(() => {
        grid.innerHTML = filtered.map(sim => createSimCard(sim)).join("");
        count.innerText = `${filtered.length} Simulations Found`;
        lucide.createIcons();
        grid.style.opacity = "1";
    }, 200);
}

function filterSimulations() {
    const searchVal = document.getElementById("main-search").value.toLowerCase();
    const activeSubjects = Array.from(document.querySelectorAll(".filters input[value]:checked"))
        .filter(i => ["physics", "math", "chemistry", "biology", "earth-science"].includes(i.value))
        .map(i => i.value);

    const activeAges = Array.from(document.querySelectorAll(".filters input[value]:checked"))
        .filter(i => ["k1-6", "k6-9", "k10-12", "beyond"].includes(i.value))
        .map(i => i.value);

    const filtered = simulations.filter(sim => {
        const matchesSearch = sim.title.toLowerCase().includes(searchVal) ||
            sim.tags.some(t => t.toLowerCase().includes(searchVal));
        const matchesSubject = activeSubjects.length === 0 || activeSubjects.includes(sim.subject);
        const matchesAge = activeAges.length === 0 || sim.age.some(a => activeAges.includes(a));

        return matchesSearch && matchesSubject && matchesAge;
    });

    renderSimulations(filtered);
}

// Tab Switching Logic
function initTabs() {
    const tabs = document.querySelectorAll(".tab-btn");
    const views = document.querySelectorAll(".tab-view");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const target = tab.dataset.tab;

            tabs.forEach(t => t.classList.remove("active"));
            views.forEach(v => v.classList.remove("active"));

            tab.classList.add("active");
            document.getElementById(`${target}-view`).classList.add("active");

            if (target === "browse") {
                renderBrowseView();
            } else if (target === "filter") {
                renderFilterView();
            }
        });
    });
}

function renderBrowseView() {
    const browseView = document.getElementById("browse-view");
    let content = `<h2 class="section-title">Browse Content</h2>`;

    subjectsOrder.forEach(subj => {
        const subjSims = simulations.filter(s => s.subject === subj.id);
        if (subjSims.length > 0) {
            content += `
                <div class="browse-category">
                    <div class="category-header">
                        <div class="category-title">
                            <i data-lucide="${subj.icon}"></i>
                            <h3>${subj.label}</h3>
                        </div>
                        <a href="#" class="view-all" onclick="openFilterWithSubject('${subj.id}')">View All ${subj.label} ></a>
                    </div>
                    <div class="sim-row">
                        ${subjSims.map(sim => createSimCard(sim)).join("")}
                    </div>
                </div>
            `;
        }
    });

    browseView.innerHTML = content;
    lucide.createIcons();
}

function openFilterWithSubject(subjId) {
    const filterTab = document.querySelector('[data-tab="filter"]');
    filterTab.click();

    // Uncheck all subjects
    document.querySelectorAll(".filters input[value]").forEach(i => i.checked = false);
    // Check target subject
    const targetCheck = document.querySelector(`.filters input[value="${subjId}"]`);
    if (targetCheck) targetCheck.checked = true;

    filterSimulations();
}

function bindFilterEvents() {
    document.querySelectorAll(".filters input").forEach(input => {
        input.addEventListener("change", filterSimulations);
    });
}

// Global Search
document.getElementById("main-search")?.addEventListener("input", () => {
    const currentTab = document.querySelector(".tab-btn.active").dataset.tab;
    if (currentTab === "browse") {
        // Find results across all categories
        renderBrowseView();
    } else {
        filterSimulations();
    }
});

// Initialize
window.addEventListener("DOMContentLoaded", () => {
    initTabs();
    renderBrowseView(); // Default view
    bindFilterEvents(); // Bind events for filtering
});
