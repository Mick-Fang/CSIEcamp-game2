const fs = require('fs');

const files = [
    {
        path: 'public/js/team.js',
        isTeam: true
    },
    {
        path: 'public/typhoon/js/team.js',
        isTeam: true
    },
    {
        path: 'public/js/projector.js',
        isTeam: false
    },
    {
        path: 'public/typhoon/js/projector.js',
        isTeam: false
    }
];

for (const file of files) {
    if (!fs.existsSync(file.path)) continue;
    let content = fs.readFileSync(file.path, 'utf8');

    // Fix the update animation issue
    const oldUpdateLogic = `    if (radarChart) {
        radarChart.data = data;
        radarChart.update();
    }`;
    
    const newUpdateLogic = `    if (radarChart) {
        const oldData = radarChart.data.datasets[0].data.join(',');
        const newData = data.datasets[0].data.join(',');
        if (oldData !== newData) {
            radarChart.data = data;
            radarChart.update();
        }
    }`;
    
    if (content.includes(oldUpdateLogic)) {
        content = content.replace(oldUpdateLogic, newUpdateLogic);
    }

    // Fix the color for team.js
    if (file.isTeam) {
        const oldAngle = `angleLines: { color: 'rgba(255, 255, 255, 0.2)' }`;
        const newAngle = `angleLines: { color: 'rgba(0, 0, 0, 0.1)' }`;
        
        const oldGrid = `grid: { color: 'rgba(255, 255, 255, 0.2)' }`;
        const newGrid = `grid: { color: 'rgba(0, 0, 0, 0.1)' }`;
        
        const oldLabels = `pointLabels: { color: '#f8fafc', font: { size: 10 } }`;
        const newLabels = `pointLabels: { color: '#333', font: { size: 11, weight: 'bold' } }`;
        
        content = content.replace(oldAngle, newAngle);
        content = content.replace(oldGrid, newGrid);
        content = content.replace(oldLabels, newLabels);
    }

    fs.writeFileSync(file.path, content, 'utf8');
}
console.log('Update logic and colors patched!');
