# YouTube Video & Audio Downloader - Setup Guide

Complete setup and testing guide for the YouTube downloader application.

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **FFmpeg** (for audio conversion)
- **Git**

## 🚀 Quick Start

### 1. Install FFmpeg

**Windows (using Chocolatey):**
```powershell
choco install ffmpeg
```

**Windows (Manual):**
1. Download from https://ffmpeg.org/download.html
2. Extract and add to PATH

**Verify installation:**
```powershell
ffmpeg -version
```

### 2. Clone Repository

```bash
git clone <repository-url>
cd yt-video-audio-scrapping
```

### 3. Install Frontend Dependencies

```bash
npm install
```

### 4. Setup Backend

```bash
npm run backend:install
```

Or manually:
```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## 🏃 Running the Application

### Option 1: Run Both Together (Recommended)

Using PowerShell script:
```powershell
.\start-dev.ps1
```

Using npm:
```bash
npm run dev:all
```

### Option 2: Run Separately

**Terminal 1 - Backend:**
```bash
npm run backend:start
```
Or:
```bash
cd backend
.\venv\Scripts\Activate.ps1
python app.py
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## 🌐 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 🧪 Testing

### Test Backend API

1. **Check Health:**
```powershell
curl http://localhost:5000/health
```

2. **Get Video Info:**
```powershell
$body = @{
    url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/video-info" -Method POST -Body $body -ContentType "application/json"
```

3. **Download Video:**
```powershell
$body = @{
    url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/download-video" -Method POST -Body $body -ContentType "application/json"
```

4. **Download Audio:**
```powershell
$body = @{
    url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/download-audio" -Method POST -Body $body -ContentType "application/json"
```

### Test Frontend

1. Open http://localhost:3000
2. Paste a YouTube URL
3. Click "Get Info" to see video details
4. Click "Download Video" or "Download Audio"
5. Check `backend/downloads/` folder for files

## 📁 Project Structure

```
yt-video-audio-scrapping/
├── app/
│   ├── page.tsx           # Main UI component
│   ├── layout.tsx         # Layout wrapper
│   └── globals.css        # Global styles
├── backend/
│   ├── app.py            # Flask API server
│   ├── requirements.txt  # Python dependencies
│   ├── downloads/        # Downloaded files
│   └── venv/            # Python virtual environment
├── public/              # Static assets
├── package.json         # Node dependencies
├── start-dev.ps1       # PowerShell startup script
└── SETUP.md            # This file
```

## 🔧 Available Scripts

### Frontend
- `npm run dev` - Start Next.js development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Backend
- `npm run backend:install` - Setup Python environment
- `npm run backend:start` - Start Flask server
- `npm run dev:backend` - Start Flask in dev mode
- `npm run dev:all` - Run both servers concurrently

## 📦 API Endpoints

### GET /health
Health check endpoint

### POST /api/video-info
Get video metadata without downloading
```json
{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

### POST /api/download-video
Download video in MP4 format
```json
{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

### POST /api/download-audio
Download audio in MP3 format
```json
{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

### GET /api/downloads
List all downloaded files

### GET /api/download-file/:filename
Download a specific file

## 🐛 Troubleshooting

### Backend won't start
- Ensure Python virtual environment is activated
- Check if port 5000 is available
- Verify all dependencies are installed: `pip list`

### Frontend can't connect to backend
- Verify backend is running: `curl http://localhost:5000/health`
- Check CORS settings in backend/app.py
- Ensure no firewall is blocking port 5000

### FFmpeg not found
- Restart terminal after installing FFmpeg
- Check PATH: `$env:PATH`
- Verify: `ffmpeg -version`

### Downloads fail
- Check internet connection
- Verify YouTube URL is valid
- Check backend logs for errors
- Ensure write permissions for downloads folder

## 🎯 Features

✅ Download YouTube videos (MP4)
✅ Download audio only (MP3)
✅ View video information before downloading
✅ Clean and modern UI
✅ Real-time feedback
✅ Error handling
✅ Files saved locally in downloads folder

## 🔒 Notes

- Downloaded files are saved in `backend/downloads/`
- The downloads folder is gitignored
- Backend runs on port 5000
- Frontend runs on port 3000
- CORS is enabled for local development

## 📝 License

This project is for educational purposes.
