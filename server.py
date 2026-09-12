import http.server
import socketserver
import os
import sys
import json
import urllib.parse
import re

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class CustomHTTPHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path.endswith('api_save_news.php'):
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            try:
                item = json.loads(body)
                json_path = os.path.join(DIRECTORY, 'news_data.json')
                all_news = []
                if os.path.exists(json_path):
                    with open(json_path, 'r', encoding='utf-8') as f:
                        all_news = json.load(f)
                
                idx = next((i for i, n in enumerate(all_news) if str(n.get('id')) == str(item.get('id'))), -1)
                if idx >= 0:
                    all_news[idx].update(item)
                else:
                    all_news.insert(0, item)
                
                with open(json_path, 'w', encoding='utf-8') as f:
                    json.dump(all_news, f, ensure_ascii=False, indent=2)
                
                js_path = os.path.join(DIRECTORY, 'news_data.js')
                with open(js_path, 'w', encoding='utf-8') as f:
                    f.write("window.RAW_NEWS_DATA = " + json.dumps(all_news, ensure_ascii=False, indent=2) + ";\n")
                
                res = json.dumps({'status': 'success', 'count': len(all_news)}).encode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Content-Length', str(len(res)))
                self.end_headers()
                self.wfile.write(res)
                return
            except Exception as e:
                err = json.dumps({'status': 'error', 'message': str(e)}).encode('utf-8')
                self.send_response(500)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Content-Length', str(len(err)))
                self.end_headers()
                self.wfile.write(err)
                return
        
        super().do_POST()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path in ('/article.html', '/share.php', '/article.php'):
            qs = urllib.parse.parse_qs(parsed.query)
            art_id = qs.get('id', [''])[0]
            
            # Load article data
            art = None
            json_path = os.path.join(DIRECTORY, 'news_data.json')
            if os.path.exists(json_path):
                try:
                    with open(json_path, 'r', encoding='utf-8') as f:
                        news_list = json.load(f)
                        if art_id:
                            art = next((n for n in news_list if str(n.get('id')) == art_id), None)
                        if not art and news_list:
                            art = news_list[0]
                except Exception:
                    pass
            
            html_path = os.path.join(DIRECTORY, 'article.html')
            if os.path.exists(html_path):
                with open(html_path, 'r', encoding='utf-8') as f:
                    html = f.read()
                
                title = art.get('title', 'সংবাদ বিস্তারিত') if art else 'সংবাদ বিস্তারিত'
                raw_desc = art.get('excerpt', '') if art else ''
                clean_desc = re.sub(r'<[^>]+>', '', raw_desc)[:160].strip()
                if not clean_desc: clean_desc = title
                
                img = art.get('image', 'https://ourtimes24.com/logo.png') if art else 'https://ourtimes24.com/logo.png'
                if not img.startswith('http'):
                    img = 'https://ourtimes24.com/' + img.lstrip('/')
                
                page_url = f"https://ourtimes24.com/article.html?id={urllib.parse.quote(art_id)}" if art_id else "https://ourtimes24.com/article.html"
                
                meta_block = f"""
    <!-- DYNAMIC SSR SOCIAL SHARING METATAGS -->
    <title>{title} - আওয়ার টাইমস২৪</title>
    <meta name="description" content="{clean_desc}">
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="আওয়ার টাইমস২৪ | Ourtimes24">
    <meta property="og:title" content="{title}">
    <meta property="og:description" content="{clean_desc}">
    <meta property="og:image" content="{img}">
    <meta property="og:image:secure_url" content="{img}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:url" content="{page_url}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{title}">
    <meta name="twitter:description" content="{clean_desc}">
    <meta name="twitter:image" content="{img}">
"""
                html = re.sub(r'<title[^>]*>.*?</title>', '', html, flags=re.IGNORECASE)
                html = re.sub(r'<meta\s+property=["\']og:[^"\']*["\'][^>]*>', '', html, flags=re.IGNORECASE)
                html = re.sub(r'<meta\s+name=["\']twitter:[^"\']*["\'][^>]*>', '', html, flags=re.IGNORECASE)
                html = re.sub(r'<meta\s+name=["\']description["\'][^>]*>', '', html, flags=re.IGNORECASE)
                html = re.sub(r'<head>', '<head>\n' + meta_block, html, count=1, flags=re.IGNORECASE)
                
                content = html.encode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'text/html; charset=utf-8')
                self.send_header('Content-Length', str(len(content)))
                self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
                self.end_headers()
                self.wfile.write(content)
                return

        super().do_GET()

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
