import http.server
import socketserver
import json
import os
import socket
from datetime import datetime

PORT = int(os.environ.get("PORT", 8080))
HOSTNAME = socket.gethostname()

class EnterpriseAppHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        client_ip = self.client_address[0]
        timestamp = datetime.utcnow().isoformat() + "Z"
        
        if self.path == "/health" or self.path == "/":
            response = {
                "status": "UP",
                "service": "On-Prem Application Server",
                "hostname": HOSTNAME,
                "client_ip": client_ip,
                "timestamp": timestamp,
                "zone": "onprem-servers",
                "db_connected": True
            }
            self._send_json(200, response)
        elif self.path == "/api/data":
            response = {
                "records": [
                    {"id": 101, "item": "Core Router Config", "status": "Synced"},
                    {"id": 102, "item": "Firewall Policy #4", "status": "Enforced"},
                    {"id": 103, "item": "WireGuard Key Exchange", "status": "Active"}
                ],
                "source": "onprem-db-01 (10.10.30.20)",
                "timestamp": timestamp
            }
            self._send_json(200, response)
        else:
            self._send_json(404, {"error": "Endpoint not found", "path": self.path})

    def _send_json(self, code, data):
        body = json.dumps(data, indent=2).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        print(f"[{datetime.utcnow().isoformat()}] {self.client_address[0]} - {format % args}")

if __name__ == "__main__":
    print(f"[NetFusion App Server] Starting on port {PORT}...")
    with socketserver.TCPServer(("", PORT), EnterpriseAppHandler) as httpd:
        httpd.serve_forever()
