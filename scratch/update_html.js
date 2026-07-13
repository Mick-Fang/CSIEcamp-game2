const fs = require('fs');

const files = [
    'public/team.html',
    'public/projector.html',
    'public/typhoon/team.html',
    'public/typhoon/projector.html'
];

const chartScript = '<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>';

for (const file of files) {
    if (!fs.existsSync(file)) continue;
    let html = fs.readFileSync(file, 'utf8');
    
    // Inject Chart.js script if not present
    if (!html.includes('chart.js')) {
        html = html.replace('</head>', '    ' + chartScript + '\n</head>');
    }
    
    // Modify team.html layout
    if (file.includes('team.html')) {
        const targetImgHtml = `<img id="monster-img" class="monster-img" src="" alt="Monster">`;
        const newHtml = `
            <div style="display: flex; flex-direction: row; align-items: center; justify-content: space-around; margin-bottom: 1rem; width: 100%;">
                <img id="monster-img" class="monster-img" src="" alt="Monster" style="width: 45%; max-width: 120px; height: auto; aspect-ratio: 1/1; margin: 0;">
                <div style="width: 50%; max-width: 150px; aspect-ratio: 1/1;">
                    <canvas id="monster-radar-chart"></canvas>
                </div>
            </div>`;
        html = html.replace(targetImgHtml, newHtml);
    }
    
    // Modify projector.html layout
    if (file.includes('projector.html')) {
        const targetImgHtml = `<img id="proj-monster-img" src="" alt="Monster" style="width: 100px; height: 100px; object-fit: cover; border-radius: 12px; border: 3px solid var(--danger-red); box-shadow: 0 5px 15px rgba(239,68,68,0.3);">`;
        const newHtml = `
                        <div style="display: flex; flex-direction: row; align-items: center; justify-content: center; gap: 1rem;">
                            <img id="proj-monster-img" src="" alt="Monster" style="width: 120px; height: 120px; object-fit: cover; border-radius: 12px; border: 3px solid var(--danger-red); box-shadow: 0 5px 15px rgba(239,68,68,0.3);">
                            <div style="width: 150px; height: 150px;">
                                <canvas id="proj-monster-radar-chart"></canvas>
                            </div>
                        </div>`;
        html = html.replace(targetImgHtml, newHtml);
    }
    
    fs.writeFileSync(file, html, 'utf8');
}
console.log('HTML files updated.');
