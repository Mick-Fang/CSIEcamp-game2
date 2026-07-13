const fs = require('fs');

const updateData = {
  "走路椰": { hp: 40, atk: 50, def: 55, spa: 65, spd: 60, spe: 30, desc: "新手村雜魚。長著小腳的椰子，動作緩慢，防禦力僅靠薄薄的椰子皮。" },
  "椰蛋": { hp: 50, atk: 40, def: 80, spa: 60, spd: 45, spe: 40, desc: "初階物盾。尚未孵化/發芽的群聚椰子，外殼堅硬但攻擊力低落。" },
  "小椰怪": { hp: 45, atk: 75, def: 90, spa: 30, spd: 50, spe: 60, desc: "初階物理打手。脾氣暴躁的帶殼小怪，特攻極低，純靠椰殼撞擊。" },
  "妙蛙椰子": { hp: 60, atk: 65, def: 70, spa: 80, spd: 80, spe: 55, desc: "御三家初階。背上頂著一顆小椰子的幼體，各項能力均衡，潛力十足。" },
  "妙蛙椰草": { hp: 90, atk: 85, def: 95, spa: 110, spd: 110, spe: 75, desc: "御三家二階。椰子開始長出綠葉，特攻與特防顯著提升，適合持久戰。" },
  "三合一椰怪": { hp: 85, atk: 110, def: 160, spa: 150, spd: 120, spe: 90, desc: "進階重裝怪。三顆小椰怪吸附在一起，擁有極佳的物理防禦與特攻輸出。" },
  "妙蛙椰樹": { hp: 140, atk: 120, def: 150, spa: 180, spd: 180, spe: 110, desc: "御三家三階。背上的椰子樹完全長成，擁有高水準的雙防與特攻，全能型主力。" },
  "阿羅拉椰蛋樹": { hp: 180, atk: 160, def: 130, spa: 200, spd: 140, spe: 65, desc: "重砲法師。脖子極長的亞種，犧牲了速度，但換來了驚人的血量與特攻爆發力。" },
  "霸王椰": { hp: 220, atk: 250, def: 190, spa: 80, spd: 110, spe: 85, desc: "物理推土機。具有霸王龍基因的變異椰子，攻擊力逼近頂峰，只要近身就能秒殺對手。" },
  "椰神月": { hp: 250, atk: 140, def: 160, spa: 280, spd: 290, spe: 210, desc: "傳說神獸。吸收月光精華的遠古大魔神，特攻與特防近乎滿分，速度極快，屬於毀滅級存在。" }
};

// Also handle the typo in prompt "阿羅那椰蛋樹"
updateData["阿羅那椰蛋樹"] = updateData["阿羅拉椰蛋樹"];

const files = [
    "public/js/game.js",
    "public/typhoon/js/game.js"
];

for (const file of files) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');
    
    // We can evaluate the MONSTERS array, update it, and inject it back? 
    // Or we can just use regex to replace desc and add stats.
    
    for (const name in updateData) {
        const data = updateData[name];
        // find name: "xxx"
        // replace desc: "xxx" with desc: "new desc", stats: {hp: 40, ...}
        
        // This regex matches from name: "xxx" to the next cards: [
        const regex = new RegExp(`name:\\s*"${name}"[\\s\\S]*?desc:\\s*".*?"`, 'g');
        content = content.replace(regex, (match) => {
            // Replace the desc line
            let newStr = match.replace(/desc:\s*".*?"/, `desc: "${data.desc}",\n        stats: { hp: ${data.hp}, atk: ${data.atk}, def: ${data.def}, spa: ${data.spa}, spd: ${data.spd}, spe: ${data.spe} }`);
            return newStr;
        });
    }
    
    fs.writeFileSync(file, content, 'utf8');
}
console.log("Stats and descriptions updated in game.js!");
