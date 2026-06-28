// 椰子怪討伐戰 2.0 (生存逃脫模式) - 核心遊戲引擎

// 定義 10 隻怪物，與各自固定的 4 張技能卡 (框架留空供後續填寫)
// 技能卡屬性： id (1~4), desc (描述), damage (扣血量), coconut (獲得椰子數), escape (是否逃跑)
function createMockCards() {
    return [
        { id: 1, desc: "技能卡 1", damage: 10, coconut: 1, escape: false },
        { id: 2, desc: "技能卡 2", damage: 30, coconut: 3, escape: false },
        { id: 3, desc: "技能卡 3", damage: 0, coconut: 0, escape: true },
        { id: 4, desc: "技能卡 4", damage: 50, coconut: 0, escape: false }
    ];
}

const MONSTERS = [
    { name: "椰殼小妖頭目", img: "assets/goblin_chief.png", desc: "喜歡成群結隊在沙灘上惡作劇。", cards: createMockCards() },
    { name: "鐵殼椰核食人魔", img: "assets/troll_ogre.png", desc: "以堅硬無比的椰核為核心變異而成。", cards: createMockCards() },
    { name: "狂野椰棕猛獸", img: "assets/beast_king.png", desc: "披著厚重椰棕的叢林巨獸。", cards: createMockCards() },
    { name: "風暴椰鱗巨翼龍", img: "assets/storm_dragon.png", desc: "拍打翅膀時會捲起熱帶風暴。", cards: createMockCards() },
    { name: "椰漿軟泥酋長", img: "assets/slime_chief.png", desc: "由濃稠椰奶聚合而成的果凍狀怪物。", cards: createMockCards() },
    { name: "海溝腐椰海神", img: "assets/abyss_sea_god.png", desc: "沉入深海吸收怨念的巨大腐爛椰子。", cards: createMockCards() },
    { name: "遠古珊瑚椰石像", img: "assets/coral_golem.png", desc: "長滿青苔的巨大摩艾石像。", cards: createMockCards() },
    { name: "黑潮椰蟹騎士", img: "assets/crab_rider.png", desc: "騎乘深海椰子蟹的怨靈。", cards: createMockCards() },
    { name: "枯朽椰骸大祭司", img: "assets/skeleton_priest.png", desc: "枯死椰子樹與白骨結合的祭司。", cards: createMockCards() },
    { name: "終焉滅世巨椰祖靈", img: "assets/final_boss_ancestor.png", desc: "一切椰子的起源，神話級巨型椰子。", cards: createMockCards() }
];

const DEFAULT_STATE = {
    teams: Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        name: `第 ${i + 1} 小隊`,
        hp: 100,
        roundCoconuts: 0,
        totalCoconuts: 0,
        status: "active", // active (存活), escaped (逃跑), dead (陣亡)
        selectedCardId: null,
        lastActionLog: ""
    })),
    roundNum: 1,
    monsterSequence: [], // 固定隨機序列 [3, 0, 8, ...]
    encounterIndex: 0, // 0~9
    phase: "SETUP", // SETUP, ENCOUNTER_BID, ENCOUNTER_RESULT, ROUND_END
    battleLogs: []
};

class GameEngine {
    constructor() {
        this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
        this.loadState();
    }

    saveState() {
        localStorage.setItem("coconut_game2_state", JSON.stringify(this.state));
        window.dispatchEvent(new Event("state_updated"));
    }

    loadState() {
        const stored = localStorage.getItem("coconut_game2_state");
        if (stored) {
            try {
                this.state = JSON.parse(stored);
            } catch (e) {
                console.error("狀態讀取失敗", e);
                this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
            }
        } else {
            this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
            this.saveState();
        }
    }

    resetGame() {
        this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
        this.saveState();
    }

    addLog(msg) {
        const time = new Date().toLocaleTimeString();
        this.state.battleLogs.unshift(`[${time}] ${msg}`);
    }

    initTeams(names) {
        this.state.teams.forEach((t, i) => {
            t.name = names[i] || `第 ${i + 1} 小隊`;
            t.hp = 100;
            t.roundCoconuts = 0;
            t.totalCoconuts = 0;
            t.status = "active";
            t.selectedCardId = null;
            t.lastActionLog = "";
        });
        
        // 產生固定隨機序列
        let seq = Array.from({ length: 10 }, (_, i) => i);
        for (let i = seq.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [seq[i], seq[j]] = [seq[j], seq[i]];
        }
        this.state.monsterSequence = seq;
        
        this.state.roundNum = 1;
        this.state.encounterIndex = 0;
        this.state.phase = "ENCOUNTER_BID";
        this.state.battleLogs = ["遊戲開始！已生成未知的怪物序列。"];
        this.addLog(`第 1 回合開始，遭遇第一隻怪物！`);
        this.saveState();
    }

    getCurrentMonster() {
        if (this.state.monsterSequence.length === 0) return null;
        const idx = this.state.monsterSequence[this.state.encounterIndex];
        return MONSTERS[idx];
    }

    submitCards(cardSelections) {
        const monster = this.getCurrentMonster();
        if (!monster) return;

        let activeCountBefore = 0;

        this.state.teams.forEach(t => {
            if (t.status !== "active") return;
            activeCountBefore++;

            const cardId = parseInt(cardSelections[t.id]);
            t.selectedCardId = cardId;
            const card = monster.cards.find(c => c.id === cardId);
            
            if (!card) {
                t.lastActionLog = "未選擇有效卡片，無事發生";
                return;
            }

            let logParts = [];

            // 1. 扣血
            if (card.damage > 0) {
                t.hp -= card.damage;
                logParts.push(`受到 ${card.damage} 傷害`);
            }

            // 判斷陣亡
            if (t.hp <= 0) {
                t.hp = 0;
                t.status = "dead";
                t.roundCoconuts = 0;
                t.lastActionLog = `${logParts.join(', ')} -> 陣亡！失去所有椰子。`;
                this.addLog(`【${t.name}】陣亡了！`);
                return; // 直接中斷後續效果
            }

            // 2. 獲得椰子
            if (card.coconut > 0) {
                t.roundCoconuts += card.coconut;
                logParts.push(`獲得 ${card.coconut} 椰子`);
            }

            // 3. 逃跑
            if (card.escape) {
                t.status = "escaped";
                t.totalCoconuts += t.roundCoconuts;
                t.lastActionLog = `${logParts.join(', ')} -> 成功逃跑！`;
                this.addLog(`【${t.name}】成功逃跑，帶回 ${t.roundCoconuts} 顆椰子！`);
            } else {
                t.lastActionLog = logParts.length > 0 ? logParts.join('，') : "平安無事";
            }
        });

        this.state.phase = "ENCOUNTER_RESULT";

        // 結算是否符合大回合結束條件
        const activeTeams = this.state.teams.filter(t => t.status === "active");
        
        if (activeTeams.length === 1 && activeCountBefore > 1) {
            // 只剩一隊，自動逃跑
            const lastTeam = activeTeams[0];
            lastTeam.status = "escaped";
            lastTeam.totalCoconuts += lastTeam.roundCoconuts;
            this.addLog(`【${lastTeam.name}】是最後的倖存者，自動帶走 ${lastTeam.roundCoconuts} 顆椰子！本輪結束。`);
            this.state.phase = "ROUND_END";
        } else if (activeTeams.length === 0) {
            this.addLog("所有隊伍皆已撤退或陣亡，本輪結束。");
            this.state.phase = "ROUND_END";
        } else if (this.state.encounterIndex >= 9) {
            this.addLog("十隻怪物已全部出現！存活隊伍凱旋而歸，本輪結束。");
            activeTeams.forEach(t => {
                t.status = "escaped";
                t.totalCoconuts += t.roundCoconuts;
                this.addLog(`【${t.name}】撐到最後，帶回 ${t.roundCoconuts} 顆椰子！`);
            });
            this.state.phase = "ROUND_END";
        }

        this.saveState();
    }

    nextEncounter() {
        this.state.encounterIndex += 1;
        this.state.phase = "ENCOUNTER_BID";
        this.state.teams.forEach(t => {
            t.selectedCardId = null;
            t.lastActionLog = "";
        });
        const m = this.getCurrentMonster();
        this.addLog(`繼續深入！遭遇第 ${this.state.encounterIndex + 1} 隻怪物：【${m.name}】`);
        this.saveState();
    }

    nextRound() {
        this.state.roundNum += 1;
        this.state.encounterIndex = 0;
        this.state.phase = "ENCOUNTER_BID";
        
        // 重置所有隊伍狀態，但不清空 totalCoconuts，也不重置 monsterSequence
        this.state.teams.forEach(t => {
            t.hp = 100;
            t.roundCoconuts = 0;
            t.status = "active";
            t.selectedCardId = null;
            t.lastActionLog = "";
        });

        const m = this.getCurrentMonster();
        this.addLog(`=== 第 ${this.state.roundNum} 回合開始 ===`);
        this.addLog(`遭遇第一隻怪物：【${m.name}】`);
        this.saveState();
    }

    overrideStats(teamId, hpOffset, coconutOffset) {
        const team = this.state.teams.find(t => t.id === teamId);
        if (team) {
            team.hp = Math.max(0, team.hp + hpOffset);
            team.totalCoconuts = Math.max(0, team.totalCoconuts + coconutOffset);
            if (team.hp === 0 && team.status === "active") {
                team.status = "dead";
            }
            this.saveState();
        }
    }
}

window.GameEngine = GameEngine;
