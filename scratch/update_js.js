const fs = require('fs');

const renderChartCode = `
// ==========================================
// Radar Chart Rendering Logic
// ==========================================
let radarChart = null;

function renderRadarChart(canvasId, stats) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    if (!stats) return;

    // Define data points matching standard radar order
    const data = {
        labels: ['HP', '攻擊', '防禦', '速度', '特防', '特攻'],
        datasets: [{
            label: '數值',
            data: [stats.hp, stats.atk, stats.def, stats.spe, stats.spd, stats.spa],
            backgroundColor: 'rgba(245, 158, 11, 0.4)',
            borderColor: 'rgba(245, 158, 11, 1)',
            pointBackgroundColor: '#fff',
            pointBorderColor: 'rgba(245, 158, 11, 1)',
            borderWidth: 2,
        }]
    };

    const config = {
        type: 'radar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: { color: 'rgba(255, 255, 255, 0.2)' },
                    grid: { color: 'rgba(255, 255, 255, 0.2)' },
                    pointLabels: { color: '#f8fafc', font: { size: 10 } },
                    ticks: {
                        display: false,
                        min: 0,
                        max: 300,
                        stepSize: 50
                    }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    };

    if (radarChart) {
        radarChart.data = data;
        radarChart.update();
    } else {
        radarChart = new Chart(ctx, config);
    }
}
`;

const jsFiles = [
    {
        path: 'public/js/team.js',
        descTarget: 'document.getElementById("monster-desc").textContent = currentMonster.desc;',
        canvasId: 'monster-radar-chart',
        statsVar: 'currentMonster.stats'
    },
    {
        path: 'public/js/projector.js',
        descTarget: 'document.getElementById("proj-monster-desc").textContent = m.desc;',
        canvasId: 'proj-monster-radar-chart',
        statsVar: 'm.stats'
    },
    {
        path: 'public/typhoon/js/team.js',
        descTarget: 'document.getElementById("monster-desc").textContent = currentMonster.desc;',
        canvasId: 'monster-radar-chart',
        statsVar: 'currentMonster.stats'
    },
    {
        path: 'public/typhoon/js/projector.js',
        descTarget: 'document.getElementById("proj-monster-desc").textContent = m.desc;',
        canvasId: 'proj-monster-radar-chart',
        statsVar: 'm.stats'
    }
];

for (const f of jsFiles) {
    if (!fs.existsSync(f.path)) continue;
    let content = fs.readFileSync(f.path, 'utf8');
    
    // Inject renderChartCode if not present
    if (!content.includes('renderRadarChart')) {
        content += renderChartCode;
    }
    
    // Inject function call after descTarget
    const callStr = `renderRadarChart("${f.canvasId}", ${f.statsVar});`;
    if (!content.includes(callStr)) {
        content = content.replace(f.descTarget, f.descTarget + '\n            ' + callStr);
    }
    
    fs.writeFileSync(f.path, content, 'utf8');
}
console.log('JS files updated.');
