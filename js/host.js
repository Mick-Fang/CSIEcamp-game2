const engine = new GameEngine();
const projectorWindows = new Set();

function openProjector() {
    const win = window.open('projector.html', '_blank');
    if (win) {
        projectorWindows.add(win);
        setTimeout(() => win.postMessage({ type: 'COCONUT_STATE_UPDATE', state: engine.state }, '*'), 500);
    }
}

function broadcastMessage(msg) {
    projectorWindows.forEach(win => {
        if (win.closed) projectorWindows.delete(win);
        else win.postMessage(msg, '*');
    });
}

window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'COCONUT_REQUEST_STATE') {
        projectorWindows.add(event.source);
        event.source.postMessage({ type: 'COCONUT_STATE_UPDATE', state: engine.state }, '*');
    }
});

document.addEventListener("DOMContentLoaded", () => {
    render();
    window.addEventListener("storage", (e) => { if (e.key === "coconut_game2_state") { engine.loadState(); render(); } });
    window.addEventListener("state_updated", () => { render(); broadcastMessage({ type: 'COCONUT_STATE_UPDATE', state: engine.state }); });
    
    const setupInputs = document.getElementById("setup-inputs");
    for (let i = 1; i <= 10; i++) {
        setupInputs.innerHTML += `<div><label>小隊 ${i}</label><input type="text" class="form-input" name="team-${i}" value="第 ${i} 小隊"></div>`;
    }

    document.getElementById("setup-form").addEventListener("submit", e => {
        e.preventDefault();
        const names = [];
        for (let i = 1; i <= 10; i++) names.push(e.target.elements[`team-${i}`].value.trim());
        engine.initTeams(names);
    });

    document.getElementById("bid-form").addEventListener("submit", e => {
        e.preventDefault();
        const bids = {};
        document.querySelectorAll(".card-select-group").forEach(group => {
            const teamId = group.dataset.teamId;
            const cardSelect = group.querySelector(".card-select");
            const targetSelect = group.querySelector(".target-select");
            
            bids[teamId] = {
                cardId: cardSelect.value,
                targetId: targetSelect.style.display !== "none" ? targetSelect.value : null
            };
        });
        engine.submitCards(bids);
    });
});

function render() {
    const state = engine.state;
    
    document.querySelectorAll(".info-round").forEach(el => el.textContent = state.roundNum);
    document.querySelectorAll(".info-encounter").forEach(el => el.textContent = state.encounterIndex + 1);

    document.getElementById("battle-logs-box").innerHTML = state.battleLogs.map(l => `<div class="log-entry">${l}</div>`).join("");

    document.getElementById("aside-teams-list").innerHTML = state.teams.map(t => `
        <div style="border-bottom:1px solid #ccc; padding:4px 0;">
            <strong>${t.name}</strong> (${t.status})
            <br>HP: <span style="color:red">${t.hp}</span> | 袋中: <span style="color:orange">${t.roundCoconuts}</span> | 總資產: ${t.totalCoconuts}
        </div>
    `).join("");

    document.getElementById("override-container").innerHTML = state.teams.map(t => `
        <div style="border:1px solid #aaa; padding:5px; font-size:0.8rem;">
            <strong>${t.name}</strong><br>
            HP: <button onclick="engine.overrideStats(${t.id}, 10, 0)">+10</button> <button onclick="engine.overrideStats(${t.id}, -10, 0)">-10</button><br>
            總椰子: <button onclick="engine.overrideStats(${t.id}, 0, 1)">+1</button> <button onclick="engine.overrideStats(${t.id}, 0, -1)">-1</button>
        </div>
    `).join("");

    ["phase-setup", "phase-encounter-bid", "phase-encounter-result", "phase-round-end"].forEach(id => {
        document.getElementById(id).style.display = "none";
    });

    if (state.phase === "SETUP") {
        document.getElementById("phase-setup").style.display = "block";
    } else if (state.phase === "ENCOUNTER_BID") {
        renderBidPhase(state);
        document.getElementById("phase-encounter-bid").style.display = "block";
    } else if (state.phase === "ENCOUNTER_RESULT") {
        document.getElementById("result-list").innerHTML = state.teams
            .filter(t => t.selectedCardId)
            .map(t => {
                let targetText = t.selectedTargetId ? ` [目標: 小隊${t.selectedTargetId}]` : "";
                return `<li><strong>${t.name}</strong> (卡${t.selectedCardId}${targetText}): ${t.lastActionLog}</li>`;
            })
            .join("");
        document.getElementById("phase-encounter-result").style.display = "block";
    } else if (state.phase === "ROUND_END") {
        document.getElementById("phase-round-end").style.display = "block";
    }
}

function renderBidPhase(state) {
    const m = engine.getCurrentMonster();
    if (m) {
        document.getElementById("bid-monster-name").textContent = m.name;
        document.getElementById("bid-monster-cards").innerHTML = m.cards.map(c => 
            `<div style="margin-bottom:0.5rem;"><strong>卡 ${c.id}:</strong> ${c.desc}</div>`
        ).join("");
    }

    const tbody = document.getElementById("bid-inputs-tbody");
    
    // Generate Target Options
    let targetOptions = `<option value="">(選擇目標)</option>`;
    state.teams.forEach(t => {
        targetOptions += `<option value="${t.id}">${t.name} (${t.status})</option>`;
    });

    tbody.innerHTML = state.teams.map(t => {
        if (t.status !== "active") return `<tr style="opacity:0.5"><td>${t.name} (${t.status})</td><td>-</td></tr>`;
        return `
            <tr>
                <td><strong>${t.name}</strong> <br><small>HP: ${t.hp} | 袋中: ${t.roundCoconuts}</small></td>
                <td>
                    <div class="card-select-group" data-team-id="${t.id}" style="display:flex; gap:0.5rem;">
                        <select class="card-select form-input" onchange="toggleTarget(this, '${m.name}')">
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                        </select>
                        <select class="target-select form-input" style="display:none;">
                            ${targetOptions}
                        </select>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

window.toggleTarget = function(selectEl, monsterName) {
    const val = selectEl.value;
    const targetSelect = selectEl.parentElement.querySelector(".target-select");
    
    // 大祭司卡 4 或 海神卡 3 或 寶箱怪 2, 3 需要目標
    if ((monsterName === "枯朽椰骸大祭司" && val == "4") || 
        (monsterName === "海溝腐椰海神" && val == "3") ||
        (monsterName === "椰子寶箱怪" && (val == "2" || val == "3"))) {
        targetSelect.style.display = "block";
        targetSelect.required = true;
    } else {
        targetSelect.style.display = "none";
        targetSelect.required = false;
    }
}

function nextEncounter() { engine.nextEncounter(); }
function nextRound() { engine.nextRound(); }
function resetGame() { if(confirm("確定重置?")) engine.resetGame(); }
