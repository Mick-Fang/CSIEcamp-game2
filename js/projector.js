const engine = new GameEngine();

window.addEventListener("message", (e) => {
    if (e.data && e.data.type === "COCONUT_STATE_UPDATE") {
        engine.state = e.data.state;
        render();
    }
});
if (window.opener) window.opener.postMessage({ type: "COCONUT_REQUEST_STATE" }, "*");
window.addEventListener("storage", (e) => { if (e.key === "coconut_game2_state") { engine.loadState(); render(); } });

document.addEventListener("DOMContentLoaded", render);

function render() {
    const state = engine.state;
    
    document.getElementById("proj-round").textContent = state.roundNum;
    document.getElementById("proj-encounter").textContent = state.encounterIndex + 1;

    document.getElementById("view-setup").style.display = "none";
    document.getElementById("view-encounter").style.display = "none";
    document.getElementById("view-round-end").style.display = "none";

    // 渲染下方小隊網格
    document.getElementById("teams-grid").innerHTML = state.teams.map(t => {
        let statusText = "🛡️ 探索中";
        let statusColor = "var(--ocean-medium)";
        if (t.status === "escaped") { statusText = "🏃 已撤離"; statusColor = "var(--success-green)"; }
        else if (t.status === "dead") { statusText = "💀 陣亡"; statusColor = "var(--danger-red)"; }

        let cardIndicator = "";
        if (state.phase === "ENCOUNTER_RESULT" && t.selectedCardId) {
            cardIndicator = `<div style="font-size: 1.1rem; color: #fde047; margin-bottom: 0.5rem; font-weight: bold;">(選擇卡片 ${t.selectedCardId})</div>`;
        }

        return `
            <div class="team-box ${t.status}">
                <h3 style="margin:0 0 0.5rem 0; color: #fff; font-size: 1.4rem;">${t.name}</h3>
                <div style="font-weight:bold; color: ${statusColor}; margin-bottom: 0.5rem; font-size: 1.2rem;">${statusText}</div>
                ${cardIndicator}
                <div style="font-size: 1.2rem; margin-bottom: 0.25rem;">💖 HP: <span style="font-size:1.8rem; font-weight:bold;">${t.hp}</span></div>
                <div style="font-size: 1.2rem;">🎒 袋中: <span style="font-size:1.8rem; color:#f59e0b; font-weight:bold;">${t.roundCoconuts}</span></div>
                <div style="margin-top: 1rem; font-size: 1.1rem; color: #94a3b8; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 0.5rem;">🏦 總資產: <span style="color:#fff;">${t.totalCoconuts}</span></div>
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
            
            document.getElementById("proj-cards-container").innerHTML = m.cards.map(c => `
                <div class="glass-card" style="text-align:left; border-left: 6px solid #475569;">
                    <h4 style="color:#fde047; margin-bottom:0.5rem; font-size:1.5rem;">📜 技能卡 ${c.id}</h4>
                    <div style="font-size:1.2rem; line-height:1.6; color: #e2e8f0;">${c.desc}</div>
                </div>
            `).join("");
        }

        const resText = document.getElementById("proj-result-text");
        if (state.phase === "ENCOUNTER_RESULT") {
            resText.innerHTML = "⚡ 結算完畢！請查看各小隊狀態變化 ⚡";
            resText.style.color = "var(--success-green)";
        } else {
            resText.innerHTML = "🤔 請各小隊進行討論，並告知關主選擇的技能卡...";
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
