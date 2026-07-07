
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
const engine = new GameEngine();
let serverTeamActions = {};
let serverReadyCount = 0;
let isSubmitting = false; // 防止雙重結算

async function syncStateToServer(clearActions = false) {
    let body = {game_state: engine.state};
    if (clearActions) body.clear_actions = true;
    await fetch('/csiecamp_game2/api/state', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
    }).catch(e => console.log(e));
}

async function pollServer() {
    await fetch('/csiecamp_game2/api/state')
        .then(res => res.json())
        .then(data => {
            if (data.team_actions) {
                serverTeamActions = data.team_actions;
            }
            if (data.ready_teams !== undefined) {
                serverReadyCount = data.ready_teams.length;
            }
            render(); // render() 負責重新套用按鈕鎖定
        })
        .catch(e => console.log(e));
}

setInterval(pollServer, 1000);

// Timer Tick
setInterval(() => {
    if (engine.state.phase === "ENCOUNTER_BID" && engine.state.timeLeft > 0 && !isSubmitting) {
        engine.state.timeLeft -= 1;
        syncStateToServer();
        render();
        
        if (engine.state.timeLeft <= 0) {
            doSubmit();
        }
    }
}, 1000);

document.addEventListener("DOMContentLoaded", () => {
    render();
    window.addEventListener("state_updated", () => { render(); syncStateToServer(); });
    syncStateToServer();
    
    const setupInputs = document.getElementById("setup-inputs");
    for (let i = 0; i < 10; i++) {
        setupInputs.innerHTML += `<div><label>小隊 ${i}</label><input type="text" class="form-input" name="team-${i}" value="第 ${i} 小隊"></div>`;
    }

    document.getElementById("setup-form").addEventListener("submit", async e => {
        e.preventDefault();
        // 雙重保險：即使按鈕被繞過（如 Enter 鍵），也必須所有小隊都準備好才能開始
        if (serverReadyCount < 10) {
            alert(`⚠️ 請等待所有小隊按下準備好了！\n目前 ${serverReadyCount}/10 小隊已準備。`);
            return;
        }
        const names = [];
        for (let i = 0; i < 10; i++) names.push(e.target.elements[`team-${i}`].value.trim());
        engine.initTeams(names);
        // Clear ready list after game starts so next reset works correctly
        await fetch('/csiecamp_game2/api/state', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ game_state: engine.state, clear_ready: true, clear_actions: true })
        }).catch(e => console.log(e));
    });

    document.getElementById("bid-form").addEventListener("submit", e => {
        e.preventDefault();
        doSubmit();
    });
});

async function doSubmit() {
    if (isSubmitting) return;
    isSubmitting = true;
    render(); // Show "結算中" immediately
    try {
        await engine.submitCards(serverTeamActions, async () => {
            await syncStateToServer(false);
            await sleep(1500);
        });
        await syncStateToServer(true);
        serverTeamActions = {};
    } finally {
        isSubmitting = false;
    }
    render();
}

function render() {
    const state = engine.state;
    
    const displayNum = state.encounterIndex - (state.extraEncounters || 0) + 1;
    document.querySelectorAll(".info-encounter").forEach(el => el.textContent = displayNum);

    document.getElementById("battle-logs-box").innerHTML = state.battleLogs.map(l => `<div class="log-entry">${l}</div>`).join("");

    document.getElementById("aside-teams-list").innerHTML = state.teams.map(t => `
        <div style="border-bottom:1px solid #ccc; padding:4px 0;">
            <strong>${t.name}</strong> (${t.status})
            <br>HP: <span style="color:red">${t.hp}</span> | 袋中: <span style="color:orange">${t.roundCoconuts}</span> | 家中椰子: ${t.totalCoconuts}
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
        // 每次渲染都重新套用鎖定——確保不受 pollServer 時序影響
        const statusText = document.getElementById("ready-status-text");
        const startBtn = document.getElementById("start-game-btn");
        if (serverReadyCount >= 10) {
            statusText.textContent = `所有小隊已準備完畢！ (10/10)`;
            statusText.style.color = "var(--success-green)";
            startBtn.style.opacity = "1";
            startBtn.style.pointerEvents = "auto";
            startBtn.disabled = false;
        } else {
            statusText.textContent = `正在等待所有小隊準備... (${serverReadyCount}/10)`;
            statusText.style.color = "var(--danger-red)";
            startBtn.style.opacity = "0.5";
            startBtn.style.pointerEvents = "none";
            startBtn.disabled = true; // 雙重保險：disabled 屬性也一起鎖
        }

    } else if (state.phase === "ENCOUNTER_BID") {
        if (isSubmitting) {
            // During resolution animation, don't show the bid form
            document.getElementById("phase-encounter-bid").style.display = "none";
        } else {
            renderBidPhase(state);
            document.getElementById("phase-encounter-bid").style.display = "block";
        }
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
        document.getElementById("bid-monster-cards").innerHTML = engine.getMonsterCards(m).map(c => {
            const desc = c.condition || c.desc;
            const tags = c.tags ? c.tags.map(t => `<span style="background:#fde047; color:#000; padding:2px 4px; border-radius:4px; font-size:0.8rem; margin-right:4px;">${t}</span>`).join('') : '';
            return `<div style="margin-bottom:0.5rem;"><strong>卡 ${c.id}:</strong> ${desc} <br>${tags}</div>`;
        }).join("");
    }

    const tbody = document.getElementById("bid-inputs-tbody");
    
    // Generate Target Options
    let targetOptions = `<option value="">(選擇目標)</option>`;
    state.teams.forEach(t => {
        targetOptions += `<option value="${t.id}">${t.name} (${t.status})</option>`;
    });

    const timerHtml = `<div style="font-size: 2rem; color: red; text-align: center; margin-bottom: 1rem;">倒數計時: ${state.timeLeft} 秒</div>`;
    
    tbody.innerHTML = `<tr><td colspan="2">${timerHtml}</td></tr>` + state.teams.map(t => {
        if (t.status !== "active") return `<tr style="opacity:0.5"><td>${t.name} (${t.status})</td><td>-</td></tr>`;
        
        const action = serverTeamActions[t.id];
        let statusHtml = "<span style='color:red;'>尚未選擇</span>";
        if (action && action.cardId) {
            statusHtml = `<span style='color:green;'>已選擇卡片 ${action.cardId}</span>`;
            if (action.targetId) statusHtml += ` (目標: 小隊${action.targetId})`;
        }
        
        return `
            <tr>
                <td><strong>${t.name}</strong> <br><small>HP: ${t.hp} | 袋中: ${t.roundCoconuts}</small></td>
                <td>${statusHtml}</td>
            </tr>
        `;
    }).join("");
}

window.toggleTarget = function(selectEl, monsterName) {
    const val = selectEl.value;
    const targetSelect = selectEl.parentElement.querySelector(".target-select");
    
    // 大祭司卡 4 或 海神卡 3 或 寶箱 2, 3 需要目標
    if ((monsterName === "枯朽椰骸大祭司" && val == "3") || 
                (monsterName === "椰子寶箱" && val == "2")) {
        targetSelect.style.display = "block";
        targetSelect.required = true;
        
        // 大祭司復活：只能選目前陣亡的隊伍 (非 active)
        if (monsterName === "枯朽椰骸大祭司" && val == "3") {
            Array.from(targetSelect.options).forEach(opt => {
                if (opt.value === "") return;
                if (opt.textContent.includes("(active)")) {
                    opt.disabled = true;
                    opt.style.display = "none";
                } else {
                    opt.disabled = false;
                    opt.style.display = "block";
                }
            });
            if (targetSelect.selectedOptions[0] && targetSelect.selectedOptions[0].disabled) {
                targetSelect.value = "";
            }
        } else {
            // 其他需要目標的技能，開放所有隊伍選項
            Array.from(targetSelect.options).forEach(opt => {
                opt.disabled = false;
                opt.style.display = "block";
            });
        }
    } else {
        targetSelect.style.display = "none";
        targetSelect.required = false;
    }
}

async function nextEncounter() {
    engine.nextEncounter();
    // Clear server-side team actions so teams can pick cards again
    await fetch('/csiecamp_game2/api/state', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ game_state: engine.state, clear_actions: true })
    }).catch(e => console.log(e));
    serverTeamActions = {};
    render();
}
function nextRound() { engine.nextRound(); }
async function resetGame() {
    if(confirm("確定重置?")) {
        engine.resetGame();
        await fetch('/csiecamp_game2/api/state', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ game_state: engine.state, clear_actions: true, clear_ready: true })
        }).catch(e => console.log(e));
        serverTeamActions = {};
    }
}
