from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import yt_dlp
import os
from pathlib import Path
import re
from urllib.parse import urlparse, parse_qs

app = Flask(__name__)
CORS(app)  # Enable CORS for Next.js frontend

# Create downloads directory
DOWNLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'downloads')
os.makedirs(DOWNLOAD_FOLDER, exist_ok=True)


def sanitize_filename(filename):
    """Remove invalid characters from filename"""
    return re.sub(r'[<>:"/\\|?*]', '', filename)


def clean_youtube_url(url):
    """Extract clean YouTube URL with just the video ID"""
    try:
        # Parse the URL
        parsed = urlparse(url)
        
        # Handle youtu.be short URLs
        if 'youtu.be' in parsed.netloc:
            video_id = parsed.path.split('/')[1].split('?')[0]
            return f'https://www.youtube.com/watch?v={video_id}'
        
        # Handle youtube.com URLs
        if 'youtube.com' in parsed.netloc:
            # Extract video ID from query parameters
            query_params = parse_qs(parsed.query)
            if 'v' in query_params:
                video_id = query_params['v'][0]
                # Check if it's a playlist and user wants just the video
                if 'list' in query_params and 'noplaylist' not in query_params:
                    # Keep the list parameter for playlist support
                    return url
                return f'https://www.youtube.com/watch?v={video_id}'
        
        # Return original URL if can't parse
        return url
    except Exception:
        return url


@app.route('/api/video-info', methods=['POST'])
def get_video_info():
    """Get video information without downloading"""
    try:
        data = request.json
        url = data.get('url', '').strip()
        
        if not url:
            return jsonify({'error': 'URL is required'}), 400
        
        # Clean the URL
        url = clean_youtube_url(url)
        # Validate YouTube URL
        if not ('youtube.com' in url or 'youtu.be' in url):
            return jsonify({'error': 'Please provide a valid YouTube URL'}), 400
        
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            
            return jsonify({
                'title': info.get('title'),
                'duration': info.get('duration'),
                'thumbnail': info.get('thumbnail'),
                'uploader': info.get('uploader'),
                'view_count': info.get('view_count'),
                'formats': [
                    {
                        'format_id': f.get('format_id'),
                        'ext': f.get('ext'),
                        'resolution': f.get('resolution'),
                        'filesize': f.get('filesize'),
                        'format_note': f.get('format_note')
                    }
                    for f in info.get('formats', [])
                    if f.get('ext') in ['mp4', 'webm', 'mp3', 'm4a']
                ]
            })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/download-video', methods=['POST'])
def download_video():
    """Download video in best quality"""
    try:
        data = request.json
        url = data.get('url', '').strip()
        
        if not url:
            return jsonify({'error': 'URL is required'}), 400
        
        # Validate YouTube URL
        if not ('youtube.com' in url or 'youtu.be' in url):
            return jsonify({'error': 'Please provide a valid YouTube URL'}), 400
        
        # Clean the URL
        url = clean_youtube_url(url)
        
        ydl_opts = {
            'format': 'bv*+ba/b',  # More flexible format selection
            'outtmpl': os.path.join(DOWNLOAD_FOLDER, '%(title)s.%(ext)s'),
            'noplaylist': True,  # Don't download playlists
            'quiet': False,  # Show output for debugging
            'no_warnings': False,
            'ignoreerrors': False,
            'merge_output_format': 'mp4',  # Merge to MP4 if needed
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            filename = ydl.prepare_filename(info)
            
            return jsonify({
                'success': True,
                'message': 'Video downloaded successfully',
                'filename': os.path.basename(filename),
                'path': filename
            })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/download-audio', methods=['POST'])
def download_audio():
    """Download audio only"""
    try:
        data = request.json
        url = data.get('url', '').strip()
        
        if not url:
            return jsonify({'error': 'URL is required'}), 400
        
        # Validate YouTube URL
        if not ('youtube.com' in url or 'youtu.be' in url):
            return jsonify({'error': 'Please provide a valid YouTube URL'}), 400
        
        # Clean the URL
        url = clean_youtube_url(url)
        
        # Get FFmpeg path
        import shutil
        ffmpeg_path = shutil.which('ffmpeg') or 'ffmpeg'
        
        ydl_opts = {
            'format': 'ba/b',  # Best audio or best overall
            'outtmpl': os.path.join(DOWNLOAD_FOLDER, '%(title)s.%(ext)s'),
            'noplaylist': True,
            'quiet': False,
            'no_warnings': False,
            'ignoreerrors': False,
            'extract_audio': True,
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
            'prefer_ffmpeg': True,
            'ffmpeg_location': ffmpeg_path,  # Use discovered path
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            title = sanitize_filename(info.get('title', 'audio'))
            filename = f"{title}.mp3"
            filepath = os.path.join(DOWNLOAD_FOLDER, filename)
            
            return jsonify({
                'success': True,
                'message': 'Audio downloaded successfully',
                'filename': filename,
                'path': filepath
            })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/download-playlist-video', methods=['POST'])
def download_playlist_video():
    """Download playlist videos"""
    try:
        data = request.json
        url = data.get('url', '').strip()
        
        if not url:
            return jsonify({'error': 'URL is required'}), 400
        
        # Validate YouTube URL
        if not ('youtube.com' in url or 'youtu.be' in url):
            return jsonify({'error': 'Please provide a valid YouTube URL'}), 400
        
        # For playlists, we keep the original URL with list parameter
        
        ydl_opts = {
            'format': 'best[ext=mp4]/best',
            'outtmpl': os.path.join(DOWNLOAD_FOLDER, '%(playlist_title)s/%(title)s.%(ext)s'),
            'yes_playlist': True,  # Download playlists
            'quiet': True,
            'no_warnings': True,
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            playlist_title = info.get('playlist_title', info.get('title', 'playlist'))
            
            return jsonify({
                'success': True,
                'message': f'Playlist "{playlist_title}" downloaded successfully',
                'path': os.path.join(DOWNLOAD_FOLDER, playlist_title)
            })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/download-playlist-audio', methods=['POST'])
def download_playlist_audio():
    """Download playlist audio"""
    try:
        data = request.json
        url = data.get('url', '').strip()
        
        if not url:
            return jsonify({'error': 'URL is required'}), 400
        
        # Validate YouTube URL
        if not ('youtube.com' in url or 'youtu.be' in url):
            return jsonify({'error': 'Please provide a valid YouTube URL'}), 400
        
        # For playlists, we keep the original URL with list parameter
        
        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': os.path.join(DOWNLOAD_FOLDER, '%(playlist_title)s/%(title)s.%(ext)s'),
            'yes_playlist': True,  # Download playlists
            'quiet': True,
            'no_warnings': True,
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            playlist_title = info.get('playlist_title', info.get('title', 'playlist'))
            
            return jsonify({
                'success': True,
                'message': f'Playlist "{playlist_title}" audio downloaded successfully',
                'path': os.path.join(DOWNLOAD_FOLDER, playlist_title)
            })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/downloads', methods=['GET'])
def list_downloads():
    """List all downloaded files"""
    try:
        files = []
        for filename in os.listdir(DOWNLOAD_FOLDER):
            filepath = os.path.join(DOWNLOAD_FOLDER, filename)
            if os.path.isfile(filepath):
                files.append({
                    'filename': filename,
                    'size': os.path.getsize(filepath),
                    'created': os.path.getctime(filepath)
                })
        return jsonify({'files': files})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/download-file/<filename>', methods=['GET'])
def download_file(filename):
    """Serve a downloaded file"""
    try:
        filepath = os.path.join(DOWNLOAD_FOLDER, filename)
        if os.path.exists(filepath):
            return send_file(filepath, as_attachment=True)
        else:
            return jsonify({'error': 'File not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'Backend is running'})


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
