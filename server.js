const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 8765;
const PUBLIC_DIR = path.join(__dirname, 'public');

// ── 伺服器狀態 ──────────────────────────────────────────────
let gameState = {};
let teamActions = {};   // { "1": { cardId, targetId }, ... }
let readyTeams = [];    // [ "1", "3", "5", ... ]

let typhoonGameState = {};
let typhoonTeamActions = {};
let typhoonReadyTeams = [];

// ── MIME types ─────────────────────────────────────────────
const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js':   'application/javascript; charset=utf-8',
    '.css':  'text/css; charset=utf-8',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.gif':  'image/gif',
    '.svg':  'image/svg+xml',
    '.ico':  'image/x-icon',
    '.json': 'application/json'
};

// ── 取得區域網路 IP ─────────────────────────────────────────
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) return iface.address;
        }
    }
    return '127.0.0.1';
}

// ── 靜態檔案服務 ────────────────────────────────────────────
function serveFile(res, filePath) {
    const ext = path.extname(filePath).toLowerCase();
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
            return;
        }
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        res.end(data);
    });
}

// ── JSON helper ─────────────────────────────────────────────
function readBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => { try { resolve(JSON.parse(body)); } catch(e) { reject(e); } });
        req.on('error', reject);
    });
}

function sendJSON(res, data, status = 200) {
    const body = JSON.stringify(data);
    res.writeHead(status, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    });
    res.end(body);
}

// ── 請求處理 ────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
    const originalUrl = req.url.split('?')[0];
    const method = req.method;

    // ── CORS preflight
    if (method === 'OPTIONS') {
        res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' });
        res.end();
        return;
    }

    const PREFIX = '/csiecamp_game2';
    if (!originalUrl.startsWith(PREFIX)) {
        if (originalUrl === '/') {
            res.writeHead(302, { 'Location': PREFIX + '/host' });
            res.end();
            return;
        }
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found (Please access via ' + PREFIX + '/host)');
        return;
    }

    const url = originalUrl.substring(PREFIX.length) || '/';

    let isTyphoon = false;
    let pathUrl = url;
    if (url.startsWith('/typhoon')) {
        isTyphoon = true;
        pathUrl = url.substring('/typhoon'.length) || '/';
    }

    let currentGameState = isTyphoon ? typhoonGameState : gameState;
    let currentTeamActions = isTyphoon ? typhoonTeamActions : teamActions;
    let currentReadyTeams = isTyphoon ? typhoonReadyTeams : readyTeams;

    // ══ GET /api/state ══════════════════════════════════════
    if (method === 'GET' && pathUrl === '/api/state') {
        sendJSON(res, { game_state: currentGameState, team_actions: currentTeamActions, ready_teams: currentReadyTeams });
        return;
    }

    // ══ POST /api/state ══════════════════════════════════════
    if (method === 'POST' && pathUrl === '/api/state') {
        try {
            const data = await readBody(req);
            if (data.game_state !== undefined) {
                if (isTyphoon) typhoonGameState = data.game_state; else gameState = data.game_state;
            }
            if (data.clear_actions) {
                if (isTyphoon) typhoonTeamActions = {}; else teamActions = {};
            }
            if (data.clear_ready) {
                if (isTyphoon) typhoonReadyTeams = []; else readyTeams = [];
            }
            sendJSON(res, { status: 'ok' });
        } catch(e) {
            sendJSON(res, { error: 'bad request' }, 400);
        }
        return;
    }

    // ══ POST /api/ready ══════════════════════════════════════
    if (method === 'POST' && pathUrl === '/api/ready') {
        try {
            const data = await readBody(req);
            const id = String(data.teamId);
            if (isTyphoon) {
                if (!typhoonReadyTeams.includes(id)) typhoonReadyTeams.push(id);
                sendJSON(res, { status: 'ok', ready_teams: typhoonReadyTeams });
            } else {
                if (!readyTeams.includes(id)) readyTeams.push(id);
                sendJSON(res, { status: 'ok', ready_teams: readyTeams });
            }
        } catch(e) {
            sendJSON(res, { error: 'bad request' }, 400);
        }
        return;
    }

    // ══ POST /api/action ═════════════════════════════════════
    if (method === 'POST' && pathUrl === '/api/action') {
        try {
            const data = await readBody(req);
            const id = String(data.teamId);
            if (isTyphoon) typhoonTeamActions[id] = { cardId: data.cardId, targetId: data.targetId };
            else teamActions[id] = { cardId: data.cardId, targetId: data.targetId };
            sendJSON(res, { status: 'ok' });
        } catch(e) {
            sendJSON(res, { error: 'bad request' }, 400);
        }
        return;
    }

    // ══ Page routes ══════════════════════════════════════════
    const baseDir = isTyphoon ? path.join(PUBLIC_DIR, 'typhoon') : PUBLIC_DIR;
    if (pathUrl === '/host') return serveFile(res, path.join(baseDir, 'host.html'));
    if (pathUrl === '/projector') return serveFile(res, path.join(baseDir, 'projector.html'));
    if (pathUrl.startsWith('/team/')) return serveFile(res, path.join(baseDir, 'team.html'));

    // ══ Static files ══════════════════════════════════════════
    // Default to index for /
    const staticPath = pathUrl === '/' ? '/host.html' : pathUrl;
    const filePath = path.join(baseDir, staticPath);

    // Security: prevent path traversal
    if (!filePath.startsWith(PUBLIC_DIR)) {
        res.writeHead(403); res.end('Forbidden');
        return;
    }

    serveFile(res, filePath);
});

server.listen(PORT, '0.0.0.0', () => {
    const ip = getLocalIP();
    console.log('==========================================');
    console.log(`🌴 伺服器已啟動於 Port ${PORT} 🌴`);
    console.log('==========================================');
    console.log(`[主持人後台]: http://localhost:${PORT}/csiecamp_game2/host`);
    console.log(`[大螢幕投影]: http://localhost:${PORT}/csiecamp_game2/projector`);
    console.log(`[各小隊手機連線網址]:`);
    console.log(`👉 http://${ip}:${PORT}/csiecamp_game2/team/1`);
    console.log(`👉 (將 1 替換為 1~10 各小隊編號)`);
    console.log(`\n🌀 [Typhoon 模式]:`);
    console.log(`[主持人]: http://localhost:${PORT}/csiecamp_game2/typhoon/host`);
    console.log(`[大螢幕]: http://localhost:${PORT}/csiecamp_game2/typhoon/projector`);
    console.log(`[各小隊]: http://${ip}:${PORT}/csiecamp_game2/typhoon/team/1 (1~5)`);
    console.log('==========================================');
});
