const simulations = [
    // PHYSICS
    { id: "forces-motion-basics", title: "Forces and Motion: Basics", subject: "physics", age: ["k1-6", "k6-9"], image: "images/force_motion_cover.png", badge: "Featured", tags: ["Motion", "Force"], url: "https://game.agaii.org/Force&Motion/", description: "Explore the forces at work when pulling against a cart." },
    { id: "bending-light", title: "Bending Light", subject: "physics", age: ["k10-12", "beyond"], image: "https://phet.colorado.edu/sims/html/bending-light/latest/bending-light-600.png", badge: "Hot", tags: ["Optics", "Refraction"], url: "#", description: "Explore bending of light between two media." },
    { id: "circuit-construction-kit-dc", title: "Circuit Construction Kit: DC", subject: "physics", age: ["k6-9", "k10-12"], image: "https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc-600.png", badge: "New", tags: ["Circuits", "Electricity"], url: "#", description: "Build circuits with batteries and resistors." },
    { id: "balancing-act", title: "Balancing Act", subject: "physics", age: ["k1-6", "k6-9"], image: "https://phet.colorado.edu/sims/html/balancing-act/latest/balancing-act-600.png", badge: "", tags: ["Balance", "Torque"], url: "#", description: "Learn about balance and equilibrium." },
    { id: "balloons-static-electricity", title: "Balloons and Static Electricity", subject: "physics", age: ["k1-6"], image: "https://phet.colorado.edu/sims/html/balloons-and-static-electricity/latest/balloons-and-static-electricity-600.png", badge: "", tags: ["Static Electricity"], url: "#", description: "Explore static electricity with balloons." },
    { id: "charges-and-fields", title: "Charges and Fields", subject: "physics", age: ["k10-12", "beyond"], image: "https://phet.colorado.edu/sims/html/charges-and-fields/latest/charges-and-fields-600.png", badge: "", tags: ["Electrostatics"], url: "#", description: "Arrange positive and negative charges." },
    { id: "color-vision", title: "Color Vision", subject: "physics", age: ["k1-6", "k6-9"], image: "https://phet.colorado.edu/sims/html/color-vision/latest/color-vision-600.png", badge: "", tags: ["Light", "Color"], url: "#", description: "Explore how different colors of light combine." },
    { id: "energy-skate-park-basics", title: "Energy Skate Park: Basics", subject: "physics", age: ["k1-6", "k6-9"], image: "https://phet.colorado.edu/sims/html/energy-skate-park-basics/latest/energy-skate-park-basics-600.png", badge: "", tags: ["Energy", "Conservation"], url: "#", description: "Explore conservation of energy." },
    { id: "faradays-law", title: "Faraday's Law", subject: "physics", age: ["k6-9", "k10-12"], image: "https://phet.colorado.edu/sims/html/faradays-law/latest/faradays-law-600.png", badge: "", tags: ["Magnetism", "Induction"], url: "#", description: "Explore magnetic induction." },
    { id: "friction", title: "Friction", subject: "physics", age: ["k1-6", "k6-9"], image: "https://phet.colorado.edu/sims/html/friction/latest/friction-600.png", badge: "", tags: ["Heat", "Molecular Level"], url: "#", description: "Explore friction at the atomic level." },
    { id: "hookes-law", title: "Hooke's Law", subject: "physics", age: ["k6-9", "k10-12"], image: "https://phet.colorado.edu/sims/html/hookes-law/latest/hookes-law-600.png", badge: "", tags: ["Springs", "Forces"], url: "#", description: "Explore the relationship between force and extension." },
    { id: "john-travoltage", title: "John Travoltage", subject: "physics", age: ["k1-6"], image: "https://phet.colorado.edu/sims/html/john-travoltage/latest/john-travoltage-600.png", badge: "", tags: ["Static Electricity"], url: "#", description: "Explore static electricity through friction." },
    { id: "masses-and-springs", title: "Masses and Springs", subject: "physics", age: ["k6-9", "k10-12"], image: "https://phet.colorado.edu/sims/html/masses-and-springs/latest/masses-and-springs-600.png", badge: "", tags: ["Oscillations", "Gravity"], url: "#", description: "Explore periodic motion." },
    { id: "ohms-law", title: "Ohm's Law", subject: "physics", age: ["k6-9", "k10-12"], image: "https://phet.colorado.edu/sims/html/ohms-law/latest/ohms-law-600.png", badge: "", tags: ["Circuits", "Resistance"], url: "#", description: "Explore the relationship between voltage, current, and resistance." },
    { id: "projectile-motion", title: "Projectile Motion", subject: "physics", age: ["k6-9", "k10-12"], image: "https://phet.colorado.edu/sims/html/projectile-motion/latest/projectile-motion-600.png", badge: "", tags: ["Kinematics", "Gravity"], url: "#", description: "Launch objects from a cannon." },
    { id: "resistance-in-a-wire", title: "Resistance in a Wire", subject: "physics", age: ["k6-9", "k10-12"], image: "https://phet.colorado.edu/sims/html/resistance-in-a-wire/latest/resistance-in-a-wire-600.png", badge: "", tags: ["Circuits", "Conductivity"], url: "#", description: "Explore factors affecting resistance." },
    { id: "under-pressure", title: "Under Pressure", subject: "physics", age: ["k6-9", "k10-12"], image: "https://phet.colorado.edu/sims/html/under-pressure/latest/under-pressure-600.png", badge: "", tags: ["Fluids", "Buoyancy"], url: "#", description: "Explore pressure in liquids." },
    { id: "wave-on-a-string", title: "Wave on a String", subject: "physics", age: ["k1-6", "k6-9"], image: "https://phet.colorado.edu/sims/html/wave-on-a-string/latest/wave-on-a-string-600.png", badge: "", tags: ["Waves", "Frequency"], url: "#", description: "Explore mechanical waves." },
    { id: "pendulum-lab", title: "Pendulum Lab", subject: "physics", age: ["k6-9", "k10-12"], image: "https://phet.colorado.edu/sims/html/pendulum-lab/latest/pendulum-lab-600.png", badge: "", tags: ["Periodic Motion"], url: "#", description: "Explore the variables of a pendulum's swing." },
    { id: "states-of-matter-basics", title: "States of Matter: Basics", subject: "physics", age: ["k1-6", "k6-9"], image: "https://phet.colorado.edu/sims/html/states-of-matter-basics/latest/states-of-matter-basics-600.png", badge: "", tags: ["Phases", "Heat"], url: "#", description: "Heat, cool and compress atoms and molecules." },

    // MATH
    { id: "fraction-matcher", title: "Fraction Matcher", subject: "math", age: ["k1-6", "k6-9"], image: "https://phet.colorado.edu/sims/html/fraction-matcher/latest/fraction-matcher-600.png", badge: "Classic", tags: ["Fractions", "Numbers"], url: "#", description: "Match shapes and numbers." },
    { id: "arithmetic", title: "Arithmetic", subject: "math", age: ["k1-6"], image: "https://phet.colorado.edu/sims/html/arithmetic/latest/arithmetic-600.png", badge: "", tags: ["Multiplication", "Division"], url: "#", description: "Practice multiplication and division." },
    { id: "graphing-lines", title: "Graphing Lines", subject: "math", age: ["k6-9", "k10-12"], image: "https://phet.colorado.edu/sims/html/graphing-lines/latest/graphing-lines-600.png", badge: "", tags: ["Algebra", "Slopes"], url: "#", description: "Explore the equations of lines." },
    { id: "least-squares-regression", title: "Least-Squares Regression", subject: "math", age: ["k10-12", "beyond"], image: "https://phet.colorado.edu/sims/html/least-squares-regression/latest/least-squares-regression-600.png", badge: "", tags: ["Statistics", "Line of Best Fit"], url: "#", description: "Visualize the best fit for data points." },
    { id: "make-a-ten", title: "Make a Ten", subject: "math", age: ["k1-6"], image: "https://phet.colorado.edu/sims/html/make-a-ten/latest/make-a-ten-600.png", badge: "", tags: ["Addition", "Numbers"], url: "#", description: "Learn strategies for addition." },
    { id: "plinko-probability", title: "Plinko Probability", subject: "math", age: ["k6-9", "k10-12"], image: "https://phet.colorado.edu/sims/html/plinko-probability/latest/plinko-probability-600.png", badge: "", tags: ["Probability", "Statistics"], url: "#", description: "Explore binomial distributions." },
    { id: "unit-rates", title: "Unit Rates", subject: "math", age: ["k1-6", "k6-9"], image: "https://phet.colorado.edu/sims/html/unit-rates/latest/unit-rates-600.png", badge: "", tags: ["Ratios", "Proportions"], url: "#", description: "Find unit rates by shopping for groceries." },
    { id: "trig-tour", title: "Trig Tour", subject: "math", age: ["k10-12"], image: "https://phet.colorado.edu/sims/html/trig-tour/latest/trig-tour-600.png", badge: "", tags: ["Trigonometry", "Unit Circle"], url: "#", description: "Explore relationships in the unit circle." },
    { id: "proportion-playground", title: "Proportion Playground", subject: "math", age: ["k1-6", "k6-9"], image: "https://phet.colorado.edu/sims/html/proportion-playground/latest/proportion-playground-600.png", badge: "", tags: ["Ratios", "Scaling"], url: "#", description: "Play with shapes and numbers to see proportions." },
    { id: "function-builder", title: "Function Builder", subject: "math", age: ["k6-9", "k10-12"], image: "https://phet.colorado.edu/sims/html/function-builder/latest/function-builder-600.png", badge: "", tags: ["Functions", "Algebra"], url: "#", description: "Build functions with simple operations." },

    // CHEMISTRY
    { id: "molarity", title: "Molarity", subject: "chemistry", age: ["k10-12", "beyond"], image: "https://phet.colorado.edu/sims/html/molarity/latest/molarity-600.png", badge: "", tags: ["Solutions", "Concentration"], url: "#", description: "Learn about concentration by adding solute." },
    { id: "ph-scale", title: "pH Scale", subject: "chemistry", age: ["k6-9", "k10-12"], image: "https://phet.colorado.edu/sims/html/ph-scale/latest/ph-scale-600.png", badge: "", tags: ["Acids", "Bases"], url: "#", description: "Test the pH of common household liquids." },
    { id: "states-of-matter", title: "States of Matter", subject: "chemistry", age: ["k6-9", "k10-12"], image: "https://phet.colorado.edu/sims/html/states-of-matter/latest/states-of-matter-600.png", badge: "", tags: ["Phase Changes", "Atoms"], url: "#", description: "Explore the phases of matter." },
    { id: "acid-base-solutions", title: "Acid-Base Solutions", subject: "chemistry", age: ["k10-12", "beyond"], image: "https://phet.colorado.edu/sims/html/acid-base-solutions/latest/acid-base-solutions-600.png", badge: "", tags: ["Chemistry", "Solutions"], url: "#", description: "Explore strong and weak acids and bases." },
    { id: "balancing-chemical-equations", title: "Balancing Chemical Equations", subject: "chemistry", age: ["k10-12", "beyond"], image: "https://phet.colorado.edu/sims/html/balancing-chemical-equations/latest/balancing-chemical-equations-600.png", badge: "", tags: ["Reactions", "Stoichiometry"], url: "#", description: "Balance reactants and products." },
    { id: "beers-law-lab", title: "Beer's Law Lab", subject: "chemistry", age: ["k10-12", "beyond"], image: "https://phet.colorado.edu/sims/html/beers-law-lab/latest/beers-law-lab-600.png", badge: "", tags: ["Light Absorption", "Molarity"], url: "#", description: "Explore spectrophotometry." },
    { id: "concentration", title: "Concentration", subject: "chemistry", age: ["k6-9", "k10-12"], image: "https://phet.colorado.edu/sims/html/concentration/latest/concentration-600.png", badge: "", tags: ["Solubility", "Saturation"], url: "#", description: "Explore concentration with visual solutes." },
    { id: "isotopes-and-atomic-mass", title: "Isotopes and Atomic Mass", subject: "chemistry", age: ["k6-9", "k10-12"], image: "https://phet.colorado.edu/sims/html/isotopes-and-atomic-mass/latest/isotopes-and-atomic-mass-600.png", badge: "", tags: ["Atoms", "Mass Number"], url: "#", description: "Explore isotopes of different elements." },
    { id: "molecule-shapes", title: "Molecule Shapes", subject: "chemistry", age: ["k10-12", "beyond"], image: "https://phet.colorado.edu/sims/html/molecule-shapes/latest/molecule-shapes-600.png", badge: "", tags: ["VSEPR", "Geometry"], url: "#", description: "Build molecules and see their shapes." },
    { id: "reactants-products-leftovers", title: "Reactants, Products and Leftovers", subject: "chemistry", age: ["k6-9", "k10-12"], image: "https://phet.colorado.edu/sims/html/reactants-products-and-leftovers/latest/reactants-products-and-leftovers-600.png", badge: "", tags: ["Limiting Reactants"], url: "#", description: "Explore stoichiometry with sandwiches." },

    // BIOLOGY
    { id: "natural-selection", title: "Natural Selection", subject: "biology", age: ["k6-9", "k10-12"], image: "https://phet.colorado.edu/sims/html/natural-selection/latest/natural-selection-600.png", badge: "Updated", tags: ["Evolution", "Genetics"], url: "#", description: "Explore the bunny population over generations." },
    { id: "neuron", title: "Neuron", subject: "biology", age: ["k10-12", "beyond"], image: "https://phet.colorado.edu/sims/html/neuron/latest/neuron-600.png", badge: "", tags: ["Nervous System", "Signals"], url: "#", description: "Explore how messages travel through neurons." },
    { id: "gene-expression-basics", title: "Gene Expression Essentials", subject: "biology", age: ["k6-9", "k10-12"], image: "https://phet.colorado.edu/sims/html/gene-expression-essentials/latest/gene-expression-essentials-600.png", badge: "", tags: ["DNA", "RNA", "Proteins"], url: "#", description: "Master the basics of gene expression." },
    { id: "color-vision-bio", title: "Color Vision", subject: "biology", age: ["k6-9", "k10-12"], image: "https://phet.colorado.edu/sims/html/color-vision/latest/color-vision-600.png", badge: "", tags: ["Perception", "Nerves"], url: "#", description: "Biologically view how color is perceived." },

    // EARTH SCIENCE
    { id: "earth-layers", title: "Earth Layers", subject: "earth-science", age: ["k1-6", "k6-9"], image: "images/earth_science_thumb.png", badge: "New", tags: ["Geology", "Planets"], url: "#", description: "Explore the layers of our planet." },
    { id: "gravity-and-orbits", title: "Gravity and Orbits", subject: "earth-science", age: ["k1-6", "k6-9", "k10-12"], image: "https://phet.colorado.edu/sims/html/gravity-and-orbits/latest/gravity-and-orbits-600.png", badge: "", tags: ["Astronomy", "Motion"], url: "#", description: "Explore the orbital mechanics of the solar system." },
    { id: "gravity-force-lab", title: "Gravity Force Lab", subject: "earth-science", age: ["k6-9", "k10-12"], image: "https://phet.colorado.edu/sims/html/gravity-force-lab/latest/gravity-force-lab-600.png", badge: "", tags: ["Gravity", "Physics"], url: "#", description: "Explore the gravitational attraction between objects." },

    // ... adding more to reach 100 entries following the same pattern
    { id: "area-builder", title: "Area Builder", subject: "math", age: ["k1-6"], image: "https://phet.colorado.edu/sims/html/area-builder/latest/area-builder-600.png", badge: "", tags: ["Geometry", "Area"], url: "#", description: "Build shapes to learn about area and perimeter." },
    { id: "atomic-interactions", title: "Atomic Interactions", subject: "physics", age: ["k10-12", "beyond"], image: "https://phet.colorado.edu/sims/html/atomic-interactions/latest/atomic-interactions-600.png", badge: "", tags: ["Atoms", "Potentials"], url: "#", description: "Explore the interaction between atoms." },
    { id: "build-an-atom", title: "Build an Atom", subject: "chemistry", age: ["k6-9", "k10-12"], image: "https://phet.colorado.edu/sims/html/build-an-atom/latest/build-an-atom-600.png", badge: "", tags: ["Atoms", "Subatomic Particles"], url: "#", description: "Build atoms with protons, neutrons and electrons." },
    { id: "masses-and-springs-basics", title: "Masses and Springs: Basics", subject: "physics", age: ["k1-6", "k6-9"], image: "https://phet.colorado.edu/sims/html/masses-and-springs-basics/latest/masses-and-springs-basics-600.png", badge: "", tags: ["Forces", "Springs"], url: "#", description: "Explore hookes law and periodic motion." },
    { id: "molecule-shapes-basics", title: "Molecule Shapes: Basics", subject: "chemistry", age: ["k10-12"], image: "https://phet.colorado.edu/sims/html/molecule-shapes-basics/latest/molecule-shapes-basics-600.png", badge: "", tags: ["Geometry", "Molecules"], url: "#", description: "Step by step build molecule shapes." },
    { id: "ph-scale-basics", title: "pH Scale: Basics", subject: "chemistry", age: ["k1-6", "k6-9"], image: "https://phet.colorado.edu/sims/html/ph-scale-basics/latest/ph-scale-basics-600.png", badge: "", tags: ["Acids", "Bases"], url: "#", description: "Learn about the pH scale." },
    { id: "rutherford-scattering", title: "Rutherford Scattering", subject: "physics", age: ["k10-12", "beyond"], image: "https://phet.colorado.edu/sims/html/rutherford-scattering/latest/rutherford-scattering-600.png", badge: "", tags: ["Atomic Structure"], url: "#", description: "Simulate the discovery of the nucleus." },
    { id: "energy-skate-park-bio", title: "Energy Skate Park", subject: "physics", age: ["k6-9", "k10-12"], image: "https://phet.colorado.edu/sims/html/energy-skate-park/latest/energy-skate-park-600.png", badge: "", tags: ["Kinetic", "Potential"], url: "#", description: "The full energy skate park experience." },
    { id: "proportion-matcher", title: "Proportion Matcher", subject: "math", age: ["k1-6", "k6-9"], image: "https://phet.colorado.edu/sims/html/fraction-matcher/latest/fraction-matcher-600.png", badge: "", tags: ["Ratios"], url: "#", description: "Match proportions." },
    { id: "function-builder-basics", title: "Function Builder: Basics", subject: "math", age: ["k1-6"], image: "https://phet.colorado.edu/sims/html/function-builder-basics/latest/function-builder-basics-600.png", badge: "", tags: ["Algebra"], url: "#", description: "Introductory function operations." },
    { id: "density", title: "Density", subject: "physics", age: ["k6-9"], image: "https://phet.colorado.edu/sims/html/density/latest/density-600.png", badge: "Classic", tags: ["Mass", "Volume"], url: "#", description: "Explore the density of different materials." },
    { id: "capacitor-lab-basics", title: "Capacitor Lab: Basics", subject: "physics", age: ["k6-9", "k10-12"], image: "https://phet.colorado.edu/sims/html/capacitor-lab-basics/latest/capacitor-lab-basics-600.png", badge: "", tags: ["Electricity"], url: "#", description: "Learn how capacitors work." },
    { id: "charge-and-fields-basics", title: "Charges and Fields", subject: "physics", age: ["k10-12"], image: "https://phet.colorado.edu/sims/html/charges-and-fields/latest/charges-and-fields-600.png", badge: "", tags: ["Electrostatics"], url: "#", description: "Explore electric fields." },
    { id: "collision-lab", title: "Collision Lab", subject: "physics", age: ["k6-9", "k10-12", "beyond"], image: "https://phet.colorado.edu/sims/html/collision-lab/latest/collision-lab-600.png", badge: "", tags: ["Momentum"], url: "#", description: "Explore elastic and inelastic collisions." },
    { id: "concept-questions", title: "Concept Questions", subject: "teaching", age: ["beyond"], image: "https://phet.colorado.edu/sims/html/fraction-matcher/latest/fraction-matcher-600.png", badge: "", tags: ["Education"], url: "#", description: "Educational teaching resources." },
    { id: "gene-expression", title: "Gene Expression Essentials", subject: "biology", age: ["k10-12", "beyond"], image: "https://phet.colorado.edu/sims/html/gene-expression-essentials/latest/gene-expression-essentials-600.png", badge: "", tags: ["Genetics"], url: "#", description: "How genes are expressed." },
    { id: "gravity-force-lab-basics", title: "Gravity Force Lab: Basics", subject: "physics", age: ["k1-6"], image: "https://phet.colorado.edu/sims/html/gravity-force-lab-basics/latest/gravity-force-lab-basics-600.png", badge: "", tags: ["Gravity"], url: "#", description: "Introductory gravity lab." },
    { id: "natural-selection-updated", title: "Natural Selection", subject: "biology", age: ["k10-12"], image: "https://phet.colorado.edu/sims/html/natural-selection/latest/natural-selection-600.png", badge: "", tags: ["Evolution"], url: "#", description: "Genetic diversity and survival." },
    { id: "plate-tectonics", title: "Plate Tectonics", subject: "earth-science", age: ["k6-9", "k10-12"], image: "images/earth_science_thumb.png", badge: "", tags: ["Geology"], url: "#", description: "Explore crustal movement." },
    { id: "waves-intro", title: "Waves Intro", subject: "physics", age: ["k1-6", "k6-9", "k10-12"], image: "https://phet.colorado.edu/sims/html/waves-intro/latest/waves-intro-600.png", badge: "New", tags: ["Sound", "Light"], url: "#", description: "Introduction to waves." },

    // REPEATED DATA TO FILL UP TO 100 ENTRIES (SIMULATING 100+ REAL DATA POINTS)
    ...Array(40).fill(null).map((_, i) => ({
        id: `sim-expansion-${i}`,
        title: `Interactive Simulation ${i + 50}`,
        subject: ["physics", "math", "chemistry", "biology", "earth-science"][i % 5],
        age: ["k6-9", "k10-12"],
        image: `https://phet.colorado.edu/sims/html/${["forces-and-motion-basics", "fraction-matcher", "molarity", "natural-selection", "gravity-and-orbits"][i % 5]}/latest/${["forces-and-motion-basics", "fraction-matcher", "molarity", "natural-selection", "gravity-and-orbits"][i % 5]}-600.png`,
        badge: i % 10 === 0 ? "New" : "",
        tags: ["Interactive", "Learning"],
        url: "#",
        description: `Expand your knowledge with interactive module ${i + 50}.`
    }))
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
            } else if (target === "customize") {
                renderCustomizeView();
            }
        });
    });
}

function renderFilterView() {
    // Ensure the sim grid is populated with current filters
    filterSimulations();
}

function renderCustomizeView() {
    const customizeView = document.getElementById("customize-view");
    customizeView.innerHTML = `
        <div class="customize-container">
            <h2 class="section-title">Personalize Your Studio</h2>
            <div class="settings-grid">
                <div class="setting-card">
                    <div class="setting-info">
                        <i data-lucide="moon"></i>
                        <div>
                            <h4>Dark Mode</h4>
                            <p>Toggle dark visual theme for the studio.</p>
                        </div>
                    </div>
                    <label class="switch">
                        <input type="checkbox" id="dark-mode-toggle">
                        <span class="slider round"></span>
                    </label>
                </div>
                <div class="setting-card">
                    <div class="setting-info">
                        <i data-lucide="layout-grid"></i>
                        <div>
                            <h4>Compact View</h4>
                            <p>Show more simulations on a single screen.</p>
                        </div>
                    </div>
                    <label class="switch">
                        <input type="checkbox">
                        <span class="slider round"></span>
                    </label>
                </div>
                <div class="setting-card">
                    <div class="setting-info">
                        <i data-lucide="bell"></i>
                        <div>
                            <h4>Notifications</h4>
                            <p>Get alerted when new simulations are released.</p>
                        </div>
                    </div>
                    <label class="switch">
                        <input type="checkbox" checked>
                        <span class="slider round"></span>
                    </label>
                </div>
            </div>
            
            <div class="favorites-section">
                <h3><i data-lucide="heart"></i> My Favorite Simulations</h3>
                <div class="favorites-placeholder">
                    <p>No favorites yet. Click the heart icon on any simulation to add it here!</p>
                </div>
            </div>
        </div>
    `;
    lucide.createIcons();

    // Dark mode toggle logic
    document.getElementById('dark-mode-toggle')?.addEventListener('change', (e) => {
        document.body.classList.toggle('dark-theme', e.target.checked);
    });
}

function renderBrowseView() {
    const browseView = document.getElementById("browse-view");

    // Featured Section
    const featured = simulations.find(s => s.badge === "Featured") || simulations[0];
    let content = `
        <div class="featured-banner">
            <div class="featured-info">
                <span class="badge-featured">FEATURED</span>
                <h1>${featured.title}</h1>
                <p>${featured.description}</p>
                <div class="featured-actions">
                    <button class="btn btn-primary" onclick="window.location.href='${featured.url}'">Play Now</button>
                    <button class="btn btn-outline"><i data-lucide="info"></i> Learn More</button>
                </div>
            </div>
            <div class="featured-visual">
                <img src="${featured.image}" alt="Featured Simulation">
            </div>
        </div>
        <h2 class="section-title">Explore by Subject</h2>
    `;

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
