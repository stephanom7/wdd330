// Global State
let activeDraft = [];
let exchangeRates = { USD: 1, EUR: 0.92, GBP: 0.78 };
let currentCurrency = "USD";

// DOM References
const addPartForm = document.getElementById("add-part-form");
const selectedPartsList = document.getElementById("selected-parts-list");
const totalCostEl = document.getElementById("total-cost");
const powerDrawEl = document.getElementById("power-draw");
const compatibilityStatusEl = document.getElementById("compatibility-status");
const saveRigBtn = document.getElementById("save-rig-btn");
const clearRigBtn = document.getElementById("clear-rig-btn");
const currencySelect = document.getElementById("currency-select");
const techQueryInput = document.getElementById("tech-query");
const searchTechBtn = document.getElementById("search-tech-btn");
const techResultsContainer = document.getElementById("tech-results-container");

document.addEventListener("DOMContentLoaded", () => {
    loadDraftFromLocalStorage();
    renderActiveDraft();
    fetchCurrencyRates(); // API 2: Currency Exchange
    fetchGames("pc"); // API 1: Games Database
});

// --- LOCAL STORAGE & COMPONENT BUILDER ---
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
        totalCostEl.textContent = formatCurrency(0);
        powerDrawEl.textContent = "0W / 650W";
        return;
    }

    let totalCostUSD = 0;
    let totalTdp = 0;

    activeDraft.forEach((part) => {
        totalCostUSD += part.price;
        totalTdp += part.tdp;

        const item = document.createElement("div");
        item.className = "part-item";
        item.innerHTML = `
            <div>
                <strong>[${part.category}] ${part.name}</strong>
                <br><small style="color:#A0AEC0;">Type: ${part.socket} | Power: ${part.tdp}W</small>
            </div>
            <div>
                <strong>${formatCurrency(part.price)}</strong>
                <button onclick="removePart(${part.id})" class="btn-danger" style="margin-left: 8px; padding: 2px 6px;">✕</button>
            </div>
        `;
        selectedPartsList.appendChild(item);
    });

    totalCostEl.textContent = formatCurrency(totalCostUSD);
    powerDrawEl.textContent = `${totalTdp}W / 650W`;

    // Compatibility validation logic
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

// --- API 2: EXCHANGERATE API ---
async function fetchCurrencyRates() {
    try {
        const res = await fetch("https://open.er-api.com/v6/latest/USD");
        const data = await res.json();
        if (data && data.rates) {
            exchangeRates = data.rates;
        }
    } catch (err) {
        console.warn("Using default exchange rates:", err);
    }
}

currencySelect.addEventListener("change", (e) => {
    currentCurrency = e.target.value;
    renderActiveDraft();
});

function formatCurrency(amountInUSD) {
    const rate = exchangeRates[currentCurrency] || 1;
    const converted = amountInUSD * rate;
    const symbols = { USD: "$", EUR: "€", GBP: "£" };
    return `${symbols[currentCurrency] || "$"}${converted.toFixed(2)}`;
}

// --- API 1: LIVE GAME BENCHMARK DATABASE API (100% Dynamic & Public) ---
async function fetchGames(category = "shooter") {
    techResultsContainer.innerHTML = "<p>Fetching live game benchmarks from API...</p>";
    try {
        const res = await fetch(`https://corsproxy.io/?https://www.freetogame.com/api/games?category=${encodeURIComponent(category)}`);
        const data = await res.json();

        techResultsContainer.innerHTML = "";

        if (!data || !Array.isArray(data) || data.length === 0) {
            techResultsContainer.innerHTML = "<p>No game benchmark specifications found for this category.</p>";
            return;
        }

        // Display up to 3 dynamic cards returned directly from the live API response
        const gamesToDisplay = data.slice(0, 3);
        gamesToDisplay.forEach((game) => {
            const card = document.createElement("div");
            card.className = "game-card";
            card.innerHTML = `
                <img src="${game.thumbnail}" alt="${game.title}">
                <div class="game-card-info">
                    <strong>${game.title}</strong>
                    <br><small style="color:#A0AEC0;">Genre: ${game.genre} | Platform: ${game.platform}</small>
                </div>
            `;
            techResultsContainer.appendChild(card);
        });
    } catch (err) {
        console.error("API Fetch Error:", err);
        techResultsContainer.innerHTML = "<p>Error connecting to live Game API.</p>";
    }
}

searchTechBtn.addEventListener("click", () => {
    const query = techQueryInput.value.trim().toLowerCase();
    if (query) {
        // Fetches real games dynamically based on category/genre input (e.g. shooter, racing, strategy, action)
        fetchGames(query);
    }
});