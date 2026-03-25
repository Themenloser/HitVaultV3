import os
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
# Wichtig: yt-dlp muss in deiner requirements.txt stehen!
import yt_dlp

app = Flask(__name__)
CORS(app)

def download_video(url, mode='audio', format_id=None):
    cookie_path = 'cookies.txt'
    # Render braucht /tmp/ zum Schreiben von Dateien
    output_template = '/tmp/%(title)s.%(ext)s'
    
    # BASIS-OPTIONEN
    ydl_opts = {
        'outtmpl': output_template,
        'noplaylist': True,
        'quiet': False,
        'no_warnings': False,
    }

    # COOKIES (Falls vorhanden)
    if os.path.exists(cookie_path):
        ydl_opts['cookiefile'] = cookie_path

    # FORMAT-LOGIK
    if format_id:
        # Wenn du eine spezifische ID aus /formats schickst
        ydl_opts['format'] = f"{format_id}+bestaudio/best" if mode == 'video' else format_id
    elif mode == 'audio':
        # Bester Audio-Download mit MP3 Konvertierung
        ydl_opts['format'] = 'bestaudio/best'
        ydl_opts['postprocessors'] = [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }]
    else:
        # Sicherer Video-Download: MP4 bevorzugt, sonst bestes verfügbares
        ydl_opts['format'] = 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best'

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        filename = ydl.prepare_filename(info)
        
        # Falls Audio gewählt wurde, hat FFmpeg die Endung auf .mp3 geändert
        if mode == 'audio' and not filename.endswith('.mp3'):
            filename = filename.rsplit('.', 1)[0] + '.mp3'
        
        return filename

@app.route('/')
def home():
    return "Backend läuft! Befehle: /formats, /audio, /video"

@app.route('/formats', methods=['GET'])
def list_formats():
    url = request.args.get('url') or request.args.get('id')
    if not url: return jsonify({"error": "Keine ID"}), 400
    if not url.startswith('http'): url = f'https://www.youtube.com/watch?v={url}'
    
    try:
        ydl_opts = {'cookiefile': 'cookies.txt'} if os.path.exists('cookies.txt') else {}
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            formats = []
            for f in info.get('formats', []):
                formats.append({
                    'id': f.get('format_id'),
                    'ext': f.get('ext'),
                    'res': f.get('resolution'),
                    'note': f.get('format_note'),
                    'v': f.get('vcodec') != 'none',
                    'a': f.get('acodec') != 'none'
                })
            return jsonify({"title": info.get('title'), "formats": formats})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/audio', methods=['GET', 'POST'])
@app.route('/video', methods=['GET', 'POST'])
def handle_download():
    # Erkennt automatisch ob /audio oder /video gerufen wurde
    mode = 'audio' if 'audio' in request.path else 'video'
    
    # Daten aus GET oder POST holen
    url = request.args.get('url') or request.args.get('id')
    f_id = request.args.get('format_id')
    
    if not url and request.is_json:
        url = request.json.get('url') or request.json.get('id')
        f_id = request.json.get('format_id')

    if not url: return jsonify({"error": "URL fehlt"}), 400
    if not url.startswith('http'): url = f'https://www.youtube.com/watch?v={url}'

    try:
        file_path = download_video(url, mode=mode, format_id=f_id)
        return send_file(file_path, as_attachment=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Render nutzt Port 10000 standardmäßig
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port)
