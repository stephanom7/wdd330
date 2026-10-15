const RAWG_API_KEY = "c5322550a26d48e0a27f7db7962d7729";

// State
let activeDraft = [];

// DOM References
const addPartForm = document.getElementById("add-part-form");
const selectedPartsList = document.getElementById("selected-parts-list");
const totalCostEl = document.getElementById("total-cost");
const powerDrawEl = document.getElementById("power-draw");
const headerTotalEl = document.getElementById("header-total");
const compatibilityStatusEl = document.getElementById("compatibility-status");
const saveRigBtn = document.getElementById("save-rig-btn");
const clearRigBtn = document.getElementById("clear-rig-btn");
const gameQueryInput = document.getElementById("game-query");
const searchGameBtn = document.getElementById("search-game-btn");
const gameResultsContainer = document.getElementById("game-results-container");

document.addEventListener("DOMContentLoaded", () => {
    loadDraftFromLocalStorage();
    renderActiveDraft();
    fetchDefaultGame();
});

// Add Component Event
addPartForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const category = document.getElementById("part-category").value;
    const name = document.getElementById("part-name").value;
    const socket = document.getElementById("part-socket").value;
    const price = parseFloat(document.getElementById("part-price").value);
    const tdp = parseInt(document.getElementById("part-tdp").value);

    const newPart = {
        id: Date.now(),
        category,
        name,
        socket,
        price,
        tdp
    };

    activeDraft.push(newPart);
    renderActiveDraft();
    addPartForm.reset();
});

function renderActiveDraft() {
    selectedPartsList.innerHTML = "";

    if (activeDraft.length === 0) {
        selectedPartsList.innerHTML = `<p class="empty-msg">No hardware parts added to active draft.</p>`;
        totalCostEl.textContent = "$0.00";
        powerDrawEl.textContent = "0W / 650W";
        headerTotalEl.textContent = "$0.00";
        return;
    }

    let totalCost = 0;
    let totalTdp = 0;

    activeDraft.forEach((part) => {
        totalCost += part.price;
        totalTdp += part.tdp;

        const item = document.createElement("div");
        item.className = "part-item";
        item.innerHTML = `
            <div>
                <strong>[${part.category}] ${part.name}</strong>
                <br><small style="color:#A0AEC0;">Type: ${part.socket} | Power: ${part.tdp}W</small>
            </div>
            <div>
                <strong>$${part.price.toFixed(2)}</strong>
                <button onclick="removePart(${part.id})" class="btn-danger" style="margin-left: 8px; padding: 2px 6px;">✕</button>
            </div>
        `;
        selectedPartsList.appendChild(item);
    });

    totalCostEl.textContent = `$${totalCost.toFixed(2)}`;
    headerTotalEl.textContent = `$${totalCost.toFixed(2)}`;
    powerDrawEl.textContent = `${totalTdp}W / 650W`;

    // Simple Compatibility Check Logic
    if (totalTdp > 650) {
        compatibilityStatusEl.className = "status-banner status-warn";
        compatibilityStatusEl.textContent = "⚠️ Warning: Total TDP exceeds recommended 650W PSU rating!";
    } else {
        compatibilityStatusEl.className = "status-banner status-ok";
        compatibilityStatusEl.textContent = "✔ Status: Component Compatibility & Power Draw OK";
    }
}

window.removePart = function(id) {
    activeDraft = activeDraft.filter((part) => part.id !== id);
    renderActiveDraft();
};

saveRigBtn.addEventListener("click", () => {
    localStorage.setItem("rigcraft_active_draft", JSON.stringify(activeDraft));
    alert("Draft saved to LocalStorage successfully!");
});

function loadDraftFromLocalStorage() {
    const saved = localStorage.getItem("rigcraft_active_draft");
    if (saved) {
        try {
            activeDraft = JSON.parse(saved);
        } catch (e) {
            console.error("Error parsing LocalStorage data", e);
        }
    }
}

clearRigBtn.addEventListener("click", () => {
    activeDraft = [];
    localStorage.removeItem("rigcraft_active_draft");
    renderActiveDraft();
});

// RAWG API Game Requirements Search
async function searchGames(query) {
    gameResultsContainer.innerHTML = "<p>Fetching game benchmarks...</p>";
    try {
        const res = await fetch(`https://api.rawg.io/api/games?key=${RAWG_API_KEY}&search=${encodeURIComponent(query)}&page_size=3`);
        const data = await res.json();

        gameResultsContainer.innerHTML = "";
        if (!data.results || data.results.length === 0) {
            gameResultsContainer.innerHTML = "<p>No games found.</p>";
            return;
        }

        data.results.forEach((game) => {
            const card = document.createElement("div");
            card.className = "game-card";
            card.innerHTML = `
                <img src="${game.background_image || 'https://via.placeholder.com/200x110'}" alt="${game.name}">
                <div class="game-card-info">
                    <strong>${game.name}</strong>
                    <br><small style="color:#A0AEC0;">Rating: ⭐ ${game.rating}</small>
                </div>
            `;
            gameResultsContainer.appendChild(card);
        });
    } catch (err) {
        console.error("API Fetch Error:", err);
        gameResultsContainer.innerHTML = "<p>Error loading game API data.</p>";
    }
}

function fetchDefaultGame() {
    searchGames("Cyberpunk 2077");
}

searchGameBtn.addEventListener("click", () => {
    const query = gameQueryInput.value.trim();
    if (query) {
        searchGames(query);
    }
});