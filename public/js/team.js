const engine = new GameEngine();
let teamId = parseInt(window.location.pathname.split('/').pop()) || 1;
if (isNaN(teamId) || teamId < 1 || teamId > 10) teamId = 1;

let currentSelectedCardId = null;
let currentMonster = null;
let hasSubmitted = false;
let myTeamData = null;

let lastEncounterIndex = -1;

function pollServer() {
    fetch('/api/state')
        .then(res => res.json())
        .then(data => {
            if (data.game_state && Object.keys(data.game_state).length > 0) {
                engine.state = data.game_state;
                
                const currentIdx = engine.state.encounterIndex;
                const myAction = data.team_actions && data.team_actions[teamId];

                if (engine.state.phase !== "ENCOUNTER_BID") {
                    hasSubmitted = false;
                } else if (currentIdx !== lastEncounterIndex) {
                    lastEncounterIndex = currentIdx;
                    hasSubmitted = false;
                } else if (myAction) {
                    hasSubmitted = true;
                }

                render();
            }
        })
        .catch(e => console.log(e));
}

setInterval(pollServer, 1000);

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("display-team-id").textContent = teamId;
    
    document.getElementById("login-btn").addEventListener("click", () => {
        const pwd = document.getElementById("team-password").value;
        if (pwd === String(teamId)) {
            document.getElementById("login-view").style.display = "none";
        } else {
            document.getElementById("login-error").style.display = "block";
        }
    });

    document.getElementById("team-password").addEventListener("keypress", (e) => {
        if (e.key === "Enter") document.getElementById("login-btn").click();
    });

    pollServer();

    document.getElementById("ready-btn").addEventListener("click", () => {
        document.getElementById("ready-btn").textContent = "已準備！";
        document.getElementById("ready-btn").style.opacity = "0.7";
        document.getElementById("ready-btn").style.pointerEvents = "none";
        
        fetch('/api/ready', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teamId: teamId })
        }).catch(e => console.log(e));
    });

    document.getElementById("submit-btn").addEventListener("click", () => {
        if (!currentSelectedCardId) return;
        
        let targetId = null;
        const targetSelect = document.getElementById("target-select");
        if (targetSelect.parentElement.style.display !== "none") {
            targetId = targetSelect.value;
            if (!targetId) {
                alert("請選擇目標！");
                return;
            }
        }

        hasSubmitted = true;
        render();

        fetch('/api/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                teamId: teamId,
                cardId: currentSelectedCardId,
                targetId: targetId
            })
        }).catch(e => console.log(e));
    });
});

window.selectCard = function(cardId) {
    if (hasSubmitted) return;
    currentSelectedCardId = cardId;
    
    document.querySelectorAll(".card-box").forEach(el => {
        if (parseInt(el.dataset.cardId) === cardId) {
            el.classList.add("selected");
        } else {
            el.classList.remove("selected");
        }
    });

    const targetSelection = document.getElementById("target-selection");
    if (!currentMonster) return;
    
    if (currentMonster.name === "枯朽椰骸大祭司") {
        targetSelection.style.display = "block";
        const targetSelect = document.getElementById("target-select");
        
        let options = `<option value="">(選擇目標)</option>`;
        engine.state.teams.forEach(t => {
            if (t.id === teamId) return;
            let statusText = t.status === "active" ? "存活" : "陣亡/休息";
            options += `<option value="${t.id}">${t.name} (${statusText})</option>`;
        });
        targetSelect.innerHTML = options;
        
    } else {
        targetSelection.style.display = "none";
    }
    
    document.getElementById("submit-btn").style.display = "block";
}

function render() {
    const state = engine.state;
    if (!state.teams) return;
    
    myTeamData = state.teams.find(t => t.id === teamId);
    if (!myTeamData) return;

    document.getElementById("team-name").textContent = myTeamData.name;
    document.getElementById("team-hp").textContent = myTeamData.hp;
    document.getElementById("team-round-coco").textContent = myTeamData.roundCoconuts;
    document.getElementById("team-total-coco").textContent = myTeamData.totalCoconuts;

    let statusText = "🛡️ 探索中";
    if (myTeamData.status === "escaped") statusText = "🏕️ 休息整備";
    else if (myTeamData.status === "dead") statusText = "💀 陣亡";
    document.getElementById("team-status").textContent = statusText;

    if (state.phase === "ENCOUNTER_BID") {
        document.getElementById("wait-view").style.display = "none";
        document.getElementById("game-view").style.display = "block";
        document.getElementById("timer").textContent = state.timeLeft;

        currentMonster = engine.getCurrentMonster();
        if (currentMonster) {
            document.getElementById("monster-img").src = "/" + currentMonster.img;
            document.getElementById("monster-name").textContent = currentMonster.name;
            document.getElementById("monster-desc").textContent = currentMonster.desc;

            const container = document.getElementById("cards-container");
            const encounterKey = `${currentMonster.name}-${state.encounterIndex}`;
            if (container.children.length === 0 || container.dataset.encounterKey !== encounterKey) {
                container.dataset.encounterKey = encounterKey;
                currentSelectedCardId = null;
                
                container.innerHTML = engine.getMonsterCards(currentMonster).map(c => {
                    const desc = c.condition || c.desc;
                    const tags = c.tags ? c.tags.map(t => `<span class="tag">${t}</span>`).join('') : '';
                    return `
                    <div class="card-box" data-card-id="${c.id}" onclick="selectCard(${c.id})">
                        <h4 style="color:var(--ocean-dark); margin-bottom:0.5rem; font-size:1.3rem;">技能卡 ${c.id}</h4>
                        <div style="font-size:1.1rem; line-height:1.4; color: var(--coconut-leaf-dark); margin-bottom:0.8rem;">${desc}</div>
                        <div>${tags}</div>
                    </div>
                    `;
                }).join("");
            }
        }

        if (hasSubmitted) {
            document.getElementById("cards-container").style.pointerEvents = "none";
            document.getElementById("cards-container").style.opacity = "0.5";
            document.getElementById("target-selection").style.display = "none";
            document.getElementById("submit-btn").style.display = "none";
            document.getElementById("action-status").style.display = "block";
        } else {
            document.getElementById("cards-container").style.pointerEvents = "auto";
            document.getElementById("cards-container").style.opacity = "1";
            document.getElementById("action-status").style.display = "none";
            if (currentSelectedCardId) {
                document.getElementById("submit-btn").style.display = "block";
            }
        }

    } else {
        document.getElementById("game-view").style.display = "none";
        document.getElementById("wait-view").style.display = "block";
        if (state.phase === "SETUP") {
            document.getElementById("ready-btn").style.display = "inline-block";
        } else {
            document.getElementById("ready-btn").style.display = "none";
        }
    }
}