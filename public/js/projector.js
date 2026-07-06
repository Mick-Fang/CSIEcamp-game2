const engine = new GameEngine();

function pollServer() {
    fetch('/csiecamp_game2/api/state')
        .then(res => res.json())
        .then(data => {
            if (data.game_state && Object.keys(data.game_state).length > 0) {
                engine.state = data.game_state;
                render();
            }
        })
        .catch(e => console.log(e));
}

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
        let statusText = "🛡️ 探索中";
        let statusColor = "var(--ocean-medium)";
        if (t.status === "escaped") { statusText = "🏕️ 休息整備"; statusColor = "var(--success-green)"; }
        else if (t.status === "dead") { statusText = "💀 陣亡"; statusColor = "var(--danger-red)"; }

        let cardIndicator = "";
        if (state.phase === "ENCOUNTER_RESULT" && t.selectedCardId) {
            cardIndicator = `<div style="font-size: 1.1rem; color: #fde047; margin-bottom: 0.5rem; font-weight: bold;">(選擇卡片 ${t.selectedCardId})</div>`;
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

        return `
            <div class="team-box ${t.status} ${animClass}">
                <h3 style="margin:0 0 0.25rem 0; color: #fff; font-size: 1.2rem;">${t.name}</h3>
                <div style="font-weight:bold; color: ${statusColor}; margin-bottom: 0.25rem; font-size: 1.1rem;">${statusText}</div>
                ${cardIndicator}
                ${debuffHtml}
                <div style="font-size: 1.1rem; margin-bottom: 0.2rem;">💖 HP: <span style="font-size:1.5rem; font-weight:bold;">${t.hp}</span></div>
                <div style="font-size: 1.1rem;">🎒 袋中: <span style="font-size:1.5rem; color:#f59e0b; font-weight:bold;">${t.roundCoconuts}</span></div>
                <div style="margin-top: 0.5rem; font-size: 1rem; color: #94a3b8; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 0.5rem;">🏦 家中椰子: <span style="color:#fff;">${t.totalCoconuts}</span></div>
            </div>
        `;
    }).join("");

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
                    <h4 style="color:#fde047; margin-bottom:0.25rem; font-size:1.1rem;">📜 技能卡 ${c.id}</h4>
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
            resText.innerHTML = `⏳ 剩餘時間: <span style="color:red; font-size:1.8rem; font-weight:bold;">${state.timeLeft}</span> 秒`;
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

const style = document.createElement('style');
style.innerHTML = `
@keyframes shake {
  0% { transform: translate(1px, 1px) rotate(0deg); }
  10% { transform: translate(-1px, -2px) rotate(-1deg); }
  20% { transform: translate(-3px, 0px) rotate(1deg); }
  30% { transform: translate(3px, 2px) rotate(0deg); }
  40% { transform: translate(1px, -1px) rotate(1deg); }
  50% { transform: translate(-1px, 2px) rotate(-1deg); }
  60% { transform: translate(-3px, 1px) rotate(0deg); }
  70% { transform: translate(3px, 1px) rotate(-1deg); }
  80% { transform: translate(-1px, -1px) rotate(1deg); }
  90% { transform: translate(1px, 2px) rotate(0deg); }
  100% { transform: translate(1px, -2px) rotate(-1deg); }
}
.shake-anim {
  animation: shake 0.5s;
  animation-iteration-count: infinite;
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.8) !important;
  border-color: #ef4444 !important;
}
`;
document.head.appendChild(style);
