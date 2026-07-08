const engine = new GameEngine();
let previousHPs = {}; // Track previous HP for shake detection
let shakeTimers = {}; // Track shake animation timers

// Local display timer - smooth countdown independent of server poll rate
let localTimeLeft = 99;
let lastKnownPhase = null;

function pollServer() {
    fetch('/csiecamp_game2/typhoon/api/state')
        .then(res => res.json())
        .then(data => {
            if (data.game_state && Object.keys(data.game_state).length > 0) {
                // Before updating state, snapshot current HPs
                if (engine.state.teams) {
                    engine.state.teams.forEach(t => {
                        previousHPs[t.id] = t.hp;
                    });
                }
                const newState = data.game_state;
                // Sync local timer if phase changed or server value diverges by more than 2
                if (newState.phase !== lastKnownPhase ||
                    Math.abs(newState.timeLeft - localTimeLeft) > 2) {
                    localTimeLeft = newState.timeLeft;
                }
                lastKnownPhase = newState.phase;
                engine.state = newState;
                render();
            }
        })
        .catch(e => console.log(e));
}

// Local 1-second countdown - runs independently from server poll
setInterval(() => {
    if (engine.state.phase === 'ENCOUNTER_BID' && localTimeLeft > 0) {
        localTimeLeft -= 1;
        // Update just the timer display without full re-render
        const resText = document.getElementById('proj-result-text');
        if (resText && engine.state.phase === 'ENCOUNTER_BID') {
            resText.innerHTML = `⏳ 剩餘時間: <span style="color:red; font-size:1.8rem; font-weight:bold;">${localTimeLeft}</span> 秒`;
            resText.style.color = '#94a3b8';
        }
    }
}, 1000);

setInterval(pollServer, 1000);

document.addEventListener("DOMContentLoaded", () => {
    pollServer();
});

function render() {
    const state = engine.state;
    
    const displayNum = state.encounterIndex - (state.extraEncounters || 0) + 1;
    document.getElementById("proj-encounter").textContent = displayNum;

    document.getElementById("view-setup").style.display = "none";
    document.getElementById("view-encounter").style.display = "none";
    document.getElementById("view-round-end").style.display = "none";

    // 渲染下方小隊網格
    document.getElementById("teams-grid").innerHTML = state.teams.map(t => {
        let statusText = "";
        let statusColor = "var(--ocean-medium)";
        if (t.status === "escaped") { statusText = "🏕️ 休息整備"; statusColor = "var(--success-green)"; }
        else if (t.status === "dead") { statusText = "💀 陣亡"; statusColor = "var(--danger-red)"; }

        let cardIndicator = "";
        if (state.phase === "ENCOUNTER_RESULT" && t.selectedCardId) {
            cardIndicator = `<div style="font-size: 1.1rem; color: #fde047; margin-bottom: 0.5rem; font-weight: bold;">(選擇選項 ${t.selectedCardId})</div>`;
        }

        let debuffList = [];
        if (t.debuffs.golemCurseDmg > 0) debuffList.push(`🗿獲椰受傷+${t.debuffs.golemCurseDmg}`);
        if (t.debuffs.crabNextEncounterDmg) debuffList.push("🦀遇蟹受傷+80");
        if (t.debuffs.deathDoomCount > 0) debuffList.push(`💀死亡宣告:剩${t.debuffs.deathDoomCount}遭遇`);

        let debuffHtml = "";
        if (debuffList.length > 0) {
            debuffHtml = `<div style="margin-bottom: 0.5rem; font-size: 0.95rem; color: #fca5a5; background: rgba(239,68,68,0.15); padding: 4px; border-radius: 4px; border-left: 3px solid #ef4444;">
                ${debuffList.map(d => `<div>${d}</div>`).join("")}
            </div>`;
        }

        // Detect HP decrease → shake animation
        const prevHP = previousHPs[t.id];
        const hpDecreased = (prevHP !== undefined && t.hp < prevHP);

        let cornerIcon = "";
        if (state.phase === "ENCOUNTER_RESULT" && t.roundResult) {
            if (t.roundResult === "dead") {
                cornerIcon = `<div style="position: absolute; top: -15px; right: -15px; font-size: 3.5rem; filter: drop-shadow(0 0 10px rgba(0, 0, 0, 0.8)); transform: rotate(15deg); z-index: 10;">💀</div>`;
            } else if (t.roundResult === "escaped") {
                cornerIcon = `<div style="position: absolute; top: -15px; right: -15px; font-size: 3.5rem; filter: drop-shadow(0 0 10px rgba(0, 0, 0, 0.8)); transform: rotate(-10deg); z-index: 10;">🏕️</div>`;
            }
        }

        let roundCocoStr = `${t.roundCoconuts}`;
        if (state.phase === "ENCOUNTER_RESULT" && t.roundCoconutsDiff) {
            let sign = t.roundCoconutsDiff > 0 ? "+" : "";
            let color = t.roundCoconutsDiff > 0 ? "#fde047" : "#fca5a5";
            roundCocoStr += ` <span style="font-size:1.1rem; color:${color};">(${sign}${t.roundCoconutsDiff})</span>`;
        }

        let totalCocoStr = `${t.totalCoconuts}`;
        if (state.phase === "ENCOUNTER_RESULT" && t.totalCoconutsDiff) {
            let sign = t.totalCoconutsDiff > 0 ? "+" : "";
            let color = t.totalCoconutsDiff > 0 ? "#a3e635" : "#fca5a5";
            totalCocoStr += ` <span style="font-size:0.9rem; color:${color};">(${sign}${t.totalCoconutsDiff})</span>`;
        }

        return `
            <div class="team-box ${t.status}" id="team-box-${t.id}" style="position: relative;">
                ${cornerIcon}
                <h3 style="margin:0 0 0.25rem 0; color: #fff; font-size: 1.2rem;">${t.name}</h3>
                ${statusText ? `<div style="font-weight:bold; color: ${statusColor}; margin-bottom: 0.25rem; font-size: 1.1rem;">${statusText}</div>` : ""}
                ${cardIndicator}
                ${debuffHtml}
                <div style="font-size: 1.1rem; margin-bottom: 0.2rem;">💖 HP: <span style="font-size:1.5rem; font-weight:bold;">${t.hp}</span></div>
                <div style="font-size: 1.1rem;">🎒 袋中: <span style="font-size:1.5rem; color:#f59e0b; font-weight:bold;">${roundCocoStr}</span></div>
                <div style="margin-top: 0.5rem; font-size: 1rem; color: #94a3b8; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 0.5rem;">🏡 家中椰子: <span style="color:#fff;">${totalCocoStr}</span></div>
            </div>
        `;
    }).join("");

    // After rendering, trigger shake for teams whose HP decreased
    state.teams.forEach(t => {
        const prevHP = previousHPs[t.id];
        if (prevHP !== undefined && t.hp < prevHP) {
            const el = document.getElementById(`team-box-${t.id}`);
            if (el) {
                el.classList.add("shake-anim");
                // Clear any existing timer for this team
                if (shakeTimers[t.id]) clearTimeout(shakeTimers[t.id]);
                // Remove shake after 2 seconds
                shakeTimers[t.id] = setTimeout(() => {
                    el.classList.remove("shake-anim");
                }, 2000);
            }
        }
    });

    if (state.phase === "SETUP") {
        document.getElementById("view-setup").style.display = "block";
    } else if (state.phase === "ENCOUNTER_BID" || state.phase === "ENCOUNTER_RESULT") {
        const m = engine.getCurrentMonster();
        if (m) {
            document.getElementById("proj-monster-img").src = m.img;
            document.getElementById("proj-monster-name").textContent = m.name;
            document.getElementById("proj-monster-desc").textContent = m.desc;
            
            document.getElementById("proj-cards-container").innerHTML = engine.getMonsterCards(m).map(c => {
                const desc = c.condition || c.desc;
                const tags = c.tags ? c.tags.map(t => `<span style="background:#fde047; color:#000; padding:2px 6px; border-radius:4px; font-size:0.9rem; margin-right:8px; font-weight:bold;">${t}</span>`).join('') : '';
                return `
                <div class="glass-card" style="text-align:left; border-left: 6px solid #475569; flex: 1; padding: 0.75rem 1rem;">
                    <h4 style="color:#fde047; margin-bottom:0.25rem; font-size:1.1rem;">📜 選項 ${c.id}</h4>
                    <div style="font-size:1rem; line-height:1.4; color: #e2e8f0; margin-bottom:0.25rem;">${desc}</div>
                    <div>${tags}</div>
                </div>
                `;
            }).join("");
        }

        const resText = document.getElementById("proj-result-text");
        if (state.phase === "ENCOUNTER_RESULT") {
            resText.innerHTML = "⚡ 結算完畢！請查看各小隊狀態變化 ⚡";
            resText.style.color = "var(--success-green)";
        } else {
            resText.innerHTML = `⏳ 剩餘時間: <span style="color:red; font-size:1.8rem; font-weight:bold;">${localTimeLeft}</span> 秒`;
            resText.style.color = "#94a3b8";
        }

        document.getElementById("view-encounter").style.display = "block";
    } else if (state.phase === "ROUND_END") {
        document.getElementById("round-end-leaderboard").innerHTML = [...state.teams]
            .sort((a,b) => b.totalCoconuts - a.totalCoconuts)
            .map((t, i) => `
                <div class="glass-card" style="display:flex; justify-content:space-between; align-items: center; border-left: 6px solid ${i === 0 ? 'var(--sunset-yellow)' : '#475569'};">
                    <span><strong style="color:${i === 0 ? 'var(--sunset-yellow)' : '#cbd5e1'}; font-size:1.5rem; margin-right:1rem;">#${i+1}</strong> ${t.name}</span>
                    <span style="color:#f59e0b; font-weight:bold; font-size: 1.8rem;">${t.totalCoconuts} <span style="font-size:1.2rem;">椰子</span></span>
                </div>
            `).join("");
        document.getElementById("view-round-end").style.display = "block";
    }
}

// Shake animation CSS
const style = document.createElement('style');
style.innerHTML = `
@keyframes shake {
  0%, 100% { transform: translate(0, 0); }
  10% { transform: translate(-4px, -2px); }
  20% { transform: translate(4px, 2px); }
  30% { transform: translate(-4px, 0px); }
  40% { transform: translate(4px, -2px); }
  50% { transform: translate(-2px, 2px); }
  60% { transform: translate(4px, 0px); }
  70% { transform: translate(-4px, -2px); }
  80% { transform: translate(2px, 2px); }
  90% { transform: translate(-2px, -2px); }
}
.shake-anim {
  animation: shake 0.4s ease-in-out infinite;
  box-shadow: 0 0 25px rgba(239, 68, 68, 0.9) !important;
  border-color: #ef4444 !important;
}
`;
document.head.appendChild(style);
