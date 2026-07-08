import http.server
import socketserver
import json
import os
import socket

PORT = 8765

# Server State
game_state = {}
team_actions = {}
ready_teams = []

class GameRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory="public", **kwargs)

    def do_GET(self):
        if self.path == '/api/state' or self.path == '/csiecamp_game2/api/state':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {
                "game_state": game_state,
                "team_actions": team_actions,
                "ready_teams": ready_teams
            }
            self.wfile.write(json.dumps(response).encode('utf-8'))
            return
        
        # Route /team/X to /team.html
        if self.path.startswith('/team/') or self.path.startswith('/csiecamp_game2/team/'):
            self.path = '/team.html'
            return super().do_GET()
        
        if self.path == '/host' or self.path == '/csiecamp_game2/host':
            self.path = '/host.html'
            return super().do_GET()
            
        if self.path == '/projector' or self.path == '/csiecamp_game2/projector':
            self.path = '/projector.html'
            return super().do_GET()

        return super().do_GET()

    def do_POST(self):
        global game_state, team_actions
        
        if self.path == '/api/state' or self.path == '/csiecamp_game2/api/state':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data)
            
            if "game_state" in data:
                game_state = data["game_state"]
            if data.get("clear_actions"):
                team_actions = {}
            if data.get("clear_ready"):
                ready_teams.clear()
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ok"}).encode('utf-8'))
            return

        if self.path == '/api/ready' or self.path == '/csiecamp_game2/api/ready':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data)
            
            team_id = str(data.get("teamId"))
            if team_id not in ready_teams:
                ready_teams.append(team_id)
                
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ok"}).encode('utf-8'))
            return

        if self.path == '/api/action' or self.path == '/csiecamp_game2/api/action':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data)
            
            team_id = str(data.get("teamId"))
            team_actions[team_id] = {
                "cardId": data.get("cardId"),
                "targetId": data.get("targetId")
            }
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ok"}).encode('utf-8'))
            return

        self.send_response(404)
        self.end_headers()

class ThreadedHTTPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    pass

def get_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('10.255.255.255', 1))
        ip = s.getsockname()[0]
    except Exception:
        ip = '127.0.0.1'
    finally:
        s.close()
    return ip

local_ip = get_ip()

with ThreadedHTTPServer(("0.0.0.0", PORT), GameRequestHandler) as httpd:
    print(f"==========================================")
    print(f"🌴 伺服器已啟動於 Port {PORT} 🌴")
    print(f"==========================================")
    print(f"[主持人後台]: http://localhost:{PORT}/host")
    print(f"[大螢幕投影]: http://localhost:{PORT}/projector")
    print(f"[各小隊手機連線網址]:")
    print(f"👉 http://{local_ip}:{PORT}/team/0")
    print(f"👉 (將 0 替換為 0~9 各小隊編號)")
    print(f"==========================================")
    httpd.serve_forever()
