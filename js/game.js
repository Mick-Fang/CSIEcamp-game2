// 椰子怪討伐戰 2.0 (生存逃脫模式) - 核心遊戲引擎

const MONSTERS = [
    {
        name: "椰漿軟泥酋長",
        img: "assets/slime_chief.png",
        desc: "由濃稠椰奶聚合而成的果凍狀怪物。",
        cards: [
            { id: 1, desc: "如果這個選項最多人選，受到10點傷害。獲得一顆椰子", escape: false },
            { id: 2, desc: "如果這個選項最少人選，受到20點傷害。獲得兩顆椰子", escape: false },
            { id: 3, desc: "如果這個選項最多人選，受到30點傷害。獲得三顆椰子", escape: false },
            { id: 4, desc: "如果這個選項最少人選，受到40點傷害。逃跑。", escape: true }
        ]
    },
    {
        name: "椰殼小妖頭目",
        img: "assets/goblin_chief.png",
        desc: "喜歡成群結隊在沙灘上惡作劇。",
        cards: [
            { id: 1, desc: "受到15點傷害。獲得一顆椰子", escape: false },
            { id: 2, desc: "選擇這個選項的人共同分攤35點傷害。獲得兩顆椰子", escape: false },
            { id: 3, desc: "如果所有人都選這個選項，受到55點傷害。獲得三顆椰子", escape: false },
            { id: 4, desc: "選擇這個選項的人共同分攤75點傷害。逃跑。", escape: true }
        ]
    },
    {
        name: "狂野椰棕猛獸",
        img: "assets/beast_king.png",
        desc: "披著厚重椰棕的叢林巨獸。",
        cards: [
            { id: 1, desc: "受到20點傷害。獲得一顆椰子", escape: false },
            { id: 2, desc: "如果這回合有至少1人選擇逃跑，受到40點傷害。獲得兩顆椰子", escape: false },
            { id: 3, desc: "如果這回合有至少2人選擇逃跑，受到80點傷害。獲得三顆椰子", escape: false },
            { id: 4, desc: "受到10點傷害。逃跑。", escape: true }
        ]
    },
    {
        name: "鐵殼椰核食人魔",
        img: "assets/troll_ogre.png",
        desc: "以堅硬無比的椰核為核心變異而成。",
        cards: [
            { id: 1, desc: "如果這個選項有奇數個人選，受到25傷害。獲得一顆椰子", escape: false },
            { id: 2, desc: "如果這個選項有偶數個人選，受到50傷害。獲得兩顆椰子", escape: false },
            { id: 3, desc: "如果這個選項有至少2人選，受到75傷害。獲得三顆椰子", escape: false },
            { id: 4, desc: "如果這個選項有至少2人選，受到100傷害。逃跑。", escape: true }
        ]
    },
    {
        name: "遠古珊瑚椰石像",
        img: "assets/coral_golem.png",
        desc: "長滿青苔的巨大摩艾石像。",
        cards: [
            { id: 1, desc: "(整個遊戲中)累計10個隊伍選擇此選項後，受到100傷害。獲得一顆椰子", escape: false },
            { id: 2, desc: "(整個遊戲中)累計8個隊伍選擇此選項後，受到80傷害。獲得兩顆椰子", escape: false },
            { id: 3, desc: "(整個遊戲中)累計6個隊伍選擇此選項後，下隻怪物造成的一切傷害永久+20。獲得三顆椰子", escape: false },
            { id: 4, desc: "(整個遊戲中)累計4個隊伍選擇此選項後，下隻怪物技能卡1造成的傷害永久+20。逃跑。", escape: true }
        ]
    },
    {
        name: "黑潮椰蟹騎士",
        img: "assets/crab_rider.png",
        desc: "騎乘深海椰子蟹的怨靈。",
        cards: [
            { id: 1, desc: "選擇此技能卡的隊伍中，椰子最多的那隊受到35傷害。獲得一顆椰子。", escape: false },
            { id: 2, desc: "選擇此技能卡的隊伍中，椰子最少的那隊受到70傷害。獲得兩顆椰子。", escape: false },
            { id: 3, desc: "本輪遊戲中你下次受到的傷害翻倍。獲得三顆椰子", escape: false },
            { id: 4, desc: "每個選擇此選項的人各自對所有人造成10點傷害。逃跑。", escape: true }
        ]
    },
    {
        name: "風暴椰鱗巨翼龍",
        img: "assets/storm_dragon.png",
        desc: "拍打翅膀時會捲起熱帶風暴。",
        cards: [
            { id: 1, desc: "受到15點傷害。獲得一顆椰子", escape: false },
            { id: 2, desc: "受到5點傷害。本輪遊戲中你受到的一切傷害+5。獲得兩顆椰子", escape: false },
            { id: 3, desc: "受到35傷害，如果這個選項沒人選，再打一次風暴椰鱗巨翼龍。獲得三顆椰子", escape: false },
            { id: 4, desc: "受到35點傷害，逃跑。其他隊伍再打一次風暴椰鱗巨翼龍。", escape: true }
        ]
    },
    {
        name: "枯朽椰骸大祭司",
        img: "assets/skeleton_priest.png",
        desc: "枯死椰子樹與白骨結合的祭司。",
        cards: [
            { id: 1, desc: "受到40點傷害。下隻怪物若你選擇技能卡1，額外受到40點傷害。獲得一顆椰子", escape: false },
            { id: 2, desc: "受到40點傷害。下隻怪物若你不選擇技能卡2，額外受到40點傷害。獲得兩顆椰子", escape: false },
            { id: 3, desc: "若你不是選擇此選項的隊伍中血量剩最少的，受到80傷害。獲得三顆椰子", escape: false },
            { id: 4, desc: "每隊選擇一個已逃跑或陣亡的隊伍以40點血量復活，受到40點傷害。逃跑。", escape: true, requireTarget: true }
        ]
    },
    {
        name: "海溝腐椰海神",
        img: "assets/abyss_sea_god.png",
        desc: "沉入深海吸收怨念的巨大腐爛椰子。",
        cards: [
            { id: 1, desc: "如果選這個選項的隊伍比選2的多，沒選這個選項的隊伍受到50點傷害。獲得一顆椰子", escape: false },
            { id: 2, desc: "如果選這個選項的隊伍比選1的多，沒選這個選項的隊伍受到40點傷害。獲得兩顆椰子", escape: false },
            { id: 3, desc: "每個選擇此選項的隊伍各自對其指定一隊造成10點傷害(選擇時同時寫上指定隊伍)。獲得三顆椰子", escape: false, requireTarget: true },
            { id: 4, desc: "受到30傷害。下輪遊戲中，若你遇到海溝腐椰海神，你額外受到30點傷害。逃跑。", escape: true }
        ]
    },
    {
        name: "終焉滅世巨椰祖靈",
        img: "assets/final_boss_ancestor.png",
        desc: "一切椰子的起源，神話級巨型椰子。",
        cards: [
            { id: 1, desc: "如果沒人選這個選項，所有人受到90傷害。獲得一顆椰子", escape: false },
            { id: 2, desc: "如果沒人選這個選項，所有人受到90傷害。獲得兩顆椰子", escape: false },
            { id: 3, desc: "如果沒人選這個選項，所有人受到90傷害。獲得三顆椰子", escape: false },
            { id: 4, desc: "如果沒人選這個選項，所有人受到90傷害。逃跑。", escape: true }
        ]
    },
    {
        cards: [
            { id: 1, desc: "如果沒人選這個選項，所有人受到90傷害。獲得一顆椰子", escape: false },
            { id: 2, desc: "如果沒人選這個選項，所有人受到90傷害。獲得兩顆椰子", escape: false },
            { id: 3, desc: "如果沒人選這個選項，所有人受到90傷害。獲得三顆椰子", escape: false },
            { id: 4, desc: "如果沒人選這個選項，所有人受到90傷害。逃跑。", escape: true }
        ]
    },
    {
        name: "椰子寶箱怪",
        img: "assets/coconut_mimic.png",
        desc: "偽裝成椰子的貪婪寶箱。",
        cards: [
            { id: 1, desc: "血量+30。獲得一顆椰子。", escape: false },
            { id: 2, desc: "每個選擇此選項的隊伍指定另一人回滿血。獲得兩顆椰子。", escape: false, requireTarget: true },
            { id: 3, desc: "每個選擇此選項的隊伍指定另一人+3$。獲得三顆椰子。", escape: false, requireTarget: true },
            { id: 4, desc: "失去3顆椰子。逃跑。", escape: true }
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
            crabDoubleNextBoss: false,
            dragonExtraDmg: 0,
            priestNextOpt1Dmg: false,
            priestNextNotOpt2Dmg: false,
            seaGodCurse: 0
        }
    })),
    roundNum: 1,
    monsterSequence: [], // 固定隨機序列
    encounterIndex: 0, // 目前打到第幾隻 (長度可能因巨翼龍改變)
    phase: "SETUP", // SETUP, ENCOUNTER_BID, ENCOUNTER_RESULT, ROUND_END
    battleLogs: [],
    
    // Global Persistent States
    golemCounters: { opt1: 0, opt2: 0, opt3: 0, opt4: 0 },
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
                crabDoubleNextBoss: false,
                dragonExtraDmg: 0,
                priestNextOpt1Dmg: false,
                priestNextNotOpt2Dmg: false,
                seaGodCurse: 0
            };
        });
        
        let seq = [];
        if (!gameStartedBefore) {
            const firstNames = [
                "椰漿軟泥酋長", "椰殼小妖頭目", "狂野椰棕猛獸", "鐵殼椰核食人魔", 
                "遠古珊瑚椰石像", "椰子寶箱怪", "黑潮椰蟹騎士", "風暴椰鱗巨翼龍", 
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
            const mimicIdx = MONSTERS.findIndex(m => m.name === "椰子寶箱怪");
            if (seq[0] === mimicIdx) {
                [seq[0], seq[1]] = [seq[1], seq[0]];
            }
        }
        
        this.state.monsterSequence = seq;
        this.state.gameStartedBefore = gameStartedBefore;
        this.state.roundNum = 1;
        this.state.encounterIndex = 0;
        this.state.phase = "ENCOUNTER_BID";
        this.state.battleLogs = ["遊戲開始！已生成怪物序列。"];
        this.addLog(`第 1 回合開始，遭遇第一隻怪物！`);
        this.saveState();
    }

    getCurrentMonster() {
        if (this.state.monsterSequence.length === 0) return null;
        const idx = this.state.monsterSequence[this.state.encounterIndex];
        return MONSTERS[idx];
    }

    getNextMonsterIndexInSequence() {
        const curSeqPos = this.state.encounterIndex;
        if (curSeqPos + 1 < this.state.monsterSequence.length) {
            return this.state.monsterSequence[curSeqPos + 1];
        }
        return null;
    }

    submitCards(cardSelections) {
        const monster = this.getCurrentMonster();
        if (!monster) return;

        let damages = {};
        let coconuts = {};
        let escapes = {};
        let logs = {};

        let activeCountBefore = 0;
        const activeTeams = this.state.teams.filter(t => t.status === "active");

        activeTeams.forEach(t => {
            activeCountBefore++;
            damages[t.id] = 0;
            coconuts[t.id] = 0;
            escapes[t.id] = false;
            logs[t.id] = [];
            
            const sel = cardSelections[t.id];
            if (sel) {
                t.selectedCardId = parseInt(sel.cardId);
                t.selectedTargetId = sel.targetId ? parseInt(sel.targetId) : null;
            }

            // 提前結算原本就有的海神詛咒，避免吃到當回合剛獲得的新詛咒
            if (monster.name === "海溝腐椰海神" && t.debuffs.seaGodCurse > 0) {
                damages[t.id] += t.debuffs.seaGodCurse;
                logs[t.id].push(`海神詛咒發作(+${t.debuffs.seaGodCurse})`);
            }
        });

        // 1. 計算選項統計
        let counts = { 1: 0, 2: 0, 3: 0, 4: 0 };
        activeTeams.forEach(t => {
            if (t.selectedCardId) counts[t.selectedCardId]++;
        });
        
        let maxVotes = -1;
        let minVotes = 999;
        Object.keys(counts).forEach(k => {
            if (counts[k] > maxVotes) maxVotes = counts[k];
            if (counts[k] > 0 && counts[k] < minVotes) minVotes = counts[k];
        });

        this.state.dragonRepeatTriggered = false;

        // 2. 處理怪物專屬邏輯
        switch(monster.name) {
            case "椰漿軟泥酋長":
                activeTeams.forEach(t => {
                    const cid = t.selectedCardId;
                    if (!cid) return;
                    if (cid === 1) { coconuts[t.id] += 1; if (counts[1] === maxVotes) damages[t.id] += 10; }
                    else if (cid === 2) { coconuts[t.id] += 2; if (counts[2] === minVotes) damages[t.id] += 20; }
                    else if (cid === 3) { coconuts[t.id] += 3; if (counts[3] === maxVotes) damages[t.id] += 30; }
                    else if (cid === 4) { escapes[t.id] = true; if (counts[4] === minVotes) damages[t.id] += 40; }
                });
                break;

            case "椰殼小妖頭目":
                activeTeams.forEach(t => {
                    const cid = t.selectedCardId;
                    if (!cid) return;
                    if (cid === 1) { coconuts[t.id] += 1; damages[t.id] += 15; }
                    else if (cid === 2) { coconuts[t.id] += 2; damages[t.id] += Math.round(35 / counts[2]); }
                    else if (cid === 3) { coconuts[t.id] += 3; if (counts[3] === activeTeams.length) damages[t.id] += 55; }
                    else if (cid === 4) { escapes[t.id] = true; damages[t.id] += Math.round(75 / counts[4]); }
                });
                break;

            case "狂野椰棕猛獸":
                let someoneEscaped = counts[4] >= 1;
                let twoEscaped = counts[4] >= 2;
                activeTeams.forEach(t => {
                    const cid = t.selectedCardId;
                    if (!cid) return;
                    if (cid === 1) { coconuts[t.id] += 1; damages[t.id] += 20; }
                    else if (cid === 2) { coconuts[t.id] += 2; if (someoneEscaped) damages[t.id] += 40; }
                    else if (cid === 3) { coconuts[t.id] += 3; if (twoEscaped) damages[t.id] += 80; }
                    else if (cid === 4) { escapes[t.id] = true; damages[t.id] += 10; }
                });
                break;

            case "鐵殼椰核食人魔":
                activeTeams.forEach(t => {
                    const cid = t.selectedCardId;
                    if (!cid) return;
                    if (cid === 1) { coconuts[t.id] += 1; if (counts[1] % 2 !== 0) damages[t.id] += 25; }
                    else if (cid === 2) { coconuts[t.id] += 2; if (counts[2] > 0 && counts[2] % 2 === 0) damages[t.id] += 50; }
                    else if (cid === 3) { coconuts[t.id] += 3; if (counts[3] >= 2) damages[t.id] += 75; }
                    else if (cid === 4) { escapes[t.id] = true; if (counts[4] >= 2) damages[t.id] += 100; }
                });
                break;

            case "遠古珊瑚椰石像":
                activeTeams.forEach(t => {
                    const cid = t.selectedCardId;
                    if (!cid) return;
                    
                    if (cid === 1) {
                        this.state.golemCounters.opt1++;
                        coconuts[t.id] += 1;
                        if (this.state.golemCounters.opt1 >= 10) damages[t.id] += 100;
                    }
                    else if (cid === 2) {
                        this.state.golemCounters.opt2++;
                        coconuts[t.id] += 2;
                        if (this.state.golemCounters.opt2 >= 8) damages[t.id] += 80;
                    }
                    else if (cid === 3) {
                        this.state.golemCounters.opt3++;
                        coconuts[t.id] += 3;
                        if (this.state.golemCounters.opt3 >= 6) {
                            const nextIdx = this.getNextMonsterIndexInSequence();
                            if (nextIdx !== null) {
                                if (!this.state.globalBuffs[nextIdx]) this.state.globalBuffs[nextIdx] = { all: 0, opt1: 0 };
                                this.state.globalBuffs[nextIdx].all += 20;
                            }
                        }
                    }
                    else if (cid === 4) {
                        this.state.golemCounters.opt4++;
                        escapes[t.id] = true;
                        if (this.state.golemCounters.opt4 >= 4) {
                            const nextIdx = this.getNextMonsterIndexInSequence();
                            if (nextIdx !== null) {
                                if (!this.state.globalBuffs[nextIdx]) this.state.globalBuffs[nextIdx] = { all: 0, opt1: 0 };
                                this.state.globalBuffs[nextIdx].opt1 += 20;
                            }
                        }
                    }
                });
                break;

            case "黑潮椰蟹騎士":
                let crabAoeDamage = 0;
                let opt1Teams = activeTeams.filter(t => t.selectedCardId === 1);
                let opt2Teams = activeTeams.filter(t => t.selectedCardId === 2);
                
                let maxCoco = -1;
                opt1Teams.forEach(t => { const c = t.totalCoconuts + t.roundCoconuts; if(c > maxCoco) maxCoco = c; });
                
                let minCoco = 99999;
                opt2Teams.forEach(t => { const c = t.totalCoconuts + t.roundCoconuts; if(c < minCoco) minCoco = c; });

                activeTeams.forEach(t => {
                    const cid = t.selectedCardId;
                    if (!cid) return;
                    if (cid === 1) { 
                        coconuts[t.id] += 1; 
                        if ((t.totalCoconuts + t.roundCoconuts) === maxCoco) damages[t.id] += 35; 
                    }
                    else if (cid === 2) { 
                        coconuts[t.id] += 2; 
                        if ((t.totalCoconuts + t.roundCoconuts) === minCoco) damages[t.id] += 70; 
                    }
                    else if (cid === 3) { coconuts[t.id] += 3; t.debuffs.crabDoubleNextBoss = true; logs[t.id].push("下次受傷翻倍"); }
                    else if (cid === 4) { escapes[t.id] = true; crabAoeDamage += 10; logs[t.id].push("對所有人造成10傷害"); }
                });
                if (crabAoeDamage > 0) {
                    activeTeams.forEach(t => { damages[t.id] += crabAoeDamage; });
                }
                break;

            case "風暴椰鱗巨翼龍":
                if (counts[3] === 0 || counts[4] > 0) {
                    this.state.dragonRepeatTriggered = true;
                }

                activeTeams.forEach(t => {
                    const cid = t.selectedCardId;
                    if (!cid) return;
                    if (cid === 1) { coconuts[t.id] += 1; damages[t.id] += 15; }
                    else if (cid === 2) { coconuts[t.id] += 2; damages[t.id] += 5; t.debuffs.dragonExtraDmg += 5; }
                    else if (cid === 3) { coconuts[t.id] += 3; damages[t.id] += 35; }
                    else if (cid === 4) { escapes[t.id] = true; damages[t.id] += 35; }
                });
                break;

            case "枯朽椰骸大祭司":
                let minHp = 999;
                activeTeams.forEach(t => { if (t.selectedCardId === 3 && t.hp < minHp) minHp = t.hp; });

                activeTeams.forEach(t => {
                    const cid = t.selectedCardId;
                    if (!cid) return;

                    if (cid === 1) { coconuts[t.id] += 1; damages[t.id] += 40; t.debuffs.priestNextOpt1Dmg = true; }
                    else if (cid === 2) { coconuts[t.id] += 2; damages[t.id] += 40; t.debuffs.priestNextNotOpt2Dmg = true; }
                    else if (cid === 3) { coconuts[t.id] += 3; if (t.hp > minHp) damages[t.id] += 80; }
                    else if (cid === 4) { 
                        escapes[t.id] = true; damages[t.id] += 40;
                        if (t.selectedTargetId) {
                            const targetTeam = this.state.teams.find(tm => tm.id === t.selectedTargetId);
                            if (targetTeam && targetTeam.status !== "active") {
                                targetTeam.status = "active";
                                targetTeam.hp = 40;
                                targetTeam.roundCoconuts = 0;
                                logs[t.id].push(`復活了 ${targetTeam.name}`);
                                this.addLog(`大祭司巫術：【${targetTeam.name}】被復活了！`);
                            }
                        }
                    }
                });
                break;

            case "海溝腐椰海神":
                activeTeams.forEach(t => {
                    const cid = t.selectedCardId;
                    if (!cid) return;

                    if (cid === 1) { 
                        coconuts[t.id] += 1; 
                        if (counts[1] > counts[2]) {
                            activeTeams.forEach(otherT => { if (otherT.selectedCardId !== 1) damages[otherT.id] += 50; });
                        }
                    }
                    else if (cid === 2) {
                        coconuts[t.id] += 2;
                        if (counts[2] > counts[1]) {
                            activeTeams.forEach(otherT => { if (otherT.selectedCardId !== 2) damages[otherT.id] += 40; });
                        }
                    }
                    else if (cid === 3) {
                        coconuts[t.id] += 3;
                        if (t.selectedTargetId && damages[t.selectedTargetId] !== undefined) {
                            damages[t.selectedTargetId] += 10;
                            logs[t.id].push(`指定小隊 ${t.selectedTargetId} 受傷`);
                        }
                    }
                    else if (cid === 4) {
                        escapes[t.id] = true; damages[t.id] += 30;
                        t.debuffs.seaGodCurse += 30;
                    }
                });
                break;

            case "椰子寶箱怪":
                let mimicHealTargets = [];
                let mimicCocoTargets = [];
                activeTeams.forEach(t => {
                    const cid = t.selectedCardId;
                    if (!cid) return;
                    if (cid === 1) { 
                        coconuts[t.id] += 1; 
                        damages[t.id] -= 30; // negative damage is healing
                        logs[t.id].push("回復30血量");
                    }
                    else if (cid === 2) { 
                        coconuts[t.id] += 2;
                        if (t.selectedTargetId) {
                            mimicHealTargets.push(t.selectedTargetId);
                            logs[t.id].push(`指定第${t.selectedTargetId}隊回滿血`);
                        }
                    }
                    else if (cid === 3) { 
                        coconuts[t.id] += 3;
                        if (t.selectedTargetId) {
                            mimicCocoTargets.push(t.selectedTargetId);
                            logs[t.id].push(`指定第${t.selectedTargetId}隊獲得3顆椰子`);
                        }
                    }
                    else if (cid === 4) { 
                        escapes[t.id] = true; 
                        coconuts[t.id] -= 3;
                        logs[t.id].push("失去3顆椰子並逃跑");
                    }
                });
                mimicHealTargets.forEach(tid => {
                    const target = activeTeams.find(x => x.id === tid);
                    if (target) {
                        target.pendingHealFull = true;
                        if(!logs[tid]) logs[tid] = [];
                        logs[tid].push("被指定回滿血");
                    }
                });
                mimicCocoTargets.forEach(tid => {
                    const target = activeTeams.find(x => x.id === tid);
                    if (target) {
                        if(coconuts[tid] === undefined) coconuts[tid] = 0;
                        coconuts[tid] += 3;
                        if(!logs[tid]) logs[tid] = [];
                        logs[tid].push("被指定獲得3顆椰子");
                    }
                });
                break;

            case "終焉滅世巨椰祖靈":
                let ancestorDamage = 0;
                if (counts[1] === 0) ancestorDamage += 90;
                if (counts[2] === 0) ancestorDamage += 90;
                if (counts[3] === 0) ancestorDamage += 90;
                if (counts[4] === 0) ancestorDamage += 90;

                activeTeams.forEach(t => {
                    const cid = t.selectedCardId;
                    if (!cid) return;
                    if (cid === 1) { coconuts[t.id] += 1; }
                    else if (cid === 2) { coconuts[t.id] += 2; }
                    else if (cid === 3) { coconuts[t.id] += 3; }
                    else if (cid === 4) { escapes[t.id] = true; }
                    damages[t.id] += ancestorDamage;
                });
                if (ancestorDamage > 0) this.addLog(`祖靈震怒：所有人承受 ${ancestorDamage} 點毀滅傷害！`);
                break;
        }

        // 3. 統一扣血與結算
        const monsterIdx = this.state.monsterSequence[this.state.encounterIndex];
        const globalBuff = this.state.globalBuffs[monsterIdx];

        activeTeams.forEach(t => {
            const cid = t.selectedCardId;
            if (!cid) { t.lastActionLog = "未選擇有效卡片"; return; }

            // 石像加成
            if (globalBuff) {
                if (globalBuff.all > 0) { damages[t.id] += globalBuff.all; logs[t.id].push(`石像共鳴(+${globalBuff.all})`); }
                if (globalBuff.opt1 > 0 && cid === 1) { damages[t.id] += globalBuff.opt1; logs[t.id].push(`石像共鳴(+${globalBuff.opt1})`); }
            }

            // 祭司加成
            if (t.debuffs.priestNextOpt1Dmg && cid === 1) { damages[t.id] += 40; logs[t.id].push(`祭司詛咒(+40)`); }
            if (t.debuffs.priestNextNotOpt2Dmg && cid !== 2) { damages[t.id] += 40; logs[t.id].push(`祭司詛咒(+40)`); }
            t.debuffs.priestNextOpt1Dmg = false;
            t.debuffs.priestNextNotOpt2Dmg = false;

            // 巨翼龍加成
            if (t.debuffs.dragonExtraDmg > 0 && damages[t.id] > 0) { damages[t.id] += t.debuffs.dragonExtraDmg; }

            // 螃蟹翻倍
            if (t.debuffs.crabDoubleNextBoss && damages[t.id] > 0) {
                damages[t.id] *= 2;
                logs[t.id].push(`螃蟹印記: 傷害翻倍!`);
            }
            t.debuffs.crabDoubleNextBoss = false;

            // 執行傷害
            if (damages[t.id] > 0) {
                t.hp -= damages[t.id];
                logs[t.id].unshift(`受到 ${damages[t.id]} 傷害`);
            }

            if (t.hp <= 0) {
                t.hp = 0;
                t.status = "dead";
                t.roundCoconuts = 0;
                t.lastActionLog = `${logs[t.id].join(', ')} -> 陣亡！`;
                this.addLog(`【${t.name}】陣亡了！`);
            } else {
                if (coconuts[t.id] > 0) {
                    t.roundCoconuts += coconuts[t.id];
                    logs[t.id].push(`+${coconuts[t.id]}$`);
                }
                if (escapes[t.id]) {
                    t.status = "escaped";
                    t.totalCoconuts += t.roundCoconuts;
                    t.lastActionLog = `${logs[t.id].join(', ')} -> 安全撤退！帶走 ${t.roundCoconuts}$`;
                    this.addLog(`【${t.name}】成功逃跑，帶回 ${t.roundCoconuts} 顆椰子！`);
                } else {
                    t.lastActionLog = logs[t.id].length > 0 ? logs[t.id].join(', ') : "平安無事";
                }
            }
        });

        this.state.phase = "ENCOUNTER_RESULT";
        this.checkRoundEnd(activeCountBefore);
    }

    checkRoundEnd(activeCountBefore) {
        const activeTeams = this.state.teams.filter(t => t.status === "active");
        
        if (activeTeams.length === 1 && activeCountBefore > 1) {
            const lastTeam = activeTeams[0];
            lastTeam.status = "escaped";
            lastTeam.totalCoconuts += lastTeam.roundCoconuts;
            this.addLog(`【${lastTeam.name}】是最後倖存者，自動帶走 ${lastTeam.roundCoconuts} 顆椰子！本輪結束。`);
            this.state.phase = "ROUND_END";
        } else if (activeTeams.length === 0) {
            this.addLog("所有隊伍皆已撤退或陣亡，本輪結束。");
            this.state.phase = "ROUND_END";
        } else if (!this.state.dragonRepeatTriggered && this.state.encounterIndex >= this.state.monsterSequence.length - 1) {
            this.addLog("所有怪物已全部出現！存活隊伍凱旋而歸，本輪結束。");
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
        if (this.state.dragonRepeatTriggered) {
            // 插入一隻一樣的怪在下一個 index
            const currentMonsterIdx = this.state.monsterSequence[this.state.encounterIndex];
            this.state.monsterSequence.splice(this.state.encounterIndex + 1, 0, currentMonsterIdx);
            this.state.dragonRepeatTriggered = false;
            this.addLog("巨翼龍再次襲來！");
        }

        this.state.encounterIndex += 1;
        this.state.phase = "ENCOUNTER_BID";
        this.state.teams.forEach(t => {
            t.selectedCardId = null;
            t.selectedTargetId = null;
            t.lastActionLog = "";
        });
        const m = this.getCurrentMonster();
        this.addLog(`遭遇第 ${this.state.encounterIndex + 1} 隻怪物：【${m.name}】`);
        this.saveState();
    }

    nextRound() {
        this.state.roundNum += 1;
        this.state.encounterIndex = 0;
        this.state.phase = "ENCOUNTER_BID";
        
        // 生成新的原始序列
        let seq = Array.from({ length: 10 }, (_, i) => i);
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
            t.debuffs.dragonExtraDmg = 0; // reset
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
