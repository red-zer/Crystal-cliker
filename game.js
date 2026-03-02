const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let score = 0;
let clickPower = 1;
let productionMultiplier = 1;
let buldingsToShow = [];
let lastUpdate = Date.now();
let buyAmount = 1;
let buildingCount = 0;

let activeDrill = 0;
let drillProgress = 0;
let drillSpeed = 0.05;
let sparks = [];
let floatingTexts = [];
let ringStates = [];
let clickOrbitBoost = 0;
let orbitAngle = 0;

/* =======================
   CRYSTAL
======================= */
const crystal = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 110,
    scale: 1
};

/* =======================
   BUILDINGS
======================= */
const buildings = [
    { name: "Nano Drill", baseCost: 15, amount: 0, cps: 0.1, assets: "/assets/towers/nanoDrill.png", show: new Image() },
    { name: "Mining Drone", baseCost: 100, amount: 0, cps: 1, assets: "/assets/towers/miningDrone.png" },
    { name: "Quantum Extractor", baseCost: 1100, amount: 0, cps: 8, assets: "/assets/towers/quantumExtractor.jpg" },
    { name: "Crystel cave", baseCost: 12000, amount: 0, cps: 20, assets: "/assets/towers/crystalCave.jpg" },
    { name: "Plasma Harvester", baseCost: 75000, amount: 0, cps: 75, assets: "/assets/towers/plasmaHarvester.png" },
    { name: "Asteroid Miner", baseCost: 250000, amount: 0, cps: 220, assets: "/assets/towers/asteroidMiner.png" },
    { name: "Crystal Reactor", baseCost: 1000000, amount: 0, cps: 850, assets: "/assets/towers/crystalReactor.png" },
    { name: "Void Extractor", baseCost: 5000000, amount: 0, cps: 3200, assets: "/assets/towers/voidExtractor.png" },
    { name: "Galactic Refinery", baseCost: 20000000, amount: 0, cps: 12000, assets: "/assets/towers/galacticRefinery.png" },
    { name: "Dark Matter Synthesizer", baseCost: 100000000, amount: 0, cps: 45000, assets: "/assets/towers/darkMatterSynthesizer.png" },
    { name: "Stellar Core Tapper", baseCost: 750000000, amount: 0, cps: 150000, assets: "/assets/towers/stellarCoreTapper.png" },
    { name: "Interdimensional Forge", baseCost: 5000000000, amount: 0, cps: 600000, assets: "/assets/towers/interdimensionalForge.jpg" },
    { name: "Crystal Singularity", baseCost: 25000000000, amount: 0, cps: 2500000, assets: "/assets/towers/crystalSingularity.png" },
    { name: "Empire Nexus", baseCost: 100000000000, amount: 0, cps: 10000000, assets: "/assets/towers/empireNexus.jpg" }
];

function getCost(b) {
    return Math.floor(b.baseCost * Math.pow(1.15, b.amount));
}

function totalCPS() {
    return buildings.reduce((sum, b) => sum + b.amount * b.cps, 0) * productionMultiplier;
}

buildings[0].show.src = "/assets/towers/nanoDrill.png";

/* =======================
   SPECIAL UPGRADES
======================= */
const specialUpgrades = [

    { name: "Drill Overclock", desc: "Nano Drill production x2", cost: 500, buildingIndex: 0, required: 10, bought: false, effect: () => buildings[0].cps *= 2 },
    { name: "Nano Drill Efficiency", desc: "Nano Drill production x2", cost: 5000, buildingIndex: 0, required: 25, bought: false, effect: () => buildings[0].cps *= 2 },
    { name: "Industrial Drill Network", desc: "Nano Drill production x3", cost: 25000, buildingIndex: 0, required: 50, bought: false, effect: () => buildings[0].cps *= 3 },
    { name: "Planetary Drill Grid", desc: "Nano Drill production x5", cost: 5000000, buildingIndex: 0, required: 100, bought: false, effect: () => buildings[0].cps *= 5 },
    { name: "Subatomic Drill Collapse", desc: "Nano Drill production x10", cost: 500000000, buildingIndex: 0, required: 250, bought: false, effect: () => buildings[0].cps *= 10 },

    { name: "Drone AI Matrix", desc: "Mining Drone production x2", cost: 2000, buildingIndex: 1, required: 10, bought: false, effect: () => buildings[1].cps *= 2 },
    { name: "Autonomous Drone Fleet", desc: "Mining Drone production x2", cost: 10000, buildingIndex: 1, required: 25, bought: false, effect: () => buildings[1].cps *= 2 },
    { name: "Drone Swarm Protocol", desc: "Mining Drone production x3", cost: 75000, buildingIndex: 1, required: 50, bought: false, effect: () => buildings[1].cps *= 3 },
    { name: "Interplanetary Drone Network", desc: "Mining Drone production x5", cost: 15000000, buildingIndex: 1, required: 100, bought: false, effect: () => buildings[1].cps *= 5 },
    { name: "Quantum Drone Singularity", desc: "Mining Drone production x10", cost: 1500000000, buildingIndex: 1, required: 250, bought: false, effect: () => buildings[1].cps *= 10 },

    { name: "Quantum Stabilizers", desc: "Quantum Extractor production x2", cost: 150000, buildingIndex: 2, required: 25, bought: false, effect: () => buildings[2].cps *= 2 },
    { name: "Quantum Singularity Core", desc: "Quantum Extractor production x3", cost: 750000, buildingIndex: 2, required: 75, bought: false, effect: () => buildings[2].cps *= 3 },
    { name: "Dimensional Quantum Collapse", desc: "Quantum Extractor production x6", cost: 50000000, buildingIndex: 2, required: 150, bought: false, effect: () => buildings[2].cps *= 6 },
    { name: "Infinite Quantum Loop", desc: "Quantum Extractor production x12", cost: 5000000000, buildingIndex: 2, required: 300, bought: false, effect: () => buildings[2].cps *= 12 },

    { name: "Deep Crystal Expansion", desc: "Crystal Cave production x2", cost: 500000, buildingIndex: 3, required: 25, bought: false, effect: () => buildings[3].cps *= 2 },
    { name: "Ancient Crystal Awakening", desc: "Crystal Cave production x4", cost: 2500000, buildingIndex: 3, required: 75, bought: false, effect: () => buildings[3].cps *= 4 },
    { name: "Crystal Core Resonance", desc: "Crystal Cave production x8", cost: 250000000, buildingIndex: 3, required: 200, bought: false, effect: () => buildings[3].cps *= 8 },
    { name: "Primordial Crystal God", desc: "Crystal Cave production x15", cost: 25000000000, buildingIndex: 3, required: 400, bought: false, effect: () => buildings[3].cps *= 15 },

    { name: "Reactor Core Overdrive", desc: "Crystal Reactor production x3", cost: 50000000, buildingIndex: 6, required: 50, bought: false, effect: () => buildings[6].cps *= 3 },
    { name: "Reactor Singularity Chain", desc: "Crystal Reactor production x7", cost: 5000000000, buildingIndex: 6, required: 200, bought: false, effect: () => buildings[6].cps *= 7 },

    { name: "Void Energy Compression", desc: "Void Extractor production x3", cost: 250000000, buildingIndex: 7, required: 50, bought: false, effect: () => buildings[7].cps *= 3 },
    { name: "Void Collapse Reactor", desc: "Void Extractor production x9", cost: 25000000000, buildingIndex: 7, required: 250, bought: false, effect: () => buildings[7].cps *= 9 },

    // ===== SYNERGIE =====
    { name: "Drill-Drone Link", desc: "Each Nano Drill boosts Mining Drones by 1%", cost: 1000000, buildingIndex: 0, required: 100, bought: false, effect: () => buildings[1].cps *= (1 + buildings[0].amount * 0.01) },
    { name: "Drone-Quantum Interface", desc: "Each Mining Drone boosts Quantum Extractors by 0.5%", cost: 5000000, buildingIndex: 1, required: 100, bought: false, effect: () => buildings[2].cps *= (1 + buildings[1].amount * 0.005) },
    { name: "Crystal Resonance Network", desc: "Each Crystal Cave boosts all buildings by 0.3%", cost: 50000000, buildingIndex: 3, required: 150, bought: false, effect: () => buildings.forEach(b => b.cps *= (1 + buildings[3].amount * 0.003)) },
    { name: "Reactor Feedback Loop", desc: "Crystal Reactors boost Void Extractors by 2% each", cost: 1000000000, buildingIndex: 6, required: 150, bought: false, effect: () => buildings[7].cps *= (1 + buildings[6].amount * 0.02) },
    {
        name: "Empire Neural Grid", desc: "Total buildings owned boost ALL production by 0.2% each", cost: 50000000000, buildingIndex: 2, required: 200, bought: false, effect: () => {
            const total = buildings.reduce((sum, b) => sum + b.amount, 0);
            buildings.forEach(b => b.cps *= (1 + total * 0.002));
        }
    }

];

/* =======================
   ONE-TIME UPGRADES
======================= */
const oneTimeUpgrades = [
    { name: "Reinforced Pickaxe", desc: "Click power x2", cost: 500, bought: false, effect: () => clickPower *= 2 },
    { name: "Advanced Drill Protocols", desc: "All Nano Drills produce x2", cost: 2000, bought: false, effect: () => buildings[0].cps *= 2 },
    { name: "Drone AI Upgrade", desc: "All Mining Drones produce x2", cost: 5000, bought: false, effect: () => buildings[1].cps *= 2 },

    // ===== Early Game =====
    { name: "Quantum Optimization", desc: "Quantum Extractors produce x2", cost: 15000, bought: false, effect: () => buildings[2].cps *= 2 },
    { name: "Crystal Expansion", desc: "Crystal Caves produce x2", cost: 50000, bought: false, effect: () => buildings[3].cps *= 2 },
    { name: "Efficient Wiring", desc: "All buildings produce +10%", cost: 75000, bought: false, effect: () => buildings.forEach(b => b.cps *= 1.1) },

    // ===== Mid Game =====
    { name: "Plasma Compression", desc: "Plasma Harvesters produce x2", cost: 250000, bought: false, effect: () => buildings[4].cps *= 2 },
    { name: "Asteroid Scanning Tech", desc: "Asteroid Miners produce x2", cost: 750000, bought: false, effect: () => buildings[5].cps *= 2 },
    { name: "Reactor Stabilization", desc: "Crystal Reactors produce x2", cost: 2000000, bought: false, effect: () => buildings[6].cps *= 2 },
    { name: "Void Amplification", desc: "Void Extractors produce x2", cost: 10000000, bought: false, effect: () => buildings[7].cps *= 2 },

    // ===== Global Boosts =====
    { name: "Empire Infrastructure", desc: "All buildings produce x1.25", cost: 5000000, bought: false, effect: () => buildings.forEach(b => b.cps *= 1.25) },
    { name: "Hyper Efficiency", desc: "All production x1.5", cost: 25000000, bought: false, effect: () => buildings.forEach(b => b.cps *= 1.5) },
    { name: "Galactic Supply Chain", desc: "All production +100%", cost: 100000000, bought: false, effect: () => buildings.forEach(b => b.cps *= 2) },

    // ===== Scaling Upgrades =====
    {
        name: "Mass Production Protocol", desc: "Gain +1% CPS per building owned", cost: 5000000, bought: false, effect: () => {
            const total = buildings.reduce((sum, b) => sum + b.amount, 0);
            buildings.forEach(b => b.cps *= (1 + total * 0.01));
        }
    },

    {
        name: "Crystal Synergy", desc: "Each Nano Drill boosts all buildings by 0.5%", cost: 3000000, bought: false, effect: () => {
            const boost = buildings[0].amount * 0.005;
            buildings.forEach(b => b.cps *= (1 + boost));
        }
    },

    // ===== Click + Passive Combo =====
    { name: "Overcharged Clicks", desc: "Click power x3", cost: 1000000, bought: false, effect: () => clickPower *= 3 },
    {
        name: "Automated Clicking System", desc: "Gain 10% of click power per second", cost: 2000000, bought: false, effect: () => {
            setInterval(() => {
                score += clickPower * 0.1;
            }, 1000);
        }
    },

    // ===== Late Game =====
    { name: "Dark Matter Infusion", desc: "Dark Matter Synthesizers produce x2", cost: 500000000, bought: false, effect: () => buildings[9].cps *= 2 },
    { name: "Stellar Overdrive", desc: "Stellar Core Tappers produce x2", cost: 2000000000, bought: false, effect: () => buildings[10].cps *= 2 },
    { name: "Forge Mastery", desc: "Interdimensional Forges produce x2", cost: 10000000000, bought: false, effect: () => buildings[11].cps *= 2 },
    { name: "Singularity Awakening", desc: "Crystal Singularity produces x3", cost: 50000000000, bought: false, effect: () => buildings[12].cps *= 3 },
    { name: "Empire Ascension", desc: "ALL production x3", cost: 250000000000, bought: false, effect: () => buildings.forEach(b => b.cps *= 3) }
];

function showOneTimeUpgrades() {
    for (let i = 0; i < 3; i++) {
        const elem = document.getElementById(`timeUpgrade${i}`)
        elem.className = "upgradeItemVisible"
    }
}

/* =======================
   FORMAT
======================= */
function formatNumber(num) {
    if (num >= 1e12) return (num / 1e12).toFixed(1) + "T";
    if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
    return Math.floor(num);
}

/* =======================
   BUY AMOUNT
======================= */
function setBuyAmount(amount) {
    buyAmount = amount;
    updateUI();
}

/* =======================
   BUY BUILDING
======================= */
function buyBuilding(i) {
    const b = buildings[i];
    let bought = 0;
    for (let j = 0; j < buyAmount; j++) {
        const cost = getCost(b);
        if (score >= cost) {
            score -= cost;
            b.amount++;
            bought++;
        } else break;
    }
    if (bought > 0) updateUI();
}

/* =======================
   BUY SPECIAL UPGRADE
======================= */
function buySpecialUpgrade(u) {
    if (score >= u.cost && !u.bought) {
        score -= u.cost;
        u.bought = true;
        u.effect();
        updateUI();
    }
}

/* =======================
   BUY ONE-TIME UPGRADE
======================= */
function buyOneTimeUpgrade(u) {
    if (score >= u.cost && !u.bought) {
        score -= u.cost;
        u.bought = true;
        u.effect();
        updateUI();
    }
}

/* =======================
   UI
======================= */
function updateUI() {
    document.getElementById("score").innerText = formatNumber(score) + " Crystals";
    document.getElementById("perSecond").innerText = formatNumber(totalCPS()) + " / sec";

    const shop = document.getElementById("shop");
    shop.innerHTML = "";

    // ONE-TIME UPGRADES
    const availableUpgrades = oneTimeUpgrades.filter(u => !u.bought);
    if (availableUpgrades.length > 0) {
        const title = document.createElement("div");
        title.className = "sectionTitle";
        title.innerText = "UPGRADES";
        shop.appendChild(title);
        let count = 0
        availableUpgrades.forEach(u => {
            const div = document.createElement("div");
            div.id = `timeUpgrade${count}`
            div.className = "upgradeItemHidden";
            if (score >= u.cost) div.classList.add("affordable");
            div.innerHTML = `⭐ <b>${u.name}</b><br>${u.desc}<br>Cost: ${formatNumber(u.cost)}`;
            if (score >= u.cost) div.onclick = () => buyOneTimeUpgrade(u);
            shop.appendChild(div);
            count++
        });
    }

    // SPECIAL UPGRADES
    const unlockedSpecials = specialUpgrades.filter(u => !u.bought && buildings[u.buildingIndex].amount >= u.required);
    if (unlockedSpecials.length > 0) {
        const title = document.createElement("div");
        title.className = "sectionTitle";
        title.innerText = "SPECIAL UPGRADES";
        shop.appendChild(title);

        unlockedSpecials.forEach(u => {
            const div = document.createElement("div");
            div.className = "upgradeItemVisible";
            if (score >= u.cost) div.classList.add("affordable");
            div.innerHTML = `⭐ <b>${u.name}</b><br>${u.desc}<br>Cost: ${formatNumber(u.cost)}`;
            if (score >= u.cost) div.onclick = () => buySpecialUpgrade(u);
            shop.appendChild(div);
        });
    }

    // BUILDINGS
// BUILDINGS
const bTitle = document.createElement("div");
bTitle.className = "sectionTitle";
bTitle.innerText = "BUILDINGS";
shop.appendChild(bTitle);

buildings.forEach((b, i) => {
    const cost = getCost(b);
    const elem = document.createElement("div");
    elem.className = "shopRow";

    // Budynek jest już kupiony lub osiągalny -> pokazujemy
    if (b.amount > 0 || score >= cost * 0.9 || buldingsToShow.includes(i)) {
        elem.style.display = "flex"; // pokaż
        if (!buldingsToShow.includes(i)) buldingsToShow.push(i);

        // Podświetlenie tylko jeśli możesz teraz kupić
        if (score >= cost) elem.classList.add("affordable");
    } else {
        elem.style.display = "none"; // nadal ukryty
    }

    elem.id = `building${i}`;
    elem.innerHTML = `<div><img class="shopIMG" src="${b.assets}"> ${b.name}</div><div>${b.amount}</div><div>${formatNumber(cost)}</div>`;

    if (score >= cost) elem.onclick = () => buyBuilding(i);
    shop.appendChild(elem);
});
    saveGame();
}

/* =======================
   SAVE / LOAD
======================= */
function saveGame() {
    localStorage.setItem("crystalSave", JSON.stringify({
        score, buildings, specialUpgrades, oneTimeUpgrades, clickPower
    }));
}

function loadGame() {
    const save = JSON.parse(localStorage.getItem("crystalSave"));
    if (!save) return;
    score = save.score;
    clickPower = save.clickPower
    save.buildings.forEach((b, i) => buildings[i].amount = b.amount);
    save.specialUpgrades.forEach((u, i) => specialUpgrades[i].bought = u.bought);
    save.oneTimeUpgrades.forEach((u, i) => oneTimeUpgrades[i].bought = u.bought);
}

document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveGame();
    }
});

/* =======================
   CRYSTAL DRAW
======================= */
function drawCrystal() {
    ctx.save();
    ctx.translate(crystal.x, crystal.y);
    ctx.scale(crystal.scale, crystal.scale);

    ctx.shadowBlur = 20;
    ctx.shadowColor = "#00eaff";

    ctx.beginPath();
    ctx.moveTo(0, -crystal.size);
    ctx.lineTo(crystal.size * 0.6, -crystal.size * 0.3);
    ctx.lineTo(crystal.size * 0.4, crystal.size * 0.8);
    ctx.lineTo(-crystal.size * 0.4, crystal.size * 0.8);
    ctx.lineTo(-crystal.size * 0.6, -crystal.size * 0.3);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, -crystal.size, 0, crystal.size);
    gradient.addColorStop(0, "#a0f0ff");
    gradient.addColorStop(1, "#0066aa");

    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore();
}

/* =======================
   ORBITING NANOS
======================= */
function drawOrbitingDrills() {
    const nano = buildings[0].amount;
    if (nano <= 0) return;

    const glowRadius = crystal.size + 50 + Math.sin(Date.now() / 500) * 10;
    const glowGradient = ctx.createRadialGradient(
        crystal.x, crystal.y, crystal.size,
        crystal.x, crystal.y, glowRadius
    );

    glowGradient.addColorStop(0, "rgba(0,200,255,0.4)");
    glowGradient.addColorStop(1, "rgba(0,200,255,0)");
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(crystal.x, crystal.y, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    let remaining = nano;
    let ring = 0;

    const baseCapacity = 50;
    const radiusStep = 40;
    const baseRotationSpeed = 0.01;

    while (remaining > 0) {
        const ringCapacity = baseCapacity + ring * 10;
        const drillsInRing = Math.min(remaining, ringCapacity);
        const radius = crystal.size + 40 + ring * radiusStep;
        if (
            crystal.x - radius < 0 ||
            crystal.x + radius > canvas.width ||
            crystal.y - radius < 0 ||
            crystal.y + radius > canvas.height
        ) break;
        if (!ringStates[ring]) {
            ringStates[ring] = { progress: 0, active: 0, angle: 0 };
        }
        let state = ringStates[ring];
        const rotationSpeed = baseRotationSpeed * (1 + ring * 0.3);
        state.angle += rotationSpeed;
        state.progress += drillSpeed;
        if (state.progress >= 1) {
            state.progress = 0;
            state.active = (state.active + 1) % drillsInRing;
        }
        for (let i = 0; i < drillsInRing; i++) {
            const baseAngle = state.angle + (i * (Math.PI * 2 / drillsInRing));
            let x = crystal.x + Math.cos(baseAngle) * radius;
            let y = crystal.y + Math.sin(baseAngle) * radius;

            if (i === state.active) {
                const drillOffset = Math.sin(state.progress * Math.PI) * 15;
                x += Math.cos(baseAngle) * drillOffset;
                y += Math.sin(baseAngle) * drillOffset;

                if (Math.random() < 0.5) {
                    sparks.push({
                        x: x,
                        y: y,
                        dx: (Math.random() - 0.5) * 2,
                        dy: (Math.random() - 0.5) * 2,
                        life: 20 + Math.random() * 20
                    });
                }
            }
            const dx = crystal.x - x;
            const dy = crystal.y - y;
            let rotation = Math.atan2(dy, dx) - Math.PI / 4;
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotation);
            ctx.drawImage(buildings[0].show, -12.5, -12.5, 25, 25);
            ctx.restore();
        }
        remaining -= drillsInRing;
        ring++;
    }
    // Sparks
    for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        ctx.fillStyle = `rgba(255,200,50,${s.life / 40})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
        ctx.fill();
        s.x += s.dx;
        s.y += s.dy;
        s.life -= 1;
        if (s.life <= 0) sparks.splice(i, 1);
    }
}

/* =======================
   FLOATING TEXT
======================= */
function drawFloatingTexts() {
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const t = floatingTexts[i];
        ctx.globalAlpha = t.alpha;
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 18px Arial";
        ctx.fillText("+" + formatNumber(t.value), t.x, t.y);
        t.y -= 1;
        t.alpha -= 0.02;
        if (t.alpha <= 0) floatingTexts.splice(i, 1);
    }
    ctx.globalAlpha = 1;
}

/* =======================
   CLICK
======================= */
canvas.addEventListener("click", (e) => {
    score += clickPower;
    floatingTexts.push({ x: e.offsetX, y: e.offsetY - 10, value: clickPower, alpha: 1 });
    crystal.scale = 0.9;
    setTimeout(() => crystal.scale = 1, 80);
    updateUI();
});

/* =======================
   GAME LOOPS
======================= */
function gameLoop() {
    const now = Date.now();
    lastUpdate = now;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCrystal();
    drawOrbitingDrills();
    drawFloatingTexts();
    requestAnimationFrame(gameLoop);
    showOneTimeUpgrades()
}
setInterval(() => {
    score += totalCPS();
    updateUI()
}, 1000);

/* =======================
   SPECIAL UPGRADES UI
======================= */
function updateSpecialUpgradesUI(shop) {
    const unlockedSpecials = specialUpgrades.filter(u =>
        !u.bought &&
        buildings[u.buildingIndex].amount >= u.required
    );

    if (unlockedSpecials.length > 0) {
        const title = document.createElement("div");
        title.className = "sectionTitle";
        title.innerText = "SPECIAL UPGRADES";
        shop.appendChild(title);

        unlockedSpecials.forEach(u => {
            const div = document.createElement("div");
            div.className = "upgradeItem";
            div.style.display = "flex";
            div.style.alignItems = "center";
            div.style.justifyContent = "space-between";
            div.style.padding = "8px";
            div.style.margin = "6px 0";
            div.style.borderRadius = "6px";
            div.style.cursor = "pointer";
            div.style.transition = "0.3s";

            // Błysk gdy dostępne
            if (score >= u.cost) div.classList.add("affordable");

            div.innerHTML = `
                <div style="display:flex; align-items:center;">
                    <span style="font-size:24px; margin-right:10px;">⭐</span>
                    <div>
                        <b>${u.name}</b><br>
                        <span style="font-size:12px; color:#444;">${u.desc}</span>
                    </div>
                </div>
                <div style="font-weight:bold; color:#222;">${formatNumber(u.cost)}</div>
            `;

            if (score >= u.cost) div.onclick = () => buySpecialUpgrade(u);

            shop.appendChild(div);
        });
    }
}
/* =======================
   INIT
======================= */
loadGame();
updateUI();
gameLoop();