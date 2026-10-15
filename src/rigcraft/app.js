// RAWG Public API Key
const RAWG_API_KEY = "c5322550a26d48e0a27f7db7962d7729";

// Application State
let build = [];

// DOM Elements
const form = document.getElementById("component-form");
const buildList = document.getElementById("build-list");
const totalPriceEl = document.getElementById("total-price");
const totalWattageEl = document.getElementById("total-wattage");
const recommendedPsuEl = document.getElementById("recommended-psu");
const saveBtn = document.getElementById("save-build-btn");
const clearBtn = document.getElementById("clear-build-btn");
const gameSearchInput = document.getElementById("game-search");
const searchGameBtn = document.getElementById("search-game-btn");
const gamesResults = document.getElementById("games-results");

// Initialize Application on DOM Load
document.addEventListener("DOMContentLoaded", () => {
    loadBuildFromLocalStorage();
    renderBuild();
    fetchDefaultGames();
});

// Event Listener: Add Component
form.addEventListener("submit", (e) => {
    e.preventDefault();

    const type = document.getElementById("comp-type").value;
    const name = document.getElementById("comp-name").value;
    const price = parseFloat(document.getElementById("comp-price").value);
    const wattage = parseInt(document.getElementById("comp-wattage").value);

    const item = {
        id: Date.now(),
        type,
        name,
        price,
        wattage
    };

    build.push(item);
    renderBuild();
    form.reset();
});

// Render Component List & Recalculate Statistics
function renderBuild() {
    buildList.innerHTML = "";

    if (build.length === 0) {
        buildList.innerHTML = `<p class="empty-msg">No components added to your build yet.</p>`;
        totalPriceEl.textContent = "$0.00";
        totalWattageEl.textContent = "0 W";
        recommendedPsuEl.textContent = "400 W";
        return;
    }

    let totalPrice = 0;
    let totalWattage = 0;

    build.forEach((item) => {
        totalPrice += item.price;
        totalWattage += item.wattage;

        const card = document.createElement("div");
        card.className = "item-card";
        card.innerHTML = `
            <div class="item-info">
                <strong>${item.name}</strong>
                <span>${item.type} | Power Draw: ${item.wattage}W</span>
            </div>
            <div>
                <strong>$${item.price.toFixed(2)}</strong>
                <button onclick="removeComponent(${item.id})" class="btn-danger" style="margin-left: 10px; padding: 4px 8px;">✕</button>
            </div>
        `;
        buildList.appendChild(card);
    });

    totalPriceEl.textContent = `$${totalPrice.toFixed(2)}`;
    totalWattageEl.textContent = `${totalWattage} W`;
    
    // Recommended PSU Calculation (Power Draw + 30% overhead)
    const recommendedPsu = Math.max(400, Math.ceil((totalWattage * 1.3) / 50) * 50);
    recommendedPsuEl.textContent = `${recommendedPsu} W`;
}

// Remove Single Component
window.removeComponent = function(id) {
    build = build.filter((item) => item.id !== id);
    renderBuild();
};

// Event Listener: Save to LocalStorage
saveBtn.addEventListener("click", () => {
    localStorage.setItem("rigcraft_build", JSON.stringify(build));
    alert("Configuration successfully saved to LocalStorage!");
});

// Load Data from LocalStorage
function loadBuildFromLocalStorage() {
    const saved = localStorage.getItem("rigcraft_build");
    if (saved) {
        try {
            build = JSON.parse(saved);
        } catch (err) {
            console.error("Failed to load from LocalStorage", err);
        }
    }
}

// Event Listener: Clear Build
clearBtn.addEventListener("click", () => {
    build = [];
    localStorage.removeItem("rigcraft_build");
    renderBuild();
});

// Fetch Data from External RAWG API
async function fetchGames(query = "action") {
    gamesResults.innerHTML = "<p>Loading data from RAWG API...</p>";
    try {
        const response = await fetch(`https://api.rawg.io/api/games?key=${RAWG_API_KEY}&search=${encodeURIComponent(query)}&page_size=4`);
        const data = await response.json();
        
        gamesResults.innerHTML = "";
        if (!data.results || data.results.length === 0) {
            gamesResults.innerHTML = "<p>No games found matching your search.</p>";
            return;
        }

        data.results.forEach((game) => {
            const gameCard = document.createElement("div");
            gameCard.className = "game-card";
            gameCard.innerHTML = `
                <img src="${game.background_image || 'https://via.placeholder.com/200x120'}" alt="${game.name}">
                <div class="game-card-body">
                    <h4>${game.name}</h4>
                    <p style="font-size: 0.75rem; color: #94a3b8;">Rating: ⭐ ${game.rating} / 5</p>
                </div>
            `;
            gamesResults.appendChild(gameCard);
        });
    } catch (error) {
        console.error("Error connecting to API:", error);
        gamesResults.innerHTML = "<p>Error loading game data.</p>";
    }
}

function fetchDefaultGames() {
    fetchGames("cyberpunk");
}

searchGameBtn.addEventListener("click", () => {
    const query = gameSearchInput.value.trim();
    if (query) {
        fetchGames(query);
    }
});