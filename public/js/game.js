// 椰子怪討伐戰 2.0 (生存逃脫模式) - 核心遊戲引擎

const MONSTERS = [
    {
        name: "椰漿軟泥酋長",
        img: "assets/slime_chief.png",
        desc: "由濃稠椰奶聚合而成的果凍狀怪物。",
        cards: [
            { id: 1, condition: "受到20點傷害。", tags: ["獲得一顆椰子"], escape: false },
            { id: 2, condition: "受到40點傷害。", tags: ["獲得兩顆椰子"], escape: false },
            { id: 3, condition: "受到60點傷害。", tags: ["休息整備"], escape: true }
        ]
    },
    {
        name: "椰殼小妖頭目",
        img: "assets/goblin_chief.png",
        desc: "喜歡成群結隊在沙灘上惡作劇。",
        cards: [
            { id: 1, condition: "選擇這個選項的小隊分攤30點傷害。", tags: ["獲得一顆椰子"], escape: false },
            { id: 2, condition: "選擇這個選項的小隊分攤60點傷害。", tags: ["獲得兩顆椰子"], escape: false },
            { id: 3, condition: "選擇這個選項的小隊分攤90點傷害。", tags: ["休息整備"], escape: true }
        ]
    },
    {
        name: "狂野椰棕猛獸",
        img: "assets/beast_king.png",
        desc: "披著厚重椰棕的叢林巨獸。",
        cards: [
            { id: 1, condition: "如果這回合有至少1個小隊選擇逃跑，受到40點傷害。", tags: ["獲得一顆椰子"], escape: false },
            { id: 2, condition: "如果這回合有至少2個小隊選擇逃跑，受到60點傷害。", tags: ["獲得兩顆椰子"], escape: false },
            { id: 3, condition: "如果所有小隊都選這個選項，受到80點傷害。", tags: ["休息整備"], escape: true }
        ]
    },
    {
        name: "鐵殼椰核食人魔",
        img: "assets/troll_ogre.png",
        desc: "以堅硬無比的椰核為核心變異而成。",
        cards: [
            { id: 1, condition: "如果這個選項有奇數個小隊選，受到50傷害。", tags: ["獲得一顆椰子"], escape: false },
            { id: 2, condition: "如果這個選項有偶數個小隊選，受到50傷害。", tags: ["獲得兩顆椰子"], escape: false },
            { id: 3, condition: "如果這個選項有至少2小隊選，受到70傷害。", tags: ["休息整備"], escape: true }
        ]
    },
    {
        name: "遠古珊瑚椰石像",
        img: "assets/coral_golem.png",
        desc: "長滿青苔的巨大摩艾石像。",
        cards: [
            { id: 1, condition: "直到死掉或休息整備前，每次袋子內的椰子變多，就受到10傷害。", tags: ["獲得一顆椰子"], escape: false },
            { id: 2, condition: "直到死掉或休息整備前，每次袋子內的椰子變多，就受到30傷害。", tags: ["獲得兩顆椰子"], escape: false },
            { id: 3, condition: "小隊袋子內的椰子數減半，向下取整。", tags: ["休息整備"], escape: true }
        ]
    },
    {
        name: "黑潮椰蟹騎士",
        img: "assets/crab_rider.png",
        desc: "騎乘深海椰子蟹的怨靈。",
        cards: [
            { id: 1, condition: "選擇此選項的小隊中，袋子內椰子最少者受到60傷害。同時最多者全部皆會受傷。", tags: ["獲得一顆椰子"], escape: false },
            { id: 2, condition: "選擇此選項的小隊中，袋子內椰子最多者受到70傷害。同時最少者全部皆會受傷。", tags: ["獲得兩顆椰子"], escape: false },
            { id: 3, condition: "下次見到黑潮椰蟹騎士時受到80傷害，此次休息整備不能移除異常狀態。", tags: ["休息整備"], escape: true }
        ]
    },
    {
        name: "風暴椰鱗巨翼龍",
        img: "assets/storm_dragon.png",
        desc: "拍打翅膀時會捲起熱帶風暴。",
        cards: [
            { id: 1, condition: "失去2個椰子，如果選這個選項的小隊不足7個，再打一次風暴椰鱗巨翼龍。", tags: ["獲得一顆椰子"], escape: false },
            { id: 2, condition: "失去2個椰子。", tags: ["獲得兩顆椰子"], escape: false },
            { id: 3, condition: "此次休息整備不能回血、不能移除異常狀態、也不能儲存椰子。", tags: ["休息整備"], escape: true }
        ]
    },
    {
        name: "枯朽椰骸大祭司",
        img: "assets/skeleton_priest.png",
        desc: "枯死椰子樹與白骨結合的祭司。",
        cards: [
            { id: 1, condition: "每個選擇此選項的小隊各自指定另外一隊，你移除他袋內2顆椰子。", tags: ["獲得一顆椰子"], escape: false, requireTarget: true },
            { id: 2, condition: "每個選擇此選項的小隊各自對其指定1小隊造成40點傷害。", tags: ["獲得兩顆椰子"], escape: false, requireTarget: true },
            { id: 3, condition: "每個選擇此選項的小隊各自指定另外一隊，那個小隊將在見到3隻魔王後死掉。", tags: ["休息整備"], escape: true, requireTarget: true }
        ]
    },
    {
        name: "海溝腐椰海神",
        img: "assets/abyss_sea_god.png",
        desc: "沉入深海吸收怨念的巨大腐爛椰子。",
        cards: [
            { id: 1, condition: "如果選這個選項的小隊比選2的多，選擇選項2或3的小隊受到80點傷害。", tags: ["獲得一顆椰子"], escape: false },
            { id: 2, condition: "如果選這個選項的小隊比選1的多，選擇選項1或3的小隊受到70點傷害。", tags: ["獲得兩顆椰子"], escape: false },
            { id: 3, condition: "你的袋子中+6椰子。", tags: ["休息整備"], escape: true }
        ]
    },
    {
        name: "終焉滅世巨椰祖靈",
        img: "assets/final_boss_ancestor.png",
        desc: "一切椰子的起源，神話級巨型椰子。",
        cards: [
            { id: 1, condition: "如果沒人選這個選項，所有人受到90傷害。", tags: ["獲得一顆椰子"], escape: false },
            { id: 2, condition: "如果沒人選這個選項，所有人受到90傷害。", tags: ["獲得兩顆椰子"], escape: false },
            { id: 3, condition: "如果沒人選這個選項，所有人受到90傷害。", tags: ["休息整備"], escape: true }
        ]
    }
];

const DEFAULT_STATE = {
    teams: Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        name: `第 ${i + 1} 小隊`,
        hp: 100,
        roundCoconuts: 0,
        totalCoconuts: 0,
        status: "active", // active, escaped, dead
        selectedCardId: null,
        selectedTargetId: null,
        lastActionLog: "",
        debuffs: {
            golemCurseDmg: 0,
            crabNextEncounterDmg: false,
            deathDoomCount: -1
        }
    })),
    roundNum: 1,
    monsterSequence: [], // 固定隨機序列
    encounterIndex: 0, // 目前打到第幾隻 (長度可能因巨翼龍改變)
    phase: "SETUP", // SETUP, ENCOUNTER_BID, ENCOUNTER_RESULT
    timeLeft: 99,
    battleLogs: [],
    
    // Global Persistent States
    golemCounters: { opt1: 0, opt2: 0, opt3: 0 },
    globalBuffs: {}, // { "monsterIdx": { all: 20, opt1: 20 } }
    dragonRepeatTriggered: false
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
            try { this.state = JSON.parse(stored); } catch (e) {
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
        let gameStartedBefore = this.state ? this.state.gameStartedBefore : false;

        this.state.teams.forEach((t, i) => {
            t.name = names[i] || `第 ${i + 1} 小隊`;
            t.hp = 100;
            t.roundCoconuts = 0;
            t.totalCoconuts = 0;
            t.status = "active";
            t.selectedCardId = null;
            t.lastActionLog = "";
            t.debuffs = {
                golemCurseDmg: 0,
                crabNextEncounterDmg: false,
                deathDoomCount: -1
            };
        });
        
        let seq = [];
        if (!gameStartedBefore) {
            const firstNames = [
                "椰漿軟泥酋長", "椰殼小妖頭目", "狂野椰棕猛獸", "鐵殼椰核食人魔", 
                "遠古珊瑚椰石像", "黑潮椰蟹騎士", "風暴椰鱗巨翼龍", 
                "枯朽椰骸大祭司", "海溝腐椰海神", "終焉滅世巨椰祖靈"
            ];
            seq = firstNames.map(n => MONSTERS.findIndex(m => m.name === n)).filter(idx => idx !== -1);
            gameStartedBefore = true;
        } else {
            seq = Array.from({length: MONSTERS.length}, (_, i) => i);
            for (let i = seq.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [seq[i], seq[j]] = [seq[j], seq[i]];
            }
        }
        
        this.state.monsterSequence = seq;
        this.state.gameStartedBefore = gameStartedBefore;
        this.state.extraEncounters = 0;
        this.state.roundNum = 1;
        this.state.encounterIndex = 0;
        this.state.phase = "ENCOUNTER_BID";
        this.state.timeLeft = 99;
        this.state.timeLeft = 99;
        this.state.battleLogs = ["遊戲開始！已生成怪物序列。"];
        this.addLog(`遊戲開始，遭遇第一隻怪物！`);
        this.saveState();
    }

    getCurrentMonster() {
        if (this.state.monsterSequence.length === 0) return null;
        const idx = this.state.monsterSequence[this.state.encounterIndex];
        return MONSTERS[idx];
    }

    getMonsterCards(monster) {
        if (!monster) return [];
        const cards = JSON.parse(JSON.stringify(monster.cards));
        const monsterIdx = this.state.monsterSequence[this.state.encounterIndex];
        const globalBuff = this.state.globalBuffs[monsterIdx];
        
        if (monster.name === "遠古珊瑚椰石像") {
            const gc = this.state.golemCounters;
            const remaining1 = Math.max(0, 10 - gc.opt1);
            const remaining2 = Math.max(0, 8 - gc.opt2);
            const remaining3 = Math.max(0, 4 - gc.opt3);
            if(cards[0]) cards[0].condition = `累計${remaining1}個隊伍選擇此選項後，受到100傷害。`;
            if(cards[1]) cards[1].condition = `累計${remaining2}個隊伍選擇此選項後，受到80傷害。`;
            if(cards[2]) cards[2].condition = `累計${remaining3}個隊伍選擇此選項後，下隻怪物技能卡1造成的傷害永久+10。`;
        }

        // Show globalBuff damage bonuses on card descriptions for any monster
        if (globalBuff && (globalBuff.all > 0 || globalBuff.opt1 > 0)) {
            cards.forEach((c, i) => {
                let bonus = globalBuff.all || 0;
                if (i === 0) bonus += (globalBuff.opt1 || 0);
                if (bonus > 0) {
                    c.desc = `【石像共鳴: 傷害+${bonus}】` + c.desc;
                }
            });
        }
        
        return cards;
    }

    getNextMonsterIndexInSequence() {
        // Since we add dynamically, the next index is the next one generated
        if (this.state.encounterIndex + 1 < this.state.monsterSequence.length) {
            return this.state.monsterSequence[this.state.encounterIndex + 1];
        }
        return null;
    }

    submitCards(cardSelections) {
        const monster = this.getCurrentMonster();
        if (!monster) return;

        let coconuts = {};
        let escapes = {};
        let logs = {};

        let activeCountBefore = 0;
        const activeTeams = this.state.teams.filter(t => t.status === "active");

        // Prepare choices
        activeTeams.forEach(t => {
            activeCountBefore++;
            coconuts[t.id] = 0;
            escapes[t.id] = false;
            logs[t.id] = [];
            
            const sel = cardSelections[t.id];
            if (sel) {
                t.selectedCardId = parseInt(sel.cardId);
                t.selectedTargetId = sel.targetId ? parseInt(sel.targetId) : null;
            } else {
                t.selectedCardId = null;
                t.selectedTargetId = null;
            }
        });

        const applyDamage = (t, amount, logMsg) => {
            if (amount <= 0) return;
            t.hp -= amount;
            if (t.hp < 0) t.hp = 0;
            if (logMsg) logs[t.id].push(logMsg);
            logs[t.id].push(`受到 ${amount} 傷害(餘HP:${t.hp})`); };

        const applyHeal = (t, amount, logMsg) => {
            t.hp = Math.min(100, t.hp + amount);
            if (logMsg) logs[t.id].push(logMsg);
            logs[t.id].push(`回復 ${amount} 血量(餘${t.hp})`);
        };

        const addCoconuts = (t, amount, isSpecial = false) => {
            if (amount === 0) return;
            t.roundCoconuts += amount;
            if (t.roundCoconuts < 0) t.roundCoconuts = 0;
            logs[t.id].push(amount > 0 ? `+${amount} 椰子` : `${amount} 椰子`);
            // 遠古珊瑚椰石像詛咒: 獲得椰子時受傷
            if (amount > 0 && t.debuffs.golemCurseDmg > 0 && !isSpecial) {
                applyDamage(t, t.debuffs.golemCurseDmg, "珊瑚石像詛咒發作");
            }
        };




        // 開場狀態結算
        activeTeams.forEach(t => {
            if (monster.name === "黑潮椰蟹騎士" && t.debuffs.crabNextEncounterDmg) {
                applyDamage(t, 80, "椰蟹騎士開場怨念發作");
                t.debuffs.crabNextEncounterDmg = false;
            }
        });

        let counts = { 1: 0, 2: 0, 3: 0 };
        activeTeams.forEach(t => {
            if (t.selectedCardId) counts[t.selectedCardId]++;
        });

        this.state.dragonRepeatTriggered = false;

        // ==============================================
        // 1. Boss Unique Skills (技能卡1,2,3的王獨立技能)
        // ==============================================
        
        // 椰漿軟泥酋長
        if (monster.name === "椰漿軟泥酋長") {
            activeTeams.forEach(t => { if (t.selectedCardId === 1) applyDamage(t, 20); });
            activeTeams.forEach(t => { if (t.selectedCardId === 2) applyDamage(t, 40); });
            activeTeams.forEach(t => { if (t.selectedCardId === 3) applyDamage(t, 60); });
        }
        
        // 椰殼小妖頭目
        if (monster.name === "椰殼小妖頭目") {
            activeTeams.forEach(t => { if (t.selectedCardId === 1 && counts[1] > 0) applyDamage(t, Math.round(30 / counts[1])); });
            activeTeams.forEach(t => { if (t.selectedCardId === 2 && counts[2] > 0) applyDamage(t, Math.round(60 / counts[2])); });
            activeTeams.forEach(t => { if (t.selectedCardId === 3 && counts[3] > 0) applyDamage(t, Math.round(90 / counts[3])); });
        }
        
        // 狂野椰棕猛獸
        if (monster.name === "狂野椰棕猛獸") {
            activeTeams.forEach(t => { if (t.selectedCardId === 1 && counts[3] >= 1) applyDamage(t, 40); });
            activeTeams.forEach(t => { if (t.selectedCardId === 2 && counts[3] >= 2) applyDamage(t, 60); });
            activeTeams.forEach(t => { if (t.selectedCardId === 3 && counts[3] === activeCountBefore) applyDamage(t, 80); });
        }
        
        // 鐵殼椰核食人魔
        if (monster.name === "鐵殼椰核食人魔") {
            activeTeams.forEach(t => { if (t.selectedCardId === 1 && counts[1] % 2 !== 0) applyDamage(t, 50); });
            activeTeams.forEach(t => { if (t.selectedCardId === 2 && counts[2] % 2 === 0) applyDamage(t, 50); });
            activeTeams.forEach(t => { if (t.selectedCardId === 3 && counts[3] >= 2) applyDamage(t, 70); });
        }
        
        // 遠古珊瑚椰石像
        if (monster.name === "遠古珊瑚椰石像") {
            activeTeams.forEach(t => { if (t.selectedCardId === 1) { t.debuffs.golemCurseDmg = 10; } });
            activeTeams.forEach(t => { if (t.selectedCardId === 2) { t.debuffs.golemCurseDmg = 30; } });
            activeTeams.forEach(t => { 
                if (t.selectedCardId === 3) {
                    let half = Math.floor(t.roundCoconuts / 2);
                    t.roundCoconuts -= half;
                    logs[t.id].push(`失去 ${half} 顆椰子 (袋中減半)`); }
            });
        }
        
        // 黑潮椰蟹騎士
        if (monster.name === "黑潮椰蟹騎士") {
            let minCoco1 = 99999, maxCoco1 = -1, minCoco2 = 99999, maxCoco2 = -1;
            activeTeams.forEach(t => {
                if (t.selectedCardId === 1) {
                    if (t.roundCoconuts < minCoco1) minCoco1 = t.roundCoconuts;
                    if (t.roundCoconuts > maxCoco1) maxCoco1 = t.roundCoconuts;
                }
                if (t.selectedCardId === 2) {
                    if (t.roundCoconuts < minCoco2) minCoco2 = t.roundCoconuts;
                    if (t.roundCoconuts > maxCoco2) maxCoco2 = t.roundCoconuts;
                }
            });
            
            activeTeams.forEach(t => {
                if (t.selectedCardId === 1) {
                    if (t.roundCoconuts === minCoco1) applyDamage(t, 60);
                    if (t.roundCoconuts === maxCoco1) applyDamage(t, 60, "最大值懲罰");
                }
            });
            activeTeams.forEach(t => {
                if (t.selectedCardId === 2) {
                    if (t.roundCoconuts === maxCoco2) applyDamage(t, 70);
                    if (t.roundCoconuts === minCoco2) applyDamage(t, 70, "最小值懲罰");
                }
            });
            activeTeams.forEach(t => {
                if (t.selectedCardId === 3) { t.debuffs.crabNextEncounterDmg = true; }
            });
        }
        
        // 風暴椰鱗巨翼龍
        if (monster.name === "風暴椰鱗巨翼龍") {
            activeTeams.forEach(t => {
                if (t.selectedCardId === 1) {
                    addCoconuts(t, -2, true); if (counts[1] < 7) this.state.dragonRepeatTriggered = true;
                }
            });
            activeTeams.forEach(t => {
                if (t.selectedCardId === 2) { addCoconuts(t, -2, true); }
            });
            activeTeams.forEach(t => {
                if (t.selectedCardId === 3) { t.specialEscapeNoHealNoClearNoSave = true; }
            });
        }
        
        // 枯朽椰骸大祭司
        if (monster.name === "枯朽椰骸大祭司") {
            activeTeams.forEach(t => {
                if (t.selectedTargetId && t.selectedCardId === 1) {
                    const target = this.state.teams.find(tm => tm.id === t.selectedTargetId);
                    if (target) {
                        target.roundCoconuts -= 2;
                        if (target.roundCoconuts < 0) target.roundCoconuts = 0;
                        if (!logs[target.id]) logs[target.id] = [];
                        logs[target.id].push(`被 ${t.name} 奪走 2 椰子`);
                        logs[t.id].push(`移除 ${target.name} 袋中 2 椰子`); }
                }
            });
            activeTeams.forEach(t => {
                if (t.selectedTargetId && t.selectedCardId === 2) {
                    const target = this.state.teams.find(tm => tm.id === t.selectedTargetId);
                    if (target) {
                        applyDamage(target, 40, `被 ${t.name} 攻擊`);
                        logs[t.id].push(`對 ${target.name} 造成 40 傷害`);
                    }
                }
            });
            activeTeams.forEach(t => {
                if (t.selectedTargetId && t.selectedCardId === 3) {
                    const target = this.state.teams.find(tm => tm.id === t.selectedTargetId);
                    if (target) {
                        target.debuffs.deathDoomCount = 3;
                        if (!logs[target.id]) logs[target.id] = [];
                        logs[target.id].push(`被 ${t.name} 施加死亡宣告(3隻魔王後)`);
                        logs[t.id].push(`對 ${target.name} 施加死亡宣告`); }
                }
            });
        }
        
        // 海溝腐椰海神
        if (monster.name === "海溝腐椰海神") {
            activeTeams.forEach(t => {
                if (counts[2] > counts[1] && t.selectedCardId === 1) applyDamage(t, 70);
            });
            activeTeams.forEach(t => {
                if (counts[1] > counts[2] && t.selectedCardId === 2) applyDamage(t, 80);
            });
            activeTeams.forEach(t => {
                if (counts[1] > counts[2] && t.selectedCardId === 3) applyDamage(t, 80);
                if (counts[2] > counts[1] && t.selectedCardId === 3) applyDamage(t, 70);
                if (t.selectedCardId === 3) { addCoconuts(t, 6, true); }
            });
        }
        
        // 終焉滅世巨椰祖靈
        if (monster.name === "終焉滅世巨椰祖靈") {
            if (counts[1] === 0) {
                activeTeams.forEach(t => applyDamage(t, 90, "祖靈卡1無人選制裁"));
                this.addLog(`祖靈震怒：卡1無人選擇，所有人承受 90 點傷害！`);
            }
            if (counts[2] === 0) {
                activeTeams.forEach(t => applyDamage(t, 90, "祖靈卡2無人選制裁"));
                this.addLog(`祖靈震怒：卡2無人選擇，所有人承受 90 點傷害！`);
            }
            if (counts[3] === 0) {
                activeTeams.forEach(t => applyDamage(t, 90, "祖靈卡3無人選制裁"));
                this.addLog(`祖靈震怒：卡3無人選擇，所有人承受 90 點傷害！`);
            }
        }

        // ==============================================
        // 2. Common Skills (共同技能)
        // ==============================================
        activeTeams.forEach(t => {
            if (t.selectedCardId === 1) { addCoconuts(t, 1); }
            else if (t.selectedCardId === 2) { addCoconuts(t, 2); }
            else if (t.selectedCardId === 3) escapes[t.id] = true;
            else if (!t.selectedCardId) { t.hp = 0; logs[t.id] = ["超時未選擇，判定死亡"]; }
        });
        // ==============================================
        // 3. Finalization (死亡與逃跑結算)
        // ==============================================
        activeTeams.forEach(t => {
            if (t.hp <= 0) {
                t.roundCoconuts = 0;
                t.hp = 100;
                // t.status = "active";
                t.debuffs.golemCurseDmg = 0; // 死掉清除異常
                if (t.debuffs.crabNextEncounterDmg && !t.specialEscapeNoHealNoClearNoSave) t.debuffs.crabNextEncounterDmg = false; // 死掉清除
                t.debuffs.deathDoomCount = -1;
                t.lastActionLog = `${logs[t.id].join(', ')} -> 陣亡！椰子掉落，血量重置。`;
                this.addLog(`【${t.name}】陣亡了！目前椰子歸零，重新加入下一階段。`);
            } else if (escapes[t.id]) {
                if (t.specialEscapeNoHealNoClearNoSave) {
                    t.lastActionLog = `${logs[t.id].join(', ')} -> (巨翼龍特殊逃跑) 不回血、不清異常、不存椰子。`;
                    this.addLog(`【${t.name}】逃跑了，但因巨翼龍效果無法恢復！`);
                } else {
                    t.totalCoconuts += t.roundCoconuts;
                    let gained = t.roundCoconuts;
                    t.roundCoconuts = 0;
                    t.hp = 100;
                    t.debuffs.golemCurseDmg = 0; // 休息清除異常
                    t.debuffs.deathDoomCount = -1;
                    // crabNextEncounterDmg 只有特殊說明不能清，所以這裡正常是可以清的，但題意說"此次休息整備不能移除異常"，是指螃蟹卡3本身
                    // 所以螃蟹印記不隨便清。
                    
                    t.lastActionLog = `${logs[t.id].join(', ')} -> 休息整備！帶走 ${gained} 椰子，血量重置。`;
                    this.addLog(`【${t.name}】休息整備，帶回 ${gained} 顆椰子，重新加入下一階段。`);
                }
            } else {
                t.lastActionLog = logs[t.id].length > 0 ? logs[t.id].join(', ') : "平安無事";
            }
            
            t.specialEscapeNoHealNoClearNoSave = false; // reset
        });

        this.state.phase = "ENCOUNTER_RESULT";
        this.checkRoundEnd(activeCountBefore);
    }

    checkRoundEnd(activeCountBefore) {
        // 沒有本輪結束機制，單純進入 ENCOUNTER_RESULT 等待下一隻怪
        this.saveState();
    }

    nextEncounter() {
        if (this.state.dragonRepeatTriggered) {
            // 插入一隻一樣的怪在下一個 index
            const currentMonsterIdx = this.state.monsterSequence[this.state.encounterIndex];
            this.state.monsterSequence.splice(this.state.encounterIndex + 1, 0, currentMonsterIdx);
            this.state.dragonRepeatTriggered = false;
            this.state.extraEncounters = (this.state.extraEncounters || 0) + 1;
            this.addLog("巨翼龍再次襲來！");
        }

        this.state.encounterIndex += 1;
        this.state.phase = "ENCOUNTER_BID";
        this.state.timeLeft = 99;
        
        this.state.teams.forEach(t => {
            t.selectedCardId = null;
            t.selectedTargetId = null;
            t.lastActionLog = "";
            
            // 處理大祭司死亡宣告
            if (t.debuffs.deathDoomCount > 0) {
                t.debuffs.deathDoomCount -= 1;
                if (t.debuffs.deathDoomCount === 0) {
                    t.hp = 100;
                    t.roundCoconuts = 0;
                    t.debuffs.golemCurseDmg = 0;
                    t.debuffs.crabNextEncounterDmg = false;
                    t.debuffs.deathDoomCount = -1;
                    this.addLog(`大祭司詛咒生效：【${t.name}】宣告死亡！椰子歸零，血量重置。`);
                }
            }
        });
        const m = this.getCurrentMonster();
        this.addLog(`遭遇第 ${this.state.encounterIndex + 1} 隻怪物：【${m.name}】`);
        this.saveState();
    }

    nextRound() {
        this.state.roundNum += 1;
        this.state.encounterIndex = 0;
        this.state.phase = "ENCOUNTER_BID";
        this.state.timeLeft = 99;
        this.state.extraEncounters = 0;
        
        // 生成新的原始序列
        let seq = Array.from({ length: MONSTERS.length }, (_, i) => i);
        for (let i = seq.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [seq[i], seq[j]] = [seq[j], seq[i]];
        }
        this.state.monsterSequence = seq;

        this.state.teams.forEach(t => {
            t.hp = 100;
            t.roundCoconuts = 0;
            t.status = "active";
            t.selectedCardId = null;
            t.selectedTargetId = null;
            t.lastActionLog = "";
            t.debuffs.golemCurseDmg = 0;
            t.debuffs.crabNextEncounterDmg = false;
            t.debuffs.deathDoomCount = -1;
        });

        const m = this.getCurrentMonster();
        this.addLog(`=== 全新遊戲開始 ===`);
        this.addLog(`遭遇第一隻怪物：【${m.name}】`);
        this.saveState();
    }

    overrideStats(teamId, hpOffset, coconutOffset) {
        const team = this.state.teams.find(t => t.id === teamId);
        if (team) {
            team.hp = Math.min(100, Math.max(0, team.hp + hpOffset));
            team.totalCoconuts = Math.max(0, team.totalCoconuts + coconutOffset);
            if (team.hp === 0 && team.status === "active") {
                team.status = "dead";
            }
            this.saveState();
        }
    }
}

window.GameEngine = GameEngine;
