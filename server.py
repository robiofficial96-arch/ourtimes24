import http.server
import socketserver
import os
import sys

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class CustomHTTPHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

if __name__ == '__main__':
    if sys.platform == "win32":
        try:
            sys.stdout.reconfigure(encoding='utf-8')
        except Exception:
            pass
    os.chdir(DIRECTORY)
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", PORT), CustomHTTPHandler) as httpd:
            print("==================================================")
            print("[+] OURTIMES24 CUSTOM PORTAL SERVER RUNNING")
            print(f"[*] Live URL: http://localhost:{PORT}")
            print(f"[*] Photo Card Studio: http://localhost:{PORT}/photocard.html")
            print(f"[*] Admin Newsroom: http://localhost:{PORT}/admin.html")
            print("==================================================")
            sys.stdout.flush()
            httpd.serve_forever()
    except Exception as e:
        print(f"Error starting server: {e}")
