const fs = require('fs');

const mapping = {
    "椰漿軟泥酋長": "妙蛙椰子",
    "椰殼小妖頭目": "妙蛙椰草",
    "狂野椰棕猛獸": "妙蛙椰樹",
    "鐵殼椰核食人魔": "椰蛋",
    "遠古珊瑚椰石像": "小椰怪",
    "黑潮椰蟹騎士": "三合一椰怪",
    "風暴椰鱗巨翼龍": "阿羅拉椰蛋樹",
    "枯朽椰骸大祭司": "霸王椰",
    "海溝腐椰海神": "走路椰",
    "終焉滅世巨椰祖靈": "椰神月"
};

const img_mapping = {
    "妙蛙椰子": "assets/1.jpg",
    "妙蛙椰草": "assets/3.jpg",
    "妙蛙椰樹": "assets/2.jpg",
    "椰蛋": "assets/9.jpg",
    "小椰怪": "assets/5.jpg",
    "三合一椰怪": "assets/8.jpg",
    "阿羅拉椰蛋樹": "assets/7-1.jpg",
    "霸王椰": "assets/6.jpg",
    "走路椰": "assets/4.jpg",
    "椰神月": "assets/10.jpg"
};

const old_img_mapping = {
    "妙蛙椰子": "assets/slime_chief.png",
    "妙蛙椰草": "assets/goblin_chief.png",
    "妙蛙椰樹": "assets/beast_king.png",
    "椰蛋": "assets/troll_ogre.png",
    "小椰怪": "assets/coral_golem.png",
    "三合一椰怪": "assets/crab_rider.png",
    "阿羅拉椰蛋樹": "assets/storm_dragon.png",
    "霸王椰": "assets/skeleton_priest.png",
    "走路椰": "assets/abyss_sea_god.png",
    "椰神月": "assets/final_boss_ancestor.png"
};

const files = [
    "public/js/game.js",
    "public/js/host.js",
    "public/js/team.js"
];

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace names
    for (const [oldName, newName] of Object.entries(mapping)) {
        content = content.split(oldName).join(newName);
    }
    
    // Replace images
    for (const [newName, newImg] of Object.entries(img_mapping)) {
        const oldImg = old_img_mapping[newName];
        content = content.split(oldImg).join(newImg);
    }
    
    fs.writeFileSync(file, content, 'utf8');
}
console.log('Names and images updated!');
